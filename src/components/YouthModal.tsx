import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameState, Language, Club } from '../types';
import { formatMoney, sanitizePlayerName, getAcademyCallUpCap, getAcademyScoutCap, getLeagueScaledVal, calculateClubFinancials, getAcademySolidarityDividendK } from '../data/gameConstants';
import { t as tr } from '../data/translations';
import { YouthChampionshipModal } from './YouthChampionshipModal';
import { getIncubatorCapacity, calculateTrainingCompensationK, getSeniorIntegrationOdds } from '../engine/incubatorEngine';

interface YouthModalProps {
  protectionCost?: number;
  creditLimit?: number;
  state: GameState;
  lang: Language;
  actionCost: number;
  financials: { wages: number; estRevenue: number; net: number };
  onRecruitYouth: () => void;
  onProtectYouth?: (id: string) => void;
  onGraduateYouth?: (id: string, action: 'promote' | 'loan' | 'compensation') => void;
  onUpdateScoutingDial?: (dialPct: number) => void;
  canAfford: boolean;
  onClose: () => void;
  onOpenChampionship?: () => void;
  clubsDb?: Club[];
  isModActive?: boolean;
  onTournamentStart?: () => void;
  onTournamentVictory?: (prizeMoney: number, cohortBoost: number) => void;
}

