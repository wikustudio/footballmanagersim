import { Coach, GameState } from '../types';
import { isReserveClub } from '../data/gameConstants';
import { NamingRightsOffer } from './liveSimVisualEngine';

export interface ActionGuardResult {
  allowed: boolean;
  reason?: string;
}

export function isReserveOrYouthInternalCoach(coach: Pick<Coach, 'isReserveCoach' | 'strength' | 'name'>): boolean {
  return Boolean(
    coach.isReserveCoach ||
      coach.strength === 'Reserve Focus' ||
      coach.strength === 'Youth Integration' ||
      (coach.name && (coach.name.includes('Youth') || coach.name.includes('Reserve')))
  );
}

/**
 * Prevents appointing a new head coach while a current head coach is still employed.
 * Also validates reputation requirement and credit-limit affordability consistently across all entry points.
 */
export function evaluateCoachHireGuard(
  state: Pick<GameState, 'currentCoach' | 'budget' | 'reputation'>,
  coach: Pick<Coach, 'id' | 'cost' | 'repReq' | 'isReserveCoach' | 'strength' | 'name'>,
  creditLimit: number
): ActionGuardResult {
  if (state.currentCoach) {
    if (state.currentCoach.id === coach.id) {
      return { allowed: false, reason: 'Already Head Coach' };
    }
    return { allowed: false, reason: 'Dismiss Current Coach First' };
  }

  const directorRep = state.reputation ?? 50;
  if (directorRep < (coach.repReq || 0)) {
    return { allowed: false, reason: `Requires Reputation ${coach.repReq}` };
  }

  const freeInternal = isReserveOrYouthInternalCoach(coach);
  if (!freeInternal && state.budget - coach.cost < -creditLimit) {
    return { allowed: false, reason: 'Exceeds Credit Limit' };
  }

  return { allowed: true };
}

/**
 * Prevents double-scouting the same coach or spending DP when none remain.
 */
export function evaluateCoachScoutGuard(
  state: Pick<GameState, 'skillPoints' | 'scoutedCoachIds' | 'coachMarketPool'>,
  coachId: string
): ActionGuardResult {
  const alreadyScouted =
    Boolean(state.scoutedCoachIds?.includes(coachId)) ||
    Boolean(state.coachMarketPool?.some((c) => c.id === coachId && c.isScouted));

  if (alreadyScouted) {
    return { allowed: false, reason: 'Coach already scouted' };
  }
  if ((state.skillPoints || 0) < 1) {
    return { allowed: false, reason: 'Insufficient Director Points' };
  }
  return { allowed: true };
}

/**
 * Prevents extending a coach contract past the 5-year cap, renewing with no coach,
 * or exceeding credit limit.
 */
export function evaluateCoachRenewGuard(
  state: Pick<GameState, 'currentCoach' | 'budget'>,
  yearsToAdd: number,
  creditLimit: number
): ActionGuardResult & { actualYearsToAdd?: number; newTotalYears?: number } {
  if (!state.currentCoach) {
    return { allowed: false, reason: 'No active head coach' };
  }
  const currentContract = Math.max(1, state.currentCoach.contractYearsLeft ?? 1);
  if (currentContract >= 5) {
    return { allowed: false, reason: 'Maximum contract length reached (5 years)' };
  }
  const actualYearsToAdd = Math.min(Math.max(1, yearsToAdd), 5 - currentContract);
  if (actualYearsToAdd <= 0) {
    return { allowed: false, reason: 'Maximum contract length reached (5 years)' };
  }
  const freeInternal = isReserveOrYouthInternalCoach(state.currentCoach);
  if (!freeInternal && state.budget - state.currentCoach.cost < -creditLimit) {
    return { allowed: false, reason: 'Insufficient budget for contract renewal' };
  }
  return {
    allowed: true,
    actualYearsToAdd,
    newTotalYears: currentContract + actualYearsToAdd,
  };
}

/**
 * Prevents overwriting an active stadium naming rights contract without ending it first,
 * and prevents infinite upfront signing-bonus farming by enforcing a 1-deal-per-season lock.
 */
