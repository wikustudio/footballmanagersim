import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSponsorDealOffers } from './commercialEngine';
import { GameState } from '../types';
import { getLeagueScaledVal } from '../data/gameConstants';

const makeBaseState = (overrides: Partial<GameState> = {}): GameState => ({
  club: {
    id: 401,
    name: 'Viktoria Berlin',
    tier: 4,
    country: 'GER',
    baseOvr: 63,
    color: '#0284C7',
    stadium: 12000,
    fanBase: 4800,
    academyLevel: 1,
    medicalLevel: 1,
  },
  year: 2026,
  budget: 1500,
  reputation: 50,
  tactic: 'Total Football',
  archetype: 'balanced',
  managerSkills: [],
  failedMegaDeals: 0,
  history: [],
  ownership: { isOwned: false, clubValue: 5000, stakeOwned: 0 },
  ...overrides,
} as GameState);

describe('commercialEngine calculateSponsorDealOffers parity', () => {
  it('computes Germany Tier 4 standard, mega, and performance offers from the single canonical scale', () => {
    const state = makeBaseState();
    const offers = calculateSponsorDealOffers(state);

    const expectedBase = getLeagueScaledVal(4, 6500, 'GER');
    assert.equal(offers.baseBoost, expectedBase);
    assert.equal(offers.standardVal, Math.round(expectedBase * 1.5));
    assert.equal(offers.megaVal, Math.round(expectedBase * 2.4));
    assert.equal(offers.perfTotalVal, Math.round(expectedBase * 2.6));
    assert.equal(offers.perfUpfrontVal + offers.perfCompletionBonusVal, offers.perfTotalVal);
    assert.equal(offers.megaChance, 0.4);
  });

  it('applies tactical, archetype, manager skill, coach trait, and galactico multipliers consistently', () => {
    const state = makeBaseState({
      tactic: 'Tiki-Taka',
      archetype: 'finance',
      managerSkills: ['salesmaster'],
      clubIdentity: 'galactico',
      failedMegaDeals: 4,
      currentCoach: {
        id: 'c-1',
        name: 'Elena Vance',
        ovrBoost: 3,
        cost: 400,
        repReq: 40,
        style: 'Tiki-Taka',
        country: 'GER',
        strength: 'Sponsor Magnet',
      },
    });
    const offers = calculateSponsorDealOffers(state);
    const plainOffers = calculateSponsorDealOffers(makeBaseState());

    assert.ok(offers.standardVal > plainOffers.standardVal * 2);
    assert.equal(offers.perfUpfrontVal + offers.perfCompletionBonusVal, offers.perfTotalVal);
    // Salesmaster (0.55) + Sponsor Magnet (+0.15) + 4 failed deals (+0.24) clamped at 0.80
    assert.equal(offers.megaChance, 0.8);
  });

  it('uses active naming rights payout when a deal is already signed', () => {
    const state = makeBaseState({
      stadiumNamingRights: {
        partnerName: 'Apex Energy',
        stadiumDisplayName: 'Apex Arena',
        tier: 'national',
        annualPayoutK: 940,
        signingBonusK: 450,
        yearsLeft: 3,
        totalYears: 4,
        signedYear: 2025,
      },
    });
    const offers = calculateSponsorDealOffers(state);
    assert.equal(offers.namingAnnualPreviewK, 940);
  });
});
