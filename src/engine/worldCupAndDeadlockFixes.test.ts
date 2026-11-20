import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  NATIONAL_TEAMS,
  getHostNation,
  selectWorldCupKnockoutOpponent,
  simulateFifaShootout,
  simulateInternationalMatch,
  calculateDirectorSynergy,
  getNationalCoachCandidates,
} from './internationalEngine';
import {
  hasAffordableAlternativeCost,
  shouldRejectDynamicEventForCreditLimit,
} from './eventDeadlockGuard';
import type { GameEvent } from '../types';

test('selectWorldCupKnockoutOpponent supports full contender pool including ENG/GER/Host and avoids duplicates', () => {
  const userTeam = NATIONAL_TEAMS.find((t) => t.code === 'FRA')!;
  const host = getHostNation(2026); // USA
  const excluded = ['BRA', 'ESP'];

  const seenCodes = new Set<string>();
  for (let i = 0; i < 80; i++) {
    const opp = selectWorldCupKnockoutOpponent('Grand Final', userTeam, host, excluded);
    assert.notEqual(opp.code, userTeam.code);
    assert.equal(excluded.includes(opp.code), false);
    seenCodes.add(opp.code);
  }

  // Should be able to draw contenders beyond the old hardcoded 4-team list (FRA/BRA/ARG/ESP)
  assert.ok(seenCodes.has('ENG') || seenCodes.has('GER') || seenCodes.has('POR'));
});

test('selectWorldCupKnockoutOpponent handles non-standard host nations cleanly', () => {
  const userTeam = NATIONAL_TEAMS.find((t) => t.code === 'ENG')!;
  const qatarHost = getHostNation(2022); // QAT (not in NATIONAL_TEAMS array)
  const opp = selectWorldCupKnockoutOpponent('Quarter-Final', userTeam, qatarHost, []);
  assert.ok(opp && opp.code && opp.code !== userTeam.code);
});

test('simulateFifaShootout generates consistent kick-by-kick sequence matching final tally', () => {
  for (let i = 0; i < 40; i++) {
    const res = simulateFifaShootout(i % 5);
    const userGoals = res.sequence.filter((k) => k.taker === 'user' && k.scored).length;
    const oppGoals = res.sequence.filter((k) => k.taker === 'opp' && k.scored).length;

    assert.equal(userGoals, res.t1Pens);
    assert.equal(oppGoals, res.t2Pens);
    assert.equal(res.t1Wins, res.t1Pens > res.t2Pens);
    assert.ok(res.sequence.length >= 6, 'Best-of-5 early clinch needs at least 3 kicks each');
  }
});

test('simulateInternationalMatch attaches shootoutSequence when pens is true', () => {
  const team = NATIONAL_TEAMS.find((t) => t.code === 'GER')!;
  const opp = NATIONAL_TEAMS.find((t) => t.code === 'ARG')!;
  const coach = getNationalCoachCandidates(team)[0];
  const synergy = calculateDirectorSynergy('veteran_stalwarts', 'mental_penalty_protocol', coach);

  let foundShootout = false;
  for (let i = 0; i < 150; i++) {
    const match = simulateInternationalMatch(
      team,
      opp,
      'Semi-Final',
      'defensive_fortress',
      'mental_penalty_protocol',
      coach,
      synergy,
      'tactical_masterclass',
      'controlled_possession'
    );
    if (match.pens) {
      foundShootout = true;
      assert.ok(Array.isArray(match.shootoutSequence) && match.shootoutSequence.length >= 6);
      const userKicks = match.shootoutSequence!.filter((k) => k.taker === 'user' && k.scored).length;
      const oppKicks = match.shootoutSequence!.filter((k) => k.taker === 'opp' && k.scored).length;
      assert.equal(userKicks, match.teamPenGoals);
      assert.equal(oppKicks, match.oppPenGoals);
      break;
    }
  }
  assert.ok(foundShootout, 'Expected at least one penalty shootout across 150 balanced SF matches');
});

test('eventDeadlockGuard rejects unaffordable option only when an affordable alternative exists', () => {
  const canAffordNone = () => false;
  const canAffordLow = (c: number) => c <= 500;

  assert.equal(
    hasAffordableAlternativeCost({ alternativeCosts: [0], canAfford: canAffordNone }),
    true
  );
  assert.equal(
    hasAffordableAlternativeCost({ alternativeCosts: [2000], canAfford: canAffordNone }),
    false
  );
  assert.equal(
    hasAffordableAlternativeCost({ alternativeCosts: [400], canAfford: canAffordLow }),
    true
  );

  const trappedEvent = {
    id: 'evt_debt_trap',
    type: 'dyn_debt_trap',
    title: { en: 'Debt Trap', de: 'Schuldenfalle' },
    desc: { en: 'Pay either way', de: 'Zahle so oder so' },
    opt1: { txt: { en: 'Option 1', de: 'Opt 1' } },
    opt2: { txt: { en: 'Option 2', de: 'Opt 2' } },
    extraData: { opt1Cost: 5000, opt2Cost: 2000 },
  } as unknown as GameEvent;

  // When NEITHER option is affordable, allow emergency settlement (do not reject/trap user)
  assert.equal(shouldRejectDynamicEventForCreditLimit(trappedEvent, 0, 5000, canAffordNone), false);
  assert.equal(shouldRejectDynamicEventForCreditLimit(trappedEvent, 1, 2000, canAffordNone), false);

  // When option 2 IS affordable (<= 2000) and user clicks expensive option 1 (5000), block option 1 cleanly
  assert.equal(
    shouldRejectDynamicEventForCreditLimit(trappedEvent, 0, 5000, (c) => c <= 2000),
    true
  );
});

test('InternationalTournamentModal does not fabricate a victory when no saved state exists', () => {
  const modalSrc = fs.readFileSync('src/components/InternationalTournamentModal.tsx', 'utf-8');
  assert.ok(
    !modalSrc.includes('const isRecoveredVictory = !initialSavedState && !isFreshInvite'),
    'Must never invent a World Cup victory when initialSavedState is missing'
  );
  assert.ok(modalSrc.includes('WorldCupLiveMatchArena'));
  assert.ok(modalSrc.includes('confirmWithdrawOpen'));
});
