import { StadiumPolicy } from '../types';

export interface Pt2 {
  x: number;
  y: number;
}

export interface HqScaleSpec {
  level: number;
  title: string;
  centralFloors: number;
  centralHeight: number;
  centralHalfU: number;
  centralVRange: [number, number];
  hasEastWing: boolean;
  eastFloors: number;
  eastHeight: number;
  hasWestWing: boolean;
  westFloors: number;
  westHeight: number;
  hasPenthouse: boolean;
  hasSkyCrown: boolean;
  hasTicker: boolean;
  hasReflectionPool: boolean;
  flagCount: number;
  treeCount: number;
  visitorCount: number;
}

export const COMMERCIAL_LEVEL_TITLES: Record<number, string> = {
  1: 'Club Shop & Regional Office',
  2: 'Commercial House & Megastore',
  3: 'Corporate Plaza & Media Hub',
  4: 'Continental Campus & Global HQ',
  5: 'Flagship Twin-Wing World HQ',
};

/**
 * Scales the Commercial HQ level (1..5) directly from Academy & Medical Center levels (1..5).
 * Upgrading either facility from L1 to L5 visibly expands the 3D campus wings and height.
 */
export function computeCommercialLevelFromFacilities(
  academyLevel = 1,
  medicalLevel = 1
): number {
  const acad = Math.max(1, Math.min(5, Math.round(academyLevel || 1)));
  const med = Math.max(1, Math.min(5, Math.round(medicalLevel || 1)));
  return Math.max(1, Math.min(5, Math.round((acad + med) / 2)));
}

export function getHqScaleSpec(levelInput: number): HqScaleSpec {
  const level = Math.max(1, Math.min(5, Math.round(levelInput || 1)));
  switch (level) {
    case 1:
      return {
        level: 1,
        title: COMMERCIAL_LEVEL_TITLES[1],
        centralFloors: 2,
        centralHeight: 34,
        centralHalfU: 44,
        centralVRange: [-78, 12],
        hasEastWing: false,
        eastFloors: 0,
        eastHeight: 0,
        hasWestWing: false,
        westFloors: 0,
        westHeight: 0,
        hasPenthouse: false,
        hasSkyCrown: false,
        hasTicker: false,
        hasReflectionPool: false,
        flagCount: 1,
        treeCount: 3,
        visitorCount: 4,
      };
    case 2:
      return {
        level: 2,
        title: COMMERCIAL_LEVEL_TITLES[2],
        centralFloors: 3,
        centralHeight: 48,
        centralHalfU: 52,
        centralVRange: [-88, 16],
        hasEastWing: true,
        eastFloors: 2,
        eastHeight: 32,
        hasWestWing: false,
        westFloors: 0,
        westHeight: 0,
        hasPenthouse: false,
        hasSkyCrown: false,
        hasTicker: false,
        hasReflectionPool: false,
        flagCount: 2,
        treeCount: 4,
        visitorCount: 6,
      };
    case 3:
      return {
        level: 3,
        title: COMMERCIAL_LEVEL_TITLES[3],
        centralFloors: 3,
        centralHeight: 58,
        centralHalfU: 56,
        centralVRange: [-94, 18],
        hasEastWing: true,
        eastFloors: 2,
        eastHeight: 38,
        hasWestWing: true,
        westFloors: 2,
        westHeight: 36,
        hasPenthouse: false,
        hasSkyCrown: false,
        hasTicker: true,
        hasReflectionPool: false,
        flagCount: 3,
        treeCount: 5,
        visitorCount: 9,
      };
    case 4:
      return {
        level: 4,
        title: COMMERCIAL_LEVEL_TITLES[4],
        centralFloors: 4,
        centralHeight: 74,
        centralHalfU: 58,
        centralVRange: [-98, 20],
        hasEastWing: true,
        eastFloors: 3,
        eastHeight: 48,
        hasWestWing: true,
        westFloors: 3,
        westHeight: 46,
        hasPenthouse: true,
        hasSkyCrown: false,
        hasTicker: true,
        hasReflectionPool: true,
        flagCount: 3,
        treeCount: 6,
        visitorCount: 12,
      };
    case 5:
    default:
      return {
        level: 5,
        title: COMMERCIAL_LEVEL_TITLES[5],
        centralFloors: 5,
        centralHeight: 88,
        centralHalfU: 62,
        centralVRange: [-104, 22],
        hasEastWing: true,
        eastFloors: 4,
        eastHeight: 62,
        hasWestWing: true,
        westFloors: 4,
        westHeight: 60,
        hasPenthouse: true,
        hasSkyCrown: true,
        hasTicker: true,
        hasReflectionPool: true,
        flagCount: 4,
        treeCount: 6,
        visitorCount: 16,
      };
  }
}

