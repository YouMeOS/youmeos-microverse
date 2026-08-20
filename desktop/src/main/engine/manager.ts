import {
  MicroverseEngine,
  EngineStatusInfo,
  EngineType,
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
}
