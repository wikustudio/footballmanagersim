import { GameState, Club, UniverseMovement } from '../types';

/**
 * Resilient localStorage manager to guarantee the app operates safely within
 * browser storage limits (~5 MB) and prevents QuotaExceededError.
 */

const BULKY_LEGACY_KEYS = [
  'fms_logo_data_cache_v1',
  'fms_logo_data_cache',
  'fms_cached_svgs_v1',
  'footy_manager_sim_state_v1',
  'footy_manager_sim_state_v2'
];

const AUXILIARY_DB_KEYS = [
  'custom_db',
  'fms_custom_mod_json',
  'fms_clubs_db',
  'fms_dynamic_universe_clubs',
  'fms_dynamic_universe_v1'
];

/**
 * Proactively purges legacy binary and base64 caches from localStorage.
 */
export function cleanupNonEssentialLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    for (const key of BULKY_LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('[StorageManager] Error cleaning non-essential keys:', e);
  }
}

/**
 * Strips heavy redundant fields from GameState prior to JSON serialization.
 * - Dynamic universe movements do not need embedded club logos (resolved dynamically from clubsDb).
 * - History and trophy records are capped to recent career milestones.
 */
export function compactGameState(state: GameState, aggressive: boolean = false): GameState {
  if (!state) return state;

  const maxMovements = aggressive ? 25 : 65;
  const maxTrophies = aggressive ? 25 : 50;
  const maxHistories = aggressive ? 5 : 10;

  // 1. Sanitize Universe Movements (prioritizing high-value cup champions & titles across seasons)
  let universeMovements: UniverseMovement[] | undefined = undefined;
  if (Array.isArray(state.universeMovements)) {
    const sorted = [...state.universeMovements].sort((a, b) => {
      const getPrio = (m: UniverseMovement) => {
        if (m.type === 'cup_champion') return 0;
        if (m.isUserClub || m.isPastManagerClub) return 1;
        if (m.type === 'title_won' || m.type === 'insolvency_drop') return 2;
        if (m.fromTier === 1 || m.toTier === 1) return 3;
        return 4;
      };
      const diff = getPrio(a) - getPrio(b);
      if (diff !== 0) return diff;
      return b.year - a.year;
    });

    universeMovements = sorted.slice(0, maxMovements).map(m => ({
      id: m.id,
      year: m.year,
      clubId: m.clubId,
      clubName: m.clubName,
      clubColor: m.clubColor,
      country: m.country,
      fromTier: m.fromTier,
      toTier: m.toTier,
      fromLeagueName: m.fromLeagueName,
      toLeagueName: m.toLeagueName,
      type: m.type,
      pos: m.pos,
      reason: m.reason ? m.reason.slice(0, 100) : undefined,
      isUserClub: m.isUserClub,
      isPastManagerClub: m.isPastManagerClub,
    })).sort((a, b) => b.year - a.year);
  }

  // 2. Sanitize Trophy History
  let trophyHistory = state.trophyHistory;
  if (Array.isArray(trophyHistory)) {
    trophyHistory = trophyHistory.slice(0, maxTrophies).map(t => ({
      year: t.year,
      clubName: t.clubName,
      name: t.name,
      color: t.color
      // Omit embedded logo strings
    }));
  }

  // 3. Sanitize Club League Histories (prune old AI club records while preserving full 35-50 season tenure for current club)
  let clubLeagueHistories = state.clubLeagueHistories;
  if (clubLeagueHistories && typeof clubLeagueHistories === 'object') {
    const keys = Object.keys(clubLeagueHistories);
    const currentClubKey = state.club ? String(state.club.id || state.club.name) : '';
    const sanitizedHistories: typeof clubLeagueHistories = {};
    const keepKeySet = new Set(keys.slice(-maxHistories));
    if (currentClubKey && clubLeagueHistories[currentClubKey]) {
      keepKeySet.add(currentClubKey);
    }
    const maxRecordsPerClub = aggressive ? 35 : 50;
    for (const k of keepKeySet) {
      const records = clubLeagueHistories[k];
      if (Array.isArray(records)) {
        sanitizedHistories[k] = records.slice(-maxRecordsPerClub);
      }
    }
    clubLeagueHistories = sanitizedHistories;
  }

  // 4. Sanitize World Cup Campaigns & Auxiliary Endless-Mode Logs
  let worldCupCampaigns = state.worldCupCampaigns;
  if (Array.isArray(worldCupCampaigns)) {
    worldCupCampaigns = worldCupCampaigns.slice(-12);
  }
  const ovrHistory = Array.isArray(state.ovrHistory) ? state.ovrHistory.slice(-50) : state.ovrHistory;
  const stockHistory = Array.isArray(state.stockHistory) ? state.stockHistory.slice(-50) : state.stockHistory;
  const academySpendHistory = Array.isArray(state.academySpendHistory) ? state.academySpendHistory.slice(-35) : state.academySpendHistory;
  const cupRunResults = Array.isArray(state.cupRunResults) ? state.cupRunResults.slice(-30) : state.cupRunResults;

  // 5. Sanitize Season Standings Archive (keep only last 1-3 seasons and strip embedded logo strings to prevent 5MB localStorage overflow)
  let seasonStandingsArchive = state.seasonStandingsArchive;
  if (seasonStandingsArchive && typeof seasonStandingsArchive === 'object') {
    const keepYears = aggressive ? 1 : 3;
    const yearKeys = Object.keys(seasonStandingsArchive)
      .map(Number)
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    const allowedYears = new Set(yearKeys.slice(-keepYears));
    const prunedArchive: Record<number, Record<number, any[]>> = {};
    for (const y of allowedYears) {
      const tiersObj = seasonStandingsArchive[y];
      if (tiersObj && typeof tiersObj === 'object') {
        const cleanTiers: Record<number, any[]> = {};
        for (const [tKey, rows] of Object.entries(tiersObj)) {
          if (Array.isArray(rows)) {
            cleanTiers[Number(tKey)] = rows.map(r => {
              if (!r || typeof r !== 'object') return r;
              const { logo, fallbackLogo, form, ...rest } = r as any;
              return rest;
            });
          }
        }
        prunedArchive[y] = cleanTiers;
      }
    }
    seasonStandingsArchive = prunedArchive;
  }

  // 6. Sanitize Core History (Strip massive base64 image strings and cap endless mode at 50 seasons)
  let history = state.history;
  if (Array.isArray(history)) {
    history = history.slice(-50).map(h => ({
      ...h,
      logo: (typeof h.logo === 'string' && (h.logo.startsWith('data:') || h.logo.startsWith('blob:'))) ? undefined : h.logo,
      fallbackLogo: (typeof h.fallbackLogo === 'string' && (h.fallbackLogo.startsWith('data:') || h.fallbackLogo.startsWith('blob:'))) ? undefined : h.fallbackLogo
    }));
  }

  // 7. Sanitize user club object if it carries oversized base64 crests in aggressive mode
  let cleanClub = state.club;
  if (cleanClub && typeof cleanClub === 'object') {
    const hasHugeLogo = typeof cleanClub.logo === 'string' && cleanClub.logo.startsWith('data:') && cleanClub.logo.length > (aggressive ? 16384 : 65536);
    if (hasHugeLogo || aggressive) {
      cleanClub = {
        ...cleanClub,
        ...(hasHugeLogo ? { logo: undefined } : {}),
        ...(aggressive ? { narrative: undefined, historicContext: undefined } : {})
      };
    }
  }

  return {
    ...state,
    club: cleanClub,
    history,
    universeMovements,
    trophyHistory,
    clubLeagueHistories,
    managedClubFacilities: state.managedClubFacilities,
    worldCupCampaigns,
    ovrHistory,
    stockHistory,
    academySpendHistory,
    cupRunResults,
    seasonStandingsArchive,
  };
}

