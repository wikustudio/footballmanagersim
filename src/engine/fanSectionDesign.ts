import { Club, StadiumPolicy } from '../types';
import { ClubCampusPalette } from './liveSimVisualEngine';

export type FanTifoPattern =
  | 'checkered_wall'
  | 'club_stripes'
  | 'sunburst_rays'
  | 'chevron_wave'
  | 'giant_jersey';

export type TwoPoleMotif = 'stripes' | 'star' | 'chevron' | 'jersey12' | 'checker';

export type RailBannerStyle = 'solid' | 'striped' | 'chevron' | 'bordered';

export interface ClubBannerTheme {
  primary: string;
  secondary: string;
  bannerFill: string;
  bannerStroke: string;
  bannerText: string;
  altBannerFill: string;
  altBannerStroke: string;
  altBannerText: string;
  spectatorTertiary: string;
  smokePrimary: string;
  smokeSecondary: string;
}

export interface RailMiniBanner {
  id: string;
  label: string;
  vFrac: number; // -0.78..0.78 along the stand span
  style: RailBannerStyle;
  inverted: boolean;
}

export interface TwoPoleBannerSpec {
  id: string;
  uRatio: number; // 0.25..0.78 depth into Home End stand
  vFrac: number; // -0.72..0.72 across Home End span
  motif: TwoPoleMotif;
  inverted: boolean;
}

export type FanVibrancyLevel = 'high' | 'medium' | 'low';

export interface CreativeFanSectionConfig {
  creativeFanSectionsEnabled: boolean;
  vibrancyLevel: FanVibrancyLevel;
  tifoPattern: FanTifoPattern;
  curvaBannerTitle: string;
  railMiniBanners: RailMiniBanner[];
  topStandMiniBanners: RailMiniBanner[];
  twoPoleBanners: TwoPoleBannerSpec[];
  hasCapoDrums: boolean;
  hasPennantGarland: boolean;
  hasTickerConfetti: boolean;
  tifoOpacity: number;
  flagCount: number;
}

