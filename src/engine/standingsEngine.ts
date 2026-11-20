import { Club, GameState, MatchdayOutcome, PendingSeasonState, TableRow } from '../types';
import {
  COUNTRIES,
  getLeagueInfo,
  getMaxTier,
  getMinAllowedTierForReserve,
  isReserveClub,
} from '../data/gameConstants';
import { ALL_CLUBS } from '../data/clubsData';
import { REAL_CLUB_ALIASES, simplifyClubName } from './moddingEngine';

export interface LiveStandingsRow extends TableRow {
  isPromotionZone?: boolean;
  isRelegationZone?: boolean;
}

const DEFAULT_MD34_CURVE: Record<number, number> = {
  1: 81,
  2: 73,
  3: 64,
  4: 58,
  5: 53,
  6: 49,
  7: 46,
  8: 43,
  9: 41,
  10: 39,
  11: 37,
  12: 34,
  13: 32,
  14: 30,
  15: 27,
  16: 24,
  17: 21,
  18: 16,
};

const COUNTRY_FALLBACK_NAMES: Record<string, { top: string[]; lower: string[] }> = {
  ENG: {
    top: ['Leeds United', 'Leicester City', 'Southampton', 'Norwich City', 'West Bromwich Albion', 'Middlesbrough', 'Coventry City', 'Sunderland', 'Watford', 'Stoke City'],
    lower: ['Scunthorpe United', 'Torquay United', 'Yeovil Town', 'Rochdale', 'Oldham Athletic', 'Southend United', 'Maidstone United', 'Kidderminster Harriers', 'Dorking Wanderers', 'York City'],
  },
  GER: {
    top: ['FC Schalke 04', 'Hertha BSC', '1. FC Nürnberg', 'Hannover 96', 'Fortuna Düsseldorf', 'Hamburger SV', 'SpVgg Greuther Fürth', 'SC Paderborn 07', '1. FC Magdeburg', 'Eintracht Braunschweig'],
    lower: ['VfR Aalen', 'Kickers Offenbach', 'Wuppertaler SV', 'FC Homburg', 'Chemnitzer FC', 'Carl Zeiss Jena', 'SV Meppen', 'FSV Zwickau', 'Fortuna Köln', 'Alemannia Aachen'],
  },
  ESP: {
    top: ['RCD Espanyol', 'Real Valladolid', 'Levante UD', 'Sporting Gijón', 'Real Oviedo', 'Real Zaragoza', 'Elche CF', 'CD Tenerife', 'SD Eibar', 'Albacete Balompié'],
    lower: ['CE Europa', 'UE Sant Andreu', 'Marbella FC', 'SD Logroñés', 'Real Avilés Industrial', 'CD Guadalajara', 'Yeclano Deportivo', 'CD Tudelano', 'CF Talavera', 'CF Badalona'],
  },
  ITA: {
    top: ['Parma Calcio', 'Palermo', 'Sampdoria', 'Bari', 'Brescia', 'Venezia', 'Spezia', 'Cremonese', 'Modena', 'Catanzaro'],
    lower: ['Virtus Entella', 'Pro Vercelli', 'Triestina', 'Vicenza Calcio', 'Lucchese', 'Pescara', 'Foggia', 'SPAL', 'Novara', 'Ancona'],
  },
  FRA: {
    top: ['Girondins de Bordeaux', 'AS Saint-Étienne', 'AJ Auxerre', 'Angers SCO', 'SM Caen', 'EA Guingamp', 'Paris FC', 'Grenoble Foot', 'Rodez AF', 'Pau FC'],
    lower: ['Le Mans FC', 'FC Villefranche', 'LB Châteauroux', 'SAS Épinal', 'GOAL FC', 'FC Rouen', 'Red Star FC', 'US Avranches', 'SO Cholet', 'Nîmes Olympique'],
  },
  POR: {
    top: ['SC Lusitânia', 'União de Leiria', 'CD Mafra', 'Varzim SC', 'FC Felgueiras', 'Atlético CP', 'AD Sanjoanense', 'SG Sacavenense', 'Belém OS', 'Sertanense FC'],
    lower: ['SC Lusitânia', 'União de Leiria', 'CD Mafra', 'Varzim SC', 'FC Felgueiras', 'Atlético CP', 'AD Sanjoanense', 'SG Sacavenense', 'Belém OS', 'Sertanense FC'],
  },
  ECU: {
    top: ['Guayaquil City', 'Gualaceo SC', '9 de Octubre', 'Cumbayá FC', 'Imbabura SC', 'Independiente Juniors', 'Chacaritas FC', 'Leones del Norte', 'San Antonio FC', 'Vargas Torres'],
    lower: ['Guayaquil City', 'Gualaceo SC', '9 de Octubre', 'Cumbayá FC', 'Imbabura SC', 'Independiente Juniors', 'Chacaritas FC', 'Leones del Norte', 'San Antonio FC', 'Vargas Torres'],
  },
  USA: {
    top: ['Tulsa City FC', 'Austin United', 'Miami Coast FC', 'Denver Peak FC', 'Phoenix Rising Stars', 'Seattle Sound SC', 'Boston Breakers SC', 'Chicago Athletic', 'Dallas Pioneers', 'Atlanta Metro FC', 'San Antonio Rovers', 'Nashville Sound FC', 'Detroit City FC', 'Memphis 901', 'Tampa Bay Sun'],
    lower: ['Tulsa City FC', 'Austin United', 'Miami Coast FC', 'Denver Peak FC', 'Phoenix Rising Stars', 'Seattle Sound SC', 'Boston Breakers SC', 'Chicago Athletic', 'Dallas Pioneers', 'Atlanta Metro FC', 'San Antonio Rovers', 'Nashville Sound FC', 'Detroit City FC', 'Memphis 901', 'Tampa Bay Sun'],
  },
  SCO: {
    top: ['Airdrieonians', 'Queen of the South', 'Alloa Athletic', 'Montrose FC', 'Kelty Hearts', 'Cove Rangers', 'Falkirk FC', 'Hamilton Academical', 'Stirling Albion', 'Peterhead FC'],
    lower: ['Airdrieonians', 'Queen of the South', 'Alloa Athletic', 'Montrose FC', 'Kelty Hearts', 'Cove Rangers', 'Falkirk FC', 'Hamilton Academical', 'Stirling Albion', 'Peterhead FC'],
  },
  BRA: {
    top: ['América Mineiro', 'Coritiba FC', 'Goiás EC', 'Chapecoense', 'Ponte Preta', 'Vila Nova', 'Avaí FC', 'CRB', 'Operário Ferroviário', 'Paysandu'],
    lower: ['América Mineiro', 'Coritiba FC', 'Goiás EC', 'Chapecoense', 'Ponte Preta', 'Vila Nova', 'Avaí FC', 'CRB', 'Operário Ferroviário', 'Paysandu'],
  },
  ARG: {
    top: ['Chacarita Juniors', 'Quilmes AC', 'Ferro Carril Oeste', 'San Martín de Tucumán', 'Colón de Santa Fe', 'All Boys', 'Nueva Chicago', 'Defensores de Belgrano', 'Gimnasia y Esgrima', 'Temperley'],
    lower: ['Chacarita Juniors', 'Quilmes AC', 'Ferro Carril Oeste', 'San Martín de Tucumán', 'Colón de Santa Fe', 'All Boys', 'Nueva Chicago', 'Defensores de Belgrano', 'Gimnasia y Esgrima', 'Temperley'],
  },
  COL: {
    top: ['Deportes Quindío', 'Cúcuta Deportivo', 'Cortuluá', 'Real Cartagena', 'Valledupar FC', 'Bogotá FC', 'Leones FC', 'Barranquilla FC', 'Tigres FC', 'Atlético Huila'],
    lower: ['Deportes Quindío', 'Cúcuta Deportivo', 'Cortuluá', 'Real Cartagena', 'Valledupar FC', 'Bogotá FC', 'Leones FC', 'Barranquilla FC', 'Tigres FC', 'Atlético Huila'],
  },
  JPN: {
    top: ['Oita Trinita', 'Roasso Kumamoto', 'Ventforet Kofu', 'Renofa Yamaguchi', 'Tochigi SC', 'Mito HollyHock', 'Blaublitz Akita', 'Iwaki FC', 'Thespakusatsu Gunma', 'Fujieda MYFC'],
    lower: ['Oita Trinita', 'Roasso Kumamoto', 'Ventforet Kofu', 'Renofa Yamaguchi', 'Tochigi SC', 'Mito HollyHock', 'Blaublitz Akita', 'Iwaki FC', 'Thespakusatsu Gunma', 'Fujieda MYFC'],
  },
  MEX: {
    top: ['Atlante FC', 'Celaya FC', 'Venados FC', 'Leones Negros', 'Cimarrones de Sonora', 'Cancún FC', 'Alebrijes de Oaxaca', 'Mineros de Zacatecas', 'Tepatitlán FC', 'Correcaminos UAT'],
    lower: ['Atlante FC', 'Celaya FC', 'Venados FC', 'Leones Negros', 'Cimarrones de Sonora', 'Cancún FC', 'Alebrijes de Oaxaca', 'Mineros de Zacatecas', 'Tepatitlán FC', 'Correcaminos UAT'],
  },
  CAN: {
    top: ['Victoria Highlanders', 'Calgary Foothills', 'FC Manitoba', 'Thunder Bay Chill', 'Simcoe County Rovers', 'Guelph United', 'Blue Devils FC', 'Vaughan Azzurri', 'TFC Academy', 'FC Laval'],
    lower: ['Victoria Highlanders', 'Calgary Foothills', 'FC Manitoba', 'Thunder Bay Chill', 'Simcoe County Rovers', 'Guelph United', 'Blue Devils FC', 'Vaughan Azzurri', 'TFC Academy', 'FC Laval'],
  },
  TUR: {
    top: ['Bursaspor', 'Eskişehirspor', 'Altay SK', 'Giresunspor', 'Menemenspor', 'Tuzlaspor', 'Boluspor', 'Adanaspor', 'Bandırmaspor', 'Keçiörengücü'],
    lower: ['Bursaspor', 'Eskişehirspor', 'Altay SK', 'Giresunspor', 'Menemenspor', 'Tuzlaspor', 'Boluspor', 'Adanaspor', 'Bandırmaspor', 'Keçiörengücü'],
  },
};

