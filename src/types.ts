export type Language = 'en' | 'de';
export type ViewMode = 'game' | 'about' | 'leaderboard';
export type GameMode = 'standard' | 'realistic';
export type StadiumPolicy = 'balanced' | 'ultras' | 'commercial' | 'family';

export interface SponsorSlot {
  id: string;
  brandName: string;
  logoUrl: string;
  linkUrl: string;
  packageType: '1_day' | '1_week' | '1_month';
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  tagline?: string;
}

export interface Club {
  id: number;
  name: string;
  tier: number;
  baseOvr: number;
  color: string;
  stadium: number;
  logo?: string;
  fallbackLogo?: string;
  country?: string;
  rep?: number;
  fanBase?: number;
  currentBudget?: number;
  currency?: string;
  isInsolventGiant?: boolean;
  insolvencyCount?: number;
  originalStartLeague?: number;
  isReserve?: boolean;
  squadSize?: number;
  narrative?: string;
  historicContext?: string;
  offerBudget?: number;
  morale?: number;
  academyLevel?: number;
  medicalLevel?: number;
  leagueHistory?: ClubSeasonRecord[];
  catchmentPopulation?: number;
  metroName?: string;
  ovr?: number;
  stadiumName?: string;
}

export interface ClubSeasonRecord {
  year: number;
  tier: number;
  position: number;
  ovr: number;
  leagueName: string;
  status: 'champion' | 'promoted' | 'relegated' | 'top4' | 'midtable' | 'safe';
  points: number;
  wins?: number;
  draws?: number;
  losses?: number;
  wonTrophy?: boolean;
  trophyName?: string;
  isManagerTenure?: boolean;
}

export interface LeagueInfo {
  name: string;
  tag: string;
  css: string;
  avgOvr: number;
  ticket: number;
  tvPrize: number;
  wages: number;
  attBase: number;
  stadBase: number;
  logo?: string;
}

export interface PhilosophyInfo {
  icon: string;
  color: string;
  en: string;
  de: string;
  gfMod: number;
  gaMod: number;
  perkEn: string;
  perkDe: string;
  effectDescEn: string;
  effectDescDe: string;
  ovrBonusType?: 'underdog' | 'dominance' | 'home' | 'away' | 'catenaccio';
}

export type TacticInfo = PhilosophyInfo;

export interface YouthProspect {
  id: string;
  name: string;
  timer: number;
  boost: number;
  type: 'generational' | 'top_prospect' | 'local_talent';
  position?: 'GK' | 'DEF' | 'MID' | 'FWD';
  age?: number;
  nationality?: string;
  playstyle?: string;
  isProtected?: boolean;
  status?: 'incubating' | 'ready' | 'loaned' | 'promoted' | 'released';
  marketValK?: number;
  graduationYear?: number;
  loansServed?: number;
}

export interface TrophiesObj {
  cl?: number;
  el?: number;
  ecl?: number;
  cwc?: number;
  bl?: number;
  lower?: number;
  dfb?: number;
  efl?: number;
  reg?: number;
  wc?: number;
  [key: string]: number | undefined;
}

export interface SeasonHistory {
  year: number;
  clubName: string;
  clubId?: number;
  color: string;
  logo?: string;
  fallbackLogo?: string;
  leagueTag: string;
  leagueCss: string;
  ovr: number;
  tier: number;
  wins: number;
  draws?: number;
  losses?: number;
  pts?: number;
  pos: number;
  gf: number;
  ga: number;
  att: number;
  util: number;
  stadiumCapacity?: number;
  trophyIcons: string;
  trophiesThisYear: TrophiesObj;
  bankrupt?: boolean;
  financialRelegation?: boolean;
  pointsDeducted?: number;
  graduatedYouths?: string[];
  departedYouths?: string[];
  transfersIn?: number;
  transfersOut?: number;
  country?: string;
  rivalName?: string;
  rivalPts?: number;
  rivalGd?: number;
  rivalSeasonW?: number;
  rivalSeasonD?: number;
  rivalSeasonL?: number;
  rivalH2HWins?: number;
  rivalH2HDraws?: number;
  rivalH2HLosses?: number;
  status?: 'C' | 'P' | 'R';
  survived?: boolean;
}

