<template>
  <div class="onboarding-step-bar">
    <div
      v-for="(step, idx) in steps"
      :key="step.id"
      class="step-item"
      :class="{
        'is-active': currentStep === idx + 1,
        'is-completed': currentStep > idx + 1
      }"
      @click="handleStepClick(idx + 1)"
    >
      <div class="step-indicator">
        <span v-if="currentStep > idx + 1" class="step-check">
          <BaseIcon name="check" :size="12" />
        </span>
        <span v-else class="step-number">{{ idx + 1 }}</span>
      </div>

      <div class="step-text-group">
        <span class="step-title">{{ step.title }}</span>
        <span class="step-subtitle">{{ step.subtitle }}</span>
      </div>

      <div v-if="idx < steps.length - 1" class="step-connector" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';

const props = defineProps<{
  currentStep: number;
}>();

const emit = defineEmits<{
  (e: 'selectStep', step: number): void;
}>();

const steps = [
  { id: 'profile', title: 'Profile Setup', subtitle: 'Identity & Handle' },
  { id: 'credentials', title: 'Credentials', subtitle: 'Graduation & License' },
  { id: 'features', title: 'Platform Tour', subtitle: 'Skiptrace & Websites' },
  { id: 'finish', title: 'Launch', subtitle: 'Ready to Explore' }
];

const handleStepClick = (step: number) => {
  if (step <= props.currentStep) {
    emit('selectStep', step);
  }
};
</script>
