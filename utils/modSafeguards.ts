import { Club, GameState } from '../types';
import { ALL_CLUBS } from '../data/clubsData';
import { isReserveClub, getLeagueInfo, getMinAllowedTierForReserve, normalizeCountryCode } from '../data/gameConstants';
import { REAL_CLUB_ALIASES, simplifyClubName } from '../engine/moddingEngine';
import { TEAMS } from '../mod-data/teams';

// Pre-index ALL_CLUBS by ID, country+name, country+simplified name, and global fallbacks for O(1) fallback resolution
const defaultClubsById = new Map<number, Club>();
const defaultClubsByCountryAndName = new Map<string, Club>();
const defaultClubsByCountryAndSimp = new Map<string, Club>();
const defaultClubsByName = new Map<string, Club>();
const defaultClubsBySimp = new Map<string, Club>();
for (let i = 0; i < ALL_CLUBS.length; i++) {
  const c = ALL_CLUBS[i];
  const cCountry = normalizeCountryCode(c.country || 'GER');
  if (c.id != null && !defaultClubsById.has(c.id)) {
    defaultClubsById.set(c.id, c);
  }
  if (c.name) {
    const lower = c.name.toLowerCase().trim();
    const countryNameKey = `${cCountry}_${lower}`;
    if (!defaultClubsByCountryAndName.has(countryNameKey)) defaultClubsByCountryAndName.set(countryNameKey, c);
    if (!defaultClubsByName.has(lower)) defaultClubsByName.set(lower, c);
    const simp = simplifyClubName(c.name);
    if (simp) {
      const countrySimpKey = `${cCountry}_${simp}`;
      if (!defaultClubsByCountryAndSimp.has(countrySimpKey)) defaultClubsByCountryAndSimp.set(countrySimpKey, c);
      if (!defaultClubsBySimp.has(simp)) defaultClubsBySimp.set(simp, c);
    }
  }
}

// Pre-index TEAMS by ID, country+name, country+simplified name, and global fallbacks for O(1) auto-repair lookups
const teamsById = new Map<number, typeof TEAMS[0]>();
const teamsByCountryAndName = new Map<string, typeof TEAMS[0]>();
const teamsByCountryAndSimp = new Map<string, typeof TEAMS[0]>();
const teamsByName = new Map<string, typeof TEAMS[0]>();
const teamsBySimp = new Map<string, typeof TEAMS[0]>();
for (let i = 0; i < TEAMS.length; i++) {
  const t = TEAMS[i];
  const tCountry = normalizeCountryCode(t.country || 'GER');
  if (t.id != null && !teamsById.has(t.id)) {
    teamsById.set(t.id, t);
  }
  if (t.name) {
    const lower = t.name.toLowerCase().trim();
    const countryNameKey = `${tCountry}_${lower}`;
    if (!teamsByCountryAndName.has(countryNameKey)) teamsByCountryAndName.set(countryNameKey, t);
    if (!teamsByName.has(lower)) teamsByName.set(lower, t);
    const simp = simplifyClubName(t.name);
    if (simp) {
      const countrySimpKey = `${tCountry}_${simp}`;
      if (!teamsByCountryAndSimp.has(countrySimpKey)) teamsByCountryAndSimp.set(countrySimpKey, t);
      if (!teamsBySimp.has(simp)) teamsBySimp.set(simp, t);
    }
  }
}

// Map canonical ALL_CLUBS IDs to their verified real-world TEAMS entry
const canonicalIdToModTeam = new Map<number, typeof TEAMS[0]>();
for (let i = 0; i < TEAMS.length; i++) {
  const t = TEAMS[i];
  if (t.id != null && !canonicalIdToModTeam.has(t.id)) {
    canonicalIdToModTeam.set(t.id, t);
  }
}
for (const [alias, clubId] of Object.entries(REAL_CLUB_ALIASES)) {
  if (canonicalIdToModTeam.has(clubId)) continue;
  const lowerAlias = alias.toLowerCase().trim();
  const cleanAlias = lowerAlias.replace(/\s+ii$/, '').replace(/\s+\(?b\)?$/, '').replace(/\s+b$/, '').replace(/\s+2$/, '').trim();
  const team = TEAMS.find(t => 
    t.name.toLowerCase().trim() === lowerAlias ||
    simplifyClubName(t.name) === simplifyClubName(alias)
  ) || TEAMS.find(t => 
    t.name.toLowerCase().trim() === cleanAlias ||
    simplifyClubName(t.name) === simplifyClubName(cleanAlias)
  );
  if (team && !canonicalIdToModTeam.has(clubId)) {
    canonicalIdToModTeam.set(clubId, team);
  }
}

export interface HistoryClubRef {
  id?: number;
  name: string;
  country?: string;
  color?: string;
  logo?: string;
  fallbackLogo?: string;
}

