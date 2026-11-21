import {
  NationalTeam,
  InternationalMatchResult,
  NationalSquadDirection,
  NationalFederationInvestment,
  NationalTrainingFocus,
  PreGameDirective,
  NationalCoachProfile,
  DirectorSynergyResult,
  HostNation,
  GroupStageResult,
  GroupTeam,
  InternationalFirstHalfState,
  WorldCupShootoutKick
} from '../types';

export const NATIONAL_TEAMS: NationalTeam[] = [
  { name: 'Brazil', code: 'BRA', flag: '🇧🇷', color: '#16a34a', ovr: 88, continent: 'CONMEBOL' },
  { name: 'France', code: 'FRA', flag: '🇫🇷', color: '#2563eb', ovr: 89, continent: 'UEFA' },
  { name: 'Argentina', code: 'ARG', flag: '🇦🇷', color: '#38bdf8', ovr: 88, continent: 'CONMEBOL' },
  { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#dc2626', ovr: 87, continent: 'UEFA' },
  { name: 'Spain', code: 'ESP', flag: '🇪🇸', color: '#e11d48', ovr: 87, continent: 'UEFA' },
  { name: 'Germany', code: 'GER', flag: '🇩🇪', color: '#f59e0b', ovr: 86, continent: 'UEFA' },
  { name: 'Portugal', code: 'POR', flag: '🇵🇹', color: '#b91c1c', ovr: 86, continent: 'UEFA' },
  { name: 'Italy', code: 'ITA', flag: '🇮🇹', color: '#1d4ed8', ovr: 85, continent: 'UEFA' },
  { name: 'Netherlands', code: 'NED', flag: '🇳🇱', color: '#ea580c', ovr: 85, continent: 'UEFA' },
  { name: 'Mexico', code: 'MEX', flag: '🇲🇽', color: '#15803d', ovr: 83, continent: 'CONCACAF' },
  { name: 'USA', code: 'USA', flag: '🇺🇸', color: '#1e3a8a', ovr: 82, continent: 'CONCACAF' },
  { name: 'Colombia', code: 'COL', flag: '🇨🇴', color: '#eab308', ovr: 83, continent: 'CONMEBOL' },
  { name: 'Japan', code: 'JPN', flag: '🇯🇵', color: '#0284c7', ovr: 82, continent: 'AFC' },
  { name: 'Turkey', code: 'TUR', flag: '🇹🇷', color: '#ef4444', ovr: 82, continent: 'UEFA' },
  { name: 'South Korea', code: 'KOR', flag: '🇰🇷', color: '#dc2626', ovr: 81, continent: 'AFC' },
  { name: 'Morocco', code: 'MAR', flag: '🇲🇦', color: '#991b1b', ovr: 82, continent: 'CAF' },
  { name: 'Croatia', code: 'CRO', flag: '🇭🇷', color: '#dc2626', ovr: 84, continent: 'UEFA' },
  { name: 'Denmark', code: 'DEN', flag: '🇩🇰', color: '#ef4444', ovr: 83, continent: 'UEFA' },
  { name: 'Norway', code: 'NOR', flag: '🇳🇴', color: '#b91c1c', ovr: 82, continent: 'UEFA' },
  { name: 'Sweden', code: 'SWE', flag: '🇸🇪', color: '#eab308', ovr: 82, continent: 'UEFA' },
  { name: 'Chile', code: 'CHI', flag: '🇨🇱', color: '#dc2626', ovr: 81, continent: 'CONMEBOL' },
  { name: 'Peru', code: 'PER', flag: '🇵🇪', color: '#dc2626', ovr: 80, continent: 'CONMEBOL' },
  { name: 'Paraguay', code: 'PAR', flag: '🇵🇾', color: '#dc2626', ovr: 80, continent: 'CONMEBOL' },
  { name: 'Greece', code: 'GRE', flag: '🇬🇷', color: '#0284c7', ovr: 80, continent: 'UEFA' },
  { name: 'Slovakia', code: 'SVK', flag: '🇸🇰', color: '#2563eb', ovr: 80, continent: 'UEFA' },
  { name: 'Bolivia', code: 'BOL', flag: '🇧🇴', color: '#16a34a', ovr: 77, continent: 'CONMEBOL' },
  { name: 'Indonesia', code: 'IDN', flag: '🇮🇩', color: '#dc2626', ovr: 76, continent: 'AFC' },
  { name: 'India', code: 'IND', flag: '🇮🇳', color: '#0284c7', ovr: 75, continent: 'AFC' }
];

// Standard 4-year FIFA World Cup cycle: 1950, 1954, 1958, ..., 2026, 2030, 2034, etc.
export const isWorldCupYear = (year: number): boolean => {
  return typeof year === 'number' && year >= 1950 && year % 4 === 2;
};

// A director is ONLY eligible for national federation World Cup offers in Tier 1 with reputation > 80
export const isDirectorWorldCupEligible = (tier?: number, reputation?: number): boolean => {
  return tier === 1 && (reputation ?? 0) > 80;
};

// Returns the host nation for a given World Cup edition (1950 to 2062+)
export const getHostNation = (year: number): HostNation => {
  const hosts: Record<number, HostNation> = {
    1950: { name: 'Brazil', code: 'BRA', flag: '🇧🇷', stadium: 'Maracanã', city: 'Rio de Janeiro', ovr: 88 },
    1954: { name: 'Switzerland', code: 'SUI', flag: '🇨🇭', stadium: 'Wankdorf Stadium', city: 'Bern', ovr: 83 },
    1958: { name: 'Sweden', code: 'SWE', flag: '🇸🇪', stadium: 'Råsunda Stadium', city: 'Solna / Stockholm', ovr: 84 },
    1962: { name: 'Chile', code: 'CHI', flag: '🇨🇱', stadium: 'Estadio Nacional', city: 'Santiago', ovr: 82 },
    1966: { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stadium: 'Wembley Stadium', city: 'London', ovr: 87 },
    1970: { name: 'Mexico', code: 'MEX', flag: '🇲🇽', stadium: 'Estadio Azteca', city: 'Mexico City', ovr: 83 },
    1974: { name: 'Germany', code: 'GER', flag: '🇩🇪', stadium: 'Olympiastadion', city: 'Munich', ovr: 88 },
    1978: { name: 'Argentina', code: 'ARG', flag: '🇦🇷', stadium: 'Estadio Monumental', city: 'Buenos Aires', ovr: 88 },
    1982: { name: 'Spain', code: 'ESP', flag: '🇪🇸', stadium: 'Santiago Bernabéu', city: 'Madrid', ovr: 86 },
    1986: { name: 'Mexico', code: 'MEX', flag: '🇲🇽', stadium: 'Estadio Azteca', city: 'Mexico City', ovr: 83 },
    1990: { name: 'Italy', code: 'ITA', flag: '🇮🇹', stadium: 'Stadio Olimpico', city: 'Rome', ovr: 86 },
    1994: { name: 'USA', code: 'USA', flag: '🇺🇸', stadium: 'Rose Bowl', city: 'Pasadena / Los Angeles', ovr: 82 },
    1998: { name: 'France', code: 'FRA', flag: '🇫🇷', stadium: 'Stade de France', city: 'Paris', ovr: 89 },
    2002: { name: 'Japan', code: 'JPN', flag: '🇯🇵', stadium: 'International Stadium', city: 'Yokohama', ovr: 82 },
    2006: { name: 'Germany', code: 'GER', flag: '🇩🇪', stadium: 'Olympiastadion', city: 'Berlin', ovr: 87 },
    2010: { name: 'South Africa', code: 'RSA', flag: '🇿🇦', stadium: 'Soccer City', city: 'Johannesburg', ovr: 81 },
    2014: { name: 'Brazil', code: 'BRA', flag: '🇧🇷', stadium: 'Maracanã', city: 'Rio de Janeiro', ovr: 88 },
    2018: { name: 'Russia', code: 'RUS', flag: '🇷🇺', stadium: 'Luzhniki Stadium', city: 'Moscow', ovr: 82 },
    2022: { name: 'Qatar', code: 'QAT', flag: '🇶🇦', stadium: 'Lusail Stadium', city: 'Doha', ovr: 80 },
    2026: { name: 'USA', code: 'USA', flag: '🇺🇸', stadium: 'MetLife Stadium', city: 'New York / New Jersey', ovr: 82 },
    2030: { name: 'Spain', code: 'ESP', flag: '🇪🇸', stadium: 'Santiago Bernabéu', city: 'Madrid', ovr: 87 },
    2034: { name: 'Saudi Arabia', code: 'KSA', flag: '🇸🇦', stadium: 'King Fahd Stadium', city: 'Riyadh', ovr: 82 },
    2038: { name: 'Germany', code: 'GER', flag: '🇩🇪', stadium: 'Olympiastadion', city: 'Berlin', ovr: 86 },
    2042: { name: 'Brazil', code: 'BRA', flag: '🇧🇷', stadium: 'Maracanã', city: 'Rio de Janeiro', ovr: 88 },
    2046: { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stadium: 'Wembley Stadium', city: 'London', ovr: 87 },
    2050: { name: 'Italy', code: 'ITA', flag: '🇮🇹', stadium: 'San Siro', city: 'Milan', ovr: 85 },
    2054: { name: 'France', code: 'FRA', flag: '🇫🇷', stadium: 'Stade de France', city: 'Paris', ovr: 89 },
    2058: { name: 'Argentina', code: 'ARG', flag: '🇦🇷', stadium: 'Estadio Monumental', city: 'Buenos Aires', ovr: 88 },
    2062: { name: 'Mexico', code: 'MEX', flag: '🇲🇽', stadium: 'Estadio Azteca', city: 'Mexico City', ovr: 83 }
  };

  if (hosts[year]) return hosts[year];
  const keys = Object.keys(hosts).map(Number).sort((a, b) => a - b);
  const cycleIndex = Math.abs(Math.floor((year - 1950) / 4)) % keys.length;
  return hosts[keys[cycleIndex]] || hosts[2026];
};

// Generates Federation job invitations: Host Nation + Home Country + Contender + Dark Horse
export const getEligibleNationalOffers = (managerCountry: string, reputation: number, year: number = 2026): NationalTeam[] => {
  const hostInfo = getHostNation(year);
  let hostTeam = NATIONAL_TEAMS.find(t => t.code === hostInfo.code);
  if (!hostTeam) {
    const hostContinents: Record<string, 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'CAF'> = {
      SUI: 'UEFA', SWE: 'UEFA', CHI: 'CONMEBOL', RSA: 'CAF', RUS: 'UEFA', QAT: 'AFC', KSA: 'AFC'
    };
    const hostColors: Record<string, string> = {
      SUI: '#dc2626', SWE: '#eab308', CHI: '#dc2626', RSA: '#15803d', RUS: '#2563eb', QAT: '#881337', KSA: '#16a34a'
    };
    hostTeam = {
      name: hostInfo.name,
      code: hostInfo.code,
      flag: hostInfo.flag,
      color: hostColors[hostInfo.code] || '#1d4ed8',
      ovr: hostInfo.ovr || 82,
      continent: hostContinents[hostInfo.code] || 'UEFA'
    };
  }

  const homeTeam = NATIONAL_TEAMS.find(t => t.code === managerCountry && t.code !== hostTeam.code);
  const candidates = NATIONAL_TEAMS.filter(t => t.code !== hostTeam.code && t.code !== homeTeam?.code);
  const elitePool = candidates.filter(t => t.ovr >= 85).sort(() => 0.5 - Math.random());
  const challengerPool = candidates.filter(t => t.ovr < 85).sort(() => 0.5 - Math.random());

  const offers: NationalTeam[] = [hostTeam];
  if (homeTeam) offers.push(homeTeam);
  if (elitePool[0] && offers.length < 4) offers.push(elitePool[0]);
  if (challengerPool[0] && offers.length < 4) offers.push(challengerPool[0]);
  if (elitePool[1] && offers.length < 4) offers.push(elitePool[1]);

  return offers.slice(0, 4);
};

// Selects realistic dynamic World Cup knockout opponents from all eligible nations (including Host Nation)
export const selectWorldCupKnockoutOpponent = (
  stage: 'Quarter-Final' | 'Semi-Final' | 'Grand Final',
  userTeam: NationalTeam,
  hostNation?: HostNation,
  excludedCodes: string[] = []
): NationalTeam => {
  const excluded = new Set([userTeam.code, ...excludedCodes]);
  const poolMap = new Map<string, NationalTeam>();

  for (const t of NATIONAL_TEAMS) {
    if (!excluded.has(t.code)) {
      poolMap.set(t.code, t);
    }
  }

  if (hostNation && !excluded.has(hostNation.code) && !poolMap.has(hostNation.code)) {
    poolMap.set(hostNation.code, {
      name: hostNation.name,
      code: hostNation.code,
      flag: hostNation.flag,
      color: '#1d4ed8',
      ovr: hostNation.ovr || 82,
      continent: 'HOST',
    });
  }

  const allEligible = Array.from(poolMap.values());
  const minOvr = stage === 'Grand Final' ? 85 : stage === 'Semi-Final' ? 83 : 81;
  let tierPool = allEligible.filter((t) => t.ovr >= minOvr);
  if (tierPool.length === 0) {
    tierPool = allEligible.length > 0 ? allEligible : NATIONAL_TEAMS.filter((t) => t.code !== userTeam.code);
  }

  // Weight higher-rated contenders and host nation realistically for late knockout rounds
  const weights = tierPool.map((t) => {
    const base = Math.max(1, t.ovr - (minOvr - 2));
    const hostBoost = hostNation && t.code === hostNation.code ? 1.35 : 1;
    return base * base * hostBoost;
  });
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < tierPool.length; i++) {
    r -= weights[i];
    if (r <= 0) return tierPool[i];
  }
  return tierPool[0];
};

