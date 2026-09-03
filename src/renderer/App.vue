<template>
  <div class="app-root">
    <!-- Generative Liquid Smoke Background Canvas -->
    <canvas
      id="microverse-smoke-canvas"
      ref="smokeCanvasRef"
      class="smoke-canvas-bg"
    />

    <!-- Interactive 3D Splash Screen View -->
    <SplashView
      ref="splashViewRef"
      :is-active="state.activeView.value === 'splash'"
      :status="state.status.value"
      :engine-type="state.engineType.value"
      :active-port="state.activePort.value"
      :error-info="state.errorInfo.value"
      :stack-layers="state.stackLayers.value"
      :verified-count="state.verifiedLayersCount.value"
      :total-count="state.totalLayersCount.value"
      :is-running="state.isRunning.value"
      :is-transitioning="state.isTransitioning.value"
      :is-action-pending="state.isActionPending.value"
      :is-side-drawer-open="state.isSideDrawerOpen.value"
      @toggle-side-drawer="state.toggleSideDrawer"
      @set-engine-type="state.setEngineType"
      @set-port="state.setPort"
      @launch-webtop="state.launchWebtop"
      @highlight-layer="handleHighlightLayer"
      @select-layer="handleSelectLayer"
      @open-error-modal="state.openErrorModal"
      @start="state.start"
      @stop="state.stop"
      @restart="state.restart"
      @toggle-console="logs.toggle"
      @open-overview="handleOpenOverview"
      @open-diagnostics="handleOpenDiagnostics"
      @open-settings="handleOpenSettings"
      @open-url="state.openUrl"
      @open-browser="state.openBrowser"
      @open-blackbox="state.openBlackbox"
    />

    <!-- Primary Main Dashboard Layout View -->
    <DashboardView
      ref="dashViewRef"
      :is-active="state.activeView.value === 'dashboard'"
      :active-tab="state.activeTab.value"
      :status="state.status.value"
      :status-label="state.statusLabel.value"
      :engine-type="state.engineType.value"
      :active-port="state.activePort.value"
      :os-homepage-mode="state.osHomepageMode.value"
      :dev-mode="state.devMode.value"
      :error-info="state.errorInfo.value"
      :current-gateway-url="state.currentGatewayUrl.value"
      :current-tier-data="license.currentTierData.value"
      :current-tier-color="license.currentTierColor.value"
      :version="state.version.value"
      :stack-layers="state.stackLayers.value"
      :is-running="state.isRunning.value"
      :is-stopped="state.isStopped.value"
      :is-transitioning="state.isTransitioning.value"
      :is-error="state.isError.value"
      :is-action-pending="state.isActionPending.value"
      :is-checking-updates="updater.isChecking.value"
      :is-copied="isCopied"
      :api="state.api"
      @set-tab="handleSetTab"
      @set-engine-type="state.setEngineType"
      @set-port="state.setPort"
      @set-homepage-mode="state.setHomepageMode"
      @set-dev-mode="state.setDevMode"
      @open-error-modal="state.openErrorModal"
      @toggle-console="logs.toggle"
      @open-license-modal="license.openModal"
      @open-splash="handleSwitchView('splash')"
      @open-url="state.openUrl"
      @open-browser="state.openBrowser"
      @open-blackbox="state.openBlackbox"
      @copy-gateway="handleCopyGateway"
      @check-updates="updater.checkForUpdates"
      @start="state.start"
      @stop="state.stop"
      @restart="state.restart"
    />

    <!-- Quake-Style Dropdown Live Console HUD -->
    <QuakeConsoleDrawer
      :is-open="logs.isOpen.value"
      :active-category="logs.activeCategory.value"
      :active-level="logs.activeLevel.value"
      :search-query="logs.searchQuery.value"
      :logs="logs.filteredLogs.value"
      :total-count="logs.totalEntriesCount.value"
      :copy-success="logs.copySuccess.value"
      @close="logs.toggle(false)"
      @set-category="logs.activeCategory.value = $event"
      @set-level="logs.activeLevel.value = $event"
      @update:search-query="logs.searchQuery.value = $event"
      @copy="logs.copyToClipboard"
      @clear="logs.clear"
    />

    <!-- COMPASS License Manager Modal (2-Panel HUD) -->
    <LicenseModal
      :is-open="license.isModalOpen.value"
      :active-tier="license.currentTier.value"
      :active-key="license.currentKey.value"
      :active-tier-data="license.activeTierData.value"
      :active-tier-color="license.activeTierColor.value"
      :selected-tier="license.selectedTier.value"
      :selected-tier-data="license.selectedTierData.value"
      :selected-tier-color="license.selectedTierColor.value"
      :tiers="allTiers"
      :input-key="license.inputKey.value"
      :feedback-msg="license.feedbackMsg.value"
      :is-checking-out="license.isCheckingOut.value"
      :active-spark-filter="license.activeSparkFilter.value"
      :is-sparks-collapsed="license.isSparksCollapsed.value"
      :filtered-sparks="license.filteredSparks.value"
      :unlocked-count="license.unlockedCount.value"
      @close="license.closeModal"
      @select-tier="license.selectTier"
      @update:input-key="license.inputKey.value = $event"
      @activate-key="license.activateKey"
      @stripe-checkout="license.triggerStripeCheckout"
      @toggle-sparks-collapse="license.toggleSparksCollapse"
      @set-spark-filter="license.activeSparkFilter.value = $event"
    />

    <!-- Application Update Manager Modal -->
    <UpdateModal
      :is-open="updater.isModalOpen.value"
      :status="updater.status.value"
      :current-version="state.version.value"
      @close="updater.closeModal"
      @download="updater.downloadUpdate"
      @install="updater.installUpdate"
    />

    <!-- Engine Diagnostics & Remediation Error Modal -->
    <EngineErrorModal
      :is-open="state.isErrorModalOpen.value"
      :error-info="state.errorInfo.value"
      :raw-error="state.statusMessage.value"
      :active-port="state.activePort.value"
      :engine-type="state.engineType.value"
      :is-action-pending="state.isActionPending.value"
      @close="state.closeErrorModal"
      @remediate="state.handleRemediateError"
      @set-port="state.setPort"
      @restart="state.restart"
      @open-console="logs.toggle(true)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import SplashView from './components/views/SplashView.vue';
