import { Club, UniverseMovement } from '../types';
import { getMaxTier, isReserveClub, getLeagueInfo, getMinAllowedTierForReserve, normalizeCountryCode, isCanadianMLSClub, getDomesticCupInfo } from '../data/gameConstants';
import { CONMEBOL_COUNTRIES, CONCACAF_COUNTRIES, AFC_COUNTRIES, UEFA_COUNTRIES, getContinentalCupNames } from '../utils/regionHelpers';

export { getMinAllowedTierForReserve };

const topHeavyweightNames = new Set([
  'Munich Red', 'Leverkusen Red-Black', 'Dortmund Yellow', 'Leipzig Rasen',
  'Man Blue', 'Merseyside Red', 'North London Red', 'Madrid FC',
  'Catalonia FC', 'Atlético M.', 'FC Bavaria', 'Borussia West',
  'Manchester Blue', 'London Blue', 'Manchester United', 'PSG', 
  'Piemonte Calcio', 'Milan Blue', 'AC Milan', 'Paris Blue-Red',
  'Turin Black-White', 'Milan Red-Black', 'Milan Blue-Black', 'Naples Blue',
  'Bavaria München', 'Prussia Dortmund', 'Rasen Leipzig', 'SV Leverkusen 04', 'VfL Stuttgart',
  'FC Bayern München', 'Bayer 04 Leverkusen', 'Borussia Dortmund', 'RB Leipzig', 'VfB Stuttgart', 'Eintracht Frankfurt',
  'Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Tottenham Hotspur',
  'Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Paris Saint-Germain',
  'Inter Milan', 'Juventus', 'Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor',
  'Galata SK', 'Kadıköy FK', 'Boğaziçi Beşiktaş', 'Karadeniz Trabzon'
]);

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const reserveNameCache = new Map<string, boolean>();

// Exception logic for clubs ending in II that are not actually reserve teams
export const isReserveTeamLocal = (name: string): boolean => {
  if (!name) return false;
  const cached = reserveNameCache.get(name);
  if (cached !== undefined) return cached;
  const res = (name === 'SSV Jeddeloh II' || name.toLowerCase().includes('jeddeloh ii'))
    ? false
    : isReserveClub(name);
  reserveNameCache.set(name, res);
  return res;
};

const RESERVE_ID_TO_PARENT_IDS: Record<number, number[]> = {
  37: [3],
  38: [24],
  39: [5],
  81: [45],
  91: [32],
  99: [27],
  100: [93],
  105: [19],
  106: [14],
  107: [28],
  108: [21],
  109: [25],
  112: [13],
  113: [6],
  115: [1],
  116: [11],
  117: [30],
  168: [35],
  234: [202],
  235: [203],
  237: [201],
  253: [204],
  254: [205],
  270: [259],
  298: [293],
  306: [261],
  307: [293],
  546: [503],
  547: [502],
  576: [561, 559],
  583: [512],
  596: [524, 526],
  871: [850],
  1060: [1024]
};

const SPECIAL_RESERVE_PARENT_NAMES: Record<string, string[]> = {
  'independiente juniors': ['independiente del valle', 'valle negra'],
  'valle negra b': ['valle negra', 'independiente del valle'],
  'deportivo aragón': ['real zaragoza', 'zaragoza'],
  'deportivo aragon': ['real zaragoza', 'zaragoza'],
  'zaragoza ii': ['zaragoza', 'real zaragoza'],
  'lusitano évora b': ['lusitano de évora', 'évora'],
  'évora b': ['évora', 'lusitano de évora'],
  'barça atlètic': ['fc barcelona', 'barcelona', 'catalonia fc'],
  'barcelona atlètic': ['fc barcelona', 'barcelona', 'catalonia fc'],
  'barcelona ii': ['fc barcelona', 'barcelona', 'catalonia fc'],
  'fc barcelona b': ['fc barcelona', 'barcelona', 'catalonia fc'],
  'madrid rojo y blanco ii': ['madrid rojo y blanco', 'atlético de madrid', 'atlético madrid'],
  'atlético madrid b': ['atlético de madrid', 'atlético madrid', 'madrid rojo y blanco'],
  'atlético de madrid b': ['atlético de madrid', 'atlético madrid', 'madrid rojo y blanco'],
  'atletico madrid b': ['atlético de madrid', 'atlético madrid', 'madrid rojo y blanco'],
  'real madrid castilla': ['real madrid cf', 'real madrid', 'madrid blanco', 'madrid fc'],
  'celta fortuna': ['rc celta de vigo', 'celta vigo', 'vigo'],
  'rc celta fortuna': ['rc celta de vigo', 'celta vigo', 'vigo'],
  'vigo ii': ['vigo', 'rc celta de vigo'],
  'logroño ii': ['logroño', 'ud logroñés'],
  'bilbao athletic': ['athletic club', 'bilbao'],
  'athletic club b': ['athletic club', 'bilbao']
};

export const getCleanParentClubName = (name: string): string => {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  if (lower === 'independiente juniors') return 'Independiente del Valle';
  if (lower === 'deportivo aragón' || lower === 'deportivo aragon') return 'Real Zaragoza';
  if (lower === 'lusitano évora b') return 'Lusitano de Évora';
  if (lower === 'barça atlètic' || lower === 'barcelona atlètic') return 'FC Barcelona';
  if (lower === 'real madrid castilla') return 'Real Madrid';
  if (lower === 'celta fortuna' || lower === 'rc celta fortuna') return 'RC Celta de Vigo';

  return name
    .replace(/^Jong\s+/i, '')
    .replace(/\s+II$/i, '')
    .replace(/\s+2$/i, '')
    .replace(/\s+\(?B\)?$/i, '')
    .replace(/\s+B$/i, '')
    .replace(/\s+U23$/i, '')
    .replace(/\s+U21$/i, '')
    .replace(/\s+Res\.?$/i, '')
    .replace(/\s+Reserves?$/i, '')
    .replace(/\s+Castilla$/i, '')
    .replace(/\s+Atlètic$/i, '')
    .replace(/\s+Juniors$/i, '')
    .replace(/\s+Filial$/i, '')
    .trim();
};

export const getParentClub = (
  reserveNameOrClub: string | Club,
  allClubs: Club[],
  country?: string
): Club | undefined => {
  const reserveClubObj = typeof reserveNameOrClub === 'object' && reserveNameOrClub !== null ? reserveNameOrClub : undefined;
  const reserveName = reserveClubObj ? reserveClubObj.name : String(reserveNameOrClub || '');
  const resolvedCountry = normalizeCountryCode(country || reserveClubObj?.country || 'GER');

  if (!isReserveTeamLocal(reserveName) && !reserveClubObj?.isReserve) return undefined;

  const lowerRes = reserveName.toLowerCase().trim();
  const sameCountrySeniorClubs = allClubs.filter(
    c => !isReserveTeamLocal(c.name) && !c.isReserve && normalizeCountryCode(c.country || 'GER') === resolvedCountry
  );

  // 1. Explicit special reserve-to-parent name mapping
  const specialTargets = SPECIAL_RESERVE_PARENT_NAMES[lowerRes];
  if (specialTargets) {
    for (const targetName of specialTargets) {
      const exactSpecial = sameCountrySeniorClubs.find(c => c.name.toLowerCase().trim() === targetName);
      if (exactSpecial) return exactSpecial;
    }
  }

  // 2. Canonical reserve ID -> parent ID lookup
  const resId = reserveClubObj?.id ?? allClubs.find(
    c => normalizeCountryCode(c.country || 'GER') === resolvedCountry && c.name.toLowerCase().trim() === lowerRes
  )?.id;
  if (resId != null && RESERVE_ID_TO_PARENT_IDS[resId]) {
    for (const parentId of RESERVE_ID_TO_PARENT_IDS[resId]) {
      const byId = sameCountrySeniorClubs.find(c => c.id === parentId);
      if (byId) return byId;
    }
  }

  const parentClean = getCleanParentClubName(reserveName).toLowerCase();
  if (!parentClean) return undefined;

  // 3. Exact name match in same country
  const exactMatch = sameCountrySeniorClubs.find(c => c.name.toLowerCase().trim() === parentClean);
  if (exactMatch) return exactMatch;

  // 4. Normalized match ignoring connectors like "de", "cf", "fc", "sc", "s.c.", "s.l."
  const stripConnectors = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,]/g, '')
      .replace(/\b(de|da|do|cf|fc|sc|sl|rc|ud|cd|ca|cp|fk|sk|tsv|vfb|vfl|sv|1)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const normParent = stripConnectors(parentClean);
  if (normParent) {
    const normMatches = sameCountrySeniorClubs.filter(c => stripConnectors(c.name) === normParent);
    if (normMatches.length === 1) return normMatches[0];
    if (normMatches.length > 1) {
      return [...normMatches].sort((a, b) => (a.tier - b.tier) || ((b.baseOvr || 0) - (a.baseOvr || 0)))[0];
    }
  }

  // 5. Substring match fallback, preferring highest division (lowest tier number) then highest baseOvr
  const substringMatches = sameCountrySeniorClubs.filter(c => {
    const cLower = c.name.toLowerCase().trim();
    return cLower.includes(parentClean) || parentClean.includes(cLower);
  });
  if (substringMatches.length > 0) {
    return [...substringMatches].sort((a, b) => (a.tier - b.tier) || ((b.baseOvr || 0) - (a.baseOvr || 0)))[0];
  }

  return undefined;
};