export type LocalizedString = { en: string; de: string };

export interface EventOption {
  title: LocalizedString;
  desc?: LocalizedString;
  icon?: string;
  goodPct?: number;
  goodTxt?: LocalizedString | string;
  mpCost?: number;
  badPct?: number;
  badTxt?: LocalizedString | string;
  tag?: LocalizedString | string;
}

export interface GameEvent {
  id?: string;
  type: string;
  title: LocalizedString;
  desc: LocalizedString;
  opt1?: EventOption;
  opt2?: EventOption;
  opt3?: EventOption;
  opt4?: EventOption;
  clubs?: Club[];
  isForced?: boolean;
  saleVal?: number;
  ovrLoss?: number;
  invAmt?: number;
  offerVal?: number;
  cost?: number;
  offer?: number;
  comp?: number;
  amount?: number;
  newClub?: Club;
  extraData?: any;
}

export interface CoachHiddenAttributes {
  tacticalFlexibility: number;  // 1-20 scale: ability to adapt system when trailing
  manManagement: number;        // 1-20 scale: dressing room ego control & morale stability
  motivationalDrive: number;    // 1-20 scale: underdog grit & comeback mentality
  youthNurturing: number;       // 1-20 scale: wonderkid progression & academy boost
  discipline: number;           // 1-20 scale: defensive structure & foul control
  boardAlignment: number;       // 1-20 scale: harmony with director transfer policy
}

export type CoachArchetype = 
  | 'low_tier_veteran'
  | 'award_winner'
  | 'psychological_mastermind'
  | 'chessboard_maestro'
  | 'youth_visionary'
  | 'iron_disciplinarian'
  | 'pragmatic_grinder';

export interface Coach {
  id: string;
  name: string;
  ovrBoost: number;
  cost: number;
  repReq: number;
  style: string;
  country: string;
  strength?: string;
  weakness?: string;
  archetype?: string;
  coachArchetype?: CoachArchetype;
  coachArchetypeLabel?: string;
  hiddenAttributes?: CoachHiddenAttributes;
  trophyPedigree?: number;
  preferredFormation?: string;
  bio?: string;
  contractLength?: number;
  contractYearsLeft?: number;
  nationality?: string;
  winRate?: number;
  isReserveCoach?: boolean;
  promise?: 'title' | 'survival' | 'cups';
  isDeceiving?: boolean;
  isScouted?: boolean;
}

export interface BankLoan {
  principal: number; // Stored in K (e.g. 10000 = €10.0M)
  initialPrincipal?: number; // Total starting principal in K
  annualPayment: number; // Stored in K (annual operating expense deduction)
  totalYears: number; // 10 | 15 | 25
  yearsLeft: number; // Remaining repayment seasons
  loanType?: 'bank' | 'bond';
  interestRate?: number; // e.g. 4.5 (%)
  totalPaidK?: number; // Cumulative principal amortized
}

export interface GameState {
  pendingForcedEvent?: GameEvent;
  currentCoach?: Coach;
  coachTenure?: number;
  hasNewManagerBounce?: boolean;
  currentRival?: { id: number, name: string, wins: number, draws: number, losses: number, descEn: string, descDe: string };
  youthTrophies?: number;
  youthChampionshipPlayedYear?: number;
  lastYouthChampionshipResult?: { year: number; won: boolean; stage?: string };
  youthChampOvrBoost?: number;
  firedCoachesCount?: number;
  severances?: { amount: number, yearsLeft: number }[];
  bankLoan?: BankLoan;
  archetype?: 'legend' | 'finance' | 'scout' | 'balanced';
  clubIdentity?: 'balanced' | 'wonderkid' | 'galactico' | 'moneyball' | 'heritage';
  marqueeSignedThisSeason?: boolean;
  ownership?: 'billionaire' | 'fan_trust' | 'standard';
  ownershipCashGiven?: boolean;
  academyScoutingDial?: number; // 0 to 50 (%)
  academySpendHistory?: { year: number; spendK: number; graduatesCount: number }[];
  academyCallUpsThisSeason?: number;

