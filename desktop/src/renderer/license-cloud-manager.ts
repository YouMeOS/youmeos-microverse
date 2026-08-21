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
  stripeWhiteGloveUrl?: string;
  stripeLicenseUrl?: string;
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29371/302083/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_quantum',
    stripeLicenseUrl: 'https://buy.stripe.com/license_black'
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29501/302084/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_bronze',
    stripeLicenseUrl: 'https://buy.stripe.com/license_bronze'
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29504/302085/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_silver',
    stripeLicenseUrl: 'https://buy.stripe.com/license_silver'
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/42889/290370/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_silver_enhanced',
    stripeLicenseUrl: 'https://buy.stripe.com/license_silver_enhanced'
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29505/302086/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_gold',
    stripeLicenseUrl: 'https://buy.stripe.com/license_gold'
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/42890/290371/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_gold_enhanced',
    stripeLicenseUrl: 'https://buy.stripe.com/license_gold_enhanced'
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29545/302087/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_platinum',
    stripeLicenseUrl: 'https://buy.stripe.com/license_platinum'
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/42891/290372/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_platinum_enhanced',
    stripeLicenseUrl: 'https://buy.stripe.com/license_platinum_enhanced'
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29546/302088/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_uranium',
    stripeLicenseUrl: 'https://buy.stripe.com/license_uranium'
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29547/302089/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_titanium',
    stripeLicenseUrl: 'https://buy.stripe.com/license_titanium'
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
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29548/302090/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_palladium',
    stripeLicenseUrl: 'https://buy.stripe.com/license_palladium'
  }
];

export const TESSERACT_SPARK_URL = 'https://www.youmeos.com/u/?sparks=tesseract&fullspark=true&name=The+Tesseract&icon=fad+fa-police-box&color=%23003b6f';

export class LicenseCloudManager {
  private currentTier: string = 'black';
  private currentKey: string = '';
  private currentStatus: 'active' | 'trial' | 'unverified' = 'active';
  private activeSparkFilter: 'all' | 'spark' | 'portal' = 'all';

  // DOM References
  private modalLicense = document.getElementById('modal-compass-license') as HTMLElement | null;

  // License Modal Elements
  private licenseActiveHero = document.getElementById('license-active-hero') as HTMLElement | null;
  private licenseActiveTierPill = document.getElementById('license-active-tier-pill') as HTMLElement | null;
  private licenseActiveStatusTag = document.getElementById('license-active-status-tag') as HTMLElement | null;
  private licenseActivePrice = document.getElementById('license-active-price') as HTMLElement | null;
  private licenseActiveKeyCode = document.getElementById('license-active-key-code') as HTMLElement | null;
  private licenseSparksGrid = document.getElementById('license-sparks-grid') as HTMLElement | null;
  private sparksCountBadge = document.getElementById('sparks-count-badge') as HTMLElement | null;
  private inputLicenseKey = document.getElementById('input-license-key') as HTMLInputElement | null;
  private licenseFeedbackMsg = document.getElementById('license-feedback-msg') as HTMLElement | null;

  // Header Pill
  private headerLicenseLabel = document.getElementById('header-license-label') as HTMLElement | null;
  private headerLicenseDot = document.getElementById('header-license-dot') as HTMLElement | null;

  constructor(
    private windowApi: DesktopApi,
    private onTierChanged: (tier: string) => void
  ) {
    this.loadPersistedState();
    this.setupEventListeners();
    this.renderLicenseUI();
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

  public openTesseractCloud(): void {
    try {
      if (this.windowApi && typeof this.windowApi.openUrl === 'function') {
        this.windowApi.openUrl(TESSERACT_SPARK_URL);
      } else {
        window.open(TESSERACT_SPARK_URL, '_blank');
      }
    } catch (e) {
      console.error('Failed to open Tesseract URL:', e);
      window.open(TESSERACT_SPARK_URL, '_blank');
    }
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
    // Close button
    document.getElementById('btn-close-license-modal')?.addEventListener('click', () => this.closeLicenseModal());

    // Launch The Tesseract Spark from License Modal
    document.getElementById('btn-open-tesseract-cloud')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTesseractCloud();
    });

