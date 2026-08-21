<template>
  <div :class="['log-line', entry.level || 'info']">
    <span class="log-time">{{ formattedTime }}</span>
    <span :class="['log-service-badge', serviceBadgeClass]">
      {{ entry.service.toUpperCase() }}
    </span>
    <span class="log-text">{{ entry.text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LogEntry } from '../../types';

const props = defineProps<{
  entry: LogEntry;
}>();

const formattedTime = computed(() => {
  const d = new Date(props.entry.timestamp || Date.now());
  return d.toLocaleTimeString('en-US', { hour12: false });
});

const serviceBadgeClass = computed(() => {
  const s = props.entry.service.toLowerCase();
  if (s.includes('caddy') || s.includes('gateway')) return 'service-caddy';
  if (s.includes('wp') || s.includes('php') || s.includes('core') || s.includes('franken')) return 'service-wp';
  if (s.includes('sqlite') || s.includes('db')) return 'service-db';
  if (s.includes('setup') || s.includes('composer') || s.includes('system')) return 'service-setup';
  if (s.includes('node') || s.includes('network') || s.includes('mesh')) return 'service-node';
  return 'service-system';
});
</script>
