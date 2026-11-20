import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  HostNation,
  NationalTeam,
  PreGameDirective,
  WorldCupShootoutKick,
} from '../types';

export interface WorldCupLiveEvent {
  minute: number;
  text: string;
  isGoal?: boolean;
  forUser?: boolean;
}

interface WorldCupLiveMatchArenaProps {
  stageLabel: string;
  team: NationalTeam;
  opponent: NationalTeam;
  hostNation: HostNation;
  teamGoals: number;
  oppGoals: number;
  minuteEvents: WorldCupLiveEvent[];
  startMinute?: number;
  endMinute?: number;
  extraTime?: boolean;
  pens?: boolean;
  teamPenGoals?: number;
  oppPenGoals?: number;
  shootoutSequence?: WorldCupShootoutKick[];
  directive?: PreGameDirective;
  halftimeIntervention?: 'steady' | 'all_out_attack' | 'park_the_bus' | null;
  effectiveUserOvr?: number;
  mode?: 'group' | 'knockout' | 'final';
  pauseAtMinute?: number | null;
  onMinuteUpdate?: (minute: number, userGoals: number, oppGoals: number, revealedEvents: WorldCupLiveEvent[]) => void;
  onComplete?: () => void;
}

type PitchVector = { x: number; y: number };

const BASE_USER_FORMATION: PitchVector[] = [
  { x: 38, y: 160 }, // GK
  { x: 122, y: 66 }, { x: 112, y: 126 }, { x: 112, y: 194 }, { x: 122, y: 254 }, // DEF
  { x: 224, y: 82 }, { x: 208, y: 160 }, { x: 224, y: 238 }, // MID
  { x: 332, y: 76 }, { x: 356, y: 160 }, { x: 332, y: 244 }, // FWD
];

const BASE_OPP_FORMATION: PitchVector[] = [
  { x: 602, y: 160 }, // GK
  { x: 518, y: 66 }, { x: 528, y: 126 }, { x: 528, y: 194 }, { x: 518, y: 254 }, // DEF
  { x: 416, y: 82 }, { x: 432, y: 160 }, { x: 416, y: 238 }, // MID
  { x: 308, y: 76 }, { x: 284, y: 160 }, { x: 308, y: 244 }, // FWD
];

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Deterministic pseudo-random helper for consistent smooth player sway
function wave(seed: number, minute: number, amp: number): number {
  return Math.sin(minute * 0.72 + seed * 1.93) * amp;
}

