import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateClubFinancials,
  calculateExpectedAttendance,
  getClubAttendanceProfile,
  getLeagueMaxAttendance,
} from '../data/gameConstants';
import { computeStadiumArchitecture } from '../engine/liveSimVisualEngine';
import { ALL_CLUBS } from '../data/clubsData';
import { TEAMS } from '../mod-data/teams';

test('VFC Plauen (Vogtland Plauen, id 139) draws realistic ~500-750 crowd in GER Tier 7 and scales monotonically on promotion', () => {
  const basePlauen = ALL_CLUBS.find((c) => c.id === 139);
  const modPlauen = TEAMS.find((c) => c.id === 139);
  assert.ok(basePlauen, 'Vogtland Plauen (id 139) should exist in ALL_CLUBS');
  assert.ok(modPlauen, 'VFC Plauen (id 139) should exist in TEAMS');

  for (const clubVariant of [basePlauen, modPlauen]) {
    const t8 = calculateExpectedAttendance({ club: { ...clubVariant, tier: 8, baseOvr: 44 }, tier: 8, year: 2026 });
    const t7 = calculateExpectedAttendance({ club: { ...clubVariant, tier: 7, baseOvr: 49 }, tier: 7, year: 2026 });
    const t6 = calculateExpectedAttendance({ club: { ...clubVariant, tier: 6, baseOvr: 52 }, tier: 6, year: 2026 });
    const t5 = calculateExpectedAttendance({ club: { ...clubVariant, tier: 5, baseOvr: 55 }, tier: 5, year: 2026 });
    const t4 = calculateExpectedAttendance({ club: { ...clubVariant, tier: 4, baseOvr: 59 }, tier: 4, year: 2026 });
    const t3 = calculateExpectedAttendance({ club: { ...clubVariant, tier: 3, baseOvr: 65 }, tier: 3, year: 2026 });
    const t2 = calculateExpectedAttendance({ club: { ...clubVariant, tier: 2, baseOvr: 72 }, tier: 2, year: 2026 });

    assert.ok(t8 >= 200 && t8 <= 420, `Plauen Tier 8 expected 200..420, got ${t8}`);
    assert.ok(t7 >= 400 && t7 <= 760, `Plauen Tier 7 expected 400..760 (never ~8k), got ${t7}`);
    assert.ok(t8 < t7 && t7 < t6 && t6 < t5 && t5 < t4 && t4 < t3 && t3 < t2, `Expected strict promotion climb: ${[t8, t7, t6, t5, t4, t3, t2].join(' < ')}`);

    const finT7 = calculateClubFinancials({
      club: { ...clubVariant, tier: 7, squadSize: 22 } as any,
      budget: 150,
      year: 2026,
      startYear: 2026,
      seasonCount: 1,
    });
    assert.equal(finT7.expectedAtt, finT7.avgAtt, 'calculateClubFinancials must expose matching expectedAtt and avgAtt');
    assert.ok(finT7.expectedAtt < 800, `Plauen Tier 7 financial expectedAtt should be < 800, got ${finT7.expectedAtt}`);
    assert.ok(finT7.net >= 0, `Plauen Tier 7 opening season must remain solvent, got net=${finT7.net}`);
  }
});

test('Deep grassroots tiers (T6-T11) enforce realistic division ceilings even in oversized municipal stadiums', () => {
  assert.ok(getLeagueMaxAttendance(7, false, 'GER', 'VFC Plauen') <= 800);
  assert.ok(getLeagueMaxAttendance(8, false, 'GER', 'Amateur SV') <= 450);
  assert.ok(getLeagueMaxAttendance(10, false, 'GER', 'Kreisliga Kickers') <= 150);
  assert.ok(getLeagueMaxAttendance(11, false, 'GER', 'Kreisliga A Dorf') <= 70);

  const oversizedItaT6 = calculateExpectedAttendance({
    club: {
      id: 99001,
      name: 'ASD Municipal Bowl',
      country: 'ITA',
      tier: 6,
      stadium: 24000,
      baseOvr: 38,
      fanBase: 45000,
    },
    tier: 6,
    year: 2026,
  });
  assert.ok(oversizedItaT6 >= 250 && oversizedItaT6 <= 800, `ITA Tier 6 in 24k bowl should draw 250..800, got ${oversizedItaT6}`);

  const uslOversized = calculateExpectedAttendance({
    club: {
      id: 99002,
      name: 'Metro City SC',
      country: 'USA',
      tier: 2,
      stadium: 42000,
      baseOvr: 66,
      fanBase: 900000,
    },
    tier: 2,
    year: 2026,
  });
  assert.ok(uslOversized >= 7000 && uslOversized <= 20000, `USL Tier 2 in 42k bowl should draw 7k..20k, got ${uslOversized}`);
});

