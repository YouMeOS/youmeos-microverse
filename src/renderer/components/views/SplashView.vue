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
      :stack-layers="stackLayers"
      :verified-count="verifiedCount"
      :total-count="totalCount"
      :stay-on-splash="stayOnSplash"
      :autolaunch="autolaunch"
      :is-running="isRunning"
      :is-transitioning="isTransitioning"
      :is-action-pending="isActionPending"
      @close="$emit('toggleSideDrawer', false)"
      @set-engine-type="$emit('setEngineType', $event)"
      @set-stay-on-splash="$emit('setStayOnSplash', $event)"
      @set-autolaunch="$emit('setAutolaunch', $event)"
      @highlight-layer="$emit('highlightLayer', $event)"
      @select-layer="$emit('selectLayer', $event)"
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
import { ref } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import StatusDot from '../atoms/StatusDot.vue';
import SplashSideDrawer from '../organisms/SplashSideDrawer.vue';
import type { EngineStatus, EngineType, StackLayerStatus } from '../../types';

defineProps<{
  isActive: boolean;
  status: EngineStatus;
  engineType: EngineType;
  stackLayers: StackLayerStatus[];
  verifiedCount: number;
  totalCount: number;
  stayOnSplash: boolean;
  autolaunch: boolean;
  isRunning: boolean;
  isTransitioning: boolean;
  isActionPending: boolean;
  isSideDrawerOpen: boolean;
}>();

defineEmits<{
  (e: 'toggleSideDrawer', forceState?: boolean): void;
  (e: 'setEngineType', val: EngineType): void;
  (e: 'setStayOnSplash', val: boolean): void;
  (e: 'setAutolaunch', val: boolean): void;
  (e: 'highlightLayer', layerId: string | null): void;
  (e: 'selectLayer', layerId: string): void;
  (e: 'start'): void;
  (e: 'stop'): void;
  (e: 'openUrl'): void;
  (e: 'openBrowser'): void;
  (e: 'openBlackbox'): void;
  (e: 'openSettings'): void;
}>();

const canvasContainerRef = ref<HTMLElement | null>(null);

defineExpose({
  canvasContainerRef
});
</script>
