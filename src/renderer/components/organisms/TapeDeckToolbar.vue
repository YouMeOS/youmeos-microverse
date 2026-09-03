<template>
  <div class="dash-card glass-panel transport-card transport-card-fixed">
    <div class="card-header">
      <div class="card-title-group">
        <BaseIcon
          name="brand"
          :size="16"
        />
        <h3 class="card-title">Engine Controls</h3>
      </div>
      <StatusBadge :status="status" />
    </div>

    <div class="transport-actions-row">
      <!-- 1. Matrix (Rewind) -->
      <button
        type="button"
        class="btn-transport btn-aux-splash"
        title="Return to 3D Matrix Splash View"
        @click="$emit('openSplash')"
      >
        <BaseIcon
          name="rewind"
          :size="20"
        />
        <span class="btn-transport-label">Back</span>
      </button>

      <!-- 2. Start (Overview) -->
      <button
        type="button"
        :class="['btn-transport', 'btn-transport-start', { 'is-active': isRunning || activeTab === 'tab-overview' }]"
        :disabled="isActionPending || isTransitioning"
        title="Start Stack &amp; View Overview"
        @click="handleStartClick"
      >
        <BaseIcon
          name="start"
          :size="20"
        />
        <span class="btn-transport-label">Up</span>
      </button>

      <!-- 5. Restart -->
      <button
        type="button"
        class="btn-transport btn-transport-restart"
        :disabled="isActionPending || isStopped || isTransitioning || isError"
        title="Restart Microverse Stack"
        @click="$emit('restart')"
      >
        <BaseIcon
          name="refresh"
          :size="20"
        />
        <span class="btn-transport-label">Restart</span>
      </button>

      <!-- 6. Settings / Port (Eject) -->
      <button
        type="button"
        :class="['btn-transport', 'btn-transport-eject', { 'is-active': activeTab === 'tab-settings' }]"
        title="Open Settings &amp; Port Configuration"
        @click="$emit('setTab', 'tab-settings')"
      >
        <BaseIcon
          name="pause"
          :size="20"
        />
        <span class="btn-transport-label">Settings</span>
      </button>
    
      <!-- 3. Console (Pause - between Start & Stop) -->
      <button
        type="button"
        class="btn-transport btn-aux-terminal"
        title="Toggle Terminal HUD (` or ~)"
        @click="$emit('toggleConsole')"
      >
        <BaseIcon
          name="eject"
          :size="20"
        />
        <span class="btn-transport-label">Logs</span>
      </button>

      <!-- 4. Stop -->
      <button
        type="button"
        :class="['btn-transport', 'btn-transport-stop', { 'is-active': isStopped }]"
        :disabled="isActionPending || isStopped || isTransitioning || isError"
        title="Stop Microverse Stack"
        @click="$emit('stop')"
      >
        <BaseIcon
          name="stop"
          :size="20"
        />
        <span class="btn-transport-label">Down</span>
      </button>

      <div class="transport-sep" />

      <!-- 7. Open WebTop -->
      <button
        type="button"
        class="btn-transport btn-aux-web"
        :disabled="!isRunning"
        title="Open Native Window in Default Gateway"
        @click="$emit('openUrl', currentGatewayUrl)"
      >
        <BaseIcon
          name="external"
          :size="20"
        />
        <span class="btn-transport-label">In App</span>
      </button>

      <!-- 8. Browser -->
      <button
        type="button"
        class="btn-transport btn-aux-browser"
        title="Open in Default Browser"
        @click="$emit('openBrowser')"
      >
        <BaseIcon
          name="browser"
          :size="20"
        />
        <span class="btn-transport-label">Browser</span>
      </button>

      <!-- 9. Files -->
      <button
        type="button"
        class="btn-transport btn-aux-blackbox"
        title="Open Files Folder (Plugins, Themes &amp; Uploads)"
        @click="$emit('openBlackbox')"
      >
        <BaseIcon
          name="folder"
          :size="20"
        />
        <span class="btn-transport-label">Files</span>
      </button>

      <!-- 10. Diagnostics -->
      <button
        type="button"
        :class="['btn-transport', 'btn-aux-diagnostics', { 'is-active': activeTab === 'tab-diagnostics' }]"
        title="Open Diagnostics &amp; System Health"
        @click="$emit('setTab', 'tab-diagnostics')"
      >
        <BaseIcon
          name="diagnostics"
          :size="20"
        />
        <span class="btn-transport-label">Tools</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';
