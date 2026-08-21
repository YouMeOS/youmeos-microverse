import * as THREE from 'three';

export interface Architecture3DOptions {
  container: HTMLElement | null;
  onLayerSelect?: (layerId: string) => void;
}

export type StackLayerId = 'portal' | 'compass' | 'core' | 'database' | 'bedrock' | 'server' | 'network';

export interface CompassTierColorDef {
  primary: number;
  secondary: number;
  accent: number;
  hex: string;
}

export const COMPASS_TIER_COLORS: Record<string, CompassTierColorDef> = {
  unverified: { primary: 0x62c9ff, secondary: 0x25a1c5, accent: 0xffffff, hex: '#62c9ff' },
  community: { primary: 0x62c9ff, secondary: 0x25a1c5, accent: 0xffffff, hex: '#62c9ff' },
  black: { primary: 0x00f2fe, secondary: 0x0077b6, accent: 0x62c9ff, hex: '#00f2fe' },
  quantum: { primary: 0x00f2fe, secondary: 0x0077b6, accent: 0x62c9ff, hex: '#00f2fe' },
  bronze: { primary: 0xcd7f32, secondary: 0x8b5a2b, accent: 0xffd599, hex: '#cd7f32' },
  silver: { primary: 0xc0c0c0, secondary: 0x7f8c8d, accent: 0xffffff, hex: '#c0c0c0' },
  'silver-enhanced': { primary: 0xe5e4e2, secondary: 0x9e9e9e, accent: 0xffffff, hex: '#e5e4e2' },
  gold: { primary: 0xffd700, secondary: 0xb8860b, accent: 0xfff0a0, hex: '#ffd700' },
  'gold-enhanced': { primary: 0xffd700, secondary: 0xb8860b, accent: 0xfff0a0, hex: '#ffd700' },
  platinum: { primary: 0xa0b2c6, secondary: 0x5c768d, accent: 0xe0e8f0, hex: '#a0b2c6' },
  'platinum-enhanced': { primary: 0xa0b2c6, secondary: 0x5c768d, accent: 0xe0e8f0, hex: '#a0b2c6' },
  uranium: { primary: 0x3dee98, secondary: 0x059669, accent: 0x6ee7b7, hex: '#3dee98' },
  titanium: { primary: 0x00e5ff, secondary: 0x0097a7, accent: 0x80deea, hex: '#00e5ff' },
  palladium: { primary: 0xe6e6fa, secondary: 0x9370db, accent: 0xffd700, hex: '#e6e6fa' }
};

export class Architecture3DManager {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera | null = null;

  // Master Root & Layer Groups
  private stackGroup: THREE.Group = new THREE.Group();
  private portalGroup: THREE.Group = new THREE.Group();
  private compassGroup: THREE.Group = new THREE.Group();
  private coreGroup: THREE.Group = new THREE.Group();
  private dbGroup: THREE.Group = new THREE.Group();
  private bedrockGroup: THREE.Group = new THREE.Group();
  private serverGroup: THREE.Group = new THREE.Group();
  private networkGroup: THREE.Group = new THREE.Group();

  // Layer 1: Portal / Event Horizon elements
  private sunMesh: THREE.Mesh | null = null;
  private sunGlowMesh: THREE.Mesh | null = null;
  private satMeshes: THREE.Mesh[] = [];
  private satLines: THREE.LineSegments | null = null;
  private satOrbitRadii: number[] = [1.8, 2.2, 2.6, 2.0, 2.8];
  private satOrbitSpeeds: number[] = [0.8, 0.6, 1.0, 0.7, 0.5];
  private satOrbitInclinations: number[] = [0.1, -0.15, 0.2, -0.05, 0.12];
  private satAngles: number[] = [0, 1.2, 2.4, 3.6, 4.8];
  private portalWireframe: THREE.LineSegments | null = null;

  // Layer 2: My COMPASS elements
  private compassOuterRing: THREE.Mesh | null = null;
  private compassInnerRing: THREE.Mesh | null = null;
  private compassSparkStar: THREE.Group = new THREE.Group();
  private compassNeedles: THREE.Mesh[] = [];
  private compassNeedleMatNorth: THREE.MeshStandardMaterial | null = null;
  private compassNeedleMatSouth: THREE.MeshStandardMaterial | null = null;
  private compassNeedleMatEastWest: THREE.MeshStandardMaterial | null = null;
  private compassCenterSphere: THREE.Mesh | null = null;
  private currentTierColorKey: string = 'black';

  // Layer 3: Headless Core elements
  private goldenCube: THREE.Mesh | null = null;
  private goldenEdges: THREE.LineSegments | null = null;

  // Layer 4: SQLite DB elements
  // (Using generic group rotation for db elements)

