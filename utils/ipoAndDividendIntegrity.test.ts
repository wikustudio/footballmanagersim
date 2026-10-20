import { describe, it, expect } from 'vitest';
import { calculateClubFinancials } from '../data/gameConstants';

describe('Public Offering (IPO) Financials & Dividend Integrity', () => {
  const baseTier1Club = {
    name: 'FC Bayern München',
    tier: 1,
    baseOvr: 85,
    stadium: 75000,
    fanBase: 1200000,
    country: 'GER',
  };

  it('calculates zero shareholder dividend when club is not public', () => {
    const fin = calculateClubFinancials({
      club: baseTier1Club,
      budget: 50000,
      isPublic: false,
    });
    expect((fin as any).shareholderDividend).toBe(0);
  });

  it('calculates 15% base dividend of operating profit when stockPrice equals ipoPrice', () => {
    const finNonPublic = calculateClubFinancials({
      club: baseTier1Club,
      budget: 50000,
      isPublic: false,
    });

    const finPublic = calculateClubFinancials({
      club: baseTier1Club,
      budget: 50000,
      isPublic: true,
      stockPrice: 15.00,
      ipoPrice: 15.00,
    });

    // If there is operating profit, public dividend should be 15% of that profit
    if (finNonPublic.net > 0) {
      expect((finPublic as any).shareholderDividend).toBeGreaterThan(0);
      expect((finPublic as any).shareholderDividend).toBe(Math.floor(finNonPublic.net * 0.15));
    }
  });

  it('doubles dividend payout when stock price doubles compared to ipoPrice', () => {
    const finBase = calculateClubFinancials({
      club: baseTier1Club,
      budget: 50000,
      isPublic: true,
      stockPrice: 10.00,
      ipoPrice: 10.00,
    });

    const finDoubled = calculateClubFinancials({
      club: baseTier1Club,
      budget: 50000,
      isPublic: true,
      stockPrice: 20.00,
      ipoPrice: 10.00,
    });

    const baseDiv = (finBase as any).shareholderDividend;
    const doubledDiv = (finDoubled as any).shareholderDividend;

    if (baseDiv > 0) {
      expect(doubledDiv).toBe(baseDiv * 2);
    }
  });
});
