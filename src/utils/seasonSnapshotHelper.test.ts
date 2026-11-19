import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSeasonSnapshotOptions,
  formatSeasonYearSpan,
  resolveSeasonSnapshotView,
  resolveStandingsForSeasonSnapshot,
  resolveTierForSeasonSelection,
} from './seasonSnapshotHelper';
import { getNamingRightsOffers, LiveStandingsRow } from '../engine/liveSimVisualEngine';
import { Club, GameState, MatchdayOutcome, SeasonHistory } from '../types';

const vizela: Club = {
  id: 241,
  name: 'F.C. Vizela',
  tier: 1,
  country: 'POR',
  baseOvr: 75,
  stadium: 14500,
  fanBase: 480000,
  color: '#1D4ED8',
};

const historyEntries: SeasonHistory[] = [
  {
    year: 2026,
    clubName: 'F.C. Vizela',
    clubId: 241,
    color: '#1D4ED8',
    leagueTag: 'Liga Portugal 2',
    leagueCss: '',
    ovr: 68,
    tier: 2,
    wins: 16,
    draws: 10,
    losses: 8,
    pts: 58,
    pos: 4,
    gf: 52,
    ga: 37,
    att: 4210,
    util: 70,
    trophyIcons: '',
    trophiesThisYear: {},
    country: 'POR',
    last5: ['W', 'D', 'W', 'L', 'W'],
  },
  {
    year: 2027,
    clubName: 'F.C. Vizela',
    clubId: 241,
    color: '#1D4ED8',
    leagueTag: 'Liga Portugal 2',
    leagueCss: '',
    ovr: 71,
    tier: 2,
    wins: 23,
    draws: 6,
    losses: 5,
    pts: 75,
    pos: 1,
    gf: 68,
    ga: 29,
    att: 5640,
    util: 92,
    trophyIcons: '🏆',
    trophiesThisYear: { lower: 1 },
    status: 'P',
    country: 'POR',
    last5: ['W', 'W', 'W', 'D', 'W'],
  },
  {
    year: 2029,
    clubName: 'F.C. Vizela',
    clubId: 241,
    color: '#1D4ED8',
    leagueTag: 'Primeira Liga',
    leagueCss: '',
    ovr: 74,
    tier: 1,
    wins: 17,
    draws: 8,
    losses: 9,
    pts: 59,
    pos: 5,
    gf: 54,
    ga: 40,
    att: 10200,
    util: 78,
    trophyIcons: '',
    trophiesThisYear: {},
    country: 'POR',
    last5: ['W', 'L', 'W', 'D', 'W'],
  },
];

const mockState = {
  club: vizela,
  year: 2030,
  history: historyEntries,
  seasonStandingsArchive: {
    2027: {
      2: [
        {
          pos: 1,
          id: 241,
          name: 'F.C. Vizela',
          color: '#1D4ED8',
          mp: 34,
          w: 23,
          d: 6,
          l: 5,
          gf: 68,
          ga: 29,
          gd: '+39',
          pts: 75,
          isUser: true,
          status: 'C',
        },
        {
          pos: 2,
          id: 242,
          name: 'Leixões S.C.',
          color: '#DC2626',
          mp: 34,
          w: 20,
          d: 8,
          l: 6,
          gf: 55,
          ga: 31,
          gd: '+24',
          pts: 68,
          isUser: false,
          status: 'P',
        },
      ],
    },
  },
} as unknown as GameState;

test('formatSeasonYearSpan formats standard and century-wrap years cleanly', () => {
  assert.equal(formatSeasonYearSpan(2030), '2030–31');
  assert.equal(formatSeasonYearSpan(2099), '2099–00');
});

test('buildSeasonSnapshotOptions lists current season first followed by past seasons newest-first', () => {
  const opts = buildSeasonSnapshotOptions(mockState);
  assert.equal(opts.length, 4);
  assert.equal(opts[0].isCurrent, true);
  assert.equal(opts[0].yearSpan, '2030–31');
  assert.equal(opts[0].historyIndex, null);
  assert.equal(opts[0].tier, 1);

  assert.equal(opts[1].yearSpan, '2029–30');
  assert.equal(opts[1].historyIndex, 2);
  assert.equal(opts[1].pos, 5);
  assert.equal(opts[1].pts, 59);
  assert.equal(opts[1].tier, 1);

  assert.equal(opts[2].yearSpan, '2027–28');
  assert.equal(opts[2].status, 'P');
  assert.equal(opts[2].tier, 2);

  assert.equal(opts[3].yearSpan, '2026–27');
  assert.equal(opts[3].historyIndex, 0);
  assert.equal(opts[3].tier, 2);
});