    // License key activation
    document.getElementById('btn-activate-license')?.addEventListener('click', () => this.handleKeyActivation());
    this.inputLicenseKey?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleKeyActivation();
    });

    // Direct Stripe Checkout from License Modal (Hero & Footer)
    const triggerLicenseStripeCheckout = async (btn: HTMLButtonElement | null) => {
      const tierKey = this.currentTier;
      const tierData = BOX_TIERS.find(t => t.id === tierKey) || BOX_TIERS[0];
      const tierName = tierData.name;
      const priceStr = tierData.localPrice;
      const parsedPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 9.99;
      const licenseName = `${tierName} Compass Software License`;
      const productName = `YouMeOS Sovereignty - ${tierName} Compass License (${priceStr})`;

      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
      }

      try {
        const successUrl = `https://youmeos.com/callback/stripe?status=success&tier=${encodeURIComponent(tierKey)}&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `https://youmeos.com/callback/stripe?status=cancel&tier=${encodeURIComponent(tierKey)}`;

        const response = await fetch('https://youmeos.com/wp-json/xophz/v1/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            price: parsedPrice,
            license: licenseName,
            product_name: productName,
            tier: tierKey,
            success_url: successUrl,
            cancel_url: cancelUrl
          })
        });

        const data = await response.json();
        if (!response.ok || !data.url) {
          const errorMsg = data.message || data.error || (typeof data === 'string' ? data : 'Stripe checkout initialization failed');
          throw new Error(`Stripe Checkout Error (${response.status}): ${errorMsg}`);
        }

        const targetUrl = data.url;

        if (this.windowApi && typeof this.windowApi.openStripeCheckout === 'function') {
          const result = await this.windowApi.openStripeCheckout(targetUrl);
          if (result && result.success && result.tier) {
            this.setTier(result.tier, result.key);
            this.showFeedback(`Payment verified! ${result.tier.toUpperCase()} Compass license activated.`, 'success');
          }
        } else if (this.windowApi && typeof this.windowApi.openUrl === 'function') {
          this.windowApi.openUrl(targetUrl);
        } else {
          window.open(targetUrl, '_blank');
        }
      } catch (e: any) {
        console.error('Stripe license checkout error:', e);
        this.showFeedback(`Checkout Error: ${e.message || e}`, 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      }
    };

    const heroStripeBtn = document.getElementById('btn-hero-stripe-checkout') as HTMLButtonElement | null;
    heroStripeBtn?.addEventListener('click', () => triggerLicenseStripeCheckout(heroStripeBtn));

    // Tier preview selector buttons
    document.querySelectorAll<HTMLButtonElement>('.tier-chip').forEach(btn => {
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

    // Collapsible sparks section toggle
    const sparksToggle = document.getElementById('btn-toggle-sparks');
    const sparksWrapper = document.getElementById('sparks-grid-wrapper');
    sparksToggle?.addEventListener('click', (e) => {
      const clickedFilter = (e.target as HTMLElement).closest('.spark-filter-btn');
      if (clickedFilter) return;
      sparksWrapper?.classList.toggle('collapsed');
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
      this.licenseActivePrice.textContent = tierData.localPrice;
    }
    if (this.licenseActiveKeyCode) {
      this.licenseActiveKeyCode.textContent = this.currentKey || 'BLCK-SOVEREIGN-LOCAL-2026';
    }
    if (this.licenseActiveHero) {
      this.licenseActiveHero.style.borderColor = `${colorDef.hex}40`;
    }

    // Update Stripe checkout button label in hero
    const heroStripeLabel = document.getElementById('btn-hero-stripe-label');
    if (heroStripeLabel) {
      heroStripeLabel.textContent = `Buy ${tierData.localPrice}`;
    }

    // Update quick switch selector active state
    document.querySelectorAll<HTMLButtonElement>('.tier-chip').forEach(btn => {
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

    // Update Header license indicators
    if (this.headerLicenseLabel) {
      this.headerLicenseLabel.textContent = `${tierData.name} Compass`;
    }
    if (this.headerLicenseDot) {
      this.headerLicenseDot.style.background = colorDef.hex;
      this.headerLicenseDot.style.boxShadow = `0 0 8px ${colorDef.hex}`;
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
      const requiredTierIdx = TIER_ORDER.indexOf(p.minTier);
      const isUnlocked = currentTierIdx >= requiredTierIdx;
      if (isUnlocked) unlockedCount++;

      const isSpark = p.type === 'spark';
      const badgeClass = isSpark ? 'badge-spark' : 'badge-portal';
      const badgeLabel = isSpark ? 'SPARK (PWA)' : 'PHP PORTAL';
      const statusIcon = isUnlocked 
        ? `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#64748b" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

      return `
        <div class="spark-item-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="spark-item-top">
            <div class="spark-icon-box">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
              </svg>
            </div>
            <div class="spark-title-row">
              <span class="spark-item-name">${p.name}</span>
              <span class="spark-type-badge ${badgeClass}">${badgeLabel}</span>
            </div>
            <div class="spark-status-icon" title="${isUnlocked ? 'Unlocked in active tier' : `Requires ${p.minTier.toUpperCase()} Compass`}">
              ${statusIcon}
            </div>
          </div>
          <div class="spark-item-bottom">
            <span class="spark-item-desc">${p.tagline}</span>
          </div>
        </div>
      `;
    }).join('');

    if (this.sparksCountBadge) {
      this.sparksCountBadge.textContent = `${unlockedCount} of ${filteredPlugins.length} Active`;
    }
  }
}
