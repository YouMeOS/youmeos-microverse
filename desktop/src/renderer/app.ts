import type {
  DownloadProgress,
  ServiceInfo,
  EngineStatusInfo,
  StackLayerStatus,
  LogEntry,
  LogFilterOptions
} from '../main/engine/types';
import { Architecture3DManager } from './architecture-3d';
import { initSmokeCanvas, type SmokeCanvasEngine } from './smoke-canvas';

interface DesktopApi {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  restart: () => Promise<void>;
  getStatus: () => Promise<EngineStatusInfo>;
  getLogs: (service?: string, tail?: number) => Promise<string>;
  getStructuredLogs?: (filter?: LogFilterOptions) => Promise<LogEntry[]>;
  clearLogs?: () => Promise<void>;
  openUrl: (url?: string) => Promise<void>;
  openBrowser: () => Promise<void>;
  setEngineType: (type: string) => Promise<void>;
  updatePlugins: () => Promise<{ stdout?: string; stderr?: string }>;
  getVersion?: () => Promise<string>;
  onDownloadProgress?: (callback: (progress: DownloadProgress | null) => void) => () => void;
  onLog?: (callback: (log: LogEntry) => void) => () => void;
  onStatusChange?: (callback: (status: EngineStatusInfo) => void) => () => void;
}

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
const splashVerificationSummary = document.getElementById('splash-verification-summary') as HTMLElement | null;
const chkStaySplash = document.getElementById('chk-stay-splash') as HTMLInputElement | null;
const splashBtnStart = document.getElementById('splash-btn-start') as HTMLButtonElement | null;
const splashBtnLaunch = document.getElementById('splash-btn-launch') as HTMLButtonElement | null;
const splashBtnDashboard = document.getElementById('splash-btn-dashboard') as HTMLButtonElement | null;
const btnReturnSplash = document.getElementById('btn-return-splash') as HTMLButtonElement | null;
const btnOpenSplash = document.getElementById('btn-open-splash') as HTMLButtonElement | null;

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
const btnOpenBrowser = document.getElementById('btn-open-browser') as HTMLButtonElement | null;
const btnUpdatePlugins = document.getElementById('btn-update-plugins') as HTMLButtonElement | null;
const btnToggleLogs = document.getElementById('btn-toggle-logs') as HTMLButtonElement | null;

// Tab Elements
const tabTriggers = document.querySelectorAll<HTMLButtonElement>('.tabs-trigger');
const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');

// System Model Layer Elements
const statusPillEventHorizon = document.getElementById('status-pill-event-horizon') as HTMLElement | null;
const dotEventHorizon = document.getElementById('dot-event-horizon') as HTMLElement | null;
const labelEventHorizon = document.getElementById('label-event-horizon') as HTMLElement | null;

const statusPillCompass = document.getElementById('status-pill-compass') as HTMLElement | null;
const dotCompass = document.getElementById('dot-compass') as HTMLElement | null;
const labelCompass = document.getElementById('label-compass') as HTMLElement | null;

const statusPillCore = document.getElementById('status-pill-core') as HTMLElement | null;
const dotCore = document.getElementById('dot-core') as HTMLElement | null;
const labelCore = document.getElementById('label-core') as HTMLElement | null;

const statusPillPlatform = document.getElementById('status-pill-platform') as HTMLElement | null;
const dotPlatform = document.getElementById('dot-platform') as HTMLElement | null;
const labelPlatform = document.getElementById('label-platform') as HTMLElement | null;
const platformLayerSubtitle = document.getElementById('platform-layer-subtitle') as HTMLElement | null;

const layerEventHorizon = document.getElementById('layer-event-horizon') as HTMLElement | null;
const layerCompass = document.getElementById('layer-compass') as HTMLElement | null;
const layerHeadlessCore = document.getElementById('layer-headless-core') as HTMLElement | null;
const layerLampStack = document.getElementById('layer-lamp-stack') as HTMLElement | null;
const localMachinePill = document.getElementById('local-machine-pill') as HTMLElement | null;
const localMachineError = document.getElementById('local-machine-error') as HTMLElement | null;
const localMachineErrorText = document.getElementById('local-machine-error-text') as HTMLElement | null;

// Services Grid Elements
const servicesGrid = document.getElementById('services-grid') as HTMLElement | null;
const servicesCount = document.getElementById('services-count') as HTMLElement | null;

// Quake Console Drawer Elements
const quakeConsoleDrawer = document.getElementById('quake-console-drawer') as HTMLElement | null;
const btnCloseQuake = document.getElementById('btn-close-quake') as HTMLButtonElement | null;

// Console Log Elements
const logViewer = document.getElementById('log-viewer') as HTMLElement | null;
const logContainer = document.getElementById('log-container') as HTMLElement | null;
const logEmptyState = document.getElementById('log-empty-state') as HTMLElement | null;
const chkAutoscroll = document.getElementById('chk-autoscroll') as HTMLInputElement | null;
const btnCopyLogs = document.getElementById('btn-copy-logs') as HTMLButtonElement | null;
const btnExportLogs = document.getElementById('btn-export-logs') as HTMLButtonElement | null;
const btnClearLogs = document.getElementById('btn-clear-logs') as HTMLButtonElement | null;
const logTabs = document.getElementById('log-tabs') as HTMLElement | null;
const levelFilters = document.getElementById('level-filters') as HTMLElement | null;
const inputLogSearch = document.getElementById('input-log-search') as HTMLInputElement | null;
const btnClearSearch = document.getElementById('btn-clear-search') as HTMLButtonElement | null;
const logMetricsCounter = document.getElementById('log-metrics-counter') as HTMLElement | null;

