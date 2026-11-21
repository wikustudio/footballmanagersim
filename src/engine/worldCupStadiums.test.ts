import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getHostNation } from './internationalEngine';
import {
  WorldCupVenueStage,
  computeWorldCupAttendance,
  getHostCountryStadiumRoster,
  getWorldCupMatchVenue,
  inferWorldCupVenueStage,
  mapWorldCupDirectiveToTactic,
} from './worldCupStadiums';

const ALL_STAGES: WorldCupVenueStage[] = [
  'group_1',
  'group_2',
  'group_3',
  'quarter_final',
  'semi_final',
  'final',
];

const VALID_STYLES = new Set([
  'continental_bowl',
  'olympic_track',
  'english_box',
  'open_terrace',
]);

test('All World Cup editions (1950-2062) resolve 6 distinct authentic host-country venues', () => {
  const hostCodesSeen = new Set<string>();

  for (let year = 1950; year <= 2062; year += 4) {
    const host = getHostNation(year);
    hostCodesSeen.add(host.code);

    const roster = getHostCountryStadiumRoster(host, year);
    assert.ok(
      roster.length >= 6,
      `Expected >= 6 host stadiums for ${host.name} (${year}), got ${roster.length}`
    );

    const stageVenues = ALL_STAGES.map((stage) => getWorldCupMatchVenue(host, stage, year));
    const uniqueNames = new Set(stageVenues.map((v) => `${v.name}|${v.city}`));
    assert.equal(
      uniqueNames.size,
      ALL_STAGES.length,
      `Expected 6 unique host venues across stages for ${host.name} (${year})`
    );

    for (const v of stageVenues) {
      assert.ok(v.name.length > 2, `Missing venue name for ${host.name} (${year})`);
      assert.ok(v.city.length > 1, `Missing venue city for ${host.name} (${year})`);
      assert.ok(
        v.capacity >= 12000 && v.capacity <= 120000,
        `Unexpected capacity ${v.capacity} for ${v.name}`
      );
      assert.ok(
        VALID_STYLES.has(v.stadiumStyle),
        `Invalid stadiumStyle ${v.stadiumStyle} for ${v.name}`
      );
    }

    // Grand Final venue must always match the edition's canonical host stadium under floodlights
    const finalVenue = getWorldCupMatchVenue(host, 'final', year);
    assert.equal(
      finalVenue.name,
      host.stadium,
      `Grand Final venue mismatch for ${year} (${host.name})`
    );
    assert.equal(finalVenue.timeOfDay, 'night');
    assert.equal(finalVenue.isFinalVenue, true);
  }

  assert.equal(hostCodesSeen.size, 17, 'Expected all 17 World Cup host nations covered');
});

test('Edition-specific World Cup Finals map to their authentic historical venues', () => {
  // USA: 1994 Rose Bowl vs 2026 MetLife Stadium
  const usa1994Final = getWorldCupMatchVenue(getHostNation(1994), 'final', 1994);
  const usa2026Final = getWorldCupMatchVenue(getHostNation(2026), 'final', 2026);
  assert.equal(usa1994Final.name, 'Rose Bowl');
  assert.equal(usa2026Final.name, 'MetLife Stadium');

  // Germany: 1974 Olympiastadion Munich vs 2006/2038 Olympiastadion Berlin (with olympic track!)
  const ger1974Final = getWorldCupMatchVenue(getHostNation(1974), 'final', 1974);
  const ger2038Final = getWorldCupMatchVenue(getHostNation(2038), 'final', 2038);
  assert.equal(ger1974Final.city, 'Munich');
  assert.equal(ger2038Final.city, 'Berlin');
  assert.equal(ger2038Final.stadiumStyle, 'olympic_track');

  // Italy: 1990 Stadio Olimpico (Rome) vs 2050 San Siro (Milan)
  const ita1990Final = getWorldCupMatchVenue(getHostNation(1990), 'final', 1990);
  const ita2050Final = getWorldCupMatchVenue(getHostNation(2050), 'final', 2050);
  assert.equal(ita1990Final.name, 'Stadio Olimpico');
  assert.equal(ita1990Final.stadiumStyle, 'olympic_track');
  assert.equal(ita2050Final.name, 'San Siro');
  assert.equal(ita2050Final.stadiumStyle, 'english_box');
});

test('World Cup attendance stays realistic (93%-100% sellout, full house for Final & Host)', () => {
  const host = getHostNation(2026);
  const groupVenue = getWorldCupMatchVenue(host, 'group_1', 2026);
  const finalVenue = getWorldCupMatchVenue(host, 'final', 2026);

  const normalGroupAtt = computeWorldCupAttendance(groupVenue, 'group_1', false);
  assert.ok(normalGroupAtt >= Math.round(groupVenue.capacity * 0.93));
  assert.ok(normalGroupAtt <= groupVenue.capacity);

  const hostGroupAtt = computeWorldCupAttendance(groupVenue, 'group_1', true);
  assert.equal(hostGroupAtt, groupVenue.capacity);

  const finalAtt = computeWorldCupAttendance(finalVenue, 'final', false);
  assert.equal(finalAtt, finalVenue.capacity);
});

