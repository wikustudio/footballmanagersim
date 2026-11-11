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

  it('ensures single-trophy Champions League wrap avoids multi-trophy wording and 100-rep directors receive premium job offers and proactive poaching', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const seasonFinishSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');
    const jobMarketSrc = fs.readFileSync('src/components/JobMarketModal.tsx', 'utf-8');
    const eventUiSrc = fs.readFileSync('src/components/EventUI.tsx', 'utf-8');

    // 1. SeasonFinishModal does not show 'SILVERWARE & CUP GLORY!' or 'Silverware & Championship Honours' when only 1 trophy is won
    expect(seasonFinishSrc).not.toContain("'SILVERWARE & CUP GLORY!'");
    expect(seasonFinishSrc).not.toContain("'Silverware & Championship Honours'");
    expect(seasonFinishSrc).toContain("`${(trophyList[0]?.name || 'Cup').toUpperCase()} GLORY!`");
    expect(seasonFinishSrc).toContain("trophyList[0]?.badge || (isChamp ? 'Championship Honour' : 'Season Trophy Honour')");

    // 2. High-rep (100 rep) and multi-trophy directors qualify for heavyweight premium Tier 1 offers (both unmodded and modded giants)
    expect(appSrc).toContain('const totalCareerTrophies = Math.max(');
    expect(appSrc).toContain('rep >= 85 ||');
    expect(appSrc).toContain('(rep >= 78 && (totalCareerTrophies >= 2 || everWonLeagueTitle))');
    expect(appSrc).toContain('if (!isBadSeason && (isHeavyweightEligible || hasWonCL || rep >= 80)) {\n      targetTiers = [1];');
    expect(appSrc).toContain("'Real Madrid'");
    expect(appSrc).toContain("'FC Bayern München'");
    expect(appSrc).toContain('const minGiantOvr = rep >= 90 || (rep >= 85 && totalCareerTrophies >= 2) || hasWonCL ? 84 : 82;');

    // 3. Proactive poaching triggers after successful seasons with +15% war-chest budget bonus and loyalty morale reward on decline
    expect(appSrc).toContain("id: 'proactive_poach_' + Date.now()");
    expect(appSrc).toContain('PROACTIVE POACHING · ELITE CLUB INQUIRIES');
    expect(appSrc).toContain('const warChestBudget = Math.round(Math.max(baseStartBudget, normalizedCurrentBudget) * 1.15);');
    expect(appSrc).toContain("if (String(pendingEvent.id || '').startsWith('proactive_poach_'))");
    expect(jobMarketSrc).toContain('Premium Club · Executive Offer');
    expect(eventUiSrc).toContain('Proactive Headhunting · Executive Poaching');
  });

  it('ensures CareerSummary sends both managerName and directorName and server/serverless handlers resolve both safely without undefined', () => {
    const careerSummarySrc = fs.readFileSync('src/components/CareerSummary.tsx', 'utf-8');
    const serverSrc = fs.readFileSync('server.ts', 'utf-8');
    const netlifyFnSrc = fs.readFileSync('netlify/functions/generate-career-summary.ts', 'utf-8');

    expect(careerSummarySrc).toContain('managerName: resolvedManagerName,');
    expect(careerSummarySrc).toContain('directorName: resolvedManagerName,');
    expect(serverSrc).toContain("(typeof directorName === 'string' && directorName.trim())");
    expect(netlifyFnSrc).toContain("(typeof directorName === 'string' && directorName.trim())");
  });

  it('prevents toLocaleString render crashes in SeasonHistoryTable/formatNum and aligns ErrorBoundary with v3 save state', async () => {
    const { formatNum } = await import('../data/gameConstants');
    const { sanitizeGameState } = await import('../App');

    // 1. formatNum safely handles undefined, null, NaN, and valid numbers
    expect(formatNum(undefined)).toBe('0');
    expect(formatNum(null)).toBe('0');
    expect(formatNum(Number.NaN)).toBe('0');
    expect(formatNum(45000)).toBe((45000).toLocaleString());

    // 2. sanitizeGameState fills safe numeric defaults for partial legacy history entries
    const sanitized = sanitizeGameState({
      club: { id: 1, name: 'Test FC', tier: 1, baseOvr: 78, country: 'GER', color: '1d4ed8', stadium: 25000, rep: 75, fanBase: 50000 },
      year: 2027,
      startYear: 2026,
      seasonCount: 2,
      history: [{ year: 2026, tier: 1, position: 4 }],
    });
    expect(sanitized).not.toBeNull();
    expect(sanitized!.history[0].clubName).toBe('Test FC');
    expect(sanitized!.history[0].ovr).toBe(78);
    expect(sanitized!.history[0].pos).toBe(4);
    expect(sanitized!.history[0].att).toBe(0);
    expect(sanitized!.history[0].util).toBe(0);

    // 3. Both src and root SeasonHistoryTable guard optional att/util/clubName fields
    const srcTable = fs.readFileSync('src/components/SeasonHistoryTable.tsx', 'utf-8');
    const rootTable = fs.readFileSync('components/SeasonHistoryTable.tsx', 'utf-8');
    expect(srcTable).toContain("h.att != null ? formatNum(h.att) : '—'");
    expect(rootTable).toContain("h.att != null ? formatNum(h.att) : '—'");
    expect(srcTable).toContain("const safeClubName = h.clubName || state.club.name || 'Club';");
    expect(rootTable).toContain("const safeClubName = h.clubName || state.club.name || 'Club';");

    // 4. ErrorBoundary reads/clears footy_manager_sim_state_v3 (+ IndexedDB) and skips auto-emails on localhost/webdriver
    const errorBoundarySrc = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf-8');
    expect(errorBoundarySrc).toContain("localStorage.getItem('footy_manager_sim_state_v3')");
    expect(errorBoundarySrc).toContain("localStorage.removeItem('footy_manager_sim_state_v3')");
    expect(errorBoundarySrc).toContain("removeFromIndexedDB('footy_manager_sim_state_v3')");
    expect(errorBoundarySrc).toContain("window.location.hostname === 'localhost'");
    expect(errorBoundarySrc).toContain('Boolean(navigator.webdriver)');
  }, 20000);

  it('aligns UI badges, patch notes spotlight, crash/feedback headers, and package metadata on v2.3', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const onboardingSrc = fs.readFileSync('src/components/Onboarding.tsx', 'utf-8');
    const aboutSrc = fs.readFileSync('src/components/AboutPage.tsx', 'utf-8');
    const feedbackSrc = fs.readFileSync('src/components/FeedbackModal.tsx', 'utf-8');
    const errorBoundarySrc = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf-8');
    const serverSrc = fs.readFileSync('server.ts', 'utf-8');
    const netlifyFeedbackSrc = fs.readFileSync('netlify/functions/feedback.ts', 'utf-8');

    expect(pkg.version).toBe('2.3.0');
    expect(onboardingSrc).toContain('v 2.3');
    expect(onboardingSrc).not.toContain('v 2.2');
    expect(aboutSrc).toContain('<span className="text-zinc-400">v2.3</span>');
    expect(aboutSrc).toContain('v2.3 Spotlight');
    expect(aboutSrc).toContain('v2.2 Archive');
    expect(feedbackSrc).toContain('[FMS v2.3');
    expect(errorBoundarySrc).toContain('[FMS v2.3 Auto Crash Report]');
    expect(serverSrc).toContain('[FMS v2.3');
    expect(serverSrc).toContain('FootballManagerSim/2.3');
    expect(netlifyFeedbackSrc).toContain('[FMS v2.3');
    expect(netlifyFeedbackSrc).toContain('FootballManagerSim/2.3');
  });
});