import DashboardView from './components/views/DashboardView.vue';
import QuakeConsoleDrawer from './components/organisms/QuakeConsoleDrawer.vue';
import LicenseModal from './components/organisms/LicenseModal.vue';
import UpdateModal from './components/organisms/UpdateModal.vue';
import EngineErrorModal from './components/organisms/EngineErrorModal.vue';
import { useMicroverseState } from './composables/useMicroverseState';
import { useConsoleLogs } from './composables/useConsoleLogs';
import { useLicenseState } from './composables/useLicenseState';
import { useAppUpdate } from './composables/useAppUpdate';
import { Architecture3DManager } from './architecture-3d';
import { initSmokeCanvas, type SmokeCanvasEngine } from './smoke-canvas';

// 1. Composables
const state = useMicroverseState();
const logs = useConsoleLogs();
const license = useLicenseState((tier) => {
  architecture3D?.setCompassTier(tier);
});
const updater = useAppUpdate();

// 2. Reactive Primitives
const smokeCanvasRef = ref<HTMLCanvasElement | null>(null);
const splashViewRef = ref<InstanceType<typeof SplashView> | null>(null);
const dashViewRef = ref<InstanceType<typeof DashboardView> | null>(null);
const isCopied = ref<boolean>(false);

let architecture3D: Architecture3DManager | null = null;
let smokeEngine: SmokeCanvasEngine | null = null;

