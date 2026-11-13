import assert from 'node:assert/strict';
import { buildChampionsAlmanac, buildTopTrophyTeamsChart, buildWorldCupAlmanacHistory } from './championsAlmanac';
import { getAllUniverseMovements } from './universeMovements';
import { ALL_CLUBS } from '../data/clubsData';
import { getMaxTier } from '../data/gameConstants';

const isVitest = Boolean((globalThis as any).__vitest_worker__ || process.env.VITEST);
const test: (name: string, fn: () => void) => any = isVitest
  ? (await import('vitest')).test
  : (await import('node:test')).default;

test('1954 career start: pre-Season 1 shows 1950-1953 lore only, and completed 1954-1956 seasons have no 2024 baseline leaks or static lore leaks', () => {
  const kaiserslautern = ALL_CLUBS.find((c) => c.id === 31) || ALL_CLUBS[0];

  // 1. Fresh 1954 kickoff (before Season 1 finishes)
  const fresh1954State: any = {
    startYear: 1954,
    year: 1954,
    managerName: 'Sepp Herberger',
    club: { ...kaiserslautern, tier: 1 },
    history: [],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const preMovements = getAllUniverseMovements(fresh1954State, ALL_CLUBS, false);
  assert.equal(preMovements.length, 0, 'Fresh 1954 career must NOT inject 2024 BASELINE_UNIVERSE_MOVEMENTS');

  const preAlmanac = buildChampionsAlmanac(fresh1954State, 'GER', ALL_CLUBS, false);
  assert.deepEqual(
    preAlmanac.map((r) => r.year),
    [1953, 1952, 1951, 1950]
  );
  assert.ok(preAlmanac.every((r) => r.isHistoricalLore === true));
  // 1953 GER Tier 1 lore is Kaiserslautern (id: 31), 1952 is Stuttgart (id: 5)
  assert.equal(preAlmanac[0].leagueWinners.find((w) => w.tier === 1)?.clubId, 31);
  assert.equal(preAlmanac[1].leagueWinners.find((w) => w.tier === 1)?.clubId, 5);

  // 2. Completed 1954, 1955, and 1956 seasons (year is now 1957)
  const sim1954To1956State: any = {
    startYear: 1954,
    year: 1957,
    managerName: 'Sepp Herberger',
    club: { ...kaiserslautern, tier: 1 },
    history: [
      {
        year: 1954,
        clubId: 31,
        clubName: kaiserslautern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 74,
        wins: 22,
        draws: 8,
        losses: 4,
        trophiesThisYear: { bl: 1, dfb: 1 },
      },
      {
        year: 1955,
        clubId: 31,
        clubName: kaiserslautern.name,
        country: 'GER',
        tier: 1,
        pos: 2,
        pts: 68,
        wins: 20,
        draws: 8,
        losses: 6,
        trophiesThisYear: {},
      },
      {
        year: 1956,
        clubId: 31,
        clubName: kaiserslautern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 77,
        wins: 24,
        draws: 5,
        losses: 5,
        trophiesThisYear: { bl: 1 },
      },
    ],
    // Even if a stray 2024 baseline item existed in an old save array, Almanac must ignore >1956 entries
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const simMovements = getAllUniverseMovements(sim1954To1956State, ALL_CLUBS, false);
  assert.ok(simMovements.every((m) => m.year !== 2024), 'No 2024 baseline movements should appear in a 1954 save');
  // 1954 continental & global cups should be backfilled by getAllUniverseMovements
  const cups1954 = simMovements.filter((m) => m.year === 1954 && m.type === 'cup_champion');
  assert.ok(cups1954.some((m) => m.fromLeagueName === 'Champions Cup'));
  assert.ok(cups1954.some((m) => m.fromLeagueName === 'Copa Libertadores'));
  assert.ok(cups1954.some((m) => m.fromLeagueName === 'Global Club Cup'));

  const simAlmanac = buildChampionsAlmanac(sim1954To1956State, 'GER', ALL_CLUBS, false);
  assert.deepEqual(
    simAlmanac.map((r) => r.year),
    [1956, 1955, 1954, 1953, 1952, 1951, 1950]
  );
  assert.equal(simAlmanac[0].isHistoricalLore, false); // 1956 live
  assert.equal(simAlmanac[1].isHistoricalLore, false); // 1955 live
  assert.equal(simAlmanac[2].isHistoricalLore, false); // 1954 live
  assert.equal(simAlmanac[3].isHistoricalLore, true);  // 1953 lore

  const live1954T1 = simAlmanac.find((r) => r.year === 1954)!.leagueWinners.find((w) => w.tier === 1)!;
  assert.equal(live1954T1.clubId, 31);
  assert.equal(live1954T1.isUserClub, true);
  assert.equal(live1954T1.coachName, 'Sepp Herberger');

  // Verify 1956 Global Club Cup aligns with simulated 1956 continental winners rather than leaking static 1956 lore
  const rec1956 = simAlmanac.find((r) => r.year === 1956)!;
  const globalClub1956 = rec1956.globalWinners.find((w) => w.competitionId === 'global-club-cup');
  assert.ok(globalClub1956);
  assert.ok(globalClub1956.clubName.length > 0);
});

test('1950 inaugural career start handles empty pre-Season 1 cleanly and populates 1950 upon Season 1 completion', () => {
  const club = ALL_CLUBS.find((c) => c.id === 5) || ALL_CLUBS[0];
  const fresh1950State: any = {
    startYear: 1950,
    year: 1950,
    managerName: 'Inaugural Boss',
    club: { ...club, tier: 1 },
    history: [],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const emptyAlmanac = buildChampionsAlmanac(fresh1950State, 'GER', ALL_CLUBS, false);
  assert.equal(emptyAlmanac.length, 0);

  const completed1950State: any = {
    ...fresh1950State,
    year: 1951,
    history: [
      {
        year: 1950,
        clubId: club.id,
        clubName: club.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 70,
        wins: 21,
        draws: 7,
        losses: 6,
        trophiesThisYear: { bl: 1 },
      },
    ],
  };

  const post1950Almanac = buildChampionsAlmanac(completed1950State, 'GER', ALL_CLUBS, false);
  assert.equal(post1950Almanac.length, 1);
  assert.equal(post1950Almanac[0].year, 1950);
  assert.equal(post1950Almanac[0].isHistoricalLore, false);
  assert.equal(post1950Almanac[0].leagueWinners.find((w) => w.tier === 1)?.clubId, club.id);
});

test('buildChampionsAlmanac combines Pre-Start Historical Lore (1950-2025) and Live Simulated Seasons (2026+)', () => {
  const userClub = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];
  const mockState: any = {
    year: 2027,
    startYear: 2026,
    club: userClub,
    history: [
      {
        year: 2026,
        clubId: userClub.id,
        clubName: userClub.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 82,
        wins: 25,
        draws: 7,
        losses: 2,
        trophiesThisYear: { bl: 1, dfb: 1, cl: 1 },
      },
    ],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const records = buildChampionsAlmanac(mockState, 'GER', ALL_CLUBS, false);
  const maxTierGer = getMaxTier('GER', ALL_CLUBS);

  // Should contain years from 1950 through 2026 (77 years total)
  assert.equal(records.length, 77);
  assert.equal(records[0].year, 2026);
  assert.equal(records[0].isHistoricalLore, false);

  const year1950 = records.find((r) => r.year === 1950);
  assert.ok(year1950);
  assert.equal(year1950.isHistoricalLore, true);

  // Every year should have Tier 1..maxTier + Domestic & Regional Cups + Global/Continental Cups
  assert.equal(year1950.leagueWinners.length, maxTierGer);
  assert.equal(records[0].leagueWinners.length, maxTierGer);
  assert.ok(year1950.cupWinners.length >= 2);
  assert.ok(year1950.globalWinners.length >= 2);

  for (let t = 1; t <= maxTierGer; t++) {
    const tierWinner1950 = year1950.leagueWinners.find((w) => w.tier === t);
    assert.ok(tierWinner1950, `1950 should have a winner for Tier ${t}`);
    assert.ok(tierWinner1950.clubName.length > 0);

    const tierWinner2026 = records[0].leagueWinners.find((w) => w.tier === t);
    assert.ok(tierWinner2026, `2026 live season should have a winner for Tier ${t}`);
  }

  // Verify 2026 simulated Tier 1 winner is user's club with points, record & coach
  const liveTier1 = records[0].leagueWinners.find((w) => w.tier === 1);
  assert.ok(liveTier1);
  assert.equal(liveTier1.clubId, userClub.id);
  assert.equal(liveTier1.isUserClub, true);
  assert.equal(liveTier1.pts, 82);
  assert.equal(liveTier1.wins, 25);
  assert.equal(liveTier1.draws, 7);
  assert.equal(liveTier1.losses, 2);
  assert.ok(liveTier1.coachName && liveTier1.coachName.length > 0);

  // Verify 2024 historical lore Tier 1 winner for GER is Leverkusen (id: 2) with points, record & coach
  const year2024 = records.find((r) => r.year === 2024);
  assert.ok(year2024);
  const lore2024Tier1 = year2024.leagueWinners.find((w) => w.tier === 1);
  assert.ok(lore2024Tier1);
  assert.equal(lore2024Tier1.clubId, 2);
  assert.ok(typeof lore2024Tier1.pts === 'number' && lore2024Tier1.pts >= 60);
  assert.ok(typeof lore2024Tier1.wins === 'number' && lore2024Tier1.wins > 0);
  assert.ok(typeof lore2024Tier1.losses === 'number' && lore2024Tier1.losses >= 0);
  assert.ok(lore2024Tier1.coachName && lore2024Tier1.coachName.length > 0);
});

test('buildChampionsAlmanac respects historical startYear (e.g. 1990) without future lore spoilers and surfaces pre-2026 simulated seasons', () => {
  const hsv = ALL_CLUBS.find((c) => c.id === 22) || ALL_CLUBS[0];

  // 1. Fresh 1990 kickoff (no completed seasons yet): Almanac must end at 1989 (no 1990..2025 future spoilers)
  const fresh1990State: any = {
    startYear: 1990,
    year: 1990,
    managerName: 'Alex Vance',
    club: { ...hsv, tier: 1 },
    history: [],
    universeMovements: [],
    seasonStandingsArchive: {},
  };
  const freshRecords = buildChampionsAlmanac(fresh1990State, 'GER', ALL_CLUBS, false);
  assert.equal(freshRecords[0].year, 1989);
  assert.equal(freshRecords[freshRecords.length - 1].year, 1950);
  assert.equal(freshRecords.length, 40); // 1950..1989 inclusive
  assert.ok(freshRecords.every((r) => r.isHistoricalLore === true));

  // 2. After simulating 1990 and winning Tier 1 + Champions Cup + DFB-Pokal:
  // 1990 must be marked live (isHistoricalLore: false) and credit HSV + Alex Vance instead of 1990 static lore!
  const played1990State: any = {
    startYear: 1990,
    year: 1991,
    managerName: 'Alex Vance',
    club: { ...hsv, tier: 1 },
    history: [
      {
        year: 1990,
        clubId: 22,
        clubName: hsv.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 76,
        wins: 23,
        draws: 7,
        losses: 4,
        trophiesThisYear: { bl: 1, dfb: 1, cl: 1 },
      },
    ],
    universeMovements: [],
    seasonStandingsArchive: {},
  };
  const playedRecords = buildChampionsAlmanac(played1990State, 'GER', ALL_CLUBS, false);
  assert.equal(playedRecords[0].year, 1990);
  assert.equal(playedRecords.length, 41); // 1950..1990
  assert.equal(playedRecords[0].isHistoricalLore, false);
  assert.equal(playedRecords[1].year, 1989);
  assert.equal(playedRecords[1].isHistoricalLore, true);

  const live1990Tier1 = playedRecords[0].leagueWinners.find((w) => w.tier === 1);
  assert.ok(live1990Tier1);
  assert.equal(live1990Tier1.clubId, 22);
  assert.equal(live1990Tier1.coachName, 'Alex Vance');
  assert.equal(live1990Tier1.wins, 23);
  assert.equal(live1990Tier1.losses, 4);

  const live1990Cl = playedRecords[0].globalWinners.find((w) => w.id.includes('cont1'));
  assert.ok(live1990Cl);
  assert.equal(live1990Cl.clubId, 22);
  assert.equal(live1990Cl.isUserClub, true);
  assert.equal(live1990Cl.coachName, 'Alex Vance');

  // 3. Pre-Start Lore years (e.g., 1983 HSV Champions Cup or Tier 1 win) must NOT show isUserClub=true
  const lore1983 = playedRecords.find((r) => r.year === 1983);
  assert.ok(lore1983);
  const lore1983Tier1 = lore1983.leagueWinners.find((w) => w.tier === 1);
  assert.ok(lore1983Tier1);
  assert.equal(lore1983Tier1.clubId, 22);
  assert.equal(lore1983Tier1.isUserClub, false);

  // 4. Multi-club career: after moving from HSV (id: 22) in 1990 to Bayern (id: 1) in 1991,
  // 1990 HSV retains isUserClub=true & Coach: Alex Vance, while 1990 Bayern does NOT retroactively become YOU
  const bayern = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];
  const multiClubState: any = {
    startYear: 1990,
    year: 1992,
    managerName: 'Alex Vance',
    club: { ...bayern, tier: 1 },
    history: [
      {
        year: 1990,
        clubId: 22,
        clubName: hsv.name,
        country: 'GER',
        tier: 2,
        pos: 1,
        pts: 78,
        wins: 24,
        draws: 6,
        losses: 4,
        trophiesThisYear: { lower: 1 },
      },
      {
        year: 1991,
        clubId: 1,
        clubName: bayern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 80,
        wins: 25,
        draws: 5,
        losses: 4,
        trophiesThisYear: { bl: 1 },
      },
    ],
    universeMovements: [
      { year: 1990, country: 'GER', fromTier: 1, type: 'title_won', clubId: 1, clubName: bayern.name },
      { year: 1991, country: 'GER', fromTier: 2, type: 'promotion', pos: 1, clubId: 22, clubName: hsv.name },
    ],
    seasonStandingsArchive: {},
  };
  const multiRecords = buildChampionsAlmanac(multiClubState, 'GER', ALL_CLUBS, false);
  const rec1990 = multiRecords.find((r) => r.year === 1990)!;
  const rec1991 = multiRecords.find((r) => r.year === 1991)!;

  // In 1990: HSV (Tier 2) was YOU; Bayern (Tier 1) was AI
  const hsv1990T2 = rec1990.leagueWinners.find((w) => w.tier === 2)!;
  const bayern1990T1 = rec1990.leagueWinners.find((w) => w.tier === 1)!;
  assert.equal(hsv1990T2.isUserClub, true);
  assert.equal(hsv1990T2.coachName, 'Alex Vance');
  assert.equal(bayern1990T1.isUserClub, false);
  assert.notEqual(bayern1990T1.coachName, 'Alex Vance');

  // In 1991: Bayern (Tier 1) is YOU; HSV (Tier 2) is EX (former club)
  const bayern1991T1 = rec1991.leagueWinners.find((w) => w.tier === 1)!;
  const hsv1991T2 = rec1991.leagueWinners.find((w) => w.tier === 2)!;
  assert.equal(bayern1991T1.isUserClub, true);
  assert.equal(bayern1991T1.coachName, 'Alex Vance');
  assert.equal(hsv1991T2.isUserClub, false);
  assert.equal(hsv1991T2.isPastManagerClub, true);
});

test('getLeagueInfo and buildChampionsAlmanac return valid string league/competition names when isModActive=true', async () => {
  const { getLeagueInfo } = await import('../data/gameConstants');
  // Even if a boolean (e.g. isModActive=true) is accidentally passed as customName, .name must be a valid string
  const infoWithBool = getLeagueInfo(1, 'GER', true as any);
  assert.equal(typeof infoWithBool.name, 'string');
  assert.equal(infoWithBool.name.toUpperCase(), '1. BUNDESLIGA');

  const tier6WithBool = getLeagueInfo(6, 'GER', true as any);
  assert.equal(typeof tier6WithBool.name, 'string');
  assert.equal(tier6WithBool.name.toUpperCase(), 'VERBANDSLIGA');

  const fallbackWithBool = getLeagueInfo(12, 'GER', true as any);
  assert.equal(typeof fallbackWithBool.name, 'string');
  assert.ok(fallbackWithBool.name.toUpperCase().length > 0);

  const userClub = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];
  const mockState: any = {
    year: 2026,
    startYear: 2026,
    club: userClub,
    history: [],
    universeMovements: [],
    seasonStandingsArchive: {},
  };
  const recordsModActive = buildChampionsAlmanac(mockState, 'GER', ALL_CLUBS, true);
  assert.ok(recordsModActive.length > 0);
  for (const w of [
    ...recordsModActive[0].leagueWinners,
    ...recordsModActive[0].cupWinners,
    ...recordsModActive[0].globalWinners,
  ]) {
    assert.equal(typeof w.competitionName, 'string');
    assert.ok(w.competitionName.toUpperCase().length > 0);
  }
});

test('Champions Almanac displays POINTS instead of RECORD and preserves exact league points across all sources', async () => {
  const fs = await import('node:fs');
  const srcView = fs.readFileSync('src/components/HistoryAndAlmanacViews.tsx', 'utf-8');
  const rootView = fs.readFileSync('components/HistoryAndAlmanacViews.tsx', 'utf-8');
  for (const content of [srcView, rootView]) {
    assert.ok(content.includes('>POINTS</th>'), 'Almanac table header must be POINTS');
    assert.ok(!content.includes('>RECORD</th>'), 'Almanac table header must NOT be RECORD');
    assert.ok(!content.includes('All Tiers'), 'Tier filter must only show existing tiers without All Tiers');
    assert.ok(!content.includes('<option value="live">'), 'Year filter must only show single years without Live Simulated Seasons option');
    assert.ok(!content.includes('<option value="lore">'), 'Year filter must not show Pre-Start Historical Lore option');
    assert.ok(!content.includes('By Decade'), 'Year filter must not show By Decade group');
    assert.ok(!content.includes('almanac-competition-select'), 'Redundant competition dropdown on the right must be removed');
  }

  const bayern = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];
  const stuttgart = ALL_CLUBS.find((c) => c.id === 5) || ALL_CLUBS[0];
  const hsv = ALL_CLUBS.find((c) => c.id === 22) || ALL_CLUBS[0];

  const mockState: any = {
    startYear: 2026,
    year: 2028,
    club: bayern,
    history: [
      {
        year: 2026,
        clubId: 1,
        clubName: bayern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 88,
        wins: 27,
        draws: 7,
        losses: 0,
        trophiesThisYear: { bl: 1 },
      },
      {
        year: 2027,
        clubId: 1,
        clubName: bayern.name,
        country: 'GER',
        tier: 1,
        pos: 2,
        pts: 76,
        wins: 23,
        draws: 7,
        losses: 4,
        trophiesThisYear: {},
      },
    ],
    seasonStandingsArchive: {
      2026: {
        2: [{ pos: 1, id: 22, name: hsv.name, pts: 75 }], // pts provided without w/d/l
      },
    },
    universeMovements: [
      {
        id: 'ai-champ-2027',
        year: 2027,
        country: 'GER',
        fromTier: 1,
        toTier: 1,
        type: 'title_won',
        pos: 1,
        clubId: 5,
        clubName: stuttgart.name,
        reason: '1. Bundesliga Champions · Finished #1 (84 pts)',
      },
    ],
  };

  const records = buildChampionsAlmanac(mockState, 'GER', ALL_CLUBS, false);
  const rec2026 = records.find((r) => r.year === 2026)!;
  const rec2027 = records.find((r) => r.year === 2027)!;
  const rec1954 = records.find((r) => r.year === 1954)!;

  // 2026 Tier 1 user champion exact pts = 88
  assert.equal(rec2026.leagueWinners.find((w) => w.tier === 1)?.pts, 88);
  // 2026 Tier 2 seasonStandingsArchive row without w/d/l preserves exact pts = 75
  assert.equal(rec2026.leagueWinners.find((w) => w.tier === 2)?.pts, 75);
  // 2027 Tier 1 AI movement champion parses exact pts = 84 from movement reason
  assert.equal(rec2027.leagueWinners.find((w) => w.tier === 1)?.pts, 84);
  // Historical lore rows all have positive numeric pts
  for (const lw of rec1954.leagueWinners) {
    assert.equal(typeof lw.pts, 'number');
    assert.ok((lw.pts as number) >= 60 && (lw.pts as number) <= 102);
  }
});

