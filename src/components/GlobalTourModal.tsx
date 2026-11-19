import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { formatNum } from '../data/gameConstants';

interface MatchResult {
  opponent: string;
  ourScore: number;
  theirScore: number;
}

export interface GlobalTourSummaryData {
  matches: MatchResult[];
  fansGained: number;
  moraleChange?: number;
  ovrChange: number;
  cost: number;
  clubName: string;
}

interface GlobalTourModalProps {
  summary: GlobalTourSummaryData;
  lang: 'en' | 'de';
  onClose: () => void;
}

export const GlobalTourModal: React.FC<GlobalTourModalProps> = ({ summary, lang, onClose }) => {
  const isDe = lang === 'de';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-[#18191F]/45 backdrop-blur-sm z-[70] flex flex-col items-center justify-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain cursor-pointer"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-[#18191F] border border-[#E6E3DC] rounded-[28px] sm:rounded-[32px] w-full max-w-md overflow-hidden shadow-[0_24px_64px_rgba(24,25,31,0.18)] relative flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shrink-0 text-left cursor-default"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 text-base shrink-0">
              <i className="fas fa-plane-departure"></i>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 mb-0.5">
                {isDe ? 'Saisonvorbereitung' : 'Pre-Season Expedition'}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18191F] tracking-tight leading-tight">
                {isDe ? 'Tour Zusammenfassung' : 'Global Tour Summary'}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white hover:bg-[#EFECE4] text-[#4B5563] hover:text-[#18191F] flex items-center justify-center transition border border-[#E6E3DC] cursor-pointer shrink-0"
          >
            <i className="fas fa-xmark text-xs"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain custom-scrollbar flex-1 min-h-0 space-y-4 relative z-10">
          <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 text-center">
            <div className="text-xs font-bold text-[#18191F] tracking-tight">
              {summary.clubName} {isDe ? 'Globale Tour' : 'Global Tour'}
            </div>
            <p className="text-xs text-[#6B7280] font-normal mt-0.5">
              {isDe ? 'Drei internationale Vorbereitungsspiele erfolgreich absolviert.' : 'Three international exhibition fixtures completed.'}
            </p>
          </div>

          {/* Fixtures list */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider px-1">
              {isDe ? 'Spielergebnisse' : 'Match Results'}
            </div>
            {summary.matches.map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-[#FAF9F6] hover:bg-[#EFECE4] rounded-xl p-3 border border-[#E6E3DC] transition-colors">
                <div className="w-2/5 text-right text-xs font-semibold text-[#18191F] truncate">{summary.clubName}</div>
                <div className="w-1/5 flex justify-center items-center gap-1.5 font-mono tabular-nums">
                  <span className={`text-sm font-bold ${m.ourScore > m.theirScore ? 'text-emerald-700' : m.ourScore < m.theirScore ? 'text-rose-700' : 'text-[#4B5563]'}`}>
                    {m.ourScore}
                  </span>
                  <span className="text-[#C7C4BC] text-xs">:</span>
                  <span className={`text-sm font-bold ${m.theirScore > m.ourScore ? 'text-emerald-700' : m.theirScore < m.ourScore ? 'text-rose-700' : 'text-[#4B5563]'}`}>
                    {m.theirScore}
                  </span>
                </div>
                <div className="w-2/5 text-left text-xs font-medium text-[#4B5563] truncate">{m.opponent}</div>
              </div>
            ))}
          </div>

          {/* Outcome Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
             <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#E6E3DC] text-center">
               <div className="text-[10px] uppercase tracking-wider font-semibold text-[#6B7280] mb-1">
                 {isDe ? 'Fans Gewonnen' : 'Fans Gained'}
               </div>
               <div className={`text-xl font-bold font-mono tabular-nums ${summary.moraleChange && summary.moraleChange < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                 {`+${(summary.fansGained || 0).toLocaleString()}`}
               </div>
             </div>
             <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#E6E3DC] text-center">
               <div className="text-[10px] uppercase tracking-wider font-semibold text-[#6B7280] mb-1">
                 {isDe ? 'OVR Einfluss' : 'OVR Impact'}
               </div>
               <div className={`text-xl font-bold font-mono tabular-nums ${summary.ovrChange < 0 ? 'text-rose-700' : summary.ovrChange > 0 ? 'text-emerald-700' : 'text-[#4B5563]'}`}>
                 {summary.ovrChange > 0 ? `+${summary.ovrChange}` : summary.ovrChange < 0 ? summary.ovrChange : (isDe ? '0' : '0')}
               </div>
             </div>
          </div>
          
          {summary.ovrChange < 0 && (
             <div className="text-xs text-rose-800 font-medium bg-rose-50 p-3 rounded-2xl border border-rose-200 flex items-center gap-2">
               <i className="fas fa-triangle-exclamation text-rose-600 shrink-0"></i>
               <span>{isDe ? 'Die Spieler sind von den Reisen erschöpft!' : 'The squad is exhausted from the demanding travel schedule.'}</span>
             </div>
          )}
          {summary.ovrChange > 0 && (
             <div className="text-xs text-emerald-800 font-medium bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center gap-2">
               <i className="fas fa-circle-check text-emerald-600 shrink-0"></i>
               <span>{isDe ? 'Die Tour war ein voller Erfolg für die Teammoral!' : 'The tour was a massive success for team cohesion and sharpness.'}</span>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E6E3DC] bg-[#FAF9F6] shrink-0 relative z-10">
          <button 
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] active:scale-[0.98] text-white font-semibold text-sm tracking-wide transition-all shadow-sm cursor-pointer"
          >
            {isDe ? 'Weiter' : 'Continue'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
