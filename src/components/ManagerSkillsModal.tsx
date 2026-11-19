import React from 'react';
import { motion } from 'motion/react';
import { GameState, Language } from '../types';
import { MANAGER_SKILLS } from '../data/gameConstants';
import { t as tr } from '../data/translations';

interface ManagerSkillsModalProps {
  state: GameState;
  lang: Language;
  onClose: () => void;
  onUnlockSkill: (skillId: string) => void;
}

export const ManagerSkillsModal: React.FC<ManagerSkillsModalProps> = ({
  state,
  lang,
  onClose,
  onUnlockSkill,
}) => {
  const isDe = lang === 'de';
  const t = (en: string, de?: string, _ignoredEs?: string) => tr(lang, en, de);

  const skillPoints = state.skillPoints || 0;
  const activeSkills = state.managerSkills || [];
  const activeCount = activeSkills.length;

  const getSkillCost = (count: number) => {
    if (count === 0) return 10;
    if (count === 1) return 15;
    if (count === 2) return 25;
    if (count === 3) return 50;
    return 100;
  };
  const nextCost = getSkillCost(activeCount);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={onClose}
      className="fixed inset-0 bg-[#18191F]/45 backdrop-blur-sm flex flex-col items-center justify-center p-2.5 sm:p-5 z-50 cursor-pointer text-left overflow-y-auto overscroll-contain"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.98, opacity: 0 }} 
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-[#18191F] w-full max-w-4xl rounded-[28px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(24,25,31,0.18)] border border-[#E6E3DC] relative cursor-default max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto flex flex-col overflow-hidden shrink-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] shrink-0 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-center text-sky-700 text-base shrink-0">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 mb-0.5 flex items-center gap-2">
                <span>{t('Sporting Director Competencies', 'Sportdirektor Kompetenzen')}</span>
                <span className="text-[#C7C4BC]">·</span>
                <span className="text-[#6B7280] font-medium tabular-nums">{activeCount} {t('Active Perks', 'Aktive Boni')}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18191F] tracking-tight leading-tight">
                {t('Director Skills & Perks', 'Direktor-Fähigkeiten & Boni')}
              </h2>
            </div>
          </div>

          <button 
            aria-label="Close modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#EFECE4] text-[#6B7280] hover:text-[#18191F] flex items-center justify-center transition cursor-pointer border border-[#E6E3DC] shrink-0"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 custom-scrollbar relative z-10 space-y-5 bg-white">
          {/* Executive Director Points Bento */}
          <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 text-xl shrink-0">
                <i className="fa-solid fa-star"></i>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-[#6B7280] tracking-wider">
                  {t('Available Director Points', 'Verfügbare Direktor-Punkte')}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#18191F] tabular-nums tracking-tight mt-0.5 flex items-baseline gap-2">
                  <span>{skillPoints}</span>
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">DP</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E6E3DC] rounded-xl p-3 text-xs text-[#4B5563] leading-relaxed max-w-md">
              <div className="text-[10px] uppercase font-semibold text-amber-800 mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-trophy text-[9px] text-amber-600"></i>
                <span>{t('Points Acquisition Guidelines', 'Punkte-Erwerb')}</span>
              </div>
              <span>
                {t(
                  `Earn +3 to +12 DP for Trophies, +5 DP for Promotion, and +3 DP for Top Finishes & 5-Year Milestones. Next perk: `,
                  `Verdiene +3 bis +12 DP für Titel, +5 DP für Aufstieg und +3 DP für Top-Platzierungen & 5-Jahres-Jubiläen. Nächster Perk: `
                )}
                <strong className="text-[#18191F] tabular-nums">{nextCost} DP</strong>.
              </span>
            </div>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.values(MANAGER_SKILLS).map((skill) => {
              const isUnlocked = activeSkills.includes(skill.id);
              const cost = nextCost;
              const canAfford = skillPoints >= cost;

              return (
                <div
                  key={skill.id}
                  className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 relative ${
                    isUnlocked
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-[#FAF9F6] hover:bg-[#F5F4F0] border-[#E6E3DC]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base shrink-0 ${
                          isUnlocked
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-white text-amber-700 border border-[#E6E3DC]'
                        }`}
                      >
                        <i className={`fas ${skill.icon}`}></i>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h3 className="text-base font-bold text-[#18191F] tracking-tight break-words">
                            {isDe ? skill.nameDe : skill.nameEn}
                          </h3>
                          {isUnlocked && (
                            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1 shrink-0 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                              <i className="fa-solid fa-check text-[9px]"></i>
                              <span>{t('Active', 'Aktiv')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Effect Card */}
                    <div className="bg-white border border-[#E6E3DC] rounded-xl px-3 py-2 flex items-start gap-2.5 text-xs">
                      <i className="fa-solid fa-bolt text-amber-600 mt-0.5 text-xs shrink-0"></i>
                      <span className="text-[#4B5563] font-medium leading-snug">
                        {isDe ? skill.effectDe : skill.effectEn}
                      </span>
                    </div>
                  </div>

                  {/* Action Slot */}
                  <div className="mt-4 pt-3 border-t border-[#E6E3DC]">
                    {isUnlocked ? (
                      <div className="w-full py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2">
                        <i className="fa-solid fa-shield-check text-xs text-emerald-700"></i>
                        <span>{t('Permanently Activated', 'Dauerhaft freigeschaltet')}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onUnlockSkill(skill.id)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                          canAfford
                            ? 'bg-[#18191F] hover:bg-[#2A2C35] text-white'
                            : 'bg-[#EFECE4] text-[#9A9890] border border-[#E6E3DC] cursor-not-allowed'
                        }`}
                      >
                        <i className="fa-solid fa-lock-open text-xs"></i>
                        <span className="tabular-nums">
                          {canAfford
                            ? `${t('Unlock Perk', 'Perk freischalten')} · ${cost} DP`
                            : `${t('Requires', 'Benötigt')} ${cost} DP (${skillPoints}/${cost})`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E6E3DC] bg-[#FAF9F6] flex items-center justify-between gap-3 shrink-0 relative z-10">
          <div className="text-xs text-[#6B7280]">
            <span>{t('Unlocked perks remain permanent across club changes.', 'Freigeschaltete Boni bleiben auch bei Vereinswechseln dauerhaft aktiv.')}</span>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#EFECE4] text-[#18191F] font-semibold text-xs transition border border-[#E6E3DC] cursor-pointer shrink-0"
          >
            {t('Close', 'Schließen')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
