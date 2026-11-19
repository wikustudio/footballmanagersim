import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ConsentPreferences,
  getStoredConsent,
  saveConsent,
  acceptAllConsent,
  rejectAllConsent,
  initializeConsentOnLoad,
} from '../utils/consentMode';

export const ConsentBanner: React.FC = () => {
  const [hasDecision, setHasDecision] = useState<boolean>(true); // Start true to prevent flash
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [customPrefs, setCustomPrefs] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Synchronize Consent Mode v2 signals upon mounting
    initializeConsentOnLoad();

    const stored = getStoredConsent();
    if (!stored) {
      setHasDecision(false);
    } else {
      setCustomPrefs(stored.preferences);
    }

    // Global listener for players who want to revisit settings from in-game links/footer
    const handleReopen = () => {
      const current = getStoredConsent();
      if (current) {
        setCustomPrefs(current.preferences);
      }
      setIsModalOpen(true);
    };

    window.addEventListener('open_privacy_settings', handleReopen);
    return () => {
      window.removeEventListener('open_privacy_settings', handleReopen);
    };
  }, []);

  const handleAcceptAll = () => {
    acceptAllConsent();
    setHasDecision(true);
    setIsModalOpen(false);
  };

  const handleRejectAll = () => {
    rejectAllConsent();
    setHasDecision(true);
    setIsModalOpen(false);
  };

  const handleSaveCustom = () => {
    saveConsent(customPrefs, 'customized');
    setHasDecision(true);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          1. BOTTOM CONSENT BANNER (Shown on first visit until decision)
          ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!hasDecision && !isModalOpen && (
          <motion.aside
            key="gdpr-consent-banner"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            aria-label="Privacy and Cookie Consent"
            className="fixed bottom-3 inset-x-3 sm:bottom-5 sm:inset-x-auto sm:right-6 sm:max-w-xl z-[45] pointer-events-auto"
          >
            <div className="bg-white/95 backdrop-blur-md border border-[#E6E3DC] rounded-[20px] sm:rounded-[24px] p-3 sm:p-5 shadow-[0_20px_50px_rgba(24,25,31,0.16)] text-[#18191F]">
              <div className="flex items-start gap-3 mb-2.5 sm:mb-3.5">
                <div className="hidden sm:flex w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 items-center justify-center shrink-0 text-sky-700">
                  <i className="fa-solid fa-shield-halved text-sm" aria-hidden="true"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                    <h2 className="text-xs sm:text-sm font-bold text-[#18191F] tracking-tight">
                      Privacy &amp; Cookie Consent
                    </h2>
                    <span className="text-[10px] text-[#C7C4BC] font-mono" aria-hidden="true">·</span>
                    <span className="text-[10px] text-[#6B7280] font-mono">GDPR &amp; ePrivacy</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#4B5563] leading-snug sm:leading-relaxed">
                    We use local storage for career saves and optional analytics to improve gameplay. Non-essential cookies stay inactive unless accepted.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Parity of choice between Accept and Reject under EU law */}
              <div className="grid grid-cols-3 sm:flex sm:flex-row items-center justify-end gap-1.5 sm:gap-2 pt-2 sm:pt-2.5 border-t border-[#E6E3DC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-2 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-[#4B5563] hover:text-[#18191F] bg-[#FAF9F6] hover:bg-[#EFECE4] border border-[#E6E3DC] transition text-center whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18191F] cursor-pointer"
                >
                  Preferences
                </button>
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-[#18191F] bg-[#FAF9F6] hover:bg-[#EFECE4] border border-[#E6E3DC] transition text-center whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18191F] cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold text-white bg-[#18191F] hover:bg-[#2A2C35] shadow-sm transition text-center whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18191F] cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────
          2. GRANULAR PREFERENCES MODAL (Manage specific categories)
          ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className="absolute inset-0 bg-[#18191F]/45 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg bg-white border border-[#E6E3DC] rounded-[28px] p-5 sm:p-6 shadow-[0_24px_64px_rgba(24,25,31,0.18)] text-[#18191F] overflow-hidden flex flex-col max-h-[90vh]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="privacy-modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E6E3DC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 text-xs">
                    <i className="fa-solid fa-sliders" aria-hidden="true"></i>
                  </div>
                  <div>
                    <h2 id="privacy-modal-title" className="text-base font-bold text-[#18191F]">
                      Cookie & Storage Preferences
                    </h2>
                    <p className="text-[11px] text-[#6B7280]">
                      Google Consent Mode v2 & GDPR Granular Control
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-xl text-[#6B7280] hover:text-[#18191F] bg-[#FAF9F6] hover:bg-[#EFECE4] border border-[#E6E3DC] flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18191F] cursor-pointer"
                  aria-label="Close preferences modal"
                >
                  <i className="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
                </button>
              </div>

              {/* Category Options List */}
              <div className="overflow-y-auto custom-scrollbar my-4 pr-1 space-y-3 flex-1 text-xs">
                {/* Category 1: Strictly Necessary */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E6E3DC]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#18191F] text-sm">Strictly Necessary</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Always Active
                      </span>
                    </div>
                  </div>
                  <p className="text-[#4B5563] leading-relaxed text-[11px]">
                    Essential for the football simulation to function. Stores career saves, league standings, user session state, and security authentication tokens. These cannot be disabled.
                  </p>
                </div>

                {/* Category 2: Analytics & Measurement */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E6E3DC]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="toggle-analytics" className="font-bold text-[#18191F] text-sm cursor-pointer">
                      Analytics & Performance
                    </label>
                    <input
                      id="toggle-analytics"
                      type="checkbox"
                      checked={customPrefs.analytics}
                      onChange={(e) =>
                        setCustomPrefs((prev) => ({ ...prev, analytics: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#18191F] bg-white border-[#D6D2C7] focus:ring-[#18191F] focus:ring-offset-0 cursor-pointer accent-[#18191F]"
                    />
                  </div>
                  <p className="text-[#4B5563] leading-relaxed text-[11px]">
                    Helps us understand gameplay telemetry, match engine performance, and crash reports using Google Analytics (GA4) with anonymous client identifiers (<code className="text-[#18191F] bg-[#EFECE4] px-1 rounded">analytics_storage</code>).
                  </p>
                </div>

                {/* Category 3: Non-Personalized Ad Measurement */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E6E3DC]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="toggle-marketing" className="font-bold text-[#18191F] text-sm cursor-pointer">
                      Ad Measurement (Non-Personalized)
                    </label>
                    <input
                      id="toggle-marketing"
                      type="checkbox"
                      checked={customPrefs.marketing}
                      onChange={(e) =>
                        setCustomPrefs((prev) => ({ ...prev, marketing: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#18191F] bg-white border-[#D6D2C7] focus:ring-[#18191F] focus:ring-offset-0 cursor-pointer accent-[#18191F]"
                    />
                  </div>
                  <p className="text-[#4B5563] leading-relaxed text-[11px]">
                    Controls non-personalized ad and sponsorship measurement signals (<code className="text-[#18191F] bg-[#EFECE4] px-1 rounded">ad_storage</code>, <code className="text-[#18191F] bg-[#EFECE4] px-1 rounded">ad_user_data</code>). We do not personalize content or ads.
                  </p>
                </div>

                {/* Explicit Guarantee: No Content Personalization */}
                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-sky-900 font-medium">
                    <i className="fa-solid fa-user-shield text-sky-700 text-xs" aria-hidden="true"></i>
                    <span>Content Personalization & Profiling</span>
                  </div>
                  <span className="font-mono text-[10px] text-sky-800">Disabled (Not Used)</span>
                </div>

                {/* Category 4: Functionality & UI Preferences */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E6E3DC]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="toggle-preferences" className="font-bold text-[#18191F] text-sm cursor-pointer">
                      Functional & Game Preferences
                    </label>
                    <input
                      id="toggle-preferences"
                      type="checkbox"
                      checked={customPrefs.preferences}
                      onChange={(e) =>
                        setCustomPrefs((prev) => ({ ...prev, preferences: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#18191F] bg-white border-[#D6D2C7] focus:ring-[#18191F] focus:ring-offset-0 cursor-pointer accent-[#18191F]"
                    />
                  </div>
                  <p className="text-[#4B5563] leading-relaxed text-[11px]">
                    Preserves your customized tactical view settings, sound volume, stadium chant toggles, and custom database modifications across sessions (<code className="text-[#18191F] bg-[#EFECE4] px-1 rounded">functionality_storage</code>).
                  </p>
                </div>
              </div>

              {/* Modal Action Footer */}
              <div className="pt-3 border-t border-[#E6E3DC] flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRejectAll}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-[#18191F] bg-[#FAF9F6] hover:bg-[#EFECE4] border border-[#E6E3DC] transition text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18191F] cursor-pointer"
                  >
                    Reject All
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-[#18191F] bg-[#FAF9F6] hover:bg-[#EFECE4] border border-[#E6E3DC] transition text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18191F] cursor-pointer"
                  >
                    Accept All
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#18191F] hover:bg-[#2A2C35] shadow-sm transition text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18191F] cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
};
export default ConsentBanner;
