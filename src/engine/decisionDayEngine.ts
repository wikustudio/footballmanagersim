export type DecisionDayType = 'title' | 'relegation' | 'promotion_playoff';

export interface DecisionDayTriggerInput {
  approxPos: number;
  pointsDeducted: number;
  md33TitleGap: number;
  md33RelGap: number;
  titleDramaRoll: number;
  titleDramaChance: number;
  hasPromotionPlayoffs: boolean;
  isReserveBlockedFromPlayoff: boolean;
  maxPlayoffPos: number;
  seasonLeague: number;
  isBottomTier: boolean;
  isTier1Only: boolean;
}

export interface DecisionDayTriggerResult {
  shouldTrigger: boolean;
  ddType: DecisionDayType;
  isCrossTierPlayoff: boolean;
  isPostSeasonPlayoff: boolean;
  opponentTier: number;
}

/**
 * Post-season playoffs (both promotion playoffs and cross-tier 16th-vs-3rd relegation playoffs)
 * happen AFTER the 34-matchday regular season concludes and must never overwrite MD 34 league stats.
 */
export const isPostSeasonPlayoffMode = (
  ddType: DecisionDayType,
  isCrossTierPlayoff: boolean
): boolean => ddType === 'promotion_playoff' || Boolean(isCrossTierPlayoff);

/**
 * Deterministically evaluates whether Decision Day triggers and whether it is a Matchday 34
 * league decider or a post-season 2-legged cross-tier playoff.
 *
 * Key integrity rule:
 * - 15th place is SAFE above the drop zone; it must NEVER be forced into a cross-tier relegation playoff
 *   or demoted to 16th. It only triggers a MD 34 same-tier survival duel if the MD 33 gap to 16th is <= 3 pts.
 * - 16th place in a multi-tier non-bottom division plays a post-season 2-legged cross-tier relegation playoff
 *   against the Tier+1 3rd-place challenger.
 * - 16th place in a bottom-tier or single-tier division triggers a MD 34 survival duel only if within 3 pts of 15th.
 */
export const evaluateDecisionDayTrigger = (
  input: DecisionDayTriggerInput
): DecisionDayTriggerResult => {
  const {
    approxPos,
    pointsDeducted,
    md33TitleGap,
    md33RelGap,
    titleDramaRoll,
    titleDramaChance,
    hasPromotionPlayoffs,
    isReserveBlockedFromPlayoff,
    maxPlayoffPos,
    seasonLeague,
    isBottomTier,
    isTier1Only,
  } = input;

  const triggerTitleBattle =
    approxPos <= 2 &&
    pointsDeducted < 5 &&
    md33TitleGap <= 3 &&
    titleDramaRoll < titleDramaChance;

  if (triggerTitleBattle) {
    return {
      shouldTrigger: true,
      ddType: 'title',
      isCrossTierPlayoff: false,
      isPostSeasonPlayoff: false,
      opponentTier: seasonLeague,
    };
  }

  const triggerPlayoffBattle =
    hasPromotionPlayoffs &&
    !isReserveBlockedFromPlayoff &&
    approxPos >= 3 &&
    approxPos <= maxPlayoffPos &&
    pointsDeducted < 5;

  if (triggerPlayoffBattle) {
    const isCrossTier = seasonLeague > 1;
    return {
      shouldTrigger: true,
      ddType: 'promotion_playoff',
      isCrossTierPlayoff: isCrossTier,
      isPostSeasonPlayoff: true,
      opponentTier: isCrossTier ? seasonLeague - 1 : seasonLeague,
    };
  }

  // 16th place in a multi-tier non-bottom league earns the post-season 2-legged Relegation Playoff vs Tier+1 3rd place
  if (approxPos === 16 && !isBottomTier && !isTier1Only) {
    return {
      shouldTrigger: true,
      ddType: 'relegation',
      isCrossTierPlayoff: true,
      isPostSeasonPlayoff: true,
      opponentTier: seasonLeague + 1,
    };
  }

  // Same-tier Matchday 34 survival duel (15th vs 16th within striking distance <= 3 pts before MD 34)
  const triggerSameTierSurvival =
    (approxPos === 15 && md33RelGap <= 3) ||
    (approxPos === 16 && (isBottomTier || isTier1Only) && md33RelGap <= 3);

  if (triggerSameTierSurvival) {
    return {
      shouldTrigger: true,
      ddType: 'relegation',
      isCrossTierPlayoff: false,
      isPostSeasonPlayoff: false,
      opponentTier: seasonLeague,
    };
  }

  return {
    shouldTrigger: false,
    ddType: 'title',
    isCrossTierPlayoff: false,
    isPostSeasonPlayoff: false,
    opponentTier: seasonLeague,
  };
};

export interface Md33TableRowLike {
  pos: number;
  name: string;
  pts: number;
  gd: string | number;
  gf?: number;
  ga?: number;
  isUser?: boolean;
}

