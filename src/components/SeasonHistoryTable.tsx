import React, { useEffect, useRef, useState } from 'react';
import { Club, GameState, Language, TrophiesObj } from '../types';
import { getContinentalCupNames, getRegion } from '../utils/regionHelpers';
import {
  getLeagueInfo,
  getDomesticCupInfo,
  getMaxTier,
  formatNum,
  getClubFlag,
  getClubHistoricContext,
} from '../data/gameConstants';
import { ALL_CLUBS } from '../data/clubsData';
import { getEffectiveStadiumName } from '../engine/liveSimVisualEngine';
import { resolveClubStatureLabel } from '../engine/campusAndBowlGeometry';
import { ClubLogo } from './ClubLogo';
import { resolveHistoryClubDisplay } from '../utils/modSafeguards';
import { CompetitionKind } from '../utils/competitionLogos';
import { CompetitionLogo } from './CompetitionLogo';
import { computeTrophyCollection } from '../utils/trophyCollection';

interface SeasonHistoryTableProps {
  state: GameState;
  lang: Language;
  clubsDb?: Club[];
  isModActive?: boolean;
  onOpenWorldCupHistory?: () => void;
  onOpenDossier?: () => void;
  onOpenTrophyCabinet?: () => void;
  onOpenTable?: () => void;
}

