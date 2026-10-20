import { GameState, YouthProspect } from '../types';
import { rand, getLeagueScaledVal } from '../data/gameConstants';

export interface GraduationOutcome {
  action: 'promote' | 'loan' | 'compensation';
  prospect: YouthProspect;
  cashRewardK?: number;
  ovrGain?: number;
  ovrCost?: number;
  messageEn: string;
  messageDe: string;
}

/**
 * Returns autonomous incubator capacity based on facility level.
 * Level 1: 6 slots, Level 2: 8 slots, Level 3: 10 slots, Level 4: 11 slots, Level 5: 12 slots.
 */
export function getIncubatorCapacity(academyLevel = 1): number {
  const lvl = Math.max(1, Math.min(5, Math.round(academyLevel || 1)));
  return [0, 6, 8, 10, 11, 12][lvl] || 6;
}

/**
 * Calculates training compensation / transfer fee when an academy graduate signs elsewhere or is sold.
 * Clubs in export powerhouses (Argentina, Brazil, Colombia, Ecuador, Uruguay) command high-value
 * overseas export fees from European giants for generational and top prospect talents ($15M-$35M+).
 */
export function calculateTrainingCompensationK(prospect: YouthProspect, tier = 1, country = 'GER'): number {
  const boost = prospect.boost || 1;
  const isGenerational = prospect.type === 'generational';
  const isTop = prospect.type === 'top_prospect';

  let baseK = tier === 1 ? 1500 : tier === 2 ? 800 : tier === 3 ? 350 : Math.max(1, Math.round(getLeagueScaledVal(tier, 1500, country)));
  const isExportPowerhouse = ['ARG', 'BRA', 'COL', 'URU', 'ECU'].includes(country);

  if (isGenerational) baseK *= (isExportPowerhouse ? 25.0 : 4.0);
  else if (isTop) baseK *= (isExportPowerhouse ? 8.0 : 2.5);

  return Math.round(baseK * (1 + boost * 0.25));
}

/**
 * Generates a new youth prospect for the incubator, influenced by academy level, scouting dial, and coach.
 */
