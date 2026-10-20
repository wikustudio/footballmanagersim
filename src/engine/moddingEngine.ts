import { Club } from '../types';
import { ALL_CLUBS } from '../data/clubsData';
import { TEAMS } from '../mod-data/teams';
import { getStartingBudget, normalizeCountryCode, getCountryMult, isReserveClub } from '../data/gameConstants';
import { registerCustomModCurrencies } from '../utils/currencyHelpers';

export interface CustomDbValidationResult {
  valid: boolean;
  clubs?: Club[];
  count?: number;
  error?: string;
  matchedCount?: number;
  customClubsAdded?: number;
}

// Cached instance of the unofficial third-party community mod: "CR27_Footy Real Name Pack" (authored by CR27_Footy, not affiliated with Football Manager Sim)
let cachedBaseModClubs: Club[] | null = null;

export const getBaseModClubs = (): Club[] => {
  if (cachedBaseModClubs) return cachedBaseModClubs;
  const res = normalizeAndValidateCustomDb(TEAMS);
  if (res.valid && res.clubs && res.clubs.length > 0) {
    cachedBaseModClubs = res.clubs;
    return res.clubs;
  }
  return ALL_CLUBS;
};

export const getSafeDefaultClubs = (): Club[] => {
  return ALL_CLUBS.map(c => ({
    id: c.id,
    name: c.name,
    tier: c.tier,
    baseOvr: c.baseOvr,
    color: c.color,
    stadium: c.stadium,
    country: c.country,
    rep: c.rep,
    fanBase: c.fanBase,
    currentBudget: c.currentBudget,
    logo: undefined,
    fallbackLogo: undefined,
    narrative: undefined,
    historicContext: undefined,
    isReserve: c.isReserve
  }));
};

export const TIER_BUDGET_LIMITS: Record<number, { min: number; max: number; default: number }> = {
  1: { min: 3000, max: 250000, default: 30000 },   // €3M to €250M (standard ~€30M)
  2: { min: 800, max: 60000, default: 8000 },      // €800K to €60M (standard ~€8M)
  3: { min: 250, max: 15000, default: 2500 },      // €250K to €15M (standard ~€2.5M)
  4: { min: 80, max: 4000, default: 800 },         // €80K to €4M (standard ~€800K)
  5: { min: 25, max: 1500, default: 250 },         // €25K to €1.5M (standard ~€250K)
  6: { min: 10, max: 600, default: 120 },          // €10K to €600K (standard ~€120K)
  7: { min: 5, max: 300, default: 60 },            // €5K to €300K (standard ~€60K)
  8: { min: 5, max: 200, default: 40 },            // €5K to €200K (standard ~€40K)
  9: { min: 2, max: 150, default: 30 },            // €2K to €150K (standard ~€30K)
  10: { min: 1, max: 100, default: 20 },           // €1K to €100K (standard ~€20K)
  11: { min: 1, max: 50, default: 10 },            // €1K to €50K (standard ~€10K)
};

/**
 * Robustly normalizes any custom budget format, string delimiter mistype, currency abbreviation,
 * or raw full-euro sums into game engine units (thousands of Euros).
 * Handles string currency symbols (€, $, £, etc.), multi-language suffixes (M, Mio, k, tsd, Bn, etc.),
 * scientific notation, Swiss/European/American number formatting, object/array wrappers,
 * and enforces strict tier-based economic boundaries so the simulation economy is always intact.
 */
