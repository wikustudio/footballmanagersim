import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeMd33StandingsContext,
  evaluateDecisionDayTrigger,
  getDecisionDayStakesSummary,
  isDirectHeadToHeadMatch,
  isPostSeasonPlayoffMode,
  resolveDecisionDayOutcome,
  shouldPauseInlineSimBeforeMd34,
} from './decisionDayEngine';
import {
  buildDeterministicDivisionTable,
  resolveDivisionClubs,
} from './standingsEngine';
import { resolveClubStadiumStyle } from './liveSimVisualEngine';
import {
  TIER1_CLUB_STADIUM_STYLES,
  resolveCuratedTier1StadiumStyle,
} from './tier1StadiumDesigns';
import { ALL_CLUBS } from '../data/clubsData';
import { TEAMS } from '../mod-data/teams';

test('Decision Day trigger handles title, playoffs, safe 15th, and cross-tier 16th cleanly', () => {
  const titleClose = evaluateDecisionDayTrigger({
    approxPos: 1,
    pointsDeducted: 0,
    md33TitleGap: 2,
    md33RelGap: 40,
    titleDramaRoll: 0.1,
    titleDramaChance: 1.0,
    hasPromotionPlayoffs: false,
    isReserveBlockedFromPlayoff: false,
    maxPlayoffPos: 3,
    seasonLeague: 1,
    isBottomTier: false,
    isTier1Only: false,
  });
  assert.equal(titleClose.shouldTrigger, true);
  assert.equal(titleClose.ddType, 'title');
  assert.equal(titleClose.isCrossTierPlayoff, false);
  assert.equal(titleClose.isPostSeasonPlayoff, false);

  const safe15thBigGap = evaluateDecisionDayTrigger({
    approxPos: 15,
    pointsDeducted: 0,
    md33TitleGap: 35,
    md33RelGap: 5,
    titleDramaRoll: 0.5,
    titleDramaChance: 1.0,
    hasPromotionPlayoffs: false,
    isReserveBlockedFromPlayoff: false,
    maxPlayoffPos: 3,
    seasonLeague: 1,
    isBottomTier: false,
    isTier1Only: false,
  });
  assert.equal(safe15thBigGap.shouldTrigger, false);

  const tight15thDuel = evaluateDecisionDayTrigger({
    approxPos: 15,
    pointsDeducted: 0,
    md33TitleGap: 35,
    md33RelGap: 2,
    titleDramaRoll: 0.5,
    titleDramaChance: 1.0,
    hasPromotionPlayoffs: false,
    isReserveBlockedFromPlayoff: false,
    maxPlayoffPos: 3,
    seasonLeague: 1,
    isBottomTier: false,
    isTier1Only: false,
  });
  assert.equal(tight15thDuel.shouldTrigger, true);
  assert.equal(tight15thDuel.ddType, 'relegation');
  assert.equal(tight15thDuel.isCrossTierPlayoff, false);
  assert.equal(tight15thDuel.isPostSeasonPlayoff, false);
  assert.equal(tight15thDuel.opponentTier, 1);

  const crossTier16thPlayoff = evaluateDecisionDayTrigger({
    approxPos: 16,
    pointsDeducted: 0,
    md33TitleGap: 40,
    md33RelGap: 6,
    titleDramaRoll: 0.5,
    titleDramaChance: 1.0,
    hasPromotionPlayoffs: false,
    isReserveBlockedFromPlayoff: false,
    maxPlayoffPos: 3,
    seasonLeague: 1,
    isBottomTier: false,
    isTier1Only: false,
  });
  assert.equal(crossTier16thPlayoff.shouldTrigger, true);
  assert.equal(crossTier16thPlayoff.ddType, 'relegation');
  assert.equal(crossTier16thPlayoff.isCrossTierPlayoff, true);
  assert.equal(crossTier16thPlayoff.isPostSeasonPlayoff, true);
  assert.equal(crossTier16thPlayoff.opponentTier, 2);

  const promoPlayoff3rd = evaluateDecisionDayTrigger({
    approxPos: 3,
    pointsDeducted: 0,
    md33TitleGap: 12,
    md33RelGap: 30,
    titleDramaRoll: 0.5,
    titleDramaChance: 1.0,
    hasPromotionPlayoffs: true,
    isReserveBlockedFromPlayoff: false,
    maxPlayoffPos: 3,
    seasonLeague: 2,
    isBottomTier: false,
    isTier1Only: false,
  });
  assert.equal(promoPlayoff3rd.shouldTrigger, true);
  assert.equal(promoPlayoff3rd.ddType, 'promotion_playoff');
  assert.equal(promoPlayoff3rd.isCrossTierPlayoff, true);
  assert.equal(promoPlayoff3rd.isPostSeasonPlayoff, true);
  assert.equal(promoPlayoff3rd.opponentTier, 1);
});

