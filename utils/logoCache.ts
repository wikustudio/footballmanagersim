/**
 * High-performance persistent localStorage & in-memory caching system for club logos.
 * 
 * Benefits:
 * 1. Persistent Verified URLs: Remembers the exact working URL for every club across sessions.
 * 2. Instant Memory Cache: Tracks already-loaded URLs in-session so re-renders/screen transitions
 *    render the logo synchronously without placeholder flashes or opacity transitions.
 * 3. LocalStorage Data-URL (Blob) Cache: Caches base64 data URLs for active & recent clubs with
 *    automatic LRU pruning to stay safely within browser storage quotas (< 2 MB).
 */

const VERIFIED_URLS_STORAGE_KEY = 'fms_logo_verified_urls_v1';
const DATA_URLS_STORAGE_KEY = 'fms_logo_data_cache_v1';
const MAX_CACHED_DATA_URLS = 80; // Keep up to 80 clubs (~1.2 MB max)

// In-memory instant lookup maps
const verifiedUrlMap = new Map<string, string>();
const dataUrlMap = new Map<string, string>();
const loadedMemoryUrls = new Set<string>();
const lruOrder: string[] = [];

// Initialize from localStorage safely once on startup
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const savedUrls = localStorage.getItem(VERIFIED_URLS_STORAGE_KEY);
    if (savedUrls) {
      const parsed = JSON.parse(savedUrls);
      if (parsed && typeof parsed === 'object') {
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string') verifiedUrlMap.set(k, v);
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load verified logo URL cache from localStorage:', e);
  }

  // Proactively purge legacy Base64 blob cache from localStorage to protect storage quota
  try {
    localStorage.removeItem(DATA_URLS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Returns a standardized unique key for a club based on its ID or normalized name.
 */
export const getClubLogoKey = (id?: number, name?: string): string => {
  if (id != null && !isNaN(Number(id))) return `id:${id}`;
  if (name) {
    const clean = name
      .toLowerCase()
      .replace(/\s+ii$/, '')
      .replace(/\s+\(?b\)?$/, '')
      .replace(/\s+castilla$/, '')
      .trim();
    return `name:${clean}`;
  }
  return 'unknown';
};

/**
 * Returns any cached logo (prioritizing offline data-URL first, then verified working URL).
 */
export const getCachedLogo = (clubKey: string): { dataUrl?: string; workingUrl?: string } => {
  return {
    dataUrl: dataUrlMap.get(clubKey),
    workingUrl: verifiedUrlMap.get(clubKey)
  };
};

/**
 * Checks if a specific URL has already finished loading in memory during this session.
 */
export const isUrlLoadedInMemory = (url: string): boolean => {
  return loadedMemoryUrls.has(url);
};

/**
 * Marks a URL as loaded in memory to prevent future opacity flashes or placeholder flickers.
 */
export const markUrlLoaded = (url: string): void => {
  if (url) {
    loadedMemoryUrls.add(url);
  }
};

let persistTimeout: any = null;
const persistVerifiedUrlsDebounced = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (persistTimeout) clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    try {
      const obj: Record<string, string> = {};
      verifiedUrlMap.forEach((v, k) => {
        obj[k] = v;
      });
      localStorage.setItem(VERIFIED_URLS_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn('Error saving verified logo URLs to localStorage:', e);
    }
  }, 1000);
};

/**
 * Saves a verified working URL for a club so future renders jump straight to this URL.
 */
export const setCachedWorkingUrl = (clubKey: string, url: string): void => {
  if (!clubKey || !url || clubKey === 'unknown') return;
  verifiedUrlMap.set(clubKey, url);
  markUrlLoaded(url);
  persistVerifiedUrlsDebounced();
};

/**
 * Keeps an offline Data URL in memory with LRU eviction for instantaneous session rendering.
 * Does not write bulky Base64 strings to localStorage to protect storage quota.
 */
export const setCachedDataUrl = (clubKey: string, dataUrl: string): void => {
  if (!clubKey || !dataUrl || clubKey === 'unknown') return;
  
  // Update in-memory map
  dataUrlMap.set(clubKey, dataUrl);
  markUrlLoaded(dataUrl);

  // Maintain LRU order
  const idx = lruOrder.indexOf(clubKey);
  if (idx !== -1) lruOrder.splice(idx, 1);
  lruOrder.push(clubKey);

  // Evict oldest if exceeding limit
  while (lruOrder.length > MAX_CACHED_DATA_URLS) {
    const oldest = lruOrder.shift();
    if (oldest) dataUrlMap.delete(oldest);
  }
};

// Track in-flight blob conversions to prevent duplicate simultaneous fetches
const inFlightBlobFetches = new Set<string>();

/**
 * Asynchronously fetches a remote logo URL, converts it to an offline Base64 data URL,
 * and saves it into localStorage.
 */
export const cacheLogoBlob = async (clubKey: string, url: string): Promise<string | null> => {
  if (typeof window === 'undefined' || !url || dataUrlMap.has(clubKey)) {
    return dataUrlMap.get(clubKey) || null;
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return null;
  }
  if (inFlightBlobFetches.has(clubKey)) {
    return null;
  }

  inFlightBlobFetches.add(clubKey);

  try {
    const resp = await fetch(url, { mode: 'cors' });
    if (!resp.ok) return null;
    const blob = await resp.blob();

    // Avoid caching huge assets (> 150KB)
    if (blob.size > 150 * 1024) return null;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (base64 && base64.startsWith('data:image/')) {
          setCachedDataUrl(clubKey, base64);
          resolve(base64);
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  } finally {
    inFlightBlobFetches.delete(clubKey);
  }
};

/**
 * Completely clears all persistent and in-memory logo caches (used when community mod is toggled off).
 */
export const clearLogoCache = (): void => {
  verifiedUrlMap.clear();
  dataUrlMap.clear();
  loadedMemoryUrls.clear();
  lruOrder.length = 0;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(VERIFIED_URLS_STORAGE_KEY);
      localStorage.removeItem(DATA_URLS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
};

/**
 * Preloads an image URL into browser cache and marks it as loaded in memory.
 */
export const preloadClubLogo = (url: string): Promise<void> => {
  if (!url || typeof window === 'undefined') return Promise.resolve();
  if (loadedMemoryUrls.has(url)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = url;
    img.onload = () => {
      markUrlLoaded(url);
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
  });
};

/**
 * Pre-warms a list of clubs' logos into memory to eliminate any scroll pop-in.
 */
export const prewarmClubsLogos = (clubs: { id?: number; name: string; logo?: string | string[]; fallbackLogo?: string }[]): void => {
  if (typeof window === 'undefined' || !Array.isArray(clubs)) return;
  clubs.slice(0, 80).forEach(c => {
    const key = getClubLogoKey(c.id, c.name);
    const cached = getCachedLogo(key);
    let targetUrl = cached.workingUrl || cached.dataUrl;
    if (!targetUrl && c.logo) {
      targetUrl = Array.isArray(c.logo) ? c.logo[0] : c.logo;
    }
    if (!targetUrl && c.fallbackLogo) {
      targetUrl = c.fallbackLogo;
    }
    if (targetUrl && typeof targetUrl === 'string') {
      preloadClubLogo(targetUrl);
    }
  });
};

/**
 * Asynchronously pre-warms a list of clubs with a guaranteed timeout so transitions and launches
 * resolve before unveiling the screen, ensuring zero layout popping or blank boxes.
 */
export const prewarmClubsLogosAsync = async (
  clubs: { id?: number; name?: string; logo?: string | string[]; fallbackLogo?: string }[],
  maxTimeoutMs = 320
): Promise<void> => {
  if (typeof window === 'undefined' || !Array.isArray(clubs) || clubs.length === 0) return;

  const urlsToPreload: string[] = [];
  clubs.slice(0, 80).forEach(c => {
    const key = getClubLogoKey(c.id, c.name);
    const cached = getCachedLogo(key);
    let targetUrl = cached.workingUrl || cached.dataUrl;
    if (!targetUrl && c.logo) {
      targetUrl = Array.isArray(c.logo) ? c.logo[0] : c.logo;
    }
    if (!targetUrl && c.fallbackLogo) {
      targetUrl = c.fallbackLogo;
    }
    if (targetUrl && typeof targetUrl === 'string' && !loadedMemoryUrls.has(targetUrl)) {
      urlsToPreload.push(targetUrl);
    }
  });

  if (urlsToPreload.length === 0) return;

  const preloadPromise = Promise.all(urlsToPreload.map(preloadClubLogo));
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, maxTimeoutMs));

  await Promise.race([preloadPromise, timeoutPromise]);
};
