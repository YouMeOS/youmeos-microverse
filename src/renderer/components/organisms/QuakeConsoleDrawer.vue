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
          v-for="entry in visibleLogs"
          :key="entry.id"
          :entry="entry"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
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

const visibleLogs = computed(() => {
  return props.logs.length > 200 ? props.logs.slice(-200) : props.logs;
});

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

<style scoped>
.quake-console-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(4, 7, 14, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  flex-direction: column;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 10px 14px 16px;
  box-sizing: border-box;
}

.quake-console-overlay.hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-100%);
  display: flex !important;
}

.quake-console-panel {
  display: flex;
  flex-direction: column;
  height: 88vh;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass-bright);
  background: var(--bg-terminal);
  box-shadow: 
    0 12px 36px rgba(0, 0, 0, 0.8),
    0 0 24px rgba(98, 201, 255, 0.15);
  overflow: hidden;
}

.quake-titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: rgba(14, 24, 42, 0.95);
  border-bottom: 1px solid var(--border-glass);
}

.quake-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quake-term-icon {
  color: var(--accent-cyan);
}

.quake-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
}

.quake-shortcut-badge {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  background: rgba(98, 201, 255, 0.12);
  border: 1px solid var(--border-glass);
  color: var(--accent-cyan);
  padding: 1px 7px;
  border-radius: 4px;
}

.quake-title-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.log-stream-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  color: var(--status-running);
  font-weight: 600;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--status-running);
  box-shadow: 0 0 6px var(--status-running);
}

.log-metrics-counter {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-secondary);
}

.quake-close-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
}

.quake-close-btn:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
}

.quake-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  gap: 12px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-glass-subtle);
  background: rgba(8, 14, 26, 0.9);
}

.quake-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.quake-tab-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-glass-subtle);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.18s ease;
}

.quake-tab-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--border-glass);
}

.quake-tab-btn.active {
  background: rgba(98, 201, 255, 0.16);
  border-color: var(--border-glass-bright);
  color: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(98, 201, 255, 0.2);
}

.quake-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quake-search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 22, 38, 0.9);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 3px 8px;
  color: var(--text-secondary);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.quake-search-box:focus-within {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 8px var(--accent-cyan-glow);
  color: var(--accent-cyan);
}

.quake-search-input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  width: 140px;
  min-width: 100px;
}

.quake-search-input::placeholder {
  color: var(--text-muted);
}

.quake-level-select {
  background: rgba(14, 22, 38, 0.9);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 500;
  padding: 4px 8px;
  outline: none;
  cursor: pointer;
  transition: all 0.18s ease;
}

.quake-level-select:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 8px var(--accent-cyan-glow);
  color: #fff;
}

.quake-level-select option {
  background: #0e1626;
  color: #fff;
}

.quake-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-glass-subtle);
  color: var(--text-secondary);
  font-size: 0.70rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.18s ease;
}

.quake-tool-btn:hover {
  color: #fff;
  background: rgba(98, 201, 255, 0.14);
  border-color: var(--border-glass-bright);
}

.quake-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.6;
  background: rgba(2, 4, 8, 0.95);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.log-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
  gap: 10px;
  font-size: 0.8rem;
}
</style>
