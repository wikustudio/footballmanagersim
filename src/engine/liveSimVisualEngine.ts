import {
  Club,
  GameState,
  MatchdayOutcome,
  MatchPhase,
  PitchDesignId,
  ShotEvent,
  StadiumArchitectureStyle,
  StadiumNamingRightsDeal,
  StadiumPolicy,
  SupercupResult,
  TableRow,
} from '../types';
import {
  getLeagueInfo,
  getLeagueScaledVal,
  getCountryMult,
  isReserveClub,
  calculateClubFinancials,
} from '../data/gameConstants';
import {
  buildDeterministicDivisionTable,
  LiveStandingsRow,
  resolveDivisionClubs,
} from './standingsEngine';
import { resolveCuratedTier1StadiumStyle } from './tier1StadiumDesigns';

export type { LiveStandingsRow };

export interface PitchDesignConfig {
  id: PitchDesignId;
  name: string;
  desc: string;
  turfPrimary: string;
  turfStripe: string;
  apronColor: string;
  lineColor: string;
  standBg: string;
  swatchA: string;
  swatchB: string;
}

export const PITCH_DESIGNS: PitchDesignConfig[] = [
  {
    id: 'emerald_stripe',
    name: 'Mowed Matchday Stripes',
    desc: 'Crisp sunlit emerald cross-mowed natural turf with clean chalk lines & bright slate apron',
    turfPrimary: '#2E9656',
    turfStripe: '#268249',
    apronColor: '#2B3E54',
    lineColor: 'rgba(255,255,255,0.94)',
    standBg: '#27364B',
    swatchA: '#2E9656',
    swatchB: '#2B3E54',
  },
  {
    id: 'club_heritage',
    name: 'Club Heritage Surround',
    desc: 'Full club-colored touchline apron, LED fascia & bright championship turf contrast',
    turfPrimary: '#2A8D50',
    turfStripe: '#227A43',
    apronColor: 'CLUB_PRIMARY',
    lineColor: 'rgba(255,255,255,0.95)',
    standBg: '#2A384E',
    swatchA: 'CLUB_PRIMARY',
    swatchB: 'CLUB_SECONDARY',
  },
  {
    id: 'continental_carpet',
    name: 'Continental Velvet Carpet',
    desc: 'Illuminated European broadcast emerald grass with royal-cobalt perimeter apron',
    turfPrimary: '#268854',
    turfStripe: '#1F7547',
    apronColor: '#1E467A',
    lineColor: 'rgba(255,255,255,0.94)',
    standBg: '#23344D',
    swatchA: '#1E467A',
    swatchB: '#268854',
  },
  {
    id: 'classic_cut',
    name: 'British Checkerboard Turf',
    desc: 'Rich sunlit meadow grass with traditional terracotta track surround & bright trim',
    turfPrimary: '#359B56',
    turfStripe: '#2C8749',
    apronColor: '#A24B3A',
    lineColor: 'rgba(255,255,255,0.92)',
    standBg: '#2D3748',
    swatchA: '#A24B3A',
    swatchB: '#359B56',
  },
];

export const getPitchDesign = (id?: PitchDesignId): PitchDesignConfig => {
  return PITCH_DESIGNS.find((p) => p.id === id) || PITCH_DESIGNS[0];
};

const normalizeHex = (raw?: string, fallback = '#1D4ED8'): string => {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return fallback;
};

const getHexLuma = (hex: string): number => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000;
};

export interface ClubCampusPalette {
  primary: string;
  secondary: string;
  accent: string;
  textOnPrimary: string;
}

export const getClubCampusColors = (club?: Partial<Club> | null): ClubCampusPalette => {
  const primary = normalizeHex(club?.color, '#1D4ED8');
  const luma = getHexLuma(primary);
  const nameLower = (club?.name || '').toLowerCase();

  let secondary = luma >= 195 ? '#18191F' : '#FFFFFF';
  let accent = luma >= 195 ? '#D97706' : '#F59E0B';

  if (nameLower.includes('barcelona') || nameLower.includes('catalunya')) {
    secondary = '#A50044';
    accent = '#FBBF24';
  } else if (nameLower.includes('real madrid') || nameLower.includes('madrid white')) {
    secondary = '#00529F';
    accent = '#F59E0B';
  } else if (nameLower.includes('athletic') || nameLower.includes('bilbao')) {
    secondary = '#FFFFFF';
    accent = '#18191F';
  } else if (nameLower.includes('dortmund')) {
    secondary = '#18191F';
    accent = '#FDE100';
  } else if (nameLower.includes('inter') || nameLower.includes('milan (b)')) {
    secondary = '#0F172A';
    accent = '#FBBF24';
  } else if (nameLower.includes('ac milan') || nameLower.includes('milan (r)')) {
    secondary = '#111827';
    accent = '#EF4444';
  } else if (nameLower.includes('celtic') || nameLower.includes('sporting') || nameLower.includes('magdeburg')) {
    secondary = '#FFFFFF';
    accent = '#F59E0B';
  }

  return {
    primary,
    secondary,
    accent,
    textOnPrimary: luma >= 165 ? '#18191F' : '#FFFFFF',
  };
};

const KNOWN_RESERVE_GROUNDS: Record<string, string> = {
  'fc bayern münchen ii': 'Grünwalder Stadion',
  'fc bayern munich ii': 'Grünwalder Stadion',
  'borussia dortmund ii': 'Stadion Rote Erde',
  'vfb stuttgart ii': 'Gazi-Stadion auf der Waldau',
  'sc freiburg ii': 'Dreisamstadion',
  'real madrid castilla': 'Estadio Alfredo Di Stéfano',
  'fc barcelona atlètic': 'Estadi Johan Cruyff',
  'barcelona b': 'Estadi Johan Cruyff',
  'manchester city u21': 'Joie Stadium',
  'arsenal u21': 'Meadow Park',
  'chelsea u21': 'Kingsmeadow',
  'ajax ii': 'Sportpark De Toekomst',
  'jong ajax': 'Sportpark De Toekomst',
  'psv ii': 'De Herdgang',
  'jong psv': 'De Herdgang',
  'benfica b': 'Benfica Campus',
  'porto b': 'Estádio Luís Filipe Menezes',
};

const KNOWN_CLUB_STADIUMS: Array<{ match: string; stadium: string }> = [
  { match: 'belenenses', stadium: 'Estádio do Restelo' },
  { match: 'benfica', stadium: 'Estádio da Luz' },
  { match: 'fc porto', stadium: 'Estádio do Dragão' },
  { match: 'sporting cp', stadium: 'Estádio José Alvalade' },
  { match: 'sporting lisbon', stadium: 'Estádio José Alvalade' },
  { match: 'sc braga', stadium: 'Estádio Municipal de Braga' },
  { match: 'vitória sc', stadium: 'Estádio D. Afonso Henriques' },
  { match: 'vitoria sc', stadium: 'Estádio D. Afonso Henriques' },
  { match: 'boavista', stadium: 'Estádio do Bessa' },
  { match: 'aucas', stadium: 'Estadio Gonzalo Pozo Ripalda' },
  { match: 'barcelona sc', stadium: 'Estadio Monumental Isidro Romero Carbo' },
  { match: 'ldu quito', stadium: 'Estadio Rodrigo Paz Delgado' },
  { match: 'emelec', stadium: 'Estadio George Capwell' },
  { match: 'bayern', stadium: 'Allianz Arena' },
  { match: 'dortmund', stadium: 'Westfalenstadion' },
  { match: 'schalke', stadium: 'Veltins-Arena' },
  { match: 'hertha', stadium: 'Olympiastadion Berlin' },
  { match: 'st. pauli', stadium: 'Millerntor-Stadion' },
  { match: 'union berlin', stadium: 'An der Alten Försterei' },
  { match: 'hamburger sv', stadium: 'Volksparkstadion' },
  { match: 'werder bremen', stadium: 'Weserstadion' },
  { match: 'eintracht frankfurt', stadium: 'Waldstadion' },
  { match: '1. fc köln', stadium: 'RheinEnergieStadion' },
  { match: '1. fc koln', stadium: 'RheinEnergieStadion' },
  { match: 'arsenal', stadium: 'Emirates Stadium' },
  { match: 'liverpool', stadium: 'Anfield' },
  { match: 'chelsea', stadium: 'Stamford Bridge' },
  { match: 'manchester united', stadium: 'Old Trafford' },
  { match: 'manchester city', stadium: 'Etihad Stadium' },
  { match: 'tottenham', stadium: 'Tottenham Hotspur Stadium' },
  { match: 'newcastle', stadium: "St James' Park" },
  { match: 'aston villa', stadium: 'Villa Park' },
  { match: 'everton', stadium: 'Goodison Park' },
  { match: 'fc barcelona', stadium: 'Camp Nou' },
  { match: 'real madrid', stadium: 'Santiago Bernabéu' },
  { match: 'atlético madrid', stadium: 'Metropolitano' },
  { match: 'atletico madrid', stadium: 'Metropolitano' },
  { match: 'athletic club', stadium: 'San Mamés' },
  { match: 'athletic bilbao', stadium: 'San Mamés' },
  { match: 'sevilla', stadium: 'Ramón Sánchez-Pizjuán' },
  { match: 'real betis', stadium: 'Benito Villamarín' },
  { match: 'valencia', stadium: 'Mestalla' },
  { match: 'ac milan', stadium: 'San Siro' },
  { match: 'inter milan', stadium: 'San Siro' },
  { match: 'internazionale', stadium: 'San Siro' },
  { match: 'juventus', stadium: 'Allianz Stadium' },
  { match: 'as roma', stadium: 'Stadio Olimpico' },
  { match: 'lazio', stadium: 'Stadio Olimpico' },
  { match: 'napoli', stadium: 'Stadio Diego Armando Maradona' },
  { match: 'paris saint-germain', stadium: 'Parc des Princes' },
  { match: 'marseille', stadium: 'Stade Vélodrome' },
  { match: 'ajax', stadium: 'Johan Cruijff ArenA' },
  { match: 'feyenoord', stadium: 'De Kuip' },
  { match: 'psv', stadium: 'Philips Stadion' },
  { match: 'celtic', stadium: 'Celtic Park' },
  { match: 'rangers', stadium: 'Ibrox Stadium' },
  { match: 'boca juniors', stadium: 'La Bombonera' },
  { match: 'river plate', stadium: 'El Monumental' },
  { match: 'flamengo', stadium: 'Maracanã' },
  { match: 'fluminense', stadium: 'Maracanã' },
];

export const getEffectiveStadiumName = (
  club?: Partial<Club> | null,
  namingRights?: StadiumNamingRightsDeal | null
): string => {
  if (!club) return 'Municipal Stadium';
  const name = (club.name || 'Club').trim();
  const isRes = Boolean(club.isReserve) || isReserveClub(name);

  if (isRes) {
    const lower = name.toLowerCase();
    if (KNOWN_RESERVE_GROUNDS[lower]) {
      return KNOWN_RESERVE_GROUNDS[lower];
    }
    const cleanBase = name
      .replace(/\s+II$/i, '')
      .replace(/\s+\(?B\)?$/i, '')
      .replace(/\s+U21$/i, '')
      .replace(/\s+U23$/i, '')
      .replace(/\s+Res\.?$/i, '')
      .replace(/\s+Reserve$/i, '')
      .trim();
    return `${cleanBase} Academy Ground`;
  }

  if (namingRights && (namingRights.yearsLeft ?? 0) > 0 && namingRights.stadiumDisplayName) {
    return namingRights.stadiumDisplayName;
  }

  if (club.stadiumName && club.stadiumName.trim().length > 0) {
    return club.stadiumName.trim();
  }

  const lowerName = name.toLowerCase();
  const known = KNOWN_CLUB_STADIUMS.find((entry) => lowerName.includes(entry.match));
  if (known) {
    return known.stadium;
  }

  const cityWord = name
    .replace(/^(FC|1\. FC|SC|SV|VfB|TSG|RB|Borussia|Eintracht|Real|AC|AS|Olympique|Sporting|C\.F\. Os|CF Os|SD|CD)\s+/i, '')
    .trim();
  return `${cityWord || name} Arena`;
};

export type StadiumScaleBand = 'small' | 'medium' | 'large' | 'massive';
export type StadiumCapacityTier = 'village' | 'regional' | 'twin' | 'arena' | 'colossus';

export const STADIUM_STYLE_OPTIONS: Array<{
  id: StadiumArchitectureStyle;
  name: string;
  shortName: string;
  desc: string;
}> = [
  {
    id: 'english_box',
    name: 'English Tight Box',
    shortName: 'English Box',
    desc: 'Steep touchline-hugging stands, boxy corners & cantilevered gantry roofs',
  },
  {
    id: 'olympic_track',
    name: 'Olympic Running Track Bowl',
    shortName: 'Running Track',
    desc: 'Rounded elliptical bowl around a multi-lane athletics oval & curved ends',
  },
  {
    id: 'continental_bowl',
    name: 'Continental Rounded Arena',
    shortName: 'Rounded Bowl',
    desc: 'Smooth curved-corner modern stadium bowl with sweeping upper decks',
  },
  {
    id: 'open_terrace',
    name: 'Classic Open Terrace',
    shortName: 'Open Terrace',
    desc: 'Intimate municipal ground with open corners & floodlight towers',
  },
];

export const getStadiumStyleMeta = (style?: StadiumArchitectureStyle) =>
  STADIUM_STYLE_OPTIONS.find((s) => s.id === style) || STADIUM_STYLE_OPTIONS[2];

/**
 * Deterministically assigns authentic architectural variety across clubs/countries/tiers
 * while respecting any explicit override or saved club preference.
 */