// Badge Count Elements
const badgeCountAll = document.getElementById('badge-count-all') as HTMLElement | null;
const badgeCountGateway = document.getElementById('badge-count-gateway') as HTMLElement | null;
const badgeCountCore = document.getElementById('badge-count-core') as HTMLElement | null;
const badgeCountNetwork = document.getElementById('badge-count-network') as HTMLElement | null;
const badgeCountSetup = document.getElementById('badge-count-setup') as HTMLElement | null;
const badgeErrorCount = document.getElementById('badge-error-count') as HTMLElement | null;
const badgeWarnCount = document.getElementById('badge-warn-count') as HTMLElement | null;

// Download Panel Elements
const downloadPanel = document.getElementById('download-panel') as HTMLElement | null;
const downloadTitle = document.getElementById('download-title') as HTMLElement | null;
const downloadDetail = document.getElementById('download-detail') as HTMLElement | null;
const downloadSpeed = document.getElementById('download-speed') as HTMLElement | null;
const downloadPercent = document.getElementById('download-percent') as HTMLElement | null;
const downloadBar = document.getElementById('download-bar') as HTMLElement | null;

// Application State
let currentGatewayUrl = 'https://my.youmeos.com';
let isActionPending = false;
let hideDownloadTimer: NodeJS.Timeout | null = null;
let architecture3D: Architecture3DManager | null = null;
let smokeCanvas: SmokeCanvasEngine | null = null;
let currentCanvasParent: 'splash' | 'dashboard' = 'splash';
let hasAutoTransitioned = false;

// Log Stream State
let logBuffer: LogEntry[] = [];
let activeServiceFilter = 'all';
let activeLevelFilter = 'all';
let searchFilterQuery = '';

function normalizeServiceCategory(service: string): 'gateway' | 'core' | 'network' | 'setup' {
  const s = (service || '').toLowerCase();
  if (s.includes('nginx') || s.includes('gateway') || s.includes('caddy') || s.includes('franken')) return 'gateway';
  if (s.includes('wp') || s.includes('core') || s.includes('php') || s.includes('sqlite') || s.includes('mariadb')) return 'core';
  if (s.includes('avahi') || s.includes('network') || s.includes('mdns') || s.includes('mesh')) return 'network';
  return 'setup';
}

function entryMatchesFilters(entry: LogEntry): boolean {
  if (activeServiceFilter !== 'all') {
    const cat = normalizeServiceCategory(entry.service);
    if (cat !== activeServiceFilter && entry.service.toLowerCase() !== activeServiceFilter.toLowerCase()) {
      return false;
    }
  }

  if (activeLevelFilter !== 'all') {
    const entryLevel = entry.level || 'info';
    if (entryLevel !== activeLevelFilter) {
      return false;
    }
  }

  if (searchFilterQuery.trim()) {
    const q = searchFilterQuery.trim().toLowerCase();
    const matchesText = entry.text.toLowerCase().includes(q);
    const matchesService = entry.service.toLowerCase().includes(q);
    if (!matchesText && !matchesService) {
      return false;
    }
  }

  return true;
}

