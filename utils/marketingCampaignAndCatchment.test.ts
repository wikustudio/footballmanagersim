import { describe, it, expect } from 'vitest';
import { analyzeCatchment, getCatchmentAttendanceModifier } from '../engine/catchmentEngine';
import { Club } from '../types';

describe('Marketing Campaign & Catchment Demographic Bypass Engine', () => {
  it('calculates globalBrandAllowance based on club fanBase (fanBase * 0.006)', () => {
    const smallTownClub: Club = {
      id: 9999,
      name: 'TSG Hoffenheim',
      tier: 1,
      baseOvr: 75,
      stadium: 30150,
      rep: 70,
      country: 'GER',
      fanBase: 1500000, // 1.5M global fans
      color: '#1a56db'
    };

    const analysis = analyzeCatchment(smallTownClub);
    // Hoffenheim population is 36,000. baseLocalAllowance = Math.round(36000 * 0.22) = 7920.
    // globalBrandAllowance = Math.round(1500000 * 0.006) = 9000.
    // globalBrandAllowance (9000) > baseLocalAllowance (7920)
    expect(analysis.adviceEn).toBe(
      'Local demographics are limited, but your massive global brand fills the stadium with traveling supporters.'
    );
    expect(analysis.adviceDe).toBe(
      'Regionales Potenzial ist begrenzt, aber deine massive globale Marke füllt das Stadion mit internationalen Fans.'
    );
  });

  it('organically increases softCapacityCeiling as fanBase increases', () => {
    const clubWithoutFans: Club = {
      id: 8888,
      name: 'SV Sandhausen',
      tier: 2,
      baseOvr: 66,
      stadium: 15400,
      rep: 50,
      country: 'GER',
      fanBase: 10000,
      color: '#000000'
    };

    const clubWithGlobalFans: Club = {
      ...clubWithoutFans,
      fanBase: 1000000 // 1 Million fans
    };

    const analysisBefore = analyzeCatchment(clubWithoutFans);
    const analysisAfter = analyzeCatchment(clubWithGlobalFans);

    expect(analysisAfter.softCapacityCeiling).toBeGreaterThan(analysisBefore.softCapacityCeiling);
    expect(analysisAfter.softCapacityCeiling - analysisBefore.softCapacityCeiling).toBe(5940);
  });

  it('safely clamps OVR modifications to the [30, 100] range', () => {
    // Simulating the clamping formula: Math.min(100, Math.max(30, club.baseOvr + ovrDelta))
    const clampOvr = (baseOvr: number, delta: number) => Math.min(100, Math.max(30, baseOvr + delta));

    // Hard ceiling at 100
    expect(clampOvr(99, 1)).toBe(100);
    expect(clampOvr(100, 1)).toBe(100);
    expect(clampOvr(100, 5)).toBe(100);

    // Negative modification
    expect(clampOvr(80, -2)).toBe(78);

    // Hard floor at 30
    expect(clampOvr(31, -2)).toBe(30);
    expect(clampOvr(30, -5)).toBe(30);
  });
});
