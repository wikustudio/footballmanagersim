import { Club, GameState, MatchdayOutcome, PendingSeasonState } from '../types';
import {
  getLeagueInfo,
  getLeagueStadiumRequirement,
  getLeagueScaledVal,
  formatMoney,
  isTacticalSynergy,
  isReserveClub,
  TACTICS,
  rand,
} from '../data/gameConstants';
import { ALL_CLUBS } from '../data/clubsData';

export interface VeteranRingerProfile {
  name: string;
  age: number;
  position: 'ST' | 'CAM' | 'CM' | 'CB' | 'RW' | 'GK';
  nationality: string;
  accoladeEn: string;
  accoladeDe: string;
}

export const VETERAN_RINGER_POOL: Record<string, VeteranRingerProfile[]> = {
  GER: [
    { name: 'Claudio Pizarro (39)', age: 39, position: 'ST', nationality: 'PER', accoladeEn: 'Bundesliga Legend · UEFA Champions League Winner', accoladeDe: 'Bundesliga-Ikone · Champions-League-Sieger' },
    { name: 'Miroslav Klose (38)', age: 38, position: 'ST', nationality: 'GER', accoladeEn: 'World Cup All-Time Top Scorer · Golden Boot', accoladeDe: 'WM-Rekordtorschütze · Goldener Schuh' },
    { name: 'Zé Roberto (39)', age: 39, position: 'CM', nationality: 'BRA', accoladeEn: '4x Bundesliga Champion · Iron Midfield Engine', accoladeDe: '4x Deutscher Meister · Unverwüstlicher Antreiber' },
    { name: 'Lukas Podolski (38)', age: 38, position: 'ST', nationality: 'GER', accoladeEn: 'World Cup Winner · 130 International Caps', accoladeDe: 'Weltmeister 2014 · 130 Länderspiele' },
    { name: 'Mario Gómez (37)', age: 37, position: 'ST', nationality: 'GER', accoladeEn: 'Bundesliga Torjägerkanone · Champions League Winner', accoladeDe: 'Torschützenkönig · Champions-League-Sieger' },
  ],
  ENG: [
    { name: 'Jamie Vardy (38)', age: 38, position: 'ST', nationality: 'ENG', accoladeEn: 'Premier League Champion · Golden Boot Winner', accoladeDe: 'Premier-League-Meister · Torschützenkönig' },
    { name: 'Teddy Sheringham (39)', age: 39, position: 'ST', nationality: 'ENG', accoladeEn: 'Treble Winner · Premier League Hall of Fame', accoladeDe: 'Triple-Sieger · Premier League Hall of Fame' },
    { name: 'James Milner (38)', age: 38, position: 'CM', nationality: 'ENG', accoladeEn: '3x Premier League & Champions League Winner', accoladeDe: '3x Englischer Meister & Champions-League-Sieger' },
    { name: 'Didier Drogba (38)', age: 38, position: 'ST', nationality: 'CIV', accoladeEn: '4x Premier League · Champions League Final Hero', accoladeDe: '4x Premier League · Champions-League-Finalheld' },
  ],
  ESP: [
    { name: 'Joaquín Sánchez (39)', age: 39, position: 'RW', nationality: 'ESP', accoladeEn: '600+ La Liga Appearances · 2x Copa del Rey Winner', accoladeDe: 'Über 600 La-Liga-Spiele · 2x Pokalsieger' },
    { name: 'Santi Cazorla (38)', age: 38, position: 'CAM', nationality: 'ESP', accoladeEn: '2x European Champion · Midfield Magician', accoladeDe: '2x Europameister · Mittelfeld-Magier' },
    { name: 'Aritz Aduriz (38)', age: 38, position: 'ST', nationality: 'ESP', accoladeEn: 'La Liga Zarra Trophy · Basque Aerial Legend', accoladeDe: 'Zarra-Trophäe · Baskische Sturm-Legende' },
    { name: 'David Villa (37)', age: 37, position: 'ST', nationality: 'ESP', accoladeEn: 'World Cup & Champions League Winner', accoladeDe: 'Weltmeister & Champions-League-Sieger' },
  ],
  ITA: [
    { name: 'Fabio Quagliarella (39)', age: 39, position: 'ST', nationality: 'ITA', accoladeEn: 'Serie A Capocannoniere · 3x Scudetto Winner', accoladeDe: 'Serie-A-Torschützenkönig · 3x Scudetto' },
    { name: 'Luca Toni (38)', age: 38, position: 'ST', nationality: 'ITA', accoladeEn: 'World Cup Winner · European Golden Shoe', accoladeDe: 'Weltmeister · Goldener Schuh Europas' },
    { name: 'Gianluigi Buffon (39)', age: 39, position: 'GK', nationality: 'ITA', accoladeEn: 'World Cup Winner · 10x Serie A Champion', accoladeDe: 'Weltmeister · 10x Italienischer Meister' },
    { name: 'Antonio Di Natale (38)', age: 38, position: 'ST', nationality: 'ITA', accoladeEn: '2x Serie A Capocannoniere · 200+ Serie A Goals', accoladeDe: '2x Torschützenkönig · Über 200 Serie-A-Tore' },
  ],
  FRA: [
    { name: 'Franck Ribéry (38)', age: 38, position: 'RW', nationality: 'FRA', accoladeEn: 'UEFA Best Player in Europe · Treble Winner', accoladeDe: 'Europas Fußballer des Jahres · Triple-Sieger' },
    { name: 'Olivier Giroud (38)', age: 38, position: 'ST', nationality: 'FRA', accoladeEn: 'France All-Time Top Scorer · World Cup Winner', accoladeDe: 'Frankreichs Rekordtorschütze · Weltmeister' },
    { name: 'Vitorino Hilton (39)', age: 39, position: 'CB', nationality: 'BRA', accoladeEn: '2x Ligue 1 Champion · 500+ Top-Flight Matches', accoladeDe: '2x Französischer Meister · 500+ Erstligaspiele' },
  ],
  POR: [
    { name: 'Pepe (39)', age: 39, position: 'CB', nationality: 'POR', accoladeEn: 'European Champion · 3x Champions League Winner', accoladeDe: 'Europameister · 3x Champions-League-Sieger' },
    { name: 'Ricardo Quaresma (38)', age: 38, position: 'RW', nationality: 'POR', accoladeEn: 'European Champion · Trivela King', accoladeDe: 'Europameister · König des Außenrists' },
    { name: 'Nani (37)', age: 37, position: 'RW', nationality: 'POR', accoladeEn: 'European Champion · Champions League Winner', accoladeDe: 'Europameister · Champions-League-Sieger' },
  ],
  INTL: [
    { name: 'Luka Modrić (39)', age: 39, position: 'CM', nationality: 'CRO', accoladeEn: 'Ballon d’Or Winner · 6x Champions League Winner', accoladeDe: 'Ballon-d’Or-Sieger · 6x Champions-League-Sieger' },
    { name: 'Zlatan Ibrahimović (39)', age: 39, position: 'ST', nationality: 'SWE', accoladeEn: '12x League Champion · 500+ Career Goals', accoladeDe: '12x Meister · Über 500 Karrieretore' },
    { name: 'Roque Santa Cruz (39)', age: 39, position: 'ST', nationality: 'PAR', accoladeEn: 'Champions League Winner · South American Icon', accoladeDe: 'Champions-League-Sieger · Südamerika-Ikone' },
    { name: 'Dani Alves (38)', age: 38, position: 'RW', nationality: 'BRA', accoladeEn: '3x Champions League · 2x Copa América Winner', accoladeDe: '3x Champions League · 2x Copa-América-Sieger' },
    { name: 'Henrik Larsson (37)', age: 37, position: 'ST', nationality: 'SWE', accoladeEn: 'European Golden Shoe · Champions League Hero', accoladeDe: 'Goldener Schuh · Champions-League-Held' },
  ],
};

