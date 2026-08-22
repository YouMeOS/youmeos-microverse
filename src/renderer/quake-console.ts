import type { LogEntry, DesktopApi } from './types';

export class QuakeConsoleManager {
  private logBuffer: LogEntry[] = [];
  private activeServiceFilter = 'all';
  private activeLevelFilter = 'all';
  private searchFilterQuery = '';

  // DOM Elements
  private quakeConsoleDrawer = document.getElementById('quake-console-drawer') as HTMLElement | null;
  private btnCloseQuake = document.getElementById('btn-close-quake') as HTMLButtonElement | null;
  private btnToggleLogs = document.getElementById('btn-toggle-logs') as HTMLButtonElement | null;
  private logViewer = document.getElementById('log-viewer') as HTMLElement | null;
  private logContainer = document.getElementById('log-container') as HTMLElement | null;
  private logEmptyState = document.getElementById('log-empty-state') as HTMLElement | null;
  private chkAutoscroll = document.getElementById('chk-autoscroll') as HTMLInputElement | null;
  private btnCopyLogs = document.getElementById('btn-copy-logs') as HTMLButtonElement | null;
  private btnExportLogs = document.getElementById('btn-export-logs') as HTMLButtonElement | null;
  private btnClearLogs = document.getElementById('btn-clear-logs') as HTMLButtonElement | null;
  private logTabs = document.getElementById('log-tabs') as HTMLElement | null;
  private levelFilters = document.getElementById('level-filters') as HTMLElement | null;
  private inputLogSearch = document.getElementById('input-log-search') as HTMLInputElement | null;
  private btnClearSearch = document.getElementById('btn-clear-search') as HTMLButtonElement | null;
  private logMetricsCounter = document.getElementById('log-metrics-counter') as HTMLElement | null;

  // Badge Count Elements
  private badgeCountAll = document.getElementById('badge-count-all') as HTMLElement | null;
  private badgeCountGateway = document.getElementById('badge-count-gateway') as HTMLElement | null;
  private badgeCountCore = document.getElementById('badge-count-core') as HTMLElement | null;
  private badgeCountNetwork = document.getElementById('badge-count-network') as HTMLElement | null;
  private badgeCountSetup = document.getElementById('badge-count-setup') as HTMLElement | null;
  private badgeErrorCount = document.getElementById('badge-error-count') as HTMLElement | null;
  private badgeWarnCount = document.getElementById('badge-warn-count') as HTMLElement | null;

  constructor(private windowApi: DesktopApi) {
    this.setupEventListeners();
  }

  public normalizeServiceCategory(service: string): 'gateway' | 'core' | 'network' | 'setup' {
    const s = (service || '').toLowerCase();
    if (s.includes('nginx') || s.includes('gateway') || s.includes('caddy') || s.includes('franken')) return 'gateway';
    if (s.includes('wp') || s.includes('core') || s.includes('php') || s.includes('sqlite') || s.includes('mariadb')) return 'core';
    if (s.includes('avahi') || s.includes('network') || s.includes('mdns') || s.includes('mesh')) return 'network';
    return 'setup';
  }

  private entryMatchesFilters(entry: LogEntry): boolean {
    if (this.activeServiceFilter !== 'all') {
      const cat = this.normalizeServiceCategory(entry.service);
      if (cat !== this.activeServiceFilter && entry.service.toLowerCase() !== this.activeServiceFilter.toLowerCase()) {
        return false;
      }
    }

    if (this.activeLevelFilter !== 'all') {
      const entryLevel = entry.level || 'info';
      if (entryLevel !== this.activeLevelFilter) {
        return false;
      }
    }

    if (this.searchFilterQuery.trim()) {
      const q = this.searchFilterQuery.trim().toLowerCase();
      const matchesText = entry.text.toLowerCase().includes(q);
      const matchesService = entry.service.toLowerCase().includes(q);
      if (!matchesText && !matchesService) {
        return false;
      }
    }

    return true;
  }