// Generates 3 distinct coaching candidates for the Director of Football to appoint
export const getNationalCoachCandidates = (team: NationalTeam): NationalCoachProfile[] => {
  const code = team.code;

  const namesByCode: Record<string, string[]> = {
    BRA: ['Carlos Silveira', 'Marcio Santos', 'Dorival Juninho'],
    FRA: ['Laurent Vasseur', 'Thierry Moreau', 'Antoine Deschamps'],
    ARG: ['Esteban Scaloni', 'Gabriel Heinze', 'Marcelo Gallardo'],
    ENG: ['Gareth Southam', 'Eddie Howe', 'Graham Potter'],
    ESP: ['Luis De La Vega', 'Vicente Moreno', 'Unai Martinez'],
    GER: ['Julian Nagler', 'Hans-Dieter Flick', 'Ralf Rangnick'],
    POR: ['Ruben Amorim', 'Paulo Fonseca', 'Nuno Conceicao'],
    ITA: ['Roberto Mancini', 'Massimo Allegri', 'Luciano Spalletti'],
    NED: ['Ronald Koeman', 'Erik ten Hag', 'Arne Slot'],
    MEX: ['Ignacio Ambriz', 'Jaime Lozano', 'Victor Vucetich'],
    USA: ['Gregg Berhalter', 'Jesse Marsch', 'Steve Cherundolo'],
    COL: ['Nestor Lorenzo', 'Reinaldo Rueda', 'Juan Carlos Osorio'],
    JPN: ['Hajime Moriyasu', 'Toru Oniki', 'Makoto Hasebe'],
    TUR: ['Vincenzo Montella', 'Sergen Yalcin', 'Fatih Terim'],
    KOR: ['Hong Myung-bo', 'Shin Tae-yong', 'Paulo Bento'],
    MAR: ['Walid Regragui', 'Herve Renard', 'Tarik Sektioui'],
    RUS: ['Valery Karpin', 'Stanislav Cherchesov', 'Leonid Slutsky'],
    QAT: ['Tintin Marquez', 'Felix Sanchez', 'Wissam Rizk'],
    KSA: ['Roberto Mancini', 'Herve Renard', 'Juan Antonio Pizzi'],
    SUI: ['Murat Yakin', 'Lucien Favre', 'Vladimir Petkovic'],
    SWE: ['Jon Dahl Tomasson', 'Janne Andersson', 'Lars Lagerback'],
    CHI: ['Ricardo Gareca', 'Eduardo Berizzo', 'Jorge Sampaoli'],
    RSA: ['Hugo Broos', 'Pitso Mosimane', 'Benni McCarthy'],
    CRO: ['Zlatko Dalić', 'Igor Bišćan', 'Nenad Bjelica'],
    DEN: ['Kasper Hjulmand', 'Brian Riemer', 'Thomas Frank'],
    NOR: ['Ståle Solbakken', 'Kjetil Knutsen', 'Ole Gunnar Solskjær'],
    PER: ['Jorge Fossati', 'Juan Reynoso', 'Roberto Mosquera'],
    PAR: ['Gustavo Alfaro', 'Daniel Garnero', 'Guillermo Schelotto'],
    GRE: ['Ivan Jovanović', 'Gustavo Poyet', 'Giorgos Donis'],
    SVK: ['Francesco Calzona', 'Vladimír Weiss', 'Štefan Tarkovič'],
    BOL: ['Óscar Villegas', 'Antonio Carlos Zago', 'Gustavo Costas'],
    IDN: ['Shin Tae-yong', 'Indra Sjafri', 'Bojan Hodak'],
    IND: ['Manolo Márquez', 'Igor Štimac', 'Stephen Constantine']
  };

  const pool = namesByCode[code] || ['Alex Vance', 'Marcus Stone', 'Mateo Silva'];

  return [
    {
      id: `${code}_coach_1`,
      name: pool[0],
      archetype: 'tactical_ideologue',
      title: 'High-Press Tactical Ideologue',
      tacticalStyle: 'Gegenpress & Vertical Transitions',
      strength: 'Relentless pressing energy & devastating transition speed',
      flaw: 'Demands high stamina; clashes with slower veteran-heavy squads',
      preferredSquadDirection: 'youth_pipeline',
      preferredInvestment: 'high_performance_camp',
      ovrBoost: 2
    },
    {
      id: `${code}_coach_2`,
      name: pool[1],
      archetype: 'tournament_specialist',
      title: 'Pragmatic Knockout Specialist',
      tacticalStyle: 'Compact Structure & Clinical Counters',
      strength: 'Elite knockout game management, clean sheets & ice-cold shootouts',
      flaw: 'Conservative in open play; relies on narrow tactical margins',
      preferredSquadDirection: 'veteran_stalwarts',
      preferredInvestment: 'mental_penalty_protocol',
      ovrBoost: 2
    },
    {
      id: `${code}_coach_3`,
      name: pool[2],
      archetype: 'charismatic_motivator',
      title: 'Galáctico Player-Manager',
      tacticalStyle: 'Total Attacking Freedom & Flair',
      strength: 'Unlocks peak star brilliance & overwhelming attacking confidence',
      flaw: 'Can leave defensive channels exposed if countered',
      preferredSquadDirection: 'golden_generation',
      preferredInvestment: 'high_performance_camp',
      ovrBoost: 2
    }
  ];
};