/**
 * Compacts the clubsDb array for storage by stripping massive static text fields
 * (like historicContext and narratives) that are already permanently packaged in teams.ts.
 */
export function compactClubsDb(clubs: Club[]): Partial<Club>[] {
  if (!Array.isArray(clubs)) return [];
  return clubs.map(c => {
    // Preserve custom data:image crests under 64KB so custom club crests are never erased in localStorage,
    // while massive multi-megabyte raw uploads are offloaded to IndexedDB in safeSaveClubsDb
    const isCustomData = typeof c.logo === 'string' && c.logo.startsWith('data:');
    const keepLogo = isCustomData ? (c.logo!.length < 65536 ? c.logo : undefined) : c.logo;

    return {
      id: c.id,
      name: c.name,
      tier: c.tier,
      baseOvr: c.baseOvr,
      color: c.color,
      stadium: c.stadium,
      academyLevel: c.academyLevel,
      medicalLevel: c.medicalLevel,
      country: c.country,
      isInsolventGiant: c.isInsolventGiant,
      insolvencyCount: c.insolvencyCount,
      isReserve: c.isReserve,
      fanBase: c.fanBase,
      rep: c.rep,
      logo: keepLogo,
      fallbackLogo: c.fallbackLogo
    };
  });
}

/**
 * Delta-compresses clubsDb for multi-slot career saves (fms_career_saves_v1) and dynamic universe storage
 * by storing only mutable career fields (id, tier, baseOvr, currentBudget, stadium, fanBase, rep,
 * academyLevel, medicalLevel, isInsolventGiant, isReserve, and custom data:image/ logos).
 */
