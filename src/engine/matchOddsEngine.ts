/**
 * Unified, calibrated football match odds & scoreline engine for:
 * - Cup Runs (single-match knockout ties with 90-min + ET/penalties)
 * - Decision Day (3-way league/playoff matches with Win / Draw / Loss)
 * - Cup Quarter-Final qualification probabilities
 *
 * Design principles:
 * 1. Smooth Elo/logistic probability curve (no abrupt linear cliffs).
 * 2. Displayed probabilities ALWAYS match executed simulation probabilities.
 * 3. Tactical counterplay (RPS) meaningfully rewards reading the opponent
 *    rather than being drowned out by club/coach alignment penalties.
 * 4. Realistic football scoreline distributions (tight classics common,
 *    5+ goal routs rare and driven by genuine OVR gaps).
 */

export type MatchOutcome = 'win' | 'draw' | 'loss';

export interface ThreeWayOdds {
  win: number;  // 0..1
  draw: number; // 0..1
  loss: number; // 0..1
  winPct: number;
  drawPct: number;
  lossPct: number;
}

export interface CupTieOdds {
  advanceProb: number; // 0..1 total probability of advancing (90m + pens)
  win90Prob: number;   // 0..1 win in regulation/ET without shootout
  penDrawProb: number; // 0..1 probability tie goes to penalties
  penWinProb: number;  // 0..1 probability of winning shootout if tied
  advancePct: number;
}

export interface MatchdayReadinessInput {
  morale?: number;
  hasCoach: boolean;
  hasNewManagerBounce?: boolean;
  isUnderdog?: boolean;
  hiddenAttributes?: {
    tacticalFlexibility?: number;
    motivationalDrive?: number;
    discipline?: number;
  };
}

export interface MatchdayReadinessResult {
  totalOvrMod: number;
  breakdown: Array<{ label: string; delta: number }>;
}

/**
 * Computes squad & coaching matchday readiness OVR modifier for Cup Runs and Decision Day,
 * unifying big-match performance with league-season management (morale, coach hidden traits,
 * new manager bounce, and interim caretaker penalty).
 * Clamped to [-5.0, +4.5] OVR so prep matters meaningfully without eclipsing squad OVR or RPS counterplay.
 */
export const computeMatchdayReadinessModifier = (
  input: MatchdayReadinessInput
): MatchdayReadinessResult => {
  const breakdown: Array<{ label: string; delta: number }> = [];
  let total = 0;

  // 1. Squad Morale (neutral at 70; smooth [-2.5, +1.5] OVR)
  if (typeof input.morale === 'number' && Number.isFinite(input.morale)) {
    const rawMoraleMod = (input.morale - 70) * 0.05;
    const moraleMod = Number(Math.max(-2.5, Math.min(1.5, rawMoraleMod)).toFixed(1));
    if (Math.abs(moraleMod) >= 0.3) {
      total += moraleMod;
      breakdown.push({
        label: moraleMod > 0 ? 'High Morale' : 'Low Morale',
        delta: moraleMod,
      });
    }
  }

  // 2. Head Coach Presence vs Interim Caretaker
  if (!input.hasCoach) {
    total -= 3.5;
    breakdown.push({ label: 'Interim Caretaker', delta: -3.5 });
  } else {
    if (input.hasNewManagerBounce) {
      total += 1.5;
      breakdown.push({ label: 'New Manager Bounce', delta: 1.5 });
    }

    const attrs = input.hiddenAttributes;
    if (attrs) {
      if ((attrs.motivationalDrive ?? 0) >= 15) {
        const grit = input.isUnderdog ? 1.2 : 0.8;
        total += grit;
        breakdown.push({
          label: input.isUnderdog ? 'Underdog Grit' : 'Motivational Drive',
          delta: grit,
        });
      }
      if ((attrs.tacticalFlexibility ?? 0) >= 15) {
        total += 0.7;
        breakdown.push({ label: 'Tactical Flexibility', delta: 0.7 });
      }
      if ((attrs.discipline ?? 0) >= 15) {
        total += 0.6;
        breakdown.push({ label: 'Defensive Discipline', delta: 0.6 });
      }
    }
  }

  const clamped = Number(Math.max(-5.0, Math.min(4.5, total)).toFixed(1));
  return { totalOvrMod: clamped, breakdown };
};

