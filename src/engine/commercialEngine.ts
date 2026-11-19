import { GameState } from '../types';
import { getLeagueScaledVal } from '../data/gameConstants';
import { getNamingRightsOffers } from './liveSimVisualEngine';

export interface SponsorDealOffers {
  baseBoost: number;
  standardVal: number;
  megaVal: number;
  megaChance: number;
  perfTotalVal: number;
  perfUpfrontVal: number;
  perfCompletionBonusVal: number;
  namingAnnualPreviewK: number;
  namingSigningPreviewK: number;
}

/**
 * Single source of truth for commercial sponsorship & naming-rights amounts.
 * Used identically by Commercial UI cards (`WorkspaceTabs`), `handleSponsorSelect`,
 * and `sponsor_pitch_negotiation` event handling in `App.tsx`.
 */
export const calculateSponsorDealOffers = (state: GameState): SponsorDealOffers => {
  const tier = state.club?.tier || 1;
  const country = state.club?.country || 'GER';

  let baseBoost = getLeagueScaledVal(tier, 6500, country);
  if (state.tactic === 'Tiki-Taka') baseBoost = Math.round(baseBoost * 1.15);
  if (state.archetype === 'finance') baseBoost = Math.round(baseBoost * 1.20);

  const hasSalesmaster = (state.managerSkills || []).includes('salesmaster');
  if (hasSalesmaster) baseBoost = Math.round(baseBoost * 1.10);

  const hasSponsorMagnet = state.currentCoach?.strength === 'Sponsor Magnet';
  if (hasSponsorMagnet) baseBoost = Math.round(baseBoost * 1.25);

  const galacticoCommercialMult = state.clubIdentity === 'galactico' ? 1.5 : 1.0;

  const standardVal = Math.round(baseBoost * 1.5 * galacticoCommercialMult);
  const megaVal = Math.round(baseBoost * 2.4 * galacticoCommercialMult);
  const perfTotalVal = Math.round(baseBoost * 2.6 * galacticoCommercialMult);
  const perfUpfrontVal = Math.round(perfTotalVal * 0.4);
  const perfCompletionBonusVal = Math.max(0, perfTotalVal - perfUpfrontVal);

  let megaChance = hasSalesmaster ? 0.55 : 0.40;
  if (hasSponsorMagnet) megaChance += 0.15;
  const pityBonus = Math.min(0.25, Math.floor((state.failedMegaDeals || 0) / 2) * 0.12);
  megaChance = Math.min(0.80, megaChance + pityBonus);

  const namingOffers = getNamingRightsOffers(
    state.club,
    state.reputation ?? 50,
    state.club?.stadium || 15000
  );
  const starterNamingOffer = namingOffers[0];

  return {
    baseBoost,
    standardVal,
    megaVal,
    megaChance,
    perfTotalVal,
    perfUpfrontVal,
    perfCompletionBonusVal,
    namingAnnualPreviewK:
      state.stadiumNamingRights?.annualPayoutK ?? starterNamingOffer?.annualPayoutK ?? getLeagueScaledVal(tier, 520, country),
    namingSigningPreviewK: starterNamingOffer?.signingBonusK ?? 0,
  };
};
