import { Club, BoardVision, BoardObjective, TrophiesObj } from '../types';
import { getLeagueScaledVal, formatMoney, getStartingBudget, isReserveClub } from '../data/gameConstants';

export const generateBoardVision = (
  club: Club,
  currentYear: number,
  previousVision?: BoardVision
): BoardVision => {
  const isSuperClub = club.tier === 1 && (club.baseOvr >= 84 || club.name.includes('Bayern') || club.name.includes('Madrid') || club.name.includes('Manchester City') || club.name.includes('Paris') || club.name.includes('Liverpool') || club.name.includes('Barcelona') || club.name.includes('Arsenal') || club.name.includes('Inter') || club.name.includes('Juventus'));
  const isLowerTier = club.tier >= 2;
  const isMidTier1 = club.tier === 1 && club.baseOvr >= 75 && !isSuperClub;
  const effectiveBudgetK = club.currentBudget ?? getStartingBudget(club.tier || 1, club.country || 'GER');
  const isSmallClub = club.tier >= 3 || effectiveBudgetK < 2500 || ((club.fanBase != null && club.fanBase > 0) && club.fanBase < 25000);
  const isGrassroots = club.tier >= 5 || effectiveBudgetK < 800;
  const currentAcademyLvl = club.academyLevel || 1;

  // Multi-Year Planning Cycle: 2-Year (Sprint/Urgent), 3-Year (Standard), or 5-Year (Dynasty/Long-Term)
  // Goals rotate between 2, 3, and 5-year plans dynamically across cycles.
  let durationYears: 2 | 3 | 5 = 3;
  const durations: (2 | 3 | 5)[] = [2, 3, 5];
  if (previousVision) {
    // If a previous vision existed, intentionally pick a different cycle length so plans genuinely evolve
    const remainingDurations = durations.filter(d => d !== previousVision.durationYears);
    durationYears = remainingDurations[Math.floor(Math.random() * remainingDurations.length)] || 3;
  } else {
    const durRoll = Math.random();
    if (durRoll < 0.30) {
      durationYears = 2;
    } else if (durRoll < 0.65) {
      durationYears = 5;
    } else {
      durationYears = 3;
    }
  }

  const isReserve = isReserveClub(club.name) || Boolean(club.isReserve);

  // Determine potential vision types based on club context and avoid repeating previousVision type
  let candidates: BoardVision['type'][] = [];
  if (isReserve) {
    // Reserve teams can never climb to Tier 1 and strictly focus on developing youth players
    candidates = ['youth_factory'];
  } else if (isSuperClub) {
    candidates = ['superclub_dominance', 'continental_ascendance'];
  } else if (isLowerTier) {
    if (club.isInsolventGiant || (club.fanBase && club.fanBase > 30000)) {
      candidates = ['fast_rise', 'financial_restructure', 'sustainable_stability'];
    } else {
      candidates = ['fast_rise', 'financial_restructure', 'sustainable_stability'];
      // Only include youth factory if not at extreme risk of cost explosion
      if (!isGrassroots && currentAcademyLvl <= 3) {
        candidates.push('youth_factory');
      }
    }
  } else if (isMidTier1) {
    candidates = ['continental_ascendance', 'sustainable_stability', 'financial_restructure', 'youth_factory'];
  } else {
    // Smaller tier 1 club
    candidates = ['sustainable_stability', 'financial_restructure'];
    if (!isSmallClub) {
      candidates.push('youth_factory');
    }
  }

  // Transitional Rebuild specifically for Tier 1 and Tier 2 clubs that are not SuperClubs or Reserve teams
  if (!isReserve && !isSuperClub && (club.tier === 1 || club.tier === 2)) {
    candidates.push('transitional_rebuild');
  }

  // Prevent immediate repetition of the previous vision to ensure goals rotate
  if (previousVision && candidates.length > 1) {
    const filtered = candidates.filter(t => t !== previousVision.type);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  const visionType = candidates[Math.floor(Math.random() * candidates.length)] || 'sustainable_stability';
  const id = `vision_${club.id}_${currentYear}_${Date.now()}`;

  let title = '';
  let description = '';
  let objectives: BoardObjective[] = [];
  const defaultBaseBonus = 15000;
  const defaultBonus = getLeagueScaledVal(club.tier || 1, defaultBaseBonus, club.country || 'GER');
  const defaultSkillPoints = durationYears === 5 ? 25 : durationYears === 2 ? 10 : 15;
  let reward = {
    budgetBonus: defaultBonus,
    trustBonus: 25,
    immunityBonus: 1,
    skillPointsBonus: defaultSkillPoints,
    desc: `${formatMoney(defaultBonus)} Board Bonus + 1 Immunity Shield + ${defaultSkillPoints} Director Points`
  };
  let penalty = { ultimatum: false, trustPenalty: 25, desc: '' };

  switch (visionType) {
    case 'superclub_dominance': {
      const isUltraElite = club.baseOvr >= 86;
      const targetTitles = durationYears === 2 ? 1 : durationYears === 5 ? 3 : 2;
      const targetFinals = durationYears === 5 ? 2 : 1;
      const targetOvr = Math.min(95, Math.max(86, club.baseOvr));

      title = durationYears === 2 
        ? '2-Year Win-Now Mandate' 
        : durationYears === 5 
        ? '5-Year Dynasty Architecture' 
        : 'Total Silverware Dominance';

      description = durationYears === 2
        ? 'Immediate trophies demanded within 2 seasons. With a world-class squad, transitional rebuilding excuses will not be tolerated.'
        : durationYears === 5
        ? 'Construct an indelible multi-trophy dynasty over 5 seasons to cement our place among the greatest sides in world football history.'
        : 'As a global powerhouse, our board and fanbase demand unmatched supremacy across both domestic and continental fronts. Finishing without trophies is unacceptable.';

      objectives = [
        {
          id: 'obj_titles',
          desc: `Win at least ${targetTitles} League Title${targetTitles > 1 ? 's' : ''} in ${durationYears} seasons`,
          targetValue: targetTitles,
          currentValue: 0,
          unit: 'Titles',
          type: 'league_titles'
        },
        {
          id: 'obj_continental',
          desc: isUltraElite && durationYears !== 2 
            ? `Reach at least ${targetFinals} Continental Champions Cup Final${targetFinals > 1 ? 's' : ''}` 
            : `Reach at least ${targetFinals} Continental or Domestic Cup Final${targetFinals > 1 ? 's' : ''}`,
          targetValue: targetFinals,
          currentValue: 0,
          unit: 'Finals',
          type: 'continental_final'
        },
        {
          id: 'obj_squad_ovr',
          desc: `Maintain an elite squad standard (at least ${targetOvr} OVR)`,
          targetValue: targetOvr,
          currentValue: club.baseOvr,
          unit: 'OVR',
          type: 'maintain_ovr'
        }
      ];

      const baseBonus = durationYears === 2 ? 30000 : durationYears === 5 ? 75000 : 45000;
      const bBonus = getLeagueScaledVal(club.tier || 1, baseBonus, club.country || 'GER');
      const tBonus = durationYears === 2 ? 25 : durationYears === 5 ? 50 : 35;
      const sBonus = durationYears === 5 ? 3 : 2;
      const skBonus = durationYears === 5 ? 30 : durationYears === 2 ? 15 : 20;
      reward = {
        budgetBonus: bBonus,
        trustBonus: tBonus,
        immunityBonus: sBonus,
        skillPointsBonus: skBonus,
        desc: `${formatMoney(bBonus)} Winner Dividend + ${sBonus} Immunity Shield${sBonus > 1 ? 's' : ''} + ${skBonus} Director Points`
      };
      penalty = {
        ultimatum: true,
        trustPenalty: durationYears === 2 ? 35 : 40,
        desc: 'Immediate Board Ultimatum & Severe Sacking Risk'
      };
      break;
    }

    case 'fast_rise': {
      const isSubTier = club.tier >= 3;
      // Reserve teams can never climb to Tier 1: max allowed target tier is Tier 2 (promotions <= club.tier - 2)
      const maxPromotions = isReserve ? Math.max(0, club.tier - 2) : club.tier - 1;
      const targetPromotions = Math.min(maxPromotions, durationYears === 2 ? 1 : durationYears === 5 ? (club.tier >= 4 ? 3 : 2) : (isSubTier ? 2 : 1));
      const targetFanGrowth = durationYears === 2 ? 15 : durationYears === 5 ? 40 : 20;

      title = durationYears === 2
        ? 'The 2-Year Promotion Sprint'
        : durationYears === 5
        ? '5-Year Pyramid Ascent'
        : isSubTier ? 'The Fast Rise (Back-to-Back)' : 'The Fast Rise';

      description = durationYears === 2
        ? 'Immediate promotion required in the next 2 seasons. The board is backing you for a swift climb.'
        : durationYears === 5
        ? 'Execute a comprehensive 5-year journey climbing through the divisions and creating an unstoppable local fanbase.'
        : isSubTier
        ? 'Secure back-to-back promotions within 3 years to propel this club through the divisions.'
        : 'This club belongs in the elite top flight. The board demands immediate promotion and fan growth.';

      objectives = [
        {
          id: 'obj_promotion',
          desc: targetPromotions > 1
            ? `Secure ${targetPromotions} promotions across ${durationYears} seasons`
            : `Secure promotion to the higher tier within ${durationYears} seasons`,
          targetValue: targetPromotions,
          currentValue: 0,
          unit: 'Promotions',
          type: 'promotion'
        },
        {
          id: 'obj_fan_growth',
          desc: `Expand Club Fanbase by ${targetFanGrowth}%`,
          targetValue: targetFanGrowth,
          currentValue: 0,
          unit: '% Growth',
          type: 'fanbase_growth'
        }
      ];

      if (durationYears === 5) {
        objectives.push({
          id: 'obj_avoid_rel',
          desc: 'Safeguard division safety: Never suffer relegation over the 5 years',
          targetValue: 5,
          currentValue: 0,
          unit: 'Safe Years',
          type: 'avoid_relegation'
        });
      }

      const baseBonus = durationYears === 2 ? 12000 : durationYears === 5 ? 30000 : 18000;
      const bBonus = getLeagueScaledVal(club.tier || 1, baseBonus, club.country || 'GER');
      const tBonus = durationYears === 2 ? 25 : durationYears === 5 ? 45 : 30;
      const sBonus = durationYears === 2 ? 1 : 2;
      const skBonus = durationYears === 5 ? 25 : durationYears === 2 ? 12 : 18;
      reward = {
        budgetBonus: bBonus,
        trustBonus: tBonus,
        immunityBonus: sBonus,
        skillPointsBonus: skBonus,
        desc: `${formatMoney(bBonus)} Promotion Warchest + ${sBonus} Immunity Shield${sBonus > 1 ? 's' : ''} + ${skBonus} Director Points`
      };
      penalty = {
        ultimatum: true,
        trustPenalty: 30,
        desc: 'Board Warning & Strict Re-evaluation'
      };
      break;
    }

    case 'financial_restructure': {
      // Guardrail: Small clubs cannot have aggressive facility targets that cause cost base explosion.
      // In 2 years: max 1 upgrade for small clubs, max 2 for normal clubs.
      // In 3 years: max 1 upgrade for small clubs, max 2 for normal clubs.
      // In 5 years: max 2 upgrades for small clubs, max 3 for normal clubs.
      const targetFacUpgrades = isSmallClub
        ? (durationYears === 5 ? 2 : 1)
        : (durationYears === 5 ? 3 : 2);

      title = durationYears === 2
        ? '2-Year Emergency Fiscal Recovery'
        : durationYears === 5
        ? '5-Year Structural Modernization'
        : 'Financial Restructure & Infrastructure';

      description = durationYears === 2
        ? 'Clean up the balance sheet urgently: survive in the league without incurring any debt and execute essential facility upkeep.'
        : durationYears === 5
        ? 'Transform our long-term financial health over 5 years: maintain debt-free balance sheets and modernize infrastructure.'
        : 'Clean up the balance sheet, eliminate insolvency risk, and invest in club facilities while protecting our status on the pitch.';

      objectives = [
        {
          id: 'obj_zero_debt',
          desc: `Complete all ${durationYears} seasons without entering financial debt`,
          targetValue: durationYears,
          currentValue: 0,
          unit: 'Seasons Safe',
          type: 'zero_debt'
        },
        {
          id: 'obj_upgrade_facs',
          desc: `Complete at least ${targetFacUpgrades} facility upgrade${targetFacUpgrades > 1 ? 's' : ''} (Stadium, Medical, or Academy)`,
          targetValue: targetFacUpgrades,
          currentValue: ((club.academyLevel || 1) >= 5 && (club.medicalLevel || 1) >= 5) ? targetFacUpgrades : 0,
          unit: 'Upgrades',
          type: 'upgrade_facilities'
        },
        {
          id: 'obj_avoid_rel',
          desc: `Safeguard league status (Avoid Relegation in all ${durationYears} years)`,
          targetValue: durationYears,
          currentValue: 0,
          unit: 'Safe Years',
          type: 'avoid_relegation'
        }
      ];

      const baseBonus = durationYears === 2 ? 10000 : durationYears === 5 ? 25000 : 15000;
      const bBonus = getLeagueScaledVal(club.tier || 1, baseBonus, club.country || 'GER');
      const tBonus = durationYears === 2 ? 20 : durationYears === 5 ? 40 : 25;
      const skBonus = durationYears === 5 ? 20 : durationYears === 2 ? 10 : 15;
      reward = {
        budgetBonus: bBonus,
        trustBonus: tBonus,
        immunityBonus: 1,
        skillPointsBonus: skBonus,
        desc: `${formatMoney(bBonus)} Fiscal Prudence Dividend + 1 Immunity Shield + ${skBonus} Director Points`
      };
      penalty = {
        ultimatum: false,
        trustPenalty: 25,
        desc: 'Budget Slashing & Board Friction'
      };
      break;
    }

    case 'youth_factory': {
      const targetGraduates = durationYears === 2 ? 2 : durationYears === 5 ? 5 : 3;
      const baseProfit = isSmallClub
        ? (durationYears === 2 ? 3000 : durationYears === 5 ? 12000 : 6000)
        : (durationYears === 2 ? 15000 : durationYears === 5 ? 45000 : 25000);
      const targetProfitK = getLeagueScaledVal(club.tier || 1, baseProfit, club.country || 'GER');

      title = durationYears === 2
        ? '2-Year Academy Acceleration'
        : durationYears === 5
        ? '5-Year Generational Academy Project'
        : 'The Youth Factory';

      description = durationYears === 2
        ? 'Fast-track academy graduates to the first team and balance the books with talent sales over 2 seasons.'
        : durationYears === 5
        ? 'Build a generational talent powerhouse across 5 years, developing elite homegrown stars while creating massive transfer profits.'
        : 'Build a self-sustaining talent powerhouse: graduate young players and secure transfer profits while preserving financial sanity.';

      objectives = [
        {
          id: 'obj_graduate_youth',
          desc: `Graduate ${targetGraduates} Academy Players to the First Team`,
          targetValue: targetGraduates,
          currentValue: 0,
          unit: 'Players',
          type: 'graduate_youth'
        },
        {
          id: 'obj_transfer_profit',
          desc: `Reach ${formatMoney(targetProfitK)} in cumulative transfer profit over ${durationYears} seasons`,
          targetValue: targetProfitK,
          currentValue: 0,
          unit: '€',
          type: 'transfer_profit'
        }
      ];

      // Strict Academy Upkeep Guardrail:
      // Small clubs CANNOT afford high academy upgrades without their cost base exploding exponentially!
      // In a 2-year plan, one cannot have 3 upgrades (max allowed is strictly 2 for established clubs, 0 for small clubs).
      if (isSmallClub) {
        if (currentAcademyLvl <= 1 && durationYears >= 3 && !isGrassroots) {
          // Exactly 1 modest upgrade to Level 2 over 3 or 5 years
          objectives.push({
            id: 'obj_academy_lvl',
            desc: 'Elevate training standards: Upgrade Youth Academy to Level 2',
            targetValue: 2,
            currentValue: currentAcademyLvl,
            unit: 'Level',
            type: 'upgrade_facilities'
          });
        } else {
          // Small club / grassroots: do NOT mandate academy facility upgrades to protect budget from fixed upkeep!
          objectives.push({
            id: 'obj_zero_debt',
            desc: `Maintain fiscal prudence: Complete all ${durationYears} seasons debt-free while funding youth`,
            targetValue: durationYears,
            currentValue: 0,
            unit: 'Seasons Safe',
            type: 'zero_debt'
          });
        }
      } else {
        // Established club: Upgrades strictly bounded so targetValue - currentAcademyLvl <= 2 in a 2-year plan (never 3!).
        // In 2 years: strictly max 2 upgrades. In 3 years: max 2 upgrades. In 5 years: max 3 upgrades.
        const maxUpgradesAllowed = durationYears === 2 
          ? Math.min(2, Math.max(1, 3 - currentAcademyLvl)) 
          : durationYears === 5 
          ? Math.min(3, Math.max(1, 4 - currentAcademyLvl)) 
          : Math.min(2, Math.max(1, 3 - currentAcademyLvl));
        const targetAcademyLvl = Math.min(5, currentAcademyLvl + maxUpgradesAllowed);

        objectives.push({
          id: 'obj_academy_lvl',
          desc: `Upgrade Youth Academy facility to Level ${targetAcademyLvl} or higher`,
          targetValue: targetAcademyLvl,
          currentValue: currentAcademyLvl,
          unit: 'Level',
          type: 'upgrade_facilities'
        });
      }

      const baseBonus = durationYears === 2 ? 15000 : durationYears === 5 ? 40000 : 25000;
      const bBonus = getLeagueScaledVal(club.tier || 1, baseBonus, club.country || 'GER');
      const tBonus = durationYears === 2 ? 20 : durationYears === 5 ? 45 : 30;
      const skBonus = durationYears === 5 ? 25 : durationYears === 2 ? 12 : 18;
      reward = {
        budgetBonus: bBonus,
        trustBonus: tBonus,
        immunityBonus: 1,
        skillPointsBonus: skBonus,
        desc: `${formatMoney(bBonus)} Talent Grant + 1 Immunity Shield + ${skBonus} Director Points`
      };
      penalty = {
        ultimatum: false,
        trustPenalty: 25,
        desc: 'Lost Board Confidence (-25 Trust) & Transfer Budget Freeze'
      };
      break;
    }

    case 'continental_ascendance': {
      const targetCampaigns = durationYears === 2 ? 1 : durationYears === 5 ? 3 : 2;

      title = durationYears === 2
        ? '2-Year European Sprint'
        : durationYears === 5
        ? '5-Year Continental Ascent'
        : 'Continental Breakthrough';

      description = durationYears === 2
        ? 'Fast-track this club into continental football within 2 seasons and compete in cup competitions.'
        : durationYears === 5
        ? 'Establish this club as a permanent continental powerhouse across a 5-year European campaign.'
        : 'Take the club into regular continental contention. We want European / international nights under the floodlights.';

      objectives = [
        {
          id: 'obj_cont_quali',
          desc: `Qualify for Continental Football in at least ${targetCampaigns} season${targetCampaigns > 1 ? 's' : ''}`,
          targetValue: targetCampaigns,
          currentValue: 0,
          unit: 'Campaigns',
          type: 'continental_qualification'
        },
        {
          id: 'obj_cup_final',
          desc: 'Reach at least 1 Domestic Cup or Continental Final',
          targetValue: 1,
          currentValue: 0,
          unit: 'Finals',
          type: 'continental_final'
        }
      ];

      if (durationYears === 5) {
        objectives.push({
          id: 'obj_fan_growth',
          desc: 'Expand Club Fanbase by 25% with continental prestige',
          targetValue: 25,
          currentValue: 0,
          unit: '% Growth',
          type: 'fanbase_growth'
        });
      }

      const baseBonus = durationYears === 2 ? 18000 : durationYears === 5 ? 45000 : 25000;
      const bBonus = getLeagueScaledVal(club.tier || 1, baseBonus, club.country || 'GER');
      const tBonus = durationYears === 2 ? 25 : durationYears === 5 ? 45 : 30;
      const skBonus = durationYears === 5 ? 25 : durationYears === 2 ? 15 : 20;
      reward = {
        budgetBonus: bBonus,
        trustBonus: tBonus,
        immunityBonus: 1,
        skillPointsBonus: skBonus,
        desc: `${formatMoney(bBonus)} Continental Prize Grant + 1 Immunity Shield + ${skBonus} Director Points`
      };
      penalty = {
        ultimatum: false,
        trustPenalty: 20,
        desc: 'Missed Opportunity Penalty (-20 Trust)'
      };
      break;
    }

    case 'sustainable_stability':
    default: {
      const ovrBoost = durationYears === 2 ? 1 : durationYears === 5 ? 4 : 2;
      const targetOvr = Math.min(95, club.baseOvr + ovrBoost);

      title = durationYears === 2
        ? '2-Year Division Survival & Focus'
        : durationYears === 5
        ? '5-Year Club Solidification'
        : 'Top-Flight Foundation & Survival';

      description = durationYears === 2
        ? 'Ensure short-term stability: safeguard division survival for the next 2 seasons without overspending.'
        : durationYears === 5
        ? 'Cement the club as an untouchable top-division institution over 5 seasons through organic squad development.'
        : 'Establish the club firmly in the division. Cement our survival, elevate player quality, and avoid financial overextension.';

      objectives = [
        {
          id: 'obj_avoid_rel',
          desc: `Avoid Relegation in all ${durationYears} seasons`,
          targetValue: durationYears,
          currentValue: 0,
          unit: 'Safe Years',
          type: 'avoid_relegation'
        },
        {
          id: 'obj_maintain_ovr',
          desc: `Build squad strength to at least ${targetOvr} OVR`,
          targetValue: targetOvr,
          currentValue: club.baseOvr,
          unit: 'OVR',
          type: 'maintain_ovr'
        }
      ];

      if (durationYears === 5) {
        objectives.push({
          id: 'obj_zero_debt',
          desc: 'Complete all 5 seasons without entering financial debt',
          targetValue: 5,
          currentValue: 0,
          unit: 'Seasons Safe',
          type: 'zero_debt'
        });
      }

      const baseBonus = durationYears === 2 ? 8000 : durationYears === 5 ? 20000 : 12000;
      const bBonus = getLeagueScaledVal(club.tier || 1, baseBonus, club.country || 'GER');
      const tBonus = durationYears === 2 ? 15 : durationYears === 5 ? 35 : 20;
      const skBonus = durationYears === 5 ? 20 : durationYears === 2 ? 10 : 15;
      reward = {
        budgetBonus: bBonus,
        trustBonus: tBonus,
        immunityBonus: 1,
        skillPointsBonus: skBonus,
        desc: `${formatMoney(bBonus)} Foundation Bonus + 1 Immunity Shield + ${skBonus} Director Points`
      };
      penalty = {
        ultimatum: true,
        trustPenalty: 25,
        desc: 'Board Warning & Board Discontent'
      };
      break;
    }

    case 'transitional_rebuild': {
      durationYears = 3;
      title = '3-Year Transitional Rebuild';
      description = 'Clear out deadwood and stabilize in the mid-table while hoarding capital. We do not expect trophies, just sustainable financial growth and zero relegation anxiety.';

      const targetCashK = getLeagueScaledVal(club.tier || 1, 50000, club.country || 'GER');
      const currentCashK = Math.max(0, effectiveBudgetK);

      objectives = [
        {
          id: 'obj_avoid_rel',
          desc: 'Avoid Relegation across all 3 seasons',
          targetValue: 3,
          currentValue: 0,
          unit: 'Seasons',
          type: 'avoid_relegation'
        },
        {
          id: 'obj_hoard_cash',
          desc: `Achieve ${formatMoney(targetCashK)} in the club treasury`,
          targetValue: targetCashK,
          currentValue: currentCashK,
          unit: 'EUR',
          type: 'hoard_cash'
        }
      ];

      reward = {
        budgetBonus: getLeagueScaledVal(club.tier || 1, 15000, club.country || 'GER'),
        trustBonus: 30,
        immunityBonus: 1,
        skillPointsBonus: 25,
        desc: `${formatMoney(getLeagueScaledVal(club.tier || 1, 15000, club.country || 'GER'))} Warchest Bonus + 1 Immunity Shield + 25 Director Points + 30 Board Trust`
      };

      penalty = {
        ultimatum: true,
        trustPenalty: 35,
        desc: 'Relegation or failure to secure financial solvency resulted in an immediate board ultimatum.'
      };
      break;
    }
  }

  // Pre-initialize completion status on all objectives
  for (const obj of objectives) {
    obj.isCompleted = obj.currentValue >= obj.targetValue;
  }

  return {
    id,
    title,
    type: visionType,
    description,
    startYear: currentYear,
    durationYears,
    currentYearOfVision: 1,
    objectives,
    reward,
    penalty,
    status: 'active'
  };
};

export interface SeasonEvaluationParams {
  pos: number;
  tier: number;
  trophiesWon: TrophiesObj;
  graduatedYouthCount: number;
  netTransferProfitK: number;
  academyLevel: number;
  facilitiesUpgradedThisSeason: number;
  facilitiesAlreadyTracked?: boolean;
  isInDebt: boolean;
  isRelegated: boolean;
  isPromoted: boolean;
  baseOvr: number;
  qualifiedEuro: boolean;
  madeCupFinal: boolean;
  fanbaseGrowthPct: number;
  currentTrust?: number;
  endBudget?: number;
}

export const applyFacilityUpgradeToBoardVision = (
  vision: BoardVision,
  type: 'stadium' | 'academy' | 'medical',
  newAcademyLevel?: number
): BoardVision => {
  const cloned = JSON.parse(JSON.stringify(vision)) as BoardVision;
  for (const obj of cloned.objectives) {
    if (obj.type === 'upgrade_facilities') {
      if (obj.id === 'obj_academy_lvl' && newAcademyLevel !== undefined) {
        obj.currentValue = newAcademyLevel;
      } else if (obj.id === 'obj_upgrade_facs') {
        obj.currentValue = Math.min(obj.targetValue, (obj.currentValue || 0) + 1);
      }
      obj.isCompleted = obj.currentValue >= obj.targetValue;
    }
  }
  return cloned;
};

export const applyYouthGraduationToBoardVision = (
  vision: BoardVision,
  count: number = 1
): BoardVision => {
  const cloned = JSON.parse(JSON.stringify(vision)) as BoardVision;
  for (const obj of cloned.objectives) {
    if (obj.type === 'graduate_youth') {
      obj.currentValue = Math.min(obj.targetValue, (obj.currentValue || 0) + count);
      obj.isCompleted = obj.currentValue >= obj.targetValue;
    }
  }
  return cloned;
};

export const updateBoardVisionSeasonEnd = (
  vision: BoardVision,
  params: SeasonEvaluationParams
): {
  updatedVision: BoardVision;
  outcome?: 'completed' | 'failed' | 'progress';
  message?: string;
  budgetReward?: number;
  trustReward?: number;
  immunityReward?: number;
  skillPointsReward?: number;
} => {
  const updated = JSON.parse(JSON.stringify(vision)) as BoardVision;

  // Update objectives based on season performance
  for (const obj of updated.objectives) {
    switch (obj.type) {
      case 'league_titles':
        if (params.pos === 1 || params.trophiesWon.bl || params.trophiesWon.lower) {
          obj.currentValue += 1;
        }
        break;

      case 'continental_final':
        if (params.madeCupFinal || params.trophiesWon.cl || params.trophiesWon.el || params.trophiesWon.ecl || params.trophiesWon.cwc || params.trophiesWon.dfb || params.trophiesWon.reg) {
          obj.currentValue = Math.min(obj.targetValue, obj.currentValue + 1);
        }
        break;

      case 'maintain_ovr':
        obj.currentValue = params.baseOvr;
        break;

      case 'graduate_youth':
        obj.currentValue = Math.min(obj.targetValue, obj.currentValue + params.graduatedYouthCount);
        break;

      case 'transfer_profit':
        if (params.netTransferProfitK > 0) {
          obj.currentValue += params.netTransferProfitK;
        }
        break;

      case 'upgrade_facilities':
        if (obj.id === 'obj_academy_lvl') {
          obj.currentValue = params.academyLevel;
        } else {
          if (params.facilitiesAlreadyTracked) {
            obj.currentValue = Math.min(obj.targetValue, Math.max(obj.currentValue || 0, params.facilitiesUpgradedThisSeason));
          } else {
            obj.currentValue = Math.min(obj.targetValue, (obj.currentValue || 0) + params.facilitiesUpgradedThisSeason);
          }
        }
        break;

      case 'zero_debt':
        if (!params.isInDebt) {
          obj.currentValue += 1;
        }
        break;

      case 'avoid_relegation':
        if (!params.isRelegated) {
          obj.currentValue += 1;
        }
        break;

      case 'promotion':
        if (params.isPromoted) {
          obj.currentValue += 1;
        }
        break;

      case 'fanbase_growth':
        obj.currentValue = Math.round(obj.currentValue + Math.max(0, params.fanbaseGrowthPct));
        break;

      case 'continental_qualification':
        if (params.qualifiedEuro) {
          obj.currentValue += 1;
        }
        break;

      case 'hoard_cash':
        if (params.endBudget !== undefined) {
          obj.currentValue = params.endBudget;
        }
        break;
    }

    // Mark completion status for individual objective
    obj.isCompleted = obj.currentValue >= obj.targetValue;
  }

  // Check if final year of vision
  const isFinalYear = updated.currentYearOfVision >= updated.durationYears;

  if (isFinalYear) {
    const allCompleted = updated.objectives.every(o => o.isCompleted);
    if (allCompleted) {
      updated.status = 'completed';
      return {
        updatedVision: updated,
        outcome: 'completed',
        message: `Board Vision Accomplished! You fulfilled the ${updated.durationYears}-Year '${updated.title}' roadmap. The Board has rewarded you with ${updated.reward.desc}!`,
        budgetReward: updated.reward.budgetBonus,
        trustReward: updated.reward.trustBonus,
        immunityReward: updated.reward.immunityBonus,
        skillPointsReward: updated.reward.skillPointsBonus || (updated.durationYears === 5 ? 25 : updated.durationYears === 2 ? 10 : 15)
      };
    } else {
      updated.status = 'failed';
      const rawPenalty = updated.penalty.trustPenalty || 25;
      const clampedTrustPenalty = params.currentTrust !== undefined
        ? Math.max(0, Math.min(params.currentTrust, rawPenalty))
        : rawPenalty;

      return {
        updatedVision: updated,
        outcome: 'failed',
        message: `Board Vision Failed: You did not complete all targets for the ${updated.durationYears}-Year '${updated.title}' roadmap. ${updated.penalty.desc}`,
        trustReward: -clampedTrustPenalty
      };
    }
  } else {
    updated.currentYearOfVision += 1;
    return {
      updatedVision: updated,
      outcome: 'progress',
      message: `${updated.durationYears}-Year Vision Progress (Year ${updated.currentYearOfVision} of ${updated.durationYears}): Keeping up with Board Objectives.`
    };
  }
};
