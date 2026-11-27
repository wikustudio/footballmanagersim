import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { computeTrophyCollection, classifyTrophyHistoryName } from './trophyCollection';
import { resolveSeasonSnapshotView } from './seasonSnapshotHelper';
import { COUNTRIES, getDomesticCupInfo, getFAInfo } from '../data/gameConstants';
import { GameState, SeasonHistory } from '../types';

describe('Trophy Collection, Naming & Logic Integrity Audit', () => {
  it('winning Tier 7 English football counts as lowerLeague=1 and NEVER as topLeague (Premier League)', () => {
    const history = [
      {
        year: 2026,
        clubId: 777,
        clubName: 'FC United of Manchester',
        country: 'ENG',
        tier: 7,
        leagueTag: 'REG PREM',
        pos: 1,
        ovr: 49,
        wins: 27,
        draws: 6,
        losses: 1,
        pts: 86,
        status: 'C',
        trophiesThisYear: { lower: 1 },
      },
    ] as unknown as SeasonHistory[];

    const counts = computeTrophyCollection(history, []);
    expect(counts.topLeague).toBe(0);
    expect(counts.lowerLeague).toBe(1);
    expect(counts.nationalCup).toBe(0);
    expect(counts.regionalCup).toBe(0);
    expect(counts.domesticTotal).toBe(1);
    expect(counts.internationalTotal).toBe(0);
    expect(counts.total).toBe(1);
  });

  it('winning Regional Cup counts as regionalCup=1 and NEVER as nationalCup (FA Cup / DFB-Pokal)', () => {
    const history = [
      {
        year: 2026,
        clubId: 777,
        clubName: 'FC United of Manchester',
        country: 'ENG',
        tier: 7,
        leagueTag: 'REG PREM',
        pos: 1,
        ovr: 49,
        trophiesThisYear: { lower: 1, reg: 1 },
      },
    ] as unknown as SeasonHistory[];

    const counts = computeTrophyCollection(history, []);
    expect(counts.topLeague).toBe(0);
    expect(counts.lowerLeague).toBe(1);
    expect(counts.nationalCup).toBe(0);
    expect(counts.regionalCup).toBe(1);
    expect(counts.domesticTotal).toBe(2);
  });

  it('Tier 1 domestic double + lower-tier RTG career history stay strictly separated', () => {
    const history = [
      { year: 2026, clubName: 'FC United of Manchester', country: 'ENG', tier: 7, pos: 1, trophiesThisYear: { lower: 1, reg: 1 } },
      { year: 2027, clubName: 'FC United of Manchester', country: 'ENG', tier: 6, pos: 1, trophiesThisYear: { lower: 1 } },
      { year: 2033, clubName: 'FC United of Manchester', country: 'ENG', tier: 1, pos: 1, trophiesThisYear: { bl: 1, dfb: 1, efl: 1, cl: 1 } },
    ] as unknown as SeasonHistory[];

    const counts = computeTrophyCollection(history, [{ year: 2033, won: true } as any]);
    expect(counts.topLeague).toBe(1);
    expect(counts.lowerLeague).toBe(2);
    expect(counts.nationalCup).toBe(2);
    expect(counts.regionalCup).toBe(1);
    expect(counts.supercup).toBe(1);
    expect(counts.cl).toBe(1);
    expect(counts.domesticTotal).toBe(7);
    expect(counts.internationalTotal).toBe(1);
    expect(counts.total).toBe(8);
  });

  it('classifyTrophyHistoryName accurately separates continental, world, supercup, league cup, lower-tier, regional, and top-flight honours', () => {
    // Continental & Global
    expect(classifyTrophyHistoryName('Euro Champions Cup')).toBe('cl');
    expect(classifyTrophyHistoryName('Asian Champions Cup')).toBe('cl');
    expect(classifyTrophyHistoryName('North American Champions Cup')).toBe('cl');
    expect(classifyTrophyHistoryName('Copa Libertadores')).toBe('cl');
    expect(classifyTrophyHistoryName('Global Club Cup')).toBe('cwc');
    expect(classifyTrophyHistoryName('Club World Cup')).toBe('cwc');
    expect(classifyTrophyHistoryName('World Cup')).toBe('wc');
    expect(classifyTrophyHistoryName('Euro Cup')).toBe('el');
    expect(classifyTrophyHistoryName('Asian Cup')).toBe('el');
    expect(classifyTrophyHistoryName('Euro Challenge Cup')).toBe('ecl');

    // Supercups & League Cup
    expect(classifyTrophyHistoryName('DFL-Supercup')).toBe('supercup');
    expect(classifyTrophyHistoryName('FA Community Shield')).toBe('supercup');
    expect(classifyTrophyHistoryName('Supercopa de España')).toBe('supercup');
    expect(classifyTrophyHistoryName('Trophée des Champions')).toBe('supercup');
    expect(classifyTrophyHistoryName('League Cup')).toBe('efl');
    expect(classifyTrophyHistoryName('EFL Cup')).toBe('efl');

    // Lower-division vs Top-flight vs Regional vs National Cup
    expect(classifyTrophyHistoryName('Lower League Title')).toBe('lower');
    expect(classifyTrophyHistoryName('Regional Premier Title')).toBe('lower');
    expect(classifyTrophyHistoryName('National North/South Title')).toBe('lower');
    expect(classifyTrophyHistoryName('National Premier Title')).toBe('lower');
    expect(classifyTrophyHistoryName('Verbandsliga Title')).toBe('lower');
    expect(classifyTrophyHistoryName('Ligue 2 Title')).toBe('lower');
    expect(classifyTrophyHistoryName('Regional Cup')).toBe('reg');
    expect(classifyTrophyHistoryName('Landespokal')).toBe('reg');
    expect(classifyTrophyHistoryName('FA Trophy')).toBe('reg');
    expect(classifyTrophyHistoryName('Top League')).toBe('bl');
    expect(classifyTrophyHistoryName('English Premier Div')).toBe('bl');
    expect(classifyTrophyHistoryName('FA Cup')).toBe('dfb');
    expect(classifyTrophyHistoryName('DFB-Pokal')).toBe('dfb');
    expect(classifyTrophyHistoryName('Indian Super Cup')).toBe('dfb');
  });

  it('Season snapshot subtitle references last year division rather than newly promoted division', () => {
    const state = {
      year: 2027,
      club: {
        id: 777,
        name: 'FC United of Manchester',
        country: 'ENG',
        tier: 6,
        color: '#DC2626',
      },
      history: [
        {
          year: 2026,
          clubId: 777,
          clubName: 'FC United of Manchester',
          country: 'ENG',
          tier: 7,
          leagueTag: 'REG PREM',
          pos: 1,
          wins: 27,
          draws: 6,
          losses: 1,
          last5: ['D', 'W', 'W', 'W', 'W'],
          trophiesThisYear: { lower: 1 },
        },
      ],
    } as unknown as GameState;

    const snap = resolveSeasonSnapshotView({
      state,
      selectedHistoryIndex: null,
      playedMatchdays: 0,
      activeSchedule: [],
      totalMds: 34,
    });
    expect(snap.subtitle).toMatch(/Last yr #1 · Regional Premier/i);
    expect(snap.subtitle).not.toMatch(/National North\/South/i);
  });

  it('getFAInfo returns country-specific federations and final venues for ALL 34 countries (never leaking DFB to non-GER nations)', () => {
    for (const code of Object.keys(COUNTRIES)) {
      const fa = getFAInfo(code);
      if (code === 'GER') {
        expect(fa.name).toBe('DFB');
      } else {
        expect(fa.name, `${code} must not fall back to German DFB`).not.toBe('DFB');
        expect(fa.cup, `${code} must not fall back to DFB-Pokal`).not.toBe('DFB-Pokal');
        expect(fa.stadiumFinal, `${code} must not fall back to Olympiastadion, Berlin`).not.toBe('Olympiastadion, Berlin');
      }
    }
  });

  it('getDomesticCupInfo normalizes country names and returns exact national cup for every country', () => {
    expect(getDomesticCupInfo('England', 1).name).toBe('FA Cup');
    expect(getDomesticCupInfo('Scotland', 1).name).toBe('Scottish Cup');
    expect(getDomesticCupInfo('Poland', 1).name).toBe('Polish Cup');
    expect(getDomesticCupInfo('Brazil', 1).name).toBe('Copa do Brasil');
    expect(getDomesticCupInfo('Argentina', 1).name).toBe('Copa Argentina');
    expect(getDomesticCupInfo('Japan', 1).name).toBe("Emperor's Cup");
    expect(getDomesticCupInfo('USA', 1, 'Toronto FC').name).toBe('Voyageurs Cup');
    expect(getDomesticCupInfo('GER', 4).name).toBe('Regional Cup');
  });

  it('guards against double-counted EFL rep, duplicate giant-killer movements, missing lower-div domTrophies, and CareerSummary/SeasonFinishModal parity regressions', () => {
    const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
    const careerSrc = fs.readFileSync('src/components/CareerSummary.tsx', 'utf-8');
    const finishSrc = fs.readFileSync('src/components/SeasonFinishModal.tsx', 'utf-8');
    const trophyModalSrc = fs.readFileSync('src/components/TrophyModal.tsx', 'utf-8');

    // 1. EFL win does not double-count repBonus alongside repDelta
    expect(appSrc).toContain("else if (cup.id === 'efl') { prize = Math.max(50, getLeagueScaledVal(seasonTier, 600, state.club.country)); repBonus = 0; }");
    // 2. Giant-killing cup win does not emit a duplicate sim-giantkill UniverseMovement
    expect(appSrc).not.toContain('sim-giantkill-');
    // 3. Turkey Tier 3 regional cup final uses regional cup naming instead of Türkiye Kupası
    expect(appSrc).toContain('isRegionalTier ? Math.max(4, completedCupTier) : completedCupTier');
    // 4. CareerSummary tracks efl & supercup and passes activeClubsDb to getMaxTier
    expect(careerSrc).toContain('totalTrophyCounts.efl += h.trophiesThisYear.efl || 0;');
    expect(careerSrc).toContain('totalTrophyCounts.supercup += 1;');
    expect(careerSrc).toContain('getMaxTier(country, activeClubsDb)');
    // 5. SeasonFinishModal includes SCO in promotion playoff highlight list and includes Supercup wins
    expect(finishSrc).toContain("['ENG', 'ESP', 'ITA', 'USA', 'FRA', 'SCO'].includes(country)");
    expect(finishSrc).toContain("type: 'supercup'");
    // 6. TrophyModal uses getRegion(country) for continental champions instead of defaulting non-USA/ECU to Europe
    expect(trophyModalSrc).toContain("region === 'AFC'");
    expect(trophyModalSrc).toContain("region === 'CONMEBOL'");
  });
});
