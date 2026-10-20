import { getRegion } from './regionHelpers';

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
  const normType = (type || '').toLowerCase().trim();
  const normDdType = (ddType || '').toLowerCase().trim();
  const norm = `${normType} ${normDdType}`.trim();
  const region = getRegion(country);

  // 1. Decision Day - League Championship / Title Decider (Prestige 5 - Grandest Gold)
  if (ddType === 'title' || normType === 'title' || normDdType === 'title') {
    return {
      id: 'title',
      prestigeLevel: 5,
      prestigeStars: '★★★★★',
      badgeLabel: { en: 'Title Decider', de: 'Title Decider' },
      competitionTypeLabel: { en: 'League Championship Decider', de: 'League Championship Decider' },
      iconClass: 'fa-crown',
      iconBoxBg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-black shadow-[0_0_30px_rgba(245,158,11,0.6)]',
      cardBorder: 'border-amber-500/50',
      cardGlow: 'shadow-[0_0_60px_rgba(245,158,11,0.3)]',
      cardBgGlow: 'from-amber-500/15 via-yellow-950/20 to-transparent',
      bannerBg: 'bg-gradient-to-r from-amber-950/90 via-yellow-950/60 to-amber-950/90',
      bannerBorder: 'border-amber-500/40',
      bannerAccentText: 'text-amber-300',
      scoreboardScoreColor: 'text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]',
      scoreboardBoxBorder: 'border-amber-500/40',
      scoreboardHeaderBg: 'bg-gradient-to-r from-amber-950/70 via-yellow-900/40 to-amber-950/70',
      tagPillBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      goalEventBg: 'bg-amber-950/50',
      goalEventBorder: 'border-amber-500/40',
      goalEventText: 'text-amber-200',
      trophyScaleClass: 'scale-125',
      trophyGlow: 'drop-shadow-[0_0_40px_rgba(250,204,21,0.8)]',
      trophyHeight: 160,
      accentHex: '#F59E0B',
      primaryBtnClass: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
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
      iconBoxBg: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.6)]',
      cardBorder: 'border-cyan-500/50',
      cardGlow: 'shadow-[0_0_60px_rgba(6,182,212,0.3)]',
      cardBgGlow: 'from-cyan-500/15 via-sky-950/20 to-transparent',
      bannerBg: 'bg-gradient-to-r from-cyan-950/90 via-sky-950/60 to-cyan-950/90',
      bannerBorder: 'border-cyan-500/40',
      bannerAccentText: 'text-cyan-300',
      scoreboardScoreColor: 'text-cyan-300 drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]',
      scoreboardBoxBorder: 'border-cyan-500/40',
      scoreboardHeaderBg: 'bg-gradient-to-r from-cyan-950/70 via-sky-900/40 to-cyan-950/70',
      tagPillBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
      goalEventBg: 'bg-cyan-950/50',
      goalEventBorder: 'border-cyan-500/40',
      goalEventText: 'text-cyan-200',
      trophyScaleClass: 'scale-115',
      trophyGlow: 'drop-shadow-[0_0_35px_rgba(6,182,212,0.7)]',
      trophyHeight: 130,
      accentHex: '#06B6D4',
      primaryBtnClass: 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 text-white hover:brightness-110 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
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
      iconBoxBg: 'bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)]',
      cardBorder: 'border-red-500/50',
      cardGlow: 'shadow-[0_0_60px_rgba(239,68,68,0.3)]',
      cardBgGlow: 'from-rose-500/15 via-red-950/20 to-transparent',
      bannerBg: 'bg-gradient-to-r from-red-950/90 via-rose-950/60 to-red-950/90',
      bannerBorder: 'border-red-500/40',
      bannerAccentText: 'text-rose-300',
      scoreboardScoreColor: 'text-rose-400 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]',
      scoreboardBoxBorder: 'border-red-500/40',
      scoreboardHeaderBg: 'bg-gradient-to-r from-red-950/70 via-rose-900/40 to-red-950/70',
      tagPillBg: 'bg-red-500/20 text-red-300 border border-red-500/40',
      goalEventBg: 'bg-red-950/50',
      goalEventBorder: 'border-red-500/40',
      goalEventText: 'text-red-200',
      trophyScaleClass: 'scale-110',
      trophyGlow: 'drop-shadow-[0_0_35px_rgba(239,68,68,0.7)]',
      trophyHeight: 110,
      accentHex: '#EF4444',
      primaryBtnClass: 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 text-white hover:brightness-110 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
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
      iconBoxBg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-black shadow-[0_0_35px_rgba(245,158,11,0.7)]',
      cardBorder: 'border-amber-400/60',
      cardGlow: 'shadow-[0_0_70px_rgba(245,158,11,0.35)]',
      cardBgGlow: 'from-amber-500/20 via-yellow-950/20 to-transparent',
      bannerBg: 'bg-gradient-to-r from-amber-950/90 via-yellow-900/60 to-amber-950/90',
      bannerBorder: 'border-amber-500/50',
      bannerAccentText: 'text-amber-300',
      scoreboardScoreColor: 'text-yellow-400 drop-shadow-[0_0_35px_rgba(250,204,21,0.9)]',
      scoreboardBoxBorder: 'border-amber-500/40',
      scoreboardHeaderBg: 'bg-gradient-to-r from-amber-950/80 via-yellow-900/50 to-amber-950/80',
      tagPillBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      goalEventBg: 'bg-amber-950/50',
      goalEventBorder: 'border-amber-500/40',
      goalEventText: 'text-amber-200',
      trophyScaleClass: 'scale-125',
      trophyGlow: 'drop-shadow-[0_0_45px_rgba(250,204,21,0.9)]',
      trophyHeight: 160,
      accentHex: '#F59E0B',
      primaryBtnClass: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black hover:brightness-110 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
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
      iconBoxBg: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white shadow-[0_0_35px_rgba(56,189,248,0.7)]',
      cardBorder: 'border-sky-400/60',
      cardGlow: 'shadow-[0_0_70px_rgba(56,189,248,0.35)]',
      cardBgGlow: 'from-sky-500/20 via-blue-950/20 to-transparent',
      bannerBg: 'bg-gradient-to-r from-blue-950/90 via-indigo-950/60 to-sky-950/90',
      bannerBorder: 'border-sky-500/50',
      bannerAccentText: 'text-sky-300',
      scoreboardScoreColor: 'text-sky-300 drop-shadow-[0_0_35px_rgba(56,189,248,0.9)]',
      scoreboardBoxBorder: 'border-sky-500/40',
      scoreboardHeaderBg: 'bg-gradient-to-r from-blue-950/80 via-indigo-900/50 to-sky-950/80',
      tagPillBg: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
      goalEventBg: 'bg-blue-950/50',
      goalEventBorder: 'border-sky-500/40',
      goalEventText: 'text-sky-200',
      trophyScaleClass: 'scale-120',
      trophyGlow: 'drop-shadow-[0_0_45px_rgba(56,189,248,0.9)]',
      trophyHeight: 150,
      accentHex: '#38BDF8',
      primaryBtnClass: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white hover:brightness-110 shadow-[0_0_30px_rgba(56,189,248,0.5)]'
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
      iconBoxBg: 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.6)]',
      cardBorder: 'border-orange-500/50',
      cardGlow: 'shadow-[0_0_60px_rgba(249,115,22,0.3)]',
      cardBgGlow: 'from-orange-500/15 via-amber-950/20 to-transparent',
      bannerBg: 'bg-gradient-to-r from-orange-950/90 via-amber-950/60 to-orange-950/90',
      bannerBorder: 'border-orange-500/40',
      bannerAccentText: 'text-orange-300',
      scoreboardScoreColor: 'text-orange-400 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]',
      scoreboardBoxBorder: 'border-orange-500/40',
      scoreboardHeaderBg: 'bg-gradient-to-r from-orange-950/70 via-amber-900/40 to-orange-950/70',
      tagPillBg: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
      goalEventBg: 'bg-orange-950/50',
      goalEventBorder: 'border-orange-500/40',
      goalEventText: 'text-orange-200',
      trophyScaleClass: 'scale-115',
      trophyGlow: 'drop-shadow-[0_0_35px_rgba(249,115,22,0.8)]',
      trophyHeight: 130,
      accentHex: '#F97316',
      primaryBtnClass: 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white hover:brightness-110 shadow-[0_0_25px_rgba(249,115,22,0.4)]'
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
      iconBoxBg: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.6)]',
      cardBorder: 'border-emerald-500/50',
      cardGlow: 'shadow-[0_0_50px_rgba(16,185,129,0.25)]',
      cardBgGlow: 'from-emerald-500/15 via-teal-950/20 to-transparent',
      bannerBg: 'bg-gradient-to-r from-emerald-950/90 via-teal-950/60 to-emerald-950/90',
      bannerBorder: 'border-emerald-500/40',
      bannerAccentText: 'text-emerald-300',
      scoreboardScoreColor: 'text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]',
      scoreboardBoxBorder: 'border-emerald-500/40',
      scoreboardHeaderBg: 'bg-gradient-to-r from-emerald-950/70 via-teal-900/40 to-emerald-950/70',
      tagPillBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      goalEventBg: 'bg-emerald-950/50',
      goalEventBorder: 'border-emerald-500/40',
      goalEventText: 'text-emerald-200',
      trophyScaleClass: 'scale-110',
      trophyGlow: 'drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]',
      trophyHeight: 110,
      accentHex: '#10B981',
      primaryBtnClass: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white hover:brightness-110 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
    };
  }

  // 8. Tournaments - Secondary League Cup (EFL / Carabao / League Cup)
  if (normType === 'efl' || norm.includes('league cup') || norm.includes('carabao')) {
    return {
      id: 'efl',
      prestigeLevel: 4,
      prestigeStars: '★★★★☆',
      badgeLabel: { en: 'League Cup', de: 'League Cup' },
      competitionTypeLabel: { en: 'League Cup • Road to Wembley', de: 'League Cup • Road to Wembley' },
      iconClass: 'fa-trophy',
      iconBoxBg: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.6)]',
      cardBorder: 'border-emerald-500/50',
      cardGlow: 'shadow-[0_0_50px_rgba(16,185,129,0.25)]',
      cardBgGlow: 'from-emerald-500/15 via-teal-950/20 to-transparent',
      bannerBg: 'bg-gradient-to-r from-emerald-950/90 via-teal-950/60 to-emerald-950/90',
      bannerBorder: 'border-emerald-500/40',
      bannerAccentText: 'text-emerald-300',
      scoreboardScoreColor: 'text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]',
      scoreboardBoxBorder: 'border-emerald-500/40',
      scoreboardHeaderBg: 'bg-gradient-to-r from-emerald-950/70 via-teal-900/40 to-emerald-950/70',
      tagPillBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      goalEventBg: 'bg-emerald-950/50',
      goalEventBorder: 'border-emerald-500/40',
      goalEventText: 'text-emerald-200',
      trophyScaleClass: 'scale-110',
      trophyGlow: 'drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]',
      trophyHeight: 110,
      accentHex: '#10B981',
      primaryBtnClass: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white hover:brightness-110 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
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
    (!isCl && !isEl && !isEcl && !norm.includes('regional') && !norm.includes('grassroots') && !norm.includes('euro') && !norm.includes('asian') && !norm.includes('challenge') && (normType.includes('cup') || normDdType.includes('cup')))
  ) {
    const domesticName =
      country === 'ECU' ? 'Copa Ecuador'
      : (country === 'CAN' || norm.includes('voyageurs') || norm.includes('canadian championship')) ? 'Voyageurs Cup'
      : country === 'USA' ? 'U.S. Open Cup'
      : country === 'BRA' ? 'Copa do Brasil'
      : country === 'ARG' ? 'Copa Argentina'
      : country === 'COL' ? 'Copa Colombia'
      : country === 'MEX' ? 'Copa MX'
      : country === 'ENG' ? 'FA Cup'
      : country === 'ESP' ? 'Copa del Rey'
      : country === 'ITA' ? 'Coppa Italia'
      : country === 'FRA' ? 'Coupe de France'
      : country === 'POR' ? 'Taça de Portugal'
      : country === 'TUR' ? 'Türkiye Kupası'
      : country === 'GER' ? 'DFB-Pokal'
      : country === 'AUT' ? 'ÖFB-Cup'
      : country === 'SUI' ? 'Schweizer Cup'
      : country === 'POL' ? 'Puchar Polski'
      : country === 'DEN' ? 'DBU Pokalen'
      : country === 'NOR' ? 'Norgesmesterskapet'
      : country === 'SWE' ? 'Svenska Cupen'
      : country === 'SCO' ? 'Scottish Cup'
      : country === 'WAL' ? 'Welsh Cup'
      : country === 'AUS' ? 'Australia Cup'
      : country === 'JPN' ? "Emperor's Cup"
      : country === 'IDN' ? 'Piala Indonesia'
      : country === 'IND' ? 'Super Cup'
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
      iconBoxBg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-black shadow-[0_0_30px_rgba(234,179,8,0.6)]',
      cardBorder: 'border-yellow-500/50',
      cardGlow: 'shadow-[0_0_60px_rgba(234,179,8,0.3)]',
      cardBgGlow: 'from-yellow-500/15 via-amber-950/20 to-transparent',
      bannerBg: 'bg-gradient-to-r from-yellow-950/90 via-stone-900/60 to-yellow-950/90',
      bannerBorder: 'border-yellow-500/40',
      bannerAccentText: 'text-yellow-300',
      scoreboardScoreColor: 'text-yellow-400 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]',
      scoreboardBoxBorder: 'border-yellow-500/40',
      scoreboardHeaderBg: 'bg-gradient-to-r from-yellow-950/70 via-amber-900/40 to-yellow-950/70',
      tagPillBg: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
      goalEventBg: 'bg-yellow-950/50',
      goalEventBorder: 'border-yellow-500/40',
      goalEventText: 'text-yellow-200',
      trophyScaleClass: 'scale-115',
      trophyGlow: 'drop-shadow-[0_0_35px_rgba(234,179,8,0.8)]',
      trophyHeight: 130,
      accentHex: '#EAB308',
      primaryBtnClass: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black hover:brightness-110 shadow-[0_0_25px_rgba(234,179,8,0.4)]'
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
    iconBoxBg: 'bg-gradient-to-br from-orange-500 via-amber-600 to-rose-600 text-white shadow-[0_0_25px_rgba(249,115,22,0.5)]',
    cardBorder: 'border-amber-600/40',
    cardGlow: 'shadow-[0_0_40px_rgba(249,115,22,0.2)]',
    cardBgGlow: 'from-amber-600/10 via-stone-900/30 to-transparent',
    bannerBg: 'bg-gradient-to-r from-stone-900/90 via-amber-950/60 to-stone-900/90',
    bannerBorder: 'border-amber-600/40',
    bannerAccentText: 'text-amber-300',
    scoreboardScoreColor: 'text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.7)]',
    scoreboardBoxBorder: 'border-amber-600/30',
    scoreboardHeaderBg: 'bg-gradient-to-r from-stone-900/80 via-amber-950/40 to-stone-900/80',
    tagPillBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    goalEventBg: 'bg-stone-900/60',
    goalEventBorder: 'border-amber-600/30',
    goalEventText: 'text-amber-200',
    trophyScaleClass: 'scale-100',
    trophyGlow: 'drop-shadow-[0_0_25px_rgba(249,115,22,0.6)]',
    trophyHeight: 85,
    accentHex: '#D97706',
    primaryBtnClass: 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white hover:brightness-110 shadow-[0_0_20px_rgba(217,119,6,0.4)]'
  };
};
