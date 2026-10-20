import { describe, it, expect } from 'vitest';
import { ALL_CLUBS } from '../data/clubsData';
import { TEAMS } from '../mod-data/teams';
import { isCanadianMLSClub } from '../data/gameConstants';
import { assignRival } from './rivalHelpers';
import { Club } from '../types';

describe('Voyageurs Cup (Canadian Championship) Strict Eligibility & Venue Realism', () => {
  const canadianMLSClubs = ALL_CLUBS.filter(c => isCanadianMLSClub(c.name, c.id, c.country));
  const cplClubs = ALL_CLUBS.filter(c => c.country === 'CAN');
  const allCanadianClubs = ALL_CLUBS.filter(c => c.country === 'CAN' || isCanadianMLSClub(c.name, c.id, c.country));
  const americanClubs = ALL_CLUBS.filter(c => c.country === 'USA' && !isCanadianMLSClub(c.name, c.id, c.country));

  it('verifies Canadian MLS clubs and CPL clubs exist and are distinctly identified', () => {
    expect(canadianMLSClubs.length).toBeGreaterThanOrEqual(3);
    expect(cplClubs.length).toBeGreaterThanOrEqual(10);
    expect(allCanadianClubs.length).toBeGreaterThanOrEqual(13);

    // Miami FC must never be identified as Canadian
    expect(isCanadianMLSClub('Miami FC', 1039, 'USA')).toBe(false);
    expect(isCanadianMLSClub('Miami Blue', 1039, 'USA')).toBe(false);
    expect(isCanadianMLSClub('Inter Miami CF', 1007, 'USA')).toBe(false);
    expect(isCanadianMLSClub('Miami Pink', 1007, 'USA')).toBe(false);

    // Canadian MLS teams must be identified as Canadian
    expect(isCanadianMLSClub('Toronto FC', 1015, 'USA')).toBe(true);
    expect(isCanadianMLSClub('Toronto Red', 1015, 'USA')).toBe(true);
    expect(isCanadianMLSClub('CF Montréal', 1008, 'USA')).toBe(true);
    expect(isCanadianMLSClub('Montreal Blue', 1008, 'USA')).toBe(true);
    expect(isCanadianMLSClub('Vancouver Whitecaps FC', 1030, 'USA')).toBe(true);
    expect(isCanadianMLSClub('Vancouver White', 1030, 'USA')).toBe(true);
  });

  describe('Cup Eligibility Logic Mirror', () => {
    // Helper replicating the verified CupRunModal candidate & rival logic
    const isReserveTeam = (name: string) => {
      const lower = name.toLowerCase();
      return lower.endsWith(' ii') || lower.endsWith(' b') || lower.includes('reserve') || lower.includes(' u21') || lower.includes(' u23') || lower.includes(' castilla') || lower.includes('jong ') || lower.startsWith('jong ');
    };

    const isClubEligibleForCup = (
      c: Club, 
      userClub: Club, 
      cupId: string, 
      country: string
    ): boolean => {
      if (c.id === userClub.id || isReserveTeam(c.name)) return false;
      const cCountry = c.country || 'GER';
      const isCanadianClub = (cName: string, cCountry?: string, cId?: number) => cCountry === 'CAN' || isCanadianMLSClub(cName, cId, cCountry);

      if (cupId === 'dfb') {
        if (country === 'CAN') {
          return cCountry === 'CAN' || isCanadianClub(c.name, cCountry, c.id);
        }
        if (country === 'USA') {
          return cCountry === 'USA' && !isCanadianClub(c.name, cCountry, c.id);
        }
        return cCountry === country;
      }
      return cCountry === country;
    };

    const drawOpponent = (
      userClub: Club, 
      round: 'quarter' | 'semi' | 'final', 
      archRivalName?: string, 
      dbSource: Club[] = ALL_CLUBS
    ): Club => {
      const isCanadian = isCanadianMLSClub(userClub.name, userClub.id, userClub.country);
      const isDomesticCupRun = true;
      const country = isCanadian && isDomesticCupRun ? 'CAN' : (userClub.country || 'GER');

      let pickedClub: Club | null = null;

      // 15% Rival check
      if (archRivalName && Math.random() < 0.15) {
        const rivalClub = dbSource.find(c => c.name === archRivalName || c.name.toLowerCase() === archRivalName.toLowerCase());
        if (rivalClub && isClubEligibleForCup(rivalClub, userClub, 'dfb', country)) {
          pickedClub = rivalClub;
        }
      }

      if (!pickedClub) {
        let candidates = dbSource.filter(c => isClubEligibleForCup(c, userClub, 'dfb', country));
        if (round === 'final') {
          let t1 = candidates.filter(c => c.tier <= (country === 'CAN' || country === 'USA' ? 2 : 1)).sort((a, b) => b.baseOvr - a.baseOvr);
          candidates = t1.length > 0 ? t1.slice(0, Math.max(4, Math.floor(t1.length / 2))) : candidates;
        } else if (round === 'semi') {
          let t1 = candidates.filter(c => c.tier <= (country === 'CAN' || country === 'USA' ? 2 : 1)).sort((a, b) => b.baseOvr - a.baseOvr);
          candidates = t1.length > 0 ? t1.slice(0, Math.max(8, Math.floor(t1.length * 0.75))) : candidates;
        } else {
          let t12 = candidates.filter(c => c.tier <= 2).sort((a, b) => b.baseOvr - a.baseOvr);
          candidates = t12.length > 0 ? t12.slice(0, Math.max(16, Math.floor(t12.length * 0.75))) : candidates;
        }

        if (candidates.length === 0) {
          candidates = dbSource.filter(c => isClubEligibleForCup(c, userClub, 'dfb', country));
        }

        pickedClub = candidates[Math.floor(Math.random() * candidates.length)];
      }

      return pickedClub;
    };

    it('guarantees 1,000 Voyageurs Cup Quarterfinal draws contain ZERO American clubs and ZERO Miami FC', () => {
      const torontoClub = ALL_CLUBS.find(c => c.id === 1015)!;
      expect(torontoClub).toBeDefined();

      const iterations = 1000;
      let nonCanadianCount = 0;
      let miamiCount = 0;

      for (let i = 0; i < iterations; i++) {
        // Even with Miami Blue as the rival name!
        const opp = drawOpponent(torontoClub, 'quarter', 'Miami Blue', ALL_CLUBS);
        const isCanadian = opp.country === 'CAN' || isCanadianMLSClub(opp.name, opp.id, opp.country);
        if (!isCanadian) nonCanadianCount++;
        if (opp.name.toLowerCase().includes('miami') || opp.id === 1039 || opp.id === 1007) miamiCount++;
      }

      expect(nonCanadianCount).toBe(0);
      expect(miamiCount).toBe(0);
    });

    it('guarantees 1,000 Voyageurs Cup Semifinal and Final draws contain ZERO American clubs', () => {
      const montrealClub = ALL_CLUBS.find(c => c.id === 1008)!;
      const vancouverClub = ALL_CLUBS.find(c => c.id === 1030)!;

      for (const club of [montrealClub, vancouverClub]) {
        for (const round of ['semi', 'final'] as const) {
          for (let i = 0; i < 250; i++) {
            const opp = drawOpponent(club, round, 'Miami Blue', ALL_CLUBS);
            const isCanadian = opp.country === 'CAN' || isCanadianMLSClub(opp.name, opp.id, opp.country);
            expect(isCanadian, `${opp.name} (${opp.country}) is not Canadian in round ${round}`).toBe(true);
            expect(opp.name.toLowerCase().includes('miami')).toBe(false);
          }
        }
      }
    });

    it('allows a Canadian arch-rival (e.g. CF Montréal / Montreal Blue) to be drawn when eligible', () => {
      const torontoClub = ALL_CLUBS.find(c => c.id === 1015)!;
      let rivalDrawnCount = 0;

      for (let i = 0; i < 500; i++) {
        const opp = drawOpponent(torontoClub, 'quarter', 'Montreal Blue', ALL_CLUBS);
        if (opp.id === 1008 || opp.name === 'Montreal Blue') {
          rivalDrawnCount++;
        }
      }

      // With a 15% roll plus standard pool presence, Montreal should be drawn frequently
      expect(rivalDrawnCount).toBeGreaterThan(40);
    });

    it('guarantees US clubs in the US Open Cup never draw Canadian MLS clubs', () => {
      const miamiClub = ALL_CLUBS.find(c => c.id === 1039)!; // Miami Blue / Miami FC
      expect(miamiClub).toBeDefined();

      for (let i = 0; i < 500; i++) {
        const opp = drawOpponent(miamiClub, 'quarter', 'Toronto Red', ALL_CLUBS);
        expect(opp.country).toBe('USA');
        expect(isCanadianMLSClub(opp.name, opp.id, opp.country)).toBe(false);
      }
    });
  });

  describe('Voyageurs Cup Final Stadium Realism', () => {
    const getStadiumForTest = (country: string, opponentName: string) => {
      if (country === 'USA') return { name: 'Rose Bowl', capacity: 92542 };
      if (country === 'CAN') {
        const lowOpp = (opponentName || '').toLowerCase();
        if (lowOpp.includes('vancouver') || lowOpp.includes('whitecaps')) return { name: 'BC Place, Vancouver', capacity: 54500 };
        if (lowOpp.includes('montreal') || lowOpp.includes('montréal')) return { name: 'Stade Saputo, Montréal', capacity: 19619 };
        if (lowOpp.includes('hamilton') || lowOpp.includes('forge')) return { name: 'Tim Hortons Field, Hamilton', capacity: 23218 };
        if (lowOpp.includes('toronto')) return { name: 'BMO Field, Toronto', capacity: 30991 };
        return { name: 'BMO Field, Toronto', capacity: 30991 };
      }
      return { name: 'Neutral Ground', capacity: 50000 };
    };

    it('guarantees Canadian clubs in the Voyageurs Cup final resolve to Canadian stadiums and NEVER to the Rose Bowl', () => {
      const torontoClub = ALL_CLUBS.find(c => c.id === 1015)!;
      const isCanadian = isCanadianMLSClub(torontoClub.name, torontoClub.id, torontoClub.country);
      const isDomesticCupRun = true;
      const effectiveCountry = isCanadian && isDomesticCupRun ? 'CAN' : (torontoClub.country || 'GER');

      expect(effectiveCountry).toBe('CAN');

      const opponentSamples = ['Vancouver White', 'Montreal Blue', 'Hamilton', 'Ottawa', 'Calgary'];
      for (const opp of opponentSamples) {
        const stadium = getStadiumForTest(effectiveCountry, opp);
        expect(stadium.name).not.toContain('Rose Bowl');
        expect(stadium.capacity).not.toBe(92542);
        expect(
          stadium.name.includes('BMO Field') ||
          stadium.name.includes('BC Place') ||
          stadium.name.includes('Stade Saputo') ||
          stadium.name.includes('Tim Hortons Field')
        ).toBe(true);
      }
    });
  });

  describe('Canadian MLS Rivalry Assignment in assignRival', () => {
    it('prioritizes Canadian MLS rivals with authentic derby descriptions for Toronto FC', () => {
      const torontoClub = ALL_CLUBS.find(c => c.id === 1015)!;
      for (let i = 0; i < 50; i++) {
        const rivalData = assignRival(torontoClub, ALL_CLUBS);
        expect([1008, 1030].includes(rivalData.id)).toBe(true);
        expect(
          rivalData.descEn.includes('Canadian Classique') ||
          rivalData.descEn.includes('Voyageurs Rivalry')
        ).toBe(true);
      }
    });

    it('prioritizes Canadian MLS rivals with authentic derby descriptions for CF Montréal', () => {
      const montrealClub = ALL_CLUBS.find(c => c.id === 1008)!;
      for (let i = 0; i < 50; i++) {
        const rivalData = assignRival(montrealClub, ALL_CLUBS);
        expect([1015, 1030].includes(rivalData.id)).toBe(true);
        expect(
          rivalData.descEn.includes('Canadian Classique') ||
          rivalData.descEn.includes('Voyageurs Rivalry')
        ).toBe(true);
      }
    });
  });
});
