import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { formatMoney } from '../data/gameConstants';
import { t } from '../data/translations';

interface FanBondingModalProps {
  state: GameState;
  lang: string;
  cost: number;
  onConfirm: () => void;
  onClose: () => void;
  creditLimit?: number;
}

export const FanBondingModal: React.FC<FanBondingModalProps> = ({ state, lang, cost, onConfirm, onClose, creditLimit }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = React.useRef(false);
  const canAfford = state.budget - cost >= -(creditLimit || 0);
  const isAlreadyDone = Boolean(state.fanBondingThisSeason);

  const handleConfirm = () => {
    if (processingRef.current || isProcessing || isAlreadyDone || !canAfford) return;
    processingRef.current = true;
    setIsProcessing(true);
    onConfirm();
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col justify-center items-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="absolute inset-0 bg-[#18191F]/45 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative w-full max-w-[400px] max-h-[92vh] sm:max-h-[88vh] min-h-0 shrink-0 overflow-y-auto custom-scrollbar overscroll-contain my-auto bg-white text-[#18191F] rounded-[28px] sm:rounded-[32px] border border-[#E6E3DC] shadow-[0_24px_64px_rgba(24,25,31,0.18)] p-5 sm:p-6 text-left">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center text-3xl mb-4 border border-amber-200">
            <i className='fas fa-bullhorn'></i>
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isAlreadyDone ? 'text-amber-700' : 'text-[#6B7280]'}`}>
              {isAlreadyDone ? t(lang, 'Held This Season', 'Bereits genutzt') : t(lang, '1x Per Season', '1x pro Saison')}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#18191F] tracking-tight">{t(lang, 'Fan Bonding Event', 'Fan-Bindungs-Event')}</h2>
          <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
            {t(lang, 'Host an open training session, meet & greet, or fan festival to appease hardcore supporters and boost reputation.', 'Veranstalte ein offenes Training, Meet & Greet oder Fan-Fest, um die Fans zu beruhigen und Ansehen zu gewinnen.')}
          </p>
        </div>

        <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E6E3DC] mb-4 text-center">
          <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest mb-1">{t(lang, 'Event Cost', 'Event-Kosten')}</div>
          <div className="text-xl font-extrabold text-[#18191F] tabular-nums">{formatMoney(cost)}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
            <div className="text-emerald-700 font-extrabold text-base tabular-nums mb-0.5">+2 to +5</div>
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">{t(lang, 'Reputation', 'Ansehen')}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
            <div className="text-amber-800 font-extrabold text-base tabular-nums mb-0.5">+5,000</div>
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">{t(lang, 'Fans', 'Fans')}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-[#FAF9F6] hover:bg-[#EFECE4] border border-[#E6E3DC] text-[#18191F] font-bold py-3 px-4 rounded-xl transition cursor-pointer text-xs sm:text-sm">
            {t(lang, 'Cancel', 'Abbrechen')}
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isProcessing || isAlreadyDone || !canAfford}
            className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm ${
              isAlreadyDone
                ? 'bg-[#EFECE4] text-[#9A9890] border border-[#E6E3DC] cursor-not-allowed'
                : !canAfford
                ? 'bg-rose-50 text-rose-700 border border-rose-200 cursor-not-allowed'
                : 'bg-[#18191F] hover:bg-[#2A2C35] text-white shadow-sm cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : isAlreadyDone ? (
              <i className="fas fa-lock text-xs"></i>
            ) : (
              <i className="fas fa-check"></i>
            )}
            {isAlreadyDone
              ? t(lang, 'Already Held This Season (1x/Season)', 'Diese Saison bereits genutzt (1x/Saison)')
              : !canAfford
              ? t(lang, 'Insufficient Funds', 'Nicht genügend Budget')
              : t(lang, 'Host Event', 'Veranstalten')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
