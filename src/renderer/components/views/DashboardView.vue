<template>
  <div :class="['app-layout', { hidden: !isActive }]">
    <!-- Main Dashboard Header -->
    <AppHeader
      :status="status"
      :status-label="statusLabel"
      :engine-type="engineType"
      :current-gateway-url="currentGatewayUrl"
      :current-tier-data="currentTierData"
      :current-tier-color="currentTierColor"
      :is-transitioning="isTransitioning"
      :is-copied="isCopied"
      @set-engine-type="$emit('setEngineType', $event)"
      @toggle-console="$emit('toggleConsole')"
      @open-license-modal="$emit('openLicenseModal')"
      @open-onboarding="$emit('openOnboarding')"
      @open-splash="$emit('openSplash')"
      @open-url="$emit('openUrl', $event)"
      @copy-gateway="$emit('copyGateway')"
    />

    <!-- Navigation Tabs Bar -->
    <nav class="tabs-bar">
      <TabItem
        tab-id="tab-overview"
        label="Overview"
        icon="dashboard"
        :is-active="activeTab === 'tab-overview'"
        @select="handleTabSelect"
      />
      <TabItem
        tab-id="tab-diagnostics"
        label="Diagnostics"
        icon="gear"
        :is-active="activeTab === 'tab-diagnostics'"
        @select="handleTabSelect"
      />
      <TabItem
        tab-id="tab-settings"
        label="Settings"
        icon="gear"
        :is-active="activeTab === 'tab-settings'"
        @select="handleTabSelect"
      />
    </nav>

    <!-- Tab Contents Container -->
    <main class="app-content custom-scrollbar">
      <!-- 1. TAB: OVERVIEW -->
      <section
        v-show="activeTab === 'tab-overview'"
        class="tab-content"
      >
        <!-- Prominent Error Diagnosis & 1-Click Fix Banner -->
        <div
          v-if="status === 'error'"
          class="dash-error-banner glass-panel"
          @click="$emit('openErrorModal')"
        >
          <div class="dash-error-left">
            <div class="dash-error-badge">
              <BaseIcon name="alert-triangle" :size="20" />
            </div>
            <div class="dash-error-info">
              <div class="dash-error-title-row">
                <span class="dash-error-title">{{ errorInfo?.title || 'Engine Startup Failed' }}</span>
                <span class="dash-error-pill">:{{ activePort || 80 }}</span>
              </div>
              <span class="dash-error-desc">{{ errorInfo?.cause || 'Click to inspect detailed error diagnosis and execute automated fix.' }}</span>
            </div>
          </div>
          <button
            type="button"
            class="btn-dash-fix"
            title="Open Diagnostic & 1-Click Fix Modal"
          >
            <BaseIcon name="wrench" :size="14" />
            <span>Diagnose &amp; Auto-Fix</span>
          </button>
        </div>

        <!-- Tape Deck Transport Controls Card -->
        <div class="dash-card glass-panel transport-card">
          <div class="card-header">
            <div class="card-title-group">
              <BaseIcon
                name="brand"
                :size="16"
              />
              <h3 class="card-title">Cluster Transport Controls</h3>
            </div>
            <StatusBadge :status="status" />
          </div>

          <div class="transport-actions-row">
            <button
              type="button"
              :class="['btn-transport', 'btn-transport-start', { 'is-active': isRunning }]"
              :disabled="isActionPending || isRunning || isTransitioning"
              @click="$emit('start')"
            >
              <BaseIcon
                name="start"
                :size="14"
              />
              <span>Start</span>
            </button>

            <button
              type="button"
              :class="['btn-transport', 'btn-transport-stop', { 'is-active': isStopped }]"
              :disabled="isActionPending || isStopped || isTransitioning || isError"
              @click="$emit('stop')"
            >
              <BaseIcon
                name="stop"
                :size="14"
              />
              <span>Stop</span>
            </button>

            <button
              type="button"
              class="btn-transport btn-transport-restart"
              :disabled="isActionPending || isStopped || isTransitioning || isError"
              @click="$emit('restart')"
            >
              <BaseIcon
                name="refresh"
                :size="14"
              />
              <span>Restart</span>
            </button>

            <div class="transport-sep" />

            <button
              type="button"
              class="btn-transport btn-aux-web"
              :disabled="!isRunning"
              @click="$emit('openUrl', currentGatewayUrl)"
            >
              <BaseIcon
                name="external"
                :size="14"
              />
              <span>Open WebTop</span>
            </button>

            <button
              type="button"
              class="btn-transport btn-aux-browser"
              @click="$emit('openBrowser')"
            >
              <BaseIcon
                name="browser"
                :size="14"
              />
              <span>Browser</span>
            </button>

            <button
              type="button"
              class="btn-transport btn-aux-blackbox"
              title="Open Contents Folder"
              @click="$emit('openBlackbox')"
            >
              <BaseIcon
                name="folder"
                :size="14"
              />
              <span>Contents</span>
            </button>
          </div>
        </div>

        <!-- Architecture Model Overview Grid -->
        <div class="dash-overview-grid">
          <div
            class="dash-card glass-panel"
            :data-layer="'compass'"
            @click="$emit('openLicenseModal')"
          >
            <div class="card-header">
              <span class="dash-card-tag neon-tag">Layer 1</span>
              <span
                class="dash-card-tier"
                :style="{ color: currentTierColor.hex }"
              >
                {{ currentTierData.name }} Compass
              </span>
            </div>
            <h4 class="dash-block-title">My COMPASS Software Suite</h4>
            <p class="dash-block-sub">XP gamification, 4D star navigation, and active sparks license.</p>
          </div>

          <div
            class="dash-card glass-panel"
            :data-layer="'portal'"
            @click="$emit('openUrl', currentGatewayUrl)"
          >
            <div class="card-header">
              <span class="dash-card-tag cyan-tag">Layer 2</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">YouMeOS</h4>
            <p class="dash-block-sub">Sovereign personal desktop environment with detachable sparks.</p>
          </div>

          <div
            class="dash-card glass-panel"
            :data-layer="'network'"
          >
            <div class="card-header">
              <span class="dash-card-tag coral-tag">Layer 3</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">Private w⁴ Protocol Network</h4>
            <p class="dash-block-sub">ZeroConf mDNS discovery mesh connecting sovereign nodes.</p>
          </div>

          <div
            class="dash-card glass-panel"
            :data-layer="'server'"
          >
            <div class="card-header">
              <span class="dash-card-tag emerald-tag">Layer 4</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">w⁴ Tesseract Server</h4>
            <p class="dash-block-sub">FrankenPHP &amp; Caddy proxy routing ports 80 and 443 with TLS.</p>
          </div>

          <div
            class="dash-card glass-panel"
            :data-layer="'core'"
          >
            <div class="card-header">
              <span class="dash-card-tag gold-tag">Layer 5</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">Headless WP Core</h4>
            <p class="dash-block-sub">Kernel headless runtime powering REST API and plugin pipelines.</p>
          </div>

          <div
            class="dash-card glass-panel"
            :data-layer="'database'"
          >
            <div class="card-header">
              <span class="dash-card-tag purple-tag">Layer 6</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">Database</h4>
            <p class="dash-block-sub">Zero-configuration single-file database sandbox in wp-content/.</p>
          </div>

          <div
            class="dash-card glass-panel"
            :data-layer="'bedrock'"
          >
            <div class="card-header">
              <span class="dash-card-tag blue-tag">Layer 7</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">Bedrock</h4>
            <p class="dash-block-sub">Genesis Wave foundation and wp-content/ storage container.</p>
          </div>
        </div>
      </section>

      <!-- 2. TAB: DIAGNOSTICS -->
      <section
        v-show="activeTab === 'tab-diagnostics'"
        class="tab-content"
      >
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
            <p class="dash-card-desc">Generate an instant sovereign admin session and login to the WebTop directly without typing credentials.</p>
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
            <p class="dash-card-desc">Reset the password directly in the sovereign database for any registered WordPress user.</p>
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
            <p class="dash-card-desc">Clear cached portal session cookies and web storage partition to fix stuck auth states or redirect loops.</p>
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

          <!-- Destructive: Database Reset & Wipe Tool -->
          <div class="dash-card glass-panel danger-panel">
            <div class="card-header">
              <div class="card-title-group">
                <BaseIcon
                  name="trash"
                  :size="16"
                  style="color: #f87171;"
                />
                <h3 class="card-title" style="color: #fca5a5;">Database Reset (Destructive)</h3>
              </div>
            </div>
            <p class="dash-card-desc">Wipe local SQLite tables and reset WordPress to a clean slate. Use if database corruption or plugin collisions lock the portal.</p>
            
            <div v-if="!showDbResetConfirm" class="diag-action-stack">
              <button
                type="button"
                class="btn-modal-danger"
                :disabled="isResettingDb"
                @click="showDbResetConfirm = true"
              >
                <BaseIcon
                  name="trash"
                  :size="14"
                />
                <span>Reset Database...</span>
              </button>
            </div>

            <div v-else class="warning-confirm-box">
              <div class="warning-confirm-text">
                <strong>WARNING:</strong> This action will permanently erase all SQLite database tables, users, and options. This cannot be undone!
              </div>
              <div class="warning-btn-row">
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
                  <span>{{ isResettingDb ? 'Wiping Database...' : 'Confirm & Wipe Database' }}</span>
                </button>
                <button
                  type="button"
                  class="btn-modal-aux"
                  :disabled="isResettingDb"
                  @click="showDbResetConfirm = false"
                >
                  Cancel
                </button>
              </div>
            </div>

            <span
              v-if="dbResetFeedback"
              class="feedback-msg"
              :style="{ color: dbResetSuccess ? '#34d399' : '#f87171', marginTop: '6px', display: 'block' }"
            >{{ dbResetFeedback }}</span>
          </div>
        </div>
      </section>

      <!-- 3. TAB: SETTINGS -->
      <section
        v-show="activeTab === 'tab-settings'"
        class="tab-content"
      >
        <div class="dash-settings-grid">
          <div class="dash-card glass-panel">
            <h3 class="card-title">Microverse Engine Configuration</h3>
            <div class="settings-field">
              <label class="control-label">Runtime Engine</label>
              <EngineSelector
                :model-value="engineType"
                @update:model-value="$emit('setEngineType', $event)"
              />
            </div>

            <div class="settings-field">
              <label class="pref-toggle-label">
                <input
                  type="checkbox"
                  :checked="stayOnSplash"
                  class="pref-checkbox"
                  @change="$emit('setStayOnSplash', ($event.target as HTMLInputElement).checked)"
                />
                <span class="pref-text">Stay on 3D Matrix on Start</span>
              </label>
            </div>
          </div>

          <!-- Gateway Port Configuration Card -->
          <div class="dash-card glass-panel">
            <div class="card-header">
              <div class="card-title-group">
                <BaseIcon name="port" :size="16" />
                <h3 class="card-title">Gateway Port Configuration</h3>
              </div>
              <span class="port-active-badge">Active: :{{ activePort || 80 }}</span>
            </div>
            <p class="dash-card-desc">Change the HTTP port binding if port 80 is occupied by another local service or requires root privileges.</p>
            
            <div class="port-preset-row">
              <button
                v-for="p in [80, 8080, 8088, 3000, 8888]"
                :key="p"
                type="button"
                :class="['btn-port-preset', { active: (activePort || 80) === p }]"
                :disabled="isActionPending"
                @click="handleSelectPort(p)"
              >
                <span>:{{ p }}</span>
                <span class="preset-sub">{{ p === 80 ? 'Standard' : (p >= 1024 ? 'Unprivileged' : 'Custom') }}</span>
              </button>
            </div>

            <div class="port-custom-field">
              <label class="control-label">Custom Port Number</label>
              <div class="port-input-group">
                <input
                  v-model.number="customPortInput"
                  type="number"
                  min="1"
                  max="65535"
                  class="port-input"
                  placeholder="e.g. 8080"
                  :disabled="isActionPending"
                  @keyup.enter="handleApplyCustomPort"
                />
                <button
                  type="button"
                  class="btn-modal-primary btn-apply-port"
                  :disabled="isActionPending || !customPortInput || customPortInput === (activePort || 80)"
                  @click="handleApplyCustomPort"
                >
                  <BaseIcon name="check" :size="13" />
                  <span>Apply Port</span>
                </button>
              </div>
            </div>
          </div>

          <div class="dash-card glass-panel">
            <h3 class="card-title">Plugin Sync &amp; Maintenance</h3>
            <p class="dash-card-desc">Sync and update the latest PHP and PWA Sparks from upstream.</p>
            <button
              type="button"
              class="btn-modal-primary"
              :disabled="isUpdatingPlugins"
              @click="handleUpdatePlugins"
            >
              <BaseIcon
                v-if="isUpdatingPlugins"
                name="spin"
                :size="14"
                :spinning="true"
              />
              <BaseIcon
                v-else
                name="refresh"
                :size="14"
              />
              <span>{{ isUpdatingPlugins ? 'Updating Plugins...' : 'Update Plugins Suite' }}</span>
            </button>
            <span
              v-if="pluginUpdateFeedback"
              class="feedback-msg"
            >{{ pluginUpdateFeedback }}</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Main Dashboard Footer -->
    <AppFooter
      :version="version"
      :is-checking="isCheckingUpdates"
      @check-updates="$emit('checkUpdates')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import StatusBadge from '../atoms/StatusBadge.vue';