function parseHexRgb(hex: string): [number, number, number] {
  const clean = (hex || '#1D4ED8').replace('#', '').trim();
  const full =
    clean.length === 3
      ? `${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`
      : clean.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [
    Number.isFinite(r) ? r : 29,
    Number.isFinite(g) ? g : 78,
    Number.isFinite(b) ? b : 216,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function getLuma(hex: string): number {
  const [r, g, b] = parseHexRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function mixHex(baseHex: string, targetHex: string, weight: number): string {
  const [r1, g1, b1] = parseHexRgb(baseHex);
  const [r2, g2, b2] = parseHexRgb(targetHex);
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex(
    r1 + (r2 - r1) * w,
    g1 + (g2 - g1) * w,
    b1 + (b2 - b1) * w
  );
}

/**
 * Derives an immutable stadium banner & fan-section color theme strictly from the club's own colors.
 * Never changes when Fan Strategy / stadiumPolicy or matchday opponent changes.
 */
export function resolveClubBannerTheme(palette: ClubCampusPalette): ClubBannerTheme {
  const primary = palette.primary || '#1D4ED8';
  const secondary = palette.secondary || '#FFFFFF';
  const primaryLuma = getLuma(primary);
  const secondaryLuma = getLuma(secondary);

  const bannerText = primaryLuma >= 165 ? '#18191F' : '#FFFFFF';
  const altBannerText = secondaryLuma >= 165 ? '#18191F' : '#FFFFFF';

  // Tonal club-color third shade for spectator variety (strictly tinted from club primary, never off-brand orange/blue)
  const spectatorTertiary =
    primaryLuma >= 180
      ? mixHex(primary, '#0F172A', 0.24)
      : mixHex(primary, '#FFFFFF', 0.28);

  return {
    primary,
    secondary,
    bannerFill: primary,
    bannerStroke: secondary,
    bannerText,
    altBannerFill: secondary,
    altBannerStroke: primary,
    altBannerText,
    spectatorTertiary,
    smokePrimary: primary,
    smokeSecondary: secondary,
  };
}

function hashClubSeed(club?: Partial<Club> | null): number {
  const raw = `${club?.id ?? 0}:${(club?.name || 'CLUB').toLowerCase().trim()}`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function getShortClubWord(clubName?: string): string {
  const cleaned = (clubName || 'CLUB')
    .replace(/^(FC|1\.\s*FC|SC|SV|VfB|VfL|TSG|RB|CF|CD|AS|AC|SS|US|UD|CA|SE|CR|RC|Olympique|Borussia|Eintracht|Sporting|Atlético|Atletico|Real|Bavaria)\s+/i, '')
    .replace(/\s+(FC|SC|CF|SV|1848|1899|1904|1909|1910|96|04|05|II|B)$/i, '')
    .trim();
  const firstWord = (cleaned || clubName || 'CLUB').split(/\s+/)[0] || 'CLUB';
  return firstWord.toUpperCase().slice(0, 10);
}

function getClubInitials(clubName?: string): string {
  const words = (clubName || 'FC')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'FC';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const TIFO_PATTERNS: FanTifoPattern[] = [
  'checkered_wall',
  'club_stripes',
  'sunburst_rays',
  'chevron_wave',
  'giant_jersey',
];

const BALANCED_SLOGANS = [
  (s: string) => `${s} FAITHFUL`,
  (s: string) => `12TH MAN · ${s}`,
  (s: string) => `LOUD & PROUD`,
  (s: string) => `OUR HOUSE · ${s}`,
  (s: string) => `SING FOR ${s}`,
];

const FAMILY_SLOGANS = [
  (s: string) => `FUTURE LEGENDS`,
  (s: string) => `NEXT GEN ${s}`,
  (s: string) => `MINI ULTRAS ZONE`,
  (s: string) => `${s} FOR ALL`,
];

const COMMERCIAL_SLOGANS = [
  () => 'NO TO CORPORATE PRICES',
  () => 'FANS NOT CUSTOMERS',
  () => 'OUR CLUB · OUR VOICE',
];

/**
 * Builds deterministic, creative, fun fan-section visuals (tifo mosaics, terrace banners,
 * hanging rail mini-banners, two-pole Doppelhalter banners, capo drums, bunting garlands)
 * tailored to the club & fan strategy while remaining 100% locked to the club's colors.
 */
export function buildCreativeFanSectionConfig(
  club: Partial<Club> | null | undefined,
  stadiumPolicy: StadiumPolicy | string = 'balanced',
  isReserve = false
): CreativeFanSectionConfig {
  const normalizedPolicy: StadiumPolicy =
    stadiumPolicy === 'ultras' ||
    stadiumPolicy === 'family' ||
    stadiumPolicy === 'commercial' ||
    stadiumPolicy === 'balanced'
      ? stadiumPolicy
      : 'balanced';
  const creativeFanSectionsEnabled =
    normalizedPolicy === 'balanced' || normalizedPolicy === 'ultras';
  const vibrancyLevel: FanVibrancyLevel =
    normalizedPolicy === 'ultras'
      ? 'high'
      : normalizedPolicy === 'balanced'
      ? 'medium'
      : 'low';

  const seed = hashClubSeed(club);
  const shortClub = getShortClubWord(club?.name);
  const initials = getClubInitials(club?.name);

  const tifoPattern = TIFO_PATTERNS[seed % TIFO_PATTERNS.length];

  let curvaBannerTitle: string;
  if (isReserve) {
    curvaBannerTitle = `${shortClub} ACADEMY`;
  } else if (normalizedPolicy === 'ultras') {
    curvaBannerTitle = 'FORTRESS CURVA';
  } else if (normalizedPolicy === 'balanced') {
    curvaBannerTitle = BALANCED_SLOGANS[seed % BALANCED_SLOGANS.length](shortClub);
  } else if (normalizedPolicy === 'family') {
    curvaBannerTitle = FAMILY_SLOGANS[seed % FAMILY_SLOGANS.length](shortClub);
  } else {
    curvaBannerTitle = COMMERCIAL_SLOGANS[seed % COMMERCIAL_SLOGANS.length]();
  }

  const railLabelsByPolicy: Record<StadiumPolicy, [string, string, string, string]> = {
    ultras: ['CURVA', '12TH', initials, 'NOISE'],
    balanced: ['PRIDE', '12TH', initials, 'LOUD'],
    family: ['KIDS', '12TH', initials, 'FUN'],
    commercial: ['LOYAL', '12TH', initials, 'FANS'],
  };
  const railLabels = railLabelsByPolicy[normalizedPolicy];
  const railStyles: RailBannerStyle[] = ['striped', 'solid', 'chevron', 'bordered'];

  const railMiniBanners: RailMiniBanner[] = creativeFanSectionsEnabled
    ? [
        { id: 'rail-0', label: railLabels[0], vFrac: -0.68, style: railStyles[(seed + 0) % 4], inverted: false },
        { id: 'rail-1', label: railLabels[1], vFrac: -0.24, style: railStyles[(seed + 1) % 4], inverted: true },
        { id: 'rail-2', label: railLabels[2], vFrac: 0.24, style: railStyles[(seed + 2) % 4], inverted: false },
        { id: 'rail-3', label: railLabels[3], vFrac: 0.68, style: railStyles[(seed + 3) % 4], inverted: true },
      ]
    : [];

  const topStandMiniBanners: RailMiniBanner[] = creativeFanSectionsEnabled
    ? [
        { id: 'top-rail-0', label: initials, vFrac: -0.62, style: 'striped', inverted: false },
        { id: 'top-rail-1', label: '12TH MAN', vFrac: -0.22, style: 'solid', inverted: true },
        { id: 'top-rail-2', label: shortClub.slice(0, 8), vFrac: 0.22, style: 'chevron', inverted: false },
        { id: 'top-rail-3', label: 'EST.', vFrac: 0.62, style: 'bordered', inverted: true },
      ]
    : [];

  const motifs: TwoPoleMotif[] = ['stripes', 'star', 'chevron', 'jersey12', 'checker'];
  const allTwoPoles: TwoPoleBannerSpec[] = [
    { id: 'dp-0', uRatio: 0.34, vFrac: -0.58, motif: motifs[(seed + 0) % motifs.length], inverted: false },
    { id: 'dp-1', uRatio: 0.52, vFrac: -0.22, motif: motifs[(seed + 1) % motifs.length], inverted: true },
    { id: 'dp-2', uRatio: 0.44, vFrac: 0.22, motif: motifs[(seed + 2) % motifs.length], inverted: false },
    { id: 'dp-3', uRatio: 0.36, vFrac: 0.58, motif: motifs[(seed + 3) % motifs.length], inverted: true },
    { id: 'dp-4', uRatio: 0.66, vFrac: 0.0, motif: 'jersey12', inverted: false },
  ];

  const twoPoleCount =
    normalizedPolicy === 'ultras' ? 5 : normalizedPolicy === 'balanced' ? 4 : 0;

  return {
    creativeFanSectionsEnabled,
    vibrancyLevel,
    tifoPattern,
    curvaBannerTitle,
    railMiniBanners,
    topStandMiniBanners,
    twoPoleBanners: creativeFanSectionsEnabled ? allTwoPoles.slice(0, twoPoleCount) : [],
    hasCapoDrums: creativeFanSectionsEnabled,
    hasPennantGarland: normalizedPolicy === 'balanced',
    hasTickerConfetti: normalizedPolicy === 'ultras',
    tifoOpacity:
      normalizedPolicy === 'ultras'
        ? 0.44
        : normalizedPolicy === 'balanced'
        ? 0.34
        : 0,
    flagCount:
      normalizedPolicy === 'ultras'
        ? 5
        : normalizedPolicy === 'balanced'
        ? 4
        : normalizedPolicy === 'family'
        ? 1
        : 0,
  };
}
