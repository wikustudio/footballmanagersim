import { Club, GameState, MatchdayOutcome, SeasonHistory, TableRow } from '../types';
import { getLeagueInfo, getMaxTier } from '../data/gameConstants';
import { LiveStandingsRow } from '../engine/liveSimVisualEngine';
import { resolveDivisionClubs } from '../engine/standingsEngine';

export interface SeasonSnapshotOption {
  historyIndex: number | null; // null = current live season
  year: number;
  yearSpan: string;
  clubName: string;
  leagueName: string;
  country: string;
  tier: number;
  isCurrent: boolean;
  pos?: number;
  pts?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  status?: 'C' | 'P' | 'R';
  trophyIcons?: string;
}

export interface ResolvedSeasonSnapshot {
  isHistorical: boolean;
  historyIndex: number | null;
  year: number;
  yearSpan: string;
  country: string;
  tier: number;
  clubName: string;
  clubId?: number;
  clubColor: string;
  clubLogo?: string;
  clubFallbackLogo?: string;
  leagueName: string;
  w: number;
  d: number;
  l: number;
  winRate: number;
  winRateExact: number;
  last5: Array<'W' | 'D' | 'L'>;
  playedCount: number;
  subtitle: string;
  pos?: number;
  pts?: number;
  gf?: number;
  ga?: number;
  ovr?: number;
  att?: number;
  util?: number;
  status?: 'C' | 'P' | 'R';
  trophyIcons?: string;
  pointsDeducted?: number;
}

export interface ResolvedStandingsCardData {
  isHistorical: boolean;
  year: number;
  yearSpan: string;
  country: string;
  tier: number;
  leagueName: string;
  subtitle: string;
  rows: LiveStandingsRow[];
  previewRows: LiveStandingsRow[];
}

export const formatSeasonYearSpan = (year: number): string =>
  `${year}–${String((year + 1) % 100).padStart(2, '0')}`;

const inferHistoryRecord = (
  entry: SeasonHistory,
  fallbackTotalMds: number
): { w: number; d: number; l: number; pts: number; playedCount: number } => {
  const hasExplicitRecord =
    typeof entry.wins === 'number' &&
    (typeof entry.draws === 'number' || typeof entry.losses === 'number' || entry.wins > 0);

  let w = typeof entry.wins === 'number' ? Math.max(0, entry.wins) : 0;
  let d = typeof entry.draws === 'number' ? Math.max(0, entry.draws) : 0;
  let l =
    typeof entry.losses === 'number'
      ? Math.max(0, entry.losses)
      : Math.max(0, fallbackTotalMds - w - d);

  if (!hasExplicitRecord) {
    const rawPts = typeof entry.pts === 'number' && entry.pts > 0 ? entry.pts : 0;
    if (rawPts > 0) {
      w = Math.min(fallbackTotalMds, Math.floor(rawPts / 3));
      d = Math.min(Math.max(0, fallbackTotalMds - w), rawPts - w * 3);
      l = Math.max(0, fallbackTotalMds - w - d);
    } else {
      return { w: 0, d: 0, l: 0, pts: 0, playedCount: 0 };
    }
  }

  const playedCount = w + d + l;
  const computedPts = Math.max(0, w * 3 + d - (entry.pointsDeducted || 0));
  const pts = typeof entry.pts === 'number' ? entry.pts : computedPts;
  return { w, d, l, pts, playedCount };
};

export const buildSeasonSnapshotOptions = (state: GameState): SeasonSnapshotOption[] => {
  const currentCountry = state.club.country || 'GER';
  const currentTier = state.club.tier || 1;
  const currentLeague = getLeagueInfo(currentTier, currentCountry).name;
  const currentOpt: SeasonSnapshotOption = {
    historyIndex: null,
    year: state.year,
    yearSpan: formatSeasonYearSpan(state.year),
    clubName: state.club.name,
    leagueName: currentLeague,
    country: currentCountry,
    tier: currentTier,
    isCurrent: true,
  };

  const history = Array.isArray(state.history) ? state.history : [];
  const pastOpts: SeasonSnapshotOption[] = [];
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const h = history[i];
    if (!h) continue;
    const country = h.country || currentCountry;
    const tier = h.tier || 1;
    const leagueName = getLeagueInfo(tier, country).name || h.leagueTag;
    const rec = inferHistoryRecord(h, 34);
    pastOpts.push({
      historyIndex: i,
      year: h.year,
      yearSpan: formatSeasonYearSpan(h.year),
      clubName: h.clubName || state.club.name,
      leagueName,
      country,
      tier,
      isCurrent: false,
      pos: h.pos,
      pts: rec.pts,
      wins: rec.w,
      draws: rec.d,
      losses: rec.l,
      status: h.status,
      trophyIcons: h.trophyIcons,
    });
  }

  return [currentOpt, ...pastOpts];
};