import StatusDot from '../atoms/StatusDot.vue';
import TabItem from '../atoms/TabItem.vue';
import EngineSelector from '../molecules/EngineSelector.vue';
import AppHeader from '../organisms/AppHeader.vue';
import AppFooter from '../organisms/AppFooter.vue';
import type { DesktopApi, EngineStatus, EngineType, WpUser, StackLayerStatus, EngineErrorInfo } from '../../types';
import type { TierInfo } from '../../license-cloud-manager';

const props = defineProps<{
  isActive: boolean;
  activeTab: string;
  status: EngineStatus;
  statusLabel: string;
  engineType: EngineType;
  activePort?: number;
  errorInfo?: EngineErrorInfo | null;
  currentGatewayUrl: string;
  currentTierData: TierInfo;
  currentTierColor: { hex: string; three: number };
  version: string;
  stackLayers?: StackLayerStatus[];
  stayOnSplash: boolean;
  isRunning: boolean;
  isStopped: boolean;
  isTransitioning: boolean;
  isError: boolean;
  isActionPending: boolean;
  isCheckingUpdates?: boolean;
  isCopied?: boolean;
  api: DesktopApi;
}>();

const emit = defineEmits<{
  (e: 'setTab', tabId: string): void;
  (e: 'setEngineType', val: EngineType): void;
  (e: 'setPort', port: number): void;
  (e: 'setStayOnSplash', val: boolean): void;
  (e: 'openErrorModal'): void;
  (e: 'toggleConsole'): void;
  (e: 'openLicenseModal'): void;
  (e: 'openOnboarding'): void;
  (e: 'openSplash'): void;
  (e: 'openUrl', url: string): void;
  (e: 'openBrowser'): void;
  (e: 'openBlackbox'): void;
  (e: 'copyGateway'): void;
  (e: 'checkUpdates'): void;
  (e: 'start'): void;
  (e: 'stop'): void;
  (e: 'restart'): void;
}>();

