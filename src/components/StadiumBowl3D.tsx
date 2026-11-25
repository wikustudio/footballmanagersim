import React, { useState, useMemo, useEffect } from 'react';
import {
  CameraAngle,
  Club,
  MatchdayOutcome,
  MatchPhase,
  PitchDesignId,
  StadiumArchitectureStyle,
  StadiumNamingRightsDeal,
  StadiumPolicy,
} from '../types';
import {
  MatchTimeOfDay,
  PitchPlayerNode,
  ShootoutChoreographyState,
  SupercupEligibility,
  computeLiveMatchChoreography,
  computeMatchTimeOfDay,
  computeSeatOccupancyProfile,
  computeStadiumArchitecture,
  evaluateStadiumSeatOccupancy,
  getClubCampusColors,
  getEffectiveStadiumName,
  getMatchPhaseForOutcome,
  getPitchDesign,
  resolveClubStadiumStyle,
} from '../engine/liveSimVisualEngine';
import { formatNum, isReserveClub } from '../data/gameConstants';
import { ClubLogo } from './ClubLogo';
import {
  buildBehindGoalBoardCopy,
  computeCurvaBannerWithLogoLayout,
  computeProjectedBoardTextLayout,
  getFanSectionAislePositions,
  isCoordOnFanAisle,
} from '../engine/campusAndBowlGeometry';
import {
  RailMiniBanner,
  TwoPoleBannerSpec,
  buildCreativeFanSectionConfig,
  resolveClubBannerTheme,
} from '../engine/fanSectionDesign';

export interface StadiumOpponentPreview {
  id?: number | string;
  name: string;
  color?: string;
  logo?: string;
  fallbackLogo?: string;
}

interface StadiumBowl3DProps {
  club: Club;
  namingRights?: StadiumNamingRightsDeal | null;
  pitchDesignId?: PitchDesignId;
  stadiumStyle?: StadiumArchitectureStyle;
  stadiumPolicy?: StadiumPolicy;
  vipHospitalityActive?: boolean;
  attendance: number;
  capacity: number;
  emptyBowl?: boolean;
  isLive?: boolean;
  currentOutcome?: MatchdayOutcome;
  currentMatchday?: number;
  totalMatchdays?: number;
  subTick?: number;
  opponentName?: string;
  opponentColor?: string;
  opponentClub?: StadiumOpponentPreview | null;
  userGoals?: number;
  oppGoals?: number;
  userRecord?: string;
  oppRecord?: string;
  tacticLabel?: string;
  onOpenTactic?: () => void;
  onSelectTactic?: (tactic: string) => void;
  supercupEligibility?: SupercupEligibility | null;
  seasonPhase?: 'start' | 'pre' | 'mid' | 'end';
  isFastMode?: boolean;
  onSimulateSeason?: () => void;
  onOpenSupercup?: () => void;
  onToggleSimSpeed?: () => void;
  onSkipInlineSim?: () => void;
  isModActive?: boolean;
  activeSponsorName?: string;
  cameraAngle?: CameraAngle;
  onCameraChange?: (cam: CameraAngle) => void;
  compactMode?: boolean;
  hideTopHud?: boolean;
  initialTimeOfDay?: MatchTimeOfDay | 'auto';
  forcedMatchPhase?: MatchPhase | null;
  shootoutState?: ShootoutChoreographyState | null;
  customTopBoardText?: string;
  customBottomBoardText?: string;
  customHomeBoardText?: string;
  customAwayBoardText?: string;
  containerClassName?: string;
}

const CAMERA_OPTIONS: Array<{ id: CameraAngle; label: string }> = [
  { id: 'isometric', label: 'Broadcast' },
  { id: 'topdown', label: 'Top-Down' },
  { id: 'endzone', label: 'Endzone' },
  { id: 'inspection', label: 'Inspect' },
];

const SKIN_TONES = ['#FDE68A', '#F3C998', '#D99B66', '#B87344', '#7C4B2C', '#F8FAFC'];

interface Pt2 {
  x: number;
  y: number;
}

