import { Club, ClubSeasonRecord, SeasonHistory, UniverseMovement } from '../types';
import { getLeagueInfo, getMaxTier, normalizeCountryCode } from '../data/gameConstants';
import { ALL_CLUBS } from '../data/clubsData';

// Simple deterministic hash function for consistent season progression per club & year
const hashSeed = (str: string, seed: number): number => {
  let h = seed ^ 0x12345678;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  }
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const TOP_HEAVYWEIGHT_NAMES = new Set([
  'Munich Red', 'Bayern', 'Leverkusen', 'Dortmund', 'Leipzig',
  'Man Blue', 'Manchester City', 'Man Red', 'Liverpool', 'Merseyside Red',
  'Arsenal', 'North London', 'West London', 'Chelsea',
  'Madrid White', 'Real Madrid', 'Catalunya', 'Barcelona', 'Madrid Red', 'Atletico',
  'Paris', 'PSG', 'Torino B-W', 'Juventus', 'Milano Blue', 'Inter',
  'Milano Red', 'Milan', 'Napoli', 'Naples FC', 'Benfica', 'Sporting', 'Porto'
]);

/**
 * Checks if a club qualifies as an elite Top OVR heavyweight club.
 * Top OVR clubs will be stable in Tier 1 with consistent high finishes.
 */
export const isTopOvrClub = (club: Club): boolean => {
  if (club.tier !== 1) return false;
  if ((club.baseOvr || 65) >= 80) return true;
  for (const name of TOP_HEAVYWEIGHT_NAMES) {
    if (club.name.toLowerCase().includes(name.toLowerCase())) {
      return true;
    }
  }
  return false;
};

/**
 * Calculates or retrieves the full league development history for a club
 * from startYear up to currentYear (or currentYear - 1).
 * 
 * Top OVR clubs:
 * - Extremely stable Tier 1 presence (positions 1-4, points 75-92, high OVR).
 * 
 * Tier 11 to Tier 2 clubs:
 * - May see dynamic changes (tier shifts, promotion battles, mid-table swings, relegation escapes).
 */
