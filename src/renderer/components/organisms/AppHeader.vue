<template>
  <header class="app-header">
    <div class="brand">
      <div class="brand-badge">
        <BaseIcon name="brand" :size="16" class="brand-icon" :spinning="isTransitioning" />
      </div>
      <div class="brand-text">
        <h1 class="brand-title">My YouMeOS Microverse</h1>
        <span class="brand-sub">Local Desktop Engine</span>
      </div>
    </div>

    <div class="header-controls">
      <!-- Engine Mode Selector -->
      <div class="engine-switch">
        <EngineSelector
          :model-value="engineType"
          @update:model-value="$emit('setEngineType', $event)"
        />
      </div>

      <!-- Cluster Status Pill (Click toggles Quake Console) -->
      <div
        :class="['badge', 'badge-status', status]"
        role="status"
        title="Click to toggle Console HUD"
        style="cursor: pointer;"
        @click="$emit('toggleConsole')"
      >
        <StatusDot :status="status" />
        <span>{{ statusLabel }}</span>
      </div>

      <!-- Header License Tier Pill (Click opens License Modal) -->
      <button
        type="button"
        class="header-license-pill"
        title="Manage COMPASS License &amp; Sparks"
        @click="$emit('openLicenseModal')"
      >
        <span
          class="license-pill-dot"
          :style="{
            background: currentTierColor.hex,
            boxShadow: `0 0 6px ${currentTierColor.hex}`
          }"
        />
        <span>{{ currentTierData.name }} Compass</span>
      </button>

      <!-- Gateway Endpoint Address -->
      <div class="gateway-info">
        <div class="gateway-link-wrapper">
          <a
            href="#"
            class="gateway-link"
            title="Open Gateway in Default Browser"
            @click.prevent="$emit('openUrl', currentGatewayUrl)"
          >
            {{ displayGatewayUrl }}
            <BaseIcon name="external" :size="12" />
          </a>
          <button
            type="button"
            class="btn-copy-link"
            title="Copy URL to Clipboard"
            @click="$emit('copyGateway')"
          >
            <BaseIcon :name="isCopied ? 'check' : 'copy'" :size="13" />
          </button>
        </div>
      </div>

      <!-- Header Quick Actions -->
      <div class="header-actions">
        <!-- Onboarding & Profile Setup Button -->
        <button
          type="button"
          class="btn-icon btn-onboarding-toggle"
          title="Sovereign Onboarding &amp; Profile Setup"
          @click="$emit('openOnboarding')"
        >
          <BaseIcon name="user-check" :size="14" />
        </button>

        <!-- Terminal HUD Button -->
        <button
          type="button"
          class="btn-icon btn-quake-toggle"
          title="Toggle Terminal HUD (` or ~)"
          @click="$emit('toggleConsole')"
        >
          <BaseIcon name="terminal" :size="14" />
        </button>

        <!-- 3D Matrix Splash Button -->
        <button
          type="button"
          class="btn-icon btn-splash-toggle"
          title="Return to 3D Matrix Splash View"
          @click="$emit('openSplash')"
        >
          <BaseIcon name="cube" :size="14" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import StatusDot from '../atoms/StatusDot.vue';
import EngineSelector from '../molecules/EngineSelector.vue';
import type { EngineStatus, EngineType } from '../../types';
import type { TierInfo } from '../../license-cloud-manager';

const props = defineProps<{
  status: EngineStatus;
  statusLabel: string;
  engineType: EngineType;
  currentGatewayUrl: string;
  currentTierData: TierInfo;
  currentTierColor: { hex: string; three: number };
  isTransitioning?: boolean;
  isCopied?: boolean;
}>();

defineEmits<{
  (e: 'setEngineType', val: EngineType): void;
  (e: 'toggleConsole'): void;
  (e: 'openLicenseModal'): void;
  (e: 'openOnboarding'): void;
  (e: 'openSplash'): void;
  (e: 'openUrl', url: string): void;
  (e: 'copyGateway'): void;
}>();

const displayGatewayUrl = computed(() => {
  if (!props.currentGatewayUrl) return '';
  return props.currentGatewayUrl.replace(/^https?:\/\//i, '');
});
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: rgba(12, 18, 32, 0.7);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  gap: 8px;
  min-width: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
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

.brand-text {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}

.brand-title {
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.25);
  line-height: 1.2;
}

.brand-sub {
  font-size: 0.66rem;
  color: var(--accent-cyan);
  font-weight: 500;
  opacity: 0.9;
  line-height: 1.2;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.engine-switch {
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  border: 1px solid transparent;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  user-select: none;
}

.badge-status.running {
  background: rgba(34, 197, 94, 0.15);
  border-color: var(--status-running);
  color: var(--status-running);
  box-shadow: 0 0 10px var(--status-running-glow);
}

.badge-status.stopped {
  background: rgba(239, 68, 68, 0.12);
  border-color: var(--status-stopped);
  color: var(--status-stopped);
  box-shadow: 0 0 8px var(--status-stopped-glow);
}

.badge-status.starting,
.badge-status.transitioning {
  background: rgba(234, 179, 8, 0.15);
  border-color: var(--status-transitioning);
  color: var(--status-transitioning);
  box-shadow: 0 0 8px var(--status-transitioning-glow);
}

.badge-status.error {
  background: rgba(239, 68, 68, 0.25);
  border-color: var(--status-stopped);
  color: #fff;
  box-shadow: 0 0 10px var(--status-stopped-glow);
}

.header-license-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 24, 42, 0.8);
  border: 1px solid var(--border-glass-bright);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  color: #fff;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.header-license-pill:hover {
  background: rgba(26, 40, 72, 0.95);
  border-color: var(--accent-cyan);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 14px var(--accent-cyan-glow);
  transform: translateY(-1px);
}

.license-pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.gateway-info {
  display: flex;
  align-items: center;
}

.gateway-link-wrapper {
  display: flex;
  align-items: center;
  background: rgba(14, 22, 38, 0.65);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 3px 6px 3px 8px;
  gap: 5px;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.gateway-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--accent-cyan);
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.gateway-link:hover {
  color: #fff;
  text-shadow: 0 0 8px var(--accent-cyan-glow);
}

.btn-copy-link {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-copy-link:hover {
  color: var(--accent-cyan);
  background: rgba(255, 255, 255, 0.08);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(16, 24, 42, 0.75);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(26, 40, 72, 0.9);
  border-color: var(--border-glass-bright);
  color: var(--accent-cyan);
  box-shadow: 0 0 10px var(--accent-cyan-glow);
}
</style>
