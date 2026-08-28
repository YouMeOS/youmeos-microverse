<template>
  <div class="skiptrace-contact-card glass-panel">
    <div class="card-section-header">
      <div class="section-title-group">
        <BaseIcon name="phone" :size="16" />
        <h4 class="section-title">Verified Contact Vectors &amp; Location</h4>
      </div>
      <span class="badge-confidence">High Confidence (97%)</span>
    </div>

    <!-- Current Physical Address Box -->
    <div class="address-highlight-box">
      <div class="address-icon-wrap">
        <BaseIcon name="map-pin" :size="20" />
      </div>
      <div class="address-info-block">
        <div class="address-status-row">
          <span class="address-badge-primary">Current Residence</span>
          <span class="address-cass-badge">
            <BaseIcon name="check" :size="10" />
            <span>{{ result.currentAddress.deliveryPoint }}</span>
          </span>
          <span class="address-tenure-badge">{{ result.currentAddress.datesLived }}</span>
        </div>
        <h3 class="current-address-text">
          {{ result.currentAddress.street }}, {{ result.currentAddress.city }}, {{ result.currentAddress.state }} {{ result.currentAddress.zip }}
        </h3>
        <p class="address-sub-details">
          County: {{ result.currentAddress.county }} &bull; Occupancy: {{ result.currentAddress.occupancy }}
        </p>
      </div>
      <button
        type="button"
        class="btn-copy-mini"
        title="Copy Address"
        @click="copyText(`${result.currentAddress.street}, ${result.currentAddress.city}, ${result.currentAddress.state} ${result.currentAddress.zip}`)"
      >
        <BaseIcon name="copy" :size="14" />
      </button>
    </div>

    <!-- 2-Column Contact Vector Grid: Phones & Emails -->
    <div class="contacts-grid-2">
      <!-- Phones List -->
      <div class="contact-sub-card">
        <div class="sub-card-header">
          <div class="sub-title-group">
            <BaseIcon name="phone" :size="14" />
            <h5 class="sub-title">Phone Numbers ({{ result.phones.length }})</h5>
          </div>
        </div>

        <div class="contact-items-list">
          <div
            v-for="(phone, idx) in result.phones"
            :key="idx"
            class="contact-item-row"
          >
            <div class="contact-main">
              <span class="contact-value font-mono">{{ phone.number }}</span>
              <div class="contact-tags-row">
                <span class="phone-type-tag">{{ phone.type }}</span>
                <span class="phone-carrier-tag">{{ phone.carrier }}</span>
                <span
                  class="phone-status-tag"
                  :class="phone.status === 'Active' ? 'is-active' : 'is-inactive'"
                >
                  {{ phone.status }}
                </span>
                <span class="phone-dnc-tag">{{ phone.dnc }}</span>
              </div>
            </div>
            <button
              type="button"
              class="btn-copy-mini"
              title="Copy Phone"
              @click="copyText(phone.number)"
            >
              <BaseIcon name="copy" :size="12" />
            </button>
          </div>
        </div>
      </div>

      <!-- Emails List -->
      <div class="contact-sub-card">
        <div class="sub-card-header">
          <div class="sub-title-group">
            <BaseIcon name="mail" :size="14" />
            <h5 class="sub-title">Email Addresses ({{ result.emails.length }})</h5>
          </div>
        </div>

        <div class="contact-items-list">
          <div
            v-for="(email, idx) in result.emails"
            :key="idx"
            class="contact-item-row"
          >
            <div class="contact-main">
              <span class="contact-value font-mono">{{ email.email }}</span>
              <div class="contact-tags-row">
                <span class="email-type-tag">{{ email.type }}</span>
                <span class="email-deliverability-tag">
                  <BaseIcon name="check" :size="10" />
                  <span>{{ email.deliverability }}</span>
                </span>
                <span class="email-seen-tag">Seen: {{ email.lastSeen }}</span>
              </div>
            </div>
            <button
              type="button"
              class="btn-copy-mini"
              title="Copy Email"
              @click="copyText(email.email)"
            >
              <BaseIcon name="copy" :size="12" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Historical Address Timeline -->
    <div v-if="result.addressHistory && result.addressHistory.length > 0" class="history-timeline-section">
      <h5 class="history-section-title">
        <BaseIcon name="location" :size="12" />
        <span>Prior Address History</span>
      </h5>
      <div class="history-items-row">
        <div
          v-for="(hist, idx) in result.addressHistory"
          :key="idx"
          class="history-item-badge"
        >
          <span class="hist-dates">{{ hist.datesLived }}</span>
          <span class="hist-address">{{ hist.street }}, {{ hist.city }}, {{ hist.state }} {{ hist.zip }}</span>
          <span class="hist-occupancy">({{ hist.occupancy }})</span>
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

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {}
};
</script>
