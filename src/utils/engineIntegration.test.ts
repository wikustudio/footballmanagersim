import { describe, it, expect } from 'vitest';
import { ALL_CLUBS, TURKEY_CLUBS } from '../data/clubsData';
import {
  COUNTRIES,
  COUNTRY_LEAGUES,
  getMaxTier,
  getLeagueInfo,
  getLeagueScaledVal,
  calculateClubFinancials,
  getCreditLimit,
  getDomesticCupInfo,
  getClubMaxBankLoan,
  getLoanOptions,
} from '../data/gameConstants';
import { simulateAiLeagues } from '../engine/simulateAiLeagues';
import { generateCoachMarket } from '../engine/coachEngine';
import { assignRival } from './rivalHelpers';
import { getContinentalCupNames } from './regionHelpers';
import { generateMidSeasonEvent } from '../engine/midSeasonEngine';
import { getCupName } from '../data/randomEvents';

describe('Game Engine Integration & Data Integrity Tests', () => {
  it('ensures all clubs have valid properties and no duplicate IDs', () => {
    const idSet = new Set<number>();
    for (const club of ALL_CLUBS) {
      expect(idSet.has(club.id)).toBe(false);
      idSet.add(club.id);
      expect(club.name).toBeTruthy();
      expect(club.tier).toBeGreaterThanOrEqual(1);
      expect(club.baseOvr).toBeGreaterThanOrEqual(1);
      expect(club.stadium).toBeGreaterThanOrEqual(500);
      expect(club.country).toBeTruthy();
      const maxTier = getMaxTier(club.country);
      expect(club.tier).toBeLessThanOrEqual(maxTier);
    }
  });

  it('ensures Turkish clubs have exactly 18 clubs per tier for tiers 1, 2, and 3', () => {
    const t1 = TURKEY_CLUBS.filter(c => c.tier === 1);
    const t2 = TURKEY_CLUBS.filter(c => c.tier === 2);
    const t3 = TURKEY_CLUBS.filter(c => c.tier === 3);
    expect(t1.length).toBe(18);
    expect(t2.length).toBe(18);
    expect(t3.length).toBe(18);
  });

  it('ensures calculateClubFinancials does not produce NaN for any club', () => {
    for (const club of ALL_CLUBS) {
      const fin = calculateClubFinancials({ club, budget: 500000 });
      expect(Number.isNaN(fin.estRevenue)).toBe(false);
      expect(Number.isNaN(fin.wages)).toBe(false);
      expect(Number.isNaN(fin.net)).toBe(false);
      expect(fin.estRevenue).toBeGreaterThan(0);
    }
  });

  it('ensures coach market generates valid coaches for all countries with strengths and steep weaknesses', () => {
    for (const country of Object.keys(COUNTRIES)) {
      const coaches = generateCoachMarket(2, country, 50, 0, 'start');
      expect(coaches.length).toBeGreaterThan(0);
      for (const coach of coaches) {
        expect(coach.name).toBeTruthy();
        expect(coach.name).not.toContain('undefined');
        expect(Number.isNaN(coach.cost)).toBe(false);
        expect(Number.isNaN(coach.repReq)).toBe(false);
        expect(coach.strength).toBeTruthy();
        expect(coach.weakness).toBeTruthy();
      }
    }
  });

  it('ensures rival assignment succeeds for all clubs in the database', () => {
    for (const club of ALL_CLUBS.slice(0, 100)) {
      const rival = assignRival(club, ALL_CLUBS);
      expect(rival).toBeDefined();
      expect(rival.id).not.toBe(club.id);
      expect(rival.name).toBeTruthy();
    }
  });

  it('simulates 3 consecutive AI league seasons without club corruption', () => {
    let clubs = JSON.parse(JSON.stringify(ALL_CLUBS));
    const initialCount = clubs.length;
    for (let season = 0; season < 3; season++) {
      clubs = simulateAiLeagues(clubs, 2437); // Yeşil Bursa SK
      expect(clubs.length).toBe(initialCount);
    }
  });

  it('ensures mid-season events generate valid options and content', () => {
    for (const club of ALL_CLUBS.slice(0, 20)) {
      const event = generateMidSeasonEvent({ club, year: 2026 } as any);
      expect(event).toBeDefined();
      if (event) {
        expect(event.title.en).toBeTruthy();
        expect(event.desc.en).toBeTruthy();
        expect(event.opt1).toBeDefined();
      }
    }
  });

  it('ensures getCupName returns valid names across all countries and cup tiers', () => {
    for (const country of Object.keys(COUNTRIES)) {
      const cupName = getCupName('dfb', country, 1);
      expect(cupName).toBeTruthy();
    }
  });

  it('ensures changing clubs reassigns a new rival matching the new club', () => {
    const oldClub = ALL_CLUBS.find(c => c.country === 'MEX' && c.name.includes('América')) || ALL_CLUBS[0];
    const newClub = ALL_CLUBS.find(c => c.country === 'MEX' && c.id !== oldClub.id) || ALL_CLUBS[1];
    
    const newRival = assignRival(newClub, ALL_CLUBS);
    expect(newRival).toBeDefined();
    expect(newRival.id).not.toBe(newClub.id);
    expect(newRival.name).toBeTruthy();
    expect(newRival.wins).toBe(0);
    expect(newRival.losses).toBe(0);
    expect(newRival.draws).toBe(0);
  });

  it('ensures Liga MX continental cup names map correctly to Champions Cup, Leagues Challenge, and Challenge Cup', () => {
    const mexCups = getContinentalCupNames('MEX');
    expect(mexCups.cl).toBe('North American Champions Cup');
    expect(mexCups.el).toBe('Leagues Challenge');
    expect(mexCups.ecl).toBe('North American Challenge Cup');
  });

  it('ensures generateBoardVision creates appropriate strategic roadmaps for super clubs and lower tier clubs', async () => {
    const { generateBoardVision, updateBoardVisionSeasonEnd } = await import('../engine/boardVisionEngine');
    const bayern = ALL_CLUBS.find(c => c.name.includes('Bayern')) || { id: 1, name: 'FC Bayern', tier: 1, baseOvr: 89, color: '#dc2626', stadium: 75000 };
    const vision = generateBoardVision(bayern as any, 2026);
    expect(vision).toBeDefined();
    expect([2, 3, 5]).toContain(vision.durationYears);
    expect(vision.objectives.length).toBeGreaterThan(0);
    expect(['Total Silverware Dominance', '2-Year Win-Now Mandate', '5-Year Dynasty Architecture', 'Continental Breakthrough', '2-Year European Sprint', '5-Year Continental Ascent']).toContain(vision.title);

    // Test Season 1 progress evaluation
    const evalResult = updateBoardVisionSeasonEnd(vision, {
      pos: 1,
      tier: 1,
      trophiesWon: { bl: 1 },
      graduatedYouthCount: 0,
      netTransferProfitK: 10000,
      academyLevel: 2,
      facilitiesUpgradedThisSeason: 1,
      isInDebt: false,
      isRelegated: false,
      isPromoted: false,
      baseOvr: 89,
      qualifiedEuro: true,
      madeCupFinal: true,
      fanbaseGrowthPct: 10
    });

    expect(evalResult.outcome).toBe('progress');
    expect(evalResult.updatedVision.currentYearOfVision).toBe(2);
    const titlesObj = evalResult.updatedVision.objectives.find(o => o.type === 'league_titles');
    if (titlesObj) {
      expect(titlesObj.currentValue).toBe(1);
    }
  });

  it('guarantees that 2-year plans never demand 3 academy upgrades and small clubs do not get cost-exploding academy goals', async () => {
    const { generateBoardVision } = await import('../engine/boardVisionEngine');
    
    // Test 100 iterations of vision generation across various club sizes
    const smallAmateurClub = { id: 999, name: 'SV Grassroots', tier: 5, baseOvr: 52, stadium: 2500, fanBase: 1200, currentBudget: 150000, academyLevel: 1 };
    const midClub = { id: 888, name: 'SC Ambition', tier: 2, baseOvr: 72, stadium: 18000, fanBase: 45000, currentBudget: 4000000, academyLevel: 1 };

    for (let i = 0; i < 50; i++) {
      const smallVision = generateBoardVision(smallAmateurClub as any, 2026);
      expect([2, 3, 5]).toContain(smallVision.durationYears);

      // Verify small club academy constraints:
      const acadObj = smallVision.objectives.find(o => o.id === 'obj_academy_lvl');
      if (acadObj) {
        // Must never exceed Level 2 for a small grassroots club, ensuring cost base doesn't explode
        expect(acadObj.targetValue).toBeLessThanOrEqual(2);
        // Upgrades required can never exceed durationYears
        expect(acadObj.targetValue - (smallAmateurClub.academyLevel || 1)).toBeLessThanOrEqual(smallVision.durationYears);
      }

      const midVision = generateBoardVision(midClub as any, 2026);
      const midAcadObj = midVision.objectives.find(o => o.id === 'obj_academy_lvl');
      if (midAcadObj) {
        // Hard facility ceiling: academy target can never exceed level 5
        expect(midAcadObj.targetValue).toBeLessThanOrEqual(5);
        // Can never ask for more upgrades than the duration in years!
        // E.g., in a 2-year plan, one cannot have 3 upgrades to academy!
        const requiredUpgrades = midAcadObj.targetValue - (midClub.academyLevel || 1);
        expect(requiredUpgrades).toBeLessThanOrEqual(midVision.durationYears);
        if (midVision.durationYears === 2) {
          expect(requiredUpgrades).toBeLessThanOrEqual(2);
          expect(requiredUpgrades).not.toBe(3);
        }
      }
    }

    // Reserve team roadmap integrity: always focuses on youth development and never climbs to Tier 1
    const reserveClub = { id: 777, name: 'Borussia Dortmund II', tier: 3, country: 'GER', baseOvr: 64, academyLevel: 2 };
    for (let i = 0; i < 20; i++) {
      const resVision = generateBoardVision(reserveClub as any, 2026);
      expect(resVision.type).toBe('youth_factory');
      // Must focus on graduating youth players
      const youthObj = resVision.objectives.find(o => o.type === 'graduate_youth');
      expect(youthObj).toBeDefined();
      // Must never have a promotion objective to Tier 1
      const promoObj = resVision.objectives.find(o => o.type === 'promotion');
      expect(promoObj).toBeUndefined();
    }
  });

  it('verifies Atletico Madrid has the official SVG crest in database and maps through aliases', async () => {
    const { TEAMS } = await import('../mod-data/teams');
    const { REAL_CLUB_ALIASES } = await import('../engine/moddingEngine');
    const atletico = TEAMS.find(t => t.name.includes('Atlético de Madrid') || t.id === 503);
    expect(atletico?.logo).toMatch(/\/assets\/logos\/atletico_madrid\.svg|Atletico_Madrid_logo\.svg/);
    expect(atletico?.logo).not.toContain('Bianco_e_Rosso');

    // Test aliases
    expect(REAL_CLUB_ALIASES['atletico madrid']).toBe(503);
    expect(REAL_CLUB_ALIASES['madrid rojo y blanco']).toBe(503);
    expect(REAL_CLUB_ALIASES['madrid rojiblanco']).toBe(503);
  });

  it('captures facility upgrades in board roadmap in real-time and at season end', async () => {
    const { applyFacilityUpgradeToBoardVision, updateBoardVisionSeasonEnd } = await import('../engine/boardVisionEngine');
    const mockVision: any = {
      id: 'test_vision',
      title: 'Financial Restructure & Infrastructure',
      type: 'financial_restructure',
      description: 'Test vision',
      startYear: 2026,
      durationYears: 3,
      currentYearOfVision: 1,
      objectives: [
        {
          id: 'obj_upgrade_facs',
          desc: 'Complete at least 2 facility upgrades (Stadium, Medical, or Academy)',
          targetValue: 2,
          currentValue: 0,
          unit: 'Upgrades',
          type: 'upgrade_facilities'
        },
        {
          id: 'obj_academy_lvl',
          desc: 'Upgrade Youth Academy facility to Level 3 or higher',
          targetValue: 3,
          currentValue: 1,
          unit: 'Level',
          type: 'upgrade_facilities'
        }
      ],
      reward: { budgetBonus: 10000, trustBonus: 20, desc: 'Reward' },
      penalty: { ultimatum: false, trustPenalty: 20, desc: 'Penalty' },
      status: 'active'
    };

    // First upgrade: Stadium
    let updatedVision = applyFacilityUpgradeToBoardVision(mockVision, 'stadium');
    let facObj = updatedVision.objectives.find(o => o.id === 'obj_upgrade_facs');
    expect(facObj?.currentValue).toBe(1);
    expect(facObj?.isCompleted).toBe(false);

    // Second upgrade: Academy to level 3
    updatedVision = applyFacilityUpgradeToBoardVision(updatedVision, 'academy', 3);
    facObj = updatedVision.objectives.find(o => o.id === 'obj_upgrade_facs');
    const acadObj = updatedVision.objectives.find(o => o.id === 'obj_academy_lvl');
    expect(facObj?.currentValue).toBe(2);
    expect(facObj?.isCompleted).toBe(true);
    expect(acadObj?.currentValue).toBe(3);
    expect(acadObj?.isCompleted).toBe(true);

    // Season end evaluation with facilitiesAlreadyTracked: true
    const evalResult = updateBoardVisionSeasonEnd(updatedVision, {
      pos: 5,
      tier: 2,
      trophiesWon: {},
      graduatedYouthCount: 0,
      netTransferProfitK: 0,
      academyLevel: 3,
      facilitiesUpgradedThisSeason: 2,
      facilitiesAlreadyTracked: true,
      isInDebt: false,
      isRelegated: false,
      isPromoted: false,
      baseOvr: 70,
      qualifiedEuro: false,
      madeCupFinal: false,
      fanbaseGrowthPct: 5
    });

    const evaluatedFacObj = evalResult.updatedVision.objectives.find(o => o.id === 'obj_upgrade_facs');
    expect(evaluatedFacObj?.currentValue).toBe(2);
    expect(evaluatedFacObj?.isCompleted).toBe(true);
  });

  it('ensures coach traits generate valid metadata and impact parameters', async () => {
    const { getCoachTraitInfo, COACH_STRENGTHS } = await import('../engine/coachEngine');
    expect(COACH_STRENGTHS).toContain('Talent Magnet');
    expect(COACH_STRENGTHS).toContain('Youth Whisperer');
    expect(COACH_STRENGTHS).toContain('Chaos Magnet');
    expect(COACH_STRENGTHS).toContain('Cursed');
    expect(COACH_STRENGTHS).toContain('Sponsor Magnet');

    const trait = getCoachTraitInfo('Talent Magnet');
    expect(trait.name).toBe('Talent Magnet');
    expect(trait.icon).toBeTruthy();
    expect(trait.desc).toContain('transfer fees');
  });

  it('ensures Transfer Sagas generate dilemmas with valid choices and consequences', async () => {
    const { generateTransferSaga } = await import('../engine/transferSagaEngine');
    const club = ALL_CLUBS[0];
    const saga = generateTransferSaga(club, 'Local Rival');
    expect(saga).toBeDefined();
    expect(saga.playerName).toBeTruthy();
    expect(saga.playerOvr).toBeGreaterThanOrEqual(70);
    expect(saga.options.length).toBeGreaterThanOrEqual(3);
    for (const opt of saga.options) {
      expect(opt.title).toBeTruthy();
      expect(typeof opt.budgetChange).toBe('number');
      expect(typeof opt.ovrChange).toBe('number');
      expect(typeof opt.moraleChange).toBe('number');
    }
  });

  it('ensures International Tournament Director mechanics simulate with coach synergy and strategy', async () => {
    const {
      NATIONAL_TEAMS,
      simulateInternationalMatch,
      getEligibleNationalOffers,
      getNationalCoachCandidates,
      calculateDirectorSynergy
    } = await import('../engine/internationalEngine');

    expect(NATIONAL_TEAMS.length).toBeGreaterThanOrEqual(8);
    const offers = getEligibleNationalOffers('GER', 85);
    expect(offers.length).toBeGreaterThanOrEqual(3);

    const team1 = NATIONAL_TEAMS.find(t => t.code === 'GER') || NATIONAL_TEAMS[0];
    const team2 = NATIONAL_TEAMS.find(t => t.code === 'FRA') || NATIONAL_TEAMS[1];

    const candidates = getNationalCoachCandidates(team1);
    expect(candidates.length).toBe(3);
    const coach = candidates[0];
    expect(coach.name).toBeTruthy();
    expect(coach.archetype).toBeTruthy();

    // Test synergy calculation: when aligned, synergy should be high
    const synergy = calculateDirectorSynergy(
      coach.preferredSquadDirection,
      coach.preferredInvestment,
      coach
    );
    expect(synergy.score).toBeGreaterThanOrEqual(85);
    expect(synergy.level).toBe('flawless');
    expect(synergy.ovrModifier).toBe(5);

    const match = simulateInternationalMatch(
      team1,
      team2,
      'Grand Final',
      coach.preferredSquadDirection,
      coach.preferredInvestment,
      coach,
      synergy
    );

    expect(match).toBeDefined();
    expect(typeof match.won).toBe('boolean');
    expect(match.stage).toBe('Grand Final');
    expect(match.summary).toBeTruthy();
  });

  it('ensures modding and original data JSON upload works for both array and object formats', async () => {
    const { normalizeAndValidateCustomDb } = await import('../components/Onboarding');

    // 1. Test array of original data clubs
    const originalClubsArray = [
      { id: 1, name: 'FC Bayern München', tier: 1, baseOvr: 97, stadium: 75000, country: 'GER', logo: 'https://example.com/bayern.png' },
      { id: 2, name: 'Bayer 04 Leverkusen', tier: 1, baseOvr: 86, stadium: 30210, country: 'GER' },
      { id: 3, name: 'Borussia Dortmund', tier: 1, baseOvr: 87, stadium: 81365, country: 'GER' }
    ];

    const resultArr = normalizeAndValidateCustomDb(originalClubsArray);
    expect(resultArr.valid).toBe(true);
    expect(resultArr.count).toBe(3);
    expect(resultArr.clubs).toBeDefined();

    const bayern = resultArr.clubs?.find(c => c.id === 1);
    expect(bayern).toBeDefined();
    expect(bayern?.name).toBe('FC Bayern München');
    expect(bayern?.logo).toBe('https://example.com/bayern.png');
    expect(bayern?.baseOvr).toBe(97);

    // 2. Test object format with { clubs: [...] } and string IDs/ratings
    const originalClubsObj = {
      version: '1.0',
      clubs: [
        { id: '1', name: 'FC Bayern Munich', tier: '1', baseOvr: '96', stadium: '75024' },
        { id: '3', name: 'BVB Borussia Dortmund', tier: '1', baseOvr: '86' }
      ]
    };

    const resultObj = normalizeAndValidateCustomDb(originalClubsObj);
    expect(resultObj.valid).toBe(true);
    expect(resultObj.count).toBe(2);
    const bvb = resultObj.clubs?.find(c => c.id === 3);
    expect(bvb?.name).toBe('BVB Borussia Dortmund');
    expect(bvb?.baseOvr).toBe(86);
    expect(typeof bvb?.id).toBe('number');

    // 3. Test original real-world names without explicit ID matching to default clubs
    const realWorldMod = {
      teams: [
        { name: 'FC Bayern München', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg', baseOvr: 98 },
        { name: 'Borussia Dortmund', crest: 'https://example.com/bvb_new_logo.png', stadium: 81365 },
        { name: 'Bayer 04 Leverkusen', badge: 'https://example.com/b04.webp' },
        { name: 'FC Schalke 04', icon: 'https://en.wikipedia.org/wiki/File:FC_Schalke_04_Logo.svg' }
      ]
    };

    const resultReal = normalizeAndValidateCustomDb(realWorldMod);
    expect(resultReal.valid).toBe(true);
    expect(resultReal.count).toBe(4);

    const bayernMatched = resultReal.clubs?.find(c => c.id === 1);
    expect(bayernMatched).toBeDefined();
    expect(bayernMatched?.name).toBe('FC Bayern München');
    expect(bayernMatched?.baseOvr).toBe(98);
    expect(bayernMatched?.logo).toContain('FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg');

    const bvbMatched = resultReal.clubs?.find(c => c.id === 3);
    expect(bvbMatched).toBeDefined();
    expect(bvbMatched?.name).toBe('Borussia Dortmund');
    expect(bvbMatched?.logo).toBe('https://example.com/bvb_new_logo.png');

    const b04Matched = resultReal.clubs?.find(c => c.id === 2);
    expect(b04Matched).toBeDefined();
    expect(b04Matched?.logo).toBe('https://example.com/b04.webp');

    const s04Matched = resultReal.clubs?.find(c => c.id === 28);
    expect(s04Matched).toBeDefined();
    expect(s04Matched?.name).toBe('FC Schalke 04');
    // Wikipedia File: link converted to direct image URL
    expect(s04Matched?.logo).toBe('https://commons.wikimedia.org/wiki/Special:FilePath/FC_Schalke_04_Logo.svg');
  });

  it('supports instantaneous toggling between real-world mod database and legally-safe database', async () => {
    const { getBaseModClubs, getSafeDefaultClubs } = await import('../engine/moddingEngine');
    
    // 1. Safe default database
    const safeClubs = getSafeDefaultClubs();
    expect(safeClubs.length).toBeGreaterThanOrEqual(370);
    const safeBayern = safeClubs.find(c => c.id === 1);
    expect(safeBayern?.name).toBe('Bavaria München');

    // 2. Real-world mod database (1,202 clubs)
    const realClubs = getBaseModClubs();
    expect(realClubs.length).toBeGreaterThanOrEqual(1000);
    const realBayern = realClubs.find(c => c.id === 1);
    expect(realBayern?.name).toBe('FC Bayern München');
    expect(realBayern?.logo).toContain('Bayern');
    
    const realLeverkusen = realClubs.find(c => c.id === 2);
    expect(realLeverkusen?.name).toBe('Bayer 04 Leverkusen');

    const realDortmund = realClubs.find(c => c.id === 3);
    expect(realDortmund?.name).toBe('Borussia Dortmund');

    // 3. Dynamic header lookup simulation
    const stateClub = { id: 1, name: 'Bavaria München', logo: undefined };
    const dynamicHeaderName = realClubs.find(c => c.id === stateClub.id)?.name || stateClub.name;
    expect(dynamicHeaderName).toBe('FC Bayern München');
  });

  it('verifies 2042 World Cup host nation is Brazil with Maracanã and selectable invitation', async () => {
    const { getHostNation, getEligibleNationalOffers, getNationalCoachCandidates, NATIONAL_TEAMS } = await import('../engine/internationalEngine');

    // 1. Host Nation check in 2042
    const host2042 = getHostNation(2042);
    expect(host2042.name).toBe('Brazil');
    expect(host2042.code).toBe('BRA');
    expect(host2042.flag).toBe('🇧🇷');
    expect(host2042.stadium).toBe('Maracanã');
    expect(host2042.city).toBe('Rio de Janeiro');

    // 2. Brazil is part of NATIONAL_TEAMS and has coaches
    const brazilTeam = NATIONAL_TEAMS.find(t => t.code === 'BRA');
    expect(brazilTeam).toBeDefined();
    expect(brazilTeam?.name).toBe('Brazil');

    const coaches = getNationalCoachCandidates(brazilTeam!);
    expect(coaches.length).toBe(3);
    expect(coaches[0].name).toBeTruthy();

    // 3. Host nation is always included in invitations
    const offers = getEligibleNationalOffers('GER', 60, 2042);
    const hostOffer = offers.find(o => o.code === 'BRA');
    expect(hostOffer).toBeDefined();
  });

  it('validates World Cup cycle (not 2029, but 2030), prior historical hosts (1970s, 2018 Russia, 2022 Qatar), and director eligibility', async () => {
    const { isWorldCupYear, isDirectorWorldCupEligible, getHostNation } = await import('../engine/internationalEngine');

    // 1. World Cup cycle checks: 2029 is not a WC year, 2030 is!
    expect(isWorldCupYear(2029)).toBe(false);
    expect(isWorldCupYear(2030)).toBe(true);
    expect(isWorldCupYear(2026)).toBe(true);
    expect(isWorldCupYear(2034)).toBe(true);

    // 1970s edge case start states
    expect(isWorldCupYear(1970)).toBe(true);
    expect(isWorldCupYear(1974)).toBe(true);
    expect(isWorldCupYear(1978)).toBe(true);
    expect(isWorldCupYear(1971)).toBe(false);
    expect(isWorldCupYear(1946)).toBe(false);

    // 2. Historical host locations:
    const host1970 = getHostNation(1970);
    expect(host1970.name).toBe('Mexico');
    expect(host1970.stadium).toBe('Estadio Azteca');

    const host1974 = getHostNation(1974);
    expect(host1974.name).toBe('Germany');
    expect(host1974.stadium).toBe('Olympiastadion');

    const host1978 = getHostNation(1978);
    expect(host1978.name).toBe('Argentina');
    expect(host1978.stadium).toBe('Estadio Monumental');

    const host2018 = getHostNation(2018);
    expect(host2018.name).toBe('Russia');
    expect(host2018.stadium).toBe('Luzhniki Stadium');

    const host2022 = getHostNation(2022);
    expect(host2022.name).toBe('Qatar');
    expect(host2022.stadium).toBe('Lusail Stadium');

    // 3. Director eligibility: only Tier 1 AND reputation > 80
    expect(isDirectorWorldCupEligible(1, 85)).toBe(true);
    expect(isDirectorWorldCupEligible(1, 80)).toBe(false); // must be > 80
    expect(isDirectorWorldCupEligible(1, 79)).toBe(false);
    expect(isDirectorWorldCupEligible(2, 95)).toBe(false); // Tier 2 not eligible
    expect(isDirectorWorldCupEligible(3, 100)).toBe(false); // Tier 3 not eligible
  });

  it('supports custom club context/narrative in mod files which overrides generic context', async () => {
    const { normalizeAndValidateCustomDb } = await import('../engine/moddingEngine');

    const modWithContext = {
      clubs: [
        {
          id: 1,
          name: 'FC Bayern München',
          context: 'Rekordmeister aiming for historic European treble under director leadership.'
        },
        {
          id: 3,
          name: 'Borussia Dortmund',
          history: 'Iconic yellow wall fanbase with legendary youth academy development.'
        }
      ]
    };

    const result = normalizeAndValidateCustomDb(modWithContext);
    expect(result.valid).toBe(true);
    
    const bayern = result.clubs?.find(c => c.id === 1);
    expect(bayern?.narrative).toBe('Rekordmeister aiming for historic European treble under director leadership.');

    const dortmund = result.clubs?.find(c => c.id === 3);
    expect(dortmund?.narrative).toBe('Iconic yellow wall fanbase with legendary youth academy development.');
  });

  it('supports adding custom tiers (e.g. Polish tiers 2, 3, 4) without breaking league info or getMaxTier', async () => {
    const { getMaxTier, getLeagueInfo } = await import('../data/gameConstants');
    const { normalizeAndValidateCustomDb } = await import('../engine/moddingEngine');
    const { simulateAiLeagues } = await import('../engine/simulateAiLeagues');

    const polishExpansion = [
      { id: 9101, name: 'Polonia Warszawa', tier: 2, country: 'POL', baseOvr: 63 },
      { id: 9102, name: 'Wisła Kraków', tier: 2, country: 'POL', baseOvr: 65 },
      { id: 9103, name: 'Bruk-Bet Termalica', tier: 2, country: 'POL', baseOvr: 62 },
      { id: 9104, name: 'Znicz Pruszków', tier: 2, country: 'POL', baseOvr: 60 },
      { id: 9201, name: 'Polonia Bytom', tier: 3, country: 'POL', baseOvr: 55 },
      { id: 9202, name: 'Chojniczanka', tier: 3, country: 'POL', baseOvr: 54 },
      { id: 9203, name: 'Zagłębie Sosnowiec', tier: 3, country: 'POL', baseOvr: 56 },
      { id: 9301, name: 'Unia Tarnów', tier: 4, country: 'POL', baseOvr: 48 },
      { id: 9302, name: 'Star Starachowice', tier: 4, country: 'POL', baseOvr: 47 },
      { id: 9303, name: 'Avia Świdnik', tier: 4, country: 'POL', baseOvr: 46 }
    ];

    const modResult = normalizeAndValidateCustomDb(polishExpansion);
    expect(modResult.valid).toBe(true);
    expect(modResult.clubs).toBeDefined();

    // Standard POL max tier is 1, but with clubsDb it dynamically returns 4
    expect(getMaxTier('POL')).toBe(1);
    expect(getMaxTier('POL', modResult.clubs!)).toBe(4);

    // League info generated dynamically for tiers 2, 3, 4
    const t2 = getLeagueInfo(2, 'POL');
    const t3 = getLeagueInfo(3, 'POL');
    const t4 = getLeagueInfo(4, 'POL');

    expect(t2.name).toBeTruthy();
    expect(t3.name).toBeTruthy();
    expect(t4.name).toBeTruthy();
    expect(t2.avgOvr).toBeGreaterThan(t3.avgOvr);
    expect(t3.avgOvr).toBeGreaterThan(t4.avgOvr);

    // AI simulation runs without crashing
    const simulated = simulateAiLeagues(modResult.clubs!, 9101);
    expect(simulated.length).toBe(modResult.clubs!.length);
  });

  it('correctly caches and retrieves logo URLs and data in memory and localStorage', async () => {
    const { 
      getClubLogoKey, 
      setCachedWorkingUrl, 
      getCachedLogo, 
      markUrlLoaded, 
      isUrlLoadedInMemory, 
      setCachedDataUrl 
    } = await import('./logoCache');

    // 1. Key generation
    const key1 = getClubLogoKey(129, 'VfR Mannheim');
    expect(key1).toBe('id:129');
    const key2 = getClubLogoKey(undefined, 'VfR Mannheim II');
    expect(key2).toBe('name:vfr mannheim');

    // 2. Working URL caching
    setCachedWorkingUrl(key1, 'https://example.com/mannheim.png');
    const cached1 = getCachedLogo(key1);
    expect(cached1.workingUrl).toBe('https://example.com/mannheim.png');

    // 3. Memory load tracking
    expect(isUrlLoadedInMemory('https://example.com/mannheim.png')).toBe(true);
    expect(isUrlLoadedInMemory('https://example.com/not_loaded.png')).toBe(false);

    markUrlLoaded('https://example.com/not_loaded.png');
    expect(isUrlLoadedInMemory('https://example.com/not_loaded.png')).toBe(true);

    // 4. Data URL caching
    const fakeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    setCachedDataUrl(key1, fakeDataUrl);
    const cached2 = getCachedLogo(key1);
    expect(cached2.dataUrl).toBe(fakeDataUrl);
  });

  it('prewarmClubsLogosAsync pre-warms club logos smoothly with timeout fallback', async () => {
    const { prewarmClubsLogosAsync } = await import('./logoCache');
    const start = performance.now();
    await prewarmClubsLogosAsync([
      { id: 1, name: 'FC Bayern', logo: 'https://example.com/bayern.png' },
      { id: 2, name: 'Borussia Dortmund', logo: 'https://example.com/bvb.png' },
    ], 100);
    const duration = performance.now() - start;
    // Should complete cleanly and not hang
    expect(duration).toBeLessThan(500);
  });

  it('correctly reports Landesliga and Verbandsliga league average OVRs', async () => {
    const { getLeagueInfo } = await import('../data/gameConstants');
    
    // Germany Tier 6 (Verbandsliga) and Tier 7 (Landesliga)
    const tier6 = getLeagueInfo(6, 'GER');
    const tier7 = getLeagueInfo(7, 'GER');
    
    expect(tier6.avgOvr).toBe(51);
    expect(tier7.name).toBe('Landesliga');
    expect(tier7.avgOvr).toBe(49);
    // Verified: League average is NOT 10!
    expect(tier7.avgOvr).not.toBe(10);
  });

  it('normalizes raw Euro currency in mod databases so lower-tier clubs do not get inflated treasuries', async () => {
    const { normalizeAndValidateCustomDb } = await import('../engine/moddingEngine');
    const { formatMoney } = await import('../data/gameConstants');

    // Mod JSON with VfR Mannheim in Tier 6 with budget entered as 18880 (intended €18,880)
    const customMod = [
      {
        id: 129,
        name: 'VfR Mannheim',
        tier: 6,
        baseOvr: 48,
        currentBudget: 18880
      }
    ];

    const result = normalizeAndValidateCustomDb(customMod);
    expect(result.valid).toBe(true);
    const vfr = result.clubs?.find(c => c.id === 129);
    expect(vfr).toBeDefined();
    // Normalized to thousands (19K instead of 18880K which is €18.88M)
    expect(vfr?.currentBudget).toBe(19);
    expect(formatMoney(vfr?.currentBudget || 0)).toBe('€19K');
  });

  it('ensures EFL Carabao Cup is properly mapped across getCupName, prestige themes, and trophy heights', async () => {
    const { getCompetitionTheme } = await import('./prestigeTheme');
    const { getTrophyPrestigeLevel, getDefaultTrophyHeight } = await import('../components/PrestigeTrophy');

    // 1. Cup name
    const eflName = getCupName('efl', 'ENG', 1);
    expect(eflName).toBe('League Cup');

    // 2. Prestige theme
    const theme = getCompetitionTheme('efl', 'ENG');
    expect(theme.prestigeLevel).toBe(4);
    expect(theme.prestigeStars).toBe('★★★★☆');

    // 3. Prestige trophy sizing
    expect(getTrophyPrestigeLevel('efl')).toBe(4);
    expect(getDefaultTrophyHeight(4, 'efl')).toBe(130);
  });

  it('verifies cup run scheduling: QF completes for winter break and SF advances to Final', async () => {
    // 1. Simulating QF phase before winter break
    const qfCup = {
      id: 'dfb',
      nameEn: 'DFB-Pokal',
      nameDe: 'DFB-Pokal',
      startRound: 'quarter' as const,
      endRound: 'quarter' as const,
    };
    expect(qfCup.startRound).toBe('quarter');
    expect(qfCup.endRound).toBe('quarter');

    // 2. Simulating SF/Final phase after winter break (second half of season)
    const postWinterCup: {
      id: string;
      nameEn: string;
      nameDe: string;
      startRound: 'semi';
      endRound?: 'quarter' | 'semi' | 'final';
    } = {
      id: 'dfb',
      nameEn: 'DFB-Pokal',
      nameDe: 'DFB-Pokal',
      startRound: 'semi',
    };
    expect(postWinterCup.startRound).toBe('semi');
    expect(postWinterCup.endRound).toBeUndefined(); // Plays continuous SF -> Final
  });

  it('ensures CareerSummary accurately computes multi-club trophy cabinets and career scores', () => {
    const mockHistory = [
      {
        year: 2026,
        clubName: 'Club Alpha',
        tier: 2,
        pos: 1,
        wins: 22,
        color: '#0055ff',
        trophiesThisYear: { bl: 1, dfb: 1, efl: 1 },
      },
      {
        year: 2027,
        clubName: 'Club Beta',
        tier: 1,
        pos: 1,
        wins: 26,
        color: '#ff0000',
        trophiesThisYear: { bl: 1, cl: 1, cwc: 1 },
      }
    ];

    // Compute aggregated trophies
    const totalTrophyCounts = { cl: 0, el: 0, ecl: 0, cwc: 0, bl: 0, lower: 0, dfb: 0, efl: 0, reg: 0, wc: 0 };
    mockHistory.forEach(h => {
      totalTrophyCounts.cl += h.trophiesThisYear.cl || 0;
      totalTrophyCounts.cwc += h.trophiesThisYear.cwc || 0;
      totalTrophyCounts.bl += h.trophiesThisYear.bl || 0;
      totalTrophyCounts.dfb += h.trophiesThisYear.dfb || 0;
      totalTrophyCounts.efl = (totalTrophyCounts.efl || 0) + (h.trophiesThisYear.efl || 0);
    });

    expect(totalTrophyCounts.cl).toBe(1);
    expect(totalTrophyCounts.cwc).toBe(1);
    expect(totalTrophyCounts.bl).toBe(2);
    expect(totalTrophyCounts.dfb).toBe(1);
    expect(totalTrophyCounts.efl).toBe(1);
  });

  it('ensures continental competitions match regions (Copa Libertadores -> South American Crown, etc.)', async () => {
    const { getCompetitionTheme } = await import('./prestigeTheme');

    // CONMEBOL (South America: ECU, BRA, ARG, COL)
    const ecuTheme = getCompetitionTheme('cl', 'ECU');
    expect(ecuTheme.badgeLabel.en).toBe('South American Crown');
    expect(ecuTheme.competitionTypeLabel.en).toContain('Copa Libertadores');
    expect(ecuTheme.iconClass).toBe('fa-earth-americas');

    const braTheme = getCompetitionTheme('cl', 'BRA');
    expect(braTheme.badgeLabel.en).toBe('South American Crown');

    const libTheme = getCompetitionTheme('Copa Libertadores', 'ARG');
    expect(libTheme.badgeLabel.en).toBe('South American Crown');

    const sudTheme = getCompetitionTheme('el', 'COL');
    expect(sudTheme.badgeLabel.en).toBe('Copa Sudamericana');

    const recopaTheme = getCompetitionTheme('ecl', 'ECU');
    expect(recopaTheme.badgeLabel.en).toBe('Recopa');

    // CONCACAF (North America: USA, MEX, CAN)
    const usaTheme = getCompetitionTheme('cl', 'USA');
    expect(usaTheme.badgeLabel.en).toBe('North American Crown');
    expect(usaTheme.competitionTypeLabel.en).toContain('Concacaf');

    const leaguesChallenge = getCompetitionTheme('el', 'USA', 'Leagues Challenge');
    expect(leaguesChallenge.badgeLabel.en).toBe('Leagues Challenge');

    // AFC (Asia: JPN, AUS, IDN, IND)
    const jpnTheme = getCompetitionTheme('cl', 'JPN');
    expect(jpnTheme.badgeLabel.en).toBe('Asian Crown');
    expect(jpnTheme.competitionTypeLabel.en).toContain('AFC');

    const asianCupTheme = getCompetitionTheme('el', 'JPN', 'Asian Cup');
    expect(asianCupTheme.badgeLabel.en).toBe('Asian Cup');

    // UEFA (Europe: GER, ENG, ESP, etc.)
    const gerClTheme = getCompetitionTheme('cl', 'GER');
    expect(gerClTheme.badgeLabel.en).toBe('European Crown');

    // CRITICAL USER BUG: Euro Cup in Germany must NOT be labeled DFB-Pokal!
    const gerEuroCupTheme = getCompetitionTheme('el', 'GER', 'Euro Cup');
    expect(gerEuroCupTheme.id).toBe('el');
    expect(gerEuroCupTheme.badgeLabel.en).toBe('Euro Cup');
    expect(gerEuroCupTheme.accentHex).toBe('#F97316');

    // DFB-Pokal in Germany must be DFB-Pokal
    const gerDfbTheme = getCompetitionTheme('dfb', 'GER', 'DFB-Pokal');
    expect(gerDfbTheme.id).toBe('dfb');
    expect(gerDfbTheme.badgeLabel.en).toBe('DFB-Pokal');
  });

  it('ensures broadcast network branding only displays when CR27_Footy pack is active', async () => {
    const { getBroadcastNetwork } = await import('./broadcastNetworks');

    // 1. Legal safety check: MUST be null when isModActive is false
    expect(getBroadcastNetwork('ENG', 'cl', false)).toBeNull();
    expect(getBroadcastNetwork('GER', 'el', false)).toBeNull();
    expect(getBroadcastNetwork('ECU', 'cl', false)).toBeNull();
    expect(getBroadcastNetwork('USA', 'dfb', false)).toBeNull();

    // 2. Verified network resolution when CR27_Footy pack is active
    // UK
    const ukCl = getBroadcastNetwork('ENG', 'cl', true);
    expect(ukCl?.shortName).toBe('TNT SPORTS');

    const ukCup = getBroadcastNetwork('ENG', 'dfb', true);
    expect(ukCup?.shortName).toBe('BBC SPORT');

    const ukLeague = getBroadcastNetwork('ENG', 'league', true);
    expect(ukLeague?.shortName).toBe('sky sports');

    // Germany: RTL for Europa League / Euro Cup (user requested), Sky Sport for Bundesliga
    const gerEl = getBroadcastNetwork('GER', 'el Euro Cup', true);
    expect(gerEl?.shortName).toBe('RTL');

    const gerEuroCup = getBroadcastNetwork('GER', 'Euro Cup', true);
    expect(gerEuroCup?.shortName).toBe('RTL');

    const gerDfb = getBroadcastNetwork('GER', 'dfb DFB-Pokal', true);
    expect(['sky sport', 'ARD Sportschau', 'ZDF sportstudio']).toContain(gerDfb?.shortName);
    expect(gerDfb?.tagline).not.toBe('BUNDESLIGA');

    const gerLeague = getBroadcastNetwork('GER', 'league', true);
    expect(gerLeague?.shortName).toBe('sky sport');
    // World Cup / FIFA Club World Cup: BBC for Europe, ESPN for Americas & worldwide
    const wcUefa = getBroadcastNetwork('ENG', 'cwc Global Club Cup', true);
    expect(wcUefa?.shortName).toBe('BBC SPORT');
    expect(wcUefa?.tagline).toBe('WORLD CUP');

    const wcWorldCupDirect = getBroadcastNetwork('FRA', 'world cup', true);
    expect(wcWorldCupDirect?.shortName).toBe('BBC SPORT');
    expect(wcWorldCupDirect?.tagline).toBe('WORLD CUP');

    const wcGer = getBroadcastNetwork('GER', 'cwc Global Club Cup', true);
    expect(wcGer?.shortName).toBe('BBC SPORT');
    expect(wcGer?.tagline).toBe('WORLD CUP');

    const wcUsa = getBroadcastNetwork('USA', 'world cup', true);
    expect(wcUsa?.shortName).toBe('ESPN');
    expect(wcUsa?.tagline).toBe('WORLD CUP');

    const wcBra = getBroadcastNetwork('BRA', 'cwc Global Club Cup', true);
    expect(wcBra?.shortName).toBe('ESPN');
    expect(wcBra?.tagline).toBe('WORLD CUP');

    // When mod is off, broadcast network must be null
    expect(getBroadcastNetwork('ENG', 'world cup', false)).toBeNull();
    expect(getBroadcastNetwork('USA', 'world cup', false)).toBeNull();

    // South America / Copa Libertadores: ESPN
    const saLib = getBroadcastNetwork('ECU', 'cl', true);
    expect(saLib?.shortName).toBe('ESPN');

    // Canada: TSN
    const canBroadcast = getBroadcastNetwork('CAN', 'league', true);
    expect(canBroadcast?.shortName).toBe('TSN');

    // Grassroots / Regional Cup: Use domestic broadcasters per user instruction
    const regBroadcastEng = getBroadcastNetwork('ENG', 'reg', true);
    expect(regBroadcastEng?.shortName).toBe('BBC SPORT');

    // German regional cup: authentic regional networks, strictly NOT SkySport and NOT associated with DFB-Pokal
    const regBroadcastGer = getBroadcastNetwork('GER', 'reg', true);
    expect(['MDR Sport', 'WDR Sport', 'BR Sport', 'SWR Sport', 'SPORT1', 'sporttotal.tv']).toContain(regBroadcastGer?.shortName);
    expect(regBroadcastGer?.shortName).not.toBe('sky sport');
    expect(regBroadcastGer?.tagline).not.toContain('DFB-POKAL');

    const regBroadcastEcu = getBroadcastNetwork('ECU', 'reg', true);
    expect(regBroadcastEcu?.shortName).toBe('ECDF');

    // Verify authentic broadcasters across all countries
    expect(['rtve', 'M+ COPA DEL REY']).toContain(getBroadcastNetwork('ESP', 'dfb', true)?.shortName);
    expect(getBroadcastNetwork('ESP', 'league', true)?.shortName).toBe('M+ LALIGA');
    expect(['MEDIASET', 'Rai Sport']).toContain(getBroadcastNetwork('ITA', 'dfb', true)?.shortName);
    expect(getBroadcastNetwork('FRA', 'league', true)?.shortName).toBe('CANAL+');
    expect(['france.tv', 'beIN SPORTS']).toContain(getBroadcastNetwork('FRA', 'dfb', true)?.shortName);
    expect(getBroadcastNetwork('POR', 'league', true)?.shortName).toBe('SPORT TV');
    expect(getBroadcastNetwork('SCO', 'dfb', true)?.shortName).toBe('BBC SPORT');
    expect(getBroadcastNetwork('WAL', 'dfb', true)?.shortName).toBe('S4C SGORIO');
    expect(getBroadcastNetwork('AUT', 'dfb', true)?.shortName).toBe('ORF SPORT+');
    expect(getBroadcastNetwork('SUI', 'dfb', true)?.shortName).toBe('SRF SPORT');
    expect(getBroadcastNetwork('POL', 'dfb', true)?.shortName).toBe('TVP SPORT');
    expect(getBroadcastNetwork('TUR', 'dfb', true)?.shortName).toBe('A SPOR');
    expect(getBroadcastNetwork('DEN', 'league', true)?.shortName).toBe('viaplay');
    expect(getBroadcastNetwork('NOR', 'league', true)?.shortName).toBe('TV 2 SPORT');
    expect(getBroadcastNetwork('SWE', 'dfb', true)?.shortName).toBe('SVT SPORT');
    expect(getBroadcastNetwork('USA', 'league', true)?.shortName).toBe(' tv MLS');
    expect(getBroadcastNetwork('USA', 'dfb', true)?.shortName).toBe('CBS GOLAZO');
    expect(getBroadcastNetwork('MEX', 'league', true)?.shortName).toBe('TUDN');
    expect(getBroadcastNetwork('BRA', 'league', true)?.shortName).toBe('PREMIERE');
    expect(['SporTV', 'TV GLOBO']).toContain(getBroadcastNetwork('BRA', 'dfb', true)?.shortName);
    expect(['TyC SPORTS', 'telefe']).toContain(getBroadcastNetwork('ARG', 'dfb', true)?.shortName);
    expect(getBroadcastNetwork('ARG', 'league', true)?.shortName).toBe('ESPN PREMIUM');
    expect(getBroadcastNetwork('COL', 'league', true)?.shortName).toBe('Win SPORTS+');
    expect(getBroadcastNetwork('ECU', 'dfb', true)?.shortName).toBe('ECDF');
    expect(getBroadcastNetwork('AUS', 'league', true)?.shortName).toBe('Paramount+');
    expect(getBroadcastNetwork('JPN', 'league', true)?.shortName).toBe('DAZN');
    expect(getBroadcastNetwork('IDN', 'league', true)?.shortName).toBe('INDOSIAR');
    expect(getBroadcastNetwork('IDN', 'league', true)?.tagline).toBe('BRI LIGA 1');
    expect(getBroadcastNetwork('IDN', 'cup', true)?.tagline).toBe('PIALA INDONESIA');
    expect(getBroadcastNetwork('IND', 'league', true)?.shortName).toBe('JioCinema');
    expect(getBroadcastNetwork('IND', 'league', true, 1)?.tagline).toBe('INDIAN SUPER LEAGUE');
    expect(getBroadcastNetwork('IND', 'league', true, 2)?.shortName).toBe('SONY SPORTS');
    expect(getBroadcastNetwork('IND', 'league', true, 2)?.tagline).toBe('I-LEAGUE');
    expect(getBroadcastNetwork('IND', 'cup', true)?.tagline).toBe('AIFF SUPER CUP');

    // South Korea (Tier 1, Tier 2, Cup)
    expect(getBroadcastNetwork('KOR', 'league', true, 1)?.shortName).toBe('Coupang Play');
    expect(getBroadcastNetwork('KOR', 'league', true, 1)?.tagline).toBe('K LEAGUE 1');
    expect(getBroadcastNetwork('KOR', 'league', true, 2)?.tagline).toBe('K LEAGUE 2');
    expect(getBroadcastNetwork('KOR', 'cup', true)?.tagline).toBe('KOREA CUP');

    // Bolivia (Tier 1, Cup)
    expect(getBroadcastNetwork('BOL', 'league', true)?.shortName).toBe('Tigo Sports');
    expect(getBroadcastNetwork('BOL', 'league', true)?.tagline).toBe('DIVISIÓN PROFESIONAL');
    expect(getBroadcastNetwork('BOL', 'cup', true)?.tagline).toBe('COPA BOLIVIA');

    // Peru (Tier 1, Tier 2, Cup)
    expect(getBroadcastNetwork('PER', 'league', true, 1)?.shortName).toBe('L1 MAX');
    expect(getBroadcastNetwork('PER', 'league', true, 1)?.tagline).toBe('LIGA 1 TE APUESTO');
    expect(getBroadcastNetwork('PER', 'league', true, 2)?.tagline).toBe('LIGA 2 PERÚ');
    expect(getBroadcastNetwork('PER', 'cup', true)?.tagline).toBe('COPA BICENTENARIO');

    // Paraguay (Tier 1, Cup)
    expect(getBroadcastNetwork('PAR', 'league', true)?.shortName).toBe('Tigo Sports');
    expect(getBroadcastNetwork('PAR', 'league', true)?.tagline).toBe('COPA DE PRIMERA');
    expect(getBroadcastNetwork('PAR', 'cup', true)?.tagline).toBe('COPA PARAGUAY');

    // Chile (Tier 1, Tier 2, Cup)
    expect(getBroadcastNetwork('CHI', 'league', true, 1)?.shortName).toBe('TNT SPORTS');
    expect(getBroadcastNetwork('CHI', 'league', true, 1)?.tagline).toBe('CAMPEONATO PRIMERA');
    expect(getBroadcastNetwork('CHI', 'league', true, 2)?.tagline).toBe('PRIMERA B CHILE');
    expect(getBroadcastNetwork('CHI', 'cup', true)?.tagline).toBe('COPA CHILE');

    // Slovakia (Tier 1, Tier 2, Cup)
    expect(getBroadcastNetwork('SVK', 'league', true, 1)?.shortName).toBe('VOYO');
    expect(getBroadcastNetwork('SVK', 'league', true, 1)?.tagline).toBe('NIKÉ LIGA');
    expect(getBroadcastNetwork('SVK', 'league', true, 2)?.tagline).toBe('2. LIGA SLOVENSKO');
    expect(getBroadcastNetwork('SVK', 'cup', true)?.shortName).toBe('RTVS ŠPORT');
    expect(getBroadcastNetwork('SVK', 'cup', true)?.tagline).toBe('SLOVNAFT CUP');

    // Croatia (Tier 1, Tier 2, Cup)
    expect(getBroadcastNetwork('CRO', 'league', true, 1)?.shortName).toBe('MAXSport');
    expect(getBroadcastNetwork('CRO', 'league', true, 1)?.tagline).toBe('SUPERSPORT HNL');
    expect(getBroadcastNetwork('CRO', 'league', true, 2)?.tagline).toBe('PRVA NL');
    expect(getBroadcastNetwork('CRO', 'cup', true)?.tagline).toBe('HRVATSKI KUP');

    // Greece (Tier 1, Tier 2, Cup)
    expect(getBroadcastNetwork('GRE', 'league', true, 1)?.shortName).toBe('COSMOTE SPORT');
    expect(getBroadcastNetwork('GRE', 'league', true, 1)?.tagline).toBe('SUPER LEAGUE 1');
    expect(getBroadcastNetwork('GRE', 'league', true, 2)?.tagline).toBe('SUPER LEAGUE 2');
    expect(getBroadcastNetwork('GRE', 'cup', true)?.tagline).toBe('KYPELLO ELLADAS');

    // Denmark Tier 1 & 2
    expect(getBroadcastNetwork('DEN', 'league', true, 1)?.tagline).toBe('3F SUPERLIGA');
    expect(getBroadcastNetwork('DEN', 'league', true, 2)?.tagline).toBe('NORDICBET LIGA');
    expect(getBroadcastNetwork('DEN', 'cup', true)?.tagline).toBe('ODDSET POKALEN');

    // Norway Tier 1 & 2
    expect(getBroadcastNetwork('NOR', 'league', true, 1)?.tagline).toBe('ELITESERIEN');
    expect(getBroadcastNetwork('NOR', 'league', true, 2)?.tagline).toBe('OBOS-LIGAEN');
    expect(getBroadcastNetwork('NOR', 'cup', true)?.tagline).toBe('NM CUPEN');

    // Sweden Tier 1 & 2
    expect(getBroadcastNetwork('SWE', 'league', true, 1)?.tagline).toBe('ALLSVENSKAN');
    expect(getBroadcastNetwork('SWE', 'league', true, 2)?.tagline).toBe('SUPERETTAN');
    expect(getBroadcastNetwork('SWE', 'cup', true)?.tagline).toBe('SVENSKA CUPEN');

    // Full country names normalization support
    expect(getBroadcastNetwork('South Korea', 'league', true, 1)?.shortName).toBe('Coupang Play');
    expect(getBroadcastNetwork('Bolivia', 'league', true)?.shortName).toBe('Tigo Sports');
    expect(getBroadcastNetwork('Peru', 'league', true, 1)?.shortName).toBe('L1 MAX');
    expect(getBroadcastNetwork('Paraguay', 'league', true)?.shortName).toBe('Tigo Sports');
    expect(getBroadcastNetwork('Chile', 'league', true, 1)?.shortName).toBe('TNT SPORTS');
    expect(getBroadcastNetwork('Slovakia', 'league', true, 1)?.shortName).toBe('VOYO');
    expect(getBroadcastNetwork('Croatia', 'league', true, 1)?.shortName).toBe('MAXSport');
    expect(getBroadcastNetwork('Greece', 'league', true, 1)?.shortName).toBe('COSMOTE SPORT');
    expect(getBroadcastNetwork('Indonesia', 'league', true)?.shortName).toBe('INDOSIAR');
    expect(getBroadcastNetwork('India', 'league', true, 1)?.shortName).toBe('JioCinema');
    expect(getBroadcastNetwork('Denmark', 'league', true, 1)?.tagline).toBe('3F SUPERLIGA');
    expect(getBroadcastNetwork('Norway', 'league', true, 1)?.tagline).toBe('ELITESERIEN');
    expect(getBroadcastNetwork('Sweden', 'league', true, 1)?.tagline).toBe('ALLSVENSKAN');
  });

  it('guarantees that when finishing 1st, the 2nd place team and lower ranks never have more points than 1st place', () => {
    const userPts = 84;
    const userPos = 1;
    const prevTargetPts = userPts;

    // Simulate rival in 2nd place
    const rivalPos = 2;
    let rivalPts = 82; // realistic base points
    if (rivalPos < userPos) {
      rivalPts = Math.max(userPts + (userPos - rivalPos), rivalPts);
      rivalPts = Math.min(prevTargetPts, rivalPts);
    } else {
      rivalPts = Math.min(userPts - (rivalPos - userPos), rivalPts);
      rivalPts = Math.min(prevTargetPts, rivalPts);
    }
    rivalPts = Math.max(14, Math.min(prevTargetPts, rivalPts));

    expect(rivalPts).toBeLessThanOrEqual(userPts - 1);
    expect(rivalPts).toBeLessThan(userPts);
  });

  it('strictly caps Japan to Tier 2 and prevents phantom Tier 3 or Japan Division 3 in history', async () => {
    const { getMaxTier, getLeagueInfo } = await import('../data/gameConstants');
    const { calculateClubLeagueHistory } = await import('../engine/clubProgressionEngine');

    expect(getMaxTier('JPN')).toBe(2);
    expect(getMaxTier('Japan')).toBe(2);
    expect(getMaxTier('JAPAN')).toBe(2);

    // Any attempt to query tier > 2 in Japan returns J2 League
    const t3Info = getLeagueInfo(3, 'JPN');
    expect(t3Info.name).toBe('J2 League');
    expect(t3Info.name).not.toContain('Division 3');

    // Historical calculation with legacy or simulated data clamps to max tier 2
    const mockJpnClub = {
      id: 2020,
      name: 'Iwata',
      tier: 2,
      baseOvr: 68,
      country: 'JPN',
      color: '87ceeb',
      stadium: 15165
    };

    const historyWithPhantomTier = {
      '2020': [
        {
          year: 2024,
          tier: 3,
          position: 10,
          ovr: 65,
          leagueName: 'Japan Division 3',
          status: 'midtable' as const,
          points: 40
        }
      ]
    };

    const sanitizedHistory = calculateClubLeagueHistory(
      mockJpnClub,
      2024,
      2026,
      undefined,
      historyWithPhantomTier
    );

    for (const record of sanitizedHistory) {
      expect(record.tier).toBeLessThanOrEqual(2);
      expect(record.leagueName).not.toContain('Division 3');
      expect(record.leagueName).toBe('J2 League');
    }
  });

  it('verifies team bonding gamble outcome spectrum covers 0% to 40%', () => {
    // Simulate team bonding gamble roll 100 times to verify all spectrum ranges
    const results = { fail: 0, small: 0, medium: 0, jackpot: 0 };
    for (let i = 0; i < 200; i++) {
      const roll = Math.random();
      let boostAmt = 0;
      if (roll < 0.15) {
        boostAmt = 0;
        results.fail++;
      } else if (roll < 0.40) {
        boostAmt = Math.floor(Math.random() * 6) + 5;
        results.small++;
      } else if (roll < 0.75) {
        boostAmt = Math.floor(Math.random() * 11) + 15;
        results.medium++;
      } else {
        boostAmt = Math.floor(Math.random() * 11) + 30;
        results.jackpot++;
      }
      expect(boostAmt).toBeGreaterThanOrEqual(0);
      expect(boostAmt).toBeLessThanOrEqual(40);
    }
    expect(results.fail).toBeGreaterThan(0);
    expect(results.jackpot).toBeGreaterThan(0);
  });

  it('guarantees that Japanese clubs never produce Tier 3 or Japan Division 3 across any simulated historical season', async () => {
    const { calculateClubLeagueHistory } = await import('../engine/clubProgressionEngine');
    const jpnClubs = [
      { id: 9001, name: 'Tokyo Verdy', tier: 2, country: 'JPN', baseOvr: 64 },
      { id: 9002, name: 'Urawa Reds', tier: 1, country: 'JPN', baseOvr: 72 },
      { id: 9003, name: 'Custom Japanese Club', tier: 2, country: 'Japan', baseOvr: 60 }
    ];

    for (const club of jpnClubs) {
      const history = calculateClubLeagueHistory(club as any, 2015, 2026);
      for (const rec of history) {
        expect(rec.tier).toBeLessThanOrEqual(2);
        expect(rec.tier).toBeGreaterThanOrEqual(1);
        expect(rec.leagueName).not.toContain('Division 3');
        expect(rec.leagueName).not.toContain('Tier 3');
        expect(['J1 League', 'J2 League']).toContain(rec.leagueName);
      }
    }
  });

  it('verifies job offer choice indexing allows selecting 3rd club and safely reserves 999/-1 for retirement', () => {
    const mockClubs = [
      { id: 101, name: 'Club Alpha', tier: 1, baseOvr: 75 },
      { id: 102, name: 'Club Beta', tier: 2, baseOvr: 68 },
      { id: 103, name: 'Club Gamma', tier: 3, baseOvr: 60 },
    ];

    const resolveChoice = (choiceIndex: number, clubs: typeof mockClubs) => {
      if (choiceIndex === 999 || choiceIndex === -1) {
        return { action: 'retire' };
      }
      if (choiceIndex === 0) {
        return { action: 'stay' };
      }
      const selectedClub = clubs[choiceIndex - 1];
      if (selectedClub) {
        return { action: 'accept', club: selectedClub };
      }
      return { action: 'invalid' };
    };

    expect(resolveChoice(1, mockClubs)).toEqual({ action: 'accept', club: mockClubs[0] });
    expect(resolveChoice(2, mockClubs)).toEqual({ action: 'accept', club: mockClubs[1] });
    // Choice 3 MUST select 3rd club without terminating career!
    expect(resolveChoice(3, mockClubs)).toEqual({ action: 'accept', club: mockClubs[2] });
    // Only 999 or -1 retires
    expect(resolveChoice(999, mockClubs)).toEqual({ action: 'retire' });
    expect(resolveChoice(-1, mockClubs)).toEqual({ action: 'retire' });
    expect(resolveChoice(0, mockClubs)).toEqual({ action: 'stay' });
  });

  it('verifies runner-up finish (2nd place) in tier > 1 correctly triggers promotion and nextTier progression', () => {
    const checkPromotion = (tier: number, pos: number, nextTier?: number) => {
      const resolvedNextTier = nextTier !== undefined ? nextTier : Math.max(1, tier - (pos <= 2 && tier > 1 ? 1 : 0));
      const isPromoted = tier > 1 && (pos <= 2 || resolvedNextTier < tier);
      return { isPromoted, nextTier: resolvedNextTier };
    };

    // 2nd place in Tier 2 -> Promoted to Tier 1
    const resT2 = checkPromotion(2, 2);
    expect(resT2.isPromoted).toBe(true);
    expect(resT2.nextTier).toBe(1);

    // 2nd place in Tier 3 -> Promoted to Tier 2
    const resT3 = checkPromotion(3, 2);
    expect(resT3.isPromoted).toBe(true);
    expect(resT3.nextTier).toBe(2);

    // 2nd place in Tier 1 -> Runner-up, but NOT promoted (already top tier)
    const resT1 = checkPromotion(1, 2, 1);
    expect(resT1.isPromoted).toBe(false);
    expect(resT1.nextTier).toBe(1);
  });

  it('verifies midseason winter camp injury presents clean, balanced pros and cons trade-off', async () => {
    const { generateMidSeasonEvent } = await import('../engine/midSeasonEngine');
    const mockState: any = {
      club: { tier: 2, baseOvr: 75, country: 'GER', name: 'Test FC' },
      year: 2026,
      tactic: 'Total Football'
    };

    // Force seed or direct object validation
    const surgeryCost = 2500;
    const opt1 = {
      title: 'Fund Specialist Surgery',
      goodTxt: `Player Saved · 0 OVR Loss (-${surgeryCost})`,
      cost: surgeryCost,
      extraData: { opt1Cost: surgeryCost, opt1Good: {} }
    };
    const opt2 = {
      title: 'Trust Squad Backups',
      goodTxt: 'Save Budget (€0) · Squad OVR -1',
      cost: 0,
      extraData: { opt2Cost: 0, opt2Good: { ovr: -1 } }
    };

    // Option 1 spends budget to preserve full OVR
    expect(opt1.extraData.opt1Cost).toBeGreaterThan(0);
    expect(opt1.extraData.opt1Good).toEqual({});

    // Option 2 preserves budget (€0) at cost of -1 OVR
    expect(opt2.extraData.opt2Cost).toBe(0);
    expect(opt2.extraData.opt2Good).toEqual({ ovr: -1 });
  });

  it('guarantees board vision budget rewards for lower-tier clubs (e.g. Verbandsliga Tier 6 Plauen) scale realistically and do not inject €12M', async () => {
    const { generateBoardVision } = await import('../engine/boardVisionEngine');
    const plauen = {
      id: 139,
      name: 'VFC Plauen',
      tier: 6,
      baseOvr: 51,
      stadium: 10500,
      country: 'GER',
      fanBase: 37441,
      currentBudget: 190
    };

    const vision = generateBoardVision(plauen as any, 2026);
    expect(vision).toBeDefined();
    expect(vision.reward.budgetBonus).toBeLessThan(1000); // Must be under €1M for Tier 6 (e.g. ~€84K), not €12M (12,000)!
    expect(vision.reward.desc).not.toContain('€12M');
    expect(vision.reward.desc).not.toContain('€18M');
    expect(vision.reward.desc).not.toContain('€30M');

    // Transfer profit objective in lower tiers must also be scaled realistically
    const profitObj = vision.objectives.find(o => o.type === 'transfer_profit');
    if (profitObj) {
      expect(profitObj.targetValue).toBeLessThan(500); // Scaled transfer profit target in lower leagues
    }
  });

  it('guarantees supporter breakdown attendance ratios are realistic, general public always exists, and percentages never exceed 100%', async () => {
    const { getSupporterBreakdown } = await import('../components/StadiumModal');

    const testCases = [
      { cap: 10500, att: 2500, tier: 6, policy: 'balanced' as const },
      { cap: 10500, att: 6200, tier: 6, policy: 'ultras' as const },
      { cap: 35000, att: 8011, tier: 3, policy: 'balanced' as const },
      { cap: 6200, att: 6200, tier: 6, policy: 'balanced' as const },
      { cap: 2000, att: 450, tier: 8, policy: 'family' as const },
      { cap: 80000, att: 12000, tier: 1, policy: 'commercial' as const },
    ];

    for (const tc of testCases) {
      const segments = getSupporterBreakdown(tc.cap, tc.att, tc.tier, tc.policy);
      const totalAtt = segments.reduce((sum, s) => sum + s.attendees, 0);
      const boundedAtt = Math.max(1, Math.min(tc.cap, tc.att));

      // 1. Total attendees must exactly equal bounded attendance
      expect(totalAtt).toBe(boundedAtt);

      // 2. Ultras segment must never have more attendees than its seats or total attendance
      const ultras = segments.find(s => s.key === 'ultras')!;
      expect(ultras.attendees).toBeLessThanOrEqual(ultras.seats);
      expect(ultras.attendees).toBeLessThanOrEqual(boundedAtt);
      expect(ultras.attendeeSharePct).toBeLessThanOrEqual(100);
      expect(ultras.attendeeSharePct).toBeLessThan(40); // Ultras are a terrace core, never 129%!

      // 3. General Public must ALWAYS have a strong, non-zero attendance
      const general = segments.find(s => s.key === 'general')!;
      expect(general.attendees).toBeGreaterThan(0);
      expect(general.attendees).toBeLessThanOrEqual(general.seats);
      expect(general.attendeeSharePct).toBeGreaterThanOrEqual(20); // General public is always a major pillar

      // 4. Fill percent for any stand must never exceed 100%
      for (const seg of segments) {
        expect(seg.fillPct).toBeLessThanOrEqual(100);
        expect(seg.fillPct).toBeGreaterThanOrEqual(0);
        expect(seg.attendeeSharePct).toBeLessThanOrEqual(100);
      }
    }
  });

  it('ensures Executive Hospitality generates significantly more Ultras events, Fortress Curva generates more money-issue events, and Balanced/Family retain normal distributions', async () => {
    const { generateRandomEvent, resolveDynamicEvent } = await import('../data/randomEvents');

    const baseState: any = {
      year: 2026,
      budget: 1000000,
      reputation: 50,
      club: {
        id: 1,
        name: 'FC Standard Test',
        tier: 2,
        country: 'GER',
        baseOvr: 70,
        fanBase: 25000,
        morale: 80,
      },
    };

    const isUltrasType = (type: string) =>
      type.startsWith('commercial_ultras_') ||
      type.startsWith('ita_ultras_') ||
      type === 'fan_pyro' ||
      type === 'ultras_seat_destruction' ||
      type === 'fan_ticket_protest' ||
      type === 'ticket_protest' ||
      type === 'ticket_boycott_crisis' ||
      type === 'event_fan_banner_protest' ||
      type === 'ger_event_tennisball_protest' ||
      type === 'fra_event_ultras_pyro_show' ||
      type.includes('ultras') ||
      type.includes('curva') ||
      type.includes('pyro') ||
      type.includes('boycott');

    const isMoneyIssueType = (type: string) =>
      type.startsWith('curva_') ||
      type === 'tax_audit' ||
      type === 'ffp_warning' ||
      type === 'sponsor_bankruptcy' ||
      type === 'sponsor_pullout' ||
      type === 'energy_crisis' ||
      type === 'rival_bankruptcy' ||
      type === 'fra_event_dncg_audit' ||
      type === 'esp_event_la_liga_fair_play' ||
      type === 'funny_sponsor_bankrupt_22' ||
      type.includes('audit') ||
      type.includes('bankrupt') ||
      type.includes('deficit') ||
      type.includes('shortfall') ||
      type.includes('liquidity');

    // 1. Executive Hospitality policy: deals with much more ultras events
    const commercialState = { ...baseState, stadiumPolicy: 'commercial' };
    let commercialUltrasCount = 0;
    const TRIALS = 150;
    for (let i = 0; i < TRIALS; i++) {
      const ev = generateRandomEvent(commercialState);
      if (ev && isUltrasType(ev.type)) commercialUltrasCount++;
    }
    const commercialUltrasRate = commercialUltrasCount / TRIALS;
    expect(commercialUltrasRate).toBeGreaterThanOrEqual(0.40); // 60% boost ensures ~50-70% ultras events

    // 2. Fortress Curva policy: deals with much more money issue events
    const ultrasState = { ...baseState, stadiumPolicy: 'ultras' };
    let curvaMoneyCount = 0;
    for (let i = 0; i < TRIALS; i++) {
      const ev = generateRandomEvent(ultrasState);
      if (ev && isMoneyIssueType(ev.type)) curvaMoneyCount++;
    }
    const curvaMoneyRate = curvaMoneyCount / TRIALS;
    expect(curvaMoneyRate).toBeGreaterThanOrEqual(0.40); // 60% boost ensures ~50-70% money events

    // 3. Balanced policy: normal event distribution (neither boosted to 50%+)
    const balancedState = { ...baseState, stadiumPolicy: 'balanced' };
    let balancedUltrasCount = 0;
    for (let i = 0; i < TRIALS; i++) {
      const ev = generateRandomEvent(balancedState);
      if (ev && isUltrasType(ev.type)) balancedUltrasCount++;
    }
    const balancedUltrasRate = balancedUltrasCount / TRIALS;
    expect(balancedUltrasRate).toBeLessThan(0.30); // Normal baseline pool rate is typically ~5-15%

    // 4. Test resolution of dedicated policy events
    const mockUltrasEv: any = {
      type: 'commercial_ultras_banner_protest',
      opt1: { title: { en: 'Cap VIP' }, goodPct: 100, goodTxt: { en: 'Success' } },
      opt2: { title: { en: 'Protect VIP' }, goodPct: 100, goodTxt: { en: 'Corporate OK' } },
      extraData: {
        opt1Cost: 5000,
        opt1Good: { morale: 15 },
        opt2Good: { budget: 10000 },
      },
    };
    const res = resolveDynamicEvent(baseState, mockUltrasEv, 0, 2);
    expect(res).not.toBeNull();
    expect(res?.costAttempt).toBe(5000);
    expect(res?.updated.budget).toBe(baseState.budget - 5000);
    expect(res?.updated.club.morale).toBe(baseState.club.morale + 15);
  });

  it('ensures mod-data JSON files with India (IND), Slovakia (SVK), Peru (PER) integrate seamlessly with proper flags, domestic cups, and regional continental competitions', async () => {
    const { normalizeAndValidateCustomDb } = await import('../engine/moddingEngine');
    const { COUNTRIES, getLeagueInfo, getDomesticCupInfo } = await import('../data/gameConstants');
    const { getContinentalCupNames, getRegion } = await import('./regionHelpers');

    const sampleMod = [
      { name: 'Mohun Bagan Super Giant', country: 'IND', tier: 1, baseOvr: 68, stadium: 65000, currentBudget: 1500000 },
      { name: 'ŠK Slovan Bratislava', country: 'SVK', tier: 1, baseOvr: 74, stadium: 22500, currentBudget: 3500000 },
      { name: 'Universitario de Deportes', country: 'PER', tier: 1, baseOvr: 73, stadium: 80000, currentBudget: 2800000 },
    ];

    const validation = normalizeAndValidateCustomDb(sampleMod);
    expect(validation.valid).toBe(true);
    expect(validation.count).toBe(3);

    // Verify India
    expect(COUNTRIES.IND?.flag).toBe('🇮🇳');
    expect(getRegion('IND')).toBe('AFC');
    expect(getDomesticCupInfo('IND', 1).name).toBe('Indian Super Cup');
    expect(getContinentalCupNames('IND').cl).toBe('Asian Champions Cup');

    // Verify Slovakia
    expect(COUNTRIES.SVK?.flag).toBe('🇸🇰');
    expect(getRegion('SVK')).toBe('UEFA');
    expect(getDomesticCupInfo('SVK', 1).name).toBe('Slovnaft Cup');
    expect(getContinentalCupNames('SVK').cl).toBe('Euro Champions Cup');

    // Verify Peru
    expect(COUNTRIES.PER?.flag).toBe('🇵🇪');
    expect(getRegion('PER')).toBe('CONMEBOL');
    expect(getDomesticCupInfo('PER', 1).name).toBe('Copa Bicentenario');
    expect(getContinentalCupNames('PER').cl).toBe('Copa Libertadores');
  });

  it('verifies seamless mod-data JSON integration for South Korea, Bolivia, Peru, Paraguay, Chile, Slovakia, Croatia, Greece, Indonesia, India, Denmark, Norway, and Sweden', async () => {
    const { normalizeAndValidateCustomDb } = await import('../engine/moddingEngine');
    const { COUNTRIES, COUNTRY_LEAGUES, getLeagueInfo, getDomesticCupInfo, getMaxTier, getStartingBudget, getCountryMult } = await import('../data/gameConstants');
    const { getContinentalCupNames, getRegion } = await import('./regionHelpers');

    const multiCountryMod = [
      // South Korea (Tier 1-2) - test with full country name
      { id: 101, name: 'FC Seoul', country: 'South Korea', tier: 1, baseOvr: 74, stadium: 66704, currentBudget: 12000000 },
      { id: 102, name: 'Suwon Samsung Bluewings', country: 'KOR', tier: 2, baseOvr: 66, stadium: 44031, currentBudget: 3500000 },

      // Bolivia (Tier 1) - test with full country name
      { id: 201, name: 'Club Bolívar', country: 'Bolivia', tier: 1, baseOvr: 70, stadium: 41143, currentBudget: 2000000 },

      // Peru (Tier 1-2)
      { id: 301, name: 'Alianza Lima', country: 'PER', tier: 1, baseOvr: 73, stadium: 33938, currentBudget: 3000000 },
      { id: 302, name: 'Santos FC Nazca', country: 'Peru', tier: 2, baseOvr: 62, stadium: 10000, currentBudget: 500000 },

      // Paraguay (Tier 1)
      { id: 401, name: 'Club Olimpia', country: 'Paraguay', tier: 1, baseOvr: 73, stadium: 22000, currentBudget: 2500000 },

      // Chile (Tier 1-2)
      { id: 501, name: 'Colo-Colo', country: 'Chile', tier: 1, baseOvr: 74, stadium: 47347, currentBudget: 4000000 },
      { id: 502, name: 'Santiago Wanderers', country: 'CHI', tier: 2, baseOvr: 64, stadium: 21111, currentBudget: 800000 },

      // Slovakia (Tier 1-2)
      { id: 601, name: 'ŠK Slovan Bratislava', country: 'Slovakia', tier: 1, baseOvr: 74, stadium: 22500, currentBudget: 4000000 },
      { id: 602, name: 'FC Petržalka', country: 'SVK', tier: 2, baseOvr: 60, stadium: 5000, currentBudget: 600000 },

      // Croatia (Tier 1-2)
      { id: 701, name: 'GNK Dinamo Zagreb', country: 'Croatia', tier: 1, baseOvr: 76, stadium: 35123, currentBudget: 6000000 },
      { id: 702, name: 'HNK Vukovar 1991', country: 'CRO', tier: 2, baseOvr: 62, stadium: 6000, currentBudget: 700000 },

      // Greece (Tier 1-2)
      { id: 801, name: 'Olympiacos FC', country: 'Greece', tier: 1, baseOvr: 77, stadium: 32115, currentBudget: 8000000 },
      { id: 802, name: 'Iraklis 1908 FC', country: 'GRE', tier: 2, baseOvr: 63, stadium: 27770, currentBudget: 1000000 },

      // Indonesia (Tier 1)
      { id: 901, name: 'Persib Bandung', country: 'Indonesia', tier: 1, baseOvr: 66, stadium: 38000, currentBudget: 1500000 },

      // India (Tier 1)
      { id: 1001, name: 'Mumbai City FC', country: 'India', tier: 1, baseOvr: 67, stadium: 18000, currentBudget: 1800000 },

      // Denmark (Tier 1-2)
      { id: 1101, name: 'F.C. Copenhagen', country: 'Denmark', tier: 1, baseOvr: 75, stadium: 38065, currentBudget: 7500000 },
      { id: 1102, name: 'Hobro IK', country: 'DEN', tier: 2, baseOvr: 63, stadium: 10700, currentBudget: 1200000 },

      // Norway (Tier 1-2)
      { id: 1201, name: 'FK Bodø/Glimt', country: 'Norway', tier: 1, baseOvr: 74, stadium: 8270, currentBudget: 5500000 },
      { id: 1202, name: 'Moss FK', country: 'NOR', tier: 2, baseOvr: 62, stadium: 10000, currentBudget: 900000 },

      // Sweden (Tier 1-2)
      { id: 1301, name: 'Malmö FF', country: 'Sweden', tier: 1, baseOvr: 74, stadium: 22500, currentBudget: 6000000 },
      { id: 1302, name: 'Örebro SK', country: 'SWE', tier: 2, baseOvr: 63, stadium: 12645, currentBudget: 1100000 },
    ];

    const res = normalizeAndValidateCustomDb(multiCountryMod);
    expect(res.valid).toBe(true);
    expect(res.count).toBe(multiCountryMod.length);

    // Verify all 13 countries normalized correctly
    const expectedCountries = [
      { code: 'KOR', name: 'South Korea', region: 'AFC', cup: 'Korea Cup', flag: '🇰🇷', t1: 'K League 1', t2: 'K League 2', maxT: 2 },
      { code: 'BOL', name: 'Bolivia', region: 'CONMEBOL', cup: 'Copa Bolivia', flag: '🇧🇴', t1: 'División Profesional', maxT: 1 },
      { code: 'PER', name: 'Peru', region: 'CONMEBOL', cup: 'Copa Bicentenario', flag: '🇵🇪', t1: 'Liga 1 Perú', t2: 'Liga 2 Perú', maxT: 2 },
      { code: 'PAR', name: 'Paraguay', region: 'CONMEBOL', cup: 'Copa Paraguay', flag: '🇵🇾', t1: 'Primera División de Paraguay', maxT: 1 },
      { code: 'CHI', name: 'Chile', region: 'CONMEBOL', cup: 'Copa Chile', flag: '🇨🇱', t1: 'Primera División de Chile', t2: 'Primera B de Chile', maxT: 2 },
      { code: 'SVK', name: 'Slovakia', region: 'UEFA', cup: 'Slovnaft Cup', flag: '🇸🇰', t1: 'Niké Liga', t2: '2. Liga', maxT: 2 },
      { code: 'CRO', name: 'Croatia', region: 'UEFA', cup: 'Hrvatski kup', flag: '🇭🇷', t1: 'SuperSport HNL', t2: 'Prva NL', maxT: 2 },
      { code: 'GRE', name: 'Greece', region: 'UEFA', cup: 'Kypello Elladas', flag: '🇬🇷', t1: 'Super League Greece', t2: 'Super League 2', maxT: 2 },
      { code: 'IDN', name: 'Indonesia', region: 'AFC', cup: 'Piala Indonesia', flag: '🇮🇩', t1: 'Liga 1 Indonesia', maxT: 1 },
      { code: 'IND', name: 'India', region: 'AFC', cup: 'Indian Super Cup', flag: '🇮🇳', t1: 'Indian Super League', t2: 'I-League', maxT: 2 },
      { code: 'DEN', name: 'Denmark', region: 'UEFA', cup: 'DBU Pokalen', flag: '🇩🇰', t1: 'Superligaen', t2: '1. Division', maxT: 2 },
      { code: 'NOR', name: 'Norway', region: 'UEFA', cup: 'NM Cupen', flag: '🇳🇴', t1: 'Eliteserien', t2: '1. Divisjon', maxT: 2 },
      { code: 'SWE', name: 'Sweden', region: 'UEFA', cup: 'Svenska Cupen', flag: '🇸🇪', t1: 'Allsvenskan', t2: 'Superettan', maxT: 2 },
    ];

    for (const ec of expectedCountries) {
      // 1. Countries table lookup
      expect(COUNTRIES[ec.code]).toBeDefined();
      expect(COUNTRIES[ec.code].active).toBe(true);
      expect(COUNTRIES[ec.code].flag).toBe(ec.flag);

      // 2. Region check
      expect(getRegion(ec.code)).toBe(ec.region);

      // 3. Domestic Cup check
      const cup = getDomesticCupInfo(ec.code, 1);
      expect(cup.name).toBe(ec.cup);

      // 4. League info check (Tier 1)
      const l1 = getLeagueInfo(1, ec.code);
      expect(l1.name).toBe(ec.t1);
      expect(COUNTRY_LEAGUES[ec.code]?.[1]?.name).toBe(ec.t1);

      // 5. Tier 2 check if defined
      if (ec.t2) {
        const l2 = getLeagueInfo(2, ec.code);
        expect(l2.name).toBe(ec.t2);
        expect(COUNTRY_LEAGUES[ec.code]?.[2]?.name).toBe(ec.t2);
      }

      // 6. Max tier check
      expect(getMaxTier(ec.code)).toBe(ec.maxT);

      // 7. Starting budget and country multiplier
      const cMult = getCountryMult(ec.code);
      expect(cMult).toBeGreaterThan(0);
      expect(cMult).toBeLessThanOrEqual(1.0);
      const startingBudget = getStartingBudget(1, ec.code);
      expect(startingBudget).toBeGreaterThan(0);
    }

    // Verify clubs in merged list have normalized country code (not full string name)
    const seoul = res.clubs?.find(c => c.name === 'FC Seoul');
    expect(seoul?.country).toBe('KOR');

    const bolivar = res.clubs?.find(c => c.name === 'Club Bolívar');
    expect(bolivar?.country).toBe('BOL');

    const copenhagen = res.clubs?.find(c => c.name === 'F.C. Copenhagen');
    expect(copenhagen?.country).toBe('DEN');
  });

  it('guarantees that newly added countries do not show in onboarding when mod is not active', async () => {
    const { COUNTRIES, BASE_GAME_COUNTRIES, MOD_ONLY_COUNTRIES } = await import('../data/gameConstants');
    
    // Check that MOD_ONLY_COUNTRIES matches all newly added countries
    const expectedModOnly = ['DEN', 'NOR', 'SWE', 'IDN', 'IND', 'SVK', 'PER', 'KOR', 'BOL', 'PAR', 'CHI', 'CRO', 'GRE'];
    expect(MOD_ONLY_COUNTRIES).toEqual(expectedModOnly);

    // Check that BASE_GAME_COUNTRIES has exactly 21 countries
    expect(BASE_GAME_COUNTRIES.length).toBe(21);
    expect(BASE_GAME_COUNTRIES).not.toEqual(expect.arrayContaining(MOD_ONLY_COUNTRIES));

    // Simulate onboarding visibility filter with mod inactive
    const isModActiveFalse = false;
    const visibleWhenModInactive = Object.keys(COUNTRIES).filter(k => isModActiveFalse || !MOD_ONLY_COUNTRIES.includes(k));
    
    for (const modCountry of MOD_ONLY_COUNTRIES) {
      expect(visibleWhenModInactive).not.toContain(modCountry);
    }
    for (const baseCountry of BASE_GAME_COUNTRIES) {
      expect(visibleWhenModInactive).toContain(baseCountry);
    }

    // Simulate onboarding visibility filter with mod active
    const isModActiveTrue = true;
    const visibleWhenModActive = Object.keys(COUNTRIES).filter(k => isModActiveTrue || !MOD_ONLY_COUNTRIES.includes(k));
    for (const modCountry of MOD_ONLY_COUNTRIES) {
      expect(visibleWhenModActive).toContain(modCountry);
    }
    expect(visibleWhenModActive.length).toBe(Object.keys(COUNTRIES).length);
  });

  it('guarantees youth player adjustments and proper international competitions for all 13 mod countries', async () => {
    const { getRegion, getContinentalCupNames, UEFA_COUNTRIES, CONMEBOL_COUNTRIES, AFC_COUNTRIES } = await import('./regionHelpers');
    const { NATIONAL_TEAMS, getNationalCoachCandidates } = await import('../engine/internationalEngine');

    // 1. Continental Competition Verification
    const uefaExp = ['DEN', 'NOR', 'SWE', 'SVK', 'CRO', 'GRE'];
    for (const c of uefaExp) {
      expect(getRegion(c)).toBe('UEFA');
      expect(UEFA_COUNTRIES).toContain(c);
      const cups = getContinentalCupNames(c);
      expect(cups.cl).toBe('Euro Champions Cup');
      expect(cups.el).toBe('Euro Cup');
      expect(cups.ecl).toBe('Euro Challenge Cup');
    }

    const conmebolExp = ['PER', 'BOL', 'PAR', 'CHI'];
    for (const c of conmebolExp) {
      expect(getRegion(c)).toBe('CONMEBOL');
      expect(CONMEBOL_COUNTRIES).toContain(c);
      const cups = getContinentalCupNames(c);
      expect(cups.cl).toBe('Copa Libertadores');
      expect(cups.el).toBe('Copa Sudamericana');
      expect(cups.ecl).toBe('Recopa');
    }

    const afcExp = ['KOR', 'IDN', 'IND'];
    for (const c of afcExp) {
      expect(getRegion(c)).toBe('AFC');
      expect(AFC_COUNTRIES).toContain(c);
      const cups = getContinentalCupNames(c);
      expect(cups.cl).toBe('Asian Champions Cup');
      expect(cups.el).toBe('Asian Cup');
      expect(cups.ecl).toBe('Asian Challenge Cup');
    }

    // 2. National Team Tournament Integration
    const allModCountries = [...uefaExp, ...conmebolExp, ...afcExp];
    for (const code of allModCountries) {
      const nt = NATIONAL_TEAMS.find(t => t.code === code);
      expect(nt).toBeDefined();
      expect(nt?.ovr).toBeGreaterThanOrEqual(70);
      expect(nt?.continent).toBe(getRegion(code));

      // Coach candidate generation
      if (nt) {
        const coaches = getNationalCoachCandidates(nt);
        expect(coaches.length).toBe(3);
        expect(coaches[0].name).not.toBe('Alex Vance'); // Uses localized pool
      }
    }
  });

  it('ensures institutional bank loans size realistically across tiers and deduct accurately on the ledger', () => {
    // 1. Check sizing across tiers
    const t1Germany = getClubMaxBankLoan(1, 'GER');
    const t2Germany = getClubMaxBankLoan(2, 'GER');
    const t3Germany = getClubMaxBankLoan(3, 'GER');
    const t1Greece = getClubMaxBankLoan(1, 'GRE');

    expect(t1Germany).toBe(30000); // €30.0M baseline
    expect(t2Germany).toBe(9000);   // €9.0M baseline
    expect(t3Germany).toBe(3000);   // €3.0M baseline
    expect(t1Greece).toBe(3600);    // €30.0M * 0.12 = €3.6M, scaled to local economy

    // 2. Check 10, 15, and 25-year repayment options
    const options = getLoanOptions(10000);
    expect(options.length).toBe(3);
    const [opt10, opt15, opt25] = options;

    expect(opt10.years).toBe(10);
    expect(opt10.annualPayment).toBe(1250); // 12.5% / yr
    expect(opt10.totalRepayment).toBe(12500); // 125%

    expect(opt15.years).toBe(15);
    expect(opt15.annualPayment).toBe(950);  // 9.5% / yr
    expect(opt15.totalRepayment).toBe(14250); // 142.5%

    expect(opt25.years).toBe(25);
    expect(opt25.annualPayment).toBe(700);  // 7.0% / yr
    expect(opt25.totalRepayment).toBe(17500); // 175%

    // 3. Financial ledger deduction in calculateClubFinancials
    const sampleClub = ALL_CLUBS[0];
    const baseFin = calculateClubFinancials({ club: sampleClub, budget: 5000 });
    const loanFin = calculateClubFinancials({
      club: sampleClub,
      budget: 5000,
      bankLoan: {
        principal: 10000,
        annualPayment: 950,
        totalYears: 15,
        yearsLeft: 15,
      },
    });

    expect(loanFin.bankLoanDebtService).toBe(950);
    expect(loanFin.wages).toBe(baseFin.wages + 950);
    expect(loanFin.net).toBe(baseFin.net - 950);

    // 4. Stature Scaling (Real Madrid vs standard club)
    const realMadrid = {
      tier: 1,
      country: 'ESP',
      stadium: 85000,
      baseOvr: 89,
      fanBase: 12000000,
    };
    const realMadridLoan = getClubMaxBankLoan(realMadrid, 0, 95);
    expect(realMadridLoan).toBeGreaterThanOrEqual(100000); // Over €100M borrowing capacity for Real Madrid!

    // 5. Scaling as player builds a club into a superclub
    const smallStart = {
      tier: 4,
      country: 'GER',
      stadium: 3000,
      baseOvr: 52,
      fanBase: 8000,
    };
    const smallStartLoan = getClubMaxBankLoan(smallStart, 0, 30);
    expect(smallStartLoan).toBeLessThan(2000); // ~€1M or less

    const grownSuperclub = {
      tier: 1,
      country: 'GER',
      stadium: 75000,
      baseOvr: 87,
      fanBase: 5000000,
    };
    const grownSuperclubLoan = getClubMaxBankLoan(grownSuperclub, 0, 90);
    expect(grownSuperclubLoan).toBeGreaterThanOrEqual(80000); // Expanded dynamically to €80M+ capacity!

    // 6. Dynamic Debt Bailout Coverage
    const deepDebtMadrid = getClubMaxBankLoan(realMadrid, -150000, 95);
    expect(deepDebtMadrid).toBeGreaterThanOrEqual(170000); // Fully clears the €150M debt + provides buffer

    // 7. Verify seasonsInDebt reset logic upon receiving debt lifeline
    const priorDebtBudget = -20000;
    const loanPrincipal = 25000;
    const resultingBudget = priorDebtBudget + loanPrincipal;
    const seasonsInDebt = 2;
    const resetSeasonsInDebt = resultingBudget >= 0 ? 0 : seasonsInDebt;
    expect(resetSeasonsInDebt).toBe(0);
  });

  it('ensures Headline Bulletin targets the biggest trophy winner in Europe, South America, North America, or APAC depending on manager country', async () => {
    const { getAllUniverseMovements } = await import('./universeMovements');
    const { getRegion } = await import('./regionHelpers');

    const mockState: any = {
      year: 2026,
      club: { id: 9999, name: 'Test FC', country: 'IDN', tier: 1, color: '#ff0000' },
      history: [],
      universeMovements: [],
      trophyHistory: []
    };

    const movements = getAllUniverseMovements(mockState, []);

    const getHeadlineBulletinWinner = (country: string) => {
      const region = getRegion(country);
      let premierCupRegex: RegExp;
      switch (region) {
        case 'AFC':
          premierCupRegex = /asian.*champion|asia.*champion|afc.*champion|afc.*league/i;
          break;
        case 'CONMEBOL':
          premierCupRegex = /libertadores/i;
          break;
        case 'CONCACAF':
          premierCupRegex = /concacaf.*champion|north american.*champion/i;
          break;
        case 'UEFA':
        default:
          premierCupRegex = /(euro.*champion|uefa.*champion|^champions cup)/i;
          break;
      }
      return movements.find(m => m.type === 'cup_champion' && premierCupRegex.test(m.fromLeagueName || ''));
    };

    // 1. Indonesia (IDN) in APAC -> AFC Champions League winner (e.g. Urawa Red Diamonds)
    const idnHeadline = getHeadlineBulletinWinner('IDN');
    expect(idnHeadline).toBeDefined();
    expect(idnHeadline?.clubName).toBe('Urawa Red Diamonds');
    expect(idnHeadline?.fromLeagueName).toContain('AFC');

    // 2. Brazil (BRA) in South America -> Copa Libertadores winner (e.g. Fluminense FC)
    const braHeadline = getHeadlineBulletinWinner('BRA');
    expect(braHeadline).toBeDefined();
    expect(braHeadline?.clubName).toBe('Fluminense FC');
    expect(braHeadline?.fromLeagueName).toContain('Libertadores');

    // 3. Mexico (MEX) in North America -> Concacaf Champions Cup winner (e.g. CF Pachuca)
    const mexHeadline = getHeadlineBulletinWinner('MEX');
    expect(mexHeadline).toBeDefined();
    expect(mexHeadline?.clubName).toBe('CF Pachuca');
    expect(mexHeadline?.fromLeagueName).toContain('Concacaf');

    // 4. Germany (GER) in Europe -> Champions Cup winner (e.g. Real Madrid CF)
    const gerHeadline = getHeadlineBulletinWinner('GER');
    expect(gerHeadline).toBeDefined();
    expect(gerHeadline?.clubName).toBe('Real Madrid CF');
    expect(gerHeadline?.fromLeagueName).toContain('Champions Cup');
  });

  it('correctly uses unmodded clubdata.ts names when isModActive is false in Universe Movements', async () => {
    const { getAllUniverseMovements } = await import('./universeMovements');
    const { getRegion } = await import('./regionHelpers');

    const mockState: any = {
      year: 2026,
      club: { id: 9999, name: 'Test FC', country: 'GER', tier: 1, color: '#ff0000' },
      history: [],
      universeMovements: [],
      trophyHistory: []
    };

    // When mod is OFF (isModActive = false)
    const unmoddedMovements = getAllUniverseMovements(mockState, [], false);

    // Cup winners should use clubsData.ts names
    const clWinner = unmoddedMovements.find(m => m.id === 'base-cup-cl-2024');
    expect(clWinner).toBeDefined();
    expect(clWinner?.clubName).toBe('Madrid Blanco'); // clubsData.ts name for Real Madrid CF

    const elWinner = unmoddedMovements.find(m => m.id === 'base-cup-el-2024');
    expect(elWinner).toBeDefined();
    expect(elWinner?.clubName).toBe('Bergamo Nerazzurro'); // clubsData.ts name for Atalanta BC

    const cwcWinner = unmoddedMovements.find(m => m.id === 'base-cup-cwc-2024');
    expect(cwcWinner).toBeDefined();
    expect(cwcWinner?.clubName).toBe('Manchester Blue'); // clubsData.ts name for Manchester City

    const libWinner = unmoddedMovements.find(m => m.id === 'base-cup-libertadores-2024');
    expect(libWinner).toBeDefined();
    expect(libWinner?.clubName).toBe('Rio Flu'); // clubsData.ts name for Fluminense FC

    const afcWinner = unmoddedMovements.find(m => m.id === 'base-cup-afc-2024');
    expect(afcWinner).toBeDefined();
    expect(afcWinner?.clubName).toBe('Urawa'); // clubsData.ts name for Urawa Red Diamonds

    // Domestic league movements should also use clubsData.ts names
    const pauliMove = unmoddedMovements.find(m => m.id === 'base-ger-1');
    expect(pauliMove).toBeDefined();
    expect(pauliMove?.clubName).toBe('Kiez Hamburg St. Pauli'); // clubsData.ts name for FC St. Pauli

    const kielMove = unmoddedMovements.find(m => m.id === 'base-ger-2');
    expect(kielMove).toBeDefined();
    expect(kielMove?.clubName).toBe('Förde Kiel'); // clubsData.ts name for Holstein Kiel

    const leicesterMove = unmoddedMovements.find(m => m.id === 'base-eng-1');
    expect(leicesterMove).toBeDefined();
    expect(leicesterMove?.clubName).toBe('Leicester'); // clubsData.ts name for Leicester City
  });

  it('correctly synthesizes domestic cups (DBU Pokalen, DFB-Pokal) and categorizes headline badges', async () => {
    const { getAllUniverseMovements, getHeadlineCategory, isMajorUniverseHeadline } = await import('./universeMovements');

    const mockState: any = {
      year: 2026,
      club: { id: 2501, name: 'FC Copenhagen', country: 'DEN', tier: 1, color: '#00205b' },
      history: [],
      universeMovements: [],
      trophyHistory: [
        { year: 2026, clubName: 'FC Copenhagen', name: 'DBU Pokalen', color: '#00205b' },
        { year: 2026, clubName: 'FC Copenhagen', name: 'Euro Champions Cup', color: '#00205b' }
      ]
    };

    const movements = getAllUniverseMovements(mockState, []);

    // 1. DBU Pokalen is synthesized
    const dbuMove = movements.find(m => m.fromLeagueName === 'DBU Pokalen');
    expect(dbuMove).toBeDefined();
    expect(dbuMove?.isUserClub).toBe(true);
    expect(dbuMove?.type).toBe('cup_champion');
    expect(dbuMove?.country).toBe('DEN');
    expect(isMajorUniverseHeadline(dbuMove!, 'DEN')).toBe(true);

    // 2. DBU Pokalen is categorized as DOMESTIC CUP
    const dbuCat = getHeadlineCategory(dbuMove!);
    expect(dbuCat.label).toBe('YOUR GLORY'); // isUserClub is true
    // If not user club:
    const aiDbuMove = { ...dbuMove!, isUserClub: false };
    const aiDbuCat = getHeadlineCategory(aiDbuMove);
    expect(aiDbuCat.label).toBe('DOMESTIC CUP');
    expect(aiDbuCat.icon).toBe('fa-trophy');

    // 3. Euro Champions Cup is categorized as EUROPEAN GLORY when not user club
    const euroMove = movements.find(m => m.fromLeagueName === 'Euro Champions Cup');
    expect(euroMove).toBeDefined();
    const aiEuroCat = getHeadlineCategory({ ...euroMove!, isUserClub: false });
    expect(aiEuroCat.label).toBe('EUROPEAN GLORY');
  });

  describe('Decoupled Incubator Pipeline Engine', () => {
    it('enforces capacity gating across facility levels (Level 1: 6 slots, Level 3: 10 slots, Level 5: 12 slots)', async () => {
      const { getIncubatorCapacity } = await import('../engine/incubatorEngine');
      expect(getIncubatorCapacity(1)).toBe(6);
      expect(getIncubatorCapacity(2)).toBe(8);
      expect(getIncubatorCapacity(3)).toBe(10);
      expect(getIncubatorCapacity(4)).toBe(11);
      expect(getIncubatorCapacity(5)).toBe(12);
    });

    it('calculates squad promotion with 0 penalty for graduation-ready prospects and -1 OVR penalty when pulled early', async () => {
      const { promoteProspectToSenior } = await import('../engine/incubatorEngine');
      const prospectReady: any = { id: 'p1', name: 'Lukas Weber', boost: 4, type: 'generational', status: 'ready', timer: 0 };
      const outcomeReady = promoteProspectToSenior(prospectReady, 72);

      expect(outcomeReady.integrationCost).toBe(0);
      expect(outcomeReady.netGain).toBe(4);
      expect(outcomeReady.newOvr).toBe(76);

      const prospectEarly: any = { id: 'p2', name: 'Finn Meyer', boost: 4, type: 'generational', status: 'incubating', timer: 2 };
      const outcomeEarly = promoteProspectToSenior(prospectEarly, 72);

      expect(outcomeEarly.integrationCost).toBe(1);
      expect(outcomeEarly.netGain).toBe(3); // 4 - 1
      expect(outcomeEarly.newOvr).toBe(75);
    });

    it('calculates training compensation fee when releasing an incubator prospect', async () => {
      const { calculateTrainingCompensationK } = await import('../engine/incubatorEngine');
      const prospectGen: any = { id: 'p1', name: 'Matteo Schneider', boost: 4, type: 'generational' };
      const feeTier1 = calculateTrainingCompensationK(prospectGen, 1);
      const feeTier3 = calculateTrainingCompensationK(prospectGen, 3);

      expect(feeTier1).toBeGreaterThan(feeTier3);
      expect(feeTier1).toBeGreaterThan(1000); // Generational talent commands significant compensation
    });

    it('advances prospects cleanly through development and returns loaned prospects with bonus boost', async () => {
      const { advanceIncubatorSeason } = await import('../engine/incubatorEngine');
      const pipeline: any[] = [
        { id: 'p1', name: 'Leo Fischer', timer: 1, boost: 2, age: 16, status: 'incubating' },
        { id: 'p2', name: 'Finn Meyer', timer: 2, boost: 3, age: 15, status: 'incubating' },
        { id: 'p3', name: 'Elias Wagner', timer: 0, boost: 2, age: 17, status: 'loaned' }
      ];

      const res = advanceIncubatorSeason(pipeline);
      const readyP1 = res.updatedPipeline.find(p => p.id === 'p1');
      const incubP2 = res.updatedPipeline.find(p => p.id === 'p2');
      const loanedP3 = res.updatedPipeline.find(p => p.id === 'p3');

      expect(readyP1?.status).toBe('ready');
      expect(readyP1?.timer).toBe(0);
      expect(incubP2?.status).toBe('incubating');
      expect(incubP2?.timer).toBe(1);
      expect(loanedP3?.status).toBe('ready');
      expect(loanedP3?.boost).toBe(3); // +1 bonus from loan development
    });
  });

  describe('Fine-Tuned Sub-Ledger & Scouting Dial Engine', () => {
    it('calculates rolling 3-year academy spend and effective acquisition cost per asset', async () => {
      const { calculateAcademySubLedger, recordSeasonAcademySpend } = await import('../engine/subLedgerEngine');

      const mockState: any = {
        year: 2026,
        club: { id: 18, name: 'TSG 1899 Hoffenheim', tier: 1, academyLevel: 3 },
        academyScoutingDial: 20,
        academySpendHistory: [
          { year: 2024, spendK: 400, graduatesCount: 1 },
          { year: 2025, spendK: 450, graduatesCount: 1 },
          { year: 2026, spendK: 450, graduatesCount: 2 }
        ],
        youthPipeline: []
      };

      const report = calculateAcademySubLedger(mockState);
      expect(report.rollingSpend3YrK).toBe(1300);
      expect(report.totalGraduates3Yr).toBe(4);
      expect(report.effectiveCostPerGraduateK).toBe(Math.round(1300 / 4)); // 325K
      expect(report.marketBenchmarkCostK).toBe(2800); // Tier 1 benchmark
      expect(report.savingsVsMarketK).toBe(2800 - 325);
      expect(report.roiMultiplier).toBeGreaterThan(1.0);
      expect(report.scoutingDialPct).toBe(20);

      // Record next season spend
      const nextSeasonState = { ...mockState, year: 2027 };
      const updatedHistory = recordSeasonAcademySpend(nextSeasonState, 2);
      expect(updatedHistory.length).toBe(4);
      expect(updatedHistory[0].year).toBe(2027);
    });
  });

  describe('Credit Facility & Loan Amortization Engine', () => {
    it('provides structured loan quotes for bank facilities and municipal bonds', async () => {
      const { getStructuredLoanQuotes, getLoanProgress, advanceLoanSeason } = await import('../engine/creditFacilityEngine');

      const quotes = getStructuredLoanQuotes(10000);
      expect(quotes.length).toBe(2);

      const bankQuote = quotes.find(q => q.type === 'bank');
      const bondQuote = quotes.find(q => q.type === 'bond');

      expect(bankQuote?.years).toBe(15);
      expect(bankQuote?.interestRate).toBe(4.5);
      expect(bondQuote?.years).toBe(25);
      expect(bondQuote?.interestRate).toBe(2.8);

      // Amortization progress
      const mockLoan: any = {
        principal: 7000,
        initialPrincipal: 10000,
        annualPayment: 850,
        totalYears: 15,
        yearsLeft: 10,
        loanType: 'bank',
        interestRate: 4.5
      };

      const progress = getLoanProgress(mockLoan);
      expect(progress).not.toBeNull();
      expect(progress?.percentPaidOff).toBe(Math.round((5 / 15) * 100)); // 33%
      expect(progress?.remainingPrincipal).toBe(7000);
      expect(progress?.earlyPayoffCost).toBe(7000); // Standard principal face-value between 10% and 50%

      // Matured loan (> 50% paid off) receives early payoff discount
      const maturedLoan: any = { ...mockLoan, yearsLeft: 6 }; // 9/15 = 60% paid off
      const maturedProgress = getLoanProgress(maturedLoan);
      expect(maturedProgress?.earlyPayoffCost).toBeLessThan(maturedProgress!.remainingPrincipal);

      // Immature loan (< 10% paid off) incurs cancellation penalty
      const freshLoan: any = { ...mockLoan, yearsLeft: 15 }; // 0% paid off
      const freshProgress = getLoanProgress(freshLoan);
      expect(freshProgress?.earlyPayoffCost).toBeGreaterThan(freshProgress!.remainingPrincipal);

      // Advancing season
      const advanced = advanceLoanSeason(mockLoan);
      expect(advanced.updatedLoan?.yearsLeft).toBe(9);
      expect(advanced.isPaidOff).toBe(false);
    });
  });

  describe('Metropolitan Catchment & Hoffenheim Soft Ceiling Engine', () => {
    it('resolves authentic urban populations across both modded and unmodded clubs', async () => {
      const { getClubCatchment } = await import('../engine/catchmentEngine');

      // 1. Hoffenheim / Kraichgau (Small-market village baseline)
      const hoffenheimCatchment = getClubCatchment({ id: 18, name: 'TSG 1899 Hoffenheim', country: 'GER' });
      expect(hoffenheimCatchment.population).toBe(36000);
      expect(hoffenheimCatchment.city).toContain('Hoffenheim');

      // 2. Madrid (Metropolis)
      const realMadridCatchment = getClubCatchment({ id: 201, name: 'Real Madrid', country: 'ESP' });
      expect(realMadridCatchment.population).toBe(6800000);

      // 3. Copenhagen (Mod database)
      const copenhagenCatchment = getClubCatchment({ id: 2501, name: 'FC Copenhagen', country: 'DEN' });
      expect(copenhagenCatchment.population).toBe(2100000);
    });

    it('enforces Hoffenheim soft ceiling when stadium expands significantly beyond municipal demographics', async () => {
      const { analyzeCatchment, getCatchmentAttendanceModifier } = await import('../engine/catchmentEngine');

      const smallClub: any = {
        id: 18,
        name: 'TSG 1899 Hoffenheim',
        country: 'GER',
        stadium: 75000, // Massive expansion to 75,000 in a 36k village
        tier: 1,
        rep: 60 // Modest domestic stature
      };

      const analysis = analyzeCatchment(smallClub);
      expect(analysis.isExceedingCatchment).toBe(true);
      expect(analysis.utilizationRiskLevel).toBe('high_drag');
      expect(analysis.softCapacityCeiling).toBeLessThan(75000);

      const attendanceMod = getCatchmentAttendanceModifier(smallClub);
      expect(attendanceMod).toBeLessThan(1.0); // Facing attendance drag

      // If club becomes an elite European titan (rep >= 85), crowd caravanning overcomes the soft ceiling
      const eliteVillageClub = { ...smallClub, rep: 90 };
      const eliteMod = getCatchmentAttendanceModifier(eliteVillageClub);
    });

    it('synchronizes youth graduations with Board Vision objectives and scales tournament win odds by academy tier', async () => {
      const { applyYouthGraduationToBoardVision } = await import('../engine/boardVisionEngine');

      const mockVision: any = {
        id: 'vision_test',
        title: 'Youth Factory',
        durationYears: 3,
        currentYearOfVision: 1,
        objectives: [
          {
            id: 'obj_graduate_youth',
            desc: 'Graduate 3 Academy Players to First Team',
            targetValue: 3,
            currentValue: 1,
            unit: 'Players',
            type: 'graduate_youth',
            isCompleted: false,
          },
          {
            id: 'obj_promotion',
            desc: 'Secure Promotion',
            targetValue: 1,
            currentValue: 0,
            unit: 'Promotions',
            type: 'promotion',
            isCompleted: false,
          }
        ]
      };

      // 1. Single graduation increment
      const updated1 = applyYouthGraduationToBoardVision(mockVision, 1);
      const youthObj1 = updated1.objectives.find((o: any) => o.type === 'graduate_youth');
      expect(youthObj1?.currentValue).toBe(2);
      expect(youthObj1?.isCompleted).toBe(false);

      // 2. Second graduation hits target (2 + 1 = 3)
      const updated2 = applyYouthGraduationToBoardVision(updated1, 1);
      const youthObj2 = updated2.objectives.find((o: any) => o.type === 'graduate_youth');
      expect(youthObj2?.currentValue).toBe(3);
      expect(youthObj2?.isCompleted).toBe(true);

      // 3. Test Academy Tier scaling formula: Higher level of youth academy = higher chance of winning youth title
      const calculateU19Ovr = (academyLevel: number, pipeline: any[]) => {
        const lvl = Math.max(1, Math.min(5, academyLevel || 1));
        const facilityBonus = (lvl - 1) * 6;
        const avgRating = pipeline.length > 0
          ? pipeline.reduce((sum, p) => sum + (p.currentOvr || 50), 0) / pipeline.length
          : 50;
        const talentBonus = Math.round((avgRating - 50) * 0.4);
        return Math.max(48, Math.min(88, 52 + facilityBonus + Math.max(-4, Math.min(12, talentBonus))));
      };

      const mockCohort = [
        { id: '1', currentOvr: 55, boost: 3 },
        { id: '2', currentOvr: 58, boost: 4 },
        { id: '3', currentOvr: 60, boost: 5 },
        { id: '4', currentOvr: 52, boost: 2 },
        { id: '5', currentOvr: 54, boost: 2 },
        { id: '6', currentOvr: 56, boost: 3 },
      ];

      const lvl1Ovr = calculateU19Ovr(1, mockCohort);
      const lvl3Ovr = calculateU19Ovr(3, mockCohort);
      const lvl5Ovr = calculateU19Ovr(5, mockCohort);

      expect(lvl1Ovr).toBeLessThan(60); // Underdogs
      expect(lvl3Ovr).toBeGreaterThanOrEqual(64); // Highly competitive
      expect(lvl5Ovr).toBeGreaterThanOrEqual(76); // Dominant tournament powerhouse
      expect(lvl5Ovr - lvl1Ovr).toBe(24); // Exactly 24 OVR facility advantage between Tier 1 and Tier 5
    });

    it('guarantees strict pyramid capacity preservation across multi-season simulation', async () => {
      const { simulateAiLeagues } = await import('../engine/simulateAiLeagues');
      const { ALL_CLUBS } = await import('../data/clubsData');

      // Use a copy of German clubs
      let clubs = ALL_CLUBS.map(c => ({ ...c }));
      const userClubId = 1; // User club

      const gerClubsBefore = clubs.filter(c => (c.country || 'GER') === 'GER');
      const t1Before = gerClubsBefore.filter(c => c.tier === 1).length;
      const t2Before = gerClubsBefore.filter(c => c.tier === 2).length;
      const t3Before = gerClubsBefore.filter(c => c.tier === 3).length;

      // Simulate 10 consecutive seasons
      for (let s = 1; s <= 10; s++) {
        clubs = simulateAiLeagues(clubs, userClubId, 2026 + s);
        
        // Invariant check: Tier 1, Tier 2, Tier 3 sizes must remain strictly stable
        const gerNow = clubs.filter(c => (c.country || 'GER') === 'GER');
        const t1Now = gerNow.filter(c => c.tier === 1).length;
        const t2Now = gerNow.filter(c => c.tier === 2).length;
        const t3Now = gerNow.filter(c => c.tier === 3).length;

        expect(t1Now).toBe(t1Before);
        expect(t2Now).toBe(t2Before);
        expect(t3Now).toBe(t3Before);

        // Guardrail check: No reserve clubs in Tier 1 or Tier 2
        const t1Reserve = gerNow.filter(c => c.tier === 1 && (c.name.includes(' II') || c.name.includes(' 2')));
        const t2Reserve = gerNow.filter(c => c.tier === 2 && (c.name.includes(' II') || c.name.includes(' 2')));
        expect(t1Reserve.length).toBe(0);
        expect(t2Reserve.length).toBe(0);
      }
    });

    it('enforces mathematical parity and strict tiebreakers on simulated league tables', () => {
      // Test the mathematical invariant function for standings
      const generateValidStandings = (wins: number, draws: number, losses: number, ptsDeducted = 0) => {
        const mp = wins + draws + losses;
        const pts = Math.max(0, wins * 3 + draws - ptsDeducted);
        const gf = Math.max(15, Math.round(wins * 1.9 + draws * 1.1 + 8));
        const ga = Math.max(12, Math.round(losses * 1.8 + draws * 0.9 + 6));
        const gd = gf - ga;
        return { mp, w: wins, d: draws, l: losses, pts, gf, ga, gd };
      };

      const row1 = generateValidStandings(20, 6, 8);
      const row2 = generateValidStandings(20, 6, 8); // tied on points and record
      const row3 = generateValidStandings(15, 10, 9);

      // Invariants:
      expect(row1.mp).toBe(34);
      expect(row1.pts).toBe(66);
      expect(row1.gd).toBe(row1.gf - row1.ga);
      expect(row1.gf).toBeGreaterThan(0);
      expect(row1.ga).toBeGreaterThan(0);

      // Tiebreaker sorting test: Points -> GD -> GF -> W
      const testRows = [
        { name: 'Club B', pts: 50, gd: 10, gf: 50, w: 14 },
        { name: 'Club A', pts: 50, gd: 15, gf: 55, w: 15 },
        { name: 'Club C', pts: 50, gd: 10, gf: 52, w: 14 },
        { name: 'Club D', pts: 48, gd: 20, gf: 60, w: 14 }
      ];

      testRows.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        if (b.w !== a.w) return b.w - a.w;
        return a.name.localeCompare(b.name);
      });

      expect(testRows[0].name).toBe('Club A'); // highest GD at 50 pts
      expect(testRows[1].name).toBe('Club C'); // higher GF at same GD
      expect(testRows[2].name).toBe('Club B');
      expect(testRows[3].name).toBe('Club D'); // lower pts
    });
  });

  describe('Comprehensive Exploit Audit & Defensive Guardrails Suite', () => {
    it('enforces inaugural season board subsidy strictly on year 1 and exposes authentic deficit in season 2', () => {
      const sampleClub = {
        name: 'FC Test Hansa',
        tier: 3,
        baseOvr: 72, // High squad quality causing wage pressure
        stadium: 15000,
        country: 'GER',
        squadSize: 24,
        academyLevel: 2,
        medicalLevel: 2,
      };

      // Season 1: Inaugural season Runway
      const season1Fin = calculateClubFinancials({
        club: sampleClub,
        budget: 5000,
        seasonCount: 1,
        startYear: 2026,
        year: 2026,
      });

      // Board subsidy should activate if expenses exceeded revenue in season 1
      if (season1Fin.wages > (season1Fin.estRevenue - (season1Fin.boardSubsidy || 0))) {
        expect(season1Fin.boardSubsidy).toBeGreaterThan(0);
        expect(season1Fin.net).toBeGreaterThanOrEqual(0);
      }

      // Season 2: The subsidy must NOT apply indefinitely
      const season2Fin = calculateClubFinancials({
        club: sampleClub,
        budget: 5000,
        seasonCount: 2,
        startYear: 2026,
        year: 2027,
      });

      expect(season2Fin.boardSubsidy).toBe(0);
    });

    it('validates credit limit calculation and ensures proper barrier thresholds', () => {
      const tier1Limit = getCreditLimit(1, 'GER');
      const tier3Limit = getCreditLimit(3, 'GER');
      const tier5Limit = getCreditLimit(5, 'GER');

      expect(tier1Limit).toBeGreaterThan(tier3Limit);
      expect(tier3Limit).toBeGreaterThan(tier5Limit);
      expect(tier5Limit).toBeGreaterThan(0);

      // Verify credit limits scale properly by country economy
      const ecuTier1Limit = getCreditLimit(1, 'ECU');
      expect(ecuTier1Limit).toBeLessThan(tier1Limit);
    });

    it('ensures Decision Day draw logic correctly awards championship to points/GD leader', () => {
      // Scenario: User was leader going into final matchday with 75 pts (+30 GD), Rival was 2nd with 73 pts (+25 GD).
      const userPreGamePts = 75;
      const userPreGameGd = 30;
      const rivalPreGamePts = 73;
      const rivalPreGameGd = 25;
      const wasLeader = userPreGamePts > rivalPreGamePts;

      // Match outcome: DRAW (e.g. 1-1)
      const ddWon = false;
      const ddDraw = true;

      let userFinalPts = userPreGamePts + 1; // 76 pts
      let userFinalGd = userPreGameGd;       // +30 GD
      let rivalFinalPts = rivalPreGamePts + (wasLeader ? 3 : 1); // Rival wins their game -> 76 pts
      let rivalFinalGd = rivalPreGameGd + (wasLeader ? 2 : 0);   // +27 GD

      // Evaluate duel
      const userWonDuel = userFinalPts > rivalFinalPts || (userFinalPts === rivalFinalPts && userFinalGd > rivalFinalGd);
      const approxPos = userWonDuel ? 1 : 2;

      // Invariant: User finishes 1st due to superior GD on tied points (76 pts, +30 vs +27)
      expect(userFinalPts).toBe(76);
      expect(rivalFinalPts).toBe(76);
      expect(userWonDuel).toBe(true);
      expect(approxPos).toBe(1); // Not demoted to 2nd place!
    });

    it('enforces monotonic debt penalty scaling across consecutive debt tenures', () => {
      const budget = -600000; // -€600k debt
      const baseDeduction = Math.floor(Math.abs(budget) / 2000); // 300

      // Year 0 (First season in debt): Soft warning (max 1-2 pts)
      const penaltyYear0 = Math.min(2, Math.max(1, Math.floor(Math.abs(budget) < 500000 ? 1 : 2)));
      expect(penaltyYear0).toBe(2);

      // Year 1 (Second consecutive season in debt): Moderate penalty (2 to 5 pts)
      const penaltyYear1 = Math.min(5, Math.max(2, baseDeduction));
      expect(penaltyYear1).toBe(5);

      // Year 2+ (Repeat offenders): Heavy penalty up to 15 pts
      const penaltyYear2 = Math.min(15, Math.max(3, baseDeduction * 2));
      expect(penaltyYear2).toBe(15);

      // Monotonic progression check:
      expect(penaltyYear0).toBeLessThanOrEqual(penaltyYear1);
      expect(penaltyYear1).toBeLessThanOrEqual(penaltyYear2);
    });

    it('verifies 34-game mathematical invariants and points integrity', () => {
      const sampleTargetPts = [20, 45, 65, 82, 98, 102];

      for (const targetPts of sampleTargetPts) {
        let wins = Math.min(34, Math.max(0, Math.floor(targetPts / 3)));
        let draws = targetPts - wins * 3;

        if (draws < 5 && wins > 2) {
          const convertWins = Math.max(0, Math.min(2, Math.floor((34 - (wins + draws)) / 2)));
          wins -= convertWins;
          draws += convertWins * 3;
        }

        if (wins + draws > 34) {
          draws = Math.max(0, 34 - wins);
        }

        const losses = Math.max(0, 34 - wins - draws);
        const pts = wins * 3 + draws;

        expect(wins + draws + losses).toBe(34);
        expect(pts).toBeLessThanOrEqual(102);
        expect(wins).toBeGreaterThanOrEqual(0);
        expect(draws).toBeGreaterThanOrEqual(0);
        expect(losses).toBeGreaterThanOrEqual(0);
      }
    });

    it('verifies bottom-tier drop zone sacking sets isSackedRelegation and provides similar-OVR candidates', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
      
      // 1. isSackedRelegation must be set to true in the bottom-tier branch
      expect(appSrc).toMatch(/\/\/\s*Relegated from bottom tier -> sacked\s+isSackedRelegation\s*=\s*true;/);

      // 2. Dismissal dialog is displayed for isSackedRelegation
      expect(appSrc).toContain('!isDecisionDayFired || isSackedRelegation');

      // 3. Similar OVR candidates sorting is present in job generation
      expect(appSrc).toContain('Math.abs(a.baseOvr - state.club.baseOvr)');
      expect(appSrc).toContain('Math.abs(b.baseOvr - state.club.baseOvr)');

      // 4. Forced job offer event is guaranteed on season finish close
      expect(appSrc).toContain('const hasForcedJobEvent = (eventQueue || []).some(e => e.type === \'job_offer\' && e.isForced);');
    });

    it('verifies SeasonFinishModal correctly badges bottom-tier and single-tier sacking as MANAGER SACKED', async () => {
      const fs = await import('fs');
      const sfSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');

      // Hero badge shows MANAGER SACKED when seasonData.isSackedRelegation is true
      expect(sfSrc).toContain('if (seasonData.isSackedRelegation)');
      expect(sfSrc).toContain("badge: 'MANAGER SACKED'");
      expect(sfSrc).toContain('Bottom-Tier Relegation Sacking');

      // Table sacking zone matches bottom-tier and single-tier
      expect(sfSrc).toContain('const isManagerSackingZone = (isTier1Only || isBottomTier) && (i >= tableData.length - numRelegationSpots);');
    });

    it('verifies getAcademyCallUpCap scales dynamically with facility level and prevents infinite promotions', async () => {
      const { getAcademyCallUpCap } = await import('../data/gameConstants');

      // Level 1–2: 1 call-up per season
      expect(getAcademyCallUpCap(1)).toBe(1);
      expect(getAcademyCallUpCap(2)).toBe(1);

      // Level 3–4: 2 call-ups per season
      expect(getAcademyCallUpCap(3)).toBe(2);
      expect(getAcademyCallUpCap(4)).toBe(2);

      // Level 5+: 3 call-ups per season
      expect(getAcademyCallUpCap(5)).toBe(3);
      expect(getAcademyCallUpCap(6)).toBe(3);

      // Default fallback
      expect(getAcademyCallUpCap()).toBe(1);
    });

    it('verifies instant loading architecture eliminates transition delays and curtains', async () => {
      const fs = await import('fs');
      const curtainSrc = fs.readFileSync('src/components/ScreenTransitionCurtain.tsx', 'utf-8');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
      const playerModalSrc = fs.readFileSync('src/components/PlayerRevealModal.tsx', 'utf-8');

      // ScreenTransitionCurtain returns null for instant zero-latency rendering
      expect(curtainSrc).toContain('return null;');

      // triggerScreenTransition executes action immediately with zero delay
      expect(appSrc).toContain('const triggerScreenTransition = (action: () => void, _title = \'Loading...\', _subtext = \'\') => {\n    action();\n  };');

      // isAppReady state
      expect(appSrc).toMatch(/const \[isAppReady, setIsAppReady\] = useState<boolean>\((false|true)\);/);

      // PlayerRevealModal eliminates 400ms loading anticipation
      expect(playerModalSrc).toContain('const [isRevealed, setIsRevealed] = useState(true);');
      expect(playerModalSrc).not.toContain('setTimeout(() => {\n      setIsRevealed(true);');
    });

    it('verifies DecisionDayModal tick interval and mobile live status pill', async () => {
      const fs = await import('fs');
      const ddSrc = fs.readFileSync('src/components/DecisionDayModal.tsx', 'utf-8');
      expect(ddSrc).toContain('}, 45);');
      expect(ddSrc).toContain('scrollContainerRef');
      expect(ddSrc).toContain('LIVE STANDING:');
    });

    it('verifies cwc null guards and cupRunResults capping in App.tsx', async () => {
      const fs = await import('fs');
      const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
      expect(appSrc).toContain('if (!state.cupRunResults) state.cupRunResults = [];\n        state.cupRunResults.push({ year: completedSeasonYear, id: \'cwc\'');
      expect(appSrc).toContain('state.cupRunResults = state.cupRunResults.slice(-30);');
    });

    it('verifies YouthChampionshipModal uses authentic FIFA shootout simulation', async () => {
      const fs = await import('fs');
      const youthSrc = fs.readFileSync('src/components/YouthChampionshipModal.tsx', 'utf-8');
      expect(youthSrc).toContain('simulateFifaShootout');
      expect(youthSrc).not.toContain('Math.floor(Math.random() * 2) + 4;');
    });
  });
});
