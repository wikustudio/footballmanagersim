import React from 'react';
import { motion } from 'motion/react';

export interface OffSeasonEvent {
  id: 'wonderkid' | 'stadium' | 'billionaire';
  titleEn: string;
  titleDe: string;
  descEn: string;
  descDe: string;
  options: { labelEn: string; labelDe: string; action: () => void; bgClass?: string }[];
}

interface Props {
  event: OffSeasonEvent;
}

export const OffSeasonEventModal: React.FC<Props> = ({ event }) => {
  const isGold = event.id === 'billionaire';

  const [isProcessing, setIsProcessing] = React.useState(false);
  const handleAction = (action: () => void) => {
    if (isProcessing) return;
    setIsProcessing(true);
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2.5 sm:p-4 bg-[#18191F]/40 backdrop-blur-md overflow-y-auto overscroll-contain"
    >
      <motion.div 
        role="dialog"
        aria-modal="true"
        aria-label={event.titleEn}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full max-w-md max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shrink-0 overflow-y-auto custom-scrollbar overscroll-contain rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 shadow-[0_24px_64px_rgba(24,25,31,0.16)] text-center cursor-default bg-white border ${
          isGold ? 'border-amber-300' : 'border-[#E6E3DC]'
        }`}
      >
        <div className="relative z-10 mb-5">
          <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 border ${
            isGold 
              ? 'bg-amber-50 border-amber-200 text-amber-600' 
              : 'bg-sky-50 border-sky-200 text-sky-700'
          }`}>
            {event.id === 'wonderkid' && <i className="fa-solid fa-star text-xl" />}
            {event.id === 'stadium' && <i className="fa-solid fa-hammer text-xl" />}
            {event.id === 'billionaire' && <i className="fa-solid fa-coins text-xl" />}
          </div>

          <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
            isGold ? 'text-amber-700' : 'text-sky-700'
          }`}>
            Off-Season Opportunity
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#18191F] mb-2 leading-tight">
            {event.titleEn}
          </h2>

          <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-4 text-xs sm:text-[13px] text-[#52525B] font-normal leading-relaxed mt-3">
            {event.descEn}
          </div>
        </div>
        
        <div className="space-y-2.5 relative z-10">
          {event.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAction(opt.action)}
              className={`w-full py-3.5 px-5 rounded-2xl font-semibold text-xs tracking-wide transition active:scale-[0.99] cursor-pointer shadow-sm ${
                i === 0
                  ? isGold
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-[#18191F] hover:bg-[#2A2B33] text-white'
                  : 'bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F]'
              }`}
            >
              {opt.labelEn}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
