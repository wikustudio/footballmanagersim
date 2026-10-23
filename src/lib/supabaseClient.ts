import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateSponsorContent } from '../utils/sponsorModeration';

export interface PressSponsor {
  id: string;
  brand_name: string;
  logo_url: string;
  link_url: string;
  package_type: 'free_48h' | '30_days' | '90_days' | '1_year' | '1_day' | '1_week' | '1_month';
  tagline?: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at?: string;
  is_demo?: boolean;
  is_headline?: boolean;
}

export const SPONSOR_PACKAGES = {
  'free_48h': {
    id: 'free_48h',
    name: '48-Hour Community Spotlight',
    priceEur: 0,
    priceCents: 0,
    durationDays: 2,
    badge: 'COMMUNITY · 48 HOURS',
    desc: 'Free 48-hour trial slot on the press conference wall.',
    perks: ['48 hours active visibility', 'Direct clickable brand link & logo', '1x Free Community Trial']
  },
  '30_days': {
    id: '30_days',
    name: '30-Day Official Partner Pass',
    priceEur: 0.99,
    priceCents: 99,
    durationDays: 30,
    badge: '30 DAYS · BEST VALUE ENTRY',
    desc: 'Instant placement across all post-match press backdrops and leaderboard sponsor wall for 30 full days.',
    perks: ['30 full days 24/7 brand spotlight', 'Direct clickable brand link & logo', 'Active on all post-match press conferences', 'Only ~3¢ per day']
  },
  '90_days': {
    id: '90_days',
    name: '90-Day Seasonal Headline Partner',
    priceEur: 2.49,
    priceCents: 249,
    durationDays: 90,
    badge: '90 DAYS · SEASON PASS',
    desc: 'Centerstage seasonal presence behind the manager microphone and leaderboard for 3 full months.',
    perks: ['90 full days continuous visibility', 'Seasonal spotlight with accent glow', 'Direct clickable brand link & logo', 'Under ~3¢ per day']
  },
  '1_year': {
    id: '1_year',
    name: '1-Year Annual Executive Partner',
    priceEur: 4.99,
    priceCents: 499,
    durationDays: 365,
    badge: '1 YEAR · ANNUAL VIP',
    desc: 'Maximum prestige 365-day annual partner status prominently framed behind the manager microphone.',
    perks: ['365 full days (1 year) top-tier presence', 'Exclusive VIP executive badge & gold frame', 'Direct clickable brand link & priority positioning', 'Only ~1.3¢ per day']
  },
  '1_day': {
    id: '1_day',
    name: '30-Day Official Partner Pass',
    priceEur: 0.99,
    priceCents: 99,
    durationDays: 30,
    badge: '30 DAYS · BEST VALUE ENTRY',
    desc: 'Instant placement across all post-match press backdrops and leaderboard sponsor wall for 30 full days.',
    perks: ['30 full days 24/7 brand spotlight', 'Direct clickable brand link & logo', 'Active on all post-match press conferences', 'Only ~3¢ per day']
  },
  '1_week': {
    id: '1_week',
    name: '90-Day Seasonal Headline Partner',
    priceEur: 2.49,
    priceCents: 249,
    durationDays: 90,
    badge: '90 DAYS · SEASON PASS',
    desc: 'Centerstage seasonal presence behind the manager microphone and leaderboard for 3 full months.',
    perks: ['90 full days continuous visibility', 'Seasonal spotlight with accent glow', 'Direct clickable brand link & logo', 'Under ~3¢ per day']
  },
  '1_month': {
    id: '1_month',
    name: '1-Year Annual Executive Partner',
    priceEur: 4.99,
    priceCents: 499,
    durationDays: 365,
    badge: '1 YEAR · ANNUAL VIP',
    desc: 'Maximum prestige 365-day annual partner status prominently framed behind the manager microphone.',
    perks: ['365 full days (1 year) top-tier presence', 'Exclusive VIP executive badge & gold frame', 'Direct clickable brand link & priority positioning', 'Only ~1.3¢ per day']
  }
} as const;

export const TOTAL_PRESS_SLOTS = 18;
export const HEADLINE_SLOTS_COUNT = 3;
export const GRID_SLOTS_COUNT = 15;

export interface PressRoomSlots {
  headlineSlots: (PressSponsor | null)[];
  gridSlots: (PressSponsor | null)[];
  occupiedCount: number;
  availableCount: number;
}

