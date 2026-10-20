declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const initGA = (measurementId: string | undefined) => {
  if (!measurementId) return;
  
  // Prevent multiple initializations if script tag already exists in index.html
  if (document.getElementById('ga-script') || document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    if (typeof window.gtag === 'function') {
      window.gtag('config', measurementId);
    }
    return;
  }

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
};

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Triggers the Consent & Privacy preferences modal from anywhere in the UI
 */
export const openPrivacySettings = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open_privacy_settings'));
  }
};
