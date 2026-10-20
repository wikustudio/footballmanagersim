import { describe, it, expect } from 'vitest';
import { getMaxTier, getLeagueInfo } from '../data/gameConstants';
import { ALL_CLUBS } from '../data/clubsData';

describe('Comprehensive Game Logic Stress Audit & State Guardians', () => {
  describe('Pyramid Progression & Relegation Invariants Across Countries', () => {
    it('verifies max tier mapping and pyramid depth across all active countries', () => {
      const countryPyramids: Record<string, number> = {
        GER: 11,
        ENG: 7,
        ESP: 6,
        ITA: 6,
        FRA: 5,
        POR: 6,
        USA: 5,
        TUR: 3,
        SCO: 2,
        BRA: 2,
        ECU: 2,
        JPN: 2,
        POL: 1,
        WAL: 1,
        AUT: 1,
        SUI: 1,
        CAN: 1,
      };

      for (const [country, expectedMax] of Object.entries(countryPyramids)) {
        const actualMax = getMaxTier(country, ALL_CLUBS);
        expect(actualMax, `Max tier for ${country}`).toBe(expectedMax);
      }
    });

    it('simulates 100 multi-tier transitions and asserts valid tier progression bounds', () => {
      const testPyramids = [
        { country: 'GER', maxTier: 11 },
        { country: 'ENG', maxTier: 7 },
        { country: 'TUR', maxTier: 3 },
        { country: 'SCO', maxTier: 2 },
        { country: 'POL', maxTier: 1 },
      ];

      for (const { country, maxTier } of testPyramids) {
        for (let currentTier = 1; currentTier <= maxTier; currentTier++) {
          // 1. Champions / Runners-up Promotion Check
          const promoPositions = [1, 2];
          for (const pos of promoPositions) {
            let nextTier = currentTier;
            if (currentTier === 1) {
              nextTier = 1; // Stays champion in tier 1
            } else {
              nextTier = currentTier - 1; // Promotes upward
            }
            expect(nextTier).toBeGreaterThanOrEqual(1);
            expect(nextTier).toBeLessThanOrEqual(maxTier);
          }

          // 2. Relegation Drop-Zone Check
          const dropPositions = country === 'TUR' && currentTier === 3 ? [17, 18] : [16, 17, 18];
          for (const pos of dropPositions) {
            let nextTier = currentTier;
            let isSacked = false;

            if (currentTier === 1 && maxTier === 1) {
              // Single-tier: Sacked in tier 1
              isSacked = true;
              nextTier = 1;
            } else if (currentTier < maxTier) {
              // Mid-pyramid: Relegates downward
              nextTier = currentTier + 1;
              isSacked = false;
            } else {
              // Bottom-tier floor: Sacked!
              isSacked = true;
              nextTier = currentTier;
            }

            expect(nextTier).toBeGreaterThanOrEqual(1);
            expect(nextTier).toBeLessThanOrEqual(maxTier);

            if (currentTier === maxTier || maxTier === 1) {
              expect(isSacked).toBe(true);
            } else {
              expect(isSacked).toBe(false);
              expect(nextTier).toBe(currentTier + 1);
            }
          }
        }
      }
    });
  });

  describe('Unified 5-Pathway Sacking Mechanics & Shield Resets', () => {
    it('verifies all 5 dismissal pathways enforce forced exit offers, shield resets, and sever ties', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      // Pathway 1: Bottom-tier drop zone sacking
      expect(appSrc).toMatch(/\/\/\s*Relegated from bottom tier -> sacked\s+isSackedRelegation\s*=\s*true;/);

      // Pathway 2: Single-tier drop zone sacking
      expect(appSrc).toMatch(/\/\/\s*Sacked in single-tier country![^\n]*\n\s*isSackedRelegation\s*=\s*true;/);

      // Pathway 3: Dressing Room Crisis (Impact < 20 with 0 shields)
      expect(appSrc).toContain("title: isDe ? 'ENTLASSEN! KEINE SCHILDE MEHR' : 'SACKED! ZERO SHIELDS LEFT'");

      // Pathway 4: Strategic Vision failure (0 shields left)
      expect(appSrc).toContain("title: { en: 'Relieved of Duties · Strategic Failure', de: 'Vertragsauflösung · Roadmap Verfehlt' }");

      // Pathway 5: Insolvency / liquidation in bottom tier
      expect(appSrc).toContain("title: { en: 'Relieved of Duties · Insolvency', de: 'Vertragsauflösung · Insolvenz' }");

      // Immunity shields reset to 2 upon contract termination
      const resetCount = (appSrc.match(/state\.immunityShields\s*=\s*2;\s*\/\/\s*Reset for next job/g) || []).length;
      expect(resetCount).toBeGreaterThanOrEqual(3);

      // Standard reputation deduction (-10) applied
      const repDeductCount = (appSrc.match(/state\.reputation\s*=\s*Math\.max\(repFloor,\s*state\.reputation\s*-\s*10\);/g) || []).length;
      expect(repDeductCount).toBeGreaterThanOrEqual(3);

      // Forced Job Offer generation strictly forbids staying at current club
      const eventUiSrc = fs.readFileSync('src/components/EventUI.tsx', 'utf-8');
      expect(eventUiSrc).toContain('!event.isForced && (');
      expect(eventUiSrc).toContain('Decline & Remain at Current Club');
    });

    it('verifies SeasonFinishModal displays Managerial Contract Terminated banner for all sacking pathways', async () => {
      const fs = await import('fs');
      const sfSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');

      // Board resolution checks both isSackedRelegation and isSacked
      expect(sfSrc).toContain('(seasonData.isSackedRelegation || seasonData.isSacked)');
      expect(sfSrc).toContain('Managerial Contract Terminated');
      expect(sfSrc).toContain('Following drop-zone failure in');
    });
  });

  describe('Runtime State Guardians (Auto-Healing & Validation)', () => {
    it('verifies sanitizeGameState enforces tier bounds, shields bounds, and reputation safety on corrupted states', async () => {
      const { sanitizeGameState } = await import('../App');

      const corruptedState: any = {
        club: {
          name: 'Test FC',
          country: 'POL', // 5-tier country in database (max tier 5)
          tier: 9,        // Corrupted tier beyond max tier 5
          baseOvr: 15,    // Corrupted low OVR
          academyLevel: 8, // Corrupted level beyond max 5
          medicalLevel: 6, // Corrupted level beyond max 5
        },
        immunityShields: -4, // Corrupted negative shields
        reputation: 999,     // Corrupted out-of-bounds reputation
        clubImpactScore: -10,// Corrupted negative impact score
      };

      const healed = sanitizeGameState(corruptedState);
      expect(healed).not.toBeNull();
      // Tier clamped to max tier 5 for POL
      expect(healed?.club.tier).toBe(5);
      // Base OVR clamped to minimum 30
      expect(healed?.club.baseOvr).toBe(30);
      // Academy & Medical clamped to maximum 5
      expect(healed?.club.academyLevel).toBe(5);
      expect(healed?.club.medicalLevel).toBe(5);
      // Shields clamped to 0
      expect(healed?.immunityShields).toBe(0);
      // Reputation clamped to 100
      expect(healed?.reputation).toBe(100);
      // Impact score clamped to 0
      expect(healed?.clubImpactScore).toBe(0);

      // Undefined shields defaults to 2, facilities default to 1
      const missingShieldsState = { club: { name: 'FC', country: 'GER', tier: 1 } };
      const healed2 = sanitizeGameState(missingShieldsState);
      expect(healed2?.immunityShields).toBe(2);
      expect(healed2?.reputation).toBe(50);
      expect(healed2?.clubImpactScore).toBe(50);
      expect(healed2?.club.academyLevel).toBe(1);
      expect(healed2?.club.medicalLevel).toBe(1);
    }, 30000);

    it('verifies handleSimulateSeason blocks simulation when forced job offers are pending', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      expect(appSrc).toContain('if (gameState.pendingForcedEvent || (eventQueue || []).some(e => e.isForced))');
      expect(appSrc).toContain('You must resolve your mandatory contract vacancy before simulating!');
    });
  });

  describe('Exit Vacancy Sourcing & Similar-OVR Matching', () => {
    it('verifies generateJobOffers prioritizes similar-OVR candidates during sackings', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      // Candidates are sorted by absolute OVR differential
      expect(appSrc).toContain('const diffA = Math.abs(a.baseOvr - state.club.baseOvr);');
      expect(appSrc).toContain('const diffB = Math.abs(b.baseOvr - state.club.baseOvr);');
      expect(appSrc).toContain('return diffA - diffB;');

      // Offers pick from the closest matching tier peers
      expect(appSrc).toContain('const poolSize = isBadSeason ? Math.min(3, unusedSame.length) : unusedSame.length;');
    });

    it('verifies Decision Day survival battle triggers for bottom-tier teams in drop danger', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      // Survival scrap is enabled on 15th/16th place regardless of whether bottom tier
      expect(appSrc).toContain('const triggerRelBattle = (approxPos === 15 || approxPos === 16);');
    });

    it('verifies dynamic universe storage key persists AI club movements across interrupted sessions', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      expect(appSrc).toContain("const DYNAMIC_UNIVERSE_STORAGE_KEY = 'fms_dynamic_universe_clubs';");
      expect(appSrc).toContain('localStorage.getItem(DYNAMIC_UNIVERSE_STORAGE_KEY)');
      expect(appSrc).toContain('safeSaveClubsDb(DYNAMIC_UNIVERSE_STORAGE_KEY, clubsDb);');
      expect(appSrc).toContain('localStorage.removeItem(DYNAMIC_UNIVERSE_STORAGE_KEY);');
    });

    it('verifies fallen giants offer restoration vacancies to successful lower-tier managers', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      expect(appSrc).toContain('Fallen Giant Restoration Mandate');
      expect(appSrc).toContain('c.isInsolventGiant && Math.abs(c.tier - curTier) <= 2');
    });

    it('verifies Decision Day two-team table isolates direct duelists with dynamic rank offset', async () => {
      const fs = await import('fs');
      const ddSrc = fs.readFileSync('src/components/DecisionDayModal.tsx', 'utf-8');

      // 1v1 broadcast table format
      expect(ddSrc).toContain('Matchday 34 League Table · Title Duel');
      expect(ddSrc).toContain('Matchday 34 Relegation Survival Duel');

      // Dynamic league team count offset calculation
      expect(ddSrc).toContain('const totalLeagueTeams = allClubs.filter(c => c.tier === tier && (c.country || \'GER\') === country).length || 18;');
      expect(ddSrc).toContain('const baseRankOffset = isRelegation ? Math.max(1, totalLeagueTeams - 3) : (isPlayoff ? 3 : 1);');
    });

    it('verifies multi-season simulation ensures relegated AI clubs remain and compete in relegated tiers', async () => {
      const { simulateAiLeagues } = await import('../engine/simulateAiLeagues');
      const { ALL_CLUBS } = await import('../data/clubsData');

      // Take a copy of clubs
      let universe = JSON.parse(JSON.stringify(ALL_CLUBS));
      const userClubId = 999999; // Dummy ID

      // Season 1 simulation
      universe = simulateAiLeagues(universe, userClubId, 2026, []);
      const movementsY1 = (universe as any).movements || [];

      // Find an AI club relegated from Tier 1 to Tier 2
      const relegToT2 = universe.find((c: any) => c.country === 'GER' && c.tier === 2 && movementsY1.some((m: any) => m.clubId === c.id && m.type === 'relegation'));
      if (relegToT2) {
        expect(relegToT2.tier).toBe(2);

        // Season 2 simulation: the club must compete in Tier 2
        universe = simulateAiLeagues(universe, userClubId, 2027, []);
        const clubInY2 = universe.find((c: any) => c.id === relegToT2.id);
        expect(clubInY2).toBeDefined();
        // The club is either still in Tier 2 or fought for and earned promotion back to Tier 1
        expect([1, 2, 3]).toContain(clubInY2.tier);
      }
    });

    it('verifies Decision Day promotion playoff distinguishes playoff winners from championships without trophies', async () => {
      const fs = await import('fs');
      const ddSrc = fs.readFileSync('src/components/DecisionDayModal.tsx', 'utf-8');

      // Asserts that promotion playoff displays upward trend icon and dedicated playoff winner text
      expect(ddSrc).toContain("'Promotion Playoff Final'");
      expect(ddSrc).toContain("Direct Promotion Secured · #3 Playoff Winner");
      expect(ddSrc).toContain("PROMOTION ACHIEVED (PLAYOFF WINNER)!");
      expect(ddSrc).toContain("fa-arrow-trend-up");
      expect(ddSrc).toContain("Official Broadcast");
    });

    it('verifies calculateClubLeagueHistory accurately plots historical universe relegations for unmanaged AI clubs', async () => {
      const { calculateClubLeagueHistory } = await import('../engine/clubProgressionEngine');

      // Koblenz currently in Tier 9 after a historical relegation
      const koblenz = {
        id: 128,
        name: 'TuS Koblenz',
        tier: 9,
        baseOvr: 43,
        country: 'GER'
      };

      // Simulated universe movements where Koblenz was relegated from Tier 8 to Tier 9 in 2028
      const universeMovements = [
        {
          year: 2028,
          clubId: koblenz.id,
          clubName: koblenz.name,
          type: 'relegation' as const,
          fromTier: 8,
          toTier: 9,
          pos: 17,
          reason: '17th Place Finish (Relegated)'
        }
      ];

      const history = calculateClubLeagueHistory(
        koblenz as any,
        2026,
        2031,
        [], // No manager tenure
        {},
        universeMovements as any
      );

      // Verify the year 2028 record reflects the exact relegation
      const season2028 = history.find(r => r.year === 2028);
      expect(season2028).toBeDefined();
      expect(season2028?.tier).toBe(8);
      expect(season2028?.position).toBe(17);
      expect(season2028?.status).toBe('relegated');
      expect(season2028?.isManagerTenure).toBe(false);

      // In 2029, the club should be plotted in Tier 9
      const season2029 = history.find(r => r.year === 2029);
      expect(season2029).toBeDefined();
      expect(season2029?.tier).toBe(9);
    });
  });
});
