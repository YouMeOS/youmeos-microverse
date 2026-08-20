import type { StackLayerStatus } from './types';

export class TelemetryViewManager {
  private splashVerificationSummary = document.getElementById('splash-verification-summary') as HTMLElement | null;

  public render(layers?: StackLayerStatus[]): void {
    if (!layers || layers.length === 0) return;

    let activeCount = 0;
    let installedCount = 0;

    layers.forEach(layer => {
      if (layer.installed) installedCount++;
      if (layer.active) activeCount++;

      const isRunning = layer.active;
      const isError = !layer.installed;
      const statusClass = isRunning ? 'running' : (isError ? 'stopped' : 'stopped');
      const statusLabel = isRunning ? 'Online' : (isError ? 'Missing' : 'Offline');

      // 1. Update Splash HUD Card
      const splashCard = document.getElementById(`splash-card-${layer.id}`);
      const splashPill = document.getElementById(`splash-pill-${layer.id}`);
      const splashDot = document.getElementById(`splash-dot-${layer.id}`);
      const splashLabel = document.getElementById(`splash-label-${layer.id}`);
      const splashDetail = document.getElementById(`splash-detail-${layer.id}`);

      if (splashCard && splashPill && splashDot && splashLabel) {
        splashPill.className = `telemetry-status-pill ${statusClass}`;
        splashDot.className = `dot ${statusClass}`;
        splashLabel.textContent = statusLabel;
        if (splashDetail && layer.details) {
          splashDetail.textContent = layer.details;
        }
        if (isRunning) {
          splashCard.classList.add('is-running');
        } else {
          splashCard.classList.remove('is-running');
        }
      }

      // 2. Update Dashboard Sidebar Card
      const dashCard = document.getElementById(`dash-card-${layer.id}`);
      const dashPill = document.getElementById(`dash-pill-${layer.id}`);
      const dashDot = document.getElementById(`dash-dot-${layer.id}`);
      const dashLabel = document.getElementById(`dash-label-${layer.id}`);
      const dashSub = document.getElementById(`dash-sub-${layer.id}`);

      if (dashCard && dashPill && dashDot && dashLabel) {
        dashPill.className = `tier-status-pill ${statusClass}`;
        dashDot.className = `dot ${statusClass}`;
        dashLabel.textContent = statusLabel;
        if (dashSub && layer.details) {
          dashSub.textContent = layer.details;
        }
        if (isRunning) {
          dashCard.classList.add('is-running');
        } else {
          dashCard.classList.remove('is-running');
        }
      }

      // 3. Update System Architecture Tab Text
      const archSub = document.getElementById(`arch-sub-${layer.id}`);
      const archVer = document.getElementById(`arch-ver-${layer.id}`);
      if (archSub && layer.details) {
        archSub.textContent = layer.details;
      }
      if (archVer && layer.version) {
        archVer.textContent = `v${layer.version}`;
      }
    });

    if (this.splashVerificationSummary) {
      if (activeCount === layers.length) {
        this.splashVerificationSummary.textContent = `${activeCount} / ${layers.length} Active & In Harmony`;
        this.splashVerificationSummary.style.color = 'var(--status-running)';
        this.splashVerificationSummary.style.borderColor = 'var(--status-running)';
      } else {
        this.splashVerificationSummary.textContent = `${installedCount} / ${layers.length} Components Verified`;
        this.splashVerificationSummary.style.color = 'var(--accent-cyan)';
        this.splashVerificationSummary.style.borderColor = 'rgba(98, 201, 255, 0.3)';
      }
    }
  }
}
