import { autoUpdater, UpdateInfo as ElectronUpdateInfo, ProgressInfo } from 'electron-updater';
import { BrowserWindow, app, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import semver from 'semver';

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
  downloadUrl?: string;
}

export class UpdaterManager {
  private currentStatus: AppUpdateStatus = { state: 'idle' };
  private targetWindow: BrowserWindow | null = null;
  private pendingDownloadUrl: string | null = null;
  private downloadedFilePath: string | null = null;

  constructor() {
    try {
      autoUpdater.autoDownload = false;
      autoUpdater.autoInstallOnAppQuit = true;
      this.registerEvents();
    } catch (err: any) {
      console.warn('Auto-updater disabled or version mismatch:', err?.message || err);
      this.currentStatus = { state: 'idle', error: err?.message };
    }
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

  private async checkGitHubReleases(): Promise<AppUpdateStatus | null> {
    try {
      const res = await fetch('https://api.github.com/repos/YouMeOS/youmeos-microverse/releases/latest', {
        headers: {
          'User-Agent': 'YouMeOS-Microverse-App',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!res.ok) return null;
      const data: any = await res.json();
      if (!data?.tag_name) return null;

      const remoteTag = data.tag_name.replace(/^v/, '');
      const currentVersion = app.getVersion();

      if (semver.gt(remoteTag, currentVersion)) {
        const assets: any[] = data.assets || [];
        let matchingAsset: any = null;
        if (process.platform === 'darwin') {
          matchingAsset = assets.find((a) => a.name.endsWith('.dmg') && (process.arch === 'arm64' ? a.name.includes('arm64') : a.name.includes('x64')))
            || assets.find((a) => a.name.endsWith('.dmg'));
        } else if (process.platform === 'win32') {
          matchingAsset = assets.find((a) => a.name.endsWith('.exe')) || assets.find((a) => a.name.endsWith('.msi'));
        } else {
          matchingAsset = assets.find((a) => a.name.endsWith('.AppImage')) || assets.find((a) => a.name.endsWith('.deb'));
        }

        this.pendingDownloadUrl = matchingAsset?.browser_download_url || data.html_url;

        return {
          state: 'available',
          version: remoteTag,
          releaseDate: data.published_at,
          releaseNotes: data.body || 'New release available',
          downloadUrl: this.pendingDownloadUrl || undefined
        };
      }

      return {
        state: 'not-available',
        version: currentVersion
      };
    } catch {
      return null;
    }
  }

  async checkForUpdates(): Promise<AppUpdateStatus> {
    this.currentStatus = { state: 'checking' };
    this.notifyRenderer();

    // 1. Direct GitHub Releases query
    const ghStatus = await this.checkGitHubReleases();
    if (ghStatus && ghStatus.state === 'available') {
      this.currentStatus = ghStatus;
      this.notifyRenderer();
      return this.currentStatus;
    }

    // 2. electron-updater check
    try {
      await autoUpdater.checkForUpdates();
      if (this.currentStatus.state === 'checking') {
        if (ghStatus) {
          this.currentStatus = ghStatus;
        } else {
          this.currentStatus = {
            state: 'not-available',
            version: app.getVersion()
          };
        }
        this.notifyRenderer();
      }
      return this.currentStatus;
    } catch (error: any) {
      if (ghStatus) {
        this.currentStatus = ghStatus;
      } else {
        this.currentStatus = {
          state: 'error',
          error: error?.message || 'Failed to check for updates'
        };
      }
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

      // On Windows with NSIS, attempt autoUpdater first
      if (process.platform === 'win32') {
        try {
          await autoUpdater.downloadUpdate();
          return;
        } catch {}
      }

      if (this.pendingDownloadUrl) {
        await this.downloadFileDirectly(this.pendingDownloadUrl);
      } else {
        throw new Error('Download URL not found');
      }
    } catch (error: any) {
      this.currentStatus = {
        ...this.currentStatus,
        state: 'error',
        error: error?.message || 'Failed to download update'
      };
      this.notifyRenderer();
    }
  }

  private async downloadFileDirectly(url: string): Promise<void> {
    const filename = path.basename(new URL(url).pathname);
    const downloadDir = app.getPath('downloads');
    const destPath = path.join(downloadDir, filename);
    this.downloadedFilePath = destPath;

    const res = await fetch(url);
    if (!res.ok || !res.body) {
      throw new Error(`Failed to download asset: HTTP ${res.status}`);
    }

    const contentLength = Number(res.headers.get('content-length')) || 0;
    let transferred = 0;
    let lastTime = Date.now();
    let lastTransferred = 0;

    const fileStream = fs.createWriteStream(destPath);
    const reader = res.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fileStream.write(Buffer.from(value));
      transferred += value.length;

      const now = Date.now();
      if (now - lastTime >= 400) {
        const bytesPerSecond = Math.round(((transferred - lastTransferred) / (now - lastTime)) * 1000);
        lastTime = now;
        lastTransferred = transferred;

        const percent = contentLength > 0 ? Math.round((transferred / contentLength) * 100) : 0;
        this.currentStatus = {
          ...this.currentStatus,
          state: 'downloading',
          progress: { percent, bytesPerSecond, transferred, total: contentLength }
        };
        this.notifyRenderer();
      }
    }

    await new Promise<void>((resolve, reject) => {
      fileStream.end(() => resolve());
      fileStream.on('error', reject);
    });

    this.currentStatus = {
      ...this.currentStatus,
      state: 'downloaded',
      version: this.currentStatus.version
    };
    this.notifyRenderer();
  }

  quitAndInstall(): void {
    if (this.downloadedFilePath && fs.existsSync(this.downloadedFilePath)) {
      shell.openPath(this.downloadedFilePath);
      setTimeout(() => {
        app.quit();
      }, 1000);
    } else {
      try {
        autoUpdater.quitAndInstall();
      } catch {
        app.quit();
      }
    }
  }

  getStatus(): AppUpdateStatus {
    return this.currentStatus;
  }
}
