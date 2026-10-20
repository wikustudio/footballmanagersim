import { describe, it, expect } from 'vitest';
import { generateCoachMarket } from '../engine/coachEngine';
import { calculateClubFinancials } from '../data/gameConstants';
import { GameState } from '../types';

describe('V1.2 Macro Club Identities Update Verification', () => {
  it('weights coach market archetypes according to active club identity', () => {
    // Galactico: heavily weights award_winner and psychological_mastermind
    const galacticoPool = generateCoachMarket(1, 'GER', 80, 0, 'start', 'galactico');
    const galacticoArchetypes = galacticoPool.map(c => c.archetype);
    expect(galacticoArchetypes.some(a => a === 'award_winner' || a === 'psychological_mastermind')).toBe(true);

    // Moneyball: heavily weights pragmatic_grinder and chessboard_maestro
    const moneyballPool = generateCoachMarket(3, 'GER', 60, 0, 'start', 'moneyball');
    const moneyballArchetypes = moneyballPool.map(c => c.archetype);
    expect(moneyballArchetypes.some(a => a === 'pragmatic_grinder' || a === 'chessboard_maestro')).toBe(true);

    // Wonderkid: forces youth_visionary into the pool
    const wonderkidPool = generateCoachMarket(1, 'GER', 90, 0, 'start', 'wonderkid');
    const wonderkidArchetypes = wonderkidPool.map(c => c.archetype);
    expect(wonderkidArchetypes.includes('youth_visionary')).toBe(true);

    // Heritage: heavily weights iron_disciplinarian and low_tier_veteran
    const heritagePool = generateCoachMarket(4, 'GER', 50, 0, 'start', 'heritage');
    const heritageArchetypes = heritagePool.map(c => c.archetype);
    expect(heritageArchetypes.some(a => a === 'iron_disciplinarian' || a === 'low_tier_veteran')).toBe(true);
  });

  it('applies 20% wage relief / expense reduction for Heritage Fortress identity', () => {
    const baseState: Partial<GameState> = {
      year: 2026,
      budget: 50000,
      club: {
        id: 1,
        name: 'Historic FC',
        tier: 1,
        country: 'GER',
        baseOvr: 80,
        stadium: 40000,
        fanBase: 500000,
        academyLevel: 2,
        medicalLevel: 2,
        squadSize: 25,
        color: '#ff0000',
      },
      clubIdentity: 'balanced',
    };

    const balancedFin = calculateClubFinancials(baseState as any);
    const heritageState = { ...baseState, clubIdentity: 'heritage' };
    const heritageFin = calculateClubFinancials(heritageState as any);

    expect(heritageFin.wages).toBe(Math.round(balancedFin.wages * 0.8));
    expect(heritageFin.pureWages).toBe(Math.round(balancedFin.pureWages * 0.8));
  });

  it('enforces Galactico Tax board penalty when no marquee signing occurred', () => {
    const state: any = {
      clubIdentity: 'galactico',
      marqueeSignedThisSeason: false,
      clubImpactScore: 50,
    };
    const decayReasons: string[] = [];

    if (state.clubIdentity === 'galactico' && !state.marqueeSignedThisSeason) {
      state.clubImpactScore = Math.max(0, (state.clubImpactScore || 50) - 25);
      decayReasons.push('Marquee Mandate Failed: Board furious over lack of superstar signings (-25 Impact).');
    }

    expect(state.clubImpactScore).toBe(25);
    expect(decayReasons).toContain('Marquee Mandate Failed: Board furious over lack of superstar signings (-25 Impact).');
  });

  it('enforces Wonderkid Tax auto-sale when squad OVR exceeds league average', () => {
    const state: any = {
      clubIdentity: 'wonderkid',
      club: { tier: 1, country: 'GER', baseOvr: 85 },
      budget: 10000,
    };
    const league = { avgOvr: 80 };
    const decayReasons: string[] = [];

    if (state.clubIdentity === 'wonderkid' && state.club.baseOvr > league.avgOvr) {
      const saleCash = 18000;
      state.budget += saleCash;
      state.club.baseOvr -= 2;
      decayReasons.push(`Board auto-sold top prospect to balance books (+€18.00M, -2 OVR).`);
    }

    expect(state.club.baseOvr).toBe(83);
    expect(state.budget).toBe(28000);
    expect(decayReasons.length).toBe(1);
  });
});
