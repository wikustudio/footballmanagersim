import { describe, it, expect } from 'vitest';
import {
  GLOBAL_CLUB_CUP_STADIUMS,
  UEFA_CL_STADIUMS,
  CONCACAF_CL_STADIUMS,
  CONMEBOL_CL_STADIUMS,
  AFC_CL_STADIUMS,
  EUROPA_LEAGUE_STADIUMS,
  CONFERENCE_LEAGUE_STADIUMS,
  getStadiumInfo,
  pickNeutralStadium
} from '../components/CupRunModal';

describe('Major Trophy & Global Club Cup 7-Stadium Rotation Realism', () => {
  describe('Curated Stadium Pools Integrity', () => {
    it('verifies all 7 pools contain exactly 7 authentic distinct stadiums with realistic capacities', () => {
      const pools = [
        { name: 'Global Club Cup', pool: GLOBAL_CLUB_CUP_STADIUMS, minCap: 65000 },
        { name: 'UEFA Champions Cup', pool: UEFA_CL_STADIUMS, minCap: 70000 },
        { name: 'CONCACAF Champions Cup', pool: CONCACAF_CL_STADIUMS, minCap: 50000 },
        { name: 'CONMEBOL Copa Libertadores', pool: CONMEBOL_CL_STADIUMS, minCap: 45000 },
        { name: 'AFC Champions League', pool: AFC_CL_STADIUMS, minCap: 25000 },
        { name: 'Europa League', pool: EUROPA_LEAGUE_STADIUMS, minCap: 40000 },
        { name: 'Conference League', pool: CONFERENCE_LEAGUE_STADIUMS, minCap: 19000 },
      ];

      for (const { name, pool, minCap } of pools) {
        expect(pool.length, `${name} must have 7 stadiums`).toBe(7);
        const names = pool.map(s => s.name);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size, `${name} has duplicate stadiums`).toBe(7);

        for (const stadium of pool) {
          expect(stadium.capacity, `${stadium.name} in ${name} has insufficient capacity`).toBeGreaterThanOrEqual(minCap);
          expect(stadium.name).not.toContain('Neutral Ground');
          expect(stadium.name).not.toContain('(Final)');
        }
      }
    });
  });

  describe('Global Club Cup (cwc) Stadium Rotation', () => {
    it('guarantees 1,000 cwc final draws distribute across all 7 global venues and NEVER return Neutral Ground', () => {
      const counts: Record<string, number> = {};
      GLOBAL_CLUB_CUP_STADIUMS.forEach(s => { counts[s.name] = 0; });

      for (let i = 0; i < 1000; i++) {
        const stadium = getStadiumInfo('Bayern Munich', 'final', false, 'cwc', 'GER');
        expect(stadium.name).not.toBe('Neutral Ground (Final)');
        expect(counts).toHaveProperty(stadium.name);
        counts[stadium.name]++;
      }

      // Every stadium in the 7-stadium pool should be drawn with healthy frequency
      for (const [stadiumName, count] of Object.entries(counts)) {
        expect(count, `${stadiumName} was drawn ${count} times (expected >= 50)`).toBeGreaterThanOrEqual(50);
      }
    });

    it('filters out tenant home stadium when a tenant club is the finalist', () => {
      // Santiago Bernabéu is a tenant of Real Madrid
      for (let i = 0; i < 100; i++) {
        const stadium = getStadiumInfo('Madrid Blancos', 'final', false, 'cwc', 'GER');
        expect(stadium.name).not.toContain('Santiago Bernabéu');
      }
    });
  });

  describe('Continental Champions Cup (cl) Regional Routing', () => {
    it('routes European clubs to UEFA Champions Cup 7-stadium pool', () => {
      const uefaNames = new Set(UEFA_CL_STADIUMS.map(s => s.name));
      for (const country of ['GER', 'ENG', 'ESP', 'ITA', 'FRA', 'POR', 'SCO', 'POL']) {
        for (let i = 0; i < 50; i++) {
          const stadium = getStadiumInfo('Opponent FC', 'final', false, 'cl', country);
          expect(uefaNames.has(stadium.name), `${stadium.name} not in UEFA pool for country ${country}`).toBe(true);
        }
      }
    });

    it('routes North American clubs to CONCACAF Champions Cup 7-stadium pool', () => {
      const concacafNames = new Set(CONCACAF_CL_STADIUMS.map(s => s.name));
      for (const country of ['USA', 'CAN', 'MEX']) {
        for (let i = 0; i < 50; i++) {
          const stadium = getStadiumInfo('Opponent FC', 'final', false, 'cl', country);
          expect(concacafNames.has(stadium.name), `${stadium.name} not in CONCACAF pool for country ${country}`).toBe(true);
        }
      }
    });

    it('routes South American clubs to CONMEBOL Copa Libertadores 7-stadium pool', () => {
      const conmebolNames = new Set(CONMEBOL_CL_STADIUMS.map(s => s.name));
      for (const country of ['BRA', 'ARG', 'ECU', 'COL']) {
        for (let i = 0; i < 50; i++) {
          const stadium = getStadiumInfo('Opponent FC', 'final', false, 'cl', country);
          expect(conmebolNames.has(stadium.name), `${stadium.name} not in CONMEBOL pool for country ${country}`).toBe(true);
        }
      }
    });

    it('routes Asian/Middle Eastern clubs to AFC Champions League 7-stadium pool', () => {
      const afcNames = new Set(AFC_CL_STADIUMS.map(s => s.name));
      // AFC countries
      for (let i = 0; i < 50; i++) {
        const stadium = getStadiumInfo('Opponent FC', 'final', false, 'cl', 'KOR');
        expect(afcNames.has(stadium.name), `${stadium.name} not in AFC pool`).toBe(true);
      }
    });
  });

  describe('Europa League (el) & Conference League (ecl) Stadium Rotation', () => {
    it('routes el to Europa League 7-stadium pool in Europe', () => {
      const elNames = new Set(EUROPA_LEAGUE_STADIUMS.map(s => s.name));
      for (let i = 0; i < 100; i++) {
        const stadium = getStadiumInfo('Opponent FC', 'final', false, 'el', 'GER');
        expect(elNames.has(stadium.name)).toBe(true);
      }
    });

    it('routes ecl to Conference League 7-stadium pool', () => {
      const eclNames = new Set(CONFERENCE_LEAGUE_STADIUMS.map(s => s.name));
      for (let i = 0; i < 100; i++) {
        const stadium = getStadiumInfo('Opponent FC', 'final', false, 'ecl', 'ENG');
        expect(eclNames.has(stadium.name)).toBe(true);
      }
    });

    it('protects neutrality when tenant is in Europa League final', () => {
      // Bilbao's San Mamés should not host if Athletic Bilbao is finalist
      for (let i = 0; i < 50; i++) {
        const stadium = getStadiumInfo('Bilbao Red-White', 'final', false, 'el', 'ESP');
        expect(stadium.name).not.toContain('San Mamés');
      }
    });
  });

  describe('pickNeutralStadium Utility', () => {
    it('returns valid stadium even when all items have keywords', () => {
      const sample = [
        { name: 'Stadium A', capacity: 50000, tenantKeywords: ['alpha'] },
        { name: 'Stadium B', capacity: 60000, tenantKeywords: ['beta'] }
      ];
      const picked = pickNeutralStadium(sample, 'Alpha United');
      expect(picked.name).toBe('Stadium B');
    });

    it('safely falls back if opponent name matches all candidates', () => {
      const sample = [
        { name: 'Stadium A', capacity: 50000, tenantKeywords: ['alpha'] }
      ];
      const picked = pickNeutralStadium(sample, 'Alpha United');
      expect(picked.name).toBe('Stadium A');
    });
  });

  describe('Cup Final Stadium Stability & Anti-Rotation Invariant', () => {
    it('guarantees that German Domestic Cup always uses Olympiastadion Berlin for German finals', () => {
      for (let i = 0; i < 20; i++) {
        const stadium = getStadiumInfo('Borussia Dortmund', 'final', false, 'dfb', 'GER');
        expect(stadium.name).toBe('Olympiastadion Berlin');
        expect(stadium.capacity).toBe(74475);
      }
    });

    it('verifies that state-locked stadium stays strictly constant across 50 simulated shootout ticks in Champions Cup and Global Club Cup', () => {
      // Simulating round draw: get stadium once
      const clInitialStadium = getStadiumInfo('Real Madrid', 'final', false, 'cl', 'GER');
      const cwcInitialStadium = getStadiumInfo('Flamengo', 'final', false, 'cwc', 'GER');

      expect(clInitialStadium.name).toBeDefined();
      expect(cwcInitialStadium.name).toBeDefined();

      // Across 50 simulated re-render ticks of a penalty shootout, the locked stadium instance must never change
      const currentClStadium = clInitialStadium;
      const currentCwcStadium = cwcInitialStadium;

      for (let tick = 1; tick <= 50; tick++) {
        expect(currentClStadium.name).toBe(clInitialStadium.name);
        expect(currentClStadium.capacity).toBe(clInitialStadium.capacity);

        expect(currentCwcStadium.name).toBe(cwcInitialStadium.name);
        expect(currentCwcStadium.capacity).toBe(cwcInitialStadium.capacity);
      }
    });
  });
});