export const YouthModal: React.FC<YouthModalProps> = ({
  state,
  lang,
  actionCost,
  onRecruitYouth,
  onProtectYouth,
  onGraduateYouth,
  onUpdateScoutingDial,
  onClose,
  onOpenChampionship,
  canAfford,
  protectionCost = 25000,
  creditLimit = 0,
  financials,
  clubsDb,
  isModActive,
  onTournamentStart,
  onTournamentVictory,
}) => {
  const isDe = lang === 'de';
  const t = (en: string, de?: string, _ignoredEs?: string) => tr(lang, en, de);
  const [protectConfirmId, setProtectConfirmId] = useState<string | null>(null);
  const [showTournamentSubModal, setShowTournamentSubModal] = useState(false);
  
  const pipeline = state.youthPipeline || [];
  const maxCapacity = getIncubatorCapacity(state.club.academyLevel || 1);
  const squadSize = state.club.squadSize || 24;
  const isSquadFull = squadSize >= 50;
  const isCombinedFull = squadSize + pipeline.length >= 50;
  const isFull = pipeline.length >= maxCapacity || isCombinedFull;

  const LEVEL_1_THRESHOLD = 1;
  const hasLevel1Cohort = pipeline.length >= LEVEL_1_THRESHOLD;
  const isTournamentPlayed = state.youthChampionshipPlayedYear === state.year;
  const isPreSeason = (state.seasonPhase || 'start') === 'start';
  const academyLvl = Math.max(1, Math.min(5, state.club.academyLevel || 1));
  const tier = state.club.tier || 1;
  const facilityBonus = (academyLvl - 1) * 6;
  const callUpCap = getAcademyCallUpCap(academyLvl);
  const callUpsUsed = state.academyCallUpsThisSeason || 0;
  const isCallUpCapped = callUpsUsed >= callUpCap;
  const scoutCap = getAcademyScoutCap(academyLvl);
  const scoutsUsed = state.youthScoutedThisSeason || 0;
  const isScoutCapped = scoutsUsed >= scoutCap;

  // Realistic Tier Vulnerability: Giants aggressively poach from lower tiers
  const tierPoachVulnerability = Math.max(0, (tier - 1) * 8);
  const baseKeep = 45 + ((academyLvl || 1) * 11);
  const protectionKeepChance = Math.max(25, Math.min(95, baseKeep - tierPoachVulnerability));

  const clubFin = calculateClubFinancials({ ...state, isManaged: true });
  const baseAcademyOpK = (clubFin as any).baseAcademyOp ?? ((clubFin as any).academyOp || 0);
  const currentScoutingDial = Math.max(0, Math.min(50, state.academyScoutingDial ?? 0));
  const extraScoutingCostK = (clubFin as any).scoutingDialExtraK ?? 0;
  const totalAcademyOpK = (clubFin as any).academyOp ?? (baseAcademyOpK + extraScoutingCostK);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={onClose}
      className="fixed inset-0 bg-[#18191F]/45 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-2.5 sm:p-4 cursor-pointer overflow-y-auto overscroll-contain"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.98, opacity: 0 }} 
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-[#18191F] border border-[#E6E3DC] w-full max-w-lg rounded-[28px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(24,25,31,0.18)] flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto shrink-0 overflow-hidden cursor-default relative text-left"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] flex justify-between items-center shrink-0 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-base shadow-sm shrink-0">
              <i className="fas fa-seedling"></i>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-0.5">
                {t('Talent Pipeline', 'Talentschmiede')}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18191F] tracking-tight leading-tight">
                {t('Youth Academy', 'Jugendakademie')}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-extrabold tracking-tight tabular-nums text-emerald-700">{pipeline.length}/{maxCapacity}</span>
              <span className="text-[11px] text-[#6B7280] font-normal ml-1">{t('Prospects', 'Talente')}</span>
            </div>
            <button 
              aria-label="Close modal" 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-[#F5F4F0] hover:bg-[#EAE7E0] text-[#6B7280] hover:text-[#18191F] flex items-center justify-center transition border border-[#E6E3DC] cursor-pointer shrink-0"
            >
              <i className="fas fa-xmark text-xs"></i>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain custom-scrollbar flex-1 min-h-0 space-y-4 relative z-10">
          {/* Compact Academy Milestone & Capacity Bar */}
          <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3.5 flex flex-col gap-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#18191F] flex items-center gap-2 font-semibold">
                <i className="fas fa-seedling text-emerald-700 text-xs"></i>
                {t(
                  `Academy Level ${academyLvl}/5 Milestones`,
                  `Akademie Stufe ${academyLvl}/5 Meilensteine`
                )}
              </span>
              <div className="flex items-center gap-2 text-[11px] tracking-tight tabular-nums">
                <span className="text-sky-700 font-bold">
                  {t(`Scouts ${scoutsUsed}/${scoutCap}`, `Scouts ${scoutsUsed}/${scoutCap}`)}
                </span>
                <span className="text-[#C7C4BC]" aria-hidden="true">·</span>
                <span className="text-emerald-700 font-bold">
                  {t(`Call-ups ${callUpsUsed}/${callUpCap}`, `Berufung ${callUpsUsed}/${callUpCap}`)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 border-t border-[#E6E3DC] text-[10px] tracking-tight tabular-nums">
              <span className={academyLvl >= 2 ? 'text-emerald-700 font-semibold' : 'text-[#9A9890]'}>
                L2 {t('Poach Shield', 'Abwerbe-Schutz')}
              </span>
              <span className="text-[#C7C4BC]" aria-hidden="true">·</span>
              <span className={academyLvl >= 3 ? 'text-emerald-700 font-semibold' : 'text-[#9A9890]'}>
                L3 +1 OVR {t('Graduation', 'Reife-Bonus')}
              </span>
              <span className="text-[#C7C4BC]" aria-hidden="true">·</span>
              <span className={academyLvl >= 4 ? 'text-amber-700 font-semibold' : 'text-[#9A9890]'}>
                L4 15% {t('Wonderkid', 'Wunderkind')}
              </span>
              <span className="text-[#C7C4BC]" aria-hidden="true">·</span>
              <span className={academyLvl >= 5 ? 'text-sky-700 font-semibold' : 'text-[#9A9890]'}>
                L5 {formatMoney(getAcademySolidarityDividendK(state.club.country || 'GER'), state.club.country)} {t('Dividend/yr', 'Dividende/J')}
              </span>
            </div>
          </div>

          {/* Youth Scouting Boost Control (Reflected in Financial Ledger) */}
          {onUpdateScoutingDial && (
            <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#18191F]">
                  <i className="fa-solid fa-binoculars text-sky-700 text-xs"></i>
                  <span>{t('Youth Scouting Intensity', 'Jugend-Scouting-Intensität')}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#4B5563] tabular-nums">
                  {t('Ledger Upkeep:', 'Bilanz-Kosten:')} <span className="text-rose-700">-{formatMoney(totalAcademyOpK)}/yr</span>
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-snug">
                {t(
                  'Spend extra each season on regional scouts to boost your chances of finding Top Prospects and Wonderkids.',
                  'Investiere jährlich mehr ins Scouting, um deine Chancen auf Top-Talente und Wunderkinder zu erhöhen.'
                )}
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 10, 20, 35, 50].map((pct) => {
                  const optExtraK = pct > 0 ? Math.max(1, Math.round(baseAcademyOpK * (pct / 100))) : 0;
                  const isSelected = currentScoutingDial === pct;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => onUpdateScoutingDial(pct)}
                      className={`py-1.5 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center border ${
                        isSelected
                          ? 'bg-[#18191F] border-[#18191F] text-white shadow-sm'
                          : 'bg-white hover:bg-[#EFECE4] text-[#4B5563] hover:text-[#18191F] border-[#E6E3DC]'
                      }`}
                    >
                      <span className={`text-[11px] font-bold font-mono ${isSelected ? 'text-white' : 'text-[#18191F]'}`}>
                        {pct === 0 ? t('Normal', 'Basis') : `+${pct}%`}
                      </span>
                      <span className={`text-[9px] font-mono tabular-nums mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-[#6B7280]'}`}>
                        {pct === 0 ? '+0/yr' : `-${formatMoney(optExtraK)}/yr`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tier >= 3 && academyLvl >= 2 && academyLvl < 5 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2 text-[11px] text-amber-900 leading-tight">
              <i className="fa-solid fa-triangle-exclamation text-amber-700 text-xs shrink-0"></i>
              <span>
                {t(
                  `Tier ${tier} Poaching Risk: Use L2 Poach Shield on 3+ OVR prospects (${protectionKeepChance}% keep rate vs Tier 1 giants; 100% automatic at L5)`,
                  `Tier ${tier} Abwerberisiko: Nutze L2 Abwerbe-Schutz für 3+ GES Talente (${protectionKeepChance}% Verbleibequote vs. Erstligisten; 100% automatisch ab L5)`
                )}
              </span>
            </div>
          )}

          <div className="space-y-3">
            {pipeline.length === 0 ? (
              <div className="text-center p-8 border border-[#E6E3DC] rounded-2xl bg-[#FAF9F6]">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-center text-[#9A9890] text-xl mx-auto mb-3">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div className="text-[#18191F] font-semibold text-sm">{t('Academy Empty', 'Akademie leer')}</div>
                <div className="text-[#6B7280] text-xs mt-1 font-normal">{t('No players currently enrolled in development.', 'Derzeit keine Nachwuchsspieler in der Entwicklung.')}</div>
              </div>
            ) : (
              pipeline.map((p, idx) => {
                const isGenerational = p.type === 'generational';
                const isTop = p.type === 'top_prospect';
                const isReady = (p.status === 'ready' || (typeof p.timer === 'number' && p.timer <= 0)) && p.status !== 'loaned';
                const isLoaned = p.status === 'loaned';
                const hasNlzBonus = isReady && academyLvl >= 3;
                const hasFeederBonus = Boolean(state.prestigeUpgrades?.feederClubPurchased && !(p as any).feederBonusApplied);
                const rawGraduateBoost = p.boost + (hasNlzBonus ? 1 : 0) + (hasFeederBonus ? 1 : 0);
                let effectiveGraduateBoost = rawGraduateBoost;
                const rawEarlyBoost = Math.max(1, (p.boost + (hasFeederBonus ? 1 : 0)) - 1);
                let effectiveEarlyBoost = rawEarlyBoost;
                let coachYouthTrait: 'boost' | 'penalty' | null = null;
                if (state.currentCoach) {
                  const cStr = state.currentCoach.strength;
                  const cWeak = state.currentCoach.weakness;
                  const cArch = (state.currentCoach as any).archetype;
                  if (cWeak === 'Youth Apathy' || cArch === 'iron_disciplinarian' || cArch === 'pragmatic_grinder') {
                    effectiveGraduateBoost = Math.max(1, Math.floor(effectiveGraduateBoost / 2));
                    effectiveEarlyBoost = Math.max(1, Math.floor(effectiveEarlyBoost / 2));
                    coachYouthTrait = 'penalty';
                  } else if (cStr === 'Youth Whisperer' || cStr === 'Youth Focus' || cArch === 'youth_visionary') {
                    effectiveGraduateBoost += 1;
                    effectiveEarlyBoost += 1;
                    coachYouthTrait = 'boost';
                  }
                }
                const rawCompFee = calculateTrainingCompensationK(p, state.club.tier || 1, state.club.country || 'GER');
                const compFee = state.clubIdentity === 'wonderkid' ? Math.round(rawCompFee * 1.35) : rawCompFee;
                const integrationOdds = getSeniorIntegrationOdds(p, state.club.baseOvr, {
                  coachStrength: state.currentCoach?.strength,
                  coachWeakness: state.currentCoach?.weakness,
                  coachArchetype: (state.currentCoach as any)?.archetype,
                  hasTalentscout: (state.managerSkills || []).includes('talentscout'),
                  clubTier: state.club.tier || 1,
                  clubCountry: state.club.country || 'GER',
                });
                const clickChancePct = Math.round(integrationOdds.clickChance * 100);
                
                return (
                  <div
                    key={p.id || idx}
                    className={`border rounded-2xl p-4 flex flex-col gap-2.5 transition-all ${
                      isReady 
                        ? 'bg-emerald-50/70 border-emerald-200 shadow-sm' 
                        : isLoaned
                        ? 'bg-sky-50/70 border-sky-200'
                        : 'bg-[#FAF9F6] border-[#E6E3DC] hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-[#18191F] font-semibold text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                            <span className="truncate max-w-full">{sanitizePlayerName(p.name) || `Talent #${idx + 1}`}</span>
                            {p.position && (
                              <span className="text-[#6B7280] font-mono text-[11px] shrink-0">
                                · {p.position}
                              </span>
                            )}
                            {p.nationality && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#4B5563] border border-[#E6E3DC] shrink-0">
                                {p.nationality}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#6B7280] mt-1 flex items-center gap-1.5 font-normal flex-wrap">
                            <span className={isGenerational ? 'text-amber-700 font-semibold' : isTop ? 'text-emerald-700 font-semibold' : 'text-sky-700 font-semibold'}>
                              {isGenerational ? t('Generational', 'Ausnahmetalent') : isTop ? t('Top Prospect', 'Top-Talent') : t('Local Prospect', 'Lokales Talent')}
                            </span>
                            <span className="text-[#C7C4BC]">·</span>
                            <span className="whitespace-nowrap">{p.age || 17} {t('yrs', 'Jahre')}</span>
                            {p.playstyle && (
                              <>
                                <span className="text-[#C7C4BC]">·</span>
                                <span className="text-[#4B5563] text-[11px]">{p.playstyle}</span>
                              </>
                            )}
                            {isReady && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap">
                                {t('Ready to Graduate', 'Absolvent')}
                              </span>
                            )}
                            {isLoaned && (
                              <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap">
                                {t('On Loan Farm', 'Leihe')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className="text-emerald-700 font-bold font-mono text-sm sm:text-base whitespace-nowrap tabular-nums">
                            +{effectiveGraduateBoost} {t('OVR', 'GES')}
                          </span>
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            {hasNlzBonus && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold whitespace-nowrap">
                                +{t('1 NLZ Bonus', '1 NLZ-Bonus')}
                              </span>
                            )}
                            {hasFeederBonus && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold whitespace-nowrap">
                                +{t('1 Feeder', '1 Farmteam')}
                              </span>
                            )}
                            {coachYouthTrait === 'boost' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold whitespace-nowrap" title="Head Coach Youth Development Bonus">
                                +1 Coach
                              </span>
                            )}
                            {coachYouthTrait === 'penalty' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold whitespace-nowrap" title="Head Coach Youth Apathy / Disciplinarian Bottleneck">
                                -50% Coach
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-[#6B7280] font-mono flex items-center justify-between gap-2 flex-wrap pt-1.5 border-t border-[#E6E3DC]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded border font-semibold whitespace-nowrap tabular-nums ${
                              clickChancePct >= 60
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : clickChancePct >= 40
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                            title="Probability that this youth player clicks immediately with your Senior First Team tactics & dressing room upon promotion. Farm Loans (+14%/loan) and Youth-focused coaches increase this rate."
                          >
                            {clickChancePct}% Senior Click
                          </span>
                          {(p.loansServed || 0) > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold whitespace-nowrap tabular-nums">
                              Loan-Tested ({p.loansServed}/2)
                            </span>
                          )}
                        </div>
                        <span className="text-[#6B7280] whitespace-nowrap ml-auto">
                          {isReady 
                            ? t('Matured', 'Ausgebildet') 
                            : isLoaned 
                            ? t('Developing off-site', 'Extern in Leihe') 
                            : p.timer === 1 
                            ? t('Next season', 'Nächste Saison') 
                            : t(`In ${p.timer} seasons`, `In ${p.timer} Saisons`)}
                        </span>
                      </div>
                    </div>

                    {/* Graduation Choices for Ready or Loaned Prospects */}
                    {(isReady || isLoaned) && onGraduateYouth && (
                      <div className="pt-2.5 mt-1 border-t border-emerald-200 flex flex-col gap-2">
                        <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <i className="fa-solid fa-graduation-cap"></i>
                            <span>{t('Graduation Decisions', 'Abschluss-Entscheidung')}</span>
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border tabular-nums ${
                            isCallUpCapped
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {callUpsUsed}/{callUpCap} {t('Senior Call-ups', 'Kaderübernahmen')}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            disabled={isLoaned || isCallUpCapped || isSquadFull}
                            onClick={() => onGraduateYouth(p.id, 'promote')}
                            className={`p-2 rounded-xl text-left transition flex flex-col justify-between border ${
                              isLoaned || isCallUpCapped || isSquadFull
                                ? 'bg-[#EFECE4] border-[#E6E3DC] text-[#9A9890] cursor-not-allowed'
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800 cursor-pointer'
                            }`}
                            title={
                              isLoaned
                                ? t('Locked while prospect is out on farm loan this season', 'Gesperrt während der laufenden Saisonleihe')
                                : isSquadFull
                                ? t('Senior squad is at maximum capacity (50/50 players)', 'Profikader hat das Limit erreicht (50/50 Spieler)')
                                : isCallUpCapped
                                ? `Seasonal call-up cap reached (${callUpsUsed}/${callUpCap}). Upgrade Youth Academy for higher capacity.`
                                : undefined
                            }
                          >
                            <span className="text-[11px] font-bold flex items-center gap-1">
                              <i className={`fa-solid ${isLoaned ? 'fa-lock' : 'fa-user-plus'} text-[10px]`}></i>
                              {isLoaned ? t('Sign to Squad', 'Kaderübernahme') : isSquadFull ? t('Squad Full', 'Kader voll') : isCallUpCapped ? t('Cap Reached', 'Limit erreicht') : t('Sign to Squad', 'Kaderübernahme')}
                            </span>
                            <span className={`text-[10px] font-bold mt-1 ${isLoaned || isCallUpCapped || isSquadFull ? 'text-[#9A9890]' : 'text-emerald-700'}`}>
                              {isLoaned ? t('Locked (On Loan)', 'Gesperrt (Leihe)') : isSquadFull ? '50/50 max' : isCallUpCapped ? `${callUpsUsed}/${callUpCap} used` : `+${effectiveGraduateBoost} ${t('OVR to First Team', 'GES für Profikader')}`}
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={isLoaned || (p.loansServed || 0) >= 2 || (p.age || 18) >= 20}
                            onClick={() => onGraduateYouth(p.id, 'loan')}
                            className={`p-2 rounded-xl text-left transition flex flex-col justify-between border ${
                              isLoaned || (p.loansServed || 0) >= 2 || (p.age || 18) >= 20
                                ? 'bg-[#EFECE4] border-[#E6E3DC] text-[#9A9890] cursor-not-allowed'
                                : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800 cursor-pointer'
                            }`}
                            title={
                              isLoaned
                                ? t('Already on farm loan for this season', 'Bereits für diese Saison verliehen')
                                : (p.loansServed || 0) >= 2
                                ? t('Max 2 farm loans reached for this prospect', 'Maximal 2 Leihen für dieses Talent erreicht')
                                : (p.age || 18) >= 20
                                ? t('Prospect too old for farm loan (max age 19)', 'Talent zu alt für Partnerleihe (max. 19 Jahre)')
                                : undefined
                            }
                          >
                            <span className="text-[11px] font-bold flex items-center gap-1">
                              <i className={`fa-solid ${isLoaned ? 'fa-lock' : 'fa-handshake'} text-[10px]`}></i>
                              {(p.loansServed || 0) >= 2 ? t('Loan Cap (2/2)', 'Leih-Limit (2/2)') : t('Farm Loan', 'Partnerleihe')}
                            </span>
                            <span className={`text-[9px] mt-1 ${isLoaned || (p.loansServed || 0) >= 2 || (p.age || 18) >= 20 ? 'text-[#9A9890]' : 'text-sky-700'}`}>
                              {isLoaned
                                ? t('On Loan This Season', 'Diese Saison verliehen')
                                : (p.loansServed || 0) >= 2 
                                ? t('Must promote or release', 'Übernahme oder Ablöse')
                                : `+1 OVR & +14% Click (${p.loansServed || 0}/2)`}
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={isLoaned}
                            onClick={() => onGraduateYouth(p.id, 'compensation')}
                            className={`p-2 rounded-xl text-left transition flex flex-col justify-between border ${
                              isLoaned
                                ? 'bg-[#EFECE4] border-[#E6E3DC] text-[#9A9890] cursor-not-allowed'
                                : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 cursor-pointer'
                            }`}
                            title={
                              isLoaned
                                ? t('Locked while prospect is out on farm loan this season', 'Gesperrt während der laufenden Saisonleihe')
                                : undefined
                            }
                          >
                            <span className="text-[11px] font-bold flex items-center gap-1">
                              <i className={`fa-solid ${isLoaned ? 'fa-lock' : 'fa-sack-dollar'} text-[10px]`}></i>
                              {t('Release Fee', 'Entschädigung')}
                            </span>
                            <span className={`text-[9px] font-mono mt-1 tabular-nums ${isLoaned ? 'text-[#9A9890]' : 'text-amber-700'}`}>
                              {isLoaned ? t('Locked (On Loan)', 'Gesperrt (Leihe)') : `+${formatMoney(compFee)} Cash`}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {!isReady && !isLoaned && (
                      <div className="pt-2 border-t border-[#E6E3DC] flex flex-col gap-2">
                        {!p.isProtected && p.boost >= 3 && academyLvl < 5 && onProtectYouth && (
                          <>
                            {academyLvl < 2 ? (
                              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wide text-center flex items-center justify-center gap-1.5">
                                <i className="fas fa-lock text-[9px]"></i>
                                <span>{t('Requires Academy Lvl 2 (Poach Shield) to Protect', 'Akademie Lvl 2 (Abwerbe-Schutz) benötigt zum Schützen')}</span>
                              </div>
                            ) : protectConfirmId === p.id ? (
                              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                                <div className="text-[#18191F] text-xs font-normal mb-2 text-center">
                                  {t('Protecting this player gives you a', 'Dieses Talent zu schützen gibt dir eine')} 
                                  <strong className="text-emerald-700 mx-1 font-bold">{protectionKeepChance}%</strong> 
                                  {t('chance of fending off poachers.', 'Erfolgschance gegen abwerbende Spitzenklubs.')}
                                  {tier >= 3 && (
                                    <span className="block text-[10px] text-amber-800 mt-1">
                                      {t(`(Tier ${tier} penalty applied: -${tierPoachVulnerability}% protection resistance vs Tier 1 giants)`, `(Liga-${tier}-Abzug: -${tierPoachVulnerability}% Schutz gegen Erstligisten)`)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setProtectConfirmId(null);
                                    }}
                                    className="flex-1 bg-white hover:bg-[#EFECE4] text-[#4B5563] border border-[#E6E3DC] py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                                  >
                                    {t('Cancel', 'Abbrechen')}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onProtectYouth(p.id);
                                      setProtectConfirmId(null);
                                    }}
                                    disabled={state.budget - protectionCost < -creditLimit}
                                    className="flex-1 bg-[#18191F] hover:bg-[#2A2C35] text-white py-2 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                  >
                                    {t('Confirm', 'Bestätigen')} (-{formatMoney(protectionCost)})
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {!p.isProtected && p.boost >= 3 && academyLvl >= 2 && academyLvl < 5 && onProtectYouth && protectConfirmId !== p.id ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProtectConfirmId(p.id);
                              }}
                              className="bg-white hover:bg-[#EFECE4] text-sky-700 hover:text-[#18191F] border border-[#E6E3DC] px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <i className="fas fa-shield-halved text-[10px] text-sky-700"></i>
                              <span>{t('Protect Prospect', 'Talent Schützen')}</span>
                            </button>
                          ) : <div />}

                          {onGraduateYouth && (
                            <button
                              type="button"
                              disabled={isCallUpCapped || isSquadFull}
                              onClick={() => onGraduateYouth(p.id, 'promote')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                                isCallUpCapped || isSquadFull
                                  ? 'bg-[#EFECE4] border-[#E6E3DC] text-[#9A9890] cursor-not-allowed'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer'
                              }`}
                              title={
                                isSquadFull
                                  ? t('Senior squad is at maximum capacity (50/50 players)', 'Profikader voll (50/50 Spieler)')
                                  : isCallUpCapped
                                  ? `Seasonal call-up cap reached (${callUpsUsed}/${callUpCap})`
                                  : t(`Promote early to First Team (-1 OVR & -15% Senior Click penalty; ${clickChancePct}% Click Rate)`, `Vorzeitig in den Profikader berufen (-1 GES & -15% Integrations-Abzug; ${clickChancePct}% Klick-Rate)`)
                              }
                            >
                              <i className="fa-solid fa-arrow-up-from-bracket text-[10px]"></i>
                              <span>
                                {isSquadFull
                                  ? t('Squad Full', 'Kader voll')
                                  : isCallUpCapped
                                  ? `${t('Call-Up Cap', 'Berufungs-Limit')} (${callUpsUsed}/${callUpCap})`
                                  : `${t('Call Up Early', 'Früh berufen')} (+${effectiveEarlyBoost} ${t('Net OVR', 'Netto-GES')} · ${clickChancePct}% Click)`}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {!isReady && !isLoaned && p.boost >= 3 && academyLvl >= 5 && (
                      <div className="self-start mt-0.5 text-emerald-700 flex items-center gap-1.5 text-xs font-medium">
                        <i className="fas fa-shield-halved text-[10px]"></i>
                        <span>{t('La Masia Complex: 100% Automatic Poach Immunity', 'La-Masia-Komplex: 100% Automatischer Abwerbe-Schutz')}</span>
                      </div>
                    )}
                    {p.isProtected && academyLvl < 5 && (
                      <div className="self-start mt-0.5 text-sky-700 flex items-center gap-1.5 text-xs font-medium">
                        <i className="fas fa-shield-halved text-[10px]"></i>
                        <span>{t('Protected from poachers', 'Vor Abwerbung geschützt')} ({protectionKeepChance}% {t('resistance', 'Erfolgswahrscheinlichkeit')})</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E6E3DC] bg-[#FAF9F6] flex flex-col gap-2.5 shrink-0 relative z-10">
          {/* Youth Championship Sub-Modal Trigger */}
          <div className="w-full">
            {isTournamentPlayed ? (
              <div className="w-full py-2.5 sm:py-3 px-4 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-xl ${state.lastYouthChampionshipResult?.won ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-[#F5F4F0] text-[#6B7280] border-[#E6E3DC]'} border flex items-center justify-center text-xs shrink-0`}>
                    <i className={state.lastYouthChampionshipResult?.won ? "fa-solid fa-trophy" : "fa-solid fa-flag-checkered"}></i>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-[#18191F]">
                      {t('National U19 Championship', 'Nationale U19 Meisterschaft')}
                    </div>
                    <div className="text-[11px] text-[#4B5563]">
                      {state.lastYouthChampionshipResult?.won 
                        ? (isDe ? '🏆 U19-Meister dieser Saison' : '🏆 Season Champions') 
                        : (isDe ? 'Teilnahme diese Saison beendet' : 'Completed for this season')}
                      <span className="text-[#6B7280]"> · {isDe ? `Wieder in Saison ${state.year + 1} (Vorbereitung)` : `Returns in Season ${state.year + 1} Pre-Season`}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F4F0] text-[#6B7280] border border-[#E6E3DC] shrink-0">
                  1/1 {isDe ? 'Saison' : 'Season'}
                </span>
              </div>
            ) : !isPreSeason ? (
              <div className="w-full py-2.5 sm:py-3 px-4 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-between text-[#6B7280] text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#F5F4F0] border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] text-xs shrink-0">
                    <i className="fa-solid fa-calendar-xmark"></i>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-[#18191F]">
                      {t('National U19 Championship', 'Nationale U19 Meisterschaft')}
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      {isDe 
                        ? `Nur während der Saisonvorbereitung spielbar · Nächstes Turnier in Saison ${state.year + 1}` 
                        : `Playable during pre-season preparation only · Returns in Season ${state.year + 1} prep`}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F5F4F0] text-[#6B7280] border border-[#E6E3DC] shrink-0">
                  {isDe ? 'Saisonvorbereitung' : 'Pre-Season Only'}
                </span>
              </div>
            ) : hasLevel1Cohort ? (
              <button
                type="button"
                onClick={() => {
                  if (onOpenChampionship) {
                    onOpenChampionship();
                  } else {
                    setShowTournamentSubModal(true);
                  }
                }}
                className="w-full py-2.5 sm:py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 active:scale-[0.98] shadow-sm transition flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-700 text-xs shrink-0">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-amber-900 tracking-wide uppercase">
                      {t('Simulate National Youth Championship', 'Nationale U19 Meisterschaft simulieren')}
                    </div>
                    <div className="text-[11px] text-amber-800/80 font-normal">
                      {t(`Level ${academyLvl} Academy: +${facilityBonus} OVR title advantage`, `Stufe ${academyLvl} Akademie: +${facilityBonus} GES Titel-Vorteil`)}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#18191F] text-white shrink-0">
                  {t('Open', 'Öffnen')} →
                </span>
              </button>
            ) : (
              <div className="w-full py-2.5 px-4 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-between text-[#6B7280] text-xs">
                <div className="flex items-center gap-2">
                  <i className="fas fa-lock text-[#9A9890] text-xs"></i>
                  <span className="text-[#18191F] font-medium">{t('National U19 Championship', 'Nationale U19 Meisterschaft')}</span>
                </div>
                <span className="text-[11px] text-[#6B7280]">
                  {t(`Requires at least 1 Academy Prospect (${pipeline.length}/${maxCapacity})`, `Erfordert mind. 1 Akademie-Talent (${pipeline.length}/${maxCapacity})`)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRecruitYouth}
              disabled={isFull || isScoutCapped || !canAfford}
              className={`flex-1 py-3.5 px-5 rounded-2xl flex items-center justify-between font-semibold text-xs tracking-wide transition shadow-sm ${
                isFull || isScoutCapped || !canAfford
                  ? 'bg-[#EFECE4] text-[#9A9890] border border-[#E6E3DC] cursor-not-allowed'
                  : 'bg-[#18191F] hover:bg-[#2A2C35] text-white cursor-pointer active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-2">
                <i className="fas fa-search text-xs"></i>
                <span>
                  {isFull
                    ? t('Academy Full', 'Akademie voll')
                    : isScoutCapped
                    ? t(`Scout Cap Reached (${scoutsUsed}/${scoutCap} Lvl ${academyLvl})`, `Scout-Limit erreicht (${scoutsUsed}/${scoutCap} Lvl ${academyLvl})`)
                    : t(`Scout New Talent (${scoutsUsed}/${scoutCap})`, `Talent scouten (${scoutsUsed}/${scoutCap})`)}
                </span>
              </div>
              {!isFull && !isScoutCapped && (
                <span className={`font-mono text-xs tabular-nums ${canAfford ? 'text-emerald-300' : 'text-[#9A9890]'}`}>
                  -{formatMoney(actionCost)}
                </span>
              )}
            </button>

            <button
              aria-label="Close modal"
              onClick={onClose}
              className="py-3.5 px-5 rounded-2xl bg-white hover:bg-[#EFECE4] text-[#18191F] font-semibold text-xs transition border border-[#E6E3DC] cursor-pointer"
            >
              {t('Close', 'Schliessen')}
            </button>
          </div>
        </div>

        {/* Embedded Youth Championship Sub-Modal */}
        {showTournamentSubModal && (
          <YouthChampionshipModal
            state={state}
            lang={lang}
            clubsDb={clubsDb}
            isModActive={isModActive}
            onTournamentStart={onTournamentStart}
            onClose={(_won) => {
              setShowTournamentSubModal(false);
            }}
            onTournamentVictory={(prize, boost) => {
              if (onTournamentVictory) {
                onTournamentVictory(prize, boost);
              }
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};