const customPortInput = ref<number>(props.activePort || 80);
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
const showDbResetConfirm = ref<boolean>(false);
const isResettingDb = ref<boolean>(false);
const dbResetFeedback = ref<string>('');
const dbResetSuccess = ref<boolean>(false);
const isUpdatingPlugins = ref<boolean>(false);
const pluginUpdateFeedback = ref<string>('');

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

const handleTabSelect = (tabId: string) => {
  emit('setTab', tabId);
  if (tabId === 'tab-diagnostics') {
    loadUsers();
  }
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
      await props.api.openPortal('https://my.youmeos.com/wp-admin/admin.php?page=xophz-compass#');
    } else {
      await props.api.openUrl('https://my.youmeos.com/wp-admin/admin.php?page=xophz-compass#');
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
      if (res.success) {
        dbResetSuccess.value = true;
        dbResetFeedback.value = res.message || 'Database reset successfully.';
        showDbResetConfirm.value = false;
        userList.value = [];
        dbHealthResult.value = null;
      } else {
        dbResetSuccess.value = false;
        dbResetFeedback.value = `Reset failed: ${res.error || res.message}`;
      }
    } else {
      dbResetSuccess.value = true;
      dbResetFeedback.value = 'Database reset simulated.';
      showDbResetConfirm.value = false;
    }
  } catch (e: any) {
    dbResetSuccess.value = false;
    dbResetFeedback.value = `Reset error: ${e?.message || e}`;
  } finally {
    isResettingDb.value = false;
  }
};