export interface ResolvedHistoryClubDisplay {
  id?: number;
  name: string;
  color?: string;
  logo?: string;
  fallbackLogo?: string;
}

/**
 * Resolves the canonical copyright-safe base club from ALL_CLUBS given an ID, name (fallback or real), and optional country.
 */
export function findCanonicalDefaultClub(
  clubId?: number,
  clubName?: string,
  country?: string
): Club | undefined {
  const normCountry = country ? normalizeCountryCode(country) : undefined;
  const isSameCountry = (cand?: { country?: string }) =>
    !normCountry || !cand?.country || normalizeCountryCode(cand.country) === normCountry;

  // 1. Canonical ID match
  if (clubId != null && Number.isFinite(Number(clubId))) {
    const byId = defaultClubsById.get(Number(clubId));
    if (byId && isSameCountry(byId)) return byId;
    if (byId && !normCountry) return byId;
  }

  const trimmed = (clubName || '').trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  const lowerNoRes = lower.replace(/\s+res\.?$/i, '').replace(/\s+reserve$/i, '').trim();
  const entryIsReserve = isReserveClub(trimmed);

  // 2. Direct lookup in ALL_CLUBS by country + name or global name
  if (normCountry) {
    const byCountryName = defaultClubsByCountryAndName.get(`${normCountry}_${lower}`);
    if (byCountryName) return byCountryName;
  }
  const byDefaultName = defaultClubsByName.get(lower);
  if (byDefaultName && isSameCountry(byDefaultName)) return byDefaultName;

  // 3. Real-world alias dictionary -> canonical ID -> ALL_CLUBS
  const aliasId = REAL_CLUB_ALIASES[lower] ?? REAL_CLUB_ALIASES[lowerNoRes];
  if (aliasId != null) {
    const cand = defaultClubsById.get(aliasId);
    if (cand && isSameCountry(cand) && isReserveClub(cand.name) === entryIsReserve) return cand;
  }

  // 4. TEAMS exact name -> canonical ID -> ALL_CLUBS
  const teamByCountry = normCountry ? teamsByCountryAndName.get(`${normCountry}_${lower}`) : undefined;
  const teamMatch = teamByCountry || teamsByName.get(lower);
  if (teamMatch && isSameCountry(teamMatch)) {
    const cand = defaultClubsById.get(teamMatch.id);
    if (cand && isSameCountry(cand)) return cand;
  }

  // 5. Simplified name lookup (preserving reserve vs first-team distinction)
  const simp = simplifyClubName(trimmed);
  if (simp) {
    const simpTeam = (normCountry ? teamsByCountryAndSimp.get(`${normCountry}_${simp}`) : undefined) || teamsBySimp.get(simp);
    if (simpTeam && isSameCountry(simpTeam) && isReserveClub(simpTeam.name) === entryIsReserve) {
      const cand = defaultClubsById.get(simpTeam.id);
      if (cand && isSameCountry(cand)) return cand;
    }
    const simpDefault = (normCountry ? defaultClubsByCountryAndSimp.get(`${normCountry}_${simp}`) : undefined) || defaultClubsBySimp.get(simp);
    if (simpDefault && isSameCountry(simpDefault) && isReserveClub(simpDefault.name) === entryIsReserve) {
      return simpDefault;
    }
  }

  // 6. Reserve club fallback (e.g. "FC Bayern München II" -> "Bavaria München II" without clubId)
  if (entryIsReserve) {
    const cleanParent = trimmed
      .replace(/\s+Res\.?$/i, '')
      .replace(/\s+Reserve$/i, '')
      .replace(/\s+II$/, '')
      .replace(/\s+\(?B\)?$/, '')
      .replace(/\s+Castilla$/, '')
      .replace(/\s+B$/, '')
      .replace(/\s+2$/, '')
      .trim()
      .toLowerCase();
    const parentTeam = (normCountry ? teamsByCountryAndName.get(`${normCountry}_${cleanParent}`) : undefined) || teamsByName.get(cleanParent);
    const parentId = REAL_CLUB_ALIASES[cleanParent] ?? parentTeam?.id;
    if (parentId != null) {
      const parentDefault = defaultClubsById.get(parentId);
      if (parentDefault && isSameCountry(parentDefault)) {
        const parentDefaultSimp = simplifyClubName(parentDefault.name);
        const reserveMatch = ALL_CLUBS.find(c =>
          isReserveClub(c.name) &&
          normalizeCountryCode(c.country || 'GER') === normalizeCountryCode(parentDefault.country || 'GER') &&
          simplifyClubName(
            c.name
              .replace(/\s+Res\.?$/i, '')
              .replace(/\s+Reserve$/i, '')
              .replace(/\s+II$/, '')
              .replace(/\s+\(?B\)?$/, '')
              .replace(/\s+Castilla$/, '')
              .replace(/\s+B$/, '')
              .replace(/\s+2$/, '')
              .trim()
          ) === parentDefaultSimp
        );
        if (reserveMatch) return reserveMatch;
      }
    }
  }

  return undefined;
}

