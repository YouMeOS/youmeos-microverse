<template>
  <div class="hud-panel upsell-store-panel glass-panel">
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="panel-header-left">
        <div class="panel-icon-badge compass-badge">
          <BaseIcon name="compass" :size="18" />
        </div>
        <div>
          <h3 class="panel-title">COMPASS Sovereignty Store</h3>
          <span class="panel-subtitle">Upgrade tier to unlock mini-apps &amp; superpowers</span>
        </div>
      </div>
      <button
        type="button"
        class="modal-close-btn"
        title="Close Store"
        @click="$emit('close')"
      >
        <BaseIcon name="close" :size="16" />
      </button>
    </div>

    <!-- Panel Body -->
    <div class="panel-body custom-scrollbar">
      <!-- Tier Selector Strip -->
      <div class="store-tier-strip">
        <span class="store-strip-label">Select Tier</span>
        <div class="store-strip-scroll custom-scrollbar">
          <button
            v-for="tier in tiers"
            :key="tier.id"
            type="button"
            :class="['tier-chip', { active: selectedTier === tier.id }]"
            :style="selectedTier === tier.id ? {
              borderColor: tier.color,
              boxShadow: `0 0 14px ${tier.color}40`
            } : {}"
            @click="$emit('selectTier', tier.id)"
          >
            <span class="tier-color-dot" :style="{ background: tier.color }" />
            {{ tier.name }}
          </button>
        </div>
      </div>

      <!-- Selected Tier Showcase Card -->
      <div
        class="store-tier-hero"
        :style="{ borderColor: `${selectedTierColor.hex}50` }"
      >
        <!-- Hero Header: Name, Track, Price -->
        <div class="store-hero-header">
          <div class="store-hero-identity">
            <h4
              class="store-hero-title"
              :style="{ color: selectedTierColor.hex }"
            >
              {{ selectedTierData.name }} Compass
            </h4>
            <span
              class="store-track-badge"
              :style="{
                color: selectedTierColor.hex,
                borderColor: `${selectedTierColor.hex}60`,
                background: `${selectedTierColor.hex}20`
              }"
            >
              {{ selectedTierData.track.toUpperCase() }} TRACK
            </span>
          </div>
          <div class="store-hero-price-box">
            <span class="store-hero-price">{{ selectedTierData.localPrice }}</span>
            <span class="store-price-sub">Local BYO Hardware</span>
          </div>
        </div>

        <!-- 5th Grader Value Explainer Box -->
        <div
          class="tier-value-box"
          :style="{
            borderColor: `${selectedTierColor.hex}35`,
            background: `linear-gradient(135deg, ${selectedTierColor.hex}12 0%, rgba(10, 16, 28, 0.7) 100%)`
          }"
        >
          <div class="tier-value-header">
            <div class="tier-value-badge" :style="{ color: selectedTierColor.hex }">
              <BaseIcon name="star" :size="13" />
              <span>{{ selectedTierData.headline }}</span>
            </div>
          </div>
          <p class="tier-value-explanation">
            {{ selectedTierData.simpleExplanation }}
          </p>

          <!-- Superpower Bullet Points -->
          <div v-if="hasSuperpowers" class="tier-superpowers-list">
            <div
              v-for="(power, idx) in selectedTierData.superpowers"
              :key="idx"
              class="tier-superpower-item"
            >
              <BaseIcon name="check" :size="13" class="superpower-check" />
              <span>{{ power }}</span>
            </div>
          </div>
        </div>

        <!-- BIG High-Converting CTA Button -->
        <div class="store-cta-container">
          <button
            type="button"
            class="btn-giant-stripe-cta"
            :disabled="isCheckingOut"
            :style="{
              boxShadow: `0 0 24px ${selectedTierColor.hex}40, 0 4px 16px rgba(0, 0, 0, 0.4)`
            }"
            title="Open secure Stripe checkout"
            @click="$emit('stripeCheckout')"
          >
            <div class="cta-inner-content">
              <BaseIcon :name="isCheckingOut ? 'spin' : 'card'" :size="18" :spinning="isCheckingOut" />
              <span class="cta-primary-text">
                {{ isCheckingOut ? 'Opening Checkout...' : `Upgrade to ${selectedTierData.name} Compass - ${selectedTierData.localPrice}` }}
              </span>
            </div>
          </button>
          <div class="cta-reassurance-row">
            <span>Instant key delivery</span>
            <span class="reassurance-dot">•</span>
            <span>Local BYO Hardware</span>
            <span class="reassurance-dot">•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>

      <!-- Collapsible Included Software Suite -->
      <div class="store-sparks-section">
        <button
          type="button"
          class="sparks-collapse-toggle"
          @click="$emit('toggleSparksCollapse')"
        >
          <div class="sparks-toggle-left">
            <span class="section-label">Included Software Suite</span>
            <span class="sparks-count-badge">{{ unlockedCount }} Unlocked for {{ selectedTierData.name }}</span>
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import type { TierInfo, CompassPluginData } from '../../license-cloud-manager';

const props = defineProps<{
  selectedTier: string;
  selectedTierData: TierInfo;
  selectedTierColor: { hex: string; three: number };
  tiers: Array<{ id: string; name: string; color: string }>;
  isCheckingOut: boolean;
  activeSparkFilter: string;
  isSparksCollapsed: boolean;
  filteredSparks: Array<CompassPluginData & { isUnlocked: boolean }>;
  unlockedCount: number;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'selectTier', tierId: string): void;
  (e: 'stripeCheckout'): void;
  (e: 'toggleSparksCollapse'): void;
  (e: 'setSparkFilter', filter: 'all' | 'spark' | 'portal'): void;
}>();

const hasSuperpowers = computed(() => {
  return Boolean(props.selectedTierData.superpowers && props.selectedTierData.superpowers.length > 0);
});
</script>