export function pickVeteranRinger(country: string = 'GER', seedYear: number = 2026, clubId: number = 0): VeteranRingerProfile {
  const countryPool = VETERAN_RINGER_POOL[country] || [];
  const pool = countryPool.length > 0 ? [...countryPool, ...VETERAN_RINGER_POOL.INTL] : [...VETERAN_RINGER_POOL.INTL];
  if (pool.length === 0) {
    return VETERAN_RINGER_POOL.INTL[0];
  }
  const countryHash = (country || 'GER').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const seed = Math.abs((seedYear * 31) + (clubId * 17) + countryHash);
  const idx = seed % pool.length;
  return pool[idx] || pool[0];
}

export function getVeteranRingerEconomics(state: GameState): {
  signingFeeK: number;
  annualWageBurdenK: number;
  isEligibleTier: boolean;
  isBlockedByDebtVeto: boolean;
  alreadySigned: boolean;
} {
  const tier = state.club.tier || 3;
  const country = state.club.country || 'GER';
  const league = getLeagueInfo(tier, country);
  const signingFeeK = Math.max(25, Math.round(getLeagueScaledVal(tier, 28000, country)));
  const annualWageBurdenK = Math.max(40, Math.round((league.wages || 200) * 0.30));
  const isEligibleTier = tier >= 3 && tier <= 11;
  const isBlockedByDebtVeto =
    (state.seasonsInDebt || 0) >= 2 ||
    state.boardVision?.type === 'financial_restructure' ||
    state.budget < -Math.round(getLeagueScaledVal(tier, 35000, country));
  const alreadySigned = !!state.veteranRingerSignedThisSeason;

  return {
    signingFeeK,
    annualWageBurdenK,
    isEligibleTier,
    isBlockedByDebtVeto,
    alreadySigned,
  };
}

export interface ManagerialDilemmaOption {
  labelEn: string;
  labelDe: string;
  subEn: string;
  subDe: string;
  budgetDeltaK: number;
  ovrDelta: number;
  moraleDelta: number;
  badgeEn: string;
  badgeDe: string;
  tone: 'emerald' | 'sky' | 'amber' | 'rose';
}

export interface ManagerialDilemma {
  id: string;
  titleEn: string;
  titleDe: string;
  categoryEn: string;
  categoryDe: string;
  descEn: string;
  descDe: string;
  icon: string;
  optionA: ManagerialDilemmaOption;
  optionB: ManagerialDilemmaOption;
}

export function getManagerialDilemmas(state: GameState): ManagerialDilemma[] {
  const medLvl = state.club.medicalLevel || 1;
  const tier = state.club.tier || 1;
  const country = state.club.country || 'GER';
  // Scale dilemma financial stakes by division tier (preserving Tier 4 grassroots baseline while scaling up for Tier 1-3)
  const baseRehabK = getLeagueScaledVal(tier, [0, 800, 300, 100, 40], country);
  // Level 5 Medical Center: Preventative Screening (€0 cost, 0 OVR loss, +3 Morale)
  // Level 2+ Medical Center: Halves mid-season injury rehab costs
  const strikerRehabCostK = medLvl >= 5 ? 0 : medLvl >= 2 ? Math.max(5, Math.round(baseRehabK * 0.5)) : Math.max(10, baseRehabK);
  const playmakerBuyoutK = Math.max(25, getLeagueScaledVal(tier, [0, 3800, 1200, 350, 100], country));
  const bonusPoolK = Math.max(10, getLeagueScaledVal(tier, [0, 600, 200, 75, 25], country));
  const analystCostK = Math.max(5, getLeagueScaledVal(tier, [0, 400, 140, 50, 20], country));

  const fmtRehab = formatMoney(strikerRehabCostK, country);
  const fmtBuyout = formatMoney(playmakerBuyoutK, country);
  const fmtBonus = formatMoney(bonusPoolK, country);
  const fmtAnalyst = formatMoney(analystCostK, country);

  const strikerOptionALabelEn =
    medLvl >= 5
      ? 'Preventative Screening Protocol (Medical Lvl 5)'
      : medLvl >= 2
      ? 'Cryo Specialist Rehab (50% Medical Lvl 2+ Discount)'
      : 'Authorize Private Specialist Rehab';
  const strikerOptionALabelDe =
    medLvl >= 5
      ? 'Präventiv-Screening Protokoll (Medizin Lvl 5)'
      : medLvl >= 2
      ? 'Kryo-Spezial-Reha (50% Rabatt ab Medizin Lvl 2)'
      : 'Private Spezialisten-Reha finanzieren';

  return [
    {
      id: 'striker_tear',
      categoryEn: 'MEDICAL EMERGENCY · SPORTS SCIENCE',
      categoryDe: 'MEDIZINISCHER NOTFALL · SPORTMEDIZIN',
      titleEn: 'Star Striker Hamstring & Cruciate Scare',
      titleDe: 'Top-Torjäger mit Muskelbündelriss-Verdacht',
      descEn:
        'Your leading goalscorer limped off in agony during high-intensity training. Without immediate specialist intervention, your attack will suffer a severe rating drop for the run-in.',
      descDe:
        'Dein bester Torschütze musste das Abschlusstraining verletzt abbrechen. Ohne sofortige Spezialbehandlung droht ein empfindlicher Qualitätsverlust im Sturm.',
      icon: 'fa-kit-medical',
      optionA: {
        labelEn: strikerOptionALabelEn,
        labelDe: strikerOptionALabelDe,
        subEn:
          medLvl >= 5
            ? 'Longevity Institute catches tear early — full recovery at zero cost!'
            : 'Fly in renowned sports surgeon to guarantee full matchday fitness.',
        subDe:
          medLvl >= 5
            ? 'Longevity-Institut erkennt Mikroverletzung frühzeitig — kostenlose Heilung!'
            : 'Spezialklinik sichert sofortige Rückkehr ohne Stärkeverlust.',
        budgetDeltaK: -strikerRehabCostK,
        ovrDelta: 0,
        moraleDelta: medLvl >= 5 ? 3 : 0,
        badgeEn:
          strikerRehabCostK === 0
            ? 'FREE (LVL 5 MED) · 0 OVR LOSS · +3 MORALE'
            : `-${fmtRehab} · 0 OVR LOSS`,
        badgeDe:
          strikerRehabCostK === 0
            ? 'GRATIS (LVL 5 MED) · 0 GES-VERLUST · +3 MORAL'
            : `-${fmtRehab} · 0 GES-VERLUST`,
        tone: 'emerald',
      },
      optionB: {
        labelEn: 'Rely on Standard Club Physios',
        labelDe: 'Standard-Vereinsphysios nutzen',
        subEn: 'Save treasury cash, but the striker misses key fixtures.',
        subDe: 'Schont die Vereinskasse, aber der Torjäger fällt wochenlang aus.',
        budgetDeltaK: 0,
        ovrDelta: -2,
        moraleDelta: 0,
        badgeEn: 'FREE · -2 OVR DEFICIT',
        badgeDe: 'GRATIS · -2 GES DEFIZIT',
        tone: 'rose',
      },
    },
    {
      id: 'playmaker_tapped_up',
      categoryEn: 'TRANSFER CRISIS · DRESSING ROOM',
      categoryDe: 'TRANSFER-KRISE · KABINENUNRUHE',
      titleEn: tier === 1 ? 'Continental Giant Tapping Up Playmaker' : 'Higher-Tier Club Tapping Up Playmaker',
      titleDe: tier === 1 ? 'Top-Klub wirbt Spielmacher ab' : 'Höherklassiger Klub wirbt Spielmacher ab',
      descEn:
        tier === 1
          ? `Scouts from a wealthy continental suitor have privately turned your star No. 10’s head mid-campaign, tabling an immediate ${fmtBuyout} buyout.`
          : `Scouts from a wealthy higher-division suitor have privately turned your star No. 10’s head mid-campaign, tabling an immediate ${fmtBuyout} buyout.`,
      descDe:
        tier === 1
          ? `Ein finanzkräftiger Top-Klub hat deinem Spielmacher den Kopf verdreht und bietet sofort ${fmtBuyout} Ablöse mitten in der Saison.`
          : `Ein finanzkräftiger Klub aus einer höheren Liga hat deinem Spielmacher den Kopf verdreht und bietet sofort ${fmtBuyout} Ablöse mitten in der Saison.`,
      icon: 'fa-money-bill-transfer',
      optionA: {
        labelEn: `Cash In Mid-Season (+${fmtBuyout})`,
        labelDe: `Sofort verkaufen (+${fmtBuyout})`,
        subEn: 'Sanction the transfer for an immediate treasury windfall, sacrificing midfield creativity.',
        subDe: 'Nimm das Geld für die Vereinskasse, aber verliere Kreativität im Mittelfeld.',
        budgetDeltaK: playmakerBuyoutK,
        ovrDelta: -2,
        moraleDelta: 0,
        badgeEn: `+${fmtBuyout} WINDFALL · -2 OVR`,
        badgeDe: `+${fmtBuyout} EINNAHME · -2 GES`,
        tone: 'amber',
      },
      optionB: {
        labelEn: 'Block Move & Enforce Contract',
        labelDe: 'Wechsel verbieten & Vertrag durchsetzen',
        subEn: 'Keep your star playmaker on the pitch, triggering dressing room friction.',
        subDe: 'Halte den Spielmacher im Kader, riskiere aber Unruhe in der Kabine.',
        budgetDeltaK: 0,
        ovrDelta: 0,
        moraleDelta: -15,
        badgeEn: '0 OVR LOSS · -15 MORALE',
        badgeDe: '0 GES-VERLUST · -15 MORAL',
        tone: 'sky',
      },
    },
    {
      id: 'bonus_ultimatum',
      categoryEn: 'CAPTAINS COUNCIL · WIN BONUS ULTIMATUM',
      categoryDe: 'SPIELERRAT · PRÄMIEN-ULTIMATUM',
      titleEn: 'Dressing Room Promotion & Win Bonus Ultimatum',
      titleDe: `Mannschaftsrat fordert ${fmtBonus} Siegprämien-Pool`,
      descEn:
        `Senior squad captains have entered your office demanding an extra ${fmtBonus} win-bonus pool to supercharge motivation for the decisive fixtures.`,
      descDe:
        `Die Kapitäne fordern vor den entscheidenden Wochen einen Sonder-Prämientopf über ${fmtBonus} für zusätzliche Motivation.`,
      icon: 'fa-coins',
      optionA: {
        labelEn: `Authorize ${fmtBonus} Bonus Pool`,
        labelDe: `${fmtBonus} Prämientopf genehmigen`,
        subEn: 'Electrify the locker room and unite the players behind the campaign.',
        subDe: 'Elektrisiere die Kabine und sorge für maximalen Teamgeist.',
        budgetDeltaK: -bonusPoolK,
        ovrDelta: 0,
        moraleDelta: 15,
        badgeEn: `-${fmtBonus} · +15 MORALE SURGE`,
        badgeDe: `-${fmtBonus} · +15 MORAL-SCHUB`,
        tone: 'emerald',
      },
      optionB: {
        labelEn: 'Reject Demands & Enforce Wage Cap',
        labelDe: 'Forderung ablehnen & Gehaltsdisziplin wahren',
        subEn: 'Protect club finances at the cost of dressing room grumbling.',
        subDe: 'Schütze das Vereinsbudget auf Kosten der Stimmung in der Kabine.',
        budgetDeltaK: 0,
        ovrDelta: 0,
        moraleDelta: -10,
        badgeEn: '-10 MORALE',
        badgeDe: '-10 MORAL',
        tone: 'rose',
      },
    },
    {
      id: 'leaked_signals',
      categoryEn: 'TACTICAL ESPIONAGE · MATCH PREP',
      categoryDe: 'TAKTIK-LEAK · SPIELVORBEREITUNG',
      titleEn: 'Leaked Set-Piece & Pressing Signals',
      titleDe: 'Taktische Standards & Pressing-Codes geleakt',
      descEn:
        'Division rivals have decoded your set-piece routines and pressing triggers after training footage leaked online.',
      descDe:
        'Ligakonkurrenten haben deine Standard-Varianten und Pressing-Signale nach einem Video-Leak entschlüsselt.',
      icon: 'fa-chess-board',
      optionA: {
        labelEn: 'Hire Specialist Tactical Analyst',
        labelDe: 'Spezial-Taktikanalysten verpflichten',
        subEn: 'Overhaul set-piece playbook and install unpredictable counter-triggers.',
        subDe: 'Entwickle völlig neue Standard-Routinen und überrasche die Gegner.',
        budgetDeltaK: -analystCostK,
        ovrDelta: 1,
        moraleDelta: 0,
        badgeEn: `-${fmtAnalyst} · +1 OVR BOOST`,
        badgeDe: `-${fmtAnalyst} · +1 GES-BOOST`,
        tone: 'emerald',
      },
      optionB: {
        labelEn: 'Stick to Existing Routines',
        labelDe: 'An bisherigen Abläufen festhalten',
        subEn: 'Refuse extra expenditure and accept predictable tactical drag.',
        subDe: 'Keine Zusatzkosten, aber Gegner sind auf deine Standards eingestellt.',
        budgetDeltaK: 0,
        ovrDelta: -1,
        moraleDelta: 0,
        badgeEn: '-1 OVR STALENESS DRAG',
        badgeDe: '-1 GES ABNUTZUNG',
        tone: 'rose',
      },
    },
  ];
}

