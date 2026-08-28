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
