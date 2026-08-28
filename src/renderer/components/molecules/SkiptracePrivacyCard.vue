<template>
  <div class="skiptrace-privacy-card glass-panel">
    <div class="privacy-header">
      <div class="privacy-title-group">
        <BaseIcon name="shield-check" :size="16" />
        <h4 class="privacy-title">Data Privacy, Accuracy &amp; Audit Trail</h4>
      </div>

      <div class="privacy-actions-row">
        <!-- PII Redaction Mask Toggle -->
        <button
          type="button"
          class="btn-privacy-toggle"
          :class="{ 'is-masked': isPiiMasked }"
          @click="$emit('togglePiiMask')"
        >
          <BaseIcon :name="isPiiMasked ? 'eye-slash' : 'eye'" :size="14" />
          <span>{{ isPiiMasked ? 'PII Masking Active' : 'PII Unmasked (Audited)' }}</span>
        </button>

        <!-- Export Buttons -->
        <button
          type="button"
          class="btn-export-action"
          @click="$emit('exportReport', 'txt')"
        >
          <BaseIcon name="download" :size="14" />
          <span>Export Summary</span>
        </button>
        <button
          type="button"
          class="btn-export-action"
          @click="$emit('exportReport', 'json')"
        >
          <BaseIcon name="download" :size="14" />
          <span>Export JSON</span>
        </button>
      </div>
    </div>

    <!-- Identity & PII Summary Strip -->
    <div v-if="result" class="pii-summary-strip">
      <div class="pii-item">
        <span class="pii-label">Primary Entity</span>
        <span class="pii-val">{{ result.personal.fullName }}</span>
      </div>
      <div class="pii-item">
        <span class="pii-label">Known Aliases</span>
        <span class="pii-val">{{ result.personal.aliases.join(', ') || 'None' }}</span>
      </div>
      <div class="pii-item">
        <span class="pii-label">Date of Birth / Age</span>
        <span class="pii-val font-mono">{{ isPiiMasked ? '08/**/1992' : result.personal.dob }} (Age {{ result.personal.age }})</span>
      </div>
      <div class="pii-item">
        <span class="pii-label">Social Security</span>
        <span class="pii-val font-mono">{{ isPiiMasked ? '***-**-8492' : '492-18-8492' }}</span>
      </div>
      <div class="pii-item">
        <span class="pii-label">Accuracy Rating</span>
        <span class="pii-val accuracy-grade font-mono">{{ result.accuracyGrade }} ({{ result.confidenceScore }}%)</span>
      </div>
    </div>

    <!-- Immutable Audit Trail Accordion / Log Box -->
    <div class="audit-log-box">
      <div class="audit-header">
        <span class="audit-title">Local Node Cryptographic Audit Trail (FCRA / DPPA Compliant)</span>
        <span class="audit-count">{{ auditLogs.length }} Verified Queries</span>
      </div>

      <div class="audit-logs-list custom-scrollbar">
        <div
          v-for="log in auditLogs"
          :key="log.id"
          class="audit-row font-mono"
        >
          <span class="audit-time">{{ log.timestamp }}</span>
          <span class="audit-operator">[{{ log.operator }}]</span>
          <span class="audit-purpose">{{ log.purpose }}</span>
          <span class="audit-target">{{ log.targetName }}</span>
          <span class="audit-hash">{{ log.queryHash }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';
import type { SkiptraceResult, AuditLogEntry } from '../../composables/useSkiptraceState';

defineProps<{
  result: SkiptraceResult | null;
  isPiiMasked: boolean;
  auditLogs: AuditLogEntry[];
}>();

defineEmits<{
  (e: 'togglePiiMask'): void;
  (e: 'exportReport', format: 'txt' | 'json'): void;
}>();
</script>
