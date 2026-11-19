import { describe, it, expect } from 'vitest';
import { getTrophyImage } from './trophyHelpers';
import {
  getCompetitionLogo,
  getCompetitionLogoSourcePair,
  REAL_TIER1_LEAGUE_URLS,
  REAL_DOMESTIC_CUP_URLS,
} from './competitionLogos';
import { BASE_GAME_COUNTRIES, MOD_ONLY_COUNTRIES, TOURNAMENT_LOGOS } from '../data/gameConstants';

const ALL_34_COUNTRIES = [...BASE_GAME_COUNTRIES, ...MOD_ONLY_COUNTRIES];

describe('Trophy & Competition Logo Helpers', () => {
  it('returns the official Champions League image when mod is active', () => {
    expect(getTrophyImage('cl', 'GER', true)).toBe(TOURNAMENT_LOGOS.cl);
    expect(getTrophyImage('cl', 'GER', true)).toContain('https://');
  });

  it('returns the official domestic cup image when mod is active', () => {
    expect(getTrophyImage('dfb', 'GER', true)).toBe(TOURNAMENT_LOGOS.dfbPokal);
    expect(getTrophyImage('dfb', 'ENG', true)).toBe(REAL_DOMESTIC_CUP_URLS.ENG);
  });

  it('returns empty string for unknown trophy types and regional cups', () => {
    expect(getTrophyImage('unknown_cup')).toBe('');
    expect(getTrophyImage('reg')).toBe('');
  });

  it('resolves real competition URLs when Mod ON and clean non-copyrighted SVG fallbacks when Mod OFF across all 34 countries', () => {
    expect(ALL_34_COUNTRIES.length).toBe(34);

    for (const country of ALL_34_COUNTRIES) {
      // Tier 1 League
      const modOnLeague = getCompetitionLogo({ kind: 'league', country, tier: 1, isModActive: true });
      const modOffLeague = getCompetitionLogo({ kind: 'league', country, tier: 1, isModActive: false });
      expect(modOnLeague).toBe(REAL_TIER1_LEAGUE_URLS[country]);
      expect(modOnLeague.startsWith('https://')).toBe(true);
      expect(modOffLeague.startsWith('data:image/svg+xml;utf8,')).toBe(true);

      // Domestic Cup
      const modOnCup = getCompetitionLogo({ kind: 'cup', country, tier: 1, isModActive: true });
      const modOffCup = getCompetitionLogo({ kind: 'cup', country, tier: 1, isModActive: false });
      expect(modOnCup).toBe(REAL_DOMESTIC_CUP_URLS[country]);
      expect(modOnCup.startsWith('https://')).toBe(true);
      expect(modOffCup.startsWith('data:image/svg+xml;utf8,')).toBe(true);

      // Continental & International Cups
      for (const compId of ['cl', 'el', 'ecl', 'cwc', 'wc'] as const) {
        const pairOn = getCompetitionLogoSourcePair({
          kind: compId === 'wc' ? 'world_cup' : 'continental',
          competitionId: compId,
          country,
          isModActive: true,
        });
        const pairOff = getCompetitionLogoSourcePair({
          kind: compId === 'wc' ? 'world_cup' : 'continental',
          competitionId: compId,
          country,
          isModActive: false,
        });
        expect(pairOn.primary.startsWith('https://')).toBe(true);
        expect(pairOn.fallback.startsWith('data:image/svg+xml;utf8,')).toBe(true);
        expect(pairOff.primary.startsWith('data:image/svg+xml;utf8,')).toBe(true);
        expect(pairOff.isReal).toBe(false);
      }
    }

    // Lower division leagues (>1) stay empty
    expect(getCompetitionLogo({ kind: 'league', country: 'GER', tier: 2, isModActive: true })).toBe('');
    expect(getCompetitionLogo({ kind: 'league', country: 'ENG', tier: 3, isModActive: false })).toBe('');
  });
});