export const resolveSeasonSnapshotView = ({
  state,
  selectedHistoryIndex,
  playedMatchdays,
  currentOutcome,
  activeSchedule,
  totalMds,
  clubsDb,
}: {
  state: GameState;
  selectedHistoryIndex: number | null;
  playedMatchdays: number;
  currentOutcome?: MatchdayOutcome;
  activeSchedule: MatchdayOutcome[];
  totalMds: number;
  clubsDb?: Club[];
}): ResolvedSeasonSnapshot => {
  const history = Array.isArray(state.history) ? state.history : [];
  const currentCountry = state.club.country || 'GER';
  const currentTier = state.club.tier || 1;

  // 1. Explicitly selected historical season
  if (
    selectedHistoryIndex !== null &&
    selectedHistoryIndex >= 0 &&
    selectedHistoryIndex < history.length &&
    history[selectedHistoryIndex]
  ) {
    const h = history[selectedHistoryIndex];
    const country = h.country || currentCountry;
    const tier = h.tier || 1;
    const leagueName = getLeagueInfo(tier, country).name || h.leagueTag;
    const rec = inferHistoryRecord(h, totalMds || 34);
    const rawPct = rec.playedCount > 0 ? (rec.w / rec.playedCount) * 100 : 0;
    const matchedClub =
      h.clubId !== undefined
        ? (clubsDb || []).find((c) => String(c.id) === String(h.clubId))
        : (clubsDb || []).find((c) => c.name === h.clubName);

    return {
      isHistorical: true,
      historyIndex: selectedHistoryIndex,
      year: h.year,
      yearSpan: formatSeasonYearSpan(h.year),
      country,
      tier,
      clubName: h.clubName || state.club.name,
      clubId: h.clubId ?? matchedClub?.id,
      clubColor: h.color || matchedClub?.color || state.club.color || '#18191F',
      clubLogo: h.logo || matchedClub?.logo,
      clubFallbackLogo: h.fallbackLogo || matchedClub?.fallbackLogo,
      leagueName,
      w: rec.w,
      d: rec.d,
      l: rec.l,
      winRate: Math.round(rawPct),
      winRateExact: Number(rawPct.toFixed(1)),
      last5: (Array.isArray(h.last5) ? h.last5.slice(-5) : []) as Array<'W' | 'D' | 'L'>,
      playedCount: rec.playedCount,
      subtitle: `#${h.pos} · ${rec.pts} pts · ${leagueName}`,
      pos: h.pos,
      pts: rec.pts,
      gf: h.gf,
      ga: h.ga,
      ovr: h.ovr,
      att: h.att,
      util: h.util,
      status: h.status,
      trophyIcons: h.trophyIcons,
      pointsDeducted: h.pointsDeducted,
    };
  }

  // 2. Current live season
  const currentLeague = getLeagueInfo(currentTier, currentCountry).name;
  const currentSpan = formatSeasonYearSpan(state.year);

  if (playedMatchdays > 0 && currentOutcome) {
    const w = currentOutcome.runningWins ?? currentOutcome.runningW ?? 0;
    const d = currentOutcome.runningDraws ?? currentOutcome.runningD ?? 0;
    const l =
      currentOutcome.runningLosses ??
      currentOutcome.runningL ??
      Math.max(0, playedMatchdays - w - d);
    const rawPct = (w / Math.max(1, playedMatchdays)) * 100;
    const last5 = activeSchedule
      .slice(Math.max(0, playedMatchdays - 5), playedMatchdays)
      .map((m) => m.result);

    return {
      isHistorical: false,
      historyIndex: null,
      year: state.year,
      yearSpan: currentSpan,
      country: currentCountry,
      tier: currentTier,
      clubName: state.club.name,
      clubId: state.club.id,
      clubColor: state.club.color,
      clubLogo: state.club.logo,
      clubFallbackLogo: state.club.fallbackLogo,
      leagueName: currentLeague,
      w,
      d,
      l,
      winRate: Math.round(rawPct),
      winRateExact: Number(rawPct.toFixed(1)),
      last5,
      playedCount: playedMatchdays,
      subtitle: `MD ${playedMatchdays} · ${currentLeague}`,
    };
  }

  // 3. Current season before kickoff — show previous same-club campaign preview if available
  const lastHist = history.length > 0 ? history[history.length - 1] : null;
  const isSameClubHist =
    lastHist &&
    ((lastHist.clubId !== undefined && String(lastHist.clubId) === String(state.club.id)) ||
      (!lastHist.clubId && (!lastHist.clubName || lastHist.clubName === state.club.name)));

  if (lastHist && isSameClubHist) {
    const rec = inferHistoryRecord(lastHist, totalMds || 34);
    if (rec.playedCount > 0) {
      const rawPct = (rec.w / rec.playedCount) * 100;
      const lastHistTier = lastHist.tier || currentTier;
      const lastHistCountry = lastHist.country || currentCountry;
      const lastHistLeague =
        getLeagueInfo(lastHistTier, lastHistCountry)?.name ||
        lastHist.leagueTag ||
        currentLeague;
      return {
        isHistorical: false,
        historyIndex: null,
        year: state.year,
        yearSpan: currentSpan,
        country: currentCountry,
        tier: currentTier,
        clubName: state.club.name,
        clubId: state.club.id,
        clubColor: state.club.color,
        clubLogo: state.club.logo,
        clubFallbackLogo: state.club.fallbackLogo,
        leagueName: currentLeague,
        w: rec.w,
        d: rec.d,
        l: rec.l,
        winRate: Math.round(rawPct),
        winRateExact: Number(rawPct.toFixed(1)),
        last5: (Array.isArray(lastHist.last5) ? lastHist.last5.slice(-5) : []) as Array<
          'W' | 'D' | 'L'
        >,
        playedCount: rec.playedCount,
        subtitle: `Last yr #${lastHist.pos} · ${lastHistLeague}`,
      };
    }
  }

  return {
    isHistorical: false,
    historyIndex: null,
    year: state.year,
    yearSpan: currentSpan,
    country: currentCountry,
    tier: currentTier,
    clubName: state.club.name,
    clubId: state.club.id,
    clubColor: state.club.color,
    clubLogo: state.club.logo,
    clubFallbackLogo: state.club.fallbackLogo,
    leagueName: currentLeague,
    w: 0,
    d: 0,
    l: 0,
    winRate: 0,
    winRateExact: 0,
    last5: [],
    playedCount: 0,
    subtitle: `Opener · ${currentLeague}`,
  };
};