function updateBadgeCounts(): void {
  let countAll = 0;
  let countGateway = 0;
  let countCore = 0;
  let countNetwork = 0;
  let countSetup = 0;
  let countErrors = 0;
  let countWarns = 0;

  for (const entry of logBuffer) {
    countAll++;
    const cat = normalizeServiceCategory(entry.service);
    if (cat === 'gateway') countGateway++;
    else if (cat === 'core') countCore++;
    else if (cat === 'network') countNetwork++;
    else countSetup++;

    if (entry.level === 'error') countErrors++;
    else if (entry.level === 'warn') countWarns++;
  }

  if (badgeCountAll) badgeCountAll.textContent = countAll.toString();
  if (badgeCountGateway) badgeCountGateway.textContent = countGateway.toString();
  if (badgeCountCore) badgeCountCore.textContent = countCore.toString();
  if (badgeCountNetwork) badgeCountNetwork.textContent = countNetwork.toString();
  if (badgeCountSetup) badgeCountSetup.textContent = countSetup.toString();
  if (badgeErrorCount) badgeErrorCount.textContent = countErrors.toString();
  if (badgeWarnCount) badgeWarnCount.textContent = countWarns.toString();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatLogTimestamp(ts?: number): string {
  const d = ts ? new Date(ts) : new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
}

function renderSingleEntryHtml(entry: LogEntry): string {
  const timeStr = formatLogTimestamp(entry.timestamp);
  const category = normalizeServiceCategory(entry.service);
  const tagClass = `log-tag-${category}`;
  const level = entry.level || 'info';

  const entryClass = level === 'error' ? 'log-line-entry error-entry' : (level === 'warn' ? 'log-line-entry warn-entry' : (level === 'debug' ? 'log-line-entry debug-entry' : 'log-line-entry'));
  const pillClass = `log-level-pill level-${level}`;
  const pillLabel = level === 'error' ? '[ERR]' : (level === 'warn' ? '[WRN]' : (level === 'debug' ? '[DBG]' : '[INF]'));

  let escaped = escapeHtml(entry.text);

  if (searchFilterQuery.trim()) {
    const escapedQuery = searchFilterQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    escaped = escaped.replace(regex, '<mark class="log-highlight">$1</mark>');
  }

  escaped = escaped.replace(/(https?:\/\/[^\s&<]+)/g, '<span class="log-url">$1</span>');
  escaped = escaped.replace(/(\/(?:home|var|etc|usr|data|desktop)[^\s:&<]+)/g, '<span class="log-path">$1</span>');

  return `
    <div class="${entryClass}">
      <span class="log-time">${timeStr}</span>
      <span class="log-tag ${tagClass}">${escapeHtml(entry.service.toUpperCase())}</span>
      <span class="${pillClass}">${pillLabel}</span>
      <span class="log-text">${escaped}</span>
    </div>
  `;
}

function renderLogStream(): void {
  if (!logViewer) return;

  const filtered = logBuffer.filter(entryMatchesFilters);

  if (logMetricsCounter) {
    logMetricsCounter.textContent = `${filtered.length} / ${logBuffer.length} entries`;
  }

  if (filtered.length === 0) {
    logViewer.innerHTML = '';
    logEmptyState?.classList.remove('hidden');
  } else {
    logEmptyState?.classList.add('hidden');
    logViewer.innerHTML = filtered.map(renderSingleEntryHtml).join('');
  }

  if (chkAutoscroll?.checked && logContainer) {
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

function handleIncomingLog(entry: LogEntry): void {
  logBuffer.push(entry);
  if (logBuffer.length > 1000) {
    logBuffer.shift();
  }

  updateBadgeCounts();

  if (!entryMatchesFilters(entry)) {
    if (logMetricsCounter) {
      const visibleCount = logBuffer.filter(entryMatchesFilters).length;
      logMetricsCounter.textContent = `${visibleCount} / ${logBuffer.length} entries`;
    }
    return;
  }

  logEmptyState?.classList.add('hidden');
  if (logViewer) {
    const html = renderSingleEntryHtml(entry);
    logViewer.insertAdjacentHTML('beforeend', html);
  }

  if (logMetricsCounter) {
    const visibleCount = logBuffer.filter(entryMatchesFilters).length;
    logMetricsCounter.textContent = `${visibleCount} / ${logBuffer.length} entries`;
  }

  if (chkAutoscroll?.checked && logContainer) {
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

// Quake Console Drawer Controllers
function toggleQuakeConsole(forceOpen?: boolean): void {
  if (!quakeConsoleDrawer) return;

  const isCurrentlyOpen = !quakeConsoleDrawer.classList.contains('hidden');
  const shouldOpen = forceOpen !== undefined ? forceOpen : !isCurrentlyOpen;

  if (shouldOpen) {
    quakeConsoleDrawer.classList.remove('hidden');
    btnToggleLogs?.classList.add('is-active');
    setTimeout(() => {
      inputLogSearch?.focus();
      renderLogStream();
    }, 50);
  } else {
    quakeConsoleDrawer.classList.add('hidden');
    btnToggleLogs?.classList.remove('is-active');
  }
}

function openQuakeConsoleWithFilter(serviceCategory: string): void {
  activeServiceFilter = serviceCategory;
  toggleQuakeConsole(true);
  if (logTabs) {
    logTabs.querySelectorAll('.log-tab').forEach(t => {
      const isMatch = t.getAttribute('data-service') === serviceCategory;
      if (isMatch) t.classList.add('active');
      else t.classList.remove('active');
    });
  }
  renderLogStream();
}

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
  setTimeout(() => architecture3D?.resize(), 60);
}

function dismissSplashScreen(): void {
  if (!splashScreenOverlay) return;
  splashScreenOverlay.classList.add('hidden');
  switchCanvasContainer('dashboard');
}

function renderStackLayersVerification(layers?: StackLayerStatus[]): void {
  if (!layers || layers.length === 0) return;

  let activeCount = 0;
  let installedCount = 0;

  layers.forEach(layer => {
    if (layer.installed) installedCount++;
    if (layer.active) activeCount++;

    const isRunning = layer.active;
    const isError = !layer.installed;
    const statusClass = isRunning ? 'running' : (isError ? 'stopped' : 'stopped');
    const statusLabel = isRunning ? 'Online' : (isError ? 'Missing' : 'Offline');

    // 1. Update Splash HUD Card
    const splashCard = document.getElementById(`splash-card-${layer.id}`);
    const splashPill = document.getElementById(`splash-pill-${layer.id}`);
    const splashDot = document.getElementById(`splash-dot-${layer.id}`);
    const splashLabel = document.getElementById(`splash-label-${layer.id}`);
    const splashDetail = document.getElementById(`splash-detail-${layer.id}`);

    if (splashCard && splashPill && splashDot && splashLabel) {
      splashPill.className = `telemetry-status-pill ${statusClass}`;
      splashDot.className = `dot ${statusClass}`;
      splashLabel.textContent = statusLabel;
      if (splashDetail && layer.details) {
        splashDetail.textContent = layer.details;
      }
      if (isRunning) {
        splashCard.classList.add('is-running');
      } else {
        splashCard.classList.remove('is-running');
      }
    }

    // 2. Update Dashboard Sidebar Card
    const dashCard = document.getElementById(`dash-card-${layer.id}`);
    const dashPill = document.getElementById(`dash-pill-${layer.id}`);
    const dashDot = document.getElementById(`dash-dot-${layer.id}`);
    const dashLabel = document.getElementById(`dash-label-${layer.id}`);
    const dashSub = document.getElementById(`dash-sub-${layer.id}`);

    if (dashCard && dashPill && dashDot && dashLabel) {
      dashPill.className = `tier-status-pill ${statusClass}`;
      dashDot.className = `dot ${statusClass}`;
      dashLabel.textContent = statusLabel;
      if (dashSub && layer.details) {
        dashSub.textContent = layer.details;
      }
      if (isRunning) {
        dashCard.classList.add('is-running');
      } else {
        dashCard.classList.remove('is-running');
      }
    }

    // 3. Update System Architecture Tab Text
    const archSub = document.getElementById(`arch-sub-${layer.id}`);
    const archVer = document.getElementById(`arch-ver-${layer.id}`);
    if (archSub && layer.details) {
      archSub.textContent = layer.details;
    }
    if (archVer && layer.version) {
      archVer.textContent = `v${layer.version}`;
    }
  });

  if (splashVerificationSummary) {
    if (activeCount === layers.length) {
      splashVerificationSummary.textContent = `${activeCount} / ${layers.length} Active & In Harmony`;
      splashVerificationSummary.style.color = 'var(--status-running)';
      splashVerificationSummary.style.borderColor = 'var(--status-running)';
    } else {
      splashVerificationSummary.textContent = `${installedCount} / ${layers.length} Components Verified`;
      splashVerificationSummary.style.color = 'var(--accent-cyan)';
      splashVerificationSummary.style.borderColor = 'rgba(98, 201, 255, 0.3)';
    }
  }
}

function applyLayerStatus(
  card: HTMLElement | null,
  pill: HTMLElement | null,
  dot: HTMLElement | null,
  label: HTMLElement | null,
  service: ServiceInfo | undefined
): void {
  if (!pill || !dot || !label) return;

  if (!service) {
    pill.className = 'tier-status-pill stopped';
    dot.className = 'dot stopped';
    label.textContent = 'Offline';
    card?.classList.remove('is-running');
    return;
  }

  const isRunning = service.status === 'running';
  const isStarting = service.status === 'starting';
  const isError = service.status === 'error';
  const statusClass = isRunning ? 'running' : (isStarting ? 'transitioning' : (isError ? 'error' : 'stopped'));
  const statusLabel = isRunning ? 'Online' : (isStarting ? 'Starting' : (isError ? 'Error' : 'Offline'));

  pill.className = `tier-status-pill ${statusClass}`;
  dot.className = `dot ${statusClass}`;
  label.textContent = statusLabel;

  if (isRunning) {
    card?.classList.add('is-running');
  } else {
    card?.classList.remove('is-running');
  }
}

function renderModelView(services: ServiceInfo[], engineType?: string): void {
  const serviceList = services || [];
  const nginxService = serviceList.find(s =>
    s.name.includes('nginx') || s.name.includes('gateway') || s.name.includes('server') || s.name.includes('php-server')
  );
  const wpService = serviceList.find(s =>
    s.name.includes('wordpress') || s.name.includes('engine') || s.name.includes('core')
  );
  const dbService = serviceList.find(s =>
    s.name.includes('sqlite') || s.name.includes('database') || s.name.includes('db')
  );
  const avahiService = serviceList.find(s =>
    s.name.includes('avahi') || s.name.includes('network') || s.name.includes('mdns')
  );

  applyLayerStatus(layerEventHorizon, statusPillEventHorizon, dotEventHorizon, labelEventHorizon, nginxService);
  applyLayerStatus(layerCompass, statusPillCompass, dotCompass, labelCompass, wpService || nginxService);
  applyLayerStatus(layerHeadlessCore, statusPillCore, dotCore, labelCore, wpService || nginxService);

  const platformService = avahiService || dbService || nginxService;
  if (platformLayerSubtitle) {
    const isDocker = engineType === 'docker';
    platformLayerSubtitle.textContent = isDocker
      ? 'Isolated Gateway, PHP 8.3 FPM & Docker Network'
      : 'Isolated Gateway, FrankenPHP Native & ZeroConf Mesh';
  }
  applyLayerStatus(layerLampStack, statusPillPlatform, dotPlatform, labelPlatform, platformService);

  const isAnyError = serviceList.some(s => s.status === 'error');
  if (localMachinePill) {
    if (isAnyError) {
      localMachinePill.classList.add('error');
    } else {
      localMachinePill.classList.remove('error');
    }
  }
}

function getServiceVisualMeta(service: ServiceInfo): {
  category: string;
  glowClass: string;
  specTags: string[];
  iconType: 'gateway' | 'core' | 'network';
  actionType: 'open-gateway' | 'filter-logs';
  actionTarget: string;
} {
  const name = (service.name || '').toLowerCase();

  if (name.includes('nginx') || name.includes('gateway') || name.includes('server') || name.includes('php-server')) {
    return {
      category: service.category || 'Edge Gateway & SSL Proxy',
      glowClass: 'glow-cyan',
      specTags: service.specs || ['HTTP/2 · TLS 1.3', 'Reverse Proxy', 'SSL Offloader'],
      iconType: 'gateway',
      actionType: 'open-gateway',
      actionTarget: currentGatewayUrl || 'https://my.youmeos.com'
    };
  }

  if (name.includes('wordpress') || name.includes('core') || name.includes('engine') || name.includes('php')) {
    return {
      category: service.category || 'Application Kernel & DB',
      glowClass: 'glow-purple',
      specTags: service.specs || ['PHP 8.3 FPM', 'SQLite VFS Engine', 'REST & GraphQL'],
      iconType: 'core',
      actionType: 'filter-logs',
      actionTarget: 'core'
    };
  }

  if (name.includes('sqlite') || name.includes('database') || name.includes('store')) {
    return {
      category: service.category || 'Persistent Storage',
      glowClass: 'glow-purple',
      specTags: service.specs || ['SQLite 3 Sandbox', 'Zero Latency', 'Auto-Vacuum'],
      iconType: 'core',
      actionType: 'filter-logs',
      actionTarget: 'core'
    };
  }

  return {
    category: service.category || 'Local Mesh & Discovery',
    glowClass: 'glow-blue',
    specTags: service.specs || ['mDNS / DNS-SD', 'ZeroConf', 'Peer Broadcast'],
    iconType: 'network',
    actionType: 'filter-logs',
    actionTarget: 'network'
  };
}

function getServiceSvgGraphic(type: 'gateway' | 'core' | 'network', isRunning: boolean): string {
  if (type === 'gateway') {
    return `
      <svg class="service-svg-visual" viewBox="0 0 140 85" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="gwGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#62c9ff" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#62c9ff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="70" cy="42" r="32" fill="url(#gwGlow)"/>
        ${isRunning ? '<circle class="ping-circle" cx="70" cy="42" r="12" stroke="#62c9ff" stroke-width="1.5" opacity="0.6"/>' : ''}
        ${isRunning ? '<circle class="ping-circle delay" cx="70" cy="42" r="22" stroke="#62c9ff" stroke-width="1" opacity="0.3"/>' : ''}
        <polygon points="70,18 96,32 96,54 70,68 44,54 44,32" stroke="#62c9ff" stroke-width="1.8" fill="rgba(14, 30, 55, 0.7)"/>
        <polygon points="70,24 90,35 90,51 70,62 50,51 50,35" stroke="rgba(98, 201, 255, 0.4)" stroke-width="1" stroke-dasharray="3 3"/>
        <circle cx="70" cy="42" r="5" fill="#62c9ff" ${isRunning ? 'class="pulse-node"' : ''}/>
        <line x1="44" y1="42" x2="65" y2="42" stroke="#62c9ff" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="75" y1="42" x2="96" y2="42" stroke="#62c9ff" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="70" y1="24" x2="70" y2="37" stroke="#62c9ff" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="70" y1="47" x2="70" y2="62" stroke="#62c9ff" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M67 40 V38 C67 36.3 68.3 35 70 35 C71.7 35 73 36.3 73 38 V40" stroke="#ffffff" stroke-width="1.2" fill="none"/>
      </svg>
    `;
  }

  if (type === 'core') {
    return `
      <svg class="service-svg-visual" viewBox="0 0 140 85" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#a855f7" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="70" cy="42" r="30" fill="url(#coreGlow)"/>
        <polygon points="70,16 102,32 70,48 38,32" stroke="#a855f7" stroke-width="1.8" fill="rgba(35, 18, 55, 0.75)"/>
        <polygon points="70,48 102,32 102,46 70,62" stroke="#a855f7" stroke-width="1.5" fill="rgba(24, 10, 40, 0.85)"/>
        <polygon points="70,48 38,32 38,46 70,62" stroke="rgba(168, 85, 247, 0.7)" stroke-width="1.5" fill="rgba(18, 6, 30, 0.9)"/>
        <polygon points="70,24 88,33 70,42 52,33" stroke="#ffd599" stroke-width="1.2" fill="rgba(255, 213, 153, 0.15)"/>
        <circle cx="70" cy="33" r="3" fill="#ffd599" ${isRunning ? 'class="pulse-gold"' : ''}/>
        <line x1="26" y1="26" x2="38" y2="32" stroke="#a855f7" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="26" y1="38" x2="38" y2="44" stroke="#a855f7" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="114" y1="26" x2="102" y2="32" stroke="#a855f7" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="114" y1="38" x2="102" y2="44" stroke="#a855f7" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `;
  }

  return `
    <svg class="service-svg-visual" viewBox="0 0 140 85" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="meshGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2979ff" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#2979ff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="70" cy="42" r="32" fill="url(#meshGlow)"/>
      <ellipse cx="70" cy="42" rx="36" ry="20" stroke="rgba(41, 121, 255, 0.3)" stroke-width="1" stroke-dasharray="3 3"/>
      <ellipse cx="70" cy="42" rx="22" ry="12" stroke="rgba(98, 201, 255, 0.4)" stroke-width="1.2"/>
      <circle cx="70" cy="42" r="6" fill="rgba(41, 121, 255, 0.3)" stroke="#2979ff" stroke-width="1.5"/>
      <circle cx="70" cy="42" r="3" fill="#62c9ff" ${isRunning ? 'class="pulse-node"' : ''}/>
      <g ${isRunning ? 'class="mesh-orbit-group"' : ''} style="transform-origin: 70px 42px;">
        <circle cx="40" cy="36" r="3.5" fill="#2979ff" stroke="#fff" stroke-width="0.8"/>
        <line x1="40" y1="36" x2="70" y2="42" stroke="rgba(98, 201, 255, 0.5)" stroke-width="1"/>
        <circle cx="100" cy="48" r="3" fill="#62c9ff" stroke="#fff" stroke-width="0.8"/>
        <line x1="100" y1="48" x2="70" y2="42" stroke="rgba(98, 201, 255, 0.5)" stroke-width="1"/>
        <circle cx="76" cy="24" r="2.5" fill="#38bdf8"/>
        <line x1="76" y1="24" x2="70" y2="42" stroke="rgba(98, 201, 255, 0.3)" stroke-width="0.8"/>
      </g>
    </svg>
  `;
}

function renderServices(services: ServiceInfo[]): void {
  if (!servicesGrid) return;

  if (!services || services.length === 0) {
    servicesGrid.innerHTML = `
      <div class="service-card" style="text-align: center; justify-content: center; color: var(--text-muted);">
        No active services detected.
      </div>
    `;
    if (servicesCount) servicesCount.textContent = '0 / 0';
    return;
  }

  const runningCount = services.filter(s => s.status === 'running').length;
  if (servicesCount) servicesCount.textContent = `${runningCount} / ${services.length}`;

  servicesGrid.innerHTML = services.map(s => {
    const isRunning = s.status === 'running';
    const isStarting = s.status === 'starting';
    const isError = s.status === 'error';
    const statusClass = isRunning ? 'running' : (isStarting ? 'starting' : (isError ? 'error' : 'stopped'));
    const statusLabel = isRunning ? 'Online' : (isStarting ? 'Starting' : (isError ? 'Error' : 'Offline'));
    const meta = getServiceVisualMeta(s);

    const formattedPorts = s.ports && s.ports.length > 0 
      ? s.ports.map(p => {
          if (p === '80' || p === '443') return `${p}`;
          return p.replace(/->/g, ' → ');
        }).join(', ')
      : '';
    const portTag = formattedPorts ? `<span class="service-spec-tag highlight">Port: ${formattedPorts}</span>` : '';

    const specTagsHtml = meta.specTags.map(tag => `<span class="service-spec-tag">${tag}</span>`).join('');
    const svgVisual = getServiceSvgGraphic(meta.iconType, isRunning);

    return `
      <div class="service-card ${isRunning ? 'is-running' : ''}" data-action="${meta.actionType}" data-target="${meta.actionTarget}">
        <div class="service-accent-glow ${meta.glowClass}"></div>
        <div class="service-body">
          <div class="service-header">
            <div class="service-identity">
              <span class="service-category">${meta.category}</span>
              <h3 class="service-name">${s.displayName || s.name}</h3>
              <p class="service-role">${s.role || ''}</p>
            </div>
            <div class="service-status-pill ${statusClass}">
              <span class="dot ${statusClass}"></span>
              <span>${statusLabel}</span>
            </div>
          </div>
          <div class="service-specs">
            ${portTag}
            ${specTagsHtml}
          </div>
        </div>
        <div class="service-graphic">
          ${svgVisual}
        </div>
      </div>
    `;
  }).join('');

  servicesGrid.querySelectorAll<HTMLElement>('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      const action = card.getAttribute('data-action');
      const target = card.getAttribute('data-target');
      if (action === 'open-gateway' && target) {
        windowApi.openUrl(target);
      } else if (action === 'filter-logs' && target) {
        openQuakeConsoleWithFilter(target);
      }
    });
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

  if (localMachineError && localMachineErrorText) {
    if (isError && info.message) {
      localMachineErrorText.textContent = info.message;
      localMachineError.classList.remove('hidden');
      localMachinePill?.classList.add('error');
    } else {
      localMachineError.classList.add('hidden');
      if (!isError) {
        localMachinePill?.classList.remove('error');
      }
    }
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

  const brandIcons = document.querySelectorAll('.brand-icon');
  brandIcons.forEach(icon => {
    if (isTransitioning) {
      icon.classList.add('spin');
    } else {
      icon.classList.remove('spin');
    }
  });

  if (splashBtnStart) {
    if (isActionPending || isTransitioning) {
      splashBtnStart.disabled = true;
      splashBtnStart.className = 'splash-action-btn primary-btn';
      splashBtnStart.innerHTML = `
        <svg class="spin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a10 10 0 0 1 10 10"/>
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

  // Tape Deck Transport Button States
  if (btnStart && btnStop && btnRestart) {
    if (isActionPending) {
      btnStart.disabled = true;
      btnStop.disabled = true;
      btnRestart.disabled = true;
    } else if (isRunning) {
      btnStart.disabled = true;
      btnStart.classList.add('is-active');
      btnStop.disabled = false;
      btnStop.classList.remove('is-active');
      btnRestart.disabled = false;
    } else if (isStopped) {
      btnStart.disabled = false;
      btnStart.classList.remove('is-active');
      btnStop.disabled = true;
      btnStop.classList.add('is-active');
      btnRestart.disabled = true;
    } else if (isTransitioning) {
      btnStart.disabled = true;
      btnStart.classList.remove('is-active');
      btnStop.disabled = true;
      btnStop.classList.remove('is-active');
      btnRestart.disabled = true;
    } else if (isError) {
      btnStart.disabled = false;
      btnStart.classList.remove('is-active');
      btnStop.disabled = true;
      btnStop.classList.remove('is-active');
      btnRestart.disabled = true;
    }
  }

  // Check if we should auto-transition from splash when running (if not locked by user preference)
  if (isRunning && !hasAutoTransitioned && !chkStaySplash?.checked) {
    hasAutoTransitioned = true;
    setTimeout(() => {
      if (!chkStaySplash?.checked) {
        dismissSplashScreen();
      }
    }, 1200);
  }
}

function formatSpeed(bytesPerSec?: number): string {
  if (!bytesPerSec || bytesPerSec <= 0) return '';
  const kb = bytesPerSec / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB/s`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB/s`;
}

function renderDownloadProgress(progress: DownloadProgress | null | undefined): void {
  if (!downloadPanel) return;

  if (!progress) {
    if (!downloadPanel.classList.contains('hidden') && hideDownloadTimer === null) {
      hideDownloadTimer = setTimeout(() => {
        downloadPanel.classList.add('hidden');
        hideDownloadTimer = null;
      }, 800);
    }
    return;
  }

  if (hideDownloadTimer !== null) {
    clearTimeout(hideDownloadTimer);
    hideDownloadTimer = null;
  }

  downloadPanel.classList.remove('hidden');

  const isExtracting = progress.stage === 'extracting';
  const isComplete = progress.stage === 'complete';

  if (downloadTitle && downloadDetail && downloadSpeed && downloadPercent && downloadBar) {
    if (isExtracting) {
      downloadTitle.textContent = `Extracting ${progress.item}...`;
      downloadDetail.textContent = progress.detail || 'Extracting archive contents...';
      downloadSpeed.textContent = '';
      downloadPercent.textContent = '100%';
      downloadBar.classList.add('indeterminate');
      downloadBar.style.width = '100%';
    } else if (isComplete) {
      downloadTitle.textContent = `${progress.item} Ready`;
      downloadDetail.textContent = progress.detail || 'Setup completed';
      downloadSpeed.textContent = '';
      downloadPercent.textContent = '100%';
      downloadBar.classList.remove('indeterminate');
      downloadBar.style.width = '100%';
    } else {
      downloadTitle.textContent = `Downloading ${progress.item}...`;
      downloadDetail.textContent = progress.detail || `${progress.loaded} bytes`;
      downloadSpeed.textContent = formatSpeed(progress.speed);
      downloadPercent.textContent = `${progress.percent}%`;
      downloadBar.classList.remove('indeterminate');
      downloadBar.style.width = `${progress.percent}%`;
    }
  }
}

function switchTab(targetTabId: string): void {
  tabTriggers.forEach(btn => {
    const btnTab = btn.getAttribute('data-tab');
    const isTarget = btnTab === targetTabId;
    if (isTarget) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  tabContents.forEach(content => {
    const isTarget = content.id === targetTabId;
    if (isTarget) {
      content.classList.remove('hidden');
      if (targetTabId === 'tab-matrix') {
        switchCanvasContainer('dashboard');
      }
    } else {
      content.classList.add('hidden');
    }
  });
}

async function pollStatus(): Promise<void> {
  try {
    const info = await windowApi.getStatus();
    updateStatusUI(info);
    renderServices(info.services);
    renderModelView(info.services, info.engineType);
    renderStackLayersVerification(info.stackLayers);
    if (info.downloadProgress !== undefined) {
      renderDownloadProgress(info.downloadProgress);
    }
  } catch (e: any) {
    console.error('Failed to poll status', e);
    updateStatusUI({ status: 'error', message: e?.message });
  }
}

async function init(): Promise<void> {
  // Initialize Smoke Canvas Background
  smokeCanvas = initSmokeCanvas('microverse-smoke-canvas');

  // Initialize Stay on Splash Preference
  const savedStaySplash = localStorage.getItem('youmeos_stay_splash') === 'true';
  if (chkStaySplash) {
    chkStaySplash.checked = savedStaySplash;
    chkStaySplash.addEventListener('change', () => {
      localStorage.setItem('youmeos_stay_splash', chkStaySplash.checked ? 'true' : 'false');
    });
  }

  // Initialize Single Unified 3D Architecture Canvas inside Splash Viewport by default
  const initialContainer = splash3dCanvasContainer || dash3dCanvasContainer;
  if (initialContainer) {
    architecture3D = new Architecture3DManager({
      container: initialContainer,
      onLayerSelect: (layerId) => {
        openQuakeConsoleWithFilter(layerId === 'portal' ? 'gateway' : (layerId === 'compass' || layerId === 'core' ? 'core' : 'network'));
      }
    });
  }

  // Wire up 3D Layer Hover Highlights from UI cards
  const interactiveLayerCards = document.querySelectorAll<HTMLElement>('[data-layer]');
  interactiveLayerCards.forEach(card => {
    const layer = card.getAttribute('data-layer');
    card.addEventListener('mouseenter', () => {
      if (layer) architecture3D?.highlightLayer(layer);
    });
    card.addEventListener('mouseleave', () => {
      architecture3D?.highlightLayer(null);
    });
    card.addEventListener('click', () => {
      if (layer === 'portal' || layer === 'server') {
        windowApi.openUrl(currentGatewayUrl);
      } else if (layer === 'compass' || layer === 'core' || layer === 'database') {
        openQuakeConsoleWithFilter('core');
      } else {
        openQuakeConsoleWithFilter('network');
      }
    });
  });

  // Splash Navigation & HUD Drawer Handlers
  splashHudToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    splashSidePanel?.classList.toggle('collapsed');
  });

  splashHudClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    splashSidePanel?.classList.add('collapsed');
  });

  splashBtnDashboard?.addEventListener('click', () => {
    dismissSplashScreen();
  });

  btnReturnSplash?.addEventListener('click', () => {
    openSplashScreen();
  });

  btnOpenSplash?.addEventListener('click', () => {
    openSplashScreen();
  });

  if (versionTag && windowApi.getVersion) {
    try {
      const ver = await windowApi.getVersion();
      if (ver) {
        versionTag.textContent = `Microverse v${ver}`;
      }
    } catch (e) {
      console.error('Failed to get version', e);
    }
  }

  if (windowApi.onDownloadProgress) {
    const handleProgressUpdate = (progress: DownloadProgress | null) => {
      renderDownloadProgress(progress);
    };
    windowApi.onDownloadProgress(handleProgressUpdate);
  }

  // Register real-time log ingestion stream
  if (windowApi.onLog) {
    windowApi.onLog((log: LogEntry) => {
      handleIncomingLog(log);
    });
  }

  // Hydrate initial log buffer from main process
  if (windowApi.getStructuredLogs) {
    try {
      const initialLogs = await windowApi.getStructuredLogs({ tail: 200 });
      if (initialLogs && initialLogs.length > 0) {
        logBuffer = initialLogs;
        updateBadgeCounts();
        renderLogStream();
      }
    } catch {
      // fallback
    }
  }

  if (windowApi.onStatusChange) {
    const handleStatusUpdate = (info: EngineStatusInfo) => {
      updateStatusUI(info);
      renderServices(info.services);
      renderModelView(info.services, info.engineType);
      renderStackLayersVerification(info.stackLayers);
      if (info.downloadProgress !== undefined) {
        renderDownloadProgress(info.downloadProgress);
      }
    };
    windowApi.onStatusChange(handleStatusUpdate);
  }

  // Overall status pill toggles Quake console
  overallStatusPill?.addEventListener('click', () => {
    toggleQuakeConsole();
  });

  // Tab Triggers
  tabTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (targetTab) switchTab(targetTab);
    });
  });

  // Quake Console Toggle Keyboard Shortcut (Tilde / Backtick / Escape)
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === '`' || e.key === '~') {
      const activeEl = document.activeElement;
      const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;
      if (!isInput || activeEl === inputLogSearch) {
        e.preventDefault();
        toggleQuakeConsole();
      }
    } else if (e.key === 'Escape') {
      if (quakeConsoleDrawer && !quakeConsoleDrawer.classList.contains('hidden')) {
        e.preventDefault();
        toggleQuakeConsole(false);
      }
    }
  });

  btnToggleLogs?.addEventListener('click', () => {
    toggleQuakeConsole();
  });

  btnCloseQuake?.addEventListener('click', () => {
    toggleQuakeConsole(false);
  });

  const copyUrlToClipboard = async (url: string, btn: HTMLElement | null) => {
    try {
      await navigator.clipboard.writeText(url);
      if (btn) {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#4ade80" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to copy URL', err);
    }
  };

  btnCopyGateway?.addEventListener('click', () => copyUrlToClipboard(currentGatewayUrl, btnCopyGateway));

  // Layer Click Handlers filter Quake logs
  layerEventHorizon?.addEventListener('click', () => openQuakeConsoleWithFilter('gateway'));
  layerCompass?.addEventListener('click', () => openQuakeConsoleWithFilter('core'));
  layerHeadlessCore?.addEventListener('click', () => openQuakeConsoleWithFilter('core'));
  layerLampStack?.addEventListener('click', () => openQuakeConsoleWithFilter('network'));
  localMachinePill?.addEventListener('click', () => openQuakeConsoleWithFilter('all'));

  // Log Service Category Tabs
  if (logTabs) {
    logTabs.querySelectorAll<HTMLButtonElement>('.log-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const service = btn.getAttribute('data-service') || 'all';
        activeServiceFilter = service;
        logTabs.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        renderLogStream();
      });
    });
  }

  // Log Level Filter Buttons
  if (levelFilters) {
    levelFilters.querySelectorAll<HTMLButtonElement>('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const level = btn.getAttribute('data-level') || 'all';
        activeLevelFilter = level;
        levelFilters.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderLogStream();
      });
    });
  }

  // Search Input Handlers
  if (inputLogSearch) {
    inputLogSearch.addEventListener('input', () => {
      searchFilterQuery = inputLogSearch.value;
      if (searchFilterQuery.length > 0) {
        btnClearSearch?.classList.remove('hidden');
      } else {
        btnClearSearch?.classList.add('hidden');
      }
      renderLogStream();
    });

    btnClearSearch?.addEventListener('click', () => {
      inputLogSearch.value = '';
      searchFilterQuery = '';
      btnClearSearch.classList.add('hidden');
      renderLogStream();
      inputLogSearch.focus();
    });
  }

  // Copy Logs Action
  btnCopyLogs?.addEventListener('click', async () => {
    const filtered = logBuffer.filter(entryMatchesFilters);
    const plainText = filtered.map(e => `${formatLogTimestamp(e.timestamp)} [${e.service.toUpperCase()}] [${(e.level || 'info').toUpperCase()}] ${e.text}`).join('\n');
    await copyUrlToClipboard(plainText, btnCopyLogs);
  });

  // Export Logs Action
  btnExportLogs?.addEventListener('click', () => {
    const filtered = logBuffer.filter(entryMatchesFilters);
    const plainText = filtered.map(e => `${formatLogTimestamp(e.timestamp)} [${e.service.toUpperCase()}] [${(e.level || 'info').toUpperCase()}] ${e.text}`).join('\n');
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youmeos-microverse-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Clear Logs Action
  btnClearLogs?.addEventListener('click', async () => {
    logBuffer = [];
    try {
      await windowApi.clearLogs?.();
    } catch {}
    updateBadgeCounts();
    renderLogStream();
  });

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
    const isCurrentlyRunning = splashBtnStart.textContent?.toLowerCase().includes('stop');
    if (isCurrentlyRunning) {
      await stopHandler();
    } else {
      splashSidePanel?.classList.add('collapsed');
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

  const openBrowserHandler = (e?: MouseEvent) => {
    e?.preventDefault();
    windowApi.openUrl(currentGatewayUrl);
  };
  linkGateway?.addEventListener('click', openBrowserHandler);
  btnOpenBrowser?.addEventListener('click', () => openBrowserHandler());
  splashBtnLaunch?.addEventListener('click', () => openBrowserHandler());

  const updatePluginsHandler = async () => {
    if (!btnUpdatePlugins) return;
    btnUpdatePlugins.disabled = true;
    btnUpdatePlugins.classList.add('is-updating');
    const labelSpan = btnUpdatePlugins.querySelector('.deck-label');
    const prevText = labelSpan ? labelSpan.textContent : btnUpdatePlugins.textContent;
    if (labelSpan) labelSpan.textContent = 'Updating...';
    try {
      openQuakeConsoleWithFilter('setup');
      const result = await windowApi.updatePlugins();
      const output = [result?.stdout, result?.stderr].filter(Boolean).join('\n');
      const lines = output.split('\n').filter((l: string) => Boolean(l.trim()));
      for (const line of lines) {
        const isErr = line.toLowerCase().includes('error');
        const isWarn = line.toLowerCase().includes('warn') || line.toLowerCase().includes('problem');
        const level = isErr ? 'error' : (isWarn ? 'warn' : 'info');
        handleIncomingLog({
          service: 'setup',
          text: line,
          level,
          timestamp: Date.now()
        });
      }
    } catch (e: any) {
      handleIncomingLog({
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
}

init();
