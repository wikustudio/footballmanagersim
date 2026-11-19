import React from 'react';
import { motion } from 'motion/react';
import { GameState, Language } from '../types';
import { t } from '../data/translations';
import { getLeagueScaledVal, formatMoney } from '../data/gameConstants';

interface WinterCampModalProps {
  state: GameState;
  lang: Language;
  onSelectCamp: (type: 'local' | 'spain' | 'dubai', cost: number) => void;
  onFireCoach?: () => void;
  onPullYouth?: () => void;
  onClose: () => void;
  creditLimit?: number;
}

export const WinterCampModal: React.FC<WinterCampModalProps> = ({ 
  state, 
  lang, 
  onSelectCamp, 
  onFireCoach, 
  onPullYouth, 
  onClose,
  creditLimit 
}) => {
  const tier = state.club.tier;
  const country = state.club.country || 'GER';
  
  const costSpain = getLeagueScaledVal(tier, 9000, country);
  const costDubai = getLeagueScaledVal(tier, 25000, country);
  const [submitting, setSubmitting] = React.useState(false);

  const canAfford = (c: number) => state.budget - c >= -(creditLimit || 0);
  const isAlreadyDone = Boolean(state.winterCampDone);
  const triggerCamp = (type: 'local' | 'spain' | 'dubai', cost: number) => {
    if (submitting || isAlreadyDone) return;
    if (cost > 0 && !canAfford(cost)) return;
    setSubmitting(true);
    onSelectCamp(type, cost);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col justify-center items-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="absolute inset-0 bg-[#18191F]/40 backdrop-blur-md" onClick={onClose}></div>
      
      <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="relative w-full max-w-[520px] bg-white rounded-[28px] sm:rounded-[32px] border border-[#E6E3DC] shadow-[0_24px_64px_rgba(24,25,31,0.16)] flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shrink-0 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] flex justify-between items-center shrink-0">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5">
              {t(lang, 'Mid-Season Preparation', 'Rückrunden-Vorbereitung')}
            </div>
            <h2 className="text-xl font-bold text-[#18191F] tracking-tight">{t(lang, 'Winter Training Camp', 'Winter-Trainingslager')}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] flex items-center justify-center text-[#52525B] hover:text-[#18191F] transition-colors cursor-pointer">
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        {/* Compact 1-Line Halfway Status Strip */}
        <div className="bg-[#F6F5F1] px-5 sm:px-6 py-2.5 border-b border-[#E6E3DC] flex items-center justify-between text-[11px] text-[#6B6A64] font-medium tracking-tight tabular-nums">
          <span>{t(lang, 'Mid-Season', 'Hinrunde')}: <strong className="text-[#18191F] font-bold">{state.midSeasonPts || 24} Pts</strong></span>
          <span className="text-[#C7C4BC]">·</span>
          <span>{t(lang, 'Board Target', 'Saisonziel')}: <strong className="text-sky-700 font-bold">Top {state.boardTargetFinish || 12}</strong></span>
          <span className="text-[#C7C4BC]">·</span>
          <span>{t(lang, 'Squad Morale', 'Kader-Moral')}: <strong className={`font-bold ${(state.club.morale ?? 100) >= 75 ? 'text-emerald-700' : (state.club.morale ?? 100) >= 50 ? 'text-amber-700' : 'text-rose-700'}`}>{state.club.morale ?? 100}%</strong></span>
        </div>

        <div className="p-5 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar space-y-4">
          {isAlreadyDone && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-700"></i>
              <span>Winter training camp has already been completed this season.</span>
            </div>
          )}

          <p className="text-xs text-[#52525B] font-normal leading-relaxed">
            {t(lang, 'Select a training camp destination to boost morale, tactical sharpness, and squad performance before the season resumes.', 'Wähle ein Trainingslager, um Moral, Taktik und Kaderform vor der Rückrunde gezielt zu stärken.')}
          </p>
          
          <div className="flex gap-2 mb-4">
            {onFireCoach && (
              <button onClick={onFireCoach} className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold py-2 px-3 rounded-xl transition text-[11px] flex items-center justify-center gap-2 cursor-pointer">
                <i className="fas fa-users-viewfinder"></i> {t(lang, 'Hire / Fire Coach', 'Trainer einstellen / feuern')}
              </button>
            )}
            {onPullYouth && state.youthPipeline && state.youthPipeline.length > 0 && (() => {
              const hasEligible = state.youthPipeline.some(y => y.timer <= 1);
              const hasLvl3 = (state.club.academyLevel || 1) >= 3;
              const disabled = !hasEligible || !hasLvl3;
              let tooltip = '';
              if (!hasLvl3) tooltip = t(lang, 'Requires Level 3 Youth Academy', 'Benötigt Akademie-Level 3');
              else if (!hasEligible) tooltip = t(lang, 'No eligible prospects next season', 'Kein Talent für nächste Saison bereit');

              return (
                <button 
                  onClick={disabled ? undefined : onPullYouth} 
                  title={tooltip}
                  disabled={disabled}
                  className={`flex-1 font-semibold py-2 px-3 rounded-xl transition text-[11px] flex items-center justify-center gap-2 ${disabled ? 'bg-[#F6F5F1] text-[#9A9890] border border-[#E6E3DC] cursor-not-allowed opacity-70' : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 cursor-pointer'}`}>
                  <i className="fas fa-child"></i> {t(lang, 'Pull Youth', 'Talent vorziehen')}
                </button>
              );
            })()}
          </div>

          {/* Option 1: Domestic Tactical Lab */}
          <button type="button" onClick={() => triggerCamp('local', 0)} disabled={isAlreadyDone || submitting} className="w-full bg-[#F6F5F1] hover:bg-[#FAF9F6] p-4 rounded-2xl border border-[#E6E3DC] hover:border-[#18191F] text-left transition cursor-pointer flex justify-between items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group">
            <div>
              <div className="font-bold text-[#18191F] text-sm flex items-center gap-2">
                <i className="fa-solid fa-flask-vial text-sky-700 text-xs"></i>
                <span>{t(lang, 'Domestic Tactical Lab', 'Heimisches Taktik-Labor')}</span>
              </div>
              <div className="text-[11px] text-[#52525B] mt-1">{t(lang, 'Tactical drills & intense video analysis.', 'Taktikschulung & Videoanalyse auf heimischer Anlage.')}</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span>+6 {t(lang, 'Morale', 'Moral')}</span>
                <span className="text-[#C7C4BC]">·</span>
                <span className="text-sky-700">{t(lang, '35% Chance +1 OVR (if Morale >= 80%)', '35% Chance auf +1 GES (bei Moral ≥ 80%)')}</span>
              </div>
            </div>
            <div className="text-xs font-bold text-[#18191F] bg-white border border-[#E6E3DC] px-3 py-1.5 rounded-lg shrink-0">Free</div>
          </button>

          {/* Option 2: Warm-Weather Camp · Marbella */}
          <button type="button" onClick={() => triggerCamp('spain', costSpain)} disabled={isAlreadyDone || submitting || !canAfford(costSpain)} className="w-full bg-[#F6F5F1] hover:bg-[#FAF9F6] p-4 rounded-2xl border border-[#E6E3DC] hover:border-[#18191F] text-left transition cursor-pointer flex justify-between items-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed relative overflow-hidden group">
            <div className="relative z-10">
              <div className="font-bold text-[#18191F] text-sm flex items-center gap-2 flex-wrap">
                <i className="fa-solid fa-sun text-amber-600 text-xs"></i>
                <span>{t(lang, 'Warm-Weather Camp (Marbella)', 'Warmwetter-Camp (Marbella)')}</span>
                <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Popular</span>
              </div>
              <div className="text-[11px] text-[#52525B] mt-1">{t(lang, 'Sunny conditions, youth integration & match sharpness.', 'Südliche Sonne, Talentförderung & Spielpraxis.')}</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span>+12 {t(lang, 'Morale', 'Moral')}</span>
                <span className="text-[#C7C4BC]">·</span>
                <span className="text-amber-700">45% {t(lang, 'Chance +1 OVR', 'Chance +1 GES')}</span>
                <span className="text-[#C7C4BC]">·</span>
                <span className="text-sky-700">50% {t(lang, '+1 Youth OVR', '+1 Talent-GES')}</span>
              </div>
            </div>
            <div className={`relative z-10 text-xs font-bold tabular-nums px-3 py-1.5 rounded-lg shrink-0 border ${canAfford(costSpain) ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-[#9A9890] bg-white border-[#E6E3DC]'}`}>
              -{formatMoney(costSpain, country)}
            </div>
          </button>

          {/* Option 3: Elite Commercial Tour (Doha/Tokyo) */}
          <button type="button" onClick={() => triggerCamp('dubai', costDubai)} disabled={isAlreadyDone || submitting || !canAfford(costDubai)} className="w-full bg-amber-50/60 hover:bg-amber-50 p-4 rounded-2xl border border-amber-200 hover:border-amber-400 text-left transition cursor-pointer flex justify-between items-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group">
            <div>
              <div className="font-bold text-amber-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-plane-departure text-amber-600 text-xs"></i>
                <span>{t(lang, 'Elite Commercial Tour (Doha/Tokyo)', 'Elite-Tour (Doha/Tokio)')}</span>
              </div>
              <div className="text-[11px] text-[#52525B] mt-1">{t(lang, 'World-class facilities & high-profile sponsor friendlies.', 'Weltklasse-Infrastruktur & lukrative Testspiele.')}</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span>+20 {t(lang, 'Morale', 'Moral')}</span>
                <span className="text-[#C7C4BC]">·</span>
                <span className="text-amber-700">65% {t(lang, 'Chance +1 OVR', 'Chance +1 GES')}</span>
                <span className="text-[#C7C4BC]">·</span>
                <span className="text-sky-700">+2 Rep & Fans</span>
              </div>
            </div>
            <div className={`text-xs font-bold tabular-nums px-3 py-1.5 rounded-lg shrink-0 border ${canAfford(costDubai) ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-[#9A9890] bg-white border-[#E6E3DC]'}`}>
              -{formatMoney(costDubai, country)}
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
