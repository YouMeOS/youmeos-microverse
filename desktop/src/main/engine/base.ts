import {
  MicroverseEngine,
  EngineStatusInfo,
  EngineType,
  DownloadProgress,
  LogEntry,
  ProgressCallback,
  LogCallback,
  StatusCallback
} from './types';

export abstract class BaseEngine implements MicroverseEngine {
  abstract readonly type: EngineType;
  protected logsBuffer: string[] = [];
  protected currentDownloadProgress: DownloadProgress | null = null;
  protected progressCallback?: ProgressCallback;
  protected logCallback?: LogCallback;
  protected statusCallback?: StatusCallback;

  setProgressCallback(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  setLogCallback(callback: LogCallback): void {
    this.logCallback = callback;
  }

  setStatusCallback(callback: StatusCallback): void {
    this.statusCallback = callback;
  }

  protected pushLog(
    service: string,
    text: string,
    level: 'info' | 'warn' | 'error' | 'debug' = 'info'
  ): void {
    const formatted = `[${service}] ${text}`;
    this.logsBuffer.push(formatted);
    if (this.logsBuffer.length > 600) {
      this.logsBuffer.splice(0, this.logsBuffer.length - 600);
    }
    this.logCallback?.({
      service,
      text,
      level,
      timestamp: Date.now()
    });
  }

  protected notifyStatus(): void {
    this.status().then((st) => {
      this.statusCallback?.(st);
    }).catch(() => {});
  }

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract restart(): Promise<void>;
  abstract status(): Promise<EngineStatusInfo>;
  abstract isAvailable(): Promise<boolean>;

  async logs(_service?: string, tail: number = 100): Promise<string> {
    return this.logsBuffer.slice(-tail).join('\n') || '[Engine] No logs recorded yet.';
  }
}
