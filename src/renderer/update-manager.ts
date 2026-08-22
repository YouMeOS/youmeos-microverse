import type { DesktopApi, AppUpdateStatus } from './types';

export class UpdateManager {
  private api: DesktopApi;
  private currentStatus: AppUpdateStatus = { state: 'idle' };

  // Elements
  private btnCheckUpdates = document.getElementById('btn-check-updates') as HTMLButtonElement | null;
  private updateStatusLabel = document.getElementById('update-status-label') as HTMLSpanElement | null;
  private modalAppUpdate = document.getElementById('modal-app-update') as HTMLElement | null;
  private btnCloseModal = document.getElementById('btn-close-update-modal') as HTMLButtonElement | null;
  private btnDismiss = document.getElementById('btn-update-dismiss') as HTMLButtonElement | null;
  private btnUpdateAction = document.getElementById('btn-update-action') as HTMLButtonElement | null;
  private btnUpdateActionLabel = document.getElementById('btn-update-action-label') as HTMLSpanElement | null;
  private updateTargetVersion = document.getElementById('update-target-version') as HTMLElement | null;
  private updateReleaseDate = document.getElementById('update-release-date') as HTMLElement | null;
  private updateReleaseNotes = document.getElementById('update-release-notes') as HTMLElement | null;
  private updateProgressSection = document.getElementById('update-progress-section') as HTMLElement | null;
  private updateProgressPercent = document.getElementById('update-progress-percent') as HTMLElement | null;
  private updateProgressFill = document.getElementById('update-progress-fill') as HTMLElement | null;
  private updateProgressDetail = document.getElementById('update-progress-detail') as HTMLElement | null;
  private updateModalTitle = document.getElementById('update-modal-title') as HTMLElement | null;

  constructor(api: DesktopApi) {
    this.api = api;
    this.init();
  }

  private init(): void {
    this.bindEvents();
    this.subscribeStatus();
    this.fetchInitialStatus();
  }

  private bindEvents(): void {
    const handleCheckClick = () => {
      const isDownloaded = this.currentStatus.state === 'downloaded';
      const isAvailable = this.currentStatus.state === 'available';

      if (isDownloaded) {
        this.api.installUpdate?.();
      } else if (isAvailable) {
        this.openModal();
      } else {
        this.checkForUpdates();
      }
    };

    const handleActionClick = () => {
      const isAvailable = this.currentStatus.state === 'available';
      const isDownloaded = this.currentStatus.state === 'downloaded';

      if (isDownloaded) {
        this.api.installUpdate?.();
      } else if (isAvailable) {
        this.startDownload();
      }
    };

    const handleClose = () => this.closeModal();

    this.btnCheckUpdates?.addEventListener('click', handleCheckClick);
    this.btnUpdateAction?.addEventListener('click', handleActionClick);
    this.btnCloseModal?.addEventListener('click', handleClose);
    this.btnDismiss?.addEventListener('click', handleClose);
  }

  private subscribeStatus(): void {
    if (!this.api.onUpdateStatus) return;

    const handleUpdate = (status: AppUpdateStatus) => {
      this.currentStatus = status;
      this.render();
    };

    this.api.onUpdateStatus(handleUpdate);
  }

  private async fetchInitialStatus(): Promise<void> {
    if (!this.api.getUpdateStatus) return;
    try {
      const status = await this.api.getUpdateStatus();
      if (status) {
        this.currentStatus = status;
        this.render();
      }
    } catch {}
  }

  async checkForUpdates(): Promise<void> {
    if (!this.api.checkForUpdates) return;
    try {
      this.btnCheckUpdates?.classList.add('checking');
      if (this.updateStatusLabel) this.updateStatusLabel.textContent = 'Checking...';
      const status = await this.api.checkForUpdates();
      if (status) {
        this.currentStatus = status;
        this.render();
      }
    } catch (err) {
      if (this.updateStatusLabel) this.updateStatusLabel.textContent = 'Check Failed';
    } finally {
      this.btnCheckUpdates?.classList.remove('checking');
    }
  }

  private async startDownload(): Promise<void> {
    if (!this.api.downloadUpdate) return;
    try {
      if (this.btnUpdateAction) this.btnUpdateAction.disabled = true;
      if (this.btnUpdateActionLabel) this.btnUpdateActionLabel.textContent = 'Downloading...';
      await this.api.downloadUpdate();
    } catch (err) {
      if (this.btnUpdateAction) this.btnUpdateAction.disabled = false;
      if (this.btnUpdateActionLabel) this.btnUpdateActionLabel.textContent = 'Retry Download';
    }
  }

