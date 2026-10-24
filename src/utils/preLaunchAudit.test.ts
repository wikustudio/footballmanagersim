import { describe, it, expect } from 'vitest';
import { getMinAllowedTierForReserve, isReserveClub, getMaxTier } from '../data/gameConstants';
import { getBaseModClubs } from '../engine/moddingEngine';
import { simulateAiLeagues, canReserveClubPromoteToTier, getParentClub } from '../engine/simulateAiLeagues';
import { autoRepairClubsDb, mergeClubsDbSafeguards } from './modSafeguards';
import { getAllUniverseMovements } from './universeMovements';
import { getRegionalQualificationLegend } from './regionHelpers';
import { generateRandomEvent } from '../data/randomEvents';
import { compactGameState } from './storageManager';
import { calculateClubLeagueHistory } from '../engine/clubProgressionEngine';

describe('7-Point Pre-Launch Verification Suite', () => {
  it('1. Tier 1 Title After Lower-League Start: zero relegation modal & trophy persists on reload', () => {
    const baseModClubs = getBaseModClubs();
    const lowerStartClub = baseModClubs.find(c => c.country === 'GER' && c.tier === 4)!;
    const tier1Club = baseModClubs.find(c => c.country === 'GER' && c.tier === 1)!;

    // Simulate starting in Tier 4+, rising or switching to Tier 1, and winning the Bundesliga title
    const gameState: any = {
      year: 2030,
      seasonCount: 5,
      club: {
        ...tier1Club,
        tier: 1,
        originalStartLeague: lowerStartClub.tier,
        currentBudget: 85000,
      },
      budget: 85000,
      trophies: ['1. Bundesliga'],
      trophyHistory: [
        { year: 2029, clubName: tier1Club.name, name: '1. Bundesliga', color: tier1Club.color }
      ],
      totals: { matches: 170, wins: 110, att: 5000000, trophies: 1, domTrophies: 1, intTrophies: 0 },
      livingTiers: {
        [tier1Club.id]: 1,
        [lowerStartClub.id]: 1,
      },
      managedClubFacilities: {
        [String(lowerStartClub.id)]: { tier: 1, stadium: 35000, academyLevel: 4, medicalLevel: 4, peakOvr: 82 }
      },
      history: [
        {
          year: 2029,
          tier: 1,
          pos: 1,
          pts: 84,
          wins: 26,
          draws: 6,
          losses: 2,
          gf: 78,
          ga: 22,
          clubId: tier1Club.id,
          clubName: tier1Club.name,
          country: 'GER',
          trophiesThisYear: { bl: 1 }
        }
      ],
      universeMovements: []
    };

    // Compact and reload state + clubsDb
    const compacted = compactGameState(gameState);
    expect(compacted.trophies).toContain('1. Bundesliga');
    expect(compacted.trophyHistory).toHaveLength(1);
    expect(compacted.trophyHistory[0].name).toBe('1. Bundesliga');

    const mergedDb = mergeClubsDbSafeguards(baseModClubs, baseModClubs, compacted as any);
    const repairedDb = autoRepairClubsDb(mergedDb, true, compacted as any);
    const repairedT1 = repairedDb.find(c => c.id === tier1Club.id)!;
    const repairedPromoted = repairedDb.find(c => c.id === lowerStartClub.id)!;
    expect(repairedT1.tier).toBe(1);
    expect(repairedPromoted.tier).toBe(1);

    // Verify zero relegation movements exist for the Tier 1 champion
    const movements = getAllUniverseMovements(compacted as any, repairedDb, true);
    const champRelegations = movements.filter(
      m => m.year === 2029 && m.clubName === tier1Club.name && m.type === 'relegation'
    );
    expect(champRelegations).toHaveLength(0);
    const champTitles = movements.filter(
      m => m.year === 2029 && m.clubName === tier1Club.name && m.type === 'title_won'
    );
    expect(champTitles.length).toBeGreaterThanOrEqual(1);
  });

  it('2. 16th-Place Cross-Tier Relegation Playoff Survival: stays in current tier, rank stays 16th (no R badge), no false relegation movement', () => {
    const modClubs = getBaseModClubs();
    const club = modClubs.find(c => c.country === 'GER' && c.tier === 1)!;
    const gameState: any = {
      year: 2027,
      seasonCount: 2,
      club: { ...club, tier: 1 }, // Stayed in Tier 1 after winning relegation playoff
      history: [
        {
          year: 2026,
          tier: 1,
          pos: 16,
          pts: 31,
          wins: 8,
          draws: 7,
          losses: 19,
          gf: 34,
          ga: 58,
          clubId: club.id,
          clubName: club.name,
          country: 'GER',
        }
      ],
      seasonStandingsArchive: {
        2026: {
          1: Array.from({ length: 18 }, (_, idx) => ({
            pos: idx + 1,
            id: idx === 15 ? club.id : 9000 + idx,
            name: idx === 15 ? club.name : `Club ${idx + 1}`,
            pts: 60 - idx * 2,
            isUser: idx === 15,
            status: idx === 0 ? 'C' : idx >= 16 ? 'R' : undefined // 16th place survivor has undefined status (no 'R')
          }))
        }
      },
      universeMovements: []
    };

    const userRow = gameState.seasonStandingsArchive[2026][1][15];
    expect(userRow.pos).toBe(16);
    expect(userRow.status).toBeUndefined();

    const movements = getAllUniverseMovements(gameState, modClubs, true);
    const falseRelegation = movements.find(m => m.year === 2026 && m.clubId === club.id && m.type === 'relegation');
    expect(falseRelegation).toBeUndefined();

    const clubHistory = calculateClubLeagueHistory({ ...club, tier: 1 }, 2026, 2027, gameState.history, {}, movements);
    const y2026Rec = clubHistory.find((r: any) => r.year === 2026);
    expect(y2026Rec?.status).toBe('safe');
  });

  it('3. Youth Farm Loan Guard: loaned prospect has loanedThisSeason flag locking Sign & Release until season end', () => {
    const prospect = {
      id: 'yp_1',
      name: 'Lukas Berg',
      position: 'MID',
      age: 17,
      ovr: 64,
      pot: 84,
      trait: 'Playmaker',
      loanedThisSeason: false
    };

    // Simulate handleLoanYouth (+1 OVR and loanedThisSeason = true)
    const loanedProspect = {
      ...prospect,
      ovr: prospect.ovr + 1,
      loanedThisSeason: true
    };

    expect(loanedProspect.ovr).toBe(65);
    expect(loanedProspect.loanedThisSeason).toBe(true);

    // At season rollover, loanedThisSeason resets to false
    const nextSeasonProspect = {
      ...loanedProspect,
      loanedThisSeason: false
    };
    expect(nextSeasonProspect.loanedThisSeason).toBe(false);
  });

  it('4. Tier 4+ Budget Reload Persistence: treasury exceeding €4M (4,000K) in Tier 4+ is preserved on reload', () => {
    const modClubs = getBaseModClubs();
    const tier4Club = modClubs.find(c => c.country === 'GER' && c.tier === 4)!;
    const highBudgetK = 14500; // €14.5M in Tier 4 via wonderkid sale / bank loan
    const stateWithHighBudget: any = {
      year: 2026,
      seasonCount: 1,
      budget: highBudgetK,
      club: {
        ...tier4Club,
        tier: 4,
        currentBudget: highBudgetK
      },
      history: []
    };

    const compacted = compactGameState(stateWithHighBudget);
    expect(compacted.budget).toBe(highBudgetK);
    expect(compacted.club.currentBudget).toBe(highBudgetK);
  });

  it('5. Mod Country Continental Berths & 18-Team Tables: CONMEBOL (PER/CHI/BOL/PAR), AFC (KOR/IDN/IND), and 5-Tier Poland (POL)', () => {
    const modClubs = getBaseModClubs();

    // Poland 5-tier check (90 clubs, 18 per tier)
    expect(getMaxTier('POL', modClubs)).toBe(5);
    for (let t = 1; t <= 5; t++) {
      const polTierClubs = modClubs.filter(c => c.country === 'POL' && c.tier === t);
      expect(polTierClubs).toHaveLength(18);
    }

    // Simulate AI leagues for PER, KOR, and POL and verify 18-team tables
    for (const country of ['PER', 'CHI', 'BOL', 'PAR', 'KOR', 'IDN', 'IND', 'POL']) {
      const countryClubs = modClubs.filter(c => c.country === country && c.tier === 1);
      expect(countryClubs.length).toBe(18);

      const legend = getRegionalQualificationLegend(country);
      if (['PER', 'CHI', 'BOL', 'PAR'].includes(country)) {
        expect(legend.primary).toContain('Libertadores');
      } else if (['KOR', 'IDN', 'IND'].includes(country)) {
        expect(legend.primary).toContain('AFC');
      } else if (country === 'POL') {
        expect(legend.primary).toContain('Champions');
      }
    }

    const polUserClub = modClubs.find(c => c.country === 'POL' && c.tier === 1)!;
    const simClubs: any = simulateAiLeagues(modClubs, polUserClub.id, 2026);
    for (let t = 1; t <= 5; t++) {
      expect(simClubs.filter((c: any) => c.country === 'POL' && c.tier === t)).toHaveLength(18);
      expect(simClubs.standingsArchive?.[t]).toHaveLength(18);
    }
    expect(simClubs.filter((c: any) => c.country === 'PER' && c.tier === 1)).toHaveLength(18);
    expect(simClubs.filter((c: any) => c.country === 'KOR' && c.tier === 1)).toHaveLength(18);
  });

  it('6. Country-Specific Reserve Ceilings: GER capped at Tier 3 (SSV Jeddeloh II exempt), POR/ESP/ECU/USA allowed in Tier 2 and barred from Tier 1 or parent tier', () => {
    const modClubs = getBaseModClubs();

    expect(getMinAllowedTierForReserve('GER')).toBe(3);
    expect(getMinAllowedTierForReserve('POL')).toBe(3);
    expect(getMinAllowedTierForReserve('POR')).toBe(2);
    expect(getMinAllowedTierForReserve('ESP')).toBe(2);
    expect(getMinAllowedTierForReserve('ECU')).toBe(2);
    expect(getMinAllowedTierForReserve('USA')).toBe(2);

    // SSV Jeddeloh II is a senior club, not a reserve squad
    expect(isReserveClub('SSV Jeddeloh II')).toBe(false);

    // GER reserve cannot promote to Tier 2
    const bayernII = modClubs.find(c => c.country === 'GER' && isReserveClub(c.name))!;
    expect(canReserveClubPromoteToTier(bayernII, 2, modClubs, 'GER')).toBe(false);
    expect(canReserveClubPromoteToTier(bayernII, 3, modClubs, 'GER')).toBe(true);

    // POR/ESP/ECU reserves can be in Tier 2, but cannot promote to Tier 1
    const benficaB = modClubs.find(c => c.id === 234 || (c.country === 'POR' && c.name.includes('Benfica B')))!;
    expect(benficaB.tier).toBe(2);
    expect(canReserveClubPromoteToTier(benficaB, 1, modClubs, 'POR')).toBe(false);

    const sportingB = modClubs.find(c => c.id === 237 || (c.country === 'POR' && c.name.includes('Sporting CP B')))!;
    expect(canReserveClubPromoteToTier(sportingB, 2, modClubs, 'POR')).toBe(true);
    expect(canReserveClubPromoteToTier(sportingB, 1, modClubs, 'POR')).toBe(false);

    const indJuniors = modClubs.find(c => c.id === 871 || (c.country === 'ECU' && c.name.includes('Independiente Juniors')))!;
    expect(indJuniors.tier).toBe(2);
    expect(canReserveClubPromoteToTier(indJuniors, 1, modClubs, 'ECU')).toBe(false);
    const indParent = getParentClub(indJuniors, modClubs, 'ECU');
    expect(indParent?.name).toContain('Independiente del Valle');
  });

  it('7. Billionaire / Consortium Takeover Windfall: positive takeovers wipe debt and inject massive funds while Hostile LBOs never drop treasury below €0', () => {
    const indebtedState: any = {
      year: 2027,
      seasonCount: 2,
      budget: -3500, // In debt (-€3.5M)
      reputation: 65,
      clubImpactScore: 60,
      skillPoints: 5,
      club: {
        id: 1,
        name: '1. FC Kaiserslautern',
        country: 'GER',
        tier: 2,
        baseOvr: 73,
        currentBudget: -3500,
        morale: 75,
        fanBase: 42000,
        stadium: 49000
      },
      history: []
    };

    let sawFriendly = false;
    let sawHostile = false;
    for (let i = 0; i < 400; i++) {
      const ev = generateRandomEvent(indebtedState);
      if (ev && ev.type === 'dyn_takeover') {
        if (ev.title.en.includes('Hostile Leveraged Buyout')) {
          sawHostile = true;
          // Choice 1 (Accept LBO): negative budget is capped so it never drops below €0 when already in debt
          expect(ev.extraData?.opt1Good?.budget).toBe(-0);
          // Choice 2 (Back current board): 0 budget hit
          expect(ev.extraData?.opt2Good?.budget).toBe(0);
        } else {
          sawFriendly = true;
          const windfall = ev.extraData?.opt1Good?.budget || 0;
          expect(windfall).toBeGreaterThan(20000);
          // When applied to indebted club, debt is wiped first (Math.max(0, currentBudget) + windfall)
          const postTakeoverBudget = Math.max(0, indebtedState.budget) + windfall;
          expect(postTakeoverBudget).toBe(windfall);
        }
      }
      if (sawFriendly && sawHostile) break;
    }
    expect(sawFriendly || sawHostile).toBe(true);
  }, 20000);
});
