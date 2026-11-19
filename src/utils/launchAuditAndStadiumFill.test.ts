import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFluctuatingMatchdayAttendances,
  calculateProbabilisticSeason,
} from '../engine/seasonSimEngine';
import {
  auditBowlSeatOccupancy,
  computeLiveMatchChoreography,
  computeSeatOccupancyProfile,
  getEffectiveStadiumName,
  getNamingRightsOffers,
} from '../engine/liveSimVisualEngine';
import {
  getBaseModClubs,
  REAL_CLUB_ALIASES,
} from '../engine/moddingEngine';
import { ALL_CLUBS } from '../data/clubsData';
import { TEAMS } from '../mod-data/teams';
import { mergeClubsDbSafeguards } from './modSafeguards';
import {
  calculateClubFinancials,
  calculateExpectedAttendance,
  getClubMaxBankLoan,
} from '../data/gameConstants';
import {
  getStructuredLoanQuotes,
  advanceLoanSeason,
  getLoanProgress,
} from '../engine/creditFacilityEngine';
import {
  calculateSponsorDealOffers,
} from '../engine/commercialEngine';
import { GameState } from '../types';

test('Fluctuating matchday attendances vary realistically across fixtures and average to target attendance', () => {
  const fixtures = Array.from({ length: 34 }, (_, idx) => ({
    matchday: idx + 1,
    opponentId: 100 + idx,
    opponentOvr: 70 + ((idx * 5) % 18),
    isHome: idx % 2 === 0,
    result: (idx % 3 === 0 ? 'W' : idx % 3 === 1 ? 'D' : 'L') as 'W' | 'D' | 'L',
    runningWins: Math.floor(idx / 3),
    runningLosses: Math.floor(idx / 4),
    isUpsetWin: idx === 7 || idx === 23,
  }));

  // User's exact example: 31,087 average attendance in a 41,575-seat stadium
  const attendances = buildFluctuatingMatchdayAttendances({
    fixtures,
    targetAvgAtt: 31087,
    stadiumCapacity: 41575,
    leagueAvgOvr: 76,
    rivalClubId: 103, // MD 4 derby
    seedYear: 2026,
  });

  assert.equal(attendances.length, 34);
  const minAtt = Math.min(...attendances);
  const maxAtt = Math.max(...attendances);
  const meanAtt = Math.round(attendances.reduce((a, b) => a + b, 0) / attendances.length);

  // Exact season mean parity
  assert.equal(meanAtt, 31087, `Expected rounded mean 31087, got ${meanAtt}`);
  // Realistic swing across the 34 matchdays (not flat, within stadium capacity)
  assert.ok(maxAtt - minAtt >= 6000, `Expected healthy spread >= 6000 seats, got ${maxAtt - minAtt}`);
  assert.ok(maxAtt <= 41575, `Attendance must never exceed stadium capacity 41575 (got ${maxAtt})`);
  assert.ok(minAtt >= 15000, `Attendance floor should stay realistic (got ${minAtt})`);
  // Derby matchday (MD 4, rivalClubId 103) draws above season average
  assert.ok(attendances[3] > 31087, `Derby matchday (${attendances[3]}) should exceed season average 31087`);
});

test('calculateProbabilisticSeason populates fluctuating matchday attendances averaging to expectedSeasonAtt', () => {
  const club = {
    id: 501,
    name: 'Test Metro FC',
    tier: 1,
    baseOvr: 78,
    color: '0054a6',
    stadium: 41575,
    country: 'GER',
    rep: 76,
    fanBase: 850000,
  };
  const mockState = {
    club,
    year: 2026,
    budget: 25000,
    reputation: 76,
    morale: 75,
    tactic: 'Total Football',
    stadiumPolicy: 'balanced',
    ownership: 'private',
    history: [],
  } as unknown as GameState;

  const sim = calculateProbabilisticSeason(mockState, ALL_CLUBS, false);
  assert.equal(sim.schedule.length, 34);
  assert.ok(sim.expectedSeasonAtt && sim.expectedSeasonAtt > 0);

  const atts = sim.schedule.map((m) => m.attendance || 0);
  assert.ok(atts.every((a) => a > 0 && a <= club.stadium));
  const realizedMean = Math.round(atts.reduce((a, b) => a + b, 0) / atts.length);
  assert.equal(realizedMean, sim.expectedSeasonAtt);
  if ((sim.expectedSeasonAtt || 0) < club.stadium) {
    assert.ok(Math.max(...atts) > Math.min(...atts), 'Simulated matchdays should fluctuate when below 100% sellout');
  }
});