export const resolveClubStadiumStyle = (
  club?: Partial<Club> | null,
  overrideStyle?: StadiumArchitectureStyle | null
): StadiumArchitectureStyle => {
  if (
    overrideStyle === 'english_box' ||
    overrideStyle === 'olympic_track' ||
    overrideStyle === 'continental_bowl' ||
    overrideStyle === 'open_terrace'
  ) {
    return overrideStyle;
  }
  if (
    club?.stadiumStyle === 'english_box' ||
    club?.stadiumStyle === 'olympic_track' ||
    club?.stadiumStyle === 'continental_bowl' ||
    club?.stadiumStyle === 'open_terrace'
  ) {
    return club.stadiumStyle;
  }

  const curatedTier1Style = resolveCuratedTier1StadiumStyle(club);
  if (curatedTier1Style) {
    return curatedTier1Style;
  }

  const nameLower = (club?.name || '').toLowerCase();
  const stadLower = (club?.stadiumName || '').toLowerCase();
  const country = (club?.country || 'GER').toUpperCase();
  const cap = club?.stadium || 15000;
  const tier = club?.tier || 3;

  // Explicit heritage cues (Olympic bowls, Athletics parks, tight UK grounds)
  if (
    /olymp|olimpico|stade de france|vogtland|rosenau|sportpark|karlsruhe|hertha|nürnberg|nuremberg|plauen|chemnitz|lazio|roma|napoli|bari/i.test(
      `${nameLower} ${stadLower}`
    )
  ) {
    return 'olympic_track';
  }
  if (/dortmund|anfield|trafford|stamford|highbury|goodison|villa park|celtic|rangers|ibrox|st\. pauli|millerntor|union berlin|alte försterei/i.test(`${nameLower} ${stadLower}`)) {
    return 'english_box';
  }

  // Deterministic seed hash based on club identity
  const seedStr = `${club?.id ?? 0}-${nameLower}-${country}`;
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const bucket = (h >>> 0) % 100;

  if (country === 'ENG' || country === 'SCO' || country === 'WAL' || country === 'IRL') {
    if (cap < 5500 && tier >= 5 && bucket < 35) return 'open_terrace';
    if (cap >= 55000 && bucket >= 72) return 'continental_bowl';
    return 'english_box';
  }

  if (cap < 7000) {
    if (bucket < 44) return 'olympic_track';
    if (bucket < 78) return 'open_terrace';
    return 'english_box';
  }

  if (cap < 36000) {
    if (country === 'ITA' || country === 'POL' || country === 'AUT' || country === 'SUI' || country === 'CZE') {
      if (bucket < 46) return 'olympic_track';
      if (bucket < 78) return 'continental_bowl';
      return 'english_box';
    }
    if (bucket < 34) return 'olympic_track';
    if (bucket < 68) return 'continental_bowl';
    return 'english_box';
  }

  // Large & Colossus grounds (36k - 150k)
  if ((country === 'ITA' || country === 'FRA') && bucket < 34) return 'olympic_track';
  if (bucket < 22) return 'olympic_track';
  if (bucket < 74) return 'continental_bowl';
  return 'english_box';
};

export interface StadiumArchitectureProfile {
  style: StadiumArchitectureStyle;
  styleName: string;
  hasRunningTrack: boolean;
  isRoundedBowl: boolean;
  standGapU: number;
  standGapV: number;
  clampedCapacity: number;
  scaleT: number; // 0.0 (1,000 seats) -> 1.0 (150,000 seats)
  scaleBand: StadiumScaleBand;
  capacityTier: StadiumCapacityTier;
  tierLabel: string;
  standDepth: number;
  tierHeight: number;
  outerU: number;
  outerV: number;
  sideCols: number;
  sideRows: number;
  endCols: number;
  endRows: number;
  cornerCols: number;
  cornerRows: number;
  hasCorners: boolean;
  hasUpperRing: boolean;
  hasThirdTier: boolean;
  hasRoofCanopy: boolean;
  hasFullRoofWrap: boolean;
  hasFloodlightPylons: boolean;
  zoomFactor: number;
}

/**
 * Computes continuous & multi-bracket stadium architecture from 1,000 seats to 150,000 seats
 * across all architectural varieties (English Box, Running Track Oval, Continental Bowl, Open Terrace).
 */
export const computeStadiumArchitecture = (
  capacity: number,
  style: StadiumArchitectureStyle = 'continental_bowl'
): StadiumArchitectureProfile => {
  const clampedCapacity = Math.max(1000, Math.min(150000, Math.round(capacity || 5000)));
  const scaleT = Math.max(
    0,
    Math.min(1, Math.log10(clampedCapacity / 1000) / Math.log10(150000 / 1000))
  );

  const scaleBand: StadiumScaleBand =
    clampedCapacity >= 55000
      ? 'massive'
      : clampedCapacity >= 25000
      ? 'large'
      : clampedCapacity >= 8000
      ? 'medium'
      : 'small';

  const capacityTier: StadiumCapacityTier =
    clampedCapacity >= 90000
      ? 'colossus'
      : clampedCapacity >= 45000
      ? 'arena'
      : clampedCapacity >= 15000
      ? 'twin'
      : clampedCapacity >= 5000
      ? 'regional'
      : 'village';

  const baseTierLabel =
    capacityTier === 'colossus'
      ? '100k+ Mega-Colossus'
      : capacityTier === 'arena'
      ? '3-Tier Championship'
      : capacityTier === 'twin'
      ? 'Twin-Tier Broadcast'
      : capacityTier === 'regional'
      ? 'Regional Ground'
      : '1k–5k Community Pitch';

  const styleMeta = getStadiumStyleMeta(style);
  const hasRunningTrack = style === 'olympic_track';
  const isRoundedBowl = style === 'olympic_track' || style === 'continental_bowl';

  // Pitch apron gap before first stand row: tight British walls vs wide multi-lane Olympic oval
  const standGapU =
    style === 'olympic_track'
      ? 48
      : style === 'english_box'
      ? 4
      : style === 'continental_bowl'
      ? 9
      : 8;
  const standGapV =
    style === 'olympic_track'
      ? 34
      : style === 'english_box'
      ? 4
      : style === 'continental_bowl'
      ? 9
      : 8;

  // Continuous scaling across 1,000 -> 150,000 seats tailored per architectural variety
  const depthScale =
    style === 'olympic_track'
      ? 0.88
      : style === 'open_terrace'
      ? 0.82
      : style === 'english_box'
      ? 0.96
      : 1.0;
  const heightMult =
    style === 'english_box'
      ? 1.16
      : style === 'open_terrace'
      ? 0.78
      : style === 'olympic_track'
      ? 0.92
      : 1.02;

  // Progressive super-arena & colossus scaling so 90k-150k stadiums dwarf 40k-55k arenas authentically
  const megaT = Math.max(0, Math.min(1, (clampedCapacity - 45000) / (150000 - 45000)));
  const colossusT = Math.max(0, Math.min(1, (clampedCapacity - 80000) / (150000 - 80000)));

  const standDepth = Math.round(
    (15 + scaleT * 60 + Math.pow(megaT, 1.15) * 48 + Math.pow(colossusT, 1.08) * 34) * depthScale
  );
  const tierHeight = Math.round(
    (9 + scaleT * 36 + Math.pow(megaT, 1.12) * 34 + Math.pow(colossusT, 1.08) * 26) * heightMult
  );
  const outerU = Math.round(228 + standGapU + standDepth + 6);
  const outerV = Math.round(153 + standGapV + standDepth + 6);

  // High-density spectator grid counts so filled stands look packed shoulder-to-shoulder across 1-4 tiers
  const sideCols = Math.round(42 + scaleT * 28 + megaT * 8); // 42 -> 78 columns along touchline
  const sideRows = Math.round(7 + scaleT * 9 + megaT * 5); // 7 -> 21 rows deep on sidelines
  const endCols = Math.round(6 + scaleT * 8 + megaT * 4); // 6 -> 18 rows deep behind goals
  const endRows = Math.round(28 + scaleT * 16 + megaT * 6); // 28 -> 50 columns across goal line
  const cornerCols = isRoundedBowl
    ? Math.round(28 + scaleT * 22 + megaT * 6)
    : Math.max(7, Math.round(7 + scaleT * 6 + megaT * 4));
  const cornerRows = isRoundedBowl
    ? Math.round(8 + scaleT * 8 + megaT * 4)
    : Math.max(6, Math.round(6 + scaleT * 6 + megaT * 4));

  const hasCorners = isRoundedBowl
    ? true
    : style === 'english_box'
    ? clampedCapacity >= 12000
    : clampedCapacity >= 24000;
  const hasUpperRing = clampedCapacity >= 15000;
  const hasThirdTier = clampedCapacity >= 45000;
  const hasRoofCanopy =
    style === 'english_box'
      ? clampedCapacity >= 12000
      : style === 'open_terrace'
      ? clampedCapacity >= 45000
      : clampedCapacity >= 28000;
  const hasFullRoofWrap = clampedCapacity >= 80000;
  const hasFloodlightPylons =
    style === 'open_terrace'
      ? clampedCapacity < 65000
      : style === 'english_box'
      ? clampedCapacity < 22000
      : clampedCapacity < 45000;

  // Dynamic viewport fit guarantees every style (including 150k Colossus + Olympic track) fills the frame dramatically without clipping
  const maxIsoHalfWidth = outerU * 0.62 + outerV * 0.68;
  const zoomFactor = Number(Math.min(1.06, Math.max(0.58, 356 / maxIsoHalfWidth)).toFixed(3));

  return {
    style,
    styleName: styleMeta.shortName,
    hasRunningTrack,
    isRoundedBowl,
    standGapU,
    standGapV,
    clampedCapacity,
    scaleT: Number(scaleT.toFixed(4)),
    scaleBand,
    capacityTier,
    tierLabel: `${baseTierLabel} · ${styleMeta.shortName}`,
    standDepth,
    tierHeight,
    outerU,
    outerV,
    sideCols,
    sideRows,
    endCols,
    endRows,
    cornerCols,
    cornerRows,
    hasCorners,
    hasUpperRing,
    hasThirdTier,
    hasRoofCanopy,
    hasFullRoofWrap,
    hasFloodlightPylons,
    zoomFactor,
  };
};

export interface SeatOccupancyProfile {
  totalRatio: number;
  mainMidfieldFill: number;
  mainWingFill: number;
  oppositeMidfieldFill: number;
  oppositeWingFill: number;
  upperTierFill: number;
  cornerFill: number;
  homeEndFill: number;
  awayEndFill: number;
  tierCount: 1 | 2 | 3;
  vipBoxesCount: number;
}

export const computeSeatOccupancyProfile = (
  attendance: number,
  capacity: number,
  isMatchday: boolean = true
): SeatOccupancyProfile => {
  const safeCap = Math.max(500, capacity || 5000);
  const rawAtt =
    attendance !== undefined && attendance !== null && Number.isFinite(attendance)
      ? attendance
      : Math.round(safeCap * 0.72);
  const safeAtt = isMatchday ? Math.max(0, Math.min(safeCap, rawAtt)) : 0;
  const totalRatio = isMatchday && safeAtt > 0 ? Math.max(0.02, Math.min(1, safeAtt / safeCap)) : 0;

  // Authentic section fill hierarchy:
  // 1. Behind-the-goal Home Fan Section (homeEndFill) ALWAYS fills first.
  // 2. Halfway / Center-line midfield sections (mainMidfieldFill, oppositeMidfieldFill) fill next.
  // 3. Touchline outer wings & Away End fill after center-line seats.
  // 4. Corner sweeps (cornerFill) & upper rings (upperTierFill) fill last, so a ~75% crowd
  //    (e.g. 31,087 / 41,575) visibly shows ~25% open seats in corners and outer upper wings.
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const homeEndFill = isMatchday && totalRatio > 0 ? clamp01(0.18 + Math.pow(totalRatio, 0.72) * 0.88) : 0;
  const mainMidfieldFill = isMatchday && totalRatio > 0 ? clamp01(0.10 + Math.pow(totalRatio, 0.78) * 0.92) : 0;
  const oppositeMidfieldFill = isMatchday && totalRatio > 0 ? clamp01(0.08 + Math.pow(totalRatio, 0.80) * 0.92) : 0;
  const mainWingFill = isMatchday && totalRatio > 0 ? clamp01(Math.max(0, totalRatio - 0.22) / 0.78) : 0;
  const oppositeWingFill = isMatchday && totalRatio > 0 ? clamp01(Math.max(0, totalRatio - 0.25) / 0.75) : 0;
  const awayEndFill =
    isMatchday && totalRatio > 0
      ? clamp01(Math.pow(totalRatio, 1.05) * 0.96 + (totalRatio > 0.90 ? (totalRatio - 0.90) * 0.40 : 0))
      : 0;
  const cornerFill =
    isMatchday && totalRatio > 0
      ? clamp01(Math.pow(Math.max(0, (totalRatio - 0.24) / 0.76), 1.28))
      : 0;
  const upperTierFill =
    isMatchday && totalRatio > 0
      ? clamp01(Math.pow(Math.max(0, (totalRatio - 0.30) / 0.70), 1.22))
      : 0;

  const tierCount: 1 | 2 | 3 = safeCap >= 45000 ? 3 : safeCap >= 15000 ? 2 : 1;
  const vipBoxesCount =
    safeCap >= 90000 ? 10 : safeCap >= 55000 ? 8 : safeCap >= 30000 ? 6 : safeCap >= 15000 ? 4 : safeCap >= 7000 ? 2 : 0;

  return {
    totalRatio,
    mainMidfieldFill,
    mainWingFill,
    oppositeMidfieldFill,
    oppositeWingFill,
    upperTierFill,
    cornerFill,
    homeEndFill,
    awayEndFill,
    tierCount,
    vipBoxesCount,
  };
};

export interface SeatOccupancyEvalParams {
  isMatchdayActive: boolean;
  isCorner: boolean;
  isGoalEnd: boolean;
  centerOut: boolean;
  uNorm: number; // 0 at center line, 1 at outer touchline wing
  vNorm: number; // 0 directly behind goalposts, 1 at outer goal-stand edge
  frontBackRatio: number; // 0 at pitchside row, 1 at top back row
  cornerAngT: number; // 0 at sideline seam, 1 at goal-end seam
  fillRatio: number;
  wingFillRatio?: number;
  fillStart?: number;
  fillEnd?: number;
  ui: number;
  vi: number;
}

