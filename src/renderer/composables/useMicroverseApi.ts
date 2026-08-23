import type { DesktopApi } from '../types';

export function useMicroverseApi(): DesktopApi {
  const electronWindow = window as unknown as { api?: DesktopApi };
  if (electronWindow.api) {
    return electronWindow.api;
  }

  // Fallback for browser preview / development
  return {
    start: async () => {},
    stop: async () => {},
    restart: async () => {},
    getStatus: async () => ({
      status: 'stopped',
      engineType: 'embedded',
      services: [],
      url: 'http://localhost:8080',
      availableEngines: { docker: true, embedded: true }
    }),
    getLogs: async () => '',
    openUrl: async () => {},
    openBrowser: async () => {},
    minimizeToTray: async () => {},
    setEngineType: async () => {},
    updatePlugins: async () => ({ success: true, updatedCount: 0, totalCount: 0, details: [] })
  };
}
