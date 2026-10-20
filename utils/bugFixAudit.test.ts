import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('Surgical Bug Fix Verification: Mod Sync Customization & Cup Desync', () => {
  it('ensures Customization Erasure Bug (Mod Sync) is surgically guarded for custom Blob/Base64 logos', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

    // 1. clubNeedsUpdate ignores data:image and blob:
    expect(appSrc).toContain("!gameState.club.logo?.startsWith('data:image/') && !gameState.club.logo?.startsWith('blob:')");
    expect(appSrc).toContain("!gameState.club.fallbackLogo?.startsWith('data:image/') && !gameState.club.fallbackLogo?.startsWith('blob:')");

    // 2. updatedHistory preserves user-uploaded logos
    expect(appSrc).toContain("(h.logo?.startsWith('data:image/') || h.logo?.startsWith('blob:')) ? h.logo : (isModActive ? hLogo : undefined)");
    expect(appSrc).toContain("(h.fallbackLogo?.startsWith('data:image/') || h.fallbackLogo?.startsWith('blob:')) ? h.fallbackLogo : (isModActive ? hFallback : undefined)");

    // 3. active club preserves user-uploaded logos
    expect(appSrc).toContain("(prev.club.logo?.startsWith('data:image/') || prev.club.logo?.startsWith('blob:')) ? prev.club.logo : (isModActive ? (dbClub.logo || modTeam?.logo) : undefined)");
    expect(appSrc).toContain("(prev.club.fallbackLogo?.startsWith('data:image/') || prev.club.fallbackLogo?.startsWith('blob:')) ? prev.club.fallbackLogo : (isModActive ? (dbClub.fallbackLogo || modTeam?.fallbackLogo) : undefined)");
  });

  it('ensures "Time Travel" Cup Bug (Chronological Desync) records completedSeasonYear for all cup runs and trophy history', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

    // Domestic & continental cup results push
    expect(appSrc).toContain('state.cupRunResults.push({ year: completedSeasonYear, id: cup.id, nameEn: cup.nameEn, nameDe: cup.nameDe, ...cupResult });');

    // Domestic & continental trophyHistory unshift
    expect(appSrc).toContain('state.trophyHistory.unshift({ year: completedSeasonYear, clubName: state.club.name, name: cup.nameEn, logo: state.club.logo, color: state.club.color });');

    // Global Club Cup (CWC) cupRunResults push
    expect(appSrc).toContain("state.cupRunResults.push({ year: completedSeasonYear, id: 'cwc', nameEn: 'Global Club Cup', nameDe: 'Global Club Cup', ...cwcResult });");

    // Global Club Cup trophyHistory unshift
    expect(appSrc).toContain("state.trophyHistory.unshift({ year: completedSeasonYear, clubName: state.club.name, name: 'Global Club Cup', logo: state.club.logo, color: state.club.color });");
  });

  it('ensures Cross-Tier Playoff data generation assigns relegation-tier stats and DecisionDayModal renders direct Matchup Card', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const modalSrc = fs.readFileSync('src/components/DecisionDayModal.tsx', 'utf-8');

    // 1. App.tsx distinguishes cross-tier promotion playoffs
    expect(appSrc).toContain('if (isCrossTierPlayoff) {');
    expect(appSrc).toContain('rivalPreGamePts = rand(23, 28);');
    expect(appSrc).toContain('rivalPreGameGd = rand(-25, -15);');
    expect(appSrc).toContain('const rivalPos = approxPos > 3 ? approxPos - 1 : 3;');

    // 2. DecisionDayModal renders Cross-Tier Promotion Playoff Matchup Card with Challenger & Defender
    expect(modalSrc).toContain('if (isCrossTierPlayoff) {');
    expect(modalSrc).toContain('Cross-Tier Promotion Playoff');
    expect(modalSrc).toContain('Challenger');
    expect(modalSrc).toContain('Defender');
    expect(modalSrc).toContain('2 Legs');
  });

  it('ensures infinite Farm Loan exploit is patched in both YouthModal and App engine', () => {
    const youthModalSrc = fs.readFileSync('src/components/YouthModal.tsx', 'utf-8');
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

    // 1. YouthModal.tsx excludes loaned prospects from isReady
    expect(youthModalSrc).toContain("const isReady = (p.status === 'ready' || (typeof p.timer === 'number' && p.timer <= 0)) && p.status !== 'loaned';");

    // 2. App.tsx guards against duplicate loan calls
    expect(appSrc).toContain("if (prospect.status === 'loaned') return; // Prevent infinite loan exploit");
  });

  it('ensures Free Billboard URL Spoof is prevented and client never inserts to Supabase anon table', () => {
    const leaderboardSrc = fs.readFileSync('src/components/LeaderboardPage.tsx', 'utf-8');
    // Verifies client-side registerActiveSponsor DB fallback has been removed completely
    expect(leaderboardSrc).not.toContain('registerActiveSponsor(');
    expect(leaderboardSrc).not.toContain('retrieveDirectStripeSession(');
    expect(leaderboardSrc).toContain('Unable to verify payment session with server');
  });

  it('ensures Highscore submission requires authenticated signature and is routed through server endpoint', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const supabaseClientSrc = fs.readFileSync('src/lib/supabaseClient.ts', 'utf-8');
    const serverSrc = fs.readFileSync('server.ts', 'utf-8');

    // 1. App.tsx uses submitAuthenticatedHighscore
    expect(appSrc).toContain('submitAuthenticatedHighscore(newEntry)');
    expect(appSrc).toContain('submitAuthenticatedHighscore(normalizedEntry)');

    // 2. supabaseClient defines signature hashing and POSTs to /api/submit-highscore
    expect(supabaseClientSrc).toContain('computeHighscoreSignature(');
    expect(supabaseClientSrc).toContain('/api/submit-highscore');

    // 3. server.ts verifies signature with HIGHSCORE_SALT
    expect(serverSrc).toContain("app.post('/api/submit-highscore'");
    expect(serverSrc).toContain('HIGHSCORE_SALT');
  });

  it('ensures fast_rise promotion targets are capped by distance to Tier 1', async () => {
    const { generateBoardVision } = await import('../engine/boardVisionEngine');
    // Tier 2 club rolling 5-year vision
    const mockTier2Club: any = { id: 99, name: 'Tier 2 Club', tier: 2, baseOvr: 74, finances: 50 };
    const vision = generateBoardVision(mockTier2Club, 2026);
    // If vision rolled fast_rise, targetPromotions must never exceed distance to Tier 1 (2 - 1 = 1)
    if (vision.type === 'fast_rise') {
      const promoObj = vision.objectives.find(o => o.type === 'promotion' || o.id === 'obj_promotion');
      expect(promoObj?.targetValue).toBeLessThanOrEqual(1);
    }
  });

  it('ensures Tactical Chessboard Maestro coach trait provides match engine bonus', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    expect(appSrc).toContain("state.currentCoach?.strength === 'Tactical Chessboard Maestro'");
    expect(appSrc).toContain("hasChessboardMaestro");
  });

  it('ensures credit facility early payoff prevents infinite arbitrage exploit', async () => {
    const { getLoanProgress } = await import('../engine/creditFacilityEngine');

    // Brand new loan (0% paid off) -> 5% penalty
    const freshLoan: any = { principal: 100000, initialPrincipal: 100000, totalYears: 15, yearsLeft: 15, annualPayment: 8500 };
    const freshProgress = getLoanProgress(freshLoan);
    expect(freshProgress?.percentPaidOff).toBe(0);
    expect(freshProgress?.earlyPayoffCost).toBe(105000); // 100k * 1.05

    // Immature loan (20% paid off) -> 1.0x face value
    const midLoan: any = { principal: 80000, initialPrincipal: 100000, totalYears: 15, yearsLeft: 12, annualPayment: 8500 };
    const midProgress = getLoanProgress(midLoan);
    expect(midProgress?.percentPaidOff).toBe(20);
    expect(midProgress?.earlyPayoffCost).toBe(80000);

    // Matured loan (60% paid off) -> 8% discount
    const maturedLoan: any = { principal: 40000, initialPrincipal: 100000, totalYears: 15, yearsLeft: 6, annualPayment: 8500 };
    const maturedProgress = getLoanProgress(maturedLoan);
    expect(maturedProgress?.percentPaidOff).toBe(60);
    expect(maturedProgress?.earlyPayoffCost).toBe(Math.round(40000 * 0.92));
  });

  it('ensures LedgerModal renders raw principal without double amortization', () => {
    const ledgerSrc = fs.readFileSync('src/components/LedgerModal.tsx', 'utf-8');
    expect(ledgerSrc).toContain('{formatMoney(state.bankLoan.principal)}');
    expect(ledgerSrc).not.toContain('state.bankLoan.principal * (state.bankLoan.yearsLeft / state.bankLoan.totalYears)');
  });

  it('ensures subLedger normalizes spend in Seasons 1 & 2 to eliminate ROI distortion', async () => {
    const { calculateAcademySubLedger } = await import('../engine/subLedgerEngine');

    const stateYear1: any = {
      year: 2026,
      club: { id: 18, name: 'TSG 1899 Hoffenheim', tier: 1, academyLevel: 3 },
      academyScoutingDial: 0,
      academySpendHistory: [
        { year: 2026, spendK: 200, graduatesCount: 2 }
      ],
      youthPipeline: []
    };

    const report = calculateAcademySubLedger(stateYear1);
    // 1 year of data: 200k / 1 * 3 = 600k 3-year normalized rolling spend
    expect(report.rollingSpend3YrK).toBe(600);
    expect(report.effectiveCostPerGraduateK).toBe(300); // 600 / 2
  });

  it('ensures SquadRegistrationModal uses real gameState.club.squadSize and flags oversized rosters as non-compliant', () => {
    const modalSrc = fs.readFileSync('src/components/SquadRegistrationModal.tsx', 'utf-8');
    // Must not use the fabricated Math.min(rules.maxSquadSize, 20 + ...)
    expect(modalSrc).not.toContain('Math.min(rules.maxSquadSize, 20 +');
    expect(modalSrc).toContain('const squadSize = gameState.club?.squadSize || 24;');
    expect(modalSrc).toContain("squadSize > rules.maxSquadSize");
    expect(modalSrc).toContain("'Non-Compliant'");
  });

  it('ensures midSeasonEngine relegation_sponsors puts opt1Cost in extraData to prevent Free PR Exploit', async () => {
    const { generateMidSeasonEvent } = await import('../engine/midSeasonEngine');

    // Generate event for relegation battle club (baseOvr low)
    const mockState: any = {
      club: { id: 18, name: 'TSG 1899 Hoffenheim', tier: 1, baseOvr: 65, country: 'GER' },
      standings: [
        { name: 'TSG 1899 Hoffenheim', played: 17, points: 10, gd: -15, won: 2, drawn: 4, lost: 11, gf: 15, ga: 30 }
      ]
    };

    // Roll until relegation_sponsors is returned
    let sponsorEvent: any = null;
    for (let i = 0; i < 50; i++) {
      const evt = generateMidSeasonEvent(mockState);
      if (evt && evt.type === 'relegation_sponsors') {
        sponsorEvent = evt;
        break;
      }
    }

    expect(sponsorEvent).not.toBeNull();
    expect(sponsorEvent.extraData?.opt1Cost).toBeGreaterThan(0);
    expect(sponsorEvent.extraData?.opt1Cost).toBe(sponsorEvent.cost);
  });

  it('ensures Transitional Rebuild board vision generates 3-year objectives to avoid relegation and hoard 50M cash', async () => {
    const { generateBoardVision, updateBoardVisionSeasonEnd } = await import('../engine/boardVisionEngine');

    // Tier 1 mid-table club (e.g. Freiburg / Hoffenheim)
    const midClub: any = { id: 18, name: 'TSG 1899 Hoffenheim', tier: 1, baseOvr: 76, country: 'GER', currentBudget: 15000 };

    let vision: any = null;
    for (let i = 0; i < 50; i++) {
      const v = generateBoardVision(midClub, 2026);
      if (v.type === 'transitional_rebuild') {
        vision = v;
        break;
      }
    }

    expect(vision).not.toBeNull();
    expect(vision.durationYears).toBe(3);
    expect(vision.title).toBe('3-Year Transitional Rebuild');
    expect(vision.description).toContain('Clear out deadwood and stabilize');

    const avoidRel = vision.objectives.find((o: any) => o.type === 'avoid_relegation');
    const hoardCash = vision.objectives.find((o: any) => o.type === 'hoard_cash');

    expect(avoidRel).toBeDefined();
    expect(avoidRel.targetValue).toBe(3);
    expect(hoardCash).toBeDefined();
    expect(hoardCash.targetValue).toBe(50000); // €50,000,000

    expect(vision.reward.skillPointsBonus).toBe(25);
    expect(vision.reward.trustBonus).toBe(30);
    expect(vision.reward.immunityBonus).toBe(1);

    // Test Season 1 progress
    const s1Result = updateBoardVisionSeasonEnd(vision, {
      pos: 10,
      tier: 1,
      trophiesWon: { bl: 0, cl: 0, el: 0, ecl: 0, dfb: 0, cwc: 0, lower: 0, reg: 0 },
      graduatedYouthCount: 0,
      netTransferProfitK: 0,
      academyLevel: 1,
      facilitiesUpgradedThisSeason: 0,
      isInDebt: false,
      isRelegated: false,
      isPromoted: false,
      baseOvr: 76,
      qualifiedEuro: false,
      madeCupFinal: false,
      fanbaseGrowthPct: 0,
      endBudget: 55000 // exceeds 50M
    });

    const s1Avoid = s1Result.updatedVision.objectives.find((o: any) => o.type === 'avoid_relegation');
    const s1Cash = s1Result.updatedVision.objectives.find((o: any) => o.type === 'hoard_cash');
    expect(s1Avoid?.currentValue).toBe(1);
    expect(s1Cash?.currentValue).toBe(55000);
    expect(s1Cash?.isCompleted).toBe(true);
  });

  it('ensures Feeder Club prestige upgrade grants +1 boost to generated youth prospects', async () => {
    const { generateIncubatorProspect } = await import('../engine/incubatorEngine');

    // Run 50 samples without feeder club and with feeder club
    let totalNormalBoost = 0;
    let totalFeederBoost = 0;
    const runs = 50;

    for (let i = 0; i < runs; i++) {
      const normal = generateIncubatorProspect(1, 0, undefined, false);
      const feeder = generateIncubatorProspect(1, 0, undefined, true);
      totalNormalBoost += normal.boost;
      totalFeederBoost += feeder.boost;
    }

    // Feeder boost must average substantially higher due to guaranteed +1
    expect(totalFeederBoost / runs).toBeGreaterThan(totalNormalBoost / runs);
  });

  it('ensures Prestige Sinks are defined in dedicated VIP PrestigeModal and types', () => {
    const prestigeModalSrc = fs.readFileSync('src/components/PrestigeModal.tsx', 'utf-8');
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');

    expect(prestigeModalSrc).toContain('Legacy & Prestige');
    expect(prestigeModalSrc).toContain('Bronze Statue');
    expect(prestigeModalSrc).toContain('Stadium Naming');
    expect(prestigeModalSrc).toContain('Feeder Club');
    expect(prestigeModalSrc).toContain('onPrestigePurchase');

    expect(appSrc).toContain('handlePrestigePurchase');
    expect(appSrc).toContain("type === 'statue'");
    expect(appSrc).toContain("type === 'stadium'");
    expect(appSrc).toContain("type === 'feeder'");
    expect(appSrc).toContain('statueBuilt');
    expect(appSrc).toContain('stadiumRenamed');
    expect(appSrc).toContain('feederClubPurchased');
    expect(prestigeModalSrc).toContain('Sovereign Immortality');
    expect(appSrc).toContain("type === 'immortality'");
    expect(appSrc).toContain('managerialImmortality');
  });

  it('ensures Stale Tactic penalty is hard and un-cushioned by Level 5 facilities', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const ovrModalSrc = fs.readFileSync('src/components/OvrModal.tsx', 'utf-8');
    const seasonFinishSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');

    // App.tsx enforces clean -4 penalty without facility cushion
    expect(appSrc).toContain("tacticalSynergyText += ` (Stale Tactic: The league has figured out your system! -${penalty} OVR)`;");
    expect(appSrc).not.toContain('(Stale Tactic cushioned by Level 5 Facilities');

    // OvrModal uses hard -4 OVR penalty
    expect(ovrModalSrc).toContain('const stalePenalty = isStale ? 4 : 0;');
    expect(ovrModalSrc).not.toContain('Cushioned to -2 OVR by Level 5 Facilities');

    // SeasonFinishModal enforces unavoidable -4 OVR
    expect(seasonFinishSrc).toContain('unavoidable <strong className="text-rose-400">-4 OVR penalty</strong>');
    expect(seasonFinishSrc).toContain("'Stale (-4 OVR Penalty)'");
  });

  it('ensures exponential wage bill scaling kicks in at 95+ OVR', async () => {
    const { calculateClubFinancials } = await import('../data/gameConstants');

    const baseClub = {
      name: '1. FC Magdeburg',
      tier: 1,
      country: 'GER',
      baseOvr: 90,
      stadium: 75000,
      fanBase: 70000,
      squadSize: 24,
    };

    const fin90 = calculateClubFinancials({ club: { ...baseClub, baseOvr: 90 }, budget: 100000, isManaged: true });
    const fin94 = calculateClubFinancials({ club: { ...baseClub, baseOvr: 94 }, budget: 100000, isManaged: true });
    const fin98 = calculateClubFinancials({ club: { ...baseClub, baseOvr: 98 }, budget: 100000, isManaged: true });
    const fin102 = calculateClubFinancials({ club: { ...baseClub, baseOvr: 102 }, budget: 100000, isManaged: true });

    // Normal growth below 95
    expect(fin94.pureWages).toBeGreaterThan(fin90.pureWages);

    // Exponential scaling at 98 OVR (1.25^4 ≈ 2.44x extra multiplier)
    expect(fin98.pureWages).toBeGreaterThan(fin94.pureWages * 2.0);

    // 102 OVR megateam (1.25^8 ≈ 5.96x multiplier) must command massive financial overhead
    expect(fin102.pureWages).toBeGreaterThan(fin94.pureWages * 4.5);
  });

  it('ensures transfer OVR injections apply diminishing returns at >92 and >=96 OVR', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const transferModalSrc = fs.readFileSync('src/components/TransferModal.tsx', 'utf-8');

    // Galactico clamping logic
    expect(appSrc).toContain('gameState.club.baseOvr >= 96 ? 1 : Math.ceil(ovrGain / 3)');

    // TransferModal displays diminishing returns notice
    expect(transferModalSrc).toContain('Elite squad diminishing returns: Guaranteed +1 OVR');
    expect(transferModalSrc).toContain('Elite roster diminishing returns: Guaranteed +2 OVR');
  });

  it('prevents club name collisions in autoRepairSingleClub and mergeClubsDbSafeguards (Vitória S.C. vs Vitória F.C., PSG vs Paris FC, cross-country names)', async () => {
    const { ALL_CLUBS } = await import('../data/clubsData');
    const { getBaseModClubs } = await import('../engine/moddingEngine');
    const { autoRepairSingleClub, mergeClubsDbSafeguards } = await import('./modSafeguards');

    const modClubs = getBaseModClubs();
    const merged = mergeClubsDbSafeguards(modClubs, ALL_CLUBS, null);

    // Every single entry in modClubs (1,584 clubs) must survive mergeClubsDbSafeguards without being dropped
    expect(merged.length).toBe(modClubs.length);

    // Specifically verify Vitória S.C. (205) and Vitória F.C. (255) both exist in Portugal
    const vitoriaSC = merged.find(c => c.id === 205);
    const vitoriaFC = merged.find(c => c.id === 255);
    expect(vitoriaSC?.name).toBe('Vitória S.C.');
    expect(vitoriaFC?.name).toBe('Vitória F.C.');

    // Verify Paris (ID 401) repairs to Paris Saint-Germain, not Paris FC
    const parisBase = ALL_CLUBS.find(c => c.id === 401)!;
    const repairedParis = autoRepairSingleClub(parisBase, true);
    expect(repairedParis.name).toBe('Paris Saint-Germain');

    // Verify cross-country duplicate names (Halifax ENG T6 vs Halifax CAN T1) don't overwrite each other's livingTiers
    const halifaxEng = ALL_CLUBS.find(c => c.id === 804)!;
    const halifaxCan = ALL_CLUBS.find(c => c.id === 2304)!;
    const mockState: any = {
      seasonCount: 3,
      year: 2028,
      startYear: 2026,
      livingTiers: {
        'ENG_halifax': 5,
        'CAN_halifax': 1,
        'halifax': 1, // legacy unscoped key must be ignored when cross-country duplicate exists
      }
    };
    const mergedWithTiers = mergeClubsDbSafeguards([halifaxEng, halifaxCan], [halifaxEng, halifaxCan], mockState);
    expect(mergedWithTiers.find(c => c.id === 804)?.tier).toBe(5);
    expect(mergedWithTiers.find(c => c.id === 2304)?.tier).toBe(1);
  });

  it('prevents reserve clubs from receiving impossible top-tier Board Vision promotion targets and avoids double-counting facility upgrades', async () => {
    const { generateBoardVision, applyFacilityUpgradeToBoardVision, updateBoardVisionSeasonEnd } = await import('../engine/boardVisionEngine');
    const { getManagerialDilemmas } = await import('../engine/seasonSimEngine');

    // Reserve club in Germany Tier 3 (highest allowed tier for GER reserves is Tier 3)
    const reserveClub: any = {
      id: 9901,
      name: 'Bayern Munich II',
      country: 'GER',
      tier: 3,
      baseOvr: 70,
      stadium: 15000,
      academyLevel: 3,
      medicalLevel: 2,
      isReserve: true,
    };

    for (let i = 0; i < 30; i++) {
      const vision = generateBoardVision(reserveClub, 2026);
      expect(vision.type).toBe('youth_factory');
      for (const obj of vision.objectives) {
        expect(obj.type).not.toBe('promotion');
      }
    }

    // Verify mid-season facility upgrade + season-end update does not double-count when facilitiesAlreadyTracked is true
    let vision: any = {
      id: 'vision_test',
      title: 'Infrastructure Plan',
      type: 'financial_restructure',
      description: 'Upgrade facilities',
      startYear: 2026,
      durationYears: 3,
      currentYearOfVision: 1,
      objectives: [
        {
          id: 'obj_upgrade_facs',
          desc: 'Complete 2 Facility or Stadium Upgrades',
          targetValue: 2,
          currentValue: 0,
          unit: 'Upgrades',
          type: 'upgrade_facilities',
        }
      ],
      reward: { budgetBonus: 5000, trustBonus: 15, immunityBonus: 1, desc: 'Reward' },
      penalty: { ultimatum: false, trustPenalty: 20, desc: 'Penalty' },
      status: 'active',
    };

    vision = applyFacilityUpgradeToBoardVision(vision, 'stadium');
    const upgMid = vision.objectives.find((o: any) => o.id === 'obj_upgrade_facs')?.currentValue || 0;
    expect(upgMid).toBe(1);

    const endRes = updateBoardVisionSeasonEnd(vision, {
      pos: 5,
      tier: 2,
      trophiesWon: {},
      graduatedYouthCount: 0,
      netTransferProfitK: 0,
      academyLevel: 2,
      facilitiesUpgradedThisSeason: 1,
      facilitiesAlreadyTracked: true,
      isInDebt: false,
      isRelegated: false,
      isPromoted: false,
      baseOvr: 74,
      qualifiedEuro: false,
      madeCupFinal: false,
      fanbaseGrowthPct: 5,
    });
    const upgEnd = endRes.updatedVision.objectives.find((o: any) => o.id === 'obj_upgrade_facs')?.currentValue || 0;
    expect(upgEnd).toBe(1);

    // Verify getManagerialDilemmas produces finite numeric costs across tiers and never NaN
    const dilemmas = getManagerialDilemmas({
      club: { id: 1, name: 'Test FC', tier: 2, country: 'GER', baseOvr: 74, stadium: 25000, medicalLevel: 1 },
    } as any);
    expect(dilemmas.length).toBeGreaterThan(0);
    for (const d of dilemmas) {
      expect(Number.isFinite(d.optionA.budgetDeltaK)).toBe(true);
      expect(Number.isFinite(d.optionB.budgetDeltaK)).toBe(true);
      expect(d.optionA.badgeEn).not.toContain('NaN');
      expect(d.optionA.subEn).not.toContain('NaN');
    }
  });

  it('prevents double-counting Feeder Club +1 OVR bonus on youth graduation and synchronizes OVR counter & Youth Modal logic', async () => {
    const { generateIncubatorProspect, promoteProspectToSenior } = await import('../engine/incubatorEngine');

    // 1. Prospect generated WITH Feeder Club active already has feederBonusApplied = true
    const feederProspect = generateIncubatorProspect(3, 0, 'GER', true);
    expect((feederProspect as any).feederBonusApplied).toBe(true);
    const readyFeederProspect = { ...feederProspect, status: 'ready' as const, timer: 0 };

    // Promoting with hasFeederClub = true should only add NLZ Level 3 bonus (+1), NOT a second feeder bonus
    const promoRes = promoteProspectToSenior(readyFeederProspect, 75, 3, true);
    expect(promoRes.netGain).toBe(readyFeederProspect.boost + 1);

    // 2. Prospect generated BEFORE Feeder Club purchase (feederBonusApplied undefined) receives +1 feeder bonus on promotion
    const legacyProspect = generateIncubatorProspect(3, 0, 'GER', false);
    expect((legacyProspect as any).feederBonusApplied).toBeUndefined();
    const readyLegacyProspect = { ...legacyProspect, status: 'ready' as const, timer: 0 };
    const legacyPromoRes = promoteProspectToSenior(readyLegacyProspect, 75, 3, true);
    expect(legacyPromoRes.netGain).toBe(readyLegacyProspect.boost + 2); // +1 NLZ + 1 Feeder

    // 3. Early Call-Up of an incubating prospect applies -1 integration penalty (min +1) and does not apply NLZ maturity bonus
    const incubatingProspect = { ...feederProspect, boost: 3, status: 'incubating' as const, timer: 2 };
    const earlyPromoRes = promoteProspectToSenior(incubatingProspect, 75, 3, true);
    expect(earlyPromoRes.netGain).toBe(2); // 3 - 1 integrationCost = 2

    // 4. Verify OvrModal and DashboardHeader share unified OVR fallback and matchday modifier display
    const ovrModalSrc = fs.readFileSync('src/components/OvrModal.tsx', 'utf-8');
    const headerSrc = fs.readFileSync('src/components/DashboardHeader.tsx', 'utf-8');
    const youthModalSrc = fs.readFileSync('src/components/YouthModal.tsx', 'utf-8');

    expect(ovrModalSrc).toContain('Effective Matchday OVR');
    expect(ovrModalSrc).toContain('const prevOvrRaw = state.lastOvr !== undefined');
    expect(headerSrc).toContain('const prevOvrRaw = state.lastOvr !== undefined');
    expect(youthModalSrc).toContain('Call Up Early');
    expect(youthModalSrc).toContain('isSquadFull');

    // 5. Verify Youth Academy seasonal scout cap progression (L1: 1, L2: 2, L3: 4, L4: 6, L5: 10)
    const { getAcademyScoutCap } = await import('../data/gameConstants');
    expect(getAcademyScoutCap(1)).toBe(1);
    expect(getAcademyScoutCap(2)).toBe(2);
    expect(getAcademyScoutCap(3)).toBe(4);
    expect(getAcademyScoutCap(4)).toBe(6);
    expect(getAcademyScoutCap(5)).toBe(10);

    // 6. Verify storageManager evicts AUXILIARY_DB_KEYS on quota pressure so footy_manager_sim_state_v3 never fails
    const storageSrc = fs.readFileSync('src/utils/storageManager.ts', 'utf-8');
    expect(storageSrc).toContain('AUXILIARY_DB_KEYS');
    expect(storageSrc).toContain("'fms_clubs_db'");
    expect(storageSrc).toContain("'fms_dynamic_universe_clubs'");
  });

  it('enforces zero hardcoded Stripe/Supabase secret keys and separates Press Wall capacity into 18 paid + 2 free_48h pools', () => {
    const stripeClientSrc = fs.readFileSync('src/lib/stripeClientService.ts', 'utf-8');
    const serverSrc = fs.readFileSync('server.ts', 'utf-8');
    const netlifyCreateSrc = fs.readFileSync('netlify/functions/create-checkout-session.ts', 'utf-8');
    const netlifyConfirmSrc = fs.readFileSync('netlify/functions/confirm-sponsor-session.ts', 'utf-8');
    const netlifyWebhookSrc = fs.readFileSync('netlify/functions/stripe-webhook.ts', 'utf-8');
    const netlifyHighscoreSrc = fs.readFileSync('netlify/functions/submit-highscore.ts', 'utf-8');

    for (const src of [stripeClientSrc, serverSrc, netlifyCreateSrc, netlifyConfirmSrc, netlifyWebhookSrc, netlifyHighscoreSrc]) {
      expect(src).not.toContain('sk_live_');
      expect(src).not.toContain('whsec_');
      expect(src).not.toContain('DEFAULT_STRIPE_KEY');
      expect(src).not.toContain('DEFAULT_SERVICE_ROLE_KEY');
    }

    expect(stripeClientSrc).not.toContain('https://api.stripe.com');
    expect(stripeClientSrc).toContain("fetch('/api/create-checkout-session'");

    // Verify two-pool capacity separation (max 18 paid, max 2 free_48h) across both server.ts and Netlify functions
    for (const src of [serverSrc, netlifyCreateSrc, netlifyConfirmSrc]) {
      expect(src).toContain(".neq('package_type', 'free_48h')");
      expect(src).toContain(".eq('package_type', 'free_48h')");
      expect(src).toContain('freeCount >= 2');
      expect(src).toContain('paidCount >= 18');
    }
  });

  it('verifies Save Size Delta-Compression, Winter Break full state merge, and Server-Side Highscore Sanity Check', async () => {
    const { dehydrateClubsDbDelta, rehydrateClubsDbDelta } = await import('./storageManager');
    const baseClubs: any[] = [
      {
        id: 1,
        name: 'FC Bayern München',
        tier: 1,
        baseOvr: 88,
        color: 'dc052d',
        stadium: 75000,
        country: 'GER',
        rep: 95,
        fanBase: 1200000,
        logo: 'https://commons.wikimedia.org/bayern.svg',
        narrative: 'Bavarian Powerhouse',
      },
      {
        id: 2,
        name: 'Hamburger SV',
        tier: 2,
        baseOvr: 76,
        color: '005ca9',
        stadium: 57000,
        country: 'GER',
        rep: 78,
        fanBase: 650000,
        logo: 'https://commons.wikimedia.org/hsv.svg',
      },
    ];

    // Mutate club 2 in career (promoted to tier 1, OVR 82, custom data:image/ logo)
    const mutatedClubs: any[] = [
      baseClubs[0],
      {
        ...baseClubs[1],
        tier: 1,
        baseOvr: 82,
        academyLevel: 4,
        medicalLevel: 3,
        isInsolventGiant: true,
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      },
    ];

    const deltas = dehydrateClubsDbDelta(mutatedClubs);
    expect(deltas[0].name).toBeUndefined();
    expect(deltas[0].logo).toBeUndefined(); // Static external URL omitted from delta
    expect(deltas[1].logo).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'); // Custom data:image preserved

    const rehydrated = rehydrateClubsDbDelta(deltas, baseClubs);
    expect(rehydrated[0].name).toBe('FC Bayern München');
    expect(rehydrated[0].logo).toBe('https://commons.wikimedia.org/bayern.svg');
    expect(rehydrated[1].name).toBe('Hamburger SV');
    expect(rehydrated[1].tier).toBe(1);
    expect(rehydrated[1].baseOvr).toBe(82);
    expect(rehydrated[1].academyLevel).toBe(4);
    expect(rehydrated[1].logo).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA');

    // Verify Winter Break full state merge and Server-Side Highscore Sanity Check in server.ts and netlify/functions/submit-highscore.ts
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const serverSrc = fs.readFileSync('server.ts', 'utf-8');
    const netlifyHighscoreSrc = fs.readFileSync('netlify/functions/submit-highscore.ts', 'utf-8');
    const netlifyTomlSrc = fs.readFileSync('netlify.toml', 'utf-8');

    expect(appSrc).toContain('Object.assign(state, JSON.parse(JSON.stringify(latestGameStateRef.current)), preservedInFlightFields)');
    for (const src of [serverSrc, netlifyHighscoreSrc]) {
      expect(src).toContain('maxPlausibleTrophies');
      expect(src).toContain('maxPlausibleWins');
      expect(src).toContain('maxPlausibleScore');
    }
    expect(netlifyTomlSrc).toContain('/.netlify/functions/submit-highscore');
  });
});



