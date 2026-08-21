<template>
  <div class="hud-panel license-key-panel glass-panel">
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="panel-header-left">
        <div class="panel-icon-badge key-badge">
          <BaseIcon name="key" :size="16" />
        </div>
        <div>
          <h3 class="panel-title">My License &amp; Key</h3>
          <span class="panel-subtitle">Sovereignty verification &amp; node activation</span>
        </div>
      </div>
    </div>

    <!-- Panel Body -->
    <div class="panel-body custom-scrollbar">
      <!-- Active License Card -->
      <div
        class="license-active-status-card"
        :style="{ borderColor: `${activeTierColor.hex}40` }"
      >
        <div class="active-status-top">
          <div class="active-tier-identity">
            <span
              class="active-tier-name"
              :style="{ color: activeTierColor.hex }"
            >
              {{ activeTierData.name }} Compass
            </span>
            <span
              class="active-status-tag"
              :style="{
                color: activeTierColor.hex,
                borderColor: `${activeTierColor.hex}60`,
                background: `${activeTierColor.hex}20`
              }"
            >
              Local BYO Hardware
            </span>
          </div>
          <span class="active-status-indicator">
            <span class="status-pulse-dot" :style="{ background: activeTierColor.hex }" />
            Active
          </span>
        </div>

        <!-- Active Key Display with Copy Button -->
        <div class="active-key-block">
          <div class="active-key-label-row">
            <span class="active-key-label">Active License Key</span>
            <button
              type="button"
              class="btn-copy-key"
              :title="copiedLabel"
              @click="handleCopyKey"
            >
              <BaseIcon :name="isCopied ? 'check' : 'copy'" :size="12" />
              <span>{{ copiedLabel }}</span>
            </button>
          </div>
          <code class="active-key-display">{{ activeKey || 'BLCK-SOVEREIGN-LOCAL-2026' }}</code>
        </div>
      </div>

      <!-- License Key Activation Box -->
      <div class="license-activate-section">
        <div class="activate-section-header">
          <span class="activate-section-title">Activate New License Key</span>
          <span class="activate-section-desc">Paste your key from purchase email to unlock higher tiers.</span>
        </div>

        <div class="activate-input-group">
          <div class="activate-input-wrapper">
            <BaseIcon name="key" :size="14" />
            <input
              type="text"
              :value="inputKey"
              placeholder="e.g. GOLD-8821-X992-0199..."
              spellcheck="false"
              autocomplete="off"
              @input="$emit('update:inputKey', ($event.target as HTMLInputElement).value)"
              @keydown.enter="$emit('activateKey')"
            />
          </div>
          <button
            type="button"
            class="btn-activate-key-prominent"
            @click="$emit('activateKey')"
          >
            Activate Key
          </button>
        </div>

        <!-- Live Feedback Alert -->
        <div
          v-if="hasFeedback"
          :class="['license-feedback-banner', feedbackTypeClass]"
        >
          <BaseIcon :name="isSuccessFeedback ? 'check' : 'close'" :size="14" />
          <span>{{ feedbackMsg?.text }}</span>
        </div>
      </div>

      <!-- Need a Key Helper Card -->
      <div class="license-help-card">
        <div class="help-card-icon">
          <BaseIcon name="sparkle" :size="14" />
        </div>
        <div class="help-card-text">
          <strong>Need an upgrade key?</strong>
          <p>Choose any tier in the store on the right. Your key will be generated immediately upon checkout.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import type { TierInfo } from '../../license-cloud-manager';

const props = defineProps<{
  activeTier: string;
  activeKey: string;
  activeTierData: TierInfo;
  activeTierColor: { hex: string; three: number };
  inputKey: string;
  feedbackMsg: { text: string; type: 'success' | 'error' } | null;
}>();

const emit = defineEmits<{
  (e: 'update:inputKey', val: string): void;
  (e: 'activateKey'): void;
}>();

const isCopied = ref<boolean>(false);

const copiedLabel = computed(() => {
  return isCopied.value ? 'Copied!' : 'Copy Key';
});

const hasFeedback = computed(() => {
  return Boolean(props.feedbackMsg && props.feedbackMsg.text);
});

const isSuccessFeedback = computed(() => {
  return props.feedbackMsg?.type === 'success';
});

const feedbackTypeClass = computed(() => {
  return isSuccessFeedback.value ? 'feedback-success' : 'feedback-error';
});

const handleCopyKey = async () => {
  const keyToCopy = props.activeKey || 'BLCK-SOVEREIGN-LOCAL-2026';
  try {
    await navigator.clipboard.writeText(keyToCopy);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy license key:', err);
  }
};
</script>
