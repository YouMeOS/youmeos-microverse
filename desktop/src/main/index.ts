import { app, BrowserWindow, ipcMain, shell, Tray, session } from 'electron';
import path from 'path';
import fs from 'fs';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
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
import { UpdaterManager } from './updater';

const execFileAsync = promisify(execFile);

let mainWindow: BrowserWindow | null = null;
let portalWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const engineManager = new EngineManager();
const updaterManager = new UpdaterManager();
let isQuitting = false;
let isSessionConfigured = false;

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

function setupPortalSession(): void {
  if (isSessionConfigured) return;
  isSessionConfigured = true;

  const portalSession = session.fromPartition('persist:youmeos');

  const defaultUserAgent = portalSession.getUserAgent();
  const cleanedUserAgent = defaultUserAgent
    .replace(/Electron\/[0-9\.]+\s*/i, '')
    .replace(/youmeos-microverse\/[0-9\.]+\s*/i, '');
  portalSession.setUserAgent(cleanedUserAgent);

  portalSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };

    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];

    const cspKey = Object.keys(responseHeaders).find(k => k.toLowerCase() === 'content-security-policy');
    if (cspKey && responseHeaders[cspKey]) {
      responseHeaders[cspKey] = responseHeaders[cspKey].map(val =>
        val.replace(/frame-ancestors\s+[^;]+;?/gi, '')
      );
    }

    callback({ responseHeaders });
  });
}

