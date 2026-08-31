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
  { id: 'features', title: 'Platform Tour', subtitle: 'Platform & Websites' },
  { id: 'finish', title: 'Launch', subtitle: 'Ready to Explore' }
];

const handleStepClick = (step: number) => {
  if (step <= props.currentStep) {
    emit('selectStep', step);
  }
};
</script>

<style scoped>
.onboarding-step-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: rgba(4, 7, 14, 0.45);
  border-bottom: 1px solid var(--border-glass-subtle);
  position: relative;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  opacity: 0.55;
  transition: all 0.25s ease;
  position: relative;
}

.step-item.is-active {
  opacity: 1;
}

.step-item.is-completed {
  opacity: 0.85;
}

.step-indicator {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  transition: all 0.25s ease;
}

.step-item.is-active .step-indicator {
  background: var(--accent-cyan);
  border-color: var(--accent-cyan);
  color: #04070e;
  box-shadow: 0 0 12px var(--accent-cyan-glow);
}

.step-item.is-completed .step-indicator {
  background: rgba(34, 197, 94, 0.2);
  border-color: var(--status-running);
  color: var(--status-running);
}

.step-check {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-number {
  line-height: 1;
}

.step-text-group {
  display: flex;
  flex-direction: column;
}

.step-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.step-subtitle {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.step-connector {
  position: absolute;
  right: -30px;
  width: 20px;
  height: 1px;
  background: var(--border-glass-subtle);
}
</style>