const sliceStandingsPreviewWindow = (rows: LiveStandingsRow[]): LiveStandingsRow[] => {
  const userIdx = rows.findIndex((r) => r.isUser);
  if (userIdx <= 8) return rows.slice(0, 9);
  return [
    ...rows.slice(0, 5),
    ...rows.slice(Math.max(5, userIdx - 2), userIdx + 2),
  ].slice(0, 9);
};

const formatGdString = (gd: string | number | undefined, gf = 0, ga = 0): string => {
  if (typeof gd === 'string' && gd.trim().length > 0) return gd.trim();
  const n = typeof gd === 'number' && Number.isFinite(gd) ? gd : gf - ga;
  return n > 0 ? `+${n}` : `${n}`;
};

const seededRand = (seed: number, min: number, max: number): number => {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return Math.floor(frac * (max - min + 1)) + min;
};

/**
 * Resolves the Standings table shown on the Overview sidebar so that choosing any archived
 * season from the Season Snapshot dropdown adjusts the league, year, emblem, and rows to match.
 */
export const resolveStandingsForSeasonSnapshot = ({
  state,
  snapshot,
  liveStandings,
  playedMatchdays,
  clubsDb,
  isModActive = false,
}: {
  state: GameState;
  snapshot: ResolvedSeasonSnapshot;
  liveStandings: LiveStandingsRow[];
  playedMatchdays: number;
  clubsDb: Club[];
  isModActive?: boolean;
}): ResolvedStandingsCardData => {
  if (!snapshot.isHistorical || snapshot.historyIndex === null) {
    const subtitle =
      playedMatchdays > 0
        ? `${snapshot.leagueName} · MD ${playedMatchdays}`
        : snapshot.leagueName;
    return {
      isHistorical: false,
      year: snapshot.year,
      yearSpan: snapshot.yearSpan,
      country: snapshot.country,
      tier: snapshot.tier,
      leagueName: snapshot.leagueName,
      subtitle,
      rows: liveStandings,
      previewRows: sliceStandingsPreviewWindow(liveStandings),
    };
  }

  const history = Array.isArray(state.history) ? state.history : [];
  const h = history[snapshot.historyIndex];
  const histYear = h?.year ?? snapshot.year;
  const histCountry = h?.country || snapshot.country || state.club.country || 'GER';
  const histTier = h?.tier || snapshot.tier || 1;
  const histLeagueName = getLeagueInfo(histTier, histCountry).name || h?.leagueTag || snapshot.leagueName;
  const maxTier = getMaxTier(histCountry, clubsDb || []);
  const isBottomTier = histTier >= maxTier;

  const archivedRows: TableRow[] | undefined = state.seasonStandingsArchive?.[histYear]?.[histTier];

  let rows: LiveStandingsRow[] = [];

  if (Array.isArray(archivedRows) && archivedRows.length > 0) {
    const total = archivedRows.length;
    rows = archivedRows.map((r, idx) => {
      const pos = idx + 1;
      const matched =
        (r.id != null
          ? (clubsDb || []).find((c) => String(c.id) === String(r.id))
          : undefined) ||
        (r.name
          ? (clubsDb || []).find(
              (c) =>
                (c.country || 'GER') === histCountry &&
                c.name.toLowerCase().trim() === r.name.toLowerCase().trim()
            )
          : undefined);

      const matchesHistUser =
        (h?.clubId != null && r.id != null && String(r.id) === String(h.clubId)) ||
        (Boolean(h?.clubName) &&
          Boolean(r.name) &&
          r.name.toLowerCase().trim() === h!.clubName.toLowerCase().trim()) ||
        (h?.clubId == null && !h?.clubName && Boolean(r.isUser));

      const isPromotionZone =
        r.status === 'C' ||
        r.status === 'P' ||
        (histTier === 1 ? pos <= 4 : pos <= 3);
      const isRelegationZone =
        r.status === 'R' || (!isBottomTier && pos > Math.max(1, total - 3));

      return {
        pos,
        id: matched?.id ?? (typeof r.id === 'number' ? r.id : 80000 + idx),
        name: r.name || matched?.name || `Club ${pos}`,
        color: r.color || matched?.color || '#4B5563',
        logo: r.logo || matched?.logo,
        mp: r.mp ?? (r.w + r.d + r.l),
        w: r.w ?? 0,
        d: r.d ?? 0,
        l: r.l ?? 0,
        gf: r.gf ?? 0,
        ga: r.ga ?? 0,
        gd: formatGdString(r.gd, r.gf ?? 0, r.ga ?? 0),
        pts: r.pts ?? 0,
        isUser: matchesHistUser,
        isPromotionZone,
        isRelegationZone,
      };
    });
  } else if (h) {
    // Fallback deterministic reconstruction for older pruned seasons so the user still
    // sees the right archived league, year, rivals, and their own exact finish/points.
    const totalClubs = 18;
    const totalMds = 34;
    const userPos = Math.max(1, Math.min(totalClubs, h.pos || 1));
    const rec = inferHistoryRecord(h, totalMds);
    const userGf = Math.max(
      14,
      h.gf ?? Math.round(rec.w * 2.0 + rec.d * 1.1 + seededRand(histYear, 4, 10))
    );
    const userGa = Math.max(
      12,
      h.ga ?? Math.round(rec.l * 1.9 + rec.d * 0.9 + seededRand(histYear + 1, 3, 8))
    );
    const histUserClub: Club = {
      id: h.clubId ?? snapshot.clubId ?? state.club.id,
      name: h.clubName || snapshot.clubName,
      tier: histTier,
      country: histCountry,
      baseOvr: h.ovr || state.club.baseOvr || 70,
      stadium: state.club.stadium || 15000,
      color: h.color || snapshot.clubColor || '#18191F',
      logo: h.logo || snapshot.clubLogo,
      fallbackLogo: h.fallbackLogo || snapshot.clubFallbackLogo,
    };

    const peers = resolveDivisionClubs({
      clubsDb: clubsDb || [],
      country: histCountry,
      tier: histTier,
      year: histYear,
      userClub: histUserClub,
      excludeUserClub: true,
      isModActive,
    }).slice(0, totalClubs - 1);

    const sortedPeers = [...peers].sort((a, b) => {
      const aScore = (a.baseOvr || 65) + seededRand(histYear * 13 + Number(a.id || 1), -4, 4);
      const bScore = (b.baseOvr || 65) + seededRand(histYear * 13 + Number(b.id || 2), -4, 4);
      return bScore - aScore;
    });

    const basePtsMap: Record<number, number> = {
      1: 80, 2: 73, 3: 66, 4: 60, 5: 55, 6: 51,
      7: 48, 8: 45, 9: 42, 10: 40, 11: 37, 12: 35,
      13: 33, 14: 31, 15: 28, 16: 25, 17: 21, 18: 16,
    };

    const posPts = new Array<number>(totalClubs + 1).fill(0);
    posPts[userPos] = rec.pts;
    for (let p = userPos - 1; p >= 1; p -= 1) {
      const ideal = (basePtsMap[p] || 45) + seededRand(histYear * 70 + p, -1, 1);
      posPts[p] = Math.min(95, Math.min(posPts[p + 1] + 4, Math.max(posPts[p + 1] + 1, ideal)));
    }
    for (let p = userPos + 1; p <= totalClubs; p += 1) {
      const ideal = (basePtsMap[p] || 30) + seededRand(histYear * 70 + p, -1, 1);
      posPts[p] = Math.max(4, Math.max(posPts[p - 1] - 4, Math.min(posPts[p - 1] - 1, ideal)));
    }

    let peerCursor = 0;
    for (let pos = 1; pos <= totalClubs; pos += 1) {
      const isPromotionZone = histTier === 1 ? pos <= 4 : pos <= 3;
      const isRelegationZone = !isBottomTier && pos > totalClubs - 3;

      if (pos === userPos) {
        rows.push({
          pos,
          id: histUserClub.id,
          name: histUserClub.name,
          color: histUserClub.color,
          logo: histUserClub.logo,
          mp: rec.playedCount || totalMds,
          w: rec.w,
          d: rec.d,
          l: rec.l,
          gf: userGf,
          ga: userGa,
          gd: formatGdString(undefined, userGf, userGa),
          pts: rec.pts,
          isUser: true,
          isPromotionZone,
          isRelegationZone,
        });
      } else {
        const peer = sortedPeers[peerCursor];
        peerCursor += 1;
        const pts = posPts[pos];
        const d = Math.min(totalMds, Math.max(4, seededRand(histYear * 31 + pos, 5, 11)));
        const w = Math.min(totalMds - d, Math.max(0, Math.floor((pts - d) / 3)));
        const adjD = Math.max(0, Math.min(totalMds - w, pts - w * 3));
        const l = Math.max(0, totalMds - w - adjD);
        const gf = Math.max(15, Math.round(w * 2.0 + adjD * 1.05 + seededRand(histYear + pos, 3, 9)));
        const ga = Math.max(15, Math.round(l * 1.9 + adjD * 1.0 + seededRand(histYear + pos * 3, 3, 9)));
        rows.push({
          pos,
          id: peer?.id ?? 91000 + pos,
          name: peer?.name ?? `${histLeagueName} Club ${pos}`,
          color: peer?.color ?? '#4B5563',
          logo: peer?.logo,
          mp: totalMds,
          w,
          d: adjD,
          l,
          gf,
          ga,
          gd: formatGdString(undefined, gf, ga),
          pts: w * 3 + adjD,
          isUser: false,
          isPromotionZone,
          isRelegationZone,
        });
      }
    }
  }

  return {
    isHistorical: true,
    year: histYear,
    yearSpan: formatSeasonYearSpan(histYear),
    country: histCountry,
    tier: histTier,
    leagueName: histLeagueName,
    subtitle: `${histLeagueName} · ${formatSeasonYearSpan(histYear)} Final`,
    rows,
    previewRows: sliceStandingsPreviewWindow(rows),
  };
};

/**
 * Resolves the target country & clamped division tier when the user switches the
 * Season Archive dropdown inside LeagueTableModal.
 */
export const resolveTierForSeasonSelection = ({
  nextSeason,
  history,
  currentClub,
  clubsDb,
}: {
  nextSeason: 'current' | number;
  history: SeasonHistory[];
  currentClub: Pick<Club, 'country' | 'tier'>;
  clubsDb: Club[];
}): { country: string; tier: number } => {
  if (
    typeof nextSeason === 'number' &&
    nextSeason >= 0 &&
    nextSeason < history.length &&
    history[nextSeason]
  ) {
    const h = history[nextSeason];
    const country = h.country || currentClub.country || 'GER';
    const maxTier = Math.max(1, getMaxTier(country, clubsDb || []));
    const tier = Math.min(Math.max(1, h.tier || 1), maxTier);
    return { country, tier };
  }

  const country = currentClub.country || 'GER';
  const maxTier = Math.max(1, getMaxTier(country, clubsDb || []));
  const tier = Math.min(Math.max(1, currentClub.tier || 1), maxTier);
  return { country, tier };
};

