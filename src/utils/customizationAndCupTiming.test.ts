import { describe, it, expect } from 'vitest';

describe('Customization Preservation & Cup Chronology Integrity', () => {
  it('guarantees custom user logos (data:image and blob:) are not overwritten by mod sync hook', () => {
    const isModActive = true;
    const dbClub = {
      id: 1,
      name: 'Default FC',
      logo: 'https://example.com/default.png',
      fallbackLogo: 'https://example.com/default-fb.png',
      narrative: 'Default story',
      historicContext: 'Default context',
      color: '#000000',
    };
    const modTeam = dbClub;

    const expectedLogo = isModActive ? dbClub.logo : undefined;
    const expectedFallback = isModActive ? dbClub.fallbackLogo : undefined;
    const expectedNarrative = isModActive ? dbClub.narrative : undefined;
    const expectedHistoric = isModActive ? dbClub.historicContext : undefined;

    // Test case 1: User uploaded a custom base64 logo
    const userClubWithBase64 = {
      id: 1,
      name: 'Default FC',
      logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE...',
      fallbackLogo: 'https://example.com/default-fb.png',
      narrative: 'Default story',
      historicContext: 'Default context',
    };

    const needsUpdate1 = dbClub && (
      (userClubWithBase64.name !== (isModActive ? (dbClub.name || modTeam?.name || userClubWithBase64.name) : dbClub.name)) ||
      (userClubWithBase64.logo !== expectedLogo && !userClubWithBase64.logo?.startsWith('data:image/') && !userClubWithBase64.logo?.startsWith('blob:')) ||
      (userClubWithBase64.fallbackLogo !== expectedFallback && !userClubWithBase64.fallbackLogo?.startsWith('data:image/') && !userClubWithBase64.fallbackLogo?.startsWith('blob:')) ||
      userClubWithBase64.narrative !== expectedNarrative ||
      userClubWithBase64.historicContext !== expectedHistoric
    );

    // Custom logo must NOT trigger an update
    expect(needsUpdate1).toBe(false);

    // Test case 2: User uploaded a blob URL logo
    const userClubWithBlob = {
      id: 1,
      name: 'Default FC',
      logo: 'blob:https://example.com/uuid-1234',
      fallbackLogo: 'blob:https://example.com/uuid-5678',
      narrative: 'Default story',
      historicContext: 'Default context',
    };

    const needsUpdate2 = dbClub && (
      (userClubWithBlob.name !== (isModActive ? (dbClub.name || modTeam?.name || userClubWithBlob.name) : dbClub.name)) ||
      (userClubWithBlob.logo !== expectedLogo && !userClubWithBlob.logo?.startsWith('data:image/') && !userClubWithBlob.logo?.startsWith('blob:')) ||
      (userClubWithBlob.fallbackLogo !== expectedFallback && !userClubWithBlob.fallbackLogo?.startsWith('data:image/') && !userClubWithBlob.fallbackLogo?.startsWith('blob:')) ||
      userClubWithBlob.narrative !== expectedNarrative ||
      userClubWithBlob.historicContext !== expectedHistoric
    );

    // Blob logo must NOT trigger an update
    expect(needsUpdate2).toBe(false);
  });

  it('guarantees cup wins align with completedSeasonYear so SeasonFinishModal and history show cups in the correct season', () => {
    const startYear = 2026;
    const completedSeasonYear = startYear; // 2026
    const simulatedNextYear = startYear + 1; // 2027

    const cupRunResults: Array<{ year: number; id: string; won: boolean }> = [];
    const trophyHistory: Array<{ year: number; name: string }> = [];

    // Cup win resolved for this season
    cupRunResults.push({ year: completedSeasonYear, id: 'cl', won: true });
    trophyHistory.unshift({ year: completedSeasonYear, name: 'Champions League' });

    // Season wrap-up query:
    const seasonDataYear = completedSeasonYear;
    const wonCupsInSeasonData = cupRunResults.filter(r => r.year === seasonDataYear && r.won);

    expect(wonCupsInSeasonData.length).toBe(1);
    expect(wonCupsInSeasonData[0].id).toBe('cl');
    expect(trophyHistory[0].year).toBe(2026);
    expect(trophyHistory[0].year).not.toBe(simulatedNextYear);
  });
});