test('resolveSeasonSnapshotView switches cleanly between live mid-season and archived history entries', () => {
  const md17: MatchdayOutcome = {
    matchday: 17,
    opponentId: 201,
    opponentName: 'S.C. Braga',
    opponentColor: '#DC2626',
    opponentOvr: 77,
    isHome: true,
    userGoals: 2,
    oppGoals: 1,
    result: 'W',
    ptsEarned: 3,
    runningWins: 10,
    runningW: 10,
    runningDraws: 3,
    runningD: 3,
    runningLosses: 4,
    runningL: 4,
    runningPts: 33,
    runningPoints: 33,
    runningGf: 28,
    runningGa: 17,
    runningGd: 11,
    runningPos: 3,
    runningPosition: 3,
  };

  const liveView = resolveSeasonSnapshotView({
    state: mockState,
    selectedHistoryIndex: null,
    playedMatchdays: 17,
    currentOutcome: md17,
    activeSchedule: [md17],
    totalMds: 34,
  });
  assert.equal(liveView.isHistorical, false);
  assert.equal(liveView.yearSpan, '2030–31');
  assert.equal(liveView.tier, 1);
  assert.equal(liveView.country, 'POR');
  assert.equal(liveView.w, 10);
  assert.equal(liveView.d, 3);
  assert.equal(liveView.l, 4);
  assert.equal(liveView.winRateExact, 58.8);
  assert.match(liveView.subtitle, /MD 17/);

  const archived2027 = resolveSeasonSnapshotView({
    state: mockState,
    selectedHistoryIndex: 1,
    playedMatchdays: 17,
    currentOutcome: md17,
    activeSchedule: [md17],
    totalMds: 34,
  });
  assert.equal(archived2027.isHistorical, true);
  assert.equal(archived2027.yearSpan, '2027–28');
  assert.equal(archived2027.tier, 2);
  assert.equal(archived2027.country, 'POR');
  assert.equal(archived2027.w, 23);
  assert.equal(archived2027.d, 6);
  assert.equal(archived2027.l, 5);
  assert.equal(archived2027.pos, 1);
  assert.equal(archived2027.pts, 75);
  assert.equal(archived2027.gf, 68);
  assert.equal(archived2027.ga, 29);
  assert.equal(archived2027.att, 5640);
  assert.equal(archived2027.ovr, 71);
  assert.deepEqual(archived2027.last5, ['W', 'W', 'W', 'D', 'W']);
});

