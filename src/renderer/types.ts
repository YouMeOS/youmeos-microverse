import type {
  EngineErrorInfo,
  ErrorActionType,
  EngineStatus,
  EngineType,
  GatewayEndpoint,
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

import type {
  WpUser,
  PasswordResetResult,
  AutoLoginResult,
  DbHealthResult,
  DbResetResult
} from '../main/engine/diagnostics';

export interface PluginUpdateDetail {
  slug: string;
  name: string;
  prevVersion: string;
  newVersion: string;
  status: 'updated' | 'unchanged' | 'installed' | 'error';
  error?: string;
}

export interface PluginUpdateResult {
  success: boolean;
  updatedCount: number;
  totalCount: number;
  details: PluginUpdateDetail[];
  error?: string;
  stdout?: string;
  stderr?: string;
}

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
  setPort?: (port: number) => Promise<void>;
  getPort?: () => Promise<number>;
  setHomepageMode?: (mode: string) => Promise<void>;
  getHomepageMode?: () => Promise<string>;
  updatePlugins: () => Promise<PluginUpdateResult>;
  getVersion?: () => Promise<string>;
  minimizeToTray?: () => Promise<void>;
  listUsers?: () => Promise<WpUser[]>;
  resetPassword?: (userId?: number, customPassword?: string) => Promise<PasswordResetResult>;
  autoLogin?: (userId?: number, redirectTo?: string) => Promise<AutoLoginResult>;
  flushSession?: () => Promise<boolean>;
  checkDbHealth?: () => Promise<DbHealthResult>;
  resetDatabase?: () => Promise<DbResetResult>;
  checkForUpdates?: () => Promise<AppUpdateStatus>;
  downloadUpdate?: () => Promise<void>;
  installUpdate?: () => Promise<void>;
  getUpdateStatus?: () => Promise<AppUpdateStatus>;
  onDownloadProgress?: (callback: (progress: DownloadProgress | null) => void) => () => void;
  onLog?: (callback: (log: LogEntry) => void) => () => void;
  onStatusChange?: (callback: (status: EngineStatusInfo) => void) => () => void;
  onUpdateStatus?: (callback: (status: AppUpdateStatus) => void) => () => void;
}

export type WebtopLaunchTarget = 'webview' | 'browser';
export type AutolaunchTarget = 'webview' | 'browser';

export type {
  EngineErrorInfo,
  ErrorActionType,
  EngineStatus,
  EngineType,
  GatewayEndpoint,
  DownloadProgress,
  ServiceInfo,
  EngineStatusInfo,
  StackLayerStatus,
  LogEntry,
  LogFilterOptions,
  AppUpdateStatus,
  UpdateState,
  UpdateProgress,
  WpUser,
  PasswordResetResult,
  AutoLoginResult,
  DbHealthResult,
  DbResetResult
};
