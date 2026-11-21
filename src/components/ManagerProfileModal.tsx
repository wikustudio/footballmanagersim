import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { calculateClubReputation, getManagerStandingTier, getManagerStandingShortTitle } from '../data/gameConstants';
import { resolveHistoryClubDisplay } from '../utils/modSafeguards';
import { evaluateTrophyHunterMilestones } from '../engine/dynastyMilestonesEngine';

interface ManagerProfileModalProps {
  state: GameState;
  lang?: string;
  isModActive?: boolean;
  onClose: () => void;
}

export const ManagerProfileModal: React.FC<ManagerProfileModalProps> = ({
  state,
  lang = 'en',
  isModActive: isModActiveProp,
  onClose,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const effectiveModActive = isModActiveProp !== undefined
    ? isModActiveProp
    : (typeof window !== 'undefined' && localStorage.getItem('fms_real_mod_active') === 'true');

  const rep = state.reputation ?? 50;
  const isDe = lang === 'de';

  const repTier = getManagerStandingTier(rep, state.club.tier, isDe);
  const totalTrophies = state.totals?.trophies ?? (state.trophies?.length || 0);
  const seasonsManaged = state.history?.length || 0;
  const worldCupWins = state.worldCupTrophies || state.internationalTrophies || 0;
  const trophyHunterSummary = useMemo(() => evaluateTrophyHunterMilestones(state), [state]);

  // Commercial leverage calculation
  const sponsorBonusPct = Math.round((rep / 100) * 35);

  // Build historical reputation timeline
  const timelineData = useMemo(() => {
    const history = state.history || [];
    const currentRep = state.reputation ?? 50;
    const currentYear = state.year || 2026;

    if (history.length === 0) {
      const currentResolved = resolveHistoryClubDisplay(
        {
          id: state.club.id,
          name: state.club.name || 'Club',
          country: state.club.country,
          color: state.club.color,
          logo: state.club.logo,
          fallbackLogo: state.club.fallbackLogo,
        },
        effectiveModActive
      );
      return [
        {
          year: currentYear,
          clubName: currentResolved.name || state.club.name || 'Club',
          leagueTag: `T${state.club.tier || 1}`,
          rep: currentRep,
          tier: state.club.tier || 1,
          pos: undefined,
          trophiesCount: (state.trophies?.length || 0),
          isCurrent: true,
        }
      ];
    }

    // Baseline reputation estimate for first recorded season
    const startClubRep = calculateClubReputation(history[0].ovr || 65, history[0].tier || 1);
    let runningRep = Math.max(25, Math.min(80, startClubRep));

    const standardTrophyWeights: Record<string, number> = {
      wc: 15,
      cl: 12,
      cwc: 8,
      bl: 6,
      el: 5,
      dfb: 4,
      lower: 4,
      ecl: 3,
      efl: 3,
      reg: 2,
    };

    const points = history.map((h, idx) => {
      // Delta based on domestic finish
      let delta = 0;
      if (h.pos === 1) delta += 7;
      else if (h.pos <= 3) delta += 4;
      else if (h.pos >= 15) delta -= 4;

      if (h.trophiesThisYear && typeof h.trophiesThisYear === 'object') {
        for (const [k, rawVal] of Object.entries(h.trophiesThisYear)) {
          const count = Number(rawVal) || 0;
          if (count <= 0) continue;
          const weight = standardTrophyWeights[k] ?? 3; // Custom/modded competition fallback
          delta += weight * count;
        }
      }

      runningRep = Math.max(15, Math.min(100, runningRep + delta));

      const trCount = h.trophiesThisYear
        ? Object.values(h.trophiesThisYear).reduce<number>((acc, val) => acc + (Number(val) || 0), 0)
        : 0;

      const safeTier = Math.max(1, Number(h.tier) || state.club.tier || 1);
      const safeTag = h.leagueTag || `T${safeTier}`;

      const resolvedHist = resolveHistoryClubDisplay(
        {
          id: h.clubId,
          name: h.clubName || state.club.name || 'Club',
          country: h.country || state.club.country,
          color: h.color,
          logo: h.logo,
          fallbackLogo: h.fallbackLogo,
        },
        effectiveModActive
      );

      return {
        year: h.year || currentYear,
        clubName: resolvedHist.name || h.clubName || state.club.name || 'Club',
        leagueTag: safeTag,
        rep: idx === history.length - 1 ? currentRep : runningRep,
        tier: safeTier,
        pos: h.pos,
        trophiesCount: trCount,
        isCurrent: idx === history.length - 1,
      };
    });

    if (points.length > 0) {
      points[points.length - 1].rep = currentRep;
      points[points.length - 1].isCurrent = true;
    }

    return points;
  }, [state.history, state.reputation, state.year, state.club, state.trophies, effectiveModActive]);

  const activePoint = selectedPointIndex !== null && timelineData[selectedPointIndex]
    ? timelineData[selectedPointIndex]
    : timelineData[timelineData.length - 1];

  // SVG Chart Dimensions
  const svgWidth = 560;
  const svgHeight = 170;
  const padLeft = 40;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 30;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const getCoordinates = (index: number, score: number) => {
    const x = timelineData.length === 1
      ? padLeft + plotWidth / 2
      : padLeft + (index / (timelineData.length - 1)) * plotWidth;
    const y = padTop + (1 - Math.max(0, Math.min(100, score)) / 100) * plotHeight;
    return { x, y };
  };

  const linePath = useMemo(() => {
    if (timelineData.length === 0) return '';
    if (timelineData.length === 1) {
      const { x, y } = getCoordinates(0, timelineData[0].rep);
      return `M ${x - 30} ${y} L ${x + 30} ${y}`;
    }

    return timelineData.reduce((path, pt, idx) => {
      const { x, y } = getCoordinates(idx, pt.rep);
      if (idx === 0) return `M ${x} ${y}`;

      const prev = getCoordinates(idx - 1, timelineData[idx - 1].rep);
      const cpX1 = prev.x + (x - prev.x) * 0.45;
      const cpX2 = prev.x + (x - prev.x) * 0.55;
      return `${path} C ${cpX1} ${prev.y}, ${cpX2} ${y}, ${x} ${y}`;
    }, '');
  }, [timelineData]);

  const areaPath = useMemo(() => {
    if (timelineData.length < 2) return '';
    const first = getCoordinates(0, timelineData[0].rep);
    const last = getCoordinates(timelineData.length - 1, timelineData[timelineData.length - 1].rep);
    const bottomY = padTop + plotHeight;
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [linePath, timelineData]);

  const standingBadgeStyle =
    state.club.tier === 1 && rep >= 85
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : state.club.tier === 1 && rep >= 70
      ? 'bg-sky-50 text-sky-800 border-sky-200'
      : rep >= 50
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : 'bg-[#F5F4F0] text-[#4B5563] border-[#E6E3DC]';

  const standingIconColor =
    state.club.tier === 1 && rep >= 85
      ? 'text-amber-600'
      : state.club.tier === 1 && rep >= 70
      ? 'text-sky-600'
      : rep >= 50
      ? 'text-emerald-600'
      : 'text-[#6B7280]';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2.5 sm:p-5 backdrop-blur-sm bg-[#18191F]/45 overflow-y-auto overscroll-contain"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Dialog */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white text-[#18191F] w-full max-w-2xl rounded-[28px] sm:rounded-[32px] border border-[#E6E3DC] shadow-[0_24px_64px_rgba(24,25,31,0.18)] overflow-hidden relative z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shrink-0"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 text-lg shrink-0">
              <i className="fas fa-medal"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#18191F] tracking-tight">
                  Manager Reputation & Standing
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">
                Global Director Prestige, Career Trajectory & Commercial Clout
              </p>
            </div>
          </div>
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] hover:text-[#18191F] transition cursor-pointer shrink-0"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-4 custom-scrollbar flex-1 min-h-0 bg-white">
          {/* Hero Reputation Score Card */}
          <div className="bg-[#FAF9F6] rounded-2xl p-5 sm:p-6 border border-[#E6E3DC] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-[#18191F] tracking-tighter leading-none tabular-nums">{rep}</span>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mt-0.5 tabular-nums">/ 100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${standingBadgeStyle}`}>
                      {repTier.title}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#18191F]">
                    {state.managerName || 'Sporting Director'}
                  </h3>
                  <div className="text-xs text-[#6B7280] font-medium">
                    Current Club: <span className="text-[#18191F] font-bold">{state.club.name}</span> · Tier {state.club.tier}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider">
                  Career Experience
                </div>
                <div className="text-sm font-bold text-[#18191F] mt-0.5 tabular-nums">
                  {seasonsManaged} Seasons Completed
                </div>
                <div className="text-[11px] text-amber-800 font-bold mt-0.5 tabular-nums">
                  🏆 {totalTrophies} Honours Won
                </div>
              </div>
            </div>

            {/* Qualitative Verdict */}
            <div className="mt-4 pt-3 border-t border-[#E6E3DC] flex items-start gap-2.5">
              <i className={`fas ${repTier.icon} ${standingIconColor} text-sm mt-0.5 shrink-0`}></i>
              <p className="text-xs text-[#4B5563] leading-relaxed font-medium">
                {repTier.desc}
              </p>
            </div>
          </div>

          {/* SECTION 2: Career Reputation Progression Chart */}
          <div className="bg-[#FAF9F6] rounded-2xl p-5 border border-[#E6E3DC]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3.5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-0.5 flex items-center gap-1.5">
                  <i className="fas fa-chart-line text-amber-600"></i>
                  <span>Career Trajectory</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#18191F]">
                  Reputation & Standing Progression
                </h3>
              </div>
            </div>

            {/* Active Node Detail Callout */}
            {activePoint && (
              <div className="bg-white rounded-xl p-3 border border-[#E6E3DC] mb-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center tabular-nums font-black text-xs shrink-0">
                    '{String(activePoint.year).slice(-2)}
                  </div>
                  <div>
                    <div className="font-black text-[#18191F] flex items-center gap-1.5">
                      <span>{activePoint.clubName}</span>
                      {activePoint.isCurrent && (
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-medium tabular-nums">
                      Season {activePoint.year} {activePoint.leagueTag ? `(${activePoint.leagueTag})` : ''} • {activePoint.pos ? `Finish: #${activePoint.pos}` : 'In Progress'}
                      {activePoint.trophiesCount ? ` • 🏆 ${activePoint.trophiesCount} ${activePoint.trophiesCount === 1 ? 'Trophy' : 'Trophies'}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black text-amber-700 tabular-nums">
                    {activePoint.rep} <span className="text-xs text-[#6B7280] font-normal">/100</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280] font-bold uppercase">
                    {getManagerStandingShortTitle(activePoint.rep, activePoint.tier || state.club.tier, isDe)}
                  </div>
                </div>
              </div>
            )}

            {/* Chart Area - Interactive Line Chart */}
            <div className="w-full overflow-x-auto custom-scrollbar bg-white rounded-xl border border-[#E6E3DC] p-2">
              <div className={timelineData.length > 6 ? 'min-w-[440px] relative' : 'w-full sm:min-w-[440px] relative'}>
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 overflow-visible">
                  <defs>
                    <linearGradient id="repAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d97706" stopOpacity="0.22" />
                      <stop offset="60%" stopColor="#d97706" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="repLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#b45309" />
                      <stop offset="50%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>

                  {/* Benchmark Grid Lines */}
                  {/* 100% */}
                  <line x1={padLeft} y1={padTop} x2={svgWidth - padRight} y2={padTop} stroke="#E6E3DC" strokeDasharray="3 3" />
                  <text x={padLeft - 8} y={padTop + 4} fill="#6B7280" fontSize="9" textAnchor="end" className="tabular-nums font-medium">100</text>

                  {/* 85% (Global Elite threshold) */}
                  <line x1={padLeft} y1={padTop + (1 - 0.85) * plotHeight} x2={svgWidth - padRight} y2={padTop + (1 - 0.85) * plotHeight} stroke="rgba(217,119,6,0.3)" strokeDasharray="2 4" />
                  <text x={padLeft - 8} y={padTop + (1 - 0.85) * plotHeight + 3} fill="#b45309" fontSize="8" textAnchor="end" className="tabular-nums font-semibold">85</text>

                  {/* 70% (Continental threshold) */}
                  <line x1={padLeft} y1={padTop + (1 - 0.70) * plotHeight} x2={svgWidth - padRight} y2={padTop + (1 - 0.70) * plotHeight} stroke="rgba(2,132,199,0.28)" strokeDasharray="2 4" />
                  <text x={padLeft - 8} y={padTop + (1 - 0.70) * plotHeight + 3} fill="#0369a1" fontSize="8" textAnchor="end" className="tabular-nums font-semibold">70</text>

                  {/* 50% (Established threshold) */}
                  <line x1={padLeft} y1={padTop + (1 - 0.50) * plotHeight} x2={svgWidth - padRight} y2={padTop + (1 - 0.50) * plotHeight} stroke="rgba(5,150,105,0.25)" strokeDasharray="2 4" />
                  <text x={padLeft - 8} y={padTop + (1 - 0.50) * plotHeight + 3} fill="#047857" fontSize="8" textAnchor="end" className="tabular-nums font-semibold">50</text>

                  {/* Bottom Axis Baseline */}
                  <line x1={padLeft} y1={padTop + plotHeight} x2={svgWidth - padRight} y2={padTop + plotHeight} stroke="#D4D0C7" />
                  <text x={padLeft - 8} y={padTop + plotHeight + 3} fill="#6B7280" fontSize="9" textAnchor="end" className="tabular-nums font-medium">0</text>

                  {/* Gradient Area Fill */}
                  {areaPath && <path d={areaPath} fill="url(#repAreaGrad)" />}

                  {/* Main Line Stroke */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="url(#repLineGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Nodes / Dots */}
                  {timelineData.map((pt, idx) => {
                    const { x, y } = getCoordinates(idx, pt.rep);
                    const isSelected = selectedPointIndex === idx || (selectedPointIndex === null && idx === timelineData.length - 1);

                    return (
                      <g
                        key={pt.year}
                        className="cursor-pointer group"
                        onClick={() => setSelectedPointIndex(idx)}
                      >
                        <circle cx={x} cy={y} r="14" fill="transparent" />

                        {isSelected && (
                          <circle
                            cx={x}
                            cy={y}
                            r="9"
                            fill="none"
                            stroke="#d97706"
                            strokeWidth="1.5"
                            opacity="0.55"
                          />
                        )}

                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? '6' : '4.5'}
                          fill={pt.rep >= 85 ? '#d97706' : pt.rep >= 70 ? '#0284c7' : pt.rep >= 50 ? '#059669' : '#6B7280'}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all duration-200"
                        />

                        <text
                          x={x}
                          y={padTop + plotHeight + 16}
                          fill={isSelected ? '#b45309' : '#6B7280'}
                          fontSize="10"
                          className="tabular-nums font-semibold"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          textAnchor="middle"
                        >
                          '{String(pt.year).slice(-2)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Threshold Legend */}
            <div className="flex items-center justify-between text-[10px] text-[#6B7280] mt-3 pt-2.5 border-t border-[#E6E3DC] flex-wrap gap-2">
              <span className="font-bold text-[#6B7280] uppercase tracking-widest">{isDe ? 'Branchen-Stufen:' : 'Industry Thresholds:'}</span>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-amber-800 font-bold" title="Tier 1 exclusive">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span> 85+ {isDe ? 'Weltklasse (Liga 1)' : 'Global Elite (Tier 1)'}
                </span>
                <span className="flex items-center gap-1 text-sky-800 font-bold" title="Tier 1 exclusive">
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span> 70+ {isDe ? 'Kontinental (Liga 1)' : 'Continental (Tier 1)'}
                </span>
                <span className="flex items-center gap-1 text-emerald-800 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span> 50+ {isDe ? 'Etabliert' : 'Established'}
                </span>
              </div>
            </div>

            {state.club.tier > 1 && (
              <div className="mt-2.5 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 flex items-center gap-2 text-[11px] text-sky-800">
                <i className="fa-solid fa-circle-info text-sky-600 shrink-0"></i>
                <span>
                  {isDe
                    ? `Aktuelle Liga: Liga ${state.club.tier}. Weltklasse- und Kontinental-Status sind ausschließlich in der 1. Liga (Tier 1) erreichbar.`
                    : `Current Division: Tier ${state.club.tier}. Continental and Global Elite standing are strictly exclusive to top-flight Tier 1.`}
                </span>
              </div>
            )}
          </div>

          {/* Industry Stature Strip */}
          <div className="bg-[#FAF9F6] rounded-2xl p-3 sm:p-4 border border-[#E6E3DC]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-2.5">
              {isDe ? 'Reputations-Faktoren' : 'Reputation Breakdown'}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white border border-[#E6E3DC] rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-0.5">
                  🏆 {isDe ? 'Titel' : 'Silverware'}
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-700 truncate tabular-nums">
                  {totalTrophies} {isDe ? 'Titel' : 'Trophies'}
                </div>
              </div>

              <div className="bg-white border border-[#E6E3DC] rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-0.5">
                  📊 {isDe ? 'Liga' : 'Division'}
                </div>
                <div className="text-xs sm:text-sm font-bold text-sky-700 truncate tabular-nums">
                  Tier {state.club.tier} · {state.club.baseOvr} OVR
                </div>
              </div>

              <div className="bg-white border border-[#E6E3DC] rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-0.5">
                  🌍 {isDe ? 'WM' : 'World Cup'}
                </div>
                <div className="text-xs sm:text-sm font-bold text-emerald-700 truncate">
                  {worldCupWins > 0
                    ? `${worldCupWins}x Champion`
                    : (state.worldCupCampaigns?.length || 0) > 0
                    ? (isDe ? 'Teilnehmer' : 'Contender')
                    : (isDe ? 'Keine' : 'Uncapped')}
                </div>
              </div>

              <div className="bg-white border border-[#E6E3DC] rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-0.5">
                  🤝 {isDe ? 'Sponsoring' : 'Commercial'}
                </div>
                <div className="text-xs sm:text-sm font-bold text-purple-700 truncate tabular-nums">
                  +{sponsorBonusPct}% {isDe ? 'Bonus' : 'Sponsor Value'}
                </div>
              </div>
            </div>
          </div>

          {/* Trophy Hunter Legacy Milestones */}
          <div className="bg-[#FAF9F6] rounded-2xl p-3 sm:p-4 border border-[#E6E3DC]">
            <div className="flex items-center justify-between mb-2.5 gap-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                Trophy Hunter Legacy Milestones
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg tabular-nums">
                {trophyHunterSummary.unlockedCount} / {trophyHunterSummary.totalCount} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {trophyHunterSummary.milestones.map(m => (
                <div
                  key={m.id}
                  className={`rounded-xl p-2.5 border flex items-start gap-2.5 transition ${
                    m.unlocked
                      ? m.tier === 'platinum'
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-white border-[#E6E3DC] opacity-80'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                      m.unlocked
                        ? m.tier === 'platinum'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-[#F6F5F1] text-[#6B7280] border border-[#E6E3DC]'
                    }`}
                  >
                    <i className={`fa-solid ${m.icon}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-[#18191F] truncate">{m.title}</span>
                      <span
                        className={`text-[10px] font-bold tabular-nums shrink-0 ${
                          m.unlocked ? 'text-emerald-700' : 'text-[#6B7280]'
                        }`}
                      >
                        {m.unlocked ? '✓ ' : ''}
                        {m.progressLabel}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B7280] leading-snug mt-0.5">{m.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E6E3DC] bg-[#FAF9F6] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white font-semibold text-xs tracking-wider transition cursor-pointer active:scale-95"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