test('Post-season playoffs preserve regular season points and never emit fake H2H or mutate MD 34 standings', () => {
  assert.equal(isPostSeasonPlayoffMode('promotion_playoff', true), true);
  assert.equal(isPostSeasonPlayoffMode('relegation', true), true);
  assert.equal(isPostSeasonPlayoffMode('relegation', false), false);
  assert.equal(isPostSeasonPlayoffMode('title', false), false);

  const relPlayoffWin = resolveDecisionDayOutcome({
    ddType: 'relegation',
    isCrossTierPlayoff: true,
    isBottomTier: false,
    userPreGamePts: 29,
    userPreGameGd: -18,
    rivalPreGamePts: 63,
    rivalPreGameGd: 19,
    rivalName: 'Hannover 96',
    opponentName: 'Hannover 96',
    wonMatch: true,
    drawMatch: false,
    userGoals: 3,
    oppGoals: 1,
    regularSeasonPos: 16,
  });

  assert.equal(relPlayoffWin.isPostSeasonPlayoff, true);
  assert.equal(relPlayoffWin.isDirectHeadToHead, false);
  assert.equal(relPlayoffWin.userWonDuel, true);
  assert.equal(relPlayoffWin.finalUserRank, 16);
  assert.equal(relPlayoffWin.userFinalPts, 29);
  assert.equal(relPlayoffWin.userFinalGd, -18);
  assert.equal(relPlayoffWin.rivalTargetPos, undefined);

  const promoPlayoffLoss = resolveDecisionDayOutcome({
    ddType: 'promotion_playoff',
    isCrossTierPlayoff: true,
    isBottomTier: false,
    userPreGamePts: 61,
    userPreGameGd: 17,
    rivalPreGamePts: 28,
    rivalPreGameGd: -19,
    rivalName: 'FC Augsburg',
    opponentName: 'FC Augsburg',
    wonMatch: false,
    drawMatch: false,
    userGoals: 2,
    oppGoals: 3,
    isShootout: false,
    regularSeasonPos: 4,
  });

  assert.equal(promoPlayoffLoss.isPostSeasonPlayoff, true);
  assert.equal(promoPlayoffLoss.userWonDuel, false);
  assert.equal(promoPlayoffLoss.finalUserRank, 4);
  assert.equal(promoPlayoffLoss.userFinalPts, 61);
  assert.equal(promoPlayoffLoss.userFinalGd, 17);
});

