import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Club, GameState, PressureAssessment, PressureChoiceId, PressureOption } from '../types';
import {
  buildPressureMomentOptions,
  evaluatePerformancePressure,
  getPressureLevelMeta,
  PressureResolutionResult,
  resolveClubNameForPress,
} from '../engine/pressureEngine';
import { formatMoney, getLeagueInfo } from '../data/gameConstants';
import { ClubLogo } from './ClubLogo';
import { resolveHistoryClubDisplay } from '../utils/modSafeguards';

interface PressureMomentModalProps {
  state: GameState;
  clubsDb?: Club[];
  isModActive?: boolean;
  isCrisisTrigger?: boolean;
  creditLimit?: number;
  onResolveChoice: (choiceId: PressureChoiceId, assessment: PressureAssessment) => PressureResolutionResult | null;
  onOpenCoachMarket?: () => void;
  onClose: () => void;
}

export const PressureMomentModal: React.FC<PressureMomentModalProps> = ({
  state,
  clubsDb = [],
  isModActive = false,
  isCrisisTrigger = false,
  creditLimit = 0,
  onResolveChoice,
  onOpenCoachMarket,
  onClose,
}) => {
  const [resolution, setResolution] = useState<PressureResolutionResult | null>(null);

  const resolvedClub = useMemo(
    () =>
      resolveHistoryClubDisplay(
        {
          id: state.club.id,
          name: state.club.name,
          country: state.club.country,
          color: state.club.color,
          logo: state.club.logo,
          fallbackLogo: state.club.fallbackLogo,
        },
        isModActive,
        clubsDb
      ),
    [state.club, isModActive, clubsDb]
  );

  const displayClubName = resolveClubNameForPress(state, clubsDb, isModActive, resolvedClub.name);
  const leagueInfo = getLeagueInfo(state.club.tier || 1, state.club.country || 'GER');

  const assessment = useMemo<PressureAssessment>(() => {
    if (state.pressureContext && state.pressureContext.evaluatedYear === state.year) {
      return state.pressureContext;
    }
    const midPos =
      (state.pendingSeasonState as any)?._meta?.midPos ??
      state.pendingSeasonState?.pos ??
      state.boardTargetFinish ??
      10;
    const midPts =
      state.midSeasonPts ??
      (state.pendingSeasonState as any)?._meta?.midPts ??
      state.pendingSeasonState?.pts ??
      22;
    return evaluatePerformancePressure(
      state,
      {
        phase: state.seasonPhase === 'mid' ? 'mid' : 'dashboard',
        pos: midPos,
        pts: midPts,
        matchdaysPlayed: state.seasonPhase === 'mid' ? 17 : 0,
        clubDisplayName: displayClubName,
      },
      clubsDb,
      isModActive
    );
  }, [state, clubsDb, isModActive, displayClubName]);

  const effectiveScore = resolution ? resolution.updatedState.mediaPressure ?? assessment.pressureScore : assessment.pressureScore;
  const levelMeta = getPressureLevelMeta(effectiveScore);

  const canActThisSeason =
    !resolution &&
    state.pressureMomentResolvedYear !== state.year &&
    (isCrisisTrigger || assessment.scenario !== 'none' || effectiveScore >= 50);

  const options = useMemo<PressureOption[]>(() => {
    if (!canActThisSeason) return [];
    return buildPressureMomentOptions(state, assessment).map((opt) => {
      if (opt.costK && opt.costK > 0 && state.budget - opt.costK < -Math.abs(creditLimit)) {
        return {
          ...opt,
          disabledReason: 'Insufficient funds / credit headroom',
        };
      }
      return opt;
    });
  }, [canActThisSeason, state, assessment, creditLimit]);

  const handleSelectOption = (opt: PressureOption) => {
    if (opt.disabledReason || resolution) return;
    const res = onResolveChoice(opt.id, assessment);
    if (res) {
      setResolution(res);
    }
  };

  return (
    <motion.div
      data-pressure-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-center items-center p-2.5 sm:p-5 bg-black/80 backdrop-blur-2xl overflow-y-auto overscroll-contain"
    >
      <motion.div
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full max-w-3xl bg-[#12141c]/95 text-white rounded-[28px] sm:rounded-[32px] border ${levelMeta.borderClass} shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto overflow-hidden text-left`}
      >
        <div
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
            levelMeta.level === 'crisis'
              ? 'bg-rose-500/15'
              : levelMeta.level === 'high'
              ? 'bg-orange-500/15'
              : 'bg-sky-500/10'
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.08] bg-white/[0.02] flex items-start sm:items-center justify-between gap-3 shrink-0 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 p-1.5">
              <ClubLogo
                name={displayClubName}
                id={state.club.id}
                color={resolvedClub.color || state.club.color}
                logo={resolvedClub.logo}
                fallbackLogo={resolvedClub.fallbackLogo}
                isModActive={isModActive}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${levelMeta.badgeClass}`}>
                  <i className={`fas ${levelMeta.icon} text-[9px]`}></i>
                  <span>{levelMeta.label}</span>
                </span>
                <span className="text-[11px] font-semibold text-zinc-400">
                  {leagueInfo.name} · Season {state.year}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                {resolution ? resolution.headline : assessment.headline}
              </h2>
            </div>
          </div>

          {(!canActThisSeason || resolution) && (
            <button
              type="button"
              aria-label="Close press briefing"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer shrink-0"
            >
              <i className="fas fa-xmark text-sm"></i>
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-3 custom-scrollbar flex-1 min-h-0 relative z-10">
          {/* Pressure Meter + Expectations vs Reality Strip */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Media &amp; Board Pressure Index
                </div>
                <p className="text-xs text-zinc-300 mt-0.5 leading-snug">
                  {resolution ? resolution.summary : assessment.subheadline}
                </p>
              </div>
              <div className="flex items-baseline gap-1 shrink-0 tabular-nums">
                <span className={`text-2xl sm:text-3xl font-black ${levelMeta.textClass}`}>{effectiveScore}</span>
                <span className="text-xs text-zinc-500">/100</span>
              </div>
            </div>

            <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${levelMeta.barClass}`}
                style={{ width: `${Math.max(4, Math.min(100, effectiveScore))}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2 text-center">
                <div className="text-[9px] uppercase font-semibold text-zinc-400 tracking-wider">Expected</div>
                <div className="text-sm font-bold text-sky-300 tabular-nums mt-0.5">Top {assessment.expectedRank}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2 text-center">
                <div className="text-[9px] uppercase font-semibold text-zinc-400 tracking-wider">Standing</div>
                <div
                  className={`text-sm font-bold tabular-nums mt-0.5 ${
                    assessment.expectationGap > 2
                      ? 'text-rose-400'
                      : assessment.expectationGap <= 0
                      ? 'text-emerald-400'
                      : 'text-amber-300'
                  }`}
                >
                  #{assessment.actualRank}
                  {assessment.expectationGap > 0 ? ` (-${assessment.expectationGap})` : ''}
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2 text-center">
                <div className="text-[9px] uppercase font-semibold text-zinc-400 tracking-wider">Board Trust</div>
                <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                  {resolution ? resolution.updatedState.clubImpactScore : state.clubImpactScore ?? 50}/100
                </div>
              </div>
            </div>
          </div>

          {/* Twin Scrutiny Cards: Head Coach & GM (User) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/25 text-amber-300 flex items-center justify-center text-xs shrink-0">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate">
                      {assessment.coachScrutiny.role}
                    </div>
                    <div className="text-sm font-bold text-white truncate">{assessment.coachScrutiny.name}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/25 shrink-0">
                  {assessment.coachScrutiny.statusTag}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{assessment.coachScrutiny.quote}</p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/25 text-sky-300 flex items-center justify-center text-xs shrink-0">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate">
                      {assessment.gmScrutiny.role}
                    </div>
                    <div className="text-sm font-bold text-white truncate">{assessment.gmScrutiny.name}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-orange-500/15 text-orange-300 border border-orange-500/25 shrink-0">
                  {assessment.gmScrutiny.statusTag}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{assessment.gmScrutiny.quote}</p>
            </div>
          </div>

          {/* Media Clippings Feed */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3.5 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <i className="fas fa-newspaper text-sky-400"></i>
              <span>Press Box &amp; Fan Wire</span>
            </div>
            <div className="space-y-2">
              {assessment.mediaOutlets.map((clip, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl px-3 py-2 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${
                    clip.tone === 'alarm'
                      ? 'bg-rose-500/[0.08] border-rose-500/25 text-rose-100'
                      : clip.tone === 'critical'
                      ? 'bg-amber-500/[0.06] border-amber-500/20 text-zinc-200'
                      : 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-100'
                  }`}
                >
                  <span className="font-medium leading-snug">{clip.headline}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 shrink-0">
                    {clip.outlet}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Press Response Options OR Resolution Confirmation */}
          {resolution ? (
            <div className="bg-sky-500/10 border border-sky-400/30 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  Press Response Logged
                </span>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tabular-nums">
                  <span className={resolution.pressureDelta <= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                    Heat {resolution.pressureDelta >= 0 ? `+${resolution.pressureDelta}` : resolution.pressureDelta}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className={resolution.moraleDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                    Morale {resolution.moraleDelta >= 0 ? `+${resolution.moraleDelta}` : resolution.moraleDelta}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className={resolution.impactDelta >= 0 ? 'text-emerald-300' : 'text-amber-300'}>
                    Board Trust {resolution.impactDelta >= 0 ? `+${resolution.impactDelta}` : resolution.impactDelta}
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">{resolution.summary}</p>
            </div>
          ) : canActThisSeason ? (
            <div className="space-y-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Sporting Director Response Required</span>
                <span className="text-sky-400">Shapes 2nd-Half Trajectory</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={Boolean(opt.disabledReason)}
                    onClick={() => handleSelectOption(opt)}
                    className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                      opt.disabledReason
                        ? 'bg-white/[0.02] border-white/[0.05] opacity-50 cursor-not-allowed'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] hover:border-sky-400/40 active:scale-[0.99]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                          <i className={`fas ${opt.icon} text-[10px]`}></i>
                          <span>{opt.stanceBadge}</span>
                        </span>
                        {typeof opt.costK === 'number' && opt.costK > 0 && (
                          <span className="text-[10px] font-bold text-amber-300 tabular-nums">
                            -{formatMoney(opt.costK)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-white leading-snug">{opt.title}</div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">{opt.subtitle}</p>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] space-y-0.5">
                      <div className="text-[11px] font-semibold text-emerald-300 leading-snug">{opt.effectsSummary}</div>
                      <div className="text-[10px] text-zinc-400 leading-snug">
                        {opt.disabledReason || `Risk: ${opt.riskLabel}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3.5 text-xs text-zinc-300 flex items-center justify-between gap-3">
              <span>
                {state.pressureMomentResolvedYear === state.year
                  ? `You have already addressed the press this season (${state.pressureChoiceThisSeason?.replace(/_/g, ' ') || 'resolved'}). Results on the pitch will decide the verdict.`
                  : 'Pressure levels are currently manageable. Strong league form will keep critics quiet.'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        {(resolution || !canActThisSeason) && (
          <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] shrink-0 relative z-10 flex flex-wrap items-center justify-end gap-2.5">
            {resolution?.coachDismissed && onOpenCoachMarket && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCoachMarket();
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/35 text-amber-200 text-xs font-bold transition cursor-pointer flex items-center gap-2"
              >
                <i className="fas fa-user-plus text-xs"></i>
                <span>Appoint Replacement Coach</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <span>Continue</span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