export interface FacilityMilestoneInfo {
  level: number;
  titleEn: string;
  titleDe: string;
  badgeEn: string;
  badgeDe: string;
  perkEn: string;
  perkDe: string;
  descEn: string;
  descDe: string;
  icon: string;
}

export const ACADEMY_MILESTONES: FacilityMilestoneInfo[] = [
  {
    level: 1,
    titleEn: 'Local Grassroots',
    titleDe: 'Lokale Basis',
    badgeEn: '1 Scout & 1 Call-Up / yr',
    badgeDe: '1 Scout & 1 Berufung / Jahr',
    perkEn: '1 Scout & 1 Call-Up / Season (6 incubator slots)',
    perkDe: '1 Scout & 1 Berufung / Saison (6 Internatsplätze)',
    descEn: '1 youth scout mission & 1 senior graduation call-up per season (6 incubator slots).',
    descDe: '1 Jugend-Scouting & 1 Kader-Beförderung pro Saison (6 Internatsplätze).',
    icon: 'fa-seedling',
  },
  {
    level: 2,
    titleEn: 'Regional Hub',
    titleDe: 'Regionales Zentrum',
    badgeEn: '2 Scouts & Poach Shield 🛡️',
    badgeDe: '2 Scouts & Abwerbe-Schutz 🛡️',
    perkEn: '2 Scouts / Season (8 incubator slots) + Poach Shield (50% fewer poaches)',
    perkDe: '2 Scouts / Saison (8 Internatsplätze) + Abwerbe-Schutz (-50% Abwerbungen)',
    descEn: 'Unlocks 2 youth scouts per season (8 incubator slots) + Poach Shield.',
    descDe: 'Schaltet 2 Jugend-Scoutings pro Saison frei (8 Internatsplätze) + Abwerbe-Schutz.',
    icon: 'fa-compass',
  },
  {
    level: 3,
    titleEn: 'National Academy (NLZ)',
    titleDe: 'Leistungszentrum (NLZ)',
    badgeEn: '4 Scouts & +1 OVR Incubation 🌱',
    badgeDe: '4 Scouts & +1 GES Reifung 🌱',
    perkEn: '4 Scouts & 2 Call-Ups / Season (10 slots) + +1 OVR Incubation Bonus on call-up',
    perkDe: '4 Scouts & 2 Berufungen / Saison (10 Plätze) + +1 GES Reifungs-Bonus bei Beförderung',
    descEn: 'Unlocks 4 youth scouts & 2 call-ups/yr (10 incubator slots) + +1 OVR Incubation Bonus.',
    descDe: 'Schaltet 4 Scouts & 2 Beförderungen/Jahr frei (10 Internatsplätze) + +1 GES Reifungs-Bonus.',
    icon: 'fa-shield-halved',
  },
  {
    level: 4,
    titleEn: 'Elite Continental Hub',
    titleDe: 'Kontinentales Elite-Zentrum',
    badgeEn: '6 Scouts & 15% Golden Boy 🌟',
    badgeDe: '6 Scouts & 15% Golden Boy 🌟',
    perkEn: '6 Scouts & 2 Call-Ups / Season (11 slots) + 15% Golden Boy Wonderkid Roll (+3 OVR)',
    perkDe: '6 Scouts & 2 Berufungen / Saison (11 Plätze) + 15% Golden-Boy-Chance (+3 GES)',
    descEn: 'Unlocks 6 youth scouts/yr (11 incubator slots) + 15% Golden Boy Wonderkid Roll (+3 OVR).',
    descDe: 'Schaltet 6 Scouts/Jahr (11 Internatsplätze) + 15% Golden-Boy-Chance (+3 GES) frei.',
    icon: 'fa-earth-americas',
  },
  {
    level: 5,
    titleEn: 'World-Class La Masia Complex',
    titleDe: 'Weltklasse La-Masia-Komplex',
    badgeEn: '10 Scouts & +€1.5M Dividend 👑',
    badgeDe: '10 Scouts & +€1,5M Dividende 👑',
    perkEn: '10 Scouts & 3 Call-Ups / Season (12 slots) + €1.5M Annual Solidarity Dividend & Immunity',
    perkDe: '10 Scouts & 3 Berufungen / Saison (12 Plätze) + €1,5M Solidaritätsdividende & Immunität',
    descEn: 'Unlocks 10 youth scouts & 3 call-ups/yr (12 slots), €1.5M/yr Solidarity Dividend, and poach immunity.',
    descDe: 'Schaltet 10 Scouts & 3 Beförderungen/Jahr (12 Plätze), €1,5M/Jahr Dividende und Abwerbe-Immunität frei.',
    icon: 'fa-crown',
  },
];

