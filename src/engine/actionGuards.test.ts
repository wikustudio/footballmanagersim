import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateBankLoanGuard,
  evaluateCoachHireGuard,
  evaluateCoachRenewGuard,
  evaluateCoachScoutGuard,
  evaluateFacilityDowngradeGuard,
  evaluateFacilityUpgradeGuard,
  evaluateIpoGuard,
  evaluateMarketingCampaignGuard,
  evaluateNamingRightsSignGuard,
  evaluatePrestigeUpgradeGuard,
  evaluateSponsorPitchGuard,
  evaluateWinterCampGuard,
  evaluateYouthVictoryClaimGuard,
} from './actionGuards';

const mockCoachA = {
  id: 'coach-a',
  name: 'Julian Lindner',
  cost: 1200,
  repReq: 30,
  style: 'Gegenpress',
  ovrBoost: 3,
  contractYearsLeft: 2,
};

const mockCoachB = {
  id: 'coach-b',
  name: 'Marco Pellegrini',
  cost: 1500,
  repReq: 35,
  style: 'Possession',
  ovrBoost: 4,
  contractYearsLeft: 2,
};

test('coach hiring is strictly blocked while an existing head coach is employed', () => {
  const occupiedState = {
    currentCoach: mockCoachA as any,
    budget: 20000,
    reputation: 70,
  };

  // Trying to hire a different coach without sacking Coach A first must fail
  const hireOther = evaluateCoachHireGuard(occupiedState, mockCoachB, 5000);
  assert.equal(hireOther.allowed, false);
  assert.equal(hireOther.reason, 'Dismiss Current Coach First');

  // Trying to hire the currently appointed coach must report already head coach
  const hireSame = evaluateCoachHireGuard(occupiedState, mockCoachA, 5000);
  assert.equal(hireSame.allowed, false);
  assert.equal(hireSame.reason, 'Already Head Coach');

  // Once Coach A is fired (currentCoach is undefined), Coach B can be appointed
  const vacantState = {
    currentCoach: undefined,
    budget: 20000,
    reputation: 70,
  };
  const hireAfterSack = evaluateCoachHireGuard(vacantState, mockCoachB, 5000);
  assert.equal(hireAfterSack.allowed, true);
});

test('coach hiring still enforces reputation and credit limit when vacant', () => {
  const lowRep = evaluateCoachHireGuard(
    { currentCoach: undefined, budget: 50000, reputation: 20 },
    mockCoachB,
    5000
  );
  assert.equal(lowRep.allowed, false);
  assert.match(lowRep.reason || '', /Reputation/);

  const overCredit = evaluateCoachHireGuard(
    { currentCoach: undefined, budget: -4800, reputation: 80 },
    mockCoachB,
    5000
  );
  assert.equal(overCredit.allowed, false);
  assert.match(overCredit.reason || '', /Credit Limit/);

  // Reserve/internal coach bypasses credit limit when vacant
  const reservePromote = evaluateCoachHireGuard(
    { currentCoach: undefined, budget: -4800, reputation: 80 },
    { id: 'res-1', name: 'Reserve Boss', cost: 2000, repReq: 0, isReserveCoach: true },
    5000
  );
  assert.equal(reservePromote.allowed, true);
});

test('coach scouting cannot double-charge DP for an already-scouted coach', () => {
  const firstScout = evaluateCoachScoutGuard(
    { skillPoints: 2, scoutedCoachIds: [], coachMarketPool: [] },
    'coach-b'
  );
  assert.equal(firstScout.allowed, true);

  const secondScout = evaluateCoachScoutGuard(
    { skillPoints: 1, scoutedCoachIds: ['coach-b'], coachMarketPool: [] },
    'coach-b'
  );
  assert.equal(secondScout.allowed, false);

  const noPoints = evaluateCoachScoutGuard(
    { skillPoints: 0, scoutedCoachIds: [], coachMarketPool: [] },
    'coach-c'
  );
  assert.equal(noPoints.allowed, false);
});

test('coach contract renewal respects 5-year cap and credit limit', () => {
  const capped = evaluateCoachRenewGuard(
    { currentCoach: { ...mockCoachA, contractYearsLeft: 5 } as any, budget: 20000 },
    2,
    5000
  );
  assert.equal(capped.allowed, false);

  const valid = evaluateCoachRenewGuard(
    { currentCoach: { ...mockCoachA, contractYearsLeft: 4 } as any, budget: 20000 },
    2,
    5000
  );
  assert.equal(valid.allowed, true);
  assert.equal(valid.actualYearsToAdd, 1);
  assert.equal(valid.newTotalYears, 5);
});

