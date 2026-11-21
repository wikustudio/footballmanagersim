import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { computeMatchdayReadinessModifier } from './matchOddsEngine';
import {
  evaluateTrophyHunterMilestones,
  computeEndgameRivalArmsRace,
} from './dynastyMilestonesEngine';
import type { Club, GameState } from '../types';

test('Matchday readiness factors morale, coach hidden traits, new manager bounce, and interim caretaker handicap', () => {
  // Neutral morale + normal coach -> 0
  const neutral = computeMatchdayReadinessModifier({
    morale: 70,
    hasCoach: true,
    hasNewManagerBounce: false,
    hiddenAttributes: { motivationalDrive: 12, tacticalFlexibility: 12, discipline: 12 },
  });
  assert.equal(neutral.totalOvrMod, 0);
  assert.equal(neutral.breakdown.length, 0);

  // No coach (Interim Caretaker) + crisis morale -> clamped floor -5.0
  const crisisInterim = computeMatchdayReadinessModifier({
    morale: 10,
    hasCoach: false,
  });
  assert.equal(crisisInterim.totalOvrMod, -5.0);
  assert.ok(crisisInterim.breakdown.some(b => b.label === 'Interim Caretaker' && b.delta === -3.5));
  assert.ok(crisisInterim.breakdown.some(b => b.label === 'Low Morale' && b.delta === -2.5));

  // Elite coach + high morale + new manager bounce + underdog grit -> clamped ceiling +4.5
  const peakUnderdog = computeMatchdayReadinessModifier({
    morale: 100,
    hasCoach: true,
    hasNewManagerBounce: true,
    isUnderdog: true,
    hiddenAttributes: { motivationalDrive: 18, tacticalFlexibility: 17, discipline: 16 },
  });
  assert.equal(peakUnderdog.totalOvrMod, 4.5);
  assert.ok(peakUnderdog.breakdown.some(b => b.label === 'Underdog Grit' && b.delta === 1.2));
  assert.ok(peakUnderdog.breakdown.some(b => b.label === 'New Manager Bounce' && b.delta === 1.5));
  assert.ok(peakUnderdog.breakdown.some(b => b.label === 'High Morale' && b.delta === 1.5));

  // Favorite with motivationalDrive gets +0.8 (less than underdog grit +1.2)
  const favDrive = computeMatchdayReadinessModifier({
    morale: 70,
    hasCoach: true,
    isUnderdog: false,
    hiddenAttributes: { motivationalDrive: 17 },
  });
  assert.equal(favDrive.totalOvrMod, 0.8);
});

test('Trophy Hunter Milestones track Treble, Invincibles, Cross-Border Titles, World Cup, and Silverware milestones', () => {
  const freshState = {
    club: { id: 1, name: 'Test FC', country: 'GER', tier: 6, baseOvr: 40 },
    totals: { trophies: 0 },
    history: [],
    worldCupTrophies: 0,
  } as unknown as GameState;

  const freshSummary = evaluateTrophyHunterMilestones(freshState);
  assert.equal(freshSummary.totalCount, 8);
  assert.equal(freshSummary.unlockedCount, 0);

  const legendState = {
    club: { id: 2, name: 'Madrid', country: 'ESP', tier: 1, baseOvr: 95 },
    totals: { trophies: 28 },
    worldCupTrophies: 1,
    history: [
      {
        year: 2032,
        clubName: 'Freiburg',
        country: 'GER',
        tier: 1,
        pos: 1,
        wins: 28,
        draws: 6,
        losses: 0,
        trophiesThisYear: { bl: 1, dfb: 1, cl: 1 },
      },
      {
        year: 2035,
        clubName: 'Madrid',
        country: 'ESP',
        tier: 1,
        pos: 1,
        wins: 29,
        draws: 5,
        losses: 4,
        trophiesThisYear: { bl: 1 },
      },
    ],
  } as unknown as GameState;

  const legendSummary = evaluateTrophyHunterMilestones(legendState);
  assert.equal(legendSummary.trebleCount, 1);
  assert.equal(legendSummary.invincibleCount, 1);
  assert.deepEqual(legendSummary.distinctTitleCountries.sort(), ['ESP', 'GER']);
  assert.equal(legendSummary.unlockedCount, 7); // Everything except Immortal 50 Club

  const byId = Object.fromEntries(legendSummary.milestones.map(m => [m.id, m.unlocked]));
  assert.equal(byId.first_silverware, true);
  assert.equal(byId.double_digit, true);
  assert.equal(byId.legendary_cabinet, true);
  assert.equal(byId.immortal_50, false);
  assert.equal(byId.continental_treble, true);
  assert.equal(byId.invincible_season, true);
  assert.equal(byId.multi_country_conqueror, true);
  assert.equal(byId.world_cup_legend, true);
});

