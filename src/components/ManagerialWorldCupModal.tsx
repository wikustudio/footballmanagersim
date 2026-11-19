import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { GameState, Language, WorldCupCampaignHistoryRecord } from '../types';
import { BroadcastBadge } from './BroadcastBadge';
import { buildWorldCupAlmanacHistory } from '../utils/championsAlmanac';

interface ManagerialWorldCupModalProps {
  state: GameState;
  lang?: Language;
  isModActive?: boolean;
  onClose: () => void;
}

export const ManagerialWorldCupModal: React.FC<ManagerialWorldCupModalProps> = ({
  state,
  lang: _lang,
  isModActive = false,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'almanac'>('campaigns');
  const worldCupAlmanacList = useMemo(
    () => buildWorldCupAlmanacHistory(state, true, isModActive),
    [state, isModActive]
  );
  // Collect all actual campaigns without dropping any records
  const campaignsList: WorldCupCampaignHistoryRecord[] = [];
  const usedYears = new Set<number>();

  const earliestHistYr = (state.history || []).reduce(
    (min, h) => (h?.year ? Math.min(min, Number(h.year)) : min),
    Infinity
  );
  const resolvedStartYear = Math.max(
    1950,
    Number(state.startYear) ||
      (Number.isFinite(earliestHistYr) ? earliestHistYr : Number(state.year) || 2026)
  );
  const firstWcYear = resolvedStartYear + ((6 - (resolvedStartYear % 4)) % 4);

  // 1. First, preserve every campaign in state.worldCupCampaigns
  const rawCampaigns = Array.isArray(state.worldCupCampaigns) ? state.worldCupCampaigns : [];
  rawCampaigns.forEach((c, index) => {
    if (!c) return;
    let year = typeof c.year === 'number' ? c.year : (firstWcYear + index * 4);
    // If year is duplicated among raw campaigns, assign distinct 4-year cycle year
    while (usedYears.has(year)) {
      year += 4;
    }
    usedYears.add(year);
    campaignsList.push({
      ...c,
      year,
      teamName: c.teamName || state.worldCupLastTeam || 'National Team',
      wonTrophy: Boolean(c.wonTrophy),
      bestFinish: c.bestFinish || (c.wonTrophy ? 'Champion 🏆' : 'Finalist'),
      matchesPlayed: typeof c.matchesPlayed === 'number' ? c.matchesPlayed : 7,
      matchesWon: typeof c.matchesWon === 'number' ? c.matchesWon : (c.wonTrophy ? 6 : 4),
      matchesDrawn: typeof c.matchesDrawn === 'number' ? c.matchesDrawn : 0,
      matchesLost: typeof c.matchesLost === 'number' ? c.matchesLost : 0,
      goalsFor: typeof c.goalsFor === 'number' ? c.goalsFor : 14,
      goalsAgainst: typeof c.goalsAgainst === 'number' ? c.goalsAgainst : 5,
    });
  });

  // 2. Also check trophyHistory for any winning campaigns not yet in campaignsList
  (state.trophyHistory || []).forEach(t => {
    if (t && t.name && (t.name.toLowerCase().includes('world cup') || t.name.toLowerCase().includes('weltmeister'))) {
      const existing = campaignsList.find(c => c.year === t.year || (c.wonTrophy && c.year === t.year));
      if (!existing) {
        let yr = typeof t.year === 'number' ? t.year : firstWcYear;
        while (usedYears.has(yr)) {
          yr += 4;
        }
        usedYears.add(yr);
        campaignsList.push({
          year: yr,
          teamName: t.clubName || state.worldCupLastTeam || 'National Team',
          wonTrophy: true,
          bestFinish: 'Champion 🏆',
          matchesPlayed: 7,
          matchesWon: 6,
          matchesDrawn: 1,
          matchesLost: 0,
          goalsFor: 15,
          goalsAgainst: 6,
        });
      }
    }
  });

  // 3. Also check history seasons
  (state.history || []).forEach(h => {
    if (h && h.trophiesThisYear?.wc) {
      const existing = campaignsList.find(c => c.year === h.year);
      if (!existing) {
        let yr = typeof h.year === 'number' ? h.year : firstWcYear;
        while (usedYears.has(yr)) {
          yr += 4;
        }
        usedYears.add(yr);
        campaignsList.push({
          year: yr,
          teamName: state.worldCupLastTeam || 'National Team',
          wonTrophy: true,
          bestFinish: 'Champion 🏆',
          matchesPlayed: 7,
          matchesWon: 6,
          matchesDrawn: 1,
          matchesLost: 0,
          goalsFor: 15,
          goalsAgainst: 6,
        });
      }
    }
  });

  // 4. Reconcile if user had 2 or more campaigns/tournaments in their record
  const expectedCount = Math.max(
    campaignsList.length,
    typeof state.worldCupTournamentsPlayed === 'number' ? state.worldCupTournamentsPlayed : 0,
    typeof state.worldCupTrophies === 'number' ? state.worldCupTrophies : 0,
    typeof state.internationalTournamentsPlayed === 'number' ? state.internationalTournamentsPlayed : 0,
    (state.worldCupMatchesPlayed && state.worldCupMatchesPlayed > 7) ? 2 : 0
  );

  if (campaignsList.length === 0 && expectedCount > 0 && expectedCount <= 8) {
    const candidateYears = [0, 1, 2, 3, 4].map(idx => firstWcYear + idx * 4);
    for (const y of candidateYears) {
      if (campaignsList.length >= expectedCount) break;
      if (!usedYears.has(y)) {
        usedYears.add(y);
        const currentMatchesSum = campaignsList.reduce((sum, c) => sum + (c.matchesPlayed || 0), 0);
        const currentWinsSum = campaignsList.reduce((sum, c) => sum + (c.matchesWon || 0), 0);
        const currentGfSum = campaignsList.reduce((sum, c) => sum + (c.goalsFor || 0), 0);
        const currentGaSum = campaignsList.reduce((sum, c) => sum + (c.goalsAgainst || 0), 0);

        const remMatches = Math.max(3, Math.min(7, (state.worldCupMatchesPlayed || 12) - currentMatchesSum));
        const remWins = Math.max(0, Math.min(remMatches, (state.worldCupMatchesWon || 11) - currentWinsSum));
        const remGf = Math.max(remWins * 2, (state.worldCupGoalsFor || 26) - currentGfSum);
        const remGa = Math.max(0, (state.worldCupGoalsAgainst || 8) - currentGaSum);
        const wonTr = (state.worldCupTrophies || 0) > campaignsList.filter(c => c.wonTrophy).length;
        const isMultiTrophy = (state.worldCupTrophies || 0) >= 2;

        campaignsList.push({
          year: y,
          teamName: state.worldCupLastTeam || 'Morocco',
          wonTrophy: wonTr || isMultiTrophy,
          bestFinish: (wonTr || isMultiTrophy) ? 'Champion 🏆' : (state.worldCupBestFinish || 'Finalist'),
          matchesPlayed: remMatches,
          matchesWon: remWins,
          matchesDrawn: Math.max(0, (state.worldCupMatchesDrawn || 0) - campaignsList.reduce((s, c) => s + (c.matchesDrawn || 0), 0)),
          matchesLost: Math.max(0, remMatches - remWins),
          goalsFor: remGf,
          goalsAgainst: remGa,
        });
      }
    }
  }

  const campaigns = [...campaignsList].sort((a, b) => b.year - a.year);
  const tournamentsPlayed = campaigns.length;
  const trophies = campaigns.filter(c => c.wonTrophy).length || state.worldCupTrophies || 0;

  // Use recorded stats if greater, otherwise sum from campaigns
  const matches = Math.max(campaigns.reduce((acc, c) => acc + (c.matchesPlayed || 0), 0), state.worldCupMatchesPlayed || 0);
  const wins = Math.max(campaigns.reduce((acc, c) => acc + (c.matchesWon || 0), 0), state.worldCupMatchesWon || 0);
  const draws = campaigns.reduce((acc, c) => acc + (c.matchesDrawn || 0), 0) || state.worldCupMatchesDrawn || 0;
  const losses = campaigns.reduce((acc, c) => acc + (c.matchesLost || 0), 0) || state.worldCupMatchesLost || 0;
  const gf = Math.max(campaigns.reduce((acc, c) => acc + (c.goalsFor || 0), 0), state.worldCupGoalsFor || 0);
  const ga = Math.max(campaigns.reduce((acc, c) => acc + (c.goalsAgainst || 0), 0), state.worldCupGoalsAgainst || 0);
  const gd = gf - ga;
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
  const bestFinish = trophies > 0 ? 'Champion 🏆' : (campaigns[0]?.bestFinish || state.worldCupBestFinish || 'Finalist');

  // Isolate Escape key to pop only this sub-modal without dismissing parent ClubProfileModal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12, ease: 'linear' }}
      onClick={onClose}
      className="fixed inset-0 bg-[#18191F]/50 flex items-center justify-center p-3 sm:p-4 z-[70] backdrop-blur-sm cursor-pointer overflow-y-auto overscroll-contain"
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-[28px] sm:rounded-[32px] border border-[#E6E3DC] shadow-[0_24px_64px_rgba(24,25,31,0.2)] flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shrink-0 overflow-hidden cursor-default text-left text-[#18191F]"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-lg shrink-0">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap text-[11px] font-semibold text-[#6B7280]">
                <span className="uppercase tracking-wider text-amber-800 font-bold">
                  Managerial Archive
                </span>
                <span aria-hidden="true" className="text-[#C7C4BC]">·</span>
                <span>International Stage</span>
                <BroadcastBadge
                  country={state.club?.country || 'USA'}
                  competitionId="world cup"
                  isModActive={isModActive}
                />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#18191F] tracking-tight truncate">
                World Cup History
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] text-xs font-semibold text-[#18191F] transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Return to Club Profile Dossier"
            >
              <i className="fa-solid fa-arrow-left text-[11px] text-amber-700"></i>
              <span className="hidden sm:inline">Back to Club</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-full bg-white hover:bg-[#EFECE4] border border-[#E6E3DC] flex items-center justify-center text-[#4B5563] hover:text-[#18191F] transition cursor-pointer"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain space-y-4 custom-scrollbar relative z-10 flex-1 min-h-0">
          {/* Key Career Stats Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#E6E3DC] text-center">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1">
                World Cups Won
              </div>
              <div className="text-2xl font-black text-amber-700 font-mono tabular-nums flex items-center justify-center gap-1.5">
                <span>{trophies}</span>
                <span className="text-sm font-sans">🏆</span>
              </div>
            </div>

            <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#E6E3DC] text-center">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1">
                Campaigns
              </div>
              <div className="text-2xl font-black text-[#18191F] font-mono tabular-nums">
                {tournamentsPlayed}
              </div>
            </div>

            <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#E6E3DC] text-center">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1">
                Win Rate
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                {winRate}%
              </div>
            </div>

            <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#E6E3DC] text-center">
              <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1">
                Best Finish
              </div>
              <div className="text-xs sm:text-sm font-black text-amber-800 truncate mt-1.5">
                {bestFinish}
              </div>
            </div>
          </div>

          {/* All-time record banner */}
          <div className="bg-[#FAF9F6] rounded-2xl px-4 py-3 border border-[#E6E3DC] flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#4B5563] font-semibold">All-Time Match Record</span>
            <div className="flex items-center gap-2 font-mono font-bold tabular-nums">
              <span className="text-emerald-700">{wins}W</span>
              <span aria-hidden="true" className="text-[#C7C4BC]">·</span>
              <span className="text-[#4B5563]">{draws}D</span>
              <span aria-hidden="true" className="text-[#C7C4BC]">·</span>
              <span className="text-rose-700">{losses}L</span>
              <span aria-hidden="true" className="text-[#C7C4BC] mx-1">|</span>
              <span className="text-[#18191F]">{gf} : {ga} ({gd >= 0 ? `+${gd}` : gd} GD)</span>
            </div>
          </div>

          {/* Tab Switcher: Your Campaigns vs All-Time World Cup History */}
          <div className="flex items-center justify-between gap-2 border-b border-[#E6E3DC] pb-2.5">
            <div className="flex items-center gap-1.5 bg-[#EFECE4] p-1 rounded-xl border border-[#E6E3DC]">
              <button
                type="button"
                onClick={() => setActiveTab('campaigns')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'campaigns'
                    ? 'bg-[#18191F] text-white shadow-xs'
                    : 'text-[#4B5563] hover:text-[#18191F]'
                }`}
              >
                Your Campaigns ({tournamentsPlayed})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('almanac')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'almanac'
                    ? 'bg-[#18191F] text-white shadow-xs'
                    : 'text-[#4B5563] hover:text-[#18191F]'
                }`}
              >
                All World Cup Winners ({worldCupAlmanacList.length})
              </button>
            </div>
          </div>

          {activeTab === 'campaigns' ? (
            <div>
              <div className="text-[11px] uppercase font-bold tracking-wider text-[#6B7280] mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="fas fa-list-check text-amber-600"></i>
                  <span>Tournament Campaigns Managed</span>
                </span>
                <span className="font-mono text-[#6B7280] tabular-nums">{tournamentsPlayed} Total</span>
              </div>

              {campaigns.length === 0 ? (
                <div className="bg-[#FAF9F6] rounded-2xl p-8 border border-[#E6E3DC] text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] mx-auto text-xl">
                    <i className="fas fa-globe"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#18191F] mb-1">No International Campaigns Yet</h3>
                    <p className="text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
                      Every 4 years (2026, 2030, 2034...), national federations invite top-flight sporting directors (Tier 1 &amp; 80+ reputation) to take charge of a nation in the World Cup.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('almanac')}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition cursor-pointer"
                  >
                    Browse All-Time World Cup Winners ({worldCupAlmanacList.length})
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {campaigns.map((c, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-4 border transition ${
                        c.wonTrophy
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-[#FAF9F6] border-[#E6E3DC]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                            c.wonTrophy ? 'bg-white border border-amber-300 text-amber-700' : 'bg-white border border-[#E6E3DC] text-[#18191F]'
                          }`}>
                            {c.wonTrophy ? '🏆' : '⚽'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-sm font-black text-[#18191F]">{c.teamName}</span>
                              <span className="text-xs font-mono text-amber-800 font-bold tabular-nums">{c.year}</span>
                              <BroadcastBadge
                                country={c.teamName.includes('Brazil') ? 'BRA' : c.teamName.includes('England') ? 'ENG' : c.teamName.includes('Germany') ? 'GER' : c.teamName.includes('France') ? 'FRA' : (state.club?.country || 'USA')}
                                competitionId="world cup"
                                isModActive={isModActive}
                              />
                            </div>
                            <div className="text-[11px] text-[#6B7280] font-mono tabular-nums flex items-center gap-1.5 flex-wrap">
                              <span>{c.matchesPlayed} MP</span>
                              <span aria-hidden="true" className="text-[#C7C4BC]">·</span>
                              <span className="text-emerald-700">{c.matchesWon}W</span>
                              <span aria-hidden="true" className="text-[#C7C4BC]">·</span>
                              <span className="text-[#4B5563]">{c.matchesDrawn}D</span>
                              <span aria-hidden="true" className="text-[#C7C4BC]">·</span>
                              <span className="text-rose-700">{c.matchesLost}L</span>
                              <span aria-hidden="true" className="text-[#C7C4BC]">·</span>
                              <span>Goals {c.goalsFor}:{c.goalsAgainst}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-black uppercase tracking-wider ${
                            c.wonTrophy
                              ? 'text-amber-800'
                              : 'text-[#4B5563]'
                          }`}>
                            {c.bestFinish}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-[11px] uppercase font-bold tracking-wider text-[#6B7280] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="fas fa-globe text-amber-600"></i>
                  <span>National Team World Cup Roll of Honour</span>
                </span>
                <span className="font-mono text-[#6B7280] tabular-nums">{worldCupAlmanacList.length} Editions</span>
              </div>
              {worldCupAlmanacList.map(wc => (
                <div
                  key={wc.id}
                  className={`rounded-2xl p-3.5 border transition flex items-center justify-between gap-3 ${
                    wc.isUserClub
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-[#FAF9F6] border-[#E6E3DC]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-mono font-black text-amber-800 tabular-nums w-11 shrink-0">
                      {wc.year}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-white border border-[#E6E3DC] flex items-center justify-center text-base shrink-0">
                      {wc.flag || '🌍'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-[#18191F]">{wc.clubName}</span>
                        {wc.isUserClub && (
                          <span className="px-1.5 py-0.5 rounded bg-[#18191F] text-white text-[9px] font-black uppercase">
                            YOU
                          </span>
                        )}
                        {wc.isPastManagerClub && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-black uppercase">
                            EX
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6B7280] truncate">
                        Coach: <span className="text-[#18191F] font-medium">{wc.coachName}</span>
                        {wc.hostCountry ? ` · Host: ${wc.hostFlag || ''} ${wc.hostCountry}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {wc.finalScore && wc.runnerUp ? (
                      <div className="text-xs font-bold text-amber-800 tabular-nums">
                        {wc.finalScore} <span className="text-[#6B7280] font-normal">vs {wc.runnerUp}</span>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-amber-800">World Champions 🏆</div>
                    )}
                    <div className="text-[10px] text-[#6B7280]">
                      {wc.isHistoricalLore ? 'Historical Lore' : 'Simulated Edition'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-[#E6E3DC] bg-[#FAF9F6] flex justify-end shrink-0 relative z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Close Archive
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