export function generateIncubatorProspect(
  academyLevel = 1,
  scoutingDialPct = 0,
  coachStrength?: string,
  hasFeederClub = false
): YouthProspect {
  const id = `inc_${Date.now()}_${rand(100, 999)}`;
  const positions: ('GK' | 'DEF' | 'MID' | 'FWD')[] = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD'];
  const position = positions[Math.floor(Math.random() * positions.length)];
  const age = Math.floor(Math.random() * 3) + 15; // 15-17

  // Quality roll influenced by academy level + scouting dial (0-50%) + youth coach
  const dialBonus = scoutingDialPct * 0.4;
  const hasYouthCoach = coachStrength === 'Youth Whisperer' || coachStrength === 'Youth Focus' || coachStrength === 'Scout' || coachStrength === 'Youth Developer' || coachStrength === 'Continental Legend';
  const coachBonus = hasYouthCoach ? 15 : 0;
  const roll = rand(1, 100) + (academyLevel * 6) + dialBonus + coachBonus;

  let type: 'generational' | 'top_prospect' | 'local_talent' = 'local_talent';
  let boost = rand(1, 2);
  let timer = Math.max(1, 18 - age); // 1 to 3 seasons

  if (roll >= 92) {
    type = 'generational';
    boost = rand(4, 5);
  } else if (roll >= 65) {
    type = 'top_prospect';
    boost = rand(2, 3);
  }

  // Tier 5 Feeder Club prestige upgrade permanently boosts youth prospect development
  if (hasFeederClub) {
    boost += 1;
  }

  const firstNames = ['Lukas', 'Matteo', 'Noah', 'Leo', 'Finn', 'Elias', 'Jonas', 'Leon', 'Milan', 'Arthur', 'Oliver', 'Liam'];
  const lastNames = ['Weber', 'Schneider', 'Fischer', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein'];
  const name = `${firstNames[rand(0, firstNames.length - 1)]} ${lastNames[rand(0, lastNames.length - 1)]}`;

  return {
    id,
    name,
    timer,
    boost,
    type,
    position,
    age,
    status: timer <= 1 ? 'ready' : 'incubating',
    marketValK: boost * 750,
    ...(hasFeederClub ? { feederBonusApplied: true } : {})
  } as YouthProspect;
}

/**
 * Handles promotion of an incubator prospect directly to the First Team.
 * Candidates that are graduation ready receive their full development boost with 0 penalty.
 * Pulling candidates early (still incubating / timer > 0) results in a -1 OVR tactical integration penalty.
 */
export function promoteProspectToSenior(
  prospect: YouthProspect,
  currentSquadOvr: number,
  academyLevel: number = 1,
  hasFeederClub: boolean = false
): { newOvr: number; netGain: number; integrationCost: number } {
  const baseBoost = prospect.boost || 1;
  const isReady = (prospect.status === 'ready' || (typeof prospect.timer === 'number' && prospect.timer <= 0)) && prospect.status !== 'loaned';
  const nlzBonus = isReady && academyLevel >= 3 ? 1 : 0;
  const feederBonus = hasFeederClub && !(prospect as any).feederBonusApplied ? 1 : 0;
  const boost = baseBoost + nlzBonus + feederBonus;

  // Ready graduates receive full development with zero tactical integration penalty.
  // Pulling candidates early results in a -1 OVR integration penalty.
  const integrationCost = isReady ? 0 : 1;
  const netGain = isReady ? boost : Math.max(1, boost - integrationCost);
  const newOvr = Math.min(100, currentSquadOvr + netGain);

  return {
    newOvr,
    netGain,
    integrationCost
  };
}

/**
 * Advances all prospects in the incubator by 1 season.
 */
export function advanceIncubatorSeason(
  pipeline: YouthProspect[],
  coachStrength?: string
): { updatedPipeline: YouthProspect[]; readyProspects: YouthProspect[]; departedProspects: YouthProspect[] } {
  const hasYouthCoach = coachStrength === 'Youth Whisperer' || coachStrength === 'Youth Focus' || coachStrength === 'Scout' || coachStrength === 'Youth Developer' || coachStrength === 'Continental Legend';
  const readyProspects: YouthProspect[] = [];
  const departedProspects: YouthProspect[] = [];

  const updatedPipeline: YouthProspect[] = [];

  for (const p of (pipeline || [])) {
    const nextAge = (p.age || 16) + 1;
    let nextTimer = p.timer - 1;
    if (hasYouthCoach && Math.random() < 0.25) {
      nextTimer = Math.max(0, nextTimer - 1);
    }

    if (p.status === 'loaned') {
      const updatedLoanee: YouthProspect = {
        ...p,
        age: nextAge,
        timer: 0,
        boost: p.boost + 1,
        status: 'ready' as const,
      };

      // If returning from loan at age >= 21, auto-resolve departure
      if (nextAge >= 21) {
        departedProspects.push(updatedLoanee);
      } else {
        readyProspects.push(updatedLoanee);
        updatedPipeline.push(updatedLoanee);
      }
      continue;
    }

    const isReady = nextTimer <= 0 || nextAge >= 18;

    // Age out if >= 21 without senior promotion
    if (nextAge >= 21) {
      departedProspects.push({
        ...p,
        age: nextAge,
        timer: 0,
        status: 'ready' as const
      });
      continue;
    }

    const updated: YouthProspect = {
      ...p,
      age: nextAge,
      timer: Math.max(0, nextTimer),
      status: isReady ? 'ready' : 'incubating'
    };

    if (isReady) {
      readyProspects.push(updated);
    }
    updatedPipeline.push(updated);
  }

  return {
    updatedPipeline,
    readyProspects,
    departedProspects
  };
}

export interface SeniorIntegrationContext {
  coachStrength?: string;
  coachWeakness?: string;
  coachArchetype?: string;
  hasTalentscout?: boolean;
  clubTier?: number;
  clubCountry?: string;
}

/**
 * Calculates how likely an academy talent is to "click" and translate their youth ratings
 * into actual First-Team OVR impact when promoted to the Senior Squad.
 * Keeps top-class youth players in the academy as is, while modeling real-world transition difficulty
 * (especially when breaking into an elite 88-95+ OVR L5 Academy / L5 Medical dynasty squad).
 */
export function getSeniorIntegrationOdds(
  prospect: YouthProspect,
  currentSquadOvr: number,
  ctx: SeniorIntegrationContext = {}
): { clickChance: number; partialChance: number; mismatchChance: number } {
  // Base click chance scales with how demanding and world-class the existing Senior XI already is
  let clickChance = 0.72;
  let partialChance = 0.20;

  if (currentSquadOvr >= 93) {
    clickChance = 0.20;
    partialChance = 0.34;
  } else if (currentSquadOvr >= 89) {
    clickChance = 0.28;
    partialChance = 0.35;
  } else if (currentSquadOvr >= 84) {
    clickChance = 0.40;
    partialChance = 0.34;
  } else if (currentSquadOvr >= 78) {
    clickChance = 0.55;
    partialChance = 0.28;
  }

  // Senior Farm Loan Experience: proving themselves in senior football on loan significantly boosts first-team readiness (+14% per loan)
  const loans = Math.min(2, Math.max(0, prospect.loansServed || 0));
  clickChance += loans * 0.14;

  // Coach & Director Youth Integration Modifiers
  if (
    ctx.coachStrength === 'Youth Whisperer' ||
    ctx.coachStrength === 'Youth Focus' ||
    ctx.coachArchetype === 'youth_visionary'
  ) {
    clickChance += 0.12;
  } else if (
    ctx.coachWeakness === 'Youth Apathy' ||
    ctx.coachArchetype === 'iron_disciplinarian' ||
    ctx.coachArchetype === 'pragmatic_grinder'
  ) {
    clickChance -= 0.14;
  }

  if (ctx.hasTalentscout) {
    clickChance += 0.06;
  }

  // Pulling an unready teenager early from the academy into the senior cauldron carries a chemistry risk
  const isEarly = prospect.status === 'incubating' && prospect.timer > 0;
  if (isEarly) {
    clickChance -= 0.15;
  }

  clickChance = Math.max(0.10, Math.min(0.92, clickChance));
  partialChance = Math.max(0.05, Math.min(1 - clickChance - 0.03, partialChance));
  const mismatchChance = Math.max(0.03, Number((1 - clickChance - partialChance).toFixed(2)));

  return {
    clickChance: Number(clickChance.toFixed(2)),
    partialChance: Number(partialChance.toFixed(2)),
    mismatchChance
  };
}

export function evaluateSeniorSquadIntegration(
  prospect: YouthProspect,
  currentSquadOvr: number,
  projectedGain: number,
  ctx: SeniorIntegrationContext = {},
  rollValue: number = Math.random()
): {
  outcome: 'clicked' | 'partial' | 'mismatch';
  actualGain: number;
  projectedGain: number;
  moraleDelta: number;
  sellOnFeeK: number;
  clickChancePct: number;
} {
  const odds = getSeniorIntegrationOdds(prospect, currentSquadOvr, ctx);
  const clickChancePct = Math.round(odds.clickChance * 100);

  if (rollValue < odds.clickChance) {
    return {
      outcome: 'clicked',
      actualGain: projectedGain,
      projectedGain,
      moraleDelta: 2,
      sellOnFeeK: 0,
      clickChancePct
    };
  }

  if (rollValue < odds.clickChance + odds.partialChance) {
    const partialGain = currentSquadOvr >= 88
      ? Math.max(0, Math.floor(projectedGain * 0.45))
      : Math.max(1, Math.floor(projectedGain * 0.55));
    return {
      outcome: 'partial',
      actualGain: Math.min(projectedGain, partialGain),
      projectedGain,
      moraleDelta: 0,
      sellOnFeeK: 0,
      clickChancePct
    };
  }

  // Failed to click in the senior tactical system — moved on with sell-on / training compensation
  const baseComp = calculateTrainingCompensationK(prospect, ctx.clubTier || 1, ctx.clubCountry || 'GER');
  const sellOnFeeK = Math.round(baseComp * 0.75);
  return {
    outcome: 'mismatch',
    actualGain: 0,
    projectedGain,
    moraleDelta: currentSquadOvr >= 88 ? -2 : 0,
    sellOnFeeK,
    clickChancePct
  };
}

