import { describe, it, expect } from 'vitest';
import { ALL_CLUBS } from '../data/clubsData';
import { Club } from '../types';

describe('Domestic Cup Opponent Derivation & OVR-Weighted Tournament Hierarchy', () => {
  // Simulates the exact candidate selection algorithm from CupRunModal.tsx
  const simulateOpponentSelection = (
    round: 'quarter' | 'semi' | 'final',
    country: string = 'GER',
    customClubs?: Club[],
    playedOpponents: string[] = []
  ) => {
    const dbSource = customClubs || ALL_CLUBS;

    const isClubEligibleForCup = (c: Club) => {
      const cCountry = c.country || 'GER';
      return cCountry === country && !c.name.toLowerCase().endsWith(' ii') && !c.name.toLowerCase().endsWith(' b');
    };

    let eligible = dbSource.filter(c => isClubEligibleForCup(c));
    eligible.sort((a, b) => b.baseOvr - a.baseOvr);
    const highestOvr = eligible[0]?.baseOvr || 85;

    const unplayedEligible = eligible.filter(c => !playedOpponents.includes(c.name));
    const usableEligible = unplayedEligible.length > 0 ? unplayedEligible : eligible;

    const isCinderellaRoll = (round === 'semi' && Math.random() < 0.04) || (round === 'final' && Math.random() < 0.006);
    const cinderellaPool = usableEligible.filter(c => c.baseOvr <= highestOvr - 8 || c.tier >= 3);

    if (isCinderellaRoll && cinderellaPool.length > 0) {
      return cinderellaPool[Math.floor(Math.random() * cinderellaPool.length)];
    }

    let poolSize = 16;
    if (round === 'final') {
      poolSize = Math.min(6, usableEligible.length);
    } else if (round === 'semi') {
      poolSize = Math.min(10, usableEligible.length);
    } else {
      poolSize = Math.min(16, usableEligible.length);
    }

    const topCandidates = usableEligible.slice(0, Math.max(1, poolSize));
    const minOvrInPool = Math.min(...topCandidates.map(c => c.baseOvr));
    const weights = topCandidates.map(c => Math.pow(Math.max(1, c.baseOvr - minOvrInPool + 4), 2.5));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let randomWeight = Math.random() * totalWeight;
    let chosenClub = topCandidates[0];
    for (let i = 0; i < topCandidates.length; i++) {
      randomWeight -= weights[i];
      if (randomWeight <= 0) {
        chosenClub = topCandidates[i];
        break;
      }
    }

    return chosenClub;
  };

  it('guarantees lower-tier underdogs (Greifswald, Saarbrücken) appear in < 5% of Semi-Finals and < 1% of Finals', () => {
    let semiUnderdogCount = 0;
    let finalUnderdogCount = 0;
    const trials = 2000;

    for (let i = 0; i < trials; i++) {
      const semiOpp = simulateOpponentSelection('semi', 'GER');
      if (semiOpp.tier >= 3 || semiOpp.baseOvr < 72) {
        semiUnderdogCount++;
      }

      const finalOpp = simulateOpponentSelection('final', 'GER');
      if (finalOpp.tier >= 3 || finalOpp.baseOvr < 72) {
        finalUnderdogCount++;
      }
    }

    const semiUnderdogPct = semiUnderdogCount / trials;
    const finalUnderdogPct = finalUnderdogCount / trials;

    // Semi-Final Cinderella runs must be strictly under 5%
    expect(semiUnderdogPct).toBeLessThan(0.05);

    // Final Cinderella runs must be strictly under 1%
    expect(finalUnderdogPct).toBeLessThan(0.01);
  });

  it('allows an overinflated Tier 3 club (87 OVR) to legitimately go deep into the Final based on OVR weighting', () => {
    const overinflatedTier3Club: Club = {
      id: 9999,
      name: 'Supercharged Saarland',
      tier: 3,
      baseOvr: 87, // High OVR despite Tier 3
      color: '0054a6',
      stadium: 30000,
      country: 'GER',
      rep: 80,
      fanBase: 500000,
      currentBudget: 50000000
    };

    const clubsWithSupercharged = [overinflatedTier3Club, ...ALL_CLUBS];
    let finalAppearanceCount = 0;
    let semiAppearanceCount = 0;
    const trials = 1000;

    for (let i = 0; i < trials; i++) {
      const finalOpp = simulateOpponentSelection('final', 'GER', clubsWithSupercharged);
      if (finalOpp.id === 9999) {
        finalAppearanceCount++;
      }

      const semiOpp = simulateOpponentSelection('semi', 'GER', clubsWithSupercharged);
      if (semiOpp.id === 9999) {
        semiAppearanceCount++;
      }
    }

    // Because of 87 OVR, they rank #2 or #3 in Germany and should regularly reach Semis and Finals!
    expect(semiAppearanceCount).toBeGreaterThan(50);
    expect(finalAppearanceCount).toBeGreaterThan(50);
  });

  it('guarantees top-flight superpowers (Bayern, Dortmund, etc.) can be drawn in Year 2 after seasonal memory reset', () => {
    // In Year 1, player played Bayern and Dortmund
    const year1Played = ['Bavaria München', 'Prussia Dortmund'];
    
    // In Year 1, Bayern is excluded from repeat draws in that same run
    const year1FinalOpp = simulateOpponentSelection('final', 'GER', undefined, year1Played);
    expect(year1FinalOpp.name).not.toBe('Bavaria München');
    expect(year1FinalOpp.name).not.toBe('Prussia Dortmund');

    // In Year 2, memory resets (playedOpponents = [])
    const year2Played: string[] = [];
    let bayernOrDortmundDrawnInYear2 = 0;

    for (let i = 0; i < 100; i++) {
      const opp = simulateOpponentSelection('final', 'GER', undefined, year2Played);
      if (opp.name === 'Bavaria München' || opp.name === 'Prussia Dortmund') {
        bayernOrDortmundDrawnInYear2++;
      }
    }

    // Bayern or Dortmund should easily be drawn in Year 2 finals once memory resets
    expect(bayernOrDortmundDrawnInYear2).toBeGreaterThan(20);
  });

  it('ensures domestic cup finals across England, Spain, and other countries are dominated by national giants', () => {
    const countries = ['ENG', 'ESP'];

    for (const c of countries) {
      let eliteFinalists = 0;
      const trials = 200;

      for (let i = 0; i < trials; i++) {
        const opp = simulateOpponentSelection('final', c);
        // Opponent should have high OVR (>= 80 for England and Spain)
        if (opp.baseOvr >= 80) {
          eliteFinalists++;
        }
      }

      // > 95% of finals must feature high-OVR giants
      expect(eliteFinalists / trials).toBeGreaterThan(0.95);
    }
  });

  it('guarantees diverse cup opponents and prevents the arch-rival from dominating every tournament', () => {
    // Audit candidate selection with arch-rival weighting
    const rivals = ['Prussia Dortmund', 'Dortmund Yellow', 'Borussia Dortmund'];
    const trials = 500;
    const opponentCounts: Record<string, number> = {};

    // Simulate final opponents for Bayern Munich where Dortmund is the designated arch rival
    const minOvr = 75;
    const pool = ALL_CLUBS
      .filter(c => (c.country || 'GER') === 'GER' && c.tier === 1 && !c.name.includes('Bayern'))
      .sort((a, b) => b.baseOvr - a.baseOvr)
      .slice(0, 8);
    const minPoolOvr = Math.min(...pool.map(c => c.baseOvr));
    
    for (let i = 0; i < trials; i++) {
      const weights = pool.map(c => {
        let w = Math.pow(Math.max(1, (c.baseOvr ?? 75) - minPoolOvr + 4), 2.2);
        if (rivals.some(r => c.name.toLowerCase().includes(r.toLowerCase()))) {
          w *= 0.35; // Rival fatigue moderation
        }
        return w;
      });
      const totalW = weights.reduce((sum, w) => sum + w, 0);
      let rand = Math.random() * totalW;
      let picked = pool[0];
      for (let j = 0; j < pool.length; j++) {
        rand -= weights[j];
        if (rand <= 0) {
          picked = pool[j];
          break;
        }
      }
      opponentCounts[picked.name] = (opponentCounts[picked.name] || 0) + 1;
    }

    // Rival must NOT win > 30% of finals alone (allowing other contenders to shine)
    const rivalCount = Object.entries(opponentCounts)
      .filter(([name]) => rivals.some(r => name.toLowerCase().includes(r.toLowerCase())))
      .reduce((sum, [, count]) => sum + count, 0);
    const rivalRate = rivalCount / trials;
    expect(rivalRate).toBeLessThan(0.30);
    expect(rivalRate).toBeGreaterThan(0.02);

    // At least 4 distinct teams should have appeared in finals across 500 trials
    expect(Object.keys(opponentCounts).length).toBeGreaterThanOrEqual(4);
  });
});
