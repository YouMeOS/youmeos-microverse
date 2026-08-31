<template>
  <span :class="['dot', status, { pulse: isPulse }]" />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    status?: 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | string;
    isPulse?: boolean;
  }>(),
  {
    status: 'stopped',
    isPulse: false
  }
);
</script>

<style scoped>
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  transition: all 0.25s ease;
  display: inline-block;
  flex-shrink: 0;
}

.dot.running {
  background-color: var(--status-running);
  box-shadow: 0 0 6px var(--status-running);
  animation: dot-pulse 2s infinite ease-in-out;
}

.dot.stopped {
  background-color: var(--status-stopped);
}

.dot.starting,
.dot.transitioning {
  background-color: var(--status-transitioning);
  animation: dot-pulse 1.5s infinite ease-in-out;
}

.dot.error {
  background-color: var(--status-stopped);
  box-shadow: 0 0 6px var(--status-stopped);
}

.dot.pulse {
  animation: dot-pulse 1.2s infinite ease-in-out;
}

@keyframes dot-pulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 6px var(--status-running);
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 10px var(--status-running), 0 0 16px var(--status-running-glow);
  }
}
</style>
