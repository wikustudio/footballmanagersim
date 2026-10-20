import { describe, it, expect } from 'vitest';
import { getOvrTierConfig } from '../components/OvrModal';

describe('Four-Tier Rating Classification (getOvrTierConfig)', () => {
  const avgOvr = 70;

  it('classifies Green (#10b981) — Championship Material for squads > 2 points above division average', () => {
    // Delta +3 (73 vs 70)
    const tier73 = getOvrTierConfig(73, avgOvr);
    expect(tier73.tier).toBe('championship');
    expect(tier73.label).toBe('Championship Material');
    expect(tier73.color).toBe('#10b981');
    expect(tier73.delta).toBe(3);
    expect(tier73.deltaText).toBe('+3 OVR');
    expect(tier73.description).toContain('above division average');
    expect(tier73.description).toContain('title/promotion contender');

    // Delta +8 (78 vs 70)
    const tier78 = getOvrTierConfig(78, avgOvr);
    expect(tier78.tier).toBe('championship');
    expect(tier78.color).toBe('#10b981');
    expect(tier78.delta).toBe(8);
    expect(tier78.deltaText).toBe('+8 OVR');
  });

  it('classifies White (#f4f4f5) — Mid-Table for squads within 2 points of league benchmark (-2 to +2 delta)', () => {
    // Delta +2 (72 vs 70)
    const tier72 = getOvrTierConfig(72, avgOvr);
    expect(tier72.tier).toBe('mid_table');
    expect(tier72.label).toBe('Mid-Table');
    expect(tier72.color).toBe('#f4f4f5');
    expect(tier72.delta).toBe(2);
    expect(tier72.deltaText).toBe('+2 OVR');
    expect(tier72.description).toContain('within 2 points of league benchmark');
    expect(tier72.description).toContain('-2 to +2 delta');

    // Delta 0 (70 vs 70)
    const tier70 = getOvrTierConfig(70, avgOvr);
    expect(tier70.tier).toBe('mid_table');
    expect(tier70.color).toBe('#f4f4f5');
    expect(tier70.delta).toBe(0);
    expect(tier70.deltaText).toBe('0 OVR');

    // Delta -1 (69 vs 70)
    const tier69 = getOvrTierConfig(69, avgOvr);
    expect(tier69.tier).toBe('mid_table');
    expect(tier69.color).toBe('#f4f4f5');
    expect(tier69.delta).toBe(-1);

    // Delta -2 (68 vs 70)
    const tier68 = getOvrTierConfig(68, avgOvr);
    expect(tier68.tier).toBe('mid_table');
    expect(tier68.color).toBe('#f4f4f5');
    expect(tier68.delta).toBe(-2);
    expect(tier68.deltaText).toBe('-2 OVR');
  });

  it('classifies Orange (#f97316) — Low Table Risk for squads 3 to 5 below league benchmark (-3 to -5 delta)', () => {
    // Delta -3 (67 vs 70)
    const tier67 = getOvrTierConfig(67, avgOvr);
    expect(tier67.tier).toBe('low_table_risk');
    expect(tier67.label).toBe('Low Table Risk');
    expect(tier67.color).toBe('#f97316');
    expect(tier67.delta).toBe(-3);
    expect(tier67.deltaText).toBe('-3 OVR');
    expect(tier67.description).toContain('3 to 5 below league benchmark');

    // Delta -4 (66 vs 70)
    const tier66 = getOvrTierConfig(66, avgOvr);
    expect(tier66.tier).toBe('low_table_risk');
    expect(tier66.color).toBe('#f97316');
    expect(tier66.delta).toBe(-4);

    // Delta -5 (65 vs 70)
    const tier65 = getOvrTierConfig(65, avgOvr);
    expect(tier65.tier).toBe('low_table_risk');
    expect(tier65.color).toBe('#f97316');
    expect(tier65.delta).toBe(-5);
    expect(tier65.deltaText).toBe('-5 OVR');
  });

  it('classifies Red (#ef4444) — Relegation Risk for squads more than 5 below league benchmark (< -5 delta)', () => {
    // Delta -6 (64 vs 70)
    const tier64 = getOvrTierConfig(64, avgOvr);
    expect(tier64.tier).toBe('relegation_risk');
    expect(tier64.label).toBe('Relegation Risk');
    expect(tier64.color).toBe('#ef4444');
    expect(tier64.delta).toBe(-6);
    expect(tier64.deltaText).toBe('-6 OVR');
    expect(tier64.description).toContain('more than 5 below league benchmark');
    expect(tier64.description).toContain('relegation peril');

    // Delta -12 (58 vs 70)
    const tier58 = getOvrTierConfig(58, avgOvr);
    expect(tier58.tier).toBe('relegation_risk');
    expect(tier58.color).toBe('#ef4444');
    expect(tier58.delta).toBe(-12);
  });
});
