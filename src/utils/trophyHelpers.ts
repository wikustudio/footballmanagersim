import { TOURNAMENT_LOGOS, getLeagueInfo, getDomesticCupInfo } from '../data/gameConstants';
import { getRegion } from './regionHelpers';

export const getTrophyImage = (id: string, country: string = 'GER'): string => {
  id = id.toLowerCase().trim();
  const region = getRegion(country);

  if (id === 'cl') {
    if (region === 'CONCACAF') return TOURNAMENT_LOGOS.concacaf;
    if (region === 'CONMEBOL') return TOURNAMENT_LOGOS.copaLibertadores;
    if (region === 'AFC') return TOURNAMENT_LOGOS.afcChampionsLeague; // We need to add this
    return TOURNAMENT_LOGOS.cl;
  }
  if (id === 'el') {
    if (region === 'CONCACAF') return TOURNAMENT_LOGOS.leaguesCup;
    if (region === 'CONMEBOL') return TOURNAMENT_LOGOS.copaSudamericana;
    if (region === 'AFC') return TOURNAMENT_LOGOS.afcCup;
    return TOURNAMENT_LOGOS.el;
  }
  if (id === 'cwc') return TOURNAMENT_LOGOS.cwc || '';
  if (id === 'ecl') {
    if (region === 'CONCACAF') return TOURNAMENT_LOGOS.campeonesCup;
    if (region === 'CONMEBOL') return TOURNAMENT_LOGOS.recopaSudamericana;
    if (region === 'AFC') return TOURNAMENT_LOGOS.afcChallengeLeague;
    return TOURNAMENT_LOGOS.ecl;
  }
  if (id === 'dfb') {
    const cupInfo = getDomesticCupInfo(country);
    return cupInfo.logo || TOURNAMENT_LOGOS.dfbPokal;
  }
  if (id === 'bl') {
    const leagueInfo = getLeagueInfo(1, country);
    return leagueInfo.logo || TOURNAMENT_LOGOS.supercup;
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