export const evaluateStadiumSeatOccupancy = (
  params: SeatOccupancyEvalParams
): { isOccupied: boolean; localFillRatio: number; rawThreshold: number } => {
  const {
    isMatchdayActive,
    isCorner,
    isGoalEnd,
    centerOut,
    uNorm,
    vNorm,
    frontBackRatio,
    cornerAngT,
    fillRatio,
    wingFillRatio,
    fillStart,
    fillEnd,
    ui,
    vi,
  } = params;

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const safeUNorm = clamp01(uNorm);
  const safeVNorm = clamp01(vNorm);
  const safeFB = clamp01(frontBackRatio);
  const safeAng = clamp01(cornerAngT);

  let localFillRatio = clamp01(fillRatio);
  if (isCorner && fillStart !== undefined && fillEnd !== undefined) {
    localFillRatio = clamp01(fillStart + (fillEnd - fillStart) * safeAng);
  } else if (!isCorner && !isGoalEnd && centerOut && wingFillRatio !== undefined) {
    // Taper sideline target fill from Center Line (uNorm = 0) outward to Wings (uNorm = 1)
    localFillRatio = clamp01(fillRatio * (1 - safeUNorm * 0.72) + wingFillRatio * (safeUNorm * 0.72));
  }

  const rawJitter = (((ui * 13 + vi * 7) % 11) - 5) * 0.012;
  // Attenuate jitter near 100% sellout so full-capacity games leave zero stray empty seats
  const jitterScale = localFillRatio >= 0.985 ? 0 : localFillRatio >= 0.92 ? (0.985 - localFillRatio) / 0.065 : 1;
  const seatJitter = rawJitter * jitterScale;

  let baseThreshold: number;
  if (isCorner) {
    // Corners fill from lower rows and stand seams inward, leaving upper-diagonal corner rows last
    const wedgeCenterDist = 1 - Math.abs(safeAng * 2 - 1);
    baseThreshold = safeFB * 0.68 + wedgeCenterDist * 0.30;
  } else if (centerOut) {
    if (isGoalEnd) {
      // Behind-the-goal fan section fills from behind the goalposts (vNorm = 0) & lower/mid terrace outward
      baseThreshold = safeVNorm * 0.46 + safeFB * 0.52;
    } else {
      // Sidelines fill strongly from the Center Line (uNorm = 0) and lower rows outward toward the wings
      baseThreshold = safeUNorm * 0.64 + safeFB * 0.34;
    }
  } else {
    baseThreshold = Math.abs(safeUNorm - 0.5) * 0.28 + safeFB * 0.70;
  }

  const rawThreshold = Math.max(0.005, Math.min(0.995, baseThreshold + seatJitter));
  const isOccupied =
    isMatchdayActive &&
    localFillRatio > 0.01 &&
    (localFillRatio >= 0.995 || rawThreshold <= localFillRatio);

  return { isOccupied, localFillRatio, rawThreshold };
};

/**
 * Pure audit helper replicating the 3D bowl seat grid across Home End, Away End,
 * Sideline Center, Sideline Wings, and Corners to verify exact visual fill rates in unit tests.
 */
export const auditBowlSeatOccupancy = (
  attendance: number,
  capacity: number,
  stadiumPolicy: StadiumPolicy = 'balanced'
): {
  overallFill: number;
  homeEndFill: number;
  awayEndFill: number;
  sidelineCenterFill: number;
  sidelineWingFill: number;
  cornerFill: number;
  totalSeatsSampled: number;
  occupiedSeatsSampled: number;
} => {
  const geom = computeStadiumArchitecture(capacity);
  const profile = computeSeatOccupancyProfile(attendance, capacity, true);
  const homeCurvaEffectiveFill =
    stadiumPolicy === 'ultras'
      ? Math.min(1, profile.homeEndFill * 1.12 + 0.05)
      : stadiumPolicy === 'commercial'
      ? Math.max(0.18, profile.homeEndFill * 0.74)
      : profile.homeEndFill;

  let homeTotal = 0, homeOcc = 0;
  let awayTotal = 0, awayOcc = 0;
  let centerTotal = 0, centerOcc = 0;
  let wingTotal = 0, wingOcc = 0;
  let cornerTotal = 0, cornerOcc = 0;

  // 1. Home & Away Ends
  const endU = Math.min(geom.endCols, 12);
  const endV = Math.min(geom.endRows, 32);
  for (let ui = 0; ui < endU; ui++) {
    for (let vi = 0; vi < endV; vi++) {
      const fbHome = 1 - (endU > 1 ? ui / (endU - 1) : 0.5);
      const fbAway = endU > 1 ? ui / (endU - 1) : 0.5;
      const vNorm = Math.abs(((vi + 0.5) / endV) * 2 - 1);
      homeTotal++;
      if (
        evaluateStadiumSeatOccupancy({
          isMatchdayActive: true,
          isCorner: false,
          isGoalEnd: true,
          centerOut: true,
          uNorm: 0,
          vNorm,
          frontBackRatio: fbHome,
          cornerAngT: 0.5,
          fillRatio: homeCurvaEffectiveFill,
          ui,
          vi,
        }).isOccupied
      ) {
        homeOcc++;
      }
      awayTotal++;
      if (
        evaluateStadiumSeatOccupancy({
          isMatchdayActive: true,
          isCorner: false,
          isGoalEnd: true,
          centerOut: true,
          uNorm: 0,
          vNorm,
          frontBackRatio: fbAway,
          cornerAngT: 0.5,
          fillRatio: profile.awayEndFill,
          ui,
          vi,
        }).isOccupied
      ) {
        awayOcc++;
      }
    }
  }

  // 2. Top & Bottom Sidelines
  const sideU = Math.min(geom.sideCols, 48);
  const sideV = Math.min(geom.sideRows, 10);
  for (const stand of [
    { mid: profile.oppositeMidfieldFill, wing: profile.oppositeWingFill, invFB: true },
    { mid: profile.mainMidfieldFill, wing: profile.mainWingFill, invFB: false },
  ]) {
    for (let ui = 0; ui < sideU; ui++) {
      for (let vi = 0; vi < sideV; vi++) {
        const uNorm = Math.abs(((ui + 0.5) / sideU) * 2 - 1);
        const vFrac = sideV > 1 ? vi / (sideV - 1) : 0.5;
        const fb = stand.invFB ? 1 - vFrac : vFrac;
        const occ = evaluateStadiumSeatOccupancy({
          isMatchdayActive: true,
          isCorner: false,
          isGoalEnd: false,
          centerOut: true,
          uNorm,
          vNorm: 0,
          frontBackRatio: fb,
          cornerAngT: 0.5,
          fillRatio: stand.mid,
          wingFillRatio: stand.wing,
          ui,
          vi,
        }).isOccupied;
        if (uNorm <= 0.42) {
          centerTotal++;
          if (occ) centerOcc++;
        } else {
          wingTotal++;
          if (occ) wingOcc++;
        }
      }
    }
  }

  // 3. 4 Corners (if stadium has corners)
  if (geom.hasCorners) {
    const cU = geom.isRoundedBowl ? 34 : Math.min(geom.cornerCols, 16);
    const cV = geom.isRoundedBowl ? 11 : Math.min(geom.cornerRows, 12);
    const cornerConfigs = [
      {
        start: Math.min(1, profile.cornerFill * 0.90 + profile.oppositeWingFill * 0.10),
        end: Math.min(1, profile.cornerFill * 0.78 + homeCurvaEffectiveFill * 0.22),
      },
      {
        start: Math.min(1, profile.cornerFill * 0.92 + profile.oppositeWingFill * 0.08),
        end: Math.min(1, profile.cornerFill * 0.88 + profile.awayEndFill * 0.12),
      },
      {
        start: Math.min(1, profile.cornerFill * 0.90 + profile.mainWingFill * 0.10),
        end: Math.min(1, profile.cornerFill * 0.78 + homeCurvaEffectiveFill * 0.22),
      },
      {
        start: Math.min(1, profile.cornerFill * 0.92 + profile.mainWingFill * 0.08),
        end: Math.min(1, profile.cornerFill * 0.88 + profile.awayEndFill * 0.12),
      },
    ];
    for (const cfg of cornerConfigs) {
      for (let ui = 0; ui < cU; ui++) {
        for (let vi = 0; vi < cV; vi++) {
          const angT = (ui + 0.5) / cU;
          const fb = (vi + 0.5) / cV;
          cornerTotal++;
          if (
            evaluateStadiumSeatOccupancy({
              isMatchdayActive: true,
              isCorner: true,
              isGoalEnd: false,
              centerOut: false,
              uNorm: angT,
              vNorm: fb,
              frontBackRatio: fb,
              cornerAngT: angT,
              fillRatio: profile.cornerFill,
              fillStart: cfg.start,
              fillEnd: cfg.end,
              ui,
              vi,
            }).isOccupied
          ) {
            cornerOcc++;
          }
        }
      }
    }
  }

  const totalSeatsSampled = homeTotal + awayTotal + centerTotal + wingTotal + cornerTotal;
  const occupiedSeatsSampled = homeOcc + awayOcc + centerOcc + wingOcc + cornerOcc;

  return {
    overallFill: totalSeatsSampled > 0 ? occupiedSeatsSampled / totalSeatsSampled : 0,
    homeEndFill: homeTotal > 0 ? homeOcc / homeTotal : 0,
    awayEndFill: awayTotal > 0 ? awayOcc / awayTotal : 0,
    sidelineCenterFill: centerTotal > 0 ? centerOcc / centerTotal : 0,
    sidelineWingFill: wingTotal > 0 ? wingOcc / wingTotal : 0,
    cornerFill: cornerTotal > 0 ? cornerOcc / cornerTotal : 0,
    totalSeatsSampled,
    occupiedSeatsSampled,
  };
};

export type TacticalSystemKey =
  | 'Total Football'
  | 'Gegenpressing'
  | 'Tiki-Taka'
  | 'Direct Counter'
  | 'Defensive';

export const TACTICAL_SYSTEMS: Array<{
  key: TacticalSystemKey;
  shortLabel: string;
  formation: string;
  badge: string;
}> = [
  { key: 'Total Football', shortLabel: 'Total Football', formation: '3-2-4-1 Fluid', badge: 'Overload' },
  { key: 'Gegenpressing', shortLabel: 'Gegenpressing', formation: '4-2-3-1 High Press', badge: 'High Press' },
  { key: 'Tiki-Taka', shortLabel: 'Tiki-Taka', formation: '4-3-3 Triangles', badge: 'Possession' },
  { key: 'Direct Counter', shortLabel: 'Direct Counter', formation: '4-4-2 Wing Break', badge: 'Fast Break' },
  { key: 'Defensive', shortLabel: 'Defensive', formation: '5-4-1 Low Block', badge: 'Fortress' },
];

export const normalizeTacticalSystem = (
  raw?: string | { key?: string }
): TacticalSystemKey => {
  const str =
    typeof raw === 'string'
      ? raw
      : raw && typeof raw === 'object' && typeof raw.key === 'string'
      ? raw.key
      : 'Total Football';
  const s = str.trim().toLowerCase();
  if (s.includes('gegenpress') || s.includes('press')) return 'Gegenpressing';
  if (s.includes('tiki') || s.includes('possession')) return 'Tiki-Taka';
  if (s.includes('counter') || s.includes('direct') || s.includes('wing')) return 'Direct Counter';
  if (s.includes('defens') || s.includes('catenaccio') || s.includes('bus')) return 'Defensive';
  return 'Total Football';
};

export const getMatchPhaseForOutcome = (
  outcome: MatchdayOutcome | undefined,
  subTick: number,
  isLive: boolean
): MatchPhase => {
  if (!isLive) {
    // Smooth ambient matchday showcase cycle: Tactical Build-Up -> Counter/Press -> Shot on Goal -> Goal & Crowd Celebration
    const cycle = ((subTick % 12) + 12) % 12;
    if (cycle <= 3) return 'buildup';
    if (cycle <= 6) return 'counter';
    if (cycle <= 8) return 'shot';
    if (cycle <= 10) return 'goal';
    return 'setpiece';
  }
  if (!outcome) {
    const step = subTick % 4;
    return step === 0 ? 'buildup' : step === 1 ? 'counter' : step === 2 ? 'shot' : 'goal';
  }
  if (outcome.userGoals > 0) {
    const step = subTick % 4;
    if (step === 0) return 'buildup';
    if (step === 1) return 'counter';
    if (step === 2) return 'shot';
    return 'goal';
  }
  if (outcome.result === 'W') {
    return subTick % 3 === 0 ? 'buildup' : subTick % 3 === 1 ? 'shot' : 'goal';
  }
  if (outcome.result === 'D') {
    return subTick % 3 === 0 ? 'buildup' : subTick % 3 === 1 ? 'shot' : 'setpiece';
  }
  return subTick % 3 === 0 ? 'counter' : subTick % 3 === 1 ? 'shot' : 'setpiece';
};

export interface PitchPlayerNode {
  u: number;
  v: number;
  z: number;
  gk?: boolean;
  role: 'GK' | 'DEF' | 'MID' | 'FWD';
  pose: 'normal' | 'arms_up' | 'shooting' | 'diving' | 'sprinting' | 'tackling';
  hasSpotlight?: boolean;
  celebratingWithCrowd?: boolean;
}

export interface PitchDuelRing {
  u: number;
  v: number;
  kind: '1v1' | 'save' | 'tackle' | 'penalty';
  label: string;
}

export interface ShotTrajectoryArc {
  fromU: number;
  fromV: number;
  fromZ: number;
  ctrlU: number;
  ctrlV: number;
  ctrlZ: number;
  toU: number;
  toV: number;
  toZ: number;
  speedKmh: number;
  xg: number;
  isGoal: boolean;
  label: string;
}

export interface TacticalPitchLink {
  fromU: number;
  fromV: number;
  toU: number;
  toV: number;
  kind: 'pass' | 'press' | 'run';
}

export type MatchTimeOfDay = 'day' | 'night';

/**
 * Deterministically assigns 70% Daytime ('day') and 30% Nighttime ('night')
 * across matchdays and fixtures.
 */
export const computeMatchTimeOfDay = (
  matchday: number = 0,
  clubId: number | string = 1,
  oppId: number | string = 2
): MatchTimeOfDay => {
  const md = Math.max(0, Math.round(matchday || 0));
  const numClub =
    typeof clubId === 'number'
      ? clubId
      : String(clubId)
          .split('')
          .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const numOpp =
    typeof oppId === 'number'
      ? oppId
      : String(oppId)
          .split('')
          .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  // 10-slot deterministic schedule: slots 0..6 (70%) = 'day', slots 7..9 (30%) = 'night'
  // gcd(3, 10) = 1 guarantees every 10 consecutive matchdays have 7 daytime and 3 nighttime games
  const offset = md === 0 ? Math.abs(numClub + numOpp) % 5 : Math.abs(numClub) % 5;
  const bucket = Math.abs(md * 3 + offset) % 10;
  return bucket < 7 ? 'day' : 'night';
};