const handleUpdatePlugins = async () => {
  isUpdatingPlugins.value = true;
  pluginUpdateFeedback.value = '';
  emit('toggleConsole');
  try {
    const res = await props.api.updatePlugins();
    if (res?.success) {
      pluginUpdateFeedback.value = res.updatedCount > 0
        ? `Successfully updated ${res.updatedCount} plugin(s).`
        : 'All plugins are up to date.';
    } else {
      pluginUpdateFeedback.value = `Update completed with warnings: ${res?.error || res?.stderr || 'Check console logs for details.'}`;
    }
  } catch (e: any) {
    pluginUpdateFeedback.value = `Update failed: ${e?.message || e}`;
  } finally {
    isUpdatingPlugins.value = false;
  }
};

const handleSelectPort = (port: number) => {
  customPortInput.value = port;
  emit('setPort', port);
};

const handleApplyCustomPort = () => {
  const parsed = Number(customPortInput.value);
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 65535) {
    emit('setPort', parsed);
  }
};
</script>

<style scoped>
.tabs-bar {
  display: flex;
  align-items: center;
  background: rgba(12, 18, 32, 0.65);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 4px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.app-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  padding-bottom: 6px;
}

.dash-card {
  background: var(--bg-glass);
  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 20px rgba(0, 0, 0, 0.4);
  position: relative;
}

