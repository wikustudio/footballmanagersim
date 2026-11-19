import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDeterministicDivisionTable,
  estimateDebtPointDeduction,
  resolveDivisionClubs,
} from './standingsEngine';
import { ALL_CLUBS } from '../data/clubsData';
import { calculateProbabilisticSeason } from './seasonSimEngine';

const sampleUserClub = ALL_CLUBS.find((c) => c.country === 'GER' && c.tier === 2) || ALL_CLUBS[0];

describe('standingsEngine unified table & ranking integrity', () => {
  it('resolves exactly 17 unique division peers when excluding user club (18 total teams)', () => {
    const peers = resolveDivisionClubs({
      clubsDb: ALL_CLUBS,
      country: sampleUserClub.country || 'GER',
      tier: sampleUserClub.tier,
      year: 2026,
      userClub: sampleUserClub,
      excludeUserClub: true,
      isModActive: false,
    });

    assert.equal(peers.length, 17);
    const ids = new Set(peers.map((p) => p.id));
    assert.equal(ids.size, 17);
    assert.equal(ids.has(sampleUserClub.id), false);
  });

  it('preserves user #1 rank deterministically from live MD 34 through season archive and wrap-up', () => {
    const peers = resolveDivisionClubs({
      clubsDb: ALL_CLUBS,
      country: sampleUserClub.country || 'GER',
      tier: sampleUserClub.tier,
      year: 2027,
      userClub: sampleUserClub,
      excludeUserClub: true,
    });

    const userFinal = {
      pos: 1,
      w: 24,
      d: 6,
      l: 4,
      gf: 69,
      ga: 28,
      pts: 78,
    };

    const tableA = buildDeterministicDivisionTable({
      year: 2027,
      country: sampleUserClub.country || 'GER',
      tier: sampleUserClub.tier,
      playedMatchdays: 34,
      totalMatchdays: 34,
      userClub: sampleUserClub,
      userInTier: true,
      peers,
      userOverrideFinal: userFinal,
    });

    const tableB = buildDeterministicDivisionTable({
      year: 2027,
      country: sampleUserClub.country || 'GER',
      tier: sampleUserClub.tier,
      playedMatchdays: 34,
      totalMatchdays: 34,
      userClub: sampleUserClub,
      userInTier: true,
      peers,
      userOverrideFinal: userFinal,
    });

    assert.equal(tableA.length, 18);
    assert.equal(tableA[0].isUser, true);
    assert.equal(tableA[0].pos, 1);
    assert.equal(tableA[0].pts, 78);
    assert.ok(tableA[1].pts < tableA[0].pts, '2nd place points must trail champion #1');
    assert.deepEqual(tableA, tableB, 'Identical inputs must produce identical tables');
  });

  it('tracks progressive cumulative points cleanly across MD 0 -> MD 17 -> MD 34', () => {
    const pendingSeason = calculateProbabilisticSeason(
      {
        club: sampleUserClub,
        year: 2028,
        budget: 4000,
        reputation: 60,
        tactic: 'Gegenpress',
        archetype: 'tactics',
        history: [],
        ownership: { isOwned: false, clubValue: 15000, stakeOwned: 0 },
      } as any,
      ALL_CLUBS
    );

    const peers = resolveDivisionClubs({
      clubsDb: ALL_CLUBS,
      country: sampleUserClub.country || 'GER',
      tier: sampleUserClub.tier,
      year: 2028,
      userClub: sampleUserClub,
      excludeUserClub: true,
    });

    const md0 = buildDeterministicDivisionTable({
      year: 2028,
      country: sampleUserClub.country || 'GER',
      tier: sampleUserClub.tier,
      playedMatchdays: 0,
      userClub: sampleUserClub,
      peers,
      pendingSeasonState: pendingSeason,
    });
    assert.ok(md0.every((r) => r.mp === 0 && r.pts === 0));

    const outcome17 = pendingSeason.matchdaySchedule[16];
    const md17 = buildDeterministicDivisionTable({
      year: 2028,
      country: sampleUserClub.country || 'GER',
      tier: sampleUserClub.tier,
      playedMatchdays: 17,
      userClub: sampleUserClub,
      peers,
      pendingSeasonState: pendingSeason,
      latestOutcome: outcome17,
    });
    assert.ok(md17.every((r) => r.mp === 17 && r.w + r.d + r.l === 17));
    const userRow17 = md17.find((r) => r.isUser)!;
    assert.equal(userRow17.pts, outcome17.runningPts);

    const md34 = buildDeterministicDivisionTable({
      year: 2028,
      country: sampleUserClub.country || 'GER',
      tier: sampleUserClub.tier,
      playedMatchdays: 34,
      userClub: sampleUserClub,
      peers,
      pendingSeasonState: pendingSeason,
      latestOutcome: pendingSeason.matchdaySchedule[33],
    });
    assert.ok(md34.every((r) => r.mp === 34 && r.w + r.d + r.l === 34));
    const userRow34 = md34.find((r) => r.isUser)!;
    assert.equal(userRow34.pos, pendingSeason.pos);
    assert.equal(userRow34.pts, pendingSeason.pts);
  });

  it('estimates debt point deduction coherently only when in negative balance and negative net', () => {
    assert.equal(estimateDebtPointDeduction(5000, 0, -200), 0);
    assert.equal(estimateDebtPointDeduction(-3000, 1, 500), 0, 'Operating profit forgiveness rule pauses point deduction');
    assert.equal(estimateDebtPointDeduction(-1200, 0, -100), 1, 'Year 1 debt under €2M (-1200K) deducts 1 pt');
    assert.equal(estimateDebtPointDeduction(-3000, 0, -100), 2, 'Year 1 debt at/above €2M (-3000K) deducts 2 pts');
    assert.equal(estimateDebtPointDeduction(-6000, 1, -100), 3, 'Year 2 debt scales up to 5 pts');
    assert.equal(estimateDebtPointDeduction(-12000, 2, -100), 12, 'Year 3+ repeat debt scales up to 15 pts');
  });

  it('marks promotion and playoff zones accurately across 3-spot (GER) and 6-spot (ENG) lower tiers', () => {
    const gerPeers = resolveDivisionClubs({
      clubsDb: ALL_CLUBS,
      country: 'GER',
      tier: 2,
      year: 2026,
      userClub: sampleUserClub,
      excludeUserClub: true,
    });
    const gerTable = buildDeterministicDivisionTable({
      year: 2026,
      country: 'GER',
      tier: 2,
      playedMatchdays: 34,
      userClub: sampleUserClub,
      peers: gerPeers,
    });
    assert.equal(gerTable.filter((r) => r.isPromotionZone).length, 3);

    const engUserClub = ALL_CLUBS.find((c) => c.country === 'ENG' && c.tier === 2)!;
    const engPeers = resolveDivisionClubs({
      clubsDb: ALL_CLUBS,
      country: 'ENG',
      tier: 2,
      year: 2026,
      userClub: engUserClub,
      excludeUserClub: true,
    });
    const engTable = buildDeterministicDivisionTable({
      year: 2026,
      country: 'ENG',
      tier: 2,
      playedMatchdays: 34,
      userClub: engUserClub,
      peers: engPeers,
    });
    assert.equal(engTable.filter((r) => r.isPromotionZone).length, 6);
  });

  it('aligns Winter Break midPos/midPts and every MD 1..34 runningPos 100% with buildDeterministicDivisionTable (Primeira Liga 10-3-4 case)', () => {
    const porClub =
      ALL_CLUBS.find((c) => c.country === 'POR' && c.name.includes('Belenenses')) ||
      ALL_CLUBS.find((c) => c.country === 'POR' && c.tier === 1)!;
    const clubT1 = { ...porClub, tier: 1, baseOvr: 78 };

    // 1. Verify realistic MD 17 table when user has 10-3-4 (33 pts, 58.8% win rate) in Primeira Liga
    const peersPor = resolveDivisionClubs({
      clubsDb: ALL_CLUBS,
      country: 'POR',
      tier: 1,
      year: 2028,
      userClub: clubT1,
      excludeUserClub: true,
    });
    for (const anchorPos of [2, 5, 8, 10]) {
      const tbl17 = buildDeterministicDivisionTable({
        year: 2028,
        country: 'POR',
        tier: 1,
        playedMatchdays: 17,
        totalMatchdays: 34,
        userClub: clubT1,
        userInTier: true,
        peers: peersPor,
        pendingSeasonState: {
          year: 2028,
          tier: 1,
          country: 'POR',
          totalMatchdays: 34,
          dilemmaMatchday: 17,
          approxPos: anchorPos,
          pos: anchorPos,
          pts: 52,
          wins: 15,
          draws: 7,
          losses: 12,
          gf: 50,
          ga: 42,
          gd: 8,
          effectiveOvr: 78,
          leagueAvgOvr: 78,
          schedule: [],
          matchdaySchedule: [],
          _meta: {
            ovrAtCalculation: 78,
            moraleAtCalculation: 80,
            tacticAtCalculation: 'Total Football',
          },
        },
        latestOutcome: {
          matchday: 17,
          opponentId: 1,
          opponentName: 'Rival',
          isHome: true,
          userGoals: 2,
          oppGoals: 1,
          result: 'W',
          ptsEarned: 3,
          runningPts: 33,
          runningPoints: 33,
          runningWins: 10,
          runningDraws: 3,
          runningLosses: 4,
          runningGf: 29,
          runningGa: 15,
          runningGd: 14,
          runningPos: 2,
          runningPosition: 2,
        } as any,
      });
      const userRow = tbl17.find((r) => r.isUser)!;
      assert.ok(tbl17[0].pts <= 46, `1st place at MD 17 must be realistic (<=46 pts), got ${tbl17[0].pts}`);
      assert.ok(
        userRow.pos <= 4,
        `User with 10-3-4 (33 pts) at MD 17 must rank Top 4, not #${userRow.pos} (anchorPos=${anchorPos})`
      );
    }

    // 2. Verify 100% alignment across MD 1..34 & Winter Break _meta.midPos over 10 full seasons
    for (let s = 0; s < 10; s++) {
      const year = 2026 + s;
      const pending = calculateProbabilisticSeason(
        {
          club: clubT1,
          year,
          budget: 8000,
          reputation: 70,
          tactic: 'Total Football',
          archetype: 'tactics',
          history: [],
          ownership: { isOwned: false, clubValue: 25000, stakeOwned: 0 },
        } as any,
        ALL_CLUBS
      );
      const peers = resolveDivisionClubs({
        clubsDb: ALL_CLUBS,
        country: 'POR',
        tier: 1,
        year,
        userClub: clubT1,
        excludeUserClub: true,
      });

      const md17Outcome = pending.matchdaySchedule[16];
      const md17Table = buildDeterministicDivisionTable({
        year,
        country: 'POR',
        tier: 1,
        playedMatchdays: 17,
        totalMatchdays: 34,
        userClub: clubT1,
        userInTier: true,
        peers,
        pendingSeasonState: pending,
        latestOutcome: md17Outcome,
      });
      const md17User = md17Table.find((r) => r.isUser)!;
      assert.equal(pending._meta?.midPos, md17User.pos, `Season ${year}: _meta.midPos must equal live MD 17 standings pos`);
      assert.equal(pending._meta?.midPts, md17User.pts, `Season ${year}: _meta.midPts must equal live MD 17 standings pts`);
      assert.equal(md17Outcome.runningPosition, md17User.pos, `Season ${year}: schedule[16].runningPosition must equal MD 17 standings pos`);

      // Spot-check MD 5, MD 12, MD 25, MD 34 exact alignment
      for (const checkMd of [5, 12, 25, 34]) {
        const out = pending.matchdaySchedule[checkMd - 1];
        const tbl = buildDeterministicDivisionTable({
          year,
          country: 'POR',
          tier: 1,
          playedMatchdays: checkMd,
          totalMatchdays: 34,
          userClub: clubT1,
          userInTier: true,
          peers,
          pendingSeasonState: pending,
          latestOutcome: out,
        });
        const uRow = tbl.find((r) => r.isUser)!;
        assert.equal(out.runningPos, uRow.pos, `Season ${year} MD ${checkMd}: runningPos must match table pos`);
      }

      // 3. Verify Mid-Season Dilemma recalculation (lockFirstHalfFrom) NEVER shifts MD 17 rank or peer points
      const dilemmaRecalc = calculateProbabilisticSeason(
        {
          club: { ...clubT1, baseOvr: clubT1.baseOvr - 4, morale: 58 },
          year,
          budget: 8000,
          reputation: 70,
          tactic: 'Total Football',
          archetype: 'tactics',
          history: [],
          ownership: { isOwned: false, clubValue: 25000, stakeOwned: 0 },
        } as any,
        ALL_CLUBS,
        false,
        { lockFirstHalfFrom: pending, dilemmaChoice: 'B' }
      );
      const md17TableAfterDilemma = buildDeterministicDivisionTable({
        year,
        country: 'POR',
        tier: 1,
        playedMatchdays: 17,
        totalMatchdays: 34,
        userClub: clubT1,
        userInTier: true,
        peers,
        pendingSeasonState: dilemmaRecalc,
        latestOutcome: dilemmaRecalc.matchdaySchedule[16],
      });
      const md17UserAfter = md17TableAfterDilemma.find((r) => r.isUser)!;
      assert.equal(
        md17UserAfter.pos,
        md17User.pos,
        `Season ${year}: MD 17 user pos must NOT shift after Mid-Season Dilemma (${md17User.pos} -> ${md17UserAfter.pos})`
      );
      assert.equal(
        dilemmaRecalc._meta?.midPos,
        md17User.pos,
        `Season ${year}: _meta.midPos after dilemma must still equal MD 17 pos`
      );
      assert.equal(
        dilemmaRecalc.matchdaySchedule[16].runningPosition,
        md17User.pos,
        `Season ${year}: schedule[16].runningPosition after dilemma must still equal MD 17 pos`
      );
      for (let rIdx = 0; rIdx < md17Table.length; rIdx++) {
        assert.equal(
          md17TableAfterDilemma[rIdx].name,
          md17Table[rIdx].name,
          `Season ${year}: MD 17 table row ${rIdx + 1} club must remain immutable after dilemma`
        );
        assert.equal(
          md17TableAfterDilemma[rIdx].pts,
          md17Table[rIdx].pts,
          `Season ${year}: MD 17 table row ${rIdx + 1} pts must remain immutable after dilemma`
        );
      }
    }
  });

  it('scales 120k colossus stadiums dramatically larger than 50k arenas and aligns PWA & favicon assets', async () => {
    const fs = await import('fs');
    const { computeStadiumArchitecture, STADIUM_STYLE_OPTIONS } = await import('./liveSimVisualEngine');

    for (const opt of STADIUM_STYLE_OPTIONS) {
      const s50k = computeStadiumArchitecture(50000, opt.id);
      const s120k = computeStadiumArchitecture(120000, opt.id);
      assert.ok(
        s120k.standDepth >= Math.round(s50k.standDepth * 1.7),
        `${opt.id}: 120k standDepth (${s120k.standDepth}) must be dramatically deeper than 50k (${s50k.standDepth})`
      );
      assert.ok(
        s120k.tierHeight >= Math.round(s50k.tierHeight * 1.8),
        `${opt.id}: 120k tierHeight (${s120k.tierHeight}) must be dramatically taller than 50k (${s50k.tierHeight})`
      );
      const halfProj = (s120k.outerU * 0.62 + s120k.outerV * 0.68) * s120k.zoomFactor;
      assert.ok(halfProj <= 365, `${opt.id}: 120k projected half-width (${halfProj.toFixed(1)}) must fit viewport <= 365`);
    }

    const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf-8'));
    assert.equal(manifest.id, '/');
    assert.equal(manifest.start_url, '/');
    assert.equal(manifest.scope, '/');
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.theme_color, '#F5F3EE');
    assert.equal(manifest.background_color, '#F5F3EE');
    assert.ok(manifest.short_name.length <= 12);

    const any512 = fs.readFileSync('public/icon-512.png');
    const mask512 = fs.readFileSync('public/icon-maskable-512.png');
    assert.ok(any512.length > 1000 && mask512.length > 1000);
    assert.equal(any512.equals(mask512), false, 'Maskable icon must have distinct safe-zone padding from standard icon');

    for (const asset of [
      'public/icon-192.png',
      'public/apple-touch-icon.png',
      'public/favicon.png',
      'public/favicon.ico',
      'public/favicon.svg',
      'public/assets/a_footballsim_logo.jpg',
    ]) {
      assert.ok(fs.existsSync(asset) && fs.statSync(asset).size > 500, `${asset} must exist and be non-empty`);
    }
  });
});


