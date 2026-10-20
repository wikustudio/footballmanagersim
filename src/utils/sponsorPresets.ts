/**
 * Standard Presets for Sponsor Logos
 * Uses clean SVG icons or web links to avoid gigantic inline data URI strings in database and Stripe metadata.
 */

export interface PresetLogo {
  id: string;
  label: string;
  url: string;
}

const createPresetSvg = (bgColor: string, accentColor: string, iconSvg: string) => {
  const raw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="22" fill="${bgColor}"/><rect width="96" height="96" x="2" y="2" rx="20" fill="none" stroke="${accentColor}" stroke-width="2" stroke-opacity="0.4"/>${iconSvg}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
};

export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: 'tactics-lab',
    label: 'Tactics Lab',
    url: createPresetSvg('#062419', '#10b981', '<path d="M26 30h48v40H26z" fill="none" stroke="#10b981" stroke-width="2.5" stroke-dasharray="3,3"/><circle cx="50" cy="50" r="10" fill="none" stroke="#34d399" stroke-width="2.5"/><path d="M40 40l20 20M60 40L40 60" stroke="#6ee7b7" stroke-width="3" stroke-linecap="round"/>')
  },
  {
    id: 'boot-room-pod',
    label: 'Boot Room Pod',
    url: createPresetSvg('#082032', '#38bdf8', '<rect x="42" y="26" width="16" height="28" rx="8" fill="#38bdf8"/><path d="M34 44a16 16 0 0 0 32 0M50 60v14M40 74h20" fill="none" stroke="#7dd3fc" stroke-width="3.5" stroke-linecap="round"/>')
  },
  {
    id: 'scouting-radar',
    label: 'Scouting Radar',
    url: createPresetSvg('#2e1c05', '#f59e0b', '<circle cx="50" cy="50" r="26" fill="none" stroke="#f59e0b" stroke-width="2"/><circle cx="50" cy="50" r="14" fill="none" stroke="#fbbf24" stroke-width="2"/><path d="M50 20v60M20 50h60M50 50l18-18" stroke="#fde68a" stroke-width="2.5" stroke-linecap="round"/>')
  },
  {
    id: 'touchline-tv',
    label: 'Touchline TV',
    url: createPresetSvg('#2d0a0a', '#ef4444', '<rect x="22" y="32" width="36" height="28" rx="6" fill="#ef4444"/><path d="M58 40l20-10v32l-20-10z" fill="#f87171"/><circle cx="32" cy="42" r="4" fill="#fff"/>')
  },
  {
    id: 'stadium-club',
    label: 'Stadium Club',
    url: createPresetSvg('#0b192e', '#3b82f6', '<path d="M50 20L28 30v22c0 16 12 26 22 28 10-2 22-12 22-28V30L50 20z" fill="#1e3a8a" stroke="#60a5fa" stroke-width="2.5"/><circle cx="50" cy="48" r="10" fill="#fff"/><path d="M50 42l4 4-2 6h-4l-2-6z" fill="#1e3a8a"/>')
  },
  {
    id: 'analytics-pro',
    label: 'Analytics Pro',
    url: createPresetSvg('#1f0d3d', '#a855f7', '<path d="M26 68l14-18 12 10 22-26" fill="none" stroke="#c084fc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="74" cy="34" r="4" fill="#e9d5ff"/><path d="M24 74h52" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round"/>')
  }
];

export const PRESET_LOGO_MAP: Record<string, string> = PRESET_LOGOS.reduce((acc, p) => {
  acc[p.id] = p.url;
  return acc;
}, {} as Record<string, string>);

/**
 * Resolves a logo string. If it's a preset key (e.g. "preset:tactics-lab"), returns the SVG data URL.
 */
export function resolveLogoUrl(input: string | undefined | null): string {
  if (!input) return PRESET_LOGOS[0].url;
  const trimmed = input.trim();
  if (trimmed.startsWith('preset:')) {
    const id = trimmed.replace('preset:', '');
    return PRESET_LOGO_MAP[id] || PRESET_LOGOS[0].url;
  }
  return trimmed || PRESET_LOGOS[0].url;
}

/**
 * Encodes a logo for safe transmission in Stripe metadata (< 500 chars).
 * If it matches a preset SVG, it returns 'preset:<id>' (e.g. 'preset:tactics-lab').
 */
export function encodeSafeLogoForMetadata(logoUrl: string | undefined | null): string {
  if (!logoUrl) return '';
  const trimmed = logoUrl.trim();
  const foundPreset = PRESET_LOGOS.find(p => p.url === trimmed || p.id === trimmed);
  if (foundPreset) {
    return `preset:${foundPreset.id}`;
  }
  if (trimmed.length > 450) {
    return '';
  }
  return trimmed;
}
