import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ALL_CLUBS } from '../data/clubsData';
import {
  buildDeterministicDivisionTable,
  syncScheduleRunningPositions,
} from './standingsEngine';
import {
  auditBowlSeatOccupancy,
  computeStadiumArchitecture,
} from './liveSimVisualEngine';
import { Club, MatchdayOutcome, PendingSeasonState } from '../types';

test('Tier 1 syncScheduleRunningPositions matches buildDeterministicDivisionTable rank across all 34 matchdays', () => {
  const gerTier1 = ALL_CLUBS.filter((c) => (c.country || 'GER') === 'GER' && c.tier === 1).slice(0, 18);
  assert.equal(gerTier1.length, 18, 'Expected 18 German Tier 1 clubs');

  const userClub: Club = { ...gerTier1[2] };
  const peers: Club[] = gerTier1.filter((c) => c.id !== userClub.id);

  for (const year of [2026, 2027, 2028, 2029, 2030]) {
    let pts = 0;
    let gf = 0;
    let ga = 0;
    let w = 0;
    let d = 0;
    let l = 0;
    const rawSchedule: MatchdayOutcome[] = Array.from({ length: 34 }, (_, idx) => {
      const md = idx + 1;
      const opp = peers[idx % peers.length];
      const outcome: 'W' | 'D' | 'L' = md % 5 === 0 ? 'L' : md % 3 === 0 ? 'D' : 'W';
      const userGoals = outcome === 'W' ? 2 : outcome === 'D' ? 1 : 0;
      const oppGoals = outcome === 'W' ? 1 : outcome === 'D' ? 1 : 2;
      if (outcome === 'W') {
        w++;
        pts += 3;
      } else if (outcome === 'D') {
        d++;
        pts += 1;
      } else {
        l++;
      }
      gf += userGoals;
      ga += oppGoals;
      return {
        matchday: md,
        opponentId: opp.id,
        opponentName: opp.name,
        opponentColor: opp.color,
        opponentOvr: opp.baseOvr,
        isHome: md % 2 === 1,
        userGoals,
        oppGoals,
        result: outcome,
        ptsEarned: outcome === 'W' ? 3 : outcome === 'D' ? 1 : 0,
        runningPts: pts,
        runningPoints: pts,
        runningPos: 1,
        runningPosition: 1,
        runningW: w,
        runningWins: w,
        runningD: d,
        runningDraws: d,
        runningL: l,
        runningLosses: l,
        runningGd: gf - ga,
        runningGoalDiff: gf - ga,
        runningGf: gf,
        runningGa: ga,
      };
    });

    const pendingSeasonState = {
      year,
      tier: 1,
      country: 'GER',
      totalMatchdays: 34,
      pos: 2,
      approxPos: 2,
      pts,
      gf,
      ga,
      gd: gf - ga,
      w,
      d,
      l,
      matchdaySchedule: rawSchedule,
      schedule: rawSchedule,
    } as unknown as PendingSeasonState;

    const synced = syncScheduleRunningPositions({
      year,
      country: 'GER',
      tier: 1,
      userClub,
      peers,
      pendingSeasonState,
    });

    const syncedState = {
      ...pendingSeasonState,
      matchdaySchedule: synced.schedule,
      schedule: synced.schedule,
    } as PendingSeasonState;

    for (const md of [1, 5, 10, 17, 25, 34]) {
      const table = buildDeterministicDivisionTable({
        year,
        country: 'GER',
        tier: 1,
        playedMatchdays: md,
        userClub,
        peers,
        pendingSeasonState: syncedState,
      });
      const userRow = table.find((r) => r.isUser);
      assert.ok(userRow, `Season ${year} MD ${md}: user row must exist`);
      assert.equal(
        synced.schedule[md - 1].runningPos,
        userRow.pos,
        `Season ${year} MD ${md}: live ticker runningPos (${synced.schedule[md - 1].runningPos}) must match League Table pos (${userRow.pos})`
      );
    }
  }
});

test('Main Stand spectator grid density upgrade increases sideline capacity while preserving realistic occupancy bands', () => {
  const medium = computeStadiumArchitecture(41575);
  const colossus = computeStadiumArchitecture(120000);

  assert.ok(medium.sideCols >= 56, `Expected medium stadium sideCols >= 56, got ${medium.sideCols}`);
  assert.ok(medium.sideRows >= 11, `Expected medium stadium sideRows >= 11, got ${medium.sideRows}`);
  assert.ok(colossus.sideCols >= 76, `Expected colossus stadium sideCols >= 76, got ${colossus.sideCols}`);
  assert.ok(colossus.sideRows >= 18, `Expected colossus stadium sideRows >= 18, got ${colossus.sideRows}`);

  const stadiumSrc = fs.readFileSync('src/components/StadiumBowl3D.tsx', 'utf-8');
  assert.ok(stadiumSrc.includes('Math.min(uCount, 58)'), 'Main Stand horizontal spectator cap should be 58');
  assert.ok(
    stadiumSrc.includes('isGoalEnd ? Math.min(vCount, 32) : Math.min(vCount, 12)'),
    'Main Stand depth spectator cap should be 12'
  );
  assert.ok(
    stadiumSrc.includes('const aisleHalfWidth = isGoalEnd ? 0.048 : 0.03;'),
    'Main Stand sideline aisle cutout should be tightened to 0.03'
  );

  // Verify fill hierarchy & bands remain faithful at 74.8% attendance (31,087 / 41,575)
  const occ75 = auditBowlSeatOccupancy(31087, 41575, 'balanced');
  const occ100 = auditBowlSeatOccupancy(41575, 41575, 'balanced');
  assert.ok(occ75.overallFill >= 0.67 && occ75.overallFill <= 0.80);
  assert.ok(occ75.sidelineCenterFill > occ75.sidelineWingFill);
  assert.ok(occ100.overallFill >= 0.99);
});

test('WorldCupLiveMatchArena and critical modals enforce one-shot completion, OVR guards, Escape locks, and confetti cleanup', () => {
  const wcArenaSrc = fs.readFileSync('src/components/WorldCupLiveMatchArena.tsx', 'utf-8');
  assert.ok(wcArenaSrc.includes('const completedRef = useRef<boolean>(false);'));
  assert.ok(wcArenaSrc.includes('const completeTimeoutRef = useRef<number | null>(null);'));
  assert.ok(wcArenaSrc.includes('const safeUserOvr = Math.max(1, effectiveUserOvr || 70);'));
  assert.ok(wcArenaSrc.includes('const safeOppOvr = Math.max(1, opponent.ovr || 70);'));
  // Ensure side effects are no longer buried inside setMinute((prevMin) => ...)
  assert.ok(!wcArenaSrc.includes('setMinute((prevMin) => {'));

  const wcModalSrc = fs.readFileSync('src/components/InternationalTournamentModal.tsx', 'utf-8');
  assert.ok(wcModalSrc.includes("finalPhase !== 'halftime'"));

  const ipoSrc = fs.readFileSync('src/components/IPOModal.tsx', 'utf-8');
  assert.ok(ipoSrc.includes('blockEscapeDuringPitch'));

  const mktSrc = fs.readFileSync('src/components/MarketingModal.tsx', 'utf-8');
  assert.ok(mktSrc.includes('blockEscapeDuringRoll'));

  for (const modalPath of [
    'src/components/DecisionDayModal.tsx',
    'src/components/CupRunModal.tsx',
    'src/components/CareerSummary.tsx',
  ]) {
    const src = fs.readFileSync(modalPath, 'utf-8');
    assert.ok(src.includes('confetti.reset()'), `${modalPath} must reset confetti on cleanup`);
  }
});
