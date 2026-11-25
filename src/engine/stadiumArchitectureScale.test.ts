import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  computeStadiumArchitecture,
  STADIUM_STYLE_OPTIONS,
} from './liveSimVisualEngine';

test('Amateur grounds (<5,000) use authentic single-main-stand layout with no enclosed stands or corners', () => {
  for (const cap of [1200, 2500, 4900]) {
    for (const style of STADIUM_STYLE_OPTIONS) {
      const arch = computeStadiumArchitecture(cap, style.id);
      assert.equal(arch.standLayout, 'single_main', `cap=${cap} style=${style.id}`);
      assert.equal(arch.isAmateurGround, true);
      assert.equal(arch.isSemiProGround, false);
      assert.equal(arch.isMegaArena, false);
      assert.equal(arch.hasTopStand, true);
      assert.equal(arch.hasBottomStand, false);
      assert.equal(arch.hasHomeEndStand, false);
      assert.equal(arch.hasAwayEndStand, false);
      assert.equal(arch.hasCorners, false);
      assert.equal(arch.isRoundedBowl, false);
      assert.equal(arch.hasUpperRing, false);
      assert.equal(arch.hasFullRoofWrap, false);
      assert.equal(arch.facadeHeight, 0);
      assert.equal(arch.hasMainStandShedRoof, cap >= 1800);
    }
  }
});

test('Semi-pro grounds (5,000-9,999) transition to two-sided layout (main stand + home end terrace)', () => {
  for (const cap of [5000, 7500, 9500]) {
    const arch = computeStadiumArchitecture(cap, 'open_terrace');
    assert.equal(arch.standLayout, 'two_sided');
    assert.equal(arch.isAmateurGround, false);
    assert.equal(arch.isSemiProGround, true);
    assert.equal(arch.hasTopStand, true);
    assert.equal(arch.hasHomeEndStand, true);
    assert.equal(arch.hasBottomStand, false);
    assert.equal(arch.hasAwayEndStand, false);
    assert.equal(arch.hasCorners, false);
    assert.equal(arch.hasFloodlightPylons, true);
  }
});

test('60,000+ Mega-Arenas deliver a dramatic architectural scale jump across all stadium styles', () => {
  for (const style of STADIUM_STYLE_OPTIONS) {
    const mid = computeStadiumArchitecture(25000, style.id);
    const large45 = computeStadiumArchitecture(45000, style.id);
    const mega62 = computeStadiumArchitecture(62000, style.id);
    const mega75 = computeStadiumArchitecture(75000, style.id);
    const colossus110 = computeStadiumArchitecture(110000, style.id);
    const max150 = computeStadiumArchitecture(150000, style.id);

    assert.equal(mid.isMegaArena, false);
    assert.equal(large45.isMegaArena, false);
    assert.equal(mega62.isMegaArena, true);
    assert.equal(mega62.standLayout, 'mega_arena');
    assert.equal(mega62.hasFullRoofWrap, true);
    assert.equal(mega62.hasCantileverRoof, true);
    assert.equal(mega62.hasFacadeRibs, true);
    assert.equal(mega62.hasFloodlightPylons, false);
    assert.ok(mega62.deckCount >= 3, `Expected 3+ decks at 62k for ${style.id}`);
    assert.ok(colossus110.deckCount === 4, `Expected 4 decks at 110k for ${style.id}`);

    // Noticeable scale leap from 45k -> 62k -> 75k -> 110k -> 150k
    assert.ok(
      mega62.tierHeight > large45.tierHeight * 1.25,
      `Expected 62k tierHeight (${mega62.tierHeight}) > 1.25x 45k (${large45.tierHeight}) for ${style.id}`
    );
    assert.ok(
      mega62.standDepth > large45.standDepth * 1.18,
      `Expected 62k standDepth (${mega62.standDepth}) > 1.18x 45k (${large45.standDepth}) for ${style.id}`
    );
    assert.ok(
      mega62.facadeHeight > large45.facadeHeight * 1.4,
      `Expected 62k facadeHeight (${mega62.facadeHeight}) > 1.4x 45k (${large45.facadeHeight}) for ${style.id}`
    );
    assert.ok(mega75.tierHeight > mega62.tierHeight);
    assert.ok(colossus110.tierHeight > mega75.tierHeight);
    assert.ok(max150.tierHeight >= colossus110.tierHeight);

    // Every capacity stays inside safe SVG projection framing (<= 365 half-width)
    for (const prof of [mid, large45, mega62, mega75, colossus110, max150]) {
      const halfProjectedWidth = (prof.outerU * 0.62 + prof.outerV * 0.68) * prof.zoomFactor;
      assert.ok(
        halfProjectedWidth <= 365,
        `Projected half-width ${halfProjectedWidth.toFixed(1)} exceeded 365 for cap=${prof.clampedCapacity} style=${style.id}`
      );
    }
  }
});

test('StadiumBowl3D gates foreground stands and renders amateur surround & mega-arena facade markers', () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/StadiumBowl3D.tsx'),
    'utf-8'
  );
  assert.ok(src.includes('data-stand-layout={standGeom.standLayout}'));
  assert.ok(src.includes('data-testid="amateur-ground-surround"'));
  assert.ok(src.includes('data-testid="amateur-clubhouse"'));
  assert.ok(src.includes('data-testid="foreground-bottom-stand"'));
  assert.ok(src.includes("standGeom.isMegaArena ? 'mega-arena-facade' : 'stadium-exterior-facade'"));
  assert.ok(src.includes('data-testid="mega-arena-roof"'));
  assert.ok(src.includes('data-testid="colossus-signature-arch"'));
  assert.ok(src.includes('data-testid="angular-corner-stands"'));
  assert.ok(src.includes('data-testid="open-corner-gable-walls"'));
  // Exterior 3D facade skirt & plaza must be gated to isometric/inspection so endzone camera has zero floating walls
  assert.ok(
    src.includes("(camera === 'isometric' || camera === 'inspection')"),
    'Expected isometric/inspection camera gating for exterior facade & plaza'
  );
  assert.ok(
    src.includes('const isEnclosedBox = !standGeom.isRoundedBowl && standGeom.hasCorners;'),
    'Expected full-width angular box exterior facade handling'
  );
  assert.ok(src.includes('data-testid="german-wallanlage-embankment"'));
  assert.ok(src.includes('data-testid="german-floodlight-masts"'));
  assert.ok(src.includes('data-testid="german-facade-portals"'));
  assert.ok(src.includes('data-testid="german-crush-barriers"'));
});


