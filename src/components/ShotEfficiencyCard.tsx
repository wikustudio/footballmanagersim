import React, { useEffect, useMemo, useState } from 'react';
import { MatchdayOutcome } from '../types';
import {
  TACTICAL_SYSTEMS,
  buildTacticalOutcomeHeatmap,
} from '../engine/liveSimVisualEngine';

interface ShotEfficiencyCardProps {
  tactic?: string;
  subTick?: number;
  schedule: MatchdayOutcome[];
  upToIdx: number;
  clubOvr: number;
  playedMatchdays: number;
  clubColor?: string;
  onChangeTactic?: () => void;
  onSelectTactic?: (tactic: string) => void;
}

const getHeatColor = (
  intensity: number,
  tint: string,
  glow: string,
  tacticKey: string
): string => {
  if (tacticKey === 'Defensive') {
    // Relaxed, calm low-block palette (cool sky & emerald, never hot red/orange)
    if (intensity >= 0.65) return '#38BDF8';
    if (intensity >= 0.42) return '#10B981';
    if (intensity >= 0.24) return '#0EA5E9';
    return '#047857';
  }
  if (intensity >= 0.78) return glow;
  if (intensity >= 0.52) return tint;
  if (intensity >= 0.30) return '#38BDF8';
  return '#10B981';
};

const TACTIC_SHORT_LABELS: Record<string, string> = {
  'Total Football': 'Total',
  Gegenpressing: 'Gegenpress',
  'Tiki-Taka': 'Tiki-Taka',
  'Direct Counter': 'Counter',
  Defensive: 'Low Block',
};