export const canReserveClubPromoteToTier = (
  reserveClubOrName: string | Club,
  targetTier: number,
  allClubs: Club[],
  countryOrOffset?: string | number,
  projectedOffset: number = 0
): boolean => {
  const isClubObj = typeof reserveClubOrName === 'object' && reserveClubOrName !== null;
  const reserveClubName = isClubObj ? reserveClubOrName.name : String(reserveClubOrName || '');
  const resolvedCountry = normalizeCountryCode(
    typeof countryOrOffset === 'string'
      ? countryOrOffset
      : (isClubObj ? reserveClubOrName.country : undefined) || 'GER'
  );
  const resolvedOffset = typeof countryOrOffset === 'number' ? countryOrOffset : projectedOffset;

  if (!isReserveTeamLocal(reserveClubName) && !(isClubObj && reserveClubOrName.isReserve)) return true;

  // Rule 1: Country-specific minimum tier ceiling for reserve teams
  // POR, ESP, ECU, USA allow reserves up to Tier 2 (barred from Tier 1);
  // GER and all other countries cap reserves at Tier 3 (barred from Tier 1 and Tier 2).
  const minAllowedTier = getMinAllowedTierForReserve(resolvedCountry);
  if (targetTier < minAllowedTier) return false;

  // Rule 2: Separation from senior parent club (must stay at least 1 tier below parent)
  const parent = getParentClub(reserveClubOrName, allClubs, resolvedCountry);
  if (parent) {
    // In football pyramid, lower tier number means higher division (Tier 1 is top).
    // Reserve club cannot promote if target division is equal to or above parent's division.
    if (targetTier <= parent.tier) return false;
  }

  // Rule 3: Max 4 reserves per division cap
  const reservesInTargetTier = allClubs.filter(
    c => normalizeCountryCode(c.country || 'GER') === resolvedCountry && c.tier === targetTier && (isReserveTeamLocal(c.name) || Boolean(c.isReserve))
  ).length;
  if (reservesInTargetTier + resolvedOffset >= 4) return false;

  return true;
};

export const canReservePromoteToTier = canReserveClubPromoteToTier;

export const simulateTwoLeggedPlayoff = (
  upperClub: Club,
  lowerClub: Club
): {
  upperWon: boolean;
  aggUpper: number;
  aggLower: number;
  detail: string;
} => {
  // Leg 1: at lowerClub stadium (lower gets +3 home advantage)
  const leg1LowerAdv = (lowerClub.baseOvr + 3) - upperClub.baseOvr;
  let lowerGoals1 = Math.max(0, Math.round(1.5 + leg1LowerAdv * 0.08 + rand(-1, 1)));
  let upperGoals1 = Math.max(0, Math.round(1.2 - leg1LowerAdv * 0.08 + rand(-1, 1)));

  // Leg 2: at upperClub stadium (upper gets +4 home advantage)
  const leg2UpperAdv = (upperClub.baseOvr + 4) - lowerClub.baseOvr;
  let upperGoals2 = Math.max(0, Math.round(1.6 + leg2UpperAdv * 0.08 + rand(-1, 1)));
  let lowerGoals2 = Math.max(0, Math.round(1.1 - leg2UpperAdv * 0.08 + rand(-1, 1)));

  let aggUpper = upperGoals1 + upperGoals2;
  let aggLower = lowerGoals1 + lowerGoals2;
  let detail = `Leg 1: ${lowerGoals1}-${upperGoals1} · Leg 2: ${upperGoals2}-${lowerGoals2}`;

  if (aggUpper === aggLower) {
    if (Math.random() < 0.4) {
      if (upperClub.baseOvr > lowerClub.baseOvr || Math.random() < 0.6) {
        aggUpper += 1;
        detail += ` (a.e.t. ${aggUpper}-${aggLower})`;
      } else {
        aggLower += 1;
        detail += ` (a.e.t. ${aggLower}-${aggUpper})`;
      }
    } else {
      const upperWonPens = Math.random() < (0.5 + (upperClub.baseOvr - lowerClub.baseOvr) * 0.02);
      const penUpper = upperWonPens ? 5 : rand(3, 4);
      const penLower = upperWonPens ? rand(3, 4) : 5;
      detail += ` (${penUpper}-${penLower} pens)`;
      return { upperWon: upperWonPens, aggUpper, aggLower, detail };
    }
  }

  return { upperWon: aggUpper > aggLower, aggUpper, aggLower, detail };
};

export interface SimContext {
  ddOpponentId?: number;
  ddOpponentTier?: number;
  ddOpponentRank?: number;
  ddOpponentNextTier?: number;
  userPos?: number;
  userSurvivedPlayoff?: boolean;
  userWonPlayoff?: boolean;
  cupWinners?: { cupId: string, winnerId: number, winnerName: string }[];
}

