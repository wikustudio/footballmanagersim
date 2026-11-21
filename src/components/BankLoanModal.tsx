import React, { useState } from 'react';
import { motion } from 'motion/react';
import { formatMoney, getLoanOptions, LoanTermOption } from '../data/gameConstants';
import { Language } from '../types';
import { t } from '../data/translations';

interface BankLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxLoanAmount: number;
  hasActiveLoan?: boolean;
  onConfirmLoan: (principal: number, years: 10 | 15 | 25) => void;
  currentBudget: number;
  clubName: string;
  lang: Language;
}

export const BankLoanModal: React.FC<BankLoanModalProps> = ({
  isOpen,
  onClose,
  maxLoanAmount,
  hasActiveLoan = false,
  onConfirmLoan,
  currentBudget,
  clubName,
  lang,
}) => {
  const [selectedTenure, setSelectedTenure] = useState<10 | 15 | 25>(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = React.useRef(false);
  const isDe = lang === 'de';
  const tr = (en: string, de?: string) => t(lang, en, de);

  React.useEffect(() => {
    if (isOpen) {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [isOpen]);


  const options: LoanTermOption[] = getLoanOptions(maxLoanAmount);
  const activeOption = options.find((opt) => opt.years === selectedTenure) || options[1];

  const projectedTreasury = currentBudget + maxLoanAmount;

  // Isolate Escape key to pop only this sub-modal without dismissing parent StadiumModal or LedgerModal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={onClose}
      className="fixed inset-0 bg-[#18191F]/45 flex items-center justify-center p-3 sm:p-4 z-[70] backdrop-blur-sm cursor-pointer"
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-[#18191F] w-full sm:max-w-lg rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-[0_24px_64px_rgba(24,25,31,0.18)] border border-[#E6E3DC] text-left relative cursor-default max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F5F4F0] border border-[#E6E3DC] flex items-center justify-center text-sky-700 text-lg shrink-0">
              <i className="fa-solid fa-building-columns"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-sky-700">
                <span>{tr('Board & Financial Advisory', 'Finanzdirektion & Bankkonsortium')}</span>
                <span className="text-[#C7C4BC]">·</span>
                <span className="text-[#6B7280]">{clubName}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#18191F] tracking-tight mt-0.5">
                {tr('Commercial Credit Facility', 'Institutioneller Bankkredit')}
              </h3>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F4F0] hover:bg-[#EAE7E0] border border-[#E6E3DC] flex items-center justify-center text-[#6B7280] hover:text-[#18191F] transition active:scale-95 cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Lifeline / Liquidity Banner */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-sky-800 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-shield-halved"></i>
              {tr('Emergency Liquidity Lifeline', 'Notfall-Liquidität')}
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-bold tabular-nums">
              +{formatMoney(maxLoanAmount)} Cash
            </span>
          </div>
          <p className="text-[11px] text-[#4B5563] leading-relaxed mb-2.5">
            {tr(
              'Draw immediate institutional capital directly into your Current Treasury to eliminate negative balances and avoid insolvency penalties.',
              'Sofortige Auszahlung auf das Vereinskonto. Beendet rote Zahlen und schützt vor Insolvenz-Strafen.'
            )}
          </p>
          <div className="pt-2 border-t border-sky-200/80 flex justify-between items-center text-xs">
            <span className="text-[#4B5563] font-medium">{tr('Projected Post-Loan Treasury:', 'Kassenbestand nach Auszahlung:')}</span>
            <span className={`font-extrabold tabular-nums text-sm ${projectedTreasury >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatMoney(projectedTreasury)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-sky-200/60 flex items-center justify-between text-[10px]">
            <span className="text-sky-800 flex items-center gap-1.5 font-semibold">
              <i className="fa-solid fa-circle-check text-sky-700"></i>
              {tr('Independent Credit Line:', 'Eigenständige Kreditlinie:')}
            </span>
            <span className="text-[#6B7280]">
              {tr('Does not consume your seasonal Sponsor Pitch.', 'Verbraucht keinen saisonalen Sponsoren-Pitch.')}
            </span>
          </div>
        </div>

        {/* Tenure Selection Cards (10, 15, 25 Years) */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2.5">
            {tr('Select Repayment Horizon & Amortization', 'Laufzeit & Tilgungsplan wählen')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {options.map((opt) => {
              const isSelected = selectedTenure === opt.years;
              return (
                <button
                  key={opt.years}
                  type="button"
                  onClick={() => setSelectedTenure(opt.years)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#18191F] text-white border-[#18191F] shadow-sm'
                      : 'bg-[#F5F4F0] hover:bg-[#EFECE4] border-[#E6E3DC] text-[#18191F]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 text-emerald-400 text-xs">
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 tabular-nums">
                      <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-[#18191F]'}`}>{opt.years}</span>
                      <span className={`text-xs font-semibold ${isSelected ? 'text-zinc-300' : 'text-[#6B7280]'}`}>{tr('Years', 'Jahre')}</span>
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isSelected ? 'text-sky-300' : 'text-sky-700'}`}>
                      {isDe ? opt.taglineDe : opt.taglineEn}
                    </div>
                  </div>

                  <div className={`border-t pt-2 mt-1 ${isSelected ? 'border-white/15' : 'border-[#E6E3DC]'}`}>
                    <div className={`text-[9px] uppercase tracking-wider ${isSelected ? 'text-zinc-400' : 'text-[#6B7280]'}`}>{tr('Annual Service', 'Jaehrl. Rate')}</div>
                    <div className={`text-sm font-bold tabular-nums ${isSelected ? 'text-rose-300' : 'text-rose-700'}`}>
                      -{formatMoney(opt.annualPayment)}/yr
                    </div>
                    <div className={`text-[9px] mt-0.5 tabular-nums ${isSelected ? 'text-zinc-400' : 'text-[#6B7280]'}`}>
                      {opt.annualRatePct}% {tr('principal/yr', 'Tilgung/J.')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Plan Details Bento */}
        <div className="bg-[#FAF9F6] border border-[#E6E3DC] rounded-2xl p-3.5 mb-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              {tr('Total Repayment', 'Gesamttilgung')} ({selectedTenure} {tr('Yrs', 'Jahre')}):
            </span>
            <div className="flex items-center gap-2 tabular-nums">
              <span className="text-sm font-bold text-[#18191F]">
                {formatMoney(activeOption.totalRepayment)}
              </span>
              <span className="text-[10px] font-medium text-[#4B5563] bg-white px-1.5 py-0.5 rounded border border-[#E6E3DC]">
                +{activeOption.totalInterestPct}% {tr('interest', 'Zins')}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E6E3DC] flex items-center gap-1.5 text-[10px] text-amber-800">
            <i className="fa-solid fa-triangle-exclamation text-amber-600 text-[10px] shrink-0"></i>
            <span>
              {tr(
                'Max 1 active credit facility per club (resets on club transfer).',
                'Max. 1 aktiver Kredit pro Verein (wird bei Klubwechsel zurückgesetzt).'
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            disabled={hasActiveLoan || maxLoanAmount <= 0 || isSubmitting}
            onClick={() => {
              if (!hasActiveLoan && maxLoanAmount > 0 && !submittingRef.current && !isSubmitting) {
                submittingRef.current = true;
                setIsSubmitting(true);
                onConfirmLoan(maxLoanAmount, selectedTenure);
              }
            }}
            className={`flex-1 ${
              hasActiveLoan || maxLoanAmount <= 0 || isSubmitting
                ? 'bg-[#F5F4F0] text-[#9A9890] cursor-not-allowed border border-[#E6E3DC]'
                : 'bg-[#18191F] hover:bg-[#2A2C35] text-white shadow-sm active:scale-98 cursor-pointer'
            } font-bold text-sm py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2`}
          >
            <i className="fa-solid fa-file-signature"></i>
            <span>
              {hasActiveLoan
                ? tr('Active Loan Must Be Settled First', 'Aktiver Kredit muss zuerst getilgt werden')
                : maxLoanAmount <= 0
                ? tr('Credit Facility Maxed', 'Kreditlinie ausgeschöpft')
                : tr(`Authorize Loan (+${formatMoney(maxLoanAmount)})`, `Kredit aufnehmen (+${formatMoney(maxLoanAmount)})`)}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#F5F4F0] hover:bg-[#EAE7E0] text-[#18191F] font-semibold text-sm py-3 px-5 rounded-2xl transition active:scale-98 cursor-pointer border border-[#E6E3DC]"
          >
            {tr('Cancel', 'Abbrechen')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