export const deterministicHash = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Murmur3 fmix32 avalanche finalizer so adjacent seeds (e.g. -shuf-33 vs -shuf-32) are completely uncorrelated
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
};

const seededInt = (seed: string, min: number, max: number): number => {
  const h = deterministicHash(seed);
  return Math.floor(h * (max - min + 1)) + min;
};

const isReserveTeam = (name: string): boolean => {
  if (!name) return false;
  if (name === 'SSV Jeddeloh II' || name.toLowerCase().includes('jeddeloh ii')) return false;
  return isReserveClub(name);
};

const getCanonicalDedupeKey = (clubName: string): string => {
  const lower = clubName.toLowerCase().trim();
  if (REAL_CLUB_ALIASES[lower] != null) {
    return `alias_${REAL_CLUB_ALIASES[lower]}`;
  }
  const lowerNoRes = lower.replace(/\s+res\.?$/i, '').replace(/\s+reserve$/i, '').trim();
  if (REAL_CLUB_ALIASES[lowerNoRes] != null) {
    return `alias_${REAL_CLUB_ALIASES[lowerNoRes]}`;
  }
  const isRes = isReserveTeam(clubName);
  const cleanParent = clubName
    .replace(/\s+Res\.?$/i, '')
    .replace(/\s+Reserve$/i, '')
    .replace(/\s+II$/, '')
    .replace(/\s+\(?B\)?$/, '')
    .replace(/\s+Castilla$/, '')
    .replace(/\s+B$/, '')
    .replace(/\s+2$/, '')
    .trim()
    .toLowerCase();
  const parentAlias = REAL_CLUB_ALIASES[cleanParent];
  if (parentAlias != null) {
    return `parent_${parentAlias}_${isRes}`;
  }
  return `simp_${simplifyClubName(cleanParent)}_${isRes}`;
};

/**
 * Resolves the canonical, isolated 17 or 18 division peer clubs for a given country & tier.
 * Used identically by Season Pre-Calculation, Live Standings, League Table Modal, and Season Archive.
 */
export const resolveDivisionClubs = (params: {
  clubsDb: Club[];
  country: string;
  tier: number;
  year: number;
  userClub?: Club | null;
  excludeUserClub?: boolean;
  isModActive?: boolean;
  rivalClub?: { id?: number | string; name?: string } | null;
}): Club[] => {
  const {
    clubsDb,
    country,
    tier,
    year,
    userClub,
    excludeUserClub = true,
    isModActive = false,
    rivalClub,
  } = params;

  const safeDb = Array.isArray(clubsDb) && clubsDb.length > 0 ? clubsDb : ALL_CLUBS;
  const leagueInfo = getLeagueInfo(tier, country);
  const minReserveTier = getMinAllowedTierForReserve(country);
  const isMajorPyramid = ['GER', 'ENG', 'ESP', 'ITA', 'FRA'].includes(country);
  const userInThisTier =
    Boolean(userClub) &&
    (userClub!.country || 'GER') === country &&
    userClub!.tier === tier;
  const shouldExcludeUser = Boolean(excludeUserClub && userInThisTier && userClub);
  const targetCount = shouldExcludeUser ? 17 : 18;

  let divisionPeers = safeDb
    .filter(
      (c) =>
        (c.country || 'GER') === country &&
        c.tier === tier &&
        (!shouldExcludeUser || (c.id !== userClub?.id && c.name.toLowerCase().trim() !== userClub?.name.toLowerCase().trim())) &&
        !(tier < minReserveTier && isReserveTeam(c.name))
    )
    .map((c) => ({ ...c }));

  if (isModActive) {
    divisionPeers.sort((a, b) => {
      const aLower = a.name.toLowerCase().trim();
      const bLower = b.name.toLowerCase().trim();
      const aIsFallback = aLower.startsWith('prussia') || aLower.startsWith('bavaria') || aLower.startsWith('baden');
      const bIsFallback = bLower.startsWith('prussia') || bLower.startsWith('bavaria') || bLower.startsWith('baden');
      if (!aIsFallback && bIsFallback) return -1;
      if (aIsFallback && !bIsFallback) return 1;
      return 0;
    });
  }

  const seenIdentities = new Set<string>();
  const seenClubIds = new Set<number | string>();
  if (shouldExcludeUser && userClub) {
    seenIdentities.add(getCanonicalDedupeKey(userClub.name));
    if (userClub.id != null) seenClubIds.add(userClub.id);
  }

  divisionPeers = divisionPeers.filter((c) => {
    if (c.id != null && seenClubIds.has(c.id)) return false;
    const key = isMajorPyramid ? getCanonicalDedupeKey(c.name) : c.name.toLowerCase().trim();
    if (seenIdentities.has(key)) return false;
    seenIdentities.add(key);
    if (c.id != null) seenClubIds.add(c.id);
    return true;
  });

  if (divisionPeers.length > targetCount) {
    divisionPeers = divisionPeers.slice(0, targetCount);
  }

  if (divisionPeers.length < targetCount) {
    const rivalNameLower = (rivalClub?.name || '').toLowerCase().trim();
    const candidates = safeDb
      .filter(
        (c) =>
          (c.country || 'GER') === country &&
          !seenClubIds.has(c.id) &&
          (!shouldExcludeUser || c.name.toLowerCase().trim() !== userClub?.name.toLowerCase().trim()) &&
          c.id !== rivalClub?.id &&
          (!rivalNameLower || c.name.toLowerCase().trim() !== rivalNameLower) &&
          c.tier === tier + 1 &&
          (tier < minReserveTier ? !isReserveTeam(c.name) : true) &&
          (tier === 1 ? c.baseOvr >= 70 : true)
      )
      .sort((a, b) => b.baseOvr - a.baseOvr);

    for (const c of candidates) {
      if (divisionPeers.length >= targetCount) break;
      const key = isMajorPyramid ? getCanonicalDedupeKey(c.name) : c.name.toLowerCase().trim();
      if (seenIdentities.has(key)) continue;
      seenIdentities.add(key);
      if (c.id != null) seenClubIds.add(c.id);
      divisionPeers.push({ ...c, tier });
    }
  }

  if (divisionPeers.length < targetCount) {
    const countryFallbacks = COUNTRY_FALLBACK_NAMES[country];
    const fallbackList = countryFallbacks
      ? tier === 1
        ? countryFallbacks.top
        : countryFallbacks.lower
      : [];
    const allKnownDbNames = new Set([
      ...safeDb.map((c) => c.name.toLowerCase().trim()),
      ...(userClub ? [userClub.name.toLowerCase().trim()] : []),
      ...(rivalClub?.name ? [rivalClub.name.toLowerCase().trim()] : []),
    ]);

    let idx = 0;
    while (divisionPeers.length < targetCount) {
      const existingNames = new Set([
        ...allKnownDbNames,
        ...divisionPeers.map((c) => c.name.toLowerCase().trim()),
      ]);
      const availableFallback =
        fallbackList.find((n) => !existingNames.has(n.toLowerCase().trim())) ||
        `${COUNTRIES[country]?.name || country} Club ${idx + 1}`;
      const synthColor =
        '#' +
        Math.floor(deterministicHash(`col-${country}-${tier}-${idx}`) * 16777215)
          .toString(16)
          .padStart(6, '0');
      divisionPeers.push({
        id: 99000 + tier * 100 + idx,
        name: availableFallback,
        tier,
        baseOvr: leagueInfo.avgOvr + seededInt(`ovr-${year}-${country}-${tier}-${idx}`, -4, 4),
        color: synthColor,
        stadium: 15000,
        country,
      });
      idx += 1;
    }
  }

  return divisionPeers.slice(0, targetCount);
};

