import React from 'react';
import { formatMoney } from '../data/gameConstants';
import { GameState } from '../types';

interface CompactTreasuryProps {
  budget: number;
  state?: GameState;
  financials: {
    wages: number;
    estRevenue: number;
    net: number;
  };
  t: (en: string, de: string) => string;
  lang?: string;
  onShowLedger?: () => void;
}

export const CompactTreasury: React.FC<CompactTreasuryProps> = ({ budget, financials, t, onShowLedger }) => {
  return (
    <div 
      className="bg-[#FAF9F6] hover:bg-[#F5F4F0] p-3.5 sm:p-4 rounded-2xl border border-[#E6E3DC] relative overflow-hidden transition-all duration-200 cursor-pointer group w-full"
      onClick={onShowLedger}
    >
      <div className="flex items-center justify-between mb-2.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white border border-[#E6E3DC] flex items-center justify-center text-sky-700 text-xs">
            <i className="fa-solid fa-vault"></i>
          </div>
          <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#6B7280] uppercase">
            {t('Treasury', 'Vereinskasse')}
          </span>
        </div>
        {onShowLedger && (
          <div className="text-[#6B7280] group-hover:text-[#18191F] transition-colors text-xs flex items-center gap-1">
            <span className="text-[10px] font-medium hidden sm:inline">{t('Ledger', 'Bericht')}</span>
            <i className="fa-solid fa-chevron-right text-[9px]"></i>
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mb-3 relative z-10">
        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold">
          {t('Balance', 'Kontostand')}
        </span>
        <span
          className={`text-2xl font-black tracking-tight leading-none tabular-nums ${
            budget < 0 ? 'text-rose-700' : 'text-[#18191F]'
          }`}
        >
          {formatMoney(budget)}
        </span>
      </div>

      {/* Integrated Financial Summary Strip */}
      <div className="text-[10px] grid grid-cols-3 gap-1 text-center bg-white border border-[#E6E3DC] rounded-xl p-2 relative z-10 tabular-nums">
        <div className="flex flex-col items-center">
          <span className="text-[#6B7280] uppercase font-semibold text-[8px] tracking-wider mb-0.5">
            {t('Est. Rev', 'Einnahmen')}
          </span>
          <span className="text-emerald-700 font-bold truncate">
            {financials.estRevenue >= 1 ? `+${formatMoney(financials.estRevenue)}` : '€0'}
          </span>
        </div>
        <div className="flex flex-col items-center border-x border-[#E6E3DC] px-1">
          <span className="text-[#6B7280] uppercase font-semibold text-[8px] tracking-wider mb-0.5">
            {t('Expenses', 'Ausgaben')}
          </span>
          <span className="text-rose-700 font-bold truncate">
            {financials.wages >= 1 ? `-${formatMoney(financials.wages)}` : '€0'}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[#6B7280] uppercase font-semibold text-[8px] tracking-wider mb-0.5">
            {t('Proj. Margin', 'Prognose')}
          </span>
          <span
            className={`font-bold truncate ${
              financials.net >= 0 ? 'text-sky-700' : 'text-rose-700'
            }`}
          >
            {financials.net >= 0 ? '+' : ''}{formatMoney(financials.net)}
          </span>
        </div>
      </div>
    </div>
  );
};