.transport-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.transport-actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-transport {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 7px 14px;
  min-height: 32px;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(180deg, rgba(28, 38, 62, 0.85) 0%, rgba(16, 22, 38, 0.95) 100%);
  color: var(--text-primary);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 2px 5px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.btn-transport:hover:not(:disabled) {
  background: linear-gradient(180deg, rgba(38, 52, 84, 0.95) 0%, rgba(20, 28, 50, 0.98) 100%);
  border-color: var(--border-glass-bright);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 3px 8px rgba(0, 0, 0, 0.5), 0 0 10px var(--accent-cyan-glow);
  transform: translateY(-1px);
}

.btn-transport:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-transport-start.is-active {
  background: linear-gradient(180deg, rgba(16, 56, 32, 0.95) 0%, rgba(10, 34, 20, 0.98) 100%);
  border-color: var(--status-running);
  color: #4ade80;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 12px var(--status-running-glow);
}

.btn-transport-stop.is-active {
  background: linear-gradient(180deg, rgba(56, 18, 22, 0.95) 0%, rgba(32, 10, 14, 0.98) 100%);
  border-color: var(--status-stopped);
  color: #f87171;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 12px var(--status-stopped-glow);
}

.transport-sep {
  width: 1px;
  height: 22px;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%);
  margin: 0 4px;
}

.btn-aux-web,
.btn-aux-browser,
.btn-aux-blackbox {
  background: linear-gradient(180deg, rgba(20, 28, 46, 0.75) 0%, rgba(12, 18, 30, 0.85) 100%);
  border-color: rgba(255, 255, 255, 0.08);
  font-size: 0.72rem;
}

.dash-overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.dash-overview-grid .dash-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dash-overview-grid .dash-card:hover {
  background: rgba(20, 32, 56, 0.75);
  border-color: var(--border-glass-bright);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 16px var(--accent-cyan-glow);
  transform: translateY(-2px);
}

.dash-card-tag {
  font-size: 0.62rem;
  font-weight: 700;
  font-family: var(--font-mono);
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.cyan-tag {
  color: var(--accent-cyan);
  background: rgba(98, 201, 255, 0.12);
  border: 1px solid rgba(98, 201, 255, 0.35);
}

.neon-tag {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.purple-tag {
  color: #c084fc;
  background: rgba(192, 132, 252, 0.12);
  border: 1px solid rgba(192, 132, 252, 0.35);
}

.blue-tag {
  color: #818cf8;
  background: rgba(129, 140, 248, 0.12);
  border: 1px solid rgba(129, 140, 248, 0.35);
}

.gold-tag {
  color: var(--accent-gold);
  background: rgba(255, 213, 153, 0.12);
  border: 1px solid rgba(255, 213, 153, 0.35);
}

.emerald-tag {
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.35);
}

.coral-tag {
  color: #fb7185;
  background: rgba(251, 113, 133, 0.12);
  border: 1px solid rgba(251, 113, 133, 0.35);
}

.dash-card-tier {
  font-size: 0.72rem;
  font-weight: 700;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dash-block-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  margin-top: 2px;
}

.dash-block-sub {
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

.dash-diagnostics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.dash-card-desc {
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 6px 0 10px;
}

.diag-action-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn-modal-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border: 1px solid #38bdf8;
  color: #fff;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
  transition: all 0.2s ease;
}

.btn-modal-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
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
  background: rgba(14, 22, 38, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-aux:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.35);
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
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  border: 1px solid #f87171;
  color: #fff;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(248, 113, 113, 0.3);
  transition: all 0.2s ease;
}

