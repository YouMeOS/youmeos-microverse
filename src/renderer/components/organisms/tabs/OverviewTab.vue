<template>
  <section class="tab-content">
    <!-- Prominent Error Diagnosis & 1-Click Fix Banner -->
    <div
      v-if="status === 'error'"
      class="dash-error-banner glass-panel"
      @click="$emit('openErrorModal')"
    >
      <div class="dash-error-left">
        <div class="dash-error-badge">
          <BaseIcon
            name="alert-triangle"
            :size="20"
          />
        </div>
        <div class="dash-error-info">
          <div class="dash-error-title-row">
            <span class="dash-error-title">{{ errorInfo?.title || 'Engine Startup Failed' }}</span>
            <span class="dash-error-pill">:{{ activePort || 80 }}</span>
          </div>
          <span class="dash-error-desc">
            {{
              errorInfo?.cause || 'Click to inspect detailed error diagnosis and execute automated fix.'
            }}
          </span>
        </div>
      </div>
      <button
        type="button"
        class="btn-dash-fix"
        title="Open Diagnostic & 1-Click Fix Modal"
      >
        <BaseIcon
          name="wrench"
          :size="14"
        />
        <span>Diagnose &amp; Auto-Fix</span>
      </button>
    </div>

    <!-- Architecture Model Overview Grid -->
    <div class="dash-overview-grid">
      <div
        class="dash-card glass-panel"
        :data-layer="'compass'"
        @click="$emit('openLicenseModal')"
      >
        <div class="card-header">
          <span class="dash-card-tag neon-tag">Layer 1</span>
          <span
            class="dash-card-tier"
            :style="{ color: currentTierColor.hex }"
          >
            {{ currentTierData.name }} Compass
          </span>
        </div>
        <h4 class="dash-block-title">My COMPASS Software Suite</h4>
        <p class="dash-block-sub">XP gamification, 4D star navigation, and active sparks license.</p>
      </div>

      <div
        class="dash-card glass-panel"
        :data-layer="'portal'"
        @click="$emit('openUrl', currentGatewayUrl)"
      >
        <div class="card-header">
          <span class="dash-card-tag cyan-tag">Layer 2</span>
          <StatusDot :status="status" />
        </div>
        <h4 class="dash-block-title">YouMeOS</h4>
        <p class="dash-block-sub">Sovereign personal desktop environment with detachable sparks.</p>
      </div>

      <div
        class="dash-card glass-panel"
        :data-layer="'network'"
      >
        <div class="card-header">
          <span class="dash-card-tag coral-tag">Layer 3</span>
          <StatusDot :status="status" />
        </div>
        <h4 class="dash-block-title">Private w⁴ Protocol Network</h4>
        <p class="dash-block-sub">ZeroConf mDNS discovery mesh connecting sovereign nodes.</p>
      </div>

      <div
        class="dash-card glass-panel"
        :data-layer="'server'"
      >
        <div class="card-header">
          <span class="dash-card-tag emerald-tag">Layer 4</span>
          <StatusDot :status="status" />
        </div>
        <h4 class="dash-block-title">w⁴ Tesseract Server</h4>
        <p class="dash-block-sub">FrankenPHP &amp; Caddy proxy routing ports 80 and 443 with TLS.</p>
      </div>

      <div
        class="dash-card glass-panel"
        :data-layer="'core'"
      >
        <div class="card-header">
          <span class="dash-card-tag gold-tag">Layer 5</span>
          <StatusDot :status="status" />
        </div>
        <h4 class="dash-block-title">Headless WP Core</h4>
        <p class="dash-block-sub">Kernel headless runtime powering REST API and plugin pipelines.</p>
      </div>

      <div
        class="dash-card glass-panel"
        :data-layer="'database'"
      >
        <div class="card-header">
          <span class="dash-card-tag purple-tag">Layer 6</span>
          <StatusDot :status="status" />
        </div>
        <h4 class="dash-block-title">Database</h4>
        <p class="dash-block-sub">Zero-configuration single-file database sandbox in wp-content/.</p>
      </div>

      <div
        class="dash-card glass-panel"
        :data-layer="'bedrock'"
      >
        <div class="card-header">
          <span class="dash-card-tag blue-tag">Layer 7</span>
          <StatusDot :status="status" />
        </div>
        <h4 class="dash-block-title">Bedrock</h4>
        <p class="dash-block-sub">Genesis Wave foundation and wp-content/ storage container.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BaseIcon from '../../atoms/BaseIcon.vue';
import StatusDot from '../../atoms/StatusDot.vue';
import type { EngineStatus, EngineErrorInfo, StackLayerStatus } from '../../../types';
import type { TierInfo } from '../../../license-cloud-manager';

defineProps<{
  status: EngineStatus;
  activePort?: number;
  errorInfo?: EngineErrorInfo | null;
  currentGatewayUrl: string;
  currentTierData: TierInfo;
  currentTierColor: { hex: string; three: number };
  stackLayers?: StackLayerStatus[];
}>();

defineEmits<{
  (e: 'openErrorModal'): void;
  (e: 'openLicenseModal'): void;
  (e: 'openUrl', url: string): void;
}>();
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

.dash-error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dash-error-banner:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.55);
}

.dash-error-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dash-error-badge {
  color: #ef4444;
  display: flex;
  align-items: center;
}

.dash-error-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dash-error-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dash-error-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
}

.dash-error-pill {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  padding: 1px 6px;
  border-radius: 4px;
}

.dash-error-desc {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.btn-dash-fix {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-dash-fix:hover {
  opacity: 0.9;
}

.dash-overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 8px;
}

.dash-card {
  background: var(--bg-glass);
  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 20px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dash-card:hover {
  border-color: var(--border-glass-bright);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.dash-card-tag {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.neon-tag {
  background: rgba(0, 242, 254, 0.12);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.3);
}

.cyan-tag {
  background: rgba(98, 201, 255, 0.12);
  color: var(--accent-cyan);
  border: 1px solid var(--border-glass);
}

.coral-tag {
  background: rgba(251, 113, 133, 0.12);
  color: #fb7185;
  border: 1px solid rgba(251, 113, 133, 0.3);
}

.emerald-tag {
  background: rgba(52, 211, 153, 0.12);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.gold-tag {
  background: rgba(251, 191, 36, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.purple-tag {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.blue-tag {
  background: rgba(96, 165, 250, 0.12);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.dash-card-tier {
  font-size: 0.7rem;
  font-weight: 700;
}

.dash-block-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
}

.dash-block-sub {
  font-size: 0.70rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}
</style>