test('stadium naming rights blocks overwrite while active and blocks same-season bonus farming', () => {
  const baseClub = { name: 'F.C. Vizela', tier: 1, isReserve: false } as any;
  const offerA = { partnerName: 'Nordic Air', repRequired: 20 };
  const offerB = { partnerName: 'Voltrix Energy', repRequired: 20 };

  // Clean season with no active deal -> allowed
  const initial = evaluateNamingRightsSignGuard(
    { club: baseClub, reputation: 60, stadiumNamingRights: null, year: 2028, namingRightsSignedYear: undefined },
    offerA
  );
  assert.equal(initial.allowed, true);

  // While Deal A is active, cannot replace-sign Deal B without terminating first
  const replaceAttempt = evaluateNamingRightsSignGuard(
    {
      club: baseClub,
      reputation: 60,
      stadiumNamingRights: { partnerName: 'Nordic Air', yearsLeft: 3 } as any,
      year: 2028,
      namingRightsSignedYear: 2028,
    },
    offerB
  );
  assert.equal(replaceAttempt.allowed, false);
  assert.equal(replaceAttempt.reason, 'End Current Deal First');

  // Even after terminating Deal A in 2028, cannot sign Deal B in 2028 to farm signing bonuses
  const sameSeasonResign = evaluateNamingRightsSignGuard(
    {
      club: baseClub,
      reputation: 60,
      stadiumNamingRights: null,
      year: 2028,
      namingRightsSignedYear: 2028,
    },
    offerB
  );
  assert.equal(sameSeasonResign.allowed, false);
  assert.match(sameSeasonResign.reason || '', /Next Season/);

  // Next season (2029) after termination -> allowed
  const nextSeasonSign = evaluateNamingRightsSignGuard(
    {
      club: baseClub,
      reputation: 60,
      stadiumNamingRights: null,
      year: 2029,
      namingRightsSignedYear: 2028,
    },
    offerB
  );
  assert.equal(nextSeasonSign.allowed, true);

  // Reserve club is always blocked
  const reserveBlocked = evaluateNamingRightsSignGuard(
    {
      club: { name: 'Bayern Munich II', tier: 3, isReserve: true } as any,
      reputation: 90,
      stadiumNamingRights: null,
      year: 2029,
    },
    offerA
  );
  assert.equal(reserveBlocked.allowed, false);
});

test('IPO, Bank Loan, Winter Camp, Sponsor, Prestige, Facility, Marketing, and Youth Victory guards block duplicate exploits', () => {
  // IPO cannot run twice or outside Tier 1
  assert.equal(evaluateIpoGuard({ isPublic: true, club: { tier: 1 } as any }).allowed, false);
  assert.equal(evaluateIpoGuard({ isPublic: false, club: { tier: 2 } as any }).allowed, false);
  assert.equal(evaluateIpoGuard({ isPublic: false, club: { tier: 1 } as any }).allowed, true);

  // Bank loan cannot overlap
  assert.equal(evaluateBankLoanGuard({ bankLoan: { yearsLeft: 10 } as any }, 15000).allowed, false);
  assert.equal(evaluateBankLoanGuard({ bankLoan: undefined }, 0).allowed, false);
  assert.equal(evaluateBankLoanGuard({ bankLoan: undefined }, 15000).allowed, true);

  // Winter camp cannot run twice or exceed credit limit
  assert.equal(evaluateWinterCampGuard({ winterCampDone: true, budget: 50000 }, 0, 5000).allowed, false);
  assert.equal(evaluateWinterCampGuard({ winterCampDone: false, budget: 0 }, 25000, 5000).allowed, false);
  assert.equal(evaluateWinterCampGuard({ winterCampDone: false, budget: 50000 }, 25000, 5000).allowed, true);

  // Facility limits: max 1 per type, max 2 total per season, downgrade blocked same season
  const facState = {
    club: { academyLevel: 3, medicalLevel: 2 } as any,
    budget: 100000,
    stadiumExpandedThisSeason: 1,
    academyUpgradedThisSeason: 1,
    medicalUpgradedThisSeason: 0,
  };
  assert.equal(evaluateFacilityUpgradeGuard(facState, 'medical', 5000, 5000).allowed, false);
  assert.equal(evaluateFacilityDowngradeGuard(facState, 'academy').allowed, false);
  assert.equal(evaluateFacilityDowngradeGuard(facState, 'medical').allowed, true);

  // Sponsors: max 3 pitches, no overlapping performance sponsor
  assert.equal(evaluateSponsorPitchGuard({ sponsorsPitchedThisSeason: 3 }, 0).allowed, false);
  assert.equal(
    evaluateSponsorPitchGuard({ sponsorsPitchedThisSeason: 1, activePerformanceSponsor: true }, 2).allowed,
    false
  );
  assert.equal(evaluateSponsorPitchGuard({ sponsorsPitchedThisSeason: 1 }, 2).allowed, true);

  // Prestige upgrades cannot be purchased twice
  assert.equal(
    evaluatePrestigeUpgradeGuard(
      { budget: 900000, skillPoints: 200, prestigeUpgrades: { statueBuilt: true } },
      'statue'
    ).allowed,
    false
  );
  assert.equal(
    evaluatePrestigeUpgradeGuard(
      { budget: 900000, skillPoints: 200, prestigeUpgrades: { statueBuilt: false } },
      'statue'
    ).allowed,
    true
  );

  // Marketing global tour limited to once per season in Tier 1
  assert.equal(
    evaluateMarketingCampaignGuard(
      { club: { tier: 1 } as any, budget: 50000, skillPoints: 10, globalToursThisSeason: 1 },
      1500,
      0,
      5000,
      'global_tour'
    ).allowed,
    false
  );
  assert.equal(
    evaluateMarketingCampaignGuard(
      { club: { tier: 2 } as any, budget: 50000, skillPoints: 10, globalToursThisSeason: 0 },
      1500,
      0,
      5000,
      'global_tour'
    ).allowed,
    false
  );

  // Youth tournament victory cannot be claimed twice in the same year
  assert.equal(
    evaluateYouthVictoryClaimGuard({
      year: 2030,
      lastYouthChampionshipResult: { year: 2030, won: true, stage: 'final' },
    }).allowed,
    false
  );
  assert.equal(
    evaluateYouthVictoryClaimGuard({
      year: 2030,
      lastYouthChampionshipResult: { year: 2030, won: false, stage: 'participated' },
    }).allowed,
    true
  );
});
