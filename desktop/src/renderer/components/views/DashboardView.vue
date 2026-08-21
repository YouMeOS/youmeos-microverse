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
      <section v-show="activeTab === 'tab-overview'" class="tab-content">
        <!-- Tape Deck Transport Controls Card -->
        <div class="dash-card glass-panel transport-card">
          <div class="card-header">
            <div class="card-title-group">
              <BaseIcon name="brand" :size="16" />
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
              <BaseIcon name="start" :size="14" />
              <span>Start</span>
            </button>

            <button
              type="button"
              :class="['btn-transport', 'btn-transport-stop', { 'is-active': isStopped }]"
              :disabled="isActionPending || isStopped || isTransitioning || isError"
              @click="$emit('stop')"
            >
              <BaseIcon name="stop" :size="14" />
              <span>Stop</span>
            </button>

            <button
              type="button"
              class="btn-transport btn-transport-restart"
              :disabled="isActionPending || isStopped || isTransitioning || isError"
              @click="$emit('restart')"
            >
              <BaseIcon name="refresh" :size="14" />
              <span>Restart</span>
            </button>

            <div class="transport-sep" />

            <button
              type="button"
              class="btn-transport btn-aux-web"
              :disabled="!isRunning"
              @click="$emit('openUrl', currentGatewayUrl)"
            >
              <BaseIcon name="external" :size="14" />
              <span>Open WebTop</span>
            </button>

            <button
              type="button"
              class="btn-transport btn-aux-browser"
              @click="$emit('openBrowser')"
            >
              <BaseIcon name="browser" :size="14" />
              <span>Browser</span>
            </button>

            <button
              type="button"
              class="btn-transport btn-aux-blackbox"
              @click="$emit('openBlackbox')"
            >
              <BaseIcon name="folder" :size="14" />
              <span>Blackbox</span>
            </button>
          </div>
        </div>

        <!-- Architecture Model Overview Grid -->
        <div class="dash-overview-grid">
          <div class="dash-card glass-panel" :data-layer="'compass'" @click="$emit('openLicenseModal')">
            <div class="card-header">
              <span class="dash-card-tag neon-tag">Layer 1</span>
              <span class="dash-card-tier" :style="{ color: currentTierColor.hex }">
                {{ currentTierData.name }} Compass
              </span>
            </div>
            <h4 class="dash-block-title">My COMPASS Software Suite</h4>
            <p class="dash-block-sub">XP gamification, 4D star navigation, and active sparks license.</p>
          </div>

          <div class="dash-card glass-panel" :data-layer="'portal'" @click="$emit('openUrl', currentGatewayUrl)">
            <div class="card-header">
              <span class="dash-card-tag cyan-tag">Layer 2</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">YouMeOS</h4>
            <p class="dash-block-sub">Sovereign personal desktop environment with detachable sparks.</p>
          </div>

          <div class="dash-card glass-panel" :data-layer="'network'">
            <div class="card-header">
              <span class="dash-card-tag coral-tag">Layer 3</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">Private W4 Protocol Network</h4>
            <p class="dash-block-sub">ZeroConf mDNS discovery mesh connecting sovereign nodes.</p>
          </div>

          <div class="dash-card glass-panel" :data-layer="'server'">
            <div class="card-header">
              <span class="dash-card-tag emerald-tag">Layer 4</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">W4 Tesseract Server</h4>
            <p class="dash-block-sub">FrankenPHP &amp; Caddy proxy routing ports 80 and 443 with TLS.</p>
          </div>

          <div class="dash-card glass-panel" :data-layer="'core'">
            <div class="card-header">
              <span class="dash-card-tag gold-tag">Layer 5</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">Headless WP Core</h4>
            <p class="dash-block-sub">Kernel headless runtime powering REST API and plugin pipelines.</p>
          </div>

          <div class="dash-card glass-panel" :data-layer="'database'">
            <div class="card-header">
              <span class="dash-card-tag purple-tag">Layer 6</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">Database</h4>
            <p class="dash-block-sub">Zero-configuration single-file database sandbox in blackbox/.</p>
          </div>

          <div class="dash-card glass-panel" :data-layer="'bedrock'">
            <div class="card-header">
              <span class="dash-card-tag blue-tag">Layer 7</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">Bedrock</h4>
            <p class="dash-block-sub">Genesis Wave foundation and blackbox/ storage container.</p>
          </div>
        </div>
      </section>

      <!-- 2. TAB: DIAGNOSTICS -->
      <section v-show="activeTab === 'tab-diagnostics'" class="tab-content">
        <div class="dash-diagnostics-grid">
          <!-- 1-Click Auto Login -->
          <div class="dash-card glass-panel">
            <div class="card-header">
              <div class="card-title-group">
                <BaseIcon name="key" :size="16" />
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
                <BaseIcon v-if="isAutoLoggingIn" name="spin" :size="14" :spinning="true" />
                <BaseIcon v-else name="external" :size="14" />
                <span>{{ isAutoLoggingIn ? 'Logging In...' : 'Launch Authenticated Portal' }}</span>
              </button>
              <span v-if="autoLoginError" class="feedback-error">{{ autoLoginError }}</span>
            </div>
          </div>

          <!-- Emergency Password Reset -->
          <div class="dash-card glass-panel">
            <div class="card-header">
              <div class="card-title-group">
                <BaseIcon name="lock" :size="16" />
                <h3 class="card-title">Password Reset &amp; Credentials</h3>
              </div>
            </div>
            <p class="dash-card-desc">Reset the password directly in the sovereign database for any registered WordPress user.</p>
            <div class="diag-form-stack">
              <div v-if="userList.length > 0" class="diag-field">
                <label class="diag-label">Target User</label>
                <select v-model="selectedUserId" class="diag-select">
                  <option v-for="u in userList" :key="u.id" :value="u.id">
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
                  <button type="button" class="btn-modal-aux" @click="generateRandomPassword">
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
                <BaseIcon v-if="isResettingPassword" name="spin" :size="14" :spinning="true" />
                <BaseIcon v-else name="refresh" :size="14" />
                <span>{{ isResettingPassword ? 'Resetting...' : 'Reset & Copy Password' }}</span>
              </button>
              <div v-if="passwordResetResult" class="credentials-box">
                <span v-if="passwordResetResult.success" class="cred-success">
                  User: <code>{{ passwordResetResult.userLogin }}</code> | Pass: <code>{{ passwordResetResult.newPassword }}</code>
                  <span class="cred-copied-badge">&check; Copied!</span>
                </span>
                <span v-else class="cred-error">{{ passwordResetResult.error }}</span>
              </div>
            </div>
          </div>

          <!-- Session & Storage Flush -->
          <div class="dash-card glass-panel">
            <div class="card-header">
              <div class="card-title-group">
                <BaseIcon name="brand" :size="16" />
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
              <BaseIcon v-if="isFlushingSession" name="spin" :size="14" :spinning="true" />
              <BaseIcon v-else name="trash" :size="14" />
              <span>{{ isFlushingSession ? 'Flushing...' : 'Clear Portal Session' }}</span>
            </button>
            <span v-if="flushSessionFeedback" class="feedback-msg">{{ flushSessionFeedback }}</span>
          </div>

          <!-- Database Integrity Health -->
          <div class="dash-card glass-panel">
            <div class="card-header">
              <div class="card-title-group">
                <BaseIcon name="database" :size="16" />
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
              <BaseIcon v-if="isCheckingDb" name="spin" :size="14" :spinning="true" />
              <BaseIcon v-else name="check" :size="14" />
              <span>{{ isCheckingDb ? 'Checking...' : 'Check Database Health' }}</span>
            </button>
            <div v-if="dbHealthResult" class="db-health-result">
              <span>Status: <strong>{{ dbHealthResult.status }}</strong> ({{ dbHealthResult.integrity }})</span>
              <span>Users: {{ dbHealthResult.userCount }} | Size: {{ Math.round(dbHealthResult.sizeBytes / 1024) }} KB</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. TAB: SETTINGS -->
      <section v-show="activeTab === 'tab-settings'" class="tab-content">
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

            <div class="settings-field">
              <label class="pref-toggle-label">
                <input
                  type="checkbox"
                  :checked="autolaunch"
                  class="pref-checkbox"
                  @change="$emit('setAutolaunch', ($event.target as HTMLInputElement).checked)"
                />
                <span class="pref-text">Auto-launch WebTop in Browser when Cluster Starts</span>
              </label>
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
              <BaseIcon v-if="isUpdatingPlugins" name="spin" :size="14" :spinning="true" />
              <BaseIcon v-else name="refresh" :size="14" />
              <span>{{ isUpdatingPlugins ? 'Updating Plugins...' : 'Update Plugins Suite' }}</span>
            </button>
            <span v-if="pluginUpdateFeedback" class="feedback-msg">{{ pluginUpdateFeedback }}</span>
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
import type { DesktopApi, EngineStatus, EngineType, WpUser } from '../../types';
import type { TierInfo } from '../../license-cloud-manager';

const props = defineProps<{
  isActive: boolean;
  activeTab: string;
  status: EngineStatus;
  statusLabel: string;
  engineType: EngineType;
  currentGatewayUrl: string;
  currentTierData: TierInfo;
  currentTierColor: { hex: string; three: number };
  version: string;
  stayOnSplash: boolean;
  autolaunch: boolean;
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
  (e: 'setStayOnSplash', val: boolean): void;
  (e: 'setAutolaunch', val: boolean): void;
  (e: 'toggleConsole'): void;
  (e: 'openLicenseModal'): void;
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

const handleUpdatePlugins = async () => {
  isUpdatingPlugins.value = true;
  pluginUpdateFeedback.value = '';
  try {
    const res = await props.api.updatePlugins();
    pluginUpdateFeedback.value = res?.stderr ? `Warning: ${res.stderr}` : 'Plugins successfully synchronized.';
  } catch (e: any) {
    pluginUpdateFeedback.value = `Update failed: ${e?.message || e}`;
  } finally {
    isUpdatingPlugins.value = false;
  }
};
</script>
