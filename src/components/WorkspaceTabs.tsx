import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CameraAngle,
  Club,
  GameState,
  Language,
  MatchdayOutcome,
  PitchDesignId,
  StadiumArchitectureStyle,
  StadiumPolicy,
  WorkspaceTab,
} from '../types';
import {
  PITCH_DESIGNS,
  STADIUM_STYLE_OPTIONS,
  SupercupEligibility,
  buildLiveStandingsSnapshot,
  getEffectiveStadiumName,
  resolveClubStadiumStyle,
} from '../engine/liveSimVisualEngine';
import {
  calculateExpectedAttendance,
  formatMoney,
  formatNum,
  getClubMaxBankLoan,
  getCountryMult,
  getCreditLimit,
  getLeagueInfo,
  getLeagueScaledVal,
  isReserveClub,
  isTacticalSynergy,
} from '../data/gameConstants';
import { calculateSponsorDealOffers } from '../engine/commercialEngine';
import { getLoanProgress } from '../engine/creditFacilityEngine';
import { getIncubatorCapacity } from '../engine/incubatorEngine';
import { calculateYouthCohortOvr, evaluateYouthChampionshipEntry } from '../engine/ovrAndYouthHelpers';
import { StadiumBowl3D } from './StadiumBowl3D';
import { ClubCampus3D } from './ClubCampus3D';
import {
  computeCommercialLevelFromFacilities,
  getStadiumArchitectureRemodelCostK,
  isStadiumStyleOwned,
} from '../engine/campusAndBowlGeometry';
import { ShotEfficiencyCard } from './ShotEfficiencyCard';
import { SeasonHistoryTable } from './SeasonHistoryTable';
import { ClubLogo } from './ClubLogo';
import { NamingRightsOffer } from '../engine/liveSimVisualEngine';
import { getStadiumOptions } from './StadiumModal';
import { CompetitionLogo } from './CompetitionLogo';
import {
  buildSeasonSnapshotOptions,
  resolveSeasonSnapshotView,
  resolveStandingsForSeasonSnapshot,
} from '../utils/seasonSnapshotHelper';
import { evaluateTrophyHunterMilestones } from '../engine/dynastyMilestonesEngine';

export interface InlineSimState {
  active: boolean;
  currentIdx: number;
  startIdx: number;
  targetEndIdx: number;
  isSecondHalf: boolean;
  isFastMode: boolean;
  subTick: number;
  schedule: MatchdayOutcome[];
  totalMatchdays: number;
}

