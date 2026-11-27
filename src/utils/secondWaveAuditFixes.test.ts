import { describe, it, expect } from 'vitest';
import { buildChampionsAlmanac } from './championsAlmanac';
import { getAllUniverseMovements } from './universeMovements';
import { simulateAiLeagues } from '../engine/simulateAiLeagues';
import { calculateClubLeagueHistory } from '../engine/clubProgressionEngine';
import { generateName } from '../engine/coachEngine';
import { evaluatePerformancePressure } from '../engine/pressureEngine';
import { calculateAcademySubLedger } from '../engine/subLedgerEngine';
import { evaluateTrophyHunterMilestones } from '../engine/dynastyMilestonesEngine';
import { generateBoardVision, updateBoardVisionSeasonEnd } from '../engine/boardVisionEngine';
import { generateTransferSaga } from '../engine/transferSagaEngine';
import { getLoanProgress } from '../engine/creditFacilityEngine';
import { getCompetitionTheme } from './prestigeTheme';
import { ALL_CLUBS } from '../data/clubsData';
import type { BoardVision, Club, GameState, UniverseMovement } from '../types';

const makeMinimalState = (overrides: Partial<GameState> = {}): GameState =>
  ({
    year: 2027,
    startYear: 2026,
    managerName: 'Alex Director',
    club: {
      id: 999001,
      name: 'Test FC',
      country: 'GER',
      tier: 1,
      baseOvr: 80,
      ovr: 80,
      morale: 75,
      stadium: 35000,
      fanBase: 25000,
      academyLevel: 3,
      medicalLevel: 3,
      color: '#1d4ed8',
    },
    budget: 25000,
    reputation: 70,
    history: [],
    trophyHistory: [],
    supercupHistory: [],
    universeMovements: [],
    totals: { trophies: 0 },
    ...overrides,
  }) as unknown as GameState;