test('3D Stadium Bowl occupancy at 31,087 / 41,575 (~74.8%) is NOT sold out and fills Behind-Goal & Center-Line first', () => {
  const cap = 41575;
  const occ25 = auditBowlSeatOccupancy(Math.round(cap * 0.25), cap, 'balanced');
  const occ50 = auditBowlSeatOccupancy(Math.round(cap * 0.50), cap, 'balanced');
  const occ75 = auditBowlSeatOccupancy(31087, cap, 'balanced');
  const occ90 = auditBowlSeatOccupancy(Math.round(cap * 0.90), cap, 'balanced');
  const occ100 = auditBowlSeatOccupancy(cap, cap, 'balanced');

  // Monotonic distinct fill rates across 25% -> 50% -> 74.8% -> 90% -> 100%
  assert.ok(occ25.overallFill < occ50.overallFill, '25% must be sparser than 50%');
  assert.ok(occ50.overallFill < occ75.overallFill, '50% must be sparser than 74.8%');
  assert.ok(occ75.overallFill < occ90.overallFill, '74.8% must be sparser than 90%');
  assert.ok(occ90.overallFill < occ100.overallFill, '90% must be sparser than 100%');

  // At 31,087 / 41,575 (~74.8%), ~22%–32% of visual stadium seats MUST be unoccupied!
  assert.ok(
    occ75.overallFill >= 0.67 && occ75.overallFill <= 0.80,
    `Expected ~74.8% stadium fill to render ~67%-80% occupied seats, got ${(occ75.overallFill * 100).toFixed(1)}%`
  );
  assert.ok(
    occ75.cornerFill < 0.70,
    `Corners at 74.8% attendance must show significant open seats (got ${(occ75.cornerFill * 100).toFixed(1)}%)`
  );

  // True 100% sellout fills >= 99% of seats
  assert.ok(
    occ100.overallFill >= 0.99,
    `100% sellout should fill >= 99% of seats, got ${(occ100.overallFill * 100).toFixed(1)}%`
  );

  // Priority hierarchy at 25%, 50%, and 74.8%:
  // Behind-the-goal Home Fan Section & Center Line ALWAYS fill before outer wings & corners
  for (const [label, snap] of [
    ['25%', occ25],
    ['50%', occ50],
    ['74.8%', occ75],
  ] as const) {
    assert.ok(
      snap.homeEndFill > snap.sidelineWingFill && snap.homeEndFill > snap.cornerFill,
      `[${label}] Behind-goal Home Fan Section (${snap.homeEndFill.toFixed(2)}) must fill ahead of wings (${snap.sidelineWingFill.toFixed(2)}) & corners (${snap.cornerFill.toFixed(2)})`
    );
    assert.ok(
      snap.sidelineCenterFill > snap.sidelineWingFill && snap.sidelineCenterFill > snap.cornerFill,
      `[${label}] Center-line seats (${snap.sidelineCenterFill.toFixed(2)}) must fill ahead of wings (${snap.sidelineWingFill.toFixed(2)}) & corners (${snap.cornerFill.toFixed(2)})`
    );
  }

  // Empty bowl check
  const emptyProfile = computeSeatOccupancyProfile(0, cap, false);
  assert.equal(emptyProfile.totalRatio, 0);
  assert.equal(emptyProfile.homeEndFill, 0);
});

