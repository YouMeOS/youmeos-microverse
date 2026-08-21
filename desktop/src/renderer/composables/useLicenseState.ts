import { ref, computed } from 'vue';
import { useMicroverseApi } from './useMicroverseApi';
import { COMPASS_TIER_COLORS } from '../architecture-3d';
import {
  BOX_TIERS,
  COMPASS_PLUGINS,
  TIER_ORDER,
  TESSERACT_SPARK_URL,
  type TierInfo,
  type CompassPluginData
} from '../license-cloud-manager';

export function useLicenseState(onTierChanged?: (tier: string) => void) {
  const api = useMicroverseApi();

  // 1. Reactive Primitives
  const isModalOpen = ref<boolean>(false);
  const currentTier = ref<string>(localStorage.getItem('youmeosLicenseTier') || 'black');
  const currentKey = ref<string>(localStorage.getItem('youmeosLicenseKey') || 'BLCK-SOVEREIGN-LOCAL-2026');
  const activeSparkFilter = ref<'all' | 'spark' | 'portal'>('all');
  const isSparksCollapsed = ref<boolean>(true);
  const inputKey = ref<string>('');
  const feedbackMsg = ref<{ text: string; type: 'success' | 'error' } | null>(null);
  const isCheckingOut = ref<boolean>(false);

  // 2. Computed State
  const currentTierData = computed<TierInfo>(() => {
    return BOX_TIERS.find(t => t.id === currentTier.value) || BOX_TIERS[0];
  });

  const currentTierColor = computed(() => {
    return COMPASS_TIER_COLORS[currentTier.value] || COMPASS_TIER_COLORS.black;
  });

  const currentTierIndex = computed(() => {
    return TIER_ORDER.indexOf(currentTier.value);
  });

  const filteredSparks = computed(() => {
    const filter = activeSparkFilter.value;
    const list = COMPASS_PLUGINS.filter(p => {
      if (filter === 'spark') return p.type === 'spark';
      if (filter === 'portal') return p.type === 'portal';
      return true;
    });

    return list.map(p => {
      const requiredIdx = TIER_ORDER.indexOf(p.minTier);
      const isUnlocked = currentTierIndex.value >= requiredIdx;
      return {
        ...p,
        isUnlocked
      };
    });
  });

  const unlockedCount = computed(() => {
    return filteredSparks.value.filter(s => s.isUnlocked).length;
  });

  // 3. Helper Methods
  const showFeedback = (text: string, type: 'success' | 'error') => {
    feedbackMsg.value = { text, type };
    setTimeout(() => {
      if (feedbackMsg.value?.text === text) {
        feedbackMsg.value = null;
      }
    }, 4000);
  };

  const setTier = (tier: string, key?: string) => {
    const normalized = (tier || 'black').toLowerCase().replace('box', '').replace('-enhanced', '');
    currentTier.value = normalized;
    if (key) {
      currentKey.value = key;
      localStorage.setItem('youmeosLicenseKey', key);
    }
    localStorage.setItem('youmeosLicenseTier', normalized);
    localStorage.setItem('youmeosLicenseStatus', 'active');

    if (onTierChanged) {
      onTierChanged(normalized);
    }
  };

  const openModal = () => {
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const toggleSparksCollapse = () => {
    isSparksCollapsed.value = !isSparksCollapsed.value;
  };

  const activateKey = () => {
    const raw = inputKey.value.trim().toUpperCase();
    if (!raw) {
      showFeedback('Please enter a valid license key', 'error');
      return;
    }

    let detectedTier = 'black';
    if (raw.startsWith('BRNZ')) detectedTier = 'bronze';
    else if (raw.startsWith('SLVR')) detectedTier = 'silver';
    else if (raw.startsWith('GOLD')) detectedTier = 'gold';
    else if (raw.startsWith('PLAT')) detectedTier = 'platinum';
    else if (raw.startsWith('URAN')) detectedTier = 'uranium';
    else if (raw.startsWith('TITN')) detectedTier = 'titanium';
    else if (raw.startsWith('PLDM')) detectedTier = 'palladium';
    else if (raw.startsWith('BLCK') || raw.startsWith('QNTM')) detectedTier = 'black';

    setTier(detectedTier, raw);
    inputKey.value = '';
    showFeedback(`License key successfully verified! ${detectedTier.toUpperCase()} tier unlocked.`, 'success');
  };

  const openTesseractCloud = () => {
    if (api.openUrl) {
      api.openUrl(TESSERACT_SPARK_URL);
    } else {
      window.open(TESSERACT_SPARK_URL, '_blank');
    }
  };

  const triggerStripeCheckout = async () => {
    const tierKey = currentTier.value;
    const tierData = currentTierData.value;
    const priceStr = tierData.localPrice;
    const parsedPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 9.99;
    const licenseName = `${tierData.name} Compass Software License`;
    const productName = `YouMeOS Sovereignty - ${tierData.name} Compass License (${priceStr})`;

    isCheckingOut.value = true;
    try {
      const successUrl = `https://youmeos.com/callback/stripe?status=success&tier=${encodeURIComponent(tierKey)}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `https://youmeos.com/callback/stripe?status=cancel&tier=${encodeURIComponent(tierKey)}`;

      const response = await fetch('https://youmeos.com/wp-json/xophz/v1/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parsedPrice,
          license: licenseName,
          product_name: productName,
          tier: tierKey,
          success_url: successUrl,
          cancel_url: cancelUrl
        })
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        const errorMsg = data.message || data.error || (typeof data === 'string' ? data : 'Stripe checkout initialization failed');
        throw new Error(`Stripe Checkout Error (${response.status}): ${errorMsg}`);
      }

      const targetUrl = data.url;
      if (api.openStripeCheckout) {
        const result = await api.openStripeCheckout(targetUrl);
        if (result && result.success && result.tier) {
          setTier(result.tier, result.key);
          showFeedback(`Payment verified! ${result.tier.toUpperCase()} Compass license activated.`, 'success');
        }
      } else if (api.openUrl) {
        api.openUrl(targetUrl);
      } else {
        window.open(targetUrl, '_blank');
      }
    } catch (e: any) {
      console.error('Stripe license checkout error:', e);
      showFeedback(`Checkout Error: ${e?.message || e}`, 'error');
    } finally {
      isCheckingOut.value = false;
    }
  };

  // 4. Return Statement
  return {
    isModalOpen,
    currentTier,
    currentKey,
    currentTierData,
    currentTierColor,
    activeSparkFilter,
    isSparksCollapsed,
    inputKey,
    feedbackMsg,
    isCheckingOut,
    filteredSparks,
    unlockedCount,
    setTier,
    openModal,
    closeModal,
    toggleSparksCollapse,
    activateKey,
    openTesseractCloud,
    triggerStripeCheckout
  };
}
