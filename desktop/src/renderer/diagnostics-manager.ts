import type { DesktopApi, WpUser, DbHealthResult } from './types';

export class DiagnosticsManager {
  private api: DesktopApi;
  private users: WpUser[] = [];

  // Modal & Trigger Elements
  private btnOpenDiagnostics = document.getElementById('btn-open-diagnostics') as HTMLButtonElement | null;
  private btnHeaderDiagnostics = document.getElementById('btn-header-diagnostics') as HTMLButtonElement | null;
  private modalDiagnostics = document.getElementById('modal-diagnostics') as HTMLElement | null;
  private btnCloseModal = document.getElementById('btn-close-diagnostics-modal') as HTMLButtonElement | null;

  // Form & Action Elements
  private diagUserSelect = document.getElementById('diag-user-select') as HTMLSelectElement | null;
  private diagCustomPassword = document.getElementById('diag-custom-password') as HTMLInputElement | null;
  private btnAutoLogin = document.getElementById('btn-diag-auto-login') as HTMLButtonElement | null;
  private btnResetPassword = document.getElementById('btn-diag-reset-password') as HTMLButtonElement | null;
  private btnGeneratePassword = document.getElementById('btn-diag-gen-password') as HTMLButtonElement | null;
  private btnFlushSession = document.getElementById('btn-diag-flush-session') as HTMLButtonElement | null;
  private btnCheckDb = document.getElementById('btn-diag-check-db') as HTMLButtonElement | null;

  // Feedback Elements
  private diagResultBanner = document.getElementById('diag-result-banner') as HTMLElement | null;
  private diagResultText = document.getElementById('diag-result-text') as HTMLElement | null;
  private diagDbReport = document.getElementById('diag-db-report') as HTMLElement | null;

  constructor(api: DesktopApi) {
    this.api = api;
    this.init();
  }

  private init(): void {
    this.bindEvents();
  }

  private bindEvents(): void {
    const handleOpen = () => this.openModal();
    const handleClose = () => this.closeModal();

    this.btnOpenDiagnostics?.addEventListener('click', handleOpen);
    this.btnHeaderDiagnostics?.addEventListener('click', handleOpen);
    this.btnCloseModal?.addEventListener('click', handleClose);

    this.btnGeneratePassword?.addEventListener('click', () => {
      if (this.diagCustomPassword) {
        this.diagCustomPassword.value = `youmeos-${Math.random().toString(36).substring(2, 8)}`;
      }
    });

    this.btnAutoLogin?.addEventListener('click', () => this.handleAutoLogin());
    this.btnResetPassword?.addEventListener('click', () => this.handleResetPassword());
    this.btnFlushSession?.addEventListener('click', () => this.handleFlushSession());
    this.btnCheckDb?.addEventListener('click', () => this.handleCheckDb());
  }

  async openModal(): Promise<void> {
    if (!this.modalDiagnostics) return;
    this.modalDiagnostics.classList.remove('hidden');
    this.hideBanner();
    await this.loadUsers();
  }

  closeModal(): void {
    if (!this.modalDiagnostics) return;
    this.modalDiagnostics.classList.add('hidden');
  }

  private async loadUsers(): Promise<void> {
    if (!this.api.listUsers || !this.diagUserSelect) return;
    try {
      this.diagUserSelect.innerHTML = '<option value="">Loading users...</option>';
      this.users = await this.api.listUsers();

      if (this.users && this.users.length > 0) {
        this.diagUserSelect.innerHTML = this.users
          .map((u) => `<option value="${u.id}">${u.login} (${u.email || 'No email'}) [ID: ${u.id}]</option>`)
          .join('');
      } else {
        this.diagUserSelect.innerHTML = '<option value="1">admin (Default ID: 1)</option>';
      }
    } catch {
      if (this.diagUserSelect) {
        this.diagUserSelect.innerHTML = '<option value="1">admin (Default ID: 1)</option>';
      }
    }
  }

  private getSelectedUserId(): number {
    if (!this.diagUserSelect || !this.diagUserSelect.value) return 1;
    const parsed = parseInt(this.diagUserSelect.value, 10);
    return isNaN(parsed) ? 1 : parsed;
  }

