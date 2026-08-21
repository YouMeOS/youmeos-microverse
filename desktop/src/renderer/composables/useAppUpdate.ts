import { ref, onMounted, onUnmounted } from 'vue';
import { useMicroverseApi } from './useMicroverseApi';
import type { AppUpdateStatus } from '../types';

export function useAppUpdate() {
  const api = useMicroverseApi();

  // 1. Reactive Primitives
  const isModalOpen = ref<boolean>(false);
  const isChecking = ref<boolean>(false);
  const status = ref<AppUpdateStatus>({
    state: 'idle',
    version: undefined,
    releaseNotes: undefined,
    releaseDate: undefined,
    progress: undefined,
    error: undefined
  });

  let unsubscribeUpdate: (() => void) | null = null;

  // 2. Helper Methods
  const openModal = () => {
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const checkForUpdates = async () => {
    isChecking.value = true;
    try {
      if (api.checkForUpdates) {
        const res = await api.checkForUpdates();
        if (res) {
          status.value = res;
          if (res.state === 'available') {
            openModal();
          }
        }
      }
    } catch (e: any) {
      status.value.error = e?.message || 'Check failed';
    } finally {
      isChecking.value = false;
    }
  };

  const downloadUpdate = async () => {
    try {
      if (api.downloadUpdate) {
        await api.downloadUpdate();
      }
    } catch (e: any) {
      status.value.error = e?.message || 'Download failed';
    }
  };

  const installUpdate = async () => {
    try {
      if (api.installUpdate) {
        await api.installUpdate();
      }
    } catch (e: any) {
      status.value.error = e?.message || 'Install failed';
    }
  };

  // 3. Lifecycle Hooks
  onMounted(async () => {
    if (api.onUpdateStatus) {
      unsubscribeUpdate = api.onUpdateStatus((s) => {
        status.value = s;
        if (s.state === 'available' || s.state === 'downloading' || s.state === 'downloaded') {
          openModal();
        }
      });
    }

    if (api.getUpdateStatus) {
      try {
        const initial = await api.getUpdateStatus();
        if (initial) status.value = initial;
      } catch {}
    }
  });

  onUnmounted(() => {
    if (unsubscribeUpdate) unsubscribeUpdate();
  });

  // 4. Return Statement
  return {
    isModalOpen,
    isChecking,
    status,
    openModal,
    closeModal,
    checkForUpdates,
    downloadUpdate,
    installUpdate
  };
}
