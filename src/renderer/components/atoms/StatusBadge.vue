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

<style scoped>
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
</style>