export interface ProjectedBoardTextLayout {
  midX: number;
  midY: number;
  angleDeg: number;
  spanPx: number;
  usableSpanPx: number;
  fontSize: number;
  letterSpacing: number;
  textLength?: number;
}

/**
 * Computes exact projected screen span, readable rotation (-90..90 deg), scaled fontSize,
 * and optional SVG textLength cap so behind-goal / sideline LED & stand text always scales
 * cleanly with stadium capacity and camera zoom without ever overflowing the board polygon.
 */
export function computeProjectedBoardTextLayout(
  pStart: Pt2,
  pEnd: Pt2,
  label: string,
  opts: {
    maxFontPx?: number;
    minFontPx?: number;
    maxFillRatio?: number;
    baseLetterSpacing?: number;
  } = {}
): ProjectedBoardTextLayout {
  const maxFontPx = opts.maxFontPx ?? 6.8;
  const minFontPx = opts.minFontPx ?? 2.8;
  const maxFillRatio = opts.maxFillRatio ?? 0.84;
  const baseLetterSpacing = opts.baseLetterSpacing ?? 0.55;

  const dx = pEnd.x - pStart.x;
  const dy = pEnd.y - pStart.y;
  const spanPx = Math.max(12, Math.hypot(dx, dy));
  const usableSpanPx = Math.max(10, spanPx * maxFillRatio);

  let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angleDeg > 90) angleDeg -= 180;
  if (angleDeg < -90) angleDeg += 180;

  const cleanText = (label || '').trim();
  const charCount = Math.max(4, cleanText.length);
  // Size font strictly from usable projected span so text never clips or needs spacingAndGlyphs stretching
  const fontBySpan = usableSpanPx / (charCount * 0.66 + Math.max(0, charCount - 1) * 0.06);
  const scaleAwareMax = Math.min(maxFontPx, spanPx * 0.072);
  const fontSize = Math.max(
    minFontPx,
    Math.min(scaleAwareMax, fontBySpan)
  );
  const letterSpacing = Math.max(0.12, Math.min(baseLetterSpacing, fontSize * 0.075));

  return {
    midX: (pStart.x + pEnd.x) / 2,
    midY: (pStart.y + pEnd.y) / 2,
    angleDeg,
    spanPx,
    usableSpanPx,
    fontSize: Number(fontSize.toFixed(2)),
    letterSpacing: Number(letterSpacing.toFixed(2)),
    textLength: undefined,
  };
}

/**
 * Computes concise, readable behind-goal banner copy that fits cleanly behind the goal
 * while clearly signaling Fortress Curva or the active fan policy.
 */
