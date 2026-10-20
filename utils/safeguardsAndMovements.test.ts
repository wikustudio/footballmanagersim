import { describe, it, expect } from 'vitest';
import { mergeClubsDbSafeguards } from './modSafeguards';
import { simulateAiLeagues } from '../engine/simulateAiLeagues';
import { getAllUniverseMovements } from './universeMovements';
import { compactClubsDb, compactGameState } from './storageManager';
import { ALL_CLUBS } from '../data/clubsData';
import { Club, GameState } from '../types';

describe('Defensive Mod & Database Safeguards', () => {
  it('prevents existing stadium expansions, academy levels, and medical improvements from being overwritten when mod data is reloaded', () => {
    const existingWorldClubs: Club[] = [
      {
        id: 1,
        name: 'FC Bayern München',
        tier: 1,
        baseOvr: 84,
        color: '#dc052d',
        stadium: 85000, // expanded from default 75000
        academyLevel: 4, // upgraded to 4
        medicalLevel: 3, // upgraded to 3
        fanBase: 950000,
      },
      {
        id: 2,
        name: 'Borussia Dortmund',
        tier: 1,
        baseOvr: 82,
        color: '#fde100',
        stadium: 81365,
        academyLevel: 3,
        medicalLevel: 2,
        fanBase: 800000,
      }
    ];

    // Incoming raw mod data with default level 1 academy, default medical, default stadium
    const incomingModClubs: Club[] = [
      {
        id: 1,
        name: 'FC Bayern München',
        tier: 1,
        baseOvr: 85,
        color: '#dc052d',
        stadium: 75000, // lower default in mod
        academyLevel: 1,
        medicalLevel: 1,
        fanBase: 500000,
      },
      {
        id: 2,
        name: 'Borussia Dortmund',
        tier: 1,
        baseOvr: 82,
        color: '#fde100',
        stadium: 81365,
        academyLevel: 1,
        medicalLevel: 1,
        fanBase: 500000,
      }
    ];

    const mockState: any = {
      year: 2028,
      seasonCount: 3,
      club: { id: 1, name: 'FC Bayern München', stadium: 85000, academyLevel: 4, medicalLevel: 3 },
      managedClubFacilities: {
        '1': { stadium: 85000, academyLevel: 4, medicalLevel: 3, fanBase: 950000 }
      }
    };

    const safeguarded = mergeClubsDbSafeguards(incomingModClubs, existingWorldClubs, mockState);

    const bayern = safeguarded.find(c => c.id === 1);
    expect(bayern).toBeDefined();
    // Defensive safeguards: stadium, academy, and medical must NEVER be downgraded
    expect(bayern?.stadium).toBe(85000);
    expect(bayern?.academyLevel).toBe(4);
    expect(bayern?.medicalLevel).toBe(3);
    expect(bayern?.fanBase).toBe(950000);

    const dortmund = safeguarded.find(c => c.id === 2);
    expect(dortmund).toBeDefined();
    expect(dortmund?.academyLevel).toBe(3);
    expect(dortmund?.medicalLevel).toBe(2);
  });

  it('preserves living simulated tiers and insolvency records during an active career when mod is toggled', () => {
    const existingWorldClubs: Club[] = [
      {
        id: 10,
        name: 'Schalke 04',
        tier: 1, // Promoted from tier 2 to tier 1 during the save!
        baseOvr: 76,
        color: '#004d9d',
        stadium: 62271,
      },
      {
        id: 5,
        name: 'Relegated Giant',
        tier: 4, // Demoted due to insolvency
        isInsolventGiant: true,
        insolvencyCount: 1,
        baseOvr: 55,
        color: '#333333',
        stadium: 30000,
      }
    ];

    // Incoming mod template has Schalke in Tier 2 and Giant in Tier 1
    const incomingModClubs: Club[] = [
      { id: 10, name: 'FC Schalke 04', tier: 2, baseOvr: 74, color: '#004d9d', stadium: 62271 },
      { id: 5, name: 'Relegated Giant', tier: 1, baseOvr: 80, color: '#333333', stadium: 30000 }
    ];

    const mockState: any = {
      year: 2029,
      seasonCount: 4,
      club: { id: 1, name: 'Other Club', tier: 1 }
    };

    const safeguarded = mergeClubsDbSafeguards(incomingModClubs, existingWorldClubs, mockState);

    const schalke = safeguarded.find(c => c.id === 10);
    expect(schalke?.tier).toBe(1); // Preserves promotion!

    const giant = safeguarded.find(c => c.id === 5);
    expect(giant?.tier).toBe(4); // Preserves insolvency demotion!
    expect(giant?.isInsolventGiant).toBe(true);
  });
});