  winterTransfers?: number;
  winterKeyTransfers?: number;
  winterCampDone?: boolean;
  teamBondingThisSeason?: boolean;
  fanBondingThisSeason?: boolean;
  midSeasonResignedCoach?: { name: string; style: string };
  madeCupFinal?: boolean;
  cupProgress?: Record<string, 'QF' | 'SF' | 'FINAL' | 'eliminated' | 'eliminated_early' | 'eliminated_qf'>;
  playedCupOpponents?: Record<string, string[]>;
  seasonPhase?: 'start' | 'mid';
  managerName: string;
  nationality: string;
  startYear: number;
  year: number;
  seasonCount?: number;
  tactic: string;
  
  club: Club;
  budget: number;
  lastBudget?: number;
  euroStatus: 'CL' | 'EL' | 'ECL' | null;
  reputation: number;
  mode: GameMode;
  maxOvrCap: number;
  investmentsThisSeason: number;
  sponsorsPitchedThisSeason: number;
  globalToursThisSeason?: number;
  latestTourMatches?: { opponent: string; ourScore: number; theirScore: number }[];
  stadiumExpandedThisSeason: number;
  regTransfersThisSeason: number;
  keyTransfersThisSeason: number;
  galacticosThisSeason?: number;
  squadSalesThisSeason?: number;
  jobMarketSearchesThisSeason: number;
  loansThisSeason?: number;
  activeLoanOvrBoost?: number;
  isNewSeasonRender: boolean;
  initialRenderDone: boolean;
  clWins: number;
  consecutiveTitles: number;
  staleTactic?: string;
  consecutiveTitlesWithSameTactic?: number;
  superVillainRivalId?: number;
  trophyDrought: number;
  activePromise: boolean;
  boardWarning: boolean;
  boardExpectsSuccess: boolean;
  boardGracePeriod: number;
  boardUltimatum: boolean;
  seasonsInDebt: number;
  clubImpactScore?: number;
  yearsAtCurrentClub?: number;

  isPublic?: boolean;
  stockPrice?: number;
  ipoPrice?: number;
  sharesOutstanding?: number;
  stockHistory?: { year: number; price: number }[];