/**
 * Smooth logistic win-share curve (no-draw baseline).
 * K = 9.0 closely tracks real football Elo / SPI match odds:
 *   diff =  0  -> 50.0%
 *   diff = +5  -> 63.5%
 *   diff = +10 -> 75.2%
 *   diff = +15 -> 84.1%
 *   diff = +20 -> 90.2%
 */
export const computeLogisticWinShare = (
  ovrDiff: number,
  flatBonusPct: number = 0
): number => {
  const safeDiff = Number.isFinite(ovrDiff) ? ovrDiff : 0;
  const logistic = 1 / (1 + Math.exp(-safeDiff / 9.0));
  return Math.max(0.06, Math.min(0.94, logistic + flatBonusPct / 100));
};

export const normalizeTacticKey = (style?: string): string => {
  if (!style) return 'Total Football';
  const s = style.trim().toLowerCase();
  if (s === 'catenaccio' || s === 'park the bus' || s === 'defensive') return 'Park the Bus';
  if (s === 'tiki-taka' || s === 'possession') return 'Tiki-Taka';
  if (s === 'gegenpressing' || s === 'gegenpress' || s === 'pressing') return 'Gegenpressing';
  if (s === 'direct counter' || s === 'counter' || s === 'counter-attack' || s === 'wing play') return 'Direct Counter';
  if (s === 'total football' || s === 'attacking' || s === 'balanced') return 'Total Football';
  return style;
};

/**
 * Rock-paper-scissors tactical matchup matrix:
 * Tiki-Taka > Park the Bus > Direct Counter > Gegenpressing > Tiki-Taka
 * Total Football is neutral (0) against all.
 */
export const getTacticalAdvantage = (myTac: string, oppTac: string): -1 | 0 | 1 => {
  const p = normalizeTacticKey(myTac);
  const o = normalizeTacticKey(oppTac);
  if (p === 'Tiki-Taka' && o === 'Park the Bus') return 1;
  if (p === 'Tiki-Taka' && o === 'Gegenpressing') return -1;
  if (p === 'Park the Bus' && o === 'Direct Counter') return 1;
  if (p === 'Park the Bus' && o === 'Tiki-Taka') return -1;
  if (p === 'Direct Counter' && o === 'Gegenpressing') return 1;
  if (p === 'Direct Counter' && o === 'Park the Bus') return -1;
  if (p === 'Gegenpressing' && o === 'Tiki-Taka') return 1;
  if (p === 'Gegenpressing' && o === 'Direct Counter') return -1;
  return 0;
};

/**
 * Balanced philosophy alignment OVR offset for a single reference (club OR coach).
 * Tuned so:
 * - Matching both club + coach (+2 + +2 + +0.5 synergy = +4.5 OVR) is a real edge
 *   without breaking parity or making giants out of mid-table clubs.
 * - Switching to counter an opponent's tactic (+6.0 RPS) ALWAYS beats blindly
 *   staying in a countered identity (+4.5 - 6.0 = -1.5 OVR).
 */
export const getSingleAlignmentOvr = (chosenStyle: string, refStyle?: string): number => {
  if (!refStyle) return 0;
  const c = normalizeTacticKey(chosenStyle);
  const r = normalizeTacticKey(refStyle);
  if (c === r) return 2.0;

  const isOppositePair =
    (c === 'Gegenpressing' && r === 'Park the Bus') ||
    (c === 'Park the Bus' && r === 'Gegenpressing') ||
    (c === 'Tiki-Taka' && r === 'Direct Counter') ||
    (c === 'Direct Counter' && r === 'Tiki-Taka');
  if (isOppositePair) return -2.25;

  const isSevereClash =
    (c === 'Tiki-Taka' && r === 'Park the Bus') ||
    (c === 'Park the Bus' && r === 'Tiki-Taka') ||
    (c === 'Total Football' && r === 'Park the Bus') ||
    (c === 'Park the Bus' && r === 'Total Football');
  if (isSevereClash) return -1.75;

  if (c === 'Total Football' || r === 'Total Football') return -0.5;
  return -1.0;
};

export const getTacticalStyleOffset = (
  choice: string,
  clubTactic?: string,
  coachStyle?: string
): number => {
  const normalizedChoice = normalizeTacticKey(choice);
  const clubAlign = getSingleAlignmentOvr(normalizedChoice, clubTactic);
  const coachAlign = getSingleAlignmentOvr(normalizedChoice, coachStyle);
  const synergyBonus =
    clubAlign > 0 && coachAlign > 0
      ? 0.5
      : clubAlign <= -1.75 && coachAlign <= -1.75
      ? -0.5
      : 0;
  return clubAlign + coachAlign + synergyBonus;
};

