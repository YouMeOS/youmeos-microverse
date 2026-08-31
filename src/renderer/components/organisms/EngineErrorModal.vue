<template>
  <div :class="['custom-modal-backdrop', { hidden: !isOpen }]">
    <div class="custom-modal-card glass-panel error-modal-card">
      <!-- Modal Header -->
      <div class="modal-header error-modal-header">
        <div class="modal-header-left">
          <div class="modal-brand-badge error-badge">
            <BaseIcon name="alert-triangle" :size="20" />
          </div>
          <div class="modal-title-group">
            <div class="title-with-code">
              <h3 class="modal-title">{{ displayTitle }}</h3>
              <span class="error-code-pill">{{ errorCode }}</span>
            </div>
            <span class="modal-subtitle">YouMeOS Engine Diagnostics &amp; Auto-Remediation</span>
          </div>
        </div>
        <button
          type="button"
          class="modal-close-btn"
          title="Dismiss Error Dialog"
          @click="$emit('close')"
        >
          <BaseIcon name="close" :size="16" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body error-modal-body custom-scrollbar">
        <!-- Diagnosed Root Cause Card -->
        <div class="error-cause-card">
          <div class="cause-header">
            <BaseIcon name="error" :size="14" class="cause-icon" />
            <span class="cause-heading">Diagnosed Issue</span>
          </div>
          <p class="cause-text">{{ displayCause }}</p>
          <p v-if="displayDetails" class="cause-subtext">{{ displayDetails }}</p>
        </div>

        <!-- 1-Click Recommended Resolution Box -->
        <div class="remediation-action-box">
          <div class="remediation-header">
            <div class="remediation-tag">
              <BaseIcon name="wrench" :size="13" />
              <span>Recommended Resolution</span>
            </div>
          </div>
          <p class="remediation-description">
            {{ remediationDescription }}
          </p>
          <div class="remediation-btn-row">
            <button
              type="button"
              class="btn-modal-remediate"
              :disabled="isActionPending"
              @click="handlePrimaryAction"
            >
              <BaseIcon
                v-if="isActionPending"
                name="spin"
                :size="15"
                :spinning="true"
              />
              <BaseIcon
                v-else
                :name="primaryActionIcon"
                :size="15"
              />
              <span>{{ primaryActionLabel }}</span>
            </button>
          </div>
        </div>

        <!-- Alternative Quick Port Switcher (Shown on Port/Permission issues) -->
        <div
          v-if="isPortRelated"
          class="quick-port-selector-card"
        >
          <div class="port-selector-header">
            <BaseIcon name="port" :size="14" />
            <span class="port-selector-title">Select Alternative Port</span>
          </div>
          <div class="port-pills-row">
            <button
              v-for="portOption in commonPorts"
              :key="portOption"
              type="button"
              :class="['port-pill-btn', { active: (activePort || 80) === portOption }]"
              :disabled="isActionPending"
              @click="handleSwitchToPort(portOption)"
            >
              <span class="port-number">:{{ portOption }}</span>
              <span class="port-tag">{{ portOption === 80 ? 'Standard' : (portOption >= 1024 ? 'Unprivileged' : 'Custom') }}</span>
            </button>
          </div>
        </div>

        <!-- Collapsible Technical Diagnostic Log Drawer -->
        <div class="raw-trace-drawer">
          <button
            type="button"
            class="raw-trace-toggle-btn"
            @click="toggleTrace"
          >
            <div class="trace-toggle-left">
              <BaseIcon
                :name="isTraceOpen ? 'chevron-up' : 'chevron-down'"
                :size="14"
              />
              <span>Technical Diagnostics &amp; Process Log</span>
            </div>
            <span v-if="isCopied" class="copied-indicator">Copied to Clipboard!</span>
          </button>

          <div
            v-if="isTraceOpen"
            class="raw-trace-content"
          >
            <div class="raw-trace-toolbar">
              <span class="trace-lang-label">RAW ERROR TRACE</span>
              <button
                type="button"
                class="btn-copy-trace"
                title="Copy full trace to clipboard"
                @click="copyTrace"
              >
                <BaseIcon :name="isCopied ? 'check' : 'copy'" :size="12" />
                <span>{{ isCopied ? 'Copied' : 'Copy Trace' }}</span>
              </button>
            </div>
            <pre class="raw-trace-code custom-scrollbar"><code>{{ displayRawTrace }}</code></pre>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer error-modal-footer">
        <div class="footer-left">
          <button
            type="button"
            class="btn-modal-console"
            title="Open Live Quake Console Drawer"
            @click="$emit('openConsole')"
          >
            <BaseIcon name="terminal" :size="14" />
            <span>Open Console</span>
          </button>
        </div>

        <div class="footer-right">
          <button
            type="button"
            class="btn-modal-secondary"
            @click="$emit('close')"
          >
            Dismiss
          </button>

          <button
            type="button"
            class="btn-modal-restart"
            :disabled="isActionPending"
            @click="$emit('restart')"
          >
            <BaseIcon
              v-if="isActionPending"
              name="spin"
              :size="14"
              :spinning="true"
            />
            <BaseIcon
              v-else
              name="refresh"
              :size="14"
            />
            <span>Retry Engine</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import type { EngineErrorInfo, ErrorActionType, EngineType } from '../../types';

