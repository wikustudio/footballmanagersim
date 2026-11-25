import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { formatMoney, sanitizePlayerName, getAcademyCallUpCap } from '../data/gameConstants';
import { getVeteranRingerEconomics, pickVeteranRinger } from '../engine/seasonSimEngine';

interface CompactTreasuryProps {
  budget: number;
  financials: { estRevenue: number; wages: number; net: number };
  squadSize: number;
  t: (en: string, de: string) => string;
}

const CompactTreasury: React.FC<CompactTreasuryProps> = ({ budget, financials, squadSize, t }) => {
  return (
    <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3.5 sm:p-4 grid grid-cols-3 gap-2 text-left">
      <div>
        <div className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-0.5">
          {t('Transfer Budget', 'Transferbudget')}
        </div>
        <div className="text-base sm:text-lg font-bold font-mono text-[#18191F] tracking-tight tabular-nums">
          {formatMoney(budget)}
        </div>
      </div>
      <div>
        <div className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-0.5">
          {t('Net / Season', 'Netto / Saison')}
        </div>
        <div className={`text-base sm:text-lg font-bold font-mono tabular-nums ${financials.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
          {financials.net >= 0 ? '+' : ''}{formatMoney(financials.net)}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-0.5">
          {t('Squad Capacity', 'Kadergröße')}
        </div>
        <div className="text-base sm:text-lg font-bold font-mono text-[#18191F] tabular-nums">
          {squadSize}<span className="text-[#6B7280] font-normal text-xs">/50</span>
        </div>
      </div>
    </div>
  );
};

interface TransferModalProps {
  state: GameState;
  lang: string;
  financials: { estRevenue: number; wages: number; net: number };
  actionCosts: { bidReg: number; bidKey: number };
  onBidReg: () => void;
  onBidKey: () => void;
  onGalacticoTransfer: () => void;
  onLoanPlayer: () => void;
  onSellPlayer: () => void;
  onPullYouthToSquad?: (id: string) => void;
  onSignVeteranRinger?: () => void;
  onClose: () => void;
  isMinimized?: boolean;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  state,
  lang,
  financials,
  actionCosts,
  onBidReg,
  onBidKey,
  onGalacticoTransfer,
  onLoanPlayer,
  onSellPlayer,
  onPullYouthToSquad,
  onSignVeteranRinger,
  onClose,
  isMinimized = false
}) => {
  const isDe = lang === 'de';
  const t = (en: string, de: string, es: string = en) => (lang === 'de' ? de : lang === 'es' ? es : en);
  const isWinter = state.seasonPhase === 'mid';
  const isUnderdog = (state.managerSkills || []).includes('rosinenpicker');
  const hasTalentMagnet = state.currentCoach?.strength === 'Talent Magnet';
  const maxKeyTransfers = (state.managerSkills || []).includes('star_magnet') ? 3 : 2;

  const [activeTab, setActiveTab] = useState<'all' | 'signings' | 'outgoings' | 'galactico' | 'academy'>('all');
  const [isLocalProcessing, setIsLocalProcessing] = useState(false);
  const localProcessingRef = React.useRef(false);
  const actionTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (actionTimerRef.current) {
        clearTimeout(actionTimerRef.current);
        actionTimerRef.current = null;
      }
    };
  }, []);

  const handleAction = (action: () => void) => {
    if (localProcessingRef.current || isLocalProcessing) return;
    localProcessingRef.current = true;
    setIsLocalProcessing(true);
    action();
    if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    actionTimerRef.current = setTimeout(() => {
      localProcessingRef.current = false;
      setIsLocalProcessing(false);
      actionTimerRef.current = null;
    }, 350);
  };
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const savedScrollTop = React.useRef<number>(0);

  React.useEffect(() => {
    if (isMinimized) {
      if (scrollRef.current) {
        savedScrollTop.current = scrollRef.current.scrollTop;
      }
    } else {
      if (scrollRef.current && savedScrollTop.current > 0) {
        scrollRef.current.scrollTop = savedScrollTop.current;
      }
    }
  }, [isMinimized]);

  const handleTabChange = (tab: 'all' | 'signings' | 'outgoings' | 'galactico' | 'academy') => {
    setActiveTab(tab);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const salesThisSeason = state.squadSalesThisSeason || 0;
  const currentSquadSize = state.club.squadSize || 24;
  const minSquadSize = 18;
  const availableSales = Math.max(0, Math.min(3 - salesThisSeason, currentSquadSize - minSquadSize));
  const isSellDisabled = availableSales <= 0;
  let sellReason = `(${availableSales}x)`;
  if (isSellDisabled) {
     if (currentSquadSize <= minSquadSize) {
        sellReason = t('Min Squad Size Reached', 'Minimaler Kader erreicht');
     } else {
        sellReason = t('Season Limit Reached', 'Saisonlimit erreicht');
     }
  }

  // Squad capacity lock (hard 50-man limit)
  const isSquadFull = currentSquadSize >= 50;

  // Allowance stats
  const regCount = isWinter ? (state.winterTransfers || 0) : (state.regTransfersThisSeason || 0);
  const regMax = isWinter ? 2 : 3;
  const isRegDisabled = isSquadFull || regCount >= regMax;

  const keyLimit = isWinter ? (maxKeyTransfers === 3 ? 2 : 1) : maxKeyTransfers;
  const keyCount = isWinter ? (state.winterKeyTransfers || 0) : (state.keyTransfersThisSeason || 0);
  const isMoraleLow = (state.club.morale ?? 100) < 40;
  const isMoneyball = state.clubIdentity === 'moneyball';
  const isKeyDisabled = isSquadFull || isMoraleLow || keyCount >= keyLimit || isMoneyball;

  // Academy Call-up Allowance
  const callUpCap = getAcademyCallUpCap(state.club.academyLevel || 1);
  const callUpsUsed = state.academyCallUpsThisSeason || 0;
  const isCallUpCapped = isSquadFull || callUpsUsed >= callUpCap;

  const loanLimit = isWinter ? 3 : 2;
  const loanCount = state.loansThisSeason || 0;
  const isLoanDisabled = isSquadFull || loanCount >= loanLimit;

  const isGalacticoDisabled = isSquadFull || state.club.tier !== 1 || (state.galacticosThisSeason || 0) >= 1 || isMoraleLow || isMoneyball;
  const featuredLegend = React.useMemo(
    () => pickVeteranRinger(state.club.country || 'GER', state.year, state.club.id || 0),
    [state.club.country, state.year, state.club.id]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isMinimized ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={() => {
        if (!isMinimized) onClose();
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-2.5 sm:p-4 bg-[#18191F]/45 backdrop-blur-sm text-left cursor-pointer overflow-y-auto overscroll-contain transition-opacity duration-150 ${isMinimized ? 'opacity-0 pointer-events-none invisible' : ''}`}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white text-[#18191F] rounded-[28px] sm:rounded-[32px] border border-[#E6E3DC] shadow-[0_24px_64px_rgba(24,25,31,0.18)] flex flex-col max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto overflow-hidden cursor-default shrink-0"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-center ${isWinter ? 'text-sky-700' : 'text-[#18191F]'} text-base shadow-xs shrink-0`}>
              <i className={isWinter ? "fa-solid fa-snowflake" : "fa-solid fa-right-left"}></i>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-0.5">
                {isWinter
                  ? t('Mid-Season Window', 'Winterpause Transferfenster')
                  : t('Season Transfer Window', 'Saison Transfermarkt')}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18191F] tracking-tight leading-tight">
                {isWinter
                  ? t('Winter Transfer Market', 'Winter-Transfermarkt')
                  : t('Squad Transfer Market', 'Kader-Transfermarkt')}
              </h2>
            </div>
          </div>
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#EFECE4] text-[#6B7280] hover:text-[#18191F] flex items-center justify-center transition border border-[#E6E3DC] cursor-pointer shrink-0"
          >
            <i className="fas fa-xmark text-xs"></i>
          </button>
        </div>

        {/* Treasury Metrics Strip */}
        <div className="px-5 sm:px-6 pt-4 shrink-0 relative z-10 bg-white">
          <CompactTreasury
            budget={state.budget}
            financials={financials}
            squadSize={currentSquadSize}
            t={t}
          />
        </div>

        {/* Segmented Navigation */}
        <div className="px-5 sm:px-6 pt-3 shrink-0 relative z-10 bg-white">
          <div className="flex items-center gap-1 p-1 bg-[#EFECE4] border border-[#E6E3DC] rounded-xl overflow-x-auto custom-scrollbar">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#18191F] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#18191F]'
              }`}
            >
              {t('All Operations', 'Alle Aktionen')}
            </button>
            <button
              onClick={() => handleTabChange('signings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                activeTab === 'signings'
                  ? 'bg-[#18191F] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#18191F]'
              }`}
            >
              {t('Incoming Signings', 'Neuzugänge')}
            </button>
            <button
              onClick={() => handleTabChange('outgoings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                activeTab === 'outgoings'
                  ? 'bg-[#18191F] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#18191F]'
              }`}
            >
              {t('Loans & Sales', 'Leihe & Verkäufe')}
            </button>
            {state.club.tier === 1 && (
              <button
                onClick={() => handleTabChange('galactico')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                  activeTab === 'galactico'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                {t('Galactico Elite', 'Galactico')}
              </button>
            )}
            {state.youthPipeline && state.youthPipeline.length > 0 && (
              <button
                onClick={() => handleTabChange('academy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'academy'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span>{t('Academy Call-Up', 'Jugend-Abruf')}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                  activeTab === 'academy' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {state.youthPipeline.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Operations Body */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4 custom-scrollbar relative z-10 bg-white">
          {/* Signings Section */}
          {(activeTab === 'all' || activeTab === 'signings') && (
            <div className="space-y-3">
              <div className="text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase px-1">
                {t('First-Team Additions', 'Kaderverstärkung')}
              </div>

              {/* Buy Regular Squad Player */}
              <button
                onClick={(e) => { e.stopPropagation(); handleAction(onBidReg); }}
                disabled={isRegDisabled || isLocalProcessing}
                className="w-full bg-[#FAF9F6] hover:bg-[#F2EFE7] p-4 rounded-2xl border border-[#E6E3DC] text-left transition-all duration-200 cursor-pointer flex flex-col gap-2 relative overflow-hidden group disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <div className="flex items-start sm:items-center justify-between gap-2.5 w-full">
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 text-xs shrink-0 group-hover:scale-105 transition-transform">
                      <i className="fa-solid fa-user-plus"></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-[#18191F] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span>{t('Sign Squad Player', 'Stammspieler verpflichten')}</span>
                        {isUnderdog && (
                          <span className="text-[10px] text-amber-700 font-semibold">· 20% Underdog Off</span>
                        )}
                        {hasTalentMagnet && (
                          <span className="text-[10px] text-emerald-700 font-semibold">· 20% Talent Magnet</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6B7280] font-normal leading-snug mt-0.5">
                        {t('Solid starting quality to strengthen depth and base team OVR.', 'Solider Stammspieler zur Stärkung der Kaderbreite und Basis-GES.')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-[#18191F] text-sm tabular-nums">
                      -{formatMoney(actionCosts.bidReg)}
                    </div>
                    <div className="font-mono text-[10px] text-[#6B7280] tabular-nums">
                      {regCount} / {regMax} {t('slots', 'Plätze')}
                    </div>
                  </div>
                </div>
              </button>

              {/* Buy Key Player */}
              <button
                onClick={(e) => { e.stopPropagation(); handleAction(onBidKey); }}
                disabled={isKeyDisabled || isLocalProcessing}
                className="w-full bg-[#FAF9F6] hover:bg-[#F2EFE7] p-4 rounded-2xl border border-[#E6E3DC] text-left transition-all duration-200 cursor-pointer flex flex-col gap-2 relative overflow-hidden group disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <div className="flex items-start sm:items-center justify-between gap-2.5 w-full">
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 text-xs shrink-0 group-hover:scale-105 transition-transform">
                      <i className="fa-solid fa-star"></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-[#18191F] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span>{t('Sign Key Player', 'Schlüsselspieler verpflichten')}</span>
                        {isUnderdog && (
                          <span className="text-[10px] text-amber-700 font-semibold">· 20% Underdog Off</span>
                        )}
                        {hasTalentMagnet && (
                          <span className="text-[10px] text-emerald-700 font-semibold">· 20% Talent Magnet</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6B7280] font-normal leading-snug mt-0.5">
                        {isMoneyball ? (
                          <span className="text-amber-700 font-semibold">
                            {t('Moneyball Syndicate: Locked out of Key Player signings.', 'Moneyball-Syndikat: Keine Verpflichtung von Schlüsselspielern erlaubt.')}
                          </span>
                        ) : isMoraleLow ? (
                          <span className="text-rose-700 font-semibold">
                            {t('Squad morale too low (< 40%). High-profile players refuse to sign.', 'Kadermoral zu niedrig (< 40%). Topspieler lehnen Wechsel ab.')}
                          </span>
                        ) : state.club.tier >= 6 ? (
                          t('High risk of flop (-OVR), massive wage impact.', 'Hohes Flop-Risiko (-GES), extreme Gehaltskosten.')
                        ) : (
                          t('High stakes gamble! Immediate high OVR impact or expensive flop.', 'Hoher Einsatz! Großer OVR-Boost oder teurer Flop.')
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-[#18191F] text-sm tabular-nums">
                      -{formatMoney(actionCosts.bidKey)}
                    </div>
                    <div className="font-mono text-[10px] text-[#6B7280] tabular-nums">
                      {keyCount} / {keyLimit} {t('slots', 'Plätze')}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Galactico Section (Tier 1) */}
          {(activeTab === 'all' || activeTab === 'galactico') && state.club.tier === 1 && (
            <div className="space-y-3">
              <div className="text-[10px] font-semibold tracking-wider text-amber-700 uppercase px-1">
                {t('Galactico Marquee Signing', 'Galactico Verpflichtung')}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleAction(onGalacticoTransfer); }}
                disabled={isGalacticoDisabled || isLocalProcessing}
                className="w-full bg-amber-50 hover:bg-amber-100/70 p-4 rounded-2xl border border-amber-200 text-left transition-all duration-200 cursor-pointer flex flex-col gap-2 relative overflow-hidden group disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <div className="flex items-start sm:items-center justify-between gap-2.5 w-full">
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 text-xs shrink-0 group-hover:scale-105 transition-transform">
                      <i className="fa-solid fa-crown"></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold text-[#18191F] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span>{t('Sign Galactico', 'Galactico Verpflichten')}</span>
                        <span className="text-[10px] text-amber-800 font-semibold">· League 1 Exclusive</span>
                        {hasTalentMagnet && (
                          <span className="text-[10px] text-emerald-700 font-semibold">· 20% Talent Magnet</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#4B5563] font-normal leading-snug mt-0.5">
                        {isMoneyball ? (
                          <span className="text-amber-800 font-semibold">
                            {t('Moneyball Syndicate: Locked out of Galactico signings.', 'Moneyball-Syndikat: Keine Verpflichtung von Galacticos erlaubt.')}
                          </span>
                        ) : state.club.baseOvr >= 96
                          ? t('Elite squad diminishing returns: Guaranteed +1 OVR and +5,000 Fans.', 'Elite-Kader mit abnehmendem Ertrag: Garantiert +1 GES und +5.000 Fans.')
                          : state.club.baseOvr > 92
                          ? t('Elite roster diminishing returns: Guaranteed +2 OVR and +5,000 Fans.', 'Elite-Kader mit abnehmendem Ertrag: Garantiert +2 GES und +5.000 Fans.')
                          : t('Bypass OVR cap limits. Guaranteed +4 OVR and +5,000 Fans immediately.', 'Umgeht GES-Limits. Garantiert sofort +4 GES und +5.000 Fans.')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-amber-800 text-sm tabular-nums">
                      -{formatMoney(actionCosts.bidKey * 2)}
                    </div>
                    <div className="font-mono text-[10px] text-amber-700 tabular-nums">
                      {state.galacticosThisSeason || 0} / 1 {t('season', 'Saison')}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Outgoings Section */}
          {(activeTab === 'all' || activeTab === 'outgoings') && (
            <div className="space-y-3">
              <div className="text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase px-1">
                {t('Loans & Outgoings', 'Leihe & Abgänge')}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Loan Player */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleAction(onLoanPlayer); }}
                  disabled={isLoanDisabled || isLocalProcessing}
                  className="bg-[#FAF9F6] hover:bg-[#F2EFE7] p-4 rounded-2xl border border-[#E6E3DC] text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs sm:text-sm font-semibold text-[#18191F] flex items-center gap-2">
                      <i className="fa-solid fa-handshake text-sky-700 text-xs"></i>
                      <span>{t('Loan In', 'Leihe')}</span>
                    </div>
                    <span className="text-emerald-700 font-mono text-xs font-semibold">Free</span>
                  </div>

                  <div className="text-[11px] text-[#6B7280] font-normal leading-snug">
                    {t('Temporary signing (-1 to +2 OVR impact). Expires at season end.', 'Temporärer Leihspieler (-1 bis +2 GES). Endet nach der Saison.')}
                  </div>

                  <div className="font-mono text-[10px] text-[#6B7280] pt-2 border-t border-[#E6E3DC] tabular-nums">
                    {loanCount} / {loanLimit} {t('loans used', 'geliehen')}
                  </div>
                </button>

                {/* Sell Players */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleAction(onSellPlayer); }}
                  disabled={isSellDisabled || isLocalProcessing}
                  className="bg-[#FAF9F6] hover:bg-[#F2EFE7] p-4 rounded-2xl border border-[#E6E3DC] text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs sm:text-sm font-semibold text-[#18191F] flex items-center gap-2">
                      <i className="fa-solid fa-arrow-trend-up text-emerald-700 text-xs"></i>
                      <span>{t('Sell Player', 'Spieler Verkaufen')}</span>
                    </div>
                    <span className="text-emerald-700 font-mono text-xs font-semibold">+Cash</span>
                  </div>

                  <div className="text-[11px] text-[#6B7280] font-normal leading-snug">
                    {t('Liquidate surplus talent to reduce squad wage bill and inject capital.', 'Kader verkleinern, Gehaltskosten senken und Budget freisetzen.')}
                  </div>

                  <div className="font-mono text-[10px] text-[#6B7280] pt-2 border-t border-[#E6E3DC] tabular-nums">
                    {sellReason}
                  </div>
                </button>
              </div>

              {/* Veteran Ringer Promotion Gamble (Tiers 3-11) */}
              {(() => {
                const ringerEcon = getVeteranRingerEconomics(state);
                if (!ringerEcon.isEligibleTier) return null;
                const canAffordRinger = state.budget >= ringerEcon.signingFeeK;
                const isRingerDisabled =
                  ringerEcon.alreadySigned ||
                  ringerEcon.isBlockedByDebtVeto ||
                  !canAffordRinger ||
                  isSquadFull ||
                  isLocalProcessing;

                return (
                  <div className="mt-3 bg-amber-50/70 border border-amber-200 rounded-2xl p-4 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
                          <span className="text-amber-800">
                            <i className="fa-solid fa-fire-flame-curved mr-1.5" />
                            {t('Veteran Ringer', 'Altstar-Vertrag')}
                          </span>
                          <span className="text-[#9A9890]" aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-mono">
                            +5 OVR · 1 YR
                          </span>
                        </div>
                        <div className="text-sm font-bold text-[#18191F] tracking-tight">
                          {ringerEcon.alreadySigned && state.veteranRingerName
                            ? state.veteranRingerName
                            : `${t('Sign Legend', 'Ikone verpflichten')} (${featuredLegend.name})`}
                        </div>
                        <p className="text-[11px] text-[#4B5563] leading-snug">
                          {t(
                            `+5 OVR for 1 season. +${formatMoney(ringerEcon.annualWageBurdenK)}/yr wages.`,
                            `+5 GES für 1 Saison. +${formatMoney(ringerEcon.annualWageBurdenK)}/Jahr Gehalt.`
                          )}
                        </p>
                        {ringerEcon.isBlockedByDebtVeto && (
                          <div className="text-[10px] font-semibold text-rose-700 flex items-center gap-1.5 pt-1">
                            <i className="fa-solid fa-ban" />
                            {t(
                              'Blocked while in debt.',
                              'Bei Verschuldung gesperrt.'
                            )}
                          </div>
                        )}
                      </div>

                      {onSignVeteranRinger && (
                        <button
                          type="button"
                          disabled={isRingerDisabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(onSignVeteranRinger);
                          }}
                          className={`shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition flex flex-col items-center justify-center min-w-[128px] border ${
                            ringerEcon.alreadySigned
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-not-allowed'
                              : isRingerDisabled
                              ? 'bg-[#EFECE4] border-[#E6E3DC] text-[#9A9890] cursor-not-allowed'
                              : 'bg-[#18191F] hover:bg-[#2A2C35] text-white border-[#18191F] shadow-xs cursor-pointer active:scale-[0.98]'
                          }`}
                        >
                          {ringerEcon.alreadySigned ? (
                            <>
                              <span>{t('Signed', 'Aktiv')}</span>
                              <span className="text-[10px] font-mono opacity-80">+5 OVR</span>
                            </>
                          ) : (
                            <>
                              <span>{t('Sign Legend', 'Verpflichten')}</span>
                              <span className="text-[10px] font-mono font-semibold tabular-nums opacity-85">
                                {formatMoney(ringerEcon.signingFeeK)} {t('Fee', 'Handgeld')}
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Academy Call-Up Section */}
          {(activeTab === 'all' || activeTab === 'academy') && state.youthPipeline && state.youthPipeline.length > 0 && (
            <div className="space-y-3">
              <div className="text-[10px] font-semibold tracking-wider text-emerald-700 uppercase px-1 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span>{t('Incubator Squad Pull (Cost of OVR)', 'Jugendakademie-Abruf (GES-Integration)')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border tabular-nums ${
                    isCallUpCapped
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {callUpsUsed} / {callUpCap} {t('Call-ups Used', 'Berufungen')} (Lvl {state.club.academyLevel || 1})
                  </span>
                </div>
                <span className="text-[#6B7280] font-normal">Zero Transfer Fee</span>
              </div>

              {isCallUpCapped && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
                  <i className="fa-solid fa-circle-exclamation text-amber-700 text-sm shrink-0"></i>
                  <span>
                    {t(
                      `Seasonal call-up cap reached (${callUpsUsed}/${callUpCap}). Upgrade your Youth Academy to unlock higher call-up limits each season.`,
                      `Saison-Limit für Berufungen erreicht (${callUpsUsed}/${callUpCap}). Baue die Jugendakademie aus für mehr Kaderberufungen pro Saison.`
                    )}
                  </span>
                </div>
              )}

              <div className="space-y-2.5">
                {state.youthPipeline.map((p) => {
                  const isLoaned = p.status === 'loaned';
                  const isReady = (p.status === 'ready' || (typeof p.timer === 'number' && p.timer <= 0)) && !isLoaned;
                  const hasNlzBonus = isReady && (state.club.academyLevel || 1) >= 3;
                  const hasFeederBonus = Boolean(state.prestigeUpgrades?.feederClubPurchased && !(p as any).feederBonusApplied);
                  const rawBoost = p.boost + (hasNlzBonus ? 1 : 0) + (hasFeederBonus ? 1 : 0);
                  let netGain = isReady ? rawBoost : Math.max(1, rawBoost - 1);
                  if (state.currentCoach) {
                    const cStr = state.currentCoach.strength;
                    const cWeak = state.currentCoach.weakness;
                    const cArch = (state.currentCoach as any).archetype;
                    if (cWeak === 'Youth Apathy' || cArch === 'iron_disciplinarian' || cArch === 'pragmatic_grinder') {
                      netGain = Math.max(1, Math.floor(netGain / 2));
                    } else if (cStr === 'Youth Whisperer' || cStr === 'Youth Focus' || cArch === 'youth_visionary') {
                      netGain += 1;
                    }
                  }

                  return (
                    <div
                      key={p.id}
                      className="bg-emerald-50/50 hover:bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-left transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 text-xs shrink-0">
                          <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-[#18191F] flex flex-wrap items-center gap-1.5">
                            <span>{sanitizePlayerName(p.name)}</span>
                            {p.position && (
                              <span className="text-[#6B7280] font-mono text-[11px]">· {p.position}</span>
                            )}
                            {isLoaned && (
                              <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                                {t('On Loan', 'Verliehen')}
                              </span>
                            )}
                            {isReady && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                                {t('Matured', 'Reif')}
                              </span>
                            )}
                            {hasNlzBonus && (
                              <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                                {t('+1 NLZ Bonus', '+1 NLZ-Bonus')}
                              </span>
                            )}
                            {hasFeederBonus && (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                                {t('+1 Feeder', '+1 Farmteam')}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#6B7280] font-normal flex flex-wrap items-center gap-1.5">
                            <span className="text-emerald-700 font-semibold">+{p.boost} {t('Potential', 'Potenzial')}</span>
                            {isLoaned ? (
                              <>
                                <span className="text-[#D6D3CB]">·</span>
                                <span className="text-sky-700 font-medium">{t('Developing on loan (Returns next season)', 'Auf Ausbildungsleihe (Rückkehr nächste Saison)')}</span>
                              </>
                            ) : isReady ? (
                              <>
                                <span className="text-[#D6D3CB]">·</span>
                                <span className="text-emerald-700 font-medium">{t('Graduation Ready (0 Penalty)', 'Abschlussbereit (0 Abzug)')}</span>
                              </>
                            ) : (
                              <>
                                <span className="text-[#D6D3CB]">·</span>
                                <span className="text-rose-700 font-medium">{t('-1 OVR Early Promotion Penalty', '-1 GES Vorzeitige Berufung')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                        <div className="text-right hidden sm:block">
                          <div className="font-mono font-bold text-emerald-700 text-xs tabular-nums">
                            +{netGain} {t('Net OVR', 'Netto GES')}
                          </div>
                          <div className="font-mono text-[10px] text-[#6B7280] tabular-nums">
                            {formatMoney(0)} {t('Fee', 'Ablöse')}
                          </div>
                        </div>

                        {onPullYouthToSquad && (
                          <button
                            type="button"
                            disabled={isCallUpCapped || isLoaned || isSquadFull || isLocalProcessing}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(() => onPullYouthToSquad(p.id));
                            }}
                            className={`font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs ${
                              (isCallUpCapped || isLoaned || isSquadFull || isLocalProcessing)
                                ? 'bg-[#EFECE4] text-[#9A9890] border border-[#E6E3DC] cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                            }`}
                            title={
                              isLoaned
                                ? t('Prospect is currently out on farm loan', 'Talent ist aktuell an Partnerverein verliehen')
                                : isCallUpCapped
                                ? `Seasonal call-up cap reached (${callUpsUsed}/${callUpCap})`
                                : undefined
                            }
                          >
                            <i className="fa-solid fa-arrow-up-from-bracket text-[10px]"></i>
                            <span>
                              {isLoaned
                                ? t('On Loan', 'Verliehen')
                                : isCallUpCapped
                                ? t('Cap Reached', 'Limit erreicht')
                                : t('Pull to Squad', 'In Kader berufen')}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E6E3DC] bg-[#FAF9F6] shrink-0 relative z-10">
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#18191F] hover:bg-[#2A2C35] text-white font-semibold text-xs transition cursor-pointer shadow-xs"
          >
            {t('Close Window', 'Fenster Schließen')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
