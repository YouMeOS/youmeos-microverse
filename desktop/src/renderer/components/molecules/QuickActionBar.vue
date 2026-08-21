<template>
  <div class="splash-side-footer">
    <!-- Primary Transport & Gateway Row -->
    <div :class="['splash-footer-primary', { 'is-dual': isRunning }]">
      <button
        type="button"
        :class="['splash-footer-btn', 'btn-transport-main', isRunning ? 'btn-stop-cluster' : 'btn-start-cluster']"
        :disabled="isActionPending || isTransitioning"
        @click="isRunning ? $emit('stop') : $emit('start')"
      >
        <BaseIcon v-if="isActionPending || isTransitioning" name="spin" :size="14" :spinning="true" />
        <BaseIcon v-else-if="isRunning" name="stop" :size="14" />
        <BaseIcon v-else name="start" :size="14" />
        <span>{{ buttonLabel }}</span>
      </button>

      <button
        v-if="isRunning"
        type="button"
        class="splash-footer-btn btn-webtop-launch"
        title="Open Live WebTop in Default Browser"
        @click="$emit('openUrl')"
      >
        <BaseIcon name="external" :size="14" />
        <span>Open WebTop</span>
      </button>
    </div>

    <!-- Secondary Utilities & Navigation -->
    <div class="splash-footer-grid">
      <button
        type="button"
        class="splash-footer-btn btn-util"
        title="Open Gateway Browser"
        @click="$emit('openBrowser')"
      >
        <BaseIcon name="browser" :size="13" />
        <span>Browser</span>
      </button>

      <button
        type="button"
        class="splash-footer-btn btn-util"
        title="Open Blackbox Directory"
        @click="$emit('openBlackbox')"
      >
        <BaseIcon name="folder" :size="13" />
        <span>Blackbox</span>
      </button>

      <button
        type="button"
        class="splash-footer-btn btn-settings-nav"
        title="Open Settings"
        @click="$emit('openSettings')"
      >
        <BaseIcon name="gear" :size="13" />
        <span>Settings</span>
        <BaseIcon name="chevron-right" :size="11" />
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
  (e: 'openSettings'): void;
}>();

const buttonLabel = computed(() => {
  if (props.isActionPending || props.isTransitioning) return 'Processing...';
  if (props.isRunning) return 'Stop Cluster';
  return 'Start Cluster';
});
</script>
