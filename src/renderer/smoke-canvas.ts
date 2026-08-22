/**
 * YouMeOS Liquid Smoke Generative Canvas Engine
 * Procedurally animated harmonic waves and kinetic stardust particles.
 */

interface WaveConfig {
  y: number;
  amplitude: number;
  wavelength: number;
  speed: number;
  offset: number;
  color: string;
  blur: number;
  thickness: number;
  scales: number[];
  drifts: number[];
  thickScales: number[];
  thickDrifts: number[];
  isRibbon?: boolean;
}

interface StardustParticle {
  x: number;
  orbitRadiusOffset: number;
  orbitAngleOffset: number;
  size: number;
  speedX: number;
  flickerSpeed: number;
  flickerPhase: number;
  orbitPhase: number;
}

export class SmokeCanvasEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private particles: StardustParticle[] = [];
  private readonly maxParticles = 160;

  private waves: WaveConfig[] = [
    {
      y: 0.48,
      amplitude: 45,
      wavelength: 700,
      speed: 0.0002,
      offset: 0,
      color: 'rgba(98, 201, 255, 0.16)',
      blur: 6,
      thickness: 110,
      scales: [1.0, 2.3, 0.7, 0.2],
      drifts: [1.0, 1.5, 0.8, 0.2],
      thickScales: [0.5, 1.2, 0.3],
      thickDrifts: [0.8, 0.4, 1.1]
    },
    {
      y: 0.46,
      amplitude: 38,
      wavelength: 900,
      speed: -0.00035,
      offset: Math.PI,
      color: 'rgba(41, 121, 255, 0.14)',
      blur: 5,
      thickness: 180,
      scales: [1.2, 1.8, 0.5, 0.3],
      drifts: [0.9, 1.7, 0.6, 0.4],
      thickScales: [0.7, 0.9, 0.4],
      thickDrifts: [1.2, 0.5, 0.8]
    },
    {
      y: 0.52,
      amplitude: 28,
      wavelength: 1200,
      speed: 0.0004,
      offset: Math.PI / 2,
      color: 'rgba(255, 255, 255, 0.45)',
      blur: 3,
      thickness: 18,
      scales: [0.8, 2.7, 1.1, 0.1],
      drifts: [1.1, 1.3, 1.2, 0.1],
      thickScales: [0.4, 1.5, 0.2],
      thickDrifts: [0.6, 0.9, 1.3],
      isRibbon: true
    },
    {
      y: 0.50,
      amplitude: 42,
      wavelength: 820,
      speed: -0.00028,
      offset: Math.PI * 1.5,
      color: 'rgba(168, 85, 247, 0.12)',
      blur: 6,
      thickness: 240,
      scales: [1.5, 1.2, 0.9, 0.4],
      drifts: [0.7, 2.0, 0.5, 0.3],
      thickScales: [0.6, 0.8, 0.5],
      thickDrifts: [1.0, 0.3, 0.7]
    }
  ];

  constructor(canvasElement?: HTMLCanvasElement | null) {
    if (canvasElement) {
      this.canvas = canvasElement;
    } else {
      this.canvas = document.getElementById('microverse-smoke-canvas') as HTMLCanvasElement | null;
    }

    if (this.canvas) {
      this.init();
    }
  }

  private createParticle(x: number): StardustParticle {
    return {
      x,
      orbitRadiusOffset: (Math.random() - 0.5) * 35,
      orbitAngleOffset: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 0.6 + 0.7,
      speedX: 0.15 + Math.random() * 0.45,
      flickerSpeed: Math.random() * 0.0006 + 0.002,
      flickerPhase: Math.random() * Math.PI * 2,
      orbitPhase: 0
    };
  }

  private getWaveY(wave: WaveConfig, x: number, time: number, height: number): number {
    const baseline = height * wave.y;
    const t = time * wave.speed + wave.offset;
    const relX = x / wave.wavelength;
    const w1 = Math.sin(relX * wave.scales[0] + t * wave.drifts[0]);
    const w2 = Math.sin(relX * wave.scales[1] + t * wave.drifts[1]) * 0.5;
    const w3 = Math.sin(relX * wave.scales[2] - t * wave.drifts[2]) * 0.3;
    const w4 = Math.sin(t * wave.scales[3]) * wave.drifts[3];
    return baseline + (w1 + w2 + w3 + w4) * wave.amplitude;
  }

  private getWaveThickness(wave: WaveConfig, x: number, time: number): number {
    const t = time * wave.speed + wave.offset;
    const relX = x / wave.wavelength;
    const th1 = Math.sin(relX * wave.thickScales[0] + t * wave.thickDrifts[0]);
    const th2 = Math.sin(relX * wave.thickScales[1] + t * wave.thickDrifts[1]) * 0.4;
    const th3 = Math.sin(t * wave.thickScales[2]) * wave.thickDrifts[2];
    return wave.thickness + (th1 + th2 + th3) * (wave.amplitude * 0.6);
  }

  private handleResize = (): void => {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  public init(): void {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    window.addEventListener('resize', this.handleResize);
    this.handleResize();

    const half = this.maxParticles / 2;
    const step = this.canvas.width / half;
    this.particles = [];

    for (let i = 0; i < half; i++) {
      const x = i * step;
      this.particles.push(this.createParticle(x));
      const p2 = this.createParticle(x);
      p2.speedX *= -1;
      p2.orbitPhase = Math.PI;
      this.particles.push(p2);
    }

    this.animate(performance.now());
  }

  private animate = (time: number): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    if (!this.ctx || !this.canvas) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.clearRect(0, 0, width, height);

    for (const wave of this.waves) {
      const baseline = height * wave.y;
      this.ctx.beginPath();
      this.ctx.moveTo(0, baseline);

      for (let x = 0; x <= width; x += 12) {
        this.ctx.lineTo(x, this.getWaveY(wave, x, time, height));
      }

      for (let x = width; x >= 0; x -= 12) {
        const t = time * wave.speed + wave.offset;
        const th1 = Math.sin((x / wave.wavelength) * wave.thickScales[0] + t * wave.thickDrifts[0]);
        const th2 = Math.sin((x / wave.wavelength) * wave.thickScales[1] + t * wave.thickDrifts[1]) * 0.4;
        const th3 = Math.sin(t * wave.thickScales[2]) * wave.thickDrifts[2];
        const currentThickness = wave.thickness + (th1 + th2 + th3) * (wave.amplitude * 0.6);
        this.ctx.lineTo(x, this.getWaveY(wave, x, time, height) + currentThickness);
      }

      this.ctx.closePath();

      const grad = this.ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, 'rgba(14, 24, 42, 0.02)');
      grad.addColorStop(0.2, 'rgba(98, 201, 255, 0.08)');
      grad.addColorStop(0.5, wave.color);
      grad.addColorStop(0.8, 'rgba(41, 121, 255, 0.08)');
      grad.addColorStop(1, 'rgba(14, 24, 42, 0.02)');
      this.ctx.fillStyle = grad;

      if (wave.blur > 0) {
        this.ctx.filter = `blur(${wave.blur}px)`;
      }
      this.ctx.fill();
      this.ctx.filter = 'none';
    }

    const ribbonWave = this.waves.find(w => w.isRibbon);
    if (ribbonWave) {
      this.ctx.save();
      this.ctx.shadowBlur = 2;
      this.ctx.shadowColor = '#62c9ff';

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.speedX;
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;

        const finalAngle = p.x * 0.008 + time * 0.0003 + p.orbitPhase + p.orbitAngleOffset;
        const volThick = this.getWaveThickness(ribbonWave, p.x, time);
        const centerY = this.getWaveY(ribbonWave, p.x, time, height) + volThick / 2;
        const currentY = centerY + Math.sin(finalAngle) * (volThick / 2 + 50 + p.orbitRadiusOffset);
        const depthFactor = (Math.cos(finalAngle) + 1) / 2;
        const flicker = 0.5 + Math.sin(time * p.flickerSpeed + p.flickerPhase) * 0.5;

        this.ctx.beginPath();
        this.ctx.arc(p.x, currentY, p.size * (0.7 + depthFactor * 0.6), 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(220, 240, 255, ${(depthFactor * 0.7 + 0.3) * (0.7 + flicker * 0.3)})`;
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  };

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
  }
}

export function initSmokeCanvas(target: string | HTMLCanvasElement = 'microverse-smoke-canvas'): SmokeCanvasEngine | null {
  const el = typeof target === 'string'
    ? (document.getElementById(target) as HTMLCanvasElement | null)
    : target;
  if (!el) return null;
  return new SmokeCanvasEngine(el);
}
