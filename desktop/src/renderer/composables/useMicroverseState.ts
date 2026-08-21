import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMicroverseApi } from './useMicroverseApi';
import type {
  EngineStatus,
  EngineType,
  ServiceInfo,
  StackLayerStatus,
  GatewayEndpoint,
  DownloadProgress,
  EngineStatusInfo
} from '../types';

export function useMicroverseState() {
  const api = useMicroverseApi();

  // 1. Reactive Primitives
  const status = ref<EngineStatus>('stopped');
  const engineType = ref<EngineType>('embedded');
  const services = ref<ServiceInfo[]>([]);
  const stackLayers = ref<StackLayerStatus[]>([]);
  const gateways = ref<GatewayEndpoint[]>([]);
  const currentGatewayUrl = ref<string>('https://my.youmeos.com');
  const downloadProgress = ref<DownloadProgress | null>(null);
  const statusMessage = ref<string>('');
  const version = ref<string>('1.0.0');
  const isActionPending = ref<boolean>(false);
  const activeView = ref<'splash' | 'dashboard'>('splash');
  const isSideDrawerOpen = ref<boolean>(true);
  const activeTab = ref<string>('tab-overview');
  const stayOnSplash = ref<boolean>(localStorage.getItem('youmeos_stay_splash') === 'true');
  const autolaunch = ref<boolean>(
    localStorage.getItem('youmeos_autolaunch') !== null
      ? localStorage.getItem('youmeos_autolaunch') === 'true'
      : true
  );

  // Diagnostic states
  const isAutoLoggingIn = ref<boolean>(false);
  const autoLoginError = ref<string>('');
  const isResettingPassword = ref<boolean>(false);
  const passwordResetResult = ref<{ success: boolean; userLogin?: string; newPassword?: string; error?: string } | null>(null);
  const isCheckingDb = ref<boolean>(false);
  const dbHealthResult = ref<{ status: string; integrity: string; userCount: number; sizeBytes: number; error?: string } | null>(null);

  let hasAutoTransitioned = false;
  let hasAutoLaunchedGateway = false;
  let pollInterval: any = null;
  let unsubscribeProgress: (() => void) | null = null;
  let unsubscribeStatus: (() => void) | null = null;

  // 2. Computed State
  const isRunning = computed(() => status.value === 'running');
  const isStopped = computed(() => status.value === 'stopped');
  const isTransitioning = computed(() => status.value === 'starting' || status.value === 'stopping');
  const isError = computed(() => status.value === 'error');

  const statusLabel = computed(() => {
    const s = status.value;
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  const verifiedLayersCount = computed(() => {
    return stackLayers.value.filter(l => l.active || l.installed).length;
  });

  const totalLayersCount = computed(() => {
    return stackLayers.value.length || 7;
  });

  const LAYER_ORDER: Record<string, number> = {
    compass: 1,
    portal: 2,
    network: 3,
    server: 4,
    core: 5,
    database: 6,
    bedrock: 7
  };

  const sortStackLayers = (layers: StackLayerStatus[]): StackLayerStatus[] => {
    return [...layers].sort((a, b) => {
      const orderA = LAYER_ORDER[a.id?.toLowerCase()] || 99;
      const orderB = LAYER_ORDER[b.id?.toLowerCase()] || 99;
      return orderA - orderB;
    });
  };

  // 3. Helper Methods & Event Handlers
  const updateFromStatusInfo = (info: Partial<EngineStatusInfo>) => {
    if (info.status) status.value = info.status;
    if (info.engineType) engineType.value = info.engineType;
    if (info.services) services.value = info.services;
    if (info.stackLayers) stackLayers.value = sortStackLayers(info.stackLayers);
    if (info.gateways) gateways.value = info.gateways;
    if (info.url) currentGatewayUrl.value = info.url;
    if (info.downloadProgress !== undefined) downloadProgress.value = info.downloadProgress;
    if (info.message !== undefined) statusMessage.value = info.message;

    // Reset auto triggers on stop
    if (status.value === 'stopped') {
      hasAutoTransitioned = false;
      hasAutoLaunchedGateway = false;
    }

    // Auto-launch gateway in browser if enabled
    if (isRunning.value && !hasAutoLaunchedGateway && autolaunch.value) {
      hasAutoLaunchedGateway = true;
      api.openUrl(currentGatewayUrl.value);
    }

    // Auto-transition to dashboard if running and not locked on splash
    if (isRunning.value && !hasAutoTransitioned && !stayOnSplash.value) {
      hasAutoTransitioned = true;
      setTimeout(() => {
        if (!stayOnSplash.value) {
          activeView.value = 'dashboard';
        }
      }, 1200);
    }
  };

  const pollStatus = async () => {
    try {
      const info = await api.getStatus();
      updateFromStatusInfo(info);
    } catch (e: any) {
      status.value = 'error';
      statusMessage.value = e?.message || 'Status poll failed';
    }
  };

  const start = async () => {
    isActionPending.value = true;
    status.value = 'starting';
    try {
      await api.start();
    } catch (e: any) {
      status.value = 'error';
      statusMessage.value = e?.message || 'Start failed';
    } finally {
      isActionPending.value = false;
      await pollStatus();
    }
  };

  const stop = async () => {
    isActionPending.value = true;
    status.value = 'stopping';
    try {
      await api.stop();
    } catch (e: any) {
      status.value = 'error';
      statusMessage.value = e?.message || 'Stop failed';
    } finally {
      isActionPending.value = false;
      await pollStatus();
    }
  };

  const restart = async () => {
    isActionPending.value = true;
    status.value = 'starting';
    try {
      await api.restart();
    } catch (e: any) {
      status.value = 'error';
      statusMessage.value = e?.message || 'Restart failed';
    } finally {
      isActionPending.value = false;
      await pollStatus();
    }
  };

  const setEngineType = async (type: EngineType) => {
    try {
      await api.setEngineType(type);
      engineType.value = type;
      await pollStatus();
    } catch (e: any) {
      console.error('Failed to set engine type', e);
    }
  };

  const setStayOnSplash = (val: boolean) => {
    stayOnSplash.value = val;
    localStorage.setItem('youmeos_stay_splash', val ? 'true' : 'false');
  };

  const setAutolaunch = (val: boolean) => {
    autolaunch.value = val;
    localStorage.setItem('youmeos_autolaunch', val ? 'true' : 'false');
  };

  const toggleSideDrawer = (forceState?: boolean) => {
    isSideDrawerOpen.value = forceState !== undefined ? forceState : !isSideDrawerOpen.value;
  };

  const openUrl = (url?: string) => {
    api.openUrl(url || currentGatewayUrl.value);
  };

  const openBrowser = () => {
    api.openBrowser(currentGatewayUrl.value);
  };

  const openBlackbox = (subfolder?: string) => {
    if (api.openBlackboxFolder) {
      api.openBlackboxFolder(subfolder);
    }
  };

  const updatePlugins = async () => {
    try {
      return await api.updatePlugins();
    } catch (e: any) {
      console.error('Failed to update plugins', e);
      return { stderr: e?.message };
    }
  };

  // 4. Lifecycle Hooks
  onMounted(async () => {
    if (api.getVersion) {
      try {
        const v = await api.getVersion();
        if (v) version.value = v;
      } catch {}
    }

    if (api.onDownloadProgress) {
      unsubscribeProgress = api.onDownloadProgress((prog) => {
        downloadProgress.value = prog;
      });
    }

    if (api.onStatusChange) {
      unsubscribeStatus = api.onStatusChange((info) => {
        updateFromStatusInfo(info);
      });
    }

    await pollStatus();
    pollInterval = setInterval(pollStatus, 4000);
  });

  onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
    if (unsubscribeProgress) unsubscribeProgress();
    if (unsubscribeStatus) unsubscribeStatus();
  });

  // 5. Return Statement
  return {
    api,
    status,
    engineType,
    services,
    stackLayers,
    gateways,
    currentGatewayUrl,
    downloadProgress,
    statusMessage,
    version,
    isActionPending,
    activeView,
    isSideDrawerOpen,
    activeTab,
    stayOnSplash,
    autolaunch,
    isRunning,
    isStopped,
    isTransitioning,
    isError,
    statusLabel,
    verifiedLayersCount,
    totalLayersCount,
    isAutoLoggingIn,
    autoLoginError,
    isResettingPassword,
    passwordResetResult,
    isCheckingDb,
    dbHealthResult,
    start,
    stop,
    restart,
    setEngineType,
    setStayOnSplash,
    setAutolaunch,
    toggleSideDrawer,
    openUrl,
    openBrowser,
    openBlackbox,
    updatePlugins,
    pollStatus
  };
}
