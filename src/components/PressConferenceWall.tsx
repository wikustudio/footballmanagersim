import React, { useState } from 'react';
import {
  PressSponsor,
  partitionPressSlots,
  TOTAL_PRESS_SLOTS,
  HEADLINE_SLOTS_COUNT
} from '../lib/supabaseClient';
import { resolveLogoUrl, PRESET_LOGOS } from '../utils/sponsorPresets';

const SVG_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#F5F3EE"/><circle cx="50" cy="50" r="28" fill="none" stroke="#18191F" stroke-width="3"/><path d="M40 50h20M50 40v20" stroke="#18191F" stroke-width="3.5" stroke-linecap="round"/></svg>'
  );

// Refined editorial accent stripes matching the warm-stone card language
const ACCENT_BARS = [
  '#18191F', // Editorial Charcoal
  '#0369A1', // Deep Sky
  '#047857', // Pitch Emerald
  '#B45309', // Warm Amber
  '#991B1B', // Club Crimson
  '#4338CA', // Royal Indigo
];

export interface SlotSelectionInfo {
  slotNumber: number;
  slotLabel: string;
  isPremium: boolean;
}

export interface HouseFallbackData {
  brand_name: string;
  link_url?: string;
  tagline: string;
  badge: string;
  logo_url: string;
  isSample: boolean;
}

export const ROW_FALLBACKS: Record<number, HouseFallbackData> = {
  0: {
    brand_name: 'Buy Me a Coffee',
    link_url: 'https://buymeacoffee.com/willykuhne',
    tagline: 'Support Engine Updates',
    badge: 'Supporter',
    logo_url: PRESET_LOGOS[2].url,
    isSample: false
  },
  1: {
    brand_name: 'Tactical Lab Pro',
    tagline: 'Your Brand Here · Claim Slot',
    badge: 'Sample',
    logo_url: PRESET_LOGOS[0].url,
    isSample: true
  },
  2: {
    brand_name: 'Ultras Curva Zine',
    tagline: 'Your Channel Here · Free 48h',
    badge: 'Sample',
    logo_url: PRESET_LOGOS[3].url,
    isSample: true
  }
};

interface PressConferenceWallProps {
  sponsors: PressSponsor[];
  onOpenCheckout: (
    packageType?: 'free_48h' | '30_days' | '90_days' | '1_year' | '1_day' | '1_week' | '1_month',
    slotInfo?: SlotSelectionInfo
  ) => void;
  isLoading?: boolean;
  managerName?: string;
}

