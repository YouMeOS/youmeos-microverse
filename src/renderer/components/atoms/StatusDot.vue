<template>
  <span :class="['dot', status, { pulse: isPulse }]" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    status?: 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | string;
    isPulse?: boolean;
  }>(),
  {
    status: 'stopped',
    isPulse: false
  }
);
</script>