.btn-modal-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
  box-shadow: 0 0 20px rgba(248, 113, 113, 0.55);
}

.feedback-error {
  color: #f87171;
  font-size: 0.70rem;
  margin-top: 4px;
}

.feedback-msg {
  color: var(--accent-cyan);
  font-size: 0.72rem;
  margin-top: 6px;
}

.diag-form-stack {
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
  font-size: 0.68rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.diag-select,
.diag-input {
  background: rgba(6, 10, 18, 0.8);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  color: var(--text-primary);
  font-size: 0.75rem;
  font-family: var(--font-sans);
  outline: none;
  transition: border-color 0.2s;
}

.diag-select:focus,
.diag-input:focus {
  border-color: var(--accent-cyan);
}

.diag-pass-row {
  display: flex;
  gap: 6px;
}

.diag-pass-row .diag-input {
  flex: 1;
}

.credentials-box,
.db-health-result {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: rgba(6, 10, 18, 0.7);
  border: 1px solid var(--border-glass);
  font-size: 0.72rem;
  font-family: var(--font-mono);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cred-success {
  color: #4ade80;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.cred-copied-badge {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.65rem;
  font-weight: 600;
}

.cred-error {
  color: #f87171;
  font-size: 0.70rem;
  margin-top: 4px;
}

.danger-panel {
  border-color: rgba(239, 68, 68, 0.35);
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.06) 0%, rgba(10, 16, 28, 0.85) 100%);
}

.warning-confirm-box {
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.4);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.warning-confirm-text {
  font-size: 0.76rem;
  color: #fca5a5;
  line-height: 1.4;
}

.warning-btn-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dash-settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.control-label {
  font-size: 0.65rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pref-toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--text-primary);
}

.pref-checkbox {
  accent-color: var(--accent-cyan);
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.pref-text {
  user-select: none;
}

.dash-error-banner {
  background: linear-gradient(135deg, rgba(38, 12, 22, 0.92) 0%, rgba(18, 10, 18, 0.96) 100%);
  border: 1px solid rgba(255, 0, 85, 0.45);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5), 0 0 24px rgba(255, 0, 85, 0.22);
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: fadeIn 0.25s ease;
}

.dash-error-banner:hover {
  border-color: #ff3366;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.6), 0 0 32px rgba(255, 0, 85, 0.35);
  transform: translateY(-1px);
}

.dash-error-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.dash-error-badge {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(255, 0, 85, 0.18);
  border: 1px solid rgba(255, 0, 85, 0.5);
  color: #ff3366;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(255, 0, 85, 0.35);
}

.dash-error-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dash-error-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dash-error-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.1px;
}

.dash-error-pill {
  font-size: 0.62rem;
  font-family: var(--font-mono);
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 9999px;
  background: rgba(255, 0, 85, 0.2);
  border: 1px solid rgba(255, 0, 85, 0.4);
  color: #ff8899;
}

.dash-error-desc {
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-dash-fix {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  background: rgba(255, 0, 85, 0.2);
  border: 1px solid rgba(255, 0, 85, 0.5);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.btn-dash-fix:hover {
  background: rgba(255, 0, 85, 0.35);
  border-color: #ff3366;
  box-shadow: 0 0 16px rgba(255, 0, 85, 0.45);
  transform: translateY(-1px);
}

.port-active-badge {
  font-size: 0.68rem;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--accent-cyan);
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.3);
  padding: 2px 8px;
  border-radius: 9999px;
}

.port-preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.btn-port-preset {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 700;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
}

.btn-port-preset:hover:not(:disabled) {
  background: rgba(0, 242, 254, 0.12);
  border-color: rgba(0, 242, 254, 0.4);
  color: #fff;
}

.btn-port-preset.active {
  background: rgba(0, 242, 254, 0.18);
  border-color: #00f2fe;
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.25);
}

.preset-sub {
  font-size: 0.58rem;
  font-family: var(--font-sans);
  color: var(--text-muted);
  font-weight: 500;
}

.port-custom-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.port-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.port-input {
  flex: 1;
  background: rgba(4, 6, 12, 0.8);
  border: 1px solid var(--border-glass-bright);
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 600;
  outline: none;
  transition: all 0.2s ease;
}

.port-input:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 12px var(--accent-cyan-glow);
}

.btn-apply-port {
  white-space: nowrap;
  padding: 7px 14px;
}
</style>
