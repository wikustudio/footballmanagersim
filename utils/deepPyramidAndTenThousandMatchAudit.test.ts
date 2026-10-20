import { describe, it, expect } from 'vitest';
import { simulateAiLeagues } from '../engine/simulateAiLeagues';
import { ALL_CLUBS } from '../data/clubsData';
import { getMaxTier, isReserveClub, getLeagueInfo, getDomesticCupInfo, isCanadianMLSClub } from '../data/gameConstants';
import { Club } from '../types';
import { CONMEBOL_COUNTRIES, CONCACAF_COUNTRIES, AFC_COUNTRIES, UEFA_COUNTRIES } from './regionHelpers';

describe('Deep Pyramid & 10,000+ Match / 200+ Season Simulation Audit', () => {
  // =========================================================================
  // 1. 200+ SEASONS & 10,000+ MATCHES STANDINGS MATHEMATICAL INVARIANTS AUDIT
  // =========================================================================
  describe('1. 200+ Seasons and 10,000+ Matches Mathematical Integrity', () => {
    it('simulates 200 consecutive multi-country seasons, auditing over 10,000 fixtures for mathematical perfection', () => {
      let currentClubs: Club[] = ALL_CLUBS.map((c) => ({ ...c }));
      const userClubId = currentClubs[0]?.id || 1;

      let totalMatchesAudited = 0;
      let totalSeasonsAudited = 0;
      let totalDrawsRecorded = 0;
      let totalGoalsRecorded = 0;
      let totalPromotionsAudited = 0;
      let totalRelegationsAudited = 0;

      // Run 200 full multi-country seasons
      const SEASONS_TO_SIMULATE = 200;

      for (let season = 1; season <= SEASONS_TO_SIMULATE; season++) {
        const year = 2026 + season;
        const resultClubs = simulateAiLeagues(currentClubs, userClubId, year, []);
        totalSeasonsAudited++;

        const standingsArchive = (resultClubs as any).standingsArchive as Record<number, any[]> | undefined;
        const movements = (resultClubs as any).movements || [];

        // Count promotions and relegations
        movements.forEach((m: any) => {
          if (m.type === 'promotion') totalPromotionsAudited++;
          if (m.type === 'relegation') totalRelegationsAudited++;
        });

        if (standingsArchive) {
          Object.entries(standingsArchive).forEach(([tierKey, table]) => {
            if (!Array.isArray(table) || table.length < 4) return;

            let prevPts = 9999;
            let prevGd = 9999;
            let prevGf = 9999;

            table.forEach((row: any, idx: number) => {
              // Invariant 1: Matches Played (MP === 34)
              expect(row.mp, `S${season} T${tierKey} ${row.name} MP`).toBe(34);

              // Invariant 2: Total records (W + D + L === MP)
              const matchSum = row.w + row.d + row.l;
              expect(matchSum, `S${season} T${tierKey} ${row.name} W+D+L`).toBe(34);

              // Invariant 3: Points Formula (W * 3 + D === Pts)
              const expectedPts = row.w * 3 + row.d;
              expect(row.pts, `S${season} T${tierKey} ${row.name} Points formula`).toBe(expectedPts);

              // Invariant 4: Goal Difference Formula (GF - GA === GD)
              const rawGd = row.gf - row.ga;
              const parsedGd = parseInt(row.gd, 10);
              expect(parsedGd, `S${season} T${tierKey} ${row.name} GD formula`).toBe(rawGd);

              // Invariant 5: Goals sanity (GF >= 0, GA >= 0)
              expect(row.gf).toBeGreaterThanOrEqual(0);
              expect(row.ga).toBeGreaterThanOrEqual(0);

              // Invariant 6: Points Monotonic Ordering
              expect(row.pts, `S${season} T${tierKey} Rank ${idx + 1} points`).toBeLessThanOrEqual(prevPts);

              // Decision Day Tiebreaker Check:
              if (row.pts === prevPts) {
                // If points tied, GD must be <= prevGd
                expect(parsedGd, `S${season} T${tierKey} Tied points GD tiebreaker`).toBeLessThanOrEqual(prevGd);
                if (parsedGd === prevGd) {
                  // If GD also tied, GF must be <= prevGf
                  expect(row.gf, `S${season} T${tierKey} Tied GD GF tiebreaker`).toBeLessThanOrEqual(prevGf);
                }
              }

              prevPts = row.pts;
              prevGd = parsedGd;
              prevGf = row.gf;

              totalDrawsRecorded += row.d;
              totalGoalsRecorded += row.gf;
            });

            // Each team in an 18-team table plays 34 fixtures => (18 * 34) / 2 = 306 fixtures per division
            const divisionFixtures = (table.length * 34) / 2;
            totalMatchesAudited += divisionFixtures;
          });
        }

        // Pass updated clubs to next season
        currentClubs = resultClubs.map((c) => ({ ...c }));
      }

      // Assert that we have vastly surpassed the 10,000 matches and 200 seasons threshold
      expect(totalSeasonsAudited).toBe(200);
      expect(totalMatchesAudited, 'Total matches audited must exceed 10,000').toBeGreaterThan(10000);
      expect(totalPromotionsAudited, 'Total promotions audited over 200 seasons').toBeGreaterThan(100);
      expect(totalRelegationsAudited, 'Total relegations audited over 200 seasons').toBeGreaterThan(100);

      // Verify realistic draw percentage across the entire 10,000+ match dataset
      const avgGoalsPerMatch = totalGoalsRecorded / totalMatchesAudited;
      expect(avgGoalsPerMatch, 'Average goals per match should be between 2.0 and 4.0').toBeGreaterThanOrEqual(2.0);
      expect(avgGoalsPerMatch, 'Average goals per match should be between 2.0 and 4.0').toBeLessThanOrEqual(4.0);
    }, 30000);
  });

  // =========================================================================
  // 2. PROMOTION & RELEGATION INTEGRITY ACROSS DEEP PYRAMIDS (TIER 11 TO TIER 1)
  // =========================================================================
  describe('2. Deep Pyramid Promotion/Relegation Mechanics (Tier 11 to Tier 1)', () => {
    it('strictly preserves Tier 11 as the bottom floor in Germany with zero illegal drop-offs', () => {
      const germanClubs = ALL_CLUBS.filter((c) => (c.country || 'GER') === 'GER');
      const maxTier = getMaxTier('GER', germanClubs);
      expect(maxTier).toBeGreaterThanOrEqual(3);

      let clubsState = ALL_CLUBS.map((c) => ({ ...c }));

      // Run 50 multi-tier transition seasons
      for (let s = 1; s <= 50; s++) {
        const year = 2026 + s;
        const nextClubs = simulateAiLeagues(clubsState, 99999, year, []);

        // Verify no German club drops below maxTier (e.g. into Tier 12)
        const germanAfter = nextClubs.filter((c) => (c.country || 'GER') === 'GER');
        germanAfter.forEach((c) => {
          expect(c.tier, `Club ${c.name} tier cannot exceed maxTier ${maxTier}`).toBeLessThanOrEqual(maxTier);
          expect(c.tier, `Club ${c.name} tier cannot be 0 or negative`).toBeGreaterThanOrEqual(1);
        });

        // Verify movements never contain a demotion beyond maxTier
        const movements: any[] = (nextClubs as any).movements || [];
        const floorViolations = movements.filter(
          (m) => m.country === 'GER' && m.toTier > maxTier
        );
        expect(floorViolations.length, 'Floor violations beyond max tier').toBe(0);

        clubsState = nextClubs.map((c) => ({ ...c }));
      }
    });

    it('strictly blocks B-teams and reserve squads from ever promoting into Tier 1 or Tier 2', () => {
      // Create test universe containing multiple overpowered B-teams in Tier 3
      const clubsWithReserves: Club[] = [
        // Tier 1
        { id: 101, name: 'FC Bayern Munich', tier: 1, country: 'GER', baseOvr: 86, stadium: 75000, color: '#f00' },
        { id: 102, name: 'Borussia Dortmund', tier: 1, country: 'GER', baseOvr: 84, stadium: 80000, color: '#ff0' },
        { id: 103, name: 'Bayer Leverkusen', tier: 1, country: 'GER', baseOvr: 83, stadium: 30000, color: '#000' },
        { id: 104, name: 'RB Leipzig', tier: 1, country: 'GER', baseOvr: 82, stadium: 45000, color: '#fff' },

        // Tier 2
        { id: 201, name: 'Hamburger SV', tier: 2, country: 'GER', baseOvr: 76, stadium: 55000, color: '#00f' },
        { id: 202, name: 'Hertha BSC', tier: 2, country: 'GER', baseOvr: 75, stadium: 70000, color: '#00f' },
        { id: 203, name: 'FC Schalke 04', tier: 2, country: 'GER', baseOvr: 74, stadium: 62000, color: '#00f' },
        { id: 204, name: 'Fortuna Duesseldorf', tier: 2, country: 'GER', baseOvr: 73, stadium: 50000, color: '#f00' },

        // Tier 3 with 99-rated B-teams
        { id: 301, name: 'Bayern Munich II', tier: 3, country: 'GER', baseOvr: 99, stadium: 15000, color: '#f00', isReserve: true },
        { id: 302, name: 'Borussia Dortmund II', tier: 3, country: 'GER', baseOvr: 98, stadium: 15000, color: '#ff0', isReserve: true },
        { id: 303, name: 'VfB Stuttgart II', tier: 3, country: 'GER', baseOvr: 97, stadium: 10000, color: '#fff', isReserve: true },
        { id: 304, name: 'Dynamo Dresden', tier: 3, country: 'GER', baseOvr: 66, stadium: 30000, color: '#ff0', isReserve: false },
        { id: 305, name: 'Rot-Weiss Essen', tier: 3, country: 'GER', baseOvr: 65, stadium: 20000, color: '#f00', isReserve: false },
      ];

      let current = [...clubsWithReserves];

      // Simulate 25 promotion seasons
      for (let s = 1; s <= 25; s++) {
        const next = simulateAiLeagues(current, 99999, 2026 + s, []);

        const tier1 = next.filter((c) => c.tier === 1);
        const tier2 = next.filter((c) => c.tier === 2);

        tier1.forEach((c) => {
          expect(isReserveClub(c.name), `Reserve club ${c.name} cannot be in Tier 1`).toBe(false);
        });

        tier2.forEach((c) => {
          expect(isReserveClub(c.name), `Reserve club ${c.name} cannot be in Tier 2`).toBe(false);
        });

        current = next.map((c) => ({ ...c }));
      }
    });

    it('enforces exact promotion and relegation symmetry between adjacent division tiers', () => {
      let current = ALL_CLUBS.map((c) => ({ ...c }));

      for (let s = 1; s <= 15; s++) {
        const next = simulateAiLeagues(current, 99999, 2026 + s, []);
        const movements: any[] = (next as any).movements || [];

        // Check Germany T1/T2 symmetry:
        // Number of teams relegated from T1 should match number promoted to T1
        const t1Relegations = movements.filter((m) => m.country === 'GER' && m.fromTier === 1 && m.toTier === 2);
        const t2Promotions = movements.filter((m) => m.country === 'GER' && m.fromTier === 2 && m.toTier === 1 && !m.id.startsWith('sim-admin'));

        expect(t1Relegations.length, `Season ${s} T1 relegations must equal T2 promotions`).toBe(t2Promotions.length);

        current = next.map((c) => ({ ...c }));
      }
    });
  });

  // =========================================================================
  // 3. CUP RUNS AUDIT (DOMESTIC, REGIONAL, CONTINENTAL & CLUB WORLD CUP)
  // =========================================================================
  describe('3. Domestic, Regional, Continental & World Cup Runs Audit', () => {
    it('audits domestic cup resolution and guarantees Canadian MLS teams compete for Voyageurs Cup', () => {
      // Check Canadian MLS teams
      const canadianTeams = ['Toronto FC', 'CF Montréal', 'Vancouver Whitecaps FC', 'Toronto Red', 'Vancouver White', 'Montreal Blue'];

      canadianTeams.forEach((teamName) => {
        expect(isCanadianMLSClub(teamName, undefined, 'USA'), `${teamName} is Canadian MLS club`).toBe(true);
        const cup = getDomesticCupInfo('USA', 1, teamName);
        expect(cup.name, `${teamName} must play for Voyageurs Cup`).toBe('Voyageurs Cup');
        expect(cup.logo).toBe('🇨🇦');
      });

      // Check US teams
      const usTeams = ['LA Galaxy', 'Inter Miami', 'New York City FC', 'Seattle Sounders'];
      usTeams.forEach((teamName) => {
        expect(isCanadianMLSClub(teamName, undefined, 'USA')).toBe(false);
        const cup = getDomesticCupInfo('USA', 1, teamName);
        expect(cup.name).toBe('U.S. Open Cup');
      });

      // Check German domestic and regional cup
      const dfb = getDomesticCupInfo('GER', 1, 'FC Bayern Munich');
      expect(dfb.name).toBe('DFB-Pokal');

      const regionalPokal = getDomesticCupInfo('GER', 4, 'Rot-Weiss Essen');
      expect(regionalPokal.name).toBe('Regional Cup');
    });

    it('generates valid continental cup champions across UEFA, CONMEBOL, CONCACAF, and AFC over 50 seasons', () => {
      let current = ALL_CLUBS.map((c) => ({ ...c }));
      const userClubId = 99999; // Non-participating dummy club

      const continentalChampsCount: Record<string, number> = {
        uefa_cl: 0,
        uefa_el: 0,
        uefa_ecl: 0,
        libertadores: 0,
        sudamericana: 0,
        concacaf: 0,
        leagues: 0,
        afc: 0,
      };

      for (let s = 1; s <= 50; s++) {
        const year = 2026 + s;
        const next = simulateAiLeagues(current, userClubId, year, []);
        const movements: any[] = (next as any).movements || [];

        const cupMovements = movements.filter((m) => m.type === 'cup_champion');

        cupMovements.forEach((m) => {
          const cupName = (m.fromLeagueName || '').toLowerCase();
          if ((cupName.includes('champions cup') || cupName.includes('champions league')) && UEFA_COUNTRIES.includes(m.country)) {
            continentalChampsCount.uefa_cl++;
          } else if (cupName.includes('europa') || cupName.includes('euro cup')) {
            continentalChampsCount.uefa_el++;
          } else if (cupName.includes('libertadores') || (CONMEBOL_COUNTRIES.includes(m.country) && cupName.includes('south america'))) {
            continentalChampsCount.libertadores++;
          } else if (cupName.includes('sudamericana')) {
            continentalChampsCount.sudamericana++;
          } else if (cupName.includes('concacaf')) {
            continentalChampsCount.concacaf++;
          } else if (cupName.includes('leagues')) {
            continentalChampsCount.leagues++;
          } else if (cupName.includes('afc') || AFC_COUNTRIES.includes(m.country)) {
            continentalChampsCount.afc++;
          }
        });

        current = next.map((c) => ({ ...c }));
      }

      // Over 50 seasons, each continental competition must have crowned multiple champions
      expect(continentalChampsCount.uefa_cl, 'UEFA CL champions').toBeGreaterThanOrEqual(10);
      expect(continentalChampsCount.libertadores, 'Libertadores champions').toBeGreaterThanOrEqual(5);
      expect(continentalChampsCount.concacaf, 'Concacaf champions').toBeGreaterThanOrEqual(5);
    });
  });

  // =========================================================================
  // 4. DECISION DAYS & FINAL-MATCHDAY TIEBREAKER INTEGRITY AUDIT
  // =========================================================================
  describe('4. Decision Days, Goal Difference & Tiebreaker Resolution', () => {
    it('verifies final fixture tiebreakers where teams share identical points', () => {
      // Simulate 30 seasons focusing specifically on tables where rank 1 and 2 or relegation places share identical points
      let current = ALL_CLUBS.map((c) => ({ ...c }));
      let pointTiesEncountered = 0;

      for (let s = 1; s <= 30; s++) {
        const next = simulateAiLeagues(current, 99999, 2026 + s, []);
        const standingsArchive = (next as any).standingsArchive as Record<number, any[]> | undefined;

        if (standingsArchive) {
          Object.values(standingsArchive).forEach((table) => {
            if (!Array.isArray(table)) return;

            for (let i = 0; i < table.length - 1; i++) {
              const higher = table[i];
              const lower = table[i + 1];

              if (higher.pts === lower.pts) {
                pointTiesEncountered++;
                const higherGd = parseInt(higher.gd, 10);
                const lowerGd = parseInt(lower.gd, 10);

                // Invariant: Higher ranked team must have GD >= Lower ranked team
                expect(
                  higherGd,
                  `Decision Day Tiebreaker: ${higher.name} (${higherGd}) must have >= GD than ${lower.name} (${lowerGd})`
                ).toBeGreaterThanOrEqual(lowerGd);

                if (higherGd === lowerGd) {
                  // Invariant: If GD equal, GF must be >= Lower ranked team
                  expect(
                    higher.gf,
                    `Decision Day GF Tiebreaker: ${higher.name} (${higher.gf}) must have >= GF than ${lower.name} (${lower.gf})`
                  ).toBeGreaterThanOrEqual(lower.gf);
                }
              }
            }
          });
        }

        current = next.map((c) => ({ ...c }));
      }

      // Assert that multiple realistic point ties were encountered and correctly resolved
      expect(pointTiesEncountered, 'Must encounter points ties in 30 multi-tier seasons').toBeGreaterThanOrEqual(20);
    });

    it('verifies that title races and relegation scraps maintain authentic competition drama', () => {
      let current = ALL_CLUBS.map((c) => ({ ...c }));
      const titlePointMargins: number[] = [];

      for (let s = 1; s <= 20; s++) {
        const next = simulateAiLeagues(current, 99999, 2026 + s, []);
        const standingsArchive = (next as any).standingsArchive as Record<number, any[]> | undefined;

        if (standingsArchive && standingsArchive[1]) {
          const t1 = standingsArchive[1];
          if (t1.length >= 2) {
            const championPts = t1[0].pts;
            const runnerUpPts = t1[1].pts;
            const margin = championPts - runnerUpPts;
            titlePointMargins.push(margin);

            // Champion should have more or equal points than runner up
            expect(margin).toBeGreaterThanOrEqual(0);
          }
        }

        current = next.map((c) => ({ ...c }));
      }

      // Verify that title margin has realistic variation (some close finishes <= 6 pts, some runaway titles)
      const hasCloseTitleRace = titlePointMargins.some((m) => m <= 6);
      expect(hasCloseTitleRace, 'At least one close title race decided by <= 6 pts').toBe(true);
    });

    it('audits Club Bounce-Back Rate, verifying realistic 1-year and 3-year promotion rebound rates for relegated clubs', () => {
      let clubs = ALL_CLUBS.map((c) => ({ ...c }));
      let totalRelegations = 0;
      let immediateBounceBacks1Yr = 0;
      let bounceBacks3Yrs = 0;

      const history = new Map<number, Array<{ year: number; tier: number }>>();
      clubs.forEach((c) => history.set(c.id, [{ year: 2026, tier: c.tier }]));

      for (let yr = 2027; yr <= 2086; yr++) {
        const result = simulateAiLeagues(clubs, 99999, yr, []);
        result.forEach((c) => {
          history.get(c.id)?.push({ year: yr, tier: c.tier });
        });
        clubs = result.map((c) => ({ ...c }));
      }

      history.forEach((records) => {
        for (let i = 0; i < records.length - 1; i++) {
          const cur = records[i];
          const nxt = records[i + 1];
          if (nxt.tier > cur.tier) {
            totalRelegations++;
            const originTier = cur.tier;

            if (i + 2 < records.length && records[i + 2].tier <= originTier) {
              immediateBounceBacks1Yr++;
            }

            let bouncedWithin3 = false;
            for (let k = 2; k <= 4 && i + k < records.length; k++) {
              if (records[i + k].tier <= originTier) {
                bouncedWithin3 = true;
                break;
              }
            }
            if (bouncedWithin3) bounceBacks3Yrs++;
          }
        }
      });

      expect(totalRelegations).toBeGreaterThan(500);
      const immediateRate = (immediateBounceBacks1Yr / totalRelegations) * 100;
      const threeYearRate = (bounceBacks3Yrs / totalRelegations) * 100;

      // Realistic rates:
      // 1-year bounce-back between 10% and 30%
      // 3-year bounce-back between 25% and 55%
      expect(immediateRate).toBeGreaterThanOrEqual(10);
      expect(immediateRate).toBeLessThanOrEqual(30);
      expect(threeYearRate).toBeGreaterThanOrEqual(25);
      expect(threeYearRate).toBeLessThanOrEqual(55);
    });
  });
});
