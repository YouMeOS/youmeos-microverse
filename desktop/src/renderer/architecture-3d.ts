import * as THREE from 'three';

export interface Architecture3DOptions {
  containerHorizon: HTMLElement | null;
  containerCore: HTMLElement | null;
  containerBedrock: HTMLElement | null;
}

export class Architecture3DManager {
  private horizonRenderer: THREE.WebGLRenderer | null = null;
  private coreRenderer: THREE.WebGLRenderer | null = null;
  private bedrockRenderer: THREE.WebGLRenderer | null = null;

  private horizonScene: THREE.Scene = new THREE.Scene();
  private coreScene: THREE.Scene = new THREE.Scene();
  private bedrockScene: THREE.Scene = new THREE.Scene();

  private horizonCamera: THREE.PerspectiveCamera | null = null;
  private coreCamera: THREE.PerspectiveCamera | null = null;
  private bedrockCamera: THREE.PerspectiveCamera | null = null;

  // Horizon elements
  private horizonGroup: THREE.Group = new THREE.Group();
  private constellationGroup: THREE.Group = new THREE.Group();
  private sunMesh: THREE.Mesh | null = null;
  private sunGlowMesh: THREE.Mesh | null = null;
  private satMeshes: THREE.Mesh[] = [];
  private satLines: THREE.LineSegments | null = null;
  private satOrbitRadii: number[] = [2.2, 2.7, 3.1, 2.5, 3.4];
  private satOrbitSpeeds: number[] = [0.8, 0.6, 1.0, 0.7, 0.5];
  private satOrbitInclinations: number[] = [0.1, -0.15, 0.2, -0.05, 0.12];
  private satAngles: number[] = [0, 1.2, 2.4, 3.6, 4.8];

  // Core elements
  private coreGroup: THREE.Group = new THREE.Group();
  private goldenCube: THREE.Mesh | null = null;
  private goldenEdges: THREE.LineSegments | null = null;

  // Bedrock elements
  private bedrockGroup: THREE.Group = new THREE.Group();
  private bedrockSlab: THREE.Mesh | null = null;
  private bedrockEdges: THREE.LineSegments | null = null;

  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetRotX: number = 0;
  private targetRotY: number = 0;

  constructor(private options: Architecture3DOptions) {
    this.initHorizon();
    this.initCore();
    this.initBedrock();
    this.setupListeners();
    this.animate();
  }

  private initHorizon(): void {
    const container = this.options.containerHorizon;
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 185;
    const height = container.clientHeight || 110;

    this.horizonRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.horizonRenderer.setSize(width, height);
    this.horizonRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.horizonRenderer.domElement);

