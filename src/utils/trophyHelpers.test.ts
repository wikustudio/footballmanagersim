import { describe, it, expect } from 'vitest';
import { getTrophyImage } from './trophyHelpers';
import { TOURNAMENT_LOGOS } from '../data/gameConstants';

describe('Trophy Helpers', () => {
  it('returns the correct Champions Cup image', () => {
    expect(getTrophyImage('cl')).toBe(TOURNAMENT_LOGOS.cl);
  });

  it('returns the correct domestic cup image', () => {
    expect(getTrophyImage('dfb')).toBe(TOURNAMENT_LOGOS.dfbPokal);
  });

  it('returns the generic image for unknown trophy types', () => {
    expect(getTrophyImage('unknown_cup')).toBe('');
  });

  it('returns the generic image for regional cups', () => {
    expect(getTrophyImage('reg')).toBe('');
  });
});
