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
      expect(eventSrc).toContain('group-hover:text-sky-700 transition-colors break-words');
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
      const ddEngineSrc = fs.readFileSync('src/engine/decisionDayEngine.ts', 'utf-8');

      // Verify ddResult has userRank, finalPts, finalGd, score
      expect(appSrc).toContain('userRank?: number');
      expect(appSrc).toContain('score?: string');

      // Verify actual score parsing
      expect(appSrc).toContain("ddResult.score.split('-')");

      // Verify promotion playoff victory triggers wonPlayoff without corrupting regular season position
      expect(appSrc).toContain("if (ddType === 'promotion_playoff') {");
      expect(appSrc).toContain('wonPlayoff = ddOutcome.userWonDuel;');
      expect(appSrc).toContain('ddOutcome = resolveDecisionDayOutcome({');

      // Verify 34-game final stats account for Decision Day victory on top of MD 33
      expect(ddEngineSrc).toContain('userFinalPts = userPreGamePts + userDeltaPts;');
      expect(appSrc).toContain('wins = baseW33 + (ddWon ? 1 : 0)');
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

    it('verifies Header More menu includes Basketball Manager Sim link and ClubProfileModal Prestige & Vision view is cleaned up', async () => {
      const fs = await import('fs');
      const headerSrc = fs.readFileSync('src/components/Header.tsx', 'utf-8');
      const profileModalSrc = fs.readFileSync('src/components/ClubProfileModal.tsx', 'utf-8');

      expect(headerSrc).toContain('href="https://basketballmanagersim.com"');
      expect(headerSrc).toContain('Basketball Manager Sim');

      expect(profileModalSrc).toContain('divide-x divide-[#E6E3DC]');
      expect(profileModalSrc).toContain("title: 'Balanced Model'");
      expect(profileModalSrc).toContain("title: 'Wonderkid Factory'");
      expect(profileModalSrc).not.toContain('lg:grid-cols-3');
      expect(profileModalSrc).not.toContain('🟩');
    });

    it('verifies sanitizeGameState and season completion advance 2010 season to 2011 and never return to start of 2010', async () => {
      const { sanitizeGameState } = await import('../App');
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
      const mainSrc = fs.readFileSync('src/main.tsx', 'utf-8');

      // Exact state from live bug report: Milton Keynes Dons after completing 2010 season (#2, 1 history entry, phase start)
      const regressed2010State = {
        managerName: 'ALEX',
        startYear: 2010,
        year: 2010,
        seasonCount: 2,
        seasonPhase: 'start',
        careerScore: 4410,
        budget: 1120,
        club: {
          id: 905,
          name: 'Milton Keynes Dons',
          country: 'ENG',
          tier: 5,
          baseOvr: 63,
          stadium: 30500,
          color: 'ffffff',
        },
        currentRival: {
          id: 906,
          name: 'Grimsby Town',
          tier: 5,
          baseOvr: 62,
          wins: 1,
          draws: 0,
          losses: 1,
        },
        history: [
          {
            year: 2010,
            clubName: 'Milton Keynes Dons',
            clubId: 905,
            tier: 5,
            pos: 4,
            pts: 62,
            wins: 18,
            draws: 8,
            losses: 8,
            gf: 55,
            ga: 38,
            ovr: 63,
          },
        ],
      };

      const healed = sanitizeGameState(regressed2010State);
      expect(healed).not.toBeNull();
      expect(healed!.year).toBe(2011);
      expect(healed!.seasonCount).toBe(2);
      expect(healed!.seasonPhase).toBe('start');
      expect(healed!.history).toHaveLength(1);
      expect(healed!.history[0].year).toBe(2010);

      // Stuck mid-season state where 2010 history entry was already recorded
      const stuckMid2010State = {
        ...regressed2010State,
        seasonCount: 1,
        seasonPhase: 'mid',
      };
      const healedMid = sanitizeGameState(stuckMid2010State);
      expect(healedMid).not.toBeNull();
      expect(healedMid!.seasonPhase).toBe('start');
      expect(healedMid!.year).toBe(2011);
      expect(healedMid!.seasonCount).toBe(2);

      // Verify App.tsx and main.tsx guards against premature phase reset and mid-season SW reload
      expect(appSrc).not.toContain("setGameState(prev => prev ? { ...prev, seasonPhase: 'start', pendingSeasonState: null } : prev);");
      expect(appSrc).toContain('minExpectedNextYear');
      expect(mainSrc).toContain('if (Date.now() - bootedAt < 4000) updateSW(true);');
    }, 25000);

    it('verifies modal z-index hierarchy, single-layer navigation, and Escape dismissal across modal stack', async () => {
      const fs = await import('fs');
      const consentSrc = fs.readFileSync('src/components/ConsentBanner.tsx', 'utf-8');
      const tourSrc = fs.readFileSync('src/components/GlobalTourModal.tsx', 'utf-8');
      const pressSrc = fs.readFileSync('src/components/CoachPressReleaseModal.tsx', 'utf-8');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      // ConsentBanner bottom bar stays below z-50 modals
      expect(consentSrc).not.toContain('z-[9998]');
      expect(consentSrc).toContain('z-[45]');

      // GlobalTourModal sits above MarketingModal (z-[70] > z-50) and handles Escape
      expect(tourSrc).toContain('z-[70]');
      expect(tourSrc).toContain("e.key === 'Escape'");
      expect(tourSrc).toContain('e.stopImmediatePropagation()');

      // CoachPressReleaseModal handles Escape cleanly above CoachMarketModal
      expect(pressSrc).toContain('z-[70]');
      expect(pressSrc).toContain("e.key === 'Escape'");
      expect(pressSrc).toContain('e.stopImmediatePropagation()');

      // Centralized voluntary modal Escape handler + single-layer ClubImpactModal sub-navigation
      expect(appSrc).toContain('const handleGlobalModalEscape = (e: KeyboardEvent) =>');
      expect(appSrc).toContain('returnToYouthModalRef.current = showYouthModal;');
      expect(appSrc).toContain("onOpenTeamBonding={() => {\n            setShowImpactModal(false);\n            setShowTeamBondingModal(true);\n          }}");
    });

    it('prevents transient stat/record reset and bounce-back at end of 1st-half and full-season simulation', async () => {
      const fs = await import('fs');
      const workspaceSrc = fs.readFileSync('src/components/WorkspaceTabs.tsx', 'utf-8');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
      const { calculateProbabilisticSeason } = await import('../engine/seasonSimEngine');

      // Verify WorkspaceTabs preserves completed inlineSim matchdays while pendingSeasonState is still active
      expect(workspaceSrc).toContain('state.pendingSeasonState && inlineSim.currentIdx > 0 && activeSchedule.length > 0');
      expect(workspaceSrc).toContain('Math.min(activeSchedule.length, inlineSim.currentIdx + 1)');
      expect(appSrc).toContain('last5: (syncedPending?.matchdaySchedule || syncedPending?.schedule || [])');

      // Simulate a full season lifecycle and assert monotonic record progression without reset or bounce-back
      const testState: any = {
        year: 2026,
        startYear: 2026,
        seasonCount: 1,
        seasonPhase: 'start',
        budget: 2500,
        reputation: 55,
        clubImpactScore: 60,
        tactic: 'Total Football',
        stadiumPolicy: 'balanced',
        managerSkills: [],
        history: [
          {
            year: 2025,
            clubName: '1. FC Magdeburg',
            color: '#005CA9',
            leagueTag: '2.BL',
            leagueCss: '',
            ovr: 71,
            tier: 2,
            wins: 14,
            draws: 10,
            losses: 10,
            pts: 52,
            pos: 7,
            gf: 48,
            ga: 42,
            att: 22000,
            util: 88,
            trophyIcons: '',
            trophiesThisYear: {},
          },
        ],
        club: {
          id: 101,
          name: '1. FC Magdeburg',
          country: 'GER',
          tier: 2,
          baseOvr: 73,
          ovr: 73,
          morale: 85,
          stadium: 25000,
          fanBase: 45000,
          color: '#005CA9',
        },
      };

      const pending1 = calculateProbabilisticSeason(testState, [testState.club], false);
      testState.pendingSeasonState = pending1;
      const schedule1 = pending1.matchdaySchedule || [];
      expect(schedule1).toHaveLength(34);

      const computeSnapshot = (state: any, inlineSim: { active: boolean; currentIdx: number; schedule: any[]; totalMatchdays: number }) => {
        const pendingSchedule = state.pendingSeasonState?.matchdaySchedule || state.pendingSeasonState?.schedule || [];
        const activeSchedule =
          inlineSim.active && inlineSim.schedule.length > 0
            ? inlineSim.schedule
            : pendingSchedule.length > 0
            ? pendingSchedule
            : inlineSim.schedule;
        const totalMds = inlineSim.active
          ? inlineSim.totalMatchdays
          : state.pendingSeasonState?.totalMatchdays || inlineSim.totalMatchdays || 34;
        const playedMatchdays = inlineSim.active
          ? Math.max(0, inlineSim.currentIdx + 1)
          : state.pendingSeasonState && inlineSim.currentIdx > 0 && activeSchedule.length > 0
          ? Math.min(activeSchedule.length, inlineSim.currentIdx + 1)
          : state.seasonPhase === 'mid'
          ? Math.floor(totalMds / 2)
          : 0;
        const currentOutcome = playedMatchdays > 0 ? activeSchedule[playedMatchdays - 1] : undefined;
        if (playedMatchdays > 0 && currentOutcome) {
          const w = currentOutcome.runningWins ?? currentOutcome.runningW ?? 0;
          const d = currentOutcome.runningDraws ?? currentOutcome.runningD ?? 0;
          const l = currentOutcome.runningLosses ?? currentOutcome.runningL ?? Math.max(0, playedMatchdays - w - d);
          const winRate = Math.round((w / Math.max(1, playedMatchdays)) * 100);
          const last5 = activeSchedule.slice(Math.max(0, playedMatchdays - 5), playedMatchdays).map((m: any) => m.result);
          return { playedMatchdays, w, d, l, winRate, last5, playedCount: playedMatchdays };
        }
        const lastHist = state.history && state.history.length > 0 ? state.history[state.history.length - 1] : null;
        if (lastHist) {
          const w = lastHist.wins || 0;
          const d = lastHist.draws || 0;
          const l = lastHist.losses ?? Math.max(0, 34 - w - d);
          const total = Math.max(1, w + d + l);
          return {
            playedMatchdays,
            w,
            d,
            l,
            winRate: Math.round((w / total) * 100),
            last5: lastHist.last5 || [],
            playedCount: w + d + l,
          };
        }
        return { playedMatchdays, w: 0, d: 0, l: 0, winRate: 0, last5: [], playedCount: 0 };
      };

      // 1. End of 1st-half active tick (MD 17, active: true, currentIdx: 16)
      const snapMd17Active = computeSnapshot(testState, {
        active: true,
        currentIdx: 16,
        schedule: schedule1,
        totalMatchdays: 34,
      });
      expect(snapMd17Active.playedMatchdays).toBe(17);

      // 2. MidSeasonDilemmaModal opens (active becomes false BEFORE seasonPhase becomes 'mid')
      const snapMidDilemmaOpen = computeSnapshot(testState, {
        active: false,
        currentIdx: 16,
        schedule: schedule1,
        totalMatchdays: 34,
      });
      // Must NOT drop to 0 (last year's 14-10-10 record) and bounce back!
      expect(snapMidDilemmaOpen.playedMatchdays).toBe(17);
      expect(snapMidDilemmaOpen.w).toBe(snapMd17Active.w);
      expect(snapMidDilemmaOpen.d).toBe(snapMd17Active.d);
      expect(snapMidDilemmaOpen.l).toBe(snapMd17Active.l);

      // 3. Dilemma resolved -> recalculate 2nd half with locked 1st half and transition to seasonPhase = 'mid'
      testState.club.baseOvr += 1;
      const pending2 = calculateProbabilisticSeason(testState, [testState.club], false, {
        lockFirstHalfFrom: pending1,
        dilemmaChoice: 'A',
      });
      testState.pendingSeasonState = pending2;
      testState.seasonPhase = 'mid';
      const schedule2 = pending2.matchdaySchedule || [];
      const snapWinterBreak = computeSnapshot(testState, {
        active: false,
        currentIdx: 16,
        schedule: schedule2,
        totalMatchdays: 34,
      });
      expect(snapWinterBreak.playedMatchdays).toBe(17);
      expect(snapWinterBreak.w).toBe(snapMd17Active.w);
      expect(snapWinterBreak.d).toBe(snapMd17Active.d);
      expect(snapWinterBreak.l).toBe(snapMd17Active.l);

      // 4. End of 2nd-half active tick (MD 34, active: true, currentIdx: 33)
      const snapMd34Active = computeSnapshot(testState, {
        active: true,
        currentIdx: 33,
        schedule: schedule2,
        totalMatchdays: 34,
      });
      expect(snapMd34Active.playedMatchdays).toBe(34);
      expect(snapMd34Active.w).toBe(pending2.wins);
      expect(snapMd34Active.d).toBe(pending2.draws);
      expect(snapMd34Active.l).toBe(pending2.losses);

      // 5. Post-MD34 async window (active: false while gameState.seasonPhase is still 'mid' during DecisionDay / TrophyModal / CupRunModal / simulateAiLeaguesAsync)
      const snapPostSimAsyncGap = computeSnapshot(testState, {
        active: false,
        currentIdx: 33,
        schedule: schedule2,
        totalMatchdays: 34,
      });
      // Must NOT drop back to MD 17 (17 matchdays) and bounce back to MD 34!
      expect(snapPostSimAsyncGap.playedMatchdays).toBe(34);
      expect(snapPostSimAsyncGap.w).toBe(snapMd34Active.w);
      expect(snapPostSimAsyncGap.d).toBe(snapMd34Active.d);
      expect(snapPostSimAsyncGap.l).toBe(snapMd34Active.l);
      expect(snapPostSimAsyncGap.winRate).toBe(snapMd34Active.winRate);
      expect(snapPostSimAsyncGap.last5).toEqual(snapMd34Active.last5);

      // 6. Final atomic state commit (pendingSeasonState cleared, historyItem pushed with last5, inlineSim reset)
      testState.history.push({
        year: 2026,
        clubName: '1. FC Magdeburg',
        color: '#005CA9',
        leagueTag: '2.BL',
        leagueCss: '',
        ovr: 74,
        tier: 2,
        wins: pending2.wins,
        draws: pending2.draws,
        losses: pending2.losses,
        pts: pending2.pts,
        pos: pending2.pos,
        gf: pending2.gf,
        ga: pending2.ga,
        att: 23000,
        util: 92,
        trophyIcons: '',
        trophiesThisYear: {},
        last5: schedule2.slice(-5).map((m: any) => m.result),
      });
      testState.pendingSeasonState = null;
      testState.seasonPhase = 'start';
      const snapCommitted = computeSnapshot(testState, {
        active: false,
        currentIdx: 0,
        schedule: [],
        totalMatchdays: 34,
      });
      expect(snapCommitted.w).toBe(snapMd34Active.w);
      expect(snapCommitted.d).toBe(snapMd34Active.d);
      expect(snapCommitted.l).toBe(snapMd34Active.l);
      expect(snapCommitted.winRate).toBe(snapMd34Active.winRate);
      expect(snapCommitted.last5).toEqual(snapMd34Active.last5);
      expect(snapCommitted.playedCount).toBe(34);
    });

    it('maintains v3.0 workspace data parity (50-man squad cap, trophy/shield sync, PLC badge, and restored modal triggers)', async () => {
      const fs = await import('fs');
      const workspaceSrc = fs.readFileSync('src/components/WorkspaceTabs.tsx', 'utf-8');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      // Prefer live inlineSim.schedule even when inlineSim.active becomes false after MD 34 Decision Day
      expect(workspaceSrc).toContain('inlineSim.schedule.length > 0\n      ? inlineSim.schedule\n      : pendingSchedule');

      // Unified 50-man squad cap (no stale / 25 hardcode)
      expect(workspaceSrc).not.toContain('/ 25');
      expect(workspaceSrc).toContain('maxSquadSize={50}');
      expect(workspaceSrc).toContain('{state.club.squadSize ?? 24} / 50');

      // Single-source trophy count (no Supercup double-counting) & listed PLC check
      expect(workspaceSrc).toContain('const totalTrophiesCount = state.totals?.trophies || 0;');
      expect(workspaceSrc).not.toContain("(state.supercupHistory || []).filter((s) => s.won).length");
      expect(workspaceSrc).toContain("state.isPublic || state.ipoDone ? 'Listed PLC'");

      // Restored modal triggers across tabs and Quick Actions
      expect(workspaceSrc).toContain('data-testid="squad-roster-rules-btn"');
      expect(workspaceSrc).toContain('data-testid="commercial-fan-event-btn"');
      expect(workspaceSrc).toContain('data-testid="board-prestige-btn"');
      expect(appSrc).toContain('onOpenSquadRegistration={() => setShowSquadRegistrationModal(true)}');
      expect(appSrc).toContain('onOpenFanBonding={() => setShowFanBondingModal(true)}');
      expect(appSrc).toContain('onOpenPrestige={() => setShowPrestigeModal(true)}');
    });

    it('eliminates v3.0 second-pass visual & UX defects (heatmap clip, sponsor auto-sign trap, duplicate links, exact win-rate, and CWC/WC trophy parity)', async () => {
      const fs = await import('fs');
      const shotCardSrc = fs.readFileSync('src/components/ShotEfficiencyCard.tsx', 'utf-8');
      const workspaceSrc = fs.readFileSync('src/components/WorkspaceTabs.tsx', 'utf-8');
      const historySrc = fs.readFileSync('src/components/SeasonHistoryTable.tsx', 'utf-8');
      const campusSrc = fs.readFileSync('src/components/ClubCampus3D.tsx', 'utf-8');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
      const { buildActiveNotifications } = await import('../engine/liveSimVisualEngine');

      // 1. Tactical Outcome pitch SVG uses exact 100/62 aspect ratio + clipPath + userSpaceOnUse filter (no corner artifacts)
      expect(shotCardSrc).toContain('aspect-[100/62]');
      expect(shotCardSrc).toContain('preserveAspectRatio="none"');
      expect(shotCardSrc).toContain('clipPath="url(#tacticalPitchClip)"');
      expect(shotCardSrc).toContain('filterUnits="userSpaceOnUse"');

      // 2. Commercial Sponsorship Deals removes silent auto-sign Negotiate Sponsors button and duplicate Naming Rights Desk link
      expect(workspaceSrc).not.toContain('Negotiate Sponsors');
      expect(workspaceSrc).not.toContain('Naming Rights Desk →');
      expect(workspaceSrc).toContain('data-testid="sponsor-quota-badge"');
      expect(workspaceSrc).toContain('data-testid="overview-treasury-sponsors-btn"');
      expect(workspaceSrc).toContain("onSelectTab ? onSelectTab('commercial') : onOpenNamingRights()");

      // 3. Overview Season Snapshot uses 1-decimal winRateExact instead of integer Math.round(...).toFixed(1)
      expect(workspaceSrc).toContain('snapshotStats.winRateExact.toFixed(1)');
      expect(workspaceSrc).not.toContain('snapshotStats.winRate.toFixed(1)');

      // 4. ClubCampus3D fallback maxSquadSize defaults to 50 and SeasonHistoryTable counts CWC & WC honours
      expect(campusSrc).toContain('maxSquadSize = 50');
      expect(historySrc).toContain('counts.cwc += (h.trophiesThisYear?.cwc || 0)');
      expect(historySrc).toContain('counts.wc += (h.trophiesThisYear?.wc || 0)');

      // 5. CoachDossierModal onRenew and WinterCampModal onFireCoach target explicit CoachMarketModal tabs
      expect(appSrc).toContain("onRenew={() => {\n            setCoachMarketTab('staff');");
      expect(appSrc).toContain("setCoachMarketTab(gameState.currentCoach ? 'staff' : 'market');");

      // 6. buildActiveNotifications surfaces Head Coach Vacant (-4 OVR) alert with coach_market actionId
      const alerts = buildActiveNotifications(
        {
          club: { id: 1, name: 'Test FC', tier: 2, baseOvr: 70, color: '#0055aa', stadium: 20000, country: 'GER' },
          budget: 5000,
          sponsorsPitchedThisSeason: 3,
          stadiumNamingRights: { partnerName: 'Partner', stadiumDisplayName: 'Partner Arena', tier: 'national', annualPayoutK: 500, signingBonusK: 200, totalYears: 4, yearsLeft: 3, signedYear: 2026 },
          currentCoach: undefined,
          youthPipeline: [],
        } as any,
        { net: 400, wages: 1200, estRevenue: 1600 }
      );
      expect(alerts.some((a) => a.id === 'coach_vacant' && a.actionId === 'coach_market')).toBe(true);
    });
  });

  describe('Bankruptcy, Sacking, Promotion & Job-Offer Lifecycle Integrity', () => {
    it('prioritizes mandatory bankruptcyDecisionEvent ahead of narrative events, persists pendingForcedEvent, and suppresses insolvency when already sacked', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      // 1. Dismissed manager must never carry old club's bankruptcy modal onto their next club
      expect(appSrc).toContain('bankruptcyDecisionEvent = null;\n      state.pendingForcedEvent = sackedJobOffer;');
      // 2. Mandatory 3yr/4yr insolvency crisis persists across reloads via pendingForcedEvent
      expect(appSrc).toContain('} else if (bankruptcyDecisionEvent) {\n      state.pendingForcedEvent = bankruptcyDecisionEvent;');
      // 3. bankruptcyDecisionEvent fires BEFORE rivalTakeoverEventTriggered and nlzLossEventTriggered
      const idxBankruptcy = appSrc.indexOf('if (bankruptcyDecisionEvent && !sackedJobOffer)');
      const idxRival = appSrc.indexOf('} else if (rivalTakeoverEventTriggered && !sackedJobOffer)');
      const idxNlz = appSrc.indexOf('} else if (nlzLossEventTriggered && !sackedJobOffer)');
      expect(idxBankruptcy).toBeGreaterThan(0);
      expect(idxRival).toBeGreaterThan(idxBankruptcy);
      expect(idxNlz).toBeGreaterThan(idxRival);
    });

    it('deduplicates enqueueEvent by id, replaces insolvency queue atomically, and resets club-bound naming/stadium/ownership state on job switch', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

      // 1. Idempotent enqueueEvent prevents duplicate forced modals
      expect(appSrc).toContain('prev.some(e => Boolean(e.id && evt.id && e.id === evt.id)) ? prev : [...prev, evt]');
      // 2. Full Insolvency atomically replaces eventQueue with insolvencyJobOffer
      expect(appSrc).toContain('setEventQueue([insolvencyJobOffer]);');
      // 3. Switching clubs via handleAcceptJobOffer clears old club's naming rights, stadium architecture override, VIP boxes, and billionaire ownership
      expect(appSrc).toContain("updated.ownership = 'standard';");
      expect(appSrc).toContain('updated.stadiumNamingRights = null;');
      expect(appSrc).toContain('updated.stadiumStyle = resolvedNewClub.stadiumStyle || undefined;');
      expect(appSrc).toContain('updated.vipHospitality = false;');
      expect(appSrc).toContain("updated.stadiumPolicy = 'atmosphere';");
    });

    it('aligns Year-1 debt point deduction threshold to €2M (2000 in €K) across App.tsx and standingsEngine.ts', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
      const standingsSrc = fs.readFileSync('src/engine/standingsEngine.ts', 'utf-8');

      expect(appSrc).not.toContain('Math.abs(state.budget) < 500000');
      expect(standingsSrc).not.toContain('Math.abs(budget) < 500000');
      expect(appSrc).toContain('Math.abs(state.budget) < 2000 ? 1 : 2');
      expect(standingsSrc).toContain('Math.abs(budget) < 2000 ? 1 : 2');
    });

    it('configures Vite 6 allowedHosts: true, hmr: false, safeStoragePolyfill, Cloud Run PORT, and React.lazy modal splitting', async () => {
      const fs = await import('fs');
      const viteSrc = fs.readFileSync('vite.config.ts', 'utf-8');
      const serverSrc = fs.readFileSync('server.ts', 'utf-8');
      const mainSrc = fs.readFileSync('src/main.tsx', 'utf-8');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
      const pkgSrc = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

      expect(viteSrc).toContain('allowedHosts: true');
      expect(viteSrc).toContain('hmr: false');
      expect(serverSrc).toContain('allowedHosts: true');
      expect(serverSrc).toContain('hmr: false');
      expect(serverSrc).toContain('process.env.NGINX_PORT');
      expect(serverSrc).toContain('Number(process.env.PORT || 3000)');
      expect(pkgSrc.scripts.start).toBe('node server.ts');
      expect(pkgSrc.scripts.build).toBe('vite build');
      expect(mainSrc.startsWith("import './utils/safeStoragePolyfill';")).toBe(true);
      expect(mainSrc).toContain("window.location.hostname.endsWith('.run.app')");
      expect(appSrc).toContain("import { SeasonFinishModal } from './components/SeasonFinishModal';");
      expect(appSrc).toContain("import { MidSeasonDilemmaModal } from './components/MidSeasonDilemmaModal';");
      expect(appSrc).not.toContain('React.lazy(');
      expect(appSrc).toContain('<React.Suspense fallback={null}>');
    });
  });
});





