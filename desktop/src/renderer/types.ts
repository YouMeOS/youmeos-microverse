import type {
  DownloadProgress,
  ServiceInfo,
  EngineStatusInfo,
  StackLayerStatus,
  LogEntry,
  LogFilterOptions
} from '../main/engine/types';

export interface DesktopApi {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  restart: () => Promise<void>;
  getStatus: () => Promise<EngineStatusInfo>;
  getLogs: (service?: string, tail?: number) => Promise<string>;
  getStructuredLogs?: (filter?: LogFilterOptions) => Promise<LogEntry[]>;
  clearLogs?: () => Promise<void>;
  openUrl: (url?: string) => Promise<void>;
  openBrowser: () => Promise<void>;
  openStripeCheckout?: (url: string) => Promise<{
    success: boolean;
    tier?: string;
    key?: string;
    sessionId?: string;
    reason?: string;
  }>;
  setEngineType: (type: string) => Promise<void>;
  updatePlugins: () => Promise<{ stdout?: string; stderr?: string }>;
  getVersion?: () => Promise<string>;
  onDownloadProgress?: (callback: (progress: DownloadProgress | null) => void) => () => void;
  onLog?: (callback: (log: LogEntry) => void) => () => void;
  onStatusChange?: (callback: (status: EngineStatusInfo) => void) => () => void;
}

export type {
  DownloadProgress,
  ServiceInfo,
  EngineStatusInfo,
  StackLayerStatus,
  LogEntry,
  LogFilterOptions
};
