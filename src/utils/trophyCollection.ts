import { SeasonHistory, SupercupResult } from '../types';

export interface TrophyCollectionCounts {
  /** Strictly Tier 1 top-flight domestic league championships (`bl`). */
  topLeague: number;
  /** Strictly Tier 2+ lower-division league titles (`lower`). */
  lowerLeague: number;
  /** Major national domestic cups (`dfb` + `efl`). */
  nationalCup: number;
  /** Lower-tier regional cups (`reg`). */
  regionalCup: number;
  /** Domestic / continental supercups won. */
  supercup: number;
  cl: number;
  el: number;
  ecl: number;
  cwc: number;
  wc: number;
  domesticTotal: number;
  internationalTotal: number;
  total: number;
}

/**
 * Computes career trophy collection counts with strict separation between
 * top-flight league titles (`bl`) vs lower-division titles (`lower`), and
 * national cups (`dfb`/`efl`) vs regional cups (`reg`).
 */
export const computeTrophyCollection = (
  history?: SeasonHistory[],
  supercupHistory?: SupercupResult[]
): TrophyCollectionCounts => {
  const counts: TrophyCollectionCounts = {
    topLeague: 0,
    lowerLeague: 0,
    nationalCup: 0,
    regionalCup: 0,
    supercup: (supercupHistory || []).filter((s) => s && s.won).length,
    cl: 0,
    el: 0,
    ecl: 0,
    cwc: 0,
    wc: 0,
    domesticTotal: 0,
    internationalTotal: 0,
    total: 0,
  };

  (history || []).forEach((h) => {
    const t = h?.trophiesThisYear;
    if (!t) return;
    counts.topLeague += Number(t.bl) || 0;
    counts.lowerLeague += Number(t.lower) || 0;
    counts.nationalCup += (Number(t.dfb) || 0) + (Number(t.efl) || 0);
    counts.regionalCup += Number(t.reg) || 0;
    counts.cl += Number(t.cl) || 0;
    counts.el += Number(t.el) || 0;
    counts.ecl += Number(t.ecl) || 0;
    counts.cwc += Number(t.cwc) || 0;
    counts.wc += Number(t.wc) || 0;
  });

  counts.domesticTotal =
    counts.topLeague +
    counts.lowerLeague +
    counts.nationalCup +
    counts.regionalCup +
    counts.supercup;

  counts.internationalTotal =
    counts.cl + counts.el + counts.ecl + counts.cwc + counts.wc;

  counts.total = counts.domesticTotal + counts.internationalTotal;

  return counts;
};

export type TrophyHistoryBucket =
  | 'cl'
  | 'cwc'
  | 'wc'
  | 'el'
  | 'ecl'
  | 'bl'
  | 'lower'
  | 'dfb'
  | 'efl'
  | 'reg'
  | 'supercup';

/**
 * Classifies a legacy `trophyHistory` entry name into a canonical trophy bucket
 * without misattributing lower-division, continental, supercup, or regional honours.
 */