// 1. Props & Emits
const props = defineProps<{
  isOpen: boolean;
  errorInfo?: EngineErrorInfo | null;
  rawError?: string;
  activePort?: number;
  engineType?: EngineType;
  isActionPending?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'remediate', actionType: ErrorActionType, targetPort?: number): void;
  (e: 'setPort', port: number): void;
  (e: 'restart'): void;
  (e: 'openConsole'): void;
}>();

// 2. Reactive Primitives
const isTraceOpen = ref<boolean>(false);
const isCopied = ref<boolean>(false);
const commonPorts = [80, 8080, 8088, 3000, 8888];

// 3. Computed State
const errorCode = computed(() => {
  return props.errorInfo?.code || 'RUNTIME_ERROR';
});

const displayTitle = computed(() => {
  return props.errorInfo?.title || 'Engine Initialization Failure';
});

const displayCause = computed(() => {
  return props.errorInfo?.cause || props.rawError || 'The runtime engine was unable to start or bind required services.';
});

const displayDetails = computed(() => {
  return props.errorInfo?.details || '';
});

const isPortRelated = computed(() => {
  const code = props.errorInfo?.code;
  return code === 'PORT_IN_USE' || code === 'PERMISSION_DENIED';
});

const remediationDescription = computed(() => {
  if (props.errorInfo?.code === 'PORT_IN_USE') {
    return `Port ${props.activePort || 80} is currently blocked by another process. Switch to port ${props.errorInfo.targetPort || 8080} to start without conflicts.`;
  }
  if (props.errorInfo?.code === 'PERMISSION_DENIED') {
    return `Port ${props.activePort || 80} requires administrative elevation on your operating system. Switch to unprivileged port ${props.errorInfo.targetPort || 8080} to start cleanly.`;
  }
  if (props.errorInfo?.code === 'MISSING_RUNTIME') {
    return 'The Windows Visual C++ runtime redistributable is required for PHP execution. Click below to download the official Microsoft installer.';
  }
  if (props.errorInfo?.code === 'DOCKER_DAEMON_OFFLINE') {
    return 'Docker daemon is not running. You can switch to the native standalone Embedded Engine with zero container dependencies.';
  }
  if (props.errorInfo?.code === 'DB_LOCKED') {
    return 'The SQLite database file is locked or corrupt. Running a quick health check or clean rebuild will resolve this.';
  }
  return 'Attempt an automated runtime restart to rebind ports and verify service dependencies.';
});

const primaryActionLabel = computed(() => {
  return props.errorInfo?.suggestedAction || 'Restart Engine & Retry';
});

const primaryActionIcon = computed(() => {
  const actionType = props.errorInfo?.actionType;
  if (actionType === 'switch_port') return 'port';
  if (actionType === 'switch_engine') return 'spark';
  if (actionType === 'install_runtime') return 'download';
  if (actionType === 'reset_db') return 'wrench';
  return 'refresh';
});

const displayRawTrace = computed(() => {
  return props.errorInfo?.rawError || props.rawError || 'No detailed stack trace available.';
});

// 4. Helper Methods & Event Handlers
const toggleTrace = () => {
  isTraceOpen.value = !isTraceOpen.value;
};

const handlePrimaryAction = () => {
  if (props.errorInfo?.actionType === 'install_runtime' && props.errorInfo.runtimeDownloadUrl) {
    window.open(props.errorInfo.runtimeDownloadUrl, '_blank');
    return;
  }

  const actionType = props.errorInfo?.actionType || 'retry';
  const targetPort = props.errorInfo?.targetPort;
  emit('remediate', actionType, targetPort);
};

const handleSwitchToPort = (port: number) => {
  emit('setPort', port);
};

