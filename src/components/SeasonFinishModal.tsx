import React, { useRef, useState, useEffect, useMemo } from 'react';
import { getContinentalCupNames } from '../utils/regionHelpers';
import { getTrophyImage } from '../utils/trophyHelpers';
import { getCompetitionLogo } from '../utils/competitionLogos';
import { motion, animate } from 'motion/react';
import confetti from 'canvas-confetti';
import * as htmlToImage from 'html-to-image';
import { Club, GameState, Language, PressureSeasonVerdict, TrophiesObj, UniverseMovement } from '../types';
import { getLeagueInfo, getDomesticCupInfo, TOURNAMENT_LOGOS, formatMoney, isReserveClub, getLeagueMaxAttendance, calculateExpectedAttendance, getLeagueScaledVal, getMaxTier, isCanadianMLSClub } from '../data/gameConstants';
import { ALL_CLUBS } from '../data/clubsData';
import { ClubLogo } from './ClubLogo';
import { PrestigeTrophy } from './PrestigeTrophy';
import { getAllUniverseMovements, getHeadlineCategory, isMajorUniverseHeadline } from '../utils/universeMovements';
import { ChampionsAlmanacView, TrophyLeadersChartView } from './HistoryAndAlmanacViews';
import { resolveHistoryClubDisplay } from '../utils/modSafeguards';
import { buildDeterministicDivisionTable, resolveDivisionClubs } from '../engine/standingsEngine';

interface SeasonFinishModalProps {
  state: GameState;
  onShowTable?: () => void;
  clubsDb?: Club[];
  seasonData: {
    year: number;
    clubName: string;
    clubColor?: string;
    clubLogo?: string;
    tier: number;
    nextLeague?: number;
    pos: number;
    wins: number;
    draws: number;
    losses: number;
    pts: number;
    gf: number;
    ga: number;
    revenue: number;
    wages: number;
    netProfit: number;
    endBudget: number;
    trophiesThisYear: TrophiesObj;
    euroNextSeason: 'CL' | 'EL' | 'ECL' | null;
    euroThisSeason?: 'CL' | 'EL' | 'ECL' | null;
    graduatedYouths?: string[];
    departedYouths?: string[];
    transfersIn?: number;
    transfersOut?: number;
    newBaseOvr?: number;
    startOvr?: number;
    seasonStartOvr?: number;
    decayReasons?: string[];
    pointsEarned?: number;
    totalSkillPoints?: number;
    moraleDelta?: number;
    endMorale?: number;
    rivalData?: { name: string; wins: number; draws: number; losses: number; h2hWins: number; h2hDraws: number; h2hLosses: number; isPaused?: boolean; };
    coachAtStartOfSim?: any;
    coachDepartureAlert?: {
      coachName: string;
      ovrBoost: number;
      style: string;
      reason: string;
      isPoached: boolean;
      buyoutFeeK: number;
    } | null;
    isSackedRelegation?: boolean;
    isSacked?: boolean;
    pointsDeducted?: number;
    pressureVerdict?: PressureSeasonVerdict | null;
  };
  lang?: Language;
  onClose: () => void;
  onRenewCoach?: (years: number) => void;
  globalHighscores?: { name: string; score: number }[];
  isModActive?: boolean;
}

const AnimatedNumber = ({ from = 0, to, duration = 1.2, isMoney = false, prefix = '', suffix = '' }: { from?: number, to: number, duration?: number, isMoney?: boolean, prefix?: string, suffix?: string }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    
    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        if (isMoney) {
          let fm = formatMoney(value);
          if (value >= 0 && prefix === '+') fm = '+' + fm;
          node.textContent = `${fm}${suffix}`;
        } else {
          node.textContent = `${prefix}${Math.round(value).toLocaleString('en-US')}${suffix}`;
        }
      }
    });
    
    return () => controls.stop();
  }, [from, to, duration, isMoney, prefix, suffix]);
  
  let initialText = '';
  if (isMoney) {
    let fm = formatMoney(from);
    if (from >= 0 && prefix === '+') fm = '+' + fm;
    initialText = fm + suffix;
  } else {
    initialText = `${prefix}${Math.round(from).toLocaleString('en-US')}${suffix}`;
  }
  
  return <span ref={nodeRef}>{initialText}</span>;
};

