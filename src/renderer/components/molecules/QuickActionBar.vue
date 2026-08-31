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
        <BaseIcon
          v-if="isActionPending || isTransitioning"
          name="spin"
          :size="14"
          :spinning="true"
        />
        <BaseIcon
          v-else-if="isRunning"
          name="stop"
          :size="14"
        />
        <BaseIcon
          v-else
          name="start"
          :size="14"
        />
        <span>{{ buttonLabel }}</span>
      </button>

      <button
        v-if="isRunning"
        type="button"
        class="splash-footer-btn btn-webtop-launch"
        title="Open Live WebTop in Default Browser"
        @click="$emit('openUrl')"
      >
        <BaseIcon
          name="external"
          :size="14"
        />
        <span>Open Native App</span>
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
        <BaseIcon
          name="browser"
          :size="13"
        />
        <span>Browser</span>
      </button>

      <button
        type="button"
        class="splash-footer-btn btn-util"
        title="Open Files Folder (Plugins, Themes &amp; Uploads)"
        @click="$emit('openBlackbox')"
      >
        <BaseIcon
          name="folder"
          :size="13"
        />
        <span>Files</span>
      </button>

      <button
        type="button"
        class="splash-footer-btn btn-settings-nav"
        title="Open Settings"
        @click="$emit('openSettings')"
      >
        <BaseIcon
          name="gear"
          :size="13"
        />
        <span>Settings</span>
        <BaseIcon
          name="chevron-right"
          :size="11"
        />
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

<style scoped>
  .splash-side-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    border-top: 1px solid rgba(98, 201, 255, 0.16);
    background: rgba(10, 16, 28, 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.45);
  }

  .splash-footer-primary {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    width: 100%;
  }

  .splash-footer-primary.is-dual {
    grid-template-columns: 1fr 1fr;
  }

  .splash-footer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1.15fr;
    gap: 6px;
    width: 100%;
  }

  .splash-footer-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
    white-space: nowrap;
    box-sizing: border-box;
  }

  .btn-transport-main {
    padding: 9px 12px;
  }

  .btn-start-cluster {
    background: linear-gradient(180deg, rgba(34, 197, 94, 0.9) 0%, rgba(21, 128, 61, 0.95) 100%);
    color: #fff;
    border: 1px solid rgba(74, 222, 128, 0.45);
    box-shadow: 0 0 16px rgba(34, 197, 94, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .btn-start-cluster:hover:not(:disabled) {
    background: linear-gradient(180deg, rgba(46, 213, 115, 1) 0%, rgba(22, 142, 69, 1) 100%);
    box-shadow: 0 0 22px rgba(34, 197, 94, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .btn-stop-cluster {
    background: linear-gradient(180deg, rgba(239, 68, 68, 0.85) 0%, rgba(185, 28, 28, 0.95) 100%);
    color: #fff;
    border: 1px solid rgba(248, 113, 113, 0.45);
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .btn-stop-cluster:hover:not(:disabled) {
    background: linear-gradient(180deg, rgba(248, 113, 113, 1) 0%, rgba(220, 38, 38, 1) 100%);
    box-shadow: 0 0 22px rgba(239, 68, 68, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .btn-webtop-launch {
    background: linear-gradient(180deg, rgba(98, 201, 255, 0.18) 0%, rgba(20, 60, 120, 0.3) 100%);
    color: #fff;
    border: 1px solid var(--border-glass-bright);
    box-shadow: 0 0 14px rgba(98, 201, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
  }

  .btn-webtop-launch:hover {
    background: linear-gradient(180deg, rgba(98, 201, 255, 0.35) 0%, rgba(30, 80, 160, 0.45) 100%);
    border-color: var(--accent-cyan);
    box-shadow: 0 0 18px var(--accent-cyan-glow), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    color: #fff;
    transform: translateY(-1px);
  }

  .btn-util {
    background: rgba(16, 24, 42, 0.75);
    color: var(--text-primary);
    border: 1px solid var(--border-glass);
    backdrop-filter: blur(8px);
  }

  .btn-util:hover {
    background: rgba(26, 40, 72, 0.9);
    border-color: var(--border-glass-bright);
    color: var(--accent-cyan);
    box-shadow: 0 0 10px var(--accent-cyan-glow);
    transform: translateY(-1px);
  }

  .btn-settings-nav {
    background: linear-gradient(180deg, rgba(41, 121, 255, 0.75) 0%, rgba(20, 65, 145, 0.85) 100%);
    color: #fff;
    border: 1px solid rgba(98, 201, 255, 0.4);
    box-shadow: 0 0 12px rgba(41, 121, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .btn-settings-nav:hover {
    background: linear-gradient(180deg, rgba(56, 140, 255, 0.95) 0%, rgba(30, 85, 185, 1) 100%);
    border-color: var(--accent-cyan);
    box-shadow: 0 0 18px var(--accent-cyan-glow), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
</style>
