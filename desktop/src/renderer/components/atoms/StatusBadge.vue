<template>
  <div :class="['badge', 'badge-status', status]" role="status">
    <StatusDot :status="status" />
    <span>{{ label || defaultLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StatusDot from './StatusDot.vue';

const props = withDefaults(
  defineProps<{
    status?: 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | string;
    label?: string;
  }>(),
  {
    status: 'stopped',
    label: ''
  }
);

const defaultLabel = computed(() => {
  const s = props.status || 'stopped';
  return s.charAt(0).toUpperCase() + s.slice(1);
});
</script>