export const ShotEfficiencyCard: React.FC<ShotEfficiencyCardProps> = ({
  tactic = 'Total Football',
  subTick = 0,
  schedule,
  upToIdx,
  clubOvr,
  playedMatchdays,
  onChangeTactic,
  onSelectTactic,
}) => {
  const [ambientTick, setAmbientTick] = useState(0);

  // Smooth ambient tactical fluctuation even prior to kickoff so heatmap visibly breathes
  useEffect(() => {
    const id = window.setInterval(() => {
      setAmbientTick((t) => (t + 1) % 24);
    }, 1100);
    return () => window.clearInterval(id);
  }, []);

  const effectiveTick = subTick + ambientTick;

  const outcome = useMemo(
    () => buildTacticalOutcomeHeatmap(tactic, clubOvr, schedule, upToIdx, effectiveTick),
    [tactic, clubOvr, schedule, upToIdx, effectiveTick]
  );

  const isDefensiveRelaxed = outcome.tacticKey === 'Defensive';

  return (
    <div
      className="editorial-card p-4"
      data-testid="tactical-outcome-card"
      data-tactic={outcome.tacticKey}
      data-heat-posture={isDefensiveRelaxed ? 'relaxed' : 'active'}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-extrabold text-[#18191F] tracking-tight truncate">
              Tactical Outcome
            </h3>
            <span className="text-[10px] font-semibold text-[#6B7280] shrink-0">
              · {isDefensiveRelaxed ? 'Low block' : 'Active model'}
            </span>
          </div>
          <p className="text-[11px] font-medium text-[#6B7280] truncate">
            {outcome.displayName} · {outcome.styleTag}
          </p>
        </div>

        {onChangeTactic ? (
          <button
            type="button"
            onClick={onChangeTactic}
            className="px-2.5 py-1 rounded-full bg-[#18191F] hover:bg-[#2A2C35] text-white text-[10px] font-bold transition cursor-pointer shrink-0"
          >
            Philosophy
          </button>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-[#F6F5F1] border border-[#E6E3DC] text-[10px] font-bold text-[#18191F] shrink-0">
            {outcome.tacticKey}
          </span>
        )}
      </div>

      {/* 5-Philosophy Status Strip — Only Active Philosophy Highlighted, Inactive Philosophies Grayed Out */}
      <div
        className="flex flex-wrap items-center gap-1 mb-2.5"
        data-testid="tactical-outcome-selector"
      >
        {TACTICAL_SYSTEMS.map((sys) => {
          const active = outcome.tacticKey === sys.key;
          return (
            <button
              key={sys.key}
              type="button"
              disabled={!active}
              aria-disabled={!active}
              data-active={active ? 'true' : 'false'}
              data-testid={`tactic-btn-${sys.key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              onClick={active && onChangeTactic ? onChangeTactic : undefined}
              title={
                active
                  ? `Active Philosophy: ${sys.key}`
                  : `${sys.key} locked on summary — open Philosophy to adapt tactical system`
              }
              className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold transition ${
                active
                  ? 'bg-[#18191F] text-white shadow-2xs cursor-pointer'
                  : 'bg-[#F1EFEA] text-[#9CA3AF] border border-[#E6E3DC]/70 opacity-60 cursor-not-allowed grayscale'
              }`}
            >
              {TACTIC_SHORT_LABELS[sys.key] || sys.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Projected Match Outcome Probability Strip */}
      <div className="mb-2.5 bg-[#F6F5F1] border border-[#E6E3DC] rounded-xl p-2">
        <div className="flex items-center justify-between text-[10px] font-bold mb-1 tabular-nums">
          <span className="text-emerald-700">Win {outcome.winProb}%</span>
          <span className="text-[#6B7280]">Draw {outcome.drawProb}%</span>
          <span className="text-rose-700">Loss {outcome.lossProb}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#E6E3DC]">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${outcome.winProb}%` }}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${outcome.drawProb}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${outcome.lossProb}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-[#6B7280] mt-1.5 tabular-nums">
          <span className="truncate">{outcome.styleTag}</span>
          <span className="font-extrabold text-[#18191F] shrink-0">xGD {outcome.expectedGoalDiff}</span>
        </div>
      </div>

      {/* Full-Pitch Fluctuating Spatial Tactical Heatmap (Clean without Attacking Direction arrow) */}
      <div
        className="w-full rounded-xl overflow-hidden border border-[#1E6E3E]/40 bg-[#1D6B3D] mb-2.5 relative"
        data-testid="tactical-heatmap-svg"
      >
        <svg
          viewBox="0 0 100 62"
          preserveAspectRatio="none"
          className="w-full aspect-[100/62] max-h-44 block"
        >
          <defs>
            <clipPath id="tacticalPitchClip">
              <rect x="0" y="0" width="100" height="62" />
            </clipPath>
            <filter
              id="tacticalHeatBlur"
              filterUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="100"
              height="62"
            >
              <feGaussianBlur stdDeviation={isDefensiveRelaxed ? '4.0' : '3.4'} />
            </filter>
          </defs>

          <g clipPath="url(#tacticalPitchClip)">
            {/* Mowed Turf Stripes */}
            <rect x="0" y="0" width="100" height="62" fill="#1D6B3D" />
            {[14, 34, 54, 74].map((x) => (
              <rect key={x} x={x} y="0" width="10" height="62" fill="#185E35" />
            ))}

            {/* Tactically Driven Spatial Heat Blobs (Smoothly Fluctuating) */}
            <g filter="url(#tacticalHeatBlur)">
              {outcome.zones.map((z) => {
                const color = getHeatColor(z.intensity, outcome.heatTint, outcome.heatGlow, outcome.tacticKey);
                const py = 5 + (z.row + 0.5) * (52 / 4);
                const px = 5 + (z.col + 0.5) * (90 / 6);
                const radius = (isDefensiveRelaxed ? 4.8 : 5.5) + z.intensity * (isDefensiveRelaxed ? 6.8 : 8.2);
                const maxOp = isDefensiveRelaxed ? 0.68 : 0.88;
                return (
                  <circle
                    key={z.id}
                    cx={px}
                    cy={py}
                    r={radius}
                    fill={color}
                    opacity={Math.min(maxOp, 0.08 + z.intensity * (isDefensiveRelaxed ? 0.56 : 0.72))}
                    style={{ transition: 'r 0.65s ease, opacity 0.65s ease, fill 0.5s ease' }}
                  />
                );
              })}
            </g>
          </g>

          {/* Crisp Pitch Markings Over Heat Layer */}
          <rect x="5" y="5" width="90" height="52" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.7" />
          <line x1="50" y1="5" x2="50" y2="57" stroke="rgba(255,255,255,0.75)" strokeWidth="0.6" />
          <circle cx="50" cy="31" r="8.5" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="0.6" />
          <circle cx="50" cy="31" r="0.8" fill="#FFFFFF" />

          {/* Left Penalty Box */}
          <rect x="5" y="16" width="14" height="30" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.65" />
          <rect x="5" y="23" width="5" height="16" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.65" />
          <rect x="3" y="26" width="2" height="10" fill="rgba(255,255,255,0.28)" stroke="#FFFFFF" strokeWidth="0.7" />

          {/* Right Penalty Box */}
          <rect x="81" y="16" width="14" height="30" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.65" />
          <rect x="90" y="23" width="5" height="16" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.65" />
          <rect x="95" y="26" width="2" height="10" fill="rgba(255,255,255,0.28)" stroke="#FFFFFF" strokeWidth="0.7" />
        </svg>
      </div>

      {/* 3 Tactical Output Index Tiles */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-xl p-2 text-center">
          <div className="text-[10px] font-semibold text-[#6B7280] truncate">Attack</div>
          <div className="text-sm font-black text-[#18191F] tabular-nums">{outcome.attackIndex}</div>
          <div className="text-[9px] font-semibold text-[#6B7280]">Threat idx</div>
        </div>
        <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-xl p-2 text-center">
          <div className="text-[10px] font-semibold text-[#6B7280] truncate">Press</div>
          <div className="text-sm font-black text-[#18191F] tabular-nums">{outcome.pressIntensity}</div>
          <div className="text-[9px] font-semibold text-[#6B7280]">PPDA tempo</div>
        </div>
        <div className="bg-[#F6F5F1] border border-[#E6E3DC] rounded-xl p-2 text-center">
          <div className="text-[10px] font-semibold text-[#6B7280] truncate">Control</div>
          <div className="text-sm font-black text-[#18191F] tabular-nums">{outcome.controlIndex}</div>
          <div className="text-[9px] font-semibold text-[#6B7280]">Compactness</div>
        </div>
      </div>
    </div>
  );
};
