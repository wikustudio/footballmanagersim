import React, { useEffect, useMemo, useState } from 'react';
import { Club, GameState } from '../types';
import { ALL_CLUBS } from '../data/clubsData';
import {
  COUNTRIES,
  getDomesticCupInfo,
  getLeagueInfo,
  getMaxTier,
  normalizeCountryCode,
} from '../data/gameConstants';
import { getContinentalCupNames, getRegion } from '../utils/regionHelpers';
import {
  AlmanacCompetitionWinner,
  buildChampionsAlmanac,
  buildTopTrophyTeamsChart,
  buildWorldCupAlmanacHistory,
  InternationalTrophyId,
  TrophyAccountingMode,
  TrophyChartScope,
} from '../utils/championsAlmanac';
import { ClubLogo } from './ClubLogo';

export interface ChampionsAlmanacViewProps {
  state: GameState;
  clubsDb?: Club[];
  initialCountry?: string;
  initialTier?: number;
  isModActive?: boolean;
  onSelectCountry?: (country: string) => void;
  onSelectTier?: (tier: number) => void;
}

type CompetitionFilterType =
  | 'league'
  | 'domestic-cup'
  | 'regional-cup'
  | 'continental-1'
  | 'continental-2'
  | 'global-club-cup'
  | 'world-cup'
  | 'all';

interface FlattenedAlmanacRow {
  year: number;
  seasonLabel: string;
  isHistoricalLore: boolean;
  winner: AlmanacCompetitionWinner;
}

/**
 * Global & Regional Champions Almanac
 * Simple, high-contrast list view with Country, Tier, and Year filters plus a separate Competition filter,
 * combining Pre-Start Historical Lore (1950–careerStartYear-1) with Live Simulated Seasons (careerStartYear+).
 */
