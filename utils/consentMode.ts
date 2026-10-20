/**
 * Google Consent Mode v2 & EU GDPR / ePrivacy Compliance Engine
 * Manages consent signals, gtag consent commands, and persistent storage.
 */

export interface ConsentPreferences {
  necessary: boolean; // Always true (Strictly Necessary for game state & security)
  analytics: boolean; // GA4 / telemetry / error measurement
  marketing: boolean; // Google Ads / ad_storage / ad_user_data / ad_personalization
  preferences: boolean; // Custom themes / audio / device preferences
}

export type ConsentStatus = 'all_accepted' | 'all_rejected' | 'customized';

export interface StoredConsentRecord {
  version: number;
  timestamp: string;
  status: ConsentStatus;
  preferences: ConsentPreferences;
}

export interface GoogleConsentState {
  ad_storage: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  personalization_storage: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  security_storage: 'granted';
}

const STORAGE_KEY = 'football_sim_consent_v2';
const CURRENT_CONSENT_VERSION = 2;

// Declare global gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Maps granular user choices to Google Consent Mode v2 signals
 */
export function mapPreferencesToGoogleConsent(prefs: ConsentPreferences): GoogleConsentState {
  const analyticsGranted = prefs.analytics ? 'granted' : 'denied';
  const marketingGranted = prefs.marketing ? 'granted' : 'denied';
  const prefsGranted = prefs.preferences ? 'granted' : 'denied';

  return {
    ad_storage: marketingGranted,
    analytics_storage: analyticsGranted,
    ad_user_data: marketingGranted,
    ad_personalization: 'denied', // Content and ads are never personalized
    personalization_storage: 'denied', // We do not personalize content or build profiles
    functionality_storage: prefsGranted,
    security_storage: 'granted', // Always granted for essential security & saves
  };
}

/**
 * Dispatches gtag consent command and notifies dataLayer
 */
export function updateGoogleConsentMode(prefs: ConsentPreferences): void {
  const consentState = mapPreferencesToGoogleConsent(prefs);

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    
    // Fallback if gtag is not yet initialized
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', consentState);
    } else {
      window.dataLayer.push(['consent', 'update', consentState]);
    }

    // Push standard event for Google Tag Manager triggers
    window.dataLayer.push({
      event: 'consent_updated',
      consent_status: prefs.marketing && prefs.analytics ? 'granted' : 'custom',
      consent_analytics: consentState.analytics_storage,
      consent_ad_storage: consentState.ad_storage,
      consent_ad_user_data: consentState.ad_user_data,
      consent_ad_personalization: consentState.ad_personalization,
    });
  }
}

/**
 * Retrieves valid persisted consent record or null
 */
export function getStoredConsent(): StoredConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredConsentRecord = JSON.parse(raw);
    if (parsed && parsed.version === CURRENT_CONSENT_VERSION && parsed.preferences) {
      return parsed;
    }
  } catch (err) {
    console.warn('[Consent] Failed to parse stored consent record:', err);
  }
  return null;
}

/**
 * Saves user consent choice, dispatches Google Consent Mode signals, and notifies listeners
 */
export function saveConsent(prefs: ConsentPreferences, status: ConsentStatus): StoredConsentRecord {
  const record: StoredConsentRecord = {
    version: CURRENT_CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    status,
    preferences: {
      necessary: true,
      analytics: Boolean(prefs.analytics),
      marketing: Boolean(prefs.marketing),
      preferences: Boolean(prefs.preferences),
    },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (err) {
    console.warn('[Consent] Could not write consent to localStorage:', err);
  }

  // Update Google Consent Mode v2 signals
  updateGoogleConsentMode(record.preferences);

  // Dispatch custom DOM event for decoupled components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('football_sim_consent_changed', { detail: record }));
  }

  return record;
}

/**
 * Convenience method to accept all categories
 */
export function acceptAllConsent(): StoredConsentRecord {
  return saveConsent(
    {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    },
    'all_accepted'
  );
}

/**
 * Convenience method to reject all non-essential categories (strictly essential only)
 */
export function rejectAllConsent(): StoredConsentRecord {
  return saveConsent(
    {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    },
    'all_rejected'
  );
}

/**
 * Synchronizes consent state on app load
 */
export function initializeConsentOnLoad(): void {
  const existing = getStoredConsent();
  if (existing) {
    updateGoogleConsentMode(existing.preferences);
  } else {
    // Default to denied for GDPR / ePrivacy compliance until user gives explicit consent
    updateGoogleConsentMode({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  }
}
