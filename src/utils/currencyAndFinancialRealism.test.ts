import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatMoney,
  getStartingBudget,
  getCountryMult,
  setGlobalCurrencyCountry,
  getGlobalCurrencyCountry
} from '../data/gameConstants';
import {
  getCountryCurrency,
  formatMoneyWithCountry,
  registerCustomModCurrencies
} from './currencyHelpers';
import { parseAndNormalizeModBudget } from '../engine/moddingEngine';
import { calculateTrainingCompensationK } from '../engine/incubatorEngine';

describe('Universal Currency & Financial Realism across All Nations', () => {
  beforeEach(() => {
    setGlobalCurrencyCountry('GER');
  });

  describe('Currency Symbols and Formatting across Countries', () => {
    it('verifies Argentina formats authentic dollar/peso symbol ($) for domestic and international figures', () => {
      expect(getCountryCurrency('ARG')).toBe('$');
      expect(formatMoney(3800, 'ARG')).toBe('$3.8M');
      expect(formatMoney(7500, 'ARG')).toBe('$7.5M');
      expect(formatMoney(500, 'ARG')).toBe('$500K');
      expect(formatMoney(-250, 'ARG')).toBe('-$250K');
    });

    it('verifies United Kingdom formats authentic pound symbol (£)', () => {
      expect(getCountryCurrency('ENG')).toBe('£');
      expect(getCountryCurrency('SCO')).toBe('£');
      expect(getCountryCurrency('WAL')).toBe('£');
      expect(formatMoney(15000, 'ENG')).toBe('£15M');
      expect(formatMoney(450, 'ENG')).toBe('£450K');
    });

    it('verifies Brazil formats Brazilian Real symbol (R$)', () => {
      expect(getCountryCurrency('BRA')).toBe('R$');
      expect(formatMoney(12000, 'BRA')).toBe('R$12M');
    });

    it('verifies Asian & European regional currencies format authentically', () => {
      expect(getCountryCurrency('JPN')).toBe('¥');
      expect(formatMoney(5000, 'JPN')).toBe('¥5M');

      expect(getCountryCurrency('TUR')).toBe('₺');
      expect(formatMoney(8000, 'TUR')).toBe('₺8M');

      expect(getCountryCurrency('POL')).toBe('zł ');
      expect(formatMoney(2500, 'POL')).toBe('zł 2.5M');

      expect(getCountryCurrency('SWE')).toBe('kr ');
      expect(formatMoney(3000, 'SWE')).toBe('kr 3M');

      expect(getCountryCurrency('SUI')).toBe('CHF ');
      expect(formatMoney(4000, 'SUI')).toBe('CHF 4M');

      expect(getCountryCurrency('GER')).toBe('€');
      expect(formatMoney(20000, 'GER')).toBe('€20M');
    });

    it('supports dynamic registration of custom mod country currencies', () => {
      registerCustomModCurrencies({
        XYZ: '₿',
        NEW: 'N$'
      });
      expect(getCountryCurrency('XYZ')).toBe('₿');
      expect(formatMoney(1000, 'XYZ')).toBe('₿1M');
      expect(getCountryCurrency('NEW')).toBe('N$');
    });

    it('transparently uses global currency context without breaking legacy single-argument calls', () => {
      setGlobalCurrencyCountry('ARG');
      expect(getGlobalCurrencyCountry()).toBe('ARG');
      expect(formatMoney(3800)).toBe('$3.8M');

      setGlobalCurrencyCountry('ENG');
      expect(formatMoney(5000)).toBe('£5M');

      setGlobalCurrencyCountry('GER');
      expect(formatMoney(19)).toBe('€19K');
    });
  });

  describe('Argentine Starting Budgets & Macroeconomic Balance Sheets', () => {
    it('verifies default starting budget for Argentina Primera is grounded at realistic scale ($7.5M)', () => {
      const argMult = getCountryMult('ARG');
      expect(argMult).toBe(0.25);
      const argTier1Budget = getStartingBudget(1, 'ARG');
      expect(argTier1Budget).toBe(7500); // 7,500K = $7.5M
    });

    it('verifies Vélez Sarsfield starts with authentic $3.8M balance sheet (real-life $3M-$6M range)', () => {
      // 3,800,000 in mod file normalizes to 3,800 in-engine units ($3.8M)
      const velezBudget = parseAndNormalizeModBudget(3800000, 1, 'ARG');
      expect(velezBudget).toBe(3800);
      expect(formatMoney(velezBudget, 'ARG')).toBe('$3.8M');
    });

    it('verifies River Plate and Boca Juniors start in realistic $7.5M-$8.0M range and prevent inflated starting cash', () => {
      const riverBudget = parseAndNormalizeModBudget(8000000, 1, 'ARG');
      expect(riverBudget).toBe(8000);
      expect(formatMoney(riverBudget, 'ARG')).toBe('$8M');

      // Even if a user-supplied mod passes an astronomical €86M / $86M starting cash for Argentina,
      // the engine clamps starting cash safely within realistic country bounds ($12M max starting)
      const clampedBudget = parseAndNormalizeModBudget(86670000, 1, 'ARG');
      expect(clampedBudget).toBeLessThanOrEqual(12000);
      expect(formatMoney(clampedBudget, 'ARG')).toBe('$12M');
    });
  });

  describe('Wonderkid Export Mechanics to European Giants', () => {
    it('verifies Latin American / Argentine wonderkid exports yield high-value windfalls for deep save wealth generation', () => {
      const generationalWonderkid: any = {
        id: 'p_gen_1',
        name: 'Santiago Perrone',
        boost: 5,
        type: 'generational'
      };

      // European lower tier compensation
      const deComp = calculateTrainingCompensationK(generationalWonderkid, 1, 'GER');

      // Export powerhouse (Argentina) selling to European giants
      const argExportComp = calculateTrainingCompensationK(generationalWonderkid, 1, 'ARG');

      // Export compensation yields higher international transfer windfalls ($7M+ up to $15M+ in operations)
      expect(argExportComp).toBeGreaterThan(deComp);
      expect(argExportComp).toBeGreaterThanOrEqual(7500); // $7.65M+ base transfer windfall
    });
  });

  describe('Universal Calibration of Player Bids, Arena, Academy, Medical & Maintenance', () => {
    it('verifies player transfer bidding costs (bidReg and bidKey) scale proportionally to national GDP', async () => {
      const { getLeagueScaledVal } = await import('../data/gameConstants');

      // Regular first-team signing (base 15,000K = €15M)
      const gerBidReg = getLeagueScaledVal(1, 15000, 'GER');
      const argBidReg = getLeagueScaledVal(1, 15000, 'ARG');
      const engBidReg = getLeagueScaledVal(1, 15000, 'ENG');

      expect(gerBidReg).toBe(15000); // €15M
      expect(argBidReg).toBe(3750);  // $3.75M (exactly 25% of European base)
      expect(engBidReg).toBe(24000); // £24M (160% of European base)

      expect(formatMoney(gerBidReg, 'GER')).toBe('€15M');
      expect(formatMoney(argBidReg, 'ARG')).toBe('$3.75M');
      expect(formatMoney(engBidReg, 'ENG')).toBe('£24M');

      // Key superstar signing (base 45,000K = €45M)
      const gerBidKey = getLeagueScaledVal(1, 45000, 'GER');
      const argBidKey = getLeagueScaledVal(1, 45000, 'ARG');
      const engBidKey = getLeagueScaledVal(1, 45000, 'ENG');

      expect(gerBidKey).toBe(45000); // €45M
      expect(argBidKey).toBe(11250); // $11.25M
      expect(engBidKey).toBe(72000); // £72M

      expect(formatMoney(gerBidKey, 'GER')).toBe('€45M');
      expect(formatMoney(argBidKey, 'ARG')).toBe('$11.25M');
      expect(formatMoney(engBidKey, 'ENG')).toBe('£72M');
    });

    it('verifies arena and stadium extension options scale with national economic multiplier', async () => {
      const { getStadiumOptions } = await import('../components/StadiumModal');

      const gerOptions = getStadiumOptions(1, 'GER');
      const argOptions = getStadiumOptions(1, 'ARG');
      const engOptions = getStadiumOptions(1, 'ENG');

      // Extension option 1 (2,500 seats)
      expect(gerOptions[0].cost).toBe(15000); // €15M
      expect(argOptions[0].cost).toBe(3750);  // $3.75M (25%)
      expect(engOptions[0].cost).toBe(24000); // £24M (160%)

      // Extension option 2 (5,000 seats)
      expect(gerOptions[1].cost).toBe(35000); // €35M
      expect(argOptions[1].cost).toBe(8750);  // $8.75M (25%)
      expect(engOptions[1].cost).toBe(56000); // £56M (160%)
    });

    it('verifies youth academy and medical facility upgrade costs scale with country economy', async () => {
      const { getLeagueScaledVal } = await import('../data/gameConstants');

      // Level 1 upgrade baseline: 1,500K
      const gerUpgrade = getLeagueScaledVal(1, 1500, 'GER');
      const argUpgrade = getLeagueScaledVal(1, 1500, 'ARG');
      const braUpgrade = getLeagueScaledVal(1, 1500, 'BRA');

      expect(gerUpgrade).toBe(1500); // €1.5M
      expect(argUpgrade).toBe(375);  // $375K (exact 25% multiplier)
      expect(braUpgrade).toBe(600);  // R$600K (40% multiplier)

      expect(formatMoney(gerUpgrade, 'GER')).toBe('€1.5M');
      expect(formatMoney(argUpgrade, 'ARG')).toBe('$375K');
      expect(formatMoney(braUpgrade, 'BRA')).toBe('R$600K');
    });

    it('verifies annual facility upkeep, stadium maintenance, and youth coaching scale dynamically in club balance sheets', async () => {
      const { calculateClubFinancials } = await import('../data/gameConstants');

      const testClub = {
        name: 'Test FC',
        tier: 1,
        baseOvr: 78,
        stadium: 40000,
        fanBase: 35000,
        academyLevel: 2,
        medicalLevel: 2,
        squadSize: 24,
      };

      const gerFin = calculateClubFinancials({
        club: { ...testClub, country: 'GER' },
        budget: 15000,
      });

      const argFin = calculateClubFinancials({
        club: { ...testClub, country: 'ARG' },
        budget: 15000,
      });

      // Operational overhead in Argentina is calibrated much lower than Germany to match local revenues
      expect(argFin.wages).toBeLessThan(gerFin.wages);
      expect(argFin.medicalOp).toBeLessThan(gerFin.medicalOp);
      expect(argFin.academyOp).toBeLessThan(gerFin.academyOp);
      expect(argFin.stadiumOp).toBeLessThan(gerFin.stadiumOp);

      // Verify Argentina facility upkeep is exactly 25% of Germany
      expect(argFin.medicalOp).toBe(Math.floor(gerFin.medicalOp * 0.25));
    });
  });
});

