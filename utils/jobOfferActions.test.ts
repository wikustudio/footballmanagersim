import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('Job Offers & Contract Vacancy UI Surgery', () => {
  it('ensures club cards are not clickable containers and only Sign Contract or Retire buttons trigger action', () => {
    const eventUiSrc = fs.readFileSync('src/components/EventUI.tsx', 'utf-8');

    // Club card must be a div, not a clickable button
    expect(eventUiSrc).toContain('c.id || `${c.name}-${idx}`');
    expect(eventUiSrc).toContain('className="w-full bg-white/[0.025] p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col border border-white/[0.08] relative overflow-hidden text-left shadow-sm cursor-default"');

    // Ensure the card wrapper does not have onClick
    expect(eventUiSrc).not.toMatch(/<button\s+key=\{c\.id\s*\|\|\s*`\$\{c\.name\}-\$\{idx\}`\}\s+onClick=/);

    // Dedicated Sign Contract button has the resolution handler
    expect(eventUiSrc).toContain("onResolve(idx + 1)");
    expect(eventUiSrc).toContain("t('Sign Contract', 'Vertrag Unterschreiben')");

    // Dedicated Retire button has resolution handler
    expect(eventUiSrc).toContain("onResolve(999)");
    expect(eventUiSrc).toContain("t('End Director Career & Retire'");
  });

  it('ensures pendingForcedEvent and forced events are cleared when accepting a new club', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

    // handleAcceptJobOffer clears pendingForcedEvent
    expect(appSrc).toContain('pendingForcedEvent: undefined');
    expect(appSrc).toContain('delete (updated as any).pendingForcedEvent;');

    // handleAcceptJobOffer clears forced events from eventQueue
    expect(appSrc).toContain("setEventQueue(prev => (prev || []).filter(e => !e.isForced && e.type !== 'job_offer'));");

    // sanitizeGameState auto-heals if the user already directs one of the clubs from the forced offer
    expect(appSrc).toContain('const isForcedJobOfferAlreadySigned = state.pendingForcedEvent?.type === \'job_offer\'');

    // handleSimulateSeason does not bounce user back to job offers after signing
    expect(appSrc).toContain('isAlreadySigned');
  });

  it('ensures LeagueTableModal has explicit dynamic viewport height and internal scrolling for Universe Movements on mobile', () => {
    const modalSrc = fs.readFileSync('src/components/LeagueTableModal.tsx', 'utf-8');

    // Backdrop must not scroll to avoid gesture competition on mobile
    expect(modalSrc).toContain('overflow-hidden');

    // Modal card must have explicit dynamic viewport height on mobile (h-[96dvh]) and fluid shrink-wrap on desktop (sm:h-auto max-h-[88vh])
    expect(modalSrc).toContain('h-[96dvh] sm:h-auto max-h-[96dvh] sm:max-h-[88vh]');

    // Invisible select pattern layers opacity-0 text-base select over font-accurate Jakarta pill
    expect(modalSrc).toContain('opacity-0 cursor-pointer text-base');

    // Universe movements feed must be an in-flow flex-1 scroll container with touch-pan-y and smooth momentum scrolling
    expect(modalSrc).toContain('ref={universeScrollRef}');
    expect(modalSrc).toContain('flex-1 min-h-0');
    expect(modalSrc).toContain('overflow-y-auto overscroll-contain custom-scrollbar');
    expect(modalSrc).toContain('touch-pan-y');
    expect(modalSrc).toContain("WebkitOverflowScrolling: 'touch'");
  });

  it('ensures youth pipeline and coach nurturing logic fixes are active', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const winterModalSrc = fs.readFileSync('src/components/WinterCampModal.tsx', 'utf-8');

    // Bug 1: Pull Youth Early uses timer <= 1
    expect(appSrc).toContain('(gameState.youthPipeline || []).filter(y => y.timer <= 1)');
    expect(winterModalSrc).toContain('state.youthPipeline.some(y => y.timer <= 1)');

    // Bug 2: Coach youthNurturing uses youthPipeline and boost
    expect(appSrc).toContain('if (youthNurturing >= 16 && state.youthPipeline && state.youthPipeline.length > 0)');
    expect(appSrc).toContain('state.youthPipeline[0].boost = Math.min(99, state.youthPipeline[0].boost + 1)');

    // Bug 3: Toast spam prevented by checking item.status !== ready
    expect(appSrc).toContain("if (item.status !== 'ready')");
  });

  it('ensures AI tier overwrite is removed and global tour morale changes are active', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

    // Bug 1: No rogue maxCountryTier overwrite block corrupting AI engine tier results
    expect(appSrc).not.toContain('const maxCountryTier = getMaxTier(state.club.country || \'GER\', newClubsDb);');
    expect(appSrc).not.toContain('c.tier = seasonLeague - 1; // Sync promotions!');

    // Bug 2: handleGlobalTour has dynamic moraleChange enabled without debug if (false) bypass
    expect(appSrc).toContain('moraleChange = -15;');
    expect(appSrc).toContain('moraleChange = 30;');
    expect(appSrc).toContain('updated.club.morale = Math.max(0, (updated.club.morale || 100) + moraleChange);');
    expect(appSrc).toContain('updated.club.morale = Math.min(100, (updated.club.morale || 100) + moraleChange);');
  });

  it('ensures resigned coach resurrection loophole is closed and handleResolveEvent has no duplicate shadowing', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

    // Resigned coach resurrection safeguard
    expect(appSrc).toContain('(state.currentCoach && !coachResigned) ? JSON.parse(JSON.stringify(state.currentCoach)) : null');

    // Ensure red_bull_collapse only occurs once in handleResolveEvent
    const handleResolveSection = appSrc.slice(appSrc.indexOf('const handleResolveEvent ='));
    const rbMatches = [...handleResolveSection.matchAll(/pendingEvent\.type === 'red_bull_collapse'/g)];
    expect(rbMatches.length).toBe(1);

    // Ensure mid_season_resignation only occurs once in handleResolveEvent
    const msMatches = [...handleResolveSection.matchAll(/pendingEvent\.type === 'mid_season_resignation'/g)];
    expect(msMatches.length).toBe(1);
  });

  it('ensures formerly managed clubs preserve tier and OVR and autoRepairClubsDb balances 17/19 deficits to exact 18-team leagues', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const safeguardsSrc = fs.readFileSync('src/utils/modSafeguards.ts', 'utf-8');

    // 1. handleAcceptJobOffer persists tier into managedClubFacilities
    expect(appSrc).toContain('tier: prev.club.tier');

    // 2. mergeClubsDbSafeguards respects facilitySaved.tier
    expect(safeguardsSrc).toContain('if (facilitySaved?.tier && typeof facilitySaved.tier === \'number\' && facilitySaved.tier >= 1)');
    expect(safeguardsSrc).toContain('tier = facilitySaved.tier;');

    // 3. autoRepairClubsDb accepts gameState to protect currently and formerly managed clubs
    expect(safeguardsSrc).toContain('export function autoRepairClubsDb(clubs: Club[], isModActive: boolean, gameState?: GameState | null)');
    expect(safeguardsSrc).toContain('const managedFacilities = gameState?.managedClubFacilities || {};');

    // 4. Single-pass linear balancing fills deficit upper tiers from lower tiers
    expect(safeguardsSrc).toContain('Single-pass linear tier balancing');
    expect(safeguardsSrc).toContain('const deficit = 18 - inUpper.length;');
  });
});


