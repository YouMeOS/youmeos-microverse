<template>
  <section class="tab-content">
    <div class="dash-settings-grid">
      <!-- 1. Microverse Engine Configuration -->
      <div class="dash-card glass-panel">
        <h3 class="card-title">Microverse Engine Configuration</h3>
        <div class="settings-field">
          <label class="control-label">Runtime Engine</label>
          <EngineSelector
            :model-value="engineType"
            @update:model-value="$emit('setEngineType', $event)"
          />
        </div>
      </div>

      <!-- 2. Plugin Sync & Maintenance Card -->
      <div class="dash-card glass-panel">
        <h3 class="card-title">Plugin Sync &amp; Maintenance</h3>
        <p class="dash-card-desc">Sync and update the latest PHP and PWA Sparks from upstream.</p>
        <button
          type="button"
          class="btn-modal-primary"
          :disabled="isUpdatingPlugins"
          @click="handleUpdatePlugins"
        >
          <BaseIcon
            v-if="isUpdatingPlugins"
            name="spin"
            :size="14"
            :spinning="true"
          />
          <BaseIcon
            v-else
            name="refresh"
            :size="14"
          />
          <span>{{ isUpdatingPlugins ? 'Updating Plugins...' : 'Update Plugins Suite' }}</span>
        </button>
        <span
          v-if="pluginUpdateFeedback"
          class="feedback-msg"
        >{{ pluginUpdateFeedback }}</span>
      </div>

      <!-- 3. Plugin Developer Mode Card -->
      <div class="dash-card glass-panel">
        <div class="card-header">
          <div class="card-title-group">
            <BaseIcon
              name="spark"
              :size="16"
            />
            <h3 class="card-title">Plugin Developer Mode</h3>
          </div>
          <span
            class="homepage-mode-badge"
            :class="{ 'is-routes-only': !devMode }"
          >
            {{ devMode ? 'Live Hot Reload' : 'Production Cache' }}
          </span>
        </div>
        <p class="dash-card-desc">
          Disables static caching, revalidates PHP timestamps immediately, and monitors wp-content/plugins to auto-reload the portal window on file changes.
        </p>

        <div class="port-preset-row">
          <button
            type="button"
            :class="['btn-port-preset', { active: devMode }]"
            :disabled="isActionPending"
            @click="$emit('setDevMode', true)"
          >
            <span>Active</span>
            <span class="preset-sub">Live Dev &amp; Reload</span>
          </button>

          <button
            type="button"
            :class="['btn-port-preset', { active: !devMode }]"
            :disabled="isActionPending"
            @click="$emit('setDevMode', false)"
          >
            <span>Disabled</span>
            <span class="preset-sub">Production Cache</span>
          </button>
        </div>

        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button
            type="button"
            class="btn-modal-secondary"
            @click="handleOpenPluginsFolder"
          >
            <BaseIcon name="portal" :size="14" />
            <span>Open Plugins Folder</span>
          </button>
        </div>
      </div>

      <!-- 3. OS Homepage Routing Mode Card -->
      <div class="dash-card glass-panel">
        <div class="card-header">
          <div class="card-title-group">
            <BaseIcon
              name="brand"
              :size="16"
            />
            <h3 class="card-title">OS Homepage Routing Mode</h3>
          </div>
          <span
            class="homepage-mode-badge"
            :class="{ 'is-routes-only': osHomepageMode === 'routes_only' }"
          >
            {{ osHomepageMode === 'routes_only' ? 'Routes Only' : 'WebTop Root' }}
          </span>
        </div>
        <p class="dash-card-desc">
          Controls whether YouMeOS WebTop acts as the root homepage (/) or runs under /youmeos so WordPress themes and decoupled applications can serve the main homepage.
        </p>

        <div class="port-preset-row">
          <button
            type="button"
            :class="['btn-port-preset', { active: (osHomepageMode || 'homepage') === 'homepage' }]"
            :disabled="isActionPending"
            @click="handleSelectHomepageMode('homepage')"
          >
            <span>YouMeOS WebTop</span>
            <span class="preset-sub">Root Homepage (/)</span>
          </button>

          <button
            type="button"
            :class="['btn-port-preset', { active: osHomepageMode === 'routes_only' }]"
            :disabled="isActionPending"
            @click="handleSelectHomepageMode('routes_only')"
          >
            <span>Standard Site</span>
            <span class="preset-sub">Routes Only (/youmeos)</span>
          </button>
        </div>

        <div class="route-preview-box">
          <div class="route-preview-item">
            <span class="route-preview-label">Root (/)</span>
            <span class="route-preview-val">{{ (osHomepageMode === 'routes_only') ? 'WordPress Theme / Application' : 'YouMeOS Spatial WebTop' }}</span>
          </div>
          <div class="route-preview-item">
            <span class="route-preview-label">Portal Route</span>
            <span class="route-preview-val">/youmeos &amp; /os (Always Available)</span>
          </div>
        </div>
      </div>

      <!-- 4. Gateway Port Configuration Card -->
      <div class="dash-card glass-panel">
        <div class="card-header">
          <div class="card-title-group">
            <BaseIcon
              name="port"
              :size="16"
            />
            <h3 class="card-title">Gateway Port Configuration</h3>
          </div>
          <span class="port-active-badge">Active: :{{ activePort || 80 }}</span>
        </div>
        <p class="dash-card-desc">
          Change the HTTP port binding if port 80 is occupied by another local service or requires root privileges.
        </p>

        <div class="port-preset-row">
          <button
            v-for="p in [80, 8080, 8088, 3000, 8888]"
            :key="p"
            type="button"
            :class="['btn-port-preset', { active: (activePort || 80) === p }]"
            :disabled="isActionPending"
            @click="handleSelectPort(p)"
          >
            <span>:{{ p }}</span>
            <span class="preset-sub">{{ p === 80 ? 'Standard' : (p >= 1024 ? 'Unprivileged' : 'Custom') }}</span>
          </button>
        </div>

        <div class="port-custom-field">
          <label class="control-label">Custom Port Number</label>
          <div class="port-input-group">
            <input
              v-model.number="customPortInput"
              type="number"
              min="1"
              max="65535"
              class="port-input"
              placeholder="e.g. 8080"
              :disabled="isActionPending"
              @keyup.enter="handleApplyCustomPort"
            />
            <button
              type="button"
              class="btn-modal-primary btn-apply-port"
              :disabled="isActionPending || !customPortInput || customPortInput === (activePort || 80)"
              @click="handleApplyCustomPort"
            >
              <BaseIcon
                name="check"
                :size="13"
              />
              <span>Apply Port</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseIcon from '../../atoms/BaseIcon.vue';