export interface LiveMatchChoreography {
  tacticKey: TacticalSystemKey;
  formationCode: string;
  phase: MatchPhase;
  phaseLabel: string;
  playPattern: string;
  headlineCallout: string;
  scoringSide: 'home' | 'away';
  homePlayers: PitchPlayerNode[];
  awayPlayers: PitchPlayerNode[];
  ball: { u: number; v: number; z: number; inNet?: boolean };
  shotTrajectory: ShotTrajectoryArc | null;
  tacticalLinks: TacticalPitchLink[];
  duelRing: PitchDuelRing | null;
  crowdCelebration: {
    level: 'normal' | 'excited' | 'goal_eruption';
    armsUpRatio: number;
    scarfUpRatio: number;
    focusEnd: 'home' | 'away' | 'both';
  };
}

const FORMATION_TEMPLATES: Record<
  TacticalSystemKey,
  {
    formationCode: string;
    home: Array<{ u: number; v: number; role: 'GK' | 'DEF' | 'MID' | 'FWD' }>;
    away: Array<{ u: number; v: number; role: 'GK' | 'DEF' | 'MID' | 'FWD' }>;
  }
> = {
  'Total Football': {
    formationCode: '3-2-4-1 Fluid Overload',
    home: [
      { u: -195, v: 0, role: 'GK' },
      { u: -136, v: -66, role: 'DEF' },
      { u: -146, v: 0, role: 'DEF' },
      { u: -136, v: 66, role: 'DEF' },
      { u: -64, v: -36, role: 'MID' },
      { u: -64, v: 36, role: 'MID' },
      { u: 24, v: -94, role: 'FWD' },
      { u: 34, v: -32, role: 'MID' },
      { u: 34, v: 32, role: 'MID' },
      { u: 24, v: 94, role: 'FWD' },
      { u: 96, v: 0, role: 'FWD' },
    ],
    away: [
      { u: 195, v: 0, role: 'GK' },
      { u: 146, v: -80, role: 'DEF' },
      { u: 156, v: -28, role: 'DEF' },
      { u: 156, v: 28, role: 'DEF' },
      { u: 146, v: 80, role: 'DEF' },
      { u: 84, v: -56, role: 'MID' },
      { u: 92, v: 0, role: 'MID' },
      { u: 84, v: 56, role: 'MID' },
      { u: 12, v: -66, role: 'FWD' },
      { u: -8, v: 0, role: 'FWD' },
      { u: 12, v: 66, role: 'FWD' },
    ],
  },
  Gegenpressing: {
    formationCode: '4-2-3-1 High Press',
    home: [
      { u: -192, v: 0, role: 'GK' },
      { u: -94, v: -92, role: 'DEF' },
      { u: -108, v: -32, role: 'DEF' },
      { u: -108, v: 32, role: 'DEF' },
      { u: -94, v: 92, role: 'DEF' },
      { u: -24, v: -40, role: 'MID' },
      { u: -24, v: 40, role: 'MID' },
      { u: 58, v: -84, role: 'FWD' },
      { u: 68, v: 0, role: 'MID' },
      { u: 58, v: 84, role: 'FWD' },
      { u: 124, v: 8, role: 'FWD' },
    ],
    away: [
      { u: 195, v: 0, role: 'GK' },
      { u: 152, v: -84, role: 'DEF' },
      { u: 162, v: -30, role: 'DEF' },
      { u: 162, v: 30, role: 'DEF' },
      { u: 152, v: 84, role: 'DEF' },
      { u: 104, v: -52, role: 'MID' },
      { u: 112, v: 0, role: 'MID' },
      { u: 104, v: 52, role: 'MID' },
      { u: 38, v: -64, role: 'FWD' },
      { u: 22, v: 0, role: 'FWD' },
      { u: 38, v: 64, role: 'FWD' },
    ],
  },
  'Tiki-Taka': {
    formationCode: '4-3-3 Possession Triangles',
    home: [
      { u: -194, v: 0, role: 'GK' },
      { u: -118, v: -78, role: 'DEF' },
      { u: -132, v: -26, role: 'DEF' },
      { u: -132, v: 26, role: 'DEF' },
      { u: -118, v: 78, role: 'DEF' },
      { u: -48, v: 0, role: 'MID' },
      { u: 4, v: -44, role: 'MID' },
      { u: 4, v: 44, role: 'MID' },
      { u: 62, v: -68, role: 'FWD' },
      { u: 54, v: 0, role: 'FWD' },
      { u: 62, v: 68, role: 'FWD' },
    ],
    away: [
      { u: 195, v: 0, role: 'GK' },
      { u: 140, v: -74, role: 'DEF' },
      { u: 148, v: -24, role: 'DEF' },
      { u: 148, v: 24, role: 'DEF' },
      { u: 140, v: 74, role: 'DEF' },
      { u: 78, v: -48, role: 'MID' },
      { u: 84, v: 0, role: 'MID' },
      { u: 78, v: 48, role: 'MID' },
      { u: 16, v: -56, role: 'FWD' },
      { u: 6, v: 0, role: 'FWD' },
      { u: 16, v: 56, role: 'FWD' },
    ],
  },
  'Direct Counter': {
    formationCode: '4-4-2 Wing Transition',
    home: [
      { u: -195, v: 0, role: 'GK' },
      { u: -154, v: -84, role: 'DEF' },
      { u: -162, v: -28, role: 'DEF' },
      { u: -162, v: 28, role: 'DEF' },
      { u: -154, v: 84, role: 'DEF' },
      { u: -42, v: -104, role: 'MID' },
      { u: -92, v: -30, role: 'MID' },
      { u: -92, v: 30, role: 'MID' },
      { u: -42, v: 104, role: 'MID' },
      { u: 74, v: -38, role: 'FWD' },
      { u: 82, v: 38, role: 'FWD' },
    ],
    away: [
      { u: 195, v: 0, role: 'GK' },
      { u: 118, v: -82, role: 'DEF' },
      { u: 128, v: -26, role: 'DEF' },
      { u: 128, v: 26, role: 'DEF' },
      { u: 118, v: 82, role: 'DEF' },
      { u: 34, v: -62, role: 'MID' },
      { u: 42, v: 0, role: 'MID' },
      { u: 34, v: 62, role: 'MID' },
      { u: -46, v: -66, role: 'FWD' },
      { u: -58, v: 0, role: 'FWD' },
      { u: -46, v: 66, role: 'FWD' },
    ],
  },
  Defensive: {
    formationCode: '5-4-1 Low-Block Fortress',
    home: [
      { u: -196, v: 0, role: 'GK' },
      { u: -162, v: -96, role: 'DEF' },
      { u: -172, v: -48, role: 'DEF' },
      { u: -176, v: 0, role: 'DEF' },
      { u: -172, v: 48, role: 'DEF' },
      { u: -162, v: 96, role: 'DEF' },
      { u: -112, v: -76, role: 'MID' },
      { u: -120, v: -24, role: 'MID' },
      { u: -120, v: 24, role: 'MID' },
      { u: -112, v: 76, role: 'MID' },
      { u: -12, v: 0, role: 'FWD' },
    ],
    away: [
      { u: 195, v: 0, role: 'GK' },
      { u: 96, v: -84, role: 'DEF' },
      { u: 108, v: -28, role: 'DEF' },
      { u: 108, v: 28, role: 'DEF' },
      { u: 96, v: 84, role: 'DEF' },
      { u: -14, v: -64, role: 'MID' },
      { u: -8, v: 0, role: 'MID' },
      { u: -14, v: 64, role: 'MID' },
      { u: -94, v: -58, role: 'FWD' },
      { u: -108, v: 0, role: 'FWD' },
      { u: -94, v: 58, role: 'FWD' },
    ],
  },
};

/**
 * Pure choreography engine computing 11v11 tactical formations, diverse on-pitch play sequences
 * (Rondo triangles, Wing overlaps, Diagonal switches, Through-balls, High-press traps,
 * Corner & Free-kick routines, Driven/Curled shots, and Calm crowd + player celebrations).
 */
