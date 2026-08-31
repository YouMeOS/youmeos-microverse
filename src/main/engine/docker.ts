import { app } from 'electron';
import { execFile, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { BaseEngine, getDevProjectDir } from './base';
import {
  EngineStatusInfo,
  ServiceInfo,
  EngineStatus,
  EngineType,
  DownloadProgress,
  GatewayEndpoint,
  EngineErrorInfo
} from './types';
import { setupDockerEnvironment } from './docker-setup';
import { inspectStackLayers } from './stack-inspector';
import { classifyEngineError } from './error-classifier';

const execFileAsync = promisify(execFile);

const KNOWN_SERVICES: Record<
  string,
  {
    displayName: string;
    role: string;
    defaultPorts: string[];
    isRequired?: boolean;
    category?: string;
    specs?: string[];
  }
> = {
  youmeos: {
    displayName: 'YouMeOS Unified Engine',
    role: 'FrankenPHP Gateway & Core',
    defaultPorts: ['80', '443'],
    isRequired: true,
    category: 'Application Kernel',
    specs: ['HTTP/3', 'PHP 8.3', 'SQLite VFS']
  }
};

export class DockerEngine extends BaseEngine {
  readonly type: EngineType = 'docker';
  private logsProcess: ChildProcess | null = null;
  private composePath: string;
  private projectDir: string;
  private resourcesDir: string;
  private isSettingUp = false;
  private isStarting = false;
  private activePort = 80;
  private lastErrorMessage?: string;
  private lastErrorInfo?: EngineErrorInfo;

  constructor() {
    super();
    const isProduction = app?.isPackaged ?? (process.env.NODE_ENV === 'production' || __dirname.includes('app.asar'));
    this.projectDir = isProduction ? app.getPath('userData') : getDevProjectDir(__dirname);
    this.resourcesDir = isProduction ? process.resourcesPath : getDevProjectDir(__dirname);
    this.composePath = path.join(this.projectDir, 'docker-compose.yml');
  }

  async setPort(port: number): Promise<void> {
    const cleanPort = Math.max(1, Math.min(65535, port));
    if (this.activePort === cleanPort) return;
    this.activePort = cleanPort;
    this.pushLog('gateway', `Docker port updated to ${this.activePort}`);
    const currentStatus = await this.status();
    if (currentStatus.status === 'running' || currentStatus.status === 'starting') {
      await this.restart();
    }
  }

  getPort(): number {
    return this.activePort;
  }

  private getComposeEnv(): NodeJS.ProcessEnv {
    const httpsPort = this.activePort === 80 ? '443' : (this.activePort + 363).toString();
    return {
      ...process.env,
      PORT: this.activePort.toString(),
      HTTPS_PORT: httpsPort
    };
  }

  private async runCompose(args: string[]): Promise<{ stdout: string; stderr: string }> {
    const baseArgs = ['compose', '-f', this.composePath, '--project-directory', this.projectDir, ...args];
    return execFileAsync('docker', baseArgs, { env: this.getComposeEnv() });
  }

  private parseDockerLogLine(raw: string): { service: string; text: string; level: 'info' | 'warn' | 'error' | 'debug' } {
    let service = 'gateway';
    let text = raw;

    const prefixMatch = raw.match(/^([a-zA-Z0-9_\-]+?)(?:[-_]\d+)?\s*\|\s*(.*)$/);
    if (prefixMatch) {
      const rawService = prefixMatch[1].toLowerCase();
      text = prefixMatch[2];
      if (rawService.includes('nginx')) service = 'gateway';
      else if (rawService.includes('wordpress')) service = 'core';
      else if (rawService.includes('avahi')) service = 'network';
      else if (rawService.includes('mariadb')) service = 'core';
      else service = rawService;
    }

    const lower = text.toLowerCase();
    let level: 'info' | 'warn' | 'error' | 'debug' = 'info';

    const isExplicitError = lower.includes('error') || lower.includes('fatal') || lower.includes('emerg') || lower.includes('[error]');
    const isExplicitWarn = lower.includes('warn') || lower.includes('warning') || lower.includes('[warning]') || lower.includes('[warn]');
    const isNoticeOrInfo =
      lower.includes('[notice]') ||
      lower.includes('notice:') ||
      lower.includes('creating') ||
      lower.includes('created') ||
      lower.includes('starting') ||
      lower.includes('started') ||
      lower.includes('stopping') ||
      lower.includes('stopped') ||
      lower.includes('removing') ||
      lower.includes('removed') ||
      lower.includes('ready to handle connections') ||
      lower.includes('start worker process') ||
      lower.includes('event method') ||
      lower.includes('getrlimit');

    if (isNoticeOrInfo) {
      level = 'info';
    } else if (isExplicitError && !lower.includes('0 [warning]')) {
      level = 'error';
    } else if (isExplicitWarn) {
      level = 'warn';
    } else if (lower.includes('debug')) {
      level = 'debug';
    }

    return { service, text, level };
  }

  private startLogsFollower(): void {
    this.stopLogsFollower();

    const baseArgs = ['compose', '-f', this.composePath, '--project-directory', this.projectDir, 'logs', '-f', '--tail', '50'];
    this.logsProcess = spawn('docker', baseArgs, { env: this.getComposeEnv() });

    this.logsProcess.stdout?.on('data', (data) => {
      const lines = data.toString().trim().split('\n').filter(Boolean);
      for (const line of lines) {
        const parsed = this.parseDockerLogLine(line);
        this.pushLog(parsed.service, parsed.text, parsed.level);
      }
    });

    this.logsProcess.stderr?.on('data', (data) => {
      const lines = data.toString().trim().split('\n').filter(Boolean);
      for (const line of lines) {
        const parsed = this.parseDockerLogLine(line);
        this.pushLog(parsed.service, parsed.text, parsed.level);
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

  private runComposeStream(args: string[], onLine?: (line: string, isErr: boolean) => void): Promise<number> {
    return new Promise((resolve, reject) => {
      const baseArgs = ['compose', '-f', this.composePath, '--project-directory', this.projectDir, ...args];
      const proc = spawn('docker', baseArgs, { env: this.getComposeEnv() });

      proc.stdout?.on('data', (data) => {
        const lines = data.toString().trim().split('\n').filter(Boolean);
        for (const line of lines) {
          onLine?.(line, false);
        }
      });

      proc.stderr?.on('data', (data) => {
        const lines = data.toString().trim().split('\n').filter(Boolean);
        for (const line of lines) {
          onLine?.(line, true);
        }
      });

      proc.on('error', (err) => reject(err));
      proc.on('exit', (code) => resolve(code ?? 0));
    });
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
    this.lastErrorMessage = undefined;
    this.lastErrorInfo = undefined;
    this.notifyStatus();

    try {
      const handleLog = (msg: string) => this.pushLog('setup', msg);
      const handleProgress = (prog: DownloadProgress | null) => {
        this.currentDownloadProgress = prog;
        this.progressCallback?.(prog);
      };

      await setupDockerEnvironment(this.projectDir, handleLog, handleProgress, this.resourcesDir);
    } catch (e: any) {
      this.isSettingUp = false;
      this.isStarting = false;
      this.currentDownloadProgress = null;
      this.progressCallback?.(null);
      this.lastErrorMessage = `Docker setup failed: ${e.message}`;
      this.lastErrorInfo = classifyEngineError({
        rawError: e.message,
        activePort: this.activePort,
        engineType: 'docker'
      });
      this.pushLog('setup', `Error: ${e.message}`, 'error');
      this.notifyStatus();
      throw e;
    }

    this.isSettingUp = false;
    this.currentDownloadProgress = null;
    this.progressCallback?.(null);

    this.pushLog('gateway', `Starting Docker cluster containers on port ${this.activePort}...`);
    try {
      await this.runComposeStream(['up', '-d'], (line, isErr) => {
        const parsed = this.parseDockerLogLine(line);
        this.pushLog(parsed.service, parsed.text, parsed.level);
        if (isErr && (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed') || line.toLowerCase().includes('bind:'))) {
          this.lastErrorMessage = line;
          this.lastErrorInfo = classifyEngineError({
            rawError: line,
            activePort: this.activePort,
            engineType: 'docker'
          });
        }
      });
    } catch (err: any) {
      this.isStarting = false;
      this.lastErrorMessage = err.message;
      this.lastErrorInfo = classifyEngineError({
        rawError: err.message,
        activePort: this.activePort,
        engineType: 'docker'
      });
      this.pushLog('gateway', `Docker spawn failed: ${err.message}`, 'error');
      this.notifyStatus();
      throw err;
    }

    this.isStarting = false;
    this.startLogsFollower();
    this.notifyStatus();
  }

  async stop(): Promise<void> {
    this.stopLogsFollower();
    this.pushLog('gateway', 'Stopping Docker cluster containers...');
    await this.runComposeStream(['down'], (line) => {
      const parsed = this.parseDockerLogLine(line);
      this.pushLog(parsed.service, parsed.text, parsed.level);
    });
    this.notifyStatus();
  }

  async restart(): Promise<void> {
    this.stopLogsFollower();
    this.pushLog('gateway', 'Restarting Docker cluster...');
    await this.runComposeStream(['restart'], (line) => {
      const parsed = this.parseDockerLogLine(line);
      this.pushLog(parsed.service, parsed.text, parsed.level);
    });
    this.startLogsFollower();
    this.notifyStatus();
  }

  private getDefaultServices(status: ServiceInfo['status'] = 'stopped'): ServiceInfo[] {
    const ports = this.activePort === 80 ? ['80', '443'] : [this.activePort.toString()];
    return Object.entries(KNOWN_SERVICES).map(([name, meta]) => ({
      name,
      displayName: meta.displayName,
      role: meta.role,
      status,
      ports,
      category: meta.category,
      specs: meta.specs
    }));
  }

  private resolveGateways(): { primaryUrl: string; gateways: GatewayEndpoint[] } {
    const isStandard = this.activePort === 80;
    const primaryUrl = isStandard ? 'https://my.youmeos.com' : `http://localhost:${this.activePort}`;
    const gateways: GatewayEndpoint[] = isStandard
      ? [
          { label: 'my.youmeos.com', url: primaryUrl, isPrimary: true },
          { label: 'youmeos.localhost', url: 'http://youmeos.localhost' }
        ]
      : [
          { label: `localhost:${this.activePort}`, url: primaryUrl, isPrimary: true },
          { label: `youmeos.localhost:${this.activePort}`, url: `http://youmeos.localhost:${this.activePort}` },
          { label: `127.0.0.1:${this.activePort}`, url: `http://127.0.0.1:${this.activePort}` }
        ];
    return { primaryUrl, gateways };
  }

  async status(): Promise<EngineStatusInfo> {
    const isDocker = await this.isAvailable();
    const { primaryUrl, gateways } = this.resolveGateways();

    let stackLayers = await inspectStackLayers({
      projectDir: this.projectDir,
      resourcesDir: this.resourcesDir,
      isServerRunning: false,
      port: this.activePort
    });

    if (!isDocker) {
      const errorMsg = 'Docker daemon is not running or not installed.';
      return {
        status: 'error',
        engineType: 'docker',
        activePort: this.activePort,
        message: errorMsg,
        errorInfo: classifyEngineError({
          rawError: errorMsg,
          activePort: this.activePort,
          engineType: 'docker'
        }),
        services: this.getDefaultServices('error'),
        stackLayers,
        url: primaryUrl,
        gateways,
        availableEngines: { docker: false, embedded: true }
      };
    }

    if (this.isStarting || this.isSettingUp) {
      return {
        status: 'starting',
        engineType: 'docker',
        activePort: this.activePort,
        message: 'Docker cluster is starting...',
        downloadProgress: this.currentDownloadProgress,
        services: this.getDefaultServices('starting'),
        stackLayers,
        url: primaryUrl,
        gateways,
        availableEngines: { docker: true, embedded: true }
      };
    }

    try {
      const { stdout } = await this.runCompose(['ps', '--format', 'json']);
      if (!stdout.trim()) {
        return {
          status: 'stopped',
          engineType: 'docker',
          activePort: this.activePort,
          services: this.getDefaultServices('stopped'),
          stackLayers,
          url: primaryUrl,
          gateways,
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

          if (rawService.includes('nginx') || rawService.includes('server') || rawName.includes('nginx') || rawName.includes('gateway') || rawService.includes('youmeos') || rawName.includes('youmeos')) {
            serviceKey = 'youmeos';
          } else if (rawService.includes('wordpress') || rawService.includes('wp-engine') || rawName.includes('wordpress') || rawName.includes('engine')) {
            serviceKey = 'youmeos';
          } else if (rawService.includes('avahi') || rawName.includes('avahi') || rawName.includes('mdns') || rawName.includes('discovery')) {
            serviceKey = 'youmeos';
          } else if (!serviceKey || !KNOWN_SERVICES[serviceKey]) {
            serviceKey = rawName.replace(/^youmeos-microverse[-_]/, '').replace(/^youmeos[-_]/, '').replace(/[-_]\d+$/, '');
            if (!serviceKey || !KNOWN_SERVICES[serviceKey]) serviceKey = 'youmeos';
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
            const rawPorts = item.Publishers
              .filter((p: any) => p.PublishedPort > 0)
              .map((p: any) => `${p.PublishedPort}->${p.TargetPort}`);
            ports = Array.from(new Set(rawPorts));
          }
          if (ports.length === 0 && meta.defaultPorts && meta.defaultPorts.length > 0) {
            ports = this.activePort === 80 ? meta.defaultPorts : [this.activePort.toString()];
          }

          parsedServices.push({
            name: serviceKey,
            displayName: meta.displayName,
            role: meta.role,
            status: serviceStatus,
            ports,
            health: item.Health || undefined,
            uptime: item.Status || undefined,
            category: meta.category,
            specs: meta.specs
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
          ports: this.activePort === 80 ? meta.defaultPorts : [this.activePort.toString()],
          category: meta.category,
          specs: meta.specs
        };
      });

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

      stackLayers = await inspectStackLayers({
        projectDir: this.projectDir,
        resourcesDir: this.resourcesDir,
        isServerRunning: overallStatus === 'running',
        port: this.activePort
      });

      return {
        status: overallStatus,
        engineType: 'docker',
        activePort: this.activePort,
        message: this.lastErrorMessage,
        errorInfo: this.lastErrorInfo,
        downloadProgress: this.currentDownloadProgress,
        services: resultServices,
        stackLayers,
        url: primaryUrl,
        gateways,
        availableEngines: { docker: true, embedded: true }
      };
    } catch (e: any) {
      return {
        status: 'error',
        engineType: 'docker',
        activePort: this.activePort,
        message: e.message || 'Failed to inspect Docker stack',
        errorInfo: classifyEngineError({
          rawError: e.message,
          activePort: this.activePort,
          engineType: 'docker'
        }),
        downloadProgress: this.currentDownloadProgress,
        services: this.getDefaultServices('error'),
        stackLayers,
        url: primaryUrl,
        gateways,
        availableEngines: { docker: isDocker, embedded: true }
      };
    }
  }

  async logs(service?: string, tail: number = 100): Promise<string> {
    try {
      const args = ['logs', '--tail', tail.toString()];
      if (service && service !== 'all') {
        if (service === 'nginx' || service === 'server' || service === 'gateway') {
          args.push('youmeos');
        } else if (service === 'wordpress' || service === 'wp-engine' || service === 'core') {
          args.push('youmeos');
        } else if (service === 'avahi' || service === 'discovery' || service === 'network') {
          args.push('youmeos');
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

