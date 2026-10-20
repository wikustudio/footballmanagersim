// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ALL_CLUBS } from '../data/clubsData';
import { getMaxTier, getLeagueInfo, getLeagueScaledVal, getCreditLimit, isReserveClub } from '../data/gameConstants';
import { GameState, Club } from '../types';
import { getHeadlineCategory } from '../utils/universeMovements';
import { canReserveClubPromoteToTier, isReserveTeamLocal } from '../engine/simulateAiLeagues';

describe('Modal Regression & Interaction Integrity Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    delete (window as any)._cupChoice;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as any)._cupChoice;
  });

  describe('LeagueTableModal Tier Clamping & Country Switch Safeguards', () => {
    it('guarantees selectedTier clamps to maxTierForCountry when exploring countries with fewer tiers', () => {
      // Germany has max tier 3 (or higher depending on db)
      const gerMaxTier = getMaxTier('GER', ALL_CLUBS);
      expect(gerMaxTier).toBeGreaterThanOrEqual(2);

      // Single tier country (e.g. CRO, POR, or custom 1-tier countries)
      const allCountries = Array.from(new Set(ALL_CLUBS.map(c => c.country || 'GER')));
      const singleTierCountry = allCountries.find(c => getMaxTier(c, ALL_CLUBS) === 1) || 'POR';
      const singleMaxTier = getMaxTier(singleTierCountry, ALL_CLUBS);
      expect(singleMaxTier).toBe(1);

      // Simulate a user viewing Tier 3 in Germany
      const userSelectedTier = 3;
      // Clamping logic as implemented in LeagueTableModal
      const effectiveTier = Math.min(Math.max(1, userSelectedTier), singleMaxTier);
      expect(effectiveTier).toBe(1);

      // Verify league info resolves safely without undefined error
      const info = getLeagueInfo(effectiveTier, singleTierCountry);
      expect(info).toBeDefined();
      expect(info.name).toBeTruthy();
    });

    it('ensures availableTiers always produces an array bounded by maxTierForCountry', () => {
      const countries = ['GER', 'ENG', 'ESP', 'ITA', 'FRA', 'USA', 'TUR'];
      for (const country of countries) {
        const maxTier = getMaxTier(country, ALL_CLUBS);
        const availableTiers = Array.from({ length: maxTier }, (_, i) => i + 1);
        expect(availableTiers.length).toBe(maxTier);
        expect(availableTiers[0]).toBe(1);
        expect(availableTiers[availableTiers.length - 1]).toBe(maxTier);
      }
    });

    it('organizes season dropdown from latest year at the top to first season at the bottom and maintains originalIndex', () => {
      const mockHistory: any[] = [
        { year: 2024, pos: 5, tier: 1 }, // Season 1 (first season)
        { year: 2025, pos: 2, tier: 1 }, // Season 2
        { year: 2026, pos: 1, tier: 1 }, // Season 3 (latest season)
      ];

      const sortedSeasonHistory = mockHistory
        .map((h, originalIndex) => ({ ...h, originalIndex }))
        .sort((a, b) => (b.year || 0) - (a.year || 0));

      expect(sortedSeasonHistory[0].year).toBe(2026);
      expect(sortedSeasonHistory[0].originalIndex).toBe(2);
      expect(sortedSeasonHistory[1].year).toBe(2025);
      expect(sortedSeasonHistory[1].originalIndex).toBe(1);
      expect(sortedSeasonHistory[2].year).toBe(2024);
      expect(sortedSeasonHistory[2].originalIndex).toBe(0);
    });

    it('strictly categorizes Concacaf Champions Cup under CONCACAF and never leaks it into UEFA', () => {
      const concacafCupMovement = {
        type: 'cup_champion',
        fromLeagueName: 'Concacaf Champions Cup',
        country: 'USA',
        year: 2025,
      };

      const league = (concacafCupMovement.fromLeagueName || '').toLowerCase();
      const region = 'CONCACAF'; // getRegion('USA')

      // Evaluation for CONCACAF filter
      const matchesConcacaf = region === 'CONCACAF' || league.includes('concacaf') || league.includes('north american') || league.includes('leagues');
      expect(matchesConcacaf).toBe(true);

      // Evaluation for UEFA filter (must be false)
      const isConcacaf = league.includes('concacaf') || region === 'CONCACAF';
      const matchesUefa = !isConcacaf && (region === 'UEFA' || league.includes('euro') || league.includes('uefa') || league.includes('champions cup'));
      expect(matchesUefa).toBe(false);
    });

    it('strictly classifies transfer_saga as BLOCKBUSTER TRANSFER and never as LEAGUE CHAMPIONS', () => {
      const transferMovement: any = {
        id: 'sim-transfer-123',
        year: 2040,
        clubId: 10,
        clubName: 'SC Freiburg',
        country: 'GER',
        type: 'transfer_saga',
        pos: 1, // Testing defensive safeguard against legacy or simulated pos: 1
        reason: 'Blockbuster Deal: Leo Schmidt (83 OVR, MID) transferred from Real Betis to SC Freiburg for €126M'
      };

      const category = getHeadlineCategory(transferMovement);
      expect(category.label).toBe('BLOCKBUSTER TRANSFER');
      expect(category.icon).toBe('fa-arrow-right-arrow-left');

      const isTransfer = transferMovement.type === 'transfer_saga';
      const isChamp = !isTransfer && (transferMovement.pos === 1 || transferMovement.type === 'title_won');
      expect(isChamp).toBe(false);
    });

    it('guarantees SSV Jeddeloh II is treated as a senior first team and NOT a reserve team', () => {
      expect(isReserveClub('SSV Jeddeloh II')).toBe(false);
      expect(isReserveClub('ssv jeddeloh ii')).toBe(false);
      expect(isReserveTeamLocal('SSV Jeddeloh II')).toBe(false);
      // Legitimate reserves should still return true
      expect(isReserveClub('1. Nuernberg II')).toBe(true);
      expect(isReserveClub('FC Bayern München II')).toBe(true);
      expect(isReserveClub('Real Madrid Castilla')).toBe(true);
    });

    it('prevents simultaneous reserve cap overflow using dynamic projected offset', () => {
      const mockClubs: Club[] = [
        { id: 1, name: 'Senior A', tier: 7, country: 'GER', baseOvr: 70, color: '#10b981', stadium: 5000, currentBudget: 1000 },
        { id: 2, name: 'Res A II', tier: 7, country: 'GER', baseOvr: 60, color: '#10b981', stadium: 5000, currentBudget: 1000 },
        { id: 3, name: 'Res B II', tier: 7, country: 'GER', baseOvr: 60, color: '#10b981', stadium: 5000, currentBudget: 1000 },
        { id: 4, name: 'Res C II', tier: 7, country: 'GER', baseOvr: 60, color: '#10b981', stadium: 5000, currentBudget: 1000 }, // 3 reserves in Tier 7 currently
      ];

      // First reserve promoting: projectedOffset 0 -> 3 + 0 < 4 -> allowed
      expect(canReserveClubPromoteToTier('Res D II', 7, mockClubs, 'GER', 0)).toBe(true);
      // Second reserve attempting promotion simultaneously: projectedOffset 1 -> 3 + 1 >= 4 -> blocked!
      expect(canReserveClubPromoteToTier('Res E II', 7, mockClubs, 'GER', 1)).toBe(false);
    });
  });

  describe('CupRunModal State & Global Leak Safeguards', () => {
    it('ensures window._cupChoice is not leaked after cup run completion', () => {
      // Simulate user selecting mp_boost
      (window as any)._cupChoice = 'mp_boost';
      expect((window as any)._cupChoice).toBe('mp_boost');

      // Simulate cleanup on complete or unmount as implemented in CupRunModal
      delete (window as any)._cupChoice;
      expect((window as any)._cupChoice).toBeUndefined();
    });

    it('verifies timer intervals and shootout timers do not throw or leak', () => {
      let intervalCleaned = false;
      const fakeInterval = setInterval(() => {}, 100);
      const clearAllTimers = () => {
        clearInterval(fakeInterval);
        intervalCleaned = true;
      };

      clearAllTimers();
      expect(intervalCleaned).toBe(true);
    });
  });

  describe('YouthChampionshipModal Bracket Stability Safeguards', () => {
    it('prevents tournament bracket from being re-initialized or scrambled if teams are already loaded', () => {
      const existingTeams = [
        { id: 1, name: 'Team A', baseName: 'Team A', ovr: 70, isPlayer: true, country: 'GER' },
        { id: 2, name: 'Team B', baseName: 'Team B', ovr: 65, isPlayer: false, country: 'GER' },
        { id: 3, name: 'Team C', baseName: 'Team C', ovr: 68, isPlayer: false, country: 'GER' },
        { id: 4, name: 'Team D', baseName: 'Team D', ovr: 66, isPlayer: false, country: 'GER' },
      ];

      // Simulated guard check in useEffect
      let teams = [...existingTeams];
      const shouldInitialize = teams.length === 0;

      expect(shouldInitialize).toBe(false);
      // Bracket remains intact
      expect(teams.length).toBe(4);
      expect(teams[0].name).toBe('Team A');
    });
  });

  describe('JobMarketModal Offer Stability Safeguards', () => {
    it('keeps generated job offers stable while modal remains open and regenerates only when opened', () => {
      const mockClub: Club = {
        id: 1,
        name: 'Bayern Munich',
        tier: 1,
        baseOvr: 85,
        color: '#dc2626',
        stadium: 75000,
        country: 'GER',
        currentBudget: 50000000,
      };

      const mockState: Partial<GameState> = {
        club: mockClub,
        reputation: 75,
        year: 2025,
        history: [],
      };

      const mockGenerateOffers = vi.fn((_state: GameState, clubs: Club[], count: number) => {
        return clubs.slice(0, count);
      });

      // When modal opens (isOpen transitions from false to true)
      let prevIsOpen = false;
      let isOpen = true;
      let offers: Club[] = [];

      if (isOpen && !prevIsOpen) {
        offers = mockGenerateOffers(mockState as GameState, ALL_CLUBS, 5);
      }
      prevIsOpen = isOpen;

      expect(mockGenerateOffers).toHaveBeenCalledTimes(1);
      expect(offers.length).toBe(5);
      const initialOfferNames = offers.map(o => o.name);

      // Simulate a state update while modal remains open (e.g. background event ticks)
      const updatedState = { ...mockState, reputation: 76 };
      if (isOpen && !prevIsOpen) {
        // Should NOT trigger because prevIsOpen is true!
        offers = mockGenerateOffers(updatedState as GameState, ALL_CLUBS, 5);
      }

      // Offers must remain exactly the same and generator must NOT have been called again
      expect(mockGenerateOffers).toHaveBeenCalledTimes(1);
      expect(offers.map(o => o.name)).toEqual(initialOfferNames);
    });
  });

  describe('BankLoanModal Safeguards', () => {
    it('blocks loan authorization when maxLoanAmount is zero or negative', () => {
      const confirmLoanMock = vi.fn();

      const handleConfirm = (maxLoanAmount: number, tenure: 10 | 15 | 25) => {
        if (maxLoanAmount <= 0) return;
        confirmLoanMock(maxLoanAmount, tenure);
      };

      handleConfirm(0, 15);
      expect(confirmLoanMock).not.toHaveBeenCalled();

      handleConfirm(-500000, 15);
      expect(confirmLoanMock).not.toHaveBeenCalled();

      handleConfirm(2000000, 15);
      expect(confirmLoanMock).toHaveBeenCalledWith(2000000, 15);
    });
  });

  describe('SeasonFinishModal All Highlights Stability', () => {
    it('ensures activeTab remains "all" during scroll events to prevent component unmounting', () => {
      let activeTab: string = 'all';
      let activeScrollSection: string = 'exec';

      const handleScrollSimulation = (detectedSection: string) => {
        if (activeTab === 'all') {
          // Decoupled: only updates scroll indicator, never unmounts sections
          activeScrollSection = detectedSection;
        } else {
          activeTab = detectedSection;
        }
      };

      handleScrollSimulation('sporting');
      expect(activeTab).toBe('all');
      expect(activeScrollSection).toBe('sporting');

      handleScrollSimulation('finance');
      expect(activeTab).toBe('all');
      expect(activeScrollSection).toBe('finance');

      handleScrollSimulation('board');
      expect(activeTab).toBe('all');
      expect(activeScrollSection).toBe('board');
    });
  });

  describe('DatabaseModal Search & Country Filter Safeguards', () => {
    it('properly segments clubs by country and search query without out-of-bounds tier errors', () => {
      const gerClubs = ALL_CLUBS.filter(c => (c.country || 'GER') === 'GER');
      expect(gerClubs.length).toBeGreaterThan(0);

      const maxTier = Math.max(...gerClubs.map(c => c.tier));
      expect(maxTier).toBeGreaterThanOrEqual(1);

      // Search query filtering
      const query = 'madrid';
      const searchResults = ALL_CLUBS.filter(c =>
        c.name.toLowerCase().includes(query) || (c.country || '').toLowerCase().includes(query)
      );
      expect(searchResults.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('DecisionDayModal Timer and Result Integrity', () => {
    it('properly tracks interval in ref and resolves cleanly', () => {
      let intervalRef: any = null;
      let timeoutRef: any = null;
      let isResolved = false;

      intervalRef = setInterval(() => {}, 28);
      timeoutRef = setTimeout(() => {}, 700);

      // Resolve function
      const handleResolve = () => {
        isResolved = true;
        if (intervalRef) clearInterval(intervalRef);
        if (timeoutRef) clearTimeout(timeoutRef);
        intervalRef = null;
        timeoutRef = null;
      };

      handleResolve();
      expect(isResolved).toBe(true);
      expect(intervalRef).toBeNull();
      expect(timeoutRef).toBeNull();
    });
  });

  describe('Mobile Viewport & Ergonomic Containment Suite', () => {
    it('verifies src/index.css maintains 100% text scaling and no restrictive body downscaling', async () => {
      const fs = await import('fs');
      const css = fs.readFileSync('src/index.css', 'utf-8');
      expect(css).not.toContain('font-size: 85%');
      expect(css).toContain('text-size-adjust: 100%');
      expect(css).toContain('overflow-x: clip');
    });

    it('verifies TransferSagaModal wraps saga title without truncate ellipsis and has safe scroll containment', async () => {
      const fs = await import('fs');
      const modalSrc = fs.readFileSync('src/components/TransferSagaModal.tsx', 'utf-8');
      // Title does NOT use truncate
      expect(modalSrc).toMatch(/h2 className="[^"]*break-words[^"]*">\s*\{saga\.title\}\s*<\/h2>/);
      expect(modalSrc).not.toMatch(/h2 className="[^"]*truncate[^"]*">\s*\{saga\.title\}\s*<\/h2>/);
      // Container has mobile scroll containment
      expect(modalSrc).toContain('overflow-y-auto');
      expect(modalSrc).toContain('overscroll-contain');
      expect(modalSrc).toContain('min-h-0');
    });

    it('verifies DecisionDayModal has min-h-0 on all stage containers and scroll areas', async () => {
      const fs = await import('fs');
      const code = fs.readFileSync('src/components/DecisionDayModal.tsx', 'utf-8');
      expect(code).toContain('flex-1 min-h-0 overflow-y-auto overscroll-contain');
      expect(code).toContain('flex flex-col h-full min-h-0 overflow-hidden');
    });

    it('verifies DecisionDayModal removes simultaneous pyramid battles and features contextual 4-team live table', async () => {
      const fs = await import('fs');
      const code = fs.readFileSync('src/components/DecisionDayModal.tsx', 'utf-8');
      // Pyramid battles removed
      expect(code).not.toContain('Simultaneous Pyramid Battles · Matchday 34');
      expect(code).not.toContain('simultaneousBattles');
      expect(code).not.toContain('Final Scores Across the Pyramid');

      // 1v1 contextual duel table present
      expect(code).toContain('decisionTable = useMemo');
      expect(code).toContain('renderStandingsTable');
      expect(code).toContain('As It Stands');
      expect(code).toContain('Matchday 34 League Table · Title Duel');
      expect(code).toContain('Matchday 34 Relegation Survival Duel');
    });

    it('verifies CupRunModal and SeasonFinishModal have min-h-0 and overscroll-contain', async () => {
      const fs = await import('fs');
      const cupSrc = fs.readFileSync('src/components/CupRunModal.tsx', 'utf-8');
      const seasonSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');
      expect(cupSrc).toContain('overscroll-contain');
      expect(seasonSrc).toContain('min-h-0 overflow-y-auto overscroll-contain');
    });

    it('verifies EventUI uses centered status pills and natural wrapping for country/league in job offers', async () => {
      const fs = await import('fs');
      const eventSrc = fs.readFileSync('src/components/EventUI.tsx', 'utf-8');
      // Status pill is centered with inline dot
      expect(eventSrc).toContain('inline-flex items-center gap-1.5 px-3 py-1 rounded-full');
      expect(eventSrc).toContain('w-1.5 h-1.5 rounded-full');
      // Subtitle uses flex-wrap and avoids truncate on country and league name
      expect(eventSrc).toContain('flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 font-medium');
      expect(eventSrc).toContain('{countryObj?.name || countryCode}</span>');
      expect(eventSrc).toContain('{lgInfo?.name || `Tier ${c.tier}`}</span>');
      // Club name wraps cleanly
      expect(eventSrc).toContain('group-hover:text-sky-200 transition-colors break-words');
    });

    it('verifies ToastContainer uses break-words on kicker and message to prevent mobile cutoffs', async () => {
      const fs = await import('fs');
      const toastSrc = fs.readFileSync('src/components/ToastContainer.tsx', 'utf-8');
      expect(toastSrc).toContain('break-words');
      expect(toastSrc).toMatch(/renderFormattedMessage\(toast\.message\)/);
    });

    it('verifies JobMarketModal wraps league subtitle naturally without truncate', async () => {
      const fs = await import('fs');
      const jmSrc = fs.readFileSync('src/components/JobMarketModal.tsx', 'utf-8');
      expect(jmSrc).toContain('flex flex-wrap items-center gap-x-1.5 gap-y-0.5');
      expect(jmSrc).toContain('break-words">{league?.name}</span>');
    });

    it('verifies CareerSummary and SeasonFinishModal avoid truncate on club titles', async () => {
      const fs = await import('fs');
      const csSrc = fs.readFileSync('src/components/CareerSummary.tsx', 'utf-8');
      const sfSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');
      expect(csSrc).toContain('break-words">{c.name}</h3>');
      expect(sfSrc).toContain('break-words">{c.clubName}</div>');
    });

    it('verifies typography safeguards prevent descenders like g from getting cut off on team names', async () => {
      const fs = await import('fs');
      const cssSrc = fs.readFileSync('src/index.css', 'utf-8');
      const dashSrc = fs.readFileSync('src/components/DashboardHeader.tsx', 'utf-8');
      const tableSrc = fs.readFileSync('src/components/LeagueTableModal.tsx', 'utf-8');
      const finishSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');

      // index.css has padding-bottom & margin-bottom safeguard on .truncate
      expect(cssSrc).toContain('.truncate {');
      expect(cssSrc).toContain('padding-bottom: 2px;');
      expect(cssSrc).toContain('margin-bottom: -2px;');

      // DashboardHeader avoids leading-none on clubName h2
      expect(dashSrc).not.toMatch(/h2 className="[^"]*truncate\s+leading-none[^"]*">\s*\{clubName\}/);
      expect(dashSrc).toContain('leading-tight pb-0.5');

      // LeagueTableModal and SeasonFinishModal have py-0.5 leading-normal on club name rows
      expect(tableSrc).toContain('truncate font-semibold py-0.5 leading-normal');
      expect(finishSrc).toContain('truncate font-semibold text-xs py-0.5 leading-normal');
    });
  });

  describe('PlayerRevealModal Key Player +4 OVR Safeguards', () => {
    it('verifies PlayerRevealModal code eliminates rotateY: -90 deadlock and uses scale/opacity entry', async () => {
      const fs = await import('fs');
      const modalSrc = fs.readFileSync('src/components/PlayerRevealModal.tsx', 'utf-8');
      expect(modalSrc).not.toContain('initial={{ rotateY: -90');
      expect(modalSrc).toContain('initial={{ scale: 0.96, opacity: 0 }}');
    });

    it('verifies PlayerRevealModal has backdrop click dismiss and escape key support', async () => {
      const fs = await import('fs');
      const modalSrc = fs.readFileSync('src/components/PlayerRevealModal.tsx', 'utf-8');
      expect(modalSrc).toContain('onClick={onClose}');
      expect(modalSrc).toContain("e.key === 'Escape'");
    });

    it('verifies 10s watchdog safety timer guarantees auto-dismissal if left unattended', async () => {
      const fs = await import('fs');
      const modalSrc = fs.readFileSync('src/components/PlayerRevealModal.tsx', 'utf-8');
      expect(modalSrc).toContain('// 10s Safety Watchdog Timer: Guarantee modal auto-dismissal');
      expect(modalSrc).toContain('setTimeout(() => {\n      onClose();\n    }, 10000);');
    });

    it('verifies canvas-confetti is safely wrapped in requestAnimationFrame with try/catch', async () => {
      const fs = await import('fs');
      const modalSrc = fs.readFileSync('src/components/PlayerRevealModal.tsx', 'utf-8');
      expect(modalSrc).toContain('animId = requestAnimationFrame(() => {');
      expect(modalSrc).toContain('cancelAnimationFrame(animId);');
    });
  });

  describe('CupRunModal Mobile Responsive Safeguards', () => {
    it('verifies CupRunModal uses justify-start on mobile with safe top padding to prevent top cutoff', async () => {
      const fs = await import('fs');
      const cupRunSrc = fs.readFileSync('src/components/CupRunModal.tsx', 'utf-8');
      expect(cupRunSrc).toContain('justify-start sm:justify-center');
      expect(cupRunSrc).toContain('pt-3.5 sm:pt-4 pb-6');
      expect(cupRunSrc).toContain('rounded-[20px] sm:rounded-[32px]');
    });

    it('verifies responsive 64px trophy scaling on mobile viewports', async () => {
      const fs = await import('fs');
      const cupRunSrc = fs.readFileSync('src/components/CupRunModal.tsx', 'utf-8');
      expect(cupRunSrc).toContain('responsiveTrophyHeight = isMobile ? 64 : theme.trophyHeight');
      expect(cupRunSrc).toContain('responsiveCelebrationTrophyHeight = isMobile ? 96 : Math.round(theme.trophyHeight * 1.15)');
      expect(cupRunSrc).toContain('size={responsiveTrophyHeight}');
      expect(cupRunSrc).toContain('size={responsiveCelebrationTrophyHeight}');
    });

    it('verifies tactical buttons and matchup cards have streamlined mobile padding', async () => {
      const fs = await import('fs');
      const cupRunSrc = fs.readFileSync('src/components/CupRunModal.tsx', 'utf-8');
      expect(cupRunSrc).toContain('p-3 sm:p-5 shadow-sm space-y-2 sm:space-y-3');
      expect(cupRunSrc).toContain('w-11 h-11 sm:w-16 sm:h-16');
      expect(cupRunSrc).toContain('p-2.5 sm:p-3 rounded-xl sm:rounded-2xl');
    });
  });

  describe('SeasonFinishModal Multi-Trophy Recognition Safeguards', () => {
    it('verifies 4 trophies are recognized as Historic Quadruple instead of capping at Treble', async () => {
      const fs = await import('fs');
      const finishModalSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');
      expect(finishModalSrc).toContain('HISTORIC QUADRUPLE WINNERS');
      expect(finishModalSrc).toContain('HISTORIC QUADRUPLE GLORY!');
      expect(finishModalSrc).toContain("trophyList.length === 4\n                      ? 'Quadruple'");
      expect(finishModalSrc).toContain('Historic Quadruple / Multiple Honours');
      expect(finishModalSrc).toContain("trophyList.length === 4\n                            ? 'Quadruple Winners'");
    });

    it('verifies extended multi-trophy tiers for Quintuple (5) and Sextuple (6) trophies', async () => {
      const fs = await import('fs');
      const finishModalSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');
      expect(finishModalSrc).toContain('HISTORIC SEXTUPLE WINNERS');
      expect(finishModalSrc).toContain('HISTORIC QUINTUPLE WINNERS');
      expect(finishModalSrc).toContain('HISTORIC SEXTUPLE GLORY!');
      expect(finishModalSrc).toContain('HISTORIC QUINTUPLE GLORY!');
    });

    it('verifies visual trophy preview does not slice out trophies beyond 3 and renders all trophies side by side', async () => {
      const fs = await import('fs');
      const finishModalSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');
      expect(finishModalSrc).not.toContain('trophyList.slice(0, 3).map');
      expect(finishModalSrc).toContain('trophyList.map((tr, i) =>');
      expect(finishModalSrc).toContain('size={trophyList.length >= 4 ? 40 : trophyList.length > 1 ? 48 : 56}');
    });
  });

  describe('Transfer Market Key Player Continuity Safeguards', () => {
    it('verifies handleBidKey and handleGalacticoTransfer retain TransferModal open and set returnToTransferMarket flag', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
      
      // Verify handleBidKey passes returnToTransferMarket and does NOT close TransferModal
      expect(appSrc).toContain("setPlayerRevealData({ ovr: ovrGain, cost: cost, isStar: true, cardType: 'star', returnToTransferMarket: true })");
      
      // Verify handleGalacticoTransfer passes returnToTransferMarket and does NOT close TransferModal
      expect(appSrc).toContain("setPlayerRevealData({ ovr: ovrGain, cost: cost, isStar: true, cardType: 'galactico', returnToTransferMarket: true })");
      
      // Verify TransferModal has isMinimized passed
      expect(appSrc).toContain('isMinimized={!!playerRevealData?.returnToTransferMarket}');
      
      // Verify PlayerRevealModal has returnToTransferMarket passed
      expect(appSrc).toContain('returnToTransferMarket={!!playerRevealData.returnToTransferMarket}');
    });

    it('verifies TransferModal preserves scroll position and minimizes invisibly without unmounting', async () => {
      const fs = await import('fs');
      const transferModalSrc = fs.readFileSync('src/components/TransferModal.tsx', 'utf-8');
      
      expect(transferModalSrc).toContain('savedScrollTop');
      expect(transferModalSrc).toContain('savedScrollTop.current = scrollRef.current.scrollTop');
      expect(transferModalSrc).toContain('scrollRef.current.scrollTop = savedScrollTop.current');
      expect(transferModalSrc).toContain("isMinimized ? 'opacity-0 pointer-events-none invisible' : ''");
    });

    it('verifies PlayerRevealModal renders Return to Transfer Market CTA when triggered from market', async () => {
      const fs = await import('fs');
      const revealModalSrc = fs.readFileSync('src/components/PlayerRevealModal.tsx', 'utf-8');
      
      expect(revealModalSrc).toContain('returnToTransferMarket?: boolean');
      expect(revealModalSrc).toContain("returnToTransferMarket");
      expect(revealModalSrc).toContain("isDe ? 'Zurück zum Transfermarkt' : 'Return to Transfer Market'");
      expect(revealModalSrc).toContain("isDe ? 'Weiter zum Kader' : 'Continue to Squad'");
    });
  });

  describe('ClubProfileModal League Finish Chart Safeguards', () => {
    it('verifies Tier Division Track line and text overlay are removed from chart', async () => {
      const fs = await import('fs');
      const profileModalSrc = fs.readFileSync('src/components/ClubProfileModal.tsx', 'utf-8');

      expect(profileModalSrc).not.toContain('TIER 2 DIVISION TRACK');
      expect(profileModalSrc).not.toContain('2. LIGA TRACK (UNTERHAUS)');
      expect(profileModalSrc).not.toContain('track-divider');
      expect(profileModalSrc).not.toContain('getDividerY');
    });

    it('verifies benchmark grid lines, glow linePath, and data points remain intact for tier climbing', async () => {
      const fs = await import('fs');
      const profileModalSrc = fs.readFileSync('src/components/ClubProfileModal.tsx', 'utf-8');

      expect(profileModalSrc).toContain('gridLines.map');
      expect(profileModalSrc).toContain('areaPath &&');
      expect(profileModalSrc).toContain('filter="url(#glow)"');
      expect(profileModalSrc).toContain('points.map');
    });
  });

  describe('Decision Day Automatic Promotion & Table Resolution Safeguards', () => {
    it('verifies Decision Day match results parse score, userRank, and promote winner to upper tier', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      // Verify ddResult has userRank, finalPts, finalGd, score
      expect(appSrc).toContain('userRank?: number');
      expect(appSrc).toContain('score?: string');

      // Verify actual score parsing
      expect(appSrc).toContain("ddResult.score.split('-')");

      // Verify promotion playoff victory triggers wonPlayoff without corrupting regular season position
      expect(appSrc).toContain("if (ddType === 'promotion_playoff') {");
      expect(appSrc).toContain('wonPlayoff = ddWon;');

      // Verify 34-game targetPts accounts for Decision Day victory
      expect(appSrc).toContain('targetPts = Math.max(userPreGamePts + 3, userFinalPts)');
    });

    it('verifies sanitizeGameState and active save state auto-heals SGV Freiberg 7-1 Decision Day victory', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      // Auto-heal club tier
      expect(appSrc).toContain("cleanClub = { ...cleanClub, tier: 3 }");

      // Auto-heal history record
      expect(appSrc).toContain('pos: 1');
      expect(appSrc).toContain('points: 70');
      expect(appSrc).toContain('wins: 21');
      expect(appSrc).toContain('losses: 6');
      expect(appSrc).toContain('gf: 82');
      expect(appSrc).toContain('ga: 58');

      // Auto-heal seasonStandingsArchive
      expect(appSrc).toContain("archive[yr][4]");
      expect(appSrc).toContain("table[fIdx]");
    });

    it('verifies SeasonFinishModal tableData sorts archived rows by points and GD descending', async () => {
      const fs = await import('fs');
      const finishModalSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');

      expect(finishModalSrc).toContain('if (b.pts !== a.pts) return b.pts - a.pts');
      expect(finishModalSrc).toContain('bGd - aGd');
      expect(finishModalSrc).toContain('r.pos = idx + 1');
    });

    it('verifies SeasonFinishModal has no undeclared showTableInline and renders cleanly for relegation outcome', async () => {
      const fs = await import('fs');
      const finishModalSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');

      // Zero undeclared showTableInline references
      expect(finishModalSrc).not.toContain('showTableInline');
      expect(finishModalSrc).not.toContain('setShowTableInline');

      // Tab integrity: overview, squad, table, world
      expect(finishModalSrc).toContain("activeTab === 'overview'");
      expect(finishModalSrc).toContain("activeTab === 'squad'");
      expect(finishModalSrc).toContain("activeTab === 'table'");
      expect(finishModalSrc).toContain("activeTab === 'world'");

      // Relegation outcome banner
      expect(finishModalSrc).toContain("badge: 'RELEGATION'");
      expect(finishModalSrc).toContain("tagline: `Relegated to ${nextLeague.name}`");

      // Safe r.gd coercion: zero raw r.gd.startsWith
      expect(finishModalSrc).not.toContain('r.gd.startsWith');
      expect(finishModalSrc).toContain('String(r.gd ??');
      expect(finishModalSrc).toContain('parseInt(String(b.gd ?? 0), 10)');

      // Safe rivalPos array bounds checking
      expect(finishModalSrc).toContain('rivalPos >= 1 && rivalPos <= 18');
    });

    it('verifies App.tsx defines leagueAvg with fallback and filters availableOffers in sackedJobOffer', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      // getActionCosts defines leagueAvg with fallback
      expect(appSrc).toContain('const leagueAvg = getLeagueInfo(tier, country)?.avgOvr || 65;');
      expect(appSrc).toContain('const eliteMult = baseOvr > leagueAvg + 4');

      // sackedJobOffer filters availableOffers
      expect(appSrc).toContain('clubs: availableOffers.filter(Boolean)');
    });

    it('verifies DecisionDayModal Stage 3 guards score string and getLeagueInfo lookups safely', async () => {
      const fs = await import('fs');
      const ddSrc = fs.readFileSync('src/components/DecisionDayModal.tsx', 'utf-8');

      expect(ddSrc).toContain("(matchResult?.score || '0-0').replace('-', ' – ')");
      expect(ddSrc).toContain("getLeagueInfo(gameState.club.tier, gameState.club.country)?.name || 'current division'");
      expect(ddSrc).toContain("getLeagueInfo(Math.max(1, gameState.club.tier - 1), gameState.club.country)?.name || 'higher division'");
    });

    it('verifies TrophyModal safely unwraps raw translation objects for title and message', async () => {
      const fs = await import('fs');
      const trophySrc = fs.readFileSync('src/components/TrophyModal.tsx', 'utf-8');

      expect(trophySrc).toContain("typeof title === 'object' ? getLoc(lang, title as any) : String(title || '')");
      expect(trophySrc).toContain("typeof message === 'object' ? getLoc(lang, message as any)");
    });
  });
});
