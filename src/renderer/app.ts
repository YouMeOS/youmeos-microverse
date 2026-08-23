import type { DesktopApi, EngineStatusInfo, DownloadProgress, LogEntry } from './types';
import { Architecture3DManager } from './architecture-3d';
import { initSmokeCanvas, type SmokeCanvasEngine } from './smoke-canvas';
import { QuakeConsoleManager } from './quake-console';
import { ServicesViewManager } from './services-view';
import { DownloadPanelManager } from './download-panel';
import { TelemetryViewManager } from './telemetry-view';
import { LicenseCloudManager } from './license-cloud-manager';
import { UpdateManager } from './update-manager';

const windowApi: DesktopApi = (window as unknown as { api: DesktopApi }).api;

// Splash Screen Elements
const splashScreenOverlay = document.getElementById('splash-screen-overlay') as HTMLElement | null;
const splash3dCanvasContainer = document.getElementById('splash-3d-canvas-container') as HTMLElement | null;
const splashHudToggle = document.getElementById('splash-hud-toggle') as HTMLButtonElement | null;
const splashHudClose = document.getElementById('splash-hud-close') as HTMLButtonElement | null;
const splashSidePanel = document.getElementById('splash-side-panel') as HTMLElement | null;
const splashStatusDotFloating = document.getElementById('splash-status-dot-floating') as HTMLSpanElement | null;
const splashEngineSelector = document.getElementById('splash-engine-selector') as HTMLSelectElement | null;
const splashStatusPill = document.getElementById('splash-status-pill') as HTMLElement | null;
const splashStatusDot = document.getElementById('splash-status-dot') as HTMLElement | null;
const splashStatusText = document.getElementById('splash-status-text') as HTMLElement | null;
const chkStaySplash = document.getElementById('chk-stay-splash') as HTMLInputElement | null;
const chkAutolaunch = document.getElementById('chk-autolaunch') as HTMLInputElement | null;
const splashBtnStart = document.getElementById('splash-btn-start') as HTMLButtonElement | null;
const splashBtnLaunch = document.getElementById('splash-btn-launch') as HTMLButtonElement | null;
const splashBtnBrowser = document.getElementById('splash-btn-browser') as HTMLButtonElement | null;
const splashBtnBlackbox = document.getElementById('splash-btn-blackbox') as HTMLButtonElement | null;
const splashBtnDashboard = document.getElementById('splash-btn-dashboard') as HTMLButtonElement | null;
const btnReturnSplash = document.getElementById('btn-return-splash') as HTMLButtonElement | null;
const btnOpenSplash = document.getElementById('btn-open-splash') as HTMLButtonElement | null;

// Header License Button
const btnHeaderLicense = document.getElementById('btn-header-license') as HTMLButtonElement | null;

// Dashboard 3D Canvas Container
const dash3dCanvasContainer = document.getElementById('dash-3d-canvas-container') as HTMLElement | null;

// Top Bar Elements
const overallStatusPill = document.getElementById('overall-status-pill') as HTMLElement | null;
const statusDot = document.getElementById('status-dot') as HTMLSpanElement | null;
const statusText = document.getElementById('status-text') as HTMLSpanElement | null;
const engineSelector = document.getElementById('engine-selector') as HTMLSelectElement | null;
const linkGateway = document.getElementById('link-gateway') as HTMLAnchorElement | null;
const btnCopyGateway = document.getElementById('btn-copy-gateway') as HTMLButtonElement | null;
const endpointChips = document.getElementById('endpoint-chips') as HTMLElement | null;
const versionTag = document.getElementById('version-tag') as HTMLElement | null;

