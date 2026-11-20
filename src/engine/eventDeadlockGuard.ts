import type { GameEvent } from '../types';

export interface DualChoiceCostCheckInput {
  choiceIndex: number;
  selectedCost: number;
  alternativeCosts: number[];
  canAfford: (cost: number) => boolean;
}

/**
 * Returns true if the player has at least one OTHER option on the modal that is either free (cost <= 0)
 * or affordable within the current credit line. If false, returning early would permanently deadlock the UI.
 */
export function hasAffordableAlternativeCost({
  alternativeCosts,
  canAfford,
}: Omit<DualChoiceCostCheckInput, 'choiceIndex' | 'selectedCost'>): boolean {
  return alternativeCosts.some((cost) => cost <= 0 || canAfford(cost));
}

/**
 * Evaluates a dynamic event (`resolveDynamicEvent`) to determine whether a credit-limit block should reject the
 * selected option (when a cheaper/free option exists) or allow emergency settlement so the player cannot get trapped.
 */
export function getDynamicEventOptionCosts(event: GameEvent): number[] {
  const extraData = ((event as any)?.extraData || {}) as Record<string, any>;
  const costs: number[] = [];
  if (event.opt1) {
    costs.push(Math.max(0, Number(extraData.opt1Cost) || 0));
  }
  if (event.opt2) {
    costs.push(Math.max(0, Number(extraData.opt2Cost) || 0));
  }
  if (event.opt3) {
    costs.push(Math.max(0, Number(extraData.opt3Cost) || 0));
  }
  return costs;
}

export function shouldRejectDynamicEventForCreditLimit(
  event: GameEvent,
  choiceIndex: number,
  costAttempt: number,
  canAfford: (cost: number) => boolean
): boolean {
  if (costAttempt <= 0 || canAfford(costAttempt)) {
    return false;
  }
  const allCosts = getDynamicEventOptionCosts(event);
  if (allCosts.length <= 1) {
    // Single-option or forced event with no alternative: never trap the player
    return false;
  }
  const alternativeCosts = allCosts.filter((_, idx) => idx !== choiceIndex);
  // Reject ONLY if at least one other option is actually affordable; otherwise allow emergency resolution
  return hasAffordableAlternativeCost({ alternativeCosts, canAfford });
}
