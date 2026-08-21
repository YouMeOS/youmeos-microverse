import { contextBridge, ipcRenderer } from 'electron';

const startHandler = () => ipcRenderer.invoke('engine:start');
const stopHandler = () => ipcRenderer.invoke('engine:stop');
const restartHandler = () => ipcRenderer.invoke('engine:restart');
const getStatusHandler = () => ipcRenderer.invoke('engine:status');
const getLogsHandler = (service?: string, tail?: number) => ipcRenderer.invoke('engine:logs', service, tail);
const getStructuredLogsHandler = (filter?: any) => ipcRenderer.invoke('engine:structured-logs', filter);
const clearLogsHandler = () => ipcRenderer.invoke('engine:clear-logs');
const openUrlHandler = (url?: string) => ipcRenderer.invoke('engine:open-url', url);
const openBrowserHandler = () => ipcRenderer.invoke('engine:open-browser');
const openStripeCheckoutHandler = (url: string) => ipcRenderer.invoke('checkout:open-stripe', url);
const setEngineTypeHandler = (type: string) => ipcRenderer.invoke('engine:set-type', type);
const updatePluginsHandler = () => ipcRenderer.invoke('engine:update-plugins');
const getVersionHandler = () => ipcRenderer.invoke('app:version');

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

contextBridge.exposeInMainWorld('api', {
  start: startHandler,
  stop: stopHandler,
  restart: restartHandler,
  getStatus: getStatusHandler,
  getLogs: getLogsHandler,
  getStructuredLogs: getStructuredLogsHandler,
  clearLogs: clearLogsHandler,
  openUrl: openUrlHandler,
  openBrowser: openBrowserHandler,
  openStripeCheckout: openStripeCheckoutHandler,
  setEngineType: setEngineTypeHandler,
  updatePlugins: updatePluginsHandler,
  getVersion: getVersionHandler,
  onDownloadProgress: onDownloadProgressHandler,
  onLog: onLogHandler,
  onStatusChange: onStatusChangeHandler
});
