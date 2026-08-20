import type { DownloadProgress } from './types';

export class DownloadPanelManager {
  private downloadPanel = document.getElementById('download-panel') as HTMLElement | null;
  private downloadTitle = document.getElementById('download-title') as HTMLElement | null;
  private downloadDetail = document.getElementById('download-detail') as HTMLElement | null;
  private downloadSpeed = document.getElementById('download-speed') as HTMLElement | null;
  private downloadPercent = document.getElementById('download-percent') as HTMLElement | null;
  private downloadBar = document.getElementById('download-bar') as HTMLElement | null;

  private hideDownloadTimer: NodeJS.Timeout | null = null;

  public formatSpeed(bytesPerSec?: number): string {
    if (!bytesPerSec || bytesPerSec <= 0) return '';
    const kb = bytesPerSec / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB/s`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB/s`;
  }

  public render(progress: DownloadProgress | null | undefined): void {
    if (!this.downloadPanel) return;

    if (!progress) {
      if (!this.downloadPanel.classList.contains('hidden') && this.hideDownloadTimer === null) {
        this.hideDownloadTimer = setTimeout(() => {
          this.downloadPanel?.classList.add('hidden');
          this.hideDownloadTimer = null;
        }, 800);
      }
      return;
    }

    if (this.hideDownloadTimer !== null) {
      clearTimeout(this.hideDownloadTimer);
      this.hideDownloadTimer = null;
    }

    this.downloadPanel.classList.remove('hidden');

    const isExtracting = progress.stage === 'extracting';
    const isComplete = progress.stage === 'complete';

    if (this.downloadTitle && this.downloadDetail && this.downloadSpeed && this.downloadPercent && this.downloadBar) {
      if (isExtracting) {
        this.downloadTitle.textContent = `Extracting ${progress.item}...`;
        this.downloadDetail.textContent = progress.detail || 'Extracting archive contents...';
        this.downloadSpeed.textContent = '';
        this.downloadPercent.textContent = '100%';
        this.downloadBar.classList.add('indeterminate');
        this.downloadBar.style.width = '100%';
      } else if (isComplete) {
        this.downloadTitle.textContent = `${progress.item} Ready`;
        this.downloadDetail.textContent = progress.detail || 'Setup completed';
        this.downloadSpeed.textContent = '';
        this.downloadPercent.textContent = '100%';
        this.downloadBar.classList.remove('indeterminate');
        this.downloadBar.style.width = '100%';
      } else {
        this.downloadTitle.textContent = `Downloading ${progress.item}...`;
        this.downloadDetail.textContent = progress.detail || `${progress.loaded} bytes`;
        this.downloadSpeed.textContent = this.formatSpeed(progress.speed);
        this.downloadPercent.textContent = `${progress.percent}%`;
        this.downloadBar.classList.remove('indeterminate');
        this.downloadBar.style.width = `${progress.percent}%`;
      }
    }
  }
}
