import { autoUpdater, UpdateInfo as ElectronUpdateInfo, ProgressInfo } from 'electron-updater';
import { BrowserWindow } from 'electron';

export type UpdateState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export interface AppUpdateStatus {
  state: UpdateState;
  version?: string;
  releaseDate?: string;
  releaseNotes?: string;
  progress?: UpdateProgress;
  error?: string;
}

export class UpdaterManager {
  private currentStatus: AppUpdateStatus = { state: 'idle' };
  private targetWindow: BrowserWindow | null = null;

  constructor() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    this.registerEvents();
  }

  setTargetWindow(window: BrowserWindow | null): void {
    this.targetWindow = window;
  }

  private notifyRenderer(): void {
    const isWindowReady = this.targetWindow && !this.targetWindow.isDestroyed();
    if (isWindowReady) {
      this.targetWindow?.webContents.send('updater:status-changed', this.currentStatus);
    }
  }

  private registerEvents(): void {
    const handleChecking = () => {
      this.currentStatus = { state: 'checking' };
      this.notifyRenderer();
    };

    const handleAvailable = (info: ElectronUpdateInfo) => {
      const notes = typeof info.releaseNotes === 'string'
        ? info.releaseNotes
        : Array.isArray(info.releaseNotes)
        ? info.releaseNotes.map((n) => (typeof n === 'string' ? n : n.note || '')).join('\n')
        : undefined;

      this.currentStatus = {
        state: 'available',
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: notes
      };
      this.notifyRenderer();
    };

    const handleNotAvailable = (info: ElectronUpdateInfo) => {
      this.currentStatus = {
        state: 'not-available',
        version: info.version
      };
      this.notifyRenderer();
    };

    const handleError = (error: Error) => {
      this.currentStatus = {
        state: 'error',
        error: error?.message || 'Unknown update error'
      };
      this.notifyRenderer();
    };

    const handleProgress = (progressObj: ProgressInfo) => {
      this.currentStatus = {
        ...this.currentStatus,
        state: 'downloading',
        progress: {
          percent: Math.round(progressObj.percent),
          bytesPerSecond: progressObj.bytesPerSecond,
          transferred: progressObj.transferred,
          total: progressObj.total
        }
      };
      this.notifyRenderer();
    };

    const handleDownloaded = (info: ElectronUpdateInfo) => {
      this.currentStatus = {
        ...this.currentStatus,
        state: 'downloaded',
        version: info.version
      };
      this.notifyRenderer();
    };

    autoUpdater.on('checking-for-update', handleChecking);
    autoUpdater.on('update-available', handleAvailable);
    autoUpdater.on('update-not-available', handleNotAvailable);
    autoUpdater.on('error', handleError);
    autoUpdater.on('download-progress', handleProgress);
    autoUpdater.on('update-downloaded', handleDownloaded);
  }

  async checkForUpdates(): Promise<AppUpdateStatus> {
    try {
      this.currentStatus = { state: 'checking' };
      this.notifyRenderer();
      await autoUpdater.checkForUpdates();
      return this.currentStatus;
    } catch (error: any) {
      this.currentStatus = {
        state: 'error',
        error: error?.message || 'Failed to check for updates'
      };
      this.notifyRenderer();
      return this.currentStatus;
    }
  }

  async downloadUpdate(): Promise<void> {
    const isAvailable = this.currentStatus.state === 'available';
    if (!isAvailable) return;
    try {
      this.currentStatus = { ...this.currentStatus, state: 'downloading' };
      this.notifyRenderer();
      await autoUpdater.downloadUpdate();
    } catch (error: any) {
      this.currentStatus = {
        ...this.currentStatus,
        state: 'error',
        error: error?.message || 'Failed to download update'
      };
      this.notifyRenderer();
    }
  }

  quitAndInstall(): void {
    autoUpdater.quitAndInstall();
  }

  getStatus(): AppUpdateStatus {
    return this.currentStatus;
  }
}