test('Endgame Rival Arms Race elevates top 2 Tier 1 rivals only during 92+ OVR multi-title dynasties', () => {
  const clubs: Club[] = [
    { id: 1, name: 'User FC', country: 'GER', tier: 1, baseOvr: 96, color: '#000', baseBudget: 100000, stadium: 75000, fanBase: 500000 } as Club,
    { id: 2, name: 'Rival A', country: 'GER', tier: 1, baseOvr: 88, color: '#f00', baseBudget: 90000, stadium: 70000, fanBase: 400000 } as Club,
    { id: 3, name: 'Rival B', country: 'GER', tier: 1, baseOvr: 86, color: '#0f0', baseBudget: 80000, stadium: 65000, fanBase: 350000 } as Club,
    { id: 4, name: 'Rival C', country: 'GER', tier: 1, baseOvr: 82, color: '#00f', baseBudget: 70000, stadium: 50000, fanBase: 250000 } as Club,
  ];

  // Inactive below threshold
  assert.deepEqual(computeEndgameRivalArmsRace(1, 90, 3, clubs), []);
  assert.deepEqual(computeEndgameRivalArmsRace(1, 96, 1, clubs), []);

  // Active at 96 OVR + 2 consecutive titles -> +1 OVR step to top 2 rivals (excluding User FC)
  const step2 = computeEndgameRivalArmsRace(1, 96, 2, clubs);
  assert.equal(step2.length, 2);
  assert.deepEqual(step2.map(u => u.clubId), [2, 3]);
  assert.equal(step2[0].newOvr, 89);
  assert.equal(step2[1].newOvr, 87);

  // Active at 96 OVR + 4 consecutive titles -> +2 OVR step capped cleanly at 94 (userOvr - 2)
  const step4 = computeEndgameRivalArmsRace(1, 96, 4, clubs);
  assert.equal(step4[0].newOvr, 90);
  assert.equal(step4[1].newOvr, 88);
});

test('UI contracts: CupRunModal & DecisionDayModal include readiness & fast-sim controls; ManagerProfileModal shows Legacy Milestones', () => {
  const cupModal = fs.readFileSync(path.resolve('src/components/CupRunModal.tsx'), 'utf8');
  const ddModal = fs.readFileSync(path.resolve('src/components/DecisionDayModal.tsx'), 'utf8');
  const profileModal = fs.readFileSync(path.resolve('src/components/ManagerProfileModal.tsx'), 'utf8');

  assert.ok(cupModal.includes('computeMatchdayReadinessModifier'));
  assert.ok(cupModal.includes('handleQuickSimRound'));
  assert.ok(cupModal.includes('Quick Sim'));
  assert.ok(cupModal.includes('Skip to Full-Time'));

  assert.ok(ddModal.includes('computeMatchdayReadinessModifier'));
  assert.ok(ddModal.includes('handleSkipBroadcast'));
  assert.ok(ddModal.includes('Matchday Readiness:'));

  assert.ok(profileModal.includes('evaluateTrophyHunterMilestones'));
  assert.ok(profileModal.includes('Trophy Hunter Legacy Milestones'));
});

test('Supercup win odds incorporate coach alignment, tactical stance synergy, and readiness; defeat CTA copy is accurate', async () => {
  const { computeSupercupWinOdds } = await import('./liveSimVisualEngine');
  const opponent = { id: 99, name: 'Rival FC', tier: 1, baseOvr: 82, color: '#f00', stadium: 60000, country: 'GER' } as Club;
  const eligibility = {
    eligible: true,
    cupName: 'DFL-Supercup',
    opponent,
    prizeK: 4000,
    reason: 'League Champion',
  };

  const alignedPressState = {
    year: 2027,
    club: { id: 1, name: 'User FC', tier: 1, baseOvr: 82, morale: 92, color: '#000', stadium: 60000, country: 'GER' },
    tactic: 'Gegenpressing',
    currentCoach: { name: 'Coach A', style: 'Gegenpressing', ovrBoost: 0, hiddenAttributes: { motivationalDrive: 17 } },
    hasNewManagerBounce: true,
  } as unknown as GameState;

  const interimCrisisState = {
    year: 2027,
    club: { id: 1, name: 'User FC', tier: 1, baseOvr: 82, morale: 25, color: '#000', stadium: 60000, country: 'GER' },
    tactic: 'Gegenpressing',
    currentCoach: null,
    hasNewManagerBounce: false,
  } as unknown as GameState;

  const pressOdds = computeSupercupWinOdds(alignedPressState, eligibility, 'high_press');
  const counterOdds = computeSupercupWinOdds(alignedPressState, eligibility, 'counter');
  const crisisOdds = computeSupercupWinOdds(interimCrisisState, eligibility, 'high_press');

  assert.ok(pressOdds.winProbPct > counterOdds.winProbPct, 'Gegenpressing club should perform better with High Press than Counter');
  assert.ok(pressOdds.winProbPct > crisisOdds.winProbPct + 12, 'Aligned high-morale coach should strongly outperform crisis interim caretaker');

  const supercupSrc = fs.readFileSync(path.resolve('src/components/SupercupModal.tsx'), 'utf8');
  assert.ok(supercupSrc.includes('Continue to Season Kickoff'), 'Losing Supercup must not say Collect Silverware');
});

test('StadiumBowl3D includes authentic pitch markings, dugouts/tunnel, floodlights, jumbotron, and night crowd flashes', () => {
  const bowlSrc = fs.readFileSync(path.resolve('src/components/StadiumBowl3D.tsx'), 'utf8');
  assert.ok(bowlSrc.includes('data-testid="pitch-penalty-spots"'));
  assert.ok(bowlSrc.includes('data-testid="pitch-corner-arcs"'));
  assert.ok(bowlSrc.includes('data-testid="stadium-dugouts-tunnel"'));
  assert.ok(bowlSrc.includes('data-testid="stadium-jumbotron"'));
  assert.ok(bowlSrc.includes('data-testid="stadium-floodlight-beams"'));
  assert.ok(bowlSrc.includes('data-testid="crowd-night-flashes"'));
});

