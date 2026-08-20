import type {
  DownloadProgress,
  ServiceInfo,
  EngineStatusInfo,
  LogEntry
} from '../main/engine/types';
import { Architecture3DManager } from './architecture-3d';

interface DesktopApi {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  restart: () => Promise<void>;
  getStatus: () => Promise<EngineStatusInfo>;
  getLogs: (service?: string, tail?: number) => Promise<string>;
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
const btnCopyUrl = document.getElementById('btn-copy-url') as HTMLButtonElement | null;
const btnUpdatePlugins = document.getElementById('btn-update-plugins') as HTMLButtonElement | null;

// Tab Elements
const tabTriggers = document.querySelectorAll<HTMLButtonElement>('.tabs-trigger');
const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');

// System Model Layer Elements
const statusPillEventHorizon = document.getElementById('status-pill-event-horizon') as HTMLElement | null;
const dotEventHorizon = document.getElementById('dot-event-horizon') as HTMLElement | null;
const labelEventHorizon = document.getElementById('label-event-horizon') as HTMLElement | null;

const statusPillCore = document.getElementById('status-pill-core') as HTMLElement | null;
const dotCore = document.getElementById('dot-core') as HTMLElement | null;
const labelCore = document.getElementById('label-core') as HTMLElement | null;

const statusPillPlatform = document.getElementById('status-pill-platform') as HTMLElement | null;
const dotPlatform = document.getElementById('dot-platform') as HTMLElement | null;
const labelPlatform = document.getElementById('label-platform') as HTMLElement | null;
const platformLayerSubtitle = document.getElementById('platform-layer-subtitle') as HTMLElement | null;

const layerEventHorizon = document.getElementById('layer-event-horizon') as HTMLElement | null;
const layerHeadlessCore = document.getElementById('layer-headless-core') as HTMLElement | null;
const layerLampStack = document.getElementById('layer-lamp-stack') as HTMLElement | null;
const localMachinePill = document.getElementById('local-machine-pill') as HTMLElement | null;
const localMachineError = document.getElementById('local-machine-error') as HTMLElement | null;
const localMachineErrorText = document.getElementById('local-machine-error-text') as HTMLElement | null;

// Services Grid Elements
const servicesGrid = document.getElementById('services-grid') as HTMLElement | null;
const servicesCount = document.getElementById('services-count') as HTMLElement | null;

// Console Log Elements
const logViewer = document.getElementById('log-viewer')?.querySelector('code') as HTMLElement | null;
const logContainer = document.getElementById('log-container') as HTMLElement | null;
const chkAutoscroll = document.getElementById('chk-autoscroll') as HTMLInputElement | null;
const btnClearLogs = document.getElementById('btn-clear-logs') as HTMLButtonElement | null;
const logTabs = document.getElementById('log-tabs') as HTMLElement | null;

// Download Panel Elements
const downloadPanel = document.getElementById('download-panel') as HTMLElement | null;
const downloadTitle = document.getElementById('download-title') as HTMLElement | null;
const downloadDetail = document.getElementById('download-detail') as HTMLElement | null;
const downloadSpeed = document.getElementById('download-speed') as HTMLElement | null;
const downloadPercent = document.getElementById('download-percent') as HTMLElement | null;
const downloadBar = document.getElementById('download-bar') as HTMLElement | null;

let currentSelectedService = 'all';
let currentGatewayUrl = 'https://my.youmeos.com';
let isActionPending = false;
let hideDownloadTimer: NodeJS.Timeout | null = null;
let lastLogText = '';
let architecture3D: Architecture3DManager | null = null;

function applyLayerStatus(
  card: HTMLElement | null,
  pill: HTMLElement | null,
  dot: HTMLElement | null,
  label: HTMLElement | null,
  service: ServiceInfo | undefined
): void {
  if (!pill || !dot || !label) return;

  if (!service) {
    pill.className = 'layer-status-pill stopped';
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

  pill.className = `layer-status-pill ${statusClass}`;
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

function renderServices(services: ServiceInfo[]): void {
  if (!servicesGrid) return;

  if (!services || services.length === 0) {
    servicesGrid.innerHTML = `
      <div class="service-card" style="grid-column: span 2; text-align: center; color: var(--text-muted);">
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
    const statusLabel = isRunning ? 'Running' : (isStarting ? 'Starting' : (isError ? 'Error' : 'Stopped'));
    const portsDisplay = s.ports && s.ports.length > 0 ? `<span class="service-ports">Port: ${s.ports.join(', ')}</span>` : '';

    return `
      <div class="service-card">
        <div class="service-meta">
          <span class="service-name">${s.displayName || s.name}</span>
          <span class="service-role">${s.role || ''}</span>
          ${portsDisplay}
        </div>
        <div class="badge badge-status ${statusClass}">
          <span class="dot ${statusClass}"></span>
          <span>${statusLabel}</span>
        </div>
      </div>
    `;
  }).join('');
}

function updateStatusUI(info: Partial<EngineStatusInfo>): void {
  const status = info.status || 'stopped';
  const isRunning = status === 'running';
  const isStopped = status === 'stopped';
  const isTransitioning = status === 'starting' || status === 'stopping';
  const isError = status === 'error';

  architecture3D?.setRunning(isRunning);

  if (overallStatusPill && statusDot && statusText) {
    overallStatusPill.className = `badge badge-status ${status}`;
    statusDot.className = `dot ${status}`;
    statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
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

  if (info.engineType && engineSelector && engineSelector.value !== info.engineType) {
    engineSelector.value = info.engineType;
  }

  const brandIcon = document.querySelector('.brand-icon');
  if (brandIcon) {
    if (isTransitioning) {
      brandIcon.classList.add('spin');
    } else {
      brandIcon.classList.remove('spin');
    }
  }

  if (!btnStart || !btnStop || !btnRestart) return;

  if (isActionPending) {
    btnStart.disabled = true;
    btnStop.disabled = true;
    btnRestart.disabled = true;
    return;
  }

  if (isRunning) {
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getServiceTagClass(service: string): string {
  const s = service.toLowerCase();
  if (s.includes('franken') || s.includes('setup')) return 'log-tag-franken';
  if (s.includes('wp') || s.includes('php') || s.includes('core')) return 'log-tag-wp';
  if (s.includes('docker') || s.includes('server')) return 'log-tag-docker';
  if (s.includes('avahi') || s.includes('mdns') || s.includes('network')) return 'log-tag-network';
  if (s.includes('gateway') || s.includes('nginx')) return 'log-tag-gateway';
  return 'log-tag-default';
}

function formatLogLine(rawLine: string): string {
  if (!rawLine || !rawLine.trim()) return '';

  const isError = /error|emerg|fatal|failed|permission denied|exception|bind: address already in use/i.test(rawLine);
  const isWarn = /warn|warning/i.test(rawLine) && !isError;

  let escaped = escapeHtml(rawLine);

  let timeHtml = '';
  const timeMatch = escaped.match(/^\[(\d{1,2}:\d{2}:\d{2}(?:\s*[AP]M)?)\]\s*/i);
  if (timeMatch) {
    timeHtml = `<span class="log-time">[${timeMatch[1]}]</span>`;
    escaped = escaped.slice(timeMatch[0].length);
  }

  let tagHtml = '';
  const bracketMatch = escaped.match(/^\[([a-zA-Z0-9_\-\.]+?)\]\s*/);
  const pipeMatch = escaped.match(/^([a-zA-Z0-9_\-\.]+?)\s*\|\s*/);

  if (bracketMatch) {
    const sName = bracketMatch[1];
    const tagClass = getServiceTagClass(sName);
    tagHtml = `<span class="log-tag ${tagClass}">[${sName}]</span>`;
    escaped = escaped.slice(bracketMatch[0].length);
  } else if (pipeMatch) {
    const sName = pipeMatch[1];
    const tagClass = getServiceTagClass(sName);
    tagHtml = `<span class="log-tag ${tagClass}">${sName}</span><span class="log-sep">|</span>`;
    escaped = escaped.slice(pipeMatch[0].length);
  }

  escaped = escaped.replace(/\[(info|debug)\]/gi, '<span class="log-level-info">[$1]</span>');
  escaped = escaped.replace(/\[(warn|warning)\]/gi, '<span class="log-level-warn">[$1]</span>');
  escaped = escaped.replace(/\[(error|emerg|fatal)\]/gi, '<span class="log-level-error">[$1]</span>');
  escaped = escaped.replace(/\b(Error|Fatal|Exception|emerg):/gi, '<span class="log-level-error">$1:</span>');
  escaped = escaped.replace(/(https?:\/\/[^\s&<]+)/g, '<span class="log-url">$1</span>');
  escaped = escaped.replace(/(\/(?:home|var|etc|usr|data|desktop)[^\s:&<]+)/g, '<span class="log-path">$1</span>');

  const lineClass = isError ? 'log-line error-line' : (isWarn ? 'log-line warn-line' : 'log-line');
  return `<span class="${lineClass}">${timeHtml}${tagHtml}<span class="log-text">${escaped}</span></span>`;
}

async function fetchLogs(): Promise<void> {
  if (!logViewer) return;
  try {
    const rawLogs = await windowApi.getLogs(currentSelectedService, 120);
    const content = rawLogs || 'No logs recorded.';
    if (content !== lastLogText) {
      lastLogText = content;
      const formatted = content
        .split('\n')
        .filter(l => Boolean(l.trim()))
        .map(formatLogLine)
        .join('');
      logViewer.innerHTML = formatted || formatLogLine('No logs recorded.');
      if (chkAutoscroll && chkAutoscroll.checked && logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }
  } catch (e: any) {
    logViewer.innerHTML = formatLogLine(`[Error] Error fetching logs: ${e.message || e}`);
  }
}

async function pollStatus(): Promise<void> {
  try {
    const info = await windowApi.getStatus();
    updateStatusUI(info);
    renderServices(info.services);
    renderModelView(info.services, info.engineType);
    if (info.downloadProgress !== undefined) {
      renderDownloadProgress(info.downloadProgress);
    }
    await fetchLogs();
  } catch (e: any) {
    console.error('Failed to poll status', e);
    updateStatusUI({ status: 'error', message: e?.message });
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
      if (targetTabId === 'tab-model') {
        setTimeout(() => architecture3D?.resize(), 50);
      }
    } else {
      content.classList.add('hidden');
    }
  });
}

async function init(): Promise<void> {
  const containerHorizon = document.getElementById('canvas-container-horizon');
  const containerCore = document.getElementById('canvas-container-core');
  const containerBedrock = document.getElementById('canvas-container-bedrock');

  if (containerHorizon || containerCore || containerBedrock) {
    architecture3D = new Architecture3DManager({
      containerHorizon,
      containerCore,
      containerBedrock
    });
  }

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

  if (windowApi.onLog) {
    const handleLogUpdate = (log: LogEntry) => {
      if (!logViewer) return;
      if (logViewer.textContent?.includes('Initializing console stream...') || logViewer.textContent?.includes('[Console cleared]')) {
        logViewer.innerHTML = '';
      }
      const timestamp = new Date().toLocaleTimeString();
      const raw = `[${timestamp}] [${log.service}] ${log.text}`;
      const lineHtml = formatLogLine(raw);
      logViewer.insertAdjacentHTML('beforeend', lineHtml);
      if (chkAutoscroll && chkAutoscroll.checked && logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    };
    windowApi.onLog(handleLogUpdate);
  }

  if (windowApi.onStatusChange) {
    const handleStatusUpdate = (info: EngineStatusInfo) => {
      updateStatusUI(info);
      renderServices(info.services);
      renderModelView(info.services, info.engineType);
      if (info.downloadProgress !== undefined) {
        renderDownloadProgress(info.downloadProgress);
      }
    };
    windowApi.onStatusChange(handleStatusUpdate);
  }

  overallStatusPill?.addEventListener('click', () => {
    switchTab('tab-logs');
  });

  tabTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (targetTab) switchTab(targetTab);
    });
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
  btnCopyUrl?.addEventListener('click', () => copyUrlToClipboard(currentGatewayUrl, btnCopyUrl));

  const selectLogTab = async (serviceName: string) => {
    currentSelectedService = serviceName;
    switchTab('tab-logs');
    if (logTabs) {
      const tabToActivate = logTabs.querySelector(`.log-tab[data-service="${serviceName}"]`) as HTMLElement | null;
      if (tabToActivate) {
        logTabs.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
        tabToActivate.classList.add('active');
      }
    }
    await fetchLogs();
  };

  layerEventHorizon?.addEventListener('click', () => selectLogTab('nginx'));
  layerHeadlessCore?.addEventListener('click', () => selectLogTab('wordpress'));
  layerLampStack?.addEventListener('click', () => selectLogTab('avahi'));
  localMachinePill?.addEventListener('click', () => selectLogTab('all'));

  if (logTabs) {
    logTabs.querySelectorAll<HTMLButtonElement>('.log-tab').forEach(btn => {
      btn.addEventListener('click', async () => {
        const service = btn.getAttribute('data-service') || 'all';
        currentSelectedService = service;
        logTabs.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        await fetchLogs();
      });
    });
  }

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

  const updatePluginsHandler = async () => {
    if (!btnUpdatePlugins) return;
    btnUpdatePlugins.disabled = true;
    const labelSpan = btnUpdatePlugins.querySelector('.deck-label');
    const prevText = labelSpan ? labelSpan.textContent : btnUpdatePlugins.textContent;
    if (labelSpan) labelSpan.textContent = 'Updating...';
    try {
      if (logViewer) logViewer.innerHTML = formatLogLine('[Composer] Fetching latest YouMeOS plugin updates...');
      const result = await windowApi.updatePlugins();
      const raw = (result?.stdout || result?.stderr || JSON.stringify(result));
      const formatted = raw.split('\n').filter((l: string) => Boolean(l.trim())).map(formatLogLine).join('');
      if (logViewer) logViewer.innerHTML += formatted;
    } catch (e: any) {
      if (logViewer) logViewer.innerHTML += formatLogLine(`[Composer Error] ${e?.message || e}`);
    } finally {
      btnUpdatePlugins.disabled = false;
      if (labelSpan) labelSpan.textContent = prevText || 'Update';
      await pollStatus();
    }
  };
  btnUpdatePlugins?.addEventListener('click', updatePluginsHandler);

  const engineChangeHandler = async () => {
    if (!engineSelector) return;
    const selected = engineSelector.value;
    try {
      await windowApi.setEngineType(selected);
      await pollStatus();
    } catch (e: any) {
      alert(`Failed to switch engine: ${e?.message}`);
    }
  };
  engineSelector?.addEventListener('change', engineChangeHandler);

  const clearLogsHandler = () => {
    if (logViewer) logViewer.innerHTML = formatLogLine('[Console cleared]');
  };
  btnClearLogs?.addEventListener('click', clearLogsHandler);
}

init();
