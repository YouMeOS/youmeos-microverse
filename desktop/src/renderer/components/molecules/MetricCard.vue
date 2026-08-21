<template>
  <div :class="['telemetry-card', { verified: isVerified, active: isActive }]" :data-layer="dataLayer">
    <div class="telemetry-card-top">
      <div class="telemetry-card-left">
        <div class="telemetry-icon-box">
          <BaseIcon :name="icon || 'cube'" :size="16" />
        </div>
        <div class="telemetry-name-group">
          <span class="telemetry-name">{{ title }}</span>
          <span class="telemetry-category">{{ category }}</span>
        </div>
      </div>
      <div class="telemetry-status-pill">
        <StatusDot :status="status" />
        <span>{{ statusText || (isVerified ? 'Active' : 'Unverified') }}</span>
      </div>
    </div>
    <div v-if="detail" class="telemetry-card-detail">
      <span class="detail-label">{{ detailLabel || 'Status' }}:</span>
      <span class="detail-val">{{ detail }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';
import StatusDot from '../atoms/StatusDot.vue';

withDefaults(
  defineProps<{
    title: string;
    category?: string;
    icon?: string;
    status?: string;
    statusText?: string;
    isVerified?: boolean;
    isActive?: boolean;
    detail?: string;
    detailLabel?: string;
    dataLayer?: string;
  }>(),
  {
    category: 'Kernel Layer',
    icon: 'cube',
    status: 'stopped',
    statusText: '',
    isVerified: false,
    isActive: false,
    detail: '',
    detailLabel: 'Status',
    dataLayer: ''
  }
);
</script>
