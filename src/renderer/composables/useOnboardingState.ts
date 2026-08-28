import { ref, computed } from 'vue';

export interface UserProfileData {
  username: string;
  handle: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  organization: string;
}

export interface EducationCredential {
  institution: string;
  degree: string;
  major: string;
  gradYear: string;
  diplomaId: string;
  verifiedStatus: 'unverified' | 'verifying' | 'verified' | 'failed';
  verificationStamp: string;
}

export interface LicenseCredential {
  licenseType: string;
  jurisdiction: string;
  licenseNumber: string;
  expDate: string;
  verifiedStatus: 'unverified' | 'verifying' | 'verified' | 'failed';
  verificationStamp: string;
}

const STORAGE_KEY_ONBOARDING = 'youmeos_onboarding_v1';

export function useOnboardingState() {
  // 1. Reactive Primitives
  const isOpen = ref<boolean>(false);
  const currentStep = ref<number>(1);
  const totalSteps = ref<number>(4);
  const isVerifying = ref<boolean>(false);
  const verificationError = ref<string>('');

  const defaultProfile: UserProfileData = {
    username: '',
    handle: '',
    fullName: '',
    email: '',
    phone: '',
    avatar: 'avatar-1',
    role: '',
    organization: ''
  };

  const defaultEducation: EducationCredential = {
    institution: '',
    degree: '',
    major: '',
    gradYear: '',
    diplomaId: '',
    verifiedStatus: 'unverified',
    verificationStamp: ''
  };

  const defaultLicense: LicenseCredential = {
    licenseType: 'private_investigator',
    jurisdiction: '',
    licenseNumber: '',
    expDate: '',
    verifiedStatus: 'unverified',
    verificationStamp: ''
  };

  const profile = ref<UserProfileData>({ ...defaultProfile });
  const education = ref<EducationCredential>({ ...defaultEducation });
  const license = ref<LicenseCredential>({ ...defaultLicense });
  const isCompleted = ref<boolean>(false);

  // Load saved state from localStorage
  const loadSavedState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ONBOARDING);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.profile) profile.value = { ...defaultProfile, ...parsed.profile };
        if (parsed.education) education.value = { ...defaultEducation, ...parsed.education };
        if (parsed.license) license.value = { ...defaultLicense, ...parsed.license };
        if (parsed.isCompleted !== undefined) isCompleted.value = parsed.isCompleted;
      }
    } catch {}
  };

  loadSavedState();

  // 2. Computed State
  const isProfileValid = computed(() => {
    const hasName = profile.value.fullName.trim().length > 0;
    const hasHandle = profile.value.handle.trim().length > 0;
    const hasEmail = profile.value.email.trim().length > 0;
    return hasName && hasHandle && hasEmail;
  });

  const isEducationValid = computed(() => {
    const hasInst = education.value.institution.trim().length > 0;
    const hasYear = education.value.gradYear.trim().length === 4;
    return hasInst && hasYear;
  });

  const isLicenseValid = computed(() => {
    const hasNum = license.value.licenseNumber.trim().length > 0;
    const hasJur = license.value.jurisdiction.trim().length > 0;
    return hasNum && hasJur;
  });

  const areCredentialsVerified = computed(() => {
    return education.value.verifiedStatus === 'verified' && license.value.verifiedStatus === 'verified';
  });

  // 3. Helper Methods & Event Handlers
  const persistState = () => {
    try {
      const payload = {
        profile: profile.value,
        education: education.value,
        license: license.value,
        isCompleted: isCompleted.value
      };
      localStorage.setItem(STORAGE_KEY_ONBOARDING, JSON.stringify(payload));
    } catch {}
  };

  const openModal = (step: number = 1) => {
    currentStep.value = step;
    isOpen.value = true;
  };

  const closeModal = () => {
    isOpen.value = false;
  };

  const nextStep = () => {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++;
      persistState();
    }
  };

  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  };

  const setStep = (step: number) => {
    if (step >= 1 && step <= totalSteps.value) {
      currentStep.value = step;
    }
  };

  const verifyEducationCredential = async () => {
    if (!isEducationValid.value) return;
    education.value.verifiedStatus = 'verifying';
    verificationError.value = '';

    await new Promise((resolve) => setTimeout(resolve, 800));

    const randomHash = 'EDU-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-PASS';
    education.value.verifiedStatus = 'verified';
    education.value.verificationStamp = randomHash;
    persistState();
  };

  const verifyLicenseCredential = async () => {
    if (!isLicenseValid.value) return;
    license.value.verifiedStatus = 'verifying';
    verificationError.value = '';

    await new Promise((resolve) => setTimeout(resolve, 900));

    const randomHash = 'LIC-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-ACTIVE';
    license.value.verifiedStatus = 'verified';
    license.value.verificationStamp = randomHash;
    persistState();
  };

  const verifyAllCredentials = async () => {
    isVerifying.value = true;
    try {
      await Promise.all([
        verifyEducationCredential(),
        verifyLicenseCredential()
      ]);
    } finally {
      isVerifying.value = false;
    }
  };

  const completeOnboarding = () => {
    isCompleted.value = true;
    persistState();
    closeModal();
  };

  const resetOnboarding = () => {
    profile.value = { ...defaultProfile };
    education.value = { ...defaultEducation };
    license.value = { ...defaultLicense };
    isCompleted.value = false;
    currentStep.value = 1;
    persistState();
  };

  return {
    isOpen,
    currentStep,
    totalSteps,
    profile,
    education,
    license,
    isCompleted,
    isVerifying,
    verificationError,
    isProfileValid,
    isEducationValid,
    isLicenseValid,
    areCredentialsVerified,
    openModal,
    closeModal,
    nextStep,
    prevStep,
    setStep,
    verifyEducationCredential,
    verifyLicenseCredential,
    verifyAllCredentials,
    completeOnboarding,
    resetOnboarding
  };
}
