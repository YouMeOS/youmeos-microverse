<template>
  <div :class="['splash-screen-container', { hidden: !isActive }]">
    <!-- Full-Viewport Interactive 3D Architecture Canvas -->
    <div
      ref="canvasContainerRef"
      class="splash-3d-full-viewport"
      title="Click and drag to rotate 3D matrix in space"
    />

    <!-- Minimal Subtle Floating Interaction Hint -->
    <div class="canvas-interactive-hint">
      <BaseIcon name="orbit" :size="12" />
      <span>Drag to Orbit Matrix &bull; Click Layers to Inspect</span>
    </div>

    <!-- Floating HUD Drawer Trigger / Pill -->
    <button
      type="button"
      class="splash-hud-toggle-btn"
      title="Toggle Component Verification &amp; HUD"
      @click="$emit('toggleSideDrawer')"
    >
      <div class="hud-toggle-icon">
        <BaseIcon name="hud" :size="14" />
      </div>
      <span class="hud-toggle-label">HUD</span>
      <StatusDot :status="status" />
    </button>

    <!-- Sleek Collapsible HUD Side Panel Drawer -->
    <SplashSideDrawer
      :is-open="isSideDrawerOpen"
      :status="status"
      :engine-type="engineType"
      :active-port="activePort"
      :error-info="errorInfo"
      :stack-layers="stackLayers"
      :verified-count="verifiedCount"
      :total-count="totalCount"
      :is-running="isRunning"
      :is-transitioning="isTransitioning"
      :is-action-pending="isActionPending"
      @close="$emit('toggleSideDrawer', false)"
      @set-engine-type="$emit('setEngineType', $event)"
      @set-port="$emit('setPort', $event)"
      @launch-webtop="$emit('launchWebtop', $event)"
      @highlight-layer="$emit('highlightLayer', $event)"
      @select-layer="$emit('selectLayer', $event)"
      @open-error-modal="$emit('openErrorModal')"
      @start="$emit('start')"
      @stop="$emit('stop')"
      @restart="$emit('restart')"
      @toggle-console="$emit('toggleConsole')"
      @open-overview="$emit('openOverview')"
      @open-diagnostics="$emit('openDiagnostics')"
      @open-settings="$emit('openSettings')"
      @open-url="$emit('openUrl')"
      @open-browser="$emit('openBrowser')"
      @open-blackbox="$emit('openBlackbox')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import StatusDot from '../atoms/StatusDot.vue';
import SplashSideDrawer from '../organisms/SplashSideDrawer.vue';
import type { EngineStatus, EngineType, StackLayerStatus, WebtopLaunchTarget, EngineErrorInfo } from '../../types';

defineProps<{
  isActive: boolean;
  status: EngineStatus;
  engineType: EngineType;
  activePort?: number;
  errorInfo?: EngineErrorInfo | null;
  stackLayers: StackLayerStatus[];
  verifiedCount: number;
  totalCount: number;
  isRunning: boolean;
  isTransitioning: boolean;
  isActionPending: boolean;
  isSideDrawerOpen: boolean;
}>();

defineEmits<{
  (e: 'toggleSideDrawer', forceState?: boolean): void;
  (e: 'setEngineType', val: EngineType): void;
  (e: 'setPort', val: number): void;
  (e: 'launchWebtop', target: WebtopLaunchTarget): void;
  (e: 'highlightLayer', layerId: string | null): void;
  (e: 'selectLayer', layerId: string): void;
  (e: 'openErrorModal'): void;
  (e: 'start'): void;
  (e: 'stop'): void;
  (e: 'restart'): void;
  (e: 'toggleConsole'): void;
  (e: 'openOverview'): void;
  (e: 'openDiagnostics'): void;
  (e: 'openSettings'): void;
  (e: 'openUrl'): void;
  (e: 'openBrowser'): void;
  (e: 'openBlackbox'): void;
}>();

const canvasContainerRef = ref<HTMLElement | null>(null);

defineExpose({
  canvasContainerRef
});
</script>

<style scoped>
.splash-screen-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 90;
  box-sizing: border-box;
  background: transparent;
  overflow: hidden;
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.splash-screen-container.hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.98);
  display: none !important;
}

.splash-3d-full-viewport {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  cursor: grab;
  z-index: 1;
  pointer-events: auto;
}

.splash-3d-full-viewport:active {
  cursor: grabbing;
}

.canvas-interactive-hint {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  color: var(--text-secondary);
  background: rgba(8, 14, 26, 0.65);
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(98, 201, 255, 0.2);
  pointer-events: none;
  backdrop-filter: blur(12px);
  z-index: 5;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transition: opacity 0.3s ease;
}

.splash-hud-toggle-btn {
  position: absolute;
  top: 16px;
  right: 18px;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(10, 16, 28, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-glass-bright);
  border-radius: 9999px;
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(98, 201, 255, 0.12);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  pointer-events: auto;
}

.splash-hud-toggle-btn:hover {
  background: rgba(18, 30, 52, 0.88);
  border-color: var(--accent-cyan);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6), 0 0 20px var(--accent-cyan-glow);
  transform: translateY(-1px);
}

.hud-toggle-icon {
  display: flex;
  align-items: center;
  color: var(--accent-cyan);
}

.hud-toggle-label {
  letter-spacing: 0.3px;
}
</style>