/**
 * Honest 3-way football probabilities (Win / Draw / Loss) for Decision Day.
 * Draw rate peaks at 27% in evenly matched games and tapers smoothly to ~13% in mismatches.
 */
export const computeThreeWayOdds = (
  ovrDiff: number,
  flatBonusPct: number = 0,
  drawBias: number = 0
): ThreeWayOdds => {
  const winShare = computeLogisticWinShare(ovrDiff, flatBonusPct);
  const baseDraw = 0.27 - Math.abs(winShare - 0.5) * 0.32 + drawBias;
  const draw = Math.max(0.12, Math.min(0.36, baseDraw));
  const win = winShare * (1 - draw);
  const loss = Math.max(0, 1 - win - draw);

  const winPct = Math.round(win * 100);
  const drawPct = Math.round(draw * 100);
  const lossPct = Math.max(0, 100 - winPct - drawPct);

  return { win, draw, loss, winPct, drawPct, lossPct };
};

/**
 * Honest knockout tie probabilities for Cup Runs.
 * Every cup tie resolves either in regulation/ET or via Penalty Shootout.
 * `advanceProb` = exact total probability of advancing (`win90Prob + penDrawProb * penWinProb`).
 */
export const computeCupTieOdds = (
  ovrDiff: number,
  options?: { isParkTheBus?: boolean; flatBonusPct?: number }
): CupTieOdds => {
  const winShare = computeLogisticWinShare(ovrDiff, options?.flatBonusPct || 0);
  // Real knockout ties go to penalties ~22% in even matches, tapering to ~9% in mismatches.
  // Park the Bus intentionally slows the game down to drag favorites toward a shootout (~34% even).
  const basePenDraw = options?.isParkTheBus
    ? 0.34 - Math.abs(winShare - 0.5) * 0.24
    : 0.22 - Math.abs(winShare - 0.5) * 0.28;
  const penDrawProb = Math.max(0.08, Math.min(0.38, basePenDraw));

  // Shootouts remain tense (43%..57%) with only a subtle composure edge from OVR difference
  const penWinProb = Math.max(0.43, Math.min(0.57, 0.50 + ovrDiff * 0.005));

  const win90Prob = winShare * (1 - penDrawProb);
  const advanceProb = Math.max(0.06, Math.min(0.94, win90Prob + penDrawProb * penWinProb));

  return {
    advanceProb,
    win90Prob,
    penDrawProb,
    penWinProb,
    advancePct: Math.round(advanceProb * 100),
  };
};

/**
 * Scaled Set-Piece Focus ("Underdog Strategy") odds.
 * Compresses the OVR gap heavily so severe underdogs gain a realistic giant-killing
 * lifeline (~17-24% instead of ~8-12%) without granting a free 33% cheat code vs a +30 OVR giant.
 */
export const computeSetPieceCupProb = (ovrDiff: number): number => {
  const compressed = 0.28 + ovrDiff * 0.0045;
  return Math.max(0.16, Math.min(0.42, compressed));
};

export const computeSetPieceThreeWayOdds = (ovrDiff: number): ThreeWayOdds => {
  // Set-piece focus creates tighter, scrappier matches with slightly more draws
  const compressedDiff = ovrDiff * 0.35 - 3.5;
  return computeThreeWayOdds(compressedDiff, 0, 0.04);
};

/**
 * Cup Quarter-Final qualification probabilities (smooth logistic curves replacing abrupt linear formulas).
 */
export const computeCupQfQualificationProb = (
  cupId: 'cl' | 'el' | 'ecl' | 'dfb' | 'reg' | 'efl',
  effectiveOvr: number,
  options?: { isSpecialist?: boolean; isTier4RegionalWildcard?: boolean }
): number => {
  if (cupId === 'dfb' && options?.isTier4RegionalWildcard) {
    return options?.isSpecialist ? 0.10 : 0.06;
  }

  const curves: Record<
    'cl' | 'el' | 'ecl' | 'dfb' | 'reg' | 'efl',
    { midpoint: number; scale: number; min: number; max: number }
  > = {
    cl: { midpoint: 86.5, scale: 5.5, min: 0.12, max: 0.88 },
    el: { midpoint: 79.5, scale: 6.0, min: 0.15, max: 0.88 },
    ecl: { midpoint: 74.0, scale: 6.5, min: 0.18, max: 0.90 },
    dfb: { midpoint: 79.5, scale: 7.5, min: 0.08, max: 0.86 },
    reg: { midpoint: 55.0, scale: 9.0, min: 0.28, max: 0.88 },
    efl: { midpoint: 79.5, scale: 7.5, min: 0.10, max: 0.84 },
  };

  const c = curves[cupId];
  let prob = 1 / (1 + Math.exp(-(effectiveOvr - c.midpoint) / c.scale));
  if (options?.isSpecialist) {
    prob += 0.15;
  }
  return Math.max(c.min, Math.min(c.max, prob));
};

