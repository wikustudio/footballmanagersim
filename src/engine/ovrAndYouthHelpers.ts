import { GameState } from '../types';
import { getLeagueInfo, isTacticalSynergy, TACTICS } from '../data/gameConstants';

export type OvrHistoryEntry = {
  year: number;
  delta: number;
  reason: string;
};

export interface YouthChampionshipEntryResult {
  allowed: boolean;
  reasonCode?: 'already_played' | 'not_preseason';
  messageEn?: string;
  messageDe?: string;
}

/**
 * Validates whether the National U19 Championship modal can be opened for the current season.
 * Only blocks entry if the tournament was actually kicked off/completed this year or if we are outside pre-season prep.
 */
export function evaluateYouthChampionshipEntry(
  state: Pick<GameState, 'year' | 'seasonPhase' | 'youthChampionshipPlayedYear'>
): YouthChampionshipEntryResult {
  if (state.youthChampionshipPlayedYear === state.year) {
    return {
      allowed: false,
      reasonCode: 'already_played',
      messageEn: 'Tournament already completed this season!',
      messageDe: 'Turnier wurde diese Saison bereits ausgetragen!',
    };
  }
  if ((state.seasonPhase || 'start') !== 'start') {
    return {
      allowed: false,
      reasonCode: 'not_preseason',
      messageEn: 'U19 Championship only takes place during pre-season prep!',
      messageDe: 'U19-Meisterschaft findet nur in der Saisonvorbereitung statt!',
    };
  }
  return { allowed: true };
}

/**
 * Determines whether closing the Youth Championship modal should mark the season's tournament as concluded.
 * Closing from the pre-kickoff 'intro' overview without starting a match MUST NOT lock the season.
 */
export function shouldLockYouthChampionshipOnClose(won: boolean, hasStarted: boolean): boolean {
  return Boolean(!won && hasStarted);
}

/**
 * Unified calculation for the club's U19 Academy Cohort OVR used by both
 * the Squad tab preview card and the Elite 8 U19 Championship simulation.
 */
export function calculateYouthCohortOvr(
  state: Pick<GameState, 'club' | 'youthPipeline'>
): number {
  const academyLvl = Math.max(1, Math.min(5, state.club?.academyLevel || 1));
  const facilityBonus = (academyLvl - 1) * 6;
  const pipeline = state.youthPipeline || [];
  const avgProspectBoost =
    pipeline.length > 0
      ? pipeline.reduce((sum, p) => sum + (p.boost || 1), 0) / pipeline.length
      : 1;
  const talentBonus = Math.round(avgProspectBoost * 2.5);
  return Math.max(48, Math.min(86, 52 + facilityBonus + Math.max(-4, Math.min(10, talentBonus))));
}

/**
 * Appends a non-zero OVR adjustment entry to `ovrHistory`, retaining the latest 50 entries.
 */
export function recordOvrHistoryEntry(
  history: OvrHistoryEntry[] | undefined,
  year: number,
  delta: number,
  reason: string
): OvrHistoryEntry[] {
  const base = Array.isArray(history) ? [...history] : [];
  if (!Number.isFinite(delta) || delta === 0 || !reason) {
    return base.slice(-50);
  }
  base.push({ year, delta, reason });
  return base.length > 50 ? base.slice(-50) : base;
}

/**
 * Builds the current season's itemized OVR change ledger (Youth Promotions, Transfers, Coaches, Events, etc.),
 * reconciling against (baseOvr - startOvr) so legacy or unlogged adjustments always sum cleanly.
 */