interface WorkspaceTabsProps {
  activeTab: WorkspaceTab;
  onSelectTab?: (tab: WorkspaceTab) => void;
  state: GameState;
  clubsDb: Club[];
  lang: Language;
  isModActive: boolean;
  financials: {
    wages: number;
    estRevenue: number;
    net: number;
    expectedAtt?: number;
    avgAtt?: number;
    matchdayRevenue?: number;
    namingRightsIncome?: number;
  };
  actionCosts: {
    stadium: number;
    bidReg: number;
    bidKey: number;
    youth: number;
    sponsor: number;
    academy?: number;
    medical?: number;
    bonding?: number;
  };
  inlineSim: InlineSimState;
  supercupEligibility: SupercupEligibility | null;
  cameraAngle: CameraAngle;
  onCameraChange: (cam: CameraAngle) => void;
  onSimulateSeason: () => void;
  onToggleSimSpeed: () => void;
  onSkipInlineSim: () => void;
  onOpenSupercup: () => void;
  onSelectPitchDesign: (id: PitchDesignId) => void;
  onSelectStadiumStyle?: (style: StadiumArchitectureStyle | 'auto', costK?: number) => void;
  onSelectStadiumPolicy: (policy: StadiumPolicy) => void;
  onToggleVipHospitality?: () => void;
  onOpenNamingRights: () => void;
  onOpenAttendanceAnalytics: () => void;
  onSponsorSelect: (type: 0 | 1 | 2) => void;
  onOpenLedger: () => void;
  onOpenBankLoan: () => void;
  onOpenMarketing: () => void;
  onOpenIpo: () => void;
  onOpenTable: (initialSeason?: 'current' | number) => void;
  onOpenTransfers: () => void;
  onOpenPhilosophy: () => void;
  onOpenCoachMarket: () => void;
  onOpenCoachStaff?: () => void;
  onOpenCoachDossier: (coach: any) => void;
  onOpenOvrModal: () => void;
  onOpenYouthModal: () => void;
  onOpenAcademyModal: () => void;
  onOpenMedicalModal: () => void;
  onOpenTeamBonding: () => void;
  onOpenWinterCamp: () => void;
  onOpenYouthChampionship: () => void;
  onOpenStadiumModal: () => void;
  onOpenNewBuildModal: () => void;
  onOpenCustomizeClub: () => void;
  onOpenManagerProfile: () => void;
  onOpenClubImpact: () => void;
  onOpenBoardMandate: () => void;
  onOpenManagerSkills: () => void;
  onOpenMediaHeat: () => void;
  onOpenJobMarket: () => void;
  onOpenClubProfile: () => void;
  onOpenWorldCupHistory: () => void;
  onOpenTrophyCabinet: () => void;
  onOpenSquadRegistration?: () => void;
  onOpenMorale?: () => void;
  onOpenFanBonding?: () => void;
  onOpenPrestige?: () => void;
  onOpenShields?: () => void;
  onResign: () => void;
  recentSponsorName?: string;
}

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({
  activeTab,
  onSelectTab,
  state,
  clubsDb,
  lang,
  isModActive,
  financials,
  actionCosts,
  inlineSim,
  supercupEligibility,
  cameraAngle,
  onCameraChange,
  onSimulateSeason,
  onToggleSimSpeed,
  onSkipInlineSim,
  onOpenSupercup,
  onSelectPitchDesign,
  onSelectStadiumStyle,
  onSelectStadiumPolicy,
  onToggleVipHospitality,
  onOpenNamingRights,
  onOpenAttendanceAnalytics,
  onSponsorSelect,
  onOpenLedger,
  onOpenBankLoan,
  onOpenMarketing,
  onOpenIpo,
  onOpenTable,
  onOpenTransfers,
  onOpenPhilosophy,
  onOpenCoachMarket,
  onOpenCoachStaff,
  onOpenCoachDossier,
  onOpenOvrModal,
  onOpenYouthModal,
  onOpenAcademyModal,
  onOpenMedicalModal,
  onOpenTeamBonding,
  onOpenWinterCamp,
  onOpenYouthChampionship,
  onOpenStadiumModal,
  onOpenNewBuildModal,
  onOpenCustomizeClub,
  onOpenManagerProfile,
  onOpenClubImpact,
  onOpenBoardMandate,
  onOpenManagerSkills,
  onOpenMediaHeat,
  onOpenJobMarket,
  onOpenClubProfile,
  onOpenWorldCupHistory,
  onOpenTrophyCabinet,
  onOpenSquadRegistration,
  onOpenMorale,
  onOpenFanBonding,
  onOpenPrestige,
  onOpenShields,
  onResign,
  recentSponsorName,
}) => {
  const effectiveStadiumName = useMemo(
    () => getEffectiveStadiumName(state.club, state.stadiumNamingRights),
    [state.club, state.stadiumNamingRights]
  );

  // Active live match telemetry during simulation, Mid-Season Dilemma, post-MD34 wrap-up, or Winter Break pause
  const pendingSchedule =
    state.pendingSeasonState?.matchdaySchedule ||
    state.pendingSeasonState?.schedule ||
    [];
  const activeSchedule =
    inlineSim.schedule.length > 0
      ? inlineSim.schedule
      : pendingSchedule;
  const totalMds = inlineSim.active
    ? inlineSim.totalMatchdays
    : state.pendingSeasonState?.totalMatchdays || inlineSim.totalMatchdays || 34;

  const playedMatchdays = inlineSim.active
    ? Math.max(0, inlineSim.currentIdx + 1)
    : state.pendingSeasonState && inlineSim.currentIdx > 0 && activeSchedule.length > 0
    ? Math.min(activeSchedule.length, inlineSim.currentIdx + 1)
    : state.seasonPhase === 'mid'
    ? Math.floor(totalMds / 2)
    : 0;

  const currentOutcome =
    playedMatchdays > 0 ? activeSchedule[playedMatchdays - 1] : undefined;

  const liveStandings = useMemo(
    () => buildLiveStandingsSnapshot(state, clubsDb, playedMatchdays, currentOutcome),
    [state, clubsDb, playedMatchdays, currentOutcome]
  );

  // Opponent & W-D-L records for embedded stadium Matchup + Scoreboard HUD
  const previewOpponent = useMemo(() => {
    if (inlineSim.active && currentOutcome) {
      const matched = (clubsDb || []).find((c) => c.id === currentOutcome.opponentId);
      return {
        id: currentOutcome.opponentId,
        name: currentOutcome.opponentName,
        color: matched?.color || currentOutcome.opponentColor || '#DC2626',
        logo: matched?.logo || currentOutcome.opponentLogo,
        fallbackLogo: matched?.fallbackLogo,
      };
    }
    if (supercupEligibility?.opponent) {
      return {
        id: supercupEligibility.opponent.id,
        name: supercupEligibility.opponent.name,
        color: supercupEligibility.opponent.color,
        logo: supercupEligibility.opponent.logo,
        fallbackLogo: supercupEligibility.opponent.fallbackLogo,
      };
    }
    const nextFixture = activeSchedule[playedMatchdays];
    if (nextFixture) {
      const matched = (clubsDb || []).find((c) => c.id === nextFixture.opponentId);
      return {
        id: nextFixture.opponentId,
        name: nextFixture.opponentName,
        color: matched?.color || nextFixture.opponentColor || '#DC2626',
        logo: matched?.logo || nextFixture.opponentLogo,
        fallbackLogo: matched?.fallbackLogo,
      };
    }
    const fallbackPeer =
      liveStandings.find((r) => !r.isUser) ||
      (clubsDb || []).find((c) => (c.country || 'GER') === (state.club.country || 'GER') && c.tier === state.club.tier && c.id !== state.club.id);
    if (fallbackPeer) {
      return {
        id: fallbackPeer.id,
        name: fallbackPeer.name,
        color: fallbackPeer.color || '#DC2626',
        logo: fallbackPeer.logo,
      };
    }
    return {
      id: 99901,
      name: 'League Rival',
      color: '#DC2626',
    };
  }, [inlineSim.active, currentOutcome, supercupEligibility, activeSchedule, playedMatchdays, clubsDb, liveStandings, state.club.country, state.club.tier, state.club.id]);

  const [infraPreviewCap, setInfraPreviewCap] = useState<number | null>(null);
  const [pendingRemodelStyle, setPendingRemodelStyle] = useState<StadiumArchitectureStyle | null>(null);
  const [selectedSnapshotHistoryIdx, setSelectedSnapshotHistoryIdx] = useState<number | null>(null);
  const [snapshotYearMenuOpen, setSnapshotYearMenuOpen] = useState(false);
  const snapshotYearMenuRef = useRef<HTMLDivElement | null>(null);

  // Reset selected snapshot season and unpaid architecture preview whenever a new season starts or club changes
  useEffect(() => {
    setSelectedSnapshotHistoryIdx(null);
    setSnapshotYearMenuOpen(false);
    setPendingRemodelStyle(null);
  }, [state.year, state.club.id]);

  // Close the Season Snapshot year picker on outside click or Escape
  useEffect(() => {
    if (!snapshotYearMenuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (snapshotYearMenuRef.current && !snapshotYearMenuRef.current.contains(e.target as Node)) {
        setSnapshotYearMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSnapshotYearMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [snapshotYearMenuOpen]);

  const seasonSnapshotOptions = useMemo(
    () => buildSeasonSnapshotOptions(state),
    [state]
  );

  // Season Snapshot stats (live W-D-L during sim, previous season preview before kickoff, or any archived season selected by the user)
  const snapshotStats = useMemo(
    () =>
      resolveSeasonSnapshotView({
        state,
        selectedHistoryIndex: selectedSnapshotHistoryIdx,
        playedMatchdays,
        currentOutcome,
        activeSchedule,
        totalMds,
        clubsDb,
      }),
    [state, selectedSnapshotHistoryIdx, playedMatchdays, currentOutcome, activeSchedule, totalMds, clubsDb]
  );

  // Standings card stays 100% synchronized with the selected live or archived season (league, year, emblem, and rows)
  const standingsCardData = useMemo(
    () =>
      resolveStandingsForSeasonSnapshot({
        state,
        snapshot: snapshotStats,
        liveStandings,
        playedMatchdays,
        clubsDb,
        isModActive,
      }),
    [state, snapshotStats, liveStandings, playedMatchdays, clubsDb, isModActive]
  );
  const standingsPreview = standingsCardData.previewRows;

  const userRank = liveStandings.find((r) => r.isUser)?.pos ?? state.history?.[state.history.length - 1]?.pos ?? 1;
  const maxAtt = Math.max(100, state.club.stadium || 10000);
  const avgAtt =
    financials.expectedAtt ??
    financials.avgAtt ??
    calculateExpectedAttendance({
      club: state.club,
      tier: state.club.tier,
      year: state.year,
      ownership: state.ownership,
      stadiumPolicy: state.stadiumPolicy,
    });
  const maxLoanAmount = getClubMaxBankLoan(state.club, state.budget, state.reputation);
  const loanProgress = state.bankLoan ? getLoanProgress(state.bankLoan) : null;
  const youthCap = getIncubatorCapacity(state.club.academyLevel || 1);
  const valuationK = Math.max(5000, Math.round((state.club.baseOvr || 65) * 420 + state.budget + (state.club.stadium || 10000) * 0.6));
  const stadiumOptions = useMemo(() => getStadiumOptions(state.club), [state.club]);
  const baseExpandCost = actionCosts.stadium || stadiumOptions[0]?.cost || 2500;
  const progressPct = Math.round((playedMatchdays / Math.max(1, totalMds)) * 100);
  const totalTrophiesCount = state.totals?.trophies || 0;
  const legacyMilestoneSummary = useMemo(() => evaluateTrophyHunterMilestones(state), [state]);
  const roadmapTotal = state.boardVision?.objectives?.length || 4;
  const roadmapDone = (state.boardVision?.objectives || []).filter(
    (o) => o.isCompleted || o.currentValue >= o.targetValue
  ).length;
  const shields =
    (state.immunityShields || 0) +
    (state.boardVision?.reward?.immunityBonus && roadmapDone >= roadmapTotal ? 1 : 0);

  const policyChoices: Array<{
    id: StadiumPolicy;
    title: string;
    badge: string;
    desc: string;
  }> = [
    {
      id: 'balanced',
      title: 'Balanced Tradition',
      badge: 'All-Round Equilibrium',
      desc: 'Stable turnstile renewals & harmonious atmosphere across all stands with standard ticket yield. Normal event distribution.',
    },
    {
      id: 'ultras',
      title: 'Fortress Curva',
      badge: '+1 Squad OVR',
      desc: '+1 Squad OVR immediately & vocal terrace home fortress. Note: Lacks corporate executive revenue, triggering significantly more money-issue & budget events.',
    },
    {
      id: 'commercial',
      title: 'Executive Hospitality',
      badge: '+18% Matchday Cash',
      desc: '+18% Matchday & Hospitality Revenue boost every season. Note: Alienates active supporters, triggering significantly more Ultras protests & boycott events.',
    },
    {
      id: 'family',
      title: 'Grassroots & Family',
      badge: '+10% Youth & +25% Fans',
      desc: '+10% Youth Academy Graduate Promotion Chance & +25% Accelerated Fanbase Growth per season. Normal event distribution.',
    },
  ];

  // Shared Treasury Card Builder
  const renderTreasuryCard = (compact = false) => (
    <div className="editorial-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-extrabold text-[#18191F]">Treasury</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            state.budget < 0
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-[#F6F5F1] text-[#6B7280] border border-[#E6E3DC]'
          }`}
        >
          {state.isPublic || state.ipoDone ? 'Listed PLC' : state.budget < 0 ? 'In Debt' : 'Solvent'}
        </span>
      </div>
      <div className="text-[11px] font-medium text-[#6B7280]">Available balance</div>
      <div
        className={`text-2xl font-black tracking-tight tabular-nums mt-0.5 ${
          state.budget < 0 ? 'text-rose-700' : 'text-[#18191F]'
        }`}
      >
        {formatMoney(state.budget)}
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-3">
        <div className="editorial-well p-2 sm:p-2.5 min-w-0 flex flex-col justify-between">
          <div className="text-[10px] font-medium text-[#6B7280] leading-tight truncate">Revenue</div>
          <div className="text-[10.5px] sm:text-[11px] xl:text-xs font-extrabold text-emerald-700 tabular-nums whitespace-nowrap leading-tight mt-1">
            {`+${formatMoney(Math.abs(financials.estRevenue))}`}
          </div>
        </div>
        <div className="editorial-well p-2 sm:p-2.5 min-w-0 flex flex-col justify-between">
          <div className="text-[10px] font-medium text-[#6B7280] leading-tight truncate">Expenses</div>
          <div className="text-[10.5px] sm:text-[11px] xl:text-xs font-extrabold text-rose-700 tabular-nums whitespace-nowrap leading-tight mt-1">
            {`-${formatMoney(Math.abs(financials.wages))}`}
          </div>
        </div>
        <div className="editorial-well p-2 sm:p-2.5 min-w-0 flex flex-col justify-between">
          <div className="text-[10px] font-medium text-[#6B7280] leading-tight truncate">Net</div>
          <div
            className={`text-[10.5px] sm:text-[11px] xl:text-xs font-extrabold tabular-nums whitespace-nowrap leading-tight mt-1 ${
              financials.net >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {`${financials.net >= 0 ? '+' : ''}${formatMoney(financials.net)}`}
          </div>
        </div>
      </div>

      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mt-3.5`}>
        <button
          type="button"
          onClick={onOpenLedger}
          className="w-full py-2 px-3 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-bold transition cursor-pointer"
        >
          {compact ? 'Ledger' : 'Inspect Financial Ledger'}
        </button>
        {compact && (
          <button
            type="button"
            data-testid="overview-treasury-sponsors-btn"
            onClick={() => (onSelectTab ? onSelectTab('commercial') : onOpenNamingRights())}
            className="w-full py-2 px-3 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer"
          >
            Sponsors
          </button>
        )}
      </div>
    </div>
  );

  // =========================================================================
  // 1. OVERVIEW TAB (3-Column Dashboard + Inline Live Simulation — Flush Aligned)
  // =========================================================================
  if (activeTab === 'overview') {
    const leagueName = getLeagueInfo(state.club.tier || 1, state.club.country || 'GER').name;
    const seasonYearSpan = `${state.year}–${String((state.year + 1) % 100).padStart(2, '0')}`;
    const coachInitials = state.currentCoach?.name
      ? state.currentCoach.name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase()
      : 'HC';

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch" data-testid="overview-3col-grid">
        {/* LEFT COLUMN (3 cols on lg, stretches to align top & bottom flush) */}
        <div className="order-2 lg:order-1 lg:col-span-3 flex flex-col gap-4 h-full" data-testid="overview-col-left">
          {/* Season Snapshot */}
          <div className="editorial-card p-4 sm:p-5 relative" data-testid="season-snapshot-card">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ClubLogo
                  club={
                    snapshotStats.isHistorical
                      ? {
                          id: snapshotStats.clubId ?? state.club.id,
                          name: snapshotStats.clubName,
                          color: snapshotStats.clubColor,
                          logo: snapshotStats.clubLogo,
                          fallbackLogo: snapshotStats.clubFallbackLogo,
                        }
                      : state.club
                  }
                  size={24}
                  isModActive={isModActive}
                  className="w-6 h-6 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-extrabold text-[#18191F] leading-tight">
                      Season snapshot
                    </h3>
                    {snapshotStats.isHistorical && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[9px] font-extrabold uppercase tracking-wide text-amber-800">
                        Archive
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-medium text-[#6B7280] truncate">
                    {snapshotStats.clubName}
                  </div>
                </div>
              </div>

              {/* Clickable Season Year Switcher */}
              <div className="relative shrink-0" ref={snapshotYearMenuRef}>
                <button
                  type="button"
                  data-testid="season-snapshot-year-btn"
                  aria-haspopup="listbox"
                  aria-expanded={snapshotYearMenuOpen}
                  title="Browse current and previous seasons"
                  onClick={() => setSnapshotYearMenuOpen((open) => !open)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-extrabold tabular-nums transition cursor-pointer ${
                    snapshotStats.isHistorical
                      ? 'bg-[#18191F] border-[#18191F] text-white hover:bg-[#2A2C35]'
                      : 'bg-[#F6F5F1] hover:bg-[#EAE7E0] border-[#E6E3DC] hover:border-[#18191F]/40 text-[#18191F]'
                  }`}
                >
                  <span>{snapshotStats.yearSpan}</span>
                  <i
                    className={`fa-solid fa-chevron-down text-[9px] transition-transform ${
                      snapshotYearMenuOpen ? 'rotate-180' : ''
                    } ${snapshotStats.isHistorical ? 'text-white/80' : 'text-[#6B7280]'}`}
                  />
                </button>

                {snapshotYearMenuOpen && (
                  <div
                    role="listbox"
                    aria-label="Select season snapshot"
                    data-testid="season-snapshot-year-menu"
                    className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white border border-[#E6E3DC] shadow-[0_18px_48px_rgba(24,25,31,0.16)] z-30 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-[#E6E3DC] bg-[#F6F5F1] flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                        Season History
                      </span>
                      <span className="text-[10px] font-semibold text-[#6B7280] tabular-nums">
                        {Math.max(0, seasonSnapshotOptions.length - 1)} past
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto overscroll-contain p-1.5 space-y-1">
                      {seasonSnapshotOptions.map((opt) => {
                        const isSelected =
                          opt.historyIndex === selectedSnapshotHistoryIdx;
                        const statusLabel =
                          opt.status === 'C'
                            ? 'Champ'
                            : opt.status === 'P'
                            ? 'Prom'
                            : opt.status === 'R'
                            ? 'Rel'
                            : null;
                        return (
                          <button
                            key={opt.isCurrent ? 'current' : `hist-${opt.historyIndex}`}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            data-testid={
                              opt.isCurrent
                                ? 'season-snapshot-opt-current'
                                : `season-snapshot-opt-${opt.year}`
                            }
                            onClick={() => {
                              setSelectedSnapshotHistoryIdx(opt.historyIndex);
                              setSnapshotYearMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-[#18191F] text-white'
                                : 'hover:bg-[#F6F5F1] text-[#18191F]'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-extrabold tabular-nums">
                                  {opt.yearSpan}
                                </span>
                                {opt.isCurrent ? (
                                  <span
                                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                                      isSelected
                                        ? 'bg-emerald-500/25 text-emerald-200'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    }`}
                                  >
                                    Live
                                  </span>
                                ) : statusLabel ? (
                                  <span
                                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                                      opt.status === 'R'
                                        ? isSelected
                                          ? 'bg-rose-500/25 text-rose-200'
                                          : 'bg-rose-50 text-rose-700'
                                        : isSelected
                                        ? 'bg-amber-400/25 text-amber-200'
                                        : 'bg-amber-50 text-amber-800'
                                    }`}
                                  >
                                    {statusLabel}
                                  </span>
                                ) : null}
                              </div>
                              <div
                                className={`text-[10px] truncate mt-0.5 ${
                                  isSelected ? 'text-white/75' : 'text-[#6B7280]'
                                }`}
                              >
                                {opt.clubName} · {opt.leagueName}
                              </div>
                            </div>
                            <div className="text-right shrink-0 tabular-nums">
                              {opt.isCurrent ? (
                                <span
                                  className={`text-[10px] font-bold ${
                                    isSelected ? 'text-white/80' : 'text-[#6B7280]'
                                  }`}
                                >
                                  Current
                                </span>
                              ) : (
                                <>
                                  <div className="text-xs font-black">#{opt.pos}</div>
                                  <div
                                    className={`text-[10px] font-semibold ${
                                      isSelected ? 'text-white/75' : 'text-[#6B7280]'
                                    }`}
                                  >
                                    {opt.pts} pts
                                  </div>
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {seasonSnapshotOptions.length === 1 && (
                        <div className="px-2.5 py-2 text-[11px] text-[#6B7280] leading-snug">
                          Complete your first campaign to browse past seasons here.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-end justify-between mt-3.5">
              <div>
                <div className="text-[11px] font-medium text-[#6B7280]">Win rate</div>
                <div
                  className="text-3xl font-black text-[#18191F] tabular-nums leading-none mt-1"
                  data-testid="season-snapshot-winrate"
                >
                  {snapshotStats.winRateExact.toFixed(1)}
                  <span className="text-base font-extrabold">%</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-medium text-[#6B7280]">Record</div>
                <div
                  className="text-lg font-black text-[#18191F] tabular-nums leading-tight mt-0.5"
                  data-testid="season-snapshot-record"
                >
                  {snapshotStats.w}–{snapshotStats.d}–{snapshotStats.l}
                </div>
                <div
                  className="text-[10px] font-medium text-[#6B7280] truncate max-w-[165px]"
                  data-testid="season-snapshot-subtitle"
                >
                  {snapshotStats.subtitle}
                </div>
              </div>
            </div>

            {snapshotStats.isHistorical && (
              <div
                className="mt-3 grid grid-cols-3 gap-1.5"
                data-testid="season-snapshot-archive-strip"
              >
                <div className="editorial-well px-2 py-1.5">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-[#6B7280]">
                    Goals
                  </div>
                  <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                    {snapshotStats.gf ?? 0}–{snapshotStats.ga ?? 0}
                  </div>
                </div>
                <div className="editorial-well px-2 py-1.5">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-[#6B7280]">
                    Squad OVR
                  </div>
                  <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                    {snapshotStats.ovr ?? '—'}
                  </div>
                </div>
                <div className="editorial-well px-2 py-1.5">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-[#6B7280]">
                    Avg Att
                  </div>
                  <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                    {snapshotStats.att ? formatNum(snapshotStats.att) : '—'}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3.5 pt-3 border-t border-[#E6E3DC]">
              <div className="flex items-center justify-between text-[10px] font-semibold text-[#6B7280] mb-2">
                <span>
                  {snapshotStats.isHistorical ? 'Final five games' : 'Last five games'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">{snapshotStats.playedCount} played</span>
                  {snapshotStats.isHistorical && (
                    <button
                      type="button"
                      data-testid="season-snapshot-back-live"
                      onClick={() => setSelectedSnapshotHistoryIdx(null)}
                      className="text-[10px] font-extrabold text-[#18191F] underline underline-offset-2 hover:text-emerald-700 cursor-pointer"
                    >
                      Back to {seasonYearSpan}
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const res = snapshotStats.last5[idx];
                  return (
                    <span
                      key={idx}
                      className={`h-7 rounded-xl text-[10px] font-black flex items-center justify-center ${
                        res === 'W'
                          ? 'bg-emerald-600 text-white'
                          : res === 'D'
                          ? 'bg-[#EAE7E0] text-[#4B5563]'
                          : res === 'L'
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#F6F5F1] text-[#9CA3AF] border border-[#EAE7E0]'
                      }`}
                    >
                      {res || '—'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Treasury */}
          {renderTreasuryCard(true)}

          {/* Standings Preview (Fills bottom of Left column so bottom edge aligns flush) */}
          <div
            className="editorial-card p-4 sm:p-5 flex-1 flex flex-col justify-between"
            data-testid="live-standings-card"
            data-standings-year={standingsCardData.year}
            data-standings-tier={standingsCardData.tier}
            data-standings-country={standingsCardData.country}
            data-standings-historical={standingsCardData.isHistorical ? 'true' : 'false'}
          >
            <div>
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CompetitionLogo
                    kind="league"
                    country={standingsCardData.country}
                    tier={standingsCardData.tier}
                    isModActive={isModActive}
                    alt="Competition emblem"
                    className="w-6 h-6 object-contain shrink-0 drop-shadow-xs"
                    data-testid="live-standings-comp-logo"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-extrabold text-[#18191F] truncate">Standings</h3>
                      {standingsCardData.isHistorical && (
                        <span
                          data-testid="standings-archive-badge"
                          className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[9px] font-extrabold uppercase tracking-wide text-amber-800 shrink-0"
                        >
                          {standingsCardData.yearSpan}
                        </span>
                      )}
                    </div>
                    <p
                      data-testid="live-standings-subtitle"
                      className="text-[10px] font-medium text-[#6B7280] tabular-nums truncate"
                    >
                      {standingsCardData.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="live-standings-full-table-btn"
                  onClick={() =>
                    onOpenTable(
                      selectedSnapshotHistoryIdx !== null ? selectedSnapshotHistoryIdx : 'current'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[10px] font-extrabold text-[#18191F] transition cursor-pointer shrink-0"
                >
                  Full table →
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase text-[#6B7280]">
                  <span># Club</span>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="w-6 text-center">GD</span>
                    <span className="w-6 text-right">PTS</span>
                  </div>
                </div>
                {standingsPreview.map((row, idx) => (
                  <React.Fragment key={`${row.id}-${row.pos}`}>
                    {idx > 0 && row.pos > standingsPreview[idx - 1].pos + 1 && (
                      <div className="flex items-center gap-2 px-2.5 py-0.5 text-[10px] font-bold text-[#9CA3AF] select-none">
                        <span className="tracking-widest">···</span>
                        <div className="flex-1 border-t border-dashed border-[#E6E3DC]" />
                      </div>
                    )}
                    <div
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-2xl text-xs transition ${
                        row.isUser
                          ? 'bg-[#18191F] text-white font-bold shadow-xs'
                          : 'text-[#18191F] hover:bg-[#F6F5F1]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                        <span
                          className={`w-4 text-[11px] font-extrabold tabular-nums shrink-0 ${
                            row.isUser
                              ? 'text-white'
                              : row.isPromotionZone
                              ? 'text-emerald-700'
                              : row.isRelegationZone
                              ? 'text-rose-700'
                              : 'text-[#6B7280]'
                          }`}
                        >
                          {row.pos}
                        </span>
                        <ClubLogo
                          name={row.name}
                          id={row.id}
                          color={row.color}
                          logo={row.logo}
                          isModActive={isModActive}
                          size={18}
                          className="w-4 h-4 shrink-0"
                        />
                        <span className="truncate text-[11px] font-bold">{row.name}</span>
                      </div>
                      <div className="flex items-center gap-3 tabular-nums text-[11px] shrink-0">
                        <span className={`w-6 text-center ${row.isUser ? 'text-zinc-300' : 'text-[#6B7280]'}`}>
                          {row.gd}
                        </span>
                        <span className="w-6 text-right font-black">{row.pts}</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (6 cols on lg, stretches to align top & bottom flush) */}
        <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col gap-4 h-full" data-testid="overview-col-center">
          <div className="space-y-2" data-testid="center-match-card">
            {(() => {
              const liveUserRow = liveStandings.find((r) => r.isUser);
              const userRec =
                playedMatchdays > 0 || Boolean(state.pendingSeasonFinishData)
                  ? liveUserRow
                    ? `${liveUserRow.w}–${liveUserRow.d}–${liveUserRow.l}`
                    : `${snapshotStats.w}–${snapshotStats.d}–${snapshotStats.l}`
                  : '0–0–0';
              const oppRow = liveStandings.find((r) => r.id === previewOpponent.id);
              const oppRec =
                playedMatchdays > 0 && oppRow ? `${oppRow.w}–${oppRow.d}–${oppRow.l}` : '0–0–0';

              const isMidSimOrMidSeason =
                inlineSim.active || (playedMatchdays > 0 && playedMatchdays < totalMds);
              const realizedScheduleAvg =
                activeSchedule.length > 0 && activeSchedule.every((m) => typeof m.attendance === 'number' && m.attendance > 0)
                  ? Math.round(
                      activeSchedule.reduce((sum, m) => sum + (m.attendance || avgAtt), 0) /
                        activeSchedule.length
                    )
                  : avgAtt;
              const displayedAttendance =
                isMidSimOrMidSeason && currentOutcome?.attendance
                  ? currentOutcome.attendance
                  : playedMatchdays >= totalMds && !inlineSim.active
                  ? realizedScheduleAvg
                  : avgAtt;

              return (
                <StadiumBowl3D
                  club={state.club}
                  namingRights={state.stadiumNamingRights}
                  pitchDesignId={state.pitchDesign}
                  stadiumStyle={state.stadiumStyle}
                  stadiumPolicy={state.stadiumPolicy || 'balanced'}
                  vipHospitalityActive={Boolean(state.vipHospitality || state.stadiumPolicy === 'commercial')}
                  attendance={displayedAttendance}
                  capacity={maxAtt}
                  isLive={inlineSim.active}
                  currentOutcome={currentOutcome}
                  currentMatchday={playedMatchdays}
                  totalMatchdays={totalMds}
                  subTick={inlineSim.subTick}
                  opponentName={previewOpponent.name}
                  opponentColor={previewOpponent.color}
                  opponentClub={previewOpponent}
                  userGoals={currentOutcome?.userGoals ?? 0}
                  oppGoals={currentOutcome?.oppGoals ?? 0}
                  userRecord={userRec}
                  oppRecord={oppRec}
                  tacticLabel={state.tactic || 'Total Football'}
                  supercupEligibility={supercupEligibility}
                  seasonPhase={state.seasonPhase}
                  isFastMode={inlineSim.isFastMode}
                  onSimulateSeason={onSimulateSeason}
                  onOpenSupercup={onOpenSupercup}
                  onToggleSimSpeed={onToggleSimSpeed}
                  onSkipInlineSim={onSkipInlineSim}
                  isModActive={isModActive}
                  activeSponsorName={recentSponsorName}
                  cameraAngle={cameraAngle}
                  onCameraChange={onCameraChange}
                />
              );
            })()}

            {/* Live Matchday Progress Track (Visible cleanly during sim / winter break) */}
            {(inlineSim.active || playedMatchdays > 0) && (
              <div className="w-full h-1.5 rounded-full bg-[#EAE7E0] overflow-hidden">
                <div
                  className="h-full bg-[#18191F] transition-all duration-200"
                  style={{ width: `${Math.max(5, progressPct)}%` }}
                />
              </div>
            )}
          </div>

          {/* Season & Club History Archive (Stretches to align bottom edge) */}
          <SeasonHistoryTable
            state={state}
            lang={lang}
            clubsDb={clubsDb}
            isModActive={isModActive}
            onOpenWorldCupHistory={onOpenWorldCupHistory}
            onOpenDossier={onOpenClubProfile}
            onOpenTrophyCabinet={onOpenTrophyCabinet}
            onOpenTable={() => onOpenTable('current')}
          />
        </div>

        {/* RIGHT COLUMN (3 cols on lg, stretches to align top & bottom flush) */}
        <div className="order-3 lg:col-span-3 flex flex-col gap-4 h-full" data-testid="overview-col-right">
          <ShotEfficiencyCard
            tactic={state.tactic}
            subTick={inlineSim.subTick}
            schedule={activeSchedule}
            upToIdx={Math.max(-1, playedMatchdays - 1)}
            clubOvr={state.club.baseOvr || 70}
            playedMatchdays={playedMatchdays}
            clubColor={state.club.color}
            onChangeTactic={onOpenPhilosophy}
          />

          {/* Club Health */}
          <div className="editorial-card p-4 sm:p-5" data-testid="club-health-card">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <ClubLogo
                  club={state.club}
                  size={20}
                  isModActive={isModActive}
                  className="w-5 h-5 shrink-0"
                />
                <h3 className="text-xs font-extrabold text-[#18191F] truncate">Club Health</h3>
              </div>
              <button
                type="button"
                onClick={onOpenClubImpact}
                className="text-[10px] font-semibold text-[#6B7280] hover:text-[#18191F] tabular-nums cursor-pointer shrink-0"
              >
                {totalTrophiesCount} trophies · {formatNum(state.club.fanBase || 0)} fans
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenOvrModal}
                className="editorial-well p-3 text-left hover:border-[#18191F] transition cursor-pointer"
              >
                <div className="text-[10px] font-semibold text-[#6B7280]">OVR</div>
                <div className="text-xl font-black text-[#18191F] tabular-nums leading-tight mt-0.5">
                  {state.club.baseOvr}
                </div>
                <div className="text-[10px] font-medium text-[#6B7280] mt-0.5">Out of 100</div>
              </button>
              <button
                type="button"
                onClick={onOpenClubImpact}
                className="editorial-well p-3 text-left hover:border-[#18191F] transition cursor-pointer"
              >
                <div className="text-[10px] font-semibold text-[#6B7280]">Impact</div>
                <div className="text-xl font-black text-[#18191F] tabular-nums leading-tight mt-0.5">
                  {state.clubImpactScore ?? 50}
                </div>
                <div className="text-[10px] font-medium text-[#6B7280] mt-0.5">
                  {shields} {shields === 1 ? 'shield' : 'shields'}
                </div>
              </button>
              <button
                type="button"
                onClick={onOpenJobMarket}
                className="editorial-well p-3 text-left hover:border-[#18191F] transition cursor-pointer"
              >
                <div className="text-[10px] font-semibold text-[#6B7280]">Reputation</div>
                <div className="text-xl font-black text-[#18191F] tabular-nums leading-tight mt-0.5">
                  {state.reputation ?? 50}
                </div>
                <div className="text-[10px] font-medium text-[#6B7280] mt-0.5">Out of 100</div>
              </button>
              <button
                type="button"
                onClick={onOpenMediaHeat}
                className="editorial-well p-3 text-left hover:border-[#18191F] transition cursor-pointer"
              >
                <div className="text-[10px] font-semibold text-[#6B7280]">Media Heat</div>
                <div
                  className={`text-xl font-black tabular-nums leading-tight mt-0.5 ${
                    (state.mediaPressure ?? 15) >= 65
                      ? 'text-rose-700'
                      : (state.mediaPressure ?? 15) >= 40
                      ? 'text-amber-700'
                      : 'text-[#18191F]'
                  }`}
                >
                  {state.mediaPressure ?? 15}
                </div>
                <div className="text-[10px] font-medium text-[#6B7280] mt-0.5">
                  {(state.mediaPressure ?? 15) >= 65 ? 'Hot · High' : (state.mediaPressure ?? 15) >= 40 ? 'Warm · Watch' : 'Calm · Low'}
                </div>
              </button>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-[#E6E3DC]">
              <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                <span className="text-[#6B7280]">Board confidence</span>
                <span className="text-[#18191F] tabular-nums">
                  {Math.min(100, Math.max(10, state.clubImpactScore ?? 50))}/100
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EAE7E0] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (state.clubImpactScore ?? 50) >= 60
                      ? 'bg-emerald-600'
                      : (state.clubImpactScore ?? 50) >= 35
                      ? 'bg-amber-500'
                      : 'bg-rose-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, state.clubImpactScore ?? 50))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tactics & Squad (Fills bottom of Right column so bottom buttons align flush with Left & Center) */}
          <div
            className="editorial-card p-4 sm:p-5 flex-1 flex flex-col justify-between"
            data-testid="tactics-squad-card"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-extrabold text-[#18191F]">Tactics &amp; Squad</h3>
                <button
                  type="button"
                  onClick={onOpenManagerSkills}
                  className="text-[11px] font-extrabold text-[#18191F] hover:underline cursor-pointer tabular-nums"
                >
                  {state.skillPoints || 0} MP →
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  state.currentCoach ? onOpenCoachDossier(state.currentCoach) : onOpenCoachMarket()
                }
                className="w-full editorial-well p-3 flex items-center justify-between gap-2.5 hover:border-[#18191F] transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full text-white text-[11px] font-black flex items-center justify-center shrink-0 ${
                      state.currentCoach ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                  >
                    {coachInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-[#18191F] truncate">
                      {state.currentCoach ? state.currentCoach.name : 'Head Coach Vacant'}
                    </div>
                    <div
                      className={`text-[10px] font-medium truncate ${
                        state.currentCoach ? 'text-[#6B7280]' : 'text-amber-700 font-semibold'
                      }`}
                    >
                      {state.currentCoach
                        ? `${state.currentCoach.style} · Yr ${state.seasonCount || (state.history?.length || 0) + 1}`
                        : 'Interim Caretaker (-4 OVR) · Hire →'}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-[#18191F] tabular-nums">
                    {snapshotStats.winRate}%
                  </div>
                  <div className="text-[9px] font-medium text-[#6B7280]">Win %</div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={onOpenSquadRegistration || onOpenTransfers}
                  className="editorial-well p-2.5 text-left hover:border-[#18191F] transition cursor-pointer"
                >
                  <div className="text-[10px] text-[#6B7280] font-medium">Squad Size</div>
                  <div className="text-xs font-black text-[#18191F] tabular-nums mt-0.5">
                    {state.club.squadSize ?? 24} / 50
                  </div>
                </button>
                <button
                  type="button"
                  onClick={onOpenYouthModal}
                  className="editorial-well p-2.5 text-left hover:border-[#18191F] transition cursor-pointer"
                >
                  <div className="text-[10px] text-[#6B7280] font-medium">Youth Team Size</div>
                  <div className="text-xs font-black text-[#18191F] tabular-nums mt-0.5">
                    {(state.youthPipeline || []).length} / {youthCap}
                  </div>
                </button>
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280] font-medium">Active tactic</div>
                  <div className="text-xs font-extrabold text-[#18191F] truncate mt-0.5">
                    {state.tactic || 'Total Football'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenPhilosophy}
                  className="editorial-well p-2.5 text-left hover:border-[#18191F] transition cursor-pointer"
                >
                  <div className="text-[10px] text-[#6B7280] font-medium">System</div>
                  <div className="text-xs font-extrabold text-[#18191F] truncate mt-0.5">
                    Change tactic →
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#E6E3DC]">
              <button
                type="button"
                onClick={onOpenCoachStaff || onOpenCoachMarket}
                className="w-full py-2 px-3 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer"
              >
                Coach Overview
              </button>
              <button
                type="button"
                onClick={onOpenTransfers}
                className="w-full py-2 px-3 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-bold transition cursor-pointer"
              >
                Transfers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. COMMERCIAL TAB (3-Column Flush Aligned: Treasury/Loans | 3D HQ + Sponsors | Marketing/IPO)
  // =========================================================================
  if (activeTab === 'commercial') {
    const pitchLeft = Math.max(0, 3 - (state.sponsorsPitchedThisSeason || 0));
    const acadLvl = Math.max(1, Math.min(5, state.club.academyLevel || 1));
    const medLvl = Math.max(1, Math.min(5, state.club.medicalLevel || 1));
    const commercialLevel = computeCommercialLevelFromFacilities(acadLvl, medLvl);
    const sponsorOffers = calculateSponsorDealOffers(state);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch" data-testid="commercial-3col-grid">
        {/* Left Column */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full">
          {renderTreasuryCard(false)}

          {/* Loans Card (Stretches to align bottom edge flush) */}
          <div className="editorial-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#18191F]">Loans</h3>
                <span className="text-[10px] font-semibold text-[#6B7280]">10 · 15 · 25 yr</span>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-2">
                {state.bankLoan ? 'Remaining Principal' : 'Available credit line'}
              </div>
              <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
                {state.bankLoan
                  ? formatMoney(state.bankLoan.principal)
                  : `+${formatMoney(maxLoanAmount)}`}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280]">15-yr est. service</div>
                  <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                    {state.bankLoan
                      ? `${formatMoney(state.bankLoan.annualPayment)}/yr`
                      : `${formatMoney(Math.round(maxLoanAmount * 0.085))}/yr`}
                  </div>
                </div>
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280]">Facility status</div>
                  <div
                    className={`text-xs font-extrabold mt-0.5 ${
                      state.bankLoan ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {loanProgress ? `${loanProgress.percentPaidOff}% Repaid` : 'Debt-free'}
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenBankLoan}
              className="w-full mt-4 py-2.5 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer"
            >
              Open Credit Facility
            </button>
          </div>
        </div>

        {/* Center Column */}
        <div className="lg:col-span-6 flex flex-col gap-4 h-full">
          <ClubCampus3D
            scene="hq"
            club={state.club}
            commercialLevel={commercialLevel}
            academyLevel={acadLvl}
            medicalLevel={medLvl}
            isPublic={Boolean(state.isPublic)}
            estRevenueK={financials.estRevenue}
            valuationK={valuationK}
            isModActive={isModActive}
            primaryActionLabel="Financial Ledger"
            secondaryActionLabel="PLC Shares"
            onPrimaryAction={onOpenLedger}
            onSecondaryAction={onOpenIpo}
          />

          {/* Sponsorship Deals w/ Direct-Linked Cards (Stretches to align bottom edge flush) */}
          <div className="editorial-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
            {(() => {
              const pitchedCount = Math.min(3, state.sponsorsPitchedThisSeason || 0);
              const quotaExhausted = pitchLeft <= 0;
              const isPerfActive = Boolean(
                state.activePerformanceSponsor || state.activePerformanceSponsorTarget
              );
              const isPerfLocked = Boolean(
                quotaExhausted ||
                  state.performanceSponsorBlockedNextSeason ||
                  state.performanceSponsorSignedThisSeason ||
                  isPerfActive
              );
              const isReserveGround = isReserveClub(state.club.name);

              return (
                <>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#18191F]">Sponsorship Deals</h3>
                        <p className="text-[11px] font-medium text-[#6B7280] tabular-nums">
                          {pitchLeft > 0
                            ? `Select a package below · ${pitchLeft} pitch${pitchLeft === 1 ? '' : 'es'} left`
                            : 'Season sponsor pitch quota filled (3/3)'}
                        </p>
                      </div>
                      <div
                        data-testid="sponsor-quota-badge"
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold tabular-nums border ${
                          quotaExhausted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-[#F6F5F1] text-[#18191F] border-[#E6E3DC]'
                        }`}
                      >
                        {state.sponsorIncome && state.sponsorIncome > 0
                          ? `+${formatMoney(state.sponsorIncome)} · ${pitchedCount}/3 Pitched`
                          : `${pitchedCount}/3 Pitched`}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        data-testid="sponsor-card-standard"
                        disabled={quotaExhausted}
                        onClick={() => onSponsorSelect(0)}
                        className={`editorial-well p-3 text-left transition ${
                          quotaExhausted
                            ? 'opacity-55 cursor-not-allowed'
                            : 'hover:border-[#18191F] cursor-pointer'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-[#6B7280]">Standard Partner</div>
                        <div className="text-sm font-black text-[#18191F] tabular-nums mt-0.5">
                          +{formatMoney(sponsorOffers.standardVal)}
                        </div>
                        <div className="text-[10px] font-semibold text-[#6B7280] mt-0.5">
                          {quotaExhausted ? 'Quota filled' : 'Guaranteed upfront'}
                        </div>
                      </button>

                      <button
                        type="button"
                        data-testid="sponsor-card-mega"
                        disabled={quotaExhausted}
                        onClick={() => onSponsorSelect(1)}
                        className={`editorial-well p-3 text-left transition ${
                          quotaExhausted
                            ? 'opacity-55 cursor-not-allowed'
                            : 'hover:border-[#18191F] cursor-pointer'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-[#6B7280]">Corporate Megadeal</div>
                        <div className="text-sm font-black text-emerald-700 tabular-nums mt-0.5">
                          +{formatMoney(sponsorOffers.megaVal)}
                        </div>
                        <div className="text-[10px] font-semibold text-[#6B7280] mt-0.5">
                          {quotaExhausted
                            ? 'Quota filled'
                            : `${Math.round(sponsorOffers.megaChance * 100)}% approval chance`}
                        </div>
                      </button>

                      <button
                        type="button"
                        data-testid="sponsor-card-performance"
                        disabled={isPerfLocked}
                        onClick={() => onSponsorSelect(2)}
                        className={`p-3 rounded-2xl border text-left transition ${
                          isPerfActive
                            ? 'bg-emerald-50 border-emerald-200 cursor-not-allowed'
                            : isPerfLocked
                            ? 'bg-[#F6F5F1] border-[#E6E3DC] opacity-55 cursor-not-allowed'
                            : 'bg-[#F6F5F1] border-[#E6E3DC] hover:border-[#18191F] cursor-pointer'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-[#6B7280]">Performance Bonus</div>
                        <div className="text-sm font-black text-emerald-700 tabular-nums mt-0.5">
                          +{formatMoney(sponsorOffers.perfTotalVal)}
                        </div>
                        <div className="text-[10px] font-semibold text-[#6B7280] mt-0.5 truncate">
                          {isPerfActive
                            ? 'Active · Top 4 Target'
                            : state.performanceSponsorBlockedNextSeason
                            ? 'Blocked this season'
                            : quotaExhausted
                            ? 'Quota filled'
                            : `+${formatMoney(sponsorOffers.perfUpfrontVal)} upfront · Top 4`}
                        </div>
                      </button>

                      <button
                        type="button"
                        data-testid="sponsor-card-naming"
                        disabled={isReserveGround}
                        onClick={onOpenNamingRights}
                        className={`p-3 rounded-2xl border text-left transition ${
                          isReserveGround
                            ? 'bg-[#F6F5F1] border-[#E6E3DC] opacity-55 cursor-not-allowed'
                            : state.stadiumNamingRights
                            ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 cursor-pointer'
                            : 'bg-[#F6F5F1] border-[#E6E3DC] hover:border-[#18191F] cursor-pointer'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-[#6B7280]">Stadium Naming</div>
                        <div className="text-sm font-black text-emerald-700 tabular-nums mt-0.5">
                          {isReserveGround
                            ? 'Unavailable'
                            : state.stadiumNamingRights
                            ? `+${formatMoney(state.stadiumNamingRights.annualPayoutK)}/yr`
                            : `+${formatMoney(sponsorOffers.namingAnnualPreviewK)}/yr`}
                        </div>
                        <div className="text-[10px] font-semibold text-[#6B7280] truncate mt-0.5">
                          {isReserveGround
                            ? 'Parent club venue'
                            : state.stadiumNamingRights
                            ? `${state.stadiumNamingRights.partnerName} (${state.stadiumNamingRights.yearsLeft}y)`
                            : 'Name the stadium'}
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E6E3DC] flex items-center justify-between text-[11px] font-semibold text-[#6B7280]">
                    <span>
                      Commercial HQ Architecture: Level {commercialLevel}/5 · Academy L{acadLvl} & Medical L{medLvl}
                    </span>
                    <button
                      type="button"
                      onClick={onOpenLedger}
                      className="font-extrabold text-[#18191F] hover:underline cursor-pointer"
                    >
                      Inspect Ledger →
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full">
          {/* Marketing & PR */}
          <div className="editorial-card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#18191F]">Marketing & PR</h3>
              <span className="text-[11px] font-semibold text-[#6B7280]">
                {(state.mediaPressure ?? 15) >= 60 ? 'Hot press' : 'Calm press'}
              </span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-2">Active supporter base</div>
            <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
              {formatNum(state.club.fanBase || 0)}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="editorial-well p-2.5">
                <div className="text-[10px] text-[#6B7280]">Brand stature</div>
                <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                  {state.reputation ?? 50} / 100
                </div>
              </div>
              <div className="editorial-well p-2.5">
                <div className="text-[10px] text-[#6B7280]">Media heat</div>
                <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                  {state.mediaPressure ?? 15} / 100
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-3.5">
              <button
                type="button"
                onClick={onOpenMarketing}
                className="col-span-2 py-2 px-3 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-bold transition cursor-pointer"
              >
                Campaigns & PR
              </button>
              <button
                type="button"
                data-testid="commercial-fan-event-btn"
                onClick={onOpenFanBonding || onOpenMediaHeat}
                className="py-2 px-2 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer truncate"
              >
                {state.fanBondingThisSeason ? 'Fan Done' : 'Fan Event'}
              </button>
            </div>
          </div>

          {/* Go Public / IPO (Stretches to align bottom edge flush) */}
          <div className="editorial-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#18191F]">Go Public / IPO</h3>
                <span
                  className={`text-[11px] font-bold ${
                    state.isPublic ? 'text-emerald-700' : 'text-[#6B7280]'
                  }`}
                >
                  {state.isPublic ? 'Listed PLC' : 'Private Club'}
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-2">Estimated equity valuation</div>
              <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
                {formatMoney(valuationK)}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280]">Live share price</div>
                  <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                    €{(state.stockPrice || 14.5).toFixed(2)}
                  </div>
                </div>
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280]">Market Status</div>
                  <div className="text-xs font-extrabold text-emerald-700 mt-0.5">
                    {state.isPublic ? 'Trading' : 'Eligible'}
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenIpo}
              className="w-full mt-4 py-2.5 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer"
            >
              Open Stock Exchange
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. SQUAD TAB (3-Column Flush Aligned: Squad/Youth Tourney | 3D Training Pitch + Transfers | Academy/Retreat)
  // =========================================================================
  if (activeTab === 'squad') {
    const readyCount = (state.youthPipeline || []).filter((p) => p.timer <= 0 && p.status !== 'loaned').length;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch" data-testid="squad-3col-grid">
        {/* Left Column */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full">
          <div className="editorial-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ClubLogo club={state.club} size={28} isModActive={isModActive} className="w-7 h-7 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-[#18191F]">Squad Overview</div>
                  <div className="text-[10px] text-[#6B7280] truncate">{state.club.name}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-[#F6F5F1] border border-[#E6E3DC] text-[10px] font-black text-[#18191F] tabular-nums shrink-0">
                OVR {state.club.baseOvr}
              </span>
            </div>

            <div className="text-[11px] text-[#6B7280] mt-3">Transfer Funds Available</div>
            <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
              {formatMoney(state.budget)}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="editorial-well p-2.5">
                <div className="text-[10px] text-[#6B7280]">Team OVR</div>
                <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                  {state.club.baseOvr} OVR
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenSquadRegistration || onOpenTransfers}
                className="editorial-well p-2.5 text-left hover:border-[#18191F] transition cursor-pointer"
              >
                <div className="text-[10px] text-[#6B7280]">Squad size</div>
                <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                  {state.club.squadSize ?? 24} / 50
                </div>
              </button>
              <button
                type="button"
                onClick={onOpenMorale || onOpenTeamBonding}
                className="editorial-well p-2.5 text-left hover:border-[#18191F] transition cursor-pointer"
              >
                <div className="text-[10px] text-[#6B7280]">Morale</div>
                <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                  {state.club.morale ?? 80}%
                </div>
              </button>
              <div className="editorial-well p-2.5">
                <div className="text-[10px] text-[#6B7280]">Youth slots</div>
                <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                  {(state.youthPipeline || []).length} / {youthCap}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenOvrModal}
              className="w-full mt-3.5 py-2.5 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-bold transition cursor-pointer"
            >
              OVR & Squad Breakdown
            </button>
          </div>

          {/* Youth Tournament (Stretches to align bottom edge flush) */}
          {(() => {
            const youthCohortOvr = calculateYouthCohortOvr(state);
            const entryCheck = evaluateYouthChampionshipEntry(state);
            const isPlayed = entryCheck.reasonCode === 'already_played';
            const isMidSeasonLocked = entryCheck.reasonCode === 'not_preseason';
            return (
              <div className="editorial-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-[#18191F]">Youth Tournament</h3>
                    <span className="text-[10px] font-bold text-[#6B7280] tabular-nums">
                      {readyCount} Ready
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B7280] mt-2">U19 National Championship</div>
                  <div className="text-xl font-black text-[#18191F] tabular-nums mt-0.5">
                    {youthCohortOvr} Cohort OVR
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="editorial-well p-2.5">
                      <div className="text-[10px] text-[#6B7280]">Champion bonus</div>
                      <div className="text-xs font-extrabold text-emerald-700 mt-0.5">+2 OVR Cohort</div>
                    </div>
                    <div className="editorial-well p-2.5">
                      <div className="text-[10px] text-[#6B7280]">Youth titles</div>
                      <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                        {state.youthTrophies || 0} won
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenYouthChampionship}
                  className={`w-full mt-4 py-2.5 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                    isPlayed || isMidSeasonLocked
                      ? 'bg-[#FAF9F6] border-[#E6E3DC] text-[#6B7280] hover:bg-[#EFECE4]'
                      : 'bg-[#F6F5F1] hover:bg-[#EAE7E0] border-[#E6E3DC] text-[#18191F]'
                  }`}
                >
                  {isPlayed
                    ? `Completed Season ${state.year} · Next: ${state.year + 1}`
                    : isMidSeasonLocked
                    ? `Pre-Season Only · Next: ${state.year + 1}`
                    : 'Enter U19 Championship'}
                </button>
              </div>
            );
          })()}
        </div>

        {/* Center Column */}
        <div className="lg:col-span-6 flex flex-col gap-4 h-full">
          <ClubCampus3D
            scene="training"
            club={state.club}
            academyLevel={state.club.academyLevel || 1}
            medicalLevel={state.club.medicalLevel || 1}
            squadSize={state.club.squadSize ?? 24}
            maxSquadSize={50}
            morale={state.club.morale ?? 80}
            youthCount={(state.youthPipeline || []).length}
            activeTactic={state.tactic || 'Total Football'}
            pitchDesignId={state.pitchDesign}
            activeSponsorName={recentSponsorName}
            isModActive={isModActive}
            primaryActionLabel="Transfers"
            secondaryActionLabel="Tactics"
            onPrimaryAction={onOpenTransfers}
            onSecondaryAction={onOpenPhilosophy}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Transfer Market Card */}
            <div className="editorial-card p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#18191F]">Transfer Market</h3>
                    <p className="text-[11px] text-[#6B7280]">
                      Sign starters, marquee key players & negotiate sales.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#6B7280] tabular-nums shrink-0">
                    {(state.regTransfersThisSeason || 0) + (state.keyTransfersThisSeason || 0) + (state.winterTransfers || 0) + (state.winterKeyTransfers || 0)} moves
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  <div className="editorial-well p-2">
                    <div className="text-[9.5px] text-[#6B7280]">Starter</div>
                    <div className="text-xs font-black text-[#18191F] tabular-nums mt-0.5 truncate">
                      {formatMoney(actionCosts.bidReg)}
                    </div>
                  </div>
                  <div className="editorial-well p-2">
                    <div className="text-[9.5px] text-[#6B7280]">Key Bid</div>
                    <div className="text-xs font-black text-[#18191F] tabular-nums mt-0.5 truncate">
                      {formatMoney(actionCosts.bidKey)}
                    </div>
                  </div>
                  <div className="editorial-well p-2">
                    <div className="text-[9.5px] text-[#6B7280]">Spots</div>
                    <div className="text-xs font-black text-[#18191F] tabular-nums mt-0.5">
                      {Math.max(0, 50 - (state.club.squadSize ?? 24))} open
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={onOpenTransfers}
                  className="py-2.5 px-3 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-extrabold transition cursor-pointer"
                >
                  Transfer Market
                </button>
                <button
                  type="button"
                  data-testid="squad-roster-rules-btn"
                  onClick={onOpenSquadRegistration || onOpenPhilosophy}
                  className="py-2.5 px-3 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer"
                >
                  Roster Rules
                </button>
              </div>
            </div>

            {/* Coaching Staff & Market Card */}
            {(() => {
              const coach = state.currentCoach;
              const synergyActive = Boolean(
                coach && isTacticalSynergy(coach.style, state.tactic || 'Total Football')
              );
              const coachInitials = coach?.name
                ? coach.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase()
                : 'HC';
              return (
                <div
                  className="editorial-card p-4 sm:p-5 flex flex-col justify-between"
                  data-testid="squad-coach-card"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0 ${
                            coach ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        >
                          {coachInitials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-[#18191F] truncate">
                            {coach ? coach.name : 'Head Coach Vacant'}
                          </h3>
                          <p
                            className={`text-[11px] truncate ${
                              coach ? 'text-[#6B7280]' : 'text-amber-700 font-semibold'
                            }`}
                          >
                            {coach ? `${coach.style} · ${coach.contractYearsLeft ?? 2}y left` : 'Interim caretaker (-4 OVR)'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 ${
                          coach
                            ? synergyActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-[#F6F5F1] text-[#18191F] border border-[#E6E3DC]'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {coach ? `+${coach.ovrBoost} OVR` : 'Vacant (-4)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      <div className="editorial-well p-2">
                        <div className="text-[9.5px] text-[#6B7280]">Synergy</div>
                        <div
                          className={`text-xs font-extrabold mt-0.5 truncate ${
                            coach && synergyActive ? 'text-emerald-700' : 'text-[#18191F]'
                          }`}
                        >
                          {coach ? (synergyActive ? 'Aligned' : 'Standard') : 'None'}
                        </div>
                      </div>
                      <div className="editorial-well p-2">
                        <div className="text-[9.5px] text-[#6B7280]">Specialty</div>
                        <div className="text-[11px] font-extrabold text-[#18191F] mt-0.5 truncate" title={coach?.strength || 'General'}>
                          {coach?.strength || 'General'}
                        </div>
                      </div>
                      <div className="editorial-well p-2">
                        <div className="text-[9.5px] text-[#6B7280]">Salary</div>
                        <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5 truncate">
                          {coach ? `${formatMoney(coach.cost)}/y` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      data-testid="squad-coach-overview-btn"
                      onClick={() => (onOpenCoachStaff ? onOpenCoachStaff() : onOpenCoachMarket())}
                      className="py-2.5 px-3 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-extrabold transition cursor-pointer"
                    >
                      Coach Overview
                    </button>
                    <button
                      type="button"
                      data-testid="squad-coach-market-btn"
                      onClick={onOpenCoachMarket}
                      className="py-2.5 px-3 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer"
                    >
                      Coach Market
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full">
          {/* Youth Academy */}
          <div className="editorial-card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#18191F]">Youth Academy</h3>
              <span className="text-[11px] font-bold text-[#6B7280] tabular-nums">
                Lvl {state.club.academyLevel || 1}/5
              </span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-2">Enrolled U19 prospects</div>
            <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
              {(state.youthPipeline || []).length} / {youthCap}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="editorial-well p-2.5">
                <div className="text-[10px] text-[#6B7280]">Ready call-ups</div>
                <div className="text-xs font-extrabold text-emerald-700 tabular-nums mt-0.5">
                  {readyCount} ready
                </div>
              </div>
              <div className="editorial-well p-2.5">
                <div className="text-[10px] text-[#6B7280]">Academy cost</div>
                <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                  {formatMoney(actionCosts.youth)}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenYouthModal}
              className="w-full mt-3.5 py-2.5 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-bold transition cursor-pointer"
            >
              Open Youth Academy
            </button>
          </div>

          {/* Team Retreat / Bonding (Stretches to align bottom edge flush) */}
          <div className="editorial-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#18191F]">Team Retreat</h3>
                <span className="text-[11px] font-semibold text-[#6B7280]">
                  {state.teamBondingThisSeason ? 'Completed' : '0/1 used'}
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-2">Dressing room morale</div>
              <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
                {state.club.morale ?? 80}%
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280]">Harmony effect</div>
                  <div className="text-xs font-extrabold text-emerald-700 mt-0.5">+15–30% Morale</div>
                </div>
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280]">Camp fee</div>
                  <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                    {formatMoney(actionCosts.bonding || 150)}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1.5 mt-4">
              <button
                type="button"
                onClick={onOpenTeamBonding}
                className="w-full py-2.5 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer"
              >
                Organize Team Retreat
              </button>
              <button
                type="button"
                onClick={onOpenWinterCamp}
                className="w-full py-2 rounded-2xl bg-white hover:bg-[#F6F5F1] border border-[#E6E3DC] text-[#4B5563] text-[11px] font-bold transition cursor-pointer"
              >
                Winter Training Camp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. INFRASTRUCTURE TAB (Flush Aligned: Left Venue/Fan Strategy/Facilities + Right Empty 3D Stadium w/ VIP Hospitality & Size Expansion)
  // =========================================================================
  if (activeTab === 'infrastructure') {
    const selectedPitch = state.pitchDesign || 'emerald_stripe';
    const selectedPolicy = state.stadiumPolicy || 'balanced';
    const activePolicyInfo = policyChoices.find((p) => p.id === selectedPolicy) || policyChoices[0];
    const vipSuitesShown = Boolean(state.vipHospitality || selectedPolicy === 'commercial');

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch" data-testid="infrastructure-grid">
        {/* Left Column (5 cols, stretches to align top & bottom flush) */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-full">
          {/* Stadium & Matchday Venue + Pitch Design Picker */}
          <div className="editorial-card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <ClubLogo club={state.club} size={32} isModActive={isModActive} className="w-8 h-8 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-[#6B7280]">
                    Stadium & Matchday Venue
                  </div>
                  <h3 className="text-sm font-extrabold text-[#18191F] truncate">
                    {effectiveStadiumName}
                  </h3>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-black text-[#18191F] tabular-nums">
                  {formatNum(maxAtt)} / 150,000 Seats
                </div>
                <div className="text-[10px] font-medium text-[#6B7280] tabular-nums">
                  Avg {formatNum(avgAtt)} ({Math.round((avgAtt / maxAtt) * 100)}% full)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-[#18191F] mb-2">
              <span>105×68m Pitch Design</span>
              <span className="text-[10px] font-medium text-[#6B7280]">
                Applies to Matchday & Bowl
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PITCH_DESIGNS.map((pd) => {
                const isSelected = selectedPitch === pd.id;
                const dotA = pd.swatchA === 'CLUB_PRIMARY' ? `#${(state.club.color || '1D4ED8').replace('#', '')}` : pd.swatchA;
                const dotB = pd.swatchB === 'CLUB_SECONDARY' ? '#FFFFFF' : pd.swatchB;
                return (
                  <button
                    key={pd.id}
                    type="button"
                    onClick={() => onSelectPitchDesign(pd.id)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#18191F] text-white border-[#18191F] shadow-sm'
                        : 'bg-[#F6F5F1] text-[#18191F] border-[#E6E3DC] hover:border-[#18191F]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold truncate">{pd.name}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full border border-black/15" style={{ backgroundColor: dotA }} />
                        <span className="w-2.5 h-2.5 rounded-full border border-black/15" style={{ backgroundColor: dotB }} />
                      </span>
                    </div>
                    <p
                      className={`text-[10px] mt-1 leading-snug line-clamp-2 ${
                        isSelected ? 'text-zinc-300' : 'text-[#6B7280]'
                      }`}
                    >
                      {pd.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <button
                type="button"
                onClick={onOpenAttendanceAnalytics}
                className="sm:col-span-2 py-2.5 px-3 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-bold transition cursor-pointer"
              >
                5-Year Attendance Analytics
              </button>
              <button
                type="button"
                onClick={onOpenCustomizeClub}
                className="py-2.5 px-3 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer"
              >
                Customize Club
              </button>
            </div>
          </div>

          {/* Fan Strategy (Exact 4 Options + Visualized in 3D Live Stadium) */}
          <div className="editorial-card p-4 sm:p-5" data-testid="fan-strategy-card">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-xs font-extrabold text-[#18191F]">Fan Strategy</h3>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                <span className="px-2 py-0.5 rounded-full bg-[#F6F5F1] border border-[#E6E3DC] text-[10px] font-extrabold text-[#18191F]">
                  {activePolicyInfo.badge}
                </span>
                {vipSuitesShown && selectedPolicy !== 'commercial' && (
                  <span
                    data-testid="fan-strategy-vip-combo-badge"
                    className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-extrabold text-amber-800"
                  >
                    + VIP Suites (+18% Cash)
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#6B7280] mb-2.5">
              Each choice shapes supporter atmosphere, club events & visually appears in the 3D live stadium.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {policyChoices.map((pol) => {
                const active = selectedPolicy === pol.id;
                return (
                  <button
                    key={pol.id}
                    type="button"
                    data-testid={`fan-strategy-${pol.id}`}
                    onClick={() => onSelectStadiumPolicy(pol.id)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'bg-[#18191F] text-white border-[#18191F] shadow-xs'
                        : 'bg-[#F6F5F1] text-[#18191F] border-[#E6E3DC] hover:border-[#18191F]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold leading-tight">{pol.title}</div>
                      <div
                        className={`inline-block text-[10px] font-extrabold mt-0.5 ${
                          active ? 'text-amber-300' : 'text-emerald-700'
                        }`}
                      >
                        {pol.badge}
                      </div>
                      <p
                        className={`text-[10px] mt-1 leading-snug ${
                          active ? 'text-zinc-300' : 'text-[#6B7280]'
                        }`}
                      >
                        {pol.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Club Facilities (Stretches to align bottom edge flush) */}
          <div className="editorial-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-extrabold text-[#18191F]">Club Facilities</h3>
                <p className="text-[10px] text-[#6B7280]">
                  Youth Academy campus & Sports Science Center upgrades.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#6B7280] tabular-nums">
                {(state.academyUpgradedThisSeason || 0) + (state.medicalUpgradedThisSeason || 0)}/2 this yr
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onOpenAcademyModal}
                className="editorial-well p-2.5 text-left hover:border-[#18191F] transition cursor-pointer space-y-2"
              >
                <ClubCampus3D
                  scene="facility_academy"
                  club={state.club}
                  academyLevel={state.club.academyLevel || 1}
                />
                <div>
                  <div className="text-xs font-extrabold text-[#18191F]">
                    Youth Academy (Lvl {state.club.academyLevel || 1}/5)
                  </div>
                  <div className="text-[10px] font-semibold text-[#6B7280] tabular-nums">
                    {(state.club.academyLevel || 1) >= 5 ? 'Max Level' : `Inspect / Upgrade`}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenMedicalModal}
                className="editorial-well p-2.5 text-left hover:border-[#18191F] transition cursor-pointer space-y-2"
              >
                <ClubCampus3D
                  scene="facility_medical"
                  club={state.club}
                  medicalLevel={state.club.medicalLevel || 1}
                />
                <div>
                  <div className="text-xs font-extrabold text-[#18191F]">
                    Medical Center (Lvl {state.club.medicalLevel || 1}/5)
                  </div>
                  <div className="text-[10px] font-semibold text-[#6B7280] tabular-nums">
                    {(state.club.medicalLevel || 1) >= 5 ? 'Max Level' : `Inspect / Upgrade`}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right / Main Empty 3D Stadium + VIP Hospitality & Capacity Expansion (7 cols, stretches flush) */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full">
          <div className="editorial-card p-3.5 sm:p-4 space-y-3">
            {/* Interactive Empty Stadium Controls: Add VIP Hospitality + Preview Capacity Scaling */}
            <div
              className="flex flex-wrap items-center justify-between gap-2 px-1"
              data-testid="infra-capacity-preview-bar"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-[#18191F]">
                  3D Empty Stadium Blueprint
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#F6F5F1] border border-[#E6E3DC] text-[10px] font-bold text-[#6B7280] tabular-nums">
                  {infraPreviewCap
                    ? `Preview: ${formatNum(infraPreviewCap)} seats`
                    : `${formatNum(maxAtt)} seats`}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  data-testid="infra-vip-hospitality-btn"
                  onClick={() => {
                    if (onToggleVipHospitality) {
                      onToggleVipHospitality();
                    } else {
                      onSelectStadiumPolicy(selectedPolicy === 'commercial' ? 'balanced' : 'commercial');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                    vipSuitesShown
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-[#F6F5F1] hover:bg-[#EAE7E0] text-[#18191F] border border-[#E6E3DC]'
                  }`}
                >
                  <i className="fa-solid fa-champagne-glasses text-[9px]" />
                  <span>{vipSuitesShown ? 'VIP Hospitality Active' : '+ Add VIP Hospitality'}</span>
                </button>

                <button
                  type="button"
                  data-testid="infra-increase-size-btn"
                  onClick={onOpenStadiumModal}
                  disabled={isReserveClub(state.club.name)}
                  className="px-2.5 py-1 rounded-xl bg-[#18191F] hover:bg-[#2A2C35] disabled:opacity-50 text-white text-[10px] font-extrabold transition cursor-pointer"
                >
                  + Increase Size
                </button>
              </div>
            </div>

            {/* Paid Stadium Architecture Remodeling + Capacity Scaling Preview Strip */}
            <div className="flex flex-col gap-1.5 px-1">
              {(() => {
                const resolvedAuto = resolveClubStadiumStyle(
                  { ...state.club, stadiumStyle: undefined },
                  null
                );
                const explicitStyle = state.stadiumStyle ?? state.club.stadiumStyle;
                const unlockedStyles = state.unlockedStadiumStyles || [];
                const remodelCostK = getStadiumArchitectureRemodelCostK(
                  maxAtt,
                  state.club.tier || 1,
                  getCountryMult(state.club.country || 'GER')
                );
                const availableLiquidity =
                  state.budget + getCreditLimit(state.club.tier || 1, state.club.country || 'GER');
                const canAffordRemodel = availableLiquidity >= remodelCostK;
                const pendingMeta = pendingRemodelStyle
                  ? STADIUM_STYLE_OPTIONS.find((s) => s.id === pendingRemodelStyle)
                  : null;

                return (
                  <>
                    <div
                      className="flex flex-wrap items-center justify-between gap-1.5"
                      data-testid="infra-style-preview-bar"
                    >
                      <span className="text-[10px] font-semibold text-[#6B7280]">
                        Stadium Architecture Variety:
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          data-testid="infra-style-btn-auto"
                          data-active={!explicitStyle ? 'true' : 'false'}
                          onClick={() => {
                            setPendingRemodelStyle(null);
                            onSelectStadiumStyle?.('auto', 0);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                            !explicitStyle
                              ? 'bg-[#18191F] text-white'
                              : 'bg-[#F1EFEA] hover:bg-[#EAE7E0] text-[#6B7280] border border-[#E6E3DC]'
                          }`}
                        >
                          Heritage Auto ({STADIUM_STYLE_OPTIONS.find((s) => s.id === resolvedAuto)?.shortName})
                        </button>
                        {STADIUM_STYLE_OPTIONS.map((opt) => {
                          const isActive = explicitStyle === opt.id;
                          const owned = isStadiumStyleOwned(
                            opt.id,
                            resolvedAuto,
                            explicitStyle,
                            unlockedStyles
                          );
                          const isPending = pendingRemodelStyle === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              data-testid={`infra-style-btn-${opt.id}`}
                              data-active={isActive ? 'true' : 'false'}
                              data-owned={owned ? 'true' : 'false'}
                                onClick={() => {
                                  if (isActive) {
                                    setPendingRemodelStyle(null);
                                    return;
                                  }
                                  if (owned) {
                                    setPendingRemodelStyle(null);
                                    onSelectStadiumStyle?.(opt.id, 0);
                                  } else {
                                    setPendingRemodelStyle((prev) =>
                                      prev === opt.id ? null : opt.id
                                    );
                                  }
                                }}
                                title={
                                  isActive
                                    ? `${opt.name} (Active Blueprint)`
                                    : owned
                                    ? `Switch back to owned ${opt.name} (Free)`
                                    : isPending
                                    ? `Stop previewing ${opt.name}`
                                    : `Preview ${opt.name} live in 3D before remodeling (${formatMoney(remodelCostK)})`
                                }
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition cursor-pointer inline-flex items-center gap-1 ${
                                  isActive
                                    ? 'bg-[#18191F] text-white shadow-2xs'
                                    : isPending
                                    ? 'bg-amber-50 text-amber-900 border border-amber-300 ring-1 ring-amber-300/60'
                                    : owned
                                    ? 'bg-[#F1EFEA] hover:bg-[#EAE7E0] text-[#18191F] border border-[#D4D0C5]'
                                    : 'bg-[#F1EFEA] hover:bg-[#EAE7E0] text-[#6B7280] border border-[#E6E3DC] hover:text-[#18191F]'
                                }`}
                              >
                                {!owned && !isActive && (
                                  <i
                                    className={`fa-solid ${
                                      isPending ? 'fa-eye text-amber-700' : 'fa-lock opacity-75'
                                    } text-[8px]`}
                                  />
                                )}
                                <span>{opt.shortName}</span>
                                {!owned && !isActive && (
                                  <span className="text-[9px] font-bold opacity-85 tabular-nums">
                                    · {formatMoney(remodelCostK)}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {pendingRemodelStyle && pendingMeta && (
                        <div
                          data-testid="infra-style-remodel-confirm"
                          className="mt-1 px-3 py-2 rounded-xl bg-amber-50/75 border border-amber-200 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-950 text-[9px] font-black uppercase tracking-wider">
                                Live 3D Preview
                              </span>
                              <span className="text-[11px] font-extrabold text-[#18191F]">
                                {pendingMeta.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#4B5563] mt-0.5">
                              {pendingMeta.desc} · Remodel fee:{' '}
                              <span className="font-bold text-rose-700 tabular-nums">
                                -{formatMoney(remodelCostK)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              data-testid="infra-style-remodel-cancel-btn"
                              onClick={() => setPendingRemodelStyle(null)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#4B5563] text-[10px] font-bold transition cursor-pointer"
                            >
                              Cancel Preview
                            </button>
                            <button
                              type="button"
                              data-testid="infra-style-remodel-pay-btn"
                              disabled={!canAffordRemodel}
                              onClick={() => {
                                onSelectStadiumStyle?.(pendingRemodelStyle, remodelCostK);
                                setPendingRemodelStyle(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#18191F] hover:bg-[#2A2C35] disabled:bg-rose-50 disabled:text-rose-700 disabled:border disabled:border-rose-200 disabled:cursor-not-allowed text-white text-[10px] font-extrabold transition cursor-pointer tabular-nums"
                            >
                              {canAffordRemodel
                                ? `Pay ${formatMoney(remodelCostK)} & Remodel`
                                : 'Insufficient Liquidity'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="text-[10px] font-semibold text-[#6B7280]">
                  Preview Stadium Expansion Scale (1,000 – 150,000 seats):
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {(
                    [
                      { label: `Current (${formatNum(maxAtt)})`, cap: null },
                      { label: '5k', cap: 5000 },
                      { label: '22k', cap: 22000 },
                      { label: '55k', cap: 55000 },
                      { label: '120k', cap: 120000 },
                    ] as const
                  ).map((item) => {
                    const isActive = infraPreviewCap === item.cap;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        data-testid={`infra-scale-btn-${item.cap ?? 'actual'}`}
                        onClick={() => setInfraPreviewCap(item.cap)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                          isActive
                            ? 'bg-[#18191F] text-white'
                            : 'bg-[#F6F5F1] hover:bg-[#EAE7E0] text-[#4B5563] border border-[#E6E3DC]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <StadiumBowl3D
              club={state.club}
              namingRights={state.stadiumNamingRights}
              pitchDesignId={state.pitchDesign}
              stadiumStyle={pendingRemodelStyle ?? state.stadiumStyle}
              stadiumPolicy={selectedPolicy}
              vipHospitalityActive={vipSuitesShown}
              attendance={0}
              capacity={infraPreviewCap ?? maxAtt}
              emptyBowl={true}
              isLive={false}
              isModActive={isModActive}
              activeSponsorName={recentSponsorName}
              cameraAngle={cameraAngle}
              onCameraChange={onCameraChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch">
            {/* Increase Stadium Size & VIP Hospitality Suites */}
            <div className="editorial-card p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#18191F]">
                    Increase Stadium Size &amp; VIP
                  </h3>
                  <span className="text-[11px] font-semibold text-[#6B7280] tabular-nums">
                    From {formatMoney(baseExpandCost)}
                  </span>
                </div>
                <div className="text-[11px] text-[#6B7280] mt-2">Current seating bowl</div>
                <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
                  {formatNum(maxAtt)} / 150,000
                </div>
                <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                  Add tiered seating stands &amp; luxury VIP Executive Hospitality suites (+18% Matchday Cash) directly reflected in the empty 3D stadium.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  data-testid="infra-add-vip-suites-btn"
                  onClick={() => {
                    if (onToggleVipHospitality) {
                      onToggleVipHospitality();
                    } else {
                      onSelectStadiumPolicy(selectedPolicy === 'commercial' ? 'balanced' : 'commercial');
                    }
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold transition cursor-pointer border ${
                    vipSuitesShown
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-[#F6F5F1] hover:bg-[#EAE7E0] border-[#E6E3DC] text-[#18191F]'
                  }`}
                >
                  {vipSuitesShown ? 'VIP Suites Active' : 'Add VIP Suites'}
                </button>
                <button
                  type="button"
                  onClick={onOpenStadiumModal}
                  disabled={isReserveClub(state.club.name)}
                  className="py-2.5 px-3 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] disabled:opacity-50 text-white text-xs font-extrabold transition cursor-pointer"
                >
                  {isReserveClub(state.club.name) ? 'Locked' : 'Expand Stands'}
                </button>
              </div>
            </div>

            {/* New Stadium Complex */}
            <div className="editorial-card p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#18191F]">New Stadium Complex</h3>
                  <span className="text-[11px] font-semibold text-[#6B7280]">10–25 yr credit</span>
                </div>
                <div className="text-[11px] text-[#6B7280] mt-2">Landmark capacity ceiling</div>
                <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
                  Up to 150,000
                </div>
                <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                  Commission a modern multi-tier championship arena with wrap-around VIP skyboxes via treasury or long-term credit (+10 Club Impact).
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenNewBuildModal}
                disabled={isReserveClub(state.club.name)}
                className="w-full mt-4 py-2.5 px-4 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] disabled:opacity-50 text-[#18191F] text-xs font-extrabold transition cursor-pointer"
              >
                {isReserveClub(state.club.name) ? 'Parent Venue Controlled' : 'Commission New Stadium'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. BOARD & MANAGER TAB (3-Column Flush Aligned: Left Manager/Impact | Center 3D Boardroom | Right Media/Job Market)
  // =========================================================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch" data-testid="board-3col-grid">
      {/* Left Column */}
      <div className="lg:col-span-3 flex flex-col gap-4 h-full">
        <div className="editorial-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <ClubLogo club={state.club} size={28} isModActive={isModActive} className="w-7 h-7 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#18191F]">Manager Overview</div>
                <div className="text-[10px] font-bold text-[#6B7280] uppercase truncate">
                  {state.managerName || 'Director'}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#6B7280] tabular-nums">
              Yr {state.seasonCount || (state.history?.length || 0) + 1}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="editorial-well p-2.5">
              <div className="text-[10px] text-[#6B7280]">Career win rate</div>
              <div className="text-base font-black text-[#18191F] tabular-nums mt-0.5">
                {state.totals?.matches
                  ? `${Math.round(((state.totals.wins || 0) / state.totals.matches) * 100)}%`
                  : `${snapshotStats.winRate}%`}
              </div>
            </div>
            <div className="editorial-well p-2.5">
              <div className="text-[10px] text-[#6B7280]">Mode / Profile</div>
              <div className="text-xs font-extrabold text-[#18191F] capitalize mt-1">
                {state.mode || 'Standard'}
              </div>
            </div>
          </div>

          <div className="editorial-well p-2.5 mt-2">
            <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
              <span>Current board mandate</span>
              <span className="font-bold text-[#18191F]">Tier {state.club.tier}</span>
            </div>
            <div className="text-xs font-extrabold text-[#18191F] mt-1 truncate">
              {state.boardVision?.title || 'League Consolidation & Growth'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-3">
            <button
              type="button"
              onClick={onOpenManagerProfile}
              className="col-span-2 py-2 px-3 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-bold transition cursor-pointer"
            >
              Manager Dossier
            </button>
            <button
              type="button"
              data-testid="board-prestige-btn"
              onClick={onOpenPrestige || onOpenBoardMandate}
              className="py-2 px-2 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer"
            >
              Prestige
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#E6E3DC] text-xs font-bold">
            <button
              type="button"
              onClick={onOpenClubProfile}
              className="text-[#4B5563] hover:text-[#18191F] cursor-pointer"
            >
              Club Heritage →
            </button>
            <button
              type="button"
              onClick={onResign}
              className="text-rose-700 hover:underline cursor-pointer"
            >
              Resign Post
            </button>
          </div>
        </div>

        {/* Club Impact (Stretches to align bottom edge flush) */}
        <div className="editorial-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#18191F]">Club Impact</h3>
              <button
                type="button"
                onClick={onOpenShields || onOpenClubImpact}
                className="text-[11px] font-bold text-[#6B7280] hover:text-[#18191F] tabular-nums cursor-pointer"
              >
                {shields} shield{shields === 1 ? '' : 's'} →
              </button>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-2">Board standing score</div>
            <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
              {state.clubImpactScore ?? 50} <span className="text-sm font-bold text-[#6B7280]">/ 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EAE7E0] overflow-hidden mt-2">
              <div
                className="h-full bg-[#EA580C] rounded-full"
                style={{ width: `${Math.min(100, Math.max(8, state.clubImpactScore ?? 50))}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="editorial-well p-2.5">
                <div className="text-[10px] text-[#6B7280]">Trophy count</div>
                <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                  {totalTrophiesCount} total
                </div>
              </div>
              <div className="editorial-well p-2.5">
                <div className="text-[10px] text-[#6B7280]">Current Rank</div>
                <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                  #{userRank} · Tier {state.club.tier}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenManagerProfile}
              className="w-full mt-2.5 px-3 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#F2EFE9] border border-[#E6E3DC] flex items-center justify-between text-xs transition cursor-pointer"
            >
              <span className="font-semibold text-[#4B5563]">Legacy Milestones</span>
              <span className="font-extrabold text-amber-800 tabular-nums">
                {legacyMilestoneSummary.unlockedCount} / {legacyMilestoneSummary.totalCount} →
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={onOpenClubImpact}
            className="w-full mt-4 py-2.5 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-bold transition cursor-pointer"
          >
            Open Club Impact
          </button>
        </div>
      </div>

      {/* Center Column */}
      <div className="lg:col-span-6 flex flex-col gap-4 h-full">
        <ClubCampus3D
          scene="boardroom"
          club={state.club}
          managerName={state.managerName || 'Director'}
          archetypeLabel={state.mode || 'Standard'}
          clubImpactScore={state.clubImpactScore ?? 50}
          shieldsCount={shields}
          roadmapGoalsDone={roadmapDone}
          roadmapGoalsTotal={roadmapTotal}
          skillPoints={state.skillPoints || 0}
          trophyCount={totalTrophiesCount}
          isModActive={isModActive}
          primaryActionLabel="Board Mandate"
          secondaryActionLabel="Dossier"
          onPrimaryAction={onOpenBoardMandate}
          onSecondaryAction={onOpenManagerProfile}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch">
          <div className="editorial-card p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#18191F]">Board Roadmap</h3>
                <span className="text-[11px] font-semibold text-[#6B7280] tabular-nums">
                  {state.boardVision?.startYear || state.year}–
                  {(state.boardVision?.startYear || state.year) + (state.boardVision?.durationYears || 3)}
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1 truncate">
                {state.boardVision?.title || 'Long-Term Club Vision'}
              </p>
              <div className="text-2xl font-black text-[#18191F] tabular-nums mt-2">
                {roadmapDone} / {roadmapTotal} Goals
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280]">Confidence</div>
                  <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                    {state.clubImpactScore ?? 50}%
                  </div>
                </div>
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280]">Next reward</div>
                  <div className="text-xs font-extrabold text-amber-700 mt-0.5">
                    +{state.boardVision?.reward?.skillPointsBonus || 15} MP
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenBoardMandate}
              className="w-full mt-4 py-2.5 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-extrabold transition cursor-pointer"
            >
              Open Board Roadmap
            </button>
          </div>

          <div className="editorial-card p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#18191F]">Manager Skills</h3>
                <span className="text-[11px] font-extrabold text-[#18191F] tabular-nums">
                  {state.skillPoints || 0} MP
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1">Unlocked executive perks</p>
              <div className="text-2xl font-black text-[#18191F] tabular-nums mt-2">
                {(state.managerSkills || []).length} / 8
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280]">Unspent points</div>
                  <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                    {state.skillPoints || 0} MP
                  </div>
                </div>
                <div className="editorial-well p-2.5">
                  <div className="text-[10px] text-[#6B7280]">Status</div>
                  <div className="text-xs font-extrabold text-emerald-700 mt-0.5">
                    {(state.managerSkills || []).length > 0 ? 'Perks Active' : 'Unlockable'}
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenManagerSkills}
              className="w-full mt-4 py-2.5 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-extrabold transition cursor-pointer"
            >
              Open Manager Skills
            </button>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-3 flex flex-col gap-4 h-full">
        <div className="editorial-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#18191F]">Media Impact</h3>
            <span
              className={`text-[11px] font-bold ${
                (state.mediaPressure ?? 15) >= 65
                  ? 'text-rose-700'
                  : (state.mediaPressure ?? 15) >= 40
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              }`}
            >
              {(state.mediaPressure ?? 15) >= 65
                ? 'Crisis Heat'
                : (state.mediaPressure ?? 15) >= 40
                ? 'Under Scrutiny'
                : 'Calm'}
            </span>
          </div>
          <div className="text-[11px] text-[#6B7280] mt-2">Press scrutiny level</div>
          <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
            {state.mediaPressure ?? 15} <span className="text-sm font-bold text-[#6B7280]">/ 100</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="editorial-well p-2.5">
              <div className="text-[10px] text-[#6B7280]">Coach heat</div>
              <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                {state.mediaPressure ?? 15}/100
              </div>
            </div>
            <div className="editorial-well p-2.5">
              <div className="text-[10px] text-[#6B7280]">Narrative</div>
              <div className="text-xs font-extrabold text-[#18191F] truncate mt-0.5">
                {(state.mediaPressure ?? 15) >= 60 ? 'Under Fire' : 'Stable'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenMediaHeat}
            className="w-full mt-3.5 py-2.5 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white text-xs font-bold transition cursor-pointer"
          >
            Open Press Room
          </button>
        </div>

        {/* Job Market (Stretches to align bottom edge flush) */}
        <div className="editorial-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#18191F]">Job Market</h3>
              <span className="text-[11px] font-semibold text-[#6B7280]">
                Tier {state.club.tier} Club
              </span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-2">Executive reputation</div>
            <div className="text-2xl font-black text-[#18191F] tabular-nums mt-0.5">
              {state.reputation ?? 50} <span className="text-sm font-bold text-[#6B7280]">/ 100</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="editorial-well p-2.5">
                <div className="text-[10px] text-[#6B7280]">Career silverware</div>
                <div className="text-xs font-extrabold text-[#18191F] tabular-nums mt-0.5">
                  {state.totals?.trophies || 0} trophies
                </div>
              </div>
              <div className="editorial-well p-2.5">
                <div className="text-[10px] text-[#6B7280]">League appeal</div>
                <div className="text-xs font-extrabold text-[#18191F] mt-0.5">
                  {(state.reputation ?? 50) >= 75 ? 'Elite' : 'Growing'}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenJobMarket}
            className="w-full mt-4 py-2.5 rounded-2xl bg-[#F6F5F1] hover:bg-[#EAE7E0] border border-[#E6E3DC] text-[#18191F] text-xs font-bold transition cursor-pointer"
          >
            Open Job Market
          </button>
        </div>
      </div>
    </div>
  );
};
