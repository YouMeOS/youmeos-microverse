<template>
  <div class="homepage-mode-wrapper">
    <select
      :value="modelValue"
      class="homepage-mode-select"
      title="Switch OS Homepage Routing Mode (OS_HOMEPAGE_MODE)"
      :disabled="disabled"
      @change="handleChange"
    >
      <option value="homepage">YouMeOS WebTop (Root /)</option>
      <option value="routes_only">Standard Site (Routes Only)</option>
    </select>
    <BaseIcon
      name="chevron-down"
      :size="10"
      class="select-chevron"
    />
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';

defineProps<{
  modelValue?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const handleChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const val = target.value;
  emit('update:modelValue', val);
  emit('change', val);
};
</script>

<style scoped>
  .homepage-mode-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .homepage-mode-select {
    appearance: none;
    background: rgba(20, 28, 48, 0.8);
    color: #fff;
    border: 1px solid var(--border-glass);
    font-size: 0.74rem;
    font-weight: 500;
    padding: 5px 26px 5px 10px;
    border-radius: var(--radius-sm);
    outline: none;
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: all 0.2s ease;
  }

  .homepage-mode-select:hover:not(:disabled) {
    background: rgba(30, 42, 70, 0.9);
    border-color: var(--border-glass-bright);
    box-shadow: 0 0 8px var(--accent-cyan-glow);
  }

  .homepage-mode-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .homepage-mode-select option {
    background: #0d1322;
    color: #fff;
  }

  .select-chevron {
    position: absolute;
    right: 8px;
    pointer-events: none;
    color: var(--text-secondary);
  }
</style>
