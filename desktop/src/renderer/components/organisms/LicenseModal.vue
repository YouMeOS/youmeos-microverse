<template>
  <div :class="['custom-modal-backdrop', { hidden: !isOpen }]">
    <div class="custom-modal-card glass-panel license-modal-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-brand-badge">
            <BaseIcon name="compass" :size="18" />
          </div>
          <div>
            <h2 class="modal-title">My COMPASS License</h2>
            <span class="modal-subtitle">Sovereignty Tier &amp; Spark Suite Activation</span>
          </div>
        </div>
        <button
          type="button"
          class="modal-close-btn"
          title="Close License Manager"
          @click="$emit('close')"
        >
          <BaseIcon name="close" :size="16" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body custom-scrollbar">
        <!-- Active License Hero -->
        <div
          class="license-hero-compact"
          :style="{ borderColor: `${currentTierColor.hex}40` }"
        >
          <div class="license-hero-top">
            <div class="license-hero-identity">
              <span
                class="license-hero-tier"
                :style="{ color: currentTierColor.hex }"
              >
                {{ currentTierData.name }} Compass
              </span>
              <span
                class="license-status-tag"
                :style="{
                  color: currentTierColor.hex,
                  borderColor: `${currentTierColor.hex}60`,
                  background: `${currentTierColor.hex}20`
                }"
              >
                Local BYO Hardware
              </span>
            </div>
            <span class="license-hero-price">{{ currentTierData.localPrice }}</span>
          </div>

          <div class="license-hero-key-row">
            <span class="license-key-label">Active Key:</span>
            <code class="license-key-code">{{ currentKey }}</code>
            <button
              type="button"
              class="btn-hero-stripe-compact"
              :disabled="isCheckingOut"
              title="Open secure Stripe Checkout popup for this tier"
              @click="$emit('stripeCheckout')"
            >
              <BaseIcon name="card" :size="12" />
              <span>{{ isCheckingOut ? 'Opening Checkout...' : `Buy ${currentTierData.localPrice}` }}</span>
            </button>
          </div>
        </div>

        <!-- Tier Selector Strip -->
        <div class="license-tier-strip">
          <span class="tier-strip-label">Select Tier</span>
          <div class="tier-strip-scroll">
            <button
              v-for="tier in tiers"
              :key="tier.id"
              type="button"
              :class="['tier-chip', { active: currentTier === tier.id }]"
              :style="currentTier === tier.id ? {
                borderColor: tier.color,
                boxShadow: `0 0 12px ${tier.color}40`
              } : {}"
              @click="$emit('selectTier', tier.id)"
            >
              <span class="tier-color-dot" :style="{ background: tier.color }" />
              {{ tier.name }}
            </button>
          </div>
        </div>

        <!-- License Key Activation -->
        <div class="license-activate-box">
          <div class="activate-input-wrapper">
            <BaseIcon name="key" :size="14" />
            <input
              type="text"
              :value="inputKey"
              placeholder="Enter License Key (e.g. GOLD-8821-X992-0199)..."
              spellcheck="false"
              autocomplete="off"
              @input="$emit('update:inputKey', ($event.target as HTMLInputElement).value)"
              @keydown.enter="$emit('activateKey')"
            />
            <button
              type="button"
              class="btn-activate-key"
              @click="$emit('activateKey')"
            >
              Activate Key
            </button>
          </div>
          <span
            v-if="feedbackMsg"
            :class="['license-feedback-msg', feedbackMsg.type]"
          >
            {{ feedbackMsg.text }}
          </span>
        </div>

        <!-- Collapsible Included Software -->
        <div class="license-sparks-section">
          <button
            type="button"
            class="sparks-collapse-toggle"
            @click="$emit('toggleSparksCollapse')"
          >
            <div class="sparks-toggle-left">
              <span class="section-label">Included Software</span>
              <span class="sparks-count-badge">{{ unlockedCount }} Sparks Unlocked</span>
            </div>
            <div class="sparks-toggle-right">
              <div class="sparks-filter-tabs" @click.stop>
                <button
                  type="button"
                  :class="['spark-filter-btn', { active: activeSparkFilter === 'all' }]"
                  @click="$emit('setSparkFilter', 'all')"
                >
                  All
                </button>
                <button
                  type="button"
                  :class="['spark-filter-btn', { active: activeSparkFilter === 'spark' }]"
                  @click="$emit('setSparkFilter', 'spark')"
                >
                  Sparks
                </button>
                <button
                  type="button"
                  :class="['spark-filter-btn', { active: activeSparkFilter === 'portal' }]"
                  @click="$emit('setSparkFilter', 'portal')"
                >
                  Portals
                </button>
              </div>
              <BaseIcon
                :name="isSparksCollapsed ? 'chevron-down' : 'chevron-up'"
                :size="16"
                class="sparks-chevron"
              />
            </div>
          </button>

          <div :class="['sparks-grid-wrapper', { collapsed: isSparksCollapsed }]">
            <div class="sparks-grid">
              <div
                v-for="spark in filteredSparks"
                :key="spark.id"
                :class="['spark-item-card', spark.isUnlocked ? 'unlocked' : 'locked']"
              >
                <div class="spark-item-top">
                  <div class="spark-icon-box">
                    <BaseIcon :name="spark.type === 'spark' ? 'spark' : 'portal'" :size="14" />
                  </div>
                  <div class="spark-title-row">
                    <span class="spark-item-name">{{ spark.name }}</span>
                    <span :class="['badge-spark-type', spark.type === 'spark' ? 'badge-spark' : 'badge-portal']">
                      {{ spark.type === 'spark' ? 'SPARK (PWA)' : 'PHP PORTAL' }}
                    </span>
                  </div>
                  <div class="spark-lock-status">
                    <BaseIcon :name="spark.isUnlocked ? 'check' : 'lock'" :size="12" />
                  </div>
                </div>
                <p class="spark-item-tagline">{{ spark.tagline }}</p>
                <p class="spark-item-desc">{{ spark.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';
import type { TierInfo, CompassPluginData } from '../../license-cloud-manager';

defineProps<{
  isOpen: boolean;
  currentTier: string;
  currentKey: string;
  currentTierData: TierInfo;
  currentTierColor: { hex: string; three: number };
  tiers: Array<{ id: string; name: string; color: string }>;
  inputKey: string;
  feedbackMsg: { text: string; type: 'success' | 'error' } | null;
  isCheckingOut: boolean;
  activeSparkFilter: string;
  isSparksCollapsed: boolean;
  filteredSparks: Array<CompassPluginData & { isUnlocked: boolean }>;
  unlockedCount: number;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'selectTier', tierId: string): void;
  (e: 'update:inputKey', val: string): void;
  (e: 'activateKey'): void;
  (e: 'stripeCheckout'): void;
  (e: 'toggleSparksCollapse'): void;
  (e: 'setSparkFilter', filter: 'all' | 'spark' | 'portal'): void;
}>();
</script>
