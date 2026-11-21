import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Club,
  HostNation,
  MatchdayOutcome,
  MatchPhase,
  NationalTeam,
  PreGameDirective,
  WorldCupShootoutKick,
} from '../types';
import { StadiumBowl3D } from './StadiumBowl3D';
import {
  WorldCupVenueStage,
  computeWorldCupAttendance,
  formatStadiumStyleLabel,
  getWorldCupMatchVenue,
  inferWorldCupVenueStage,
  mapWorldCupDirectiveToTactic,
} from '../engine/worldCupStadiums';

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
  year?: number;
  venueStage?: WorldCupVenueStage;
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

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const WorldCupLiveMatchArena: React.FC<WorldCupLiveMatchArenaProps> = ({
  stageLabel,
  team,
  opponent,
  hostNation,
  year,
  venueStage,
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
  directive = 'controlled_possession' as PreGameDirective,
  halftimeIntervention = null,
  effectiveUserOvr = team.ovr,
  mode = 'knockout' as 'group' | 'knockout' | 'final',
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
  const minuteRef = useRef<number>(startMinute);
  const completedRef = useRef<boolean>(false);
  const completeTimeoutRef = useRef<number | null>(null);
  onMinuteUpdateRef.current = onMinuteUpdate;
  onCompleteRef.current = onComplete;

  const triggerComplete = () => {
    if (completeTimeoutRef.current !== null) {
      window.clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current?.();
  };

  useEffect(() => {
    return () => {
      if (completeTimeoutRef.current !== null) {
        window.clearTimeout(completeTimeoutRef.current);
        completeTimeoutRef.current = null;
      }
    };
  }, []);

  // Resolve authentic original host-country stadium for this exact World Cup match stage & edition
  const resolvedVenueStage = useMemo<WorldCupVenueStage>(
    () => venueStage ?? inferWorldCupVenueStage(mode, stageLabel),
    [venueStage, mode, stageLabel]
  );

  const venue = useMemo(
    () => getWorldCupMatchVenue(hostNation, resolvedVenueStage, year),
    [hostNation, resolvedVenueStage, year]
  );

  const isHostPlaying =
    team.code === hostNation.code || opponent.code === hostNation.code;

  const attendance = useMemo(
    () => computeWorldCupAttendance(venue, resolvedVenueStage, isHostPlaying),
    [venue, resolvedVenueStage, isHostPlaying]
  );

  // Memoized synthetic Club so StadiumBowl3D preserves cached 3D bowl geometry across match ticks
  const syntheticHomeClub = useMemo<Club>(
    () => ({
      id: 99000 + (year ?? 2026),
      name: team.name,
      tier: 1,
      baseOvr: Math.max(1, effectiveUserOvr || team.ovr || 80),
      color: team.color || '#2563EB',
      stadium: venue.capacity,
      stadiumName: venue.name,
      stadiumStyle: venue.stadiumStyle,
      country: hostNation.code,
      fanBase: venue.capacity,
    }),
    [team.name, team.color, team.ovr, effectiveUserOvr, venue.capacity, venue.name, venue.stadiumStyle, hostNation.code, year]
  );

  const tacticLabel = useMemo(
    () => mapWorldCupDirectiveToTactic(directive, halftimeIntervention),
    [directive, halftimeIntervention]
  );

  const sortedEvents = useMemo(
    () => [...minuteEvents].sort((a, b) => a.minute - b.minute),
    [minuteEvents]
  );

  // Reset minute cleanly if a new phase/half starts (e.g. Grand Final 2nd half 45 -> 90/120)
  useEffect(() => {
    if (completeTimeoutRef.current !== null) {
      window.clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
    completedRef.current = false;
    minuteRef.current = startMinute;
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
          triggerComplete();
        }, speedMultiplier === 3 ? 280 : 650);
        return () => window.clearTimeout(doneTimer);
      }
      const kickStepMs = speedMultiplier === 3 ? 260 : 620;
      const timer = window.setTimeout(() => {
        setKickIndex((prev) => prev + 1);
      }, kickStepMs);
      return () => window.clearTimeout(timer);
    }

    const baseIntervalMs = mode === 'group' ? 110 : mode === 'final' ? 88 : 78;
    const stepMs = speedMultiplier === 3 ? Math.max(24, Math.round(baseIntervalMs / 3)) : baseIntervalMs;

    const timer = window.setInterval(() => {
      const prevMin = minuteRef.current;
      const step = mode === 'group' ? 2 : 1;
      const nextMin = Math.min(effectiveTargetMinute, prevMin + step);
      minuteRef.current = nextMin;
      setMinute(nextMin);

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
          if (completeTimeoutRef.current !== null) {
            window.clearTimeout(completeTimeoutRef.current);
          }
          completeTimeoutRef.current = window.setTimeout(() => {
            completeTimeoutRef.current = null;
            triggerComplete();
          }, 220);
        }
      }
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
    if (completedRef.current) return;
    minuteRef.current = effectiveTargetMinute;
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
    triggerComplete();
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

  // Live analytics + 3D match phase driver
  const matchTelemetry = useMemo(() => {
    const activeGoal = sortedEvents.find((ev) => ev.isGoal && Math.abs(ev.minute - minute) <= 2);
    const activeEvent = sortedEvents.find((ev) => !ev.isGoal && Math.abs(ev.minute - minute) <= 2);

    const userPossession = clamp(
      Math.round(
        50 +
          (effectiveUserOvr - opponent.ovr) * 1.15 +
          (directive === 'controlled_possession'
            ? 6
            : directive === 'low_block_counter'
            ? -7
            : 0)
      ),
      34,
      68
    );
    const safeUserOvr = Math.max(1, effectiveUserOvr || 70);
    const safeOppOvr = Math.max(1, opponent.ovr || 70);
    const progressRatio = clamp((minute - 1) / Math.max(1, endMinute), 0.05, 1.25);
    const userXg = (liveUserGoals * 0.72 + progressRatio * (safeUserOvr / safeOppOvr) * 0.95).toFixed(2);
    const oppXg = (liveOppGoals * 0.72 + progressRatio * (safeOppOvr / safeUserOvr) * 0.85).toFixed(2);
    const userShots = Math.max(liveUserGoals, Math.round(progressRatio * 11 * (safeUserOvr / safeOppOvr)));
    const oppShots = Math.max(liveOppGoals, Math.round(progressRatio * 10 * (safeOppOvr / safeUserOvr)));

    let stadiumPhase: MatchPhase = 'buildup';
    if (phase === 'finished') {
      stadiumPhase = 'idle';
    } else if (goalBanner || activeGoal) {
      stadiumPhase = 'goal';
    } else if (phase === 'extra_time_banner') {
      stadiumPhase = 'setpiece';
    } else if (activeEvent) {
      stadiumPhase = 'shot';
    } else {
      const cycle = Math.floor(minute / 6) % 4;
      stadiumPhase =
        cycle === 0
          ? 'buildup'
          : cycle === 1
          ? 'counter'
          : cycle === 2
          ? 'shot'
          : 'setpiece';
    }

    return {
      activeGoal,
      stadiumPhase,
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
    directive,
    effectiveUserOvr,
    opponent.ovr,
    endMinute,
    liveUserGoals,
    liveOppGoals,
    phase,
    goalBanner,
  ]);

  // Synthetic live MatchdayOutcome so StadiumBowl3D crowd & choreography respond to who is leading
  const liveOutcome = useMemo<MatchdayOutcome>(() => {
    const result: 'W' | 'D' | 'L' =
      liveUserGoals > liveOppGoals
        ? 'W'
        : liveUserGoals < liveOppGoals
        ? 'L'
        : 'D';
    return {
      matchday: 1,
      opponentId: 99999,
      opponentName: opponent.name,
      opponentColor: opponent.color || '#DC2626',
      opponentOvr: opponent.ovr || 80,
      isHome: true,
      userGoals: liveUserGoals,
      oppGoals: liveOppGoals,
      result,
      ptsEarned: result === 'W' ? 3 : result === 'D' ? 1 : 0,
      runningPts: 0,
      runningPoints: 0,
      runningWins: result === 'W' ? 1 : 0,
      runningW: result === 'W' ? 1 : 0,
      runningDraws: result === 'D' ? 1 : 0,
      runningD: result === 'D' ? 1 : 0,
      runningLosses: result === 'L' ? 1 : 0,
      runningL: result === 'L' ? 1 : 0,
      runningGf: liveUserGoals,
      runningGa: liveOppGoals,
      runningGd: liveUserGoals - liveOppGoals,
      runningPos: 1,
      runningPosition: 1,
      attendance,
    };
  }, [opponent.name, opponent.color, opponent.ovr, liveUserGoals, liveOppGoals, attendance]);

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
    if (phase === 'extra_time_banner') return "EXTRA TIME (91'–120')";
    if (phase === 'finished') {
      return pauseAtMinute === 45 ? "45' HALF-TIME" : `${minute}' FULL-TIME`;
    }
    return minute > 90 ? `ET ${minute}'` : `${minute}' LIVE`;
  }, [phase, pauseAtMinute, minute]);

  // Floodlights automatically turn on when a sunlit match enters Extra Time
  const stadiumTimeOfDay = minute > 90 ? 'night' : venue.timeOfDay;
  const worldCupEditionLabel = year ? `WORLD CUP ${year}` : `WORLD CUP ${hostNation.code}`;

  return (
    <div
      data-testid="wc-live-arena"
      data-wc-phase={phase}
      data-wc-minute={minute}
      data-wc-venue={venue.name}
      data-wc-city={venue.city}
      data-wc-style={venue.stadiumStyle}
      data-wc-capacity={venue.capacity}
      className="rounded-3xl bg-[#0F172A] text-white border border-slate-800 shadow-[0_18px_42px_rgba(15,23,42,0.34)] overflow-hidden"
    >
      {/* Broadcast Top Bar */}
      <div className="px-4 py-3 bg-[#111827] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
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
          <span className="text-[11px] font-bold text-white truncate" data-testid="wc-venue-label">
            {venue.name}
          </span>
          <span className="text-[11px] font-medium text-slate-400 truncate">
            {venue.city} · {stageLabel}
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

      {/* Isometric 3D Host-Country Stadium Engine OR Floodlit Penalty Shootout Camera */}
      <div className="relative w-full bg-[#0B1424] overflow-hidden select-none">
        {phase === 'shootout' ? (
          <div className="relative w-full h-[320px] sm:h-[360px] bg-[#0B1424]">
            <svg
              viewBox="0 0 640 320"
              className="w-full h-full block"
              role="img"
              aria-label={`Penalty Shootout at ${venue.name}: ${team.name} vs ${opponent.name}`}
            >
              <defs>
                <radialGradient id="wc-spot-glow" cx="50%" cy="20%" r="70%">
                  <stop offset="0%" stopColor="#fde68a" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Stadium Crowd Backdrop & Floodlit Penalty Box */}
              <rect width="640" height="320" fill="#0f172a" />
              <text
                x="320"
                y="16"
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="800"
                letterSpacing="2.4"
                fill="#fbbf24"
              >
                {venue.name.toUpperCase()} · {venue.city.toUpperCase()} · PENALTY SHOOTOUT
              </text>
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
          </div>
        ) : (
          <StadiumBowl3D
            club={syntheticHomeClub}
            pitchDesignId={venue.pitchDesignId}
            stadiumStyle={venue.stadiumStyle}
            stadiumPolicy={resolvedVenueStage === 'final' ? 'ultras' : 'balanced'}
            vipHospitalityActive={true}
            attendance={attendance}
            capacity={venue.capacity}
            isLive={phase === 'match'}
            currentOutcome={liveOutcome}
            currentMatchday={1}
            totalMatchdays={6}
            subTick={Math.floor(minute / 6)}
            opponentName={opponent.name}
            opponentColor={opponent.color || '#DC2626'}
            userGoals={liveUserGoals}
            oppGoals={liveOppGoals}
            tacticLabel={tacticLabel}
            compactMode={true}
            hideTopHud={true}
            initialTimeOfDay={stadiumTimeOfDay}
            forcedMatchPhase={matchTelemetry.stadiumPhase}
            customTopBoardText={`${worldCupEditionLabel} · ${stageLabel.toUpperCase()}`}
            customBottomBoardText={`${venue.name} · ${venue.city}`}
            customHomeBoardText={`${team.name.toUpperCase()} · ${team.code}`}
            customAwayBoardText={`${opponent.name.toUpperCase()} · ${opponent.code}`}
            containerClassName="h-[340px] sm:h-[410px] rounded-none border-0 shadow-none"
          />
        )}

        {/* Authentic Host Venue Architectural Tag (Top-Left Floating Overlay) */}
        {phase !== 'shootout' && (
          <div className="pointer-events-none absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
            <div className="bg-slate-950/80 backdrop-blur-xs border border-white/15 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-2">
              <span className="text-sm leading-none">{hostNation.flag}</span>
              <div className="leading-tight">
                <div className="text-[11px] font-extrabold text-white">
                  {venue.name}
                </div>
                <div className="text-[9.5px] font-semibold text-amber-300/95">
                  {venue.city} · {formatStadiumStyleLabel(venue.stadiumStyle)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goal Flash Banner Overlay */}
        {goalBanner && phase === 'match' && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-4 z-20">
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
          <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center p-4 text-center z-20">
            <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
              Deadlock After 90 Minutes · Floodlights On at {venue.name}
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
            <span>FIFA Penalty Shootout · {venue.name}</span>
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
            Possession <strong className="text-white">{matchTelemetry.userPossession}%</strong> – {matchTelemetry.oppPossession}%
          </span>
          <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
          <span>
            xG <strong className="text-amber-300">{matchTelemetry.userXg}</strong> – {matchTelemetry.oppXg}
          </span>
          <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
          <span>
            Shots <strong className="text-white">{matchTelemetry.userShots}</strong> – {matchTelemetry.oppShots}
          </span>
        </div>
      )}
    </div>
  );
};