test('SD Aucas (id: 857) logo and C.F. Os Belenenses (id: 236) / Sporting CP B (id: 237) club colors & stadiums are accurate', () => {
  const modClubs = getBaseModClubs();

  const aucasMod = modClubs.find((c) => c.id === 857);
  assert.ok(aucasMod, 'SD Aucas (id: 857) must exist in modded club database');
  assert.equal(aucasMod.name, 'SD Aucas');
  assert.equal(aucasMod.country, 'ECU');
  assert.equal(aucasMod.logo, 'https://upload.wikimedia.org/wikipedia/en/4/4c/S.D._Aucas.svg');
  assert.equal(aucasMod.fallbackLogo, 'https://upload.wikimedia.org/wikipedia/en/4/4c/S.D._Aucas.svg');
  assert.equal(REAL_CLUB_ALIASES['sd aucas'], 857);

  const belenensesMod = modClubs.find((c) => c.id === 236);
  const belenensesBase = ALL_CLUBS.find((c) => c.id === 236);
  const belenensesRaw = TEAMS.find((c) => c.id === 236);
  assert.ok(belenensesMod && belenensesBase && belenensesRaw);
  assert.equal(belenensesMod.name, 'C.F. Os Belenenses');
  assert.equal(belenensesMod.color, '0054a6', 'C.F. Os Belenenses must have Restelo royal blue #0054a6');
  assert.equal(belenensesMod.stadium, 19856, 'C.F. Os Belenenses must have Estádio do Restelo 19,856 capacity');
  assert.equal(belenensesBase.color, '0054a6');
  assert.equal(belenensesBase.stadium, 19856);

  const sportingBMod = modClubs.find((c) => c.id === 237);
  const sportingBBase = ALL_CLUBS.find((c) => c.id === 237);
  assert.ok(sportingBMod && sportingBBase);
  assert.equal(sportingBMod.name, 'Sporting CP B');
  assert.equal(sportingBMod.color, '008057', 'Sporting CP B must have Sporting green #008057');
  assert.equal(sportingBMod.stadium, 3000, 'Sporting CP B must have 3,000 academy stadium capacity');
  assert.equal(sportingBBase.color, '008057');
  assert.equal(sportingBBase.stadium, 3000);

  // Verify legacy cached localStorage swap heals cleanly via mergeClubsDbSafeguards
  const legacySwappedExisting = [
    { ...belenensesMod, color: '008057', stadium: 3000 },
    { ...sportingBMod, color: '0054a6', stadium: 19856 },
  ];
  const healed = mergeClubsDbSafeguards(modClubs.slice(0, 5).concat([belenensesMod, sportingBMod]), legacySwappedExisting, null);
  const healedBel = healed.find((c) => c.id === 236)!;
  const healedScpB = healed.find((c) => c.id === 237)!;
  assert.equal(healedBel.color, '0054a6');
  assert.equal(healedBel.stadium, 19856);
  assert.equal(healedScpB.color, '008057');
  assert.equal(healedScpB.stadium, 3000);

  // Verify un-scrambled German & Spanish clubs in mod database match real capacities & colors
  const expectedFixes: Array<[number, string, number, string]> = [
    [28, 'FC Schalke 04', 62271, '004b93'],
    [27, 'Hertha BSC', 74667, '00529c'],
    [30, '1. FC Nürnberg', 50000, 'a6192e'],
    [24, 'Hannover 96', 49000, '15803d'],
    [23, 'Karlsruher SC', 34302, '0053a0'],
    [26, 'SpVgg Greuther Fürth', 16626, '009640'],
    [25, 'SC Paderborn 07', 15000, '005ca9'],
    [20, 'SV Darmstadt 98', 17650, '004b9c'],
    [29, 'SV Elversberg', 10000, '000000'],
    [520, 'RCD Mallorca', 23142, 'e20613'],
    [518, 'CD Leganés', 12454, '00529f'],
  ];
  for (const [id, name, stadium, color] of expectedFixes) {
    const team = modClubs.find((c) => c.id === id);
    assert.ok(team, `Club ${id} (${name}) must exist`);
    assert.equal(team.name, name);
    assert.equal(team.stadium, stadium, `${name} stadium must be ${stadium}`);
    assert.equal(team.color, color, `${name} color must be ${color}`);
  }
});

