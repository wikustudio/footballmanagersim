import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLogisticWinShare,
  getTacticalAdvantage,
  getTacticalStyleOffset,
  computeThreeWayOdds,
  computeCupTieOdds,
  computeSetPieceCupProb,
  computeSetPieceThreeWayOdds,
  computeCupQfQualificationProb,
  generateRealisticMatchScoreline,
} from './matchOddsEngine';
import {
  NATIONAL_TEAMS,
  getHostNation,
  getNationalCoachCandidates,
  calculateDirectorSynergy,
  computeWorldCupExpectedGoals,
  simulateInternationalFirstHalf,
  simulateInternationalMatch,
  simulateGroupStage,
} from './internationalEngine';

test('Logistic win share follows smooth Elo-like curve without abrupt linear cliffs', () => {
  const even = computeLogisticWinShare(0);
  const plus5 = computeLogisticWinShare(5);
  const plus10 = computeLogisticWinShare(10);
  const plus15 = computeLogisticWinShare(15);
  const minus15 = computeLogisticWinShare(-15);

  assert.ok(Math.abs(even - 0.5) < 0.001, `expected 0.5 at parity, got ${even}`);
  assert.ok(plus5 > 0.60 && plus5 < 0.67, `expected ~0.635 at +5 OVR, got ${plus5}`);
  assert.ok(plus10 > 0.72 && plus10 < 0.78, `expected ~0.752 at +10 OVR, got ${plus10}`);
  assert.ok(plus15 > 0.81 && plus15 < 0.87, `expected ~0.841 at +15 OVR, got ${plus15}`);
  assert.ok(Math.abs(plus15 + minus15 - 1.0) < 0.001, 'curve must be symmetric');
});

test('Tactical counterplay (RPS) outperforms blindly sticking to a countered club+coach identity', () => {
  // Club + Coach both play Tiki-Taka, opponent plays Gegenpressing (which counters Tiki-Taka).
  // Countering Gegenpressing requires Direct Counter.
  const stayStyleOffset = getTacticalStyleOffset('Tiki-Taka', 'Tiki-Taka', 'Tiki-Taka');
  const stayRps = getTacticalAdvantage('Tiki-Taka', 'Gegenpressing') * 6.0;
  const stayTotalOvr = stayStyleOffset + stayRps;

  const counterStyleOffset = getTacticalStyleOffset('Direct Counter', 'Tiki-Taka', 'Tiki-Taka');
  const counterRps = getTacticalAdvantage('Direct Counter', 'Gegenpressing') * 6.0;
  const counterTotalOvr = counterStyleOffset + counterRps;

  assert.ok(
    counterTotalOvr > stayTotalOvr,
    `Switching to counter opponent (${counterTotalOvr}) must beat staying in a countered identity (${stayTotalOvr})`
  );

  // Neutral opponent (Total Football): matching club+coach identity should be rewarded over switching away
  const neutralStay = getTacticalStyleOffset('Tiki-Taka', 'Tiki-Taka', 'Tiki-Taka');
  const neutralSwitch = getTacticalStyleOffset('Direct Counter', 'Tiki-Taka', 'Tiki-Taka');
  assert.ok(neutralStay > neutralSwitch + 6, 'Matching club+coach must remain valuable against neutral opponent');
});

test('Decision Day 3-way odds sum to 100%, peak draws at parity, and taper draws in mismatches', () => {
  const parity = computeThreeWayOdds(0);
  const fav = computeThreeWayOdds(12);
  const hugeFav = computeThreeWayOdds(24);
  const dog = computeThreeWayOdds(-12);

  for (const o of [parity, fav, hugeFav, dog]) {
    assert.ok(Math.abs(o.win + o.draw + o.loss - 1) < 1e-9);
    assert.equal(o.winPct + o.drawPct + o.lossPct, 100);
  }

  assert.ok(parity.draw >= 0.25 && parity.draw <= 0.29, `expected ~27% parity draw, got ${parity.draw}`);
  assert.ok(parity.win >= 0.35 && parity.win <= 0.38, `expected ~36.5% parity win, got ${parity.win}`);
  assert.ok(hugeFav.draw < fav.draw && fav.draw < parity.draw, 'draw chance must taper as OVR gap widens');
  assert.ok(fav.win > parity.win && hugeFav.win > fav.win);
  assert.ok(Math.abs(fav.win - dog.loss) < 0.001, '3-way odds must be symmetric');
});