export function evaluateNamingRightsSignGuard(
  state: Pick<GameState, 'club' | 'reputation' | 'stadiumNamingRights' | 'year' | 'namingRightsSignedYear'>,
  offer: Pick<NamingRightsOffer, 'partnerName' | 'repRequired'>
): ActionGuardResult {
  if (Boolean(state.club.isReserve) || isReserveClub(state.club.name)) {
    return { allowed: false, reason: 'Reserve clubs cannot sign naming rights deals' };
  }
  if (state.stadiumNamingRights && (state.stadiumNamingRights.yearsLeft ?? 0) > 0) {
    if (state.stadiumNamingRights.partnerName === offer.partnerName) {
      return { allowed: false, reason: 'Active Deal' };
    }
    return { allowed: false, reason: 'End Current Deal First' };
  }
  if (state.namingRightsSignedYear === state.year) {
    return { allowed: false, reason: '1 Deal Per Season · Available Next Season' };
  }
  if ((state.reputation ?? 50) < offer.repRequired) {
    return { allowed: false, reason: `Requires ${offer.repRequired} Rep` };
  }
  return { allowed: true };
}

/**
 * Prevents double-executing an IPO once the club is already publicly traded.
 */
export function evaluateIpoGuard(state: Pick<GameState, 'isPublic' | 'club'>): ActionGuardResult {
  if (state.isPublic) {
    return { allowed: false, reason: 'Club is already publicly traded' };
  }
  if (state.club.tier !== 1) {
    return { allowed: false, reason: 'IPO requires Tier 1 status' };
  }
  return { allowed: true };
}

/**
 * Prevents taking multiple overlapping bank credit facilities.
 */
export function evaluateBankLoanGuard(
  state: Pick<GameState, 'bankLoan'>,
  principal: number
): ActionGuardResult {
  if (state.bankLoan && state.bankLoan.yearsLeft > 0) {
    return { allowed: false, reason: 'Club already has an active bank facility' };
  }
  if (principal <= 0) {
    return { allowed: false, reason: 'Credit facility maxed out' };
  }
  return { allowed: true };
}

/**
 * Prevents executing multiple winter training camps in the same season or exceeding credit limit.
 */
export function evaluateWinterCampGuard(
  state: Pick<GameState, 'winterCampDone' | 'budget'>,
  cost: number,
  creditLimit: number
): ActionGuardResult {
  if (state.winterCampDone) {
    return { allowed: false, reason: 'Winter training camp already completed this season' };
  }
  if (cost > 0 && state.budget - cost < -creditLimit) {
    return { allowed: false, reason: 'Insufficient funds for selected camp' };
  }
  return { allowed: true };
}

/**
 * Validates construction project limits (max 1 per facility type, max 2 total projects per season, level caps 1..5).
 */
export function evaluateFacilityUpgradeGuard(
  state: Pick<
    GameState,
    | 'club'
    | 'budget'
    | 'stadiumExpandedThisSeason'
    | 'academyUpgradedThisSeason'
    | 'medicalUpgradedThisSeason'
  >,
  kind: 'stadium' | 'academy' | 'medical',
  cost: number,
  creditLimit: number
): ActionGuardResult {
  const totalProjects =
    (state.stadiumExpandedThisSeason || 0) +
    (state.academyUpgradedThisSeason || 0) +
    (state.medicalUpgradedThisSeason || 0);

  if (kind === 'stadium' && (state.stadiumExpandedThisSeason || 0) >= 1) {
    return { allowed: false, reason: 'Stadium project already completed this season' };
  }
  if (kind === 'academy') {
    if ((state.club.academyLevel || 1) >= 5) {
      return { allowed: false, reason: 'Academy is already at maximum level' };
    }
    if ((state.academyUpgradedThisSeason || 0) >= 1) {
      return { allowed: false, reason: 'Academy already upgraded this season' };
    }
  }
  if (kind === 'medical') {
    if ((state.club.medicalLevel || 1) >= 5) {
      return { allowed: false, reason: 'Medical facility is already at maximum level' };
    }
    if ((state.medicalUpgradedThisSeason || 0) >= 1) {
      return { allowed: false, reason: 'Medical facility already upgraded this season' };
    }
  }
  if (totalProjects >= 2) {
    return { allowed: false, reason: 'Maximum 2 construction projects per season' };
  }
  if (cost > 0 && state.budget - cost < -creditLimit) {
    return { allowed: false, reason: 'Exceeds credit limit' };
  }
  return { allowed: true };
}

/**
 * Validates facility downgrades (level > 1 and not upgraded in the same season).
 */
export function evaluateFacilityDowngradeGuard(
  state: Pick<GameState, 'club' | 'academyUpgradedThisSeason' | 'medicalUpgradedThisSeason'>,
  kind: 'academy' | 'medical'
): ActionGuardResult {
  if (kind === 'academy') {
    if ((state.club.academyLevel || 1) <= 1) {
      return { allowed: false, reason: 'Academy is already at minimum level' };
    }
    if ((state.academyUpgradedThisSeason || 0) > 0) {
      return { allowed: false, reason: 'Cannot scale back in the same season it was upgraded' };
    }
  } else {
    if ((state.club.medicalLevel || 1) <= 1) {
      return { allowed: false, reason: 'Medical facility is already at minimum level' };
    }
    if ((state.medicalUpgradedThisSeason || 0) > 0) {
      return { allowed: false, reason: 'Cannot scale back in the same season it was upgraded' };
    }
  }
  return { allowed: true };
}

