import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { checkSupercupEligibility } from './liveSimVisualEngine';
import { Club, GameState } from '../types';

const makeClub = (id: number, name: string, tier: number, baseOvr: number, country = 'GER'): Club => ({
  id,
  name,
  tier,
  baseOvr,
  color: '#18191F',
  stadium: 50000,
  country,
});

const bayern = makeClub(1, 'FC Bayern München', 1, 92);
const dortmund = makeClub(3, 'Borussia Dortmund', 1, 86);
const freiburg = makeClub(12, 'SC Freiburg', 1, 80);
const frankfurt = makeClub(8, 'Eintracht Frankfurt', 1, 82);
const userClub = makeClub(50, 'VfB Stuttgart', 1, 81);
const clubsDb = [bayern, dortmund, freiburg, frankfurt, userClub];

const makeBaseState = (overrides: Partial<GameState> = {}): GameState => ({
  managerName: 'Coach',
  nationality: 'GER',
  startYear: 2026,
  year: 2027,
  tactic: 'Gegenpressing',
  club: userClub,
  budget: 35000,
  euroStatus: null,
  reputation: 78,
  mode: 'standard',
  maxOvrCap: 92,
  investmentsThisSeason: 0,
  sponsorsPitchedThisSeason: 0,
  stadiumExpandedThisSeason: 0,
  regTransfersThisSeason: 0,
  keyTransfersThisSeason: 0,
  jobMarketSearchesThisSeason: 0,
  isNewSeasonRender: false,
  initialRenderDone: true,
  clWins: 0,
  consecutiveTitles: 0,
  trophyDrought: 0,
  activePromise: false,
  boardWarning: false,
  boardExpectsSuccess: false,
  boardGracePeriod: 0,
  boardUltimatum: false,
  seasonsInDebt: 0,
  totals: { matches: 34, wins: 20, draws: 7, losses: 7, att: 900000, trophies: 1, domTrophies: 1, intTrophies: 0 },
  history: [],
  trophies: [],
  youthPipeline: [],
  ...overrides,
});

test('Supercup: DFB-Pokal winner plays actual Bundesliga champion (SC Freiburg), NOT highest-OVR Bayern Munich', () => {
  const state = makeBaseState({
    history: [
      {
        year: 2026,
        clubName: userClub.name,
        clubId: userClub.id,
        color: userClub.color,
        leagueTag: 'GER 1',
        leagueCss: '',
        ovr: 81,
        tier: 1,
        wins: 18,
        draws: 8,
        losses: 8,
        pts: 62,
        pos: 4,
        gf: 60,
        ga: 40,
        att: 52000,
        util: 95,
        trophyIcons: '🏆',
        trophiesThisYear: { dfb: 1 },
      },
    ],
    seasonStandingsArchive: {
      2026: {
        1: [
          { id: freiburg.id, name: freiburg.name, pos: 1, w: 24, d: 6, l: 4, pts: 78, gf: 70, ga: 28, gd: 42, ovr: 80, color: freiburg.color },
          { id: bayern.id, name: bayern.name, pos: 2, w: 23, d: 5, l: 6, pts: 74, gf: 80, ga: 35, gd: 45, ovr: 92, color: bayern.color },
          { id: dortmund.id, name: dortmund.name, pos: 3, w: 20, d: 6, l: 8, pts: 66, gf: 68, ga: 41, gd: 27, ovr: 86, color: dortmund.color },
          { id: userClub.id, name: userClub.name, pos: 4, w: 18, d: 8, l: 8, pts: 62, gf: 60, ga: 40, gd: 20, ovr: 81, color: userClub.color },
        ] as any,
      },
    },
  });

  const elig = checkSupercupEligibility(state, clubsDb);
  assert.ok(elig, 'DFB-Pokal winner must be eligible for DFL-Supercup');
  assert.equal(elig.opponent.id, freiburg.id, 'Opponent must be SC Freiburg (actual league champion), not Bayern Munich');
  assert.equal(elig.opponent.name, 'SC Freiburg');
  assert.equal(elig.userQualificationLabel, 'Cup Winner');
  assert.equal(elig.opponentQualificationLabel, 'League Champion');
});

test('Supercup: DFB-Pokal winner resolves League Champion from universeMovements if standings archive is absent', () => {
  const state = makeBaseState({
    history: [
      {
        year: 2026,
        clubName: userClub.name,
        clubId: userClub.id,
        color: userClub.color,
        leagueTag: 'GER 2',
        leagueCss: '',
        ovr: 76,
        tier: 2,
        wins: 22,
        draws: 6,
        losses: 6,
        pts: 72,
        pos: 1, // Won Tier 2 + DFB-Pokal, newly promoted to Tier 1 — must NOT be misclassified as Bundesliga champion
        gf: 66,
        ga: 30,
        att: 48000,
        util: 95,
        trophyIcons: '🏆',
        trophiesThisYear: { dfb: 1 },
      },
    ],
    universeMovements: [
      {
        id: 'm1',
        year: 2026,
        country: 'GER',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: '1. Bundesliga',
        toLeagueName: '1. Bundesliga',
        type: 'title_won',
        clubId: freiburg.id,
        clubName: freiburg.name,
        clubColor: freiburg.color,
      },
    ],
  });

  const elig = checkSupercupEligibility(state, clubsDb);
  assert.ok(elig);
  assert.equal(elig.opponent.id, freiburg.id);
  assert.equal(elig.userQualificationLabel, 'Cup Winner');
  assert.equal(elig.opponentQualificationLabel, 'League Champion');
});