  private async handleAutoLogin(): Promise<void> {
    if (!this.api.autoLogin) return;
    const userId = this.getSelectedUserId();

    try {
      if (this.btnAutoLogin) this.btnAutoLogin.disabled = true;
      this.showBanner('Generating secure auto-login token...', 'info');

      const result = await this.api.autoLogin(userId, '/wp-admin/');
      if (result.success) {
        this.showBanner(`Auto-login successful for "${result.userLogin}". Portal launched!`, 'success');
        setTimeout(() => this.closeModal(), 1500);
      } else {
        this.showBanner(`Auto-login failed: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (err: any) {
      this.showBanner(`Auto-login failed: ${err?.message || 'Execution error'}`, 'error');
    } finally {
      if (this.btnAutoLogin) this.btnAutoLogin.disabled = false;
    }
  }

  private async handleResetPassword(): Promise<void> {
    if (!this.api.resetPassword) return;
    const userId = this.getSelectedUserId();
    const customPass = this.diagCustomPassword?.value?.trim() || undefined;

    try {
      if (this.btnResetPassword) this.btnResetPassword.disabled = true;
      this.showBanner('Resetting password in database...', 'info');

      const result = await this.api.resetPassword(userId, customPass);
      if (result.success) {
        if (this.diagCustomPassword) this.diagCustomPassword.value = '';
        const msg = `Password for "${result.userLogin}" reset to: <strong>${result.newPassword}</strong> (Copied to clipboard!)`;
        this.showBanner(msg, 'success', true);
        try {
          await navigator.clipboard.writeText(result.newPassword);
        } catch {}
      } else {
        this.showBanner(`Password reset failed: ${result.error || 'Database error'}`, 'error');
      }
    } catch (err: any) {
      this.showBanner(`Password reset error: ${err?.message || 'Execution error'}`, 'error');
    } finally {
      if (this.btnResetPassword) this.btnResetPassword.disabled = false;
    }
  }

  private async handleFlushSession(): Promise<void> {
    if (!this.api.flushSession) return;
    try {
      if (this.btnFlushSession) this.btnFlushSession.disabled = true;
      const success = await this.api.flushSession();
      if (success) {
        this.showBanner('Portal cookies and session cache cleared successfully.', 'success');
      } else {
        this.showBanner('Failed to clear portal session.', 'error');
      }
    } catch (err: any) {
      this.showBanner(`Session flush error: ${err?.message}`, 'error');
    } finally {
      if (this.btnFlushSession) this.btnFlushSession.disabled = false;
    }
  }

  private async handleCheckDb(): Promise<void> {
    if (!this.api.checkDbHealth) return;
    try {
      if (this.btnCheckDb) this.btnCheckDb.disabled = true;
      if (this.diagDbReport) this.diagDbReport.innerHTML = 'Running SQLite integrity verification...';

      const res: DbHealthResult = await this.api.checkDbHealth();
      if (res.status === 'ok') {
        const sizeMb = (res.sizeBytes / 1048576).toFixed(2);
        this.diagDbReport!.innerHTML = `
          <div class="diag-report-ok">
            <div><strong>Integrity:</strong> ${res.integrity}</div>
            <div><strong>Users:</strong> ${res.userCount} registered</div>
            <div><strong>DB Size:</strong> ${sizeMb} MB</div>
          </div>
        `;
      } else {
        this.diagDbReport!.innerHTML = `<div class="diag-report-err">Health check warning: ${res.error || res.integrity}</div>`;
      }
    } catch (err: any) {
      if (this.diagDbReport) this.diagDbReport.innerHTML = `<div class="diag-report-err">Check failed: ${err?.message}</div>`;
    } finally {
      if (this.btnCheckDb) this.btnCheckDb.disabled = false;
    }
  }

  private showBanner(html: string, type: 'info' | 'success' | 'error', isHtml: boolean = false): void {
    if (!this.diagResultBanner || !this.diagResultText) return;
    this.diagResultBanner.className = `diag-result-banner banner-${type}`;
    this.diagResultBanner.classList.remove('hidden');
    if (isHtml) {
      this.diagResultText.innerHTML = html;
    } else {
      this.diagResultText.textContent = html;
    }
  }

  private hideBanner(): void {
    if (!this.diagResultBanner) return;
    this.diagResultBanner.classList.add('hidden');
  }
}
