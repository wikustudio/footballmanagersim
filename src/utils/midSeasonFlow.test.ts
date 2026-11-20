import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  resolveMidSeasonClosePlan,
  resolveMidSeasonCoachMarketPlan,
  shouldShowMidSeasonPressBriefingBadge,
} from '../engine/midSeasonFlow';
import type { GameEvent } from '../types';

const sampleMidEvent: GameEvent = {
  id: 'event_mid_exhibition_1',
  type: 'midseason_sponsor_bonus',
  title: { en: 'Exhibition Tour Invitation', de: 'Einladung zum Winter-Turnier' },
  desc: { en: 'Tour invite', de: 'Turniereinladung' },
  opt1: { title: { en: 'Accept', de: 'Annehmen' }, goodPct: 100 },
  opt2: { title: { en: 'Decline', de: 'Ablehnen' }, goodPct: 100 },
  isForced: false,
};

const isValid = (evt: unknown): evt is GameEvent =>
  Boolean(evt && typeof evt === 'object' && 'type' in evt && 'title' in evt);

describe('Mid-Season Modal Transition & One-Shot Flow', () => {
  it('hides Press Briefing Next badge once pressure moment is resolved for the year', () => {
    const baseContext = {
      evaluatedYear: 2026,
      phase: 'mid' as const,
      scenario: 'expectation_gap' as const,
      pressureScore: 66,
      level: 'high' as const,
      headline: 'Heat rising',
      subheadline: 'Board watching',
      expectedRank: 8,
      actualRank: 14,
      expectationGap: 6,
      ptsGapFromTarget: 8,
      streakLosses: 2,
      triggerMoment: true,
      coachScrutiny: { name: 'Coach', role: 'Head Coach', heatRating: 66, statusTag: 'Under Fire', quote: '...' },
      gmScrutiny: { name: 'Director', role: 'Sporting Director', heatRating: 66, statusTag: 'Tested', quote: '...' },
      mediaOutlets: [],
    };

    expect(
      shouldShowMidSeasonPressBriefingBadge({
        year: 2026,
        pressureMomentResolvedYear: undefined,
        pressureContext: baseContext,
      })
    ).toBe(true);

    expect(
      shouldShowMidSeasonPressBriefingBadge({
        year: 2026,
        pressureMomentResolvedYear: 2026,
        pressureContext: baseContext,
      })
    ).toBe(false);
  });

  it('defers midEvent during active pressure flashpoint and rejects duplicate close calls', () => {
    const unresolvedState = {
      year: 2026,
      pressureMomentResolvedYear: undefined,
      pressureContext: {
        evaluatedYear: 2026,
        phase: 'mid' as const,
        scenario: 'expectation_gap' as const,
        pressureScore: 66,
        level: 'high' as const,
        headline: 'Heat',
        subheadline: 'Sub',
        expectedRank: 6,
        actualRank: 14,
        expectationGap: 8,
        ptsGapFromTarget: 10,
        streakLosses: 2,
        triggerMoment: true,
        coachScrutiny: { name: 'C', role: 'HC', heatRating: 66, statusTag: 'Hot', quote: '' },
        gmScrutiny: { name: 'G', role: 'GM', heatRating: 66, statusTag: 'Hot', quote: '' },
        mediaOutlets: [],
      },
    };

    const first = resolveMidSeasonClosePlan({
      alreadyConsumed: false,
      state: unresolvedState,
      midEvent: sampleMidEvent,
      isValidEvent: isValid,
    });
    expect(first.shouldProcess).toBe(true);
    expect(first.openPressureModal).toBe(true);
    expect(first.pendingMidEventForPressure?.id).toBe(sampleMidEvent.id);
    expect(first.immediateEventToEnqueue).toBeNull();

    const repeat = resolveMidSeasonClosePlan({
      alreadyConsumed: true,
      state: { ...unresolvedState, pressureMomentResolvedYear: 2026 },
      midEvent: sampleMidEvent,
      isValidEvent: isValid,
    });
    expect(repeat.shouldProcess).toBe(false);
    expect(repeat.openPressureModal).toBe(false);
    expect(repeat.pendingMidEventForPressure).toBeNull();
    expect(repeat.immediateEventToEnqueue).toBeNull();
  });

  it('enqueues midEvent immediately when no unresolved pressure moment exists and blocks duplicate coach-market opens', () => {
    const resolvedState = {
      year: 2026,
      pressureMomentResolvedYear: 2026,
      pressureContext: undefined,
    };

    const plan = resolveMidSeasonClosePlan({
      alreadyConsumed: false,
      state: resolvedState,
      midEvent: sampleMidEvent,
      isValidEvent: isValid,
    });
    expect(plan.shouldProcess).toBe(true);
    expect(plan.openPressureModal).toBe(false);
    expect(plan.pendingMidEventForPressure).toBeNull();
    expect(plan.immediateEventToEnqueue?.id).toBe(sampleMidEvent.id);

    const coachPlanFirst = resolveMidSeasonCoachMarketPlan({
      alreadyConsumed: false,
      midEvent: sampleMidEvent,
      isValidEvent: isValid,
    });
    expect(coachPlanFirst.shouldProcess).toBe(true);
    expect(coachPlanFirst.immediateEventToEnqueue?.id).toBe(sampleMidEvent.id);

    const coachPlanRepeat = resolveMidSeasonCoachMarketPlan({
      alreadyConsumed: true,
      midEvent: sampleMidEvent,
      isValidEvent: isValid,
    });
    expect(coachPlanRepeat.shouldProcess).toBe(false);
    expect(coachPlanRepeat.immediateEventToEnqueue).toBeNull();
  });

  it('isolates AnimatePresence + Suspense boundaries with explicit keys and one-shot close guards', () => {
    const appSrc = fs.readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf8');
    const midSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/MidSeasonModal.tsx'), 'utf8');
    const pressSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/PressureMomentModal.tsx'), 'utf8');

    expect(appSrc).toMatch(/key=\{`WinterCampModal-\$\{gameState\.year\}`\}/);
    expect(appSrc).toMatch(/key=\{`MidSeasonModal-\$\{gameState\.year\}`\}/);
    expect(appSrc).toMatch(/key=\{`PressureMomentModal-\$\{gameState\.year\}`\}/);
    expect(appSrc).toMatch(/key=\{`ConfirmResetModal-\$\{gameState\?\.year \|\| 'global'\}`\}/);
    expect(appSrc).toMatch(/key=\{`GlobalTourModal-\$\{gameState\?\.year \|\| 'summary'\}`\}/);
    expect(appSrc).toContain('midSeasonCloseConsumedRef');
    expect(appSrc).toContain('pendingMidEventAfterPressureRef');

    expect(midSrc).toContain('isClosingRef');
    expect(midSrc).toContain('shouldShowMidSeasonPressBriefingBadge(state)');
    expect(midSrc).toContain('pointer-events-none');

    expect(pressSrc).toContain('isClosingRef');
    expect(pressSrc).toContain('pointer-events-none');
  });
});
