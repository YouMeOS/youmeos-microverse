import {
  MicroverseEngine,
  EngineStatusInfo,
  EngineType,
  LogEntry,
  LogFilterOptions,
  ProgressCallback,
  LogCallback,
  StatusCallback
} from './types';
import { DockerEngine } from './docker';
import { EmbeddedEngine } from './embedded';

export class EngineManager {
  private dockerEngine: DockerEngine;
  private embeddedEngine: EmbeddedEngine;
  private currentEngineType: EngineType = 'embedded';
  private progressCallback?: ProgressCallback;
  private logCallback?: LogCallback;
  private statusCallback?: StatusCallback;

  constructor() {
    this.dockerEngine = new DockerEngine();
    this.embeddedEngine = new EmbeddedEngine();

    const handleProgress: ProgressCallback = (progress) => {
      this.progressCallback?.(progress);
    };

    const handleLog: LogCallback = (log) => {
      this.logCallback?.(log);
    };

    const handleStatus: StatusCallback = (status) => {
      this.statusCallback?.(status);
    };

    this.dockerEngine.setProgressCallback(handleProgress);
    this.embeddedEngine.setProgressCallback(handleProgress);

    this.dockerEngine.setLogCallback(handleLog);
    this.embeddedEngine.setLogCallback(handleLog);

    this.dockerEngine.setStatusCallback(handleStatus);
    this.embeddedEngine.setStatusCallback(handleStatus);
  }

  setProgressCallback(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  setLogCallback(callback: LogCallback): void {
    this.logCallback = callback;
  }

  setStatusCallback(callback: StatusCallback): void {
    this.statusCallback = callback;
  }

  async init(): Promise<void> {
    const [dockerStatus, embeddedStatus] = await Promise.all([
      this.dockerEngine.status().catch(() => null),
      this.embeddedEngine.status().catch(() => null)
    ]);

    const isDockerRunning = dockerStatus && (dockerStatus.status === 'running' || dockerStatus.status === 'starting');
    const isEmbeddedRunning = embeddedStatus && (embeddedStatus.status === 'running' || embeddedStatus.status === 'starting');

    if (isDockerRunning) {
      this.currentEngineType = 'docker';
    } else if (isEmbeddedRunning) {
      this.currentEngineType = 'embedded';
    } else {
      const isEmbeddedAvail = await this.embeddedEngine.isAvailable();
      this.currentEngineType = isEmbeddedAvail ? 'embedded' : 'docker';
    }
  }

  get activeEngine(): MicroverseEngine {
    return this.currentEngineType === 'embedded' ? this.embeddedEngine : this.dockerEngine;
  }

  get currentType(): EngineType {
    return this.currentEngineType;
  }

  async setEngineType(type: EngineType): Promise<void> {
    if (this.currentEngineType === type) return;
    this.dockerEngine.invalidateAvailabilityCache();
    try {
      await Promise.allSettled([
        this.dockerEngine.stop(),
        this.embeddedEngine.stop()
      ]);
    } catch {
      // ignore
    }
    this.currentEngineType = type;
  }

  async setPort(port: number): Promise<void> {
    const cleanPort = Math.max(1, Math.min(65535, port));
    await Promise.allSettled([
      this.embeddedEngine.setPort?.(cleanPort),
      this.dockerEngine.setPort?.(cleanPort)
    ]);
  }

  getPort(): number {
    return this.activeEngine.getPort?.() || 80;
  }

  async setHomepageMode(mode: string): Promise<void> {
    const cleanMode = (mode || 'homepage').trim();
    await Promise.allSettled([
      this.embeddedEngine.setHomepageMode?.(cleanMode),
      this.dockerEngine.setHomepageMode?.(cleanMode)
    ]);
  }

  getHomepageMode(): string {
    return this.activeEngine.getHomepageMode?.() || 'homepage';
  }

  async setDevMode(enabled: boolean): Promise<void> {
    await Promise.allSettled([
      this.embeddedEngine.setDevMode?.(enabled),
      this.dockerEngine.setDevMode?.(enabled)
    ]);
  }

  getDevMode(): boolean {
    return this.activeEngine.getDevMode?.() ?? false;
  }

  async status(): Promise<EngineStatusInfo> {
    const [dockerAvail, embeddedAvail, engineStatus] = await Promise.all([
      this.dockerEngine.isAvailable(),
      this.embeddedEngine.isAvailable(),
      this.activeEngine.status()
    ]);

    return {
      ...engineStatus,
      engineType: this.currentEngineType,
      availableEngines: {
        docker: dockerAvail,
        embedded: embeddedAvail
      }
    };
  }

  async start(): Promise<void> {
    return this.activeEngine.start();
  }

  async stop(): Promise<void> {
    return this.activeEngine.stop();
  }

  async restart(): Promise<void> {
    return this.activeEngine.restart();
  }

  async logs(service?: string, tail?: number): Promise<string> {
    return this.activeEngine.logs(service, tail);
  }

  async getStructuredLogs(filter?: LogFilterOptions): Promise<LogEntry[]> {
    if (this.activeEngine.getStructuredLogs) {
      return this.activeEngine.getStructuredLogs(filter);
    }
    return [];
  }

  clearLogs(): void {
    if (this.activeEngine.clearLogs) {
      this.activeEngine.clearLogs();
    }
  }
}