export const MEDICAL_MILESTONES: FacilityMilestoneInfo[] = [
  {
    level: 1,
    titleEn: 'Basic Physio Room',
    titleDe: 'Basis-Physioraum',
    badgeEn: 'Baseline Care',
    badgeDe: 'Basis-Betreuung',
    perkEn: 'Standard seasonal squad wear-and-tear and baseline injury exposure',
    perkDe: 'Standardmäßiger saisonaler Verschleiß und normale Verletzungsanfälligkeit',
    descEn: 'Standard seasonal squad wear-and-tear and baseline injury exposure.',
    descDe: 'Standardmäßiger saisonaler Verschleiß und normale Verletzungsanfälligkeit.',
    icon: 'fa-briefcase-medical',
  },
  {
    level: 2,
    titleEn: 'Sports Rehab Clinic',
    titleDe: 'Sport-Rehaklinik',
    badgeEn: '-50% Rehab Costs ❄️',
    badgeDe: '-50% Reha-Kosten ❄️',
    perkEn: 'Halves mid-season injury rehab costs (-50%) and reduces minor fatigue decay',
    perkDe: 'Halbiert Reha-Kosten bei Saison-Dilemmas (-50%) und senkt Ermüdung',
    descEn: 'Reduces seasonal aging/fatigue OVR decay odds and halves mid-season injury rehab costs.',
    descDe: 'Senkt Altersverfall-Risiko und halbiert Reha-Kosten bei Saison-Dilemmas um 50%.',
    icon: 'fa-snowflake',
  },
  {
    level: 3,
    titleEn: 'Cryo & Biomechanics Lab',
    titleDe: 'Kryo- & Biomechanik-Labor',
    badgeEn: 'Wear-and-Tear Shield 🧬',
    badgeDe: 'Verschleiß-Schutzschild 🧬',
    perkEn: 'Shields squad from severe unbonded wear-and-tear (dramaticDecay = 0)',
    perkDe: 'Schützt vor schwerem Kaderverfall (dramaticDecay = 0) & halbiert Altersabzug',
    descEn: 'Shields squad from severe unbonded decay (dramaticDecay = 0) and reduces aging/retirement OVR penalties by 50%.',
    descDe: 'Schützt vor schwerem Kaderverfall und reduziert Alters-/Karriereende-Abzüge um 50%.',
    icon: 'fa-dna',
  },
  {
    level: 4,
    titleEn: 'High-Performance Performance Hub',
    titleDe: 'Hochleistungs-Performance-Hub',
    badgeEn: '80% Decay Negation ⚡',
    badgeDe: '80% Verfalls-Schutz ⚡',
    perkEn: '80% probability to negate natural OVR decay for veteran squads + +5 Morale/yr',
    perkDe: '80% Chance, natürlichen Altersverfall komplett zu verhindern + +5 Moral/Jahr',
    descEn: 'High probability (80%) to negate natural OVR decay for veteran squads (85+ OVR) and +5 baseline squad morale each season.',
    descDe: '80% Chance, natürlichen Altersverfall bei Top-Kadern (85+ GES) komplett zu verhindern + 5 Basis-Moral pro Saison.',
    icon: 'fa-bolt',
  },
  {
    level: 5,
    titleEn: 'World-Class Sports Science & Longevity Institute',
    titleDe: 'Weltklasse Sportwissenschafts- & Longevity-Institut',
    badgeEn: '100% Wear Immunity 🏆',
    badgeDe: '100% Verschleiß-Immunität 🏆',
    perkEn: '100% immunity to off-season wear-and-tear OVR loss + Free Injury Screening',
    perkDe: '100% Immunität gegen Saisonende-Verschleiß + Gratis Präventiv-Screening',
    descEn: '100% immunity to off-season wear-and-tear OVR loss, co-immunity from "Target on the Back" fatigue tax, and free Preventative Screening.',
    descDe: '100% Immunität gegen Saisonende-Verschleiß, Schutz vor Meister-Ermüdung und kostenloses Präventiv-Screening.',
    icon: 'fa-heart-pulse',
  },
];

export const YOUTH_ACADEMY_MILESTONES = ACADEMY_MILESTONES;
export const MEDICAL_CENTER_MILESTONES = MEDICAL_MILESTONES;

export function rollGrassrootsTvCupDraw(
  tier: number,
  country: string = 'GER',
  clubsDb: Club[] = [],
  isModActive: boolean = false,
  clubName?: string
): {
  triggered: boolean;
  drawn: boolean;
  opponentName?: string;
  opponentLogo?: string;
  opponentColor?: string;
  opponentOvr?: number;
} {
  // Reserve teams (II / U23 / U21 / B-teams) are barred from domestic cup competitions and do not receive the Magic Cup Draw influx
  if (clubName && isReserveClub(clubName)) {
    return { triggered: false, drawn: false };
  }
  if (tier < 3 || tier > 11) {
    return { triggered: false, drawn: false };
  }
  // 25% random chance at start of season for Tiers 3-11
  if (Math.random() > 0.25) {
    return { triggered: false, drawn: false };
  }
  const giant = pickTier1CupGiant(country, clubsDb);
  return {
    triggered: true,
    drawn: true,
    opponentName: giant.name,
    opponentLogo: isModActive ? giant.logo : giant.fallbackLogo || giant.logo,
    opponentColor: giant.color || 'f59e0b',
    opponentOvr: giant.baseOvr || 86,
  };
}