test('Polarized top flights (POR, SCO, TUR) separate national giants from smaller clubs in large stadiums', () => {
  const benficaAtt = calculateExpectedAttendance({
    club: { id: 99101, name: 'SL Benfica', country: 'POR', tier: 1, stadium: 64642, baseOvr: 83, fanBase: 3500000 },
    tier: 1,
    year: 2026,
  });
  const smallPorAtt = calculateExpectedAttendance({
    club: { id: 99102, name: 'GD Estoril', country: 'POR', tier: 1, stadium: 22000, baseOvr: 74, fanBase: 450000 },
    tier: 1,
    year: 2026,
  });
  assert.ok(benficaAtt >= 52000, `Benfica should draw 52k+, got ${benficaAtt}`);
  assert.ok(smallPorAtt >= 3000 && smallPorAtt <= 8500, `Smaller POR T1 club should draw 3k..8.5k, got ${smallPorAtt}`);

  const celticAtt = calculateExpectedAttendance({
    club: { id: 99103, name: 'Celtic FC', country: 'SCO', tier: 1, stadium: 60411, baseOvr: 79, fanBase: 2200000 },
    tier: 1,
    year: 2026,
  });
  const smallScoAtt = calculateExpectedAttendance({
    club: { id: 99104, name: 'Ross County', country: 'SCO', tier: 1, stadium: 11000, baseOvr: 68, fanBase: 180000 },
    tier: 1,
    year: 2026,
  });
  assert.ok(celticAtt >= 48000, `Celtic should draw 48k+, got ${celticAtt}`);
  assert.ok(smallScoAtt >= 3500 && smallScoAtt <= 8000, `Smaller SCO T1 club should draw 3.5k..8k, got ${smallScoAtt}`);

  const bursaT3Att = calculateExpectedAttendance({
    club: { id: 99105, name: 'Bursaspor', country: 'TUR', tier: 3, stadium: 43361, baseOvr: 61, fanBase: 850000 },
    tier: 3,
    year: 2026,
  });
  const normalTurT3Att = calculateExpectedAttendance({
    club: { id: 99106, name: 'Anadolu District FK', country: 'TUR', tier: 3, stadium: 8000, baseOvr: 57, fanBase: 90000 },
    tier: 3,
    year: 2026,
  });
  assert.ok(bursaT3Att > normalTurT3Att * 1.6, `Sleeping giant Bursaspor (${bursaT3Att}) should significantly outdraw typical TUR T3 (${normalTurT3Att})`);
  assert.ok(normalTurT3Att <= 3250, `Typical TUR T3 should stay <= 3250, got ${normalTurT3Att}`);
});

test('Semi-pro Welsh Cymru Premier and High-Fill ENG/GER leagues maintain realistic utilization and solvency', () => {
  const welshClub = ALL_CLUBS.find((c) => c.country === 'WAL' && c.tier === 1) || {
    id: 99201,
    name: 'The New Saints',
    country: 'WAL',
    tier: 1,
    stadium: 3500,
    baseOvr: 61,
    fanBase: 45000,
  };
  const welshFin = calculateClubFinancials({
    club: { ...welshClub, squadSize: 22 } as any,
    budget: 800,
    year: 2026,
    startYear: 2026,
    seasonCount: 1,
  });
  assert.ok(welshFin.expectedAtt >= 350 && welshFin.expectedAtt <= 2400, `Welsh T1 crowd should be 350..2400, got ${welshFin.expectedAtt}`);
  assert.ok(welshFin.net >= 0, `Welsh T1 club must remain solvent, got net=${welshFin.net}`);

  const engT1Club = {
    id: 99202,
    name: 'Brighton Seagulls',
    country: 'ENG',
    tier: 1,
    stadium: 31800,
    baseOvr: 79,
    fanBase: 950000,
  };
  const engAtt = calculateExpectedAttendance({ club: engT1Club, tier: 1, year: 2026 });
  assert.ok(engAtt >= 31800 * 0.8, `ENG T1 club should exceed 80% utilization, got ${engAtt} / 31800`);
});