interface TargetRecord34 {
  pts: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
}

const deriveWdLFromPts = (pts: number, totalGames: number = 34): { w: number; d: number; l: number } => {
  const clampedPts = Math.max(0, Math.min(totalGames * 3, pts));
  let w = Math.min(totalGames, Math.floor(clampedPts / 3));
  let d = Math.max(0, clampedPts - w * 3);
  while (d < 4 && w > 2 && w + d + 2 <= totalGames) {
    w -= 1;
    d += 3;
  }
  if (w + d > totalGames) {
    d = Math.max(0, totalGames - w);
  }
  const l = Math.max(0, totalGames - w - d);
  return { w, d, l };
};

interface PeerMatchResult {
  res: 'W' | 'D' | 'L';
  gf: number;
  ga: number;
}

const buildDeterministicPeerSchedule = (
  seedPrefix: string,
  target: TargetRecord34,
  totalMds: number
): PeerMatchResult[] => {
  const halfMds = Math.floor(totalMds / 2);
  const secondHalfMds = totalMds - halfMds;

  // Split season W/D/L proportionally across 1st and 2nd half with realistic form variance (±1 win max)
  // so mid-season tables reflect authentic football point curves while preserving exact MD 34 totals.
  const winSwing = seededInt(`${seedPrefix}-hswing-w`, -1, 1);
  const drawSwing = seededInt(`${seedPrefix}-hswing-d`, -1, 1);
  const baseFirstW = Math.round((target.w * halfMds) / Math.max(1, totalMds));
  const minFirstW = Math.max(0, target.w - secondHalfMds);
  const maxFirstW = Math.min(target.w, halfMds);
  const firstW = Math.max(minFirstW, Math.min(maxFirstW, baseFirstW + winSwing));

  const baseFirstD = Math.round((target.d * halfMds) / Math.max(1, totalMds));
  const minFirstD = Math.max(0, target.d - (secondHalfMds - (target.w - firstW)));
  const maxFirstD = Math.min(target.d, halfMds - firstW);
  const firstD = Math.max(minFirstD, Math.min(maxFirstD, baseFirstD + drawSwing));
  const firstL = Math.max(0, halfMds - firstW - firstD);

  const secondW = Math.max(0, target.w - firstW);
  const secondD = Math.max(0, target.d - firstD);
  const secondL = Math.max(0, secondHalfMds - secondW - secondD);

  const firstHalfPool: ('W' | 'D' | 'L')[] = [
    ...Array(firstW).fill('W'),
    ...Array(firstD).fill('D'),
    ...Array(firstL).fill('L'),
  ];
  while (firstHalfPool.length < halfMds) firstHalfPool.push('D');

  const secondHalfPool: ('W' | 'D' | 'L')[] = [
    ...Array(secondW).fill('W'),
    ...Array(secondD).fill('D'),
    ...Array(secondL).fill('L'),
  ];
  while (secondHalfPool.length < secondHalfMds) secondHalfPool.push('D');

  for (let i = firstHalfPool.length - 1; i > 0; i--) {
    const j = Math.floor(deterministicHash(`${seedPrefix}-shuf1-${i}`) * (i + 1));
    [firstHalfPool[i], firstHalfPool[j]] = [firstHalfPool[j], firstHalfPool[i]];
  }
  for (let i = secondHalfPool.length - 1; i > 0; i--) {
    const j = Math.floor(deterministicHash(`${seedPrefix}-shuf2-${i}`) * (i + 1));
    [secondHalfPool[i], secondHalfPool[j]] = [secondHalfPool[j], secondHalfPool[i]];
  }

  const sliced = [...firstHalfPool.slice(0, halfMds), ...secondHalfPool.slice(0, secondHalfMds)];

  const gfGoals = new Array<number>(sliced.length).fill(0);
  const gaGoals = new Array<number>(sliced.length).fill(0);

  let usedGf = 0;
  let usedGa = 0;
  const winIndices: number[] = [];
  const lossIndices: number[] = [];

  sliced.forEach((r, idx) => {
    if (r === 'W') {
      gfGoals[idx] = 1;
      usedGf += 1;
      winIndices.push(idx);
    } else if (r === 'L') {
      gaGoals[idx] = 1;
      usedGa += 1;
      lossIndices.push(idx);
    }
  });

  // Ensure D draws have symmetric base goals when goal budget allows
  for (let idx = 0; idx < sliced.length; idx++) {
    if (sliced[idx] === 'D' && usedGf < target.gf && usedGa < target.ga) {
      gfGoals[idx] += 1;
      gaGoals[idx] += 1;
      usedGf += 1;
      usedGa += 1;
    }
  }

  // Add paired goals (+1/+1) evenly across seeded matches until min remaining equals 0
  let safety = 0;
  while (usedGf < target.gf && usedGa < target.ga && safety < 200) {
    const idx = Math.floor(deterministicHash(`${seedPrefix}-pair-${safety}`) * sliced.length);
    gfGoals[idx] += 1;
    gaGoals[idx] += 1;
    usedGf += 1;
    usedGa += 1;
    safety += 1;
  }

  // Add remaining surplus goals strictly preserving W (gf > ga) and L (ga > gf)
  let gfSafety = 0;
  while (usedGf < target.gf && winIndices.length > 0 && gfSafety < 200) {
    const wi = winIndices[Math.floor(deterministicHash(`${seedPrefix}-gf-${gfSafety}`) * winIndices.length)];
    gfGoals[wi] += 1;
    usedGf += 1;
    gfSafety += 1;
  }

  let gaSafety = 0;
  while (usedGa < target.ga && lossIndices.length > 0 && gaSafety < 200) {
    const li = lossIndices[Math.floor(deterministicHash(`${seedPrefix}-ga-${gaSafety}`) * lossIndices.length)];
    gaGoals[li] += 1;
    usedGa += 1;
    gaSafety += 1;
  }

  return sliced.map((res, idx) => ({
    res,
    gf: gfGoals[idx],
    ga: gaGoals[idx],
  }));
};