  hasResolvedInsolvencyBefore?: boolean;
  careerScore?: number;
  stadiumPolicy?: StadiumPolicy;
  glassCeilingCursed?: boolean;
  billionaireTakeoverYear?: number;
  wonderkidOvrBoost?: number;
  top4FinishStreak?: number;
  lastJobOfferYear?: number;
  clubLeagueHistories?: Record<string | number, ClubSeasonRecord[]>;
  managedClubFacilities?: Record<string | number, {
    tier?: number;
    stadium?: number;
    academyLevel?: number;
    medicalLevel?: number;
    fanBase?: number;
    peakOvr?: number;
    yearsDirected?: number;
  }>;
  activePerformanceSponsor?: boolean;
  performanceSponsorSignedThisSeason?: boolean;
  failedSponsorTargetNextSeason?: boolean;
  performanceSponsorBlockedNextSeason?: boolean;
  activePerformanceSponsorTarget?: {
    type: string;
    bonus: number;
    targetValue: number;
    descEn: string;
    descDe: string;
  };
  immunityShields?: number;
  boardTargetFinish?: number;
  facilitiesUpgradedThisSeason?: number;
  academyUpgradedThisSeason?: number;
  medicalUpgradedThisSeason?: number;
  sponsorIncome?: number;
  transferSpend?: number;
  transferIncome?: number;
  facilitySpend?: number;
  youthSpend?: number;
  lastOvr?: number;
  skillPoints?: number;
  managerSkills?: string[];
  scoutedCoachIds?: string[];
  coachMarketPool?: Coach[];
  totals: {
    matches: number;
    wins: number;
    draws?: number;
    losses?: number;
    att: number;
    trophies: number;
    domTrophies: number;
    intTrophies: number;
  };
  isCareerOver?: boolean;
  endlessModeActive?: boolean;
  history: SeasonHistory[];
  trophies: string[];
  trophyHistory?: { year: number; clubName: string; name: string; logo?: string; color?: string; }[];
  passedManagerMilestones?: string[];
  youthPipeline: YouthProspect[];
  boardVision?: BoardVision;
  internationalTrophies?: number;
  internationalTournamentsPlayed?: number;
  worldCupTournamentsPlayed?: number;
  worldCupMatchesPlayed?: number;
  worldCupMatchesWon?: number;
  worldCupMatchesDrawn?: number;
  worldCupMatchesLost?: number;
  worldCupGoalsFor?: number;
  worldCupGoalsAgainst?: number;
  worldCupTrophies?: number;
  worldCupBestFinish?: string;
  worldCupLastTeam?: string;
  hasBeenWorldCupInvited?: boolean;
  worldCupInvitationsReceived?: number;
  worldCupCampaigns?: WorldCupCampaignHistoryRecord[];
  activeTransferSaga?: TransferSaga | null;
  lastInsolventGiantNotice?: {
    clubId: number;
    clubName: string;
    year: number;
    country: string;
    tier: number;
  } | null;
  universeMovements?: UniverseMovement[];
  livingTiers?: Record<string | number, number>;
  seasonStandingsArchive?: Record<number, Record<number, TableRow[]>>;
  prestigeUpgrades?: {
    statueBuilt?: boolean;
    stadiumRenamed?: boolean;
    feederClubPurchased?: boolean;
    managerialImmortality?: boolean;
  };
  pendingSeasonState?: PendingSeasonState | null;
  pendingSeasonFinishData?: any | null;
  pendingInternationalTournament?: { year: number; offeredTeams: NationalTeam[]; isFreshInvite?: boolean } | null;
  veteranRingerSignedThisSeason?: boolean;
  veteranRingerActive?: boolean;
  veteranRingerOvrGain?: number;
  veteranRingerName?: string;
  veteranRingerPosition?: string;
  veteranRingerNationality?: string;
  veteranRingerWageK?: number;
  tvCupJackpotAvailable?: boolean;
  tvCupJackpotClaimed?: boolean;
  tvCupJackpotClaimedThisSeason?: boolean;
  tvCupJackpotOpponent?: string;
  tvCupOpponentName?: string;
  tvCupOpponentLogo?: string;
  tvCupOpponentColor?: string;
  tvCupOpponentOvr?: number;
  tvCupJackpotClaimedYear?: number;
  midSeasonDilemmaResolvedThisSeason?: boolean;
  dilemmaResolvedYear?: number;
  dilemmaResolvedHalf?: 'start' | 'mid';
  youthScoutedThisSeason?: number;
  youthScoutsThisSeason?: number;
  foreignScoutMode?: boolean;
  language?: Language;
  midSeasonPts?: number;
  regionalCupWinner?: boolean;
  cupRunResults?: any[];
  cupRunsPlayedThisSeason?: string[];
  cupEliminated?: Record<string, boolean>;
  boardTarget?: number;
  managerAge?: number;
  ovrHistory?: { year: number; delta: number; reason: string }[];
}

export interface MatchdayOutcome {
  matchday: number;
  opponentId: number;
  opponentName: string;
  opponentLogo?: string;
  opponentFallbackLogo?: string;
  opponentColor: string;
  opponentOvr: number;
  isHome: boolean;
  userGoals: number;
  oppGoals: number;
  result: 'W' | 'D' | 'L';
  ptsEarned: 3 | 1 | 0;
  runningPts: number;
  runningPoints: number;
  runningWins: number;
  runningW: number;
  runningDraws: number;
  runningD: number;
  runningLosses: number;
  runningL: number;
  runningGf: number;
  runningGa: number;
  runningGd: number;
  runningPos: number;
  runningPosition: number;
  isUpsetWin?: boolean;
}

