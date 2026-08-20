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
  private dbOrbitalRing: THREE.Mesh | null = null;
  private dbNodes: THREE.Mesh[] = [];

  // Layer 5: Bedrock Foundation Base Slab
  private bedrockSlab: THREE.Mesh | null = null;
  private bedrockEdges: THREE.LineSegments | null = null;

  // Central Singularity Energy Spine
  private spineLine: THREE.Line | null = null;
  private pulseParticles: THREE.Points | null = null;
  private pulseParticlePositions: Float32Array = new Float32Array(30 * 3);

  // State & Interactivity
  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private activeHoverLayer: string | null = null;

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
  private readonly Y_PORTAL = 3.65;
  private readonly Y_COMPASS = 1.95;
  private readonly Y_CORE = 0.15;
  private readonly Y_DB = -1.4;
  private readonly Y_BEDROCK = -2.9;

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
    // 1. Build Central Singularity Spine
    this.buildSpine();

    // 2. Build Layer 5: Blackbox Bedrock Foundation & Server Halo
    this.buildBedrockLayer();

    // 3. Build Layer 4: SQLite Database Store
    this.buildDatabaseLayer();

    // 4. Build Layer 3: Headless Core (Application Kernel)
    this.buildCoreLayer();

    // 5. Build Layer 2: My COMPASS (Sparks & Navigation)
    this.buildCompassLayer();

    // 6. Build Layer 1: Portal / Event Horizon (Singularity & Hypercube)
    this.buildPortalLayer();

    // Add all layers to master stack
    this.stackGroup.add(
      this.bedrockGroup,
      this.dbGroup,
      this.coreGroup,
      this.compassGroup,
      this.portalGroup
    );
  }

  private buildSpine(): void {
    const points = [
      new THREE.Vector3(0, -3.8, 0),
      new THREE.Vector3(0, 4.8, 0)
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

    // Dynamic ascending energy particles
    const count = 30;
    this.pulseParticlePositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      this.pulseParticlePositions[i * 3] = (Math.random() - 0.5) * 0.15;
      this.pulseParticlePositions[i * 3 + 1] = -3.8 + Math.random() * 8.6;
      this.pulseParticlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(this.pulseParticlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x62c9ff,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    this.pulseParticles = new THREE.Points(particleGeo, particleMat);
    this.stackGroup.add(this.pulseParticles);
  }

  private buildBedrockLayer(): void {
    this.bedrockGroup = new THREE.Group();
    this.bedrockGroup.position.y = this.Y_BEDROCK;

    // Bedrock Base Slab
    const slabSize = 3.6;
    const slabGeo = new THREE.BoxGeometry(slabSize, 0.5, slabSize);
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
    const gridHelper = new THREE.GridHelper(slabSize * 1.05, 4, 0x62c9ff, 0x1e3a5f);
    gridHelper.position.y = 0.26;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.45;
    this.bedrockGroup.add(gridHelper);
  }

  private buildDatabaseLayer(): void {
    this.dbGroup = new THREE.Group();
    this.dbGroup.position.y = this.Y_DB;

    // Database Orbital Ring
    const ringGeo = new THREE.TorusGeometry(1.55, 0.025, 8, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.65
    });
    this.dbOrbitalRing = new THREE.Mesh(ringGeo, ringMat);
    this.dbOrbitalRing.rotation.x = Math.PI / 2.3;
    this.dbGroup.add(this.dbOrbitalRing);

    // Floating SQLite Data Modules
    this.dbNodes = [];
    const cubeGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x6b21a8,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8
    });

    for (let i = 0; i < 3; i++) {
      const dbCube = new THREE.Mesh(cubeGeo, cubeMat);
      this.dbGroup.add(dbCube);
      this.dbNodes.push(dbCube);
    }
  }

  private buildCoreLayer(): void {
    this.coreGroup = new THREE.Group();
    this.coreGroup.position.y = this.Y_CORE;

    // Solid 3D Golden Cube (Application Kernel)
    const size = 1.9;
    const cubeGeo = new THREE.BoxGeometry(size, size, size);
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
    const cubeSize = 2.4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
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
    const half = cubeSize / 2;
    const corners = [
      [-half, -half, -half], [half, -half, -half], [-half, half, -half], [half, half, -half],
      [-half, -half, half], [half, -half, half], [-half, half, half], [half, half, half]
    ];
    corners.forEach(([x, y, z]) => {
      const sp = new THREE.Mesh(cornerSphereGeo, cornerSphereMat);
      sp.position.set(x, y, z);
      this.portalGroup.add(sp);
    });

    // Equatorial Grid Plane inside cube
    const gridHelper = new THREE.GridHelper(cubeSize, 4, 0x62c9ff, 0x1e3a5f);
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
      { id: 'server', group: this.bedrockGroup, baseScale: 1.0 },
      { id: 'network', group: this.bedrockGroup, baseScale: 1.0 }
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
    const time = performance.now() * 0.001;

    // Smooth Spring Rotation towards target + parallax
    this.currentRotX += (this.targetRotX + this.parallaxY - this.currentRotX) * 0.06;
    this.currentRotY += (this.targetRotY + this.parallaxX - this.currentRotY) * 0.06;

    this.stackGroup.rotation.x = this.currentRotX;
    this.stackGroup.rotation.y = this.currentRotY + (this.isRunning ? time * 0.08 : 0);

    const speedMultiplier = this.isRunning ? 2.4 : 1.0;

    // 1. Portal (Event Horizon) Animation
    if (this.sunGlowMesh) {
      const pulse = 1 + Math.sin(time * 3) * (this.isRunning ? 0.22 : 0.1);
      this.sunGlowMesh.scale.set(pulse, pulse, pulse);
    }

    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < this.satMeshes.length; i++) {
      const mesh = this.satMeshes[i];
      const r = this.satOrbitRadii[i] * 0.8;
      const sp = this.satOrbitSpeeds[i] * speedMultiplier;
      const inc = this.satOrbitInclinations[i];
      const angle = this.satAngles[i] + time * sp;

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

    if (this.portalWireframe) {
      this.portalWireframe.rotation.y = time * 0.15 * speedMultiplier;
    }

    // 2. My COMPASS Animation
    if (this.compassOuterRing) {
      this.compassOuterRing.rotation.z = time * 0.35 * speedMultiplier;
    }
    if (this.compassInnerRing) {
      this.compassInnerRing.rotation.y = time * 0.7 * speedMultiplier;
      this.compassInnerRing.rotation.x = time * 0.4 * speedMultiplier;
    }
    if (this.compassSparkStar) {
      this.compassSparkStar.rotation.z = -time * 0.5 * speedMultiplier;
      const sparkScale = 1 + Math.sin(time * 2.5) * 0.06;
      this.compassSparkStar.scale.set(sparkScale, sparkScale, sparkScale);
    }

    // 3. Headless Core Animation
    if (this.coreGroup) {
      this.coreGroup.rotation.y = -time * 0.2 * speedMultiplier;
      this.coreGroup.position.y = this.Y_CORE + Math.sin(time * 1.5) * 0.08;
    }

    // 4. SQLite Database Store Animation
    if (this.dbOrbitalRing) {
      this.dbOrbitalRing.rotation.z = time * 0.5 * speedMultiplier;
    }
    for (let i = 0; i < this.dbNodes.length; i++) {
      const node = this.dbNodes[i];
      const angle = time * 0.8 * speedMultiplier + (i * Math.PI * 2) / 3;
      const rad = 1.55;
      node.position.set(
        Math.cos(angle) * rad,
        Math.sin(angle * 2) * 0.15,
        Math.sin(angle) * rad
      );
      node.rotation.x = time * 2;
      node.rotation.y = time * 2;
    }

    // 5. Central Spine Particles Animation
    if (this.pulseParticles) {
      const attr = this.pulseParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const count = arr.length / 3;
      const speed = (this.isRunning ? 2.5 : 1.0) * 0.025;

      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] += speed;
        if (arr[i * 3 + 1] > 4.8) {
          arr[i * 3 + 1] = -3.8;
        }
      }
      attr.needsUpdate = true;
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
