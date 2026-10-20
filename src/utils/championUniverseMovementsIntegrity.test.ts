import { describe, it, expect } from 'vitest';
import { getAllUniverseMovements, getHeadlineCategory } from './universeMovements';
import { GameState, UniverseMovement } from '../types';
import { ALL_CLUBS } from '../data/clubsData';

describe('Champion Universe Movements Integrity', () => {
  it('strictly ensures champions with corrupted relegation tags are healed to title_won', () => {
    const mockState: Partial<GameState> = {
      year: 2026,
      club: {
        id: 1,
        name: 'Munich Red',
        tier: 1,
        baseOvr: 88,
        color: '#dc2626',
        stadium: 75000,
        country: 'GER'
      } as any,
      history: [
        {
          year: 2025,
          clubName: 'Munich Red',
          clubId: 1,
          color: '#dc2626',
          leagueTag: '1. BL',
          leagueCss: 'bg-red-500',
          ovr: 88,
          tier: 1,
          pos: 1,
          pts: 82,
          wins: 25,
          draws: 7,
          losses: 2,
          gf: 85,
          ga: 25,
          att: 75000,
          util: 100,
          stadiumCapacity: 75000,
          trophyIcons: '🏆',
          trophiesThisYear: { bl: 1 }
        } as any
      ],
      universeMovements: [
        // Intentionally corrupted test input: club was champion but mistakenly labeled relegation
        {
          id: 'test-bad-champ',
          year: 2025,
          clubId: 1,
          clubName: 'Munich Red',
          country: 'GER',
          fromTier: 1,
          toTier: 1,
          fromLeagueName: '1. Bundesliga',
          toLeagueName: '1. Bundesliga',
          type: 'relegation',
          pos: 1,
          reason: '1. Bundesliga Champions · Domestic Title'
        } as UniverseMovement,
        // AI lower division champion with erroneous relegation tag
        {
          id: 'test-bad-ai-champ',
          year: 2025,
          clubId: 17,
          clubName: 'FC St. Pauli',
          country: 'GER',
          fromTier: 2,
          toTier: 1,
          fromLeagueName: '2. Bundesliga',
          toLeagueName: '1. Bundesliga',
          type: 'relegation',
          pos: 1,
          reason: 'Champions · Direct Promotion'
        } as UniverseMovement
      ]
    };

    const movements = getAllUniverseMovements(mockState as GameState, ALL_CLUBS);

    // Verify Munich Red
    const munichMoves = movements.filter(m => m.year === 2025 && (m.clubId === 1 || m.clubName === 'Munich Red'));
    expect(munichMoves.length).toBeGreaterThan(0);
    munichMoves.forEach(m => {
      expect(m.type, 'Champion movement must never be typed as relegation').not.toBe('relegation');
      const cat = getHeadlineCategory(m);
      expect(cat.label, 'Champion headline category must never be RELEGATED').not.toContain('RELEGAT');
    });

    // Verify St. Pauli
    const stPauliMoves = movements.filter(m => m.year === 2025 && m.clubName === 'FC St. Pauli');
    expect(stPauliMoves.length).toBeGreaterThan(0);
    stPauliMoves.forEach(m => {
      expect(m.type, 'St Pauli champion movement must not be relegation').not.toBe('relegation');
      const cat = getHeadlineCategory(m);
      expect(cat.label, 'St Pauli headline category must not be RELEGATED').not.toContain('RELEGAT');
    });
  });

  it('guarantees getHeadlineCategory never yields RELEGATED for any champion, winner, or pos 1', () => {
    const champMove: UniverseMovement = {
      id: 'move-test-1',
      year: 2026,
      clubId: 10,
      clubName: 'Hamburg Blue',
      country: 'GER',
      fromTier: 2,
      toTier: 1,
      fromLeagueName: '2. Bundesliga',
      toLeagueName: '1. Bundesliga',
      type: 'relegation' as any, // corrupted
      pos: 1,
      reason: 'Champions · Promoted to 1. Bundesliga'
    };

    const cat = getHeadlineCategory(champMove);
    expect(cat.label).not.toContain('RELEGAT');
    expect(cat.label).toBe('DIVISION CHAMPIONS');
  });

  it('correctly labels legitimate bottom-finishers as RELEGATED', () => {
    const bottomMove: UniverseMovement = {
      id: 'move-test-bottom',
      year: 2026,
      clubId: 99,
      clubName: 'Bottom FC',
      country: 'GER',
      fromTier: 1,
      toTier: 2,
      fromLeagueName: '1. Bundesliga',
      toLeagueName: '2. Bundesliga',
      type: 'relegation',
      pos: 18,
      reason: 'Direct Relegation to 2. Bundesliga'
    };

    const cat = getHeadlineCategory(bottomMove);
    expect(cat.label).toBe('RELEGATION DRAMA');
  });

  it('correctly labels #2 continental qualifiers with CONTINENTAL QUALIFICATION and not CHAMPIONS', () => {
    const qualMove: UniverseMovement = {
      id: 'move-test-can-2',
      year: 2026,
      clubId: 501,
      clubName: 'HFX Wanderers FC',
      country: 'CAN',
      fromTier: 1,
      toTier: 1,
      fromLeagueName: 'Canadian Premier League',
      toLeagueName: 'Continental Stage',
      type: 'continental_qual',
      pos: 2,
      reason: 'Finished Position #2 (48 pts) · CONCACAF Champions Cup Qualification'
    };

    const cat = getHeadlineCategory(qualMove);
    expect(cat.label).not.toContain('CHAMPION');
    expect(cat.label).toBe('CONCACAF QUALIFICATION');
  });

  it('synthesizes CONCACAF qualification for Canadian clubs finishing in top 4 without claiming title', () => {
    const mockState: Partial<GameState> = {
      year: 2026,
      club: {
        id: 501,
        name: 'HFX Wanderers FC',
        tier: 1,
        country: 'CAN'
      } as any,
      history: [
        {
          year: 2025,
          clubName: 'HFX Wanderers FC',
          clubId: 501,
          tier: 1,
          pos: 2,
          pts: 48,
          country: 'CAN'
        } as any
      ],
      universeMovements: []
    };

    const movements = getAllUniverseMovements(mockState as GameState, ALL_CLUBS);
    const hfxMove = movements.find(m => m.year === 2025 && (m.clubId === 501 || m.clubName === 'HFX Wanderers FC'));
    expect(hfxMove).toBeDefined();
    expect(hfxMove?.type).toBe('continental_qual');
    expect(hfxMove?.reason).toContain('CONCACAF Champions Cup Qualification');
    expect(hfxMove?.reason).not.toContain('European');
  });
});
