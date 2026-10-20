import { describe, it, expect } from 'vitest';
import { isReserveClub } from '../data/gameConstants';

describe('Standings Outcome Badges (C, P, R)', () => {
  it('correctly assigns C, P, and R based on tier, position, and next tier progression', () => {
    const tierNum = 4;
    const nextClubsDb = [
      { id: 101, name: 'Champion FC', tier: 3 }, // 1st place in Tier 4 -> promoted to Tier 3
      { id: 102, name: 'RunnerUp FC', tier: 3 }, // 2nd place in Tier 4 -> promoted to Tier 3
      { id: 103, name: 'US Creteil-Lusitanos', tier: 4 }, // 3rd place in Tier 4 -> stayed in Tier 4
      { id: 104, name: 'FC Dieppe', tier: 3 }, // Won playoff -> promoted to Tier 3!
      { id: 105, name: 'Midtable Club', tier: 4 }, // Stayed in Tier 4
      { id: 116, name: 'La Roche VF', tier: 5 }, // 16th in Tier 4, lost playoff -> relegated to Tier 5
      { id: 117, name: 'Bottom Relegated 1', tier: 5 }, // 17th -> relegated to Tier 5
      { id: 118, name: 'Bottom Relegated 2', tier: 5 }, // 18th -> relegated to Tier 5
    ];

    const standingsRows = [
      { id: 101, name: 'Champion FC', pos: 1, isUser: false },
      { id: 102, name: 'RunnerUp FC', pos: 2, isUser: false },
      { id: 103, name: 'US Creteil-Lusitanos', pos: 3, isUser: false },
      { id: 104, name: 'FC Dieppe', pos: 5, isUser: false },
      { id: 105, name: 'Midtable Club', pos: 10, isUser: false },
      { id: 116, name: 'La Roche VF', pos: 16, isUser: false },
      { id: 117, name: 'Bottom Relegated 1', pos: 17, isUser: false },
      { id: 118, name: 'Bottom Relegated 2', pos: 18, isUser: false },
    ];

    const stampedRows = standingsRows.map((r, idx) => {
      const pos = r.pos || idx + 1;
      const updatedClub = nextClubsDb.find(nc => nc.id === r.id);
      const nextT = updatedClub?.tier ?? tierNum;

      let status: 'C' | 'P' | 'R' | undefined;
      if (pos === 1) {
        status = 'C';
      } else if (nextT < tierNum || (tierNum > 1 && pos === 2 && !isReserveClub(r.name))) {
        status = 'P';
      } else if (nextT > tierNum) {
        status = 'R';
      }

      return { ...r, status };
    });

    const statusMap = Object.fromEntries(stampedRows.map(r => [r.name, r.status]));

    expect(statusMap['Champion FC']).toBe('C');
    expect(statusMap['RunnerUp FC']).toBe('P');
    expect(statusMap['US Creteil-Lusitanos']).toBeUndefined();
    expect(statusMap['FC Dieppe']).toBe('P'); // Playoff winner promoted
    expect(statusMap['Midtable Club']).toBeUndefined();
    expect(statusMap['La Roche VF']).toBe('R'); // Playoff loser relegated
    expect(statusMap['Bottom Relegated 1']).toBe('R');
    expect(statusMap['Bottom Relegated 2']).toBe('R');
  });

  it('guarantees Tier 1 champion gets C and not P, and bottom clubs get R', () => {
    const tierNum = 1;
    const nextClubsDb = [
      { id: 1, name: 'Top Champion', tier: 1 },
      { id: 2, name: 'Second Place', tier: 1 },
      { id: 17, name: 'Relegated 1', tier: 2 },
      { id: 18, name: 'Relegated 2', tier: 2 },
    ];

    const standingsRows = [
      { id: 1, name: 'Top Champion', pos: 1, isUser: false },
      { id: 2, name: 'Second Place', pos: 2, isUser: false },
      { id: 17, name: 'Relegated 1', pos: 17, isUser: false },
      { id: 18, name: 'Relegated 2', pos: 18, isUser: false },
    ];

    const stampedRows = standingsRows.map((r, idx) => {
      const pos = r.pos || idx + 1;
      const updatedClub = nextClubsDb.find(nc => nc.id === r.id);
      const nextT = updatedClub?.tier ?? tierNum;

      let status: 'C' | 'P' | 'R' | undefined;
      if (pos === 1) {
        status = 'C';
      } else if (nextT < tierNum || (tierNum > 1 && pos === 2 && !isReserveClub(r.name))) {
        status = 'P';
      } else if (nextT > tierNum) {
        status = 'R';
      }

      return { ...r, status };
    });

    const statusMap = Object.fromEntries(stampedRows.map(r => [r.name, r.status]));

    expect(statusMap['Top Champion']).toBe('C');
    expect(statusMap['Second Place']).toBeUndefined(); // Tier 1 2nd place is not promoted
    expect(statusMap['Relegated 1']).toBe('R');
    expect(statusMap['Relegated 2']).toBe('R');
  });
});
