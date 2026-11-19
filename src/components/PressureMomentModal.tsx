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
      className="fixed inset-0 z-50 flex flex-col justify-center items-center p-2.5 sm:p-5 bg-[#18191F]/40 backdrop-blur-md overflow-y-auto overscroll-contain"
    >
      <motion.div
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full max-w-3xl bg-white text-[#18191F] rounded-[28px] sm:rounded-[32px] border ${levelMeta.borderClass} shadow-[0_24px_80px_rgba(24,25,31,0.18)] flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto overflow-hidden text-left`}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-start sm:items-center justify-between gap-3 shrink-0 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#F6F5F1] border border-[#E6E3DC] flex items-center justify-center shrink-0 p-1.5">
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
                <span className="text-[11px] font-semibold text-[#6B6A64]">
                  {leagueInfo.name} · Season {state.year}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18191F] tracking-tight leading-snug">
                {resolution ? resolution.headline : assessment.headline}
              </h2>
            </div>
          </div>

          {(!canActThisSeason || resolution) && (
            <button
              type="button"
              aria-label="Close press briefing"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] flex items-center justify-center text-[#52525B] hover:text-[#18191F] transition cursor-pointer shrink-0"
            >
              <i className="fas fa-xmark text-sm"></i>
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-3 custom-scrollbar flex-1 min-h-0 relative z-10">
          {/* Pressure Meter + Expectations vs Reality Strip */}
          <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64]">
                  Media &amp; Board Pressure Index
                </div>
                <p className="text-xs text-[#52525B] mt-0.5 leading-snug">
                  {resolution ? resolution.summary : assessment.subheadline}
                </p>
              </div>
              <div className="flex items-baseline gap-1 shrink-0 tabular-nums">
                <span className={`text-2xl sm:text-3xl font-black ${levelMeta.textClass}`}>{effectiveScore}</span>
                <span className="text-xs text-[#6B6A64]">/100</span>
              </div>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[#EAE7E0] overflow-hidden border border-[#E6E3DC]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${levelMeta.barClass}`}
                style={{ width: `${Math.max(4, Math.min(100, effectiveScore))}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white border border-[#E6E3DC] rounded-xl px-3 py-2 text-center">
                <div className="text-[9px] uppercase font-semibold text-[#6B6A64] tracking-wider">Expected</div>
                <div className="text-sm font-bold text-sky-700 tabular-nums mt-0.5">Top {assessment.expectedRank}</div>
              </div>
              <div className="bg-white border border-[#E6E3DC] rounded-xl px-3 py-2 text-center">
                <div className="text-[9px] uppercase font-semibold text-[#6B6A64] tracking-wider">Standing</div>
                <div
                  className={`text-sm font-bold tabular-nums mt-0.5 ${
                    assessment.expectationGap > 2
                      ? 'text-rose-700'
                      : assessment.expectationGap <= 0
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  #{assessment.actualRank}
                  {assessment.expectationGap > 0 ? ` (-${assessment.expectationGap})` : ''}
                </div>
              </div>
              <div className="bg-white border border-[#E6E3DC] rounded-xl px-3 py-2 text-center">
                <div className="text-[9px] uppercase font-semibold text-[#6B6A64] tracking-wider">Board Trust</div>
                <div className="text-sm font-bold text-[#18191F] tabular-nums mt-0.5">
                  {resolution ? resolution.updatedState.clubImpactScore : state.clubImpactScore ?? 50}/100
                </div>
              </div>
            </div>
          </div>

          {/* Twin Scrutiny Cards: Head Coach & GM (User) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-xs shrink-0">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64] truncate">
                      {assessment.coachScrutiny.role}
                    </div>
                    <div className="text-sm font-bold text-[#18191F] truncate">{assessment.coachScrutiny.name}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                  {assessment.coachScrutiny.statusTag}
                </span>
              </div>
              <p className="text-xs text-[#52525B] leading-relaxed">{assessment.coachScrutiny.quote}</p>
            </div>

            <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center text-xs shrink-0">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64] truncate">
                      {assessment.gmScrutiny.role}
                    </div>
                    <div className="text-sm font-bold text-[#18191F] truncate">{assessment.gmScrutiny.name}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-orange-50 text-orange-700 border border-orange-200 shrink-0">
                  {assessment.gmScrutiny.statusTag}
                </span>
              </div>
              <p className="text-xs text-[#52525B] leading-relaxed">{assessment.gmScrutiny.quote}</p>
            </div>
          </div>

          {/* Media Clippings Feed */}
          <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3.5 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64] flex items-center gap-1.5">
              <i className="fas fa-newspaper text-sky-700"></i>
              <span>Press Box &amp; Fan Wire</span>
            </div>
            <div className="space-y-2">
              {assessment.mediaOutlets.map((clip, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl px-3 py-2 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${
                    clip.tone === 'alarm'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : clip.tone === 'critical'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <span className="font-medium leading-snug">{clip.headline}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B6A64] shrink-0">
                    {clip.outlet}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Press Response Options OR Resolution Confirmation */}
          {resolution ? (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                  Press Response Logged
                </span>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tabular-nums">
                  <span className={resolution.pressureDelta <= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    Heat {resolution.pressureDelta >= 0 ? `+${resolution.pressureDelta}` : resolution.pressureDelta}
                  </span>
                  <span className="text-[#C7C4BC]">·</span>
                  <span className={resolution.moraleDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    Morale {resolution.moraleDelta >= 0 ? `+${resolution.moraleDelta}` : resolution.moraleDelta}
                  </span>
                  <span className="text-[#C7C4BC]">·</span>
                  <span className={resolution.impactDelta >= 0 ? 'text-emerald-700' : 'text-amber-800'}>
                    Board Trust {resolution.impactDelta >= 0 ? `+${resolution.impactDelta}` : resolution.impactDelta}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#18191F] leading-relaxed">{resolution.summary}</p>
            </div>
          ) : canActThisSeason ? (
            <div className="space-y-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64] flex items-center justify-between">
                <span>Sporting Director Response Required</span>
                <span className="text-sky-700 font-bold">Shapes 2nd-Half Trajectory</span>
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
                        ? 'bg-[#F6F5F1] border-[#E6E3DC] opacity-50 cursor-not-allowed'
                        : 'bg-[#F6F5F1] hover:bg-[#FAF9F6] border-[#E6E3DC] hover:border-[#18191F] active:scale-[0.99]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">
                          <i className={`fas ${opt.icon} text-[10px]`}></i>
                          <span>{opt.stanceBadge}</span>
                        </span>
                        {typeof opt.costK === 'number' && opt.costK > 0 && (
                          <span className="text-[10px] font-bold text-rose-700 tabular-nums">
                            -{formatMoney(opt.costK)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[#18191F] leading-snug">{opt.title}</div>
                      <p className="text-[11px] text-[#52525B] leading-relaxed">{opt.subtitle}</p>
                    </div>
                    <div className="pt-2 border-t border-[#E6E3DC] space-y-0.5">
                      <div className="text-[11px] font-semibold text-emerald-700 leading-snug">{opt.effectsSummary}</div>
                      <div className="text-[10px] text-[#6B6A64] leading-snug">
                        {opt.disabledReason || `Risk: ${opt.riskLabel}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-2xl p-3.5 text-xs text-[#52525B] flex items-center justify-between gap-3">
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
          <div className="p-4 border-t border-[#E6E3DC] bg-[#FAF9F6] shrink-0 relative z-10 flex flex-wrap items-center justify-end gap-2.5">
            {resolution?.coachDismissed && onOpenCoachMarket && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCoachMarket();
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition cursor-pointer flex items-center gap-2"
              >
                <i className="fas fa-user-plus text-xs"></i>
                <span>Appoint Replacement Coach</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#18191F] hover:bg-[#2A2B33] text-white font-semibold text-xs shadow-sm transition cursor-pointer flex items-center gap-2"
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