export const parseAndNormalizeModBudget = (
  rawBudget: any,
  tier: number = 1,
  country: string = 'GER'
): number => {
  const safeTier = Math.max(1, Math.min(11, Math.round(tier || 1)));
  const tierConfig = TIER_BUDGET_LIMITS[safeTier] || { min: 1, max: 50, default: 10 };
  const fallback = getStartingBudget(safeTier, country) || tierConfig.default;

  if (rawBudget == null || rawBudget === false || rawBudget === true || rawBudget === '') {
    return fallback;
  }

  // 1. Unwrap object or array wrappers (e.g. { budget: 18880000 }, [ 18880000 ])
  let candidate = rawBudget;
  if (Array.isArray(candidate) && candidate.length > 0) {
    candidate = candidate[0];
  }
  if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
    candidate = candidate.currentBudget ?? candidate.budget ?? candidate.amount ?? candidate.value ?? candidate.funds ?? candidate.eur ?? candidate.val;
  }

  if (candidate == null || candidate === false || candidate === true || candidate === '') {
    return fallback;
  }

  let parsed: number | null = null;
  let isBillion = false;
  let isMillion = false;
  let isThousand = false;

  if (typeof candidate === 'number') {
    if (isNaN(candidate) || !isFinite(candidate) || candidate <= 0) {
      return fallback;
    }
    parsed = candidate;
  } else {
    let s = String(candidate).trim();
    if (!s) return fallback;

    // Check invalid non-numeric sentinel words
    const lower = s.toLowerCase();
    if (/^(nan|null|undefined|n\/?a|none|tbd|unknown|default|standard|free|zero|\?|-+|—+)$/i.test(lower)) {
      return fallback;
    }

    // Check scientific notation first (e.g. 1.888e7)
    if (/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)$/.test(s)) {
      const sci = parseFloat(s);
      if (isNaN(sci) || !isFinite(sci) || sci <= 0) return fallback;
      parsed = sci;
    } else {
      // Detect suffixes (prioritize longer phrases first)
      isBillion = /\b(milliarden|milliarde|billionen|billion|billions|mrd\.|mrd|bn|b)\b/i.test(s) || /[\d.,]\s*(b|bn|mrd)\b/i.test(s);
      isMillion = /\b(millionen|million|millions|mill|mio\.|mio|mln|mm|m)\b/i.test(s) || /[\d.,]\s*(m|mio|mln|mm)\b/i.test(s);
      isThousand = /\b(tausend|thousand|thousands|tsd\.|tsd|k€|keur|th|k)\b/i.test(s) || /[\d.,]\s*(k|tsd)\b/i.test(s);

      // Strip suffix words and potential abbreviation dots
      s = s
        .replace(/^[~><+≈\s]+/g, '')
        .replace(/\b(approx|approx\.|ca|ca\.|eur|euro|euros|usd|gbp|chf)\b\.?/gi, '')
        .replace(/\b(milliarden|milliarde|billionen|billion|billions|mrd|bn|b)\b\.?/gi, '')
        .replace(/\b(millionen|million|millions|mill|mio|mln|mm|m)\b\.?/gi, '')
        .replace(/\b(tausend|thousand|thousands|tsd|k€|keur|th|k)\b\.?/gi, '')
        .replace(/[€$£¥]/g, '')
        .replace(/[\s\u00A0\u202F'_]/g, '')
        .replace(/,[-–—]+$/, '') // e.g. 50.000,-
        .replace(/[a-zA-Z]/g, '') // remove remaining letters
        .replace(/\.+$/, '') // strip any trailing period from abbreviations
        .replace(/([.,]){2,}/g, '$1'); // collapse duplicate punctuation like .. or ,,

      if (!s) return fallback;

      // Handle punctuation
      const hasDot = s.includes('.');
      const hasComma = s.includes(',');

      if (hasDot && hasComma) {
        const lastDot = s.lastIndexOf('.');
        const lastComma = s.lastIndexOf(',');
        if (lastComma > lastDot) {
          // European: 18.880.000,50 -> comma is decimal
          s = s.replace(/\./g, '').replace(',', '.');
        } else {
          // American: 18,880,000.50 -> dot is decimal
          s = s.replace(/,/g, '');
        }
      } else if (hasDot) {
        const parts = s.split('.');
        if (parts.length > 2) {
          // Multiple dots: e.g. 18.880.000 -> European thousand separator
          s = s.replace(/\./g, '');
        } else if (parts.length === 2) {
          if (isMillion || isBillion || isThousand) {
            // With suffix (18.88M or 1.5M), dot is always decimal
          } else if (parts[1].length === 3) {
            // e.g. 18.880 without suffix -> European thousand separator
            s = s.replace('.', '');
          }
        }
      } else if (hasComma) {
        const parts = s.split(',');
        if (parts.length > 2) {
          // Multiple commas: e.g. 18,880,000 -> US thousand separator
          s = s.replace(/,/g, '');
        } else if (parts.length === 2) {
          if (isMillion || isBillion || isThousand) {
            // With suffix (18,88 Mio), comma is decimal
            s = s.replace(',', '.');
          } else if (parts[1].length === 3) {
            // e.g. 18,880 without suffix -> thousand separator
            s = s.replace(',', '');
          } else {
            // e.g. 18,88 or 1,5 -> decimal comma
            s = s.replace(',', '.');
          }
        }
      }

      const n = parseFloat(s);
      if (isNaN(n) || !isFinite(n) || n <= 0) return fallback;

      if (isBillion) {
        parsed = n * 1000000;
      } else if (isMillion) {
        parsed = n * 1000;
      } else if (isThousand) {
        parsed = n;
      } else {
        parsed = n;
      }
    }
  }

  if (parsed == null || isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  let normalized = parsed;

  // If no suffix was provided, convert full Euros to in-engine thousands (K)
  if (!isBillion && !isMillion && !isThousand) {
    // 1. Full Euro sums >= 1,000,000 are full Euros across all tiers (e.g. 18,880,000 -> 18,880)
    if (normalized >= 1000000) {
      normalized = normalized / 1000;
    }
    // 2. Full Euro sums >= 100,000 are full Euros across all tiers (e.g. 120,000 -> 120)
    else if (normalized >= 100000) {
      normalized = normalized / 1000;
    }
    // 3. For amateur / lower tiers (Tier 6-11), max engine budget is 600K.
    // Any raw value >= 1,000 is full Euros (e.g. 18,880 or 50,000 -> 18.88K or 50K)
    else if (safeTier >= 6 && normalized >= 1000) {
      normalized = normalized / 1000;
    }
    // 4. For semi-pro tiers (Tier 4-5), any raw value >= 25,000 is full Euros
    else if (safeTier >= 4 && normalized >= 25000) {
      normalized = normalized / 1000;
    }
    // 5. For Tier 1-3, detect shorthand millions (e.g. 30 meaning €30M for Tier 1, 8 meaning €8M for Tier 2)
    else if (safeTier === 1 && normalized > 0 && normalized <= 300) {
      normalized = normalized * 1000;
    } else if (safeTier === 2 && normalized > 0 && normalized <= 60) {
      normalized = normalized * 1000;
    } else if (safeTier === 3 && normalized > 0 && normalized <= 15) {
      normalized = normalized * 1000;
    } else if (safeTier === 4 && normalized > 0 && normalized <= 4) {
      normalized = normalized * 1000;
    }
  }

  // Country-aware starting budget bounds:
  // Argentine clubs in real life operate with $3M-$6M in cash (Vélez, Racing, Independiente)
  // and up to $7.5M-$8M for Boca/River, preventing astronomical starting balance sheets.
  const cMult = getCountryMult(country);
  let minAllowed = tierConfig.min;
  let maxAllowed = tierConfig.max;

  if (country === 'ARG') {
    if (safeTier === 1) {
      maxAllowed = 12000; // $12M max starting cash in Argentina Primera
      minAllowed = 1500;  // $1.5M min starting cash in Argentina Primera
    } else if (safeTier === 2) {
      maxAllowed = 4000;  // $4M max starting cash in Primera Nacional
      minAllowed = 400;
    } else {
      maxAllowed = Math.round(tierConfig.max * 0.25);
      minAllowed = Math.max(1, Math.round(tierConfig.min * 0.25));
    }
  } else if (cMult < 0.20) {
    maxAllowed = Math.max(tierConfig.min * 2, Math.round(tierConfig.max * Math.max(0.10, cMult)));
    minAllowed = Math.max(1, Math.round(tierConfig.min * Math.max(0.20, cMult)));
  }

  // Final economic safeguard: clamp strictly between tier minimum and tier maximum
  return Math.max(minAllowed, Math.min(maxAllowed, Math.round(normalized)));
};

// Comprehensive real-world alias map to ensure original club data JSONs match effortlessly
// even if users use varying spelling, languages (German/English), or common abbreviations.
export const REAL_CLUB_ALIASES: Record<string, number> = {
  // Germany Tier 1
  'fc bayern münchen': 1,
  'fc bayern munich': 1,
  'bayern münchen': 1,
  'bayern munich': 1,
  'fc bayern': 1,
  'bayern': 1,
  'bavaria münchen': 1,

  'bayer 04 leverkusen': 2,
  'bayer leverkusen': 2,
  'sv leverkusen 04': 2,
  'leverkusen': 2,
  'b04': 2,

  'borussia dortmund': 3,
  'bvb 09': 3,
  'bvb': 3,
  'dortmund': 3,
  'prussia dortmund': 3,
  'b. dortmund': 3,
  'b dortmund': 3,
  'bvb borussia dortmund': 3,
  'bvb dortmund': 3,

  'rb leipzig': 4,
  'rasenballsport leipzig': 4,
  'fc rasen leipzig': 4,
  'leipzig': 4,

  'vfb stuttgart': 5,
  'vfl stuttgart': 5,
  'stuttgart': 5,

  'eintracht frankfurt': 6,
  'concordia frankfurt': 6,
  'frankfurt': 6,
  'sge': 6,

  'sc freiburg': 7,
  'breisgau freiburg': 7,
  'freiburg': 7,

  'tsg 1899 hoffenheim': 8,
  'tsg hoffenheim': 8,
  'kraichgau hoffenheim': 8,
  'hoffenheim': 8,

  'sv werder bremen': 10,
  'werder bremen': 10,
  'weser bremen': 10,
  'bremen': 10,

  'fc augsburg': 11,
  'schwaben augsburg': 11,
  'augsburg': 11,
  'fca': 11,

  'vfl wolfsburg': 12,
  'sv wolfsburg': 12,
  'wolfsburg': 12,

  '1. fsv mainz 05': 13,
  'fsv mainz 05': 13,
  'mainz 05': 13,
  'mainz': 13,

  'borussia mönchengladbach': 14,
  'borussia moenchengladbach': 14,
  'mönchengladbach': 14,
  'gladbach': 14,
  'bmg': 14,
  'prussia mönchengladbach': 14,

  '1. fc union berlin': 15,
  'union berlin': 15,
  'eisern köpenick': 15,
  'eisern koepenick': 15,

  '1. fc köln': 19,
  '1. fc koeln': 19,
  'fc köln': 19,
  'köln': 19,
  'cologne': 19,
  'domstadt köln': 19,

  'hamburger sv': 22,
  'hsv': 22,
  'hanseat hamburg': 22,

  'sc paderborn 07': 25,
  'sc paderborn': 25,
  'paderborn': 25,

  'fc schalke 04': 28,
  'schalke 04': 28,
  'schalke': 28,
  's04': 28,
  'knappen gelsenkirchen': 28,

  // Germany Tier 2 & Lower
  'vfl bochum': 16,
  'vfl bochum 1848': 16,
  'sc bochum 1848': 16,
  'bochum': 16,

  '1. fc heidenheim': 9,
  '1. fc heidenheim 1846': 9,
  'ostalb heidenheim': 9,
  'heidenheim': 9,

  'sv 07 elversberg': 29,
  'sv elversberg': 29,
  'sv spiesen-elversberg': 29,
  'elversberg': 29,

  'karlsruher sc': 23,
  'ksc': 23,
  'baden karlsruhe': 23,
  'karlsruhe': 23,

  'fc st. pauli': 17,
  'fc st pauli': 17,
  'st. pauli': 17,
  'st pauli': 17,
  'kiez hamburg st. pauli': 17,

  'sv darmstadt 98': 20,
  'darmstadt 98': 20,
  'lilien darmstadt': 20,
  'darmstadt': 20,

  'holstein kiel': 18,
  'förde kiel': 18,
  'foerde kiel': 18,
  'kiel': 18,

  'hertha bsc': 27,
  'hertha berlin': 27,
  'hertha': 27,
  'spree berlin west': 27,

  'hannover 96': 24,
  'sv hannover 96': 24,
  'hannover': 24,

  'spvgg greuther fürth': 26,
  'greuther fürth': 26,
  'greuther fuerth': 26,
  'kleeblatt fürth': 26,
  'fürth': 26,

  '1. fc nürnberg': 30,
  '1. fc nuernberg': 30,
  'fc nürnberg': 30,
  'franken nürnberg': 30,
  'nürnberg': 30,
  'fcn': 30,

  '1. fc kaiserslautern': 31,
  'fc kaiserslautern': 31,
  'kaiserslautern': 31,
  'pfalz kaiserslautern': 31,
  'fck': 31,

  '1. fc magdeburg': 32,
  'fc magdeburg': 32,
  'fc elbe magdeburg': 32,
  'magdeburg': 32,
  'fcm': 32,

  'eintracht braunschweig': 33,
  'löwen braunschweig': 33,
  'braunschweig': 33,

  'vfl osnabrück': 40,
  'vfb osnabrück': 40,
  'osnabrück': 40,

  'sg dynamo dresden': 43,
  'dynamo dresden': 43,
  'saxonia dresden': 43,
  'dresden': 43,

  'arminia bielefeld': 46,
  'dsc arminia bielefeld': 46,
  'westphalia bielefeld': 46,
  'bielefeld': 46,

  'energie cottbus': 47,
  'fc energie cottbus': 47,
  'lausitz cottbus': 47,
  'cottbus': 47,

  'fortuna düsseldorf': 21,
  'fortuna duesseldorf': 21,
  'rhine düsseldorf 95': 21,
  'düsseldorf': 21,
  'f95': 21,

  'ssv jahn regensburg': 36,
  'jahn regensburg': 36,
  'donau regensburg': 36,
  'regensburg': 36,

  'sc preußen münster': 35,
  'preussen münster': 35,
  'prussia münster 06': 35,
  'münster': 35,

  'fc hansa rostock': 41,
  'hansa rostock': 41,
  'ostsee rostock': 41,
  'rostock': 41,

  'rot-weiss essen': 44,
  'rot-weiß essen': 44,
  'r-w essen bergeborbeck': 44,
  'rwe': 44,

  'sv wehen wiesbaden': 42,
  'wehen wiesbaden': 42,
  'taunus wiesbaden': 42,
  'wiesbaden': 42,

  'alemannia aachen': 48,
  'kaiserstadt aachen': 48,
  'aachen': 48,

  'sv waldhof mannheim': 52,
  'waldhof mannheim': 52,
  'neckar mannheim': 52,
  'mannheim': 52,

  'vfr mannheim': 129,
  'vfr mannheim ost': 129,
  'mannheim ost': 129,

  '1. fc saarbrücken': 55,
  'saarbrücken': 55,
  'saarland saarbrücken': 55,
  'fcs': 55,

  'fc ingolstadt 04': 51,
  'fc ingolstadt': 51,
  'schanzer ingolstadt': 51,
  'ingolstadt': 51,

  'sc verl': 53,
  'post verl': 53,
  'verl': 53,

  'ssv ulm 1846': 34,
  'ssv ulm': 34,
  'münsterstadt ulm': 34,
  'ulm': 34,

  'msv duisburg': 92,
  'zebra duisburg': 92,
  'duisburg': 92,

  'tsv 1860 münchen': 45,
  'tsv 1860 muenchen': 45,
  '1860 münchen': 45,
  '1860 muenchen': 45,
  'münchen sechzig': 45,
  'muenchen sechzig': 45,
  'sechzig': 45,

  'djk vilzing': 80,
  'vilzing': 80,
  'huthgarten vilzing': 80,

  'sv sandhausen': 49,
  'sandhausen': 49,
  'hardtwald sandhausen': 49,

  'hessen wiesbaden': 42,
  'duesseldorf': 21,
  'rhine duesseldorf 95': 21,

  'tsv schwaben augsburg': 185,

  // German Reserve Teams
  'borussia dortmund ii': 37,
  'borussia dortmund 2': 37,
  'borussia dortmund ii res.': 37,
  'borussia dortmund ii res': 37,
  'b. dortmund ii': 37,
  'b. dortmund 2': 37,
  'b. dortmund ii res.': 37,
  'b dortmund ii': 37,
  'b dortmund 2': 37,
  'b dortmund ii res.': 37,
  'prussia dortmund ii': 37,
  'prussia dortmund 2': 37,
  'prussia dortmund ii res.': 37,
  'prussia dortmund ii res': 37,
  'dortmund ii': 37,
  'dortmund 2': 37,
  'dortmund ii res.': 37,
  'bvb ii': 37,
  'bvb 2': 37,
  'bvb 09 ii': 37,
  'bvb 09 2': 37,

  'fc bayern münchen ii': 115,
  'fc bayern muenchen ii': 115,
  'bayern münchen ii': 115,
  'bayern muenchen ii': 115,
  'bayern ii': 115,
  'bavaria münchen ii': 115,
  'bavaria muenchen ii': 115,

  'vfb stuttgart ii': 39,
  'vfl stuttgart ii': 39,
  'stuttgart ii': 39,
  'neckar stuttgart ii': 39,

  'sv hannover 96 ii': 38,
  'hannover 96 ii': 38,
  'hannover ii': 38,

  'borussia mönchengladbach ii': 106,
  'borussia moenchengladbach ii': 106,
  'mönchengladbach ii': 106,
  'moenchengladbach ii': 106,
  'gladbach ii': 106,
  'prussia mönchengladbach ii': 106,
  'prussia moenchengladbach ii': 106,

  'sc preußen münster ii': 168,
  'sc preussen münster ii': 168,
  'prussia münster ii': 168,
  'münster ii': 168,

  'hertha bsc ii': 99,
  'hertha ii': 99,
  'spree berlin west ii': 99,

  '1. fc köln ii': 105,
  '1. fc koeln ii': 105,
  'fc köln ii': 105,
  'köln ii': 105,
  'domstadt köln ii': 105,

  'fc schalke 04 ii': 107,
  'schalke ii': 107,
  'knappen gelsenkirchen ii': 107,

  'fortuna düsseldorf ii': 108,
  'fortuna duesseldorf ii': 108,
  'düsseldorf ii': 108,
  'rhine düsseldorf ii': 108,

  'sc paderborn 07 ii': 109,
  'sc paderborn ii': 109,
  'paderborn ii': 109,

  '1. fsv mainz 05 ii': 112,
  'fsv mainz 05 ii': 112,
  'mainz ii': 112,

  'eintracht frankfurt ii': 113,
  'frankfurt ii': 113,
  'concordia frankfurt ii': 113,

  'fc augsburg ii': 116,
  'augsburg ii': 116,
  'schwaben augsburg ii': 116,

  '1. fc nürnberg ii': 117,
  '1. fc nuernberg ii': 117,
  'nürnberg ii': 117,
  'franken nürnberg ii': 117,

  '1. fc magdeburg ii': 91,
  'magdeburg ii': 91,
  'fc elbe magdeburg ii': 91,

  'vfb lübeck ii': 100,
  'vfb luebeck ii': 100,
  'lübeck ii': 100,
  'trave lübeck ii': 100,

  'tsv 1860 münchen ii': 81,
  '1860 münchen ii': 81,
  'münchen sechzig ii': 81,

  // German Lower Tier / Amateur
  'asc 09 dortmund': 166,
  'dortmund west 08': 166,

  // Spain Tier 1
  'real madrid cf': 501,
  'real madrid': 501,
  'madrid blanco': 501,
  'madrid white': 501,
  'los blancos': 501,

  'fc barcelona': 502,
  'barcelona': 502,
  'barca': 502,
  'barça': 502,
  'blaugrana': 502,

  'atlético de madrid': 503,
  'atletico de madrid': 503,
  'atlético madrid': 503,
  'atletico madrid': 503,
  'madrid rojo y blanco': 503,
  'madrid rojiblanco': 503,
  'madrid red': 503,
  'atleti': 503,
  'los colchoneros': 503,
  'colchoneros': 503,

  'athletic club': 504,
  'athletic bilbao': 504,
  'bilbao': 504,

  'real sociedad': 505,
  'san sebastian': 505,

  'villarreal cf': 506,
  'villarreal': 506,

  'real betis': 507,
  'sevilla verde': 507,

  'sevilla fc': 508,
  'sevilla': 508,
  'sevilla rojo': 508,

  'valencia cf': 509,
  'valencia': 509,

  // Spain Tier 1 & 2
  'real valladolid': 517,
  'real valladolid cf': 517,
  'valladolid': 517,
  'cd leganés': 518,
  'cd leganes': 518,
  'leganés': 518,
  'leganes': 518,
  'rcd espanyol': 514,
  'espanyol': 514,
  'barcelona azul y blanco': 514,
  'cádiz cf': 523,
  'cadiz cf': 523,
  'cádiz': 523,
  'cadiz': 523,
  'ud almería': 522,
  'ud almeria': 522,
  'almería': 522,
  'almeria': 522,
  'granada cf': 521,
  'granada': 521,
  'rc deportivo la coruña': 537,
  'deportivo la coruña': 537,
  'deportivo la coruna': 537,
  'deportivo': 537,
  'la coruña': 537,
  'la coruna': 537,

  // Italy Tier 1 & 2
  'parma calcio 1913': 914,
  'parma calcio': 914,
  'parma': 914,
  'parma crociato': 914,
  'como 1907': 919,
  'como': 919,
  'como lariano': 919,
  'venezia fc': 920,
  'venezia': 920,
  'venezia arancioneroverde': 920,
  'frosinone calcio': 931,
  'frosinone': 931,
  'frosinone gialloazzurro': 931,
  'us sassuolo calcio': 921,
  'us sassuolo': 921,
  'sassuolo': 921,
  'sassuolo neroverde': 921,
  'us salernitana 1919': 925,
  'us salernitana': 925,
  'salernitana': 925,
  'salerno granata': 925,
  'atalanta bc': 905,
  'atalanta': 905,
  'bergamo nerazzurro': 905,

  // England Tier 1 & 2
  'manchester city': 701,
  'manchester blue': 701,
  'man city': 701,
  'mcfc': 701,
  'leicester city': 719,
  'leicester': 719,
  'ipswich town': 718,
  'ipswich': 718,
  'southampton': 720,
  'southampton fc': 720,
  'luton town': 724,
  'luton': 724,
  'burnley': 722,
  'burnley fc': 722,
  'sheffield united': 723,
  'sheffield utd': 723,
  'sheffield red': 723,
  'portsmouth': 743,
  'portsmouth fc': 743,
  'derby county': 741,
  'derby': 741,
  'oxford united': 742,
  'oxford': 742,
  'birmingham city': 737,
  'birmingham blue': 737,
  'birmingham': 737,
  'huddersfield town': 746,
  'huddersfield': 746,
  'rotherham united': 754,
  'rotherham': 754,

  // France Tier 1 & 2
  'aj auxerre': 415,
  'auxerre': 415,
  'angers sco': 416,
  'angers': 416,
  'as saint-étienne': 419,
  'as saint-etienne': 419,
  'saint-étienne': 419,
  'saint-etienne': 419,
  'fc metz': 420,
  'metz': 420,
  'fc lorient': 421,
  'lorient': 421,
  'clermont foot': 422,
  'clermont': 422,
  'girondins de bordeaux': 425,
  'bordeaux': 425,

  // Continental & International Champions
  'olympiacos fc': 3601,
  'olympiacos': 3601,
  'piraeus red': 3601,
  'piraeus': 3601,
  'fluminense fc': 1404,
  'fluminense': 1404,
  'rio flu': 1404,
  'ldu quito': 851,
  'quito blanca': 851,
  'cf pachuca': 2207,
  'pachuca': 2207,
  'columbus crew': 1005,
  'columbus yellow': 1005,
  'austin fc': 1028,
  'austin green': 1028,
  'austin bold fc': 1016,
  'paris saint-germain': 401,
  'paris': 401,
  'paris fc': 418,
  'paris charléty': 418,
  'vitória s.c.': 205,
  'vitória sc': 205,
  'vitória de guimarães': 205,
  'guimarães branco': 205,
  'vitória f.c.': 255,
  'vitória fc': 255,
  'vitória de setúbal': 255,
  'setúbal': 255,
  'urawa red diamonds': 2004,
  'urawa': 2004
};

// Clean club name for comparison: strip punctuation, extra spaces, and common prefixes/suffixes
export const simplifyClubName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\b(1\s*fc|fc|sc|sv|vfl|vfb|vfr|tsv|fsv|ssv|spvgg|dsc|sg|bv|bvb|e\.v|ev)\b/g, '')
    .replace(/\b(04|05|06|07|09|96|98|1848|1846|1860|1899|1900)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Normalize logo URLs (converts Wikipedia File / Datei pages to raw direct image links)
export const sanitizeLogoUrl = (url: any): string | undefined => {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Handle Wikipedia File / Datei pages
  if (trimmed.includes('wikipedia.org/wiki/File:') || trimmed.includes('wikipedia.org/wiki/Datei:')) {
    const fileName = trimmed.split(/wiki\/(?:File|Datei):/)[1]?.split(/[?#]/)[0];
    if (fileName) {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}`;
    }
  }

  return trimmed;
};

/**
 * Normalizes, validates, and merges user-uploaded custom mod data.
 * Supports:
 * - Direct club array: `[...]`
 * - Object wrappers: `{ clubs: [...] }`, `{ teams: [...] }`, `{ data: [...] }`, `{ database: [...] }`
 * - Keyed dictionary: `{ "1": { ... }, "2": { ... } }` or `{ "fc_bayern": { ... } }`
 * - Logo fields: `logo`, `crest`, `badge`, `icon`, `logoUrl`, `imageUrl`, `image`, `clubLogo`, `url`
 * - Preserves all existing competition dependencies and IDs while applying original real names and logos!
 */
export const normalizeAndValidateCustomDb = (data: any): CustomDbValidationResult => {
  if (!data) return { valid: false, error: 'Empty file.' };

  let rawList: any[] = [];
  if (Array.isArray(data)) {
    rawList = data;
  } else if (typeof data === 'object') {
    if (Array.isArray(data.clubs)) rawList = data.clubs;
    else if (Array.isArray(data.teams)) rawList = data.teams;
    else if (Array.isArray(data.data)) rawList = data.data;
    else if (Array.isArray(data.database)) rawList = data.database;
    else if (Array.isArray(data.custom_db)) rawList = data.custom_db;
    else if (Array.isArray(data.items)) rawList = data.items;
    else if (Array.isArray(data.results)) rawList = data.results;
    else {
      // Keyed dictionary / map format (filter to isolate club objects and ignore top-level metadata)
      const values = Object.values(data).filter(v => typeof v === 'object' && v !== null);
      if (values.length > 0) {
        rawList = values as any[];
      }
    }
  }

  if (!rawList || rawList.length === 0) {
    return {
      valid: false,
      error: 'JSON must contain a list of clubs (e.g. array [...] or { "clubs": [...] }).'
    };
  }

  const sanitized: Array<{
    item: any;
    id?: number;
    name: string;
    tier?: number;
    baseOvr?: number;
    color?: string;
    stadium?: number;
    country?: string;
    rep?: number;
    fanBase?: number;
    currentBudget?: number;
    currency?: string;
    logo?: string;
    fallbackLogo?: string;
    isReserve?: boolean;
    narrative?: string;
    historicContext?: string;
  }> = [];

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    if (!item || typeof item !== 'object') continue;

    const name = String(
      item.name || item.clubName || item.team || item.teamName || item.club_name || item.officialName || ''
    ).trim();
    if (!name) continue;

    const parsedId = item.id != null ? Number(item.id) : NaN;
    const rawId = Number.isFinite(parsedId) && parsedId > 0 ? Math.round(parsedId) : undefined;

    const rawTierVal = item.tier ?? item.division ?? item.leagueTier;
    const parsedTier = rawTierVal != null && rawTierVal !== '' ? Number(String(rawTierVal).replace(/[^0-9.-]/g, '')) : NaN;
    const tier = Number.isFinite(parsedTier) && parsedTier >= 1
      ? Math.max(1, Math.min(11, Math.round(parsedTier)))
      : undefined;

    const rawOvr = item.baseOvr ?? item.ovr ?? item.rating ?? item.overall ?? item.base_ovr ?? item.score;
    const parsedOvr = rawOvr != null && rawOvr !== '' ? Number(rawOvr) : NaN;
    const baseOvr = Number.isFinite(parsedOvr)
      ? Math.max(35, Math.min(99, Math.round(parsedOvr)))
      : undefined;

    const rawStadium = item.stadium ?? item.capacity ?? item.stadiumCapacity ?? item.ground;
    const parsedStadium = rawStadium != null && rawStadium !== ''
      ? Number(String(rawStadium).replace(/[,_\s]/g, ''))
      : NaN;
    const stadium = Number.isFinite(parsedStadium) && parsedStadium > 0
      ? Math.max(500, Math.min(150000, Math.round(parsedStadium)))
      : undefined;

    const rawCountry = item.country || item.nation || item.nationality;
    const country = rawCountry
      ? normalizeCountryCode(String(rawCountry))
      : undefined;

    const rawBudget = item.currentBudget ?? item.budget ?? item.startingBudget ?? item.funds ?? item.amount ?? item.balance ?? item.transferBudget ?? item.money;
    const currentBudget = (rawBudget != null && rawBudget !== '')
      ? parseAndNormalizeModBudget(rawBudget, tier || 1, country || 'GER')
      : undefined;

    const rawFans = item.fanBase ?? item.fans ?? item.supporters ?? item.fan_base;
    const parsedFans = rawFans != null && rawFans !== ''
      ? Number(String(rawFans).replace(/[,_\s]/g, ''))
      : NaN;
    const fanBase = Number.isFinite(parsedFans) && parsedFans > 0
      ? Math.max(100, Math.round(parsedFans))
      : undefined;

    const rawRep = item.rep ?? item.reputation ?? item.prestige;
    const parsedRep = rawRep != null && rawRep !== '' ? Number(rawRep) : NaN;
    const rep = Number.isFinite(parsedRep) && parsedRep > 0
      ? Math.max(1, Math.min(100, Math.round(parsedRep)))
      : undefined;

    const rawColor = item.color || item.clubColor || item.primaryColor || item.hexColor || item.mainColor;
    const color = rawColor ? String(rawColor).replace('#', '').trim() : undefined;

    // Support any logo attribute name
    const rawLogo = item.logo || item.crest || item.badge || item.icon || item.logoUrl || item.imageUrl || item.image || item.clubLogo || item.url || item.logo_url;
    const logo = sanitizeLogoUrl(rawLogo);

    const rawFallbackLogo = item.fallbackLogo || item.secondaryLogo || item.backupLogo || item.fallback_logo;
    const fallbackLogo = sanitizeLogoUrl(rawFallbackLogo);

    const rawCurrency = item.currency || item.currencySymbol || item.currencyCode || item.moneySymbol;
    const currency = rawCurrency ? String(rawCurrency).trim() : undefined;
    if (currency && country) {
      registerCustomModCurrencies({ [country]: currency });
    }

    sanitized.push({
      item,
      id: rawId,
      name,
      tier,
      baseOvr,
      color,
      stadium,
      country,
      rep,
      fanBase,
      currentBudget,
      currency,
      logo,
      fallbackLogo,
      isReserve: Boolean(item.isReserve) || isReserveClub(name),
      narrative: (item.narrative || item.context || item.clubContext || item.history || item.historicContext || item.description || item.bio || item.lore) 
        ? String(item.narrative || item.context || item.clubContext || item.history || item.historicContext || item.description || item.bio || item.lore) 
        : undefined,
      historicContext: (item.historicContext || item.history || item.lore)
        ? String(item.historicContext || item.history || item.lore)
        : undefined
    });
  }

  if (sanitized.length === 0) {
    return {
      valid: false,
      error: 'No valid clubs found. Each club entry requires at least a "name" property.'
    };
  }

  // Build lookup maps from ALL_CLUBS base database (country-scoped first to prevent cross-country collisions)
  const map = new Map<number, Club>(ALL_CLUBS.map(c => [c.id, { ...c }]));
  const exactCountryNameToId = new Map<string, number>();
  const simplifiedCountryNameToId = new Map<string, number>();
  const exactNameToId = new Map<string, number>();
  const simplifiedNameToId = new Map<string, number>();

  for (const c of ALL_CLUBS) {
    const cCountry = normalizeCountryCode(c.country || 'GER');
    const lower = c.name.toLowerCase().trim();
    exactCountryNameToId.set(`${cCountry}_${lower}`, c.id);
    if (!exactNameToId.has(lower)) exactNameToId.set(lower, c.id);
    const simp = simplifyClubName(c.name);
    if (simp) {
      if (!simplifiedCountryNameToId.has(`${cCountry}_${simp}`)) {
        simplifiedCountryNameToId.set(`${cCountry}_${simp}`, c.id);
      }
      if (!simplifiedNameToId.has(simp)) {
        simplifiedNameToId.set(simp, c.id);
      }
    }
  }

  let matchedCount = 0;
  let customClubsAdded = 0;

  sanitized.forEach((sc, idx) => {
    let matchedId: number | undefined = undefined;
    const scCountry = sc.country ? normalizeCountryCode(sc.country) : undefined;
    const isCountryCompatible = (candId: number) => {
      const cand = map.get(candId);
      if (!cand) return false;
      if (!scCountry) return true;
      return normalizeCountryCode(cand.country || 'GER') === scCountry;
    };

    // 1. Direct ID match if ID was explicitly given and exists in map
    // Only match if countries are compatible AND the club name or alias matches to avoid wiping clubs
    // when custom databases number their mod 1, 2, 3...
    if (sc.id != null && map.has(sc.id)) {
      const candidate = map.get(sc.id)!;
      const candCountry = normalizeCountryCode(candidate.country || 'GER');
      const sameCountry = !scCountry || scCountry === candCountry;
      const scSimp = simplifyClubName(sc.name);
      const candSimp = simplifyClubName(candidate.name);
      const scLower = sc.name.toLowerCase().trim();
      const candLower = candidate.name.toLowerCase().trim();

      const nameMatch = scSimp === candSimp || 
        scLower === candLower ||
        REAL_CLUB_ALIASES[scLower] === sc.id ||
        (REAL_CLUB_ALIASES[scSimp] === sc.id);

      const isDirect1to1Match = sameCountry && (sc.tier == null || Math.abs((sc.tier || 1) - (candidate.tier || 1)) <= 1);

      if (sameCountry && (nameMatch || isDirect1to1Match)) {
        matchedId = sc.id;
      }
    }

    // 2. Real-world alias dictionary match (e.g. "FC Bayern München" -> 1, "Borussia Dortmund II" -> 37)
    if (matchedId == null) {
      const lower = sc.name.toLowerCase().trim();
      const lowerNoRes = lower.replace(/\s+res\.?$/i, '').replace(/\s+reserve$/i, '').trim();
      if (REAL_CLUB_ALIASES[lower] != null && isCountryCompatible(REAL_CLUB_ALIASES[lower])) {
        matchedId = REAL_CLUB_ALIASES[lower];
      } else if (REAL_CLUB_ALIASES[lowerNoRes] != null && isCountryCompatible(REAL_CLUB_ALIASES[lowerNoRes])) {
        matchedId = REAL_CLUB_ALIASES[lowerNoRes];
      }
    }

    // 3. Exact name match against base DB (country-scoped first)
    if (matchedId == null) {
      const lower = sc.name.toLowerCase().trim();
      const exactByCountry = scCountry ? exactCountryNameToId.get(`${scCountry}_${lower}`) : undefined;
      if (exactByCountry != null && map.has(exactByCountry)) {
        matchedId = exactByCountry;
      } else {
        const exact = exactNameToId.get(lower);
        if (exact != null && isCountryCompatible(exact)) {
          matchedId = exact;
        }
      }
    }

    // 4. Simplified / fuzzy name match (country-scoped first)
    if (matchedId == null) {
      const simp = simplifyClubName(sc.name);
      if (simp) {
        const simpByCountry = scCountry ? simplifiedCountryNameToId.get(`${scCountry}_${simp}`) : undefined;
        if (simpByCountry != null && map.has(simpByCountry)) {
          matchedId = simpByCountry;
        } else {
          const simpMatch = simplifiedNameToId.get(simp);
          if (simpMatch != null && isCountryCompatible(simpMatch)) {
            matchedId = simpMatch;
          }
        }
      }
    }

    // 5. Reserve team parent match (if sc.name has II or B, match with parent's reserve team in base DB)
    if (matchedId == null && isReserveClub(sc.name)) {
      const cleanParent = sc.name
        .replace(/\s+Res\.?$/i, '')
        .replace(/\s+Reserve$/i, '')
        .replace(/\s+II$/, '')
        .replace(/\s+\(?B\)?$/, '')
        .replace(/\s+Castilla$/, '')
        .replace(/\s+B$/, '')
        .replace(/\s+2$/, '')
        .trim();
      const parentLower = cleanParent.toLowerCase().trim();
      const parentAliasId = REAL_CLUB_ALIASES[parentLower];
      if (parentAliasId != null) {
        const parentClub = map.get(parentAliasId);
        if (parentClub) {
          const reserveCandidate = ALL_CLUBS.find(c =>
            (c.country || 'GER') === (parentClub.country || 'GER') &&
            isReserveClub(c.name) &&
            (
              REAL_CLUB_ALIASES[c.name.toLowerCase().trim()] === parentAliasId ||
              simplifyClubName(c.name.replace(/\s+II$/, '').replace(/\s+\(?B\)?$/, '').replace(/\s+Castilla$/, '').replace(/\s+B$/, '').replace(/\s+2$/, '').trim()) === simplifyClubName(parentClub.name) ||
              simplifyClubName(c.name.replace(/\s+II$/, '').replace(/\s+\(?B\)?$/, '').replace(/\s+Castilla$/, '').replace(/\s+B$/, '').replace(/\s+2$/, '').trim()) === simplifyClubName(cleanParent)
            )
          );
          if (reserveCandidate && map.has(reserveCandidate.id)) {
            matchedId = reserveCandidate.id;
          }
        }
      }
    }

    if (matchedId != null && map.has(matchedId)) {
      matchedCount++;
      const existing = map.get(matchedId)!;
      map.set(matchedId, {
        ...existing,
        name: sc.name || existing.name,
        // New custom logo takes priority; fallback logo is safely kept or preserved
        logo: sc.logo || existing.logo,
        fallbackLogo: sc.fallbackLogo || existing.fallbackLogo || (sc.logo ? existing.logo : undefined),
        tier: (sc.tier != null && sc.tier >= 1) ? sc.tier : existing.tier,
        baseOvr: sc.baseOvr ?? existing.baseOvr,
        color: sc.color || existing.color,
        stadium: sc.stadium ?? existing.stadium,
        country: sc.country || existing.country || 'GER',
        rep: sc.rep ?? existing.rep ?? (sc.baseOvr || existing.baseOvr),
        fanBase: sc.fanBase ?? existing.fanBase,
        currentBudget: sc.currentBudget ?? existing.currentBudget,
        isReserve: Boolean(sc.item?.isReserve) || isReserveClub(sc.name || existing.name),
        narrative: sc.narrative || existing.narrative,
        historicContext: sc.historicContext || existing.historicContext,
        id: matchedId // keep stable ID
      });
    } else {
      // New custom club not in base DB
      customClubsAdded++;
      const safeId = (sc.id != null && !map.has(sc.id)) ? sc.id : (10000 + idx + 1);
      // Safeguard: Infer appropriate tier based on baseOvr if sc.tier is not provided, never default blindly to Tier 1
      let resolvedTier = sc.tier;
      if (!resolvedTier || resolvedTier < 1) {
        const ovr = sc.baseOvr || 65;
        if (ovr >= 82) resolvedTier = 1;
        else if (ovr >= 76) resolvedTier = 2;
        else if (ovr >= 70) resolvedTier = 3;
        else if (ovr >= 60) resolvedTier = 4;
        else resolvedTier = 5;
      }

      const newClub: Club = {
        id: safeId,
        name: sc.name,
        tier: resolvedTier,
        baseOvr: sc.baseOvr || 72,
        color: sc.color || '1d4ed8',
        stadium: sc.stadium || 25000,
        country: sc.country || 'GER',
        rep: sc.rep || sc.baseOvr || 72,
        fanBase: sc.fanBase || 2000000,
        currentBudget: sc.currentBudget ?? getStartingBudget(resolvedTier, sc.country || 'GER'),
        logo: sc.logo,
        fallbackLogo: sc.fallbackLogo,
        isReserve: Boolean(sc.isReserve),
        narrative: sc.narrative,
        historicContext: sc.historicContext
      };
      map.set(safeId, newClub);
    }
  });

  const merged = Array.from(map.values());
  return {
    valid: true,
    clubs: merged,
    count: sanitized.length,
    matchedCount,
    customClubsAdded
  };
};
