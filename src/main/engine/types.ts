export type EngineStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
export type EngineType = 'docker' | 'embedded';
export type DownloadStage = 'downloading' | 'extracting' | 'verifying' | 'complete';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

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
  category?: string;
  specs?: string[];
}

export interface StackLayerStatus {
  id: 'portal' | 'compass' | 'core' | 'bedrock' | 'database' | 'server' | 'network';
  name: string;
  category: string;
  installed: boolean;
  active: boolean;
  version?: string;
  details?: string;
  isUpToDate?: boolean;
  status: 'running' | 'stopped' | 'starting' | 'error';
}

export interface GatewayEndpoint {
  label: string;
  url: string;
  isPrimary?: boolean;
}

export type ErrorActionType =
  | 'switch_port'
  | 'switch_engine'
  | 'install_runtime'
  | 'reset_db'
  | 'retry'
  | 'view_logs';

export interface EngineErrorInfo {
  code:
    | 'PORT_IN_USE'
    | 'PERMISSION_DENIED'
    | 'MISSING_RUNTIME'
    | 'DOCKER_DAEMON_OFFLINE'
    | 'DB_LOCKED'
    | 'SPAWN_ERROR'
    | 'UNKNOWN';
  title: string;
  cause: string;
  suggestedAction: string;
  actionType: ErrorActionType;
  targetPort?: number;
  details?: string;
  rawError?: string;
  runtimeDownloadUrl?: string;
}

export interface EngineStatusInfo {
  status: EngineStatus;
  engineType: EngineType;
  message?: string;
  activePort?: number;
  osHomepageMode?: string;
  errorInfo?: EngineErrorInfo;
  downloadProgress?: DownloadProgress | null;
  services: ServiceInfo[];
  stackLayers?: StackLayerStatus[];
  url: string;
  gateways?: GatewayEndpoint[];
  availableEngines: {
    docker: boolean;
    embedded: boolean;
  };
}

export interface LogEntry {
  id?: string;
  service: string;
  text: string;
  level?: LogLevel;
  timestamp?: number;
}

export interface LogFilterOptions {
  service?: string;
  level?: LogLevel | 'all';
  search?: string;
  tail?: number;
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
  getStructuredLogs?(filter?: LogFilterOptions): Promise<LogEntry[]>;
  clearLogs?(): void;
  isAvailable(): Promise<boolean>;
  setPort?(port: number): Promise<void>;
  getPort?(): number;
  setHomepageMode?(mode: string): Promise<void>;
  getHomepageMode?(): string;
  setProgressCallback?(callback: ProgressCallback): void;
  setLogCallback?(callback: LogCallback): void;
  setStatusCallback?(callback: StatusCallback): void;
}