// Tape Deck Transport & Aux Controls
const btnStart = document.getElementById('btn-start') as HTMLButtonElement | null;
const btnStop = document.getElementById('btn-stop') as HTMLButtonElement | null;
const btnRestart = document.getElementById('btn-restart') as HTMLButtonElement | null;
const btnOpenPortal = document.getElementById('btn-open-portal') as HTMLButtonElement | null;
const btnOpenBrowser = document.getElementById('btn-open-browser') as HTMLButtonElement | null;
const btnOpenBlackbox = document.getElementById('btn-open-blackbox') as HTMLButtonElement | null;
const btnArchOpenBlackbox = document.getElementById('btn-arch-open-blackbox') as HTMLButtonElement | null;
const btnUpdatePlugins = document.getElementById('btn-update-plugins') as HTMLButtonElement | null;

// Tab Elements
const tabTriggers = document.querySelectorAll<HTMLButtonElement>('.tabs-trigger');
const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');

// Sub-System Managers
let quakeConsole: QuakeConsoleManager | null = null;
let servicesView: ServicesViewManager | null = null;
let downloadPanel: DownloadPanelManager | null = null;
let telemetryView: TelemetryViewManager | null = null;
let architecture3D: Architecture3DManager | null = null;
let smokeCanvas: SmokeCanvasEngine | null = null;
let licenseCloudManager: LicenseCloudManager | null = null;
let updateManager: UpdateManager | null = null;

// Application State
let currentGatewayUrl = 'https://my.youmeos.com';
let isActionPending = false;
let currentCanvasParent: 'splash' | 'dashboard' = 'splash';
let hasAutoTransitioned = false;
let hasAutoLaunchedGateway = false;

function switchCanvasContainer(target: 'splash' | 'dashboard'): void {
  if (currentCanvasParent === target) return;
  const rendererDom = document.querySelector('canvas[data-engine="three.js"]') || splash3dCanvasContainer?.querySelector('canvas') || dash3dCanvasContainer?.querySelector('canvas');

  if (target === 'splash' && splash3dCanvasContainer) {
    if (rendererDom && rendererDom.parentElement !== splash3dCanvasContainer) {
      splash3dCanvasContainer.appendChild(rendererDom);
    }
    currentCanvasParent = 'splash';
  } else if (target === 'dashboard' && dash3dCanvasContainer) {
    if (rendererDom && rendererDom.parentElement !== dash3dCanvasContainer) {
      dash3dCanvasContainer.appendChild(rendererDom);
    }
    currentCanvasParent = 'dashboard';
  }

  setTimeout(() => architecture3D?.resize(), 60);
}

function openSplashScreen(): void {
  if (!splashScreenOverlay) return;
  splashScreenOverlay.classList.remove('hidden');
  switchCanvasContainer('splash');
  const isSideOpen = Boolean(splashSidePanel && !splashSidePanel.classList.contains('collapsed'));
  architecture3D?.setSidePanelOpen(isSideOpen);
  setTimeout(() => architecture3D?.resize(), 60);
}

function dismissSplashScreen(): void {
  if (!splashScreenOverlay) return;
  splashScreenOverlay.classList.add('hidden');
  switchCanvasContainer('dashboard');
}

function switchTab(targetTabId: string): void {
  tabTriggers.forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === targetTabId;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  tabContents.forEach(content => {
    const isTarget = content.id === targetTabId;
    content.classList.toggle('hidden', !isTarget);
    if (isTarget && targetTabId === 'tab-matrix') {
      switchCanvasContainer('dashboard');
    }
  });
}

