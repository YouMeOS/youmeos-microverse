export type EngineStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
export type EngineType = 'docker' | 'embedded';
export type DownloadStage = 'downloading' | 'extracting' | 'verifying' | 'complete';

export interface DownloadProgress {
  item: string;
  loaded: number;
  total: number;
  percent: number;
  speed: number;
  detail?: string;
  stage?: DownloadStage;
}

export interface ServiceInfo {
  name: string;
  displayName: string;
  role: string;
  status: 'running' | 'stopped' | 'starting' | 'error';
  ports?: string[];
  health?: string;
  uptime?: string;
}

export interface GatewayEndpoint {
  label: string;
  url: string;
  isPrimary?: boolean;
}

export interface EngineStatusInfo {
  status: EngineStatus;
  engineType: EngineType;
  message?: string;
  downloadProgress?: DownloadProgress | null;
  services: ServiceInfo[];
  url: string;
  gateways?: GatewayEndpoint[];
  availableEngines: {
    docker: boolean;
    embedded: boolean;
  };
}

export interface LogEntry {
  service: string;
  text: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
  timestamp?: number;
}

export type ProgressCallback = (progress: DownloadProgress | null) => void;
export type LogCallback = (log: LogEntry) => void;
export type StatusCallback = (status: EngineStatusInfo) => void;
export type SimpleLogCallback = (msg: string) => void;

export interface MicroverseEngine {
  readonly type: EngineType;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  status(): Promise<EngineStatusInfo>;
  logs(service?: string, tail?: number): Promise<string>;
  isAvailable(): Promise<boolean>;
  setProgressCallback?(callback: ProgressCallback): void;
  setLogCallback?(callback: LogCallback): void;
  setStatusCallback?(callback: StatusCallback): void;
}