export const PressConferenceWall: React.FC<PressConferenceWallProps> = ({
  sponsors,
  onOpenCheckout,
  managerName
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(true);

  const displayManagerName = managerName && managerName.trim() ? managerName.trim() : 'Managers';
  const { headlineSlots, gridSlots, occupiedCount, availableCount } = partitionPressSlots(sponsors);

  const createTrackItems = (rowIndex: number) => {
    const items: Array<
      | { type: 'sponsor'; data: PressSponsor }
      | { type: 'house'; data: HouseFallbackData; slotNumber: number }
      | { type: 'slot'; index: number; tier: '30_days' | '90_days' }
    > = [];
    const chunkSize = 5;
    const rowSlots = gridSlots.slice(rowIndex * chunkSize, (rowIndex + 1) * chunkSize);

    const hasHouseFallback = Boolean(ROW_FALLBACKS[rowIndex]);
    let housePlaced = false;

    rowSlots.forEach((sponsor, i) => {
      const slotNum = rowIndex * chunkSize + i + 1;
      if (sponsor) {
        items.push({ type: 'sponsor', data: sponsor });
      } else if (hasHouseFallback && !housePlaced && i === 1) {
        items.push({
          type: 'house',
          data: ROW_FALLBACKS[rowIndex],
          slotNumber: slotNum
        });
        housePlaced = true;
      } else {
        items.push({ type: 'slot', index: slotNum, tier: '30_days' });
      }
    });

    if (hasHouseFallback && !housePlaced) {
      const firstOpenSlotIdx = items.findIndex((it) => it.type === 'slot');
      if (firstOpenSlotIdx !== -1) {
        const slotItem = items[firstOpenSlotIdx] as { type: 'slot'; index: number; tier: '30_days' | '90_days' };
        items[firstOpenSlotIdx] = {
          type: 'house',
          data: ROW_FALLBACKS[rowIndex],
          slotNumber: slotItem.index
        };
      }
    }

    while (items.length < 8) {
      items.push({ type: 'slot', index: items.length + 1, tier: '30_days' });
    }

    return [...items, ...items];
  };

  const row1Items = createTrackItems(0);
  const row2Items = createTrackItems(1);
  const row3Items = createTrackItems(2);

  return (
    <div
      className="relative w-full rounded-[28px] overflow-hidden border border-[#E6E3DC] bg-white shadow-[0_6px_24px_rgba(24,25,31,0.05)] mb-8 select-none"
      data-testid="press-conference-wall"
    >
      {/* 1. Editorial Header */}
      <div className="px-5 sm:px-7 py-5 bg-[#FAF9F6] border-b border-[#E6E3DC] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#18191F]">
              Official Partners
            </h2>
            <span className="text-[#C7C4BC] text-xs" aria-hidden="true">·</span>
            <span
              className={`font-mono font-bold text-xs tabular-nums ${
                availableCount === 0 ? 'text-rose-700' : 'text-amber-800'
              }`}
            >
              {occupiedCount}/{TOTAL_PRESS_SLOTS} {availableCount === 0 ? 'Slots Full' : 'Active Slots'}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Featured across the global Hall of Fame backdrop and post-match press briefings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsMoving(!isMoving)}
            className="px-3.5 py-2 rounded-xl border border-[#E6E3DC] bg-white hover:bg-[#EFECE4] text-[#4B5563] hover:text-[#18191F] transition cursor-pointer text-xs font-bold flex items-center gap-1.5"
          >
            <i className={`fa-solid ${isMoving ? 'fa-pause' : 'fa-play'} text-[10px]`}></i>
            <span>{isMoving ? 'Pause Wall' : 'Resume Wall'}</span>
          </button>

          {availableCount === 0 ? (
            <button
              type="button"
              disabled
              title="All 18 slots are currently occupied."
              className="px-4 py-2 rounded-xl bg-[#EFECE4] text-[#9A9890] font-bold text-xs border border-[#E6E3DC] cursor-not-allowed flex items-center gap-2"
            >
              <i className="fa-solid fa-lock text-xs"></i>
              <span>Wall Full (18/18)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenCheckout('30_days')}
              className="px-4 py-2 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <i className="fa-solid fa-file-signature text-xs text-amber-300"></i>
              <span>Sign Sponsor Deal · Free 48h / €0.99</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Subtle Editorial Broadcast Ribbon */}
      <div className="py-2 px-4 bg-[#EFECE4] border-b border-[#E6E3DC] flex items-center justify-around overflow-hidden text-[#6B7280] text-[10px] font-bold tracking-[0.2em] uppercase">
        <span>Football Manager Sim</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">Official Media Backdrop</span>
        <span className="hidden md:inline">·</span>
        <span className="hidden md:inline">Global Partner Wall</span>
      </div>

      {/* 3. Pinned Headline Partners */}
      <div className="px-4 sm:px-7 pt-5 pb-5 bg-[#FAF9F6]">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 font-extrabold uppercase tracking-wider text-[#18191F]">
            <i className="fa-solid fa-crown text-amber-600 text-xs"></i>
            <span>Headline Partners ({HEADLINE_SLOTS_COUNT} Pinned Slots)</span>
          </div>
          <span className="text-[#6B7280] font-mono text-[11px] hidden sm:inline">
            Centerstage placement · 90 Days or 1 Year
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {headlineSlots.map((sponsor, idx) => {
            if (sponsor) {
              return (
                <a
                  key={sponsor.id}
                  href={sponsor.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-3.5 rounded-2xl bg-white border border-[#E6E3DC] border-l-4 border-l-amber-500 hover:border-[#18191F] shadow-xs transition-all cursor-pointer flex items-center gap-3 overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] shrink-0 p-1.5 flex items-center justify-center">
                    <img
                      src={resolveLogoUrl(sponsor.logo_url)}
                      alt={sponsor.brand_name}
                      className="w-full h-full object-contain rounded group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = SVG_FALLBACK;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      Headline Partner
                    </div>
                    <div className="font-black text-[#18191F] text-sm truncate group-hover:text-amber-800 transition-colors">
                      {sponsor.brand_name}
                    </div>
                    <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                      {sponsor.tagline || 'Official Headline Partner'}
                    </p>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-[#9A9890] group-hover:text-[#18191F] shrink-0"></i>
                </a>
              );
            }

            if (idx === 2) {
              return (
                <a
                  key="house-wiku-studio"
                  href="https://wiku.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-3.5 rounded-2xl bg-white border border-[#E6E3DC] border-l-4 border-l-emerald-600 hover:border-[#18191F] shadow-xs transition-all cursor-pointer flex items-center gap-3 overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] shrink-0 p-1.5 flex items-center justify-center">
                    <img
                      src={PRESET_LOGOS[0].url}
                      alt="Wiku Studio"
                      className="w-full h-full object-contain rounded group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Creator Studio
                    </div>
                    <div className="font-black text-[#18191F] text-sm truncate group-hover:text-emerald-800 transition-colors">
                      Wiku Studio
                    </div>
                    <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                      Official Game Studio &amp; Football Lab
                    </p>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-[#9A9890] group-hover:text-[#18191F] shrink-0"></i>
                </a>
              );
            }

            return (
              <button
                key={`vacant-premium-${idx}`}
                type="button"
                onClick={() =>
                  onOpenCheckout('90_days', {
                    slotNumber: idx + 1,
                    slotLabel: `Headline Partner Slot #${idx + 1}`,
                    isPremium: true
                  })
                }
                className="group relative p-3.5 rounded-2xl border border-dashed border-[#D2CEC4] hover:border-[#18191F] bg-white/80 hover:bg-white transition-all text-left cursor-pointer flex items-center gap-3 overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl border border-dashed border-[#D2CEC4] group-hover:border-[#18191F] flex items-center justify-center text-amber-700 shrink-0 bg-[#FAF9F6]">
                  <i className="fa-solid fa-crown text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-extrabold text-[#18191F] text-xs sm:text-sm truncate block">
                    Headline Slot #{idx + 1} Open
                  </span>
                  <span className="text-[11px] text-[#6B7280] block truncate">
                    Pinned spotlight from €2.49 · 90 Days
                  </span>
                  <span className="text-[10px] text-amber-800 font-bold block mt-0.5 group-hover:underline">
                    Claim Headline Spot →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Warm-Stone Scrolling Broadcast Backdrop Wall */}
      <div className="relative py-4 bg-[#F5F3EE] border-y border-[#E6E3DC] overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-10 sm:w-16 bg-gradient-to-r from-[#F5F3EE] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-10 sm:w-16 bg-gradient-to-l from-[#F5F3EE] to-transparent z-10 pointer-events-none" />

        <div className="space-y-2.5">
          <div
            className="flex items-center gap-2.5 will-change-transform"
            style={{
              animation: isMoving ? 'marquee-left 34s linear infinite' : 'none',
              width: 'max-content'
            }}
          >
            {row1Items.map((item, idx) => (
              <TileRenderer
                key={`r1-${idx}`}
                item={item}
                accentColor={ACCENT_BARS[idx % ACCENT_BARS.length]}
                onOpenCheckout={onOpenCheckout}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
              />
            ))}
          </div>

          <div
            className="flex items-center gap-2.5 will-change-transform"
            style={{
              animation: isMoving ? 'marquee-right 38s linear infinite' : 'none',
              width: 'max-content'
            }}
          >
            {row2Items.map((item, idx) => (
              <TileRenderer
                key={`r2-${idx}`}
                item={item}
                accentColor={ACCENT_BARS[(idx + 2) % ACCENT_BARS.length]}
                onOpenCheckout={onOpenCheckout}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
              />
            ))}
          </div>

          <div
            className="flex items-center gap-2.5 will-change-transform"
            style={{
              animation: isMoving ? 'marquee-left 42s linear infinite' : 'none',
              width: 'max-content'
            }}
          >
            {row3Items.map((item, idx) => (
              <TileRenderer
                key={`r3-${idx}`}
                item={item}
                accentColor={ACCENT_BARS[(idx + 4) % ACCENT_BARS.length]}
                onOpenCheckout={onOpenCheckout}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Refined Editorial Press Conference Podium Desk */}
      <div className="bg-[#FAF9F6] px-5 sm:px-7 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
          <i className="fa-solid fa-tower-broadcast text-[#18191F] text-xs"></i>
          <span>Matchday Press Backdrop</span>
        </div>

        {/* Sleek Studio Desk Nameplate */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white border border-[#E6E3DC] shadow-2xs">
          <i className="fa-solid fa-microphone-lines text-xs text-[#6B7280]" aria-hidden="true"></i>
          <div className="h-3.5 w-[1px] bg-[#E6E3DC]" />
          <span className="text-[11px] font-black text-[#18191F] tracking-widest uppercase">
            {displayManagerName}
          </span>
          <i className="fa-solid fa-trophy text-amber-600 text-xs" aria-hidden="true"></i>
        </div>

        <div className="text-[11px] font-semibold text-[#6B7280] tabular-nums">
          {availableCount > 0 ? `${availableCount} partner slots open` : 'All 18 slots reserved'}
        </div>
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0%, 0, 0); }
        }
      `}</style>
    </div>
  );
};

interface TileRendererProps {
  item:
    | { type: 'sponsor'; data: PressSponsor }
    | { type: 'house'; data: HouseFallbackData; slotNumber: number }
    | { type: 'slot'; index: number; tier: '30_days' | '90_days' | '1_day' | '1_week' };
  accentColor: string;
  onOpenCheckout: (
    packageType?: 'free_48h' | '30_days' | '90_days' | '1_year' | '1_day' | '1_week' | '1_month',
    slotInfo?: SlotSelectionInfo
  ) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}

const TileRendererComponent: React.FC<TileRendererProps> = ({
  item,
  accentColor,
  onOpenCheckout,
  hoveredId,
  setHoveredId
}) => {
  if (item.type === 'sponsor') {
    const sponsor = item.data;
    const isHovered = hoveredId === sponsor.id;

    return (
      <a
        href={sponsor.link_url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHoveredId(sponsor.id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{ borderLeftColor: accentColor }}
        className={`shrink-0 w-56 sm:w-60 h-16 rounded-2xl bg-white border border-[#E6E3DC] border-l-[3px] shadow-2xs flex items-center px-3 py-1.5 gap-2.5 transition-all duration-150 cursor-pointer overflow-hidden ${
          isHovered ? 'border-[#18191F] shadow-sm -translate-y-0.5' : 'hover:border-[#C7C4BC]'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] shrink-0 p-1.5 flex items-center justify-center">
          <img
            src={resolveLogoUrl(sponsor.logo_url)}
            alt={sponsor.brand_name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = SVG_FALLBACK;
            }}
          />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="font-extrabold text-xs sm:text-sm truncate leading-tight text-[#18191F]">
            {sponsor.brand_name}
          </div>
          <div className="text-[10px] truncate text-[#6B7280] mt-0.5">
            {sponsor.tagline || 'Official Partner'}
          </div>
        </div>
      </a>
    );
  }

  if (item.type === 'house') {
    const house = item.data;
    if (house.isSample) {
      return (
        <button
          type="button"
          onClick={() =>
            onOpenCheckout('30_days', {
              slotNumber: item.slotNumber,
              slotLabel: `Moving Wall Slot #${item.slotNumber}`,
              isPremium: false
            })
          }
          style={{ borderLeftColor: accentColor }}
          className="shrink-0 w-56 sm:w-60 h-16 rounded-2xl bg-white border border-[#E6E3DC] border-l-[3px] hover:border-[#18191F] shadow-2xs flex items-center px-3 py-1.5 gap-2.5 transition-all duration-150 cursor-pointer overflow-hidden text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] shrink-0 p-1.5 flex items-center justify-center">
            <img
              src={house.logo_url}
              alt={house.brand_name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = SVG_FALLBACK;
              }}
            />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[9px] font-bold uppercase tracking-wider text-amber-800 leading-none mb-0.5">
              {house.badge}
            </div>
            <div className="font-extrabold text-xs truncate leading-tight text-[#18191F]">
              {house.brand_name}
            </div>
            <div className="text-[10px] truncate text-[#6B7280] mt-0.5">{house.tagline}</div>
          </div>
        </button>
      );
    }

    return (
      <a
        href={house.link_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ borderLeftColor: accentColor }}
        className="shrink-0 w-56 sm:w-60 h-16 rounded-2xl bg-white border border-[#E6E3DC] border-l-[3px] hover:border-[#18191F] shadow-2xs flex items-center px-3 py-1.5 gap-2.5 transition-all duration-150 cursor-pointer overflow-hidden"
      >
        <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E6E3DC] shrink-0 p-1.5 flex items-center justify-center">
          <img
            src={house.logo_url}
            alt={house.brand_name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = SVG_FALLBACK;
            }}
          />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 leading-none mb-0.5">
            {house.badge}
          </div>
          <div className="font-extrabold text-xs truncate leading-tight text-[#18191F]">
            {house.brand_name}
          </div>
          <div className="text-[10px] truncate text-[#6B7280] mt-0.5">{house.tagline}</div>
        </div>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        onOpenCheckout(item.tier, {
          slotNumber: item.index,
          slotLabel: `Moving Wall Slot #${item.index}`,
          isPremium: false
        })
      }
      className="shrink-0 w-56 sm:w-60 h-16 rounded-2xl bg-[#FAF9F6] border border-dashed border-[#D2CEC4] hover:border-[#18191F] hover:bg-white shadow-2xs flex items-center px-3 py-1.5 gap-2.5 transition-all duration-150 cursor-pointer text-left group"
    >
      <div className="w-9 h-9 rounded-xl border border-dashed border-[#D2CEC4] group-hover:border-[#18191F] flex items-center justify-center text-[#6B7280] group-hover:text-[#18191F] shrink-0 bg-white">
        <i className="fa-solid fa-plus text-xs group-hover:rotate-90 transition-transform"></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-xs text-[#18191F] truncate">
          Claim Slot #{item.index}
        </div>
        <div className="text-[10px] text-amber-800 font-mono font-bold truncate">
          Free 48h or €0.99
        </div>
      </div>
    </button>
  );
};

const TileRenderer = React.memo(TileRendererComponent);

export default PressConferenceWall;