  public updateBadgeCounts(): void {
    let countAll = 0;
    let countGateway = 0;
    let countCore = 0;
    let countNetwork = 0;
    let countSetup = 0;
    let countErrors = 0;
    let countWarns = 0;

    for (const entry of this.logBuffer) {
      countAll++;
      const cat = this.normalizeServiceCategory(entry.service);
      if (cat === 'gateway') countGateway++;
      else if (cat === 'core') countCore++;
      else if (cat === 'network') countNetwork++;
      else countSetup++;

      if (entry.level === 'error') countErrors++;
      else if (entry.level === 'warn') countWarns++;
    }

    if (this.badgeCountAll) this.badgeCountAll.textContent = countAll.toString();
    if (this.badgeCountGateway) this.badgeCountGateway.textContent = countGateway.toString();
    if (this.badgeCountCore) this.badgeCountCore.textContent = countCore.toString();
    if (this.badgeCountNetwork) this.badgeCountNetwork.textContent = countNetwork.toString();
    if (this.badgeCountSetup) this.badgeCountSetup.textContent = countSetup.toString();
    if (this.badgeErrorCount) this.badgeErrorCount.textContent = countErrors.toString();
    if (this.badgeWarnCount) this.badgeWarnCount.textContent = countWarns.toString();
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private formatLogTimestamp(ts?: number): string {
    const d = ts ? new Date(ts) : new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
  }

  private renderSingleEntryHtml(entry: LogEntry): string {
    const timeStr = this.formatLogTimestamp(entry.timestamp);
    const category = this.normalizeServiceCategory(entry.service);
    const tagClass = `log-tag-${category}`;
    const level = entry.level || 'info';

    const entryClass = level === 'error' 
      ? 'log-line-entry error-entry' 
      : (level === 'warn' ? 'log-line-entry warn-entry' : (level === 'debug' ? 'log-line-entry debug-entry' : 'log-line-entry'));
    const pillClass = `log-level-pill level-${level}`;
    const pillLabel = level === 'error' ? '[ERR]' : (level === 'warn' ? '[WRN]' : (level === 'debug' ? '[DBG]' : '[INF]'));

    let escaped = this.escapeHtml(entry.text);

    if (this.searchFilterQuery.trim()) {
      const escapedQuery = this.searchFilterQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      escaped = escaped.replace(regex, '<mark class="log-highlight">$1</mark>');
    }

    escaped = escaped.replace(/(https?:\/\/[^\s&<]+)/g, '<span class="log-url">$1</span>');
    escaped = escaped.replace(/(\/(?:home|var|etc|usr|data|desktop)[^\s:&<]+)/g, '<span class="log-path">$1</span>');

    return `
      <div class="${entryClass}">
        <span class="log-time">${timeStr}</span>
        <span class="log-tag ${tagClass}">${this.escapeHtml(entry.service.toUpperCase())}</span>
        <span class="${pillClass}">${pillLabel}</span>
        <span class="log-text">${escaped}</span>
      </div>
    `;
  }

  public renderLogStream(): void {
    if (!this.logViewer) return;

    const filtered = this.logBuffer.filter(e => this.entryMatchesFilters(e));

    if (this.logMetricsCounter) {
      this.logMetricsCounter.textContent = `${filtered.length} / ${this.logBuffer.length} entries`;
    }

    if (filtered.length === 0) {
      this.logViewer.innerHTML = '';
      this.logEmptyState?.classList.remove('hidden');
    } else {
      this.logEmptyState?.classList.add('hidden');
      this.logViewer.innerHTML = filtered.map(e => this.renderSingleEntryHtml(e)).join('');
    }

    if (this.chkAutoscroll?.checked && this.logContainer) {
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
  }

  public handleIncomingLog(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > 1000) {
      this.logBuffer.shift();
    }

    this.updateBadgeCounts();

    if (!this.entryMatchesFilters(entry)) {
      if (this.logMetricsCounter) {
        const visibleCount = this.logBuffer.filter(e => this.entryMatchesFilters(e)).length;
        this.logMetricsCounter.textContent = `${visibleCount} / ${this.logBuffer.length} entries`;
      }
      return;
    }

    this.logEmptyState?.classList.add('hidden');
    if (this.logViewer) {
      const html = this.renderSingleEntryHtml(entry);
      this.logViewer.insertAdjacentHTML('beforeend', html);
    }

    if (this.logMetricsCounter) {
      const visibleCount = this.logBuffer.filter(e => this.entryMatchesFilters(e)).length;
      this.logMetricsCounter.textContent = `${visibleCount} / ${this.logBuffer.length} entries`;
    }

    if (this.chkAutoscroll?.checked && this.logContainer) {
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
  }

  public setInitialLogs(logs: LogEntry[]): void {
    this.logBuffer = logs;
    this.updateBadgeCounts();
    this.renderLogStream();
  }

  public toggleQuakeConsole(forceOpen?: boolean): void {
    if (!this.quakeConsoleDrawer) return;

    const isCurrentlyOpen = !this.quakeConsoleDrawer.classList.contains('hidden');
    const shouldOpen = forceOpen !== undefined ? forceOpen : !isCurrentlyOpen;

    if (shouldOpen) {
      this.quakeConsoleDrawer.classList.remove('hidden');
      this.btnToggleLogs?.classList.add('is-active');
      setTimeout(() => {
        this.inputLogSearch?.focus();
        this.renderLogStream();
      }, 50);
    } else {
      this.quakeConsoleDrawer.classList.add('hidden');
      this.btnToggleLogs?.classList.remove('is-active');
    }
  }

  public openWithFilter(serviceCategory: string): void {
    this.activeServiceFilter = serviceCategory;
    this.toggleQuakeConsole(true);
    if (this.logTabs) {
      this.logTabs.querySelectorAll('.log-tab').forEach(t => {
        const isMatch = t.getAttribute('data-service') === serviceCategory;
        if (isMatch) t.classList.add('active');
        else t.classList.remove('active');
      });
    }
    this.renderLogStream();
  }

  private async copyUrlToClipboard(text: string, btn: HTMLElement | null): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
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
      console.error('Failed to copy', err);
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        const activeEl = document.activeElement;
        const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;
        if (!isInput || activeEl === this.inputLogSearch) {
          e.preventDefault();
          this.toggleQuakeConsole();
        }
      } else if (e.key === 'Escape') {
        if (this.quakeConsoleDrawer && !this.quakeConsoleDrawer.classList.contains('hidden')) {
          e.preventDefault();
          this.toggleQuakeConsole(false);
        }
      }
    });

    this.btnToggleLogs?.addEventListener('click', () => this.toggleQuakeConsole());
    this.btnCloseQuake?.addEventListener('click', () => this.toggleQuakeConsole(false));

    // Log Tabs
    if (this.logTabs) {
      this.logTabs.querySelectorAll<HTMLButtonElement>('.log-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeServiceFilter = btn.getAttribute('data-service') || 'all';
          this.logTabs?.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          this.renderLogStream();
        });
      });
    }

    // Log Level Filters
    if (this.levelFilters) {
      this.levelFilters.querySelectorAll<HTMLButtonElement>('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeLevelFilter = btn.getAttribute('data-level') || 'all';
          this.levelFilters?.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderLogStream();
        });
      });
    }

    // Search Input
    if (this.inputLogSearch) {
      this.inputLogSearch.addEventListener('input', () => {
        this.searchFilterQuery = this.inputLogSearch?.value || '';
        if (this.searchFilterQuery.length > 0) {
          this.btnClearSearch?.classList.remove('hidden');
        } else {
          this.btnClearSearch?.classList.add('hidden');
        }
        this.renderLogStream();
      });

      this.btnClearSearch?.addEventListener('click', () => {
        if (this.inputLogSearch) this.inputLogSearch.value = '';
        this.searchFilterQuery = '';
        this.btnClearSearch?.classList.add('hidden');
        this.renderLogStream();
        this.inputLogSearch?.focus();
      });
    }

    // Copy Logs
    this.btnCopyLogs?.addEventListener('click', async () => {
      const filtered = this.logBuffer.filter(e => this.entryMatchesFilters(e));
      const plainText = filtered.map(e => `${this.formatLogTimestamp(e.timestamp)} [${e.service.toUpperCase()}] [${(e.level || 'info').toUpperCase()}] ${e.text}`).join('\n');
      await this.copyUrlToClipboard(plainText, this.btnCopyLogs);
    });

    // Export Logs
    this.btnExportLogs?.addEventListener('click', () => {
      const filtered = this.logBuffer.filter(e => this.entryMatchesFilters(e));
      const plainText = filtered.map(e => `${this.formatLogTimestamp(e.timestamp)} [${e.service.toUpperCase()}] [${(e.level || 'info').toUpperCase()}] ${e.text}`).join('\n');
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

    // Clear Logs
    this.btnClearLogs?.addEventListener('click', async () => {
      this.logBuffer = [];
      try {
        await this.windowApi.clearLogs?.();
      } catch {}
      this.updateBadgeCounts();
      this.renderLogStream();
    });
  }
}