function isKnownModOrAliasName(name: string, country?: string): boolean {
  const trimmed = (name || '').trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  const lowerNoRes = lower.replace(/\s+res\.?$/i, '').replace(/\s+reserve$/i, '').trim();
  const normCountry = country ? normalizeCountryCode(country) : undefined;
  const isSameCountry = (cand?: { country?: string }) =>
    !normCountry || !cand?.country || normalizeCountryCode(cand.country) === normCountry;

  if (normCountry && teamsByCountryAndName.has(`${normCountry}_${lower}`)) return true;
  const globalTeam = teamsByName.get(lower);
  if (globalTeam && isSameCountry(globalTeam)) return true;

  if (REAL_CLUB_ALIASES[lower] != null || REAL_CLUB_ALIASES[lowerNoRes] != null) return true;

  const entryIsReserve = isReserveClub(trimmed);
  const simp = simplifyClubName(trimmed);
  if (simp) {
    const simpTeam = (normCountry ? teamsByCountryAndSimp.get(`${normCountry}_${simp}`) : undefined) || teamsBySimp.get(simp);
    if (simpTeam && isSameCountry(simpTeam) && isReserveClub(simpTeam.name) === entryIsReserve) return true;
  }

  if (entryIsReserve) {
    const cleanParent = trimmed
      .replace(/\s+Res\.?$/i, '')
      .replace(/\s+Reserve$/i, '')
      .replace(/\s+II$/, '')
      .replace(/\s+\(?B\)?$/, '')
      .replace(/\s+Castilla$/, '')
      .replace(/\s+B$/, '')
      .replace(/\s+2$/, '')
      .trim()
      .toLowerCase();
    const parentTeam = (normCountry ? teamsByCountryAndName.get(`${normCountry}_${cleanParent}`) : undefined) || teamsByName.get(cleanParent);
    if ((parentTeam && isSameCountry(parentTeam)) || REAL_CLUB_ALIASES[cleanParent] != null) {
      return true;
    }
  }

  return false;
}

/**
 * Resolves the display club name, ID, color, and crest URLs for a season history entry or historical club reference
 * respecting whether the Real Name Mod (or custom mod DB) is currently active.
 */
export function resolveHistoryClubDisplay(
  entry: HistoryClubRef,
  isModActive: boolean,
  clubsDb?: Club[],
  forceFallback = false
): ResolvedHistoryClubDisplay {
  const safeName = entry.name || 'Club';
  const lower = safeName.toLowerCase().trim();
  const entryCountry = entry.country ? normalizeCountryCode(entry.country) : undefined;
  const isSameCountry = (cand?: { country?: string }) =>
    !entryCountry || !cand?.country || normalizeCountryCode(cand.country) === entryCountry;

  const isCustomLogo = typeof entry.logo === 'string' && (entry.logo.startsWith('data:image/') || entry.logo.startsWith('blob:'));
  const isCustomFallback = typeof entry.fallbackLogo === 'string' && (entry.fallbackLogo.startsWith('data:image/') || entry.fallbackLogo.startsWith('blob:'));
  const hasModUrlLogo = Boolean(
    (typeof entry.logo === 'string' && entry.logo.trim().length > 0 && !isCustomLogo) ||
    (typeof entry.fallbackLogo === 'string' && entry.fallbackLogo.trim().length > 0 && !isCustomFallback)
  );

  // Resolve canonical default club even when entry holds a mod name or lacks clubId
  const defaultClub = findCanonicalDefaultClub(entry.id, safeName, entry.country);
  const resolvedCanonicalId = entry.id ?? defaultClub?.id;

  const matchingDbClub = clubsDb?.find(c =>
    (resolvedCanonicalId != null && (c.id === resolvedCanonicalId || String(c.id) === String(resolvedCanonicalId))) ||
    c.name === safeName ||
    (c.name.toLowerCase().trim() === lower && isSameCountry(c))
  );

  if (!isModActive) {
    const isModEntry =
      forceFallback ||
      hasModUrlLogo ||
      isKnownModOrAliasName(safeName, entry.country) ||
      Boolean(defaultClub && defaultClub.name.toLowerCase().trim() === lower);

    const dbNameIsModName = matchingDbClub ? isKnownModOrAliasName(matchingDbClub.name, matchingDbClub.country || entry.country) : false;
    const fallbackName = isModEntry
      ? (defaultClub?.name || (matchingDbClub && !dbNameIsModName ? matchingDbClub.name : undefined) || safeName)
      : safeName;

    return {
      id: defaultClub?.id ?? matchingDbClub?.id ?? entry.id,
      name: fallbackName,
      color: (isModEntry ? defaultClub?.color : undefined) || entry.color || matchingDbClub?.color || defaultClub?.color,
      logo: isCustomLogo ? entry.logo : undefined,
      fallbackLogo: isCustomFallback ? entry.fallbackLogo : undefined,
    };
  }

  const repaired = autoRepairSingleClub(
    {
      id: (matchingDbClub?.id ?? resolvedCanonicalId ?? 0) as number,
      name: matchingDbClub?.name || safeName,
      tier: matchingDbClub?.tier || 1,
      baseOvr: matchingDbClub?.baseOvr || 70,
      color: matchingDbClub?.color || entry.color || defaultClub?.color || '1d4ed8',
      stadium: matchingDbClub?.stadium || 20000,
      country: entry.country || matchingDbClub?.country || defaultClub?.country,
      logo: isCustomLogo ? entry.logo : (entry.logo || matchingDbClub?.logo),
      fallbackLogo: isCustomFallback ? entry.fallbackLogo : (entry.fallbackLogo || matchingDbClub?.fallbackLogo),
    } as Club,
    true
  );

  const finalId = matchingDbClub?.id ?? (repaired.id && repaired.id > 0 ? repaired.id : resolvedCanonicalId);
  const hasCustomDbName = Boolean(
    matchingDbClub &&
    !defaultClubsByName.has(matchingDbClub.name.toLowerCase().trim()) &&
    !teamsByName.has(matchingDbClub.name.toLowerCase().trim())
  );

  return {
    id: finalId,
    name: hasCustomDbName ? matchingDbClub!.name : (repaired.name || matchingDbClub?.name || safeName),
    color: repaired.color || matchingDbClub?.color || entry.color,
    logo: isCustomLogo ? entry.logo : (matchingDbClub?.logo || repaired.logo || entry.logo),
    fallbackLogo: isCustomFallback ? entry.fallbackLogo : (matchingDbClub?.fallbackLogo || repaired.fallbackLogo || entry.fallbackLogo),
  };
}