const allTiers = [
  { id: 'black', name: 'Black', color: '#00f2fe' },
  { id: 'bronze', name: 'Bronze', color: '#cd7f32' },
  { id: 'silver', name: 'Silver', color: '#c0c0c0' },
  { id: 'gold', name: 'Gold', color: '#ffd700' },
  { id: 'platinum', name: 'Platinum', color: '#a0b2c6' },
  { id: 'uranium', name: 'Uranium', color: '#3dee98' },
  { id: 'titanium', name: 'Titanium', color: '#00e5ff' },
  { id: 'palladium', name: 'Palladium', color: '#e6e6fa' }
];

// 3. Helper Methods
const switchCanvasContainer = (target: 'splash' | 'dashboard') => {
  const splashContainer = splashViewRef.value?.canvasContainerRef;
  const rendererDom = document.querySelector('canvas[data-engine="three.js"]');

  if (target === 'splash' && splashContainer) {
    if (rendererDom && rendererDom.parentElement !== splashContainer) {
      splashContainer.appendChild(rendererDom);
    }
  }

  setTimeout(() => architecture3D?.resize(), 60);
};

const handleSwitchView = (view: 'splash' | 'dashboard') => {
  state.activeView.value = view;
  nextTick(() => {
    switchCanvasContainer(view);
  });
};

const handleOpenOverview = () => {
  state.activeTab.value = 'tab-overview';
  handleSwitchView('dashboard');
};

const handleOpenDiagnostics = () => {
  state.activeTab.value = 'tab-diagnostics';
  handleSwitchView('dashboard');
};

const handleOpenSettings = () => {
  state.activeTab.value = 'tab-settings';
  handleSwitchView('dashboard');
};

const handleSetTab = (tabId: string) => {
  state.activeTab.value = tabId;
};

const handleHighlightLayer = (layerId: string | null) => {
  architecture3D?.highlightLayer(layerId);
};

const handleSelectLayer = (layerId: string) => {
  if (layerId === 'compass') {
    license.openModal();
  } else if (layerId === 'portal' || layerId === 'server') {
    state.openUrl();
  } else if (layerId === 'core' || layerId === 'database') {
    logs.openWithFilter('core');
  } else {
    logs.openWithFilter('network');
  }
};

const handleCopyGateway = async () => {
  try {
    await navigator.clipboard.writeText(state.currentGatewayUrl.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 1500);
  } catch {}
};

const handleVisibilityChange = () => {
  if (document.hidden) {
    smokeEngine?.pause();
    architecture3D?.pause();
  } else {
    smokeEngine?.resume();
    if (state.activeView.value === 'splash') {
      architecture3D?.resume();
    }
  }
};

// 4. Watchers
watch(
  () => state.isRunning.value,
  (running) => {
    architecture3D?.setRunning(running);
  }
);

watch(
  () => state.isSideDrawerOpen.value,
  (open) => {
    architecture3D?.setSidePanelOpen(open);
  }
);

watch(
  () => state.activeView.value,
  (view) => {
    if (view === 'splash' && !document.hidden) {
      architecture3D?.resume();
    } else {
      architecture3D?.pause();
    }
  }
);

// 5. Lifecycle Hooks
onMounted(() => {
  if (smokeCanvasRef.value) {
    smokeEngine = initSmokeCanvas(smokeCanvasRef.value);
  }

  const splashContainer = splashViewRef.value?.canvasContainerRef;
  if (splashContainer) {
    architecture3D = new Architecture3DManager({
      container: splashContainer,
      onLayerSelect: handleSelectLayer
    });
    architecture3D.setSidePanelOpen(state.isSideDrawerOpen.value);
    architecture3D.setCompassTier(license.currentTier.value);
    architecture3D.setRunning(state.isRunning.value);
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  if (smokeEngine) smokeEngine.destroy();
  if (architecture3D) architecture3D.destroy();
});
</script>
