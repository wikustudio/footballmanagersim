import { describe, it, expect } from 'vitest';
import {
  evaluatePerformancePressure,
  buildPressureMomentOptions,
  applyPressureMomentResolution,
  resolveSeasonEndPressure,
  getPressureLevelMeta,
  getMaxLossStreak,
} from './pressureEngine';
import { GameState } from '../types';

function makeMockState(overrides: Partial<GameState> = {}): GameState {
  return {
    managerName: 'Alex Mercer',
    nationality: 'GER',
    startYear: 2026,
    year: 2027,
    seasonCount: 2,
    tactic: 'Total Football',
    club: {
      id: 1,
      name: 'Bavaria München',
      tier: 1,
      baseOvr: 88,
      color: 'dc2626',
      stadium: 75000,
      country: 'GER',
      morale: 75,
      fanBase: 72000,
      academyLevel: 4,
      medicalLevel: 4,
      ...overrides.club,
    },
    currentCoach: {
      id: 'c_1',
      name: 'Lukas Brandt',
      ovrBoost: 2,
      cost: 4000,
      repReq: 50,
      style: 'Total Football',
      country: 'GER',
      contractYearsLeft: 2,
    },
    budget: 45000,
    euroStatus: 'CL',
    reputation: 78,
    mode: 'standard',
    maxOvrCap: 92,
    investmentsThisSeason: 0,
    sponsorsPitchedThisSeason: 0,
    stadiumExpandedThisSeason: 0,
    regTransfersThisSeason: 1,
    keyTransfersThisSeason: 0,
    jobMarketSearchesThisSeason: 0,
    isNewSeasonRender: false,
    initialRenderDone: true,
    clWins: 0,
    consecutiveTitles: 1,
    trophyDrought: 0,
    activePromise: false,
    boardWarning: false,
    boardExpectsSuccess: true,
    boardGracePeriod: 0,
    boardUltimatum: false,
    seasonsInDebt: 0,
    clubImpactScore: 62,
    boardTargetFinish: 1,
    youthPipeline: [],
    history: [],
    trophies: [],
    totals: { matches: 34, wins: 24, att: 50000, trophies: 1, domTrophies: 1, intTrophies: 0 },
    ...overrides,
  };
}