function* simulateAiLeaguesGen(
  currentClubs: Club[],
  userClubId: number,
  seasonYear = 2026,
  userWonCups: string[] = [],
  userNextTier?: number,
  simContext?: SimContext
): Generator<void, Club[], void> {
  const generatedMovements: UniverseMovement[] = [];

  const updated = currentClubs.map((c) => {
    if (c.id === userClubId) return { ...c };
    
    const isGiant = c.baseOvr >= 78 || topHeavyweightNames.has(c.name);
    
    if (isGiant && !c.isInsolventGiant) {
      const ovrShift = rand(-1, 1);
      const newOvr = Math.max(78, Math.min(98, c.baseOvr + ovrShift));
      return { ...c, baseOvr: newOvr };
    }
    
    let ovrShift = rand(-1, 2);
    // Steady Multi-Year Rise: non-giant clubs in Tier 2+ get 8% chance of an organic development surge (+1 to +3 OVR)
    if (!isGiant && c.tier >= 2 && Math.random() < 0.08) {
      ovrShift += Math.floor(Math.random() * 3) + 1; // +1 to +3
    }
    const newOvr = Math.max(1, Math.min(98, c.baseOvr + ovrShift));
    return { ...c, baseOvr: newOvr };
  });

  // ~1.5% (0.015) Realistic Fallen Giant Insolvency Event for Tier 1 Heavyweights
  let insolventGiantMovement: UniverseMovement | null = null;
  if (Math.random() < 0.015) {
    const eligibleInsolventGiants = updated.filter(
      (c) =>
        c.id !== userClubId &&
        (c.country || 'GER') !== 'ECU' &&
        getMaxTier(c.country || 'GER', updated) > 1 &&
        c.tier === 1 &&
        (c.baseOvr >= 78 || topHeavyweightNames.has(c.name)) &&
        !c.isInsolventGiant
    );

    if (eligibleInsolventGiants.length > 0) {
      const pickedGiant = eligibleInsolventGiants[Math.floor(Math.random() * eligibleInsolventGiants.length)];
      pickedGiant.isInsolventGiant = true;
      
      // Track the number of times this club has gone insolvent
      pickedGiant.insolvencyCount = (pickedGiant.insolvencyCount || 0) + 1;
      
      let resetTier = pickedGiant.country === 'ENG' ? 5 : 4;
      let ovrPenalty = 32;
      
      if (pickedGiant.country === 'GER') {
        // FA ultimatum rules for Germany: 
        // 1st insolvency -> League 5 (Oberliga)
        // 2nd insolvency -> League 7 (Landesliga)
        if (pickedGiant.insolvencyCount > 1) {
          resetTier = 7;
          ovrPenalty = 50;
        } else {
          resetTier = 5;
          ovrPenalty = 34;
        }
      } else if (pickedGiant.country === 'ENG') {
        resetTier = 5; // National League
        ovrPenalty = 34;
      } else {
        resetTier = Math.min(4, getMaxTier(pickedGiant.country || 'GER', updated));
        ovrPenalty = 30;
      }
      
      const targetTier = Math.min(resetTier, getMaxTier(pickedGiant.country || 'GER', updated));
      pickedGiant.baseOvr = Math.max(15, pickedGiant.baseOvr - ovrPenalty);

      insolventGiantMovement = {
        id: `sim-ins-${pickedGiant.id}-${seasonYear}`,
        year: seasonYear,
        clubId: pickedGiant.id,
        clubName: pickedGiant.name,
        clubLogo: pickedGiant.logo,
        clubColor: pickedGiant.color,
        country: pickedGiant.country || 'GER',
        fromTier: 1,
        toTier: targetTier,
        fromLeagueName: getLeagueInfo(1, pickedGiant.country || 'GER').name,
        toLeagueName: getLeagueInfo(targetTier, pickedGiant.country || 'GER').name,
        type: 'insolvency_drop',
        pos: 18,
        reason: 'Insolvency & Severe Financial Administration Demotion'
      };
      generatedMovements.push(insolventGiantMovement);

      // Perform an administrative vacancy cascade promotion from targetTier up to Tier 1
      // to strictly preserve tier capacities across the pyramid
      const gCountry = pickedGiant.country || 'GER';
      pickedGiant.tier = targetTier;

      for (let t = targetTier - 1; t >= 1; t--) {
        const lowerTierClubs = updated.filter(
          (c) => (c.country || 'GER') === gCountry && c.tier === t + 1 && c.id !== userClubId && c.id !== pickedGiant.id
        );
        // Reserve teams must obey country-specific minimum tier and parent separation rules
        const eligible = lowerTierClubs.filter((c) => canReserveClubPromoteToTier(c, t, updated, gCountry));
        if (eligible.length > 0) {
          eligible.sort((a, b) => b.baseOvr - a.baseOvr);
          const promoteCandidate = eligible[0];
          promoteCandidate.tier = t;
          generatedMovements.push({
            id: `sim-admin-pro-${promoteCandidate.id}-${seasonYear}`,
            year: seasonYear,
            clubId: promoteCandidate.id,
            clubName: promoteCandidate.name,
            clubLogo: promoteCandidate.logo,
            clubColor: promoteCandidate.color,
            country: gCountry,
            fromTier: t + 1,
            toTier: t,
            fromLeagueName: getLeagueInfo(t + 1, gCountry).name,
            toLeagueName: getLeagueInfo(t, gCountry).name,
            type: 'promotion',
            pos: 1,
            reason: `Administrative Vacancy Promotion · Elevated to replace demoted club`
          });
        }
      }
    }
  }

  const clubById = new Map<number | string, Club>();
  const clubsByCountry = new Map<string, Club[]>();
  for (let i = 0; i < updated.length; i++) {
    const c = updated[i];
    if (c.id != null) clubById.set(c.id, c);
    const cCountry = c.country || 'GER';
    let list = clubsByCountry.get(cCountry);
    if (!list) {
      list = [];
      clubsByCountry.set(cCountry, list);
    }
    list.push(c);
  }

  const userClub = clubById.get(userClubId);
  const userCountry = userClub?.country || 'GER';

  // Group promotion/relegation STRICTLY PER COUNTRY to keep national tier structures intact
  const countries = Array.from(clubsByCountry.keys());
  const movedClubIds = new Set<number | string>();
  if (insolventGiantMovement) {
    movedClubIds.add(insolventGiantMovement.clubId);
  }

  const standingsArchive: Record<number, any[]> = {};
  const buildTierTable = (clubsInOrder: Club[], tierNum?: number): any[] => {
    const basePtsMap: Record<number, number> = {
      1: 82, 2: 74, 3: 66, 4: 60, 5: 55, 6: 51,
      7: 48, 8: 45, 9: 42, 10: 40, 11: 37, 12: 35,
      13: 33, 14: 31, 15: 28, 16: 25, 17: 21, 18: 16
    };
    const table = clubsInOrder.map((c, idx) => {
      const pos = idx + 1;
      const basePts = basePtsMap[pos] || Math.max(12, Math.round(85 - pos * 3.5));
      const pts = Math.max(10, Math.min(95, basePts + rand(-2, 2)));
      let w = Math.min(34, Math.max(1, Math.floor(pts / 3)));
      let d = Math.max(0, pts - w * 3);
      while (d < 4 && w > 2 && w + d + 2 <= 34) {
        w -= 1;
        d += 3;
      }
      const l = Math.max(0, 34 - w - d);
      const gf = Math.max(18, Math.round(w * 1.9 + d * 1.1 + rand(2, 8)));
      const ga = Math.max(14, Math.round(l * 1.8 + d * 0.9 + rand(2, 6)));
      const gd = gf - ga;
      return {
        pos,
        id: c.id,
        name: c.name,
        color: c.color,
        logo: c.logo,
        mp: 34,
        w,
        d,
        l,
        gf,
        ga,
        pts,
        gd: gd > 0 ? `+${gd}` : `${gd}`,
        _gdNum: gd,
        isUser: c.id === userClubId,
        isReserve: Boolean(c.isReserve) || isReserveTeamLocal(c.name),
        form: []
      };
    });

    // Ensure table is strictly sorted by points descending, then GD descending, then GF
    table.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b._gdNum !== a._gdNum) return b._gdNum - a._gdNum;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });

    table.forEach((r, idx) => {
      r.pos = idx + 1;
    });

    // In Tier 1, strictly insulate solvent AI heavyweight giants from the bottom 3 relegation zone
    if (tierNum === 1 && table.length >= 16) {
      const bottomFloor = table.length - 2; // e.g. 16 for an 18-team league
      for (let i = bottomFloor - 1; i < table.length; i++) {
        const row = table[i];
        const isGiant = topHeavyweightNames.has(row.name);
        const clubObj = clubById.get(row.id);
        if (isGiant && clubObj && !clubObj.isInsolventGiant && row.id !== userClubId) {
          // Swap with a non-giant club safely in mid-table (positions 8-12)
          for (let j = Math.min(11, bottomFloor - 4); j >= 3; j--) {
            const aboveRow = table[j];
            const aboveIsGiant = topHeavyweightNames.has(aboveRow.name);
            if (!aboveIsGiant && aboveRow.id !== userClubId) {
              const tempPts = aboveRow.pts;
              const tempW = aboveRow.w;
              const tempD = aboveRow.d;
              const tempL = aboveRow.l;
              const tempGf = aboveRow.gf;
              const tempGa = aboveRow.ga;
              const tempGd = aboveRow.gd;

              aboveRow.pts = row.pts;
              aboveRow.w = row.w;
              aboveRow.d = row.d;
              aboveRow.l = row.l;
              aboveRow.gf = row.gf;
              aboveRow.ga = row.ga;
              aboveRow.gd = row.gd;

              row.pts = tempPts;
              row.w = tempW;
              row.d = tempD;
              row.l = tempL;
              row.gf = tempGf;
              row.ga = tempGa;
              row.gd = tempGd;

              table[i] = aboveRow;
              table[j] = row;
              break;
            }
          }
        }
      }

      table.forEach((r, idx) => {
        r.pos = idx + 1;
      });
    }

    return table;
  };

  const tier1ChampionsByCountry = new Map<string, Club>();

  for (const country of countries) {
    yield;
    const countryClubs = clubsByCountry.get(country) || [];
    let maxTierInDb = 0;
    const clubsByTier = new Map<number, Club[]>();
    for (let i = 0; i < countryClubs.length; i++) {
      const c = countryClubs[i];
      if (c.tier > maxTierInDb) maxTierInDb = c.tier;
      let list = clubsByTier.get(c.tier);
      if (!list) {
        list = [];
        clubsByTier.set(c.tier, list);
      }
      list.push(c);
    }
    const maxTier = getMaxTier(country, maxTierInDb);

    // Step 1: Simulate the official standings table for each tier first
    const tierTables = new Map<number, any[]>();
    const cinderellaClubIds = new Set<number | string>();

    for (let tier = 1; tier <= maxTier; tier++) {
      yield;
      const tierClubs = clubsByTier.get(tier) || [];
      if (tierClubs.length === 0) continue;

      // Identify potential Cinderella candidate in Tier 1 (~12% chance) or Ambition/Consortium Surge in Tiers 2-3 (~10% chance)
      const nonGiants = tierClubs.filter(c => c.id !== userClubId && (c.baseOvr || 0) < 85 && !topHeavyweightNames.has(c.name) && !isReserveTeamLocal(c.name) && !c.isReserve);
      let cinderellaId: number | string | null = null;
      if (tier === 1 && nonGiants.length > 0 && Math.random() < 0.12) {
        const picked = nonGiants[Math.floor(Math.random() * nonGiants.length)];
        cinderellaId = picked.id;
        cinderellaClubIds.add(picked.id);
      } else if ((tier === 2 || tier === 3) && nonGiants.length > 0 && Math.random() < 0.10) {
        const picked = nonGiants[Math.floor(Math.random() * nonGiants.length)];
        cinderellaId = picked.id;
        cinderellaClubIds.add(picked.id);
        picked.baseOvr = Math.min(86, (picked.baseOvr || 65) + rand(2, 4));
      }

      const scoredTier = tierClubs.map((c) => {
        let score = (c.baseOvr || 65) + rand(-5, 5);
        const isGiant = (c.baseOvr || 0) >= 85 || topHeavyweightNames.has(c.name);

        if (c.id === userClubId) {
          // The manager's club is strictly exempt from automated AI giant safety nets or artificial boosts
          return { club: c, score, isCinderella: false };
        }

        let isCinderellaSurge = false;
        if (c.id === cinderellaId) {
          // Dark-horse Cinderella / Ambition campaign momentum (+16 to +22 pts)
          score += rand(16, 22);
          isCinderellaSurge = true;
        }

        if (tier === 1 && isGiant && !c.isInsolventGiant) {
          // Heavyweight Giants in Tier 1:
          // ~8% chance of rare crisis dip (managerial turmoil, injury wave, European hangover)
          const isCrisisSeason = Math.random() < 0.08;
          if (isCrisisSeason) {
            score -= rand(5, 10); // Slumps into mid-table 6th-11th position
            score = Math.max(score, 76);
          } else {
            // Anchor powerhouse near top in title contention (top 1-4)
            score += rand(22, 30);
          }
        } else if (tier > 1 && (isGiant || (c.baseOvr || 0) >= 75) && !c.isInsolventGiant) {
          // In lower tiers, heavyweight clubs with superior quality dominate promotion races
          score += rand(18, 26);
        }
        return { club: c, score, isCinderella: isCinderellaSurge };
      });
      scoredTier.sort((a, b) => b.score - a.score);

      // In Tier 1, insulate solvent AI heavyweight giants from falling into the bottom 3 relegation zone
      if (tier === 1 && scoredTier.length >= 16) {
        const maxRelegIdx = scoredTier.length - 3;
        const swapFloor = 1; // Strictly protect index 0 (Champions/1st place)
        for (let i = maxRelegIdx; i < scoredTier.length; i++) {
          const item = scoredTier[i];
          const isHeavyweight = item.club.baseOvr >= 82 || topHeavyweightNames.has(item.club.name);
          if (isHeavyweight && !item.club.isInsolventGiant && item.club.id !== userClubId && item.club.id !== simContext?.ddOpponentId) {
            for (let j = maxRelegIdx - 1; j >= swapFloor; j--) {
              const aboveItem = scoredTier[j];
              const aboveIsHeavyweight = topHeavyweightNames.has(aboveItem.club.name);
              if ((!aboveIsHeavyweight || aboveItem.club.isInsolventGiant) && aboveItem.club.id !== simContext?.ddOpponentId) {
                scoredTier[i] = aboveItem;
                scoredTier[j] = item;
                break;
              }
            }
          }
        }
      }

      // Sync user's exact regular-season finish position so internal table rank matches App.tsx approxPos
      if (simContext?.userPos != null) {
        const uIdx = scoredTier.findIndex(s => s.club.id === userClubId);
        if (uIdx !== -1) {
          const targetUserIdx = Math.max(0, Math.min(scoredTier.length - 1, simContext.userPos - 1));
          if (uIdx !== targetUserIdx) {
            const [uItem] = scoredTier.splice(uIdx, 1);
            scoredTier.splice(targetUserIdx, 0, uItem);
          }
        }
      }

      // Decision Day Context Sync: Force the opponent into their required rank natively
      if (simContext?.ddOpponentId && simContext.ddOpponentTier === tier && simContext.ddOpponentRank) {
        const targetIdx = simContext.ddOpponentRank - 1;
        const oppIdx = scoredTier.findIndex(s => s.club.id === simContext.ddOpponentId);
        if (oppIdx !== -1 && oppIdx !== targetIdx && targetIdx >= 0 && targetIdx < scoredTier.length) {
          const temp = scoredTier[targetIdx];
          scoredTier[targetIdx] = scoredTier[oppIdx];
          scoredTier[oppIdx] = temp;
        }
      }

      const table = buildTierTable(scoredTier.map((i) => i.club), tier);
      const syncRowStatsToPts = (row: any, newPts: number) => {
        row.pts = newPts;
        let w = Math.min(34, Math.max(1, Math.floor(newPts / 3)));
        let d = Math.max(0, newPts - w * 3);
        while (d < 4 && w > 2 && w + d < 34) { w -= 1; d += 3; }
        const l = Math.max(0, 34 - w - d);
        row.w = w;
        row.d = d;
        row.l = l;
      };
      if (simContext?.userPos != null) {
        const uTableIdx = table.findIndex(r => r.id === userClubId);
        if (uTableIdx !== -1) {
          const targetUTableIdx = Math.max(0, Math.min(table.length - 1, simContext.userPos - 1));
          if (uTableIdx !== targetUTableIdx) {
            const [uRow] = table.splice(uTableIdx, 1);
            const refPts = table[targetUTableIdx]?.pts ?? uRow.pts;
            syncRowStatsToPts(uRow, refPts);
            table.splice(targetUTableIdx, 0, uRow);
            table.forEach((r, idx) => { r.pos = idx + 1; });
          }
        }
      }
      if (simContext?.ddOpponentId && simContext.ddOpponentTier === tier && simContext.ddOpponentRank) {
        const oTableIdx = table.findIndex(r => r.id === simContext.ddOpponentId);
        const targetOTableIdx = Math.max(0, Math.min(table.length - 1, simContext.ddOpponentRank - 1));
        if (oTableIdx !== -1 && oTableIdx !== targetOTableIdx) {
          const [oRow] = table.splice(oTableIdx, 1);
          const refPts = table[targetOTableIdx]?.pts ?? oRow.pts;
          syncRowStatsToPts(oRow, refPts);
          table.splice(targetOTableIdx, 0, oRow);
          table.forEach((r, idx) => { r.pos = idx + 1; });
        }
      }
      tierTables.set(tier, table);

      if (country === userCountry) {
        standingsArchive[tier] = table;
      }

      // Check for Tier 1 Champion & Cinderella Breakthrough headline
      if (tier === 1) {
        const topRow = table[0];
        if (topRow) {
          const champClubObj = clubById.get(topRow.id);
          if (champClubObj) {
            tier1ChampionsByCountry.set(country, champClubObj);
            if (champClubObj.id !== userClubId && champClubObj.baseOvr < 94 && Math.random() < 0.65) {
              champClubObj.baseOvr = Math.min(94, champClubObj.baseOvr + 1);
            }
          }
        }
        const top6Rows = table.slice(0, 6);
        top6Rows.forEach((r) => {
          if (r.id !== userClubId && cinderellaClubIds.has(r.id)) {
            const clubObj = clubById.get(r.id);
            if (clubObj) {
              // Reward breakout Cinderella clubs with +1 to +2 permanent OVR from continental prize money
              clubObj.baseOvr = Math.min(88, (clubObj.baseOvr || 72) + (r.pos <= 3 ? 2 : 1));
              generatedMovements.push({
                id: `sim-cin-${r.id}-${seasonYear}`,
                year: seasonYear,
                clubId: r.id,
                clubName: r.name,
                clubLogo: r.logo,
                clubColor: r.color,
                country: clubObj.country || country,
                fromTier: 1,
                toTier: 1,
                fromLeagueName: getLeagueInfo(1, clubObj.country || country).name,
                toLeagueName: getLeagueInfo(1, clubObj.country || country).name,
                type: 'cinderella_surge',
                pos: r.pos,
                reason: `Cinderella Breakthrough · Sensationally claims ${r.pos}${r.pos === 1 ? 'st' : r.pos === 2 ? 'nd' : r.pos === 3 ? 'rd' : 'th'} place and European qualification!`
              });
            }
          }
        });
      }
    }

    // Step 2: Strictly enforce closed-loop, capacity-preserving promotion & relegation
    for (let tier = 1; tier < maxTier; tier++) {
      const upperTable = tierTables.get(tier);
      const lowerTable = tierTables.get(tier + 1);

      if (!upperTable || !lowerTable || upperTable.length < 3 || lowerTable.length < 3) continue;

      // In Tier 1, Tier 2, and any major division with >= 16 teams, 3 spots are contested (2 direct + 1 two-legged playoff)
      // For smaller leagues, scale proportionally (min 1, max 3)
      const targetSpots = upperTable.length >= 16 ? 3 : (Math.min(2, Math.floor(upperTable.length / 4)) || 1);

      const isUserInUpper = upperTable.some((r) => r.id === userClubId);
      const isUserInLower = lowerTable.some((r) => r.id === userClubId);

      const isUserRelegatedFromUpper = isUserInUpper && userNextTier != null && userNextTier === tier + 1;
      const isUserPromotedFromLower = isUserInLower && userNextTier != null && userNextTier === tier;

      if (isUserRelegatedFromUpper) {
        const userRow = upperTable.find(r => r.id === userClubId);
        generatedMovements.push({
          id: `sim-rel-${userClubId}-${seasonYear}`,
          year: seasonYear,
          clubId: userClubId,
          clubName: userClub?.name || 'Your Club',
          clubLogo: userClub?.logo,
          clubColor: userClub?.color,
          country: userCountry,
          fromTier: tier,
          toTier: tier + 1,
          fromLeagueName: getLeagueInfo(tier, userCountry).name,
          toLeagueName: getLeagueInfo(tier + 1, userCountry).name,
          type: 'relegation',
          isUserClub: true,
          pos: userRow?.pos || (upperTable.length),
          reason: `Relegated to ${getLeagueInfo(tier + 1, userCountry).name}`
        });
        movedClubIds.add(userClubId);
      } else if (isUserPromotedFromLower) {
        const userRow = lowerTable.find(r => r.id === userClubId);
        const isChamp = userRow?.pos === 1;
        generatedMovements.push({
          id: `sim-pro-${userClubId}-${seasonYear}`,
          year: seasonYear,
          clubId: userClubId,
          clubName: userClub?.name || 'Your Club',
          clubLogo: userClub?.logo,
          clubColor: userClub?.color,
          country: userCountry,
          fromTier: tier + 1,
          toTier: tier,
          fromLeagueName: getLeagueInfo(tier + 1, userCountry).name,
          toLeagueName: getLeagueInfo(tier, userCountry).name,
          type: 'promotion',
          isUserClub: true,
          pos: userRow?.pos || 1,
          reason: isChamp ? `Champions · Direct Promotion` : `Earned Promotion to ${getLeagueInfo(tier, userCountry).name}`
        });
        movedClubIds.add(userClubId);
      }

      // Relegation candidates from upper table: lowest finishers
      const eligibleUpperReleg = [...upperTable]
        .reverse()
        .filter((r) => r.id !== userClubId && !movedClubIds.has(r.id));

      // Target breakdown: Execute two-legged playoff for 16th-vs-3rd boundary (when user played it OR in major AI divisions where neither user club nor an insolvency vacancy conflicts)
      const isUserPlayoffMatch = simContext?.ddOpponentId != null &&
        (upperTable.some(r => r.id === simContext.ddOpponentId) || lowerTable.some(r => r.id === simContext.ddOpponentId));
      const canRunAiPlayoff = targetSpots >= 3 && !isUserInUpper && !isUserInLower && upperTable.length >= 18;
      const hasPlayoff = isUserPlayoffMatch || canRunAiPlayoff;
      const directSpots = hasPlayoff ? Math.max(1, targetSpots - 1) : targetSpots;

      // 1. Direct swaps (account for any upper-tier insolvency vacancy so upper divisions never shrink below 18 clubs)
      const userRowUpper = upperTable.find(r => r.id === userClubId);
      const userRowLower = lowerTable.find(r => r.id === userClubId);

      const expectedUpperSize = Math.max(18, upperTable.length);
      const upperVacancy = Math.max(0, expectedUpperSize - upperTable.length);

      const isUserDirectRelegated = isUserInUpper && userRowUpper && userRowUpper.pos > upperTable.length - directSpots && userNextTier === tier + 1;
      const isUserDirectPromoted = isUserInLower && userRowLower && userRowLower.pos <= directSpots && userNextTier === tier;

      const neededDirectReleg = Math.max(0, (isUserDirectRelegated ? Math.max(0, directSpots - 1) : directSpots) - upperVacancy);
      const neededDirectPromo = isUserDirectPromoted ? Math.max(0, directSpots - 1) : directSpots;

      const directReleg = eligibleUpperReleg.slice(0, neededDirectReleg);
      const reservesLeavingTargetTier = directReleg.filter(r => isReserveTeamLocal(r.name)).length;

      // Eligible promotion candidates from lower table: highest finishers satisfying reserve rules with projected offset
      const eligibleLowerPromo: any[] = [];
      let projectedReservesAdded = 0;

      for (const r of lowerTable) {
        if (r.id === userClubId) continue;
        if (movedClubIds.has(r.id)) continue;
        
        if (!r.isReserve && !isReserveTeamLocal(r.name)) {
          eligibleLowerPromo.push(r);
        } else if (canReserveClubPromoteToTier(r.name, tier, countryClubs, country, projectedReservesAdded - reservesLeavingTargetTier)) {
          eligibleLowerPromo.push(r);
          projectedReservesAdded++;
        }
      }

      const directPromo = eligibleLowerPromo.slice(0, neededDirectPromo);

      const upperRelegList: any[] = [...directReleg];
      const lowerPromoList: any[] = [...directPromo];

      let oppPromoting = 0;
      let oppRelegating = 0;

      // 2. Playoff (rank 16 of upper vs 3rd eligible of lower)
      if (hasPlayoff) {
        const remainingUpper = eligibleUpperReleg.filter(r => !upperRelegList.some(u => u.id === r.id));
        const remainingLower = eligibleLowerPromo.filter(r => !lowerPromoList.some(l => l.id === r.id));

        const isUserUpperPlayoffParticipant = isUserInUpper && simContext?.ddOpponentId != null && simContext.ddOpponentTier === tier + 1;
        const isUserLowerPlayoffParticipant = isUserInLower && simContext?.ddOpponentId != null && simContext.ddOpponentTier === tier;

        if (isUserUpperPlayoffParticipant) {
          // User is the 16th-place upper-tier club defending against ddOpponentId from tier + 1.
          // Do NOT pull an additional AI club from upperTable into the playoff.
          const oppObj = clubById.get(simContext!.ddOpponentId!);
          const oppRow = lowerTable.find(r => r.id === simContext!.ddOpponentId) || remainingLower[0];
          if (oppObj) {
            movedClubIds.add(oppObj.id);
            const survived = Boolean(simContext?.userSurvivedPlayoff) || (userNextTier === tier);
            if (survived) {
              oppObj.tier = tier + 1;
              oppPromoting = 0;
              oppRelegating = 0;
            } else {
              oppObj.tier = tier;
              oppPromoting = 1;
              generatedMovements.push({
                id: `sim-playoff-pro-${oppObj.id}-${seasonYear}`,
                year: seasonYear,
                clubId: oppObj.id,
                clubName: oppObj.name,
                clubLogo: oppObj.logo,
                clubColor: oppObj.color,
                country: oppObj.country || country,
                fromTier: tier + 1,
                toTier: tier,
                fromLeagueName: getLeagueInfo(tier + 1, country).name,
                toLeagueName: getLeagueInfo(tier, country).name,
                type: 'promotion',
                pos: oppRow?.pos || 3,
                reason: `Promotion Play-off Winner vs Manager`
              });
            }
          }
        } else if (isUserLowerPlayoffParticipant) {
          // User is the lower-tier playoff club challenging ddOpponentId from tier.
          // Do NOT pull an additional AI club from lowerTable into the playoff.
          const oppObj = clubById.get(simContext!.ddOpponentId!);
          const oppRow = upperTable.find(r => r.id === simContext!.ddOpponentId) || remainingUpper[0];
          if (oppObj) {
            movedClubIds.add(oppObj.id);
            const won = Boolean(simContext?.userWonPlayoff) || (userNextTier === tier);
            if (won) {
              oppObj.tier = tier + 1;
              oppRelegating = 1;
              generatedMovements.push({
                id: `sim-playoff-rel-${oppObj.id}-${seasonYear}`,
                year: seasonYear,
                clubId: oppObj.id,
                clubName: oppObj.name,
                clubLogo: oppObj.logo,
                clubColor: oppObj.color,
                country: oppObj.country || country,
                fromTier: tier,
                toTier: tier + 1,
                fromLeagueName: getLeagueInfo(tier, country).name,
                toLeagueName: getLeagueInfo(tier + 1, country).name,
                type: 'relegation',
                pos: oppRow?.pos || 16,
                reason: `Relegated via Play-off vs Manager`
              });
            } else {
              oppObj.tier = tier;
              oppPromoting = 0;
              oppRelegating = 0;
              generatedMovements.push({
                id: `sim-playoff-surv-${oppObj.id}-${seasonYear}`,
                year: seasonYear,
                clubId: oppObj.id,
                clubName: oppObj.name,
                clubLogo: oppObj.logo,
                clubColor: oppObj.color,
                country: oppObj.country || country,
                fromTier: tier,
                toTier: tier,
                fromLeagueName: getLeagueInfo(tier, country).name,
                toLeagueName: getLeagueInfo(tier, country).name,
                type: 'relegation_avoided',
                pos: oppRow?.pos || 16,
                reason: `Relegation Play-off Survivor vs Manager`
              });
            }
          }
        } else if (remainingUpper.length > 0 && remainingLower.length > 0) {
          const upperPlayoffRow = remainingUpper[0];
          const lowerPlayoffRow = remainingLower[0];
          const upperClubObj = clubById.get(upperPlayoffRow.id);
          const lowerClubObj = clubById.get(lowerPlayoffRow.id);

          if (upperClubObj && lowerClubObj) {
            const isUserPlayoffBoundary = simContext?.ddOpponentId &&
              (upperPlayoffRow.id === simContext.ddOpponentId || lowerPlayoffRow.id === simContext.ddOpponentId);

            if (isUserPlayoffBoundary && simContext.ddOpponentNextTier) {
              // The user played this exact playoff! Bypass AI simulation and apply the true result.
              const oppObj = upperPlayoffRow.id === simContext.ddOpponentId ? upperClubObj : lowerClubObj;
              const oppRow = upperPlayoffRow.id === simContext.ddOpponentId ? upperPlayoffRow : lowerPlayoffRow;
              const wasUpper = upperPlayoffRow.id === simContext.ddOpponentId;

              oppObj.tier = simContext.ddOpponentNextTier;
              movedClubIds.add(oppObj.id);

              if (simContext.ddOpponentNextTier === tier) {
                if (wasUpper) {
                  generatedMovements.push({
                    id: `sim-playoff-surv-${oppObj.id}-${seasonYear}`,
                    year: seasonYear,
                    clubId: oppObj.id,
                    clubName: oppObj.name,
                    clubLogo: oppObj.logo,
                    clubColor: oppObj.color,
                    country: oppObj.country || country,
                    fromTier: tier,
                    toTier: tier,
                    fromLeagueName: getLeagueInfo(tier, country).name,
                    toLeagueName: getLeagueInfo(tier, country).name,
                    type: 'relegation_avoided',
                    pos: oppRow.pos,
                    reason: `Relegation Play-off Survivor vs Manager`
                  });
                } else {
                  oppPromoting = 1;
                  generatedMovements.push({
                    id: `sim-playoff-pro-${oppObj.id}-${seasonYear}`,
                    year: seasonYear,
                    clubId: oppObj.id,
                    clubName: oppObj.name,
                    clubLogo: oppObj.logo,
                    clubColor: oppObj.color,
                    country: oppObj.country || country,
                    fromTier: tier + 1,
                    toTier: tier,
                    fromLeagueName: getLeagueInfo(tier + 1, country).name,
                    toLeagueName: getLeagueInfo(tier, country).name,
                    type: 'promotion',
                    pos: oppRow.pos,
                    reason: `Promotion Play-off Winner vs Manager`
                  });
                }
              } else {
                if (wasUpper) {
                   oppRelegating = 1;
                   generatedMovements.push({
                    id: `sim-playoff-rel-${oppObj.id}-${seasonYear}`,
                    year: seasonYear,
                    clubId: oppObj.id,
                    clubName: oppObj.name,
                    clubLogo: oppObj.logo,
                    clubColor: oppObj.color,
                    country: oppObj.country || country,
                    fromTier: tier,
                    toTier: tier + 1,
                    fromLeagueName: getLeagueInfo(tier, country).name,
                    toLeagueName: getLeagueInfo(tier + 1, country).name,
                    type: 'relegation',
                    pos: oppRow.pos,
                    reason: `Relegated via Play-off vs Manager`
                  });
                }
              }
            } else {
              // Standard AI playoff
              const playoff = simulateTwoLeggedPlayoff(upperClubObj, lowerClubObj);
              if (!playoff.upperWon) {
                // Lower club won playoff -> Promote lower club, relegate upper club
                upperPlayoffRow.playoffReason = `Relegated via Play-off vs ${lowerClubObj.name} (Agg: ${playoff.aggUpper}-${playoff.aggLower})`;
                lowerPlayoffRow.playoffReason = `Promotion Play-off Winner vs ${upperClubObj.name} (Agg: ${playoff.aggLower}-${playoff.aggUpper})`;
                upperRelegList.push(upperPlayoffRow);
                lowerPromoList.push(lowerPlayoffRow);
              } else {
                // Upper club survived playoff
                generatedMovements.push({
                  id: `sim-playoff-surv-${upperClubObj.id}-${seasonYear}`,
                  year: seasonYear,
                  clubId: upperClubObj.id,
                  clubName: upperClubObj.name,
                  clubLogo: upperClubObj.logo,
                  clubColor: upperClubObj.color,
                  country: upperClubObj.country || country,
                  fromTier: tier,
                  toTier: tier,
                  fromLeagueName: getLeagueInfo(tier, country).name,
                  toLeagueName: getLeagueInfo(tier, country).name,
                  type: 'relegation_avoided',
                  pos: upperPlayoffRow.pos,
                  reason: `Relegation Play-off Survivor vs ${lowerClubObj.name} (Agg: ${playoff.aggUpper}-${playoff.aggLower})`
                });
              }
            }
          }
        }
      }

      // Balance check: ensure equal clubs swap, while accounting for any upperVacancy so upper divisions never shrink below 18 clubs
      const totalUpperMoving = upperRelegList.length + oppRelegating + (isUserRelegatedFromUpper ? 1 : 0);
      const totalLowerMoving = lowerPromoList.length + oppPromoting + (isUserPromotedFromLower ? 1 : 0);
      const balancedCount = Math.min(totalUpperMoving + upperVacancy, totalLowerMoving);

      const finalRelegAi = upperRelegList.slice(0, Math.max(0, balancedCount - upperVacancy - oppRelegating - (isUserRelegatedFromUpper ? 1 : 0)));
      const finalPromoAi = lowerPromoList.slice(0, Math.max(0, balancedCount - oppPromoting - (isUserPromotedFromLower ? 1 : 0)));

      finalRelegAi.forEach((row) => {
        const c = clubById.get(row.id);
        if (!c) return;
        c.tier = tier + 1;
        // Sleeping Giant Rebuild: Big-stadium historic clubs occasionally rally instead of decaying
        if ((c.stadium || 0) >= 28000 && tier + 1 >= 2 && Math.random() < 0.25) {
          c.baseOvr = Math.min(82, c.baseOvr + 1);
        } else if (c.baseOvr > 60) {
          c.baseOvr -= 1;
        }
        movedClubIds.add(c.id);
        generatedMovements.push({
          id: `sim-rel-${c.id}-${seasonYear}`,
          year: seasonYear,
          clubId: c.id,
          clubName: c.name,
          clubLogo: c.logo,
          clubColor: c.color,
          country: c.country || country,
          fromTier: tier,
          toTier: tier + 1,
          fromLeagueName: getLeagueInfo(tier, c.country || country).name,
          toLeagueName: getLeagueInfo(tier + 1, c.country || country).name,
          type: 'relegation',
          pos: row.pos,
          reason: row.playoffReason || `Relegated to ${getLeagueInfo(tier + 1, c.country || country).name}`
        });
      });

      finalPromoAi.forEach((row, idx) => {
        const c = clubById.get(row.id);
        if (!c) return;
        c.tier = tier;
        movedClubIds.add(c.id);
        const isChamp = row.pos === 1 || idx === 0;
        const targetTierAvg = getLeagueInfo(tier, c.country || country).avgOvr || 65;
        if (c.baseOvr < Math.min(86, targetTierAvg + 2)) {
          c.baseOvr = Math.min(88, c.baseOvr + (isChamp ? 2 : 1));
        }
        generatedMovements.push({
          id: `sim-pro-${c.id}-${seasonYear}`,
          year: seasonYear,
          clubId: c.id,
          clubName: c.name,
          clubLogo: c.logo,
          clubColor: c.color,
          country: c.country || country,
          fromTier: tier + 1,
          toTier: tier,
          fromLeagueName: getLeagueInfo(tier + 1, c.country || country).name,
          toLeagueName: getLeagueInfo(tier, c.country || country).name,
          type: 'promotion',
          pos: row.pos,
          reason: row.playoffReason || (isChamp ? `Champions · Direct Promotion` : `Earned Promotion to ${getLeagueInfo(tier, c.country || country).name}`)
        });
      });
    }

    // Step 3: Strict Parent-Reserve Separation Pushdown
    // If a senior parent club was relegated into the same division as its reserve club,
    // demote the reserve club to tier + 1 and elevate an eligible senior club to maintain invariant size
    const minReserveTier = getMinAllowedTierForReserve(country);
    for (let i = 0; i < countryClubs.length; i++) {
      const club = countryClubs[i];
      const t = club.tier;
      if (t >= maxTier) continue;
      if (club.isReserve || isReserveTeamLocal(club.name)) {
        const parent = getParentClub(club, countryClubs, country);
        const violatesMinTier = t < minReserveTier;
        const violatesParentTier = Boolean(parent && parent.tier >= t);
        if (violatesMinTier || violatesParentTier) {
          const targetDemoteTier = Math.min(
            maxTier,
            Math.max(t + 1, violatesMinTier ? minReserveTier : t + 1, parent ? parent.tier + 1 : t + 1)
          );
          if (targetDemoteTier > t) {
            const eligibleSeniorClubs = countryClubs
              .filter(c => c.tier === targetDemoteTier && !c.isReserve && !isReserveTeamLocal(c.name) && c.id !== userClubId && !movedClubIds.has(c.id))
              .sort((a, b) => b.baseOvr - a.baseOvr);
            const lowerSeniorClubs = eligibleSeniorClubs.length > 0
              ? eligibleSeniorClubs
              : countryClubs
                  .filter(c => c.tier === targetDemoteTier && !c.isReserve && !isReserveTeamLocal(c.name) && c.id !== userClubId)
                  .sort((a, b) => b.baseOvr - a.baseOvr);
            if (lowerSeniorClubs.length > 0) {
              club.tier = targetDemoteTier;
              const promotedSenior = lowerSeniorClubs[0];
              promotedSenior.tier = t;
              movedClubIds.add(club.id);
              movedClubIds.add(promotedSenior.id);
              generatedMovements.push({
                id: `sim-res-pushdown-${club.id}-${seasonYear}`,
                year: seasonYear,
                clubId: club.id,
                clubName: club.name,
                country,
                fromTier: t,
                toTier: targetDemoteTier,
                fromLeagueName: getLeagueInfo(t, country).name,
                toLeagueName: getLeagueInfo(targetDemoteTier, country).name,
                type: 'relegation',
                pos: 16,
                reason: violatesParentTier && parent
                  ? `Administrative Demotion · Senior club ${parent.name} in same or higher division`
                  : `Administrative Demotion · Reserve sides ineligible for ${getLeagueInfo(t, country).name}`
              });
              generatedMovements.push({
                id: `sim-res-rep-${promotedSenior.id}-${seasonYear}`,
                year: seasonYear,
                clubId: promotedSenior.id,
                clubName: promotedSenior.name,
                country,
                fromTier: targetDemoteTier,
                toTier: t,
                fromLeagueName: getLeagueInfo(targetDemoteTier, country).name,
                toLeagueName: getLeagueInfo(t, country).name,
                type: 'promotion',
                pos: 1,
                reason: `Administrative Promotion · Elevated to replace demoted reserve side`
              });
            }
          }
        }
      }
    }
  }

  // Simulate Continental Cup Champions across the living football world
  // Only crown AI champions if the user has not already won that continental cup this season.
  const userWon = new Set(
    (Array.isArray(userWonCups) ? userWonCups : [])
      .map((c) => (typeof c === 'string' ? c.toLowerCase() : typeof (c as any)?.id === 'string' ? (c as any).id.toLowerCase() : ''))
      .filter(Boolean)
  );
  const isUserConmebol = CONMEBOL_COUNTRIES.includes(userCountry);
  const isUserConcacaf = CONCACAF_COUNTRIES.includes(userCountry);
  const isUserAfc = AFC_COUNTRIES.includes(userCountry);
  const isUserUefa = UEFA_COUNTRIES.includes(userCountry);

  const tier1AiClubs = updated.filter((c) => c.tier === 1 && c.id !== userClubId);

  // 1. CONMEBOL: Copa Libertadores & Copa Sudamericana
  const conmebolT1 = tier1AiClubs.filter(
    (c) => CONMEBOL_COUNTRIES.includes(c.country || 'BRA')
  );
  if (conmebolT1.length > 0) {
    const scoredConmebol = conmebolT1
      .map((c) => ({ club: c, score: c.baseOvr + rand(-5, 5) }))
      .sort((a, b) => b.score - a.score);

    const userWonLib =
      isUserConmebol &&
      (userWon.has('cl') || Array.from(userWon).some((w) => w.includes('libertadores')));
    if (!userWonLib && scoredConmebol.length > 0) {
      const champ = scoredConmebol[0].club;
      generatedMovements.push({
        id: `sim-cup-libertadores-${champ.id}-${seasonYear}`,
        year: seasonYear,
        clubId: champ.id,
        clubName: champ.name,
        clubLogo: champ.logo,
        clubColor: champ.color,
        country: champ.country || 'BRA',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'Copa Libertadores',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
        reason: 'Copa Libertadores Winners · Kings of South America'
      });
    }

    const userWonSud =
      isUserConmebol &&
      (userWon.has('el') || Array.from(userWon).some((w) => w.includes('sudamericana')));
    if (!userWonSud && scoredConmebol.length > 1) {
      const champ = scoredConmebol[1].club;
      generatedMovements.push({
        id: `sim-cup-sudamericana-${champ.id}-${seasonYear}`,
        year: seasonYear,
        clubId: champ.id,
        clubName: champ.name,
        clubLogo: champ.logo,
        clubColor: champ.color,
        country: champ.country || 'ARG',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'Copa Sudamericana',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
        reason: 'Copa Sudamericana Winners · Continental Glory'
      });
    }
  }

  // 2. CONCACAF: Concacaf Champions Cup & Leagues Challenge
  const concacafT1 = tier1AiClubs.filter(
    (c) => CONCACAF_COUNTRIES.includes(c.country || 'USA')
  );
  if (concacafT1.length > 0) {
    const scoredConcacaf = concacafT1
      .map((c) => ({ club: c, score: c.baseOvr + rand(-5, 5) }))
      .sort((a, b) => b.score - a.score);

    const userWonConcacaf =
      isUserConcacaf &&
      (userWon.has('cl') ||
        Array.from(userWon).some((w) => w.includes('concacaf') || w.includes('north american champions')));
    if (!userWonConcacaf && scoredConcacaf.length > 0) {
      const champ = scoredConcacaf[0].club;
      generatedMovements.push({
        id: `sim-cup-concacaf-${champ.id}-${seasonYear}`,
        year: seasonYear,
        clubId: champ.id,
        clubName: champ.name,
        clubLogo: champ.logo,
        clubColor: champ.color,
        country: champ.country || 'MEX',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'Concacaf Champions Cup',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
        reason: 'Concacaf Champions Cup Winners · Kings of North America'
      });
    }

    const userWonLeagues =
      isUserConcacaf &&
      (userWon.has('el') || Array.from(userWon).some((w) => w.includes('leagues')));
    if (!userWonLeagues && scoredConcacaf.length > 1) {
      const champ = scoredConcacaf[1].club;
      generatedMovements.push({
        id: `sim-cup-leagues-${champ.id}-${seasonYear}`,
        year: seasonYear,
        clubId: champ.id,
        clubName: champ.name,
        clubLogo: champ.logo,
        clubColor: champ.color,
        country: champ.country || 'USA',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'Leagues Challenge',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
        reason: 'Leagues Challenge Winners · North American Triumph'
      });
    }
  }

  // 3. AFC: AFC Champions League
  const afcT1 = tier1AiClubs.filter(
    (c) => AFC_COUNTRIES.includes(c.country || 'JPN')
  );
  if (afcT1.length > 0) {
    const scoredAfc = afcT1
      .map((c) => ({ club: c, score: c.baseOvr + rand(-5, 5) }))
      .sort((a, b) => b.score - a.score);

    const userWonAfc =
      isUserAfc &&
      (userWon.has('cl') ||
        Array.from(userWon).some((w) => w.includes('afc') || w.includes('asian champions')));
    if (!userWonAfc && scoredAfc.length > 0) {
      const champ = scoredAfc[0].club;
      generatedMovements.push({
        id: `sim-cup-afc-${champ.id}-${seasonYear}`,
        year: seasonYear,
        clubId: champ.id,
        clubName: champ.name,
        clubLogo: champ.logo,
        clubColor: champ.color,
        country: champ.country || 'JPN',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'AFC Champions League',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
        reason: 'AFC Champions League Winners · Kings of Asia'
      });
    }
  }

  // 4. UEFA: Champions Cup & Euro Cup
  const uefaT1 = tier1AiClubs.filter(
    (c) => UEFA_COUNTRIES.includes(c.country || 'GER')
  );
  if (uefaT1.length > 0) {
    const scoredUefa = uefaT1
      .map((c) => {
        let score = c.baseOvr + rand(-5, 5);
        if (topHeavyweightNames.has(c.name) && !c.isInsolventGiant) score += 15;
        return { club: c, score };
      })
      .sort((a, b) => b.score - a.score);

    const userWonUefaCl =
      isUserUefa &&
      (userWon.has('cl') ||
        Array.from(userWon).some((w) => w.includes('champions cup') || w.includes('euro champions')));
    if (!userWonUefaCl && scoredUefa.length > 0) {
      const champ = scoredUefa[0].club;
      generatedMovements.push({
        id: `sim-cup-cl-${champ.id}-${seasonYear}`,
        year: seasonYear,
        clubId: champ.id,
        clubName: champ.name,
        clubLogo: champ.logo,
        clubColor: champ.color,
        country: champ.country || 'ESP',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'Champions Cup',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
        reason: 'Champions Cup Winners · European Crown'
      });
    }

    const userWonUefaEl =
      isUserUefa &&
      (userWon.has('el') || Array.from(userWon).some((w) => w.includes('euro cup')));
    if (!userWonUefaEl && scoredUefa.length > 1) {
      const champ = scoredUefa[1].club;
      generatedMovements.push({
        id: `sim-cup-el-${champ.id}-${seasonYear}`,
        year: seasonYear,
        clubId: champ.id,
        clubName: champ.name,
        clubLogo: champ.logo,
        clubColor: champ.color,
        country: champ.country || 'ITA',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'Euro Cup',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
        reason: 'Euro Cup Winners · European Glory'
      });
    }

    const userWonUefaEcl =
      isUserUefa &&
      (userWon.has('ecl') || Array.from(userWon).some((w) => w.includes('euro challenge') || w.includes('conference')));
    if (!userWonUefaEcl && scoredUefa.length > 2) {
      const champ = scoredUefa[2].club;
      generatedMovements.push({
        id: `sim-cup-ecl-${champ.id}-${seasonYear}`,
        year: seasonYear,
        clubId: champ.id,
        clubName: champ.name,
        clubLogo: champ.logo,
        clubColor: champ.color,
        country: champ.country || 'GRE',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'Euro Challenge Cup',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
        reason: 'Euro Challenge Cup Winners · Continental Glory'
      });
    }

    // Global Club Cup (World Club Championship)
    const userWonCwc = userWon.has('cwc') || Array.from(userWon).some((w) => w.includes('world') || w.includes('global'));
    if (!userWonCwc) {
      // Contest between top UEFA champion and top CONMEBOL champion
      const uefaChamp = scoredUefa[0]?.club;
      const conmebolChamp = conmebolT1[0];
      const worldChamp = (Math.random() < 0.65 && uefaChamp) ? uefaChamp : (conmebolChamp || uefaChamp);
      if (worldChamp) {
        generatedMovements.push({
          id: `sim-cup-cwc-${worldChamp.id}-${seasonYear}`,
          year: seasonYear,
          clubId: worldChamp.id,
          clubName: worldChamp.name,
          clubLogo: worldChamp.logo,
          clubColor: worldChamp.color,
          country: worldChamp.country || 'ENG',
          fromTier: 1,
          toTier: 1,
          fromLeagueName: 'Global Club Cup',
          toLeagueName: 'World Champions',
          type: 'cup_champion',
          pos: 1,
          reason: 'Global Club Cup Winners · World Club Champions'
        });
      }
    }
  }

  // 5. Domestic League Champions across the living football world
  const majorCountries = ['GER', 'ENG', 'ESP', 'ITA', 'FRA', 'BRA', 'ARG', 'JPN', 'NED', 'POR', 'TUR'];
  const userWonLeague = userWon.has('bl') || userWon.has('league') || userWon.has('lower') || userWon.has('title');

  for (const cCode of majorCountries) {
    const isUserDomestic = userCountry === cCode && userClub?.tier === 1;
    if (isUserDomestic && userWonLeague) {
      // User won their domestic top flight; their title is celebrated directly
      continue;
    }

    const t1Clubs = tier1AiClubs.filter(c => (c.country || 'GER') === cCode);
    if (t1Clubs.length > 0) {
      const tableChamp = tier1ChampionsByCountry.get(cCode);
      let champ = (tableChamp && tableChamp.id !== userClubId) ? tableChamp : undefined;
      if (!champ) {
        const scoredDomestic = t1Clubs
          .map(c => {
            let score = c.baseOvr + rand(-4, 4);
            if (topHeavyweightNames.has(c.name) && !c.isInsolventGiant) score += 8;
            return { club: c, score };
          })
          .sort((a, b) => b.score - a.score);
        champ = scoredDomestic[0]?.club;
      }
      if (champ) {
        const lgName = getLeagueInfo(1, cCode).name;
        generatedMovements.push({
          id: `sim-title-${champ.id}-${seasonYear}`,
          year: seasonYear,
          clubId: champ.id,
          clubName: champ.name,
          clubLogo: champ.logo,
          clubColor: champ.color,
          country: champ.country || cCode,
          fromTier: 1,
          toTier: 1,
          fromLeagueName: lgName,
          toLeagueName: 'Champions',
          type: 'title_won',
          pos: 1,
          reason: `${lgName} Champions · Domestic League Title`
        });
      }
    }
  }

  // 6. Blockbuster Inter-Club Heavyweight Transfers
  const STAR_NAMES = [
    'Kylian Vargas', 'Mateo Kovacic', 'Victor Diallo', 'Florian Richter',
    'Lucas Moreno', 'Julian Silva', 'Alexander Novak', 'Gabriel Santos',
    'Marco Gomez', 'Enzo Alvarez', 'Stefan Bauer', 'Leo Schmidt'
  ];
  const POS_LIST = ['FWD', 'MID', 'DEF', 'GK'];
  const eligibleSellers = tier1AiClubs.filter(c => c.baseOvr >= 80);
  const eligibleBuyers = eligibleSellers;

  if (eligibleSellers.length >= 2 && eligibleBuyers.length >= 2) {
    const numDeals = rand(2, 3);
    for (let i = 0; i < numDeals; i++) {
      const seller = eligibleSellers[Math.floor(Math.random() * eligibleSellers.length)];
      const buyerCandidates = eligibleBuyers.filter(b => b.id !== seller.id);
      if (buyerCandidates.length === 0) continue;
      const buyer = buyerCandidates[Math.floor(Math.random() * buyerCandidates.length)];
      
      const starName = STAR_NAMES[Math.floor(Math.random() * STAR_NAMES.length)];
      const starPos = POS_LIST[Math.floor(Math.random() * POS_LIST.length)];
      const starOvr = Math.min(94, Math.max(83, Math.round((seller.baseOvr + buyer.baseOvr) / 2 + rand(-1, 3))));
      const feeMillions = Math.round(starOvr * 1.2 + rand(10, 40));

      if (buyer.baseOvr < 93 && Math.random() < 0.65) {
        buyer.baseOvr += 1;
      }
      if (seller.baseOvr > 82 && Math.random() < 0.45) {
        seller.baseOvr -= 1;
      }

      generatedMovements.push({
        id: `sim-transfer-${buyer.id}-${seller.id}-${seasonYear}-${i}`,
        year: seasonYear,
        clubId: buyer.id,
        clubName: buyer.name,
        clubLogo: buyer.logo,
        clubColor: buyer.color,
        country: buyer.country || 'GER',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: seller.name,
        toLeagueName: buyer.name,
        type: 'transfer_saga',
        reason: `Blockbuster Deal: ${starName} (${starOvr} OVR, ${starPos}) transferred from ${seller.name} to ${buyer.name} for €${feeMillions}M`
      });
    }
  }

  // --- CINDERELLA CUP WINNER INJECTION ---
  if (simContext?.cupWinners && simContext.cupWinners.length > 0) {
    const userClubObj = updated.find(c => c.id === userClubId);
    const userCountry = userClubObj?.country || 'GER';

    simContext.cupWinners.forEach(cw => {
      const champ = updated.find(c => c.id === cw.winnerId || (cw.winnerName && c.name?.toLowerCase().trim() === cw.winnerName.toLowerCase().trim()));
      const refCountry = champ?.country || userCountry;

      let leagueName = 'Cup';
      if (cw.cupId === 'cwc') {
        leagueName = 'Global Club Cup';
      } else if (cw.cupId === 'efl') {
        leagueName = 'English League Cup';
      } else if (cw.cupId === 'reg') {
        leagueName = 'Regional Cup';
      } else if (cw.cupId === 'dfb') {
        const isCan = refCountry === 'CAN' || (champ && isCanadianMLSClub(champ.name, champ.id, champ.country)) || (userClubObj && isCanadianMLSClub(userClubObj.name, userClubObj.id, userClubObj.country));
        leagueName = isCan ? 'Canadian Championship' : (getDomesticCupInfo(refCountry, champ?.tier || 1, champ?.name, champ?.id).name || 'National Cup');
      } else if (cw.cupId === 'cl' || cw.cupId === 'el' || cw.cupId === 'ecl') {
        const isNonUefa = CONMEBOL_COUNTRIES.includes(refCountry) || CONCACAF_COUNTRIES.includes(refCountry) || AFC_COUNTRIES.includes(refCountry) || ['RSA', 'NGA'].includes(refCountry);
        if (isNonUefa) {
          const contNames = getContinentalCupNames(refCountry);
          leagueName = contNames[cw.cupId as 'cl' | 'el' | 'ecl'];
        } else {
          const uefaNames: Record<string, string> = { cl: 'Champions Cup', el: 'Euro Cup', ecl: 'Euro Challenge Cup' };
          leagueName = uefaNames[cw.cupId] || 'Champions Cup';
        }
      }

      // Erase any randomly generated AI winner for this specific cup
      const randIdx = generatedMovements.findIndex(m => m.type === 'cup_champion' && m.fromLeagueName === leagueName);
      if (randIdx !== -1) generatedMovements.splice(randIdx, 1);

      if (champ) {
        generatedMovements.push({
          id: `sim-cup-expl-${cw.cupId}-${champ.id}-${seasonYear}`,
          year: seasonYear,
          clubId: champ.id,
          clubName: champ.name,
          clubLogo: champ.logo,
          clubColor: champ.color,
          country: champ.country || 'GER',
          fromTier: champ.tier,
          toTier: champ.tier,
          fromLeagueName: leagueName,
          toLeagueName: 'Champions',
          type: 'cup_champion',
          pos: 1,
          reason: `${leagueName} Winners · Defeated Manager in Final`,
          isUserClub: false
        });
      } else if (cw.winnerName) {
        generatedMovements.push({
          id: `sim-cup-expl-${cw.cupId}-${cw.winnerId || 'ai'}-${seasonYear}`,
          year: seasonYear,
          clubId: Number(cw.winnerId) || 999999,
          clubName: cw.winnerName,
          country: refCountry || 'INT',
          fromTier: 1,
          toTier: 1,
          fromLeagueName: leagueName,
          toLeagueName: 'Champions',
          type: 'cup_champion',
          pos: 1,
          reason: `${leagueName} Winners · Defeated Manager in Final`,
          isUserClub: false
        });
      }
    });
  }

  // Prioritize movements so cup winners, domestic champions, insolvency drops, and transfers always appear first
  generatedMovements.sort((a, b) => {
    const getPrio = (m: UniverseMovement) => {
      if (m.type === 'cup_champion') return 0;
      if (m.type === 'title_won') return 1;
      if (m.type === 'insolvency_drop') return 2;
      if (m.type === 'transfer_saga') return 3;
      if (m.fromTier === 1 || m.toTier === 1) return 4;
      if (m.fromTier === 2 || m.toTier === 2) return 5;
      return 6;
    };
    return getPrio(a) - getPrio(b);
  });

  (updated as any).movements = generatedMovements;
  (updated as any).standingsArchive = standingsArchive;
  return updated;
}

export const simulateAiLeagues = (
  currentClubs: Club[],
  userClubId: number,
  seasonYear = 2026,
  userWonCups: string[] = [],
  userNextTier?: number,
  simContext?: SimContext
): Club[] => {
  const gen = simulateAiLeaguesGen(currentClubs, userClubId, seasonYear, userWonCups, userNextTier, simContext);
  let res = gen.next();
  while (!res.done) {
    res = gen.next();
  }
  return res.value;
};

export const simulateAiLeaguesAsync = async (
  currentClubs: Club[],
  userClubId: number,
  seasonYear = 2026,
  userWonCups: string[] = [],
  userNextTier?: number,
  simContext?: SimContext
): Promise<Club[]> => {
  const gen = simulateAiLeaguesGen(currentClubs, userClubId, seasonYear, userWonCups, userNextTier, simContext);
  let res = gen.next();
  while (!res.done) {
    await new Promise(r => setTimeout(r, 0));
    res = gen.next();
  }
  return res.value;
};

