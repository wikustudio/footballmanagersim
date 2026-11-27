import { getRegion } from './regionHelpers';
import { normalizeCountryCode } from '../data/gameConstants';

export interface PrestigeTheme {
  id: string;
  prestigeLevel: 1 | 2 | 3 | 4 | 5;
  prestigeStars: string;
  badgeLabel: { en: string; de: string };
  competitionTypeLabel: { en: string; de: string };
  iconClass: string;
  iconBoxBg: string;
  cardBorder: string;
  cardGlow: string;
  cardBgGlow: string;
  bannerBg: string;
  bannerBorder: string;
  bannerAccentText: string;
  scoreboardScoreColor: string;
  scoreboardBoxBorder: string;
  scoreboardHeaderBg: string;
  tagPillBg: string;
  goalEventBg: string;
  goalEventBorder: string;
  goalEventText: string;
  trophyScaleClass: string;
  trophyGlow: string;
  trophyHeight: number;
  accentHex: string;
  primaryBtnClass: string;
}

export const getCompetitionTheme = (
  type: string,
  country: string = 'GER',
  ddType?: 'title' | 'relegation' | 'promotion_playoff' | string
): PrestigeTheme => {
  const normCountry = normalizeCountryCode(country || 'GER');
  const normType = (type || '').toLowerCase().trim();
  const normDdType = (ddType || '').toLowerCase().trim();
  const norm = `${normType} ${normDdType}`.trim();
  const region = getRegion(normCountry);

  // 1. Decision Day - League Championship / Title Decider (Prestige 5 - Grandest Gold)
  if (ddType === 'title' || normType === 'title' || normDdType === 'title') {
    return {
      id: 'title',
      prestigeLevel: 5,
      prestigeStars: '★★★★★',
      badgeLabel: { en: 'Title Decider', de: 'Title Decider' },
      competitionTypeLabel: { en: 'League Championship Decider', de: 'League Championship Decider' },
      iconClass: 'fa-crown',
      iconBoxBg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-[#18191F] shadow-sm',
      cardBorder: 'border-amber-200',
      cardGlow: 'shadow-[0_6px_24px_rgba(24,25,31,0.08)]',
      cardBgGlow: 'from-amber-100/60 via-amber-50/30 to-transparent',
      bannerBg: 'bg-amber-50',
      bannerBorder: 'border-amber-200',
      bannerAccentText: 'text-amber-700',
      scoreboardScoreColor: 'text-amber-300',
      scoreboardBoxBorder: 'border-amber-200',
      scoreboardHeaderBg: 'bg-[#FAF9F6]',
      tagPillBg: 'bg-amber-50 text-amber-800 border border-amber-200',
      goalEventBg: 'bg-amber-50',
      goalEventBorder: 'border-amber-200',
      goalEventText: 'text-amber-900',
      trophyScaleClass: 'scale-125',
      trophyGlow: 'drop-shadow-[0_8px_16px_rgba(217,119,6,0.22)]',
      trophyHeight: 160,
      accentHex: '#D97706',
      primaryBtnClass: 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white hover:brightness-105 shadow-sm'
    };
  }

  // 2. Decision Day - Promotion Playoff (Prestige 4 - Electric Sky Cyan)
  if (ddType === 'promotion_playoff' || normType === 'promotion_playoff' || normDdType === 'promotion_playoff') {
    return {
      id: 'promotion_playoff',
      prestigeLevel: 4,
      prestigeStars: '★★★★☆',
      badgeLabel: { en: 'Promotion Playoff', de: 'Promotion Playoff' },
      competitionTypeLabel: { en: 'Promotion Final Decider', de: 'Promotion Final Decider' },
      iconClass: 'fa-arrow-trend-up',
      iconBoxBg: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-sm',
      cardBorder: 'border-sky-200',
      cardGlow: 'shadow-[0_6px_24px_rgba(24,25,31,0.08)]',
      cardBgGlow: 'from-sky-100/60 via-sky-50/30 to-transparent',
      bannerBg: 'bg-sky-50',
      bannerBorder: 'border-sky-200',
      bannerAccentText: 'text-sky-700',
      scoreboardScoreColor: 'text-sky-300',
      scoreboardBoxBorder: 'border-sky-200',
      scoreboardHeaderBg: 'bg-[#FAF9F6]',
      tagPillBg: 'bg-sky-50 text-sky-800 border border-sky-200',
      goalEventBg: 'bg-sky-50',
      goalEventBorder: 'border-sky-200',
      goalEventText: 'text-sky-900',
      trophyScaleClass: 'scale-115',
      trophyGlow: 'drop-shadow-[0_8px_16px_rgba(2,132,199,0.22)]',
      trophyHeight: 130,
      accentHex: '#0284C7',
      primaryBtnClass: 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white hover:brightness-105 shadow-sm'
    };
  }

  // 3. Decision Day - Relegation Battle (Prestige 3 - Defiant Crimson & Slate)
  if (ddType === 'relegation' || normType === 'relegation' || normDdType === 'relegation') {
    return {
      id: 'relegation',
      prestigeLevel: 3,
      prestigeStars: '★★★☆☆',
      badgeLabel: { en: 'Survival Battle', de: 'Survival Battle' },
      competitionTypeLabel: { en: 'Do-or-Die Final Matchday', de: 'Do-or-Die Final Matchday' },
      iconClass: 'fa-shield-halved',
      iconBoxBg: 'bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 text-white shadow-sm',
      cardBorder: 'border-rose-200',
      cardGlow: 'shadow-[0_6px_24px_rgba(24,25,31,0.08)]',
      cardBgGlow: 'from-rose-100/60 via-rose-50/30 to-transparent',
      bannerBg: 'bg-rose-50',
      bannerBorder: 'border-rose-200',
      bannerAccentText: 'text-rose-700',
      scoreboardScoreColor: 'text-rose-300',
      scoreboardBoxBorder: 'border-rose-200',
      scoreboardHeaderBg: 'bg-[#FAF9F6]',
      tagPillBg: 'bg-rose-50 text-rose-800 border border-rose-200',
      goalEventBg: 'bg-rose-50',
      goalEventBorder: 'border-rose-200',
      goalEventText: 'text-rose-900',
      trophyScaleClass: 'scale-110',
      trophyGlow: 'drop-shadow-[0_8px_16px_rgba(225,29,72,0.2)]',
      trophyHeight: 110,
      accentHex: '#E11D48',
      primaryBtnClass: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white hover:brightness-105 shadow-sm'
    };
  }

  // 4. Tournaments - FIFA Club World Cup (CWC) (Prestige 5 - Grandest Global Crown)
  if (normType === 'cwc' || norm.includes('world') || norm.includes('cwc')) {
    return {
      id: 'cwc',
      prestigeLevel: 5,
      prestigeStars: '★★★★★',
      badgeLabel: { en: 'World Champions', de: 'World Champions' },
      competitionTypeLabel: { en: 'FIFA Club World Cup • Global Pinnacle', de: 'FIFA Club World Cup • Global Pinnacle' },
      iconClass: 'fa-earth-americas',
      iconBoxBg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-[#18191F] shadow-sm',
      cardBorder: 'border-amber-200',
      cardGlow: 'shadow-[0_6px_24px_rgba(24,25,31,0.08)]',
      cardBgGlow: 'from-amber-100/60 via-amber-50/30 to-transparent',
      bannerBg: 'bg-amber-50',
      bannerBorder: 'border-amber-200',
      bannerAccentText: 'text-amber-700',
      scoreboardScoreColor: 'text-amber-300',
      scoreboardBoxBorder: 'border-amber-200',
      scoreboardHeaderBg: 'bg-[#FAF9F6]',
      tagPillBg: 'bg-amber-50 text-amber-800 border border-amber-200',
      goalEventBg: 'bg-amber-50',
      goalEventBorder: 'border-amber-200',
      goalEventText: 'text-amber-900',
      trophyScaleClass: 'scale-125',
      trophyGlow: 'drop-shadow-[0_8px_16px_rgba(217,119,6,0.22)]',
      trophyHeight: 160,
      accentHex: '#D97706',
      primaryBtnClass: 'bg-[#18191F] hover:bg-[#2A2C35] text-white shadow-sm'
    };
  }

  // 5. Tournaments - UEFA Champions League / Copa Libertadores / Continental Top Tier (Prestige 5 - Midnight Starlight Sapphire)
  const isCl =
    normType === 'cl' ||
    normType === 'c1' ||
    norm.includes('champions') ||
    norm.includes('libertadores') ||
    norm.includes('euro champions') ||
    norm.includes('americas elite') ||
    norm.includes('elite cup');

  if (isCl) {
    const isConmebol = region === 'CONMEBOL';
    const isConcacaf = region === 'CONCACAF';
    const isAfc = region === 'AFC';

    const badgeLabel = isConmebol
      ? { en: 'South American Crown', de: 'South American Crown' }
      : isConcacaf
      ? { en: 'North American Crown', de: 'North American Crown' }
      : isAfc
      ? { en: 'Asian Crown', de: 'Asian Crown' }
      : { en: 'European Crown', de: 'European Crown' };

    const competitionTypeLabel = isConmebol
      ? { en: 'Copa Libertadores • South American Pinnacle', de: 'Copa Libertadores • Südamerikanische Krone' }
      : isConcacaf
      ? { en: 'Concacaf Champions Cup • The Pinnacle', de: 'Concacaf Champions Cup • Nordamerikanische Krone' }
      : isAfc
      ? { en: 'AFC Champions League • Asian Pinnacle', de: 'AFC Champions League • Asiatische Krone' }
      : { en: 'UEFA Champions League • The Pinnacle', de: 'UEFA Champions League • The Pinnacle' };

    const iconClass = (isConmebol || isConcacaf) ? 'fa-earth-americas' : isAfc ? 'fa-earth-asia' : 'fa-star';

    return {
      id: 'cl',
      prestigeLevel: 5,
      prestigeStars: '★★★★★',
      badgeLabel,
      competitionTypeLabel,
      iconClass,
      iconBoxBg: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-sm',
      cardBorder: 'border-sky-200',
      cardGlow: 'shadow-[0_6px_24px_rgba(24,25,31,0.08)]',
      cardBgGlow: 'from-sky-100/60 via-blue-50/30 to-transparent',
      bannerBg: 'bg-sky-50',
      bannerBorder: 'border-sky-200',
      bannerAccentText: 'text-sky-700',
      scoreboardScoreColor: 'text-sky-300',
      scoreboardBoxBorder: 'border-sky-200',
      scoreboardHeaderBg: 'bg-[#FAF9F6]',
      tagPillBg: 'bg-sky-50 text-sky-800 border border-sky-200',
      goalEventBg: 'bg-sky-50',
      goalEventBorder: 'border-sky-200',
      goalEventText: 'text-sky-900',
      trophyScaleClass: 'scale-120',
      trophyGlow: 'drop-shadow-[0_8px_16px_rgba(2,132,199,0.22)]',
      trophyHeight: 150,
      accentHex: '#0284C7',
      primaryBtnClass: 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white hover:brightness-105 shadow-sm'
    };
  }

  // 6. Tournaments - UEFA Europa League / Copa Sudamericana / Continental Secondary Tier (Prestige 4 - Fiery Sunset Orange)
  const isEl =
    normType === 'el' ||
    norm.includes('euro cup') ||
    norm.includes('europa') ||
    norm.includes('sudamericana') ||
    norm.includes('leagues challenge') ||
    norm.includes('asian cup') ||
    norm.includes('americas cup');

  if (isEl) {
    const isConmebol = region === 'CONMEBOL';
    const isConcacaf = region === 'CONCACAF';
    const isAfc = region === 'AFC';

    const badgeLabel = isConmebol
      ? { en: 'Copa Sudamericana', de: 'Copa Sudamericana' }
      : isConcacaf
      ? { en: 'Leagues Challenge', de: 'Leagues Challenge' }
      : isAfc
      ? { en: 'Asian Cup', de: 'Asian Cup' }
      : { en: 'Euro Cup', de: 'Euro Cup' };

    const competitionTypeLabel = isConmebol
      ? { en: 'Copa Sudamericana • Continental Clash', de: 'Copa Sudamericana • Südamerikanische Nacht' }
      : isConcacaf
      ? { en: 'CONCACAF Challenge • Continental Clash', de: 'CONCACAF Challenge • Kontinentale Nacht' }
      : isAfc
      ? { en: 'AFC Cup • Continental Clash', de: 'AFC Cup • Asiatische Nacht' }
      : { en: 'UEFA Europa League • Thursday Nights', de: 'UEFA Europa League • Thursday Nights' };

    const iconClass = (isConmebol || isConcacaf) ? 'fa-earth-americas' : isAfc ? 'fa-earth-asia' : 'fa-globe-europe';

    return {
      id: 'el',
      prestigeLevel: 4,
      prestigeStars: '★★★★☆',
      badgeLabel,
      competitionTypeLabel,
      iconClass,
      iconBoxBg: 'bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white shadow-sm',
      cardBorder: 'border-orange-200',
      cardGlow: 'shadow-[0_6px_24px_rgba(24,25,31,0.08)]',
      cardBgGlow: 'from-orange-100/60 via-amber-50/30 to-transparent',
      bannerBg: 'bg-orange-50',
      bannerBorder: 'border-orange-200',
      bannerAccentText: 'text-orange-700',
      scoreboardScoreColor: 'text-orange-300',
      scoreboardBoxBorder: 'border-orange-200',
      scoreboardHeaderBg: 'bg-[#FAF9F6]',
      tagPillBg: 'bg-orange-50 text-orange-800 border border-orange-200',
      goalEventBg: 'bg-orange-50',
      goalEventBorder: 'border-orange-200',
      goalEventText: 'text-orange-900',
      trophyScaleClass: 'scale-115',
      trophyGlow: 'drop-shadow-[0_8px_16px_rgba(234,88,12,0.2)]',
      trophyHeight: 130,
      accentHex: '#EA580C',
      primaryBtnClass: 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white hover:brightness-105 shadow-sm'
    };
  }

  // 7. Tournaments - UEFA Conference League / Recopa / Continental Tertiary Tier (Prestige 3 - Emerald Mint Green)
  const isEcl =
    normType === 'ecl' ||
    norm.includes('euro challenge') ||
    norm.includes('conference') ||
    norm.includes('recopa') ||
    norm.includes('challenge cup') ||
    norm.includes('asian challenge');

  if (isEcl) {
    const isConmebol = region === 'CONMEBOL';
    const isConcacaf = region === 'CONCACAF';
    const isAfc = region === 'AFC';

    const badgeLabel = isConmebol
      ? { en: 'Recopa', de: 'Recopa' }
      : isConcacaf
      ? { en: 'North American Challenge Cup', de: 'North American Challenge Cup' }
      : isAfc
      ? { en: 'Asian Challenge Cup', de: 'Asian Challenge Cup' }
      : { en: 'Euro Challenge Cup', de: 'Euro Challenge Cup' };

    const competitionTypeLabel = isConmebol
      ? { en: 'CONMEBOL Recopa • Continental Supercup', de: 'CONMEBOL Recopa • Kontinentaler Supercup' }
      : isConcacaf
      ? { en: 'North American Challenge Cup', de: 'North American Challenge Cup' }
      : isAfc
      ? { en: 'AFC Challenge Cup', de: 'AFC Challenge Cup' }
      : { en: 'UEFA Conference League Campaign', de: 'UEFA Conference League Campaign' };

    const iconClass = (isConmebol || isConcacaf) ? 'fa-earth-americas' : isAfc ? 'fa-earth-asia' : 'fa-earth-europe';

    return {
      id: 'ecl',
      prestigeLevel: 3,
      prestigeStars: '★★★☆☆',
      badgeLabel,
      competitionTypeLabel,
      iconClass,
      iconBoxBg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-green-600 text-white shadow-sm',
      cardBorder: 'border-emerald-200',
      cardGlow: 'shadow-[0_6px_24px_rgba(24,25,31,0.08)]',
      cardBgGlow: 'from-emerald-100/60 via-teal-50/30 to-transparent',
      bannerBg: 'bg-emerald-50',
      bannerBorder: 'border-emerald-200',
      bannerAccentText: 'text-emerald-700',
      scoreboardScoreColor: 'text-emerald-300',
      scoreboardBoxBorder: 'border-emerald-200',
      scoreboardHeaderBg: 'bg-[#FAF9F6]',
      tagPillBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      goalEventBg: 'bg-emerald-50',
      goalEventBorder: 'border-emerald-200',
      goalEventText: 'text-emerald-900',
      trophyScaleClass: 'scale-110',
      trophyGlow: 'drop-shadow-[0_8px_16px_rgba(5,150,105,0.2)]',
      trophyHeight: 110,
      accentHex: '#059669',
      primaryBtnClass: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white hover:brightness-105 shadow-sm'
    };
  }

  // 8. Tournaments - Secondary League Cup (EFL / Carabao / League Cup)
  if (normType === 'efl' || norm.includes('league cup') || norm.includes('carabao')) {
    const eflSubtitle = normCountry === 'ENG'
      ? 'League Cup • Road to Wembley'
      : 'League Cup • Road to the Final';
    return {
      id: 'efl',
      prestigeLevel: 4,
      prestigeStars: '★★★★☆',
      badgeLabel: { en: 'League Cup', de: 'League Cup' },
      competitionTypeLabel: { en: eflSubtitle, de: eflSubtitle },
      iconClass: 'fa-trophy',
      iconBoxBg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-green-600 text-white shadow-sm',
      cardBorder: 'border-emerald-200',
      cardGlow: 'shadow-[0_6px_24px_rgba(24,25,31,0.08)]',
      cardBgGlow: 'from-emerald-100/60 via-teal-50/30 to-transparent',
      bannerBg: 'bg-emerald-50',
      bannerBorder: 'border-emerald-200',
      bannerAccentText: 'text-emerald-700',
      scoreboardScoreColor: 'text-emerald-300',
      scoreboardBoxBorder: 'border-emerald-200',
      scoreboardHeaderBg: 'bg-[#FAF9F6]',
      tagPillBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      goalEventBg: 'bg-emerald-50',
      goalEventBorder: 'border-emerald-200',
      goalEventText: 'text-emerald-900',
      trophyScaleClass: 'scale-110',
      trophyGlow: 'drop-shadow-[0_8px_16px_rgba(5,150,105,0.2)]',
      trophyHeight: 110,
      accentHex: '#059669',
      primaryBtnClass: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white hover:brightness-105 shadow-sm'
    };
  }

  // 9. Tournaments - National Domestic Cup (Prestige 4 - Regal Gold)
  if (
    normType === 'dfb' ||
    norm.includes('pokal') ||
    norm.includes('taca') ||
    norm.includes('taça') ||
    norm.includes('fa cup') ||
    norm.includes('copa del rey') ||
    norm.includes('coupe de france') ||
    norm.includes('coppa italia') ||
    norm.includes('open cup') ||
    norm.includes('canadian championship') ||
    norm.includes('voyageurs') ||
    norm.includes('copa do brasil') ||
    norm.includes('copa argentina') ||
    norm.includes('copa colombia') ||
    norm.includes('copa ecuador') ||
    norm.includes('copa mx') ||
    norm.includes('türkiye kupası') ||
    (!isCl && !isEl && !isEcl && !norm.includes('supercup') && !norm.includes('super cup') && !norm.includes('regional') && !norm.includes('grassroots') && !norm.includes('euro') && !norm.includes('asian') && !norm.includes('challenge') && (normType.includes('cup') || normDdType.includes('cup')))
  ) {
    const domesticName =
      normCountry === 'ECU' ? 'Copa Ecuador'
      : (normCountry === 'CAN' || norm.includes('voyageurs') || norm.includes('canadian championship')) ? 'Voyageurs Cup'
      : normCountry === 'USA' ? 'U.S. Open Cup'
      : normCountry === 'BRA' ? 'Copa do Brasil'
      : normCountry === 'ARG' ? 'Copa Argentina'
      : normCountry === 'COL' ? 'Copa Colombia'
      : normCountry === 'MEX' ? 'Copa MX'
      : normCountry === 'ENG' ? 'FA Cup'
      : normCountry === 'ESP' ? 'Copa del Rey'
      : normCountry === 'ITA' ? 'Coppa Italia'
      : normCountry === 'FRA' ? 'Coupe de France'
      : normCountry === 'POR' ? 'Taça de Portugal'
      : normCountry === 'TUR' ? 'Türkiye Kupası'
      : normCountry === 'GER' ? 'DFB-Pokal'
      : normCountry === 'AUT' ? 'ÖFB-Cup'
      : normCountry === 'SUI' ? 'Schweizer Cup'
      : normCountry === 'POL' ? 'Puchar Polski'
      : normCountry === 'DEN' ? 'DBU Pokalen'
      : normCountry === 'NOR' ? 'Norgesmesterskapet'
      : normCountry === 'SWE' ? 'Svenska Cupen'
      : normCountry === 'SCO' ? 'Scottish Cup'
      : normCountry === 'WAL' ? 'Welsh Cup'
      : normCountry === 'AUS' ? 'Australia Cup'
      : normCountry === 'JPN' ? "Emperor's Cup"
      : normCountry === 'IDN' ? 'Piala Indonesia'
      : normCountry === 'IND' ? 'National Super Cup'
      : normCountry === 'SVK' ? 'Slovak Cup'
      : normCountry === 'PER' ? 'Copa Bicentenario'
      : normCountry === 'KOR' ? 'Korea Cup'
      : normCountry === 'BOL' ? 'Copa Bolivia'
      : normCountry === 'PAR' ? 'Copa Paraguay'
      : normCountry === 'CHI' ? 'Copa Chile'
      : normCountry === 'CRO' ? 'Croatian Cup'
      : normCountry === 'GRE' ? 'Greek Football Cup'
      : normCountry === 'NED' ? 'KNVB Cup'
      : normCountry === 'BEL' ? 'Belgian Cup'
      : normCountry === 'URU' ? 'Copa AUF Uruguay'
      : 'National Cup';

    return {
      id: 'dfb',
      prestigeLevel: 4,
      prestigeStars: '★★★★☆',
      badgeLabel: { en: domesticName, de: domesticName },
      competitionTypeLabel: {
        en: `${domesticName} • Road to the Final`,
        de: `${domesticName} • Weg ins Finale`
      },
      iconClass: 'fa-trophy',
      iconBoxBg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-[#18191F] shadow-sm',
      cardBorder: 'border-amber-200',
      cardGlow: 'shadow-[0_6px_24px_rgba(24,25,31,0.08)]',
      cardBgGlow: 'from-amber-100/60 via-yellow-50/30 to-transparent',
      bannerBg: 'bg-amber-50',
      bannerBorder: 'border-amber-200',
      bannerAccentText: 'text-amber-700',
      scoreboardScoreColor: 'text-amber-300',
      scoreboardBoxBorder: 'border-amber-200',
      scoreboardHeaderBg: 'bg-[#FAF9F6]',
      tagPillBg: 'bg-amber-50 text-amber-800 border border-amber-200',
      goalEventBg: 'bg-amber-50',
      goalEventBorder: 'border-amber-200',
      goalEventText: 'text-amber-900',
      trophyScaleClass: 'scale-115',
      trophyGlow: 'drop-shadow-[0_8px_16px_rgba(202,138,4,0.22)]',
      trophyHeight: 130,
      accentHex: '#CA8A04',
      primaryBtnClass: 'bg-[#18191F] hover:bg-[#2A2C35] text-white shadow-sm'
    };
  }

  // 9. Regional / Amateur Lower Cup (Prestige 1 - Rustic Bronze)
  return {
    id: 'reg',
    prestigeLevel: 1,
    prestigeStars: '★☆☆☆☆',
    badgeLabel: { en: 'Regional Cup', de: 'Regional Cup' },
    competitionTypeLabel: { en: 'Grassroots Championship Cup', de: 'Grassroots Championship Cup' },
    iconClass: 'fa-shield',
    iconBoxBg: 'bg-gradient-to-br from-orange-500 via-amber-600 to-rose-600 text-white shadow-sm',
    cardBorder: 'border-amber-200',
    cardGlow: 'shadow-[0_6px_24px_rgba(24,25,31,0.08)]',
    cardBgGlow: 'from-amber-100/50 via-stone-50/30 to-transparent',
    bannerBg: 'bg-amber-50',
    bannerBorder: 'border-amber-200',
    bannerAccentText: 'text-amber-700',
    scoreboardScoreColor: 'text-amber-300',
    scoreboardBoxBorder: 'border-amber-200',
    scoreboardHeaderBg: 'bg-[#FAF9F6]',
    tagPillBg: 'bg-amber-50 text-amber-800 border border-amber-200',
    goalEventBg: 'bg-amber-50',
    goalEventBorder: 'border-amber-200',
    goalEventText: 'text-amber-900',
    trophyScaleClass: 'scale-100',
    trophyGlow: 'drop-shadow-[0_6px_12px_rgba(217,119,6,0.18)]',
    trophyHeight: 85,
    accentHex: '#D97706',
    primaryBtnClass: 'bg-[#18191F] hover:bg-[#2A2C35] text-white shadow-sm'
  };
};
