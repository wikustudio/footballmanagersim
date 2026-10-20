import { describe, it, expect } from 'vitest';
import { autoRepairClubsDb, mergeClubsDbSafeguards } from './modSafeguards';
import { Club, GameState } from '../types';

describe('Former Club Tier Preservation & Invariant 18-Club League Capacity Integrity', () => {
  it('ensures autoRepairClubsDb balances a 17-team Tier 2 and 19-team Tier 3 back to 18/18 without cascading former club to Tier 10', () => {
    // Generate 198 mock German clubs (18 per tier, 11 tiers)
    const mockClubs: Club[] = [];
    let idCounter = 1;

    for (let t = 1; t <= 11; t++) {
      for (let c = 1; c <= 18; c++) {
        mockClubs.push({
          id: idCounter++,
          name: `Club T${t}_${c}`,
          tier: t,
          baseOvr: 85 - t * 5 + (18 - c),
          color: '#111111',
          stadium: 10000,
          country: 'GER'
        });
      }
    }

    // Now recreate the exact user scenario:
    // Greuther Fürth (promoted to Tier 2) was pulled into Tier 3 (making Tier 2 = 17, Tier 3 = 19)
    // TSV Vestenbergsgreuth is in Tier 3 with baseOvr 68 (formerly managed by user)
    const fuerthClub = mockClubs.find(c => c.tier === 2)!;
    fuerthClub.name = 'SpVgg Greuther Fürth';
    fuerthClub.tier = 3; // Distorted into Tier 3

    const vestenbergClub = mockClubs.find(c => c.tier === 3 && c.id !== fuerthClub.id)!;
    vestenbergClub.name = 'TSV Vestenbergsgreuth';
    vestenbergClub.baseOvr = 68;

    const mockGameState: Partial<GameState> = {
      club: fuerthClub,
      managedClubFacilities: {
        [String(vestenbergClub.id)]: {
          tier: 3,
          stadium: 18000,
          academyLevel: 4,
          medicalLevel: 4,
          fanBase: 25000,
          peakOvr: 68,
          yearsDirected: 5
        }
      }
    };

    // Run autoRepairClubsDb with gameState
    const repaired = autoRepairClubsDb(mockClubs, true, mockGameState as GameState);

    // Verify all German tiers 1 to 11 have EXACTLY 18 clubs!
    for (let t = 1; t <= 11; t++) {
      const clubsInTier = repaired.filter(c => c.tier === t);
      expect(clubsInTier.length).toBe(18);
    }

    // TSV Vestenbergsgreuth MUST NOT have been demoted to Tier 10!
    const repairedVestenberg = repaired.find(c => c.name === 'TSV Vestenbergsgreuth')!;
    expect(repairedVestenberg.tier).toBeLessThanOrEqual(3);
    expect(repairedVestenberg.tier).not.toBe(10);
    expect(repairedVestenberg.baseOvr).toBeGreaterThanOrEqual(60);
  });

  it('ensures mergeClubsDbSafeguards preserves tier, peak OVR, and facilities for formerly managed clubs on database reload', () => {
    // Starting mod club for TSV Vestenbergsgreuth in Season 1 is Tier 10 with 24 OVR
    const incomingBaseModClubs: Club[] = [
      {
        id: 185,
        name: 'TSV Vestenbergsgreuth',
        tier: 10,
        baseOvr: 24,
        color: '#008000',
        stadium: 1500,
        country: 'GER'
      },
      {
        id: 50,
        name: 'SpVgg Greuther Fürth',
        tier: 2,
        baseOvr: 72,
        color: '#00ff00',
        stadium: 15000,
        country: 'GER'
      }
    ];

    const currentClub: Club = {
      id: 50,
      name: 'SpVgg Greuther Fürth',
      tier: 2,
      baseOvr: 72,
      color: '#00ff00',
      stadium: 15000,
      country: 'GER'
    };

    const mockGameState: Partial<GameState> = {
      club: currentClub,
      livingTiers: {
        185: 3,
        'tsv vestenbergsgreuth': 3,
        50: 2,
        'spvgg greuther fürth': 2
      },
      managedClubFacilities: {
        '185': {
          tier: 3,
          stadium: 22000,
          academyLevel: 6,
          medicalLevel: 5,
          fanBase: 35000,
          peakOvr: 69,
          yearsDirected: 8
        }
      }
    };

    // When reloading, mergeClubsDbSafeguards must NOT reset Vestenbergsgreuth to Tier 10 or 24 OVR!
    const merged = mergeClubsDbSafeguards(incomingBaseModClubs, [currentClub], mockGameState as GameState);
    const vestenbergMerged = merged.find(c => c.id === 185 || c.name === 'TSV Vestenbergsgreuth')!;

    expect(vestenbergMerged.tier).toBe(3);
    expect(vestenbergMerged.baseOvr).toBeGreaterThanOrEqual(67);
    expect(vestenbergMerged.stadium).toBe(22000);
    expect(vestenbergMerged.academyLevel).toBe(6);
    expect(vestenbergMerged.medicalLevel).toBe(5);
  });
});