test('Full Financial System Audit: Operating Income, Operating Expenses, Loans, Naming Rights, IPO & Heritage reconcile 100%', () => {
  const baseClub = ALL_CLUBS.find((c) => c.id === 236)!; // Tier 2 POR, 19,856 seats

  const scenarios: Array<{ name: string; state: Partial<GameState> }> = [
    {
      name: 'Inaugural Season Baseline (with Board Solvency Subsidy check)',
      state: {
        club: { ...baseClub, academyLevel: 1, medicalLevel: 1 },
        year: 2026,
        startYear: 2026,
        seasonCount: 1,
        budget: 5000,
        reputation: 66,
        tactic: 'Total Football',
      },
    },
    {
      name: 'Heritage Identity (-20% operational discount) + Youth Scouting Dial + Naming Rights',
      state: {
        club: { ...baseClub, tier: 1, baseOvr: 82, stadium: 35000, academyLevel: 4, medicalLevel: 3 },
        year: 2029,
        startYear: 2026,
        seasonCount: 4,
        budget: 42000,
        reputation: 82,
        clubIdentity: 'heritage',
        academyScoutingDial: 30,
        euroStatus: 'EL',
        stadiumNamingRights: {
          partnerName: 'Atlantic Energy',
          stadiumDisplayName: 'Atlantic Energy Restelo',
          tier: 'national',
          annualPayoutK: 2800,
          signingBonusK: 1500,
          totalYears: 4,
          yearsLeft: 3,
          signedYear: 2028,
        },
      },
    },
    {
      name: 'Public IPO Dividend + Active Bank Loan + Wealth Luxury Tax (>€150M) + Veteran Ringer',
      state: {
        club: { ...baseClub, country: 'ENG', tier: 1, baseOvr: 91, stadium: 62000, academyLevel: 5, medicalLevel: 5 },
        year: 2032,
        startYear: 2026,
        seasonCount: 7,
        budget: 185000, // Triggers Tier 1 + Tier 2 FFP Luxury Tax
        reputation: 92,
        isPublic: true,
        ipoPrice: 12,
        stockPrice: 18,
        euroStatus: 'CL',
        vipHospitality: true,
        stadiumPolicy: 'commercial',
        veteranRingerActive: true,
        veteranRingerWageK: 4200,
        severances: [{ amount: 1800, yearsLeft: 1 }],
        bankLoan: {
          loanType: 'bank',
          initialPrincipal: 20000,
          principal: 16000,
          interestRate: 8,
          annualPayment: 6200,
          totalYears: 4,
          yearsLeft: 3,
        },
      },
    },
    {
      name: 'In-Debt Club (10% Overdraft Interest + Failed Sponsor Target -40% Penalty + Galactico)',
      state: {
        club: { ...baseClub, country: 'GER', tier: 2, baseOvr: 73, stadium: 11000, academyLevel: 2, medicalLevel: 2 },
        year: 2028,
        startYear: 2026,
        seasonCount: 3,
        budget: -8500, // Triggers 10% debtInterest = 850
        reputation: 68,
        clubIdentity: 'galactico',
        failedSponsorTargetNextSeason: true,
        sponsorIncome: 1200, // Upfront cash already credited — must NOT double-count in estRevenue
      },
    },
  ];

  for (const sc of scenarios) {
    const fullState = {
      isManaged: true,
      managerSkills: [],
      ...sc.state,
    } as unknown as GameState;

    const fin = calculateClubFinancials(fullState);

    // 1. Exact sum of every Ledger Operating Income line item === estRevenue
    const sumIncomeItems =
      fin.matchdayIncomeK +
      fin.tvPrize +
      fin.posPrizeK +
      fin.euroRev +
      fin.parentClubGrant +
      fin.boardSubsidy +
      fin.academyDividend +
      fin.namingRightsIncome +
      fin.sponsorInc;
    assert.equal(
      sumIncomeItems,
      fin.estRevenue,
      `[${sc.name}] Sum of Ledger income rows (${sumIncomeItems}) must equal estRevenue (${fin.estRevenue})`
    );

    // 2. Exact sum of every Ledger Operating Expense line item === wages (totalExpenses)
    const sumExpenseItems =
      fin.pureWages +
      fin.luxuryTax +
      fin.stadiumOp +
      fin.medicalOp +
      fin.academyOp +
      fin.severanceOp +
      fin.debtInterest +
      fin.bankLoanDebtService +
      fin.shareholderDividend;
    assert.equal(
      sumExpenseItems,
      fin.wages,
      `[${sc.name}] Sum of Ledger expense rows (${sumExpenseItems}) must equal total wages/expenses (${fin.wages})`
    );

    // 3. Exact Operating Margin === estRevenue - wages
    assert.equal(
      fin.estRevenue - fin.wages,
      fin.net,
      `[${sc.name}] estRevenue - wages (${fin.estRevenue - fin.wages}) must equal net (${fin.net})`
    );

    // 4. Attendance consistency between calculateClubFinancials and calculateExpectedAttendance
    const standaloneExpectedAtt = calculateExpectedAttendance({
      club: fullState.club,
      tier: fullState.club.tier,
      year: fullState.year,
      ownership: fullState.ownership,
      stadiumPolicy: fullState.stadiumPolicy,
    });
    assert.equal(fin.expectedAtt, standaloneExpectedAtt, `[${sc.name}] Attendance must match 1:1`);
  }

  // 5. Verify Credit Facility & Commercial Naming Rights lifecycle functions
  const maxLoan = getClubMaxBankLoan(baseClub, 5000, 66);
  assert.ok(maxLoan > 0);
  const quotes = getStructuredLoanQuotes(maxLoan);
  assert.equal(quotes.length, 2);
  assert.equal(quotes[0].type, 'bank');
  assert.equal(quotes[1].type, 'bond');
  const activeLoan = {
    loanType: quotes[0].type,
    initialPrincipal: quotes[0].principal,
    principal: quotes[0].principal,
    interestRate: quotes[0].interestRate,
    annualPayment: quotes[0].annualPayment,
    totalYears: quotes[0].years,
    yearsLeft: 2,
  };
  const prog = getLoanProgress(activeLoan);
  assert.ok(prog && prog.remainingPrincipal > 0);
  const step1 = advanceLoanSeason(activeLoan);
  assert.equal(step1.annualDebitedK, quotes[0].annualPayment);
  assert.equal(step1.isPaidOff, false);
  const step2 = advanceLoanSeason(step1.updatedLoan);
  assert.equal(step2.isPaidOff, true);
  assert.equal(step2.updatedLoan, undefined);

  const namingOffers = getNamingRightsOffers(baseClub, 75, baseClub.stadium);
  assert.ok(namingOffers.length >= 2);
  const commercialDeals = calculateSponsorDealOffers({
    club: baseClub,
    reputation: 75,
    tactic: 'Tiki-Taka',
    managerSkills: ['salesmaster'],
  } as unknown as GameState);
  assert.equal(commercialDeals.perfUpfrontVal + commercialDeals.perfCompletionBonusVal, commercialDeals.perfTotalVal);
  assert.ok(commercialDeals.megaVal > commercialDeals.standardVal);
});