  // Layer 5: Bedrock Foundation Base Slab
  private bedrockSlab: THREE.Mesh | null = null;
  private bedrockEdges: THREE.LineSegments | null = null;
  // Layer 5: Web Server (Matrix Cyber Engine) elements
  private serverLeds: THREE.Mesh[] = [];

  // Central Singularity Energy Spine
  private spineLine: THREE.Line | null = null;
  private dataCubes: THREE.Mesh[] = [];
  private dataCubeSpeeds: number[] = [];

  // State & Interactivity
  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private activeHoverLayer: string | null = null;
  private lastTime: number = 0;
  private activeTime: number = 0;

  // Mouse & Orbit Interaction
  private isDragging: boolean = false;
  private previousMouseX: number = 0;
  private previousMouseY: number = 0;
  private rotVelocityX: number = 0;
  private rotVelocityY: number = 0;
  private targetRotX: number = 0.22;
  private targetRotY: number = -0.55;
  private currentRotX: number = 0.22;
  private currentRotY: number = -0.55;
  private parallaxX: number = 0;
  private parallaxY: number = 0;

  // Side Panel State & Dynamic Viewport Framing
  private isSidePanelOpen: boolean = false;
  private targetStackX: number = 0.0;
  private currentStackX: number = 0.0;
  private targetStackScale: number = 1.0;
  private currentStackScale: number = 1.0;
  private targetCameraDist: number = 16.0;
  private currentCameraDist: number = 16.0;

  // Layer Height Offsets (Chakra Alignment: Root to Crown bottom-up)
  private readonly Y_COMPASS = 3.65; // Crown (7th Chakra - Apex)
  private readonly Y_PORTAL = 2.05;  // Third Eye (6th Chakra)
  private readonly Y_NETWORK = 0.52; // Throat (5th Chakra - Protective Mesh sitting flush on top of Web Server)
  private readonly Y_SERVER = 0.0;   // Heart (4th Chakra - Native Web Server Chassis)
  private readonly Y_CORE = -1.2;    // Solar Plexus (3rd Chakra)
  private readonly Y_DB = -2.4;      // Sacral (2nd Chakra)
  private readonly Y_BEDROCK = -3.6; // Root (1st Chakra - Base Substrate)

  // Unified Monolithic Box Structure Footprint (Exploded Cube Architecture)
  private readonly BOX_FOOTPRINT = 2.6;

  constructor(private options: Architecture3DOptions) {
    this.initScene();
    this.buildStack();
    this.setupListeners();
    this.animate();
  }

  private initScene(): void {
    const container = this.options.container;
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 520;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    this.updateViewportTargets();
    this.currentCameraDist = this.targetCameraDist;
    this.camera.position.set(0, 0.35, this.currentCameraDist);
    this.camera.lookAt(0, 0.35, 0);

    // Global Lighting
    const ambientLight = new THREE.AmbientLight(0x62c9ff, 0.9);
    const dirLightTop = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLightTop.position.set(8, 12, 10);

    const goldFillLight = new THREE.DirectionalLight(0xffd599, 1.2);
    goldFillLight.position.set(-8, 2, -6);

    const bottomCyanLight = new THREE.DirectionalLight(0x2979ff, 1.4);
    bottomCyanLight.position.set(0, -10, 6);

    this.scene.add(ambientLight, dirLightTop, goldFillLight, bottomCyanLight);

    this.stackGroup = new THREE.Group();
    this.scene.add(this.stackGroup);
  }

  private buildStack(): void {
    // Build Central Singularity Spine
    this.buildSpine();

    // Layer 1: Blackbox Bedrock Foundation (Root)
    this.buildBedrockLayer();

    // Layer 2: SQLite Database Store (Sacral)
    this.buildDatabaseLayer();

    // Layer 3: Headless Core Application Kernel (Solar Plexus)
    this.buildCoreLayer();

    // Layer 4: Web Server & Gateway (Heart)
    this.buildServerLayer();

    // Layer 5: Private Node & Mesh (Throat)
    this.buildNetworkLayer();

    // Layer 6: Portal / Event Horizon (Third Eye)
    this.buildPortalLayer();

    // Layer 7: My COMPASS (Crown)
    this.buildCompassLayer();

    // Add all layers to master stack
    this.stackGroup.add(
      this.bedrockGroup,
      this.dbGroup,
      this.coreGroup,
      this.serverGroup,
      this.networkGroup,
      this.portalGroup,
      this.compassGroup
    );
  }

