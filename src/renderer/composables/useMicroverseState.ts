import { ref, computed, onMounted, onUnmounted } from "vue";
import { useMicroverseApi } from "./useMicroverseApi";
import type {
  EngineStatus,
  EngineType,
  ServiceInfo,
  StackLayerStatus,
  GatewayEndpoint,
  DownloadProgress,
  EngineStatusInfo,
  EngineErrorInfo,
  ErrorActionType,
  WebtopLaunchTarget,
} from "../types";

export function useMicroverseState() {
  const api = useMicroverseApi();

  // 1. Reactive Primitives
  const status = ref<EngineStatus>("stopped");
  const engineType = ref<EngineType>("embedded");
  const activePort = ref<number>(80);
  const savedHomepageMode = localStorage.getItem("youmeos_os_homepage_mode");
  const osHomepageMode = ref<string>(savedHomepageMode || "homepage");
  const errorInfo = ref<EngineErrorInfo | null>(null);
  const isErrorModalOpen = ref<boolean>(false);
  const services = ref<ServiceInfo[]>([]);
  const stackLayers = ref<StackLayerStatus[]>([]);
  const gateways = ref<GatewayEndpoint[]>([]);
  const currentGatewayUrl = ref<string>("https://my.youmeos.com");
  const downloadProgress = ref<DownloadProgress | null>(null);
  const statusMessage = ref<string>("");
  const version = ref<string>("1.0.0");
  const isActionPending = ref<boolean>(false);
  const activeView = ref<"splash" | "dashboard">("splash");
  const isSideDrawerOpen = ref<boolean>(true);
  const activeTab = ref<string>("tab-overview");
  const isLaunchPromptOpen = ref<boolean>(false);

  // Diagnostic states
  const isAutoLoggingIn = ref<boolean>(false);
  const autoLoginError = ref<string>("");
  const isResettingPassword = ref<boolean>(false);
  const passwordResetResult = ref<{
    success: boolean;
    userLogin?: string;
    newPassword?: string;
    error?: string;
  } | null>(null);
  const isCheckingDb = ref<boolean>(false);
  const dbHealthResult = ref<{
    status: string;
    integrity: string;
    userCount: number;
    sizeBytes: number;
    error?: string;
  } | null>(null);

  let hasPromptedLaunch = false;
  let pollInterval: any = null;
  let unsubscribeProgress: (() => void) | null = null;
  let unsubscribeStatus: (() => void) | null = null;

  // 2. Computed State
  const isRunning = computed(() => status.value === "running");
  const isStopped = computed(() => status.value === "stopped");
  const isTransitioning = computed(
    () => status.value === "starting" || status.value === "stopping",
  );
  const isError = computed(() => status.value === "error");

  const statusLabel = computed(() => {
    const s = status.value;
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  const verifiedLayersCount = computed(() => {
    return stackLayers.value.filter((l) => l.active || l.installed).length;
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
    bedrock: 7,
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
    const prevStatus = status.value;
    if (info.status) status.value = info.status;
    if (info.engineType) engineType.value = info.engineType;
    if (info.activePort) activePort.value = info.activePort;
    if (info.osHomepageMode) osHomepageMode.value = info.osHomepageMode;
    if (info.services) services.value = info.services;
    if (info.stackLayers) stackLayers.value = sortStackLayers(info.stackLayers);
    if (info.gateways) gateways.value = info.gateways;
    if (info.url) currentGatewayUrl.value = info.url;
    if (info.downloadProgress !== undefined)
      downloadProgress.value = info.downloadProgress;
    if (info.message !== undefined) statusMessage.value = info.message;
    if (info.errorInfo !== undefined) errorInfo.value = info.errorInfo;

    // Automatically surface error modal when transitioning to error with diagnostic data
    if (status.value === "error" && (info.errorInfo || info.message) && prevStatus !== "error") {
      isErrorModalOpen.value = true;
    }

    // Reset auto triggers on stop
    if (status.value === "stopped") {
      hasPromptedLaunch = false;
      isLaunchPromptOpen.value = false;
    }

    // Prompt user to launch WebTop upon successful stack start
    if (isRunning.value && !hasPromptedLaunch) {
      hasPromptedLaunch = true;
      isSideDrawerOpen.value = true;
      isErrorModalOpen.value = false;
    }
  };

  const pollStatus = async () => {
    try {
      const info = await api.getStatus();
      updateFromStatusInfo(info);
    } catch (e: any) {
      status.value = "error";
      statusMessage.value = e?.message || "Status poll failed";
    }
  };

  const start = async () => {
    isActionPending.value = true;
    status.value = "starting";
    try {
      await api.start();
    } catch (e: any) {
      status.value = "error";
      statusMessage.value = e?.message || "Start failed";
    } finally {
      isActionPending.value = false;
      await pollStatus();
    }
  };

  const stop = async () => {
    isActionPending.value = true;
    status.value = "stopping";
    try {
      await api.stop();
    } catch (e: any) {
      status.value = "error";
      statusMessage.value = e?.message || "Stop failed";
    } finally {
      isActionPending.value = false;
      await pollStatus();
    }
  };

  const restart = async () => {
    isActionPending.value = true;
    status.value = "starting";
    try {
      await api.restart();
    } catch (e: any) {
      status.value = "error";
      statusMessage.value = e?.message || "Restart failed";
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
      console.error("Failed to set engine type", e);
    }
  };

  const setPort = async (port: number) => {
    isActionPending.value = true;
    try {
      if (api.setPort) {
        await api.setPort(port);
      }
      activePort.value = port;
    } catch (e: any) {
      console.error("Failed to set port", e);
    } finally {
      isActionPending.value = false;
      await pollStatus();
    }
  };

  const setHomepageMode = async (mode: string) => {
    const cleanMode = (mode || "homepage").trim();
    isActionPending.value = true;
    try {
      if (api.setHomepageMode) {
        await api.setHomepageMode(cleanMode);
      }
      osHomepageMode.value = cleanMode;
      localStorage.setItem("youmeos_os_homepage_mode", cleanMode);
    } catch (e: any) {
      console.error("Failed to set homepage mode", e);
    } finally {
      isActionPending.value = false;
      await pollStatus();
    }
  };

  const openErrorModal = () => {
    isErrorModalOpen.value = true;
  };

  const closeErrorModal = () => {
    isErrorModalOpen.value = false;
  };

  const handleRemediateError = async (actionType: ErrorActionType, targetPort?: number) => {
    closeErrorModal();
    if (actionType === "switch_port" && targetPort) {
      await setPort(targetPort);
      await restart();
    } else if (actionType === "switch_engine") {
      await setEngineType("embedded");
      await restart();
    } else if (actionType === "reset_db") {
      activeTab.value = "tab-diagnostics";
      activeView.value = "dashboard";
    } else {
      await restart();
    }
  };

  const toggleSideDrawer = (forceState?: boolean) => {
    isSideDrawerOpen.value =
      forceState !== undefined ? forceState : !isSideDrawerOpen.value;
  };

  const launchWebtop = (
    target: "webview" | "browser" = "webview",
    minimize: boolean = true,
  ) => {
    isLaunchPromptOpen.value = false;
    if (target === "browser") {
      api.openBrowser(currentGatewayUrl.value);
    } else {
      api.openUrl(currentGatewayUrl.value);
    }
    if (minimize && api.minimizeToTray) {
      api.minimizeToTray();
    }
  };

  const closeLaunchPrompt = () => {
    isLaunchPromptOpen.value = false;
  };

  const openUrl = (url?: string, minimize: boolean = false) => {
    api.openUrl(url || currentGatewayUrl.value);
    if (minimize && api.minimizeToTray) {
      api.minimizeToTray();
    }
  };

  const openBrowser = (minimize: boolean = false) => {
    api.openBrowser(currentGatewayUrl.value);
    if (minimize && api.minimizeToTray) {
      api.minimizeToTray();
    }
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
      console.error("Failed to update plugins", e);
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
    activePort,
    osHomepageMode,
    errorInfo,
    isErrorModalOpen,
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
    isLaunchPromptOpen,
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
    setPort,
    setHomepageMode,
    openErrorModal,
    closeErrorModal,
    handleRemediateError,
    launchWebtop,
    closeLaunchPrompt,
    toggleSideDrawer,
    openUrl,
    openBrowser,
    openBlackbox,
    updatePlugins,
    pollStatus,
  };
}
