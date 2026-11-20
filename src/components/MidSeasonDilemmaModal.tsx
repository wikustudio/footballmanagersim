import React from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { getManagerialDilemmas, ManagerialDilemma } from '../engine/seasonSimEngine';
import { playSound } from '../utils/audio';

interface MidSeasonDilemmaModalProps {
  isOpen: boolean;
  gameState: GameState;
  dilemmaId: string;
  onResolveDilemma: (choice: 'A' | 'B', dilemma: ManagerialDilemma) => void;
}

export const MidSeasonDilemmaModal: React.FC<MidSeasonDilemmaModalProps> = ({
  isOpen,
  gameState,
  dilemmaId,
  onResolveDilemma,
}) => {
  const lang = gameState.language || 'en';
  const dilemmas = getManagerialDilemmas(gameState);
  const dilemma = dilemmas.find((d) => d.id === dilemmaId) || dilemmas[0];
  const hasResolvedRef = React.useRef(false);

  React.useEffect(() => {
    hasResolvedRef.current = false;
  }, [isOpen, dilemmaId]);

  const handleResolveOnce = React.useCallback(
    (choice: 'A' | 'B', resolvedDilemma: ManagerialDilemma) => {
      if (hasResolvedRef.current) return;
      hasResolvedRef.current = true;
      onResolveDilemma(choice, resolvedDilemma);
    },
    [onResolveDilemma]
  );

  React.useEffect(() => {
    if (isOpen && !dilemma) {
      handleResolveOnce('B', {
        id: 'fallback',
        titleEn: 'Standard Preparation',
        titleDe: 'Standard-Vorbereitung',
        categoryEn: 'Mid-Season Briefing',
        categoryDe: 'Halbzeit-Briefing',
        descEn: 'Proceeding with standard mid-season preparation.',
        descDe: 'Standard-Vorbereitung für die Rückrunde.',
        icon: 'fa-clipboard-check',
        optionA: {
          labelEn: 'Continue',
          labelDe: 'Weiter',
          subEn: '',
          subDe: '',
          budgetDeltaK: 0,
          ovrDelta: 0,
          moraleDelta: 0,
          badgeEn: 'NEUTRAL',
          badgeDe: 'NEUTRAL',
          tone: 'emerald',
        },
        optionB: {
          labelEn: 'Continue',
          labelDe: 'Weiter',
          subEn: '',
          subDe: '',
          budgetDeltaK: 0,
          ovrDelta: 0,
          moraleDelta: 0,
          badgeEn: 'NEUTRAL',
          badgeDe: 'NEUTRAL',
          tone: 'sky',
        },
      });
    }
  }, [isOpen, dilemma, handleResolveOnce]);

  if (!isOpen || !dilemma) return null;

  const pending = gameState.pendingSeasonState;
  const currentMd = pending?.dilemmaMatchday || 17;
  const totalMd = pending?.totalMatchdays || 34;
  const halfwaySnapshot =
    pending?.matchdaySchedule?.[Math.min(currentMd - 1, (pending?.matchdaySchedule?.length || 1) - 1)];

  const formatBudget = (valK: number) => {
    const absK = Math.abs(valK);
    const sign = valK < 0 ? '-' : '';
    if (absK >= 1000) return `${sign}€${(absK / 1000).toFixed(2)}M`;
    return `${sign}€${Math.round(absK)}k`;
  };

  const getToneClasses = (tone: 'emerald' | 'sky' | 'amber' | 'rose') => {
    switch (tone) {
      case 'emerald':
        return {
          border: 'border-emerald-200 hover:border-emerald-400',
          bg: 'bg-emerald-50/70 hover:bg-emerald-50',
          accent: 'text-emerald-700',
          hoverTitle: 'group-hover:text-emerald-800',
        };
      case 'sky':
        return {
          border: 'border-sky-200 hover:border-sky-400',
          bg: 'bg-sky-50/70 hover:bg-sky-50',
          accent: 'text-sky-700',
          hoverTitle: 'group-hover:text-sky-800',
        };
      case 'amber':
        return {
          border: 'border-amber-200 hover:border-amber-400',
          bg: 'bg-amber-50/70 hover:bg-amber-50',
          accent: 'text-amber-800',
          hoverTitle: 'group-hover:text-amber-900',
        };
      case 'rose':
      default:
        return {
          border: 'border-rose-200 hover:border-rose-400',
          bg: 'bg-rose-50/70 hover:bg-rose-50',
          accent: 'text-rose-700',
          hoverTitle: 'group-hover:text-rose-800',
        };
    }
  };

  const toneA = getToneClasses(dilemma.optionA.tone);
  const toneB = getToneClasses(dilemma.optionB.tone);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="fixed inset-0 z-[9998] bg-[#18191F]/40 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain text-left"
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] my-auto bg-white border border-[#E6E3DC] rounded-[28px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(24,25,31,0.16)] relative overflow-y-auto custom-scrollbar flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-base shrink-0">
              <i className={`fa-solid ${dilemma.icon}`} />
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-wide text-amber-700 mb-0.5">
                {lang === 'de' ? dilemma.categoryDe : dilemma.categoryEn}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18191F] tracking-tight leading-tight">
                {lang === 'de' ? dilemma.titleDe : dilemma.titleEn}
              </h2>
            </div>
          </div>
          <div className="text-right shrink-0 text-xs font-extrabold tracking-tight text-[#6B6A64] tabular-nums bg-white border border-[#E6E3DC] px-2.5 py-1 rounded-xl">
            MD {currentMd}/{totalMd}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 relative z-10">
          {/* Live Halfway Telemetry Banner */}
          <div className="grid grid-cols-4 gap-2 bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-3 text-center">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64] mb-0.5">
                {lang === 'de' ? 'Platz' : 'Live Pos'}
              </div>
              <div className="text-sm font-extrabold tracking-tight text-[#18191F] tabular-nums">
                #{halfwaySnapshot?.runningPosition || 9}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64] mb-0.5">
                {lang === 'de' ? 'Punkte' : 'Points'}
              </div>
              <div className="text-sm font-extrabold tracking-tight text-emerald-700 tabular-nums">
                {halfwaySnapshot?.runningPoints || 0} PTS
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64] mb-0.5">
                {lang === 'de' ? 'Kader-GES' : 'Squad OVR'}
              </div>
              <div className="text-sm font-extrabold tracking-tight text-sky-700 tabular-nums">
                {Math.round(gameState.club.baseOvr)} OVR
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64] mb-0.5">
                {lang === 'de' ? 'Budget' : 'Treasury'}
              </div>
              <div
                className={`text-sm font-extrabold tracking-tight tabular-nums ${
                  gameState.budget < 0 ? 'text-rose-700' : 'text-[#18191F]'
                }`}
              >
                {formatBudget(gameState.budget)}
              </div>
            </div>
          </div>

          {/* Scenario Narrative */}
          <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-4">
            <p className="text-xs sm:text-[13px] text-[#52525B] leading-relaxed">
              {lang === 'de' ? dilemma.descDe : dilemma.descEn}
            </p>
            <div className="mt-2.5 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5 text-[11px] text-[#6B6A64]">
              <i className="fa-solid fa-bolt text-amber-600 text-[10px]" />
              <span>
                {lang === 'de'
                  ? `Deine Entscheidung berechnet sofort die Rückrunde (Spieltage ${currentMd + 1}–${totalMd}) neu.`
                  : `Your decision immediately recalculates the second half of the season (MD ${currentMd + 1}–${totalMd}).`}
              </span>
            </div>
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {/* Option A */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                handleResolveOnce('A', dilemma);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 group cursor-pointer active:scale-[0.99] ${toneA.border} ${toneA.bg}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-white border border-[#E6E3DC] flex items-center justify-center text-xs font-extrabold tracking-tight text-[#18191F] shrink-0">
                    A
                  </span>
                  <span className={`font-bold text-sm text-[#18191F] transition-colors ${toneA.hoverTitle}`}>
                    {lang === 'de' ? dilemma.optionA.labelDe : dilemma.optionA.labelEn}
                  </span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider tabular-nums ${toneA.accent}`}>
                  {lang === 'de' ? dilemma.optionA.badgeDe : dilemma.optionA.badgeEn}
                </span>
              </div>
              <p className="text-xs text-[#52525B] pl-8.5 leading-snug">
                {lang === 'de' ? dilemma.optionA.subDe : dilemma.optionA.subEn}
              </p>
            </button>

            {/* Option B */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                handleResolveOnce('B', dilemma);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 group cursor-pointer active:scale-[0.99] ${toneB.border} ${toneB.bg}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-white border border-[#E6E3DC] flex items-center justify-center text-xs font-extrabold tracking-tight text-[#18191F] shrink-0">
                    B
                  </span>
                  <span className={`font-bold text-sm text-[#18191F] transition-colors ${toneB.hoverTitle}`}>
                    {lang === 'de' ? dilemma.optionB.labelDe : dilemma.optionB.labelEn}
                  </span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider tabular-nums ${toneB.accent}`}>
                  {lang === 'de' ? dilemma.optionB.badgeDe : dilemma.optionB.badgeEn}
                </span>
              </div>
              <p className="text-xs text-[#52525B] pl-8.5 leading-snug">
                {lang === 'de' ? dilemma.optionB.subDe : dilemma.optionB.subEn}
              </p>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
