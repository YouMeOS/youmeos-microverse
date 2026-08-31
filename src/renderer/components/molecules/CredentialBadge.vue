<template>
  <div
    class="credential-badge-card glass-panel"
    :class="[
      `credential-${type}`,
      `status-${status}`
    ]"
  >
    <div class="credential-header">
      <div class="credential-icon-wrap">
        <BaseIcon
          v-if="type === 'education'"
          name="graduation-cap"
          :size="18"
        />
        <BaseIcon
          v-else
          name="badge-check"
          :size="18"
        />
      </div>

      <div class="credential-title-block">
        <span class="credential-type-label">{{ type === 'education' ? 'Academic Graduation' : 'Professional License' }}</span>
        <h4 class="credential-issuer">{{ issuer || 'Pending Configuration' }}</h4>
      </div>

      <div class="credential-status-tag" :class="`status-${status}`">
        <BaseIcon
          v-if="status === 'verified'"
          name="check"
          :size="12"
        />
        <BaseIcon
          v-else-if="status === 'verifying'"
          name="spin"
          :size="12"
          :spinning="true"
        />
        <BaseIcon
          v-else
          name="shield"
          :size="12"
        />
        <span>{{ formatStatus(status) }}</span>
      </div>
    </div>

    <div class="credential-body">
      <div class="credential-field">
        <span class="field-label">{{ type === 'education' ? 'Degree & Major' : 'License Type & ID' }}</span>
        <span class="field-value">{{ detail || 'Not specified' }}</span>
      </div>

      <div class="credential-meta-row">
        <div class="credential-meta-item">
          <span class="meta-label">{{ type === 'education' ? 'Class Year' : 'Exp Date' }}</span>
          <span class="meta-val">{{ dateValue || '2028' }}</span>
        </div>

        <div v-if="stamp" class="credential-meta-item">
          <span class="meta-label">Verification Seal</span>
          <span class="meta-stamp font-mono">{{ stamp }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';

defineProps<{
  type: 'education' | 'license';
  issuer: string;
  detail: string;
  dateValue?: string;
  status: 'unverified' | 'verifying' | 'verified' | 'failed';
  stamp?: string;
}>();

const formatStatus = (s: string) => {
  if (s === 'verified') return 'Verified Active';
  if (s === 'verifying') return 'Checking Registry...';
  if (s === 'failed') return 'Verification Failed';
  return 'Unverified';
};
</script>

<style scoped>
.credential-badge-card {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: var(--radius-md);
  background: rgba(14, 22, 38, 0.6);
  border: 1px solid var(--border-glass);
  transition: all 0.25s ease;
}

.credential-badge-card.status-verified {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(12, 28, 22, 0.65);
}

.credential-badge-card.status-verifying {
  border-color: rgba(234, 179, 8, 0.4);
}

.credential-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.credential-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: rgba(98, 201, 255, 0.12);
  border: 1px solid var(--border-glass-bright);
  color: var(--accent-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.credential-title-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.credential-type-label {
  font-size: 0.65rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.credential-issuer {
  font-size: 0.84rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.credential-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass-subtle);
  color: var(--text-secondary);
}

.credential-status-tag.status-verified {
  background: rgba(34, 197, 94, 0.15);
  border-color: var(--status-running);
  color: #4ade80;
}

.credential-status-tag.status-verifying {
  background: rgba(234, 179, 8, 0.15);
  border-color: var(--status-transitioning);
  color: #facc15;
}

.credential-status-tag.status-failed {
  background: rgba(239, 68, 68, 0.15);
  border-color: var(--status-stopped);
  color: #f87171;
}

.credential-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-glass-subtle);
}

.credential-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 600;
}

.field-value {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
}

.credential-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.credential-meta-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.meta-label {
  font-size: 0.60rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.meta-val {
  font-size: 0.72rem;
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.meta-stamp {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  color: var(--accent-cyan);
}
</style>
