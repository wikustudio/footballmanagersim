import React from 'react';
import { motion } from 'motion/react';
import { GameState, Language } from '../types';
import { formatMoney, formatNum, getLeagueStadiumRequirement, getCreditLimit, getCountryMult } from '../data/gameConstants';

interface NewBuildModalProps {
  state: GameState;
  lang: Language;
  onClose: () => void;
  onBuild: (capacity: number, cost: number, fanBoost: number, bundle?: { academyLevel: number; medicalLevel: number }) => void;
}

export const NewBuildModal: React.FC<NewBuildModalProps> = ({ state, onClose, onBuild }) => {
  const options = [
    {
      seats: 45000,
      cost: 300000, 
      fanBoost: 10000,
      labelEn: 'Modern Bowl Arena',
      descEn: 'Mid-sized modern stadium engineered for top-flight national competition.',
      minLeague: 3
    },
    {
      seats: 60000,
      cost: 650000, 
      fanBoost: 20000,
      labelEn: 'Elite Arena',
      descEn: 'Large European elite amphitheater with world-class acoustic engineering.',
      minLeague: 2
    },
    {
      seats: 89000,
      cost: 950000, 
      fanBoost: 35000,
      labelEn: 'Colossal Stadium',
      descEn: 'Monumental world-class arena. Intimidating atmosphere for any visiting club.',
      minLeague: 1
    },
    {
      seats: 80000,
      cost: 1200000, 
      fanBoost: 30000,
      labelEn: 'Integrated Sports Campus',
      descEn: 'A sprawling 80,000-seat arena bundled with state-of-the-art Level 3 Academy and Medical facilities.',
      minLeague: 2,
      isMegaProject: true,
      bundle: { academyLevel: 3, medicalLevel: 3 }
    },
    {
      seats: 150000,
      cost: 2500000, 
      fanBoost: 60000,
      labelEn: 'Global Football City',
      descEn: 'The ultimate 150,000-seat architectural marvel. Fully maxes out your Academy (Level 5) and Medical (Level 5) infrastructure.',
      minLeague: 1,
      isMegaProject: true,
      bundle: { academyLevel: 5, medicalLevel: 5 }
    }
  ];

  const currentCap = state.club.stadium || 0;
  const tier = state.club.tier || 5;
  const country = state.club.country || 'GER';
  const requiredCap = getLeagueStadiumRequirement(tier, country);
  
  const countryMult = getCountryMult(country);
  const ovrFactor = Math.pow(1.015, Math.max(0, Math.min(85, state.club.baseOvr) - 50));
  const successMult = (state.clWins || 0) > 0 ? 1.15 : 1.0;
  const mult = countryMult * ovrFactor * successMult;

  const creditLimit = getCreditLimit(tier, country);
  const availableLiquidity = state.budget + creditLimit;

  const alreadyExpanded = (state.stadiumExpandedThisSeason || 0) >= 1;
  const totalProjects = (state.stadiumExpandedThisSeason || 0) + (state.academyUpgradedThisSeason || 0) + (state.medicalUpgradedThisSeason || 0);
  const isProjectCapped = totalProjects >= 2;

  const standardOptions = options.filter(o => !o.isMegaProject);
  const megaProjects = options.filter(o => o.isMegaProject);

  const getFundingBreakdown = (cost: number) => {
    const cashAvailable = Math.max(0, state.budget);
    const cashUsed = Math.min(cashAvailable, cost);
    const creditUsed = Math.max(0, cost - cashUsed);
    return { cashUsed, creditUsed };
  };

  const FacilityUpgradeBadge = ({ icon, name, current, target }: { icon: string, name: string, current: number, target: number }) => {
    const finalLevel = Math.max(current, target);
    const isUpgraded = finalLevel > current;
    
    return (
      <div className="flex flex-col bg-[#F5F4F0] border border-[#E6E3DC] rounded-xl p-3 flex-1 min-w-[120px]">
        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
          <i className={`fa-solid ${icon}`}></i> {name}
        </span>
        <div className="flex items-center gap-2 tabular-nums">
          <span className="text-[#4B5563] font-medium text-sm">Lvl {current}</span>
          {isUpgraded ? (
            <>
              <i className="fa-solid fa-arrow-right text-[10px] text-[#9A9890]"></i>
              <span className="text-emerald-700 font-bold text-sm">Lvl {finalLevel}</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-arrow-right text-[10px] text-[#9A9890]"></i>
              <span className="text-[#6B7280] font-bold text-sm">Maintained</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.1, ease: 'linear' }} 
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2.5 sm:p-4 bg-[#18191F]/45 backdrop-blur-sm text-left cursor-pointer overflow-y-auto overscroll-contain"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.98, opacity: 0 }} 
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }} 
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-[#18191F] w-full max-w-5xl rounded-[28px] shadow-[0_24px_64px_rgba(24,25,31,0.18)] border border-[#E6E3DC] relative flex flex-col max-h-[92vh] min-h-0 my-auto shrink-0 overflow-hidden cursor-default"
      >
        {/* Minimalist Header */}
        <div className="px-6 py-5 border-b border-[#E6E3DC] bg-[#FAF9F6] flex justify-between items-center shrink-0">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-sky-700 mb-1">
              Civil Engineering & Infrastructure
            </div>
            <h2 className="text-xl font-black text-[#18191F] tracking-tight">
              New Stadium Construction
            </h2>
          </div>
          <button 
            aria-label="Close modal"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white hover:bg-[#EAE7E0] text-[#6B7280] hover:text-[#18191F] flex items-center justify-center transition border border-[#E6E3DC] cursor-pointer shrink-0"
          >
            <i className="fas fa-xmark text-xs"></i>
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain custom-scrollbar flex-1 min-h-0">
          
          {/* Executive Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F5F4F0] border border-[#E6E3DC] rounded-2xl p-4 mb-5">
            <div className="flex flex-wrap gap-6 md:gap-12 tabular-nums">
              <div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mb-1">Current Capacity</div>
                <div className="text-lg font-black text-[#18191F]">{formatNum(currentCap)}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mb-1">League Standard</div>
                <div className="text-lg font-bold text-[#4B5563]">{formatNum(requiredCap)}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold mb-1">Total Liquidity (Cash + Credit)</div>
                <div className="text-lg font-black text-emerald-700">{formatMoney(availableLiquidity)}</div>
              </div>
            </div>
          </div>

          {/* External Financing Instructional Banner */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 mb-6 flex items-start gap-3 text-[#4B5563] text-xs leading-relaxed">
            <i className="fa-solid fa-building-columns text-sky-700 mt-0.5 shrink-0"></i>
            <div>
              <strong className="text-sky-900 font-semibold mr-1.5">Project Financing:</strong>
              Construction automatically utilizes your Treasury Cash first, followed by your available Credit Facility. If a project exceeds your total liquidity, you must manually secure a Bank Loan or launch an IPO from the Corporate Action Panel before authorizing the build.
            </div>
          </div>

          {/* MEGA PROJECTS SECTION */}
          {megaProjects.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-[#6B7280] mb-3 tracking-wider uppercase">Integrated Mega-Projects</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {megaProjects.map((mega) => {
                  const actualCost = Math.floor(mega.cost * mult);
                  const canAfford = availableLiquidity >= actualCost;
                  const isDowngrade = currentCap >= mega.seats;
                  const allowedTier = tier <= mega.minLeague;
                  const disabled = alreadyExpanded || isProjectCapped || !canAfford || isDowngrade || !allowedTier;
                  const { cashUsed, creditUsed } = getFundingBreakdown(actualCost);

                  return (
                    <div key={mega.seats} className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition hover:border-[#C7C4BC]">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-black text-[#18191F]">{mega.labelEn}</h4>
                          <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full tabular-nums">{formatNum(mega.seats)} Seats</span>
                        </div>
                        <p className="text-xs text-[#4B5563] leading-relaxed mb-5 min-h-[34px]">
                          {mega.descEn}
                        </p>

                        {/* Explicit Bundle Protection UI */}
                        {mega.bundle && (
                          <div className="flex flex-wrap gap-3 mb-5">
                            <FacilityUpgradeBadge icon="fa-graduation-cap" name="Academy" current={state.club.academyLevel || 1} target={mega.bundle.academyLevel} />
                            <FacilityUpgradeBadge icon="fa-heart-pulse" name="Medical" current={state.club.medicalLevel || 1} target={mega.bundle.medicalLevel} />
                          </div>
                        )}
                        
                        {/* Funding Breakdown */}
                        <div className="bg-white rounded-2xl p-3.5 border border-[#E6E3DC] mb-5 text-xs tabular-nums">
                           <div className="flex justify-between mb-1.5">
                              <span className="text-[#6B7280]">Project Cost</span>
                              <span className="font-bold text-[#18191F]">{formatMoney(actualCost)}</span>
                           </div>
                           <div className="flex justify-between mb-1.5">
                              <span className="text-[#6B7280]">Treasury Cash Used</span>
                              <span className="font-semibold text-[#4B5563]">{formatMoney(cashUsed)}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-[#6B7280]">Credit Facility Used</span>
                              <span className="font-semibold text-amber-700">{formatMoney(creditUsed)}</span>
                           </div>
                        </div>
                      </div>

                      <button
                        disabled={disabled}
                        onClick={() => onBuild(mega.seats, actualCost, mega.fanBoost, mega.bundle)}
                        className={`w-full py-3.5 rounded-2xl font-bold text-xs tracking-wide transition cursor-pointer flex items-center justify-center gap-2 ${
                          alreadyExpanded || isProjectCapped || isDowngrade || !allowedTier
                            ? 'bg-[#F5F4F0] text-[#9A9890] border border-[#E6E3DC] cursor-not-allowed'
                            : !canAfford
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 cursor-not-allowed'
                            : 'bg-[#18191F] text-white hover:bg-[#2A2C35] shadow-sm'
                        }`}
                      >
                        {alreadyExpanded ? <span>Project Completed This Season</span> 
                          : isProjectCapped ? <span>Max 2 Projects Reached (2/2)</span>
                          : isDowngrade ? <span>Current Venue is Larger</span>
                          : !allowedTier ? <span>Requires League {mega.minLeague} Status</span> 
                          : !canAfford ? <span>Insufficient Capital — Seek External Financing</span>
                          : <><i className="fas fa-hammer"></i> Authorize Project</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STANDARD PROJECTS GRID */}
          <div>
             <h3 className="text-xs font-bold text-[#6B7280] mb-3 tracking-wider uppercase">Standard Stadium Builds</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {standardOptions.map((opt) => {
                const actualCost = Math.floor(opt.cost * mult);
                const canAfford = availableLiquidity >= actualCost;
                const isDowngrade = currentCap >= opt.seats;
                const allowedTier = tier <= opt.minLeague;
                const disabled = alreadyExpanded || isProjectCapped || !canAfford || isDowngrade || !allowedTier;
                const { cashUsed, creditUsed } = getFundingBreakdown(actualCost);

                return (
                  <div key={opt.seats} className={`bg-[#FAF9F6] border rounded-2xl p-5 flex flex-col justify-between transition-all ${isDowngrade ? 'opacity-50 border-[#E6E3DC]' : 'border-[#E6E3DC] hover:border-[#C7C4BC]'}`}>
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-bold text-[#18191F]">{opt.labelEn}</h4>
                        <span className="text-xs font-bold text-sky-700 tabular-nums">{formatNum(opt.seats)}</span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] leading-relaxed mb-4 min-h-[34px]">
                        {opt.descEn}
                      </p>

                      <div className="space-y-1.5 text-[11px] mb-5 tabular-nums">
                        <div className="flex justify-between text-[#4B5563]">
                          <span>Cost</span>
                          <span className="font-bold text-[#18191F]">{formatMoney(actualCost)}</span>
                        </div>
                        <div className="flex justify-between text-[#4B5563]">
                          <span>Credit Used</span>
                          <span className="font-semibold text-amber-700">{formatMoney(creditUsed)}</span>
                        </div>
                        <div className="flex justify-between text-[#4B5563]">
                          <span>Fan Growth</span>
                          <span className="font-semibold text-emerald-700">+{formatNum(opt.fanBoost)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={disabled}
                      onClick={() => onBuild(opt.seats, actualCost, opt.fanBoost)}
                      className={`w-full py-2.5 rounded-xl font-bold text-[11px] tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        alreadyExpanded || isProjectCapped || isDowngrade || !allowedTier
                          ? 'bg-[#F5F4F0] text-[#9A9890] border border-[#E6E3DC] cursor-not-allowed'
                          : !canAfford
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 cursor-not-allowed'
                          : 'bg-[#18191F] hover:bg-[#2A2C35] text-white'
                      }`}
                    >
                      {alreadyExpanded ? <span>Already Built</span> 
                        : isProjectCapped ? <span>Max 2 Projects (2/2)</span>
                        : isDowngrade ? <span>Downgrade Blocked</span>
                        : !allowedTier ? <span>Requires Lvl {opt.minLeague}</span> 
                        : !canAfford ? <span>Seek Financing</span>
                        : <span>Authorize Build</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};