/**
 * Validates sponsor pitches (max 3 per season, no overlapping/blocked performance sponsor).
 */
export function evaluateSponsorPitchGuard(
  state: Pick<
    GameState,
    | 'sponsorsPitchedThisSeason'
    | 'performanceSponsorBlockedNextSeason'
    | 'performanceSponsorSignedThisSeason'
    | 'activePerformanceSponsorTarget'
    | 'activePerformanceSponsor'
  >,
  type: 0 | 1 | 2
): ActionGuardResult {
  if ((state.sponsorsPitchedThisSeason || 0) >= 3) {
    return { allowed: false, reason: 'Sponsor pitch limit reached for this season (max 3)' };
  }
  if (
    type === 2 &&
    (state.performanceSponsorBlockedNextSeason ||
      state.performanceSponsorSignedThisSeason ||
      state.activePerformanceSponsorTarget ||
      state.activePerformanceSponsor)
  ) {
    return { allowed: false, reason: 'Performance sponsor locked or already active' };
  }
  return { allowed: true };
}

/**
 * Validates prestige vanity upgrades (one-time purchases, budget + DP requirements).
 */
export function evaluatePrestigeUpgradeGuard(
  state: Pick<GameState, 'budget' | 'skillPoints' | 'prestigeUpgrades'>,
  type: 'statue' | 'stadium' | 'feeder' | 'immortality'
): ActionGuardResult {
  const upgrades = state.prestigeUpgrades || {};
  if (type === 'statue') {
    if (upgrades.statueBuilt) return { allowed: false, reason: 'Already constructed' };
    if (state.budget < 100000) return { allowed: false, reason: 'Insufficient funds' };
  } else if (type === 'stadium') {
    if (upgrades.stadiumRenamed) return { allowed: false, reason: 'Already renamed' };
    if (state.budget < 250000) return { allowed: false, reason: 'Insufficient funds' };
  } else if (type === 'feeder') {
    if (upgrades.feederClubPurchased) return { allowed: false, reason: 'Already acquired' };
    if (state.budget < 500000) return { allowed: false, reason: 'Insufficient funds' };
    if ((state.skillPoints || 0) < 20) return { allowed: false, reason: 'Requires 20 DP' };
  } else if (type === 'immortality') {
    if (upgrades.managerialImmortality) return { allowed: false, reason: 'Already unlocked' };
    if (state.budget < 500000) return { allowed: false, reason: 'Insufficient funds' };
    if ((state.skillPoints || 0) < 100) return { allowed: false, reason: 'Requires 100 DP' };
  }
  return { allowed: true };
}

/**
 * Validates youth championship victory prize claiming so the same season's victory cannot be claimed twice.
 */
export function evaluateYouthVictoryClaimGuard(
  state: Pick<GameState, 'year' | 'lastYouthChampionshipResult'>
): ActionGuardResult {
  if (
    state.lastYouthChampionshipResult &&
    state.lastYouthChampionshipResult.won &&
    state.lastYouthChampionshipResult.year === state.year
  ) {
    return { allowed: false, reason: 'Youth championship reward already claimed this season' };
  }
  return { allowed: true };
}

/**
 * Validates marketing campaigns (including global tour once-per-season & Tier 1 rule).
 */
export function evaluateMarketingCampaignGuard(
  state: Pick<GameState, 'club' | 'budget' | 'skillPoints' | 'globalToursThisSeason'>,
  cost: number,
  dp: number,
  creditLimit: number,
  campaignId?: string
): ActionGuardResult {
  if (campaignId === 'global_tour') {
    if (state.club.tier !== 1) {
      return { allowed: false, reason: 'Global commercial tour requires Tier 1 status' };
    }
    if ((state.globalToursThisSeason || 0) >= 1) {
      return { allowed: false, reason: 'Global commercial tour already completed this season' };
    }
  }
  if (cost > 0 && state.budget - cost < -creditLimit) {
    return { allowed: false, reason: 'Exceeds credit limit' };
  }
  if ((state.skillPoints || 0) < dp) {
    return { allowed: false, reason: `Requires ${dp} DP` };
  }
  return { allowed: true };
}