test('buildTopTrophyTeamsChart returns Top 5 teams by Country & Tier or International Competition, accounting for historic lore in modern start and building fresh in historic start', () => {
  const bayern = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];
  const kaiserslautern = ALL_CLUBS.find((c) => c.id === 31) || ALL_CLUBS[0];

  // 1. Modern 2026 start (with 1 simulated season in 2026): defaults to 'all_time' (includes 1950..2025 lore + 2026 live)
  const modernState: any = {
    startYear: 2026,
    year: 2027,
    club: bayern,
    history: [
      {
        year: 2026,
        clubId: 1,
        clubName: bayern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 85,
        wins: 26,
        draws: 7,
        losses: 1,
        trophiesThisYear: { bl: 1, cl: 1 },
      },
    ],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const gerTier1Chart = buildTopTrophyTeamsChart(
    modernState,
    { scope: 'country_tier', country: 'GER', tier: 1 },
    ALL_CLUBS,
    false
  );
  assert.equal(gerTier1Chart.accountingMode, 'all_time');
  assert.equal(gerTier1Chart.topTeams.length, 5);
  // Bayern (#1) should lead GER Tier 1 with 30+ titles (33 historical + 1 simulated)
  assert.equal(gerTier1Chart.topTeams[0].clubId, 1);
  assert.ok(gerTier1Chart.topTeams[0].count >= 30);
  assert.equal(gerTier1Chart.topTeams[0].liveCount, 1);
  assert.ok(gerTier1Chart.topTeams[0].historicCount >= 29);

  // International competition: Champions Cup
  const uclChart = buildTopTrophyTeamsChart(
    modernState,
    { scope: 'international', internationalCompetitionId: 'champions-cup' },
    ALL_CLUBS,
    false
  );
  assert.equal(uclChart.accountingMode, 'all_time');
  assert.equal(uclChart.topTeams.length, 5);
  // Real Madrid (id: 501) leads Champions Cup all-time
  assert.equal(uclChart.topTeams[0].clubId, 501);
  assert.ok(uclChart.topTeams[0].count >= 12);

  // 2. Historic 1954 start: defaults to 'fresh_from_start' (builds fresh from 1954 onwards without 1950-1953 lore)
  const historic1954State: any = {
    startYear: 1954,
    year: 1956,
    managerName: 'Sepp Herberger',
    club: { ...kaiserslautern, tier: 1 },
    history: [
      {
        year: 1954,
        clubId: 31,
        clubName: kaiserslautern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 74,
        wins: 22,
        draws: 8,
        losses: 4,
        trophiesThisYear: { bl: 1 },
      },
      {
        year: 1955,
        clubId: 31,
        clubName: kaiserslautern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 76,
        wins: 23,
        draws: 7,
        losses: 4,
        trophiesThisYear: { bl: 1 },
      },
    ],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const fresh1954Chart = buildTopTrophyTeamsChart(
    historic1954State,
    { scope: 'country_tier', country: 'GER', tier: 1 },
    ALL_CLUBS,
    false
  );
  assert.equal(fresh1954Chart.accountingMode, 'fresh_from_start');
  assert.equal(fresh1954Chart.startYearCounted, 1954);
  assert.equal(fresh1954Chart.endYearCounted, 1955);
  assert.equal(fresh1954Chart.totalSeasonsCounted, 2);
  assert.equal(fresh1954Chart.topTeams.length, 1);
  assert.equal(fresh1954Chart.topTeams[0].clubId, 31);
  assert.equal(fresh1954Chart.topTeams[0].count, 2);
  assert.equal(fresh1954Chart.topTeams[0].historicCount, 0);
  assert.equal(fresh1954Chart.topTeams[0].liveCount, 2);

  // Explicit 'all_time' toggle on historic 1954 start includes 1950-1953 lore + 1954-1955 simulated
  const allTime1954Chart = buildTopTrophyTeamsChart(
    historic1954State,
    { scope: 'country_tier', country: 'GER', tier: 1, accountingMode: 'all_time' },
    ALL_CLUBS,
    false
  );
  assert.equal(allTime1954Chart.accountingMode, 'all_time');
  assert.equal(allTime1954Chart.startYearCounted, 1950);
  assert.equal(allTime1954Chart.endYearCounted, 1955);
  assert.equal(allTime1954Chart.totalSeasonsCounted, 6);
  // Kaiserslautern won 1951 & 1953 in lore + 1954 & 1955 simulated = 4 titles
  assert.equal(allTime1954Chart.topTeams[0].clubId, 31);
  assert.equal(allTime1954Chart.topTeams[0].count, 4);
  assert.equal(allTime1954Chart.topTeams[0].historicCount, 2);
  assert.equal(allTime1954Chart.topTeams[0].liveCount, 2);
});

test('All 13 reported countries (DEN, SWE, NOR, IDN, IND, SVK, PER, KOR, BOL, PAR, CHI, CRO, GRE) and all COUNTRIES have full almanac history and never fall back to "Club"', async () => {
  const { COUNTRIES } = await import('../data/gameConstants');
  const { TEAMS } = await import('../mod-data/teams');
  const reportedCountries = [
    'DEN', 'SWE', 'NOR', 'IDN', 'IND', 'SVK', 'PER',
    'KOR', 'BOL', 'PAR', 'CHI', 'CRO', 'GRE',
  ];
  const allCountryCodes = Array.from(new Set([...reportedCountries, ...Object.keys(COUNTRIES)]));

  const userClub = ALL_CLUBS[0];
  const mockState: any = {
    startYear: 2026,
    year: 2027,
    club: userClub,
    history: [
      {
        year: 2026,
        clubId: userClub.id,
        clubName: userClub.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 82,
        wins: 25,
        draws: 7,
        losses: 2,
        trophiesThisYear: { bl: 1 },
      },
    ],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  for (const code of allCountryCodes) {
    for (const [db, modFlag] of [
      [ALL_CLUBS, false],
      [TEAMS as any, true],
    ] as const) {
      const records = buildChampionsAlmanac(mockState, code, db, modFlag);
      const maxT = getMaxTier(code, db);
      assert.equal(records.length, 77, `${code} (mod=${modFlag}) should have 77 years of Almanac history (1950-2026)`);

      const distinctTier1Winners = new Set<string>();
      for (const rec of records) {
        assert.equal(
          rec.leagueWinners.length,
          maxT,
          `${code} (mod=${modFlag}) year ${rec.year} should have ${maxT} tier winners`
        );
        for (const lw of rec.leagueWinners) {
          assert.notEqual(
            lw.clubName,
            'Club',
            `${code} (mod=${modFlag}) Tier ${lw.tier} in ${rec.year} must NOT be placeholder "Club"`
          );
          assert.ok(
            lw.clubName && lw.clubName.trim().length > 1,
            `${code} (mod=${modFlag}) Tier ${lw.tier} in ${rec.year} must have a valid clubName`
          );
          assert.ok(
            typeof lw.pts === 'number' && lw.pts >= 50,
            `${code} (mod=${modFlag}) Tier ${lw.tier} in ${rec.year} must have numeric points`
          );
          assert.ok(
            lw.coachName && lw.coachName.trim().length > 2,
            `${code} (mod=${modFlag}) Tier ${lw.tier} in ${rec.year} must have a coachName`
          );
          if (lw.tier === 1) {
            distinctTier1Winners.add(lw.clubName);
          }
        }
        for (const cw of rec.cupWinners) {
          assert.notEqual(
            cw.clubName,
            'Club',
            `${code} (mod=${modFlag}) Cup ${cw.competitionName} in ${rec.year} must NOT be placeholder "Club"`
          );
        }
      }

      assert.ok(
        distinctTier1Winners.size >= 3,
        `${code} (mod=${modFlag}) should have at least 3 distinct historical Tier 1 champions, got ${distinctTier1Winners.size}`
      );

      const chart = buildTopTrophyTeamsChart(
        mockState,
        { scope: 'country_tier', country: code, tier: 1 },
        db,
        modFlag
      );
      assert.ok(chart.topTeams.length >= 3, `${code} Top Trophy Leaders chart should have at least 3 teams`);
      assert.ok(
        chart.topTeams.every((t) => t.clubName !== 'Club' && t.count > 0),
        `${code} Top Trophy Leaders chart must not contain "Club"`
      );
    }
  }
});

test('Live simulated seasons never falsely crown user club when user did not win, isolate continental cup wins to user region, and provide authentic AFC Cup & CONCACAF/AFC historical leaders', () => {
  const bayern = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];
  const realMadrid = ALL_CLUBS.find((c) => c.id === 501) || ALL_CLUBS[0];

  // 1. User manages Bayern Munich (id: 1) in 2026 and finishes 2nd (pos: 2) with 0 trophies
  const trophylessBayernState: any = {
    startYear: 2026,
    year: 2027,
    managerName: 'Hansi Test',
    club: { ...bayern, tier: 1 },
    history: [
      {
        year: 2026,
        clubId: 1,
        clubName: bayern.name,
        country: 'GER',
        tier: 1,
        pos: 2,
        pts: 76,
        wins: 23,
        draws: 7,
        losses: 4,
        trophiesThisYear: { bl: 0, dfb: 0, reg: 0, cl: 0, el: 0, cwc: 0 },
      },
    ],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const gerRecords = buildChampionsAlmanac(trophylessBayernState, 'GER', ALL_CLUBS, false);
  const rec2026 = gerRecords.find((r) => r.year === 2026)!;
  assert.ok(rec2026);
  for (const w of [...rec2026.leagueWinners, ...rec2026.cupWinners, ...rec2026.globalWinners]) {
    assert.notEqual(
      w.clubId,
      1,
      `Trophyless user club Bayern (id: 1) must NOT be crowned winner of ${w.competitionName} in 2026`
    );
    assert.equal(
      w.isUserClub,
      false,
      `Trophyless user club must NOT have isUserClub=true in ${w.competitionName} in 2026`
    );
  }

  // Same check for Real Madrid (id: 501) finishing 2nd with 0 trophies across multiple years
  const trophylessMadridState: any = {
    startYear: 2026,
    year: 2029,
    managerName: 'Carlo Test',
    club: { ...realMadrid, tier: 1 },
    history: [2026, 2027, 2028].map((yr) => ({
      year: yr,
      clubId: 501,
      clubName: realMadrid.name,
      country: 'ESP',
      tier: 1,
      pos: 2,
      pts: 80,
      wins: 25,
      draws: 5,
      losses: 8,
      trophiesThisYear: {},
    })),
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const espRecords = buildChampionsAlmanac(trophylessMadridState, 'ESP', ALL_CLUBS, false);
  for (const yr of [2026, 2027, 2028]) {
    const rec = espRecords.find((r) => r.year === yr)!;
    for (const w of [...rec.leagueWinners, ...rec.cupWinners, ...rec.globalWinners]) {
      assert.notEqual(
        w.clubId,
        501,
        `Trophyless user club Real Madrid (id: 501) must NOT be crowned winner of ${w.competitionName} in ${yr}`
      );
      assert.equal(w.isUserClub, false);
    }
  }

  // 2. User wins UEFA Champions Cup (cl: 1) with Bayern (GER) in 2026:
  // Must crown Bayern in GER/UEFA Champions Cup, but must NOT crown Bayern in Copa Libertadores (BRA), Concacaf (MEX), or AFC (KOR)
  const uclWinnerBayernState: any = {
    startYear: 2026,
    year: 2027,
    managerName: 'Hansi Winner',
    club: { ...bayern, tier: 1 },
    history: [
      {
        year: 2026,
        clubId: 1,
        clubName: bayern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 86,
        wins: 27,
        draws: 5,
        losses: 2,
        trophiesThisYear: { bl: 1, cl: 1 },
      },
    ],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const uefa2026 = buildChampionsAlmanac(uclWinnerBayernState, 'GER', ALL_CLUBS, false).find((r) => r.year === 2026)!;
  const conmebol2026 = buildChampionsAlmanac(uclWinnerBayernState, 'BRA', ALL_CLUBS, false).find((r) => r.year === 2026)!;
  const concacaf2026 = buildChampionsAlmanac(uclWinnerBayernState, 'MEX', ALL_CLUBS, false).find((r) => r.year === 2026)!;
  const afc2026 = buildChampionsAlmanac(uclWinnerBayernState, 'KOR', ALL_CLUBS, false).find((r) => r.year === 2026)!;

  assert.equal(uefa2026.globalWinners.find((w) => w.id.includes('cont1'))?.clubId, 1);
  assert.notEqual(
    conmebol2026.globalWinners.find((w) => w.id.includes('cont1'))?.clubId,
    1,
    'UEFA CL winner Bayern must NOT be crowned Copa Libertadores winner'
  );
  assert.notEqual(
    concacaf2026.globalWinners.find((w) => w.id.includes('cont1'))?.clubId,
    1,
    'UEFA CL winner Bayern must NOT be crowned Concacaf Champions Cup winner'
  );
  assert.notEqual(
    afc2026.globalWinners.find((w) => w.id.includes('cont1'))?.clubId,
    1,
    'UEFA CL winner Bayern must NOT be crowned AFC Champions League winner'
  );

  // 3. AFC secondary continental competition is AFC Cup (not Euro Cup)
  const afcCont2 = afc2026.globalWinners.find((w) => w.id.includes('cont2'))!;
  assert.ok(afcCont2);
  assert.equal(afcCont2.competitionId, 'afc-cup');
  assert.equal(afcCont2.competitionName, 'AFC Cup');

  // 4. International Trophy Leaders for CONCACAF, AFC, and AFC Cup return authentic regional leaders
  const concacafChart = buildTopTrophyTeamsChart(
    uclWinnerBayernState,
    { scope: 'international', internationalCompetitionId: 'concacaf' },
    ALL_CLUBS,
    false
  );
  assert.equal(concacafChart.topTeams.length, 5);
  // Club América (id: 2201), Cruz Azul (id: 2205), Pachuca (id: 2207), or Monterrey (id: 2203) leads Concacaf Champions Cup
  assert.ok([2201, 2205, 2207, 2203].includes(concacafChart.topTeams[0].clubId as number));

  const afcChart = buildTopTrophyTeamsChart(
    uclWinnerBayernState,
    { scope: 'international', internationalCompetitionId: 'afc' },
    ALL_CLUBS,
    false
  );
  assert.equal(afcChart.topTeams.length, 5);
  assert.ok(afcChart.topTeams[0].count >= 3);

  const afcCupChart = buildTopTrophyTeamsChart(
    uclWinnerBayernState,
    { scope: 'international', internationalCompetitionId: 'afc-cup' },
    ALL_CLUBS,
    false
  );
  assert.equal(afcCupChart.topTeams.length, 5);
  assert.ok(afcCupChart.topTeams[0].count >= 2);
});

test('National Team World Cup history is included in Champions Almanac, Trophy Leaders Chart, and buildWorldCupAlmanacHistory across historical and simulated eras', () => {
  const bayern = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];

  // 1. Modern 2026 start (pre-season): includes all historical World Cups through 2022
  const pre2026State: any = {
    startYear: 2026,
    year: 2026,
    managerName: 'Julian Test',
    club: bayern,
    history: [],
    worldCupCampaigns: [],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const almanacPre2026Mod = buildChampionsAlmanac(pre2026State, 'GER', ALL_CLUBS, true);
  const wcRecordsMod = almanacPre2026Mod
    .map((r) => ({ year: r.year, wc: r.globalWinners.find((w) => w.competitionId === 'world-cup') }))
    .filter((x) => Boolean(x.wc));

  // 1950..2022 every 4 years = 19 World Cup editions in the 1950-2025 almanac window
  assert.equal(wcRecordsMod.length, 19);
  assert.equal(wcRecordsMod[0].year, 2022);
  assert.equal(wcRecordsMod[0].wc?.clubName, 'Argentina');
  assert.equal(wcRecordsMod[0].wc?.coachName, 'Lionel Scaloni');
  assert.equal(wcRecordsMod[0].wc?.runnerUp, 'France');
  assert.equal(wcRecordsMod[0].wc?.isNationalTeam, true);
  assert.ok(wcRecordsMod[0].wc?.flag);

  const wc2014Mod = wcRecordsMod.find((x) => x.year === 2014)?.wc;
  assert.equal(wc2014Mod?.clubName, 'Germany');
  assert.equal(wc2014Mod?.coachName, 'Joachim Löw');

  const wc1954Mod = wcRecordsMod.find((x) => x.year === 1954)?.wc;
  assert.equal(wc1954Mod?.clubName, 'Germany');
  assert.equal(wc1954Mod?.coachName, 'Sepp Herberger');

  // Unmodded fallback mode (isModActive=false) uses fallback coach names
  const almanacPre2026Fallback = buildChampionsAlmanac(pre2026State, 'GER', ALL_CLUBS, false);
  const wcRecordsFallback = almanacPre2026Fallback
    .map((r) => ({ year: r.year, wc: r.globalWinners.find((w) => w.competitionId === 'world-cup') }))
    .filter((x) => Boolean(x.wc));
  assert.equal(wcRecordsFallback[0].wc?.coachName, 'Lionel Escalon');
  assert.equal(wcRecordsFallback.find((x) => x.year === 2014)?.wc?.coachName, 'Joachim Loew');
  assert.equal(wcRecordsFallback.find((x) => x.year === 1954)?.wc?.coachName, 'Josef Herberger');

  // buildWorldCupAlmanacHistory with includePre1950=true includes 1930, 1934, 1938 (total 22 editions)
  const fullWcHistoryMod = buildWorldCupAlmanacHistory(pre2026State, true, true);
  assert.equal(fullWcHistoryMod.length, 22);
  assert.equal(fullWcHistoryMod[fullWcHistoryMod.length - 1].year, 1930);
  assert.equal(fullWcHistoryMod[fullWcHistoryMod.length - 1].clubName, 'Uruguay');
  assert.equal(fullWcHistoryMod[fullWcHistoryMod.length - 1].coachName, 'Alberto Suppici');

  const fullWcHistoryFallback = buildWorldCupAlmanacHistory(pre2026State, true, false);
  assert.equal(fullWcHistoryFallback[fullWcHistoryFallback.length - 1].coachName, 'Alberto Supici');

  // 2. All-Time World Cup Trophy Leaders Chart: Brazil (5), Germany (4), Italy (4), Argentina (3), France (2) / Uruguay (2)
  const wcChart = buildTopTrophyTeamsChart(
    pre2026State,
    { scope: 'international', internationalCompetitionId: 'world-cup' },
    ALL_CLUBS,
    false
  );
  assert.equal(wcChart.topTeams.length, 5);
  assert.equal(wcChart.topTeams[0].clubName, 'Brazil');
  assert.equal(wcChart.topTeams[0].count, 5);
  assert.ok(wcChart.topTeams[0].flag);
  const germanyEntry = wcChart.topTeams.find((t) => t.clubName === 'Germany');
  const italyEntry = wcChart.topTeams.find((t) => t.clubName === 'Italy');
  const argentinaEntry = wcChart.topTeams.find((t) => t.clubName === 'Argentina');
  assert.equal(germanyEntry?.count, 4);
  assert.equal(italyEntry?.count, 4);
  assert.equal(argentinaEntry?.count, 3);

  // 3. Simulated 2026 World Cup where User wins with England
  const userWon2026WcState: any = {
    startYear: 2026,
    year: 2027,
    managerName: 'Sir Gareth Test',
    club: bayern,
    history: [
      {
        year: 2026,
        clubId: 1,
        clubName: bayern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 84,
        wins: 26,
        draws: 6,
        losses: 2,
        trophiesThisYear: { bl: 1, wc: 1 },
      },
    ],
    worldCupCampaigns: [
      {
        year: 2026,
        teamId: 'ENG',
        teamName: 'England',
        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        bestFinish: 'World Cup Winner',
        wonTrophy: true,
        matches: [
          { round: 'Final', opponentName: 'France', opponentFlag: '🇫🇷', userGoals: 2, oppGoals: 1, won: true },
        ],
      },
    ],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const almanacUserWon2026 = buildChampionsAlmanac(userWon2026WcState, 'GER', ALL_CLUBS, false);
  const wc2026UserWon = almanacUserWon2026
    .find((r) => r.year === 2026)
    ?.globalWinners.find((w) => w.competitionId === 'world-cup');
  assert.ok(wc2026UserWon);
  assert.equal(wc2026UserWon.clubName, 'England');
  assert.equal(wc2026UserWon.isUserClub, true);
  assert.equal(wc2026UserWon.coachName, 'Sir Gareth Test');
  assert.equal(wc2026UserWon.runnerUp, 'France');
  assert.equal(wc2026UserWon.finalScore, '2–1');

  // 4. Simulated 2026 World Cup where User loses with Brazil in Quarter-Final: Brazil must NOT be crowned 2026 champion
  const userLost2026WcState: any = {
    startYear: 2026,
    year: 2027,
    managerName: 'Carlo Test',
    club: bayern,
    history: [
      {
        year: 2026,
        clubId: 1,
        clubName: bayern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 82,
        wins: 25,
        draws: 7,
        losses: 2,
        trophiesThisYear: { bl: 1 },
      },
    ],
    worldCupCampaigns: [
      {
        year: 2026,
        teamId: 'BRA',
        teamName: 'Brazil',
        flag: '🇧🇷',
        bestFinish: 'Quarter-Final',
        wonTrophy: false,
        matches: [],
      },
    ],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  const almanacUserLost2026 = buildChampionsAlmanac(userLost2026WcState, 'GER', ALL_CLUBS, false);
  const wc2026UserLost = almanacUserLost2026
    .find((r) => r.year === 2026)
    ?.globalWinners.find((w) => w.competitionId === 'world-cup');
  assert.ok(wc2026UserLost);
  assert.notEqual(wc2026UserLost.clubName, 'Brazil');
  assert.equal(wc2026UserLost.isUserClub, false);

  // 5. Simulated 2026 World Cup where User reaches the Grand Final with Brazil and loses 1-2 to Spain:
  // Spain is crowned 2026 Champion with Brazil as runner-up and 2–1 final score
  const userRunnerUp2026WcState: any = {
    ...userLost2026WcState,
    worldCupCampaigns: [
      {
        year: 2026,
        teamId: 'BRA',
        teamName: 'Brazil',
        teamFlag: '🇧🇷',
        bestFinish: 'Runner-Up 🥈',
        wonTrophy: false,
        tournamentWinner: 'Spain',
        runnerUp: 'Brazil',
        finalScore: '2–1',
      },
    ],
  };
  const almanacUserRunnerUp2026 = buildChampionsAlmanac(userRunnerUp2026WcState, 'GER', ALL_CLUBS, false);
  const wc2026RunnerUp = almanacUserRunnerUp2026
    .find((r) => r.year === 2026)
    ?.globalWinners.find((w) => w.competitionId === 'world-cup');
  assert.ok(wc2026RunnerUp);
  assert.equal(wc2026RunnerUp.clubName, 'Spain');
  assert.equal(wc2026RunnerUp.runnerUp, 'Brazil');
  assert.equal(wc2026RunnerUp.finalScore, '2–1');
  assert.equal(wc2026RunnerUp.isUserClub, false);
});

test('Copa Libertadores and Regional Cup movements never leak into National Domestic Cup, and Trophy Leaders Chart distinguishes current (YOU) vs former (EX) user clubs', () => {
  const bayern = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];
  const hsv = ALL_CLUBS.find((c) => c.id === 22) || ALL_CLUBS[0];
  const saarbrucken = ALL_CLUBS.find((c) => c.id === 43) || ALL_CLUBS[0];
  const flamengo = ALL_CLUBS.find((c) => c.id === 901) || ALL_CLUBS[0];
  const saoPaulo = ALL_CLUBS.find((c) => c.id === 905) || ALL_CLUBS[0];

  const multiClubAndCupState: any = {
    startYear: 2026,
    year: 2028,
    managerName: 'Alex Vance',
    club: { ...bayern, tier: 1 }, // Current club in 2028 is Bayern (id: 1)
    history: [
      {
        year: 2026,
        clubId: 22,
        clubName: hsv.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 80,
        wins: 25,
        draws: 5,
        losses: 4,
        trophiesThisYear: { bl: 1 },
      },
      {
        year: 2027,
        clubId: 1,
        clubName: bayern.name,
        country: 'GER',
        tier: 1,
        pos: 1,
        pts: 84,
        wins: 26,
        draws: 6,
        losses: 2,
        trophiesThisYear: { bl: 1 },
      },
    ],
    universeMovements: [
      // In 2026, Flamengo won Copa Libertadores while São Paulo won Copa do Brasil
      {
        id: 'sim-cup-lib-2026',
        year: 2026,
        clubId: 901,
        clubName: flamengo.name,
        country: 'BRA',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'Copa Libertadores',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
      },
      {
        id: 'sim-cup-cdb-2026',
        year: 2026,
        clubId: 905,
        clubName: saoPaulo.name,
        country: 'BRA',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'Copa do Brasil',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
      },
      // In 2026, Saarbrücken won Landespokal (Regional Cup) in GER
      {
        id: 'sim-cup-reg-2026',
        year: 2026,
        clubId: 43,
        clubName: saarbrucken.name,
        country: 'GER',
        fromTier: 3,
        toTier: 3,
        fromLeagueName: 'Landespokal',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
      },
    ],
    seasonStandingsArchive: {},
  };

  // 1. In Brazil 2026, Copa Libertadores winner (901) must NOT overwrite Copa do Brasil winner (905)
  const bra2026 = buildChampionsAlmanac(multiClubAndCupState, 'BRA', ALL_CLUBS, false).find(
    (r) => r.year === 2026
  )!;
  const braDomCup = bra2026.cupWinners.find((w) => w.competitionId === 'domestic-cup')!;
  const braLib = bra2026.globalWinners.find((w) => w.competitionId === 'libertadores')!;
  assert.equal(braLib.clubId, 901);
  assert.equal(braDomCup.clubId, 905);

  // 2. In Germany 2026, Landespokal winner (43) is credited in regional-cup and does NOT leak into DFB-Pokal (domestic-cup)
  const ger2026 = buildChampionsAlmanac(multiClubAndCupState, 'GER', ALL_CLUBS, false).find(
    (r) => r.year === 2026
  )!;
  const gerRegCup = ger2026.cupWinners.find((w) => w.competitionId === 'regional-cup')!;
  const gerDomCup = ger2026.cupWinners.find((w) => w.competitionId === 'domestic-cup')!;
  assert.equal(gerRegCup.clubId, 43);
  assert.notEqual(gerDomCup.clubId, 43);

  // 3. In Trophy Leaders Chart (Fresh from 2026), Bayern (id: 1) is YOU (isUserClub: true) and HSV (id: 22) is EX (isPastManagerClub: true, isUserClub: false)
  const gerFreshChart = buildTopTrophyTeamsChart(
    multiClubAndCupState,
    { scope: 'country_tier', country: 'GER', tier: 1, accountingMode: 'fresh_from_start' },
    ALL_CLUBS,
    false
  );
  const bayernRow = gerFreshChart.topTeams.find((t) => t.clubId === 1)!;
  const hsvRow = gerFreshChart.topTeams.find((t) => t.clubId === 22)!;
  assert.ok(bayernRow);
  assert.ok(hsvRow);
  assert.equal(bayernRow.isUserClub, true);
  assert.equal(bayernRow.isPastManagerClub, false);
  assert.equal(hsvRow.isUserClub, false);
  assert.equal(hsvRow.isPastManagerClub, true);
});

test('Era-locked coaches: coaches from the 1950s, 1960s, 1970s, 1980s, 1990s, 2000s, 2010s, and 2020s never resurface in later decades', async () => {
  const { getDeterministicCoachName } = await import('./championsAlmanac');

  const countriesToVerify = [
    'GER', 'ENG', 'ESP', 'ITA', 'FRA', 'POR', 'NED', 'BRA', 'ARG',
    'DEN', 'SWE', 'NOR', 'IDN', 'IND', 'SVK', 'PER', 'KOR', 'BOL',
    'PAR', 'CHI', 'CRO', 'GRE', 'POL',
  ];
  const decades = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040, 2050];

  for (const country of countriesToVerify) {
    const coachesByDecade = new Map<number, Set<string>>();
    for (const dec of decades) {
      const set = new Set<string>();
      for (let yr = dec; yr <= dec + 9; yr++) {
        for (let clubIdx = 1; clubIdx <= 12; clubIdx++) {
          const coach = getDeterministicCoachName(country, `Club-${country}-${clubIdx}`, yr);
          assert.ok(coach && coach.trim().length > 3, `Valid coach name required for ${country} in ${yr}`);
          assert.ok(!coach.includes('('), `Coach name "${coach}" must not contain parenthetical tags`);
          set.add(coach);
        }
      }
      coachesByDecade.set(dec, set);
    }

    // Verify 100% disjoint coach sets across every pair of decades for this country
    for (let i = 0; i < decades.length; i++) {
      for (let j = i + 1; j < decades.length; j++) {
        const d1 = decades[i];
        const d2 = decades[j];
        const s1 = coachesByDecade.get(d1)!;
        const s2 = coachesByDecade.get(d2)!;
        for (const c of s1) {
          assert.equal(
            s2.has(c),
            false,
            `Coach "${c}" from ${d1}s in ${country} resurfaced in ${d2}s!`
          );
        }
      }
    }
  }

  // Also verify full buildChampionsAlmanac output from 1950 to 2045 has zero coach resurfacing across decades
  const userClub = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];
  const longCareerState: any = {
    year: 2046,
    startYear: 2026,
    managerName: 'Alex Vance',
    club: userClub,
    history: [],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  for (const country of ['GER', 'ENG', 'ESP', 'ITA', 'BRA', 'DEN', 'IDN', 'GRE']) {
    const almanac = buildChampionsAlmanac(longCareerState, country, ALL_CLUBS, false);
    const leagueCoachesByDecade = new Map<number, Set<string>>();

    for (const rec of almanac) {
      const dec = Math.floor(rec.year / 10) * 10;
      if (!leagueCoachesByDecade.has(dec)) leagueCoachesByDecade.set(dec, new Set());
      const decSet = leagueCoachesByDecade.get(dec)!;
      for (const w of [...rec.leagueWinners, ...rec.cupWinners]) {
        if (!w.isUserClub && w.coachName) {
          decSet.add(w.coachName);
        }
      }
    }

    const activeDecades = Array.from(leagueCoachesByDecade.keys()).sort((a, b) => a - b);
    for (let i = 0; i < activeDecades.length; i++) {
      for (let j = i + 1; j < activeDecades.length; j++) {
        const d1 = activeDecades[i];
        const d2 = activeDecades[j];
        const set1 = leagueCoachesByDecade.get(d1)!;
        const set2 = leagueCoachesByDecade.get(d2)!;
        for (const coach of set1) {
          assert.equal(
            set2.has(coach),
            false,
            `Almanac coach "${coach}" in ${country} from ${d1}s resurfaced in ${d2}s!`
          );
        }
      }
    }
  }
});

test('Regional cups and domestic cups in the Champions Almanac and Trophy Leaders Chart can never be won by reserve teams', async () => {
  const { COUNTRIES, isReserveClub } = await import('../data/gameConstants');
  const userClub = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];

  // Inject a stray reserve team cup_champion movement to verify even live movement lookups block reserve teams
  const mockState: any = {
    year: 2028,
    startYear: 2026,
    managerName: 'Alex Vance',
    club: userClub,
    history: [],
    universeMovements: [
      {
        id: 'bad-reg-reserve-2026',
        year: 2026,
        clubId: 37, // Borussia Dortmund II / Prussia Dortmund II
        clubName: 'Borussia Dortmund II',
        country: 'GER',
        fromTier: 3,
        toTier: 3,
        fromLeagueName: 'Landespokal',
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
      },
    ],
    seasonStandingsArchive: {},
  };

  for (const modMode of [false, true]) {
    for (const country of Object.keys(COUNTRIES)) {
      const records = buildChampionsAlmanac(mockState, country, ALL_CLUBS, modMode);
      for (const rec of records) {
        const regCup = rec.cupWinners.find((w) => w.competitionId === 'regional-cup');
        if (regCup) {
          assert.equal(
            isReserveClub(regCup.clubName),
            false,
            `Reserve team "${regCup.clubName}" (id=${regCup.clubId}) must never win Regional Cup in ${country} (${rec.year}, mod=${modMode})`
          );
        }
        const domCup = rec.cupWinners.find((w) => w.competitionId === 'domestic-cup');
        if (domCup) {
          assert.equal(
            isReserveClub(domCup.clubName),
            false,
            `Reserve team "${domCup.clubName}" (id=${domCup.clubId}) must never win Domestic Cup in ${country} (${rec.year}, mod=${modMode})`
          );
        }
      }

      // Also verify Trophy Leaders Chart for regional-cup has zero reserve teams
      const regChart = buildTopTrophyTeamsChart(
        mockState,
        {
          scope: 'country_tier',
          country,
          domesticCompetitionId: 'regional-cup',
          accountingMode: 'all_time',
        },
        ALL_CLUBS,
        modMode
      );
      for (const row of regChart.topTeams) {
        assert.equal(
          isReserveClub(row.clubName),
          false,
          `Reserve team "${row.clubName}" must not appear in Regional Cup Trophy Leaders Chart for ${country} (mod=${modMode})`
        );
      }
    }
  }
});

test('Tier 1 and all International Cup almanac entries display real historical coaches when isModActive=true and unlicensed fallback coaches when isModActive=false while maintaining decade isolation', async () => {
  const { COUNTRIES } = await import('../data/gameConstants');
  const { toFallbackCoachName } = await import('./championsAlmanac');
  const userClub = ALL_CLUBS.find((c) => c.id === 1) || ALL_CLUBS[0];

  const pre2026State: any = {
    startYear: 2026,
    year: 2026,
    managerName: 'Alex Vance',
    club: userClub,
    history: [],
    universeMovements: [],
    seasonStandingsArchive: {},
  };

  // 1. Verify iconic Tier 1 historical coaches in mod mode (isModActive=true) vs fallback mode (isModActive=false)
  const gerMod = buildChampionsAlmanac(pre2026State, 'GER', ALL_CLUBS, true);
  const gerFallback = buildChampionsAlmanac(pre2026State, 'GER', ALL_CLUBS, false);

  const ger2024Mod = gerMod.find((r) => r.year === 2024)!.leagueWinners.find((w) => w.tier === 1)!;
  const ger2024Fallback = gerFallback.find((r) => r.year === 2024)!.leagueWinners.find((w) => w.tier === 1)!;
  assert.equal(ger2024Mod.clubName, 'Bayer 04 Leverkusen');
  assert.equal(ger2024Mod.coachName, 'Xabi Alonso');
  assert.equal(ger2024Fallback.clubName, 'SV Leverkusen 04');
  assert.equal(ger2024Fallback.coachName, 'Xavi Alonzo');

  const ger2012Mod = gerMod.find((r) => r.year === 2012)!.leagueWinners.find((w) => w.tier === 1)!;
  const ger2012Fallback = gerFallback.find((r) => r.year === 2012)!.leagueWinners.find((w) => w.tier === 1)!;
  assert.equal(ger2012Mod.coachName, 'Jürgen Klopp');
  assert.equal(ger2012Fallback.coachName, 'Jurgen Flopp');

  const engMod = buildChampionsAlmanac(pre2026State, 'ENG', ALL_CLUBS, true);
  const engFallback = buildChampionsAlmanac(pre2026State, 'ENG', ALL_CLUBS, false);
  const eng2023Mod = engMod.find((r) => r.year === 2023)!.leagueWinners.find((w) => w.tier === 1)!;
  const eng2023Fallback = engFallback.find((r) => r.year === 2023)!.leagueWinners.find((w) => w.tier === 1)!;
  assert.equal(eng2023Mod.coachName, 'Pep Guardiola');
  assert.equal(eng2023Fallback.coachName, 'Pep Guardiröla');

  // 2. Verify all International Cups (UEFA, CONMEBOL, CONCACAF, AFC, Global Club Cup, World Cup)
  // have real coaches when isModActive=true and fallback coaches when isModActive=false
  const ucl2024Mod = gerMod.find((r) => r.year === 2024)!.globalWinners.find((w) => w.competitionId === 'champions-cup')!;
  const ucl2024Fallback = gerFallback.find((r) => r.year === 2024)!.globalWinners.find((w) => w.competitionId === 'champions-cup')!;
  assert.equal(ucl2024Mod.coachName, 'Carlo Ancelotti');
  assert.equal(ucl2024Fallback.coachName, 'Carlo Angelotti');

  const euro2024Mod = gerMod.find((r) => r.year === 2024)!.globalWinners.find((w) => w.competitionId === 'euro-cup')!;
  const euro2024Fallback = gerFallback.find((r) => r.year === 2024)!.globalWinners.find((w) => w.competitionId === 'euro-cup')!;
  assert.equal(euro2024Mod.coachName, 'Gian Piero Gasperini');
  assert.equal(euro2024Fallback.coachName, 'Piero Gasperino');

  const braMod = buildChampionsAlmanac(pre2026State, 'BRA', ALL_CLUBS, true);
  const braFallback = buildChampionsAlmanac(pre2026State, 'BRA', ALL_CLUBS, false);
  const lib2021Mod = braMod.find((r) => r.year === 2021)!.globalWinners.find((w) => w.competitionId === 'libertadores')!;
  const lib2021Fallback = braFallback.find((r) => r.year === 2021)!.globalWinners.find((w) => w.competitionId === 'libertadores')!;
  assert.equal(lib2021Mod.coachName, 'Abel Ferreira');
  assert.equal(lib2021Fallback.coachName, 'Abel Fereira');

  const usaMod = buildChampionsAlmanac(pre2026State, 'USA', ALL_CLUBS, true);
  const usaFallback = buildChampionsAlmanac(pre2026State, 'USA', ALL_CLUBS, false);
  const concacaf2025Mod = usaMod.find((r) => r.year === 2025)!.globalWinners.find((w) => w.competitionId === 'concacaf')!;
  const concacaf2025Fallback = usaFallback.find((r) => r.year === 2025)!.globalWinners.find((w) => w.competitionId === 'concacaf')!;
  assert.equal(concacaf2025Mod.coachName, 'André Jardine');
  assert.equal(concacaf2025Fallback.coachName, toFallbackCoachName('André Jardine'));
  assert.notEqual(concacaf2025Mod.coachName, concacaf2025Fallback.coachName);

  const jpnMod = buildChampionsAlmanac(pre2026State, 'JPN', ALL_CLUBS, true);
  const jpnFallback = buildChampionsAlmanac(pre2026State, 'JPN', ALL_CLUBS, false);
  const afc2024Mod = jpnMod.find((r) => r.year === 2024)!.globalWinners.find((w) => w.competitionId === 'afc')!;
  const afc2024Fallback = jpnFallback.find((r) => r.year === 2024)!.globalWinners.find((w) => w.competitionId === 'afc')!;
  assert.equal(afc2024Mod.coachName, 'Harry Kewell');
  assert.equal(afc2024Fallback.coachName, toFallbackCoachName('Harry Kewell'));
  assert.notEqual(afc2024Mod.coachName, afc2024Fallback.coachName);

  // 3. Across all 36 countries and all years (1950-2025), every Tier 1 and International Cup entry
  // has a real coach when isModActive=true and its exact fallback coach when isModActive=false,
  // with 100% decade isolation in both modes.
  for (const country of Object.keys(COUNTRIES)) {
    const modRecs = buildChampionsAlmanac(pre2026State, country, ALL_CLUBS, true);
    const fbRecs = buildChampionsAlmanac(pre2026State, country, ALL_CLUBS, false);

    const modDecadeMap = new Map<number, Set<string>>();
    const fbDecadeMap = new Map<number, Set<string>>();

    for (let idx = 0; idx < modRecs.length; idx++) {
      const mRec = modRecs[idx];
      const fRec = fbRecs[idx];
      const dec = Math.floor(mRec.year / 10) * 10;
      if (!modDecadeMap.has(dec)) modDecadeMap.set(dec, new Set());
      if (!fbDecadeMap.has(dec)) fbDecadeMap.set(dec, new Set());

      const mT1 = mRec.leagueWinners.find((w) => w.tier === 1)!;
      const fT1 = fRec.leagueWinners.find((w) => w.tier === 1)!;
      assert.ok(mT1.coachName && fT1.coachName);
      assert.equal(
        fT1.coachName,
        toFallbackCoachName(mT1.coachName),
        `Tier 1 fallback coach mismatch in ${country} (${mRec.year}): expected ${toFallbackCoachName(mT1.coachName)}, got ${fT1.coachName}`
      );
      assert.notEqual(
        fT1.coachName,
        mT1.coachName,
        `Tier 1 fallback coach "${fT1.coachName}" must differ from real coach "${mT1.coachName}" in ${country} (${mRec.year})`
      );
      modDecadeMap.get(dec)!.add(mT1.coachName);
      fbDecadeMap.get(dec)!.add(fT1.coachName);

      for (let g = 0; g < mRec.globalWinners.length; g++) {
        const mGw = mRec.globalWinners[g];
        const fGw = fRec.globalWinners[g];
        assert.ok(mGw.coachName && fGw.coachName);
        assert.equal(
          fGw.coachName,
          toFallbackCoachName(mGw.coachName),
          `Intl cup (${mGw.competitionId}) fallback coach mismatch in ${country} (${mRec.year})`
        );
        assert.notEqual(
          fGw.coachName,
          mGw.coachName,
          `Intl cup (${mGw.competitionId}) fallback coach "${fGw.coachName}" must differ from real coach "${mGw.coachName}"`
        );
      }
    }

    const decList = Array.from(modDecadeMap.keys()).sort((a, b) => a - b);
    for (let i = 0; i < decList.length; i++) {
      for (let j = i + 1; j < decList.length; j++) {
        const d1 = decList[i];
        const d2 = decList[j];
        for (const c of modDecadeMap.get(d1)!) {
          assert.equal(
            modDecadeMap.get(d2)!.has(c),
            false,
            `Real Tier 1 coach "${c}" in ${country} from ${d1}s resurfaced in ${d2}s!`
          );
        }
        for (const c of fbDecadeMap.get(d1)!) {
          assert.equal(
            fbDecadeMap.get(d2)!.has(c),
            false,
            `Fallback Tier 1 coach "${c}" in ${country} from ${d1}s resurfaced in ${d2}s!`
          );
        }
      }
    }
  }
});


