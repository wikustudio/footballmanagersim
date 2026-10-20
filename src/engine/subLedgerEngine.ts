import { GameState } from '../types';
import { calculateClubFinancials } from '../data/gameConstants';

export interface AcademyRoiReport {
  rollingSpend3YrK: number;
  totalGraduates3Yr: number;
  effectiveCostPerGraduateK: number;
  marketBenchmarkCostK: number;
  savingsVsMarketK: number;
  roiMultiplier: number;
  fixedBaseUpkeepK: number;
  variableScoutingK: number;
  scoutingDialPct: number;
}

/**
 * Calculates developmental Academy ROI and cost-per-asset metrics over a rolling 3-year cycle.
 */
export function calculateAcademySubLedger(state: GameState): AcademyRoiReport {
  const fin = calculateClubFinancials({ ...state, isManaged: true });
  const totalAcademyOp = (fin as any).academyOp || 150;
  const scoutingDialPct = Math.max(0, Math.min(50, state.academyScoutingDial ?? 0)); // 0 to 50%
  const fixedBaseUpkeepK = scoutingDialPct > 0
    ? Math.round(totalAcademyOp / (1 + scoutingDialPct / 100))
    : totalAcademyOp;
  const variableScoutingK = Math.max(0, totalAcademyOp - fixedBaseUpkeepK);

  const history = state.academySpendHistory || [];
  const currentYear = state.year || 2026;

  // Filter to 3-year rolling window
  const windowRecords = history.filter(h => h.year >= currentYear - 3);

  // If no history exists yet, seed with current year's baseline
  let rollingSpend3YrK = windowRecords.reduce((sum, r) => sum + r.spendK, 0);
  let totalGraduates3Yr = windowRecords.reduce((sum, r) => sum + r.graduatesCount, 0);

  if (rollingSpend3YrK <= 0) {
    rollingSpend3YrK = totalAcademyOp * 3;
    totalGraduates3Yr = Math.max(1, (state.youthPipeline || []).length);
  } else if (windowRecords.length < 3) {
    // In Seasons 1 & 2, scale the recorded spend to a 3-year equivalent weight so ROI is not distorted
    const avgAnnualSpendK = rollingSpend3YrK / windowRecords.length;
    rollingSpend3YrK = Math.round(avgAnnualSpendK * 3);
  }

  // Cost per asset produced
  const effectiveCostPerGraduateK = Math.round(rollingSpend3YrK / Math.max(1, totalGraduates3Yr));

  // Benchmark: Buying equivalent 70-76 OVR talent on open transfer market
  const tier = state.club.tier || 1;
  const marketBenchmarkCostK = tier === 1 ? 2800 : tier === 2 ? 1400 : 700;

  const savingsVsMarketK = Math.max(0, marketBenchmarkCostK - effectiveCostPerGraduateK);
  const roiMultiplier = Number((marketBenchmarkCostK / Math.max(1, effectiveCostPerGraduateK)).toFixed(1));

  return {
    rollingSpend3YrK,
    totalGraduates3Yr,
    effectiveCostPerGraduateK,
    marketBenchmarkCostK,
    savingsVsMarketK,
    roiMultiplier,
    fixedBaseUpkeepK,
    variableScoutingK,
    scoutingDialPct
  };
}

/**
 * Records annual academy spend and graduate intake at season conclusion.
 */
export function recordSeasonAcademySpend(
  state: GameState,
  graduatesThisSeason: number
): { year: number; spendK: number; graduatesCount: number }[] {
  const fin = calculateClubFinancials({ ...state, isManaged: true });
  const totalSeasonSpendK = (fin as any).academyOp || 150;
  const targetYear = state.year || 2026;

  const existing = state.academySpendHistory || [];
  const prevRecordForYear = existing.find((r) => r.year === targetYear);
  const accumulatedGraduates = (prevRecordForYear?.graduatesCount || 0) + Math.max(0, graduatesThisSeason);

  const newRecord = {
    year: targetYear,
    spendK: totalSeasonSpendK,
    graduatesCount: accumulatedGraduates
  };

  // Keep last 5 seasons
  return [newRecord, ...existing.filter((r) => r.year !== targetYear)].slice(0, 5);
}