// Calculates Director Synergy with clear, transparent feedback
export const calculateDirectorSynergy = (
  squadDirection: NationalSquadDirection,
  investment: NationalFederationInvestment,
  coach: NationalCoachProfile
): DirectorSynergyResult => {
  let score = 20;
  const clues: string[] = [];

  // 1. Check Coach vs Squad Direction match
  const matchesSquad =
    coach.preferredSquadDirection === squadDirection ||
    (coach.archetype === 'tournament_specialist' && (squadDirection === 'defensive_fortress' || squadDirection === 'veteran_stalwarts')) ||
    (coach.archetype === 'tactical_ideologue' && (squadDirection === 'golden_generation' || squadDirection === 'youth_pipeline')) ||
    (coach.archetype === 'charismatic_motivator' && (squadDirection === 'golden_generation' || squadDirection === 'youth_pipeline')) ||
    (coach.archetype === 'defensive_general' && (squadDirection === 'defensive_fortress' || squadDirection === 'veteran_stalwarts'));

  const clashesSquad =
    (coach.archetype === 'tactical_ideologue' && squadDirection === 'veteran_stalwarts') ||
    (coach.archetype === 'defensive_general' && squadDirection === 'youth_pipeline') ||
    (coach.archetype === 'charismatic_motivator' && squadDirection === 'defensive_fortress');

  if (matchesSquad) {
    score += 30;
    clues.push(`${coach.name}'s tactical system thrives with your chosen Squad Identity.`);
  } else if (clashesSquad) {
    score -= 20;
    clues.push(`Tactical friction: ${coach.name}'s pressing demands clash with an older Veteran squad.`);
  } else {
    score += 10;
    clues.push(`Solid working relationship between ${coach.name} and the squad profile.`);
  }

  // 2. Check Coach vs Federation Investment match
  const matchesInvestment =
    coach.preferredInvestment === investment ||
    (coach.archetype === 'tournament_specialist' && (investment === 'tactical_analytics' || investment === 'mental_penalty_protocol')) ||
    (coach.archetype === 'tactical_ideologue' && (investment === 'tactical_analytics' || investment === 'high_performance_camp')) ||
    (coach.archetype === 'charismatic_motivator' && investment === 'high_performance_camp') ||
    (coach.archetype === 'defensive_general' && (investment === 'tactical_analytics' || investment === 'mental_penalty_protocol'));

  if (matchesInvestment) {
    score += 25;
    clues.push(`Federation funding directly supercharges ${coach.name}'s preparation blueprint.`);
  } else {
    score += 5;
  }

  // 3. Squad Direction vs Federation Investment harmony (The Manager's Recipe)
  if (
    (squadDirection === 'youth_pipeline' && investment === 'youth_scouting') ||
    (squadDirection === 'golden_generation' && investment === 'high_performance_camp') ||
    (squadDirection === 'defensive_fortress' && investment === 'tactical_analytics') ||
    (squadDirection === 'veteran_stalwarts' && investment === 'mental_penalty_protocol')
  ) {
    score += 25;
    clues.push(`Synergy Bonus: Infrastructure investment directly amplifies your Squad Identity.`);
  } else if (
    (squadDirection === 'youth_pipeline' && investment === 'high_performance_camp') ||
    (squadDirection === 'defensive_fortress' && investment === 'mental_penalty_protocol') ||
    (squadDirection === 'golden_generation' && investment === 'tactical_analytics') ||
    (squadDirection === 'veteran_stalwarts' && investment === 'high_performance_camp')
  ) {
    score += 15;
  } else if (
    (squadDirection === 'youth_pipeline' && investment === 'mental_penalty_protocol') ||
    (squadDirection === 'defensive_fortress' && investment === 'youth_scouting') ||
    (squadDirection === 'veteran_stalwarts' && investment === 'youth_scouting')
  ) {
    score -= 10;
  }

  score = Math.min(100, Math.max(10, score));

  if (score >= 85) {
    return {
      score,
      level: 'flawless',
      title: 'Flawless Strategic Harmony (+5 OVR)',
      desc: `Total federation alignment. ${coach.name}'s philosophy, squad identity, and camp funding create the perfect tournament recipe.`,
      indicatorBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      clues,
      ovrModifier: 5,
      penaltyBonus: 0.10,
      clutchGoalChance: 0.12
    };
  } else if (score >= 65) {
    return {
      score,
      level: 'strong',
      title: 'Solid Strategic Alignment (+2 OVR)',
      desc: `Strong strategic foundation. The squad profile supports ${coach.name}'s system with clear tactical identity.`,
      indicatorBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      clues,
      ovrModifier: 2,
      penaltyBonus: 0.05,
      clutchGoalChance: 0.08
    };
  } else if (score >= 45) {
    return {
      score,
      level: 'neutral',
      title: 'Balanced Blueprint (+0 OVR)',
      desc: `Standard alignment. Match outcomes will rely primarily on raw squad quality and matchday execution.`,
      indicatorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      clues,
      ovrModifier: 0,
      penaltyBonus: 0,
      clutchGoalChance: 0.04
    };
  } else {
    return {
      score,
      level: 'friction',
      title: 'Tactical Friction (-2 OVR)',
      desc: `Warning: ${coach.name}'s tactical demands clash with your chosen squad profile.`,
      indicatorBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      clues,
      ovrModifier: -2,
      penaltyBonus: -0.10,
      clutchGoalChance: 0.02
    };
  }
};

