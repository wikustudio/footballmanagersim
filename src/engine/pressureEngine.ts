import {
  Club,
  GameState,
  MatchdayOutcome,
  PressureAssessment,
  PressureChoiceId,
  PressureLevel,
  PressureMediaClipping,
  PressureOption,
  PressureScenario,
  PressureSeasonVerdict,
} from '../types';
import { getLeagueInfo, getLeagueScaledFans, getLeagueScaledVal, getMaxTier } from '../data/gameConstants';
import { resolveHistoryClubDisplay } from '../utils/modSafeguards';

const safeAdjustOvr = (current: number | undefined, change: number, min = 10, max = 100): number => {
  const base = Number.isFinite(Number(current)) ? Number(current) : 60;
  return Math.max(min, Math.min(max, Math.round(base + change)));
};

const safeAdjustBudget = (current: number | undefined, change: number): number => {
  const base = Number.isFinite(Number(current)) ? Number(current) : 0;
  return Math.round(base + change);
};

const safeAdjustFans = (current: number | undefined, change: number): number => {
  const base = Number.isFinite(Number(current)) ? Number(current) : 1000;
  return Math.max(100, Math.round(base + change));
};

export interface PressureEvalContext {
  phase: 'mid' | 'end' | 'dashboard';
  pos: number;
  pts: number;
  matchdaysPlayed: number;
  schedule?: MatchdayOutcome[];
  clubDisplayName?: string;
}

export interface PressureLevelMeta {
  level: PressureLevel;
  label: string;
  shortLabel: string;
  badgeClass: string;
  barClass: string;
  textClass: string;
  borderClass: string;
  icon: string;
}

const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, Math.round(val)));

export function getPressureLevelFromScore(score: number): PressureLevel {
  const s = clamp(score, 0, 100);
  if (s >= 75) return 'crisis';
  if (s >= 55) return 'high';
  if (s >= 30) return 'scrutiny';
  return 'calm';
}

export function getPressureLevelMeta(score: number): PressureLevelMeta {
  const level = getPressureLevelFromScore(score);
  if (level === 'crisis') {
    return {
      level,
      label: 'Media Firestorm',
      shortLabel: 'CRISIS',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      barClass: 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600',
      textClass: 'text-rose-700',
      borderClass: 'border-rose-300',
      icon: 'fa-fire-flame-curved',
    };
  }
  if (level === 'high') {
    return {
      level,
      label: 'Intense Heat',
      shortLabel: 'HIGH HEAT',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
      barClass: 'bg-gradient-to-r from-amber-500 to-orange-600',
      textClass: 'text-orange-700',
      borderClass: 'border-orange-300',
      icon: 'fa-bullhorn',
    };
  }
  if (level === 'scrutiny') {
    return {
      level,
      label: 'Under Scrutiny',
      shortLabel: 'SCRUTINY',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      barClass: 'bg-gradient-to-r from-sky-500 to-amber-500',
      textClass: 'text-amber-700',
      borderClass: 'border-amber-200',
      icon: 'fa-newspaper',
    };
  }
  return {
    level,
    label: 'Calm Waters',
    shortLabel: 'CALM',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barClass: 'bg-gradient-to-r from-emerald-500 to-sky-500',
    textClass: 'text-emerald-700',
    borderClass: 'border-[#E6E3DC]',
    icon: 'fa-wind',
  };
}

