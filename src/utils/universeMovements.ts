import { Club, GameState, UniverseMovement } from '../types';
import { getLeagueInfo, COUNTRIES, getMaxTier } from '../data/gameConstants';
import { REAL_CLUB_ALIASES } from '../engine/moddingEngine';
import { ALL_CLUBS } from '../data/clubsData';
import { TEAMS } from '../mod-data/teams';
import { UEFA_COUNTRIES, CONMEBOL_COUNTRIES, CONCACAF_COUNTRIES, AFC_COUNTRIES } from './regionHelpers';

// Authentic baseline transitions (recent European promotions & relegations)
export const BASELINE_UNIVERSE_MOVEMENTS: UniverseMovement[] = [
  // Germany (GER)
  {
    id: 'base-ger-1',
    year: 2024,
    clubId: 17,
    clubName: 'FC St. Pauli',
    country: 'GER',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: '2. Bundesliga',
    toLeagueName: '1. Bundesliga',
    type: 'promotion',
    pos: 1,
    reason: 'Champions · Direct Promotion',
    clubColor: '#593922'
  },
  {
    id: 'base-ger-2',
    year: 2024,
    clubId: 18,
    clubName: 'Holstein Kiel',
    country: 'GER',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: '2. Bundesliga',
    toLeagueName: '1. Bundesliga',
    type: 'promotion',
    pos: 2,
    reason: 'Runners-up · Historic First Promotion',
    clubColor: '#004d9d'
  },
  {
    id: 'base-ger-3',
    year: 2024,
    clubId: 19,
    clubName: '1. FC Köln',
    country: 'GER',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: '1. Bundesliga',
    toLeagueName: '2. Bundesliga',
    type: 'relegation',
    pos: 17,
    reason: 'Direct Relegation',
    clubColor: '#ed1c24'
  },
  {
    id: 'base-ger-4',
    year: 2024,
    clubId: 20,
    clubName: 'SV Darmstadt 98',
    country: 'GER',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: '1. Bundesliga',
    toLeagueName: '2. Bundesliga',
    type: 'relegation',
    pos: 18,
    reason: 'Direct Relegation',
    clubColor: '#004e9f'
  },
  {
    id: 'base-ger-5',
    year: 2024,
    clubId: 34,
    clubName: 'SSV Ulm 1846',
    country: 'GER',
    fromTier: 3,
    toTier: 2,
    fromLeagueName: '3. Liga',
    toLeagueName: '2. Bundesliga',
    type: 'promotion',
    pos: 1,
    reason: 'Champions · Back-to-Back Promotion',
    clubColor: '#000000'
  },
  {
    id: 'base-ger-6',
    year: 2024,
    clubId: 35,
    clubName: 'Preußen Münster',
    country: 'GER',
    fromTier: 3,
    toTier: 2,
    fromLeagueName: '3. Liga',
    toLeagueName: '2. Bundesliga',
    type: 'promotion',
    pos: 2,
    reason: 'Runners-up · Direct Promotion',
    clubColor: '#006837'
  },
  {
    id: 'base-ger-7',
    year: 2024,
    clubId: 36,
    clubName: 'Jahn Regensburg',
    country: 'GER',
    fromTier: 3,
    toTier: 2,
    fromLeagueName: '3. Liga',
    toLeagueName: '2. Bundesliga',
    type: 'promotion',
    pos: 3,
    reason: 'Promotion Relegation Playoff Winner',
    clubColor: '#e30613'
  },
  {
    id: 'base-ger-8',
    year: 2024,
    clubId: 42,
    clubName: 'SV Wehen Wiesbaden',
    country: 'GER',
    fromTier: 2,
    toTier: 3,
    fromLeagueName: '2. Bundesliga',
    toLeagueName: '3. Liga',
    type: 'relegation',
    pos: 16,
    reason: 'Relegation Playoff Defeat',
    clubColor: '#000000'
  },
  {
    id: 'base-ger-9',
    year: 2024,
    clubId: 41,
    clubName: 'Hansa Rostock',
    country: 'GER',
    fromTier: 2,
    toTier: 3,
    fromLeagueName: '2. Bundesliga',
    toLeagueName: '3. Liga',
    type: 'relegation',
    pos: 17,
    reason: 'Direct Relegation',
    clubColor: '#004b93'
  },
  {
    id: 'base-ger-10',
    year: 2024,
    clubId: 40,
    clubName: 'VfL Osnabrück',
    country: 'GER',
    fromTier: 2,
    toTier: 3,
    fromLeagueName: '2. Bundesliga',
    toLeagueName: '3. Liga',
    type: 'relegation',
    pos: 18,
    reason: 'Direct Relegation',
    clubColor: '#5c2d91'
  },
  {
    id: 'base-ger-11',
    year: 2024,
    clubId: 92,
    clubName: 'MSV Duisburg',
    country: 'GER',
    fromTier: 3,
    toTier: 4,
    fromLeagueName: '3. Liga',
    toLeagueName: 'Regionalliga',
    type: 'insolvency_drop',
    pos: 18,
    reason: 'Severe Financial Deficit & Pyramid Drop',
    clubColor: '#002f6c'
  },

  // England (ENG)
  {
    id: 'base-eng-1',
    year: 2024,
    clubId: 719,
    clubName: 'Leicester City',
    country: 'ENG',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Championship',
    toLeagueName: 'Premier League',
    type: 'promotion',
    pos: 1,
    reason: 'Champions · Immediate Rebound',
    clubColor: '#0053a0'
  },
  {
    id: 'base-eng-2',
    year: 2024,
    clubId: 718,
    clubName: 'Ipswich Town',
    country: 'ENG',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Championship',
    toLeagueName: 'Premier League',
    type: 'promotion',
    pos: 2,
    reason: 'Runners-up · Back-to-Back Promotion',
    clubColor: '#003399'
  },
  {
    id: 'base-eng-3',
    year: 2024,
    clubId: 720,
    clubName: 'Southampton',
    country: 'ENG',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Championship',
    toLeagueName: 'Premier League',
    type: 'promotion',
    pos: 4,
    reason: 'Wembley Playoff Final Winner',
    clubColor: '#d71920'
  },
  {
    id: 'base-eng-4',
    year: 2024,
    clubId: 724,
    clubName: 'Luton Town',
    country: 'ENG',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'Premier League',
    toLeagueName: 'Championship',
    type: 'relegation',
    pos: 18,
    reason: 'Direct Relegation',
    clubColor: '#f78f1e'
  },
  {
    id: 'base-eng-5',
    year: 2024,
    clubId: 722,
    clubName: 'Burnley',
    country: 'ENG',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'Premier League',
    toLeagueName: 'Championship',
    type: 'relegation',
    pos: 19,
    reason: 'Direct Relegation',
    clubColor: '#6c1d45'
  },
  {
    id: 'base-eng-6',
    year: 2024,
    clubId: 723,
    clubName: 'Sheffield United',
    country: 'ENG',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'Premier League',
    toLeagueName: 'Championship',
    type: 'relegation',
    pos: 20,
    reason: 'Direct Relegation',
    clubColor: '#ee2737'
  },
  {
    id: 'base-eng-7',
    year: 2024,
    clubId: 743,
    clubName: 'Portsmouth',
    country: 'ENG',
    fromTier: 3,
    toTier: 2,
    fromLeagueName: 'League One',
    toLeagueName: 'Championship',
    type: 'promotion',
    pos: 1,
    reason: 'Champions · Title Return',
    clubColor: '#001489'
  },
  {
    id: 'base-eng-8',
    year: 2024,
    clubId: 741,
    clubName: 'Derby County',
    country: 'ENG',
    fromTier: 3,
    toTier: 2,
    fromLeagueName: 'League One',
    toLeagueName: 'Championship',
    type: 'promotion',
    pos: 2,
    reason: 'Runners-up · Post-Administration Rise',
    clubColor: '#000000'
  },
  {
    id: 'base-eng-9',
    year: 2024,
    clubId: 742,
    clubName: 'Oxford United',
    country: 'ENG',
    fromTier: 3,
    toTier: 2,
    fromLeagueName: 'League One',
    toLeagueName: 'Championship',
    type: 'promotion',
    pos: 5,
    reason: 'Playoff Final Victory',
    clubColor: '#ffd700'
  },
  {
    id: 'base-eng-10',
    year: 2024,
    clubId: 737,
    clubName: 'Birmingham City',
    country: 'ENG',
    fromTier: 2,
    toTier: 3,
    fromLeagueName: 'Championship',
    toLeagueName: 'League One',
    type: 'relegation',
    pos: 22,
    reason: 'Final Day Relegation',
    clubColor: '#0000ff'
  },
  {
    id: 'base-eng-11',
    year: 2024,
    clubId: 746,
    clubName: 'Huddersfield Town',
    country: 'ENG',
    fromTier: 2,
    toTier: 3,
    fromLeagueName: 'Championship',
    toLeagueName: 'League One',
    type: 'relegation',
    pos: 23,
    reason: 'Direct Relegation',
    clubColor: '#0e63ad'
  },
  {
    id: 'base-eng-12',
    year: 2024,
    clubId: 754,
    clubName: 'Rotherham United',
    country: 'ENG',
    fromTier: 2,
    toTier: 3,
    fromLeagueName: 'Championship',
    toLeagueName: 'League One',
    type: 'relegation',
    pos: 24,
    reason: 'Direct Relegation',
    clubColor: '#d81e05'
  },

  // Spain (ESP)
  {
    id: 'base-esp-1',
    year: 2024,
    clubId: 517,
    clubName: 'Real Valladolid CF',
    country: 'ESP',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Segunda División',
    toLeagueName: 'La Liga',
    type: 'promotion',
    pos: 1,
    reason: 'Direct Promotion',
    clubColor: '#5b2382'
  },
  {
    id: 'base-esp-2',
    year: 2024,
    clubId: 518,
    clubName: 'CD Leganés',
    country: 'ESP',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Segunda División',
    toLeagueName: 'La Liga',
    type: 'promotion',
    pos: 2,
    reason: 'Champions · Top-Flight Return',
    clubColor: '#0047ba'
  },
  {
    id: 'base-esp-3',
    year: 2024,
    clubId: 514,
    clubName: 'RCD Espanyol',
    country: 'ESP',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Segunda División',
    toLeagueName: 'La Liga',
    type: 'promotion',
    pos: 4,
    reason: 'Playoff Final Victory',
    clubColor: '#0072ce'
  },
  {
    id: 'base-esp-4',
    year: 2024,
    clubId: 523,
    clubName: 'Cádiz CF',
    country: 'ESP',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'La Liga',
    toLeagueName: 'Segunda División',
    type: 'relegation',
    pos: 18,
    reason: 'Direct Relegation',
    clubColor: '#fef08a'
  },
  {
    id: 'base-esp-5',
    year: 2024,
    clubId: 522,
    clubName: 'UD Almería',
    country: 'ESP',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'La Liga',
    toLeagueName: 'Segunda División',
    type: 'relegation',
    pos: 19,
    reason: 'Direct Relegation',
    clubColor: '#ed1c24'
  },
  {
    id: 'base-esp-6',
    year: 2024,
    clubId: 521,
    clubName: 'Granada CF',
    country: 'ESP',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'La Liga',
    toLeagueName: 'Segunda División',
    type: 'relegation',
    pos: 20,
    reason: 'Direct Relegation',
    clubColor: '#a6192e'
  },
  {
    id: 'base-esp-7',
    year: 2024,
    clubId: 537,
    clubName: 'Deportivo La Coruña',
    country: 'ESP',
    fromTier: 3,
    toTier: 2,
    fromLeagueName: 'Primera Federación',
    toLeagueName: 'Segunda División',
    type: 'promotion',
    pos: 1,
    reason: 'Champions · Awakening of Fallen Giant',
    clubColor: '#0047ba'
  },

  // Italy (ITA)
  {
    id: 'base-ita-1',
    year: 2024,
    clubId: 919,
    clubName: 'Parma Calcio 1913',
    country: 'ITA',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Serie B',
    toLeagueName: 'Serie A',
    type: 'promotion',
    pos: 1,
    reason: 'Serie B Champions · Top-Flight Ascent',
    clubColor: '#f7d117'
  },
  {
    id: 'base-ita-2',
    year: 2024,
    clubId: 920,
    clubName: 'Como 1907',
    country: 'ITA',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Serie B',
    toLeagueName: 'Serie A',
    type: 'promotion',
    pos: 2,
    reason: 'Historic Return to Serie A after 21 Years',
    clubColor: '#003399'
  },
  {
    id: 'base-ita-3',
    year: 2024,
    clubId: 922,
    clubName: 'Venezia FC',
    country: 'ITA',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Serie B',
    toLeagueName: 'Serie A',
    type: 'promotion',
    pos: 3,
    reason: 'Playoff Final Victory',
    clubColor: '#ff6600'
  },
  {
    id: 'base-ita-4',
    year: 2024,
    clubId: 931,
    clubName: 'Frosinone Calcio',
    country: 'ITA',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'Serie A',
    toLeagueName: 'Serie B',
    type: 'relegation',
    pos: 18,
    reason: 'Direct Relegation',
    clubColor: '#fecb00'
  },
  {
    id: 'base-ita-5',
    year: 2024,
    clubId: 921,
    clubName: 'US Sassuolo Calcio',
    country: 'ITA',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'Serie A',
    toLeagueName: 'Serie B',
    type: 'relegation',
    pos: 19,
    reason: 'Relegated after 11 Seasons in Top Flight',
    clubColor: '#00843d'
  },
  {
    id: 'base-ita-6',
    year: 2024,
    clubId: 925,
    clubName: 'US Salernitana 1919',
    country: 'ITA',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'Serie A',
    toLeagueName: 'Serie B',
    type: 'relegation',
    pos: 20,
    reason: 'Direct Relegation',
    clubColor: '#700000'
  },

  // France (FRA)
  {
    id: 'base-fra-1',
    year: 2024,
    clubId: 415,
    clubName: 'AJ Auxerre',
    country: 'FRA',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Ligue 2',
    toLeagueName: 'Ligue 1',
    type: 'promotion',
    pos: 1,
    reason: 'Ligue 2 Champions',
    clubColor: '#0047ba'
  },
  {
    id: 'base-fra-2',
    year: 2024,
    clubId: 416,
    clubName: 'Angers SCO',
    country: 'FRA',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Ligue 2',
    toLeagueName: 'Ligue 1',
    type: 'promotion',
    pos: 2,
    reason: 'Direct Promotion',
    clubColor: '#000000'
  },
  {
    id: 'base-fra-3',
    year: 2024,
    clubId: 419,
    clubName: 'AS Saint-Étienne',
    country: 'FRA',
    fromTier: 2,
    toTier: 1,
    fromLeagueName: 'Ligue 2',
    toLeagueName: 'Ligue 1',
    type: 'promotion',
    pos: 3,
    reason: 'Barrages Playoff Extra-Time Victory',
    clubColor: '#008000'
  },
  {
    id: 'base-fra-4',
    year: 2024,
    clubId: 420,
    clubName: 'FC Metz',
    country: 'FRA',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'Ligue 1',
    toLeagueName: 'Ligue 2',
    type: 'relegation',
    pos: 16,
    reason: 'Playoff Defeat in Barrages',
    clubColor: '#800020'
  },
  {
    id: 'base-fra-5',
    year: 2024,
    clubId: 421,
    clubName: 'FC Lorient',
    country: 'FRA',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'Ligue 1',
    toLeagueName: 'Ligue 2',
    type: 'relegation',
    pos: 17,
    reason: 'Direct Relegation',
    clubColor: '#f15a24'
  },
  {
    id: 'base-fra-6',
    year: 2024,
    clubId: 422,
    clubName: 'Clermont Foot',
    country: 'FRA',
    fromTier: 1,
    toTier: 2,
    fromLeagueName: 'Ligue 1',
    toLeagueName: 'Ligue 2',
    type: 'relegation',
    pos: 18,
    reason: 'Direct Relegation',
    clubColor: '#002f6c'
  },
  {
    id: 'base-fra-7',
    year: 2024,
    clubId: 425,
    clubName: 'Girondins de Bordeaux',
    country: 'FRA',
    fromTier: 2,
    toTier: 4,
    fromLeagueName: 'Ligue 2',
    toLeagueName: 'National 2',
    type: 'insolvency_drop',
    pos: 12,
    reason: 'Bankruptcy & DNCG Administrative Demotion',
    clubColor: '#001489'
  },

  // International Continental & World Cup Glory (2024 Champions)
  {
    id: 'base-cup-cl-2024',
    year: 2024,
    clubId: 501,
    clubName: 'Real Madrid CF',
    country: 'ESP',
    fromTier: 1,
    toTier: 1,
    fromLeagueName: 'Champions Cup',
    toLeagueName: 'Champions',
    type: 'cup_champion',
    pos: 1,
    reason: 'Champions Cup Winners · 15th European Crown',
    clubColor: '#ffffff'
  },
  {
    id: 'base-cup-el-2024',
    year: 2024,
    clubId: 905,
    clubName: 'Atalanta BC',
    country: 'ITA',
    fromTier: 1,
    toTier: 1,
    fromLeagueName: 'Euro Cup',
    toLeagueName: 'Champions',
    type: 'cup_champion',
    pos: 1,
    reason: 'Euro Cup Winners · Historic First European Trophy',
    clubColor: '#1f53a3'
  },
  {
    id: 'base-cup-ecl-2024',
    year: 2024,
    clubId: 3601,
    clubName: 'Olympiacos FC',
    country: 'GRE',
    fromTier: 1,
    toTier: 1,
    fromLeagueName: 'Euro Challenge Cup',
    toLeagueName: 'Champions',
    type: 'cup_champion',
    pos: 1,
    reason: 'Euro Challenge Cup Winners · Historic Continental Glory',
    clubColor: '#cc0000'
  },
  {
    id: 'base-cup-cwc-2024',
    year: 2024,
    clubId: 701,
    clubName: 'Manchester City',
    country: 'ENG',
    fromTier: 1,
    toTier: 1,
    fromLeagueName: 'Global Club Cup',
    toLeagueName: 'World Champions',
    type: 'cup_champion',
    pos: 1,
    reason: 'Global Club Cup Winners · World Club Champions',
    clubColor: '#6cabdd'
  },
  {
    id: 'base-cup-libertadores-2024',
    year: 2024,
    clubId: 1404,
    clubName: 'Fluminense FC',
    country: 'BRA',
    fromTier: 1,
    toTier: 1,
    fromLeagueName: 'Copa Libertadores',
    toLeagueName: 'Champions',
    type: 'cup_champion',
    pos: 1,
    reason: 'Copa Libertadores Winners · Kings of South America',
    clubColor: '#800000'
  },
  {
    id: 'base-cup-sudamericana-2024',
    year: 2024,
    clubId: 851,
    clubName: 'LDU Quito',
    country: 'ECU',
    fromTier: 1,
    toTier: 1,
    fromLeagueName: 'Copa Sudamericana',
    toLeagueName: 'Champions',
    type: 'cup_champion',
    pos: 1,
    reason: 'Copa Sudamericana Winners · Continental Glory',
    clubColor: '#ffffff'
  },
  {
    id: 'base-cup-concacaf-2024',
    year: 2024,
    clubId: 2207,
    clubName: 'CF Pachuca',
    country: 'MEX',
    fromTier: 1,
    toTier: 1,
    fromLeagueName: 'Concacaf Champions Cup',
    toLeagueName: 'Champions',
    type: 'cup_champion',
    pos: 1,
    reason: 'Concacaf Champions Cup Winners · Kings of North America',
    clubColor: '#00205b'
  },
  {
    id: 'base-cup-leagues-2024',
    year: 2024,
    clubId: 1005,
    clubName: 'Columbus Crew',
    country: 'USA',
    fromTier: 1,
    toTier: 1,
    fromLeagueName: 'Leagues Challenge',
    toLeagueName: 'Champions',
    type: 'cup_champion',
    pos: 1,
    reason: 'Leagues Challenge Winners · North American Triumph',
    clubColor: '#fef200'
  },
  {
    id: 'base-cup-afc-2024',
    year: 2024,
    clubId: 2004,
    clubName: 'Urawa Red Diamonds',
    country: 'JPN',
    fromTier: 1,
    toTier: 1,
    fromLeagueName: 'AFC Champions League',
    toLeagueName: 'Champions',
    type: 'cup_champion',
    pos: 1,
    reason: 'AFC Champions League Winners · Kings of Asia',
    clubColor: '#e60012'
  }
];