test('Cup tie odds obey exact advancement math, Park the Bus boosts shootouts, and Set-Piece scales realistically', () => {
  const evenStd = computeCupTieOdds(0);
  const evenBus = computeCupTieOdds(0, { isParkTheBus: true });
  const dogStd = computeCupTieOdds(-14);
  const dogBus = computeCupTieOdds(-14, { isParkTheBus: true });

  // Exact advancement probability identity
  const expectedAdv = evenStd.win90Prob + evenStd.penDrawProb * evenStd.penWinProb;
  assert.ok(Math.abs(evenStd.advanceProb - expectedAdv) < 1e-9);

  // Even ties go to penalties ~22%, Park the Bus ~34%
  assert.ok(evenStd.penDrawProb >= 0.20 && evenStd.penDrawProb <= 0.24);
  assert.ok(evenBus.penDrawProb > evenStd.penDrawProb + 0.08);

  // Underdog dragging a stronger team toward pens improves total survival chance
  assert.ok(dogBus.advanceProb > dogStd.advanceProb, 'Park the Bus should help an underdog survive toward penalties');

  // Set-piece focus scales smoothly rather than giving a fixed 33% cheat code
  const spGiantGap = computeSetPieceCupProb(-30);
  const spModDog = computeSetPieceCupProb(-12);
  const spEven = computeSetPieceCupProb(0);
  const spFav = computeSetPieceCupProb(15);
  assert.ok(spGiantGap >= 0.16 && spGiantGap <= 0.19, `giant gap set-piece should be ~16-19%, got ${spGiantGap}`);
  assert.ok(spModDog > spGiantGap && spEven > spModDog && spFav > spEven);
  assert.ok(spFav <= 0.42);

  const ddSpDog = computeSetPieceThreeWayOdds(-20);
  const ddSpEven = computeSetPieceThreeWayOdds(0);
  assert.ok(ddSpEven.win > ddSpDog.win);
  assert.ok(ddSpDog.draw > 0.20);
});

test('Cup QF qualification probabilities are monotonic and bounded realistically', () => {
  for (const cupId of ['cl', 'el', 'ecl', 'dfb', 'reg', 'efl'] as const) {
    const low = computeCupQfQualificationProb(cupId, 60);
    const mid = computeCupQfQualificationProb(cupId, 78);
    const high = computeCupQfQualificationProb(cupId, 92);
    assert.ok(low <= mid && mid <= high, `${cupId} QF chance must be monotonic with OVR`);
    assert.ok(low >= 0.05 && high <= 0.92, `${cupId} QF chance out of realistic range: ${low}..${high}`);
  }
  const wildcard = computeCupQfQualificationProb('dfb', 55, { isTier4RegionalWildcard: true });
  assert.equal(wildcard, 0.06);
});

test('Realistic scoreline generator produces authentic football scores without excessive blowouts or 4-4 draws', () => {
  let closeBlowouts = 0;
  let closeTotalGoals = 0;
  let domBlowouts = 0;
  let highDraws = 0;
  const N = 2000;

  for (let i = 0; i < N; i++) {
    const close = generateRealisticMatchScoreline('win', 0);
    assert.ok(close.me > close.opp);
    closeTotalGoals += close.me + close.opp;
    if (close.category === 'blowout') closeBlowouts++;

    const dom = generateRealisticMatchScoreline('win', 15);
    assert.ok(dom.me > dom.opp);
    if (dom.category === 'blowout') domBlowouts++;

    const draw = generateRealisticMatchScoreline('draw', 0);
    assert.equal(draw.me, draw.opp);
    if (draw.me >= 3) highDraws++;
  }

  const avgCloseGoals = closeTotalGoals / N;
  assert.ok(avgCloseGoals >= 2.2 && avgCloseGoals <= 3.4, `avg close goals ${avgCloseGoals}`);
  assert.ok(closeBlowouts / N < 0.05, `close blowout rate should be <5%, got ${closeBlowouts / N}`);
  assert.ok(domBlowouts / N > 0.12, `dominant mismatch blowout rate should exceed 12%, got ${domBlowouts / N}`);
  assert.ok(highDraws / N < 0.13, `3-3/4-4 draws should be <13% of draws, got ${highDraws / N}`);
});

