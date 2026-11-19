import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { GameState, Language } from '../types';
import { formatMoney } from '../data/gameConstants';
import { t as tr } from '../data/translations';

interface TeamBondingModalProps {
  state: GameState;
  lang: Language;
  cost: number;
  onClose: () => void;
  onConfirm: () => void;
  canAfford: boolean;
}

export const TeamBondingModal: React.FC<TeamBondingModalProps> = ({ state, lang, cost, onClose, onConfirm, canAfford }) => {
  const isDe = lang === 'de';
  const t = (en: string, de?: string) => tr(lang, en, de);

  const currentMorale = state.club.morale ?? 100;
  const isAlreadyDone = Boolean(state.teamBondingThisSeason);
  const costScaleInfo = t(`Tier ${state.club.tier} football pricing`, `Skaliert für Liga ${state.club.tier}`);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2.5 sm:p-4 bg-[#18191F]/45 backdrop-blur-sm text-left cursor-pointer overflow-y-auto overscroll-contain"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E6E3DC] w-full max-w-md rounded-[28px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(24,25,31,0.18)] flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shrink-0 overflow-hidden relative cursor-default"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-center text-sky-700 text-base shadow-sm shrink-0">
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                  {t('Squad Dynamics', 'Kadermoral')}
                </span>
                <span className="text-[#C7C4BC] text-xs">·</span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isAlreadyDone ? 'text-amber-700' : 'text-[#6B7280]'}`}>
                  {isAlreadyDone ? t('Held This Season', 'Bereits genutzt') : t('1x Per Season', '1x pro Saison')}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#18191F] tracking-tight leading-tight">
                {t('Team Bonding Retreat', 'Team-Building Klausur')}
              </h2>
            </div>
          </div>
          <button 
            aria-label="Close modal" 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#EAE7E0] text-[#6B7280] hover:text-[#18191F] flex items-center justify-center transition border border-[#E6E3DC] cursor-pointer shrink-0"
          >
            <i className="fas fa-xmark text-xs"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4 custom-scrollbar relative z-10">
          {/* Narrative description */}
          <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3 sm:p-3.5 text-xs text-[#4B5563] leading-relaxed font-normal">
            {t(
              'Organize an off-site squad retreat to boost dressing-room morale (1x per season).',
              'Organisiere einen Ausflug für die Mannschaft, um die Kabinenmoral zu stärken (1x pro Saison).'
            )}
          </div>

          {/* Gamble Outcome Probabilities Bento */}
          <div className="bg-[#F5F4F0] border border-[#E6E3DC] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                {t('Gamble Outcome Spectrum', 'Mögliche Spannbreite')}
              </span>
              <span className="font-mono text-xs font-bold text-sky-700 tabular-nums">
                0% – 40% {t('Morale', 'Moral')}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="bg-white rounded-xl p-2.5 border border-[#E6E3DC] text-center">
                <div className="text-[9px] text-[#6B7280] font-semibold uppercase">{t('Flop', 'Flop')}</div>
                <div className="text-sm font-bold text-[#6B7280] tabular-nums mt-0.5">0%</div>
                <div className="text-[9px] text-[#9A9890] mt-0.5">{t('No effect', 'Kein Effekt')}</div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-[#E6E3DC] text-center">
                <div className="text-[9px] text-[#6B7280] font-semibold uppercase">{t('Modest', 'Gering')}</div>
                <div className="text-sm font-bold text-sky-700 tabular-nums mt-0.5">+5-10%</div>
                <div className="text-[9px] text-[#6B7280] mt-0.5">{t('Small spark', 'Etwas Moral')}</div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-[#E6E3DC] text-center">
                <div className="text-[9px] text-[#6B7280] font-semibold uppercase">{t('Solid', 'Solide')}</div>
                <div className="text-sm font-bold text-emerald-700 tabular-nums mt-0.5">+15-25%</div>
                <div className="text-[9px] text-emerald-700 mt-0.5">{t('Good spirit', 'Guter Geist')}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200 text-center">
                <div className="text-[9px] text-amber-800 font-semibold uppercase">{t('Jackpot', 'Jackpot')}</div>
                <div className="text-sm font-bold text-amber-700 tabular-nums mt-0.5">+30-40%</div>
                <div className="text-[9px] text-amber-800 mt-0.5">{t('Camaraderie', 'Mega-Schub')}</div>
              </div>
            </div>

            {/* Current Morale Bar */}
            <div className="pt-2 border-t border-[#E6E3DC] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] text-[#4B5563]">{t('Current Squad Morale', 'Aktuelle Kadermoral')}</span>
                <span className="font-bold text-[#18191F] tabular-nums">{currentMorale}%</span>
              </div>
              <div className="h-2 w-full bg-[#EAE7E0] rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    currentMorale < 40 ? 'bg-rose-600' : currentMorale < 70 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${currentMorale}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E6E3DC] text-xs">
              <span className="text-[#4B5563]">{t('Required Investment', 'Erforderliche Investition')}</span>
              <div className="text-right tabular-nums">
                <span className="font-bold text-[#18191F]">{formatMoney(cost)}</span>
                <span className="text-[10px] text-[#6B7280] ml-1.5 font-normal">· {costScaleInfo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E6E3DC] bg-[#FAF9F6] flex items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={onConfirm}
            disabled={!canAfford || currentMorale >= 100 || isAlreadyDone}
            className={`flex-1 py-3.5 px-5 rounded-2xl font-bold text-xs tracking-wide transition shadow-sm ${
              isAlreadyDone || currentMorale >= 100
                ? 'bg-[#F5F4F0] text-[#9A9890] border border-[#E6E3DC] cursor-not-allowed'
                : !canAfford
                ? 'bg-rose-50 text-rose-700 border border-rose-200 cursor-not-allowed'
                : 'bg-[#18191F] hover:bg-[#2A2C35] active:scale-[0.98] text-white cursor-pointer'
            }`}
          >
            {isAlreadyDone
              ? t('Already Held This Season (1x/Season)', 'Diese Saison bereits genutzt (1x/Saison)')
              : currentMorale >= 100
              ? t('Morale Already Maxed (100%)', 'Moral bereits bei 100%')
              : !canAfford 
              ? t('Insufficient Funds', 'Nicht genügend Budget') 
              : t('Roll The Dice · Authorize Retreat', 'Wagnis eingehen · Klausur starten')}
          </button>
          
          <button 
            aria-label="Close modal" 
            onClick={onClose}
            className="py-3.5 px-5 rounded-2xl bg-white hover:bg-[#EAE7E0] text-[#18191F] font-semibold text-xs transition border border-[#E6E3DC] cursor-pointer"
          >
            {t('Decline', 'Abbrechen')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