test('Promotion Attendance Monotonicity: C.F. Os Belenenses and clubs worldwide NEVER collapse in attendance on promotion', () => {
  const modClubs = getBaseModClubs();
  const belenenses = modClubs.find((c) => c.id === 236)!;

  // Test across multiple seasons & newly-promoted OVR values (e.g. OVR 68..74 promoted into POR Tier 1 avgOvr 78)
  for (const ovr of [67, 68, 70, 72, 74]) {
    for (const year of [2026, 2027, 2028, 2029]) {
      const clubSnap = { ...belenenses, baseOvr: ovr, fanBase: 956000 };
      const attTier2 = calculateExpectedAttendance({ club: clubSnap, tier: 2, year });
      const attTier1 = calculateExpectedAttendance({ club: clubSnap, tier: 1, year });

      assert.ok(
        attTier1 > attTier2,
        `C.F. Os Belenenses (OVR ${ovr}, ${year}) promoted Tier 1 attendance (${attTier1}) must strictly exceed Tier 2 (${attTier2})`
      );
      assert.ok(
        attTier1 >= 6500,
        `C.F. Os Belenenses in Primeira Liga (Estádio do Restelo 19,856) should draw >= 6,500 (got ${attTier1})`
      );
    }
  }

  // Verify global promotion monotonicity for a standard newly-promoted club in 12 countries (Tier 2 -> Tier 1)
  const testCountries = ['POR', 'SCO', 'TUR', 'GRE', 'ECU', 'GER', 'ENG', 'ESP', 'ITA', 'FRA', 'BRA', 'ARG'];
  for (const country of testCountries) {
    const genericClub = {
      id: 9001,
      name: `Promoted ${country} FC`,
      country,
      tier: 2,
      stadium: 18000,
      baseOvr: 69,
      fanBase: 450000,
    };
    const t2 = calculateExpectedAttendance({ club: genericClub, tier: 2, year: 2027 });
    const t1 = calculateExpectedAttendance({ club: genericClub, tier: 1, year: 2027 });
    assert.ok(
      t1 >= t2,
      `[${country}] Promoted Tier 1 attendance (${t1}) must never collapse below Tier 2 (${t2})`
    );
  }
});

