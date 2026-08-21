<template>
  <div class="engine-select-wrapper">
    <select
      :value="modelValue"
      class="engine-select"
      title="Switch Microverse Engine"
      @change="handleChange"
    >
      <option value="embedded">Native Embedded</option>
      <option value="docker">Docker Cluster</option>
    </select>
    <BaseIcon name="chevron-down" :size="10" class="select-chevron" />
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
