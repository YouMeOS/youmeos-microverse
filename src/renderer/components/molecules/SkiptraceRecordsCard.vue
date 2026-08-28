<template>
  <div class="skiptrace-records-card glass-panel">
    <div class="card-section-header">
      <div class="section-title-group">
        <BaseIcon name="file-text" :size="16" />
        <h4 class="section-title">Credentials, Public Records &amp; Associations</h4>
      </div>
      <span class="badge-records-count">{{ result.publicRecords.length }} Public Filings Found</span>
    </div>

    <!-- 1. Academic & Professional Credentials Row -->
    <div class="credentials-summary-grid">
      <!-- Education Match -->
      <div class="credential-match-item">
        <div class="match-icon-wrap academic-icon">
          <BaseIcon name="graduation-cap" :size="16" />
        </div>
        <div class="match-info">
          <div class="match-header-row">
            <span class="match-label">Academic Registry Match</span>
            <span class="match-verified-badge">
              <BaseIcon name="check" :size="10" />
              <span>{{ result.education.status }}</span>
            </span>
          </div>
          <h5 class="match-title">{{ result.education.institution }} (Class of {{ result.education.gradYear }})</h5>
          <p class="match-sub">{{ result.education.degree }} &bull; {{ result.education.major }}</p>
        </div>
      </div>

      <!-- Professional License Matches -->
      <div
        v-for="(lic, idx) in result.licenses"
        :key="idx"
        class="credential-match-item"
      >
        <div class="match-icon-wrap license-icon">
          <BaseIcon name="badge-check" :size="16" />
        </div>
        <div class="match-info">
          <div class="match-header-row">
            <span class="match-label">Professional Licensure</span>
            <span class="match-verified-badge is-active">
              <BaseIcon name="check" :size="10" />
              <span>{{ lic.status }}</span>
            </span>
          </div>
          <h5 class="match-title">{{ lic.licenseType }}</h5>
          <p class="match-sub">{{ lic.jurisdiction }} &bull; License #{{ lic.licenseNumber }} (Exp: {{ lic.expDate }})</p>
        </div>
      </div>
    </div>

    <!-- 2. Public Records & Filings List -->
    <div class="public-records-section">
      <h5 class="sub-section-title">
        <BaseIcon name="file-text" :size="14" />
        <span>Public Deeds &amp; Corporate Registrations</span>
      </h5>

      <div class="public-records-list">
        <div
          v-for="rec in result.publicRecords"
          :key="rec.id"
          class="record-item-card"
        >
          <div class="record-badge-col">
            <span class="record-type-badge">{{ rec.type }}</span>
            <span class="record-date font-mono">{{ rec.date }}</span>
          </div>
          <div class="record-details-col">
            <h5 class="record-title">{{ rec.title }}</h5>
            <p class="record-details-text">{{ rec.details }}</p>
            <span class="record-jurisdiction">Filing Authority: {{ rec.jurisdiction }} (Ref: {{ rec.filingNumber }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Kinship & Relatives Graph -->
    <div class="relatives-section">
      <h5 class="sub-section-title">
        <BaseIcon name="user" :size="14" />
        <span>Associated Persons &amp; Kinship Network ({{ result.relatives.length }})</span>
      </h5>

      <div class="relatives-chips-grid">
        <div
          v-for="(rel, idx) in result.relatives"
          :key="idx"
          class="relative-chip"
        >
          <div class="relative-avatar">
            <BaseIcon name="user" :size="12" />
          </div>
          <div class="relative-details">
            <span class="relative-name">{{ rel.name }}</span>
            <span class="relative-meta">{{ rel.relationship }} &bull; Age {{ rel.age }} &bull; {{ rel.location }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';
import type { SkiptraceResult } from '../../composables/useSkiptraceState';

defineProps<{
  result: SkiptraceResult;
}>();
</script>