describe('pressureEngine', () => {
  it('triggers title_collapse with twin Coach & GM scrutiny when title favorite slumps mid-season', () => {
    const state = makeMockState();
    const assessment = evaluatePerformancePressure(
      state,
      {
        phase: 'mid',
        pos: 9,
        pts: 21,
        matchdaysPlayed: 17,
        clubDisplayName: 'Bavaria München',
      },
      undefined,
      false
    );

    expect(assessment.scenario).toBe('title_collapse');
    expect(assessment.triggerMoment).toBe(true);
    expect(assessment.pressureScore).toBeGreaterThanOrEqual(65);
    expect(['high', 'crisis']).toContain(assessment.level);
    expect(assessment.expectationGap).toBe(8);
    expect(assessment.coachScrutiny.name).toBe('Lukas Brandt');
    expect(assessment.gmScrutiny.name).toBe('Alex Mercer');
    expect(assessment.mediaOutlets.length).toBeGreaterThanOrEqual(2);
    expect(assessment.headline).toContain('CHAMPIONSHIP COLLAPSE');
  });

  it('triggers relegation_spiral when side expected safe drops into bottom 3', () => {
    const state = makeMockState({
      boardTargetFinish: 10,
      boardExpectsSuccess: false,
      consecutiveTitles: 0,
      club: {
        id: 14,
        name: 'FSV Mainz',
        tier: 1,
        baseOvr: 75,
        color: 'ef4444',
        stadium: 33000,
        country: 'GER',
        morale: 48,
      },
    });
    const assessment = evaluatePerformancePressure(state, {
      phase: 'mid',
      pos: 17,
      pts: 12,
      matchdaysPlayed: 17,
      clubDisplayName: 'FSV Mainz',
    });

    expect(assessment.scenario).toBe('relegation_spiral');
    expect(assessment.triggerMoment).toBe(true);
    expect(assessment.pressureScore).toBeGreaterThanOrEqual(55);
    expect(assessment.headline).toContain('RELEGATION SIRENS');
    expect(assessment.gmScrutiny.quote).toContain('Alex Mercer');
  });

  it('keeps pressure calm and does not trigger moment when meeting/exceeding targets', () => {
    const state = makeMockState({ mediaPressure: 18 });
    const assessment = evaluatePerformancePressure(state, {
      phase: 'mid',
      pos: 1,
      pts: 42,
      matchdaysPlayed: 17,
      clubDisplayName: 'Bavaria München',
    });

    expect(assessment.scenario).toBe('none');
    expect(assessment.triggerMoment).toBe(false);
    expect(assessment.pressureScore).toBeLessThan(30);
    expect(assessment.level).toBe('calm');
  });

  it('applies each interactive choice cleanly with bounded metrics and coach dismissal severance', () => {
    const state = makeMockState({ club: { id: 1, name: 'Bavaria München', tier: 1, baseOvr: 88, color: 'dc2626', stadium: 75000, morale: 60 } });
    const assessment = evaluatePerformancePressure(state, {
      phase: 'mid',
      pos: 8,
      pts: 22,
      matchdaysPlayed: 17,
      clubDisplayName: 'Bavaria München',
    });
    const options = buildPressureMomentOptions(state, assessment);
    expect(options).toHaveLength(4);

    // 1. Vote of confidence boosts morale + siege grit
    const backRes = applyPressureMomentResolution(state, 'back_coach', assessment);
    expect(backRes.updatedState.club.morale).toBe(68);
    expect(backRes.updatedState.pressureBoostOvr).toBe(1);
    expect(backRes.updatedState.pressureMomentResolvedYear).toBe(state.year);

    // 2. Part ways with coach deducts coach ovrBoost and queues severance
    const sackRes = applyPressureMomentResolution(state, 'demand_coach_change', assessment);
    expect(sackRes.coachDismissed).toBe(true);
    expect(sackRes.updatedState.currentCoach).toBeUndefined();
    expect(sackRes.updatedState.club.baseOvr).toBe(86);
    expect((sackRes.updatedState.severances || []).length).toBe(1);
    expect(sackRes.pressureDelta).toBeLessThan(0);

    // 3. GM accountability stakes commitment target and +2 siege OVR
    const gmRes = applyPressureMomentResolution(state, 'take_gm_accountability', assessment);
    expect(gmRes.updatedState.pressureCommitment).toEqual({
      year: state.year,
      targetPos: 1,
      choice: 'take_gm_accountability',
    });
    expect(gmRes.updatedState.pressureBoostOvr).toBe(2);

    // 4. Crisis PR summit spends budget cleanly and drops media heat strongly
    const prRes = applyPressureMomentResolution(state, 'crisis_pr_summit', assessment);
    expect(prRes.updatedState.budget).toBeLessThan(state.budget);
    expect(prRes.pressureDelta).toBe(-24);
  });

  it('resolves season-end verdicts for title collapse vs miracle turnaround', () => {
    const state = makeMockState({
      mediaPressure: 78,
      pressureCommitment: { year: 2027, targetPos: 1, choice: 'take_gm_accountability' },
      pressureContext: evaluatePerformancePressure(makeMockState(), {
        phase: 'mid',
        pos: 8,
        pts: 22,
        matchdaysPlayed: 17,
        clubDisplayName: 'Bavaria München',
      }),
    });

    // Collapse finish (#8)
    const collapseVerdict = resolveSeasonEndPressure(state, {
      finalPos: 8,
      pts: 44,
      tier: 1,
      nextTier: 1,
      wonTrophy: false,
      isSacked: false,
      survivedPlayoff: false,
      completedSeasonYear: 2027,
      clubDisplayName: 'Bavaria München',
    });
    expect(collapseVerdict.verdict?.scenario).toBe('title_collapse');
    expect(collapseVerdict.boardTrustDelta).toBeLessThan(-10);
    expect(collapseVerdict.nextMediaPressure).toBeGreaterThanOrEqual(55);

    // Redemption comeback finish (#1 Champion)
    const redemptionVerdict = resolveSeasonEndPressure(state, {
      finalPos: 1,
      pts: 78,
      tier: 1,
      nextTier: 1,
      wonTrophy: true,
      isSacked: false,
      survivedPlayoff: false,
      completedSeasonYear: 2027,
      clubDisplayName: 'Bavaria München',
    });
    expect(redemptionVerdict.verdict?.scenario).toBe('comeback_redemption');
    expect(redemptionVerdict.boardTrustDelta).toBe(14);
    expect(redemptionVerdict.nextMediaPressure).toBeLessThan(30);
  });

  it('computes loss streaks and pressure level metadata accurately', () => {
    const streak = getMaxLossStreak([
      { result: 'W' } as any,
      { result: 'L' } as any,
      { result: 'L' } as any,
      { result: 'L' } as any,
      { result: 'L' } as any,
      { result: 'D' } as any,
    ]);
    expect(streak).toBe(4);
    expect(getPressureLevelMeta(85).level).toBe('crisis');
    expect(getPressureLevelMeta(60).level).toBe('high');
    expect(getPressureLevelMeta(35).level).toBe('scrutiny');
    expect(getPressureLevelMeta(10).level).toBe('calm');
  });
});
