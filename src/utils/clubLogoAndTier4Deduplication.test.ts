import { describe, it, expect } from 'vitest';
import { ALL_CLUBS } from '../data/clubsData';
import { TEAMS } from '../mod-data/teams';
import { getBaseModClubs, normalizeAndValidateCustomDb, REAL_CLUB_ALIASES, simplifyClubName } from '../engine/moddingEngine';
import { mergeClubsDbSafeguards, autoRepairSingleClub, autoRepairClubsDb } from './modSafeguards';

describe('Club Logo Resolution & ID Mapping Integrity', () => {
  it('verifies REAL_CLUB_ALIASES maps SC Paderborn, Fürth, Hannover, and Karlsruhe accurately', () => {
    expect(REAL_CLUB_ALIASES['sc paderborn 07']).toBe(25);
    expect(REAL_CLUB_ALIASES['kleeblatt fürth']).toBe(26);
    expect(REAL_CLUB_ALIASES['spvgg greuther fürth']).toBe(26);
    expect(REAL_CLUB_ALIASES['hannover 96']).toBe(24);
    expect(REAL_CLUB_ALIASES['sv hannover 96']).toBe(24);
    expect(REAL_CLUB_ALIASES['karlsruher sc']).toBe(23);
    expect(REAL_CLUB_ALIASES['baden karlsruhe']).toBe(23);
  });

  it('verifies reserve teams have dedicated aliases in REAL_CLUB_ALIASES', () => {
    expect(REAL_CLUB_ALIASES['borussia dortmund ii']).toBe(37);
    expect(REAL_CLUB_ALIASES['prussia dortmund ii']).toBe(37);
    expect(REAL_CLUB_ALIASES['fc bayern münchen ii']).toBe(115);
    expect(REAL_CLUB_ALIASES['bavaria münchen ii']).toBe(115);
    expect(REAL_CLUB_ALIASES['vfb stuttgart ii']).toBe(39);
    expect(REAL_CLUB_ALIASES['hannover 96 ii']).toBe(38);
  });

  it('verifies getBaseModClubs correctly maps IDs 23-30 to real German clubs without cross-contamination', () => {
    const modClubs = getBaseModClubs();
    const paderborn = modClubs.find(c => c.id === 25);
    const furth = modClubs.find(c => c.id === 26);
    const hannover = modClubs.find(c => c.id === 24);
    const karlsruhe = modClubs.find(c => c.id === 23);
    const hertha = modClubs.find(c => c.id === 27);
    const schalke = modClubs.find(c => c.id === 28);
    const nurnberg = modClubs.find(c => c.id === 30);
    const dortmund2 = modClubs.find(c => c.id === 37);

    expect(paderborn?.name).toBe('SC Paderborn 07');
    expect(paderborn?.logo).toContain('Paderborn');

    expect(furth?.name).toBe('SpVgg Greuther Fürth');
    expect(furth?.logo).toContain('Greuther');

    expect(hannover?.name).toBe('Hannover 96');
    expect(hannover?.logo).toContain('Hannover');

    expect(karlsruhe?.name).toBe('Karlsruher SC');
    expect(karlsruhe?.logo).toContain('Karlsruher');

    expect(hertha?.name).toBe('Hertha BSC');
    expect(schalke?.name).toBe('FC Schalke 04');
    expect(nurnberg?.name).toBe('1. FC Nürnberg');
    expect(dortmund2?.name).toBe('Borussia Dortmund II');
  });

  it('ensures normalizeAndValidateCustomDb replaces Prussia Dortmund II with Borussia Dortmund II at ID 37 without duplicating', () => {
    const res = normalizeAndValidateCustomDb(TEAMS);
    expect(res.valid).toBe(true);
    expect(res.clubs).toBeDefined();

    const dortmunds = res.clubs!.filter(c => c.name.toLowerCase().includes('dortmund'));
    const dortmundNames = dortmunds.map(c => c.name);

    expect(dortmundNames).toContain('Borussia Dortmund');
    expect(dortmundNames).toContain('Borussia Dortmund II');
    expect(dortmundNames).not.toContain('Prussia Dortmund II');
    expect(dortmundNames).not.toContain('Prussia Dortmund');

    // Only one Dortmund II in the entire database
    const dortmundReserves = dortmunds.filter(c => c.name.includes('II') || c.name.includes('2'));
    expect(dortmundReserves.length).toBe(1);
    expect(dortmundReserves[0].id).toBe(37);
  });

  it('verifies mergeClubsDbSafeguards deduplicates unmodded and modded reserve representations', () => {
    const modClubs = getBaseModClubs();
    // Simulate an existing database that had unmodded Prussia Dortmund II
    const existingWithUnmodded = [
      ...modClubs,
      {
        id: 9991,
        name: 'Prussia Dortmund II',
        tier: 4,
        baseOvr: 64,
        color: '#fde100',
        stadium: 9999,
        country: 'GER',
        isReserve: true
      }
    ];

    const merged = mergeClubsDbSafeguards(modClubs, existingWithUnmodded, null);
    const dortmundIIs = merged.filter(c => c.name.toLowerCase().includes('dortmund') && (c.name.includes('II') || c.name.includes('2')));

    expect(dortmundIIs.length).toBe(1);
    expect(dortmundIIs[0].name).toBe('Borussia Dortmund II');
  });

  it('normalizes custom clubs with B. Dortmund and B. Dortmund II to IDs 3 and 37 without creating phantom 10000+ IDs', () => {
    const customMod = [
      {
        id: 3,
        name: 'B. Dortmund',
        tier: 1,
        baseOvr: 86,
        color: 'eab308',
        stadium: 81365,
        country: 'GER'
      },
      {
        id: 187,
        name: 'B. Dortmund II',
        tier: 3,
        baseOvr: 63,
        color: 'eab308',
        stadium: 9999,
        country: 'GER'
      }
    ];

    const result = normalizeAndValidateCustomDb(customMod);
    expect(result.valid).toBe(true);

    const dortmunds = result.clubs!.filter(c => c.name.toLowerCase().includes('dortmund'));
    const bvbSenior = dortmunds.find(c => !c.name.includes('II'));
    const bvbReserve = dortmunds.find(c => c.name.includes('II'));

    expect(bvbSenior?.id).toBe(3);
    expect(bvbSenior?.name).toBe('B. Dortmund');

    expect(bvbReserve?.id).toBe(37);
    expect(bvbReserve?.name).toBe('B. Dortmund II');

    // Confirm no phantom custom IDs like 10003 or 10037 were generated
    const phantomClubs = dortmunds.filter(c => c.id >= 10000);
    expect(phantomClubs.length).toBe(0);
  });

  it('verifies tier 4 deduplication key resolves Borussia Dortmund II Res. and Prussia Dortmund II Res. to the exact same canonical key', () => {
    const getCanonicalDedupeKey = (clubName: string): string => {
      const lower = clubName.toLowerCase().trim();
      if (REAL_CLUB_ALIASES[lower] != null) {
        return `alias_${REAL_CLUB_ALIASES[lower]}`;
      }
      const lowerNoRes = lower.replace(/\s+res\.?$/i, '').replace(/\s+reserve$/i, '').trim();
      if (REAL_CLUB_ALIASES[lowerNoRes] != null) {
        return `alias_${REAL_CLUB_ALIASES[lowerNoRes]}`;
      }
      const isReserve = clubName.toLowerCase().includes('ii') || clubName.toLowerCase().includes('res');
      const cleanParent = clubName
        .replace(/\s+Res\.?$/i, '')
        .replace(/\s+Reserve$/i, '')
        .replace(/\s+II$/, '')
        .replace(/\s+\(?B\)?$/, '')
        .replace(/\s+Castilla$/, '')
        .replace(/\s+B$/, '')
        .replace(/\s+2$/, '')
        .trim()
        .toLowerCase();
      const parentAlias = REAL_CLUB_ALIASES[cleanParent];
      if (parentAlias != null) {
        return `parent_${parentAlias}_${isReserve}`;
      }
      return `simp_${cleanParent}_${isReserve}`;
    };

    const keyMod = getCanonicalDedupeKey('Borussia Dortmund II Res.');
    const keyUnmod = getCanonicalDedupeKey('Prussia Dortmund II Res.');
    const keyAbbr = getCanonicalDedupeKey('B. Dortmund II Res.');

    expect(keyMod).toBe('alias_37');
    expect(keyUnmod).toBe('alias_37');
    expect(keyAbbr).toBe('alias_37');
    expect(keyMod).toBe(keyUnmod);
  });

  it('verifies autoRepairSingleClub corrects contaminated logos and unmodded names', () => {
    // 1. FC Augsburg contaminated with Heidenheim logo
    const contaminatedAugsburg = {
      id: 11,
      name: 'FC Augsburg',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/1._FC_Heidenheim_1846.svg',
      stadium: 30660,
      fanBase: 3500000,
      tier: 1,
      country: 'GER'
    };
    const repairedAugsburg = autoRepairSingleClub(contaminatedAugsburg as any, true);
    expect(repairedAugsburg.name).toBe('FC Augsburg');
    expect(repairedAugsburg.logo).toContain('Augsburg');
    expect(repairedAugsburg.logo).not.toContain('Heidenheim');
    expect(repairedAugsburg.stadium).toBe(30660);

    // 2. 1. FSV Mainz 05 contaminated with Wolfsburg logo
    const contaminatedMainz = {
      id: 13,
      name: '1. FSV Mainz 05',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/VfL_Wolfsburg_Logo.svg/2048px-VfL_Wolfsburg_Logo.svg.png',
      tier: 1,
      country: 'GER'
    };
    const repairedMainz = autoRepairSingleClub(contaminatedMainz as any, true);
    expect(repairedMainz.name).toBe('1. FSV Mainz 05');
    expect(repairedMainz.logo).toContain('Mainz');
    expect(repairedMainz.logo).not.toContain('Wolfsburg');

    // 3. SC Paderborn 07 contaminated with Hannover logo
    const contaminatedPaderborn = {
      id: 25,
      name: 'SC Paderborn 07',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Hannover_96_Logo.svg',
      tier: 2,
      country: 'GER'
    };
    const repairedPaderborn = autoRepairSingleClub(contaminatedPaderborn as any, true);
    expect(repairedPaderborn.name).toBe('SC Paderborn 07');
    expect(repairedPaderborn.logo).toContain('Paderborn');
    expect(repairedPaderborn.logo).not.toContain('Hannover');

    // 4. Spree Berlin West contaminated with Greuther Fürth logo
    const contaminatedSpree = {
      id: 27,
      name: 'Spree Berlin West',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/SpVgg_Greuther_F%C3%BCrth_2017.svg',
      stadium: 74667,
      tier: 2,
      country: 'GER'
    };
    const repairedSpree = autoRepairSingleClub(contaminatedSpree as any, true);
    expect(repairedSpree.name).toBe('Hertha BSC');
    expect(repairedSpree.logo).toContain('Hertha');
    expect(repairedSpree.logo).not.toContain('Fürth');
    expect(repairedSpree.logo).not.toContain('Greuther');
    expect(repairedSpree.stadium).toBe(74667);

    // 5. Custom uploaded image (data:image/...) must be preserved strictly
    const customClub = {
      id: 9999,
      name: 'Custom FC',
      logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      tier: 1,
      country: 'GER'
    };
    const repairedCustom = autoRepairSingleClub(customClub as any, true);
    expect(repairedCustom.logo).toBe(customClub.logo);
  });

  it('verifies autoRepairClubsDb re-synchronizes an entire database of contaminated clubs', () => {
    const contaminatedList = [
      { id: 1, name: 'Bavaria München', country: 'GER', tier: 1 },
      { id: 11, name: 'FC Augsburg', logo: 'https://upload.wikimedia.org/bad/Heidenheim.svg', country: 'GER', tier: 1 },
      { id: 13, name: '1. FSV Mainz 05', logo: 'https://upload.wikimedia.org/bad/Wolfsburg.svg', country: 'GER', tier: 1 },
      { id: 15, name: 'Eisern Köpenick', country: 'GER', tier: 1 },
      { id: 25, name: 'SC Paderborn 07', logo: 'https://upload.wikimedia.org/bad/Hannover.svg', country: 'GER', tier: 2 },
      { id: 27, name: 'Spree Berlin West', logo: 'https://upload.wikimedia.org/bad/Furth.svg', country: 'GER', tier: 2 },
    ];

    const repaired = autoRepairClubsDb(contaminatedList as any, true);

    expect(repaired.find(c => c.id === 1)?.name).toBe('FC Bayern München');
    expect(repaired.find(c => c.id === 11)?.logo).toContain('Augsburg');
    expect(repaired.find(c => c.id === 13)?.logo).toContain('Mainz');
    expect(repaired.find(c => c.id === 15)?.name).toBe('1. FC Union Berlin');
    expect(repaired.find(c => c.id === 25)?.logo).toContain('Paderborn');
    expect(repaired.find(c => c.id === 27)?.name).toBe('Hertha BSC');
    expect(repaired.find(c => c.id === 27)?.logo).toContain('Hertha');
  });
});
