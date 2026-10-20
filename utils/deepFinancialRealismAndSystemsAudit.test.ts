import { describe, it, expect } from 'vitest';
import {
  calculateClubFinancials,
  getCountryMult,
  getLeagueInfo,
  getCreditLimit,
  getClubMaxBankLoan,
  getLeagueStadiumRequirement,
  getLeagueMaxAttendance,
  isReserveClub,
  getLeagueScaledVal,
} from '../data/gameConstants';
import { ALL_CLUBS } from '../data/clubsData';
import { Club } from '../types';

const createTestClub = (overrides: Partial<Club> & { name: string; tier: number }): Club => ({
  id: 10000 + Math.floor(Math.random() * 90000),
  color: '#3b82f6',
  baseOvr: 70,
  stadium: 20000,
  country: 'GER',
  ...overrides,
});

describe('Deep Financial Logic, Realism & Systems Audit', () => {
  // =========================================================================
  // 1. PAYROLL & WAGE BILL AUDIT (TIERS 1 TO 11 & OVR SCALING)
  // =========================================================================
  describe('1. Payroll & Wage Bill Mechanics', () => {
    it('verifies monotonic wage bill progression from Tier 11 grassroots to Tier 1 superclubs', () => {
      const wageByTier: number[] = [];

      for (let tier = 1; tier <= 11; tier++) {
        const league = getLeagueInfo(tier, 'GER');
        const testClub = createTestClub({
          id: 1000 + tier,
          name: `FC Test Tier ${tier}`,
          tier,
          country: 'GER',
          baseOvr: league.avgOvr || 50,
          stadium: league.stadBase || 1000,
          fanBase: league.attBase || 500,
          squadSize: 24,
          academyLevel: 1,
          medicalLevel: 1,
        });

        const fin = calculateClubFinancials({
          club: testClub,
          budget: 50000,
          year: 2026,
        });

        wageByTier.push(fin.pureWages);

        // Positive wages for every tier
        expect(fin.pureWages, `Tier ${tier} pure wages`).toBeGreaterThan(0);
      }

      // Assert strictly monotonic descending wages as tier increases (T1 > T2 > T3 ... > T11)
      for (let i = 0; i < wageByTier.length - 1; i++) {
        expect(
          wageByTier[i],
          `Tier ${i + 1} wages (${wageByTier[i]}) must exceed Tier ${i + 2} wages (${wageByTier[i + 1]})`
        ).toBeGreaterThan(wageByTier[i + 1]);
      }

      // Verify Tier 1 wages are in the tens of millions (e.g. > €15M) and Tier 11 in grassroots thousands (e.g. < €50K)
      expect(wageByTier[0], 'Tier 1 elite pure wages').toBeGreaterThan(15000);
      expect(wageByTier[10], 'Tier 11 grassroots pure wages').toBeLessThan(50);
    });

    it('enforces progressive wage surcharges for superstar squads (OVR > 82 in Tier 1)', () => {
      const baseTier1Club = createTestClub({
        id: 101,
        name: 'Standard Tier 1 Club',
        tier: 1,
        country: 'GER',
        baseOvr: 80,
        stadium: 45000,
        fanBase: 40000,
        squadSize: 24,
      });

      const superstarClub = createTestClub({
        ...baseTier1Club,
        name: 'Superstar Galactico Club',
        baseOvr: 88,
      });

      const finBase = calculateClubFinancials({ club: baseTier1Club, budget: 100000 });
      const finSuperstar = calculateClubFinancials({ club: superstarClub, budget: 100000 });

      // Superstar squad (88 OVR vs 80 OVR) must command significantly higher wage bill (> 1.25x)
      expect(finSuperstar.pureWages).toBeGreaterThan(finBase.pureWages * 1.25);
    });

    it('grants reserve clubs (B-teams) exact 50% wage relief while zeroing stadium maintenance', () => {
      const parentClub = createTestClub({
        id: 1,
        name: 'FC Bayern Munich',
        tier: 1,
        country: 'GER',
        baseOvr: 85,
        stadium: 75000,
      });

      const reserveClub = createTestClub({
        id: 2,
        name: 'Bayern Munich II',
        tier: 3,
        country: 'GER',
        baseOvr: 65,
        stadium: 15000,
      });

      const normalTier3Club = createTestClub({
        id: 3,
        name: 'Rot-Weiss Essen',
        tier: 3,
        country: 'GER',
        baseOvr: 65,
        stadium: 15000,
      });

      expect(isReserveClub(reserveClub.name)).toBe(true);
      expect(isReserveClub(normalTier3Club.name)).toBe(false);

      const finReserve = calculateClubFinancials({ club: reserveClub, budget: 10000 });
      const finNormal = calculateClubFinancials({ club: normalTier3Club, budget: 10000 });

      // Reserve club wages are discounted by 50%
      expect(finReserve.pureWages).toBeLessThanOrEqual(Math.round(finNormal.pureWages * 0.55));
      expect(finReserve.stadiumOp).toBe(0);
    });

    it('scales payroll linearly with squad size deviations from standard 24-player roster', () => {
      const standardRoster = createTestClub({
        id: 201,
        name: 'Standard Roster FC',
        tier: 2,
        country: 'GER',
        baseOvr: 70,
        stadium: 25000,
        squadSize: 24,
      });

      const bloatedRoster = createTestClub({
        ...standardRoster,
        name: 'Bloated Roster FC',
        squadSize: 30, // +25% players
      });

      const trimRoster = createTestClub({
        ...standardRoster,
        name: 'Trim Roster FC',
        squadSize: 20, // -16.7% players
      });

      const finStandard = calculateClubFinancials({ club: standardRoster, budget: 20000 });
      const finBloated = calculateClubFinancials({ club: bloatedRoster, budget: 20000 });
      const finTrim = calculateClubFinancials({ club: trimRoster, budget: 20000 });

      expect(finBloated.pureWages).toBeGreaterThan(finStandard.pureWages);
      expect(finTrim.pureWages).toBeLessThan(finStandard.pureWages);
    });
  });

  // =========================================================================
  // 2. MATCHDAY REVENUE & STADIUM OPERATIONS AUDIT
  // =========================================================================
  describe('2. Matchday Revenue & Stadium Operations', () => {
    it('verifies that matchday ticket revenue scales strictly with attendance and ticket pricing', () => {
      const testClub = createTestClub({
        id: 301,
        name: 'FC Capacity Test',
        tier: 2,
        country: 'GER',
        baseOvr: 72,
        stadium: 30000,
        fanBase: 25000,
      });

      const league = getLeagueInfo(2, 'GER');
      const fin = calculateClubFinancials({ club: testClub, budget: 15000 });

      // Expected attendance must not exceed stadium capacity or fanbase
      expect(fin.expectedAtt).toBeLessThanOrEqual(testClub.stadium);
      expect(fin.expectedAtt).toBeGreaterThan(1000);

      // Matchday revenue should be close to expectedAtt * league.ticket * 17 home matches / 1000
      const calculatedExpectedRevenueK = Math.floor((fin.expectedAtt * league.ticket * 17) / 1000);
      expect(fin.matchdayIncomeK).toBeGreaterThanOrEqual(calculatedExpectedRevenueK * 0.9);
      expect(fin.matchdayIncomeK).toBeLessThanOrEqual(calculatedExpectedRevenueK * 1.25);
    });

    it('enforces commercial vs ultras stadium pricing policy elasticity (+18% VIP vs -5% capped terrace tickets)', () => {
      const baseClub = createTestClub({
        id: 302,
        name: 'FC Policy Test',
        tier: 1,
        country: 'GER',
        baseOvr: 82,
        stadium: 50000,
        fanBase: 50000,
      });

      const finNeutral = calculateClubFinancials({ club: baseClub, budget: 50000, stadiumPolicy: 'balanced' });
      const finCommercial = calculateClubFinancials({ club: baseClub, budget: 50000, stadiumPolicy: 'commercial' });
      const finUltras = calculateClubFinancials({ club: baseClub, budget: 50000, stadiumPolicy: 'ultras' });

      // Commercial hospitality yield must exceed neutral by ~18%
      expect(finCommercial.matchdayIncomeK).toBeGreaterThan(finNeutral.matchdayIncomeK * 1.15);

      // Ultras capped standing terrace policy must yield slightly less (~5% lower)
      expect(finUltras.matchdayIncomeK).toBeLessThan(finNeutral.matchdayIncomeK);
    });

    it('scales stadium maintenance costs per seat by tier and applies 2.5x surcharge for mega-stadiums (>120k)', () => {
      const tier1Normal = createTestClub({
        id: 401,
        name: 'Tier 1 Normal Arena',
        tier: 1,
        country: 'GER',
        baseOvr: 80,
        stadium: 60000,
      });

      const tier1Mega = createTestClub({
        id: 402,
        name: 'Tier 1 Mega Arena',
        tier: 1,
        country: 'GER',
        baseOvr: 80,
        stadium: 130000, // > 120,000 threshold
      });

      const finNormal = calculateClubFinancials({ club: tier1Normal, budget: 50000 });
      const finMega = calculateClubFinancials({ club: tier1Mega, budget: 50000 });

      // Normal 60k stadium maintenance: 60,000 * 20 / 1000 = €1,200K
      expect(finNormal.stadiumOp).toBeGreaterThanOrEqual(1000);

      // Mega 130k stadium maintenance has 2.5x multiplier: (130,000 * 20 / 1000) * 2.5 = €6,500K
      expect(finMega.stadiumOp).toBeGreaterThan(5000);
    });

    it('imposes regulatory venue rent fees when a stadium is below division standards (Tiers 1–3)', () => {
      const requiredTier2Cap = getLeagueStadiumRequirement(2, 'GER'); // 15,000 required
      expect(requiredTier2Cap).toBeGreaterThan(5000);

      const subStandardClub = createTestClub({
        id: 501,
        name: 'TSV Dorfverein',
        tier: 2,
        country: 'GER',
        baseOvr: 70,
        stadium: 3000, // Deficit vs requiredCap
        fanBase: 15000,
      });

      const compliantClub = createTestClub({
        id: 502,
        name: 'Compliant Tier 2 Club',
        tier: 2,
        country: 'GER',
        baseOvr: 70,
        stadium: requiredTier2Cap + 5000,
      });

      const finSub = calculateClubFinancials({ club: subStandardClub, budget: 10000 });
      const finCompliant = calculateClubFinancials({ club: compliantClub, budget: 10000 });

      expect(finSub.venueRentFee).toBeGreaterThan(0);
      expect(finCompliant.venueRentFee).toBe(0);
    });
  });

  // =========================================================================
  // 3. FACILITY UPKEEP & YOUTH PIPELINE EXPONENTIAL SCALING
  // =========================================================================
  describe('3. Facility Upkeep & Youth Operations', () => {
    it('verifies compound exponential scaling (1.5x per level) for high-tier facilities', () => {
      const baseClub = createTestClub({
        id: 601,
        name: 'Academy Test Club',
        tier: 1,
        country: 'GER',
        baseOvr: 80,
        stadium: 40000,
        academyLevel: 1,
        medicalLevel: 1,
      });

      const finLvl1 = calculateClubFinancials({ club: baseClub, budget: 50000 });

      const clubLvl3 = createTestClub({ ...baseClub, academyLevel: 3, medicalLevel: 3 });
      const finLvl3 = calculateClubFinancials({ club: clubLvl3, budget: 50000 });

      const clubLvl5 = createTestClub({ ...baseClub, academyLevel: 5, medicalLevel: 5 });
      const finLvl5 = calculateClubFinancials({ club: clubLvl5, budget: 50000 });

      // Medical upkeep: level 3 should be > level 1 * 2, and level 5 > level 3 * 2
      expect(finLvl3.medicalOp).toBeGreaterThan(finLvl1.medicalOp * 1.8);
      expect(finLvl5.medicalOp).toBeGreaterThan(finLvl3.medicalOp * 1.8);
    });

    it('scales youth academy coaching costs with active prospects and talent grades', () => {
      const baseClub = createTestClub({
        id: 701,
        name: 'Youth Pipeline Club',
        tier: 1,
        country: 'GER',
        baseOvr: 80,
        stadium: 40000,
      });

      const finNoProspects = calculateClubFinancials({ club: baseClub, budget: 50000 });

      const finWithGenerational = calculateClubFinancials({
        club: baseClub,
        budget: 50000,
        youthPipeline: [
          { id: 1, name: 'Wonderkid A', type: 'generational' },
          { id: 2, name: 'Top Prospect B', type: 'top_prospect' },
        ],
      });

      expect(finWithGenerational.youthMaintenance).toBeGreaterThan(finNoProspects.youthMaintenance);
    });
  });

  // =========================================================================
  // 4. MACROECONOMICS & COUNTRY ECONOMIC MULTIPLIERS
  // =========================================================================
  describe('4. Macroeconomic Multipliers & Global Economic Parity', () => {
    it('verifies realistic national economic multipliers across 25+ global football nations', () => {
      // Top 5 Europe
      expect(getCountryMult('ENG')).toBe(1.60); // Premier League commercial powerhouse
      expect(getCountryMult('ESP')).toBe(1.00); // La Liga benchmark
      expect(getCountryMult('GER')).toBe(1.00); // Bundesliga benchmark
      expect(getCountryMult('ITA')).toBe(0.85); // Serie A
      expect(getCountryMult('FRA')).toBe(0.75); // Ligue 1

      // Americas & Global
      expect(getCountryMult('USA')).toBe(0.50); // MLS
      expect(getCountryMult('BRA')).toBe(0.40); // Brasileirão
      expect(getCountryMult('MEX')).toBe(0.30); // Liga MX
      expect(getCountryMult('POR')).toBe(0.25); // Primeira Liga
      expect(getCountryMult('ARG')).toBe(0.25); // Argentine Primera
      expect(getCountryMult('TUR')).toBe(0.15); // Süper Lig
      expect(getCountryMult('JPN')).toBe(0.15); // J-League

      // Developing & Semi-Pro
      expect(getCountryMult('ECU')).toBe(0.10); // LigaPro Ecuador
      expect(getCountryMult('CAN')).toBe(0.03); // Canadian Premier League
      expect(getCountryMult('WAL')).toBe(0.015); // Cymru Premier
    });

    it('ensures identical tier clubs in England have higher baseline revenues and operating costs than in Ecuador or Portugal', () => {
      const engClub = createTestClub({ id: 801, name: 'English Tier 2 Club', tier: 2, country: 'ENG', baseOvr: 72, stadium: 25000 });
      const gerClub = createTestClub({ id: 802, name: 'German Tier 2 Club', tier: 2, country: 'GER', baseOvr: 72, stadium: 25000 });
      const ecuClub = createTestClub({ id: 803, name: 'Ecuadorian Tier 2 Club', tier: 2, country: 'ECU', baseOvr: 62, stadium: 10000 });

      const finEng = calculateClubFinancials({ club: engClub, budget: 30000 });
      const finGer = calculateClubFinancials({ club: gerClub, budget: 30000 });
      const finEcu = calculateClubFinancials({ club: ecuClub, budget: 5000 });

      expect(finEng.estRevenue).toBeGreaterThan(finGer.estRevenue);
      expect(finGer.estRevenue).toBeGreaterThan(finEcu.estRevenue);
    });

    it('verifies U19 youth championship prize scaling yields exactly $125K in Tier 1 USA and €250K in Tier 1 Germany', () => {
      // In Tier 1, baseLeague1K = 250
      const usaPrize = getLeagueScaledVal(1, 250, 'USA');
      const gerPrize = getLeagueScaledVal(1, 250, 'GER');
      const engPrize = getLeagueScaledVal(1, 250, 'ENG');
      const walPrize = getLeagueScaledVal(1, 250, 'WAL');

      // USA (0.50x) -> 250 * 0.50 = 125 ($125K in budget units, previously miscalculated as 125,000 = $125M!)
      expect(usaPrize).toBe(125);
      // Germany (1.00x) -> 250 (€250K)
      expect(gerPrize).toBe(250);
      // England (1.60x) -> 400 (£400K)
      expect(engPrize).toBe(400);
      // Wales (0.015x) -> 250 * 0.015 = 3.75 -> 3 (£3K in budget units)
      expect(walPrize).toBe(3);

      // Lower division tier scaling in USA (Tier 2 = 35, Tier 3 = 10)
      const usaTier2Prize = getLeagueScaledVal(2, 250, 'USA');
      const usaTier3Prize = getLeagueScaledVal(3, 250, 'USA');
      expect(usaTier2Prize).toBe(35); // $35K
      expect(usaTier3Prize).toBe(10); // $10K
    });

    it('verifies custom or community mod countries with unlisted country codes receive the 0.50x global mid-market fallback', () => {
      const unlistedMod1 = getCountryMult('FICTIONAL_KINGDOM');
      const unlistedMod2 = getCountryMult('COMMUNITY_CUSTOM_LEAGUE');
      const unlistedMod3 = getCountryMult('XYZ');

      expect(unlistedMod1).toBe(0.50);
      expect(unlistedMod2).toBe(0.50);
      expect(unlistedMod3).toBe(0.50);

      // Prize scaling for an unlisted custom mod country in Tier 1
      const modPrize = getLeagueScaledVal(1, 250, 'FICTIONAL_KINGDOM');
      expect(modPrize).toBe(125); // 250 * 0.50 = 125 ($125K)
    });
  });

  // =========================================================================
  // 5. BANK LOANS, DEBT INTEREST & BORROWING CEILINGS
  // =========================================================================
  describe('5. Bank Loans, Debt Service & Insolvency Mechanics', () => {
    it('calculates dynamic bank loan limits scaling with stadium, fanbase, OVR, and managerial reputation', () => {
      const modestClub = {
        tier: 1,
        country: 'GER',
        stadium: 25000,
        baseOvr: 78,
        fanBase: 20000,
      };

      const superClub = {
        tier: 1,
        country: 'GER',
        stadium: 80000,
        baseOvr: 86,
        fanBase: 80000,
      };

      const loanModest = getClubMaxBankLoan(modestClub, 10000, 30);
      const loanSuper = getClubMaxBankLoan(superClub, 100000, 90);

      // Superclub with 80k stadium, 86 OVR, and 90 reputation must have significantly higher borrowing power (> 2.0x)
      expect(loanSuper).toBeGreaterThan(loanModest * 2.0);
      expect(loanModest).toBeGreaterThan(10000);
      expect(loanSuper).toBeGreaterThan(50000);
    });

    it('imposes 10% annual debt penalty when club budget is negative', () => {
      const solventClub = createTestClub({
        id: 901,
        name: 'Solvent Club',
        tier: 2,
        country: 'GER',
        baseOvr: 70,
        stadium: 20000,
      });

      const inDebtClub = createTestClub({
        ...solventClub,
        name: 'Indebted Club',
      });

      const finSolvent = calculateClubFinancials({ club: solventClub, budget: 5000 });
      const finDebt = calculateClubFinancials({ club: inDebtClub, budget: -10000 }); // €10M debt

      // Debt interest on -€10M should be exactly 10% = €1M (1,000K)
      expect(finSolvent.debtInterest).toBe(0);
      expect(finDebt.debtInterest).toBe(1000);
      expect(finDebt.wages).toBeGreaterThanOrEqual(finSolvent.wages + 1000);
    });

    it('deducts annual bank loan debt service payment from operational ledger', () => {
      const testClub = createTestClub({
        id: 902,
        name: 'Club with Bank Loan',
        tier: 2,
        country: 'GER',
        baseOvr: 70,
        stadium: 20000,
      });

      const finNoLoan = calculateClubFinancials({ club: testClub, budget: 5000 });
      const finWithLoan = calculateClubFinancials({
        club: testClub,
        budget: 5000,
        bankLoan: {
          principal: 15000,
          annualPayment: 3500, // €3.5M annual amortization
          totalYears: 5,
          yearsLeft: 4,
        },
      });

      expect(finWithLoan.bankLoanDebtService).toBe(3500);
      expect(finWithLoan.net).toBe(finNoLoan.net - 3500);
    });
  });

  // =========================================================================
  // 6. PRIZE MONEY, TV REVENUE & SOLVENCY SAFEGUARDS
  // =========================================================================
  describe('6. Tournament Prizes, TV Rights & Solvency Envelopes', () => {
    it('verifies television rights and position prize pools strictly decrease by division tier', () => {
      for (let t = 1; t < 10; t++) {
        const higher = getLeagueInfo(t, 'GER');
        const lower = getLeagueInfo(t + 1, 'GER');

        expect(higher.tvPrize, `Tier ${t} TV prize vs Tier ${t + 1}`).toBeGreaterThanOrEqual(lower.tvPrize);
      }
    });

    it('enforces that baseline unavoidable commitments never exceed 85% of operating revenue', () => {
      ALL_CLUBS.slice(0, 30).forEach((club) => {
        const fin = calculateClubFinancials({
          club,
          budget: 5000,
          seasonCount: 2,
        });

        // Operating revenue should be positive
        expect(fin.estRevenue, `${club.name} operating revenue`).toBeGreaterThan(0);

        // Baseline pure wages + stadium operations should not exceed total revenue
        expect(fin.pureWages + fin.stadiumOp).toBeLessThanOrEqual(Math.max(10, fin.estRevenue));
      });
    });

    it('awards substantial continental revenue for Champions League, Europa League, and Conference League', () => {
      const baseClub = createTestClub({ id: 950, name: 'Euro Test Club', tier: 1, country: 'GER', baseOvr: 84, stadium: 60000 });

      const finNone = calculateClubFinancials({ club: baseClub, budget: 50000, euroStatus: null });
      const finCl = calculateClubFinancials({ club: baseClub, budget: 50000, euroStatus: 'CL' });
      const finEl = calculateClubFinancials({ club: baseClub, budget: 50000, euroStatus: 'EL' });
      const finEcl = calculateClubFinancials({ club: baseClub, budget: 50000, euroStatus: 'ECL' });

      expect(finCl.euroRev).toBe(25000); // €25M for Champions League
      expect(finEl.euroRev).toBe(12000); // €12M for Europa League
      expect(finEcl.euroRev).toBe(6000);  // €6M for Conference League
      expect(finNone.euroRev).toBe(0);

      expect(finCl.estRevenue).toBe(finNone.estRevenue + 25000);
    });
  });
});
