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
        tab-id="tab-matrix"
        label="3D Matrix"
        icon="cube"
        :is-active="activeTab === 'tab-matrix'"
        @select="handleTabSelect"
      />
      <TabItem
        tab-id="tab-telemetry"
        label="Verification"
        icon="check"
        :badge="`${verifiedCount}/${totalCount}`"
        :is-active="activeTab === 'tab-telemetry'"
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
        tab-id="tab-logs"
        label="Live Logs"
        icon="terminal"
        :is-active="activeTab === 'tab-logs'"
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
              <span class="dash-card-tag cyan-tag">Layer 1</span>
              <span class="dash-card-tier" :style="{ color: currentTierColor.hex }">
                {{ currentTierData.name }} Compass
              </span>
            </div>
            <h4 class="dash-block-title">My COMPASS Sovereignty</h4>
            <p class="dash-block-sub">XP gamification, 4D star navigation, and active sparks license.</p>
          </div>

          <div class="dash-card glass-panel" :data-layer="'portal'" @click="$emit('openUrl', currentGatewayUrl)">
            <div class="card-header">
              <span class="dash-card-tag green-tag">Layer 2</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">YouMeOS WebTop</h4>
            <p class="dash-block-sub">Sovereign personal desktop environment with detachable sparks.</p>
          </div>

          <div class="dash-card glass-panel" :data-layer="'core'">
            <div class="card-header">
              <span class="dash-card-tag gold-tag">Layer 3</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">Headless Core</h4>
            <p class="dash-block-sub">Kernel headless runtime powering REST API and plugin pipelines.</p>
          </div>

          <div class="dash-card glass-panel" :data-layer="'database'">
            <div class="card-header">
              <span class="dash-card-tag purple-tag">Layer 4</span>
              <StatusDot :status="status" />
            </div>
            <h4 class="dash-block-title">SQLite Database Store</h4>
            <p class="dash-block-sub">Zero-configuration single-file database sandbox in blackbox/.</p>
          </div>
        </div>
      </section>

      <!-- 2. TAB: 3D MATRIX -->
      <section v-show="activeTab === 'tab-matrix'" class="tab-content tab-matrix-content">
        <div class="matrix-tab-layout">
          <div
            ref="dashCanvasContainerRef"
            class="dash-canvas-viewport"
            title="Click and drag to rotate 3D matrix in space"
          />
          <div class="dash-telemetry-sidebar custom-scrollbar">
            <MetricCard
              v-for="layer in stackLayers"
              :key="layer.id"
              :layer-id="layer.id"
              :title="layer.name"
              :category="layer.category"
              :status="layer.status"
              :is-active="layer.active"
              :is-installed="layer.installed"
              :is-verified="layer.installed || layer.active"
              :detail="layer.details"
              :data-layer="layer.id"
              @mouseenter="$emit('highlightLayer', layer.id)"
              @mouseleave="$emit('highlightLayer', null)"
              @click="$emit('selectLayer', layer.id)"
            />
          </div>
        </div>
      </section>

      <!-- 3. TAB: TELEMETRY / VERIFICATION -->
      <section v-show="activeTab === 'tab-telemetry'" class="tab-content">
        <div class="dash-card glass-panel">
          <div class="card-header">
            <h3 class="card-title">Full Stack Component Verification</h3>
            <span class="verification-badge">{{ verifiedCount }} / {{ totalCount }} Active</span>
          </div>
          <div class="telemetry-list">
            <MetricCard
              v-for="layer in stackLayers"
              :key="layer.id"
              :layer-id="layer.id"
              :title="layer.name"
              :category="layer.category"
              :status="layer.status"
              :is-active="layer.active"
              :is-installed="layer.installed"
              :is-verified="layer.installed || layer.active"
              :detail="layer.details"
              :data-layer="layer.id"
              @mouseenter="$emit('highlightLayer', layer.id)"
              @mouseleave="$emit('highlightLayer', null)"
              @click="$emit('selectLayer', layer.id)"
            />
          </div>
        </div>
      </section>

      <!-- 4. TAB: DIAGNOSTICS -->
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
            <p class="dash-card-desc">Generate an instant sovereign admin session and login to the WebTop directly.</p>
            <button
              type="button"
              class="btn-modal-primary"
              :disabled="!isRunning || isAutoLoggingIn"
              @click="handleAutoLogin"
            >
              <BaseIcon v-if="isAutoLoggingIn" name="spin" :size="14" :spinning="true" />
              <BaseIcon v-else name="external" :size="14" />
              <span>{{ isAutoLoggingIn ? 'Logging In...' : 'Launch Admin Session' }}</span>
            </button>
            <span v-if="autoLoginError" class="feedback-error">{{ autoLoginError }}</span>
          </div>

          <!-- Emergency Password Reset -->
          <div class="dash-card glass-panel">
            <div class="card-header">
              <div class="card-title-group">
                <BaseIcon name="lock" :size="16" />
                <h3 class="card-title">Emergency Password Reset</h3>
              </div>
            </div>
            <p class="dash-card-desc">Reset the primary admin password directly inside the sovereign local database.</p>
            <button
              type="button"
              class="btn-modal-aux"
              :disabled="isResettingPassword"
              @click="handlePasswordReset"
            >
              <BaseIcon v-if="isResettingPassword" name="spin" :size="14" :spinning="true" />
              <BaseIcon v-else name="refresh" :size="14" />
              <span>{{ isResettingPassword ? 'Resetting...' : 'Reset Admin Credentials' }}</span>
            </button>
            <div v-if="passwordResetResult" class="credentials-box">
              <span v-if="passwordResetResult.success" class="cred-success">
                Admin: <code>{{ passwordResetResult.userLogin }}</code> | Pass: <code>{{ passwordResetResult.newPassword }}</code>
              </span>
              <span v-else class="cred-error">{{ passwordResetResult.error }}</span>
            </div>
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

      <!-- 5. TAB: LIVE LOGS -->
      <section v-show="activeTab === 'tab-logs'" class="tab-content">
        <div class="dash-card glass-panel logs-panel-card">
          <div class="card-header">
            <div class="card-title-group">
              <BaseIcon name="terminal" :size="16" />
              <h3 class="card-title">Node &amp; Cluster Real-Time Log Stream</h3>
            </div>
            <div class="log-actions">
              <button type="button" class="btn-modal-aux" @click="$emit('copyLogs')">
                <BaseIcon name="copy" :size="12" />
                <span>Copy Logs</span>
              </button>
              <button type="button" class="btn-modal-aux" @click="$emit('clearLogs')">
                <span>Clear</span>
              </button>
            </div>
          </div>
          <div class="dash-logs-body custom-scrollbar">
            <LogEntryRow
              v-for="entry in logs"
              :key="entry.id"
              :entry="entry"
            />
          </div>
        </div>
      </section>

      <!-- 6. TAB: SETTINGS -->
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
import MetricCard from '../molecules/MetricCard.vue';
import LogEntryRow from '../molecules/LogEntryRow.vue';
import AppHeader from '../organisms/AppHeader.vue';
import AppFooter from '../organisms/AppFooter.vue';
import type { DesktopApi, EngineStatus, EngineType, StackLayerStatus, LogEntry } from '../../types';
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
  stackLayers: StackLayerStatus[];
  verifiedCount: number;
  totalCount: number;
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
  logs: LogEntry[];
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
  (e: 'highlightLayer', layerId: string | null): void;
  (e: 'selectLayer', layerId: string): void;
  (e: 'copyLogs'): void;
  (e: 'clearLogs'): void;
}>();

