import { describe, it, expect } from 'vitest';
import {
  getEffectiveStadiumName,
  getClubCampusColors,
  computeSeatOccupancyProfile,
  computeStadiumArchitecture,
  buildLiveStandingsSnapshot,
  buildLiveShotEvents,
  buildTacticalOutcomeHeatmap,
  getNamingRightsOffers,
  checkSupercupEligibility,
  resolveSupercupMatch,
  getMatchPhaseForOutcome,
  computeLiveMatchChoreography,
  computeMatchTimeOfDay,
  resolveClubStadiumStyle,
  STADIUM_STYLE_OPTIONS,
  TACTICAL_SYSTEMS,
} from '../engine/liveSimVisualEngine';
import { Club, GameState } from '../types';

const mockClub: Club = {
  id: 101,
  name: '1. FC Magdeburg',
  tier: 2,
  baseOvr: 74,
  color: '#0054a6',
  stadium: 30098,
  country: 'GER',
};

const mockState: GameState = {
  managerName: 'ALFRED',
  nationality: 'GER',
  startYear: 2026,
  year: 2027,
  tactic: 'Total Football',
  club: mockClub,
  budget: 20100,
  euroStatus: null,
  reputation: 68,
  mode: 'standard',
  maxOvrCap: 85,
  investmentsThisSeason: 0,
  sponsorsPitchedThisSeason: 0,
  stadiumExpandedThisSeason: 0,
  regTransfersThisSeason: 0,
  keyTransfersThisSeason: 0,
  jobMarketSearchesThisSeason: 0,
  isNewSeasonRender: false,
  initialRenderDone: true,
  clWins: 0,
  consecutiveTitles: 0,
  trophyDrought: 0,
  activePromise: false,
  boardWarning: false,
  boardExpectsSuccess: false,
  boardGracePeriod: 0,
  boardUltimatum: false,
  seasonsInDebt: 0,
  totals: { matches: 34, wins: 20, draws: 8, losses: 6, att: 900000, trophies: 1, domTrophies: 1, intTrophies: 0 },
  history: [
    {
      year: 2026,
      clubName: '1. FC Magdeburg',
      clubId: 101,
      color: '#0054a6',
      leagueTag: 'GER 2',
      leagueCss: '',
      ovr: 74,
      tier: 2,
      wins: 21,
      draws: 7,
      losses: 6,
      pts: 70,
      pos: 1,
      gf: 68,
      ga: 35,
      att: 28000,
      util: 93,
      trophyIcons: '',
      trophiesThisYear: { bl: 1 },
    },
  ],
  trophies: ['1. Bundesliga'],
  youthPipeline: [],
};