export interface Md33StandingsContext<T extends Md33TableRowLike = Md33TableRowLike> {
  md33UserRow?: T;
  md33TopRivalRow?: T;
  md33RelRivalRow?: T;
  effectiveUserMd33Pts?: number;
  md33TitleGap: number;
  md33RelGap: number;
}

/**
 * Extracts exact Matchday 33 points, title rival, and survival rival from an MD 33 table snapshot.
 * Uses the user's actual MD 33 rank (not post-MD 34 approxPos) so title/survival gaps are never
 * skipped or compared against the user's own row when positions swap on Matchday 34.
 */
export const computeMd33StandingsContext = <T extends Md33TableRowLike>(params: {
  md33Table: T[];
  approxPos: number;
  pointsDeducted?: number;
}): Md33StandingsContext<T> => {
  const { md33Table, approxPos, pointsDeducted = 0 } = params;
  const md33UserRow = md33Table.find((r) => Boolean(r.isUser));
  const md33UserPos = md33UserRow?.pos ?? approxPos;

  const md33TopRivalRow = md33Table.find(
    (r) => !r.isUser && (md33UserPos === 1 ? r.pos === 2 : r.pos === 1)
  );
  const md33RelRivalRow = md33Table.find(
    (r) =>
      !r.isUser &&
      (md33UserPos === 15
        ? r.pos === 16
        : md33UserPos === 16
        ? r.pos === 15
        : approxPos === 15
        ? r.pos === 16
        : r.pos === 15)
  );

  const effectiveUserMd33Pts = md33UserRow
    ? Math.max(0, md33UserRow.pts - Math.max(0, pointsDeducted))
    : undefined;

  const md33TitleGap =
    effectiveUserMd33Pts !== undefined && md33TopRivalRow
      ? Math.abs(effectiveUserMd33Pts - md33TopRivalRow.pts)
      : 99;

  const md33RelGap =
    effectiveUserMd33Pts !== undefined && md33RelRivalRow
      ? Math.abs(effectiveUserMd33Pts - md33RelRivalRow.pts)
      : 99;

  return {
    md33UserRow,
    md33TopRivalRow,
    md33RelRivalRow,
    effectiveUserMd33Pts,
    md33TitleGap,
    md33RelGap,
  };
};

/**
 * Returns true when Decision Day IS Matchday 34 itself (title race or same-tier survival duel),
 * meaning the 2nd-half live ticker & standings table must pause at Matchday 33 (index 32)
 * instead of pre-populating Matchday 34 before the user plays Decision Day.
 */
export const shouldPauseInlineSimBeforeMd34 = (
  trigger: DecisionDayTriggerResult
): boolean => Boolean(trigger.shouldTrigger && !trigger.isPostSeasonPlayoff);

export interface DecisionDayOutcomeInput {
  ddType: DecisionDayType;
  isCrossTierPlayoff: boolean;
  isBottomTier: boolean;
  userPreGamePts: number;
  userPreGameGd: number;
  rivalPreGamePts: number;
  rivalPreGameGd: number;
  rivalName: string;
  opponentName: string;
  wonMatch: boolean;
  drawMatch: boolean;
  userGoals: number;
  oppGoals: number;
  isShootout?: boolean;
  regularSeasonPos?: number;
}

export interface DecisionDayOutcome {
  isPostSeasonPlayoff: boolean;
  isDirectHeadToHead: boolean;
  userFinalPts: number;
  userFinalGd: number;
  rivalFinalPts: number;
  rivalFinalGd: number;
  userWonDuel: boolean;
  finalUserRank: number;
  rivalTargetPos?: number;
  matchGoalDiff: number;
}

const normalizeClubKey = (name?: string | null): string =>
  String(name || '').toLowerCase().trim();

export const isDirectHeadToHeadMatch = (
  ddType: DecisionDayType,
  isCrossTierPlayoff: boolean,
  rivalName: string,
  opponentName: string
): boolean => {
  if (isPostSeasonPlayoffMode(ddType, isCrossTierPlayoff)) return false;
  const r = normalizeClubKey(rivalName);
  const o = normalizeClubKey(opponentName);
  return Boolean(r && o && r === o);
};

/**
 * Single source of truth for resolving Decision Day outcomes shared between
 * DecisionDayModal (Stage 3 verdict & resolution payload) and App.tsx (final table,
 * history, trophies, promotion/relegation).
 */
