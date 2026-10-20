import { describe, it, expect } from 'vitest';
import { getBaseModClubs, getSafeDefaultClubs, normalizeAndValidateCustomDb } from '../engine/moddingEngine';
import { simulateAiLeagues } from '../engine/simulateAiLeagues';
import { mergeClubsDbSafeguards } from './modSafeguards';
import { ALL_CLUBS } from '../data/clubsData';
import { TEAMS } from '../mod-data/teams';
import { Club, GameState } from '../types';

describe('League Hierarchy & Universe Table Integrity Audit', () => {
  it('strictly validates Season 1 German Bundesliga starting composition in base mod', () => {
    const clubs = getBaseModClubs();
    const gerT1 = clubs.filter(c => (c.country || 'GER') === 'GER' && c.tier === 1);

    expect(gerT1.length).toBe(18);

    const gerT1Names = gerT1.map(c => c.name);
    // Key giants must be present
    expect(gerT1Names).toContain('FC Bayern München');
    expect(gerT1Names).toContain('Bayer 04 Leverkusen');
    expect(gerT1Names).toContain('Borussia Dortmund');
    expect(gerT1Names).toContain('RB Leipzig');
    expect(gerT1Names).toContain('VfB Stuttgart');
    expect(gerT1Names).toContain('Eintracht Frankfurt');
    expect(gerT1Names).toContain('Borussia Mönchengladbach');
    expect(gerT1Names).toContain('SC Freiburg');
    expect(gerT1Names).toContain('SV Werder Bremen');
    expect(gerT1Names).toContain('FC Augsburg');
    expect(gerT1Names).toContain('VfL Wolfsburg');
    expect(gerT1Names).toContain('1. FC Union Berlin');

    // Lower-tier clubs must NEVER start Season 1 in Tier 1
    expect(gerT1Names).not.toContain('DJK Vilzing');
    expect(gerT1Names).not.toContain('MSV Duisburg');
    expect(gerT1Names).not.toContain('SV Sandhausen');
    expect(gerT1Names).not.toContain('Karlsruher SC');
    expect(gerT1Names).not.toContain('SV Wehen Wiesbaden');
    expect(gerT1Names).not.toContain('TSV 1860 München');

    // Check actual lower-tier assignments
    const vilzing = clubs.find(c => c.name.includes('Vilzing'));
    expect(vilzing).toBeDefined();
    expect(vilzing!.tier).toBeGreaterThanOrEqual(4);

    const duisburg = clubs.find(c => c.name.includes('Duisburg'));
    expect(duisburg).toBeDefined();
    expect(duisburg!.tier).toBeGreaterThanOrEqual(3);

    const sandhausen = clubs.find(c => c.name.includes('Sandhausen'));
    expect(sandhausen).toBeDefined();
    expect(sandhausen!.tier).toBeGreaterThanOrEqual(3);

    const karlsruhe = clubs.find(c => c.name.includes('Karlsruher'));
    expect(karlsruhe).toBeDefined();
    expect(karlsruhe!.tier).toBe(2);
  });

  it('strictly validates Season 1 English Premier League starting composition in base mod', () => {
    const clubs = getBaseModClubs();
    const engT1 = clubs.filter(c => c.country === 'ENG' && c.tier === 1);

    expect(engT1.length).toBe(18);

    const engT1Names = engT1.map(c => c.name);
    expect(engT1Names.some(n => n.includes('Manchester City'))).toBe(true);
    expect(engT1Names.some(n => n.includes('Arsenal'))).toBe(true);
    expect(engT1Names.some(n => n.includes('Liverpool'))).toBe(true);
    expect(engT1Names.some(n => n.includes('Aston Villa'))).toBe(true);
    expect(engT1Names.some(n => n.includes('Tottenham'))).toBe(true);
    expect(engT1Names.some(n => n.includes('Chelsea'))).toBe(true);
    expect(engT1Names.some(n => n.includes('Manchester United'))).toBe(true);

    // Lower-tier clubs must NEVER start in Premier League
    expect(engT1Names).not.toContain('Southend United');
    expect(engT1Names).not.toContain('Scunthorpe United');
    expect(engT1Names).not.toContain('Rochdale');
  });

  it('strictly validates Season 1 Spanish La Liga and Italian Serie A starting composition in base mod', () => {
    const clubs = getBaseModClubs();
    const espT1 = clubs.filter(c => c.country === 'ESP' && c.tier === 1);
    expect(espT1.length).toBe(18);
    const espT1Names = espT1.map(c => c.name);
    expect(espT1Names.some(n => n.includes('Real Madrid'))).toBe(true);
    expect(espT1Names.some(n => n.includes('Barcelona'))).toBe(true);
    expect(espT1Names.some(n => n.includes('Atlético'))).toBe(true);
    expect(espT1Names).not.toContain('CE Europa');

    const itaT1 = clubs.filter(c => c.country === 'ITA' && c.tier === 1);
    expect(itaT1.length).toBe(18);
    const itaT1Names = itaT1.map(c => c.name);
    expect(itaT1Names.some(n => n.includes('Inter'))).toBe(true);
    expect(itaT1Names.some(n => n.includes('Juventus'))).toBe(true);
    expect(itaT1Names.some(n => n.includes('AC Milan'))).toBe(true);
    expect(itaT1Names).not.toContain('Virtus Entella');
  });

  it('guarantees that fresh career safeguards reset clubs to authentic starting tiers', () => {
    // Simulate a contaminated clubsDb where a lower-tier club was artificially promoted in an old save
    const contaminatedClubs: Club[] = getBaseModClubs().map(c => {
      if (c.name.includes('Vilzing') || c.name.includes('Duisburg')) {
        return { ...c, tier: 1 };
      }
      return { ...c };
    });

    const mockState: GameState = {
      managerName: 'Test Manager',
      nationality: 'GER',
      startYear: 2026,
      year: 2026,
      seasonCount: 1, // Fresh season 1
      tactic: '4-3-3',
      club: { ...contaminatedClubs[0], tier: 1 },
      euroStatus: null,
      maxOvrCap: 90,
      budget: 50000,
      reputation: 50,
      archetype: 'balanced',
      ownership: 'standard',
      investmentsThisSeason: 0,
      sponsorsPitchedThisSeason: 0,
      stadiumExpandedThisSeason: 0,
      academyUpgradedThisSeason: 0,
      medicalUpgradedThisSeason: 0,
      academyCallUpsThisSeason: 0,
      regTransfersThisSeason: 0,
      keyTransfersThisSeason: 0,
      jobMarketSearchesThisSeason: 0,
      isNewSeasonRender: true,
      initialRenderDone: true,
      clWins: 0,
      consecutiveTitles: 0,
      trophyDrought: 0,
      glassCeilingCursed: false,
      top4FinishStreak: 0,
      activePromise: false,
      boardWarning: false,
      boardExpectsSuccess: false,
      clubImpactScore: 50,
      yearsAtCurrentClub: 0,
      boardTargetFinish: 1,
      boardGracePeriod: 0,
      boardUltimatum: false,
      seasonsInDebt: 0,
      lastJobOfferYear: 0,
      totals: { matches: 0, wins: 0, att: 0, trophies: 0, domTrophies: 0, intTrophies: 0 },
      history: [],
      trophies: [],
      youthPipeline: [],
      internationalTrophies: 0,
      youthTrophies: 0,
      careerScore: 0,
      immunityShields: 2,
      facilitiesUpgradedThisSeason: 0,
      lastOvr: 85,
      mode: 'standard',
      livingTiers: { 80: 1, 92: 1 } // Old contaminated livingTiers
    };

    // When starting a new career, freshClubs resets against baseSource
    const baseSource = getBaseModClubs();
    const baseMap = new Map(baseSource.map(b => [b.id, b]));
    const baseNameMap = new Map(baseSource.map(b => [b.name.toLowerCase().trim(), b]));

    const freshClubs = contaminatedClubs.map(c => {
      const base = baseMap.get(c.id) || baseNameMap.get(c.name.toLowerCase().trim()) || ALL_CLUBS.find(f => f.id === c.id);
      return {
        ...base,
        ...c,
        tier: base?.tier ?? c.tier,
        baseOvr: base?.baseOvr ?? c.baseOvr,
        isInsolventGiant: false,
        insolvencyCount: 0,
      };
    });

    const sanitizedVilzing = freshClubs.find(c => c.name.includes('Vilzing'));
    expect(sanitizedVilzing!.tier).toBe(5);

    const sanitizedDuisburg = freshClubs.find(c => c.name.includes('Duisburg'));
    expect(sanitizedDuisburg!.tier).toBe(4);

    // Also verify modSafeguards in season 1 ignores dirty livingTiers
    const safeguarded = mergeClubsDbSafeguards(freshClubs, [mockState.club], mockState);
    const safeVilzing = safeguarded.find(c => c.name.includes('Vilzing'));
    expect(safeVilzing!.tier).toBe(5);
  });

  it('preserves symmetrical tier capacities and adjacent-only promotion across 3 seasons', () => {
    let clubs = getBaseModClubs();
    const bayern = clubs.find(c => c.name.includes('Bayern'))!;

    for (let season = 1; season <= 3; season++) {
      clubs = simulateAiLeagues(clubs, bayern.id, 2026 + season);
      const gerT1 = clubs.filter(c => (c.country || 'GER') === 'GER' && c.tier === 1);
      // Bundesliga must strictly remain 18 teams
      expect(gerT1.length).toBe(18);

      // Deep amateur clubs must not leap into Tier 1
      const vilzing = clubs.find(c => c.name.includes('Vilzing'))!;
      expect(vilzing.tier).toBeGreaterThan(1);

      const duisburg = clubs.find(c => c.name.includes('Duisburg'))!;
      expect(duisburg.tier).toBeGreaterThan(1);
    }
  });

  it('guarantees moddingEngine does not overwrite Tier 1 clubs with lower-tier clubs on ID collision', () => {
    // Custom database where club has id: 1 but name is an amateur club and tier is 5
    const customModPayload = [
      {
        id: 1,
        name: 'DJK Amateur Forest',
        country: 'GER',
        tier: 5,
        baseOvr: 50
      },
      ...TEAMS
    ];

    const res = normalizeAndValidateCustomDb(customModPayload);
    expect(res.valid).toBe(true);

    // FC Bayern München at id: 1 should NOT have been replaced by the tier 5 amateur club
    const bayern = res.clubs.find(c => c.name === 'FC Bayern München');
    expect(bayern).toBeDefined();
    expect(bayern!.tier).toBe(1);
    expect(bayern!.baseOvr).toBeGreaterThan(90);
  });

  it('guarantees single-tier domestic leagues like India strictly isolate domestic clubs with dynamic scaler', () => {
    const clubs = getBaseModClubs();
    const indClubs = clubs.filter(c => c.country === 'IND' && c.tier === 1);
    expect(indClubs.length).toBeGreaterThan(0);

    // Verify all Indian clubs are domestic and no foreign clubs (e.g. Schalke, Bayern) share their country code
    indClubs.forEach(c => {
      expect(c.country).toBe('IND');
      expect(c.name).not.toContain('Schalke');
      expect(c.name).not.toContain('Bayern');
    });

    // Simulate AI league with an Indian club as user
    const userClub = indClubs[0];
    const simResult = simulateAiLeagues(clubs, userClub.id, 2026, []);
    const standings = (simResult as any).standingsArchive?.[1] || [];
    
    // Standings for user's country in tier 1 must strictly contain only IND clubs
    expect(standings.length).toBe(indClubs.length);
    standings.forEach((row: any) => {
      const match = clubs.find(c => c.id === row.id || c.name === row.name);
      expect(match?.country).toBe('IND');
      expect(row.name).not.toContain('Schalke');
    });
  });
});
