<template>
  <div :class="['splash-side-panel', 'glass-panel', { collapsed: !isOpen }]">
    <!-- Side Panel Header -->
    <div class="splash-side-header">
      <div class="splash-brand">
        <div class="brand-badge">
          <BaseIcon name="brand" :size="16" class="brand-icon" :spinning="isTransitioning" />
        </div>
        <div class="splash-title-group">
          <h2 class="splash-title">YouMeOS Microverse</h2>
          <span class="splash-subtitle">Harmonic 3D Matrix</span>
        </div>
      </div>

      <button
        type="button"
        class="hud-close-btn"
        title="Collapse HUD Panel"
        @click="$emit('close')"
      >
        <BaseIcon name="close" :size="14" />
      </button>
    </div>

    <!-- Engine & Cluster Status Bar inside Side Panel -->
    <div class="splash-side-status-bar">
      <EngineSelector
        :model-value="engineType"
        @update:model-value="$emit('setEngineType', $event)"
      />
      <StatusBadge :status="status" />
    </div>

    <!-- Component Verification HUD Body -->
    <div class="splash-side-body custom-scrollbar">
      <div class="telemetry-header">
        <span class="telemetry-title">Component Verification</span>
        <span class="verification-badge">{{ verifiedCount }} / {{ totalCount }} Verified</span>
      </div>

      <!-- Verification Cards List -->
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

      <!-- Stay on Splash & Autolaunch Preferences -->
      <div class="splash-prefs-box">
        <label class="pref-toggle-label" title="Keep 3D splash screen open even after engine starts">
          <input
            type="checkbox"
            :checked="stayOnSplash"
            class="pref-checkbox"
            @change="$emit('setStayOnSplash', ($event.target as HTMLInputElement).checked)"
          />
          <span class="pref-text">Stay on 3D Matrix on Start</span>
        </label>
        <label class="pref-toggle-label" title="Automatically open WebTop URL in default browser when cluster starts">
          <input
            type="checkbox"
            :checked="autolaunch"
            class="pref-checkbox"
            @change="$emit('setAutolaunch', ($event.target as HTMLInputElement).checked)"
          />
          <span class="pref-text">Auto-launch WebTop in Browser</span>
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
      @open-dashboard="$emit('openDashboard')"
    />
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';
import StatusBadge from '../atoms/StatusBadge.vue';
import EngineSelector from '../molecules/EngineSelector.vue';
import MetricCard from '../molecules/MetricCard.vue';
import QuickActionBar from '../molecules/QuickActionBar.vue';
import type { EngineStatus, EngineType, StackLayerStatus } from '../../types';

defineProps<{
  isOpen: boolean;
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
}>();

defineEmits<{
  (e: 'close'): void;
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
  (e: 'openDashboard'): void;
}>();
</script>