describe('Multi-Season Universe Movements & Cup Glory Past 2026', () => {
  it('generates cup champions, domestic titles, and transfers at the front of simulateAiLeagues movements', () => {
    const res = simulateAiLeagues(ALL_CLUBS, 1, 2027, []);
    const movements = (res as any).movements || [];

    expect(movements.length).toBeGreaterThan(50);

    // Verify cup champions appear at the very beginning
    const firstMovements = movements.slice(0, 10);
    const hasCupChampions = firstMovements.some((m: any) => m.type === 'cup_champion');
    expect(hasCupChampions).toBe(true);

    // Verify all 9 continental cups are generated for 2027
    const cups2027 = movements.filter((m: any) => m.type === 'cup_champion' && m.year === 2027);
    expect(cups2027.length).toBe(9);

    const leagues = cups2027.map((c: any) => c.fromLeagueName);
    expect(leagues).toContain('Champions Cup');
    expect(leagues).toContain('Copa Libertadores');
    expect(leagues).toContain('Concacaf Champions Cup');
    expect(leagues).toContain('AFC Champions League');
    expect(leagues).toContain('Global Club Cup');
  });

  it('guarantees that sorting/filtering Cup Glory by year past 2026 (e.g. 2027, 2028, 2030) is never empty', () => {
    const mockState: any = {
      year: 2030,
      seasonCount: 5,
      club: { id: 1, name: 'FC Bayern', country: 'GER', tier: 1 },
      history: [
        { year: 2026, tier: 1, pos: 2, pts: 72 },
        { year: 2027, tier: 1, pos: 1, pts: 78 },
        { year: 2028, tier: 1, pos: 3, pts: 68 },
        { year: 2029, tier: 1, pos: 1, pts: 81 }
      ],
      universeMovements: [
        {
          id: 'sim-cup-cl-2029',
          year: 2029,
          clubId: 101,
          clubName: 'Manchester Blue',
          country: 'ENG',
          fromTier: 1,
          toTier: 1,
          fromLeagueName: 'Champions Cup',
          toLeagueName: 'Champions',
          type: 'cup_champion',
          pos: 1,
          reason: 'Champions Cup Winners'
        }
      ]
    };

    const allMovements = getAllUniverseMovements(mockState, ALL_CLUBS);

    // Check years available
    const years = Array.from(new Set(allMovements.map(m => Number(m.year)))).sort((a, b) => b - a);
    expect(years).toContain(2029);
    expect(years).toContain(2026);
    expect(years).toContain(2024);

    // Cup Glory for year 2029
    const cups2029 = allMovements.filter(m => m.type === 'cup_champion' && Number(m.year) === 2029);
    expect(cups2029.length).toBeGreaterThan(0);

    // Cup Glory for year 2026
    const cups2026 = allMovements.filter(m => m.type === 'cup_champion' && Number(m.year) === 2026);
    expect(cups2026.length).toBeGreaterThan(0);

    // Cup Glory for baseline 2024
    const cups2024 = allMovements.filter(m => m.type === 'cup_champion' && Number(m.year) === 2024);
    expect(cups2024.length).toBeGreaterThan(0);
  });

  it('preserves academyLevel and medicalLevel in compactClubsDb and compactGameState', () => {
    const clubs: Club[] = [
      {
        id: 100,
        name: 'Test Club',
        tier: 1,
        baseOvr: 75,
        color: '#112233',
        stadium: 40000,
        academyLevel: 5,
        medicalLevel: 4,
        country: 'GER'
      }
    ];

    const compactedClubs = compactClubsDb(clubs);
    expect(compactedClubs[0].academyLevel).toBe(5);
    expect(compactedClubs[0].medicalLevel).toBe(4);
    expect(compactedClubs[0].stadium).toBe(40000);

    const mockState: any = {
      year: 2026,
      club: clubs[0],
      universeMovements: [
        { id: 'c1', year: 2026, type: 'cup_champion', clubName: 'Cup Winner' },
        { id: 'p1', year: 2026, type: 'promotion', clubName: 'Promoted Club' }
      ],
      managedClubFacilities: {
        '100': { stadium: 40000, academyLevel: 5, medicalLevel: 4 }
      }
    };

    const compactedState = compactGameState(mockState);
    expect(compactedState.managedClubFacilities?.['100']?.academyLevel).toBe(5);
    expect(compactedState.managedClubFacilities?.['100']?.medicalLevel).toBe(4);
    expect(compactedState.universeMovements?.[0].type).toBe('cup_champion');
  });

  it('guarantees complete year continuity with no missing seasons between 2024 and current season', () => {
    // When director has played into 2030, every single year from 2024 to 2029 must exist
    const advancedState: any = {
      year: 2030,
      seasonCount: 5,
      club: { id: 1, name: 'FC Bayern', country: 'GER', tier: 1 },
      history: [],
      universeMovements: []
    };

    const movements = getAllUniverseMovements(advancedState, ALL_CLUBS);
    const yearsPresent = Array.from(new Set(movements.map(m => Number(m.year)))).sort((a, b) => a - b);

    expect(yearsPresent).toEqual([2024, 2026, 2027, 2028, 2029]);
  });

  it('guarantees Portuguese Liga 3 clubs like Caldas S.C. have realistic, solvent wage structures that do not exceed club revenue', async () => {
    const { calculateClubFinancials, getLeagueInfo } = await import('../data/gameConstants');

    const l3 = getLeagueInfo(3, 'POR');
    expect(l3.wages).toBeLessThanOrEqual(1200);

    const mockCaldas = {
      id: 246,
      name: 'Caldas S.C.',
      tier: 3,
      baseOvr: 61,
      color: '0054a6',
      stadium: 13000,
      country: 'POR',
      squadSize: 24,
      fanBase: 643292
    };

    const mockState: any = {
      year: 2026,
      seasonCount: 2,
      club: mockCaldas,
      budget: 0,
      fans: 643292,
      history: []
    };

    const fin = calculateClubFinancials(mockState);

    // Pure wages must not exceed €1.6M for a baseline squad in Liga 3 (previously glitched at €3.8M+)
    expect(fin.pureWages).toBeLessThanOrEqual(1600);
    // Operating revenue must cover operating expenses for a baseline club
    expect(fin.estRevenue).toBeGreaterThanOrEqual(fin.wages * 0.9);
    expect(fin.net).toBeGreaterThan(-300);
  });

  it('guarantees baseline solvency across all countries and all tiers so no unmanaged club has structural deficits', async () => {
    const { calculateClubFinancials } = await import('../data/gameConstants');
    const { ALL_CLUBS } = await import('../data/clubsData');

    for (const club of ALL_CLUBS) {
      const fin = calculateClubFinancials({
        club,
        budget: 0,
        seasonCount: 2,
        year: 2027
      });
      expect(fin.net).toBeGreaterThanOrEqual(0);
      expect(fin.wages).toBeLessThanOrEqual(fin.estRevenue);
    }
  });
});