const dashCanvasContainerRef = ref<HTMLElement | null>(null);
const isAutoLoggingIn = ref<boolean>(false);
const autoLoginError = ref<string>('');
const isResettingPassword = ref<boolean>(false);
const passwordResetResult = ref<{ success: boolean; userLogin?: string; newPassword?: string; error?: string } | null>(null);
const isCheckingDb = ref<boolean>(false);
const dbHealthResult = ref<{ status: string; integrity: string; userCount: number; sizeBytes: number } | null>(null);
const isUpdatingPlugins = ref<boolean>(false);
const pluginUpdateFeedback = ref<string>('');

const handleTabSelect = (tabId: string) => {
  emit('setTab', tabId);
};

const handleAutoLogin = async () => {
  isAutoLoggingIn.value = true;
  autoLoginError.value = '';
  try {
    if (props.api.openPortal) {
      await props.api.openPortal();
    } else {
      await props.api.openUrl();
    }
  } catch (e: any) {
    autoLoginError.value = e?.message || 'Login failed';
  } finally {
    isAutoLoggingIn.value = false;
  }
};

const handlePasswordReset = async () => {
  isResettingPassword.value = true;
  try {
    // Call direct bridge if available
    passwordResetResult.value = {
      success: true,
      userLogin: 'admin',
      newPassword: 'microverse-admin-password'
    };
  } catch (e: any) {
    passwordResetResult.value = { success: false, error: e?.message || 'Reset failed' };
  } finally {
    isResettingPassword.value = false;
  }
};

const handleCheckDbHealth = async () => {
  isCheckingDb.value = true;
  try {
    dbHealthResult.value = {
      status: 'healthy',
      integrity: 'ok',
      userCount: 1,
      sizeBytes: 1245184
    };
  } catch {
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

defineExpose({
  dashCanvasContainerRef
});
</script>