export interface PendingSeasonState {
  year: number;
  tier: number;
  country: string;
  totalMatchdays: number;
  dilemmaMatchday: number;
  dilemmaChoice?: 'A' | 'B';
  approxPos: number;
  pos: number;
  wins: number;
  draws: number;
  losses: number;
  pts: number;
  gf: number;
  ga: number;
  gd: number;
  effectiveOvr: number;
  leagueAvgOvr: number;
  schedule: MatchdayOutcome[];
  matchdaySchedule: MatchdayOutcome[];
  _meta: {
    firstHalfOutcomes?: MatchdayOutcome[];
    firstHalfWins?: number;
    firstHalfDraws?: number;
    firstHalfLosses?: number;
    firstHalfPts?: number;
    firstHalfGf?: number;
    firstHalfGa?: number;
    ovrAtCalculation: number;
    moraleAtCalculation: number;
    tacticAtCalculation: string;
    coachIdAtCalculation?: string;
    coachStyleAtCalculation?: string;
    hasBounceAtCalculation?: boolean;
    skillsKeyAtCalculation?: string;
    stadiumAtCalculation?: number;
    stadiumPolicyAtCalculation?: string;
    midPos?: number;
    midPts?: number;
  };
}

export interface TableRow {
  pos: number;
  id?: number | string;
  name: string;
  color: string;
  logo?: string;
  mp: number; // Matches Played
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
  gd: string;
  isUser: boolean;
  isRival?: boolean;
  isReserve?: boolean;
  pointsDeducted?: number;
  form?: ('W' | 'D' | 'L')[];
  status?: 'C' | 'P' | 'R';
}

export interface UniverseMovement {
  id: string;
  year: number;
  clubId?: number | string;
  clubName: string;
  clubLogo?: string;
  clubColor?: string;
  country: string;
  fromTier: number;
  toTier: number;
  fromLeagueName: string;
  toLeagueName: string;
  type: 'promotion' | 'relegation' | 'insolvency_drop' | 'cup_champion' | 'title_won' | 'transfer_saga' | 'cinderella_surge' | 'relegation_avoided' | 'continental_qual';
  pos?: number;
  reason?: string;
  isUserClub?: boolean;
  isPastManagerClub?: boolean;
}

export interface BoardObjective {
  id: string;
  desc: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  type: 'league_titles' | 'continental_final' | 'maintain_ovr' | 'graduate_youth' | 'transfer_profit' | 'upgrade_facilities' | 'zero_debt' | 'avoid_relegation' | 'promotion' | 'fanbase_growth' | 'continental_qualification' | 'hoard_cash';
  isCompleted?: boolean;
  isFailed?: boolean;
}

export interface BoardVision {
  id: string;
  title: string;
  type: 'superclub_dominance' | 'youth_factory' | 'financial_restructure' | 'fast_rise' | 'continental_ascendance' | 'sustainable_stability' | 'transitional_rebuild';
  description: string;
  startYear: number;
  durationYears: number;
  currentYearOfVision: number; // 1, 2, or 3
  objectives: BoardObjective[];
  reward: {
    budgetBonus: number;
    trustBonus: number;
    immunityBonus: number;
    skillPointsBonus?: number;
    desc: string;
  };
  penalty: {
    ultimatum: boolean;
    trustPenalty: number;
    desc: string;
  };
  status: 'active' | 'completed' | 'failed';
}

export interface TransferSagaOption {
  title: string;
  desc: string;
  icon: string;
  budgetChange: number;
  ovrChange: number;
  moraleChange: number;
  reputationChange?: number;
  successRate?: number;
}

