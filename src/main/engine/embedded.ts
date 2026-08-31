import { app } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { BaseEngine, getDevProjectDir } from './base';
import {
  EngineStatusInfo,
  ServiceInfo,
  EngineStatus,
  EngineType,
  DownloadProgress,
  GatewayEndpoint,
  EngineErrorInfo,
  LogLevel
} from './types';
import { setupEmbeddedEnvironment, DEFAULT_CADDYFILE } from './embedded-setup';
import { inspectStackLayers } from './stack-inspector';
import { classifyEngineError } from './error-classifier';

export class EmbeddedEngine extends BaseEngine {
  readonly type: EngineType = 'embedded';
  private serverProcess: ChildProcess | null = null;
  private activePort = 80;
  private osHomepageMode: string = process.env.OS_HOMEPAGE_MODE || process.env.YOUMEOS_LOAD_MODE || 'homepage';
  private projectDir: string;
  private resourcesDir: string;
  private isSettingUp = false;
  private currentStatus: EngineStatus = 'stopped';
  private lastErrorMessage?: string;
  private lastErrorInfo?: EngineErrorInfo;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    const isProduction = app?.isPackaged ?? (process.env.NODE_ENV === 'production' || __dirname.includes('app.asar'));
    this.projectDir = isProduction ? app.getPath('userData') : getDevProjectDir(__dirname);
    this.resourcesDir = isProduction ? process.resourcesPath : getDevProjectDir(__dirname);
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async setPort(port: number): Promise<void> {
    const cleanPort = Math.max(1, Math.min(65535, port));
    if (this.activePort === cleanPort) return;
    this.activePort = cleanPort;
    this.pushLog('gateway', `Port updated to ${this.activePort}`);
    if (this.currentStatus === 'running' || this.currentStatus === 'starting') {
      await this.restart();
    }
  }

  getPort(): number {
    return this.activePort;
  }

  async setHomepageMode(mode: string): Promise<void> {
    const cleanMode = (mode || 'homepage').trim();
    if (this.osHomepageMode === cleanMode) return;
    this.osHomepageMode = cleanMode;
    this.pushLog('gateway', `OS Homepage mode updated to ${this.osHomepageMode}`);
    if (this.currentStatus === 'running' || this.currentStatus === 'starting') {
      await this.restart();
    }
  }

  getHomepageMode(): string {
    return this.osHomepageMode;
  }