function updateStatusUI(info: Partial<EngineStatusInfo>): void {
  const status = info.status || 'stopped';
  const isRunning = status === 'running';
  const isStopped = status === 'stopped';
  const isTransitioning = status === 'starting' || status === 'stopping';
  const isError = status === 'error';

  architecture3D?.setRunning(isRunning);

  // Update Top Bar & Splash Status Indicators
  if (overallStatusPill && statusDot && statusText) {
    overallStatusPill.className = `badge badge-status ${status}`;
    statusDot.className = `dot ${status}`;
    statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  }

  if (splashStatusPill && splashStatusDot && splashStatusText) {
    splashStatusPill.className = `badge badge-status ${status}`;
    splashStatusDot.className = `dot ${status}`;
    splashStatusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  }

  if (splashStatusDotFloating) {
    splashStatusDotFloating.className = `dot ${status}`;
  }

  if (info.url && linkGateway) {
    currentGatewayUrl = info.url;
    linkGateway.innerHTML = `
      ${info.url}
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
      </svg>
    `;
  }

  if (endpointChips && info.gateways && info.gateways.length > 0) {
    endpointChips.innerHTML = info.gateways.map(gw => `
      <a href="#" class="endpoint-chip ${gw.isPrimary ? 'is-primary' : ''}" data-url="${gw.url}" title="Open ${gw.url}">
        ${gw.label}
      </a>
    `).join('');

    endpointChips.querySelectorAll<HTMLAnchorElement>('.endpoint-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const url = chip.getAttribute('data-url');
        if (url) windowApi.openUrl(url);
      });
    });
  }

  if (info.engineType) {
    if (engineSelector && engineSelector.value !== info.engineType) {
      engineSelector.value = info.engineType;
    }
    if (splashEngineSelector && splashEngineSelector.value !== info.engineType) {
      splashEngineSelector.value = info.engineType;
    }
  }

  document.querySelectorAll('.brand-icon').forEach(icon => {
    icon.classList.toggle('spin', isTransitioning);
  });

  if (splashBtnStart) {
    if (isActionPending || isTransitioning) {
      splashBtnStart.disabled = true;
      splashBtnStart.className = 'splash-action-btn primary-btn';
      splashBtnStart.innerHTML = `
        <svg class="spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/>
        </svg>
        <span>Processing...</span>
      `;
    } else if (isRunning) {
      splashBtnStart.disabled = false;
      splashBtnStart.className = 'splash-action-btn stop-btn';
      splashBtnStart.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
        </svg>
        <span>Stop Cluster</span>
      `;
    } else {
      splashBtnStart.disabled = false;
      splashBtnStart.className = 'splash-action-btn primary-btn';
      splashBtnStart.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
        <span>Start Cluster</span>
      `;
    }
  }

  // Transport Button States
  if (btnStart && btnStop && btnRestart) {
    btnStart.disabled = isActionPending || isRunning || isTransitioning;
    btnStart.classList.toggle('is-active', isRunning);
    btnStop.disabled = isActionPending || isStopped || isTransitioning || isError;
    btnStop.classList.toggle('is-active', isStopped);
    btnRestart.disabled = isActionPending || isStopped || isTransitioning || isError;
  }

  if (isStopped) {
    hasAutoTransitioned = false;
    hasAutoLaunchedGateway = false;
  }

  // Auto-launch gateway in browser when service turns on
  const isAutolaunchEnabled = chkAutolaunch ? chkAutolaunch.checked : true;
  const shouldAutoLaunchGateway = isRunning && !hasAutoLaunchedGateway && isAutolaunchEnabled;
  if (shouldAutoLaunchGateway) {
    hasAutoLaunchedGateway = true;
    windowApi.openUrl(currentGatewayUrl);
  }

  // Auto-transition from splash on run if not locked
  const shouldAutoTransitionSplash = isRunning && !hasAutoTransitioned && !chkStaySplash?.checked;
  if (shouldAutoTransitionSplash) {
    hasAutoTransitioned = true;
    setTimeout(() => {
      if (!chkStaySplash?.checked) dismissSplashScreen();
    }, 1200);
  }
}

async function pollStatus(): Promise<void> {
  try {
    const info = await windowApi.getStatus();
    updateStatusUI(info);
    servicesView?.renderServices(info.services);
    servicesView?.renderModelView(info.services, info.engineType);
    telemetryView?.render(info.stackLayers);
    if (info.downloadProgress !== undefined) {
      downloadPanel?.render(info.downloadProgress);
    }
  } catch (e: any) {
    console.error('Failed to poll status', e);
    updateStatusUI({ status: 'error', message: e?.message });
  }
}

