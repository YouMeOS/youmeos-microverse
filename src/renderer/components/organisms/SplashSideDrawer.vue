<template>
  <div :class="['splash-side-panel', 'glass-panel', { collapsed: !isOpen }]">
    <!-- Side Panel Header -->
    <div class="splash-side-header">
      <div class="splash-brand">
        <div class="brand-badge">
          <BaseIcon
            name="brand"
            :size="16"
            class="brand-icon"
            :spinning="isTransitioning"
          />
        </div>
        <div class="splash-title-group">
          <h2 class="splash-title">My YouMeOS Microverse</h2>
          <span class="splash-subtitle">Local Destkop Engine </span>
        </div>
      </div>

      <button
        type="button"
        class="hud-close-btn"
        title="Collapse HUD Panel"
        @click="$emit('close')"
      >
        <BaseIcon
          name="close"
          :size="14"
        />
      </button>
    </div>

    <!-- Engine & Cluster Status Bar inside Side Panel -->
    <div class="splash-side-status-bar">
      <div class="status-bar-left">
        <EngineSelector
          :model-value="engineType"
          @update:model-value="$emit('setEngineType', $event)"
        />
        <PortSelector
          :model-value="activePort || 80"
          :disabled="isActionPending"
          @change="$emit('setPort', $event)"
        />
      </div>
      <StatusBadge :status="status" />
    </div>

    <!-- Component Verification HUD Body -->
    <div class="splash-side-body custom-scrollbar">
      <!-- Error Alert / Remediation Card -->
      <div
        v-if="status === 'error'"
        class="sidebar-error-card glass-panel"
        @click="$emit('openErrorModal')"
      >
        <div class="sidebar-error-header">
          <div class="sidebar-error-badge">
            <BaseIcon name="alert-triangle" :size="16" />
          </div>
          <div class="sidebar-error-title-group">
            <span class="sidebar-error-title">{{ errorInfo?.title || 'Engine Failure Detected' }}</span>
            <span class="sidebar-error-subtitle">{{ errorInfo?.suggestedAction || 'Click to Diagnose &amp; Auto-Fix' }}</span>
          </div>
        </div>
        <button
          type="button"
          class="btn-sidebar-fix"
          title="Open Diagnostics and 1-Click Fix"
        >
          <BaseIcon name="wrench" :size="13" />
          <span>Diagnose &amp; Fix</span>
        </button>
      </div>

      <!-- Ready to Launch WebTop Sidebar Prompt Card -->
      <div v-if="isRunning" class="sidebar-launch-card glass-panel">
        <div class="sidebar-launch-header">
          <div class="sidebar-launch-badge">
            <BaseIcon name="brand" :size="16" />
          </div>
          <div class="sidebar-launch-title-group">
            <span class="sidebar-launch-title">Stack Running Successfully</span>
            <span class="sidebar-launch-subtitle">Would you like to launch WebTop?</span>
          </div>
        </div>

        <div class="sidebar-launch-actions">
          <button
            type="button"
            class="btn-sidebar-launch btn-launch-native"
            title="Launch WebTop in native desktop app window and minimize to tray"
            @click="$emit('launchWebtop', 'webview')"
          >
            <BaseIcon name="brand" :size="14" />
            <span>Launch Native App</span>
          </button>

          <button
            type="button"
            class="btn-sidebar-launch btn-launch-browser"
            title="Launch WebTop in default browser and minimize to tray"
            @click="$emit('launchWebtop', 'browser')"
          >
            <BaseIcon name="browser" :size="14" />
            <span>In Browser</span>
          </button>
        </div>
      </div>

      <div class="telemetry-header">
        <span class="telemetry-title">Stack Verification</span>
        <span class="verification-badge">{{ verifiedCount }} / {{ totalCount }} Verified</span>
      </div>

      <!-- Verification Cards List -->
      <div class="telemetry-list">
        <MetricCard
          v-for="layer in sortedStackLayers"
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

      <!-- Stay on Splash Preferences -->
      <div class="splash-prefs-box">
        <label
          class="pref-toggle-label"
          title="Keep 3D splash screen open even after engine starts"
        >
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

    <!-- Quick Action Bar in Side Footer -->
    <QuickActionBar
      :is-running="isRunning"
      :is-transitioning="isTransitioning"
      :is-action-pending="isActionPending"
      @start="$emit('start')"
      @stop="$emit('stop')"
      @open-url="$emit('openUrl')"
      @open-browser="$emit('openBrowser')"
      @open-blackbox="$emit('openBlackbox')"
      @open-settings="$emit('openSettings')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import StatusBadge from '../atoms/StatusBadge.vue';
