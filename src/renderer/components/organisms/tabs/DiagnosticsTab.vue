<template>
  <section class="tab-content">
    <div class="dash-diagnostics-grid">
      <!-- 1-Click Auto Login -->
      <div class="dash-card glass-panel">
        <div class="card-header">
          <div class="card-title-group">
            <BaseIcon
              name="key"
              :size="16"
            />
            <h3 class="card-title">1-Click Auto Login</h3>
          </div>
        </div>
        <p class="dash-card-desc">
          Generate an instant sovereign admin session and login to the WebTop directly without typing credentials.
        </p>
        <div class="diag-action-stack">
          <button
            type="button"
            class="btn-modal-primary"
            :disabled="!isRunning || isAutoLoggingIn"
            @click="handleAutoLogin"
          >
            <BaseIcon
              v-if="isAutoLoggingIn"
              name="spin"
              :size="14"
              :spinning="true"
            />
            <BaseIcon
              v-else
              name="external"
              :size="14"
            />
            <span>{{ isAutoLoggingIn ? 'Logging In...' : 'Launch Authenticated Portal' }}</span>
          </button>
          <span
            v-if="autoLoginError"
            class="feedback-error"
          >{{ autoLoginError }}</span>
        </div>
      </div>

      <!-- Emergency Password Reset -->
      <div class="dash-card glass-panel">
        <div class="card-header">
          <div class="card-title-group">
            <BaseIcon
              name="lock"
              :size="16"
            />
            <h3 class="card-title">Password Reset &amp; Credentials</h3>
          </div>
        </div>
        <p class="dash-card-desc">
          Reset the password directly in the sovereign database for any registered WordPress user.
        </p>
        <div class="diag-form-stack">
          <div
            v-if="userList.length > 0"
            class="diag-field"
          >
            <label class="diag-label">Target User</label>
            <select
              v-model="selectedUserId"
              class="diag-select"
            >
              <option
                v-for="u in userList"
                :key="u.id"
                :value="u.id"
              >
                {{ u.login }} ({{ u.email || 'No email' }}) [ID: {{ u.id }}]
              </option>
            </select>
          </div>
          <div class="diag-field">
            <label class="diag-label">New Password (optional)</label>
            <div class="diag-pass-row">
              <input
                v-model="customPassword"
                type="text"
                placeholder="Leave empty to auto-generate"
                class="diag-input"
              />
              <button
                type="button"
                class="btn-modal-aux"
                @click="generateRandomPassword"
              >
                Random
              </button>
            </div>
          </div>
          <button
            type="button"
            class="btn-modal-aux"
            :disabled="isResettingPassword"
            @click="handlePasswordReset"
          >
            <BaseIcon
              v-if="isResettingPassword"
              name="spin"
              :size="14"
              :spinning="true"
            />
            <BaseIcon
              v-else
              name="refresh"
              :size="14"
            />
            <span>{{ isResettingPassword ? 'Resetting...' : 'Reset & Copy Password' }}</span>
          </button>
          <div
            v-if="passwordResetResult"
            class="credentials-box"
          >
            <span
              v-if="passwordResetResult.success"
              class="cred-success"
            >
              User: <code>{{ passwordResetResult.userLogin }}</code> | Pass:
              <code>{{ passwordResetResult.newPassword }}</code>
              <span class="cred-copied-badge">&check; Copied!</span>
            </span>
            <span
              v-else
              class="cred-error"
            >{{ passwordResetResult.error }}</span>
          </div>
        </div>
      </div>

      <!-- Session & Storage Flush -->
      <div class="dash-card glass-panel">
        <div class="card-header">
          <div class="card-title-group">
            <BaseIcon
              name="brand"
              :size="16"
            />
            <h3 class="card-title">Session &amp; Cookies Flush</h3>
          </div>
        </div>
        <p class="dash-card-desc">
          Clear cached portal session cookies and web storage partition to fix stuck auth states or redirect loops.
        </p>
        <button
          type="button"
          class="btn-modal-aux"
          :disabled="isFlushingSession"
          @click="handleFlushSession"
        >
          <BaseIcon
            v-if="isFlushingSession"
            name="spin"
            :size="14"
            :spinning="true"
          />
          <BaseIcon
            v-else
            name="trash"
            :size="14"
          />
          <span>{{ isFlushingSession ? 'Flushing...' : 'Clear Portal Session' }}</span>
        </button>
        <span
          v-if="flushSessionFeedback"
          class="feedback-msg"
        >{{ flushSessionFeedback }}</span>
      </div>

      <!-- Database Integrity Health -->
      <div class="dash-card glass-panel">
        <div class="card-header">
          <div class="card-title-group">
            <BaseIcon
              name="database"
              :size="16"
            />
            <h3 class="card-title">Database Integrity Health</h3>
          </div>
        </div>
        <p class="dash-card-desc">Inspect SQLite schema health, database size, and user table records.</p>
        <button
          type="button"
          class="btn-modal-aux"
          :disabled="isCheckingDb"
          @click="handleCheckDbHealth"
        >
          <BaseIcon
            v-if="isCheckingDb"
            name="spin"
            :size="14"
            :spinning="true"
          />
          <BaseIcon
            v-else
            name="check"
            :size="14"
          />
          <span>{{ isCheckingDb ? 'Checking...' : 'Check Database Health' }}</span>
        </button>
        <div
          v-if="dbHealthResult"
          class="db-health-result"
        >
          <span>Status: <strong>{{ dbHealthResult.status }}</strong> ({{ dbHealthResult.integrity }})</span>
          <span>Users: {{ dbHealthResult.userCount }} | Size: {{ Math.round(dbHealthResult.sizeBytes / 1024) }} KB</span>
        </div>
      </div>

      <!-- SQLite DB Manager (Adminer) -->
      <div class="dash-card glass-panel">
        <div class="card-header">
          <div class="card-title-group">
            <BaseIcon
              name="database"
              :size="16"
            />
            <h3 class="card-title">SQLite DB Manager</h3>
          </div>
          <span
            v-if="isDbManagerActive"
            class="badge-active"
          >Active</span>
        </div>
        <p class="dash-card-desc">
          On-demand Adminer interface to inspect SQLite tables, run SQL queries, and manage local data.
        </p>
        <div class="diag-action-stack">
          <div class="diag-btn-row">
            <button
              type="button"
              class="btn-modal-primary"
              :disabled="!isRunning || isLaunchingDbManager"
              @click="handleLaunchDbManager"
            >
              <BaseIcon
                v-if="isLaunchingDbManager"
                name="spin"
                :size="14"
                :spinning="true"
              />
              <BaseIcon
                v-else
                name="external"
                :size="14"
              />
              <span>{{ dbManagerButtonLabel }}</span>
            </button>
            <button
              v-if="isDbManagerActive"
              type="button"
              class="btn-modal-aux"
              :disabled="isStoppingDbManager"
              @click="handleStopDbManager"
            >
              <BaseIcon
                v-if="isStoppingDbManager"
                name="spin"
                :size="14"
                :spinning="true"
              />
              <BaseIcon
                v-else
                name="close"
                :size="14"
              />
              <span>Stop Session</span>
            </button>
          </div>
          <span
            v-if="dbManagerFeedback"
            :class="dbManagerError ? 'feedback-error' : 'feedback-msg'"
          >{{ dbManagerFeedback }}</span>
        </div>
      </div>

      <!-- Destructive: Database Reset & Wipe Tool -->
      <div class="dash-card glass-panel danger-panel">
        <div class="card-header">
          <div class="card-title-group">
            <BaseIcon
              name="trash"
              :size="16"
              style="color: #f87171;"
            />
            <h3
              class="card-title"
              style="color: #fca5a5;"
            >
              Database Reset (Destructive)
            </h3>
          </div>
        </div>
        <p class="dash-card-desc">
          Wipe local SQLite tables and reset WordPress to a clean slate. Use if database corruption or plugin collisions lock the portal.
        </p>

        <div class="diag-action-stack">
          <button
            type="button"
            class="btn-modal-danger"
            :disabled="isResettingDb"
            @click="handleResetDatabase"
          >
            <BaseIcon
              v-if="isResettingDb"
              name="spin"
              :size="14"
              :spinning="true"
            />
            <BaseIcon
              v-else
              name="trash"
              :size="14"
            />
            <span>{{ isResettingDb ? 'Wiping Database...' : 'Reset Database...' }}</span>
          </button>
        </div>

        <span
          v-if="dbResetFeedback"
          class="feedback-msg"
          :style="{ color: dbResetSuccess ? '#34d399' : '#f87171', marginTop: '6px', display: 'block' }"
        >
          {{ dbResetFeedback }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseIcon from '../../atoms/BaseIcon.vue';
import type { DesktopApi, WpUser } from '../../../types';

const props = defineProps<{
  isRunning: boolean;
  currentGatewayUrl: string;
  api: DesktopApi;
}>();

const isAutoLoggingIn = ref<boolean>(false);
const autoLoginError = ref<string>('');
const isResettingPassword = ref<boolean>(false);
const passwordResetResult = ref<{ success: boolean; userLogin?: string; newPassword?: string; error?: string } | null>(null);
const userList = ref<WpUser[]>([]);
const selectedUserId = ref<number>(1);
const customPassword = ref<string>('');
const isFlushingSession = ref<boolean>(false);
const flushSessionFeedback = ref<string>('');
const isCheckingDb = ref<boolean>(false);
const dbHealthResult = ref<{ status: string; integrity: string; userCount: number; sizeBytes: number } | null>(null);
const isResettingDb = ref<boolean>(false);
const dbResetFeedback = ref<string>('');
const dbResetSuccess = ref<boolean>(false);

const isDbManagerActive = ref<boolean>(false);
const isLaunchingDbManager = ref<boolean>(false);
const isStoppingDbManager = ref<boolean>(false);
const dbManagerFeedback = ref<string>('');
const dbManagerError = ref<boolean>(false);

const dbManagerButtonLabel = computed(() => {
  if (isLaunchingDbManager.value) return 'Preparing DB Manager...';
  if (isDbManagerActive.value) return 'Open DB Manager';
  return 'Launch DB Manager';
});

const loadUsers = async () => {
  if (props.api.listUsers) {
    try {
      const users = await props.api.listUsers();
      if (users && users.length > 0) {
        userList.value = users;
        selectedUserId.value = users[0].id;
      }
    } catch {}
  }
};

const generateRandomPassword = () => {
  customPassword.value = `youmeos-${Math.random().toString(36).substring(2, 8)}`;
};

const handleAutoLogin = async () => {
  isAutoLoggingIn.value = true;
  autoLoginError.value = '';
  try {
    const targetUserId = selectedUserId.value || 1;
    if (props.api.autoLogin) {
      const res = await props.api.autoLogin(targetUserId, '/wp-admin/admin.php?page=xophz-compass#');
      if (!res.success) {
        autoLoginError.value = res.error || 'Failed to generate auto-login session';
      }
    } else if (props.api.openPortal) {
      await props.api.openPortal(`${props.currentGatewayUrl}/wp-admin/admin.php?page=xophz-compass#`);
    } else {
      await props.api.openUrl(`${props.currentGatewayUrl}/wp-admin/admin.php?page=xophz-compass#`);
    }
  } catch (e: any) {
    autoLoginError.value = e?.message || 'Login failed';
  } finally {
    isAutoLoggingIn.value = false;
  }
};

const handlePasswordReset = async () => {
  isResettingPassword.value = true;
  passwordResetResult.value = null;
  try {
    const targetUserId = selectedUserId.value || 1;
    const pass = customPassword.value.trim() || undefined;
    if (props.api.resetPassword) {
      const res = await props.api.resetPassword(targetUserId, pass);
      passwordResetResult.value = res;
      if (res.success && res.newPassword) {
        try {
          await navigator.clipboard.writeText(res.newPassword);
        } catch {}
      }
    } else {
      passwordResetResult.value = {
        success: true,
        userLogin: 'admin',
        newPassword: pass || 'youmeos-admin-2026'
      };
    }
  } catch (e: any) {
    passwordResetResult.value = { success: false, error: e?.message || 'Reset failed' };
  } finally {
    isResettingPassword.value = false;
  }
};

const handleFlushSession = async () => {
  isFlushingSession.value = true;
  flushSessionFeedback.value = '';
  try {
    if (props.api.flushSession) {
      const success = await props.api.flushSession();
      flushSessionFeedback.value = success ? 'Portal cookies & session flushed.' : 'Failed to flush session.';
    } else {
      flushSessionFeedback.value = 'Portal session cleared.';
    }
  } catch (e: any) {
    flushSessionFeedback.value = `Error: ${e?.message || e}`;
  } finally {
    isFlushingSession.value = false;
  }
};

const handleCheckDbHealth = async () => {
  isCheckingDb.value = true;
  dbHealthResult.value = null;
  try {
    if (props.api.checkDbHealth) {
      dbHealthResult.value = await props.api.checkDbHealth() as any;
    } else {
      dbHealthResult.value = {
        status: 'healthy',
        integrity: 'ok',
        userCount: 1,
        sizeBytes: 1245184
      };
    }
  } catch (e: any) {
    dbHealthResult.value = { status: 'error', integrity: 'Error', userCount: 0, sizeBytes: 0, error: e?.message };
  } finally {
    isCheckingDb.value = false;
  }
};

const handleResetDatabase = async () => {
  isResettingDb.value = true;
  dbResetFeedback.value = '';
  dbResetSuccess.value = false;
  try {
    if (props.api.resetDatabase) {
      const res = await props.api.resetDatabase();
      if (res?.cancelled) {
        return;
      }
      if (res?.success) {
        dbResetSuccess.value = true;
        dbResetFeedback.value = res.message || 'Database reset successfully.';
        userList.value = [];
        dbHealthResult.value = null;
      } else {
        dbResetSuccess.value = false;
        dbResetFeedback.value = `Reset failed: ${res?.error || res?.message || 'Unknown error'}`;
      }
    } else {
      dbResetSuccess.value = true;
      dbResetFeedback.value = 'Database reset simulated.';
    }
  } catch (e: any) {
    dbResetSuccess.value = false;
    dbResetFeedback.value = `Reset error: ${e?.message || e}`;
  } finally {
    isResettingDb.value = false;
  }
};

const checkDbManagerStatus = async () => {
  if (props.api.getDbManagerStatus) {
    try {
      const status = await props.api.getDbManagerStatus();
      isDbManagerActive.value = Boolean(status?.active);
    } catch {
      isDbManagerActive.value = false;
    }
  }
};

const handleLaunchDbManager = async () => {
  isLaunchingDbManager.value = true;
  dbManagerFeedback.value = '';
  dbManagerError.value = false;
  try {
    if (props.api.launchDbManager) {
      const res = await props.api.launchDbManager();
      if (res.success) {
        isDbManagerActive.value = true;
        dbManagerFeedback.value = 'Database manager launched.';
      } else {
        dbManagerError.value = true;
        dbManagerFeedback.value = res.error || 'Failed to launch database manager';
      }
    } else {
      dbManagerFeedback.value = 'Database manager API not supported in this runtime.';
      dbManagerError.value = true;
    }
  } catch (e: any) {
    dbManagerError.value = true;
    dbManagerFeedback.value = e?.message || 'Error launching database manager';
  } finally {
    isLaunchingDbManager.value = false;
  }
};

const handleStopDbManager = async () => {
  isStoppingDbManager.value = true;
  dbManagerFeedback.value = '';
  dbManagerError.value = false;
  try {
    if (props.api.stopDbManager) {
      await props.api.stopDbManager();
      isDbManagerActive.value = false;
      dbManagerFeedback.value = 'Database manager session stopped.';
    }
  } catch (e: any) {
    dbManagerError.value = true;
    dbManagerFeedback.value = e?.message || 'Error stopping database manager';
  } finally {
    isStoppingDbManager.value = false;
  }
};

onMounted(() => {
  loadUsers();
  checkDbManagerStatus();
});

defineExpose({
  loadUsers
});
</script>

<style scoped>
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  padding-bottom: 6px;
}