/**
 * Self-healing sanitizer for an individual club object.
 * When isModActive is true:
 * - Upgrades unmodded placeholder names (e.g. Spree Berlin West -> Hertha BSC, Schwaben Augsburg -> FC Augsburg)
 * - Restores authentic mod logos/crest URLs (e.g. fixes Augsburg showing Heidenheim or Mainz showing Wolfsburg)
 * - Preserves user custom uploads (data:image/ or blob:)
 * - Preserves user career investments (stadium, fanBase, academyLevel, tier, baseOvr, etc.)
 */
export function autoRepairSingleClub(club: Club, isModActive: boolean): Club {
  if (!club || typeof club !== 'object') return club;
  if (!isModActive) return club;

  const lower = (club.name || '').toLowerCase().trim();
  const lowerNoRes = lower.replace(/\s+res\.?$/i, '').replace(/\s+reserve$/i, '').trim();
  const clubCountry = club.country ? normalizeCountryCode(club.country) : undefined;
  const isSameCountry = (cand?: { country?: string }) =>
    !clubCountry || !cand?.country || normalizeCountryCode(cand.country) === clubCountry;

  // 1. Direct country-scoped name match in TEAMS (prevents cross-country collisions like CD Guadalajara ESP vs MEX or FC London USA vs CAN)
  let modTeam = clubCountry ? teamsByCountryAndName.get(`${clubCountry}_${lower}`) : undefined;
  if (!modTeam) {
    const cand = teamsByName.get(lower);
    if (cand && isSameCountry(cand)) modTeam = cand;
  }

  // 2. Direct alias match in REAL_CLUB_ALIASES (only if country matches)
  if (!modTeam && REAL_CLUB_ALIASES[lower] != null) {
    const cand = canonicalIdToModTeam.get(REAL_CLUB_ALIASES[lower]);
    if (cand && isSameCountry(cand)) modTeam = cand;
  }
  if (!modTeam && REAL_CLUB_ALIASES[lowerNoRes] != null) {
    const cand = canonicalIdToModTeam.get(REAL_CLUB_ALIASES[lowerNoRes]);
    if (cand && isSameCountry(cand)) modTeam = cand;
  }

  // 3. By canonical club ID in the same country (before fuzzy simplified name match so Paris ID 401 -> PSG, Austin ID 1016 -> Austin Bold FC, etc.)
  if (!modTeam && club.id != null) {
    const candidate = teamsById.get(club.id) || canonicalIdToModTeam.get(club.id);
    if (candidate && isSameCountry(candidate)) {
      modTeam = candidate;
    }
  }

  // 4. Simplified name match (country-scoped first)
  if (!modTeam) {
    const simp = simplifyClubName(club.name || '');
    if (simp) {
      const cand = (clubCountry ? teamsByCountryAndSimp.get(`${clubCountry}_${simp}`) : undefined) || teamsBySimp.get(simp);
      if (cand && isSameCountry(cand)) {
        modTeam = cand;
      }
    }
  }

  // 5. Reserve club parent matching
  if (!modTeam && isReserveClub(club.name)) {
    const cleanParent = club.name
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
      const parentModTeam = canonicalIdToModTeam.get(parentAlias);
      if (parentModTeam && isSameCountry(parentModTeam)) {
        const isCustomLogo = typeof club.logo === 'string' && (club.logo.startsWith('data:image/') || club.logo.startsWith('blob:'));
        return {
          ...club,
          name: `${parentModTeam.name} II`,
          logo: isCustomLogo ? club.logo : (parentModTeam.logo || club.logo),
          fallbackLogo: isCustomLogo ? club.fallbackLogo : (parentModTeam.fallbackLogo || club.fallbackLogo),
          color: parentModTeam.color || club.color,
          isReserve: true
        };
      }
    }
  }

  if (!modTeam) return club;

  const isCustomLogo = typeof club.logo === 'string' && (club.logo.startsWith('data:image/') || club.logo.startsWith('blob:'));

  return {
    ...club,
    name: modTeam.name,
    logo: isCustomLogo ? club.logo : (modTeam.logo || club.logo),
    fallbackLogo: isCustomLogo ? club.fallbackLogo : (modTeam.fallbackLogo || club.fallbackLogo),
    color: modTeam.color || club.color,
  };
}