import EngineSelector from '../molecules/EngineSelector.vue';
import PortSelector from '../molecules/PortSelector.vue';
import MetricCard from '../molecules/MetricCard.vue';
import QuickActionBar from '../molecules/QuickActionBar.vue';
import type { EngineStatus, EngineType, StackLayerStatus, WebtopLaunchTarget, EngineErrorInfo } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  status: EngineStatus;
  engineType: EngineType;
  activePort?: number;
  errorInfo?: EngineErrorInfo | null;
  stackLayers: StackLayerStatus[];
  verifiedCount: number;
  totalCount: number;
  stayOnSplash: boolean;
  isRunning: boolean;
  isTransitioning: boolean;
  isActionPending: boolean;
}>();

const LAYER_ORDER: Record<string, number> = {
  compass: 1,
  portal: 2,
  network: 3,
  server: 4,
  core: 5,
  database: 6,
  bedrock: 7
};

const sortedStackLayers = computed(() => {
  return [...props.stackLayers].sort((a, b) => {
    const orderA = LAYER_ORDER[a.id?.toLowerCase()] || 99;
    const orderB = LAYER_ORDER[b.id?.toLowerCase()] || 99;
    return orderA - orderB;
  });
});

defineEmits<{
  (e: 'close'): void;
  (e: 'setEngineType', val: EngineType): void;
  (e: 'setPort', port: number): void;
  (e: 'setStayOnSplash', val: boolean): void;
  (e: 'launchWebtop', target: WebtopLaunchTarget): void;
  (e: 'highlightLayer', layerId: string | null): void;
  (e: 'selectLayer', layerId: string): void;
  (e: 'openErrorModal'): void;
  (e: 'start'): void;
  (e: 'stop'): void;
  (e: 'openUrl'): void;
  (e: 'openBrowser'): void;
  (e: 'openBlackbox'): void;
  (e: 'openSettings'): void;
}>();
</script>

<style scoped>
.splash-side-panel {
  position: absolute;
  top: 14px;
  right: 14px;
  bottom: 14px;
  width: 380px;
  max-width: calc(100vw - 28px);
  display: flex;
  flex-direction: column;
  background: rgba(8, 14, 26, 0.78);
  backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass-bright);
  border-radius: var(--radius-lg);
  box-shadow: 
    -12px 0 45px rgba(0, 0, 0, 0.65),
    0 0 35px rgba(98, 201, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  overflow: hidden;
  z-index: 20;
  pointer-events: auto;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.splash-side-panel.collapsed {
  transform: translateX(calc(100% + 28px));
  opacity: 0;
  pointer-events: none;
}

.splash-side-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(98, 201, 255, 0.12);
  background: rgba(14, 22, 38, 0.6);
}

.splash-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: rgba(98, 201, 255, 0.12);
  border: 1px solid var(--border-glass-bright);
  box-shadow: 0 0 10px var(--accent-cyan-glow);
  flex-shrink: 0;
}

.brand-icon {
  color: var(--accent-cyan);
}

.splash-title-group {
  display: flex;
  flex-direction: column;
}

