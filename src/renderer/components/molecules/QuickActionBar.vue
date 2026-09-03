<template>
  <div class="splash-side-footer">
    <!-- Row 1: Core Stack Controls (5 Buttons) -->
    <div class="transport-grid-primary">
      <!-- 1. Start -->
      <button
        type="button"
        :class="['btn-transport', 'btn-transport-start', { 'is-active': isRunning }]"
        :disabled="isActionPending || isTransitioning"
        title="Start Microverse Stack"
        @click="handleStartClick"
      >
        <BaseIcon
          name="start"
          :size="16"
        />
        <span class="btn-transport-label">Start</span>
      </button>

      <!-- 2. Console HUD -->
      <button
        type="button"
        class="btn-transport btn-aux-terminal"
        title="Toggle Terminal HUD (` or ~)"
        @click="$emit('toggleConsole')"
      >
        <BaseIcon
          name="pause"
          :size="16"
        />
        <span class="btn-transport-label">Console</span>
      </button>

      <!-- 3. Stop -->
      <button
        type="button"
        :class="['btn-transport', 'btn-transport-stop', { 'is-active': isStopped }]"
        :disabled="isActionPending || isStopped || isTransitioning || isError"
        title="Stop Microverse Stack"
        @click="$emit('stop')"
      >
        <BaseIcon
          name="stop"
          :size="16"
        />
        <span class="btn-transport-label">Stop</span>
      </button>

      <!-- 4. Restart -->
      <button
        type="button"
        class="btn-transport btn-transport-restart"
        :disabled="isActionPending || isStopped || isTransitioning || isError"
        title="Restart Microverse Stack"
        @click="$emit('restart')"
      >
        <BaseIcon
          name="refresh"
          :size="16"
        />
        <span class="btn-transport-label">Restart</span>
      </button>

      <!-- 5. Settings (Port Eject) -->
      <button
        type="button"
        class="btn-transport btn-transport-eject"
        title="Open Settings &amp; Port Configuration"
        @click="$emit('openSettings')"
      >
        <BaseIcon
          name="eject"
          :size="16"
        />
        <span class="btn-transport-label">Settings</span>
      </button>
    </div>

    <!-- Row 2: Secondary Launch Utilities & Diagnostics (4 Buttons) -->
    <div class="transport-grid-secondary">
      <!-- 6. Native App -->
      <button
        type="button"
        :class="['btn-transport', 'btn-aux-web', { 'is-active': isRunning }]"
        :disabled="!isRunning"
        title="Open Native App in Default Gateway"
        @click="$emit('openUrl')"
      >
        <BaseIcon
          name="external"
          :size="16"
        />
        <span class="btn-transport-label">Native App</span>
      </button>

      <!-- 7. Browser -->
      <button
        type="button"
        class="btn-transport btn-aux-browser"
        title="Open in Browser"
        @click="$emit('openBrowser')"
      >
        <BaseIcon
          name="browser"
          :size="16"
        />
        <span class="btn-transport-label">Browser</span>
      </button>

      <!-- 8. Files -->
      <button
        type="button"
        class="btn-transport btn-aux-blackbox"
        title="Open Files Folder (Plugins, Themes &amp; Uploads)"
        @click="$emit('openBlackbox')"
      >
        <BaseIcon
          name="folder"
          :size="16"
        />
        <span class="btn-transport-label">Files</span>
      </button>

      <!-- 9. Diagnostics -->
      <button
        type="button"
        class="btn-transport btn-aux-diagnostics"
        title="Open Diagnostics &amp; System Health"
        @click="$emit('openDiagnostics')"
      >
        <BaseIcon
          name="diagnostics"
          :size="16"
        />
        <span class="btn-transport-label">Diagnostics</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';

const props = withDefaults(
  defineProps<{
    isRunning?: boolean;
    isStopped?: boolean;
    isTransitioning?: boolean;
    isActionPending?: boolean;
    isError?: boolean;
  }>(),
  {
    isRunning: false,
    isStopped: true,
    isTransitioning: false,
    isActionPending: false,
    isError: false
  }
);

const emit = defineEmits<{
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

const handleStartClick = () => {
  if (!props.isRunning && !props.isActionPending && !props.isTransitioning) {
    emit('start');
  }
};
</script>

<style scoped>
  .splash-side-footer {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px;
    border-top: 1px solid rgba(98, 201, 255, 0.16);
    background: rgba(10, 16, 28, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.45);
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .transport-grid-primary {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
    width: 100%;
  }

  .transport-grid-secondary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    width: 100%;
  }

  .btn-transport {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 6px 2px 5px;
    border-radius: var(--radius-sm);
    background: linear-gradient(180deg, rgba(22, 32, 54, 0.9) 0%, rgba(12, 18, 32, 0.98) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 0.60rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
  }

  .btn-transport:hover:not(:disabled) {
    background: linear-gradient(180deg, rgba(34, 48, 80, 0.95) 0%, rgba(18, 28, 50, 1) 100%);
    border-color: var(--accent-cyan);
    color: #fff;
    box-shadow: 0 0 10px var(--accent-cyan-glow);
    transform: translateY(-1px);
  }

  .btn-transport:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .btn-transport-label {
    font-size: 0.58rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .btn-transport-start {
    background: linear-gradient(180deg, rgba(16, 48, 28, 0.9) 0%, rgba(10, 30, 18, 0.98) 100%);
    border-color: rgba(74, 222, 128, 0.3);
    color: #4ade80;
  }

  .btn-transport-start:hover:not(:disabled) {
    background: linear-gradient(180deg, rgba(24, 72, 40, 0.95) 0%, rgba(14, 46, 26, 1) 100%);
    border-color: #4ade80;
    box-shadow: 0 0 12px rgba(74, 222, 128, 0.45);
  }

  .btn-transport-start.is-active {
    background: linear-gradient(180deg, rgba(16, 56, 32, 0.95) 0%, rgba(10, 34, 20, 0.98) 100%);
    border-color: var(--status-running);
    color: #4ade80;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.6), 0 0 14px var(--status-running-glow);
  }

  .btn-transport-stop {
    background: linear-gradient(180deg, rgba(48, 16, 20, 0.9) 0%, rgba(30, 10, 12, 0.98) 100%);
    border-color: rgba(248, 113, 113, 0.3);
    color: #f87171;
  }

  .btn-transport-stop:hover:not(:disabled) {
    background: linear-gradient(180deg, rgba(72, 24, 28, 0.95) 0%, rgba(46, 14, 18, 1) 100%);
    border-color: #f87171;
    box-shadow: 0 0 12px rgba(248, 113, 113, 0.45);
  }

  .btn-transport-stop.is-active {
    background: linear-gradient(180deg, rgba(56, 18, 22, 0.95) 0%, rgba(32, 10, 14, 0.98) 100%);
    border-color: var(--status-stopped);
    color: #f87171;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.6), 0 0 14px var(--status-stopped-glow);
  }

  .btn-transport-restart:hover:not(:disabled) {
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  .btn-transport-eject:hover:not(:disabled),
  .btn-aux-diagnostics:hover:not(:disabled) {
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  .btn-aux-web,
  .btn-aux-browser,
  .btn-aux-blackbox,
  .btn-aux-diagnostics,
  .btn-aux-terminal {
    background: linear-gradient(180deg, rgba(22, 32, 54, 0.85) 0%, rgba(12, 18, 32, 0.95) 100%);
    border-color: rgba(255, 255, 255, 0.1);
  }
</style>
