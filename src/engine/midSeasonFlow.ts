import { GameEvent, GameState } from '../types';

export interface MidSeasonClosePlan {
  shouldProcess: boolean;
  openPressureModal: boolean;
  pendingMidEventForPressure: GameEvent | null;
  immediateEventToEnqueue: GameEvent | null;
}

export interface MidSeasonCoachMarketPlan {
  shouldProcess: boolean;
  immediateEventToEnqueue: GameEvent | null;
}

/**
 * Determines whether the "Press Briefing Next" indicator should appear inside MidSeasonModal.
 * Matches App.tsx's flashpoint trigger rule: only when a pressure moment is triggered AND
 * has not yet been resolved for the current season year.
 */
export function shouldShowMidSeasonPressBriefingBadge(
  state: Pick<GameState, 'pressureContext' | 'pressureMomentResolvedYear' | 'year'> | null | undefined
): boolean {
  if (!state) return false;
  return Boolean(
    state.pressureContext?.triggerMoment &&
    state.pressureMomentResolvedYear !== state.year
  );
}

/**
 * Computes the one-shot transition plan when MidSeasonModal closes via "Continue" / "X".
 * Ensures that duplicate clicks or lingering exit animations can never re-open PressureMomentModal
 * or re-enqueue the mid-season event once the modal break has already been consumed.
 */
export function resolveMidSeasonClosePlan(params: {
  alreadyConsumed: boolean;
  state: Pick<GameState, 'pressureContext' | 'pressureMomentResolvedYear' | 'year'> | null | undefined;
  midEvent: GameEvent | null | undefined;
  isValidEvent: (evt: unknown) => evt is GameEvent;
}): MidSeasonClosePlan {
  if (params.alreadyConsumed) {
    return {
      shouldProcess: false,
      openPressureModal: false,
      pendingMidEventForPressure: null,
      immediateEventToEnqueue: null,
    };
  }

  const validEvent = params.isValidEvent(params.midEvent) ? params.midEvent : null;
  const openPressureModal = shouldShowMidSeasonPressBriefingBadge(params.state);

  return {
    shouldProcess: true,
    openPressureModal,
    pendingMidEventForPressure: openPressureModal ? validEvent : null,
    immediateEventToEnqueue: openPressureModal ? null : validEvent,
  };
}

/**
 * Computes the one-shot transition plan when jumping from MidSeasonModal to the Coach Market.
 */
export function resolveMidSeasonCoachMarketPlan(params: {
  alreadyConsumed: boolean;
  midEvent: GameEvent | null | undefined;
  isValidEvent: (evt: unknown) => evt is GameEvent;
}): MidSeasonCoachMarketPlan {
  if (params.alreadyConsumed) {
    return {
      shouldProcess: false,
      immediateEventToEnqueue: null,
    };
  }

  return {
    shouldProcess: true,
    immediateEventToEnqueue: params.isValidEvent(params.midEvent) ? params.midEvent : null,
  };
}
