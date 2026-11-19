import React from 'react';
import { motion } from 'motion/react';

import { GameState } from '../types';

interface ShieldsModalProps {
  state: GameState;
  lang: 'en' | 'de';
  onClose: () => void;
}

export const ShieldsModal: React.FC<ShieldsModalProps> = ({ state, lang, onClose }) => {
  const isDe = lang === 'de';
  
  const shields = state.immunityShields || 0;

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.1, ease: 'linear'}} className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="absolute inset-0 bg-[#18191F]/45 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div initial={{scale: 0.98, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.98, opacity: 0}} transition={{duration: 0.12, ease: [0.16, 1, 0.3, 1]}} className="bg-white w-full max-w-md rounded-[28px] border border-[#E6E3DC] shadow-[0_24px_64px_rgba(24,25,31,0.18)] overflow-hidden relative z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E3DC] bg-[#FAF9F6] flex justify-between items-center relative overflow-hidden shrink-0">
          <h2 className="text-lg font-black text-[#18191F] flex items-center gap-2 relative z-10">
            <i className="fas fa-shield-virus text-amber-600"></i>
            {(isDe ? 'Vorstands-Immunitaet' : 'Board Immunity')}
          </h2>
          <button aria-label="Close modal" onClick={onClose} className="w-8 h-8 rounded-full bg-white hover:bg-[#EAE7E0] border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] hover:text-[#18191F] transition relative z-10 cursor-pointer">
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar overscroll-contain flex flex-col gap-4">
          <div className="bg-[#F5F4F0] rounded-2xl p-4 border border-[#E6E3DC] flex flex-col items-center gap-2 text-center">
             <div className="flex gap-2 mb-2">
                {[1, 2, 3].map(i => (
                   <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border transition-all ${i <= shields ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-[#C7C4BC] border-dashed border-[#D6D3CB]'}`}>
                      <i className="fas fa-shield-virus"></i>
                   </div>
                ))}
             </div>
             <div>
               <div className="text-xl font-black text-amber-700 leading-tight tabular-nums">{shields} / 3</div>
               <div className="text-sm font-bold text-[#18191F]">{(isDe ? 'Aktive Vorstands-Schilde' : 'Active Board Shields')}</div>
             </div>
          </div>

          <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E6E3DC]">
            <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
              The WHYDFML Protocol (What Have You Done For Me Lately) dictates board patience. The board expects you to match or beat your highest ever finish in this tier. Missing that target consumes an Immunity Shield. If you fail with zero shields, you will be sacked!
            </p>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              {(isDe
                ? 'Mit Vorstands-Schilden kannst du eine Entlassung verhindern. Du hast maximal 3 Vorstands-Schilde (Chancen). Du erhaeltst verlorene Vorstands-Schilde durch den Gewinn von Trophaeen zurueck. Alternativ kannst du auch Management-Punkte in den "Unkuendbar"-Bonus investieren.'
                : 'Board Shields prevent you from being fired. You can hold a maximum of 3 shields (chances). You recover lost shields by winning trophies. Alternatively, you can spend Management Points on the "Board Darling" perk to become completely immune to sackings.')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E3DC] bg-[#FAF9F6]">
          <button aria-label="Close modal" onClick={onClose} className="w-full bg-[#18191F] hover:bg-[#2A2C35] text-white font-bold py-3 rounded-xl transition cursor-pointer">
            {isDe ? 'Schliessen' : 'Close'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
