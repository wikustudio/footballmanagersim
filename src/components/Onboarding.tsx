import { AnimatePresence, motion } from 'motion/react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Club, GameMode, Language, Coach } from '../types';
import { COUNTRIES, LEAGUES, COUNTRY_LEAGUES, getLeagueInfo, PHILOSOPHIES, TACTICS, getMonogramHex, getInitials, isReserveClub, getMaxTier, getClubHistoricContext, formatMoney, getStartingBudget, MOD_ONLY_COUNTRIES, BASE_GAME_COUNTRIES, isCanadianMLSClub, isTacticalSynergy } from '../data/gameConstants';
import { UEFA_COUNTRIES, CONMEBOL_COUNTRIES, CONCACAF_COUNTRIES, AFC_COUNTRIES } from '../utils/regionHelpers';
import { ClubLogo } from './ClubLogo';
import { prewarmClubsLogos } from '../utils/logoCache';
import { ModModal } from './ModModal';
import { generateCoachMarket, getCoachArchetypeConfig } from '../engine/coachEngine';
import { CoachDossierModal } from './CoachDossierModal';
import { t as tr } from '../data/translations';
import { ALL_CLUBS } from '../data/clubsData';
import { parseAndNormalizeModBudget } from '../engine/moddingEngine';

interface OnboardingProps {
  lang: Language;
  clubsDb: Club[];
  isModActive?: boolean;
  onToggleMod?: (active: boolean, customClubs?: Club[]) => void;
  setClubsDb?: (db: Club[]) => void;
  showToast?: (msg: string, type: string) => void;
  onStartGame: (params: {
    club: Club;
    managerName: string;
    startYear: number;
    tactic: string;
    nationality: string;
    mode: GameMode;
    archetype: 'legend' | 'finance' | 'scout' | 'balanced';
    coach?: Coach;
  }) => void;
  onShowLeaderboard: () => void;
  onShowAbout?: () => void;
}


import { normalizeAndValidateCustomDb, CustomDbValidationResult } from '../engine/moddingEngine';
export type { CustomDbValidationResult };
export { normalizeAndValidateCustomDb };



const getStyleColor = (style: string) => {
  if (style === 'Total Football') return 'text-orange-600';
  if (style === 'Gegenpressing') return 'text-amber-600';
  if (style === 'Tiki-Taka') return 'text-blue-600';
  if (style === 'Defensive' || style === 'Catenaccio' || style === 'Park the Bus') return 'text-emerald-600';
  if (style === 'Direct Counter' || style === 'Wing Play') return 'text-cyan-700';
  return 'text-[#6B6A64]'; // Default / Survival
};

const getCoachQuote = (ovrBoost: number, isDe: boolean, coachId: string) => {
  const hash = coachId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const quotes3 = isDe 
    ? ["Ein visionärer Trainer, der den Verein transformieren wird.", "Ein taktisches Genie. Der Vorstand liebt diese Wahl.", "Weltklasse-Format. Erwarte sofortige Ergebnisse."]
    : ["An absolute visionary. Will transform the club.", "A tactical genius. The board loves this appointment.", "World-class pedigree. Expect immediate results."];
    
  const quotes2 = isDe
    ? ["Sehr gefragt. Ein massiver Coup für uns.", "Ein aufsteigender Stern in der Trainerwelt.", "Spannende Philosophie. Die Fans werden begeistert sein.", "Garant für Erfolge über den Erwartungen."]
    : ["Highly sought after. A massive coup for us.", "A rising star in the sporting director world.", "Exciting philosophy. The fans will be thrilled.", "Proven track record of overachieving."];
    
  const quotes1 = isDe
    ? ["Solide Grundlagen. Eine sichere Wahl.", "Kennt die Liga gut. Eine pragmatische Entscheidung.", "Eine ruhige Präsenz, um die Kabine zu stabilisieren.", "Respektabler Taktiker. Wird seinen Job machen.", "Guter Menschenfänger mit ordentlichem Lebenslauf."]
    : ["Solid fundamentals. A safe pair of hands.", "Knows the league well. A pragmatic choice.", "A steady presence to stabilize the dressing room.", "Respectable tactician. Will get the job done.", "Good man-manager (coach) with a decent resume."];
    
  const quotes0 = isDe
    ? ["Sofort verfügbar und günstig im Unterhalt.", "Braucht eine Chance, sich auf diesem Niveau zu beweisen.", "Eine risikoarme Wahl für unser aktuelles Budget.", "Hatte zuletzt Probleme, ist aber heiß auf einen Neustart."]
    : ["Affordable and available immediately.", "Needs a chance to prove himself at this level.", "A low-risk appointment for our current budget.", "Struggled previously, but eager for a fresh start."];
    
  const quotesMinus = isDe
    ? ["Eine riskante Wahl, aber er passt ins Budget.", "Verzweifelte Zeiten erfordern verzweifelte Maßnahmen.", "Berüchtigt für Kabinen-Probleme. Vorsicht geboten."]
    : ["A controversial choice, but fits the budget.", "Desperate times call for desperate measures.", "Known for losing the dressing room. Proceed with caution."];

  if (ovrBoost >= 3) return quotes3[hash % quotes3.length];
  if (ovrBoost === 2) return quotes2[hash % quotes2.length];
  if (ovrBoost === 1) return quotes1[hash % quotes1.length];
  if (ovrBoost === 0) return quotes0[hash % quotes0.length];
  return quotesMinus[hash % quotesMinus.length];
};

const getQuickChips = (country: string, modActive: boolean): string[] => {
  if (country === 'GER') {
    return modActive
      ? ['Bayern', 'Dortmund', 'Leverkusen', 'Leipzig', 'St. Pauli', 'Schalke', 'HSV']
      : ['Bavaria', 'Prussia', 'Leverkusen', 'Leipzig', 'St. Pauli', 'Hamburg'];
  }
  if (country === 'ENG') {
    return modActive
      ? ['Man City', 'Arsenal', 'Liverpool', 'Man United', 'Chelsea', 'Richmond']
      : ['Manchester Blue', 'Liverpool Red', 'Arsenal', 'London Blue', 'Richmond'];
  }
  if (country === 'ESP') {
    return modActive
      ? ['Real Madrid', 'Barcelona', 'Atlético', 'Sevilla', 'Athletic Club']
      : ['Madrid White', 'Barcelona Blue', 'Madrid Red', 'Sevilla'];
  }
  if (country === 'ITA') {
    return modActive
      ? ['Inter', 'Juventus', 'Milan', 'Roma', 'Napoli']
      : ['Milano Black', 'Piedmont Black', 'Milano Red', 'Rome Yellow'];
  }
  if (country === 'FRA') {
    return modActive
      ? ['PSG', 'Marseille', 'Monaco', 'Lyon', 'Lille']
      : ['Paris Capital', 'Marseille Port', 'Monaco Rock'];
  }
  if (country === 'USA') {
    return ['Inter Miami', 'LA Galaxy', 'LAFC', 'NYCFC', 'Atlanta United'];
  }
  if (country === 'POR') {
    return modActive ? ['Benfica', 'Sporting', 'Porto', 'Braga'] : ['Lisbon Eagle', 'Lisbon Lion', 'Porto Dragon'];
  }
  return modActive
    ? ['Bayern', 'Real Madrid', 'Man City', 'Barcelona', 'PSG', 'Richmond']
    : ['Bavaria', 'Madrid White', 'Manchester Blue', 'Richmond'];
};

const RANDOM_NAMES = [
  'Alex Ferguson', 'Pep Guardiola', 'Jürgen Klopp', 'Carlo Ancelotti',
  'José Mourinho', 'Arsène Wenger', 'Zinedine Zidane', 'Diego Simeone',
  'Marcelo Bielsa', 'Julian Nagelsmann', 'Xabi Alonso', 'Roberto De Zerbi',
  'Hansi Flick', 'Unai Emery', 'Antonio Conte', 'Ralf Rangnick',
  'Louis van Gaal', 'Luciano Spalletti', 'Gian Piero Gasperini', 'Rúben Amorim',
  'Thomas Tuchel', 'Erik ten Hag'
];

interface TacticVisualInfo {
  theme: {
    gradient: string;
    activeBorder: string;
    ring: string;
    glow: string;
    badgeBg: string;
    iconBg: string;
    accentText: string;
  };
  shortEthos: string;
  shortPerk: string;
  gf: string;
  ga: string;
  isGfPos: boolean;
  isGaPos: boolean;
}

const TACTIC_DETAILS: Record<string, TacticVisualInfo> = {
  'Total Football': {
    theme: {
      gradient: 'from-sky-500/[0.08] to-transparent',
      activeBorder: 'border-sky-400/50',
      ring: 'ring-sky-400/25',
      glow: 'shadow-[0_8px_30px_rgba(56,189,248,0.14),inset_0_1px_0_0_rgba(125,211,252,0.2)]',
      badgeBg: 'bg-sky-500/15 text-sky-200 border-sky-400/25',
      iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
      accentText: 'text-sky-300',
    },
    shortEthos: 'Fluid Attack & Dynamic Play',
    shortPerk: '+12% Fans · +1 Home OVR',
    gf: '+18%',
    ga: '+10%',
    isGfPos: true,
    isGaPos: false,
  },
  'Gegenpressing': {
    theme: {
      gradient: 'from-sky-500/[0.08] to-transparent',
      activeBorder: 'border-sky-400/50',
      ring: 'ring-sky-400/25',
      glow: 'shadow-[0_8px_30px_rgba(56,189,248,0.14),inset_0_1px_0_0_rgba(125,211,252,0.2)]',
      badgeBg: 'bg-sky-500/15 text-sky-200 border-sky-400/25',
      iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
      accentText: 'text-sky-300',
    },
    shortEthos: 'High-Intensity Press & Chaos',
    shortPerk: 'Giant-Killer +3 OVR in Cups',
    gf: '+28%',
    ga: '+22%',
    isGfPos: true,
    isGaPos: false,
  },
  'Tiki-Taka': {
    theme: {
      gradient: 'from-sky-500/[0.08] to-transparent',
      activeBorder: 'border-sky-400/50',
      ring: 'ring-sky-400/25',
      glow: 'shadow-[0_8px_30px_rgba(56,189,248,0.14),inset_0_1px_0_0_rgba(125,211,252,0.2)]',
      badgeBg: 'bg-sky-500/15 text-sky-200 border-sky-400/25',
      iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
      accentText: 'text-sky-300',
    },
    shortEthos: 'Positional Possession & Control',
    shortPerk: '+15% Sponsors · Dominance',
    gf: '-12%',
    ga: '-28%',
    isGfPos: false,
    isGaPos: true,
  },
  'Defensive': {
    theme: {
      gradient: 'from-sky-500/[0.08] to-transparent',
      activeBorder: 'border-sky-400/50',
      ring: 'ring-sky-400/25',
      glow: 'shadow-[0_8px_30px_rgba(56,189,248,0.14),inset_0_1px_0_0_rgba(125,211,252,0.2)]',
      badgeBg: 'bg-sky-500/15 text-sky-200 border-sky-400/25',
      iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
      accentText: 'text-sky-300',
    },
    shortEthos: 'Low-Block Fortress & Survival',
    shortPerk: '-40% Goal Damage · Safe',
    gf: '-38%',
    ga: '-48%',
    isGfPos: false,
    isGaPos: true,
  },
  'Direct Counter': {
    theme: {
      gradient: 'from-sky-500/[0.08] to-transparent',
      activeBorder: 'border-sky-400/50',
      ring: 'ring-sky-400/25',
      glow: 'shadow-[0_8px_30px_rgba(56,189,248,0.14),inset_0_1px_0_0_rgba(125,211,252,0.2)]',
      badgeBg: 'bg-sky-500/15 text-sky-200 border-sky-400/25',
      iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
      accentText: 'text-sky-300',
    },
    shortEthos: 'Rapid Vertical Counter-Attack',
    shortPerk: '+2 Away OVR · Squad Savings',
    gf: '+5%',
    ga: '-12%',
    isGfPos: true,
    isGaPos: true,
  },
};