import EngineSelector from '../../molecules/EngineSelector.vue';
import type { DesktopApi, EngineType } from '../../../types';

const props = defineProps<{
  engineType: EngineType;
  activePort?: number;
  osHomepageMode?: string;
  devMode?: boolean;
  isActionPending: boolean;
  api: DesktopApi;
}>();

const emit = defineEmits<{
  (e: 'setEngineType', val: EngineType): void;
  (e: 'setPort', port: number): void;
  (e: 'setHomepageMode', mode: string): void;
  (e: 'setDevMode', val: boolean): void;
  (e: 'toggleConsole'): void;
}>();

const customPortInput = ref<number>(props.activePort || 80);
const isUpdatingPlugins = ref<boolean>(false);
const pluginUpdateFeedback = ref<string>('');

const handleSelectPort = (port: number) => {
  customPortInput.value = port;
  emit('setPort', port);
};

const handleSelectHomepageMode = (mode: string) => {
  emit('setHomepageMode', mode);
};

const handleApplyCustomPort = () => {
  const parsed = Number(customPortInput.value);
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 65535) {
    emit('setPort', parsed);
  }
};

const handleOpenPluginsFolder = () => {
  props.api?.openBlackboxFolder?.('plugins');
};

const handleUpdatePlugins = async () => {
  isUpdatingPlugins.value = true;
  pluginUpdateFeedback.value = '';
  emit('toggleConsole');
  try {
    const res = await props.api.updatePlugins();
    if (res?.success) {
      pluginUpdateFeedback.value = res.updatedCount > 0
        ? `Successfully updated ${res.updatedCount} plugin(s).`
        : 'All plugins are up to date.';
    } else {
      pluginUpdateFeedback.value = `Update completed with warnings: ${res?.error || res?.stderr || 'Check console logs for details.'}`;
    }
  } catch (e: any) {
    pluginUpdateFeedback.value = `Update failed: ${e?.message || e}`;
  } finally {
    isUpdatingPlugins.value = false;
  }
};
</script>

<style scoped>
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  padding-bottom: 6px;
}

.dash-settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.dash-card {
  background: var(--bg-glass);
  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 20px rgba(0, 0, 0, 0.4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-cyan);
}

.card-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.1px;
}

.dash-card-desc {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 12px;
}

.settings-field {
  margin-top: 8px;
}

.control-label {
  font-size: 0.70rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
  display: block;
}

.homepage-mode-badge, .port-active-badge {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  background: rgba(98, 201, 255, 0.14);
  color: var(--accent-cyan);
  border: 1px solid var(--border-glass);
  padding: 2px 7px;
  border-radius: 4px;
}

.homepage-mode-badge.is-routes-only {
  background: rgba(251, 191, 36, 0.14);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}

.port-preset-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.btn-port-preset {
  background: rgba(14, 22, 38, 0.85);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  color: #fff;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: all 0.18s ease;
}

.btn-port-preset:hover:not(:disabled) {
  border-color: var(--accent-cyan);
  background: rgba(98, 201, 255, 0.08);
}

.btn-port-preset.active {
  border-color: var(--accent-cyan);
  background: rgba(98, 201, 255, 0.16);
  box-shadow: 0 0 10px rgba(98, 201, 255, 0.2);
}

.preset-sub {
  font-size: 0.62rem;
  color: var(--text-muted);
  font-weight: normal;
}

.route-preview-box {
  background: rgba(14, 22, 38, 0.85);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.route-preview-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
}

.route-preview-label {
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.route-preview-val {
  color: #fff;
  font-weight: 500;
}

.port-custom-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.port-input-group {
  display: flex;
  gap: 8px;
}

.port-input {
  flex: 1;
  background: rgba(14, 22, 38, 0.85);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: #fff;
  padding: 6px 10px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  outline: none;
}

.port-input:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 8px var(--accent-cyan-glow);
}

.btn-apply-port {
  white-space: nowrap;
}

.btn-modal-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--accent-cyan), #0077b6);
  color: #04070e;
  font-weight: 700;
  font-size: 0.76rem;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-primary:hover:not(:disabled) {
  box-shadow: 0 0 14px var(--accent-cyan-glow);
  transform: translateY(-1px);
}

.btn-modal-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modal-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-glass);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.76rem;
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  transform: translateY(-1px);
}

.btn-modal-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feedback-msg {
  font-size: 0.72rem;
  color: var(--accent-cyan);
  margin-top: 6px;
  display: block;
}
</style>