import StatusBadge from '../atoms/StatusBadge.vue';
import type { EngineStatus } from '../../types';

const props = defineProps<{
  status: EngineStatus;
  activeTab: string;
  isRunning: boolean;
  isStopped: boolean;
  isTransitioning: boolean;
  isActionPending: boolean;
  isError: boolean;
  currentGatewayUrl: string;
}>();

const emit = defineEmits<{
  (e: 'openSplash'): void;
  (e: 'start'): void;
  (e: 'toggleConsole'): void;
  (e: 'stop'): void;
  (e: 'restart'): void;
  (e: 'setTab', tabId: string): void;
  (e: 'openUrl', url: string): void;
  (e: 'openBrowser'): void;
  (e: 'openBlackbox'): void;
}>();

const handleStartClick = () => {
  emit('setTab', 'tab-overview');
  if (!props.isRunning && !props.isActionPending && !props.isTransitioning) {
    emit('start');
  }
};
</script>

<style scoped>
  .transport-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
    padding: 10px 14px;
  }

  .dash-card {
    background: var(--bg-glass);
    backdrop-filter: blur(16px) saturate(130%);
    -webkit-backdrop-filter: blur(16px) saturate(130%);
    border: 1px solid var(--border-glass);
    border-radius: var(--radius-md);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title-group {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--accent-cyan);
  }

  .card-title {
    font-size: 0.88rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.1px;
  }

  .transport-actions-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .btn-transport {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 6px 10px 5px;
    min-width: 58px;
    min-height: 50px;
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: linear-gradient(180deg, rgba(30, 42, 68, 0.88) 0%, rgba(16, 22, 38, 0.98) 100%);
    color: var(--text-primary);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 -1px 0 rgba(0, 0, 0, 0.45), 0 3px 8px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    flex-shrink: 0;
  }

  .btn-transport:hover:not(:disabled) {
    background: linear-gradient(180deg, rgba(42, 58, 92, 0.95) 0%, rgba(22, 30, 52, 0.98) 100%);
    border-color: var(--border-glass-bright);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 12px var(--accent-cyan-glow);
    transform: translateY(-1px);
  }

  .btn-transport:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  .btn-transport:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn-transport-label {
    line-height: 1;
    white-space: nowrap;
  }

  .btn-transport-start.is-active {
    background: linear-gradient(180deg, rgba(16, 56, 32, 0.95) 0%, rgba(10, 34, 20, 0.98) 100%);
    border-color: var(--status-running);
    color: #4ade80;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.6), 0 0 14px var(--status-running-glow);
  }

  .btn-transport-stop.is-active {
    background: linear-gradient(180deg, rgba(56, 18, 22, 0.95) 0%, rgba(32, 10, 14, 0.98) 100%);
    border-color: var(--status-stopped);
    color: #f87171;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.6), 0 0 14px var(--status-stopped-glow);
  }

  .btn-transport-eject.is-active,
  .btn-aux-diagnostics.is-active {
    background: linear-gradient(180deg, rgba(14, 116, 144, 0.95) 0%, rgba(8, 47, 73, 0.98) 100%);
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.6), 0 0 14px var(--accent-cyan-glow);
  }

  .transport-sep {
    width: 1px;
    height: 42px;
    background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.18) 50%, transparent 100%);
    margin: 0 4px;
  }

  .btn-aux-web,
  .btn-aux-browser,
  .btn-aux-blackbox,
  .btn-aux-diagnostics,
  .btn-aux-terminal,
  .btn-aux-splash {
    background: linear-gradient(180deg, rgba(22, 32, 54, 0.85) 0%, rgba(12, 18, 32, 0.95) 100%);
    border-color: rgba(255, 255, 255, 0.1);
  }
</style>
