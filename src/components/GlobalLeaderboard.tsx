import React, { useState, useMemo } from 'react';
import { Club, GameState, Language } from '../types';
import { formatNum } from '../data/gameConstants';
import { LeaderboardEntry } from '../lib/supabaseClient';
import { resolveHistoryClubDisplay } from '../utils/modSafeguards';

export type { LeaderboardEntry };

interface GlobalLeaderboardProps {
  highscores: LeaderboardEntry[];
  gameState?: GameState | null;
  clubsDb?: Club[];
  isModActive?: boolean;
  lang?: Language;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
}

type TabType = 'top_managers' | 'all_runs' | 'my_career';

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  highscores,
  gameState,
  clubsDb = [],
  isModActive: isModActiveProp,
  lang = 'en',
  onRefresh,
  isRefreshing = false
}) => {
  const effectiveModActive = isModActiveProp !== undefined
    ? isModActiveProp
    : (typeof window !== 'undefined' && localStorage.getItem('fms_real_mod_active') === 'true');
  const [activeTab, setActiveTab] = useState<TabType>('top_managers');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  // Current active career stats
  const currentCareerScore = gameState?.careerScore || 0;
  const currentManagerName = gameState?.managerName || 'Current Manager';
  const currentClubName = gameState?.club?.name
    ? resolveHistoryClubDisplay(
        {
          id: gameState.club.id,
          name: gameState.club.name,
          country: gameState.club.country,
          color: gameState.club.color,
          logo: gameState.club.logo,
          fallbackLogo: gameState.club.fallbackLogo,
        },
        effectiveModActive,
        clubsDb
      ).name
    : 'Current Club';
  const currentTrophies = gameState?.totals?.trophies || 0;
  const currentSeasons = gameState?.history?.length || 0;

  const normalizedHighscores = useMemo(() => {
    return (highscores || []).map((entry) => ({
      ...entry,
      clubName: resolveHistoryClubDisplay(
        { name: entry.clubName || 'Club' },
        effectiveModActive,
        clubsDb
      ).name,
    }));
  }, [highscores, effectiveModActive, clubsDb]);

  // Filtered and sorted list based on active tab and search query
  const displayedList = useMemo(() => {
    let list: LeaderboardEntry[] = [];

    if (activeTab === 'top_managers') {
      // Deduplicate by manager to display each manager's all-time personal best career
      const bestByManager = new Map<string, LeaderboardEntry>();
      for (const entry of normalizedHighscores) {
        const key = (entry.managerName || '').toLowerCase().trim();
        if (!key) continue;
        const existing = bestByManager.get(key);
        if (!existing || (entry.score || 0) > (existing.score || 0)) {
          bestByManager.set(key, entry);
        }
      }
      list = Array.from(bestByManager.values());
    } else if (activeTab === 'all_runs') {
      // All recorded career runs worldwide
      list = [...normalizedHighscores];
    } else if (activeTab === 'my_career') {
      list = normalizedHighscores.filter(
        (e) => (e.managerName || '').toLowerCase().trim() === currentManagerName.toLowerCase().trim()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          (e.managerName || '').toLowerCase().includes(q) ||
          (e.clubName || '').toLowerCase().includes(q) ||
          (e.startTier && `tier ${e.startTier}`.includes(q))
      );
    }

    // Sort descending by score and deliver top 50
    return list.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 50);
  }, [activeTab, normalizedHighscores, currentManagerName, searchQuery]);

  // Projected rank for active career among the Top 50
  const projectedRank = useMemo(() => {
    if (!currentCareerScore) return null;
    const higherCount = highscores.filter((e) => (e.score || 0) > currentCareerScore).length;
    return higherCount + 1;
  }, [highscores, currentCareerScore]);

  return (
    <div className="w-full bg-white border border-[#E6E3DC] rounded-[28px] overflow-hidden shadow-sm text-[#18191F]">
      {/* Header Bar */}
      <div className="p-5 sm:p-7 border-b border-[#E6E3DC] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF9F6]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-amber-700 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-trophy text-amber-600"></i>
              Official Global Rankings
            </span>
            <span className="text-[#C7C4BC] text-xs">·</span>
            <span className="text-[#6B7280] text-xs font-mono">
              Top 50 All-Time Managers Worldwide
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#18191F] tracking-tight">
            All-Time Leaderboard
          </h3>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Verified managerial career highscores from all players worldwide.
          </p>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center p-1 bg-[#EFECE4] border border-[#E6E3DC] rounded-2xl">
            <button
              onClick={() => setActiveTab('top_managers')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'top_managers'
                  ? 'bg-[#18191F] text-white shadow-sm'
                  : 'text-[#4B5563] hover:text-[#18191F]'
              }`}
            >
              Top 50 Managers
            </button>
            <button
              onClick={() => setActiveTab('all_runs')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'all_runs'
                  ? 'bg-[#18191F] text-white shadow-sm'
                  : 'text-[#4B5563] hover:text-[#18191F]'
              }`}
            >
              All Runs
            </button>
            <button
              onClick={() => setActiveTab('my_career')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'my_career'
                  ? 'bg-[#18191F] text-white shadow-sm'
                  : 'text-[#4B5563] hover:text-[#18191F]'
              }`}
            >
              My Careers
            </button>
          </div>

          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9890] text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manager or club..."
              className="w-full sm:w-48 pl-8 pr-3 py-1.5 bg-[#F5F4F0] border border-[#E6E3DC] rounded-xl text-xs text-[#18191F] placeholder-[#9A9890] focus:outline-none focus:border-[#18191F] transition"
            />
          </div>

          {onRefresh && (
            <button
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              aria-label="Refresh Leaderboard"
              className="p-2 rounded-xl bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] text-[#4B5563] hover:text-[#18191F] transition flex items-center justify-center cursor-pointer shrink-0"
              title="Refresh Leaderboard from Supabase"
            >
              <i className={`fa-solid fa-rotate-right text-xs ${isRefreshing ? 'fa-spin text-amber-600' : ''}`}></i>
            </button>
          )}
        </div>
      </div>

      {/* Active Manager Benchmark Ribbon */}
      {gameState && currentCareerScore > 0 && (
        <div className="px-5 sm:px-7 py-3.5 bg-sky-50/70 border-b border-[#E6E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold shrink-0">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800">
                  Current Career In Progress
                </span>
                {projectedRank && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 tabular-nums">
                    Projected #{projectedRank}
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-[#18191F] flex items-center gap-2">
                <span>{currentManagerName}</span>
                <span className="text-[#C7C4BC]">·</span>
                <span className="text-[#4B5563] text-xs">{currentClubName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:justify-end">
            <div>
              <div className="text-[9px] uppercase font-bold text-[#6B7280]">Seasons & Silverware</div>
              <div className="text-xs font-semibold text-[#18191F] tabular-nums">
                {currentSeasons} yrs · {currentTrophies} 🏆
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-[#6B7280]">Live Career Score</div>
              <div className="text-lg font-mono font-black text-amber-700 tabular-nums">
                {formatNum(currentCareerScore)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Content (Top 50 Managers) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E6E3DC] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider bg-[#FAF9F6]">
              <th className="py-3 px-4 sm:px-6 w-14 text-center">Rank</th>
              <th className="py-3 px-4">Manager</th>
              <th className="py-3 px-4 hidden sm:table-cell">Club / Entity</th>
              <th className="py-3 px-4 text-center w-24">Trophies</th>
              <th className="py-3 px-4 text-right sm:pr-8 w-28">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E3DC]">
            {displayedList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#6B7280] text-xs">
                  <i className="fa-solid fa-inbox text-2xl mb-2 text-[#9A9890] block"></i>
                  No manager records found matching criteria.
                </td>
              </tr>
            ) : (
              displayedList.map((entry, idx) => {
                const rank = idx + 1;
                const isCurrentManager =
                  (entry.managerName || '').toLowerCase().trim() === currentManagerName.toLowerCase().trim();
                const isExpanded = expandedId === entry.id;

                const medalColor =
                  rank === 1
                    ? 'text-amber-800 bg-amber-50 border-amber-300'
                    : rank === 2
                    ? 'text-[#4B5563] bg-[#F5F4F0] border-[#D6D2C7]'
                    : rank === 3
                    ? 'text-orange-800 bg-orange-50 border-orange-200'
                    : 'text-[#6B7280] bg-[#FAF9F6] border-[#E6E3DC]';

                return (
                  <React.Fragment key={entry.id || idx}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className={`hover:bg-[#FAF9F6] transition-colors cursor-pointer text-xs ${
                        isCurrentManager ? 'bg-sky-50/50' : 'bg-white'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 sm:px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-bold font-mono tabular-nums border ${medalColor}`}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Manager */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] flex items-center justify-center shrink-0">
                            {rank === 1 ? (
                              <i className="fa-solid fa-crown text-amber-600 text-xs"></i>
                            ) : (
                              <i className="fa-solid fa-user text-[#6B7280] text-xs"></i>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#18191F] flex items-center gap-1.5 truncate">
                              <span className="truncate">{entry.managerName}</span>
                              {isCurrentManager && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-sky-50 border border-sky-200 text-sky-800 shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#6B7280] sm:hidden truncate">
                              {entry.clubName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Club */}
                      <td className="py-3 px-4 hidden sm:table-cell text-[#4B5563] font-medium">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{entry.clubName}</span>
                          {entry.startTier && (
                            <span className="text-[10px] font-mono text-[#6B7280] bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#E6E3DC] tabular-nums">
                              Tier {entry.startTier}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Trophies */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-[#18191F]">
                          <i className="fa-solid fa-trophy text-amber-600 text-[10px]"></i>
                          <span className="font-mono tabular-nums">{entry.trophies || 0}</span>
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-4 text-right sm:pr-8">
                        <span className="font-mono font-black text-amber-700 text-sm tabular-nums">
                          {formatNum(entry.score)}
                        </span>
                      </td>
                    </tr>

                    {/* Expandable row */}
                    {isExpanded && (
                      <tr className="bg-[#FAF9F6] border-b border-[#E6E3DC]">
                        <td colSpan={5} className="py-3 px-6 sm:px-12 text-[#4B5563] text-[11px]">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                              <span>
                                <strong className="text-[#18191F]">Club:</strong> {entry.clubName}
                              </span>
                              {entry.startTier && (
                                <span>
                                  <strong className="text-[#18191F]">Starting Tier:</strong> Tier {entry.startTier}
                                </span>
                              )}
                              <span>
                                <strong className="text-[#18191F]">Silverware:</strong> {entry.trophies} Titles
                              </span>
                            </div>
                            <div className="text-[#6B7280] font-mono text-[10px]">
                              {entry.date ? `Recorded: ${entry.date}` : 'Verified'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default GlobalLeaderboard;