export const computeLiveMatchChoreography = (params: {
  tactic?: string;
  phase: MatchPhase;
  tick: number;
  isLive?: boolean;
  outcome?: MatchdayOutcome;
}): LiveMatchChoreography => {
  const tacticKey = normalizeTacticalSystem(params.tactic);
  const tpl = FORMATION_TEMPLATES[tacticKey];
  const t = ((params.tick % 24) + 24) % 24;
  const mdShift = params.outcome?.matchday ? params.outcome.matchday % 3 : 0;
  const subPattern = t % 4;
  const cycleBlock = Math.floor(t / 4) % 6;
  // Smooth continuous sinusoidal team-block progression & lateral ball-side shift
  const angle = (t / 24) * Math.PI * 2;
  const waveU = Math.sin(angle) * 14;
  const waveV = Math.cos(angle) * 10;

  const scoringSide: 'home' | 'away' =
    params.outcome && params.outcome.userGoals === 0 && params.outcome.oppGoals > 0 ? 'away' : 'home';

  const effectivePhase: MatchPhase = params.phase === 'idle' ? 'buildup' : params.phase;

  // Cohesive team-block longitudinal shift so lines move together realistically
  const phaseShift =
    effectivePhase === 'goal'
      ? 28
      : effectivePhase === 'shot'
      ? 22
      : effectivePhase === 'setpiece'
      ? 24
      : effectivePhase === 'counter'
      ? 18
      : waveU;

  const homePlayers: PitchPlayerNode[] = tpl.home.map((p, idx) => {
    if (p.role === 'GK') {
      const gkSwayV = Math.sin(angle + 0.5) * 4;
      const gkStepU = effectivePhase === 'buildup' ? 6 : 2;
      return {
        u: p.u + gkStepU,
        v: p.v + gkSwayV,
        z: 0,
        gk: true,
        role: 'GK',
        pose: effectivePhase === 'goal' && scoringSide === 'home' ? 'arms_up' : 'normal',
      };
    }
    const roleMult = p.role === 'DEF' ? 0.42 : p.role === 'MID' ? 0.72 : 0.95;
    const strideU = Math.sin(angle + idx * 0.65) * 6.5;
    const strideV = Math.cos(angle + idx * 0.85) * 5.2;
    return {
      u: Math.max(-188, Math.min(186, p.u + phaseShift * roleMult + strideU)),
      v: Math.max(-120, Math.min(120, p.v + waveV * 0.45 + strideV)),
      z: 0,
      role: p.role,
      pose: effectivePhase === 'counter' && p.role === 'FWD' ? 'sprinting' : 'normal',
    };
  });

  const awayPlayers: PitchPlayerNode[] = tpl.away.map((p, idx) => {
    if (p.role === 'GK') {
      const gkSwayV = Math.cos(angle) * 4.5;
      return {
        u: p.u - 2,
        v: p.v + gkSwayV,
        z: 0,
        gk: true,
        role: 'GK',
        pose: 'normal',
      };
    }
    const roleMult = p.role === 'DEF' ? 0.38 : p.role === 'MID' ? 0.64 : 0.82;
    const strideU = Math.cos(angle + idx * 0.7) * 5.5;
    const strideV = Math.sin(angle + idx * 0.8) * 4.8;
    return {
      u: Math.max(-186, Math.min(188, p.u + phaseShift * 0.5 * roleMult + strideU)),
      v: Math.max(-120, Math.min(120, p.v + waveV * 0.38 + strideV)),
      z: 0,
      role: p.role,
      pose: 'normal',
    };
  });

  let ball = { u: homePlayers[7].u + 5, v: homePlayers[7].v, z: 1.2, inNet: false };
  let shotTrajectory: ShotTrajectoryArc | null = null;
  const tacticalLinks: TacticalPitchLink[] = [];
  let duelRing: PitchDuelRing | null = null;
  let phaseLabel = 'Tactical Build-Up';
  let playPattern = 'Midfield Rondo';
  let headlineCallout = `${tacticKey} (${tpl.formationCode}) · Fluid positional progression`;

  if (effectivePhase === 'buildup') {
    const buildupMode = (subPattern + (cycleBlock >= 3 ? 4 : 0)) % 8;
    if (buildupMode === 0) {
      playPattern = 'Midfield Rondo';
      phaseLabel = `${tacticKey} · Midfield Rondo`;
      headlineCallout = `${tacticKey} · Central midfield rondo & third-man circulation`;
      const cIdx = 5;
      const tA = 7;
      const tB = 8;
      homePlayers[cIdx].hasSpotlight = true;
      homePlayers[tA].hasSpotlight = true;
      homePlayers[tB].hasSpotlight = true;
      ball = {
        u: homePlayers[cIdx].u * 0.4 + homePlayers[tA].u * 0.6,
        v: homePlayers[cIdx].v * 0.4 + homePlayers[tA].v * 0.6,
        z: 1.2,
        inNet: false,
      };
      tacticalLinks.push(
        { fromU: homePlayers[cIdx].u, fromV: homePlayers[cIdx].v, toU: homePlayers[tA].u, toV: homePlayers[tA].v, kind: 'pass' },
        { fromU: homePlayers[tA].u, fromV: homePlayers[tA].v, toU: homePlayers[tB].u, toV: homePlayers[tB].v, kind: 'pass' }
      );
    } else if (buildupMode === 1) {
      playPattern = 'Wing 1v1 Isolation';
      phaseLabel = 'Wing 1v1 Isolation';
      headlineCallout = `${tacticKey} · Winger isolates the full-back 1v1 down the left touchline`;
      homePlayers[1] = {
        ...homePlayers[1],
        u: Math.min(148, homePlayers[1].u + 24),
        v: Math.max(-116, homePlayers[1].v - 14),
        pose: 'sprinting',
      };
      homePlayers[6] = {
        ...homePlayers[6],
        u: 126,
        v: -98,
        z: 0,
        pose: 'sprinting',
        hasSpotlight: true,
      };
      awayPlayers[1] = {
        ...awayPlayers[1],
        u: 138,
        v: -92,
        z: 0,
        pose: 'sprinting',
        hasSpotlight: true,
      };
      ball = { u: 130, v: -96, z: 1.2, inNet: false };
      duelRing = { u: 132, v: -95, kind: '1v1', label: '1v1 · Wing Duel' };
      tacticalLinks.push(
        { fromU: homePlayers[7].u, fromV: homePlayers[7].v, toU: homePlayers[6].u, toV: homePlayers[6].v, kind: 'pass' },
        { fromU: homePlayers[6].u, fromV: homePlayers[6].v, toU: homePlayers[10].u + 16, toV: homePlayers[10].v - 6, kind: 'run' }
      );
    } else if (buildupMode === 2) {
      playPattern = 'Diagonal Switch';
      phaseLabel = 'Diagonal Switch';
      headlineCallout = `${tacticKey} · Sweeping cross-field switch into the right channel`;
      homePlayers[8] = {
        ...homePlayers[8],
        u: Math.min(165, homePlayers[8].u + 12),
        hasSpotlight: true,
      };
      homePlayers[9] = {
        ...homePlayers[9],
        u: Math.min(172, homePlayers[9].u + 22),
        v: Math.min(116, homePlayers[9].v + 8),
        pose: 'sprinting',
        hasSpotlight: true,
      };
      ball = {
        u: (homePlayers[8].u + homePlayers[9].u) * 0.5,
        v: (homePlayers[8].v + homePlayers[9].v) * 0.5,
        z: 3.4,
        inNet: false,
      };
      tacticalLinks.push(
        { fromU: homePlayers[8].u, fromV: homePlayers[8].v, toU: homePlayers[9].u, toV: homePlayers[9].v, kind: 'pass' },
        { fromU: homePlayers[9].u, fromV: homePlayers[9].v, toU: homePlayers[10].u, toV: homePlayers[10].v, kind: 'run' }
      );
    } else if (buildupMode === 3) {
      playPattern = 'Through-Ball Split';
      phaseLabel = 'Through-Ball Split';
      headlineCallout = `${tacticKey} · Incisive pass splits the centre-backs into the box`;
      homePlayers[8] = {
        ...homePlayers[8],
        u: Math.min(144, homePlayers[8].u + 16),
        hasSpotlight: true,
      };
      homePlayers[10] = {
        ...homePlayers[10],
        u: Math.min(168, homePlayers[10].u + 28),
        pose: 'sprinting',
        hasSpotlight: true,
      };
      ball = {
        u: homePlayers[8].u * 0.35 + homePlayers[10].u * 0.65,
        v: homePlayers[8].v * 0.35 + homePlayers[10].v * 0.65,
        z: 1.2,
        inNet: false,
      };
      tacticalLinks.push(
        { fromU: homePlayers[8].u, fromV: homePlayers[8].v, toU: homePlayers[10].u, toV: homePlayers[10].v, kind: 'pass' }
      );
    } else if (buildupMode === 4) {
      playPattern = '1v1 Breakaway vs Keeper';
      phaseLabel = '1v1 Breakaway';
      headlineCallout = `${tacticKey} · Striker springs the offside trap 1v1 against the goalkeeper!`;
      homePlayers[10] = { ...homePlayers[10], u: 158, v: -8, z: 0, pose: 'sprinting', hasSpotlight: true };
      awayPlayers[0] = { ...awayPlayers[0], u: 179, v: -5, z: 0, gk: true, role: 'GK', pose: 'sprinting', hasSpotlight: true };
      awayPlayers[2] = { ...awayPlayers[2], u: 132, v: -20, z: 0, pose: 'sprinting' };
      awayPlayers[3] = { ...awayPlayers[3], u: 128, v: 18, z: 0, pose: 'sprinting' };
      ball = { u: 164, v: -7, z: 1.2, inNet: false };
      duelRing = { u: 169, v: -6, kind: '1v1', label: '1v1 · Striker vs GK' };
      tacticalLinks.push(
        { fromU: homePlayers[8].u, fromV: homePlayers[8].v, toU: 158, toV: -8, kind: 'pass' },
        { fromU: 158, fromV: -8, toU: 192, toV: -4, kind: 'run' }
      );
    } else if (buildupMode === 5) {
      playPattern = '1v1 Recovery Tackle';
      phaseLabel = '1v1 Recovery Tackle';
      headlineCallout = `Opponent pushes forward — centre-back times a sliding 1v1 tackle!`;
      awayPlayers[9] = { ...awayPlayers[9], u: -112, v: 14, z: 0, pose: 'sprinting', hasSpotlight: true };
      homePlayers[2] = { ...homePlayers[2], u: -120, v: 10, z: 0, pose: 'tackling', hasSpotlight: true };
      homePlayers[0] = { ...homePlayers[0], u: -190, v: 6, z: 0, gk: true, role: 'GK', pose: 'normal' };
      ball = { u: -116, v: 12, z: 1.4, inNet: false };
      duelRing = { u: -116, v: 12, kind: 'tackle', label: '1v1 · Sliding Tackle' };
      tacticalLinks.push(
        { fromU: awayPlayers[6].u, fromV: awayPlayers[6].v, toU: -112, toV: 14, kind: 'pass' },
        { fromU: -120, fromV: 10, toU: -112, toV: 14, kind: 'press' }
      );
    } else if (buildupMode === 6) {
      playPattern = 'Byline Cutback';
      phaseLabel = 'Byline Cutback';
      headlineCallout = `${tacticKey} · Right winger beats the marker & squares a cutback to the penalty spot`;
      homePlayers[9] = { ...homePlayers[9], u: 178, v: 82, z: 0, pose: 'sprinting', hasSpotlight: true };
      awayPlayers[4] = { ...awayPlayers[4], u: 172, v: 92, z: 0, pose: 'tackling' };
      homePlayers[10] = { ...homePlayers[10], u: 162, v: 6, z: 0, pose: 'sprinting', hasSpotlight: true };
      ball = { u: 171, v: 46, z: 1.2, inNet: false };
      duelRing = { u: 175, v: 86, kind: '1v1', label: '1v1 · Byline Beat' };
      tacticalLinks.push(
        { fromU: 178, fromV: 82, toU: 162, toV: 6, kind: 'pass' },
        { fromU: homePlayers[8].u, fromV: homePlayers[8].v, toU: 154, toV: -14, kind: 'run' }
      );
    } else {
      playPattern = 'Midfield 1v1 Dribble';
      phaseLabel = 'Central 1v1 Dribble';
      headlineCallout = `${tacticKey} · Playmaker glides past a press challenge in midfield`;
      homePlayers[8] = { ...homePlayers[8], u: 44, v: 14, z: 0, pose: 'sprinting', hasSpotlight: true };
      awayPlayers[6] = { ...awayPlayers[6], u: 52, v: 18, z: 0, pose: 'tackling', hasSpotlight: true };
      ball = { u: 48, v: 15, z: 1.2, inNet: false };
      duelRing = { u: 48, v: 16, kind: '1v1', label: '1v1 · Midfield Duel' };
      tacticalLinks.push(
        { fromU: 44, fromV: 14, toU: homePlayers[10].u, toV: homePlayers[10].v, kind: 'run' }
      );
    }
  } else if (effectivePhase === 'counter') {
    const counterMode = (subPattern + mdShift) % 4;
    if (counterMode === 0) {
      playPattern = '1v1 Breakaway vs Keeper';
      phaseLabel = '1v1 Breakaway';
      headlineCallout = `${tacticKey} · Lightning counter sends the striker 1v1 with the goalkeeper!`;
      homePlayers[10] = { ...homePlayers[10], u: 156, v: 8, z: 0, pose: 'sprinting', hasSpotlight: true };
      awayPlayers[0] = { ...awayPlayers[0], u: 181, v: 5, z: 0, gk: true, role: 'GK', pose: 'sprinting', hasSpotlight: true };
      awayPlayers[2] = { ...awayPlayers[2], u: 130, v: -12, z: 0, pose: 'sprinting' };
      ball = { u: 163, v: 7, z: 1.2, inNet: false };
      duelRing = { u: 169, v: 6, kind: '1v1', label: '1v1 · Striker vs GK' };
      tacticalLinks.push(
        { fromU: homePlayers[8].u, fromV: homePlayers[8].v, toU: 156, toV: 8, kind: 'pass' },
        { fromU: 156, fromV: 8, toU: 192, toV: 4, kind: 'run' }
      );
    } else if (counterMode === 1) {
      playPattern = 'Wing 1v1 & Cutback';
      phaseLabel = 'Wing 1v1 Counter';
      headlineCallout = `${tacticKey} · Rapid wing 1v1 isolation racing toward the byline`;
      homePlayers[9] = { ...homePlayers[9], u: 168, v: 84, z: 0, pose: 'sprinting', hasSpotlight: true };
      awayPlayers[4] = { ...awayPlayers[4], u: 176, v: 78, z: 0, pose: 'sprinting', hasSpotlight: true };
      homePlayers[10] = { ...homePlayers[10], u: 160, v: 10, z: 0, pose: 'sprinting', hasSpotlight: true };
      ball = { u: 171, v: 80, z: 1.2, inNet: false };
      duelRing = { u: 172, v: 81, kind: '1v1', label: '1v1 · Flank Sprint' };
      tacticalLinks.push(
        { fromU: 168, fromV: 84, toU: 160, toV: 10, kind: 'pass' }
      );
    } else if (counterMode === 2) {
      playPattern = 'Away 1v1 Counter & Tackle';
      phaseLabel = 'Last-Ditch 1v1 Tackle';
      headlineCallout = `Away counter-attack! Defender slides in for a crucial 1v1 recovery challenge`;
      awayPlayers[9] = { ...awayPlayers[9], u: -134, v: -14, z: 0, pose: 'sprinting', hasSpotlight: true };
      homePlayers[2] = { ...homePlayers[2], u: -142, v: -10, z: 0, pose: 'tackling', hasSpotlight: true };
      homePlayers[0] = { ...homePlayers[0], u: -184, v: -8, z: 0, gk: true, role: 'GK', pose: 'sprinting' };
      ball = { u: -138, v: -12, z: 1.5, inNet: false };
      duelRing = { u: -138, v: -12, kind: 'tackle', label: '1v1 · Last-Ditch Tackle' };
      tacticalLinks.push(
        { fromU: awayPlayers[8].u, fromV: awayPlayers[8].v, toU: -134, toV: -14, kind: 'pass' },
        { fromU: -142, fromV: -10, toU: -134, toV: -14, kind: 'press' }
      );
    } else {
      playPattern = 'High-Press Trap';
      phaseLabel = tacticKey === 'Gegenpressing' ? 'Gegenpress Trap' : 'High-Press Turnover';
      headlineCallout = `${tacticKey} · Coordinated press wins possession in the attacking half`;
      homePlayers[10] = { ...homePlayers[10], u: Math.min(172, homePlayers[10].u + 18), pose: 'sprinting', hasSpotlight: true };
      homePlayers[8] = { ...homePlayers[8], u: Math.min(158, homePlayers[8].u + 16), pose: 'sprinting', hasSpotlight: true };
      homePlayers[6] = { ...homePlayers[6], u: Math.min(162, homePlayers[6].u + 16), pose: 'sprinting', hasSpotlight: true };
      ball = { u: homePlayers[8].u + 8, v: homePlayers[8].v - 4, z: 1.2, inNet: false };
      tacticalLinks.push(
        { fromU: homePlayers[6].u, fromV: homePlayers[6].v, toU: homePlayers[8].u + 8, toV: homePlayers[8].v - 4, kind: 'press' },
        { fromU: homePlayers[8].u, fromV: homePlayers[8].v, toU: homePlayers[10].u, toV: homePlayers[10].v, kind: 'pass' }
      );
    }
  } else if (effectivePhase === 'setpiece') {
    const setpieceMode = t % 3;
    if (setpieceMode === 0) {
      playPattern = 'Corner Kick Overload';
      phaseLabel = 'Corner Kick Delivery';
      headlineCallout = `${tacticKey} · Inswinging corner delivery into the crowded 6-yard box`;
      homePlayers[6] = { ...homePlayers[6], u: 198, v: -122, z: 0, hasSpotlight: true };
      homePlayers[10] = { ...homePlayers[10], u: 176, v: -6, z: 1.8, hasSpotlight: true };
      homePlayers[9] = { ...homePlayers[9], u: 170, v: 20, z: 1.2, hasSpotlight: true };
      homePlayers[2] = { ...homePlayers[2], u: 174, v: -20, z: 1.2 };
      ball = { u: 184, v: -42, z: 8, inNet: false };
      shotTrajectory = {
        fromU: 198,
        fromV: -122,
        fromZ: 0.5,
        ctrlU: 192,
        ctrlV: -54,
        ctrlZ: 14,
        toU: 178,
        toV: -4,
        toZ: 5.5,
        speedKmh: 92,
        xg: 0.36,
        isGoal: false,
        label: 'CORNER · 92 km/h',
      };
    } else if (setpieceMode === 1) {
      playPattern = 'Direct Free-Kick & Wall';
      phaseLabel = 'Direct Free-Kick';
      headlineCallout = `${tacticKey} · Curled free-kick whipped over a 3-man defensive wall`;
      homePlayers[8] = { ...homePlayers[8], u: 132, v: -22, z: 0.5, pose: 'shooting', hasSpotlight: true };
      homePlayers[10] = { ...homePlayers[10], u: 164, v: 20, z: 0.5, hasSpotlight: true };
      // 3-man defensive wall lined up between taker and goal
      awayPlayers[5] = { ...awayPlayers[5], u: 158, v: -22, z: 0.4, pose: 'normal' };
      awayPlayers[6] = { ...awayPlayers[6], u: 158, v: -14, z: 0.4, pose: 'normal' };
      awayPlayers[7] = { ...awayPlayers[7], u: 158, v: -6, z: 0.4, pose: 'normal' };
      awayPlayers[0] = { ...awayPlayers[0], u: 195, v: -10, z: 1.5, gk: true, role: 'GK', pose: 'diving' };
      ball = { u: 166, v: -16, z: 7.5, inNet: false };
      shotTrajectory = {
        fromU: 132,
        fromV: -22,
        fromZ: 1.0,
        ctrlU: 164,
        ctrlV: -18,
        ctrlZ: 12,
        toU: 196,
        toV: -12,
        toZ: 5.5,
        speedKmh: 102,
        xg: 0.29,
        isGoal: false,
        label: 'FREE-KICK · 102 km/h',
      };
    } else {
      playPattern = '1v1 Penalty Kick';
      phaseLabel = '1v1 Penalty Showdown';
      headlineCallout = `Penalty awarded! Striker steps up 1v1 from 12 yards against the goalkeeper`;
      // Arrange players outside the penalty arc (u <= 132) while taker stands on the spot (u=162, v=0)
      homePlayers.forEach((hp, idx) => {
        if (idx !== 0 && idx !== 10) {
          hp.u = Math.min(130, Math.max(88, hp.u));
        }
      });
      awayPlayers.forEach((ap, idx) => {
        if (idx !== 0) {
          ap.u = Math.min(132, Math.max(114, ap.u - 24));
        }
      });
      homePlayers[10] = { ...homePlayers[10], u: 160, v: 0, z: 0.4, pose: 'shooting', hasSpotlight: true };
      awayPlayers[0] = { ...awayPlayers[0], u: 196, v: 4, z: 1.2, gk: true, role: 'GK', pose: 'diving', hasSpotlight: true };
      ball = { u: 184, v: -9, z: 3.5, inNet: false };
      duelRing = { u: 178, v: 0, kind: 'penalty', label: '1v1 · Penalty Kick' };
      shotTrajectory = {
        fromU: 160,
        fromV: 0,
        fromZ: 0.8,
        ctrlU: 178,
        ctrlV: -6,
        ctrlZ: 4.5,
        toU: 196,
        toV: -12,
        toZ: 3.8,
        speedKmh: 106,
        xg: 0.78,
        isGoal: false,
        label: 'PENALTY · 106 km/h',
      };
    }
  } else if (effectivePhase === 'shot') {
    const shotMode = (subPattern + mdShift) % 4;
    if (shotMode === 0) {
      playPattern = '1v1 Chip vs Keeper';
      phaseLabel = '1v1 Chip Finish';
      headlineCallout = `${tacticKey} · Clean 1v1 breakaway — dinked chip lofted over the rushing keeper!`;
      homePlayers[10] = { ...homePlayers[10], u: 162, v: -6, z: 0.6, pose: 'shooting', hasSpotlight: true };
      awayPlayers[0] = { ...awayPlayers[0], u: 182, v: -4, z: 1.5, gk: true, role: 'GK', pose: 'diving', hasSpotlight: true };
      ball = { u: 186, v: -2, z: 9.5, inNet: false };
      duelRing = { u: 173, v: -5, kind: '1v1', label: '1v1 · Chip vs GK' };
      shotTrajectory = {
        fromU: 162,
        fromV: -6,
        fromZ: 1.0,
        ctrlU: 180,
        ctrlV: -4,
        ctrlZ: 14.5,
        toU: 196,
        toV: 2,
        toZ: 4.2,
        speedKmh: 76,
        xg: 0.58,
        isGoal: false,
        label: '1v1 CHIP · 76 km/h',
      };
    } else if (shotMode === 1) {
      playPattern = 'Curled Finesse Shot';
      phaseLabel = 'Curled Finesse Shot';
      headlineCallout = `${tacticKey} · Curled strike whipped toward the far top corner`;
      homePlayers[10] = { ...homePlayers[10], u: 142, v: -24, z: 0.5, pose: 'shooting', hasSpotlight: true };
      awayPlayers[0] = { ...awayPlayers[0], u: 195, v: 10, z: 2.0, gk: true, role: 'GK', pose: 'diving' };
      ball = { u: 190, v: 14, z: 5.0, inNet: false };
      shotTrajectory = {
        fromU: 142,
        fromV: -24,
        fromZ: 1.2,
        ctrlU: 170,
        ctrlV: -14,
        ctrlZ: 11,
        toU: 196,
        toV: 14,
        toZ: 5.2,
        speedKmh: 98,
        xg: 0.44,
        isGoal: false,
        label: 'FINESSE · 98 km/h',
      };
    } else if (shotMode === 2) {
      playPattern = 'Driven Strike & Save';
      phaseLabel = 'Driven Shot · GK Save';
      headlineCallout = `${tacticKey} · Ferocious low strike parried at full stretch by the keeper!`;
      homePlayers[10] = { ...homePlayers[10], u: 152, v: 14, z: 0.5, pose: 'shooting', hasSpotlight: true };
      awayPlayers[0] = { ...awayPlayers[0], u: 195, v: -10, z: 2.0, gk: true, role: 'GK', pose: 'diving', hasSpotlight: true };
      ball = { u: 191, v: -13, z: 3.8, inNet: false };
      duelRing = { u: 193, v: -11, kind: 'save', label: 'GK Diving Save' };
      shotTrajectory = {
        fromU: 152,
        fromV: 14,
        fromZ: 1.2,
        ctrlU: 174,
        ctrlV: 1,
        ctrlZ: 7.5,
        toU: 196,
        toV: -13,
        toZ: 4.0,
        speedKmh: 111,
        xg: 0.48,
        isGoal: false,
        label: 'SHOT · 111 km/h',
      };
    } else {
      playPattern = 'Away 1v1 & Home GK Save';
      phaseLabel = '1v1 Home GK Save!';
      headlineCallout = `Opponent breaks 1v1 — your goalkeeper dives full stretch to deny them!`;
      awayPlayers[9] = { ...awayPlayers[9], u: -158, v: 10, z: 0.5, pose: 'shooting', hasSpotlight: true };
      homePlayers[0] = { ...homePlayers[0], u: -188, v: -7, z: 2.0, gk: true, role: 'GK', pose: 'diving', hasSpotlight: true };
      ball = { u: -190, v: -10, z: 4.0, inNet: false };
      duelRing = { u: -188, v: -8, kind: 'save', label: '1v1 · Big GK Save' };
      shotTrajectory = {
        fromU: -158,
        fromV: 10,
        fromZ: 1.1,
        ctrlU: -176,
        ctrlV: 0,
        ctrlZ: 7.5,
        toU: -195,
        toV: -11,
        toZ: 4.2,
        speedKmh: 104,
        xg: 0.51,
        isGoal: false,
        label: 'SAVE · 104 km/h',
      };
    }
  } else if (effectivePhase === 'goal') {
    playPattern = 'Goal Celebration';
    const goalStyle = (t + mdShift) % 3;
    phaseLabel =
      goalStyle === 0
        ? '1v1 Breakaway GOAL!'
        : goalStyle === 1
        ? 'Top-Corner GOAL!'
        : 'Far-Post Header GOAL!';
    if (scoringSide === 'home') {
      headlineCallout =
        goalStyle === 0
          ? `GOAL! Striker rounds the keeper 1v1 and slots it home!`
          : goalStyle === 1
          ? `GOAL! Unstoppable ${tacticKey} curler into the top corner!`
          : `GOAL! Towering far-post header sparks wild celebrations!`;
      ball = { u: 203, v: goalStyle === 1 ? 10 : -8, z: 1.5, inNet: true };
      shotTrajectory = {
        fromU: goalStyle === 0 ? 166 : goalStyle === 1 ? 146 : 176,
        fromV: goalStyle === 0 ? -4 : goalStyle === 1 ? -16 : 22,
        fromZ: goalStyle === 2 ? 4.2 : 1.2,
        ctrlU: goalStyle === 0 ? 186 : 178,
        ctrlV: goalStyle === 1 ? -2 : 2,
        ctrlZ: goalStyle === 2 ? 7.5 : 8.5,
        toU: 203,
        toV: goalStyle === 1 ? 10 : -8,
        toZ: 2.0,
        speedKmh: goalStyle === 2 ? 84 : 110,
        xg: 0.68,
        isGoal: true,
        label: 'GOAL!',
      };
      homePlayers[10] = {
        ...homePlayers[10],
        u: 168,
        v: 46,
        z: 1.0,
        pose: 'arms_up',
        hasSpotlight: true,
        celebratingWithCrowd: true,
      };
      homePlayers[9] = {
        ...homePlayers[9],
        u: 154,
        v: 58,
        z: 1.0,
        pose: 'arms_up',
        hasSpotlight: true,
        celebratingWithCrowd: true,
      };
      homePlayers[8] = {
        ...homePlayers[8],
        u: 146,
        v: 32,
        z: 0.8,
        pose: 'arms_up',
        hasSpotlight: true,
        celebratingWithCrowd: true,
      };
      homePlayers[6] = {
        ...homePlayers[6],
        u: 140,
        v: 18,
        z: 0.8,
        pose: 'arms_up',
        hasSpotlight: true,
        celebratingWithCrowd: true,
      };
      homePlayers[7] = {
        ...homePlayers[7],
        pose: 'arms_up',
      };
    } else {
      headlineCallout = `AWAY GOAL! Clinical counter-attack finds the net!`;
      ball = { u: -203, v: 8, z: 1.5, inNet: true };
      shotTrajectory = {
        fromU: -150,
        fromV: -12,
        fromZ: 1.2,
        ctrlU: -178,
        ctrlV: -2,
        ctrlZ: 8,
        toU: -203,
        toV: 8,
        toZ: 2.0,
        speedKmh: 106,
        xg: 0.52,
        isGoal: true,
        label: 'AWAY GOAL!',
      };
      awayPlayers[9] = { ...awayPlayers[9], u: -164, v: -48, z: 1.0, pose: 'arms_up', hasSpotlight: true, celebratingWithCrowd: true };
      awayPlayers[10] = { ...awayPlayers[10], u: -150, v: -60, z: 1.0, pose: 'arms_up', hasSpotlight: true, celebratingWithCrowd: true };
    }
  }

  const crowdCelebration =
    effectivePhase === 'goal'
      ? {
          level: 'goal_eruption' as const,
          armsUpRatio: 0.72,
          scarfUpRatio: 0.56,
          focusEnd: scoringSide,
        }
      : effectivePhase === 'shot' || effectivePhase === 'setpiece' || duelRing !== null
      ? {
          level: 'excited' as const,
          armsUpRatio: 0.48,
          scarfUpRatio: 0.40,
          focusEnd: 'both' as const,
        }
      : {
          level: 'normal' as const,
          armsUpRatio: 0.28,
          scarfUpRatio: 0.26,
          focusEnd: 'both' as const,
        };

  return {
    tacticKey,
    formationCode: tpl.formationCode,
    phase: effectivePhase,
    phaseLabel,
    playPattern,
    headlineCallout,
    scoringSide,
    homePlayers,
    awayPlayers,
    ball,
    shotTrajectory,
    tacticalLinks,
    duelRing,
    crowdCelebration,
  };
};

