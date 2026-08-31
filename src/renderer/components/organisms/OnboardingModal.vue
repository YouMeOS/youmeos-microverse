<template>
  <div :class="['custom-modal-backdrop', { hidden: !isOpen }]">
    <div class="onboarding-modal-container glass-panel">
      <!-- Modal Header -->
      <div class="onboarding-modal-header">
        <div class="header-brand-group">
          <BaseIcon name="brand" :size="20" class="neon-brand-icon" />
          <div class="brand-text-col">
            <h3 class="modal-title">YouMeOS Sovereign Onboarding</h3>
            <span class="modal-subtitle">Configure your decentralized profile &amp; verified credentials</span>
          </div>
        </div>

        <button
          type="button"
          class="btn-modal-close"
          title="Close (Can resume later)"
          @click="$emit('close')"
        >
          <BaseIcon name="close" :size="16" />
        </button>
      </div>

      <!-- Stepper Progress Bar Molecule -->
      <OnboardingStepBar
        :current-step="currentStep"
        @select-step="$emit('setStep', $event)"
      />

      <!-- Step Content Area -->
      <div class="onboarding-body-content custom-scrollbar">
        <!-- ============================================ -->
        <!-- STEP 1: SOVEREIGN PROFILE & IDENTITY SETUP -->
        <!-- ============================================ -->
        <div v-if="currentStep === 1" class="step-pane step-pane-profile">
          <div class="pane-intro">
            <h4 class="pane-heading">Set Up Your Sovereign Profile</h4>
            <p class="pane-description">
              Your profile establishes your sovereign identity on the w⁴ protocol and your local BlackBOX instance.
            </p>
          </div>

          <div class="form-grid-2">
            <!-- Username (Local Auth) -->
            <div class="form-group">
              <label class="form-label" for="ob-username">
                <span>Local Node Username *</span>
                <span class="label-hint">Used for local WordPress/Blackbox auth</span>
              </label>
              <div class="input-with-icon">
                <BaseIcon name="key" :size="14" class="input-icon" />
                <input
                  id="ob-username"
                  v-model="profile.username"
                  type="text"
                  class="form-input"
                  placeholder="Enter local username"
                  required
                />
              </div>
            </div>

            <!-- Sovereign Network Handle (@alias.youmeos) -->
            <div class="form-group">
              <label class="form-label" for="ob-handle">
                <span>Sovereign Network Handle *</span>
                <span class="label-hint">Federated w⁴ &amp; Yellow Links ID</span>
              </label>
              <div class="input-with-icon">
                <BaseIcon name="user" :size="14" class="input-icon" />
                <input
                  id="ob-handle"
                  v-model="profile.handle"
                  type="text"
                  class="form-input"
                  placeholder="@yourhandle.youmeos"
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-grid-2">
            <!-- Full Name -->
            <div class="form-group">
              <label class="form-label" for="ob-fullname">
                <span>Full Display Name *</span>
              </label>
              <input
                id="ob-fullname"
                v-model="profile.fullName"
                type="text"
                class="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="form-label" for="ob-email">
                <span>Primary Contact Email *</span>
              </label>
              <div class="input-with-icon">
                <BaseIcon name="mail" :size="14" class="input-icon" />
                <input
                  id="ob-email"
                  v-model="profile.email"
                  type="email"
                  class="form-input"
                  placeholder="yourname@domain.com"
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-grid-3">
            <!-- Phone -->
            <div class="form-group">
              <label class="form-label" for="ob-phone">
                <span>Phone Number</span>
              </label>
              <div class="input-with-icon">
                <BaseIcon name="phone" :size="14" class="input-icon" />
                <input
                  id="ob-phone"
                  v-model="profile.phone"
                  type="tel"
                  class="form-input"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>

            <!-- Role -->
            <div class="form-group">
              <label class="form-label" for="ob-role">
                <span>Primary Role / Title</span>
              </label>
              <input
                id="ob-role"
                v-model="profile.role"
                type="text"
                class="form-input"
                placeholder="Your role or title"
              />
            </div>

            <!-- Organization -->
            <div class="form-group">
              <label class="form-label" for="ob-org">
                <span>Organization / Entity</span>
              </label>
              <div class="input-with-icon">
                <BaseIcon name="building" :size="14" class="input-icon" />
                <input
                  id="ob-org"
                  v-model="profile.organization"
                  type="text"
                  class="form-input"
                  placeholder="Organization or firm name"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- STEP 2: CREDENTIAL VERIFICATION -->
        <!-- ============================================ -->
        <div v-if="currentStep === 2" class="step-pane step-pane-credentials">
          <div class="pane-intro">
            <h4 class="pane-heading">Verify Your Academic &amp; Professional Credentials</h4>
            <p class="pane-description">
              YouMeOS links verified graduation records and professional licenses directly to your Sovereign Passport.
            </p>
          </div>

          <div class="credentials-split-grid">
            <!-- Left: Educational Graduation Verification Form -->
            <div class="credential-input-card glass-panel">
              <div class="card-inner-header">
                <BaseIcon name="graduation-cap" :size="16" />
                <h5 class="card-inner-title">1. University Graduation Verification</h5>
              </div>

              <div class="form-group">
                <label class="form-label" for="edu-inst">Higher Education Institution *</label>
                <input
                  id="edu-inst"
                  v-model="education.institution"
                  type="text"
                  class="form-input"
                  placeholder="Enter college or university name"
                  required
                />
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="edu-deg">Degree Conferred</label>
                  <input
                    id="edu-deg"
                    v-model="education.degree"
                    type="text"
                    class="form-input"
                    placeholder="Degree earned (e.g. B.S., B.A., J.D.)"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="edu-year">Graduation Year *</label>
                  <input
                    id="edu-year"
                    v-model="education.gradYear"
                    type="text"
                    class="form-input font-mono"
                    placeholder="YYYY"
                    maxlength="4"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="edu-major">Major / Field of Study</label>
                <input
                  id="edu-major"
                  v-model="education.major"
                  type="text"
                  class="form-input"
                  placeholder="Major / Field of study"
                />
              </div>

              <div class="verification-action-row">
                <button
                  type="button"
                  class="btn-verify-sub"
                  :disabled="education.verifiedStatus === 'verifying' || !education.institution"
                  @click="$emit('verifyEducation')"
                >
                  <BaseIcon
                    v-if="education.verifiedStatus === 'verifying'"
                    name="spin"
                    :size="12"
                    :spinning="true"
                  />
                  <BaseIcon
                    v-else-if="education.verifiedStatus === 'verified'"
                    name="check"
                    :size="12"
                  />
                  <BaseIcon
                    v-else
                    name="badge-check"
                    :size="12"
                  />
                  <span>{{ education.verifiedStatus === 'verified' ? 'Graduation Verified' : 'Verify via Academic Registry' }}</span>
                </button>

                <span v-if="education.verificationStamp" class="verified-seal font-mono">
                  {{ education.verificationStamp }}
                </span>
              </div>
            </div>

            <!-- Right: Professional License Verification Form -->
            <div class="credential-input-card glass-panel">
              <div class="card-inner-header">
                <BaseIcon name="badge-check" :size="16" />
                <h5 class="card-inner-title">2. Professional Licensure Verification</h5>
              </div>

              <div class="form-group">
                <label class="form-label" for="lic-type">Professional License Category *</label>
                <select
                  id="lic-type"
                  v-model="license.licenseType"
                  class="form-select"
                >
                  <option value="legal_bar">State Bar / Legal Counselor</option>
                  <option value="medical">Medical Board Licensure</option>
                  <option value="cpa">Certified Public Accountant (CPA)</option>
                  <option value="real_estate">Real Estate Broker / Appraisal</option>
                  <option value="engineering">Professional Engineer (PE)</option>
                  <option value="security">Information Security Auditor</option>
                </select>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="lic-jur">Issuing Jurisdiction *</label>
                  <input
                    id="lic-jur"
                    v-model="license.jurisdiction"
                    type="text"
                    class="form-input"
                    placeholder="Issuing state or board"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="lic-num">License Number *</label>
                  <input
                    id="lic-num"
                    v-model="license.licenseNumber"
                    type="text"
                    class="form-input font-mono"
                    placeholder="Enter license number"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="lic-exp">Expiration Date</label>
                <input
                  id="lic-exp"
                  v-model="license.expDate"
                  type="date"
                  class="form-input font-mono"
                />
              </div>

              <div class="verification-action-row">
                <button
                  type="button"
                  class="btn-verify-sub"
                  :disabled="license.verifiedStatus === 'verifying' || !license.licenseNumber"
                  @click="$emit('verifyLicense')"
                >
                  <BaseIcon
                    v-if="license.verifiedStatus === 'verifying'"
                    name="spin"
                    :size="12"
                    :spinning="true"
                  />
                  <BaseIcon
                    v-else-if="license.verifiedStatus === 'verified'"
                    name="check"
                    :size="12"
                  />
                  <BaseIcon
                    v-else
                    name="badge-check"
                    :size="12"
                  />
                  <span>{{ license.verifiedStatus === 'verified' ? 'License Verified Active' : 'Verify with Licensing Board' }}</span>
                </button>

                <span v-if="license.verificationStamp" class="verified-seal font-mono">
                  {{ license.verificationStamp }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- STEP 3: PLATFORM & CORE FEATURES SHOWCASE -->
        <!-- ============================================ -->
        <div v-if="currentStep === 3" class="step-pane step-pane-features">
          <div class="pane-intro">
            <h4 class="pane-heading">Explore Platform Superpowers &amp; Features</h4>
            <p class="pane-description">
              YouMeOS equips you with an operating system of decoupled sparks, sovereign website hosting, and unified directory authority.
            </p>
          </div>

          <div class="features-showcase-grid">
            <!-- Feature 1: Sovereign Website & WebTop Offering -->
            <div class="feature-tour-card glass-panel">
              <div class="tour-badge-row">
                <span class="tour-tag cyan-tag">Sovereign Hosting</span>
                <BaseIcon name="browser" :size="16" />
              </div>
              <h4 class="tour-title">Sovereign Websites &amp; WebTop</h4>
              <p class="tour-text">
                Deploy fast, private websites directly from your local FrankenPHP/Caddy node with zero proprietary lock-in and instant custom domain routing.
              </p>
              <div class="tour-feature-points">
                <div class="point-item">
                  <BaseIcon name="check" :size="12" />
                  <span>Zero-config single-file SQLite database</span>
                </div>
                <div class="point-item">
                  <BaseIcon name="check" :size="12" />
                  <span>Decoupled PWA Sparks &amp; Spatial HUD</span>
                </div>
                <div class="point-item">
                  <BaseIcon name="check" :size="12" />
                  <span>w⁴ protocol peer-to-peer federation</span>
                </div>
              </div>
            </div>

            <!-- Feature 3: Yellow Links Citation Network -->
            <div class="feature-tour-card glass-panel">
              <div class="tour-badge-row">
                <span class="tour-tag gold-tag">Directory Authority</span>
                <BaseIcon name="external" :size="16" />
              </div>
              <h4 class="tour-title">Yellow Links Living Directory</h4>
              <p class="tour-text">
                Publish verified directory citations, build verifiable domain authority, and install WebSparks with one click directly into your Launch Pad.
              </p>
              <div class="tour-feature-points">
                <div class="point-item">
                  <BaseIcon name="check" :size="12" />
                  <span>Living network registry &amp; backlink authority</span>
                </div>
                <div class="point-item">
                  <BaseIcon name="check" :size="12" />
                  <span>AI safety auditing &amp; PageRank scoring</span>
                </div>
              </div>
            </div>

            <!-- Feature 4: COMPASS Superpower Suite -->
            <div class="feature-tour-card glass-panel">
              <div class="tour-badge-row">
                <span class="tour-tag purple-tag">CRM &amp; Automation</span>
                <BaseIcon name="portal" :size="16" />
              </div>
              <h4 class="tour-title">My COMPASS Superpowers</h4>
              <p class="tour-text">
                Access Questbook CRM for relationship management, Bomb Bag for multi-stage automated drip journeys, and Magic Formula for workflow automations.
              </p>
              <div class="tour-feature-points">
                <div class="point-item">
                  <BaseIcon name="check" :size="12" />
                  <span>Questbook CRM pipeline tracking</span>
                </div>
                <div class="point-item">
                  <BaseIcon name="check" :size="12" />
                  <span>Bomb Bag automated marketing journeys</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- STEP 4: VERIFICATION SUMMARY & LAUNCH -->
        <!-- ============================================ -->
        <div v-if="currentStep === 4" class="step-pane step-pane-summary">
          <div class="pane-intro">
            <h4 class="pane-heading">Your Sovereign Node is Ready</h4>
            <p class="pane-description">
              Review your verified profile configuration below. You can start exploring features or launch the WebTop.
            </p>
          </div>

          <div class="summary-cards-grid">
            <!-- Profile Identity Card -->
            <div class="summary-card glass-panel">
              <div class="summary-header">
                <BaseIcon name="user-check" :size="16" />
                <h5 class="summary-title">Sovereign Identity</h5>
              </div>
              <div class="summary-body">
                <div class="summary-line">
                  <span class="lbl">Display Name:</span>
                  <span class="val">{{ profile.fullName || 'Not configured' }}</span>
                </div>
                <div class="summary-line">
                  <span class="lbl">Sovereign Handle:</span>
                  <span class="val font-mono">{{ profile.handle || 'Not set' }}</span>
                </div>
                <div class="summary-line">
                  <span class="lbl">Local Username:</span>
                  <span class="val font-mono">{{ profile.username || 'Not set' }}</span>
                </div>
                <div class="summary-line">
                  <span class="lbl">Contact Email:</span>
                  <span class="val font-mono">{{ profile.email || 'Not set' }}</span>
                </div>
                <div class="summary-line">
                  <span class="lbl">Role / Org:</span>
                  <span class="val">{{ profile.role || 'Unspecified' }} {{ profile.organization ? `(${profile.organization})` : '' }}</span>
                </div>
              </div>
            </div>

            <!-- Credentials Card -->
            <div class="summary-card glass-panel">
              <div class="summary-header">
                <BaseIcon name="badge-check" :size="16" />
                <h5 class="summary-title">Verified Credentials</h5>
              </div>
              <div class="summary-body">
                <div class="summary-line">
                  <span class="lbl">University Alma Mater:</span>
                  <span class="val">{{ education.institution || 'Not configured' }}</span>
                </div>
                <div class="summary-line">
                  <span class="lbl">Degree / Class:</span>
                  <span class="val">{{ education.degree ? `${education.degree} (${education.gradYear || 'Year unlisted'})` : 'Not specified' }}</span>
                </div>
                <div class="summary-line">
                  <span class="lbl">Education Status:</span>
                  <span class="val tag-verified">
                    <BaseIcon name="check" :size="10" />
                    <span>{{ education.verifiedStatus === 'verified' ? 'Registry Verified' : 'Self-Reported' }}</span>
                  </span>
                </div>
                <div class="summary-line">
                  <span class="lbl">Professional License:</span>
                  <span class="val">{{ license.licenseNumber ? `${license.licenseType} (${license.licenseNumber})` : 'Not configured' }}</span>
                </div>
                <div class="summary-line">
                  <span class="lbl">Licensure Status:</span>
                  <span class="val tag-verified">
                    <BaseIcon name="check" :size="10" />
                    <span>{{ license.verifiedStatus === 'verified' ? 'Board Active' : 'Self-Reported' }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Navigation Footer -->
      <div class="onboarding-modal-footer">
        <button
          v-if="currentStep > 1"
          type="button"
          class="btn-secondary-action"
          @click="$emit('prevStep')"
        >
          <span>Back</span>
        </button>
        <div v-else />

        <div class="footer-right-actions">
          <button
            v-if="currentStep < totalSteps"
            type="button"
            class="btn-primary-action"
            @click="$emit('nextStep')"
          >
            <span>Continue</span>
            <BaseIcon name="chevron-right" :size="14" />
          </button>

          <button
            v-else
            type="button"
            class="btn-primary-action btn-launch-primary"
            @click="$emit('complete')"
          >
            <BaseIcon name="start" :size="14" />
            <span>Complete &amp; Enter YouMeOS</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '../atoms/BaseIcon.vue';
import OnboardingStepBar from '../molecules/OnboardingStepBar.vue';
import type { UserProfileData, EducationCredential, LicenseCredential } from '../../composables/useOnboardingState';

defineProps<{
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  profile: UserProfileData;
  education: EducationCredential;
  license: LicenseCredential;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'setStep', step: number): void;
  (e: 'nextStep'): void;
  (e: 'prevStep'): void;
  (e: 'verifyEducation'): void;
  (e: 'verifyLicense'): void;
  (e: 'complete'): void;
}>();
</script>

<style scoped>
.onboarding-modal-container {
  width: 92vw;
  max-width: 880px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: rgba(8, 14, 28, 0.88);
  backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass-bright);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(98, 201, 255, 0.15);
  overflow: hidden;
  animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.onboarding-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-glass);
  background: rgba(15, 23, 42, 0.5);
}

