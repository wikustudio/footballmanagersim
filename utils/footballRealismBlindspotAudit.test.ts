import { describe, it, expect } from 'vitest';
import { simulateAiLeagues } from '../engine/simulateAiLeagues';
import { isReserveClub, getMaxTier, calculateClubFinancials, getLeagueInfo } from '../data/gameConstants';
import { ALL_CLUBS as CLUBS } from '../data/clubsData';
import { Club } from '../types';

describe('Football Realism Blindspot Audit & Stress Test', () => {
  describe('1. Standings Mathematical Integrity & Draw Realism', () => {
    it('verifies 34-match mathematical invariants across 20 multi-country seasons', () => {
      let testClubs: Club[] = CLUBS.map(c => ({ ...c }));
      const userClubId = testClubs[0]?.id || 1;

      for (let season = 1; season <= 20; season++) {
        const year = 2024 + season;
        const resultDb = simulateAiLeagues(testClubs, userClubId, year, []);
        const standingsArchive = (resultDb as any).standingsArchive as Record<number, any[]>;
        
        expect(standingsArchive).toBeDefined();

        Object.entries(standingsArchive).forEach(([tierStr, table]) => {
          const tier = Number(tierStr);
          if (!Array.isArray(table) || table.length < 4) return;

          let totalDraws = 0;
          let prevPts = 999;

          table.forEach((row, idx) => {
            // 1. Matches Played invariant
            expect(row.mp, `Season ${season} Tier ${tier} ${row.name} MP`).toBe(34);

            // 2. Win / Draw / Loss match balance
            const matchSum = row.w + row.d + row.l;
            expect(matchSum, `Season ${season} Tier ${tier} ${row.name} W+D+L`).toBe(34);

            // 3. Points formula: W * 3 + D === Pts
            const expectedPts = row.w * 3 + row.d;
            expect(row.pts, `Season ${season} Tier ${tier} ${row.name} W*3+D`).toBe(expectedPts);

            // 4. Goal Difference formula: gf - ga === gd
            const rawGd = row.gf - row.ga;
            const parsedGd = parseInt(row.gd, 10);
            expect(parsedGd, `Season ${season} Tier ${tier} ${row.name} GD`).toBe(rawGd);

            // 5. Monotonic non-increasing points ordering
            expect(row.pts, `Season ${season} Tier ${tier} rank ${idx + 1} monotonic points`).toBeLessThanOrEqual(prevPts);
            prevPts = row.pts;

            // 6. Draw realism: No team should realistically have 0 draws over 34 matches
            expect(row.d, `Season ${season} Tier ${tier} ${row.name} draws > 0`).toBeGreaterThanOrEqual(1);
            totalDraws += row.d;
          });

          // 7. League-wide draw distribution check (~10% to 40% of total matches drawn)
          const totalMatches = (table.length * 34) / 2;
          const drawnMatches = totalDraws / 2;
          const drawPercentage = (drawnMatches / totalMatches) * 100;
          expect(drawPercentage, `Season ${season} Tier ${tier} league draw percentage`).toBeGreaterThanOrEqual(10);
          expect(drawPercentage, `Season ${season} Tier ${tier} league draw percentage`).toBeLessThanOrEqual(40);
        });

        testClubs = resultDb.map(c => ({ ...c }));
      }
    });
  });

  describe('2. Reserve Club (B-Team) Promotion Safeguards', () => {
    it('strictly prevents reserve clubs from ever promoting into Tier 1 or Tier 2', () => {
      // Create high-rated B-teams in Tier 3
      const mockClubs: Club[] = [
        // Tier 1 clubs
        { id: 101, name: 'FC Bayern Munich', tier: 1, country: 'GER', baseOvr: 85, stadium: 50000, color: '#f00', isReserve: false },
        { id: 102, name: 'Borussia Dortmund', tier: 1, country: 'GER', baseOvr: 84, stadium: 50000, color: '#0f0', isReserve: false },
        { id: 103, name: 'RB Leipzig', tier: 1, country: 'GER', baseOvr: 83, stadium: 50000, color: '#00f', isReserve: false },
        { id: 104, name: 'Bayer Leverkusen', tier: 1, country: 'GER', baseOvr: 82, stadium: 50000, color: '#ff0', isReserve: false },

        // Tier 2 clubs
        { id: 201, name: 'Hamburger SV', tier: 2, country: 'GER', baseOvr: 75, stadium: 25000, color: '#f0f', isReserve: false },
        { id: 202, name: 'Schalke 04', tier: 2, country: 'GER', baseOvr: 74, stadium: 25000, color: '#0ff', isReserve: false },
        { id: 203, name: 'Fortuna Duesseldorf', tier: 2, country: 'GER', baseOvr: 73, stadium: 25000, color: '#fff', isReserve: false },
        { id: 204, name: 'Hannover 96', tier: 2, country: 'GER', baseOvr: 72, stadium: 25000, color: '#aaa', isReserve: false },

        // Tier 3 clubs including overpowered B-teams
        { id: 301, name: 'Bayern Munich II', tier: 3, country: 'GER', baseOvr: 99, stadium: 15000, color: '#f00', isReserve: true },
        { id: 302, name: 'Borussia Dortmund II', tier: 3, country: 'GER', baseOvr: 98, stadium: 15000, color: '#ff0', isReserve: true },
        { id: 303, name: 'Rot-Weiss Essen', tier: 3, country: 'GER', baseOvr: 68, stadium: 10000, color: '#333', isReserve: false },
        { id: 304, name: 'Dynamo Dresden', tier: 3, country: 'GER', baseOvr: 67, stadium: 10000, color: '#555', isReserve: false },
      ];

      let currentClubs = [...mockClubs];

      // Simulate 10 promotion seasons
      for (let yr = 2025; yr <= 2035; yr++) {
        const nextClubs = simulateAiLeagues(currentClubs, 9999, yr, []);
        
        const tier1Clubs = nextClubs.filter(c => c.tier === 1);
        const tier2Clubs = nextClubs.filter(c => c.tier === 2);

        // Verify that neither Bayern II nor Dortmund II ever reached Tier 1 or Tier 2
        tier1Clubs.forEach(c => {
          expect(isReserveClub(c.name), `Club ${c.name} in Tier 1 must NOT be a reserve club`).toBe(false);
        });
        tier2Clubs.forEach(c => {
          expect(isReserveClub(c.name), `Club ${c.name} in Tier 2 must NOT be a reserve club`).toBe(false);
        });

        currentClubs = nextClubs.map(c => ({ ...c }));
      }
    });

    it('correctly identifies Spanish, Dutch, and French reserve club naming variants', () => {
      expect(isReserveClub('Bayern Munich II')).toBe(true);
      expect(isReserveClub('Borussia Dortmund II')).toBe(true);
      expect(isReserveClub('VfB Stuttgart II')).toBe(true);
      expect(isReserveClub('Real Madrid Castilla')).toBe(true);
      expect(isReserveClub('Barcelona Atlètic')).toBe(true);
      expect(isReserveClub('Athletic Club B')).toBe(true);
      expect(isReserveClub('Jong Ajax')).toBe(true);
      expect(isReserveClub('Jong PSV')).toBe(true);
      expect(isReserveClub('Chelsea U21')).toBe(true);
      expect(isReserveClub('Arsenal U23')).toBe(true);

      // Non-reserves must return false
      expect(isReserveClub('Bayern Munich')).toBe(false);
      expect(isReserveClub('Borussia Dortmund')).toBe(false);
      expect(isReserveClub('Athletic Club')).toBe(false);
      expect(isReserveClub('Atletico Madrid')).toBe(false);
      expect(isReserveClub('Tier 2 Club')).toBe(false);
    });
  });

  describe('3. Pyramid Floor & Single-Tier Nation Mechanics', () => {
    it('ensures lowest-tier clubs in Germany (Tier 11) never drop to non-existent Tier 12', () => {
      const germanClubs = CLUBS.filter(c => (c.country || 'GER') === 'GER');
      const maxGerTier = getMaxTier('GER', germanClubs);
      expect(maxGerTier).toBeGreaterThanOrEqual(3);

      const bottomTierClubs = germanClubs.filter(c => c.tier === maxGerTier);
      expect(bottomTierClubs.length).toBeGreaterThan(0);

      // Simulate AI leagues for Germany
      const simulated = simulateAiLeagues(germanClubs, 99999, 2026, []);
      
      // Ensure no club has tier > maxGerTier
      simulated.forEach(c => {
        expect(c.tier, `Club ${c.name} tier cannot exceed max tier ${maxGerTier}`).toBeLessThanOrEqual(maxGerTier);
      });
    });

    it('ensures single-tier nations (e.g. Wales) never generate relegation movements', () => {
      const walClubs: Club[] = [
        { id: 801, name: 'The New Saints', tier: 1, country: 'WAL', baseOvr: 60, stadium: 2000, color: '#0f0' },
        { id: 802, name: 'Connahs Quay', tier: 1, country: 'WAL', baseOvr: 58, stadium: 1500, color: '#f00' },
        { id: 803, name: 'Bala Town', tier: 1, country: 'WAL', baseOvr: 56, stadium: 1200, color: '#00f' },
        { id: 804, name: 'Penybont', tier: 1, country: 'WAL', baseOvr: 55, stadium: 1000, color: '#ff0' },
      ];

      const simulated = simulateAiLeagues(walClubs, 99999, 2026, []);
      const movements: any[] = (simulated as any).movements || [];

      const walRelegations = movements.filter(m => m.country === 'WAL' && m.type === 'relegation');
      expect(walRelegations.length, 'Wales must have zero club relegations').toBe(0);

      simulated.forEach(c => {
        expect(c.tier, `Wales club ${c.name} must remain in Tier 1`).toBe(1);
      });
    });
  });

  describe('4. Financial Scaling Realism & Infrastructure Costs', () => {
    it('verifies lower tier clubs (Tier 8-11) have sustainable operational costs matching grassroots football', () => {
      const grassrootsClub: Club = {
        id: 999,
        name: 'FC Dorfverein 1920',
        tier: 11,
        country: 'GER',
        baseOvr: 45,
        stadium: 800,
        fanBase: 400,
        academyLevel: 1,
        medicalLevel: 1,
        color: '#00f',
      };

      const financials = calculateClubFinancials({
        club: grassrootsClub,
        year: 2026,
        budget: 5000,
        skillPoints: 0,
        history: [],
      } as any);

      const leagueInfo = getLeagueInfo(11, 'GER');

      // Financial sanity checks for Tier 11:
      // 1. Operational expenses should be grassroots scaled
      expect(financials.wages, 'Tier 11 total operating expenses').toBeLessThan(50000);
      
      // 2. Ticket price should be grassroots-friendly (~€2 to €12)
      expect(leagueInfo.ticket, 'Tier 11 ticket price').toBeLessThanOrEqual(15);
      expect(leagueInfo.ticket, 'Tier 11 ticket price').toBeGreaterThanOrEqual(1);

      // 3. Facility operations must not instantly bankrupt the club
      expect(financials.academyOp, 'Tier 11 academy operating cost').toBeLessThan(10000);
      expect(financials.medicalOp, 'Tier 11 medical operating cost').toBeLessThan(10000);
    });

    it('verifies elite Tier 1 clubs scale up to multimillion-euro commercial profiles', () => {
      const eliteClub: Club = {
        id: 1,
        name: 'FC Bayern Munich',
        tier: 1,
        country: 'GER',
        baseOvr: 89,
        stadium: 75000,
        fanBase: 75000,
        academyLevel: 5,
        medicalLevel: 5,
        color: '#f00',
      };

      const financials = calculateClubFinancials({
        club: eliteClub,
        year: 2026,
        budget: 150000000,
        skillPoints: 10,
        history: [],
      } as any);

      const leagueInfo = getLeagueInfo(1, 'GER');

      // Tier 1 elite checks:
      expect(leagueInfo.ticket, 'Tier 1 elite ticket price').toBeGreaterThanOrEqual(25);
      expect(financials.matchdayIncomeK, 'Tier 1 matchday revenue (in thousands)').toBeGreaterThan(300);
      expect(financials.estRevenue, 'Tier 1 estimated revenue').toBeGreaterThan(20000);
    });
  });

  describe('5. League Info & Structural Consistency', () => {
    it('verifies every country has consistent tier names and valid configurations', () => {
      const countries = ['GER', 'ENG', 'ESP', 'ITA', 'FRA', 'USA', 'TUR', 'POR', 'SCO', 'ECU'];
      
      countries.forEach(country => {
        const maxTier = getMaxTier(country, 1);
        expect(maxTier).toBeGreaterThanOrEqual(1);

        for (let t = 1; t <= Math.min(maxTier, 4); t++) {
          const info = getLeagueInfo(t, country);
          expect(info.name, `Country ${country} Tier ${t} name`).toBeTruthy();
          expect(info.tag, `Country ${country} Tier ${t} tag`).toBeTruthy();
          expect(info.avgOvr, `Country ${country} Tier ${t} avgOvr`).toBeGreaterThan(30);
        }
      });
    });
  });
});