.splash-title {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.2px;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.splash-subtitle {
  font-size: 0.65rem;
  color: var(--accent-cyan);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.hud-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: rgba(98, 201, 255, 0.08);
  border: 1px solid rgba(98, 201, 255, 0.2);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.hud-close-btn:hover {
  background: rgba(98, 201, 255, 0.2);
  border-color: var(--accent-cyan);
  color: #fff;
  box-shadow: 0 0 10px var(--accent-cyan-glow);
}

.splash-side-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: rgba(10, 16, 28, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.status-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.port-indicator-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.64rem;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--accent-cyan);
  background: rgba(0, 242, 254, 0.08);
  border: 1px solid rgba(0, 242, 254, 0.25);
  padding: 2px 6px;
  border-radius: 9999px;
  letter-spacing: 0.3px;
}

.splash-side-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
  background: rgba(6, 10, 18, 0.3);
  overflow-y: auto;
  gap: 8px;
  min-height: 0;
}

.sidebar-error-card {
  background: linear-gradient(135deg, rgba(36, 12, 22, 0.88) 0%, rgba(20, 8, 14, 0.94) 100%);
  border: 1px solid rgba(255, 0, 85, 0.45);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 0, 85, 0.2);
  margin-bottom: 6px;
  animation: fadeIn 0.25s ease;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-error-card:hover {
  border-color: #ff3366;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6), 0 0 28px rgba(255, 0, 85, 0.35);
  transform: translateY(-1px);
}

.sidebar-error-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-error-badge {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: rgba(255, 0, 85, 0.18);
  border: 1px solid rgba(255, 0, 85, 0.5);
  color: #ff3366;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(255, 0, 85, 0.3);
}

.sidebar-error-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sidebar-error-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.1px;
}

.sidebar-error-subtitle {
  font-size: 0.68rem;
  color: #ff8899;
  font-weight: 500;
}

.btn-sidebar-fix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.74rem;
  font-weight: 700;
  background: rgba(255, 0, 85, 0.2);
  border: 1px solid rgba(255, 0, 85, 0.5);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.btn-sidebar-fix:hover {
  background: rgba(255, 0, 85, 0.35);
  border-color: #ff3366;
  box-shadow: 0 0 14px rgba(255, 0, 85, 0.4);
}

.sidebar-launch-card {
  background: linear-gradient(135deg, rgba(14, 28, 54, 0.9) 0%, rgba(10, 18, 36, 0.95) 100%);
  border: 1px solid rgba(0, 242, 254, 0.35);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), 0 0 20px rgba(0, 242, 254, 0.15);
  margin-bottom: 6px;
  animation: fadeIn 0.25s ease;
}

.sidebar-launch-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-launch-badge {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: rgba(0, 242, 254, 0.15);
  border: 1px solid rgba(0, 242, 254, 0.4);
  color: #00f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.25);
}

.sidebar-launch-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sidebar-launch-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.1px;
}

.sidebar-launch-subtitle {
  font-size: 0.72rem;
  color: var(--accent-cyan);
  font-weight: 500;
}

.sidebar-launch-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 2px;
}

.btn-sidebar-launch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  border: 1px solid transparent;
  text-decoration: none;
}

.btn-sidebar-launch.btn-launch-native {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border-color: #38bdf8;
  color: #fff;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

.btn-sidebar-launch.btn-launch-native:hover {
  background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.5);
  transform: translateY(-1px);
}

.btn-sidebar-launch.btn-launch-browser {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.btn-sidebar-launch.btn-launch-browser:hover {
  background: rgba(16, 185, 129, 0.22);
  border-color: rgba(16, 185, 129, 0.6);
  color: #fff;
  box-shadow: 0 0 14px rgba(16, 185, 129, 0.35);
  transform: translateY(-1px);
}

.telemetry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.telemetry-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-secondary);
}

.verification-badge {
  font-size: 0.62rem;
  font-family: var(--font-mono);
  color: var(--accent-cyan);
  background: rgba(98, 201, 255, 0.1);
  border: 1px solid rgba(98, 201, 255, 0.25);
  padding: 1px 7px;
  border-radius: 9999px;
}

.telemetry-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.splash-prefs-box {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 8px 10px;
  background: rgba(12, 18, 32, 0.5);
  border: 1px solid rgba(98, 201, 255, 0.08);
  border-radius: var(--radius-sm);
  margin-top: 4px;
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
</style>