test('End-to-end Decision Day outcomes align identically with buildDeterministicDivisionTable standings', () => {
  const userClub = ALL_CLUBS.find((c) => c.id === 1 && c.country === 'GER')!;
  const peers = resolveDivisionClubs({
    clubsDb: ALL_CLUBS,
    country: 'GER',
    tier: 1,
    year: 2026,
    userClub,
    excludeUserClub: true,
    isModActive: false,
  });
  const rivalClub = peers[0];

  // 1. Direct H2H Title Clash on equal points: 2-1 win gives user +1 GD advantage and rival inverse -1 GD
  assert.equal(isDirectHeadToHeadMatch('title', false, rivalClub.name, rivalClub.name), true);
  const h2hTitleWin = resolveDecisionDayOutcome({
    ddType: 'title',
    isCrossTierPlayoff: false,
    isBottomTier: false,
    userPreGamePts: 74,
    userPreGameGd: 38,
    rivalPreGamePts: 74,
    rivalPreGameGd: 38,
    rivalName: rivalClub.name,
    opponentName: rivalClub.name,
    wonMatch: true,
    drawMatch: false,
    userGoals: 2,
    oppGoals: 1,
  });
  assert.equal(h2hTitleWin.isDirectHeadToHead, true);
  assert.equal(h2hTitleWin.userFinalPts, 77);
  assert.equal(h2hTitleWin.rivalFinalPts, 74);
  assert.equal(h2hTitleWin.rivalFinalGd, 37);
  assert.equal(h2hTitleWin.userWonDuel, true);
  assert.equal(h2hTitleWin.finalUserRank, 1);
  assert.equal(h2hTitleWin.rivalTargetPos, 2);

  // 2. Tied final points, user loses on GD tiebreak -> rival #1, user #2 in table!
  const titleTieLoss = resolveDecisionDayOutcome({
    ddType: 'title',
    isCrossTierPlayoff: false,
    isBottomTier: false,
    userPreGamePts: 74,
    userPreGameGd: 30,
    rivalPreGamePts: 74,
    rivalPreGameGd: 35,
    rivalName: rivalClub.name,
    opponentName: peers[5].name,
    wonMatch: false,
    drawMatch: true,
    userGoals: 1,
    oppGoals: 1,
  });
  assert.equal(titleTieLoss.userWonDuel, false);
  assert.equal(titleTieLoss.finalUserRank, 2);
  assert.equal(titleTieLoss.rivalTargetPos, 1);
  assert.equal(titleTieLoss.userFinalPts, 75);
  assert.equal(titleTieLoss.rivalFinalPts, 75);

  const tableTitleTieLoss = buildDeterministicDivisionTable({
    year: 2026,
    country: 'GER',
    tier: 1,
    playedMatchdays: 34,
    totalMatchdays: 34,
    userClub,
    userInTier: true,
    peers,
    userOverrideFinal: {
      pos: titleTieLoss.finalUserRank,
      w: 23,
      d: 6,
      l: 5,
      gf: 70,
      ga: 40,
      pts: titleTieLoss.userFinalPts,
    },
    directRivalOverride: {
      name: rivalClub.name,
      pts: titleTieLoss.rivalFinalPts,
      gd: titleTieLoss.rivalFinalGd,
      targetPos: titleTieLoss.rivalTargetPos,
    },
  });

  assert.equal(tableTitleTieLoss[0].name, rivalClub.name);
  assert.equal(tableTitleTieLoss[0].pts, 75);
  assert.equal(tableTitleTieLoss[0].gd, '+35');
  assert.equal(tableTitleTieLoss[1].isUser, true);
  assert.equal(tableTitleTieLoss[1].pts, 75);
  assert.equal(tableTitleTieLoss[1].gd, '+30');

  // 3. Relegation survival win puts user #15 and rival #16
  const lowerRival = peers[14];
  const survivalWin = resolveDecisionDayOutcome({
    ddType: 'relegation',
    isCrossTierPlayoff: false,
    isBottomTier: false,
    userPreGamePts: 29,
    userPreGameGd: -18,
    rivalPreGamePts: 30,
    rivalPreGameGd: -17,
    rivalName: lowerRival.name,
    opponentName: peers[10].name,
    wonMatch: true,
    drawMatch: false,
    userGoals: 2,
    oppGoals: 0,
  });
  assert.equal(survivalWin.finalUserRank, 15);
  assert.equal(survivalWin.rivalTargetPos, 16);

  const tableSurvivalWin = buildDeterministicDivisionTable({
    year: 2026,
    country: 'GER',
    tier: 1,
    playedMatchdays: 34,
    totalMatchdays: 34,
    userClub,
    userInTier: true,
    peers,
    userOverrideFinal: {
      pos: survivalWin.finalUserRank,
      w: 8,
      d: 8,
      l: 18,
      gf: 34,
      ga: 50,
      pts: survivalWin.userFinalPts,
    },
    directRivalOverride: {
      name: lowerRival.name,
      pts: survivalWin.rivalFinalPts,
      gd: survivalWin.rivalFinalGd,
      targetPos: survivalWin.rivalTargetPos,
    },
  });

  const userRowSurv = tableSurvivalWin.find((r) => r.isUser)!;
  const rivalRowRel = tableSurvivalWin.find((r) => r.name === lowerRival.name)!;
  assert.equal(userRowSurv.pos, 15);
  assert.equal(userRowSurv.pts, 32);
  assert.equal(rivalRowRel.pos, 16);
  assert.equal(rivalRowRel.pts, 30);

  // Stakes summary reflects pre-game draw advantage
  const stakesLead = getDecisionDayStakesSummary({
    ddType: 'title',
    tier: 1,
    isBottomTier: false,
    isCrossTierPlayoff: false,
    userPts: 76,
    userGd: 40,
    rivalPts: 75,
    rivalGd: 38,
  });
  assert.match(stakesLead, /Win or Draw = League Champions/);
});