export function openPortalWindow(targetUrl: string = 'https://my.youmeos.com'): BrowserWindow {
  if (portalWindow && !portalWindow.isDestroyed()) {
    if (targetUrl && portalWindow.webContents.getURL() !== targetUrl) {
      portalWindow.loadURL(targetUrl);
    }
    portalWindow.maximize();
    portalWindow.show();
    portalWindow.focus();
    return portalWindow;
  }

  setupPortalSession();

  portalWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 800,
    minHeight: 600,
    title: 'YouMeOS Portal',
    backgroundColor: '#0a0d14',
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      partition: 'persist:youmeos',
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    }
  });

  portalWindow.setMenu(null);
  portalWindow.maximize();

  portalWindow.webContents.setWindowOpenHandler(({ url }) => {
    const isOAuth =
      url.includes('discord.com') ||
      url.includes('discordapp.com') ||
      url.includes('google.com') ||
      url.includes('accounts.google.com') ||
      url.includes('facebook.com') ||
      url.includes('fb.com') ||
      url.includes('github.com') ||
      url.includes('appleid.apple.com');
    const isYoumeos = url.includes('youmeos.com') || url.includes('umeos.com') || url.includes('localhost');

    if (isOAuth || isYoumeos) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          parent: portalWindow || undefined,
          modal: false,
          autoHideMenuBar: true,
          webPreferences: {
            partition: 'persist:youmeos',
            nodeIntegration: false,
            contextIsolation: true
          }
        }
      };
    }

    shell.openExternal(url);
    return { action: 'deny' };
  });

  portalWindow.on('closed', () => {
    portalWindow = null;
  });

  portalWindow.loadURL(targetUrl);
  return portalWindow;
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 830,
    height: 860,
    minWidth: 680,
    minHeight: 700,
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
  ipcMain.handle('engine:structured-logs', (_, filter) => engineManager.getStructuredLogs(filter));
  ipcMain.handle('engine:clear-logs', () => engineManager.clearLogs());
  ipcMain.handle('engine:set-type', (_, type: EngineType) => engineManager.setEngineType(type));
  ipcMain.handle('app:version', () => app.getVersion());

  ipcMain.handle('engine:update-plugins', async () => {
    const isProduction = app.isPackaged || process.env.NODE_ENV === 'production';
    const scriptsDir = isProduction ? path.join(process.resourcesPath, 'scripts') : path.join(__dirname, '..', '..', '..', 'scripts');
    const scriptPath = path.join(scriptsDir, 'update-plugins.sh');
    return execFileAsync('bash', [scriptPath]);
  });

  const openPortalHandler = (_: unknown, targetUrl?: string) => {
    openPortalWindow(targetUrl || 'https://my.youmeos.com');
  };

  const openExternalHandler = async (_: unknown, targetUrl?: string) => {
    const url = targetUrl || 'https://my.youmeos.com';
    await shell.openExternal(url);
  };

  const openBlackboxFolderHandler = async (_: unknown, subfolder?: string) => {
    const isProduction = app.isPackaged || process.env.NODE_ENV === 'production' || __dirname.includes('app.asar');
    const projectDir = isProduction ? app.getPath('userData') : path.join(__dirname, '..', '..', '..');
    const blackboxDir = path.join(projectDir, 'blackbox');
    const targetDir = subfolder ? path.join(blackboxDir, subfolder) : blackboxDir;

    const dirsToEnsure = [
      blackboxDir,
      path.join(blackboxDir, 'plugins'),
      path.join(blackboxDir, 'uploads'),
      path.join(blackboxDir, 'mu-plugins'),
      path.join(blackboxDir, 'themes')
    ];

    dirsToEnsure.forEach(dir => {
      if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch {}
      }
    });

    return shell.openPath(targetDir);
  };

  ipcMain.handle('engine:open-portal', openPortalHandler);
  ipcMain.handle('engine:open-external', openExternalHandler);
  ipcMain.handle('engine:open-url', openPortalHandler);
  ipcMain.handle('engine:open-browser', openExternalHandler);
  ipcMain.handle('engine:open-blackbox-folder', openBlackboxFolderHandler);

  ipcMain.handle('updater:check', () => updaterManager.checkForUpdates());
  ipcMain.handle('updater:download', () => updaterManager.downloadUpdate());
  ipcMain.handle('updater:install', () => updaterManager.quitAndInstall());
  ipcMain.handle('updater:get-status', () => updaterManager.getStatus());

  // Stripe Checkout Popup Window with Automatic Completion Capture
  ipcMain.handle('checkout:open-stripe', async (_, checkoutUrl: string) => {
    return new Promise((resolve) => {
      let isCompleted = false;

      const checkoutWin = new BrowserWindow({
        width: 580,
        height: 820,
        minWidth: 460,
        minHeight: 600,
        parent: mainWindow || undefined,
        modal: true,
        title: 'Stripe Checkout - YouMeOS Sovereignty',
        backgroundColor: '#0a0d14',
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      const handleNavigation = (navUrl: string) => {
        try {
          if (!navUrl || isCompleted) return;
          const parsed = new URL(navUrl);
          const isSuccessUrl =
            parsed.pathname.includes('/checkout/success') ||
            parsed.pathname.includes('/callback/stripe') ||
            parsed.pathname.includes('/success') ||
            parsed.searchParams.get('checkout') === 'success' ||
            parsed.searchParams.get('status') === 'success';

          if (isSuccessUrl) {
            isCompleted = true;
            const tier = parsed.searchParams.get('tier') || parsed.searchParams.get('license_tier') || 'silver';
            const sessionId = parsed.searchParams.get('session_id') || `cs_live_${Date.now()}`;
            const key = parsed.searchParams.get('key') || parsed.searchParams.get('license_key') || `${tier.toUpperCase().slice(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;

            setTimeout(() => {
              if (!checkoutWin.isDestroyed()) {
                checkoutWin.close();
              }
              resolve({ success: true, tier, key, sessionId });
            }, 300);
          }
        } catch {
          // ignore parsing error for non-standard schemes
        }
      };

      checkoutWin.webContents.on('will-navigate', (_, navUrl) => handleNavigation(navUrl));
      checkoutWin.webContents.on('will-redirect', (_, navUrl) => handleNavigation(navUrl));
      checkoutWin.webContents.on('did-navigate', (_, navUrl) => handleNavigation(navUrl));

      checkoutWin.on('closed', () => {
        if (!isCompleted) {
          resolve({ success: false, reason: 'closed_by_user' });
        }
      });

      checkoutWin.loadURL(checkoutUrl);
    });
  });

  await createWindow();
  if (mainWindow) {
    tray = createTray(engineManager, mainWindow, (url) => openPortalWindow(url));
    updaterManager.setTargetWindow(mainWindow);

    if (app.isPackaged) {
      setTimeout(() => {
        updaterManager.checkForUpdates().catch(() => {});
      }, 8000);
    }
  }

  const activateHandler = () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  };
  app.on('activate', activateHandler);

  const autostartEmbeddedEngine = async () => {
    try {
      const statusInfo = await engineManager.status();
      const isStopped = statusInfo.status === 'stopped' || statusInfo.status === 'error';
      const isNotEmbedded = engineManager.currentType !== 'embedded';

      if (isStopped) {
        if (isNotEmbedded) {
          await engineManager.setEngineType('embedded');
        }
        await engineManager.start();
      }
    } catch (err) {
      console.error('Failed to autostart embedded engine on launch:', err);
    }
  };

  autostartEmbeddedEngine();
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