export const SeasonFinishModal: React.FC<SeasonFinishModalProps> = React.memo(({
  state,
  onShowTable,
  seasonData,
  lang = 'en',
  onClose,
  onRenewCoach,
  globalHighscores,
  isModActive,
  clubsDb,
}) => {
  const t = (en: string, ..._ignored: any[]) => en;
  const [isTop3Leaderboard, setIsTop3Leaderboard] = useState(false);
  const [top3Rank, setTop3Rank] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'squad' | 'table' | 'world'>('overview');
  const [worldAlmanacTab, setWorldAlmanacTab] = useState<'almanac' | 'leaders'>('almanac');
  const [almanacCountry, setAlmanacCountry] = useState<string>(state.club.country || 'GER');
  const [almanacTier, setAlmanacTier] = useState<number>(seasonData.tier || 1);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.club?.country) {
      setAlmanacCountry(state.club.country);
    }
  }, [state.club?.country]);

  const switchTab = (tab: 'overview' | 'squad' | 'table' | 'world') => {
    setActiveTab(tab);
    if (cardRef.current) {
      cardRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (tab: string, _elementId?: string) => {
    if (tab === 'table' || tab === 'sporting') {
      switchTab('table');
    } else if (tab === 'squad' || tab === 'coach' || tab === 'finance') {
      switchTab('squad');
    } else if (tab === 'universe' || tab === 'world') {
      switchTab('world');
    } else {
      switchTab('overview');
    }
  };

  const handleScroll = () => {
    // Clean single-tab view; no multi-section scroll tracking needed
  };

  const country = state.club.country || 'GER';
  const league = getLeagueInfo(seasonData.tier, country);
  const effectiveModActive = isModActive !== undefined
    ? isModActive
    : (typeof window !== 'undefined' && localStorage.getItem('fms_real_mod_active') === 'true');
  const resolvedHeroClub = useMemo(() => resolveHistoryClubDisplay(
    {
      id: state.club.id,
      name: seasonData.clubName || state.club.name || 'Club',
      country,
      color: seasonData.clubColor || state.club.color,
      logo: seasonData.clubLogo || state.club.logo,
      fallbackLogo: state.club.fallbackLogo,
    },
    effectiveModActive,
    clubsDb
  ), [state.club.id, state.club.name, state.club.color, state.club.logo, state.club.fallbackLogo, seasonData.clubName, seasonData.clubColor, seasonData.clubLogo, country, effectiveModActive, clubsDb]);
  const displayClubName = resolvedHeroClub.name || seasonData.clubName || state.club.name;
  const displayClubColor = resolvedHeroClub.color || seasonData.clubColor || state.club.color;
  const displayClubLogo = resolvedHeroClub.logo;
  const displayClubFallbackLogo = resolvedHeroClub.fallbackLogo;
  const nextTier = seasonData.nextTier !== undefined
    ? seasonData.nextTier
    : seasonData.nextLeague !== undefined
    ? seasonData.nextLeague
    : Math.max(1, seasonData.tier - (seasonData.pos <= 2 && seasonData.tier > 1 ? 1 : 0));
  const nextLeague = getLeagueInfo(nextTier, country);
  const isCanadian = country === 'CAN' || isCanadianMLSClub(state.club.name, state.club.id, country);
  const natCupCountry = isCanadian ? 'CAN' : country;
  const cupInfo = getDomesticCupInfo(natCupCountry, seasonData.tier, state.club.name);
  const t1League = getLeagueInfo(1, country);

  const isTier1Only = getMaxTier(country, clubsDb) === 1;
  const isBottomTier = seasonData.tier >= getMaxTier(country, clubsDb);
  const isChamp = seasonData.pos === 1;
  const isPromoted = nextTier < seasonData.tier;
  const isRelegated = !isTier1Only && !seasonData.isSackedRelegation && nextTier > seasonData.tier;
  const isPositiveNetProfit = seasonData.netProfit >= 0;

  // Global Highscore / Leaderboard celebration
  useEffect(() => {
    const currentScore = state.careerScore || 0;
    if (currentScore > 0 && globalHighscores && globalHighscores.length > 0) {
      const scores = globalHighscores
        .map(h => h.score)
        .filter(s => typeof s === 'number' && !isNaN(s));
      const sortedUnique = Array.from(new Set([...scores, currentScore])).sort((a, b) => b - a);
      const myRank = sortedUnique.indexOf(currentScore) + 1;

      if (myRank <= 3) {
        setIsTop3Leaderboard(true);
        setTop3Rank(myRank);

        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 35, spread: 360, ticks: 80, zIndex: 999999 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: NodeJS.Timeout = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          const particleCount = 60 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 300);

        return () => {
          clearInterval(interval);
          confetti.reset();
        };
      }
    }
  }, [state.careerScore, globalHighscores]);

  // Haptic feedback & celebration confetti for championships / promotions
  useEffect(() => {
    if (isChamp || isPromoted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (navigator.vibrate) {
        navigator.vibrate([40, 60, 40, 60, 120]);
      }
    } else if (isRelegated) {
      if (navigator.vibrate) {
        navigator.vibrate([180, 80, 180]);
      }
    }
    return () => {
      confetti.reset();
    };
  }, [isChamp, isPromoted, isRelegated]);


  // Keyboard shortcut: Press Enter to proceed (guarded against interactive controls, duplicate calls, or overlapping modals)
  const hasClosedRef = useRef(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat && !isDownloading && !hasClosedRef.current) {
        if (typeof document !== 'undefined' && (document.querySelector('[data-wc-modal="true"]') || document.querySelector('[data-pressure-modal="true"]'))) {
          return;
        }
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'SELECT' ||
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'BUTTON' ||
            target.tagName === 'A' ||
            target.isContentEditable)
        ) {
          return;
        }
        hasClosedRef.current = true;
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isDownloading]);

  // Pundit commentary (100% English)
  const pundit = useMemo(() => {
    if (isChamp && seasonData.tier === 1) {
      return {
        author: "Gareth North",
        text: `An absolute masterclass. ${state.club.name} just dismantled the league. This sporting directorship is going down in history.`,
        handle: "@GarethNorth_TV",
        role: "Lead Analyst"
      };
    }
    if (isPromoted) {
      return {
        author: "Mateo Russo",
        text: `🚨 PROMOTION CONFIRMED! ${state.club.name} secures their spot in the higher tier! What a story, fully deserved! 📈`,
        handle: "@MateoRusso_Transfers",
        role: "Transfer Insider"
      };
    }
    if (seasonData.isSackedRelegation) {
      return {
        author: "Ray Kearns",
        text: isTier1Only
          ? `Ruthless dismissal at ${state.club.name}. In a single-tier system, finishing in the bottom three is immediate grounds for dismissal. Board immunity shields offered zero protection.`
          : `Brutal dismissal at ${state.club.name}. Finishing in the bottom tier drop-zone leaves the board with no patience: manager sacked on the spot.`,
        handle: "@RayKearns_Pundit",
        role: "Pundit"
      };
    }
    if (isRelegated) {
      return {
        author: "Ray Kearns",
        text: `Crushing relegation. ${state.club.name} lacked sharpness in decisive moments. A complete squad reset is required now.`,
        handle: "@RayKearns_Pundit",
        role: "Pundit"
      };
    }
    if (seasonData.tier === 1 && seasonData.pos > 10) {
      return {
        author: "James Callaghan",
        text: `Disappointing campaign for ${state.club.name}. The sporting directorship will have to deliver quick answers next term.`,
        handle: "@JCallaghan_TV",
        role: "League Correspondent"
      };
    }
    if (seasonData.wins === 0) {
      return {
        author: "DataPro",
        text: `0 wins - A historically challenging campaign for ${state.club.name}. Time to regroup and build back stronger.`,
        handle: "@DataPro_Sports",
        role: "Analytics"
      };
    }
    if (seasonData.gf > 80) {
      return {
        author: "Theo Henri",
        text: `The attacking football from ${state.club.name} was pure art. ${seasonData.gf} goals! An absolute treat for the fans.`,
        handle: "@TheoHenri_14",
        role: "Tactical Analyst"
      };
    }
    return {
      author: "Arthur Sterling",
      text: `A disciplined, by-the-numbers campaign from ${state.club.name}. Expected benchmarks met with calm execution.`,
      handle: "@ArthurSterling_9",
      role: "Senior Columnist"
    };
  }, [isChamp, isPromoted, isRelegated, seasonData, state.club.name]);

  // Trophy collection
  const trophyList = useMemo(() => {
    const list: { type: string; name: string; icon?: string; logo?: string; color: string; badge?: string }[] = [];
    const { cl, el, ecl } = getContinentalCupNames(country);
    
    if (seasonData.trophiesThisYear?.cwc) list.push({ type: 'cwc', name: 'Global Club Cup', logo: effectiveModActive ? (TOURNAMENT_LOGOS.cwc || getCompetitionLogo({ kind: 'continental', competitionId: 'cwc', country, isModActive: effectiveModActive })) : '', color: 'text-amber-400', badge: 'World Champions' });
    if (seasonData.trophiesThisYear?.cl) list.push({ type: 'cl', name: cl, logo: getTrophyImage('cl', country, effectiveModActive), color: 'text-yellow-300', badge: 'Continental Champions' });
    if (seasonData.trophiesThisYear?.el) list.push({ type: 'el', name: el, logo: getTrophyImage('el', country, effectiveModActive), color: 'text-orange-400', badge: 'Continental Cup' });
    if (seasonData.trophiesThisYear?.ecl) list.push({ type: 'ecl', name: ecl, logo: getTrophyImage('ecl', country, effectiveModActive), color: 'text-emerald-400', badge: 'Continental Challenge' });
    if (seasonData.trophiesThisYear?.bl) list.push({ type: 'title', name: `${t1League.name}`, logo: getCompetitionLogo({ kind: 'league', country, tier: 1, isModActive: effectiveModActive }) || (effectiveModActive ? t1League.logo : ''), color: 'text-amber-400', badge: 'League Champions' });
    if (seasonData.trophiesThisYear?.lower) list.push({ type: 'lower', name: `${league.name} Title`, logo: effectiveModActive ? league.logo : '', color: 'text-sky-300', badge: 'League Champions' });
    if (seasonData.trophiesThisYear?.dfb) list.push({ type: 'dfb', name: cupInfo.name, logo: getCompetitionLogo({ kind: 'cup', country, tier: 1, isModActive: effectiveModActive }) || (effectiveModActive ? cupInfo.logo : ''), color: 'text-amber-400', badge: 'National Cup' });
    if (seasonData.trophiesThisYear?.efl) list.push({ type: 'efl', name: 'League Cup', color: 'text-emerald-400', badge: 'League Cup' });
    if (seasonData.trophiesThisYear?.reg) list.push({ type: 'reg', name: 'Regional Cup', icon: 'fa-shield-halved', color: 'text-amber-600', badge: 'Regional Cup' });

    // Cross-reference state.cupRunResults for any cup won this year not yet added
    const sYear = seasonData.year ?? (state.year - 1);
    const wonCupsThisYear = (state.cupRunResults || []).filter(r => r.year === sYear && r.won);
    for (const cup of wonCupsThisYear) {
      if (!list.some(item => item.type === cup.id)) {
        let cupType = cup.id;
        let cupName = cup.nameEn || cup.nameDe || 'Cup';
        let trophyColor = 'text-amber-400';
        let badge = 'Cup Champions';
        let logo = '';
        if (cup.id === 'cl') { trophyColor = 'text-yellow-300'; badge = 'Continental Champions'; logo = getTrophyImage('cl', country, effectiveModActive); }
        else if (cup.id === 'el') { trophyColor = 'text-orange-400'; badge = 'Continental Cup'; logo = getTrophyImage('el', country, effectiveModActive); }
        else if (cup.id === 'ecl') { trophyColor = 'text-emerald-400'; badge = 'Continental Challenge'; logo = getTrophyImage('ecl', country, effectiveModActive); }
        else if (cup.id === 'reg') { trophyColor = 'text-amber-600'; badge = 'Regional Cup'; }
        else if (cup.id === 'dfb') { badge = 'National Cup'; logo = getTrophyImage('dfb', country, effectiveModActive); }
        list.push({ type: cupType, name: cupName, logo, color: trophyColor, badge });
      }
    }

    // Cross-reference state.supercupHistory for any Supercup won this season
    const wonSupercupThisYear = (state.supercupHistory || []).find((sc) => sc && sc.year === sYear && sc.won);
    if (wonSupercupThisYear && !list.some((item) => item.type === 'supercup')) {
      list.push({
        type: 'supercup',
        name: wonSupercupThisYear.cupName || 'Supercup',
        logo: getTrophyImage('supercup', country, effectiveModActive),
        color: 'text-amber-400',
        badge: 'Supercup',
      });
    }

    return list;
  }, [seasonData.trophiesThisYear, country, t1League, league, cupInfo, state.cupRunResults, state.supercupHistory, seasonData.year, state.year, effectiveModActive]);

  // Attendance Metrics
  const avgAttendance =
    typeof (seasonData as any).att === 'number' && (seasonData as any).att > 0
      ? (seasonData as any).att
      : calculateExpectedAttendance({
          club: state.club,
          tier: seasonData.tier,
          year: seasonData.year || 2026,
          ownership: state.ownership,
          stadiumPolicy: state.stadiumPolicy,
        });
  const fillPercentage = Math.min(100, Math.round((avgAttendance / Math.max(1, state.club.stadium)) * 100));

  const goalDiff = seasonData.gf - seasonData.ga;
  const fullSeasonStartOvr = seasonData.seasonStartOvr ?? seasonData.startOvr ?? state.club.baseOvr;
  const ovrDelta = (seasonData.newBaseOvr || state.club.baseOvr) - fullSeasonStartOvr;
  const hasPromotionPlayoffs = seasonData.tier > 1 && getMaxTier(country, clubsDb) > 1;

  const isStaleActive = Boolean(state.staleTactic && state.tactic === state.staleTactic);
  const isStaleWarning = Boolean(!isStaleActive && (state.consecutiveTitlesWithSameTactic || 0) >= 1 && seasonData.pos === 1);
  const consecutiveTitles = state.consecutiveTitles || 0;
  const hasSystemicImmunity = Boolean((state.club.medicalLevel || 1) >= 5 && (state.club.academyLevel || 1) >= 5);
  const rivalChallengerEvent = seasonData.rivalChallengerEvent || null;
  const superVillainClub = useMemo(() => {
    const targetId = rivalChallengerEvent?.clubId || null;
    if (!targetId) return null;
    const raw = (clubsDb || ALL_CLUBS).find(c => c.id === targetId || String(c.id) === String(targetId));
    if (!raw) return null;
    const res = resolveHistoryClubDisplay(raw, effectiveModActive, clubsDb);
    return {
      ...raw,
      id: res.id ?? raw.id,
      name: res.name || raw.name,
      color: res.color || raw.color,
      logo: res.logo,
      fallbackLogo: res.fallbackLogo,
    };
  }, [rivalChallengerEvent, clubsDb, effectiveModActive]);
  const decayReasons = seasonData.decayReasons || [];

  const tableData = useMemo(() => {
    const currentTier = seasonData.tier;
    const currentCountry = country;
    const currentLeagueInfo = league;
    const userPos = seasonData.pos;
    const userWins = seasonData.wins;
    const userDraws = seasonData.draws;
    const userLosses = seasonData.losses;
    const userPts = seasonData.pts;
    const userGf = seasonData.gf;
    const userGa = seasonData.ga;
    const rawGd = userGf - userGa;
    const userGDStr = rawGd > 0 ? `+${rawGd}` : `${rawGd}`;

    const isReserveTeam = (name: string) => {
      if (name === 'SSV Jeddeloh II' || name.toLowerCase().includes('jeddeloh ii')) return false;
      return isReserveClub(name);
    };

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const seededRand = (seed: number, min: number, max: number) => {
      return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
    };

    const sanitizedClubsDb = clubsDb && clubsDb.length > 0 ? clubsDb : ALL_CLUBS;
    const targetTotalClubs = 18;

    // 1. Direct retrieval from permanent season standings archive if available
    const archivedRows = state.seasonStandingsArchive?.[seasonData.year]?.[currentTier];
    if (archivedRows && archivedRows.length > 0) {
      const resolvedRivalTargetName = seasonData.rivalData?.name
        ? resolveHistoryClubDisplay({ name: seasonData.rivalData.name, country: currentCountry }, effectiveModActive, clubsDb).name
        : undefined;
      const mappedRows = archivedRows.slice(0, targetTotalClubs).map((r: any, idx: number) => {
        const resRow = resolveHistoryClubDisplay(
          {
            id: r.id,
            name: r.name || 'Club',
            country: r.country || currentCountry,
            color: r.color,
            logo: r.logo,
            fallbackLogo: r.fallbackLogo,
          },
          effectiveModActive,
          clubsDb
        );
        const resolvedRowName = resRow.name || r.name;
        const isUserClub = Boolean(
          r.isUser ||
          (seasonData.clubName && r.name?.toLowerCase().trim() === seasonData.clubName.toLowerCase().trim()) ||
          (displayClubName && resolvedRowName?.toLowerCase().trim() === displayClubName.toLowerCase().trim()) ||
          (r.id != null && state.club.id != null && String(r.id) === String(state.club.id))
        );
        if (isUserClub) {
          const rawGd = seasonData.gf - seasonData.ga;
          return {
            ...r,
            name: displayClubName,
            color: displayClubColor || resRow.color || r.color,
            isUser: true,
            pos: idx + 1,
            pts: seasonData.pts,
            w: seasonData.wins,
            d: seasonData.draws,
            l: seasonData.losses,
            gf: seasonData.gf,
            ga: seasonData.ga,
            gd: rawGd > 0 ? `+${rawGd}` : `${rawGd}`,
            logo: effectiveModActive ? (resRow.logo || (r.id ? (clubsDb || ALL_CLUBS).find(c => c.id === r.id)?.logo : undefined)) : displayClubLogo
          };
        }
        return {
          ...r,
          name: resolvedRowName,
          color: resRow.color || r.color,
          pos: idx + 1,
          isUser: false,
          isRival: Boolean(!seasonData.rivalData?.isPaused && (r.isRival || (resolvedRivalTargetName && resolvedRowName === resolvedRivalTargetName) || (seasonData.rivalData?.name && r.name === seasonData.rivalData.name))),
          logo: effectiveModActive ? (resRow.logo || (r.id ? (clubsDb || ALL_CLUBS).find(c => c.id === r.id)?.logo : undefined)) : undefined
        };
      });
      mappedRows.sort((a: any, b: any) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        const aGd = parseInt(String(a.gd ?? 0), 10) || 0;
        const bGd = parseInt(String(b.gd ?? 0), 10) || 0;
        return bGd - aGd;
      });
      mappedRows.forEach((r: any, idx: number) => {
        r.pos = idx + 1;
      });
      return mappedRows;
    }

    const peers = resolveDivisionClubs({
      clubsDb: sanitizedClubsDb,
      country: currentCountry,
      tier: currentTier,
      year: seasonData.year || state.year || 2026,
      userClub: state.club,
      excludeUserClub: true,
      isModActive: effectiveModActive,
      rivalClub: state.currentRival,
    });

    const rows = buildDeterministicDivisionTable({
      year: seasonData.year || state.year || 2026,
      country: currentCountry,
      tier: currentTier,
      playedMatchdays: 34,
      totalMatchdays: 34,
      userClub: {
        ...state.club,
        name: displayClubName,
        color: displayClubColor,
        logo: displayClubLogo,
      },
      userInTier: true,
      peers,
      userOverrideFinal: {
        pos: Math.max(1, Math.min(targetTotalClubs, userPos || 1)),
        w: userWins,
        d: userDraws,
        l: userLosses,
        gf: userGf,
        ga: userGa,
        pts: userPts,
        pointsDeducted: seasonData.pointsDeducted,
      },
      rivalClub: seasonData.rivalData?.isPaused ? undefined : state.currentRival,
      userPointsDeducted: seasonData.pointsDeducted || 0,
      isModActive: effectiveModActive,
    });

    if (seasonData.rivalData && !seasonData.rivalData.isPaused) {
      const rivalPos =
        rows.findIndex(
          (r) =>
            !r.isUser &&
            (r.isRival ||
              r.name?.toLowerCase().trim() === seasonData.rivalData?.name?.toLowerCase().trim())
        ) + 1;
      if (rivalPos >= 1 && rivalPos <= 18) {
        rows[rivalPos - 1] = { ...rows[rivalPos - 1], isRival: true };
      }
    }

    return rows.map((r) => ({
      ...r,
      logo: effectiveModActive
        ? r.isUser
          ? displayClubLogo
          : r.logo || (r.id ? sanitizedClubsDb.find((c) => c.id === r.id)?.logo : undefined)
        : r.isUser
        ? displayClubLogo
        : undefined,
    }));
  }, [seasonData, country, league, clubsDb, state.club, state.currentRival, state.seasonStandingsArchive, state.year, effectiveModActive, displayClubName, displayClubColor, displayClubLogo]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const elem = cardRef.current;
    if (!elem) return;

    let originalOverflow = '';
    let originalMaxHeight = '';
    let originalHeight = '';

    try {
      setIsDownloading(true);

      // Temporarily expand scrollable container so htmlToImage renders the complete content without cropping or blank canvases
      originalOverflow = elem.style.overflow;
      originalMaxHeight = elem.style.maxHeight;
      originalHeight = elem.style.height;

      elem.classList.remove('overflow-y-auto', 'overscroll-contain');
      elem.style.overflow = 'visible';
      elem.style.maxHeight = 'none';
      elem.style.height = 'auto';

      const blob = await htmlToImage.toBlob(elem, {
        quality: 1.0,
        backgroundColor: '#F5F3EE',
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
        filter: (node) => node.tagName !== 'BUTTON' && node.tagName !== 'NAV'
      });
      if (!blob) return;

      const filename = `season-${seasonData.year}-${displayClubName.replace(/\s+/g, '-').toLowerCase()}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `${displayClubName} Season ${seasonData.year}`,
            files: [file]
          });
          return;
        } catch {
          // fallback
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.warn('Failed to export season wrap card', err);
    } finally {
      if (elem) {
        elem.classList.add('overflow-y-auto', 'overscroll-contain');
        elem.style.overflow = originalOverflow;
        elem.style.maxHeight = originalMaxHeight;
        elem.style.height = originalHeight;
      }
      setIsDownloading(false);
    }
  };

  // Living Universe & World Football Movements
  const universeMovementsList = useMemo(() => {
    const all = getAllUniverseMovements(state, clubsDb || ALL_CLUBS, isModActive);
    const yearMoves = all.filter(m => m.year === seasonData.year);
    return yearMoves.length > 0 ? yearMoves : all.slice(0, 30);
  }, [state, clubsDb, isModActive, seasonData.year]);

  const continentalChampions = useMemo(() => {
    return universeMovementsList.filter(m => m.type === 'cup_champion');
  }, [universeMovementsList]);

  const leagueChampions = useMemo(() => {
    return universeMovementsList.filter(m => 
      m.type === 'title_won' || 
      (m.pos === 1 && m.type !== 'cup_champion' && m.type !== 'insolvency_drop') ||
      (typeof m.reason === 'string' && /(?:^|\b)(?:champion|meister|league title)(?:\b|$)/i.test(m.reason) && m.type !== 'cup_champion')
    );
  }, [universeMovementsList]);

  const promotionsList = useMemo(() => {
    return universeMovementsList.filter(m => m.type === 'promotion');
  }, [universeMovementsList]);

  const relegationsList = useMemo(() => {
    return universeMovementsList.filter(m => 
      m.type === 'relegation' && 
      m.pos !== 1 && 
      !(typeof m.reason === 'string' && /(?:^|\b)(?:champion|meister|winner|trophy|glory|triumph)(?:\b|$)/i.test(m.reason))
    );
  }, [universeMovementsList]);

  const fallenGiantsList = useMemo(() => {
    return universeMovementsList.filter(m => m.type === 'insolvency_drop');
  }, [universeMovementsList]);

  const transferSagasList = useMemo(() => {
    return universeMovementsList.filter(m => m.type === 'transfer_saga');
  }, [universeMovementsList]);

  // Outcome banner styles (100% English - Warm Editorial Daylight)
  const outcomeBanner = useMemo(() => {
    if (isChamp) {
      return {
        badge: 'CHAMPIONS',
        tagline: 'Champions & League Glory',
        color: 'from-amber-50 via-amber-50/40 to-white',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: 'fa-crown',
        pillBg: 'bg-amber-400 text-[#18191F] shadow-sm'
      };
    }
    if (isPromoted) {
      return {
        badge: 'PROMOTION ACHIEVED',
        tagline: `Promoted to ${nextLeague.name}!`,
        color: 'from-emerald-50 via-emerald-50/40 to-white',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        icon: 'fa-arrow-trend-up',
        pillBg: 'bg-emerald-600 text-white shadow-sm'
      };
    }
    if (seasonData.isSackedRelegation) {
      return {
        badge: 'MANAGER SACKED',
        tagline: isTier1Only
          ? `Contract Terminated · Bottom-3 Finish (No Relegation · Shields Ineffective)`
          : `Contract Terminated · Bottom-Tier Relegation Sacking`,
        color: 'from-rose-50 via-rose-50/40 to-white',
        border: 'border-rose-200',
        text: 'text-rose-700',
        icon: 'fa-triangle-exclamation',
        pillBg: 'bg-rose-600 text-white shadow-sm'
      };
    }
    if (isRelegated) {
      return {
        badge: 'RELEGATION',
        tagline: `Relegated to ${nextLeague.name}`,
        color: 'from-rose-50 via-rose-50/40 to-white',
        border: 'border-rose-200',
        text: 'text-rose-700',
        icon: 'fa-arrow-trend-down',
        pillBg: 'bg-rose-600 text-white shadow-sm'
      };
    }
    if (seasonData.tier === 1 && seasonData.pos <= 4) {
      return {
        badge: 'CONTINENTAL QUALIFIED',
        tagline: 'Elite Continental Stage Secured',
        color: 'from-sky-50 via-sky-50/40 to-white',
        border: 'border-sky-200',
        text: 'text-sky-700',
        icon: 'fa-star',
        pillBg: 'bg-sky-600 text-white'
      };
    }
    return {
      badge: `FINISH #${seasonData.pos}`,
      tagline: `Season completed in ${league.name}`,
      color: 'from-[#FAF9F6] to-white',
      border: 'border-[#E6E3DC]',
      text: 'text-[#18191F]',
      icon: 'fa-flag-checkered',
      pillBg: 'bg-[#18191F] text-white'
    };
  }, [isChamp, isPromoted, isRelegated, isTier1Only, seasonData, nextLeague, league]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-1.5 sm:p-4 md:p-6 bg-[#18191F]/50 backdrop-blur-sm overflow-y-auto overscroll-contain"
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl xl:max-w-6xl bg-white rounded-[24px] sm:rounded-[32px] border border-[#E6E3DC] shadow-[0_24px_60px_rgba(24,25,31,0.16)] flex flex-col h-[94dvh] sm:h-auto max-h-[94dvh] sm:max-h-[88vh] min-h-0 my-auto overflow-hidden relative shrink-0 text-[#18191F]"
      >
        {/* TOP BRANDING & OUTCOME HEADER */}
        <div className="relative px-3.5 py-2.5 sm:p-5 border-b border-[#E6E3DC] bg-[#FAF9F6] overflow-hidden shrink-0">
          {/* Compact Single-Line Header shown only on mobile table/world views for zero micro-scroll */}
          {(activeTab === 'table' || activeTab === 'world') && (
            <div className="flex sm:hidden items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2 min-w-0">
                <ClubLogo
                  name={displayClubName}
                  id={state.club.id}
                  color={displayClubColor}
                  logo={displayClubLogo}
                  fallbackLogo={displayClubFallbackLogo}
                  isModActive={effectiveModActive}
                  className="w-6 h-6 object-contain shrink-0"
                  fallbackClassName="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-[10px]"
                />
                <span className="text-sm font-bold text-[#18191F] truncate">{displayClubName}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold tabular-nums shrink-0 text-[#4B5563]">
                <span className={outcomeBanner.text}>#{seasonData.pos}</span>
                <span>·</span>
                <span className="text-[#18191F] font-bold">{seasonData.pts} pts</span>
              </div>
            </div>
          )}

          <div className={`relative z-10 ${(activeTab === 'table' || activeTab === 'world') ? 'hidden sm:flex' : 'flex'} flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4`}>
            {/* Club Identity & Outcome */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-center shrink-0 shadow-xs p-2 relative">
                <ClubLogo
                  name={displayClubName}
                  id={state.club.id}
                  color={displayClubColor}
                  logo={displayClubLogo}
                  fallbackLogo={displayClubFallbackLogo}
                  isModActive={effectiveModActive}
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                  fallbackClassName="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-white text-base"
                />
                {isChamp && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-[#18191F] flex items-center justify-center text-[10px] shadow-sm font-bold border border-white">
                    <i className="fas fa-crown"></i>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Season Wrap-Up · {seasonData.year}
                  </span>
                  <span className="text-[#D1CEC6]">•</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-sky-700 uppercase tracking-wide">
                    {league.name}
                  </span>
                </div>

                <h1 className="text-lg sm:text-2xl font-bold text-[#18191F] break-words leading-tight tracking-tight">
                  {displayClubName}
                </h1>

                <div className="flex flex-wrap items-center gap-2 mt-0.5 sm:mt-1">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${outcomeBanner.text}`}>
                    <i className={`fas ${outcomeBanner.icon} text-[10px]`}></i>
                    {outcomeBanner.badge}
                  </span>
                  <span className="text-[#D1CEC6] hidden sm:inline">·</span>
                  <span className="text-xs text-[#4B5563] font-normal hidden sm:inline truncate">
                    {outcomeBanner.tagline}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Record Ribbon */}
            <div className="flex items-center gap-2 sm:gap-3 bg-white border border-[#E6E3DC] rounded-2xl p-2 sm:p-3 self-start md:self-auto shrink-0 shadow-xs">
              <div className="text-center px-2">
                <div className="text-[9px] uppercase font-semibold text-[#6B7280] tracking-wider">Pts</div>
                <div className="text-base sm:text-lg font-bold text-amber-700 tabular-nums">{seasonData.pts}</div>
              </div>
              <div className="w-px h-6 bg-[#E6E3DC]" />
              <div className="text-center px-2">
                <div className="text-[9px] uppercase font-semibold text-[#6B7280] tracking-wider">W-D-L</div>
                <div className="text-xs sm:text-sm font-semibold text-[#18191F] tabular-nums">
                  <span className="text-emerald-700">{seasonData.wins}</span>-
                  <span className="text-[#4B5563]">{seasonData.draws}</span>-
                  <span className="text-rose-700">{seasonData.losses}</span>
                </div>
              </div>
              <div className="w-px h-6 bg-[#E6E3DC]" />
              <div className="text-center px-2">
                <div className="text-[9px] uppercase font-semibold text-[#6B7280] tracking-wider">GD</div>
                <div className={`text-xs sm:text-sm font-semibold tabular-nums ${goalDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                </div>
              </div>
              {trophyList.length > 0 && (
                <>
                  <div className="w-px h-6 bg-[#E6E3DC]" />
                  <div className="text-center px-2">
                    <div className="text-[9px] uppercase font-semibold text-amber-700 tracking-wider">Trophies</div>
                    <div className="text-sm sm:text-base font-bold text-amber-700 flex items-center justify-center gap-1 tabular-nums">
                      <span>{trophyList.length}</span>
                      <span className="text-xs">🏆</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 4 Clean Segmented Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-[#E6E3DC] overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => switchTab('overview')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-[#18191F] text-white shadow-xs'
                  : 'bg-white text-[#4B5563] hover:text-[#18191F] hover:bg-[#EFECE4] border border-[#E6E3DC]'
              }`}
            >
              <i className="fa-solid fa-compass text-[10px]"></i>
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('squad')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'squad'
                  ? 'bg-[#18191F] text-white shadow-xs'
                  : 'bg-white text-[#4B5563] hover:text-[#18191F] hover:bg-[#EFECE4] border border-[#E6E3DC]'
              }`}
            >
              <i className="fa-solid fa-users text-[10px]"></i>
              <span>Club & Squad</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('table')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'table'
                  ? 'bg-[#18191F] text-white shadow-xs'
                  : 'bg-white text-[#4B5563] hover:text-[#18191F] hover:bg-[#EFECE4] border border-[#E6E3DC]'
              }`}
            >
              <i className="fa-solid fa-table text-[10px]"></i>
              <span>League Table</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('world')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'world'
                  ? 'bg-[#18191F] text-white shadow-xs'
                  : 'bg-white text-[#4B5563] hover:text-[#18191F] hover:bg-[#EFECE4] border border-[#E6E3DC]'
              }`}
            >
              <i className="fa-solid fa-earth-americas text-[10px]"></i>
              <span>World Digest</span>
            </button>
          </div>
        </div>

        {/* SCROLLABLE BENTO BODY */}
        <div ref={cardRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-6 custom-scrollbar bg-[#F5F3EE]/60">
          <div className="space-y-4 sm:space-y-6">
            {/* Top 3 Global Leaderboard Milestone Banner */}
            {isTop3Leaderboard && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 text-xl font-bold">
                    🏆
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      Top 3 Global Leaderboard!
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[#18191F] mt-0.5">
                      Historic achievement! Rank #{top3Rank} globally with {(state.careerScore || 0).toLocaleString()} pts!
                    </div>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-amber-800 px-3 py-1 bg-white rounded-xl border border-amber-200 tabular-nums shadow-xs">
                  #{top3Rank}
                </div>
              </div>
            )}

            {/* Grand League Champions & Multi-Trophy Celebration Banner */}
            {activeTab === 'overview' && (isChamp || trophyList.length > 0) && (
              <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-[#FFFDF7] to-amber-50/70 border border-amber-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
                  {/* Visual Trophies Display */}
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 bg-white border border-amber-200 rounded-2xl shadow-xs shrink-0">
                    {trophyList.length > 0 ? (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {trophyList.map((tr, i) => (
                          <div key={i} className="transform hover:scale-110 transition-transform" title={tr.name}>
                            <PrestigeTrophy
                              type={tr.type}
                              size={trophyList.length >= 4 ? 40 : trophyList.length > 1 ? 48 : 56}
                              showStars={false}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-3xl">🏆</span>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-800 flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                      <span>★</span>
                      <span>
                        {trophyList.length >= 6
                          ? 'HISTORIC SEXTUPLE WINNERS'
                          : trophyList.length === 5
                          ? 'HISTORIC QUINTUPLE WINNERS'
                          : trophyList.length === 4
                          ? 'HISTORIC QUADRUPLE WINNERS'
                          : trophyList.length === 3
                          ? 'HISTORIC TREBLE WINNERS'
                          : trophyList.length === 2
                          ? (isChamp ? 'DOMESTIC DOUBLE WINNERS' : 'CUP DOUBLE WINNERS')
                          : isChamp
                          ? (country === 'ECU' ? 'LigaPro Serie A Champion' : `${league.name} Champion`)
                          : (trophyList[0]?.badge || 'Cup Champions').toUpperCase()}
                      </span>
                      <span>★</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#18191F] tracking-tight">
                      {trophyList.length >= 6
                        ? 'HISTORIC SEXTUPLE GLORY!'
                        : trophyList.length === 5
                        ? 'HISTORIC QUINTUPLE GLORY!'
                        : trophyList.length === 4
                        ? 'HISTORIC QUADRUPLE GLORY!'
                        : trophyList.length === 3
                        ? 'HISTORIC TREBLE GLORY!'
                        : trophyList.length === 2
                        ? (isChamp ? 'DOMESTIC DOUBLE GLORY!' : 'CUP DOUBLE GLORY!')
                        : isChamp
                        ? (country === 'ECU' ? 'CAMPEÓN NACIONAL DEL ECUADOR!' : 'LEAGUE TITLE GLORY!')
                        : `${(trophyList[0]?.name || 'Cup').toUpperCase()} GLORY!`}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-lg font-medium leading-relaxed">
                      {trophyList.length > 1
                        ? `Historic multi-trophy triumph! ${displayClubName} lifts ${trophyList.map(t => t.name).join(' & ')} in an extraordinary campaign!`
                        : isChamp
                        ? `Historic triumph! ${displayClubName} lifts the championship trophy after dominating the season with ${seasonData.pts} points!`
                        : ['cl', 'el', 'ecl', 'cwc'].includes(trophyList[0]?.type || '')
                        ? `Historic continental triumph! ${displayClubName} conquers the ${trophyList[0]?.name || 'continental cup'} to claim the crown!`
                        : `Historic cup triumph! ${displayClubName} lifts the ${trophyList[0]?.name || 'cup'} trophy!`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-center gap-1.5 shrink-0 relative z-10">
                  <span className="text-xs uppercase font-bold tracking-wider px-3.5 py-1 rounded-full bg-amber-400 text-[#18191F] shadow-xs">
                    {trophyList.length >= 6
                      ? 'Sextuple'
                      : trophyList.length === 5
                      ? 'Quintuple'
                      : trophyList.length === 4
                      ? 'Quadruple'
                      : trophyList.length === 3
                      ? 'Treble'
                      : trophyList.length === 2
                      ? 'Double'
                      : isChamp
                      ? '1st Place'
                      : 'Winners'}
                  </span>
                  <span className="text-[11px] text-amber-800 font-semibold tabular-nums mt-0.5">
                    +{formatMoney(getLeagueScaledVal(1, trophyList.length >= 6 ? 30000 : trophyList.length === 5 ? 25000 : trophyList.length === 4 ? 20000 : 15000, country))} Prize
                  </span>
                </div>
              </div>
            )}

            {/* ================= 1. OVERVIEW: POSITION, TROPHIES, BOARD & DYNASTY ================= */}
            {activeTab === 'overview' && (
              <div id="section-exec" className="space-y-4 scroll-mt-6">
                {/* Silverware & Trophy Cabinet (Featured directly in Executive Summary whenever trophies are won!) */}
                {trophyList.length > 0 && (
                  <div className="bg-white border border-amber-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E3DC] pb-3 mb-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-amber-700 flex items-center gap-1.5">
                          <i className="fa-solid fa-crown text-amber-600 text-xs"></i>
                          <span>
                            {trophyList.length >= 6
                              ? 'Historic Sextuple / Multiple Honours'
                              : trophyList.length === 5
                              ? 'Historic Quintuple / Multiple Honours'
                              : trophyList.length === 4
                              ? 'Historic Quadruple / Multiple Honours'
                              : trophyList.length === 3
                              ? 'Historic Treble / Multiple Honours'
                              : trophyList.length === 2
                              ? 'Domestic / Continental Double'
                              : trophyList[0]?.badge || (isChamp ? 'Championship Honour' : 'Season Trophy Honour')}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-[#18191F] tracking-tight mt-0.5">
                          {trophyList.length === 1
                            ? `1 Trophy Lifted This Season · ${trophyList[0]?.name || 'Champion'}`
                            : `${trophyList.length} Trophies Lifted This Season!`}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {trophyList.length >= 6
                            ? 'Sextuple Winners'
                            : trophyList.length === 5
                            ? 'Quintuple Winners'
                            : trophyList.length === 4
                            ? 'Quadruple Winners'
                            : trophyList.length === 3
                            ? 'Treble Winners'
                            : trophyList.length === 2
                            ? 'Double Winners'
                            : 'Champions'}
                        </span>
                      </div>
                    </div>

                    {/* Trophy Display Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {trophyList.map((tr, idx) => (
                        <div
                          key={idx}
                          className="bg-[#FAF9F6] hover:bg-amber-50/60 border border-[#E6E3DC] rounded-2xl p-3.5 flex flex-col items-center justify-between text-center transition-all shadow-xs group"
                        >
                          <div className="py-2 transform group-hover:scale-105 transition-transform">
                            <PrestigeTrophy type={tr.type} size={64} showStars={false} />
                          </div>
                          <div className="mt-2 w-full">
                            <div className="text-[9px] uppercase font-semibold tracking-wider text-amber-700 truncate">
                              {tr.badge || 'Silverware'}
                            </div>
                            <div className="text-xs font-bold text-[#18191F] tracking-tight truncate mt-0.5" title={tr.name}>
                              {tr.name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promotion Showcase Card (Prominently featured exclusively in Executive Summary for Promoted Clubs) */}
                {isPromoted && !isChamp && (
                  <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 border border-emerald-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/70 pb-4 mb-4 relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className="flex items-center justify-center p-2.5 bg-white border border-emerald-200 rounded-2xl shadow-xs shrink-0">
                          <PrestigeTrophy type="promotion" size={44} showStars={false} />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 flex items-center gap-1.5 mb-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                            <i className="fa-solid fa-arrow-trend-up text-xs text-emerald-700"></i>
                            <span>{seasonData.pos === 2 ? t('Runner-Up Promotion', 'Vizemeister-Aufstieg') : t('Promotion Achieved', 'Aufstieg gesichert')}</span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-[#18191F] tracking-tight">
                            {t(`Promotion Secured! Ascending to ${nextLeague.name}`, `Aufstieg geschafft! Aufstieg in die ${nextLeague.name}`)}
                          </h3>
                          <p className="text-xs text-[#4B5563] mt-1 max-w-xl leading-relaxed">
                            {`${state.club.name} finishes #${seasonData.pos} in ${league.name} and secures promotion to ${nextLeague.name} (Tier ${nextTier})!`}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0">
                        <span className="text-xs uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-600 text-white shadow-xs">
                          {seasonData.pos === 2 ? t('Runner-Up · Promoted', 'Vizemeister · Aufsteiger') : t('Promotion Secured', 'Aufstieg gesichert')}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          Tier {seasonData.tier} ➔ Tier {nextTier}
                        </span>
                      </div>
                    </div>

                    {/* Key Promotion Parameters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
                      <div className="bg-white border border-emerald-200/80 rounded-xl p-3 text-center">
                        <div className="text-[10px] text-[#6B7280] uppercase font-semibold">New Division</div>
                        <div className="text-xs sm:text-sm font-bold text-[#18191F] truncate mt-0.5">{nextLeague.name}</div>
                      </div>
                      <div className="bg-white border border-emerald-200/80 rounded-xl p-3 text-center">
                        <div className="text-[10px] text-[#6B7280] uppercase font-semibold">New Tier Level</div>
                        <div className="text-xs sm:text-sm font-bold text-sky-700 mt-0.5">Tier {nextTier}</div>
                      </div>
                      <div className="bg-white border border-emerald-200/80 rounded-xl p-3 text-center">
                        <div className="text-[10px] text-[#6B7280] uppercase font-semibold">Avg League OVR</div>
                        <div className="text-xs sm:text-sm font-bold text-amber-700 font-mono mt-0.5">{nextLeague.avgOvr || 70} OVR</div>
                      </div>
                      <div className="bg-white border border-emerald-200/80 rounded-xl p-3 text-center">
                        <div className="text-[10px] text-[#6B7280] uppercase font-semibold">Next Season Target</div>
                        <div className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">Top {state.boardTargetFinish || 15} Mandate</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compact Twin Bento: Position & Board Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Position KPI Tile */}
                  <div 
                    onClick={() => {
                      switchTab('table');
                    }}
                    className="bg-white hover:bg-[#FAF9F6] border border-[#E6E3DC] hover:border-sky-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[#6B7280] mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">Final Position</span>
                        <span className="text-[11px] text-sky-700 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Standings & Table</span>
                          <i className="fa-solid fa-arrow-right text-[9px]"></i>
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-[#18191F] tracking-tight tabular-nums">
                        #{seasonData.pos} <span className="text-xs text-[#6B7280] font-sans font-normal">in {league.name}</span>
                      </div>
                      <div className="text-xs text-[#4B5563] mt-1.5 tabular-nums">
                        {seasonData.pts} Pts · {seasonData.wins}W-{seasonData.draws}D-{seasonData.losses}L ({seasonData.gf}:{seasonData.ga})
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E6E3DC] text-xs flex items-center justify-between text-[#6B7280]">
                      <span>Target: Top {state.boardTargetFinish || 15}</span>
                      <span className={`font-semibold tabular-nums ${seasonData.pos <= (state.boardTargetFinish || 15) ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {seasonData.pos <= (state.boardTargetFinish || 15) ? 'Target Met ✓' : 'Target Missed ✗'}
                      </span>
                    </div>
                  </div>

                  {/* Board Trust & Mandate Tile */}
                  <div 
                    onClick={() => scrollToSection('board', 'section-board')}
                    className="bg-white hover:bg-[#FAF9F6] border border-[#E6E3DC] hover:border-sky-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[#6B7280] mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">Board Status & Trust</span>
                        <span className="text-[11px] text-sky-700 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Board Review</span>
                          <i className="fa-solid fa-arrow-right text-[9px]"></i>
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl sm:text-3xl font-bold text-[#18191F] tabular-nums">
                          {state.clubImpactScore ?? 50}<span className="text-sm text-[#6B7280] font-normal">/100</span>
                        </span>
                        <span className={`text-xs font-semibold ${
                          (state.clubImpactScore ?? 50) >= 70 ? 'text-emerald-700' : (state.clubImpactScore ?? 50) >= 40 ? 'text-sky-700' : 'text-rose-700'
                        }`}>
                          {(state.clubImpactScore ?? 50) >= 70 ? 'Untouchable' : (state.clubImpactScore ?? 50) >= 40 ? 'Stable Standing' : 'Under Pressure'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EAE7E0] rounded-full overflow-hidden mt-3">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            (state.clubImpactScore ?? 50) >= 70 ? 'bg-emerald-600' : (state.clubImpactScore ?? 50) >= 40 ? 'bg-sky-600' : 'bg-rose-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, state.clubImpactScore ?? 50))}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E6E3DC] text-xs flex items-center justify-between text-[#6B7280]">
                      <span>Shields: <strong className="text-[#18191F] tabular-nums">{state.immunityShields ?? 0}</strong></span>
                      <span>Next Mandate: <strong className="text-[#18191F]">Top {state.boardTargetFinish || 15}</strong></span>
                    </div>
                  </div>
                </div>

                {/* ================= STRATEGIC INTELLIGENCE & DYNASTY RADAR ================= */}
                <div className="space-y-3 pt-2">
                  {/* Press & Board Pressure Verdict Card */}
                  {seasonData.pressureVerdict && (() => {
                    const pv = seasonData.pressureVerdict;
                    const toneStyles =
                      pv.tone === 'crisis'
                        ? 'bg-rose-50/70 border-rose-200'
                        : pv.tone === 'warning'
                        ? 'bg-amber-50/70 border-amber-200'
                        : pv.tone === 'triumph'
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-sky-50/60 border-sky-200';
                    const badgeColor =
                      pv.tone === 'crisis'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : pv.tone === 'warning'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : pv.tone === 'triumph'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-sky-100 text-sky-800 border-sky-200';
                    return (
                      <div className={`${toneStyles} border rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-3`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                              {pv.badge}
                            </span>
                            <span className="text-[11px] font-semibold text-[#4B5563] tabular-nums">
                              Media Heat: {pv.pressureBefore}% ➔ {pv.pressureAfter}%
                            </span>
                          </div>
                          {((pv.boardTrustBonus ?? 0) !== 0 || (pv.repBonus ?? 0) !== 0) && (
                            <span className={`text-[11px] font-bold tabular-nums ${(pv.boardTrustBonus ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              Trust {(pv.boardTrustBonus ?? 0) >= 0 ? `+${pv.boardTrustBonus}` : pv.boardTrustBonus}
                              {(pv.repBonus ?? 0) !== 0 ? ` · Rep ${(pv.repBonus ?? 0) >= 0 ? `+${pv.repBonus}` : pv.repBonus}` : ''}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-[#18191F] leading-snug">{pv.headline}</h4>
                          <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">{pv.summary}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div className="bg-white border border-[#E6E3DC] rounded-xl p-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                              Press on Coaching Bench
                            </div>
                            <p className="text-[11px] text-[#4B5563] leading-relaxed">{pv.coachVerdict}</p>
                          </div>
                          <div className="bg-white border border-[#E6E3DC] rounded-xl p-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-1">
                              Press on Sporting Director
                            </div>
                            <p className="text-[11px] text-[#4B5563] leading-relaxed">{pv.gmVerdict}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Head Coach Poached / Departed Alert */}
                  {seasonData.coachDepartureAlert && (
                    <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 text-sm shrink-0">
                          <i className="fa-solid fa-person-walking-dashed-line-arrow-right"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase font-bold text-rose-700 flex items-center gap-2 flex-wrap">
                            <span>
                              {seasonData.coachDepartureAlert.isPoached
                                ? 'Breaking: Head Coach Poached (Release Clause Triggered)'
                                : 'Breaking: Head Coach Resigned'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-[9px] text-rose-700">
                              {seasonData.coachDepartureAlert.ovrBoost >= 0 ? `-${seasonData.coachDepartureAlert.ovrBoost}` : `+${Math.abs(seasonData.coachDepartureAlert.ovrBoost)}`} OVR Impact
                            </span>
                          </div>
                          <p className="text-xs text-[#4B5563] mt-0.5 leading-relaxed">
                            <strong className="text-[#18191F]">{seasonData.coachDepartureAlert.coachName}</strong> ({seasonData.coachDepartureAlert.style}, {seasonData.coachDepartureAlert.ovrBoost >= 0 ? `+${seasonData.coachDepartureAlert.ovrBoost}` : seasonData.coachDepartureAlert.ovrBoost} OVR) departed at the end of the campaign due to {seasonData.coachDepartureAlert.reason}. Appoint a replacement in the Staff Market before next season!
                          </p>
                        </div>
                      </div>
                      {seasonData.coachDepartureAlert.isPoached && seasonData.coachDepartureAlert.buyoutFeeK > 0 && (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shrink-0 self-start sm:self-center">
                          +{formatMoney(seasonData.coachDepartureAlert.buyoutFeeK)} Buyout
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Tactical Staleness Warning */}
                  {isStaleActive && (
                    <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 text-sm shrink-0">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase font-bold text-rose-700">Tactical Obsolescence · System Decoded</div>
                        <p className="text-xs text-[#4B5563] mt-0.5">
                          The league has decoded your tactic ({state.tactic})! You face {hasSystemicImmunity ? 'a cushioned' : 'an unavoidable'} <strong className="text-rose-700">-{hasSystemicImmunity ? 2 : 4} OVR penalty</strong> next season unless you reinvent or switch your philosophy in the Coach room (<span className="text-amber-700 font-semibold">-5 DP</span>).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Impending Tactical Staleness Warning (1 title away) */}
                  {isStaleWarning && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 text-sm shrink-0">
                        <i className="fa-solid fa-crosshairs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase font-bold text-amber-800">Tactical Surveillance Notice</div>
                        <p className="text-xs text-[#4B5563] mt-0.5">
                          Back-to-back league titles with {state.tactic} have drawn heavy scrutiny; winning again triggers Tactical Obsolescence (-4 OVR penalty).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Diverse Rival Challenger Storyline (Only shown in seasons when a challenger event triggers) */}
                  {superVillainClub && rivalChallengerEvent && (
                    <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-indigo-200 flex items-center justify-center p-1.5 shrink-0">
                          <ClubLogo name={superVillainClub.name} club={superVillainClub} isModActive={effectiveModActive} size={28} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase font-bold text-indigo-700">
                            {rivalChallengerEvent.badge || 'League Challenger · Title Threat'}
                          </div>
                          <p className="text-xs text-[#4B5563] mt-0.5 truncate sm:whitespace-normal">
                            {(effectiveModActive ? rivalChallengerEvent.desc : undefined) || `${superVillainClub.name} (${superVillainClub.baseOvr} OVR) has mounted a major title challenge for next season.`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-200">
                          {rivalChallengerEvent.clubOvr || superVillainClub.baseOvr} OVR
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dynasty Target on the Back (When consecutiveTitles >= 2) */}
                  {consecutiveTitles >= 2 && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 text-sm shrink-0">
                          <i className="fa-solid fa-crown"></i>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase font-bold text-amber-800">Dynasty Target · {consecutiveTitles}x Consecutive Champion</div>
                          <p className="text-xs text-[#4B5563] mt-0.5 truncate sm:whitespace-normal">
                            The entire continent is gunned to knock you off the summit; opponents treat every clash against you as their cup final.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-white px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                        {consecutiveTitles}x Champion
                      </span>
                    </div>
                  )}

                  {/* Sacking Resolution Banner if Sacked */}
                  {(seasonData.isSackedRelegation || seasonData.isSacked) && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 text-base shrink-0">
                          <i className="fas fa-triangle-exclamation"></i>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold tracking-wider text-rose-700">Board Resolution</div>
                          <div className="text-base font-bold text-[#18191F]">Managerial Contract Terminated</div>
                        </div>
                      </div>
                      <p className="text-xs text-[#4B5563] leading-relaxed">
                        {isTier1Only
                          ? `Following a bottom-3 finish in ${league.name}, the Board of Directors has immediately dismissed management for sporting failure. Since this country has no lower tier, the club remains in the league, but managerial immunity shields offer no protection against bottom-tier collapse.`
                          : isBottomTier
                          ? `Following drop-zone failure in ${league.name}, the Board of Directors has immediately terminated your contract. With no lower league to absorb the fall, management has been relieved of duties.`
                          : `Following the conclusion of the campaign, the Board of Directors has officially relieved management of sporting duties.`}
                      </p>
                    </div>
                  )}

                  {/* Arch Rival Derby Record */}
                  {seasonData.rivalData && (
                    <div className="bg-white rounded-2xl p-4 border border-[#E6E3DC] shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] uppercase font-semibold tracking-wider text-rose-700 flex items-center gap-1.5">
                          <i className="fas fa-fire text-rose-600"></i>
                          <span>Arch Rival Derby · {seasonData.rivalData.name}</span>
                        </div>
                        {seasonData.rivalData.isPaused && (
                          <span className="text-[9px] uppercase font-semibold text-[#6B7280] bg-[#FAF9F6] border border-[#E6E3DC] px-2 py-0.5 rounded-full">
                            Paused
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC]">
                          <span className="text-[9px] text-[#6B7280] uppercase block">This Season</span>
                          <span className="font-bold text-emerald-700">{seasonData.rivalData.wins}W</span>{' '}
                          <span className="text-[#9CA3AF]">·</span>{' '}
                          <span className="font-bold text-[#4B5563]">{seasonData.rivalData.draws}D</span>{' '}
                          <span className="text-[#9CA3AF]">·</span>{' '}
                          <span className="font-bold text-rose-700">{seasonData.rivalData.losses}L</span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC]">
                          <span className="text-[9px] text-[#6B7280] uppercase block">All-Time H2H</span>
                          <span className="font-bold text-emerald-700">{seasonData.rivalData.h2hWins}W</span>{' '}
                          <span className="text-[#9CA3AF]">·</span>{' '}
                          <span className="font-bold text-[#4B5563]">{seasonData.rivalData.h2hDraws}D</span>{' '}
                          <span className="text-[#9CA3AF]">·</span>{' '}
                          <span className="font-bold text-rose-700">{seasonData.rivalData.h2hLosses}L</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OVR Decay & Roster Audit Breakdown (if any deductions happened) */}
                  {decayReasons.length > 0 && (
                    <div className="bg-white border border-[#E6E3DC] rounded-2xl p-3.5 sm:p-4 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-rose-700 flex items-center gap-1.5">
                          <i className="fa-solid fa-arrow-trend-down text-rose-600 text-xs"></i>
                          <span>Off-Season OVR Audit & Attrition Breakdown</span>
                        </div>
                        <span className="text-xs text-[#4B5563] font-mono tabular-nums">
                          {seasonData.startOvr || state.club.baseOvr} ➔ {seasonData.newBaseOvr || state.club.baseOvr} OVR
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {decayReasons.map((reason, idx) => (
                          <div key={idx} className="bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1 text-xs text-rose-800 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= 3. LEAGUE TABLE: DIRECT INLINE STANDINGS ================= */}
            {activeTab === 'table' && (
              <div id="section-sporting" className="space-y-3 sm:space-y-4 scroll-mt-6">
                <div className="hidden sm:flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-sky-700 px-1">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-chart-line text-[11px]"></i>
                    {league.name} · Final Standings & Campaign Review
                  </span>
                  <span className="text-[10px] text-[#6B7280] font-mono">Matchday 34 Final Table</span>
                </div>

                {/* League Campaign Results (Hidden on mobile so full standings fit above the fold) */}
                <div className="hidden sm:block bg-white rounded-2xl sm:rounded-3xl p-5 border border-[#E6E3DC] shadow-xs">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] mb-1">
                    Campaign Summary
                  </div>
                  <h3 className="text-lg font-bold text-[#18191F] tracking-tight">
                    {league.name}
                  </h3>

                  {/* Primary Stats Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-[#FAF9F6] p-3 rounded-2xl border border-[#E6E3DC] my-3 text-center">
                    <div className="bg-white border border-[#E6E3DC] rounded-xl p-2">
                      <div className="text-[9px] text-[#6B7280] uppercase font-semibold">Position</div>
                      <div className="text-base sm:text-lg font-bold text-amber-700 tabular-nums">#{seasonData.pos}</div>
                    </div>
                    <div className="bg-white border border-[#E6E3DC] rounded-xl p-2">
                      <div className="text-[9px] text-[#6B7280] uppercase font-semibold">Points</div>
                      <div className="text-base sm:text-lg font-bold text-[#18191F] tabular-nums">{seasonData.pts}</div>
                    </div>
                    <div className="bg-white border border-[#E6E3DC] rounded-xl p-2">
                      <div className="text-[9px] text-[#6B7280] uppercase font-semibold">Wins</div>
                      <div className="text-base sm:text-lg font-bold text-emerald-700 tabular-nums">{seasonData.wins}</div>
                    </div>
                    <div className="bg-white border border-[#E6E3DC] rounded-xl p-2">
                      <div className="text-[9px] text-[#6B7280] uppercase font-semibold">Draws</div>
                      <div className="text-base sm:text-lg font-bold text-[#4B5563] tabular-nums">{seasonData.draws}</div>
                    </div>
                    <div className="bg-white border border-[#E6E3DC] rounded-xl p-2">
                      <div className="text-[9px] text-[#6B7280] uppercase font-semibold">Losses</div>
                      <div className="text-base sm:text-lg font-bold text-rose-700 tabular-nums">{seasonData.losses}</div>
                    </div>
                    <div className="bg-white border border-[#E6E3DC] rounded-xl p-2">
                      <div className="text-[9px] text-[#6B7280] uppercase font-semibold">Goals</div>
                      <div className="text-sm font-bold text-[#18191F] tabular-nums">
                        {seasonData.gf}:{seasonData.ga}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E6E3DC] flex items-center justify-between text-xs text-[#6B7280]">
                    <span>Goal Difference</span>
                    <span className={`tabular-nums font-semibold ${goalDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                    </span>
                  </div>
                </div>

                {/* Direct Full League Standings Table */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 border border-[#E6E3DC] shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-[#E6E3DC] mb-1.5 sm:mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 text-xs">
                        <i className="fa-solid fa-table-list"></i>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#18191F] tracking-tight">
                          {league.name} · Final Standings
                        </h4>
                        <span className="hidden sm:inline text-[10px] text-[#6B7280]">Matchday 34 Final Table</span>
                      </div>
                    </div>
                    <span className="sm:hidden text-[10px] text-[#6B7280] font-semibold tabular-nums">
                      {tableData.length} Clubs
                    </span>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <div className="w-full sm:min-w-[560px]">
                      {/* Table Header */}
                      <div className="flex items-center py-1.5 px-2 sm:px-3 text-[10px] uppercase font-semibold text-[#6B7280] bg-[#F6F5F1] rounded-t-xl border-b border-[#E6E3DC]">
                        <div className="w-7 sm:w-8 text-center shrink-0">#</div>
                        <div className="flex-1 px-1.5 sm:px-2">Club</div>
                        <div className="hidden sm:block w-9 text-center shrink-0">MP</div>
                        <div className="hidden sm:block w-8 text-center shrink-0 text-emerald-700">W</div>
                        <div className="hidden sm:block w-8 text-center shrink-0 text-[#4B5563]">D</div>
                        <div className="hidden sm:block w-8 text-center shrink-0 text-rose-700">L</div>
                        <div className="hidden sm:block w-14 text-center shrink-0">GF:GA</div>
                        <div className="w-9 sm:w-10 text-center shrink-0">GD</div>
                        <div className="w-10 sm:w-12 text-center shrink-0 font-bold text-[#18191F]">Pts</div>
                      </div>

                      {/* Table Rows */}
                      <div className="divide-y divide-[#EFECE4]">
                        {tableData.map((r, i) => {
                          const isTier1Only = getMaxTier(country, clubsDb) === 1;
                          const isBottomTier = seasonData.tier >= getMaxTier(country, clubsDb);
                          const isContinental = seasonData.tier === 1 && i < 4;
                          const isUserPromoted = r.isUser && seasonData.tier > 1 && (seasonData.pos <= 2 || nextTier < seasonData.tier);
                          const isUserChamp = r.isUser && seasonData.pos === 1;
                          const isPromo = (seasonData.tier > 1 && i < 2) || isUserPromoted;
                          const isPlayoff = !isUserPromoted && seasonData.tier > 1 && ((['ENG', 'ESP', 'ITA', 'USA', 'FRA', 'SCO'].includes(country) && i >= 2 && i < 6) || i === 2);
                          const numRelegationSpots = (country === 'TUR' && seasonData.tier === 3) ? 2 : 3;
                          const isManagerSackingZone = (isTier1Only || isBottomTier) && (i >= tableData.length - numRelegationSpots);
                          const isRelegationPlayoff = !isBottomTier && !isTier1Only && (i === tableData.length - numRelegationSpots);
                          const isDirectRelegation = !isBottomTier && !isTier1Only && (i > tableData.length - numRelegationSpots);

                          const rowBg = r.isUser
                            ? isUserChamp
                              ? 'bg-amber-50'
                              : isUserPromoted
                              ? 'bg-emerald-50'
                              : 'bg-sky-50'
                            : isContinental || isPromo
                            ? 'bg-emerald-50/50'
                            : isPlayoff || isRelegationPlayoff
                            ? 'bg-amber-50/45'
                            : isDirectRelegation || isManagerSackingZone
                            ? 'bg-rose-50/50'
                            : i % 2 === 0 ? 'bg-white' : 'bg-[#FAF9F6]';

                          return (
                            <div
                              key={`${r.name}-${r.pos}`}
                              className={`flex items-center py-1 sm:py-2 px-2 sm:px-3 transition-colors relative text-xs ${rowBg} ${r.isUser ? (isUserChamp ? 'border-l-4 border-l-amber-500' : isUserPromoted ? 'border-l-4 border-l-emerald-600' : 'border-l-4 border-l-sky-600') : isContinental ? 'border-l-2 border-l-emerald-500' : isPromo ? 'border-l-2 border-l-emerald-500' : isPlayoff ? 'border-l-2 border-l-amber-500' : isRelegationPlayoff ? 'border-l-2 border-l-amber-500' : isDirectRelegation ? 'border-l-2 border-l-rose-500' : isManagerSackingZone ? 'border-l-2 border-l-rose-600' : ''}`}
                            >
                              {/* Position */}
                              <div className={`w-7 sm:w-8 text-center font-bold tabular-nums shrink-0 ${
                                r.isUser ? (isUserChamp ? 'text-amber-700 font-black' : isUserPromoted ? 'text-emerald-700 font-extrabold' : 'text-sky-700') : isContinental ? 'text-emerald-700' : isPromo ? 'text-emerald-700' : isPlayoff ? 'text-amber-700' : isRelegationPlayoff ? 'text-amber-700 font-bold' : (isDirectRelegation || isManagerSackingZone) ? 'text-rose-700 font-extrabold' : 'text-[#6B7280]'
                              }`}>
                                {r.pos}
                              </div>

                              {/* Club Crest & Name */}
                              <div className="flex-1 flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 min-w-0 py-0.5">
                                <ClubLogo
                                  name={r.name}
                                  id={typeof r.id === 'number' ? r.id : undefined}
                                  color={r.color}
                                  logo={r.logo}
                                  isModActive={isModActive}
                                  className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0"
                                  fallbackClassName="w-4 h-4 sm:w-5 sm:h-5 text-[8px] rounded-md"
                                />
                                <span className={`truncate font-semibold text-xs py-0.5 leading-normal ${r.isUser ? 'text-[#18191F] font-extrabold' : 'text-[#18191F]'}`}>
                                  {r.name}
                                </span>

                                {r.isUser && (
                                  <span className="px-1.5 py-0.5 text-[8px] font-black bg-[#18191F] text-white rounded tracking-wider uppercase shrink-0">
                                    YOU
                                  </span>
                                )}

                                {r.isRival && (
                                  <span className="px-1.5 py-0.5 text-[8px] font-bold bg-rose-100 text-rose-800 border border-rose-200 rounded tracking-wider uppercase shrink-0">
                                    Rival ⚔️
                                  </span>
                                )}

                                {/* FM-style Outcome Badge (C / P / R) */}
                                {(() => {
                                  const badge = r.status || (
                                    r.pos === 1 ? 'C' :
                                    (r.isUser && isUserPromoted && !isUserChamp) ? 'P' :
                                    (!r.isUser && seasonData.tier > 1 && r.pos === 2 && !r.isReserve) ? 'P' :
                                    (!isBottomTier && !isTier1Only && isDirectRelegation) ? 'R' :
                                    undefined
                                  );
                                  if (!badge) return null;
                                  return (
                                    <span
                                      className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded tracking-wider shrink-0 ${
                                        badge === 'C'
                                          ? 'bg-amber-400 text-[#18191F]'
                                          : badge === 'P'
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-rose-600 text-white'
                                      }`}
                                      title={badge === 'C' ? (seasonData.tier > 1 ? 'Division Champion & Promoted' : 'League Champion') : badge === 'P' ? 'Promoted' : 'Relegated'}
                                    >
                                      {badge}
                                    </span>
                                  );
                                })()}
                              </div>

                              {/* Numbers */}
                              <div className="hidden sm:block w-9 text-center text-[#6B7280] tabular-nums shrink-0">{r.mp}</div>
                              <div className="hidden sm:block w-8 text-center text-emerald-700 font-semibold tabular-nums shrink-0">{r.w}</div>
                              <div className="hidden sm:block w-8 text-center text-[#4B5563] tabular-nums shrink-0">{r.d}</div>
                              <div className="hidden sm:block w-8 text-center text-rose-700 tabular-nums shrink-0">{r.l}</div>
                              <div className="hidden sm:block w-14 text-center text-[#4B5563] tabular-nums shrink-0">{r.gf}:{r.ga}</div>
                              {(() => {
                                const gdStr = String(r.gd ?? '0');
                                const isPosGd = gdStr.startsWith('+') || (typeof r.gd === 'number' && r.gd > 0);
                                const isNegGd = gdStr.startsWith('-') || (typeof r.gd === 'number' && r.gd < 0);
                                const gdDisplay = (typeof r.gd === 'number' && r.gd > 0) ? `+${r.gd}` : gdStr;
                                return (
                                  <div className={`w-9 sm:w-10 text-center font-medium tabular-nums shrink-0 text-[11px] sm:text-xs ${isPosGd ? 'text-emerald-700' : isNegGd ? 'text-rose-700' : 'text-[#6B7280]'}`}>
                                    {gdDisplay}
                                  </div>
                                );
                              })()}
                              <div className="w-10 sm:w-12 text-center font-bold text-[#18191F] tabular-nums shrink-0">{r.pts}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Table Legend Footer */}
                      {(() => {
                        const isTier1Only = getMaxTier(country, clubsDb) === 1;
                        const isBottomTier = seasonData.tier >= getMaxTier(country, clubsDb);
                        return (
                          <div className="hidden sm:flex p-3 bg-[#FAF9F6] border-t border-[#E6E3DC] items-center justify-between text-[11px] text-[#4B5563] gap-3 flex-wrap shrink-0 rounded-b-xl">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                <span>{seasonData.tier === 1 ? getContinentalCupNames(country).cl : 'Promotion (Top 2)'}</span>
                              </span>

                              {hasPromotionPlayoffs && (
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                                  <span>Promotion Playoff</span>
                                </span>
                              )}

                              {(isTier1Only || isBottomTier) ? (
                                <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                                  <span>{country === 'TUR' && seasonData.tier === 3 ? 'Spots 17–18' : 'Spots 16–18'}: Sporting Relegation · Pyramid Floor ({isTier1Only ? 'No Club Relegation' : 'Clubs Retained'} · Manager Dismissal Only)</span>
                                </span>
                              ) : (
                                <>
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span>16th: Relegation Playoff</span>
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                                    <span>{country === 'TUR' && seasonData.tier === 3 ? '18th: Direct Relegation' : 'Bottom 2: Direct Relegation'}</span>
                                  </span>
                                </>
                              )}

                              <span className="flex items-center gap-1.5 border-l border-[#E6E3DC] pl-2">
                                <span className="px-1 py-0.2 rounded text-[7px] font-black bg-amber-400 text-[#18191F]">C</span>
                                <span>Champion</span>
                                <span className="px-1 py-0.2 rounded text-[7px] font-black bg-emerald-600 text-white ml-0.5">P</span>
                                <span>Promoted</span>
                                <span className="px-1 py-0.2 rounded text-[7px] font-black bg-rose-600 text-white ml-0.5">R</span>
                                <span>Relegated</span>
                              </span>
                            </div>

                            <div className="text-[10px] text-[#6B7280] font-medium tabular-nums">
                              {tableData.length} Clubs · 34 Matches Played
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Editorial Pundit Review */}
                <div className="bg-white border border-[#E6E3DC] rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] flex items-center justify-center text-sky-700 shrink-0 text-xs">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-[#18191F]">{pundit.author}</span>
                      <span className="text-[10px] text-[#6B7280]">{pundit.handle}</span>
                    </div>
                    <p className="text-xs text-[#4B5563] italic font-normal line-clamp-2">
                      "{pundit.text}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 3. PILLAR 2: FINANCE & TREASURY ================= */}
            {activeTab === 'squad' && (
              <div id="section-finance" className="space-y-3 scroll-mt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 px-1 flex items-center gap-2">
                  <i className="fas fa-coins text-[11px]"></i>
                  Finance & Treasury · Fiscal Audit & Facilities
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Financial Audit */}
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-[#E6E3DC] shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-emerald-700 mb-1">
                        Financial Audit
                      </div>
                      <h3 className="text-lg font-bold text-[#18191F] tracking-tight">
                        {isPositiveNetProfit ? 'Profitable Campaign' : 'Fiscal Deficit'}
                      </h3>
                    </div>

                    <div className="space-y-2 my-3">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] text-xs">
                        <span className="text-[#4B5563] flex items-center gap-1.5">
                          <i className="fas fa-arrow-up text-emerald-700 text-[10px]"></i>
                          Revenue
                        </span>
                        <span className="font-semibold text-emerald-700 tabular-nums">
                          +{formatMoney(seasonData.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] text-xs">
                        <span className="text-[#4B5563] flex items-center gap-1.5">
                          <i className="fas fa-arrow-down text-rose-700 text-[10px]"></i>
                          Expenses & Wages
                        </span>
                        <span className="font-semibold text-rose-700 tabular-nums">
                          -{formatMoney(seasonData.wages)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E6E3DC] flex items-end justify-between">
                      <div>
                        <div className="text-[9px] uppercase font-semibold text-[#6B7280] mb-0.5">
                          Net Profit
                        </div>
                        <div className={`text-2xl font-bold tracking-tight tabular-nums ${isPositiveNetProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                          <AnimatedNumber from={0} to={seasonData.netProfit} isMoney duration={1.2} prefix={isPositiveNetProfit ? '+' : ''} />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] uppercase font-semibold text-[#6B7280] mb-0.5">
                          Ending Treasury
                        </div>
                        <div className={`text-base font-bold tabular-nums ${seasonData.endBudget >= 0 ? 'text-[#18191F]' : 'text-rose-700'}`}>
                          {formatMoney(seasonData.endBudget)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stadium & Attendance */}
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-[#E6E3DC] shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 mb-1">
                        Stadium & Attendance
                      </div>
                      <h3 className="text-lg font-bold text-[#18191F] tracking-tight">
                        Matchday Utilization
                      </h3>
                    </div>

                    <div className="space-y-3 my-3">
                      <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC]">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="text-[#4B5563]">Average Turnout</span>
                          <span className="font-semibold text-[#18191F] tabular-nums">
                            {Math.round(avgAttendance || 0).toLocaleString()} / {(state.club.stadium || 15000).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#EAE7E0] rounded-full overflow-hidden mb-1">
                          <div
                            className={`h-full transition-all duration-500 ${
                              fillPercentage >= 90 ? 'bg-emerald-600' : fillPercentage >= 70 ? 'bg-sky-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, fillPercentage))}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[#6B7280]">
                          <span>Capacity Occupancy</span>
                          <span className="font-semibold text-[#4B5563] tabular-nums">{fillPercentage}% Full</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] text-xs">
                        <span className="text-[#4B5563]">Est. Gate Revenue</span>
                        <span className="font-semibold text-emerald-700 tabular-nums">
                          +{formatMoney(Math.round((avgAttendance * 17 * (country === 'ENG' ? 45 : country === 'GER' ? 35 : 30)) / 1000))}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#E6E3DC] flex items-center justify-between text-xs text-[#6B7280]">
                      <span>Ground Capacity</span>
                      <span className="tabular-nums font-semibold text-[#18191F]">
                        {(state.club.stadium || 15000).toLocaleString()} seats
                      </span>
                    </div>
                  </div>

                  {/* Club Infrastructure */}
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-[#E6E3DC] shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 mb-1">
                        Club Infrastructure
                      </div>
                      <h3 className="text-lg font-bold text-[#18191F] tracking-tight">
                        Academy & Medical
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 my-3">
                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] flex flex-col justify-between">
                        <div>
                          <div className="text-[9px] uppercase font-semibold text-[#6B7280] flex items-center gap-1">
                            <i className="fas fa-graduation-cap text-sky-700"></i>
                            <span>Academy</span>
                          </div>
                          <div className="text-lg font-bold text-[#18191F] tabular-nums mt-1">
                            Lvl {state.club.academyLevel || 1}<span className="text-xs text-[#6B7280] font-normal">/5</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-sky-700 font-medium mt-1">
                          {(state.club.academyLevel || 1) >= 5 ? 'World-Class Complex' : (state.club.academyLevel || 1) >= 3 ? 'National Academy (NLZ)' : 'Grassroots'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] flex flex-col justify-between">
                        <div>
                          <div className="text-[9px] uppercase font-semibold text-[#6B7280] flex items-center gap-1">
                            <i className="fas fa-heart-pulse text-emerald-700"></i>
                            <span>Medical</span>
                          </div>
                          <div className="text-lg font-bold text-[#18191F] tabular-nums mt-1">
                            Lvl {state.club.medicalLevel || 1}<span className="text-xs text-[#6B7280] font-normal">/5</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-medium mt-1">
                          {(state.club.medicalLevel || 1) >= 5 ? 'Longevity Institute' : (state.club.medicalLevel || 1) >= 3 ? 'Biomechanics Lab' : 'Basic Rehab'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#E6E3DC] flex items-center justify-between text-xs text-[#6B7280]">
                      <span>Maintenance</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <i className="fas fa-circle-check text-[10px]"></i> Operational
                      </span>
                    </div>
                  </div>
                </div>

                {/* Public Equity / IPO Performance */}
                {state.isPublic && (
                  <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-5 mt-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1.5 mb-0.5">
                          <i className="fa-solid fa-chart-line text-xs"></i>
                          <span>{t('Public Shareholder Equity', 'Börsenwert & Aktionäre')}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#18191F]">
                          {t('Stock Exchange Performance', 'Aktienkurs-Entwicklung')}
                        </h4>
                        <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                          {t('Your club is publicly traded. The stock price adjusted to', 'Der Verein ist börsennotiert. Der Aktienkurs reagierte auf die sportliche Saisonleistung und steht nun bei')} <strong className="text-[#18191F]">€{state.stockPrice?.toFixed(2)}</strong>.
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <div className="bg-[#FAF9F6] border border-[#E6E3DC] p-2.5 rounded-xl text-center min-w-[90px]">
                          <div className="text-[9px] text-[#6B7280] uppercase font-semibold">{t('IPO Base', 'Ausgabepreis')}</div>
                          <div className="text-sm font-bold text-[#18191F] tabular-nums mt-0.5">€{state.ipoPrice?.toFixed(2)}</div>
                        </div>
                        <div className="bg-[#FAF9F6] border border-[#E6E3DC] p-2.5 rounded-xl text-center min-w-[90px]">
                          <div className="text-[9px] text-[#6B7280] uppercase font-semibold">{t('Current Price', 'Aktueller Kurs')}</div>
                          <div className={`text-sm font-bold tabular-nums mt-0.5 ${(state.stockPrice || 0) >= (state.ipoPrice || 0) ? 'text-emerald-700' : 'text-rose-700'}`}>
                            €{state.stockPrice?.toFixed(2)}
                          </div>
                          <div className={`text-[9px] font-bold mt-0.5 ${(state.stockPrice || 0) >= (state.ipoPrice || 0) ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {((((state.stockPrice || 0) - (state.ipoPrice || 1)) / (state.ipoPrice || 1)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial Restructuring & Austerity Advisory */}
                <div className="bg-white border border-[#E6E3DC] rounded-2xl p-4 sm:p-5 mt-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-sky-700 tracking-wider flex items-center gap-1.5 mb-0.5">
                        <i className="fa-solid fa-scale-balanced text-xs"></i>
                        <span>Treasury & Wage Restructuring Advisory</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#18191F]">
                        Fiscal Blueprint & Debt Service
                      </h4>
                      <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                        {state.bankLoan && state.bankLoan.yearsLeft > 0 ? (
                          <span>
                            Active bank debt requires <strong className="text-rose-700">{formatMoney(state.bankLoan.annualPayment)}/year</strong> in debt service ({state.bankLoan.yearsLeft} years left). Paying down debt early in the Ledger frees up cash flow for infrastructure development.
                          </span>
                        ) : seasonData.endBudget < 10000 ? (
                          <span>
                            Treasury reserves stand at {formatMoney(seasonData.endBudget)}. Building a €10M+ cash buffer cushions wage inflation from high-OVR veterans and funds Level 5+ upgrades.
                          </span>
                        ) : (
                          <span>
                            Excellent financial cushion ({formatMoney(seasonData.endBudget)}). High cash liquidity enables fearless transitions and systemic facility investments.
                          </span>
                        )}
                      </p>
                    </div>
                    {state.bankLoan && state.bankLoan.yearsLeft > 0 && (
                      <div className="shrink-0 bg-rose-50 border border-rose-200 p-3 rounded-xl sm:text-right">
                        <div className="text-[10px] text-[#6B7280] uppercase font-semibold">Active Bank Loan</div>
                        <div className="text-sm font-bold text-rose-700 tabular-nums">-{formatMoney(state.bankLoan.annualPayment)}/yr</div>
                        <div className="text-[10px] text-[#6B7280]">{state.bankLoan.yearsLeft} yrs remaining</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 4. PILLAR 3: SQUAD PROGRESSION ================= */}
            {activeTab === 'squad' && (
              <div id="section-squad" className="space-y-3 scroll-mt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 px-1 flex items-center gap-2">
                  <i className="fas fa-users text-[11px]"></i>
                  Squad Progression · Roster & Academy
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First-Team Progression */}
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-[#E6E3DC] shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 mb-1">
                        Squad Report
                      </div>
                      <h3 className="text-lg font-bold text-[#18191F] tracking-tight">
                        First-Team Progression
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 my-3">
                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC]">
                        <div className="text-[9px] uppercase font-semibold text-[#6B7280]">Squad OVR (Full Season)</div>
                        <div className="flex items-center gap-1.5 mt-1 tabular-nums">
                          <span className="text-sm font-semibold text-[#6B7280]">{fullSeasonStartOvr}</span>
                          <i className="fas fa-arrow-right text-[10px] text-[#9CA3AF]"></i>
                          <span className="text-xl font-bold text-[#18191F]">{seasonData.newBaseOvr || state.club.baseOvr}</span>
                          {ovrDelta !== 0 && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums ${ovrDelta > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                              {ovrDelta > 0 ? `+${ovrDelta}` : ovrDelta}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC]">
                        <div className="text-[9px] uppercase font-semibold text-[#6B7280]">Squad Morale</div>
                        <div className="text-xl font-bold text-emerald-700 tabular-nums mt-1">
                          {seasonData.endMorale ?? state.club.morale ?? 100}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Youth Pipeline & Graduates */}
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-[#E6E3DC] shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 mb-1">
                        Academy Pipeline
                      </div>
                      <h3 className="text-lg font-bold text-[#18191F] tracking-tight">
                        Youth Pipeline & Graduates
                      </h3>
                    </div>

                    <div className="space-y-2.5 my-3">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] text-xs">
                        <span className="text-[#4B5563]">Academy Facility</span>
                        <span className="font-semibold text-sky-700 tabular-nums">
                          Level {state.club.academyLevel || 1}/5
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC]">
                        <div className="text-[9px] uppercase font-semibold text-[#6B7280] mb-1">
                          Promoted Graduates
                        </div>
                        <div className="text-xs text-[#18191F]">
                          {seasonData.graduatedYouths && seasonData.graduatedYouths.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {seasonData.graduatedYouths.map((y, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-semibold border border-sky-200">
                                  {y.split(',')[0]}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#6B7280] italic text-[11px]">No graduates promoted to first team this season</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#E6E3DC] flex items-center justify-between text-xs text-[#6B7280]">
                      <span>Youth Pipeline</span>
                      <span className="tabular-nums font-semibold text-[#18191F]">
                        {state.youthPipeline?.length || 0} Talents Enrolled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Squad Attrition Audit Breakdown */}
                {decayReasons.length > 0 && (
                  <div className="bg-white border border-[#E6E3DC] rounded-2xl p-4 sm:p-5 mt-3 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-rose-700 flex items-center gap-1.5">
                        <i className="fa-solid fa-arrow-trend-down text-rose-600 text-xs"></i>
                        <span>Off-Season Squad Attrition Breakdown</span>
                      </div>
                      <span className="text-xs text-[#4B5563] font-mono tabular-nums">
                        Net: {(seasonData.newBaseOvr || state.club.baseOvr) - (seasonData.startOvr || state.club.baseOvr)} OVR
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {decayReasons.map((reason, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tactical Status within Squad Tab */}
                <div className={`p-4 rounded-2xl border mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isStaleActive 
                    ? 'bg-rose-50/70 border-rose-200' 
                    : isStaleWarning 
                    ? 'bg-amber-50/70 border-amber-200' 
                    : 'bg-white border-[#E6E3DC] shadow-xs'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      isStaleActive ? 'bg-rose-100 text-rose-700' : isStaleWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      <i className={`fa-solid ${isStaleActive ? 'fa-triangle-exclamation' : isStaleWarning ? 'fa-crosshairs' : 'fa-chess'}`}></i>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#6B7280]">Tactical System Status</div>
                      <div className="text-xs sm:text-sm font-bold text-[#18191F] flex items-center gap-2">
                        <span>{state.tactic || 'Balanced'}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isStaleActive 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : isStaleWarning 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isStaleActive 
                            ? `Stale (-${hasSystemicImmunity ? 2 : 4} OVR Penalty)` 
                            : isStaleWarning 
                            ? 'Under League Surveillance' 
                            : 'Tactically Fresh'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#6B7280] sm:text-right">
                    {isStaleActive ? (
                      <span className="text-rose-700 font-semibold">Adapt philosophy in Headquarters for 5 DP to clear penalty.</span>
                    ) : isStaleWarning ? (
                      <span className="text-amber-800">Winning again with this tactic triggers staleness.</span>
                    ) : (
                      <span className="text-[#4B5563]">Tactics are effective and unpredictable.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 5. PILLAR 4: HEAD COACH REVIEW ================= */}
            {activeTab === 'squad' && (
              <div id="section-coach" className="space-y-3 scroll-mt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 px-1 flex items-center gap-2">
                  <i className="fas fa-user-tie text-[11px]"></i>
                  Head Coach Review · Leadership & Contract
                </div>

                {(state.currentCoach || seasonData.coachAtStartOfSim) ? (() => {
                  const coach = state.currentCoach || seasonData.coachAtStartOfSim;
                  const isExpiring = (coach.contractYearsLeft ?? 0) <= 0;
                  return (
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E6E3DC] shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 mb-1 flex items-center justify-between">
                          <span>Head Coach Tenure</span>
                          {isExpiring && (
                            <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              Expiring!
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-[#18191F] tracking-tight flex items-center justify-between">
                          <span>{coach.name}</span>
                          <span className="text-xs font-semibold text-[#6B7280]">{coach.style}</span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3 my-3">
                        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC]">
                          <div className="text-[9px] uppercase font-semibold text-[#6B7280]">Contract Remaining</div>
                          <div className={`text-base font-bold tabular-nums mt-0.5 ${isExpiring ? 'text-rose-700' : 'text-[#18191F]'}`}>
                            {coach.contractYearsLeft ?? 0} Years
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC]">
                          <div className="text-[9px] uppercase font-semibold text-[#6B7280]">Tactical Boost</div>
                          <div className={`text-base font-bold tabular-nums mt-0.5 ${coach.ovrBoost >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {coach.ovrBoost >= 0 ? `+${coach.ovrBoost}` : coach.ovrBoost} OVR
                          </div>
                        </div>
                      </div>

                      {onRenewCoach && (() => {
                        const currentYears = coach.contractYearsLeft ?? 0;
                        const isMaxed = currentYears >= 5;
                        const canPlus1 = currentYears + 1 <= 5;
                        const canPlus2 = currentYears + 2 <= 5;

                        return (
                          <div className="pt-3 border-t border-[#E6E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-xs text-[#6B7280]">
                              <span className="font-semibold text-[#18191F] block">
                                {isMaxed ? 'Max Contract Length (5 Yrs)' : 'Extend Contract (Max 5 Yrs)'}
                              </span>
                              <span>{formatMoney(coach.cost)} / yr</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                disabled={!canPlus1}
                                onClick={() => canPlus1 && onRenewCoach(1)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                  canPlus1
                                    ? 'bg-[#18191F] hover:bg-[#2A2C35] text-white cursor-pointer shadow-xs'
                                    : 'bg-[#F6F5F1] text-[#9CA3AF] border border-[#E6E3DC] cursor-not-allowed'
                                }`}
                              >
                                +1 Yr
                              </button>
                              <button
                                disabled={!canPlus2}
                                onClick={() => canPlus2 && onRenewCoach(2)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                  canPlus2
                                    ? 'bg-white hover:bg-[#EFECE4] text-[#18191F] border border-[#E6E3DC] cursor-pointer'
                                    : 'bg-[#F6F5F1] text-[#9CA3AF] border border-[#E6E3DC] cursor-not-allowed'
                                }`}
                              >
                                +2 Yrs
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })() : seasonData.coachDepartureAlert ? (
                  <div className="bg-rose-50/70 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-rose-200 shadow-xs">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-rose-700 mb-0.5">
                          {seasonData.coachDepartureAlert.isPoached
                            ? 'Head Coach Poached · Release Clause Triggered'
                            : 'Head Coach Departed · Resignation'}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#18191F]">
                          {seasonData.coachDepartureAlert.coachName}{' '}
                          <span className="text-xs font-semibold text-rose-700">
                            ({seasonData.coachDepartureAlert.ovrBoost >= 0 ? `+${seasonData.coachDepartureAlert.ovrBoost}` : seasonData.coachDepartureAlert.ovrBoost} OVR · {seasonData.coachDepartureAlert.style})
                          </span>
                        </h3>
                      </div>
                      {seasonData.coachDepartureAlert.isPoached && seasonData.coachDepartureAlert.buyoutFeeK > 0 && (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shrink-0">
                          +{formatMoney(seasonData.coachDepartureAlert.buyoutFeeK)} Buyout Paid
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      Departed at season end due to {seasonData.coachDepartureAlert.reason}. Visit the Staff Market in pre-season to appoint a new Head Coach.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#E6E3DC] shadow-xs text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] text-lg mx-auto mb-3">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <h3 className="text-base font-bold text-[#18191F] mb-1">No Head Coach Appointed</h3>
                    <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                      Your squad navigated this campaign under interim management. Review and hire a specialist tactician in the pre-season staff market to elevate tactical strength.
                    </p>
                  </div>
                )}

                {/* Philosophical Pivot & Rebuild Advisory */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E3DC] mt-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1.5 mb-0.5">
                        <i className="fa-solid fa-chess-knight text-xs"></i>
                        <span>Tactical Philosophy & Backroom Rebuild Direction</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#18191F]">
                        Current System: {state.tactic || 'Balanced'}
                      </h4>
                      <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                        {isStaleActive ? (
                          <span className="text-rose-700">
                            <strong>Obsolescence Active:</strong> League opposition has fully solved this philosophy (-{hasSystemicImmunity ? 2 : 4} OVR penalty in simulations). Head to the Coach room to adapt philosophy for 5 DP.
                          </span>
                        ) : isStaleWarning ? (
                          <span className="text-amber-800">
                            <strong>System Under Surveillance:</strong> Winning consecutive titles with this system. Adapting philosophy now protects your tactical unpredictability.
                          </span>
                        ) : (
                          <span>
                            System operates smoothly. Consider whether this squad needs a win-now Continental Legend or a Youth Whisperer / Scout to accelerate wonderkid maturation.
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="shrink-0 bg-[#FAF9F6] p-3 rounded-xl border border-[#E6E3DC] text-right">
                      <div className="text-[10px] text-[#6B7280] uppercase font-semibold">Director Points</div>
                      <div className="text-base font-bold text-amber-700 tabular-nums">{state.skillPoints || 0} DP Available</div>
                      <div className="text-[10px] text-[#6B7280]">5 DP to adapt system</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 6. PILLAR 5: BOARD EXPECTATIONS & ROADMAP ================= */}
            {activeTab === 'overview' && (
              <div id="section-board" className="space-y-3 scroll-mt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 px-1 flex items-center gap-2">
                  <i className="fas fa-bullseye text-[11px]"></i>
                  Board Vision · Strategic Mandates & Trust
                </div>

                {(seasonData.isSackedRelegation || seasonData.isSacked) ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6">
                    <div className="flex items-center gap-3.5 mb-2">
                      <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 text-lg shrink-0">
                        <i className="fas fa-triangle-exclamation"></i>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold tracking-wider text-rose-700">Board Resolution</div>
                        <div className="text-base sm:text-lg font-bold text-[#18191F]">Managerial Contract Terminated</div>
                      </div>
                    </div>
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {isTier1Only
                        ? `Following a bottom-3 finish in ${league.name}, the Board of Directors has immediately dismissed management for sporting failure. Since this country has no lower tier, the club remains in the league, but managerial immunity shields offer no protection against bottom-tier collapse.`
                        : isBottomTier
                        ? `Following drop-zone failure in ${league.name}, the Board of Directors has immediately terminated your contract. With no lower league to absorb the fall, management has been relieved of duties.`
                        : `Following the conclusion of the campaign, the Board of Directors has officially relieved management of sporting duties.`}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E6E3DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 text-lg shrink-0">
                        <i className="fas fa-bullseye"></i>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 mb-0.5">
                          Next Season Mandate
                        </div>
                        <div className="text-base sm:text-lg font-bold text-[#18191F]">
                          Finish Top {state.boardTargetFinish || 15} or better mandated
                        </div>
                        <div className="text-xs text-[#6B7280] mt-0.5">
                          Target failure without immunity shields triggers termination review.
                        </div>
                      </div>
                    </div>

                    {/* Impact score progress bar */}
                    <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E6E3DC] w-full md:w-auto md:min-w-[260px]">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-semibold text-[#6B7280]">Club Impact & Trust</span>
                        <span className="font-bold text-[#18191F] tabular-nums">{state.clubImpactScore ?? 50}/100</span>
                      </div>
                      <div className="w-full h-2 bg-[#EAE7E0] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${
                            (state.clubImpactScore ?? 50) >= 70 ? 'bg-emerald-600' : (state.clubImpactScore ?? 50) >= 40 ? 'bg-sky-600' : 'bg-rose-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, state.clubImpactScore ?? 50))}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#6B7280] mt-1 font-medium">
                        <span>Immunity Shields: {state.immunityShields ?? 0}</span>
                        <span className={(state.clubImpactScore ?? 50) >= 70 ? 'text-emerald-700' : 'text-sky-700'}>
                          {(state.clubImpactScore ?? 50) >= 70 ? 'Untouchable' : 'Stable'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= 7. PILLAR 6: LIVING UNIVERSE & WORLD FOOTBALL ================= */}
            {activeTab === 'world' && (
              <div id="section-universe" className="space-y-4 scroll-mt-6">
                <div className="hidden sm:flex items-center justify-between text-xs px-1">
                  <div className="font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-2">
                    <i className="fa-solid fa-earth-americas text-[11px]"></i>
                    Global Football Universe & Seasonal Digest
                  </div>
                  <span className="text-[10px] text-[#6B7280] font-mono">
                    Season {seasonData.year} Ecosystem Digest
                  </span>
                </div>

                {/* Diverse Rival Challenger Headline in Global Universe */}
                {superVillainClub && rivalChallengerEvent && (
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white border border-indigo-200 flex items-center justify-center p-2 shrink-0">
                        <ClubLogo name={superVillainClub.name} club={superVillainClub} isModActive={effectiveModActive} size={32} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                          BREAKING LEAGUE HEADLINE · {rivalChallengerEvent.badge?.toUpperCase() || 'NEW TITLE CHALLENGER'}
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-[#18191F]">
                          {(effectiveModActive ? rivalChallengerEvent.headline : undefined) || `${superVillainClub.name} Mounts Challenge Against ${displayClubName}`}
                        </h4>
                        <p className="text-xs text-[#4B5563] mt-0.5">
                          {(effectiveModActive ? rivalChallengerEvent.desc : undefined) || `A surging ${rivalChallengerEvent.clubOvr || superVillainClub.baseOvr} OVR domestic contender emerges in ${league.name}.`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200">
                        {rivalChallengerEvent.clubOvr || superVillainClub.baseOvr} OVR Threat
                      </span>
                    </div>
                  </div>
                )}

                {/* Continental & World Champions Marquee */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E6E3DC] shadow-xs">
                  <div className="flex items-center justify-between mb-3 border-b border-[#E6E3DC] pb-2">
                    <span className="text-xs font-bold text-[#18191F] uppercase tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-trophy text-amber-600 text-xs"></i>
                      World & Continental Silverware
                    </span>
                    <span className="text-[10px] text-[#6B7280]">Major Continental Kings</span>
                  </div>

                  {continentalChampions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {continentalChampions.map((c) => (
                        <div
                          key={c.id}
                          className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E3DC] flex items-center justify-center shrink-0 p-1">
                            <ClubLogo
                              name={c.clubName}
                              id={c.clubId}
                              color={c.clubColor}
                              logo={c.clubLogo}
                              isModActive={isModActive}
                              className="w-8 h-8 object-contain"
                              fallbackClassName="w-8 h-8 rounded-lg text-xs flex items-center justify-center font-bold text-white"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider truncate">
                              {c.fromLeagueName}
                            </div>
                            <div className="text-xs font-bold text-[#18191F] break-words">{c.clubName}</div>
                            <div className="text-[10px] text-[#6B7280] truncate mt-0.5">{c.reason}</div>
                          </div>
                          <div className="text-amber-600 text-sm shrink-0 pr-1">🏆</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#6B7280] py-3 text-center">
                      Continental tournaments in progress across the globe.
                    </div>
                  )}
                </div>

                {/* Domestic League Champions Grid */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E6E3DC] shadow-xs">
                  <div className="flex items-center justify-between mb-3 border-b border-[#E6E3DC] pb-2">
                    <span className="text-xs font-bold text-[#18191F] uppercase tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-crown text-amber-600 text-xs"></i>
                      Domestic League Champions
                    </span>
                    <span className="text-[10px] text-[#6B7280]">National League Winners</span>
                  </div>

                  {leagueChampions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {leagueChampions.map((c) => (
                        <div
                          key={c.id}
                          className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-2.5 flex items-center gap-2.5"
                        >
                          <div className="w-9 h-9 rounded-xl bg-white border border-[#E6E3DC] flex items-center justify-center shrink-0 p-1">
                            <ClubLogo
                              name={c.clubName}
                              id={c.clubId}
                              color={c.clubColor}
                              logo={c.clubLogo}
                              isModActive={isModActive}
                              className="w-7 h-7 object-contain"
                              fallbackClassName="w-7 h-7 rounded-lg text-[10px] flex items-center justify-center font-bold text-white"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[9px] font-bold text-sky-700 uppercase tracking-wider truncate">
                              {c.fromLeagueName}
                            </div>
                            <div className="text-xs font-bold text-[#18191F] break-words">{c.clubName}</div>
                          </div>
                          <i className="fa-solid fa-crown text-amber-600 text-xs shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#6B7280] py-3 text-center">
                      Domestic title battles concluded for this campaign.
                    </div>
                  )}
                </div>

                {/* Fallen Giants Crisis Alert */}
                {fallenGiantsList.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                      <i className="fa-solid fa-triangle-exclamation text-amber-700"></i>
                      Fallen Giant Administration Alert
                    </div>
                    <div className="space-y-2">
                      {fallenGiantsList.map((g) => (
                        <div
                          key={g.id}
                          className="bg-white border border-amber-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] flex items-center justify-center shrink-0 p-1">
                              <ClubLogo
                                name={g.clubName}
                                id={g.clubId}
                                color={g.clubColor}
                                logo={g.clubLogo}
                                isModActive={isModActive}
                                className="w-8 h-8 object-contain"
                                fallbackClassName="w-8 h-8 rounded-lg text-xs flex items-center justify-center font-bold text-white"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-[#18191F] break-words">{g.clubName}</div>
                              <div className="text-xs text-amber-800 font-medium">
                                Demoted from {g.fromLeagueName} to {g.toLeagueName}
                              </div>
                              <div className="text-[10px] text-[#6B7280]">{g.reason}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Rebuild Challenge Target
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Champions Almanac & Trophy Leaders */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#E6E3DC] shadow-xs space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E3DC] pb-2.5 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#18191F] uppercase tracking-wider flex items-center gap-2">
                        <i className={`fa-solid ${worldAlmanacTab === 'almanac' ? 'fa-trophy text-amber-600' : 'fa-chart-simple text-emerald-700'} text-xs`}></i>
                        {worldAlmanacTab === 'almanac' ? 'Champions Almanac' : 'Top 5 Trophy Leaders'}
                      </span>
                    </div>
                    <div className="bg-[#EFECE4] border border-[#E6E3DC] rounded-xl p-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setWorldAlmanacTab('almanac')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                          worldAlmanacTab === 'almanac'
                            ? 'bg-[#18191F] text-white shadow-xs'
                            : 'text-[#6B7280] hover:text-[#18191F]'
                        }`}
                      >
                        Champions Almanac
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorldAlmanacTab('leaders')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                          worldAlmanacTab === 'leaders'
                            ? 'bg-[#18191F] text-white shadow-xs'
                            : 'text-[#6B7280] hover:text-[#18191F]'
                        }`}
                      >
                        Top 5 Trophy Chart
                      </button>
                    </div>
                  </div>

                  {worldAlmanacTab === 'almanac' ? (
                    <ChampionsAlmanacView
                      state={state}
                      clubsDb={clubsDb}
                      initialCountry={almanacCountry}
                      initialTier={almanacTier}
                      onSelectCountry={setAlmanacCountry}
                      onSelectTier={setAlmanacTier}
                      isModActive={isModActive}
                    />
                  ) : (
                    <TrophyLeadersChartView
                      state={state}
                      clubsDb={clubsDb}
                      initialCountry={almanacCountry}
                      initialTier={almanacTier}
                      onSelectCountry={setAlmanacCountry}
                      onSelectTier={setAlmanacTier}
                      isModActive={isModActive}
                    />
                  )}
                </div>

                {/* Blockbuster Heavyweight Transfers */}
                {transferSagasList.length > 0 && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E6E3DC] shadow-xs">
                    <div className="flex items-center justify-between mb-3 border-b border-[#E6E3DC] pb-2">
                      <span className="text-xs font-bold text-[#18191F] uppercase tracking-wider flex items-center gap-2">
                        <i className="fa-solid fa-arrow-right-arrow-left text-sky-700 text-xs"></i>
                        Blockbuster Heavyweight Transfer Sagas
                      </span>
                      <span className="text-[10px] text-[#6B7280]">Continental Market</span>
                    </div>
                    <div className="space-y-2">
                      {transferSagasList.map((t) => (
                        <div
                          key={t.id}
                          className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold shrink-0">
                              <i className="fa-solid fa-user text-xs"></i>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#18191F] truncate">{t.reason}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full self-start sm:self-auto shrink-0">
                            Market Confirmed
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ACTION FOOTER */}
        <div className="p-2.5 sm:p-5 pb-safe border-t border-[#E6E3DC] bg-[#FAF9F6] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 relative z-10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-white hover:bg-[#EFECE4] text-[#18191F] text-xs font-semibold transition border border-[#E6E3DC] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
              title="Export / Share Season Card"
            >
              <i className={`fas ${isDownloading ? 'fa-spinner fa-spin' : 'fa-share-nodes'} text-sky-700`}></i>
              <span>Share Card</span>
            </button>

            <button
              type="button"
              onClick={() => {
                switchTab('table');
              }}
              className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-semibold transition border flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial ${
                activeTab === 'table'
                  ? 'bg-[#18191F] text-white border-[#18191F] shadow-xs'
                  : 'bg-white hover:bg-[#EFECE4] text-[#18191F] border-[#E6E3DC]'
              }`}
            >
              <i className={`fas ${activeTab === 'table' ? 'fa-table-cells-large text-white' : 'fa-table text-sky-700'}`}></i>
              <span>League Table</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto sm:min-w-[280px] py-2.5 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] active:scale-[0.98] text-white font-semibold text-sm tracking-wide transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Continue to Next Season <span className="hidden sm:inline font-normal text-xs text-white/75">(Press Enter)</span></span>
            <span className="text-xs text-white/80 tabular-nums sm:hidden">({seasonData.year + 1})</span>
            <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});