export const classifyTrophyHistoryName = (
  rawName?: string
): TrophyHistoryBucket | null => {
  const norm = (rawName || '').toLowerCase().trim();
  if (!norm) return null;

  // 1. Supercups (must precede domestic cup / copa / trophée / shield checks)
  if (
    norm.includes('supercup') ||
    norm.includes('super cup') && !norm.includes('indian super cup') ||
    norm.includes('supercopa') ||
    norm.includes('supercoppa') ||
    norm.includes('community shield') ||
    norm.includes('charity shield') ||
    norm.includes('trophée des champions') ||
    norm.includes('trophee des champions') ||
    norm.includes('supertaça') ||
    norm.includes('supertaca') ||
    norm.includes('johan cruyff') ||
    norm.includes('süper kupa') ||
    norm.includes('super kupa')
  ) {
    return 'supercup';
  }

  // 2. Top-tier Continental Champions competitions (must precede generic 'cup')
  if (
    norm.includes('elite') ||
    norm.includes('champions league') ||
    norm.includes('champions cup') ||
    norm.includes('libertadores') ||
    norm.includes('concacaf') ||
    norm === 'cl'
  ) {
    return 'cl';
  }

  // 3. Global Club Cup vs FIFA World Cup
  if (norm.includes('global club') || norm.includes('club world') || norm === 'cwc') {
    return 'cwc';
  }
  if (norm.includes('world cup') || norm === 'wc') {
    return 'wc';
  }

  // 4. Secondary & tertiary continental cups
  if (
    norm.includes('europa') ||
    norm.includes('sudamericana') ||
    norm.includes('euro cup') ||
    norm.includes('asian cup') ||
    norm.includes('leagues challenge') ||
    norm.includes('leagues cup') ||
    norm.includes('afc cup')
  ) {
    return 'el';
  }
  if (norm.includes('challenge') || norm.includes('conference') || norm.includes('recopa')) {
    return 'ecl';
  }

  // 5. League Cup (EFL / Carabao)
  if (norm.includes('league cup') || norm.includes('efl cup') || norm.includes('carabao')) {
    return 'efl';
  }

  // 6. Regional / lower-tier knockout cups (must precede lower league & generic cup checks)
  if (
    norm.includes('regional cup') ||
    norm.includes('regionalpokal') ||
    norm.includes('landespokal') ||
    norm.includes('fa trophy') ||
    norm.includes('efl trophy') ||
    norm.includes('copa rfef') ||
    norm.includes('taça distrital') ||
    norm.includes('taca distrital') ||
    norm.includes('coupe de ligue') ||
    norm.includes('reg cup')
  ) {
    return 'reg';
  }

  // 7. Lower-division league titles (Tier 2+)
  if (
    norm.includes('lower') ||
    norm.includes('regional premier') ||
    norm.includes('national north') ||
    norm.includes('national premier') ||
    norm.includes('national league') ||
    norm.includes('championship') ||
    norm.includes('league one') ||
    norm.includes('league two') ||
    norm.includes('regionalliga') ||
    norm.includes('oberliga') ||
    norm.includes('verbandsliga') ||
    norm.includes('landesliga') ||
    norm.includes('bezirksliga') ||
    norm.includes('kreisliga') ||
    norm.includes('2. bundesliga') ||
    norm.includes('3. liga') ||
    norm.includes('ligue 2') ||
    norm.includes('serie b') ||
    norm.includes('segunda') ||
    norm.includes('hypermotion') ||
    norm.includes('federación') ||
    norm.includes('federacion') ||
    norm.includes('j2 league') ||
    norm.includes('1. lig') ||
    norm.includes('2. lig') ||
    /\b(division|league|tier)\s*[2-9]\b/.test(norm)
  ) {
    return 'lower';
  }

  // 8. Top-flight domestic league titles (Tier 1)
  if (
    norm.includes('top league') ||
    norm.includes('premier div') ||
    norm.includes('premier league') ||
    norm.includes('1. bundesliga') ||
    norm.includes('la liga') ||
    norm.includes('serie a') ||
    norm.includes('ligue 1') ||
    norm.includes('primeira liga') ||
    norm.includes('major league soccer') ||
    norm.includes('scottish premiership') ||
    norm.includes('ekstraklasa') ||
    norm.includes('süper lig') ||
    norm.includes('j1 league') ||
    norm.includes('meister')
  ) {
    return 'bl';
  }

  // 9. Primary national domestic cups
  if (
    norm.includes('cup') ||
    norm.includes('pokal') ||
    norm.includes('copa') ||
    norm.includes('coupe') ||
    norm.includes('taça') ||
    norm.includes('taca') ||
    norm.includes('coppa') ||
    norm.includes('kupası') ||
    norm.includes('kup') ||
    norm.includes('kypello') ||
    norm.includes('piala')
  ) {
    return 'dfb';
  }

  return null;
};