test('Calibrated Asian, South American, and Australian leagues produce realistic attendances', () => {
  const indGiant = calculateExpectedAttendance({
    club: { id: 99301, name: 'Mohun Bagan SG', country: 'IND', tier: 1, stadium: 65000, baseOvr: 67, fanBase: 1400000 },
    tier: 1,
    year: 2026,
  });
  const indSmall = calculateExpectedAttendance({
    club: { id: 99302, name: 'Coastal FC', country: 'IND', tier: 1, stadium: 18000, baseOvr: 61, fanBase: 220000 },
    tier: 1,
    year: 2026,
  });
  assert.ok(indGiant >= 25000 && indGiant <= 55000, `IND giant expected 25k..55k, got ${indGiant}`);
  assert.ok(indSmall <= 14000, `Smaller IND T1 club should stay <= 14k, got ${indSmall}`);

  const jpnAtt = calculateExpectedAttendance({
    club: { id: 99303, name: 'Urawa Reds', country: 'JPN', tier: 1, stadium: 63700, baseOvr: 73, fanBase: 1800000 },
    tier: 1,
    year: 2026,
  });
  const korAtt = calculateExpectedAttendance({
    club: { id: 99304, name: 'FC Seoul', country: 'KOR', tier: 1, stadium: 66704, baseOvr: 72, fanBase: 1200000 },
    tier: 1,
    year: 2026,
  });
  const argAtt = calculateExpectedAttendance({
    club: { id: 99305, name: 'River Plate', country: 'ARG', tier: 1, stadium: 84567, baseOvr: 79, fanBase: 4500000 },
    tier: 1,
    year: 2026,
  });
  const ausAtt = calculateExpectedAttendance({
    club: { id: 99306, name: 'Sydney FC', country: 'AUS', tier: 1, stadium: 42500, baseOvr: 68, fanBase: 650000 },
    tier: 1,
    year: 2026,
  });

  assert.ok(jpnAtt >= 28000 && jpnAtt <= 63700, `JPN giant expected 28k..63.7k, got ${jpnAtt}`);
  assert.ok(korAtt >= 14000 && korAtt <= 48000, `KOR T1 expected 14k..48k, got ${korAtt}`);
  assert.ok(argAtt >= 60000 && argAtt <= 84567, `ARG giant expected 60k..84.5k, got ${argAtt}`);
  assert.ok(ausAtt >= 8500 && ausAtt <= 25000, `AUS A-League expected 8.5k..25k, got ${ausAtt}`);

  for (const country of ['IDN', 'BOL', 'PER', 'ECU']) {
    const t1Sample =
      ALL_CLUBS.find((c) => c.country === country && c.tier === 1) ||
      TEAMS.find((c) => c.country === country && c.tier === 1) || {
        id: 99350,
        name: `${country} Athletic FC`,
        country,
        tier: 1,
        stadium: 24000,
        baseOvr: 65,
        fanBase: 320000,
      };
    const att = calculateExpectedAttendance({ club: t1Sample, tier: 1, year: 2026 });
    assert.ok(att >= 1500 && att <= (t1Sample.stadium || 60000), `${country} T1 attendance out of range: ${att}`);
  }
});

