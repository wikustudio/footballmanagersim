import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSeasonOvrBreakdown,
  calculateYouthCohortOvr,
  computeMatchdayOvrBreakdown,
  evaluateYouthChampionshipEntry,
  recordOvrHistoryEntry,
  shouldLockYouthChampionshipOnClose,
} from './ovrAndYouthHelpers';

test('U19 Championship unlocks in new season and never locks on intro preview close', () => {
  // Fresh season 2026
  const s1 = evaluateYouthChampionshipEntry({
    year: 2026,
    seasonPhase: 'start',
    youthChampionshipPlayedYear: undefined,
  });
  assert.equal(s1.allowed, true);

  // Closing intro modal without kicking off must NOT lock the season
  assert.equal(shouldLockYouthChampionshipOnClose(false, false), false);

  // Closing after clicking Kick Off MUST lock the season (loss/abort)
  assert.equal(shouldLockYouthChampionshipOnClose(false, true), true);

  // Already played in 2026 -> blocked in 2026
  const s1Played = evaluateYouthChampionshipEntry({
    year: 2026,
    seasonPhase: 'start',
    youthChampionshipPlayedYear: 2026,
  });
  assert.equal(s1Played.allowed, false);
  assert.equal(s1Played.reasonCode, 'already_played');

  // Advancing to new season 2027 -> immediately allowed again!
  const s2 = evaluateYouthChampionshipEntry({
    year: 2027,
    seasonPhase: 'start',
    youthChampionshipPlayedYear: 2026,
  });
  assert.equal(s2.allowed, true);

  // Mid-season phase blocks entry with clear reason
  const mid = evaluateYouthChampionshipEntry({
    year: 2027,
    seasonPhase: 'mid',
    youthChampionshipPlayedYear: 2026,
  });
  assert.equal(mid.allowed, false);
  assert.equal(mid.reasonCode, 'not_preseason');
});

test('calculateYouthCohortOvr responds to Academy level and youth pipeline prospects consistently', () => {
  // Empty pipeline, Level 1 academy => 52 + 0 + round(1*2.5=3) = 55
  assert.equal(
    calculateYouthCohortOvr({
      club: { academyLevel: 1 } as any,
      youthPipeline: [],
    }),
    55
  );

  // Level 5 academy with +4 prospects => 52 + 24 + 10 = 86 (clamped at 86)
  assert.equal(
    calculateYouthCohortOvr({
      club: { academyLevel: 5 } as any,
      youthPipeline: [{ boost: 4 } as any, { boost: 4 } as any],
    }),
    86
  );

  // Level 3 academy with +2 prospects => 52 + 12 + 5 = 69
  assert.equal(
    calculateYouthCohortOvr({
      club: { academyLevel: 3 } as any,
      youthPipeline: [{ boost: 2 } as any],
    }),
    69
  );
});

test('OVR history accounting tracks youth graduates, transfers, coaches, and reconciles residual', () => {
  let history = recordOvrHistoryEntry([], 2026, 2, 'Head Coach Appointment: Max Coach');
  history = recordOvrHistoryEntry(history, 2026, 3, 'Youth Graduate: Luca Meyer (FWD)');
  history = recordOvrHistoryEntry(history, 2026, 0, 'Tactical Mismatch (No OVR gain)');
  history = recordOvrHistoryEntry(history, 2026, 2, 'Star Signing');
  history = recordOvrHistoryEntry(history, 2025, -1, 'Old Season Event');

  assert.equal(history.length, 4);

  const breakdown = buildSeasonOvrBreakdown({
    year: 2026,
    lastOvr: 70,
    club: { baseOvr: 77 } as any,
    history: [],
    ovrHistory: history,
  });

  assert.equal(breakdown.startOvr, 70);
  assert.equal(breakdown.baseOvr, 77);
  assert.equal(breakdown.diff, 7);
  assert.equal(breakdown.entries.length, 3);
  assert.equal(
    breakdown.entries.reduce((sum, e) => sum + e.delta, 0),
    7
  );

  // Legacy save with unlogged youth/transfer delta still reconciles cleanly
  const legacy = buildSeasonOvrBreakdown({
    year: 2026,
    lastOvr: 70,
    club: { baseOvr: 73 } as any,
    history: [],
    ovrHistory: [],
  });
  assert.equal(legacy.diff, 3);
  assert.equal(legacy.entries.length, 1);
  assert.equal(legacy.entries[0].delta, 3);
});

test('computeMatchdayOvrBreakdown matches simulation engine (no ultras double-count, L5 cushion, pressure)', () => {
  // Fortress Curva (+1 already inside baseOvr=76) must NOT be added again to tacticalNetMod
  const ultrasState = computeMatchdayOvrBreakdown({
    club: { tier: 1, country: 'GER', baseOvr: 76, morale: 80, academyLevel: 1, medicalLevel: 1 } as any,
    tactic: 'Total Football',
    currentCoach: {
      id: 'c1',
      name: 'Trainer',
      style: 'Total Football',
      ovrBoost: 2,
      cost: 1000,
    } as any,
    clubIdentity: 'balanced',
    managerSkills: [],
    hasNewManagerBounce: false,
    coachTenure: 1,
    staleTactic: undefined,
    consecutiveTitlesWithSameTactic: 0,
    pressureBoostOvr: 0,
    mediaPressure: 20,
    pressureChoiceThisSeason: null,
    leagueMetaTactic: 'Total Football',
  });
  // synergy(+2) + Total Football home(+1.5) = +3.5; effective = 79.5 (NOT 80.5!)
  assert.equal(ultrasState.tacticalNetMod, 3.5);
  assert.equal(ultrasState.effectiveMatchdayOvr, 79.5);

  // Level 5 Academy + Level 5 Medical cushions stalePenalty from 4 to 2, plus pressure boost/penalty
  const staleProtected = computeMatchdayOvrBreakdown({
    club: { tier: 1, country: 'GER', baseOvr: 80, morale: 90, academyLevel: 5, medicalLevel: 5 } as any,
    tactic: 'Total Football',
    currentCoach: {
      id: 'c1',
      name: 'Trainer',
      style: 'Total Football',
      ovrBoost: 2,
      cost: 1000,
    } as any,
    clubIdentity: 'balanced',
    managerSkills: [],
    hasNewManagerBounce: false,
    coachTenure: 1,
    staleTactic: 'Total Football',
    consecutiveTitlesWithSameTactic: 2,
    pressureBoostOvr: 1.5,
    mediaPressure: 85,
    pressureChoiceThisSeason: null,
    leagueMetaTactic: 'Total Football',
  });
  // synergy(+2) + morale(+1) + pressureBoost(+1.5) + mediaPenalty(-1.0) + Total Football(+1.5) - stalePenalty(2) = +3
  assert.equal(staleProtected.stalePenalty, 2);
  assert.equal(staleProtected.pressureBoostMod, 1.5);
  assert.equal(staleProtected.mediaPressurePenalty, -1.0);
  assert.equal(staleProtected.tacticalNetMod, 3);
  assert.equal(staleProtected.effectiveMatchdayOvr, 83);
});
