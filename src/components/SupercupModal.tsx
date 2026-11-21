import React, { useEffect, useRef, useState } from 'react';
import { GameState, SupercupResult } from '../types';
import { SupercupEligibility, resolveSupercupMatch } from '../engine/liveSimVisualEngine';
import { formatMoney, formatNum } from '../data/gameConstants';
import { ClubLogo } from './ClubLogo';
import { BroadcastBadge } from './BroadcastBadge';
import { CompetitionLogo } from './CompetitionLogo';

interface SupercupModalProps {
  isOpen: boolean;
  gameState: GameState;
  eligibility: SupercupEligibility | null;
  isModActive: boolean;
  onComplete: (result: SupercupResult) => void;
  onClose: () => void;
}

export const SupercupModal: React.FC<SupercupModalProps> = ({
  isOpen,
  gameState,
  eligibility,
  isModActive,
  onComplete,
  onClose,
}) => {
  const [stance, setStance] = useState<'high_press' | 'balanced' | 'counter'>('high_press');
  const [result, setResult] = useState<SupercupResult | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const hasKickedOffRef = useRef(false);
  const isCompletingRef = useRef(false);

  // Reset modal state cleanly whenever opened or eligibility changes across seasons
  useEffect(() => {
    if (isOpen) {
      setStance('high_press');
      setResult(null);
      setIsCompleting(false);
      hasKickedOffRef.current = false;
      isCompletingRef.current = false;
    }
  }, [isOpen, eligibility?.cupName, eligibility?.opponent?.id, gameState.year]);

  // Prevent Escape-key dismissal after match result is already decided (prevents save-scum replay)
  useEffect(() => {
    if (!isOpen || !result) return;
    const blockEscapeAfterResult = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('keydown', blockEscapeAfterResult, true);
    return () => window.removeEventListener('keydown', blockEscapeAfterResult, true);
  }, [isOpen, result]);

  if (!isOpen || !eligibility) return null;

  const handleKickoff = () => {
    if (hasKickedOffRef.current || result) return;
    hasKickedOffRef.current = true;
    const res = resolveSupercupMatch(gameState, eligibility, stance);
    setResult(res);
  };

  const handleComplete = () => {
    if (!result || isCompletingRef.current) return;
    isCompletingRef.current = true;
    setIsCompleting(true);
    onComplete(result);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#18191F]/45 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label={eligibility.cupName}
    >
      <div className="w-full max-w-xl bg-white rounded-[24px] sm:rounded-[32px] border border-[#E6E3DC] shadow-[0_24px_64px_rgba(24,25,31,0.18)] overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh] min-h-0 my-auto shrink-0">
        {/* Top Broadcast Bar (Dark pill protects light-ink broadcaster badges!) */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <CompetitionLogo
              kind="supercup"
              country={gameState.club.country || 'GER'}
              isModActive={isModActive}
              alt={eligibility.cupName}
              className="w-6 h-6 object-contain shrink-0"
              data-testid="supercup-comp-logo"
            />
            <div className="bg-[#10131C] rounded-lg px-2 py-0.5 inline-flex items-center shrink-0">
              <BroadcastBadge
                country={gameState.club.country || 'GER'}
                competitionId="supercup"
                isModActive={isModActive}
                tier={1}
              />
            </div>
            <span className="text-xs font-extrabold text-[#18191F] truncate">
              Pre-Season Curtain Raiser · {eligibility.cupName}
            </span>
          </div>
          {!result && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close supercup showcase"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] text-[#4B5563] hover:text-[#18191F] flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
          {/* Matchup Crest Header */}
          <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex flex-col items-center text-center flex-1 min-w-0">
              <ClubLogo club={gameState.club} size={52} isModActive={isModActive} className="w-12 h-12 sm:w-14 sm:h-14" />
              <div className="text-xs sm:text-sm font-extrabold text-[#18191F] mt-2 break-words">
                {gameState.club.name}
              </div>
              <div className="text-[11px] font-bold text-[#6B7280] tabular-nums">
                {gameState.club.baseOvr} OVR
              </div>
              {eligibility.userQualificationLabel && (
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  {eligibility.userQualificationLabel}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center px-3 shrink-0">
              {result ? (
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-[#18191F] tabular-nums">
                    {result.ourScore} – {result.oppScore}
                  </div>
                  {result.decidedOnPens && (
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mt-1">
                      Pens ({result.ourPenScore}–{result.oppPenScore})
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-[#18191F] text-white text-xs font-black tracking-wider">
                  VS
                </div>
              )}
              <div className="text-[10px] font-semibold text-[#6B7280] mt-1.5 tabular-nums">
                Prize Pool: {formatMoney(eligibility.prizeK)}
              </div>
            </div>

            <div className="flex flex-col items-center text-center flex-1 min-w-0">
              <ClubLogo club={eligibility.opponent} size={52} isModActive={isModActive} className="w-12 h-12 sm:w-14 sm:h-14" />
              <div className="text-xs sm:text-sm font-extrabold text-[#18191F] mt-2 break-words">
                {eligibility.opponent.name}
              </div>
              <div className="text-[11px] font-bold text-[#6B7280] tabular-nums">
                {eligibility.opponent.baseOvr} OVR
              </div>
              {eligibility.opponentQualificationLabel && (
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#4B5563] bg-white border border-[#E6E3DC] px-2 py-0.5 rounded-md">
                  {eligibility.opponentQualificationLabel}
                </div>
              )}
            </div>
          </div>

          {!result ? (
            <>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                  Select Matchday Tactical Stance
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'high_press' as const, title: 'High Press', desc: '+Attacking tempo & early overload' },
                    { id: 'balanced' as const, title: 'Balanced Control', desc: 'Controlled midfield shape' },
                    { id: 'counter' as const, title: 'Counter Block', desc: 'Compact low block + fast transitions' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStance(opt.id)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        stance === opt.id
                          ? 'bg-[#18191F] text-white border-[#18191F]'
                          : 'bg-[#F6F5F1] text-[#18191F] border-[#E6E3DC] hover:border-[#18191F]'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{opt.title}</div>
                      <div
                        className={`text-[10px] mt-1 ${
                          stance === opt.id ? 'text-zinc-300' : 'text-[#6B7280]'
                        }`}
                      >
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleKickoff}
                className="w-full py-3 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-sm font-extrabold transition cursor-pointer shadow-sm"
              >
                Kick Off {eligibility.cupName} →
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div
                className={`rounded-2xl p-4 border text-center ${
                  result.won
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="text-sm font-black uppercase tracking-wider">
                  {result.won
                    ? `${eligibility.cupName} Champions!`
                    : `Runners-Up · ${eligibility.cupName}`}
                </div>
                <div className="text-xs font-semibold mt-1 tabular-nums">
                  {result.won
                    ? `Silverware lifted in front of ${formatNum(Math.round((gameState.club.stadium || 40000) * 0.94))} supporters · +${formatMoney(result.prizeK)} trophy bonus awarded`
                    : `Appearance purse +${formatMoney(result.prizeK)} credited to Treasury.`}
                </div>
              </div>

              <button
                type="button"
                disabled={isCompleting}
                onClick={handleComplete}
                className="w-full py-3 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-extrabold transition cursor-pointer"
              >
                Collect Silverware & Start Season →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