/**
 * Returns all universe movements accumulated in career, merged with baseline historical shifts.
 */
export function getAllUniverseMovements(
  state: GameState,
  clubsDb: Club[],
  isModActive?: boolean
): UniverseMovement[] {
  const dynamicMovements = state.universeMovements || [];
  
  // Tag current user club if matching
  const userClubName = state.club?.name;
  
  // Set of all former clubs the manager previously managed in their career
  const formerClubNames = new Set<string>();
  (state.history || []).forEach(h => {
    if (h.clubName && h.clubName !== userClubName) {
      formerClubNames.add(h.clubName);
    }
  });

  // Synthesize movements from season history so every managed campaign is tracked in universe movements
  const synthesizedHistoryMovements: UniverseMovement[] = [];
  const history = state.history || [];
  
  for (let i = 0; i < history.length; i++) {
    const hist = history[i];
    const nextHist = history[i + 1];
    const prevTier = hist.tier;
    const isCurr = (hist.clubName || userClubName) === userClubName;
    const isSameClubNext = Boolean(
      nextHist && (
        (hist.clubId != null && nextHist.clubId != null && String(nextHist.clubId) === String(hist.clubId)) ||
        (hist.clubName && nextHist.clubName && nextHist.clubName.toLowerCase().trim() === hist.clubName.toLowerCase().trim())
      )
    );
    const hasKnownNextTier = Boolean(isSameClubNext || (!nextHist && isCurr));
    const country = hist.country || state.club.country || 'GER';
    const rawNextTier = isSameClubNext
      ? nextHist.tier
      : (!nextHist && isCurr ? (state.club.tier || prevTier) : prevTier);
    const isPast = !isCurr && formerClubNames.has(hist.clubName);
    const clubName = hist.clubName || userClubName || '';
    const clubColor = (isCurr ? state.club.color : undefined) || hist.color;

    // Purge any erroneous 'relegation' movement for a club that finished 1st (champion) in this season
    const normClub = clubName.toLowerCase().trim();
    if (hist.pos === 1) {
      for (let d = dynamicMovements.length - 1; d >= 0; d--) {
        const dm = dynamicMovements[d];
        const dmNorm = (dm.clubName || '').toLowerCase().trim();
        const matchesClub = (hist.clubId != null && dm.clubId === hist.clubId) || dmNorm === normClub;
        if (dm.year === hist.year && matchesClub && dm.type === 'relegation') {
          dynamicMovements.splice(d, 1);
        }
      }
    }

    // Check if dynamicMovements already has a valid movement for this club and year
    const hasExistingMove = dynamicMovements.some(
      m => {
        const mNorm = (m.clubName || '').toLowerCase().trim();
        const matches = (hist.clubId != null && m.clubId === hist.clubId) || mNorm === normClub;
        return m.year === hist.year && matches && (m.type === 'promotion' || m.type === 'title_won' || m.type === 'insolvency_drop' || (m.type === 'relegation' && hist.pos !== 1));
      }
    );
    if (hasExistingMove) continue;

    const isChamp = hist.pos === 1;
    const isInsolv = Boolean(hist.bankrupt || hist.financialRelegation);
    const isPromo = !isChamp && (hasKnownNextTier ? prevTier > rawNextTier : (hist.pos <= 2 && prevTier > 1));
    const isReleg = !isChamp && (hasKnownNextTier ? prevTier < rawNextTier : (hist.pos >= 17 && prevTier < getMaxTier(country, clubsDb)));
    const nextTier = hasKnownNextTier
      ? rawNextTier
      : isPromo
      ? Math.max(1, prevTier - 1)
      : isReleg
      ? prevTier + 1
      : prevTier;
    const isTop4 = !isChamp && prevTier === 1 && hist.pos <= 4 && !isChamp;

    const fromLeagueName = getLeagueInfo(prevTier, country).name;
    const toLeagueName = getLeagueInfo(nextTier, country).name;

    if (isInsolv) {
      synthesizedHistoryMovements.push({
        id: `user-move-${hist.year}`,
        year: hist.year,
        clubId: hist.clubId || state.club.id,
        clubName,
        clubColor,
        country,
        fromTier: prevTier,
        toTier: nextTier,
        fromLeagueName,
        toLeagueName,
        type: 'insolvency_drop',
        pos: hist.pos,
        reason: hist.bankrupt ? 'Full Insolvency · Forced Demotion' : 'Administrative Financial Demotion',
        isUserClub: isCurr,
        isPastManagerClub: isPast
      });
    } else if (isChamp) {
      synthesizedHistoryMovements.push({
        id: `user-champ-${hist.year}`,
        year: hist.year,
        clubId: hist.clubId || state.club.id,
        clubName,
        clubColor,
        country,
        fromTier: prevTier,
        toTier: prevTier > 1 ? nextTier : prevTier,
        fromLeagueName,
        toLeagueName: prevTier > 1 ? toLeagueName : 'Champions',
        type: 'title_won',
        pos: 1,
        reason: `${fromLeagueName} Champions · Finished #1 (${hist.pts || 0} pts)`,
        isUserClub: isCurr,
        isPastManagerClub: isPast
      });
    } else if (isPromo) {
      synthesizedHistoryMovements.push({
        id: `user-move-${hist.year}`,
        year: hist.year,
        clubId: hist.clubId || state.club.id,
        clubName,
        clubColor,
        country,
        fromTier: prevTier,
        toTier: nextTier,
        fromLeagueName,
        toLeagueName,
        type: 'promotion',
        pos: hist.pos,
        reason: `Finished Position #${hist.pos} (${hist.pts || 0} pts) · Promoted to ${toLeagueName}`,
        isUserClub: isCurr,
        isPastManagerClub: isPast
      });
    } else if (isReleg) {
      synthesizedHistoryMovements.push({
        id: `user-move-${hist.year}`,
        year: hist.year,
        clubId: hist.clubId || state.club.id,
        clubName,
        clubColor,
        country,
        fromTier: prevTier,
        toTier: nextTier,
        fromLeagueName,
        toLeagueName,
        type: 'relegation',
        pos: hist.pos,
        reason: `Finished Position #${hist.pos} (${hist.pts || 0} pts) · Relegated to ${toLeagueName}`,
        isUserClub: isCurr,
        isPastManagerClub: isPast
      });
    } else {
      const isContinentalCountry = country === 'CAN' || country === 'USA';
      const continentalCompName = isContinentalCountry
        ? 'CONCACAF Champions Cup'
        : country === 'ARG' || country === 'BRA'
        ? 'CONMEBOL Libertadores'
        : country === 'JPN' || country === 'KSA' || country === 'AUS'
        ? 'AFC Champions League'
        : 'European Continental';

      synthesizedHistoryMovements.push({
        id: `user-campaign-${hist.year}`,
        year: hist.year,
        clubId: hist.clubId || state.club.id,
        clubName,
        clubColor,
        country,
        fromTier: prevTier,
        toTier: prevTier,
        fromLeagueName,
        toLeagueName: isTop4 ? 'Continental Stage' : fromLeagueName,
        type: isTop4 ? 'continental_qual' : 'relegation_avoided',
        pos: hist.pos,
        reason: isTop4 
          ? `Finished Position #${hist.pos} (${hist.pts || 0} pts) · ${continentalCompName} Qualification`
          : `Finished Position #${hist.pos} in ${fromLeagueName} (${hist.pts || 0} pts · Midtable)`,
        isUserClub: isCurr,
        isPastManagerClub: isPast
      });
    }
  }

  // Synthesize international cup triumphs (e.g. Champions Cup, Global Club Cup)
  const synthesizedCupMovements: UniverseMovement[] = [];
  const existingCupKeys = new Set<string>();
  dynamicMovements.forEach(m => {
    if (m.type === 'cup_champion') {
      existingCupKeys.add(`${m.clubName}-${m.year}-${m.fromLeagueName}`);
    }
  });

  (state.trophyHistory || []).forEach(t => {
    // Both international and domestic cup triumphs from trophy history
    const isCupTrophy = !/tier|lower|league title|division/i.test(t.name);
    const key = `${t.clubName}-${t.year}-${t.name}`;
    if (isCupTrophy && !existingCupKeys.has(key)) {
      existingCupKeys.add(key);
      const isCurr = t.clubName === userClubName;
      const cleanName = t.name.replace(/^🏆\s*/, '');
      const isIntl = /champion|elite|libertadores|sudamericana|world|global|recopa/i.test(cleanName);
      synthesizedCupMovements.push({
        id: `user-trophy-${t.year}-${cleanName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        year: t.year,
        clubId: state.club.id,
        clubName: t.clubName,
        clubColor: t.color || state.club.color,
        clubLogo: t.logo || state.club.logo,
        country: state.club.country || 'GER',
        fromTier: 1,
        toTier: 1,
        fromLeagueName: cleanName,
        toLeagueName: 'Champions',
        type: 'cup_champion',
        pos: 1,
        reason: `${cleanName} Winners · ${isIntl ? 'International Glory' : 'Domestic Triumph'}`,
        isUserClub: isCurr,
        isPastManagerClub: !isCurr && formerClubNames.has(t.clubName)
      });
    }
  });

  // Initial collected pool of movements
  const allInitial = [
    ...dynamicMovements,
    ...synthesizedHistoryMovements,
    ...synthesizedCupMovements,
    ...BASELINE_UNIVERSE_MOVEMENTS
  ];

  // Continental & World Cup Templates for complete historical & ongoing coverage
  const CONTINENTAL_CUP_TEMPLATES = [
    { key: 'cl', name: 'Champions Cup', region: 'UEFA', matcher: /champion.*cup|euro.*champion/i, defaultCountry: 'ESP', reason: 'Champions Cup Winners · European Crown' },
    { key: 'el', name: 'Euro Cup', region: 'UEFA', matcher: /^euro.*cup|europa/i, defaultCountry: 'ITA', reason: 'Euro Cup Winners · European Glory' },
    { key: 'ecl', name: 'Euro Challenge Cup', region: 'UEFA', matcher: /challenge.*cup|conference/i, defaultCountry: 'GRE', reason: 'Euro Challenge Cup Winners · Continental Glory' },
    { key: 'cwc', name: 'Global Club Cup', region: 'WORLD', matcher: /global.*club|world.*club|cwc/i, defaultCountry: 'ENG', reason: 'Global Club Cup Winners · World Club Champions' },
    { key: 'libertadores', name: 'Copa Libertadores', region: 'CONMEBOL', matcher: /libertadores/i, defaultCountry: 'BRA', reason: 'Copa Libertadores Winners · Kings of South America' },
    { key: 'sudamericana', name: 'Copa Sudamericana', region: 'CONMEBOL', matcher: /sudamericana/i, defaultCountry: 'ARG', reason: 'Copa Sudamericana Winners · Continental Glory' },
    { key: 'concacaf', name: 'Concacaf Champions Cup', region: 'CONCACAF', matcher: /concacaf/i, defaultCountry: 'MEX', reason: 'Concacaf Champions Cup Winners · Kings of North America' },
    { key: 'leagues', name: 'Leagues Challenge', region: 'CONCACAF', matcher: /leagues.*challenge|leagues.*cup/i, defaultCountry: 'USA', reason: 'Leagues Challenge Winners · North American Triumph' },
    { key: 'afc', name: 'AFC Champions League', region: 'AFC', matcher: /afc|asian.*champion/i, defaultCountry: 'JPN', reason: 'AFC Champions League Winners · Kings of Asia' },
  ];

  const currentActiveYear = Number(state.year) || 2026;
  const maxYear = currentActiveYear > 2026
    ? Math.max(2026, currentActiveYear - 1, ...allInitial.map(m => Number(m.year) || 2024))
    : Math.max(2024, ...allInitial.map(m => Number(m.year) || 2024));

  const yearsToFill = new Set<number>([2024]);
  if (maxYear >= 2026) {
    for (let yr = 2026; yr <= maxYear; yr++) {
      yearsToFill.add(yr);
    }
  }
  for (const m of allInitial) {
    const yr = Number(m.year);
    if (yr >= 2024) yearsToFill.add(yr);
  }

  const candidateSource = Array.isArray(clubsDb) && clubsDb.length > 0 ? clubsDb : ALL_CLUBS;
  const uefaClubs = candidateSource.filter(c => c.tier === 1 && UEFA_COUNTRIES.includes((c.country || 'GER').toUpperCase())).sort((a, b) => b.baseOvr - a.baseOvr);
  const conmebolClubs = candidateSource.filter(c => c.tier === 1 && CONMEBOL_COUNTRIES.includes((c.country || 'BRA').toUpperCase())).sort((a, b) => b.baseOvr - a.baseOvr);
  const concacafClubs = candidateSource.filter(c => c.tier === 1 && CONCACAF_COUNTRIES.includes((c.country || 'USA').toUpperCase())).sort((a, b) => b.baseOvr - a.baseOvr);
  const afcClubs = candidateSource.filter(c => c.tier === 1 && AFC_COUNTRIES.includes((c.country || 'JPN').toUpperCase())).sort((a, b) => b.baseOvr - a.baseOvr);

  const backfilledCupMovements: UniverseMovement[] = [];

  for (const yr of Array.from(yearsToFill).sort((a, b) => a - b)) {
    for (const tmpl of CONTINENTAL_CUP_TEMPLATES) {
      const alreadyHasCup = allInitial.some(m => m.type === 'cup_champion' && Number(m.year) === yr && tmpl.matcher.test(m.fromLeagueName || ''));
      if (alreadyHasCup) continue;

      let pool = uefaClubs;
      if (tmpl.region === 'CONMEBOL') pool = conmebolClubs;
      else if (tmpl.region === 'CONCACAF') pool = concacafClubs;
      else if (tmpl.region === 'AFC') pool = afcClubs;
      else if (tmpl.region === 'WORLD') pool = uefaClubs;

      if (pool.length === 0) pool = candidateSource.filter(c => c.tier === 1);
      if (pool.length === 0) continue;

      // Realistic selection pool: top heavyweights for premier trophies
      const isPremier = tmpl.key === 'cl' || tmpl.key === 'cwc' || tmpl.key === 'libertadores';
      const selectionPool = isPremier ? pool.slice(0, Math.min(8, pool.length)) : pool.slice(0, Math.min(16, pool.length));

      // Deterministic pseudo-random index
      const seed = ((yr * 997 + tmpl.key.charCodeAt(0) * 31) >>> 0) % selectionPool.length;
      const offset = tmpl.key === 'el' ? 1 : tmpl.key === 'ecl' ? 2 : tmpl.key === 'sudamericana' ? 1 : tmpl.key === 'leagues' ? 1 : 0;
      const champ = selectionPool[(seed + offset) % selectionPool.length];

      backfilledCupMovements.push({
        id: `synth-cup-${tmpl.key}-${yr}`,
        year: yr,
        clubId: champ.id,
        clubName: champ.name,
        clubLogo: champ.logo,
        clubColor: champ.color,
        country: champ.country || tmpl.defaultCountry,
        fromTier: 1,
        toTier: 1,
        fromLeagueName: tmpl.name,
        toLeagueName: tmpl.region === 'WORLD' ? 'World Champions' : 'Champions',
        type: 'cup_champion',
        pos: 1,
        reason: tmpl.reason
      });
    }
  }

  // Combine all initial movements + backfilled cup movements
  const all = [
    ...allInitial,
    ...backfilledCupMovements
  ];

  // Determine active mod state (strictly defaults to false if window localStorage says false, or true if in test)
  const effectiveModActive = isModActive !== undefined
    ? isModActive
    : (typeof window !== 'undefined' ? localStorage.getItem('fms_real_mod_active') === 'true' : true);

  // Index clubsDb by ID and lowercased name for fast lookup
  const clubById = new Map<number, Club>();
  const clubByName = new Map<string, Club>();
  if (Array.isArray(clubsDb)) {
    clubsDb.forEach(c => {
      if (c.id != null) clubById.set(c.id, c);
      if (c.name) clubByName.set(c.name.toLowerCase().trim(), c);
    });
  }

  // Pre-index default unmodded clubs from ALL_CLUBS (canonical clubsData.ts dataset)
  const defaultClubById = new Map<number, Club>();
  ALL_CLUBS.forEach(c => {
    if (c.id != null) defaultClubById.set(c.id, c);
  });
  defaultClubById.set(3601, { id: 3601, name: 'Piraeus Red', tier: 1, baseOvr: 78, color: 'cc0000', stadium: 32115, country: 'GRE' } as Club);

  // Pre-index mod clubs from TEAMS
  const modClubById = new Map<number, any>();
  TEAMS.forEach(t => {
    if (t.id != null) modClubById.set(t.id, t);
  });

  // Mark isUserClub, isPastManagerClub, and resolve names/assets strictly according to mod state
  return all.map(m => {
    const isUser = Boolean(m.isUserClub || (userClubName && m.clubName === userClubName));
    const isPast = Boolean(!isUser && formerClubNames.has(m.clubName));

    // Resolve clubId
    let clubId = typeof m.clubId === 'number' ? m.clubId : undefined;
    if (clubId == null && m.clubName) {
      const lower = m.clubName.toLowerCase().trim();
      if (REAL_CLUB_ALIASES[lower] != null) {
        clubId = REAL_CLUB_ALIASES[lower];
      }
    }

    const dbClub = (clubId != null ? clubById.get(clubId) : undefined) ||
                   (m.clubName ? clubByName.get(m.clubName.toLowerCase().trim()) : undefined);

    if (clubId == null && dbClub?.id != null) {
      clubId = dbClub.id;
    }

    // Determine resolved name
    let resolvedName = m.clubName;
    if (isUser && state.club?.name) {
      resolvedName = state.club.name;
    } else if (effectiveModActive) {
      // Mod is ON: prefer real authentic mod name
      const modClub = clubId != null ? modClubById.get(clubId) : undefined;
      resolvedName = modClub?.name || dbClub?.name || m.clubName;
    } else {
      // Mod is OFF: strictly use unmodded / fictional club name from clubsData.ts (ALL_CLUBS or unmodded clubsDb)
      const defClub = clubId != null ? defaultClubById.get(clubId) : undefined;
      resolvedName = defClub?.name || dbClub?.name || m.clubName;
    }

    const clubColor = dbClub?.color
      ? (dbClub.color.startsWith('#') ? dbClub.color : `#${dbClub.color}`)
      : (clubId != null && defaultClubById.get(clubId)?.color ? `#${defaultClubById.get(clubId)!.color}` : (m.clubColor || '#38bdf8'));
    
    const clubLogo = dbClub?.logo || dbClub?.fallbackLogo || m.clubLogo;

    // CRITICAL: Integrity enforcement - if a movement is a champion (pos === 1, title winner, or cup champion), it can NEVER be typed as 'relegation'!
    const isChampMove = 
      m.pos === 1 || 
      m.type === 'title_won' || 
      m.type === 'cup_champion' || 
      (typeof m.reason === 'string' && /(?:^|\b)(?:champion|meister|winner|trophy|glory|triumph)(?:\b|$)/i.test(m.reason));

    let safeType = m.type;
    let safeToLeague = m.toLeagueName;
    let safeReason = m.reason;
    if (m.type === 'relegation' && isChampMove) {
      safeType = m.fromTier > m.toTier ? 'promotion' : 'title_won';
      safeToLeague = m.fromTier > 1 ? m.toLeagueName : 'Champions';
      safeReason = m.reason && /relegat/i.test(m.reason) ? `${m.fromLeagueName} Champions · Finished #1` : m.reason;
    }

    return {
      ...m,
      type: safeType,
      toLeagueName: safeToLeague,
      reason: safeReason,
      clubId,
      clubName: resolvedName,
      clubColor,
      clubLogo,
      isUserClub: isUser,
      isPastManagerClub: isPast
    };
  }).sort((a, b) => b.year - a.year);
}

// Major top European leagues considered benchmark global top flights
export const TOP_LEAGUE_COUNTRIES = new Set(['GER', 'ENG', 'ESP', 'ITA', 'FRA']);

/**
 * Determines whether a universe movement qualifies as a major, high-impact headline story.
 * Strictly curated for:
 * 1. Current user club & past managed clubs
 * 2. Key international cup winners (type === 'cup_champion', e.g. Champions Cup, Global Club Cup)
 * 3. The few top leagues only (Europe's Big 5 + user's current domestic league):
 *    - Champions (Tier 1 champion, or champions promoted into Tier 1)
 *    - Major relegation drama (Tier 1 top-flight relegation drops)
 *    - Insolvency drama (financial administration demotions)
 */
export function isMajorUniverseHeadline(move: UniverseMovement, currentCountry?: string): boolean {
  // 1. Current user club always leads the headlines
  if (move.isUserClub) return true;
  
  // 2. Former clubs the manager previously managed
  if (move.isPastManagerClub) return true;

  // 3. International cup headlines (Champions Cup, Global Club Cup, etc.)
  if (move.type === 'cup_champion') return true;

  // 4. Few top leagues only: Europe's Big 5 + user's active domestic league
  const isTopLeagueCountry = TOP_LEAGUE_COUNTRIES.has(move.country) || (Boolean(currentCountry) && move.country === currentCountry);
  if (!isTopLeagueCountry) return false;

  // 5. Severe insolvency drama in top leagues
  if (move.type === 'insolvency_drop') return true;

  // 6. Title Champions, Blockbuster Transfers & Cinderella Breakthroughs
  if (move.type === 'title_won' || move.type === 'transfer_saga' || move.type === 'cinderella_surge') return true;

  // 7. Major relegation drama (dropping out of Tier 1 top flight)
  if (move.fromTier === 1 && move.type === 'relegation') return true;

  // 8. Key champions in the top leagues:
  // - Division champion promoted into Tier 1 (e.g. 2. Bundesliga, Championship, Serie B, Segunda, Ligue 2 champion)
  // - Or Tier 1 title champion
  if (move.pos === 1 && (move.toTier === 1 || move.fromTier === 1)) return true;

  return false;
}

/**
 * Resolves narrative category badges and styling for sports headline cards.
 */
export function getHeadlineCategory(move: UniverseMovement): { label: string; color: string; icon: string } {
  if (move.type === 'transfer_saga') {
    return {
      label: move.isUserClub ? 'YOUR CLUB (TRANSFER)' : 'BLOCKBUSTER TRANSFER',
      color: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      icon: 'fa-arrow-right-arrow-left'
    };
  }

  const isContQual = (move as any).type === 'continental_qual' || (move.pos != null && move.pos > 1 && /continental|qualification/i.test(move.reason || ''));

  const isChampionOrWinner = !isContQual && (
    move.pos === 1 || 
    move.type === 'title_won' || 
    move.type === 'cup_champion' ||
    (typeof move.reason === 'string' && /(?:^|\b)(?:champion|meister|winner|trophy|glory|triumph)(?:\b|$)/i.test(move.reason))
  );

  if (move.isUserClub) {
    if (isContQual) {
      return {
        label: 'YOUR CLUB (CONTINENTAL)',
        color: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
        icon: 'fa-globe'
      };
    }
    return {
      label: move.type === 'cup_champion' ? 'YOUR GLORY' : (isChampionOrWinner ? 'YOUR CHAMPIONS' : 'YOUR CLUB'),
      color: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      icon: move.type === 'cup_champion' ? 'fa-trophy' : (isChampionOrWinner ? 'fa-crown' : 'fa-star')
    };
  }
  if (move.isPastManagerClub) {
    if (isContQual) {
      return {
        label: 'FORMER CLUB (CONTINENTAL)',
        color: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
        icon: 'fa-globe'
      };
    }
    return {
      label: isChampionOrWinner ? 'FORMER CLUB (CHAMPIONS)' : 'FORMER CLUB',
      color: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
      icon: isChampionOrWinner ? 'fa-crown' : 'fa-user-tie'
    };
  }
  if (isContQual) {
    const isConcacaf = move.country === 'CAN' || move.country === 'USA' || /concacaf/i.test(move.reason || '');
    return {
      label: isConcacaf ? 'CONCACAF QUALIFICATION' : 'CONTINENTAL QUALIFICATION',
      color: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      icon: 'fa-globe'
    };
  }
  if (move.type === 'title_won' || (isChampionOrWinner && move.type !== 'cup_champion' && move.type !== 'insolvency_drop')) {
    return {
      label: move.fromTier === 1 ? 'LEAGUE CHAMPIONS' : 'DIVISION CHAMPIONS',
      color: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      icon: 'fa-crown'
    };
  }
  if (move.type === 'cup_champion') {
    const league = (move.fromLeagueName || '').toLowerCase();
    if (league.includes('libertadores') || league.includes('sudamericana') || league.includes('recopa')) {
      return {
        label: 'CONMEBOL GLORY',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
        icon: 'fa-earth-americas'
      };
    }
    if (league.includes('concacaf') || league.includes('north american') || league.includes('leagues challenge')) {
      return {
        label: 'CONCACAF GLORY',
        color: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
        icon: 'fa-earth-americas'
      };
    }
    if (league.includes('afc') || league.includes('asian')) {
      return {
        label: 'ASIAN GLORY',
        color: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
        icon: 'fa-earth-asia'
      };
    }
    if (league.includes('global') || league.includes('world') || league.includes('cwc')) {
      return {
        label: 'WORLD CHAMPION',
        color: 'bg-amber-400/25 text-amber-200 border-amber-400/50',
        icon: 'fa-globe'
      };
    }
    if (league.includes('euro') || league.includes('uefa') || league.includes('champions cup') || league.includes('euro cup') || league.includes('euro challenge')) {
      return {
        label: 'EUROPEAN GLORY',
        color: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        icon: 'fa-trophy'
      };
    }
    // Domestic National Cups (e.g. DBU Pokalen, FA Cup, DFB-Pokal, Copa del Rey, Emperor's Cup, etc.)
    return {
      label: 'DOMESTIC CUP',
      color: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      icon: 'fa-trophy'
    };
  }
  if (move.type === 'cinderella_surge') {
    return {
      label: 'CINDERELLA RUN',
      color: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
      icon: 'fa-wand-magic-sparkles'
    };
  }
  if (move.type === 'insolvency_drop') {
    return {
      label: 'INSOLVENCY DRAMA',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: 'fa-triangle-exclamation'
    };
  }
  if (move.type === 'relegation' && !isChampionOrWinner) {
    return {
      label: move.fromTier === 1 ? 'RELEGATION DRAMA' : 'RELEGATED',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: 'fa-arrow-trend-down'
    };
  }
  if (move.toTier === 1) {
    return {
      label: 'ELITE PROMOTION',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: 'fa-arrow-trend-up'
    };
  }
  return {
    label: 'LEAGUE MOVEMENT',
    color: 'bg-white/[0.06] text-zinc-300 border-white/[0.1]',
    icon: 'fa-arrows-up-down'
  };
}
