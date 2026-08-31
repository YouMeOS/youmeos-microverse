import {
  app,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  ipcMain,
  shell,
  Tray,
  session,
  nativeImage,
  dialog,
} from "electron";
import path from "path";
import fs from "fs";

app.setName("My YouMeOS Microverse");
if (process.platform === "win32") {
  app.setAppUserModelId("com.youmeos.microverse");
}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
import { execFile } from "child_process";
import { promisify } from "util";
import { EngineManager } from "./engine/manager";
import {
  EngineType,
  DownloadProgress,
  LogEntry,
  EngineStatusInfo,
} from "./engine/types";
import { createTray } from "./tray";
import { UpdaterManager } from "./updater";
import { DiagnosticsManager } from "./engine/diagnostics";
import { PluginUpdater } from "./engine/plugin-updater";
import { getDevProjectDir } from "./engine/base";

const execFileAsync = promisify(execFile);

export function getAppIcon(): Electron.NativeImage {
  const possiblePaths = [
    path.join(__dirname, "..", "..", "assets", "icon.png"),
    path.join(__dirname, "..", "assets", "icon.png"),
    path.join(__dirname, "assets", "icon.png"),
    path.join(process.resourcesPath || "", "assets", "icon.png"),
    path.join(app.getAppPath(), "assets", "icon.png"),
    path.join(app.getAppPath(), "dist", "renderer", "icon.png"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const img = nativeImage.createFromPath(p);
      if (!img.isEmpty()) return img;
    }
  }
  return nativeImage.createEmpty();
}

let mainWindow: BrowserWindow | null = null;
let portalWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const engineManager = new EngineManager();
const updaterManager = new UpdaterManager();

const isProductionEnv =
  app?.isPackaged ??
  (process.env.NODE_ENV === "production" || __dirname.includes("app.asar"));
const projectDir = isProductionEnv
  ? app.getPath("userData")
  : getDevProjectDir(__dirname);
const diagnosticsManager = new DiagnosticsManager(projectDir);

let isQuitting = false;
let isSessionConfigured = false;

function isTrustedLocalHost(hostname: string): boolean {
  const isLoopback = hostname === "localhost" || hostname === "127.0.0.1";
  const isLocalDomain =
    hostname.endsWith(".localhost") || hostname.endsWith(".local");
  const isYoumeosDomain =
    hostname === "my.youmeos.com" ||
    hostname.endsWith(".my.youmeos.com") ||
    hostname === "my.umeos.com" ||
    hostname.endsWith(".my.umeos.com") ||
    hostname === "microverse.youmeos.com" ||
    hostname.endsWith(".microverse.youmeos.com");

  return isLoopback || isLocalDomain || isYoumeosDomain;
}

function setupPortalSession(): void {
  if (isSessionConfigured) return;
  isSessionConfigured = true;

  const portalSession = session.fromPartition("persist:youmeos");

  const defaultUserAgent = portalSession.getUserAgent();
  const cleanedUserAgent = defaultUserAgent
    .replace(/Electron\/[0-9\.]+\s*/i, "")
    .replace(/youmeos-microverse\/[0-9\.]+\s*/i, "");
  portalSession.setUserAgent(cleanedUserAgent);

  portalSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };

    delete responseHeaders["x-frame-options"];
    delete responseHeaders["X-Frame-Options"];

    const cspKey = Object.keys(responseHeaders).find(
      (k) => k.toLowerCase() === "content-security-policy",
    );
    if (cspKey && responseHeaders[cspKey]) {
      responseHeaders[cspKey] = responseHeaders[cspKey].map((val) =>
        val.replace(/frame-ancestors\s+[^;]+;?/gi, ""),
      );
    }

    callback({ responseHeaders });
  });
}

export function openPortalWindow(
  targetUrl: string = "https://my.youmeos.com",
): BrowserWindow {
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

  const appIcon = getAppIcon();

  portalWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 800,
    minHeight: 600,
    title: "YouMeOS Portal",
    backgroundColor: "#0a0d14",
    icon: appIcon,
    autoHideMenuBar: true,
    webPreferences: {
      partition: "persist:youmeos",
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
    },
  });

  if (!appIcon.isEmpty()) {
    portalWindow.setIcon(appIcon);
  }

  portalWindow.setMenu(null);
  portalWindow.maximize();

  portalWindow.webContents.setWindowOpenHandler(({ url }) => {
    const isOAuth =
      url.includes("discord.com") ||
      url.includes("discordapp.com") ||
      url.includes("google.com") ||
      url.includes("accounts.google.com") ||
      url.includes("facebook.com") ||
      url.includes("fb.com") ||
      url.includes("github.com") ||
      url.includes("appleid.apple.com");
    const isYoumeos =
      url.includes("youmeos.com") ||
      url.includes("umeos.com") ||
      url.includes("localhost");

    if (isOAuth || isYoumeos) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          parent: portalWindow || undefined,
          modal: false,
          autoHideMenuBar: true,
          webPreferences: {
            partition: "persist:youmeos",
            nodeIntegration: false,
            contextIsolation: true,
          },
        },
      };
    }

    shell.openExternal(url);
    return { action: "deny" };
  });

  portalWindow.on("closed", () => {
    portalWindow = null;
  });

  portalWindow.loadURL(targetUrl);
  return portalWindow;
}

