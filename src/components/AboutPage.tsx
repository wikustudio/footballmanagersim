import React, { useState } from 'react';
import { Club, Language } from '../types';
import { ALL_CLUBS } from '../data/clubsData';
import { DatabaseModal } from './DatabaseModal';

interface AboutPageProps {
  clubsDb?: Club[];
  lang: Language;
  hasActiveGame?: boolean;
  onStartCareer?: () => void;
  onUpdateClubsDb?: (clubs: Club[], isModActive: boolean) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  lang,
  hasActiveGame = false,
  onStartCareer,
  clubsDb = [],
  onUpdateClubsDb,
}) => {
  const [showDbModal, setShowDbModal] = useState(false);
  const [activeSection, setActiveSection] = useState<
    'all' | 'updates' | 'basics' | 'tactics' | 'economy' | 'regulations'
  >('all');
  const isDe = lang === 'de';

  const calculateTiers = () => {
    const countries = Array.from(new Set(ALL_CLUBS.map((c) => c.country || 'GER')));
    const stats: Record<string, number> = {};
    for (const c of countries) {
      const clubsInCountry = ALL_CLUBS.filter((club) => (club.country || 'GER') === c).length;
      stats[c] = Math.max(1, Math.round(clubsInCountry / 18));
    }
    return {
      totalNations: countries.length,
      ger: stats['GER'] || 11,
      eng: stats['ENG'] || 7,
      ita: stats['ITA'] || 6,
      esp: stats['ESP'] || 6,
      fra: stats['FRA'] || 5,
      usa: stats['USA'] || 5,
    };
  };
  const tiers = calculateTiers();

  const filterTabs = [
    { id: 'all', label: 'All Topics' },
    { id: 'updates', label: 'Patch Notes' },
    { id: 'basics', label: 'Career & Basics' },
    { id: 'tactics', label: 'Tactics & Match Engine' },
    { id: 'economy', label: 'Economy & Facilities' },
    { id: 'regulations', label: 'Rules & Regulations' },
  ];

  return (
    <div className="w-full max-w-4xl px-4 sm:px-6 mt-6 sm:mt-10 mx-auto pb-24 text-[#18191F]">
      {/* Hero Section */}
      <div className="text-center mb-10 sm:mb-14 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E6E3DC] text-xs font-bold text-[#18191F] mb-5 tracking-wide shadow-2xs">
          <i className="fa-solid fa-compass text-sky-700"></i>
          <span>{isDe ? 'Kompendium & Spielmechaniken' : 'Rulebook & Game Mechanics'}</span>
          <span className="text-[#9A9890]">·</span>
          <span className="text-[#6B7280] tabular-nums">v3.0</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#18191F] tracking-tight leading-[1.1] mb-5">
          {isDe ? (
            <>
              35 Saisons.{' '}
              <span className="text-sky-700">Die Spielregeln.</span>
            </>
          ) : (
            <>
              35 Seasons.{' '}
              <span className="text-sky-700">Full Game Mechanics.</span>
            </>
          )}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#4B5563] font-normal max-w-2xl mx-auto leading-relaxed mb-8">
          {isDe
            ? 'Schlüpfe in die Rolle eines Sportdirektors. Wähle einen Verein oder starte in den unteren Ligen und arbeite dich hoch. Du hast 35 Saisons Zeit. Deine Entscheidungen im Kaderbau, bei Sponsoren, Taktiken und Stadionausbauten entscheiden über Triumph oder Abstieg.'
            : "Step into the shoes of a Sporting Director. Pick a club or start in the lower divisions working your way up. You have 35 seasons. Your off-season decisions—squad wage planning, transfer deals, commercial pitches, tactical setups, and stadium expansions—directly determine your club's fate."}
        </p>

        {clubsDb && clubsDb.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowDbModal(true)}
              className="bg-white hover:bg-[#EFECE4] text-[#18191F] border border-[#E6E3DC] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 shadow-xs active:scale-95 cursor-pointer group"
            >
              <i className="fa-solid fa-database text-sky-700 group-hover:scale-110 transition-transform"></i>
              <span>{isDe ? 'Globale Datenbank durchsuchen' : 'Browse Global Database'}</span>
              <span className="text-[11px] text-[#6B7280] font-semibold tabular-nums">
                ({ALL_CLUBS.length.toLocaleString()} Clubs)
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Progressive Disclosure Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-3 mb-8 sm:mb-10 sm:justify-center">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSection === tab.id
                ? 'bg-[#18191F] text-white shadow-xs'
                : 'bg-white text-[#4B5563] hover:text-[#18191F] hover:bg-[#EFECE4] border border-[#E6E3DC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Bento Grid */}
      <div className="space-y-6">
        {/* v3.0 Spotlight Bento Box */}
        {(activeSection === 'all' || activeSection === 'updates') && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex flex-col items-start sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="shrink-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                  v3.0 Spotlight
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#18191F] tracking-tight leading-snug">
                  3D Broadcast Workspace, Live Stadium &amp; Unified Standings Engine
                </h2>
              </div>
              <span className="shrink-0 whitespace-nowrap text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-sparkles text-amber-600"></i>
                <span>Latest Release</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. 5-Tab Editorial Broadcast Workspace */}
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm mb-3 border border-emerald-200">
                    <i className="fa-solid fa-table-columns"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    5-Tab Broadcast Workspace
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Rebuilt editorial command center spanning Overview, Commercial, Squad, Infrastructure, and Board &amp; Manager desks—paired with instant Quick-Action search and live executive alerts.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-emerald-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Unified 5-Desk Club Command</span>
                </div>
              </div>

              {/* 2. Interactive 3D Stadium Bowl & Club Campus */}
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-sm mb-3 border border-sky-200">
                    <i className="fa-solid fa-futbol"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    3D Stadium &amp; Club Campus
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Live matchday 3D Stadium Bowl with multi-angle broadcast cameras, tactical shot efficiency maps, full oval &amp; terrace crowd geometry, paid architecture remodeling, VIP skyboxes, and animated HQ &amp; grounds.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-sky-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Live 3D Matchday &amp; Campus</span>
                </div>
              </div>

              {/* 3. Unified 34-Matchday Standings Engine */}
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm mb-3 border border-amber-200">
                    <i className="fa-solid fa-list-ol"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Unified Standings Engine
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    100% deterministic parity between live matchday tables (MD 1–17 &amp; MD 18–34), Decision Day promotion/relegation playoffs, Season Wrap-Up, and the permanent League Archive with zero stat resets.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-amber-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Exact Live-to-Archive Parity</span>
                </div>
              </div>

              {/* 4. Coaching Hub & Calibrated Commercial Flow */}
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-sm mb-3 border border-purple-200">
                    <i className="fa-solid fa-handshake"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Coaching Hub &amp; Commercial Flow
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Integrated Squad Coaching Staff &amp; Market desk with tactical synergy tracking, tier-calibrated sponsor payouts, Stadium Naming Rights, and restored Roster, Morale, Fan &amp; Prestige suites.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-purple-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Synchronized Club Economy</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* v2.6 Historical Archive Bento Box */}
        {activeSection === 'updates' && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm transition-all relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex flex-col items-start sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="shrink-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-[#4B5563] bg-[#F5F4F0] border border-[#E6E3DC] px-2.5 py-1 rounded-xl">
                  v2.6 Archive
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#18191F] tracking-tight leading-snug">
                  Global Champions Almanac, World Cup Lore &amp; Era Realism
                </h2>
              </div>
              <span className="shrink-0 whitespace-nowrap text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                <i className="fa-solid fa-clock-rotate-left text-[#9A9890]"></i>
                <span>Archived Milestone</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Global Champions Almanac & Trophy Leaders */}
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm mb-3 border border-emerald-200">
                    <i className="fa-solid fa-book-open"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Global Champions Almanac
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Explore every champion from 1950 to your live career across all 45+ nations, divisions, domestic cups, and continental silverware, complete with interactive Top 5 Trophy Leader charts.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-emerald-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>1950–2026+ Lore &amp; Live History</span>
                </div>
              </div>

              {/* 2. National Team World Cup History (1930+) */}
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm mb-3 border border-amber-200">
                    <i className="fa-solid fa-earth-americas"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    World Cup History (1930+)
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Full National Team World Cup records dating back to 1930 Montevideo through 2022 and into future 4-year cycles, tracking host nations, stadiums, final scores, runners-up, and winning coaches.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-amber-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Full 1930+ World Cup Archive</span>
                </div>
              </div>

              {/* 3. Era-Locked Coaches (1950s–2060s+) */}
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-sm mb-3 border border-sky-200">
                    <i className="fa-solid fa-user-tie"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Era-Locked Coach Timelines
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Strict decade-by-decade managerial rosters from the 1950s through the 2020s plus dedicated future regen coach pools (2030s–2060s+) ensure past legends never resurface out of era.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-sky-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Authentic Decade Isolation</span>
                </div>
              </div>

              {/* 4. Cup Eligibility & Takeover Windfalls */}
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-sm mb-3 border border-purple-200">
                    <i className="fa-solid fa-trophy"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Cup Realism &amp; Takeover Windfalls
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Reserve and B-teams are strictly barred from Regional, Domestic, and Continental Cups, while Billionaire &amp; Consortium Takeovers wipe club debt and inject massive transfer war chests.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-purple-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Senior-Only Cups &amp; Debt Wipeouts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* v2.3 Historical Archive Bento Box */}
        {activeSection === 'updates' && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm transition-all relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="shrink-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-[#4B5563] bg-[#F5F4F0] border border-[#E6E3DC] px-2.5 py-1 rounded-xl">
                  v2.3 Archive
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#18191F] tracking-tight">
                  Executive Poaching, Giant Offers &amp; Save Integrity
                </h2>
              </div>
              <span className="shrink-0 whitespace-nowrap text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                <i className="fa-solid fa-clock-rotate-left text-[#9A9890]"></i>
                <span>Archived Milestone</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm mb-3 border border-emerald-200">
                    <i className="fa-solid fa-briefcase"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Proactive Executive Poaching
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Breakout promotions, titles, and continental runs now trigger direct rival headhunting approaches backed by a +15% transfer war chest—or a +3 squad morale loyalty boost when you stay.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-emerald-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>+15% War-Chest Headhunting</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm mb-3 border border-amber-200">
                    <i className="fa-solid fa-crown"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Premium Club Executive Offers
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    High-reputation (85–100 Rep) and multi-trophy Sporting Directors now unlock guaranteed heavyweight Tier 1 vacancies across European and global powerhouses in both base and CR27 modded databases.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-amber-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Elite Tier 1 Giant Vacancies</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-sm mb-3 border border-sky-200">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Chronology &amp; v3 Save Integrity
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Hardened post-season year advancement across localStorage and IndexedDB backups, crash-proof legacy history hydration, and full v3 save state diagnostics on recovery.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-sky-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Zero-Regression Season Sync</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-sm mb-3 border border-purple-200">
                    <i className="fa-solid fa-building-columns"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Refined Dossier &amp; Season Wrap
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Streamlined Prestige &amp; Macro Club Identity cards with clean Pros/Trade-offs layout, accurate single-cup vs. multi-trophy Season Wrap headlines, and sharpened Career Summary narratives.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-purple-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Executive UI &amp; Copy Polish</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* v2.2 Historical Archive Bento Box */}
        {activeSection === 'updates' && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm transition-all relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="shrink-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-[#4B5563] bg-[#F5F4F0] border border-[#E6E3DC] px-2.5 py-1 rounded-xl">
                  v2.2 Archive
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#18191F] tracking-tight">
                  11-Tier Road-to-Glory, Finals Integrity &amp; Delta Save Engine
                </h2>
              </div>
              <span className="shrink-0 whitespace-nowrap text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                <i className="fa-solid fa-clock-rotate-left text-[#9A9890]"></i>
                <span>Archived Milestone</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm mb-3 border border-emerald-200">
                    <i className="fa-solid fa-ranking-star"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    True Crunch-Final OVR Timing
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Squad aging, Top-5 league poaching, and off-season decay now execute strictly after Decision Day, Cup Finals, and Season History—so your squad plays every final at full current-season strength.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-emerald-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Post-Final Off-Season Turnover</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-sm mb-3 border border-sky-200">
                    <i className="fa-solid fa-stairs"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Tier 1–11 Road-to-Glory Scaling
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Full Global Leaderboard badge support and +4,000 pt promotion bonuses across Tiers 6–11, plus authentic winter transfer accounting and fresh club Prestige Legacy milestones whenever you switch clubs.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-sky-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Deep Pyramid Progression</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-sm mb-3 border border-purple-200">
                    <i className="fa-solid fa-shield-heart"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Persistent Prestige &amp; Vision Shields
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Bronze Statue (+1), Managerial Immortality (+3), and Board Vision roadmap Immunity Shield rewards now persist across browser reloads and restore up to your dynamic Prestige ceiling on trophy wins.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-purple-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Up to 6+ Prestige &amp; Vision Shields</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm mb-3 border border-amber-200">
                    <i className="fa-solid fa-floppy-disk"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Delta-Compressed Save Slots
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Multi-slot career saves now delta-compress 1,200+ clubs and strip non-active league standings archives, cutting save payloads by ~85% so 35-season and Endless careers never hit storage limits.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-amber-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Zero-Bloat Multi-Slot Storage</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* v2.1 Historical Archive Bento Box */}
        {activeSection === 'updates' && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm transition-all relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563] bg-[#F5F4F0] border border-[#E6E3DC] px-2.5 py-1 rounded-xl">
                  v2.1 Archive
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#18191F] tracking-tight">
                  360° Engine Parity, Global Fanbases &amp; Facility Mastery
                </h2>
              </div>
              <span className="text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                <i className="fa-solid fa-clock-rotate-left text-[#9A9890]"></i>
                <span>Archived Milestone</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm mb-3 border border-emerald-200">
                    <i className="fa-solid fa-earth-americas"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Global Fanbases &amp; Tier Credit
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Superclubs and continental heavyweights now command authentic multi-million global fanbases (up to 6M+ at launch), paired with tier-calibrated bank credit facilities and dynamic attendance caps for sleeping giants.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-emerald-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>2.5M–6M Mega-Club Fanbases</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-sm mb-3 border border-sky-200">
                    <i className="fa-solid fa-building-columns"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    1–5 Facility Scale &amp; Dividends
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Standardized 1–5 progression for Youth Academy and Medical Center. Unlock +1 NLZ OVR graduation boosts at Level 3, 15% Golden Boy rolls at Level 4, 25% La Masia sell-on dividends at Level 5, and up to 100% squad decay immunity.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-sky-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Level 1–5 Academy &amp; Medical</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-sm mb-3 border border-purple-200">
                    <i className="fa-solid fa-seedling"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Youth Pipeline &amp; Coaching Sync
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Full parity across Youth Academy, Incubator, and Youth Championship. Prospect talent boosts directly power tournament ratings, Youth Whisperer &amp; Youth Focus traits accelerate development, and NLZ graduation bonuses sync 1:1.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-purple-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>100% Academy &amp; Coach Parity</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm mb-3 border border-amber-200">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h3 className="text-sm font-bold text-[#18191F] mb-1.5">
                    Perks, Identities &amp; Tactics
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    Every promised perk and tactical ethos is wired end-to-end: Board Darling sacking immunity, Board Favorite +15 trust floor, Defensive -40% negative GD &amp; 4-year insolvency grace period, and persistent Macro Club Identities.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-amber-800 pt-2.5 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>360° Perk &amp; Tactical Integrity</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* v2.0 Historical Archive Bento Box */}
        {activeSection === 'updates' && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm transition-all relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563] bg-[#F5F4F0] border border-[#E6E3DC] px-2.5 py-1 rounded-xl">
                  v2.0 Archive
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#18191F] tracking-tight">
                  Game Logic Updates &amp; Realism Engine
                </h2>
              </div>
              <span className="text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                <i className="fa-solid fa-clock-rotate-left text-[#9A9890]"></i>
                <span>Archived Milestone</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs mb-2.5 border border-emerald-200">
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <h3 className="text-xs font-bold text-[#18191F] mb-1">
                    Natural Standings &amp; Points Curves
                  </h3>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed mb-2.5">
                    Authentic win, draw, and loss distributions across 34 matchdays. Smooth 2–3 point rank step-downs, realistic goal differences, and strict elimination of artificial point gaps.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#4B5563] pt-2 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Smooth Table Physics &amp; Real Draws</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center text-xs mb-2.5 border border-rose-200">
                    <i className="fa-solid fa-ban"></i>
                  </div>
                  <h3 className="text-xs font-bold text-[#18191F] mb-1">
                    Reserve Club Promotion Caps
                  </h3>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed mb-2.5">
                    Strict Tier 3 ceiling preventing B-teams and reserve squads from entering professional 1st and 2nd divisions, with automatic cascaded promotion spots for eligible clubs.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#4B5563] pt-2 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Tier 3 B-Team Ceiling &amp; Cascade</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center text-xs mb-2.5 border border-sky-200">
                    <i className="fa-solid fa-trophy"></i>
                  </div>
                  <h3 className="text-xs font-bold text-[#18191F] mb-1">
                    Continental Spots &amp; Tournaments
                  </h3>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed mb-2.5">
                    Authentic qualification spot logic across UEFA Champions League, Europa League, and Conference League with domestic cup winner integration and prestige scaling.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#4B5563] pt-2 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>UEFA UCL, UEL &amp; UECL Pathways</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs mb-2.5 border border-amber-200">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h3 className="text-xs font-bold text-[#18191F] mb-1">
                    Dynamic Scoring &amp; Pyramid Floor
                  </h3>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed mb-2.5">
                    Wide dynamic match scoring range from gritty 1-0 defensive grinds to 5-3 thrillers and marathon sudden-death shootouts, alongside Sporting Relegation Pyramid Floor protection.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#4B5563] pt-2 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Pyramid Floor Dismissal &amp; Scoring Range</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* v1.9 Historical Archive Bento Box */}
        {activeSection === 'updates' && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm transition-all relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563] bg-[#F5F4F0] border border-[#E6E3DC] px-2.5 py-1 rounded-xl">
                  v1.9 Archive
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#18191F] tracking-tight">
                  Editor, Design, Mods &amp; World Cup
                </h2>
              </div>
              <span className="text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                <i className="fa-solid fa-clock-rotate-left text-[#9A9890]"></i>
                <span>{isDe ? 'Archivierte Version' : 'Archived Milestone'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center text-xs mb-2.5 border border-sky-200">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </div>
                  <h3 className="text-xs font-bold text-[#18191F] mb-1">
                    Roster &amp; Club Editor
                  </h3>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed mb-2.5">
                    {isDe
                      ? 'Vollständiger In-Game-Editor für alle Vereine: Passe Teamnamen, OVR-Stärke, Stadionkapazität und Finanzen direkt an und exportiere/importiere JSON-Patches.'
                      : 'Live roster & database editor: Customize any club name, OVR rating, stadium capacity, and transfer budget with instant JSON patch export & import.'}
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#4B5563] pt-2 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Live DB &amp; JSON Patches</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs mb-2.5 border border-indigo-200">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <h3 className="text-xs font-bold text-[#18191F] mb-1">
                    {isDe ? 'Editorial Light Design' : 'Broadcast UI & Editorial Theme'}
                  </h3>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed mb-2.5">
                    {isDe
                      ? 'Helles Editorial-Interface, echte TV-Broadcast-Grafiken mit Senderlogos (BBC, ESPN, Sky), verfeinerte Typografie und mobil-optimierte Modals.'
                      : 'Warm daylight editorial interface, authentic TV broadcast scoreboards (BBC, ESPN, Sky), refined typography, and responsive mobile modals.'}
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#4B5563] pt-2 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Broadcast UI &amp; Daylight Theme</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs mb-2.5 border border-emerald-200">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h3 className="text-xs font-bold text-[#18191F] mb-1">
                    CR27 Community Mods
                  </h3>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed mb-2.5">
                    {isDe
                      ? '1-Klick-Aktivierung des Community-Datenpakets mit 1.202 authentischen Vereinen, Wappen und Stadien. Volle Unterstützung für eigene JSON-Dateien und Patches.'
                      : '1-click toggle for extended community database with 1,202 authentic clubs, crest artwork, and venues. Full custom JSON patch import and club lore support.'}
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#4B5563] pt-2 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span className="tabular-nums">{isDe ? '1.202 Vereine & Wappen' : '1,202 Clubs & Crests'}</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs mb-2.5 border border-amber-200">
                    <i className="fa-solid fa-earth-americas"></i>
                  </div>
                  <h3 className="text-xs font-bold text-[#18191F] mb-1">
                    {isDe ? 'World Cup & Turniere' : 'World Cups & Tournaments'}
                  </h3>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed mb-2.5">
                    {isDe
                      ? '4-Jahres-Turnierzyklus mit Host-Nations (2026 USA, 2030 Spanien, 2034 Japan, 2038 Deutschland, 2042 Brasilien). Steuere Kaderstrategie, Cheftrainer und Verbandsinvestitionen.'
                      : '4-year tournament cycle featuring host nation spotlights (2026 USA, 2030 Spain, 2034 Japan, 2038 Germany, 2042 Brazil). Take charge with squad directions, coach hiring, and federation investments.'}
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#4B5563] pt-2 border-t border-[#E6E3DC] flex items-center gap-1.5">
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>Group Stage &amp; Knockout Finals</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 35-Year Career Objective */}
        {(activeSection === 'all' || activeSection === 'basics') && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center text-lg border border-sky-200">
                <i className="fa-solid fa-trophy"></i>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-1">
                  {isDe ? 'Karriereziel' : 'Career Objective'}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#18191F] tracking-tight">
                  {isDe ? 'Das 35-Jahre-Karriereziel in weltweiten Ligen' : 'The 35-Year Career Objective Across Global Nations'}
                </h3>
              </div>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-4">
              {isDe
                ? `Du hast genau 35 Saisons Zeit, um dir einen unvergesslichen Namen in der Weltfussball-Geschichte zu machen! Wähle aus ${tiers.totalNations} offiziellen Fussball-Nationen, darunter riesige Ligasysteme in Deutschland (${tiers.ger} Ligen), England (${tiers.eng} Ligen), Italien (${tiers.ita} Ligen), Spanien (${tiers.esp} Ligen), Frankreich (${tiers.fra} Ligen) und den USA (${tiers.usa} Ligen), bis hin zu weltweiten Ligen in Japan, Brasilien, Argentinien und Australien.`
                : `You have exactly 35 seasons to build an unassailable legacy in world football! Choose from ${tiers.totalNations} active football nations featuring massive pyramids in Germany (${tiers.ger} Leagues), England (${tiers.eng} Leagues), Italy (${tiers.ita} Leagues), Spain (${tiers.esp} Leagues), France (${tiers.fra} Leagues), and the USA (${tiers.usa} Leagues), alongside diverse global leagues like Japan, Brazil, Argentina, and Australia.`}
            </p>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs">
              <span className="font-bold text-amber-900 block mb-1">
                {isDe ? 'Nationale & Internationale Pokaljagd:' : 'Domestic & International Cup Glory:'}
              </span>
              <p className="text-[#4B5563] leading-relaxed">
                {isDe
                  ? 'Kämpfe um nationale Meisterschaften, prestigeträchtige Pokalwettbewerbe (National Cup, Regional Cup) und internationale Kontinental-Trophäen (Elite Cup, Euro Cup, Euro Challenge Cup, Americas Elite Cup & North American Elite Cup)!'
                  : 'Compete for domestic league championships, prestigious national cup runs (National Cup, Regional Cup), and continental silverware (Elite Cup, Euro Cup, Euro Challenge Cup, Americas Elite Cup & North American Elite Cup)!'}
              </p>
            </div>
          </div>
        )}

        {/* How to Play & Win (Core Loop) */}
        {(activeSection === 'all' || activeSection === 'basics') && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg border border-emerald-200">
                <i className="fa-solid fa-gamepad"></i>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                  Instruction Manual
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#18191F] tracking-tight">
                  How to Play &amp; Win
                </h3>
              </div>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-6">
              Success requires balancing on-pitch results with boardroom finances. If you focus only on buying star players without upgrading your stadium or securing sponsors, you will go bankrupt. If you focus only on hoarding money, your squad will decay, and you will be relegated and sacked. Follow this core loop to survive your 35-season career:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 relative overflow-hidden">
                <span className="text-sky-700 font-black text-2xl mb-2 block tabular-nums">01</span>
                <strong className="text-[#18191F] block mb-1.5 text-sm">Align the Club</strong>
                <p className="text-[#4B5563] leading-relaxed">
                  Select your <b>Club DNA (Tactic)</b> and hire a <b>Head Coach</b> whose preferred style matches it to gain a +2 OVR system synergy. Mismatches cause immediate squad mutinies.
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 relative overflow-hidden">
                <span className="text-amber-700 font-black text-2xl mb-2 block tabular-nums">02</span>
                <strong className="text-[#18191F] block mb-1.5 text-sm">Build the Squad</strong>
                <p className="text-[#4B5563] leading-relaxed">
                  Recruit wonderkids from your Academy, sign transfers, and pitch commercial sponsors to fund your wage bill. Keep your squad size manageable (18-50 players).
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 relative overflow-hidden">
                <span className="text-purple-700 font-black text-2xl mb-2 block tabular-nums">03</span>
                <strong className="text-[#18191F] block mb-1.5 text-sm">Scale Infrastructure</strong>
                <p className="text-[#4B5563] leading-relaxed">
                  Expand your <b>Stadium</b> to meet league requirements and boost Matchday Revenue. Upgrade <b>Medical</b> and <b>Academy</b> facilities to attract elite coaches.
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4.5 relative overflow-hidden">
                <span className="text-rose-700 font-black text-2xl mb-2 block tabular-nums">04</span>
                <strong className="text-[#18191F] block mb-1.5 text-sm">Survive &amp; Adapt</strong>
                <p className="text-[#4B5563] leading-relaxed">
                  Simulate the season. <b>Never finish 3 consecutive seasons in debt</b>, or you face insolvency. Meet board targets to earn Immunity Shields, and adapt your tactics when they go stale.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Director Points & Reputation */}
        {(activeSection === 'all' || activeSection === 'basics') && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg border border-amber-200">
                <i className="fa-solid fa-crown"></i>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                  {isDe ? 'Progressionssystem' : 'Progression System'}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#18191F] tracking-tight">
                  {isDe ? 'Direktor-Punkte & Ansehen-System' : 'Director Points & Reputation System'}
                </h3>
              </div>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-4">
              {isDe
                ? 'Jeder Meisterschaftstitel, Aufstieg, Pokalsieg und gelöste Krisen bringen dir wertvolle Direktor-Punkte. Deine Direktor-Reputation ist bis 100 gedeckelt und bestimmt zusammen mit dem Vereins-Ansehen (1 bis 100), welche europäischen Top-Klubs dir Verträge anbieten.'
                : 'Every league title, promotion, cup victory, and resolved board crisis earns you valuable Director Points. Your Director Reputation is capped at 100 and works alongside Club Reputation (1 to 100) to unlock job offers from world-class clubs.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] p-4 rounded-2xl">
                <span className="font-bold text-amber-800 block mb-1">
                  {isDe ? 'Jobangebote von Top-Klubs' : 'Elite Job Offers'}
                </span>
                <span className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? 'Höhere Reputation schaltet lukrative Angebote von europäischen Schwergewichten frei.'
                    : 'Higher reputation unlocks lucrative job offers from European giants.'}
                </span>
              </div>
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] p-4 rounded-2xl">
                <span className="font-bold text-[#18191F] block mb-1">
                  {isDe ? 'Vorstands-Puffer & Ultimatum-Schutz' : 'Board Trust & Crisis Cushion'}
                </span>
                <span className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? 'Erfahrene Legenden geniessen bei Vorstand und Fans höhere Toleranz bei Schwächephasen.'
                    : 'Proved legendary directors gain higher board tolerance during temporary slumps.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tactics & Match Engine */}
        {(activeSection === 'all' || activeSection === 'tactics') && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg border border-emerald-200">
                <i className="fa-solid fa-chess-board"></i>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                  {isDe ? 'Simulations-Engine' : 'Simulation Engine'}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#18191F] tracking-tight">
                  {isDe ? 'Taktik & Match-Engine' : 'Tactics & Match Engine'}
                </h3>
              </div>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-4">
              {isDe
                ? 'Die Ergebnisse basieren auf dem Kader-GES (Gesamtwertung) deines Teams im Vergleich zum Ligaschnitt. Deine gewählte Taktik verändert Tore und Gegentore gezielt:'
                : "Match outcomes are simulated based on your squad's Overall Rating (OVR) relative to your league's average strength. Your tactical style directly modifies offensive and defensive outputs:"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
                <div className="font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-bolt"></i> Gegenpressing
                </div>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? '+15% Tore erzielt, +10% Gegentore. Hohes Tempo & Risiko.'
                    : '+15% Goals Scored, +10% Goals Conceded. High tempo & chaos.'}
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
                <div className="font-bold text-sky-700 mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-arrows-spin"></i> Tiki-Taka
                </div>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? '+10% Tore erzielt, -5% Gegentore. Kontrollierter Ballbesitz.'
                    : '+10% Goals Scored, -5% Goals Conceded. Controlled possession.'}
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
                <div className="font-bold text-purple-700 mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-fire"></i> Total Football
                </div>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? '+20% Tore erzielt, +15% Gegentore. Maximale Offensive.'
                    : '+20% Goals Scored, +15% Goals Conceded. Maximum firepower.'}
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
                <div className="font-bold text-amber-700 mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved"></i> Park the Bus (Catenaccio)
                </div>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? '-15% Tore erzielt, -25% Gegentore. Defensive Abwehrfestung.'
                    : '-15% Goals Scored, -25% Goals Conceded. Defensive lockdown.'}
                </p>
              </div>
            </div>

            {/* Tactical Meta Duels Note */}
            <div className="mt-4 bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs">
              <span className="font-bold text-sky-900 block mb-1">
                {isDe ? 'Liga-Meta & Pokal-Duelle:' : 'League Meta & Cup Run Duels:'}
              </span>
              <p className="text-[#4B5563] leading-relaxed">
                {isDe
                  ? 'Gegenpressing schlägt Tiki-Taka, Direct Counter schlägt Gegenpressing, Catenaccio kontert Direct Counter und Tiki-Taka knackt Catenaccio. Das Auskontern der gegnerischen Ausrichtung sichert einen +6 GES Vorteil!'
                  : 'Gegenpressing beats Tiki-Taka, Direct Counter beats Gegenpress, Catenaccio blocks Direct Counter, and Tiki-Taka dismantles Catenaccio. Countering the opponent grants a crucial +6 OVR advantage!'}
              </p>
            </div>
          </div>
        )}

        {/* Director Archetypes */}
        {(activeSection === 'all' || activeSection === 'basics') && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center text-lg border border-sky-200">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-1">
                  {isDe ? 'Spezialisierung' : 'Specialization'}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#18191F] tracking-tight">
                  {isDe ? 'Direktor-Archetypen' : 'Director Archetypes'}
                </h3>
              </div>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-4">
              {isDe
                ? 'Zu Beginn deiner Karriere wählst du einen Archetypen, der deinen Hintergrund und deine Spezialisierung als Sportdirektor definiert:'
                : 'At the start of your career, you select an archetype that defines your background and specialization as a Sporting Director:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E6E3DC]">
                <strong className="text-[#18191F] block mb-1 text-sm">
                  👔 {isDe ? 'Standard-Direktor' : 'Standard Director'}
                </strong>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? 'Ein ausgewogener Ansatz. Keine Boni oder Strafen. Du beginnst als unbeschriebenes Blatt.'
                    : 'A balanced approach. No special bonuses or penalties. You start as a blank slate.'}
                </p>
              </div>

              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <strong className="text-amber-900 block mb-1 text-sm">
                  ⭐ {isDe ? 'Vereinslegende' : 'Club Legend'}
                </strong>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? 'Als ehemaliger Starspieler genießt du massiven Rückhalt. Startet mit leicht erhöhtem Ruf und +5 Team-Moral.'
                    : 'As a former star player, you command dressing room authority. Starts with boosted reputation and +5 Team Morale.'}
                </p>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                <strong className="text-emerald-900 block mb-1 text-sm">
                  📈 {isDe ? 'Finanz-Guru' : 'Finance Guru'}
                </strong>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? 'Wirtschaftliche Weitsicht. Startet mit +25% Startbudget und einem +20% Verhandlungsbonus auf alle Sponsorenverträge.'
                    : 'Financial acumen. Starts with +25% Starting Budget and a permanent +20% bonus on sponsor deal valuations.'}
                </p>
              </div>

              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200">
                <strong className="text-purple-900 block mb-1 text-sm">
                  🔍 {isDe ? 'NLZ-Architekt (Talent-Scout)' : 'Academy Architect (Talent Scout)'}
                </strong>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? 'Meister der Nachwuchsförderung. Erhält 35% Rabatt auf alle NLZ-Ausbauten und startet mit Stufe 2.'
                    : 'Master of youth development. Enjoys 35% discount on all Academy facility upgrade costs and starts with Level 2.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* The Head Coach Importance */}
        {(activeSection === 'all' || activeSection === 'basics' || activeSection === 'tactics') && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center text-lg border border-rose-200">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-1">
                  Critical Personnel
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#18191F] tracking-tight">
                  The Power of the Head Coach
                </h3>
              </div>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-4">
              The Head Coach is the most critical asset in your club. They are not just a static stat boost; they are the operational bottleneck of your entire footballing strategy. Hiring the wrong manager can destroy years of club development.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
                <strong className="text-[#18191F] block mb-1 text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-seedling text-emerald-600"></i> Academy Gatekeepers
                </strong>
                <p className="text-[#4B5563] leading-relaxed">
                  Wonderkids are useless if the manager refuses to play them. "Pragmatists" and "Disciplinarians" will actively halve the OVR impact of any youth prospect promoted to the senior squad.
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
                <strong className="text-[#18191F] block mb-1 text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-arrows-split-up-and-left text-rose-600"></i> Tactical Mutinies
                </strong>
                <p className="text-[#4B5563] leading-relaxed">
                  Your coach's style must align with the Club DNA. Hiring a stubborn "Dogmatist" with a mismatched system will trigger an immediate Dressing Room Mutiny (-25 Morale, -5 OVR)!
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
                <strong className="text-[#18191F] block mb-1 text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-handshake text-sky-600"></i> Transfer Modifiers
                </strong>
                <p className="text-[#4B5563] leading-relaxed">
                  Coaches directly influence the transfer market. A "Talent Magnet" increases the success rate of marquee signings, while a "Cursed" manager will cause deals to flop.
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
                <strong className="text-[#18191F] block mb-1 text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-building-columns text-amber-600"></i> Identity Rejection
                </strong>
                <p className="text-[#4B5563] leading-relaxed">
                  The board enforces your Macro Club Identity. If you operate a "Galactico Enterprise" but hire a gritty "Pragmatic Grinder", the board will intervene and tank your Trust Score.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Infrastructure & Morale */}
        {(activeSection === 'all' || activeSection === 'economy') && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg border border-emerald-200">
                <i className="fa-solid fa-city"></i>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                  {isDe ? 'Infrastruktur' : 'Facilities & Chemistry'}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#18191F] tracking-tight">
                  {isDe ? 'Vereinsinfrastruktur & Team-Moral' : 'Club Infrastructure & Squad Morale'}
                </h3>
              </div>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-4">
              {isDe
                ? 'Der Bau von Vereinsinfrastruktur bringt mächtige Langzeitboni, erfordert jedoch diszipliniertes Kostenmanagement:'
                : 'Building club infrastructure provides powerful long-term bonuses but requires disciplined overhead management:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4">
                <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-graduation-cap text-emerald-700"></i> {isDe ? 'Jugendakademie (Stufe 1–5)' : 'Youth Academy (Level 1–5)'}
                </div>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? 'Fördert Jahrhundert-, Top- und Lokaltalente. Ab Stufe 3 gibt es +1 NLZ-GES beim Profivertrag, ab Stufe 4 eine 15% Golden-Boy-Chance und auf Stufe 5 eine 25% La-Masia-Verkaufsdividende.'
                    : 'Produces Generational, Top, and Local prospects. Unlock +1 NLZ OVR graduation boosts at Level 3, 15% Golden Boy rolls at Level 4, and a 25% La Masia sell-on dividend at Level 5.'}
                </p>
              </div>

              <div className="bg-pink-50/50 border border-pink-200 rounded-2xl p-4">
                <div className="font-bold text-pink-900 mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-heart-pulse text-pink-700"></i> {isDe ? 'Medizinabteilung (Stufe 1–5)' : 'Medical Facility (Level 1–5)'}
                </div>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? 'Schützt deinen Kader vor saisonalem Verschleiß und Altersverfall: Stufe 4 bietet 80% Schutz, Stufe 5 gewährt 100% Immunität gegen Kader-Verfall in der Sommerpause.'
                    : 'Protects your squad from off-season wear-and-tear decay: Level 4 provides 80% protection, while Level 5 grants 100% wear-and-tear decay immunity.'}
                </p>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4">
                <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-users text-indigo-700"></i> {isDe ? 'Kader-Moral & Egos' : 'Squad Morale & Egos'}
                </div>
                <p className="text-[#4B5563] leading-relaxed">
                  {isDe
                    ? 'Superstars (>85 GES) erfordern Balance. Fällt die Moral unter 40%, verweigern neue Stars Wechsel zu deinem Klub.'
                    : 'Managing superstars (>85 OVR) creates friction. Below 40% morale, marquee transfer targets will decline talks.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Financial Economy, Scaling & Debt Rules */}
        {(activeSection === 'all' || activeSection === 'economy' || activeSection === 'regulations') && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg border border-amber-200">
                <i className="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                  {isDe ? 'Finanzkontrolle & FFP' : 'Financial Controls & FFP'}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#18191F] tracking-tight">
                  {isDe ? 'Finanzen, Gehaltsgefüge & Schuldenregeln' : 'Financial Economy, Wages & Debt Insolvency'}
                </h3>
              </div>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-4">
              {isDe
                ? 'Das Wirtschaftssystem skaliert präzise über alle Ligen. Wer in Unterligen über seine Verhältnisse lebt, riskiert Verbandsstrafen:'
                : 'The financial engine scales strictly across all divisions. Overspending triggers regulatory intervention:'}
            </p>

            <div className="space-y-3 text-xs">
              <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4">
                <div className="font-bold text-[#18191F] mb-1.5 flex items-center gap-2">
                  <i className="fa-solid fa-sack-dollar text-emerald-600"></i>
                  <span>{isDe ? 'Einnahmenquellen' : 'Revenue Channels'}</span>
                </div>
                <ul className="text-[#4B5563] space-y-1 pl-1">
                  <li>
                    • <strong>{isDe ? 'Spieltag' : 'Matchday'}:</strong>{' '}
                    {isDe ? 'Zuschauer × Ticketpreis × 17 Heimspiele.' : 'Attendance × Ticket Price × 17 Home Fixtures.'}
                  </li>
                  <li>
                    • <strong>{isDe ? 'TV & Platzierung' : 'TV & Position'}:</strong>{' '}
                    {isDe ? 'Skaliert dynamisch basierend auf deiner Liga.' : 'Scales dynamically by League Tier.'}
                  </li>
                  <li>
                    • <strong>{isDe ? 'Europapokal & Sponsoren' : 'Continental & Sponsors'}:</strong>{' '}
                    {isDe ? 'Preise für Elite Cup / Euro Cup sowie Handgelder für Pitch-Ziele.' : 'Prize money from Elite Cup / Euro Cup plus commercial pitches.'}
                  </li>
                </ul>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <div className="font-bold text-rose-900 mb-1.5 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-rose-600"></i>
                  <span>{isDe ? 'Schulden & 3-Jahre-Insolvenzregel' : 'Debt & 3-Year Insolvency Rule'}</span>
                </div>
                <p className="text-[#4B5563] leading-relaxed mb-2">
                  {isDe
                    ? 'Saisonabschluss im Minus führt zu 5% Zinsen und automatischen Liga-Punktabzügen (-3 Pkt. im 1. Schuldenjahr, -6 Pkt. im 2., -9 Pkt. im 3. Schuldenjahr).'
                    : 'Finishing in debt triggers 5% interest and automatic point deductions (-3 Pts in 1st debt year, -6 Pts in 2nd, -9 Pts in 3rd).'}
                </p>
                <div className="text-[11px] text-rose-800 font-bold">
                  {isDe
                    ? 'Nach 3 aufeinanderfolgenden Schuldenjahren droht die Insolvenz: Notverkäufe oder Zwangsabstieg! (Defensive / Catenaccio-Taktiken verlängern diese Frist auf 4 Jahre).'
                    : 'Finishing 3 consecutive years in the red forces an Insolvency Crisis: emergency fire sale or total demotion! (Defensive / Catenaccio tactics extend the 3-year insolvency grace period to 4 years).'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regulations: Stadiums & Reserve Teams */}
        {(activeSection === 'all' || activeSection === 'regulations') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-sm mb-3 border border-purple-200">
                <i className="fa-solid fa-building"></i>
              </div>
              <h3 className="text-base font-extrabold text-[#18191F] mb-2">
                {isDe ? 'Stadion-Standards (ab League 3)' : 'Stadium Standards (League 3+)'}
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                {isDe
                  ? 'Offizielle Verbandskriterien: League 3 (10.000 Plätze), League 2 (15.000 Plätze), League 1 (25.000 Plätze). Wer im Untermaß spielt, zahlt Ausweichmiete und verliert Heimvorteil.'
                  : 'Official criteria: League 3 (10,000 seats), League 2 (15,000 seats), League 1 (25,000 seats). Undersized venues incur lease fees and crowd pressure handicaps.'}
              </p>
              <div className="text-[11px] text-purple-800 font-bold pt-2 border-t border-[#E6E3DC]">
                {isDe ? 'Rechtzeitiger Ausbau spart Millionen' : 'Expand facilities early to retain gate receipts'}
              </div>
            </div>

            <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm mb-3 border border-amber-200">
                <i className="fa-solid fa-ban"></i>
              </div>
              <h3 className="text-base font-extrabold text-[#18191F] mb-2">
                {isDe ? "Reserve-Teams ('II')" : "Reserve Sides ('II' Teams)"}
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                {isDe
                  ? "Zweitvertretungen (z.B. FC Bavaria II) dürfen nicht in die 1. Liga aufsteigen, sind von nationalen und europäischen Pokalen ausgeschlossen und haben eine Fan-Deckelung auf 900 Zuschauer."
                  : 'Reserve clubs are barred from top-flight promotion, ineligible for cup competitions, and feature capped fanbases at max 900 supporters.'}
              </p>
              <div className="text-[11px] text-amber-800 font-bold pt-2 border-t border-[#E6E3DC]">
                {isDe ? 'Erhalten dafür Mutterverein-Zuschüsse' : 'Receive automatic parent club operating grants'}
              </div>
            </div>
          </div>
        )}

        {/* Endless Mode & Highscores */}
        {(activeSection === 'all' || activeSection === 'basics') && (
          <div className="bg-white border border-[#E6E3DC] rounded-[28px] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <i className="fa-solid fa-infinity text-sky-700"></i>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                  {isDe ? 'Post-Karriere' : 'Post-Career'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[#18191F] mb-1.5">
                {isDe ? 'Endlosmodus & Weltweite Rangliste' : 'Endless Mode & Global Leaderboard'}
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                {isDe
                  ? 'Nach 35 Saisons wird dein Punktestand im weltweiten Leaderboard verewigt. Danach kannst du nahtlos im Endlosmodus weiterspielen.'
                  : 'After 35 seasons, your career score is officially etched into the global leaderboard. You can continue indefinitely in Endless Mode.'}
              </p>
            </div>
            <div className="bg-[#FAF9F6] px-5 py-3 rounded-2xl border border-[#E6E3DC] text-center shrink-0">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-0.5">
                {isDe ? 'Max. möglich' : 'Max Possible'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#18191F] tabular-nums">~584.500</span>
            </div>
          </div>
        )}
      </div>

      {/* Career Launch Action */}
      {onStartCareer && (
        <div className="text-center mt-12 sm:mt-16">
          <button
            onClick={onStartCareer}
            className="inline-flex items-center gap-3 bg-[#18191F] hover:bg-[#2A2C35] text-white font-bold text-sm sm:text-base py-3.5 px-8 rounded-2xl transition active:scale-95 shadow-sm cursor-pointer group"
          >
            <span>
              {hasActiveGame
                ? isDe
                  ? 'Zurück zum Verein'
                  : 'Return to Club Workspace'
                : isDe
                ? 'Karriere starten'
                : 'Start Your Career'}
            </span>
            <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      )}

      {showDbModal && clubsDb && clubsDb.length > 0 && (
        <DatabaseModal
          clubs={clubsDb}
          lang={lang}
          onClose={() => setShowDbModal(false)}
          onUpdateClubsDb={onUpdateClubsDb}
        />
      )}
    </div>
  );
};
