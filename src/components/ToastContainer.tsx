import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  const seenToasts = useRef<Set<string>>(new Set());

  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.type === 'success' && !seenToasts.current.has(toast.id)) {
        seenToasts.current.add(toast.id);
        
        const msg = toast.message.toLowerCase();
        let particleColors = ['#38bdf8', '#0284c7', '#34d399', '#ffffff'];
        let count = 45;
        let spread = 60;
        
        if (msg.includes('champion') || msg.includes('meister') || msg.includes('trophy') || msg.includes('pokal') || msg.includes('cup') || msg.includes('world cup')) {
          particleColors = ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff'];
          count = 100;
          spread = 90;
        } else if (msg.includes('runner-up') || msg.includes('vizemeister')) {
          particleColors = ['#38bdf8', '#e0e7ff', '#94a3b8', '#ffffff', '#60a5fa'];
          count = 85;
          spread = 85;
        } else if (msg.includes('promoted') || msg.includes('aufstieg')) {
          particleColors = ['#38bdf8', '#0284c7', '#60a5fa', '#ffffff'];
          count = 75;
          spread = 75;
        }

        confetti({
          particleCount: count,
          spread,
          origin: { y: 0.05 },
          colors: particleColors,
          disableForReducedMotion: true,
          zIndex: 999999,
          ticks: 150,
          gravity: 0.8,
          scalar: 0.85
        });
      } else if (!seenToasts.current.has(toast.id)) {
        seenToasts.current.add(toast.id);
      }
    });
  }, [toasts]);

  if (toasts.length === 0) return null;

  const cleanMessage = (raw: string) => {
    // Strip leading gaming emojis and clean up whitespace
    return raw.replace(/^[\s🏆🥈🚀👑⭐✨🔥💥⚡🎉👏🎖️\-–—]+/u, '').trim();
  };

  const renderFormattedMessage = (msg: string) => {
    const cleaned = cleanMessage(msg);
    // Regex to capture OVR/GES boosts or losses, money gains or losses
    const parts = cleaned.split(/([+-]\s*€?\s*[\d.,]*\d(?:\s*(?:Mio\.|[MKkB]\b))?(?:\s*(?:OVR|GES|Budget|Fans|Einnahmen|Reputation|Rep|Ansehen|DP|MP|Siegchance|Win|Lose|Loss|Sieg|Niederlage|Verlust|Plaetze|Seats|Kapazitaet|Capacity|Zuschauer|Morale|Moral|Youth|Jugend|Squad|Team))?)/gi);

    return parts.map((part, i) => {
      if (/^\+\s*€?\s*[\d.,]/i.test(part)) {
        return (
          <span key={i} className="text-emerald-700 font-bold tracking-tight tabular-nums">
            {part}
          </span>
        );
      }
      if (/^-\s*€?\s*[\d.,]/i.test(part)) {
        return (
          <span key={i} className="text-rose-700 font-bold tracking-tight tabular-nums">
            {part}
          </span>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="fixed top-3 sm:top-6 pt-safe inset-x-0 z-[99999] pointer-events-none grid place-items-center px-3 sm:px-4">
      {toasts.map((toast, index) => {
        const revIndex = toasts.length - 1 - index;
        const msg = toast.message;
        const lower = msg.toLowerCase();

        // Specific toast classifications for winning a league or getting promoted as runner-up
        const isLeagueChampion = lower.includes('champion') || lower.includes('meister') || lower.includes('league title');
        const isRunnerUpPromotion = lower.includes('runner-up') || lower.includes('vizemeister');
        const isGeneralPromotion = !isLeagueChampion && !isRunnerUpPromotion && (lower.includes('promoted') || lower.includes('aufstieg'));

        let icon = 'fa-circle-info text-sky-700';
        let badgeBg = 'bg-sky-50 border-sky-200 text-sky-700';
        let containerBorder = 'border-[#E6E3DC]';
        let containerBg = 'bg-white/95';
        let containerGlow = 'shadow-[0_16px_44px_rgba(24,25,31,0.14)]';
        let kicker: string | null = null;
        let kickerClass = 'text-sky-700';

        if (isLeagueChampion) {
          icon = 'fa-trophy text-amber-700';
          badgeBg = 'bg-amber-50 border-amber-200 text-amber-700';
          containerBorder = 'border-amber-300';
          containerBg = 'bg-gradient-to-r from-amber-50 via-white to-amber-50/70';
          containerGlow = 'shadow-[0_18px_50px_rgba(217,119,6,0.18)]';
          kicker = 'League Champions · Domestic Crown';
          kickerClass = 'text-amber-800';
        } else if (isRunnerUpPromotion) {
          icon = 'fa-medal text-sky-700';
          badgeBg = 'bg-sky-50 border-sky-200 text-sky-700';
          containerBorder = 'border-sky-300';
          containerBg = 'bg-gradient-to-r from-sky-50 via-white to-sky-50/70';
          containerGlow = 'shadow-[0_18px_50px_rgba(2,132,199,0.16)]';
          kicker = 'Runner-Up Promotion · Top 2 Ascent';
          kickerClass = 'text-sky-800';
        } else if (isGeneralPromotion) {
          icon = 'fa-arrow-trend-up text-sky-700';
          badgeBg = 'bg-sky-50 border-sky-200 text-sky-700';
          containerBorder = 'border-sky-200';
          containerBg = 'bg-gradient-to-r from-sky-50 via-white to-emerald-50/60';
          containerGlow = 'shadow-[0_16px_44px_rgba(2,132,199,0.14)]';
          kicker = 'Promotion Secured · Division Ascent';
          kickerClass = 'text-sky-800';
        } else if (toast.type === 'success') {
          icon = 'fa-check text-emerald-700';
          badgeBg = 'bg-emerald-50 border-emerald-200 text-emerald-700';
          containerBorder = 'border-emerald-200';
          containerBg = 'bg-white/95';
          containerGlow = 'shadow-[0_16px_44px_rgba(16,185,129,0.14)]';
        } else if (toast.type === 'error') {
          icon = 'fa-xmark text-rose-700';
          badgeBg = 'bg-rose-50 border-rose-200 text-rose-700';
          containerBorder = 'border-rose-200';
          containerBg = 'bg-white/95';
          containerGlow = 'shadow-[0_16px_44px_rgba(225,29,72,0.14)]';
        } else if (toast.type === 'warning') {
          icon = 'fa-exclamation text-amber-700';
          badgeBg = 'bg-amber-50 border-amber-200 text-amber-700';
          containerBorder = 'border-amber-200';
          containerBg = 'bg-white/95';
        }

        return (
          <div
            key={toast.id}
            style={{ 
              transform: `translateY(${revIndex * 8}px) scale(${1 - revIndex * 0.035})`, 
              zIndex: toasts.length - index,
              opacity: revIndex > 2 ? 0 : 1
            }}
            className={`row-start-1 col-start-1 flex items-center gap-3.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl sm:rounded-[24px] ${containerBg} backdrop-blur-md border ${containerBorder} ${containerGlow} toast-enter pointer-events-auto w-[92vw] sm:w-auto max-w-[95vw] sm:max-w-lg mx-auto transition-all duration-300 ease-out`}
          >
            {/* Icon Badge */}
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${badgeBg} border flex items-center justify-center shrink-0`}>
              <i className={`fas ${icon} text-sm sm:text-base`}></i>
            </div>

            {/* Content Text */}
            <div className="flex flex-col min-w-0 flex-1">
              {kicker && (
                <span className={`text-[10px] font-bold uppercase tracking-wider ${kickerClass} mb-0.5 break-words`}>
                  {kicker}
                </span>
              )}
              <span className="text-xs sm:text-[13px] font-semibold text-[#18191F] tracking-tight leading-snug break-words">
                {renderFormattedMessage(toast.message)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
