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
          </div>          <div class="form-grid-2">
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
                  <option value="private_investigator">Private Investigator / Skip Tracer</option>
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
              YouMeOS equips you with an operating system of decoupled sparks, website hosting, and investigative intelligence.
            </p>
          </div>

          <div class="features-showcase-grid">
            <!-- Feature 1: Skip Tracing Intelligence -->
            <div class="feature-tour-card glass-panel highlight-tour-card">
              <div class="tour-badge-row">
                <span class="tour-tag neon-tag">Intelligence Engine</span>
                <BaseIcon name="search" :size="16" />
              </div>
              <h4 class="tour-title">Skip Tracing &amp; OSINT Discovery</h4>
              <p class="tour-text">
                Locate current contact vectors, active phones with carrier lookup, email deliverability scores, prior addresses, and public records indexed across educational and licensing databases.
              </p>
              <div class="tour-feature-points">
                <div class="point-item">
                  <BaseIcon name="check" :size="12" />
                  <span>Verified phone carriers &amp; DNC status</span>
                </div>
                <div class="point-item">
                  <BaseIcon name="check" :size="12" />
                  <span>Collegiate alumni &amp; license cross-matching</span>
                </div>
                <div class="point-item">
                  <BaseIcon name="check" :size="12" />
                  <span>FCRA &amp; DPPA compliant immutable audit logs</span>
                </div>
              </div>
            </div>

            <!-- Feature 2: Sovereign Website & WebTop Offering -->
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
              Review your verified profile configuration below. You can start conducting skip traces or launch the WebTop.
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
