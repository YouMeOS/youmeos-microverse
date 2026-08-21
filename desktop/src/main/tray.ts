import { Tray, Menu, BrowserWindow, nativeImage, app, shell } from 'electron';
import { EngineManager } from './engine/manager';
import path from 'path';

export function createTray(
  engineManager: EngineManager,
  mainWindow: BrowserWindow,
  onOpenPortal?: (url?: string) => void
): Tray {
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
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
    const quitHandler = () => app.quit();

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show Dashboard', click: showPanelHandler },
      { type: 'separator' },
      { label: 'Open YouMeOS Portal', click: openPortalHandler },
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
