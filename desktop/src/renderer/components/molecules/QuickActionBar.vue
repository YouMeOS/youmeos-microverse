<template>
  <div class="splash-side-footer">
    <div class="splash-footer-top">
      <!-- Main Transport Toggle (Start / Stop) -->
      <button
        type="button"
        :class="['splash-action-btn', isRunning ? 'stop-btn' : 'primary-btn']"
        :disabled="isActionPending || isTransitioning"
        @click="isRunning ? $emit('stop') : $emit('start')"
      >
        <BaseIcon v-if="isActionPending || isTransitioning" name="spin" :size="14" :spinning="true" />
        <BaseIcon v-else-if="isRunning" name="stop" :size="14" />
        <BaseIcon v-else name="start" :size="14" />
        <span>{{ buttonLabel }}</span>
      </button>

      <!-- Launch Web Gateway -->
      <button
        v-if="isRunning"
        type="button"
        class="splash-action-btn gateway-launch-btn"
        title="Open Live WebTop in Default Browser"
        @click="$emit('openUrl')"
      >
        <BaseIcon name="external" :size="14" />
        <span>Open WebTop</span>
      </button>
    </div>

    <!-- Quick Utilities (Browser, Blackbox, Dashboard) -->
    <div class="splash-footer-aux">
      <button
        type="button"
        class="splash-action-btn aux-btn"
        title="Open Gateway Browser"
        @click="$emit('openBrowser')"
      >
        <BaseIcon name="browser" :size="14" />
        <span>Browser</span>
      </button>

      <button
        type="button"
        class="splash-action-btn aux-btn"
        title="Open Blackbox Files & Plugins Directory"
        @click="$emit('openBlackbox')"
      >
        <BaseIcon name="folder" :size="14" />
        <span>Blackbox</span>
      </button>

      <button
        type="button"
        class="splash-action-btn secondary-btn"
        title="Open Desktop Dashboard"
        @click="$emit('openDashboard')"
      >
        <span>Dashboard</span>
        <BaseIcon name="chevron-right" :size="14" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';

const props = withDefaults(
  defineProps<{
    isRunning?: boolean;
    isTransitioning?: boolean;
    isActionPending?: boolean;
  }>(),
  {
    isRunning: false,
    isTransitioning: false,
    isActionPending: false
  }
);

defineEmits<{
  (e: 'start'): void;
  (e: 'stop'): void;
  (e: 'openUrl'): void;
  (e: 'openBrowser'): void;
  (e: 'openBlackbox'): void;
  (e: 'openDashboard'): void;
}>();

const buttonLabel = computed(() => {
  if (props.isActionPending || props.isTransitioning) return 'Processing...';
  if (props.isRunning) return 'Stop Cluster';
  return 'Start Cluster';
});
</script>