/**
 * Re-synchronizes and cleanses an entire array of clubs.
 */
export function autoRepairClubsDb(clubs: Club[], isModActive: boolean, gameState?: GameState | null): Club[] {
  if (!Array.isArray(clubs) || clubs.length === 0) return clubs || [];
  let repaired = isModActive ? clubs.map(c => autoRepairSingleClub(c, true)) : clubs;

  // Strict Invariant Enforcement: Ensure every German tier has exactly 18 clubs
  const gerClubs = repaired.filter(c => (c.country || 'GER') === 'GER');
  if (gerClubs.length >= 198) {
    const tierCounts: Record<number, number> = {};
    gerClubs.forEach(c => {
      tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1;
    });

    const isSeason1Setup = !gameState || (gameState.seasonCount || 1) <= 1;
    const isCareerActive = !isSeason1Setup;

    const needsPromotionRepair = isSeason1Setup && gerClubs.some(c => {
      const lower = c.name.toLowerCase();
      return (lower.includes('barockstadt') || lower.includes('hertha bsc ii') || lower.includes('gütersloh') || lower.includes('guetersloh')) && c.tier === 6;
    });

    const hasDistortion = needsPromotionRepair || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].some(t => tierCounts[t] !== 18);
    if (hasDistortion) {
      // 1. Reserve team safety FIRST: strictly demote any reserve clubs above country-specific minAllowedTier
      const minGerReserveTier = getMinAllowedTierForReserve('GER');
      gerClubs.forEach(c => {
        if ((isReserveClub(c.name) || Boolean(c.isReserve)) && c.tier < minGerReserveTier) {
          c.tier = minGerReserveTier;
        }
      });

      // 2. Promote SG Barockstadt Fulda-Lehnerz, Hertha BSC II, and FC Gütersloh to Tier 5 if stranded in Tier 6 (Season 1 setup ONLY)
      if (isSeason1Setup) {
        gerClubs.forEach(c => {
          const lower = c.name.toLowerCase();
          if (lower.includes('barockstadt') || lower.includes('hertha bsc ii') || lower.includes('gütersloh') || lower.includes('guetersloh')) {
            if (c.tier === 6) c.tier = 5;
          }
        });
      }

      const currentClubId = gameState?.club?.id;
      const currentClubName = gameState?.club?.name?.toLowerCase().trim();
      const managedFacilities = gameState?.managedClubFacilities || {};

      const isProtectedClub = (c: Club) => {
        if (currentClubId != null && (c.id === currentClubId || String(c.id) === String(currentClubId))) return true;
        if (currentClubName && c.name?.toLowerCase().trim() === currentClubName && (c.country || 'GER') === (gameState?.club?.country || 'GER')) return true;
        const key = String(c.id || c.name);
        if (managedFacilities[key]) return true;
        if (c.name && managedFacilities[c.name.toLowerCase().trim()]) return true;
        if (c.id != null && managedFacilities[String(c.id)]) return true;
        return false;
      };

      // 3. Single-pass linear tier balancing (ensuring every German tier 1..11 strictly has 18 clubs in a single pass)
      for (let t = 1; t <= 10; t++) {
        const inUpper = gerClubs.filter(c => c.tier === t);
        if (inUpper.length < 18) {
          const deficit = 18 - inUpper.length;
          let remainingDeficit = deficit;
          for (let fromTier = t + 1; fromTier <= 11 && remainingDeficit > 0; fromTier++) {
            const inLower = gerClubs.filter(c => c.tier === fromTier);
            const eligible = inLower.filter(c => {
              if (t < minGerReserveTier) return !isReserveClub(c.name) && !c.isReserve;
              return true;
            });
            eligible.sort((a, b) => {
              const aProt = isProtectedClub(a);
              const bProt = isProtectedClub(b);
              if (aProt && !bProt) return -1;
              if (!aProt && bProt) return 1;
              return b.baseOvr - a.baseOvr;
            });
            const promoting = eligible.slice(0, remainingDeficit);
            promoting.forEach(c => {
              c.tier = t;
            });
            remainingDeficit -= promoting.length;
          }
        } else if (inUpper.length > 18) {
          inUpper.sort((a, b) => {
            const aProt = isProtectedClub(a);
            const bProt = isProtectedClub(b);
            if (aProt && !bProt) return -1;
            if (!aProt && bProt) return 1;

            const aPinned = !isCareerActive && a.tier === 5 && (a.name.toLowerCase().includes('barockstadt') || a.name.toLowerCase().includes('hertha bsc ii') || a.name.toLowerCase().includes('gütersloh') || a.name.toLowerCase().includes('guetersloh'));
            const bPinned = !isCareerActive && b.tier === 5 && (b.name.toLowerCase().includes('barockstadt') || b.name.toLowerCase().includes('hertha bsc ii') || b.name.toLowerCase().includes('gütersloh') || b.name.toLowerCase().includes('guetersloh'));
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;

            return b.baseOvr - a.baseOvr;
          });
          const demoting = inUpper.slice(18);
          demoting.forEach(c => {
            c.tier = t + 1;
          });
        }
      }

      // Bottom tier (Tier 11) evaluation: slice and trim any excess clubs beyond 18 to eliminate infinite bloat
      const tier11Clubs = gerClubs.filter(c => c.tier === 11);
      if (tier11Clubs.length > 18) {
        tier11Clubs.sort((a, b) => {
          const aProt = isProtectedClub(a);
          const bProt = isProtectedClub(b);
          if (aProt && !bProt) return -1;
          if (!aProt && bProt) return 1;
          return b.baseOvr - a.baseOvr;
        });
        const excess = tier11Clubs.slice(18);
        const excessIds = new Set(excess.map(c => c.id));
        repaired = repaired.filter(c => !excessIds.has(c.id));
        for (let i = gerClubs.length - 1; i >= 0; i--) {
          if (excessIds.has(gerClubs[i].id)) {
            gerClubs.splice(i, 1);
          }
        }
      }
    }
  }

  return repaired;
}


