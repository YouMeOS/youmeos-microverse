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
        <label class="pref-toggle-label" title="Automatically open WebTop when cluster starts">
          <input
            type="checkbox"
            :checked="autolaunch"
            class="pref-checkbox"
            @change="$emit('setAutolaunch', ($event.target as HTMLInputElement).checked)"
          />
          <span class="pref-text">Auto-launch WebTop on Start</span>
        </label>

        <!-- Destination Selection Radio Group -->
        <div class="pref-radio-group" :class="{ 'is-disabled': !autolaunch }">
          <label class="pref-radio-label" title="Launch inside native app window">
            <input
              type="radio"
              name="splash-autolaunch-target"
              value="webview"
              :checked="autolaunchTarget === 'webview'"
              :disabled="!autolaunch"
              class="pref-radio"
              @change="$emit('setAutolaunchTarget', 'webview')"
            />
            <span class="pref-text">Native Window</span>
          </label>
          <label class="pref-radio-label" title="Launch in system web browser">
            <input
              type="radio"
              name="splash-autolaunch-target"
              value="browser"
              :checked="autolaunchTarget === 'browser'"
              :disabled="!autolaunch"
              class="pref-radio"
              @change="$emit('setAutolaunchTarget', 'browser')"
            />
            <span class="pref-text">Browser</span>
          </label>
        </div>
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
import MetricCard from '../molecules/MetricCard.vue';
import QuickActionBar from '../molecules/QuickActionBar.vue';
import type { EngineStatus, EngineType, StackLayerStatus, AutolaunchTarget } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  status: EngineStatus;
  engineType: EngineType;
  stackLayers: StackLayerStatus[];
  verifiedCount: number;
  totalCount: number;
  stayOnSplash: boolean;
  autolaunch: boolean;
  autolaunchTarget: AutolaunchTarget;
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

const LAYER_NAMES: Record<string, string> = {
  compass: 'My COMPASS Software Suite',
  portal: 'YouMeOS',
  network: 'Private W4 Protocol Network',
  server: 'W4 Tesseract Server',
  core: 'Headless WP Core',
  database: 'Database',
  bedrock: 'Bedrock'
};

const sortedStackLayers = computed(() => {
  return [...props.stackLayers]
    .map(l => ({
      ...l,
      name: LAYER_NAMES[l.id?.toLowerCase()] || l.name
    }))
    .sort((a, b) => {
      const orderA = LAYER_ORDER[a.id?.toLowerCase()] || 99;
      const orderB = LAYER_ORDER[b.id?.toLowerCase()] || 99;
      return orderA - orderB;
    });
});

defineEmits<{
  (e: 'close'): void;
  (e: 'setEngineType', val: EngineType): void;
  (e: 'setStayOnSplash', val: boolean): void;
  (e: 'setAutolaunch', val: boolean): void;
  (e: 'setAutolaunchTarget', val: AutolaunchTarget): void;
  (e: 'highlightLayer', layerId: string | null): void;
  (e: 'selectLayer', layerId: string): void;
  (e: 'start'): void;
  (e: 'stop'): void;
  (e: 'openUrl'): void;
  (e: 'openBrowser'): void;
  (e: 'openBlackbox'): void;
  (e: 'openSettings'): void;
}>();
</script>