export const StadiumBowl3D: React.FC<StadiumBowl3DProps> = React.memo(({
  club,
  namingRights,
  pitchDesignId,
  stadiumStyle,
  stadiumPolicy = 'balanced',
  vipHospitalityActive = false,
  attendance,
  capacity,
  emptyBowl = false,
  isLive = false,
  currentOutcome,
  currentMatchday = 0,
  totalMatchdays = 34,
  subTick = 0,
  opponentName,
  opponentColor = '#DC2626',
  opponentClub,
  userGoals = 0,
  oppGoals = 0,
  userRecord = '0–0–0',
  oppRecord = '0–0–0',
  tacticLabel = 'Balanced',
  supercupEligibility,
  seasonPhase,
  isFastMode = false,
  onSimulateSeason,
  onOpenSupercup,
  onToggleSimSpeed,
  onSkipInlineSim,
  isModActive = false,
  activeSponsorName,
  cameraAngle: controlledCam,
  onCameraChange,
  compactMode = false,
  hideTopHud = false,
  initialTimeOfDay = 'auto',
  forcedMatchPhase = null,
  shootoutState = null,
  customTopBoardText,
  customBottomBoardText,
  customHomeBoardText,
  customAwayBoardText,
  containerClassName,
}) => {
  const [internalCam, setInternalCam] = useState<CameraAngle>('isometric');
  const [inspectZoom, setInspectZoom] = useState(1);
  const [idleTick, setIdleTick] = useState(0);
  const [forcedTimeOfDay, setForcedTimeOfDay] = useState<MatchTimeOfDay | 'auto'>(initialTimeOfDay);
  const camera = controlledCam ?? internalCam;

  // Sync external time-of-day changes (e.g. World Cup daylight kickoff transitioning to floodlit Extra Time)
  useEffect(() => {
    setForcedTimeOfDay(initialTimeOfDay);
  }, [initialTimeOfDay]);

  // Fluid 550ms live match choreography; gentle 1400ms warm-up cadence pre-kickoff
  useEffect(() => {
    if (emptyBowl) return;
    const timer = window.setInterval(() => {
      setIdleTick((t) => (t + 1) % 48);
    }, isLive ? 550 : 1400);
    return () => window.clearInterval(timer);
  }, [emptyBowl, isLive]);

  const setCamera = (cam: CameraAngle) => {
    setInternalCam(cam);
    onCameraChange?.(cam);
    if (cam !== 'inspection') setInspectZoom(1);
    else setInspectZoom((z) => (z === 1 ? 1.18 : 1.08));
  };

  const design = getPitchDesign(pitchDesignId);
  const palette = useMemo(() => getClubCampusColors(club), [club]);
  const bannerTheme = useMemo(() => resolveClubBannerTheme(palette), [palette]);
  const fanSectionConfig = useMemo(
    () => buildCreativeFanSectionConfig(club, stadiumPolicy, isReserveClub(club.name)),
    [club, stadiumPolicy]
  );
  const stadiumName = useMemo(
    () => getEffectiveStadiumName(club, namingRights),
    [club, namingRights]
  );

  const effectiveOppName = opponentClub?.name || opponentName || 'League Rival';
  const effectiveOppColor = opponentClub?.color || opponentColor || '#DC2626';

  const oppPalette = useMemo(
    () => getClubCampusColors({ name: effectiveOppName, color: effectiveOppColor }),
    [effectiveOppName, effectiveOppColor]
  );

  // 70% Daytime / 30% Nighttime deterministic schedule + user override toggle
  const autoTimeOfDay: MatchTimeOfDay = useMemo(
    () =>
      emptyBowl
        ? 'day'
        : computeMatchTimeOfDay(currentMatchday, club.id ?? club.name, opponentClub?.id ?? effectiveOppName),
    [emptyBowl, currentMatchday, club.id, club.name, opponentClub?.id, effectiveOppName]
  );
  const timeOfDay: MatchTimeOfDay = forcedTimeOfDay === 'auto' ? autoTimeOfDay : forcedTimeOfDay;
  const isDaytime = timeOfDay === 'day';

  // Crowd atmosphere driven by attendance + capacity (completely empty when emptyBowl is true)
  const effectiveAttendance = emptyBowl ? 0 : attendance;
  const isMatchdayActive = !emptyBowl && (isLive || currentMatchday > 0 || effectiveAttendance > 0);
  const seatProfile = useMemo(
    () => computeSeatOccupancyProfile(effectiveAttendance, capacity, isMatchdayActive),
    [effectiveAttendance, capacity, isMatchdayActive]
  );

  const effectiveTick = isLive ? subTick + idleTick : idleTick;
  const matchPhase: MatchPhase = useMemo(
    () =>
      forcedMatchPhase ??
      getMatchPhaseForOutcome(currentOutcome, Math.floor(effectiveTick / 3), isLive),
    [forcedMatchPhase, currentOutcome, effectiveTick, isLive]
  );

  // Tactic-Aware 3D Match Choreography (Continuous 11v11 Player & Ball Fluid Movement + 3D Shootouts)
  const choreo = useMemo(
    () =>
      computeLiveMatchChoreography({
        tactic: tacticLabel,
        phase: matchPhase,
        tick: effectiveTick,
        isLive,
        outcome: currentOutcome,
        shootout: shootoutState,
      }),
    [tacticLabel, matchPhase, effectiveTick, isLive, currentOutcome, shootoutState]
  );

  // Resolve architectural style (Club Heritage Auto or explicit user override) & scale from 1,000 -> 150,000 seats
  const resolvedStyle = useMemo(
    () => resolveClubStadiumStyle(club, stadiumStyle),
    [club, stadiumStyle]
  );
  const standGeom = useMemo(
    () => computeStadiumArchitecture(capacity, resolvedStyle),
    [capacity, resolvedStyle]
  );
  const scaleBand = standGeom.scaleBand;
  const tierLabel = standGeom.tierLabel;

  const apronFill = design.apronColor === 'CLUB_PRIMARY' ? palette.primary : design.apronColor;
  const occPct = emptyBowl ? 0 : Math.min(100, Math.round((effectiveAttendance / Math.max(1, capacity)) * 100));

  // Unified 3D -> 2D projection supporting Broadcast Isometric, Top-Down, Endzone & Inspect cameras
  const project = useMemo(() => {
    return (u: number, v: number, z = 0): Pt2 => {
      if (camera === 'topdown') {
        const tdZoom = standGeom.zoomFactor * 0.98;
        return {
          x: 400 + u * 1.06 * tdZoom,
          y: 258 + v * 0.94 * tdZoom,
        };
      }
      if (camera === 'endzone') {
        const depth = (u + 260) / 520; // 0 = near home goal, 1 = far away goal
        const fScale = (1.12 - depth * 0.44) * standGeom.zoomFactor;
        return {
          x: 400 + v * 1.44 * fScale,
          y: 396 - depth * 202 - z * (0.82 - depth * 0.24),
        };
      }
      const zoom = (camera === 'inspection' ? inspectZoom : 1.0) * standGeom.zoomFactor;
      const ux = 0.62 * zoom;
      const uy = 0.28 * zoom;
      const vx = -0.68 * zoom;
      const vy = 0.31 * zoom;
      const isoBaseY =
        standGeom.isAmateurGround
          ? 274
          : 280 + Math.max(0, standGeom.tierHeight - 44) * 0.38;
      return {
        x: 400 + u * ux + v * vx,
        y: isoBaseY + u * uy + v * vy - z * zoom,
      };
    };
  }, [camera, inspectZoom, standGeom.zoomFactor, standGeom.tierHeight, standGeom.isAmateurGround]);

  const ptsStr = (pts: Pt2[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const polyUV = (
    u1: number,
    u2: number,
    v1: number,
    v2: number,
    z1 = 0,
    z2 = z1,
    z3 = z2,
    z4 = z1
  ) => ptsStr([project(u1, v1, z1), project(u2, v1, z2), project(u2, v2, z3), project(u1, v2, z4)]);

  // Rounded stadium/track perimeter path in (u, v, z) space
  const roundRectUVPts = (halfU: number, halfV: number, cornerR: number, z = 0, segs = 7): Pt2[] => {
    const r = Math.max(0, Math.min(cornerR, halfU * 0.85, halfV * 0.96));
    if (r <= 1.5) {
      return [
        project(-halfU, -halfV, z),
        project(halfU, -halfV, z),
        project(halfU, halfV, z),
        project(-halfU, halfV, z),
      ];
    }
    const iu = halfU - r;
    const iv = halfV - r;
    const pts: Pt2[] = [];
    // Top-left (-iu, -iv): PI -> 1.5*PI
    for (let i = 0; i <= segs; i++) {
      const a = Math.PI + (i / segs) * (Math.PI * 0.5);
      pts.push(project(-iu + Math.cos(a) * r, -iv + Math.sin(a) * r, z));
    }
    // Top-right (iu, -iv): -0.5*PI -> 0
    for (let i = 0; i <= segs; i++) {
      const a = -Math.PI * 0.5 + (i / segs) * (Math.PI * 0.5);
      pts.push(project(iu + Math.cos(a) * r, -iv + Math.sin(a) * r, z));
    }
    // Bottom-right (iu, iv): 0 -> 0.5*PI
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * (Math.PI * 0.5);
      pts.push(project(iu + Math.cos(a) * r, iv + Math.sin(a) * r, z));
    }
    // Bottom-left (-iu, iv): 0.5*PI -> PI
    for (let i = 0; i <= segs; i++) {
      const a = Math.PI * 0.5 + (i / segs) * (Math.PI * 0.5);
      pts.push(project(-iu + Math.cos(a) * r, iv + Math.sin(a) * r, z));
    }
    return pts;
  };

  // Curved quarter-circle stadium corner deck flush between straight touchline (-/+iu) and goal (-/+iv) stands
  const curvedCornerStandUV = (
    uSign: -1 | 1,
    vSign: -1 | 1,
    iu: number,
    iv: number,
    innerR: number,
    standDepth: number,
    zInnerSideline: number,
    zInnerGoal: number,
    zOuterSideline: number,
    zOuterGoal = zOuterSideline,
    segs = 12
  ) => {
    const outerR = innerR + standDepth;
    const innerPts: Pt2[] = [];
    const outerPts: Pt2[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const a = t * (Math.PI * 0.5);
      const uIn = uSign * (iu + Math.sin(a) * innerR);
      const vIn = vSign * (iv + Math.cos(a) * innerR);
      const uOut = uSign * (iu + Math.sin(a) * outerR);
      const vOut = vSign * (iv + Math.cos(a) * outerR);
      const zIn = zInnerSideline + (zInnerGoal - zInnerSideline) * t;
      const zOut = zOuterSideline + (zOuterGoal - zOuterSideline) * t;
      innerPts.push(project(uIn, vIn, zIn));
      outerPts.push(project(uOut, vOut, zOut));
    }
    return ptsStr([...innerPts, ...outerPts.reverse()]);
  };

  const lineAngleDeg = (a: Pt2, b: Pt2) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

  // Pitch boundaries in canonical coordinates: u [-210, 210], v [-135, 135]
  const P_U = 210;
  const P_V = 135;
  const A_U = 228;
  const A_V = 153;
  // Architectural setback from pitch apron to inner concrete stand wall
  const standBaseU = A_U + standGeom.standGapU;
  const standBaseV = A_V + standGeom.standGapV;
  // Classic old-school German rounded bowl styling (continental_bowl >= 10k)
  const isClassicGermanBowl = standGeom.style === 'continental_bowl' && standGeom.isRoundedBowl;
  // Exact inner arc & straight span coordinates so curved/mitered corners join straight stands with 0 gap
  const bowlInnerR = standGeom.hasRunningTrack
    ? 144
    : isClassicGermanBowl
    ? 76
    : standGeom.isRoundedBowl
    ? 60
    : 0;
  const straightHalfU = standGeom.isRoundedBowl
    ? standBaseU - bowlInnerR
    : standGeom.hasCorners
    ? standBaseU
    : P_U + 8;
  const straightHalfV = standGeom.isRoundedBowl
    ? standBaseV - bowlInnerR
    : standGeom.hasCorners
    ? standBaseV
    : P_V + 6;
  // Amateur single stand spans ~68% of the far touchline so clubhouse, grass verges & trees frame the wings
  const topStandHalfU = standGeom.isAmateurGround
    ? Math.round(P_U * 0.66)
    : standGeom.isSemiProGround
    ? Math.round(P_U * 0.88)
    : straightHalfU;
  const homeStandHalfV = standGeom.isSemiProGround ? Math.round(P_V * 0.82) : straightHalfV;
  const vipSpanHalfU = Math.max(64, Math.min(132, topStandHalfU - 8));

  // Perimeter LED board copy reflecting active Fan Strategy (or custom World Cup branding)
  const topBoardText =
    customTopBoardText ||
    (stadiumPolicy === 'commercial'
      ? `${(namingRights?.partnerName || activeSponsorName || club.name).toUpperCase()} · VIP HOSPITALITY`
      : stadiumPolicy === 'family'
      ? `${club.name.toUpperCase()} · FAMILY STAND`
      : namingRights?.partnerName || activeSponsorName || `${club.name.toUpperCase()} MATCHDAY`);
  const bottomBoardText = (customBottomBoardText || stadiumName).toUpperCase();
  const homeBoardText =
    customHomeBoardText ||
    buildBehindGoalBoardCopy(
      club.name,
      stadiumPolicy,
      isReserveClub(club.name)
    );
  const awayBoardText =
    customAwayBoardText ||
    (isMatchdayActive && effectiveOppName
      ? `${effectiveOppName.toUpperCase().slice(0, 18)} AWAY`
      : 'VISITING STAND');

  // Geometrically projected LED board layouts (scale smoothly with stadium capacity, zoom & camera angle)
  const topBoardLayout = computeProjectedBoardTextLayout(
    project(-138, -(A_V + 4), 3.2),
    project(138, -(A_V + 4), 3.2),
    topBoardText,
    { maxFontPx: 6.4, minFontPx: 2.8, maxFillRatio: 0.84 }
  );
  const bottomBoardLayout = computeProjectedBoardTextLayout(
    project(-138, A_V + 2.2, 4.4),
    project(138, A_V + 2.2, 4.4),
    bottomBoardText,
    { maxFontPx: 6.0, minFontPx: 2.8, maxFillRatio: 0.84 }
  );
  const homeBoardLayout = computeProjectedBoardTextLayout(
    project(-(A_U + 4.2), -82, 3.2),
    project(-(A_U + 4.2), 82, 3.2),
    homeBoardText,
    { maxFontPx: 6.0, minFontPx: 2.8, maxFillRatio: 0.86 }
  );
  const awayBoardLayout = computeProjectedBoardTextLayout(
    project(A_U + 4.2, -82, 3.2),
    project(A_U + 4.2, 82, 3.2),
    awayBoardText,
    { maxFontPx: 6.0, minFontPx: 2.8, maxFillRatio: 0.86 }
  );

  // Behind-goal Home Curva parapet banner layout with Club Crest + Label (stays strictly within homeStandHalfV)
  const curvaBannerSpanV = Math.min(homeStandHalfV * 0.9, Math.max(30, homeStandHalfV * 0.86));
  const curvaBannerLayout = computeCurvaBannerWithLogoLayout(
    project(-(standBaseU + standGeom.standDepth * 0.17), -curvaBannerSpanV, standGeom.tierHeight * 0.25),
    project(-(standBaseU + standGeom.standDepth * 0.17), curvaBannerSpanV, standGeom.tierHeight * 0.25),
    fanSectionConfig.curvaBannerTitle,
    { maxFontPx: 7.0, minFontPx: 2.8, maxFillRatio: 0.84 }
  );

  const sidelineAisles = useMemo(
    () => (standGeom.isAmateurGround ? [-0.36, 0.36] : getFanSectionAislePositions(standGeom, 'sideline')),
    [standGeom]
  );
  const endAisles = useMemo(
    () => getFanSectionAislePositions(standGeom, 'end'),
    [standGeom]
  );

  const centerScreen = project(0, 0, 0);
  // Projection-safe foreground & right stand heights: scale impressively on 60k-150k mega-arenas without ever overlapping the pitch
  const maxSafeRightZ = Math.max(6, Math.round((standBaseU - P_U + standGeom.standDepth) * 0.27 - 3));
  const maxSafeFgZ = Math.max(5, Math.round((standBaseV - P_V + standGeom.standDepth) * 0.28 - 6));
  const rightTierHeight = standGeom.hasAwayEndStand
    ? Math.max(
        5,
        Math.min(maxSafeRightZ, Math.round(standGeom.tierHeight * (standGeom.isMegaArena ? 0.56 : 0.42)))
      )
    : 4;
  const fgTierHeight = standGeom.hasBottomStand
    ? Math.max(
        4,
        Math.min(maxSafeFgZ, Math.round(standGeom.tierHeight * (standGeom.isMegaArena ? 0.48 : 0.36)))
      )
    : 4;
  const topSidelineFill = seatProfile.oppositeMidfieldFill;
  const bottomSidelineFill = seatProfile.mainMidfieldFill;
  const homeCurvaEffectiveFill =
    !isMatchdayActive
      ? 0
      : stadiumPolicy === 'ultras'
      ? Math.min(1, seatProfile.homeEndFill * 1.12 + 0.05)
      : stadiumPolicy === 'commercial'
      ? Math.max(0.18, seatProfile.homeEndFill * 0.74)
      : seatProfile.homeEndFill;

  const vipBoxesCount = standGeom.isAmateurGround
    ? 0
    : Math.max(
        seatProfile.vipBoxesCount,
        vipHospitalityActive || stadiumPolicy === 'commercial' ? 10 : 0
      );
  const vipSuitesVisible = vipBoxesCount > 0;
  const vipSuitesIlluminated =
    vipHospitalityActive || stadiumPolicy === 'commercial' || isMatchdayActive;

  const pyroActive =
    isMatchdayActive &&
    standGeom.hasHomeEndStand &&
    fanSectionConfig.creativeFanSectionsEnabled &&
    (stadiumPolicy === 'ultras' || isLive || occPct >= 45 || seatProfile.homeEndFill >= 0.45);
  const pyroBoost = stadiumPolicy === 'ultras' || matchPhase === 'goal' || matchPhase === 'setpiece';

  /**
   * High-Density Spectator & Seat Builder (returns stable 4-cohort geometry independent of sub-ticks)
   */
  interface SpectatorGridResult {
    key: string;
    emptySeats: React.ReactNode[];
    baseCohorts: Array<React.ReactNode[]>;
    exciteCohorts: Array<React.ReactNode[]>;
    goalCohorts: Array<React.ReactNode[]>;
    focusEndType: 'home' | 'away' | 'side';
  }

  const buildSpectatorBlock = (
    u1: number,
    u2: number,
    v1: number,
    v2: number,
    uCount: number,
    vCount: number,
    zMin: number,
    zMax: number,
    outwardAxis: 'u-' | 'u+' | 'v-' | 'v+',
    fillRatio: number,
    primaryCol: string,
    secondaryCol: string,
    centerOut = true,
    isGoalEnd = false,
    focusEndType: 'home' | 'away' | 'side' = 'side',
    roundedCornerMask?: {
      iu: number;
      iv: number;
      rMin: number;
      rMax: number;
      zMinStart?: number;
      zMinEnd?: number;
      zMaxStart?: number;
      zMaxEnd?: number;
      fillStart?: number;
      fillEnd?: number;
      awayWedgeStartT?: number;
      awayPrimaryCol?: string;
      awaySecondaryCol?: string;
    },
    aisles?: number[],
    wingFillRatio?: number,
    isMiterCorner = false,
    miterCornerZ?: [number, number, number, number]
  ): SpectatorGridResult => {
    const emptySeats: React.ReactNode[] = [];
    const baseCohorts: Array<React.ReactNode[]> = [[], [], []];
    const exciteCohorts: Array<React.ReactNode[]> = [[], [], []];
    const goalCohorts: Array<React.ReactNode[]> = [[], [], []];

    // Preserve equal linear density around curved oval sweeps, behind the goal, and along sidelines
    const arcMidR = roundedCornerMask ? 0.5 * (roundedCornerMask.rMin + roundedCornerMask.rMax) : 0;
    const effUCount = roundedCornerMask
      ? Math.max(24, Math.min(54, Math.round((Math.PI * 0.5 * arcMidR) / 5.0)))
      : isGoalEnd
      ? Math.min(uCount, 12)
      : Math.min(uCount, 58);
    const effVCount = roundedCornerMask ? Math.min(vCount, 16) : isGoalEnd ? Math.min(vCount, 32) : Math.min(vCount, 12);
    const polarRadSteps = roundedCornerMask
      ? Math.max(8, Math.min(16, Math.round((roundedCornerMask.rMax - roundedCornerMask.rMin) / 4.2)))
      : effVCount;
    const cornerUSign: -1 | 1 = (u1 + u2) >= 0 ? 1 : -1;
    const cornerVSign: -1 | 1 = (v1 + v2) >= 0 ? 1 : -1;
    const bodyR =
      standGeom.clampedCapacity >= 75000
        ? 2.4
        : standGeom.clampedCapacity >= 30000
        ? 2.55
        : standGeom.clampedCapacity >= 10000
        ? 2.7
        : 2.85;
    const headR = bodyR * 0.58;

    // Fan Strategy shapes ambient vibrancy, scarf ratio & raised-arm animation
    const baseScarfPct =
      stadiumPolicy === 'commercial'
        ? focusEndType === 'home'
          ? 5
          : 4
        : stadiumPolicy === 'family'
        ? focusEndType === 'home'
          ? 8
          : 6
        : focusEndType === 'home' && stadiumPolicy === 'ultras'
        ? 34
        : isGoalEnd
        ? 22
        : 15;
    const baseArmsPct =
      stadiumPolicy === 'commercial'
        ? 4
        : stadiumPolicy === 'family'
        ? 6
        : focusEndType === 'home' && stadiumPolicy === 'ultras'
        ? 24
        : isGoalEnd
        ? 15
        : 10;

    for (let ui = 0; ui < effUCount; ui++) {
      for (let vi = 0; vi < polarRadSteps; vi++) {
        const uFrac = effUCount > 1 ? ui / (effUCount - 1) : 0.5;
        const vFrac = polarRadSteps > 1 ? vi / (polarRadSteps - 1) : 0.5;

        // Keep concrete gangway stairs & horizontal mid-tier walkway clear so seats look like real fan sectors
        if (aisles && aisles.length > 0 && !roundedCornerMask) {
          const longCoord = isGoalEnd ? vFrac * 2 - 1 : uFrac * 2 - 1;
          const aisleHalfWidth = isGoalEnd ? 0.048 : 0.03;
          if (isCoordOnFanAisle(longCoord, aisles, aisleHalfWidth)) {
            continue;
          }
        }
        if (standGeom.hasUpperRing) {
          const depthFrac = roundedCornerMask ? vFrac : isGoalEnd ? uFrac : vFrac;
          const walkwayHalfBand = isGoalEnd ? 0.046 : 0.036;
          if (Math.abs(depthFrac - 0.52) < walkwayHalfBand) {
            continue;
          }
        }

        let u: number;
        let v: number;
        let radialRatio: number | null = null;
        let cornerAngT = 0.5;
        if (roundedCornerMask) {
          const angT = (ui + 0.5) / effUCount;
          cornerAngT = angT;
          // Crisp radial sector stairs that preserve dense oval side seating
          const isTrackWideArc = arcMidR > 110;
          if (isTrackWideArc) {
            if (Math.abs(angT - 0.34) < 0.022 || Math.abs(angT - 0.68) < 0.022) continue;
          } else if (Math.abs(angT - 0.5) < 0.032) {
            continue;
          }
          const ang = angT * (Math.PI * 0.5);
          radialRatio = (vi + 0.5) / polarRadSteps;
          const r =
            roundedCornerMask.rMin +
            radialRatio * (roundedCornerMask.rMax - roundedCornerMask.rMin);
          u = cornerUSign * (roundedCornerMask.iu + Math.sin(ang) * r);
          v = cornerVSign * (roundedCornerMask.iv + Math.cos(ang) * r);
        } else {
          u = u1 + ((ui + 0.5) / effUCount) * (u2 - u1);
          v = v1 + ((vi + 0.5) / polarRadSteps) * (v2 - v1);
        }

        const standHalfSpanU = Math.max(1, Math.max(Math.abs(u1), Math.abs(u2)));
        const standHalfSpanV = Math.max(1, Math.max(Math.abs(v1), Math.abs(v2)));
        const normUDist = Math.min(1, Math.abs(u) / standHalfSpanU);
        const normVDist = Math.min(1, Math.abs(v) / standHalfSpanV);

        const frontBackRatio =
          radialRatio !== null
            ? radialRatio
            : outwardAxis === 'u-'
            ? 1 - uFrac
            : outwardAxis === 'u+'
            ? uFrac
            : outwardAxis === 'v-'
            ? 1 - vFrac
            : vFrac;

        const isCornerBlock = Boolean(roundedCornerMask) || isMiterCorner;
        const { isOccupied } = evaluateStadiumSeatOccupancy({
          isMatchdayActive,
          isCorner: isCornerBlock,
          isGoalEnd,
          centerOut,
          uNorm: isCornerBlock ? uFrac : normUDist,
          vNorm: isCornerBlock ? vFrac : normVDist,
          frontBackRatio,
          cornerAngT: roundedCornerMask ? cornerAngT : uFrac,
          fillRatio,
          wingFillRatio,
          fillStart: roundedCornerMask?.fillStart,
          fillEnd: roundedCornerMask?.fillEnd,
          ui,
          vi,
        });

        const effZMin =
          roundedCornerMask &&
          roundedCornerMask.zMinStart !== undefined &&
          roundedCornerMask.zMinEnd !== undefined
            ? roundedCornerMask.zMinStart +
              (roundedCornerMask.zMinEnd - roundedCornerMask.zMinStart) * cornerAngT
            : zMin;
        const effZMax =
          roundedCornerMask &&
          roundedCornerMask.zMaxStart !== undefined &&
          roundedCornerMask.zMaxEnd !== undefined
            ? roundedCornerMask.zMaxStart +
              (roundedCornerMask.zMaxEnd - roundedCornerMask.zMaxStart) * cornerAngT
            : zMax;

        let z: number;
        if (miterCornerZ && !roundedCornerMask) {
          const [mz1, mz2, mz3, mz4] = miterCornerZ;
          const s = (ui + 0.5) / effUCount;
          const t = (vi + 0.5) / polarRadSteps;
          z =
            (1 - s) * (1 - t) * mz1 +
            s * (1 - t) * mz2 +
            s * t * mz3 +
            (1 - s) * t * mz4;
        } else {
          z = effZMin + frontBackRatio * (effZMax - effZMin);
        }
        const pt = project(u, v, z);

        if (!isOccupied) {
          // Render visible unoccupied bucket seats so <100% crowds clearly show open terraces & corners
          const shouldDrawEmptySeat =
            standGeom.clampedCapacity < 75000 || (ui + vi) % 2 === 0;
          if (shouldDrawEmptySeat) {
            emptySeats.push(
              <rect
                key={`empty-${u1}-${v1}-${ui}-${vi}`}
                x={pt.x - 1.55}
                y={pt.y - 1.05}
                width="3.1"
                height="2.1"
                rx="0.65"
                fill="rgba(226, 232, 240, 0.52)"
                stroke="rgba(51, 65, 85, 0.42)"
                strokeWidth="0.35"
              />
            );
          }
          continue;
        }

        const jx = (((ui * 17 + vi * 31) % 7) - 3) * 0.25;
        const jy = (((ui * 23 + vi * 19) % 5) - 2) * 0.2;
        const px = pt.x + jx;
        const py = pt.y + jy;

        const inAwayWedge =
          Boolean(
            roundedCornerMask &&
              roundedCornerMask.awayWedgeStartT !== undefined &&
              cornerAngT >= roundedCornerMask.awayWedgeStartT
          );
        const effPrimaryCol =
          inAwayWedge && roundedCornerMask?.awayPrimaryCol
            ? roundedCornerMask.awayPrimaryCol
            : primaryCol;
        const effSecondaryCol =
          inAwayWedge && roundedCornerMask?.awaySecondaryCol
            ? roundedCornerMask.awaySecondaryCol
            : secondaryCol;

        const col =
          (ui + vi) % 3 === 0
            ? effSecondaryCol
            : (ui * 3 + vi) % 8 === 0
            ? inAwayWedge
              ? '#E2E8F0'
              : bannerTheme.spectatorTertiary
            : effPrimaryCol;
        const skinCol = SKIN_TONES[(ui * 7 + vi * 3) % SKIN_TONES.length];
        const cohortIdx = (ui * 2 + vi) % 3;

        const fanHash = (ui * 37 + vi * 23) % 100;
        const baseHasScarf = fanHash < baseScarfPct;
        const baseHasArms = !baseHasScarf && fanHash < baseScarfPct + baseArmsPct;
        const exciteHasScarf = !baseHasScarf && !baseHasArms && fanHash >= 36 && fanHash < 52;
        const exciteHasArms = !baseHasScarf && !baseHasArms && fanHash >= 52 && fanHash < 70;
        const goalHasScarf = !baseHasScarf && !exciteHasScarf && fanHash >= 70 && fanHash < 86;
        const goalHasArms = !baseHasScarf && !baseHasArms && !exciteHasScarf && !exciteHasArms && !goalHasScarf && fanHash >= 86;

        const renderScarf = () => (
          <g data-testid="crowd-scarf">
            <line
              x1={px - bodyR * 0.65}
              y1={py - bodyR * 0.25}
              x2={px - bodyR * 1.15}
              y2={py - bodyR * 1.72}
              stroke={skinCol}
              strokeWidth="1.0"
              strokeLinecap="round"
            />
            <line
              x1={px + bodyR * 0.65}
              y1={py - bodyR * 0.25}
              x2={px + bodyR * 1.15}
              y2={py - bodyR * 1.72}
              stroke={skinCol}
              strokeWidth="1.0"
              strokeLinecap="round"
            />
            <rect
              x={px - bodyR * 1.42}
              y={py - bodyR * 2.15}
              width={bodyR * 2.84}
              height="2.2"
              rx="0.6"
              fill={effPrimaryCol}
              stroke="rgba(15,23,42,0.55)"
              strokeWidth="0.35"
            />
            <rect
              x={px - bodyR * 0.48}
              y={py - bodyR * 2.15}
              width={bodyR * 0.96}
              height="2.2"
              fill="#FFFFFF"
            />
            <rect
              x={px + bodyR * 0.46}
              y={py - bodyR * 2.15}
              width={bodyR * 0.96}
              height="2.2"
              rx="0.4"
              fill={effSecondaryCol}
            />
          </g>
        );

        const renderArms = () => (
          <g>
            <line
              x1={px - bodyR * 0.55}
              y1={py - bodyR * 0.25}
              x2={px - bodyR * 1.18}
              y2={py - bodyR * 1.55}
              stroke={col}
              strokeWidth={bodyR * 0.44}
              strokeLinecap="round"
            />
            <line
              x1={px + bodyR * 0.55}
              y1={py - bodyR * 0.25}
              x2={px + bodyR * 1.18}
              y2={py - bodyR * 1.55}
              stroke={col}
              strokeWidth={bodyR * 0.44}
              strokeLinecap="round"
            />
          </g>
        );

        baseCohorts[cohortIdx].push(
          <g key={`spec-${u1}-${v1}-${ui}-${vi}`}>
            {baseHasArms && renderArms()}
            {baseHasScarf && renderScarf()}
            <circle
              cx={px}
              cy={py}
              r={bodyR}
              fill={col}
              stroke="rgba(15,23,42,0.5)"
              strokeWidth="0.45"
            />
            <circle cx={px} cy={py - bodyR * 0.78} r={headR} fill={skinCol} />
          </g>
        );

        if (exciteHasScarf || exciteHasArms) {
          exciteCohorts[cohortIdx].push(
            <g key={`exc-${u1}-${v1}-${ui}-${vi}`}>
              {exciteHasScarf ? renderScarf() : renderArms()}
            </g>
          );
        }

        if (goalHasScarf || goalHasArms) {
          goalCohorts[cohortIdx].push(
            <g key={`goal-${u1}-${v1}-${ui}-${vi}`}>
              {goalHasScarf ? renderScarf() : renderArms()}
            </g>
          );
        }
      }
    }

    return {
      key: `stand-block-${u1}-${v1}`,
      emptySeats,
      baseCohorts,
      exciteCohorts,
      goalCohorts,
      focusEndType,
    };
  };

  const renderAnimatedSpectatorBlock = (block: SpectatorGridResult) => {
    const isEndFocusedGoal =
      matchPhase === 'goal' &&
      (choreo.crowdCelebration.focusEnd === 'both' ||
        choreo.crowdCelebration.focusEnd === block.focusEndType ||
        block.focusEndType === 'side');
    const animClass = isEndFocusedGoal
      ? 'fms-crowd-celebrate'
      : matchPhase === 'shot' || matchPhase === 'setpiece' || matchPhase === 'counter' || matchPhase === 'goal'
      ? 'fms-crowd-excite'
      : 'fms-crowd-bob';
    const showExciteOverlay =
      matchPhase === 'shot' ||
      matchPhase === 'setpiece' ||
      matchPhase === 'counter' ||
      matchPhase === 'goal';
    const showGoalOverlay = isEndFocusedGoal;

    return (
      <g key={block.key}>
        {block.emptySeats.length > 0 && <g opacity="0.85">{block.emptySeats}</g>}
        {block.baseCohorts.map((group, idx) =>
          group.length > 0 ? (
            <g
              key={`${block.key}-coh-${idx}`}
              className={animClass}
              style={{ animationDelay: `${idx * 0.18}s` }}
            >
              {group}
              {showExciteOverlay && block.exciteCohorts[idx].length > 0 && (
                <g opacity="0.96">{block.exciteCohorts[idx]}</g>
              )}
              {showGoalOverlay && block.goalCohorts[idx].length > 0 && (
                <g opacity="0.98">{block.goalCohorts[idx]}</g>
              )}
            </g>
          ) : null
        )}
      </g>
    );
  };

  const renderFlag = (u: number, v: number, z: number, c1: string, c2: string, idx: number) => {
    const pt = project(u, v, z);
    return (
      <g
        key={`flag-${idx}`}
        className="fms-flag-wave"
        style={{ animationDelay: `${(idx % 4) * 0.24}s` }}
      >
        <line x1={pt.x} y1={pt.y + 4} x2={pt.x} y2={pt.y - 16} stroke="#F8FAFC" strokeWidth="1.4" />
        <path
          d={`M ${pt.x} ${pt.y - 16} Q ${pt.x + 8} ${pt.y - 18} ${pt.x + 15} ${pt.y - 14} L ${pt.x + 15} ${pt.y - 7} Q ${pt.x + 8} ${pt.y - 9} ${pt.x} ${pt.y - 8} Z`}
          fill={c1}
          stroke="rgba(15,23,42,0.35)"
          strokeWidth="0.4"
        />
        <path
          d={`M ${pt.x} ${pt.y - 12} Q ${pt.x + 8} ${pt.y - 13.5} ${pt.x + 15} ${pt.y - 10.5} L ${pt.x + 15} ${pt.y - 7} Q ${pt.x + 8} ${pt.y - 9} ${pt.x} ${pt.y - 8} Z`}
          fill={c2}
        />
      </g>
    );
  };

  const renderPyro = (
    u: number,
    v: number,
    z: number,
    glowCol: string,
    smokeCol: string,
    idx: number,
    boost = false
  ) => {
    const pt = project(u, v, z);
    return (
      <g key={`pyro-${idx}`}>
        <circle
          cx={pt.x + (idx % 2 === 0 ? 4 : -4)}
          cy={pt.y - 12}
          r={boost ? 12 : 9}
          fill={smokeCol}
          className="fms-smoke-rise"
          style={{ animationDelay: `${idx * 0.45}s` }}
        />
        <circle
          cx={pt.x}
          cy={pt.y - 6}
          r={boost ? 8.5 : 6.2}
          fill="#E2E8F0"
          className="fms-smoke-rise"
          style={{ animationDelay: `${idx * 0.45 + 0.55}s` }}
        />
        <circle
          cx={pt.x}
          cy={pt.y}
          r={boost ? 7.8 : 5.5}
          fill={glowCol}
          opacity="0.78"
          className="fms-pyro-glow"
          style={{ animationDelay: `${idx * 0.2}s` }}
        />
        <circle cx={pt.x} cy={pt.y} r={boost ? 2.5 : 2.0} fill="#FEF9C3" />
      </g>
    );
  };

  // Creative Fan-Section Renderers — 100% locked to club colors (bannerTheme.primary & bannerTheme.secondary)
  const renderCreativeTifoMosaic = () => {
    const uOuter = -(standBaseU + 3 + standGeom.standDepth * 0.78);
    const uInner = -(standBaseU + 3 + standGeom.standDepth * 0.22);
    const zOuter = standGeom.tierHeight * 0.78;
    const zInner = standGeom.tierHeight * 0.26;
    const spanV = straightHalfV * 1.56;
    const op = fanSectionConfig.tifoOpacity;

    if (fanSectionConfig.tifoPattern === 'checkered_wall') {
      const cols = 6;
      const rows = 2;
      const segV = spanV / cols;
      const tiles: React.ReactNode[] = [];
      for (let r = 0; r < rows; r++) {
        const uA = uOuter + ((uInner - uOuter) * r) / rows;
        const uB = uOuter + ((uInner - uOuter) * (r + 1)) / rows;
        const zA = zOuter + ((zInner - zOuter) * r) / rows;
        const zB = zOuter + ((zInner - zOuter) * (r + 1)) / rows;
        for (let c = 0; c < cols; c++) {
          const vA = -spanV / 2 + c * segV;
          const vB = vA + segV;
          const tileCol = (r + c) % 2 === 0 ? bannerTheme.primary : bannerTheme.secondary;
          tiles.push(
            <polygon
              key={`tifo-chk-${r}-${c}`}
              points={polyUV(uA, uB, vA + 0.8, vB - 0.8, zA, zB, zB, zA)}
              fill={tileCol}
              opacity={op}
            />
          );
        }
      }
      return <g data-testid="curva-tifo-mosaic" data-tifo-pattern="checkered_wall">{tiles}</g>;
    }

    if (fanSectionConfig.tifoPattern === 'sunburst_rays') {
      const rayCount = 7;
      const centerPt = project(uInner + 1.5, 0, zInner);
      const rays = Array.from({ length: rayCount }).map((_, idx) => {
        const vA = -spanV / 2 + (idx / rayCount) * spanV;
        const vB = -spanV / 2 + ((idx + 1) / rayCount) * spanV;
        const pA = project(uOuter, vA, zOuter);
        const pB = project(uOuter, vB, zOuter);
        return (
          <polygon
            key={`tifo-ray-${idx}`}
            points={ptsStr([centerPt, pA, pB])}
            fill={idx % 2 === 0 ? bannerTheme.primary : bannerTheme.secondary}
            opacity={op}
          />
        );
      });
      return <g data-testid="curva-tifo-mosaic" data-tifo-pattern="sunburst_rays">{rays}</g>;
    }

    if (fanSectionConfig.tifoPattern === 'chevron_wave') {
      const bands = 4;
      const vHalf = spanV / 2;
      const chevrons = Array.from({ length: bands }).map((_, idx) => {
        const tA = idx / bands;
        const tB = (idx + 1) / bands;
        const uA = uOuter + (uInner - uOuter) * tA;
        const uB = uOuter + (uInner - uOuter) * tB;
        const zA = zOuter + (zInner - zOuter) * tA;
        const zB = zOuter + (zInner - zOuter) * tB;
        const uTipA = uA + (uInner - uOuter) * 0.14;
        const uTipB = uB + (uInner - uOuter) * 0.14;
        const zTipA = zA + (zInner - zOuter) * 0.14;
        const zTipB = zB + (zInner - zOuter) * 0.14;
        const pts = [
          project(uA, -vHalf, zA),
          project(uTipA, 0, zTipA),
          project(uA, vHalf, zA),
          project(uB, vHalf, zB),
          project(uTipB, 0, zTipB),
          project(uB, -vHalf, zB),
        ];
        return (
          <polygon
            key={`tifo-chv-${idx}`}
            points={ptsStr(pts)}
            fill={idx % 2 === 0 ? bannerTheme.primary : bannerTheme.secondary}
            opacity={op}
          />
        );
      });
      return <g data-testid="curva-tifo-mosaic" data-tifo-pattern="chevron_wave">{chevrons}</g>;
    }

    if (fanSectionConfig.tifoPattern === 'giant_jersey') {
      const uMid = (uOuter + uInner) / 2;
      const zMid = (zOuter + zInner) / 2;
      const bodyV = Math.min(straightHalfV * 0.42, 42);
      const sleeveV = Math.min(straightHalfV * 0.68, 66);
      const uShoulder = uOuter + (uInner - uOuter) * 0.18;
      const zShoulder = zOuter + (zInner - zOuter) * 0.18;
      const uSleeveBot = uOuter + (uInner - uOuter) * 0.48;
      const zSleeveBot = zOuter + (zInner - zOuter) * 0.48;
      const jerseyPts = [
        project(uOuter, -bodyV * 0.82, zOuter),
        project(uShoulder, -sleeveV, zShoulder),
        project(uSleeveBot, -sleeveV * 0.92, zSleeveBot),
        project(uSleeveBot, -bodyV, zSleeveBot),
        project(uInner, -bodyV, zInner),
        project(uInner, bodyV, zInner),
        project(uSleeveBot, bodyV, zSleeveBot),
        project(uSleeveBot, sleeveV * 0.92, zSleeveBot),
        project(uShoulder, sleeveV, zShoulder),
        project(uOuter, bodyV * 0.82, zOuter),
      ];
      const badgePt = project(uMid, 0, zMid);
      const vLeft = project(uMid, -bodyV, zMid);
      const vRight = project(uMid, bodyV, zMid);
      const ang = lineAngleDeg(vLeft, vRight);
      return (
        <g data-testid="curva-tifo-mosaic" data-tifo-pattern="giant_jersey">
          <polygon
            points={polyUV(uOuter, uInner, -spanV / 2, spanV / 2, zOuter, zInner, zInner, zOuter)}
            fill={bannerTheme.secondary}
            opacity={op * 0.45}
          />
          <polygon
            points={ptsStr(jerseyPts)}
            fill={bannerTheme.primary}
            stroke={bannerTheme.secondary}
            strokeWidth="1.2"
            opacity={Math.min(0.68, op + 0.18)}
          />
          <polygon
            points={polyUV(uOuter + 1, uInner - 1, -bodyV * 0.24, bodyV * 0.24, zOuter, zInner, zInner, zOuter)}
            fill={bannerTheme.secondary}
            opacity={Math.min(0.6, op + 0.12)}
          />
          <text
            x={badgePt.x}
            y={badgePt.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={bannerTheme.altBannerText}
            fontSize="8.5"
            fontWeight="900"
            transform={`rotate(${ang.toFixed(1)} ${badgePt.x.toFixed(1)} ${badgePt.y.toFixed(1)})`}
            opacity="0.92"
          >
            12
          </text>
        </g>
      );
    }

    // Default: 'club_stripes' (7 vertical club-colored stripes)
    const segCount = 7;
    const segSpan = spanV / segCount;
    return (
      <g data-testid="curva-tifo-mosaic" data-tifo-pattern="club_stripes">
        {Array.from({ length: segCount }).map((_, idx) => {
          const vA = -spanV / 2 + idx * segSpan;
          const vB = vA + segSpan;
          const tileCol = idx % 2 === 0 ? bannerTheme.primary : bannerTheme.secondary;
          return (
            <polygon
              key={`tifo-seg-${idx}`}
              points={polyUV(uOuter, uInner, vA + 0.9, vB - 0.9, zOuter, zInner, zInner, zOuter)}
              fill={tileCol}
              opacity={op}
            />
          );
        })}
      </g>
    );
  };

  const renderRailMiniBanners = (banners: RailMiniBanner[], axis: 'home' | 'top') => {
    const testId = axis === 'home' ? 'home-rail-banners' : 'top-stand-rail-banners';
    return (
      <g data-testid={testId}>
        {banners.map((b) => {
          const fillCol = b.inverted ? bannerTheme.secondary : bannerTheme.primary;
          const accentCol = b.inverted ? bannerTheme.primary : bannerTheme.secondary;
          const textCol = b.inverted ? bannerTheme.altBannerText : bannerTheme.bannerText;

          if (axis === 'home') {
            const halfW = Math.min(18, Math.max(10, straightHalfV * 0.145));
            const vC = straightHalfV * 0.84 * b.vFrac;
            const vA = vC - halfW;
            const vB = vC + halfW;
            const uTop = -(standBaseU + 1.1);
            const uBot = -(standBaseU - 2.2);
            const pL = project((uTop + uBot) / 2, vA, 4.2);
            const pR = project((uTop + uBot) / 2, vB, 4.2);
            const midX = (pL.x + pR.x) / 2;
            const midY = (pL.y + pR.y) / 2;
            const ang = lineAngleDeg(pL, pR);
            const normAng = ang > 90 || ang < -90 ? ang + 180 : ang;

            return (
              <g key={b.id} data-banner-fill={fillCol}>
                <polygon
                  points={polyUV(uTop, uBot, vA, vB, 6.2, 2.3, 2.3, 6.2)}
                  fill={fillCol}
                  stroke={accentCol}
                  strokeWidth={b.style === 'bordered' ? '1.1' : '0.65'}
                />
                {b.style === 'striped' && (
                  <polygon
                    points={polyUV(uTop, uBot, vC - halfW * 0.34, vC + halfW * 0.34, 6.2, 2.3, 2.3, 6.2)}
                    fill={accentCol}
                    opacity="0.88"
                  />
                )}
                {b.style === 'chevron' && (
                  <polygon
                    points={ptsStr([
                      project(uTop, vA + halfW * 0.25, 6.2),
                      project(uBot, vC, 2.3),
                      project(uTop, vB - halfW * 0.25, 6.2),
                    ])}
                    fill={accentCol}
                    opacity="0.82"
                  />
                )}
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={b.style === 'striped' ? (b.inverted ? bannerTheme.bannerText : bannerTheme.altBannerText) : textCol}
                  fontSize="3.4"
                  fontWeight="900"
                  letterSpacing="0.3"
                  transform={`rotate(${normAng.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)})`}
                >
                  {b.label}
                </text>
              </g>
            );
          }

          // Top opposite stand hanging parapet banners
          const halfW = Math.min(26, Math.max(14, straightHalfU * 0.135));
          const uC = straightHalfU * 0.86 * b.vFrac;
          const uA = uC - halfW;
          const uB = uC + halfW;
          const vWall = -standBaseV;
          const pL = project(uA, vWall, 2.2);
          const pR = project(uB, vWall, 2.2);
          const midX = (pL.x + pR.x) / 2;
          const midY = (pL.y + pR.y) / 2;
          const ang = lineAngleDeg(pL, pR);
          const normAng = ang > 90 || ang < -90 ? ang + 180 : ang;

          return (
            <g key={b.id} data-banner-fill={fillCol}>
              <polygon
                points={polyUV(uA, uB, vWall, vWall, 4.1, 4.1, 0.3, 0.3)}
                fill={fillCol}
                stroke={accentCol}
                strokeWidth={b.style === 'bordered' ? '1.0' : '0.6'}
              />
              {b.style === 'striped' && (
                <polygon
                  points={polyUV(uC - halfW * 0.32, uC + halfW * 0.32, vWall, vWall, 4.1, 4.1, 0.3, 0.3)}
                  fill={accentCol}
                  opacity="0.88"
                />
              )}
              {b.style === 'chevron' && (
                <polygon
                  points={ptsStr([
                    project(uA + halfW * 0.28, vWall, 4.1),
                    project(uC, vWall, 0.4),
                    project(uB - halfW * 0.28, vWall, 4.1),
                  ])}
                  fill={accentCol}
                  opacity="0.82"
                />
              )}
              <text
                x={midX}
                y={midY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={b.style === 'striped' ? (b.inverted ? bannerTheme.bannerText : bannerTheme.altBannerText) : textCol}
                fontSize="3.2"
                fontWeight="900"
                letterSpacing="0.3"
                transform={`rotate(${normAng.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)})`}
              >
                {b.label}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  const renderTwoPoleBanner = (spec: TwoPoleBannerSpec, idx: number) => {
    const u = -(standBaseU + 2 + standGeom.standDepth * spec.uRatio);
    const v = straightHalfV * 0.86 * spec.vFrac;
    const z = standGeom.tierHeight * (0.14 + spec.uRatio * 0.82);
    const pt = project(u, v, z);
    const bg = spec.inverted ? bannerTheme.secondary : bannerTheme.primary;
    const fg = spec.inverted ? bannerTheme.primary : bannerTheme.secondary;
    const txtCol = spec.inverted ? bannerTheme.altBannerText : bannerTheme.bannerText;
    const w = 11.4;
    const h = 8.4;
    const x0 = pt.x - w / 2;
    const y0 = pt.y - 13.2;

    return (
      <g
        key={spec.id}
        className="fms-crowd-bob"
        style={{ animationDelay: `${(idx % 4) * 0.22}s` }}
        data-banner-fill={bg}
      >
        <line x1={x0 + 0.6} y1={pt.y + 1} x2={x0 + 0.6} y2={y0} stroke="#F8FAFC" strokeWidth="0.95" />
        <line x1={x0 + w - 0.6} y1={pt.y + 1} x2={x0 + w - 0.6} y2={y0} stroke="#F8FAFC" strokeWidth="0.95" />
        <rect
          x={x0}
          y={y0}
          width={w}
          height={h}
          rx="1.1"
          fill={bg}
          stroke={fg}
          strokeWidth="0.7"
        />
        {spec.motif === 'stripes' && (
          <>
            <rect x={x0 + w * 0.25} y={y0 + 0.4} width={w * 0.2} height={h - 0.8} fill={fg} />
            <rect x={x0 + w * 0.62} y={y0 + 0.4} width={w * 0.2} height={h - 0.8} fill={fg} />
          </>
        )}
        {spec.motif === 'checker' && (
          <>
            <rect x={x0 + 0.5} y={y0 + 0.5} width={(w - 1) / 2} height={(h - 1) / 2} fill={fg} />
            <rect x={x0 + w / 2} y={y0 + h / 2} width={(w - 1) / 2} height={(h - 1) / 2} fill={fg} />
          </>
        )}
        {spec.motif === 'chevron' && (
          <polyline
            points={`${x0 + 1.5},${y0 + 2.2} ${x0 + w / 2},${y0 + h - 2} ${x0 + w - 1.5},${y0 + 2.2}`}
            fill="none"
            stroke={fg}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {spec.motif === 'star' && (
          <polygon
            points={`${pt.x},${y0 + 1.4} ${pt.x + 1.1},${y0 + 3.4} ${pt.x + 3.3},${y0 + 3.7} ${pt.x + 1.6},${y0 + 5.1} ${pt.x + 2.1},${y0 + 7.2} ${pt.x},${y0 + 6.1} ${pt.x - 2.1},${y0 + 7.2} ${pt.x - 1.6},${y0 + 5.1} ${pt.x - 3.3},${y0 + 3.7} ${pt.x - 1.1},${y0 + 3.4}`}
            fill={fg}
          />
        )}
        {spec.motif === 'jersey12' && (
          <text
            x={pt.x}
            y={y0 + h / 2 + 0.3}
            textAnchor="middle"
            dominantBaseline="central"
            fill={txtCol}
            fontSize="5.0"
            fontWeight="900"
          >
            12
          </text>
        )}
      </g>
    );
  };

  const renderCapoDrumSection = () => {
    const capoPt = project(-(standBaseU + 3.4), 0, 7.6);
    const drumL = project(-(standBaseU + 4.4), -13, 8.2);
    const drumR = project(-(standBaseU + 4.4), 13, 8.2);
    return (
      <g data-testid="capo-drum-section">
        {[drumL, drumR].map((dPt, i) => (
          <g key={`drum-${i}`}>
            <circle
              cx={dPt.x}
              cy={dPt.y}
              r="5.2"
              fill="none"
              stroke={bannerTheme.secondary}
              strokeWidth="0.9"
              className="fms-beacon-pulse"
              style={{ animationDelay: `${i * 0.55}s` }}
            />
            <ellipse
              cx={dPt.x}
              cy={dPt.y}
              rx="3.1"
              ry="2.2"
              fill={bannerTheme.primary}
              stroke={bannerTheme.secondary}
              strokeWidth="0.85"
            />
            <ellipse cx={dPt.x} cy={dPt.y - 0.5} rx="2.1" ry="1.2" fill="#FFFFFF" opacity="0.85" />
          </g>
        ))}
        {/* Capo Podium Stand + Megaphone Silhouette */}
        <rect
          x={capoPt.x - 4.2}
          y={capoPt.y - 1.4}
          width="8.4"
          height="3.2"
          rx="0.9"
          fill={bannerTheme.primary}
          stroke={bannerTheme.secondary}
          strokeWidth="0.8"
        />
        <circle cx={capoPt.x} cy={capoPt.y - 3.6} r="1.7" fill={bannerTheme.secondary} stroke="#0F172A" strokeWidth="0.35" />
        <polygon
          points={`${capoPt.x + 1.4},${capoPt.y - 3.8} ${capoPt.x + 5.2},${capoPt.y - 5.4} ${capoPt.x + 5.2},${capoPt.y - 2.3}`}
          fill={bannerTheme.secondary}
          stroke={bannerTheme.primary}
          strokeWidth="0.4"
        />
      </g>
    );
  };

  const renderPennantGarland = () => {
    const uLine = -(standBaseU + 2 + standGeom.standDepth * 0.24);
    const zLine = standGeom.tierHeight * 0.34 + 6.5;
    const count = 9;
    const vSpan = straightHalfV * 0.82;
    const linePts: Pt2[] = [];
    const pennants: React.ReactNode[] = [];
    for (let i = 0; i <= count; i++) {
      const frac = i / count;
      const v = -vSpan + frac * (vSpan * 2);
      const sag = Math.sin(frac * Math.PI) * 3.2;
      linePts.push(project(uLine, v, zLine - sag));
    }
    for (let i = 0; i < count; i++) {
      const a = linePts[i];
      const b = linePts[i + 1];
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2 + 5.4;
      const col = i % 2 === 0 ? bannerTheme.primary : bannerTheme.secondary;
      pennants.push(
        <polygon
          key={`pennant-${i}`}
          points={`${a.x.toFixed(1)},${a.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`}
          fill={col}
          stroke="rgba(15,23,42,0.28)"
          strokeWidth="0.35"
        />
      );
    }
    return (
      <g data-testid="pennant-garland">
        <polyline
          points={ptsStr(linePts)}
          fill="none"
          stroke={bannerTheme.secondary}
          strokeWidth="0.75"
          opacity="0.9"
        />
        {pennants}
      </g>
    );
  };

  const renderTickerConfetti = () => {
    const spots = [
      { u: 0.32, v: -0.62 },
      { u: 0.56, v: -0.44 },
      { u: 0.26, v: -0.18 },
      { u: 0.64, v: -0.06 },
      { u: 0.42, v: 0.14 },
      { u: 0.72, v: 0.34 },
      { u: 0.30, v: 0.56 },
      { u: 0.54, v: 0.66 },
    ];
    return (
      <g data-testid="ticker-confetti" pointerEvents="none">
        {spots.map((sp, idx) => {
          const pt = project(
            -(standBaseU + 2 + standGeom.standDepth * sp.u),
            straightHalfV * 0.84 * sp.v,
            standGeom.tierHeight * (0.28 + sp.u * 0.72) + 8
          );
          const col = idx % 2 === 0 ? bannerTheme.primary : bannerTheme.secondary;
          return (
            <rect
              key={`conf-${idx}`}
              x={pt.x - 1.5}
              y={pt.y - 1.1}
              width="3.0"
              height="1.9"
              rx="0.4"
              fill={col}
              stroke="rgba(15,23,42,0.25)"
              strokeWidth="0.25"
              className="fms-confetti-drift"
              style={{ animationDelay: `${idx * 0.31}s` }}
            />
          );
        })}
      </g>
    );
  };

  // Mowed stripes polygon strip helper
  const stripeCount = 10;
  const stripeStep = (P_U * 2) / stripeCount;

  const centerCirclePoints = useMemo(() => {
    const pts: Pt2[] = [];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      pts.push(project(Math.cos(a) * 36, Math.sin(a) * 36, 0));
    }
    return ptsStr(pts);
  }, [project]);

  const leftArcPoints = useMemo(() => {
    const pts: Pt2[] = [];
    for (let i = -8; i <= 8; i++) {
      const a = (i / 14) * (Math.PI * 0.44);
      pts.push(project(-166 + Math.cos(a) * 34, Math.sin(a) * 34, 0));
    }
    return ptsStr(pts);
  }, [project]);

  const rightArcPoints = useMemo(() => {
    const pts: Pt2[] = [];
    for (let i = -8; i <= 8; i++) {
      const a = Math.PI + (i / 14) * (Math.PI * 0.44);
      pts.push(project(166 + Math.cos(a) * 34, Math.sin(a) * 34, 0));
    }
    return ptsStr(pts);
  }, [project]);

  // HUD mode flags
  const isInteractiveMatchMode = Boolean(onSimulateSeason);
  const statusBadgeText = isLive
    ? `Live · MD ${currentMatchday}/${totalMatchdays}`
    : supercupEligibility
    ? 'Final'
    : 'Matchday';
  const contextPillText = supercupEligibility
    ? supercupEligibility.cupName
    : seasonPhase === 'mid'
    ? `2nd half · MD ${Math.floor(totalMatchdays / 2) + 1}–${totalMatchdays}`
    : `1st half · MD 1–${Math.max(1, Math.floor(totalMatchdays / 2))}`;
  const scoreboardPhaseText = isLive
    ? `Live MD ${currentMatchday}`
    : supercupEligibility
    ? 'Supercup Final'
    : seasonPhase === 'mid'
    ? 'Second half'
    : 'First half';

  const renderCameraIcon = (id: CameraAngle) => {
    if (id === 'isometric') {
      return (
        <svg viewBox="0 0 24 18" className="w-5 h-3.5" fill="none">
          <polygon
            points="12,2 22,9 12,16 2,9"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="7" y1="5.5" x2="17" y2="12.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    }
    if (id === 'topdown') {
      return (
        <svg viewBox="0 0 24 18" className="w-5 h-3.5" fill="none">
          <rect
            x="3"
            y="2.5"
            width="18"
            height="13"
            rx="1.5"
            fill="currentColor"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="12" y1="2.5" x2="12" y2="15.5" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="12" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    }
    if (id === 'endzone') {
      return (
        <svg viewBox="0 0 24 18" className="w-5 h-3.5" fill="none">
          <polygon
            points="6,3 18,3 22,15 2,15"
            fill="currentColor"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="4" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="12" cy="9" r="1.8" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    }
    return <i className="fa-solid fa-magnifying-glass-plus text-[11px]" />;
  };

  const renderGoal = (uPos: number, outwardDir: -1 | 1) => {
    const uOuter = uPos + outwardDir * 12;
    const h = 12;
    const gHalf = 22;
    const pFL = project(uPos, -gHalf, 0);
    const pFR = project(uPos, gHalf, 0);
    const pTL = project(uPos, -gHalf, h);
    const pTR = project(uPos, gHalf, h);
    const bBL = project(uOuter, -gHalf, 0);
    const bBR = project(uOuter, gHalf, 0);
    const bTL = project(uOuter, -gHalf, h - 2);
    const bTR = project(uOuter, gHalf, h - 2);
    return (
      <g>
        <polygon
          points={ptsStr([pTL, pTR, bTR, bTL])}
          fill="rgba(255,255,255,0.22)"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="0.95"
        />
        <polygon
          points={ptsStr([pFL, bBL, bTL, pTL])}
          fill="rgba(255,255,255,0.16)"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="0.95"
        />
        <polygon
          points={ptsStr([pFR, bBR, bTR, pTR])}
          fill="rgba(255,255,255,0.16)"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="0.95"
        />
        <polyline
          points={ptsStr([pFL, pTL, pTR, pFR])}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
      </g>
    );
  };

  // Memoize static stand spectator geometry once per stadium/attendance/camera state (zero sub-tick DOM rebuilds)
  const upperAndEndBlocks = useMemo(() => {
    const topStandZMax = standGeom.tierHeight + (standGeom.hasUpperRing ? 5 : 0);
    const cornerMaskBase = standGeom.isRoundedBowl
      ? {
          iu: straightHalfU,
          iv: straightHalfV,
          rMin: bowlInnerR + 2.5,
          rMax: bowlInnerR + standGeom.standDepth * 0.94,
        }
      : undefined;
    const cornerUOuter = straightHalfU + (standGeom.isRoundedBowl ? bowlInnerR + standGeom.standDepth * 0.94 : standGeom.standDepth * 0.92);
    const cornerUInner = standGeom.isRoundedBowl ? straightHalfU : standBaseU + 2;
    const cornerVOuter = straightHalfV + (standGeom.isRoundedBowl ? bowlInnerR + standGeom.standDepth * 0.94 : standGeom.standDepth * 0.92);
    const cornerVInner = standGeom.isRoundedBowl ? straightHalfV : standBaseV + 2;
    const miterCornerFill = seatProfile.cornerFill;
    const topLeftFillStart = Math.min(1, seatProfile.cornerFill * 0.90 + seatProfile.oppositeWingFill * 0.10);
    const topLeftFillEnd = Math.min(1, seatProfile.cornerFill * 0.78 + homeCurvaEffectiveFill * 0.22);
    const topRightFillStart = Math.min(1, seatProfile.cornerFill * 0.92 + seatProfile.oppositeWingFill * 0.08);
    const topRightFillEnd = Math.min(1, seatProfile.cornerFill * 0.88 + seatProfile.awayEndFill * 0.12);

    return {
      topStand: buildSpectatorBlock(
        -(topStandHalfU - 2),
        topStandHalfU - 2,
        -(standBaseV + 2 + standGeom.standDepth * 0.92),
        -(standBaseV + 2),
        standGeom.isAmateurGround ? Math.min(34, standGeom.sideCols) : standGeom.sideCols,
        standGeom.isAmateurGround ? Math.min(6, standGeom.sideRows) : standGeom.sideRows,
        4,
        topStandZMax,
        'v-',
        standGeom.isAmateurGround ? Math.min(1, Math.max(topSidelineFill, homeCurvaEffectiveFill)) : topSidelineFill,
        palette.primary,
        palette.secondary,
        true,
        false,
        'side',
        undefined,
        sidelineAisles,
        seatProfile.oppositeWingFill
      ),
      topLeftCorner: standGeom.hasCorners
        ? buildSpectatorBlock(
            -cornerUOuter,
            -cornerUInner,
            -cornerVOuter,
            -cornerVInner,
            standGeom.cornerCols,
            standGeom.cornerRows,
            4,
            standGeom.tierHeight,
            'v-',
            miterCornerFill,
            palette.primary,
            palette.secondary,
            false,
            false,
            'home',
            cornerMaskBase
              ? {
                  ...cornerMaskBase,
                  zMinStart: 4,
                  zMinEnd: 4,
                  zMaxStart: topStandZMax,
                  zMaxEnd: standGeom.tierHeight,
                  fillStart: topLeftFillStart,
                  fillEnd: topLeftFillEnd,
                }
              : undefined,
            undefined,
            undefined,
            !cornerMaskBase,
            !cornerMaskBase
              ? [
                  Math.max(
                    standGeom.tierHeight +
                      (standGeom.capacityTier === 'colossus'
                        ? 16
                        : standGeom.isMegaArena
                        ? 12
                        : standGeom.hasUpperRing
                        ? 7
                        : 0),
                    standGeom.tierHeight +
                      (standGeom.capacityTier === 'colossus'
                        ? 14
                        : standGeom.isMegaArena
                        ? 10
                        : standGeom.hasUpperRing
                        ? 5
                        : 0)
                  ),
                  standGeom.tierHeight +
                    (standGeom.capacityTier === 'colossus'
                      ? 16
                      : standGeom.isMegaArena
                      ? 12
                      : standGeom.hasUpperRing
                      ? 7
                      : 0),
                  4,
                  standGeom.tierHeight +
                    (standGeom.capacityTier === 'colossus'
                      ? 14
                      : standGeom.isMegaArena
                      ? 10
                      : standGeom.hasUpperRing
                      ? 5
                      : 0),
                ]
              : undefined
          )
        : null,
      topRightCorner: standGeom.hasCorners
        ? buildSpectatorBlock(
            cornerUInner,
            cornerUOuter,
            -cornerVOuter,
            -cornerVInner,
            standGeom.cornerCols,
            standGeom.cornerRows,
            4,
            rightTierHeight,
            'v-',
            miterCornerFill,
            standGeom.isRoundedBowl ? palette.primary : oppPalette.primary,
            standGeom.isRoundedBowl ? palette.secondary : '#E2E8F0',
            false,
            false,
            standGeom.isRoundedBowl ? 'side' : 'away',
            cornerMaskBase
              ? {
                  ...cornerMaskBase,
                  zMinStart: 4,
                  zMinEnd: 3,
                  zMaxStart: topStandZMax,
                  zMaxEnd: rightTierHeight,
                  fillStart: topRightFillStart,
                  fillEnd: topRightFillEnd,
                  awayWedgeStartT: 0.74,
                  awayPrimaryCol: oppPalette.primary,
                  awaySecondaryCol: oppPalette.secondary,
                }
              : undefined,
            undefined,
            undefined,
            !cornerMaskBase,
            !cornerMaskBase
              ? [
                  standGeom.tierHeight +
                    (standGeom.capacityTier === 'colossus'
                      ? 16
                      : standGeom.isMegaArena
                      ? 12
                      : standGeom.hasUpperRing
                      ? 7
                      : 0),
                  rightTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 1.5) : 0),
                  rightTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 1.5) : 0),
                  3.5,
                ]
              : undefined
          )
        : null,
      homeEnd: standGeom.hasHomeEndStand
        ? buildSpectatorBlock(
            -(standBaseU + 2 + standGeom.standDepth * 0.92),
            -(standBaseU + 2),
            -(homeStandHalfV - 3),
            homeStandHalfV - 3,
            standGeom.isSemiProGround ? Math.min(7, standGeom.endCols) : standGeom.endCols,
            standGeom.endRows,
            4,
            standGeom.isSemiProGround ? Math.round(standGeom.tierHeight * 0.72) : standGeom.tierHeight,
            'u-',
            homeCurvaEffectiveFill,
            palette.primary,
            palette.secondary,
            true,
            true,
            'home',
            undefined,
            endAisles
          )
        : null,
      awayEnd: standGeom.hasAwayEndStand
        ? buildSpectatorBlock(
            standBaseU + 2,
            standBaseU + 2 + standGeom.standDepth * 0.92,
            -(straightHalfV - 3),
            straightHalfV - 3,
            standGeom.endCols,
            standGeom.endRows,
            3,
            rightTierHeight,
            'u+',
            seatProfile.awayEndFill,
            oppPalette.primary,
            oppPalette.secondary,
            true,
            true,
            'away',
            undefined,
            endAisles
          )
        : null,
    };
  }, [
    project,
    standGeom,
    standBaseU,
    standBaseV,
    bowlInnerR,
    straightHalfU,
    straightHalfV,
    topStandHalfU,
    homeStandHalfV,
    topSidelineFill,
    seatProfile.oppositeWingFill,
    seatProfile.cornerFill,
    seatProfile.awayEndFill,
    homeCurvaEffectiveFill,
    palette,
    bannerTheme.spectatorTertiary,
    oppPalette,
    rightTierHeight,
    stadiumPolicy,
    isMatchdayActive,
    sidelineAisles,
    endAisles,
  ]);

  const foregroundBlocks = useMemo(() => {
    const bottomStandZMax = fgTierHeight + (standGeom.hasUpperRing ? 1.5 : 0);
    const cornerMaskBase = standGeom.isRoundedBowl
      ? {
          iu: straightHalfU,
          iv: straightHalfV,
          rMin: bowlInnerR + 2.5,
          rMax: bowlInnerR + standGeom.standDepth * 0.94,
        }
      : undefined;
    const cornerUOuter = straightHalfU + (standGeom.isRoundedBowl ? bowlInnerR + standGeom.standDepth * 0.94 : standGeom.standDepth * 0.92);
    const cornerUInner = standGeom.isRoundedBowl ? straightHalfU : standBaseU + 2;
    const cornerVOuter = straightHalfV + (standGeom.isRoundedBowl ? bowlInnerR + standGeom.standDepth * 0.94 : standGeom.standDepth * 0.92);
    const cornerVInner = standGeom.isRoundedBowl ? straightHalfV : standBaseV + 2;
    const miterCornerFill = seatProfile.cornerFill;
    const bottomLeftFillStart = Math.min(1, seatProfile.cornerFill * 0.90 + seatProfile.mainWingFill * 0.10);
    const bottomLeftFillEnd = Math.min(1, seatProfile.cornerFill * 0.78 + homeCurvaEffectiveFill * 0.22);
    const bottomRightFillStart = Math.min(1, seatProfile.cornerFill * 0.92 + seatProfile.mainWingFill * 0.08);
    const bottomRightFillEnd = Math.min(1, seatProfile.cornerFill * 0.88 + seatProfile.awayEndFill * 0.12);

    return {
      bottomLeftCorner: standGeom.hasCorners
        ? buildSpectatorBlock(
            -cornerUOuter,
            -cornerUInner,
            cornerVInner,
            cornerVOuter,
            standGeom.cornerCols,
            standGeom.cornerRows,
            2,
            fgTierHeight,
            'v+',
            miterCornerFill,
            palette.primary,
            palette.secondary,
            false,
            false,
            'home',
            cornerMaskBase
              ? {
                  ...cornerMaskBase,
                  zMinStart: 2,
                  zMinEnd: 4,
                  zMaxStart: bottomStandZMax,
                  zMaxEnd: standGeom.tierHeight,
                  fillStart: bottomLeftFillStart,
                  fillEnd: bottomLeftFillEnd,
                }
              : undefined,
            undefined,
            undefined,
            !cornerMaskBase,
            !cornerMaskBase
              ? [
                  standGeom.tierHeight +
                    (standGeom.capacityTier === 'colossus'
                      ? 14
                      : standGeom.isMegaArena
                      ? 10
                      : standGeom.hasUpperRing
                      ? 5
                      : 0),
                  2,
                  fgTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 2) : 0),
                  fgTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 2) : 0),
                ]
              : undefined
          )
        : null,
      bottomRightCorner: standGeom.hasCorners
        ? buildSpectatorBlock(
            cornerUInner,
            cornerUOuter,
            cornerVInner,
            cornerVOuter,
            standGeom.cornerCols,
            standGeom.cornerRows,
            2,
            fgTierHeight,
            'v+',
            miterCornerFill,
            palette.primary,
            palette.secondary,
            false,
            false,
            'side',
            cornerMaskBase
              ? {
                  ...cornerMaskBase,
                  zMinStart: 2,
                  zMinEnd: 3,
                  zMaxStart: bottomStandZMax,
                  zMaxEnd: rightTierHeight,
                  fillStart: bottomRightFillStart,
                  fillEnd: bottomRightFillEnd,
                }
              : undefined,
            undefined,
            undefined,
            !cornerMaskBase,
            !cornerMaskBase
              ? [
                  2.5,
                  rightTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 1.5) : 0),
                  fgTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 2) : 0),
                  fgTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 2) : 0),
                ]
              : undefined
          )
        : null,
      bottomStand: standGeom.hasBottomStand
        ? buildSpectatorBlock(
            -(straightHalfU - 2),
            straightHalfU - 2,
            standBaseV + 2,
            standBaseV + 2 + standGeom.standDepth * 0.92,
            standGeom.sideCols,
            standGeom.sideRows,
            2,
            bottomStandZMax,
            'v+',
            bottomSidelineFill,
            palette.primary,
            palette.secondary,
            true,
            false,
            'side',
            undefined,
            sidelineAisles,
            seatProfile.mainWingFill
          )
        : null,
    };
  }, [
    project,
    standGeom,
    standBaseU,
    standBaseV,
    bowlInnerR,
    straightHalfU,
    straightHalfV,
    fgTierHeight,
    rightTierHeight,
    seatProfile.mainWingFill,
    seatProfile.cornerFill,
    seatProfile.awayEndFill,
    homeCurvaEffectiveFill,
    bottomSidelineFill,
    palette,
    bannerTheme.spectatorTertiary,
    stadiumPolicy,
    isMatchdayActive,
    sidelineAisles,
  ]);

  const renderAmateurRailSpectators = (side: 'home' | 'bottom') => {
    if (!isMatchdayActive || seatProfile.totalRatio <= 0.02) return null;
    const fanCount = Math.max(5, Math.min(24, Math.round(seatProfile.totalRatio * (side === 'bottom' ? 24 : 14))));
    const nodes: React.ReactNode[] = [];
    for (let i = 0; i < fanCount; i++) {
      const t = (i + 0.5) / fanCount;
      const spread = (t * 2 - 1) * 0.76;
      const jitter = (((i * 19 + 7) % 9) - 4) * 1.4;
      const u = side === 'bottom' ? spread * P_U + jitter : -(standBaseU + 8.5 + (i % 3) * 3.4);
      const v = side === 'bottom' ? standBaseV + 9.5 + (i % 2) * 4.2 : spread * P_V * 0.78 + jitter;
      const pt = project(u, v, 1.8);
      const col = i % 3 === 0 ? palette.secondary : i % 4 === 0 ? '#475569' : palette.primary;
      const skin = SKIN_TONES[(i * 5 + 2) % SKIN_TONES.length];
      nodes.push(
        <g key={`am-fan-${side}-${i}`}>
          <circle cx={pt.x} cy={pt.y} r="2.8" fill={col} stroke="rgba(15,23,42,0.5)" strokeWidth="0.5" />
          <circle cx={pt.x} cy={pt.y - 2.3} r="1.6" fill={skin} />
        </g>
      );
    }
    return <g data-testid={`amateur-standing-fans-${side}`}>{nodes}</g>;
  };

  const memoizedUpperAndEndCrowd = (
    <>
      {/* Top Opposite / Main Stand */}
      {renderAnimatedSpectatorBlock(upperAndEndBlocks.topStand)}

      {/* Corners (Top-Left, Top-Right) */}
      {(upperAndEndBlocks.topLeftCorner || upperAndEndBlocks.topRightCorner) && (
        <g opacity="0.94">
          {upperAndEndBlocks.topLeftCorner && renderAnimatedSpectatorBlock(upperAndEndBlocks.topLeftCorner)}
          {upperAndEndBlocks.topRightCorner && renderAnimatedSpectatorBlock(upperAndEndBlocks.topRightCorner)}
        </g>
      )}

      {/* HOME END SUPPORTERS (Left / SW Goal): Present on 5k+ grounds; Amateur <5k has standing grass-rail fans instead */}
      {standGeom.hasHomeEndStand && upperAndEndBlocks.homeEnd ? (
        <g
          data-testid="home-supporters-end"
          data-fan-vibrancy={fanSectionConfig.vibrancyLevel}
          data-creative-fan-sections={String(fanSectionConfig.creativeFanSectionsEnabled)}
        >
          {/* Per-Club Creative Tifo Choreography Mosaic (Balanced Tradition & Fortress Curva only, 10k+ bowls) */}
          {isMatchdayActive &&
            !standGeom.isSemiProGround &&
            fanSectionConfig.creativeFanSectionsEnabled &&
            homeCurvaEffectiveFill > 0.15 &&
            renderCreativeTifoMosaic()}

          {renderAnimatedSpectatorBlock(upperAndEndBlocks.homeEnd)}

          {/* Home Terrace Front Wall Parapet (ALWAYS locked to club colors across all Fan Strategies) */}
          <g data-testid="home-terrace-parapet">
            <polygon
              points={polyUV(-(standBaseU + 1.5), -(standBaseU - 2.5), -homeStandHalfV * 0.84, homeStandHalfV * 0.84, 6.5, 2, 2, 6.5)}
              fill={bannerTheme.primary}
              stroke="rgba(255,255,255,0.62)"
              strokeWidth="0.9"
              data-testid="home-parapet-primary"
            />
            <polygon
              points={polyUV(-(standBaseU + 1.5), -(standBaseU - 2.5), -homeStandHalfV * 0.38, homeStandHalfV * 0.38, 6.5, 2, 2, 6.5)}
              fill={bannerTheme.secondary}
              opacity="0.92"
              data-testid="home-parapet-secondary"
            />
          </g>

          {/* Draped Club Fan-Club Mini-Banners along the Home End Front Rail (Balanced Tradition & Fortress Curva only) */}
          {fanSectionConfig.railMiniBanners.length > 0 &&
            renderRailMiniBanners(fanSectionConfig.railMiniBanners, 'home')}

          {/* Creative Home End Club-Crested Terrace Banner Ribbon (Balanced Tradition & Fortress Curva only) */}
          {isMatchdayActive && !standGeom.isSemiProGround && fanSectionConfig.creativeFanSectionsEnabled && (
            <g data-testid="curva-stand-banner">
              <polygon
                points={polyUV(
                  -(standBaseU + 2 + standGeom.standDepth * 0.28),
                  -(standBaseU + 2 + standGeom.standDepth * 0.06),
                  -curvaBannerSpanV,
                  curvaBannerSpanV,
                  standGeom.tierHeight * 0.34,
                  standGeom.tierHeight * 0.14,
                  standGeom.tierHeight * 0.14,
                  standGeom.tierHeight * 0.34
                )}
                fill={bannerTheme.bannerFill}
                stroke={bannerTheme.bannerStroke}
                strokeWidth="1.05"
                opacity="0.96"
                data-testid="curva-stand-banner-bg"
              />
              <g
                transform={`translate(${curvaBannerLayout.midX.toFixed(1)}, ${curvaBannerLayout.midY.toFixed(1)}) rotate(${curvaBannerLayout.angleDeg.toFixed(2)})`}
              >
                <foreignObject
                  x={curvaBannerLayout.logoX}
                  y={curvaBannerLayout.logoY}
                  width={curvaBannerLayout.logoSize}
                  height={curvaBannerLayout.logoSize}
                  style={{ overflow: 'visible' }}
                >
                  <div
                    data-testid="curva-banner-logo"
                    className="w-full h-full flex items-center justify-center"
                  >
                    <ClubLogo
                      club={club}
                      isModActive={isModActive}
                      size={Math.max(7, Math.round(curvaBannerLayout.logoSize))}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </foreignObject>
                <text
                  x={curvaBannerLayout.textX}
                  y={curvaBannerLayout.textY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={bannerTheme.bannerText}
                  fontSize={curvaBannerLayout.fontSize}
                  fontWeight="900"
                  letterSpacing={curvaBannerLayout.letterSpacing}
                  data-testid="curva-stand-banner-text"
                >
                  {fanSectionConfig.curvaBannerTitle}
                </text>
              </g>
            </g>
          )}

          {/* Raised European Two-Pole Doppelhalter Supporter Banners (Balanced Tradition & Fortress Curva only) */}
          {isMatchdayActive &&
            fanSectionConfig.creativeFanSectionsEnabled &&
            fanSectionConfig.twoPoleBanners.length > 0 &&
            homeCurvaEffectiveFill > 0.15 && (
              <g data-testid="two-pole-banners">
                {fanSectionConfig.twoPoleBanners.map((spec, idx) => renderTwoPoleBanner(spec, idx))}
              </g>
            )}

          {/* Capo Megaphone Stand & Pulsing Supporter Drums (Balanced Tradition & Fortress Curva only) */}
          {isMatchdayActive && fanSectionConfig.hasCapoDrums && homeCurvaEffectiveFill > 0.2 && renderCapoDrumSection()}

          {/* Festive Club-Colored Pennant Bunting Garland (Balanced Tradition only) */}
          {isMatchdayActive && fanSectionConfig.hasPennantGarland && renderPennantGarland()}

          {/* Drifting Club-Colored Confetti / Ticker-Tape (Fortress Curva & goal bursts on creative policies) */}
          {isMatchdayActive &&
            fanSectionConfig.creativeFanSectionsEnabled &&
            (fanSectionConfig.hasTickerConfetti || matchPhase === 'goal') &&
            renderTickerConfetti()}

          {/* Fan Strategy Waving Flag Groups (Vibrant on Fortress Curva & Balanced Tradition; subdued on Grassroots & Exec Hospitality) */}
          {isMatchdayActive && stadiumPolicy === 'ultras' && (
            <g data-testid="fan-policy-visual-ultras">
              {renderFlag(-(standBaseU + standGeom.standDepth * 0.44), -homeStandHalfV * 0.56, standGeom.tierHeight * 0.5, bannerTheme.primary, bannerTheme.secondary, 21)}
              {renderFlag(-(standBaseU + standGeom.standDepth * 0.52), 0, standGeom.tierHeight * 0.56, bannerTheme.secondary, bannerTheme.primary, 22)}
              {renderFlag(-(standBaseU + standGeom.standDepth * 0.44), homeStandHalfV * 0.56, standGeom.tierHeight * 0.5, bannerTheme.primary, bannerTheme.secondary, 23)}
            </g>
          )}

          {isMatchdayActive && stadiumPolicy === 'commercial' && (
            <g data-testid="fan-policy-visual-commercial" />
          )}

          {isMatchdayActive && stadiumPolicy === 'family' && (
            <g data-testid="fan-policy-visual-family">
              {renderFlag(-(standBaseU + standGeom.standDepth * 0.38), 0, standGeom.tierHeight * 0.44, bannerTheme.primary, bannerTheme.secondary, 31)}
            </g>
          )}

          {isMatchdayActive && stadiumPolicy === 'balanced' && (
            <g data-testid="fan-policy-visual-balanced">
              {renderFlag(-(standBaseU + standGeom.standDepth * 0.4), -36, standGeom.tierHeight * 0.45, bannerTheme.primary, bannerTheme.secondary, 41)}
              {renderFlag(-(standBaseU + standGeom.standDepth * 0.4), 36, standGeom.tierHeight * 0.45, bannerTheme.secondary, bannerTheme.primary, 42)}
            </g>
          )}

          {isMatchdayActive && fanSectionConfig.creativeFanSectionsEnabled && homeCurvaEffectiveFill > 0.12 && (
            <>
              {renderFlag(-(standBaseU + standGeom.standDepth * 0.46), -Math.min(24, homeStandHalfV * 0.35), standGeom.tierHeight * 0.5, bannerTheme.secondary, bannerTheme.primary, 1)}
              {renderFlag(-(standBaseU + standGeom.standDepth * 0.50), Math.min(24, homeStandHalfV * 0.35), standGeom.tierHeight * 0.54, bannerTheme.primary, bannerTheme.secondary, 2)}
              {homeCurvaEffectiveFill > 0.45 && (
                <>
                  {renderFlag(-(standBaseU + standGeom.standDepth * 0.62), -homeStandHalfV * 0.72, standGeom.tierHeight * 0.66, bannerTheme.primary, bannerTheme.secondary, 3)}
                  {renderFlag(-(standBaseU + standGeom.standDepth * 0.62), homeStandHalfV * 0.72, standGeom.tierHeight * 0.64, bannerTheme.primary, bannerTheme.secondary, 4)}
                </>
              )}
            </>
          )}
          {pyroActive && (
            <g data-testid="home-ultras-pyro">
              {renderPyro(-(standBaseU + standGeom.standDepth * 0.72), -homeStandHalfV * 0.68, standGeom.tierHeight * 0.72, bannerTheme.smokePrimary, bannerTheme.smokePrimary, 1, pyroBoost)}
              {renderPyro(-(standBaseU + standGeom.standDepth * 0.76), homeStandHalfV * 0.68, standGeom.tierHeight * 0.74, bannerTheme.smokeSecondary, bannerTheme.smokeSecondary, 2, pyroBoost)}
            </g>
          )}
        </g>
      ) : (
        renderAmateurRailSpectators('home')
      )}

      {/* AWAY END SUPPORTERS (Right / NE Goal): Present on 10k+ 4-stand grounds */}
      {standGeom.hasAwayEndStand && upperAndEndBlocks.awayEnd && (
        <g data-testid="away-supporters-end">
          {renderAnimatedSpectatorBlock(upperAndEndBlocks.awayEnd)}
          <polygon
            points={polyUV(standBaseU - 3, standBaseU + 1, -84, 84, 2, 5, 5, 2)}
            fill={bannerTheme.primary}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="0.75"
            data-testid="right-stand-parapet"
          />
          {isMatchdayActive && seatProfile.awayEndFill > 0.12 && (
            <>
              <polygon
                points={polyUV(standBaseU - 2.6, standBaseU + 0.6, -28, 28, 2.2, 4.7, 4.7, 2.2)}
                fill={oppPalette.primary}
                stroke={oppPalette.secondary}
                strokeWidth="0.65"
                opacity="0.92"
              />
              {renderFlag(standBaseU + standGeom.standDepth * 0.45, 0, rightTierHeight * 0.6, oppPalette.secondary, oppPalette.primary, 5)}
              {seatProfile.awayEndFill > 0.45 && (
                <>
                  {renderFlag(standBaseU + standGeom.standDepth * 0.52, -72, rightTierHeight * 0.7, oppPalette.primary, oppPalette.secondary, 6)}
                  {renderFlag(standBaseU + standGeom.standDepth * 0.52, 72, rightTierHeight * 0.7, oppPalette.primary, oppPalette.secondary, 7)}
                </>
              )}
            </>
          )}
          {pyroActive && (
            <g data-testid="away-supporters-pyro">
              {renderPyro(standBaseU + 8, -52, 6, oppPalette.primary, oppPalette.primary, 4, false)}
              {renderPyro(standBaseU + 8, 52, 6, oppPalette.secondary, oppPalette.secondary, 5, false)}
            </g>
          )}
        </g>
      )}
    </>
  );

  const memoizedForegroundCrowd = (
    <>
      {(foregroundBlocks.bottomLeftCorner || foregroundBlocks.bottomRightCorner) && (
        <g opacity="0.95">
          {foregroundBlocks.bottomLeftCorner && renderAnimatedSpectatorBlock(foregroundBlocks.bottomLeftCorner)}
          {foregroundBlocks.bottomRightCorner && renderAnimatedSpectatorBlock(foregroundBlocks.bottomRightCorner)}
        </g>
      )}
      {foregroundBlocks.bottomStand
        ? renderAnimatedSpectatorBlock(foregroundBlocks.bottomStand)
        : renderAmateurRailSpectators('bottom')}
    </>
  );

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${
        containerClassName
          ? containerClassName
          : `rounded-[24px] border ${
              isDaytime ? 'border-[#4A6587]' : 'border-[#2C3B52]'
            } shadow-sm ${compactMode ? 'h-[320px] sm:h-[360px]' : 'h-[405px] sm:h-[470px]'}`
      }`}
      style={{
        background: standGeom.isAmateurGround
          ? isDaytime
            ? 'radial-gradient(ellipse at 50% 45%, #5C8E6B 0%, #3F6E51 60%, #2B4F3B 100%)'
            : 'radial-gradient(ellipse at 50% 45%, #274038 0%, #1C2F2B 64%, #121E1D 100%)'
          : isDaytime
          ? 'radial-gradient(ellipse at 50% 42%, #6E90BA 0%, #4C6A91 58%, #344D6E 100%)'
          : `radial-gradient(ellipse at 50% 48%, #3F5576 0%, ${design.standBg} 64%, #1C293B 100%)`,
      }}
      data-testid="stadium-bowl-3d"
      data-camera={camera}
      data-time-of-day={timeOfDay}
      data-empty-bowl={emptyBowl ? 'true' : 'false'}
      data-stadium-policy={stadiumPolicy}
      data-vip-hospitality={vipSuitesVisible ? 'true' : 'false'}
      data-match-phase={matchPhase}
      data-play-pattern={choreo.playPattern}
      data-tactic={choreo.tacticKey}
      data-scale-band={scaleBand}
      data-capacity-tier={standGeom.capacityTier}
      data-stand-layout={standGeom.standLayout}
      data-stadium-style={standGeom.style}
      data-has-running-track={standGeom.hasRunningTrack ? 'true' : 'false'}
    >
      {/* Broadcast Daylight Sun Wash (70%) or Evening Floodlight Wash (30%) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDaytime
            ? 'radial-gradient(circle at 24% 12%, rgba(254,249,195,0.34), transparent 48%), radial-gradient(circle at 78% 16%, rgba(255,255,255,0.24), transparent 46%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12), transparent 64%)'
            : 'radial-gradient(circle at 20% 18%, rgba(255,255,255,0.16), transparent 42%), radial-gradient(circle at 80% 18%, rgba(255,255,255,0.16), transparent 42%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.07), transparent 60%)',
        }}
      />

      {/* Full-Canvas 2.5D Projected Stadium SVG */}
      <div
        className="w-full h-full flex items-center justify-center"
        role="img"
        aria-label={`${stadiumName} 3D Football Stadium Bowl`}
      >
        <svg
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="standConcreteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#647B96' : '#465A75'} />
              <stop offset="100%" stopColor={isDaytime ? '#445770' : '#2C3B50'} />
            </linearGradient>
            <linearGradient id="standUpperGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#7E96B4' : '#5C7290'} />
              <stop offset="100%" stopColor={isDaytime ? '#556B87' : '#3A4D66'} />
            </linearGradient>
            <linearGradient id="standSkyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#94ACC8' : '#6F86A6'} />
              <stop offset="100%" stopColor={isDaytime ? '#647B98' : '#465B76'} />
            </linearGradient>
            <linearGradient id="megaFacadeWallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#CBD5E1' : '#334155'} />
              <stop offset="55%" stopColor={isDaytime ? '#94A3B8' : '#1E293B'} />
              <stop offset="100%" stopColor={isDaytime ? '#64748B' : '#0F172A'} />
            </linearGradient>
            <linearGradient id="megaFacadeRightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#AEBDCB' : '#293548'} />
              <stop offset="55%" stopColor={isDaytime ? '#7E90A4' : '#182233'} />
              <stop offset="100%" stopColor={isDaytime ? '#526378' : '#0B1324'} />
            </linearGradient>
            <linearGradient id="megaRoofCrownGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#F8FAFC' : '#CBD5E1'} />
              <stop offset="55%" stopColor={isDaytime ? '#E2E8F0' : '#94A3B8'} />
              <stop offset="100%" stopColor={isDaytime ? '#CBD5E1' : '#64748B'} />
            </linearGradient>
            <linearGradient id="amateurShedRoofGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#94A3B8' : '#64748B'} />
              <stop offset="100%" stopColor={isDaytime ? '#64748B' : '#334155'} />
            </linearGradient>
            {/* Classic Old-School German Rounded Bowl Gradients (Wallanlage earth berm, raw concrete & galvanized steel roof) */}
            <linearGradient id="germanEmbankmentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#6B9A63' : '#2C4A38'} />
              <stop offset="60%" stopColor={isDaytime ? '#4E7B4C' : '#1F372A'} />
              <stop offset="100%" stopColor={isDaytime ? '#385B38' : '#13241B'} />
            </linearGradient>
            <linearGradient id="germanConcreteWallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#D2CEC4' : '#454C59'} />
              <stop offset="50%" stopColor={isDaytime ? '#ABA69B' : '#2D3440'} />
              <stop offset="100%" stopColor={isDaytime ? '#7E7A70' : '#191E28'} />
            </linearGradient>
            <linearGradient id="germanConcreteRightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#B8B3A8' : '#383F4B'} />
              <stop offset="50%" stopColor={isDaytime ? '#928D82' : '#232934'} />
              <stop offset="100%" stopColor={isDaytime ? '#68645B' : '#131720'} />
            </linearGradient>
            <linearGradient id="germanTrussRoofGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDaytime ? '#D5DCE3' : '#64748B'} />
              <stop offset="55%" stopColor={isDaytime ? '#A3B0BE' : '#475569'} />
              <stop offset="100%" stopColor={isDaytime ? '#7B8A9A' : '#334155'} />
            </linearGradient>
            <radialGradient id="stadiumShadowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#090F1A" stopOpacity={isDaytime ? '0.42' : '0.62'} />
              <stop offset="72%" stopColor="#090F1A" stopOpacity={isDaytime ? '0.18' : '0.32'} />
              <stop offset="100%" stopColor="#090F1A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="playerSpotlightGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.62" />
              <stop offset="55%" stopColor="#F8FAFC" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. GROUND ENVIRONMENT: Blueprint Grid in Upgrade Inspection Mode | Grounded Park/Meadow for Amateur | Architectural Plaza for Pro & Mega-Arenas */}
          {emptyBowl && (
            <g data-testid="stadium-blueprint-grid" opacity="0.44">
              {[262, 294, 326, 358].map((ru, idx) => {
                const rv = 176 + idx * 21;
                return (
                  <polygon
                    key={`bp-${ru}`}
                    points={polyUV(-ru, ru, -rv, rv, 0)}
                    fill="none"
                    stroke={isDaytime ? 'rgba(255, 255, 255, 0.24)' : 'rgba(226, 232, 240, 0.18)'}
                    strokeWidth={idx === 3 ? '0.95' : '0.65'}
                    strokeDasharray={idx === 3 ? '5 4' : undefined}
                  />
                );
              })}
              {[
                [project(-360, 0, 0), project(360, 0, 0)],
                [project(0, -248, 0), project(0, 248, 0)],
              ].map(([a, b], idx) => (
                <line
                  key={`ray-${idx}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={isDaytime ? 'rgba(255, 255, 255, 0.2)' : 'rgba(226, 232, 240, 0.15)'}
                  strokeWidth="0.7"
                />
              ))}
            </g>
          )}

          {/* AMATEUR (<5k) & SEMI-PRO (5k-10k) GRASSROOTS VILLAGE SURROUND: Meadow Turf, Gravel Path, Clubhouse Pavilion, Trees & White Pitch Rail */}
          {(standGeom.isAmateurGround || standGeom.isSemiProGround) && (
            <g data-testid="amateur-ground-surround">
              {/* Expansive Edge-to-Edge Community Meadow Parkland */}
              <polygon
                points={polyUV(-580, 580, -420, 420, -0.8)}
                fill={isDaytime ? '#3C7A49' : '#1D362B'}
              />
              {/* Subtle Mowed Outer Grass Verge */}
              <polygon
                points={polyUV(-310, 310, -216, 216, -0.4)}
                fill={isDaytime ? '#448752' : '#223E31'}
                stroke={isDaytime ? 'rgba(255,255,255,0.09)' : 'rgba(148,163,184,0.08)'}
                strokeWidth="0.9"
              />
              {/* Local Gravel Footpath & Spectators Standing Perimeter */}
              <polygon
                points={polyUV(-(standBaseU + 22), standBaseU + 22, -(standBaseV + 22), standBaseV + 22, -0.2)}
                fill={isDaytime ? '#9CA3AF' : '#475569'}
                fillOpacity={isDaytime ? '0.46' : '0.38'}
                stroke={isDaytime ? 'rgba(255,255,255,0.22)' : 'rgba(148,163,184,0.2)'}
                strokeWidth="0.8"
              />

              {/* Low White Tubular-Steel Pitch Perimeter Rail on Open Sides Without Stands */}
              <g data-testid="amateur-perimeter-rail">
                {/* Far-left & Far-right wing rails flanking the single main stand */}
                {[
                  [-standBaseU, -topStandHalfU - 3, -(standBaseV + 1), -(standBaseV + 1)],
                  [topStandHalfU + 3, standBaseU, -(standBaseV + 1), -(standBaseV + 1)],
                  // Open near touchline rail (when no bottom stand)
                  ...(!standGeom.hasBottomStand ? [[-standBaseU, standBaseU, standBaseV + 1, standBaseV + 1]] : []),
                  // Open home goal end rail (amateur <5k only)
                  ...(!standGeom.hasHomeEndStand ? [[-(standBaseU + 1), -(standBaseU + 1), -standBaseV, standBaseV]] : []),
                  // Open away goal end rail (<10k)
                  ...(!standGeom.hasAwayEndStand ? [[standBaseU + 1, standBaseU + 1, -standBaseV, standBaseV]] : []),
                ].map(([u1, u2, v1, v2], rIdx) => {
                  const pA = project(u1, v1, 3.2);
                  const pB = project(u2, v2, 3.2);
                  const pA0 = project(u1, v1, 0);
                  const pB0 = project(u2, v2, 0);
                  return (
                    <g key={`rail-${rIdx}`}>
                      <line x1={pA0.x} y1={pA0.y} x2={pB0.x} y2={pB0.y} stroke="rgba(15,23,42,0.25)" strokeWidth="1.2" />
                      <line x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y} stroke={isDaytime ? '#F8FAFC' : '#CBD5E1'} strokeWidth="1.6" />
                      {[0, 0.25, 0.5, 0.75, 1].map((t, pIdx) => {
                        const pu = u1 + (u2 - u1) * t;
                        const pv = v1 + (v2 - v1) * t;
                        const b = project(pu, pv, 0);
                        const top = project(pu, pv, 3.5);
                        return (
                          <line
                            key={`rp-${rIdx}-${pIdx}`}
                            x1={b.x}
                            y1={b.y}
                            x2={top.x}
                            y2={top.y}
                            stroke={isDaytime ? '#E2E8F0' : '#94A3B8'}
                            strokeWidth="1.0"
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </g>

              {/* Cozy Local Village Clubhouse & Canteen Pavilion (Far-Left Wing Beside Main Stand) */}
              {(() => {
                const cU1 = -(topStandHalfU + 64);
                const cU2 = -(topStandHalfU + 12);
                const cV1 = -(standBaseV + 34);
                const cV2 = -(standBaseV + 6);
                const chH = 14;
                const roofPeakZ = 22;
                const midV = (cV1 + cV2) * 0.5;
                return (
                  <g data-testid="amateur-clubhouse">
                    {/* Ground patio slab */}
                    <polygon
                      points={polyUV(cU1 - 6, cU2 + 6, cV1 - 4, cV2 + 5, 0.2)}
                      fill={isDaytime ? '#CBD5E1' : '#475569'}
                      opacity="0.72"
                    />
                    {/* Front wall facing pitch */}
                    <polygon
                      points={polyUV(cU1, cU2, cV2, cV2, chH, chH, 0, 0)}
                      fill={isDaytime ? '#F1ECE1' : '#64748B'}
                      stroke="rgba(30,41,59,0.45)"
                      strokeWidth="0.85"
                    />
                    {/* Right gable side wall */}
                    <polygon
                      points={polyUV(cU2, cU2, cV1, cV2, chH, chH, 0, 0)}
                      fill={isDaytime ? '#DFD8C8' : '#475569'}
                      stroke="rgba(30,41,59,0.45)"
                      strokeWidth="0.85"
                    />
                    {/* Warm illuminated clubhouse windows */}
                    {[-0.3, 0.05, 0.36].map((wf, wIdx) => {
                      const wu = (cU1 + cU2) * 0.5 + wf * (cU2 - cU1);
                      return (
                        <polygon
                          key={`chw-${wIdx}`}
                          points={polyUV(wu - 4.5, wu + 4.5, cV2 + 0.2, cV2 + 0.2, 9.5, 9.5, 4.5, 4.5)}
                          fill={isDaytime ? '#38BDF8' : '#FDE68A'}
                          fillOpacity={isDaytime ? '0.62' : '0.92'}
                          stroke="#1E293B"
                          strokeWidth="0.55"
                        />
                      );
                    })}
                    {/* Pitched Terracotta / Slate Pavilion Roof */}
                    <polygon
                      points={ptsStr([
                        project(cU1 - 3, cV2 + 3, chH - 1),
                        project(cU2 + 3, cV2 + 3, chH - 1),
                        project(cU2 + 3, midV, roofPeakZ),
                        project(cU1 - 3, midV, roofPeakZ),
                      ])}
                      fill={isDaytime ? '#B8543E' : '#6E352B'}
                      stroke="rgba(15,23,42,0.42)"
                      strokeWidth="0.85"
                    />
                    <polygon
                      points={ptsStr([
                        project(cU1 - 3, cV1 - 3, chH - 1),
                        project(cU2 + 3, cV1 - 3, chH - 1),
                        project(cU2 + 3, midV, roofPeakZ),
                        project(cU1 - 3, midV, roofPeakZ),
                      ])}
                      fill={isDaytime ? '#9E4532' : '#572820'}
                      stroke="rgba(15,23,42,0.42)"
                      strokeWidth="0.85"
                    />
                    {/* Small Club Pennant on Clubhouse Roof */}
                    {(() => {
                      const fp = project((cU1 + cU2) * 0.5, midV, roofPeakZ);
                      return (
                        <g>
                          <line x1={fp.x} y1={fp.y} x2={fp.x} y2={fp.y - 10} stroke="#E2E8F0" strokeWidth="1" />
                          <polygon
                            points={`${fp.x},${fp.y - 10} ${fp.x + 7},${fp.y - 7.5} ${fp.x},${fp.y - 5}`}
                            fill={palette.primary}
                          />
                        </g>
                      );
                    })()}
                  </g>
                );
              })()}

              {/* Rustic Local Scoreboard Pole on Far-Right Wing (Amateur <5k only; >=5k has jumbotron) */}
              {standGeom.isAmateurGround && camera !== 'topdown' && (() => {
                const sbBase = project(topStandHalfU + 36, -(standBaseV + 18), 0);
                const sbTop = project(topStandHalfU + 36, -(standBaseV + 18), 18);
                return (
                  <g data-testid="amateur-scoreboard">
                    <line x1={sbBase.x - 6} y1={sbBase.y} x2={sbTop.x - 6} y2={sbTop.y + 4} stroke="#94A3B8" strokeWidth="1.4" />
                    <line x1={sbBase.x + 6} y1={sbBase.y} x2={sbTop.x + 6} y2={sbTop.y + 4} stroke="#94A3B8" strokeWidth="1.4" />
                    <rect
                      x={sbTop.x - 16}
                      y={sbTop.y - 7}
                      width="32"
                      height="13"
                      rx="2"
                      fill="#1E293B"
                      stroke="#E2E8F0"
                      strokeWidth="0.9"
                    />
                    <text
                      x={sbTop.x}
                      y={sbTop.y - 0.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#F8FAFC"
                      fontSize="6.2"
                      fontWeight="900"
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                    >
                      {emptyBowl ? 'PITCH' : `${userGoals} - ${oppGoals}`}
                    </text>
                  </g>
                );
              })()}

              {/* Stylized Village Trees & Hedgerows Framing the Open Grass Sides */}
              <g data-testid="amateur-trees-hedges">
                {[
                  // Far wing trees beside main stand & clubhouse
                  { u: -242, v: -(standBaseV + 22), r: 10 },
                  { u: -268, v: -(standBaseV + 4), r: 9 },
                  { u: topStandHalfU + 64, v: -(standBaseV + 24), r: 10.5 },
                  { u: topStandHalfU + 86, v: -(standBaseV + 6), r: 8.5 },
                  // Open away-end (right) tree line
                  ...(!standGeom.hasAwayEndStand
                    ? [
                        { u: standBaseU + 32, v: -88, r: 9.5 },
                        { u: standBaseU + 38, v: -28, r: 11 },
                        { u: standBaseU + 34, v: 42, r: 10 },
                        { u: standBaseU + 30, v: 104, r: 9 },
                      ]
                    : []),
                  // Open home-end (left) trees for amateur 1-stand grounds
                  ...(!standGeom.hasHomeEndStand
                    ? [
                        { u: -(standBaseU + 34), v: -76, r: 10 },
                        { u: -(standBaseU + 38), v: 6, r: 11 },
                        { u: -(standBaseU + 32), v: 88, r: 9.5 },
                      ]
                    : []),
                  // Distant trees along open near edge (small, never obstructing pitch)
                  ...(!standGeom.hasBottomStand
                    ? [
                        { u: -158, v: standBaseV + 34, r: 8.5 },
                        { u: -48, v: standBaseV + 38, r: 8 },
                        { u: 72, v: standBaseV + 36, r: 8.5 },
                        { u: 174, v: standBaseV + 32, r: 9 },
                      ]
                    : []),
                ].map((tr, tIdx) => {
                  const base = project(tr.u, tr.v, 0);
                  const crown = project(tr.u, tr.v, 11);
                  const rad = tr.r * standGeom.zoomFactor;
                  return (
                    <g key={`tree-${tIdx}`}>
                      <ellipse cx={base.x + 2} cy={base.y + 1.5} rx={rad * 0.85} ry={rad * 0.42} fill="rgba(15,23,42,0.24)" />
                      <line x1={base.x} y1={base.y} x2={crown.x} y2={crown.y + rad * 0.35} stroke="#5C4033" strokeWidth="2.2" />
                      <circle
                        cx={crown.x}
                        cy={crown.y}
                        r={rad}
                        fill={isDaytime ? (tIdx % 2 === 0 ? '#2E6F40' : '#387D49') : '#1E402E'}
                        stroke={isDaytime ? 'rgba(20,60,32,0.42)' : 'rgba(15,23,42,0.45)'}
                        strokeWidth="0.7"
                      />
                      <circle
                        cx={crown.x - rad * 0.28}
                        cy={crown.y - rad * 0.26}
                        r={rad * 0.48}
                        fill={isDaytime ? '#4FA15D' : '#2C5C42'}
                        opacity="0.75"
                      />
                    </g>
                  );
                })}
              </g>
            </g>
          )}

          {/* PRO & MEGA-ARENA GROUNDED ARCHITECTURAL PLAZA / GERMAN WALLANLAGE EMBANKMENT (>= 10,000 seats, Isometric / Inspect only) */}
          {!standGeom.isAmateurGround &&
            !standGeom.isSemiProGround &&
            (camera === 'isometric' || camera === 'inspection') && (
              <g data-testid="stadium-plaza-base">
                {/* Soft Cast Ground Shadow Anchoring the Monumental Arena */}
                <ellipse
                  cx={centerScreen.x}
                  cy={centerScreen.y + (standGeom.isMegaArena ? 22 : 12)}
                  rx={(standGeom.outerU * 0.64 + standGeom.outerV * 0.68) * standGeom.zoomFactor * 1.04}
                  ry={(standGeom.outerU * 0.29 + standGeom.outerV * 0.32) * standGeom.zoomFactor * 1.06}
                  fill="url(#stadiumShadowGrad)"
                />
                {isClassicGermanBowl ? (
                  <g data-testid="german-wallanlage-embankment">
                    {/* Outer Grassy Stadium Park Embankment (Wallanlage) */}
                    <polygon
                      points={ptsStr(
                        roundRectUVPts(
                          standGeom.outerU + (standGeom.isMegaArena ? 34 : 26),
                          standGeom.outerV + (standGeom.isMegaArena ? 30 : 24),
                          bowlInnerR + standGeom.standDepth + (standGeom.isMegaArena ? 32 : 24),
                          -Math.min(18, standGeom.facadeHeight * 0.45) - 2,
                          12
                        )
                      )}
                      fill="url(#germanEmbankmentGrad)"
                      fillOpacity={isDaytime ? '0.84' : '0.72'}
                      stroke={isDaytime ? 'rgba(226, 232, 224, 0.5)' : 'rgba(148, 163, 184, 0.25)'}
                      strokeWidth="1.25"
                    />
                    {/* Classic Concrete Perimeter Footpath Ring */}
                    <polygon
                      points={ptsStr(
                        roundRectUVPts(
                          standGeom.outerU + (standGeom.isMegaArena ? 17 : 12),
                          standGeom.outerV + (standGeom.isMegaArena ? 15 : 10),
                          bowlInnerR + standGeom.standDepth + (standGeom.isMegaArena ? 15 : 10),
                          -Math.min(18, standGeom.facadeHeight * 0.45),
                          12
                        )
                      )}
                      fill={isDaytime ? 'rgba(218, 214, 204, 0.34)' : 'rgba(30, 41, 59, 0.48)'}
                      stroke={isDaytime ? 'rgba(236, 232, 222, 0.58)' : 'rgba(148, 163, 184, 0.28)'}
                      strokeWidth="1.05"
                    />
                    {/* Parkland Trees flanking the outer Wallanlage earth berm */}
                    {[
                      { u: -(standGeom.outerU + 22), v: -70, r: 6.4 },
                      { u: -(standGeom.outerU + 20), v: -28, r: 5.5 },
                      { u: -(standGeom.outerU + 21), v: 26, r: 5.8 },
                      { u: -88, v: -(standGeom.outerV + 20), r: 6.0 },
                      { u: 84, v: -(standGeom.outerV + 20), r: 5.8 },
                      { u: standGeom.outerU + 22, v: -56, r: 5.6 },
                      { u: standGeom.outerU + 21, v: 22, r: 5.4 },
                    ].map((tr, tIdx) => {
                      const pt = project(tr.u, tr.v, -Math.min(14, standGeom.facadeHeight * 0.36));
                      const rad = tr.r * Math.max(0.78, standGeom.zoomFactor);
                      return (
                        <g key={`ger-tree-${tIdx}`} opacity={isDaytime ? '0.9' : '0.74'}>
                          <circle cx={pt.x + 1.8} cy={pt.y + 2.2} r={rad} fill="#0F172A" opacity="0.24" />
                          <circle cx={pt.x} cy={pt.y} r={rad} fill={isDaytime ? '#35663E' : '#1E3A2C'} />
                          <circle
                            cx={pt.x - rad * 0.25}
                            cy={pt.y - rad * 0.25}
                            r={rad * 0.48}
                            fill={isDaytime ? '#5B9A62' : '#2E5842'}
                            opacity="0.78"
                          />
                        </g>
                      );
                    })}
                  </g>
                ) : (
                  /* Clean Architectural Concourse Apron Ring */
                  <polygon
                    points={
                      standGeom.isRoundedBowl
                        ? ptsStr(
                            roundRectUVPts(
                              standGeom.outerU + (standGeom.isMegaArena ? 26 : 16),
                              standGeom.outerV + (standGeom.isMegaArena ? 24 : 15),
                              bowlInnerR + standGeom.standDepth + (standGeom.isMegaArena ? 24 : 15),
                              -Math.min(18, standGeom.facadeHeight * 0.45),
                              9
                            )
                          )
                        : polyUV(
                            -(standBaseU + standGeom.standDepth + (standGeom.isMegaArena ? 20 : 12)),
                            standBaseU + standGeom.standDepth + (standGeom.isMegaArena ? 20 : 12),
                            -(standBaseV + standGeom.standDepth + (standGeom.isMegaArena ? 18 : 12)),
                            standBaseV + standGeom.standDepth + (standGeom.isMegaArena ? 18 : 12),
                            -Math.min(18, standGeom.facadeHeight * 0.45)
                          )
                    }
                    fill={isDaytime ? 'rgba(226, 232, 240, 0.14)' : 'rgba(15, 23, 42, 0.34)'}
                    stroke={isDaytime ? 'rgba(255, 255, 255, 0.22)' : 'rgba(148, 163, 184, 0.18)'}
                    strokeWidth="1.0"
                  />
                )}
              </g>
            )}

          {/* 2. OUTER STADIUM SHELL & EXPANDING STAND DECKS */}
          <g data-testid={`stadium-tier-${scaleBand}`}>
            {/* Enclosed Pro Outer Bowl Shell (Omitted in endzone & on open-corner 4-stand grounds so no floating corner wings appear) */}
            {!standGeom.isAmateurGround &&
              !standGeom.isSemiProGround &&
              camera !== 'endzone' &&
              (standGeom.isRoundedBowl || standGeom.hasCorners) && (
                <>
                  {standGeom.isRoundedBowl ? (
                    <polygon
                      points={ptsStr(
                        roundRectUVPts(
                          standGeom.outerU,
                          standGeom.outerV,
                          bowlInnerR + standGeom.standDepth + 4,
                          fgTierHeight * 0.45,
                          10
                        )
                      )}
                      fill={isDaytime ? '#2B3E56' : '#1B2739'}
                      stroke={palette.primary}
                      strokeOpacity={standGeom.isMegaArena ? 0.78 : 0.55}
                      strokeWidth={standGeom.isMegaArena ? 2.2 : 1.3}
                    />
                  ) : (
                    <polygon
                      points={polyUV(
                        -(standBaseU + standGeom.standDepth),
                        standBaseU + standGeom.standDepth,
                        -(standBaseV + standGeom.standDepth),
                        standBaseV + standGeom.standDepth,
                        2
                      )}
                      fill={isDaytime ? '#2B3E56' : '#1B2739'}
                      stroke={palette.primary}
                      strokeOpacity={standGeom.isMegaArena ? 0.65 : 0.45}
                      strokeWidth={standGeom.isMegaArena ? 1.6 : 1.1}
                    />
                  )}

                  {/* Subtle Architectural Rim Accent behind Top & Home Stands (60k+ Mega-Arenas) */}
                  {standGeom.isMegaArena && <g data-testid="mega-arena-outer-crown" />}
                </>
              )}

            {/* FLOODLIGHT PYLONS (Slim village poles for amateur 1.8k-5k, classic 4-corner lattice towers for mid-tier, iconic Flutlichtmasten for Classic German Rounded Bowls at all sizes!) */}
            {standGeom.hasFloodlightPylons &&
              !isClassicGermanBowl &&
              [
                {
                  u: -(standGeom.isAmateurGround ? P_U + 22 : standGeom.outerU - 8),
                  v: -(standGeom.isAmateurGround ? P_V + 20 : standGeom.outerV - 8),
                  zTop: standGeom.isAmateurGround ? 30 : standGeom.tierHeight + 26,
                },
                {
                  u: standGeom.isAmateurGround ? P_U + 22 : standGeom.outerU - 8,
                  v: -(standGeom.isAmateurGround ? P_V + 20 : standGeom.outerV - 8),
                  zTop: standGeom.isAmateurGround ? 30 : Math.max(26, rightTierHeight + 24),
                },
                {
                  u: -(standGeom.isAmateurGround ? P_U + 22 : standGeom.outerU - 8),
                  v: standGeom.isAmateurGround ? P_V + 20 : standGeom.outerV - 8,
                  zTop: standGeom.isAmateurGround ? 28 : Math.max(24, fgTierHeight + 22),
                },
                {
                  u: standGeom.isAmateurGround ? P_U + 22 : standGeom.outerU - 8,
                  v: standGeom.isAmateurGround ? P_V + 20 : standGeom.outerV - 8,
                  zTop: standGeom.isAmateurGround ? 28 : Math.max(24, fgTierHeight + 22),
                  skipOnOpenPro: !standGeom.isAmateurGround && !standGeom.isSemiProGround && !standGeom.hasCorners,
                },
              ]
                .filter((p) => !('skipOnOpenPro' in p && p.skipOnOpenPro))
                .map((p, idx) => {
                  const base = project(p.u, p.v, 0);
                  const top = project(p.u, p.v, p.zTop);
                  const isVillagePole = standGeom.isAmateurGround;
                  return (
                    <g key={`pylon-${idx}`} data-testid="stadium-floodlight-pylon">
                      <line
                        x1={base.x}
                        y1={base.y}
                        x2={top.x}
                        y2={top.y}
                        stroke="#CBD5E1"
                        strokeWidth={isVillagePole ? '1.35' : '2.1'}
                      />
                      {!isVillagePole && (
                        <line
                          x1={base.x + 2.4}
                          y1={base.y}
                          x2={top.x + 1.2}
                          y2={top.y}
                          stroke="#94A3B8"
                          strokeWidth="1.0"
                          opacity="0.7"
                        />
                      )}
                      {!isDaytime && (
                        <circle cx={top.x} cy={top.y} r={isVillagePole ? '9' : '14'} fill="#FEF08A" opacity="0.16" />
                      )}
                      <rect
                        x={top.x - (isVillagePole ? 4.2 : 6.5)}
                        y={top.y - (isVillagePole ? 2.2 : 3.2)}
                        width={isVillagePole ? '8.4' : '13'}
                        height={isVillagePole ? '3.8' : '5.4'}
                        rx="1.2"
                        fill="#1E293B"
                        stroke="#CBD5E1"
                        strokeWidth="0.7"
                      />
                      {(isVillagePole ? [-2, 2] : [-4, -1.3, 1.3, 4]).map((dx) => (
                        <circle
                          key={`lamp-${dx}`}
                          cx={top.x + dx}
                          cy={top.y - 0.3}
                          r={isVillagePole ? '0.95' : '1.15'}
                          fill={isDaytime ? '#E2E8F0' : '#FEF9C3'}
                        />
                      ))}
                    </g>
                  );
                })}

            {/* ICONIC OLD-SCHOOL GERMAN LATTICE FLOODLIGHT MASTS (Flutlichtmasten hugging the sweeping curved corners) */}
            {isClassicGermanBowl &&
              camera !== 'endzone' &&
              (() => {
                const mastR = bowlInnerR + standGeom.standDepth + 9;
                const diag = 0.7071;
                const mastHeight = standGeom.tierHeight + (standGeom.isMegaArena ? 50 : 38);
                const mastCorners: Array<{ uSign: -1 | 1; vSign: -1 | 1; zTop: number; topDownOnly?: boolean }> = [
                  { uSign: -1, vSign: -1, zTop: mastHeight },
                  { uSign: 1, vSign: -1, zTop: Math.max(rightTierHeight + 40, mastHeight * 0.88) },
                  { uSign: -1, vSign: 1, zTop: Math.max(fgTierHeight + 40, mastHeight * 0.86) },
                  { uSign: 1, vSign: 1, zTop: Math.max(fgTierHeight + 36, mastHeight * 0.82), topDownOnly: true },
                ];
                return (
                  <g data-testid="german-floodlight-masts">
                    {mastCorners
                      .filter((m) => !m.topDownOnly || camera === 'topdown')
                      .map((m, idx) => {
                        const mu = m.uSign * (straightHalfU + mastR * diag);
                        const mv = m.vSign * (straightHalfV + mastR * diag);
                        const base = project(mu, mv, -4);
                        const top = project(mu, mv, m.zTop);
                        const halfWBase = standGeom.isMegaArena ? 3.5 : 2.9;
                        const halfWTop = standGeom.isMegaArena ? 1.65 : 1.35;
                        const headW = standGeom.isMegaArena ? 23 : 19;
                        const headH = standGeom.isMegaArena ? 9.0 : 7.6;
                        const rungs = [0.22, 0.44, 0.66, 0.86];
                        return (
                          <g key={`ger-mast-${idx}`} data-testid="stadium-floodlight-pylon">
                            {/* Tapered Twin-Leg Steel Lattice Mast (crisp dark galvanized steel in daylight, cool steel at night) */}
                            <line
                              x1={base.x - halfWBase}
                              y1={base.y}
                              x2={top.x - halfWTop}
                              y2={top.y + 3.5}
                              stroke={isDaytime ? '#334155' : '#94A3B8'}
                              strokeWidth="1.9"
                            />
                            <line
                              x1={base.x + halfWBase}
                              y1={base.y}
                              x2={top.x + halfWTop}
                              y2={top.y + 3.5}
                              stroke={isDaytime ? '#475569' : '#64748B'}
                              strokeWidth="1.65"
                            />
                            {/* Classic Lattice X Cross-Bracing */}
                            {rungs.map((f, rIdx) => {
                              const prevF = rIdx === 0 ? 0.04 : rungs[rIdx - 1];
                              const xL1 = base.x - halfWBase + (top.x - halfWTop - (base.x - halfWBase)) * prevF;
                              const xR1 = base.x + halfWBase + (top.x + halfWTop - (base.x + halfWBase)) * prevF;
                              const y1 = base.y + (top.y + 3.5 - base.y) * prevF;
                              const xL2 = base.x - halfWBase + (top.x - halfWTop - (base.x - halfWBase)) * f;
                              const xR2 = base.x + halfWBase + (top.x + halfWTop - (base.x + halfWBase)) * f;
                              const y2 = base.y + (top.y + 3.5 - base.y) * f;
                              return (
                                <g key={`brace-${rIdx}`} stroke={isDaytime ? '#475569' : '#7C8DA3'} strokeWidth="0.9" opacity="0.88">
                                  <line x1={xL1} y1={y1} x2={xR2} y2={y2} />
                                  <line x1={xR1} y1={y1} x2={xL2} y2={y2} />
                                  <line x1={xL2} y1={y2} x2={xR2} y2={y2} />
                                </g>
                              );
                            })}
                            {/* Crossbar mounting yoke */}
                            <line
                              x1={top.x - headW * 0.44}
                              y1={top.y + headH * 0.52}
                              x2={top.x + headW * 0.44}
                              y2={top.y + headH * 0.52}
                              stroke={isDaytime ? '#334155' : '#94A3B8'}
                              strokeWidth="1.3"
                            />
                            {/* Night Warm Halogen Floodlight Bloom */}
                            {!isDaytime && (
                              <>
                                <circle cx={top.x} cy={top.y} r={standGeom.isMegaArena ? '25' : '19'} fill="#FEF08A" opacity="0.15" />
                                <circle cx={top.x} cy={top.y} r={standGeom.isMegaArena ? '13.5' : '10.5'} fill="#FEF9C3" opacity="0.26" />
                              </>
                            )}
                            {/* Classic Wide Rectangular 2x5 German Floodlight Head Box */}
                            <rect
                              x={top.x - headW * 0.5}
                              y={top.y - headH * 0.5}
                              width={headW}
                              height={headH}
                              rx="1.3"
                              fill="#0F172A"
                              stroke={isDaytime ? '#CBD5E1' : '#94A3B8'}
                              strokeWidth="1.05"
                            />
                            {[-0.38, -0.19, 0, 0.19, 0.38].map((fx, lIdx) => (
                              <g key={`glamp-${lIdx}`}>
                                <circle
                                  cx={top.x + headW * fx}
                                  cy={top.y - headH * 0.2}
                                  r="1.15"
                                  fill={isDaytime ? '#F8FAFC' : '#FFFBEB'}
                                />
                                <circle
                                  cx={top.x + headW * fx}
                                  cy={top.y + headH * 0.2}
                                  r="1.15"
                                  fill={isDaytime ? '#CBD5E1' : '#FEF08A'}
                                />
                              </g>
                            ))}
                          </g>
                        );
                      })}
                  </g>
                );
              })()}

            {/* TOP MAIN / OPPOSITE STAND (Always present — compact freestanding tribune on Amateur grounds, towering 3–4 deck stand on 60k+ Mega-Arenas) */}
            <g data-testid={standGeom.isAmateurGround ? 'amateur-single-stand' : 'top-main-stand'}>
              {/* Freestanding end gable walls on amateur & semi-pro main stands so it reads as a standalone local tribune */}
              {(standGeom.isAmateurGround || standGeom.isSemiProGround) && (
                <>
                  <polygon
                    points={polyUV(
                      -topStandHalfU,
                      -topStandHalfU,
                      -(standBaseV + standGeom.standDepth),
                      -standBaseV,
                      standGeom.tierHeight,
                      4,
                      0,
                      0
                    )}
                    fill={isDaytime ? '#5B6E84' : '#334155'}
                    stroke="rgba(15,23,42,0.45)"
                    strokeWidth="0.85"
                  />
                  <polygon
                    points={polyUV(
                      topStandHalfU,
                      topStandHalfU,
                      -(standBaseV + standGeom.standDepth),
                      -standBaseV,
                      standGeom.tierHeight,
                      4,
                      0,
                      0
                    )}
                    fill={isDaytime ? '#4A5B70' : '#253347'}
                    stroke="rgba(15,23,42,0.45)"
                    strokeWidth="0.85"
                  />
                </>
              )}
              <polygon
                points={polyUV(
                  -topStandHalfU,
                  topStandHalfU,
                  -(standBaseV + standGeom.standDepth),
                  -standBaseV,
                  standGeom.tierHeight,
                  standGeom.tierHeight,
                  4,
                  4
                )}
                fill="url(#standConcreteGrad)"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1.1"
              />
              {standGeom.hasUpperRing && (
                <>
                  {/* Subtle recessed cantilever shadow lip under Upper Deck */}
                  <polygon
                    points={polyUV(
                      -topStandHalfU,
                      topStandHalfU,
                      -(standBaseV + standGeom.standDepth * 0.54),
                      -(standBaseV + standGeom.standDepth * 0.49),
                      standGeom.tierHeight * 0.54,
                      standGeom.tierHeight * 0.54,
                      standGeom.tierHeight * 0.49,
                      standGeom.tierHeight * 0.49
                    )}
                    fill="#0B1220"
                    opacity="0.65"
                  />
                  <polygon
                    points={polyUV(
                      -topStandHalfU,
                      topStandHalfU,
                      -(standBaseV + standGeom.standDepth),
                      -(standBaseV + standGeom.standDepth * 0.52),
                      standGeom.tierHeight + (standGeom.isMegaArena ? 11 : 7),
                      standGeom.tierHeight + (standGeom.isMegaArena ? 11 : 7),
                      standGeom.tierHeight * 0.56,
                      standGeom.tierHeight * 0.56
                    )}
                    fill="url(#standUpperGrad)"
                    stroke="rgba(255,255,255,0.24)"
                    strokeWidth="0.9"
                  />
                </>
              )}
              {/* Elevated 3rd / 4th Sky-Deck Step for 60k+ Mega-Arenas */}
              {standGeom.isMegaArena && (
                <>
                  <polygon
                    points={polyUV(
                      -topStandHalfU,
                      topStandHalfU,
                      -(standBaseV + standGeom.standDepth * 0.79),
                      -(standBaseV + standGeom.standDepth * 0.75),
                      standGeom.tierHeight * 0.84,
                      standGeom.tierHeight * 0.84,
                      standGeom.tierHeight * 0.78,
                      standGeom.tierHeight * 0.78
                    )}
                    fill="#090F1C"
                    opacity="0.72"
                  />
                  <polygon
                    points={polyUV(
                      -topStandHalfU,
                      topStandHalfU,
                      -(standBaseV + standGeom.standDepth),
                      -(standBaseV + standGeom.standDepth * 0.77),
                      standGeom.tierHeight + (standGeom.capacityTier === 'colossus' ? 16 : 12),
                      standGeom.tierHeight + (standGeom.capacityTier === 'colossus' ? 16 : 12),
                      standGeom.tierHeight * 0.82,
                      standGeom.tierHeight * 0.82
                    )}
                    fill="url(#standSkyGrad)"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="0.95"
                  />
                </>
              )}
              <polygon
                points={polyUV(-topStandHalfU, topStandHalfU, -standBaseV, -standBaseV, 4, 4, 0, 0)}
                fill={bannerTheme.primary}
                opacity="0.94"
                data-testid="top-stand-fascia"
              />
              {fanSectionConfig.topStandMiniBanners.length > 0 &&
                !standGeom.isAmateurGround &&
                renderRailMiniBanners(fanSectionConfig.topStandMiniBanners, 'top')}

              {/* Modest Pitched Corrugated/Timber Shed Roof on Amateur (1.8k–5k) & Semi-Pro (5k–10k) Main Stand */}
              {(standGeom.hasMainStandShedRoof || standGeom.isSemiProGround) && (
                <g data-testid="amateur-main-stand-roof">
                  {/* Slim steel stanchion support posts along the front lip */}
                  {[-0.86, -0.44, 0, 0.44, 0.86].map((frac, sIdx) => {
                    const su = topStandHalfU * frac;
                    const bot = project(su, -(standBaseV + 2), 4);
                    const top = project(su, -(standBaseV + 2), standGeom.tierHeight + 5);
                    return (
                      <line
                        key={`stanchion-${sIdx}`}
                        x1={bot.x}
                        y1={bot.y}
                        x2={top.x}
                        y2={top.y}
                        stroke="#CBD5E1"
                        strokeWidth="1.05"
                        opacity="0.72"
                      />
                    );
                  })}
                  {/* Sloped corrugated roof overhang covering back ~68% of the single stand */}
                  <polygon
                    points={polyUV(
                      -(topStandHalfU + 3),
                      topStandHalfU + 3,
                      -(standBaseV + standGeom.standDepth + 2),
                      -(standBaseV + standGeom.standDepth * 0.34),
                      standGeom.tierHeight + 8,
                      standGeom.tierHeight + 8,
                      standGeom.tierHeight + 5.5,
                      standGeom.tierHeight + 5.5
                    )}
                    fill="url(#amateurShedRoofGrad)"
                    fillOpacity="0.62"
                    stroke={palette.primary}
                    strokeOpacity="0.82"
                    strokeWidth="1.25"
                  />
                </g>
              )}
            </g>

            {/* LEFT HOME ULTRAS STAND (Present on Semi-Pro 5k+ and Pro/Mega 10k+; OMITTED on Amateur <5k 1-stand grounds!) */}
            {standGeom.hasHomeEndStand && (
              <g data-testid="home-end-stand-deck">
                <polygon
                  points={polyUV(
                    -(standBaseU + standGeom.standDepth),
                    -standBaseU,
                    -homeStandHalfV,
                    homeStandHalfV,
                    standGeom.isSemiProGround ? Math.round(standGeom.tierHeight * 0.72) : standGeom.tierHeight,
                    4,
                    4,
                    standGeom.isSemiProGround ? Math.round(standGeom.tierHeight * 0.72) : standGeom.tierHeight
                  )}
                  fill="url(#standConcreteGrad)"
                  stroke={bannerTheme.primary}
                  strokeOpacity="0.55"
                  strokeWidth="1.2"
                />
                {standGeom.hasUpperRing && (
                  <polygon
                    points={polyUV(
                      -(standBaseU + standGeom.standDepth),
                      -(standBaseU + standGeom.standDepth * 0.52),
                      -homeStandHalfV,
                      homeStandHalfV,
                      standGeom.tierHeight + (standGeom.isMegaArena ? 9 : 5),
                      standGeom.tierHeight * 0.56,
                      standGeom.tierHeight * 0.56,
                      standGeom.tierHeight + (standGeom.isMegaArena ? 9 : 5)
                    )}
                    fill="url(#standUpperGrad)"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="0.85"
                  />
                )}
                {standGeom.isMegaArena && (
                  <polygon
                    points={polyUV(
                      -(standBaseU + standGeom.standDepth),
                      -(standBaseU + standGeom.standDepth * 0.77),
                      -homeStandHalfV,
                      homeStandHalfV,
                      standGeom.tierHeight + (standGeom.capacityTier === 'colossus' ? 14 : 10),
                      standGeom.tierHeight * 0.80,
                      standGeom.tierHeight * 0.80,
                      standGeom.tierHeight + (standGeom.capacityTier === 'colossus' ? 14 : 10)
                    )}
                    fill="url(#standSkyGrad)"
                    stroke="rgba(255,255,255,0.26)"
                    strokeWidth="0.9"
                  />
                )}
              </g>
            )}

            {/* RIGHT AWAY END STAND (Present on 10k+ 4-stand grounds; OMITTED on Amateur & Semi-Pro!) */}
            {standGeom.hasAwayEndStand && (
              <g data-testid="away-end-stand-deck">
                <polygon
                  points={polyUV(
                    standBaseU,
                    standBaseU + standGeom.standDepth,
                    -straightHalfV,
                    straightHalfV,
                    3,
                    rightTierHeight,
                    rightTierHeight,
                    3
                  )}
                  fill="url(#standConcreteGrad)"
                  stroke={bannerTheme.primary}
                  strokeOpacity="0.52"
                  strokeWidth="1.2"
                />
                {standGeom.hasUpperRing && (
                  <polygon
                    points={polyUV(
                      standBaseU + standGeom.standDepth * 0.52,
                      standBaseU + standGeom.standDepth,
                      -straightHalfV,
                      straightHalfV,
                      rightTierHeight * 0.56,
                      rightTierHeight + (standGeom.isMegaArena ? 4 : 1.5),
                      rightTierHeight + (standGeom.isMegaArena ? 4 : 1.5),
                      rightTierHeight * 0.56
                    )}
                    fill="url(#standUpperGrad)"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="0.85"
                  />
                )}
              </g>
            )}

            {/* CORNER BOWLS: Smooth curved arcs for Rounded/Track Bowls vs sharp mitered corners for English Box (10k+ only) */}
            {standGeom.hasCorners &&
              (standGeom.isRoundedBowl ? (
                <g data-testid="rounded-corner-stands">
                  <polygon
                    points={curvedCornerStandUV(
                      -1,
                      -1,
                      straightHalfU,
                      straightHalfV,
                      bowlInnerR,
                      standGeom.standDepth,
                      4,
                      4,
                      standGeom.tierHeight + (standGeom.isMegaArena ? 12 : standGeom.hasUpperRing ? 7 : 0),
                      standGeom.tierHeight + (standGeom.isMegaArena ? 10 : 0)
                    )}
                    fill="url(#standConcreteGrad)"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="0.9"
                  />
                  <polygon
                    points={curvedCornerStandUV(
                      1,
                      -1,
                      straightHalfU,
                      straightHalfV,
                      bowlInnerR,
                      standGeom.standDepth,
                      4,
                      3,
                      standGeom.tierHeight + (standGeom.isMegaArena ? 12 : standGeom.hasUpperRing ? 7 : 0),
                      rightTierHeight + (standGeom.isMegaArena ? 4 : 0)
                    )}
                    fill="url(#standConcreteGrad)"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="0.9"
                  />
                  <polygon
                    points={curvedCornerStandUV(
                      -1,
                      1,
                      straightHalfU,
                      straightHalfV,
                      bowlInnerR,
                      standGeom.standDepth,
                      2,
                      4,
                      fgTierHeight + (standGeom.isMegaArena ? 4 : standGeom.hasUpperRing ? 2 : 0),
                      standGeom.tierHeight + (standGeom.isMegaArena ? 10 : 0)
                    )}
                    fill="url(#standConcreteGrad)"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="0.9"
                  />
                  <polygon
                    points={curvedCornerStandUV(
                      1,
                      1,
                      straightHalfU,
                      straightHalfV,
                      bowlInnerR,
                      standGeom.standDepth,
                      2,
                      3,
                      fgTierHeight + (standGeom.isMegaArena ? 4 : standGeom.hasUpperRing ? 2 : 0),
                      rightTierHeight + (standGeom.isMegaArena ? 4 : 0)
                    )}
                    fill="url(#standConcreteGrad)"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="0.9"
                  />
                </g>
              ) : (() => {
                const topOuterZ =
                  standGeom.tierHeight +
                  (standGeom.capacityTier === 'colossus'
                    ? 16
                    : standGeom.isMegaArena
                    ? 12
                    : standGeom.hasUpperRing
                    ? 7
                    : 0);
                const homeOuterZ =
                  standGeom.tierHeight +
                  (standGeom.capacityTier === 'colossus'
                    ? 14
                    : standGeom.isMegaArena
                    ? 10
                    : standGeom.hasUpperRing
                    ? 5
                    : 0);
                const rightCornerZ =
                  rightTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 1.5) : 0);
                const fgCornerZ =
                  fgTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 2) : 0);
                const outerStandU = standBaseU + standGeom.standDepth;
                const outerStandV = standBaseV + standGeom.standDepth;
                return (
                  <g data-testid="angular-corner-stands">
                    {/* Top-Left Angular Corner */}
                    <polygon
                      points={polyUV(
                        -outerStandU,
                        -standBaseU,
                        -outerStandV,
                        -standBaseV,
                        Math.max(topOuterZ, homeOuterZ),
                        topOuterZ,
                        4,
                        homeOuterZ
                      )}
                      fill="url(#standConcreteGrad)"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="0.9"
                    />
                    {/* Top-Right Angular Corner (Level outer right edge at rightCornerZ to meet right facade seamlessly) */}
                    <polygon
                      points={polyUV(
                        standBaseU,
                        outerStandU,
                        -outerStandV,
                        -standBaseV,
                        topOuterZ,
                        rightCornerZ,
                        rightCornerZ,
                        3.5
                      )}
                      fill="url(#standConcreteGrad)"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="0.9"
                    />
                    {/* Bottom-Left Angular Corner (Level outer front edge at fgCornerZ to meet front facade seamlessly) */}
                    <polygon
                      points={polyUV(
                        -outerStandU,
                        -standBaseU,
                        standBaseV,
                        outerStandV,
                        homeOuterZ,
                        2,
                        fgCornerZ,
                        fgCornerZ
                      )}
                      fill="url(#standConcreteGrad)"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="0.9"
                    />
                    {/* Bottom-Right Angular Corner (Clean 90-degree miter matching both front & right exterior walls) */}
                    <polygon
                      points={polyUV(
                        standBaseU,
                        outerStandU,
                        standBaseV,
                        outerStandV,
                        2.5,
                        rightCornerZ,
                        fgCornerZ,
                        fgCornerZ
                      )}
                      fill="url(#standConcreteGrad)"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="0.9"
                    />
                  </g>
                );
              })())}

            {/* 3D END GABLE WALLS FOR OPEN-CORNER FREESTANDING STANDS (Top & Home Ends; closes open side faces cleanly) */}
            {standGeom.hasBottomStand &&
              !standGeom.hasCorners &&
              (camera === 'isometric' || camera === 'inspection') && (() => {
                const topOuterZ =
                  standGeom.tierHeight + (standGeom.hasUpperRing ? 7 : 0);
                const homeOuterZ =
                  standGeom.tierHeight + (standGeom.hasUpperRing ? 5 : 0);
                const outerStandU = standBaseU + standGeom.standDepth;
                const outerStandV = standBaseV + standGeom.standDepth;
                return (
                  <g data-testid="open-corner-gable-walls">
                    {/* Top Stand Right Open-End Gable Wall */}
                    <polygon
                      points={ptsStr([
                        project(topStandHalfU, -standBaseV, 4),
                        project(topStandHalfU, -outerStandV, topOuterZ),
                        project(topStandHalfU, -outerStandV, 0),
                        project(topStandHalfU, -standBaseV, 0),
                      ])}
                      fill="url(#megaFacadeRightGrad)"
                      stroke={isDaytime ? 'rgba(255,255,255,0.24)' : 'rgba(148,163,184,0.24)'}
                      strokeWidth="0.9"
                    />
                    {/* Home End Stand Bottom Open-End Gable Wall */}
                    <polygon
                      points={ptsStr([
                        project(-standBaseU, homeStandHalfV, 4),
                        project(-outerStandU, homeStandHalfV, homeOuterZ),
                        project(-outerStandU, homeStandHalfV, 0),
                        project(-standBaseU, homeStandHalfV, 0),
                      ])}
                      fill="url(#megaFacadeWallGrad)"
                      stroke={isDaytime ? 'rgba(255,255,255,0.28)' : 'rgba(148,163,184,0.26)'}
                      strokeWidth="0.9"
                    />
                  </g>
                );
              })()}

            {/* AUTHENTIC STADIUM FAN SECTIONS: Clean Stepped Concrete Tier Risers, Radial Gangway Stairs & Vomitory Tunnels */}
            <g data-testid="fan-section-aisles">
              {/* Horizontal Tier Risers only on stands that actually exist */}
              {(standGeom.capacityTier === 'colossus'
                ? [0.22, 0.46, 0.70, 0.88]
                : standGeom.hasThirdTier
                ? [0.26, 0.52, 0.78]
                : standGeom.isAmateurGround
                ? [0.35, 0.70]
                : [0.34, 0.68]
              ).map((frac, idx) => (
                <g key={`step-${idx}`} opacity={idx === 1 && standGeom.hasUpperRing ? 0.44 : 0.28}>
                  {/* Top Stand Riser */}
                  <line
                    x1={project(-topStandHalfU, -(standBaseV + standGeom.standDepth * frac), 4 + (standGeom.tierHeight - 4) * frac).x}
                    y1={project(-topStandHalfU, -(standBaseV + standGeom.standDepth * frac), 4 + (standGeom.tierHeight - 4) * frac).y}
                    x2={project(topStandHalfU, -(standBaseV + standGeom.standDepth * frac), 4 + (standGeom.tierHeight - 4) * frac).x}
                    y2={project(topStandHalfU, -(standBaseV + standGeom.standDepth * frac), 4 + (standGeom.tierHeight - 4) * frac).y}
                    stroke="#E2E8F0"
                    strokeWidth="0.85"
                  />
                  {/* Bottom Foreground Stand Riser (10k+ only) */}
                  {standGeom.hasBottomStand && (
                    <line
                      x1={project(-straightHalfU, standBaseV + standGeom.standDepth * frac, 2 + (fgTierHeight - 2) * frac).x}
                      y1={project(-straightHalfU, standBaseV + standGeom.standDepth * frac, 2 + (fgTierHeight - 2) * frac).y}
                      x2={project(straightHalfU, standBaseV + standGeom.standDepth * frac, 2 + (fgTierHeight - 2) * frac).x}
                      y2={project(straightHalfU, standBaseV + standGeom.standDepth * frac, 2 + (fgTierHeight - 2) * frac).y}
                      stroke="#E2E8F0"
                      strokeWidth="0.85"
                    />
                  )}
                  {/* Home End Riser (5k+ only) */}
                  {standGeom.hasHomeEndStand && (
                    <line
                      x1={project(-(standBaseU + standGeom.standDepth * frac), -homeStandHalfV, 4 + ((standGeom.isSemiProGround ? standGeom.tierHeight * 0.72 : standGeom.tierHeight) - 4) * frac).x}
                      y1={project(-(standBaseU + standGeom.standDepth * frac), -homeStandHalfV, 4 + ((standGeom.isSemiProGround ? standGeom.tierHeight * 0.72 : standGeom.tierHeight) - 4) * frac).y}
                      x2={project(-(standBaseU + standGeom.standDepth * frac), homeStandHalfV, 4 + ((standGeom.isSemiProGround ? standGeom.tierHeight * 0.72 : standGeom.tierHeight) - 4) * frac).x}
                      y2={project(-(standBaseU + standGeom.standDepth * frac), homeStandHalfV, 4 + ((standGeom.isSemiProGround ? standGeom.tierHeight * 0.72 : standGeom.tierHeight) - 4) * frac).y}
                      stroke="#E2E8F0"
                      strokeWidth="0.85"
                    />
                  )}
                  {/* Away End Riser (10k+ only) */}
                  {standGeom.hasAwayEndStand && (
                    <line
                      x1={project(standBaseU + standGeom.standDepth * frac, -straightHalfV, 3 + (rightTierHeight - 3) * frac).x}
                      y1={project(standBaseU + standGeom.standDepth * frac, -straightHalfV, 3 + (rightTierHeight - 3) * frac).y}
                      x2={project(standBaseU + standGeom.standDepth * frac, straightHalfV, 3 + (rightTierHeight - 3) * frac).x}
                      y2={project(standBaseU + standGeom.standDepth * frac, straightHalfV, 3 + (rightTierHeight - 3) * frac).y}
                      stroke="#E2E8F0"
                      strokeWidth="0.85"
                    />
                  )}
                </g>
              ))}

              {/* Mid-Tier Illuminated LED Concourse Ribbon separating Lower & Upper Decks */}
              {standGeom.hasUpperRing && (
                <g data-testid="mid-tier-led-ribbon">
                  <polygon
                    points={polyUV(
                      -topStandHalfU,
                      topStandHalfU,
                      -(standBaseV + standGeom.standDepth * 0.535),
                      -(standBaseV + standGeom.standDepth * 0.485),
                      standGeom.tierHeight * 0.56,
                      standGeom.tierHeight * 0.56,
                      standGeom.tierHeight * 0.52,
                      standGeom.tierHeight * 0.52
                    )}
                    fill={standGeom.isMegaArena ? '#0B1220' : palette.primary}
                    stroke={palette.primary}
                    strokeWidth={standGeom.isMegaArena ? '1.35' : '0.4'}
                    opacity="0.9"
                  />
                  {standGeom.isMegaArena && (
                    <line
                      x1={project(-topStandHalfU, -(standBaseV + standGeom.standDepth * 0.505), standGeom.tierHeight * 0.545).x}
                      y1={project(-topStandHalfU, -(standBaseV + standGeom.standDepth * 0.505), standGeom.tierHeight * 0.545).y}
                      x2={project(topStandHalfU, -(standBaseV + standGeom.standDepth * 0.505), standGeom.tierHeight * 0.545).x}
                      y2={project(topStandHalfU, -(standBaseV + standGeom.standDepth * 0.505), standGeom.tierHeight * 0.545).y}
                      stroke={isDaytime ? palette.primary : '#F8FAFC'}
                      strokeOpacity={isDaytime ? '0.95' : '0.88'}
                      strokeWidth="1.6"
                    />
                  )}
                  {standGeom.hasHomeEndStand && (
                    <polygon
                      points={polyUV(
                        -(standBaseU + standGeom.standDepth * 0.535),
                        -(standBaseU + standGeom.standDepth * 0.485),
                        -homeStandHalfV,
                        homeStandHalfV,
                        standGeom.tierHeight * 0.56,
                        standGeom.tierHeight * 0.52,
                        standGeom.tierHeight * 0.52,
                        standGeom.tierHeight * 0.56
                      )}
                      fill={standGeom.isMegaArena ? '#0B1220' : palette.primary}
                      stroke={palette.primary}
                      strokeWidth={standGeom.isMegaArena ? '1.25' : '0.4'}
                      opacity="0.88"
                    />
                  )}
                  {standGeom.hasAwayEndStand && standGeom.isMegaArena && (
                    <polygon
                      points={polyUV(
                        standBaseU + standGeom.standDepth * 0.49,
                        standBaseU + standGeom.standDepth * 0.535,
                        -straightHalfV,
                        straightHalfV,
                        rightTierHeight * 0.52,
                        rightTierHeight * 0.56,
                        rightTierHeight * 0.56,
                        rightTierHeight * 0.52
                      )}
                      fill="#0B1220"
                      stroke={palette.primary}
                      strokeWidth="1.15"
                      opacity="0.88"
                    />
                  )}
                  {(standGeom.isMegaArena || standGeom.capacityTier === 'colossus') && (
                    <>
                      {/* Grand Sky-Deck Concourse Fascia for 60k+ Mega-Arenas & 90k+ Colossi */}
                      <polygon
                        points={polyUV(
                          -topStandHalfU,
                          topStandHalfU,
                          -(standBaseV + standGeom.standDepth * 0.795),
                          -(standBaseV + standGeom.standDepth * 0.755),
                          standGeom.tierHeight * 0.83,
                          standGeom.tierHeight * 0.83,
                          standGeom.tierHeight * 0.79,
                          standGeom.tierHeight * 0.79
                        )}
                        fill={palette.secondary}
                        opacity={standGeom.capacityTier === 'colossus' ? '0.82' : '0.62'}
                      />
                      <polygon
                        points={polyUV(
                          -(standBaseU + standGeom.standDepth * 0.795),
                          -(standBaseU + standGeom.standDepth * 0.755),
                          -homeStandHalfV,
                          homeStandHalfV,
                          standGeom.tierHeight * 0.83,
                          standGeom.tierHeight * 0.79,
                          standGeom.tierHeight * 0.79,
                          standGeom.tierHeight * 0.83
                        )}
                        fill={palette.secondary}
                        opacity={standGeom.capacityTier === 'colossus' ? '0.78' : '0.58'}
                      />
                    </>
                  )}
                </g>
              )}

              {/* Cleaned-Up Sideline Radial Concrete Stairways & Vomitories */}
              {sidelineAisles.map((normU, idx) => {
                const uPos = normU * (topStandHalfU - 4);
                const aisleHalfU = Math.max(2.2, standGeom.standDepth * 0.055);
                return (
                  <g key={`side-aisle-${idx}`}>
                    {/* Top Stand Gangway Stairs (Clean architectural concrete without noisy neon yellow) */}
                    <polygon
                      points={polyUV(
                        uPos - aisleHalfU,
                        uPos + aisleHalfU,
                        -(standBaseV + standGeom.standDepth * 0.96),
                        -(standBaseV + 1.5),
                        standGeom.tierHeight,
                        standGeom.tierHeight,
                        4,
                        4
                      )}
                      fill="#94A8BF"
                      opacity={standGeom.isAmateurGround ? '0.45' : '0.56'}
                    />
                    {!standGeom.isAmateurGround && (
                      <line
                        x1={project(uPos, -(standBaseV + standGeom.standDepth * 0.94), standGeom.tierHeight).x}
                        y1={project(uPos, -(standBaseV + standGeom.standDepth * 0.94), standGeom.tierHeight).y}
                        x2={project(uPos, -(standBaseV + 2), 4).x}
                        y2={project(uPos, -(standBaseV + 2), 4).y}
                        stroke="#E2E8F0"
                        strokeOpacity="0.28"
                        strokeWidth="0.85"
                        strokeDasharray="2 3"
                      />
                    )}
                    {/* Vomitory Portal Entrance (Pro 10k+ stadiums only) */}
                    {!standGeom.isAmateurGround && !standGeom.isSemiProGround && idx % 2 === 0 && (
                      <polygon
                        points={polyUV(
                          uPos - aisleHalfU * 1.3,
                          uPos + aisleHalfU * 1.3,
                          -(standBaseV + standGeom.standDepth * 0.45),
                          -(standBaseV + standGeom.standDepth * 0.34),
                          standGeom.tierHeight * 0.47,
                          standGeom.tierHeight * 0.47,
                          standGeom.tierHeight * 0.34,
                          standGeom.tierHeight * 0.34
                        )}
                        fill="#0F172A"
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth="0.55"
                      />
                    )}
                    {/* Bottom Foreground Stand Gangway Stairs (10k+ only) */}
                    {standGeom.hasBottomStand && (
                      <>
                        <polygon
                          points={polyUV(
                            uPos - aisleHalfU,
                            uPos + aisleHalfU,
                            standBaseV + 1.5,
                            standBaseV + standGeom.standDepth * 0.96,
                            2,
                            2,
                            fgTierHeight,
                            fgTierHeight
                          )}
                          fill="#94A8BF"
                          opacity="0.52"
                        />
                        <line
                          x1={project(uPos, standBaseV + 2, 2).x}
                          y1={project(uPos, standBaseV + 2, 2).y}
                          x2={project(uPos, standBaseV + standGeom.standDepth * 0.94, fgTierHeight).x}
                          y2={project(uPos, standBaseV + standGeom.standDepth * 0.94, fgTierHeight).y}
                          stroke="#E2E8F0"
                          strokeOpacity="0.24"
                          strokeWidth="0.8"
                          strokeDasharray="2 3"
                        />
                      </>
                    )}
                  </g>
                );
              })}

              {/* Behind-Goal Radial Concrete Stairways (Only when Home / Away End stands exist) */}
              {(standGeom.hasHomeEndStand || standGeom.hasAwayEndStand) &&
                endAisles.map((normV, idx) => {
                  const vPos = normV * (homeStandHalfV - 3);
                  const aisleHalfV = Math.max(2.1, standGeom.standDepth * 0.055);
                  const homeZTop = standGeom.isSemiProGround
                    ? Math.round(standGeom.tierHeight * 0.72)
                    : standGeom.tierHeight;
                  return (
                    <g key={`end-aisle-${idx}`}>
                      {standGeom.hasHomeEndStand && (
                        <>
                          <polygon
                            points={polyUV(
                              -(standBaseU + standGeom.standDepth * 0.96),
                              -(standBaseU + 1.5),
                              vPos - aisleHalfV,
                              vPos + aisleHalfV,
                              homeZTop,
                              4,
                              4,
                              homeZTop
                            )}
                            fill="#94A8BF"
                            opacity="0.56"
                          />
                          {!standGeom.isSemiProGround && (
                            <polygon
                              points={polyUV(
                                -(standBaseU + standGeom.standDepth * 0.49),
                                -(standBaseU + standGeom.standDepth * 0.36),
                                vPos - aisleHalfV * 1.2,
                                vPos + aisleHalfV * 1.2,
                                homeZTop * 0.51,
                                homeZTop * 0.36,
                                homeZTop * 0.36,
                                homeZTop * 0.51
                              )}
                              fill="#0F172A"
                              stroke="rgba(255,255,255,0.35)"
                              strokeWidth="0.55"
                            />
                          )}
                        </>
                      )}
                      {standGeom.hasAwayEndStand && (
                        <polygon
                          points={polyUV(
                            standBaseU + 1.5,
                            standBaseU + standGeom.standDepth * 0.96,
                            vPos - aisleHalfV,
                            vPos + aisleHalfV,
                            3,
                            rightTierHeight,
                            rightTierHeight,
                            3
                          )}
                          fill="#94A8BF"
                          opacity="0.52"
                        />
                      )}
                    </g>
                  );
                })}

              {/* Radial Corner Stairways for Rounded/Track Bowls */}
              {standGeom.hasCorners &&
                standGeom.isRoundedBowl &&
                [
                  { uS: -1, vS: -1, zO: standGeom.tierHeight },
                  { uS: 1, vS: -1, zO: rightTierHeight },
                  { uS: -1, vS: 1, zO: fgTierHeight },
                  { uS: 1, vS: 1, zO: fgTierHeight },
                ].map((c, idx) => {
                  const ang = Math.PI * 0.25;
                  const rIn = bowlInnerR + 2;
                  const rOut = bowlInnerR + standGeom.standDepth * 0.94;
                  const pIn = project(c.uS * (straightHalfU + Math.sin(ang) * rIn), c.vS * (straightHalfV + Math.cos(ang) * rIn), 3);
                  const pOut = project(c.uS * (straightHalfU + Math.sin(ang) * rOut), c.vS * (straightHalfV + Math.cos(ang) * rOut), c.zO);
                  return (
                    <line
                      key={`corner-aisle-${idx}`}
                      x1={pIn.x}
                      y1={pIn.y}
                      x2={pOut.x}
                      y2={pOut.y}
                      stroke="#94A8BF"
                      strokeWidth="3.4"
                      strokeOpacity="0.54"
                    />
                  );
                })}
              {/* Classic Old-School German Standing-Terrace Crush Barriers (Wellenbrecher) on the Home Stehplatz-Kurve */}
              {isClassicGermanBowl && (
                <g data-testid="german-crush-barriers" opacity="0.62">
                  {[0.24, 0.42].map((depthFrac, rIdx) => {
                    const uRail = -(standBaseU + standGeom.standDepth * depthFrac);
                    const zRail = 4 + (standGeom.tierHeight - 4) * depthFrac + 1.2;
                    return [-0.66, -0.22, 0.22, 0.66].map((vSeg, sIdx) => {
                      const vA = straightHalfV * (vSeg - 0.14);
                      const vB = straightHalfV * (vSeg + 0.14);
                      const pA = project(uRail, vA, zRail);
                      const pB = project(uRail, vB, zRail);
                      return (
                        <line
                          key={`wb-${rIdx}-${sIdx}`}
                          x1={pA.x}
                          y1={pA.y}
                          x2={pB.x}
                          y2={pB.y}
                          stroke={isDaytime ? '#1E293B' : '#CBD5E1'}
                          strokeWidth="1.25"
                          strokeLinecap="round"
                        />
                      );
                    });
                  })}
                </g>
              )}
            </g>

            {/* VIP Hospitality Executive Skyboxes (Flush within rear top stand fascia — never on amateur pitches) */}
            {vipSuitesVisible && (
              <g data-testid="vip-skyboxes">
                {Array.from({ length: vipBoxesCount }).map((_, idx) => {
                  const span = vipSpanHalfU * 2;
                  const boxLen = span / vipBoxesCount - 4;
                  const uStart = -vipSpanHalfU + idx * (span / vipBoxesCount);
                  const vVipBack = -(standBaseV + standGeom.standDepth - 1);
                  const vVipFront = -(standBaseV + standGeom.standDepth - 10);
                  const vipZ = standGeom.tierHeight + (standGeom.isMegaArena ? 11 : 6);
                  return (
                    <polygon
                      key={`vip-${idx}`}
                      points={polyUV(
                        uStart,
                        uStart + boxLen,
                        vVipBack,
                        vVipFront,
                        vipZ,
                        vipZ,
                        vipZ - 4.5,
                        vipZ - 4.5
                      )}
                      fill={vipSuitesIlluminated ? '#FDE68A' : '#475569'}
                      stroke={bannerTheme.secondary}
                      strokeWidth="0.95"
                      opacity={vipSuitesIlluminated ? 0.94 : 0.72}
                    />
                  );
                })}
              </g>
            )}

          </g>

          {/* 3. TOP & BEHIND-GOAL SPECTATORS */}
          {memoizedUpperAndEndCrowd}

          {/* 3B. ARCHITECTURAL CANTILEVERED ROOF CANOPY & MONUMENTAL 60k+ MEGA-ROOF RING (Rendered cleanly ABOVE upper-deck spectators) */}
          {standGeom.hasRoofCanopy && (
            <g
              opacity={standGeom.isMegaArena ? 0.94 : standGeom.style === 'english_box' ? 0.72 : 0.62}
              data-testid="stadium-roof-canopy"
              pointerEvents="none"
            >
              {standGeom.isMegaArena ? (
                <g data-testid="mega-arena-roof">
                  {/* Top Stand Cantilevered Roof Crown (Classic galvanized steel truss roof on German bowls vs sleek silver crown) */}
                  <polygon
                    points={polyUV(
                      isClassicGermanBowl
                        ? -straightHalfU
                        : standGeom.isRoundedBowl
                        ? -(straightHalfU + 4)
                        : -(standBaseU + standGeom.standDepth),
                      isClassicGermanBowl
                        ? straightHalfU
                        : standGeom.isRoundedBowl
                        ? straightHalfU + 4
                        : straightHalfU,
                      -(standBaseV + standGeom.standDepth + (standGeom.isRoundedBowl ? 3 : 0)),
                      -(standBaseV + standGeom.standDepth * (isClassicGermanBowl ? 0.56 : 0.64)),
                      standGeom.tierHeight + 16,
                      standGeom.tierHeight + 16,
                      standGeom.tierHeight + 13,
                      standGeom.tierHeight + 13
                    )}
                    fill={isClassicGermanBowl ? 'url(#germanTrussRoofGrad)' : 'url(#megaRoofCrownGrad)'}
                    fillOpacity={isClassicGermanBowl ? '0.92' : '0.88'}
                    stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : palette.primary}
                    strokeOpacity={isClassicGermanBowl ? '0.45' : '0.72'}
                    strokeWidth={isClassicGermanBowl ? '0.9' : '1.3'}
                  />
                  {/* Tapered Top-Right Corner Roof Join for Angular 60k+ Mega-Arenas (English Box / Open Terrace) */}
                  {!standGeom.isRoundedBowl && standGeom.hasCorners && (
                    <polygon
                      points={polyUV(
                        straightHalfU,
                        standBaseU + standGeom.standDepth,
                        -(standBaseV + standGeom.standDepth),
                        -(standBaseV + standGeom.standDepth * 0.64),
                        standGeom.tierHeight + 16,
                        rightTierHeight + 10,
                        rightTierHeight + 7,
                        standGeom.tierHeight + 13
                      )}
                      fill="url(#megaRoofCrownGrad)"
                      fillOpacity="0.84"
                      stroke={palette.primary}
                      strokeOpacity="0.64"
                      strokeWidth="1.15"
                    />
                  )}
                  {/* Inner Cantilever Overhang (Corrugated steel rim on Classic German Bowl vs translucent glass skylight) */}
                  <polygon
                    points={polyUV(
                      isClassicGermanBowl
                        ? -straightHalfU
                        : standGeom.isRoundedBowl
                        ? -(straightHalfU + 4)
                        : -(standBaseU + standGeom.standDepth * 0.64),
                      isClassicGermanBowl
                        ? straightHalfU
                        : standGeom.isRoundedBowl
                        ? straightHalfU + 4
                        : straightHalfU,
                      -(standBaseV + standGeom.standDepth * (isClassicGermanBowl ? 0.56 : 0.64)),
                      -(standBaseV + standGeom.standDepth * (isClassicGermanBowl ? 0.36 : 0.32)),
                      standGeom.tierHeight + 13,
                      standGeom.tierHeight + 13,
                      standGeom.tierHeight + 10,
                      standGeom.tierHeight + 10
                    )}
                    fill={
                      isClassicGermanBowl
                        ? isDaytime
                          ? 'rgba(148, 163, 184, 0.42)'
                          : 'rgba(71, 85, 105, 0.36)'
                        : isDaytime
                        ? 'rgba(241, 245, 249, 0.24)'
                        : 'rgba(203, 213, 225, 0.16)'
                    }
                    stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : 'rgba(255, 255, 255, 0.55)'}
                    strokeOpacity={isClassicGermanBowl ? '0.45' : '1'}
                    strokeWidth="0.85"
                  />
                  {/* Left Home End Cantilevered Roof Crown + Inner Overhang (Omitted in endzone camera where it sits behind lens) */}
                  {camera !== 'endzone' && (
                    <>
                      <polygon
                        points={polyUV(
                          -(standBaseU + standGeom.standDepth + (standGeom.isRoundedBowl ? 3 : 0)),
                          -(standBaseU + standGeom.standDepth * (isClassicGermanBowl ? 0.56 : 0.64)),
                          standGeom.isRoundedBowl
                            ? -straightHalfV
                            : -(standBaseV + standGeom.standDepth * 0.64),
                          straightHalfV,
                          standGeom.tierHeight + 15,
                          standGeom.tierHeight + 12,
                          standGeom.tierHeight + 12,
                          standGeom.tierHeight + 15
                        )}
                        fill={isClassicGermanBowl ? 'url(#germanTrussRoofGrad)' : 'url(#megaRoofCrownGrad)'}
                        fillOpacity={isClassicGermanBowl ? '0.9' : '0.86'}
                        stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : palette.primary}
                        strokeOpacity={isClassicGermanBowl ? '0.42' : '0.68'}
                        strokeWidth={isClassicGermanBowl ? '0.85' : '1.25'}
                      />
                      <polygon
                        points={polyUV(
                          -(standBaseU + standGeom.standDepth * (isClassicGermanBowl ? 0.56 : 0.64)),
                          -(standBaseU + standGeom.standDepth * (isClassicGermanBowl ? 0.36 : 0.34)),
                          standGeom.isRoundedBowl
                            ? -straightHalfV
                            : -(standBaseV + standGeom.standDepth * 0.32),
                          straightHalfV,
                          standGeom.tierHeight + 12,
                          standGeom.tierHeight + 9,
                          standGeom.tierHeight + 9,
                          standGeom.tierHeight + 12
                        )}
                        fill={
                          isClassicGermanBowl
                            ? isDaytime
                              ? 'rgba(148, 163, 184, 0.36)'
                              : 'rgba(71, 85, 105, 0.3)'
                            : isDaytime
                            ? 'rgba(241, 245, 249, 0.2)'
                            : 'rgba(203, 213, 225, 0.14)'
                        }
                        stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : 'rgba(255, 255, 255, 0.45)'}
                        strokeOpacity={isClassicGermanBowl ? '0.42' : '1'}
                        strokeWidth="0.8"
                      />
                    </>
                  )}
                  {/* Right Away End Cantilevered Outer Roof Rim */}
                  <polygon
                    points={polyUV(
                      standBaseU + standGeom.standDepth * (isClassicGermanBowl ? 0.6 : 0.68),
                      standBaseU + standGeom.standDepth + (standGeom.isRoundedBowl ? 3 : 0),
                      standGeom.isRoundedBowl
                        ? -straightHalfV
                        : -(standBaseV + standGeom.standDepth * 0.64),
                      straightHalfV,
                      rightTierHeight + 7,
                      rightTierHeight + 10,
                      rightTierHeight + 10,
                      rightTierHeight + 7
                    )}
                    fill={isClassicGermanBowl ? 'url(#germanTrussRoofGrad)' : 'url(#megaRoofCrownGrad)'}
                    fillOpacity={isClassicGermanBowl ? '0.88' : '0.78'}
                    stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : palette.primary}
                    strokeOpacity={isClassicGermanBowl ? '0.42' : '0.62'}
                    strokeWidth={isClassicGermanBowl ? '0.85' : '1.2'}
                  />
                  {/* Flush Curved Corner Roof Rim Bands for Rounded 60k+ Mega-Arenas */}
                  {standGeom.isRoundedBowl && (
                    <>
                      {camera !== 'endzone' && (
                        <>
                          <polygon
                            points={curvedCornerStandUV(
                              -1,
                              -1,
                              straightHalfU,
                              straightHalfV,
                              bowlInnerR + standGeom.standDepth * (isClassicGermanBowl ? 0.56 : 0.64),
                              standGeom.standDepth * (isClassicGermanBowl ? 0.44 : 0.36) + 3,
                              standGeom.tierHeight + 13,
                              standGeom.tierHeight + 12,
                              standGeom.tierHeight + 16,
                              standGeom.tierHeight + 15,
                              12
                            )}
                            fill={isClassicGermanBowl ? 'url(#germanTrussRoofGrad)' : 'url(#megaRoofCrownGrad)'}
                            fillOpacity={isClassicGermanBowl ? '0.92' : '0.86'}
                            stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : palette.primary}
                            strokeOpacity={isClassicGermanBowl ? '0.42' : '0.72'}
                            strokeWidth={isClassicGermanBowl ? '0.85' : '1.25'}
                          />
                          <polygon
                            points={curvedCornerStandUV(
                              -1,
                              -1,
                              straightHalfU,
                              straightHalfV,
                              bowlInnerR + standGeom.standDepth * (isClassicGermanBowl ? 0.36 : 0.34),
                              standGeom.standDepth * (isClassicGermanBowl ? 0.2 : 0.3),
                              standGeom.tierHeight + 10,
                              standGeom.tierHeight + 9,
                              standGeom.tierHeight + 13,
                              standGeom.tierHeight + 12,
                              12
                            )}
                            fill={
                              isClassicGermanBowl
                                ? isDaytime
                                  ? 'rgba(148, 163, 184, 0.38)'
                                  : 'rgba(71, 85, 105, 0.32)'
                                : isDaytime
                                ? 'rgba(241, 245, 249, 0.2)'
                                : 'rgba(203, 213, 225, 0.14)'
                            }
                            stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : 'rgba(255,255,255,0.42)'}
                            strokeOpacity={isClassicGermanBowl ? '0.4' : '1'}
                            strokeWidth="0.8"
                          />
                        </>
                      )}
                      <polygon
                        points={curvedCornerStandUV(
                          1,
                          -1,
                          straightHalfU,
                          straightHalfV,
                          bowlInnerR + standGeom.standDepth * (isClassicGermanBowl ? 0.6 : 0.66),
                          standGeom.standDepth * (isClassicGermanBowl ? 0.4 : 0.34) + 3,
                          standGeom.tierHeight + 13,
                          rightTierHeight + 7,
                          standGeom.tierHeight + 16,
                          rightTierHeight + 10,
                          12
                        )}
                        fill={isClassicGermanBowl ? 'url(#germanTrussRoofGrad)' : 'url(#megaRoofCrownGrad)'}
                        fillOpacity={isClassicGermanBowl ? '0.88' : '0.82'}
                        stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : palette.primary}
                        strokeOpacity={isClassicGermanBowl ? '0.42' : '0.68'}
                        strokeWidth={isClassicGermanBowl ? '0.85' : '1.15'}
                      />
                    </>
                  )}
                  {/* Radial Cantilever Steel Truss Ribs (Bold dark-steel box girders on Classic German Bowls + stay-cable roof pylons!) */}
                  {[-0.9, -0.68, -0.45, -0.22, 0, 0.22, 0.45, 0.68, 0.9].map((frac, rIdx) => {
                    const uRib = straightHalfU * frac;
                    const p1 = project(
                      uRib,
                      -(standBaseV + standGeom.standDepth + (standGeom.isRoundedBowl ? 3 : 0)),
                      standGeom.tierHeight + 16.5
                    );
                    const p2 = project(
                      uRib,
                      -(standBaseV + standGeom.standDepth * (isClassicGermanBowl ? 0.36 : 0.32)),
                      standGeom.tierHeight + 10
                    );
                    const isStayPylon = isClassicGermanBowl && rIdx % 2 === 1;
                    const pMastTop = isStayPylon
                      ? project(uRib, -(standBaseV + standGeom.standDepth + 5), standGeom.tierHeight + 29)
                      : null;
                    return (
                      <g key={`mega-rib-t-${frac}`}>
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={isClassicGermanBowl ? (isDaytime ? '#334155' : '#CBD5E1') : '#F8FAFC'}
                          strokeWidth={isClassicGermanBowl ? '1.85' : '1.5'}
                          opacity="0.92"
                        />
                        {pMastTop && (
                          <g data-testid="german-roof-stay-pylon">
                            <line
                              x1={p1.x}
                              y1={p1.y}
                              x2={pMastTop.x}
                              y2={pMastTop.y}
                              stroke={isDaytime ? '#475569' : '#CBD5E1'}
                              strokeWidth="1.9"
                            />
                            <line
                              x1={pMastTop.x}
                              y1={pMastTop.y}
                              x2={p2.x}
                              y2={p2.y}
                              stroke={isDaytime ? '#64748B' : '#94A3B8'}
                              strokeWidth="0.95"
                              opacity="0.85"
                            />
                          </g>
                        )}
                        {!isDaytime && (
                          <>
                            <circle cx={p2.x} cy={p2.y} r="6.2" fill="#FEF9C3" opacity="0.22" />
                            <circle cx={p2.x} cy={p2.y} r="2.0" fill="#FFFBEB" opacity="0.96" />
                          </>
                        )}
                      </g>
                    );
                  })}
                  {camera !== 'endzone' &&
                    [-0.72, -0.36, 0, 0.36, 0.72].map((frac, lIdx) => {
                      const vRib = straightHalfV * frac;
                      const pL1 = project(
                        -(standBaseU + standGeom.standDepth + (standGeom.isRoundedBowl ? 3 : 0)),
                        vRib,
                        standGeom.tierHeight + 15.5
                      );
                      const pL2 = project(
                        -(standBaseU + standGeom.standDepth * (isClassicGermanBowl ? 0.38 : 0.34)),
                        vRib,
                        standGeom.tierHeight + 9.2
                      );
                      const pLMast =
                        isClassicGermanBowl && lIdx % 2 === 1
                          ? project(-(standBaseU + standGeom.standDepth + 5), vRib, standGeom.tierHeight + 27)
                          : null;
                      return (
                        <g key={`mega-rib-l-${frac}`}>
                          <line
                            x1={pL1.x}
                            y1={pL1.y}
                            x2={pL2.x}
                            y2={pL2.y}
                            stroke={isClassicGermanBowl ? (isDaytime ? '#334155' : '#CBD5E1') : '#F8FAFC'}
                            strokeWidth={isClassicGermanBowl ? '1.7' : '1.35'}
                            opacity="0.88"
                          />
                          {pLMast && (
                            <>
                              <line x1={pL1.x} y1={pL1.y} x2={pLMast.x} y2={pLMast.y} stroke={isDaytime ? '#475569' : '#CBD5E1'} strokeWidth="1.75" />
                              <line x1={pLMast.x} y1={pLMast.y} x2={pL2.x} y2={pL2.y} stroke={isDaytime ? '#64748B' : '#94A3B8'} strokeWidth="0.9" opacity="0.82" />
                            </>
                          )}
                          {!isDaytime && (
                            <>
                              <circle cx={pL2.x} cy={pL2.y} r="5.2" fill="#FEF9C3" opacity="0.18" />
                              <circle cx={pL2.x} cy={pL2.y} r="1.75" fill="#FFFBEB" opacity="0.92" />
                            </>
                          )}
                        </g>
                      );
                    })}
                  {/* Signature Soaring Architectural Tension Arch for 90k+ World Colossi */}
                  {standGeom.capacityTier === 'colossus' && (() => {
                    const aL = project(-(straightHalfU + 14), -(standBaseV + standGeom.standDepth + 3), standGeom.tierHeight + 15);
                    const aR = project(straightHalfU + 14, -(standBaseV + standGeom.standDepth + 3), standGeom.tierHeight + 15);
                    const aMid = project(0, -(standBaseV + standGeom.standDepth + 5), standGeom.tierHeight + 44);
                    return (
                      <g data-testid="colossus-signature-arch">
                        <path
                          d={`M ${aL.x.toFixed(1)} ${aL.y.toFixed(1)} Q ${aMid.x.toFixed(1)} ${aMid.y.toFixed(1)} ${aR.x.toFixed(1)} ${aR.y.toFixed(1)}`}
                          fill="none"
                          stroke={isClassicGermanBowl ? '#CBD5E1' : '#F8FAFC'}
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          opacity="0.94"
                        />
                        <path
                          d={`M ${aL.x.toFixed(1)} ${aL.y.toFixed(1)} Q ${aMid.x.toFixed(1)} ${aMid.y.toFixed(1)} ${aR.x.toFixed(1)} ${aR.y.toFixed(1)}`}
                          fill="none"
                          stroke={palette.primary}
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          opacity="0.82"
                        />
                      </g>
                    );
                  })()}
                </g>
              ) : (
                <>
                  {(standGeom.hasFullRoofWrap || standGeom.style === 'english_box' || standGeom.hasCantileverRoof || isClassicGermanBowl) && (
                    <>
                      <polygon
                        points={polyUV(
                          standGeom.style === 'english_box' && standGeom.hasCorners
                            ? -(standBaseU + standGeom.standDepth)
                            : isClassicGermanBowl
                            ? -straightHalfU
                            : standGeom.isRoundedBowl
                            ? -(straightHalfU + 4)
                            : -straightHalfU,
                          isClassicGermanBowl
                            ? straightHalfU
                            : standGeom.isRoundedBowl
                            ? straightHalfU + 4
                            : straightHalfU,
                          -(standBaseV + standGeom.standDepth + (standGeom.isRoundedBowl ? 2 : 0)),
                          -(standBaseV + standGeom.standDepth * (isClassicGermanBowl ? 0.38 : 0.42)),
                          standGeom.tierHeight + (isClassicGermanBowl ? 13 : 12),
                          standGeom.tierHeight + (isClassicGermanBowl ? 13 : 12),
                          standGeom.tierHeight + (isClassicGermanBowl ? 9 : 8.5),
                          standGeom.tierHeight + (isClassicGermanBowl ? 9 : 8.5)
                        )}
                        fill={
                          isClassicGermanBowl
                            ? 'url(#germanTrussRoofGrad)'
                            : standGeom.style === 'english_box'
                            ? 'rgba(241, 245, 249, 0.34)'
                            : 'rgba(226, 232, 240, 0.24)'
                        }
                        fillOpacity={isClassicGermanBowl ? '0.88' : '1'}
                        stroke={
                          isClassicGermanBowl
                            ? isDaytime
                              ? '#475569'
                              : '#64748B'
                            : standGeom.style === 'english_box'
                            ? palette.primary
                            : 'rgba(248, 250, 252, 0.55)'
                        }
                        strokeOpacity={isClassicGermanBowl ? '0.52' : '1'}
                        strokeWidth={isClassicGermanBowl ? '1.0' : '1.2'}
                      />
                      {/* Classic German Curved Partial Kurve Roof Wings on 35k-59k Rounded Bowls (10k-34k keeps open-air Stehkurven!) */}
                      {isClassicGermanBowl && standGeom.clampedCapacity >= 35000 && camera !== 'endzone' && (
                        <>
                          <polygon
                            points={curvedCornerStandUV(
                              -1,
                              -1,
                              straightHalfU,
                              straightHalfV,
                              bowlInnerR + standGeom.standDepth * 0.38,
                              standGeom.standDepth * 0.62 + 2,
                              standGeom.tierHeight + 9,
                              standGeom.tierHeight + 9,
                              standGeom.tierHeight + 13,
                              standGeom.tierHeight + 13,
                              12
                            )}
                            fill="url(#germanTrussRoofGrad)"
                            fillOpacity="0.88"
                            stroke={isDaytime ? '#475569' : '#64748B'}
                            strokeOpacity="0.45"
                            strokeWidth="0.9"
                          />
                          <polygon
                            points={polyUV(
                              -(standBaseU + standGeom.standDepth + 2),
                              -(standBaseU + standGeom.standDepth * 0.38),
                              -straightHalfV,
                              straightHalfV,
                              standGeom.tierHeight + 13,
                              standGeom.tierHeight + 9,
                              standGeom.tierHeight + 9,
                              standGeom.tierHeight + 13
                            )}
                            fill="url(#germanTrussRoofGrad)"
                            fillOpacity="0.88"
                            stroke={isDaytime ? '#475569' : '#64748B'}
                            strokeOpacity="0.45"
                            strokeWidth="0.9"
                          />
                        </>
                      )}
                      {/* Clean tapered Top-Right roof corner join for enclosed English Box grounds */}
                      {standGeom.style === 'english_box' && standGeom.hasCorners && (
                        <polygon
                          points={polyUV(
                            straightHalfU,
                            standBaseU + standGeom.standDepth,
                            -(standBaseV + standGeom.standDepth),
                            -(standBaseV + standGeom.standDepth * 0.42),
                            standGeom.tierHeight + 12,
                            rightTierHeight + 9,
                            rightTierHeight + 5.5,
                            standGeom.tierHeight + 8.5
                          )}
                          fill="rgba(241, 245, 249, 0.3)"
                          stroke={palette.primary}
                          strokeOpacity="0.65"
                          strokeWidth="1.05"
                        />
                      )}
                    </>
                  )}
                  {standGeom.style === 'english_box' && (
                    <>
                      {camera !== 'endzone' && (
                        <polygon
                          points={polyUV(
                            -(standBaseU + standGeom.standDepth),
                            -(standBaseU + standGeom.standDepth * 0.44),
                            standGeom.hasCorners ? -(standBaseV + standGeom.standDepth * 0.42) : -straightHalfV,
                            straightHalfV,
                            standGeom.tierHeight + 10,
                            standGeom.tierHeight + 7,
                            standGeom.tierHeight + 7,
                            standGeom.tierHeight + 10
                          )}
                          fill="rgba(241, 245, 249, 0.24)"
                          stroke={palette.primary}
                          strokeOpacity="0.55"
                          strokeWidth="1.0"
                        />
                      )}
                      <polygon
                        points={polyUV(
                          standBaseU + standGeom.standDepth * 0.44,
                          standBaseU + standGeom.standDepth,
                          standGeom.hasCorners ? -(standBaseV + standGeom.standDepth * 0.42) : -straightHalfV,
                          straightHalfV,
                          rightTierHeight + 5.5,
                          rightTierHeight + 9,
                          rightTierHeight + 9,
                          rightTierHeight + 5.5
                        )}
                        fill="rgba(241, 245, 249, 0.24)"
                        stroke={bannerTheme.primary}
                        strokeOpacity="0.5"
                        strokeWidth="1.0"
                      />
                    </>
                  )}
                  {[-0.78, -0.45, -0.15, 0.15, 0.45, 0.78].map((frac, rIdx) => {
                    const uRib = straightHalfU * frac;
                    const p1 = project(
                      uRib,
                      -(standBaseV + standGeom.standDepth + (standGeom.isRoundedBowl ? 2 : 0)),
                      standGeom.tierHeight + (isClassicGermanBowl ? 13 : 12)
                    );
                    const p2 = project(
                      uRib,
                      -(standBaseV + standGeom.standDepth * (isClassicGermanBowl ? 0.36 : 0.42)),
                      standGeom.tierHeight + (isClassicGermanBowl ? 9 : 8.5)
                    );
                    const pStay =
                      isClassicGermanBowl && (rIdx === 0 || rIdx === 2 || rIdx === 3 || rIdx === 5)
                        ? project(uRib, -(standBaseV + standGeom.standDepth + 4), standGeom.tierHeight + 22)
                        : null;
                    return (
                      <g key={`rib-t-${frac}`}>
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={isClassicGermanBowl ? (isDaytime ? '#334155' : '#CBD5E1') : '#F1F5F9'}
                          strokeWidth={isClassicGermanBowl ? '1.8' : '1.5'}
                        />
                        {pStay && (
                          <>
                            <line x1={p1.x} y1={p1.y} x2={pStay.x} y2={pStay.y} stroke={isDaytime ? '#475569' : '#CBD5E1'} strokeWidth="1.6" />
                            <line x1={pStay.x} y1={pStay.y} x2={p2.x} y2={p2.y} stroke={isDaytime ? '#64748B' : '#94A3B8'} strokeWidth="0.85" opacity="0.82" />
                          </>
                        )}
                        {!isDaytime && (
                          <>
                            <circle cx={p2.x} cy={p2.y} r="5.2" fill="#FEF9C3" opacity="0.22" />
                            <circle cx={p2.x} cy={p2.y} r="1.8" fill="#FFFBEB" opacity="0.96" />
                          </>
                        )}
                      </g>
                    );
                  })}
                </>
              )}
            </g>
          )}

          {/* In-Stadium LED Video Scoreboard / Retro German Matrix Anzeigetafel on Upper Rim for >= 5,000 Seat Venues */}
          {capacity >= 5000 && camera !== 'topdown' && (() => {
            const jU = straightHalfU + (standGeom.isRoundedBowl ? bowlInnerR * 0.72 : standGeom.standDepth * 0.68);
            const jV = -(straightHalfV + (standGeom.isRoundedBowl ? bowlInnerR * 0.72 : standGeom.standDepth * 0.68));
            const jZ = standGeom.tierHeight + (standGeom.hasRoofCanopy ? 18 : 15);
            const jc = project(jU, jV, jZ);
            const jBase = project(jU, jV, Math.max(4, jZ - 12));
            return (
              <g data-testid="stadium-jumbotron" pointerEvents="none">
                <line x1={jBase.x - 10} y1={jBase.y} x2={jc.x - 10} y2={jc.y + 8} stroke="#64748B" strokeWidth="1.8" />
                <line x1={jBase.x + 10} y1={jBase.y} x2={jc.x + 10} y2={jc.y + 8} stroke="#64748B" strokeWidth="1.8" />
                <rect
                  x={jc.x - 24}
                  y={jc.y - 10}
                  width="48"
                  height="20"
                  rx={isClassicGermanBowl ? '1.5' : '3'}
                  fill={isClassicGermanBowl ? '#18181B' : '#090D16'}
                  stroke={isClassicGermanBowl ? '#F59E0B' : isDaytime ? '#94A3B8' : '#FDE047'}
                  strokeOpacity={isClassicGermanBowl ? '0.88' : isDaytime ? '0.85' : '0.68'}
                  strokeWidth={isClassicGermanBowl ? '1.4' : '1.2'}
                />
                <rect x={jc.x - 22} y={jc.y - 8} width="3" height="16" rx="1" fill={palette.primary} />
                <rect x={jc.x + 19} y={jc.y - 8} width="3" height="16" rx="1" fill={effectiveOppColor} />
                <text
                  x={jc.x}
                  y={jc.y - 1.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFFFF"
                  fontSize="8.2"
                  fontWeight="900"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                >
                  {emptyBowl ? 'READY' : `${userGoals} - ${oppGoals}`}
                </text>
                <text
                  x={jc.x}
                  y={jc.y + 6.2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isLive ? '#34D399' : '#94A3B8'}
                  fontSize="4.2"
                  fontWeight="800"
                  letterSpacing="0.8"
                >
                  {emptyBowl ? 'STADIUM' : isLive ? 'LIVE' : 'MATCHDAY'}
                </text>
              </g>
            );
          })()}

          {/* 4. OPTIONAL OLYMPIC RUNNING TRACK OVAL + PITCH APRON & 105×68m GRASS FIELD */}
          {standGeom.hasRunningTrack && (
            <g data-testid="olympic-running-track">
              {/* Outer concrete athletics perimeter */}
              <polygon
                points={ptsStr(roundRectUVPts(standBaseU - 1, standBaseV - 1, 150, 0, 10))}
                fill="#475569"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.1"
              />
              {/* Terracotta oval running track surface */}
              <polygon
                points={ptsStr(roundRectUVPts(standBaseU - 4, standBaseV - 4, 146, 0, 10))}
                fill="#B64D3B"
                stroke="#7F1D1D"
                strokeWidth="1.35"
              />
              {/* 4 crisp concentric white athletics lane dividers */}
              {[0.22, 0.44, 0.66, 0.86].map((frac, idx) => {
                const laneU = A_U + 7 + (standBaseU - 5 - (A_U + 7)) * frac;
                const laneV = A_V + 6 + (standBaseV - 5 - (A_V + 6)) * frac;
                const laneR = 96 + (145 - 96) * frac;
                return (
                  <polygon
                    key={`track-lane-${idx}`}
                    points={ptsStr(roundRectUVPts(laneU, laneV, laneR, 0, 10))}
                    fill="none"
                    stroke="rgba(255,255,255,0.62)"
                    strokeWidth="0.9"
                  />
                );
              })}
              {/* 100m Finish Line on upper straight */}
              {(() => {
                const finA = project(0, -(A_V + 6), 0);
                const finB = project(0, -(standBaseV - 4), 0);
                return (
                  <line
                    x1={finA.x}
                    y1={finA.y}
                    x2={finB.x}
                    y2={finB.y}
                    stroke="#FFFFFF"
                    strokeWidth="1.6"
                    opacity="0.88"
                  />
                );
              })()}
              {/* Semicircular green D-sector infield inside running track curve */}
              <polygon
                points={ptsStr(roundRectUVPts(A_U + 7, A_V + 6, 94, 0, 9))}
                fill={design.turfStripe}
                stroke="rgba(255,255,255,0.52)"
                strokeWidth="1.1"
              />
            </g>
          )}

          <polygon
            points={polyUV(-A_U, A_U, -A_V, A_V, 0)}
            fill={apronFill}
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1.4"
          />

          {Array.from({ length: stripeCount }).map((_, idx) => {
            const uStart = -P_U + idx * stripeStep;
            const uEnd = uStart + stripeStep;
            return (
              <polygon
                key={`stripe-${idx}`}
                points={polyUV(uStart, uEnd, -P_V, P_V, 0)}
                fill={idx % 2 === 0 ? design.turfPrimary : design.turfStripe}
              />
            );
          })}

          {/* 4 Right-Side-Up Perimeter Boards (Modest printed timber/white signs on amateur grounds; glowing LED hoardings on pro arenas) */}
          <g data-testid="led-board-top">
            <polygon
              points={polyUV(
                standGeom.isAmateurGround ? -Math.min(132, topStandHalfU) : -155,
                standGeom.isAmateurGround ? Math.min(132, topStandHalfU) : 155,
                -(A_V + (standGeom.isAmateurGround ? 5.2 : 7)),
                -(A_V + 1),
                standGeom.isAmateurGround ? 4.2 : 6,
                standGeom.isAmateurGround ? 4.2 : 6,
                0,
                0
              )}
              fill={standGeom.isAmateurGround ? (isDaytime ? '#F8FAFC' : '#CBD5E1') : '#0F172A'}
              stroke={bannerTheme.primary}
              strokeWidth={standGeom.isAmateurGround ? '1.05' : '0.95'}
            />
            <text
              x={topBoardLayout.midX}
              y={topBoardLayout.midY}
              textAnchor="middle"
              dominantBaseline="central"
              fill={standGeom.isAmateurGround ? '#0F172A' : '#FFFFFF'}
              fontSize={standGeom.isAmateurGround ? Math.max(2.8, topBoardLayout.fontSize * 0.86) : topBoardLayout.fontSize}
              fontWeight="800"
              letterSpacing={topBoardLayout.letterSpacing}
              transform={`rotate(${topBoardLayout.angleDeg.toFixed(2)} ${topBoardLayout.midX.toFixed(1)} ${topBoardLayout.midY.toFixed(1)})`}
            >
              {topBoardText}
            </text>
          </g>

          <g data-testid="led-board-home">
            {!standGeom.isAmateurGround && (
              <>
                <polygon points={polyUV(-(A_U + 7), -(A_U + 1), -90, 90, 6, 0, 0, 6)} fill="#0F172A" stroke={bannerTheme.primary} strokeWidth="0.9" />
                <text
                  x={homeBoardLayout.midX}
                  y={homeBoardLayout.midY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFFFF"
                  fontSize={homeBoardLayout.fontSize}
                  fontWeight="800"
                  letterSpacing={homeBoardLayout.letterSpacing}
                  transform={`rotate(${homeBoardLayout.angleDeg.toFixed(2)} ${homeBoardLayout.midX.toFixed(1)} ${homeBoardLayout.midY.toFixed(1)})`}
                >
                  {homeBoardText}
                </text>
              </>
            )}
          </g>

          <g data-testid="led-board-away">
            {!standGeom.isAmateurGround && (
              <>
                <polygon points={polyUV(A_U + 1, A_U + 7, -90, 90, 0, 6, 6, 0)} fill="#0F172A" stroke={bannerTheme.primary} strokeWidth="0.9" />
                <text
                  x={awayBoardLayout.midX}
                  y={awayBoardLayout.midY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#E2E8F0"
                  fontSize={awayBoardLayout.fontSize}
                  fontWeight="800"
                  letterSpacing={awayBoardLayout.letterSpacing}
                  transform={`rotate(${awayBoardLayout.angleDeg.toFixed(2)} ${awayBoardLayout.midX.toFixed(1)} ${awayBoardLayout.midY.toFixed(1)})`}
                >
                  {awayBoardText}
                </text>
              </>
            )}
          </g>

          {/* 5. CRISP CHALK PITCH MARKINGS (Clean Center Line & Center Spot without Club Crest) */}
          <polygon points={polyUV(-P_U, P_U, -P_V, P_V, 0)} fill="none" stroke={design.lineColor} strokeWidth="1.8" />
          <line
            x1={project(0, -P_V, 0).x}
            y1={project(0, -P_V, 0).y}
            x2={project(0, P_V, 0).x}
            y2={project(0, P_V, 0).y}
            stroke={design.lineColor}
            strokeWidth="1.7"
          />
          <polygon points={centerCirclePoints} fill="none" stroke={design.lineColor} strokeWidth="1.7" />
          <circle
            cx={centerScreen.x}
            cy={centerScreen.y}
            r={camera === 'topdown' ? 3.0 : 2.6}
            fill={design.lineColor}
            data-testid="pitch-center-spot"
          />

          {/* Left & Right Penalty Boxes + 6-yard Boxes + Arcs */}
          <polygon points={polyUV(-P_U, -142, -82, 82, 0)} fill="none" stroke={design.lineColor} strokeWidth="1.65" />
          <polygon points={polyUV(-P_U, -184, -38, 38, 0)} fill="none" stroke={design.lineColor} strokeWidth="1.55" />
          <polyline points={leftArcPoints} fill="none" stroke={design.lineColor} strokeWidth="1.55" />

          <polygon points={polyUV(142, P_U, -82, 82, 0)} fill="none" stroke={design.lineColor} strokeWidth="1.65" />
          <polygon points={polyUV(184, P_U, -38, 38, 0)} fill="none" stroke={design.lineColor} strokeWidth="1.55" />
          <polyline points={rightArcPoints} fill="none" stroke={design.lineColor} strokeWidth="1.55" />

          {/* 12-Yard Penalty Spots */}
          <g data-testid="pitch-penalty-spots">
            {[-160, 160].map((spotU) => {
              const sp = project(spotU, 0, 0);
              return (
                <circle
                  key={`pen-spot-${spotU}`}
                  cx={sp.x}
                  cy={sp.y}
                  r={camera === 'topdown' ? 2.4 : 2.1}
                  fill={design.lineColor}
                />
              );
            })}
          </g>

          {/* 4 Chalk Corner Quadrant Arcs */}
          <g data-testid="pitch-corner-arcs">
            {[
              { u: -P_U, v: -P_V, su: 1, sv: 1 },
              { u: -P_U, v: P_V, su: 1, sv: -1 },
              { u: P_U, v: -P_V, su: -1, sv: 1 },
              { u: P_U, v: P_V, su: -1, sv: -1 },
            ].map((ca, idx) => {
              const arcPts: Pt2[] = [];
              const rCorner = 9.5;
              for (let s = 0; s <= 5; s++) {
                const a = (s / 5) * (Math.PI / 2);
                arcPts.push(project(ca.u + ca.su * Math.cos(a) * rCorner, ca.v + ca.sv * Math.sin(a) * rCorner, 0));
              }
              return (
                <polyline
                  key={`corner-arc-${idx}`}
                  points={ptsStr(arcPts)}
                  fill="none"
                  stroke={design.lineColor}
                  strokeWidth="1.35"
                />
              );
            })}
          </g>

          {/* Home & Away Technical Dugouts + Center-Line Player Tunnel (Simple local benches on amateur grounds, recessed tunnel on 5k+ grounds) */}
          <g data-testid="stadium-dugouts-tunnel">
            {!standGeom.isAmateurGround && (
              <>
                {/* Recessed Center-Line Player Tunnel Portal */}
                <polygon
                  points={polyUV(-9, 9, -(A_V + 7), -(A_V + 1.2), 5.8, 5.8, 0.2, 0.2)}
                  fill="#020617"
                  stroke="#64748B"
                  strokeWidth="0.9"
                />
                <polygon
                  points={polyUV(-11, 11, -(A_V + 1.2), -(P_V + 4.5), 0.2)}
                  fill="#334155"
                  opacity="0.72"
                />
              </>
            )}
            {/* Home Technical Dugout (Left of Halfway) & Away Technical Dugout (Right of Halfway) */}
            {[
              { u1: standGeom.isAmateurGround ? -44 : -50, u2: standGeom.isAmateurGround ? -16 : -18, accent: palette.primary, id: 'home-dugout' },
              { u1: standGeom.isAmateurGround ? 16 : 18, u2: standGeom.isAmateurGround ? 44 : 50, accent: effectiveOppColor, id: 'away-dugout' },
            ].map((dg) => (
              <g key={dg.id} data-testid={dg.id}>
                {/* Technical Area Chalk Box */}
                {!standGeom.isAmateurGround && (
                  <polygon
                    points={polyUV(dg.u1 - 3, dg.u2 + 3, -(P_V + 9.5), -(P_V + 2.2), 0.1)}
                    fill="none"
                    stroke="rgba(255,255,255,0.42)"
                    strokeWidth="0.8"
                    strokeDasharray="2.5 2"
                  />
                )}
                {/* Dugout Back & Bench Base */}
                <polygon
                  points={polyUV(
                    dg.u1,
                    dg.u2,
                    -(A_V + (standGeom.isAmateurGround ? -1.5 : 0.2)),
                    -(P_V + 6.5),
                    standGeom.isAmateurGround ? 3.2 : 4.6,
                    standGeom.isAmateurGround ? 3.2 : 4.6,
                    0.5,
                    0.5
                  )}
                  fill={standGeom.isAmateurGround ? '#57534E' : '#0F172A'}
                  fillOpacity="0.9"
                  stroke={standGeom.isAmateurGround ? '#A8A29E' : dg.accent}
                  strokeWidth="0.95"
                />
                {/* Shelter Canopy (Corrugated shed on amateur vs glass pro shelter) */}
                <polygon
                  points={polyUV(
                    dg.u1,
                    dg.u2,
                    -(A_V + (standGeom.isAmateurGround ? -1.2 : 0.4)),
                    -(P_V + 5.8),
                    standGeom.isAmateurGround ? 3.9 : 5.6,
                    standGeom.isAmateurGround ? 3.9 : 5.6,
                    standGeom.isAmateurGround ? 3.1 : 4.4,
                    standGeom.isAmateurGround ? 3.1 : 4.4
                  )}
                  fill={standGeom.isAmateurGround ? 'rgba(148, 163, 184, 0.62)' : 'rgba(226, 232, 240, 0.32)'}
                  stroke={standGeom.isAmateurGround ? '#CBD5E1' : 'rgba(255,255,255,0.68)'}
                  strokeWidth="0.7"
                />
                {/* Seated Substitutes & Technical Staff (Visible on Matchdays) */}
                {!emptyBowl &&
                  [-0.65, -0.22, 0.22, 0.65].map((f, sIdx) => {
                    const su = (dg.u1 + dg.u2) / 2 + ((dg.u2 - dg.u1) * 0.42) * f;
                    const sp = project(su, -(P_V + 8.0), 1.8);
                    return (
                      <circle
                        key={`sub-${sIdx}`}
                        cx={sp.x}
                        cy={sp.y}
                        r="1.55"
                        fill={dg.accent}
                        stroke="#F8FAFC"
                        strokeWidth="0.55"
                      />
                    );
                  })}
              </g>
            ))}
          </g>

          {/* Corner Flags */}
          {[
            { u: -P_U, v: -P_V },
            { u: -P_U, v: P_V },
            { u: P_U, v: -P_V },
            { u: P_U, v: P_V },
          ].map((cf, i) => {
            const p = project(cf.u, cf.v, 0);
            return (
              <g key={`cf-${i}`}>
                <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - 9} stroke="#FFFFFF" strokeWidth="1.15" />
                <polygon points={`${p.x},${p.y - 9} ${p.x + 6},${p.y - 6.5} ${p.x},${p.y - 4}`} fill={palette.primary} />
              </g>
            );
          })}

          {/* 3D Extruded Football Goals */}
          {renderGoal(-P_U, -1)}
          {renderGoal(P_U, 1)}

          {/* 5B. INFRASTRUCTURE PITCH MAINTENANCE: ANIMATED RIDE-ON LAWN MOWER */}
          {emptyBowl && !isMatchdayActive && (() => {
            const p1 = project(-68, -22, 0);
            const p2 = project(68, -22, 0);
            const p3 = project(68, 14, 0);
            const p4 = project(-68, 14, 0);
            const mowerStyle = {
              '--mx1': `${(p2.x - p1.x).toFixed(1)}px`,
              '--my1': `${(p2.y - p1.y).toFixed(1)}px`,
              '--mx2': `${(p3.x - p1.x).toFixed(1)}px`,
              '--my2': `${(p3.y - p1.y).toFixed(1)}px`,
              '--mx3': `${(p4.x - p1.x).toFixed(1)}px`,
              '--my3': `${(p4.y - p1.y).toFixed(1)}px`,
            } as React.CSSProperties;
            return (
              <g pointerEvents="none">
                {/* Freshly Cut Mowing Lanes Sheen */}
                <polygon
                  points={polyUV(-72, 72, -27, -17, 0.2)}
                  fill="rgba(255,255,255,0.09)"
                />
                <polygon
                  points={polyUV(-72, 72, 9, 19, 0.2)}
                  fill="rgba(255,255,255,0.07)"
                />
                <g transform={`translate(${p1.x.toFixed(1)}, ${p1.y.toFixed(1)})`}>
                  <g
                    data-testid="infrastructure-lawn-mower"
                    className="fms-mower-sweep"
                    style={mowerStyle}
                  >
                    {/* Turf Shadow */}
                    <ellipse cx="1" cy="2.5" rx="13" ry="6.2" fill="rgba(15,23,42,0.34)" />
                    {/* Under-Chassis Cutting Deck */}
                    <ellipse cx="2.5" cy="0.5" rx="8.5" ry="4.2" fill="#CBD5E1" stroke="#334155" strokeWidth="0.9" />
                    {/* Rear Hopper / Grass Catcher */}
                    <polygon points="-12,-3 -5,-6 -5,1 -12,4" fill="#1E293B" stroke="#0F172A" strokeWidth="0.7" />
                    {/* Main Mower Body */}
                    <polygon
                      points="-6,-1 8,-7 12,-2 -2,4"
                      fill={palette.primary}
                      stroke="#FFFFFF"
                      strokeWidth="0.85"
                    />
                    <polygon
                      points="-2,4 12,-2 12,1 -2,7"
                      fill="#15803D"
                      stroke="#0F172A"
                      strokeWidth="0.6"
                    />
                    {/* Tires */}
                    <circle cx="-5.5" cy="3.5" r="2.7" fill="#0F172A" stroke="#94A3B8" strokeWidth="0.8" />
                    <circle cx="7.5" cy="-1.5" r="2.1" fill="#0F172A" stroke="#94A3B8" strokeWidth="0.7" />
                    {/* Steering Wheel */}
                    <line x1="5" y1="-4.5" x2="7" y2="-9" stroke="#E2E8F0" strokeWidth="1.2" />
                    <ellipse cx="7.2" cy="-9.5" rx="2.2" ry="1.1" fill="none" stroke="#0F172A" strokeWidth="1.1" />
                    {/* Groundsman Operator */}
                    <rect x="-2.2" y="-11.5" width="4.8" height="6.8" rx="1.6" fill="#FACC15" stroke="#854D0E" strokeWidth="0.6" />
                    <circle cx="0.2" cy="-14" r="2.4" fill="#F3C998" stroke="#1E293B" strokeWidth="0.55" />
                    <path d="M -2.2 -14.8 Q 0.2 -17.6 2.8 -14.8 Z" fill={palette.primary} />
                  </g>
                </g>
              </g>
            );
          })()}

          {/* 6. FLUID 11v11 LIVE MATCH PLAYERS, SHOTS, GOALS & CELEBRATIONS (Never in Empty Infrastructure View) */}
          {!emptyBowl && isMatchdayActive && (
            <g
              data-testid="live-match-players"
              data-formation={choreo.formationCode}
              data-phase={choreo.phase}
              data-play-pattern={choreo.playPattern}
            >
              {/* Tactical Pass, Run & Press Links (Crisp Broadcast Overlay) */}
              {choreo.tacticalLinks.length > 0 && (
                <g data-testid="tactical-pitch-links" opacity="0.88">
                  {choreo.tacticalLinks.map((lnk, idx) => {
                    const pA = project(lnk.fromU, lnk.fromV, 0.8);
                    const pB = project(lnk.toU, lnk.toV, 0.8);
                    const stroke =
                      lnk.kind === 'pass'
                        ? 'rgba(255,255,255,0.78)'
                        : lnk.kind === 'press'
                        ? '#F59E0B'
                        : '#6EE7B7';
                    const dash =
                      lnk.kind === 'pass'
                        ? '4 3'
                        : lnk.kind === 'press'
                        ? '2 2.5'
                        : '6 3';
                    return (
                      <g key={`tlink-${idx}`}>
                        <line
                          x1={pA.x.toFixed(1)}
                          y1={pA.y.toFixed(1)}
                          x2={pB.x.toFixed(1)}
                          y2={pB.y.toFixed(1)}
                          stroke={stroke}
                          strokeWidth={lnk.kind === 'pass' ? '1.6' : '1.4'}
                          strokeDasharray={dash}
                          strokeLinecap="round"
                        />
                        <circle
                          cx={pB.x.toFixed(1)}
                          cy={pB.y.toFixed(1)}
                          r="2.1"
                          fill={stroke}
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 1v1 Duel / Penalty / Tackle / GK Save Focus Ring */}
              {choreo.duelRing && (() => {
                const dr = choreo.duelRing;
                const c = project(dr.u, dr.v, 0.5);
                const ringCol =
                  dr.kind === 'save'
                    ? '#38BDF8'
                    : dr.kind === 'tackle'
                    ? '#F59E0B'
                    : dr.kind === 'penalty'
                    ? '#FDE047'
                    : '#34D399';
                return (
                  <g data-testid="pitch-duel-ring" data-duel-kind={dr.kind}>
                    <ellipse
                      cx={c.x.toFixed(1)}
                      cy={(c.y + 2).toFixed(1)}
                      rx="22"
                      ry="11"
                      fill={ringCol}
                      fillOpacity="0.14"
                      stroke={ringCol}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <ellipse
                      cx={c.x.toFixed(1)}
                      cy={(c.y + 2).toFixed(1)}
                      rx="13.5"
                      ry="6.8"
                      fill="none"
                      stroke={ringCol}
                      strokeWidth="1.2"
                      strokeOpacity="0.82"
                    />
                  </g>
                );
              })()}

              {/* 3D Curved Shot Trajectory & Ball Trail */}
              {choreo.shotTrajectory && (() => {
                const st = choreo.shotTrajectory;
                const pFrom = project(st.fromU, st.fromV, st.fromZ);
                const pCtrl = project(st.ctrlU, st.ctrlV, st.ctrlZ);
                const pTo = project(st.toU, st.toV, st.toZ);
                const pGroundEnd = project(st.toU, st.toV, 0);
                const trail1 = project(
                  st.fromU * 0.65 + st.toU * 0.35,
                  st.fromV * 0.65 + st.toV * 0.35,
                  st.ctrlZ * 0.65
                );
                const trail2 = project(
                  st.fromU * 0.3 + st.toU * 0.7,
                  st.fromV * 0.3 + st.toV * 0.7,
                  st.ctrlZ * 0.85
                );
                const arcStroke = st.isGoal ? '#34D399' : '#FDE047';
                return (
                  <g data-testid="shot-trajectory-arc">
                    <line
                      x1={pFrom.x}
                      y1={pFrom.y}
                      x2={pGroundEnd.x}
                      y2={pGroundEnd.y}
                      stroke="rgba(15,23,42,0.28)"
                      strokeWidth="1.6"
                      strokeDasharray="4 3"
                    />
                    <path
                      d={`M ${pFrom.x.toFixed(1)} ${pFrom.y.toFixed(1)} Q ${pCtrl.x.toFixed(1)} ${pCtrl.y.toFixed(1)} ${pTo.x.toFixed(1)} ${pTo.y.toFixed(1)}`}
                      fill="none"
                      stroke={arcStroke}
                      strokeWidth="3.8"
                      strokeOpacity="0.26"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${pFrom.x.toFixed(1)} ${pFrom.y.toFixed(1)} Q ${pCtrl.x.toFixed(1)} ${pCtrl.y.toFixed(1)} ${pTo.x.toFixed(1)} ${pTo.y.toFixed(1)}`}
                      fill="none"
                      stroke={arcStroke}
                      strokeWidth="1.9"
                      strokeDasharray={st.isGoal ? undefined : '5 3'}
                      strokeLinecap="round"
                    />
                    <circle cx={trail1.x} cy={trail1.y} r="2.0" fill="#FFFFFF" opacity="0.45" />
                    <circle cx={trail2.x} cy={trail2.y} r="2.8" fill="#FFFFFF" opacity="0.72" />
                  </g>
                );
              })()}

              {/* Goal-Net Impact Ripple & Celebration Touchline Glow */}
              {choreo.ball.inNet && (() => {
                const netPt = project(choreo.ball.u, choreo.ball.v, choreo.ball.z);
                const celebCornerPt = project(
                  choreo.scoringSide === 'home' ? 168 : -168,
                  52,
                  0
                );
                return (
                  <g data-testid="goal-celebration-fx">
                    <circle cx={netPt.x} cy={netPt.y} r="22" fill="#10B981" opacity="0.32" />
                    <circle
                      cx={netPt.x}
                      cy={netPt.y}
                      r="12"
                      fill="none"
                      stroke="#A7F3D0"
                      strokeWidth="1.6"
                      strokeDasharray="3 2"
                    />
                    <circle
                      cx={celebCornerPt.x}
                      cy={celebCornerPt.y}
                      r="26"
                      fill={choreo.scoringSide === 'home' ? palette.primary : oppPalette.primary}
                      opacity="0.24"
                    />
                  </g>
                );
              })()}

              {/* Smoothly Interpolated 11v11 Stylized 3D Players */}
              {(() => {
                const renderPlayerSprite = (
                  p: PitchPlayerNode,
                  idx: number,
                  side: 'home' | 'away'
                ) => {
                  const pt = project(p.u, p.v, p.z);
                  const isHome = side === 'home';
                  const jerseyCol = p.gk
                    ? isHome
                      ? '#F59E0B'
                      : '#38BDF8'
                    : isHome
                    ? palette.primary
                    : oppPalette.primary;
                  const trimCol = p.gk
                    ? isHome
                      ? '#FEF3C7'
                      : '#E0F2FE'
                    : isHome
                    ? palette.secondary
                    : oppPalette.secondary;
                  const shortsCol = p.gk
                    ? '#1E293B'
                    : trimCol === jerseyCol
                    ? '#FFFFFF'
                    : trimCol;
                  const skinCol =
                    SKIN_TONES[(idx * (isHome ? 3 : 5) + (isHome ? 0 : 1)) % SKIN_TONES.length];
                  const showRaisedArms =
                    p.pose === 'arms_up' || p.pose === 'shooting' || p.pose === 'diving';
                  const stridePhase = (effectiveTick + idx) % 2 === 0 ? 1 : -1;
                  const legOffset = p.pose === 'sprinting' ? 1.8 * stridePhase : 1.0 * stridePhase;
                  const bodyTilt =
                    p.pose === 'diving'
                      ? isHome
                        ? -34
                        : 34
                      : p.pose === 'tackling'
                      ? isHome
                        ? 42
                        : -42
                      : p.pose === 'sprinting'
                      ? isHome
                        ? 8
                        : -8
                      : 0;

                  return (
                    <g
                      key={`${side}-p-${idx}`}
                      transform={`translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`}
                      style={{ transition: isLive ? 'transform 0.52s linear' : 'transform 1.15s ease-in-out' }}
                      data-testid={`live-player-${side}-${idx}`}
                      data-player-role={p.role}
                      data-player-pose={p.pose}
                    >
                      {p.hasSpotlight && (
                        <ellipse
                          cx="0"
                          cy="3.2"
                          rx="13.5"
                          ry="7.2"
                          fill="url(#playerSpotlightGrad)"
                        />
                      )}

                      {/* Ground Shadow */}
                      <ellipse
                        cx="0"
                        cy="4.4"
                        rx={p.pose === 'diving' || p.pose === 'tackling' ? '6.6' : '4.4'}
                        ry="2.0"
                        fill="rgba(0,0,0,0.38)"
                      />

                      <g transform={bodyTilt !== 0 ? `rotate(${bodyTilt} 0 1)` : undefined}>
                        {/* Running Legs & Boots */}
                        <line
                          x1="-1.4"
                          y1="2.2"
                          x2={p.pose === 'tackling' ? -4.8 : -1.6 - legOffset * 0.5}
                          y2={p.pose === 'tackling' ? 4.8 : 4.4 + legOffset * 0.35}
                          stroke={skinCol}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <line
                          x1="1.4"
                          y1="2.2"
                          x2={p.pose === 'tackling' ? 5.2 : 1.6 + legOffset * 0.5}
                          y2={p.pose === 'tackling' ? 3.4 : 4.4 - legOffset * 0.35}
                          stroke={skinCol}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />

                        {/* Raised Cheering / GK / Shooting Arms (\o/) */}
                        {showRaisedArms && (
                          <>
                            <line
                              x1="-2.6"
                              y1="-3.6"
                              x2="-5.8"
                              y2="-9.8"
                              stroke={jerseyCol}
                              strokeWidth="2.1"
                              strokeLinecap="round"
                            />
                            <line
                              x1="2.6"
                              y1="-3.6"
                              x2="5.8"
                              y2="-9.8"
                              stroke={jerseyCol}
                              strokeWidth="2.1"
                              strokeLinecap="round"
                            />
                          </>
                        )}

                        {/* Shorts / Lower Body */}
                        <rect
                          x="-3.0"
                          y="-0.6"
                          width="6.0"
                          height="4.4"
                          rx="2.0"
                          fill={shortsCol}
                          stroke="rgba(15,23,42,0.45)"
                          strokeWidth="0.6"
                        />

                        {/* Jersey Torso */}
                        <rect
                          x="-3.6"
                          y="-6.2"
                          width="7.2"
                          height="6.8"
                          rx="3.1"
                          fill={jerseyCol}
                          stroke={trimCol}
                          strokeWidth="1.15"
                        />

                        {/* Player Head */}
                        <circle
                          cx="0"
                          cy="-8.4"
                          r="2.55"
                          fill={skinCol}
                          stroke="rgba(15,23,42,0.5)"
                          strokeWidth="0.55"
                        />
                      </g>
                    </g>
                  );
                };

                return (
                  <>
                    {choreo.homePlayers.map((p, idx) => renderPlayerSprite(p, idx, 'home'))}
                    {choreo.awayPlayers.map((p, idx) => renderPlayerSprite(p, idx, 'away'))}
                  </>
                );
              })()}

              {/* Smoothly Interpolated Match Ball */}
              {(() => {
                const b = project(choreo.ball.u, choreo.ball.v, choreo.ball.z);
                const bShadow = project(choreo.ball.u, choreo.ball.v, 0);
                return (
                  <g
                    data-testid="live-match-ball"
                    data-in-net={choreo.ball.inNet ? 'true' : 'false'}
                    transform={`translate(${b.x.toFixed(1)}, ${b.y.toFixed(1)})`}
                    style={{ transition: isLive ? 'transform 0.52s linear' : 'transform 1.15s ease-in-out' }}
                  >
                    <ellipse
                      cx={bShadow.x - b.x}
                      cy={bShadow.y - b.y + 3.2}
                      rx="3.5"
                      ry="1.4"
                      fill="rgba(0,0,0,0.42)"
                    />
                    {choreo.ball.inNet && (
                      <circle cx="0" cy="0" r="6.8" fill="#FDE047" opacity="0.48" />
                    )}
                    <circle
                      cx="0"
                      cy="0"
                      r="3.9"
                      fill="#FFFFFF"
                      stroke="#18191F"
                      strokeWidth="1.25"
                    />
                  </g>
                );
              })()}
            </g>
          )}

          {/* 7. FOREGROUND BOTTOM STAND (10k+ only — Omitted on Amateur & Semi-Pro Grounds) + 3D EXTERIOR ARCHITECTURAL FACADE */}
          {standGeom.hasBottomStand && (
            <g data-testid="foreground-bottom-stand">
              <polygon
                points={polyUV(
                  -straightHalfU,
                  straightHalfU,
                  standBaseV,
                  standBaseV + standGeom.standDepth,
                  2,
                  2,
                  fgTierHeight,
                  fgTierHeight
                )}
                fill="url(#standConcreteGrad)"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1.1"
              />
              {standGeom.hasUpperRing && (
                <polygon
                  points={polyUV(
                    -straightHalfU,
                    straightHalfU,
                    standBaseV + standGeom.standDepth * 0.52,
                    standBaseV + standGeom.standDepth,
                    fgTierHeight * 0.55,
                    fgTierHeight * 0.55,
                    fgTierHeight + (standGeom.isMegaArena ? 4 : 2),
                    fgTierHeight + (standGeom.isMegaArena ? 4 : 2)
                  )}
                  fill="url(#standUpperGrad)"
                  stroke="rgba(255,255,255,0.24)"
                  strokeWidth="0.9"
                />
              )}
              {standGeom.isMegaArena && (
                <polygon
                  points={polyUV(
                    -straightHalfU,
                    straightHalfU,
                    standBaseV + standGeom.standDepth * 0.5,
                    standBaseV + standGeom.standDepth * 0.54,
                    fgTierHeight * 0.54,
                    fgTierHeight * 0.54,
                    fgTierHeight * 0.58,
                    fgTierHeight * 0.58
                  )}
                  fill={isDaytime ? '#0F172A' : bannerTheme.primary}
                  fillOpacity={isDaytime ? '0.68' : '0.82'}
                />
              )}
              <polygon
                points={polyUV(-straightHalfU, straightHalfU, standBaseV, standBaseV, 3, 3, 0, 0)}
                fill={palette.primary}
                opacity="0.94"
              />
            </g>
          )}

          {/* 3D VERTICAL EXTERIOR ARCHITECTURAL FACADE SKIRT (Isometric / Inspect only; seamless rounded or razor-sharp 90-degree box walls) */}
          {standGeom.hasBottomStand &&
            standGeom.facadeHeight > 0 &&
            (camera === 'isometric' || camera === 'inspection') && (() => {
              const outerV = standBaseV + standGeom.standDepth;
              const outerU = standBaseU + standGeom.standDepth;
              const fgTopZ = fgTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 2) : 0);
              const rightTopZ = rightTierHeight + (standGeom.hasUpperRing ? (standGeom.isMegaArena ? 4 : 1.5) : 0);
              const leftTopZ = standGeom.tierHeight + (standGeom.isMegaArena ? 10 : 0);
              const facadeDrop = standGeom.isMegaArena
                ? Math.min(26, Math.max(15, standGeom.facadeHeight * 0.58))
                : Math.min(13, Math.max(6, standGeom.facadeHeight * 0.4));
              const outerR = bowlInnerR + standGeom.standDepth;

              // For angular box stadiums (english_box / open_terrace), span the ENTIRE exterior wall edge-to-edge when enclosed
              const isEnclosedBox = !standGeom.isRoundedBowl && standGeom.hasCorners;
              const boxHalfU = isEnclosedBox ? outerU : straightHalfU;
              const boxHalfV = isEnclosedBox ? outerV : straightHalfV;
              const rightWallTopZAt = (rv: number) => {
                if (!isEnclosedBox || rv <= straightHalfV) return rightTopZ;
                const t = Math.max(0, Math.min(1, (rv - straightHalfV) / Math.max(1, boxHalfV - straightHalfV)));
                return rightTopZ + (fgTopZ - rightTopZ) * t;
              };

              const buildCurvedFacadeStrip = (
                uSign: -1 | 1,
                vSign: -1 | 1,
                tStart: number,
                tEnd: number,
                zSideline: number,
                zGoal: number,
                segs = 10
              ) => {
                const topPts: Pt2[] = [];
                const botPts: Pt2[] = [];
                for (let i = 0; i <= segs; i++) {
                  const t = tStart + (tEnd - tStart) * (i / segs);
                  const a = t * (Math.PI * 0.5);
                  const uOut = uSign * (straightHalfU + Math.sin(a) * outerR);
                  const vOut = vSign * (straightHalfV + Math.cos(a) * outerR);
                  const zTop = zSideline + (zGoal - zSideline) * t;
                  topPts.push(project(uOut, vOut, zTop));
                  botPts.push(project(uOut, vOut, -facadeDrop));
                }
                return ptsStr([...topPts, ...botPts.reverse()]);
              };

              const buildCurvedFacadeLine = (
                uSign: -1 | 1,
                vSign: -1 | 1,
                tStart: number,
                tEnd: number,
                zSideline: number,
                zGoal: number,
                bandFrac: number,
                segs = 8
              ) => {
                const pts: Pt2[] = [];
                for (let i = 0; i <= segs; i++) {
                  const t = tStart + (tEnd - tStart) * (i / segs);
                  const a = t * (Math.PI * 0.5);
                  const uOut = uSign * (straightHalfU + Math.sin(a) * outerR);
                  const vOut = vSign * (straightHalfV + Math.cos(a) * outerR);
                  const zTop = zSideline + (zGoal - zSideline) * t;
                  const zBand = -facadeDrop + (zTop + facadeDrop) * bandFrac;
                  pts.push(project(uOut, vOut, zBand));
                }
                return ptsStr(pts);
              };

              const bottomWallPts = ptsStr([
                project(-boxHalfU, outerV, fgTopZ),
                project(boxHalfU, outerV, fgTopZ),
                project(boxHalfU, outerV, -facadeDrop),
                project(-boxHalfU, outerV, -facadeDrop),
              ]);
              const rightWallPts = isEnclosedBox
                ? ptsStr([
                    project(outerU, -boxHalfV, rightTopZ),
                    project(outerU, straightHalfV, rightTopZ),
                    project(outerU, boxHalfV, fgTopZ),
                    project(outerU, boxHalfV, -facadeDrop),
                    project(outerU, -boxHalfV, -facadeDrop),
                  ])
                : ptsStr([
                    project(outerU, -straightHalfV, rightTopZ),
                    project(outerU, straightHalfV, rightTopZ),
                    project(outerU, straightHalfV, -facadeDrop),
                    project(outerU, -straightHalfV, -facadeDrop),
                  ]);

              const ribCountBottom = standGeom.isMegaArena ? (isEnclosedBox ? 15 : 13) : isEnclosedBox ? 9 : 7;
              const ribCountRight = standGeom.isMegaArena ? (isEnclosedBox ? 9 : 7) : isEnclosedBox ? 6 : 4;
              const cornerRibTs = standGeom.isMegaArena ? [0.2, 0.4, 0.6, 0.8] : [0.33, 0.66];

              const wallFrontFill = isClassicGermanBowl ? 'url(#germanConcreteWallGrad)' : 'url(#megaFacadeWallGrad)';
              const wallRightFill = isClassicGermanBowl ? 'url(#germanConcreteRightGrad)' : 'url(#megaFacadeRightGrad)';
              const showFacadeRibs = standGeom.hasFacadeRibs || isClassicGermanBowl;

              return (
                <g data-testid={standGeom.isMegaArena ? 'mega-arena-facade' : 'stadium-exterior-facade'}>
                  {/* Front-Left Curved Corner Facade (Rounded Bowls only) */}
                  {standGeom.hasCorners && standGeom.isRoundedBowl && (
                    <polygon
                      points={buildCurvedFacadeStrip(-1, 1, 0, 0.84, fgTopZ, leftTopZ, 12)}
                      fill={wallFrontFill}
                      stroke={isDaytime ? 'rgba(255,255,255,0.28)' : 'rgba(148,163,184,0.24)'}
                      strokeWidth="0.9"
                    />
                  )}

                  {/* Open-Corner 3D End Gable Walls for Foreground Bottom & Away Stands (Closes freestanding stand sides) */}
                  {!standGeom.hasCorners && (
                    <>
                      {/* Foreground Bottom Stand Right-Side Gable Wall */}
                      <polygon
                        points={ptsStr([
                          project(straightHalfU, standBaseV, 2),
                          project(straightHalfU, outerV, fgTopZ),
                          project(straightHalfU, outerV, -facadeDrop),
                          project(straightHalfU, standBaseV, 0),
                        ])}
                        fill="url(#megaFacadeRightGrad)"
                        stroke={isDaytime ? 'rgba(255,255,255,0.24)' : 'rgba(148,163,184,0.24)'}
                        strokeWidth="0.9"
                      />
                      {/* Away End Stand Bottom-Side Gable Wall */}
                      <polygon
                        points={ptsStr([
                          project(standBaseU, straightHalfV, 3),
                          project(outerU, straightHalfV, rightTopZ),
                          project(outerU, straightHalfV, -facadeDrop),
                          project(standBaseU, straightHalfV, 0),
                        ])}
                        fill="url(#megaFacadeWallGrad)"
                        stroke={isDaytime ? 'rgba(255,255,255,0.28)' : 'rgba(148,163,184,0.26)'}
                        strokeWidth="0.9"
                      />
                    </>
                  )}

                  {/* Main Foreground Bottom Exterior Facade Wall (Continuous edge-to-edge on enclosed angular boxes) */}
                  <polygon
                    points={bottomWallPts}
                    fill={wallFrontFill}
                    stroke={isDaytime ? 'rgba(255,255,255,0.32)' : 'rgba(148,163,184,0.28)'}
                    strokeWidth="1.0"
                  />

                  {/* Main Right Exterior Facade Wall (Continuous edge-to-edge on enclosed angular boxes) */}
                  <polygon
                    points={rightWallPts}
                    fill={wallRightFill}
                    stroke={isDaytime ? 'rgba(255,255,255,0.24)' : 'rgba(148,163,184,0.22)'}
                    strokeWidth="1.0"
                  />

                  {/* Front-Right & Top-Right Curved Corner Facades (Rounded Bowls only — angular boxes already form a crisp 90-degree corner) */}
                  {standGeom.hasCorners && standGeom.isRoundedBowl && (
                    <>
                      {/* Blend smoothly across the bottom-right curve: sunlit first half, shaded second half */}
                      <polygon
                        points={buildCurvedFacadeStrip(1, 1, 0, 0.52, fgTopZ, rightTopZ, 7)}
                        fill={wallFrontFill}
                        stroke="none"
                      />
                      <polygon
                        points={buildCurvedFacadeStrip(1, 1, 0.5, 1, fgTopZ, rightTopZ, 7)}
                        fill={wallRightFill}
                        stroke="none"
                      />
                      <polygon
                        points={buildCurvedFacadeStrip(1, 1, 0, 1, fgTopZ, rightTopZ, 12)}
                        fill="none"
                        stroke={isDaytime ? 'rgba(255,255,255,0.26)' : 'rgba(148,163,184,0.24)'}
                        strokeWidth="0.9"
                      />
                      <polygon
                        points={buildCurvedFacadeStrip(
                          1,
                          -1,
                          0.52,
                          1,
                          standGeom.tierHeight + (standGeom.isMegaArena ? 12 : 7),
                          rightTopZ,
                          6
                        )}
                        fill={wallRightFill}
                        stroke={isDaytime ? 'rgba(255,255,255,0.2)' : 'rgba(148,163,184,0.2)'}
                        strokeWidth="0.85"
                      />
                    </>
                  )}

                  {/* Classic Old-School German Recessed Concrete Entrance Portals (Eingänge) along the Lower Wall */}
                  {isClassicGermanBowl && (
                    <g data-testid="german-facade-portals" opacity={isDaytime ? '0.78' : '0.72'}>
                      {[-0.68, -0.34, 0, 0.34, 0.68].map((uFrac, pIdx) => {
                        const pu = straightHalfU * uFrac;
                        const halfPW = 6.5;
                        const zPortalTop = -facadeDrop + (fgTopZ + facadeDrop) * 0.42;
                        return (
                          <polygon
                            key={`ger-portal-b-${pIdx}`}
                            points={ptsStr([
                              project(pu - halfPW, outerV + 0.4, zPortalTop),
                              project(pu + halfPW, outerV + 0.4, zPortalTop),
                              project(pu + halfPW, outerV + 0.4, -facadeDrop),
                              project(pu - halfPW, outerV + 0.4, -facadeDrop),
                            ])}
                            fill={isDaytime ? '#3B3F46' : '#0B101B'}
                            stroke={isDaytime ? '#E5E1D8' : '#475569'}
                            strokeWidth="0.7"
                          />
                        );
                      })}
                      {[-0.45, 0.45].map((vFrac, pIdx) => {
                        const pv = straightHalfV * vFrac;
                        const halfPW = 6.0;
                        const zPortalTop = -facadeDrop + (rightTopZ + facadeDrop) * 0.42;
                        return (
                          <polygon
                            key={`ger-portal-r-${pIdx}`}
                            points={ptsStr([
                              project(outerU + 0.4, pv - halfPW, zPortalTop),
                              project(outerU + 0.4, pv + halfPW, zPortalTop),
                              project(outerU + 0.4, pv + halfPW, -facadeDrop),
                              project(outerU + 0.4, pv - halfPW, -facadeDrop),
                            ])}
                            fill={isDaytime ? '#2E3238' : '#090D16'}
                            stroke={isDaytime ? '#C8C3B8' : '#334155'}
                            strokeWidth="0.7"
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* Continuous Exterior Concourse Gallery Bands (Wrap seamlessly across full box walls & curved corners!) */}
                  {(standGeom.isMegaArena ? [0.24, 0.62] : [0.44]).map((bandT, bIdx) => {
                    const zBandB = -facadeDrop + (fgTopZ + facadeDrop) * bandT;
                    const zBandR = -facadeDrop + (rightTopZ + facadeDrop) * bandT;
                    const pB1 = project(-boxHalfU, outerV, zBandB);
                    const pB2 = project(boxHalfU, outerV, zBandB);
                    const bandColor = !isDaytime
                      ? bIdx === 1 && standGeom.isMegaArena
                        ? palette.primary
                        : '#FDE68A'
                      : isClassicGermanBowl
                      ? '#ECE8DF'
                      : '#E2E8F0';
                    const sw = standGeom.isMegaArena ? 2.0 : 1.3;
                    return (
                      <g key={`facade-gallery-${bIdx}`} opacity={!isDaytime ? (bIdx === 1 ? 0.72 : 0.46) : 0.52}>
                        <line x1={pB1.x} y1={pB1.y} x2={pB2.x} y2={pB2.y} stroke={bandColor} strokeWidth={sw} />
                        {isEnclosedBox ? (
                          <polyline
                            points={ptsStr([
                              project(outerU, -boxHalfV, zBandR),
                              project(outerU, straightHalfV, zBandR),
                              project(outerU, boxHalfV, zBandB),
                            ])}
                            fill="none"
                            stroke={bandColor}
                            strokeWidth={sw * 0.9}
                          />
                        ) : (
                          <line
                            x1={project(outerU, -straightHalfV, zBandR).x}
                            y1={project(outerU, -straightHalfV, zBandR).y}
                            x2={project(outerU, straightHalfV, zBandR).x}
                            y2={project(outerU, straightHalfV, zBandR).y}
                            stroke={bandColor}
                            strokeWidth={sw * 0.9}
                          />
                        )}
                        {standGeom.hasCorners && standGeom.isRoundedBowl && (
                          <>
                            <polyline
                              points={buildCurvedFacadeLine(-1, 1, 0, 0.84, fgTopZ, leftTopZ, bandT, 10)}
                              fill="none"
                              stroke={bandColor}
                              strokeWidth={sw * 0.92}
                            />
                            <polyline
                              points={buildCurvedFacadeLine(1, 1, 0, 1, fgTopZ, rightTopZ, bandT, 12)}
                              fill="none"
                              stroke={bandColor}
                              strokeWidth={sw * 0.95}
                            />
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* Sculpted Vertical Exterior Buttress Ribs / Concrete Pilasters (Wrap full box walls & curved walls!) */}
                  {showFacadeRibs && (
                    <g opacity={isDaytime ? '0.62' : '0.56'}>
                      {Array.from({ length: ribCountBottom }, (_, i) => {
                        const f = (i + 1) / (ribCountBottom + 1);
                        const ru = -boxHalfU + boxHalfU * 2 * f;
                        const ptTop = project(ru, outerV, fgTopZ);
                        const ptBot = project(ru, outerV, -facadeDrop);
                        return (
                          <line
                            key={`rib-b-${i}`}
                            x1={ptTop.x}
                            y1={ptTop.y}
                            x2={ptBot.x}
                            y2={ptBot.y}
                            stroke={isDaytime ? '#F8FAFC' : '#94A3B8'}
                            strokeWidth={standGeom.isMegaArena ? '1.3' : '0.95'}
                          />
                        );
                      })}
                      {Array.from({ length: ribCountRight }, (_, i) => {
                        const f = (i + 1) / (ribCountRight + 1);
                        const rv = -boxHalfV + boxHalfV * 2 * f;
                        const ptTop = project(outerU, rv, rightWallTopZAt(rv));
                        const ptBot = project(outerU, rv, -facadeDrop);
                        return (
                          <line
                            key={`rib-r-${i}`}
                            x1={ptTop.x}
                            y1={ptTop.y}
                            x2={ptBot.x}
                            y2={ptBot.y}
                            stroke={isDaytime ? '#E2E8F0' : '#64748B'}
                            strokeWidth={standGeom.isMegaArena ? '1.2' : '0.9'}
                          />
                        );
                      })}
                      {standGeom.hasCorners &&
                        standGeom.isRoundedBowl &&
                        cornerRibTs.map((t, cIdx) => {
                          const a = t * (Math.PI * 0.5);
                          const uBR = straightHalfU + Math.sin(a) * outerR;
                          const vBR = straightHalfV + Math.cos(a) * outerR;
                          const zBR = fgTopZ + (rightTopZ - fgTopZ) * t;
                          const pBRTop = project(uBR, vBR, zBR);
                          const pBRBot = project(uBR, vBR, -facadeDrop);

                          const tBL = t * 0.82;
                          const aBL = tBL * (Math.PI * 0.5);
                          const uBL = -(straightHalfU + Math.sin(aBL) * outerR);
                          const vBL = straightHalfV + Math.cos(aBL) * outerR;
                          const zBL = fgTopZ + (leftTopZ - fgTopZ) * tBL;
                          const pBLTop = project(uBL, vBL, zBL);
                          const pBLBot = project(uBL, vBL, -facadeDrop);
                          return (
                            <g key={`rib-c-${cIdx}`}>
                              <line
                                x1={pBRTop.x}
                                y1={pBRTop.y}
                                x2={pBRBot.x}
                                y2={pBRBot.y}
                                stroke={isDaytime ? '#F1F5F9' : '#94A3B8'}
                                strokeWidth="1.2"
                              />
                              <line
                                x1={pBLTop.x}
                                y1={pBLTop.y}
                                x2={pBLBot.x}
                                y2={pBLBot.y}
                                stroke={isDaytime ? '#F1F5F9' : '#94A3B8'}
                                strokeWidth="1.2"
                              />
                            </g>
                          );
                        })}
                    </g>
                  )}

                  {/* Continuous Night Architectural Club-Color Cornice Glow on 60k+ Mega-Arenas */}
                  {standGeom.isMegaArena && !isDaytime && (
                    <g opacity="0.68">
                      <line
                        x1={project(-boxHalfU, outerV, fgTopZ - 1).x}
                        y1={project(-boxHalfU, outerV, fgTopZ - 1).y}
                        x2={project(boxHalfU, outerV, fgTopZ - 1).x}
                        y2={project(boxHalfU, outerV, fgTopZ - 1).y}
                        stroke={palette.primary}
                        strokeWidth="2.3"
                      />
                      {isEnclosedBox ? (
                        <polyline
                          points={ptsStr([
                            project(outerU, -boxHalfV, rightTopZ - 1),
                            project(outerU, straightHalfV, rightTopZ - 1),
                            project(outerU, boxHalfV, fgTopZ - 1),
                          ])}
                          fill="none"
                          stroke={palette.primary}
                          strokeWidth="2.1"
                        />
                      ) : (
                        <line
                          x1={project(outerU, -straightHalfV, rightTopZ - 1).x}
                          y1={project(outerU, -straightHalfV, rightTopZ - 1).y}
                          x2={project(outerU, straightHalfV, rightTopZ - 1).x}
                          y2={project(outerU, straightHalfV, rightTopZ - 1).y}
                          stroke={palette.primary}
                          strokeWidth="2.1"
                        />
                      )}
                      {standGeom.hasCorners && standGeom.isRoundedBowl && (
                        <>
                          <polyline
                            points={buildCurvedFacadeLine(-1, 1, 0, 0.84, fgTopZ, leftTopZ, 0.96, 8)}
                            fill="none"
                            stroke={palette.primary}
                            strokeWidth="2.2"
                          />
                          <polyline
                            points={buildCurvedFacadeLine(1, 1, 0, 1, fgTopZ, rightTopZ, 0.96, 10)}
                            fill="none"
                            stroke={palette.primary}
                            strokeWidth="2.2"
                          />
                        </>
                      )}
                    </g>
                  )}
                </g>
              );
            })()}

          {/* Foreground Bottom Corners & Stand Spectators */}
          {memoizedForegroundCrowd}

          {/* Endzone Right-Touchline (+v) Cantilevered Roof Canopy (Rendered above Layer 7 crowd for clean broadcast symmetry) */}
          {camera === 'endzone' && standGeom.hasRoofCanopy && standGeom.isMegaArena && (
            <g data-testid="endzone-right-roof-canopy" opacity="0.9">
              <polygon
                points={polyUV(
                  -straightHalfU,
                  straightHalfU,
                  standBaseV + standGeom.standDepth * (isClassicGermanBowl ? 0.56 : 0.64),
                  standBaseV + standGeom.standDepth + (standGeom.isRoundedBowl ? 3 : 0),
                  fgTierHeight + 11,
                  fgTierHeight + 11,
                  fgTierHeight + 14,
                  fgTierHeight + 14
                )}
                fill={isClassicGermanBowl ? 'url(#germanTrussRoofGrad)' : 'url(#megaRoofCrownGrad)'}
                fillOpacity={isClassicGermanBowl ? '0.9' : '0.86'}
                stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : palette.primary}
                strokeOpacity={isClassicGermanBowl ? '0.45' : '0.7'}
                strokeWidth={isClassicGermanBowl ? '0.9' : '1.25'}
              />
              <polygon
                points={polyUV(
                  -straightHalfU,
                  straightHalfU,
                  standBaseV + standGeom.standDepth * (isClassicGermanBowl ? 0.36 : 0.34),
                  standBaseV + standGeom.standDepth * (isClassicGermanBowl ? 0.56 : 0.64),
                  fgTierHeight + 8,
                  fgTierHeight + 8,
                  fgTierHeight + 11,
                  fgTierHeight + 11
                )}
                fill={
                  isClassicGermanBowl
                    ? isDaytime
                      ? 'rgba(148, 163, 184, 0.36)'
                      : 'rgba(71, 85, 105, 0.3)'
                    : isDaytime
                    ? 'rgba(241, 245, 249, 0.22)'
                    : 'rgba(203, 213, 225, 0.15)'
                }
                stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : 'rgba(255, 255, 255, 0.48)'}
                strokeOpacity={isClassicGermanBowl ? '0.42' : '1'}
                strokeWidth="0.85"
              />
              {standGeom.isRoundedBowl ? (
                <polygon
                  points={curvedCornerStandUV(
                    1,
                    1,
                    straightHalfU,
                    straightHalfV,
                    bowlInnerR + standGeom.standDepth * (isClassicGermanBowl ? 0.6 : 0.66),
                    standGeom.standDepth * (isClassicGermanBowl ? 0.4 : 0.34) + 3,
                    fgTierHeight + 11,
                    rightTierHeight + 7,
                    fgTierHeight + 14,
                    rightTierHeight + 10,
                    12
                  )}
                  fill={isClassicGermanBowl ? 'url(#germanTrussRoofGrad)' : 'url(#megaRoofCrownGrad)'}
                  fillOpacity="0.88"
                  stroke={isClassicGermanBowl ? (isDaytime ? '#475569' : '#64748B') : palette.primary}
                  strokeOpacity={isClassicGermanBowl ? '0.42' : '0.68'}
                  strokeWidth={isClassicGermanBowl ? '0.85' : '1.15'}
                />
              ) : (
                standGeom.hasCorners && (
                  <polygon
                    points={polyUV(
                      straightHalfU,
                      standBaseU + standGeom.standDepth,
                      standBaseV + standGeom.standDepth * 0.64,
                      standBaseV + standGeom.standDepth,
                      fgTierHeight + 11,
                      rightTierHeight + 7,
                      rightTierHeight + 10,
                      fgTierHeight + 14
                    )}
                    fill="url(#megaRoofCrownGrad)"
                    fillOpacity="0.82"
                    stroke={palette.primary}
                    strokeOpacity="0.6"
                    strokeWidth="1.1"
                  />
                )
              )}
              {[-0.85, -0.56, -0.28, 0, 0.28, 0.56, 0.85].map((frac) => {
                const uRib = straightHalfU * frac;
                const p1 = project(
                  uRib,
                  standBaseV + standGeom.standDepth + (standGeom.isRoundedBowl ? 3 : 0),
                  fgTierHeight + 14.2
                );
                const p2 = project(
                  uRib,
                  standBaseV + standGeom.standDepth * (isClassicGermanBowl ? 0.36 : 0.34),
                  fgTierHeight + 8
                );
                return (
                  <line
                    key={`ez-rib-r-${frac}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isClassicGermanBowl ? (isDaytime ? '#334155' : '#CBD5E1') : '#F8FAFC'}
                    strokeWidth={isClassicGermanBowl ? '1.65' : '1.35'}
                    opacity="0.88"
                  />
                );
              })}
            </g>
          )}

          {/* Touchline Waving Supporter Flags (Gated to existing stands only) */}
          {isMatchdayActive && fanSectionConfig.creativeFanSectionsEnabled && bottomSidelineFill > 0.22 && (
            <g data-testid="touchline-supporter-flags">
              {renderFlag(
                -Math.min(78, topStandHalfU * 0.55),
                -(standBaseV + standGeom.standDepth * 0.35),
                standGeom.tierHeight * 0.45,
                bannerTheme.primary,
                bannerTheme.secondary,
                8
              )}
              {renderFlag(
                Math.min(64, topStandHalfU * 0.48),
                -(standBaseV + standGeom.standDepth * 0.35),
                standGeom.tierHeight * 0.45,
                bannerTheme.secondary,
                bannerTheme.primary,
                9
              )}
              {standGeom.hasBottomStand && (
                <>
                  {renderFlag(-92, standBaseV + standGeom.standDepth * 0.36, fgTierHeight * 0.5, bannerTheme.primary, bannerTheme.secondary, 10)}
                  {renderFlag(48, standBaseV + standGeom.standDepth * 0.36, fgTierHeight * 0.5, bannerTheme.secondary, bannerTheme.primary, 11)}
                </>
              )}
            </g>
          )}

          {/* Night Match Atmosphere: Subtle Floodlight Volumetric Beams & Crowd Camera Flashes */}
          {!isDaytime && isMatchdayActive && (
            <g pointerEvents="none">
              <g data-testid="stadium-floodlight-beams" opacity={standGeom.isAmateurGround ? '0.05' : '0.08'}>
                {[
                  { fromU: -standGeom.outerU, fromV: -standGeom.outerV, z: standGeom.tierHeight + 22, toU: -70, toV: -10 },
                  { fromU: standGeom.outerU, fromV: -standGeom.outerV, z: rightTierHeight + 22, toU: 70, toV: -10 },
                ].map((beam, bIdx) => {
                  const pSrc = project(beam.fromU, beam.fromV, beam.z);
                  const pDstA = project(beam.toU - 55, beam.toV + 38, 0);
                  const pDstB = project(beam.toU + 55, beam.toV - 38, 0);
                  return (
                    <polygon
                      key={`fbeam-${bIdx}`}
                      points={`${pSrc.x.toFixed(1)},${pSrc.y.toFixed(1)} ${pDstA.x.toFixed(1)},${pDstA.y.toFixed(1)} ${pDstB.x.toFixed(1)},${pDstB.y.toFixed(1)}`}
                      fill="#FEF9C3"
                    />
                  );
                })}
              </g>
              {occPct >= 30 && (
                <g data-testid="crowd-night-flashes">
                  {[
                    { u: -Math.min(118, topStandHalfU * 0.72), v: -(standBaseV + standGeom.standDepth * 0.45), z: standGeom.tierHeight * 0.55, ok: standGeom.hasTopStand },
                    { u: -42, v: -(standBaseV + standGeom.standDepth * 0.62), z: standGeom.tierHeight * 0.72, ok: standGeom.hasTopStand },
                    { u: 34, v: -(standBaseV + standGeom.standDepth * 0.38), z: standGeom.tierHeight * 0.48, ok: standGeom.hasTopStand },
                    { u: Math.min(112, topStandHalfU * 0.7), v: -(standBaseV + standGeom.standDepth * 0.58), z: standGeom.tierHeight * 0.66, ok: standGeom.hasTopStand },
                    { u: -(standBaseU + standGeom.standDepth * 0.48), v: -46, z: standGeom.tierHeight * 0.56, ok: standGeom.hasHomeEndStand },
                    { u: -(standBaseU + standGeom.standDepth * 0.56), v: 28, z: standGeom.tierHeight * 0.62, ok: standGeom.hasHomeEndStand },
                    { u: standBaseU + standGeom.standDepth * 0.46, v: -24, z: rightTierHeight * 0.54, ok: standGeom.hasAwayEndStand },
                    { u: standBaseU + standGeom.standDepth * 0.54, v: 42, z: rightTierHeight * 0.6, ok: standGeom.hasAwayEndStand },
                    { u: -84, v: standBaseV + standGeom.standDepth * 0.48, z: fgTierHeight * 0.55, ok: standGeom.hasBottomStand },
                    { u: 18, v: standBaseV + standGeom.standDepth * 0.56, z: fgTierHeight * 0.62, ok: standGeom.hasBottomStand },
                    { u: 96, v: standBaseV + standGeom.standDepth * 0.42, z: fgTierHeight * 0.48, ok: standGeom.hasBottomStand },
                  ]
                    .filter((fl) => fl.ok)
                    .map((fl, fIdx) => {
                      const pt = project(fl.u, fl.v, fl.z);
                      const activePulse = (effectiveTick + fIdx * 3) % 5 === 0 || matchPhase === 'goal';
                      return (
                        <g key={`flash-${fIdx}`} opacity={activePulse ? 0.92 : 0.25}>
                          <circle cx={pt.x} cy={pt.y} r={activePulse ? '3.4' : '1.4'} fill="#FEF9C3" opacity="0.35" />
                          <circle cx={pt.x} cy={pt.y} r={activePulse ? '1.35' : '0.85'} fill="#FFFFFF" />
                        </g>
                      );
                    })}
                </g>
              )}
            </g>
          )}

          {/* Foreground Bottom Stadium Name Signboard (Modest painted rail nameplate on amateur grounds; LED hoarding on pro arenas) */}
          <g data-testid="led-board-bottom">
            <polygon
              points={polyUV(
                standGeom.isAmateurGround ? -98 : -155,
                standGeom.isAmateurGround ? 98 : 155,
                A_V + 1,
                A_V + (standGeom.isAmateurGround ? 2.2 : 3.2),
                0,
                0,
                standGeom.isAmateurGround ? 4.6 : 8.2,
                standGeom.isAmateurGround ? 4.6 : 8.2
              )}
              fill={standGeom.isAmateurGround ? (isDaytime ? '#F8FAFC' : '#CBD5E1') : '#0B1120'}
              stroke={standGeom.isAmateurGround ? bannerTheme.primary : bannerTheme.secondary}
              strokeWidth="0.95"
            />
            <text
              x={bottomBoardLayout.midX}
              y={bottomBoardLayout.midY}
              textAnchor="middle"
              dominantBaseline="central"
              fill={standGeom.isAmateurGround ? '#0F172A' : '#FFFFFF'}
              fontSize={standGeom.isAmateurGround ? Math.max(2.8, bottomBoardLayout.fontSize * 0.88) : bottomBoardLayout.fontSize}
              fontWeight="800"
              letterSpacing={bottomBoardLayout.letterSpacing}
              transform={`rotate(${bottomBoardLayout.angleDeg.toFixed(2)} ${bottomBoardLayout.midX.toFixed(1)} ${bottomBoardLayout.midY.toFixed(1)})`}
              data-testid="stadium-name-board"
            >
              {bottomBoardText}
            </text>
          </g>
        </svg>
      </div>

      {/* =====================================================================
          FLOATING CORNER HUD CARDS (Clean without Tactics or 3D Pitch Options)
         ===================================================================== */}

      {/* TOP HUD ROW: Top-Left Matchup + Primary Sim/Supercup CTA | Top-Right Scoreboard */}
      {!hideTopHud && (
      <div className="pointer-events-none absolute inset-x-2.5 top-2.5 sm:inset-x-3 sm:top-3 flex items-start justify-between gap-2">
        {isInteractiveMatchMode ? (
          <>
            {/* Top-Left Interactive Matchday & Simulation Card */}
            <div
              className="pointer-events-auto bg-white/95 border border-[#E6E3DC] rounded-2xl px-2 py-1.5 sm:px-3.5 sm:py-2.5 shadow-md max-w-[55%] sm:max-w-[54%]"
              data-testid="stadium-matchup-hud"
            >
              {/* Row 1: Home vs Away with Crests */}
              <div className="flex items-center gap-1.5 min-w-0">
                <ClubLogo
                  club={club}
                  size={20}
                  isModActive={isModActive}
                  className="w-5 h-5 shrink-0 rounded-md"
                />
                <span className="text-[11px] sm:text-[13px] font-black text-[#18191F] truncate leading-tight">
                  {club.name}{' '}
                  <span className="font-semibold text-[#6B7280] text-[10px] sm:text-xs">vs</span>{' '}
                  {effectiveOppName}
                </span>
                <ClubLogo
                  name={effectiveOppName}
                  id={opponentClub?.id}
                  color={effectiveOppColor}
                  logo={opponentClub?.logo}
                  fallbackLogo={opponentClub?.fallbackLogo}
                  isModActive={isModActive}
                  size={20}
                  className="w-5 h-5 shrink-0 rounded-md"
                />
              </div>

              {/* Row 2: Match Status Tag + Clean Venue & Season Context */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide ${
                    matchPhase === 'goal'
                      ? 'bg-emerald-600 text-white'
                      : isLive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#F59E0B] text-white'
                  }`}
                >
                  {isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                  {matchPhase === 'goal' ? 'Goal' : statusBadgeText}
                </span>
                <span className="text-[10px] font-semibold text-[#4B5563] truncate max-w-[140px] sm:max-w-[230px]">
                  {stadiumName}
                  <span className="hidden sm:inline text-[#9CA3AF]"> · {contextPillText}</span>
                </span>
              </div>

              {/* Row 3: Primary Simulation / Supercup CTA Only (No Tactic Pill, No 3D Pitch Options) */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {isLive ? (
                  <>
                    <button
                      type="button"
                      onClick={onToggleSimSpeed}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-[10px] sm:text-[11px] font-extrabold tabular-nums transition cursor-pointer"
                    >
                      {isFastMode ? '2X Speed' : '1X Speed'}
                    </button>
                    <button
                      type="button"
                      onClick={onSkipInlineSim}
                      className="px-2.5 py-1.5 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-[10px] sm:text-[11px] font-extrabold transition cursor-pointer"
                    >
                      Skip →
                    </button>
                  </>
                ) : supercupEligibility ? (
                  <>
                    <button
                      type="button"
                      onClick={onOpenSupercup}
                      data-testid="play-supercup-btn"
                      className="px-3 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-[10px] sm:text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <i className="fa-solid fa-trophy text-[10px]" />
                      <span className="truncate max-w-[115px] sm:max-w-none">
                        Play {supercupEligibility.cupName}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={onSimulateSeason}
                      data-testid="simulate-season-btn"
                      className="px-2.5 py-1.5 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-[10px] sm:text-[11px] font-extrabold transition cursor-pointer"
                    >
                      Sim →
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onSimulateSeason}
                    data-testid="simulate-season-btn"
                    className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-[10px] sm:text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <i className="fa-solid fa-play text-[9px]" />
                    <span>
                      {seasonPhase === 'mid' ? 'Simulate 2nd Half' : 'Simulate 1st Half'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Top-Right Scoreboard Card */}
            <div
              className="pointer-events-auto bg-white/95 border border-[#E6E3DC] rounded-2xl px-2 py-1.5 sm:px-3.5 sm:py-2.5 shadow-md min-w-[104px] sm:min-w-[196px] max-w-[42%] sm:max-w-[42%]"
              data-testid="stadium-scoreboard-hud"
            >
              <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-semibold text-[#6B7280] mb-1.5">
                <span>Scoreboard</span>
                <span className="truncate">{scoreboardPhaseText}</span>
              </div>

              {/* Home Team Row */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ClubLogo
                    club={club}
                    size={18}
                    isModActive={isModActive}
                    className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 rounded-md"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-extrabold text-[#18191F] truncate leading-tight">
                      {club.name}
                    </div>
                    <div className="text-[9px] font-medium text-[#6B7280] tabular-nums leading-tight">
                      {userRecord}
                    </div>
                  </div>
                </div>
                <span className="text-sm sm:text-base font-black text-[#18191F] tabular-nums shrink-0">
                  {userGoals}
                </span>
              </div>

              {/* Away Team Row */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 mt-1.5 pt-1.5 border-t border-[#EAE7E0]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ClubLogo
                    name={effectiveOppName}
                    id={opponentClub?.id}
                    color={effectiveOppColor}
                    logo={opponentClub?.logo}
                    fallbackLogo={opponentClub?.fallbackLogo}
                    isModActive={isModActive}
                    size={18}
                    className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 rounded-md"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-extrabold text-[#18191F] truncate leading-tight">
                      {effectiveOppName}
                    </div>
                    <div className="text-[9px] font-medium text-[#6B7280] tabular-nums leading-tight">
                      {oppRecord}
                    </div>
                  </div>
                </div>
                <span className="text-sm sm:text-base font-black text-[#18191F] tabular-nums shrink-0">
                  {oppGoals}
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Infrastructure / Clean Venue Showcase Header Cards */
          <>
            <div className="pointer-events-auto max-w-[56%] sm:max-w-[48%] bg-white/95 border border-[#E6E3DC] rounded-2xl px-2.5 py-2 sm:px-3 sm:py-2 shadow-sm flex items-center gap-2">
              <ClubLogo
                club={club}
                size={28}
                isModActive={isModActive}
                className="w-7 h-7 shrink-0 rounded-lg"
              />
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#18191F] truncate leading-tight">
                  {stadiumName}
                </div>
                <div className="text-[10px] font-medium text-[#6B7280] truncate">
                  {tierLabel} · {design.name}
                </div>
              </div>
            </div>

            <div className="pointer-events-auto bg-white/95 border border-[#E6E3DC] rounded-2xl px-2.5 py-2 sm:px-3 sm:py-2 shadow-sm text-right">
              <div
                className="text-xs font-black text-[#18191F] tabular-nums leading-tight"
                data-testid="stadium-capacity-badge"
              >
                {formatNum(capacity)} Seats
              </div>
              <div className="text-[10px] font-semibold text-[#6B7280] tabular-nums mt-0.5">
                {emptyBowl ? 'Empty Bowl · Blueprint' : `Avg ${formatNum(effectiveAttendance)} (${occPct}% full)`}
              </div>
            </div>
          </>
        )}
      </div>
      )}

      {/* BOTTOM HUD ROW: Bottom-Left Camera + Day/Night Controls | Bottom-Right Attendance & Stadium Size */}
      <div className="pointer-events-none absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 flex items-end justify-between gap-1.5 sm:gap-2">
        <div className="pointer-events-auto bg-white/95 border border-[#E6E3DC] rounded-2xl px-1 py-1 sm:px-2 sm:py-1.5 shadow-md flex items-center gap-0.5 sm:gap-1 min-w-0">
          <span className="hidden sm:inline text-[10px] font-bold text-[#6B7280] px-1.5">
            Camera
          </span>
          {CAMERA_OPTIONS.map((opt) => {
            const active = camera === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCamera(opt.id)}
                title={`${opt.label} View`}
                aria-label={`${opt.label} Camera View`}
                className={`px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer flex items-center justify-center ${
                  active
                    ? 'bg-[#18191F] text-white shadow-xs'
                    : 'bg-[#F6F5F1] text-[#4B5563] hover:bg-[#EAE7E0] hover:text-[#18191F]'
                }`}
              >
                {renderCameraIcon(opt.id)}
              </button>
            );
          })}
          <div className="h-4 w-[1px] bg-[#E6E3DC] mx-0.5" />
          <button
            type="button"
            data-testid="stadium-time-toggle"
            onClick={() => setForcedTimeOfDay(isDaytime ? 'night' : 'day')}
            title="Switch between Daytime (70% matchdays) and Floodlit Night (30% matchdays)"
            className={`px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-xl text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
              isDaytime
                ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                : 'bg-[#18191F] text-white hover:bg-[#2A2C35]'
            }`}
          >
            <i className={`fa-solid ${isDaytime ? 'fa-sun text-amber-500' : 'fa-moon text-amber-300'} text-[10px]`} />
            <span className="hidden sm:inline">{isDaytime ? 'Day' : 'Night'}</span>
          </button>
        </div>

        <div className="pointer-events-auto bg-white/95 border border-[#E6E3DC] rounded-2xl px-2 py-1 sm:px-3 sm:py-1.5 shadow-md flex items-center gap-1.5 sm:gap-3 text-left shrink-0">
          <div>
            <div className="text-[9px] font-semibold text-[#6B7280] tabular-nums leading-tight">
              {emptyBowl ? (
                'Status'
              ) : (
                <>
                  <span className="sm:hidden">Att · {occPct}%</span>
                  <span className="hidden sm:inline">Attendance · {occPct}%</span>
                </>
              )}
            </div>
            <div className="text-[11px] sm:text-xs font-black text-[#18191F] tabular-nums leading-tight mt-0.5">
              {emptyBowl ? 'Empty' : formatNum(effectiveAttendance)}
            </div>
          </div>
          <div className="h-5 w-[1px] bg-[#E6E3DC]" />
          <div>
            <div className="text-[9px] font-semibold text-[#6B7280] leading-tight">
              <span className="sm:hidden">Capacity</span>
              <span className="hidden sm:inline">Stadium size</span>
            </div>
            <div className="text-[11px] sm:text-xs font-black text-[#18191F] tabular-nums leading-tight mt-0.5">
              {formatNum(capacity)} <span className="hidden sm:inline font-semibold text-[10px] text-[#6B7280]">seats</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
