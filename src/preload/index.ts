import { contextBridge, ipcRenderer } from 'electron';

const startHandler = () => ipcRenderer.invoke('engine:start');
const stopHandler = () => ipcRenderer.invoke('engine:stop');
const restartHandler = () => ipcRenderer.invoke('engine:restart');
const getStatusHandler = () => ipcRenderer.invoke('engine:status');
const getLogsHandler = (service?: string, tail?: number) => ipcRenderer.invoke('engine:logs', service, tail);
const getStructuredLogsHandler = (filter?: any) => ipcRenderer.invoke('engine:structured-logs', filter);
const clearLogsHandler = () => ipcRenderer.invoke('engine:clear-logs');
const openUrlHandler = (url?: string) => ipcRenderer.invoke('engine:open-url', url);
const openPortalHandler = (url?: string) => ipcRenderer.invoke('engine:open-portal', url);
const openExternalHandler = (url?: string) => ipcRenderer.invoke('engine:open-external', url);
const openBrowserHandler = (url?: string) => ipcRenderer.invoke('engine:open-external', url);
const openBlackboxFolderHandler = (subfolder?: string) => ipcRenderer.invoke('engine:open-blackbox-folder', subfolder);
const openStripeCheckoutHandler = (url: string) => ipcRenderer.invoke('checkout:open-stripe', url);
const setEngineTypeHandler = (type: string) => ipcRenderer.invoke('engine:set-type', type);
const setPortHandler = (port: number) => ipcRenderer.invoke('engine:set-port', port);
const getPortHandler = () => ipcRenderer.invoke('engine:get-port');
const setHomepageModeHandler = (mode: string) => ipcRenderer.invoke('engine:set-homepage-mode', mode);
const getHomepageModeHandler = () => ipcRenderer.invoke('engine:get-homepage-mode');
const setDevModeHandler = (enabled: boolean) => ipcRenderer.invoke('engine:set-dev-mode', enabled);
const getDevModeHandler = () => ipcRenderer.invoke('engine:get-dev-mode');
const updatePluginsHandler = () => ipcRenderer.invoke('engine:update-plugins');
const getVersionHandler = () => ipcRenderer.invoke('app:version');
const minimizeToTrayHandler = () => ipcRenderer.invoke('window:minimize-to-tray');

const listUsersHandler = () => ipcRenderer.invoke('diagnostics:list-users');
const resetPasswordHandler = (userId?: number, customPassword?: string) => ipcRenderer.invoke('diagnostics:reset-password', userId, customPassword);
const autoLoginHandler = (userId?: number, redirectTo?: string) => ipcRenderer.invoke('diagnostics:auto-login', userId, redirectTo);
const flushSessionHandler = () => ipcRenderer.invoke('diagnostics:flush-session');
const checkDbHealthHandler = () => ipcRenderer.invoke('diagnostics:db-health');
const resetDatabaseHandler = () => ipcRenderer.invoke('diagnostics:reset-database');

const checkUpdatesHandler = () => ipcRenderer.invoke('updater:check');
const downloadUpdateHandler = () => ipcRenderer.invoke('updater:download');
const installUpdateHandler = () => ipcRenderer.invoke('updater:install');
const getUpdateStatusHandler = () => ipcRenderer.invoke('updater:get-status');

const onDownloadProgressHandler = (callback: (progress: any) => void) => {
  const subscription = (_: any, data: any) => callback(data);
  ipcRenderer.on('engine:download-progress', subscription);
  return () => {
    ipcRenderer.removeListener('engine:download-progress', subscription);
  };
};

const onLogHandler = (callback: (log: any) => void) => {
  const subscription = (_: any, data: any) => callback(data);
  ipcRenderer.on('engine:log', subscription);
  return () => {
    ipcRenderer.removeListener('engine:log', subscription);
  };
};

const onStatusChangeHandler = (callback: (status: any) => void) => {
  const subscription = (_: any, data: any) => callback(data);
  ipcRenderer.on('engine:status-changed', subscription);
  return () => {
    ipcRenderer.removeListener('engine:status-changed', subscription);
  };
};

const onUpdateStatusHandler = (callback: (status: any) => void) => {
  const subscription = (_: any, data: any) => callback(data);
  ipcRenderer.on('updater:status-changed', subscription);
  return () => {
    ipcRenderer.removeListener('updater:status-changed', subscription);
  };
};

contextBridge.exposeInMainWorld('api', {
  start: startHandler,
  stop: stopHandler,
  restart: restartHandler,
  getStatus: getStatusHandler,
  getLogs: getLogsHandler,
  getStructuredLogs: getStructuredLogsHandler,
  clearLogs: clearLogsHandler,
  openUrl: openUrlHandler,
  openPortal: openPortalHandler,
  openExternal: openExternalHandler,
  openBrowser: openBrowserHandler,
  openBlackboxFolder: openBlackboxFolderHandler,
  openStripeCheckout: openStripeCheckoutHandler,
  setEngineType: setEngineTypeHandler,
  setPort: setPortHandler,
  getPort: getPortHandler,
  setHomepageMode: setHomepageModeHandler,
  getHomepageMode: getHomepageModeHandler,
  setDevMode: setDevModeHandler,
  getDevMode: getDevModeHandler,
  updatePlugins: updatePluginsHandler,
  getVersion: getVersionHandler,
  minimizeToTray: minimizeToTrayHandler,
  listUsers: listUsersHandler,
  resetPassword: resetPasswordHandler,
  autoLogin: autoLoginHandler,
  flushSession: flushSessionHandler,
  checkDbHealth: checkDbHealthHandler,
  resetDatabase: resetDatabaseHandler,
  checkForUpdates: checkUpdatesHandler,
  downloadUpdate: downloadUpdateHandler,
  installUpdate: installUpdateHandler,
  getUpdateStatus: getUpdateStatusHandler,
  onDownloadProgress: onDownloadProgressHandler,
  onLog: onLogHandler,
  onStatusChange: onStatusChangeHandler,
  onUpdateStatus: onUpdateStatusHandler
});