    this.horizonCamera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.horizonCamera.position.set(7, 6, 8);
    this.horizonCamera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x62c9ff, 1.2);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    this.horizonScene.add(ambientLight, dirLight);

    this.horizonGroup = new THREE.Group();
    this.horizonScene.add(this.horizonGroup);

    // 1. True 3D Wireframe Hypercube (Bounding Cage)
    const cubeSize = 3.6;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x62c9ff,
      transparent: true,
      opacity: 0.85,
      linewidth: 1.5
    });
    const wireframeCube = new THREE.LineSegments(edgesGeo, edgesMat);
    this.horizonGroup.add(wireframeCube);

    // Corner vertex spheres
    const cornerSphereGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const cornerSphereMat = new THREE.MeshBasicMaterial({ color: 0x62c9ff });
    const half = cubeSize / 2;
    const corners = [
      [-half, -half, -half], [half, -half, -half], [-half, half, -half], [half, half, -half],
      [-half, -half, half], [half, -half, half], [-half, half, half], [half, half, half]
    ];
    corners.forEach(([x, y, z]) => {
      const sp = new THREE.Mesh(cornerSphereGeo, cornerSphereMat);
      sp.position.set(x, y, z);
      this.horizonGroup.add(sp);
    });

    // 2. Equatorial Grid Plane inside cube
    const gridHelper = new THREE.GridHelper(cubeSize, 4, 0x62c9ff, 0x1e3a5f);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    this.horizonGroup.add(gridHelper);

    // 3. Central Singularity Sun
    const sunGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.horizonGroup.add(this.sunMesh);

    const glowGeo = new THREE.SphereGeometry(0.65, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x62c9ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    this.sunGlowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.horizonGroup.add(this.sunGlowMesh);

    // 4. Orbiting Constellation Group
    this.constellationGroup = new THREE.Group();
    this.horizonGroup.add(this.constellationGroup);

    const satColors = [0xffd599, 0x62c9ff, 0xffffff, 0xffd599, 0x62c9ff];
    this.satMeshes = [];
    for (let i = 0; i < 5; i++) {
      const satGeo = new THREE.SphereGeometry(0.14, 12, 12);
      const satMat = new THREE.MeshBasicMaterial({ color: satColors[i] });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      this.constellationGroup.add(satMesh);
      this.satMeshes.push(satMesh);
    }

    // Dynamic constellation lines
    const linePositions = new Float32Array(5 * 2 * 3 + 5 * 2 * 3); // 5 connecting + 5 to center
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffe0b2,
      transparent: true,
      opacity: 0.45
    });
    this.satLines = new THREE.LineSegments(lineGeo, lineMat);
    this.constellationGroup.add(this.satLines);

    // 5. Vertical Singularity Beacon Line
    const beaconGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -2.8, 0),
      new THREE.Vector3(0, 2.8, 0)
    ]);
    const beaconMat = new THREE.LineDashedMaterial({
      color: 0x62c9ff,
      dashSize: 0.25,
      gapSize: 0.15,
      transparent: true,
      opacity: 0.7
    });
    const beaconLine = new THREE.Line(beaconGeo, beaconMat);
    beaconLine.computeLineDistances();
    this.horizonGroup.add(beaconLine);
  }

  private initCore(): void {
    const container = this.options.containerCore;
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 185;
    const height = container.clientHeight || 110;

    this.coreRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.coreRenderer.setSize(width, height);
    this.coreRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.coreRenderer.domElement);

    this.coreCamera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.coreCamera.position.set(7, 6, 8);
    this.coreCamera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffe0b2, 1.4);
    const dirLight = new THREE.DirectionalLight(0xffd599, 2.2);
    dirLight.position.set(6, 10, 8);
    const fillLight = new THREE.DirectionalLight(0x8a5316, 1.0);
    fillLight.position.set(-6, -4, -4);
    this.coreScene.add(ambientLight, dirLight, fillLight);

    this.coreGroup = new THREE.Group();
    this.coreScene.add(this.coreGroup);

    // Solid 3D Golden Cube (Reference Slide)
    const size = 3.2;
    const cubeGeo = new THREE.BoxGeometry(size, size, size);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0xd49b56,
      roughness: 0.28,
      metalness: 0.7,
      emissive: 0x4a2a0a,
      emissiveIntensity: 0.3
    });
    this.goldenCube = new THREE.Mesh(cubeGeo, cubeMat);
    this.coreGroup.add(this.goldenCube);

    const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xfff0d0,
      transparent: true,
      opacity: 0.8,
      linewidth: 1.2
    });
    this.goldenEdges = new THREE.LineSegments(edgesGeo, edgesMat);
    this.coreGroup.add(this.goldenEdges);
  }

  private initBedrock(): void {
    const container = this.options.containerBedrock;
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 185;
    const height = container.clientHeight || 110;

    this.bedrockRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.bedrockRenderer.setSize(width, height);
    this.bedrockRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.bedrockRenderer.domElement);

    this.bedrockCamera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.bedrockCamera.position.set(7, 6, 8);
    this.bedrockCamera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x62c9ff, 1.0);
    const dirLight = new THREE.DirectionalLight(0x62c9ff, 1.8);
    dirLight.position.set(6, 8, 6);
    this.bedrockScene.add(ambientLight, dirLight);

    this.bedrockGroup = new THREE.Group();
    this.bedrockScene.add(this.bedrockGroup);

    // 3D Flat Foundation Slab (Reference Slide)
    const slabGeo = new THREE.BoxGeometry(4.2, 0.7, 4.2);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x0e1726,
      roughness: 0.35,
      metalness: 0.5,
      emissive: 0x060c14,
      emissiveIntensity: 0.4
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
  }

  private setupListeners(): void {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      this.targetRotY = normX * 0.25;
      this.targetRotX = -normY * 0.15;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      this.resizeRenderer(this.horizonRenderer, this.horizonCamera, this.options.containerHorizon);
      this.resizeRenderer(this.coreRenderer, this.coreCamera, this.options.containerCore);
      this.resizeRenderer(this.bedrockRenderer, this.bedrockCamera, this.options.containerBedrock);
    };
    window.addEventListener('resize', handleResize);
  }

  private resizeRenderer(
    renderer: THREE.WebGLRenderer | null,
    camera: THREE.PerspectiveCamera | null,
    container: HTMLElement | null
  ): void {
    if (!renderer || !camera || !container) return;
    const w = container.clientWidth || 185;
    const h = container.clientHeight || 110;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  public resize(): void {
    this.resizeRenderer(this.horizonRenderer, this.horizonCamera, this.options.containerHorizon);
    this.resizeRenderer(this.coreRenderer, this.coreCamera, this.options.containerCore);
    this.resizeRenderer(this.bedrockRenderer, this.bedrockCamera, this.options.containerBedrock);
  }

  public setRunning(running: boolean): void {
    this.isRunning = running;
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const time = performance.now() * 0.001;

    // Smooth mouse parallax interpolation
    this.mouseX += (this.targetRotX - this.mouseX) * 0.05;
    this.mouseY += (this.targetRotY - this.mouseY) * 0.05;

    // Base subtle isometric orientation
    const baseRotY = Math.PI / 4;
    const baseRotX = Math.atan(1 / Math.sqrt(2)) * 0.85;

    // 1. Horizon Animation
    if (this.horizonRenderer && this.horizonCamera) {
      this.horizonGroup.rotation.y = baseRotY + this.mouseY;
      this.horizonGroup.rotation.x = baseRotX + this.mouseX;

      // Sun pulsing
      if (this.sunGlowMesh) {
        const pulse = 1 + Math.sin(time * 3) * (this.isRunning ? 0.25 : 0.12);
        this.sunGlowMesh.scale.set(pulse, pulse, pulse);
      }

      // Orbiting satellites calculation
      const speedMultiplier = this.isRunning ? 2.2 : 0.8;
      const positions: THREE.Vector3[] = [];

      for (let i = 0; i < this.satMeshes.length; i++) {
        const mesh = this.satMeshes[i];
        const r = this.satOrbitRadii[i];
        const sp = this.satOrbitSpeeds[i] * speedMultiplier;
        const inc = this.satOrbitInclinations[i];
        const angle = this.satAngles[i] + time * sp;

        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const y = Math.sin(angle * 2) * inc;

        mesh.position.set(x, y, z);
        positions.push(mesh.position);
      }

      // Update dynamic constellation connecting lines
      if (this.satLines) {
        const posAttr = this.satLines.geometry.getAttribute('position') as THREE.BufferAttribute;
        let idx = 0;

        // Connect each satellite to next
        for (let i = 0; i < positions.length; i++) {
          const p1 = positions[i];
          const p2 = positions[(i + 1) % positions.length];

          posAttr.setXYZ(idx++, p1.x, p1.y, p1.z);
          posAttr.setXYZ(idx++, p2.x, p2.y, p2.z);
        }

        // Connect each satellite to central sun
        for (let i = 0; i < positions.length; i++) {
          const p = positions[i];
          posAttr.setXYZ(idx++, p.x, p.y, p.z);
          posAttr.setXYZ(idx++, 0, 0, 0);
        }

        posAttr.needsUpdate = true;
      }

      this.horizonRenderer.render(this.horizonScene, this.horizonCamera);
    }

    // 2. Core Animation
    if (this.coreRenderer && this.coreCamera) {
      this.coreGroup.rotation.y = baseRotY + this.mouseY + (this.isRunning ? time * 0.15 : 0);
      this.coreGroup.rotation.x = baseRotX + this.mouseX;
      this.coreGroup.position.y = Math.sin(time * 1.6) * 0.15; // Gentle 3D floating

      this.coreRenderer.render(this.coreScene, this.coreCamera);
    }

    // 3. Bedrock Animation
    if (this.bedrockRenderer && this.bedrockCamera) {
      this.bedrockGroup.rotation.y = baseRotY + this.mouseY * 0.5;
      this.bedrockGroup.rotation.x = baseRotX + this.mouseX * 0.5;

      this.bedrockRenderer.render(this.bedrockScene, this.bedrockCamera);
    }
  };

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.horizonRenderer?.dispose();
    this.coreRenderer?.dispose();
    this.bedrockRenderer?.dispose();
  }
}
