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
        <label for="engine-selector" class="control-label">Engine</label>
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
            {{ currentGatewayUrl }}
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
          class="btn-return-splash"
          title="Return to 3D Matrix Splash View"
          @click="$emit('openSplash')"
        >
          <BaseIcon name="cube" :size="13" />
          <span>3D Matrix</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';
import StatusDot from '../atoms/StatusDot.vue';
import EngineSelector from '../molecules/EngineSelector.vue';
import type { EngineStatus, EngineType } from '../../types';
import type { TierInfo } from '../../license-cloud-manager';

defineProps<{
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
  (e: 'openSplash'): void;
  (e: 'openUrl', url: string): void;
  (e: 'copyGateway'): void;
}>();
</script>