describe('Second-Wave Comprehensive Audit Fixes', () => {
  it('Champions Almanac UEFA Champions Cup does not get hijacked by CONCACAF or AFC winners', () => {
    const concacafMove: UniverseMovement = {
      id: 'move-concacaf-2026',
      year: 2026,
      clubId: 5001,
      clubName: 'Monterrey United',
      country: 'MEX',
      fromTier: 1,
      toTier: 1,
      fromLeagueName: 'Concacaf Champions Cup',
      toLeagueName: 'Champions',
      type: 'cup_champion',
      pos: 1,
      reason: 'Concacaf Champions Cup Winners',
    };
    const uefaMove: UniverseMovement = {
      id: 'move-uefa-2026',
      year: 2026,
      clubId: 5002,
      clubName: 'Madrid White',
      country: 'ESP',
      fromTier: 1,
      toTier: 1,
      fromLeagueName: 'Champions Cup',
      toLeagueName: 'Champions',
      type: 'cup_champion',
      pos: 1,
      reason: 'Champions Cup Winners',
    };

    const state = makeMinimalState({
      year: 2027,
      startYear: 2026,
      universeMovements: [concacafMove, uefaMove],
    });

    const almanac = buildChampionsAlmanac(state, 'GER', ALL_CLUBS, false);
    const season2026 = almanac.find((s) => s.year === 2026);
    expect(season2026).toBeDefined();
    const uefaCl = season2026?.globalWinners.find((w) => w.competitionId === 'champions-cup');
    expect(uefaCl?.clubName).toBe('Madrid White');
    expect(uefaCl?.clubName).not.toBe('Monterrey United');
  });

  it('Champions Almanac does not credit a Club World Cup trophy as a National Team World Cup win', () => {
    const state = makeMinimalState({
      year: 2027,
      startYear: 2026,
      trophyHistory: [{ year: 2026, name: 'Club World Cup', clubName: 'Test FC' }] as any,
      worldCupCampaigns: [],
      history: [
        {
          year: 2026,
          clubId: 999001,
          clubName: 'Test FC',
          country: 'GER',
          tier: 1,
          pos: 1,
          pts: 78,
          ovr: 85,
          trophiesThisYear: { bl: 1, cwc: 1 },
        } as any,
      ],
    });

    const almanac = buildChampionsAlmanac(state, 'GER', ALL_CLUBS, false);
    const season2026 = almanac.find((s) => s.year === 2026);
    const wcEntry = season2026?.globalWinners.find((w) => w.competitionId === 'world-cup');
    expect(wcEntry).toBeDefined();
    expect(wcEntry?.isUserClub).toBe(false);
  });

  it('universeMovements UEFA Champions Cup backfill is not suppressed by a CONCACAF Champions Cup winner', () => {
    const concacafMove: UniverseMovement = {
      id: 'move-concacaf-only-2026',
      year: 2026,
      clubId: 7771,
      clubName: 'LA Galaxy',
      country: 'USA',
      fromTier: 1,
      toTier: 1,
      fromLeagueName: 'Concacaf Champions Cup',
      toLeagueName: 'Champions',
      type: 'cup_champion',
      pos: 1,
      reason: 'Concacaf Winners',
    };
    const state = makeMinimalState({
      year: 2027,
      startYear: 2026,
      universeMovements: [concacafMove],
    });

    const unified = getAllUniverseMovements(state, ALL_CLUBS);
    const uefaCl2026 = unified.find(
      (m) => m.year === 2026 && m.type === 'cup_champion' && m.fromLeagueName === 'Champions Cup'
    );
    expect(uefaCl2026).toBeDefined();
    expect(uefaCl2026?.clubName).not.toBe('LA Galaxy');
  });

  it('simulateAiLeagues deduplicates AFC/CONCACAF cup winners and labels non-English League Cups accurately', () => {
    const sampleClubs: Club[] = ['JPN', 'SCO', 'USA', 'GER', 'BRA'].flatMap((code) =>
      ALL_CLUBS.filter((c) => (c.country || '').toUpperCase() === code && c.tier === 1).slice(0, 8)
    );
    const jpnClubs = sampleClubs.filter((c) => c.country === 'JPN' && c.tier === 1);
    const scoClubs = sampleClubs.filter((c) => c.country === 'SCO' && c.tier === 1);
    expect(jpnClubs.length).toBeGreaterThanOrEqual(2);
    expect(scoClubs.length).toBeGreaterThanOrEqual(2);

    const resJpn = simulateAiLeagues(sampleClubs, jpnClubs[0].id, 2026, [], 1, {
      cupWinners: [{ cupId: 'cl', winnerId: jpnClubs[1].id, winnerName: jpnClubs[1].name }],
    });
    const jpnMoves: UniverseMovement[] = (resJpn as any).movements || [];
    const afcWinners = jpnMoves.filter(
      (m) => m.type === 'cup_champion' && /afc|asian.*champion/i.test(m.fromLeagueName || '')
    );
    expect(afcWinners.length).toBe(1);
    expect(afcWinners[0].clubName).toBe(jpnClubs[1].name);

    const resSco = simulateAiLeagues(sampleClubs, scoClubs[0].id, 2026, [], 1, {
      cupWinners: [{ cupId: 'efl', winnerId: scoClubs[1].id, winnerName: scoClubs[1].name }],
    });
    const scoMoves: UniverseMovement[] = (resSco as any).movements || [];
    const scoEfl = scoMoves.find((m) => m.type === 'cup_champion' && m.clubId === scoClubs[1].id);
    expect(scoEfl?.fromLeagueName).toBe('Scottish League Cup');
  });

  it('coachEngine generates authentic surnames for KOR, BOL, PAR, CHI, CRO, GRE instead of English fallback', () => {
    const englishSurnames = new Set([
      'Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies',
      'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green',
      'Hall', 'Wood', 'Jackson', 'Clarke',
    ]);
    for (const country of ['KOR', 'BOL', 'PAR', 'CHI', 'CRO', 'GRE', 'NED', 'BEL']) {
      for (let i = 0; i < 20; i++) {
        const fullName = generateName(country, false);
        const parts = fullName.split(' ');
        const surname = parts[parts.length - 1];
        expect(englishSurnames.has(surname)).toBe(false);
      }
    }
  });

  it('pressureEngine does not trigger relegation_spiral in closed Tier-1-only leagues or bottom tiers', () => {
    const ausState = makeMinimalState({
      club: {
        id: 8801,
        name: 'Sydney FC',
        country: 'AUS',
        tier: 1,
        baseOvr: 70,
        ovr: 70,
        morale: 65,
        stadium: 20000,
        fanBase: 15000,
      } as any,
    });
    const ausAssessment = evaluatePerformancePressure(ausState, {
      phase: 'mid',
      pos: 17,
      pts: 14,
      matchdaysPlayed: 17,
    });
    expect(ausAssessment.scenario).not.toBe('relegation_spiral');
    expect(ausAssessment.headline).not.toContain('RELEGATION');

    const engBottomState = makeMinimalState({
      club: {
        id: 8802,
        name: 'Bottom Tier FC',
        country: 'ENG',
        tier: 7,
        baseOvr: 42,
        ovr: 42,
        morale: 65,
        stadium: 2500,
        fanBase: 1500,
      } as any,
    });
    const engBottomAssessment = evaluatePerformancePressure(engBottomState, {
      phase: 'mid',
      pos: 18,
      pts: 10,
      matchdaysPlayed: 17,
    });
    expect(engBottomAssessment.scenario).not.toBe('relegation_spiral');
  });

  it('subLedgerEngine caps rolling window to strictly 3 seasons even when 4 records fall in year >= currentYear - 3', () => {
    const state = makeMinimalState({
      year: 2029,
      academySpendHistory: [
        { year: 2029, spendK: 300, graduatesCount: 2 },
        { year: 2028, spendK: 300, graduatesCount: 2 },
        { year: 2027, spendK: 300, graduatesCount: 2 },
        { year: 2026, spendK: 300, graduatesCount: 2 },
      ],
    });
    const report = calculateAcademySubLedger(state);
    expect(report.rollingSpend3YrK).toBe(900);
    expect(report.totalGraduates3Yr).toBe(6);
  });

  it('dynastyMilestonesEngine normalizes country names and counts supercupHistory wins', () => {
    const state = makeMinimalState({
      totals: { trophies: 0 } as any,
      supercupHistory: [
        {
          year: 2026,
          cupName: 'Supercup',
          opponentName: 'Rival FC',
          opponentId: 2,
          opponentColor: '#000',
          opponentOvr: 80,
          ourScore: 2,
          oppScore: 1,
          won: true,
          prizeK: 500,
        },
      ],
      history: [
        { year: 2026, clubName: 'Club A', country: 'England', tier: 1, pos: 1, trophiesThisYear: { bl: 1 } } as any,
        { year: 2027, clubName: 'Club A', country: 'ENG', tier: 1, pos: 1, trophiesThisYear: { bl: 1 } } as any,
      ],
    });
    const summary = evaluateTrophyHunterMilestones(state);
    expect(summary.distinctTitleCountries).toEqual(['ENG']);
    const crossBorder = summary.milestones.find((m) => m.id === 'multi_country_conqueror');
    expect(crossBorder?.unlocked).toBe(false);
    const collector = summary.milestones.find((m) => m.id === 'double_digit');
    expect(collector?.progressLabel).toBe('3 / 10');
  });

  it('boardVisionEngine uses Continental copy, handles Academy Level 5, and credits EFL Cup wins', () => {
    const braClub = {
      id: 7001,
      name: 'Rio FC',
      country: 'BRA',
      tier: 1,
      baseOvr: 78,
      academyLevel: 5,
      medicalLevel: 4,
      stadium: 60000,
    } as Club;

    for (let i = 0; i < 30; i++) {
      const vision = generateBoardVision(braClub, 2026);
      expect(vision.title).not.toContain('European');
      expect(vision.description).not.toContain('European');
      if (vision.type === 'youth_factory') {
        const alreadyDoneUpgrade = vision.objectives.find(
          (o) => o.type === 'upgrade_facilities' && o.currentValue >= o.targetValue
        );
        expect(alreadyDoneUpgrade).toBeUndefined();
      }
    }

    const cupVision: BoardVision = {
      id: 'vis_test_efl',
      type: 'continental_ascendance',
      title: '2-Year Continental Sprint',
      description: 'Test vision',
      startYear: 2026,
      durationYears: 2,
      currentYearOfVision: 1,
      status: 'active',
      objectives: [
        {
          id: 'obj_cont_final',
          desc: 'Reach a cup final',
          targetValue: 1,
          currentValue: 0,
          unit: 'Finals',
          type: 'continental_final',
        },
      ],
      reward: { budgetBonus: 1000, trustBonus: 10, immunityBonus: 0, skillPointsBonus: 5, desc: 'Test' },
      penalty: { ultimatum: false, trustPenalty: 10, desc: 'Test' },
    };

    const updated = updateBoardVisionSeasonEnd(cupVision, {
      pos: 5,
      tier: 1,
      baseOvr: 80,
      academyLevel: 5,
      isInDebt: false,
      isRelegated: false,
      isPromoted: false,
      qualifiedEuro: false,
      madeCupFinal: false,
      fanbaseGrowthPct: 0,
      trophiesWon: { efl: 1 },
      graduatedYouthCount: 0,
      facilitiesUpgradedThisSeason: 0,
      netTransferProfitK: 0,
    });
    const finalObj = updated.updatedVision.objectives.find((o) => o.type === 'continental_final');
    expect(finalObj?.currentValue).toBe(1);
  });

  it('transferSagaEngine uses region-neutral copy and creditFacilityEngine aligns 25yr bond rate', () => {
    const braClub = { id: 7002, name: 'Sao Paulo FC', country: 'BRA', tier: 1, baseOvr: 80 } as Club;
    for (let i = 0; i < 25; i++) {
      const saga = generateTransferSaga(braClub, 'Corinthians');
      expect(saga.narrative).not.toContain('European');
    }

    const prog = getLoanProgress({
      principal: 50000,
      annualPayment: 3000,
      yearsLeft: 25,
      totalYears: 25,
      loanType: 'bond',
    });
    expect(prog?.interestRate).toBe(2.8);
  });

  it('clubProgressionEngine uses region-aware continental trophy names and prestigeTheme scopes Wembley to ENG', () => {
    const braClub = { id: 7010, name: 'Flamengo', country: 'BRA', tier: 1, baseOvr: 83 } as Club;
    const hist = calculateClubLeagueHistory(braClub, 2026, 2027, [
      {
        year: 2026,
        clubId: 7010,
        clubName: 'Flamengo',
        country: 'BRA',
        tier: 1,
        pos: 2,
        pts: 72,
        ovr: 83,
        trophiesThisYear: { cl: 1 },
      } as any,
    ]);
    expect(hist[0].trophyName).toBe('Copa Libertadores');

    const scoEflTheme = getCompetitionTheme('efl', 'SCO');
    expect(scoEflTheme.competitionTypeLabel.en).not.toContain('Wembley');
    const engEflTheme = getCompetitionTheme('efl', 'ENG');
    expect(engEflTheme.competitionTypeLabel.en).toContain('Wembley');

    const korCupTheme = getCompetitionTheme('dfb', 'KOR');
    expect(korCupTheme.badgeLabel.en).toBe('Korea Cup');
    const supercupTheme = getCompetitionTheme('supercup', 'GER');
    expect(supercupTheme.id).not.toBe('dfb');
  });
});
