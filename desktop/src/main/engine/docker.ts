import { execFile, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { BaseEngine } from './base';
import {
  EngineStatusInfo,
  ServiceInfo,
  EngineStatus,
  EngineType,
  DownloadProgress,
  GatewayEndpoint
} from './types';
import { setupDockerEnvironment } from './docker-setup';

const execFileAsync = promisify(execFile);

const KNOWN_SERVICES: Record<string, { displayName: string; role: string; defaultPorts: string[]; isRequired?: boolean }> = {
  nginx: {
    displayName: 'Web Gateway (Nginx)',
    role: 'Reverse Proxy & SSL Gateway',
    defaultPorts: ['80', '443'],
    isRequired: true
  },
  wordpress: {
    displayName: 'Core Engine (WordPress & SQLite)',
    role: 'PHP 8.3 FPM & Unified SQLite Store',
    defaultPorts: ['9000'],
    isRequired: true
  },
  avahi: {
    displayName: 'Local Node Discovery',
    role: 'ZeroConf Network Mesh (youmeos.local)',
    defaultPorts: ['5353'],
    isRequired: false
  }
};

const DOCKER_GATEWAYS: GatewayEndpoint[] = [
  { label: 'my.youmeos.com', url: 'https://my.youmeos.com', isPrimary: true },
  { label: 'youmeos.localhost', url: 'https://youmeos.localhost' },
  { label: 'youmeos.local', url: 'http://youmeos.local' },
  { label: 'localhost', url: 'https://localhost' }
];

export class DockerEngine extends BaseEngine {
  readonly type: EngineType = 'docker';
  private logsProcess: ChildProcess | null = null;
  private composePath: string;
  private projectDir: string;
  private isSettingUp = false;
  private isStarting = false;

  constructor() {
    super();
    const isProduction = process.env.NODE_ENV === 'production' || __dirname.includes('app.asar');
    this.projectDir = isProduction ? process.resourcesPath : path.join(__dirname, '..', '..', '..', '..');
    this.composePath = path.join(this.projectDir, 'docker-compose.yml');
  }

  private async runCompose(args: string[]): Promise<{ stdout: string; stderr: string }> {
    const baseArgs = ['compose', '-f', this.composePath, '--project-directory', this.projectDir, ...args];
    return execFileAsync('docker', baseArgs);
  }

  private startLogsFollower(): void {
    this.stopLogsFollower();

    const baseArgs = ['compose', '-f', this.composePath, '--project-directory', this.projectDir, 'logs', '-f', '--tail', '50'];
    this.logsProcess = spawn('docker', baseArgs);

    this.logsProcess.stdout?.on('data', (data) => {
      const lines = data.toString().trim().split('\n').filter(Boolean);
      for (const line of lines) {
        this.pushLog('docker', line);
      }
    });

    this.logsProcess.stderr?.on('data', (data) => {
      const lines = data.toString().trim().split('\n').filter(Boolean);
      for (const line of lines) {
        this.pushLog('docker', line, 'warn');
      }
    });

    this.logsProcess.on('exit', () => {
      this.logsProcess = null;
    });
  }

  private stopLogsFollower(): void {
    if (this.logsProcess) {
      try { this.logsProcess.kill('SIGTERM'); } catch {}
      this.logsProcess = null;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await execFileAsync('docker', ['--version']);
      await this.runCompose(['version']);
      return true;
    } catch {
      return false;
    }
  }

  async start(): Promise<void> {
    if (this.isSettingUp || this.isStarting) return;
    this.isSettingUp = true;
    this.isStarting = true;
    this.notifyStatus();

    try {
      const handleLog = (msg: string) => this.pushLog('setup', msg);
      const handleProgress = (prog: DownloadProgress | null) => {
        this.currentDownloadProgress = prog;
        this.progressCallback?.(prog);
      };

      await setupDockerEnvironment(this.projectDir, handleLog, handleProgress);
    } catch (e: any) {
      this.isSettingUp = false;
      this.isStarting = false;
      this.currentDownloadProgress = null;
      this.progressCallback?.(null);
      this.pushLog('setup', `Error: ${e.message}`, 'error');
      this.notifyStatus();
      throw e;
    }

    this.isSettingUp = false;
    this.currentDownloadProgress = null;
    this.progressCallback?.(null);

    this.pushLog('docker', 'Starting Docker cluster containers with unified SQLite...');
    await this.runCompose(['up', '-d']);
    this.isStarting = false;
    this.startLogsFollower();
    this.notifyStatus();
  }

  async stop(): Promise<void> {
    this.stopLogsFollower();
    this.pushLog('docker', 'Stopping Docker cluster containers...');
    await this.runCompose(['down']);
    this.notifyStatus();
  }

  async restart(): Promise<void> {
    this.stopLogsFollower();
    this.pushLog('docker', 'Restarting Docker cluster...');
    await this.runCompose(['restart']);
    this.startLogsFollower();
    this.notifyStatus();
  }

  private getDefaultServices(status: ServiceInfo['status'] = 'stopped'): ServiceInfo[] {
    return Object.entries(KNOWN_SERVICES).map(([name, meta]) => ({
      name,
      displayName: meta.displayName,
      role: meta.role,
      status,
      ports: meta.defaultPorts
    }));
  }

  async status(): Promise<EngineStatusInfo> {
    const isDocker = await this.isAvailable();
    if (!isDocker) {
      return {
        status: 'error',
        engineType: 'docker',
        message: 'Docker daemon is not running or not installed.',
        services: this.getDefaultServices('error'),
        url: 'https://my.youmeos.com',
        gateways: DOCKER_GATEWAYS,
        availableEngines: { docker: false, embedded: true }
      };
    }

    if (this.isStarting || this.isSettingUp) {
      return {
        status: 'starting',
        engineType: 'docker',
        message: 'Docker cluster is starting...',
        downloadProgress: this.currentDownloadProgress,
        services: this.getDefaultServices('starting'),
        url: 'https://my.youmeos.com',
        gateways: DOCKER_GATEWAYS,
        availableEngines: { docker: true, embedded: true }
      };
    }

    try {
      const { stdout } = await this.runCompose(['ps', '--format', 'json']);
      if (!stdout.trim()) {
        return {
          status: 'stopped',
          engineType: 'docker',
          services: this.getDefaultServices('stopped'),
          url: 'https://my.youmeos.com',
          gateways: DOCKER_GATEWAYS,
          availableEngines: { docker: true, embedded: true }
        };
      }

      const lines = stdout.trim().split('\n').filter(Boolean);
      const parsedServices: ServiceInfo[] = [];

      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          const rawService: string = (item.Service || '').toLowerCase();
          const rawName: string = (item.Name || '').toLowerCase();
          let serviceKey = rawService;

          if (rawService.includes('nginx') || rawService.includes('server') || rawName.includes('nginx') || rawName.includes('gateway')) {
            serviceKey = 'nginx';
          } else if (rawService.includes('wordpress') || rawService.includes('wp-engine') || rawName.includes('wordpress') || rawName.includes('engine')) {
            serviceKey = 'wordpress';
          } else if (rawService.includes('avahi') || rawName.includes('avahi') || rawName.includes('mdns') || rawName.includes('discovery')) {
            serviceKey = 'avahi';
          } else if (!serviceKey || !KNOWN_SERVICES[serviceKey]) {
            serviceKey = rawName.replace(/^youmeos-microverse[-_]/, '').replace(/^youmeos[-_]/, '').replace(/[-_]\d+$/, '');
          }

          const stateStr: string = (item.State || item.Status || '').toLowerCase();
          let serviceStatus: 'running' | 'stopped' | 'starting' | 'error' = 'stopped';
          if (stateStr.includes('running') || stateStr.includes('up')) {
            serviceStatus = 'running';
          } else if (stateStr.includes('start') || stateStr.includes('restart') || stateStr.includes('created')) {
            serviceStatus = 'starting';
          } else if (stateStr.includes('exit') || stateStr.includes('dead') || stateStr.includes('error')) {
            serviceStatus = 'error';
          }

          const meta = KNOWN_SERVICES[serviceKey] || {
            displayName: serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1),
            role: 'Microverse Service',
            defaultPorts: []
          };

          let ports: string[] = [];
          if (Array.isArray(item.Publishers)) {
            ports = item.Publishers
              .filter((p: any) => p.PublishedPort > 0)
              .map((p: any) => `${p.PublishedPort}->${p.TargetPort}`);
          }
          if (ports.length === 0 && meta.defaultPorts.length > 0) {
            ports = meta.defaultPorts;
          }

          parsedServices.push({
            name: serviceKey,
            displayName: meta.displayName,
            role: meta.role,
            status: serviceStatus,
            ports,
            health: item.Health || undefined,
            uptime: item.Status || undefined
          });
        } catch {
          // ignore malformed lines
        }
      }

      const resultServices: ServiceInfo[] = Object.entries(KNOWN_SERVICES).map(([name, meta]) => {
        const found = parsedServices.find(s => s.name === name);
        return found || {
          name,
          displayName: meta.displayName,
          role: meta.role,
          status: 'stopped',
          ports: meta.defaultPorts
        };
      });

      const isGatewayRunning = resultServices.find(s => s.name === 'nginx')?.status === 'running';
      const avahiService = resultServices.find(s => s.name === 'avahi');
      if (avahiService && isGatewayRunning && avahiService.status !== 'running') {
        avahiService.status = 'running';
        avahiService.role = 'Encrypted Local Discovery (youmeos.local)';
      }

      const requiredServices = Object.entries(KNOWN_SERVICES).filter(([_, meta]) => meta.isRequired !== false);
      const requiredRunningCount = resultServices.filter(s => {
        const meta = KNOWN_SERVICES[s.name];
        const isRequired = meta ? meta.isRequired !== false : true;
        return isRequired && s.status === 'running';
      }).length;

      const totalRunningCount = resultServices.filter(s => s.status === 'running').length;
      let overallStatus: EngineStatus = 'stopped';
      if (requiredRunningCount === requiredServices.length && requiredServices.length > 0) {
        overallStatus = 'running';
      } else if (totalRunningCount > 0) {
        overallStatus = 'starting';
      }

      return {
        status: overallStatus,
        engineType: 'docker',
        downloadProgress: this.currentDownloadProgress,
        services: resultServices,
        url: 'https://my.youmeos.com',
        gateways: DOCKER_GATEWAYS,
        availableEngines: { docker: true, embedded: true }
      };
    } catch (e: any) {
      return {
        status: 'error',
        engineType: 'docker',
        message: e.message || 'Failed to inspect Docker stack',
        downloadProgress: this.currentDownloadProgress,
        services: this.getDefaultServices('error'),
        url: 'https://my.youmeos.com',
        gateways: DOCKER_GATEWAYS,
        availableEngines: { docker: isDocker, embedded: true }
      };
    }
  }

  async logs(service?: string, tail: number = 100): Promise<string> {
    try {
      const args = ['logs', '--tail', tail.toString()];
      if (service && service !== 'all') {
        if (service === 'nginx' || service === 'server' || service === 'gateway') {
          args.push('nginx');
        } else if (service === 'wordpress' || service === 'wp-engine' || service === 'core') {
          args.push('wordpress');
        } else if (service === 'avahi' || service === 'discovery' || service === 'network') {
          args.push('avahi');
        } else if (KNOWN_SERVICES[service]) {
          args.push(service);
        }
      }
      const { stdout, stderr } = await this.runCompose(args);
      return stdout || stderr;
    } catch (e: any) {
      return `Error fetching logs: ${e.message}`;
    }
  }
}