export const DEFAULT_SUPABASE_URL = 'https://grrhlhhinmjglnvmmbzb.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycmhsaGhpbm1qZ2xudm1tYnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDM3ODYsImV4cCI6MjEwMzA3OTc4Nn0.rqONT4AeXhmFNL-r9nrMc7V35cSDloCiELILkk1roYY';

const rawEnvAnonKey = typeof import.meta.env.VITE_SUPABASE_ANON_KEY === 'string'
  ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim()
  : '';
const isValidPublicAnonKey =
  rawEnvAnonKey.length > 20 &&
  !rawEnvAnonKey.startsWith('sb_secret_') &&
  !rawEnvAnonKey.includes(' ');

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = isValidPublicAnonKey ? rawEnvAnonKey : DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface LeaderboardEntry {
  id: string | number;
  managerName: string;
  clubName: string;
  score: number;
  trophies: number;
  date: string;
  startTier?: number;
}

const LOCAL_HIGHSCORES_KEY = 'fms_local_highscores_v1';

export function getLocalHighscores(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_HIGHSCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let cachedTop50: LeaderboardEntry[] | null = null;
let cachedPressSponsors: PressSponsor[] | null = null;

const CACHE_TOP50_KEY = 'fms_cached_top50_v1';
const CACHE_SPONSORS_KEY = 'fms_cached_sponsors_v1';

export function getQuickCachedHighscores(): LeaderboardEntry[] {
  if (cachedTop50 && cachedTop50.length > 0) return cachedTop50;
  try {
    const raw = sessionStorage.getItem(CACHE_TOP50_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedTop50 = parsed;
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return getLocalHighscores();
}

export async function fetchTop50Highscores(): Promise<LeaderboardEntry[]> {
  const localScores = getLocalHighscores();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${supabaseUrl}/rest/v1/highscores?select=*&order=score.desc&limit=100`, {
      signal: controller.signal,
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const remoteList: LeaderboardEntry[] = data.map((item: any, idx: number) => ({
          id: item.id || `hs-${idx}-${item.score}`,
          managerName: String(item.managerName || item.manager_name || 'Manager').trim(),
          clubName: String(item.clubName || item.club_name || 'Club').trim(),
          score: typeof item.score === 'number' ? item.score : parseInt(item.score, 10) || 0,
          trophies: typeof item.trophies === 'number' ? item.trophies : parseInt(item.trophies, 10) || 0,
          date: item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString() : ''),
          startTier: item.start_tier || item.startTier,
        }));

        const map = new Map<string, LeaderboardEntry>();
        for (const item of [...remoteList, ...localScores]) {
          const mName = (item.managerName || '').toLowerCase().trim();
          const cName = (item.clubName || '').toLowerCase().trim();
          const key = `${mName}-${cName}-${item.score}`;
          if (!map.has(key)) {
            map.set(key, item);
          }
        }

        const sorted = Array.from(map.values())
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 50);

        cachedTop50 = sorted;
        try {
          sessionStorage.setItem(CACHE_TOP50_KEY, JSON.stringify(sorted));
        } catch {
          // ignore
        }

        return sorted;
      }
    }
  } catch (err) {
    console.warn('Could not query Supabase highscores (falling back to cache):', err);
  }

  return cachedTop50 || localScores.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 50);
}

export const DEFAULT_PRESS_SPONSORS: PressSponsor[] = [];

const LOCAL_SPONSORS_KEY = 'fms_press_sponsors_v1';

export function getLocalSponsors(): PressSponsor[] {
  try {
    const raw = localStorage.getItem(LOCAL_SPONSORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSponsor(sponsor: PressSponsor): void {
  try {
    const existing = getLocalSponsors().filter(s => s.id !== sponsor.id);
    const updated = [sponsor, ...existing];
    localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save sponsor locally', e);
  }
}

export function getQuickCachedSponsors(): PressSponsor[] {
  if (cachedPressSponsors && cachedPressSponsors.length > 0) return cachedPressSponsors;
  try {
    const raw = sessionStorage.getItem(CACHE_SPONSORS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedPressSponsors = parsed;
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return getLocalSponsors().filter(s => new Date(s.expires_at).getTime() > Date.now());
}

export async function fetchPressSponsors(): Promise<PressSponsor[]> {
  const localPurchases = getLocalSponsors().filter(s => {
    return new Date(s.expires_at).getTime() > Date.now();
  });

  const filterSafe = (list: PressSponsor[]) => {
    return list.filter(item => {
      const check = validateSponsorContent({
        brandName: item.brand_name,
        tagline: item.tagline,
        linkUrl: item.link_url
      });
      return check.isValid;
    });
  };

  if (!supabase) {
    const safeLocal = filterSafe(localPurchases);
    cachedPressSponsors = safeLocal;
    return safeLocal;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const nowIso = encodeURIComponent(new Date().toISOString());

    const res = await fetch(`${supabaseUrl}/rest/v1/press_sponsors?select=*&is_active=eq.true&expires_at=gt.${nowIso}&order=created_at.desc&limit=40`, {
      signal: controller.signal,
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const safeFallback = filterSafe(localPurchases);
      cachedPressSponsors = safeFallback;
      return safeFallback;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      const safeOnly = filterSafe(localPurchases);
      cachedPressSponsors = safeOnly;
      return safeOnly;
    }

    const remoteSponsors: PressSponsor[] = data.map((item: any) => ({
      id: item.id,
      brand_name: item.brand_name,
      logo_url: item.logo_url,
      link_url: item.link_url,
      package_type: item.package_type,
      tagline: item.tagline || item.brand_name,
      starts_at: item.starts_at,
      expires_at: item.expires_at,
      is_active: item.is_active,
      created_at: item.created_at,
      is_headline: item.package_type === '90_days' || item.package_type === '1_year' || item.package_type === '1_week' || item.package_type === '1_month'
    }));

    const remoteIds = new Set(remoteSponsors.map(r => r.id));
    const merged = [
      ...remoteSponsors,
      ...localPurchases.filter(l => !remoteIds.has(l.id))
    ];

    const brandMap = new Map<string, PressSponsor>();
    for (const item of merged) {
      const normKey = (item.brand_name || '').toLowerCase().trim();
      const existing = brandMap.get(normKey);
      if (!existing) {
        brandMap.set(normKey, item);
      } else {
        const existingExp = new Date(existing.expires_at).getTime();
        const itemExp = new Date(item.expires_at).getTime();
        if (itemExp > existingExp) {
          brandMap.set(normKey, item);
        }
      }
    }
    const deduplicated = Array.from(brandMap.values());

    const safeMerged = filterSafe(deduplicated);
    cachedPressSponsors = safeMerged;
    try {
      sessionStorage.setItem(CACHE_SPONSORS_KEY, JSON.stringify(safeMerged));
    } catch {
      // ignore
    }

    return safeMerged;
  } catch (err) {
    console.warn('Error querying Supabase press_sponsors:', err);
    return filterSafe(localPurchases);
  }
}

export async function registerActiveSponsor(params: {
  brand_name: string;
  logo_url: string;
  link_url: string;
  package_type: 'free_48h' | '30_days' | '90_days' | '1_year' | '1_day' | '1_week' | '1_month';
  tagline?: string;
}): Promise<PressSponsor> {
  const pkg = (SPONSOR_PACKAGES as any)[params.package_type] || SPONSOR_PACKAGES['30_days'];
  const now = new Date();
  const durationDays = pkg?.durationDays ?? (params.package_type === 'free_48h' ? 2 : 30);
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const newSponsor: PressSponsor = {
    id: `sponsor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    brand_name: params.brand_name.trim(),
    logo_url: params.logo_url.trim(),
    link_url: params.link_url.trim().startsWith('http') ? params.link_url.trim() : `https://${params.link_url.trim()}`,
    package_type: params.package_type,
    tagline: params.tagline?.trim() || params.brand_name.trim(),
    starts_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    is_active: true,
    created_at: now.toISOString(),
    is_headline: params.package_type === '90_days' || params.package_type === '1_year' || params.package_type === '1_week' || params.package_type === '1_month'
  };

  if (supabase) {
    const nowIso = now.toISOString();
    if (params.package_type === 'free_48h') {
      const { count: freeCount } = await supabase
        .from('press_sponsors')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('package_type', 'free_48h')
        .gt('expires_at', nowIso);

      if (typeof freeCount === 'number' && freeCount >= 2) {
        throw new Error('Community Spotlight (48h free trial) slots are currently at full capacity (2/2 active slots).');
      }
    }
  }

  saveLocalSponsor(newSponsor);

  try {
    const res = await fetch('/api/confirm-sponsor-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandName: newSponsor.brand_name,
        logoUrl: newSponsor.logo_url,
        linkUrl: newSponsor.link_url,
        packageType: params.package_type,
        tagline: newSponsor.tagline
      })
    });

    if (!res.ok && supabase) {
      await supabase.from('press_sponsors').insert({
        brand_name: newSponsor.brand_name,
        logo_url: newSponsor.logo_url,
        link_url: newSponsor.link_url,
        package_type: newSponsor.package_type,
        tagline: newSponsor.tagline,
        starts_at: newSponsor.starts_at,
        expires_at: newSponsor.expires_at,
        is_active: true
      });
    }
  } catch {
    if (supabase) {
      await supabase.from('press_sponsors').insert({
        brand_name: newSponsor.brand_name,
        logo_url: newSponsor.logo_url,
        link_url: newSponsor.link_url,
        package_type: newSponsor.package_type,
        tagline: newSponsor.tagline,
        starts_at: newSponsor.starts_at,
        expires_at: newSponsor.expires_at,
        is_active: true
      });
    }
  }

  return newSponsor;
}

