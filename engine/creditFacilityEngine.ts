import { BankLoan, GameState } from '../types';
import { getCreditLimit } from '../data/gameConstants';

export interface LoanProgress {
  initialPrincipal: number;
  remainingPrincipal: number;
  totalAmortizedK: number;
  percentPaidOff: number;
  yearsLeft: number;
  totalYears: number;
  annualPayment: number;
  earlyPayoffCost: number;
  loanType: 'bank' | 'bond';
  interestRate: number;
  isNearingPayoff: boolean;
}

export interface LoanQuote {
  type: 'bank' | 'bond';
  labelEn: string;
  labelDe: string;
  taglineEn: string;
  taglineDe: string;
  principal: number;
  years: 10 | 15 | 25;
  interestRate: number;
  annualPayment: number;
  totalRepayment: number;
}

/**
 * Calculates current amortization progress and percentage paid off.
 */
export function getLoanProgress(loan?: BankLoan): LoanProgress | null {
  if (!loan || loan.principal <= 0 || loan.yearsLeft <= 0) return null;

  const totalYears = loan.totalYears || 15;
  const yearsLeft = loan.yearsLeft;
  const yearsPaid = Math.max(0, totalYears - yearsLeft);

  // If initialPrincipal was not saved, recover it from the remaining principal:
  const initialPrincipal = (loan.initialPrincipal && loan.initialPrincipal > 0)
    ? loan.initialPrincipal
    : (loan.principal && yearsLeft < totalYears)
    ? Math.round(loan.principal / (yearsLeft / totalYears))
    : loan.principal;

  const remainingPrincipal = Math.min(initialPrincipal, loan.principal > 0 ? loan.principal : Math.round(initialPrincipal * (yearsLeft / totalYears)));
  const totalAmortizedK = Math.max(0, initialPrincipal - remainingPrincipal);
  const percentPaidOff = Math.min(100, Math.max(0, Math.round((yearsPaid / totalYears) * 100)));
  const earlyPayoffCost = Math.round(
    percentPaidOff < 10
      ? remainingPrincipal * 1.05
      : percentPaidOff > 50
      ? remainingPrincipal * 0.92
      : remainingPrincipal
  );

  return {
    initialPrincipal,
    remainingPrincipal,
    totalAmortizedK,
    percentPaidOff,
    yearsLeft,
    totalYears,
    annualPayment: loan.annualPayment,
    earlyPayoffCost,
    loanType: loan.loanType || 'bank',
    interestRate: loan.interestRate || (loan.totalYears >= 20 ? 3.0 : 4.5),
    isNearingPayoff: yearsLeft <= 2
  };
}

/**
 * Generates structured loan products (Syndicated Bank Facility vs. Infrastructure Bond)
 */
export function getStructuredLoanQuotes(maxLoanAmount: number): LoanQuote[] {
  // 1. Syndicated Bank Facility (15 years, 4.5% interest)
  const bankYears = 15;
  const bankRate = 4.5;
  const bankTotalInterest = maxLoanAmount * (bankRate / 100) * (bankYears * 0.55);
  const bankAnnual = Math.round((maxLoanAmount + bankTotalInterest) / bankYears);

  // 2. Municipal / Infrastructure Bond (25 years, 2.8% fixed interest)
  const bondYears = 25;
  const bondRate = 2.8;
  const bondTotalInterest = maxLoanAmount * (bondRate / 100) * (bondYears * 0.55);
  const bondAnnual = Math.round((maxLoanAmount + bondTotalInterest) / bondYears);

  return [
    {
      type: 'bank',
      labelEn: 'Syndicated Bank Facility',
      labelDe: 'Bankenkonsortium-Kredit',
      taglineEn: 'Flexible Capital Liquidity',
      taglineDe: 'Flexible Betriebsmittelfinanzierung',
      principal: maxLoanAmount,
      years: bankYears as 15,
      interestRate: bankRate,
      annualPayment: bankAnnual,
      totalRepayment: bankAnnual * bankYears
    },
    {
      type: 'bond',
      labelEn: 'Infrastructure Municipal Bond',
      labelDe: 'Infrastruktur-Kommunalanleihe',
      taglineEn: 'Low Fixed Rate for Mega-Projects',
      taglineDe: 'Niedriger Festzins für Bauprojekte',
      principal: maxLoanAmount,
      years: bondYears as 25,
      interestRate: bondRate,
      annualPayment: bondAnnual,
      totalRepayment: bondAnnual * bondYears
    }
  ];
}

/**
 * Advances loan by 1 season during end-of-season processing.
 * Returns updated loan or undefined if fully paid off.
 */
export function advanceLoanSeason(loan?: BankLoan): { updatedLoan?: BankLoan; annualDebitedK: number; isPaidOff: boolean } {
  if (!loan || loan.yearsLeft <= 0) {
    return { annualDebitedK: 0, isPaidOff: true };
  }

  const nextYearsLeft = loan.yearsLeft - 1;
  const annualDebitedK = loan.annualPayment;

  if (nextYearsLeft <= 0) {
    return {
      updatedLoan: undefined,
      annualDebitedK,
      isPaidOff: true
    };
  }

  const initialPrincipal = (loan.initialPrincipal && loan.initialPrincipal > 0)
    ? loan.initialPrincipal
    : (loan.principal && loan.yearsLeft < loan.totalYears)
    ? Math.round(loan.principal / (loan.yearsLeft / loan.totalYears))
    : loan.principal;
  const nextPrincipal = Math.round(initialPrincipal * (nextYearsLeft / loan.totalYears));

  return {
    updatedLoan: {
      ...loan,
      principal: nextPrincipal,
      initialPrincipal,
      yearsLeft: nextYearsLeft,
      totalPaidK: (loan.totalPaidK || 0) + annualDebitedK
    },
    annualDebitedK,
    isPaidOff: false
  };
}
