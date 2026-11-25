import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Language } from '../types';
import { t as tr } from '../data/translations';
import { getLeagueInfo, TACTICS } from '../data/gameConstants';
import { buildSeasonOvrBreakdown, computeMatchdayOvrBreakdown } from '../engine/ovrAndYouthHelpers';

export type OvrTierId = 'championship' | 'mid_table' | 'low_table_risk' | 'relegation_risk';

export interface OvrTierConfig {
  tier: OvrTierId;
  label: string;
  color: string;
  delta: number;
  deltaText: string;
  description: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: string;
}

export const getOvrTierConfig = (baseOvr: number, avgOvr: number): OvrTierConfig => {
  const delta = baseOvr - avgOvr;

  if (delta > 2) {
    // Green (#10b981) — Championship Material: For squads above division average. Clear title/promotion contender.
    return {
      tier: 'championship',
      label: 'Championship Material',
      color: '#10b981',
      delta,
      deltaText: `+${delta} OVR`,
      description: 'Squad is above division average. Clear title/promotion contender.',
      badgeBg: 'bg-[#10b981]/15',
      badgeBorder: 'border-[#10b981]/30',
      badgeText: 'text-[#10b981]',
      icon: 'fa-trophy'
    };
  }

  if (delta >= -2) {
    // White (#f4f4f5) — Mid-Table: For squads within 2 points of league benchmark (-2 to +2 delta). Balanced, calm presentation without dramatic alarms.
    return {
      tier: 'mid_table',
      label: 'Mid-Table',
      color: '#f4f4f5',
      delta,
      deltaText: delta > 0 ? `+${delta} OVR` : `${delta} OVR`,
      description: 'Squad is within 2 points of league benchmark (-2 to +2 delta). Balanced, calm presentation without dramatic alarms.',
      badgeBg: 'bg-[#f4f4f5]/15',
      badgeBorder: 'border-[#f4f4f5]/30',
      badgeText: 'text-[#f4f4f5]',
      icon: 'fa-scale-balanced'
    };
  }

  if (delta >= -5) {
    // Orange (#f97316) — Low Table Risk: For squads 3 to 5 below league benchmark (-3 to -5 delta). Cautionary lower-table tier without emergency panic.
    return {
      tier: 'low_table_risk',
      label: 'Low Table Risk',
      color: '#f97316',
      delta,
      deltaText: `${delta} OVR`,
      description: 'Squad is 3 to 5 below league benchmark (-3 to -5 delta). Cautionary lower-table tier without emergency panic.',
      badgeBg: 'bg-[#f97316]/15',
      badgeBorder: 'border-[#f97316]/30',
      badgeText: 'text-[#f97316]',
      icon: 'fa-triangle-exclamation'
    };
  }

  // Red (#ef4444) — Relegation Risk: For squads below league benchmark (> 5 below) facing genuine relegation peril.
  return {
    tier: 'relegation_risk',
    label: 'Relegation Risk',
    color: '#ef4444',
    delta,
    deltaText: `${delta} OVR`,
    description: 'Squad is more than 5 below league benchmark facing genuine relegation peril.',
    badgeBg: 'bg-[#ef4444]/15',
    badgeBorder: 'border-[#ef4444]/30',
    badgeText: 'text-[#ef4444]',
    icon: 'fa-circle-exclamation'
  };
};

interface OvrModalProps {
  state: GameState;
  lang: Language;
  onClose: () => void;
}

