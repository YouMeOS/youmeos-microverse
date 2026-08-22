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
        class="btn-update-check"
        title="Check for Microverse Updates"
        :disabled="isChecking"
        @click="$emit('checkUpdates')"
      >
        <BaseIcon name="refresh" :size="12" class="update-icon" :spinning="isChecking" />
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
