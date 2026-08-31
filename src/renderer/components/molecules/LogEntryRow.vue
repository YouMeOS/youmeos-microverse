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

<style scoped>
.log-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  word-break: break-all;
  transition: background 0.12s ease;
  border-left: 2px solid transparent;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.5;
}

.log-line:hover {
  background: rgba(255, 255, 255, 0.04);
}

.log-line.warn {
  border-left-color: #eab308;
  background: rgba(234, 179, 8, 0.05);
}

.log-line.error {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.log-line.debug {
  opacity: 0.75;
}

.log-time {
  color: var(--text-muted);
  font-size: 0.70rem;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  padding-top: 1px;
}

.log-service-badge {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
  text-align: center;
  min-width: 68px;
  line-height: 1.4;
}

.service-caddy {
  background: rgba(98, 201, 255, 0.15);
  color: var(--accent-cyan);
  border: 1px solid rgba(98, 201, 255, 0.3);
}

.service-wp {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.service-db {
  background: rgba(255, 213, 153, 0.15);
  color: var(--accent-gold);
  border: 1px solid rgba(255, 213, 153, 0.3);
}

.service-setup {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  border: 1px solid var(--border-glass-subtle);
}

.service-node {
  background: rgba(41, 121, 255, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(41, 121, 255, 0.3);
}

.log-text {
  color: var(--text-primary);
  flex: 1;
}
</style>
