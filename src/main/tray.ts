import { Tray, Menu, BrowserWindow, nativeImage, app, shell } from "electron";
import { EngineManager } from "./engine/manager";
import { getDevProjectDir } from "./engine/base";
import path from "path";
import fs from "fs";

export function createTray(
  engineManager: EngineManager,
  mainWindow: BrowserWindow,
  onOpenPortal?: (url?: string) => void,
): Tray {
  const possiblePaths = [
    path.join(__dirname, "..", "..", "assets", "icon.png"),
    path.join(__dirname, "..", "assets", "icon.png"),
    path.join(__dirname, "assets", "icon.png"),
    path.join(__dirname, "..", "renderer", "icon.png"),
    path.join(app.getAppPath(), "assets", "icon.png"),
    path.join(app.getAppPath(), "dist", "assets", "icon.png"),
    path.join(app.getAppPath(), "dist", "renderer", "icon.png"),
    path.join(process.resourcesPath, "assets", "icon.png"),
  ];

  let icon = nativeImage.createEmpty();
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const img = nativeImage.createFromPath(p);
      if (!img.isEmpty()) {
        icon = img;
        break;
      }
    }
  }
  let tray: Tray;
  if (process.platform === "darwin") {
    // macOS menu bar standard height is 22pt; resize to 18x18 to prevent stretching
    const macIcon = icon.resize({ width: 18, height: 18, quality: "best" });
    tray = new Tray(macIcon);
  } else if (process.platform === "linux") {
    // Linux libappindicator requires a real physical file path outside app.asar
    try {
      const userDataDir = app.getPath("userData");
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      const linuxTrayPath = path.join(userDataDir, "tray-icon.png");
      const resizedBuf = icon.resize({ width: 22, height: 22, quality: "best" }).toPNG();
      fs.writeFileSync(linuxTrayPath, resizedBuf);
      tray = new Tray(linuxTrayPath);
    } catch {
      tray = new Tray(icon.resize({ width: 22, height: 22, quality: "best" }));
    }
  } else {
    // Windows system tray standard icon size is 16x16
    const winIcon = icon.resize({ width: 16, height: 16, quality: "best" });
    tray = new Tray(winIcon);
  }

  const updateMenu = () => {
    const showPanelHandler = () => mainWindow.show();
    const startHandler = () => engineManager.start();
    const stopHandler = () => engineManager.stop();
    const restartHandler = () => engineManager.restart();
    const openPortalHandler = async () => {
      try {
        const st = await engineManager.status();
        const url = st.url || "https://my.youmeos.com";
        if (onOpenPortal) {
          onOpenPortal(url);
        } else {
          shell.openExternal(url);
        }
      } catch {
        const defaultUrl =
          engineManager.getPort && engineManager.getPort() !== 80
            ? `http://localhost:${engineManager.getPort()}`
            : "https://my.youmeos.com";
        if (onOpenPortal) {
          onOpenPortal(defaultUrl);
        } else {
          shell.openExternal(defaultUrl);
        }
      }
    };

    const openBrowserHandler = async () => {
      try {
        const st = await engineManager.status();
        const url = st.url || "https://my.youmeos.com";
        shell.openExternal(url);
      } catch {
        const defaultUrl =
          engineManager.getPort && engineManager.getPort() !== 80
            ? `http://localhost:${engineManager.getPort()}`
            : "https://my.youmeos.com";
        shell.openExternal(defaultUrl);
      }
    };

    const openBlackboxHandler = () => {
      const isProduction =
        app.isPackaged ||
        process.env.NODE_ENV === "production" ||
        __dirname.includes("app.asar");
      const projectDir = isProduction
        ? app.getPath("userData")
        : getDevProjectDir(__dirname);
      const wpDir = path.join(projectDir, "wp-content");
      const legacyDir = path.join(projectDir, "blackbox");
      shell.openPath(
        fs.existsSync(wpDir)
          ? wpDir
          : fs.existsSync(legacyDir)
            ? legacyDir
            : wpDir,
      );
    };

    const quitHandler = () => app.quit();

    const contextMenu = Menu.buildFromTemplate([
      { label: "Show Dashboard", click: showPanelHandler },
      { type: "separator" },
      { label: "Open Portal (Native App)", click: openPortalHandler },
      { label: "Open in Browser (Default Browser)", click: openBrowserHandler },
      {
        label: "Open Contents Folder (Plugins & Uploads)",
        click: openBlackboxHandler,
      },
      { type: "separator" },
      { label: "Start Engine", click: startHandler },
      { label: "Stop Engine", click: stopHandler },
      { label: "Restart Engine", click: restartHandler },
      { type: "separator" },
      { label: "Quit", click: quitHandler },
    ]);
    tray.setContextMenu(contextMenu);
  };

  tray.setToolTip("My YouMeOS Microverse");
  updateMenu();

  const clickHandler = () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  };
  tray.on("click", clickHandler);

  return tray;
}
