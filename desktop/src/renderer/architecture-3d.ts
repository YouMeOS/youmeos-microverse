import * as THREE from 'three';

export interface Architecture3DOptions {
  container: HTMLElement | null;
  onLayerSelect?: (layerId: string) => void;
}

export type StackLayerId = 'portal' | 'compass' | 'core' | 'database' | 'bedrock' | 'server' | 'network';

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

  // Layer 3: Headless Core elements
  private goldenCube: THREE.Mesh | null = null;
  private goldenEdges: THREE.LineSegments | null = null;

  // Layer 4: SQLite DB elements
  // (Using generic group rotation for db elements)

  // Layer 5: Bedrock Foundation Base Slab
  private bedrockSlab: THREE.Mesh | null = null;
  private bedrockEdges: THREE.LineSegments | null = null;

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

  // Layer Height Offsets (Optimized vertical separation)
  private readonly Y_PORTAL = 3.9;
  private readonly Y_COMPASS = 2.6;
  private readonly Y_DB = 1.3;
  private readonly Y_BEDROCK = 0.0;
  private readonly Y_CORE = -1.3;
  private readonly Y_SERVER = -2.6;
  private readonly Y_NETWORK = -3.9;

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
    this.camera.position.set(0, 0.7, 15.2);
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

    // Build Layer 7: Network
    this.buildNetworkLayer();

    // Build Layer 6: Web Server
    this.buildServerLayer();

    // Build Layer 5: Blackbox Bedrock Foundation
    this.buildBedrockLayer();

    // Build Layer 4: SQLite Database Store
    this.buildDatabaseLayer();

    // Build Layer 3: Headless Core (Application Kernel)
    this.buildCoreLayer();

    // Build Layer 2: My COMPASS (Sparks & Navigation)
    this.buildCompassLayer();

    // Build Layer 1: Portal / Event Horizon (Singularity & Hypercube)
    this.buildPortalLayer();

    // Add all layers to master stack
    this.stackGroup.add(
      this.networkGroup,
      this.serverGroup,
      this.bedrockGroup,
      this.dbGroup,
      this.coreGroup,
      this.compassGroup,
      this.portalGroup
    );
  }

  private buildSpine(): void {
    const points = [
      new THREE.Vector3(0, -3.9, 0),
      new THREE.Vector3(0, 3.9, 0)
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

    // Flowing Data Cubes along the spine
    const cubeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x62c9ff,
      emissive: 0x2979ff,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    const count = 12;
    for (let i = 0; i < count; i++) {
      const dbCube = new THREE.Mesh(cubeGeo, cubeMat);
      dbCube.position.set(
        (Math.random() - 0.5) * 0.2,
        -3.9 + Math.random() * 7.8,
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

    // Web Server Block
    const serverHeight = 0.8;
    const cubeGeo = new THREE.BoxGeometry(this.BOX_FOOTPRINT, serverHeight, this.BOX_FOOTPRINT);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald green for server
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x064e3b,
      emissiveIntensity: 0.5
    });
    const serverBlock = new THREE.Mesh(cubeGeo, cubeMat);
    this.serverGroup.add(serverBlock);

    const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.9,
      linewidth: 1.5
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    this.serverGroup.add(edges);
  }

  private buildNetworkLayer(): void {
    this.networkGroup = new THREE.Group();
    this.networkGroup.position.y = this.Y_NETWORK;

    // Glowing network grid
    const gridHelper = new THREE.GridHelper(this.BOX_FOOTPRINT * 1.5, 8, 0xef4444, 0x7f1d1d);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.6;
    this.networkGroup.add(gridHelper);

    // Network nodes
    const nodeGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.8
    });
    
    const positions = [
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 0, 0], [1.5, 0, 0], [-1.5, 0, 0], [0, 0, 1.5], [0, 0, -1.5]
    ];
    
    positions.forEach(([x, y, z]) => {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x, y, z);
      this.networkGroup.add(node);
    });
  }

  private buildCoreLayer(): void {
    this.coreGroup = new THREE.Group();
    this.coreGroup.position.y = this.Y_CORE;

    // Solid 3D Golden Cube (Application Kernel)
    const coreHeight = 1.5;
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

    // Outer Gyro Gimbal Ring
    const outerRingGeo = new THREE.TorusGeometry(1.65, 0.035, 12, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x62c9ff, transparent: true, opacity: 0.85 });
    this.compassOuterRing = new THREE.Mesh(outerRingGeo, ringMat);
    this.compassOuterRing.rotation.x = Math.PI / 2;
    this.compassGroup.add(this.compassOuterRing);

    // Inner Gimbal Ring
    const innerRingGeo = new THREE.TorusGeometry(1.2, 0.03, 12, 36);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
    this.compassInnerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    this.compassGroup.add(this.compassInnerRing);

    // 4-point Diamond Spark Star
    this.compassSparkStar = new THREE.Group();
    const needleMatCyan = new THREE.MeshStandardMaterial({ color: 0x62c9ff, roughness: 0.2, metalness: 0.8 });
    const needleMatGold = new THREE.MeshStandardMaterial({ color: 0xffd599, roughness: 0.2, metalness: 0.8 });

    // North needle
    const northCone = new THREE.ConeGeometry(0.25, 1.0, 4);
    const northMesh = new THREE.Mesh(northCone, needleMatCyan);
    northMesh.position.y = 0.5;
    this.compassSparkStar.add(northMesh);

    // South needle
    const southCone = new THREE.ConeGeometry(0.25, 1.0, 4);
    const southMesh = new THREE.Mesh(southCone, needleMatGold);
    southMesh.position.y = -0.5;
    southMesh.rotation.z = Math.PI;
    this.compassSparkStar.add(southMesh);

    // East / West needles
    const eastCone = new THREE.ConeGeometry(0.2, 0.7, 4);
    const eastMesh = new THREE.Mesh(eastCone, needleMatCyan);
    eastMesh.position.x = 0.35;
    eastMesh.rotation.z = -Math.PI / 2;
    this.compassSparkStar.add(eastMesh);

    const westCone = new THREE.ConeGeometry(0.2, 0.7, 4);
    const westMesh = new THREE.Mesh(westCone, needleMatCyan);
    westMesh.position.x = -0.35;
    westMesh.rotation.z = Math.PI / 2;
    this.compassSparkStar.add(westMesh);

    // Center Core Spark Sphere
    const centerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    this.compassSparkStar.add(centerSphere);

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

    const onMouseDown = (e: MouseEvent) => {
      this.isDragging = true;
      this.previousMouseX = e.clientX;
      this.previousMouseY = e.clientY;
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

    const onMouseUp = () => {
      this.isDragging = false;
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

    const onTouchEnd = () => {
      this.isDragging = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    window.addEventListener('resize', () => this.resize());
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

  public resize(): void {
    const container = this.options.container;
    if (!this.renderer || !this.camera || !container) return;

    const w = container.clientWidth || 480;
    const h = container.clientHeight || 520;
    this.camera.aspect = w / h;
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

    // 2. My COMPASS Animation
    if (this.compassOuterRing) {
      this.compassOuterRing.rotation.z = this.activeTime * 0.35 * speedMultiplier;
    }
    if (this.compassInnerRing) {
      this.compassInnerRing.rotation.y = this.activeTime * 0.7 * speedMultiplier;
      this.compassInnerRing.rotation.x = this.activeTime * 0.4 * speedMultiplier;
    }
    if (this.compassSparkStar) {
      this.compassSparkStar.rotation.z = -this.activeTime * 0.5 * speedMultiplier;
      const sparkScale = 1 + Math.sin(this.activeTime * 2.5) * 0.06;
      this.compassSparkStar.scale.set(sparkScale, sparkScale, sparkScale);
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
          if (cube.position.y > 3.9) {
            cube.position.y = -3.9;
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