const buildHalfPeerMatchList = (
  seedPrefix: string,
  w: number,
  d: number,
  l: number,
  targetGf: number,
  targetGa: number
): PeerMatchResult[] => {
  const pool: ('W' | 'D' | 'L')[] = [
    ...Array(Math.max(0, w)).fill('W'),
    ...Array(Math.max(0, d)).fill('D'),
    ...Array(Math.max(0, l)).fill('L'),
  ];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(deterministicHash(`${seedPrefix}-shuf-${i}`) * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const gfGoals = new Array<number>(pool.length).fill(0);
  const gaGoals = new Array<number>(pool.length).fill(0);
  let usedGf = 0;
  let usedGa = 0;
  const winIndices: number[] = [];
  const lossIndices: number[] = [];

  pool.forEach((r, idx) => {
    if (r === 'W') {
      gfGoals[idx] = 1;
      usedGf += 1;
      winIndices.push(idx);
    } else if (r === 'L') {
      gaGoals[idx] = 1;
      usedGa += 1;
      lossIndices.push(idx);
    }
  });

  for (let idx = 0; idx < pool.length; idx++) {
    if (pool[idx] === 'D' && usedGf < targetGf && usedGa < targetGa) {
      gfGoals[idx] += 1;
      gaGoals[idx] += 1;
      usedGf += 1;
      usedGa += 1;
    }
  }

  let safety = 0;
  while (usedGf < targetGf && usedGa < targetGa && safety < 160 && pool.length > 0) {
    const idx = Math.floor(deterministicHash(`${seedPrefix}-pair-${safety}`) * pool.length);
    gfGoals[idx] += 1;
    gaGoals[idx] += 1;
    usedGf += 1;
    usedGa += 1;
    safety += 1;
  }

  let gfSafety = 0;
  while (usedGf < targetGf && winIndices.length > 0 && gfSafety < 160) {
    const wi = winIndices[Math.floor(deterministicHash(`${seedPrefix}-gf-${gfSafety}`) * winIndices.length)];
    gfGoals[wi] += 1;
    usedGf += 1;
    gfSafety += 1;
  }

  let gaSafety = 0;
  while (usedGa < targetGa && lossIndices.length > 0 && gaSafety < 160) {
    const li = lossIndices[Math.floor(deterministicHash(`${seedPrefix}-ga-${gaSafety}`) * lossIndices.length)];
    gaGoals[li] += 1;
    usedGa += 1;
    gaSafety += 1;
  }

  return pool.map((res, idx) => ({
    res,
    gf: gfGoals[idx],
    ga: gaGoals[idx],
  }));
};

const buildLockedFirstHalfPeerMap = (params: {
  orderedPeers: Club[];
  year: number;
  country: string;
  tier: number;
  totalMatchdays: number;
  halfMds: number;
  lockedAnchorPos: number;
  lockedAnchorNetPts: number;
  lockedAnchorGd: number;
}): Map<string, PeerMatchResult[]> => {
  const {
    orderedPeers,
    year,
    country,
    tier,
    totalMatchdays,
    halfMds,
    lockedAnchorPos,
    lockedAnchorNetPts,
    lockedAnchorGd,
  } = params;

  const clampedPos = Math.max(1, Math.min(18, lockedAnchorPos));
  const peerList = orderedPeers.slice(0, 17);
  const aboveCount = Math.max(0, Math.min(peerList.length, clampedPos - 1));
  const peersAbove = peerList.slice(0, aboveCount);
  const peersBelow = peerList.slice(aboveCount);

  const abovePts: number[] = new Array(peersAbove.length).fill(0);
  if (peersAbove.length > 0) {
    let minAllowed = lockedAnchorNetPts + 1;
    for (let i = peersAbove.length - 1; i >= 0; i--) {
      const posNum = i + 1;
      const baseCurve =
        (DEFAULT_MD34_CURVE[posNum] || 50) + seededInt(`pts-${year}-${country}-${tier}-${posNum}`, -1, 1);
      abovePts[i] = Math.min(98, Math.max(minAllowed, baseCurve));
      minAllowed = abovePts[i] + 1;
    }
  }

  const belowPts: number[] = new Array(peersBelow.length).fill(0);
  if (peersBelow.length > 0) {
    let maxAllowed = Math.max(6, lockedAnchorNetPts - 1);
    for (let i = 0; i < peersBelow.length; i++) {
      const posNum = clampedPos + 1 + i;
      const baseCurve =
        (DEFAULT_MD34_CURVE[posNum] || Math.max(12, 30 - i * 2)) +
        seededInt(`pts-${year}-${country}-${tier}-${posNum}`, -1, 1);
      if (i === 0 && clampedPos === 1) {
        const compSecond = Math.min(
          maxAllowed,
          Math.max(baseCurve, lockedAnchorNetPts - seededInt(`gap-${year}-${country}`, 2, 6))
        );
        belowPts[i] = Math.max(6, compSecond);
      } else {
        belowPts[i] = Math.max(6, Math.min(maxAllowed, baseCurve));
      }
      maxAllowed = Math.max(6, belowPts[i] - 1);
    }
  }

  const map = new Map<string, PeerMatchResult[]>();
  const addPeer = (
    club: Club,
    targetPos34: number,
    targetPts34: number,
    mustBeatGd: boolean,
    mustTrailGd: boolean
  ) => {
    const { w: w34, d: d34, l: l34 } = deriveWdLFromPts(targetPts34, totalMatchdays);
    let gf34 = Math.max(
      w34 + 6,
      Math.round(w34 * 2.08 + d34 * 1.05 + l34 * 0.45 + (targetPos34 <= 3 ? (4 - targetPos34) * 3 : 2))
    );
    let ga34 = Math.max(
      l34 + 6,
      Math.round(l34 * 1.78 + d34 * 0.95 + w34 * 0.42 + (targetPos34 - 1) * 0.42 + 3)
    );
    if (mustBeatGd && gf34 - ga34 <= lockedAnchorGd) {
      gf34 = Math.max(w34 + d34, ga34 + lockedAnchorGd + 1);
    } else if (mustTrailGd && gf34 - ga34 >= lockedAnchorGd) {
      ga34 = Math.max(l34 + d34, gf34 - (lockedAnchorGd - 1));
    }
    const sched = buildDeterministicPeerSchedule(
      `${year}-${country}-${tier}-${club.id}-${club.name}`,
      { pts: targetPts34, w: w34, d: d34, l: l34, gf: gf34, ga: ga34 },
      totalMatchdays
    );
    map.set(`${club.id}-${club.name}`, sched.slice(0, halfMds));
  };

  peersAbove.forEach((club, idx) =>
    addPeer(club, idx + 1, abovePts[idx], abovePts[idx] === lockedAnchorNetPts, false)
  );
  peersBelow.forEach((club, idx) =>
    addPeer(club, clampedPos + 1 + idx, belowPts[idx], false, belowPts[idx] === lockedAnchorNetPts)
  );

  return map;
};

const composePeerScheduleWithLockedFirstHalf = (
  seedPrefix: string,
  target: TargetRecord34,
  totalMds: number,
  lockedFirstHalf?: PeerMatchResult[]
): PeerMatchResult[] => {
  if (!lockedFirstHalf || lockedFirstHalf.length === 0 || lockedFirstHalf.length >= totalMds) {
    return buildDeterministicPeerSchedule(seedPrefix, target, totalMds);
  }
  const fhW = lockedFirstHalf.filter((m) => m.res === 'W').length;
  const fhD = lockedFirstHalf.filter((m) => m.res === 'D').length;
  const fhGf = lockedFirstHalf.reduce((s, m) => s + m.gf, 0);
  const fhGa = lockedFirstHalf.reduce((s, m) => s + m.ga, 0);
  const fhPts = fhW * 3 + fhD;

  const shGames = totalMds - lockedFirstHalf.length;
  const remPts = Math.max(0, Math.min(shGames * 3, target.pts - fhPts));
  const { w: shW, d: shD, l: shL } = deriveWdLFromPts(remPts, shGames);
  const shGf = Math.max(shW, target.gf - fhGf);
  const shGa = Math.max(shL, target.ga - fhGa);

  const secondHalf = buildHalfPeerMatchList(`${seedPrefix}-shlock`, shW, shD, shL, shGf, shGa);
  return [...lockedFirstHalf, ...secondHalf];
};

export interface UserFinalStandingsOverride {
  pos: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number; // net pts
  grossPts?: number;
  pointsDeducted?: number;
}

export interface DeterministicDivisionTableParams {
  year: number;
  country: string;
  tier: number;
  playedMatchdays: number;
  totalMatchdays?: number;
  userClub?: Club | null;
  userInTier?: boolean;
  peers: Club[];
  pendingSeasonState?: PendingSeasonState | null;
  latestOutcome?: MatchdayOutcome | null;
  userOverrideFinal?: UserFinalStandingsOverride | null;
  directRivalOverride?: {
    id?: number | string;
    name: string;
    pts: number;
    gd: number;
    targetPos?: number;
  } | null;
  rivalClub?: { id?: number | string; name?: string } | null;
  insolventClubName?: string | null;
  userPointsDeducted?: number;
  promotedPeerIds?: Set<number | string>;
  promotedPeerNames?: Set<string>;
  relegatedPeerIds?: Set<number | string>;
  relegatedPeerNames?: Set<string>;
  isModActive?: boolean;
}

/**
 * Single deterministic standings engine producing identical 18-club tables across:
 * - Pre-season (MD 0)
 * - Match-by-match Live Simulation (MD 1..34)
 * - Mid-Season Table (MD 17)
 * - Season Finish Archive & Wrap-Up Modal (MD 34)
 */
export const buildDeterministicDivisionTable = (
  params: DeterministicDivisionTableParams
): LiveStandingsRow[] => {
  const {
    year,
    country,
    tier,
    playedMatchdays,
    totalMatchdays = 34,
    userClub,
    userInTier = Boolean(userClub),
    peers,
    pendingSeasonState,
    latestOutcome,
    userOverrideFinal,
    directRivalOverride,
    rivalClub,
    insolventClubName,
    userPointsDeducted = 0,
    promotedPeerIds,
    promotedPeerNames,
    relegatedPeerIds,
    relegatedPeerNames,
    isModActive = false,
  } = params;

  const effectiveMd = Math.max(0, Math.min(totalMatchdays, playedMatchdays));
  const rivalNameLower = (rivalClub?.name || '').toLowerCase().trim();
  const isPeerRival = (c: Club) =>
    Boolean(
      rivalClub &&
        ((c.id != null && rivalClub.id != null && String(c.id) === String(rivalClub.id)) ||
          (rivalNameLower && c.name.toLowerCase().trim() === rivalNameLower))
    );

  const getSeasonalPeerStrengthScore = (club: Club): number => {
    const rawOvr = club.baseOvr || 65;
    // Dampen extreme Tier 1 OVR gap above 86 so an initial 95-96 giant doesn't lock peer slot #1 100% of seasons
    const base =
      tier === 1 && rawOvr > 86 ? 86 + (rawOvr - 86) * 0.42 : rawOvr;
    const formSwing = seededInt(`str-${year}-${country}-${tier}-${club.id}-${club.name}`, -7, 7);
    let arcDelta = 0;

    if (tier === 1 && !club.isInsolventGiant) {
      const arcRoll = deterministicHash(`arc-${year}-${country}-${tier}-${club.id}-${club.name}`);
      if (rawOvr >= 83 && arcRoll < 0.12) {
        // Transitional slump / injury wave (-8 to -14)
        arcDelta = -seededInt(`slump-${year}-${club.id}`, 8, 14);
      } else if (rawOvr >= 78 && arcRoll >= 0.78) {
        // Title challenger breakthrough (+5 to +11)
        arcDelta = seededInt(`surge-${year}-${club.id}`, 5, 11);
      } else if (rawOvr >= 72 && rawOvr < 80 && arcRoll >= 0.64 && arcRoll < 0.78) {
        // Dark-horse European push (+7 to +12)
        arcDelta = seededInt(`dark-${year}-${club.id}`, 7, 12);
      }
    }

    return base + formSwing + arcDelta;
  };

  // Order peers deterministically by season strength & promotion/relegation coherence
  const orderedPeers = [...peers].sort((a, b) => {
    if (promotedPeerIds || promotedPeerNames) {
      const aProm = Boolean(promotedPeerIds?.has(a.id) || promotedPeerNames?.has(a.name.toLowerCase().trim()));
      const bProm = Boolean(promotedPeerIds?.has(b.id) || promotedPeerNames?.has(b.name.toLowerCase().trim()));
      if (aProm && !bProm) return -1;
      if (!aProm && bProm) return 1;
    }
    if (relegatedPeerIds || relegatedPeerNames) {
      const aRel = Boolean(relegatedPeerIds?.has(a.id) || relegatedPeerNames?.has(a.name.toLowerCase().trim()));
      const bRel = Boolean(relegatedPeerIds?.has(b.id) || relegatedPeerNames?.has(b.name.toLowerCase().trim()));
      if (aRel && !bRel) return 1;
      if (!aRel && bRel) return -1;
    }
    const bScore = getSeasonalPeerStrengthScore(b);
    const aScore = getSeasonalPeerStrengthScore(a);
    if (bScore !== aScore) return bScore - aScore;
    return a.name.localeCompare(b.name);
  });

  // Pre-season MD 0: exact deterministic seeded OVR ranking with 0 matches played
  if (effectiveMd === 0) {
    const allPreSeason = [
      ...(userInTier && userClub ? [{ club: userClub, isUser: true }] : []),
      ...orderedPeers.map((c) => ({ club: c, isUser: false })),
    ].slice(0, 18);

    allPreSeason.sort((a, b) => {
      const bEff = (b.club.baseOvr || 65) + seededInt(`pre-${year}-${country}-${tier}-${b.club.id}`, -4, 4);
      const aEff = (a.club.baseOvr || 65) + seededInt(`pre-${year}-${country}-${tier}-${a.club.id}`, -4, 4);
      if (bEff !== aEff) return bEff - aEff;
      return a.club.name.localeCompare(b.club.name);
    });

    return allPreSeason.map((item, idx) => ({
      pos: idx + 1,
      id: item.club.id,
      name: item.club.name,
      color: item.club.color,
      logo: isModActive ? item.club.logo : undefined,
      mp: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      pts: 0,
      gd: '0',
      isUser: item.isUser,
      isReserve: Boolean(item.club.isReserve) || isReserveTeam(item.club.name),
      isRival: !item.isUser && isPeerRival(item.club),
      pointsDeducted: item.isUser
        ? userPointsDeducted > 0
          ? userPointsDeducted
          : undefined
        : insolventClubName && item.club.name === insolventClubName
        ? 2
        : undefined,
      form: [],
      isPromotionZone: tier > 1 ? idx < 2 : idx < 4,
      isRelegationZone: idx >= allPreSeason.length - 3,
    }));
  }

  // Anchor final 34-matchday standings around user's pending or overridden outcome
  const schedule = pendingSeasonState?.matchdaySchedule || pendingSeasonState?.schedule || [];
  const lastScheduled = schedule.length > 0 ? schedule[schedule.length - 1] : undefined;

  const anchorPos = userInTier
    ? Math.max(
        1,
        Math.min(
          18,
          userOverrideFinal?.pos ??
            pendingSeasonState?.pos ??
            pendingSeasonState?.approxPos ??
            lastScheduled?.runningPos ??
            9
        )
      )
    : 0;

  const anchorFinalNetPts = userInTier
    ? userOverrideFinal?.pts ??
      Math.max(
        0,
        (pendingSeasonState?.pts ?? lastScheduled?.runningPts ?? DEFAULT_MD34_CURVE[anchorPos] ?? 42) -
          userPointsDeducted
      )
    : 0;

  const anchorFinalGd = userInTier
    ? userOverrideFinal
      ? userOverrideFinal.gf - userOverrideFinal.ga
      : pendingSeasonState?.gd ??
        ((pendingSeasonState?.gf ?? 52) - (pendingSeasonState?.ga ?? 42))
    : 0;

  // Partition 17 peers cleanly around anchorPos
  const peerListForTable = orderedPeers.slice(0, userInTier ? 17 : 18);
  if (userInTier && directRivalOverride && peerListForTable.length > 0) {
    const rivalIdx = peerListForTable.findIndex(
      (c) =>
        (directRivalOverride.id != null && String(c.id) === String(directRivalOverride.id)) ||
        c.name.toLowerCase().trim() === directRivalOverride.name.toLowerCase().trim()
    );
    if (rivalIdx !== -1) {
      const [riv] = peerListForTable.splice(rivalIdx, 1);
      const desiredPeerSlot =
        directRivalOverride.targetPos && directRivalOverride.targetPos !== anchorPos
          ? directRivalOverride.targetPos > anchorPos
            ? directRivalOverride.targetPos - 2
            : directRivalOverride.targetPos - 1
          : anchorPos <= 2
          ? anchorPos === 1
            ? 0
            : 0
          : Math.max(0, Math.min(peerListForTable.length, anchorPos - 2));
      peerListForTable.splice(Math.max(0, Math.min(peerListForTable.length, desiredPeerSlot)), 0, riv);
    }
  }

  const aboveCount = userInTier ? Math.max(0, Math.min(peerListForTable.length, anchorPos - 1)) : 0;
  const peersAbove = userInTier ? peerListForTable.slice(0, aboveCount) : [];
  const peersBelow = userInTier ? peerListForTable.slice(aboveCount) : peerListForTable;

  // Assign full-season MD 34 target points strictly ordered relative to user's anchorFinalNetPts
  const aboveTargetPts: number[] = new Array(peersAbove.length).fill(0);
  if (peersAbove.length > 0) {
    let minAllowedPts = anchorFinalNetPts + 1;
    // Allow same points on tiebreak if anchorPos > 1 and margin is tight, otherwise strictly higher
    for (let i = peersAbove.length - 1; i >= 0; i--) {
      const posNum = i + 1;
      const peer = peersAbove[i];
      const isDirectRival =
        directRivalOverride &&
        peer.name.toLowerCase().trim() === directRivalOverride.name.toLowerCase().trim();
      if (isDirectRival && directRivalOverride.pts >= anchorFinalNetPts) {
        aboveTargetPts[i] = Math.min(98, Math.max(anchorFinalNetPts, directRivalOverride.pts));
      } else {
        const baseCurvePts =
          (DEFAULT_MD34_CURVE[posNum] || 50) + seededInt(`pts-${year}-${country}-${tier}-${posNum}`, -1, 1);
        aboveTargetPts[i] = Math.min(98, Math.max(minAllowedPts, baseCurvePts));
      }
      minAllowedPts = aboveTargetPts[i] + 1;
    }
  }

  const belowTargetPts: number[] = new Array(peersBelow.length).fill(0);
  if (peersBelow.length > 0) {
    let maxAllowedPts = userInTier ? Math.max(6, anchorFinalNetPts - 1) : 95;
    for (let i = 0; i < peersBelow.length; i++) {
      const posNum = userInTier ? anchorPos + 1 + i : i + 1;
      const peer = peersBelow[i];
      const isDirectRival =
        directRivalOverride &&
        peer.name.toLowerCase().trim() === directRivalOverride.name.toLowerCase().trim();
      if (isDirectRival && directRivalOverride.pts <= anchorFinalNetPts) {
        belowTargetPts[i] = Math.max(6, Math.min(anchorFinalNetPts, directRivalOverride.pts));
      } else {
        const baseCurvePts =
          (DEFAULT_MD34_CURVE[posNum] || Math.max(12, 30 - i * 2)) +
          seededInt(`pts-${year}-${country}-${tier}-${posNum}`, -1, 1);
        // For user finishing #1, allow a realistic competitive #2 gap (within 2-7 pts unless extreme pts)
        if (userInTier && i === 0 && anchorPos === 1 && !directRivalOverride) {
          const competitiveSecond = Math.min(maxAllowedPts, Math.max(baseCurvePts, anchorFinalNetPts - seededInt(`gap-${year}-${country}`, 2, 6)));
          belowTargetPts[i] = Math.max(6, competitiveSecond);
        } else {
          belowTargetPts[i] = Math.max(6, Math.min(maxAllowedPts, baseCurvePts));
        }
      }
      maxAllowedPts = Math.max(6, belowTargetPts[i] - 1);
    }
  }

  const lockedFhAnchorPos = pendingSeasonState?._meta?.lockedFirstHalfAnchorPos;
  const lockedFhHalfMds = pendingSeasonState?.dilemmaMatchday || Math.floor(totalMatchdays / 2);
  const lockedFirstHalfPeerMap =
    userInTier && lockedFhAnchorPos != null && !userOverrideFinal && !directRivalOverride
      ? buildLockedFirstHalfPeerMap({
          orderedPeers,
          year,
          country,
          tier,
          totalMatchdays,
          halfMds: lockedFhHalfMds,
          lockedAnchorPos: lockedFhAnchorPos,
          lockedAnchorNetPts: Math.max(
            0,
            (pendingSeasonState?._meta?.lockedFirstHalfAnchorPts ?? DEFAULT_MD34_CURVE[lockedFhAnchorPos] ?? 42) -
              userPointsDeducted
          ),
          lockedAnchorGd: pendingSeasonState?._meta?.lockedFirstHalfAnchorGd ?? anchorFinalGd,
        })
      : null;

  const buildPeerRowAtMd = (
    club: Club,
    targetPos34: number,
    targetPts34: number,
    mustBeatUserGd: boolean,
    mustTrailUserGd: boolean,
    overrideGd34?: number
  ): LiveStandingsRow => {
    const { w: w34, d: d34, l: l34 } = deriveWdLFromPts(targetPts34, totalMatchdays);
    let gf34 = Math.max(
      w34 + 6,
      Math.round(w34 * 2.08 + d34 * 1.05 + l34 * 0.45 + (targetPos34 <= 3 ? (4 - targetPos34) * 3 : 2))
    );
    let ga34 = Math.max(
      l34 + 6,
      Math.round(l34 * 1.78 + d34 * 0.95 + w34 * 0.42 + (targetPos34 - 1) * 0.42 + 3)
    );

    if (overrideGd34 !== undefined) {
      if (overrideGd34 >= 0) {
        gf34 = Math.max(w34 + d34, l34 + d34 + overrideGd34, ga34 + overrideGd34);
        ga34 = gf34 - overrideGd34;
      } else {
        ga34 = Math.max(l34 + d34, w34 + d34 - overrideGd34, gf34 - overrideGd34);
        gf34 = ga34 + overrideGd34;
      }
    } else if (mustBeatUserGd && gf34 - ga34 <= anchorFinalGd) {
      gf34 = Math.max(w34 + d34, ga34 + anchorFinalGd + 1);
    } else if (mustTrailUserGd && gf34 - ga34 >= anchorFinalGd) {
      ga34 = Math.max(l34 + d34, gf34 - (anchorFinalGd - 1));
    }

    const peerSched = composePeerScheduleWithLockedFirstHalf(
      `${year}-${country}-${tier}-${club.id}-${club.name}`,
      { pts: targetPts34, w: w34, d: d34, l: l34, gf: gf34, ga: ga34 },
      totalMatchdays,
      lockedFirstHalfPeerMap?.get(`${club.id}-${club.name}`)
    );

    const slice = peerSched.slice(0, effectiveMd);
    const w = slice.filter((m) => m.res === 'W').length;
    const d = slice.filter((m) => m.res === 'D').length;
    const l = slice.filter((m) => m.res === 'L').length;
    const gf = slice.reduce((s, m) => s + m.gf, 0);
    const ga = slice.reduce((s, m) => s + m.ga, 0);
    const pts = w * 3 + d;
    const gdNum = gf - ga;
    const isDebtPenalized = Boolean(insolventClubName && club.name === insolventClubName);

    return {
      pos: targetPos34,
      id: club.id,
      name: club.name,
      color: club.color,
      logo: isModActive ? club.logo : undefined,
      mp: effectiveMd,
      w,
      d,
      l,
      gf,
      ga,
      pts,
      gd: gdNum > 0 ? `+${gdNum}` : `${gdNum}`,
      isUser: false,
      isReserve: Boolean(club.isReserve) || isReserveTeam(club.name),
      isRival: isPeerRival(club),
      pointsDeducted: isDebtPenalized ? 2 : undefined,
      form: slice.slice(-5).map((m) => m.res),
    };
  };

  const rows: LiveStandingsRow[] = [];

  peersAbove.forEach((club, idx) => {
    const pos34 = idx + 1;
    const pts34 = aboveTargetPts[idx];
    const isRival =
      directRivalOverride && club.name.toLowerCase().trim() === directRivalOverride.name.toLowerCase().trim();
    rows.push(
      buildPeerRowAtMd(
        club,
        pos34,
        pts34,
        pts34 === anchorFinalNetPts,
        false,
        isRival ? directRivalOverride?.gd : undefined
      )
    );
  });

  if (userInTier && userClub) {
    let w = 0;
    let d = 0;
    let l = 0;
    let gf = 0;
    let ga = 0;
    let pts = 0;
    let form: ('W' | 'D' | 'L')[] = [];

    if (effectiveMd >= totalMatchdays && userOverrideFinal) {
      w = userOverrideFinal.w;
      d = userOverrideFinal.d;
      l = userOverrideFinal.l;
      gf = userOverrideFinal.gf;
      ga = userOverrideFinal.ga;
      pts = userOverrideFinal.pts;
      form = schedule.slice(0, totalMatchdays - 1).slice(-4).map((m) => m.result);
      const lastRes: 'W' | 'D' | 'L' =
        w > (schedule[totalMatchdays - 2]?.runningWins ?? 0)
          ? 'W'
          : d > (schedule[totalMatchdays - 2]?.runningDraws ?? 0)
          ? 'D'
          : 'L';
      form.push(lastRes);
    } else if (latestOutcome) {
      w = latestOutcome.runningWins ?? latestOutcome.runningW ?? 0;
      d = latestOutcome.runningDraws ?? latestOutcome.runningD ?? 0;
      l = latestOutcome.runningLosses ?? latestOutcome.runningL ?? Math.max(0, effectiveMd - w - d);
      gf = latestOutcome.runningGf ?? w * 2;
      ga = latestOutcome.runningGa ?? l * 2;
      const rawPts = latestOutcome.runningPoints ?? latestOutcome.runningPts ?? w * 3 + d;
      pts =
        effectiveMd >= totalMatchdays && userPointsDeducted > 0
          ? Math.max(0, rawPts - userPointsDeducted)
          : rawPts;
      form = schedule.slice(0, effectiveMd).slice(-5).map((m) => m.result);
    } else if (schedule.length >= effectiveMd && effectiveMd > 0) {
      const slice = schedule.slice(0, effectiveMd);
      const outcomeAtMd = slice[slice.length - 1];
      w = outcomeAtMd.runningWins ?? slice.filter((m) => m.result === 'W').length;
      d = outcomeAtMd.runningDraws ?? slice.filter((m) => m.result === 'D').length;
      l = outcomeAtMd.runningLosses ?? slice.filter((m) => m.result === 'L').length;
      gf = outcomeAtMd.runningGf ?? slice.reduce((s, m) => s + m.userGoals, 0);
      ga = outcomeAtMd.runningGa ?? slice.reduce((s, m) => s + m.oppGoals, 0);
      const rawPts = outcomeAtMd.runningPts ?? w * 3 + d;
      pts =
        effectiveMd >= totalMatchdays && userPointsDeducted > 0
          ? Math.max(0, rawPts - userPointsDeducted)
          : rawPts;
      form = slice.slice(-5).map((m) => m.result);
    } else {
      const derived = deriveWdLFromPts(anchorFinalNetPts, totalMatchdays);
      w = Math.round((derived.w * effectiveMd) / totalMatchdays);
      d = Math.min(effectiveMd - w, Math.round((derived.d * effectiveMd) / totalMatchdays));
      l = Math.max(0, effectiveMd - w - d);
      gf = Math.round(w * 2 + d);
      ga = Math.round(l * 1.8 + d);
      pts = w * 3 + d;
    }

    const userGdNum = gf - ga;
    rows.push({
      pos: anchorPos,
      id: userClub.id,
      name: userClub.name,
      color: userClub.color,
      logo: isModActive ? userClub.logo : undefined,
      mp: effectiveMd,
      w,
      d,
      l,
      gf,
      ga,
      pts,
      gd: userGdNum > 0 ? `+${userGdNum}` : `${userGdNum}`,
      isUser: true,
      isReserve: Boolean(userClub.isReserve) || isReserveTeam(userClub.name),
      isRival: false,
      pointsDeducted: userPointsDeducted > 0 ? userPointsDeducted : undefined,
      form,
    });
  }

  peersBelow.forEach((club, idx) => {
    const pos34 = userInTier ? anchorPos + 1 + idx : idx + 1;
    const pts34 = belowTargetPts[idx];
    const isRival =
      directRivalOverride && club.name.toLowerCase().trim() === directRivalOverride.name.toLowerCase().trim();
    rows.push(
      buildPeerRowAtMd(
        club,
        pos34,
        pts34,
        false,
        pts34 === anchorFinalNetPts,
        isRival ? directRivalOverride?.gd : undefined
      )
    );
  });

  rows.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdDiff = parseInt(String(b.gd || 0), 10) - parseInt(String(a.gd || 0), 10);
    if (gdDiff !== 0) return gdDiff;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (b.w !== a.w) return b.w - a.w;
    if (a.isUser !== b.isUser) return a.isUser ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const maxPlayoffRank = ['ENG', 'ESP', 'ITA', 'USA', 'FRA', 'SCO'].includes(country) ? 6 : 3;
  const maxCountryTier = getMaxTier(country);
  rows.forEach((r, idx) => {
    r.pos = idx + 1;
    r.isPromotionZone = tier > 1 ? idx < Math.max(2, maxPlayoffRank) : idx < 4;
    r.isRelegationZone = tier < maxCountryTier && idx >= rows.length - 3;
  });

  return rows;
};

/**
 * Stamps every matchday outcome (MD 1..totalMatchdays) with the exact user league position
 * produced by `buildDeterministicDivisionTable` so live ticker, Mid-Season Dilemma, Winter Break,
 * Standings preview, and Full League Table share one 100% consistent source of truth.
 */
export const syncScheduleRunningPositions = (params: {
  year: number;
  country: string;
  tier: number;
  totalMatchdays?: number;
  userClub: Club;
  peers: Club[];
  pendingSeasonState: PendingSeasonState;
  rivalClub?: { id?: number | string; name?: string } | null;
  userPointsDeducted?: number;
  isModActive?: boolean;
}): { schedule: MatchdayOutcome[]; midPos: number; midPts: number } => {
  const {
    year,
    country,
    tier,
    totalMatchdays = 34,
    userClub,
    peers,
    pendingSeasonState,
    rivalClub,
    userPointsDeducted = 0,
    isModActive = false,
  } = params;

  const schedule = (pendingSeasonState.matchdaySchedule || pendingSeasonState.schedule || []).map((m) => ({ ...m }));
  if (schedule.length === 0) {
    return {
      schedule,
      midPos: pendingSeasonState.pos || pendingSeasonState.approxPos || 9,
      midPts: Math.round((pendingSeasonState.pts || 40) / 2),
    };
  }

  const orderedPeers = [...peers].sort((a, b) => {
    const bScore = (b.baseOvr || 65) + seededInt(`str-${year}-${country}-${tier}-${b.id}-${b.name}`, -4, 4);
    const aScore = (a.baseOvr || 65) + seededInt(`str-${year}-${country}-${tier}-${a.id}-${a.name}`, -4, 4);
    if (bScore !== aScore) return bScore - aScore;
    return a.name.localeCompare(b.name);
  });

  const lastScheduled = schedule[schedule.length - 1];
  const anchorPos = Math.max(
    1,
    Math.min(18, pendingSeasonState.pos ?? pendingSeasonState.approxPos ?? lastScheduled?.runningPos ?? 9)
  );
  const anchorFinalNetPts = Math.max(
    0,
    (pendingSeasonState.pts ?? lastScheduled?.runningPts ?? DEFAULT_MD34_CURVE[anchorPos] ?? 42) - userPointsDeducted
  );
  const anchorFinalGd =
    pendingSeasonState.gd ?? ((pendingSeasonState.gf ?? 52) - (pendingSeasonState.ga ?? 42));

  const peerListForTable = orderedPeers.slice(0, 17);
  const aboveCount = Math.max(0, Math.min(peerListForTable.length, anchorPos - 1));
  const peersAbove = peerListForTable.slice(0, aboveCount);
  const peersBelow = peerListForTable.slice(aboveCount);

  const aboveTargetPts: number[] = new Array(peersAbove.length).fill(0);
  if (peersAbove.length > 0) {
    let minAllowedPts = anchorFinalNetPts + 1;
    for (let i = peersAbove.length - 1; i >= 0; i--) {
      const posNum = i + 1;
      const baseCurvePts =
        (DEFAULT_MD34_CURVE[posNum] || 50) + seededInt(`pts-${year}-${country}-${tier}-${posNum}`, -1, 1);
      aboveTargetPts[i] = Math.min(98, Math.max(minAllowedPts, baseCurvePts));
      minAllowedPts = aboveTargetPts[i] + 1;
    }
  }

  const belowTargetPts: number[] = new Array(peersBelow.length).fill(0);
  if (peersBelow.length > 0) {
    let maxAllowedPts = Math.max(6, anchorFinalNetPts - 1);
    for (let i = 0; i < peersBelow.length; i++) {
      const posNum = anchorPos + 1 + i;
      const baseCurvePts =
        (DEFAULT_MD34_CURVE[posNum] || Math.max(12, 30 - i * 2)) +
        seededInt(`pts-${year}-${country}-${tier}-${posNum}`, -1, 1);
      if (i === 0 && anchorPos === 1) {
        const competitiveSecond = Math.min(
          maxAllowedPts,
          Math.max(baseCurvePts, anchorFinalNetPts - seededInt(`gap-${year}-${country}`, 2, 6))
        );
        belowTargetPts[i] = Math.max(6, competitiveSecond);
      } else {
        belowTargetPts[i] = Math.max(6, Math.min(maxAllowedPts, baseCurvePts));
      }
      maxAllowedPts = Math.max(6, belowTargetPts[i] - 1);
    }
  }

  // Pre-build cumulative MD stats for all 17 peers ONCE (O(17 * 34) -> < 0.2ms total)
  interface PeerCumStats {
    name: string;
    pts: number[];
    gd: number[];
    gf: number[];
    w: number[];
  }

  const lockedSyncAnchorPos = pendingSeasonState._meta?.lockedFirstHalfAnchorPos;
  const lockedSyncHalfMds = pendingSeasonState.dilemmaMatchday || Math.floor(totalMatchdays / 2);
  const lockedSyncPeerMap =
    lockedSyncAnchorPos != null
      ? buildLockedFirstHalfPeerMap({
          orderedPeers,
          year,
          country,
          tier,
          totalMatchdays,
          halfMds: lockedSyncHalfMds,
          lockedAnchorPos: lockedSyncAnchorPos,
          lockedAnchorNetPts: Math.max(
            0,
            (pendingSeasonState._meta?.lockedFirstHalfAnchorPts ?? DEFAULT_MD34_CURVE[lockedSyncAnchorPos] ?? 42) -
              userPointsDeducted
          ),
          lockedAnchorGd: pendingSeasonState._meta?.lockedFirstHalfAnchorGd ?? anchorFinalGd,
        })
      : null;

  const buildPeerCum = (
    club: Club,
    targetPos34: number,
    targetPts34: number,
    mustBeatUserGd: boolean,
    mustTrailUserGd: boolean
  ): PeerCumStats => {
    const { w: w34, d: d34, l: l34 } = deriveWdLFromPts(targetPts34, totalMatchdays);
    let gf34 = Math.max(
      w34 + 6,
      Math.round(w34 * 2.08 + d34 * 1.05 + l34 * 0.45 + (targetPos34 <= 3 ? (4 - targetPos34) * 3 : 2))
    );
    let ga34 = Math.max(
      l34 + 6,
      Math.round(l34 * 1.78 + d34 * 0.95 + w34 * 0.42 + (targetPos34 - 1) * 0.42 + 3)
    );
    if (mustBeatUserGd && gf34 - ga34 <= anchorFinalGd) {
      gf34 = Math.max(w34 + d34, ga34 + anchorFinalGd + 1);
    } else if (mustTrailUserGd && gf34 - ga34 >= anchorFinalGd) {
      ga34 = Math.max(l34 + d34, gf34 - (anchorFinalGd - 1));
    }

    const peerSched = composePeerScheduleWithLockedFirstHalf(
      `${year}-${country}-${tier}-${club.id}-${club.name}`,
      { pts: targetPts34, w: w34, d: d34, l: l34, gf: gf34, ga: ga34 },
      totalMatchdays,
      lockedSyncPeerMap?.get(`${club.id}-${club.name}`)
    );

    const ptsArr = new Array<number>(totalMatchdays);
    const gdArr = new Array<number>(totalMatchdays);
    const gfArr = new Array<number>(totalMatchdays);
    const wArr = new Array<number>(totalMatchdays);

    let cw = 0;
    let cd = 0;
    let cgf = 0;
    let cga = 0;
    for (let i = 0; i < totalMatchdays; i++) {
      const m = peerSched[i];
      if (m) {
        if (m.res === 'W') cw += 1;
        else if (m.res === 'D') cd += 1;
        cgf += m.gf;
        cga += m.ga;
      }
      ptsArr[i] = cw * 3 + cd;
      gdArr[i] = cgf - cga;
      gfArr[i] = cgf;
      wArr[i] = cw;
    }

    return { name: club.name, pts: ptsArr, gd: gdArr, gf: gfArr, w: wArr };
  };

  const peerCums: PeerCumStats[] = [
    ...peersAbove.map((club, idx) =>
      buildPeerCum(club, idx + 1, aboveTargetPts[idx], aboveTargetPts[idx] === anchorFinalNetPts, false)
    ),
    ...peersBelow.map((club, idx) =>
      buildPeerCum(club, anchorPos + 1 + idx, belowTargetPts[idx], false, belowTargetPts[idx] === anchorFinalNetPts)
    ),
  ];

  // Rank user against all 17 peers at every matchday using the exact comparator from buildDeterministicDivisionTable
  for (let idx = 0; idx < schedule.length; idx++) {
    const md = idx + 1;
    const outcome = schedule[idx];
    const uW = outcome.runningWins ?? outcome.runningW ?? 0;
    const uD = outcome.runningDraws ?? outcome.runningD ?? 0;
    const uGf = outcome.runningGf ?? uW * 2;
    const uGa = outcome.runningGa ?? Math.max(0, md - uW - uD) * 2;
    const uGd = uGf - uGa;
    const rawUPts = outcome.runningPoints ?? outcome.runningPts ?? uW * 3 + uD;
    const uPts = md >= totalMatchdays && userPointsDeducted > 0 ? Math.max(0, rawUPts - userPointsDeducted) : rawUPts;

    let aheadCount = 0;
    for (let p = 0; p < peerCums.length; p++) {
      const peer = peerCums[p];
      const pPts = peer.pts[idx] ?? 0;
      const pGd = peer.gd[idx] ?? 0;
      const pGf = peer.gf[idx] ?? 0;
      const pW = peer.w[idx] ?? 0;
      // Same tiebreak order as buildDeterministicDivisionTable (note: on full tie user sorts ahead)
      if (
        pPts > uPts ||
        (pPts === uPts && pGd > uGd) ||
        (pPts === uPts && pGd === uGd && pGf > uGf) ||
        (pPts === uPts && pGd === uGd && pGf === uGf && pW > uW)
      ) {
        aheadCount += 1;
      }
    }

    const exactPos = aheadCount + 1;
    outcome.runningPos = exactPos;
    outcome.runningPosition = exactPos;
  }

  const halfwayIdx = Math.min(schedule.length - 1, Math.max(0, (pendingSeasonState.dilemmaMatchday || 17) - 1));
  const midRow = buildDeterministicDivisionTable({
    year,
    country,
    tier,
    playedMatchdays: halfwayIdx + 1,
    totalMatchdays,
    userClub,
    userInTier: true,
    peers,
    pendingSeasonState: { ...pendingSeasonState, schedule, matchdaySchedule: schedule },
    latestOutcome: schedule[halfwayIdx],
    rivalClub,
    userPointsDeducted,
    isModActive,
  }).find((r) => r.isUser);

  const midPos = midRow?.pos ?? schedule[halfwayIdx]?.runningPos ?? anchorPos;
  const midPts = midRow?.pts ?? schedule[halfwayIdx]?.runningPts ?? 24;
  if (schedule[halfwayIdx]) {
    schedule[halfwayIdx].runningPos = midPos;
    schedule[halfwayIdx].runningPosition = midPos;
  }

  return { schedule, midPos, midPts };
};

/**
 * Estimates annual financial-audit point deduction coherently across pre-sim & end-of-season.
 */
export const estimateDebtPointDeduction = (
  budget: number,
  seasonsInDebt: number = 0,
  projectedNet: number = 0
): number => {
  if (budget >= -500 || projectedNet >= 0) return 0;
  const baseDeduction = Math.floor(Math.abs(budget) / 2000);
  if (seasonsInDebt === 0) {
    return Math.min(2, Math.max(1, Math.abs(budget) < 2000 ? 1 : 2));
  }
  if (seasonsInDebt === 1) {
    return Math.min(5, Math.max(2, baseDeduction));
  }
  return Math.min(15, Math.max(3, baseDeduction * seasonsInDebt));
};

export type StandingsZoneStatus =
  | 'champion'
  | 'champions_league'
  | 'euro_quali'
  | 'auto_promo'
  | 'playoff'
  | 'relegation'
  | undefined;

export interface StandingsRowPresentation {
  consequenceBorder: string;
  consequenceTitle: string;
  rowBg: string;
  showRivalBadge: boolean;
}

export const resolveStandingsRowPresentation = (params: {
  status: StandingsZoneStatus;
  cannotPromote: boolean;
  isUser?: boolean;
  isRival?: boolean;
  rowIndex: number;
  legendLabels: {
    champTooltip: string;
    primaryTooltip: string;
    secondaryTooltip: string;
    relegation: string;
  };
}): StandingsRowPresentation => {
  const { status, cannotPromote, isUser, isRival, rowIndex, legendLabels } = params;
  let consequenceBorder = 'border-l-4 border-transparent';
  let consequenceTitle = '';
  let hasZoneTint = false;

  if (!cannotPromote) {
    if (status === 'champion') {
      consequenceBorder = 'border-l-4 border-amber-500 bg-amber-50/75';
      consequenceTitle = legendLabels.champTooltip;
      hasZoneTint = true;
    } else if (status === 'champions_league') {
      consequenceBorder = 'border-l-4 border-amber-400 bg-amber-50/45';
      consequenceTitle = legendLabels.primaryTooltip;
      hasZoneTint = true;
    } else if (status === 'auto_promo') {
      consequenceBorder = 'border-l-4 border-emerald-500 bg-emerald-50/70';
      consequenceTitle = 'Automatic Promotion';
      hasZoneTint = true;
    } else if (status === 'euro_quali') {
      consequenceBorder = 'border-l-4 border-sky-500 bg-sky-50/55';
      consequenceTitle = legendLabels.secondaryTooltip;
      hasZoneTint = true;
    } else if (status === 'playoff') {
      consequenceBorder = 'border-l-4 border-sky-500 bg-sky-50/55';
      consequenceTitle = 'Promotion Playoff';
      hasZoneTint = true;
    }
  }

  if (status === 'relegation') {
    consequenceBorder = 'border-l-4 border-rose-500 bg-rose-50/65';
    consequenceTitle = legendLabels.relegation;
    hasZoneTint = true;
  }

  const rowBg = isUser
    ? 'bg-sky-50 ring-1 ring-inset ring-sky-300 relative z-10'
    : hasZoneTint
    ? ''
    : rowIndex % 2 === 0
    ? ''
    : 'bg-[#FAF9F6]';

  return {
    consequenceBorder,
    consequenceTitle,
    rowBg,
    showRivalBadge: Boolean(isRival && !isUser),
  };
};

