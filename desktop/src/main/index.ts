import { app, BrowserWindow, ipcMain, shell, Tray } from 'electron';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { EngineManager } from './engine/manager';
import {
  EngineType,
  DownloadProgress,
  LogEntry,
  EngineStatusInfo
} from './engine/types';
import { createTray } from './tray';

const execFileAsync = promisify(execFile);

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const engineManager = new EngineManager();
let isQuitting = false;

function isTrustedLocalHost(hostname: string): boolean {
  const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1';
  const isLocalDomain = hostname.endsWith('.localhost') || hostname.endsWith('.local');
  const isYoumeosDomain =
    hostname === 'my.youmeos.com' ||
    hostname.endsWith('.my.youmeos.com') ||
    hostname === 'my.umeos.com' ||
    hostname.endsWith('.my.umeos.com') ||
    hostname === 'microverse.youmeos.com' ||
    hostname.endsWith('.microverse.youmeos.com');

  return isLoopback || isLocalDomain || isYoumeosDomain;
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 680,
    height: 820,
    minWidth: 540,
    minHeight: 640,
    resizable: true,
    title: 'My YouMeOS Microverse',
    backgroundColor: '#0a0d14',
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  const closeHandler = (event: Electron.Event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  };

  const minimizeHandler = (event: Electron.Event) => {
    event.preventDefault();
    mainWindow?.hide();
  };

  mainWindow.on('close', closeHandler);
  mainWindow.on('minimize', minimizeHandler);
}

app.commandLine.appendSwitch('allow-insecure-localhost', 'true');

app.on('certificate-error', (event, _webContents, url, _error, _certificate, callback) => {
  const { hostname } = new URL(url);
  if (isTrustedLocalHost(hostname)) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

const readyHandler = async () => {
  await engineManager.init();

  const handleDownloadProgress = (progress: DownloadProgress | null) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('engine:download-progress', progress);
    }
  };
  engineManager.setProgressCallback(handleDownloadProgress);

  const handleLog = (log: LogEntry) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('engine:log', log);
    }
  };
  engineManager.setLogCallback(handleLog);

  const handleStatusChange = (status: EngineStatusInfo) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('engine:status-changed', status);
    }
  };
  engineManager.setStatusCallback(handleStatusChange);

  ipcMain.handle('engine:start', () => engineManager.start());
  ipcMain.handle('engine:stop', () => engineManager.stop());
  ipcMain.handle('engine:restart', () => engineManager.restart());
  ipcMain.handle('engine:status', () => engineManager.status());
  ipcMain.handle('engine:logs', (_, service, tail) => engineManager.logs(service, tail));
  ipcMain.handle('engine:set-type', (_, type: EngineType) => engineManager.setEngineType(type));
  ipcMain.handle('app:version', () => app.getVersion());

  ipcMain.handle('engine:update-plugins', async () => {
    const scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'update-plugins.sh');
    return execFileAsync('bash', [scriptPath]);
  });

  const openUrlHandler = (_: unknown, targetUrl?: string) => {
    shell.openExternal(targetUrl || 'https://my.youmeos.com');
  };
  ipcMain.handle('engine:open-url', openUrlHandler);
  ipcMain.handle('engine:open-browser', openUrlHandler);

  await createWindow();
  if (mainWindow) {
    tray = createTray(engineManager, mainWindow);
  }

  const activateHandler = () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  };
  app.on('activate', activateHandler);
};

app.whenReady().then(readyHandler);

const beforeQuitHandler = async (event: Electron.Event) => {
  if (!isQuitting) {
    event.preventDefault();
    isQuitting = true;
    try {
      await engineManager.stop();
    } catch (e) {
      console.error('Failed to stop engine on quit', e);
    }
    app.quit();
  }
};

app.on('before-quit', beforeQuitHandler);
