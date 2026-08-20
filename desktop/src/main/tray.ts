import { Tray, Menu, BrowserWindow, nativeImage, app, shell } from 'electron';
import { EngineManager } from './engine/manager';
import path from 'path';

export function createTray(engineManager: EngineManager, mainWindow: BrowserWindow): Tray {
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(icon);

  const updateMenu = () => {
    const showPanelHandler = () => mainWindow.show();
    const startHandler = () => engineManager.start();
    const stopHandler = () => engineManager.stop();
    const restartHandler = () => engineManager.restart();
    const openBrowserHandler = async () => {
      try {
        const st = await engineManager.status();
        shell.openExternal(st.url || 'https://my.youmeos.com');
      } catch {
        shell.openExternal('https://my.youmeos.com');
      }
    };
    const quitHandler = () => app.quit();

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show Panel', click: showPanelHandler },
      { type: 'separator' },
      { label: 'Start Engine', click: startHandler },
      { label: 'Stop Engine', click: stopHandler },
      { label: 'Restart Engine', click: restartHandler },
      { type: 'separator' },
      { label: 'Open Browser', click: openBrowserHandler },
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