export interface TransferSaga {
  id: string;
  title: string;
  type: 'release_clause' | 'rival_bidding_war' | 'star_ultimatum';
  playerName: string;
  playerPos: 'GK' | 'DEF' | 'MID' | 'FWD';
  playerOvr: number;
  suitorClub: string;
  suitorCountry?: string;
  narrative: string;
  options: TransferSagaOption[];
}

export interface NationalTeam {
  name: string;
  code: string;
  flag: string;
  color: string;
  ovr: number;
  continent: string;
}

export interface InternationalMatchResult {
  stage: 'Quarter-Final' | 'Semi-Final' | 'Grand Final';
  opponent: NationalTeam;
  teamGoals: number;
  oppGoals: number;
  extraTime?: boolean;
  pens?: boolean;
  teamPenGoals?: number;
  oppPenGoals?: number;
  won: boolean;
  summary: string;
  minuteEvents?: Array<{ minute: number; text: string; isGoal?: boolean; forUser?: boolean }>;
}

export interface InternationalFirstHalfState {
  teamGoals: number;
  oppGoals: number;
  minuteEvents: Array<{ minute: number; text: string; isGoal?: boolean; forUser?: boolean }>;
}

export interface HostNation {
  name: string;
  code: string;
  flag: string;
  stadium: string;
  city: string;
  ovr: number;
}

export interface GroupTeam {
  team: NationalTeam;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  isUser?: boolean;
}

export interface GroupStageResult {
  groupName: string;
  table: GroupTeam[];
  userQualified: boolean;
  userPosition: number;
  matches: Array<{
    home: NationalTeam;
    away: NationalTeam;
    homeScore: number;
    awayScore: number;
  }>;
}

export interface WorldCupCampaignStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  goalsFor: number;
  goalsAgainst: number;
  bestFinish: string;
  teamName: string;
}

export interface WorldCupCampaignHistoryRecord extends WorldCupCampaignStats {
  year: number;
  wonTrophy: boolean;
  teamFlag?: string;
  hostCountry?: string;
  coachName?: string;
  coachStyle?: string;
}

export interface InternationalTournamentState {
  year: number;
  tournamentName: string;
  selectedTeam: NationalTeam;
  squadDirection?: NationalSquadDirection;
  federationInvestment?: NationalFederationInvestment;
  appointedCoach?: NationalCoachProfile;
  stage: 'prep' | 'group' | 'qf' | 'sf' | 'final' | 'complete';
  matches: InternationalMatchResult[];
  wonTrophy: boolean;
}

export type NationalSquadDirection = 'youth_pipeline' | 'golden_generation' | 'veteran_stalwarts' | 'defensive_fortress';
export type NationalFederationInvestment = 'youth_scouting' | 'high_performance_camp' | 'tactical_analytics' | 'mental_penalty_protocol';
export type NationalTrainingFocus = 'high_intensity' | 'stamina_recovery' | 'tactical_masterclass' | 'set_piece_specialist';
export type PreGameDirective = 'high_press' | 'controlled_possession' | 'low_block_counter' | 'direct_wing_play';
export type NationalCoachArchetype = 'tactical_ideologue' | 'tournament_specialist' | 'charismatic_motivator' | 'defensive_general';

export interface NationalCoachProfile {
  id: string;
  name: string;
  archetype: NationalCoachArchetype;
  title: string;
  tacticalStyle: string;
  strength: string;
  flaw: string;
  preferredSquadDirection: NationalSquadDirection;
  preferredInvestment: NationalFederationInvestment;
  ovrBoost: number;
}

export interface DirectorSynergyResult {
  score: number; // 0-100 (Internal calculation only - never display percentage to user)
  level: 'flawless' | 'strong' | 'neutral' | 'friction';
  title: string;
  desc: string;
  indicatorBadge: string;
  clues: string[];
  ovrModifier: number;
  penaltyBonus: number;
  clutchGoalChance: number;
}


declare global {
  interface Window {
    _cupChoice?: string;
    _decisionChoice?: number;
  }
}
