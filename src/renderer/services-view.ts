import type { ServiceInfo, DesktopApi } from './types';

export class ServicesViewManager {
  // DOM Elements
  private servicesGrid = document.getElementById('services-grid') as HTMLElement | null;
  private servicesCount = document.getElementById('services-count') as HTMLElement | null;

  private statusPillEventHorizon = document.getElementById('status-pill-event-horizon') as HTMLElement | null;
  private dotEventHorizon = document.getElementById('dot-event-horizon') as HTMLElement | null;
  private labelEventHorizon = document.getElementById('label-event-horizon') as HTMLElement | null;

  private statusPillCompass = document.getElementById('status-pill-compass') as HTMLElement | null;
  private dotCompass = document.getElementById('dot-compass') as HTMLElement | null;
  private labelCompass = document.getElementById('label-compass') as HTMLElement | null;

  private statusPillCore = document.getElementById('status-pill-core') as HTMLElement | null;
  private dotCore = document.getElementById('dot-core') as HTMLElement | null;
  private labelCore = document.getElementById('label-core') as HTMLElement | null;

  private statusPillPlatform = document.getElementById('status-pill-platform') as HTMLElement | null;
  private dotPlatform = document.getElementById('dot-platform') as HTMLElement | null;
  private labelPlatform = document.getElementById('label-platform') as HTMLElement | null;
  private platformLayerSubtitle = document.getElementById('platform-layer-subtitle') as HTMLElement | null;

  private layerEventHorizon = document.getElementById('layer-event-horizon') as HTMLElement | null;
  private layerCompass = document.getElementById('layer-compass') as HTMLElement | null;
  private layerHeadlessCore = document.getElementById('layer-headless-core') as HTMLElement | null;
  private layerLampStack = document.getElementById('layer-lamp-stack') as HTMLElement | null;
  private localMachinePill = document.getElementById('local-machine-pill') as HTMLElement | null;

  constructor(
    private windowApi: DesktopApi,
    private onFilterLogs: (category: string) => void,
    private getCurrentGatewayUrl: () => string
  ) {
    this.setupLayerListeners();
  }

  private setupLayerListeners(): void {
    this.layerEventHorizon?.addEventListener('click', () => this.onFilterLogs('gateway'));
    this.layerCompass?.addEventListener('click', () => this.onFilterLogs('core'));
    this.layerHeadlessCore?.addEventListener('click', () => this.onFilterLogs('core'));
    this.layerLampStack?.addEventListener('click', () => this.onFilterLogs('network'));
    this.localMachinePill?.addEventListener('click', () => this.onFilterLogs('all'));
  }

  public applyLayerStatus(
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

  public renderModelView(services: ServiceInfo[], engineType?: string): void {
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

    this.applyLayerStatus(this.layerEventHorizon, this.statusPillEventHorizon, this.dotEventHorizon, this.labelEventHorizon, nginxService);
    this.applyLayerStatus(this.layerCompass, this.statusPillCompass, this.dotCompass, this.labelCompass, wpService || nginxService);
    this.applyLayerStatus(this.layerHeadlessCore, this.statusPillCore, this.dotCore, this.labelCore, wpService || nginxService);

    const platformService = avahiService || dbService || nginxService;
    if (this.platformLayerSubtitle) {
      const isDocker = engineType === 'docker';
      this.platformLayerSubtitle.textContent = isDocker
        ? 'Isolated Gateway, PHP 8.3 FPM & Docker Network'
        : 'Isolated Gateway, FrankenPHP Native & ZeroConf Mesh';
    }
    this.applyLayerStatus(this.layerLampStack, this.statusPillPlatform, this.dotPlatform, this.labelPlatform, platformService);

    const isAnyError = serviceList.some(s => s.status === 'error');
    if (this.localMachinePill) {
      if (isAnyError) {
        this.localMachinePill.classList.add('error');
      } else {
        this.localMachinePill.classList.remove('error');
      }
    }
  }

  private getServiceVisualMeta(service: ServiceInfo): {
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
        actionTarget: this.getCurrentGatewayUrl() || 'https://my.youmeos.com'
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

  private getServiceSvgGraphic(type: 'gateway' | 'core' | 'network', isRunning: boolean): string {
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

  public renderServices(services: ServiceInfo[]): void {
    if (!this.servicesGrid) return;

    if (!services || services.length === 0) {
      this.servicesGrid.innerHTML = `
        <div class="service-card" style="text-align: center; justify-content: center; color: var(--text-muted);">
          No active services detected.
        </div>
      `;
      if (this.servicesCount) this.servicesCount.textContent = '0 / 0';
      return;
    }

    const runningCount = services.filter(s => s.status === 'running').length;
    if (this.servicesCount) this.servicesCount.textContent = `${runningCount} / ${services.length}`;

    this.servicesGrid.innerHTML = services.map(s => {
      const isRunning = s.status === 'running';
      const isStarting = s.status === 'starting';
      const isError = s.status === 'error';
      const statusClass = isRunning ? 'running' : (isStarting ? 'starting' : (isError ? 'error' : 'stopped'));
      const statusLabel = isRunning ? 'Online' : (isStarting ? 'Starting' : (isError ? 'Error' : 'Offline'));
      const meta = this.getServiceVisualMeta(s);

      const formattedPorts = s.ports && s.ports.length > 0 
        ? s.ports.map(p => {
            if (p === '80' || p === '443') return `${p}`;
            return p.replace(/->/g, ' → ');
          }).join(', ')
        : '';
      const portTag = formattedPorts ? `<span class="service-spec-tag highlight">Port: ${formattedPorts}</span>` : '';

      const specTagsHtml = meta.specTags.map(tag => `<span class="service-spec-tag">${tag}</span>`).join('');
      const svgVisual = this.getServiceSvgGraphic(meta.iconType, isRunning);

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

    this.servicesGrid.querySelectorAll<HTMLElement>('.service-card').forEach(card => {
      card.addEventListener('click', () => {
        const action = card.getAttribute('data-action');
        const target = card.getAttribute('data-target');
        if (action === 'open-gateway' && target) {
          this.windowApi.openUrl(target);
        } else if (action === 'filter-logs' && target) {
          this.onFilterLogs(target);
        }
      });
    });
  }
}
