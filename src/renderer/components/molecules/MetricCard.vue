<template>
  <div
    :class="['telemetry-card', { 'is-running': isRunningStatus, active: isActive }]"
    :data-layer="layerId || dataLayer"
    @click="$emit('click')"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <div class="telemetry-card-info">
      <div class="telemetry-card-top">
        <span :class="['telemetry-card-tag', tagMeta.tagClass]">{{ tagMeta.tag }}</span>
        <span class="telemetry-card-name">{{ displayTitle }}</span>
      </div>
      <span class="telemetry-card-detail">{{ detail || 'Checking component...' }}</span>
    </div>
    <div :class="['telemetry-status-pill', statusClass]">
      <span :class="['dot', statusClass]" />
      <span>{{ statusLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    layerId?: string;
    category?: string;
    tag?: string;
    tagClass?: string;
    status?: string;
    statusText?: string;
    isVerified?: boolean;
    isActive?: boolean;
    isInstalled?: boolean;
    detail?: string;
    dataLayer?: string;
  }>(),
  {
    title: '',
    layerId: '',
    category: '',
    tag: '',
    tagClass: '',
    status: 'stopped',
    statusText: '',
    isVerified: false,
    isActive: false,
    isInstalled: true,
    detail: '',
    dataLayer: ''
  }
);

defineEmits<{
  (e: 'click'): void;
  (e: 'mouseenter'): void;
  (e: 'mouseleave'): void;
}>();

const layerTagMap: Record<string, { tag: string; tagClass: string }> = {
  compass: { tag: 'Systems', tagClass: 'neon-tag' },
  portal: { tag: 'Portal', tagClass: 'cyan-tag' },
  network: { tag: 'Mesh', tagClass: 'coral-tag' },
  server: { tag: 'Gateway', tagClass: 'emerald-tag' },
  core: { tag: 'Kernel', tagClass: 'gold-tag' },
  database: { tag: 'Storage', tagClass: 'purple-tag' },
  bedrock: { tag: 'Foundation', tagClass: 'blue-tag' }
};

const normalizedId = computed(() => (props.layerId || props.dataLayer || '').toLowerCase());

const tagMeta = computed(() => {
  if (props.tag && props.tagClass) {
    return { tag: props.tag, tagClass: props.tagClass };
  }
  const match = layerTagMap[normalizedId.value];
  if (match) {
    return {
      tag: props.tag || match.tag,
      tagClass: props.tagClass || match.tagClass
    };
  }
  return {
    tag: props.tag || props.category || 'Layer',
    tagClass: props.tagClass || 'cyan-tag'
  };
});

const displayTitle = computed(() => {
  return props.title || 'Stack Component';
});

const isRunningStatus = computed(() => {
  return props.isActive || props.status === 'running';
});

const statusClass = computed(() => {
  if (isRunningStatus.value) return 'running';
  if (props.status === 'starting' || props.status === 'transitioning') return 'starting';
  if (props.status === 'error' || props.isInstalled === false) return 'stopped';
  return 'stopped';
});

const statusLabel = computed(() => {
  if (props.statusText) return props.statusText;
  if (isRunningStatus.value) return 'Online';
  if (props.status === 'starting' || props.status === 'transitioning') return 'Starting';
  if (props.isInstalled === false || props.status === 'error') return 'Missing';
  return 'Offline';
});
</script>

<style scoped>
.telemetry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  background: rgba(15, 24, 42, 0.65);
  border: 1px solid rgba(98, 201, 255, 0.1);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.telemetry-card:hover {
  background: rgba(22, 36, 62, 0.85);
  border-color: var(--border-glass-bright);
  box-shadow: 0 0 14px rgba(98, 201, 255, 0.15);
  transform: translateX(2px);
}

.telemetry-card.is-running {
  border-color: rgba(34, 197, 94, 0.25);
}

.telemetry-card.active {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 16px var(--accent-cyan-glow);
}

.telemetry-card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.telemetry-card-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.telemetry-card-tag {
  font-size: 0.56rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 1px 5px;
  border-radius: 3px;
  line-height: 1.2;
}

.cyan-tag {
  color: var(--accent-cyan);
  background: rgba(98, 201, 255, 0.12);
  border: 1px solid rgba(98, 201, 255, 0.35);
  box-shadow: 0 0 8px rgba(98, 201, 255, 0.15);
}

.neon-tag {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.15);
}

.purple-tag {
  color: #c084fc;
  background: rgba(192, 132, 252, 0.12);
  border: 1px solid rgba(192, 132, 252, 0.35);
  box-shadow: 0 0 8px rgba(192, 132, 252, 0.15);
}

.blue-tag {
  color: #818cf8;
  background: rgba(129, 140, 248, 0.12);
  border: 1px solid rgba(129, 140, 248, 0.35);
  box-shadow: 0 0 8px rgba(129, 140, 248, 0.15);
}

.gold-tag {
  color: var(--accent-gold);
  background: rgba(255, 213, 153, 0.12);
  border: 1px solid rgba(255, 213, 153, 0.35);
  box-shadow: 0 0 8px rgba(255, 213, 153, 0.15);
}

.emerald-tag,
.green-tag {
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.35);
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.15);
}

.coral-tag,
.rose-tag {
  color: #fb7185;
  background: rgba(251, 113, 133, 0.12);
  border: 1px solid rgba(251, 113, 133, 0.35);
  box-shadow: 0 0 8px rgba(251, 113, 133, 0.15);
}

.telemetry-card-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.telemetry-card-detail {
  font-size: 0.60rem;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.85;
}

.telemetry-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
  backdrop-filter: blur(6px);
  transition: all 0.25s ease;
}

.telemetry-status-pill.running {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.45);
  color: #4ade80;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
}

.telemetry-status-pill.stopped {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.35);
  color: #f87171;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.15);
}

.telemetry-status-pill.starting,
.telemetry-status-pill.transitioning {
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.45);
  color: #facc15;
  box-shadow: 0 0 10px rgba(234, 179, 8, 0.2);
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--text-secondary);
}

.dot.running {
  background-color: var(--status-running);
  box-shadow: 0 0 5px var(--status-running);
}

.dot.stopped {
  background-color: var(--status-stopped);
}

.dot.starting {
  background-color: var(--status-transitioning);
}
</style>
