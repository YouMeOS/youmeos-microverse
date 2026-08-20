import { app } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { BaseEngine } from './base';
import {
  EngineStatusInfo,
  ServiceInfo,
  EngineStatus,
  EngineType,
  DownloadProgress,
  GatewayEndpoint
} from './types';
import { setupEmbeddedEnvironment, DEFAULT_CADDYFILE } from './embedded-setup';

export class EmbeddedEngine extends BaseEngine {
  readonly type: EngineType = 'embedded';
  private serverProcess: ChildProcess | null = null;
  private activePort = 80;
  private projectDir: string;
  private resourcesDir: string;
  private isSettingUp = false;
  private currentStatus: EngineStatus = 'stopped';
  private lastErrorMessage?: string;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    const isProduction = app?.isPackaged ?? (process.env.NODE_ENV === 'production' || __dirname.includes('app.asar'));
    this.projectDir = isProduction ? app.getPath('userData') : path.join(__dirname, '..', '..', '..', '..');
    this.resourcesDir = isProduction ? process.resourcesPath : path.join(__dirname, '..', '..', '..', '..');
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  private resolveCaddyfilePath(): string {
    const embeddedCaddyfile = path.join(this.projectDir, 'data', 'embedded', 'Caddyfile');
    if (fs.existsSync(embeddedCaddyfile)) {
      return embeddedCaddyfile;
    }

    const candidates = [
      path.join(__dirname, 'Caddyfile'),
      path.join(__dirname, '..', 'engine', 'Caddyfile'),
      path.join(this.resourcesDir, 'desktop', 'dist', 'main', 'engine', 'Caddyfile'),
      path.join(this.resourcesDir, 'Caddyfile'),
      path.join(this.projectDir, 'Caddyfile'),
      path.join(__dirname, '..', '..', 'src', 'main', 'engine', 'Caddyfile'),
      path.join(this.projectDir, 'desktop', 'src', 'main', 'engine', 'Caddyfile')
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        if (c.includes('.asar')) {
          try {
            const content = fs.readFileSync(c, 'utf8');
            const targetDir = path.dirname(embeddedCaddyfile);
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }
            fs.writeFileSync(embeddedCaddyfile, content, 'utf8');
            return embeddedCaddyfile;
          } catch {}
        } else {
          return c;
        }
      }
    }

    try {
      const targetDir = path.dirname(embeddedCaddyfile);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(embeddedCaddyfile, DEFAULT_CADDYFILE, 'utf8');
      return embeddedCaddyfile;
    } catch {}

    return embeddedCaddyfile;
  }

  private checkServerHealth(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${port}/`, { timeout: 1200 }, (res) => {
        resolve(res.statusCode !== undefined);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  async start(): Promise<void> {
    if (this.serverProcess || this.isSettingUp || this.currentStatus === 'starting') {
      return;
    }

    this.isSettingUp = true;
    this.currentStatus = 'starting';
    this.lastErrorMessage = undefined;
    this.notifyStatus();

    let frankenPath = '';
    try {
      const handleLog = (msg: string) => this.pushLog('setup', msg);
      const handleProgress = (prog: DownloadProgress | null) => {
        this.currentDownloadProgress = prog;
        this.progressCallback?.(prog);
      };

      frankenPath = await setupEmbeddedEnvironment(this.projectDir, handleLog, handleProgress, this.resourcesDir);
    } catch (e: any) {
      this.isSettingUp = false;
      this.currentStatus = 'error';
      this.lastErrorMessage = `Embedded setup failed: ${e.message}`;
      this.currentDownloadProgress = null;
      this.progressCallback?.(null);
      this.pushLog('setup', `Error: ${e.message}`, 'error');
      this.notifyStatus();
      throw e;
    }

    this.isSettingUp = false;
    this.currentDownloadProgress = null;
    this.progressCallback?.(null);

    this.activePort = 80;

    const caddyfilePath = this.resolveCaddyfilePath();
    const wpCoreDir = path.join(this.projectDir, 'data', 'embedded', 'wp-core');

    const certPath = path.join(this.projectDir, 'docker', 'nginx', 'certs', 'cert.pem');
    const keyPath = path.join(this.projectDir, 'docker', 'nginx', 'certs', 'key.pem');
    const resCertPath = path.join(this.resourcesDir, 'docker', 'nginx', 'certs', 'cert.pem');
    const resKeyPath = path.join(this.resourcesDir, 'docker', 'nginx', 'certs', 'key.pem');
    const hasCerts = (fs.existsSync(certPath) && fs.existsSync(keyPath)) || (fs.existsSync(resCertPath) && fs.existsSync(resKeyPath));
    const activeCert = fs.existsSync(certPath) ? certPath : (fs.existsSync(resCertPath) ? resCertPath : 'internal');
    const activeKey = fs.existsSync(keyPath) ? keyPath : (fs.existsSync(resKeyPath) ? resKeyPath : '');

    this.pushLog('frankenphp', `Starting FrankenPHP native engine on ports 80/443 (Gateway: https://my.youmeos.com)...`);

    try {
      this.serverProcess = spawn(frankenPath, ['run', '--config', caddyfilePath], {
        env: {
          ...process.env,
          WP_ROOT: wpCoreDir.replace(/\\/g, '/'),
          PORT: this.activePort.toString(),
          HTTPS_PORT: '443',
          TLS_CERT: hasCerts ? activeCert.replace(/\\/g, '/') : 'internal',
          TLS_KEY: hasCerts ? activeKey.replace(/\\/g, '/') : ''
        }
      });

      this.serverProcess.stdout?.on('data', (data) => {
        const lines = data.toString().trim().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const msg = parsed.msg || parsed.message || JSON.stringify(parsed);
            const rawLevel = (parsed.level || '').toLowerCase();
            const level = rawLevel === 'error' ? 'error' : (rawLevel === 'warn' || rawLevel === 'warning' ? 'warn' : (rawLevel === 'debug' ? 'debug' : 'info'));
            const service = (parsed.logger && parsed.logger.includes('http')) ? 'gateway' : 'core';
            this.pushLog(service, msg, level);
          } catch {
            this.pushLog('core', line, 'info');
          }
        }
      });

      this.serverProcess.stderr?.on('data', (data) => {
        const lines = data.toString().trim().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const msg = parsed.msg || parsed.message || JSON.stringify(parsed);
            const rawLevel = (parsed.level || '').toLowerCase();
            const level = rawLevel === 'error' ? 'error' : (rawLevel === 'warn' || rawLevel === 'warning' ? 'warn' : (rawLevel === 'debug' ? 'debug' : 'info'));
            const service = (parsed.logger && parsed.logger.includes('http')) ? 'gateway' : 'core';
            this.pushLog(service, msg, level);
          } catch {
            const lower = line.toLowerCase();
            const isErr = lower.includes('fatal') || lower.includes('permission denied') || lower.includes('bind:') || lower.includes('[error]');
            const isWarn = lower.includes('warning') || lower.includes('[warn]');
            const isNotice =
              lower.includes('[notice]') ||
              lower.includes('maxprocs:') ||
              lower.includes('gomemlimit') ||
              lower.includes('byeee') ||
              lower.includes('process exited') ||
              lower.includes('using config') ||
              lower.includes('adapted config') ||
              lower.includes('admin endpoint');
            const level = isErr ? 'error' : (isNotice ? 'info' : (isWarn ? 'warn' : 'info'));
            this.pushLog('core', line, level);
            if (isErr && !this.lastErrorMessage) {
              this.lastErrorMessage = line;
            }
          }
        }
      });

      this.serverProcess.on('exit', (code, signal) => {
        this.pushLog('gateway', `Process exited with code ${code ?? signal}`, code === 0 ? 'info' : 'warn');
        this.serverProcess = null;
        if (this.currentStatus !== 'stopping' && this.currentStatus !== 'stopped') {
          this.currentStatus = code === 0 ? 'stopped' : 'error';
          if (code !== 0 && !this.lastErrorMessage) {
            this.lastErrorMessage = `FrankenPHP exited unexpectedly with code ${code}. Check if port ${this.activePort} is available.`;
          }
        } else {
          this.currentStatus = 'stopped';
        }
        this.notifyStatus();
      });

      this.serverProcess.on('error', (err) => {
        this.pushLog('gateway', `Spawn error: ${err.message}`, 'error');
        this.currentStatus = 'error';
        this.lastErrorMessage = err.message;
        this.serverProcess = null;
        this.notifyStatus();
      });

      let elapsed = 0;
      const pollInterval = 350;
      const maxWait = 10000;

      const runProbe = async () => {
        if (!this.serverProcess) return;
        const healthy = await this.checkServerHealth(this.activePort);
        if (healthy) {
          this.currentStatus = 'running';
          this.lastErrorMessage = undefined;
          this.pushLog('gateway', `Native Gateway & PHP Engine verified healthy on port ${this.activePort}`);
          this.notifyStatus();
          return;
        }

        elapsed += pollInterval;
        if (elapsed < maxWait && this.serverProcess) {
          this.healthCheckTimer = setTimeout(runProbe, pollInterval);
        } else if (this.serverProcess) {
          this.currentStatus = 'running';
          this.pushLog('gateway', `Native engine process running, but HTTP health probe on port ${this.activePort} did not respond. Check port ${this.activePort} availability or permissions.`, 'warn');
          this.notifyStatus();
        }
      };

      this.healthCheckTimer = setTimeout(runProbe, 500);

    } catch (e: any) {
      this.currentStatus = 'error';
      this.lastErrorMessage = `Failed to spawn FrankenPHP: ${e.message}`;
      this.pushLog('frankenphp', this.lastErrorMessage, 'error');
      this.notifyStatus();
      throw e;
    }
  }

  async stop(): Promise<void> {
    if (this.healthCheckTimer) {
      clearTimeout(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    if (!this.serverProcess) {
      this.currentStatus = 'stopped';
      this.notifyStatus();
      return;
    }

    this.currentStatus = 'stopping';
    this.notifyStatus();
    this.pushLog('frankenphp', 'Stopping PHP server runtime...');

    return new Promise((resolve) => {
      if (!this.serverProcess) {
        this.currentStatus = 'stopped';
        this.notifyStatus();
        return resolve();
      }

      const proc = this.serverProcess;
      const forceKillTimer = setTimeout(() => {
        try {
          proc.kill('SIGKILL');
        } catch {}
      }, 2500);

      proc.once('exit', () => {
        clearTimeout(forceKillTimer);
        this.serverProcess = null;
        this.currentStatus = 'stopped';
        this.pushLog('frankenphp', 'PHP server runtime stopped.');
        this.notifyStatus();
        resolve();
      });

      try {
        proc.kill('SIGTERM');
      } catch {
        proc.kill('SIGKILL');
      }
    });
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  async status(): Promise<EngineStatusInfo> {
    const isRunning = this.currentStatus === 'running' && this.serverProcess !== null;
    const isStarting = this.currentStatus === 'starting' || this.isSettingUp;
    const isError = this.currentStatus === 'error';

    let serverState: 'running' | 'stopped' | 'starting' | 'error' = 'stopped';
    if (isRunning) serverState = 'running';
    else if (isStarting) serverState = 'starting';
    else if (isError) serverState = 'error';

    const services: ServiceInfo[] = [
      {
        name: 'php-server',
        displayName: 'Native Web & PHP Server',
        role: 'FrankenPHP Isolated Runtime & Gateway',
        status: serverState,
        ports: ['80', '443'],
        health: isRunning ? 'healthy' : (isStarting ? 'starting' : undefined),
        category: 'Edge Gateway & PHP 8.3',
        specs: ['FrankenPHP 1.2', 'Caddy Engine', 'HTTP/2 & TLS 1.3']
      },
      {
        name: 'sqlite-store',
        displayName: 'SQLite Database Store',
        role: 'Encrypted Single-File Database Sandbox',
        status: isRunning ? 'running' : (isStarting ? 'starting' : 'stopped'),
        ports: ['Native VFS'],
        category: 'Persistent Storage',
        specs: ['SQLite 3 Sandbox', 'Zero Latency', 'Auto-Vacuum']
      },
      {
        name: 'local-network',
        displayName: 'Private Node Network (mDNS)',
        role: 'Zero-Telemetry Loopback Mesh',
        status: isRunning ? 'running' : (isStarting ? 'starting' : 'stopped'),
        ports: ['5353 / Loopback'],
        category: 'Network Mesh',
        specs: ['Localhost Mesh', 'Zero-Telemetry', 'mDNS Broadcast']
      }
    ];

    const primaryUrl = 'https://my.youmeos.com';
    const gateways: GatewayEndpoint[] = [
      { label: 'my.youmeos.com', url: primaryUrl, isPrimary: true },
      { label: 'youmeos.localhost', url: 'http://youmeos.localhost' },
      { label: 'youmeos.local', url: 'http://youmeos.local' },
      { label: 'localhost', url: 'http://localhost' }
    ];

    return {
      status: this.currentStatus,
      engineType: 'embedded',
      message: this.lastErrorMessage,
      downloadProgress: this.currentDownloadProgress,
      services,
      url: primaryUrl,
      gateways,
      availableEngines: { docker: false, embedded: true }
    };
  }
}