// Knuth Poisson sampler for authentic football goal distributions (clamped 0..7)
export const samplePoissonGoals = (lambda: number, rng: () => number = Math.random): number => {
  const safeLambda = Math.max(0.05, Math.min(4.2, Number.isFinite(lambda) ? lambda : 1.0));
  const limit = Math.exp(-safeLambda);
  let k = 0;
  let p = 1.0;
  do {
    k++;
    p *= Math.max(1e-12, rng());
  } while (p > limit && k < 8);
  return Math.max(0, Math.min(7, k - 1));
};

// Computes realistic full-match (90 min) expected goals (xG) for World Cup fixtures.
// Keeps synergy.ovrModifier (+5/+2/0/-2) meaningful while accounting for AI national team camps
// so matches stay competitive, monotonic with OVR, and faithful to World Cup scoring (~2.5-2.7 goals/match).
export const computeWorldCupExpectedGoals = (params: {
  teamOvr: number;
  oppOvr: number;
  synergyModifier?: number;
  squadDirection?: NationalSquadDirection;
  investment?: NationalFederationInvestment;
  trainingFocus?: NationalTrainingFocus;
  preGameDirective?: PreGameDirective;
  isUserHost?: boolean;
  isOppHost?: boolean;
}): { teamXg: number; oppXg: number; effectiveDiff: number } => {
  // AI national teams also have tournament camps; synergy gives a real relative edge (~45% of raw modifier)
  let effTeam = params.teamOvr + (params.synergyModifier || 0) * 0.45;
  let effOpp = params.oppOvr;

  if (params.squadDirection === 'golden_generation') {
    effTeam += 0.7;
  } else if (params.squadDirection === 'veteran_stalwarts') {
    effTeam += 0.6;
  } else if (params.squadDirection === 'defensive_fortress') {
    effOpp -= 0.7;
  }

  if (params.investment === 'tactical_analytics') {
    effOpp -= 0.7;
  } else if (params.investment === 'youth_scouting' && params.squadDirection === 'youth_pipeline') {
    effTeam += 0.7;
  }

  if (params.trainingFocus === 'high_intensity') {
    effTeam += 0.6;
  } else if (params.trainingFocus === 'tactical_masterclass') {
    if (effOpp > effTeam) effOpp -= 0.8;
    else effTeam += 0.4;
  } else if (params.trainingFocus === 'stamina_recovery') {
    effTeam += 0.4;
  }

  if (params.isUserHost) effTeam += 1.2;
  if (params.isOppHost) effOpp += 1.2;

  effTeam = Math.min(100, effTeam);
  effOpp = Math.min(100, effOpp);

  const effectiveDiff = effTeam - effOpp;

  // Base 1.24 xG per side at parity -> ~2.48 avg goals/match, 36.5% W / 27% D / 36.5% L
  let teamXg = 1.24 * Math.exp(effectiveDiff * 0.058);
  let oppXg = 1.24 * Math.exp(-effectiveDiff * 0.058);

  // Squad identity shaping (real defensive/attacking character)
  if (params.squadDirection === 'defensive_fortress') {
    teamXg *= 0.94;
    oppXg *= 0.88;
  } else if (params.squadDirection === 'youth_pipeline') {
    teamXg *= 1.06;
    oppXg *= 1.04;
  }

  // Pre-game directives with genuine football trade-offs
  if (params.preGameDirective === 'high_press') {
    teamXg *= 1.14;
    oppXg *= effectiveDiff >= 0 ? 1.05 : 1.16;
  } else if (params.preGameDirective === 'controlled_possession') {
    teamXg *= 0.96;
    oppXg *= 0.88;
  } else if (params.preGameDirective === 'low_block_counter') {
    if (effectiveDiff < 0) {
      // Underdog blueprint: soak pressure and counter cleanly
      oppXg *= 0.78;
      teamXg *= 1.12;
    } else {
      // Too passive when you are the superior team
      teamXg *= 0.88;
      oppXg *= 0.90;
    }
  } else if (params.preGameDirective === 'direct_wing_play') {
    teamXg *= 1.12;
    oppXg *= 1.08;
  }

  // Modest dead-ball / fitness bump (replaces flat 22%+12% guaranteed late goals)
  if (params.trainingFocus === 'set_piece_specialist') {
    teamXg += 0.12;
  }
  if (params.investment === 'high_performance_camp') {
    teamXg += 0.08;
  }

  return {
    teamXg: Math.max(0.32, Math.min(3.30, teamXg)),
    oppXg: Math.max(0.32, Math.min(3.30, oppXg)),
    effectiveDiff,
  };
};