.header-brand-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.neon-brand-icon {
  color: var(--accent-cyan);
  filter: drop-shadow(0 0 8px var(--accent-cyan-glow));
}

.brand-text-col .modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.brand-text-col .modal-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.btn-modal-close {
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

.btn-modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fff;
}

.onboarding-body-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.pane-intro {
  margin-bottom: 8px;
}

.pane-heading {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.pane-description {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.label-hint {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 400;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon .input-icon {
  position: absolute;
  left: 10px;
  color: var(--text-muted);
  pointer-events: none;
}

.input-with-icon .form-input,
.input-with-icon .form-select {
  padding-left: 32px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(4, 7, 14, 0.65);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.82rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px var(--accent-cyan-glow);
  background: rgba(6, 12, 24, 0.85);
}

.credentials-split-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.credential-input-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-inner-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-glass-subtle);
  color: var(--accent-cyan);
}

.card-inner-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
}

.verification-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.btn-verify-sub {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(98, 201, 255, 0.12);
  border: 1px solid var(--accent-cyan);
  border-radius: var(--radius-sm);
  color: var(--accent-cyan);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-verify-sub:hover:not(:disabled) {
  background: var(--accent-cyan);
  color: #04070e;
  box-shadow: 0 0 12px var(--accent-cyan-glow);
}

.btn-verify-sub:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.verified-seal {
  font-size: 0.7rem;
  color: var(--status-running);
  padding: 3px 8px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 4px;
}

.features-showcase-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.feature-tour-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tour-badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tour-tag {
  font-size: 0.60rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 2px 6px;
  border-radius: 4px;
}

.cyan-tag {
  color: var(--accent-cyan);
  background: rgba(98, 201, 255, 0.12);
  border: 1px solid rgba(98, 201, 255, 0.35);
}

.gold-tag {
  color: var(--accent-gold);
  background: rgba(255, 213, 153, 0.12);
  border: 1px solid rgba(255, 213, 153, 0.35);
}

.purple-tag {
  color: #c084fc;
  background: rgba(192, 132, 252, 0.12);
  border: 1px solid rgba(192, 132, 252, 0.35);
}

.tour-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.tour-text {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.tour-feature-points {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 4px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  color: var(--text-primary);
}

.point-item .base-icon {
  color: var(--status-running);
}

.summary-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.summary-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-cyan);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-glass-subtle);
}

.summary-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
}

.summary-line .lbl {
  color: var(--text-muted);
}

.summary-line .val {
  color: var(--text-primary);
  font-weight: 500;
}

.tag-verified {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--status-running);
  font-weight: 600;
}

.onboarding-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid var(--border-glass);
  background: rgba(15, 23, 42, 0.6);
}

.footer-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-secondary-action {
  padding: 7px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary-action:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border: 1px solid #38bdf8;
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
  transition: all 0.2s ease;
}

.btn-primary-action:hover:not(:disabled) {
  background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.55);
  transform: translateY(-1px);
}

.btn-primary-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-launch-primary {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-color: #34d399;
  box-shadow: 0 0 14px rgba(52, 211, 153, 0.35);
}

.btn-launch-primary:hover {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  box-shadow: 0 0 22px rgba(52, 211, 153, 0.6);
}
</style>