  private openModal(): void {
    if (!this.modalAppUpdate) return;
    this.modalAppUpdate.classList.remove('hidden');
    this.populateModal();
  }

  private closeModal(): void {
    if (!this.modalAppUpdate) return;
    this.modalAppUpdate.classList.add('hidden');
  }

  private populateModal(): void {
    const { version, releaseDate, releaseNotes, state, progress } = this.currentStatus;

    if (this.updateTargetVersion) {
      this.updateTargetVersion.textContent = version ? `v${version}` : 'Latest';
    }

    if (this.updateReleaseDate) {
      const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString() : 'Recent';
      this.updateReleaseDate.textContent = formattedDate;
    }

    if (this.updateReleaseNotes) {
      this.updateReleaseNotes.textContent = releaseNotes || 'Standard performance and stability improvements.';
    }

    const isDownloading = state === 'downloading';
    const isDownloaded = state === 'downloaded';

    if (this.updateProgressSection) {
      if (isDownloading) {
        this.updateProgressSection.classList.remove('hidden');
        const percent = progress?.percent ?? 0;
        if (this.updateProgressPercent) this.updateProgressPercent.textContent = `${percent}%`;
        if (this.updateProgressFill) this.updateProgressFill.style.width = `${percent}%`;
        if (this.updateProgressDetail && progress) {
          const loadedMb = (progress.transferred / 1048576).toFixed(1);
          const totalMb = (progress.total / 1048576).toFixed(1);
          const speedKb = Math.round(progress.bytesPerSecond / 1024);
          this.updateProgressDetail.textContent = `${loadedMb} MB / ${totalMb} MB (${speedKb} KB/s)`;
        }
      } else {
        this.updateProgressSection.classList.add('hidden');
      }
    }

    if (this.updateModalTitle) {
      this.updateModalTitle.textContent = isDownloaded
        ? 'Update Ready to Apply'
        : isDownloading
        ? 'Downloading Update...'
        : 'New Release Available';
    }

    if (this.btnUpdateAction && this.btnUpdateActionLabel) {
      if (isDownloaded) {
        this.btnUpdateAction.disabled = false;
        this.btnUpdateAction.classList.add('ready-install');
        this.btnUpdateActionLabel.textContent = 'Restart & Install';
      } else if (isDownloading) {
        this.btnUpdateAction.disabled = true;
        this.btnUpdateAction.classList.remove('ready-install');
        this.btnUpdateActionLabel.textContent = 'Downloading...';
      } else {
        this.btnUpdateAction.disabled = false;
        this.btnUpdateAction.classList.remove('ready-install');
        this.btnUpdateActionLabel.textContent = 'Download & Install';
      }
    }
  }

  private render(): void {
    const { state, version, progress } = this.currentStatus;

    if (!this.btnCheckUpdates || !this.updateStatusLabel) return;

    this.btnCheckUpdates.className = 'btn-update-check';

    switch (state) {
      case 'checking':
        this.btnCheckUpdates.classList.add('checking');
        this.updateStatusLabel.textContent = 'Checking...';
        break;

      case 'available':
        this.btnCheckUpdates.classList.add('available');
        this.updateStatusLabel.textContent = version ? `v${version} Available` : 'Update Available';
        this.openModal();
        break;

      case 'downloading':
        this.btnCheckUpdates.classList.add('downloading');
        const percent = progress?.percent ?? 0;
        this.updateStatusLabel.textContent = `Downloading ${percent}%`;
        this.populateModal();
        break;

      case 'downloaded':
        this.btnCheckUpdates.classList.add('downloaded');
        this.updateStatusLabel.textContent = 'Restart to Install';
        this.populateModal();
        break;

      case 'not-available':
        this.btnCheckUpdates.classList.add('up-to-date');
        this.updateStatusLabel.textContent = 'Up to Date';
        setTimeout(() => {
          if (this.currentStatus.state === 'not-available') {
            this.btnCheckUpdates?.classList.remove('up-to-date');
            if (this.updateStatusLabel) this.updateStatusLabel.textContent = 'Check Updates';
          }
        }, 4000);
        break;

      case 'error':
        this.btnCheckUpdates.classList.add('error');
        this.updateStatusLabel.textContent = 'Update Error';
        break;

      default:
        this.updateStatusLabel.textContent = 'Check Updates';
        break;
    }
  }
}
