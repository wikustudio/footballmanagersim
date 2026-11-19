import React, { useState, useMemo, useEffect } from 'react';
import { Club, PitchDesignId } from '../types';
import { getClubCampusColors, getPitchDesign } from '../engine/liveSimVisualEngine';
import {
  COMMERCIAL_LEVEL_TITLES,
  Pt2,
  computeCommercialLevelFromFacilities,
  getHqScaleSpec,
} from '../engine/campusAndBowlGeometry';
import { formatMoney, formatNum } from '../data/gameConstants';
import { ClubLogo } from './ClubLogo';

export type CampusSceneType =
  | 'hq'
  | 'training'
  | 'boardroom'
  | 'facility_academy'
  | 'facility_medical';

interface ClubCampus3DProps {
  scene: CampusSceneType;
  club: Club;
  commercialLevel?: number;
  managerName?: string;
  archetypeLabel?: string;
  academyLevel?: number;
  medicalLevel?: number;
  isPublic?: boolean;
  estRevenueK?: number;
  valuationK?: number;
  clubImpactScore?: number;
  shieldsCount?: number;
  roadmapGoalsDone?: number;
  roadmapGoalsTotal?: number;
  skillPoints?: number;
  trophyCount?: number;
  squadSize?: number;
  maxSquadSize?: number;
  morale?: number;
  youthCount?: number;
  activeTactic?: string;
  pitchDesignId?: PitchDesignId;
  activeSponsorName?: string;
  isModActive?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

const SKIN_TONES = ['#FDE68A', '#F3C998', '#D99B66', '#B87344', '#7C4B2C'];

export const ClubCampus3D: React.FC<ClubCampus3DProps> = ({
  scene,
  club,
  commercialLevel,
  managerName = 'Manager',
  archetypeLabel = 'Balanced',
  academyLevel = 1,
  medicalLevel = 1,
  isPublic = false,
  estRevenueK = 0,
  valuationK = 0,
  clubImpactScore = 50,
  shieldsCount = 0,
  roadmapGoalsDone = 0,
  roadmapGoalsTotal = 4,
  skillPoints = 0,
  trophyCount = 0,
  squadSize = 24,
  maxSquadSize = 50,
  morale = 80,
  youthCount = 0,
  activeTactic = 'Total Football',
  pitchDesignId,
  isModActive = false,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
}) => {
  const [camIdx, setCamIdx] = useState<0 | 1 | 2>(0);
  const [previewCommLevel, setPreviewCommLevel] = useState<number | null>(null);
  const palette = useMemo(() => getClubCampusColors(club), [club]);
  const pitchDesign = getPitchDesign(pitchDesignId);

  const computedCommLevel = useMemo(() => {
    if (typeof commercialLevel === 'number') {
      return Math.max(1, Math.min(5, Math.round(commercialLevel)));
    }
    return computeCommercialLevelFromFacilities(academyLevel, medicalLevel);
  }, [commercialLevel, academyLevel, medicalLevel]);

  // Reset preview override whenever Academy or Medical Center changes
  useEffect(() => {
    setPreviewCommLevel(null);
  }, [academyLevel, medicalLevel, commercialLevel]);

  const effectiveCommLevel = previewCommLevel ?? computedCommLevel;
  const hqSpec = useMemo(() => getHqScaleSpec(effectiveCommLevel), [effectiveCommLevel]);

  const shortCity = useMemo(
    () =>
      (club.name || 'CLUB')
        .replace(/^(FC|1\.\s*FC|SC|SV|VfB|TSG|RB|Borussia|Eintracht|Bavaria|Real|AC|AS|Olympique|Sporting)\s+/i, '')
        .trim()
        .toUpperCase()
        .slice(0, 14),
    [club.name]
  );
  const plaqueCity = useMemo(() => {
    if (shortCity.length <= 12) return shortCity;
    const parts = shortCity.split(/\s+/);
    return (parts[parts.length - 1] || shortCity).slice(0, 12);
  }, [shortCity]);

  // Accent band that always contrasts cleanly with primary roof/brand color
  const trimAccent =
    palette.secondary.toUpperCase() === '#FFFFFF' || palette.secondary === palette.primary
      ? '#16A34A'
      : palette.secondary;

  // Compact 3D club-colored architectural facility thumbnails (Infrastructure -> Club Facilities)
  if (scene === 'facility_academy' || scene === 'facility_medical') {
    const level = Math.max(1, Math.min(5, scene === 'facility_academy' ? academyLevel : medicalLevel));
    const wingFloors = Math.min(3, 1 + Math.floor(level / 2));
    return (
      <div className="w-full h-24 rounded-xl overflow-hidden bg-gradient-to-br from-[#F3F0E9] to-[#E6E2D8] border border-[#E6E3DC] flex items-center justify-center">
        <svg viewBox="0 0 240 112" className="w-full h-full">
          <polygon points="120,12 224,56 120,100 16,56" fill="#FAF8F4" stroke="#D5D0C5" strokeWidth="1.2" />
          {scene === 'facility_academy' ? (
            <>
              <polygon points="142,26 206,54 142,82 78,54" fill={pitchDesign.turfPrimary} stroke="#FFFFFF" strokeWidth="1" />
              <line x1="110" y1="40" x2="174" y2="68" stroke="#FFFFFF" strokeWidth="0.9" opacity="0.85" />
              <polygon
                points={`44,62 92,82 92,${62 - wingFloors * 10} 44,${42 - wingFloors * 10}`}
                fill="#FFFFFF"
                stroke="#D5D0C5"
              />
              <polygon
                points={`92,82 122,68 122,${48 - wingFloors * 10} 92,${62 - wingFloors * 10}`}
                fill={palette.primary}
              />
              <polygon
                points={`44,${42 - wingFloors * 10} 74,${28 - wingFloors * 10} 122,${48 - wingFloors * 10} 92,${62 - wingFloors * 10}`}
                fill={palette.secondary}
                stroke={palette.primary}
                strokeWidth="1"
              />
              <polygon points="48,54 88,71 88,65 48,48" fill={palette.primary} opacity="0.9" />
            </>
          ) : (
            <>
              <polygon
                points={`58,64 120,90 120,${60 - wingFloors * 9} 58,${34 - wingFloors * 9}`}
                fill="#FFFFFF"
                stroke="#D5D0C5"
              />
              <polygon
                points={`120,90 182,64 182,${34 - wingFloors * 9} 120,${60 - wingFloors * 9}`}
                fill="#EDEAE1"
                stroke="#D5D0C5"
              />
              <polygon
                points={`58,${34 - wingFloors * 9} 120,${10 - wingFloors * 9} 182,${34 - wingFloors * 9} 120,${60 - wingFloors * 9}`}
                fill={palette.primary}
                stroke="#FFFFFF"
                strokeWidth="1.2"
              />
              <polygon
                points="64,54 114,75 114,68 64,47"
                fill={palette.secondary}
                opacity="0.9"
              />
              <rect x="116" y={28 - wingFloors * 9} width="8" height="14" rx="1.2" fill="#FFFFFF" />
              <rect x="113" y={31 - wingFloors * 9} width="14" height="8" rx="1.2" fill="#FFFFFF" />
            </>
          )}
        </svg>
      </div>
    );
  }

  const camTransform: React.CSSProperties = {
    transform:
      camIdx === 1
        ? 'scale(1.09) translateY(-6px)'
        : camIdx === 2
        ? 'perspective(920px) rotateX(9deg) scale(1.03)'
        : 'scale(1)',
    transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  // True Isometric Projection Helpers
  // Commercial HQ: scaled cleanly to clear all 4 floating HUD corners across L1-L5
  const isoHQ = (u: number, v: number, z = 0): Pt2 => ({
    x: 348 + (u - v) * 0.77,
    y: 230 + (u + v) * 0.355 - z * 0.90,
  });

  // Boardroom Cutaway: diamond floor corner aligned to match reference cutaway room
  const isoBR = (u: number, v: number, z = 0): Pt2 => ({
    x: 342 + u * 0.92 - v * 0.92,
    y: 238 + u * 0.42 + v * 0.42 - z,
  });

  const isoPitch = (u: number, v: number, z = 0): Pt2 => ({
    x: 326 + u * 0.64 - v * 0.68,
    y: 198 + u * 0.29 + v * 0.31 - z,
  });

  const pts = (arr: Pt2[]) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Crisp Architectural Block Helper matching the Commercial HQ Reference (grid windows w/ cream + sky glass)
  const renderHqBlock = (opts: {
    key: string;
    u1: number;
    u2: number;
    v1: number;
    v2: number;
    zBase?: number;
    height: number;
    floors: number;
    colsFront?: number;
    colsSide?: number;
    roofFill?: string;
    parapetFill?: string;
    topInsetCube?: boolean;
  }) => {
    const z0 = opts.zBase ?? 0;
    const z1 = z0 + opts.height;
    const pFL = isoHQ(opts.u1, opts.v2, z0);
    const pFB = isoHQ(opts.u2, opts.v2, z0);
    const pFR = isoHQ(opts.u2, opts.v1, z0);
    const pBK = isoHQ(opts.u1, opts.v1, z0);

    const tFL = isoHQ(opts.u1, opts.v2, z1);
    const tFB = isoHQ(opts.u2, opts.v2, z1);
    const tFR = isoHQ(opts.u2, opts.v1, z1);
    const tBK = isoHQ(opts.u1, opts.v1, z1);

    const colsFront = opts.colsFront ?? Math.max(3, Math.round((opts.u2 - opts.u1) / 22));
    const colsSide = opts.colsSide ?? Math.max(2, Math.round((opts.v2 - opts.v1) / 24));
    const uSpan = opts.u2 - opts.u1;
    const vSpan = opts.v2 - opts.v1;
    const floorBandH = opts.height - 6; // leave parapet room at top
    const floorStep = floorBandH / Math.max(1, opts.floors);

    const windowElements: React.ReactNode[] = [];

    for (let f = 0; f < opts.floors; f++) {
      const fz0 = z0 + 3 + f * floorStep;
      const fz1 = z0 + 3 + (f + 1) * floorStep - Math.max(2.2, floorStep * 0.22);

      // Front-left face grid windows (along u, at v = opts.v2)
      const uCell = (uSpan - 8) / colsFront;
      for (let c = 0; c < colsFront; c++) {
        const wu1 = opts.u1 + 4 + c * uCell + 1.2;
        const wu2 = opts.u1 + 4 + (c + 1) * uCell - 1.2;
        const warmLit = (f * 3 + c * 5) % 4 === 1;
        windowElements.push(
          <polygon
            key={`${opts.key}-fw-${f}-${c}`}
            points={pts([
              isoHQ(wu1, opts.v2, fz0),
              isoHQ(wu2, opts.v2, fz0),
              isoHQ(wu2, opts.v2, fz1),
              isoHQ(wu1, opts.v2, fz1),
            ])}
            fill={warmLit ? '#F3E8BA' : '#A2C5DF'}
            stroke="#51728F"
            strokeWidth="0.65"
          />
        );
      }

      // Right shaded face grid windows (along v, at u = opts.u2)
      const vCell = (vSpan - 8) / colsSide;
      for (let c = 0; c < colsSide; c++) {
        const wv1 = opts.v1 + 4 + c * vCell + 1.2;
        const wv2 = opts.v1 + 4 + (c + 1) * vCell - 1.2;
        const warmLit = (f * 5 + c * 3) % 5 === 2;
        windowElements.push(
          <polygon
            key={`${opts.key}-sw-${f}-${c}`}
            points={pts([
              isoHQ(opts.u2, wv1, fz0),
              isoHQ(opts.u2, wv2, fz0),
              isoHQ(opts.u2, wv2, fz1),
              isoHQ(opts.u2, wv1, fz1),
            ])}
            fill={warmLit ? '#EADBA4' : '#85AAC8'}
            stroke="#425E77"
            strokeWidth="0.65"
          />
        );
      }
    }

    const parapetFill = opts.parapetFill || trimAccent;
    const roofFill = opts.roofFill || palette.primary;

    return (
      <g key={opts.key}>
        {/* Ground Architectural Cast Shadow */}
        {z0 === 0 && (
          <polygon
            points={pts([
              pFR,
              isoHQ(opts.u2 + 16, opts.v1 + 8, 0.5),
              isoHQ(opts.u2 + 16, opts.v2 + 10, 0.5),
              isoHQ(opts.u1 + 8, opts.v2 + 10, 0.5),
              pFB,
            ])}
            fill="rgba(15,23,42,0.22)"
          />
        )}

        {/* Sunlit Left Facade Wall */}
        <polygon
          points={pts([pFL, pFB, tFB, tFL])}
          fill="#EAEFF0"
          stroke="#64748B"
          strokeWidth="0.9"
        />
        {/* Shaded Right Facade Wall */}
        <polygon
          points={pts([pFB, pFR, tFR, tFB])}
          fill="#CFD8DB"
          stroke="#64748B"
          strokeWidth="0.9"
        />

        {/* Mullioned Grid Windows */}
        {windowElements}

        {/* Vertical Structural Framing Columns */}
        <line x1={pFL.x} y1={pFL.y} x2={tFL.x} y2={tFL.y} stroke={parapetFill} strokeWidth="2.1" />
        <line x1={pFB.x} y1={pFB.y} x2={tFB.x} y2={tFB.y} stroke={parapetFill} strokeWidth="2.3" />
        <line x1={pFR.x} y1={pFR.y} x2={tFR.x} y2={tFR.y} stroke={parapetFill} strokeWidth="1.8" />

        {/* Colored Cornice Parapet Fascia Band */}
        <polygon
          points={pts([isoHQ(opts.u1, opts.v2, z1 - 4.2), isoHQ(opts.u2, opts.v2, z1 - 4.2), tFB, tFL])}
          fill={parapetFill}
        />
        <polygon
          points={pts([isoHQ(opts.u2, opts.v2, z1 - 4.2), isoHQ(opts.u2, opts.v1, z1 - 4.2), tFR, tFB])}
          fill={parapetFill}
          opacity="0.9"
        />

        {/* Roof Plane in Club Primary Color */}
        <polygon
          points={pts([tBK, tFR, tFB, tFL])}
          fill={roofFill}
          stroke="#F8FAFC"
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />

        {/* Optional Rooftop Mechanical Penthouse Box */}
        {opts.topInsetCube && (() => {
          const pu1 = opts.u1 + uSpan * 0.25;
          const pu2 = opts.u2 - uSpan * 0.25;
          const pv1 = opts.v1 + vSpan * 0.25;
          const pv2 = opts.v2 - vSpan * 0.25;
          const pz0 = z1;
          const pz1 = z1 + 17;
          return (
            <g>
              <polygon
                points={pts([isoHQ(pu1, pv2, pz0), isoHQ(pu2, pv2, pz0), isoHQ(pu2, pv2, pz1), isoHQ(pu1, pv2, pz1)])}
                fill="#A5B8B1"
                stroke="#475569"
                strokeWidth="0.7"
              />
              <polygon
                points={pts([isoHQ(pu2, pv2, pz0), isoHQ(pu2, pv1, pz0), isoHQ(pu2, pv1, pz1), isoHQ(pu2, pv2, pz1)])}
                fill={parapetFill}
                stroke="#475569"
                strokeWidth="0.7"
              />
              <polygon
                points={pts([isoHQ(pu1, pv1, pz1), isoHQ(pu2, pv1, pz1), isoHQ(pu2, pv2, pz1), isoHQ(pu1, pv2, pz1)])}
                fill="#CBE0D4"
                stroke="#FFFFFF"
                strokeWidth="0.7"
              />
            </g>
          );
        })()}
      </g>
    );
  };

  // Isometric Chair + Executive Figure Helper for Boardroom Cutaway (back-to-front painter sort)
  const renderBoardChair = (opts: {
    key: string;
    u: number;
    v: number;
    faceDir: 'u+' | 'u-' | 'v+' | 'v-';
    isChairman?: boolean;
    skinIdx: number;
    depthOrder: number;
  }) => {
    const bw = 13;
    const bh = 25;
    const chairFill = opts.isChairman ? palette.primary : '#2A3346';
    const chairStroke = opts.isChairman ? '#F8FAFC' : '#475569';
    const seatFill = opts.isChairman ? palette.primary : '#1F2737';
    const skin = SKIN_TONES[opts.skinIdx % SKIN_TONES.length];

    // Base plinth / seat cube around (u, v)
    const seatTop = pts([
      isoBR(opts.u - bw, opts.v - bw, 14),
      isoBR(opts.u + bw, opts.v - bw, 14),
      isoBR(opts.u + bw, opts.v + bw, 14),
      isoBR(opts.u - bw, opts.v + bw, 14),
    ]);
    const frontLeft = pts([
      isoBR(opts.u - bw, opts.v + bw, 4),
      isoBR(opts.u + bw, opts.v + bw, 4),
      isoBR(opts.u + bw, opts.v + bw, 14),
      isoBR(opts.u - bw, opts.v + bw, 14),
    ]);
    const frontRight = pts([
      isoBR(opts.u + bw, opts.v + bw, 4),
      isoBR(opts.u + bw, opts.v - bw, 4),
      isoBR(opts.u + bw, opts.v - bw, 14),
      isoBR(opts.u + bw, opts.v + bw, 14),
    ]);

    const figurePos = isoBR(opts.u, opts.v, 16);

    // Backrest placement relative to facing direction
    const renderBackrest = () => {
      if (opts.faceDir === 'v+') {
        // Seated at back-right edge facing center (v+) -> backrest on v - bw side
        return (
          <g>
            <polygon
              points={pts([
                isoBR(opts.u - bw, opts.v - bw, 14),
                isoBR(opts.u + bw, opts.v - bw, 14),
                isoBR(opts.u + bw, opts.v - bw, 14 + bh),
                isoBR(opts.u - bw, opts.v - bw, 14 + bh),
              ])}
              fill={chairFill}
              stroke={chairStroke}
              strokeWidth="0.9"
            />
          </g>
        );
      }
      if (opts.faceDir === 'u+') {
        // Left head chair facing right -> backrest on u - bw
        return (
          <polygon
            points={pts([
              isoBR(opts.u - bw, opts.v - bw, 14),
              isoBR(opts.u - bw, opts.v + bw, 14),
              isoBR(opts.u - bw, opts.v + bw, 14 + bh),
              isoBR(opts.u - bw, opts.v - bw, 14 + bh),
            ])}
            fill={chairFill}
            stroke={chairStroke}
            strokeWidth="0.9"
          />
        );
      }
      if (opts.faceDir === 'u-') {
        // Right head Chairman's chair facing left -> backrest on u + bw
        return (
          <polygon
            points={pts([
              isoBR(opts.u + bw, opts.v - bw, 14),
              isoBR(opts.u + bw, opts.v + bw, 14),
              isoBR(opts.u + bw, opts.v + bw, 14 + bh),
              isoBR(opts.u + bw, opts.v - bw, 14 + bh),
            ])}
            fill={chairFill}
            stroke={chairStroke}
            strokeWidth="1.0"
          />
        );
      }
      // Foreground chairs (facing v-) -> backrest on v + bw
      return (
        <polygon
          points={pts([
            isoBR(opts.u - bw, opts.v + bw, 14),
            isoBR(opts.u + bw, opts.v + bw, 14),
            isoBR(opts.u + bw, opts.v + bw, 14 + bh),
            isoBR(opts.u - bw, opts.v + bw, 14 + bh),
          ])}
          fill={chairFill}
          stroke={chairStroke}
          strokeWidth="0.9"
        />
      );
    };

    const isBackSide = opts.faceDir === 'v+' || opts.faceDir === 'u+';

    return (
      <g key={opts.key}>
        {/* Floor Shadow */}
        <polygon
          points={pts([
            isoBR(opts.u - bw - 3, opts.v - bw - 3, 0.8),
            isoBR(opts.u + bw + 5, opts.v - bw - 3, 0.8),
            isoBR(opts.u + bw + 5, opts.v + bw + 5, 0.8),
            isoBR(opts.u - bw - 3, opts.v + bw + 5, 0.8),
          ])}
          fill="rgba(0,0,0,0.28)"
        />
        {isBackSide && renderBackrest()}
        <polygon points={frontLeft} fill={seatFill} stroke={chairStroke} strokeWidth="0.7" />
        <polygon points={frontRight} fill={seatFill} stroke={chairStroke} strokeWidth="0.7" />
        <polygon points={seatTop} fill={chairFill} stroke={chairStroke} strokeWidth="0.8" />
        {/* Seated Director Torso + Head */}
        <g transform={`translate(${figurePos.x.toFixed(1)}, ${figurePos.y.toFixed(1)})`}>
          <g className="fms-exec-nod" style={{ animationDelay: `${(opts.depthOrder * 0.45).toFixed(2)}s` }}>
            <path
              d="M -7 3 Q -7 -9 0 -10 Q 7 -9 7 3 Z"
              fill={opts.isChairman ? '#111827' : '#1E293B'}
              stroke="#475569"
              strokeWidth="0.7"
            />
            <polygon points="-2.2,-7 2.2,-7 0,-1" fill="#F8FAFC" />
            <line x1="0" y1="-6" x2="0" y2="-1" stroke={palette.primary} strokeWidth="1.6" />
            <circle cx="0" cy="-14.5" r="4.6" fill={skin} stroke="#0F172A" strokeWidth="0.55" />
          </g>
        </g>
        {!isBackSide && renderBackrest()}
      </g>
    );
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-[24px] border border-[#2A3446] shadow-sm select-none h-[335px] sm:h-[370px]"
      style={{
        background:
          scene === 'training'
            ? 'linear-gradient(180deg, #E4ECF2 0%, #EFF2EC 54%, #DCE4DD 100%)'
            : 'radial-gradient(ellipse at 50% 44%, #1E2B40 0%, #141D2C 68%, #0E1520 100%)',
      }}
      data-testid={`campus-3d-${scene}`}
      data-commercial-level={scene === 'hq' ? effectiveCommLevel : undefined}
    >
      {/* Scene SVG Canvas */}
      <div className="w-full h-full flex items-center justify-center" style={camTransform}>
        {/* =====================================================================
            SCENE 1: REDESIGNED 3D COMMERCIAL HQ & MEGASTORE CAMPUS (L1 -> L5)
           ===================================================================== */}
        {scene === 'hq' && (
          <svg viewBox="0 0 680 390" className="w-full h-full" data-testid="hq-campus-3d">
            <defs>
              <linearGradient id="hqRoofShadow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(15,23,42,0.18)" />
                <stop offset="100%" stopColor="rgba(15,23,42,0)" />
              </linearGradient>
            </defs>

            {/* Raised Architectural Limestone Plinth Base */}
            <polygon
              points={pts([isoHQ(-188, -158, 0), isoHQ(-188, 174, 0), isoHQ(-188, 174, -9), isoHQ(-188, -158, -9)])}
              fill="#AEB4BE"
            />
            <polygon
              points={pts([isoHQ(-188, 174, 0), isoHQ(188, 174, 0), isoHQ(188, 174, -9), isoHQ(-188, 174, -9)])}
              fill="#C3C7CE"
            />
            <polygon
              points={pts([isoHQ(188, 174, 0), isoHQ(188, -158, 0), isoHQ(188, -158, -9), isoHQ(188, 174, -9)])}
              fill="#9CA3AF"
            />

            {/* Light Architectural Campus Terrace */}
            <polygon
              points={pts([isoHQ(-188, -158, 0), isoHQ(188, -158, 0), isoHQ(188, 174, 0), isoHQ(-188, 174, 0)])}
              fill="#DCDFE3"
              stroke="#94A3B8"
              strokeWidth="1.1"
            />

            {/* Manicured Lawn Campus Grounds */}
            <polygon
              points={pts([isoHQ(-176, -146, 0.4), isoHQ(176, -146, 0.4), isoHQ(176, 86, 0.4), isoHQ(-176, 86, 0.4)])}
              fill="#5A875D"
              stroke="#486E4A"
              strokeWidth="0.9"
            />

            {/* Paved Light Forecourt Plaza */}
            <polygon
              points={pts([isoHQ(-128, 22, 0.7), isoHQ(128, 22, 0.7), isoHQ(128, 86, 0.7), isoHQ(-128, 86, 0.7)])}
              fill="#EAECEF"
              stroke="#CBD5E1"
              strokeWidth="0.7"
            />

            {/* Reflection Pool (L4-L5) */}
            {hqSpec.hasReflectionPool && (
              <g data-testid="hq-reflection-pool">
                <polygon
                  points={pts([isoHQ(-122, 34, 1.0), isoHQ(-60, 34, 1.0), isoHQ(-60, 68, 1.0), isoHQ(-122, 68, 1.0)])}
                  fill="#5B9EC7"
                  stroke="#F8FAFC"
                  strokeWidth="1.2"
                />
                <polygon
                  className="fms-water-glint"
                  points={pts([isoHQ(-114, 42, 1.1), isoHQ(-78, 42, 1.1), isoHQ(-78, 52, 1.1), isoHQ(-114, 52, 1.1)])}
                  fill="#BAE6FD"
                />
              </g>
            )}

            {/* Foreground Dark Asphalt Executive Boulevard */}
            <polygon
              points={pts([isoHQ(-188, 86, 0.8), isoHQ(188, 86, 0.8), isoHQ(188, 152, 0.8), isoHQ(-188, 152, 0.8)])}
              fill="#272F3C"
            />
            <polygon
              points={pts([isoHQ(-188, 86, 0.9), isoHQ(188, 86, 0.9), isoHQ(188, 90, 0.9), isoHQ(-188, 90, 0.9)])}
              fill="#B6BDC6"
            />
            <line
              x1={isoHQ(-180, 120, 1).x}
              y1={isoHQ(-180, 120, 1).y}
              x2={isoHQ(180, 120, 1).x}
              y2={isoHQ(180, 120, 1).y}
              stroke="#CBD5E1"
              strokeOpacity="0.55"
              strokeWidth="1.4"
              strokeDasharray="9 8"
            />

            {/* West Wing (L3-L5, behind left of central block) */}
            {hqSpec.hasWestWing &&
              renderHqBlock({
                key: 'hq-west-wing',
                u1: -146,
                u2: -58,
                v1: -84,
                v2: -4,
                floors: hqSpec.westFloors,
                height: hqSpec.westHeight,
                colsFront: 4,
                colsSide: 3,
              })}

            {/* East Wing (L2-L5, to right of central block) */}
            {hqSpec.hasEastWing &&
              renderHqBlock({
                key: 'hq-east-wing',
                u1: 58,
                u2: 146,
                v1: -84,
                v2: -4,
                floors: hqSpec.eastFloors,
                height: hqSpec.eastHeight,
                colsFront: 4,
                colsSide: 3,
              })}

            {/* Central Club HQ Block (scales footprint, floors 2->5 & height 34->88 from L1 to L5) */}
            {renderHqBlock({
              key: 'hq-central-tower',
              u1: -hqSpec.centralHalfU,
              u2: hqSpec.centralHalfU,
              v1: hqSpec.centralVRange[0],
              v2: hqSpec.centralVRange[1],
              floors: hqSpec.centralFloors,
              height: hqSpec.centralHeight,
              colsFront: effectiveCommLevel >= 3 ? 5 : 4,
              colsSide: 4,
              topInsetCube: hqSpec.hasPenthouse,
            })}

            {/* L5 Flagship Sky-Crown Spire & Helipad */}
            {hqSpec.hasSkyCrown && (
              <g data-testid="hq-level5-crown">
                <ellipse
                  cx={isoHQ(0, -40, hqSpec.centralHeight + 17.5).x}
                  cy={isoHQ(0, -40, hqSpec.centralHeight + 17.5).y}
                  rx="14"
                  ry="6.5"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="1.4"
                />
                <line
                  x1={isoHQ(0, -40, hqSpec.centralHeight + 17).x}
                  y1={isoHQ(0, -40, hqSpec.centralHeight + 17).y}
                  x2={isoHQ(0, -40, hqSpec.centralHeight + 34).x}
                  y2={isoHQ(0, -40, hqSpec.centralHeight + 34).y}
                  stroke="#F8FAFC"
                  strokeWidth="1.8"
                />
                <circle
                  cx={isoHQ(0, -40, hqSpec.centralHeight + 34).x}
                  cy={isoHQ(0, -40, hqSpec.centralHeight + 34).y}
                  r="4.2"
                  fill="#FDE68A"
                  className="fms-beacon-pulse"
                />
                <circle
                  cx={isoHQ(0, -40, hqSpec.centralHeight + 34).x}
                  cy={isoHQ(0, -40, hqSpec.centralHeight + 34).y}
                  r="2.4"
                  fill="#FBBF24"
                />
              </g>
            )}

            {/* Isometric-Aligned Roof Parapet Sign: <ClubLogo> + <CITY HQ> directly flush on cornice */}
            {(() => {
              const fasciaBase = isoHQ(-hqSpec.centralHalfU + 6, hqSpec.centralVRange[1] + 0.5, hqSpec.centralHeight - 2.0);
              const roofLabel = `${plaqueCity} HQ`;
              const roofFontSize = Math.min(8.2, Math.max(5.6, (hqSpec.centralHalfU * 1.45) / Math.max(7, roofLabel.length * 0.68)));
              return (
                <g
                  transform={`matrix(0.77 0.355 0 0.90 ${fasciaBase.x.toFixed(1)} ${fasciaBase.y.toFixed(1)})`}
                  data-testid="hq-roof-fascia-sign"
                >
                  <foreignObject x="0" y="-10.5" width="12" height="12">
                    <div className="w-full h-full flex items-center justify-center">
                      <ClubLogo club={club} size={12} isModActive={isModActive} className="w-3 h-3 rounded-sm" />
                    </div>
                  </foreignObject>
                  <text
                    x="15"
                    y="-2.0"
                    fill="#FFFFFF"
                    fontSize={roofFontSize.toFixed(1)}
                    fontWeight="900"
                    letterSpacing="0.4"
                  >
                    {roofLabel}
                  </text>
                </g>
              );
            })()}

            {/* Skewed Dark LED Stock/Status Ribbon Above Entrance Awning (L3-L5) */}
            {hqSpec.hasTicker && (() => {
              const tkOrigin = isoHQ(-hqSpec.centralHalfU + 3, hqSpec.centralVRange[1] + 0.6, 22);
              const tickerCopy = isPublic
                ? `LISTED PLC · ${formatMoney(valuationK)}`
                : `${plaqueCity} · LEVEL ${effectiveCommLevel}`;
              return (
                <g>
                  <polygon
                    points={pts([
                      isoHQ(-hqSpec.centralHalfU + 2, hqSpec.centralVRange[1] + 0.4, 17),
                      isoHQ(hqSpec.centralHalfU - 2, hqSpec.centralVRange[1] + 0.4, 17),
                      isoHQ(hqSpec.centralHalfU - 2, hqSpec.centralVRange[1] + 0.4, 24),
                      isoHQ(-hqSpec.centralHalfU + 2, hqSpec.centralVRange[1] + 0.4, 24),
                    ])}
                    fill="#111827"
                    stroke={trimAccent}
                    strokeWidth="0.7"
                  />
                  <g transform={`matrix(0.77 0.355 0 0.90 ${tkOrigin.x.toFixed(1)} ${tkOrigin.y.toFixed(1)})`}>
                    <text
                      x="3"
                      y="3.6"
                      fill="#A7F3D0"
                      fontSize="5.0"
                      fontWeight="800"
                      letterSpacing="0.55"
                      className="fms-ticker-glow"
                    >
                      {tickerCopy}
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* Front Arrival Awning Canopy + Supporting Columns */}
            <polygon
              points={pts([
                isoHQ(-36, hqSpec.centralVRange[1], 16),
                isoHQ(36, hqSpec.centralVRange[1], 16),
                isoHQ(36, hqSpec.centralVRange[1] + 24, 12),
                isoHQ(-36, hqSpec.centralVRange[1] + 24, 12),
              ])}
              fill={palette.primary}
              stroke="#FFFFFF"
              strokeWidth="1.0"
            />
            {[-32, 32].map((cu) => {
              const base = isoHQ(cu, hqSpec.centralVRange[1] + 22, 1);
              const top = isoHQ(cu, hqSpec.centralVRange[1] + 22, 12);
              return <line key={`col-${cu}`} x1={base.x} y1={base.y} x2={top.x} y2={top.y} stroke={trimAccent} strokeWidth="2" />;
            })}

            {/* Club Display Totems / Ticket Kiosks */}
            {[
              { u: 44, v: 46 },
              { u: 68, v: 56 },
              { u: 18, v: 64 },
            ]
              .slice(0, effectiveCommLevel >= 3 ? 3 : 1)
              .map((k, idx) => {
                const b = isoHQ(k.u, k.v, 1);
                return (
                  <g key={`kiosk-${idx}`}>
                    <rect x={b.x - 3} y={b.y - 13} width="6" height="13" rx="1.2" fill={palette.primary} stroke="#FFFFFF" strokeWidth="0.7" />
                    <rect x={b.x - 1.6} y={b.y - 11} width="3.2" height="5" fill={trimAccent} />
                  </g>
                );
              })}

            {/* Courtyard Trees */}
            {[
              { u: -158, v: 42 },
              { u: -144, v: 66 },
              { u: 158, v: -18 },
              { u: 156, v: 34 },
              { u: 142, v: 66 },
              { u: -160, v: -30 },
            ]
              .slice(0, hqSpec.treeCount)
              .map((tree, idx) => {
                const tPt = isoHQ(tree.u, tree.v, 1);
                return (
                  <g key={`hq-tree-${idx}`}>
                    <ellipse cx={tPt.x + 3} cy={tPt.y + 1.5} rx="8" ry="3.8" fill="rgba(15,23,42,0.2)" />
                    <line x1={tPt.x} y1={tPt.y} x2={tPt.x} y2={tPt.y - 10} stroke="#5C4033" strokeWidth="2.1" />
                    <circle cx={tPt.x} cy={tPt.y - 15} r="8.2" fill="#46754B" />
                    <circle cx={tPt.x - 2} cy={tPt.y - 17} r="5.5" fill="#639666" />
                  </g>
                );
              })}

            {/* Club Flag Poles Along Pool/Courtyard */}
            {[-106, -86, -66, 86].slice(0, hqSpec.flagCount).map((uPos, idx) => {
              const base = isoHQ(uPos, 54, 1);
              return (
                <g key={`hq-flag-${idx}`} className="fms-flag-wave">
                  <line x1={base.x} y1={base.y} x2={base.x} y2={base.y - 24} stroke="#E2E8F0" strokeWidth="1.4" />
                  <polygon
                    points={`${base.x},${base.y - 24} ${base.x + 15},${base.y - 20} ${base.x},${base.y - 15}`}
                    fill={idx % 2 === 0 ? palette.primary : trimAccent}
                    stroke="#FFFFFF"
                    strokeWidth="0.45"
                  />
                </g>
              );
            })}

            {/* Supporters & Staff Strolling Plaza */}
            {Array.from({ length: hqSpec.visitorCount }).map((_, idx) => {
              const u = -42 + ((idx * 29) % 88);
              const v = 34 + ((idx * 17) % 38);
              const pt = isoHQ(u, v, 1.4);
              return (
                <g
                  key={`visitor-${idx}`}
                  className="fms-visitor-stroll"
                  style={{ animationDelay: `${(idx * 0.55).toFixed(2)}s` }}
                >
                  <ellipse cx={pt.x} cy={pt.y + 2.2} rx="2.6" ry="1.0" fill="rgba(15,23,42,0.22)" />
                  <circle cx={pt.x} cy={pt.y} r="2.2" fill={idx % 2 === 0 ? palette.primary : '#1F2937'} />
                  <circle cx={pt.x} cy={pt.y - 3.1} r="1.5" fill={SKIN_TONES[idx % SKIN_TONES.length]} />
                </g>
              );
            })}

            {/* True 3D Isometric Club Livery Team Coach Bus on Executive Boulevard */}
            {(() => {
              const bSide1 = isoHQ(-126, 122, 2);
              const bSide2 = isoHQ(-44, 122, 2);
              const bFront = isoHQ(-44, 102, 2);
              const bBackRoof = isoHQ(-126, 102, 18);
              const bSide1Top = isoHQ(-126, 122, 18);
              const bSide2Top = isoHQ(-44, 122, 18);
              const bFrontTop = isoHQ(-44, 102, 18);
              const textAnchorPt = isoHQ(-116, 122.4, 4.2);
              const w1 = isoHQ(-108, 123, 1.5);
              const w2 = isoHQ(-64, 123, 1.5);
              return (
                <g data-testid="club-team-bus" className="fms-bus-cruise">
                  <polygon
                    points={pts([isoHQ(-128, 125, 1), isoHQ(-40, 125, 1), isoHQ(-40, 103, 1), isoHQ(-128, 103, 1)])}
                    fill="rgba(0,0,0,0.34)"
                  />
                  {/* Coach Left Livery Face */}
                  <polygon
                    points={pts([bSide1, bSide2, bSide2Top, bSide1Top])}
                    fill={palette.primary}
                    stroke="#0F172A"
                    strokeWidth="0.9"
                  />
                  {/* Coach Panoramic Window Strip */}
                  <polygon
                    points={pts([isoHQ(-121, 122.2, 10), isoHQ(-50, 122.2, 10), isoHQ(-50, 122.2, 15.5), isoHQ(-121, 122.2, 15.5)])}
                    fill="#C9E2F5"
                  />
                  {/* Accent Stripe */}
                  <polygon
                    points={pts([isoHQ(-126, 122.2, 7.6), isoHQ(-44, 122.2, 7.6), isoHQ(-44, 122.2, 9.6), isoHQ(-126, 122.2, 9.6)])}
                    fill={trimAccent}
                  />
                  {/* Skewed Club Name along Bus Side */}
                  <g transform={`matrix(0.77 0.355 0 0.90 ${textAnchorPt.x.toFixed(1)} ${textAnchorPt.y.toFixed(1)})`}>
                    <text
                      x="2"
                      y="0"
                      fill="#FFFFFF"
                      fontSize={Math.min(5.2, Math.max(3.8, 52 / Math.max(6, plaqueCity.length * 0.72))).toFixed(1)}
                      fontWeight="900"
                      letterSpacing="0.45"
                    >
                      {plaqueCity}
                    </text>
                  </g>
                  {/* Coach Front Windshield Face */}
                  <polygon points={pts([bSide2, bFront, bFrontTop, bSide2Top])} fill="#1E293B" stroke="#0F172A" strokeWidth="0.9" />
                  <polygon points={pts([isoHQ(-43.8, 120, 8.5), isoHQ(-43.8, 104, 8.5), isoHQ(-43.8, 104, 15.5), isoHQ(-43.8, 120, 15.5)])} fill="#93C5FD" />
                  {/* Coach Roof with AC Pods */}
                  <polygon points={pts([bBackRoof, bFrontTop, bSide2Top, bSide1Top])} fill={trimAccent} stroke="#FFFFFF" strokeWidth="0.7" />
                  <circle cx={w1.x} cy={w1.y} r="3.6" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.1" />
                  <circle cx={w2.x} cy={w2.y} r="3.6" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.1" />
                </g>
              );
            })()}

            {/* Two Executive Sedans on Foreground Boulevard */}
            {[
              { u: -8, v: 132, body: '#334155', cab: '#475569' },
              { u: 44, v: 130, body: '#E2E8F0', cab: '#CBD5E1' },
            ].map((car, idx) => (
              <g
                key={`sedan-${idx}`}
                className="fms-sedan-glide"
                style={{ animationDelay: `${(idx * 2.1).toFixed(1)}s` }}
              >
                <polygon
                  points={pts([
                    isoHQ(car.u - 12, car.v - 6, 1),
                    isoHQ(car.u + 14, car.v - 6, 1),
                    isoHQ(car.u + 14, car.v + 7, 1),
                    isoHQ(car.u - 12, car.v + 7, 1),
                  ])}
                  fill="rgba(0,0,0,0.3)"
                />
                <polygon
                  points={pts([
                    isoHQ(car.u - 11, car.v + 6, 2),
                    isoHQ(car.u + 11, car.v + 6, 2),
                    isoHQ(car.u + 11, car.v + 6, 8),
                    isoHQ(car.u - 11, car.v + 6, 8),
                  ])}
                  fill={car.body}
                />
                <polygon
                  points={pts([
                    isoHQ(car.u + 11, car.v + 6, 2),
                    isoHQ(car.u + 11, car.v - 5, 2),
                    isoHQ(car.u + 11, car.v - 5, 8),
                    isoHQ(car.u + 11, car.v + 6, 8),
                  ])}
                  fill={car.cab}
                />
                <polygon
                  points={pts([
                    isoHQ(car.u - 6, car.v - 4, 11.5),
                    isoHQ(car.u + 6, car.v - 4, 11.5),
                    isoHQ(car.u + 6, car.v + 5, 11.5),
                    isoHQ(car.u - 6, car.v + 5, 11.5),
                  ])}
                  fill="#F8FAFC"
                  opacity="0.85"
                />
              </g>
            ))}
          </svg>
        )}

        {/* =====================================================================
            SCENE 2: SQUAD 3D ISOMETRIC TRAINING PITCH
           ===================================================================== */}
        {scene === 'training' && (
          <svg viewBox="0 0 680 390" className="w-full h-full" data-testid="training-pitch-3d">
            <polygon
              points={pts([isoPitch(-236, -152, -4), isoPitch(236, -152, -4), isoPitch(236, 152, -4), isoPitch(-236, 152, -4)])}
              fill="#232934"
              stroke={palette.primary}
              strokeWidth="2"
            />
            <polygon
              points={pts([isoPitch(-226, -142, 0), isoPitch(226, -142, 0), isoPitch(226, 142, 0), isoPitch(-226, 142, 0)])}
              fill={palette.primary}
              opacity="0.9"
            />
            {Array.from({ length: 10 }).map((_, idx) => {
              const u1 = -205 + idx * 41;
              const u2 = u1 + 41;
              return (
                <polygon
                  key={`tstripe-${idx}`}
                  points={pts([isoPitch(u1, -125, 0.5), isoPitch(u2, -125, 0.5), isoPitch(u2, 125, 0.5), isoPitch(u1, 125, 0.5)])}
                  fill={idx % 2 === 0 ? pitchDesign.turfPrimary : pitchDesign.turfStripe}
                />
              );
            })}
            <polygon
              points={pts([isoPitch(-205, -125, 0.6), isoPitch(205, -125, 0.6), isoPitch(205, 125, 0.6), isoPitch(-205, 125, 0.6)])}
              fill="none"
              stroke="rgba(255,255,255,0.88)"
              strokeWidth="1.7"
            />
            <line
              x1={isoPitch(0, -125, 0.6).x}
              y1={isoPitch(0, -125, 0.6).y}
              x2={isoPitch(0, 125, 0.6).x}
              y2={isoPitch(0, 125, 0.6).y}
              stroke="rgba(255,255,255,0.82)"
              strokeWidth="1.5"
            />
            <polygon
              points={pts(
                Array.from({ length: 28 }).map((_, i) => {
                  const a = (i / 28) * Math.PI * 2;
                  return isoPitch(Math.cos(a) * 34, Math.sin(a) * 34, 0.6);
                })
              )}
              fill="none"
              stroke="rgba(255,255,255,0.82)"
              strokeWidth="1.5"
            />
            <polygon
              points={pts([isoPitch(-205, -72, 0.6), isoPitch(-142, -72, 0.6), isoPitch(-142, 72, 0.6), isoPitch(-205, 72, 0.6)])}
              fill="none"
              stroke="rgba(255,255,255,0.82)"
              strokeWidth="1.5"
            />
            <polygon
              points={pts([isoPitch(142, -72, 0.6), isoPitch(205, -72, 0.6), isoPitch(205, 72, 0.6), isoPitch(142, 72, 0.6)])}
              fill="none"
              stroke="rgba(255,255,255,0.82)"
              strokeWidth="1.5"
            />
            {[-205, 205].map((uGoal, gIdx) => {
              const dir = gIdx === 0 ? -10 : 10;
              const p1 = isoPitch(uGoal, -22, 0);
              const p2 = isoPitch(uGoal, 22, 0);
              const t1 = isoPitch(uGoal, -22, 12);
              const t2 = isoPitch(uGoal, 22, 12);
              const b1 = isoPitch(uGoal + dir, -22, 0);
              const b2 = isoPitch(uGoal + dir, 22, 0);
              return (
                <g key={`tgoal-${gIdx}`}>
                  <polygon points={pts([t1, t2, b2, b1])} fill="rgba(255,255,255,0.22)" stroke="#FFFFFF" strokeWidth="0.9" />
                  <polyline points={pts([p1, t1, t2, p2])} fill="none" stroke="#FFFFFF" strokeWidth="2.1" />
                </g>
              );
            })}
            {[-68, 68].map((uDug, idx) => (
              <polygon
                key={`dugout-${idx}`}
                points={pts([isoPitch(uDug - 28, -138, 0), isoPitch(uDug + 28, -138, 0), isoPitch(uDug + 28, -128, 12), isoPitch(uDug - 28, -128, 12)])}
                fill={idx === 0 ? palette.primary : palette.secondary}
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            ))}
            <g data-testid="drill-shuttle-sprints">
              {[-85, -55, -25, 5, 35, 65].map((uCone, idx) => {
                const cTop = isoPitch(uCone, -104, 1);
                const cMid = isoPitch(uCone, -76, 1);
                return (
                  <g key={`scone-${idx}`}>
                    <polygon points={`${cTop.x},${cTop.y - 5} ${cTop.x - 3},${cTop.y} ${cTop.x + 3},${cTop.y}`} fill="#F97316" />
                    <polygon points={`${cMid.x},${cMid.y - 5} ${cMid.x - 3},${cMid.y} ${cMid.x + 3},${cMid.y}`} fill="#FACC15" />
                  </g>
                );
              })}
              {[
                { u: -45, v: -102, cls: 'fms-shuttle-a', bib: false },
                { u: 15, v: -98, cls: 'fms-shuttle-b', bib: false },
                { u: -35, v: -76, cls: 'fms-shuttle-b', bib: true },
                { u: 25, v: -74, cls: 'fms-shuttle-a', bib: false },
              ].map((sp, idx) => {
                const pt = isoPitch(sp.u, sp.v, 1);
                return (
                  <g key={`sprinter-${idx}`} transform={`translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`}>
                    <g className={sp.cls}>
                      <ellipse cx="0" cy="4.2" rx="4" ry="1.6" fill="rgba(0,0,0,0.35)" />
                      <rect x="-3.4" y="-5.8" width="6.8" height="6.8" rx="2.8" fill={sp.bib ? palette.secondary : palette.primary} stroke="#FFFFFF" strokeWidth="1" />
                      <circle cx="0" cy="-8.2" r="2.5" fill={SKIN_TONES[idx % SKIN_TONES.length]} />
                    </g>
                  </g>
                );
              })}
            </g>
            <g data-testid="drill-passing-rondo">
              {[
                { u: -34, v: 4 },
                { u: 4, v: -26 },
                { u: 38, v: 2 },
                { u: 2, v: 28 },
                { u: -12, v: 6, bib: true },
              ].map((rp, idx) => {
                const pt = isoPitch(rp.u, rp.v, 1);
                return (
                  <g key={`rondo-p-${idx}`} transform={`translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`}>
                    <ellipse cx="0" cy="4.2" rx="4" ry="1.6" fill="rgba(0,0,0,0.35)" />
                    <rect x="-3.4" y="-5.8" width="6.8" height="6.8" rx="2.8" fill={rp.bib ? '#F59E0B' : palette.primary} stroke={palette.secondary} strokeWidth="1" />
                    <circle cx="0" cy="-8.2" r="2.5" fill={SKIN_TONES[(idx + 1) % SKIN_TONES.length]} />
                  </g>
                );
              })}
              {(() => {
                const cPt = isoPitch(0, 2, 1.5);
                return (
                  <g transform={`translate(${cPt.x.toFixed(1)}, ${cPt.y.toFixed(1)})`}>
                    <g className="fms-rondo-ball">
                      <circle cx="0" cy="0" r="3.4" fill="#FFFFFF" stroke="#18191F" strokeWidth="1.1" />
                    </g>
                  </g>
                );
              })()}
              {[
                { u: -68, v: 82 },
                { u: 62, v: 82 },
                { u: -4, v: 98 },
              ].map((lp, idx) => {
                const pt = isoPitch(lp.u, lp.v, 1);
                return (
                  <g key={`lpass-p-${idx}`} transform={`translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`}>
                    <ellipse cx="0" cy="4.2" rx="4" ry="1.6" fill="rgba(0,0,0,0.35)" />
                    <rect x="-3.4" y="-5.8" width="6.8" height="6.8" rx="2.8" fill={palette.primary} stroke={palette.secondary} strokeWidth="1" />
                    <circle cx="0" cy="-8.2" r="2.5" fill={SKIN_TONES[(idx + 3) % SKIN_TONES.length]} />
                  </g>
                );
              })}
              {(() => {
                const mPt = isoPitch(-3, 82, 1.5);
                return (
                  <g transform={`translate(${mPt.x.toFixed(1)}, ${mPt.y.toFixed(1)})`}>
                    <g className="fms-longpass-ball">
                      <circle cx="0" cy="0" r="3.4" fill="#FFFFFF" stroke="#18191F" strokeWidth="1.1" />
                    </g>
                  </g>
                );
              })()}
            </g>
            <g data-testid="drill-goalkeeper-boxes">
              {(() => {
                const gkL = isoPitch(-196, 0, 1);
                const coachL = isoPitch(-136, 12, 1);
                const man1 = isoPitch(-162, -22, 1);
                const man2 = isoPitch(-162, -8, 1);
                return (
                  <g>
                    {[man1, man2].map((m, i) => (
                      <rect key={`man-l-${i}`} x={m.x - 2.8} y={m.y - 9} width="5.6" height="10" rx="2" fill="#FACC15" stroke="#854D0E" strokeWidth="0.8" />
                    ))}
                    <g transform={`translate(${gkL.x.toFixed(1)}, ${gkL.y.toFixed(1)})`}>
                      <g className="fms-gk-dive-left">
                        <line x1="-2.5" y1="-4" x2="-6.5" y2="-10" stroke="#10B981" strokeWidth="2.1" strokeLinecap="round" />
                        <line x1="2.5" y1="-4" x2="6.5" y2="-10" stroke="#10B981" strokeWidth="2.1" strokeLinecap="round" />
                        <rect x="-3.6" y="-6" width="7.2" height="7" rx="2.8" fill="#10B981" stroke="#ECFDF5" strokeWidth="1" />
                        <circle cx="0" cy="-8.4" r="2.5" fill="#FDE68A" />
                      </g>
                      <g className="fms-gk-shot-left">
                        <circle cx="0" cy="-3" r="3.2" fill="#FFFFFF" stroke="#18191F" strokeWidth="1.1" />
                      </g>
                    </g>
                    <g transform={`translate(${coachL.x.toFixed(1)}, ${coachL.y.toFixed(1)})`}>
                      <rect x="-3.4" y="-5.8" width="6.8" height="6.8" rx="2.8" fill="#18191F" stroke="#FBBF24" strokeWidth="1" />
                      <circle cx="0" cy="-8.2" r="2.5" fill="#D99B66" />
                    </g>
                  </g>
                );
              })()}
              {(() => {
                const gkR = isoPitch(196, 0, 1);
                const coachR = isoPitch(136, -12, 1);
                return (
                  <g>
                    <g transform={`translate(${gkR.x.toFixed(1)}, ${gkR.y.toFixed(1)})`}>
                      <g className="fms-gk-dive-right">
                        <line x1="-2.5" y1="-4" x2="-6.5" y2="-10" stroke="#38BDF8" strokeWidth="2.1" strokeLinecap="round" />
                        <line x1="2.5" y1="-4" x2="6.5" y2="-10" stroke="#38BDF8" strokeWidth="2.1" strokeLinecap="round" />
                        <rect x="-3.6" y="-6" width="7.2" height="7" rx="2.8" fill="#0284C7" stroke="#E0F2FE" strokeWidth="1" />
                        <circle cx="0" cy="-8.4" r="2.5" fill="#F3C998" />
                      </g>
                      <g className="fms-gk-shot-right">
                        <circle cx="0" cy="-3" r="3.2" fill="#FFFFFF" stroke="#18191F" strokeWidth="1.1" />
                      </g>
                    </g>
                    <g transform={`translate(${coachR.x.toFixed(1)}, ${coachR.y.toFixed(1)})`}>
                      <rect x="-3.4" y="-5.8" width="6.8" height="6.8" rx="2.8" fill="#18191F" stroke="#38BDF8" strokeWidth="1" />
                      <circle cx="0" cy="-8.2" r="2.5" fill="#FDE68A" />
                    </g>
                  </g>
                );
              })()}
            </g>
          </svg>
        )}

        {/* =====================================================================
            SCENE 3: REDESIGNED ISOMETRIC 3D CUTAWAY EXECUTIVE BOARDROOM
           ===================================================================== */}
        {scene === 'boardroom' && (
          <svg viewBox="0 0 680 390" className="w-full h-full" data-testid="boardroom-3d">
            <defs>
              <radialGradient id="lampGlowPool" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.65" />
                <stop offset="55%" stopColor="#FDE68A" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="glassCurtainGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1E2B41" />
                <stop offset="100%" stopColor="#283854" />
              </linearGradient>
              <linearGradient id="tableWalnutGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A86832" />
                <stop offset="55%" stopColor="#8E5425" />
                <stop offset="100%" stopColor="#74421B" />
              </linearGradient>
            </defs>

            {/* 1. Isometric Cutaway Room Floor Diamond & Tiled Pattern */}
            <polygon
              points={pts([isoBR(-148, -148, 0), isoBR(148, -148, 0), isoBR(148, 148, 0), isoBR(-148, 148, 0)])}
              fill="#232D42"
              stroke="#475569"
              strokeWidth="1.2"
            />
            {[-98, -49, 0, 49, 98].map((step) => (
              <g key={`tile-${step}`} opacity="0.25">
                <line
                  x1={isoBR(step, -148, 0.2).x}
                  y1={isoBR(step, -148, 0.2).y}
                  x2={isoBR(step, 148, 0.2).x}
                  y2={isoBR(step, 148, 0.2).y}
                  stroke="#94A3B8"
                  strokeWidth="0.7"
                />
                <line
                  x1={isoBR(-148, step, 0.2).x}
                  y1={isoBR(-148, step, 0.2).y}
                  x2={isoBR(148, step, 0.2).x}
                  y2={isoBR(148, step, 0.2).y}
                  stroke="#94A3B8"
                  strokeWidth="0.7"
                />
              </g>
            ))}

            {/* Floor Cutaway Thickness Bevel */}
            <polygon
              points={pts([isoBR(-148, 148, 0), isoBR(148, 148, 0), isoBR(148, 148, -6), isoBR(-148, 148, -6)])}
              fill="#171E2C"
            />
            <polygon
              points={pts([isoBR(148, 148, 0), isoBR(148, -148, 0), isoBR(148, -148, -6), isoBR(148, 148, -6)])}
              fill="#111723"
            />

            {/* Woven Slate Area Rug with Double Club-Colored Border */}
            <polygon
              points={pts([isoBR(-122, -98, 0.5), isoBR(122, -98, 0.5), isoBR(122, 98, 0.5), isoBR(-122, 98, 0.5)])}
              fill="#2C384F"
              stroke={palette.primary}
              strokeWidth="1.5"
            />
            <polygon
              points={pts([isoBR(-115, -91, 0.6), isoBR(115, -91, 0.6), isoBR(115, 91, 0.6), isoBR(-115, 91, 0.6)])}
              fill="none"
              stroke={trimAccent}
              strokeWidth="0.9"
              strokeOpacity="0.65"
            />

            {/* 2. Back-Left Floor-to-Ceiling Glass Curtain Wall */}
            <polygon
              points={pts([isoBR(-148, 148, 0), isoBR(-148, -148, 0), isoBR(-148, -148, 106), isoBR(-148, 148, 106)])}
              fill="url(#glassCurtainGrad)"
              stroke="#475569"
              strokeWidth="1.1"
            />
            {[-96, -42, 12, 66, 118].map((mv) => {
              const b = isoBR(-148, mv, 0);
              const t = isoBR(-148, mv, 106);
              return <line key={`bm-${mv}`} x1={b.x} y1={b.y} x2={t.x} y2={t.y} stroke="#475569" strokeWidth="1.2" opacity="0.7" />;
            })}

            {/* 3. Back-Right Architectural Wall + Accent Molding + KPI Board + Credenza */}
            <polygon
              points={pts([isoBR(-148, -148, 0), isoBR(148, -148, 0), isoBR(148, -148, 106), isoBR(-148, -148, 106)])}
              fill="#192232"
              stroke="#334155"
              strokeWidth="1.1"
            />
            {/* Top Wall Molding Accent */}
            <line
              x1={isoBR(-148, -148, 101).x}
              y1={isoBR(-148, -148, 101).y}
              x2={isoBR(148, -148, 101).x}
              y2={isoBR(148, -148, 101).y}
              stroke={palette.primary}
              strokeWidth="2.4"
            />

            {/* Wide Wall-Mounted Strategic KPI Display Screen */}
            {(() => {
              const scrOrigin = isoBR(-30, -146.5, 86);
              const impactPct = Math.max(0.18, Math.min(1, clubImpactScore / 100));
              const roadPct = Math.max(0.15, Math.min(1, roadmapGoalsDone / Math.max(1, roadmapGoalsTotal)));
              return (
                <g data-testid="boardroom-kpi-wall">
                  <polygon
                    points={pts([
                      isoBR(-36, -146.5, 44),
                      isoBR(98, -146.5, 44),
                      isoBR(98, -146.5, 92),
                      isoBR(-36, -146.5, 92),
                    ])}
                    fill="#111827"
                    stroke="#64748B"
                    strokeWidth="1.4"
                  />
                  {/* Screen Header Copy & Live Progress Bars aligned in Isometric Plane */}
                  <g transform={`matrix(0.92 0.42 0 1 ${scrOrigin.x.toFixed(1)} ${scrOrigin.y.toFixed(1)})`}>
                    <text
                      x="6"
                      y="10"
                      fill="#E2E8F0"
                      fontSize={Math.min(8.4, Math.max(6.0, 108 / Math.max(10, (plaqueCity.length + 6) * 0.72))).toFixed(1)}
                      fontWeight="800"
                      letterSpacing="0.65"
                    >
                      {plaqueCity} BOARD
                    </text>
                    <circle cx="114" cy="7.5" r="2.6" fill="#10B981" className="fms-kpi-pulse" />
                    {/* Emerald Impact KPI Track */}
                    <rect x="6" y="18" width="112" height="5.5" rx="1.5" fill="#1E293B" />
                    <rect x="6" y="18" width={Math.round(112 * impactPct)} height="5.5" rx="1.5" fill="#10B981" className="fms-kpi-bar" />
                    {/* Sky Roadmap KPI Track */}
                    <rect x="6" y="28" width="112" height="5.5" rx="1.5" fill="#1E293B" />
                    <rect
                      x="6"
                      y="28"
                      width={Math.round(112 * roadPct)}
                      height="5.5"
                      rx="1.5"
                      fill="#38BDF8"
                      className="fms-kpi-bar"
                      style={{ animationDelay: '0.8s' }}
                    />
                  </g>
                </g>
              );
            })()}

            {/* Long Walnut Credenza Sideboard + Silverware Trophies */}
            {(() => {
              const crU1 = -44;
              const crU2 = 112;
              const crV1 = -146;
              const crV2 = -114;
              const crH = 26;
              const trophyCountShown = Math.max(2, Math.min(4, trophyCount + (shieldsCount > 0 ? 1 : 0)));
              const trophyUList = [-14, 24, 62, 92].slice(0, trophyCountShown);
              return (
                <g data-testid="boardroom-credenza">
                  <polygon
                    points={pts([
                      isoBR(crU1, crV2, 0),
                      isoBR(crU2, crV2, 0),
                      isoBR(crU2, crV2, crH),
                      isoBR(crU1, crV2, crH),
                    ])}
                    fill="#613819"
                    stroke="#3E220D"
                    strokeWidth="0.9"
                  />
                  <polygon
                    points={pts([
                      isoBR(crU2, crV2, 0),
                      isoBR(crU2, crV1, 0),
                      isoBR(crU2, crV1, crH),
                      isoBR(crU2, crV2, crH),
                    ])}
                    fill="#4A2911"
                    stroke="#3E220D"
                    strokeWidth="0.9"
                  />
                  <polygon
                    points={pts([
                      isoBR(crU1, crV1, crH),
                      isoBR(crU2, crV1, crH),
                      isoBR(crU2, crV2, crH),
                      isoBR(crU1, crV2, crH),
                    ])}
                    fill="#8A5226"
                    stroke="#A16535"
                    strokeWidth="0.9"
                  />
                  {/* Golden Silverware Cups along Credenza Top */}
                  {trophyUList.map((tu, idx) => {
                    const tp = isoBR(tu, -130, crH + 1);
                    return (
                      <g key={`tr-${idx}`}>
                        <rect x={tp.x - 3} y={tp.y - 3} width="6" height="3" fill="#B45309" />
                        <polygon
                          points={`${tp.x - 4.2},${tp.y - 11} ${tp.x + 4.2},${tp.y - 11} ${tp.x + 2.2},${tp.y - 4} ${tp.x - 2.2},${tp.y - 4}`}
                          fill="#FBBF24"
                          stroke="#D97706"
                          strokeWidth="0.6"
                        />
                        <circle cx={tp.x} cy={tp.y - 11} r="2.2" fill="#FDE68A" />
                      </g>
                    );
                  })}
                </g>
              );
            })()}

            {/* 4. BACK ROW CHAIRS + LEFT HEAD CHAIR (Drawn behind Table) */}
            {renderBoardChair({ key: 'ch-back-1', u: -52, v: -64, faceDir: 'v+', skinIdx: 0, depthOrder: 1 })}
            {renderBoardChair({ key: 'ch-back-2', u: 0, v: -64, faceDir: 'v+', skinIdx: 2, depthOrder: 2 })}
            {renderBoardChair({ key: 'ch-back-3', u: 52, v: -64, faceDir: 'v+', skinIdx: 4, depthOrder: 3 })}
            {renderBoardChair({ key: 'ch-head-l', u: -98, v: 0, faceDir: 'u+', skinIdx: 1, depthOrder: 4 })}

            {/* 5. CENTERPIECE ISOMETRIC WALNUT & DARK-SLATE EXECUTIVE TABLE */}
            <g data-testid="boardroom-table">
              {/* Table Ground Shadow */}
              <polygon
                points={pts([isoBR(-88, -50, 1), isoBR(88, -50, 1), isoBR(88, 50, 1), isoBR(-88, 50, 1)])}
                fill="rgba(0,0,0,0.34)"
              />
              {/* Pedestal Legs */}
              <polygon points={pts([isoBR(-54, 14, 1), isoBR(-34, 14, 1), isoBR(-34, 14, 21), isoBR(-54, 14, 21)])} fill="#18202F" />
              <polygon points={pts([isoBR(34, 14, 1), isoBR(54, 14, 1), isoBR(54, 14, 21), isoBR(34, 14, 21)])} fill="#18202F" />

              {/* Beveled Walnut Table Sides */}
              <polygon
                points={pts([isoBR(-82, 44, 19), isoBR(82, 44, 19), isoBR(82, 44, 26), isoBR(-82, 44, 26)])}
                fill="#6B3E17"
                stroke="#4A290E"
                strokeWidth="0.9"
              />
              <polygon
                points={pts([isoBR(82, 44, 19), isoBR(82, -44, 19), isoBR(82, -44, 26), isoBR(82, 44, 26)])}
                fill="#542F10"
                stroke="#4A290E"
                strokeWidth="0.9"
              />
              {/* Main Walnut Table Top */}
              <polygon
                points={pts([isoBR(-82, -44, 26), isoBR(82, -44, 26), isoBR(82, 44, 26), isoBR(-82, 44, 26)])}
                fill="url(#tableWalnutGrad)"
                stroke="#C2814B"
                strokeWidth="1.2"
              />
              {/* Dark Slate Tech Center Inset Runner */}
              <polygon
                points={pts([isoBR(-58, -19, 26.4), isoBR(58, -19, 26.4), isoBR(58, 19, 26.4), isoBR(-58, 19, 26.4)])}
                fill="#172030"
                stroke="#475569"
                strokeWidth="1.0"
              />

              {/* Centered Club Crest Medallion on Table */}
              {(() => {
                const cPt = isoBR(0, 0, 26.8);
                return (
                  <g>
                    <ellipse cx={cPt.x} cy={cPt.y} rx="18" ry="10.5" fill={palette.primary} stroke="#F8FAFC" strokeWidth="1.2" />
                    <foreignObject x={cPt.x - 10} y={cPt.y - 10} width="20" height="20">
                      <div className="w-full h-full flex items-center justify-center">
                        <ClubLogo club={club} size={18} isModActive={isModActive} className="w-4 h-4 rounded-full" />
                      </div>
                    </foreignObject>
                  </g>
                );
              })()}

              {/* Skewed Executive Dossier Folders at All 8 Seats */}
              {[
                { u: -52, v: -31, acc: trimAccent },
                { u: 0, v: -31, acc: trimAccent },
                { u: 52, v: -31, acc: trimAccent },
                { u: -70, v: 0, acc: palette.primary },
                { u: 70, v: 0, acc: palette.primary },
                { u: -52, v: 31, acc: trimAccent },
                { u: 0, v: 31, acc: trimAccent },
                { u: 52, v: 31, acc: trimAccent },
              ].map((doc, idx) => (
                <g key={`dossier-${idx}`}>
                  <polygon
                    points={pts([
                      isoBR(doc.u - 11, doc.v - 8, 26.8),
                      isoBR(doc.u + 11, doc.v - 8, 26.8),
                      isoBR(doc.u + 11, doc.v + 8, 26.8),
                      isoBR(doc.u - 11, doc.v + 8, 26.8),
                    ])}
                    fill="#F8FAFC"
                    stroke={doc.acc}
                    strokeWidth="1.15"
                  />
                  <line
                    x1={isoBR(doc.u - 7, doc.v - 3, 26.9).x}
                    y1={isoBR(doc.u - 7, doc.v - 3, 26.9).y}
                    x2={isoBR(doc.u + 7, doc.v - 3, 26.9).x}
                    y2={isoBR(doc.u + 7, doc.v - 3, 26.9).y}
                    stroke={doc.acc}
                    strokeWidth="1.4"
                  />
                </g>
              ))}

              {/* Two Warm Glowing Conference Table Lamps */}
              {[-36, 36].map((lu, idx) => {
                const lBase = isoBR(lu, 0, 26.8);
                return (
                  <g key={`tbl-lamp-${idx}`}>
                    <ellipse
                      cx={lBase.x}
                      cy={lBase.y - 4}
                      rx="22"
                      ry="12"
                      fill="url(#lampGlowPool)"
                      className="fms-lamp-breathe"
                      style={{ animationDelay: `${(idx * 1.1).toFixed(1)}s` }}
                    />
                    <line x1={lBase.x} y1={lBase.y} x2={lBase.x} y2={lBase.y - 8} stroke="#D4AF37" strokeWidth="1.5" />
                    <ellipse cx={lBase.x} cy={lBase.y - 9} rx="6" ry="2.6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.7" />
                  </g>
                );
              })}
            </g>

            {/* 6. FOREGROUND CHAIRS & CHAIRMAN'S CLUB-COLORED SEAT (Right Head) */}
            {renderBoardChair({ key: 'ch-fg-1', u: -52, v: 64, faceDir: 'v-', skinIdx: 3, depthOrder: 5 })}
            {renderBoardChair({ key: 'ch-fg-2', u: 0, v: 64, faceDir: 'v-', skinIdx: 0, depthOrder: 6 })}
            {renderBoardChair({ key: 'ch-fg-3', u: 52, v: 64, faceDir: 'v-', skinIdx: 2, depthOrder: 7 })}
            {renderBoardChair({
              key: 'ch-chairman',
              u: 98,
              v: 0,
              faceDir: 'u-',
              isChairman: true,
              skinIdx: 4,
              depthOrder: 8,
            })}
          </svg>
        )}
      </div>

      {/* Top-Left Editorial Title & Action Card */}
      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-md border border-[#E6E3DC] rounded-2xl p-2 sm:p-2.5 shadow-sm max-w-[57%] sm:max-w-[52%]">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <ClubLogo club={club} size={30} isModActive={isModActive} className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-lg" />
          <div className="min-w-0">
            <div className="text-[11px] sm:text-sm font-extrabold text-[#18191F] truncate">
              {scene === 'hq'
                ? `${club.name} HQ`
                : scene === 'training'
                ? `${shortCity} Training Pitch`
                : `${shortCity} Boardroom`}
            </div>
            <div className="text-[9.5px] sm:text-[10px] font-medium text-[#6B7280] truncate">
              {scene === 'hq'
                ? `Level ${effectiveCommLevel} · ${COMMERCIAL_LEVEL_TITLES[effectiveCommLevel]} (Acad L${academyLevel} / Med L${medicalLevel})`
                : scene === 'training'
                ? `Shuttle Sprints · Passing Rondo · GK Drills`
                : `${managerName} · ${archetypeLabel}`}
            </div>
          </div>
        </div>
        {(primaryActionLabel || secondaryActionLabel) && (
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
            {primaryActionLabel && onPrimaryAction && (
              <button
                type="button"
                onClick={onPrimaryAction}
                className="px-2 py-1 sm:px-2.5 rounded-lg bg-[#18191F] text-white text-[9.5px] sm:text-[10px] font-bold hover:bg-[#2A2C35] transition cursor-pointer whitespace-nowrap"
              >
                {primaryActionLabel}
              </button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <button
                type="button"
                onClick={onSecondaryAction}
                className="px-2 py-1 sm:px-2.5 rounded-lg bg-[#F5F4F0] text-[#18191F] border border-[#E6E3DC] text-[9.5px] sm:text-[10px] font-bold hover:bg-[#EAE7E0] transition cursor-pointer whitespace-nowrap"
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Top-Right Scene Metric Card */}
      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-md border border-[#E6E3DC] rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-sm text-right max-w-[38%] sm:max-w-none">
        {scene === 'hq' && (
          <>
            <div className="text-[9px] sm:text-[10px] font-semibold text-[#6B7280] flex items-center justify-end gap-1 sm:gap-1.5 flex-wrap">
              <span>Club Valuation</span>
              {isPublic && <span className="font-bold text-emerald-700">Listed PLC</span>}
            </div>
            <div className="text-xs sm:text-base font-black text-[#18191F] tabular-nums">
              {formatMoney(valuationK)}
            </div>
          </>
        )}
        {scene === 'training' && (
          <>
            <div className="text-[10px] sm:text-xs font-extrabold text-[#18191F] tabular-nums truncate">
              {squadSize}/{maxSquadSize} Active · {morale}%
            </div>
            <div className="text-[9px] sm:text-[10px] font-semibold text-[#4B5563] truncate">
              {activeTactic}
            </div>
          </>
        )}
        {scene === 'boardroom' && (
          <>
            <div className="text-[9px] sm:text-[10px] font-semibold text-[#6B7280] flex items-center justify-end gap-1 sm:gap-1.5 flex-wrap">
              <span>Club Impact</span>
              <span className="font-bold text-[#18191F]">{shieldsCount} Shield{shieldsCount === 1 ? '' : 's'}</span>
            </div>
            <div className="text-xs sm:text-base font-black text-[#18191F] tabular-nums">
              {clubImpactScore} / 100
            </div>
          </>
        )}
      </div>

      {/* Bottom HUD Row */}
      <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 sm:inset-x-3 sm:bottom-3 flex flex-wrap items-end justify-between gap-1.5">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-[#E6E3DC] rounded-xl p-1 shadow-sm flex items-center gap-0.5 sm:gap-1">
          <span className="hidden sm:inline text-[10px] font-bold text-[#6B7280] px-1.5">Camera</span>
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCamIdx(idx as 0 | 1 | 2)}
              aria-label={`Campus Camera View ${idx + 1}`}
              className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center justify-center ${
                camIdx === idx ? 'bg-[#18191F] text-white' : 'text-[#4B5563] hover:bg-[#F5F4F0]'
              }`}
            >
              {idx === 0 ? (
                <svg viewBox="0 0 18 14" className="w-3.5 h-3" fill="none">
                  <polygon points="9,1 16,5 9,9 2,5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2 5v4.5L9 13l7-3.5V5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              ) : idx === 1 ? (
                <svg viewBox="0 0 18 14" className="w-3.5 h-3" fill="none">
                  <rect x="2.5" y="2" width="13" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="9" cy="7" r="2.1" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 18 14" className="w-3.5 h-3" fill="none">
                  <polygon points="4.5,2 13.5,2 16,12 2,12" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              )}
            </button>
          ))}

          {scene === 'hq' && (
            <>
              <div className="h-4 w-[1px] bg-[#E6E3DC] mx-0.5" />
              <span className="hidden md:inline text-[9px] font-bold text-[#6B7280] px-1">Scale:</span>
              {[1, 2, 3, 4, 5].map((lvl) => {
                const active = effectiveCommLevel === lvl;
                return (
                  <button
                    key={`hq-lvl-${lvl}`}
                    type="button"
                    data-testid={`hq-level-btn-${lvl}`}
                    onClick={() => setPreviewCommLevel(lvl === computedCommLevel ? null : lvl)}
                    className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold transition cursor-pointer ${
                      active ? 'bg-[#18191F] text-white' : 'bg-[#F6F5F1] text-[#4B5563] hover:bg-[#EAE7E0]'
                    }`}
                  >
                    L{lvl}
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-[#E6E3DC] rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-sm flex items-center gap-2 sm:gap-3 text-left ml-auto">
          {scene === 'hq' && (
            <>
              <div>
                <div className="text-[8.5px] sm:text-[9px] font-semibold text-[#6B7280]">Est. Revenue</div>
                <div className="text-[11px] sm:text-xs font-extrabold text-[#18191F] tabular-nums">
                  {formatMoney(estRevenueK)}
                </div>
              </div>
              <div className="h-5 w-[1px] bg-[#E6E3DC]" />
              <div>
                <div className="text-[8.5px] sm:text-[9px] font-semibold text-[#6B7280]">Supporters</div>
                <div className="text-[11px] sm:text-xs font-extrabold text-[#18191F] tabular-nums">
                  {formatNum(club.fanBase || 0)}
                </div>
              </div>
            </>
          )}
          {scene === 'training' && (
            <>
              <div>
                <div className="text-[8.5px] sm:text-[9px] font-semibold text-[#6B7280]">Squad Rating</div>
                <div className="text-[11px] sm:text-xs font-extrabold text-[#18191F] tabular-nums">
                  {club.baseOvr} OVR
                </div>
              </div>
              <div className="h-5 w-[1px] bg-[#E6E3DC]" />
              <div>
                <div className="text-[8.5px] sm:text-[9px] font-semibold text-[#6B7280]">Youth Pipeline</div>
                <div className="text-[11px] sm:text-xs font-extrabold text-[#18191F] tabular-nums">
                  {youthCount}/10
                </div>
              </div>
            </>
          )}
          {scene === 'boardroom' && (
            <>
              <div>
                <div className="text-[8.5px] sm:text-[9px] font-semibold text-[#6B7280]">Roadmap</div>
                <div className="text-[11px] sm:text-xs font-extrabold text-[#18191F] tabular-nums">
                  {roadmapGoalsDone}/{roadmapGoalsTotal} Goals
                </div>
              </div>
              <div className="h-5 w-[1px] bg-[#E6E3DC]" />
              <div>
                <div className="text-[8.5px] sm:text-[9px] font-semibold text-[#6B7280]">Manager Pts</div>
                <div className="text-[11px] sm:text-xs font-extrabold text-[#18191F] tabular-nums">
                  {skillPoints} MP
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