test('inferWorldCupVenueStage and mapWorldCupDirectiveToTactic resolve accurately', () => {
  assert.equal(inferWorldCupVenueStage('group', 'Group A · Matchday 1'), 'group_1');
  assert.equal(inferWorldCupVenueStage('group', 'Group A · Matchday 2'), 'group_2');
  assert.equal(inferWorldCupVenueStage('group', 'Group A · Matchday 3'), 'group_3');
  assert.equal(inferWorldCupVenueStage('knockout', 'Quarter-Final'), 'quarter_final');
  assert.equal(inferWorldCupVenueStage('knockout', 'Semi-Final'), 'semi_final');
  assert.equal(inferWorldCupVenueStage('final', 'World Cup™ Grand Final'), 'final');

  assert.equal(mapWorldCupDirectiveToTactic('high_press'), 'Gegenpress');
  assert.equal(mapWorldCupDirectiveToTactic('controlled_possession'), 'Tiki-Taka');
  assert.equal(mapWorldCupDirectiveToTactic('low_block_counter'), 'Counter-Attack');
  assert.equal(mapWorldCupDirectiveToTactic('direct_wing_play'), 'Wing Play');
  assert.equal(mapWorldCupDirectiveToTactic('controlled_possession', 'all_out_attack'), 'Gegenpress');
  assert.equal(mapWorldCupDirectiveToTactic('high_press', 'park_the_bus'), 'Park the Bus');
});

test('WorldCupLiveMatchArena renders host-country stadiums using StadiumBowl3D engine across open play and penalty shootouts', () => {
  const arenaPath = path.resolve(process.cwd(), 'src/components/WorldCupLiveMatchArena.tsx');
  const src = fs.readFileSync(arenaPath, 'utf8');

  assert.ok(src.includes("import { StadiumBowl3D } from './StadiumBowl3D'"));
  assert.ok(src.includes('<StadiumBowl3D'));
  assert.ok(src.includes('stadiumStyle={venue.stadiumStyle}'));
  assert.ok(src.includes('capacity={venue.capacity}'));
  assert.ok(src.includes('attendance={attendance}'));
  assert.ok(src.includes('hideTopHud={true}'));
  assert.ok(src.includes('matchTelemetry.stadiumPhase'));
  assert.ok(src.includes('shootoutState={shootoutChoreoState}'));
  assert.ok(src.includes('customBottomBoardText={`${venue.name} · ${venue.city}`}'));
  // Ensure legacy 2D SVG penalty box fallback was completely removed
  assert.ok(!src.includes('wc-spot-glow'), 'Shootout must render inside StadiumBowl3D, not legacy 2D SVG');
});

test('InternationalTournamentModal launches Group Matchday 1 live in the 3D stadium engine', () => {
  const modalPath = path.resolve(process.cwd(), 'src/components/InternationalTournamentModal.tsx');
  const src = fs.readFileSync(modalPath, 'utf8');

  assert.ok(
    src.includes('setGroupMatchdayRevealed(0);\n    setGroupLiveMatchday(1);'),
    'handleLaunchGroupStage must start Group Matchday 1 live in 3D instead of skipping to Matchday 2'
  );
  assert.ok(
    src.includes('initialSavedState?.groupMatchdayRevealed ?? 0'),
    'Fresh World Cup group stage should initialize groupMatchdayRevealed to 0'
  );
});

test('computeLiveMatchChoreography generates authentic 3D penalty shootout formation, shot arc, and GK saves', async () => {
  const { computeLiveMatchChoreography } = await import('./liveSimVisualEngine');

  const setup = computeLiveMatchChoreography({
    tactic: 'Tiki-Taka',
    phase: 'setpiece',
    tick: 1,
    isLive: true,
    shootout: { active: true, taker: 'home', scored: null, round: 1, kickIndex: 0 },
  });
  assert.equal(setup.duelRing?.kind, 'penalty');
  assert.equal(setup.shotTrajectory, null);
  assert.equal(setup.homePlayers[10].u, 160);
  assert.equal(setup.awayPlayers[0].u, 196);
  // Waiting outfield players line up along the halfway line
  assert.ok(Math.abs(setup.homePlayers[2].u) <= 15);
  assert.ok(Math.abs(setup.awayPlayers[2].u) <= 15);

  const scored = computeLiveMatchChoreography({
    tactic: 'Tiki-Taka',
    phase: 'goal',
    tick: 2,
    isLive: true,
    shootout: { active: true, taker: 'home', scored: true, round: 1, kickIndex: 1 },
  });
  assert.equal(scored.ball.inNet, true);
  assert.equal(scored.shotTrajectory?.isGoal, true);
  assert.equal(scored.crowdCelebration.level, 'goal_eruption');

  const saved = computeLiveMatchChoreography({
    tactic: 'Tiki-Taka',
    phase: 'setpiece',
    tick: 3,
    isLive: true,
    shootout: { active: true, taker: 'away', scored: false, round: 2, kickIndex: 4 },
  });
  assert.equal(saved.ball.inNet, false);
  assert.equal(saved.duelRing?.kind, 'save');
  assert.equal(saved.shotTrajectory?.isGoal, false);
  assert.equal(saved.homePlayers[0].pose, 'diving');
});

