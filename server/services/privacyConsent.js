import { PRIVACY_POLICY_VERSION } from '../../shared/privacyPolicy.js';

export function requirePrivacyConsent(value) {
  if (value !== true) {
    throw Object.assign(new Error('You must agree to the Privacy Policy before submitting.'), {
      status: 400,
      publicCode: 'PRIVACY_CONSENT_REQUIRED',
    });
  }

  return {
    privacyConsent: true,
    privacyConsentAt: new Date(),
    privacyPolicyVersion: PRIVACY_POLICY_VERSION,
  };
}