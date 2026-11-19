import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { GameState, Language, BoardVision } from '../types';
import { calculateClubReputation } from '../data/gameConstants';
import { generateBoardVision } from '../engine/boardVisionEngine';
import { getPressureLevelMeta } from '../engine/pressureEngine';

interface ClubImpactModalProps {
  state: GameState;
  lang: Language;
  initialTab?: 'roadmap' | 'dressing_room';
  onClose: () => void;
  onOpenTeamBonding: () => void;
  onOpenClubProfile: () => void;
  onOpenPressureModal?: () => void;
}

export const ClubImpactModal: React.FC<ClubImpactModalProps> = ({
  state,
  initialTab = 'roadmap',
  onClose,
  onOpenTeamBonding,
  onOpenClubProfile,
  onOpenPressureModal,
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'dressing_room'>(initialTab);

  const impactScore = state.clubImpactScore ?? 50;
  const morale = state.club.morale ?? 100;
  const shields = state.immunityShields ?? 0;
  const rep = Math.min(100, calculateClubReputation(state.club.baseOvr, state.club.tier));
  
  const targetPos = state.boardTargetFinish || 15;
  const targetText = `Top ${targetPos} Finish`;

  // Board confidence categorization (Warm Editorial Daylight)
  let impactStatus = {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Untouchable Authority',
    desc: 'The board has absolute confidence in your managerial vision. Full backing guaranteed.'
  };
  if (impactScore < 20) {
    impactStatus = {
      badge: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
      title: 'Job at Risk (Critical)',
      desc: 'Board patience has worn out. Sacking is imminent unless results and morale improve immediately.'
    };
  } else if (impactScore < 40) {
    impactStatus = {
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
      title: 'Board Warning',
      desc: 'Board confidence is fragile. Another dip in performance could trigger an ultimatum.'
    };
  } else if (impactScore < 65) {
    impactStatus = {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      title: 'Stable & Supported',
      desc: 'The board respects your steady hand. Meeting seasonal milestones will increase trust.'
    };
  } else if (impactScore < 85) {
    impactStatus = {
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      title: 'Strong Command',
      desc: 'High managerial authority. The board grants leeway in key financial and sporting calls.'
    };
  }

  // Morale categorization (Warm Editorial Daylight)
  let moraleStatus = {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Euphoric & United',
    icon: 'fa-face-laugh-beam'
  };
  if (morale < 40) {
    moraleStatus = {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Dressing Room Mutiny',
      icon: 'fa-face-frown'
    };
  } else if (morale < 65) {
    moraleStatus = {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'Subdued & Anxious',
      icon: 'fa-face-meh'
    };
  } else if (morale < 85) {
    moraleStatus = {
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      label: 'Focused & Driven',
      icon: 'fa-face-smile'
    };
  }

  // Board Roadmap computation
  const boardVision: BoardVision = useMemo(() => {
    const raw = state.boardVision || generateBoardVision(state.club, state.year || 2026);
    const totalProjectsDone = (state.stadiumExpandedThisSeason || 0) + (state.academyUpgradedThisSeason || 0) + (state.medicalUpgradedThisSeason || 0);
    const effectiveUpgrades = Math.max(state.facilitiesUpgradedThisSeason || 0, totalProjectsDone);

    return {
      ...raw,
      objectives: raw.objectives.map(obj => {
        if (obj.id === 'obj_upgrade_facs') {
          const val = Math.min(obj.targetValue, Math.max(obj.currentValue || 0, effectiveUpgrades));
          return { ...obj, currentValue: val, isCompleted: val >= obj.targetValue };
        }
        if (obj.id === 'obj_academy_lvl') {
          const val = Math.max(obj.currentValue || 0, state.club.academyLevel || 1);
          return { ...obj, currentValue: val, isCompleted: val >= obj.targetValue };
        }
        return {
          ...obj,
          isCompleted: obj.isCompleted || (obj.currentValue >= obj.targetValue)
        };
      })
    };
  }, [state.boardVision, state.club, state.year, state.facilitiesUpgradedThisSeason, state.stadiumExpandedThisSeason, state.academyUpgradedThisSeason, state.medicalUpgradedThisSeason]);

  const completedMilestones = boardVision.objectives.filter(o => o.isCompleted || o.currentValue >= o.targetValue).length;
  const totalMilestones = boardVision.objectives.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 backdrop-blur-sm bg-[#18191F]/45 overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-[#18191F] border border-[#E6E3DC] rounded-[28px] sm:rounded-[32px] w-full max-w-3xl overflow-hidden shadow-[0_24px_64px_rgba(24,25,31,0.18)] flex flex-col max-h-[92vh] relative text-left"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] flex justify-between items-center shrink-0 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-center text-[#18191F] text-base shrink-0 shadow-xs">
              <i className="fas fa-landmark"></i>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-0.5">
                Executive Brief
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#18191F] leading-tight">
                Boardroom & Dressing Room
              </h2>
              <p className="text-xs text-[#6B7280] font-normal mt-0.5">
                Club Authority, Strategic Vision & First-Team Harmony
              </p>
            </div>
          </div>
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-[#EFECE4] text-[#6B7280] hover:text-[#18191F] transition border border-[#E6E3DC] cursor-pointer"
          >
            <i className="fas fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Executive Cockpit Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-5 bg-[#F5F4F0] border-b border-[#E6E3DC] shrink-0 relative z-10">
          {/* Tile 1: Board Trust */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E6E3DC] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              <span>Board Trust</span>
              <i className="fas fa-shield-halved text-sky-700"></i>
            </div>
            <div className="flex items-baseline gap-1 my-1.5 tabular-nums">
              <span className="text-2xl sm:text-3xl font-bold text-[#18191F]">{impactScore}</span>
              <span className="text-xs text-[#6B7280] font-normal">/100</span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border text-center truncate ${impactStatus.badge}`}>
              {impactStatus.title}
            </span>
          </div>

          {/* Tile 2: Squad Morale */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E6E3DC] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              <span>Squad Morale</span>
              <i className="fas fa-users text-sky-700"></i>
            </div>
            <div className="flex items-baseline gap-1 my-1.5 tabular-nums">
              <span className="text-2xl sm:text-3xl font-bold text-sky-700">{morale}%</span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border text-center truncate ${moraleStatus.badge}`}>
              {moraleStatus.label}
            </span>
          </div>

          {/* Tile 3: Immunity Shields */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E6E3DC] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              <span>Job Security</span>
              <i className="fas fa-award text-amber-600"></i>
            </div>
            <div className="flex items-baseline gap-1 my-1.5 tabular-nums">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-700">{shields}</span>
              <span className="text-xs text-[#6B7280] font-normal">Shields</span>
            </div>
            <span className="text-[10px] font-normal text-[#6B7280] truncate">
              {shields > 0 ? 'Protected from sack' : 'Standard review'}
            </span>
          </div>

          {/* Tile 4: Club Reputation */}
          <div
            onClick={() => {
              onClose();
              onOpenClubProfile();
            }}
            className="p-3.5 rounded-2xl bg-white hover:bg-[#FAF9F6] border border-[#E6E3DC] hover:border-[#18191F]/30 transition cursor-pointer flex flex-col justify-between group shadow-xs"
            title="Click to view full Club Details"
          >
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] group-hover:text-[#18191F]">
              <span>Club Prestige</span>
              <i className="fas fa-arrow-up-right-from-square text-[9px] text-sky-700 opacity-70 group-hover:opacity-100"></i>
            </div>
            <div className="flex items-baseline gap-1 my-1.5 tabular-nums">
              <span className="text-2xl sm:text-3xl font-bold text-[#18191F]">{rep}</span>
              <span className="text-xs text-[#6B7280] font-normal">/100</span>
            </div>
            <span className="text-[10px] font-normal text-[#6B7280] truncate">
              Tier {state.club.tier} · {state.club.baseOvr} OVR
            </span>
          </div>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-3 sm:px-6 sm:py-3 bg-[#FAF9F6] border-b border-[#E6E3DC] shrink-0 relative z-10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'bg-[#18191F] text-white shadow-xs'
                : 'bg-white text-[#4B5563] hover:text-[#18191F] hover:bg-[#EFECE4] border border-[#E6E3DC]'
            }`}
          >
            <i className="fas fa-compass text-xs"></i>
            <span>Boardroom & Vision ({completedMilestones}/{totalMilestones})</span>
          </button>
          <button
            onClick={() => setActiveTab('dressing_room')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dressing_room'
                ? 'bg-[#18191F] text-white shadow-xs'
                : 'bg-white text-[#4B5563] hover:text-[#18191F] hover:bg-[#EFECE4] border border-[#E6E3DC]'
            }`}
          >
            <i className="fas fa-users-viewfinder text-xs"></i>
            <span>Dressing Room & Culture</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 relative z-10 bg-white">
          {activeTab === 'roadmap' ? (
            /* TAB 1: BOARDROOM & VISION */
            <div className="space-y-4">
              {/* Board Stance & Strategic Philosophy Card */}
              <div className="bg-[#FAF9F6] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E6E3DC] relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-sky-700 border border-[#E6E3DC] flex items-center justify-center text-sm shadow-xs shrink-0">
                      <i className="fas fa-scroll"></i>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#18191F]">{boardVision.title}</h3>
                      <div className="text-xs text-[#6B7280] font-normal">
                        {boardVision.durationYears || 3}-Year Strategic Club Mandate
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1.5">
                      <i className="fas fa-clock text-[10px]"></i>
                      Season {boardVision.currentYearOfVision || 1} of {boardVision.durationYears || 3}
                    </span>
                  </div>
                </div>

                {/* Boardroom Assessment Summary */}
                <div className="p-3.5 rounded-xl bg-white border border-[#E6E3DC] flex items-start gap-3">
                  <i className="fas fa-circle-info text-sky-700 text-xs mt-0.5 shrink-0"></i>
                  <div className="text-xs text-[#4B5563] leading-snug">
                    <span className="font-semibold text-[#18191F] mr-1.5">{impactStatus.title}:</span>
                    {impactStatus.desc}
                  </div>
                </div>

                {/* Media & Board Pressure Meter */}
                {(() => {
                  const pScore = state.mediaPressure ?? 15;
                  const pMeta = getPressureLevelMeta(pScore);
                  return (
                    <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#E6E3DC] space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${pMeta.badgeClass}`}>
                            <i className={`fas ${pMeta.icon} text-[9px]`}></i>
                            <span className="tabular-nums">Media Heat: {pMeta.label} ({pScore}/100)</span>
                          </span>
                        </div>
                        {onOpenPressureModal && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenPressureModal();
                            }}
                            className="text-[11px] font-bold text-sky-700 hover:text-[#18191F] transition cursor-pointer flex items-center gap-1"
                          >
                            <span>Open Press Briefing</span>
                            <i className="fas fa-chevron-right text-[9px]"></i>
                          </button>
                        )}
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EFECE4] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pMeta.barClass}`}
                          style={{ width: `${Math.max(4, Math.min(100, pScore))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#6B7280] leading-snug">
                        {state.pressureContext?.headline || 'Public scrutiny rises when league standings slip behind board expectations and cools when targets are met.'}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Strategic Milestones */}
              <div className="bg-[#FAF9F6] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E6E3DC]">
                <div className="flex items-center justify-between mb-4 gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      Strategic Milestones
                    </div>
                    <div className="text-sm font-semibold text-[#18191F] mt-0.5">
                      Progress toward 3-Year Vision Completion
                    </div>
                  </div>
                  <span className="text-xs tabular-nums font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 shrink-0">
                    {completedMilestones} / {totalMilestones} Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {boardVision.objectives.map((obj) => {
                    const isDone = obj.isCompleted || obj.currentValue >= obj.targetValue;
                    return (
                      <div
                        key={obj.id}
                        className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                          isDone
                            ? 'bg-emerald-50/80 border-emerald-200'
                            : 'bg-white border-[#E6E3DC]'
                        }`}
                      >
                        {/* Step Checkbox / Icon */}
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-[#F5F4F0] text-[#6B7280] border border-[#E6E3DC]'
                          }`}
                        >
                          {isDone ? <i className="fas fa-check text-[11px]"></i> : <i className="fas fa-hourglass-half text-[10px]"></i>}
                        </div>

                        {/* Objective Content */}
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-[#18191F] leading-snug block">
                            {obj.desc}
                          </span>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E6E3DC] text-[11px]">
                            <span className="text-[#6B7280]">Status</span>
                            {isDone ? (
                              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                <i className="fas fa-circle-check text-[10px]"></i>
                                Achieved
                              </span>
                            ) : (
                              <span className="tabular-nums font-semibold text-sky-700">
                                {obj.currentValue} of {obj.targetValue} {obj.unit || ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stakes & Annual Target Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Vision Reward */}
                <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 text-xs">
                    <i className="fas fa-gift"></i>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      Full Vision Reward
                    </div>
                    <div className="text-xs font-semibold text-[#18191F] mt-0.5">
                      {boardVision.reward.desc}
                    </div>
                  </div>
                </div>

                {/* Annual Target */}
                <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0 text-xs">
                    <i className="fas fa-bullseye"></i>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      Current Season Board Target
                    </div>
                    <div className="text-xs font-semibold text-[#18191F] mt-0.5">
                      {targetText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: DRESSING ROOM & CULTURE */
            <div className="space-y-4">
              {/* Dressing Room Sentiment Card */}
              <div className="bg-[#FAF9F6] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E6E3DC]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-sky-700 border border-[#E6E3DC] flex items-center justify-center text-sm shadow-xs">
                      <i className={`fas ${moraleStatus.icon}`}></i>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#18191F]">Squad Harmony & Vibe</h3>
                      <div className="text-xs text-[#6B7280] font-normal">
                        First-Team Cohesion, Morale & Dressing Room Atmosphere
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenTeamBonding();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <i className="fas fa-beer-mug-empty text-xs"></i>
                    <span>Team Bonding Event</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-xl bg-white border border-[#E6E3DC]">
                    <div className="text-[10px] uppercase font-semibold text-[#6B7280]">Dressing Room Spirit</div>
                    <div className="text-sm font-bold text-[#18191F] mt-1">{moraleStatus.label}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#E6E3DC]">
                    <div className="text-[10px] uppercase font-semibold text-[#6B7280]">Tactical Compliance</div>
                    <div className="text-sm font-bold text-emerald-700 mt-1">High Buy-In</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#E6E3DC]">
                    <div className="text-[10px] uppercase font-semibold text-[#6B7280]">Squad Fitness & Health</div>
                    <div className="text-sm font-bold text-sky-700 mt-1 tabular-nums">
                      Lvl {state.club.medicalLevel || 1} Medical Dept
                    </div>
                  </div>
                </div>
              </div>

              {/* Head Coach Fit & Tactical Boost */}
              <div className="bg-[#FAF9F6] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E6E3DC]">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">
                  Tactical Leadership
                </div>
                <div className="text-sm font-bold text-[#18191F] mb-3">
                  Head Coach Dressing Room Assessment
                </div>

                {state.currentCoach ? (
                  <div className="p-4 rounded-2xl bg-white border border-[#E6E3DC] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] text-sky-700 border border-[#E6E3DC] flex items-center justify-center text-sm font-semibold">
                        <i className="fas fa-user-tie"></i>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#18191F]">{state.currentCoach.name}</div>
                        <div className="text-xs text-[#6B7280] font-normal">
                          Style: <span className="text-sky-700 font-semibold">{state.currentCoach.style}</span> · <span className="tabular-nums">{state.currentCoach.contractYearsLeft || 0}</span> Yrs Remaining
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-xl text-xs font-semibold border tabular-nums ${
                        state.currentCoach.ovrBoost >= 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {state.currentCoach.ovrBoost >= 0 ? `+${state.currentCoach.ovrBoost}` : state.currentCoach.ovrBoost} OVR Tactical Boost
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white border border-[#E6E3DC] text-center text-xs text-[#6B7280] italic">
                    No head coach currently appointed. Tactical synergy is unboosted.
                  </div>
                )}
              </div>

              {/* Dynamic Arch Rivalry Record */}
              {state.currentRival && (
                <div className="bg-[#FAF9F6] rounded-2xl sm:rounded-3xl border border-[#E6E3DC] overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-[#E6E3DC]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center text-sm shrink-0">
                          <i className="fas fa-fire"></i>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-rose-700">
                            Arch Rival Derby
                          </div>
                          <div className="text-base font-bold text-[#18191F]">
                            {state.currentRival.name}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-[#4B5563] uppercase bg-white px-2.5 py-1 rounded-lg border border-[#E6E3DC] shrink-0">
                        Head-to-Head Derby
                      </span>
                    </div>

                    <p className="text-xs text-[#4B5563] italic mt-3 leading-relaxed">
                      "{state.currentRival.descEn || state.currentRival.descDe || 'Fierce regional competitors contesting local bragging rights.'}"
                    </p>
                  </div>

                  {/* Head-to-head score row */}
                  <div className="p-4 bg-white flex items-center justify-around text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-700 leading-none tabular-nums">
                        {state.currentRival.wins}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-[#6B7280] mt-1">Wins</div>
                    </div>
                    <div className="text-[#D6D3CB] text-base font-light">·</div>
                    <div>
                      <div className="text-2xl font-bold text-[#4B5563] leading-none tabular-nums">
                        {state.currentRival.draws}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-[#6B7280] mt-1">Draws</div>
                    </div>
                    <div className="text-[#D6D3CB] text-base font-light">·</div>
                    <div>
                      <div className="text-2xl font-bold text-rose-700 leading-none tabular-nums">
                        {state.currentRival.losses}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-[#6B7280] mt-1">Losses</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
