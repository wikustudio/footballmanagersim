import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { simulateAiLeagues } from './simulateAiLeagues';
import { buildDeterministicDivisionTable, resolveDivisionClubs } from './standingsEngine';
import { ALL_CLUBS } from '../data/clubsData';
import { Club } from '../types';

test('Germany Tier 1 AI league simulation produces multiple distinct champions & #2 challengers across 30 seasons', () => {
  let clubs = ALL_CLUBS.map((c) => ({ ...c }));
  // Pick a neutral lower-tier user club so Germany Tier 1 simulates freely
  const userClub = clubs.find((c) => c.tier >= 3 && c.country === 'GER') || clubs[clubs.length - 1];
  const champions = new Set<string>();
  const topTwoAppearances = new Set<string>();

  for (let yr = 2026; yr < 2056; yr++) {
    const sim = simulateAiLeagues(clubs, userClub.id, yr, []);
    const standingsArchive = (sim as any).standingsArchive || {};
    const gerTier1 = standingsArchive[1] || [];
    if (gerTier1.length >= 2) {
      champions.add(gerTier1[0].name);
      topTwoAppearances.add(gerTier1[0].name);
      topTwoAppearances.add(gerTier1[1].name);
    }
    clubs = sim.map((c: Club) => ({ ...c }));
  }

  assert.ok(
    champions.size >= 3,
    `Expected at least 3 distinct German Tier 1 champions over 30 seasons, got ${Array.from(champions).join(', ')}`
  );
  assert.ok(
    topTwoAppearances.size >= 4,
    `Expected at least 4 distinct German Tier 1 top-2 finishers over 30 seasons, got ${Array.from(topTwoAppearances).join(', ')}`
  );
});

test('standingsEngine rotates #1/#2 German Tier 1 title rivals across seasons when user manages a non-Bayern club', () => {
  const userClub = ALL_CLUBS.find((c) => c.id === 3 && c.country === 'GER')!; // Borussia Dortmund / Prussia Dortmund
  const peers = resolveDivisionClubs({
    clubsDb: ALL_CLUBS,
    country: 'GER',
    tier: 1,
    year: 2026,
    userClub,
    excludeUserClub: true,
    isModActive: false,
  });

  const topRivalsWhenUserFirst = new Set<string>();
  const tableWinnersWhenUserSecond = new Set<string>();

  for (let yr = 2026; yr <= 2045; yr++) {
    const tableUser1st = buildDeterministicDivisionTable({
      year: yr,
      country: 'GER',
      tier: 1,
      playedMatchdays: 33,
      totalMatchdays: 34,
      userClub,
      userInTier: true,
      peers,
      pendingSeasonState: { pos: 1, pts: 75, gf: 70, ga: 30 } as any,
    });
    const secondPlace = tableUser1st.find((r) => r.pos === 2);
    if (secondPlace) topRivalsWhenUserFirst.add(secondPlace.name);

    const tableUser2nd = buildDeterministicDivisionTable({
      year: yr,
      country: 'GER',
      tier: 1,
      playedMatchdays: 33,
      totalMatchdays: 34,
      userClub,
      userInTier: true,
      peers,
      pendingSeasonState: { pos: 2, pts: 74, gf: 68, ga: 31 } as any,
    });
    const firstPlace = tableUser2nd.find((r) => r.pos === 1);
    if (firstPlace) tableWinnersWhenUserSecond.add(firstPlace.name);
  }

  assert.ok(
    topRivalsWhenUserFirst.size >= 3,
    `Expected rotating #2 challengers across 20 seasons, got: ${Array.from(topRivalsWhenUserFirst).join(', ')}`
  );
  assert.ok(
    tableWinnersWhenUserSecond.size >= 3,
    `Expected rotating #1 rivals across 20 seasons, got: ${Array.from(tableWinnersWhenUserSecond).join(', ')}`
  );
});

test('UI & IPO hardening contracts are present in WorkspaceTabs, EventUI, IPOModal, and App', () => {
  const workspaceSrc = fs.readFileSync('src/components/WorkspaceTabs.tsx', 'utf-8');
  assert.ok(workspaceSrc.includes('whitespace-nowrap'), 'Treasury metrics must prevent sign/currency wrapping');
  assert.ok(workspaceSrc.includes('`+${formatMoney(Math.abs(financials.estRevenue))}`'));
  assert.ok(workspaceSrc.includes('`-${formatMoney(Math.abs(financials.wages))}`'));

  const eventUiSrc = fs.readFileSync('src/components/EventUI.tsx', 'utf-8');
  assert.ok(eventUiSrc.includes('!event.isForced && ('));
  assert.ok(eventUiSrc.includes('Decline & Remain at Current Club'));
  assert.ok(eventUiSrc.includes('Stay at Current Club'));
  assert.ok(eventUiSrc.includes('bg-emerald-700'));

  const ipoSrc = fs.readFileSync('src/components/IPOModal.tsx', 'utf-8');
  assert.ok(ipoSrc.includes('Number.isFinite(entryPrice)'));
  assert.ok(ipoSrc.includes('ipoReferencePrice > 0 ? currentPrice / ipoReferencePrice : 1'));

  const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
  assert.ok(appSrc.includes("import { IPOModal } from './components/IPOModal';"));
  assert.ok(!appSrc.includes("React.lazy(() => import('./components/IPOModal')"));
});
