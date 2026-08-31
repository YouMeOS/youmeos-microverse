<template>
  <div class="port-select-wrapper">
    <div class="port-icon-prefix">
      <BaseIcon
        name="port"
        :size="11"
      />
    </div>
    <select
      :value="currentSelectValue"
      class="port-select"
      title="Click to Switch Gateway Port"
      :disabled="disabled"
      @change="handleSelectChange"
    >
      <option
        v-for="opt in portOptions"
        :key="opt.value"
        :value="opt.value"
      >
        :{{ opt.value }} {{ opt.label }}
      </option>
      <option value="custom">:?</option>
    </select>
    <BaseIcon
      name="chevron-down"
      :size="9"
      class="select-chevron"
    />

    <!-- Custom Port Input Popover -->
    <div
      v-if="isCustomPromptOpen"
      class="custom-port-popover glass-panel"
    >
      <div class="custom-popover-header">
        <span class="custom-popover-title">Custom Port</span>
        <button
          type="button"
          class="btn-popover-close"
          @click="cancelCustom"
        >
          &times;
        </button>
      </div>
      <div class="custom-input-row">
        <input
          ref="customInputRef"
          v-model.number="customPortInput"
          type="number"
          min="1"
          max="65535"
          class="custom-port-input"
          placeholder="8080"
          @keyup.enter="handleApplyCustom"
          @keyup.esc="cancelCustom"
        />
        <button
          type="button"
          class="btn-apply-custom"
          :disabled="!customPortInput || customPortInput === modelValue"
          @click="handleApplyCustom"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';

// 1. Props & Emits
const props = defineProps<{
  modelValue?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
  (e: 'change', value: number): void;
}>();

// 2. Reactive Primitives
const isCustomPromptOpen = ref<boolean>(false);
const customPortInput = ref<number>(props.modelValue || 80);
const customInputRef = ref<HTMLInputElement | null>(null);

const standardPresets = [
  { value: 80, label: '' },
  { value: 8080, label: '' },
  { value: 8088, label: '' },
  { value: 3000, label: '' },
  { value: 8888, label: '' }
];

// 3. Computed State
const portOptions = computed(() => {
  const current = props.modelValue || 80;
  const exists = standardPresets.some((p) => p.value === current);
  if (!exists) {
    return [
      { value: current, label: '(Custom)' },
      ...standardPresets
    ];
  }
  return standardPresets;
});

const currentSelectValue = computed(() => {
  return isCustomPromptOpen.value ? 'custom' : (props.modelValue || 80);
});

// 4. Helper Methods & Event Handlers
const handleSelectChange = async (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const val = target.value;

  if (val === 'custom') {
    isCustomPromptOpen.value = true;
    customPortInput.value = props.modelValue || 80;
    await nextTick();
    customInputRef.value?.focus();
    return;
  }

  isCustomPromptOpen.value = false;
  const numericPort = Number(val);
  if (!isNaN(numericPort) && numericPort > 0) {
    emit('update:modelValue', numericPort);
    emit('change', numericPort);
  }
};

const handleApplyCustom = () => {
  const parsed = Number(customPortInput.value);
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 65535) {
    isCustomPromptOpen.value = false;
    emit('update:modelValue', parsed);
    emit('change', parsed);
  }
};

const cancelCustom = () => {
  isCustomPromptOpen.value = false;
};
</script>

<style scoped>
  .port-select-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    z-index: 55;
  }

  .port-icon-prefix {
    position: absolute;
    left: 8px;
    pointer-events: none;
    color: var(--accent-cyan);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .port-select {
    appearance: none;
    background: rgba(0, 242, 254, 0.08);
    border: 1px solid rgba(0, 242, 254, 0.3);
    color: var(--accent-cyan);
    font-family: var(--font-mono);
    font-size: 0.70rem;
    font-weight: 700;
    padding: 4px 22px 4px 23px;
    border-radius: 9999px;
    outline: none;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .port-select:hover:not(:disabled) {
    background: rgba(0, 242, 254, 0.16);
    border-color: var(--accent-cyan);
    box-shadow: 0 0 10px rgba(0, 242, 254, 0.35);
  }

  .port-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .port-select option {
    background: #0d1322;
    color: #fff;
    font-family: var(--font-mono);
    font-size: 0.76rem;
  }

  .select-chevron {
    position: absolute;
    right: 8px;
    pointer-events: none;
    color: var(--accent-cyan);
    opacity: 0.8;
  }

  .custom-port-popover {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 1000;
    background: rgba(10, 16, 30, 0.98);
    border: 1px solid var(--accent-cyan);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7), 0 0 14px rgba(0, 242, 254, 0.35);
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 140px;
    animation: popIn 0.15s ease-out;
  }

  @keyframes popIn {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.96);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .custom-popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .custom-popover-title {
    font-size: 0.64rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
  }

  .btn-popover-close {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .btn-popover-close:hover {
    color: #fff;
  }

  .custom-input-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .custom-port-input {
    width: 68px;
    background: rgba(4, 6, 12, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-sm);
    color: #fff;
    font-family: var(--font-mono);
    font-size: 0.74rem;
    font-weight: 700;
    padding: 3px 6px;
    outline: none;
  }

  .custom-port-input:focus {
    border-color: var(--accent-cyan);
  }

  .btn-apply-custom {
    background: var(--accent-cyan);
    border: none;
    border-radius: var(--radius-sm);
    color: #040812;
    font-size: 0.68rem;
    font-weight: 800;
    padding: 4px 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-apply-custom:hover:not(:disabled) {
    background: #fff;
    box-shadow: 0 0 8px #fff;
  }

  .btn-apply-custom:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