const deterministicHash = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
};

/**
 * Computes deterministic, live-updating division standings for any matchday progress step.
 * Delegates to the single unified `standingsEngine` so MD 0, MD 17, and MD 34 match
 * `pendingSeasonState`, `LeagueTableModal`, `seasonStandingsArchive`, and `SeasonFinishModal` 100%.
 */
export const buildLiveStandingsSnapshot = (
  state: GameState,
  clubsDb: Club[],
  playedMatchdays: number,
  latestOutcome?: MatchdayOutcome
): LiveStandingsRow[] => {
  const country = state.club.country || 'GER';
  const tier = state.club.tier || 1;
  const totalMds = state.pendingSeasonState?.totalMatchdays || 34;
  const effectiveMd = Math.max(0, Math.min(totalMds, playedMatchdays));
  const isModActive = Boolean(state.club.logo);

  const peers = resolveDivisionClubs({
    clubsDb: clubsDb || [],
    country,
    tier,
    year: state.year || 2026,
    userClub: state.club,
    excludeUserClub: true,
    isModActive,
    rivalClub: state.currentRival,
  });

  const predictedDeduction = state.pendingSeasonState?._meta?.predictedPointsDeducted ?? 0;

  return buildDeterministicDivisionTable({
    year: state.year || 2026,
    country,
    tier,
    playedMatchdays: effectiveMd,
    totalMatchdays: totalMds,
    userClub: state.club,
    userInTier: true,
    peers,
    pendingSeasonState: state.pendingSeasonState,
    latestOutcome,
    rivalClub: state.currentRival,
    userPointsDeducted: predictedDeduction,
    isModActive,
  });
};

export interface ShotAnalyticsSummary {
  events: ShotEvent[];
  totalShots: number;
  madeShots: number;
  boxPct: number;
  boxCounts: string;
  rangePct: number;
  rangeCounts: string;
  flanksPct: number;
  flanksCounts: string;
}

/**
 * Generates deterministic football pitch shot-location telemetry up to the current matchday.
 * Right attacking half normalized coordinates (x: 42..97, y: 12..88).
 */
