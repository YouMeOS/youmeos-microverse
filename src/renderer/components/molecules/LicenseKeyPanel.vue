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
          <span class="panel-subtitle">License verification &amp; node activation</span>
        </div>
      </div>
      <button
        type="button"
        class="modal-close-btn"
        title="Close License Manager"
        @click="$emit('close')"
      >
        <BaseIcon name="close" :size="16" />
      </button>
    </div>

    <!-- Panel Body -->
    <div class="panel-body key-panel-body custom-scrollbar">
      <div class="key-panel-row">
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
  (e: 'close'): void;
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

<style scoped>
.hud-panel {
  background: rgba(10, 16, 28, 0.94);
  border: 1px solid var(--border-glass-bright);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(98, 201, 255, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.license-key-panel {
  flex: 0 0 auto;
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(98, 201, 255, 0.14);
  background: rgba(14, 22, 38, 0.75);
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.panel-icon-badge.key-badge {
  background: rgba(255, 215, 0, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.4);
  color: #ffd700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.2);
}

.panel-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: 0.3px;
}

.panel-subtitle {
  font-size: 0.64rem;
  color: var(--text-secondary);
  display: block;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fff;
}

.key-panel-body {
  padding: 10px 16px;
}

.key-panel-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch;
}

@media (max-width: 680px) {
  .key-panel-row {
    grid-template-columns: 1fr;
  }
}

.license-active-status-card {
  background: rgba(14, 22, 38, 0.7);
  border: 1px solid rgba(0, 242, 254, 0.25);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.25s ease;
}

.active-status-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.active-tier-identity {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.active-tier-name {
  font-size: 0.92rem;
  font-weight: 800;
}

.active-status-tag {
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid transparent;
}

.active-status-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #4ade80;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.active-key-block {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.active-key-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.active-key-label {
  font-size: 0.64rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-copy-key {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.64rem;
  font-weight: 600;
  color: var(--accent-cyan);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.btn-copy-key:hover {
  background: rgba(98, 201, 255, 0.15);
  color: #fff;
}

.active-key-display {
  font-family: var(--font-mono);
  font-size: 0.70rem;
  color: #62c9ff;
  background: rgba(0, 0, 0, 0.45);
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid rgba(98, 201, 255, 0.2);
  word-break: break-all;
}

.license-activate-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(14, 22, 38, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 12px;
}

.activate-section-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activate-section-title {
  font-size: 0.74rem;
  font-weight: 700;
  color: #fff;
}

.activate-section-desc {
  font-size: 0.62rem;
  color: var(--text-secondary);
  line-height: 1.3;
}

.activate-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activate-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(6, 10, 18, 0.65);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  transition: border-color 0.2s ease;
}

.activate-input-wrapper:focus-within {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px var(--accent-cyan-glow);
}

.activate-input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  outline: none;
}

.btn-activate-key-prominent {
  background: linear-gradient(135deg, rgba(98, 201, 255, 0.25) 0%, rgba(0, 242, 254, 0.35) 100%);
  border: 1px solid var(--accent-cyan);
  color: #fff;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.btn-activate-key-prominent:hover {
  background: var(--accent-cyan);
  color: #000;
  box-shadow: 0 0 14px var(--accent-cyan-glow);
  transform: translateY(-1px);
}

.license-feedback-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.68rem;
  font-family: var(--font-mono);
  animation: fadeIn 0.2s ease;
}

.license-feedback-banner.feedback-success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #4ade80;
}

.license-feedback-banner.feedback-error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
}
</style>