test('All 378 Tier 1 clubs across all 21 leagues have curated real-world stadium architecture designs', () => {
  const tier1Clubs = ALL_CLUBS.filter((c) => c.tier === 1);
  assert.equal(tier1Clubs.length, 378, `Expected 378 Tier 1 clubs, found ${tier1Clubs.length}`);
  assert.equal(Object.keys(TIER1_CLUB_STADIUM_STYLES).length, 378);

  const modTeamById = new Map<number, (typeof TEAMS)[number]>();
  for (const t of TEAMS) {
    modTeamById.set(t.id, t);
  }

  for (const club of tier1Clubs) {
    const curated = resolveCuratedTier1StadiumStyle(club);
    assert.ok(curated, `Missing curated stadium style for ${club.country}:${club.id} (${club.name})`);
    assert.equal(resolveClubStadiumStyle(club), curated);

    // Modded real-club name inherits the exact same curated Tier 1 style
    const modded = modTeamById.get(club.id);
    if (modded) {
      assert.equal(
        resolveClubStadiumStyle({ ...club, name: modded.name }),
        curated,
        `Modded club ${club.country}:${club.id} (${modded.name}) changed stadium style unexpectedly`
      );
    }
  }

  // Football-specific top-flight leagues must have zero stray running tracks
  for (const country of ['GER', 'ENG', 'ESP', 'SCO', 'USA']) {
    const clubsInCountry = tier1Clubs.filter((c) => c.country === country);
    assert.equal(clubsInCountry.length, 18);
    for (const club of clubsInCountry) {
      assert.notEqual(
        resolveClubStadiumStyle(club),
        'olympic_track',
        `Unexpected olympic_track in football-only Tier 1 ${country}: ${club.name} (${club.id})`
      );
    }
  }

  // Flagship non-track stadiums
  const byId = (id: number) => tier1Clubs.find((c) => c.id === id)!;
  assert.equal(resolveClubStadiumStyle(byId(1)), 'continental_bowl');   // Bayern Munich
  assert.equal(resolveClubStadiumStyle(byId(3)), 'english_box');        // Dortmund
  assert.equal(resolveClubStadiumStyle(byId(5)), 'continental_bowl');   // VfB Stuttgart
  assert.equal(resolveClubStadiumStyle(byId(501)), 'continental_bowl'); // Real Madrid
  assert.equal(resolveClubStadiumStyle(byId(502)), 'continental_bowl'); // Barcelona
  assert.equal(resolveClubStadiumStyle(byId(901)), 'continental_bowl'); // Juventus
  assert.equal(resolveClubStadiumStyle(byId(911)), 'english_box');      // Genoa (Ferraris)
  assert.equal(resolveClubStadiumStyle(byId(701)), 'continental_bowl'); // Man City
  assert.equal(resolveClubStadiumStyle(byId(703)), 'english_box');      // Liverpool
  assert.equal(resolveClubStadiumStyle(byId(401)), 'continental_bowl'); // PSG
  assert.equal(resolveClubStadiumStyle(byId(1901)), 'continental_bowl');// River Plate
  assert.equal(resolveClubStadiumStyle(byId(1902)), 'english_box');     // Boca Juniors

  // Authentic Tier 1 running-track stadiums
  assert.equal(resolveClubStadiumStyle(byId(904)), 'olympic_track'); // Napoli
  assert.equal(resolveClubStadiumStyle(byId(906)), 'olympic_track'); // AS Roma
  assert.equal(resolveClubStadiumStyle(byId(907)), 'olympic_track'); // Lazio
  assert.equal(resolveClubStadiumStyle(byId(404)), 'olympic_track'); // Monaco
  assert.equal(resolveClubStadiumStyle(byId(2002)), 'olympic_track');// Yokohama F. Marinos
  assert.equal(resolveClubStadiumStyle(byId(2208)), 'olympic_track');// Pumas UNAM
  assert.equal(resolveClubStadiumStyle(byId(1405)), 'olympic_track');// São Paulo
  assert.equal(resolveClubStadiumStyle(byId(1705)), 'olympic_track');// FC Zürich

  // Explicit user/club stadiumStyle remodel & live preview override must still win
  assert.equal(
    resolveClubStadiumStyle({ ...byId(1), stadiumStyle: 'english_box' }),
    'english_box'
  );
  assert.equal(
    resolveClubStadiumStyle(byId(1), 'open_terrace'),
    'open_terrace'
  );
});