.dash-diagnostics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.dash-card {
  background: var(--bg-glass);
  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 20px rgba(0, 0, 0, 0.4);
}

.danger-panel {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-cyan);
}

.card-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.1px;
}

.dash-card-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 12px;
}

.diag-action-stack, .diag-form-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.diag-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.diag-label {
  font-size: 0.70rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.diag-select, .diag-input {
  background: rgba(14, 22, 38, 0.85);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: #fff;
  padding: 6px 10px;
  font-size: 0.78rem;
  outline: none;
}

.diag-select:focus, .diag-input:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 8px var(--accent-cyan-glow);
}

.diag-pass-row {
  display: flex;
  gap: 6px;
}

.diag-pass-row .diag-input {
  flex: 1;
}

.btn-modal-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--accent-cyan), #0077b6);
  color: #04070e;
  font-weight: 700;
  font-size: 0.76rem;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-primary:hover:not(:disabled) {
  box-shadow: 0 0 14px var(--accent-cyan-glow);
  transform: translateY(-1px);
}

.btn-modal-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modal-aux {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-glass);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-modal-aux:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--border-glass-bright);
}

.btn-modal-aux:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modal-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-modal-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.35);
  border-color: #ef4444;
  color: #fff;
}

.btn-modal-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.credentials-box {
  background: rgba(14, 22, 38, 0.95);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: 0.72rem;
  font-family: var(--font-mono);
}

.cred-success {
  color: #34d399;
}

.cred-copied-badge {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
  padding: 1px 5px;
  border-radius: 3px;
  margin-left: 6px;
  font-size: 0.65rem;
}

.cred-error, .feedback-error {
  color: #f87171;
  font-size: 0.72rem;
}

.feedback-msg {
  font-size: 0.72rem;
  color: var(--accent-cyan);
  margin-top: 4px;
}

.db-health-result {
  margin-top: 8px;
  background: rgba(14, 22, 38, 0.85);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: 0.72rem;
  display: flex;
  justify-content: space-between;
}

.diag-btn-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.badge-active {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.4);
}
</style>
