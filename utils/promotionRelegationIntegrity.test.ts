import { describe, it, expect } from 'vitest';
import { simulateAiLeagues } from '../engine/simulateAiLeagues';
import { getBaseModClubs } from '../engine/moddingEngine';
import { isReserveClub, getMinAllowedTierForReserve } from '../data/gameConstants';
import { Club } from '../types';

describe('Promotion and Relegation Integrity Engine', () => {
  it('enforces exactly 3 promotion and 3 relegation movements between Tier 1 and Tier 2 in Germany', () => {
    const clubs = getBaseModClubs();
    const sim = simulateAiLeagues(clubs, 99999, 2026, []);
    const movements = (sim as any).movements || [];

    const t1Relegs = movements.filter((m: any) => m.country === 'GER' && m.fromTier === 1 && m.type === 'relegation');
    const t1PlayoffSurv = movements.filter((m: any) => m.country === 'GER' && m.fromTier === 1 && m.type === 'relegation_avoided');
    const t2Promos = movements.filter((m: any) => m.country === 'GER' && m.toTier === 1 && m.type === 'promotion');

    // 2 direct spots + 1 two-legged playoff (either 3 relegated/promoted or 2 relegated/promoted + 1 playoff survivor)
    expect(t1Relegs.length).toBe(t2Promos.length);
    expect(t1Relegs.length + t1PlayoffSurv.length).toBe(3);

    // Verify relegated positions match bottom finishers (17, 18 or 16, 17, 18)
    const t1RelegPositions = t1Relegs.map((m: any) => m.pos).sort((a: number, b: number) => a - b);
    expect(t1RelegPositions).toEqual(t1Relegs.length === 3 ? [16, 17, 18] : [17, 18]);

    // Verify all relegated clubs now have tier === 2
    t1Relegs.forEach((m: any) => {
      const clubInDb = sim.find((c: Club) => c.id === m.clubId);
      expect(clubInDb?.tier, `Club ${m.clubName} must now be in Tier 2`).toBe(2);
    });

    // Verify all promoted clubs now have tier === 1
    t2Promos.forEach((m: any) => {
      const clubInDb = sim.find((c: Club) => c.id === m.clubId);
      expect(clubInDb?.tier, `Club ${m.clubName} must now be in Tier 1`).toBe(1);
    });
  });

  it('enforces exactly 3 promotion and 3 relegation movements between Tier 2 and Tier 3 in Germany', () => {
    const clubs = getBaseModClubs();
    const sim = simulateAiLeagues(clubs, 99999, 2026, []);
    const movements = (sim as any).movements || [];

    const t2Relegs = movements.filter((m: any) => m.country === 'GER' && m.fromTier === 2 && m.type === 'relegation');
    const t2PlayoffSurv = movements.filter((m: any) => m.country === 'GER' && m.fromTier === 2 && m.type === 'relegation_avoided');
    const t3Promos = movements.filter((m: any) => m.country === 'GER' && m.toTier === 2 && m.type === 'promotion');

    expect(t2Relegs.length).toBe(t3Promos.length);
    expect(t2Relegs.length + t2PlayoffSurv.length).toBe(3);

    // Verify relegated positions match bottom finishers (17, 18 or 16, 17, 18)
    const t2RelegPositions = t2Relegs.map((m: any) => m.pos).sort((a: number, b: number) => a - b);
    expect(t2RelegPositions).toEqual(t2Relegs.length === 3 ? [16, 17, 18] : [17, 18]);

    // Verify all relegated clubs from Tier 2 now have tier === 3
    t2Relegs.forEach((m: any) => {
      const clubInDb = sim.find((c: Club) => c.id === m.clubId);
      expect(clubInDb?.tier, `Club ${m.clubName} must now be in Tier 3`).toBe(3);
    });

    // Verify all promoted clubs now have tier === 2
    t3Promos.forEach((m: any) => {
      const clubInDb = sim.find((c: Club) => c.id === m.clubId);
      expect(clubInDb?.tier, `Club ${m.clubName} must now be in Tier 2`).toBe(2);
    });
  });

  it('strictly relegates bottom finishers from Tier 2 (e.g. Braunschweig, Dresden, Fürth) into Tier 3 when they finish in the bottom 3', () => {
    const clubs = getBaseModClubs();
    // Simulate multiple seasons to ensure that when lower OVR teams like Dresden or Braunschweig finish 16-18, they move to Tier 3
    let currentClubs = clubs.map(c => ({ ...c }));
    let relegatedFound = false;

    let totalRelegatedCount = 0;

    for (let yr = 2026; yr <= 2035; yr++) {
      const sim = simulateAiLeagues(currentClubs, 99999, yr, []);
      const movements = (sim as any).movements || [];
      const t2Relegs = movements.filter((m: any) => m.country === 'GER' && m.fromTier === 2 && m.type === 'relegation');
      const t2PlayoffSurv = movements.filter((m: any) => m.country === 'GER' && m.fromTier === 2 && m.type === 'relegation_avoided');
      expect(t2Relegs.length + t2PlayoffSurv.length).toBe(3);

      for (const m of t2Relegs) {
        totalRelegatedCount++;
        const clubInSim = sim.find((c: Club) => c.id === m.clubId);
        expect(clubInSim?.tier).toBe(3);
        if (
          m.clubName.includes('Dresden') || 
          m.clubName.includes('Braunschweig') || 
          m.clubName.includes('Fürth') || 
          m.clubName.includes('Bielefeld') ||
          m.clubName.includes('Ulm') ||
          m.clubName.includes('Münster') ||
          m.clubName.includes('Regensburg') ||
          m.clubName.includes('Elversberg')
        ) {
          relegatedFound = true;
        }
      }
      currentClubs = sim.map(c => ({ ...c }));
    }

    expect(totalRelegatedCount).toBeGreaterThanOrEqual(15);
    expect(relegatedFound).toBe(true);
  });

  it('strictly bars reserve clubs from promotion into Tier 1 or Tier 2', () => {
    const clubs = getBaseModClubs();
    let currentClubs = clubs.map(c => ({ ...c }));

    for (let yr = 2026; yr <= 2030; yr++) {
      const sim = simulateAiLeagues(currentClubs, 99999, yr, []);
      const movements = (sim as any).movements || [];

      const promosToT1 = movements.filter((m: any) => m.toTier === 1 && m.type === 'promotion');
      const promosToT2 = movements.filter((m: any) => m.toTier === 2 && m.type === 'promotion');

      promosToT1.forEach((m: any) => {
        expect(isReserveClub(m.clubName), `Reserve club ${m.clubName} must not be promoted to Tier 1`).toBe(false);
      });
      promosToT2.forEach((m: any) => {
        if (getMinAllowedTierForReserve(m.country) > 2) {
          expect(isReserveClub(m.clubName), `Reserve club ${m.clubName} (${m.country}) must not be promoted to Tier 2`).toBe(false);
        }
      });

      // Verify no reserve clubs reside in Tier 1 or Tier 2 in Germany
      const gerT1Reserves = sim.filter(c => (c.country || 'GER') === 'GER' && c.tier === 1 && isReserveClub(c.name));
      const gerT2Reserves = sim.filter(c => (c.country || 'GER') === 'GER' && c.tier === 2 && isReserveClub(c.name));
      expect(gerT1Reserves.length).toBe(0);
      expect(gerT2Reserves.length).toBe(0);

      currentClubs = sim.map(c => ({ ...c }));
    }
  });

  it('preserves exact tier capacities across 10 multi-season simulations with 100% mathematical integrity', () => {
    const clubs = getBaseModClubs();
    let currentClubs = clubs.map(c => ({ ...c }));

    for (let yr = 2026; yr <= 2035; yr++) {
      const sim = simulateAiLeagues(currentClubs, 99999, yr, []);
      const gerClubs = sim.filter(c => (c.country || 'GER') === 'GER');

      const t1 = gerClubs.filter(c => c.tier === 1);
      const t2 = gerClubs.filter(c => c.tier === 2);
      const t3 = gerClubs.filter(c => c.tier === 3);

      expect(t1.length, `Year ${yr} Tier 1 must have exactly 18 clubs`).toBe(18);
      expect(t2.length, `Year ${yr} Tier 2 must have exactly 18 clubs`).toBe(18);
      expect(t3.length, `Year ${yr} Tier 3 must have exactly 18 clubs`).toBe(18);

      // Verify zero duplicates
      const uniqueIds = new Set(gerClubs.map(c => c.id));
      expect(uniqueIds.size).toBe(gerClubs.length);

      currentClubs = sim.map(c => ({ ...c }));
    }
  });
});