export const HIGHSCORE_SALT = 'FMS_AUTHENTICATED_LEADERBOARD_SALT_2026_V1';

export async function computeHighscoreSignature(score: number, clubName: string, managerName: string): Promise<string> {
  const normClub = String(clubName || '').trim().toLowerCase();
  const normManager = String(managerName || '').trim().toLowerCase();
  const raw = `${score}:${normClub}:${normManager}:${HIGHSCORE_SALT}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(raw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return '';
}

export async function submitAuthenticatedHighscore(entry: {
  managerName: string;
  clubName: string;
  score: number;
  trophies: number;
  seasonsPlayed?: number;
  trophiesWon?: number;
  careerWins?: number;
  date?: string;
  start_tier?: number;
}): Promise<boolean> {
  const numSeasons = Math.max(1, Math.min(35, Math.round(Number(entry.seasonsPlayed ?? 35))));
  const numScore = Math.round(Number(entry.score || 0));
  const numTrophies = Math.round(Number(entry.trophiesWon ?? entry.trophies ?? 0));
  const numWins = Math.round(Number(entry.careerWins ?? 0));

  if (
    numScore < 0 || numScore > Math.min(2000000, numSeasons * 65000) ||
    numTrophies < 0 || numTrophies > Math.min(210, numSeasons * 6) ||
    numWins < 0 || numWins > numSeasons * 45
  ) {
    console.warn('Highscore rejected: failed plausibility check');
    return false;
  }

  try {
    const signature = await computeHighscoreSignature(entry.score, entry.clubName, entry.managerName);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/submit-highscore', {
      signal: controller.signal,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...entry,
        signature
      })
    });
    clearTimeout(timeoutId);
    if (res.ok) return true;
  } catch {
    // Fall through to direct Supabase insert on static deploy
  }

  if (supabase) {
    try {
      const { error } = await supabase.from('highscores').insert({
        managerName: String(entry.managerName).trim().slice(0, 50),
        clubName: String(entry.clubName).trim().slice(0, 50),
        score: numScore,
        trophies: numTrophies,
        date: entry.date || new Date().toISOString(),
        start_tier: typeof entry.start_tier === 'number' ? Math.max(1, Math.min(11, entry.start_tier)) : 1
      });
      return !error;
    } catch (e) {
      console.warn('Direct Supabase highscore insert failed:', e);
    }
  }

  return false;
}

export function partitionPressSlots(sponsors: PressSponsor[]): PressRoomSlots {
  const activeSponsors = sponsors.filter(s => s.is_active);

  const headlines = activeSponsors.filter(s => s.is_headline || s.package_type === '1_week' || s.package_type === '1_month' || s.package_type === '90_days' || s.package_type === '1_year');
  const regulars = activeSponsors.filter(s => !headlines.includes(s));

  const headlineSlots: (PressSponsor | null)[] = [];
  for (let i = 0; i < HEADLINE_SLOTS_COUNT; i++) {
    headlineSlots.push(headlines[i] || null);
  }

  const surplusHeadlines = headlines.slice(HEADLINE_SLOTS_COUNT);
  const combinedGrid = [...surplusHeadlines, ...regulars];

  const gridSlots: (PressSponsor | null)[] = [];
  for (let i = 0; i < GRID_SLOTS_COUNT; i++) {
    gridSlots.push(combinedGrid[i] || null);
  }

  const occupiedCount = headlineSlots.filter(Boolean).length + gridSlots.filter(Boolean).length;
  const availableCount = Math.max(0, TOTAL_PRESS_SLOTS - occupiedCount);

  return {
    headlineSlots,
    gridSlots,
    occupiedCount,
    availableCount
  };
}