export const Onboarding: React.FC<OnboardingProps> = ({
  setClubsDb,
  showToast,
  lang,
  clubsDb,
  isModActive = false,
  onToggleMod,
  onStartGame,
  onShowLeaderboard,
  onShowAbout,
}) => {
  const isDe = lang === 'de';

  const [step, setStep] = useState<number>(1);
  const [coachMarket, setCoachMarket] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [mode, setMode] = useState<GameMode>('realistic');
  const [archetype, setArchetype] = useState<'legend' | 'finance' | 'scout' | 'balanced'>('balanced');
  const [selectedClubForArchetype, setSelectedClubForArchetype] = useState<Club | null>(null);
  const [managerName, setManagerName] = useState<string>('');
  const [nameError, setNameError] = useState<boolean>(false);
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState<number>(currentYear);
  const [showModModal, setShowModModal] = useState<boolean>(false);
  const [nationality, setNationality] = useState<string>('GER');
  const [tactic, setTactic] = useState<string>('Total Football');
  const [tierFilter, setTierFilter] = useState<number | 'all'>(1);
  const [showAllClubs, setShowAllClubs] = useState<boolean>(false);
  const [showCustomTactics, setShowCustomTactics] = useState<boolean>(false);
  const [continentFilter, setContinentFilter] = useState<'ALL' | 'EUROPE' | 'AMERICAS' | 'APAC'>('ALL');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [subStep2, setSubStep2] = useState<'2A' | '2B'>('2A');
  const [startingOffers, setStartingOffers] = useState<Club[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const t = (en: string, de?: string, _ignoredEs?: string) => tr(lang, en, de);

  const [dossierCoach, setDossierCoach] = useState<Coach | null>(null);
  const hasAutostartedRef = useRef(false);

  React.useEffect(() => {
    if (
      !hasAutostartedRef.current &&
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('autostart') === '1' &&
      clubsDb.length > 0
    ) {
      hasAutostartedRef.current = true;
      const params = new URLSearchParams(window.location.search);
      const reqClubId = Number(params.get('clubId'));
      const reqTier = Number(params.get('tier'));
      const baseClub =
        (reqClubId ? clubsDb.find((c) => Number(c.id) === reqClubId) : undefined) ||
        clubsDb.find((c) => c.tier === 1 && (c.country || 'GER') === 'GER') ||
        clubsDb[0];
      const defaultClub = reqTier >= 1 && reqTier <= 11 ? { ...baseClub, tier: reqTier } : baseClub;
      try {
        sessionStorage.setItem(`fms_dismissed_boardroom_${defaultClub.id}`, 'true');
      } catch {
        // Ignore storage error
      }
      const pool = generateCoachMarket(defaultClub.tier || 1, defaultClub.country || 'GER', 50, 0);
      onStartGame({
        club: defaultClub,
        managerName: 'ALEX',
        startYear,
        tactic: 'Total Football',
        nationality: defaultClub.country || 'GER',
        mode: 'standard',
        archetype: 'balanced',
        coach: pool[0],
      });
    }
  }, [clubsDb, onStartGame, startYear]);

  React.useEffect(() => {
    if (step === 4 && selectedClubForArchetype) {
      const tier = selectedClubForArchetype.tier;
      const country = selectedClubForArchetype.country || 'GER';
      let initRep = 50;
      if (archetype === 'legend') initRep += 50;
      if (archetype === 'scout') initRep -= 30;
      const pool = generateCoachMarket(tier, country, initRep, 0);
      // Guarantee at least one coach matches the selected director tactic
      if (!pool.some(c => isTacticalSynergy(c.style, tactic))) {
        if (pool[0]) pool[0].style = tactic;
      }
      setCoachMarket(pool);
    }
  }, [step, selectedClubForArchetype, archetype, tactic]);

  // Keep selected club and starting offers updated if clubsDb changes (e.g. mod loaded or toggled)
  useEffect(() => {
    if (selectedClubForArchetype) {
      const match = clubsDb.find(c => c.id === selectedClubForArchetype.id);
      if (match && (match.name !== selectedClubForArchetype.name || match.logo !== selectedClubForArchetype.logo)) {
        setSelectedClubForArchetype(match);
      }
    }
    if (startingOffers.length > 0) {
      setStartingOffers(prev => prev.map(offer => {
        const match = clubsDb.find(c => c.id === offer.id);
        return match || offer;
      }));
    }
  }, [clubsDb, selectedClubForArchetype?.id]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Validate tierFilter whenever nationality changes, and reset to 'GER' if selected nation is mod-only while mod is inactive
  React.useEffect(() => {
    if (!isModActive && MOD_ONLY_COUNTRIES.includes(nationality)) {
      setNationality('GER');
      setTierFilter('all');
    }
    const maxT = getMaxTier(nationality, clubsDb);
    if (tierFilter !== 'all' && typeof tierFilter === 'number' && tierFilter > maxT) {
      setTierFilter('all');
    }
  }, [nationality, tierFilter, clubsDb, isModActive]);

  const activeCountriesForContinent = useMemo(() => {
    return Object.keys(COUNTRIES).filter((k) => {
      if (!isModActive && MOD_ONLY_COUNTRIES.includes(k)) return false;
      if (continentFilter === 'ALL') return true;
      const eur = UEFA_COUNTRIES;
      const amr = [...CONMEBOL_COUNTRIES, ...CONCACAF_COUNTRIES];
      const asi = AFC_COUNTRIES;
      if (continentFilter === 'EUROPE') return eur.includes(k);
      if (continentFilter === 'AMERICAS') return amr.includes(k);
      if (continentFilter === 'APAC') return asi.includes(k);
      return true;
    });
  }, [continentFilter, isModActive]);

  const availableLeaguesForCountry = useMemo(() => {
    if (nationality === 'ALL') return [];
    
    // Find all clubs in this country from clubsDb
    const clubsInCountry = clubsDb.filter((c) => (c.country || 'GER') === nationality);
    
    // Dynamically discover all tiers present in the database (supports custom community mod tiers)
    const dbTiers: number[] = Array.from(new Set(clubsInCountry.map((c) => c.tier)))
      .filter((t): t is number => typeof t === 'number' && t > 0);
      
    // Also include standard preset tiers for this country if populated
    const standardMax = getMaxTier(nationality, clubsDb);
    const combinedTiers = new Set<number>(dbTiers);
    for (let t = 1; t <= standardMax; t++) {
      if (clubsInCountry.some(c => c.tier === t) || (combinedTiers.size === 0 && t <= 3)) {
        combinedTiers.add(t);
      }
    }

    const sortedTiers = Array.from(combinedTiers).sort((a, b) => a - b);
    const countryLeagues = COUNTRY_LEAGUES[nationality] || {};
    
    return sortedTiers.map((t) => {
      const sampleClub = clubsInCountry.find(c => c.tier === t);
      const customLeagueName = (sampleClub as any)?.leagueName || (sampleClub as any)?.league;
      const info = countryLeagues[t] || getLeagueInfo(t, nationality, customLeagueName);
      return {
        tier: t,
        name: customLeagueName || info?.name || `Tier ${t}`,
        tag: info?.tag || `T${t}`
      };
    });
  }, [nationality, clubsDb]);

  const [sortBy, setSortBy] = useState<'tier' | 'ovr' | 'budget' | 'name'>('tier');

  const displayedClubs = useMemo(() => {
    if (mode !== 'standard') return startingOffers;
    const rawQuery = searchQuery.trim();

    const matchesCountryFilter = (c: Club) => {
      if (nationality === 'ALL') return true;
      return (c.country || 'GER') === nationality;
    };

    const applySort = (list: Club[]) => {
      return [...list].sort((a, b) => {
        if (sortBy === 'ovr') return (b.baseOvr || 0) - (a.baseOvr || 0) || a.tier - b.tier;
        if (sortBy === 'budget') {
          const bBudget = b.currentBudget != null ? parseAndNormalizeModBudget(b.currentBudget, b.tier, b.country || 'GER') : getStartingBudget(b.tier, b.country || 'GER');
          const aBudget = a.currentBudget != null ? parseAndNormalizeModBudget(a.currentBudget, a.tier, a.country || 'GER') : getStartingBudget(a.tier, a.country || 'GER');
          return bBudget - aBudget;
        }
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return a.tier - b.tier || (b.baseOvr || 0) - (a.baseOvr || 0) || a.name.localeCompare(b.name);
      });
    };

    if (!rawQuery) {
      const filtered = clubsDb.filter(
        (c) =>
          matchesCountryFilter(c) &&
          (tierFilter === 'all' || c.tier === tierFilter)
      );
      return applySort(filtered);
    }

    // Normalization helper: strips accents, diacritics, and non-alphanumeric chars
    const normalize = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const qNorm = normalize(rawQuery);
    const tokens = qNorm.split(' ').filter(Boolean);

    const isMatch = (c: Club) => {
      const countryKey = c.country || 'GER';
      const countryObj = COUNTRIES[countryKey];
      const leagueInfo = getLeagueInfo(c.tier, countryKey);

      const nameNorm = normalize(c.name);
      const countryNorm = normalize(countryKey);
      const countryNameNorm = normalize(countryObj?.name || '');
      const leagueNameNorm = normalize(leagueInfo?.name || '');

      const aliases: string[] = [];
      if (nameNorm.includes('richmond')) aliases.push('lasso', 'greyhounds', 'ted');
      if (nameNorm.includes('dortmund')) aliases.push('bvb', 'borussia');
      if (nameNorm.includes('bayern')) aliases.push('fcb', 'munich', 'muenchen', 'bavaria');
      if (nameNorm.includes('barcelona')) aliases.push('barca', 'blaugrana');
      if (nameNorm.includes('real madrid')) aliases.push('galacticos', 'merengues', 'rm');
      if (nameNorm.includes('atletico madrid')) aliases.push('atleti', 'colchoneros');
      if (nameNorm.includes('manchester city')) aliases.push('man city', 'citizens', 'mcfc');
      if (nameNorm.includes('manchester united')) aliases.push('man utd', 'man united', 'mufc', 'red devils');
      if (nameNorm.includes('tottenham')) aliases.push('spurs');
      if (nameNorm.includes('arsenal')) aliases.push('gunners');
      if (nameNorm.includes('liverpool')) aliases.push('reds', 'lfc');
      if (nameNorm.includes('chelsea')) aliases.push('blues', 'cfc');
      if (nameNorm.includes('paris saint germain') || nameNorm.includes('psg')) aliases.push('paris', 'psg');
      if (nameNorm.includes('juventus')) aliases.push('juve', 'bianconeri');
      if (nameNorm.includes('inter') && !nameNorm.includes('miami')) aliases.push('nerazzurri', 'inter milan');
      if (nameNorm.includes('milan') && !nameNorm.includes('inter')) aliases.push('ac milan', 'rossoneri');
      if (nameNorm.includes('roma')) aliases.push('giallorossi');
      if (nameNorm.includes('napoli')) aliases.push('partenopei');
      if (nameNorm.includes('benfica')) aliases.push('slb', 'eagles');
      if (nameNorm.includes('sporting')) aliases.push('scp', 'lions');
      if (nameNorm.includes('porto')) aliases.push('fcp', 'dragons');
      if (nameNorm.includes('toronto')) aliases.push('tfc', 'canada');
      if (nameNorm.includes('montreal')) aliases.push('cfm', 'impact', 'canada');
      if (nameNorm.includes('vancouver')) aliases.push('whitecaps', 'caps', 'canada');
      if (nameNorm.includes('wrexham')) aliases.push('hollywood', 'ryan reynolds');
      if (nameNorm.includes('miami')) aliases.push('inter miami', 'messi');

      const aliasNorm = aliases.map(normalize).join(' ');
      const fullSearchableText = `${nameNorm} ${countryNorm} ${countryNameNorm} ${leagueNameNorm} tier ${c.tier} ${aliasNorm}`;
      return tokens.every((token) => fullSearchableText.includes(token));
    };

    // 1. Search in current filtered country first (ignoring tierFilter during query)
    if (nationality !== 'ALL') {
      const natClubs = clubsDb.filter((c) => matchesCountryFilter(c));
      const natMatches = natClubs.filter(isMatch);
      if (natMatches.length > 0) {
        return applySort(natMatches);
      }
    }

    // 2. Global search across ALL countries if no match in current country or nationality === 'ALL'
    return applySort(clubsDb.filter(isMatch));
  }, [mode, searchQuery, clubsDb, nationality, tierFilter, startingOffers, sortBy]);

  // Pre-warm crests for currently displayed clubs so scrolling and browsing has zero pop-in
  useEffect(() => {
    if (step === 3 && Array.isArray(displayedClubs) && displayedClubs.length > 0) {
      prewarmClubsLogos(displayedClubs.slice(0, 30));
    }
  }, [step, displayedClubs]);

  const [startInLowestLeague, setStartInLowestTier] = useState(false);

  
  const generateRealisticOffers = () => {
      let natClubs = clubsDb;
      let targetTier = 5;

      if (nationality !== 'ALL') {
        natClubs = clubsDb.filter((c) => (c.country || 'GER') === nationality);
        targetTier = getMaxTier(nationality, clubsDb);
        // If Germany, realistic default starts at tier 8
        if (nationality === 'GER') {
          targetTier = 8;
        }
      } else {
        // If ALL countries, just pick very low tier clubs generally (e.g. tier >= 4)
        natClubs = clubsDb;
        targetTier = 4;
      }

      let lowerClubs = natClubs.filter((c) => c.tier >= targetTier).sort(() => 0.5 - Math.random());
      if (lowerClubs.length < 3) lowerClubs = natClubs.filter((c) => c.tier >= targetTier - 1).sort(() => 0.5 - Math.random());
      if (lowerClubs.length < 3) lowerClubs = natClubs.sort(() => 0.5 - Math.random());
      setStartingOffers(lowerClubs.slice(0, 3));
  };

  const handleGoToStep3 = () => {
    if (!managerName.trim()) {
      setNameError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => nameInputRef.current?.focus(), 100);
      return;
    }
    if (mode === 'realistic' && clubsDb.length > 0) {
      generateRealisticOffers();
    }
    if (nationality !== 'ALL') {
      setTierFilter(1);
    }
    setShowAllClubs(false);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`w-full ${step === 3 ? 'max-w-6xl' : 'max-w-5xl'} px-3 sm:px-4 mt-4 md:mt-8 mx-auto transition-all duration-300`}>

      {/* Mod Importer Modal */}
      {showModModal && (
        <ModModal
          lang={lang}
          clubsDb={clubsDb}
          isModActive={isModActive}
          onUpdateClubsDb={(newClubs, active) => {
            if (onToggleMod) {
              onToggleMod(active, newClubs);
            } else if (setClubsDb) {
              setClubsDb(newClubs);
            }
            if (selectedClubForArchetype) {
              const updated = newClubs.find(c => c.id === selectedClubForArchetype.id);
              if (updated) setSelectedClubForArchetype(updated);
            }
            setStartingOffers(prev => prev.map(offer => {
              const match = newClubs.find(c => c.id === offer.id);
              return match || offer;
            }));
          }}
          showToast={showToast}
          onClose={() => setShowModModal(false)}
        />
      )}
      {/* Step Navigation Header (Warm Editorial Progress Tracker) */}
      {step > 1 && (
        <div className="max-w-xl mx-auto mb-8 px-4">
          <div className="flex items-center justify-between relative">
            {/* Minimalist connecting track */}
            <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-[#E6E3DC] -translate-y-1/2 pointer-events-none overflow-hidden rounded-full">
              <div 
                className="h-full bg-[#18191F] transition-all duration-500 rounded-full"
                style={{
                  width: `${
                    step === 1
                      ? 0
                      : step === 2
                      ? subStep2 === '2B'
                        ? (1.5 / 3) * 100
                        : (1 / 3) * 100
                      : ((step - 1) / 3) * 100
                  }%`,
                }}
              />
            </div>
            
            {[
              { num: 1, title: isDe ? 'Modus' : 'Mode', icon: 'fa-gamepad' },
              { num: 2, title: isDe ? 'Profil' : 'Profile', icon: 'fa-user-tie' },
              { num: 3, title: isDe ? 'Verein' : 'Club', icon: 'fa-shield-halved' },
              { num: 4, title: isDe ? 'Trainer' : 'Staff', icon: 'fa-clipboard-user' },
            ].map(s => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              const canNavigate = step > s.num;
              
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (canNavigate) {
                      setStep(s.num);
                      if (s.num === 2) setSubStep2('2A');
                    }
                  }}
                  disabled={!canNavigate}
                  className={`relative z-10 flex flex-col items-center gap-1.5 transition ${canNavigate ? 'cursor-pointer group' : 'cursor-default'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#18191F] text-white shadow-[0_6px_16px_rgba(24,25,31,0.18)] scale-105'
                      : isCompleted
                      ? 'bg-[#EAE7E0] text-[#18191F] border border-[#D4CFC4] group-hover:bg-[#E0DDD4]'
                      : 'bg-white text-[#9A9890] border border-[#E6E3DC]'
                  }`}>
                    {isCompleted ? <i className="fa-solid fa-check text-[10px]"></i> : s.num}
                  </div>
                  <span className={`text-[11px] font-semibold tracking-wide transition-colors ${
                    isCurrent ? 'text-[#18191F]' : isCompleted ? 'text-[#52525B]' : 'text-[#9A9890]'
                  }`}>
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 1: Game Mode */}
      {step === 1 && (
        <>
          <div className="max-w-2xl mx-auto text-center fade-in px-4 py-4 relative">
          <div className="w-20 h-20 border border-[#E6E3DC] rounded-3xl mx-auto overflow-hidden shadow-[0_10px_28px_rgba(24,25,31,0.12)] mb-5 bg-[#18191F]">
            <img src="/assets/a_footballsim_logo.jpg" alt="Football Manager Sim Logo" className="w-full h-full object-cover" />
          </div>

          {/* Version pill & Tiny CR27 Community Mod Icon Button */}
          <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
            <button 
              onClick={() => onShowAbout && onShowAbout()} 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E6E3DC] shadow-[0_2px_10px_rgba(24,25,31,0.04)] cursor-pointer hover:bg-[#FAF9F6] hover:border-[#D4CFC4] transition group"
              title="v3.0: 5-Tab 3D Broadcast Workspace, Live 3D Stadium & Campus, Unified Standings Engine & Coaching Hub (v2.6, v2.3 & v2.2 Archived)"
            >
              <span 
                className="bg-[#18191F] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full tracking-wider shadow-sm"
              >
                v 3.0
              </span>
              <span className="text-[#4B5563] group-hover:text-[#18191F] transition text-xs font-semibold pr-1 tracking-wide flex items-center gap-1.5">
                3D Broadcast Workspace &amp; Live Stadium v3.0 <span className="text-[10px] text-[#9A9890] hidden sm:inline">(v2.6 Archived)</span> <i className="fa-solid fa-chevron-right text-[9px] opacity-60 group-hover:opacity-100 transition"></i>
              </span>
            </button>

            {/* Tiny CR27 Community Mod Icon Button */}
            <button
              type="button"
              onClick={() => setShowModModal(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all shadow-sm active:scale-95 ${
                isModActive
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-[#E6E3DC] bg-white text-[#52525B] hover:text-[#18191F] hover:bg-[#FAF9F6]'
              }`}
              title="CR27_Footy Community Mod (Toggle & JSON Export/Import)"
            >
              <i className="fa-solid fa-shield-halved text-xs text-sky-600"></i>
              <span className="text-[11px] font-bold">CR27</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isModActive ? 'bg-emerald-500 animate-pulse' : 'bg-[#9A9890]'}`}></span>
            </button>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-[#18191F] tracking-tight mb-2.5">
            {t('Football Manager Sim', 'Fussball Manager Sim')}
          </h1>
          <p className="text-sm md:text-base text-[#6B6A64] mb-8 font-normal max-w-lg mx-auto leading-relaxed">
            {t(
              'Lead a club over 35 seasons. Hire coaches, scout talent, and build a dynasty.',
              'Fuehre einen Verein ueber 35 Saisons. Stelle Trainer ein, scoute Talente und baue eine Dynastie auf.'
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto fade-in-delay-1 text-center">
            <div
              onClick={() => setMode('standard')}
              className={`p-6 rounded-[24px] border transition-all cursor-pointer relative overflow-hidden flex flex-col items-center text-center justify-between min-h-[168px] ${
                mode === 'standard'
                  ? 'bg-white border-[#18191F] shadow-[0_12px_32px_rgba(24,25,31,0.1)] ring-2 ring-[#18191F]/10'
                  : 'bg-white/80 hover:bg-white border-[#E6E3DC] hover:border-[#CBC7BC] shadow-[0_4px_16px_rgba(24,25,31,0.04)]'
              }`}
            >
              {mode === 'standard' && (
                <span className="absolute top-3.5 right-3.5 text-[10px] font-bold uppercase tracking-wider bg-[#18191F] text-white px-2.5 py-0.5 rounded-full">
                  {isDe ? 'Aktiv' : 'Selected'}
                </span>
              )}
              <div className="flex flex-col items-center w-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3 ${
                  mode === 'standard' ? 'bg-[#18191F] text-white font-bold shadow-sm' : 'bg-[#F6F5F1] text-[#18191F] border border-[#E6E3DC]'
                }`}>
                  <i className="fas fa-list"></i>
                </div>
                <div className="font-bold text-[#18191F] text-base mb-1">
                  {t('Pick Any Club', 'Freie Auswahl')}
                </div>
                <div className="text-xs text-[#6B6A64] font-normal leading-relaxed max-w-[220px]">
                  {t(
                    'Choose any of the 1,200+ clubs worldwide.',
                    'Waehle einen beliebigen von 1.200+ Vereinen weltweit.'
                  )}
                </div>
              </div>
              <div className="pt-3 mt-4 border-t border-[#EAE7E0] text-[11px] text-[#6B6A64] font-medium flex items-center justify-center gap-1.5 w-full">
                <i className="fa-solid fa-earth-americas text-[10px] text-[#6B6A64]"></i>
                <span>{isDe ? '1.202 Vereine weltweit' : '1,202 clubs worldwide'}</span>
              </div>
            </div>

            <div
              onClick={() => setMode('realistic')}
              className={`p-6 rounded-[24px] border transition-all cursor-pointer relative overflow-hidden flex flex-col items-center text-center justify-between min-h-[168px] ${
                mode === 'realistic'
                  ? 'bg-white border-[#18191F] shadow-[0_12px_32px_rgba(24,25,31,0.1)] ring-2 ring-[#18191F]/10'
                  : 'bg-white/80 hover:bg-white border-[#E6E3DC] hover:border-[#CBC7BC] shadow-[0_4px_16px_rgba(24,25,31,0.04)]'
              }`}
            >
              {mode === 'realistic' && (
                <span className="absolute top-3.5 right-3.5 text-[10px] font-bold uppercase tracking-wider bg-[#18191F] text-white px-2.5 py-0.5 rounded-full">
                  {isDe ? 'Aktiv' : 'Selected'}
                </span>
              )}
              <div className="flex flex-col items-center w-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3 ${
                  mode === 'realistic' ? 'bg-[#18191F] text-white font-bold shadow-sm' : 'bg-[#F6F5F1] text-[#18191F] border border-[#E6E3DC]'
                }`}>
                  <i className="fas fa-bolt"></i>
                </div>
                <div className="font-bold text-[#18191F] text-base mb-1">
                  {t('Realistic Career', 'Realistische Karriere')}
                </div>
                <div className="text-xs text-[#6B6A64] font-normal leading-relaxed max-w-[220px]">
                  {t(
                    'Authentic job offers & board pressure.',
                    'Authentische Job-Angebote & Vorstandsdruck.'
                  )}
                </div>
              </div>
              <div className="pt-3 mt-4 border-t border-[#EAE7E0] text-[11px] text-[#6B6A64] font-medium flex items-center justify-center gap-1.5 w-full">
                <i className="fa-solid fa-briefcase text-[10px] text-[#6B6A64]"></i>
                <span>{isDe ? 'Grassroots-Angebote' : 'Grassroots offers'}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 fade-in-delay-2 pb-6 flex flex-col items-center justify-center gap-4">
            <button
              onClick={() => setStep(2)}
              className="bg-[#18191F] hover:bg-[#2A2B33] text-white text-sm md:text-base font-semibold py-3.5 px-10 rounded-2xl transition active:scale-95 shadow-[0_8px_24px_rgba(24,25,31,0.18)] cursor-pointer min-w-[220px] flex items-center justify-center gap-2"
            >
              <span>{t('Continue', 'Weiter')}</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
            
            <button 
              onClick={onShowLeaderboard} 
              className="text-xs font-bold text-[#52525B] hover:text-[#18191F] transition-colors cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <i className="fas fa-trophy text-xs text-amber-600"></i> {t('View Global Leaderboard', 'Globale Rangliste')}
            </button>
          </div>
        </div>
        </>
      )}

      {/* STEP 2: Director Profile (Warm Editorial: 2A Heritage -> 2B Managerial DNA) */}
      {step === 2 && (
        <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-12">
          <AnimatePresence mode="wait">
            {subStep2 === '2A' ? (
              /* ================= SCREEN 2A: HERITAGE & ROOTS ================= */
              <motion.div
                key="screen-2a"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="fade-in"
              >
                {/* Header Title with Editorial Kicker */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E6E3DC] text-[#52525B] text-[11px] font-semibold tracking-wide mb-3 shadow-sm">
                    <span>{t('Identity & Country', 'Identität & Land')}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-[#18191F] tracking-tight">
                    {t('Director Identity', 'Sportdirektor-Identität')}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#6B6A64] mt-2 max-w-lg mx-auto font-normal leading-relaxed">
                    {t('Establish your managerial persona, inaugural era, and starting federation roots.', 'Definiere deinen Namen, deine Start-Ära und dein Heimatland.')}
                  </p>
                </div>

                {/* Mobile-First Bento Dual-Card Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8 items-stretch">
                  {/* Card 1: Director Credentials (Left 6 Cols) */}
                  <div className="lg:col-span-6 bg-white rounded-[24px] p-6 sm:p-7 border border-[#E6E3DC] shadow-[0_6px_24px_rgba(24,25,31,0.06)] relative overflow-hidden flex flex-col justify-between text-left h-full">
                    <div className="flex flex-col justify-between h-full space-y-6">
                      {/* Section Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#F6F5F1] text-[#18191F] border border-[#E6E3DC] flex items-center justify-center text-xs">
                            <i className="fa-solid fa-user-tie"></i>
                          </div>
                          <div>
                            <h2 className="text-xs sm:text-sm font-bold text-[#18191F] tracking-wide">
                              {t('Personal Dossier', 'Personal-Dossier')}
                            </h2>
                            <span className="text-[11px] text-[#6B6A64] font-normal">
                              {t('Name & Inception Era', 'Name & Startjahr')}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-[#52525B] bg-[#F6F5F1] px-2.5 py-0.5 rounded-full border border-[#E6E3DC]">
                          1 of 2
                        </span>
                      </div>

                      {/* Name Input Field */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-[#6B6A64] tracking-wide uppercase">
                            {t('Sporting Director Name', 'Name des Direktors')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
                              setManagerName(name);
                              setNameError(false);
                            }}
                            className="text-[#18191F] hover:bg-[#EAE7E0] px-2.5 py-1 rounded-lg bg-[#F6F5F1] border border-[#E6E3DC] text-[11px] font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                          >
                            <i className="fa-solid fa-dice text-[11px] text-[#6B6A64]"></i>
                            <span>{t('Random', 'Zufall')}</span>
                          </button>
                        </div>

                        <div className={`transition-all duration-200 p-3.5 rounded-2xl border ${
                          nameError
                            ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200'
                            : 'bg-[#F6F5F1] border-[#E6E3DC] hover:border-[#CBC7BC] focus-within:border-[#18191F] focus-within:ring-2 focus-within:ring-[#18191F]/10 focus-within:bg-white'
                        } relative flex items-center`}>
                          <input
                            ref={nameInputRef}
                            type="text"
                            value={managerName}
                            onChange={(e) => {
                              setManagerName(e.target.value);
                              setNameError(false);
                            }}
                            placeholder={t('E.G. ALEX FERGUSON', 'Z.B. JÜRGEN KLOPP')}
                            className="bg-transparent w-full text-[#18191F] font-semibold text-base sm:text-lg outline-none uppercase placeholder-[#9A9890] pr-7 tracking-wide font-sans"
                          />
                          {managerName && (
                            <button
                              type="button"
                              onClick={() => setManagerName('')}
                              className="absolute right-3 text-[#9A9890] hover:text-[#18191F] p-1 transition cursor-pointer"
                            >
                              <i className="fa-solid fa-xmark text-xs"></i>
                            </button>
                          )}
                        </div>
                        {nameError && (
                          <span className="text-[11px] font-medium text-rose-600 mt-1.5 inline-block">
                            {t('Please enter a director name to proceed.', 'Bitte gib einen Namen ein, um fortzufahren.')}
                          </span>
                        )}
                      </div>

                      {/* Start Year Dial / Controls */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-[#6B6A64] tracking-wide uppercase">
                            {t('Inaugural Season Era', 'Start-Saison')}
                          </span>
                          <span className="text-[11px] text-[#52525B] font-semibold tabular-nums">
                            {startYear} Kickoff
                          </span>
                        </div>

                        <div className="bg-[#F6F5F1] rounded-2xl p-3 border border-[#E6E3DC] flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setStartYear((prev) => Math.max(1950, prev - 1))}
                            className="w-10 h-10 rounded-xl bg-white hover:bg-[#FAF9F6] text-[#18191F] flex items-center justify-center transition border border-[#E6E3DC] active:scale-95 cursor-pointer shrink-0 shadow-sm"
                            title="-1 Year"
                          >
                            <i className="fa-solid fa-minus text-xs"></i>
                          </button>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl sm:text-3xl font-bold text-[#18191F] tracking-tight leading-none tabular-nums">
                              {startYear}
                            </span>
                            <span className="text-[10px] font-semibold text-[#6B6A64] uppercase tracking-wider mt-1">
                              {startYear === currentYear ? t('Modern Era', 'Moderne Ära') : t('Historical Era', 'Historische Ära')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStartYear((prev) => Math.min(currentYear, prev + 1))}
                            className="w-10 h-10 rounded-xl bg-white hover:bg-[#FAF9F6] text-[#18191F] flex items-center justify-center transition border border-[#E6E3DC] active:scale-95 cursor-pointer shrink-0 shadow-sm"
                            title="+1 Year"
                          >
                            <i className="fa-solid fa-plus text-xs"></i>
                          </button>
                        </div>

                        {/* Era Quick Presets */}
                        <div className="flex items-center gap-1.5 mt-2.5 justify-center flex-wrap">
                          {[currentYear, 2010, 1990, 1974, 1954].map((y) => (
                            <button
                              key={y}
                              type="button"
                              onClick={() => setStartYear(y)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg transition cursor-pointer tabular-nums ${
                                startYear === y
                                  ? 'bg-[#18191F] text-white font-semibold shadow-sm'
                                  : 'text-[#6B6A64] hover:text-[#18191F] hover:bg-[#F6F5F1] border border-transparent'
                              }`}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Federation Roots & Starting Country (Right 6 Cols) */}
                  <div className="lg:col-span-6 bg-white rounded-[24px] p-6 sm:p-7 border border-[#E6E3DC] shadow-[0_6px_24px_rgba(24,25,31,0.06)] relative overflow-hidden flex flex-col justify-between text-left h-full">
                    <div className="flex flex-col justify-between h-full space-y-4">
                      {/* Section Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#F6F5F1] text-[#18191F] border border-[#E6E3DC] flex items-center justify-center text-xs">
                            <i className="fa-solid fa-earth-americas"></i>
                          </div>
                          <div>
                            <h2 className="text-xs sm:text-sm font-bold text-[#18191F] tracking-wide">
                              {t('Starting Country', 'Start-Land')}
                            </h2>
                            <span className="text-[11px] text-[#6B6A64] font-normal">
                              {t('Domestic Pyramid & Heritage', 'Ligensystem & Verband')}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-[#52525B] bg-[#F6F5F1] px-2.5 py-0.5 rounded-full border border-[#E6E3DC]">
                          {nationality}
                        </span>
                      </div>

                      {/* Selected Country Spotlight Banner */}
                      <div className="p-3 rounded-2xl bg-[#F6F5F1] border border-[#E6E3DC] flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl select-none">{COUNTRIES[nationality]?.flag || '🌍'}</span>
                          <div>
                            <div className="text-sm font-bold text-[#18191F] flex items-center gap-2">
                              <span>{COUNTRIES[nationality]?.name || 'Germany'}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-white text-[#18191F] border border-[#E6E3DC]">
                                Active
                              </span>
                            </div>
                            <div className="text-[11px] text-[#6B6A64] font-normal">
                              {UEFA_COUNTRIES.includes(nationality) ? 'Europe' : (CONMEBOL_COUNTRIES.includes(nationality) || CONCACAF_COUNTRIES.includes(nationality)) ? 'Americas' : 'Asia-Pacific'} • Tier 1-{getMaxTier(nationality, clubsDb)} Leagues
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-[#52525B] font-bold uppercase tracking-wider">
                            {nationality}
                          </span>
                        </div>
                      </div>

                      {/* Quick Search & Filter Bar */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative flex-1">
                          <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9A9890] text-[10px]"></i>
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder={t(`Filter ${isModActive ? 34 : 21} countries...`, `${isModActive ? 34 : 21} Länder filtern...`)}
                            className="w-full bg-[#F6F5F1] text-xs text-[#18191F] pl-7 pr-2.5 py-1.5 rounded-xl border border-[#E6E3DC] focus:border-[#18191F] focus:bg-white outline-none placeholder-[#9A9890] transition font-normal"
                          />
                          {countrySearch && (
                            <button
                              type="button"
                              onClick={() => setCountrySearch('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9A9890] hover:text-[#18191F] text-xs"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Continent Filter Segmented Control */}
                      <div className="flex bg-[#F6F5F1] p-1 rounded-xl border border-[#E6E3DC] mb-2 gap-1">
                        {(['ALL', 'EUROPE', 'AMERICAS', 'APAC'] as const).map((cont) => (
                          <button
                            key={cont}
                            type="button"
                            onClick={() => {
                              setContinentFilter(cont);
                              setCountrySearch('');
                              if (cont === 'EUROPE') setNationality('GER');
                              else if (cont === 'AMERICAS') setNationality('USA');
                              else if (cont === 'APAC') setNationality('JPN');
                              else setNationality('GER');
                              setTierFilter('all');
                              setStartingOffers([]);
                            }}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-semibold tracking-wider transition-all cursor-pointer ${
                              continentFilter === cont
                                ? 'bg-[#18191F] text-white shadow-sm'
                                : 'text-[#6B6A64] hover:text-[#18191F] hover:bg-white/60'
                            }`}
                          >
                            {cont === 'ALL' ? 'All' : cont === 'EUROPE' ? 'Europe' : cont === 'AMERICAS' ? 'Americas' : 'APAC'}
                          </button>
                        ))}
                      </div>

                      {/* Country Chips (Horizontally scrolling on mobile, 3-col grid on sm+) */}
                      <div className="flex sm:grid sm:grid-cols-3 overflow-x-auto hide-scrollbar sm:overflow-y-auto sm:max-h-36 gap-1.5 pb-1 sm:pr-1">
                        {Object.keys(COUNTRIES)
                          .filter((k) => {
                            if (!isModActive && MOD_ONLY_COUNTRIES.includes(k)) return false;
                            if (countrySearch.trim()) {
                              const q = countrySearch.toLowerCase().trim();
                              return COUNTRIES[k].name.toLowerCase().includes(q) || k.toLowerCase().includes(q);
                            }
                            if (continentFilter === 'ALL') return true;
                            const eur = UEFA_COUNTRIES;
                            const amr = [...CONMEBOL_COUNTRIES, ...CONCACAF_COUNTRIES];
                            const asi = AFC_COUNTRIES;
                            if (continentFilter === 'EUROPE') return eur.includes(k);
                            if (continentFilter === 'AMERICAS') return amr.includes(k);
                            if (continentFilter === 'APAC') return asi.includes(k);
                            return true;
                          })
                          .map((key) => {
                            const isActive = COUNTRIES[key].active;
                            const isSelected = nationality === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  if (isActive) {
                                    setNationality(key);
                                    setTierFilter('all');
                                    setStartingOffers([]);
                                  }
                                }}
                                disabled={!isActive}
                                className={`min-w-[125px] sm:min-w-0 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-200 flex items-center justify-between shrink-0 ${
                                  isSelected
                                    ? 'bg-[#18191F] text-white font-semibold shadow-sm'
                                    : 'bg-[#F6F5F1] text-[#3F3F46] border border-[#E6E3DC] hover:border-[#18191F]/30 hover:bg-[#EFECE4]'
                                } ${!isActive ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span>{COUNTRIES[key].flag}</span>
                                  <span className="truncate">{COUNTRIES[key].name}</span>
                                </span>
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1"></span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Mobile Action Bar */}
                <div className="sticky bottom-0 z-40 bg-[#F5F3EE]/95 backdrop-blur-md border-t border-[#E6E3DC] px-4 py-3 -mx-2 sm:mx-0 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:shadow-none sm:backdrop-blur-none flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-white hover:bg-[#FAF9F6] text-[#18191F] text-xs sm:text-sm font-semibold py-3.5 px-6 rounded-2xl border border-[#E6E3DC] transition active:scale-95 cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <i className="fa-solid fa-arrow-left text-xs"></i>
                    <span>{t('Back', 'Zurück')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!managerName.trim()) {
                        setNameError(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setTimeout(() => nameInputRef.current?.focus(), 100);
                        return;
                      }
                      setSubStep2('2B');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#18191F] hover:bg-[#2A2B33] text-white text-xs sm:text-sm font-semibold tracking-wide py-3.5 px-8 sm:px-10 rounded-2xl transition-all duration-200 active:scale-95 shadow-[0_8px_24px_rgba(24,25,31,0.18)] cursor-pointer flex-1 sm:flex-none sm:min-w-[240px] flex items-center justify-center gap-2.5"
                  >
                    <span>{t('Continue to Managerial DNA', 'Weiter zur Manager-DNA')}</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ================= SCREEN 2B: MANAGERIAL DNA & TACTICS ================= */
              <motion.div
                key="screen-2b"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                className="fade-in"
              >
                {/* Header Title with Editorial Kicker */}
                <div className="text-center mb-7">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E6E3DC] text-[#52525B] text-[11px] font-semibold tracking-wide mb-3 shadow-sm">
                    <span>{t('Career Path & Tactical Philosophy', 'Karrierepfad & Philosophie')}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-[#18191F] tracking-tight">
                    {t('Director Vision', 'Sportdirektor-Vision')}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#6B6A64] mt-2 max-w-xl mx-auto font-normal leading-relaxed">
                    {t('Every great football project starts with an identity. Choose the story of your tenure.', 'Jedes erfolgreiche Vereinsprojekt beginnt mit einer klaren Vision. Wähle den Schwerpunkt deiner Ära.')}
                  </p>

                  {/* Director Credentials Breadcrumb Pill */}
                  <div className="inline-flex items-center gap-2.5 mt-3 px-3.5 py-1.5 rounded-full bg-white border border-[#E6E3DC] text-xs text-[#52525B] shadow-sm">
                    <span className="text-[#18191F] font-semibold">
                      {managerName.trim() || 'Director'}
                    </span>
                    <span className="text-[#D4CFC4]">•</span>
                    <span className="text-[#6B6A64] font-normal tabular-nums">
                      {startYear}
                    </span>
                    <span className="text-[#D4CFC4]">•</span>
                    <span className="text-[#3F3F46] flex items-center gap-1.5 font-medium">
                      <span>{COUNTRIES[nationality]?.flag}</span>
                      <span>{COUNTRIES[nationality]?.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSubStep2('2A')}
                      className="ml-1 text-[11px] text-[#18191F] hover:underline font-semibold cursor-pointer"
                    >
                      {t('Edit', 'Ändern')}
                    </button>
                  </div>
                </div>

                {/* 4 Story-Driven Career Blueprints */}
                <div className="mb-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        id: 'scout',
                        title: t('The Academy Architect', 'Der NLZ-Architekt'),
                        badge: t('Youth Dynasty', 'Nachwuchs-Dynastie'),
                        icon: 'fa-magnifying-glass',
                        story: t(
                          'Build a sustainable dynasty. You prioritize world-class scouting networks, elite youth facilities, and cultivating homegrown wonderkids.',
                          'Baue eine nachhaltige Dynastie auf. Fokus auf modernste Nachwuchs-Förderung, weltweites Scouting und flüssigen Angriffsfußball.'
                        ),
                        advantage: t('-35% Academy Upgrade Costs · Wonderkid Pipeline', '-35% NLZ-Ausbaukosten · Top-Talentförderung'),
                        defaultTactic: 'Total Football',
                        tacticLabel: t('Fluid Attack (Total Football)', 'Flüssiger Angriff (Total Football)'),
                      },
                      {
                        id: 'legend',
                        title: t('The Dressing Room Icon', 'Die Vereinslegende'),
                        badge: t('Authority & Morale', 'Autorität & Moral'),
                        icon: 'fa-star',
                        story: t(
                          'A revered football figure returning home. Your presence commands instant board patience, unshakeable dressing room respect, and cup spirit.',
                          'Eine verehrte Ikone übernimmt das Ruder. Dein Name garantiert sofortiges Vorstandsvertrauen, hohe Moral und Pokalsieger-Mentalität.'
                        ),
                        advantage: t('Instant Board Respect · +5 Squad Morale', 'Sofortiges Vorstandsvertrauen · +5 Moral'),
                        defaultTactic: 'Gegenpressing',
                        tacticLabel: t('High Press (Gegenpressing)', 'Hohes Pressing (Gegenpressing)'),
                      },
                      {
                        id: 'finance',
                        title: t('The Commercial Powerhouse', 'Der Finanz-Stratege'),
                        badge: t('Transfer War Chest', 'Transfer-Dominanz'),
                        icon: 'fa-chart-line',
                        story: t(
                          'A master of the boardroom and the transfer market. You negotiate lucrative sponsor deals, maximize ticket yields, and build a war chest.',
                          'Wirtschaftliche Überlegenheit. Verhandle Rekord-Sponsorendeals, maximiere Spieltagserlöse und sichere dir ein massives Transferbudget.'
                        ),
                        advantage: t('+25% Transfer Budget · +20% Sponsors', '+25% Transferbudget · +20% Sponsoren'),
                        defaultTactic: 'Direct Counter',
                        tacticLabel: t('Lethal Counter (Direct Counter)', 'Lethale Konter (Direct Counter)'),
                      },
                      {
                        id: 'balanced',
                        title: t('The Balanced Traditionalist', 'Der ausgewogene Klassiker'),
                        badge: t('Neutral Clean Slate', 'Neutraler Start'),
                        icon: 'fa-scale-balanced',
                        story: t(
                          'A complete clean slate for the football purist. An uncompromised foundation with equal focus across youth, commercial growth, and squad management.',
                          'Ein neutraler Neustart für den Puristen. Ausgewogene Ausgangsbedingungen ohne Nachteile oder Vorfestlegungen.'
                        ),
                        advantage: t('Neutral Slate · Balanced Fundamentals', 'Neutraler Start · Ausgewogene Bedingungen'),
                        defaultTactic: 'Tiki-Taka',
                        tacticLabel: t('Control (Tiki-Taka)', 'Positionsspiel & Kontrolle (Tiki-Taka)'),
                      },
                    ].map((vision) => {
                      const isSelected = archetype === vision.id;
                      return (
                        <button
                          key={vision.id}
                          type="button"
                          onClick={() => {
                            setArchetype(vision.id as any);
                            setTactic(vision.defaultTactic);
                          }}
                          className={`p-5 rounded-[24px] border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between group active:scale-[0.98] relative overflow-hidden ${
                            isSelected
                              ? 'bg-white border-[#18191F] ring-2 ring-[#18191F]/10 shadow-[0_12px_32px_rgba(24,25,31,0.1)] scale-[1.01]'
                              : 'bg-white/80 hover:bg-white border-[#E6E3DC] hover:border-[#CBC7BC] shadow-[0_4px_16px_rgba(24,25,31,0.04)]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm transition-colors ${
                                isSelected
                                  ? 'bg-[#18191F] text-white shadow-sm'
                                  : 'bg-[#F6F5F1] border border-[#E6E3DC] text-[#18191F]'
                              }`}>
                                <i className={`fas ${vision.icon}`}></i>
                              </div>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                                isSelected
                                  ? 'bg-[#18191F] text-white font-bold shadow-sm'
                                  : 'border border-[#CBC7BC] group-hover:border-[#18191F]'
                              }`}>
                                {isSelected && <i className="fa-solid fa-check"></i>}
                              </div>
                            </div>

                            <div className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-2 transition-colors ${
                              isSelected
                                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                : 'bg-[#F6F5F1] text-[#6B6A64] border border-[#E6E3DC]'
                            }`}>
                              {vision.badge}
                            </div>

                            <h3 className="font-bold text-[#18191F] text-base tracking-tight mb-2">
                              {vision.title}
                            </h3>

                            <p className="text-[12px] text-[#6B6A64] font-normal leading-relaxed mb-4">
                              {vision.story}
                            </p>
                          </div>

                          <div>
                            <div className={`text-[11px] font-semibold p-2.5 rounded-2xl border transition-colors leading-snug mb-3 ${
                              isSelected
                                ? 'bg-[#F6F5F1] text-[#18191F] border-[#D4CFC4]'
                                : 'bg-[#F6F5F1] text-[#52525B] border-[#EAE7E0]'
                            }`}>
                              <i className="fa-solid fa-bolt text-[9px] mr-1.5 text-amber-600"></i>
                              <span>{vision.advantage}</span>
                            </div>

                            <div className="text-[11px] text-[#6B6A64] flex items-center justify-between pt-2 border-t border-[#EAE7E0]">
                              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#9A9890]">
                                {t('Tactical Style', 'Spielstil')}
                              </span>
                              <span className={`font-semibold ${isSelected ? 'text-[#18191F]' : 'text-[#52525B]'}`}>
                                {vision.tacticLabel}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tactical Alignment Bar */}
                <div className="bg-white border border-[#E6E3DC] rounded-[24px] p-4 sm:p-5 mb-8 text-left shadow-[0_6px_24px_rgba(24,25,31,0.06)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#18191F] text-white flex items-center justify-center text-sm shadow-sm shrink-0">
                        <i className={`fas ${PHILOSOPHIES[tactic]?.icon || 'fa-chess-board'}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase font-semibold text-[#6B6A64] tracking-wider">
                            {t('Tactical Philosophy', 'Taktische Ausrichtung')}
                          </span>
                          <span className="text-[11px] font-bold text-[#18191F] bg-[#F6F5F1] px-2.5 py-0.5 rounded-full border border-[#E6E3DC]">
                            {tactic}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#52525B] font-normal mt-0.5">
                          {TACTIC_DETAILS[tactic]?.shortEthos || tactic} · <span className="text-sky-700 font-semibold">{TACTIC_DETAILS[tactic]?.shortPerk || ''}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCustomTactics(!showCustomTactics)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-xs font-semibold text-[#18191F] transition cursor-pointer self-start sm:self-center flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-sliders text-[10px] text-[#52525B]"></i>
                      <span>{showCustomTactics ? (isDe ? 'Schließen' : 'Close') : (isDe ? 'Spielstil anpassen' : 'Change Philosophy')}</span>
                      <i className={`fa-solid ${showCustomTactics ? 'fa-chevron-up' : 'fa-chevron-down'} text-[9px] text-[#6B6A64]`}></i>
                    </button>
                  </div>

                  {/* Expandable 5 Core Tactics Pills */}
                  {showCustomTactics && (
                    <div className="mt-4 pt-4 border-t border-[#EAE7E0] fade-in">
                      <p className="text-[11px] text-[#6B6A64] mb-2.5">
                        {t('Select an alternative matchday philosophy for your squad:', 'Wähle einen alternativen Matchday-Spielstil für dein Team:')}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {Object.keys(PHILOSOPHIES).map((tacKey) => {
                          const isTacSelected = tactic === tacKey;
                          const tac = PHILOSOPHIES[tacKey];
                          return (
                            <button
                              key={tacKey}
                              type="button"
                              onClick={() => setTactic(tacKey)}
                              className={`px-3.5 py-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 active:scale-95 ${
                                isTacSelected
                                  ? 'bg-[#18191F] border-[#18191F] text-white shadow-sm'
                                  : 'bg-[#F6F5F1] border-[#E6E3DC] text-[#52525B] hover:text-[#18191F] hover:bg-[#EFECE4]'
                              }`}
                            >
                              <i className={`fas ${tac.icon} text-xs ${isTacSelected ? 'text-white' : 'text-[#6B6A64]'}`}></i>
                              <span className="text-xs font-semibold truncate">{tacKey}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sticky Mobile Action Bar */}
                <div className="sticky bottom-0 z-40 bg-[#F5F3EE]/95 backdrop-blur-md border-t border-[#E6E3DC] px-4 py-3 -mx-2 sm:mx-0 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:shadow-none sm:backdrop-blur-none flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubStep2('2A');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white hover:bg-[#FAF9F6] text-[#18191F] text-xs sm:text-sm font-semibold py-3.5 px-6 rounded-2xl border border-[#E6E3DC] transition active:scale-95 cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <i className="fa-solid fa-arrow-left text-xs"></i>
                    <span>{t('Back to Identity & Country', 'Zurück zu Identität & Land')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToStep3}
                    className="bg-[#18191F] hover:bg-[#2A2B33] text-white text-xs sm:text-sm font-semibold tracking-wide py-3.5 px-8 sm:px-10 rounded-2xl transition-all duration-200 active:scale-95 shadow-[0_8px_24px_rgba(24,25,31,0.18)] cursor-pointer flex-1 sm:flex-none sm:min-w-[240px] flex items-center justify-center gap-2.5"
                  >
                    <span>{t('Continue to Club Selection', 'Weiter zur Vereinswahl')}</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* STEP 3: Club Selection / Job Offers */}
      {step === 3 && (
        <div className="max-w-5xl mx-auto fade-in text-center px-2 sm:px-4 pb-12">
          {/* Director Context Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white border border-[#E6E3DC] text-xs font-medium shadow-sm">
            <span className="text-[#6B6A64]">{isDe ? 'Sportdirektor:' : 'Director:'}</span>
            <span className="text-[#18191F] font-semibold">{managerName.trim() || 'Director'}</span>
            <span className="text-[#D4CFC4]">•</span>
            <span className="text-[#6B6A64]">{isDe ? 'Start:' : 'Start:'}</span>
            <span className="text-[#18191F] font-semibold tabular-nums">{startYear}</span>
            <span className="text-[#D4CFC4]">•</span>
            <span className="text-[#6B6A64]">{isDe ? 'Philosophie:' : 'Philosophy:'}</span>
            <span className="text-sky-700 font-semibold">{tactic}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#18191F] tracking-tight mb-2">
            {mode === 'standard'
              ? t('Choose Your Club', 'Verein wählen')
              : t('Grassroots Job Offers', 'Offizielle Job-Angebote')}
          </h1>
          <p className="text-[14px] md:text-[15px] font-normal text-[#6B6A64] max-w-xl mx-auto mb-6 leading-relaxed">
            {mode === 'standard'
              ? t('Explore clubs by league division, search by name, or browse international powerhouses.', 'Wähle deinen Verein nach Liga, suche nach Namen oder starte bei einem Spitzenklub.')
              : t('Three clubs have submitted official managerial contract offers. Review their project and choose your club.', 'Drei Vereine bieten dir den Posten als Sportdirektor an. Wähle dein Einstiegsprojekt.')}
          </p>

          {/* CR27_Footy Real Name Pack Status & Responsive Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-5xl mx-auto mb-6 px-1">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-[#E6E3DC] text-xs shadow-sm">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isModActive ? 'bg-emerald-500 animate-pulse' : 'bg-[#9A9890]'}`} />
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-[#18191F] tracking-tight">CR27_Footy Pack</span>
                <span className="text-[#D4CFC4]">·</span>
                <span className="text-[#52525B] font-medium truncate">
                  {isModActive
                    ? (isDe ? '1.202 reale Vereine & Wappen aktiv' : '1,202 verified clubs & crests active')
                    : (isDe ? 'Lizenzfreie Standard-Namen' : 'Standard copyright-safe names')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              {onToggleMod && (
                <div className="flex items-center gap-2 bg-white border border-[#E6E3DC] px-3 py-1.5 rounded-2xl shadow-sm">
                  <span className="text-[11px] font-semibold text-[#52525B]">
                    {isModActive ? (isDe ? 'Echtnamen' : 'Real Names') : 'Standard'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isModActive}
                    onClick={() => onToggleMod(!isModActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-sm ${
                      isModActive ? 'bg-emerald-600' : 'bg-[#D4CFC4] hover:bg-[#B8B2A6]'
                    }`}
                    title={isModActive ? 'Disable Real Name Pack' : 'Enable Real Name Pack'}
                  >
                    <span className="sr-only">Toggle CR27 Real Name Pack</span>
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isModActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowModModal(true)}
                className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-[#18191F] bg-white hover:bg-[#FAF9F6] border border-[#E6E3DC] transition cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
                title="Open Database & Community Mods"
              >
                <i className="fa-solid fa-sliders text-[11px] text-[#52525B]"></i>
                <span>{isDe ? 'Optionen' : 'Options'}</span>
              </button>
            </div>
          </div>

          {/* REALISTIC MODE: 3 Job Offers */}
          {mode === 'realistic' && (
            <div className="w-full max-w-5xl mx-auto space-y-6">
              <div className="flex justify-center mb-2">
                <button
                  type="button"
                  onClick={generateRealisticOffers}
                  className="bg-white hover:bg-[#FAF9F6] text-[#18191F] font-semibold text-xs py-2 px-5 rounded-full border border-[#E6E3DC] transition active:scale-95 cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <i className="fa-solid fa-arrows-rotate text-xs text-sky-600"></i>
                  <span>{isDe ? 'Angebote neu mischen' : 'Reshuffle Job Offers'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                {startingOffers.map((c, idx) => {
                  const clubCountry = c.country || 'GER';
                  const countryInfo = COUNTRIES[clubCountry];
                  const leagueInfo = getLeagueInfo(c.tier, clubCountry);
                  const clubContext = isModActive
                    ? (c.historicContext || c.narrative || getClubHistoricContext(c.name, c.tier, isDe, clubCountry))
                    : undefined;

                  return (
                    <div
                      key={`${c.id}-${c.name}`}
                      onClick={() => {
                        setSelectedClubForArchetype(c);
                        setStep(4);
                      }}
                      className="rounded-[24px] p-5 sm:p-6 flex flex-col justify-between min-h-[350px] sm:min-h-[390px] bg-white hover:bg-[#FAF9F6] border border-[#E6E3DC] hover:border-[#18191F] hover:shadow-[0_12px_32px_rgba(24,25,31,0.1)] transition-all duration-300 cursor-pointer shadow-[0_6px_24px_rgba(24,25,31,0.06)] relative overflow-hidden group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F5F1] text-[#18191F] border border-[#E6E3DC] text-[10px] font-semibold tracking-wide">
                          <i className="fa-solid fa-briefcase text-[9px] text-sky-700"></i>
                          <span>{isDe ? `Angebot #${idx + 1}` : `Offer #${idx + 1}`}</span>
                        </div>
                        <div className="px-2.5 py-0.5 rounded-lg font-medium text-xs text-[#18191F] bg-[#F6F5F1] border border-[#E6E3DC] flex items-center gap-1.5 tabular-nums">
                          <span className="text-[10px] text-[#6B6A64]">OVR</span>
                          <span className="font-bold">{c.baseOvr}</span>
                        </div>
                      </div>

                      <div className="my-2 flex flex-col items-center text-center">
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#F6F5F1] border border-[#E6E3DC] flex items-center justify-center p-2.5 mb-3 group-hover:scale-105 transition-transform duration-200">
                          <ClubLogo
                            name={c.name}
                            id={c.id}
                            color={c.color}
                            logo={c.logo}
                            fallbackLogo={c.fallbackLogo}
                            isModActive={isModActive}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm"
                            fallbackClassName="w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl rounded-xl flex items-center justify-center font-bold text-white"
                          />
                        </div>

                        <h3 className="text-lg font-bold text-[#18191F] tracking-tight leading-snug">
                          {c.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-[#6B6A64] mt-1">
                          <span>{countryInfo?.flag || '🏁'}</span>
                          <span className="font-medium text-[#52525B]">{leagueInfo?.name || `Tier ${c.tier}`}</span>
                        </div>

                        {clubContext ? (
                          <p className="text-[11px] font-normal text-[#6B6A64] line-clamp-2 mt-2 px-1 leading-snug">
                            "{clubContext}"
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#6B6A64] mt-2 tabular-nums">
                            {(c.stadium || 15000).toLocaleString()} {isDe ? 'Zuschauerkapazität' : 'capacity'}
                          </p>
                        )}
                      </div>

                      <div className="w-full space-y-3 mt-4">
                        <div className="grid grid-cols-3 gap-1 bg-[#F6F5F1] p-2.5 rounded-2xl border border-[#EAE7E0] text-center text-xs tabular-nums">
                          <div>
                            <div className="text-[9px] uppercase font-semibold text-[#9A9890] tracking-wider">
                              Budget
                            </div>
                            <div className="font-bold text-[#18191F] text-xs mt-0.5">
                              {formatMoney(c.currentBudget != null ? parseAndNormalizeModBudget(c.currentBudget, c.tier, c.country || 'GER') : getStartingBudget(c.tier, c.country || 'GER'), c.country || 'GER')}
                            </div>
                          </div>
                          <div className="border-x border-[#E6E3DC]">
                            <div className="text-[9px] uppercase font-semibold text-[#9A9890] tracking-wider">
                              {isDe ? 'Stadion' : 'Stadium'}
                            </div>
                            <div className="font-semibold text-[#52525B] text-xs mt-0.5">
                              {((c.stadium || 15000) / 1000).toFixed(0)}k
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-semibold text-[#9A9890] tracking-wider">
                              Rep
                            </div>
                            <div className="font-bold text-sky-700 text-xs mt-0.5">
                              {c.rep || c.baseOvr || 65}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl bg-[#18191F] hover:bg-[#2A2B33] text-white font-semibold text-xs transition duration-150 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <span>{isDe ? 'Angebot annehmen' : 'Accept Contract'}</span>
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STANDARD MODE: Clean Unified Editorial Explorer */}
          {mode === 'standard' && (
            <div className="w-full max-w-5xl mx-auto mb-6 text-left space-y-4">
              <div className="bg-white border border-[#E6E3DC] rounded-[24px] p-4 sm:p-5 shadow-[0_6px_24px_rgba(24,25,31,0.06)] space-y-3.5">
                
                {/* Search Bar */}
                <div className="relative flex items-center">
                  <i className="fas fa-search absolute left-4 text-[#9A9890] text-sm pointer-events-none"></i>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={isModActive
                      ? (isDe ? 'Verein suchen... (z.B. Bayern, Dortmund, Real Madrid, Arsenal)' : 'Search club by name... (e.g. Bayern, Dortmund, Real Madrid, Arsenal)')
                      : (isDe ? 'Verein suchen... (z.B. Bavaria, Prussia, Manchester Blue)' : 'Search club by name... (e.g. Bavaria, Prussia, Manchester Blue)')}
                    enterKeyHint="search"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="w-full bg-[#F6F5F1] hover:bg-[#EFECE4] focus:bg-white text-[#18191F] font-medium text-xs sm:text-sm pl-11 pr-24 py-3 rounded-2xl border border-[#E6E3DC] focus:border-[#18191F] focus:ring-2 focus:ring-[#18191F]/10 outline-none transition placeholder-[#9A9890]"
                  />
                  <div className="absolute right-3 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          if (searchInputRef.current) searchInputRef.current.focus();
                        }}
                        className="w-6 h-6 rounded-full bg-[#EAE7E0] hover:bg-[#D4CFC4] text-[#52525B] hover:text-[#18191F] flex items-center justify-center text-xs transition cursor-pointer"
                      >
                        <i className="fas fa-xmark"></i>
                      </button>
                    )}
                    <span className="text-[10px] font-semibold text-[#52525B] bg-white px-2.5 py-1 rounded-full border border-[#E6E3DC] tabular-nums">
                      {displayedClubs.length} {isDe ? 'Vereine' : 'clubs'}
                    </span>
                  </div>
                </div>

                {/* Country / League Quick Switch Strip */}
                <div className="space-y-2 pt-2 border-t border-[#EAE7E0]">
                  <div className="flex items-center justify-between text-xs px-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64]">
                      {isDe ? 'Land / Wettbewerb' : 'Country / Region'}
                    </span>
                    {nationality !== 'ALL' && COUNTRIES[nationality] && (
                      <span className="text-[#18191F] text-xs flex items-center gap-1 font-semibold">
                        <span>{COUNTRIES[nationality].flag}</span>
                        <span>{COUNTRIES[nationality].name}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5 custom-scrollbar -mx-1 px-1">
                    {(['GER', 'ENG', 'ESP', 'ITA', 'FRA', 'POR', 'USA'] as const).map(code => {
                      const country = COUNTRIES[code];
                      if (!country) return null;
                      const isSelected = nationality === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setNationality(code);
                            setTierFilter(1);
                            setShowAllClubs(false);
                          }}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#18191F] text-white shadow-sm'
                              : 'bg-[#F6F5F1] text-[#52525B] hover:text-[#18191F] border border-[#E6E3DC] hover:bg-[#EFECE4]'
                          }`}
                        >
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setNationality('ALL');
                        setTierFilter('all');
                        setShowAllClubs(false);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                        nationality === 'ALL'
                          ? 'bg-[#18191F] text-white shadow-sm'
                          : 'bg-[#F6F5F1] text-[#52525B] hover:text-[#18191F] border border-[#E6E3DC] hover:bg-[#EFECE4]'
                      }`}
                    >
                      <span>🌍</span>
                      <span>{isDe ? 'Alle Länder' : 'All Countries'}</span>
                    </button>

                    <div className="relative shrink-0">
                      <select
                        value={['ALL', 'GER', 'ENG', 'ESP', 'ITA', 'FRA', 'POR', 'USA'].includes(nationality) ? '' : nationality}
                        onChange={(e) => {
                          if (e.target.value) {
                            setNationality(e.target.value);
                            setTierFilter(1);
                            setShowAllClubs(false);
                          }
                        }}
                        className="bg-[#F6F5F1] text-[#52525B] hover:text-[#18191F] border border-[#E6E3DC] hover:bg-[#EFECE4] rounded-xl px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer pr-7 transition"
                      >
                        <option value="" disabled>
                          {isDe ? '🌐 Weitere Länder...' : '🌐 More Nations...'}
                        </option>
                        {Object.keys(COUNTRIES)
                          .filter(k => !['ALL', 'GER', 'ENG', 'ESP', 'ITA', 'FRA', 'POR', 'USA'].includes(k))
                          .filter(k => isModActive || !MOD_ONLY_COUNTRIES.includes(k))
                          .map(k => (
                            <option key={k} value={k} className="bg-white text-[#18191F]">
                              {COUNTRIES[k]?.flag} {COUNTRIES[k]?.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Division / Tier Tabs */}
                {nationality !== 'ALL' && availableLeaguesForCountry.length > 0 && (
                  <div className="pt-2 border-t border-[#EAE7E0] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] px-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64]">
                        {isDe ? 'Spielklasse wählen' : 'Select Division'}
                      </span>
                      <span className="text-[#52525B] text-xs font-medium">
                        {COUNTRIES[nationality]?.flag} {COUNTRIES[nationality]?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5 custom-scrollbar -mx-1 px-1">
                      {availableLeaguesForCountry.map(({ tier, name }) => {
                        const isSelected = tierFilter === tier;
                        const tierClubsCount = clubsDb.filter(c => (c.country || 'GER') === nationality && c.tier === tier).length;
                        return (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => {
                              setTierFilter(isSelected ? 'all' : tier);
                              setShowAllClubs(false);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#18191F] text-white shadow-sm'
                                : 'bg-[#F6F5F1] text-[#52525B] hover:text-[#18191F] border border-[#E6E3DC] hover:bg-[#EFECE4]'
                            }`}
                          >
                            <span className="opacity-70 text-[10px] font-semibold">T{tier}</span>
                            <span>{name}</span>
                            {tierClubsCount > 0 && (
                              <span className="text-[10px] opacity-70 ml-0.5 tabular-nums">({tierClubsCount})</span>
                            )}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => {
                          setTierFilter('all');
                          setShowAllClubs(false);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                          tierFilter === 'all'
                            ? 'bg-[#18191F] text-white shadow-sm'
                            : 'bg-[#F6F5F1] text-[#52525B] hover:text-[#18191F] border border-[#E6E3DC] hover:bg-[#EFECE4]'
                        }`}
                      >
                        {isDe ? 'Alle Ligen' : 'All Divisions'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sort Bar */}
                <div className="pt-2 border-t border-[#EAE7E0] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A64] mr-1.5">
                      {isDe ? 'Sortierung:' : 'Sort By:'}
                    </span>
                    {(
                      [
                        { id: 'tier', label: isDe ? 'Liga & Stärke' : 'Tier & Rating', icon: 'fa-layer-group' },
                        { id: 'ovr', label: isDe ? 'Stärke (OVR)' : 'Overall OVR', icon: 'fa-bolt' },
                        { id: 'budget', label: 'Budget', icon: 'fa-coins' },
                        { id: 'name', label: isDe ? 'Name' : 'A-Z', icon: 'fa-arrow-down-a-z' },
                      ] as const
                    ).map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSortBy(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          sortBy === s.id
                            ? 'bg-[#18191F] text-white shadow-sm'
                            : 'text-[#6B6A64] hover:text-[#18191F] hover:bg-[#F6F5F1]'
                        }`}
                      >
                        <i className={`fa-solid ${s.icon} text-[10px]`}></i>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 cursor-pointer transition text-xs"
                    >
                      <i className="fas fa-xmark text-xs"></i>
                      <span>{isDe ? 'Suche zurücksetzen' : 'Clear search'}</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Standard Mode Clubs Grid */}
          {mode === 'standard' && (
            displayedClubs.length === 0 ? (
              <div className="bg-white border border-[#E6E3DC] rounded-[24px] p-8 max-w-md mx-auto text-center my-6 shadow-[0_6px_24px_rgba(24,25,31,0.06)]">
                <i className="fas fa-magnifying-glass text-3xl text-[#9A9890] mb-3 block"></i>
                <p className="text-[#18191F] font-bold text-base mb-1">
                  {isDe ? 'Keine Vereine gefunden' : 'No Results Found'}
                </p>
                <p className="text-[#6B6A64] text-xs mb-4">
                  {isDe
                    ? `Kein Verein entspricht "${searchQuery}". Versuche es mit einem anderen Begriff oder setze Filter zurück.`
                    : `No clubs matched "${searchQuery}". Try a different keyword or reset filters.`}
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="bg-[#18191F] hover:bg-[#2A2B33] text-white font-semibold text-xs py-2.5 px-6 rounded-full transition shadow-sm active:scale-95 cursor-pointer"
                >
                  {isDe ? 'Suche zurücksetzen' : 'Reset Search'}
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                  {(searchQuery.trim() !== '' || showAllClubs ? displayedClubs : displayedClubs.slice(0, 9)).map((c) => {
                    const clubCountry = c.country || (nationality === 'ALL' ? 'GER' : nationality);
                    const countryInfo = COUNTRIES[clubCountry];
                    const leagueInfo = getLeagueInfo(c.tier, clubCountry);
                    
                    const clubContext = isModActive
                      ? (c.historicContext || c.narrative || getClubHistoricContext(c.name, c.tier, isDe, clubCountry))
                      : undefined;

                    return (
                      <div
                        key={`${c.id}-${c.name}`}
                        onClick={() => {
                          if (!managerName.trim()) {
                            setNameError(true);
                            setSubStep2('2A');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setTimeout(() => nameInputRef.current?.focus(), 100);
                            return;
                          }
                          if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); }
                          setSelectedClubForArchetype(c);
                          setStep(4);
                        }}
                        className="rounded-[24px] p-4 sm:p-5 flex flex-col justify-between bg-white hover:bg-[#FAF9F6] border border-[#E6E3DC] hover:border-[#18191F] hover:shadow-[0_12px_32px_rgba(24,25,31,0.1)] transition-all duration-300 cursor-pointer shadow-[0_6px_24px_rgba(24,25,31,0.05)] relative overflow-hidden group active:scale-[0.99]"
                      >
                        {/* Mobile Row Layout (< sm) */}
                        <div className="sm:hidden flex items-center gap-3.5 w-full mb-3">
                          <div className="w-14 h-14 rounded-2xl bg-[#F6F5F1] border border-[#E6E3DC] flex items-center justify-center p-2 shrink-0">
                            <ClubLogo
                              name={c.name}
                              id={c.id}
                              color={c.color}
                              logo={c.logo}
                              fallbackLogo={c.fallbackLogo}
                              isModActive={isModActive}
                              className="w-10 h-10 object-contain drop-shadow-sm"
                              fallbackClassName="w-10 h-10 text-base rounded-xl shadow-sm flex items-center justify-center font-bold text-white"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-semibold text-[#52525B] truncate bg-[#F6F5F1] px-2 py-0.5 rounded-md border border-[#E6E3DC]">
                                {isCanadianMLSClub(c.name, c.id, c.country) ? '🇨🇦' : (countryInfo?.flag || '🏁')} {leagueInfo?.name || `Tier ${c.tier}`}
                              </span>
                              <span className="px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 bg-[#F6F5F1] text-[#18191F] border border-[#E6E3DC] tabular-nums">
                                OVR {c.baseOvr}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-[#18191F] break-words leading-tight">
                              {c.name}
                            </h3>
                            {clubContext ? (
                              <p className="text-[10px] font-normal text-[#6B6A64] truncate mt-0.5">
                                "{clubContext}"
                              </p>
                            ) : (
                              <p className="text-[10px] text-[#6B6A64] truncate mt-0.5 tabular-nums">
                                {(c.stadium || 20000).toLocaleString()} {isDe ? 'Plätze' : 'seats'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Desktop Top Row (>= sm) */}
                        <div className="hidden sm:flex w-full items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F6F5F1] border border-[#E6E3DC] text-[11px] font-semibold text-[#52525B] truncate max-w-[65%]">
                            <span>{isCanadianMLSClub(c.name, c.id, c.country) ? '🇨🇦' : (countryInfo?.flag || '🏁')}</span>
                            <span className="truncate">{leagueInfo?.name || `Tier ${c.tier}`}</span>
                          </div>
                          <div className="px-2.5 py-0.5 rounded-lg font-medium text-xs shrink-0 flex items-center gap-1 bg-[#F6F5F1] text-[#18191F] border border-[#E6E3DC] tabular-nums">
                            <span className="text-[10px] text-[#6B6A64]">OVR</span>
                            <span className="font-bold">{c.baseOvr}</span>
                          </div>
                        </div>

                        {/* Desktop Crest Section (>= sm) */}
                        <div className="hidden sm:flex my-2 items-center justify-center relative">
                          <div className="w-18 h-18 rounded-2xl bg-[#F6F5F1] border border-[#E6E3DC] flex items-center justify-center p-2.5 group-hover:scale-105 transition-transform duration-200">
                            <ClubLogo
                              name={c.name}
                              id={c.id}
                              color={c.color}
                              logo={c.logo}
                              fallbackLogo={c.fallbackLogo}
                              isModActive={isModActive}
                              className="w-14 h-14 object-contain drop-shadow-sm p-0.5"
                              fallbackClassName="w-14 h-14 text-xl rounded-xl shadow-sm flex items-center justify-center font-bold text-white"
                            />
                          </div>
                        </div>

                        {/* Desktop Club Name & Context (>= sm) */}
                        <div className="hidden sm:flex text-center w-full mb-3 flex-col items-center">
                          <h3 className="text-base font-bold text-[#18191F] tracking-tight truncate w-full px-1 py-0.5 leading-normal">
                            {c.name}
                          </h3>

                          {clubContext ? (
                            <p className="text-[11px] font-normal text-[#6B6A64] text-center line-clamp-2 min-h-[32px] px-2 mt-1 leading-snug">
                              "{clubContext}"
                            </p>
                          ) : (
                            <p className="text-[11px] font-normal text-[#6B6A64] text-center line-clamp-1 min-h-[20px] px-2 mt-1 tabular-nums">
                              {countryInfo?.name || clubCountry} · {(c.stadium || 20000).toLocaleString()} {isDe ? 'Kapazität' : 'Capacity'}
                            </p>
                          )}

                          {isReserveClub(c.name) && (
                            <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider bg-[#F6F5F1] text-[#52525B] border border-[#E6E3DC] px-2 py-0.5 rounded-full">
                              {isDe ? 'Reserve-Team' : 'Reserve Team'}
                            </span>
                          )}
                        </div>

                        {/* Key Metrics Strip */}
                        <div className="w-full grid grid-cols-3 gap-1 bg-[#F6F5F1] p-2 rounded-2xl border border-[#EAE7E0] text-center text-xs mb-3 tabular-nums">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-semibold text-[#9A9890] tracking-wider">
                              Budget
                            </span>
                            <span className="font-bold text-[#18191F] text-[11px]">
                              {formatMoney(c.currentBudget != null ? parseAndNormalizeModBudget(c.currentBudget, c.tier, c.country || 'GER') : getStartingBudget(c.tier, c.country || 'GER'), c.country || 'GER')}
                            </span>
                          </div>
                          <div className="flex flex-col border-x border-[#E6E3DC]">
                            <span className="text-[9px] uppercase font-semibold text-[#9A9890] tracking-wider">
                              {isDe ? 'Stadion' : 'Stadium'}
                            </span>
                            <span className="font-semibold text-[#52525B] text-[11px]">
                              {((c.stadium || 20000) / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-semibold text-[#9A9890] tracking-wider">
                              Rep
                            </span>
                            <span className="font-bold text-sky-700 text-[11px]">
                              {c.rep || c.baseOvr || 70}
                            </span>
                          </div>
                        </div>

                        {/* Select Action Button */}
                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl bg-[#F6F5F1] group-hover:bg-[#18191F] text-[#18191F] group-hover:text-white font-semibold text-xs transition duration-150 flex items-center justify-center gap-1.5 border border-[#E6E3DC] group-hover:border-[#18191F]"
                        >
                          <span>{t('Select Club', 'Verein wählen')}</span>
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Progressive Disclosure (Show All / Show Less) */}
                {searchQuery.trim() === '' && displayedClubs.length > 9 && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllClubs(!showAllClubs)}
                      className="px-6 py-2.5 rounded-full bg-white hover:bg-[#FAF9F6] text-[#18191F] border border-[#E6E3DC] text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-sm active:scale-95"
                    >
                      <span>
                        {showAllClubs
                          ? (isDe ? 'Weniger Vereine anzeigen' : 'Show fewer clubs')
                          : (isDe ? `Alle ${displayedClubs.length} Vereine anzeigen` : `Show all ${displayedClubs.length} clubs`)}
                      </span>
                      <i className={`fa-solid ${showAllClubs ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px] text-[#6B6A64]`}></i>
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {/* Navigation to Step 2 */}
          <div className="text-center mt-8 fade-in-delay-2">
            <button
              onClick={() => {
                setStep(2);
                setSubStep2('2B');
              }}
              className="bg-white hover:bg-[#FAF9F6] text-[#18191F] font-semibold text-xs sm:text-sm py-3 px-7 rounded-2xl border border-[#E6E3DC] transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2 shadow-sm"
            >
              <i className="fas fa-arrow-left text-xs"></i>
              <span>{t('Back to Managerial DNA', 'Zurück zur Management-DNA')}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Hire Head Coach */}
      {step === 4 && selectedClubForArchetype && (
        <div className="max-w-2xl mx-auto text-center fade-in px-4 pb-10">
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-white border border-[#E6E3DC] text-xs font-medium shadow-sm">
            <span className="text-[#6B6A64]">{isDe ? 'Verein:' : 'Club:'}</span>
            <span className="text-[#18191F] font-semibold">{selectedClubForArchetype.name}</span>
            <span className="text-[#D4D0C7]">•</span>
            <span className="text-[#6B6A64]">{isDe ? 'Philosophie:' : 'Philosophy:'}</span>
            <span className="text-sky-700 font-semibold">{tactic}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#18191F] tracking-tight mb-2">
            {t('Hire Head Coach', 'Cheftrainer einstellen')}
          </h1>
          <p className="text-[14px] md:text-[15px] font-normal text-[#52525B] max-w-xl mx-auto mb-8 leading-relaxed">
            {t(
              `As the new Sporting Director of ${selectedClubForArchetype.name}, appoint your Head Coach. Choose someone who aligns with your ${tactic} philosophy.`,
              `Als neuer Sportdirektor von ${selectedClubForArchetype.name} musst du einen Cheftrainer einstellen. Wähle jemanden, der zu deiner ${tactic}-Philosophie passt.`
            )}
          </p>
          
          <div className="grid gap-3.5 text-left">
            {coachMarket.map((coach) => {
              const hasSynergy = isTacticalSynergy(coach.style, tactic);
              const isSelected = selectedCoach?.id === coach.id;
              const archConfig = getCoachArchetypeConfig(coach.coachArchetype || coach.archetype);
              
              return (
                <div 
                  key={coach.id}
                  onClick={() => setSelectedCoach(coach)}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                    isSelected
                      ? 'bg-[#FAF9F6] border-[#18191F] ring-2 ring-[#18191F]/10 shadow-[0_10px_28px_rgba(24,25,31,0.08)] scale-[1.01]'
                      : 'bg-white border-[#E6E3DC] hover:border-[#CFCAC0] shadow-[0_4px_16px_rgba(24,25,31,0.04)]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base sm:text-lg text-[#18191F] mb-1.5 flex items-center gap-2 flex-wrap">
                      <span>{coach.name}</span>
                      
                      {/* Coach Archetype Pill */}
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${archConfig.badgeClass}`}>
                        <i className={`fa-solid ${archConfig.icon} text-[9px]`}></i>
                        <span>{isDe ? archConfig.labelDe : archConfig.labelEn}</span>
                      </span>

                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        isSelected
                          ? 'bg-[#18191F] text-white border border-[#18191F]'
                          : 'bg-[#F6F5F1] border border-[#E6E3DC] text-[#52525B]'
                      }`}>{coach.strength}</span>
                    </div>

                    <div className="text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                      <span className="text-[#52525B] font-medium flex items-center gap-1">
                        <i className={`fas ${TACTICS[coach.style]?.icon || 'fa-chess-board'} text-[#6B6A64] text-xs`}></i> {coach.style}
                      </span>
                      {hasSynergy && (
                         <span className="text-[10px] bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full font-semibold tracking-wide border border-sky-200 flex items-center gap-1">
                           <i className="fa-solid fa-circle-check text-[9px] text-sky-600"></i>
                           <span>Synergy</span>
                         </span>
                      )}
                      {coach.trophyPedigree ? (
                        <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                          <i className="fa-solid fa-trophy text-[9px] text-amber-600"></i>
                          <span>{coach.trophyPedigree} {isDe ? 'Titel' : 'Trophies'}</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="text-xs text-[#6B6A64] mt-2 font-normal italic line-clamp-1">
                      "{getCoachQuote(coach.ovrBoost, isDe, coach.id)}"
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6E3DC] gap-2">
                    <div className="text-left sm:text-right tabular-nums">
                      <div className="text-sm font-bold text-[#18191F] mb-0.5">{formatMoney(coach.cost)} / {isDe ? 'Jahr' : 'yr'}</div>
                      <div className="text-xs text-[#6B6A64]">{coach.contractYearsLeft} {isDe ? 'Jahre Vertrag' : 'Year Deal'}</div>
                    </div>

                    {/* View Dossier Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDossierCoach(coach);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#F6F5F1] hover:bg-[#EAE7E0] text-[#18191F] border border-[#E6E3DC] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
                    >
                      <i className="fa-solid fa-fingerprint text-[11px] text-[#52525B]"></i>
                      <span>{isDe ? 'Dossier ansehen' : 'View Dossier'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex gap-3">
            <button 
              type="button" 
              onClick={() => setStep(3)} 
              className="bg-white hover:bg-[#FAF9F6] text-[#18191F] font-semibold text-xs sm:text-sm py-3.5 px-7 rounded-2xl border border-[#E6E3DC] transition active:scale-95 cursor-pointer shadow-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              <span>{t('Back', 'Zurück')}</span>
            </button>
            <button 
              onClick={() => {
                onStartGame({
                  club: selectedClubForArchetype,
                  managerName: managerName.trim().toUpperCase(),
                  startYear,
                  tactic,
                  nationality: selectedClubForArchetype.country || nationality || 'GER',
                  mode: mode,
                  archetype,
                  coach: selectedCoach || undefined,
                });
              }}
              className={`flex-1 font-semibold text-xs sm:text-sm py-3.5 px-8 rounded-2xl transition-all duration-200 cursor-pointer ${
                selectedCoach
                  ? 'bg-[#18191F] hover:bg-[#2A2B33] text-white shadow-[0_8px_24px_rgba(24,25,31,0.18)] active:scale-95'
                  : 'bg-[#EAE7E0] text-[#9A9890] border border-[#E6E3DC] cursor-not-allowed shadow-none'
              }`}
              disabled={!selectedCoach}
            >
              {t('Start Career', 'Karriere Starten')}
            </button>
          </div>
        </div>
      )}

      {/* Coach Dossier Modal in Onboarding */}
      <AnimatePresence>
        {dossierCoach && (
          <CoachDossierModal
            coach={dossierCoach}
            lang={lang}
            clubTactic={tactic}
            onSelectInOnboarding={(c) => {
              setSelectedCoach(c);
              setDossierCoach(null);
            }}
            onClose={() => setDossierCoach(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
