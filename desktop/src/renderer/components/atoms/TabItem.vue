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
