import React from 'react';
import { TransferSaga, TransferSagaOption } from '../types';
import { formatMoney } from '../data/gameConstants';

interface TransferSagaModalProps {
  saga: TransferSaga;
  onSelectOption: (option: TransferSagaOption) => void;
  onClose?: () => void;
}

export const TransferSagaModal: React.FC<TransferSagaModalProps> = ({ saga, onSelectOption, onClose }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSelectOption = (opt: TransferSagaOption) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onSelectOption(opt);
    // Auto-unlock after 400ms so validation returns (e.g. credit/squad limit) do not permanently brick the UI
    setTimeout(() => {
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2.5 sm:p-4 bg-[#18191F]/40 backdrop-blur-md overflow-y-auto overscroll-contain animate-fadeIn cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E6E3DC] rounded-[28px] sm:rounded-[32px] max-w-xl w-full p-4 sm:p-6 text-[#18191F] shadow-[0_24px_64px_rgba(24,25,31,0.16)] relative flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto overflow-hidden text-left shrink-0 cursor-default"
      >
        {/* Header - Pinned at top */}
        <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4 shrink-0 relative z-10">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-lg sm:text-xl shrink-0 mt-0.5">
              <i className="fas fa-handshake-simple"></i>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-0.5">
                High-Stakes Transfer Saga
              </span>
              <h2 className="text-base sm:text-xl font-bold text-[#18191F] leading-tight break-words">{saga.title}</h2>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close transfer saga"
              className="w-8 h-8 rounded-full bg-[#F6F5F1] hover:bg-[#EAE7E0] text-[#52525B] hover:text-[#18191F] flex items-center justify-center transition border border-[#E6E3DC] shrink-0 cursor-pointer"
            >
              <i className="fas fa-xmark text-xs"></i>
            </button>
          )}
        </div>

        {/* Scrollable Body with single-thumb scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar overscroll-contain pr-0.5 space-y-3 sm:space-y-4 relative z-10">
          {/* Player & Suitor Badge */}
          <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs sm:text-sm shrink-0">
                {saga.playerPos}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm sm:text-base text-[#18191F] break-words">{saga.playerName}</div>
                <div className="text-[11px] sm:text-xs text-[#6B6A64] tabular-nums">
                  Overall Rating: <span className="font-mono font-bold text-amber-700">{saga.playerOvr} OVR</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 max-w-[45%]">
              <span className="text-[9px] sm:text-[10px] text-[#6B6A64] uppercase tracking-wider block font-semibold">Interested Party</span>
              <span className="text-xs sm:text-sm font-bold text-rose-700 flex items-center gap-1 justify-end truncate">
                <i className="fas fa-landmark text-[9px] sm:text-[10px] shrink-0"></i> <span className="truncate">{saga.suitorClub}</span>
              </span>
            </div>
          </div>

          {/* Narrative Description */}
          <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed bg-[#FAF9F6] p-3 sm:p-3.5 rounded-xl border border-[#E6E3DC]">
            {saga.narrative}
          </p>

          {/* Options */}
          <div className="space-y-2.5 sm:space-y-3 pb-1">
            {saga.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={isSubmitting}
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left p-3 sm:p-3.5 rounded-2xl bg-[#F6F5F1] hover:bg-[#FAF9F6] border border-[#E6E3DC] hover:border-[#18191F] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group flex items-start gap-3 active:scale-[0.99]"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#E6E3DC] group-hover:bg-amber-50 group-hover:border-amber-200 flex items-center justify-center text-amber-600 text-xs sm:text-sm mt-0.5 shrink-0 transition">
                  <i className={`fas ${opt.icon}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-[#18191F] transition">
                    {opt.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#52525B] mt-0.5 leading-snug">{opt.desc}</div>
                  {/* Consequence tags */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 tabular-nums">
                    {opt.budgetChange !== 0 && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          opt.budgetChange > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {opt.budgetChange > 0 ? '+' : ''}
                        {formatMoney(opt.budgetChange)}
                      </span>
                    )}
                    {opt.ovrChange !== 0 && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          opt.ovrChange > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {opt.ovrChange > 0 ? '+' : ''}
                        {opt.ovrChange} Squad OVR
                      </span>
                    )}
                    {opt.moraleChange !== 0 && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          opt.moraleChange > 0
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {opt.moraleChange > 0 ? '+' : ''}
                        {opt.moraleChange} Morale
                      </span>
                    )}
                    {opt.successRate !== undefined && (
                      <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        {Math.round(opt.successRate * 100)}% Success Odds
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
