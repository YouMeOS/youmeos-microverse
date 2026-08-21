<template>
  <div :class="['custom-modal-backdrop', { hidden: !isOpen }]">
    <div class="custom-modal-card glass-panel update-modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-brand-badge update-badge">
            <BaseIcon name="update" :size="18" />
          </div>
          <div class="modal-title-group">
            <h3 class="modal-title">New Release Available</h3>
            <span class="modal-subtitle">YouMeOS Microverse Desktop</span>
          </div>
        </div>
        <button
          type="button"
          class="modal-close-btn"
          title="Dismiss"
          @click="$emit('close')"
        >
          <BaseIcon name="close" :size="16" />
        </button>
      </div>

      <div class="modal-body update-modal-body custom-scrollbar">
        <div class="update-version-banner">
          <div class="update-version-pill">
            <span class="update-version-to">v{{ status.version || 'Latest' }}</span>
          </div>
          <span v-if="status.releaseDate" class="update-date">
            Released {{ new Date(status.releaseDate).toLocaleDateString() }}
          </span>
        </div>

        <div v-if="status.releaseNotes" class="update-notes-container">
          <h4 class="update-notes-heading">What's New in this Release</h4>
          <div class="update-notes-body custom-scrollbar" v-html="formattedReleaseNotes" />
        </div>

        <!-- Download Progress Bar -->
        <div
          v-if="status.state === 'downloading' || status.progress"
          class="update-progress-container"
        >
          <div class="update-progress-header">
            <span class="update-progress-label">Downloading Update...</span>
            <span class="update-progress-pct">
              {{ status.progress ? Math.round(status.progress.percent) : 0 }}%
            </span>
          </div>
          <div class="update-progress-track">
            <div
              class="update-progress-fill"
              :style="{ width: `${status.progress ? status.progress.percent : 0}%` }"
            />
          </div>
          <span class="update-progress-detail">
            Downloading asset bundle...
          </span>
        </div>
      </div>

      <div class="modal-footer update-modal-footer">
        <button
          type="button"
          class="btn-modal-secondary"
          @click="$emit('close')"
        >
          Later
        </button>

        <button
          v-if="status.state === 'downloaded'"
          type="button"
          class="btn-modal-primary btn-update-action"
          @click="$emit('install')"
        >
          <BaseIcon name="refresh" :size="14" />
          <span>Restart &amp; Install</span>
        </button>

        <button
          v-else-if="status.state === 'downloading'"
          type="button"
          class="btn-modal-primary btn-update-action"
          disabled
        >
          <BaseIcon name="spin" :size="14" :spinning="true" />
          <span>Downloading...</span>
        </button>

        <button
          v-else
          type="button"
          class="btn-modal-primary btn-update-action"
          @click="$emit('download')"
        >
          <BaseIcon name="update" :size="14" />
          <span>Download &amp; Install</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import type { AppUpdateStatus } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  status: AppUpdateStatus;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'download'): void;
  (e: 'install'): void;
}>();

const formattedReleaseNotes = computed(() => {
  return props.status.releaseNotes || 'Bug fixes, speed improvements, and security enhancements.';
});
</script>