/**
 * Generates realistic football scorelines conditioned on outcome and OVR margin.
 * Close matches produce 1-0, 2-1, 2-0, 1-1, 0-0 the vast majority of the time;
 * heavy 4-0 / 5-1 blowouts are rare in close ties (~2-3%) and rise naturally in mismatches.
 */
export const generateRealisticMatchScoreline = (
  outcome: MatchOutcome,
  ovrDiff: number,
  rng: () => number = Math.random
): { me: number; opp: number; category: 'gritty' | 'balanced' | 'high_scoring' | 'thriller' | 'blowout' | 'draw' } => {
  const r = rng();
  const pick = <T,>(arr: T[]): T => arr[Math.min(arr.length - 1, Math.floor(rng() * arr.length))];

  if (outcome === 'draw') {
    // Realistic football draw distribution: 1-1 (42%), 0-0 (25%), 2-2 (24%), 3-3 (8%), 4-4 (1%)
    if (r < 0.25) return { me: 0, opp: 0, category: 'draw' };
    if (r < 0.67) return { me: 1, opp: 1, category: 'draw' };
    if (r < 0.91) return { me: 2, opp: 2, category: 'draw' };
    if (r < 0.99) return { me: 3, opp: 3, category: 'draw' };
    return { me: 4, opp: 4, category: 'draw' };
  }

  // Winner's OVR edge (positive when the winning side was stronger)
  const winnerAdvantage = outcome === 'win' ? ovrDiff : -ovrDiff;
  const isDominant = winnerAdvantage >= 12;
  const isClearFavorite = winnerAdvantage >= 6;

  // Thresholds shift smoothly with strength gap:
  // Tight game:    34% gritty, 44% balanced, 15% high-scoring, 4.5% thriller, 2.5% blowout
  // Clear fav:     26% gritty, 44% balanced, 18% high-scoring, 5% thriller,   7% blowout
  // Dominant gap:  16% gritty, 38% balanced, 22% high-scoring, 6% thriller,  18% blowout
  const grittyCut = isDominant ? 0.16 : isClearFavorite ? 0.26 : 0.34;
  const balancedCut = grittyCut + (isDominant ? 0.38 : 0.44);
  const highScoringCut = balancedCut + (isDominant ? 0.22 : isClearFavorite ? 0.18 : 0.15);
  const thrillerCut = highScoringCut + (isDominant ? 0.06 : 0.05);

  let winGoals: number;
  let loseGoals: number;
  let category: 'gritty' | 'balanced' | 'high_scoring' | 'thriller' | 'blowout';

  if (r < grittyCut) {
    [winGoals, loseGoals] = pick([[1, 0], [1, 0], [1, 0], [2, 0], [2, 0]]);
    category = 'gritty';
  } else if (r < balancedCut) {
    [winGoals, loseGoals] = pick([[2, 1], [2, 1], [2, 1], [2, 0], [3, 1], [3, 0]]);
    category = 'balanced';
  } else if (r < highScoringCut) {
    [winGoals, loseGoals] = pick([[3, 2], [3, 2], [3, 1], [4, 2], [4, 1]]);
    category = 'high_scoring';
  } else if (r < thrillerCut) {
    [winGoals, loseGoals] = pick([[4, 3], [4, 3], [5, 2], [5, 3], [5, 4]]);
    category = 'thriller';
  } else {
    const blowoutPool = isDominant
      ? [[4, 0], [4, 0], [4, 1], [5, 0], [5, 1], [6, 0], [6, 1], [6, 2], [7, 1]]
      : [[4, 0], [4, 0], [4, 1], [5, 0], [5, 1]];
    [winGoals, loseGoals] = pick(blowoutPool);
    category = 'blowout';
  }

  return outcome === 'win'
    ? { me: winGoals, opp: loseGoals, category }
    : { me: loseGoals, opp: winGoals, category };
};
