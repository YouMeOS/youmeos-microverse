import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMicroverseApi } from './useMicroverseApi';
import type { LogEntry } from '../types';

export function useConsoleLogs() {
  const api = useMicroverseApi();

  // 1. Reactive Primitives
  const isOpen = ref<boolean>(false);
  const activeCategory = ref<'all' | 'gateway' | 'core' | 'node' | 'network'>('all');
  const activeLevel = ref<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');
  const searchQuery = ref<string>('');
  const logs = ref<LogEntry[]>([]);
  const autoScroll = ref<boolean>(true);
  const copySuccess = ref<boolean>(false);

  let unsubscribeLogs: (() => void) | null = null;
  const MAX_LOGS = 1000;

  // 2. Computed State
  const filteredLogs = computed(() => {
    const cat = activeCategory.value;
    const lvl = activeLevel.value;
    const query = searchQuery.value.trim().toLowerCase();

    return logs.value.filter(entry => {
      // Category match
      if (cat !== 'all') {
        const serviceLower = (entry.service || '').toLowerCase();
        if (cat === 'gateway' && !serviceLower.includes('caddy') && !serviceLower.includes('gateway') && !serviceLower.includes('franken')) return false;
        if (cat === 'core' && !serviceLower.includes('wp') && !serviceLower.includes('php') && !serviceLower.includes('core') && !serviceLower.includes('sqlite') && !serviceLower.includes('db') && !serviceLower.includes('setup') && !serviceLower.includes('system') && !serviceLower.includes('updater') && !serviceLower.includes('plugin')) return false;
        if (cat === 'node' && !serviceLower.includes('node') && !serviceLower.includes('embedded') && !serviceLower.includes('docker')) return false;
        if (cat === 'network' && !serviceLower.includes('net') && !serviceLower.includes('port') && !serviceLower.includes('bridge') && !serviceLower.includes('mesh')) return false;
      }

      // Level match
      if (lvl !== 'all' && entry.level !== lvl) {
        return false;
      }

      // Search query match
      if (query && !entry.text.toLowerCase().includes(query) && !(entry.service || '').toLowerCase().includes(query)) {
        return false;
      }

      return true;
    });
  });

  const totalEntriesCount = computed(() => logs.value.length);
  const filteredEntriesCount = computed(() => filteredLogs.value.length);

  // 3. Helper Methods
  const addLog = (entry: LogEntry) => {
    const formatted: LogEntry = {
      ...entry,
      id: entry.id || `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: entry.timestamp || Date.now()
    };
    logs.value.push(formatted);
    if (logs.value.length > MAX_LOGS) {
      logs.value.splice(0, logs.value.length - MAX_LOGS);
    }
  };

  const toggle = (forceState?: boolean) => {
    isOpen.value = forceState !== undefined ? forceState : !isOpen.value;
  };

  const openWithFilter = (category: 'all' | 'gateway' | 'core' | 'node' | 'network') => {
    activeCategory.value = category;
    isOpen.value = true;
  };

  const clear = async () => {
    logs.value = [];
    if (api.clearLogs) {
      try {
        await api.clearLogs();
      } catch {}
    }
  };

  const copyToClipboard = async () => {
    const content = filteredLogs.value.map(l => `[${new Date(l.timestamp || Date.now()).toLocaleTimeString()}] [${l.service.toUpperCase()}] ${l.text}`).join('\n');
    try {
      await navigator.clipboard.writeText(content);
      copySuccess.value = true;
      setTimeout(() => {
        copySuccess.value = false;
      }, 1500);
    } catch (e) {
      console.error('Failed to copy logs', e);
    }
  };

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.key === '`' || e.key === '~') {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';
      if (!isInput) {
        e.preventDefault();
        toggle();
      }
    } else if (e.key === 'Escape' && isOpen.value) {
      isOpen.value = false;
    }
  };

  // 4. Lifecycle Hooks
  onMounted(async () => {
    window.addEventListener('keydown', handleGlobalKeyDown);

    if (api.getStructuredLogs) {
      try {
        const initial = await api.getStructuredLogs({ tail: 200 });
        if (initial && initial.length > 0) {
          logs.value = initial;
        }
      } catch {}
    }

    if (api.onLog) {
      unsubscribeLogs = api.onLog((entry) => {
        addLog(entry);
      });
    }
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKeyDown);
    if (unsubscribeLogs) unsubscribeLogs();
  });

  // 5. Return Statement
  return {
    isOpen,
    activeCategory,
    activeLevel,
    searchQuery,
    logs,
    filteredLogs,
    totalEntriesCount,
    filteredEntriesCount,
    autoScroll,
    copySuccess,
    toggle,
    openWithFilter,
    clear,
    copyToClipboard,
    addLog
  };
}
