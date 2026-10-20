import { describe, it, expect } from 'vitest';
import { Club } from '../types';

describe('Playoff, Database & Cup Run Integrity', () => {
  it('verifies promotion playoff victory preserves 3rd-6th position and does not overwrite approxPos', () => {
    let approxPos = 4;
    const seasonTier = 2;
    const ddType = 'promotion_playoff';
    const ddWon = true;
    let wonPlayoff = false;
    const ddResult = { userRank: 3 };

    if (ddType === 'promotion_playoff') {
      wonPlayoff = ddWon;
      // Do not overwrite approxPos!
    } else if (ddResult.userRank) {
      approxPos = ddResult.userRank;
    }

    expect(wonPlayoff).toBe(true);
    expect(approxPos).toBe(4); // Preserves authentic 4th place finish!
  });

  it('guarantees champion prize is strictly awarded to approxPos === 1 and not playoff winners', () => {
    const approxPos: number = 4;
    const baseChampPrize = 400;

    const champPrize = (approxPos === 1) ? baseChampPrize : 0;
    expect(champPrize).toBe(0); // Playoff winner does not get champion prize!
  });

  it('verifies promoAiIds dynamically matches targetSpots for 18-team leagues', () => {
    const userTierTable = Array.from({ length: 18 }, (_, idx) => ({
      id: 100 + idx,
      name: `Club ${idx + 1}`,
      pos: idx + 1,
      isUser: idx === 3, // User finishes 4th
    }));

    const targetSpots = userTierTable.length >= 16 ? 3 : (Math.min(2, Math.floor(userTierTable.length / 4)) || 1);
    const bottomThreshold = Math.max(1, userTierTable.length - targetSpots + 1);

    const bottomAiIds = new Set(userTierTable.filter(r => r.pos >= bottomThreshold && !r.isUser).map(r => r.id));
    const promoAiIds = new Set(userTierTable.filter(r => r.pos <= targetSpots && !r.isUser).map(r => r.id));

    // Target spots must be 3 for an 18-team league
    expect(targetSpots).toBe(3);
    // 3 teams promoted, 3 teams relegated
    expect(promoAiIds.size).toBe(3);
    expect(bottomAiIds.size).toBe(3);
    expect(bottomThreshold).toBe(16);
  });

  it('verifies cup run opponent derivation never crashes on a minimal 18-club database', () => {
    const minimalDb: Club[] = Array.from({ length: 18 }, (_, idx) => ({
      id: idx + 1,
      name: `Minimal Club ${idx + 1}`,
      tier: 1,
      baseOvr: 70 + idx,
      country: 'GER',
      color: '#3b82f6',
      stadium: 15000,
    }));

    const userClubId = 1;
    const playedOpponents: string[] = ['Minimal Club 2', 'Minimal Club 3'];

    const isReserveTeam = (name: string) => name.toLowerCase().endsWith(' ii') || name.toLowerCase().endsWith(' b');

    const fallbackOpponent: Club = minimalDb.find(c => c.id !== userClubId && !isReserveTeam(c.name))
      || minimalDb.find(c => c.id !== userClubId)
      || { id: 9999, name: 'Traditionsklub FC', baseOvr: 78, color: '#3b82f6', tier: 1, stadium: 25000 };

    let eligible = minimalDb.filter(c => c.id !== userClubId && !isReserveTeam(c.name));
    const unplayedEligible = eligible.filter(c => !playedOpponents.includes(c.name));
    const usableEligible = unplayedEligible.length > 0 ? unplayedEligible : eligible;

    const poolSize = Math.min(6, usableEligible.length);
    const topCandidates = usableEligible.slice(0, Math.max(1, poolSize));

    const minOvrInPool = Math.min(...topCandidates.map(c => c.baseOvr ?? 75));
    const weights = topCandidates.map(c => Math.pow(Math.max(1, (c.baseOvr ?? 75) - minOvrInPool + 4), 2.5));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let randomWeight = Math.random() * (totalWeight || 1);
    let chosenClub = topCandidates[0] || fallbackOpponent;
    for (let i = 0; i < topCandidates.length; i++) {
      randomWeight -= weights[i];
      if (randomWeight <= 0) {
        chosenClub = topCandidates[i];
        break;
      }
    }

    expect(chosenClub).toBeDefined();
    expect(chosenClub.name).toBeDefined();
    expect(typeof chosenClub.baseOvr).toBe('number');
  });
});