export function buildSeasonOvrBreakdown(
  state: Pick<GameState, 'year' | 'club' | 'lastOvr' | 'history' | 'ovrHistory'>
): {
  startOvr: number;
  baseOvr: number;
  diff: number;
  entries: OvrHistoryEntry[];
} {
  const baseOvr =
    typeof state.club?.baseOvr === 'number' && !Number.isNaN(state.club.baseOvr)
      ? state.club.baseOvr
      : 60;
  const prevOvrRaw =
    state.lastOvr !== undefined
      ? state.lastOvr
      : state.history && state.history.length > 0
      ? state.history[state.history.length - 1].ovr
      : baseOvr;
  const startOvr =
    typeof prevOvrRaw === 'number' && !Number.isNaN(prevOvrRaw) ? prevOvrRaw : baseOvr;
  const diff = baseOvr - startOvr;

  const currentYearEntries = (Array.isArray(state.ovrHistory) ? state.ovrHistory : []).filter(
    (entry) => entry && entry.year === state.year && Number.isFinite(entry.delta) && entry.delta !== 0
  );

  const entries = [...currentYearEntries];
  const loggedSum = entries.reduce((sum, entry) => sum + entry.delta, 0);
  const residual = diff - loggedSum;
  if (residual !== 0) {
    entries.push({
      year: state.year,
      delta: residual,
      reason: residual > 0 ? 'Other Squad Adjustments' : 'Other Squad / Attrition Adjustments',
    });
  }

  return {
    startOvr,
    baseOvr,
    diff,
    entries,
  };
}

export interface MatchdayOvrBreakdown {
  baseOvr: number;
  avgOvr: number;
  hasSynergy: boolean;
  synergyGain: number;
  hasMastermind: boolean;
  coachTraitMod: number;
  caretakerPenalty: number;
  bounceMod: number;
  tenureMod: number;
  moraleMod: number;
  pressureBoostMod: number;
  mediaPressurePenalty: number;
  leagueMetaMod: number;
  tacticBonus: number;
  isStale: boolean;
  isSurveillance: boolean;
  stalePenalty: number;
  tacticalNetMod: number;
  effectiveMatchdayOvr: number;
}

/**
 * Exact 1:1 calculation of matchday tactical simulation modifiers matching `seasonSimEngine.ts`.
 * Note: `Fortress Curva` (`stadiumPolicy === 'ultras'`) +1 OVR is already stored directly in `club.baseOvr`
 * and therefore is NOT added a second time into `tacticalNetMod`.
 */
