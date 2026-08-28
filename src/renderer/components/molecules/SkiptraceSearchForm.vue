<template>
  <form class="skiptrace-search-form glass-panel" @submit.prevent="$emit('search')">
    <div class="form-header">
      <div class="form-title-group">
        <BaseIcon name="search" :size="16" />
        <h3 class="form-title">Skip Trace Intelligence Query</h3>
      </div>
      <div class="mode-toggle-group">
        <button
          type="button"
          class="btn-mode-toggle"
          :class="{ 'is-active': searchParams.searchMode === 'standard' }"
          @click="searchParams.searchMode = 'standard'"
        >
          Standard
        </button>
        <button
          type="button"
          class="btn-mode-toggle btn-mode-deep"
          :class="{ 'is-active': searchParams.searchMode === 'deep_scan' }"
          @click="searchParams.searchMode = 'deep_scan'"
        >
          <BaseIcon name="sparkle" :size="12" />
          <span>Deep Scan</span>
        </button>
      </div>
    </div>

    <!-- Primary Row: Target Name & Educational Institution -->
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label" for="target-name">
          <span>Target Full Name *</span>
          <span class="label-hint">First, Middle, Last or Alias</span>
        </label>
        <div class="input-with-icon">
          <BaseIcon name="user" :size="14" class="input-icon" />
          <input
            id="target-name"
            v-model="searchParams.targetName"
            type="text"
            class="form-input"
            placeholder="Enter target full name"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="target-institution">
          <span>Educational Institution</span>
          <span class="label-hint">University / College Alumni Match</span>
        </label>
        <div class="input-with-icon">
          <BaseIcon name="graduation-cap" :size="14" class="input-icon" />
          <input
            id="target-institution"
            v-model="searchParams.institution"
            type="text"
            class="form-input"
            placeholder="Enter college or university name"
          />
        </div>
      </div>
    </div>

    <!-- Secondary Row: Last Known Address, City, State, Zip, Grad Year -->
    <div class="form-grid-4">
      <div class="form-group span-2">
        <label class="form-label" for="last-address">
          <span>Last Known Street Address</span>
        </label>
        <div class="input-with-icon">
          <BaseIcon name="map-pin" :size="14" class="input-icon" />
          <input
            id="last-address"
            v-model="searchParams.lastAddress"
            type="text"
            class="form-input"
            placeholder="Enter street address"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="city">
          <span>City</span>
        </label>
        <input
          id="city"
          v-model="searchParams.city"
          type="text"
          class="form-input"
          placeholder="Enter city"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="state">
          <span>State &amp; ZIP</span>
        </label>
        <div class="state-zip-row">
          <input
            id="state"
            v-model="searchParams.state"
            type="text"
            class="form-input input-state"
            placeholder="State"
            maxlength="2"
          />
          <input
            id="zip"
            v-model="searchParams.zip"
            type="text"
            class="form-input input-zip"
            placeholder="ZIP"
            maxlength="10"
          />
        </div>
      </div>
    </div>

    <!-- Third Row: Permissible Purpose Compliance & Grad Year -->
    <div class="form-grid-3">
      <div class="form-group span-2">
        <label class="form-label" for="permissible-purpose">
          <span>Permissible Purpose (FCRA / DPPA Compliance) *</span>
          <span class="label-hint">Legal requirement for public records retrieval</span>
        </label>
        <div class="input-with-icon">
          <BaseIcon name="shield-check" :size="14" class="input-icon" />
          <select
            id="permissible-purpose"
            v-model="searchParams.permissiblePurpose"
            class="form-select"
            required
          >
            <option value="legal_due_diligence">Legal Due Diligence &amp; Litigation Preparation</option>
            <option value="debt_recovery">Debt Recovery &amp; Asset Identification</option>
            <option value="alumni_verification">Alumni &amp; Professional Credential Verification</option>
            <option value="fraud_prevention">Fraud Prevention &amp; Identity Verification</option>
            <option value="location_services">Witness &amp; Heir Location Services</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="grad-year">
          <span>Graduation Year</span>
          <span class="label-hint">Approximate</span>
        </label>
        <input
          id="grad-year"
          v-model="searchParams.gradYear"
          type="text"
          class="form-input"
          placeholder="YYYY"
          maxlength="4"
        />
      </div>
    </div>

    <!-- Compliance Footer Bar & Search Trigger -->
    <div class="form-footer-bar">
      <label class="compliance-checkbox-label">
        <input
          v-model="certifiedCompliance"
          type="checkbox"
          class="compliance-checkbox"
          required
        />
        <span>I certify this search complies with DPPA, GLBA, and FCRA standards and will be recorded in the local node audit trail.</span>
      </label>

      <button
        type="submit"
        class="btn-primary-action btn-skiptrace-submit"
        :disabled="isSearching || !isValid"
      >
        <BaseIcon
          v-if="isSearching"
          name="spin"
          :size="14"
          :spinning="true"
        />
        <BaseIcon
          v-else
          name="search"
          :size="14"
        />
        <span>{{ isSearching ? 'Scanning Registries...' : 'Run Skip Trace' }}</span>
      </button>
    </div>

    <div v-if="searchProgressText" class="search-progress-hud">
      <BaseIcon name="spin" :size="12" :spinning="true" />
      <span>{{ searchProgressText }}</span>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import type { SkiptraceSearchParams } from '../../composables/useSkiptraceState';

const props = defineProps<{
  searchParams: SkiptraceSearchParams;
  isSearching: boolean;
  searchProgressText?: string;
  isValid: boolean;
}>();

const certifiedCompliance = defineModel<boolean>('certifiedCompliance', { default: true });

defineEmits<{
  (e: 'search'): void;
}>();
</script>
