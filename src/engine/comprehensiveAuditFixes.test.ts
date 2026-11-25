import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { calculateClubLeagueHistory } from './clubProgressionEngine';
import { getCoachWeaknessInfo } from './coachEngine';
import { computeMatchdayOvrBreakdown } from './ovrAndYouthHelpers';
import { calculateDirectorSynergy } from './internationalEngine';
import { buildActiveNotifications } from './liveSimVisualEngine';
import { computeCoachSeveranceK, buildPressureMomentOptions, applyPressureMomentResolution } from './pressureEngine';
import { resolveDynamicEvent } from '../data/randomEvents';
import { getAcademySolidarityDividendK, calculateClubFinancials } from '../data/gameConstants';
import { GameState } from '../types';

describe('Comprehensive Bug Audit & Logical Flaw Fixes', () => {
  it('calculateClubLeagueHistory always produces valid 34-match W/D/L records matching points', () => {
    const eliteClub = {
      id: 1,
      name: 'FC Bayern München',
      tier: 1,
      baseOvr: 92,
      color: '#dc052d',
      stadium: 75000,
      country: 'GER',
    };
    const midClub = {
      id: 2,
      name: '1. FC Nürnberg',
      tier: 2,
      baseOvr: 67,
      color: '#881337',
      stadium: 50000,
      country: 'GER',
    };

    const eliteHist = calculateClubLeagueHistory(eliteClub as any, 2026, 2036, [], {}, [
      { year: 2029, clubName: 'FC Bayern München', type: 'title_won', fromTier: 1, toTier: 1 },
    ] as any);
    const midHist = calculateClubLeagueHistory(midClub as any, 2026, 2036, [], {}, [
      { year: 2030, clubName: '1. FC Nürnberg', type: 'promoted', fromTier: 2, toTier: 1 },
      { year: 2031, clubName: '1. FC Nürnberg', type: 'relegated', fromTier: 1, toTier: 2 },
    ] as any);

    for (const rec of [...eliteHist, ...midHist]) {
      assert.equal(
        rec.wins + rec.draws + rec.losses,
        34,
        `Season ${rec.year} (${rec.leagueName}) W(${rec.wins})+D(${rec.draws})+L(${rec.losses}) must equal 34`
      );
      assert.equal(
        rec.wins * 3 + rec.draws,
        rec.points,
        `Season ${rec.year} (${rec.leagueName}) 3*W+D must equal points (${rec.points})`
      );
      assert.ok(rec.wins >= 0 && rec.draws >= 0 && rec.losses >= 0);
    }
  });

  it('Tactical Rigidity description matches the -5 OVR / -25 Morale mutiny penalty applied by the match engine', () => {
    const info = getCoachWeaknessInfo('Tactical Rigidity');
    assert.ok(info.desc.includes('-5 OVR'), `Expected -5 OVR in Tactical Rigidity description, got: ${info.desc}`);
    assert.ok(!info.desc.includes('-3 OVR'), 'Should no longer claim -3 OVR');
  });

  it('getLeagueAdvantage normalizes Defensive/Catenaccio aliases for leagueMetaTactic as well as club tactic', () => {
    const baseState = {
      club: { id: 1, name: 'Test FC', tier: 1, baseOvr: 80, country: 'GER', morale: 70, medicalLevel: 1, academyLevel: 1 },
      tactic: 'Tiki-Taka',
      leagueMetaTactic: 'Defensive',
      currentCoach: { id: 'c1', name: 'Coach', style: 'Tiki-Taka', ovrBoost: 0, cost: 100, repReq: 10, tier: 1 },
      managerSkills: [],
    } as unknown as GameState;

    const vsDefensive = computeMatchdayOvrBreakdown(baseState);
    const vsParkTheBus = computeMatchdayOvrBreakdown({ ...baseState, leagueMetaTactic: 'Park the Bus' } as GameState);
    assert.equal(vsDefensive.leagueMetaMod, 2, 'Tiki-Taka should beat Defensive meta (+2 OVR)');
    assert.equal(vsDefensive.leagueMetaMod, vsParkTheBus.leagueMetaMod);
    assert.equal(vsDefensive.effectiveMatchdayOvr, vsParkTheBus.effectiveMatchdayOvr);

    const counterVsCatenaccio = computeMatchdayOvrBreakdown({
      ...baseState,
      tactic: 'Direct Counter',
      leagueMetaTactic: 'Catenaccio',
    } as GameState);
    assert.equal(counterVsCatenaccio.leagueMetaMod, -2, 'Direct Counter should lose to Catenaccio meta (-2 OVR)');
  });

  it('calculateDirectorSynergy emits distinct, accurate friction clues for all three clash pairings', () => {
    const defGen = { id: 'c1', name: 'Herr Mauer', archetype: 'defensive_general' as const, preferredSquadDirection: 'defensive_fortress' as const, preferredInvestment: 'tactical_analytics' as const, starRating: 4, styleLabel: 'Catenaccio', blurb: '' };
    const charMot = { id: 'c2', name: 'El Maestro', archetype: 'charismatic_motivator' as const, preferredSquadDirection: 'golden_generation' as const, preferredInvestment: 'high_performance_camp' as const, starRating: 4, styleLabel: 'Flair', blurb: '' };
    const tacIdeo = { id: 'c3', name: 'Prof. Press', archetype: 'tactical_ideologue' as const, preferredSquadDirection: 'youth_pipeline' as const, preferredInvestment: 'tactical_analytics' as const, starRating: 4, styleLabel: 'Press', blurb: '' };

    const r1 = calculateDirectorSynergy('youth_pipeline', 'tactical_analytics', defGen as any);
    const r2 = calculateDirectorSynergy('defensive_fortress', 'high_performance_camp', charMot as any);
    const r3 = calculateDirectorSynergy('veteran_stalwarts', 'tactical_analytics', tacIdeo as any);

    assert.ok(r1.clues.some((c) => c.includes('Youth Pipeline')), `Expected Youth Pipeline clash clue, got: ${r1.clues.join(' | ')}`);
    assert.ok(r2.clues.some((c) => c.includes('Defensive Fortress')), `Expected Defensive Fortress clash clue, got: ${r2.clues.join(' | ')}`);
    assert.ok(r3.clues.some((c) => c.includes('Veteran')), `Expected Veteran clash clue, got: ${r3.clues.join(' | ')}`);
  });

  it('buildActiveNotifications detects status === ready 17yo youth prospects and respects same-season naming rights lock', () => {
    const state = {
      year: 2028,
      namingRightsSignedYear: 2028,
      stadiumNamingRights: null,
      sponsorsPitchedThisSeason: 3,
      club: { id: 1, name: 'Test FC', tier: 1, baseOvr: 80, country: 'GER', morale: 85, squadSize: 24 },
      youthPipeline: [
        { id: 'y1', name: 'Ready Teen', age: 17, timer: 1, status: 'ready', ovrGain: 2 },
        { id: 'y2', name: 'Loaned Teen', age: 17, timer: 0, status: 'loaned', ovrGain: 2 },
      ],
    } as unknown as GameState;

    const notifications = buildActiveNotifications(state, { net: 5000 } as any);
    assert.ok(!notifications.some((n) => n.id === 'naming_rights'), 'Should hide naming_rights during same-season lockout');
    const youthAlert = notifications.find((n) => n.id === 'youth_ready');
    assert.ok(youthAlert, 'Should show youth_ready alert for ready 17yo prospect with timer === 1');
    assert.ok(youthAlert?.title.includes('1 Academy Prospect Ready'));
  });

  it('prevents permanent OVR loss near cap, restores flopped loan OVR, guards World Cup double-count & double-sacking, and removes remaining -5 MP labels', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const decisionSrc = fs.readFileSync('src/components/DecisionDayModal.tsx', 'utf-8');
    const cupSrc = fs.readFileSync('src/components/CupRunModal.tsx', 'utf-8');
    const prestigeSrc = fs.readFileSync('src/components/PrestigeModal.tsx', 'utf-8');
    const overlaySrc = fs.readFileSync('src/components/SimulatingOverlay.tsx', 'utf-8');

    assert.ok(appSrc.includes('const appliedLoanDelta = updated.club.baseOvr - preLoanOvr;'));
    assert.ok(appSrc.includes('const actualRingerGain = newOvr - prev.club.baseOvr;'));
    assert.ok(appSrc.includes('if (state.activeLoanOvrBoost && state.activeLoanOvrBoost !== 0)'));
    assert.ok(appSrc.includes('const ringerDrop = state.veteranRingerOvrGain ?? 5;'));
    assert.ok(appSrc.includes('if (state.boardVision && !isSackedRelegation && !sackedJobOffer)'));
    assert.ok(appSrc.includes('if ((prev.worldCupCampaigns || []).some((c) => c.year === tournamentYear))'));
    assert.ok(!decisionSrc.includes('-5 MP'), 'DecisionDayModal should use -5 DP');
    assert.ok(!cupSrc.includes('-5 MP'), 'CupRunModal should use -5 DP');
    assert.ok(prestigeSrc.includes('state.budget >= 100000 || hasAnyUpgrade'), 'PrestigeModal should unlock at €100M or with existing upgrades');
    assert.ok(!overlaySrc.includes('gameState.pendingSeasonState.gf ='), 'SimulatingOverlay must not mutate gameState prop directly');
  });

  it('charges 0 severance for free internal/youth coaches in pressure moments and reverts only appliedOvrBoost near OVR 100', () => {
    const freeCoach = {
      id: 'res_1',
      name: 'Youth Caretaker',
      ovrBoost: 5,
      appliedOvrBoost: 2,
      cost: 0,
      repReq: 1,
      style: 'Balanced',
      country: 'GER',
      contractYearsLeft: 3,
      isReserveCoach: true,
    };

    assert.equal(computeCoachSeveranceK(freeCoach), 0);
    assert.equal(computeCoachSeveranceK({ cost: 0, contractYearsLeft: 2, isReserveCoach: false }), 0);
    assert.equal(computeCoachSeveranceK({ cost: 2000, contractYearsLeft: 2, isReserveCoach: false }), 2000);

    const state = {
      year: 2029,
      budget: 50000,
      clubImpactScore: 50,
      mediaPressure: 75,
      club: { id: 1, name: 'Test FC', tier: 1, baseOvr: 100, ovr: 100, country: 'GER', morale: 60 },
      currentCoach: freeCoach,
      severances: [],
    } as unknown as GameState;

    const assessment = {
      scenario: 'title_collapse',
      pressureScore: 75,
      expectedRank: 4,
    } as any;

    const options = buildPressureMomentOptions(state, assessment);
    const sackOpt = options.find((o) => o.id === 'demand_coach_change');
    assert.equal(sackOpt?.costK, 0, 'Free coach dismissal option should show 0 severance cost');

    const resolved = applyPressureMomentResolution(state, 'demand_coach_change', assessment);
    assert.equal(resolved.coachDismissed, true);
    assert.equal(resolved.updatedState.severances?.length, 0, 'Free coach dismissal must not add severance debt');
    assert.equal(
      resolved.updatedState.club.baseOvr,
      98,
      'Reverting appliedOvrBoost (2) from 100 must restore 98 instead of dropping to 95'
    );
  });

  it('resolveDynamicEvent preserves 0% morale instead of jumping to 100% via falsy fallback', () => {
    const baseState = {
      year: 2028,
      budget: 10000,
      reputation: 50,
      club: { id: 1, name: 'Test FC', tier: 1, baseOvr: 75, country: 'GER', morale: 0, fanBase: 10000 },
    } as unknown as GameState;

    const negEvent = {
      type: 'custom_test',
      opt1: { title: { en: 'Drop', de: 'Drop' } },
      extraData: {
        opt1Good: { morale: -15, toastEn: 'Drop' },
      },
    } as any;
    const afterNeg = resolveDynamicEvent(baseState, negEvent, 0, 1);
    assert.ok(afterNeg, 'resolveDynamicEvent should return a result');
    assert.equal(afterNeg.updated.club.morale, 0, '0% morale - 15 must stay at 0, not jump to 85');

    const posEvent = {
      type: 'custom_test',
      opt1: { title: { en: 'Boost', de: 'Boost' } },
      extraData: {
        opt1Good: { morale: 10, toastEn: 'Boost' },
      },
    } as any;
    const afterPos = resolveDynamicEvent(baseState, posEvent, 0, 1);
    assert.ok(afterPos, 'resolveDynamicEvent should return a result');
    assert.equal(afterPos.updated.club.morale, 10, '0% morale + 10 must become 10, not jump to 100');
  });

  it('getAcademySolidarityDividendK matches calculateClubFinancials Level 5 dividend across tiers', () => {
    const expectedGer = getAcademySolidarityDividendK('GER');
    assert.equal(expectedGer, 1500);

    const tier5L4 = calculateClubFinancials({
      club: { name: 'Lower FC', tier: 5, baseOvr: 45, stadium: 3000, fanBase: 1500, country: 'GER', academyLevel: 4, medicalLevel: 1 },
      budget: 500,
      year: 2027,
      startYear: 2026,
      seasonCount: 2,
    });
    const tier5L5 = calculateClubFinancials({
      club: { name: 'Lower FC', tier: 5, baseOvr: 45, stadium: 3000, fanBase: 1500, country: 'GER', academyLevel: 5, medicalLevel: 1 },
      budget: 500,
      year: 2027,
      startYear: 2026,
      seasonCount: 2,
    });
    assert.equal(tier5L5.estRevenue - tier5L4.estRevenue, expectedGer);
  });

  it('enforces second-pass audit fixes across App.tsx and modals', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const eventsSrc = fs.readFileSync('src/data/randomEvents.ts', 'utf-8');
    const transferSrc = fs.readFileSync('src/components/TransferModal.tsx', 'utf-8');
    const youthSrc = fs.readFileSync('src/components/YouthModal.tsx', 'utf-8');
    const fanBondingSrc = fs.readFileSync('src/components/FanBondingModal.tsx', 'utf-8');
    const workspaceSrc = fs.readFileSync('src/components/WorkspaceTabs.tsx', 'utf-8');
    const decisionSrc = fs.readFileSync('src/components/DecisionDayModal.tsx', 'utf-8');
    const wcSrc = fs.readFileSync('src/components/InternationalTournamentModal.tsx', 'utf-8');
    const cupSrc = fs.readFileSync('src/components/CupRunModal.tsx', 'utf-8');

    assert.ok(!/morale\s*\|\|/.test(appSrc), 'src/App.tsx must not use falsy morale || fallback');
    assert.ok(!/morale\s*\|\|/.test(eventsSrc), 'src/data/randomEvents.ts must not use falsy morale || fallback');
    assert.ok(!transferSrc.includes('Net / Match'), 'TransferModal must label annual margin as Net / Season');
    assert.ok(transferSrc.includes('Net / Season'));
    assert.ok(transferSrc.includes('20% Talent Magnet'));
    assert.ok(appSrc.includes('const talentMagnetMult = gameState.currentCoach?.strength === \'Talent Magnet\' ? 0.8 : 1.0;'));
    assert.ok(appSrc.includes('const galacticoFanGain = Math.round(5000 * (updated.clubIdentity === \'galactico\' ? 1.5 : 1.0));'));
    assert.ok(appSrc.includes('interestRate: selectedOpt.annualRatePct'));
    assert.ok(appSrc.includes('allClWins.filter(t => t.clubName === state.club.name).length === 1'));
    assert.ok(appSrc.includes("const m = metaTac === 'Catenaccio' || metaTac === 'Defensive' ? 'Park the Bus' : metaTac;"));
    assert.ok(youthSrc.includes('getAcademySolidarityDividendK('));
    assert.ok(fanBondingSrc.includes('getLeagueScaledFans(') && !fanBondingSrc.includes('>+5,000<'));
    assert.ok(workspaceSrc.includes("coach.ovrBoost >= 0 ? '+' : ''"));
    assert.ok(decisionSrc.includes('leg1Result.me + liveScore.me'));
    assert.ok(wcSrc.includes('if (isFreshInvite)') && wcSrc.includes('localStorage.removeItem(storageKey)'));
    assert.ok(cupSrc.includes('mpSpent?: number'));
  });
});