test('3D stadium seating grids maintain high-density shoulder-to-shoulder capacity scaling', () => {
  const village = computeStadiumArchitecture(3500);
  const medium = computeStadiumArchitecture(24000);
  const arena = computeStadiumArchitecture(55000);
  const colossus = computeStadiumArchitecture(110000);

  assert.ok(village.sideCols >= 42 && village.sideRows >= 7, `Village stands should have dense grid (${village.sideCols}x${village.sideRows})`);
  assert.ok(medium.sideCols > village.sideCols && medium.sideRows > village.sideRows, 'Medium arena grid should scale above village');
  assert.ok(arena.sideCols > medium.sideCols && arena.hasUpperRing && arena.hasThirdTier, 'Arena should unlock upper & third tiers');
  assert.ok(colossus.sideCols >= 64 && colossus.sideRows >= 14 && colossus.hasFullRoofWrap, 'Colossus should render dense multi-ring bowls');
  assert.ok(village.endRows >= 28 && colossus.endRows >= 40 && colossus.cornerCols >= 8, 'Goal-end & corner grids should remain packed from village to colossus capacities');
});

test('Bigger-name clubs in lower leagues draw higher attendances than small local peers without false-positive substring matches', () => {
  // 1. GER Tier 4: MSV Duisburg & TSV 1860 München vs small local Tier 4 club
  const duisburgT4 = calculateExpectedAttendance({
    club: { id: 99401, name: 'MSV Duisburg', country: 'GER', tier: 4, stadium: 31500, baseOvr: 59, fanBase: 850000 },
    tier: 4,
    year: 2026,
  });
  const munich1860T4 = calculateExpectedAttendance({
    club: { id: 99402, name: 'TSV 1860 München', country: 'GER', tier: 4, stadium: 15000, baseOvr: 59, fanBase: 420000 },
    tier: 4,
    year: 2026,
  });
  const smallGerT4 = calculateExpectedAttendance({
    club: { id: 99403, name: 'SV Dorfheim 09', country: 'GER', tier: 4, stadium: 5000, baseOvr: 59, fanBase: 60000 },
    tier: 4,
    year: 2026,
  });
  assert.ok(duisburgT4 >= 11000, `MSV Duisburg in GER T4 should draw 11k+, got ${duisburgT4}`);
  assert.ok(munich1860T4 >= 6500, `TSV 1860 München in GER T4 should draw 6.5k+, got ${munich1860T4}`);
  assert.ok(duisburgT4 > smallGerT4 * 2.5, `Duisburg (${duisburgT4}) must heavily outdraw small GER T4 club (${smallGerT4})`);

  // 2. ENG Tier 4 & Tier 6: Bradford City & Oldham Athletic vs small local peers
  const bradfordT4 = calculateExpectedAttendance({
    club: { id: 99404, name: 'Bradford City', country: 'ENG', tier: 4, stadium: 25136, baseOvr: 63, fanBase: 620000 },
    tier: 4,
    year: 2026,
  });
  const smallEngT4 = calculateExpectedAttendance({
    club: { id: 99405, name: 'Village Athletic FC', country: 'ENG', tier: 4, stadium: 6000, baseOvr: 63, fanBase: 80000 },
    tier: 4,
    year: 2026,
  });
  assert.ok(bradfordT4 >= 12000, `Bradford City in ENG T4 should draw 12k+, got ${bradfordT4}`);
  assert.ok(bradfordT4 > smallEngT4 * 2.0, `Bradford (${bradfordT4}) must strongly outdraw small ENG T4 club (${smallEngT4})`);

  const oldhamT6 = calculateExpectedAttendance({
    club: { id: 99406, name: 'Oldham Athletic', country: 'ENG', tier: 6, stadium: 13559, baseOvr: 53, fanBase: 260000 },
    tier: 6,
    year: 2026,
  });
  const smallEngT6 = calculateExpectedAttendance({
    club: { id: 99407, name: 'Meadowbrook Town', country: 'ENG', tier: 6, stadium: 4000, baseOvr: 53, fanBase: 35000 },
    tier: 6,
    year: 2026,
  });
  assert.ok(oldhamT6 >= 3000, `Oldham Athletic in ENG T6 should draw 3k+, got ${oldhamT6}`);
  assert.ok(oldhamT6 > smallEngT6 * 2.0, `Oldham (${oldhamT6}) must strongly outdraw small ENG T6 club (${smallEngT6})`);

  // 3. FRA Tier 2 & Tier 4: FC Girondins de Bordeaux vs small peers
  const bordeauxT2 = calculateExpectedAttendance({
    club: { id: 99408, name: 'FC Girondins de Bordeaux', country: 'FRA', tier: 2, stadium: 42115, baseOvr: 70, fanBase: 1400000 },
    tier: 2,
    year: 2026,
  });
  const bordeauxT4 = calculateExpectedAttendance({
    club: { id: 99409, name: 'FC Girondins de Bordeaux', country: 'FRA', tier: 4, stadium: 42115, baseOvr: 58, fanBase: 1400000 },
    tier: 4,
    year: 2026,
  });
  assert.ok(bordeauxT2 >= 28000, `Bordeaux in FRA T2 should draw 28k+, got ${bordeauxT2}`);
  assert.ok(bordeauxT4 >= 14000, `Bordeaux in FRA T4 should still draw 14k+, got ${bordeauxT4}`);
  assert.ok(bordeauxT2 > bordeauxT4, `Bordeaux T2 (${bordeauxT2}) must strictly exceed T4 (${bordeauxT4})`);

  // 4. Deep lower-tier historic clubs vs false-positive amateurs
  const kickersT7 = calculateExpectedAttendance({
    club: { id: 99410, name: 'SV Stuttgarter Kickers', country: 'GER', tier: 7, stadium: 11400, baseOvr: 50, fanBase: 120000 },
    tier: 7,
    year: 2026,
  });
  const uerdingenT10 = calculateExpectedAttendance({
    club: { id: 99411, name: 'KFC Uerdingen 05', country: 'GER', tier: 10, stadium: 34500, baseOvr: 42, fanBase: 60000 },
    tier: 10,
    year: 2026,
  });
  const hertha06T11 = calculateExpectedAttendance({
    club: { id: 99412, name: 'CFC Hertha 06', country: 'GER', tier: 11, stadium: 10490, baseOvr: 35, fanBase: 8000 },
    tier: 11,
    year: 2026,
  });
  assert.ok(kickersT7 >= 1800, `Stuttgarter Kickers in GER T7 should draw 1.8k+, got ${kickersT7}`);
  assert.ok(uerdingenT10 >= 800, `KFC Uerdingen in GER T10 should draw 800+, got ${uerdingenT10}`);
  assert.ok(hertha06T11 <= 70, `CFC Hertha 06 (T11 amateur) must NOT falsely match Hertha BSC, got ${hertha06T11}`);

  // 5. Unmodded alias parity (even without explicit fanBase) + strict namesake false-positive protection
  const lokLeipzigUnmodded = calculateExpectedAttendance({
    club: { id: 62, name: 'Dampflok Leipzig', country: 'GER', tier: 4, stadium: 15000, baseOvr: 62 },
    tier: 4,
    year: 2026,
  });
  assert.ok(lokLeipzigUnmodded >= 6500, `Dampflok Leipzig (unmodded T4) should draw 6.5k+, got ${lokLeipzigUnmodded}`);

  const falsePositiveChecks: Array<[string, string, number, number, number]> = [
    ['FC Bayern Alzenau', 'GER', 8, 5000, 350],
    ['ASC 09 Dortmund', 'GER', 9, 2000, 200],
    ['SC Düsseldorf West', 'GER', 7, 2000, 760],
    ['C.D. Arronches e Benfica', 'POR', 6, 3000, 500],
    ['G.D. Bragança', 'POR', 6, 2000, 500],
    ['Roma Trastevere', 'ITA', 6, 3100, 800],
    ['Marseille Nord', 'FRA', 3, 1500, 1500],
    ['Cove Rangers FC', 'SCO', 2, 3000, 3000],
    ['Grêmio Novorizontino', 'BRA', 2, 12398, 12398],
  ];
  for (const [name, country, tier, stadium, maxAtt] of falsePositiveChecks) {
    assert.equal(
      getClubAttendanceProfile(name, country),
      'standard',
      `${name} (${country} T${tier}) must resolve to standard profile`
    );
    const att = calculateExpectedAttendance({
      club: { id: 99500, name, country, tier, stadium, baseOvr: 50 },
      tier,
      year: 2026,
    });
    assert.ok(att <= maxAtt, `${name} (${country} T${tier}) exceeded ceiling ${maxAtt}: got ${att}`);
  }
});



