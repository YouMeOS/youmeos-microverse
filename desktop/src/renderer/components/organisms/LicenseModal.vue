<template>
  <div :class="['custom-modal-backdrop', { hidden: !isOpen }]">
    <div class="hud-modal-container">
      <!-- Top Row Panel: Dedicated License Key Manager -->
      <LicenseKeyPanel
        :active-tier="effectiveActiveTier"
        :active-key="effectiveActiveKey"
        :active-tier-data="effectiveActiveTierData"
        :active-tier-color="effectiveActiveTierColor"
        :input-key="inputKey"
        :feedback-msg="feedbackMsg"
        @close="$emit('close')"
        @update:input-key="$emit('update:inputKey', $event)"
        @activate-key="$emit('activateKey')"
      />

      <!-- Bottom Row Panel: Dedicated Upsell & Upgrade Store Showcase -->
      <UpsellStorePanel
        :selected-tier="effectiveSelectedTier"
        :selected-tier-data="effectiveSelectedTierData"
        :selected-tier-color="effectiveSelectedTierColor"
        :tiers="tiers"
        :is-checking-out="isCheckingOut"
        :active-spark-filter="activeSparkFilter"
        :is-sparks-collapsed="isSparksCollapsed"
        :filtered-sparks="filteredSparks"
        :unlocked-count="unlockedCount"
        @close="$emit('close')"
        @select-tier="$emit('selectTier', $event)"
        @stripe-checkout="$emit('stripeCheckout')"
        @toggle-sparks-collapse="$emit('toggleSparksCollapse')"
        @set-spark-filter="$emit('setSparkFilter', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LicenseKeyPanel from '../molecules/LicenseKeyPanel.vue';
import UpsellStorePanel from '../molecules/UpsellStorePanel.vue';
import type { TierInfo, CompassPluginData } from '../../license-cloud-manager';

const props = defineProps<{
  isOpen: boolean;
  activeTier?: string;
  activeKey?: string;
  activeTierData?: TierInfo;
  activeTierColor?: { hex: string; three: number };
  selectedTier?: string;
  selectedTierData?: TierInfo;
  selectedTierColor?: { hex: string; three: number };
  currentTier?: string;
  currentKey?: string;
  currentTierData?: TierInfo;
  currentTierColor?: { hex: string; three: number };
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

const effectiveActiveTier = computed(() => {
  return props.activeTier || props.currentTier || 'black';
});

const effectiveActiveKey = computed(() => {
  return props.activeKey || props.currentKey || 'BLCK-SOVEREIGN-LOCAL-2026';
});

const effectiveActiveTierData = computed<TierInfo>(() => {
  return props.activeTierData || props.currentTierData || props.selectedTierData!;
});

const effectiveActiveTierColor = computed(() => {
  return props.activeTierColor || props.currentTierColor || props.selectedTierColor!;
});

const effectiveSelectedTier = computed(() => {
  return props.selectedTier || props.currentTier || props.activeTier || 'black';
});

const effectiveSelectedTierData = computed<TierInfo>(() => {
  return props.selectedTierData || props.currentTierData || props.activeTierData!;
});

const effectiveSelectedTierColor = computed(() => {
  return props.selectedTierColor || props.currentTierColor || props.activeTierColor!;
});
</script>