export const FOREIGN_IMPORT_NATIONS: { code: string; name: string; flag: string; firstNames: string[]; lastNames: string[] }[] = [
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷', firstNames: ['Endrick', 'Estevão', 'Vitor', 'Savinho', 'Gabriel', 'Vinicius', 'Rodrygo', 'João', 'Kauã'], lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Roque', 'Moreira', 'Guimarães', 'Paquetá'] },
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷', firstNames: ['Claudio', 'Franco', 'Valentín', 'Alejandro', 'Thiago', 'Enzo', 'Julián', 'Lautaro', 'Nico'], lastNames: ['Echeverri', 'Mastantuono', 'Barco', 'Garnacho', 'Almada', 'Paz', 'Romero', 'Álvarez'] },
  { code: 'FRA', name: 'France', flag: '🇫🇷', firstNames: ['Warren', 'Leny', 'Désiré', 'Mathys', 'Rayan', 'Bradley', 'Eduardo', 'Kylian'], lastNames: ['Zaïre-Emery', 'Yoro', 'Doué', 'Tel', 'Cherki', 'Barcola', 'Camavinga', 'Saliba'] },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸', firstNames: ['Lamine', 'Pau', 'Gavi', 'Pedri', 'Fermín', 'Nico', 'Alejandro', 'Samu'], lastNames: ['Yamal', 'Cubarsí', 'López', 'Williams', 'Balde', 'Baena', 'Pino', 'Omorodion'] },
  { code: 'ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', firstNames: ['Kobbie', 'Ethan', 'Jude', 'Cole', 'Bukayo', 'Archie', 'Rico', 'Myles'], lastNames: ['Mainoo', 'Nwaneri', 'Bellingham', 'Palmer', 'Gray', 'Lewis', 'Lewis-Skelly', 'Wharton'] },
  { code: 'GER', name: 'Germany', flag: '🇩🇪', firstNames: ['Jamal', 'Florian', 'Aleksandar', 'Paul', 'Paris', 'Assan', 'Maxi', 'Tom'], lastNames: ['Musiala', 'Wirtz', 'Pavlović', 'Wanner', 'Brunner', 'Ouédraogo', 'Beier', 'Bischof'] },
  { code: 'POR', name: 'Portugal', flag: '🇵🇹', firstNames: ['João', 'Geovany', 'Rodrigo', 'António', 'Gonçalo', 'Vitinha', 'Nuno', 'Francisco'], lastNames: ['Neves', 'Quenda', 'Mora', 'Silva', 'Inácio', 'Conceição', 'Mendes', 'Araújo'] },
  { code: 'NED', name: 'Netherlands', flag: '🇳🇱', firstNames: ['Xavi', 'Jorrel', 'Ryan', 'Jeremie', 'Micky', 'Brian', 'Tijjani', 'Quinten'], lastNames: ['Simons', 'Hato', 'Gravenberch', 'Frimpong', 'van de Ven', 'Brobbey', 'Reijnders', 'Timber'] },
  { code: 'CRO', name: 'Croatia', flag: '🇭🇷', firstNames: ['Martin', 'Joško', 'Luka', 'Lovro', 'Petar', 'Gabriel', 'Anton', 'Roko'], lastNames: ['Baturina', 'Gvardiol', 'Sučić', 'Majer', 'Vidović', 'Matković', 'Šimić', 'Kovačić'] },
];

export function pickTier1CupGiant(country: string = 'GER', clubsDb: Club[] = [], userClubId?: number): Club {
  const safeDb = Array.isArray(clubsDb) && clubsDb.length > 0 ? clubsDb : ALL_CLUBS;
  const domesticTier1 = safeDb
    .filter((c) => (c.country || 'GER') === country && c.tier === 1 && c.id !== userClubId)
    .sort((a, b) => (b.baseOvr || 80) - (a.baseOvr || 80));

  if (domesticTier1.length > 0) {
    const topPool = domesticTier1.slice(0, Math.min(5, domesticTier1.length));
    return topPool[Math.floor(Math.random() * topPool.length)] || topPool[0];
  }

  const anyTier1 = safeDb
    .filter((c) => c.tier === 1 && c.id !== userClubId)
    .sort((a, b) => (b.baseOvr || 80) - (a.baseOvr || 80));
  if (anyTier1.length > 0) {
    return anyTier1[0];
  }

  return (
    safeDb[0] || {
      id: 999001,
      name: 'Capital Giants FC',
      tier: 1,
      baseOvr: 88,
      color: 'dc052d',
      stadium: 65000,
      country,
    }
  );
}

/**
 * Generates authentic football scorelines for a given sequence of 'W' | 'D' | 'L' outcomes
 * that sum up 100% to targetGf and targetGa.
 */
function buildExactFootballScorelines(
  outcomes: ('W' | 'D' | 'L')[],
  targetGf: number,
  targetGa: number
): { userGoals: number; oppGoals: number }[] {
  const n = outcomes.length;
  if (n === 0) return [];

  // Initialize each match with a valid baseline football scoreline
  const scores = outcomes.map((res) => {
    if (res === 'W') {
      const baseClose = Math.random() < 0.45 ? { u: 1, o: 0 } : Math.random() < 0.7 ? { u: 2, o: 1 } : { u: 2, o: 0 };
      return baseClose;
    }
    if (res === 'D') {
      const drawRoll = Math.random();
      if (drawRoll < 0.35) return { u: 0, o: 0 };
      if (drawRoll < 0.82) return { u: 1, o: 1 };
      return { u: 2, o: 2 };
    }
    // Loss
    const lossRoll = Math.random();
    if (lossRoll < 0.45) return { u: 0, o: 1 };
    if (lossRoll < 0.75) return { u: 1, o: 2 };
    return { u: 0, o: 2 };
  });

  // Note: To preserve W (u > o), D (u == o), L (u < o), any single-side adjustment on a match must keep the inequality valid.
  // Even simpler:
  // Let's write a clean two-step exact balancer:
  // Every match i has a base pair:
  //   W: u_i = o_i + m_i (where margin m_i >= 1)
  //   D: u_i = o_i       (margin m_i = 0)
  //   L: o_i = u_i + m_i (where margin m_i >= 1)
  // Notice that:
  //   targetGf - targetGa = sum(W margins) - sum(L margins)!
  const winIndices: number[] = [];
  const drawIndices: number[] = [];
  const lossIndices: number[] = [];
  outcomes.forEach((r, idx) => {
    if (r === 'W') winIndices.push(idx);
    else if (r === 'D') drawIndices.push(idx);
    else lossIndices.push(idx);
  });

  const winMargins = winIndices.map(() => (Math.random() < 0.65 ? 1 : 2));
  const lossMargins = lossIndices.map(() => (Math.random() < 0.65 ? 1 : 2));

  // Ensure targetGf and targetGa are feasible with at least +1 margin per Win and -1 margin per Loss
  const minGd = winIndices.length * 1 - lossIndices.length * 4;
  const maxGd = winIndices.length * 4 - lossIndices.length * 1;
  const clampedGd = Math.max(minGd, Math.min(maxGd, targetGf - targetGa));
  const effectiveGa = Math.max(lossIndices.length, targetGa);
  const effectiveGf = Math.max(winIndices.length, effectiveGa + clampedGd);

  let currentGd =
    winMargins.reduce((a, b) => a + b, 0) - lossMargins.reduce((a, b) => a + b, 0);
  const desiredGd = effectiveGf - effectiveGa;

  let guard = 0;
  while (currentGd !== desiredGd && guard < 400) {
    guard++;
    if (currentGd < desiredGd) {
      // Need higher GD: increase a win margin (up to 4) or decrease a loss margin (down to 1)
      const canIncWin = winMargins.some((m) => m < 4);
      const canDecLoss = lossMargins.some((m) => m > 1);
      if (canIncWin && (!canDecLoss || Math.random() < 0.6)) {
        const idx = winMargins.findIndex((m) => m < 4);
        if (idx !== -1) {
          winMargins[idx]++;
          currentGd++;
        }
      } else if (canDecLoss) {
        const idx = lossMargins.findIndex((m) => m > 1);
        if (idx !== -1) {
          lossMargins[idx]--;
          currentGd++;
        }
      } else {
        break;
      }
    } else {
      // Need lower GD: decrease a win margin (down to 1) or increase a loss margin (up to 4)
      const canDecWin = winMargins.some((m) => m > 1);
      const canIncLoss = lossMargins.some((m) => m < 4);
      if (canDecWin && (!canIncLoss || Math.random() < 0.6)) {
        const idx = winMargins.findIndex((m) => m > 1);
        if (idx !== -1) {
          winMargins[idx]--;
          currentGd--;
        }
      } else if (canIncLoss) {
        const idx = lossMargins.findIndex((m) => m < 4);
        if (idx !== -1) {
          lossMargins[idx]++;
          currentGd--;
        }
      } else {
        break;
      }
    }
  }

  // Set base goals from margins (loser/draw goals = 0 initially):
  const finalScores = outcomes.map(() => ({ userGoals: 0, oppGoals: 0 }));
  winIndices.forEach((mIdx, i) => {
    finalScores[mIdx].userGoals = winMargins[i];
    finalScores[mIdx].oppGoals = 0;
  });
  lossIndices.forEach((mIdx, i) => {
    finalScores[mIdx].userGoals = 0;
    finalScores[mIdx].oppGoals = lossMargins[i];
  });

  // Now sum(oppGoals) = sum(lossMargins). Every time we add +1 to BOTH userGoals and oppGoals on any match,
  // GD stays identical and both GF and GA increase by +1!
  let currentGa = finalScores.reduce((acc, s) => acc + s.oppGoals, 0);
  let sharedToAdd = Math.max(0, effectiveGa - currentGa);
  let sharedGuard = 0;
  while (sharedToAdd > 0 && sharedGuard < 600) {
    sharedGuard++;
    const idx = Math.floor(Math.random() * n);
    // Keep realistic football scorelines (avoid 6-5 hockey scores)
    if (finalScores[idx].userGoals < 4 && finalScores[idx].oppGoals < 4) {
      finalScores[idx].userGoals += 1;
      finalScores[idx].oppGoals += 1;
      sharedToAdd -= 1;
    } else {
      const anyIdx = finalScores.findIndex((s) => s.userGoals < 5 && s.oppGoals < 5);
      if (anyIdx !== -1) {
        finalScores[anyIdx].userGoals += 1;
        finalScores[anyIdx].oppGoals += 1;
        sharedToAdd -= 1;
      } else {
        finalScores[0].userGoals += 1;
        finalScores[0].oppGoals += 1;
        sharedToAdd -= 1;
      }
    }
  }

  return finalScores;
}

