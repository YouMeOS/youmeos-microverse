<template>
  <div class="engine-select-wrapper">
    <select
      :value="modelValue"
      class="engine-select"
      title="Switch Microverse Engine"
      @change="handleChange"
    >
      <option value="embedded">Native</option>
      <option value="docker">Docker</option>
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
import type { EngineType } from '../../types';

defineProps<{
  modelValue: EngineType;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: EngineType): void;
}>();

const handleChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  emit('update:modelValue', target.value as EngineType);
};
</script>

<style scoped>
  .engine-select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .engine-select {
    appearance: none;
    background: rgba(20, 28, 48, 0.8);
    color: #fff;
    border: 1px solid var(--border-glass);
    font-size: 0.74rem;
    font-weight: 500;
    padding: 4px 24px 4px 9px;
    border-radius: var(--radius-sm);
    outline: none;
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: all 0.2s ease;
  }

  .engine-select:hover {
    background: rgba(30, 42, 70, 0.9);
    border-color: var(--border-glass-bright);
    box-shadow: 0 0 8px var(--accent-cyan-glow);
  }

  .select-chevron {
    position: absolute;
    right: 7px;
    pointer-events: none;
    color: var(--text-secondary);
  }
</style>
