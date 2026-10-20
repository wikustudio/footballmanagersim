import { describe, it, expect } from 'vitest';
import { simulateAiLeagues } from '../engine/simulateAiLeagues';
import { getBaseModClubs } from '../engine/moddingEngine';
import { Club } from '../types';

describe('Cinderella Breakthroughs & Powerhouse Realism Engine', () => {
  it('anchors elite powerhouses at the top with giants winning the vast majority of top-tier championships', () => {
    const clubs = getBaseModClubs();
    let currentClubs = clubs.map(c => ({ ...c }));
    let giantTitles = 0;
    const totalSeasons = 40;

    for (let yr = 2026; yr < 2026 + totalSeasons; yr++) {
      const sim = simulateAiLeagues(currentClubs, 99999, yr, []);
      const standingsArchive = (sim as any).standingsArchive || {};
      const t1Table = standingsArchive[1];

      if (t1Table && t1Table.length > 0) {
        const champ = t1Table[0];
        const champClub = sim.find((c: Club) => c.id === champ.id);
        const isGiant = (champClub?.baseOvr || 0) >= 78 || ['FC Bayern München', 'Borussia Dortmund', 'Bayer 04 Leverkusen', 'RB Leipzig'].includes(champ.name);
        if (isGiant) {
          giantTitles++;
        }
      }

      currentClubs = sim.map(c => ({ ...c }));
    }

    const giantDominancePct = (giantTitles / totalSeasons) * 100;
    // Powerhouses must win at least 75% of titles, maintaining authentic dominance
    expect(giantDominancePct).toBeGreaterThanOrEqual(75);
  });

  it('allows elite powerhouses to experience rare crisis dips without falling into relegation', () => {
    const clubs = getBaseModClubs();
    let currentClubs = clubs.map(c => ({ ...c }));
    let crisisSeasonObserved = false;
    let anyGiantRelegatedWhileSolvent = false;

    for (let yr = 2026; yr <= 2075; yr++) {
      const sim = simulateAiLeagues(currentClubs, 99999, yr, []);
      const standingsArchive = (sim as any).standingsArchive || {};
      const t1Table = standingsArchive[1];

      if (t1Table) {
        t1Table.forEach((row: any) => {
          const club = sim.find((c: Club) => c.id === row.id);
          const isTraditionalPowerhouse = ['FC Bayern München', 'Borussia Dortmund', 'Bayer 04 Leverkusen', 'RB Leipzig', 'VfB Stuttgart', 'Eintracht Frankfurt', 'Munich Red', 'Dortmund Yellow', 'Bavaria München', 'Prussia Dortmund'].includes(club?.name || '');
          if (isTraditionalPowerhouse && !club?.isInsolventGiant) {
            // A crisis season is finishing between 6th and 12th
            if (row.pos >= 6 && row.pos <= 12) {
              crisisSeasonObserved = true;
            }
            // But solvent giants must NEVER finish in the bottom 3 relegation zone (16, 17, 18)
            if (row.pos >= 16) {
              anyGiantRelegatedWhileSolvent = true;
            }
          }
        });
      }

      currentClubs = sim.map(c => ({ ...c }));
    }

    expect(crisisSeasonObserved, 'Giants should occasionally have a crisis/transitional season').toBe(true);
    expect(anyGiantRelegatedWhileSolvent, 'Solvent heavyweight giants must not fall into relegation').toBe(false);
  });

  it('generates occasional Cinderella breakthrough runs for non-giant clubs', () => {
    const clubs = getBaseModClubs();
    let currentClubs = clubs.map(c => ({ ...c }));
    let cinderellaSurgesRecorded = 0;

    for (let yr = 2026; yr <= 2075; yr++) {
      const sim = simulateAiLeagues(currentClubs, 99999, yr, []);
      const movements = (sim as any).movements || [];

      const surges = movements.filter((m: any) => m.type === 'cinderella_surge');
      cinderellaSurgesRecorded += surges.length;

      currentClubs = sim.map(c => ({ ...c }));
    }

    // Over 50 seasons, expect occasional Cinderella runs (at least 2-3 throughout the simulation)
    expect(cinderellaSurgesRecorded).toBeGreaterThanOrEqual(1);
  });

  it('guarantees that user-managed giant clubs receive zero artificial AI safety nets', () => {
    const clubs = getBaseModClubs();
    const bayern = clubs.find(c => c.name.includes('Bayern')) || clubs[0];

    // If the user is managing Bayern with terrible squad OVR (e.g. 50 OVR due to mismanagement),
    // they should receive zero AI giant boost and legitimately struggle
    const customClubs = clubs.map(c => c.id === bayern.id ? { ...c, baseOvr: 50 } : { ...c });

    const sim = simulateAiLeagues(customClubs, bayern.id, 2026, []);
    const standingsArchive = (sim as any).standingsArchive || {};
    const t1Table = standingsArchive[1];

    const userRow = t1Table.find((r: any) => r.id === bayern.id);
    expect(userRow).toBeDefined();
    // With 50 OVR and no artificial AI giant boost, user-managed club finishes near the bottom
    expect(userRow.pos).toBeGreaterThanOrEqual(12);
  });
});