export function computeMatchdayOvrBreakdown(
  state: Pick<
    GameState,
    | 'club'
    | 'tactic'
    | 'currentCoach'
    | 'clubIdentity'
    | 'managerSkills'
    | 'hasNewManagerBounce'
    | 'coachTenure'
    | 'staleTactic'
    | 'consecutiveTitlesWithSameTactic'
    | 'pressureBoostOvr'
    | 'mediaPressure'
    | 'pressureChoiceThisSeason'
  > & { leagueMetaTactic?: string }
): MatchdayOvrBreakdown {
  const baseOvr =
    typeof state.club?.baseOvr === 'number' && !Number.isNaN(state.club.baseOvr)
      ? state.club.baseOvr
      : 60;
  const leagueInfo = getLeagueInfo(state.club?.tier || 1, state.club?.country || 'GER');
  const avgOvr = leagueInfo?.avgOvr || 60;
  const currentTactic = state.tactic || 'Total Football';

  const hasSynergy = Boolean(
    state.currentCoach && isTacticalSynergy(state.currentCoach.style, currentTactic)
  );
  const synergyGain = hasSynergy
    ? state.clubIdentity === 'moneyball'
      ? 4
      : state.currentCoach?.weakness === 'Tactical Rigidity'
      ? 3
      : 2
    : 0;

  const isStale = Boolean(state.staleTactic && currentTactic === state.staleTactic);
  const isSurveillance = Boolean(!isStale && (state.consecutiveTitlesWithSameTactic || 0) >= 1);
  const hasFacilityImmunity =
    (state.club?.medicalLevel || 1) >= 5 && (state.club?.academyLevel || 1) >= 5;
  const stalePenalty = isStale ? (hasFacilityImmunity ? 2 : 4) : 0;

  const hasMastermind =
    (state.managerSkills || []).includes('tactical_mastermind') ||
    state.currentCoach?.strength === 'Tactical Chessboard Maestro' ||
    (state.currentCoach as any)?.archetype === 'chessboard_maestro';

  let coachTraitMod = 0;
  if (state.currentCoach?.hiddenAttributes) {
    const { tacticalFlexibility = 10, motivationalDrive = 10, discipline = 10 } =
      state.currentCoach.hiddenAttributes;
    if (tacticalFlexibility >= 16) coachTraitMod += tacticalFlexibility >= 18 ? 1.5 : 1.0;
    if (motivationalDrive >= 16 && baseOvr < avgOvr) coachTraitMod += 1.5;
    if (discipline >= 16) coachTraitMod += 0.5;
  }
  if (state.currentCoach?.weakness === 'Tactical Rigidity' && !hasSynergy) {
    coachTraitMod -= 5;
  }

  const caretakerPenalty = !state.currentCoach ? -4 : 0;
  const bounceMod = state.currentCoach && state.hasNewManagerBounce ? 2 : 0;
  const tenureMod =
    state.currentCoach &&
    (state.coachTenure || 0) >= 3 &&
    state.currentCoach?.strength !== 'Continental Legend'
      ? -1
      : 0;

  const currentMorale = state.club?.morale ?? 100;
  const moraleMod = currentMorale >= 85 ? 1.0 : currentMorale < 45 ? -1.5 : 0;

  const pressureBoostMod = state.pressureBoostOvr || 0;
  const mediaPressurePenalty =
    (state.mediaPressure || 0) >= 80 && !state.pressureChoiceThisSeason ? -1.0 : 0;

  const getLeagueAdvantage = (myTac: string, metaTac: string) => {
    const p = myTac === 'Catenaccio' || myTac === 'Defensive' ? 'Park the Bus' : myTac;
    if (p === 'Tiki-Taka' && metaTac === 'Park the Bus') return 1;
    if (p === 'Tiki-Taka' && metaTac === 'Gegenpressing') return -1;
    if (p === 'Park the Bus' && metaTac === 'Direct Counter') return 1;
    if (p === 'Park the Bus' && metaTac === 'Tiki-Taka') return -1;
    if (p === 'Direct Counter' && metaTac === 'Gegenpressing') return 1;
    if (p === 'Direct Counter' && metaTac === 'Park the Bus') return -1;
    if (p === 'Gegenpressing' && metaTac === 'Tiki-Taka') return 1;
    if (p === 'Gegenpressing' && metaTac === 'Direct Counter') return -1;
    return 0;
  };
  const leagueMetaAdv = getLeagueAdvantage(
    currentTactic,
    state.leagueMetaTactic || 'Total Football'
  );
  const leagueMetaMod = leagueMetaAdv === 1 ? 2 : leagueMetaAdv === -1 ? -2 : 0;

  const tacticInfo =
    (TACTICS as Record<string, any>)[currentTactic] ||
    (TACTICS as Record<string, any>)['Total Football'];
  let tacticBonus = 0;
  if (tacticInfo?.ovrBonusType === 'underdog' && baseOvr < avgOvr) {
    tacticBonus = 3;
  } else if (tacticInfo?.ovrBonusType === 'dominance') {
    if (baseOvr > avgOvr) tacticBonus = 2;
    else if (baseOvr < 60) tacticBonus = -1;
  } else if (tacticInfo?.ovrBonusType === 'home') {
    tacticBonus = 1.5;
  } else if (tacticInfo?.ovrBonusType === 'away') {
    tacticBonus = 1.5;
  }

  const rawTacticalNetMod =
    synergyGain +
    (hasMastermind ? 2 : 0) +
    coachTraitMod +
    caretakerPenalty +
    bounceMod +
    tenureMod +
    moraleMod +
    pressureBoostMod +
    mediaPressurePenalty +
    leagueMetaMod +
    tacticBonus -
    stalePenalty;

  const tacticalNetMod = Math.round(rawTacticalNetMod * 10) / 10;
  const effectiveMatchdayOvr = Math.min(
    100,
    Math.max(10, Math.round((baseOvr + tacticalNetMod) * 10) / 10)
  );

  return {
    baseOvr,
    avgOvr,
    hasSynergy,
    synergyGain,
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
    isStale,
    isSurveillance,
    stalePenalty,
    tacticalNetMod,
    effectiveMatchdayOvr,
  };
}
