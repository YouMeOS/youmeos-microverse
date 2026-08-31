<template>
  <div :class="['app-layout', { hidden: !isActive }]">
    <!-- Main Dashboard Header -->
    <AppHeader
      :status="status"
      :status-label="statusLabel"
      :engine-type="engineType"
      :active-port="activePort"
      :is-action-pending="isActionPending"
      :current-gateway-url="currentGatewayUrl"
      :current-tier-data="currentTierData"
      :current-tier-color="currentTierColor"
      :is-transitioning="isTransitioning"
      :is-copied="isCopied"
      @set-engine-type="$emit('setEngineType', $event)"
      @set-port="$emit('setPort', $event)"
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
        tab-id="tab-settings"
        label="Settings"
        icon="gear"
        :is-active="activeTab === 'tab-settings'"
        @select="handleTabSelect"
      />
      <TabItem
        tab-id="tab-diagnostics"
        label="Diagnostics"
        icon="diagnostics"
        :is-active="activeTab === 'tab-diagnostics'"
        @select="handleTabSelect"
      />
    </nav>

    <!-- Tab Contents Container -->
    <main class="app-content custom-scrollbar">
      <!-- 1. TAB: OVERVIEW -->
      <OverviewTab
        v-show="activeTab === 'tab-overview'"
        :status="status"
        :active-port="activePort"
        :error-info="errorInfo"
        :current-gateway-url="currentGatewayUrl"
        :current-tier-data="currentTierData"
        :current-tier-color="currentTierColor"
        :stack-layers="stackLayers"
        @open-error-modal="$emit('openErrorModal')"
        @open-license-modal="$emit('openLicenseModal')"
        @open-url="$emit('openUrl', $event)"
      />

      <!-- 2. TAB: DIAGNOSTICS -->
      <DiagnosticsTab
        ref="diagnosticsTabRef"
        v-show="activeTab === 'tab-diagnostics'"
        :is-running="isRunning"
        :current-gateway-url="currentGatewayUrl"
        :api="api"
      />

      <!-- 3. TAB: SETTINGS -->
      <SettingsTab
        v-show="activeTab === 'tab-settings'"
        :engine-type="engineType"
        :active-port="activePort"
        :os-homepage-mode="osHomepageMode"
        :is-action-pending="isActionPending"
        :api="api"
        @set-engine-type="$emit('setEngineType', $event)"
        @set-port="$emit('setPort', $event)"
        @set-homepage-mode="$emit('setHomepageMode', $event)"
        @toggle-console="$emit('toggleConsole')"
      />
    </main>

    <!-- Fixed Bottom Cluster Transport Controls -->
    <QuickActionBar
      :is-running="isRunning"
      :is-stopped="isStopped"
      :is-transitioning="isTransitioning"
      :is-action-pending="isActionPending"
      :is-error="isError"
      @start="handleStartClick"
      @stop="$emit('stop')"
      @restart="$emit('restart')"
      @toggle-console="$emit('toggleConsole')"
      @open-settings="handleTabSelect('tab-settings')"
      @open-diagnostics="handleTabSelect('tab-diagnostics')"
      @open-url="$emit('openUrl', currentGatewayUrl)"
      @open-browser="$emit('openBrowser')"
      @open-blackbox="$emit('openBlackbox')"
    />

    <AppFooter
      :version="version"
      :is-checking="isCheckingUpdates"
      @check-updates="$emit('checkUpdates')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TabItem from '../atoms/TabItem.vue';
import QuickActionBar from '../molecules/QuickActionBar.vue';
import AppHeader from '../organisms/AppHeader.vue';
import AppFooter from '../organisms/AppFooter.vue';
import OverviewTab from '../organisms/tabs/OverviewTab.vue';
import DiagnosticsTab from '../organisms/tabs/DiagnosticsTab.vue';
import SettingsTab from '../organisms/tabs/SettingsTab.vue';
import type { DesktopApi, EngineStatus, EngineType, StackLayerStatus, EngineErrorInfo } from '../../types';
import type { TierInfo } from '../../license-cloud-manager';

const props = defineProps<{
  isActive: boolean;
  activeTab: string;
  status: EngineStatus;
  statusLabel: string;
  engineType: EngineType;
  activePort?: number;
  osHomepageMode?: string;
  errorInfo?: EngineErrorInfo | null;
  currentGatewayUrl: string;
  currentTierData: TierInfo;
  currentTierColor: { hex: string; three: number };
  version: string;
  stackLayers?: StackLayerStatus[];
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
  (e: 'setHomepageMode', mode: string): void;
  (e: 'openErrorModal'): void;
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

const diagnosticsTabRef = ref<InstanceType<typeof DiagnosticsTab> | null>(null);

const handleTabSelect = (tabId: string) => {
  emit('setTab', tabId);
  if (tabId === 'tab-diagnostics') {
    diagnosticsTabRef.value?.loadUsers();
  }
};

const handleStartClick = () => {
  handleTabSelect('tab-overview');
  if (!props.isRunning && !props.isActionPending && !props.isTransitioning) {
    emit('start');
  }
};
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 12px 16px 14px;
  gap: 10px;
  box-sizing: border-box;
  background: transparent;
  color: #fff;
  font-family: var(--font-sans);
  position: relative;
  z-index: 10;
}

.app-layout.hidden {
  display: none !important;
}

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
</style>