test('3D Live Match Choreography delivers rich 1v1 action, penalties, sliding tackles, away GK saves, and authentic stadium names', () => {
  const modClubs = getBaseModClubs();
  const belenenses = modClubs.find((c) => c.id === 236)!;
  const aucas = modClubs.find((c) => c.id === 857)!;

  assert.equal(getEffectiveStadiumName(belenenses, null), 'Estádio do Restelo');
  assert.equal(getEffectiveStadiumName(aucas, null), 'Estadio Gonzalo Pozo Ripalda');
  assert.equal(
    getEffectiveStadiumName(belenenses, {
      partnerName: 'Lisbon Air',
      stadiumDisplayName: 'Lisbon Air Restelo',
      tier: 'national',
      annualPayoutK: 1500,
      signingBonusK: 800,
      totalYears: 4,
      yearsLeft: 3,
      signedYear: 2026,
    }),
    'Lisbon Air Restelo'
  );

  // Sample across all phases & ticks 0..23 to verify genuine variety of 1v1 & set-piece moments
  const patterns = new Set<string>();
  const duelKinds = new Set<string>();
  let sawTacklingPose = false;
  let sawDivingPose = false;
  let sawTacticalLinks = false;

  const phases = ['buildup', 'counter', 'setpiece', 'shot', 'goal'] as const;
  for (const phase of phases) {
    for (let tick = 0; tick < 24; tick++) {
      const ch = computeLiveMatchChoreography({ tactic: 'Total Football', phase, tick, isLive: true });
      patterns.add(ch.playPattern);
      if (ch.duelRing) duelKinds.add(ch.duelRing.kind);
      if (ch.tacticalLinks.length > 0) sawTacticalLinks = true;
      for (const p of [...ch.homePlayers, ...ch.awayPlayers]) {
        if (p.pose === 'tackling') sawTacklingPose = true;
        if (p.pose === 'diving') sawDivingPose = true;
        assert.ok(p.u >= -205 && p.u <= 205 && p.v >= -130 && p.v <= 130, `Player out of bounds (${p.u}, ${p.v})`);
      }
    }
  }

  assert.ok(patterns.has('1v1 Breakaway vs Keeper'), 'Must include 1v1 Breakaway vs Keeper');
  assert.ok(patterns.has('Wing 1v1 Isolation'), 'Must include Wing 1v1 Isolation');
  assert.ok(patterns.has('1v1 Penalty Kick'), 'Must include 1v1 Penalty Kick');
  assert.ok(patterns.has('1v1 Chip vs Keeper'), 'Must include 1v1 Chip vs Keeper');
  assert.ok(patterns.has('Away 1v1 & Home GK Save'), 'Must include Away 1v1 & Home GK Save');
  assert.ok(patterns.has('1v1 Recovery Tackle'), 'Must include 1v1 Recovery Tackle');
  assert.ok(patterns.size >= 14, `Expected >= 14 distinct play patterns across phases, got ${patterns.size}`);

  assert.ok(duelKinds.has('1v1') && duelKinds.has('save') && duelKinds.has('tackle') && duelKinds.has('penalty'));
  assert.ok(sawTacklingPose && sawDivingPose && sawTacticalLinks);
});

