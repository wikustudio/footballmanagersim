import { describe, it, expect } from 'vitest';
import {
  getBroadcastNetwork,
  generateProceduralModNetwork,
  KNOWN_BASE_COUNTRIES,
  BROADCAST_NETWORKS,
} from './broadcastNetworks';
import { getDomesticCupInfo } from '../data/gameConstants';

describe('Broadcast Networks Resolution & Scaling Engine', () => {
  describe('Mod Gating', () => {
    it('returns null strictly when isModActive is false across all nations, tiers, and cups', () => {
      expect(getBroadcastNetwork('GER', 'dfb', false, 1)).toBeNull();
      expect(getBroadcastNetwork('ENG', 'fa cup', false, 1)).toBeNull();
      expect(getBroadcastNetwork('ESP', 'copa del rey', false, 3)).toBeNull();
      expect(getBroadcastNetwork('GER', undefined, false, 3)).toBeNull();
      expect(getBroadcastNetwork('XYZ', undefined, false, 1)).toBeNull();
    });
  });

  describe('German Cup & Lower-Division Coverage', () => {
    it('resolves Tier 3 to MagentaSport (Telekom official 3. Liga rights holder)', () => {
      const net = getBroadcastNetwork('GER', undefined, true, 3);
      expect(net).not.toBeNull();
      expect(net?.id).toBe('magenta_sport');
      expect(net?.name).toBe('MagentaSport');
      expect(net?.renderType).toBe('magenta');
      expect(net?.tagline).toContain('3. LIGA');
    });

    it('resolves Tier 4 to authentic Regionalliga broadcasters (MDR, WDR, or Sport1)', () => {
      const netMdr = getBroadcastNetwork('GER', 'Regionalliga Nordost', true, 4);
      expect(netMdr?.id).toBe('mdr_sport');
      expect(netMdr?.renderType).toBe('mdr');

      const netWdr = getBroadcastNetwork('GER', 'Regionalliga West', true, 4);
      expect(netWdr?.id).toBe('wdr_sport');
      expect(netWdr?.renderType).toBe('wdr');

      const netGeneric = getBroadcastNetwork('GER', 'Regionalliga Bayern', true, 4);
      expect(['mdr_sport', 'wdr_sport', 'sport1']).toContain(netGeneric?.id);
    });

    it('resolves Tier 5+ (Oberliga / Grassroots) to Sporttotal.tv', () => {
      const netT5 = getBroadcastNetwork('GER', 'Oberliga', true, 5);
      expect(netT5?.id).toBe('sporttotal');
      expect(netT5?.renderType).toBe('sporttotal');
      expect(netT5?.name).toBe('Sporttotal.tv');

      const netT6 = getBroadcastNetwork('GER', 'Verbandsliga', true, 6);
      expect(netT6?.id).toBe('sporttotal');
    });

    it('rotates DFB-Pokal between ARD, ZDF, and Sky Sport', () => {
      const compVariants = ['dfb_round_1', 'dfb_round_2', 'dfb_pokal_qf', 'dfb_pokal_sf', 'dfb_pokal_final'];
      const resolved = new Set<string>();

      for (const comp of compVariants) {
        const net = getBroadcastNetwork('GER', comp, true, 1);
        expect(net).not.toBeNull();
        expect(['ard_sportschau', 'zdf_sportstudio', 'sky_sport']).toContain(net?.id);
        if (net) resolved.add(net.id);
      }

      // Check that at least 2 distinct German cup rights holders are hit across variants
      expect(resolved.size).toBeGreaterThanOrEqual(2);
    });

    it('strictly separates German regional cups from DFB-Pokal and SkySport', () => {
      const regionalVariants = [
        'reg',
        'reg Regional Cup',
        'Regional Cup',
        'Landespokal',
        'Verbandspokal',
        'Amateurpokal',
      ];

      for (const comp of regionalVariants) {
        const net = getBroadcastNetwork('GER', comp, true, 4);
        expect(net).not.toBeNull();
        // Must NEVER be Sky Sport or associate with DFB Pokal
        expect(net?.id).not.toBe('sky_sport');
        expect(net?.id).not.toBe('sky_bundesliga');
        expect(net?.id).not.toBe('ard_sportschau');
        expect(net?.id).not.toBe('zdf_sportstudio');
        expect(net?.tagline).not.toContain('DFB-POKAL');
        expect(net?.shortName.toLowerCase()).not.toContain('sky');

        // Must be an authentic regional / amateur cup network
        expect([
          'mdr_landespokal',
          'wdr_landespokal',
          'br_landespokal',
          'swr_landespokal',
          'sport1_landespokal',
          'sporttotal_landespokal',
        ]).toContain(net?.id);
      }
    });

    it('routes regional cup variants by geography (Nordost -> MDR, West -> WDR, Bayern -> BR, Südwest -> SWR)', () => {
      const mdrNet = getBroadcastNetwork('GER', 'Landespokal Nordost', true, 4);
      expect(mdrNet?.id).toBe('mdr_landespokal');
      expect(mdrNet?.tagline).toBe('LANDESPOKAL');

      const wdrNet = getBroadcastNetwork('GER', 'Landespokal West', true, 4);
      expect(wdrNet?.id).toBe('wdr_landespokal');
      expect(wdrNet?.tagline).toBe('LANDESPOKAL');

      const brNet = getBroadcastNetwork('GER', 'Landespokal Bayern', true, 4);
      expect(brNet?.id).toBe('br_landespokal');
      expect(brNet?.tagline).toBe('LANDESPOKAL');

      const swrNet = getBroadcastNetwork('GER', 'Landespokal Südwest', true, 4);
      expect(swrNet?.id).toBe('swr_landespokal');
      expect(swrNet?.tagline).toBe('LANDESPOKAL');
    });
  });

  describe('United Kingdom Cup & Lower-Division Coverage', () => {
    it('rotates FA Cup between BBC Sport and ITV Sport', () => {
      const net1 = getBroadcastNetwork('ENG', 'fa cup tie 1', true, 1);
      const net2 = getBroadcastNetwork('ENG', 'fa cup tie 2', true, 1);
      expect(['bbc_sport', 'itv_sport']).toContain(net1?.id);
      expect(['bbc_sport', 'itv_sport']).toContain(net2?.id);
    });

    it('resolves EFL Cup to Sky Sports Football', () => {
      const net = getBroadcastNetwork('ENG', 'efl', true, 1);
      expect(net?.id).toBe('sky_football');
    });

    it('resolves Tier 2, 3, and 4 (Championship, League One, League Two) to Sky Sports+', () => {
      const t2 = getBroadcastNetwork('ENG', undefined, true, 2);
      expect(t2?.id).toBe('sky_sports_plus');
      expect(t2?.renderType).toBe('sky_plus');

      const t3 = getBroadcastNetwork('ENG', undefined, true, 3);
      expect(t3?.id).toBe('sky_sports_plus');

      const t4 = getBroadcastNetwork('ENG', undefined, true, 4);
      expect(t4?.id).toBe('sky_sports_plus');
    });

    it('resolves Tier 5 to National League TV', () => {
      const t5 = getBroadcastNetwork('ENG', undefined, true, 5);
      expect(t5?.id).toBe('national_league_tv');
      expect(t5?.renderType).toBe('nationalleaguetv');
    });

    it('resolves Tier 6+ to grassroots GOAL.tv', () => {
      const t6 = getBroadcastNetwork('ENG', undefined, true, 6);
      expect(t6?.id).toBe('goal_tv');
    });
  });

  describe('European Cup & Lower Tiers (Spain, France, Italy)', () => {
    it('Spain: Tier 3 resolves to FEF TV, Copa del Rey rotates RTVE and Movistar', () => {
      const t3 = getBroadcastNetwork('ESP', undefined, true, 3);
      expect(t3?.id).toBe('fef_tv');
      expect(t3?.renderType).toBe('feftv');

      const cup1 = getBroadcastNetwork('ESP', 'copa del rey 1', true, 1);
      expect(['rtve', 'movistar_copa']).toContain(cup1?.id);
    });

    it('France: Tier 3 resolves to FFFtv, Coupe de France rotates France TV and beIN', () => {
      const t3 = getBroadcastNetwork('FRA', undefined, true, 3);
      expect(t3?.id).toBe('ffftv');
      expect(t3?.renderType).toBe('ffftv');

      const cup1 = getBroadcastNetwork('FRA', 'coupe de france 1', true, 1);
      expect(['france_tv', 'bein_france']).toContain(cup1?.id);
    });

    it('Italy: Tier 3 resolves to NOW / Sky Serie C, Coppa Italia rotates Mediaset and Rai Sport', () => {
      const t3 = getBroadcastNetwork('ITA', undefined, true, 3);
      expect(t3?.id).toBe('now_serie_c');
      expect(t3?.renderType).toBe('now');

      const cup1 = getBroadcastNetwork('ITA', 'coppa italia 1', true, 1);
      expect(['mediaset', 'rai_sport']).toContain(cup1?.id);
    });
  });

  describe('Latin American Cups (Argentina, Brazil, Mexico)', () => {
    it('Argentina: Copa Argentina rotates between TyC Sports and Telefe', () => {
      const cup1 = getBroadcastNetwork('ARG', 'copa argentina 1', true, 1);
      const cup2 = getBroadcastNetwork('ARG', 'copa argentina 2', true, 1);
      expect(['tyc_sports', 'telefe']).toContain(cup1?.id);
      expect(['tyc_sports', 'telefe']).toContain(cup2?.id);
    });

    it('Brazil: Copa do Brasil rotates between SporTV and TV Globo', () => {
      const cup1 = getBroadcastNetwork('BRA', 'copa do brasil 1', true, 1);
      expect(['sportv', 'globo']).toContain(cup1?.id);
    });

    it('Mexico: Copa MX rotates between TUDN and Azteca Deportes', () => {
      const cup1 = getBroadcastNetwork('MEX', 'copa mx 1', true, 1);
      expect(['tudn', 'azteca_deportes']).toContain(cup1?.id);
    });
  });

  describe('Procedural Generation for Arbitrary Mod Nations', () => {
    it('generates authentic procedural broadcast network for any custom mod country', () => {
      const custom1 = getBroadcastNetwork('ISL', undefined, true, 1);
      expect(custom1).not.toBeNull();
      expect(custom1?.id).toBe('mod_isl_t1');
      expect(custom1?.shortName).toBe('ISL SPORT');
      expect(custom1?.renderType).toBe('custom_mod');

      const customCup = getBroadcastNetwork('ISL', 'national cup', true, 1);
      expect(customCup).not.toBeNull();
      expect(customCup?.id).toBe('mod_isl_cup');
      expect(customCup?.tagline).toBe('NATIONAL CUP');

      const customT3 = getBroadcastNetwork('XYZ', undefined, true, 3);
      expect(customT3?.id).toBe('mod_xyz_t3');
      expect(customT3?.tagline).toBe('DIVISION 3');

      const customT4 = getBroadcastNetwork('CUSTOM_NATION', undefined, true, 4);
      expect(customT4?.tagline).toBe('REGIONAL LIVE');
    });

    it('direct procedural generator provides complete visual attributes', () => {
      const modNet = generateProceduralModNetwork('CYP', 2, false);
      expect(modNet.id).toBe('mod_cyp_t2');
      expect(modNet.accentColor).toBeTruthy();
      expect(modNet.badgeBg).toContain('bg-gradient-to-r');
      expect(modNet.borderColor).toBeTruthy();
      expect(modNet.textColor).toBe('#ffffff');
      expect(modNet.renderType).toBe('custom_mod');
    });
  });

  describe('Comprehensive Base Nations Coverage', () => {
    it('supports all 26+ known base countries without falling back to blank', () => {
      for (const country of KNOWN_BASE_COUNTRIES) {
        const leagueNet = getBroadcastNetwork(country, undefined, true, 1);
        expect(leagueNet, `Expected network for ${country}`).not.toBeNull();
        expect(leagueNet?.id).toBeTruthy();
        expect(leagueNet?.name).toBeTruthy();

        const cupNet = getBroadcastNetwork(country, 'cup', true, 1);
        expect(cupNet, `Expected cup network for ${country}`).not.toBeNull();
      }
    });
  });

  describe('Canadian Championship & Voyageurs Cup Broadcast Realism', () => {
    it('rotates Canadian Championship and Voyageurs Cup between OneSoccer and TSN with VOYAGEURS CUP tagline', () => {
      const net1 = getBroadcastNetwork('CAN', 'Voyageurs Cup', true, 1);
      expect(net1).not.toBeNull();
      expect(['onesoccer', 'tsn_can_cup']).toContain(net1?.id);
      expect(net1?.tagline).toBe('VOYAGEURS CUP');

      // Even if country is passed as 'USA' because Toronto FC / Vancouver / Montreal play in MLS:
      const torontoCupNet = getBroadcastNetwork('USA', 'Voyageurs Cup', true, 1);
      expect(torontoCupNet).not.toBeNull();
      expect(['onesoccer', 'tsn_can_cup']).toContain(torontoCupNet?.id);
      expect(torontoCupNet?.tagline).toBe('VOYAGEURS CUP');
      expect(torontoCupNet?.id).not.toBe('cbs_golazo');

      const montrealCupNet = getBroadcastNetwork('USA', 'Canadian Championship', true, 1);
      expect(['onesoccer', 'tsn_can_cup']).toContain(montrealCupNet?.id);
      expect(montrealCupNet?.tagline).toBe('VOYAGEURS CUP');

      // Regular USA clubs in U.S. Open Cup still receive CBS Golazo with U.S. OPEN CUP
      const usaCupNet = getBroadcastNetwork('USA', 'U.S. Open Cup', true, 1);
      expect(usaCupNet?.id).toBe('cbs_golazo');
      expect(usaCupNet?.tagline).toBe('U.S. OPEN CUP');
    });

    it('correctly identifies Canadian MLS clubs and returns Canadian flag and Voyageurs Cup', async () => {
      const { isCanadianMLSClub, getClubFlag, getDomesticCupInfo } = await import('../data/gameConstants');

      // Canadian MLS clubs
      expect(isCanadianMLSClub('Toronto FC', 1015, 'USA')).toBe(true);
      expect(isCanadianMLSClub('CF Montréal', 1008, 'USA')).toBe(true);
      expect(isCanadianMLSClub('Vancouver Whitecaps FC', 1030, 'USA')).toBe(true);
      expect(isCanadianMLSClub('Montreal CF')).toBe(true);

      // Flag checks
      expect(getClubFlag({ name: 'Toronto FC', id: 1015, country: 'USA' })).toBe('🇨🇦');
      expect(getClubFlag({ name: 'CF Montréal', id: 1008, country: 'USA' })).toBe('🇨🇦');
      expect(getClubFlag({ name: 'Vancouver Whitecaps FC', id: 1030, country: 'USA' })).toBe('🇨🇦');

      // American MLS clubs
      expect(isCanadianMLSClub('LA Galaxy', 1001, 'USA')).toBe(false);
      expect(getClubFlag({ name: 'LA Galaxy', id: 1001, country: 'USA' })).toBe('🇺🇸');

      // Cup check
      expect(getDomesticCupInfo('USA', 1, 'Toronto FC').name).toBe('Voyageurs Cup');
      expect(getDomesticCupInfo('USA', 1, 'CF Montréal').name).toBe('Voyageurs Cup');
      expect(getDomesticCupInfo('USA', 1, 'Vancouver Whitecaps FC').name).toBe('Voyageurs Cup');
      expect(getDomesticCupInfo('USA', 1, 'LA Galaxy').name).toBe('U.S. Open Cup');
    });
  });

  describe('USL & American Pyramid Broadcast Realism', () => {
    it('restricts Apple TV Season Pass to Tier 1 MLS and broadcasts USL on CBS Sports with ALL OF USL tagline', () => {
      // Tier 1 USA (Major League / MLS) gets Apple TV Season Pass
      const mlsNet = getBroadcastNetwork('USA', undefined, true, 1);
      expect(mlsNet?.id).toBe('apple_tv');
      expect(mlsNet?.tagline).toBe('SEASON PASS');

      const mlsDeciderNet = getBroadcastNetwork('USA', 'Decision Day', true, 1);
      expect(mlsDeciderNet?.id).toBe('apple_tv');
      expect(mlsDeciderNet?.tagline).toBe('SEASON PASS');

      // Tier 2 USA (USL Championship) gets CBS Sports with ALL OF USL
      const uslChampNet = getBroadcastNetwork('USA', undefined, true, 2);
      expect(uslChampNet?.id).toBe('cbs_usl');
      expect(uslChampNet?.tagline).toBe('ALL OF USL');
      expect(uslChampNet?.name).toBe('CBS Sports');

      // USL Championship Decider / Playoffs
      const uslDeciderNet = getBroadcastNetwork('USA', 'USL Championship Decider', true, 2);
      expect(uslDeciderNet?.id).toBe('cbs_usl');
      expect(uslDeciderNet?.tagline).toBe('ALL OF USL');

      const uslPlayoffNet = getBroadcastNetwork('USA', 'playoff', true, 2);
      expect(uslPlayoffNet?.id).toBe('cbs_usl');
      expect(uslPlayoffNet?.tagline).toBe('ALL OF USL');

      // Tier 3 USA (USL League One) gets CBS Sports with ALL OF USL
      const usl1Net = getBroadcastNetwork('USA', undefined, true, 3);
      expect(usl1Net?.id).toBe('cbs_usl');
      expect(usl1Net?.tagline).toBe('ALL OF USL');

      const uslQueryNet = getBroadcastNetwork('USA', 'usl decider', true);
      expect(uslQueryNet?.id).toBe('cbs_usl');
      expect(uslQueryNet?.tagline).toBe('ALL OF USL');

      // US Open Cup matches in USA still receive CBS Golazo with U.S. OPEN CUP
      const cupNet = getBroadcastNetwork('USA', 'U.S. Open Cup', true, 2);
      expect(cupNet?.id).toBe('cbs_golazo');
      expect(cupNet?.tagline).toBe('U.S. OPEN CUP');
    });

    it('corrects continental North American Champions Cup to use CHAMPIONS CUP tagline instead of U.S. OPEN CUP', () => {
      const clNet = getBroadcastNetwork('USA', 'cl North American Champions Cup', true, 1);
      expect(clNet?.id).toBe('cbs_continental');
      expect(clNet?.shortName).toBe('CBS GOLAZO');
      expect(clNet?.tagline).toBe('CHAMPIONS CUP');
      expect(clNet?.tagline).not.toBe('U.S. OPEN CUP');

      const crownNet = getBroadcastNetwork('USA', 'cl North American Crown', true, 1);
      expect(crownNet?.id).toBe('cbs_continental');
      expect(crownNet?.tagline).toBe('CHAMPIONS CUP');

      const concacafEl = getBroadcastNetwork('USA', 'el Americas Cup', true, 1);
      expect(concacafEl?.id).toBe('cbs_continental');
      expect(concacafEl?.tagline).toBe('CHAMPIONS CUP');
    });

    it('reliably routes unmodded and modded Canadian clubs to Voyageurs Cup on OneSoccer/TSN', () => {
      expect(getDomesticCupInfo('USA', 1, 'Toronto Red', 1015).name).toBe('Voyageurs Cup');
      expect(getDomesticCupInfo('USA', 1, 'Montreal Blue', 1008).name).toBe('Voyageurs Cup');
      expect(getDomesticCupInfo('USA', 1, 'Vancouver White', 1030).name).toBe('Voyageurs Cup');

      const canCupNet = getBroadcastNetwork('CAN', 'Voyageurs Cup', true, 1);
      expect(canCupNet?.tagline).toBe('VOYAGEURS CUP');
      expect(['onesoccer', 'tsn_can_cup']).toContain(canCupNet?.id);
    });

    it('routes Leagues Cup to Apple TV with LEAGUES CUP tagline for both USA and CAN clubs', () => {
      // US club in Leagues Cup
      const usLeaguesCup = getBroadcastNetwork('USA', 'el Leagues Challenge', true, 1);
      expect(usLeaguesCup?.id).toBe('apple_tv_leagues_cup');
      expect(usLeaguesCup?.name).toBe('Apple TV');
      expect(usLeaguesCup?.shortName).toBe(' tv');
      expect(usLeaguesCup?.tagline).toBe('LEAGUES CUP');
      expect(usLeaguesCup?.tagline).not.toBe('CHAMPIONS CUP');
      expect(usLeaguesCup?.tagline).not.toBe('U.S. OPEN CUP');

      const usDirectLeagues = getBroadcastNetwork('USA', 'Leagues Cup', true, 1);
      expect(usDirectLeagues?.id).toBe('apple_tv_leagues_cup');
      expect(usDirectLeagues?.tagline).toBe('LEAGUES CUP');

      // Canadian club in Leagues Cup
      const canLeaguesCup = getBroadcastNetwork('CAN', 'el Leagues Challenge', true, 1);
      expect(canLeaguesCup?.id).toBe('apple_tv_leagues_cup');
      expect(canLeaguesCup?.tagline).toBe('LEAGUES CUP');

      const canDirectLeagues = getBroadcastNetwork('CAN', 'Leagues Cup Final', true, 1);
      expect(canDirectLeagues?.id).toBe('apple_tv_leagues_cup');
      expect(canDirectLeagues?.tagline).toBe('LEAGUES CUP');
    });
  });
});