export function getMaxLossStreak(schedule?: MatchdayOutcome[]): number {
  if (!Array.isArray(schedule) || schedule.length === 0) return 0;
  let current = 0;
  let best = 0;
  for (const m of schedule) {
    if (m.result === 'L') {
      current += 1;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

export function getRecentWinlessRun(schedule?: MatchdayOutcome[]): number {
  if (!Array.isArray(schedule) || schedule.length === 0) return 0;
  let count = 0;
  for (let i = schedule.length - 1; i >= 0; i--) {
    if (schedule[i].result === 'W') break;
    count += 1;
  }
  return count;
}

export function resolveClubNameForPress(
  state: GameState,
  clubsDb?: Club[],
  isModActive?: boolean,
  explicitName?: string
): string {
  if (explicitName && explicitName.trim()) return explicitName.trim();
  const modActive = isModActive !== undefined
    ? isModActive
    : (typeof window !== 'undefined' && localStorage.getItem('fms_real_mod_active') === 'true');
  const resolved = resolveHistoryClubDisplay(
    {
      id: state.club.id,
      name: state.club.name || 'Club',
      country: state.club.country,
      color: state.club.color,
      logo: state.club.logo,
      fallbackLogo: state.club.fallbackLogo,
    },
    modActive,
    clubsDb
  );
  return resolved.name || state.club.name || 'Club';
}

export function evaluatePerformancePressure(
  state: GameState,
  context: PressureEvalContext,
  clubsDb?: Club[],
  isModActive?: boolean
): PressureAssessment {
  const tier = state.club?.tier || 1;
  const country = state.club?.country || 'GER';
  const leagueInfo = getLeagueInfo(tier, country);
  const avgOvr = leagueInfo?.avgOvr || 65;
  const clubOvr = state.club?.baseOvr || 65;
  const ovrGap = clubOvr - avgOvr;

  const expectedRank = Math.max(
    1,
    Math.min(
      18,
      state.boardTargetFinish ||
        (ovrGap >= 8 || state.boardExpectsSuccess
          ? 2
          : ovrGap >= 4
          ? 5
          : ovrGap >= 0
          ? 9
          : 14)
    )
  );

  const actualRank = clamp(context.pos || 10, 1, 18);
  const matchdaysPlayed = Math.max(1, context.matchdaysPlayed || 17);
  const pts = Math.max(0, context.pts || 0);
  const expectationGap = actualRank - expectedRank;

  // Target points pace calibrated to realistic 34-game table bands
  const expectedFinalPts =
    expectedRank === 1
      ? 76
      : expectedRank <= 3
      ? 65
      : expectedRank <= 6
      ? 52
      : expectedRank <= 10
      ? 43
      : 32;
  const targetPtsPace = Math.round((expectedFinalPts / 34) * matchdaysPlayed);
  const ptsGapFromTarget = Math.max(0, targetPtsPace - pts);

  const maxLossStreak = getMaxLossStreak(context.schedule);
  const recentWinless = getRecentWinlessRun(context.schedule);
  const streakLosses = Math.max(maxLossStreak, Math.min(recentWinless, 5));

  const isTitleContenderExpectation =
    expectedRank <= 3 ||
    Boolean(state.boardExpectsSuccess) ||
    ovrGap >= 5 ||
    ((state.consecutiveTitles || 0) >= 1 && tier === 1);

  const maxCountryTier = getMaxTier(country, clubsDb);
  const canRelegate = maxCountryTier > 1 && tier < maxCountryTier;
  const isRelegationDanger = canRelegate && actualRank >= 15;
  const isSeriousTitleCollapse =
    isTitleContenderExpectation &&
    (actualRank >= 6 ||
      expectationGap >= 4 ||
      (actualRank >= 4 && ptsGapFromTarget >= 9));

  const isRelegationSpiral =
    !isSeriousTitleCollapse &&
    isRelegationDanger &&
    (expectationGap >= 2 || actualRank >= 16 || streakLosses >= 3);

  let scenario: PressureScenario = 'none';
  if (isSeriousTitleCollapse) {
    scenario = 'title_collapse';
  } else if (isRelegationSpiral) {
    scenario = 'relegation_spiral';
  } else if (expectationGap >= 4 || (ptsGapFromTarget >= 9 && expectationGap >= 2)) {
    scenario = 'expectation_gap';
  }

  // Compute pressure delta from current performance vs carryover heat
  const prevPressure = clamp(state.mediaPressure ?? 18, 0, 100);
  let performanceHeat = 0;

  if (scenario === 'title_collapse') {
    performanceHeat =
      36 +
      Math.min(26, Math.max(0, expectationGap) * 4) +
      Math.min(14, ptsGapFromTarget) +
      (state.consecutiveTitles ? 6 : 0) +
      (actualRank >= 10 ? 10 : 0);
  } else if (scenario === 'relegation_spiral') {
    performanceHeat =
      34 +
      (actualRank === 18 ? 20 : actualRank === 17 ? 15 : actualRank === 16 ? 10 : 5) +
      Math.min(14, Math.max(0, expectationGap) * 3) +
      Math.min(10, ptsGapFromTarget);
  } else if (scenario === 'expectation_gap') {
    performanceHeat = 20 + Math.min(20, expectationGap * 3) + Math.min(10, Math.floor(ptsGapFromTarget * 0.8));
  } else if (expectationGap <= -1) {
    // Outperforming targets cools the press quickly
    performanceHeat = -Math.min(30, 12 + Math.abs(expectationGap) * 3);
  } else if (actualRank <= expectedRank) {
    performanceHeat = -12;
  }

  if (streakLosses >= 3 && expectationGap > 0) {
    performanceHeat += (streakLosses - 2) * 5;
  }
  if ((state.club?.morale ?? 80) < 55) {
    performanceHeat += 6;
  }
  if (!state.currentCoach && expectationGap > 0) {
    performanceHeat += 10;
  }
  if (state.boardWarning) {
    performanceHeat += 6;
  }
  if (state.boardUltimatum) {
    performanceHeat += 10;
  }

  // Soft mean-reversion from previous season pressure when stabilizing
  const baseCarryover = scenario === 'none' ? Math.round(prevPressure * 0.65) : Math.max(prevPressure, 25);
  const rawScore = scenario === 'none'
    ? baseCarryover + performanceHeat
    : Math.max(baseCarryover + Math.round(performanceHeat * 0.35), performanceHeat + Math.round(prevPressure * 0.25));

  const pressureScore = clamp(rawScore, 0, 100);
  const level = getPressureLevelFromScore(pressureScore);

  const triggerMoment =
    context.phase === 'mid' &&
    state.pressureMomentResolvedYear !== state.year &&
    (scenario === 'title_collapse' || scenario === 'relegation_spiral' || pressureScore >= 60);

  const clubName = resolveClubNameForPress(state, clubsDb, isModActive, context.clubDisplayName);
  const coachName = state.currentCoach?.name || 'Interim Staff';
  const coachStyle = state.currentCoach?.style || 'Stopgap Setup';
  const managerName = state.managerName || 'Sporting Director';
  const leagueName = leagueInfo?.name || `Tier ${tier}`;

  const coachHeat = clamp(
    pressureScore + (state.currentCoach ? (state.currentCoach.ovrBoost < 0 ? 12 : 4) : 14),
    10,
    100
  );
  const gmHeat = clamp(
    pressureScore + (expectationGap >= 4 ? 8 : 0) - (state.managerSkills?.includes('vorstandsliebling') ? 10 : 0),
    10,
    100
  );

  let headline = `${clubName} Cruising Under Quiet Skies`;
  let subheadline = `Results are tracking alongside ${leagueName} expectations (Target: Top ${expectedRank}).`;
  let coachQuote = `${coachName}'s ${coachStyle} setup has kept the dressing room calm and focused.`;
  let coachTag = 'Secure';
  let gmQuote = `${managerName}'s squad planning faces minimal media friction right now.`;
  let gmTag = 'Backed';
  let mediaOutlets: PressureMediaClipping[] = [
    {
      outlet: 'Matchday Chronicle',
      headline: `Steady ship at ${clubName}: #${actualRank} leaves little room for tabloid drama.`,
      tone: 'supportive',
    },
    {
      outlet: 'Tactical Desk',
      headline: `${coachName} and ${managerName} aligned as campaign stays on track.`,
      tone: 'supportive',
    },
  ];

  if (scenario === 'title_collapse') {
    headline = `CHAMPIONSHIP COLLAPSE: ${clubName} Slumps to #${actualRank}`;
    subheadline =
      actualRank >= 9
        ? `Built to lift the ${leagueName} trophy (Top ${expectedRank} mandate), ${clubName} sits ${expectationGap} places off pace after ${matchdaysPlayed} games.`
        : `Title-chasing expectations have unraveled. Falling ${ptsGapFromTarget} points behind target pace has ignited a full-blown media storm.`;
    coachTag = state.currentCoach ? 'Under Siege' : 'Vacant Chaos';
    coachQuote = state.currentCoach
      ? `Pundits question whether ${coachName}'s ${coachStyle} blueprint has gone stale and lost the dressing room.`
      : `With no permanent Head Coach in charge, tactical disarray has turned a title push into a freefall.`;
    gmTag = 'Firing Line';
    gmQuote = `Columnists are grilling Sporting Director ${managerName} over squad balance, wasted investment, and failing to halt the slide.`;
    mediaOutlets = [
      {
        outlet: 'National Sports Daily',
        headline: `"UNFORGIVABLE SLUMP": How did ${managerName} & ${coachName} turn ${clubName}'s title bid into #${actualRank} misery?`,
        tone: 'alarm',
      },
      {
        outlet: 'The Football Analyst',
        headline: `Too slow to react: ${clubName} sits ${ptsGapFromTarget} pts off championship pace while the board watches closely.`,
        tone: 'critical',
      },
      {
        outlet: 'Fan Radio Live',
        headline: `Supporters demand accountability — both the dugout and the Sporting Director's office are feeling the heat.`,
        tone: 'critical',
      },
    ];
  } else if (scenario === 'relegation_spiral') {
    headline = `RELEGATION SIRENS: ${clubName} Dragged Into #${actualRank} Dogfight`;
    subheadline = `Expected to finish Top ${expectedRank}, ${clubName} is fighting for survival in ${leagueName} with ${pts} pts after ${matchdaysPlayed} matches.`;
    coachTag = state.currentCoach ? 'Sack Watch' : 'Touchline Crisis';
    coachQuote = state.currentCoach
      ? `Leaky defending and late collapses leave ${coachName}'s position hanging by a thread.`
      : `An uncoached dressing room is buckling under relegation pressure week after week.`;
    gmTag = 'Under Fire';
    gmQuote = `Ultras and beat writers blame ${managerName} for thin squad depth and passive recruitment before the drop zone closed in.`;
    mediaOutlets = [
      {
        outlet: 'Local Tribune',
        headline: `PANIC STATIONS: ${clubName} trapped at #${actualRank} — "Where is the fight from ${coachName}'s side?"`,
        tone: 'alarm',
      },
      {
        outlet: 'Terrace Wire',
        headline: `Fans turn toward the directors' box: ${managerName} must explain why ${clubName} was left so vulnerable.`,
        tone: 'critical',
      },
      {
        outlet: 'League Observer',
        headline: `${leagueName} survival battle reaches boiling point as rivals pull clear.`,
        tone: 'critical',
      },
    ];
  } else if (scenario === 'expectation_gap') {
    headline = `MOUNTING SCRUTINY: ${clubName} Stranded at #${actualRank}`;
    subheadline = `Sitting ${expectationGap} places below the Top ${expectedRank} benchmark has started uncomfortable questions inside the press room.`;
    coachTag = 'Pressured';
    coachQuote = state.currentCoach
      ? `Reporters pressed ${coachName} on inconsistent performances and why the ${coachStyle} plan keeps stalling.`
      : `Without a Head Coach, every dropped point magnifies leadership doubts.`;
    gmTag = 'Questioned';
    gmQuote = `${managerName} faces growing chatter over transfer return on investment and squad hunger.`;
    mediaOutlets = [
      {
        outlet: 'Evening Kickoff',
        headline: `Stuck in neutral: ${clubName} (#${actualRank}) failing to match pre-season ambitions.`,
        tone: 'critical',
      },
      {
        outlet: 'Boardroom Watch',
        headline: `If ${coachName} and ${managerName} cannot spark a run soon, patience upstairs will run out.`,
        tone: 'critical',
      },
    ];
  }

  return {
    pressureScore,
    level,
    scenario,
    expectedRank,
    actualRank,
    expectationGap,
    ptsGapFromTarget,
    streakLosses,
    triggerMoment,
    headline,
    subheadline,
    coachScrutiny: {
      name: coachName,
      role: state.currentCoach ? `Head Coach (${coachStyle})` : 'No Permanent Coach',
      statusTag: coachTag,
      heatRating: coachHeat,
      quote: coachQuote,
    },
    gmScrutiny: {
      name: managerName,
      role: 'Sporting Director (You)',
      statusTag: gmTag,
      heatRating: gmHeat,
      quote: gmQuote,
    },
    mediaOutlets,
    evaluatedYear: state.year,
    evaluatedPhase: context.phase,
  };
}

export function computeCoachSeveranceK(coach?: { cost?: number; contractYearsLeft?: number; isReserveCoach?: boolean } | null): number {
  if (!coach || coach.isReserveCoach) return 0;
  const annualCost = typeof coach.cost === 'number' && Number.isFinite(coach.cost) ? coach.cost : 1500;
  if (annualCost <= 0) return 0;
  const yearsLeft = Math.max(1, coach.contractYearsLeft || 1);
  return Math.max(0, Math.round(annualCost * 0.5 * yearsLeft));
}

export function buildPressureMomentOptions(
  state: GameState,
  assessment: PressureAssessment
): PressureOption[] {
  const tier = state.club?.tier || 1;
  const country = state.club?.country || 'GER';
  const hasCoach = Boolean(state.currentCoach);
  const prCostK = getLeagueScaledVal(tier, 3500, country);
  const severanceCostK = hasCoach ? computeCoachSeveranceK(state.currentCoach) : 0;
  const isTitle = assessment.scenario === 'title_collapse';

  return [
    {
      id: 'back_coach',
      title: hasCoach ? `Public Vote of Confidence in ${state.currentCoach!.name}` : 'Steady the Coaching Staff',
      subtitle: hasCoach
        ? `Defend ${state.currentCoach!.name}'s methods at the press conference and demand unity on the training pitch.`
        : 'Instruct senior veterans and interim staff to simplify tactics and stop the bleeding.',
      stanceBadge: 'Dressing Room Shield',
      icon: 'fa-handshake',
      effectsSummary: '+8 Morale · +1 Tactical Focus OVR · -8 Media Heat · -2 Board Trust',
      riskLabel: 'Puts extra scrutiny on you if the slump drags on',
    },
    {
      id: 'demand_coach_change',
      title: hasCoach ? `Part Ways With ${state.currentCoach!.name} Now` : 'Launch External Coach Search',
      subtitle: hasCoach
        ? `Accept the media calls for touchline change: sack ${state.currentCoach!.name} immediately so you can appoint a turnaround specialist.`
        : 'Signal to the press that an immediate coaching appointment is imminent.',
      stanceBadge: 'Deflect Heat & Reset',
      icon: 'fa-user-slash',
      costK: severanceCostK,
      effectsSummary: hasCoach
        ? `-18 Media Heat · +5 Board Trust · Coach Departed (Pay ${severanceCostK > 0 ? 'severance' : 'clean break'}) · -8 Morale`
        : '-12 Media Heat · +3 Board Trust · Opens Urgent Search',
      riskLabel: hasCoach ? 'Removes coach OVR bonus until you hire a replacement' : 'Temporary dressing-room uncertainty',
    },
    {
      id: 'take_gm_accountability',
      title: isTitle ? 'Take Ownership & Promise Title/Top-4 Push' : 'Take Ownership & Stake Job on Survival Target',
      subtitle: `Step in front of the microphones yourself. Take the bullets off the squad and stake your Board Trust on finishing Top ${assessment.expectedRank}.`,
      stanceBadge: 'High-Stakes Leadership',
      icon: 'fa-microphone-lines',
      effectsSummary: '+12 Morale · +2 Siege Mentality OVR · -6 Board Trust now (High Bonus/Penalty at Season End)',
      riskLabel: `Failing Top ${assessment.expectedRank} costs an extra -10 Board Trust`,
    },
    {
      id: 'crisis_pr_summit',
      title: 'Emergency Supporter Town Hall & Media Offensive',
      subtitle: 'Fund an open training session, supporter forum, and coordinated media briefings to cool the firestorm.',
      stanceBadge: 'PR De-Escalation',
      icon: 'fa-bullhorn',
      costK: prCostK,
      effectsSummary: '-24 Media Heat · +7 Board Trust · +6 Morale · Fan Goodwill Boost',
      riskLabel: 'Costs club treasury funds',
    },
  ];
}

export interface PressureResolutionResult {
  updatedState: GameState;
  headline: string;
  summary: string;
  pressureDelta: number;
  moraleDelta: number;
  impactDelta: number;
  coachDismissed: boolean;
}

export function applyPressureMomentResolution(
  state: GameState,
  choiceId: PressureChoiceId,
  assessment: PressureAssessment,
  clubsDb?: Club[],
  isModActive?: boolean
): PressureResolutionResult {
  const updated: GameState = {
    ...state,
    club: { ...state.club },
    severances: [...(state.severances || [])],
  };

  const tier = updated.club.tier || 1;
  const country = updated.club.country || 'GER';
  const clubName = resolveClubNameForPress(updated, clubsDb, isModActive);
  const prevPressure = clamp(updated.mediaPressure ?? assessment.pressureScore, 0, 100);
  const prevMorale = updated.club.morale ?? 80;
  const prevImpact = updated.clubImpactScore ?? 50;

  let pressureDelta = 0;
  let moraleDelta = 0;
  let impactDelta = 0;
  let boostOvrDelta = 0;
  let coachDismissed = false;
  let headline = '';
  let summary = '';

  if (choiceId === 'back_coach') {
    pressureDelta = -8;
    moraleDelta = 8;
    impactDelta = -2;
    boostOvrDelta = 1;
    headline = updated.currentCoach
      ? `Vote of Confidence Issued for ${updated.currentCoach.name}`
      : 'Interim Staff Publicly Backed';
    summary = updated.currentCoach
      ? `You stood firm alongside ${updated.currentCoach.name}. Players rallied behind the clear backing (+8 Morale, +1 Grit OVR), though skeptics in the press remain unconvinced.`
      : `You publicly steadied the touchline setup (+8 Morale, +1 Grit OVR).`;
  } else if (choiceId === 'demand_coach_change') {
    if (updated.currentCoach) {
      const firedCoach = updated.currentCoach;
      const severanceK = computeCoachSeveranceK(firedCoach);
      if (severanceK > 0) {
        const annualSev = Math.max(100, Math.round(severanceK / Math.max(1, firedCoach.contractYearsLeft || 1)));
        updated.severances = [
          ...(updated.severances || []),
          { amount: annualSev, yearsLeft: Math.max(1, firedCoach.contractYearsLeft || 1) },
        ];
      }
      const boostToRemove = firedCoach.appliedOvrBoost ?? firedCoach.ovrBoost ?? 0;
      updated.club.baseOvr = safeAdjustOvr(updated.club.baseOvr, -boostToRemove);
      updated.club.ovr = updated.club.baseOvr;
      updated.currentCoach = undefined;
      updated.coachTenure = 0;
      updated.hasNewManagerBounce = false;
      updated.firedCoachesCount = (updated.firedCoachesCount || 0) + 1;
      coachDismissed = true;
      pressureDelta = -18;
      moraleDelta = -8;
      impactDelta = 5;
      headline = `${firedCoach.name} Dismissed Under Intense Media Heat`;
      summary = `You yielded to mounting pressure and relieved ${firedCoach.name} of duties. Press scrutiny eased (-18 Heat, +5 Board Trust), but the dressing room is shaken (-8 Morale) until you appoint a successor.`;
    } else {
      pressureDelta = -12;
      moraleDelta = 2;
      impactDelta = 3;
      headline = 'Coaching Overhaul Promised';
      summary = `With no Head Coach in place, you pledged an urgent touchline rebuild to satisfy the board and media (-12 Heat, +3 Board Trust).`;
    }
  } else if (choiceId === 'take_gm_accountability') {
    pressureDelta = -10;
    moraleDelta = 12;
    impactDelta = -6;
    boostOvrDelta = 2;
    updated.pressureCommitment = {
      year: updated.year,
      targetPos: assessment.expectedRank,
      choice: 'take_gm_accountability',
    };
    headline = `${updated.managerName} Stakes Reputation on ${clubName} Turnaround`;
    summary = `You absorbed the press firestorm yourself. The squad responded with siege-mentality grit (+12 Morale, +2 OVR Focus), while the board expects Top ${assessment.expectedRank} delivery.`;
  } else {
    const prCostK = getLeagueScaledVal(tier, 3500, country);
    const fanBoost = getLeagueScaledFans(tier, 1200, country, updated.club.originalStartLeague || tier);
    updated.budget = safeAdjustBudget(updated.budget, -prCostK);
    updated.club.fanBase = safeAdjustFans(updated.club.fanBase || 2000, fanBoost);
    pressureDelta = -24;
    moraleDelta = 6;
    impactDelta = 7;
    boostOvrDelta = 1;
    headline = `Supporter Summit & PR Offensive Calms ${clubName}`;
    summary = `Open training and direct boardroom briefings cooled the media temperature (-24 Heat, +7 Board Trust, +6 Morale).`;
  }

  updated.mediaPressure = clamp(prevPressure + pressureDelta, 0, 100);
  updated.club.morale = clamp(prevMorale + moraleDelta, 0, 100);
  const impactFloor = (updated.managerSkills || []).includes('vorstandsliebling') ? 15 : 0;
  updated.clubImpactScore = clamp(Math.max(impactFloor, prevImpact + impactDelta), impactFloor, 100);
  updated.pressureBoostOvr = clamp((updated.pressureBoostOvr || 0) + boostOvrDelta, -2, 3);
  updated.pressureMomentResolvedYear = updated.year;
  updated.pressureChoiceThisSeason = choiceId;

  const refreshed = evaluatePerformancePressure(
    updated,
    {
      phase: assessment.evaluatedPhase || 'mid',
      pos: assessment.actualRank,
      pts: assessment.actualRank <= 4 ? 32 : 20,
      matchdaysPlayed: assessment.evaluatedPhase === 'end' ? 34 : 17,
      clubDisplayName: clubName,
    },
    clubsDb,
    isModActive
  );
  refreshed.pressureScore = updated.mediaPressure;
  refreshed.level = getPressureLevelFromScore(updated.mediaPressure);
  refreshed.triggerMoment = false;
  updated.pressureContext = refreshed;

  return {
    updatedState: updated,
    headline,
    summary,
    pressureDelta: updated.mediaPressure - prevPressure,
    moraleDelta: (updated.club.morale ?? prevMorale) - prevMorale,
    impactDelta: (updated.clubImpactScore ?? prevImpact) - prevImpact,
    coachDismissed,
  };
}

export interface SeasonEndPressureInput {
  finalPos: number;
  pts: number;
  tier: number;
  nextTier: number;
  wonTrophy: boolean;
  isSacked: boolean;
  survivedPlayoff: boolean;
  completedSeasonYear: number;
  schedule?: MatchdayOutcome[];
  clubDisplayName?: string;
}

export function resolveSeasonEndPressure(
  state: GameState,
  input: SeasonEndPressureInput,
  clubsDb?: Club[],
  isModActive?: boolean
): {
  nextMediaPressure: number;
  boardTrustDelta: number;
  repDelta: number;
  verdict: PressureSeasonVerdict | null;
} {
  const country = state.club?.country || 'GER';
  const clubName = resolveClubNameForPress(state, clubsDb, isModActive, input.clubDisplayName);
  const coachName = state.currentCoach?.name || 'Coaching Staff';
  const managerName = state.managerName || 'Sporting Director';
  const isTier1Only = getMaxTier(country, clubsDb) === 1;
  const maxTier = getMaxTier(country, clubsDb);
  const isRelegated = !isTier1Only && input.nextTier > input.tier && input.tier < maxTier;
  const isPromoted = input.nextTier < input.tier;

  const endAssessment = evaluatePerformancePressure(
    state,
    {
      phase: 'end',
      pos: input.finalPos,
      pts: input.pts,
      matchdaysPlayed: 34,
      schedule: input.schedule,
      clubDisplayName: clubName,
    },
    clubsDb,
    isModActive
  );

  const midHeat = state.mediaPressure ?? 18;
  const hadMidCrisis = Boolean(
    state.pressureContext &&
      (state.pressureContext.scenario === 'title_collapse' ||
        state.pressureContext.scenario === 'relegation_spiral' ||
        midHeat >= 55)
  );
  const commitment =
    state.pressureCommitment && state.pressureCommitment.year === input.completedSeasonYear
      ? state.pressureCommitment
      : null;

  const metTarget =
    input.finalPos <= endAssessment.expectedRank || input.wonTrophy || isPromoted;

  // 1. Relegation Disaster / Sacking
  if (input.isSacked || isRelegated) {
    const nextPressure = input.isSacked ? 20 : clamp(Math.max(endAssessment.pressureScore, midHeat + 20), 65, 100);
    const pledgePenalty = commitment ? -8 : 0;
    return {
      nextMediaPressure: nextPressure,
      boardTrustDelta: -6 + pledgePenalty,
      repDelta: -2,
      verdict: {
        scenario: 'relegation_disaster',
        badge: input.isSacked ? 'BOARDROOM SACKING' : 'RELEGATION COLLAPSE',
        tone: 'crisis',
        headline: input.isSacked
          ? `PRESS VERDICT: Board Ends Tenure After ${clubName} Tailspin`
          : `PRESS VERDICT: Catastrophic Drop Seals ${clubName}'s Fate (#${input.finalPos})`,
        summary: `Months of mounting media scrutiny culminated in a devastating #${input.finalPos} finish (${input.pts} pts).`,
        coachVerdict: state.currentCoach
          ? `${coachName} could not arrest the defensive bleed or restore belief under extreme pressure.`
          : 'Touchline instability and the lack of a steady coaching hand proved fatal.',
        gmVerdict: `${managerName} faced relentless criticism over squad construction and timing of key interventions.`,
        pressureBefore: midHeat,
        pressureAfter: nextPressure,
        boardTrustBonus: -6 + pledgePenalty,
        repBonus: -2,
      },
    };
  }

  // 2. Title Chase Collapse (Built for top, fell short by a lot)
  if (
    endAssessment.scenario === 'title_collapse' &&
    !input.wonTrophy &&
    input.finalPos >= 5
  ) {
    const nextPressure = clamp(Math.max(60, Math.round(endAssessment.pressureScore * 0.85)), 55, 95);
    const pledgePenalty = commitment && !metTarget ? -10 : 0;
    const trustDelta = -6 + pledgePenalty;
    return {
      nextMediaPressure: nextPressure,
      boardTrustDelta: trustDelta,
      repDelta: -2,
      verdict: {
        scenario: 'title_collapse',
        badge: 'CHAMPIONSHIP FALLOUT',
        tone: 'warning',
        headline: `PRESS VERDICT: ${clubName} Falls Far Short of Title Mandate (#${input.finalPos})`,
        summary: `Expected to contend for Top ${endAssessment.expectedRank}, ${clubName} finished ${endAssessment.expectationGap} places behind expectations (${input.pts} pts). Carryover pressure follows into next season.`,
        coachVerdict: state.currentCoach
          ? `Questions swirl around ${coachName}'s future after failing to turn elite talent into title-winning consistency.`
          : 'The mid-season coaching upheaval failed to spark a credible chase.',
        gmVerdict: commitment
          ? `${managerName}'s public pledge fell flat — board patience is wearing thin.`
          : `${managerName} faces an unforgiving summer window to prove the project still has teeth.`,
        pressureBefore: midHeat,
        pressureAfter: nextPressure,
        boardTrustBonus: trustDelta,
        repBonus: -2,
      },
    };
  }

  // 3. Miracle Redemption / Turnaround after Mid-Season Crisis
  if (hadMidCrisis && metTarget) {
    const nextPressure = clamp(Math.round(midHeat * 0.25), 8, 25);
    const trustBonus = commitment ? 14 : 8;
    const repBonus = commitment ? 4 : 2;
    return {
      nextMediaPressure: nextPressure,
      boardTrustDelta: trustBonus,
      repDelta: repBonus,
      verdict: {
        scenario: 'comeback_redemption',
        badge: 'PRESSURE REDEMPTION',
        tone: 'triumph',
        headline: `SILENCED THE CRITICS: ${clubName} Storms Back to #${input.finalPos}!`,
        summary: `After enduring intense mid-season heat (${midHeat}/100), ${clubName} answered every question on the pitch (${input.pts} pts). Media heat evaporated.`,
        coachVerdict: state.currentCoach
          ? `${coachName} emerged from the storm with huge dressing-room authority.`
          : 'The bold mid-season shakeup paid off dramatically.',
        gmVerdict: commitment
          ? `${managerName} backed words with silverware/results (+${trustBonus} Board Trust, +${repBonus} Rep).`
          : `${managerName}'s cool nerve under fire earned fresh backing in the boardroom (+${trustBonus} Board Trust).`,
        pressureBefore: midHeat,
        pressureAfter: nextPressure,
        boardTrustBonus: trustBonus,
        repBonus,
      },
    };
  }

  // 4. Relegation Survival Escape (Finished #14-#16 and survived)
  if ((hadMidCrisis || input.survivedPlayoff) && input.finalPos >= 14 && !isRelegated) {
    const nextPressure = clamp(Math.round(midHeat * 0.45), 15, 42);
    const trustBonus = input.survivedPlayoff ? 6 : 3;
    return {
      nextMediaPressure: nextPressure,
      boardTrustDelta: trustBonus,
      repDelta: 1,
      verdict: {
        scenario: 'relegation_survival',
        badge: input.survivedPlayoff ? 'PLAY-OFF SURVIVOR' : 'SURVIVAL ESCAPE',
        tone: 'relief',
        headline: `${clubName} Claws Out of the Fire to Stay Up (#${input.finalPos})`,
        summary: `Despite brutal relegation pressure, ${clubName} held its nerve when it mattered most (${input.pts} pts).`,
        coachVerdict: state.currentCoach
          ? `${coachName} squeezed enough grit out of the squad to drag them across the safety line.`
          : 'Surviving without stability on the touchline will force tough summer talks.',
        gmVerdict: `${managerName} bought crucial breathing room, though supporters expect a more ambitious rebuild next term.`,
        pressureBefore: midHeat,
        pressureAfter: nextPressure,
        boardTrustBonus: trustBonus,
        repBonus: 1,
      },
    };
  }

  // 5. Sustained Scrutiny (Failed mid-season pledge or high pressure without catastrophic collapse)
  if (midHeat >= 50 && !metTarget) {
    const nextPressure = clamp(Math.round(endAssessment.pressureScore * 0.7), 25, 75);
    const pledgePenalty = commitment ? -10 : -3;
    return {
      nextMediaPressure: nextPressure,
      boardTrustDelta: pledgePenalty,
      repDelta: -1,
      verdict: {
        scenario: 'sustained_heat',
        badge: 'UNRESOLVED SCRUTINY',
        tone: 'warning',
        headline: `Uncomfortable Questions Linger Over ${clubName} After #${input.finalPos} Finish`,
        summary: `${clubName} avoided disaster but never shook the weight of missed expectations (${input.pts} pts vs Top ${endAssessment.expectedRank} target).`,
        coachVerdict: state.currentCoach
          ? `${coachName}'s tactical authority faces a pivotal pre-season evaluation.`
          : 'Appointing a proven Head Coach is now priority number one.',
        gmVerdict: commitment
          ? `${managerName} fell short of a public promise — Board Trust dropped sharply (${pledgePenalty}).`
          : `${managerName} enters next year with zero margin for a slow start.`,
        pressureBefore: midHeat,
        pressureAfter: nextPressure,
        boardTrustBonus: pledgePenalty,
        repBonus: -1,
      },
    };
  }

  // Quiet cool-down when season went smoothly
  const cooledPressure = clamp(
    metTarget ? Math.round(midHeat * 0.35) : Math.round((midHeat + endAssessment.pressureScore) * 0.5),
    0,
    100
  );

  return {
    nextMediaPressure: cooledPressure,
    boardTrustDelta: 0,
    repDelta: 0,
    verdict: null,
  };
}
