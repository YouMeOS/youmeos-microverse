<template>
  <button
    type="button"
    :class="['tabs-trigger', { active: isActive }]"
    :aria-selected="isActive ? 'true' : 'false'"
    @click="$emit('select', tabId)"
  >
    <BaseIcon v-if="icon" :name="icon" :size="13" />
    <span>{{ label }}</span>
    <span v-if="badge" class="tab-badge">{{ badge }}</span>
  </button>
</template>

<script setup lang="ts">
import BaseIcon from './BaseIcon.vue';

defineProps<{
  tabId: string;
  label: string;
  icon?: string;
  badge?: string | number;
  isActive?: boolean;
}>();

defineEmits<{
  (e: 'select', tabId: string): void;
}>();
</script>

<style scoped>
.tabs-trigger {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.tabs-trigger:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.tabs-trigger.active {
  background: rgba(98, 201, 255, 0.15);
  border-color: var(--border-glass-bright);
  color: var(--accent-cyan);
  box-shadow: 0 0 12px var(--accent-cyan-glow);
}

.tab-badge {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 5px;
  border-radius: 10px;
  color: var(--text-primary);
}
</style>