/**
 * Pre-calculates the probabilistic season outcome and match-by-match schedule
 * with 100% mathematical parity to the core simulation engine.
 */
export function calculateProbabilisticSeason(
  state: GameState,
  clubsDb: Club[] = [],
  isModActive: boolean = false,
  options?: {
    lockFirstHalfFrom?: PendingSeasonState;
    dilemmaChoice?: 'A' | 'B';
  }
): PendingSeasonState {
  const seasonLeague = state.club?.tier || 1;
  const clubCountry = state.club?.country || 'GER';
  const year = state.year || 2026;
  const currentMorale = state.club?.morale ?? 100;
  const currentOvr = state.club?.baseOvr || 65;
  const currentTactic = state.tactic || 'Total Football';

  // If we already have a valid pendingSeasonState for this exact year/tier and OVR/morale/tactic haven't changed, return it
  const existing = options?.lockFirstHalfFrom || state.pendingSeasonState;
  if (
    !options?.lockFirstHalfFrom &&
    existing &&
    existing.year === year &&
    existing.tier === seasonLeague &&
    existing.country === clubCountry &&
    existing.schedule?.length === 34 &&
    existing._meta?.ovrAtCalculation === currentOvr &&
    existing._meta?.moraleAtCalculation === currentMorale &&
    existing._meta?.tacticAtCalculation === currentTactic
  ) {
    return existing;
  }

  const league = getLeagueInfo(seasonLeague, clubCountry);
  const tacticInfo = TACTICS[currentTactic] || TACTICS['Total Football'];

  // 1. Philosophy, Coach, Synergy, and Tactical Wheel Modifiers (100% Engine Parity)
  let philosophyOvrBonus = 0;
  const hasChessboardMaestro =
    state.currentCoach?.strength === 'Tactical Chessboard Maestro' ||
    (state.currentCoach as any)?.archetype === 'chessboard_maestro';
  if ((state.managerSkills || []).includes('tactical_mastermind') || hasChessboardMaestro) {
    philosophyOvrBonus += 2;
  }

  if (state.currentCoach) {
    if (isTacticalSynergy(state.currentCoach.style, currentTactic)) {
      const synergyGain =
        state.clubIdentity === 'moneyball'
          ? 4
          : state.currentCoach.weakness === 'Tactical Rigidity'
          ? 3
          : 2;
      philosophyOvrBonus += synergyGain;
    } else if (state.currentCoach.weakness === 'Tactical Rigidity') {
      philosophyOvrBonus -= 5;
    }

    if (state.currentCoach.hiddenAttributes) {
      const { tacticalFlexibility, motivationalDrive, discipline } =
        state.currentCoach.hiddenAttributes;
      if (tacticalFlexibility >= 16) {
        philosophyOvrBonus += tacticalFlexibility >= 18 ? 1.5 : 1.0;
      }
      if (motivationalDrive >= 16 && currentOvr < league.avgOvr) {
        philosophyOvrBonus += 1.5;
      }
      if (discipline >= 16) {
        philosophyOvrBonus += 0.5;
      }
    }

    if (state.hasNewManagerBounce) {
      philosophyOvrBonus += 2;
    }
    if ((state.coachTenure || 0) >= 3 && state.currentCoach?.strength !== 'Continental Legend') {
      philosophyOvrBonus -= 1;
    }
  } else {
    philosophyOvrBonus -= 4;
  }

  // Morale modifier on on-pitch performance
  if (currentMorale >= 85) philosophyOvrBonus += 1.0;
  else if (currentMorale < 45) philosophyOvrBonus -= 1.5;

  const getLeagueAdvantage = (myTac: string, metaTac: string) => {
    const p = myTac === 'Catenaccio' || myTac === 'Defensive' ? 'Park the Bus' : myTac;
    if (p === 'Tiki-Taka' && metaTac === 'Park the Bus') return 1;
    if (p === 'Tiki-Taka' && metaTac === 'Gegenpressing') return -1;
    if (p === 'Park the Bus' && metaTac === 'Direct Counter') return 1;
    if (p === 'Park the Bus' && metaTac === 'Tiki-Taka') return -1;
    if (p === 'Direct Counter' && metaTac === 'Gegenpressing') return 1;
    if (p === 'Direct Counter' && metaTac === 'Park the Bus') return -1;
    if (p === 'Gegenpressing' && metaTac === 'Tiki-Taka') return 1;
    if (p === 'Gegenpressing' && metaTac === 'Direct Counter') return -1;
    return 0;
  };

  const leagueMetaAdv = getLeagueAdvantage(
    currentTactic,
    (state as any).leagueMetaTactic || 'Total Football'
  );
  if (leagueMetaAdv === 1) philosophyOvrBonus += 2;
  if (leagueMetaAdv === -1) philosophyOvrBonus -= 2;

  if (tacticInfo.ovrBonusType === 'underdog' && currentOvr < league.avgOvr) {
    philosophyOvrBonus += 3;
  } else if (tacticInfo.ovrBonusType === 'dominance') {
    if (currentOvr > league.avgOvr) philosophyOvrBonus += 2;
    else if (currentOvr < 60) philosophyOvrBonus -= 1;
  } else if (tacticInfo.ovrBonusType === 'home') {
    philosophyOvrBonus += 1.5;
  } else if (tacticInfo.ovrBonusType === 'away') {
    philosophyOvrBonus += 1.5;
  }

  if (state.staleTactic && currentTactic === state.staleTactic) {
    const hasFacilityImmunity = (state.club?.medicalLevel || 1) >= 5 && (state.club?.academyLevel || 1) >= 5;
    philosophyOvrBonus -= hasFacilityImmunity ? 2 : 4;
  }

  const effectiveOvrForSim = Math.min(100, currentOvr + philosophyOvrBonus);
  const ovrDiff = effectiveOvrForSim - league.avgOvr;

  // Dynamic Facility Milestone Level 5: Youth Academy Level 5 OR Medical Center Level 5
  // cushions/grants immunity from the "Target on the Back" consecutive-title complacency/fatigue penalty!
  const consecutiveTitles = state.consecutiveTitles || 0;
  const hasLevel5DynastyImmunity =
    (state.club?.academyLevel || 1) >= 5 || (state.club?.medicalLevel || 1) >= 5;
  const championTargetPenalty = hasLevel5DynastyImmunity
    ? 0
    : Math.min(2.0, consecutiveTitles * 0.35);

  const reqCap = getLeagueStadiumRequirement(seasonLeague, clubCountry);
  const userCap = state.club?.stadium || 2000;
  let stadiumPosImpact = 0;
  if (seasonLeague <= 3) {
    if (userCap < reqCap) {
      const deficitRatio = (reqCap - userCap) / reqCap;
      stadiumPosImpact =
        clubCountry === 'GER'
          ? deficitRatio * 3.8
          : clubCountry === 'ESP' || clubCountry === 'ITA' || clubCountry === 'FRA'
          ? deficitRatio * 2.8
          : clubCountry === 'POR'
          ? deficitRatio * 1.5
          : deficitRatio * 2.0;
    } else {
      const surplusRatio = Math.min(1.0, (userCap - reqCap) / reqCap);
      stadiumPosImpact =
        clubCountry === 'GER'
          ? -surplusRatio * 1.2
          : clubCountry === 'ESP' || clubCountry === 'ITA' || clubCountry === 'FRA'
          ? -surplusRatio * 0.8
          : clubCountry === 'POR'
          ? -surplusRatio * 0.4
          : -surplusRatio * 0.6;
    }
  }

  let variance = effectiveOvrForSim < 75 ? rand(-3.0, 3.0) : rand(-2.5, 2.5);
  if (currentOvr >= 90) variance = rand(-1.0, 1.5);
  else if (currentOvr >= 85) variance = rand(-1.5, 2.0);

  const coachStrength = state.currentCoach?.strength;
  const coachWeakness = state.currentCoach?.weakness;
  let coachPosModifier = 0;
  if (coachStrength === 'Cursed') coachPosModifier += 0.9;
  if (coachWeakness === 'Late Match Heartbreak') coachPosModifier += 1.2;
  if (coachWeakness === 'Fan Alienation') coachPosModifier += 0.6;
  const stadiumPolicyModifier = state.stadiumPolicy === 'ultras' ? -0.35 : 0;

  let rawPos =
    9.5 -
    ovrDiff * 0.46 +
    championTargetPenalty +
    stadiumPosImpact +
    variance +
    coachPosModifier +
    stadiumPolicyModifier;
  if (tacticInfo.ovrBonusType === 'catenaccio' && rawPos > 12) {
    rawPos -= 1.5;
  }

  let approxPos = Math.max(1, Math.min(18, Math.round(rawPos)));
  if (currentOvr >= 96 && Math.random() < 0.7) approxPos = 1;

  const posPointsMap: Record<number, number> = {
    1: rand(76, 85),
    2: rand(68, 75),
    3: rand(61, 67),
    4: rand(55, 60),
    5: rand(51, 54),
    6: rand(48, 51),
    7: rand(45, 48),
    8: rand(42, 45),
    9: rand(40, 42),
    10: rand(38, 40),
    11: rand(35, 38),
    12: rand(33, 35),
    13: rand(31, 33),
    14: rand(28, 31),
    15: rand(26, 28),
    16: rand(23, 26),
    17: rand(19, 23),
    18: rand(12, 19),
  };

  const targetPts = posPointsMap[approxPos] || 45;
  let totalWins = Math.min(34, Math.max(1, Math.floor(targetPts / 3)));
  let totalDraws = targetPts - totalWins * 3;
  if (totalDraws < 5 && totalWins > 2) {
    const convertWins = Math.max(0, Math.min(2, Math.floor((34 - (totalWins + totalDraws)) / 2)));
    totalWins -= convertWins;
    totalDraws += convertWins * 3;
  }
  if (totalWins + totalDraws > 34) {
    totalDraws = Math.max(0, 34 - totalWins);
  }
  let totalLosses = Math.max(0, 34 - totalWins - totalDraws);

  const calculatedGd = Math.round((totalWins - totalLosses) * 1.5 + rand(-2, 2));
  const baseGf = Math.round(72 - (approxPos - 1) * 2.1 + rand(-3, 3));
  const gfStyleMultiplier =
    currentTactic === 'Total Football'
      ? 1.14
      : currentTactic === 'Gegenpressing'
      ? 1.16
      : currentTactic === 'Defensive'
      ? 0.9
      : currentTactic === 'Tiki-Taka'
      ? 0.96
      : 1.02;

  let gf = Math.round(baseGf * gfStyleMultiplier);
  if (calculatedGd > 0) gf = Math.max(gf, calculatedGd + 18);
  gf = Math.max(28, Math.min(110, gf));
  let ga = Math.max(12, gf - calculatedGd);
  gf = ga + calculatedGd;

  // Build division opponent list with safe fallbacks
  const safeDb = Array.isArray(clubsDb) && clubsDb.length > 0 ? clubsDb : ALL_CLUBS;
  let divisionOpponents = safeDb.filter(
    (c) => (c.country || 'GER') === clubCountry && c.tier === seasonLeague && c.id !== state.club?.id
  );
  if (divisionOpponents.length === 0) {
    divisionOpponents = safeDb.filter(
      (c) => (c.country || 'GER') === clubCountry && c.id !== state.club?.id
    );
  }
  if (divisionOpponents.length === 0) {
    divisionOpponents = [
      {
        id: 99001,
        name: 'Athletic Union FC',
        tier: seasonLeague,
        baseOvr: league.avgOvr,
        color: '38bdf8',
        stadium: 15000,
        country: clubCountry,
      },
    ];
  }

  // Check if 1st Half outcomes (MD 1-17) are locked in existing state
  const lockedFirstHalf =
    existing &&
    existing.year === year &&
    existing.tier === seasonLeague &&
    existing._meta?.firstHalfOutcomes &&
    existing._meta.firstHalfOutcomes.length === 17
      ? existing._meta.firstHalfOutcomes
      : undefined;

  let schedule: MatchdayOutcome[] = [];

  if (lockedFirstHalf) {
    // Keep 1st Half (MD 1-17) 100% intact and dynamically compute 2nd Half (MD 18-34)
    const fhWins = lockedFirstHalf.filter((m) => m.result === 'W').length;
    const fhDraws = lockedFirstHalf.filter((m) => m.result === 'D').length;
    const fhLosses = lockedFirstHalf.filter((m) => m.result === 'L').length;
    const fhGf = lockedFirstHalf.reduce((s, m) => s + m.userGoals, 0);
    const fhGa = lockedFirstHalf.reduce((s, m) => s + m.oppGoals, 0);

    // Second half targets scaled from current OVR/morale/tactic
    const shTargetPts = Math.max(4, Math.min(51, Math.round(targetPts / 2)));
    let shWins = Math.min(17, Math.max(0, Math.floor(shTargetPts / 3)));
    let shDraws = shTargetPts - shWins * 3;
    if (shDraws < 2 && shWins > 1) {
      shWins -= 1;
      shDraws += 3;
    }
    if (shWins + shDraws > 17) shDraws = Math.max(0, 17 - shWins);
    const shLosses = Math.max(0, 17 - shWins - shDraws);

    const shGd = Math.round((shWins - shLosses) * 1.4);
    let shGf = Math.max(12, Math.round(gf / 2));
    if (shGd > 0) shGf = Math.max(shGf, shGd + 9);
    const shGa = Math.max(6, shGf - shGd);
    shGf = shGa + shGd;

    const shOutcomesPool: ('W' | 'D' | 'L')[] = [
      ...Array(shWins).fill('W'),
      ...Array(shDraws).fill('D'),
      ...Array(shLosses).fill('L'),
    ];
    // Deterministic shuffle
    for (let i = shOutcomesPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shOutcomesPool[i], shOutcomesPool[j]] = [shOutcomesPool[j], shOutcomesPool[i]];
    }

    const shScores = buildExactFootballScorelines(shOutcomesPool, shGf, shGa);

    let rPts = lockedFirstHalf[16].runningPts;
    let rW = fhWins;
    let rD = fhDraws;
    let rL = fhLosses;
    let rGf = fhGf;
    let rGa = fhGa;

    const secondHalfSchedule: MatchdayOutcome[] = shOutcomesPool.map((res, idx) => {
      const md = 18 + idx;
      const opp = divisionOpponents[idx % divisionOpponents.length] || divisionOpponents[0];
      const sc = shScores[idx] || { userGoals: 1, oppGoals: 1 };
      const ptsEarned: 3 | 1 | 0 = res === 'W' ? 3 : res === 'D' ? 1 : 0;
      rPts += ptsEarned;
      if (res === 'W') rW++;
      else if (res === 'D') rD++;
      else rL++;
      rGf += sc.userGoals;
      rGa += sc.oppGoals;

      const runningGd = rGf - rGa;
      const expectedPtsAtMd = (targetPts / 34) * md;
      const ptsDelta = rPts - expectedPtsAtMd;
      const runningPos =
        md === 34
          ? approxPos
          : Math.max(1, Math.min(18, Math.round(approxPos - ptsDelta * 0.45)));

      return {
        matchday: md,
        opponentId: opp.id,
        opponentName: opp.name,
        opponentLogo: isModActive ? opp.logo : undefined,
        opponentFallbackLogo: opp.fallbackLogo,
        opponentColor: opp.color || '38bdf8',
        opponentOvr: opp.baseOvr || league.avgOvr,
        isHome: md % 2 === 1,
        userGoals: sc.userGoals,
        oppGoals: sc.oppGoals,
        result: res,
        ptsEarned,
        runningPts: rPts,
        runningPoints: rPts,
        runningWins: rW,
        runningW: rW,
        runningDraws: rD,
        runningD: rD,
        runningLosses: rL,
        runningL: rL,
        runningGf: rGf,
        runningGa: rGa,
        runningGd,
        runningPos,
        runningPosition: runningPos,
        isUpsetWin: res === 'W' && (opp.baseOvr || league.avgOvr) > currentOvr + 1,
      };
    });

    schedule = [...lockedFirstHalf, ...secondHalfSchedule];
    totalWins = rW;
    totalDraws = rD;
    totalLosses = rL;
    gf = rGf;
    ga = rGa;
  } else {
    // Full 34-matchday schedule generation
    const outcomesPool: ('W' | 'D' | 'L')[] = [
      ...Array(totalWins).fill('W'),
      ...Array(totalDraws).fill('D'),
      ...Array(totalLosses).fill('L'),
    ];
    for (let i = outcomesPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [outcomesPool[i], outcomesPool[j]] = [outcomesPool[j], outcomesPool[i]];
    }

    const allScores = buildExactFootballScorelines(outcomesPool, gf, ga);

    let rPts = 0;
    let rW = 0;
    let rD = 0;
    let rL = 0;
    let rGf = 0;
    let rGa = 0;

    schedule = outcomesPool.map((res, idx) => {
      const md = idx + 1;
      const opp = divisionOpponents[idx % divisionOpponents.length] || divisionOpponents[0];
      const sc = allScores[idx] || { userGoals: 1, oppGoals: 1 };
      const ptsEarned: 3 | 1 | 0 = res === 'W' ? 3 : res === 'D' ? 1 : 0;
      rPts += ptsEarned;
      if (res === 'W') rW++;
      else if (res === 'D') rD++;
      else rL++;
      rGf += sc.userGoals;
      rGa += sc.oppGoals;
      const runningGd = rGf - rGa;
      const expectedPtsAtMd = (targetPts / 34) * md;
      const ptsDelta = rPts - expectedPtsAtMd;
      const runningPos =
        md === 34
          ? approxPos
          : Math.max(1, Math.min(18, Math.round(approxPos - ptsDelta * 0.45)));

      return {
        matchday: md,
        opponentId: opp.id,
        opponentName: opp.name,
        opponentLogo: isModActive ? opp.logo : undefined,
        opponentFallbackLogo: opp.fallbackLogo,
        opponentColor: opp.color || '38bdf8',
        opponentOvr: opp.baseOvr || league.avgOvr,
        isHome: md % 2 === 1,
        userGoals: sc.userGoals,
        oppGoals: sc.oppGoals,
        result: res,
        ptsEarned,
        runningPts: rPts,
        runningPoints: rPts,
        runningWins: rW,
        runningW: rW,
        runningDraws: rD,
        runningD: rD,
        runningLosses: rL,
        runningL: rL,
        runningGf: rGf,
        runningGa: rGa,
        runningGd,
        runningPos,
        runningPosition: runningPos,
        isUpsetWin: res === 'W' && (opp.baseOvr || league.avgOvr) > currentOvr + 1,
      };
    });
    gf = rGf;
    ga = rGa;
  }

  const finalPts = totalWins * 3 + totalDraws;
  const finalGd = gf - ga;
  // Re-harmonize approxPos with finalPts if 2nd half recalculated
  if (lockedFirstHalf) {
    if (finalPts >= 76) approxPos = 1;
    else if (finalPts >= 68) approxPos = 2;
    else if (finalPts >= 61) approxPos = 3;
    else if (finalPts >= 55) approxPos = 4;
    else if (finalPts >= 51) approxPos = 5;
    else if (finalPts >= 48) approxPos = 6;
    else if (finalPts >= 45) approxPos = 7;
    else if (finalPts >= 42) approxPos = 8;
    else if (finalPts >= 40) approxPos = 9;
    else if (finalPts >= 38) approxPos = 10;
    else if (finalPts >= 35) approxPos = 11;
    else if (finalPts >= 33) approxPos = 12;
    else if (finalPts >= 31) approxPos = 13;
    else if (finalPts >= 28) approxPos = 14;
    else if (finalPts >= 26) approxPos = 15;
    else if (finalPts >= 23) approxPos = 16;
    else if (finalPts >= 19) approxPos = 17;
    else approxPos = 18;
    if (schedule.length > 0) {
      schedule[schedule.length - 1].runningPos = approxPos;
      schedule[schedule.length - 1].runningPosition = approxPos;
    }
  }

  const firstHalfSlice = schedule.slice(0, 17);

  return {
    year,
    tier: seasonLeague,
    country: clubCountry,
    totalMatchdays: 34,
    dilemmaMatchday: 17,
    dilemmaChoice: options?.dilemmaChoice,
    approxPos,
    pos: approxPos,
    wins: totalWins,
    draws: totalDraws,
    losses: totalLosses,
    pts: finalPts,
    gf,
    ga,
    gd: finalGd,
    effectiveOvr: Math.round(effectiveOvrForSim),
    leagueAvgOvr: league.avgOvr,
    schedule,
    matchdaySchedule: schedule,
    _meta: {
      firstHalfOutcomes: firstHalfSlice,
      firstHalfWins: firstHalfSlice.filter((m) => m.result === 'W').length,
      firstHalfDraws: firstHalfSlice.filter((m) => m.result === 'D').length,
      firstHalfLosses: firstHalfSlice.filter((m) => m.result === 'L').length,
      firstHalfPts: firstHalfSlice[16]?.runningPts || 0,
      firstHalfGf: firstHalfSlice[16]?.runningGf || 0,
      firstHalfGa: firstHalfSlice[16]?.runningGa || 0,
      ovrAtCalculation: currentOvr,
      moraleAtCalculation: currentMorale,
      tacticAtCalculation: currentTactic,
    },
  };
}