test('World Cup Poisson engine: continuous xG, non-doubled Grand Final scoring, and balanced knockouts/shootouts', () => {
  const bra = NATIONAL_TEAMS.find(t => t.code === 'BRA')!;
  const arg = NATIONAL_TEAMS.find(t => t.code === 'ARG')!;
  const jpn = NATIONAL_TEAMS.find(t => t.code === 'JPN')!;
  const bol = NATIONAL_TEAMS.find(t => t.code === 'BOL')!;
  const host = getHostNation(2026);

  // Continuous xG: +10 OVR must clearly exceed +5 OVR which exceeds 0 OVR (no ±4 step cliff)
  const xg0 = computeWorldCupExpectedGoals({ teamOvr: 85, oppOvr: 85 });
  const xg5 = computeWorldCupExpectedGoals({ teamOvr: 88, oppOvr: 83 });
  const xg10 = computeWorldCupExpectedGoals({ teamOvr: 88, oppOvr: 78 });
  assert.ok(xg10.teamXg > xg5.teamXg && xg5.teamXg > xg0.teamXg);
  assert.ok(xg10.oppXg < xg5.oppXg && xg5.oppXg < xg0.oppXg);

  // Pre-game low_block_counter boosts underdog relative xG ratio vs neutral, while passive favorite drops attack
  const dogNeutral = computeWorldCupExpectedGoals({ teamOvr: 82, oppOvr: 88 });
  const dogCounter = computeWorldCupExpectedGoals({ teamOvr: 82, oppOvr: 88, preGameDirective: 'low_block_counter' });
  assert.ok(dogCounter.teamXg / dogCounter.oppXg > dogNeutral.teamXg / dogNeutral.oppXg);

  const favNeutral = computeWorldCupExpectedGoals({ teamOvr: 88, oppOvr: 80 });
  const favCounter = computeWorldCupExpectedGoals({ teamOvr: 88, oppOvr: 80, preGameDirective: 'low_block_counter' });
  assert.ok(favCounter.teamXg < favNeutral.teamXg);

  // Neutral synergy coach
  const coach = getNationalCoachCandidates(bra)[0];
  const neutralSynergy = calculateDirectorSynergy('defensive_fortress', 'youth_scouting', coach);
  const maxSynergy = calculateDirectorSynergy(coach.preferredSquadDirection, coach.preferredInvestment, coach);

  // Direct QF/SF match vs split Grand Final (H1 + H2) should have comparable total goals (NO goal doubling!)
  const N = 400;
  let directGoals = 0;
  let splitGoals = 0;
  let equalWins = 0;
  let heavyFavWins = 0;
  let shootoutCount = 0;
  let maxAdvShootoutWins = 0;
  let maxAdvShootoutTotal = 0;

  for (let i = 0; i < N; i++) {
    const direct = simulateInternationalMatch(
      bra,
      arg,
      'Semi-Final',
      'golden_generation',
      'high_performance_camp',
      coach,
      neutralSynergy
    );
    directGoals += direct.teamGoals + direct.oppGoals;
    if (direct.won) equalWins++;
    if (direct.pens) shootoutCount++;

    const firstHalf = simulateInternationalFirstHalf(
      bra,
      arg,
      'golden_generation',
      'high_performance_camp',
      coach,
      neutralSynergy
    );
    const grandFinal = simulateInternationalMatch(
      bra,
      arg,
      'Grand Final',
      'golden_generation',
      'high_performance_camp',
      coach,
      neutralSynergy,
      undefined,
      undefined,
      undefined,
      firstHalf
    );
    splitGoals += grandFinal.teamGoals + grandFinal.oppGoals;

    const favMatch = simulateInternationalMatch(
      bra,
      bol,
      'Quarter-Final',
      'golden_generation',
      'high_performance_camp',
      coach,
      maxSynergy
    );
    if (favMatch.won) heavyFavWins++;

    // Test penalty shootout fairness even with mental_penalty_protocol + tournament_specialist
    const penCoach = getNationalCoachCandidates(bra)[1];
    const penMatch = simulateInternationalMatch(
      bra,
      arg,
      'Quarter-Final',
      'veteran_stalwarts',
      'mental_penalty_protocol',
      penCoach,
      calculateDirectorSynergy('veteran_stalwarts', 'mental_penalty_protocol', penCoach),
      'tactical_masterclass'
    );
    if (penMatch.pens) {
      maxAdvShootoutTotal++;
      if (penMatch.won) maxAdvShootoutWins++;
    }
  }

  const avgDirect = directGoals / N;
  const avgSplit = splitGoals / N;
  assert.ok(avgDirect >= 2.0 && avgDirect <= 3.3, `avg direct WC goals ${avgDirect}`);
  assert.ok(avgSplit >= 2.0 && avgSplit <= 3.4, `avg split Grand Final WC goals ${avgSplit}`);
  assert.ok(
    Math.abs(avgDirect - avgSplit) < 0.65,
    `Grand Final H1+H2 avg goals (${avgSplit.toFixed(2)}) must match single-pass knockout avg (${avgDirect.toFixed(2)})`
  );

  // Equal elite clash stays competitive (~44%..68% even with minor camp perks)
  const equalWinRate = equalWins / N;
  assert.ok(equalWinRate >= 0.42 && equalWinRate <= 0.68, `equal elite win rate ${equalWinRate}`);

  // Heavy favorite (BRA 88 + max synergy vs BOL 77) wins clearly without 100% determinism
  const heavyFavRate = heavyFavWins / N;
  assert.ok(heavyFavRate >= 0.72 && heavyFavRate <= 0.96, `heavy favorite win rate ${heavyFavRate}`);

  // Knockouts reach penalties at a realistic rate (~12%..36% for evenly matched elites)
  const penRate = shootoutCount / N;
  assert.ok(penRate >= 0.12 && penRate <= 0.36, `knockout shootout rate ${penRate}`);

  // Host-nation advantage applies cleanly in computeWorldCupExpectedGoals
  const xgNeutral = computeWorldCupExpectedGoals({ teamOvr: 84, oppOvr: 84 });
  const xgHost = computeWorldCupExpectedGoals({ teamOvr: 84, oppOvr: 84, isUserHost: true });
  assert.ok(xgHost.teamXg > xgNeutral.teamXg && xgHost.oppXg < xgNeutral.oppXg, 'Host nation must gain xG edge');

  // Even full penalty prep should NOT turn shootouts into a 90%+ auto-win; keep sample large enough to avoid binomial flakes
  let extraShootoutWins = maxAdvShootoutWins;
  let extraShootoutTotal = maxAdvShootoutTotal;
  const penCoach2 = getNationalCoachCandidates(bra)[1];
  const penSyn2 = calculateDirectorSynergy('veteran_stalwarts', 'mental_penalty_protocol', penCoach2);
  while (extraShootoutTotal < 250) {
    const m = simulateInternationalMatch(bra, arg, 'Quarter-Final', 'veteran_stalwarts', 'mental_penalty_protocol', penCoach2, penSyn2, 'tactical_masterclass');
    if (m.pens) {
      extraShootoutTotal++;
      if (m.won) extraShootoutWins++;
    }
  }
  const penWinRate = extraShootoutWins / extraShootoutTotal;
  assert.ok(penWinRate >= 0.48 && penWinRate <= 0.80, `max-prep shootout win rate should stay dramatic (48-80%), got ${penWinRate}`);

  // Group stage qualification for an 82 OVR challenger (Japan) should be competitive, not trivial or impossible
  let jpnQual = 0;
  const jpnCoach = getNationalCoachCandidates(jpn)[1];
  const jpnSynergy = calculateDirectorSynergy('defensive_fortress', 'tactical_analytics', jpnCoach);
  for (let i = 0; i < 150; i++) {
    const gs = simulateGroupStage(jpn, host, 'defensive_fortress', 'tactical_analytics', jpnCoach, jpnSynergy, 'tactical_masterclass', 'low_block_counter');
    if (gs.userQualified) jpnQual++;
  }
  const jpnQualRate = jpnQual / 150;
  assert.ok(jpnQualRate >= 0.35 && jpnQualRate <= 0.88, `Japan challenger group qual rate should be realistic, got ${jpnQualRate}`);
});
