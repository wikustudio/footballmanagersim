import { Club, GameState } from '../types';

export interface TrophyHunterMilestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progressLabel: string;
  tier: 'silver' | 'gold' | 'platinum';
}

export interface TrophyHunterSummary {
  milestones: TrophyHunterMilestone[];
  unlockedCount: number;
  totalCount: number;
  distinctTitleCountries: string[];
  trebleCount: number;
  invincibleCount: number;
}

/**
 * Evaluates long-term Trophy Hunter & Endgame Dynasty milestones from career state.
 * Rewards both single-club dynasties (Treble, Invincibles, 25/50 Trophies) and
 * journeyman trophy hunters (Multi-Country Conqueror, World Cup Legend).
 */
export const evaluateTrophyHunterMilestones = (state: GameState): TrophyHunterSummary => {
  const history = Array.isArray(state.history) ? state.history : [];
  const totalTrophies = Math.max(
    state.totals?.trophies ?? 0,
    history.reduce((sum, h) => {
      const t = h.trophiesThisYear || {};
      return (
        sum +
        (t.bl || 0) +
        (t.b2 || 0) +
        (t.l3 || 0) +
        (t.lower || 0) +
        (t.dfb || 0) +
        (t.efl || 0) +
        (t.reg || 0) +
        (t.cl || 0) +
        (t.el || 0) +
        (t.ecl || 0) +
        (t.cwc || 0) +
        (t.supercup || 0) +
        (t.wc || 0)
      );
    }, 0)
  );

  const worldCupWins = state.worldCupTrophies || state.internationalTrophies || 0;

  let trebleCount = 0;
  let invincibleCount = 0;
  const titleCountries = new Set<string>();

  for (const h of history) {
    const t = h.trophiesThisYear || {};
    const wonTopFlight = (t.bl || 0) > 0 || (h.tier === 1 && h.pos === 1);
    const wonDomesticCup = (t.dfb || 0) > 0 || (t.efl || 0) > 0;
    const wonTopContinental = (t.cl || 0) > 0;

    if (wonTopFlight) {
      titleCountries.add((h.country || state.club?.country || 'GER').toUpperCase());
    }
    if (wonTopFlight && wonDomesticCup && wonTopContinental) {
      trebleCount += 1;
    }
    if (
      typeof h.losses === 'number' &&
      h.losses === 0 &&
      (h.wins || 0) + (h.draws || 0) >= 20
    ) {
      invincibleCount += 1;
    }
  }

  const distinctTitleCountries = Array.from(titleCountries);

  const milestones: TrophyHunterMilestone[] = [
    {
      id: 'first_silverware',
      title: 'First Silverware',
      description: 'Lift your first career trophy at any level.',
      icon: 'fa-trophy',
      unlocked: totalTrophies >= 1,
      progressLabel: `${Math.min(1, totalTrophies)} / 1`,
      tier: 'silver',
    },
    {
      id: 'double_digit',
      title: 'Trophy Collector',
      description: 'Accumulate 10 total career honours.',
      icon: 'fa-medal',
      unlocked: totalTrophies >= 10,
      progressLabel: `${Math.min(10, totalTrophies)} / 10`,
      tier: 'silver',
    },
    {
      id: 'legendary_cabinet',
      title: 'Legendary Cabinet',
      description: 'Reach 25 career trophies across competitions.',
      icon: 'fa-award',
      unlocked: totalTrophies >= 25,
      progressLabel: `${Math.min(25, totalTrophies)} / 25`,
      tier: 'gold',
    },
    {
      id: 'immortal_50',
      title: 'Immortal 50 Club',
      description: 'Claim 50 total career trophies — true all-time dominance.',
      icon: 'fa-crown',
      unlocked: totalTrophies >= 50,
      progressLabel: `${Math.min(50, totalTrophies)} / 50`,
      tier: 'platinum',
    },
    {
      id: 'continental_treble',
      title: 'The Treble',
      description: 'Win Top-Flight League, National Cup & Champions Cup in one season.',
      icon: 'fa-star',
      unlocked: trebleCount >= 1,
      progressLabel: trebleCount >= 1 ? `${trebleCount}x Achieved` : '0 / 1',
      tier: 'platinum',
    },
    {
      id: 'invincible_season',
      title: 'The Invincibles',
      description: 'Complete an unbeaten league campaign with zero defeats.',
      icon: 'fa-shield-halved',
      unlocked: invincibleCount >= 1,
      progressLabel: invincibleCount >= 1 ? `${invincibleCount}x Achieved` : '0 / 1',
      tier: 'gold',
    },
    {
      id: 'multi_country_conqueror',
      title: 'Cross-Border Conqueror',
      description: 'Win top-flight Tier 1 league titles in 2 or more countries.',
      icon: 'fa-earth-europe',
      unlocked: distinctTitleCountries.length >= 2,
      progressLabel: `${distinctTitleCountries.length} / 2 nations`,
      tier: 'gold',
    },
    {
      id: 'world_cup_legend',
      title: 'World Cup Champion',
      description: 'Guide a national federation to FIFA World Cup glory.',
      icon: 'fa-globe',
      unlocked: worldCupWins >= 1,
      progressLabel: worldCupWins >= 1 ? `${worldCupWins}x Winner` : '0 / 1',
      tier: 'platinum',
    },
  ];

  const unlockedCount = milestones.filter(m => m.unlocked).length;
  return {
    milestones,
    unlockedCount,
    totalCount: milestones.length,
    distinctTitleCountries,
    trebleCount,
    invincibleCount,
  };
};

export interface EndgameArmsRaceUpdate {
  clubId: number;
  clubName: string;
  previousOvr: number;
  newOvr: number;
}

/**
 * Endgame Dynasty Arms Race:
 * When the player builds a 92+ OVR Tier 1 juggernaut and wins consecutive titles,
 * the top 2 domestic challengers gradually invest to stay within striking range (up to OVR 96),
 * keeping Years 20+ tense without artificially nerfing the player's squad.
 */
export const computeEndgameRivalArmsRace = (
  userClubId: number,
  userOvr: number,
  consecutiveTitles: number,
  sameCountryTier1Clubs: Club[]
): EndgameArmsRaceUpdate[] => {
  if (userOvr < 92 || consecutiveTitles < 2) return [];

  const eligibleRivals = sameCountryTier1Clubs
    .filter(c => c.id !== userClubId && c.tier === 1)
    .sort((a, b) => b.baseOvr - a.baseOvr)
    .slice(0, 2);

  const targetFloor = Math.min(96, userOvr - (consecutiveTitles >= 4 ? 2 : 3));
  const updates: EndgameArmsRaceUpdate[] = [];

  for (const rival of eligibleRivals) {
    if (rival.baseOvr < targetFloor) {
      const step = consecutiveTitles >= 4 ? 2 : 1;
      const nextOvr = Math.min(targetFloor, rival.baseOvr + step);
      if (nextOvr > rival.baseOvr) {
        updates.push({
          clubId: rival.id,
          clubName: rival.name,
          previousOvr: rival.baseOvr,
          newOvr: nextOvr,
        });
      }
    }
  }

  return updates;
};