  private resolveCaddyfilePath(): string {
    const embeddedCaddyfile = path.join(this.projectDir, 'data', 'embedded', 'Caddyfile');
    if (fs.existsSync(embeddedCaddyfile)) {
      try {
        const existing = fs.readFileSync(embeddedCaddyfile, 'utf8');
        if (existing.includes('{$PORT') && existing.includes('http_port')) {
          return embeddedCaddyfile;
        }
      } catch {}
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

  private formatFrankenLog(line: string): { service: string; msg: string; level: LogLevel } {
    try {
      const parsed = JSON.parse(line);
      const service = (parsed.logger && parsed.logger.includes('http')) ? 'gateway' : 'core';
      const rawLevel = (parsed.level || '').toLowerCase();
      let level: LogLevel = rawLevel === 'error' ? 'error' : (rawLevel === 'warn' || rawLevel === 'warning' ? 'warn' : (rawLevel === 'debug' ? 'debug' : 'info'));

      // HTTP Access Request (Caddy / FrankenPHP access logger)
      if (parsed.request || parsed.logger === 'http.log.access' || parsed.msg === 'handled request') {
        const req = parsed.request || {};
        const method = (req.method || 'GET').toUpperCase();
        const uri = req.uri || '/';
        const status = parsed.status || 200;

        if (status >= 500) {
          level = 'error';
        } else if (status >= 400) {
          level = 'warn';
        }

        let durationStr = '';
        if (typeof parsed.duration === 'number') {
          const ms = Math.max(1, Math.round(parsed.duration * 1000));
          durationStr = `${ms}ms`;
        }

        let sizeStr = '';
        if (typeof parsed.size === 'number' && parsed.size > 0) {
          if (parsed.size < 1024) {
            sizeStr = `${parsed.size} B`;
          } else {
            sizeStr = `${(parsed.size / 1024).toFixed(1)} KB`;
          }
        }

        const metaParts = [durationStr, sizeStr].filter(Boolean).join(', ');
        const meta = metaParts ? ` [${metaParts}]` : '';

        return {
          service: 'gateway',
          msg: `${method} ${uri} -> ${status}${meta}`,
          level
        };
      }

      let msg = parsed.msg || parsed.message || '';
      if (parsed.error) {
        msg = msg ? `${msg}: ${parsed.error}` : parsed.error;
        level = 'error';
      } else if (!msg) {
        msg = JSON.stringify(parsed);
      }

      return { service, msg, level };
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
      const level: LogLevel = isErr ? 'error' : (isNotice ? 'info' : (isWarn ? 'warn' : 'info'));
      return { service: 'core', msg: line, level };
    }
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
    this.lastErrorInfo = undefined;
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
      this.lastErrorInfo = classifyEngineError({
        rawError: e.message,
        activePort: this.activePort,
        engineType: 'embedded'
      });
      this.currentDownloadProgress = null;
      this.progressCallback?.(null);
      this.pushLog('setup', `Error: ${e.message}`, 'error');
      this.notifyStatus();
      throw e;
    }

    this.isSettingUp = false;
    this.currentDownloadProgress = null;
    this.progressCallback?.(null);

    const caddyfilePath = this.resolveCaddyfilePath();
    const wpCoreDir = path.join(this.projectDir, 'data', 'embedded', 'wp-core');

    const certPath = path.join(this.projectDir, 'docker', 'nginx', 'certs', 'cert.pem');
    const keyPath = path.join(this.projectDir, 'docker', 'nginx', 'certs', 'key.pem');
    const resCertPath = path.join(this.resourcesDir, 'docker', 'nginx', 'certs', 'cert.pem');
    const resKeyPath = path.join(this.resourcesDir, 'docker', 'nginx', 'certs', 'key.pem');
    const hasCerts = (fs.existsSync(certPath) && fs.existsSync(keyPath)) || (fs.existsSync(resCertPath) && fs.existsSync(resKeyPath));
    const activeCert = fs.existsSync(certPath) ? certPath : (fs.existsSync(resCertPath) ? resCertPath : 'internal');
    const activeKey = fs.existsSync(keyPath) ? keyPath : (fs.existsSync(resKeyPath) ? resKeyPath : '');

    const httpsPort = this.activePort === 80 ? '443' : (this.activePort + 363).toString();

    this.pushLog('frankenphp', `Starting FrankenPHP native engine on port ${this.activePort} (Gateway: ${this.activePort === 80 ? 'https://my.youmeos.com' : 'http://localhost:' + this.activePort})...`);

    const tlsDirective = hasCerts
      ? `tls "${activeCert.replace(/\\/g, '/')}" "${activeKey.replace(/\\/g, '/')}"`
      : 'tls internal';

    const binDir = path.dirname(frankenPath);
    const envPath = process.platform === 'win32'
      ? `${binDir};${process.env.PATH || ''}`
      : `${binDir}:${process.env.PATH || ''}`;

    try {
      this.serverProcess = spawn(frankenPath, ['run', '--config', caddyfilePath], {
        cwd: binDir,
        env: {
          ...process.env,
          PATH: envPath,
          WP_ROOT: wpCoreDir.replace(/\\/g, '/'),
          PORT: this.activePort.toString(),
          HTTPS_PORT: httpsPort,
          OS_HOMEPAGE_MODE: this.osHomepageMode,
          YOUMEOS_LOAD_MODE: this.osHomepageMode,
          TLS_DIRECTIVE: tlsDirective,
          TLS_CERT: hasCerts ? activeCert.replace(/\\/g, '/') : 'internal',
          TLS_KEY: hasCerts ? activeKey.replace(/\\/g, '/') : ''
        }
      });

      this.serverProcess.stdout?.on('data', (data) => {
        const lines = data.toString().trim().split('\n').filter(Boolean);
        for (const line of lines) {
          const { service, msg, level } = this.formatFrankenLog(line);
          this.pushLog(service, msg, level);
        }
      });

      this.serverProcess.stderr?.on('data', (data) => {
        const lines = data.toString().trim().split('\n').filter(Boolean);
        for (const line of lines) {
          const { service, msg, level } = this.formatFrankenLog(line);
          this.pushLog(service, msg, level);
          if (level === 'error' && !this.lastErrorMessage) {
            this.lastErrorMessage = msg;
            this.lastErrorInfo = classifyEngineError({
              rawError: line,
              activePort: this.activePort,
              engineType: 'embedded'
            });
          }
        }
      });

      this.serverProcess.on('exit', (code, signal) => {
        this.pushLog('gateway', `Process exited with code ${code ?? signal}`, code === 0 ? 'info' : 'warn');
        this.serverProcess = null;
        if (this.currentStatus !== 'stopping' && this.currentStatus !== 'stopped') {
          this.currentStatus = code === 0 ? 'stopped' : 'error';
          if (code !== 0 && !this.lastErrorMessage) {
            if (code === 3221225781 || code === -1073741515) {
              this.lastErrorMessage = 'Missing Windows C++ Runtime. Please install Microsoft Visual C++ 2015-2022 Redistributable (x64): https://aka.ms/vs/17/release/vc_redist.x64.exe';
              this.lastErrorInfo = classifyEngineError({
                exitCode: code,
                rawError: this.lastErrorMessage,
                activePort: this.activePort,
                engineType: 'embedded'
              });
              this.pushLog('core', this.lastErrorMessage, 'error');
            } else {
              this.lastErrorMessage = `FrankenPHP exited unexpectedly with code ${code}. Check if port ${this.activePort} is available.`;
              this.lastErrorInfo = classifyEngineError({
                exitCode: code,
                rawError: this.lastErrorMessage,
                activePort: this.activePort,
                engineType: 'embedded'
              });
            }
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
        this.lastErrorInfo = classifyEngineError({
          rawError: err.message,
          activePort: this.activePort,
          engineType: 'embedded'
        });
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
          this.lastErrorInfo = undefined;
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
      this.lastErrorInfo = classifyEngineError({
        rawError: e.message,
        activePort: this.activePort,
        engineType: 'embedded'
      });
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

    const activePortsList = this.activePort === 80
      ? ['80', '443']
      : [this.activePort.toString(), (this.activePort + 363).toString()];

    const services: ServiceInfo[] = [
      {
        name: 'php-server',
        displayName: 'Native Web & PHP Server',
        role: 'FrankenPHP Isolated Runtime & Gateway',
        status: serverState,
        ports: activePortsList,
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

    const isStandardPort = this.activePort === 80;
    const primaryUrl = isStandardPort ? 'https://my.youmeos.com' : `http://localhost:${this.activePort}`;
    const gateways: GatewayEndpoint[] = isStandardPort
      ? [
          { label: 'my.youmeos.com', url: primaryUrl, isPrimary: true },
          { label: 'youmeos.localhost', url: 'http://youmeos.localhost' }
        ]
      : [
          { label: `localhost:${this.activePort}`, url: primaryUrl, isPrimary: true },
          { label: `youmeos.localhost:${this.activePort}`, url: `http://youmeos.localhost:${this.activePort}` },
          { label: `127.0.0.1:${this.activePort}`, url: `http://127.0.0.1:${this.activePort}` }
        ];

    const stackLayers = await inspectStackLayers({
      projectDir: this.projectDir,
      resourcesDir: this.resourcesDir,
      isServerRunning: isRunning,
      port: this.activePort
    });

    return {
      status: this.currentStatus,
      engineType: 'embedded',
      activePort: this.activePort,
      osHomepageMode: this.osHomepageMode,
      message: this.lastErrorMessage,
      errorInfo: this.lastErrorInfo,
      downloadProgress: this.currentDownloadProgress,
      services,
      stackLayers,
      url: primaryUrl,
      gateways,
      availableEngines: { docker: false, embedded: true }
    };
  }
}