export function buildBehindGoalBoardCopy(
  clubName: string,
  stadiumPolicy: StadiumPolicy | string,
  isReserve = false
): string {
  const cleanUpper = (clubName || 'CLUB')
    .replace(/^(FC|1\.\s*FC|SC|SV|VfB|TSG|RB|Borussia|Eintracht|Bavaria)\s+/i, '')
    .trim()
    .toUpperCase();
  const shortClub = cleanUpper.length > 12 ? `${cleanUpper.slice(0, 11)}.` : cleanUpper;
  if (isReserve) return `${shortClub} ACADEMY`;
  if (stadiumPolicy === 'ultras') return `FORTRESS CURVA · ${shortClub}`;
  if (stadiumPolicy === 'commercial') return `AGAINST MODERN PRICES`;
  if (stadiumPolicy === 'family') return `${shortClub} · FAMILY STAND`;
  return `${shortClub} · HOME END`;
}

/**
 * Computes normalized [-1..1] radial gangway aisle positions along straight stands so concrete
 * stairways, vomitory portals, and spectator sector spacing align cleanly without fans standing on stairs.
 */
export function getFanSectionAislePositions(
  standGeom: { clampedCapacity: number; scaleBand: string; hasRunningTrack?: boolean },
  standType: 'sideline' | 'end'
): number[] {
  if (standType === 'sideline') {
    return standGeom.clampedCapacity >= 45000
      ? [-0.74, -0.45, -0.15, 0.15, 0.45, 0.74]
      : standGeom.clampedCapacity >= 15000
      ? [-0.68, -0.34, 0, 0.34, 0.68]
      : [-0.56, 0, 0.56];
  }
  if (standGeom.hasRunningTrack) {
    return standGeom.clampedCapacity >= 45000 ? [-0.36, 0.36] : [0];
  }
  return standGeom.clampedCapacity >= 45000
    ? [-0.66, -0.22, 0.22, 0.66]
    : standGeom.clampedCapacity >= 12000
    ? [-0.54, 0, 0.54]
    : [-0.46, 0.46];
}

export function isCoordOnFanAisle(
  normalizedCoord: number,
  aislePositions: number[],
  halfWidth = 0.045
): boolean {
  for (let i = 0; i < aislePositions.length; i++) {
    if (Math.abs(normalizedCoord - aislePositions[i]) <= halfWidth) {
      return true;
    }
  }
  return false;
}

export interface CurvaBannerWithLogoLayout {
  midX: number;
  midY: number;
  angleDeg: number;
  logoSize: number;
  logoX: number;
  logoY: number;
  textX: number;
  textY: number;
  fontSize: number;
  letterSpacing: number;
  spanPx: number;
}

/**
 * Computes centered local coordinates for [Club Crest + Label] inside a rotated SVG group
 * anchored at (midX, midY) along the behind-goal stand slope so logo & text scale proportionally
 * without clipping on any capacity (1k - 150k) or camera preset.
 */