export const SeasonHistoryTable: React.FC<SeasonHistoryTableProps> = ({
  state,
  lang,
  clubsDb,
  isModActive: isModActiveProp,
  onOpenWorldCupHistory,
  onOpenDossier,
  onOpenTrophyCabinet,
  onOpenTable,
}) => {
  const isDe = lang === 'de';
  const t = (en: string, ..._rest: any[]) => en;
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);
  const [subView, setSubView] = useState<'context' | 'trophies'>('context');

  const isModActive =
    isModActiveProp !== undefined
      ? isModActiveProp
      : typeof window !== 'undefined' && localStorage.getItem('fms_real_mod_active') === 'true';

  useEffect(() => {
    if (state.isNewSeasonRender && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state?.isNewSeasonRender, state?.history?.length]);

  const { cl: clName, el: elName, ecl: eclName } = getContinentalCupNames(state.club.country || 'GER');
  const nationalCupName = getDomesticCupInfo(
    state.club.country || 'GER',
    1,
    state.club.name,
    state.club.id
  ).name;
  const regionalCupName =
    getDomesticCupInfo(
      state.club.country || 'GER',
      4,
      state.club.name,
      state.club.id
    ).name || 'Regional Cup';
  const topFlightName = getLeagueInfo(1, state.club.country || 'GER').name;

  // Compute Trophy Cabinet strip counts across career history (strictly separating top-flight vs lower-tier silverware)
  const trophyCounts = React.useMemo(
    () => computeTrophyCollection(state.history, state.supercupHistory),
    [state.history, state.supercupHistory]
  );

  const totalTrophies = Math.max(trophyCounts.total, state.totals?.trophies || 0);
  const domesticTrophiesCount = trophyCounts.domesticTotal;
  const intlTrophiesCount = trophyCounts.internationalTotal;
  const showLowerTierHonours =
    (state.club.tier || 1) > 1 ||
    trophyCounts.lowerLeague > 0 ||
    trophyCounts.regionalCup > 0;

  const clubCountry = state.club.country || 'GER';
  const currentClubHeaderResolved = resolveHistoryClubDisplay(
    {
      id: state.club.id,
      name: state.club.name || 'Club',
      country: clubCountry,
      color: state.club.color,
      logo: state.club.logo,
      fallbackLogo: state.club.fallbackLogo,
    },
    isModActive,
    clubsDb
  );
  const defaultDbClub = ALL_CLUBS.find(
    (c) =>
      c.id === (currentClubHeaderResolved.id ?? state.club.id) ||
      String(c.id) === String(currentClubHeaderResolved.id ?? state.club.id)
  );
  const liveDbClub = isModActive
    ? clubsDb?.find((c) => c.id === state.club.id || String(c.id) === String(state.club.id)) ||
      clubsDb?.find((c) => c.name.toLowerCase().trim() === (state.club.name || '').toLowerCase().trim()) ||
      defaultDbClub
    : defaultDbClub;

  const resolvedClubName = currentClubHeaderResolved.name || state.club.name || 'Club';
  const resolvedFlag = getClubFlag({ name: resolvedClubName, id: state.club.id, country: clubCountry });
  const currentLeagueName = getLeagueInfo(state.club.tier || 1, clubCountry)?.name || `Tier ${state.club.tier || 1}`;
  const currentStadiumName = getEffectiveStadiumName(state.club, state.stadiumNamingRights);
  const statureLabel = resolveClubStatureLabel(state.club.tier || 1, state.club.baseOvr || 65, totalTrophies);

  let clubHistoryBlurb =
    (isModActive ? liveDbClub?.narrative : undefined) ||
    state.club.historicContext ||
    state.club.narrative ||
    getClubHistoricContext(resolvedClubName, state.club.tier || 1, isDe, clubCountry);
  if (
    clubHistoryBlurb &&
    !isDe &&
    /\b(ziel|ziele|zielen|saison|vorstand|traditionsverein|bundesligist|zweitligist|drittligist|rekordmeister|fuehrend|oberhaus)\b/i.test(
      clubHistoryBlurb
    )
  ) {
    clubHistoryBlurb = getClubHistoricContext(resolvedClubName, state.club.tier || 1, false, clubCountry);
  }
  if (!clubHistoryBlurb) {
    clubHistoryBlurb = `Established contender in ${currentLeagueName}, building a modern footballing identity at ${currentStadiumName}.`;
  }

  const renderTrophyIcons = (
    trophiesObj?: TrophiesObj,
    countryContext?: string,
    clubName?: string,
    clubId?: number,
    seasonTier?: number
  ) => {
    if (!trophiesObj) return null;
    const country = countryContext || state.club.country || 'GER';
    const { cl: clTitle, el: elTitle, ecl: eclTitle } = getContinentalCupNames(country);

    const icons: React.ReactNode[] = [];
    const wcCount = Math.min(1, trophiesObj.wc || 0);
    for (let i = 0; i < wcCount; i++) {
      icons.push(
        <button
          key={`wc-${i}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenWorldCupHistory?.();
          }}
          className="cursor-pointer hover:scale-125 transition-transform"
          title="World Cup Champion (Click to view World Cup Archive)"
        >
          <i className="fas fa-trophy text-amber-500 text-[11px]" />
        </button>
      );
    }
    for (let i = 0; i < (trophiesObj.cwc || 0); i++) {
      icons.push(<i key={`cwc-${i}`} className="fas fa-globe text-amber-600 text-[10px]" title="Club World Cup" />);
    }
    for (let i = 0; i < (trophiesObj.cl || 0); i++) {
      icons.push(<i key={`cl-${i}`} className="fas fa-star text-amber-500 text-[10px]" title={clTitle} />);
    }
    for (let i = 0; i < (trophiesObj.el || 0); i++) {
      icons.push(
        <i
          key={`el-${i}`}
          className={`fas ${
            getRegion(country) === 'CONMEBOL' || getRegion(country) === 'CONCACAF'
              ? 'fa-globe-americas'
              : getRegion(country) === 'AFC'
              ? 'fa-globe-asia'
              : 'fa-globe-europe'
          } text-orange-600 text-[10px]`}
          title={elTitle}
        />
      );
    }
    for (let i = 0; i < (trophiesObj.ecl || 0); i++) {
      icons.push(
        <i
          key={`ecl-${i}`}
          className={`fas ${
            getRegion(country) === 'CONMEBOL' || getRegion(country) === 'CONCACAF'
              ? 'fa-earth-americas'
              : getRegion(country) === 'AFC'
              ? 'fa-earth-asia'
              : 'fa-earth-europe'
          } text-emerald-600 text-[10px]`}
          title={eclTitle}
        />
      );
    }
    for (let i = 0; i < (trophiesObj.bl || 0); i++) {
      icons.push(<i key={`bl-${i}`} className="fas fa-trophy text-amber-500 text-[10px]" title={getLeagueInfo(1, country).name} />);
    }
    for (let i = 0; i < (trophiesObj.dfb || 0); i++) {
      icons.push(<i key={`dfb-${i}`} className="fas fa-award text-amber-600 text-[10px]" title={getDomesticCupInfo(country, 1, clubName, clubId).name} />);
    }
    for (let i = 0; i < (trophiesObj.efl || 0); i++) {
      icons.push(<i key={`efl-${i}`} className="fas fa-medal text-sky-600 text-[10px]" title="League Cup" />);
    }
    for (let i = 0; i < (trophiesObj.lower || 0); i++) {
      const lowerTitle =
        seasonTier && seasonTier > 1
          ? `${getLeagueInfo(seasonTier, country).name} Title`
          : 'Lower League Title';
      icons.push(<i key={`lower-${i}`} className="fas fa-trophy text-slate-600 text-[10px]" title={lowerTitle} />);
    }
    for (let i = 0; i < (trophiesObj.reg || 0); i++) {
      icons.push(<i key={`reg-${i}`} className="fas fa-shield-halved text-amber-700 text-[10px]" title={getDomesticCupInfo(country, 4, clubName, clubId).name || 'Regional Cup'} />);
    }
    const standardTrophyKeys = new Set(['wc', 'cwc', 'cl', 'el', 'ecl', 'bl', 'dfb', 'efl', 'lower', 'reg']);
    for (const [k, rawVal] of Object.entries(trophiesObj)) {
      if (standardTrophyKeys.has(k)) continue;
      const count = Number(rawVal) || 0;
      for (let i = 0; i < count; i++) {
        icons.push(<i key={`custom-${k}-${i}`} className="fas fa-trophy text-amber-500 text-[10px]" title={k.toUpperCase()} />);
      }
    }

    const hasBl = (trophiesObj.bl || 0) > 0;
    const hasDfb = (trophiesObj.dfb || 0) > 0;
    const hasCl = (trophiesObj.cl || 0) > 0;
    const hasEl = (trophiesObj.el || 0) > 0;
    const hasEcl = (trophiesObj.ecl || 0) > 0;
    const hasCwc = (trophiesObj.cwc || 0) > 0;

    if (hasBl && hasDfb && hasCl && hasCwc) {
      icons.push(
        <span key="quadruple" className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-100 text-purple-800 border border-purple-300 uppercase tracking-wider whitespace-nowrap">
          Quadruple
        </span>
      );
    } else if (hasBl && hasDfb && hasCl) {
      icons.push(
        <span key="triple" className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider whitespace-nowrap">
          Triple
        </span>
      );
    } else if (hasBl && hasDfb && hasEl) {
      icons.push(
        <span key="kleines-triple" className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-orange-100 text-orange-900 border border-orange-300 uppercase tracking-wider whitespace-nowrap">
          Triple
        </span>
      );
    } else if (hasBl && hasDfb && hasEcl) {
      icons.push(
        <span key="ecl-triple" className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider whitespace-nowrap">
          Mini Triple
        </span>
      );
    } else if (hasBl && hasDfb) {
      icons.push(
        <span key="double" className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-sky-100 text-sky-900 border border-sky-300 uppercase tracking-wider whitespace-nowrap">
          Double
        </span>
      );
    }

    return <div className="flex items-center trophy-stack ml-1">{icons}</div>;
  };

  const hasWorldCupArchive = Boolean(
    (state.worldCupTrophies || 0) > 0 ||
      (state.internationalTrophies || 0) > 0 ||
      (state.worldCupCampaigns || []).length > 0 ||
      (state.history || []).some((h) => (h.trophiesThisYear?.wc || 0) > 0)
  );

  return (
    <div className="editorial-card flex flex-col overflow-hidden flex-1 lg:min-h-[535px] lg:max-h-[612px] w-full relative">
      {/* Editorial Top Header */}
      <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#E6E3DC] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div>
          <h3 className="text-sm font-extrabold text-[#18191F] tracking-tight">
            Season &amp; Club History
          </h3>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {hasWorldCupArchive && onOpenWorldCupHistory && (
            <button
              type="button"
              onClick={onOpenWorldCupHistory}
              className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold transition cursor-pointer"
            >
              WC Archive
            </button>
          )}
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSubView('context')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer border ${
                subView === 'context'
                  ? 'bg-[#18191F] text-white border-[#18191F]'
                  : 'bg-[#F6F5F1] text-[#4B5563] border-[#E6E3DC] hover:bg-[#EAE7E0]'
              }`}
            >
              Club Context
            </button>
            <button
              type="button"
              onClick={() => setSubView((v) => (v === 'trophies' ? 'context' : 'trophies'))}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer border tabular-nums ${
                subView === 'trophies'
                  ? 'bg-[#18191F] text-white border-[#18191F]'
                  : 'bg-[#F6F5F1] text-[#18191F] border-[#E6E3DC] hover:bg-[#EAE7E0]'
              }`}
            >
              Trophies · {totalTrophies}
            </button>
          </div>
        </div>
      </div>

      {/* Club History / Identity Context Band (Directly between 3D Arena and Trophy Collection) */}
      <div
        className="px-4 sm:px-5 py-3 bg-white border-b border-[#E6E3DC] flex items-start justify-between gap-3 shrink-0"
        data-testid="club-history-context-card"
      >
        <div className="flex items-start gap-3 min-w-0">
          <ClubLogo
            name={resolvedClubName}
            id={currentClubHeaderResolved.id ?? state.club.id}
            color={currentClubHeaderResolved.color || state.club.color}
            logo={currentClubHeaderResolved.logo}
            fallbackLogo={currentClubHeaderResolved.fallbackLogo}
            isModActive={isModActive}
            size={34}
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 mt-0.5"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap text-xs sm:text-[13px] text-[#18191F] leading-snug">
              <span className="font-extrabold tracking-tight">{resolvedClubName}</span>
              <span>{resolvedFlag}</span>
              <span className="text-[#9CA3AF]">·</span>
              <span className="text-[#6B7280] font-medium">{currentLeagueName}</span>
              <span className="text-[#9CA3AF]">·</span>
              <span className="text-[#6B7280] font-medium">{currentStadiumName}</span>
              <span className="text-[#9CA3AF]">·</span>
              <span className="font-bold text-[#374151]">{statureLabel}</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#4B5563] leading-relaxed mt-1 line-clamp-2">
              {clubHistoryBlurb}
            </p>
          </div>
        </div>

        {onOpenDossier && (
          <button
            type="button"
            data-testid="club-history-dossier-btn"
            onClick={onOpenDossier}
            className="text-[11px] font-bold text-[#4B5563] hover:text-[#18191F] transition cursor-pointer shrink-0 pt-0.5 whitespace-nowrap"
          >
            Dossier →
          </button>
        )}
      </div>

      {/* Trophy Collection Header + 6-Tile Strip Summary */}
      <div className="px-4 sm:px-5 pt-2.5 pb-3 bg-white border-b border-[#E6E3DC] shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-[11px] text-[#6B7280] font-medium">
            <span className="font-extrabold text-[#18191F]">Trophy collection</span>
            <span className="mx-1.5 text-[#C7C4BC]">·</span>
            <span className="tabular-nums">{domesticTrophiesCount} domestic</span>
            <span className="mx-1.5 text-[#C7C4BC]">·</span>
            <span className="tabular-nums">{intlTrophiesCount} international</span>
          </div>
          {onOpenTrophyCabinet && (
            <button
              type="button"
              data-testid="club-history-cabinet-btn"
              onClick={onOpenTrophyCabinet}
              className="text-[11px] font-bold text-[#4B5563] hover:text-[#18191F] transition cursor-pointer shrink-0 whitespace-nowrap"
            >
              Cabinet →
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {(() => {
            const cCode = state.club.country || 'GER';
            const region = getRegion(cCode);
            const items: Array<{
              label: string;
              count: number;
              icon: string;
              tone: string;
              kind: CompetitionKind;
              competitionId?: string;
            }> = [
              {
                label: topFlightName || 'League',
                count: trophyCounts.topLeague,
                icon: 'fa-trophy',
                tone: 'text-amber-600',
                kind: 'league',
              },
              {
                label: nationalCupName || 'Cup',
                count: trophyCounts.nationalCup,
                icon: 'fa-award',
                tone: 'text-amber-700',
                kind: 'cup',
              },
              {
                label: 'Supercup',
                count: trophyCounts.supercup,
                icon: 'fa-crown',
                tone: 'text-purple-600',
                kind: 'supercup',
              },
              {
                label:
                  isModActive && region === 'UEFA'
                    ? 'Champ. Lg'
                    : clName.replace(/\s+Cup$/i, '') || 'Champions',
                count: trophyCounts.cl,
                icon: 'fa-star',
                tone: 'text-sky-600',
                kind: 'continental',
                competitionId: 'cl',
              },
              {
                label:
                  isModActive && region === 'UEFA'
                    ? 'Euro Cup'
                    : elName || 'Euro Cup',
                count: trophyCounts.el,
                icon: 'fa-globe',
                tone: 'text-orange-600',
                kind: 'continental',
                competitionId: 'el',
              },
              {
                label:
                  isModActive && region === 'UEFA'
                    ? 'Conf. Lg'
                    : eclName.replace(/\s+Cup$/i, '') || 'Challenge',
                count: trophyCounts.ecl,
                icon: 'fa-shield-halved',
                tone: 'text-emerald-600',
                kind: 'continental',
                competitionId: 'ecl',
              },
            ];
            return items.map((item, i) => (
              <div
                key={i}
                data-testid={`trophy-strip-tile-${i}`}
                className={`rounded-xl border px-2 py-1.5 text-center ${
                  item.count > 0
                    ? 'bg-amber-50/90 border-amber-200/90'
                    : 'bg-[#FAF9F6] border-[#E6E3DC] opacity-85'
                }`}
              >
                <div className="text-[11px] font-black text-[#18191F] flex items-center justify-center gap-1 tabular-nums">
                  <CompetitionLogo
                    kind={item.kind}
                    competitionId={item.competitionId}
                    country={cCode}
                    tier={1}
                    isModActive={isModActive}
                    alt={`${item.label} crest`}
                    className="w-4 h-4 object-contain shrink-0"
                    data-testid={`trophy-strip-crest-${i}`}
                  />
                  <span>{item.count}</span>
                </div>
                <div className="text-[9px] font-semibold text-[#6B7280] truncate mt-0.5">
                  {item.label}
                </div>
              </div>
            ));
          })()}
        </div>

        {showLowerTierHonours && (
          <div
            data-testid="lower-tier-trophy-strip"
            className="grid grid-cols-2 gap-1.5 mt-1.5"
          >
            <div
              data-testid="trophy-strip-lower-league"
              className={`rounded-xl border px-2.5 py-1.5 flex items-center justify-between gap-2 ${
                trophyCounts.lowerLeague > 0
                  ? 'bg-amber-50/90 border-amber-200/90'
                  : 'bg-[#FAF9F6] border-[#E6E3DC] opacity-85'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <i
                  className={`fas fa-trophy text-[11px] shrink-0 ${
                    trophyCounts.lowerLeague > 0 ? 'text-amber-600' : 'text-[#9CA3AF]'
                  }`}
                />
                <span className="text-[10px] font-semibold text-[#4B5563] truncate">
                  Lower Div Titles
                </span>
              </div>
              <span className="text-[11px] font-black text-[#18191F] tabular-nums shrink-0">
                {trophyCounts.lowerLeague}
              </span>
            </div>
            <div
              data-testid="trophy-strip-regional-cup"
              className={`rounded-xl border px-2.5 py-1.5 flex items-center justify-between gap-2 ${
                trophyCounts.regionalCup > 0
                  ? 'bg-amber-50/90 border-amber-200/90'
                  : 'bg-[#FAF9F6] border-[#E6E3DC] opacity-85'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <i
                  className={`fas fa-shield-halved text-[11px] shrink-0 ${
                    trophyCounts.regionalCup > 0 ? 'text-amber-700' : 'text-[#9CA3AF]'
                  }`}
                />
                <span className="text-[10px] font-semibold text-[#4B5563] truncate">
                  {regionalCupName}
                </span>
              </div>
              <span className="text-[11px] font-black text-[#18191F] tabular-nums shrink-0">
                {trophyCounts.regionalCup}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Column Headers (Campaign Archive) */}
      <div className="flex items-center justify-between text-[10px] text-[#6B7280] font-bold uppercase tracking-wider px-4 sm:px-5 py-2 border-b border-[#E6E3DC] bg-[#FAF9F6] shrink-0">
        <div className="min-w-0 flex-1 pr-2">Campaign archive</div>
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
          <div className="w-6 text-center">OVR</div>
          <div className="w-6 text-center">Pos</div>
          <div className="w-14 sm:w-15 text-center">W–D–L</div>
          <div className="hidden xl:block w-6 text-center">GF</div>
          <div className="hidden xl:block w-6 text-center">GA</div>
          <div className="hidden sm:block w-11 sm:w-12 text-right">Att</div>
          <div className="hidden sm:block w-9 sm:w-10 text-right">Util</div>
        </div>
      </div>

      <div
        ref={containerRef}
        data-testid="season-archive-scroll"
        className="overflow-y-auto px-3 pb-3 flex-1 min-h-0 max-h-[310px] lg:max-h-[360px] scroll-smooth custom-scrollbar bg-[#FAF9F6]"
      >
        {subView === 'trophies' && (state.trophyHistory || []).length > 0 && (
          <div className="pt-2 space-y-1.5 mb-2">
            {(state.trophyHistory || []).map((trItem, idx) => (
              <div
                key={`th-${idx}-${trItem.year}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 text-[10px] font-black tabular-nums">
                    {trItem.year}
                  </span>
                  <ClubLogo
                    name={trItem.clubName}
                    logo={trItem.logo}
                    color={trItem.color}
                    isModActive={isModActive}
                    size={22}
                    className="w-5 h-5 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-[#18191F] truncate">
                      {trItem.name}
                    </div>
                    <div className="text-[10px] text-[#6B7280] truncate">{trItem.clubName}</div>
                  </div>
                </div>
                <i className="fa-solid fa-trophy text-amber-600 text-xs shrink-0" />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1.5 pt-2">
          {/* Active Season Row */}
          <div
            ref={activeRowRef}
            id="active-season-row"
            className="flex items-center justify-between py-2 px-3 bg-[#FAF9F6] rounded-xl border border-[#E6E3DC] mb-1"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2 overflow-hidden">
              <div className="px-2 py-0.5 bg-white border border-[#E6E3DC] text-[#18191F] rounded-md flex items-center justify-center text-[10px] font-bold tabular-nums shrink-0">
                {state.year}
              </div>
              <ClubLogo
                name={resolvedClubName}
                id={currentClubHeaderResolved.id ?? state.club.id}
                color={currentClubHeaderResolved.color || state.club.color}
                logo={currentClubHeaderResolved.logo}
                fallbackLogo={currentClubHeaderResolved.fallbackLogo}
                isModActive={isModActive}
                size={22}
                className="w-5 h-5 object-contain shrink-0"
              />
              <div className="min-w-0">
                <div className="font-extrabold text-[#18191F] text-[12px] truncate leading-tight">
                  {resolvedClubName}
                </div>
                <div className="text-[10px] font-medium text-[#6B7280] truncate">
                  Current campaign in progress · Tier {state.club.tier || 1}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {onOpenTable && (
                <button
                  type="button"
                  onClick={onOpenTable}
                  className="text-[10px] font-bold text-[#18191F] bg-white hover:bg-[#EAE7E0] px-2.5 py-0.5 rounded-full border border-[#E6E3DC] transition cursor-pointer"
                >
                  Table →
                </button>
              )}
              <span className="text-[10px] font-extrabold text-white bg-[#18191F] px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                Active
              </span>
            </div>
          </div>

          {([...(state.history || [])].reverse() || []).map((h, reversedIndex) => {
            const historyLength = (state.history || []).length;
            const originalIndex = historyLength - 1 - reversedIndex;
            const isLast = originalIndex === historyLength - 1;

            const safeClubName = h.clubName || state.club.name || 'Club';
            const histCountry = h.country || state.club.country || 'GER';
            const currentClubResolved = resolveHistoryClubDisplay(
              {
                id: state.club.id,
                name: state.club.name,
                country: state.club.country,
                color: state.club.color,
                logo: state.club.logo,
                fallbackLogo: state.club.fallbackLogo,
              },
              isModActive,
              clubsDb
            );
            const resolvedDisplay = resolveHistoryClubDisplay(
              {
                id: h.clubId ?? (safeClubName === state.club.name ? state.club.id : undefined),
                name: safeClubName,
                country: histCountry,
                color: h.color,
                logo: h.logo || (safeClubName === state.club.name ? state.club.logo : undefined),
                fallbackLogo:
                  h.fallbackLogo ||
                  (safeClubName === state.club.name ? state.club.fallbackLogo : undefined),
              },
              isModActive,
              clubsDb
            );
            const displayName = resolvedDisplay.name || safeClubName;
            const rowId = resolvedDisplay.id ?? (safeClubName === state.club.name ? state.club.id : h.clubId);
            const rowColor = resolvedDisplay.color || h.color;

            let nextTier = h.tier;
            let sameClubNextSeason = false;
            if (isLast) {
              sameClubNextSeason = Boolean(
                (rowId != null && currentClubResolved.id != null && String(currentClubResolved.id) === String(rowId)) ||
                  (h.clubId != null && state.club.id != null && String(state.club.id) === String(h.clubId)) ||
                  (currentClubResolved.name && displayName && currentClubResolved.name.toLowerCase().trim() === displayName.toLowerCase().trim()) ||
                  (state.club.name && h.clubName && state.club.name.toLowerCase().trim() === h.clubName.toLowerCase().trim())
              );
              if (sameClubNextSeason) nextTier = state.club.tier;
            } else {
              const nextHistoryItem = state.history![originalIndex + 1];
              const nextResolved = resolveHistoryClubDisplay(
                {
                  id: nextHistoryItem.clubId,
                  name: nextHistoryItem.clubName || state.club.name || 'Club',
                  country: nextHistoryItem.country || state.club.country,
                },
                isModActive,
                clubsDb
              );
              sameClubNextSeason = Boolean(
                (rowId != null && nextResolved.id != null && String(nextResolved.id) === String(rowId)) ||
                  (h.clubId != null && nextHistoryItem.clubId != null && String(nextHistoryItem.clubId) === String(h.clubId)) ||
                  (nextResolved.name && displayName && nextResolved.name.toLowerCase().trim() === displayName.toLowerCase().trim()) ||
                  (nextHistoryItem.clubName && h.clubName && nextHistoryItem.clubName.toLowerCase().trim() === h.clubName.toLowerCase().trim())
              );
              if (sameClubNextSeason) nextTier = nextHistoryItem.tier;
            }

            const maxTier = getMaxTier(histCountry, clubsDb);
            const isTier1Only = maxTier <= 1;
            const isBottomTier = h.tier >= maxTier;

            const archivedRow = state.seasonStandingsArchive?.[h.year]?.[h.tier]?.find(
              (r: any) =>
                r.isUser ||
                (rowId != null && r.id != null && String(r.id) === String(rowId)) ||
                (h.clubId != null && r.id != null && String(r.id) === String(h.clubId)) ||
                (r.name && displayName && r.name.toLowerCase().trim() === displayName.toLowerCase().trim()) ||
                (r.name && h.clubName && r.name.toLowerCase().trim() === h.clubName.toLowerCase().trim())
            );
            const normalizedStatus: 'C' | 'P' | 'R' | undefined =
              (h.status as string) === 'champion'
                ? 'C'
                : h.status === 'C' || h.status === 'P' || h.status === 'R'
                ? h.status
                : undefined;

            const rawOutcome =
              normalizedStatus ||
              archivedRow?.status ||
              (h.pos === 1
                ? 'C'
                : h.survived
                ? undefined
                : sameClubNextSeason
                ? nextTier < h.tier
                  ? 'P'
                  : nextTier > h.tier
                  ? 'R'
                  : undefined
                : h.tier > 1 && h.pos <= 2
                ? 'P'
                : h.pos >= 17 && h.tier < maxTier
                ? 'R'
                : undefined);
            const outcome: 'C' | 'P' | 'R' | undefined =
              rawOutcome === 'R' && (isTier1Only || isBottomTier || h.survived)
                ? undefined
                : rawOutcome;

            const cleanParentName = displayName
              .replace(/\s+II$/, '')
              .replace(/\s+\(?B\)?$/, '')
              .replace(/\s+Castilla$/, '')
              .replace(/\s+B$/, '')
              .replace(/\s+2$/, '')
              .trim();
            const parentDbClub =
              isModActive && !resolvedDisplay.logo && cleanParentName !== displayName
                ? clubsDb?.find(
                    (c) => c.name === cleanParentName || c.name.toLowerCase() === cleanParentName.toLowerCase()
                  )
                : null;
            const rowLogo = isModActive ? resolvedDisplay.logo || parentDbClub?.logo : resolvedDisplay.logo;
            const rowFallbackLogo = isModActive
              ? resolvedDisplay.fallbackLogo || parentDbClub?.fallbackLogo
              : resolvedDisplay.fallbackLogo;

            return (
              <div
                key={`${h.year}-${safeClubName}-${originalIndex}`}
                className="flex flex-col py-2 px-3 bg-white hover:bg-[#F6F5F1] transition-all rounded-xl border border-[#E6E3DC]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2 overflow-hidden">
                    <div className="px-1.5 py-0.5 bg-[#F6F5F1] text-[#18191F] border border-[#E6E3DC] rounded-md flex items-center justify-center text-[10px] font-bold tabular-nums shrink-0">
                      {h.year}
                    </div>
                    <ClubLogo
                      name={displayName}
                      id={rowId}
                      color={rowColor}
                      logo={rowLogo}
                      fallbackLogo={rowFallbackLogo}
                      isModActive={isModActive}
                      className="w-6 h-6 object-contain shrink-0"
                    />
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="font-bold tracking-tight text-[#18191F] truncate text-[12px] sm:text-[13px] leading-normal py-0.5">
                        {displayName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F6F5F1] text-[#4B5563] border border-[#E6E3DC] truncate leading-none">
                          {h.leagueTag === '1. BL' ? 'GER 1' : h.leagueTag === '2. BL' ? 'GER 2' : h.leagueTag}
                        </span>
                        {outcome === 'C' && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-400 text-[#18191F] shrink-0" title="Champion">
                            C
                          </span>
                        )}
                        {outcome === 'P' && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-600 text-white shrink-0" title="Promoted">
                            P
                          </span>
                        )}
                        {outcome === 'R' && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-rose-600 text-white shrink-0" title="Relegated">
                            R
                          </span>
                        )}
                        {h.pointsDeducted && h.pointsDeducted > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 leading-none">
                            -{h.pointsDeducted} Pts
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {h.bankrupt ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 uppercase">
                      Bankrupt
                    </span>
                  ) : (
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2 font-medium text-[11px] sm:text-[12px] text-[#4B5563] tabular-nums shrink-0">
                      <div className="w-6 text-center font-extrabold text-[#18191F]">
                        {h.ovr ?? '—'}
                      </div>
                      <div className="w-6 text-center font-bold text-[#18191F]">
                        {h.pos ?? '—'}.
                      </div>
                      {(() => {
                        const w = Math.max(0, Number(h.wins) || 0);
                        const d =
                          h.draws != null
                            ? Math.max(0, Number(h.draws))
                            : h.pts != null
                            ? Math.max(0, Number(h.pts) + (Number(h.pointsDeducted) || 0) - w * 3)
                            : Math.max(0, Math.min(34 - w, Math.round((34 - w) * 0.35)));
                        const l = h.losses != null ? Math.max(0, Number(h.losses)) : Math.max(0, 34 - w - d);
                        return (
                          <div className="w-14 sm:w-15 text-center font-mono text-[10px] px-1 py-0.5 rounded bg-[#F6F5F1] border border-[#E6E3DC]">
                            <span className="text-emerald-700 font-bold">{w}</span>
                            <span className="text-[#9CA3AF]">-</span>
                            <span className="text-[#4B5563]">{d}</span>
                            <span className="text-[#9CA3AF]">-</span>
                            <span className="text-rose-700 font-bold">{l}</span>
                          </div>
                        );
                      })()}
                      <div className="hidden xl:block w-6 text-center text-emerald-700 font-semibold">{h.gf ?? 0}</div>
                      <div className="hidden xl:block w-6 text-center text-rose-700 font-semibold">{h.ga ?? 0}</div>
                      <div className="hidden sm:block w-11 sm:w-12 text-right font-semibold text-[#4B5563]">
                        {h.att != null ? formatNum(h.att) : '—'}
                      </div>
                      <div
                        className={`hidden sm:block w-9 sm:w-10 text-right font-bold ${
                          (h.util ?? 0) >= 95
                            ? 'text-emerald-700'
                            : h.util != null && h.util < 50
                            ? 'text-rose-700'
                            : 'text-[#4B5563]'
                        }`}
                      >
                        {h.util != null ? `${h.util}%` : '—'}
                      </div>
                    </div>
                  )}
                </div>

                {h.trophiesThisYear && Object.keys(h.trophiesThisYear).some((k) => (h.trophiesThisYear[k] || 0) > 0) && (
                  <div className="flex items-center gap-1.5 pl-[34px] mt-1.5 pb-0.5 flex-wrap">
                    <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mr-1">
                      {isDe ? 'Honours:' : 'Honours:'}
                    </span>
                    {renderTrophyIcons(h.trophiesThisYear, h.country, displayName, rowId, h.tier)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {Boolean(
          state.hasBeenWorldCupInvited ||
            (state.worldCupInvitationsReceived && state.worldCupInvitationsReceived > 0) ||
            (state.worldCupTournamentsPlayed && state.worldCupTournamentsPlayed > 0) ||
            (state.internationalTournamentsPlayed && state.internationalTournamentsPlayed > 0) ||
            (state.worldCupMatchesPlayed && state.worldCupMatchesPlayed > 0) ||
            (state.worldCupCampaigns && state.worldCupCampaigns.length > 0)
        ) && (
          <div
            onClick={onOpenWorldCupHistory}
            className="flex items-center justify-between py-2.5 px-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl mt-2 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-5 bg-amber-200 text-amber-950 rounded flex items-center justify-center text-[10px] font-black shrink-0">
                WC
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#18191F] truncate">
                  {state.worldCupLastTeam || 'National Team'}
                </div>
                <div className="text-[10px] font-semibold text-amber-800">
                  {state.worldCupBestFinish || 'World Cup Campaign'}
                </div>
              </div>
            </div>
            <div className="text-xs font-black text-amber-900 tabular-nums shrink-0">
              {state.worldCupMatchesWon || 0}W / {state.worldCupMatchesPlayed || 0}M
            </div>
          </div>
        )}
      </div>
    </div>
  );
};