test('resolveStandingsForSeasonSnapshot adjusts league, year, tier, and rows to match archive selection', () => {
  const liveRows: LiveStandingsRow[] = [
    {
      pos: 1,
      id: 200,
      name: 'S.L. Benfica',
      color: '#DC2626',
      mp: 17,
      w: 14,
      d: 2,
      l: 1,
      gf: 38,
      ga: 11,
      gd: '+27',
      pts: 44,
      isUser: false,
      isPromotionZone: true,
      isRelegationZone: false,
    },
    {
      pos: 3,
      id: 241,
      name: 'F.C. Vizela',
      color: '#1D4ED8',
      mp: 17,
      w: 10,
      d: 3,
      l: 4,
      gf: 28,
      ga: 17,
      gd: '+11',
      pts: 33,
      isUser: true,
      isPromotionZone: true,
      isRelegationZone: false,
    },
  ];

  // Live selection stays on 2030-31 Tier 1 Primeira Liga
  const liveSnapshot = resolveSeasonSnapshotView({
    state: mockState,
    selectedHistoryIndex: null,
    playedMatchdays: 17,
    activeSchedule: [],
    totalMds: 34,
  });
  const liveStandingsCard = resolveStandingsForSeasonSnapshot({
    state: mockState,
    snapshot: liveSnapshot,
    liveStandings: liveRows,
    playedMatchdays: 17,
    clubsDb: [vizela],
  });
  assert.equal(liveStandingsCard.isHistorical, false);
  assert.equal(liveStandingsCard.year, 2030);
  assert.equal(liveStandingsCard.tier, 1);
  assert.equal(liveStandingsCard.leagueName, 'Primeira Liga');
  assert.equal(liveStandingsCard.rows[0].name, 'S.L. Benfica');

  // Selecting 2027-28 archived season switches to exact archived Tier 2 Liga Portugal 2 table
  const hist2027Snapshot = resolveSeasonSnapshotView({
    state: mockState,
    selectedHistoryIndex: 1,
    playedMatchdays: 17,
    activeSchedule: [],
    totalMds: 34,
  });
  const hist2027Standings = resolveStandingsForSeasonSnapshot({
    state: mockState,
    snapshot: hist2027Snapshot,
    liveStandings: liveRows,
    playedMatchdays: 17,
    clubsDb: [vizela],
  });
  assert.equal(hist2027Standings.isHistorical, true);
  assert.equal(hist2027Standings.year, 2027);
  assert.equal(hist2027Standings.tier, 2);
  assert.equal(hist2027Standings.leagueName, 'Liga Portugal 2');
  assert.match(hist2027Standings.subtitle, /Liga Portugal 2 · 2027–28 Final/);
  assert.equal(hist2027Standings.rows[0].name, 'F.C. Vizela');
  assert.equal(hist2027Standings.rows[0].pts, 75);
  assert.equal(hist2027Standings.rows[0].isUser, true);
  assert.equal(hist2027Standings.rows[1].name, 'Leixões S.C.');

  // Selecting older 2026-27 season (pruned from archive) reconstructs Tier 2 table with exact user finish
  const hist2026Snapshot = resolveSeasonSnapshotView({
    state: mockState,
    selectedHistoryIndex: 0,
    playedMatchdays: 17,
    activeSchedule: [],
    totalMds: 34,
  });
  const hist2026Standings = resolveStandingsForSeasonSnapshot({
    state: mockState,
    snapshot: hist2026Snapshot,
    liveStandings: liveRows,
    playedMatchdays: 17,
    clubsDb: [vizela],
  });
  assert.equal(hist2026Standings.isHistorical, true);
  assert.equal(hist2026Standings.year, 2026);
  assert.equal(hist2026Standings.tier, 2);
  assert.equal(hist2026Standings.leagueName, 'Liga Portugal 2');
  const user2026Row = hist2026Standings.rows.find((r) => r.isUser);
  assert.ok(user2026Row);
  assert.equal(user2026Row.pos, 4);
  assert.equal(user2026Row.pts, 58);
  assert.equal(user2026Row.gd, '+15');
});

test('resolveTierForSeasonSelection syncs division tier and country when switching archive seasons', () => {
  const sampleDb: Club[] = [
    vizela,
    { id: 242, name: 'Leixões S.C.', tier: 2, country: 'POR', baseOvr: 66, stadium: 9000, color: '#DC2626' },
    { id: 101, name: 'SC Bochum 1848', tier: 2, country: 'GER', baseOvr: 76, stadium: 26000, color: '#1D4ED8' },
    { id: 102, name: 'FC Bavaria', tier: 1, country: 'GER', baseOvr: 88, stadium: 75000, color: '#DC2626' },
  ];

  // Live season -> Tier 1 POR
  assert.deepEqual(
    resolveTierForSeasonSelection({
      nextSeason: 'current',
      history: historyEntries,
      currentClub: vizela,
      clubsDb: sampleDb,
    }),
    { country: 'POR', tier: 1 }
  );

  // Archived 2027 (index 1) -> Tier 2 POR
  assert.deepEqual(
    resolveTierForSeasonSelection({
      nextSeason: 1,
      history: historyEntries,
      currentClub: vizela,
      clubsDb: sampleDb,
    }),
    { country: 'POR', tier: 2 }
  );

  // Archived 2029 (index 2) -> Tier 1 POR
  assert.deepEqual(
    resolveTierForSeasonSelection({
      nextSeason: 2,
      history: historyEntries,
      currentClub: vizela,
      clubsDb: sampleDb,
    }),
    { country: 'POR', tier: 1 }
  );
});

test('getNamingRightsOffers strips F.C. / C.F. Os prefixes cleanly and returns 15 distinct English partners', () => {
  const vizelaOffers = getNamingRightsOffers(vizela, 75, 25000);
  assert.equal(vizelaOffers.length, 15);
  assert.equal(vizelaOffers[0].partnerName, 'Vizela Spark Energy');
  assert.equal(vizelaOffers[0].stadiumDisplayName, 'Vizela Spark Park');
  assert.equal(vizelaOffers[0].repRequired, 0);

  const belenensesOffers = getNamingRightsOffers(
    { ...vizela, name: 'C.F. Os Belenenses' },
    60,
    19856
  );
  assert.equal(belenensesOffers[0].partnerName, 'Belenenses Spark Energy');
  assert.equal(belenensesOffers[0].stadiumDisplayName, 'Belenenses Spark Park');
  assert.equal(
    vizelaOffers.some((o) => /stadion/i.test(o.stadiumDisplayName)),
    false
  );
});
