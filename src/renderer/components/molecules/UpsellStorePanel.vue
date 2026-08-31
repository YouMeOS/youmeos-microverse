<template>
  <div class="hud-panel upsell-store-panel glass-panel">
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="panel-header-left">
        <div class="panel-icon-badge compass-badge">
          <BaseIcon name="compass" :size="18" />
        </div>
        <div>
          <h3 class="panel-title">YouMeOS COMPASS Store</h3>
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

<style scoped>
.hud-panel {
  background: rgba(10, 16, 28, 0.94);
  border: 1px solid var(--border-glass-bright);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(98, 201, 255, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.upsell-store-panel {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(98, 201, 255, 0.14);
  background: rgba(14, 22, 38, 0.75);
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.panel-icon-badge.compass-badge {
  background: rgba(0, 242, 254, 0.12);
  border: 1px solid rgba(0, 242, 254, 0.4);
  color: #00f2fe;
  box-shadow: 0 0 14px rgba(0, 242, 254, 0.25);
}

.panel-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: 0.3px;
}

.panel-subtitle {
  font-size: 0.64rem;
  color: var(--text-secondary);
  display: block;
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

.panel-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.store-tier-strip {
  display: flex;
  align-items: center;
  gap: 8px;
}

.store-strip-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.store-strip-scroll {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  flex: 1;
  padding: 2px 0;
}

.tier-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: rgba(14, 22, 38, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.tier-chip:hover {
  background: rgba(22, 34, 58, 0.85);
  border-color: rgba(98, 201, 255, 0.3);
  color: #fff;
}

.tier-chip.active {
  background: rgba(22, 34, 58, 0.95);
  color: #fff;
}

.tier-color-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.store-tier-hero {
  background: rgba(14, 22, 38, 0.7);
  border: 1px solid rgba(0, 242, 254, 0.25);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.25s ease;
}

.store-hero-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.store-hero-identity {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.store-hero-title {
  font-size: 1.12rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: 0.3px;
}

.store-track-badge {
  font-size: 0.60rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid;
}

.store-hero-price-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.store-hero-price {
  font-size: 1.15rem;
  font-weight: 900;
  color: #ffd599;
  font-family: var(--font-mono);
}

.store-price-sub {
  font-size: 0.58rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.tier-value-box {
  border: 1px solid;
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.25s ease;
}

.tier-value-header {
  display: flex;
  align-items: center;
}

.tier-value-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.80rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tier-value-explanation {
  font-size: 0.78rem;
  color: #e2e8f0;
  line-height: 1.45;
  margin: 0;
  font-weight: 500;
}

.tier-superpowers-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.tier-superpower-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.70rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

.superpower-check {
  color: #4ade80;
  flex-shrink: 0;
  margin-top: 2px;
}

.store-cta-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  padding-top: 4px;
}

.btn-giant-stripe-cta {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #635bff 0%, #4338ca 100%);
  border: 1px solid #818cf8;
  color: #fff;
  padding: 13px 20px;
  border-radius: var(--radius-md);
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
}

.btn-giant-stripe-cta:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(99, 91, 255, 0.7), 0 8px 24px rgba(0, 0, 0, 0.5) !important;
}

.btn-giant-stripe-cta:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cta-inner-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cta-primary-text {
  letter-spacing: 0.3px;
}

.cta-reassurance-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.62rem;
  color: var(--text-muted);
  font-weight: 600;
}

.reassurance-dot {
  opacity: 0.4;
}

.store-sparks-section {
  display: flex;
  flex-direction: column;
}

.sparks-collapse-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  background: transparent;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  color: inherit;
  width: 100%;
  text-align: left;
}

.sparks-toggle-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sparks-toggle-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sparks-chevron {
  color: var(--text-muted);
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sparks-count-badge {
  font-size: 0.6rem;
  font-weight: 700;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: var(--status-running);
  padding: 1px 6px;
  border-radius: 4px;
}

.sparks-filter-tabs {
  display: flex;
  align-items: center;
  gap: 3px;
}

.spark-filter-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 0.64rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.spark-filter-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.spark-filter-btn.active {
  color: #fff;
  background: rgba(98, 201, 255, 0.15);
  border-color: rgba(98, 201, 255, 0.3);
}

.sparks-grid-wrapper {
  max-height: 500px;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.25s ease;
  opacity: 1;
}

.sparks-grid-wrapper.collapsed {
  max-height: 0;
  opacity: 0;
}

.sparks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  padding-top: 8px;
}

@media (max-width: 650px) {
  .sparks-grid {
    grid-template-columns: 1fr;
  }
}

.spark-item-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  background: rgba(14, 22, 38, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.spark-item-card:hover {
  background: rgba(22, 34, 58, 0.7);
  border-color: rgba(98, 201, 255, 0.25);
}

.spark-item-card.locked {
  opacity: 0.45;
  filter: grayscale(35%);
}

.spark-item-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spark-icon-box {
  color: var(--accent-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.spark-title-row {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.spark-item-name {
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-spark-type {
  font-size: 0.52rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.badge-spark {
  background: rgba(0, 242, 254, 0.12);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.3);
}

.badge-portal {
  background: rgba(168, 85, 247, 0.12);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.spark-lock-status {
  margin-left: auto;
  color: #4ade80;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.spark-item-card.locked .spark-lock-status {
  color: var(--text-muted);
}

.spark-item-tagline {
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--accent-cyan);
  margin: 0;
  line-height: 1.2;
}

.spark-item-desc {
  font-size: 0.60rem;
  color: var(--text-secondary);
  line-height: 1.3;
  margin: 0;
}
</style>
