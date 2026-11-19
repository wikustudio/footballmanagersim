import test from 'node:test';
import assert from 'node:assert/strict';
import { getClubCampusColors } from './liveSimVisualEngine';
import {
  resolveClubBannerTheme,
  buildCreativeFanSectionConfig,
} from './fanSectionDesign';
import { StadiumPolicy } from '../types';

test('Club banner theme is strictly locked to club colors and never injects off-brand colors', () => {
  const blueClub = getClubCampusColors({ id: 1, name: 'SC Bochum 1848', color: '#005CA9' });
  const greenClub = getClubCampusColors({ id: 2, name: 'Sporting Lisbon', color: '#008057' });
  const whiteClub = getClubCampusColors({ id: 3, name: 'Real Madrid', color: '#FFFFFF' });

  for (const palette of [blueClub, greenClub, whiteClub]) {
    const theme = resolveClubBannerTheme(palette);
    assert.equal(theme.primary, palette.primary);
    assert.equal(theme.secondary, palette.secondary);
    assert.equal(theme.bannerFill, palette.primary);
    assert.equal(theme.bannerStroke, palette.secondary);
    assert.equal(theme.smokePrimary, palette.primary);
    assert.equal(theme.smokeSecondary, palette.secondary);

    // Must never use unrelated hardcoded amber/sky/red/emerald colors
    for (const col of [
      theme.primary,
      theme.secondary,
      theme.bannerFill,
      theme.bannerStroke,
      theme.spectatorTertiary,
      theme.smokePrimary,
      theme.smokeSecondary,
    ]) {
      assert.notEqual(col.toUpperCase(), '#F59E0B');
      assert.notEqual(col.toUpperCase(), '#38BDF8');
      assert.notEqual(col.toUpperCase(), '#DC2626');
    }
  }

  // Light primary gets dark readable text; dark primary gets crisp white text
  assert.equal(resolveClubBannerTheme(blueClub).bannerText, '#FFFFFF');
  assert.equal(resolveClubBannerTheme(whiteClub).bannerText, '#18191F');
});

test('Creative fan sections only appear in Balanced Tradition and Fortress Curva, while Executive Hospitality and Grassroots reduce vibrancy', () => {
  const club = { id: 101, name: '1. FC Magdeburg', color: '#0054A6' };

  // Deterministic across repeated calls for all policies
  const policies: StadiumPolicy[] = ['balanced', 'ultras', 'family', 'commercial'];
  for (const policy of policies) {
    assert.deepEqual(
      buildCreativeFanSectionConfig(club, policy),
      buildCreativeFanSectionConfig(club, policy)
    );
  }

  // Fortress Curva (ultras): full creative fan sections + peak vibrancy
  const ultrasCfg = buildCreativeFanSectionConfig(club, 'ultras');
  assert.equal(ultrasCfg.creativeFanSectionsEnabled, true);
  assert.equal(ultrasCfg.vibrancyLevel, 'high');
  assert.equal(ultrasCfg.curvaBannerTitle, 'FORTRESS CURVA');
  assert.equal(ultrasCfg.railMiniBanners.length, 4);
  assert.equal(ultrasCfg.topStandMiniBanners.length, 4);
  assert.equal(ultrasCfg.twoPoleBanners.length, 5);
  assert.equal(ultrasCfg.hasCapoDrums, true);
  assert.equal(ultrasCfg.hasTickerConfetti, true);
  assert.ok(ultrasCfg.tifoOpacity > 0.35);

  // Balanced Tradition (balanced): full creative fan sections + medium vibrancy
  const balancedCfg = buildCreativeFanSectionConfig(club, 'balanced');
  assert.equal(balancedCfg.creativeFanSectionsEnabled, true);
  assert.equal(balancedCfg.vibrancyLevel, 'medium');
  assert.ok(balancedCfg.curvaBannerTitle.length >= 6);
  assert.equal(balancedCfg.railMiniBanners.length, 4);
  assert.equal(balancedCfg.topStandMiniBanners.length, 4);
  assert.equal(balancedCfg.twoPoleBanners.length, 4);
  assert.equal(balancedCfg.hasCapoDrums, true);
  assert.equal(balancedCfg.hasPennantGarland, true);
  assert.ok(balancedCfg.tifoOpacity > 0.25);

  // Grassroots & Family (family): reduced vibrancy, no creative fan sections
  const familyCfg = buildCreativeFanSectionConfig(club, 'family');
  assert.equal(familyCfg.creativeFanSectionsEnabled, false);
  assert.equal(familyCfg.vibrancyLevel, 'low');
  assert.equal(familyCfg.railMiniBanners.length, 0);
  assert.equal(familyCfg.topStandMiniBanners.length, 0);
  assert.equal(familyCfg.twoPoleBanners.length, 0);
  assert.equal(familyCfg.hasCapoDrums, false);
  assert.equal(familyCfg.hasPennantGarland, false);
  assert.equal(familyCfg.hasTickerConfetti, false);
  assert.equal(familyCfg.tifoOpacity, 0);
  assert.ok(familyCfg.flagCount <= 1);

  // Executive Hospitality (commercial): reduced vibrancy, no creative fan sections
  const commercialCfg = buildCreativeFanSectionConfig(club, 'commercial');
  assert.equal(commercialCfg.creativeFanSectionsEnabled, false);
  assert.equal(commercialCfg.vibrancyLevel, 'low');
  assert.equal(commercialCfg.railMiniBanners.length, 0);
  assert.equal(commercialCfg.topStandMiniBanners.length, 0);
  assert.equal(commercialCfg.twoPoleBanners.length, 0);
  assert.equal(commercialCfg.hasCapoDrums, false);
  assert.equal(commercialCfg.hasPennantGarland, false);
  assert.equal(commercialCfg.hasTickerConfetti, false);
  assert.equal(commercialCfg.tifoOpacity, 0);
  assert.equal(commercialCfg.flagCount, 0);

  // Different clubs get varied creative tifo choreography patterns
  const patterns = new Set(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
      (id) => buildCreativeFanSectionConfig({ id, name: `Club ${id}` }, 'balanced').tifoPattern
    )
  );
  assert.ok(patterns.size >= 3, `Expected varied tifo patterns across clubs, got ${patterns.size}`);
});
