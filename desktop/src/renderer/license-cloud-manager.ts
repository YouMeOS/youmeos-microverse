import type { DesktopApi } from './types';
import { COMPASS_TIER_COLORS } from './architecture-3d';

export interface CompassPluginData {
  id: string;
  name: string;
  type: 'spark' | 'portal';
  tagline: string;
  description: string;
  minTier: 'black' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'uranium' | 'titanium' | 'palladium';
}

export interface TierInfo {
  id: string;
  name: string;
  color: string;
  track: 'micro' | 'macro' | 'omni';
  localPrice: string;
  cloudDiyPrice: string;
  whiteGlovePrice: string;
  whiteGloveHours: number;
  target: string;
  specs: string[];
  features: string[];
  url: string;
}

export const TIER_ORDER = [
  'black',
  'bronze',
  'silver',
  'silver-enhanced',
  'gold',
  'gold-enhanced',
  'platinum',
  'platinum-enhanced',
  'uranium',
  'titanium',
  'palladium'
];

export const COMPASS_PLUGINS: CompassPluginData[] = [
  // Core Quantum / Black tier sparks & portals
  { id: 'u-nucleos', name: 'YouMeOS Nucleos', type: 'spark', tagline: 'Personal Operating System WebTop', description: 'Sovereign desktop WebTop with 4D star navigation and detachable PWA mini-verse.', minTier: 'black' },
  { id: 'bubblegum', name: 'Bubblegum', type: 'spark', tagline: 'Kinetic Task & Focus Engine', description: 'Streamlined task management, focus streaks, and kinetic workflow tracking.', minTier: 'black' },
  { id: 'notepad', name: 'Alphabet Soup', type: 'spark', tagline: 'Rich Text Scratchpad', description: 'Fast markdown notes, code snippets, and persistent local scratchpad storage.', minTier: 'black' },
  { id: 'jukebox', name: 'Beat Salad', type: 'spark', tagline: 'Audio & Web Radio Player', description: 'Integrated web radio, audio playlists, and ambient sound player for your workspace.', minTier: 'black' },
  { id: 'enchiridion', name: 'Enchiridion', type: 'spark', tagline: 'Sacred Knowledge Manual', description: 'Interactive platform architecture documentation, cheat sheets, and handbook.', minTier: 'black' },
  { id: 'cookie-jar', name: 'Cookie Jar', type: 'spark', tagline: 'Privacy & Session Vault', description: 'Granular cookie management, sovereign session storage, and client consent vault.', minTier: 'black' },
  { id: 'my-compass', name: 'My COMPASS Framework', type: 'portal', tagline: 'True North Navigator & Gamification', description: 'Core framework powering XP gamification, role access, and sparks orchestration.', minTier: 'black' },
  { id: 'event-horizon', name: 'Event Horizon', type: 'portal', tagline: '3D Spatial Canvas Engine', description: '3D WebGL spatial canvas and Vue 3 micro-frontend routing engine.', minTier: 'black' },
  { id: 'true-north', name: 'True North', type: 'portal', tagline: 'XP Gamification & Loyalty', description: 'Gamified reward levels, quest progression, achievement badges, and loyalty streaks.', minTier: 'black' },
  { id: 'bugnet', name: 'Bug-Catching Net', type: 'portal', tagline: 'QA Telemetry & Feedback', description: 'Instant visual issue reporting and frontend debugging feedback net.', minTier: 'black' },
  { id: 'command-deck', name: 'Command Deck', type: 'portal', tagline: 'Operations & Products Hub', description: 'Unified business control center for managing orders, products, and platform operations.', minTier: 'black' },

  // Bronze tier additions
  { id: 'questbook-crm', name: 'Questbook CRM', type: 'portal', tagline: 'Customer Portal & CRM', description: 'Track client milestones, customer accounts, and reward points in a unified hub.', minTier: 'bronze' },
  { id: 'bomb-bag', name: 'Bomb Bag News Flash', type: 'portal', tagline: 'Real-Time Broadcast Engine', description: 'Instant notification broadcasts, banner flashes, and release news across your app.', minTier: 'bronze' },

  // Silver tier additions
  { id: 'xophz-magic-formula', name: 'Magic Formula', type: 'spark', tagline: 'Automation Recipe & Form Builder', description: 'Visual trigger-action recipe builder with multi-step branches and conditional logic.', minTier: 'silver' },
  { id: 'terminal', name: 'HoloShell CLI', type: 'spark', tagline: 'Holographic Command Terminal', description: 'Direct node shell management, script execution, and diagnostic command access.', minTier: 'silver' },
  { id: 'sys-monitor', name: 'System Monitor', type: 'spark', tagline: 'Live Node Telemetry', description: 'Real-time CPU, RAM, disk I/O, and container response time telemetry.', minTier: 'silver' },
  { id: 'trajectory', name: 'Trajectory', type: 'portal', tagline: 'Marketing Funnels & Growth', description: 'Accelerate growth through conversion funnels, campaign tracking, and lead capture.', minTier: 'silver' },
  { id: 'castle-walls', name: 'Castle Walls WAF', type: 'portal', tagline: 'Security & Mirror Shield', description: 'Granular firewall rules, bot-mitigation, rate-limiting, and sovereign data vaulting.', minTier: 'silver' },
  { id: 'wizards-tower', name: "Wizard's Tower", type: 'portal', tagline: 'Dev Tools & Page Builder', description: 'Advanced theme builders, dev configs, and platform magic orchestration.', minTier: 'silver' },

  // Gold tier additions
  { id: 'logos', name: 'Logos Multiverse', type: 'portal', tagline: 'Sovereign Multiverse Command', description: 'Admin web management portal orchestrating multiple domain nodes and portals.', minTier: 'gold' },
  { id: 'helios', name: 'Helios Studio', type: 'portal', tagline: 'Solar Media Studio', description: 'Publish and syndicate multimedia content, audio playlists, and visual assets.', minTier: 'gold' },

  // Platinum tier additions
  { id: 'nexos', name: 'Nexos Intelligence', type: 'portal', tagline: 'Multi-Agent AI Network', description: 'Autonomous agents cooperating across business workflows and automated data synthesis.', minTier: 'platinum' },
  { id: 'noosphere', name: 'Noosphere Resonance', type: 'portal', tagline: 'Collective Intelligence Space', description: 'Explore the collective thought space and universal resonance network.', minTier: 'platinum' },

  // Titanium & Palladium tier additions
  { id: 'blackbox', name: 'BlackBOX Diagnostics', type: 'spark', tagline: 'Kernel Telemetry & Internals', description: 'Direct kernel telemetry, real-time memory profiling, and cluster state inspector.', minTier: 'titanium' }
];