export function dehydrateClubsDbDelta(clubs: Club[]): Array<Partial<Club> & { id: number }> {
  if (!Array.isArray(clubs)) return [];
  return clubs.map((c) => {
    const isCustomData = typeof c.logo === 'string' && c.logo.startsWith('data:image/');
    const keepLogo = isCustomData && c.logo!.length < 65536 ? c.logo : undefined;

    const delta: Partial<Club> & { id: number } = {
      id: c.id,
      tier: c.tier,
      baseOvr: c.baseOvr,
      currentBudget: c.currentBudget,
      stadium: c.stadium,
      fanBase: c.fanBase,
      rep: c.rep,
      academyLevel: c.academyLevel,
      medicalLevel: c.medicalLevel,
      ...(c.isInsolventGiant ? { isInsolventGiant: true } : {}),
      ...(c.isReserve ? { isReserve: true } : {}),
      ...(keepLogo ? { logo: keepLogo } : {}),
    };
    return delta;
  });
}

/**
 * Rehydrates delta-compressed club records (or legacy full club saves) against baseClubs
 * so both old full saves and new delta saves load seamlessly without hitting the 5MB localStorage limit.
 */
export function rehydrateClubsDbDelta(
  deltas: Array<Partial<Club> & { id: number }> | Club[],
  baseClubs: Club[]
): Club[] {
  if (!Array.isArray(deltas) || deltas.length === 0) {
    return Array.isArray(baseClubs) ? [...baseClubs] : [];
  }
  const baseById = new Map<number, Club>();
  if (Array.isArray(baseClubs)) {
    for (const b of baseClubs) {
      if (b && b.id != null) {
        baseById.set(b.id, b);
      }
    }
  }

  const seenIds = new Set<number>();
  const rehydrated: Club[] = deltas.map((d) => {
    const base = d && d.id != null ? baseById.get(d.id) : undefined;
    if (d && d.id != null) seenIds.add(d.id);

    if (base) {
      const isCustomDataLogo = typeof d.logo === 'string' && d.logo.startsWith('data:image/');
      return {
        ...base,
        ...d,
        name: d.name || base.name,
        color: d.color || base.color,
        country: d.country || base.country,
        logo: isCustomDataLogo ? d.logo : (d.logo || base.logo),
        fallbackLogo: d.fallbackLogo || base.fallbackLogo,
        narrative: d.narrative || base.narrative,
        historicContext: d.historicContext || base.historicContext,
      };
    }

    return {
      id: d.id ?? 0,
      name: d.name || `Club #${d.id ?? 0}`,
      tier: d.tier ?? 1,
      baseOvr: d.baseOvr ?? 65,
      color: d.color || '1d4ed8',
      stadium: d.stadium ?? 15000,
      country: d.country || 'GER',
      rep: d.rep ?? d.baseOvr ?? 65,
      fanBase: d.fanBase ?? 25000,
      currentBudget: d.currentBudget,
      academyLevel: d.academyLevel,
      medicalLevel: d.medicalLevel,
      isInsolventGiant: d.isInsolventGiant,
      isReserve: d.isReserve,
      logo: d.logo,
      fallbackLogo: d.fallbackLogo,
    };
  });

  // Preserve any baseClubs that were not present in the delta array
  if (Array.isArray(baseClubs)) {
    for (const b of baseClubs) {
      if (b && b.id != null && !seenIds.has(b.id)) {
        rehydrated.push({ ...b });
      }
    }
  }

  return rehydrated;
}

export const CAREER_SAVES_STORAGE_KEY = 'fms_career_saves_v1';