/**
 * Defensive safeguard utility to prevent existing stadium expansions, academy levels,
 * medical improvements, and living simulation standings (tiers/insolvency) across worldClubs
 * from being accidentally overwritten when data mods are updated, toggled, or reloaded during a save.
 */
export function mergeClubsDbSafeguards(
  incomingClubs: Club[],
  existingClubs: Club[],
  gameState?: GameState | null
): Club[] {
  if (!Array.isArray(incomingClubs) || incomingClubs.length === 0) {
    return existingClubs || [];
  }
  if (!Array.isArray(existingClubs) || existingClubs.length === 0) {
    return incomingClubs;
  }

  const existingById = new Map<number, Club>();
  const existingByCountryAndName = new Map<string, Club>();
  const existingByName = new Map<string, Club>();

  existingClubs.forEach((c) => {
    if (c.id != null) existingById.set(c.id, c);
    if (c.name) {
      const lower = c.name.toLowerCase().trim();
      const cCountry = normalizeCountryCode(c.country || 'GER');
      existingByCountryAndName.set(`${cCountry}_${lower}`, c);
      if (!existingByName.has(lower)) existingByName.set(lower, c);
    }
  });

  const managedFacilities = gameState?.managedClubFacilities || {};
  const currentClubId = gameState?.club?.id;
  const currentClubName = gameState?.club?.name?.toLowerCase().trim();
  const currentClubCountry = gameState?.club?.country ? normalizeCountryCode(gameState.club.country) : undefined;
  const isCareerActive = Boolean(gameState && ((gameState.seasonCount || 1) > 1 || (gameState.year || 2026) > (gameState.startYear || 2026) || gameState.history?.length));

  const incomingIds = new Set<number>();

  const merged: Club[] = incomingClubs.map((incoming): Club => {
    if (incoming.id != null) incomingIds.add(incoming.id);

    const incomingCountry = normalizeCountryCode(incoming.country || 'GER');
    const incomingLower = incoming.name ? incoming.name.toLowerCase().trim() : '';

    const candidateById = incoming.id != null ? existingById.get(incoming.id) : undefined;
    const sameCountryById = candidateById && normalizeCountryCode(candidateById.country || 'GER') === incomingCountry;
    const candidateByCountryName = incomingLower ? existingByCountryAndName.get(`${incomingCountry}_${incomingLower}`) : undefined;
    const candidateByGlobalName = incomingLower ? existingByName.get(incomingLower) : undefined;
    const sameCountryByGlobalName = candidateByGlobalName && normalizeCountryCode(candidateByGlobalName.country || 'GER') === incomingCountry;

    const existing = (sameCountryById && candidateById ? candidateById : undefined) ||
                     candidateByCountryName ||
                     (sameCountryByGlobalName ? candidateByGlobalName : undefined);

    const clubKey = String(incoming.id || incoming.name);
    const facilitySaved = managedFacilities[clubKey] ||
                          (existing?.id != null ? managedFacilities[String(existing.id)] : undefined) ||
                          (incomingLower && managedFacilities[`${incomingCountry}_${incomingLower}`]) ||
                          (incomingLower && (!currentClubCountry || currentClubCountry === incomingCountry) ? managedFacilities[incomingLower] : undefined) ||
                          (existing?.name && (!currentClubCountry || currentClubCountry === incomingCountry) ? managedFacilities[existing.name.toLowerCase().trim()] : undefined);

    const isCurrentClub = Boolean(
      (currentClubId != null && (incoming.id === currentClubId || existing?.id === currentClubId)) ||
      (currentClubName && (!currentClubCountry || currentClubCountry === incomingCountry) && (incomingLower === currentClubName || existing?.name?.toLowerCase().trim() === currentClubName))
    );

    // Safeguard 1: Stadium expansions are never downgraded or lost
    let stadium = Math.max(
      incoming.stadium || 0,
      existing?.stadium || 0,
      facilitySaved?.stadium || 0
    );
    if (isCurrentClub && gameState?.club?.stadium) {
      stadium = Math.max(stadium, gameState.club.stadium);
    }

    // Safeguard 2: Academy level improvements are strictly preserved
    let academyLevel = Math.max(
      incoming.academyLevel || 1,
      existing?.academyLevel || 1,
      facilitySaved?.academyLevel || 1
    );
    if (isCurrentClub && gameState?.club?.academyLevel) {
      academyLevel = Math.max(academyLevel, gameState.club.academyLevel);
    }

    // Safeguard 3: Medical center improvements are strictly preserved
    let medicalLevel = Math.max(
      incoming.medicalLevel || 1,
      existing?.medicalLevel || 1,
      facilitySaved?.medicalLevel || 1
    );
    if (isCurrentClub && gameState?.club?.medicalLevel) {
      medicalLevel = Math.max(medicalLevel, gameState.club.medicalLevel);
    }

    // Safeguard 4: Fanbase growth
    let fanBase = Math.max(
      incoming.fanBase || 0,
      existing?.fanBase || 0,
      facilitySaved?.fanBase || 0
    );
    if (isCurrentClub && gameState?.club?.fanBase) {
      fanBase = Math.max(fanBase, gameState.club.fanBase);
    }

    // Safeguard 5: In an ongoing career, preserve living simulation changes:
    // promoted/relegated tiers, insolvent giant status, and organic OVR shifts
    let tier = incoming.tier;
    let baseOvr = incoming.baseOvr;
    let isInsolventGiant = incoming.isInsolventGiant;
    let insolvencyCount = incoming.insolvencyCount;

    if (isCareerActive && existing) {
      if (existing.tier !== undefined) tier = existing.tier;
      if (existing.baseOvr !== undefined) baseOvr = existing.baseOvr;
      if (existing.isInsolventGiant !== undefined) isInsolventGiant = existing.isInsolventGiant;
      if (existing.insolvencyCount !== undefined) insolvencyCount = existing.insolvencyCount;
    }
    // Safeguard 5b: Baseline fallback from facilities if previously managed by user
    if (facilitySaved?.tier && typeof facilitySaved.tier === 'number' && facilitySaved.tier >= 1) {
      tier = facilitySaved.tier;
    }

    // Safeguard 5c: Living simulation tiers take top priority so former clubs naturally promote and relegate as AI
    if (isCareerActive && gameState?.livingTiers) {
      const savedTierById = incoming.id != null ? gameState.livingTiers[incoming.id] : undefined;
      const savedTierByCountryName = incomingLower ? gameState.livingTiers[`${incomingCountry}_${incomingLower}`] : undefined;
      // Only fall back to un-scoped name key if no other club in incomingClubs shares this name in another country
      const hasCrossCountryDuplicateName = incomingLower && incomingClubs.some(
        other => other.id !== incoming.id && other.name?.toLowerCase().trim() === incomingLower && normalizeCountryCode(other.country || 'GER') !== incomingCountry
      );
      const savedTierByName = (incomingLower && !hasCrossCountryDuplicateName) ? gameState.livingTiers[incomingLower] : undefined;
      const savedTier = savedTierById ?? savedTierByCountryName ?? savedTierByName;
      if (typeof savedTier === 'number' && savedTier >= 1) {
        const isAmateurLeap = !facilitySaved && !isCurrentClub && (incoming.tier >= 4 || (incoming.baseOvr || 0) < 65) && savedTier === 1 && (gameState?.seasonCount || 1) <= 2;
        if (!isAmateurLeap) {
          tier = savedTier;
        }
      }
    }

    if (isCurrentClub && gameState?.club?.tier) {
      tier = gameState.club.tier;
      if (gameState.club.baseOvr) baseOvr = gameState.club.baseOvr;
    }

    // Safeguard 6: If the user previously directed this club, restore its peak OVR (allowing at most slight organic attrition)
    if (facilitySaved?.peakOvr && baseOvr < facilitySaved.peakOvr) {
      baseOvr = Math.max(baseOvr, facilitySaved.peakOvr - 2);
    }

    // Defensive safeguard: If a club has risen to an upper division (tier < incoming.tier, e.g. Vestenbergsgreuth from Tier 10 to Tier 3),
    // OR was previously managed by the user, its baseOvr must never be left at low amateur OVR (e.g. 24 OVR),
    // which would cause autoRepairClubsDb cascade demotion!
    if ((tier < incoming.tier || facilitySaved) && baseOvr < 55 && tier <= 5) {
      const targetLg = getLeagueInfo(tier, incoming.country || 'GER');
      const minCompetitiveOvr = Math.max(baseOvr, (targetLg?.avgOvr || 65) - 6);
      baseOvr = Math.max(baseOvr, minCompetitiveOvr);
    }

    return {
      ...incoming,
      tier,
      baseOvr,
      stadium: stadium > 0 ? stadium : incoming.stadium,
      academyLevel,
      medicalLevel,
      fanBase: fanBase > 0 ? fanBase : incoming.fanBase,
      isInsolventGiant,
      insolvencyCount,
      isReserve: Boolean(incoming.isReserve) || isReserveClub(incoming.name),
      leagueHistory: existing?.leagueHistory || incoming.leagueHistory,
    };
  });

  // Preserve any custom user-added clubs from existingClubs that weren't in incomingClubs
  existingClubs.forEach((c) => {
    if (c.id != null && !incomingIds.has(c.id) && c.id >= 9000) {
      merged.push(c);
    }
  });

  // Deduplication safeguard: Ensure no duplicate representations of the same reserve/parent club exist
  const getSafeguardCanonicalKey = (club: Club): string => {
    const lower = club.name.toLowerCase().trim();
    const cCountry = normalizeCountryCode(club.country || 'GER');
    if (REAL_CLUB_ALIASES[lower] != null) {
      return `${cCountry}_alias_${REAL_CLUB_ALIASES[lower]}`;
    }
    const lowerNoRes = lower.replace(/\s+res\.?$/i, '').replace(/\s+reserve$/i, '').trim();
    if (REAL_CLUB_ALIASES[lowerNoRes] != null) {
      return `${cCountry}_alias_${REAL_CLUB_ALIASES[lowerNoRes]}`;
    }
    if (club.id != null && teamsById.has(club.id)) {
      const teamEntry = teamsById.get(club.id)!;
      if (normalizeCountryCode(teamEntry.country || 'GER') === cCountry && teamEntry.name.toLowerCase().trim() === lower) {
        return `${cCountry}_id_${club.id}`;
      }
    }
    const isReserve = isReserveClub(club.name);
    const cleanParent = club.name
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
      return `${cCountry}_parent_alias_${parentAlias}_${isReserve}`;
    }
    return `${cCountry}_simp_${simplifyClubName(cleanParent)}_${isReserve}`;
  };

  const seenCanonical = new Set<string>();
  const finalMerged: Club[] = [];

  // Sort so modded versions / authentic names take precedence over unmodded fallback names (e.g. Prussia -> Borussia)
  const sortedClubs = [...merged].sort((a, b) => {
    const aLower = a.name.toLowerCase().trim();
    const bLower = b.name.toLowerCase().trim();
    const aIsFallback = aLower.startsWith('prussia') || aLower.startsWith('bavaria') || aLower.startsWith('baden');
    const bIsFallback = bLower.startsWith('prussia') || bLower.startsWith('bavaria') || bLower.startsWith('baden');
    if (!aIsFallback && bIsFallback) return -1;
    if (aIsFallback && !bIsFallback) return 1;
    return 0;
  });

  for (const club of sortedClubs) {
    const canonicalKey = getSafeguardCanonicalKey(club);
    if (seenCanonical.has(canonicalKey)) {
      continue;
    }
    seenCanonical.add(canonicalKey);
    finalMerged.push(club);
  }

  return finalMerged;
}
