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

const layerTagMap: Record<string, { tag: string; tagClass: string; defaultTitle: string }> = {
  bedrock: { tag: 'Foundation', tagClass: 'blue-tag', defaultTitle: 'Blackbox Bedrock' },
  database: { tag: 'Storage', tagClass: 'purple-tag', defaultTitle: 'SQLite Database' },
  core: { tag: 'Kernel', tagClass: 'gold-tag', defaultTitle: 'Headless Core' },
  server: { tag: 'Gateway', tagClass: 'emerald-tag', defaultTitle: 'Web Server' },
  network: { tag: 'Mesh', tagClass: 'coral-tag', defaultTitle: 'Private Node (mDNS)' },
  portal: { tag: 'Portal', tagClass: 'cyan-tag', defaultTitle: 'Event Horizon' },
  compass: { tag: 'Systems', tagClass: 'neon-tag', defaultTitle: 'My COMPASS' }
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
  if (props.title) return props.title;
  const match = layerTagMap[normalizedId.value];
  return match ? match.defaultTitle : 'Stack Component';
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
