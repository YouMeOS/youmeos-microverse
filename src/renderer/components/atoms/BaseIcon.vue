<template>
  <svg
    :viewBox="viewBox"
    :width="size"
    :height="size"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    :class="iconClasses"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Brand / Nucleos Logo -->
    <g v-if="name === 'brand'">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </g>

    <!-- Close / Dismiss (X) -->
    <g v-else-if="name === 'close'">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </g>

    <!-- HUD Layout Split -->
    <g v-else-if="name === 'hud'">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </g>

    <!-- Orbit / Rotate Matrix -->
    <g v-else-if="name === 'orbit'">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </g>

    <!-- Chevrons -->
    <polyline v-else-if="name === 'chevron-down'" points="6 9 12 15 18 9" />
    <polyline v-else-if="name === 'chevron-up'" points="18 15 12 9 6 9" />
    <polyline v-else-if="name === 'chevron-right'" points="9 18 15 12 9 6" />

    <!-- External Link -->
    <g v-else-if="name === 'external'">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </g>

    <!-- Copy / Clipboard -->
    <g v-else-if="name === 'copy'">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </g>

    <!-- Checkmark -->
    <polyline v-else-if="name === 'check'" points="20 6 9 17 4 12" />

    <!-- Play / Start -->
    <polygon v-else-if="name === 'start'" points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />

    <!-- Stop -->
    <rect v-else-if="name === 'stop'" x="4" y="4" width="16" height="16" rx="2" ry="2" fill="currentColor" stroke="none" />

    <!-- Restart / Refresh / Spinner -->
    <g v-else-if="name === 'refresh' || name === 'spin'">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </g>

    <!-- Terminal Prompt -->
    <g v-else-if="name === 'terminal'">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </g>

    <!-- Browser Globe / Web -->
    <g v-else-if="name === 'browser'">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </g>

    <!-- Folder / Blackbox -->
    <g v-else-if="name === 'folder'">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </g>

    <!-- Dashboard / Grid -->
    <g v-else-if="name === 'dashboard'">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </g>

    <!-- Spark Dot Core -->
    <g v-else-if="name === 'spark'">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
    </g>

    <!-- Portal / Compass Ring -->
    <g v-else-if="name === 'portal' || name === 'compass'">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </g>

    <!-- Key / License Key -->
    <g v-else-if="name === 'key'">
      <path d="M21 2l-2 2m-1.5 1.5L16 7m-4-4l-8.5 8.5a4.95 4.95 0 0 0 0 7 4.95 4.95 0 0 0 7 0L19 10l-6-6z" />
    </g>

    <!-- Credit Card / Stripe -->
    <g v-else-if="name === 'card'">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </g>

    <!-- Lock / Unlock -->
    <g v-else-if="name === 'lock'">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </g>
    <g v-else-if="name === 'unlock'">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </g>

    <!-- Update Download Cloud -->
    <g v-else-if="name === 'update'">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </g>

    <!-- Search / Magnifier -->
    <g v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </g>

    <!-- Gear / Settings -->
    <g v-else-if="name === 'gear'">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </g>

    <!-- Shield / Security -->
    <g v-else-if="name === 'shield'">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </g>

    <!-- Alert Triangle / Warning -->
    <g v-else-if="name === 'alert' || name === 'warning' || name === 'alert-triangle'">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </g>

    <!-- Alert Circle / Error -->
    <g v-else-if="name === 'error' || name === 'alert-circle'">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </g>

    <!-- Wrench / Tool / Remediation -->
    <g v-else-if="name === 'wrench' || name === 'tool'">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </g>

    <!-- Server Port / Network Plug -->
    <g v-else-if="name === 'port' || name === 'server-port' || name === 'plug'">
      <path d="M12 2v6m0 8v6M2 12h6m8 0h6" />
      <rect x="7" y="7" width="10" height="10" rx="2" ry="2" />
      <circle cx="12" cy="12" r="2" />
    </g>

    <!-- Bolt / Lightning / Power -->
    <g v-else-if="name === 'bolt'">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />
    </g>

    <!-- Star / Superpower -->
    <g v-else-if="name === 'star'">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none" />
    </g>

    <!-- Sparkle / Magic -->
    <g v-else-if="name === 'sparkle'">
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M6.34 6.34l2.12 2.12m7.08 7.08l2.12 2.12M6.34 17.66l2.12-2.12m7.08-7.08l2.12-2.12" />
    </g>

    <!-- Graduation Cap / Education -->
    <g v-else-if="name === 'graduation-cap' || name === 'academic'">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </g>

    <!-- Badge Check / Verification -->
    <g v-else-if="name === 'badge-check' || name === 'verified'">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      <polyline points="9 12 11 14 15 10" />
    </g>

    <!-- User / Profile -->
    <g v-else-if="name === 'user' || name === 'user-check'">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <polyline v-if="name === 'user-check'" points="16 11 18 13 22 9" />
    </g>

    <!-- Phone -->
    <g v-else-if="name === 'phone'">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </g>

    <!-- Mail / Email -->
    <g v-else-if="name === 'mail'">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </g>

    <!-- Map Pin / Address -->
    <g v-else-if="name === 'map-pin' || name === 'location'">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </g>

    <!-- Building / Organization -->
    <g v-else-if="name === 'building'">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </g>

    <!-- File Text / Document / Public Record -->
    <g v-else-if="name === 'file-text' || name === 'document'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </g>

    <!-- Shield Check / Compliance -->
    <g v-else-if="name === 'shield-check'">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </g>

    <!-- Eye / Masking -->
    <g v-else-if="name === 'eye'">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </g>
    <g v-else-if="name === 'eye-slash'">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </g>

    <!-- Download -->
    <g v-else-if="name === 'download'">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </g>

    <!-- Filter -->
    <polygon v-else-if="name === 'filter'" points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />

    <!-- Default Cube / Layers -->
    <g v-else>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number | string;
    viewBox?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    spinning?: boolean;
  }>(),
  {
    size: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    spinning: false
  }
);

const iconClasses = computed(() => {
  return [
    'base-icon',
    props.spinning ? 'spin' : ''
  ];
});
</script>