describe('liveSimVisualEngine', () => {
  it('resolves reserve teams to secondary ground and ignores senior naming rights', () => {
    const reserveClub: Club = {
      id: 999,
      name: 'FC Bayern München II',
      tier: 3,
      baseOvr: 68,
      color: '#dc052d',
      stadium: 15000,
      country: 'GER',
      isReserve: true,
    };
    const naming = {
      partnerName: 'Apex Aviation',
      stadiumDisplayName: 'Apex Arena',
      tier: 'global' as const,
      annualPayoutK: 2000,
      signingBonusK: 1500,
      totalYears: 5,
      yearsLeft: 4,
      signedYear: 2026,
    };
    expect(getEffectiveStadiumName(reserveClub, naming)).toBe('Grünwalder Stadion');
    expect(getEffectiveStadiumName(mockClub, naming)).toBe('Apex Arena');
    expect(getEffectiveStadiumName(mockClub, null)).toBe('Magdeburg Arena');
  });

  it('derives accessible secondary/text colors from club primary hex', () => {
    const darkPalette = getClubCampusColors({ color: '#0054a6' });
    expect(darkPalette.primary).toBe('#0054a6');
    expect(darkPalette.textOnPrimary).toBe('#FFFFFF');

    const lightPalette = getClubCampusColors({ color: '#ffffff' });
    expect(lightPalette.secondary).toBe('#18191F');
    expect(lightPalette.textOnPrimary).toBe('#18191F');
  });

  it('computes center-weighted and behind-goal seat fill scaling cleanly', () => {
    const lowFill = computeSeatOccupancyProfile(4000, 30000, true);
    const midFill = computeSeatOccupancyProfile(15000, 30000, true);
    const highFill = computeSeatOccupancyProfile(29000, 30000, true);
    expect(lowFill.mainMidfieldFill).toBeGreaterThan(lowFill.mainWingFill);
    expect(lowFill.homeEndFill).toBeLessThan(midFill.homeEndFill);
    expect(midFill.homeEndFill).toBeLessThanOrEqual(highFill.homeEndFill);
    expect(lowFill.upperTierFill).toBe(0);
    expect(highFill.upperTierFill).toBeGreaterThan(0.8);
    expect(computeSeatOccupancyProfile(0, 30000, false).totalRatio).toBe(0);
  });

  it('scales stadium architecture continuously from 1,000 seats to 150,000 seats with increasing crowd density', () => {
    const s1k = computeStadiumArchitecture(1000);
    const s10k = computeStadiumArchitecture(10000);
    const s35k = computeStadiumArchitecture(35000);
    const s75k = computeStadiumArchitecture(75000);
    const s150k = computeStadiumArchitecture(150000);

    expect(s1k.clampedCapacity).toBe(1000);
    expect(s150k.clampedCapacity).toBe(150000);
    expect(s1k.capacityTier).toBe('village');
    expect(s10k.capacityTier).toBe('regional');
    expect(s35k.capacityTier).toBe('twin');
    expect(s75k.capacityTier).toBe('arena');
    expect(s150k.capacityTier).toBe('colossus');

    expect(s1k.standDepth).toBeLessThan(s10k.standDepth);
    expect(s10k.standDepth).toBeLessThan(s35k.standDepth);
    expect(s35k.standDepth).toBeLessThan(s75k.standDepth);
    expect(s75k.standDepth).toBeLessThan(s150k.standDepth);

    expect(s1k.sideCols * s1k.sideRows).toBeLessThan(s150k.sideCols * s150k.sideRows);
    expect(s1k.endCols * s1k.endRows).toBeLessThan(s150k.endCols * s150k.endRows);
  });

  it('builds live standings with exact user running points & 18 ranked clubs', () => {
    const outcome = {
      matchday: 5,
      opponentId: 202,
      opponentName: 'Rival FC',
      opponentColor: '#dc2626',
      opponentOvr: 72,
      isHome: true,
      userGoals: 3,
      oppGoals: 1,
      result: 'W' as const,
      ptsEarned: 3 as const,
      runningPts: 13,
      runningPoints: 13,
      runningWins: 4,
      runningW: 4,
      runningDraws: 1,
      runningD: 1,
      runningLosses: 0,
      runningL: 0,
      runningGf: 12,
      runningGa: 4,
      runningGd: 8,
      runningPos: 1,
      runningPosition: 1,
    };
    const rows = buildLiveStandingsSnapshot(mockState, [mockClub], 5, outcome);
    expect(rows.length).toBe(18);
    const userRow = rows.find((r) => r.isUser)!;
    expect(userRow.mp).toBe(5);
    expect(userRow.pts).toBe(13);
    expect(userRow.gd).toBe('+8');
    expect(rows[0].pos).toBe(1);
    expect(rows[17].pos).toBe(18);
  });

  it('generates football shot telemetry with valid zones and percentages', () => {
    const summary = buildLiveShotEvents([], -1, 74);
    expect(summary.totalShots).toBeGreaterThan(0);
    expect(summary.boxPct).toBeGreaterThanOrEqual(0);
    expect(summary.boxPct).toBeLessThanOrEqual(100);
    expect(summary.events.every((e) => e.x >= 40 && e.x <= 100 && e.y >= 0 && e.y <= 100)).toBe(true);
  });

  it('generates naming rights offers & checks Supercup eligibility + resolution', () => {
    const offers = getNamingRightsOffers(mockClub, 70, 30000);
    expect(offers.length).toBe(15);
    expect(offers.filter((o) => o.tier === 'regional').length).toBe(5);
    expect(offers.filter((o) => o.tier === 'national').length).toBe(5);
    expect(offers.filter((o) => o.tier === 'global').length).toBe(5);
    expect(new Set(offers.map((o) => o.id)).size).toBe(offers.length);
    expect(new Set(offers.map((o) => o.stadiumDisplayName)).size).toBe(offers.length);
    expect(offers[offers.length - 1].annualPayoutK).toBeGreaterThan(offers[0].annualPayoutK);
    expect(offers[0].repRequired).toBe(0);
    expect(offers.some((o) => o.stadiumDisplayName.includes('Stadion'))).toBe(false);

    const elig = checkSupercupEligibility(mockState, [mockClub]);
    expect(elig?.eligible).toBe(true);
    expect(elig?.cupName).toBe('DFL-Supercup');
    const scRes = resolveSupercupMatch(mockState, elig!, 'high_press');
    expect(scRes.cupName).toBe('DFL-Supercup');
    expect(typeof scRes.won).toBe('boolean');
  });

  it('builds distinct tactical outcome heatmaps that differ by tactic and fluctuate over ticks', () => {
    const gegen0 = buildTacticalOutcomeHeatmap('Gegenpressing', 78, [], -1, 0);
    const gegen2 = buildTacticalOutcomeHeatmap('Gegenpressing', 78, [], -1, 2);
    const tiki = buildTacticalOutcomeHeatmap('Tiki-Taka', 78, [], -1, 0);
    const defensive = buildTacticalOutcomeHeatmap('Defensive', 78, [], -1, 0);
    const park = buildTacticalOutcomeHeatmap('Park the Bus', 78, [], -1, 0);

    expect(gegen0.zones.length).toBe(24);
    expect(gegen0.pressIntensity).toBeGreaterThan(park.pressIntensity);
    expect(gegen0.pressIntensity).toBeGreaterThan(defensive.pressIntensity);
    expect(tiki.controlIndex).toBeGreaterThan(gegen0.controlIndex);
    expect(gegen0.attackIndex).toBeGreaterThan(park.attackIndex);
    expect(gegen0.attackIndex).toBeGreaterThan(defensive.attackIndex);
    expect(defensive.heatTint).toBe('#38BDF8');

    // Final-third intensity must be much higher for Gegenpressing than Defensive / Park the Bus
    const gegenAtt = gegen0.zones.filter((z) => z.zoneType === 'attack').reduce((s, z) => s + z.intensity, 0);
    const defAtt = defensive.zones.filter((z) => z.zoneType === 'attack').reduce((s, z) => s + z.intensity, 0);
    const parkAtt = park.zones.filter((z) => z.zoneType === 'attack').reduce((s, z) => s + z.intensity, 0);
    expect(gegenAtt).toBeGreaterThan(defAtt);
    expect(gegenAtt).toBeGreaterThan(parkAtt);

    // Defensive third compactness should exceed attacking third heat when Defensive is active
    const defBack = defensive.zones.filter((z) => z.zoneType === 'defensive').reduce((s, z) => s + z.intensity, 0);
    expect(defBack).toBeGreaterThan(defAtt);

    // Sub-ticks must fluctuate zone intensities cleanly
    const diffCount = gegen0.zones.filter((z, idx) => Math.abs(z.intensity - gegen2.zones[idx].intensity) > 0.001).length;
    expect(diffCount).toBeGreaterThan(10);
  });

  it('maps match outcome ticks to dynamic phases including shots and goal celebrations', () => {
    const goalPhase = getMatchPhaseForOutcome(
      { userGoals: 2, result: 'W' } as any,
      3,
      true
    );
    expect(goalPhase).toBe('goal');
    const shotPhase = getMatchPhaseForOutcome(
      { userGoals: 2, result: 'W' } as any,
      2,
      true
    );
    expect(shotPhase).toBe('shot');
    expect(getMatchPhaseForOutcome(undefined, 7, false)).toBe('shot');
    expect(getMatchPhaseForOutcome(undefined, 9, false)).toBe('goal');
  });

  it('assigns 70% Daytime and 30% Nighttime deterministically across matchdays', () => {
    const scheduleModes = Array.from({ length: 10 }, (_, md) => computeMatchTimeOfDay(md, 101, 202));
    const dayCount = scheduleModes.filter((m) => m === 'day').length;
    const nightCount = scheduleModes.filter((m) => m === 'night').length;
    expect(dayCount).toBe(7);
    expect(nightCount).toBe(3);
  });

  it('computes 3D live match choreography across all 5 tactics, diverse play patterns, shots, goals, and scarves', () => {
    expect(TACTICAL_SYSTEMS.length).toBe(5);
    const formations = TACTICAL_SYSTEMS.map(
      (sys) =>
        computeLiveMatchChoreography({
          tactic: sys.key,
          phase: 'buildup',
          tick: 1,
          isLive: true,
        }).formationCode
    );
    expect(new Set(formations).size).toBe(5);

    // Verify 4 distinct buildup play patterns across ticks 0..3
    const buildupPatterns = [0, 1, 2, 3].map(
      (tick) =>
        computeLiveMatchChoreography({
          tactic: 'Total Football',
          phase: 'buildup',
          tick,
          isLive: true,
        }).playPattern
    );
    expect(new Set(buildupPatterns).size).toBe(4);

    // Verify 2 distinct setpiece routines (Corner Kick Overload vs Direct Free-Kick & Wall)
    const setpiece0 = computeLiveMatchChoreography({ tactic: 'Tiki-Taka', phase: 'setpiece', tick: 0, isLive: true });
    const setpiece1 = computeLiveMatchChoreography({ tactic: 'Tiki-Taka', phase: 'setpiece', tick: 1, isLive: true });
    expect(setpiece0.playPattern).not.toBe(setpiece1.playPattern);

    const shotChoreo = computeLiveMatchChoreography({
      tactic: 'Gegenpressing',
      phase: 'shot',
      tick: 2,
      isLive: true,
    });
    expect(shotChoreo.homePlayers.length).toBe(11);
    expect(shotChoreo.awayPlayers.length).toBe(11);
    expect(shotChoreo.shotTrajectory).not.toBeNull();
    expect(shotChoreo.shotTrajectory?.isGoal).toBe(false);
    expect(shotChoreo.ball.inNet).toBe(false);

    const goalChoreo = computeLiveMatchChoreography({
      tactic: 'Tiki-Taka',
      phase: 'goal',
      tick: 3,
      isLive: true,
    });
    expect(goalChoreo.ball.inNet).toBe(true);
    expect(goalChoreo.shotTrajectory?.isGoal).toBe(true);
    expect(goalChoreo.homePlayers.filter((p) => p.celebratingWithCrowd).length).toBeGreaterThanOrEqual(4);
    expect(goalChoreo.homePlayers.filter((p) => p.pose === 'arms_up').length).toBeGreaterThanOrEqual(5);
    expect(goalChoreo.crowdCelebration.level).toBe('goal_eruption');
    expect(goalChoreo.crowdCelebration.armsUpRatio).toBeGreaterThan(shotChoreo.crowdCelebration.armsUpRatio);
    expect(goalChoreo.crowdCelebration.scarfUpRatio).toBeGreaterThan(shotChoreo.crowdCelebration.scarfUpRatio);
    expect(goalChoreo.crowdCelebration.scarfUpRatio).toBeGreaterThanOrEqual(0.5);
  });

  it('preserves high behind-the-goal crowd column density in StadiumBowl3D and architecture scaling', async () => {
    const fs = await import('fs');
    const stadiumSrc = fs.readFileSync('src/components/StadiumBowl3D.tsx', 'utf-8');
    const village = computeStadiumArchitecture(3500);
    const colossus = computeStadiumArchitecture(120000);

    expect(village.endRows).toBeGreaterThanOrEqual(28);
    expect(colossus.endRows).toBeGreaterThanOrEqual(40);
    expect(stadiumSrc).not.toContain('const effVCount = Math.min(vCount, 10);');
    expect(stadiumSrc).toContain('isGoalEnd ? Math.min(vCount, 32) : Math.min(vCount, 12)');
    expect(stadiumSrc).toContain('Math.min(uCount, 58)');
  });

  it('supports distinct stadium varieties with realistic heritage distribution, size scaling, and single stadium name label', async () => {
    const fs = await import('fs');
    const stadiumSrc = fs.readFileSync('src/components/StadiumBowl3D.tsx', 'utf-8');

    expect(STADIUM_STYLE_OPTIONS.length).toBe(4);
    expect(resolveClubStadiumStyle({ id: 501, name: 'VFC Plauen', country: 'GER', tier: 7, stadium: 5500 })).toBe(
      'olympic_track'
    );
    expect(resolveClubStadiumStyle({ id: 502, name: 'Hertha Berlin', country: 'GER', tier: 2, stadium: 74000 })).toBe(
      'olympic_track'
    );
    expect(resolveClubStadiumStyle({ id: 503, name: 'Villa Park FC', country: 'ENG', tier: 1, stadium: 42000 })).toBe(
      'english_box'
    );
    expect(
      resolveClubStadiumStyle(
        { id: 501, name: 'VFC Plauen', country: 'GER', tier: 7, stadium: 5500 },
        'english_box'
      )
    ).toBe('english_box');

    // Every variety scales monotonically across 5k -> 22k -> 55k -> 120k and keeps viewport fit safe
    for (const opt of STADIUM_STYLE_OPTIONS) {
      const caps = [5000, 22000, 55000, 120000].map((c) => computeStadiumArchitecture(c, opt.id));
      for (let i = 1; i < caps.length; i++) {
        expect(caps[i].standDepth).toBeGreaterThan(caps[i - 1].standDepth);
        expect(caps[i].outerU).toBeGreaterThan(caps[i - 1].outerU);
        expect(caps[i].tierHeight).toBeGreaterThan(caps[i - 1].tierHeight);
      }
      for (const prof of caps) {
        const halfProjectedWidth = (prof.outerU * 0.62 + prof.outerV * 0.68) * prof.zoomFactor;
        expect(halfProjectedWidth).toBeLessThanOrEqual(365);
      }
    }

    const trackArch = computeStadiumArchitecture(55000, 'olympic_track');
    const smallTrackArch = computeStadiumArchitecture(2500, 'olympic_track');
    const smallBowlArch = computeStadiumArchitecture(2500, 'continental_bowl');
    const boxArch = computeStadiumArchitecture(55000, 'english_box');
    expect(trackArch.hasRunningTrack).toBe(true);
    expect(boxArch.hasRunningTrack).toBe(false);
    expect(trackArch.standGapU).toBeGreaterThan(boxArch.standGapU * 4);
    expect(trackArch.tierHeight).toBeLessThan(boxArch.tierHeight);
    expect(smallTrackArch.hasCorners).toBe(true);
    expect(smallBowlArch.hasCorners).toBe(true);
    expect(trackArch.cornerCols).toBeGreaterThanOrEqual(36);
    expect(trackArch.cornerRows).toBeGreaterThanOrEqual(11);

    // Ensure StadiumBowl3D never renders duplicate stadiumName text and interpolates oval side fills
    expect(stadiumSrc).not.toContain('data-testid="stadium-name-stencil"');
    expect(stadiumSrc).toContain('data-testid="stadium-name-board"');
    expect(stadiumSrc).toContain('data-testid="olympic-running-track"');
    expect(stadiumSrc).toContain('fillStart: topLeftFillStart');
    expect(stadiumSrc).toContain('fillStart: bottomLeftFillStart');
  });
});
