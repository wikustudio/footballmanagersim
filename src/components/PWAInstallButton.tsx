import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'menu';
  onActionComplete?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  onActionComplete,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      onActionComplete?.();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      {variant === 'menu' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F6F5F1] text-[#18191F] text-xs font-bold transition cursor-pointer text-left"
          data-testid="pwa-install-menu-btn"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#18191F] text-white flex items-center justify-center shrink-0">
              <i className="fa-solid fa-download text-[11px]" />
            </div>
            <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
          </div>
          <span className="text-[10px] font-semibold text-[#6B7280]">PWA</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F6F5F1] border border-[#E6E3DC] text-[#18191F] text-xs font-bold shadow-[0_1px_2px_rgba(24,25,31,0.04)] transition cursor-pointer shrink-0"
          title={isIOS ? 'Install Football Manager Sim on iPhone / iPad' : 'Install Football Manager Sim App'}
          data-testid="pwa-install-header-btn"
        >
          <i className="fa-solid fa-download text-[10px]" />
          <span>{isIOS ? 'Install' : 'Install App'}</span>
        </button>
      )}

      {showIOSGuide && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#18191F]/40 backdrop-blur-sm p-4"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-[24px] bg-white border border-[#E6E3DC] p-6 shadow-[0_24px_64px_rgba(24,25,31,0.18)] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#18191F] border border-[#E6E3DC] shrink-0">
                <img
                  src="/assets/a_footballsim_logo.jpg"
                  alt="Football Manager Sim"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#18191F] leading-tight">
                  Install on iPhone / iPad
                </h3>
                <p className="text-xs text-[#6B7280] font-medium">Play full-screen like a native app</p>
              </div>
            </div>
            <ol className="mt-3 space-y-2 text-xs text-[#4B5563] font-medium leading-relaxed list-decimal list-inside">
              <li>
                Tap the <strong className="text-[#18191F]">Share</strong> icon in Safari&apos;s toolbar.
              </li>
              <li>
                Scroll down and tap <strong className="text-[#18191F]">Add to Home Screen</strong>.
              </li>
              <li>
                Tap <strong className="text-[#18191F]">Add</strong> to launch FootySim from your home screen.
              </li>
            </ol>
            <button
              type="button"
              onClick={() => {
                setShowIOSGuide(false);
                onActionComplete?.();
              }}
              className="mt-5 w-full rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white py-2.5 text-xs font-bold transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