export const buildLiveShotEvents = (
  schedule: MatchdayOutcome[],
  upToIdx: number,
  clubOvr: number = 70
): ShotAnalyticsSummary => {
  const safeSlice = (schedule || []).slice(0, Math.max(0, upToIdx + 1));
  const events: ShotEvent[] = [];

  // Pre-season baseline sample when 0 matchdays have been played so scouting telemetry is informative immediately
  if (safeSlice.length === 0) {
    const baselineSample: Array<{ zone: 'box' | 'range' | 'flanks'; x: number; y: number; made: boolean }> = [
      { zone: 'box', x: 88, y: 47, made: true },
      { zone: 'box', x: 84, y: 54, made: true },
      { zone: 'box', x: 89, y: 41, made: true },
      { zone: 'box', x: 83, y: 49, made: false },
      { zone: 'box', x: 86, y: 58, made: true },
      { zone: 'range', x: 70, y: 45, made: false },
      { zone: 'range', x: 67, y: 56, made: true },
      { zone: 'range', x: 73, y: 38, made: false },
      { zone: 'range', x: 64, y: 51, made: false },
      { zone: 'flanks', x: 79, y: 18, made: true },
      { zone: 'flanks', x: 81, y: 81, made: false },
      { zone: 'flanks', x: 76, y: 23, made: false },
    ];
    baselineSample.forEach((s, i) => {
      events.push({
        id: `pre-${i}`,
        matchday: 0,
        zone: s.zone,
        x: s.x,
        y: s.y,
        made: s.made,
        minute: 12 + i * 7,
      });
    });
  } else {
    safeSlice.forEach((m, mdIdx) => {
      const goals = Math.max(0, Math.min(6, Number(m.userGoals) || 0));
      const baseAttempts = goals + 2 + (Math.round(deterministicHash(`att-${m.matchday}-${m.opponentId}`) * 2));
      for (let sIdx = 0; sIdx < baseAttempts; sIdx++) {
        const seed = `shot-${m.matchday}-${m.opponentId}-${sIdx}-${clubOvr}`;
        const rZone = deterministicHash(seed + '-z');
        const rX = deterministicHash(seed + '-x');
        const rY = deterministicHash(seed + '-y');
        const made = sIdx < goals;

        let zone: 'box' | 'range' | 'flanks' = 'box';
        if (rZone > 0.78) zone = 'flanks';
        else if (rZone > 0.54) zone = 'range';

        let x = 86;
        let y = 50;
        if (zone === 'box') {
          x = 80 + rX * 14;
          y = 33 + rY * 34;
        } else if (zone === 'range') {
          x = 58 + rX * 20;
          y = 26 + rY * 48;
        } else {
          x = 72 + rX * 20;
          y = rY > 0.5 ? 11 + (rY - 0.5) * 30 : 88 - rY * 30;
        }

        events.push({
          id: `${m.matchday}-${sIdx}`,
          matchday: m.matchday || mdIdx + 1,
          zone,
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          made,
          minute: Math.min(90, 5 + sIdx * 15 + ((m.matchday * 7) % 13)),
        });
      }
    });
  }

  const calcZone = (z: 'box' | 'range' | 'flanks') => {
    const items = events.filter((e) => e.zone === z);
    const made = items.filter((e) => e.made).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((made / total) * 100) : 0;
    return { pct, label: `${made}/${total}` };
  };

  const box = calcZone('box');
  const range = calcZone('range');
  const flanks = calcZone('flanks');

  return {
    events: events.slice(-48),
    totalShots: events.length,
    madeShots: events.filter((e) => e.made).length,
    boxPct: box.pct,
    boxCounts: box.label,
    rangePct: range.pct,
    rangeCounts: range.label,
    flanksPct: flanks.pct,
    flanksCounts: flanks.label,
  };
};

export interface TacticalHeatmapZone {
  id: string;
  col: number; // 0 (Own Box) -> 5 (Opp Box)
  row: number; // 0 (Left Flank) -> 3 (Right Flank)
  x: number;
  y: number;
  intensity: number; // 0.08..1.0
  zoneType: 'defensive' | 'midfield' | 'attack';
}

export interface TacticalOutcomeSummary {
  tacticKey: string;
  displayName: string;
  styleTag: string;
  summary: string;
  heatTint: string;
  heatGlow: string;
  zones: TacticalHeatmapZone[]; // 6x4 = 24 zones
  attackIndex: number;
  pressIntensity: number;
  controlIndex: number;
  winProb: number;
  drawProb: number;
  lossProb: number;
  expectedGoalDiff: string;
}

const TACTIC_BASE_GRIDS: Record<string, number[][]> = {
  // 4 rows (Left Flank, Left Half-Space/Center, Right Half-Space/Center, Right Flank) x 6 cols (Def Third -> Mid Third -> Final Third)
  Gegenpressing: [
    [0.14, 0.24, 0.56, 0.84, 0.90, 0.72],
    [0.18, 0.32, 0.68, 0.92, 0.96, 0.86],
    [0.18, 0.32, 0.68, 0.90, 0.95, 0.86],
    [0.14, 0.24, 0.54, 0.82, 0.88, 0.70],
  ],
  'Tiki-Taka': [
    [0.24, 0.42, 0.68, 0.68, 0.44, 0.26],
    [0.34, 0.68, 0.94, 0.94, 0.72, 0.46],
    [0.34, 0.68, 0.95, 0.93, 0.72, 0.46],
    [0.24, 0.42, 0.66, 0.66, 0.44, 0.26],
  ],
  'Direct Counter': [
    [0.46, 0.62, 0.58, 0.82, 0.92, 0.78],
    [0.64, 0.72, 0.38, 0.36, 0.54, 0.68],
    [0.64, 0.72, 0.38, 0.36, 0.54, 0.68],
    [0.46, 0.62, 0.58, 0.82, 0.92, 0.78],
  ],
  Defensive: [
    [0.52, 0.48, 0.28, 0.16, 0.10, 0.08],
    [0.74, 0.68, 0.42, 0.22, 0.12, 0.09],
    [0.74, 0.68, 0.42, 0.22, 0.12, 0.09],
    [0.52, 0.48, 0.28, 0.16, 0.10, 0.08],
  ],
  'Total Football': [
    [0.28, 0.46, 0.72, 0.84, 0.86, 0.74],
    [0.36, 0.58, 0.82, 0.88, 0.84, 0.78],
    [0.36, 0.58, 0.82, 0.88, 0.84, 0.78],
    [0.28, 0.46, 0.72, 0.84, 0.86, 0.74],
  ],
};

const normalizeHeatmapTactic = (raw?: string): keyof typeof TACTIC_BASE_GRIDS => {
  const s = (raw || 'Total Football').trim().toLowerCase();
  if (s.includes('gegenpress') || s.includes('press')) return 'Gegenpressing';
  if (s.includes('tiki') || s.includes('possession')) return 'Tiki-Taka';
  if (s.includes('counter') || s.includes('direct') || s.includes('wing')) return 'Direct Counter';
  if (s.includes('defens') || s.includes('catenaccio') || s.includes('bus') || s.includes('low block')) return 'Defensive';
  return 'Total Football';
};

/**
 * Computes a tactic-sensitive, match-fluctuating spatial pitch heatmap & outcome projection.
 * Distinct spatial signatures update both when tactical philosophy changes and as match ticks/results unfold.
 */
export const buildTacticalOutcomeHeatmap = (
  tactic: string = 'Total Football',
  clubOvr: number = 70,
  schedule: MatchdayOutcome[] = [],
  upToIdx: number = -1,
  subTick: number = 0
): TacticalOutcomeSummary => {
  const key = normalizeHeatmapTactic(tactic);
  const grid = TACTIC_BASE_GRIDS[key] || TACTIC_BASE_GRIDS['Total Football'];
  const safeSlice = (schedule || []).slice(0, Math.max(0, upToIdx + 1));

  // Form momentum from live played matches (-0.12 to +0.12 shift)
  const recent = safeSlice.slice(-5);
  const recentPts = recent.reduce((sum, m) => sum + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0);
  const formDelta = recent.length > 0 ? (recentPts / (recent.length * 3) - 0.5) * 0.16 : 0;
  const phaseWave = subTick * 0.45;
  const waveAmp = key === 'Defensive' ? 0.045 : 0.08;

  const zones: TacticalHeatmapZone[] = [];
  let defSum = 0;
  let midSum = 0;
  let attSum = 0;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      const base = grid[r][c];
      const wave =
        Math.sin(phaseWave + c * 0.9 + r * 1.15 + key.length * 0.4) * waveAmp +
        Math.cos(phaseWave * 0.7 - r * 0.8 + c * 0.5) * (waveAmp * 0.45);
      const momentumShift =
        key === 'Defensive'
          ? c <= 1
            ? Math.abs(formDelta) * 0.25
            : -Math.abs(formDelta) * 0.2
          : c >= 3
          ? formDelta
          : -formDelta * 0.35;
      const intensity = Math.max(0.08, Math.min(1, Number((base + wave + momentumShift).toFixed(3))));
      const zoneType = c <= 1 ? 'defensive' : c <= 3 ? 'midfield' : 'attack';
      if (zoneType === 'defensive') defSum += intensity;
      else if (zoneType === 'midfield') midSum += intensity;
      else attSum += intensity;

      zones.push({
        id: `${key}-${r}-${c}`,
        col: c,
        row: r,
        x: 6 + (c + 0.5) * (88 / 6),
        y: 10 + (r + 0.5) * (80 / 4),
        intensity,
        zoneType,
      });
    }
  }

  const ovrEdge = Math.max(-15, Math.min(18, (clubOvr - 68) * 0.7));
  const lastMatch = safeSlice.length > 0 ? safeSlice[safeSlice.length - 1] : undefined;
  const tickJitter = Math.round(Math.sin(phaseWave * 0.85) * 2);

  let baseWin = 42 + Math.round(ovrEdge * 1.1) + Math.round(formDelta * 45) + tickJitter;
  let baseDraw = key === 'Defensive' ? 34 : key === 'Tiki-Taka' ? 27 : 23;
  if (key === 'Gegenpressing') baseWin += 3;
  if (key === 'Total Football') baseWin += 2;
  if (lastMatch?.result === 'W') baseWin += 3;
  if (lastMatch?.result === 'L') baseWin -= 3;

  const winProb = Math.max(18, Math.min(76, baseWin));
  const drawProb = Math.max(14, Math.min(38, baseDraw));
  const lossProb = Math.max(8, 100 - winProb - drawProb);

  const attackBase =
    key === 'Gegenpressing' ? 84 : key === 'Total Football' ? 88 : key === 'Direct Counter' ? 76 : key === 'Tiki-Taka' ? 74 : 38;
  const pressBase =
    key === 'Gegenpressing' ? 93 : key === 'Total Football' ? 79 : key === 'Tiki-Taka' ? 72 : key === 'Direct Counter' ? 56 : 32;
  const controlBase =
    key === 'Tiki-Taka' ? 92 : key === 'Defensive' ? 84 : key === 'Total Football' ? 80 : key === 'Gegenpressing' ? 66 : 62;

  const attackIndex = Math.max(24, Math.min(99, Math.round(attackBase + (attSum / 8 - 0.5) * 14)));
  const pressIntensity = Math.max(22, Math.min(99, Math.round(pressBase + (midSum / 8 - 0.5) * 12)));
  const controlIndex = Math.max(30, Math.min(99, Math.round(controlBase + (defSum / 8 - 0.5) * 12)));

  const rawXgDiff =
    key === 'Gegenpressing'
      ? 0.48
      : key === 'Total Football'
      ? 0.54
      : key === 'Tiki-Taka'
      ? 0.39
      : key === 'Direct Counter'
      ? 0.34
      : 0.16;
  const adjXg = rawXgDiff + formDelta * 1.4 + Math.sin(phaseWave) * 0.06 + ovrEdge * 0.025;
  const expectedGoalDiff = `${adjXg >= 0 ? '+' : ''}${adjXg.toFixed(2)}`;

  const meta: Record<string, { styleTag: string; summary: string; heatTint: string; heatGlow: string }> = {
    Gegenpressing: {
      styleTag: 'High-Press Counter-Traps',
      summary: '6-second counter-pressing traps swarm the high half-spaces & final third.',
      heatTint: '#EF4444',
      heatGlow: '#F97316',
    },
    'Tiki-Taka': {
      styleTag: 'Positional Rest-Defense',
      summary: 'Tight central diamond triangles overload Zone 14 & control tempo.',
      heatTint: '#0EA5E9',
      heatGlow: '#10B981',
    },
    'Direct Counter': {
      styleTag: 'Vertical Touchline Breaks',
      summary: 'Compact midfield block springs rapid vertical transitions down both flanks.',
      heatTint: '#06B6D4',
      heatGlow: '#F59E0B',
    },
    Defensive: {
      styleTag: 'Relaxed Low-Block Shell',
      summary: 'Calm, disciplined low block relaxes high-press intensity & shields the penalty box.',
      heatTint: '#38BDF8',
      heatGlow: '#10B981',
    },
    'Total Football': {
      styleTag: 'Fluid Positional Rotations',
      summary: 'Synchronized full-pitch rotations create balanced overloads across all 5 lanes.',
      heatTint: '#F97316',
      heatGlow: '#FACC15',
    },
  };

  const info = meta[key];
  return {
    tacticKey: key,
    displayName: tactic || key,
    styleTag: info.styleTag,
    summary: info.summary,
    heatTint: info.heatTint,
    heatGlow: info.heatGlow,
    zones,
    attackIndex,
    pressIntensity,
    controlIndex,
    winProb,
    drawProb,
    lossProb,
    expectedGoalDiff,
  };
};

export interface NamingRightsOffer {
  id: string;
  partnerName: string;
  stadiumDisplayName: string;
  tagline: string;
  tier: 'regional' | 'national' | 'global';
  signingBonusK: number;
  annualPayoutK: number;
  totalYears: number;
  repRequired: number;
  accentColor: string;
}

