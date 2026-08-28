<template>
  <div class="skiptrace-manager">
    <!-- Top HUD Banner -->
    <div class="skiptrace-top-banner glass-panel">
      <div class="banner-title-group">
        <div class="banner-icon-wrap">
          <BaseIcon name="search" :size="20" class="neon-icon" />
        </div>
        <div class="banner-text">
          <div class="banner-heading-row">
            <h3 class="banner-heading">Skip Tracing &amp; Public Records Intelligence</h3>
            <span class="status-live-badge">
              <span class="status-dot-pulse" />
              <span>OSINT Mesh Live</span>
            </span>
          </div>
          <p class="banner-sub">
            Query across collegiate alumni records, professional licensure boards, USPS CASS standardization, and public deed registries.
          </p>
        </div>
      </div>

      <!-- Quick Search History Pills -->
      <div v-if="recentSearches.length > 0" class="recent-searches-row">
        <span class="recent-label">Recent Queries:</span>
        <button
          v-for="s in recentSearches.slice(0, 3)"
          :key="s.id"
          type="button"
          class="recent-pill"
          :class="{ 'is-active': currentResult && currentResult.id === s.id }"
          @click="selectHistoryItem(s)"
        >
          <BaseIcon name="user" :size="10" />
          <span>{{ s.personal.fullName }}</span>
        </button>
      </div>
    </div>

    <!-- Skip Trace Search Form Molecule -->
    <SkiptraceSearchForm
      :search-params="searchParams"
      :is-searching="isSearching"
      :search-progress-text="searchProgressText"
      :is-valid="isFormValid"
      v-model:certified-compliance="certifiedCompliance"
      @search="executeSearch"
    />

    <!-- Skip Trace Results Area -->
    <div v-if="hasResult && currentResult" class="skiptrace-results-container">
      <!-- 1. Privacy, PII Masking & Audit Trail Controls -->
      <SkiptracePrivacyCard
        :result="currentResult"
        :is-pii-masked="isPiiMasked"
        :audit-logs="auditLogs"
        @toggle-pii-mask="togglePiiMask"
        @export-report="exportReport"
      />

      <!-- 2. Main 2-Column Results Grid: Contacts + Records/Credentials -->
      <div class="results-columns-grid">
        <!-- Left: Verified Contacts, Phones, Emails, Address -->
        <SkiptraceContactCard
          :result="currentResult"
        />

        <!-- Right: Credentials, Public Records, Relatives -->
        <SkiptraceRecordsCard
          :result="currentResult"
        />
      </div>
    </div>

    <!-- Empty State when no query has been run -->
    <div v-else-if="!isSearching" class="skiptrace-empty-state glass-panel">
      <BaseIcon name="search" :size="36" class="empty-icon" />
      <h4 class="empty-title">No Search Results Loaded</h4>
      <p class="empty-text">
        Enter a target name, educational institution, or last known location above to initiate a deep public records skip trace.
      </p>
      <button
        type="button"
        class="btn-primary-action"
        @click="executeSearch"
      >
        <BaseIcon name="sparkle" :size="14" />
        <span>Run Sample Skip Trace Query</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';
import SkiptraceSearchForm from '../molecules/SkiptraceSearchForm.vue';
import SkiptraceContactCard from '../molecules/SkiptraceContactCard.vue';
import SkiptraceRecordsCard from '../molecules/SkiptraceRecordsCard.vue';
import SkiptracePrivacyCard from '../molecules/SkiptracePrivacyCard.vue';
import { useSkiptraceState } from '../../composables/useSkiptraceState';

const {
  isSearching,
  searchProgressText,
  isPiiMasked,
  certifiedCompliance,
  searchParams,
  currentResult,
  recentSearches,
  auditLogs,
  hasResult,
  isFormValid,
  togglePiiMask,
  executeSearch,
  selectHistoryItem,
  exportReport
} = useSkiptraceState();
</script>