// Simulates the 4-team Group Stage (6 total matches = 3 Matchdays of 2 matches each)
export const simulateGroupStage = (
  userTeam: NationalTeam,
  host: HostNation,
  direction: NationalSquadDirection,
  investment: NationalFederationInvestment,
  coach: NationalCoachProfile,
  synergy: DirectorSynergyResult,
  trainingFocus?: NationalTrainingFocus,
  preGameDirective?: PreGameDirective
): GroupStageResult => {
  const pool = NATIONAL_TEAMS.filter(t => t.code !== userTeam.code);
  const pot1 = pool.filter(t => t.ovr >= 86);
  const pot2 = pool.filter(t => t.ovr >= 82 && t.ovr <= 85);
  const pot3 = pool.filter(t => t.ovr <= 81);

  let opp1: NationalTeam;
  let opp2: NationalTeam;
  let opp3: NationalTeam;

  if (userTeam.ovr >= 86) {
    // Top-seeded nation: drawn against two dangerous pot 2 challengers and one pot 3 underdog
    const shuffledPot2 = [...pot2].sort(() => 0.5 - Math.random());
    const shuffledPot3 = [...pot3].sort(() => 0.5 - Math.random());
    opp1 = shuffledPot2[0] || pool[0];
    opp2 = shuffledPot2[1] || pool[1];
    opp3 = shuffledPot3[0] || pool[2];
  } else {
    // Underdog/Challenger nation: group includes one elite top superpower (86-89 OVR), one pot 2, and one pot 3
    const shuffledPot1 = [...pot1].sort(() => 0.5 - Math.random());
    const shuffledPot2 = [...pot2].sort(() => 0.5 - Math.random());
    const shuffledPot3 = [...pot3].sort(() => 0.5 - Math.random());
    opp1 = shuffledPot1[0] || pool[0];
    opp2 = shuffledPot2[0] || pool[1];
    opp3 = shuffledPot3[0] || pool[2];
  }

  const teams = [userTeam, opp1, opp2, opp3];
  const tableMap = new Map<string, GroupTeam>();

  teams.forEach(t => {
    tableMap.set(t.code, {
      team: t,
      p: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0,
      isUser: t.code === userTeam.code
    });
  });

  const matches: Array<{
    home: NationalTeam;
    away: NationalTeam;
    homeScore: number;
    awayScore: number;
  }> = [];

  const simulateFixture = (t1: NationalTeam, t2: NationalTeam) => {
    let g1: number;
    let g2: number;

    if (t1.code === userTeam.code) {
      const { teamXg, oppXg } = computeWorldCupExpectedGoals({
        teamOvr: t1.ovr,
        oppOvr: t2.ovr,
        synergyModifier: synergy.ovrModifier,
        squadDirection: direction,
        investment,
        trainingFocus,
        preGameDirective,
        isUserHost: t1.code === host.code,
        isOppHost: t2.code === host.code,
      });
      g1 = samplePoissonGoals(teamXg);
      g2 = samplePoissonGoals(oppXg);
    } else if (t2.code === userTeam.code) {
      const { teamXg, oppXg } = computeWorldCupExpectedGoals({
        teamOvr: t2.ovr,
        oppOvr: t1.ovr,
        synergyModifier: synergy.ovrModifier,
        squadDirection: direction,
        investment,
        trainingFocus,
        preGameDirective,
        isUserHost: t2.code === host.code,
        isOppHost: t1.code === host.code,
      });
      g2 = samplePoissonGoals(teamXg);
      g1 = samplePoissonGoals(oppXg);
    } else {
      const { teamXg, oppXg } = computeWorldCupExpectedGoals({
        teamOvr: t1.ovr,
        oppOvr: t2.ovr,
        isUserHost: t1.code === host.code,
        isOppHost: t2.code === host.code,
      });
      g1 = samplePoissonGoals(teamXg);
      g2 = samplePoissonGoals(oppXg);
    }

    const row1 = tableMap.get(t1.code)!;
    const row2 = tableMap.get(t2.code)!;

    row1.p += 1;
    row2.p += 1;
    row1.gf += g1;
    row2.gf += g2;
    row1.ga += g2;
    row2.ga += g1;
    row1.gd += (g1 - g2);
    row2.gd += (g2 - g1);

    if (g1 > g2) {
      row1.w += 1;
      row1.pts += 3;
      row2.l += 1;
    } else if (g1 < g2) {
      row2.w += 1;
      row2.pts += 3;
      row1.l += 1;
    } else {
      row1.d += 1;
      row1.pts += 1;
      row2.d += 1;
      row2.pts += 1;
    }

    matches.push({ home: t1, away: t2, homeScore: g1, awayScore: g2 });
  };

  // Matchday 1 (indices 0, 1), Matchday 2 (indices 2, 3), Matchday 3 (indices 4, 5)
  simulateFixture(userTeam, opp1);
  simulateFixture(opp2, opp3);
  simulateFixture(userTeam, opp2);
  simulateFixture(opp1, opp3);
  simulateFixture(userTeam, opp3);
  simulateFixture(opp1, opp2);

  const sortedTable = Array.from(tableMap.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  const userIndex = sortedTable.findIndex(t => t.team.code === userTeam.code);
  const userPosition = userIndex + 1;
  const userQualified = userPosition <= 2;

  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const groupName = `Group ${groupLetters[Math.floor(Math.random() * groupLetters.length)]}`;

  return {
    groupName,
    table: sortedTable,
    userQualified,
    userPosition,
    matches
  };
};

// Simulates the First Half (minutes 1–45) of an International Match (for Grand Final Halftime Mandate)
// Uses 45% of full-match xG so H1 + H2 sums cleanly to an authentic 90-minute World Cup Final!
export const simulateInternationalFirstHalf = (
  team: NationalTeam,
  opp: NationalTeam,
  squadDirection: NationalSquadDirection,
  investment: NationalFederationInvestment,
  coach: NationalCoachProfile,
  synergy: DirectorSynergyResult,
  trainingFocus?: NationalTrainingFocus,
  preGameDirective?: PreGameDirective,
  hostNation?: HostNation
): InternationalFirstHalfState => {
  const { teamXg, oppXg } = computeWorldCupExpectedGoals({
    teamOvr: team.ovr,
    oppOvr: opp.ovr,
    synergyModifier: synergy.ovrModifier,
    squadDirection,
    investment,
    trainingFocus,
    preGameDirective,
    isUserHost: !!hostNation && team.code === hostNation.code,
    isOppHost: !!hostNation && opp.code === hostNation.code,
  });

  const teamGoals = samplePoissonGoals(teamXg * 0.45);
  const oppGoals = samplePoissonGoals(oppXg * 0.45);

  const minuteEvents: Array<{ minute: number; text: string; isGoal?: boolean; forUser?: boolean }> = [];

  if (teamGoals > 0) {
    const mins: number[] = [];
    while (mins.length < teamGoals) {
      const m = Math.floor(Math.random() * 38) + 5;
      if (!mins.includes(m)) mins.push(m);
    }
    mins.sort((a, b) => a - b).forEach(m => {
      minuteEvents.push({
        minute: m,
        text: `${team.name} scores! Clinical finish breaking through ${opp.name}'s backline!`,
        isGoal: true,
        forUser: true
      });
    });
  }

  if (oppGoals > 0) {
    const mins: number[] = [];
    while (mins.length < oppGoals) {
      const m = Math.floor(Math.random() * 38) + 5;
      if (!mins.includes(m) && !minuteEvents.some(e => e.minute === m)) mins.push(m);
    }
    mins.sort((a, b) => a - b).forEach(m => {
      minuteEvents.push({
        minute: m,
        text: `${opp.name} strikes back on a rapid transition!`,
        isGoal: true,
        forUser: false
      });
    });
  }

  minuteEvents.push({
    minute: 45,
    text: `Half-time whistle! The Coaching Staff looks to the Director's Box for your second-half mandate.`
  });

  minuteEvents.sort((a, b) => a.minute - b.minute);

  return {
    teamGoals,
    oppGoals,
    minuteEvents
  };
};

// Authentic FIFA penalty shootout simulator (Best-of-5 with early mathematical elimination check + sudden death)
// Real FIFA World Cup conversion averages ~74%; preparation gives a realistic 69%-79% kick window (~58-65% shootout win rate, never 92% auto-win).
export const simulateFifaShootout = (
  t1Advantage: number = 0
): { t1Pens: number; t2Pens: number; t1Wins: boolean; sequence: WorldCupShootoutKick[] } => {
  const clampedShift = Math.max(-0.05, Math.min(0.05, t1Advantage * 0.008));
  const p1Prob = 0.74 + clampedShift;
  const p2Prob = 0.74 - clampedShift;

  let s1 = 0;
  let s2 = 0;
  const sequence: WorldCupShootoutKick[] = [];

  // Best of 5 kicks
  for (let round = 1; round <= 5; round++) {
    // Team 1 takes kick
    const k1 = Math.random() < p1Prob;
    if (k1) s1++;
    sequence.push({ round, taker: 'user', scored: k1 });
    const rem2After1 = 5 - (round - 1);
    const rem1After1 = 5 - round;
    if (s1 > s2 + rem2After1) {
      return { t1Pens: s1, t2Pens: s2, t1Wins: true, sequence };
    }
    if (s2 > s1 + rem1After1) {
      return { t1Pens: s1, t2Pens: s2, t1Wins: false, sequence };
    }

    // Team 2 takes kick
    const k2 = Math.random() < p2Prob;
    if (k2) s2++;
    sequence.push({ round, taker: 'opp', scored: k2 });
    const rem1After2 = 5 - round;
    const rem2After2 = 5 - round;
    if (s1 > s2 + rem2After2) {
      return { t1Pens: s1, t2Pens: s2, t1Wins: true, sequence };
    }
    if (s2 > s1 + rem1After2) {
      return { t1Pens: s1, t2Pens: s2, t1Wins: false, sequence };
    }
  }

  // Sudden death if tied after 5 kicks
  for (let sd = 6; sd <= 12; sd++) {
    const k1 = Math.random() < p1Prob;
    const k2 = Math.random() < p2Prob;
    if (k1) s1++;
    sequence.push({ round: sd, taker: 'user', scored: k1 });
    if (k2) s2++;
    sequence.push({ round: sd, taker: 'opp', scored: k2 });
    if (s1 !== s2) {
      return { t1Pens: s1, t2Pens: s2, t1Wins: s1 > s2, sequence };
    }
  }

  // Decisive tiebreak fallback if still tied after 12 rounds
  const userWinsSd = Math.random() < 0.5 + clampedShift;
  if (userWinsSd) {
    s1++;
    sequence.push({ round: 13, taker: 'user', scored: true });
    sequence.push({ round: 13, taker: 'opp', scored: false });
    return { t1Pens: s1, t2Pens: s2, t1Wins: true, sequence };
  }
  s2++;
  sequence.push({ round: 13, taker: 'user', scored: false });
  sequence.push({ round: 13, taker: 'opp', scored: true });
  return { t1Pens: s1, t2Pens: s2, t1Wins: false, sequence };
};

export const simulateInternationalMatch = (
  team: NationalTeam,
  opp: NationalTeam,
  stage: InternationalMatchResult['stage'],
  squadDirection: NationalSquadDirection,
  investment: NationalFederationInvestment,
  coach: NationalCoachProfile,
  synergy: DirectorSynergyResult,
  trainingFocus?: NationalTrainingFocus,
  preGameDirective?: PreGameDirective,
  halftimeIntervention?: 'steady' | 'all_out_attack' | 'park_the_bus',
  firstHalfState?: InternationalFirstHalfState,
  hostNation?: HostNation
): InternationalMatchResult => {
  const { teamXg, oppXg, effectiveDiff } = computeWorldCupExpectedGoals({
    teamOvr: team.ovr,
    oppOvr: opp.ovr,
    synergyModifier: synergy.ovrModifier,
    squadDirection,
    investment,
    trainingFocus,
    preGameDirective,
    isUserHost: !!hostNation && team.code === hostNation.code,
    isOppHost: !!hostNation && opp.code === hostNation.code,
  });

  // Halftime intervention applies realistic 2nd-half risk/reward trade-offs
  let shTeamMult = 1.0;
  let shOppMult = 1.0;
  if (halftimeIntervention === 'all_out_attack') {
    shTeamMult = 1.32;
    shOppMult = 1.24;
  } else if (halftimeIntervention === 'park_the_bus') {
    shTeamMult = 0.72;
    shOppMult = 0.70;
  }

  let teamGoals: number;
  let oppGoals: number;
  let minuteEvents: Array<{ minute: number; text: string; isGoal?: boolean; forUser?: boolean }> = [];

  if (firstHalfState) {
    // When first half was already played and displayed at Halftime (e.g. Grand Final)
    // Sample 2nd half (55% of full-match xG) so H1 + H2 equals authentic 90-min scoring!
    teamGoals = firstHalfState.teamGoals;
    oppGoals = firstHalfState.oppGoals;

    const shTeamGoals = samplePoissonGoals(teamXg * 0.55 * shTeamMult);
    const shOppGoals = samplePoissonGoals(oppXg * 0.55 * shOppMult);

    teamGoals += shTeamGoals;
    oppGoals += shOppGoals;

    const secondHalfEvents: Array<{ minute: number; text: string; isGoal?: boolean; forUser?: boolean }> = [];

    if (shTeamGoals > 0) {
      const mins: number[] = [];
      while (mins.length < shTeamGoals) {
        const m = Math.floor(Math.random() * 42) + 47;
        if (!mins.includes(m)) mins.push(m);
      }
      mins.sort((a, b) => a - b).forEach(m => {
        secondHalfEvents.push({
          minute: m,
          text: `${team.name} scores! Clinical finish breaking through ${opp.name}'s backline!`,
          isGoal: true,
          forUser: true
        });
      });
    }

    if (shOppGoals > 0) {
      const mins: number[] = [];
      while (mins.length < shOppGoals) {
        const m = Math.floor(Math.random() * 42) + 47;
        if (!mins.includes(m) && !secondHalfEvents.some(e => e.minute === m)) mins.push(m);
      }
      mins.sort((a, b) => a - b).forEach(m => {
        secondHalfEvents.push({
          minute: m,
          text: `${opp.name} strikes back on a rapid transition!`,
          isGoal: true,
          forUser: false
        });
      });
    }

    minuteEvents = [
      ...firstHalfState.minuteEvents,
      ...secondHalfEvents
    ];
  } else {
    // Full single-simulation match (Quarter-Final, Semi-Final, or direct Grand Final)
    // Apply halftime intervention cleanly to the 2nd-half share (55%)
    const effectiveMatchTeamXg = teamXg * (0.45 + 0.55 * shTeamMult);
    const effectiveMatchOppXg = oppXg * (0.45 + 0.55 * shOppMult);

    teamGoals = samplePoissonGoals(effectiveMatchTeamXg);
    oppGoals = samplePoissonGoals(effectiveMatchOppXg);

    if (teamGoals > 0) {
      const mins: number[] = [];
      while (mins.length < teamGoals) {
        const m = Math.floor(Math.random() * 88) + 2;
        if (!mins.includes(m) && m !== 45) mins.push(m);
      }
      mins.sort((a, b) => a - b).forEach(m => {
        minuteEvents.push({
          minute: m,
          text: `${team.name} scores! Clinical finish breaking through ${opp.name}'s backline!`,
          isGoal: true,
          forUser: true
        });
      });
    }

    if (oppGoals > 0) {
      const mins: number[] = [];
      while (mins.length < oppGoals) {
        const m = Math.floor(Math.random() * 88) + 2;
        if (!mins.includes(m) && m !== 45 && !minuteEvents.some(e => e.minute === m)) mins.push(m);
      }
      mins.sort((a, b) => a - b).forEach(m => {
        minuteEvents.push({
          minute: m,
          text: `${opp.name} strikes back on a rapid transition!`,
          isGoal: true,
          forUser: false
        });
      });
    }

    minuteEvents.push({
      minute: 45,
      text: `Half-time whistle. Director tactical adjustments relayed to ${coach.name}.`
    });
  }

  let extraTime = false;
  let pens = false;
  let teamPenGoals: number | undefined;
  let oppPenGoals: number | undefined;
  let shootoutSequence: WorldCupShootoutKick[] | undefined;
  let won = false;

  if (teamGoals !== oppGoals) {
    won = teamGoals > oppGoals;
  } else {
    // Tied after regular 90 minutes -> Simulate authentic Extra Time (minutes 91-120)
    extraTime = true;
    minuteEvents.push({
      minute: 90,
      text: `Full-time whistle (90'). Deadlock at ${teamGoals}-${oppGoals}! Heading into Extra Time!`
    });

    // Extra time is 30 mins of tired legs (~26% of 90-min scoring intensity)
    const staminaMult = trainingFocus === 'stamina_recovery' ? 1.15 : 1.0;
    const etTeamGoals = Math.min(2, samplePoissonGoals(teamXg * 0.26 * staminaMult));
    const etOppGoals = Math.min(2, samplePoissonGoals(oppXg * 0.26));

    if (etTeamGoals > 0) {
      const etMins: number[] = [];
      while (etMins.length < etTeamGoals) {
        const etMin = Math.floor(Math.random() * 28) + 92;
        if (!etMins.includes(etMin)) etMins.push(etMin);
      }
      etMins.sort((a, b) => a - b).forEach(etMin => {
        minuteEvents.push({
          minute: etMin,
          text: `EXTRA TIME GOAL! ${team.name} strike in the ${etMin}th minute! Unbelievable drama!`,
          isGoal: true,
          forUser: true
        });
      });
      teamGoals += etTeamGoals;
    }

    if (etOppGoals > 0) {
      const etMins: number[] = [];
      while (etMins.length < etOppGoals) {
        const etMin = Math.floor(Math.random() * 28) + 92;
        if (!etMins.includes(etMin) && !minuteEvents.some(e => e.minute === etMin)) etMins.push(etMin);
      }
      etMins.sort((a, b) => a - b).forEach(etMin => {
        minuteEvents.push({
          minute: etMin,
          text: `EXTRA TIME GOAL! ${opp.name} score in extra time (${etMin}')!`,
          isGoal: true,
          forUser: false
        });
      });
      oppGoals += etOppGoals;
    }

    if (teamGoals > oppGoals) {
      won = true;
    } else if (teamGoals < oppGoals) {
      won = false;
    } else {
      // Still tied after 120 minutes of grueling action -> Penalty Shootout!
      pens = true;
      let penBonus = synergy.penaltyBonus;
      if (investment === 'mental_penalty_protocol') penBonus += 0.20;
      if (trainingFocus === 'set_piece_specialist') penBonus += 0.14;
      if (trainingFocus === 'stamina_recovery') penBonus += 0.08;
      if (halftimeIntervention === 'park_the_bus') penBonus += 0.06;

      // Calibrated advantage keeps shootouts dramatic (~50%..65% for the prepared side)
      const t1Advantage = Math.max(-5, Math.min(5, Math.round(effectiveDiff * 0.25 + penBonus * 7)));
      const shootout = simulateFifaShootout(t1Advantage);
      teamPenGoals = shootout.t1Pens;
      oppPenGoals = shootout.t2Pens;
      shootoutSequence = shootout.sequence;
      won = shootout.t1Wins;

      minuteEvents.push({
        minute: 120,
        text: `120' whistle! Still deadlocked at ${teamGoals}-${oppGoals}! High drama FIFA penalty shootout begins!`
      });
    }
  }

  minuteEvents.sort((a, b) => a.minute - b.minute);

  let summary = '';
  if (won) {
    summary = pens
      ? `Dramatic penalty shootout triumph! ${team.name} win ${teamPenGoals}:${oppPenGoals} on penalties against ${opp.name} after a ${teamGoals}:${oppGoals} thriller!`
      : extraTime
      ? `Extra Time glory! ${team.name} seize victory in extra time ${teamGoals}:${oppGoals} against ${opp.name}!`
      : `Glorious victory! ${team.name} overcome ${opp.name} ${teamGoals}:${oppGoals} with tactically sharp execution.`;
  } else {
    summary = pens
      ? `Heartbreak on penalties. ${team.name} fall ${teamPenGoals}:${oppPenGoals} in the shootout against ${opp.name}.`
      : extraTime
      ? `Extra Time heartbreak. ${team.name} fall ${teamGoals}:${oppGoals} after 120 grueling minutes against ${opp.name}.`
      : `Defeat against ${opp.name} (${teamGoals}:${oppGoals}). The opposition capitalized on crucial moments.`;
  }

  return {
    stage,
    opponent: opp,
    teamGoals,
    oppGoals,
    extraTime,
    pens,
    teamPenGoals,
    oppPenGoals,
    shootoutSequence,
    won,
    summary,
    minuteEvents
  };
};