export const ChampionsAlmanacView: React.FC<ChampionsAlmanacViewProps> = ({
  state,
  clubsDb = ALL_CLUBS,
  initialCountry,
  initialTier,
  isModActive,
  onSelectCountry,
  onSelectTier,
}) => {
  const [country, setCountry] = useState<string>(() =>
    normalizeCountryCode(initialCountry || state.club?.country || 'GER')
  );
  const maxTierForCountry = useMemo(
    () => getMaxTier(country, clubsDb),
    [country, clubsDb]
  );
  const [tierFilter, setTierFilter] = useState<string>(() => {
    const startTier = initialTier && initialTier >= 1 ? Math.min(initialTier, getMaxTier(normalizeCountryCode(initialCountry || state.club?.country || 'GER'), clubsDb)) : 1;
    return String(startTier);
  });
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [competitionFilter, setCompetitionFilter] = useState<CompetitionFilterType>('league');
  const [visibleLimit, setVisibleLimit] = useState<number>(40);

  useEffect(() => {
    if (initialCountry) {
      const norm = normalizeCountryCode(initialCountry);
      setCountry(prev => {
        if (prev === norm) return prev;
        const nextMax = getMaxTier(norm, clubsDb);
        setTierFilter(cur => {
          const n = Number(cur);
          return !n || n > nextMax || n < 1 ? '1' : cur;
        });
        if (nextMax < 2) {
          setCompetitionFilter(cur => (cur === 'regional-cup' ? 'league' : cur));
        }
        return norm;
      });
    }
  }, [initialCountry, clubsDb]);

  useEffect(() => {
    if (typeof initialTier === 'number' && initialTier >= 1) {
      const clamped = Math.min(initialTier, maxTierForCountry);
      setTierFilter(String(clamped));
    }
  }, [initialTier, maxTierForCountry]);

  const handleCountryChange = (newCountry: string) => {
    const norm = normalizeCountryCode(newCountry);
    const nextMaxTier = getMaxTier(norm, clubsDb);
    setCountry(norm);
    const currentTierNum = Number(tierFilter);
    if (!currentTierNum || currentTierNum > nextMaxTier || currentTierNum < 1) {
      setTierFilter('1');
      onSelectTier?.(1);
    }
    if (competitionFilter === 'regional-cup' && nextMaxTier < 2) {
      setCompetitionFilter('league');
    }
    onSelectCountry?.(norm);
  };

  const handleTierChange = (nextTier: string) => {
    setTierFilter(nextTier);
    const parsedTier = Number(nextTier) || 1;
    onSelectTier?.(parsedTier);
    if (competitionFilter !== 'league' && competitionFilter !== 'all') {
      if (yearFilter !== 'all') {
        const yrNum = parseInt(yearFilter, 10);
        if (!almanacRecords.some(r => r.year === yrNum)) {
          setYearFilter('all');
        }
      }
      setCompetitionFilter('league');
    }
    setVisibleLimit(40);
  };

  const almanacRecords = useMemo(
    () => buildChampionsAlmanac(state, country, clubsDb, isModActive),
    [state, country, clubsDb, isModActive]
  );

  const careerStartYear = useMemo(() => {
    const earliestHistYr = (state.history || []).reduce(
      (min, h) => (h.year ? Math.min(min, Number(h.year)) : min),
      Infinity
    );
    return Math.max(
      1950,
      Number(state.startYear) ||
        (Number.isFinite(earliestHistYr) ? earliestHistYr : Number(state.year) || 2026)
    );
  }, [state.history, state.startYear, state.year]);

  const worldCupHistoryList = useMemo(
    () => buildWorldCupAlmanacHistory(state, true, isModActive),
    [state, isModActive]
  );

  const allYearsList = useMemo(
    () =>
      competitionFilter === 'world-cup'
        ? worldCupHistoryList.map(w => w.year)
        : almanacRecords.map(r => r.year),
    [almanacRecords, competitionFilter, worldCupHistoryList]
  );

  const domesticCupName = useMemo(
    () =>
      almanacRecords[0]?.cupWinners.find(w => w.competitionId === 'domestic-cup')?.competitionName ||
      getDomesticCupInfo(country, 1).name ||
      'National Cup',
    [almanacRecords, country]
  );

  const regionalCupName = useMemo(
    () =>
      almanacRecords[0]?.cupWinners.find(w => w.competitionId === 'regional-cup')?.competitionName ||
      (country === 'ENG'
        ? 'EFL Trophy'
        : country === 'GER'
        ? 'Landespokal'
        : getDomesticCupInfo(country, 4).name || 'Regional Cup'),
    [almanacRecords, country]
  );

  const continentalC1Name = useMemo(
    () =>
      almanacRecords[0]?.globalWinners.find(w => w.id.includes('cont1'))?.competitionName ||
      getContinentalCupNames(country).cl ||
      'Champions Cup',
    [almanacRecords, country]
  );

  const continentalC2Name = useMemo(
    () =>
      almanacRecords[0]?.globalWinners.find(w => w.id.includes('cont2'))?.competitionName ||
      getContinentalCupNames(country).el ||
      'Euro Cup',
    [almanacRecords, country]
  );

  // Flatten year records into simple list rows according to Country, Tier, Year, and Competition filters
  const flattenedRows = useMemo<FlattenedAlmanacRow[]>(() => {
    const rows: FlattenedAlmanacRow[] = [];
    const activeTierNum = Number(tierFilter) || 1;

    for (const rec of almanacRecords) {
      // 1. Year Filter (All Years or specific single year)
      if (yearFilter !== 'all') {
        const exactYear = parseInt(yearFilter, 10);
        if (!Number.isNaN(exactYear) && rec.year !== exactYear) {
          continue;
        }
      }

      // 2. Competition + Tier Filter
      if (competitionFilter === 'league') {
        const matchingLeagues = rec.leagueWinners.filter(w => w.tier === activeTierNum);
        for (const w of matchingLeagues) {
          rows.push({
            year: rec.year,
            seasonLabel: rec.seasonLabel,
            isHistoricalLore: rec.isHistoricalLore,
            winner: w,
          });
        }
      } else if (competitionFilter === 'domestic-cup') {
        const domCup = rec.cupWinners.find(
          w => w.competitionId === 'domestic-cup' || w.id.includes('domcup')
        );
        if (domCup) {
          rows.push({
            year: rec.year,
            seasonLabel: rec.seasonLabel,
            isHistoricalLore: rec.isHistoricalLore,
            winner: domCup,
          });
        }
      } else if (competitionFilter === 'regional-cup') {
        const regCup = rec.cupWinners.find(
          w => w.competitionId === 'regional-cup' || w.id.includes('regcup')
        );
        if (regCup) {
          rows.push({
            year: rec.year,
            seasonLabel: rec.seasonLabel,
            isHistoricalLore: rec.isHistoricalLore,
            winner: regCup,
          });
        }
      } else if (competitionFilter === 'continental-1') {
        const c1 = rec.globalWinners.find(w => w.id.includes('cont1'));
        if (c1) {
          rows.push({
            year: rec.year,
            seasonLabel: rec.seasonLabel,
            isHistoricalLore: rec.isHistoricalLore,
            winner: c1,
          });
        }
      } else if (competitionFilter === 'continental-2') {
        const c2 = rec.globalWinners.find(w => w.id.includes('cont2'));
        if (c2) {
          rows.push({
            year: rec.year,
            seasonLabel: rec.seasonLabel,
            isHistoricalLore: rec.isHistoricalLore,
            winner: c2,
          });
        }
      } else if (competitionFilter === 'global-club-cup') {
        const gCup = rec.globalWinners.find(
          w => w.competitionId === 'global-club-cup' || w.id.includes('global')
        );
        if (gCup) {
          rows.push({
            year: rec.year,
            seasonLabel: rec.seasonLabel,
            isHistoricalLore: rec.isHistoricalLore,
            winner: gCup,
          });
        }
      } else if (competitionFilter === 'world-cup') {
        // Handled below via worldCupHistoryList so 1930-1938 + 1950+ World Cups are included seamlessly
        continue;
      } else {
        // 'all' competitions
        const matchingLeagues = rec.leagueWinners.filter(w => w.tier === activeTierNum);
        for (const w of [...matchingLeagues, ...rec.cupWinners, ...rec.globalWinners]) {
          rows.push({
            year: rec.year,
            seasonLabel: rec.seasonLabel,
            isHistoricalLore: rec.isHistoricalLore,
            winner: w,
          });
        }
      }
    }

    if (competitionFilter === 'world-cup') {
      for (const wc of worldCupHistoryList) {
        if (yearFilter !== 'all') {
          const exactYear = parseInt(yearFilter, 10);
          if (!Number.isNaN(exactYear) && wc.year !== exactYear) {
            continue;
          }
        }
        rows.push({
          year: wc.year,
          seasonLabel: `${wc.year}`,
          isHistoricalLore: wc.isHistoricalLore,
          winner: wc,
        });
      }
    }

    return rows;
  }, [almanacRecords, yearFilter, competitionFilter, tierFilter, worldCupHistoryList]);

  const displayedRows = useMemo(
    () => flattenedRows.slice(0, visibleLimit),
    [flattenedRows, visibleLimit]
  );

  // Dynamic column title matching the active competition/tier
  const championColumnTitle = useMemo(() => {
    if (competitionFilter === 'league') {
      const tNum = Number(tierFilter) || 1;
      const lgName = getLeagueInfo(tNum, country).name;
      return `${String(lgName || `Tier ${tNum}`).toUpperCase()} CHAMPION`;
    }
    if (competitionFilter === 'domestic-cup') {
      return `${String(domesticCupName || 'Domestic Cup').toUpperCase()} CHAMPION`;
    }
    if (competitionFilter === 'regional-cup') {
      return `${String(regionalCupName || 'Regional Cup').toUpperCase()} CHAMPION`;
    }
    if (competitionFilter === 'continental-1') {
      return `${String(continentalC1Name || 'Champions Cup').toUpperCase()} CHAMPION`;
    }
    if (competitionFilter === 'continental-2') {
      return `${String(continentalC2Name || 'Continental Cup').toUpperCase()} CHAMPION`;
    }
    if (competitionFilter === 'global-club-cup') {
      return `GLOBAL CLUB CUP CHAMPION`;
    }
    if (competitionFilter === 'world-cup') {
      return `WORLD CUP CHAMPION`;
    }
    return `TROPHY CHAMPION`;
  }, [
    competitionFilter,
    tierFilter,
    country,
    domesticCupName,
    regionalCupName,
    continentalC1Name,
    continentalC2Name,
  ]);

  return (
    <div className="space-y-4" data-testid="champions-almanac-view">
      {/* Filter Controls Bar: Country, Tier, Year + Separate Competition Filter */}
      <div className="rounded-xl border border-slate-800 bg-[#12151f] p-3.5 sm:p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Country Filter */}
          <div>
            <label
              htmlFor="almanac-country-select"
              className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1"
            >
              Country
            </label>
            <select
              id="almanac-country-select"
              aria-label="Country"
              value={country}
              onChange={e => handleCountryChange(e.target.value)}
              className="w-full rounded-lg bg-[#181c29] border border-slate-700/80 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            >
              {Object.entries(COUNTRIES).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.flag} {info.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Tier Filter */}
          <div>
            <label
              htmlFor="almanac-tier-select"
              className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1"
            >
              Tier
            </label>
            <select
              id="almanac-tier-select"
              aria-label="Tier"
              value={tierFilter}
              onChange={e => handleTierChange(e.target.value)}
              disabled={competitionFilter !== 'league' && competitionFilter !== 'all'}
              className="w-full rounded-lg bg-[#181c29] border border-slate-700/80 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400 disabled:opacity-50"
            >
              {Array.from({ length: maxTierForCountry }, (_, idx) => {
                const t = idx + 1;
                const lg = getLeagueInfo(t, country);
                return (
                  <option key={t} value={String(t)}>
                    Tier {t} — {lg.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. Year Filter */}
          <div>
            <label
              htmlFor="almanac-year-select"
              className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1"
            >
              Year
            </label>
            <select
              id="almanac-year-select"
              aria-label="Year"
              value={yearFilter}
              onChange={e => {
                setYearFilter(e.target.value);
                setVisibleLimit(50);
              }}
              className="w-full rounded-lg bg-[#181c29] border border-slate-700/80 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Years</option>
              {allYearsList.map(yr => (
                <option key={yr} value={String(yr)}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Separate Competition Filter */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">
            Competition:
          </span>
          {(
            [
              { id: 'league', label: 'League Pyramid' },
              { id: 'domestic-cup', label: domesticCupName },
              ...(maxTierForCountry >= 2 ? [{ id: 'regional-cup' as CompetitionFilterType, label: regionalCupName }] : []),
              { id: 'continental-1', label: continentalC1Name },
              { id: 'continental-2', label: continentalC2Name },
              { id: 'global-club-cup', label: 'Global Club Cup' },
              { id: 'world-cup', label: 'World Cup' },
              { id: 'all', label: 'All Competitions' },
            ] as { id: CompetitionFilterType; label: string }[]
          ).map(item => {
            const active = competitionFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (yearFilter !== 'all') {
                    const yrNum = parseInt(yearFilter, 10);
                    if (item.id === 'world-cup') {
                      if (!worldCupHistoryList.some(w => w.year === yrNum)) {
                        setYearFilter('all');
                      }
                    } else if (!almanacRecords.some(r => r.year === yrNum)) {
                      setYearFilter('all');
                    }
                  }
                  setCompetitionFilter(item.id);
                  setVisibleLimit(40);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-[#181c29] text-slate-300 border border-slate-700/80 hover:border-slate-600 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simple List Table */}
      <div className="rounded-xl border border-slate-800/90 bg-[#12151f] overflow-hidden shadow-xl">
        {displayedRows.length === 0 ? (
          <div className="p-8 text-center">
            {almanacRecords.length === 0 ? (
              <>
                <p className="text-sm font-bold text-slate-200">
                  Inaugural {careerStartYear} Season Underway
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Complete the {careerStartYear} campaign to crown the first champions in the Almanac.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-300">No champions found for the selected filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setTierFilter('1');
                    setYearFilter('all');
                    setCompetitionFilter('league');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 cursor-pointer"
                >
                  Reset Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#181c29] text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="py-3.5 px-5 w-24">YEAR</th>
                  <th className="py-3.5 px-5">{championColumnTitle}</th>
                  <th className="py-3.5 px-5">COMPETITION</th>
                  <th className="py-3.5 px-5 text-right text-slate-100">POINTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedRows.map(row => {
                  const w = row.winner;
                  const pts =
                    w.pts ??
                    (w.wins != null && w.draws != null ? w.wins * 3 + w.draws : 78);
                  const coachName = w.coachName || 'Head Coach';

                  return (
                    <tr
                      key={`${row.year}-${w.id}`}
                      className={`transition-colors hover:bg-[#181d2b] ${
                        w.isUserClub ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* YEAR */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="text-[#eab308] font-bold text-sm sm:text-base tabular-nums">
                          {row.year}
                        </span>
                      </td>

                      {/* CHAMPION (Club Crest / National Flag + Bold Name + Coach Subtitle) */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5 min-w-0">
                          {w.isNationalTeam ? (
                            <div
                              className="w-8 h-8 rounded-full bg-slate-800/90 border border-amber-400/40 flex items-center justify-center text-base shrink-0 shadow-sm"
                              title={w.clubName}
                            >
                              {w.flag || '🌍'}
                            </div>
                          ) : (
                            <ClubLogo
                              id={w.clubId}
                              name={w.clubName}
                              logo={w.clubLogo}
                              color={w.clubColor}
                              isModActive={isModActive}
                              className="w-8 h-8 object-contain shrink-0"
                              fallbackClassName="w-8 h-8 rounded-full text-xs flex items-center justify-center font-bold text-white shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm sm:text-base font-bold text-white leading-snug">
                                {w.clubName}
                              </span>
                              {w.isUserClub && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                                  YOU
                                </span>
                              )}
                              {w.isPastManagerClub && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 text-[9px] font-black uppercase">
                                  EX
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              <span className="text-slate-500">Coach:</span> {coachName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* COMPETITION (Gold middle column) */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="text-[#eab308] font-semibold text-xs sm:text-sm">
                          {w.competitionName}
                        </div>
                        {w.tier != null ? (
                          <div className="text-[11px] text-slate-500">
                            Tier {w.tier}
                            {row.isHistoricalLore ? ' • Lore' : ' • Live'}
                          </div>
                        ) : w.isNationalTeam ? (
                          <div className="text-[11px] text-slate-400">
                            {w.hostFlag ? `${w.hostFlag} ` : ''}
                            {w.hostCountry ? `Host: ${w.hostCountry}` : 'National Teams'}
                            {w.finalScore && w.runnerUp ? ` • ${w.finalScore} vs ${w.runnerUp}` : ''}
                          </div>
                        ) : null}
                      </td>

                      {/* POINTS (League Points; — for Knockout Cups) */}
                      <td
                        className="py-4 px-5 text-right whitespace-nowrap tabular-nums"
                        title={
                          w.category === 'league'
                            ? `${pts} pts${
                                w.wins != null && w.draws != null && w.losses != null
                                  ? ` (${w.wins}W – ${w.draws}D – ${w.losses}L)`
                                  : ''
                              }`
                            : `${w.competitionName} Winner (Knockout Cup)`
                        }
                      >
                        {w.category === 'league' ? (
                          <span className="inline-flex items-baseline justify-end gap-1">
                            <span className="text-emerald-400 font-bold text-sm sm:text-base">
                              {pts}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              pts
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-semibold text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination / Load More Footer */}
        {flattenedRows.length > visibleLimit && (
          <div className="p-3.5 bg-[#181c29] border-t border-slate-800/80 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">
              Showing <strong className="text-white">{displayedRows.length}</strong> of{' '}
              <strong className="text-white">{flattenedRows.length}</strong> entries
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleLimit(prev => prev + 40)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 cursor-pointer"
              >
                Show +40 More
              </button>
              <button
                type="button"
                onClick={() => setVisibleLimit(flattenedRows.length)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 cursor-pointer"
              >
                Show All ({flattenedRows.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export interface TrophyLeadersChartViewProps {
  state: GameState;
  clubsDb?: Club[];
  initialCountry?: string;
  initialTier?: number;
  isModActive?: boolean;
  onSelectCountry?: (country: string) => void;
  onSelectTier?: (tier: number) => void;
}

const INTERNATIONAL_COMPETITION_OPTIONS: {
  id: InternationalTrophyId;
  label: string;
  regionLabel: string;
}[] = [
  { id: 'world-cup', label: 'World Cup', regionLabel: 'National Teams' },
  { id: 'champions-cup', label: 'Champions Cup', regionLabel: 'Europe' },
  { id: 'euro-cup', label: 'Euro Cup', regionLabel: 'Europe' },
  { id: 'libertadores', label: 'Copa Libertadores', regionLabel: 'South America' },
  { id: 'sudamericana', label: 'Copa Sudamericana', regionLabel: 'South America' },
  { id: 'concacaf', label: 'Concacaf Champions Cup', regionLabel: 'North America' },
  { id: 'leagues-cup', label: 'Leagues Challenge', regionLabel: 'North America' },
  { id: 'afc', label: 'AFC Champions League', regionLabel: 'Asia' },
  { id: 'afc-cup', label: 'AFC Cup', regionLabel: 'Asia' },
  { id: 'global-club-cup', label: 'Global Club Cup', regionLabel: 'World' },
];

/**
 * Third Separate View: Top 5 Teams by Trophy Count Bar Chart
 * Filterable by Country & Tier (or Domestic Cup) OR by International Competition.
 * Automatically accounts for historic lore (1950+) when starting in modern era,
 * or builds fresh from the starting point when the user starts in a historic era.
 */
export const TrophyLeadersChartView: React.FC<TrophyLeadersChartViewProps> = ({
  state,
  clubsDb = ALL_CLUBS,
  initialCountry,
  initialTier,
  isModActive,
  onSelectCountry,
  onSelectTier,
}) => {
  const [scope, setScope] = useState<TrophyChartScope>('country_tier');
  const [country, setCountry] = useState<string>(() =>
    normalizeCountryCode(initialCountry || state.club?.country || 'GER')
  );
  const [domesticCompId, setDomesticCompId] = useState<string>(() => {
    const startCountry = normalizeCountryCode(initialCountry || state.club?.country || 'GER');
    const maxT = getMaxTier(startCountry, clubsDb);
    const t = initialTier && initialTier >= 1 ? Math.min(initialTier, maxT) : 1;
    return `tier-${t}`;
  });
  const [intlCompId, setIntlCompId] = useState<InternationalTrophyId>(() => {
    const startCountry = normalizeCountryCode(initialCountry || state.club?.country || 'GER');
    const reg = getRegion(startCountry);
    if (reg === 'CONMEBOL') return 'libertadores';
    if (reg === 'CONCACAF') return 'concacaf';
    if (reg === 'AFC') return 'afc';
    return 'champions-cup';
  });
  const [accountingMode, setAccountingMode] = useState<TrophyAccountingMode>('auto');

  const maxTierForCountry = useMemo(
    () => getMaxTier(country, clubsDb),
    [country, clubsDb]
  );

  useEffect(() => {
    if (initialCountry) {
      const norm = normalizeCountryCode(initialCountry);
      setCountry(prev => {
        if (prev === norm) return prev;
        const nextMax = getMaxTier(norm, clubsDb);
        setDomesticCompId(cur => {
          if (cur.startsWith('tier-')) {
            const tNum = Number(cur.replace('tier-', '')) || 1;
            if (tNum > nextMax) return 'tier-1';
          } else if (cur === 'regional-cup' && nextMax < 2) {
            return 'tier-1';
          }
          return cur;
        });
        return norm;
      });
    }
  }, [initialCountry, clubsDb]);

  useEffect(() => {
    if (typeof initialTier === 'number' && initialTier >= 1) {
      const clamped = Math.min(initialTier, maxTierForCountry);
      setDomesticCompId(cur => (cur.startsWith('tier-') ? `tier-${clamped}` : cur));
    }
  }, [initialTier, maxTierForCountry]);

  const handleCountryChange = (newCountry: string) => {
    const norm = normalizeCountryCode(newCountry);
    const nextMax = getMaxTier(norm, clubsDb);
    setCountry(norm);
    if (domesticCompId.startsWith('tier-')) {
      const tNum = Number(domesticCompId.replace('tier-', '')) || 1;
      if (tNum > nextMax) {
        setDomesticCompId('tier-1');
        onSelectTier?.(1);
      }
    } else if (domesticCompId === 'regional-cup' && nextMax < 2) {
      setDomesticCompId('tier-1');
      onSelectTier?.(1);
    }
    onSelectCountry?.(norm);
  };

  const selectedTierNum = useMemo(() => {
    if (domesticCompId.startsWith('tier-')) {
      return Math.min(maxTierForCountry, Math.max(1, Number(domesticCompId.replace('tier-', '')) || 1));
    }
    return 1;
  }, [domesticCompId, maxTierForCountry]);

  const domesticCupName = useMemo(
    () => getDomesticCupInfo(country, 1).name || 'National Cup',
    [country]
  );

  const regionalCupName = useMemo(
    () =>
      country === 'ENG'
        ? 'EFL Trophy'
        : country === 'GER'
        ? 'Landespokal'
        : getDomesticCupInfo(country, 4).name || 'Regional Cup',
    [country]
  );

  const chartResult = useMemo(
    () =>
      buildTopTrophyTeamsChart(
        state,
        {
          scope,
          country,
          tier: selectedTierNum,
          domesticCompetitionId: domesticCompId,
          internationalCompetitionId: intlCompId,
          accountingMode,
          limit: 5,
        },
        clubsDb,
        isModActive
      ),
    [
      state,
      scope,
      country,
      selectedTierNum,
      domesticCompId,
      intlCompId,
      accountingMode,
      clubsDb,
      isModActive,
    ]
  );

  const effectiveAccounting = chartResult.accountingMode;
  const countryMeta = COUNTRIES[country as keyof typeof COUNTRIES];

  return (
    <div className="space-y-4" data-testid="trophy-leaders-chart-view">
      {/* Filter Controls Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#12151f] p-3.5 sm:p-4 space-y-3">
        {/* Top Row: Scope Switcher (Country & Tier vs International Competition) + Era Accounting Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 bg-[#181c29] p-1 rounded-lg border border-slate-700/80">
            <button
              type="button"
              onClick={() => setScope('country_tier')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                scope === 'country_tier'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              By Country & Tier
            </button>
            <button
              type="button"
              onClick={() => setScope('international')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                scope === 'international'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              By International Competition
            </button>
          </div>

          {/* Era Accounting Toggle: Historic All-Time vs Fresh from Start Year */}
          <div className="flex items-center gap-1.5 bg-[#181c29] p-1 rounded-lg border border-slate-700/80">
            <button
              type="button"
              onClick={() => setAccountingMode('fresh_from_start')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                effectiveAccounting === 'fresh_from_start'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={`Count only live simulated seasons from your ${chartResult.careerStartYear} starting point`}
            >
              Fresh from {chartResult.careerStartYear}
            </button>
            <button
              type="button"
              onClick={() => setAccountingMode('all_time')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                effectiveAccounting === 'all_time'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Count all historical lore titles (1950+) combined with live simulated seasons"
            >
              All-Time (Incl. 1950+ Lore)
            </button>
          </div>
        </div>

        {/* Second Row: Country + Tier Selectors OR International Competition Selector */}
        {scope === 'country_tier' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="trophy-chart-country-select"
                className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1"
              >
                Country
              </label>
              <select
                id="trophy-chart-country-select"
                aria-label="Chart Country"
                value={country}
                onChange={e => handleCountryChange(e.target.value)}
                className="w-full rounded-lg bg-[#181c29] border border-slate-700/80 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              >
                {Object.entries(COUNTRIES).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.flag} {info.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="trophy-chart-tier-select"
                className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1"
              >
                Tier / Domestic Competition
              </label>
              <select
                id="trophy-chart-tier-select"
                aria-label="Chart Tier"
                value={domesticCompId}
                onChange={e => {
                  const val = e.target.value;
                  setDomesticCompId(val);
                  if (val.startsWith('tier-')) {
                    const parsed = Number(val.replace('tier-', '')) || 1;
                    onSelectTier?.(parsed);
                  }
                }}
                className="w-full rounded-lg bg-[#181c29] border border-slate-700/80 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              >
                {Array.from({ length: maxTierForCountry }, (_, idx) => {
                  const t = idx + 1;
                  const lg = getLeagueInfo(t, country);
                  return (
                    <option key={`tier-${t}`} value={`tier-${t}`}>
                      Tier {t} — {lg.name}
                    </option>
                  );
                })}
                <option value="domestic-cup">National Cup — {domesticCupName}</option>
                {maxTierForCountry >= 2 && (
                  <option value="regional-cup">Regional Cup — {regionalCupName}</option>
                )}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor="trophy-chart-intl-select"
              className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5"
            >
              International Competition
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERNATIONAL_COMPETITION_OPTIONS.map(opt => {
                const active = intlCompId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIntlCompId(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-[#181c29] text-slate-300 border border-slate-700/80 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`text-[10px] font-normal ${
                        active ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      · {opt.regionLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top 5 Teams Bar Chart Card */}
      <div className="rounded-xl border border-slate-800/90 bg-[#12151f] p-4 sm:p-6 shadow-xl space-y-5">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-800/80">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              {scope === 'country_tier'
                ? `${countryMeta?.flag || ''} ${countryMeta?.name || country} · ${
                    domesticCompId.startsWith('tier-')
                      ? `Tier ${selectedTierNum}`
                      : domesticCompId === 'regional-cup'
                      ? 'Regional Cup'
                      : 'Domestic Cup'
                  }`
                : intlCompId === 'world-cup'
                ? 'National Team Global Silverware'
                : 'International Club Silverware'}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
              Top 5 Trophy Leaders — {chartResult.competitionName}
            </h3>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 tabular-nums">
            <div className="font-semibold text-slate-200">
              {effectiveAccounting === 'fresh_from_start'
                ? `Built Fresh Since ${chartResult.careerStartYear}`
                : `All-Time History (${chartResult.startYearCounted || 1950}–${
                    chartResult.endYearCounted || chartResult.careerStartYear
                  })`}
            </div>
            <div>
              {chartResult.totalSeasonsCounted}{' '}
              {chartResult.totalSeasonsCounted === 1 ? 'Season' : 'Seasons'} Counted
            </div>
          </div>
        </div>

        {/* Empty State (e.g. Fresh Start before Season 1 is completed) */}
        {chartResult.topTeams.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-3">
            <div className="text-sm font-bold text-slate-200">
              Building Fresh from {chartResult.careerStartYear} — No Seasons Completed Yet
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Because your career started in {chartResult.careerStartYear}, this chart builds fresh
              from {chartResult.careerStartYear} onwards. Complete your first season to crown the
              inaugural champions, or switch to All-Time mode to include pre-start history.
            </p>
            {chartResult.careerStartYear > 1950 && (
              <button
                type="button"
                onClick={() => setAccountingMode('all_time')}
                className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Load All-Time History (1950–{chartResult.careerStartYear - 1})
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {chartResult.topTeams.map(team => {
              const barColorClass =
                team.rank === 1
                  ? 'from-amber-400 to-yellow-500'
                  : team.isUserClub
                  ? 'from-sky-400 to-blue-500'
                  : team.rank === 2
                  ? 'from-slate-300 to-slate-400'
                  : team.rank === 3
                  ? 'from-amber-600 to-amber-700'
                  : 'from-slate-500 to-slate-600';

              const rankTextClass =
                team.rank === 1
                  ? 'text-amber-400 font-black'
                  : team.rank === 2
                  ? 'text-slate-200 font-bold'
                  : team.rank === 3
                  ? 'text-amber-500 font-bold'
                  : 'text-slate-400 font-bold';

              const previewYears = team.yearsWon.slice(0, 12);
              const extraYears = Math.max(0, team.yearsWon.length - previewYears.length);

              return (
                <div
                  key={`${team.rank}-${team.clubId || team.clubName}`}
                  data-testid={`trophy-leader-row-${team.rank}`}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    team.isUserClub
                      ? 'bg-sky-500/10 border-sky-400/40'
                      : team.rank === 1
                      ? 'bg-[#181c29] border-amber-500/30'
                      : 'bg-[#161a26] border-slate-800/80'
                  }`}
                >
                  {/* Top Row: Rank, Club Logo & Name, Trophy Count */}
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 text-sm tabular-nums shrink-0 ${rankTextClass}`}>
                        #{team.rank}
                      </span>
                      {team.isNationalTeam ? (
                        <div
                          className="w-7 h-7 rounded-full bg-slate-800/90 border border-amber-400/40 flex items-center justify-center text-sm shrink-0 shadow-sm"
                          title={team.clubName}
                        >
                          {team.flag || '🌍'}
                        </div>
                      ) : (
                        <ClubLogo
                          id={team.clubId}
                          name={team.clubName}
                          logo={team.clubLogo}
                          color={team.clubColor}
                          isModActive={isModActive}
                          className="w-7 h-7 object-contain shrink-0"
                          fallbackClassName="w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold text-white shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-white truncate">
                          {team.clubName}
                        </span>
                        {scope === 'international' && team.country && !team.isNationalTeam && (
                          <span className="text-xs text-slate-400 font-medium">
                            · {team.country}
                          </span>
                        )}
                        {team.isUserClub && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-400 text-slate-950 text-[9px] font-black uppercase">
                            YOU
                          </span>
                        )}
                        {team.isPastManagerClub && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 text-[9px] font-black uppercase">
                            EX
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 shrink-0 tabular-nums">
                      <span className="text-base sm:text-lg font-black text-amber-400">
                        {team.count}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        {team.count === 1 ? 'Trophy' : 'Trophies'}
                      </span>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        · {team.shareOfTotal}%
                      </span>
                    </div>
                  </div>

                  {/* Proportional Horizontal Bar */}
                  <div className="w-full h-3.5 rounded-lg bg-[#0d1017] border border-slate-800/90 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-md bg-gradient-to-r ${barColorClass} transition-all duration-300`}
                      style={{ width: `${team.percentageOfMax}%` }}
                    />
                  </div>

                  {/* Years Won Caption */}
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400 tabular-nums">
                    <div className="truncate">
                      <span className="text-slate-500 font-semibold mr-1.5">Years Won:</span>
                      <span>{previewYears.join(', ')}</span>
                      {extraYears > 0 && (
                        <span className="text-slate-500 ml-1">+{extraYears} more</span>
                      )}
                    </div>
                    {team.liveCount > 0 && team.historicCount > 0 && (
                      <div className="shrink-0 text-slate-400">
                        {team.liveCount} Live · {team.historicCount} Lore
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