export function saveCareerSlotToStorage(
  slotId: string,
  state: GameState,
  clubs: Club[]
): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const raw = localStorage.getItem(CAREER_SAVES_STORAGE_KEY);
    const savesObj: Record<string, any> = raw ? JSON.parse(raw) : {};
    savesObj[slotId] = {
      updatedAt: new Date().toISOString(),
      gameState: compactGameState(state, false),
      clubsDelta: dehydrateClubsDbDelta(clubs),
    };
    localStorage.setItem(CAREER_SAVES_STORAGE_KEY, JSON.stringify(savesObj));
    return true;
  } catch (e) {
    console.warn('[StorageManager] Failed to save multi-slot career with delta compression:', e);
    return false;
  }
}

export function loadCareerSlotFromStorage(
  slotId: string,
  baseClubs: Club[]
): { gameState: GameState; clubs: Club[] } | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(CAREER_SAVES_STORAGE_KEY);
    if (!raw) return null;
    const savesObj = JSON.parse(raw);
    const slot = savesObj?.[slotId];
    if (!slot || !slot.gameState) return null;
    const rawClubs = slot.clubsDelta || slot.clubsDb || slot.clubs || [];
    return {
      gameState: slot.gameState,
      clubs: rehydrateClubsDbDelta(rawClubs, baseClubs),
    };
  } catch (e) {
    console.warn('[StorageManager] Failed to load career slot:', e);
    return null;
  }
}

/**
 * Orders saves of one career by how far along they are: each season has a 'start' and a 'mid' (winter) step.
 */
function getSaveProgress(state: any): number {
  const year = typeof state?.year === 'number' ? state.year : 0;
  return year * 2 + (state?.seasonPhase === 'mid' ? 1 : 0);
}

/**
 * True when `candidate` (e.g. the IndexedDB backup) is a later save of the same career than `current`
 * (e.g. the localStorage save, which can fall behind when the browser quota is full or a reload interrupts it).
 */
export function isNewerSaveOfSameCareer(candidate: any, current: any): boolean {
  if (!candidate || typeof candidate !== 'object' || !candidate.club) return false;
  if (!current || typeof current !== 'object' || !current.club) return false;
  if (candidate.managerName !== current.managerName || candidate.startYear !== current.startYear) return false;
  if (current.isCareerOver && !candidate.isCareerOver) return false;
  const diff = getSaveProgress(candidate) - getSaveProgress(current);
  if (diff !== 0) return diff > 0;
  return (candidate.history?.length || 0) > (current.history?.length || 0);
}

/**
 * Safely persists GameState to localStorage with multi-tier compression and fallback.
 */
export function safeSaveGameState(storageKey: string, state: GameState): boolean {
  if (typeof window === 'undefined' || !window.localStorage || !state) return false;

  // Back up full state asynchronously to IndexedDB as an unlimited-quota safety net
  saveToIndexedDB(storageKey, state).catch(() => {});

  // Level 1: Standard compact save
  try {
    const payload = JSON.stringify(compactGameState(state, false));
    localStorage.setItem(storageKey, payload);
    return true;
  } catch (primaryErr: any) {
    // Level 2: Purge non-essential caches & run aggressive compaction
    try {
      cleanupNonEssentialLocalStorage();
      const aggressivePayload = JSON.stringify(compactGameState(state, true));
      localStorage.setItem(storageKey, aggressivePayload);
      return true;
    } catch (secondaryErr: any) {
      // Level 3: Evict bulky club database mirrors from localStorage (already backed up in IndexedDB)
      try {
        for (const auxKey of AUXILIARY_DB_KEYS) {
          if (auxKey !== storageKey) {
            localStorage.removeItem(auxKey);
          }
        }
        const emergencyPayload = JSON.stringify(compactGameState(state, true));
        localStorage.setItem(storageKey, emergencyPayload);
        return true;
      } catch (tertiaryErr) {
        // Level 4: Ultra-compact fallback (strip archive & redundant livingTiers keys so core career save never fails)
        try {
          const baseCompact = compactGameState(state, true);
          const currentClubKey = baseCompact.club ? String(baseCompact.club.id || baseCompact.club.name) : '';
          const ultraCompact: GameState = {
            ...baseCompact,
            seasonStandingsArchive: {},
            universeMovements: (baseCompact.universeMovements || []).slice(0, 10),
            clubLeagueHistories: baseCompact.clubLeagueHistories && currentClubKey && baseCompact.clubLeagueHistories[currentClubKey]
              ? { [currentClubKey]: baseCompact.clubLeagueHistories[currentClubKey] }
              : {},
            worldCupCampaigns: Array.isArray(baseCompact.worldCupCampaigns) ? baseCompact.worldCupCampaigns.slice(-3) : baseCompact.worldCupCampaigns,
            ovrHistory: Array.isArray(baseCompact.ovrHistory) ? baseCompact.ovrHistory.slice(-15) : baseCompact.ovrHistory,
            stockHistory: Array.isArray(baseCompact.stockHistory) ? baseCompact.stockHistory.slice(-15) : baseCompact.stockHistory,
            cupRunResults: Array.isArray(baseCompact.cupRunResults) ? baseCompact.cupRunResults.slice(-10) : baseCompact.cupRunResults,
            pendingSeasonState: null,
          };
          localStorage.setItem(storageKey, JSON.stringify(ultraCompact));
          return true;
        } catch (finalErr) {
          console.warn('[StorageManager] LocalStorage quota full; state persisted to IndexedDB fallback.', finalErr);
          return false;
        }
      }
    }
  }
}