const copyTrace = async () => {
  try {
    const textToCopy = `[YouMeOS Microverse Error Diagnostics]
Code: ${errorCode.value}
Title: ${displayTitle.value}
Cause: ${displayCause.value}
Details: ${displayDetails.value}
Active Port: ${props.activePort || 80}
Engine Type: ${props.engineType || 'embedded'}

--- RAW TRACE ---
${displayRawTrace.value}`;

    await navigator.clipboard.writeText(textToCopy);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch {}
};
</script>

<style scoped>
.error-modal-card {
  max-width: 580px;
  width: 92vw;
  padding: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 0, 85, 0.4);
  background: rgba(8, 12, 22, 0.94);
  backdrop-filter: blur(28px);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.85),
    0 0 35px rgba(255, 0, 85, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: modalPopIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPopIn {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.error-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255, 0, 85, 0.2);
  background: linear-gradient(90deg, rgba(32, 10, 20, 0.85) 0%, rgba(14, 18, 32, 0.8) 100%);
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-brand-badge.error-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: rgba(255, 0, 85, 0.15);
  border: 1px solid rgba(255, 0, 85, 0.45);
  color: #ff3366;
  box-shadow: 0 0 16px rgba(255, 0, 85, 0.35);
  flex-shrink: 0;
}

.modal-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-with-code {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-title {
  font-size: 1.02rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.2px;
}

.error-code-pill {
  font-size: 0.62rem;
  font-family: var(--font-mono);
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 9999px;
  background: rgba(255, 0, 85, 0.2);
  border: 1px solid rgba(255, 0, 85, 0.5);
  color: #ff6688;
  letter-spacing: 0.5px;
}

.modal-subtitle {
  font-size: 0.68rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(255, 0, 85, 0.25);
  border-color: #ff3366;
  color: #fff;
}

.error-modal-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 65vh;
  overflow-y: auto;
}

.error-cause-card {
  background: rgba(26, 12, 18, 0.6);
  border: 1px solid rgba(255, 0, 85, 0.25);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cause-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #ff6688;
}

.cause-icon {
  color: #ff3366;
}

.cause-text {
  font-size: 0.84rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  margin: 0;
}

.cause-subtext {
  font-size: 0.74rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.remediation-action-box {
  background: linear-gradient(135deg, rgba(16, 28, 52, 0.75) 0%, rgba(10, 18, 36, 0.85) 100%);
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.remediation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remediation-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.70rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-cyan);
}

.remediation-description {
  font-size: 0.78rem;
  color: var(--text-primary);
  line-height: 1.45;
  margin: 0;
}

.remediation-btn-row {
  display: flex;
  margin-top: 2px;
}

.btn-modal-remediate {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border: 1px solid #38bdf8;
  color: #fff;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.btn-modal-remediate:hover:not(:disabled) {
  background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.6);
  transform: translateY(-1px);
}

.btn-modal-remediate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-port-selector-card {
  background: rgba(12, 18, 30, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.port-selector-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.70rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.port-pills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.port-pill-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 68px;
}

.port-pill-btn:hover:not(:disabled) {
  background: rgba(0, 242, 254, 0.12);
  border-color: rgba(0, 242, 254, 0.4);
  color: #fff;
}

.port-pill-btn.active {
  background: rgba(0, 242, 254, 0.18);
  border-color: #00f2fe;
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.25);
}

.port-number {
  font-size: 0.82rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

.port-tag {
  font-size: 0.58rem;
  color: var(--text-muted);
}

.raw-trace-drawer {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: rgba(6, 10, 18, 0.5);
}

.raw-trace-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(14, 20, 34, 0.7);
  border: none;
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.raw-trace-toggle-btn:hover {
  background: rgba(22, 30, 50, 0.85);
  color: #fff;
}

.trace-toggle-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.copied-indicator {
  font-size: 0.66rem;
  color: #34d399;
  font-weight: 600;
}

.raw-trace-content {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  gap: 6px;
  background: rgba(4, 6, 12, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.raw-trace-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trace-lang-label {
  font-size: 0.62rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.btn-copy-trace {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  font-size: 0.66rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-copy-trace:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.raw-trace-code {
  margin: 0;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.70rem;
  line-height: 1.45;
  color: #ff99aa;
  max-height: 140px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 14, 26, 0.85);
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-modal-console {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-console:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-modal-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--text-secondary);
  padding: 7px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.btn-modal-restart {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 0, 85, 0.15);
  border: 1px solid rgba(255, 0, 85, 0.4);
  color: #ff6688;
  padding: 7px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-restart:hover:not(:disabled) {
  background: rgba(255, 0, 85, 0.25);
  border-color: #ff3366;
  color: #fff;
  box-shadow: 0 0 14px rgba(255, 0, 85, 0.35);
}

.btn-modal-restart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