export const resolveDecisionDayOutcome = (
  input: DecisionDayOutcomeInput
): DecisionDayOutcome => {
  const {
    ddType,
    isCrossTierPlayoff,
    userPreGamePts,
    userPreGameGd,
    rivalPreGamePts,
    rivalPreGameGd,
    rivalName,
    opponentName,
    wonMatch,
    drawMatch,
    userGoals,
    oppGoals,
    isShootout = false,
    regularSeasonPos,
  } = input;

  const isPostSeasonPlayoff = isPostSeasonPlayoffMode(ddType, isCrossTierPlayoff);
  const isDirectHeadToHead = isDirectHeadToHeadMatch(
    ddType,
    isCrossTierPlayoff,
    rivalName,
    opponentName
  );
  const matchGoalDiff = isShootout ? 0 : userGoals - oppGoals;

  if (isPostSeasonPlayoff) {
    const userWonDuel = Boolean(wonMatch);
    const finalUserRank =
      ddType === 'promotion_playoff'
        ? Math.max(3, regularSeasonPos || 3)
        : 16;

    return {
      isPostSeasonPlayoff: true,
      isDirectHeadToHead: false,
      userFinalPts: userPreGamePts,
      userFinalGd: userPreGameGd,
      rivalFinalPts: rivalPreGamePts,
      rivalFinalGd: rivalPreGameGd,
      userWonDuel,
      finalUserRank,
      rivalTargetPos: undefined,
      matchGoalDiff,
    };
  }

  // Matchday 34 league decider
  const userDeltaPts = wonMatch ? 3 : drawMatch ? 1 : 0;
  const userFinalPts = userPreGamePts + userDeltaPts;
  const userFinalGd = userPreGameGd + matchGoalDiff;

  let rivalDeltaPts: number;
  let rivalDeltaGd: number;
  if (isDirectHeadToHead) {
    // Playing direct rival head-to-head: their MD 34 result is the exact inverse of ours
    rivalDeltaPts = wonMatch ? 0 : drawMatch ? 1 : 3;
    rivalDeltaGd = -matchGoalDiff;
  } else {
    // Parallel match (matches DecisionDayModal simultaneous ticker: 1-2 if user wins, 1-1 on draw, 2-1 if user loses)
    rivalDeltaPts = wonMatch ? 0 : drawMatch ? 1 : 3;
    rivalDeltaGd = wonMatch ? -1 : drawMatch ? 0 : 1;
  }

  const rivalFinalPts = rivalPreGamePts + rivalDeltaPts;
  const rivalFinalGd = rivalPreGameGd + rivalDeltaGd;

  const userWonDuel =
    userFinalPts > rivalFinalPts ||
    (userFinalPts === rivalFinalPts && userFinalGd >= rivalFinalGd);

  let finalUserRank: number;
  let rivalTargetPos: number | undefined;
  if (ddType === 'title') {
    finalUserRank = userWonDuel ? 1 : 2;
    rivalTargetPos = userWonDuel ? 2 : 1;
  } else {
    // Same-tier relegation survival duel (15th safe vs 16th drop zone)
    finalUserRank = userWonDuel ? 15 : 16;
    rivalTargetPos = userWonDuel ? 16 : 15;
  }

  return {
    isPostSeasonPlayoff: false,
    isDirectHeadToHead,
    userFinalPts,
    userFinalGd,
    rivalFinalPts,
    rivalFinalGd,
    userWonDuel,
    finalUserRank,
    rivalTargetPos,
    matchGoalDiff,
  };
};

/**
 * Generates an accurate 1-line Stakes summary for Stage 1 of Decision Day,
 * taking into account whether a draw already keeps the club ahead on points/GD.
 */
export const getDecisionDayStakesSummary = (params: {
  ddType: DecisionDayType;
  tier: number;
  isBottomTier: boolean;
  isCrossTierPlayoff: boolean;
  userPts: number;
  userGd: number;
  rivalPts: number;
  rivalGd: number;
}): string => {
  const { ddType, tier, isBottomTier, isCrossTierPlayoff, userPts, userGd, rivalPts, rivalGd } = params;
  const drawWinsDuel = userPts > rivalPts || (userPts === rivalPts && userGd >= rivalGd);

  if (ddType === 'title') {
    if (tier === 1) {
      return drawWinsDuel
        ? 'Stakes: Win or Draw = League Champions • Loss = Title At Risk'
        : 'Stakes: Win = League Champions • Draw/Loss = Runner-Up';
    }
    return drawWinsDuel
      ? 'Stakes: Win or Draw = Champions Trophy & Promotion • 2nd = Direct Promotion'
      : 'Stakes: Win = Champions Trophy & Promotion • 2nd = Direct Promotion';
  }

  if (ddType === 'promotion_playoff') {
    return 'Stakes: Win on Aggregate = Promoted to Higher Division • Defeat = Remain in Tier';
  }

  if (isCrossTierPlayoff) {
    return 'Stakes: Win on Aggregate = Retain League Status • Defeat = Relegated to Lower Tier';
  }

  if (isBottomTier) {
    return drawWinsDuel
      ? 'Stakes: Win or Draw = Sporting Survival • Loss = Board Termination Risk'
      : 'Stakes: Win = Sporting Survival • Draw/Loss = Board Termination Risk';
  }

  return drawWinsDuel
    ? 'Stakes: Win or Draw = Sporting Survival • Loss = Relegated to Lower Tier'
    : 'Stakes: Win = Sporting Survival • Draw/Loss = Relegated to Lower Tier';
};
