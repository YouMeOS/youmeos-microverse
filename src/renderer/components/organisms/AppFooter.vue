<template>
  <footer class="app-footer">
    <div class="footer-left">
      <span class="cert-status">&#10003; Local Sandbox Ready</span>
      <span class="footer-sep">&bull;</span>
      <span class="ssl-status">SSL Active</span>
    </div>
    <div class="footer-right">
      <button
        type="button"
        :class="['btn-update-check', { 'is-checking': isChecking }]"
        title="Check for Microverse Updates"
        :disabled="isChecking"
        @click="$emit('checkUpdates')"
      >
        <BaseIcon
          v-if="isChecking"
          name="spin"
          :size="12"
          class="update-icon"
          :spinning="true"
        />
        <BaseIcon
          v-else
          name="refresh"
          :size="12"
          class="update-icon"
        />
        <span>{{ isChecking ? 'Checking...' : 'Check Updates' }}</span>
      </button>
      <span class="version-tag">Microverse v{{ version }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';

defineProps<{
  version: string;
  isChecking?: boolean;
}>();

defineEmits<{
  (e: 'checkUpdates'): void;
}>();
</script>

<style scoped>
.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  font-size: 0.68rem;
  color: var(--text-secondary);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cert-status {
  color: #4ade80;
  font-weight: 600;
}

.ssl-status {
  color: var(--text-secondary);
}

.footer-sep {
  opacity: 0.4;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-update-check {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-update-check:hover:not(:disabled) {
  background: rgba(0, 240, 255, 0.12);
  border-color: rgba(0, 240, 255, 0.35);
  color: var(--neon-cyan);
}

.btn-update-check.is-checking {
  background: rgba(0, 240, 255, 0.16);
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.35);
}

.btn-update-check:disabled {
  opacity: 0.8;
  cursor: wait;
}

.version-tag {
  font-family: var(--font-mono);
  opacity: 0.75;
}
</style>
