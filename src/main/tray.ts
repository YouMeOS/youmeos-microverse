import { Tray, Menu, BrowserWindow, nativeImage, app, shell } from 'electron';
import { EngineManager } from './engine/manager';
import { getDevProjectDir } from './engine/base';
import path from 'path';
import fs from 'fs';

export function createTray(
  engineManager: EngineManager,
  mainWindow: BrowserWindow,
  onOpenPortal?: (url?: string) => void
): Tray {
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'assets', 'icon.png'),
    path.join(__dirname, '..', 'assets', 'icon.png'),
    path.join(__dirname, 'assets', 'icon.png'),
    path.join(__dirname, '..', 'renderer', 'icon.png'),
    path.join(app.getAppPath(), 'assets', 'icon.png'),
    path.join(app.getAppPath(), 'dist', 'assets', 'icon.png'),
    path.join(app.getAppPath(), 'dist', 'renderer', 'icon.png'),
    path.join(process.resourcesPath, 'assets', 'icon.png')
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
  const tray = new Tray(icon);

  const updateMenu = () => {
    const showPanelHandler = () => mainWindow.show();
    const startHandler = () => engineManager.start();
    const stopHandler = () => engineManager.stop();
    const restartHandler = () => engineManager.restart();
    const openPortalHandler = async () => {
      try {
        const st = await engineManager.status();
        const url = st.url || 'https://my.youmeos.com';
        if (onOpenPortal) {
          onOpenPortal(url);
        } else {
          shell.openExternal(url);
        }
      } catch {
        if (onOpenPortal) {
          onOpenPortal('https://my.youmeos.com');
        } else {
          shell.openExternal('https://my.youmeos.com');
        }
      }
    };

    const openBrowserHandler = async () => {
      try {
        const st = await engineManager.status();
        const url = st.url || 'https://my.youmeos.com';
        shell.openExternal(url);
      } catch {
        shell.openExternal('https://my.youmeos.com');
      }
    };

    const openBlackboxHandler = () => {
      const isProduction = app.isPackaged || process.env.NODE_ENV === 'production' || __dirname.includes('app.asar');
      const projectDir = isProduction ? app.getPath('userData') : getDevProjectDir(__dirname);
      const blackboxDir = path.join(projectDir, 'blackbox');
      shell.openPath(blackboxDir);
    };

    const quitHandler = () => app.quit();

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show Dashboard', click: showPanelHandler },
      { type: 'separator' },
      { label: 'Open Portal (Native Window)', click: openPortalHandler },
      { label: 'Open in Browser (Default Browser)', click: openBrowserHandler },
      { label: 'Open Blackbox Folder (Plugins & Uploads)', click: openBlackboxHandler },
      { type: 'separator' },
      { label: 'Start Engine', click: startHandler },
      { label: 'Stop Engine', click: stopHandler },
      { label: 'Restart Engine', click: restartHandler },
      { type: 'separator' },
      { label: 'Quit', click: quitHandler }
    ]);
    tray.setContextMenu(contextMenu);
  };

  tray.setToolTip('My YouMeOS Microverse');
  updateMenu();

  const clickHandler = () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  };
  tray.on('click', clickHandler);

  return tray;
}