async function init(): Promise<void> {
  // 1. Initialize Sub-System Managers
  smokeCanvas = initSmokeCanvas('microverse-smoke-canvas');
  quakeConsole = new QuakeConsoleManager(windowApi);
  servicesView = new ServicesViewManager(
    windowApi,
    (cat) => quakeConsole?.openWithFilter(cat),
    () => currentGatewayUrl
  );
  downloadPanel = new DownloadPanelManager();
  telemetryView = new TelemetryViewManager();
  licenseCloudManager = new LicenseCloudManager(windowApi, (tier) => {
    architecture3D?.setCompassTier(tier);
  });
  updateManager = new UpdateManager(windowApi);

  // 2. Initialize Stay on Splash & Auto-launch Preferences
  if (chkStaySplash) {
    const savedStaySplash = localStorage.getItem('youmeos_stay_splash');
    chkStaySplash.checked = savedStaySplash !== null ? savedStaySplash === 'true' : true;
    chkStaySplash.addEventListener('change', () => {
      localStorage.setItem('youmeos_stay_splash', chkStaySplash.checked ? 'true' : 'false');
    });
  }

  if (chkAutolaunch) {
    const savedAutoLaunch = localStorage.getItem('youmeos_autolaunch');
    chkAutolaunch.checked = savedAutoLaunch !== null ? savedAutoLaunch === 'true' : true;
    chkAutolaunch.addEventListener('change', () => {
      localStorage.setItem('youmeos_autolaunch', chkAutolaunch.checked ? 'true' : 'false');
    });
  }

  // 3. Initialize 3D Architecture Canvas
  const initialContainer = splash3dCanvasContainer || dash3dCanvasContainer;
  if (initialContainer) {
    architecture3D = new Architecture3DManager({
      container: initialContainer,
      onLayerSelect: (layerId) => {
        if (layerId === 'compass') {
          licenseCloudManager?.openLicenseModal();
        } else if (layerId === 'portal' || layerId === 'server') {
          windowApi.openUrl(currentGatewayUrl);
        } else if (layerId === 'core' || layerId === 'database') {
          quakeConsole?.openWithFilter('core');
        } else {
          quakeConsole?.openWithFilter('network');
        }
      }
    });
    const isSideOpen = Boolean(splashSidePanel && !splashSidePanel.classList.contains('collapsed'));
    architecture3D.setSidePanelOpen(isSideOpen);
    if (licenseCloudManager) {
      architecture3D.setCompassTier(licenseCloudManager.getCurrentTier());
    }
  }

  // 4. Wire 3D Layer Hover & Click Highlights
  document.querySelectorAll<HTMLElement>('[data-layer]').forEach(card => {
    const layer = card.getAttribute('data-layer');
    card.addEventListener('mouseenter', () => {
      if (layer) architecture3D?.highlightLayer(layer);
    });
    card.addEventListener('mouseleave', () => {
      architecture3D?.highlightLayer(null);
    });
    card.addEventListener('click', () => {
      if (layer === 'compass') {
        licenseCloudManager?.openLicenseModal();
      } else if (layer === 'portal' || layer === 'server') {
        windowApi.openUrl(currentGatewayUrl);
      } else if (layer === 'core' || layer === 'database') {
        quakeConsole?.openWithFilter('core');
      } else {
        quakeConsole?.openWithFilter('network');
      }
    });
  });

  // 5. Header License Pill Handler
  btnHeaderLicense?.addEventListener('click', (e) => {
    e.stopPropagation();
    licenseCloudManager?.openLicenseModal();
  });

  // 6. Navigation & HUD Drawer Handlers
  splashHudToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isCollapsed = splashSidePanel?.classList.toggle('collapsed');
    architecture3D?.setSidePanelOpen(!isCollapsed);
  });

  splashHudClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    splashSidePanel?.classList.add('collapsed');
    architecture3D?.setSidePanelOpen(false);
  });

  splashBtnDashboard?.addEventListener('click', () => dismissSplashScreen());
  btnReturnSplash?.addEventListener('click', () => openSplashScreen());
  btnOpenSplash?.addEventListener('click', () => openSplashScreen());
  overallStatusPill?.addEventListener('click', () => quakeConsole?.toggleQuakeConsole());

  // 7. Tab Triggers
  tabTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (targetTab) switchTab(targetTab);
    });
  });

  // 7. Version Tag
  if (versionTag && windowApi.getVersion) {
    try {
      const ver = await windowApi.getVersion();
      if (ver) versionTag.textContent = `Microverse v${ver}`;
    } catch (e) {
      console.error('Failed to get version', e);
    }
  }

  // 8. Stream Listeners
  if (windowApi.onDownloadProgress) {
    windowApi.onDownloadProgress((prog: DownloadProgress | null) => downloadPanel?.render(prog));
  }

  if (windowApi.onLog) {
    windowApi.onLog((log: LogEntry) => quakeConsole?.handleIncomingLog(log));
  }

  if (windowApi.getStructuredLogs) {
    try {
      const initialLogs = await windowApi.getStructuredLogs({ tail: 200 });
      if (initialLogs && initialLogs.length > 0) {
        quakeConsole?.setInitialLogs(initialLogs);
      }
    } catch {}
  }

  if (windowApi.onStatusChange) {
    windowApi.onStatusChange((info: EngineStatusInfo) => {
      updateStatusUI(info);
      servicesView?.renderServices(info.services);
      servicesView?.renderModelView(info.services, info.engineType);
      telemetryView?.render(info.stackLayers);
      if (info.downloadProgress !== undefined) {
        downloadPanel?.render(info.downloadProgress);
      }
    });
  }

  // 9. Actions
  btnCopyGateway?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentGatewayUrl);
      if (btnCopyGateway) {
        const prev = btnCopyGateway.innerHTML;
        btnCopyGateway.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#4ade80" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => { btnCopyGateway.innerHTML = prev; }, 1500);
      }
    } catch {}
  });

  const startHandler = async () => {
    isActionPending = true;
    updateStatusUI({ status: 'starting' });
    try {
      await windowApi.start();
    } catch (e: any) {
      updateStatusUI({ status: 'error', message: e?.message || 'Start failed' });
    } finally {
      isActionPending = false;
      await pollStatus();
    }
  };
  btnStart?.addEventListener('click', startHandler);

  splashBtnStart?.addEventListener('click', async () => {
    const isRunning = splashBtnStart.textContent?.toLowerCase().includes('stop');
    if (isRunning) {
      await stopHandler();
    } else {
      splashSidePanel?.classList.add('collapsed');
      architecture3D?.setSidePanelOpen(false);
      await startHandler();
    }
  });

  const stopHandler = async () => {
    isActionPending = true;
    updateStatusUI({ status: 'stopping' });
    try {
      await windowApi.stop();
    } catch (e: any) {
      updateStatusUI({ status: 'error', message: e?.message || 'Stop failed' });
    } finally {
      isActionPending = false;
      await pollStatus();
    }
  };
  btnStop?.addEventListener('click', stopHandler);

  const restartHandler = async () => {
    isActionPending = true;
    updateStatusUI({ status: 'starting' });
    try {
      await windowApi.restart();
    } catch (e: any) {
      updateStatusUI({ status: 'error', message: e?.message || 'Restart failed' });
    } finally {
      isActionPending = false;
      await pollStatus();
    }
  };
  btnRestart?.addEventListener('click', restartHandler);

  const openPortalHandler = (e?: MouseEvent, targetUrl?: string) => {
    e?.preventDefault();
    const url = targetUrl || currentGatewayUrl;
    if (windowApi.openPortal) {
      windowApi.openPortal(url);
    } else {
      windowApi.openUrl(url);
    }
  };

  const openBrowserHandler = (e?: MouseEvent, targetUrl?: string) => {
    e?.preventDefault();
    const url = targetUrl || currentGatewayUrl;
    if (windowApi.openExternal) {
      windowApi.openExternal(url);
    } else {
      windowApi.openBrowser(url);
    }
  };

  linkGateway?.addEventListener('click', (e) => openBrowserHandler(e));
  btnOpenPortal?.addEventListener('click', (e) => openPortalHandler(e));
  btnOpenBrowser?.addEventListener('click', (e) => openBrowserHandler(e));
  splashBtnLaunch?.addEventListener('click', (e) => openPortalHandler(e));
  splashBtnBrowser?.addEventListener('click', (e) => openBrowserHandler(e));

  const openBlackboxHandler = (e?: MouseEvent, subfolder?: string) => {
    e?.preventDefault();
    if (windowApi.openBlackboxFolder) {
      windowApi.openBlackboxFolder(subfolder);
    }
  };

  btnOpenBlackbox?.addEventListener('click', (e) => openBlackboxHandler(e));
  splashBtnBlackbox?.addEventListener('click', (e) => openBlackboxHandler(e));
  btnArchOpenBlackbox?.addEventListener('click', (e) => openBlackboxHandler(e));

  const updatePluginsHandler = async () => {
    if (!btnUpdatePlugins) return;
    btnUpdatePlugins.disabled = true;
    btnUpdatePlugins.classList.add('is-updating');
    const labelSpan = btnUpdatePlugins.querySelector('.deck-label');
    const prevText = labelSpan ? labelSpan.textContent : btnUpdatePlugins.textContent;
    if (labelSpan) labelSpan.textContent = 'Updating...';
    try {
      quakeConsole?.openWithFilter('setup');
      const result = await windowApi.updatePlugins();
      const output = [result?.stdout, result?.stderr].filter(Boolean).join('\n');
      output.split('\n').filter(l => Boolean(l.trim())).forEach(line => {
        const isErr = line.toLowerCase().includes('error');
        const isWarn = line.toLowerCase().includes('warn') || line.toLowerCase().includes('problem');
        quakeConsole?.handleIncomingLog({
          service: 'setup',
          text: line,
          level: isErr ? 'error' : (isWarn ? 'warn' : 'info'),
          timestamp: Date.now()
        });
      });
    } catch (e: any) {
      quakeConsole?.handleIncomingLog({
        service: 'setup',
        text: `Composer Update Error: ${e?.message || e}`,
        level: 'error',
        timestamp: Date.now()
      });
    } finally {
      btnUpdatePlugins.disabled = false;
      btnUpdatePlugins.classList.remove('is-updating');
      if (labelSpan) labelSpan.textContent = prevText || 'Update';
      await pollStatus();
    }
  };
  btnUpdatePlugins?.addEventListener('click', updatePluginsHandler);

  const handleEngineChange = async (targetEngine: string) => {
    try {
      await windowApi.setEngineType(targetEngine);
      await pollStatus();
    } catch (e: any) {
      alert(`Failed to switch engine: ${e?.message}`);
    }
  };

  engineSelector?.addEventListener('change', () => {
    if (engineSelector) handleEngineChange(engineSelector.value);
  });
  splashEngineSelector?.addEventListener('change', () => {
    if (splashEngineSelector) handleEngineChange(splashEngineSelector.value);
  });

  // 10. Start Status Polling Loop
  let pollTimer: NodeJS.Timeout | null = null;
  const scheduleNextPoll = () => {
    if (pollTimer) clearTimeout(pollTimer);
    const interval = (btnStart?.disabled && !btnStop?.disabled) ? 3000 : 1200;
    pollTimer = setTimeout(async () => {
      await pollStatus();
      scheduleNextPoll();
    }, interval);
  };

  await pollStatus();
  scheduleNextPoll();

  const triggerRendererAutostart = async () => {
    try {
      const status = await windowApi.getStatus();
      const isStopped = status.status === 'stopped' || status.status === 'error';
      const isNotEmbedded = status.engineType !== 'embedded';

      if (isStopped) {
        if (isNotEmbedded) {
          await windowApi.setEngineType('embedded');
        }
        await startHandler();
      }
    } catch (err) {
      console.error('Failed to trigger renderer autostart:', err);
    }
  };

  triggerRendererAutostart();
}

init();