async function createWindow(): Promise<void> {
  const appIcon = getAppIcon();

  mainWindow = new BrowserWindow({
    width: 860,
    height: 860,
    minWidth: 700,
    minHeight: 700,
    resizable: true,
    title: "My YouMeOS Microverse",
    backgroundColor: "#0a0d14",
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "index.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (!appIcon.isEmpty()) {
    mainWindow.setIcon(appIcon);
  }

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
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

  mainWindow.on("close", closeHandler);
  mainWindow.on("minimize", minimizeHandler);
}

app.commandLine.appendSwitch("allow-insecure-localhost", "true");

app.on(
  "certificate-error",
  (event, _webContents, url, _error, _certificate, callback) => {
    const { hostname } = new URL(url);
    if (isTrustedLocalHost(hostname)) {
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  },
);

const readyHandler = async () => {
  await engineManager.init();

  const handleDownloadProgress = (progress: DownloadProgress | null) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("engine:download-progress", progress);
    }
  };
  engineManager.setProgressCallback(handleDownloadProgress);

  const handleLog = (log: LogEntry) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("engine:log", log);
    }
  };
  engineManager.setLogCallback(handleLog);

  const handleStatusChange = (status: EngineStatusInfo) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("engine:status-changed", status);
    }
  };
  engineManager.setStatusCallback(handleStatusChange);

  ipcMain.handle("engine:start", () => engineManager.start());
  ipcMain.handle("engine:stop", () => engineManager.stop());
  ipcMain.handle("engine:restart", () => engineManager.restart());
  ipcMain.handle("engine:status", () => engineManager.status());
  ipcMain.handle("engine:logs", (_, service, tail) =>
    engineManager.logs(service, tail),
  );
  ipcMain.handle("engine:structured-logs", (_, filter) =>
    engineManager.getStructuredLogs(filter),
  );
  ipcMain.handle("engine:clear-logs", () => engineManager.clearLogs());
  ipcMain.handle("engine:set-type", (_, type: EngineType) =>
    engineManager.setEngineType(type),
  );
  ipcMain.handle("engine:set-port", (_, port: number) =>
    engineManager.setPort(port),
  );
  ipcMain.handle("engine:get-port", () => engineManager.getPort());
  ipcMain.handle("engine:set-homepage-mode", (_, mode: string) =>
    engineManager.setHomepageMode(mode),
  );
  ipcMain.handle("engine:get-homepage-mode", () =>
    engineManager.getHomepageMode(),
  );
  ipcMain.handle("app:version", () => app.getVersion());

  ipcMain.handle("engine:update-plugins", async () => {
    const isProduction =
      app.isPackaged ||
      process.env.NODE_ENV === "production" ||
      __dirname.includes("app.asar");
    const projectDir = isProduction
      ? app.getPath("userData")
      : getDevProjectDir(__dirname);
    const updater = new PluginUpdater(projectDir, (log) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("engine:log", log);
      }
    });
    return await updater.updateAll();
  });

  const openPortalHandler = (_: unknown, targetUrl?: string) => {
    const activePort = engineManager.getPort ? engineManager.getPort() : 80;
    const defaultUrl =
      activePort === 80
        ? "https://my.youmeos.com"
        : `http://localhost:${activePort}`;
    openPortalWindow(targetUrl || defaultUrl);
  };

  const openExternalHandler = async (_: unknown, targetUrl?: string) => {
    const activePort = engineManager.getPort ? engineManager.getPort() : 80;
    const defaultUrl =
      activePort === 80
        ? "https://my.youmeos.com"
        : `http://localhost:${activePort}`;
    const url = targetUrl || defaultUrl;
    await shell.openExternal(url);
  };

  const openContentFolderHandler = async (_: unknown, subfolder?: string) => {
    const isProduction =
      app.isPackaged ||
      process.env.NODE_ENV === "production" ||
      __dirname.includes("app.asar");
    const projectDir = isProduction
      ? app.getPath("userData")
      : getDevProjectDir(__dirname);
    const legacyDir = path.join(projectDir, "blackbox");
    const wpContentDir = path.join(projectDir, "wp-content");
    const baseDir = fs.existsSync(wpContentDir)
      ? wpContentDir
      : fs.existsSync(legacyDir)
        ? legacyDir
        : wpContentDir;
    const targetDir = subfolder ? path.join(baseDir, subfolder) : baseDir;

    const dirsToEnsure = [
      baseDir,
      path.join(baseDir, "plugins"),
      path.join(baseDir, "uploads"),
      path.join(baseDir, "mu-plugins"),
      path.join(baseDir, "themes"),
    ];

    dirsToEnsure.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
        } catch {}
      }
    });

    return shell.openPath(targetDir);
  };

  ipcMain.handle("engine:open-portal", openPortalHandler);
  ipcMain.handle("engine:open-external", openExternalHandler);
  ipcMain.handle("engine:open-url", openPortalHandler);
  ipcMain.handle("engine:open-browser", openExternalHandler);
  ipcMain.handle("engine:open-blackbox-folder", openContentFolderHandler);
  ipcMain.handle("engine:open-content-folder", openContentFolderHandler);
  ipcMain.handle("window:minimize-to-tray", () => {
    mainWindow?.hide();
  });

  // Diagnostic & Auto-Login Handlers
  ipcMain.handle(
    "engine:auto-login",
    async (_, userId?: number, redirectTo?: string) => {
      const activePort = engineManager.getPort ? engineManager.getPort() : 80;
      const targetRedirect =
        redirectTo || "/wp-admin/admin.php?page=xophz-compass#";
      const result = await diagnosticsManager.generateAutoLoginUrl(
        userId || 1,
        targetRedirect,
        activePort,
      );
      if (result.success && result.url) {
        openPortalWindow(result.url);
      }
      return result;
    },
  );

  ipcMain.handle(
    "engine:reset-password",
    async (_, userId?: number, customPassword?: string) => {
      return diagnosticsManager.resetPassword(userId || 1, customPassword);
    },
  );

  ipcMain.handle("engine:db-health", async () => {
    return diagnosticsManager.checkDatabaseHealth();
  });
  ipcMain.handle("engine:reset-database", async () => {
    return diagnosticsManager.resetDatabase();
  });

  ipcMain.handle("updater:check", () => updaterManager.checkForUpdates());
  ipcMain.handle("updater:download", () => updaterManager.downloadUpdate());
  ipcMain.handle("updater:install", () => updaterManager.quitAndInstall());
  ipcMain.handle("updater:get-status", () => updaterManager.getStatus());

  ipcMain.handle("diagnostics:list-users", () =>
    diagnosticsManager.listUsers(),
  );
  ipcMain.handle(
    "diagnostics:reset-password",
    (_, userId: number, newPassword?: string) =>
      diagnosticsManager.resetPassword(userId, newPassword),
  );
  ipcMain.handle(
    "diagnostics:auto-login",
    async (_, userId?: number, redirectTo?: string) => {
      const activePort = engineManager.getPort ? engineManager.getPort() : 80;
      const result = await diagnosticsManager.generateAutoLoginUrl(
        userId || 1,
        redirectTo || "/wp-admin/",
        activePort,
      );
      if (result.success && result.url) {
        openPortalWindow(result.url);
      }
      return result;
    },
  );
  ipcMain.handle("diagnostics:flush-session", () =>
    diagnosticsManager.flushPortalSession(),
  );
  ipcMain.handle("diagnostics:db-health", () =>
    diagnosticsManager.checkDatabaseHealth(),
  );
  ipcMain.handle("diagnostics:reset-database", async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: "warning",
        buttons: ["Confirm & Wipe Database", "Cancel"],
        defaultId: 1,
        cancelId: 1,
        title: "Database Reset (Destructive)",
        message: "Are you sure you want to reset the database?",
        detail:
          "WARNING: This action will permanently erase all SQLite database tables, users, and options. This cannot be undone!",
      });

      if (response !== 0) {
        return { success: false, cancelled: true };
      }
    }
    return diagnosticsManager.resetDatabase();
  });

  // Stripe Checkout Popup Window with Automatic Completion Capture
  ipcMain.handle("checkout:open-stripe", async (_, checkoutUrl: string) => {
    return new Promise((resolve) => {
      let isCompleted = false;

      const appIcon = getAppIcon();

      const checkoutWin = new BrowserWindow({
        width: 580,
        height: 820,
        minWidth: 460,
        minHeight: 600,
        parent: mainWindow || undefined,
        modal: true,
        title: "Stripe Checkout - YouMeOS",
        backgroundColor: "#0a0d14",
        icon: appIcon,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      if (!appIcon.isEmpty()) {
        checkoutWin.setIcon(appIcon);
      }

      const handleNavigation = (navUrl: string) => {
        try {
          if (!navUrl || isCompleted) return;
          const parsed = new URL(navUrl);
          const isSuccessUrl =
            parsed.pathname.includes("/checkout/success") ||
            parsed.pathname.includes("/callback/stripe") ||
            parsed.pathname.includes("/success") ||
            parsed.searchParams.get("checkout") === "success" ||
            parsed.searchParams.get("status") === "success";

          if (isSuccessUrl) {
            isCompleted = true;
            const tier =
              parsed.searchParams.get("tier") ||
              parsed.searchParams.get("license_tier") ||
              "silver";
            const sessionId =
              parsed.searchParams.get("session_id") || `cs_live_${Date.now()}`;
            const key =
              parsed.searchParams.get("key") ||
              parsed.searchParams.get("license_key") ||
              `${tier.toUpperCase().slice(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;

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

      checkoutWin.webContents.on("will-navigate", (_, navUrl) =>
        handleNavigation(navUrl),
      );
      checkoutWin.webContents.on("will-redirect", (_, navUrl) =>
        handleNavigation(navUrl),
      );
      checkoutWin.webContents.on("did-navigate", (_, navUrl) =>
        handleNavigation(navUrl),
      );

      checkoutWin.on("closed", () => {
        if (!isCompleted) {
          resolve({ success: false, reason: "closed_by_user" });
        }
      });

      checkoutWin.loadURL(checkoutUrl);
    });
  });

  await createWindow();
  if (mainWindow) {
    tray = createTray(engineManager, mainWindow, (url) =>
      openPortalWindow(url),
    );
    updaterManager.setTargetWindow(mainWindow);

    const isMac = process.platform === "darwin";
    const menuTemplate: MenuItemConstructorOptions[] = [
      ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                { role: "about" as const },
                { type: "separator" as const },
                { role: "services" as const },
                { type: "separator" as const },
                { role: "hide" as const },
                { role: "hideOthers" as const },
                { role: "unhide" as const },
                { type: "separator" as const },
                { role: "quit" as const },
              ],
            },
          ]
        : []),
      {
        label: "File",
        submenu: [
          {
            label: "Open in Browser",
            accelerator: "CmdOrCtrl+O",
            click: () => {
              shell.openExternal("https://my.youmeos.com");
            },
          },
          {
            label: "Open Native App",
            accelerator: "CmdOrCtrl+Shift+P",
            click: () => {
              openPortalWindow("https://my.youmeos.com");
            },
          },
          {
            label: "Open Contents Folder",
            click: () => {
              const pDir =
                app.isPackaged ||
                process.env.NODE_ENV === "production" ||
                __dirname.includes("app.asar")
                  ? app.getPath("userData")
                  : getDevProjectDir(__dirname);
              const wpDir = path.join(pDir, "wp-content");
              const legacyDir = path.join(pDir, "blackbox");
              shell.openPath(
                fs.existsSync(wpDir)
                  ? wpDir
                  : fs.existsSync(legacyDir)
                    ? legacyDir
                    : wpDir,
              );
            },
          },
          { type: "separator" },
          isMac ? { role: "close" } : { role: "quit" },
        ],
      },
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
        ],
      },
      {
        label: "Engine",
        submenu: [
          {
            label: "Start Engine",
            click: () => engineManager.start(),
          },
          {
            label: "Stop Engine",
            click: () => engineManager.stop(),
          },
          {
            label: "Restart Engine",
            click: () => engineManager.restart(),
          },
        ],
      },
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forceReload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
      {
        label: "Window",
        submenu: [
          { role: "minimize" },
          ...(isMac
            ? [
                { type: "separator" as const },
                { role: "front" as const },
                { type: "separator" as const },
                { role: "window" as const },
              ]
            : [{ role: "close" as const }]),
        ],
      },
      {
        role: "help",
        submenu: [
          {
            label: "Check for Updates...",
            click: () => updaterManager.checkForUpdates(),
          },
          {
            label: "Documentation & Support",
            click: () => shell.openExternal("https://my.youmeos.com"),
          },
        ],
      },
    ];

    const appMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(appMenu);

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
  app.on("activate", activateHandler);

  const autostartEmbeddedEngine = async () => {
    try {
      const statusInfo = await engineManager.status();
      const isStopped =
        statusInfo.status === "stopped" || statusInfo.status === "error";
      const isNotEmbedded = engineManager.currentType !== "embedded";

      if (isStopped) {
        if (isNotEmbedded) {
          await engineManager.setEngineType("embedded");
        }
        await engineManager.start();
      }
    } catch (err) {
      console.error("Failed to autostart embedded engine on launch:", err);
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
      console.error("Failed to stop engine on quit", e);
    }
    app.quit();
  }
};

app.on("before-quit", beforeQuitHandler);
