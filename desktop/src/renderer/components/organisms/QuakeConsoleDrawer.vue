<template>
  <div :class="['quake-console-overlay', { hidden: !isOpen }]">
    <div class="quake-console-panel glass-panel">
      <!-- Quake Terminal Titlebar -->
      <div class="quake-titlebar">
        <div class="quake-title-left">
          <BaseIcon name="terminal" :size="14" class="quake-term-icon" />
          <span class="quake-title">Console HUD</span>
          <span class="quake-shortcut-badge">Press ` or ~ to toggle</span>
        </div>
        <div class="quake-title-right">
          <span class="log-stream-status">
            <span class="pulse-dot" /> Live Stream
          </span>
          <span class="log-metrics-counter">{{ totalCount }} entries</span>
          <button
            type="button"
            class="quake-close-btn"
            title="Close Terminal (Esc or `)"
            @click="$emit('close')"
          >
            <BaseIcon name="close" :size="14" />
          </button>
        </div>
      </div>

      <!-- Quake Controls Toolbar -->
      <div class="quake-toolbar">
        <!-- Service Filter Tabs -->
        <div class="quake-tabs">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            :class="['quake-tab-btn', { active: activeCategory === cat.id }]"
            @click="$emit('setCategory', cat.id)"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Search & Level Filter -->
        <div class="quake-tools">
          <div class="quake-search-box">
            <BaseIcon name="search" :size="12" />
            <input
              type="text"
              :value="searchQuery"
              class="quake-search-input"
              placeholder="Filter logs..."
              spellcheck="false"
              @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <select
            :value="activeLevel"
            class="quake-level-select"
            title="Filter by log severity level"
            @change="$emit('setLevel', ($event.target as HTMLSelectElement).value)"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warnings</option>
            <option value="error">Errors</option>
            <option value="debug">Debug</option>
          </select>

          <button
            type="button"
            class="quake-tool-btn"
            title="Copy logs to clipboard"
            @click="$emit('copy')"
          >
            <BaseIcon :name="copySuccess ? 'check' : 'copy'" :size="12" />
            <span>{{ copySuccess ? 'Copied' : 'Copy' }}</span>
          </button>

          <button
            type="button"
            class="quake-tool-btn"
            title="Clear all log entries"
            @click="$emit('clear')"
          >
            <span>Clear</span>
          </button>
        </div>
      </div>

      <!-- Live Stream Log Content -->
      <div ref="logContainerRef" class="quake-body custom-scrollbar">
        <div v-if="logs.length === 0" class="log-empty-state">
          <BaseIcon name="search" :size="24" />
          <span>No log entries match the selected filters</span>
        </div>
        <LogEntryRow
          v-for="entry in logs"
          :key="entry.id"
          :entry="entry"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import LogEntryRow from '../molecules/LogEntryRow.vue';
import type { LogEntry } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  activeCategory: string;
  activeLevel: string;
  searchQuery: string;
  logs: LogEntry[];
  totalCount: number;
  copySuccess?: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'setCategory', cat: string): void;
  (e: 'setLevel', lvl: string): void;
  (e: 'update:searchQuery', val: string): void;
  (e: 'copy'): void;
  (e: 'clear'): void;
}>();

const logContainerRef = ref<HTMLElement | null>(null);

const categories = [
  { id: 'all', label: 'All' },
  { id: 'gateway', label: 'Gateway' },
  { id: 'core', label: 'Headless Core' },
  { id: 'node', label: 'Node' },
  { id: 'network', label: 'Network' }
];

watch(
  () => props.logs.length,
  () => {
    nextTick(() => {
      if (logContainerRef.value) {
        logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight;
      }
    });
  }
);
</script>