test('MD 33 standings context blocks 79 vs 74 title deciders, handles position swaps, and pauses 2nd-half sim before MD 34', () => {
  // 1. 79 pts vs 74 pts at MD 33 -> 5-pt uncatchable lead: MUST NOT trigger Decision Day or pause before MD 34
  const uncatchableCtx = computeMd33StandingsContext({
    md33Table: [
      { pos: 1, name: 'Bayern Munich', pts: 79, gd: '+45', isUser: true },
      { pos: 2, name: 'Borussia Dortmund', pts: 74, gd: '+32', isUser: false },
      { pos: 3, name: 'RB Leipzig', pts: 66, gd: '+21', isUser: false },
    ],
    approxPos: 1,
    pointsDeducted: 0,
  });
  assert.equal(uncatchableCtx.md33TitleGap, 5);
  assert.equal(uncatchableCtx.md33TopRivalRow?.name, 'Borussia Dortmund');

  const uncatchableTrigger = evaluateDecisionDayTrigger({
    approxPos: 1,
    pointsDeducted: 0,
    md33TitleGap: uncatchableCtx.md33TitleGap,
    md33RelGap: uncatchableCtx.md33RelGap,
    titleDramaRoll: 0.05,
    titleDramaChance: 1.0,
    hasPromotionPlayoffs: false,
    isReserveBlockedFromPlayoff: false,
    maxPlayoffPos: 3,
    seasonLeague: 1,
    isBottomTier: false,
    isTier1Only: false,
  });
  assert.equal(uncatchableTrigger.shouldTrigger, false);
  assert.equal(shouldPauseInlineSimBeforeMd34(uncatchableTrigger), false);

  // 2. Position swap edge case: user is #1 at MD 33 (76 pts vs #2 74 pts) even when post-MD34 approxPos is 2
  const swappedCtx = computeMd33StandingsContext({
    md33Table: [
      { pos: 1, name: 'Bayern Munich', pts: 76, gd: '+40', isUser: true },
      { pos: 2, name: 'Bayer Leverkusen', pts: 74, gd: '+38', isUser: false },
    ],
    approxPos: 2,
    pointsDeducted: 0,
  });
  assert.equal(swappedCtx.md33TopRivalRow?.name, 'Bayer Leverkusen');
  assert.equal(swappedCtx.md33TitleGap, 2);

  const liveTitleTrigger = evaluateDecisionDayTrigger({
    approxPos: 2,
    pointsDeducted: 0,
    md33TitleGap: swappedCtx.md33TitleGap,
    md33RelGap: swappedCtx.md33RelGap,
    titleDramaRoll: 0.05,
    titleDramaChance: 1.0,
    hasPromotionPlayoffs: false,
    isReserveBlockedFromPlayoff: false,
    maxPlayoffPos: 3,
    seasonLeague: 1,
    isBottomTier: false,
    isTier1Only: false,
  });
  assert.equal(liveTitleTrigger.shouldTrigger, true);
  assert.equal(liveTitleTrigger.ddType, 'title');
  assert.equal(shouldPauseInlineSimBeforeMd34(liveTitleTrigger), true);

  // 3. Debt point deduction (2 pts) adjusts effectiveUserMd33Pts coherently
  const deductedCtx = computeMd33StandingsContext({
    md33Table: [
      { pos: 1, name: 'Bayern Munich', pts: 76, gd: '+40', isUser: true },
      { pos: 2, name: 'Borussia Dortmund', pts: 75, gd: '+35', isUser: false },
    ],
    approxPos: 1,
    pointsDeducted: 2,
  });
  assert.equal(deductedCtx.effectiveUserMd33Pts, 74);
  assert.equal(deductedCtx.md33TitleGap, 1);

  // 4. Post-season playoffs run AFTER all 34 matchdays (do NOT pause at MD 33)
  const postSeasonPlayoff = evaluateDecisionDayTrigger({
    approxPos: 3,
    pointsDeducted: 0,
    md33TitleGap: 14,
    md33RelGap: 30,
    titleDramaRoll: 0.5,
    titleDramaChance: 1.0,
    hasPromotionPlayoffs: true,
    isReserveBlockedFromPlayoff: false,
    maxPlayoffPos: 3,
    seasonLeague: 2,
    isBottomTier: false,
    isTier1Only: false,
  });
  assert.equal(postSeasonPlayoff.shouldTrigger, true);
  assert.equal(shouldPauseInlineSimBeforeMd34(postSeasonPlayoff), false);
});