export const getNamingRightsOffers = (
  club: Club,
  reputation: number = 50,
  stadiumCap: number = 15000
): NamingRightsOffer[] => {
  const tier = club.tier || 3;
  const country = club.country || 'GER';
  const baseAnnual = Math.max(
    45,
    Math.round(getLeagueScaledVal(tier, 520, country) * Math.max(0.75, Math.min(2.2, stadiumCap / 25000)))
  );
  const cMult = getCountryMult(country);
  const globalBonusMult = Math.max(0.9, Math.min(1.4, cMult));
  const rawCity = (club.name || 'Club')
    .replace(/^(1\.\s*FC|F\.C\.|C\.F\.|S\.C\.|S\.D\.|A\.C\.|A\.S\.|FC|CF|CD|UD|SC|SD|SV|VfB|VfL|TSG|RB|Borussia|Eintracht|Real|Sporting|Club|AC|AS)\s+/i, '')
    .replace(/^(Os|De|La|El|Le|Les|Los|Las)\s+/i, '')
    .trim();
  const cityToken = (rawCity.split(/\s+/)[0] || 'City').replace(/[,.;:]+$/, '');

  return [
    // Regional Partners (5)
    {
      id: 'regional_sparkasse',
      partnerName: `${cityToken} Spark Energy`,
      stadiumDisplayName: `${cityToken} Spark Park`,
      tagline: 'Regional Civic & Clean Utilities Partner',
      tier: 'regional',
      signingBonusK: Math.round(baseAnnual * 0.45),
      annualPayoutK: baseAnnual,
      totalYears: 4,
      repRequired: 0,
      accentColor: '#0EA5E9',
    },
    {
      id: 'regional_metro_credit',
      partnerName: `${cityToken} Metro Credit Union`,
      stadiumDisplayName: `${cityToken} Metro Field`,
      tagline: 'Local Cooperative Banking & Community Trust',
      tier: 'regional',
      signingBonusK: Math.round(baseAnnual * 0.55),
      annualPayoutK: Math.round(baseAnnual * 1.08),
      totalYears: 3,
      repRequired: 12,
      accentColor: '#0284C7',
    },
    {
      id: 'regional_crown_hops',
      partnerName: 'Crown & Hops Brewing Co.',
      stadiumDisplayName: 'Crown & Hops Ground',
      tagline: 'Heritage Matchday Hospitality & Craft Brewery',
      tier: 'regional',
      signingBonusK: Math.round(baseAnnual * 0.5),
      annualPayoutK: Math.round(baseAnnual * 1.14),
      totalYears: 4,
      repRequired: 18,
      accentColor: '#D97706',
    },
    {
      id: 'regional_fibernet',
      partnerName: `${cityToken} FiberNet`,
      stadiumDisplayName: `${cityToken} FiberNet Arena`,
      tagline: 'High-Speed Broadband & Municipal Digital Grid',
      tier: 'regional',
      signingBonusK: Math.round(baseAnnual * 0.42),
      annualPayoutK: Math.round(baseAnnual * 1.18),
      totalYears: 5,
      repRequired: 22,
      accentColor: '#2563EB',
    },
    {
      id: 'regional_harborline',
      partnerName: 'Harborline Motors',
      stadiumDisplayName: 'Harborline Pavilion',
      tagline: 'Regional EV Dealership & Mobility Network',
      tier: 'regional',
      signingBonusK: Math.round(baseAnnual * 0.62),
      annualPayoutK: Math.round(baseAnnual * 1.24),
      totalYears: 4,
      repRequired: 26,
      accentColor: '#0F766E',
    },

    // National Partners (5)
    {
      id: 'national_bancorp',
      partnerName: 'Nordstern Financial Group',
      stadiumDisplayName: 'Nordstern Arena',
      tagline: 'National Retail Banking & Commercial Alliance',
      tier: 'national',
      signingBonusK: Math.round(baseAnnual * 0.8),
      annualPayoutK: Math.round(baseAnnual * 1.45),
      totalYears: 5,
      repRequired: tier <= 2 ? 36 : 25,
      accentColor: '#10B981',
    },
    {
      id: 'national_veridian',
      partnerName: 'Veridian Telecom',
      stadiumDisplayName: 'Veridian Park',
      tagline: 'Nationwide 5G Connectivity & Smart-Stadium Partner',
      tier: 'national',
      signingBonusK: Math.round(baseAnnual * 0.85),
      annualPayoutK: Math.round(baseAnnual * 1.54),
      totalYears: 5,
      repRequired: tier <= 2 ? 42 : 32,
      accentColor: '#059669',
    },
    {
      id: 'national_ironbridge',
      partnerName: 'Ironbridge Assurance',
      stadiumDisplayName: 'Ironbridge Stadium',
      tagline: 'National Insurance & Institutional Wealth Sponsor',
      tier: 'national',
      signingBonusK: Math.round(baseAnnual * 0.9),
      annualPayoutK: Math.round(baseAnnual * 1.62),
      totalYears: 6,
      repRequired: tier <= 2 ? 48 : 38,
      accentColor: '#4F46E5',
    },
    {
      id: 'national_meridian',
      partnerName: 'Meridian Rail & Freight',
      stadiumDisplayName: 'Meridian Bowl',
      tagline: 'Intercity Express Logistics & Matchday Transit Partner',
      tier: 'national',
      signingBonusK: Math.round(baseAnnual * 0.96),
      annualPayoutK: Math.round(baseAnnual * 1.7),
      totalYears: 5,
      repRequired: tier <= 2 ? 52 : 44,
      accentColor: '#7C3AED',
    },
    {
      id: 'national_kinetix',
      partnerName: 'Kinetix Athletic Labs',
      stadiumDisplayName: 'Kinetix Performance Center',
      tagline: 'National Performance Apparel & Sports Science Group',
      tier: 'national',
      signingBonusK: Math.round(baseAnnual * 1.05),
      annualPayoutK: Math.round(baseAnnual * 1.78),
      totalYears: 4,
      repRequired: tier <= 2 ? 56 : 48,
      accentColor: '#E11D48',
    },

    // Global Flagship Partners (5)
    {
      id: 'global_aerotech',
      partnerName: 'Apex Global Aviation',
      stadiumDisplayName: 'Apex AirDome',
      tagline: 'Flagship Continental Naming Rights & Lounge Package',
      tier: 'global',
      signingBonusK: Math.round(baseAnnual * 1.35 * globalBonusMult),
      annualPayoutK: Math.round(baseAnnual * 2.15),
      totalYears: 6,
      repRequired: tier === 1 ? Math.min(72, Math.max(55, reputation)) : 65,
      accentColor: '#18191F',
    },
    {
      id: 'global_solstice',
      partnerName: 'Solstice Silicon',
      stadiumDisplayName: 'Solstice Coliseum',
      tagline: 'Global Semiconductor & Broadcast Computing Leader',
      tier: 'global',
      signingBonusK: Math.round(baseAnnual * 1.45 * globalBonusMult),
      annualPayoutK: Math.round(baseAnnual * 2.28),
      totalYears: 6,
      repRequired: tier === 1 ? 66 : 72,
      accentColor: '#0F172A',
    },
    {
      id: 'global_aurelia',
      partnerName: 'Aurelia Airways',
      stadiumDisplayName: 'Aurelia Sky Dome',
      tagline: 'Intercontinental Luxury Carrier & VIP Concourse Partner',
      tier: 'global',
      signingBonusK: Math.round(baseAnnual * 1.6 * globalBonusMult),
      annualPayoutK: Math.round(baseAnnual * 2.42),
      totalYears: 7,
      repRequired: tier === 1 ? 74 : 78,
      accentColor: '#B45309',
    },
    {
      id: 'global_valkyrie',
      partnerName: 'Valkyrie EV Motors',
      stadiumDisplayName: 'Valkyrie Arena',
      tagline: 'Worldwide Electric Performance Automotive Flagship',
      tier: 'global',
      signingBonusK: Math.round(baseAnnual * 1.72 * globalBonusMult),
      annualPayoutK: Math.round(baseAnnual * 2.55),
      totalYears: 6,
      repRequired: tier === 1 ? 80 : 84,
      accentColor: '#991B1B',
    },
    {
      id: 'global_helios',
      partnerName: 'Helios Quantum Energy',
      stadiumDisplayName: 'Helios Grand Stadium',
      tagline: 'Global Clean-Grid Conglomerate & Landmark Title Deal',
      tier: 'global',
      signingBonusK: Math.round(baseAnnual * 1.95 * globalBonusMult),
      annualPayoutK: Math.round(baseAnnual * 2.75),
      totalYears: 8,
      repRequired: tier === 1 ? 86 : 90,
      accentColor: '#1E1B4B',
    },
  ];
};

export interface SupercupEligibility {
  eligible: boolean;
  cupName: string;
  opponent: Club;
  prizeK: number;
}

const SUPERCUP_NAMES: Record<string, string> = {
  GER: 'DFL-Supercup',
  ENG: 'FA Community Shield',
  ESP: 'Supercopa de España',
  ITA: 'Supercoppa Italiana',
  FRA: 'Trophée des Champions',
  POR: 'Supertaça Cândido de Oliveira',
  NED: 'Johan Cruyff Shield',
  TUR: 'TFF Süper Kupa',
  SCO: 'Scottish Charity Shield',
  BRA: 'Supercopa do Brasil',
  ARG: 'Supercopa Argentina',
};

export const checkSupercupEligibility = (
  state: GameState,
  clubsDb: Club[]
): SupercupEligibility | null => {
  if (!state || !state.club || state.seasonPhase === 'mid') return null;
  if (state.supercupPlayedYear === state.year) return null;
  const lastHist = state.history && state.history.length > 0 ? state.history[state.history.length - 1] : null;
  if (!lastHist) return null;

  const wonQualifyingTrophy = Boolean(
    lastHist.trophiesThisYear?.bl ||
      lastHist.trophiesThisYear?.dfb ||
      (state.club.tier === 1 && lastHist.pos === 1)
  );
  if (!wonQualifyingTrophy) return null;

  const country = state.club.country || 'GER';
  const isRes = Boolean(state.club.isReserve) || isReserveClub(state.club.name);
  if (isRes) return null;

  const divPeers = (clubsDb || [])
    .filter((c) => (c.country || 'GER') === country && c.tier === 1 && c.id !== state.club.id)
    .sort((a, b) => (b.baseOvr || 70) - (a.baseOvr || 70));

  const opponent: Club = divPeers[0] || {
    id: 99990,
    name: `${country} Cup Runners-Up`,
    tier: 1,
    baseOvr: Math.max(70, state.club.baseOvr - 2),
    color: '#334155',
    stadium: 45000,
    country,
  };

  const cupName = SUPERCUP_NAMES[country] || `${country} Supercup`;
  const prizeK = getLeagueScaledVal(1, 2500, country);

  return {
    eligible: true,
    cupName,
    opponent,
    prizeK,
  };
};

export const resolveSupercupMatch = (
  state: GameState,
  eligibility: SupercupEligibility,
  stance: 'high_press' | 'balanced' | 'counter'
): SupercupResult => {
  const stanceBonus = stance === 'high_press' ? 1.5 : stance === 'counter' ? 0.8 : 1.0;
  const userEff = (state.club.baseOvr || 75) + ((state.club.morale || 80) - 75) * 0.08 + stanceBonus;
  const oppEff = eligibility.opponent.baseOvr || 75;
  const diff = userEff - oppEff;

  const h1 = deterministicHash(`sc-${state.year}-${state.club.id}-${stance}-u`);
  const h2 = deterministicHash(`sc-${state.year}-${state.club.id}-${stance}-o`);

  let ourScore = Math.max(0, Math.min(5, Math.round(1.35 + diff * 0.08 + h1 * 1.9)));
  let oppScore = Math.max(0, Math.min(4, Math.round(1.15 - diff * 0.06 + h2 * 1.7)));

  let won = ourScore > oppScore;
  let decidedOnPens = false;
  let ourPenScore: number | undefined;
  let oppPenScore: number | undefined;

  if (ourScore === oppScore) {
    decidedOnPens = true;
    const penRoll = deterministicHash(`sc-pen-${state.year}-${state.club.id}-${stance}`);
    won = penRoll + diff * 0.02 >= 0.45;
    ourPenScore = won ? 5 : 3;
    oppPenScore = won ? 4 : 4;
  }

  return {
    year: state.year,
    cupName: eligibility.cupName,
    opponentName: eligibility.opponent.name,
    opponentId: eligibility.opponent.id,
    opponentColor: eligibility.opponent.color,
    opponentLogo: eligibility.opponent.logo,
    opponentOvr: eligibility.opponent.baseOvr || 75,
    ourScore,
    oppScore,
    won,
    prizeK: won ? eligibility.prizeK : Math.round(eligibility.prizeK * 0.35),
    decidedOnPens,
    ourPenScore,
    oppPenScore,
  };
};

export interface DashboardNotification {
  id: string;
  title: string;
  detail: string;
  tone: 'amber' | 'rose' | 'emerald' | 'sky';
  actionTab?: 'overview' | 'commercial' | 'squad' | 'infrastructure' | 'board';
  actionId?: 'media_heat' | 'ledger' | 'naming_rights' | 'youth_academy' | 'coach_market';
}

export const buildActiveNotifications = (
  state: GameState,
  financials: { net: number; wages: number; estRevenue: number }
): DashboardNotification[] => {
  const list: DashboardNotification[] = [];
  if (!state.currentCoach) {
    list.push({
      id: 'coach_vacant',
      title: 'Head Coach Vacant (-4 OVR)',
      detail: 'Interim caretaker staff is active. Appoint a head coach to restore full squad OVR.',
      tone: 'amber',
      actionTab: 'squad',
      actionId: 'coach_market',
    });
  }
  const pScore = state.mediaPressure ?? 15;
  if (pScore >= 60) {
    list.push({
      id: 'media_heat',
      title: `Media Heat Rising (${pScore}/100)`,
      detail: 'Press scrutiny is intensifying around tactical choices & standings.',
      tone: 'rose',
      actionTab: 'board',
      actionId: 'media_heat',
    });
  }
  if (state.budget < 0) {
    list.push({
      id: 'budget_deficit',
      title: 'Treasury Operating in Deficit',
      detail: 'Secure sponsor deals, naming rights, or sell surplus squad players.',
      tone: 'rose',
      actionTab: 'commercial',
      actionId: 'ledger',
    });
  }
  if (financials.net < 0 && state.budget >= 0) {
    list.push({
      id: 'proj_loss',
      title: 'Projected Season Deficit',
      detail: 'Annual expenses currently outpace projected commercial & ticket income.',
      tone: 'amber',
      actionTab: 'commercial',
      actionId: 'ledger',
    });
  }
  if ((state.sponsorsPitchedThisSeason || 0) < 3) {
    list.push({
      id: 'sponsor_slots',
      title: `${3 - (state.sponsorsPitchedThisSeason || 0)} Sponsor Pitches Remaining`,
      detail: 'Visit the Commercial desk to pitch upfront and bonus deals.',
      tone: 'sky',
      actionTab: 'commercial',
    });
  }
  if (!state.stadiumNamingRights && !isReserveClub(state.club.name)) {
    list.push({
      id: 'naming_rights',
      title: 'Stadium Naming Rights Available',
      detail: 'Monetize your ground with a multi-year corporate naming partner.',
      tone: 'emerald',
      actionTab: 'commercial',
      actionId: 'naming_rights',
    });
  }
  const readyYouth = (state.youthPipeline || []).filter((y) => y.timer <= 0 && y.status !== 'loaned').length;
  if (readyYouth > 0) {
    list.push({
      id: 'youth_ready',
      title: `${readyYouth} Academy Prospect${readyYouth > 1 ? 's' : ''} Ready`,
      detail: 'Graduates are ready for first-team call-up in Squad & Youth.',
      tone: 'emerald',
      actionTab: 'squad',
      actionId: 'youth_academy',
    });
  }
  return list;
};

