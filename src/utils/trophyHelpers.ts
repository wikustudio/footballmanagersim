import { TOURNAMENT_LOGOS, getLeagueInfo, getDomesticCupInfo } from '../data/gameConstants';
import { getCompetitionLogo } from './competitionLogos';

export const getTrophyImage = (id: string, country: string = 'GER', isModActive: boolean = true): string => {
  const norm = (id || '').toLowerCase().trim();

  if (norm === 'cl' || norm === 'el' || norm === 'ecl' || norm === 'cwc') {
    return getCompetitionLogo({
      kind: 'continental',
      competitionId: norm,
      country,
      isModActive,
    });
  }
  if (norm === 'wc' || norm === 'world-cup') {
    return getCompetitionLogo({
      kind: 'world_cup',
      competitionId: 'wc',
      country,
      isModActive,
    });
  }
  if (norm === 'supercup') {
    return getCompetitionLogo({
      kind: 'supercup',
      competitionId: 'supercup',
      country,
      isModActive,
    });
  }
  if (norm === 'dfb') {
    if (isModActive) {
      const cupInfo = getDomesticCupInfo(country);
      return (
        getCompetitionLogo({ kind: 'cup', country, tier: 1, isModActive: true }) ||
        cupInfo.logo ||
        TOURNAMENT_LOGOS.dfbPokal
      );
    }
    return getCompetitionLogo({ kind: 'cup', country, tier: 1, isModActive: false });
  }
  if (norm === 'bl') {
    if (isModActive) {
      const leagueInfo = getLeagueInfo(1, country);
      return (
        getCompetitionLogo({ kind: 'league', country, tier: 1, isModActive: true }) ||
        leagueInfo.logo ||
        TOURNAMENT_LOGOS.supercup
      );
    }
    return getCompetitionLogo({ kind: 'league', country, tier: 1, isModActive: false });
  }

  return '';
};

// Provides the optimal CSS filter to ensure the logo is readable on a dark background.
export const getTrophyFilter = (id: string): string => {
  id = id.toLowerCase().trim();
  // Elite Cup and Euro Challenge Cup logos are very dark blue/black.
  // Converting them to pure white silhouettes ensures perfect readability.
  if (id === 'cl' || id === 'ecl' || id === 'cwc') {
    return 'brightness(0) invert(1) drop-shadow(0px 0px 4px rgba(255,255,255,0.5))';
  }
  
  // For all other colored logos (like National Cup or Euro Cup), 
  // we add a subtle white glow so their edges don't get lost in the dark background,
  // while preserving their original colors.
  return 'drop-shadow(0px 0px 6px rgba(255,255,255,0.7))';
};