export const BOX_TIERS: TierInfo[] = [
  {
    id: 'quantum',
    name: 'Quantum',
    color: '#00f2fe',
    track: 'micro',
    localPrice: '$9.99/mo',
    cloudDiyPrice: '$14.99/mo',
    whiteGlovePrice: '$149/mo',
    whiteGloveHours: 1,
    target: 'Bloggers, Portfolio Owners, Freelancers, Solo Creators, Students, Hobbyists',
    specs: ['1 vCPU Dedicated Core', '512MB High-Speed RAM', '10GB Storage', '5TB Dedicated Bandwidth'],
    features: ['YouMeOS WebTop OS', 'Gamification & XP Engine', 'QA & Bug Reporting Net', 'Full Tesseract Framework'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29371/302083/'
  },
  {
    id: 'bronze',
    name: 'Bronze',
    color: '#cd7f32',
    track: 'micro',
    localPrice: '$19.99/mo',
    cloudDiyPrice: '$34.99/mo',
    whiteGlovePrice: '$199/mo',
    whiteGloveHours: 1,
    target: 'Local Shops, Contractors, Salons, Cafes, Fitness Instructors, Tradespeople',
    specs: ['1 vCPU Dedicated Core', '1GB High-Speed RAM', '25GB Storage', '10TB Dedicated Bandwidth'],
    features: ['All Quantum Features', 'Questbook CRM Lead Capture', 'Bomb Bag Broadcasts', 'Automated Daily Safeguards'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29501/302084/'
  },
  {
    id: 'silver',
    name: 'Silver',
    color: '#c0c0c0',
    track: 'micro',
    localPrice: '$39.99/mo',
    cloudDiyPrice: '$74.99/mo',
    whiteGlovePrice: '$299/mo',
    whiteGloveHours: 1.5,
    target: 'Consultants, Photographers, Digital Marketers, Web Designers, Content Creators',
    specs: ['2 vCPU Dedicated Cores', '2GB High-Speed RAM', '65GB NVMe Storage', '25TB Dedicated Bandwidth'],
    features: ['All Bronze Features', 'Magic Formula Automations', 'HoloShell CLI & System Monitor', 'Castle Walls WAF Defense'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29504/302085/'
  },
  {
    id: 'silver-enhanced',
    name: 'Silver Enhanced',
    color: '#e5e4e2',
    track: 'micro',
    localPrice: '$49.99/mo',
    cloudDiyPrice: '$99.99/mo',
    whiteGlovePrice: '$399/mo',
    whiteGloveHours: 2,
    target: 'Lawyers, Dentists, Accountants, Real Estate Agents, Private Clinics, Boutiques',
    specs: ['2 vCPU Dedicated Cores', '4GB High-Speed RAM', '128GB Storage', '25TB Dedicated Bandwidth'],
    features: ['All Silver Features', "Wizard's Tower Dev Studio", 'E-Commerce Storefront', 'High-Speed Page Cache'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/42889/290370/'
  },
  {
    id: 'gold',
    name: 'Gold',
    color: '#ffd700',
    track: 'macro',
    localPrice: '$69.99/mo',
    cloudDiyPrice: '$129.99/mo',
    whiteGlovePrice: '$599/mo',
    whiteGloveHours: 3,
    target: 'E-Commerce Brands, Software Startups, PR Agencies, Financial Advisors, Tech Firms',
    specs: ['4 vCPU Dedicated Cores', '8GB High-Speed RAM', '160GB NVMe Storage', '100TB Dedicated Bandwidth'],
    features: ['All Silver Enhanced Features', 'Logos Multiverse Command', 'Helios Media Studio', 'Automated Sales Funnels'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29505/302086/'
  },
  {
    id: 'gold-enhanced',
    name: 'Gold Enhanced',
    color: '#ffd700',
    track: 'macro',
    localPrice: '$119.99/mo',
    cloudDiyPrice: '$242.40/mo',
    whiteGlovePrice: '$799/mo',
    whiteGloveHours: 4,
    target: 'Mid-Size Agencies, Course Creators, Media Companies, SaaS Founders, Large Law Firms',
    specs: ['4 vCPU Dedicated Cores', '16GB High-Speed RAM', '384GB NVMe Storage', '100TB Dedicated Bandwidth'],
    features: ['All Gold Features', 'AI Content Generator Pipeline', 'Business Intelligence Telemetry', 'Multi-App Cluster Setup'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/42890/290371/'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    color: '#a0b2c6',
    track: 'macro',
    localPrice: '$149.99/mo',
    cloudDiyPrice: '$299/mo',
    whiteGlovePrice: '$999/mo',
    whiteGloveHours: 5,
    target: 'High-Volume Stores, B2B Enterprises, Digital Publishers, Investment Firms',
    specs: ['6 vCPU Dedicated Cores', '16GB High-Speed RAM', '320GB Storage', '200TB Dedicated Bandwidth'],
    features: ['All Gold Enhanced Features', 'Nexos Multi-Agent AI Network', 'Turn-Key Agency Hub', 'Custom Single Sign-On'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29545/302087/'
  },
  {
    id: 'platinum-enhanced',
    name: 'Platinum Enhanced',
    color: '#a0b2c6',
    track: 'macro',
    localPrice: '$199.99/mo',
    cloudDiyPrice: '$420.42/mo',
    whiteGlovePrice: '$1,499/mo',
    whiteGloveHours: 7.5,
    target: 'Franchises, Marketing Networks, Healthcare Providers, Multi-Location Retailers',
    specs: ['6 vCPU Dedicated Cores', '24GB High-Speed RAM', '448GB Storage', '200TB Dedicated Bandwidth'],
    features: ['All Platinum Features', 'Noosphere Resonance Space', 'White-Label Branding Engine', 'High-Capacity Cluster'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/42891/290372/'
  },
  {
    id: 'uranium',
    name: 'Uranium',
    color: '#3dee98',
    track: 'omni',
    localPrice: '$299.99/mo',
    cloudDiyPrice: '$650/mo',
    whiteGlovePrice: '$1,999/mo',
    whiteGloveHours: 10,
    target: 'Enterprise E-Commerce, Financial Institutions, Media Conglomerates, Global Agencies',
    specs: ['8 vCPU Dedicated Cores', '32GB High-Speed RAM', '640GB Storage', '250TB Dedicated Bandwidth'],
    features: ['All Platinum Enhanced Features', 'Enterprise Regulatory Compliance', 'Real-Time Threat Shield', 'Zero-Downtime Sandbox'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29546/302088/'
  },
  {
    id: 'titanium',
    name: 'Titanium',
    color: '#00e5ff',
    track: 'omni',
    localPrice: '$599.99/mo',
    cloudDiyPrice: '$1250/mo',
    whiteGlovePrice: '$2,499/mo',
    whiteGloveHours: 12,
    target: 'Multinational Corporations, Cloud SaaS Providers, High-Traffic News Outlets',
    specs: ['16 vCPU Dedicated Cores', '64GB High-Speed RAM', '1.28TB SSD', '250TB+ Dedicated Bandwidth'],
    features: ['All Uranium Features', 'BlackBOX Kernel Diagnostics', 'Auto-Scaling Engine', 'Self-Healing Infrastructure'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29547/302089/'
  },
  {
    id: 'palladium',
    name: 'Palladium',
    color: '#e6e6fa',
    track: 'omni',
    localPrice: '$999.99/mo',
    cloudDiyPrice: '$2499/mo',
    whiteGlovePrice: '$4,999/mo',
    whiteGloveHours: 20,
    target: 'Global Enterprises, Infrastructure Providers, Fortune 500s, Massive User Networks',
    specs: ['24 vCPU Dedicated Cores', '96GB High-Speed RAM', '2.5TB+ SSD', 'Unlimited Global Bandwidth'],
    features: ['All Titanium Features', 'Omni-Sovereign Core Network API', 'Global Network Sync', '20h Principal Systems Retainer'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29548/302090/'
  }
];

export class LicenseCloudManager {
  private currentTier: string = 'black';
  private currentKey: string = '';
  private currentStatus: 'active' | 'trial' | 'unverified' = 'active';
  private activeSparkFilter: 'all' | 'spark' | 'portal' = 'all';

  // Cloud Hub State
  private activeCloudMode: 'diy' | 'whiteglove' = 'diy';
  private activeCloudTrack: 'all' | 'micro' | 'macro' | 'omni' = 'all';

  // DOM References
  private modalLicense = document.getElementById('modal-compass-license') as HTMLElement | null;
  private modalCloud = document.getElementById('modal-cloud-boxes') as HTMLElement | null;
  private modalDiyComingSoon = document.getElementById('modal-diy-coming-soon') as HTMLElement | null;

  // License Modal Elements
  private licenseActiveHero = document.getElementById('license-active-hero') as HTMLElement | null;
  private licenseActiveTierPill = document.getElementById('license-active-tier-pill') as HTMLElement | null;
  private licenseActiveStatusTag = document.getElementById('license-active-status-tag') as HTMLElement | null;
  private licenseActivePrice = document.getElementById('license-active-price') as HTMLElement | null;
  private licenseActiveDesc = document.getElementById('license-active-desc') as HTMLElement | null;
  private licenseActiveKeyCode = document.getElementById('license-active-key-code') as HTMLElement | null;
  private licenseSparksGrid = document.getElementById('license-sparks-grid') as HTMLElement | null;
  private sparksCountBadge = document.getElementById('sparks-count-badge') as HTMLElement | null;
  private inputLicenseKey = document.getElementById('input-license-key') as HTMLInputElement | null;
  private licenseFeedbackMsg = document.getElementById('license-feedback-msg') as HTMLElement | null;

  // Header & FAB Pills
  private headerLicenseLabel = document.getElementById('header-license-label') as HTMLElement | null;
  private headerLicenseDot = document.getElementById('header-license-dot') as HTMLElement | null;
  private splashFabLicenseTitle = document.getElementById('splash-fab-license-title') as HTMLElement | null;

  // Cloud Hub Elements
  private cloudTiersGrid = document.getElementById('cloud-tiers-grid') as HTMLElement | null;
  private modeBannerText = document.getElementById('mode-banner-text') as HTMLElement | null;

  constructor(
    private windowApi: DesktopApi,
    private onTierChanged: (tier: string) => void
  ) {
    this.loadPersistedState();
    this.setupEventListeners();
    this.renderLicenseUI();
    this.renderCloudTiers();
  }

  private loadPersistedState(): void {
    const savedTier = localStorage.getItem('youmeosLicenseTier') || 'black';
    const savedKey = localStorage.getItem('youmeosLicenseKey') || 'BLCK-SOVEREIGN-LOCAL-2026';
    const savedStatus = (localStorage.getItem('youmeosLicenseStatus') as any) || 'active';

    this.currentTier = savedTier;
    this.currentKey = savedKey;
    this.currentStatus = savedStatus;
  }

  public getCurrentTier(): string {
    return this.currentTier;
  }

  public openLicenseModal(): void {
    if (!this.modalLicense) return;
    this.modalLicense.classList.remove('hidden');
    this.renderLicenseUI();
  }

  public closeLicenseModal(): void {
    if (!this.modalLicense) return;
    this.modalLicense.classList.add('hidden');
  }

  public openCloudHub(mode: 'diy' | 'whiteglove' = 'whiteglove'): void {
    if (mode === 'diy') {
      this.openDiyComingSoonModal();
      return;
    }
    if (!this.modalCloud) return;
    this.activeCloudMode = mode;
    this.updateCloudModeToggleUI();
    this.modalCloud.classList.remove('hidden');
    this.renderCloudTiers();
  }

  public closeCloudHub(): void {
    if (!this.modalCloud) return;
    this.modalCloud.classList.add('hidden');
  }

  public openDiyComingSoonModal(): void {
    if (!this.modalDiyComingSoon) return;
    this.modalDiyComingSoon.classList.remove('hidden');
  }

  public closeDiyComingSoonModal(): void {
    if (!this.modalDiyComingSoon) return;
    this.modalDiyComingSoon.classList.add('hidden');
  }

  public setTier(tier: string, key?: string): void {
    const normalized = (tier || 'black').toLowerCase().replace('box', '').replace('-enhanced', '');
    this.currentTier = normalized;
    if (key) {
      this.currentKey = key;
      localStorage.setItem('youmeosLicenseKey', key);
    }
    localStorage.setItem('youmeosLicenseTier', normalized);
    localStorage.setItem('youmeosLicenseStatus', 'active');
    this.currentStatus = 'active';

    this.renderLicenseUI();
    this.onTierChanged(normalized);
  }

  private setupEventListeners(): void {
    // Close buttons
    document.getElementById('btn-close-license-modal')?.addEventListener('click', () => this.closeLicenseModal());
    document.getElementById('btn-footer-close-license')?.addEventListener('click', () => this.closeLicenseModal());
    document.getElementById('btn-close-cloud-modal')?.addEventListener('click', () => this.closeCloudHub());
    document.getElementById('btn-footer-close-cloud')?.addEventListener('click', () => this.closeCloudHub());

    // DIY Coming Soon modal listeners
    document.getElementById('btn-close-coming-soon-modal')?.addEventListener('click', () => this.closeDiyComingSoonModal());
    document.getElementById('btn-footer-close-coming-soon')?.addEventListener('click', () => this.closeDiyComingSoonModal());
    
    // Bridge from DIY Coming Soon directly into White Glove
    const bridgeToWhiteGlove = () => {
      this.closeDiyComingSoonModal();
      this.openCloudHub('whiteglove');
    };
    document.getElementById('btn-bridge-to-whiteglove')?.addEventListener('click', bridgeToWhiteGlove);
    document.getElementById('btn-coming-soon-whiteglove')?.addEventListener('click', bridgeToWhiteGlove);

    // Switch from license modal to cloud modal
    document.getElementById('btn-open-cloud-from-license')?.addEventListener('click', () => {
      this.closeLicenseModal();
      this.openCloudHub('whiteglove');
    });

    // License key activation
    document.getElementById('btn-activate-license')?.addEventListener('click', () => this.handleKeyActivation());
    this.inputLicenseKey?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleKeyActivation();
    });

    // Tier preview selector buttons
    document.querySelectorAll<HTMLButtonElement>('.tier-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTier = btn.getAttribute('data-tier');
        if (targetTier) {
          this.setTier(targetTier, `${targetTier.toUpperCase().slice(0, 4)}-PREVIEW-SANDBOX-2026`);
          if (this.licenseFeedbackMsg) {
            this.licenseFeedbackMsg.textContent = `Switched preview to ${btn.textContent?.trim()} (3D matrix synchronized)`;
            this.licenseFeedbackMsg.className = 'license-feedback-msg success';
          }
        }
      });
    });

    // Spark filter tabs in license modal
    document.querySelectorAll<HTMLButtonElement>('.spark-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.spark-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSparkFilter = (btn.getAttribute('data-spark-type') as any) || 'all';
        this.renderSparksGrid();
      });
    });

    // Cloud Hub Mode toggle (DIY vs White Glove)
    document.querySelectorAll<HTMLButtonElement>('.funnel-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as 'diy' | 'whiteglove';
        if (mode === 'diy') {
          this.openDiyComingSoonModal();
          return;
        }
        if (mode) {
          this.activeCloudMode = mode;
          this.updateCloudModeToggleUI();
          this.renderCloudTiers();
        }
      });
    });

    // Cloud Hub Track filter
    document.querySelectorAll<HTMLButtonElement>('.track-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.track-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCloudTrack = (btn.getAttribute('data-track') as any) || 'all';
        this.renderCloudTiers();
      });
    });
  }

  private handleKeyActivation(): void {
    const rawKey = this.inputLicenseKey?.value.trim().toUpperCase() || '';
    if (!rawKey) {
      this.showFeedback('Please enter a valid license key', 'error');
      return;
    }

    let detectedTier = 'black';
    if (rawKey.startsWith('BRNZ')) detectedTier = 'bronze';
    else if (rawKey.startsWith('SLVR')) detectedTier = 'silver';
    else if (rawKey.startsWith('GOLD')) detectedTier = 'gold';
    else if (rawKey.startsWith('PLAT')) detectedTier = 'platinum';
    else if (rawKey.startsWith('URAN')) detectedTier = 'uranium';
    else if (rawKey.startsWith('TITN')) detectedTier = 'titanium';
    else if (rawKey.startsWith('PLDM')) detectedTier = 'palladium';
    else if (rawKey.startsWith('BLCK') || rawKey.startsWith('QNTM')) detectedTier = 'black';

    this.setTier(detectedTier, rawKey);
    this.showFeedback(`License key successfully verified! ${detectedTier.toUpperCase()} tier unlocked.`, 'success');
    if (this.inputLicenseKey) this.inputLicenseKey.value = '';
  }

  private showFeedback(msg: string, type: 'success' | 'error'): void {
    if (!this.licenseFeedbackMsg) return;
    this.licenseFeedbackMsg.textContent = msg;
    this.licenseFeedbackMsg.className = `license-feedback-msg ${type}`;
    setTimeout(() => {
      if (this.licenseFeedbackMsg && this.licenseFeedbackMsg.textContent === msg) {
        this.licenseFeedbackMsg.textContent = '';
      }
    }, 4000);
  }

  private updateCloudModeToggleUI(): void {
    document.querySelectorAll<HTMLButtonElement>('.funnel-toggle-btn').forEach(btn => {
      const isCurrent = btn.getAttribute('data-mode') === this.activeCloudMode;
      btn.classList.toggle('active', isCurrent);
    });

    if (this.modeBannerText) {
      if (this.activeCloudMode === 'diy') {
        this.modeBannerText.innerHTML = '<strong>DIY Cloud Boxes:</strong> Automated dedicated container provisioning on the w⁴ Hub. Includes isolated vCPU/RAM hardware resources + pre-installed Compass Spark suite.';
      } else {
        this.modeBannerText.innerHTML = '<strong>White Glove Service:</strong> Fully managed turnkey deployment + dedicated monthly concierge consulting retainer hours with our engineering team.';
      }
    }
  }

  public renderLicenseUI(): void {
    const tierKey = this.currentTier;
    const tierData = BOX_TIERS.find(t => t.id === tierKey) || BOX_TIERS[0];
    const colorDef = COMPASS_TIER_COLORS[tierKey] || COMPASS_TIER_COLORS.black;

    // Update active tier hero
    if (this.licenseActiveTierPill) {
      this.licenseActiveTierPill.textContent = `${tierData.name} Compass`;
      this.licenseActiveTierPill.style.color = colorDef.hex;
    }
    if (this.licenseActiveStatusTag) {
      this.licenseActiveStatusTag.textContent = 'Local BYO Hardware';
      this.licenseActiveStatusTag.style.color = colorDef.hex;
      this.licenseActiveStatusTag.style.borderColor = `${colorDef.hex}60`;
      this.licenseActiveStatusTag.style.background = `${colorDef.hex}20`;
    }
    if (this.licenseActivePrice) {
      this.licenseActivePrice.textContent = `${tierData.localPrice} (Software License)`;
      this.licenseActivePrice.style.color = '#ffd599';
    }
    if (this.licenseActiveDesc) {
      this.licenseActiveDesc.textContent = `${tierData.target}. Includes full ${tierData.name} feature suite with local database encryption and sparks orchestration.`;
    }
    if (this.licenseActiveKeyCode) {
      this.licenseActiveKeyCode.textContent = this.currentKey || 'BLCK-SOVEREIGN-LOCAL-2026';
    }
    if (this.licenseActiveHero) {
      this.licenseActiveHero.style.borderColor = `${colorDef.hex}50`;
    }

    // Update quick switch selector active state
    document.querySelectorAll<HTMLButtonElement>('.tier-select-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-tier') === tierKey;
      btn.classList.toggle('active', isTarget);
      if (isTarget) {
        btn.style.borderColor = colorDef.hex;
        btn.style.boxShadow = `0 0 12px ${colorDef.hex}40`;
      } else {
        btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        btn.style.boxShadow = 'none';
      }
    });

    // Update Header and Splash FAB indicators
    if (this.headerLicenseLabel) {
      this.headerLicenseLabel.textContent = `${tierData.name} Compass`;
    }
    if (this.headerLicenseDot) {
      this.headerLicenseDot.style.background = colorDef.hex;
      this.headerLicenseDot.style.boxShadow = `0 0 8px ${colorDef.hex}`;
    }
    if (this.splashFabLicenseTitle) {
      this.splashFabLicenseTitle.textContent = `${tierData.name} Compass`;
    }

    this.renderSparksGrid();
  }

  private renderSparksGrid(): void {
    if (!this.licenseSparksGrid) return;

    const currentTierIdx = TIER_ORDER.indexOf(this.currentTier);
    const filter = this.activeSparkFilter;

    const filteredPlugins = COMPASS_PLUGINS.filter(p => {
      if (filter === 'spark') return p.type === 'spark';
      if (filter === 'portal') return p.type === 'portal';
      return true;
    });

    let unlockedCount = 0;

    this.licenseSparksGrid.innerHTML = filteredPlugins.map(p => {
      const minTierIdx = TIER_ORDER.indexOf(p.minTier);
      const isUnlocked = currentTierIdx >= minTierIdx;
      if (isUnlocked) unlockedCount++;

      const badgeClass = p.type === 'spark' ? 'spark-tag' : 'portal-tag';
      const badgeLabel = p.type === 'spark' ? 'Spark (PWA)' : 'PHP Portal';

      return `
        <div class="spark-item-card ${isUnlocked ? 'is-unlocked' : 'is-locked'}" title="${isUnlocked ? 'Unlocked in current tier' : `Requires ${p.minTier.toUpperCase()} tier or above`}">
          <div class="spark-icon-tile" style="color: ${isUnlocked ? (p.type === 'spark' ? '#ff007a' : '#62c9ff') : '#64748b'};">
            ${p.type === 'spark' 
              ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>'
              : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>'
            }
          </div>
          <div class="spark-item-info">
            <div class="spark-item-top">
              <span class="spark-item-name">${p.name}</span>
              <span class="spark-item-tag ${badgeClass}">${badgeLabel}</span>
            </div>
            <span class="spark-item-desc">${p.tagline}</span>
          </div>
        </div>
      `;
    }).join('');

    if (this.sparksCountBadge) {
      this.sparksCountBadge.textContent = `${unlockedCount} of ${filteredPlugins.length} Active`;
    }
  }

  public renderCloudTiers(): void {
    if (!this.cloudTiersGrid) return;

    const track = this.activeCloudTrack;
    const mode = this.activeCloudMode;

    const filtered = BOX_TIERS.filter(t => {
      if (track === 'all') return true;
      return t.track === track;
    });

    this.cloudTiersGrid.innerHTML = filtered.map(t => {
      const priceDisplay = mode === 'diy' ? t.cloudDiyPrice : t.whiteGlovePrice;
      const subtitle = mode === 'diy' ? 'Self-Managed w⁴ Box (Coming Soon)' : `Includes ${t.whiteGloveHours}h Monthly Concierge Retainer`;
      const btnClass = mode === 'diy' ? 'diy-btn' : 'whiteglove-btn';
      const btnText = mode === 'diy' ? `DIY ${t.name}Box &bull; Coming Soon` : `Stripe Checkout &bull; Deploy White Glove (${priceDisplay})`;

      // Stripe Checkout URL or configured link
      const checkoutUrl = t.stripeWhiteGloveUrl || t.url || `https://buy.stripe.com/whiteglove_${t.id}`;

      return `
        <div class="cloud-tier-card" style="border-color: ${t.color}30;">
          <div class="cloud-card-top">
            <div class="cloud-card-header">
              <span class="cloud-tier-name" style="color: ${t.color};">${t.name}BOX</span>
              <span class="cloud-tier-track-badge" style="background: ${t.color}20; color: ${t.color}; border: 1px solid ${t.color}50;">
                ${t.track.toUpperCase()}
              </span>
            </div>
            <div class="cloud-tier-price" style="color: ${t.color};">
              ${priceDisplay}
            </div>
            <div class="cloud-tier-target">
              ${subtitle}
            </div>

            <div class="cloud-tier-specs">
              ${t.specs.map(s => `
                <div class="spec-bullet">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="${t.color}" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>${s}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="cloud-card-action">
            <button class="btn-tier-action ${btnClass}" data-mode="${mode}" data-url="${checkoutUrl}" data-tier="${t.id}">
              ${mode === 'diy' 
                ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>'
                : '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>'
              }
              <span>${btnText}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to tier action buttons
    this.cloudTiersGrid.querySelectorAll<HTMLButtonElement>('.btn-tier-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const actionBtnMode = btn.getAttribute('data-mode');
        if (actionBtnMode === 'diy') {
          this.openDiyComingSoonModal();
          return;
        }

        const checkoutUrl = btn.getAttribute('data-url');
        const tier = btn.getAttribute('data-tier') || 'gold';

        if (this.windowApi.openStripeCheckout && checkoutUrl) {
          btn.disabled = true;
          btn.style.opacity = '0.7';
          const originalText = btn.innerHTML;
          btn.innerHTML = '<span>Opening Stripe Checkout...</span>';

          try {
            const result = await this.windowApi.openStripeCheckout(checkoutUrl);
            if (result && result.success && result.tier) {
              this.setTier(result.tier, result.key);
              this.closeCloudHub();
              this.showFeedback(`Payment verified! ${result.tier.toUpperCase()} Compass activated.`, 'success');
            }
          } catch (e) {
            console.error('Stripe checkout error:', e);
            this.windowApi.openUrl(checkoutUrl);
          } finally {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.innerHTML = originalText;
          }
        } else if (checkoutUrl) {
          this.windowApi.openUrl(checkoutUrl);
        }
      });
    });
  }
}