  private buildSpine(): void {
    const points = [
      new THREE.Vector3(0, -3.7, 0),
      new THREE.Vector3(0, 3.8, 0)
    ];
    const spineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const spineMat = new THREE.LineDashedMaterial({
      color: 0x62c9ff,
      dashSize: 0.22,
      gapSize: 0.14,
      transparent: true,
      opacity: 0.55
    });
    this.spineLine = new THREE.Line(spineGeo, spineMat);
    this.spineLine.computeLineDistances();
    this.stackGroup.add(this.spineLine);

    // Subtle data energy micro-cubes floating up the spine
    const cubeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x62c9ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    const count = 12;
    for (let i = 0; i < count; i++) {
      const dbCube = new THREE.Mesh(cubeGeo, cubeMat);
      dbCube.position.set(
        (Math.random() - 0.5) * 0.2,
        -3.7 + Math.random() * 7.5,
        (Math.random() - 0.5) * 0.2
      );
      this.stackGroup.add(dbCube);
      this.dataCubes.push(dbCube);
      this.dataCubeSpeeds.push((Math.random() * 0.5 + 0.5) * 0.04);
    }
  }

  private buildBedrockLayer(): void {
    this.bedrockGroup = new THREE.Group();
    this.bedrockGroup.position.y = this.Y_BEDROCK;

    // Bedrock Base Slab
    const slabHeight = 0.5;
    const slabGeo = new THREE.BoxGeometry(this.BOX_FOOTPRINT, slabHeight, this.BOX_FOOTPRINT);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x0c1424,
      roughness: 0.35,
      metalness: 0.6,
      emissive: 0x050c18,
      emissiveIntensity: 0.5
    });
    this.bedrockSlab = new THREE.Mesh(slabGeo, slabMat);
    this.bedrockGroup.add(this.bedrockSlab);

    const edgesGeo = new THREE.EdgesGeometry(slabGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x62c9ff,
      transparent: true,
      opacity: 0.9,
      linewidth: 1.5
    });
    this.bedrockEdges = new THREE.LineSegments(edgesGeo, edgesMat);
    this.bedrockGroup.add(this.bedrockEdges);

    // Foundation Grid Plane
    const gridHelper = new THREE.GridHelper(this.BOX_FOOTPRINT, 4, 0x62c9ff, 0x1e3a5f);
    gridHelper.position.y = slabHeight / 2 + 0.01;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.45;
    this.bedrockGroup.add(gridHelper);
  }

  private buildDatabaseLayer(): void {
    this.dbGroup = new THREE.Group();
    this.dbGroup.position.y = this.Y_DB;

    // Stacked Cylinder Disks (Classic Database Icon)
    const dbHeight = 0.25;
    const dbRadius = 1.2;
    const dbGeo = new THREE.CylinderGeometry(dbRadius, dbRadius, dbHeight, 32);
    const dbMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      roughness: 0.3,
      metalness: 0.7,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.4
    });

    for (let i = -1; i <= 1; i++) {
      const disk = new THREE.Mesh(dbGeo, dbMat);
      disk.position.y = i * (dbHeight + 0.1);
      this.dbGroup.add(disk);
      
      const edgesGeo = new THREE.EdgesGeometry(dbGeo);
      const edgesMat = new THREE.LineBasicMaterial({
        color: 0xd8b4fe,
        transparent: true,
        opacity: 0.7
      });
      const edges = new THREE.LineSegments(edgesGeo, edgesMat);
      edges.position.y = i * (dbHeight + 0.1);
      this.dbGroup.add(edges);
    }
  }

  private buildServerLayer(): void {
    this.serverGroup = new THREE.Group();
    this.serverGroup.position.y = this.Y_SERVER;

    const serverHeight = 0.85;

    // 1. Semi-transparent Cyberpunk Emerald Glass Chassis
    const cubeGeo = new THREE.BoxGeometry(this.BOX_FOOTPRINT, serverHeight, this.BOX_FOOTPRINT);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x021f12,
      roughness: 0.18,
      metalness: 0.88,
      transparent: true,
      opacity: 0.82,
      emissive: 0x032d18,
      emissiveIntensity: 0.65
    });
    const serverBlock = new THREE.Mesh(cubeGeo, cubeMat);
    this.serverGroup.add(serverBlock);

    // 2. High-glow Neon Matrix Edges
    const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.95,
      linewidth: 1.5
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    this.serverGroup.add(edges);

    // 3. Internal Matrix Server Blades (Horizontal glowing sub-planes)
    const bladeGeo = new THREE.PlaneGeometry(this.BOX_FOOTPRINT * 0.92, this.BOX_FOOTPRINT * 0.92);
    const bladeMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    for (let i = -1; i <= 1; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.x = Math.PI / 2;
      blade.position.y = i * (serverHeight * 0.26);
      this.serverGroup.add(blade);
    }

    // 4. Matrix Digital Grid Lattice on top & bottom faces
    const topGrid = new THREE.GridHelper(this.BOX_FOOTPRINT, 6, 0x00ff88, 0x047857);
    topGrid.position.y = serverHeight / 2 + 0.005;
    (topGrid.material as THREE.Material).transparent = true;
    (topGrid.material as THREE.Material).opacity = 0.55;
    this.serverGroup.add(topGrid);

    const bottomGrid = new THREE.GridHelper(this.BOX_FOOTPRINT, 6, 0x00ff88, 0x047857);
    bottomGrid.position.y = -serverHeight / 2 - 0.005;
    (bottomGrid.material as THREE.Material).transparent = true;
    (bottomGrid.material as THREE.Material).opacity = 0.35;
    this.serverGroup.add(bottomGrid);

    // 5. Front Server Activity LED Array
    const ledGeo = new THREE.BoxGeometry(0.06, 0.06, 0.02);
    this.serverLeds = [];
    const ledCount = 5;
    for (let i = 0; i < ledCount; i++) {
      const ledMat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.9
      });
      const led = new THREE.Mesh(ledGeo, ledMat);
      const xPos = ((i / (ledCount - 1)) - 0.5) * (this.BOX_FOOTPRINT * 0.7);
      led.position.set(xPos, 0, this.BOX_FOOTPRINT / 2 + 0.01);
      this.serverGroup.add(led);
      this.serverLeds.push(led);
    }
  }

  private buildNetworkLayer(): void {
    this.networkGroup = new THREE.Group();
    this.networkGroup.position.y = this.Y_NETWORK;

    // 1. Protective Shield Slab (Matching exact box footprint of server)
    const shieldHeight = 0.06;
    const shieldGeo = new THREE.BoxGeometry(this.BOX_FOOTPRINT, shieldHeight, this.BOX_FOOTPRINT);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x1f080e,
      roughness: 0.15,
      metalness: 0.9,
      transparent: true,
      opacity: 0.55,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.35
    });
    const shieldBlock = new THREE.Mesh(shieldGeo, shieldMat);
    this.networkGroup.add(shieldBlock);

    // 2. High-glow Coral / Crimson Protective Perimeter Edges
    const edgesGeo = new THREE.EdgesGeometry(shieldGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xfb7185,
      transparent: true,
      opacity: 0.95,
      linewidth: 1.5
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    this.networkGroup.add(edges);

    // 3. Security Mesh Digital Grid (Exact box footprint)
    const gridHelper = new THREE.GridHelper(this.BOX_FOOTPRINT, 8, 0xfb7185, 0x881337);
    gridHelper.position.y = shieldHeight / 2 + 0.005;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.75;
    this.networkGroup.add(gridHelper);

    // 4. Mesh Defense Nodes (Corner & Perimeter anchors within box footprint)
    const nodeGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xfecdd3,
      emissive: 0xf43f5e,
      emissiveIntensity: 1.0,
      roughness: 0.2,
      metalness: 0.8
    });

    const span = (this.BOX_FOOTPRINT / 2) * 0.88;
    const positions = [
      [span, 0.04, span],
      [-span, 0.04, span],
      [span, 0.04, -span],
      [-span, 0.04, -span],
      [span, 0.04, 0],
      [-span, 0.04, 0],
      [0, 0.04, span],
      [0, 0.04, -span],
      [0, 0.04, 0]
    ];

    positions.forEach(([x, y, z]) => {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x, y, z);
      this.networkGroup.add(node);
    });

    // 5. Interconnecting Laser Security Mesh Beams
    const linePoints: THREE.Vector3[] = [];
    linePoints.push(new THREE.Vector3(span, 0.04, span), new THREE.Vector3(-span, 0.04, span));
    linePoints.push(new THREE.Vector3(-span, 0.04, span), new THREE.Vector3(-span, 0.04, -span));
    linePoints.push(new THREE.Vector3(-span, 0.04, -span), new THREE.Vector3(span, 0.04, -span));
    linePoints.push(new THREE.Vector3(span, 0.04, -span), new THREE.Vector3(span, 0.04, span));
    linePoints.push(new THREE.Vector3(span, 0.04, 0), new THREE.Vector3(0, 0.04, span));
    linePoints.push(new THREE.Vector3(0, 0.04, span), new THREE.Vector3(-span, 0.04, 0));
    linePoints.push(new THREE.Vector3(-span, 0.04, 0), new THREE.Vector3(0, 0.04, -span));
    linePoints.push(new THREE.Vector3(0, 0.04, -span), new THREE.Vector3(span, 0.04, 0));

    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.65
    });
    const networkBeams = new THREE.LineSegments(lineGeo, lineMat);
    this.networkGroup.add(networkBeams);
  }

  private buildCoreLayer(): void {
    this.coreGroup = new THREE.Group();
    this.coreGroup.position.y = this.Y_CORE;

    // Solid 3D Golden Cube (Application Kernel)
    const coreHeight = 0.85;
    const cubeGeo = new THREE.BoxGeometry(this.BOX_FOOTPRINT, coreHeight, this.BOX_FOOTPRINT);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0xd49b56,
      roughness: 0.25,
      metalness: 0.75,
      emissive: 0x5c330a,
      emissiveIntensity: 0.35
    });
    this.goldenCube = new THREE.Mesh(cubeGeo, cubeMat);
    this.coreGroup.add(this.goldenCube);

    const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xfff0d0,
      transparent: true,
      opacity: 0.9,
      linewidth: 1.5
    });
    this.goldenEdges = new THREE.LineSegments(edgesGeo, edgesMat);
    this.coreGroup.add(this.goldenEdges);
  }

  private buildCompassLayer(): void {
    this.compassGroup = new THREE.Group();
    this.compassGroup.position.y = this.Y_COMPASS;

    const initialColors = COMPASS_TIER_COLORS[this.currentTierColorKey] || COMPASS_TIER_COLORS.black;

    // 1. Outer Gyro Gimbal Ring
    const outerRingGeo = new THREE.TorusGeometry(1.45, 0.032, 12, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: initialColors.primary,
      transparent: true,
      opacity: 0.92
    });
    this.compassOuterRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    this.compassOuterRing.rotation.x = Math.PI / 2;
    this.compassGroup.add(this.compassOuterRing);

    // 2. Inner Gyro Gimbal Ring
    const innerRingGeo = new THREE.TorusGeometry(1.12, 0.026, 12, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: initialColors.secondary,
      transparent: true,
      opacity: 0.88
    });
    this.compassInnerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    this.compassGroup.add(this.compassInnerRing);

    // 3. 4-point Diamond Spark Star
    this.compassSparkStar = new THREE.Group();
    this.compassNeedleMatNorth = new THREE.MeshStandardMaterial({
      color: initialColors.primary,
      roughness: 0.18,
      metalness: 0.85,
      emissive: initialColors.primary,
      emissiveIntensity: 0.4
    });
    this.compassNeedleMatSouth = new THREE.MeshStandardMaterial({
      color: initialColors.secondary,
      roughness: 0.22,
      metalness: 0.8,
      emissive: initialColors.secondary,
      emissiveIntensity: 0.3
    });
    this.compassNeedleMatEastWest = new THREE.MeshStandardMaterial({
      color: initialColors.primary,
      roughness: 0.2,
      metalness: 0.82,
      emissive: initialColors.primary,
      emissiveIntensity: 0.35
    });

    this.compassNeedles = [];

    // North needle
    const northCone = new THREE.ConeGeometry(0.22, 0.85, 4);
    const northMesh = new THREE.Mesh(northCone, this.compassNeedleMatNorth);
    northMesh.position.y = 0.425;
    this.compassSparkStar.add(northMesh);
    this.compassNeedles.push(northMesh);

    // South needle
    const southCone = new THREE.ConeGeometry(0.22, 0.85, 4);
    const southMesh = new THREE.Mesh(southCone, this.compassNeedleMatSouth);
    southMesh.position.y = -0.425;
    southMesh.rotation.z = Math.PI;
    this.compassSparkStar.add(southMesh);
    this.compassNeedles.push(southMesh);

    // East / West needles
    const eastCone = new THREE.ConeGeometry(0.18, 0.60, 4);
    const eastMesh = new THREE.Mesh(eastCone, this.compassNeedleMatEastWest);
    eastMesh.position.x = 0.30;
    eastMesh.rotation.z = -Math.PI / 2;
    this.compassSparkStar.add(eastMesh);
    this.compassNeedles.push(eastMesh);

    const westCone = new THREE.ConeGeometry(0.18, 0.60, 4);
    const westMesh = new THREE.Mesh(westCone, this.compassNeedleMatEastWest);
    westMesh.position.x = -0.30;
    westMesh.rotation.z = Math.PI / 2;
    this.compassSparkStar.add(westMesh);
    this.compassNeedles.push(westMesh);

    // Center Core Spark Sphere
    const centerGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const centerMat = new THREE.MeshBasicMaterial({ color: initialColors.accent });
    this.compassCenterSphere = new THREE.Mesh(centerGeo, centerMat);
    this.compassSparkStar.add(this.compassCenterSphere);

    this.compassGroup.add(this.compassSparkStar);
  }

  private buildPortalLayer(): void {
    this.portalGroup = new THREE.Group();
    this.portalGroup.position.y = this.Y_PORTAL;

    // True 3D Wireframe Hypercube
    const portalHeight = 2.2;
    const cubeGeo = new THREE.BoxGeometry(this.BOX_FOOTPRINT, portalHeight, this.BOX_FOOTPRINT);
    const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x62c9ff,
      transparent: true,
      opacity: 0.85,
      linewidth: 1.5
    });
    this.portalWireframe = new THREE.LineSegments(edgesGeo, edgesMat);
    this.portalGroup.add(this.portalWireframe);

    // Corner vertex spheres
    const cornerSphereGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const cornerSphereMat = new THREE.MeshBasicMaterial({ color: 0x62c9ff });
    const halfX = this.BOX_FOOTPRINT / 2;
    const halfY = portalHeight / 2;
    const halfZ = this.BOX_FOOTPRINT / 2;
    const corners = [
      [-halfX, -halfY, -halfZ], [halfX, -halfY, -halfZ], [-halfX, halfY, -halfZ], [halfX, halfY, -halfZ],
      [-halfX, -halfY, halfZ], [halfX, -halfY, halfZ], [-halfX, halfY, halfZ], [halfX, halfY, halfZ]
    ];
    corners.forEach(([x, y, z]) => {
      const sp = new THREE.Mesh(cornerSphereGeo, cornerSphereMat);
      sp.position.set(x, y, z);
      this.portalGroup.add(sp);
    });

    // Equatorial Grid Plane inside cube
    const gridHelper = new THREE.GridHelper(this.BOX_FOOTPRINT, 4, 0x62c9ff, 0x1e3a5f);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    this.portalGroup.add(gridHelper);

    // Central Singularity Sun
    const sunGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.portalGroup.add(this.sunMesh);

    const glowGeo = new THREE.SphereGeometry(0.48, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x62c9ff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    this.sunGlowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.portalGroup.add(this.sunGlowMesh);

    // Orbiting Constellation Group
    const satColors = [0xffd599, 0x62c9ff, 0xffffff, 0xffd599, 0x62c9ff];
    this.satMeshes = [];
    for (let i = 0; i < 5; i++) {
      const satGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const satMat = new THREE.MeshBasicMaterial({ color: satColors[i] });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      this.portalGroup.add(satMesh);
      this.satMeshes.push(satMesh);
    }

    // Dynamic constellation lines
    const linePositions = new Float32Array(5 * 2 * 3 + 5 * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffe0b2,
      transparent: true,
      opacity: 0.45
    });
    this.satLines = new THREE.LineSegments(lineGeo, lineMat);
    this.portalGroup.add(this.satLines);
  }

  private setupListeners(): void {
    const container = this.options.container;
    if (!container) return;

    let startX = 0;
    let startY = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleRaycastSelect = (clientX: number, clientY: number) => {
      if (!this.camera || !container) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.stackGroup.children, true);

      if (intersects.length > 0) {
        let currentObj: THREE.Object3D | null = intersects[0].object;
        while (currentObj && currentObj !== this.stackGroup) {
          if (currentObj === this.compassGroup) {
            this.options.onLayerSelect?.('compass');
            return;
          }
          if (currentObj === this.portalGroup) {
            this.options.onLayerSelect?.('portal');
            return;
          }
          if (currentObj === this.bedrockGroup) {
            this.options.onLayerSelect?.('bedrock');
            return;
          }
          if (currentObj === this.coreGroup) {
            this.options.onLayerSelect?.('core');
            return;
          }
          if (currentObj === this.serverGroup) {
            this.options.onLayerSelect?.('server');
            return;
          }
          if (currentObj === this.dbGroup) {
            this.options.onLayerSelect?.('database');
            return;
          }
          if (currentObj === this.networkGroup) {
            this.options.onLayerSelect?.('network');
            return;
          }
          currentObj = currentObj.parent;
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      this.isDragging = true;
      this.previousMouseX = e.clientX;
      this.previousMouseY = e.clientY;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      this.parallaxX = normX * 0.18;
      this.parallaxY = normY * 0.12;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMouseX;
        const deltaY = e.clientY - this.previousMouseY;
        this.targetRotY += deltaX * 0.008;
        this.targetRotX += deltaY * 0.008;
        this.targetRotX = Math.max(-0.6, Math.min(0.8, this.targetRotX));
        this.previousMouseX = e.clientX;
        this.previousMouseY = e.clientY;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
      this.isDragging = false;
      if (dist < 6) {
        handleRaycastSelect(e.clientX, e.clientY);
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for mobile / touch screens
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMouseX = e.touches[0].clientX;
        this.previousMouseY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMouseX;
        const deltaY = e.touches[0].clientY - this.previousMouseY;
        this.targetRotY += deltaX * 0.008;
        this.targetRotX += deltaY * 0.008;
        this.targetRotX = Math.max(-0.6, Math.min(0.8, this.targetRotX));
        this.previousMouseX = e.touches[0].clientX;
        this.previousMouseY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      this.isDragging = false;
      if (e.changedTouches.length === 1) {
        const dist = Math.hypot(e.changedTouches[0].clientX - startX, e.changedTouches[0].clientY - startY);
        if (dist < 8) {
          handleRaycastSelect(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    window.addEventListener('resize', () => this.resize());
  }

  public setCompassTier(tierKey: string): void {
    const normalizedKey = (tierKey || 'black').toLowerCase().replace('box', '').replace('-enhanced', '');
    const colorDef = COMPASS_TIER_COLORS[normalizedKey] || COMPASS_TIER_COLORS.black;
    this.currentTierColorKey = normalizedKey;
    this.setCompassColor(colorDef.primary, colorDef.secondary, colorDef.accent);
  }

  public setCompassColor(primary: number, secondary?: number, accent?: number): void {
    const sec = secondary !== undefined ? secondary : primary;
    const acc = accent !== undefined ? accent : 0xffffff;

    if (this.compassOuterRing) {
      (this.compassOuterRing.material as THREE.MeshBasicMaterial).color.setHex(primary);
    }
    if (this.compassInnerRing) {
      (this.compassInnerRing.material as THREE.MeshBasicMaterial).color.setHex(sec);
    }
    if (this.compassNeedleMatNorth) {
      this.compassNeedleMatNorth.color.setHex(primary);
      this.compassNeedleMatNorth.emissive.setHex(primary);
    }
    if (this.compassNeedleMatSouth) {
      this.compassNeedleMatSouth.color.setHex(sec);
      this.compassNeedleMatSouth.emissive.setHex(sec);
    }
    if (this.compassNeedleMatEastWest) {
      this.compassNeedleMatEastWest.color.setHex(primary);
      this.compassNeedleMatEastWest.emissive.setHex(primary);
    }
    if (this.compassCenterSphere) {
      (this.compassCenterSphere.material as THREE.MeshBasicMaterial).color.setHex(acc);
    }
  }

  public setRunning(running: boolean): void {
    this.isRunning = running;
  }

  public highlightLayer(layerId: string | null): void {
    this.activeHoverLayer = layerId;

    const layers = [
      { id: 'portal', group: this.portalGroup, baseScale: 1.0 },
      { id: 'compass', group: this.compassGroup, baseScale: 1.0 },
      { id: 'core', group: this.coreGroup, baseScale: 1.0 },
      { id: 'database', group: this.dbGroup, baseScale: 1.0 },
      { id: 'bedrock', group: this.bedrockGroup, baseScale: 1.0 },
      { id: 'server', group: this.serverGroup, baseScale: 1.0 },
      { id: 'network', group: this.networkGroup, baseScale: 1.0 }
    ];

    layers.forEach(item => {
      const isTarget = layerId === null || item.id === layerId;
      const targetScale = isTarget && layerId !== null ? 1.08 : (layerId !== null ? 0.95 : 1.0);
      item.group.scale.set(targetScale, targetScale, targetScale);
    });
  }

  public setSidePanelOpen(open: boolean): void {
    this.isSidePanelOpen = open;
    this.updateViewportTargets();
  }

  private updateViewportTargets(): void {
    const aspect = this.camera?.aspect || 1.0;
    const baseDist = 16.0;
    const aspectScale = aspect < 1.05 ? 1.05 / Math.max(0.65, aspect) : 1.0;

    if (this.isSidePanelOpen) {
      this.targetStackX = -1.65;
      this.targetStackScale = 0.82;
      this.targetCameraDist = baseDist * aspectScale * 1.05;
    } else {
      this.targetStackX = 0.0;
      this.targetStackScale = 1.0;
      this.targetCameraDist = baseDist * aspectScale;
    }
  }

  public resize(): void {
    const container = this.options.container;
    if (!this.renderer || !this.camera || !container) return;

    const w = container.clientWidth || 480;
    const h = container.clientHeight || 520;
    this.camera.aspect = w / h;
    this.updateViewportTargets();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const now = performance.now() * 0.001;
    if (this.lastTime === 0) this.lastTime = now;
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    if (this.isRunning) {
      this.activeTime += delta;
    }

    // Smooth Glide & Scale when side panel opens/closes
    this.currentStackX += (this.targetStackX - this.currentStackX) * 0.08;
    this.currentStackScale += (this.targetStackScale - this.currentStackScale) * 0.08;
    this.currentCameraDist += (this.targetCameraDist - this.currentCameraDist) * 0.08;

    this.stackGroup.position.x = this.currentStackX;
    this.stackGroup.scale.set(this.currentStackScale, this.currentStackScale, this.currentStackScale);

    if (this.camera) {
      this.camera.position.set(0, 0.35, this.currentCameraDist);
      this.camera.lookAt(0, 0.35, 0);
    }

    // Smooth Spring Rotation towards target + parallax
    this.currentRotX += (this.targetRotX + this.parallaxY - this.currentRotX) * 0.06;
    this.currentRotY += (this.targetRotY + this.parallaxX - this.currentRotY) * 0.06;

    this.stackGroup.rotation.x = this.currentRotX;
    this.stackGroup.rotation.y = this.currentRotY + (this.activeTime * 0.08);

    const speedMultiplier = 1.2; // Base speed when running

    // 1. Portal (Event Horizon) Animation
    if (this.sunGlowMesh) {
      const pulse = 1 + Math.sin(now * 3) * (this.isRunning ? 0.22 : 0.1);
      this.sunGlowMesh.scale.set(pulse, pulse, pulse);
    }

    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < this.satMeshes.length; i++) {
      const mesh = this.satMeshes[i];
      const r = this.satOrbitRadii[i] * 0.8;
      const sp = this.satOrbitSpeeds[i] * speedMultiplier * 0.4; // Slower satellites
      const inc = this.satOrbitInclinations[i];
      const angle = this.satAngles[i] + this.activeTime * sp;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = Math.sin(angle * 2) * inc;

      mesh.position.set(x, y, z);
      positions.push(mesh.position);
    }

    if (this.satLines) {
      const posAttr = this.satLines.geometry.getAttribute('position') as THREE.BufferAttribute;
      let idx = 0;
      for (let i = 0; i < positions.length; i++) {
        const p1 = positions[i];
        const p2 = positions[(i + 1) % positions.length];
        posAttr.setXYZ(idx++, p1.x, p1.y, p1.z);
        posAttr.setXYZ(idx++, p2.x, p2.y, p2.z);
      }
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        posAttr.setXYZ(idx++, p.x, p.y, p.z);
        posAttr.setXYZ(idx++, 0, 0, 0);
      }
      posAttr.needsUpdate = true;
    }

    // 2. My COMPASS Gyroscopic Gimbal Animation
    if (this.compassOuterRing) {
      // Outer Emerald Ring pitch & yaw rotation
      this.compassOuterRing.rotation.x = Math.PI / 2 + Math.sin(this.activeTime * 0.75) * 0.38;
      this.compassOuterRing.rotation.y = this.activeTime * 0.55 * speedMultiplier;
      this.compassOuterRing.rotation.z = Math.cos(this.activeTime * 0.6) * 0.28;
    }
    if (this.compassInnerRing) {
      // Inner Blue Ring counter-gyroscopic precession
      this.compassInnerRing.rotation.x = this.activeTime * 0.75 * speedMultiplier;
      this.compassInnerRing.rotation.y = Math.cos(this.activeTime * 0.85) * 0.45;
      this.compassInnerRing.rotation.z = this.activeTime * 0.4 * speedMultiplier;
    }
    if (this.compassSparkStar) {
      this.compassSparkStar.rotation.z = -this.activeTime * 0.5 * speedMultiplier;
      const sparkScale = 1 + Math.sin(this.activeTime * 2.5) * 0.08;
      this.compassSparkStar.scale.set(sparkScale, sparkScale, sparkScale);
    }

    // 3. Matrix Web Server Animation (LED pulses)
    if (this.serverLeds.length > 0) {
      for (let i = 0; i < this.serverLeds.length; i++) {
        const led = this.serverLeds[i];
        const pulse = Math.sin(this.activeTime * (12 + i * 4)) > 0.1 ? 0.95 : 0.25;
        (led.material as THREE.MeshBasicMaterial).opacity = pulse;
      }
    }

    // 4. SQLite Database Store Animation
    if (this.dbGroup) {
      this.dbGroup.rotation.y = this.activeTime * 0.2 * speedMultiplier;
    }

    // 5. Flowing Data Cubes Animation
    if (this.dataCubes.length > 0) {
      for (let i = 0; i < this.dataCubes.length; i++) {
        const cube = this.dataCubes[i];
        if (this.isRunning) {
          const speed = this.dataCubeSpeeds[i] * speedMultiplier * 0.3; // Slower data cubes
          cube.position.y += speed;
          cube.rotation.x += 0.02 * speedMultiplier;
          cube.rotation.y += 0.02 * speedMultiplier;
          if (cube.position.y > 3.8) {
            cube.position.y = -3.7;
          }
        }
      }
    }

    if (this.renderer && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.renderer?.dispose();
  }
}