export function computeCurvaBannerWithLogoLayout(
  pStart: Pt2,
  pEnd: Pt2,
  label = 'FORTRESS CURVA',
  opts: {
    maxFontPx?: number;
    minFontPx?: number;
    maxFillRatio?: number;
    baseLetterSpacing?: number;
  } = {}
): CurvaBannerWithLogoLayout {
  const maxFontPx = opts.maxFontPx ?? 6.8;
  const minFontPx = opts.minFontPx ?? 2.8;
  const maxFillRatio = opts.maxFillRatio ?? 0.84;
  const baseLetterSpacing = opts.baseLetterSpacing ?? 0.45;

  const dx = pEnd.x - pStart.x;
  const dy = pEnd.y - pStart.y;
  const spanPx = Math.max(18, Math.hypot(dx, dy));
  const usableSpanPx = Math.max(14, spanPx * maxFillRatio);

  let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angleDeg > 90) angleDeg -= 180;
  if (angleDeg < -90) angleDeg += 180;

  const cleanText = (label || 'FORTRESS CURVA').trim();
  const charCount = Math.max(4, cleanText.length);
  // Reserve proportional width for crest (roughly 1.95 * fontSize) + small gap (0.55 * fontSize)
  const effectiveChars = charCount * 0.66 + Math.max(0, charCount - 1) * 0.06 + 2.55;
  const scaleAwareMax = Math.min(maxFontPx, spanPx * 0.068);
  const fontSize = Math.max(
    minFontPx,
    Math.min(scaleAwareMax, usableSpanPx / effectiveChars)
  );
  const letterSpacing = Math.max(0.1, Math.min(baseLetterSpacing, fontSize * 0.065));
  const logoSize = Math.max(6.4, Math.min(13.5, fontSize * 1.9));
  const gap = Math.max(2.0, logoSize * 0.34);
  const estTextW = Math.min(
    usableSpanPx - logoSize - gap,
    charCount * fontSize * 0.63 + Math.max(0, charCount - 1) * letterSpacing
  );
  const totalW = logoSize + gap + Math.max(8, estTextW);
  const leftEdge = -totalW / 2;

  return {
    midX: (pStart.x + pEnd.x) / 2,
    midY: (pStart.y + pEnd.y) / 2,
    angleDeg,
    logoSize: Number(logoSize.toFixed(2)),
    logoX: Number(leftEdge.toFixed(2)),
    logoY: Number((-logoSize / 2).toFixed(2)),
    textX: Number((leftEdge + logoSize + gap + estTextW / 2).toFixed(2)),
    textY: 0,
    fontSize: Number(fontSize.toFixed(2)),
    letterSpacing: Number(letterSpacing.toFixed(2)),
    spanPx,
  };
}

/**
 * Computes the stadium architecture remodeling fee (in thousands, €K) scaled by
 * division tier, country economic multiplier, and current stadium capacity.
 */
export function getStadiumArchitectureRemodelCostK(
  capacity: number,
  tier: number,
  countryMult = 1.0
): number {
  const safeTier = Math.max(1, Math.min(8, Math.round(tier || 3)));
  const tierMult =
    safeTier === 1
      ? 1.0
      : safeTier === 2
      ? 0.55
      : safeTier === 3
      ? 0.28
      : safeTier === 4
      ? 0.14
      : safeTier === 5
      ? 0.08
      : safeTier === 6
      ? 0.045
      : 0.025;
  const safeCap = Math.max(1500, Math.min(150000, capacity || 12000));
  const capMult = Math.max(0.55, Math.min(2.35, Math.sqrt(safeCap / 18000)));
  const safeCMult = Math.max(0.08, countryMult || 1.0);
  const rawK = 4200 * tierMult * safeCMult * capMult;
  return Math.max(25, Math.round(rawK / 10) * 10);
}

/**
 * Checks whether a target architecture style is already unlocked/owned (no remodel fee needed).
 */
export function isStadiumStyleOwned(
  targetStyle: string,
  defaultAutoStyle: string,
  explicitStyle?: string | null,
  unlockedStyles?: string[]
): boolean {
  if (targetStyle === 'auto' || targetStyle === defaultAutoStyle) return true;
  if (explicitStyle && targetStyle === explicitStyle) return true;
  return Array.isArray(unlockedStyles) && unlockedStyles.includes(targetStyle);
}

/**
 * Resolves a concise club stature label for the Club History context card.
 */
export function resolveClubStatureLabel(
  tier: number,
  baseOvr: number,
  totalTrophies = 0
): string {
  const safeTier = Math.max(1, tier || 1);
  const safeOvr = baseOvr || 60;
  if (safeTier === 1 && (safeOvr >= 88 || totalTrophies >= 3)) return 'Global Superpower';
  if (safeTier === 1 && (safeOvr >= 80 || totalTrophies >= 1)) return 'Continental Contender';
  if (safeTier === 1) return 'Top-Flight Established';
  if (safeTier === 2 && safeOvr >= 68) return 'Promotion Challenger';
  if (safeTier === 2) return 'Second-Tier Traditional';
  if (safeTier <= 4) return 'Regional Ambition';
  return 'Grassroots Heritage';
}

