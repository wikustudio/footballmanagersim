import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCommercialLevelFromFacilities,
  getHqScaleSpec,
  computeProjectedBoardTextLayout,
  buildBehindGoalBoardCopy,
  getFanSectionAislePositions,
  isCoordOnFanAisle,
  computeCurvaBannerWithLogoLayout,
  getStadiumArchitectureRemodelCostK,
  isStadiumStyleOwned,
  resolveClubStatureLabel,
} from './campusAndBowlGeometry';

test('Commercial HQ scales cleanly from L1 to L5 as Academy and Medical Center grow', () => {
  assert.equal(computeCommercialLevelFromFacilities(1, 1), 1);
  assert.equal(computeCommercialLevelFromFacilities(2, 1), 2);
  assert.equal(computeCommercialLevelFromFacilities(2, 2), 2);
  assert.equal(computeCommercialLevelFromFacilities(3, 2), 3);
  assert.equal(computeCommercialLevelFromFacilities(3, 3), 3);
  assert.equal(computeCommercialLevelFromFacilities(4, 3), 4);
  assert.equal(computeCommercialLevelFromFacilities(4, 4), 4);
  assert.equal(computeCommercialLevelFromFacilities(5, 4), 5);
  assert.equal(computeCommercialLevelFromFacilities(5, 5), 5);

  const l1 = getHqScaleSpec(1);
  const l3 = getHqScaleSpec(3);
  const l5 = getHqScaleSpec(5);

  assert.ok(l1.centralHeight < l3.centralHeight && l3.centralHeight < l5.centralHeight);
  assert.ok(l1.centralFloors < l3.centralFloors && l3.centralFloors < l5.centralFloors);
  assert.equal(l1.hasEastWing, false);
  assert.equal(l3.hasEastWing, true);
  assert.equal(l3.hasWestWing, true);
  assert.equal(l5.hasPenthouse, true);
  assert.equal(l5.hasSkyCrown, true);
});

test('Behind-goal projected board text scales to projected board span without overflowing', () => {
  const label = buildBehindGoalBoardCopy('1. FC Magdeburg', 'ultras');
  assert.equal(label, 'FORTRESS CURVA · MAGDEBURG');

  // Small stadium (larger zoom, longer pixel span)
  const smallLayout = computeProjectedBoardTextLayout(
    { x: 180, y: 200 },
    { x: 310, y: 260 },
    label,
    { maxFontPx: 6.4, minFontPx: 3.4, maxFillRatio: 0.84 }
  );

  // Massive stadium (smaller zoomFactor, shorter projected pixel span)
  const massiveLayout = computeProjectedBoardTextLayout(
    { x: 240, y: 230 },
    { x: 318, y: 265 },
    label,
    { maxFontPx: 6.4, minFontPx: 3.4, maxFillRatio: 0.84 }
  );

  assert.ok(massiveLayout.fontSize <= smallLayout.fontSize);
  assert.ok(massiveLayout.usableSpanPx < smallLayout.usableSpanPx);
  if (massiveLayout.textLength !== undefined) {
    assert.ok(massiveLayout.textLength <= massiveLayout.usableSpanPx + 0.1);
  }
  assert.ok(massiveLayout.angleDeg >= -90 && massiveLayout.angleDeg <= 90);
});

test('Curva banner with embedded club logo centers logo left of text and scales with board span', () => {
  const wide = computeCurvaBannerWithLogoLayout(
    { x: 170, y: 195 },
    { x: 320, y: 265 },
    'FORTRESS CURVA'
  );
  const compact = computeCurvaBannerWithLogoLayout(
    { x: 230, y: 225 },
    { x: 295, y: 256 },
    'FORTRESS CURVA'
  );

  assert.ok(wide.logoSize >= compact.logoSize);
  assert.ok(wide.logoX < 0);
  assert.ok(wide.logoX + wide.logoSize < wide.textX);
  assert.ok(compact.angleDeg >= -90 && compact.angleDeg <= 90);
});

test('Fan section radial aisles divide stands cleanly and exclude seated spectators on stairs', () => {
  const smallAisles = getFanSectionAislePositions(
    { clampedCapacity: 6000, scaleBand: 'small' },
    'end'
  );
  const largeAisles = getFanSectionAislePositions(
    { clampedCapacity: 75000, scaleBand: 'massive' },
    'end'
  );

  assert.equal(smallAisles.length, 2);
  assert.equal(largeAisles.length, 4);
  assert.equal(isCoordOnFanAisle(-0.66, largeAisles, 0.045), true);
  assert.equal(isCoordOnFanAisle(0.0, largeAisles, 0.045), false);

  const trackSmallEndAisles = getFanSectionAislePositions(
    { clampedCapacity: 15000, scaleBand: 'compact', hasRunningTrack: true },
    'end'
  );
  const trackMassiveEndAisles = getFanSectionAislePositions(
    { clampedCapacity: 75000, scaleBand: 'massive', hasRunningTrack: true },
    'end'
  );
  assert.deepEqual(trackSmallEndAisles, [0]);
  assert.deepEqual(trackMassiveEndAisles, [-0.36, 0.36]);
});

test('Stadium architecture remodeling cost scales cleanly by tier, capacity, and ownership', () => {
  const t1Large = getStadiumArchitectureRemodelCostK(60000, 1, 1.0);
  const t3Med = getStadiumArchitectureRemodelCostK(15000, 3, 1.0);
  const t7Small = getStadiumArchitectureRemodelCostK(2500, 7, 1.0);

  assert.ok(t1Large > t3Med && t3Med > t7Small);
  assert.ok(t7Small >= 25);

  assert.equal(isStadiumStyleOwned('auto', 'english_box', undefined, []), true);
  assert.equal(isStadiumStyleOwned('english_box', 'english_box', undefined, []), true);
  assert.equal(isStadiumStyleOwned('olympic_track', 'english_box', undefined, []), false);
  assert.equal(isStadiumStyleOwned('olympic_track', 'english_box', undefined, ['olympic_track']), true);
});

test('Club stature label reflects tier, OVR, and silverware prestige', () => {
  assert.equal(resolveClubStatureLabel(1, 92, 4), 'Global Superpower');
  assert.equal(resolveClubStatureLabel(1, 82, 1), 'Continental Contender');
  assert.equal(resolveClubStatureLabel(1, 74, 0), 'Top-Flight Established');
  assert.equal(resolveClubStatureLabel(2, 70, 0), 'Promotion Challenger');
  assert.equal(resolveClubStatureLabel(7, 49, 0), 'Grassroots Heritage');
});

