import React from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { getLeagueInfo, formatMoney, calculateClubFinancials, getCreditLimit, isReserveClub } from '../data/gameConstants';
import { t as translate } from '../data/translations';

interface LedgerModalProps {
  state: GameState;
  lang: 'en' | 'de' | 'es';
  onUpdateScoutingDial?: (dialPct: number) => void;
  onClose: () => void;
}

export const LedgerModal: React.FC<LedgerModalProps> = ({ state, lang, onUpdateScoutingDial, onClose }) => {
  const tr = (en: string, de?: string) => translate(lang, en, de);
  const t = tr;
  const league = getLeagueInfo(state.club.tier, state.club.country || 'GER');
  const fin = calculateClubFinancials({ ...state, isManaged: true });
  const financials = fin;

  const wages = fin.wages;
  const matchdayIncomeK = fin.matchdayIncomeK;
  const posPrizeK = fin.posPrizeK;
  const euroRev = fin.euroRev;
  const sponsorInc = fin.sponsorInc;
  const parentClubGrant = fin.parentClubGrant;
  const namingRightsIncome = (fin as any).namingRightsIncome || 0;
  const extraSponsorInc = (fin as any).extraSponsorInc || 0;
  const estRevenue = fin.estRevenue;

  const pureWages = (fin as any).pureWages;
  const luxuryTax = (fin as any).luxuryTax;
  const stadiumTotal = (fin as any).stadiumOp;
  const medicalTotal = (fin as any).medicalOp;
  const youthTotal = (fin as any).academyOp;
  const severanceOp = (fin as any).severanceOp || 0;
  const bankLoanDebtService = (fin as any).bankLoanDebtService || 0;
  const shareholderDividend = (fin as any).shareholderDividend || 0;

  const operatingMargin = fin.net;
  
  const creditLimit = getCreditLimit(state.club.tier, state.club.country || 'GER');
  const seasonsInDebt = state.seasonsInDebt || 0;
  const isDefensiveTactic = state.tactic === 'Defensive' || state.tactic === 'Catenaccio' || state.tactic === 'Park the Bus';
  const maxDebtYears = isDefensiveTactic ? 4 : 3;

  const currentBudget = typeof state.budget === 'number' ? state.budget : 100000;
  const projectedEndBalance = currentBudget + operatingMargin;


  

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={onClose}
      className="fixed inset-0 bg-[#18191F]/45 flex flex-col items-center p-2.5 sm:p-4 justify-center z-50 backdrop-blur-sm cursor-pointer overflow-y-auto overscroll-contain"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.98, opacity: 0 }} 
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-[#18191F] w-full sm:max-w-lg rounded-[28px] sm:rounded-[32px] shadow-[0_24px_64px_rgba(24,25,31,0.18)] border border-[#E6E3DC] pointer-events-auto relative cursor-default max-h-[92vh] sm:max-h-[88vh] min-h-0 my-auto flex flex-col overflow-hidden shrink-0"
      >
        {/* Sticky Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#E6E3DC] bg-[#FAF9F6] flex items-center justify-between shrink-0 relative z-10 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E6E3DC] flex items-center justify-center text-sky-700 text-base shrink-0 shadow-sm">
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-700">
                <span>{tr('Financial Ledger', 'Finanzbericht')}</span>
                <span className="text-[#C7C4BC]">·</span>
                <span className="text-[#6B7280]">{league.name}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#18191F] tracking-tight leading-tight mt-0.5">
                {state.club.name}
              </h3>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white hover:bg-[#EAE7E0] border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] hover:text-[#18191F] transition active:scale-95 cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4 custom-scrollbar relative z-10 text-left">
        
        {currentBudget > 60000 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-left text-xs mb-3 flex items-start gap-2.5">
            <i className="fa-solid fa-sack-dollar text-rose-700 mt-0.5 shrink-0"></i>
            <div className="text-[11px] text-[#4B5563] leading-snug">
              <span className="font-bold text-rose-800 mr-1.5">{tr('FFP Luxury Tax Active:', 'FFP-Reichensteuer aktiv:')}</span>
              {tr(
                'Luxury Tax active on cash reserves over €60M: 10% >€60M · 25% >€150M · 40% >€300M. Reinvest before year-end to minimize taxation.',
                'Reichensteuer auf Barreserven über €60M: 10% >€60M · 25% >€150M · 40% >€300M. Vor Saisonende reinvestieren.'
              )}
            </div>
          </div>
        )}

        <div className="text-left space-y-3">
          {/* Compact 3-Column Treasury Summary */}
          <div className="bg-[#F5F4F0] rounded-2xl p-4 border border-[#E6E3DC]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
              <div className="p-2 sm:p-0 border-b sm:border-b-0 sm:border-r border-[#E6E3DC] sm:pr-3">
                <span className="text-[#6B7280] font-semibold text-[11px] block mb-1">
                  {tr('Current treasury', 'Aktuelles Budget')}
                </span>
                <span className={`text-lg sm:text-xl font-black tabular-nums ${currentBudget < 0 ? 'text-rose-700' : 'text-[#18191F]'}`}>
                  {formatMoney(currentBudget)}
                </span>
              </div>
              <div className="p-2 sm:p-0 border-b sm:border-b-0 sm:border-r border-[#E6E3DC] sm:px-3">
                <span className="text-[#6B7280] font-semibold text-[11px] block mb-1">
                  {tr('Projected margin', 'Betriebsbilanz')}
                </span>
                <span className={`text-lg sm:text-xl font-black tabular-nums ${operatingMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {operatingMargin >= 0 ? '+' : ''}{formatMoney(operatingMargin)}
                </span>
              </div>
              <div className="p-2 sm:p-0 sm:pl-3">
                <span className="text-[#6B7280] font-semibold text-[11px] block mb-1">
                  {tr('Est. end balance', 'Gesch. Saisonende')}
                </span>
                <span className={`text-lg sm:text-xl font-black tabular-nums ${projectedEndBalance < 0 ? 'text-rose-700' : 'text-sky-700'}`}>
                  {formatMoney(projectedEndBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Operations Breakdown */}
          <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E6E3DC]">
            <div className="text-[#18191F] font-extrabold mb-3 text-xs flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-sky-700"></i>
              <span>{tr('End-of-season operations projection', 'Saisonende Betriebs-Prognose')}</span>
            </div>
            
            <div className="text-[11px] text-emerald-700 font-bold mb-2.5 border-b border-[#E6E3DC] pb-1.5">
              {tr('Operating income', 'Betriebseinnahmen')}
            </div>
            
            {matchdayIncomeK >= 1 && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#4B5563]">{tr('Matchday Income', 'Spieltageinnahmen')}</span>
                <span className="text-[#18191F] tabular-nums font-semibold">+{formatMoney(matchdayIncomeK)}</span>
              </div>
            )}
            
            {league.tvPrize > 0 && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#4B5563]">{tr('TV Rights', 'TV-Rechte')}</span>
                <span className="text-[#18191F] tabular-nums font-semibold">+{formatMoney(league.tvPrize)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#4B5563]">{tr('League Position (Est.)', 'Liga-Platzierung (Gesch.)')}</span>
              <span className="text-[#18191F] tabular-nums font-semibold">+{formatMoney(posPrizeK)}</span>
            </div>
            
            {euroRev > 0 && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#4B5563]">{['GER','ENG','ESP','ITA','FRA','POR','SCO','WAL','POL','AUT','SUI','TUR'].includes(state.club.country || 'GER') ? 'European Prize' : 'Continental Prize'} ({state.euroStatus})</span>
                <span className="text-[#18191F] tabular-nums font-semibold">+{formatMoney(euroRev)}</span>
              </div>
            )}
            
            {parentClubGrant > 0 && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#4B5563]">{isReserveClub(state.club.name) ? tr('Parent Club Grant (II Team)', 'Mutterverein-Zuschuss (II)') : tr('Association Grant', 'Verbandszuschuss')}</span>
                <span className="text-emerald-700 tabular-nums font-semibold">+{formatMoney(parentClubGrant)}</span>
              </div>
            )}
            
            {fin.boardSubsidy > 0 && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#4B5563]">{tr('Board Subsidy', 'Vorstandszuschuss')}</span>
                <span className="text-emerald-700 tabular-nums font-semibold">+{formatMoney(fin.boardSubsidy)}</span>
              </div>
            )}

            {(fin as any).academyDividend > 0 && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#4B5563]">{tr('Youth Solidarity Dividend (Lvl 5)', 'Solidaritätsdividende (Akademie Lvl 5)')}</span>
                <span className="text-emerald-700 tabular-nums font-semibold">+{formatMoney((fin as any).academyDividend)}</span>
              </div>
            )}
            
            {namingRightsIncome > 0 && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#4B5563] truncate pr-2">
                  {tr('Stadium Naming Rights', 'Stadion-Namensrechte')}
                  {state.stadiumNamingRights?.partnerName ? ` (${state.stadiumNamingRights.partnerName})` : ''}
                </span>
                <span className="text-emerald-700 tabular-nums font-semibold shrink-0">+{formatMoney(namingRightsIncome)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#4B5563] flex items-center gap-1.5">
                <span>{tr('Base Sponsorships', 'Sponsoring')}</span>
                {state.failedSponsorTargetNextSeason && (
                  <span className="text-[9px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {tr('-40% Penalty', '-40% Strafe')}
                  </span>
                )}
              </span>
              <span className={`tabular-nums font-semibold ${sponsorInc < 0 ? 'text-rose-700' : 'text-[#18191F]'}`}>
                {sponsorInc < 0 ? '' : '+'}{formatMoney(sponsorInc)}
              </span>
            </div>

            {extraSponsorInc > 0 && (
              <div className="text-[10px] text-emerald-800 bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-2.5 py-1.5 mb-2 flex justify-between items-center gap-2">
                <span>{tr('Upfront Commercial Deals (Already Credited to Treasury)', 'Sofort-Sponsorendeals (Bereits auf Konto gebucht)')}</span>
                <span className="font-bold tabular-nums shrink-0">+{formatMoney(extraSponsorInc)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs pt-1.5 mb-3 border-t border-dashed border-[#E6E3DC] font-semibold">
              <span className="text-[#4B5563]">{tr('Total Operating Income', 'Gesamte Betriebseinnahmen')}</span>
              <span className="text-emerald-700 tabular-nums font-bold">+{formatMoney(estRevenue)}</span>
            </div>
            
            <div className="text-[11px] text-rose-700 font-bold mb-2.5 mt-3 border-b border-[#E6E3DC] pb-1.5">
              {tr('Operating expenses', 'Betriebsausgaben')}
            </div>
            
            <div className="flex justify-between text-xs mb-1.5 flex-wrap">
              <span className="text-[#4B5563]">{tr('Squad Wage', 'Kader-Gehaelter')}</span>
              <span className="text-[#18191F] tabular-nums font-semibold">-{formatMoney((fin as any).pureWages)}</span>
              {(state.veteranRingerActive || state.veteranRingerSignedThisSeason) && (
                <div className="w-full text-[10px] text-amber-700 mt-0.5">
                  {tr(
                    `Includes Veteran Ringer Contract (${state.veteranRingerName || 'Legend'}: -${formatMoney((fin as any).veteranRingerWageSurcharge || state.veteranRingerWageK || 0)})`,
                    `Enthält Altstar-Vertrag (${state.veteranRingerName || 'Ikone'}: -${formatMoney((fin as any).veteranRingerWageSurcharge || state.veteranRingerWageK || 0)})`
                  )}
                </div>
              )}
            </div>
            
            {(fin as any).luxuryTax > 0 && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-rose-700 font-medium">{tr('FFP Wealth & Luxury Tax', 'FFP Reichensteuer')}</span>
                <span className="text-rose-700 tabular-nums font-semibold">-{formatMoney((fin as any).luxuryTax)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-xs mb-1.5 flex-wrap">
              <span className="text-[#4B5563]">{tr('Stadium Upkeep', 'Stadion-Unterhalt')}</span>
              <span className="text-[#18191F] tabular-nums font-semibold">-{formatMoney(stadiumTotal)}</span>
              {fin.venueRentFee > 0 && <div className="w-full text-[10px] text-amber-700 mt-0.5">{tr('Includes Venue Lease Deficit Fee', 'Enthaelt Stadion-Ausweichmiete')}</div>}
            </div>
            
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#4B5563]">{tr('Medical Staff', 'Medizin-Personal')}</span>
              <span className="text-[#18191F] tabular-nums font-semibold">-{formatMoney(medicalTotal)}</span>
            </div>
            
            <div className="flex justify-between text-xs mb-1.5 flex-wrap">
              <span className="text-[#4B5563]">{tr('Academy & Youth Scouting', 'Jugendakademie & Scouting')}</span>
              <span className="text-[#18191F] tabular-nums font-semibold">-{formatMoney(youthTotal)}</span>
              {(fin as any).scoutingDialExtraK > 0 && (
                <div className="w-full text-[10px] text-emerald-700 mt-0.5">
                  {tr(
                    `Includes +${(fin as any).scoutingDialPct}% Extra Youth Scouting (-${formatMoney((fin as any).scoutingDialExtraK)}/yr)`,
                    `Enthält +${(fin as any).scoutingDialPct}% Extra-Jugendscouting (-${formatMoney((fin as any).scoutingDialExtraK)}/Jahr)`
                  )}
                </div>
              )}
            </div>

            {severanceOp > 0 && (
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-rose-700 font-medium">{tr('Coach Severance Pay', 'Trainer-Abfindungen')}</span>
                <span className="text-rose-700 tabular-nums font-semibold">-{formatMoney(severanceOp)}</span>
              </div>
            )}

            {(fin as any).debtInterest > 0 && (
              <div className="flex justify-between text-xs mb-1.5 mt-2 pt-2 border-t border-[#E6E3DC]">
                <span className="text-rose-700 font-medium">{tr('Interest Payment on Debt (10%)', 'Zinszahlungen auf Schulden (10%)')}</span>
                <span className="text-rose-700 tabular-nums font-semibold">-{formatMoney((fin as any).debtInterest)}</span>
              </div>
            )}

            {bankLoanDebtService > 0 && (
              <div className="flex justify-between text-xs mb-1.5 mt-2 pt-2 border-t border-[#E6E3DC]">
                <span className="text-rose-700 font-medium flex items-center gap-1.5">
                  <i className="fa-solid fa-building-columns text-[10px]"></i>
                  <span>
                    {tr('Bank Debt Service', 'Bankkredit-Tilgung')}
                    {state.bankLoan && (
                      <span className="text-[10px] text-[#6B7280] ml-1 font-normal">
                        ({state.bankLoan.totalYears - state.bankLoan.yearsLeft + 1}/{state.bankLoan.totalYears} {tr('yrs', 'J.')})
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-rose-700 tabular-nums font-semibold">-{formatMoney(bankLoanDebtService)}</span>
              </div>
            )}

            {state.isPublic && (
              <div className="flex items-center justify-between text-xs mb-1.5 mt-2 pt-2 border-t border-[#E6E3DC] text-amber-800 font-medium">
                <span>{t('Public Shareholder Dividend', 'Aktionärsdividende')}</span>
                <span className="font-bold tabular-nums">
                  -{formatMoney(shareholderDividend)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-xs pt-1.5 mt-2 border-t border-dashed border-[#E6E3DC] font-semibold">
              <span className="text-[#4B5563]">{tr('Total Operating Expenses', 'Gesamte Betriebsausgaben')}</span>
              <span className="text-rose-700 tabular-nums font-bold">-{formatMoney(wages)}</span>
            </div>

            <div className="border-t border-[#E6E3DC] mt-3 pt-2.5 flex items-center justify-between font-bold text-sm">
              <span className="text-[#18191F]">{tr('Annual Projected Margin', 'Prognostizierte Betriebsbilanz')}</span>
              <span className={`tabular-nums font-black ${operatingMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {operatingMargin >= 0 ? '+' : ''}{formatMoney(operatingMargin)}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1 text-left font-medium">
              {tr('Applied to your club treasury on Decision Day.', 'Diese Bilanz wird am Decision Day mit dem Konto verrechnet.')}
            </p>
          </div>

          {/* Credit & Debt Rules */}
          <div className="bg-[#F5F4F0] rounded-2xl p-4 border border-[#E6E3DC] space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-amber-800 font-extrabold text-xs flex items-center gap-1.5">
                <i className="fa-solid fa-scale-balanced text-xs"></i>
                <span>{tr('Credit & debt rules', 'Kredit & Schuldenregeln')}</span>
              </span>
              <span className="text-[#18191F] tabular-nums text-xs font-bold">
                {tr('Max limit:', 'Max Limit:')} -{formatMoney(creditLimit)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-[#E6E3DC]">
              <span className="text-[#4B5563] text-xs">{tr(`Insolvency Counter (${maxDebtYears} Yr Max)`, `Insolvenz-Zaehler (Max ${maxDebtYears} J.)`)}</span>
              <span className={`font-semibold px-2.5 py-1 rounded-xl text-[10px] tabular-nums ${
                seasonsInDebt >= maxDebtYears - 1
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : seasonsInDebt >= 1
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {seasonsInDebt}/{maxDebtYears} {tr('Red Seasons', 'Schuldenjahre')}
              </span>
            </div>

            {(currentBudget < 0 || seasonsInDebt > 0) && (
              <div className="pt-2 border-t border-[#E6E3DC] text-[11px] text-rose-800 leading-relaxed flex items-start gap-2">
                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-xs mt-0.5 shrink-0"></i>
                <span>
                  {tr(
                    `Finishing in debt triggers point deductions & 10% interest. After ${maxDebtYears} red seasons: Emergency Fire Sale (-40% to -50% squad OVR) or administrative demotion!`,
                    `Saisonabschluss im Minus führt zu Punktabzügen & 10% Zinsen. Nach ${maxDebtYears} Schuldenjahren: Notverkäufe (-40% bis -50% GES) oder Zwangsabstieg!`
                  )}
                </span>
              </div>
            )}

            {state.bankLoan && state.bankLoan.yearsLeft > 0 && (
              <div className="pt-2.5 border-t border-[#E6E3DC] text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sky-700 text-xs font-bold flex items-center gap-1.5">
                    <i className="fa-solid fa-building-columns text-[10px]"></i>
                    {tr('Active bank facility', 'Aktiver Bankkredit')}
                  </span>
                  <span className="text-sky-800 text-[11px] font-bold tabular-nums">
                    {state.bankLoan.yearsLeft} / {state.bankLoan.totalYears} {tr('yrs left', 'Jahre')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#4B5563] text-[11px]">
                  <span>{tr('Principal Repayment / Yr', 'Tilgung p.a.')}</span>
                  <span className="text-rose-700 font-semibold tabular-nums">-{formatMoney(state.bankLoan.annualPayment)}/yr</span>
                </div>
                <div className="flex justify-between items-center text-[#4B5563] text-[11px] mt-0.5">
                  <span>{tr('Estimated Balance Due', 'Restverbindlichkeit')}</span>
                  <span className="text-[#18191F] font-semibold tabular-nums">
                    {formatMoney(state.bankLoan.principal)}
                  </span>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E6E3DC] bg-[#FAF9F6] shrink-0 relative z-10">
          <button 
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="w-full bg-[#18191F] hover:bg-[#2A2C35] text-white font-bold text-sm py-3 rounded-2xl transition active:scale-95 cursor-pointer"
          >
            {tr('Close', 'Schliessen')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
