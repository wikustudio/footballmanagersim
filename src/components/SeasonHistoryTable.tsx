import React, { useEffect, useRef } from 'react';
import { Club, GameState, Language, TrophiesObj } from '../types';
import { getContinentalCupNames, getRegion } from '../utils/regionHelpers';
import { getLeagueInfo, getDomesticCupInfo, getMaxTier } from '../data/gameConstants';
import {
  formatNum,
  getOvrColor,
} from '../data/gameConstants';
import { ClubLogo } from './ClubLogo';
import { resolveHistoryClubDisplay } from '../utils/modSafeguards';

interface SeasonHistoryTableProps {
  state: GameState;
  lang: Language;
  clubsDb?: Club[];
  isModActive?: boolean;
  onOpenWorldCupHistory?: () => void;
}

export const SeasonHistoryTable: React.FC<SeasonHistoryTableProps> = ({ state, lang, clubsDb, isModActive: isModActiveProp, onOpenWorldCupHistory }) => {
  const isDe = lang === 'de';
  const t = (en: string, de: string) => (isDe ? de : en);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

  const isModActive = isModActiveProp !== undefined 
    ? isModActiveProp 
    : (typeof window !== 'undefined' && localStorage.getItem('fms_real_mod_active') === 'true');

  useEffect(() => {
    if (state.isNewSeasonRender && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state?.isNewSeasonRender, state?.history?.length]);

  const renderTrophyIcons = (trophiesObj?: TrophiesObj, countryContext?: string, clubName?: string, clubId?: number) => {
    if (!trophiesObj) return null;
    const country = countryContext || state.club.country || 'GER';
    const { cl: clTitle, el: elTitle, ecl: eclTitle } = getContinentalCupNames(country);

    const icons: React.ReactNode[] = [];
    const wcCount = Math.min(1, trophiesObj.wc || 0);
    for (let i = 0; i < wcCount; i++) {
      icons.push(
        <button
          key={`wc-${i}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenWorldCupHistory?.();
          }}
          className="cursor-pointer hover:scale-125 transition-transform"
          title="World Cup Champion (Click to view World Cup Archive)"
        >
          <i className="fas fa-trophy text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] text-[11px]"></i>
        </button>
      );
    }
    for (let i = 0; i < (trophiesObj.cwc || 0); i++) {
      icons.push(<i key={`cwc-${i}`} className="fas fa-globe text-yellow-400 drop-shadow text-[10px]" title="Club World Cup"></i>);
    }
    for (let i = 0; i < (trophiesObj.cl || 0); i++) {
      icons.push(<i key={`cl-${i}`} className="fas fa-star text-yellow-300 drop-shadow text-[10px]" title={clTitle}></i>);
    }
    for (let i = 0; i < (trophiesObj.el || 0); i++) {
      icons.push(<i key={`el-${i}`} className={`fas ${getRegion(country) === 'CONMEBOL' || getRegion(country) === 'CONCACAF' ? 'fa-globe-americas' : getRegion(country) === 'AFC' ? 'fa-globe-asia' : 'fa-globe-europe'} text-orange-400 drop-shadow text-[10px]`} title={elTitle}></i>);
    }
    for (let i = 0; i < (trophiesObj.ecl || 0); i++) {
      icons.push(<i key={`ecl-${i}`} className={`fas ${getRegion(country) === 'CONMEBOL' || getRegion(country) === 'CONCACAF' ? 'fa-earth-americas' : getRegion(country) === 'AFC' ? 'fa-earth-asia' : 'fa-earth-europe'} text-emerald-400 drop-shadow text-[10px]`} title={eclTitle}></i>);
    }
    for (let i = 0; i < (trophiesObj.bl || 0); i++) {
      icons.push(<i key={`bl-${i}`} className="fas fa-trophy text-yellow-400 drop-shadow text-[10px]" title={getLeagueInfo(1, country).name}></i>);
    }
    for (let i = 0; i < (trophiesObj.dfb || 0); i++) {
      icons.push(<i key={`dfb-${i}`} className="fas fa-award text-amber-400 drop-shadow text-[10px]" title={getDomesticCupInfo(country, 1, clubName, clubId).name}></i>);
    }
    for (let i = 0; i < (trophiesObj.efl || 0); i++) {
      icons.push(<i key={`efl-${i}`} className="fas fa-medal text-sky-300 drop-shadow text-[10px]" title="League Cup"></i>);
    }
    for (let i = 0; i < (trophiesObj.lower || 0); i++) {
      icons.push(<i key={`lower-${i}`} className="fas fa-trophy text-slate-300 drop-shadow text-[10px]" title={isDe ? "Meister Untere Liga" : "Lower League Title"}></i>);
    }
    for (let i = 0; i < (trophiesObj.reg || 0); i++) {
      icons.push(<i key={`reg-${i}`} className="fas fa-shield-halved text-amber-600 drop-shadow text-[10px]" title={getDomesticCupInfo(country, 4, clubName, clubId).name || (isDe ? 'Regionalpokal' : 'Regional Cup')}></i>);
    }
    // Custom / Modded Competition Fallback
    const standardTrophyKeys = new Set(['wc', 'cwc', 'cl', 'el', 'ecl', 'bl', 'dfb', 'efl', 'lower', 'reg']);
    for (const [k, rawVal] of Object.entries(trophiesObj)) {
      if (standardTrophyKeys.has(k)) continue;
      const count = Number(rawVal) || 0;
      for (let i = 0; i < count; i++) {
        icons.push(<i key={`custom-${k}-${i}`} className="fas fa-trophy text-amber-300 drop-shadow text-[10px]" title={k.toUpperCase()}></i>);
      }
    }
    
    // Quadruple / Triple Logic
    const hasBl = (trophiesObj.bl || 0) > 0;
    const hasDfb = (trophiesObj.dfb || 0) > 0;
    const hasCl = (trophiesObj.cl || 0) > 0;
    const hasEl = (trophiesObj.el || 0) > 0;
    const hasEcl = (trophiesObj.ecl || 0) > 0;
    const hasCwc = (trophiesObj.cwc || 0) > 0;
    
    if (hasBl && hasDfb && hasCl && hasCwc) {
      icons.push(<span key="quadruple" className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/40 uppercase tracking-widest whitespace-nowrap" title={`Club World Cup + ${clTitle} + League + Cup`}>Quadruple</span>);
    } else if (hasBl && hasDfb && hasCl) {
      icons.push(<span key="triple" className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 uppercase tracking-widest whitespace-nowrap" title={`${clTitle} + League + Cup`}>Triple</span>);
    } else if (hasBl && hasDfb && hasEl) {
      icons.push(<span key="kleines-triple" className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/40 uppercase tracking-widest whitespace-nowrap" title={`${elTitle} + League + Cup`}>Triple</span>);
    } else if (hasBl && hasDfb && hasEcl) {
      icons.push(<span key="ecl-triple" className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-widest whitespace-nowrap" title={`${eclTitle} + League + Cup`}>Mini Triple</span>);
    } else if (hasBl && hasDfb) {
      icons.push(<span key="double" className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase tracking-widest whitespace-nowrap" title="League + Cup">Double</span>);
    }

    return <div className="flex items-center trophy-stack ml-1">{icons}</div>;
  };

  const hasWorldCupArchive = Boolean(
    (state.worldCupTrophies || 0) > 0 ||
    (state.internationalTrophies || 0) > 0 ||
    (state.worldCupCampaigns || []).length > 0 ||
    (state.history || []).some(h => (h.trophiesThisYear?.wc || 0) > 0)
  );

  return (
    <div className="bg-[#161820]/75 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.36)] flex flex-col overflow-hidden h-[560px] lg:h-full w-full flex-1 relative">
      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold uppercase tracking-wider px-6 pt-3 pb-2.5 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
        <div className="min-w-0 flex-1 pr-2 flex items-center gap-2">
          <span className="truncate">{t('Year / Club / Tier', 'Jahr / Club / Liga')}</span>
          {hasWorldCupArchive && (
            <button
              onClick={onOpenWorldCupHistory}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 border border-amber-400/30 text-[9px] font-semibold uppercase tracking-wider transition cursor-pointer shrink-0"
              title="Open Managerial World Cup History Archive"
            >
              <i className="fa-solid fa-trophy text-[8px] text-amber-300"></i>
              <span>WC Archive</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
          <div className="w-6 text-center">{t('OVR', 'GES')}</div>
          <div className="w-6 text-center">{t('Pos', 'Pl')}</div>
          <div className="w-14 sm:w-15 text-center" title="Win–Draw–Loss Record">W–D–L</div>
          <div className="hidden xl:block w-6 text-center">{t('GF', 'T+')}</div>
          <div className="hidden xl:block w-6 text-center">{t('GA', 'T-')}</div>
          <div className="w-11 sm:w-12 text-right">{t('Att', 'Zus')}</div>
          <div className="w-9 sm:w-10 text-right">{t('Util', 'Ausl')}</div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-y-auto px-3 pb-24 h-full scroll-smooth custom-scrollbar"
      >
        <div className="space-y-1 pt-1.5">
          {/* Active Season Row Placeholder - Positioned at top of reverse chronological history */}
          <div
            ref={activeRowRef}
            id="active-season-row"
            className="flex items-center justify-between py-2 px-3 bg-sky-500/[0.08] rounded-xl border border-sky-400/20 mb-1 fade-in shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2 overflow-hidden">
              <div className="px-1.5 py-0.5 bg-sky-500/25 text-sky-300 border border-sky-400/40 rounded-md flex items-center justify-center text-[10px] font-bold tabular-nums shrink-0 shadow-sm">
                {state.year}
              </div>
              <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full border border-sky-400/30 flex items-center justify-center text-[10px] font-bold text-sky-300 shrink-0 bg-sky-500/10">
                <i className="fa-solid fa-play text-[8px] text-sky-400 animate-pulse"></i>
              </div>
              <div className="font-semibold text-sky-200/90 text-[12px] sm:text-[13px] truncate">
                {t('Current season underway...', 'Laufende Saison...')}
              </div>
            </div>
            <div className="shrink-0 flex justify-end items-center">
              <span className="text-[9px] sm:text-[10px] font-semibold text-sky-300 bg-sky-500/15 px-2.5 py-0.5 rounded-full border border-sky-400/25 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                <span>Active</span>
              </span>
            </div>
          </div>

          {([...(state.history || [])].reverse() || []).map((h, reversedIndex) => {
            const historyLength = (state.history || []).length;
            const originalIndex = historyLength - 1 - reversedIndex;
            const isLast = originalIndex === historyLength - 1;
            const rowAnim = state.isNewSeasonRender && isLast ? 'bg-sky-500/[0.08] border-sky-400/20' : '';

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
                fallbackLogo: h.fallbackLogo || (safeClubName === state.club.name ? state.club.fallbackLogo : undefined),
              },
              isModActive,
              clubsDb
            );
            const displayName = resolvedDisplay.name || safeClubName;
            const rowId = resolvedDisplay.id ?? (safeClubName === state.club.name ? state.club.id : h.clubId);
            const rowColor = resolvedDisplay.color || h.color;

            // Promotion / Relegation Logic
            let nextTier = h.tier;
            let sameClubNextSeason = false;
            
            if (isLast) {
              sameClubNextSeason = Boolean(
                (rowId != null && currentClubResolved.id != null && String(currentClubResolved.id) === String(rowId)) ||
                (h.clubId != null && state.club.id != null && String(state.club.id) === String(h.clubId)) ||
                (currentClubResolved.name && displayName && currentClubResolved.name.toLowerCase().trim() === displayName.toLowerCase().trim()) ||
                (state.club.name && h.clubName && state.club.name.toLowerCase().trim() === h.clubName.toLowerCase().trim())
              );
              if (sameClubNextSeason) {
                nextTier = state.club.tier;
              }
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
              if (sameClubNextSeason) {
                nextTier = nextHistoryItem.tier;
              }
            }

            const maxTier = getMaxTier(histCountry, clubsDb);
            const isTier1Only = maxTier <= 1;
            const isBottomTier = h.tier >= maxTier;

            const archivedRow = state.seasonStandingsArchive?.[h.year]?.[h.tier]?.find((r: any) =>
              r.isUser ||
              (rowId != null && r.id != null && String(r.id) === String(rowId)) ||
              (h.clubId != null && r.id != null && String(r.id) === String(h.clubId)) ||
              (r.name && displayName && r.name.toLowerCase().trim() === displayName.toLowerCase().trim()) ||
              (r.name && h.clubName && r.name.toLowerCase().trim() === h.clubName.toLowerCase().trim())
            );
            const normalizedStatus: 'C' | 'P' | 'R' | undefined =
              (h.status as string) === 'champion' ? 'C' :
              (h.status === 'C' || h.status === 'P' || h.status === 'R' ? h.status : undefined);

            const rawOutcome = normalizedStatus || archivedRow?.status || (
              h.pos === 1 ? 'C' :
              h.survived ? undefined :
              (sameClubNextSeason ? (nextTier < h.tier ? 'P' : nextTier > h.tier ? 'R' : undefined) :
               (h.tier > 1 && h.pos <= 2 ? 'P' :
                (h.pos >= 17 && h.tier < maxTier) ? 'R' : undefined))
            );
            const outcome: 'C' | 'P' | 'R' | undefined = (rawOutcome === 'R' && (isTier1Only || isBottomTier || h.survived)) ? undefined : rawOutcome;

            const cleanParentName = displayName
              .replace(/\s+II$/, '')
              .replace(/\s+\(?B\)?$/, '')
              .replace(/\s+Castilla$/, '')
              .replace(/\s+B$/, '')
              .replace(/\s+2$/, '')
              .trim();
            const parentDbClub = isModActive && !resolvedDisplay.logo && cleanParentName !== displayName
              ? clubsDb?.find(c => c.name === cleanParentName || c.name.toLowerCase() === cleanParentName.toLowerCase())
              : null;
            const rowLogo = isModActive 
              ? (resolvedDisplay.logo || parentDbClub?.logo)
              : resolvedDisplay.logo;
            const rowFallbackLogo = isModActive
              ? (resolvedDisplay.fallbackLogo || parentDbClub?.fallbackLogo)
              : resolvedDisplay.fallbackLogo;

            return (
              <div key={`${h.year}-${safeClubName}-${originalIndex}`} className={`flex flex-col py-2 px-3 hover:bg-white/[0.04] transition-all rounded-xl border border-white/[0.05] bg-white/[0.015] ${rowAnim}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2 overflow-hidden">
                    <div className="px-1.5 py-0.5 bg-sky-500/15 text-sky-300 border border-sky-400/20 rounded-md flex items-center justify-center text-[10px] font-bold tabular-nums shrink-0 shadow-sm">
                      {h.year}
                    </div>
                    <ClubLogo
                      name={displayName}
                      id={rowId}
                      color={rowColor}
                      logo={rowLogo}
                      fallbackLogo={rowFallbackLogo}
                      isModActive={isModActive}
                      className="w-7 h-7 sm:w-6 sm:h-6 object-contain shrink-0"
                      fallbackClassName="w-7 h-7 sm:w-6 sm:h-6 text-[10px] sm:text-[9px] rounded-full flex items-center justify-center font-bold text-white border border-white/10 shrink-0"
                    />
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="font-semibold tracking-tight text-white truncate text-[12px] sm:text-[13px] leading-normal py-0.5">
                        {displayName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${h.leagueCss} truncate leading-none`}>
                          {h.leagueTag === '1. BL' ? 'GER 1' : h.leagueTag === '2. BL' ? 'GER 2' : h.leagueTag}
                        </span>
                        {outcome === 'C' && (
                          <span 
                            className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-400 text-black shrink-0 shadow-sm" 
                            title={isDe ? "Meister" : "Champion"}
                          >
                            C
                          </span>
                        )}
                        {outcome === 'P' && (
                          <span 
                            className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500 text-white shrink-0 shadow-sm" 
                            title={isDe ? "Aufstieg" : "Promoted"}
                          >
                            P
                          </span>
                        )}
                        {outcome === 'R' && (
                          <span 
                            className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-rose-600 text-white shrink-0 shadow-sm" 
                            title={isDe ? "Abstieg" : "Relegated"}
                          >
                            R
                          </span>
                        )}
                        {h.financialRelegation && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30 tracking-tight leading-none flex items-center gap-1 shrink-0" title={isDe ? "Zwangsabstieg wegen Insolvenz" : "Forced Relegation due to Insolvency"}>
                            <i className="fa-solid fa-triangle-exclamation text-[8px] text-rose-400"></i>
                            {isDe ? 'Zwangsabstieg' : 'Admin Relegation'}
                          </span>
                        )}
                        
                        {h.pointsDeducted && h.pointsDeducted > 0 ? (
                          <span
                            className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30 tracking-tight leading-none flex items-center gap-1 shrink-0"
                            title={
                              isDe
                                ? `Punktabzug wegen Finanzen/Schulden: -${h.pointsDeducted} Pkt.`
                                : `Point deduction due to financial issues/debt: -${h.pointsDeducted} pts`
                            }
                          >
                            <i className="fa-solid fa-minus-circle text-[8px] text-rose-400"></i>
                            -{h.pointsDeducted} {isDe ? 'Pkt (Finanzabzug)' : 'Pts (Financial)'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {h.bankrupt ? (
                    <div className="shrink-0 flex justify-end items-center">
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/25 uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                        <i className="fa-solid fa-skull"></i>
                        <span>{isDe ? 'Insolvent' : 'Bankrupt'}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2 font-medium text-[11px] sm:text-[12px] text-zinc-400 tabular-nums shrink-0">
                      <div className={`w-6 text-center font-bold ${getOvrColor(h.ovr || 50)}`}>
                        {h.ovr ?? '—'}
                      </div>
                      <div className="w-6 text-center text-white relative">
                        <span>{h.pos ?? '—'}.</span>
                        {h.pointsDeducted && h.pointsDeducted > 0 && (
                          <span
                            className="text-[9px] font-black text-rose-400 ml-0.5"
                            title={
                              isDe
                                ? `-${h.pointsDeducted} Punkte Abzug wegen Finanzen`
                                : `-${h.pointsDeducted} pts deduction due to money issues`
                            }
                          >
                            *
                          </span>
                        )}
                      </div>
                      {(() => {
                        const w = Math.max(0, Number(h.wins) || 0);
                        const d = h.draws != null
                          ? Math.max(0, Number(h.draws))
                          : h.pts != null
                          ? Math.max(0, Number(h.pts) + (Number(h.pointsDeducted) || 0) - w * 3)
                          : Math.max(0, Math.min(34 - w, Math.round((34 - w) * 0.35)));
                        const l = h.losses != null ? Math.max(0, Number(h.losses)) : Math.max(0, 34 - w - d);
                        return (
                          <div
                            className="w-14 sm:w-15 text-center font-mono text-[10px] px-1 py-0.5 rounded bg-slate-900/90 border border-slate-800"
                            title={`Wins: ${w}, Draws: ${d}, Losses: ${l}`}
                          >
                            <span className="text-emerald-400 font-bold">{w}</span>
                            <span className="text-slate-600">-</span>
                            <span className="text-slate-300">{d}</span>
                            <span className="text-slate-600">-</span>
                            <span className="text-rose-400 font-bold">{l}</span>
                          </div>
                        );
                      })()}
                      <div className="hidden xl:block w-6 text-center text-emerald-400">{h.gf ?? 0}</div>
                      <div className="hidden xl:block w-6 text-center text-rose-400">{h.ga ?? 0}</div>
                      <div 
                        className="w-11 sm:w-12 text-right cursor-help"
                        title={isDe 
                          ? `Durchschnittliche Zuschauer: ${h.att ? h.att.toLocaleString('de-DE') : '—'} pro Heimspiel (${((h.att || 0) * 17).toLocaleString('de-DE')} Gesamtzuschauer)` 
                          : `Average attendance: ${h.att ? h.att.toLocaleString('en-US') : '—'} per home fixture (${((h.att || 0) * 17).toLocaleString('en-US')} total season crowd)`}
                      >
                        {h.att != null ? formatNum(h.att) : '—'}
                      </div>
                      <div
                        className={`w-9 sm:w-10 text-right cursor-help ${
                          (h.util ?? 0) >= 95
                            ? 'text-emerald-400 font-semibold'
                            : h.util != null && h.util < 50
                            ? 'text-rose-400'
                            : 'text-zinc-300'
                        }`}
                        title={isDe
                          ? `Stadionauslastung: ${h.util ?? 0}% ${h.stadiumCapacity ? `(${formatNum(h.stadiumCapacity)} Plätze Kapazität)` : ''}`
                          : `Stadium utilization: ${h.util ?? 0}% ${h.stadiumCapacity ? `(${formatNum(h.stadiumCapacity)} seat capacity)` : ''}`}
                      >
                        {h.util != null ? `${h.util}%` : '—'}
                      </div>
                    </div>
                  )}
                </div>
                {h.trophiesThisYear && Object.keys(h.trophiesThisYear).some(k => (h.trophiesThisYear[k] || 0) > 0) && (
                  <div className="flex items-center gap-1.5 pl-[38px] mt-1.5 pb-0.5 flex-wrap">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mr-1">{isDe ? 'Titel:' : 'Honours:'}</span>
                    {renderTrophyIcons(h.trophiesThisYear, h.country, displayName, rowId)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* World Cup & International Career Stats Row - Only visible when director was invited */}
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
            className="flex flex-col py-2 px-3 hover:bg-amber-950/25 hover:border-amber-400/50 transition rounded-xl border border-amber-500/30 bg-amber-950/15 mt-1.5 cursor-pointer group shadow-sm active:scale-[0.99]"
            title="Click to view full World Cup Managerial History Archive"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2 overflow-hidden">
                <div className="w-7 h-5 bg-amber-500/25 text-amber-300 border border-amber-400/30 rounded flex items-center justify-center text-[10px] font-bold shrink-0">
                  WC
                </div>
                <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 text-xs shrink-0 group-hover:scale-110 transition-transform">
                  <i className="fas fa-globe text-[11px]"></i>
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <div className="font-semibold tracking-tight text-white truncate text-[12px] sm:text-[13px] leading-tight flex items-center gap-1.5">
                    <span>{state.worldCupLastTeam || (isDe ? 'Nationalteam' : 'National Team')}</span>
                    {(state.worldCupTrophies || state.internationalTrophies || 0) > 0 && (
                      <span className="text-yellow-400 text-[10px]" title="World Champion">🏆</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 leading-none">
                      World Cup
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium truncate">
                      {state.worldCupBestFinish || ((state.worldCupTrophies || state.internationalTrophies || 0) > 0 ? (isDe ? 'Weltmeister' : 'Champion') : (state.worldCupMatchesPlayed ? (isDe ? 'Teilnehmer' : 'Contender') : (isDe ? 'Eingeladen' : 'Invited')))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 text-right">
                <div className="w-6 text-center text-xs font-bold text-amber-300 tabular-nums" title={t('Matches', 'Spiele')}>
                  {state.worldCupMatchesPlayed || 0}
                </div>
                <div className="w-6 text-center text-xs font-bold text-emerald-400 tabular-nums" title={t('Wins', 'Siege')}>
                  {state.worldCupMatchesWon || 0}W
                </div>
                <div className="hidden xl:block w-6 text-center text-xs text-zinc-300 tabular-nums" title={t('Goals For', 'Tore')}>
                  {state.worldCupGoalsFor || 0}
                </div>
                <div className="hidden xl:block w-6 text-center text-xs text-zinc-400 tabular-nums" title={t('Goals Against', 'Gegentore')}>
                  {state.worldCupGoalsAgainst || 0}
                </div>
                <div className="w-11 sm:w-12 text-right text-xs font-black text-yellow-400" title={t('Trophies', 'Titel')}>
                  {(state.worldCupTrophies || state.internationalTrophies || 0) > 0 ? `${state.worldCupTrophies || state.internationalTrophies} 🏆` : '—'}
                </div>
                <div className="w-9 sm:w-10 text-right text-[10px] font-bold text-zinc-400" title={t('Tournaments', 'Turniere')}>
                  {(state.worldCupCampaigns && state.worldCupCampaigns.length > 0)
                    ? state.worldCupCampaigns.filter(c => typeof c.year === 'number' && c.year >= 1950 && c.year % 4 === 2).length
                    : (state.worldCupTournamentsPlayed || state.internationalTournamentsPlayed || 1)} ed.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};