export const OvrModal: React.FC<OvrModalProps> = ({ state, lang, onClose }) => {
  const isDe = lang === 'de';
  const t = (en: string, de?: string) => tr(lang, en, de);

  const seasonBreakdown = buildSeasonOvrBreakdown(state);
  const startOvr = seasonBreakdown.startOvr;
  const baseOvr = seasonBreakdown.baseOvr;
  const diff = seasonBreakdown.diff;
  const seasonOvrEntries = seasonBreakdown.entries;
  const coachBoost = state.currentCoach ? (state.currentCoach.ovrBoost || 0) : -4;

  const matchday = computeMatchdayOvrBreakdown(state);
  const {
    avgOvr,
    hasSynergy,
    synergyGain,
    isStale,
    isSurveillance,
    stalePenalty,
    hasMastermind,
    coachTraitMod,
    caretakerPenalty,
    bounceMod,
    tenureMod,
    moraleMod,
    pressureBoostMod,
    mediaPressurePenalty,
    leagueMetaMod,
    tacticBonus,
    tacticalNetMod,
    effectiveMatchdayOvr,
  } = matchday;

  const leagueInfo = getLeagueInfo(state.club.tier, state.club.country || 'GER');
  const tierConfig = getOvrTierConfig(baseOvr, avgOvr);
  const tacticKey = state.tactic || 'Total Football';
  const tacticInfo = (TACTICS as Record<string, any>)[tacticKey] || (TACTICS as Record<string, any>)['Total Football'];

  const tierDisplay =
    tierConfig.tier === 'championship'
      ? {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          bar: '#059669',
        }
      : tierConfig.tier === 'mid_table'
      ? {
          bg: 'bg-[#FAF9F6]',
          border: 'border-[#D6D3CB]',
          text: 'text-[#374151]',
          bar: '#6B7280',
        }
      : tierConfig.tier === 'low_table_risk'
      ? {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          bar: '#ea580c',
        }
      : {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          bar: '#dc2626',
        };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2.5 sm:p-4 backdrop-blur-sm bg-[#18191F]/45 cursor-pointer overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-[#18191F] border border-[#E6E3DC] rounded-[28px] sm:rounded-[32px] w-full max-w-md max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shrink-0 overflow-hidden shadow-[0_24px_64px_rgba(24,25,31,0.18)] flex flex-col cursor-default relative text-left"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm shadow-xs shrink-0 ${tierDisplay.bg} ${tierDisplay.border} ${tierDisplay.text}`}>
              <i className="fas fa-chart-simple"></i>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-0.5">
                {t('Squad Dynamics', 'Kader-Dynamik')}
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[#18191F] leading-tight">
                {t('Squad OVR Dynamics', 'Kader GES-Dynamik')}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#EFECE4] text-[#6B7280] hover:text-[#18191F] flex items-center justify-center transition border border-[#E6E3DC] cursor-pointer"
          >
            <i className="fas fa-xmark text-xs"></i>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex flex-col gap-4 relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar bg-white">
          {/* Comparison Cards */}
          <div className="flex items-center gap-3">
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E6E3DC] flex-1 text-center">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] mb-1">
                {t('Start of Season', 'Saisonstart')}
              </div>
              <div className="text-3xl font-bold text-[#4B5563] tabular-nums leading-none">
                {startOvr}
              </div>
            </div>

            <div className="text-[#9A9890] text-xs flex items-center justify-center">
              <i className="fas fa-arrow-right"></i>
            </div>

            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E6E3DC] flex-1 text-center relative overflow-hidden">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] mb-1">
                {t('Current OVR', 'Aktuelle GES')}
              </div>
              <div className={`text-3xl font-bold flex items-center justify-center gap-2 leading-none tabular-nums ${diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-rose-700' : 'text-[#18191F]'}`}>
                <span>{baseOvr}</span>
                {diff !== 0 && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tabular-nums border ${diff > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Season OVR Ledger (Youth Graduates, Transfers, Loans, Coach, Events) */}
          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E6E3DC]" data-testid="season-ovr-breakdown">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] flex items-center gap-1.5">
                <i className="fas fa-list-check text-sky-700"></i>
                <span>Season {state.year} OVR Movement Ledger</span>
              </div>
              <span className={`text-xs font-bold font-mono tabular-nums ${diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-rose-700' : 'text-[#6B7280]'}`}>
                {diff > 0 ? `+${diff}` : diff} Net
              </span>
            </div>
            {seasonOvrEntries.length > 0 ? (
              <div className="space-y-1.5">
                {seasonOvrEntries.map((entry, idx) => (
                  <div
                    key={`${entry.year}-${idx}-${entry.reason}`}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-[#E6E3DC] text-xs"
                  >
                    <span className="text-[#18191F] font-medium truncate">{entry.reason}</span>
                    <span
                      className={`font-mono font-bold tabular-nums shrink-0 ${
                        entry.delta > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {entry.delta > 0 ? `+${entry.delta}` : entry.delta} OVR
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#6B7280] bg-white border border-[#E6E3DC] rounded-xl px-3 py-2.5">
                No squad OVR changes recorded yet this season. Promote youth prospects or sign transfers to move the counter.
              </div>
            )}
          </div>

          {/* League Competitiveness Card with Four-Tier Rating Classification */}
          <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#E6E3DC]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#6B7280] flex items-center gap-1.5">
                <i className="fas fa-scale-unbalanced text-sky-700"></i>
                <span>{t('League Competitiveness', 'Liga-Konkurrenz')}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xs font-semibold text-[#18191F] bg-white px-2.5 py-1 rounded-xl border border-[#E6E3DC]">
                  {leagueInfo?.name}
                </div>
                {/* 4-Tier Rating Classification Badge */}
                <div className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${tierDisplay.bg} ${tierDisplay.border} ${tierDisplay.text}`}>
                  <i className={`fas ${tierConfig.icon} text-[10px]`}></i>
                  <span>{tierConfig.label}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-[#18191F] tabular-nums">{avgOvr}</span>
              </div>
              <div className="flex-1">
                <div className="h-2.5 bg-[#EFECE4] rounded-full overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 left-0 bg-[#D6D3CB] rounded-full" style={{ width: `${(avgOvr / 100) * 100}%` }}></div>
                  <div
                    className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(baseOvr / 100) * 100}%`,
                      backgroundColor: tierDisplay.bar,
                    }}
                  ></div>
                </div>
                <div className="text-[10px] font-medium text-[#6B7280] mt-2 flex justify-between tabular-nums">
                  <span>0</span>
                  <span className="text-[#18191F] font-semibold">{t('Avg', 'Schnitt')} ({avgOvr})</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* Four-Tier Rating Assessment Card */}
            <div className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed transition-all bg-white ${tierDisplay.border}`}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 ${tierDisplay.text}`}>
                  <i className={`fas ${tierConfig.icon}`}></i>
                  <span>{tierConfig.label}</span>
                </span>
                <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-md border tabular-nums ${tierDisplay.bg} ${tierDisplay.border} ${tierDisplay.text}`}>
                  {tierConfig.deltaText} vs benchmark
                </span>
              </div>
              <p className="text-[#4B5563] text-xs leading-snug">
                {tierConfig.description}
              </p>

              {/* 4-Tier Rating Segment Gauge */}
              <div className="mt-3 pt-2.5 border-t border-[#E6E3DC] grid grid-cols-4 gap-1.5 text-[9px] font-semibold text-center">
                <div
                  className={`py-1 px-1 rounded-lg border transition ${
                    tierConfig.tier === 'relegation_risk'
                      ? 'border-rose-300 bg-rose-50 text-rose-700 font-bold'
                      : 'border-[#E6E3DC] bg-[#FAF9F6] text-[#6B7280]'
                  }`}
                >
                  <span>Red (Relegation)</span>
                </div>
                <div
                  className={`py-1 px-1 rounded-lg border transition ${
                    tierConfig.tier === 'low_table_risk'
                      ? 'border-orange-300 bg-orange-50 text-orange-700 font-bold'
                      : 'border-[#E6E3DC] bg-[#FAF9F6] text-[#6B7280]'
                  }`}
                >
                  <span>Orange (Low Risk)</span>
                </div>
                <div
                  className={`py-1 px-1 rounded-lg border transition ${
                    tierConfig.tier === 'mid_table'
                      ? 'border-[#18191F] bg-[#18191F] text-white font-bold'
                      : 'border-[#E6E3DC] bg-[#FAF9F6] text-[#6B7280]'
                  }`}
                >
                  <span>White (Mid-Table)</span>
                </div>
                <div
                  className={`py-1 px-1 rounded-lg border transition ${
                    tierConfig.tier === 'championship'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 font-bold'
                      : 'border-[#E6E3DC] bg-[#FAF9F6] text-[#6B7280]'
                  }`}
                >
                  <span>Green (Title)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coach & Loan Modifier Bento */}
          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E6E3DC] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] mb-0.5">
                  {t('Head Coach Impact', 'Trainer-Einfluss')}
                </div>
                <div className="text-sm font-semibold text-[#18191F] flex items-center gap-2">
                  <i className="fas fa-user-tie text-sky-700 text-xs"></i>
                  <span>{state.currentCoach?.name || t('Interim Caretakers (No Coach)', 'Interims-Betreuung (Kein Trainer)')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`text-xl font-bold tabular-nums ${coachBoost > 0 ? 'text-emerald-700' : coachBoost < 0 ? 'text-rose-700' : 'text-[#6B7280]'}`}>
                  {coachBoost > 0 ? `+${coachBoost}` : coachBoost}
                </div>
                <div className="text-[10px] font-semibold text-[#6B7280] uppercase">OVR</div>
              </div>
            </div>

            {state.activeLoanOvrBoost ? (
              <div className="flex items-center justify-between pt-3 border-t border-[#E6E3DC]">
                <div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] mb-0.5">
                    {t('Temporary Loan Impacts', 'Temporäre Leih-Effekte')}
                  </div>
                  <div className="text-sm font-semibold text-[#18191F] flex items-center gap-2">
                    <i className="fas fa-arrow-right-arrow-left text-sky-700 text-xs"></i>
                    <span>{t('Active Loans', 'Aktive Leihen')}</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280]">{t('Expires at end of season', 'Läuft am Saisonende aus')}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`text-xl font-bold tabular-nums ${state.activeLoanOvrBoost > 0 ? 'text-emerald-700' : state.activeLoanOvrBoost < 0 ? 'text-rose-700' : 'text-[#6B7280]'}`}>
                    {state.activeLoanOvrBoost > 0 ? `+${state.activeLoanOvrBoost}` : state.activeLoanOvrBoost}
                  </div>
                  <div className="text-[10px] font-semibold text-[#6B7280] uppercase">OVR</div>
                </div>
              </div>
            ) : null}

            {state.veteranRingerActive ? (
              <div className="flex items-center justify-between pt-3 border-t border-[#E6E3DC]">
                <div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-700 mb-0.5">
                    {t('Veteran Ringer Signing', 'Altstar-Verpflichtung')}
                  </div>
                  <div className="text-sm font-semibold text-[#18191F] flex items-center gap-2">
                    <i className="fa-solid fa-fire-flame-curved text-amber-600 text-xs"></i>
                    <span>{state.veteranRingerName || t('Ex-Top-Flight Legend', 'Ex-Erstliga-Ikone')}</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280]">{t('Included in Base OVR · Retires at end of season', 'In Basis-GES enthalten · Karriereende nach der Saison')}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="text-xl font-bold tabular-nums text-emerald-700">
                    +{state.veteranRingerOvrGain ?? 5}
                  </div>
                  <div className="text-[10px] font-semibold text-[#6B7280] uppercase">OVR</div>
                </div>
              </div>
            ) : null}

            {state.stadiumPolicy === 'ultras' ? (
              <div className="flex items-center justify-between pt-3 border-t border-[#E6E3DC]">
                <div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-700 mb-0.5">
                    {t('Stadium Strategy Bonus', 'Stadion-Strategie-Bonus')}
                  </div>
                  <div className="text-sm font-semibold text-[#18191F] flex items-center gap-2">
                    <i className="fa-solid fa-fire text-amber-600 text-xs"></i>
                    <span>{t('Fortress Curva (Ultras)', 'Festung Fankurve (Ultras)')}</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280]">Included in Base OVR · Terrace roar & home advantage</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="text-xs font-bold tabular-nums text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                    +1 In Base OVR
                  </div>
                </div>
              </div>
            ) : null}

            {/* Tactical Philosophy & Synergy */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E6E3DC]">
              <div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 mb-0.5">
                  {t('Tactical Philosophy Synergy', 'Taktische Philosophie & Synergie')}
                </div>
                <div className="text-sm font-semibold text-[#18191F] flex items-center gap-2">
                  <i className="fa-solid fa-chess text-sky-700 text-xs"></i>
                  <span>{state.tactic || 'Total Football'}</span>
                  {state.currentCoach && (
                    <span className="text-[11px] text-[#6B7280] font-normal">
                      · {state.currentCoach.style}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#6B7280]">
                  {hasSynergy
                    ? t(`Coach style matches tactical philosophy (+${synergyGain} synergy)`, `Trainer-Stil passt zur Spielphilosophie (+${synergyGain} Synergie)`)
                    : state.currentCoach
                    ? t('No synergy: Hire matching coach style in Job Market for +2 OVR', 'Keine Synergie: Passenden Trainer für +2 GES verpflichten')
                    : t('No coach appointed for tactical synergy', 'Kein Trainer für taktische Synergie eingesetzt')}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`text-xl font-bold tabular-nums ${hasSynergy ? 'text-emerald-700' : 'text-[#9A9890]'}`}>
                  {hasSynergy ? `+${synergyGain}` : '0'}
                </div>
                <div className="text-[10px] font-semibold text-[#6B7280] uppercase">OVR</div>
              </div>
            </div>

            {/* Tactical Philosophy Specific Perk */}
            {tacticBonus !== 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-[#E6E3DC]">
                <div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 mb-0.5">
                    {t('Philosophy Matchday Perk', 'Spielphilosophie-Perk')}
                  </div>
                  <div className="text-sm font-semibold text-[#18191F] flex items-center gap-2">
                    <i className="fa-solid fa-bolt text-sky-700 text-xs"></i>
                    <span>{state.tactic || 'Total Football'}</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280]">
                    {tacticInfo?.ovrBonusType === 'underdog'
                      ? t('Giant-Killer boost (+3 OVR vs superior league average)', 'Underdog-Bonus (+3 GES gegen überlegenen Ligaschnitt)')
                      : tacticInfo?.ovrBonusType === 'dominance' && tacticBonus > 0
                      ? t('Dominance boost (+2 OVR vs weaker opposition)', 'Dominanz-Bonus (+2 GES gegen schwächere Klubs)')
                      : tacticInfo?.ovrBonusType === 'dominance' && tacticBonus < 0
                      ? t('Squad lacks technical quality for system (-1 OVR under 60)', 'Kader fehlt technische Reife (-1 GES unter 60)')
                      : tacticInfo?.ovrBonusType === 'home'
                      ? t('Total Football home pitch boost (+1.5 OVR)', 'Total Football Heimstärke (+1.5 GES)')
                      : t('Direct Counter away match efficiency (+1.5 OVR)', 'Direct Counter Auswärtsstärke (+1.5 GES)')}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`text-xl font-bold tabular-nums ${tacticBonus > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {tacticBonus > 0 ? `+${tacticBonus}` : tacticBonus}
                  </div>
                  <div className="text-[10px] font-semibold text-[#6B7280] uppercase">OVR</div>
                </div>
              </div>
            )}

            {/* Tactical Staleness (Obsolescence) Penalty */}
            {isStale && (
              <div className="flex items-center justify-between bg-rose-50 p-3 rounded-xl border border-rose-200">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-rose-700 mb-0.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-triangle-exclamation text-rose-600 text-xs"></i>
                    <span>{t('Tactical Staleness Penalty (Decoded)', 'Taktische Entschlüsselung (Decoded)')}</span>
                  </div>
                  <div className="text-xs font-semibold text-rose-900">
                    {state.tactic} {t('system has been solved by opponents', 'vom Gegner vollständig entschlüsselt')}
                  </div>
                  <div className="text-[10px] text-rose-700 mt-0.5">
                    {stalePenalty === 2
                      ? 'Cushioned to -2 OVR by Level 5 Academy & Medical. Adapt philosophy in Coach Room for 5 DP to clear.'
                      : `Full -${stalePenalty} OVR penalty in matches. Adapt philosophy in Coach Room for 5 DP to clear.`}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <div className="text-xl font-black tabular-nums text-rose-700">
                    -{stalePenalty}
                  </div>
                  <div className="text-[10px] font-bold text-rose-700 uppercase">OVR</div>
                </div>
              </div>
            )}

            {/* Tactical Surveillance Notice */}
            {!isStale && isSurveillance && (
              <div className="flex items-center justify-between pt-3 border-t border-[#E6E3DC]">
                <div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-700 mb-0.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-crosshairs text-amber-600 text-xs"></i>
                    <span>{t('Tactical Surveillance Notice', 'Taktische Beobachtung')}</span>
                  </div>
                  <div className="text-xs font-semibold text-[#18191F]">
                    {state.tactic} ({state.consecutiveTitlesWithSameTactic}x {t('Consecutive Champions', 'Serientitel')})
                  </div>
                  <div className="text-[10px] text-[#6B7280]">
                    {t('Opponents are studying video. Winning again locks in -4 OVR staleness.', 'Gegner studieren Videoaufnahmen. Ein weiterer Titel führt zu -4 GES.')}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {t('At Risk', 'Gefährdet')}
                  </span>
                </div>
              </div>
            )}

            {(pressureBoostMod !== 0 || mediaPressurePenalty !== 0) && (
              <div className="flex items-center justify-between pt-3 border-t border-[#E6E3DC]">
                <div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-700 mb-0.5">
                    Media & Board Pressure Impact
                  </div>
                  <div className="text-xs font-semibold text-[#18191F]">
                    {pressureBoostMod !== 0 ? 'Siege Mentality / Press Conference Boost' : 'Unaddressed High Media Heat'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`text-xl font-bold tabular-nums ${(pressureBoostMod + mediaPressurePenalty) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {(pressureBoostMod + mediaPressurePenalty) > 0
                      ? `+${pressureBoostMod + mediaPressurePenalty}`
                      : pressureBoostMod + mediaPressurePenalty}
                  </div>
                  <div className="text-[10px] font-semibold text-[#6B7280] uppercase">OVR</div>
                </div>
              </div>
            )}

            {/* Matchday Tactical Net Modifier */}
            {(hasSynergy || isStale || hasMastermind || coachTraitMod !== 0 || caretakerPenalty !== 0 || bounceMod !== 0 || tenureMod !== 0 || moraleMod !== 0 || pressureBoostMod !== 0 || mediaPressurePenalty !== 0 || leagueMetaMod !== 0 || tacticBonus !== 0) && (
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs mt-1 ${
                tacticalNetMod > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                tacticalNetMod < 0 ? 'bg-rose-50 border-rose-200 text-rose-800' :
                'bg-white border-[#E6E3DC] text-[#4B5563]'
              }`}>
                <span className="font-semibold flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-xs"></i>
                  <span>{t('Matchday Tactical Simulation Impact:', 'Matchday Taktik-Modifikator:')}</span>
                </span>
                <div className="text-right">
                  <span className="font-bold tabular-nums">
                    {tacticalNetMod > 0 ? `+${tacticalNetMod}` : tacticalNetMod} OVR
                  </span>
                  <span className="block text-[10px] opacity-80 font-mono tabular-nums">
                    {t('Effective Matchday OVR:', 'Effektive Spieltags-GES:')} {effectiveMatchdayOvr}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