export const WorldCupLiveMatchArena: React.FC<WorldCupLiveMatchArenaProps> = ({
  stageLabel,
  team,
  opponent,
  hostNation,
  teamGoals,
  oppGoals,
  minuteEvents,
  startMinute = 1,
  endMinute = 90,
  extraTime = false,
  pens = false,
  teamPenGoals = 0,
  oppPenGoals = 0,
  shootoutSequence = [],
  directive = 'controlled_possession',
  halftimeIntervention = null,
  effectiveUserOvr = team.ovr,
  mode = 'knockout',
  pauseAtMinute = null,
  onMinuteUpdate,
  onComplete,
}) => {
  const [minute, setMinute] = useState<number>(startMinute);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 3>(1);
  const [phase, setPhase] = useState<'match' | 'extra_time_banner' | 'shootout' | 'finished'>('match');
  const [goalBanner, setGoalBanner] = useState<{ teamName: string; flag: string; minute: number; forUser: boolean } | null>(null);
  const [kickIndex, setKickIndex] = useState<number>(0);

  const onMinuteUpdateRef = useRef(onMinuteUpdate);
  const onCompleteRef = useRef(onComplete);
  onMinuteUpdateRef.current = onMinuteUpdate;
  onCompleteRef.current = onComplete;

  const sortedEvents = useMemo(
    () => [...minuteEvents].sort((a, b) => a.minute - b.minute),
    [minuteEvents]
  );

  // Reset minute cleanly if a new phase/half starts (e.g. Grand Final 2nd half 45 -> 90/120)
  useEffect(() => {
    setMinute(startMinute);
    setPhase('match');
    setKickIndex(0);
    setGoalBanner(null);
  }, [startMinute, endMinute, pauseAtMinute, stageLabel]);

  const effectiveTargetMinute = useMemo(() => {
    if (pauseAtMinute !== null && pauseAtMinute !== undefined) {
      return pauseAtMinute;
    }
    if (pens || extraTime) {
      return Math.max(endMinute, 120);
    }
    return endMinute;
  }, [pauseAtMinute, pens, extraTime, endMinute]);

  // Synthesize realistic fallback shootout sequence if pens is true without an explicit sequence
  const resolvedShootoutSequence = useMemo<WorldCupShootoutKick[]>(() => {
    if (!pens) return [];
    if (shootoutSequence && shootoutSequence.length > 0) return shootoutSequence;
    const seq: WorldCupShootoutKick[] = [];
    const totalRounds = Math.max(5, teamPenGoals, oppPenGoals);
    for (let r = 1; r <= totalRounds; r++) {
      seq.push({ round: r, taker: 'user', scored: r <= teamPenGoals });
      seq.push({ round: r, taker: 'opp', scored: r <= oppPenGoals });
    }
    return seq;
  }, [pens, shootoutSequence, teamPenGoals, oppPenGoals]);

  // Main Broadcast Clock Loop
  useEffect(() => {
    if (phase === 'finished') return;

    if (phase === 'extra_time_banner') {
      const etDelay = speedMultiplier === 3 ? 420 : 950;
      const timer = window.setTimeout(() => {
        setPhase('match');
      }, etDelay);
      return () => window.clearTimeout(timer);
    }

    if (phase === 'shootout') {
      if (resolvedShootoutSequence.length === 0 || kickIndex >= resolvedShootoutSequence.length) {
        const doneTimer = window.setTimeout(() => {
          setPhase('finished');
          onCompleteRef.current?.();
        }, speedMultiplier === 3 ? 280 : 650);
        return () => window.clearTimeout(doneTimer);
      }
      const kickStepMs = speedMultiplier === 3 ? 260 : 620;
      const timer = window.setTimeout(() => {
        setKickIndex((prev) => prev + 1);
      }, kickStepMs);
      return () => window.clearTimeout(timer);
    }

    const baseIntervalMs = mode === 'group' ? 48 : mode === 'final' ? 62 : 52;
    const stepMs = speedMultiplier === 3 ? Math.max(16, Math.round(baseIntervalMs / 3)) : baseIntervalMs;

    const timer = window.setInterval(() => {
      setMinute((prevMin) => {
        const step = mode === 'group' ? 3 : 1;
        const nextMin = Math.min(effectiveTargetMinute, prevMin + step);

        // Trigger Extra Time floodlights transition at 90' when match goes beyond 90
        if (prevMin < 90 && nextMin >= 90 && effectiveTargetMinute > 90) {
          setPhase('extra_time_banner');
        }

        // Trigger Goal celebration flash when crossing a goal event minute
        const newlyScoredGoal = sortedEvents.find(
          (ev) => ev.isGoal && ev.minute > prevMin && ev.minute <= nextMin
        );
        if (newlyScoredGoal) {
          setGoalBanner({
            teamName: newlyScoredGoal.forUser ? team.name : opponent.name,
            flag: newlyScoredGoal.forUser ? team.flag : opponent.flag,
            minute: newlyScoredGoal.minute,
            forUser: !!newlyScoredGoal.forUser,
          });
        }

        const revealed = sortedEvents.filter((ev) => ev.minute <= nextMin);
        const liveUserGoals = revealed.filter((ev) => ev.isGoal && ev.forUser).length;
        const liveOppGoals = revealed.filter((ev) => ev.isGoal && !ev.forUser).length;
        onMinuteUpdateRef.current?.(nextMin, liveUserGoals, liveOppGoals, revealed);

        if (nextMin >= effectiveTargetMinute) {
          window.clearInterval(timer);
          if (pens && !pauseAtMinute) {
            setPhase('shootout');
          } else {
            setPhase('finished');
            window.setTimeout(() => {
              onCompleteRef.current?.();
            }, 220);
          }
        }
        return nextMin;
      });
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [
    phase,
    speedMultiplier,
    mode,
    effectiveTargetMinute,
    sortedEvents,
    team.name,
    team.flag,
    opponent.name,
    opponent.flag,
    pens,
    pauseAtMinute,
    kickIndex,
    resolvedShootoutSequence.length,
  ]);

  // Auto-clear goal banner smoothly
  useEffect(() => {
    if (!goalBanner) return;
    const t = window.setTimeout(() => setGoalBanner(null), speedMultiplier === 3 ? 650 : 1250);
    return () => window.clearTimeout(t);
  }, [goalBanner, speedMultiplier]);

  const handleSkipToResult = () => {
    const revealed = sortedEvents.filter((ev) => ev.minute <= effectiveTargetMinute);
    onMinuteUpdateRef.current?.(
      effectiveTargetMinute,
      pauseAtMinute ? revealed.filter((e) => e.isGoal && e.forUser).length : teamGoals,
      pauseAtMinute ? revealed.filter((e) => e.isGoal && !e.forUser).length : oppGoals,
      revealed
    );
    setMinute(effectiveTargetMinute);
    setGoalBanner(null);
    if (pens && !pauseAtMinute && phase !== 'shootout' && kickIndex < resolvedShootoutSequence.length) {
      setKickIndex(resolvedShootoutSequence.length);
    }
    setPhase('finished');
    onCompleteRef.current?.();
  };

  // Revealed live scores during play
  const revealedEvents = useMemo(
    () => sortedEvents.filter((ev) => ev.minute <= minute),
    [sortedEvents, minute]
  );
  const liveUserGoals =
    phase === 'finished' && !pauseAtMinute
      ? teamGoals
      : revealedEvents.filter((ev) => ev.isGoal && ev.forUser).length;
  const liveOppGoals =
    phase === 'finished' && !pauseAtMinute
      ? oppGoals
      : revealedEvents.filter((ev) => ev.isGoal && !ev.forUser).length;

  // Compute dynamic ball + tactical pitch choreography for the current minute
  const choreography = useMemo(() => {
    const activeGoal = sortedEvents.find((ev) => ev.isGoal && Math.abs(ev.minute - minute) <= 2);
    const tacticalShift =
      halftimeIntervention === 'all_out_attack' || directive === 'high_press'
        ? 28
        : halftimeIntervention === 'park_the_bus' || directive === 'low_block_counter'
        ? -26
        : 0;

    // Possession & ball zone shifts organically between teams
    const ovrEdge = (effectiveUserOvr - opponent.ovr) * 0.015;
    const rawOsc = Math.sin(minute * 0.43) * 0.5 + Math.cos(minute * 0.19) * 0.5;
    let userAttackingBias = clamp(0.5 + ovrEdge + rawOsc * 0.45, 0.08, 0.92);

    if (activeGoal) {
      userAttackingBias = activeGoal.forUser ? 0.97 : 0.03;
    }

    const userPositions = BASE_USER_FORMATION.map((pos, idx) => {
      if (idx === 0) {
        return { x: pos.x, y: clamp(pos.y + wave(idx, minute, 9), 125, 195) };
      }
      const linePush = (userAttackingBias - 0.5) * 145 + tacticalShift;
      const x = clamp(pos.x + linePush + wave(idx + 3, minute, 14), 68, 576);
      const y = clamp(pos.y + wave(idx * 2, minute, 16), 34, 286);
      return { x, y };
    });

    const oppPositions = BASE_OPP_FORMATION.map((pos, idx) => {
      if (idx === 0) {
        return { x: pos.x, y: clamp(pos.y + wave(idx + 11, minute, 9), 125, 195) };
      }
      const oppPush = (userAttackingBias - 0.5) * 140;
      const x = clamp(pos.x + oppPush + wave(idx + 7, minute, 14), 64, 572);
      const y = clamp(pos.y + wave(idx * 3, minute, 16), 34, 286);
      return { x, y };
    });

    let ball: PitchVector;
    let passFrom: PitchVector;
    if (activeGoal) {
      if (activeGoal.forUser) {
        passFrom = userPositions[9];
        ball = { x: 614, y: 154 + ((activeGoal.minute % 3) - 1) * 14 };
      } else {
        passFrom = oppPositions[9];
        ball = { x: 26, y: 154 + ((activeGoal.minute % 3) - 1) * 14 };
      }
    } else {
      const carrierIsUser = userAttackingBias >= 0.48;
      const carrierIdx = 5 + (minute % 6); // mid or fwd
      const prevIdx = Math.max(1, carrierIdx - 2);
      ball = carrierIsUser ? userPositions[carrierIdx] : oppPositions[carrierIdx];
      passFrom = carrierIsUser ? userPositions[prevIdx] : oppPositions[prevIdx];
    }

    const isFinalHighlight = mode === 'final';
    const userPossession = clamp(
      Math.round(50 + (effectiveUserOvr - opponent.ovr) * 1.15 + (directive === 'controlled_possession' ? 6 : directive === 'low_block_counter' ? -7 : 0)),
      34,
      68
    );
    const progressRatio = clamp((minute - 1) / Math.max(1, endMinute), 0.05, 1.25);
    const userXg = (liveUserGoals * 0.72 + progressRatio * (effectiveUserOvr / opponent.ovr) * 0.95).toFixed(2);
    const oppXg = (liveOppGoals * 0.72 + progressRatio * (opponent.ovr / effectiveUserOvr) * 0.85).toFixed(2);
    const userShots = Math.max(liveUserGoals, Math.round(progressRatio * 11 * (effectiveUserOvr / opponent.ovr)));
    const oppShots = Math.max(liveOppGoals, Math.round(progressRatio * 10 * (opponent.ovr / effectiveUserOvr)));

    return {
      userPositions,
      oppPositions,
      ball,
      passFrom,
      activeGoal,
      isFinalHighlight,
      userPossession,
      oppPossession: 100 - userPossession,
      userXg,
      oppXg,
      userShots,
      oppShots,
    };
  }, [
    minute,
    sortedEvents,
    halftimeIntervention,
    directive,
    effectiveUserOvr,
    opponent.ovr,
    mode,
    endMinute,
    liveUserGoals,
    liveOppGoals,
  ]);

  // Current active kick animation coordinates for FIFA Penalty Shootout view
  const shootoutViewState = useMemo(() => {
    const taken = resolvedShootoutSequence.slice(0, kickIndex);
    const userKicks = taken.filter((k) => k.taker === 'user');
    const oppKicks = taken.filter((k) => k.taker === 'opp');
    const currentKick = kickIndex > 0 ? resolvedShootoutSequence[kickIndex - 1] : null;
    const targetCorner = currentKick
      ? currentKick.scored
        ? currentKick.round % 2 === 0
          ? { x: 256, y: 60 }
          : { x: 384, y: 60 }
        : { x: 320, y: 74 }
      : { x: 320, y: 184 };
    const keeperDiveX = currentKick
      ? currentKick.scored
        ? currentKick.round % 2 === 0
          ? 368
          : 272
        : 320
      : 320;
    return {
      userKicks,
      oppKicks,
      userScore: userKicks.filter((k) => k.scored).length,
      oppScore: oppKicks.filter((k) => k.scored).length,
      currentKick,
      targetCorner,
      keeperDiveX,
    };
  }, [resolvedShootoutSequence, kickIndex]);

  const statusText = useMemo(() => {
    if (phase === 'shootout') return 'PENALTY SHOOTOUT';
    if (phase === 'extra_time_banner') return 'EXTRA TIME (91\'–120\')';
    if (phase === 'finished') {
      return pauseAtMinute === 45 ? "45' HALF-TIME" : `${minute}' FULL-TIME`;
    }
    return minute > 90 ? `ET ${minute}'` : `${minute}' LIVE`;
  }, [phase, pauseAtMinute, minute]);

  return (
    <div
      data-testid="wc-live-arena"
      data-wc-phase={phase}
      data-wc-minute={minute}
      className="rounded-3xl bg-[#0F172A] text-white border border-slate-800 shadow-[0_18px_42px_rgba(15,23,42,0.34)] overflow-hidden"
    >
      {/* Broadcast Top Bar */}
      <div className="px-4 py-3 bg-[#111827] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
              phase === 'shootout' || minute > 90 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                phase === 'finished' ? 'bg-slate-400' : 'bg-rose-500 animate-pulse'
              }`}
            />
            <span>{statusText}</span>
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-[11px] font-semibold text-slate-300 truncate">
            {stageLabel} · {hostNation.stadium}, {hostNation.city}
          </span>
        </div>

        {/* Speed & Skip Controls */}
        {phase !== 'finished' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSpeedMultiplier(1)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                speedMultiplier === 1
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              1x
            </button>
            <button
              type="button"
              onClick={() => setSpeedMultiplier(3)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                speedMultiplier === 3
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              3x
            </button>
            <button
              type="button"
              onClick={handleSkipToResult}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
            >
              <span>Skip</span>
              <i className="fas fa-forward-step text-[9px]"></i>
            </button>
          </div>
        )}
      </div>

      {/* World Cup Broadcast Scoreboard */}
      <div className="px-4 py-3 bg-[#0B1120] border-b border-slate-800/80 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center justify-end gap-2.5 min-w-0">
          <div className="text-right min-w-0">
            <div className="text-xs sm:text-sm font-black text-white truncate">{team.name}</div>
            <div className="text-[10px] font-mono text-amber-300 tabular-nums">{effectiveUserOvr} OVR</div>
          </div>
          <span className="text-2xl sm:text-3xl shrink-0">{team.flag}</span>
        </div>

        <div className="px-4 py-1.5 rounded-xl bg-slate-900 border border-amber-400/35 font-mono font-black text-xl sm:text-2xl text-white tabular-nums whitespace-nowrap flex items-center gap-2.5 shadow-inner">
          <span data-testid="wc-live-user-goals">{liveUserGoals}</span>
          <span className="text-slate-500 text-base">–</span>
          <span data-testid="wc-live-opp-goals">{liveOppGoals}</span>
        </div>

        <div className="flex items-center justify-start gap-2.5 min-w-0">
          <span className="text-2xl sm:text-3xl shrink-0">{opponent.flag}</span>
          <div className="text-left min-w-0">
            <div className="text-xs sm:text-sm font-black text-white truncate">{opponent.name}</div>
            <div className="text-[10px] font-mono text-slate-400 tabular-nums">{opponent.ovr} OVR</div>
          </div>
        </div>
      </div>

      {/* Floodlit World Cup Pitch / Penalty Shootout Canvas */}
      <div className="relative w-full aspect-[2/1] max-h-[280px] bg-[#0B1424] overflow-hidden select-none">
        {phase === 'shootout' ? (
          <svg
            viewBox="0 0 640 320"
            className="w-full h-full block"
            role="img"
            aria-label={`Penalty Shootout: ${team.name} vs ${opponent.name}`}
          >
            <defs>
              <radialGradient id="wc-spot-glow" cx="50%" cy="20%" r="70%">
                <stop offset="0%" stopColor="#fde68a" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Stadium Crowd Backdrop & Floodlit Penalty Box */}
            <rect width="640" height="320" fill="#0f172a" />
            <rect x="20" y="24" width="600" height="278" rx="14" fill="#166534" />
            <rect x="20" y="24" width="600" height="278" rx="14" fill="url(#wc-spot-glow)" />

            {/* Turf Mow Stripes */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect
                key={i}
                x={20 + i * 100}
                y="24"
                width="50"
                height="278"
                fill="#15803d"
                opacity="0.45"
              />
            ))}

            {/* 18-yard Box & Penalty Arc */}
            <rect x="130" y="48" width="380" height="205" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2.5" />
            <rect x="220" y="48" width="200" height="72" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" />
            <path d="M 248 253 A 84 84 0 0 0 392 253" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" />

            {/* Goal Frame & Net */}
            <rect x="236" y="26" width="168" height="26" fill="#0f172a" fillOpacity="0.45" stroke="#f8fafc" strokeWidth="3.5" />
            {[252, 272, 292, 312, 332, 352, 372, 392].map((nx) => (
              <line key={nx} x1={nx} y1="26" x2={nx} y2="52" stroke="#cbd5e1" strokeOpacity="0.35" strokeWidth="1" />
            ))}

            {/* Penalty Spot */}
            <circle cx="320" cy="186" r="4.5" fill="#ffffff" fillOpacity="0.85" />

            {/* Goalkeeper */}
            <g style={{ transition: 'transform 260ms ease-out', transform: `translate(${shootoutViewState.keeperDiveX - 320}px, 0px)` }}>
              <circle cx="320" cy="60" r="11" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
              <text x="320" y="64" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0f172a">
                GK
              </text>
            </g>

            {/* Shot Trajectory & Animated Ball */}
            {shootoutViewState.currentKick && (
              <line
                x1="320"
                y1="186"
                x2={shootoutViewState.targetCorner.x}
                y2={shootoutViewState.targetCorner.y}
                stroke={shootoutViewState.currentKick.scored ? '#34d399' : '#fb7185'}
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />
            )}
            <g
              style={{
                transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                transform: `translate(${shootoutViewState.targetCorner.x - 320}px, ${shootoutViewState.targetCorner.y - 186}px)`,
              }}
            >
              <circle cx="320" cy="186" r="8" fill="#ffffff" stroke="#0f172a" strokeWidth="2.2" />
            </g>

            {/* Shooter Badge */}
            <g>
              <circle
                cx="320"
                cy="226"
                r="11"
                fill={
                  shootoutViewState.currentKick?.taker === 'opp' ? opponent.color : team.color
                }
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text x="320" y="230" textAnchor="middle" fontSize="8" fontWeight="900" fill="#ffffff">
                {shootoutViewState.currentKick?.taker === 'opp' ? opponent.code : team.code}
              </text>
            </g>
          </svg>
        ) : (
          <svg
            viewBox="0 0 640 320"
            className="w-full h-full block"
            role="img"
            aria-label={`Live pitch view: ${team.name} vs ${opponent.name}`}
          >
            <defs>
              <radialGradient id="wc-floodlight-l" cx="8%" cy="6%" r="55%">
                <stop offset="0%" stopColor={choreography.isFinalHighlight ? '#fde68a' : '#e0f2fe'} stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="wc-floodlight-r" cx="92%" cy="6%" r="55%">
                <stop offset="0%" stopColor={choreography.isFinalHighlight ? '#fde68a' : '#e0f2fe'} stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Stadium Perimeter Bowl */}
            <rect width="640" height="320" fill="#0f172a" />
            <rect
              x="16"
              y="14"
              width="608"
              height="292"
              rx="12"
              fill={choreography.isFinalHighlight ? '#422006' : '#1e293b'}
              stroke={choreography.isFinalHighlight ? '#f59e0b' : '#334155'}
              strokeOpacity="0.5"
              strokeWidth="1.5"
            />
            <text
              x="320"
              y="26"
              textAnchor="middle"
              fontSize="8"
              fontWeight="800"
              letterSpacing="3"
              fill={choreography.isFinalHighlight ? '#fbbf24' : '#94a3b8'}
            >
              WORLD CUP {hostNation.code} · {hostNation.stadium.toUpperCase()}
            </text>

            {/* Emerald Grass Pitch */}
            <rect x="26" y="34" width="588" height="252" rx="6" fill="#15803d" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <rect
                key={i}
                x={26 + i * 58.8}
                y="34"
                width="29.4"
                height="252"
                fill="#166534"
                opacity="0.45"
              />
            ))}

            {/* Stadium Floodlight Halo */}
            <rect width="640" height="320" fill="url(#wc-floodlight-l)" pointerEvents="none" />
            <rect width="640" height="320" fill="url(#wc-floodlight-r)" pointerEvents="none" />

            {/* Pitch Chalk Lines */}
            <rect x="34" y="42" width="572" height="236" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" />
            <line x1="320" y1="42" x2="320" y2="278" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" />
            <circle cx="320" cy="160" r="38" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" />
            <circle cx="320" cy="160" r="3" fill="#ffffff" fillOpacity="0.7" />

            {/* Left Penalty Area */}
            <rect x="34" y="92" width="76" height="136" fill="none" stroke="#ffffff" strokeOpacity="0.58" strokeWidth="2" />
            <rect x="34" y="124" width="28" height="72" fill="none" stroke="#ffffff" strokeOpacity="0.58" strokeWidth="1.5" />
            <path d="M 110 132 A 34 34 0 0 1 110 188" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.5" />
            <rect
              x="22"
              y="136"
              width="12"
              height="48"
              fill={choreography.activeGoal && !choreography.activeGoal.forUser ? '#f43f5e' : '#0f172a'}
              fillOpacity={choreography.activeGoal && !choreography.activeGoal.forUser ? 0.55 : 0.45}
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Right Penalty Area */}
            <rect x="530" y="92" width="76" height="136" fill="none" stroke="#ffffff" strokeOpacity="0.58" strokeWidth="2" />
            <rect x="578" y="124" width="28" height="72" fill="none" stroke="#ffffff" strokeOpacity="0.58" strokeWidth="1.5" />
            <path d="M 530 132 A 34 34 0 0 0 530 188" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.5" />
            <rect
              x="606"
              y="136"
              width="12"
              height="48"
              fill={choreography.activeGoal && choreography.activeGoal.forUser ? '#fbbf24' : '#0f172a'}
              fillOpacity={choreography.activeGoal && choreography.activeGoal.forUser ? 0.65 : 0.45}
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Pass / Shot Trail */}
            <line
              x1={choreography.passFrom.x}
              y1={choreography.passFrom.y}
              x2={choreography.ball.x}
              y2={choreography.ball.y}
              stroke={choreography.activeGoal ? '#fbbf24' : '#ffffff'}
              strokeOpacity={choreography.activeGoal ? 0.85 : 0.42}
              strokeWidth={choreography.activeGoal ? '2.5' : '1.5'}
              strokeDasharray="4 4"
            />

            {/* User Nation Players */}
            {choreography.userPositions.map((p, idx) => (
              <g
                key={`u-${idx}`}
                style={{
                  transition: 'transform 160ms linear',
                  transform: `translate(${p.x}px, ${p.y}px)`,
                }}
              >
                <circle
                  cx="0"
                  cy="0"
                  r={idx === 0 ? 7 : 8}
                  fill={idx === 0 ? '#f59e0b' : team.color || '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {idx === 9 && (
                  <text x="0" y="3" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#ffffff">
                    9
                  </text>
                )}
              </g>
            ))}

            {/* Opponent Nation Players */}
            {choreography.oppPositions.map((p, idx) => (
              <g
                key={`o-${idx}`}
                style={{
                  transition: 'transform 160ms linear',
                  transform: `translate(${p.x}px, ${p.y}px)`,
                }}
              >
                <circle
                  cx="0"
                  cy="0"
                  r={idx === 0 ? 7 : 8}
                  fill={idx === 0 ? '#475569' : opponent.color || '#dc2626'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              </g>
            ))}

            {/* Football with crisp shadow */}
            <g
              style={{
                transition: 'transform 140ms ease-out',
                transform: `translate(${choreography.ball.x}px, ${choreography.ball.y}px)`,
              }}
            >
              <circle cx="1.5" cy="2" r="5" fill="#000000" fillOpacity="0.45" />
              <circle cx="0" cy="0" r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
            </g>
          </svg>
        )}

        {/* Goal Flash Banner Overlay */}
        {goalBanner && phase === 'match' && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-4">
            <div
              className={`px-4 py-1.5 rounded-xl border shadow-lg flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
                goalBanner.forUser
                  ? 'bg-amber-400 text-slate-950 border-amber-200'
                  : 'bg-rose-600 text-white border-rose-300'
              }`}
            >
              <span>{goalBanner.flag}</span>
              <span>GOAL · {goalBanner.teamName} ({goalBanner.minute}')</span>
            </div>
          </div>
        )}

        {/* Extra Time Floodlight Transition Banner */}
        {phase === 'extra_time_banner' && (
          <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center p-4 text-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
              Deadlock After 90 Minutes
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              EXTRA TIME · 91'–120'
            </div>
          </div>
        )}
      </div>

      {/* Penalty Shootout Kick Tracker OR Live Match Analytics Footer */}
      {phase === 'shootout' || (pens && phase === 'finished' && !pauseAtMinute) ? (
        <div className="px-4 py-3 bg-[#111827] border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-300">
            <span>FIFA Penalty Shootout</span>
            <span className="font-mono tabular-nums">
              {team.code} {phase === 'finished' ? teamPenGoals : shootoutViewState.userScore} : {phase === 'finished' ? oppPenGoals : shootoutViewState.oppScore} {opponent.code}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { nation: team, kicks: shootoutViewState.userKicks },
              { nation: opponent, kicks: shootoutViewState.oppKicks },
            ].map((side) => (
              <div key={side.nation.code} className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5">
                <span className="font-bold text-slate-200 truncate">
                  {side.nation.flag} {side.nation.code}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {Array.from({ length: Math.max(5, side.kicks.length) }).map((_, i) => {
                    const kick = side.kicks[i];
                    if (!kick) {
                      return (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-sm border border-slate-700 bg-slate-800/70 inline-flex items-center justify-center text-[9px] text-slate-500"
                        >
                          ·
                        </span>
                      );
                    }
                    return (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-sm inline-flex items-center justify-center text-[10px] font-black ${
                          kick.scored
                            ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                            : 'bg-rose-500/20 border border-rose-400 text-rose-300'
                        }`}
                      >
                        {kick.scored ? '✓' : '✗'}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-2.5 bg-[#111827] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tabular-nums text-slate-300">
          <span>
            Possession <strong className="text-white">{choreography.userPossession}%</strong> – {choreography.oppPossession}%
          </span>
          <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
          <span>
            xG <strong className="text-amber-300">{choreography.userXg}</strong> – {choreography.oppXg}
          </span>
          <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
          <span>
            Shots <strong className="text-white">{choreography.userShots}</strong> – {choreography.oppShots}
          </span>
        </div>
      )}
    </div>
  );
};