/**
 * Safely persists clubsDb with compact dynamic data and error boundary.
 */
export function safeSaveClubsDb(storageKey: string, clubs: Club[]): boolean {
  if (typeof window === 'undefined' || !clubs) return false;

  // Always persist full clubsDb to IndexedDB so unlimited-quota storage stays 100% up to date
  saveToIndexedDB(storageKey, clubs).catch(() => {});

  // Persist custom base64 logos into IndexedDB to prevent localStorage quota exhaustion while never losing user crests
  try {
    const customLogos: Record<string, string> = {};
    let hasCustomLogos = false;
    for (const c of clubs) {
      if (typeof c.logo === 'string' && (c.logo.startsWith('data:image/') || c.logo.startsWith('blob:'))) {
        customLogos[String(c.id)] = c.logo;
        hasCustomLogos = true;
      }
    }
    if (hasCustomLogos) {
      saveToIndexedDB('fms_custom_logos', customLogos);
    }
  } catch (idbErr) {
    console.warn('[StorageManager] Could not save custom logos to IndexedDB:', idbErr);
  }

  if (!window.localStorage) return false;

  try {
    // Avoid keeping two duplicate copies of the club database in localStorage simultaneously
    if (storageKey === 'fms_clubs_db' && localStorage.getItem('fms_dynamic_universe_clubs')) {
      localStorage.removeItem('fms_clubs_db');
      return true;
    }
    const compact = storageKey === 'fms_career_saves_v1' ? dehydrateClubsDbDelta(clubs) : compactClubsDb(clubs);
    localStorage.setItem(storageKey, JSON.stringify(compact));
    return true;
  } catch (err) {
    try {
      const minimal = dehydrateClubsDbDelta(clubs);
      localStorage.setItem(storageKey, JSON.stringify(minimal));
      return true;
    } catch {
      localStorage.removeItem(storageKey);
      return false;
    }
  }
}

// A single shared connection keeps back-to-back writes in call order, so the newest save always lands last.
let cachedDbPromise: Promise<IDBDatabase> | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  if (cachedDbPromise) return cachedDbPromise;
  cachedDbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not available'));
    }
    const request = indexedDB.open('fms_database', 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('mods')) {
        db.createObjectStore('mods');
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onclose = () => { cachedDbPromise = null; };
      db.onversionchange = () => { db.close(); cachedDbPromise = null; };
      resolve(db);
    };
    request.onerror = () => reject(request.error);
  });
  cachedDbPromise.catch(() => { cachedDbPromise = null; });
  return cachedDbPromise;
};

export const saveToIndexedDB = async (key: string, data: any): Promise<void> => {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mods', 'readwrite');
      const store = tx.objectStore('mods');
      store.put(data, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('[StorageManager] saveToIndexedDB failed:', e);
  }
};

export const loadFromIndexedDB = async (key: string): Promise<any> => {
  if (typeof indexedDB === 'undefined') return null;
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mods', 'readonly');
      const store = tx.objectStore('mods');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('[StorageManager] loadFromIndexedDB failed:', e);
    return null;
  }
};

export const removeFromIndexedDB = async (key: string): Promise<void> => {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mods', 'readwrite');
      const store = tx.objectStore('mods');
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('[StorageManager] removeFromIndexedDB failed:', e);
  }
};
