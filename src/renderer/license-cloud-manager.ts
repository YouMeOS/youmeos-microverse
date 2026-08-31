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
  headline: string;
  simpleExplanation: string;
  superpowers: string[];
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
  // Core Quantum / Black tier tools (11 tools)
  {
    id: 'u-nucleos',
    name: 'Personal WebTop Desktop OS',
    type: 'spark',
    tagline: 'YouMeOS Nucleos',
    description: 'Sovereign browser desktop environment with 4D star navigation and detachable mini-app window management.',
    minTier: 'black'
  },
  {
    id: 'bubblegum',
    name: 'Task & Focus Streak Engine',
    type: 'spark',
    tagline: 'Bubblegum Focus',
    description: 'Streamlined task management, daily focus streaks, and kinetic workflow tracking.',
    minTier: 'black'
  },
  {
    id: 'notepad',
    name: 'Markdown Notes & Scratchpad',
    type: 'spark',
    tagline: 'Alphabet Soup',
    description: 'Fast markdown note-taking, code snippet storage, and persistent local scratchpad memo vault.',
    minTier: 'black'
  },
  {
    id: 'jukebox',
    name: 'Audio Player & Web Radio',
    type: 'spark',
    tagline: 'Beat Salad',
    description: 'Integrated streaming web radio, audio playlists, podcast feeds, and ambient workspace audio player.',
    minTier: 'black'
  },
  {
    id: 'enchiridion',
    name: 'System Architecture & Code Snippets Handbook',
    type: 'spark',
    tagline: 'Enchiridion Library',
    description: 'Interactive platform architecture documentation, developer cheat sheets, and reusable code snippets library.',
    minTier: 'black'
  },
  {
    id: 'cookie-jar',
    name: 'Privacy, Session & Consent Vault',
    type: 'spark',
    tagline: 'Cookie Jar',
    description: 'Granular cookie management, sovereign session token storage, and client privacy consent vault.',
    minTier: 'black'
  },
  {
    id: 'true-north',
    name: 'XP Gamification & Reward Levels Engine',
    type: 'portal',
    tagline: 'True North XP',
    description: 'Gamified reward levels, quest progression, achievement badges, and loyalty streaks for user engagement.',
    minTier: 'black'
  },
  {
    id: 'bugnet',
    name: 'Visual Issue Reporter & QA Telemetry Net',
    type: 'portal',
    tagline: 'Bug-Catching Net',
    description: 'Instant visual issue reporting and automatic frontend runtime JavaScript error capture net.',
    minTier: 'black'
  },
  {
    id: 'command-deck',
    name: 'Operations & Products Management Gateway',
    type: 'portal',
    tagline: 'Command Deck',
    description: 'Unified business control center for managing orders, product inventory, and platform operations.',
    minTier: 'black'
  },
  {
    id: 'event-horizon',
    name: '3D Spatial Canvas & Dynamic Routing Engine',
    type: 'portal',
    tagline: 'Event Horizon',
    description: '3D WebGL spatial universe background canvas and Vue 3 micro-frontend routing engine.',
    minTier: 'black'
  },
  {
    id: 'my-compass',
    name: 'Core Application Framework & Navigator',
    type: 'portal',
    tagline: 'My COMPASS Framework',
    description: 'Central motherboard framework powering user roles, API routing, and spark applet orchestration.',
    minTier: 'black'
  },

  // Bronze tier additions (2 tools)
  {
    id: 'questbook-crm',
    name: 'Customer Relationship Manager (CRM)',
    type: 'portal',
    tagline: 'Questbook CRM',
    description: 'Manage contacts, track customer journey milestones, link form submissions, and organize lead pipelines.',
    minTier: 'bronze'
  },
  {
    id: 'bomb-bag',
    name: 'Email Marketing & Automated Drip Sequences',
    type: 'portal',
    tagline: 'Bomb Bag News Drip',
    description: 'Create email newsletter campaigns, automated drip sequences, subscriber list segmentation, and open/click tracking.',
    minTier: 'bronze'
  },

  // Silver tier additions (5 tools)
  {
    id: 'xophz-magic-formula',
    name: 'Visual Form Builder & Workflow Automation',
    type: 'spark',
    tagline: 'Magic Formula',
    description: 'Visual trigger-action recipe builder with multi-step branches, Forminator forms/polls/quizzes, and CRM synchronization.',
    minTier: 'silver'
  },
  {
    id: 'terminal',
    name: 'Node Command Terminal (CLI)',
    type: 'spark',
    tagline: 'HoloShell CLI',
    description: 'Direct server node shell management, script execution, diagnostic CLI access, and container commands.',
    minTier: 'silver'
  },
  {
    id: 'sys-monitor',
    name: 'System Resource Telemetry & Performance Monitor',
    type: 'spark',
    tagline: 'System Monitor',
    description: 'Real-time CPU, RAM, disk I/O, database load, and container response time telemetry graphs.',
    minTier: 'silver'
  },
  {
    id: 'trajectory',
    name: 'Marketing Funnels & Lead Generation Magnets',
    type: 'portal',
    tagline: 'Trajectory & Lead Magnet',
    description: 'Accelerate conversion growth through opt-in popups, lead capture magnets, and marketing funnels.',
    minTier: 'silver'
  },
  {
    id: 'castle-walls',
    name: 'Web Application Firewall (WAF) & Honeypot Security',
    type: 'portal',
    tagline: 'Castle Walls & Mirror Shield',
    description: 'Granular firewall rules, honeypot attack traps, bot-mitigation, IP banning, and sovereign data vaulting.',
    minTier: 'silver'
  },

  // Silver Enhanced tier additions (4 tools)
  {
    id: 'bazaar-pos',
    name: 'Point-of-Sale (POS) & E-Commerce Storefront',
    type: 'portal',
    tagline: 'Bazaar POS & WooCommerce',
    description: 'Over-the-counter retail POS checkout terminal with barcode scanning, cash tendering, and online store catalog.',
    minTier: 'silver'
  },
  {
    id: 'wizards-tower',
    name: 'Visual Page & Custom Theme Builder Studio',
    type: 'portal',
    tagline: "Wizard's Tower & Magic Wand",
    description: 'Point-and-click visual page builder, custom theme design studio, and platform developer tools.',
    minTier: 'silver'
  },
  {
    id: 'page-cache',
    name: 'High-Speed Page Caching & Asset Optimizer',
    type: 'spark',
    tagline: 'Hummingbird Caching Engine',
    description: 'Full-page caching, script minification, browser cache headers, and database optimization for instant page loads.',
    minTier: 'silver'
  },
  {
    id: 'image-optimizer',
    name: 'Lossless Image Optimization & WebP Delivery',
    type: 'spark',
    tagline: "Titan's Mitt & Smush Pro",
    description: 'Automated background image compression, Next-Gen WebP/AVIF formatting, and media library offloading.',
    minTier: 'silver'
  },

  // Gold tier additions (4 tools)
  {
    id: 'logos',
    name: 'Multi-Domain Network Management Portal',
    type: 'portal',
    tagline: 'Logos Multiverse',
    description: 'Centralized admin web management portal orchestrating multiple domain nodes, subsites, and web networks.',
    minTier: 'gold'
  },
  {
    id: 'helios',
    name: 'Multimedia Publishing & Broadcasting Studio',
    type: 'portal',
    tagline: 'Helios Media Studio',
    description: 'Publish and syndicate multimedia audio playlists, video records, podcasts, and digital media collections.',
    minTier: 'gold'
  },
  {
    id: 'silver-arrow',
    name: 'Continuous A/B Split Testing & Conversion Router',
    type: 'portal',
    tagline: 'Silver Arrow',
    description: 'Server-level PHP 302 cache-split testing, historical page revision benchmarking, and multi-armed bandit traffic allocation.',
    minTier: 'gold'
  },
  {
    id: 'pegasus-boots',
    name: 'Search Engine Optimization (SEO) & Smart Crawler',
    type: 'portal',
    tagline: 'Pegasus Boots & SmartCrawl Pro',
    description: 'Automated XML sitemaps, JSON-LD structured schema markup, OpenGraph social preview cards, and SEO health audits.',
    minTier: 'gold'
  },

  // Gold Enhanced tier additions (3 tools)
  {
    id: 'ai-content',
    name: 'AI Content Generation & Synthesis Pipeline',
    type: 'spark',
    tagline: 'AI Providers (OpenAI / Anthropic / Google)',
    description: 'Integrated multi-model AI pipeline for automated article generation, marketing copy drafting, and smart assistant prompts.',
    minTier: 'gold'
  },
  {
    id: 'beehive-analytics',
    name: 'Business Intelligence & Google Analytics Dashboard',
    type: 'portal',
    tagline: 'Beehive Analytics Telemetry',
    description: 'Real-time traffic telemetry charts, user acquisition channels, audience demographics, and conversion analytics.',
    minTier: 'gold'
  },
  {
    id: 'moving-castle',
    name: 'Multisite Database Migration & Replication Engine',
    type: 'portal',
    tagline: 'Moving Castle',
    description: 'File-based SQL dump and bulk import engine with serialized string replacement for cross-environment synchronization.',
    minTier: 'gold'
  },

  // Platinum tier additions (3 tools)
  {
    id: 'nexos',
    name: 'Autonomous Multi-Agent AI Network',
    type: 'portal',
    tagline: 'Nexos Intelligence',
    description: 'Network of autonomous AI agents cooperating across business workflows, system architecture, and automated data synthesis.',
    minTier: 'platinum'
  },
  {
    id: 'hookshot',
    name: 'Bidirectional HTTP Webhook & API Gateway',
    type: 'portal',
    tagline: 'Magic Hookshot',
    description: 'HMAC-verified incoming and outgoing webhooks with Action Scheduler retry queues, JSON payload transforms, and cross-plugin bridges.',
    minTier: 'platinum'
  },
  {
    id: 'agency-hub',
    name: 'Turn-Key Agency Command & Client Portal Hub',
    type: 'portal',
    tagline: 'The Hub Client & Omega Source',
    description: 'Dedicated client management hub, role-based access control (RBAC), and decentralized virtual passport authentication.',
    minTier: 'platinum'
  },

  // Platinum Enhanced tier additions (3 tools)
  {
    id: 'noosphere',
    name: 'Collective Intelligence & Knowledge Commons',
    type: 'portal',
    tagline: 'Noosphere Resonance',
    description: 'Shared global thought stream, universal knowledge graph, and collaborative community forums across the sovereign network.',
    minTier: 'platinum'
  },
  {
    id: 'white-label',
    name: 'Enterprise White-Label Branding Engine',
    type: 'portal',
    tagline: 'Ultimate Branding',
    description: 'Complete custom logo replacement, white-label client admin themes, custom login portals, and CSS styling customization.',
    minTier: 'platinum'
  },
  {
    id: 'polos',
    name: 'Fractal Governance & Quadratic Consensus Engine',
    type: 'portal',
    tagline: 'POLOS Consensus Engine',
    description: 'Multi-scale quadratic voting, liquid proxy delegation, Circle Web-of-Trust verification, and federated w4 governance protocols.',
    minTier: 'platinum'
  },

  // Uranium tier additions (3 tools)
  {
    id: 'enterprise-waf',
    name: 'Enterprise Threat Defense & Zero-Trust Security Suite',
    type: 'portal',
    tagline: 'WP Defender Pro & Castle Walls',
    description: 'Real-time malware scanning, two-factor authentication (2FA), audit logging, and automated threat smiting via Thor\'s Hammer.',
    minTier: 'uranium'
  },
  {
    id: 'yellow-links',
    name: 'Directory Citations & Backlink Authority Network',
    type: 'portal',
    tagline: 'Yellow Links Directory',
    description: 'Verified business directory listings, backlink tracking, domain citation score monitoring, and organic search share optimization.',
    minTier: 'uranium'
  },
  {
    id: 'treasure-trove',
    name: 'Sovereign Valuation Vault & ROI Discovery Map',
    type: 'portal',
    tagline: 'Treasure Trove & Treasure Map',
    description: 'Real-time equity valuation across commerce, CRM, and search capital combined with an interactive ROI quest journey map.',
    minTier: 'uranium'
  },

  // Titanium tier additions (2 tools)
  {
    id: 'blackbox',
    name: 'Kernel Diagnostics & Memory Profiling Inspector',
    type: 'spark',
    tagline: 'BlackBOX Diagnostics',
    description: 'Direct server kernel telemetry, real-time memory profiling, SQLite/MySQL query inspector, and cluster state diagnostics.',
    minTier: 'titanium'
  },
  {
    id: 'auto-healing',
    name: 'Automated Traffic Auto-Scaling & Self-Healing Engine',
    type: 'portal',
    tagline: 'Self-Healing Cluster',
    description: 'Dynamic container worker scaling under heavy load with automatic crash detection, service restarts, and database recovery.',
    minTier: 'titanium'
  },

  // Palladium tier additions (2 tools)
  {
    id: 'omni-core',
    name: 'Omni-Sovereign Core Network API Matrix',
    type: 'portal',
    tagline: 'Omni Core Matrix',
    description: 'Universal federated API matrix connecting all nodes, clusters, and client networks with global cryptographic synchronization.',
    minTier: 'palladium'
  },
  {
    id: 'concierge-retainer',
    name: 'Principal Systems Engineering Retainer (20h/mo)',
    type: 'portal',
    tagline: 'My Compass Consulting',
    description: 'Direct dedicated access to a Principal Systems Engineer for bespoke architecture design, custom plugins, and 24/7 priority support.',
    minTier: 'palladium'
  }
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
    headline: 'Your Starter Personal WebTop',
    simpleExplanation: 'Your personal sovereign computer deck. You get fast built-in tools for writing markdown notes, listening to web audio and radio, organizing daily task streaks, and earning gamified rewards.',
    superpowers: [
      'Personal WebTop desktop workspace (YouMeOS Nucleos) with 4D star navigation',
      'Built-in everyday tools for markdown notes, audio streaming, task focus streaks, and cookie privacy (Alphabet Soup, Beat Salad, Bubblegum, Cookie Jar)',
      'Gamified engagement levels (True North XP) and visual runtime error QA reporting net (Bug-Catching Net)'
    ],
    specs: ['1 vCPU Dedicated Core', '512MB High-Speed RAM', '10GB Storage (6GB System)', '5TB Dedicated Bandwidth'],
    features: ['YouMeOS WebTop Desktop OS', 'True North XP Gamification Engine', 'Bug-Catching Net Visual QA Reporter', 'Full Tesseract Protocol Framework'],
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
    headline: 'The Customer Relationship & Marketing Hub',
    simpleExplanation: 'The essential business toolkit for capturing leads, remembering customer milestones and reward points, and running scheduled email marketing drip campaigns.',
    superpowers: [
      'Customer Relationship Management (Questbook CRM) to record client milestones, contacts, and reward points',
      'Email marketing and automated drip sequence campaigns (Bomb Bag News Drip) for scheduled broadcasts and open/click tracking',
      'Automated daily data safeguards (Snapshot Backups) and spam shield protection'
    ],
    specs: ['1 vCPU Dedicated Core', '1GB High-Speed RAM', '25GB Storage (10GB System)', '10TB Dedicated Bandwidth'],
    features: ['All Quantum Features', 'Questbook CRM Contact & Lead Capture', 'Bomb Bag Email Marketing & Drip Sequences', 'Automated Daily Data Safeguards'],
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
    headline: 'The Workflow Automation & Security Hub',
    simpleExplanation: 'Automate repetitive workflows with visual trigger-action recipes and forms, manage server commands through a holographic CLI terminal, and defend your site with a honeypot security firewall.',
    superpowers: [
      'Visual form builder and trigger-action automated recipes (Magic Formula) linked directly to your CRM',
      'Browser-based server shell terminal (HoloShell CLI) and real-time telemetry graphs (System Monitor)',
      'Web Application Firewall and honeypot attack defense barrier (Castle Walls & Mirror Shield)'
    ],
    specs: ['2 vCPU Dedicated Cores', '2GB High-Speed RAM', '65GB NVMe Storage (20GB System)', '25TB Dedicated Bandwidth'],
    features: ['All Bronze Features', 'Magic Formula Visual Automations', 'HoloShell CLI & Live System Monitor', 'Castle Walls WAF & Honeypot Shield'],
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
    headline: 'The E-Commerce & Custom Page Studio',
    simpleExplanation: 'Build custom landing pages with visual tools, process retail or online checkouts through a Point-of-Sale terminal, and speed up page load times with automated caching and image compression.',
    superpowers: [
      'Point-of-Sale (POS) retail checkout terminal (Bazaar POS) with barcode scanning and digital store catalog',
      'Visual drag-and-drop page builder and theme design studio (Wizard\'s Tower & Magic Wand)',
      'High-speed page caching (Hummingbird) and automated lossless image optimization (Titan\'s Mitt & Smush Pro)'
    ],
    specs: ['2 vCPU Dedicated Cores', '4GB High-Speed RAM', '128GB Storage (28GB System)', '25TB Dedicated Bandwidth'],
    features: ['All Silver Features', 'Bazaar POS & Digital Storefront', 'Wizard\'s Tower Visual Page Studio', 'High-Speed Page Cache & AI Image Optimizer'],
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
    headline: 'The Multi-Domain & Media Broadcast Commander',
    simpleExplanation: 'Manage multiple domain networks and portals from a single unified screen, broadcast audio and video media playlists, and run continuous A/B split tests with intelligent search crawler SEO.',
    superpowers: [
      'Centralized multi-domain network management portal (Logos Multiverse) for controlling multiple subsites',
      'Multimedia publishing and broadcasting studio (Helios Media Studio) for audio tracks, playlists, and video channels',
      'Continuous historical A/B split-testing engine (Silver Arrow) and automated search crawler SEO (Pegasus Boots & SmartCrawl Pro)'
    ],
    specs: ['4 vCPU Dedicated Cores', '8GB High-Speed RAM', '160GB NVMe Storage (25GB System)', '100TB Dedicated Bandwidth'],
    features: ['All Silver Enhanced Features', 'Logos Multiverse Network Manager', 'Helios Multimedia Studio', 'Silver Arrow A/B Testing & Pegasus Boots SEO'],
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
    headline: 'The AI Content & Business Intelligence Suite',
    simpleExplanation: 'Draft high-performing articles and marketing copy using integrated AI models, track real-time audience charts via business intelligence dashboards, and migrate databases seamlessly between staging and production.',
    superpowers: [
      'Multi-model AI content generation pipeline (OpenAI, Anthropic, Google) for automated copy and articles',
      'Live business intelligence telemetry and Google Analytics traffic dashboards (Beehive Analytics)',
      'Competitor audience benchmarking (Enchanted Mirror & Golden Keywords) and bulk database migration engine (Moving Castle)'
    ],
    specs: ['4 vCPU Dedicated Cores', '16GB High-Speed RAM', '384GB NVMe Storage (34GB System)', '100TB Dedicated Bandwidth'],
    features: ['All Gold Features', 'AI Content Generation Pipeline', 'Business Intelligence Analytics', 'Multisite Database Migration Engine'],
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
    target: 'High-Volume Stores, B2B Enterprises, Digital Publishers, Investment Firms, Tech Hubs',
    headline: 'The Autonomous AI & Integration Network',
    simpleExplanation: 'Deploy a collaborative network of autonomous AI helper agents that work across business tasks, connect third-party platforms via bidirectional webhook gateways, and manage client portals with federated SSO.',
    superpowers: [
      'Autonomous multi-agent AI network (Nexos Intelligence) executing complex workflows cooperatively',
      'Bidirectional HTTP webhook integration gateway (Magic Hookshot) with automated retry queues and JSON transforms',
      'Turn-key agency client management hub and federated single sign-on authentication (Omega Source)'
    ],
    specs: ['6 vCPU Dedicated Cores', '16GB High-Speed RAM', '320GB Storage (35GB System)', '200TB Dedicated Bandwidth'],
    features: ['All Gold Enhanced Features', 'Nexos Autonomous Multi-Agent AI', 'Magic Hookshot Webhook Gateway', 'Agency Client Hub & Federated SSO'],
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
    headline: 'The White-Label Brand & Governance Platform',
    simpleExplanation: 'Brand the entire operating system with your company logo and custom styling, participate in collective knowledge spaces, and govern organizations using multi-scale quadratic consensus voting.',
    superpowers: [
      'Collective intelligence space and shared knowledge commons (Noosphere Resonance)',
      'Complete enterprise white-label branding engine (Ultimate Branding) for custom logos, login screens, and UI styles',
      'Fractal quadratic consensus voting engine (POLOS) and real-time sovereign equity valuation (Treasure Trove)'
    ],
    specs: ['6 vCPU Dedicated Cores', '24GB High-Speed RAM', '448GB Storage (48GB System)', '200TB Dedicated Bandwidth'],
    features: ['All Platinum Features', 'Noosphere Collective Intelligence Space', 'Ultimate White-Label Branding Engine', 'POLOS Fractal Governance & Equity Vault'],
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
    headline: 'The Zero-Trust Security & Compliance Fortress',
    simpleExplanation: 'Protect mission-critical data with enterprise compliance controls, real-time zero-trust malware defenses, zero-downtime sandbox testing environments, and verified directory citations.',
    superpowers: [
      'Enterprise regulatory compliance and real-time threat defense barrier (WP Defender Pro & Castle Walls)',
      'Zero-downtime staging and sandbox testing environments for risk-free plugin and code deployment',
      'Verified business directory citations and backlink authority network (Yellow Links)'
    ],
    specs: ['8 vCPU Dedicated Cores', '32GB High-Speed RAM', '640GB Storage (60GB System)', '250TB Dedicated Bandwidth'],
    features: ['All Platinum Enhanced Features', 'Enterprise Regulatory Compliance Suite', 'Real-Time Zero-Trust Threat Shield', 'Zero-Downtime Staging & Sandbox'],
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
    headline: 'The Self-Healing & Auto-Scaling High-Availability Cluster',
    simpleExplanation: 'An ultra-fast, high-availability cluster that monitors its own kernel health with live memory profiling, scales container workers automatically during massive traffic spikes, and repairs crashed processes in milliseconds.',
    superpowers: [
      'Deep kernel diagnostics with live memory and database query profiling (BlackBOX Diagnostics)',
      'Extreme traffic auto-scaling engine dynamically allocating resources for millions of requests',
      'Self-healing infrastructure that automatically restarts crashed daemons and verifies data integrity'
    ],
    specs: ['16 vCPU Dedicated Cores', '64GB High-Speed RAM', '1.28TB SSD (100GB System)', '250TB+ Dedicated Bandwidth'],
    features: ['All Uranium Features', 'BlackBOX Kernel Diagnostics & Memory Profiler', 'Automated Traffic Auto-Scaling Engine', 'Self-Healing High-Availability Infrastructure'],
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
    headline: 'The Omni-Sovereign Core Matrix & Principal Retainer',
    simpleExplanation: 'The highest tier of digital sovereignty. Universal global API integration, worldwide real-time multi-region server synchronization, maximum dedicated compute resources, and a 20-hour monthly retainer with a Principal Systems Engineer.',
    superpowers: [
      'Omni-Sovereign global core network API matrix connecting worldwide nodes and clusters',
      'Instant real-time multi-region data synchronization across all international server endpoints',
      '20 hours monthly dedicated consulting retainer with a Principal Systems Engineer (My Compass Consulting)'
    ],
    specs: ['24 vCPU Dedicated Cores', '96GB High-Speed RAM', '2.5TB+ SSD (300GB System)', 'Unlimited Global Bandwidth'],
    features: ['All Titanium Features', 'Omni-Sovereign Global Core Network API', 'Multi-Region Global Network Sync', '20h Dedicated Principal Systems Retainer'],
    url: 'https://w4.youmeos.com?_hub_client_page=1&_path=/hosting-create/29548/302090/',
    stripeWhiteGloveUrl: 'https://buy.stripe.com/whiteglove_palladium',
    stripeLicenseUrl: 'https://buy.stripe.com/license_palladium'
  }
];

export const TESSERACT_SPARK_URL = 'https://www.youmeos.com/u/?sparks=tesseract&fullspark=true&name=The+Tesseract&icon=fad+fa-police-box&color=%23003b6f';
