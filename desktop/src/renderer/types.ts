import type {
  DownloadProgress,
  ServiceInfo,
  EngineStatusInfo,
  StackLayerStatus,
  LogEntry,
  LogFilterOptions
} from '../main/engine/types';
import type {
  AppUpdateStatus,
  UpdateState,
  UpdateProgress
} from '../main/updater';

export interface DesktopApi {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  restart: () => Promise<void>;
  getStatus: () => Promise<EngineStatusInfo>;
  getLogs: (service?: string, tail?: number) => Promise<string>;
  getStructuredLogs?: (filter?: LogFilterOptions) => Promise<LogEntry[]>;
  clearLogs?: () => Promise<void>;
  openUrl: (url?: string) => Promise<void>;
  openPortal?: (url?: string) => Promise<void>;
  openExternal?: (url?: string) => Promise<void>;
  openBrowser: (url?: string) => Promise<void>;
  openBlackboxFolder?: (subfolder?: string) => Promise<string>;
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
  checkForUpdates?: () => Promise<AppUpdateStatus>;
  downloadUpdate?: () => Promise<void>;
  installUpdate?: () => Promise<void>;
  getUpdateStatus?: () => Promise<AppUpdateStatus>;
  onDownloadProgress?: (callback: (progress: DownloadProgress | null) => void) => () => void;
  onLog?: (callback: (log: LogEntry) => void) => () => void;
  onStatusChange?: (callback: (status: EngineStatusInfo) => void) => () => void;
  onUpdateStatus?: (callback: (status: AppUpdateStatus) => void) => () => void;
}

export type {
  DownloadProgress,
  ServiceInfo,
  EngineStatusInfo,
  StackLayerStatus,
  LogEntry,
  LogFilterOptions,
  AppUpdateStatus,
  UpdateState,
  UpdateProgress
};