export const calculateClubLeagueHistory = (
  club: Club,
  startYear: number,
  currentYear: number,
  managerHistory?: SeasonHistory[],
  existingHistories?: Record<string | number, ClubSeasonRecord[]>,
  universeMovements?: UniverseMovement[]
): ClubSeasonRecord[] => {
  const clubKey = String(club.id || club.name);

  const rawCountry = club.country || ALL_CLUBS.find(c => c.id === club.id || (club.name && c.name.toLowerCase().trim() === club.name.toLowerCase().trim()))?.country || 'GER';
  const country = normalizeCountryCode(rawCountry);
  const isJapan = country === 'JPN';
  const maxCountryTier = isJapan
    ? 2
    : Math.max(
        getMaxTier(country),
        club.tier || 1,
        ...(existingHistories?.[clubKey]?.map(r => r.tier || 1) || []),
        ...(managerHistory?.filter(m => m.clubId === club.id || (club.name && m.clubName?.toLowerCase().trim() === club.name.toLowerCase().trim())).map(m => m.tier || 1) || []),
        ...((universeMovements || []).filter(m => normalizeCountryCode(m.country || country) === country).map(m => Math.max(m.fromTier || 1, m.toTier || 1)))
      );

  const isTop = isTopOvrClub(club);
  const targetCurrentTier = Math.min(maxCountryTier, Math.max(1, club.tier));
  const currentOvr = club.baseOvr || 65;

  const recordsMap = new Map<number, ClubSeasonRecord>();

  // 1. Preserve and sanitize all existing historical records for this club
  if (existingHistories && existingHistories[clubKey] && existingHistories[clubKey].length > 0) {
    existingHistories[clubKey].forEach(rec => {
      const isInvalidJapanTier = isJapan && (rec.tier > 2 || (rec.leagueName && rec.leagueName.includes('Division 3')));
      let safeTier = rec.tier;
      let leagueName = rec.leagueName;
      if (rec.tier > maxCountryTier || isInvalidJapanTier) {
        safeTier = Math.min(maxCountryTier, Math.max(1, rec.tier > maxCountryTier ? maxCountryTier : rec.tier));
        const clampedLg = getLeagueInfo(safeTier, country);
        leagueName = clampedLg.name;
      }
      recordsMap.set(rec.year, { ...rec, tier: safeTier, leagueName });
    });
  }

  // 2. Overlay all real manager tenures from managerHistory for this club (past or present tenures)
  if (managerHistory && managerHistory.length > 0) {
    managerHistory.forEach(managedSeason => {
      const isMatch = managedSeason.clubId === club.id ||
        (club.name && managedSeason.clubName && managedSeason.clubName.toLowerCase().trim() === club.name.toLowerCase().trim());
      if (isMatch) {
        const safeTier = Math.min(maxCountryTier, Math.max(1, managedSeason.tier));
        const lgInfo = getLeagueInfo(safeTier, managedSeason.country || country);
        const nextSameClubSeason = managerHistory.find(m =>
          m.year === managedSeason.year + 1 && (
            m.clubId === club.id ||
            (club.name && m.clubName && m.clubName.toLowerCase().trim() === club.name.toLowerCase().trim())
          )
        );
        const isLatestManagedYear = managedSeason.year === currentYear - 1;
        const knownNextTier = nextSameClubSeason
          ? Math.min(maxCountryTier, Math.max(1, nextSameClubSeason.tier))
          : isLatestManagedYear
          ? targetCurrentTier
          : undefined;

        let status: ClubSeasonRecord['status'] = 'midtable';
        if (managedSeason.pos === 1 || managedSeason.status === 'C' || (managedSeason.status as string) === 'champion') status = 'champion';
        else if (managedSeason.status === 'P') status = 'promoted';
        else if (managedSeason.status === 'R' && safeTier < maxCountryTier) status = 'relegated';
        else if (managedSeason.survived) status = 'safe';
        else if (knownNextTier !== undefined) {
          if (knownNextTier < safeTier) status = 'promoted';
          else if (knownNextTier > safeTier && safeTier < maxCountryTier) status = 'relegated';
          else if (safeTier === 1 && managedSeason.pos <= 4) status = 'top4';
          else if (managedSeason.pos >= 13) status = 'safe';
        } else {
          if (safeTier > 1 && managedSeason.pos <= 2) status = 'promoted';
          else if (safeTier === 1 && managedSeason.pos <= 4) status = 'top4';
          else if (managedSeason.pos >= 17 && safeTier < maxCountryTier) status = 'relegated';
          else if (managedSeason.pos >= 13) status = 'safe';
        }

        const t = managedSeason.trophiesThisYear;
        const wonAny = Boolean(t?.cl || t?.el || t?.ecl || t?.cwc || t?.bl || t?.lower || t?.dfb || t?.efl || t?.reg || managedSeason.pos === 1);
        const tName = (t?.cl || 0) > 0 ? 'Champions League'
          : (t?.bl || 0) > 0 ? 'League Title'
          : (t?.lower || 0) > 0 || managedSeason.pos === 1 ? `${lgInfo.name} Champions`
          : (t?.dfb || 0) > 0 ? 'Domestic Cup'
          : (t?.el || 0) > 0 ? 'Europa League'
          : (t?.ecl || 0) > 0 ? 'Conference League'
          : (t?.cwc || 0) > 0 ? 'Club World Cup'
          : (t?.efl || 0) > 0 ? 'League Cup'
          : (t?.reg || 0) > 0 ? 'Regional Cup'
          : undefined;

        recordsMap.set(managedSeason.year, {
          year: managedSeason.year,
          tier: safeTier,
          position: managedSeason.pos,
          ovr: managedSeason.ovr,
          leagueName: lgInfo.name,
          status,
          points: managedSeason.pts,
          wins: managedSeason.wins,
          draws: managedSeason.draws,
          losses: managedSeason.losses,
          wonTrophy: wonAny,
          trophyName: tName,
          isManagerTenure: true
        });
      }
    });
  }

  // Extract all recorded movements for this club from the living universe
  const clubMovements = (universeMovements || []).filter(m => 
    (club.id != null && (m.clubId === club.id || String(m.clubId) === String(club.id))) ||
    (m.clubName && club.name && m.clubName.toLowerCase().trim() === club.name.toLowerCase().trim())
  );

  const movementByYear = new Map<number, UniverseMovement>();
  clubMovements.forEach(m => {
    const existing = movementByYear.get(m.year);
    if (!existing || m.type === 'relegation' || m.type === 'promotion' || m.type === 'insolvency_drop' || m.type === 'title_won' || m.type === 'relegation_avoided') {
      movementByYear.set(m.year, m);
    }
  });

  const existingYears = Array.from(recordsMap.keys());
  const movementYears = clubMovements.map(m => m.year);
  const allHistoricalYears = [...existingYears, ...movementYears];
  const effectiveStartYear = allHistoricalYears.length > 0 ? Math.min(startYear, ...allHistoricalYears) : startYear;

  // Reconstruct chronological tier progression backward from currentYear
  const yearTiers = new Map<number, number>();
  let runningTier = targetCurrentTier;
  for (let y = currentYear - 1; y >= effectiveStartYear; y--) {
    const m = movementByYear.get(y);
    if (m) {
      if (m.type === 'relegation' || m.type === 'promotion' || m.type === 'insolvency_drop' || (m.type === 'title_won' && m.fromTier !== m.toTier)) {
        yearTiers.set(y, m.fromTier);
        runningTier = m.fromTier;
        continue;
      }
    }
    yearTiers.set(y, runningTier);
  }

  // If in first season and zero prior history exists
  if (currentYear <= startYear && recordsMap.size === 0) {
    const currentLeague = getLeagueInfo(targetCurrentTier, country);
    return [{
      year: startYear,
      tier: targetCurrentTier,
      position: isTop ? 2 : Math.min(18, Math.max(1, Math.round(18 - (club.baseOvr / 100) * 16))),
      ovr: club.baseOvr,
      leagueName: currentLeague.name,
      status: isTop ? 'top4' : 'midtable',
      points: isTop ? 78 : 45,
      isManagerTenure: true
    }];
  }

  // Back-calculate any missing seasons leading up to currentYear
  for (let y = effectiveStartYear; y < currentYear; y++) {
    if (recordsMap.has(y)) {
      const rec = recordsMap.get(y)!;
      // If this was an authentic manager tenure, preserve it.
      // If it was not a manager tenure, but an authentic universe movement exists for year y, let it overwrite.
      if (rec.isManagerTenure || !movementByYear.has(y)) {
        continue;
      }
    }

    // Check if manager was at this club in year y (e.g. from managerHistory)
    const managedSeason = managerHistory?.find(m => 
      m.year === y && (
        m.clubId === club.id ||
        (club.name && m.clubName && m.clubName.toLowerCase().trim() === club.name.toLowerCase().trim())
      )
    );

    if (managedSeason) {
      const safeTier = Math.min(maxCountryTier, Math.max(1, managedSeason.tier));
      const lgInfo = getLeagueInfo(safeTier, managedSeason.country || country);
      const nextSameClubSeason = managerHistory?.find(m =>
        m.year === y + 1 && (
          m.clubId === club.id ||
          (club.name && m.clubName && m.clubName.toLowerCase().trim() === club.name.toLowerCase().trim())
        )
      );
      const isLatestManagedYear = y === currentYear - 1;
      const knownNextTier = nextSameClubSeason
        ? Math.min(maxCountryTier, Math.max(1, nextSameClubSeason.tier))
        : isLatestManagedYear
        ? targetCurrentTier
        : undefined;

      let status: ClubSeasonRecord['status'] = 'midtable';
      if (managedSeason.pos === 1 || managedSeason.status === 'C' || (managedSeason.status as string) === 'champion') status = 'champion';
      else if (managedSeason.status === 'P') status = 'promoted';
      else if (managedSeason.status === 'R' && safeTier < maxCountryTier) status = 'relegated';
      else if (managedSeason.survived) status = 'safe';
      else if (knownNextTier !== undefined) {
        if (knownNextTier < safeTier) status = 'promoted';
        else if (knownNextTier > safeTier && safeTier < maxCountryTier) status = 'relegated';
        else if (safeTier === 1 && managedSeason.pos <= 4) status = 'top4';
        else if (managedSeason.pos >= 13) status = 'safe';
      } else {
        if (safeTier > 1 && managedSeason.pos <= 2) status = 'promoted';
        else if (safeTier === 1 && managedSeason.pos <= 4) status = 'top4';
        else if (managedSeason.pos >= 17 && safeTier < maxCountryTier) status = 'relegated';
        else if (managedSeason.pos >= 13) status = 'safe';
      }

      const t = managedSeason.trophiesThisYear;
      const wonAny = Boolean(t?.cl || t?.el || t?.ecl || t?.cwc || t?.bl || t?.lower || t?.dfb || t?.efl || t?.reg || managedSeason.pos === 1);
      const tName = (t?.cl || 0) > 0 ? 'Champions League'
        : (t?.bl || 0) > 0 ? 'League Title'
        : (t?.lower || 0) > 0 || managedSeason.pos === 1 ? `${lgInfo.name} Champions`
        : (t?.dfb || 0) > 0 ? 'Domestic Cup'
        : (t?.el || 0) > 0 ? 'Europa League'
        : (t?.ecl || 0) > 0 ? 'Conference League'
        : (t?.cwc || 0) > 0 ? 'Club World Cup'
        : (t?.efl || 0) > 0 ? 'League Cup'
        : (t?.reg || 0) > 0 ? 'Regional Cup'
        : undefined;

      recordsMap.set(y, {
        year: y,
        tier: safeTier,
        position: managedSeason.pos,
        ovr: managedSeason.ovr,
        leagueName: lgInfo.name,
        status,
        points: managedSeason.pts,
        wins: managedSeason.wins,
        draws: managedSeason.draws,
        losses: managedSeason.losses,
        wonTrophy: wonAny,
        trophyName: tName,
        isManagerTenure: true
      });
      continue;
    }

    const seed = hashSeed(`${club.name}_${club.id}`, y);
    const seed2 = hashSeed(`${club.id}_${club.name}`, y + 101);

    // 3. Directly plot real simulated universe movement if one occurred in year y!
    const universeMove = movementByYear.get(y);
    if (universeMove) {
      const moveTier = Math.min(maxCountryTier, Math.max(1, universeMove.fromTier));
      const lgInfo = getLeagueInfo(moveTier, country);
      let status: ClubSeasonRecord['status'] = 'midtable';
      let position = universeMove.pos || 10;
      let wonTrophy = false;
      let points = 45;

      if (universeMove.type === 'relegation') {
        position = universeMove.pos || 17;
        status = 'relegated';
        points = Math.max(18, Math.min(26, Math.round(22 + (seed - 0.5) * 4)));
      } else if (universeMove.type === 'relegation_avoided') {
        position = universeMove.pos || 16;
        status = 'safe';
        points = Math.max(30, Math.min(36, Math.round(33 + (seed - 0.5) * 4)));
      } else if (universeMove.type === 'promotion') {
        position = universeMove.pos || 2;
        status = 'promoted';
        wonTrophy = position === 1;
        points = position === 1 ? Math.round(76 + seed * 8) : Math.round(68 + seed * 6);
      } else if (universeMove.type === 'insolvency_drop') {
        position = 18;
        status = 'relegated';
        points = 14;
      } else if (universeMove.type === 'title_won') {
        position = 1;
        status = 'champion';
        wonTrophy = true;
        points = Math.round(78 + seed * 8);
      }

      recordsMap.set(y, {
        year: y,
        tier: moveTier,
        position,
        ovr: Math.max(30, currentOvr + Math.round((seed2 - 0.5) * 3)),
        leagueName: lgInfo.name,
        status,
        points,
        wins: Math.max(3, Math.round((points - 10) / 2.7)),
        draws: Math.round(seed * 7) + 4,
        losses: Math.max(3, 34 - (Math.max(3, Math.round((points - 10) / 2.7)) + Math.round(seed * 7) + 4)),
        wonTrophy,
        trophyName: wonTrophy ? `${lgInfo.name} Trophy` : undefined,
        isManagerTenure: false
      });
      continue;
    }

    // 4. Otherwise, calculate consistent historical progression for years without explicit movements
    if (isTop) {
      // TOP OVR CLUBS: STABLE in Tier 1
      const lgInfo = getLeagueInfo(1, country);
      const positionRoll = Math.floor(seed * 4) + 1; // 1, 2, 3, or 4
      const points = Math.round(75 + seed2 * 17); // 75 - 92 points
      const ovrDrift = Math.round((seed - 0.5) * 2); // -1 to +1
      const ovr = Math.max(78, currentOvr + ovrDrift);
      const status: ClubSeasonRecord['status'] = positionRoll === 1 ? 'champion' : 'top4';

      recordsMap.set(y, {
        year: y,
        tier: 1,
        position: positionRoll,
        ovr,
        leagueName: lgInfo.name,
        status,
        points,
        wins: Math.round(points / 3 * 0.85) + 12,
        draws: Math.round(seed * 6) + 3,
        losses: Math.max(2, 34 - (Math.round(points / 3 * 0.85) + 12 + Math.round(seed * 6) + 3)),
        wonTrophy: positionRoll === 1 || seed2 > 0.75,
        trophyName: positionRoll === 1 ? 'League Title' : seed2 > 0.75 ? 'National Cup' : undefined,
        isManagerTenure: false
      });
    } else {
      // TIER 11 TO TIER 2 CLUBS: Align historical tier from chronological universe timeline
      let historicalTier = yearTiers.get(y) || targetCurrentTier;
      if (isJapan && historicalTier > 2) {
        historicalTier = 2;
      }
      historicalTier = Math.min(maxCountryTier, Math.max(1, historicalTier));

      const lgInfo = getLeagueInfo(historicalTier, country);
      const leagueAvgOvr = lgInfo.avgOvr || 55;

      const ovrAdvantage = currentOvr - leagueAvgOvr;
      let baseExpectedPos = Math.round(10 - ovrAdvantage * 0.8);
      baseExpectedPos = Math.max(4, Math.min(15, baseExpectedPos));

      const swing = Math.round((seed - 0.5) * 6);
      // Bound unmanaged seasons without movements to mid-table (4-15) so no phantom promotions or drop-outs appear
      const position = Math.max(4, Math.min(15, baseExpectedPos + swing));

      let status: ClubSeasonRecord['status'] = 'midtable';
      if (position >= 13) {
        status = 'safe';
      }

      const points = Math.max(28, Math.min(62, Math.round(65 - position * 2.2 + (seed2 - 0.5) * 6)));
      const ovrDrift = Math.round((seed2 - 0.5) * 3);
      const ovr = Math.max(40, currentOvr + ovrDrift);

      recordsMap.set(y, {
        year: y,
        tier: historicalTier,
        position,
        ovr,
        leagueName: lgInfo.name,
        status,
        points,
        wins: Math.max(5, Math.round((points - 10) / 2.7)),
        draws: Math.round(seed * 8) + 4,
        losses: Math.max(4, 34 - (Math.max(5, Math.round((points - 10) / 2.7)) + Math.round(seed * 8) + 4)),
        wonTrophy: false,
        isManagerTenure: false
      });
    }
  }

  return Array.from(recordsMap.values()).sort((a, b) => a.year - b.year);
};