test('Supercup: Domestic Double winner plays actual Tier 1 League Runner-Up, NOT highest-OVR 4th-place club', () => {
  const state = makeBaseState({
    history: [
      {
        year: 2026,
        clubName: userClub.name,
        clubId: userClub.id,
        color: userClub.color,
        leagueTag: 'GER 1',
        leagueCss: '',
        ovr: 84,
        tier: 1,
        wins: 25,
        draws: 6,
        losses: 3,
        pts: 81,
        pos: 1,
        gf: 78,
        ga: 26,
        att: 56000,
        util: 98,
        trophyIcons: '🏆🏆',
        trophiesThisYear: { bl: 1, dfb: 1 },
      },
    ],
    seasonStandingsArchive: {
      2026: {
        1: [
          { id: userClub.id, name: userClub.name, pos: 1, w: 25, d: 6, l: 3, pts: 81, gf: 78, ga: 26, gd: 52, ovr: 84, color: userClub.color },
          { id: dortmund.id, name: dortmund.name, pos: 2, w: 22, d: 7, l: 5, pts: 73, gf: 72, ga: 34, gd: 38, ovr: 86, color: dortmund.color },
          { id: freiburg.id, name: freiburg.name, pos: 3, w: 20, d: 6, l: 8, pts: 66, gf: 60, ga: 38, gd: 22, ovr: 80, color: freiburg.color },
          { id: bayern.id, name: bayern.name, pos: 4, w: 19, d: 6, l: 9, pts: 63, gf: 70, ga: 44, gd: 26, ovr: 92, color: bayern.color },
        ] as any,
      },
    },
  });

  const elig = checkSupercupEligibility(state, clubsDb);
  assert.ok(elig);
  assert.equal(elig.opponent.id, dortmund.id, 'Double winner must face 2nd-place Borussia Dortmund');
  assert.equal(elig.userQualificationLabel, 'Double Winner');
  assert.equal(elig.opponentQualificationLabel, 'League Runner-Up');
});

test('Supercup: Bundesliga Champion plays actual DFB-Pokal Winner (Eintracht Frankfurt), NOT Bayern Munich', () => {
  const state = makeBaseState({
    history: [
      {
        year: 2026,
        clubName: userClub.name,
        clubId: userClub.id,
        color: userClub.color,
        leagueTag: 'GER 1',
        leagueCss: '',
        ovr: 84,
        tier: 1,
        wins: 25,
        draws: 6,
        losses: 3,
        pts: 81,
        pos: 1,
        gf: 78,
        ga: 26,
        att: 56000,
        util: 98,
        trophyIcons: '🏆',
        trophiesThisYear: { bl: 1 },
      },
    ],
    universeMovements: [
      {
        id: 'c-cl',
        year: 2026,
        country: 'GER',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'Champions Cup',
        toLeagueName: 'Champions Cup',
        type: 'cup_champion',
        clubId: bayern.id,
        clubName: bayern.name,
        clubColor: bayern.color,
      },
      {
        id: 'c-dfb',
        year: 2026,
        country: 'GER',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: 'DFB-Pokal',
        toLeagueName: 'DFB-Pokal',
        type: 'cup_champion',
        clubId: frankfurt.id,
        clubName: frankfurt.name,
        clubColor: frankfurt.color,
      },
    ],
  });

  const elig = checkSupercupEligibility(state, clubsDb);
  assert.ok(elig);
  assert.equal(elig.opponent.id, frankfurt.id, 'League champion must face actual DFB-Pokal winner Eintracht Frankfurt');
  assert.equal(elig.userQualificationLabel, 'League Champion');
  assert.equal(elig.opponentQualificationLabel, 'Cup Winner');
});

test('Supercup: Tier 2 League Champion promoted to Tier 1 without DFB-Pokal is NOT falsely eligible for Supercup', () => {
  const state = makeBaseState({
    history: [
      {
        year: 2026,
        clubName: userClub.name,
        clubId: userClub.id,
        color: userClub.color,
        leagueTag: 'GER 2',
        leagueCss: '',
        ovr: 75,
        tier: 2,
        wins: 22,
        draws: 6,
        losses: 6,
        pts: 72,
        pos: 1,
        gf: 65,
        ga: 32,
        att: 45000,
        util: 90,
        trophyIcons: '',
        trophiesThisYear: {},
      },
    ],
  });

  const elig = checkSupercupEligibility(state, clubsDb);
  assert.equal(elig, null, 'Promoted Tier 2 champion without DFB-Pokal must not trigger Supercup');
});

test('Poaching modal (EventUI) renders exactly one decline/stay CTA with zero redundant Stay at Current Club copy', () => {
  const src = fs.readFileSync('src/components/EventUI.tsx', 'utf-8');
  const declineMatches = src.match(/Decline & Remain at Current Club/g) || [];
  const stayMatches = src.match(/Stay at Current Club/g) || [];
  const forcedChecks = src.match(/!event\.isForced && \(/g) || [];

  assert.equal(declineMatches.length, 1, 'Expected exactly one Decline & Remain at Current Club button');
  assert.equal(stayMatches.length, 0, 'Expected zero redundant Stay at Current Club headings/buttons');
  assert.equal(forcedChecks.length, 1, 'Expected exactly one non-forced decline block in job offers modal');
  assert.ok(src.includes('+3 Morale Loyalty Boost'), 'Expected +3 Morale Loyalty Boost inline badge preserved for proactive poaching');
});
