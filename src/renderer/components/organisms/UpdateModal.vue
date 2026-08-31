<template>
  <div :class="['custom-modal-backdrop', { hidden: !isOpen }]">
    <div class="custom-modal-card glass-panel update-modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div :class="['modal-brand-badge', isUpdateAvailable ? 'update-badge' : 'up-to-date-badge']">
            <BaseIcon
              :name="isUpdateAvailable ? 'update' : 'check'"
              :size="18"
            />
          </div>
          <div class="modal-title-group">
            <h3 class="modal-title">{{ isUpdateAvailable ? 'New Release Available' : 'System Up to Date' }}</h3>
            <span class="modal-subtitle">YouMeOS Microverse Desktop</span>
          </div>
        </div>
        <button
          type="button"
          class="modal-close-btn"
          title="Dismiss"
          @click="$emit('close')"
        >
          <BaseIcon
            name="close"
            :size="16"
          />
        </button>
      </div>

      <div class="modal-body update-modal-body custom-scrollbar">
        <!-- Version Status Banner -->
        <div class="update-version-banner">
          <div :class="['update-version-pill', { 'is-current': !isUpdateAvailable }]">
            <span class="update-version-to">v{{ displayVersion }}</span>
          </div>
          <span
            v-if="status.releaseDate && isUpdateAvailable"
            class="update-date"
          >
            Released {{ new Date(status.releaseDate).toLocaleDateString() }}
          </span>
          <span
            v-else
            class="update-date"
          >
            Verified just now
          </span>
        </div>

        <!-- 1. Release Available Flow -->
        <template v-if="isUpdateAvailable">
          <div
            v-if="status.releaseNotes"
            class="update-notes-container"
          >
            <h4 class="update-notes-heading">What's New in this Release</h4>
            <div
              class="update-notes-body custom-scrollbar"
              v-html="formattedReleaseNotes"
            />
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
        </template>

        <!-- 2. System Up To Date Confirmation Flow -->
        <template v-else>
          <div class="up-to-date-box">
            <div class="up-to-date-icon-wrap">
              <BaseIcon
                name="check"
                :size="24"
              />
            </div>
            <div class="up-to-date-text">
              <span class="up-to-date-headline">Your Microverse is Up to Date</span>
              <p class="up-to-date-desc">
                You are running the latest version of <b>My YouMeOS Microverse Desktop</b>. All local engines, database
                schemas, and Sparks are synchronized.
              </p>
            </div>
          </div>
        </template>
      </div>

      <div class="modal-footer update-modal-footer">
        <template v-if="isUpdateAvailable">
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
            <BaseIcon
              name="refresh"
              :size="14"
            />
            <span>Restart &amp; Install</span>
          </button>

          <button
            v-else-if="status.state === 'downloading'"
            type="button"
            class="btn-modal-primary btn-update-action"
            disabled
          >
            <BaseIcon
              name="spin"
              :size="14"
              :spinning="true"
            />
            <span>Downloading...</span>
          </button>

          <button
            v-else
            type="button"
            class="btn-modal-primary btn-update-action"
            @click="$emit('download')"
          >
            <BaseIcon
              name="update"
              :size="14"
            />
            <span>Download &amp; Install</span>
          </button>
        </template>

        <template v-else>
          <button
            type="button"
            class="btn-modal-primary"
            @click="$emit('close')"
          >
            <BaseIcon
              name="check"
              :size="14"
            />
            <span>Done</span>
          </button>
        </template>
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
  currentVersion?: string;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'download'): void;
  (e: 'install'): void;
}>();

const isUpdateAvailable = computed(() => {
  return props.status.state === 'available' || props.status.state === 'downloading' || props.status.state === 'downloaded';
});

const displayVersion = computed(() => {
  if (isUpdateAvailable.value && props.status.version) {
    return props.status.version;
  }
  return props.currentVersion || props.status.version || '26.8.31';
});

const formattedReleaseNotes = computed(() => {
  return props.status.releaseNotes || 'Bug fixes, speed improvements, and security enhancements.';
});
</script>

<style scoped>
  .update-modal-card {
    max-width: 520px;
    width: 90vw;
    padding: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0, 240, 255, 0.25);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.15);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(98, 201, 255, 0.14);
    background: rgba(14, 22, 38, 0.75);
  }

  .modal-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .modal-brand-badge.update-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: rgba(0, 240, 255, 0.12);
    border: 1px solid rgba(0, 240, 255, 0.4);
    color: var(--neon-cyan);
  }

  .modal-brand-badge.up-to-date-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: #4ade80;
  }

  .modal-title-group {
    display: flex;
    flex-direction: column;
  }

  .modal-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.2px;
  }

  .modal-subtitle {
    font-size: 0.68rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .modal-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .modal-close-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
    color: #fff;
  }

  .update-modal-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .update-version-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: rgba(14, 22, 38, 0.6);
    border: 1px solid var(--border-glass-subtle);
    border-radius: var(--radius-sm);
  }

  .update-version-pill {
    font-size: 0.82rem;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--neon-cyan);
  }

  .update-version-pill.is-current {
    color: #4ade80;
  }

  .update-date {
    font-size: 0.70rem;
    color: var(--text-muted);
  }

  .up-to-date-box {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(4, 7, 13, 0.7);
    border: 1px solid rgba(34, 197, 94, 0.25);
    border-radius: var(--radius-sm);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 0 12px rgba(34, 197, 94, 0.08);
  }

  .up-to-date-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.45);
    color: #4ade80;
    flex-shrink: 0;
    box-shadow: 0 0 16px rgba(34, 197, 94, 0.3);
  }

  .up-to-date-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .up-to-date-headline {
    font-size: 0.88rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.1px;
  }

  .up-to-date-desc {
    font-size: 0.74rem;
    color: var(--text-secondary);
    line-height: 1.45;
    margin: 0;
  }

  .update-notes-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .update-notes-heading {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-secondary);
  }

  .update-notes-body {
    background: rgba(4, 7, 13, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-sm);
    padding: 12px;
    max-height: 180px;
    overflow-y: auto;
    font-size: 0.78rem;
    line-height: 1.5;
    color: var(--text-secondary);
    white-space: pre-wrap;
  }

  .update-progress-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: rgba(0, 240, 255, 0.04);
    border: 1px solid rgba(0, 240, 255, 0.15);
    border-radius: var(--radius-sm);
    padding: 12px;
  }

  .update-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.74rem;
    font-weight: 600;
  }

  .update-progress-label {
    color: var(--neon-cyan);
  }

  .update-progress-pct {
    font-family: var(--font-mono);
    color: #fff;
  }

  .update-progress-track {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    overflow: hidden;
  }

  .update-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00f0ff, #3b82f6);
    border-radius: 9999px;
    transition: width 0.2s ease;
  }

  .update-progress-detail {
    font-size: 0.68rem;
    font-family: var(--font-mono);
    color: var(--text-secondary);
  }

  .update-modal-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(10, 16, 28, 0.85);
  }

  .btn-modal-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: var(--text-secondary);
    padding: 8px 18px;
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-modal-secondary:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.28);
    color: #fff;
  }

  .btn-modal-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    border: 1px solid #38bdf8;
    color: #fff;
    padding: 8px 18px;
    border-radius: var(--radius-sm);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
    transition: all 0.2s ease;
  }

  .btn-modal-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
    transform: translateY(-1px);
  }

  .btn-modal-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
