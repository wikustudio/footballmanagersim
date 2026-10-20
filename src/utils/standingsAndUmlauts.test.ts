import { describe, it, expect } from 'vitest';
import { sanitizeGermanText, sanitizePlayerName } from '../data/gameConstants';
import { getRegionalQualificationLegend, getRegion } from './regionHelpers';
import { simulateAiLeagues } from '../engine/simulateAiLeagues';
import { Club, GameState } from '../types';

describe('German Umlaut & Special Character Transliteration', () => {
  it('correctly transliterates standard German umlauts into ae, oe, ue, and ss', () => {
    expect(sanitizeGermanText('Müller')).toBe('Mueller');
    expect(sanitizeGermanText('Schröder')).toBe('Schroeder');
    expect(sanitizeGermanText('Kühne')).toBe('Kuehne');
    expect(sanitizeGermanText('Schäfer')).toBe('Schaefer');
    expect(sanitizeGermanText('Kröger')).toBe('Kroeger');
    expect(sanitizeGermanText('Schließen')).toBe('Schliessen');
    expect(sanitizeGermanText('Übernahme')).toBe('Uebernahme');
  });

  it('corrects corrupted German strings missing characters', () => {
    expect(sanitizeGermanText('Lebensmittelprfer haben kalte, zhe Wrstchen bemngelt!')).toContain('Lebensmittelpruefer');
    expect(sanitizeGermanText('Lebensmittelprfer haben kalte, zhe Wrstchen bemngelt!')).toContain('Wuerstchen');
    expect(sanitizeGermanText('Lebensmittelprfer haben kalte, zhe Wrstchen bemngelt!')).toContain('bemaengelt');
    expect(sanitizeGermanText('Mngel in der Anlage')).toContain('Maengel');
    expect(sanitizeGermanText('Prfer beanstanden')).toContain('Pruefer');
    expect(sanitizeGermanText('zurckgestuft')).toBe('zurueckgestuft');
  });

  it('sanitizes player names with German umlauts and international accents into clean Latin characters', () => {
    expect(sanitizePlayerName('Thomas Müller')).toBe('Thomas Mueller');
    expect(sanitizePlayerName('Leroy Sané')).toBe('Leroy Sane');
    expect(sanitizePlayerName('Ángel Di María')).toBe('Angel Di Maria');
    expect(sanitizePlayerName('ngel Di Mara')).toBe('Angel Di Maria');
    expect(sanitizePlayerName('Julián Álvarez')).toBe('Julian Alvarez');
    expect(sanitizePlayerName('Nicolás González')).toBe('Nicolas Gonzalez');
    expect(sanitizePlayerName('Kylian Mbappé')).toBe('Kylian Mbappe');
  });
});

describe('Regional Qualification Spots in Standings', () => {
  it('assigns authentic CONMEBOL tournaments for Argentina and South America', () => {
    expect(getRegion('ARG')).toBe('CONMEBOL');
    const argLegend = getRegionalQualificationLegend('ARG');
    expect(argLegend.primary).toContain('Copa Libertadores');
    expect(argLegend.secondary).toContain('Copa Sudamericana');
    expect(argLegend.relegation).toContain('Relegation');

    const braLegend = getRegionalQualificationLegend('BRA');
    expect(braLegend.primary).toContain('Copa Libertadores');
    expect(braLegend.secondary).toContain('Copa Sudamericana');
  });

  it('assigns European tournaments for UEFA countries like Germany', () => {
    expect(getRegion('GER')).toBe('UEFA');
    const gerLegend = getRegionalQualificationLegend('GER');
    expect(gerLegend.primary).toContain('Champions League');
    expect(gerLegend.secondary).toContain('European Cup');
    expect(gerLegend.relegation).toContain('Relegation');
  });

  it('assigns CONCACAF tournaments for USA and North America', () => {
    expect(getRegion('USA')).toBe('CONCACAF');
    const usaLegend = getRegionalQualificationLegend('USA');
    expect(usaLegend.primary).toContain('CONCACAF Champions Cup');
    expect(usaLegend.secondary).toContain('Leagues Cup');
  });
});

describe('Standings Promotion & Relegation Carryover & Archive', () => {
  it('promotes CA Boca Juniors and CA Sarmiento from Primera Nacional (Tier 2) to Primera División (Tier 1)', () => {
    const clubs: Club[] = [
      // Argentina Tier 1 Clubs (baseOvr 60-75)
      { id: 1901, name: 'CA River Plate', tier: 1, baseOvr: 75, color: '#ff0000', stadium: 80000, country: 'ARG' },
      { id: 1903, name: 'Racing Club', tier: 1, baseOvr: 74, color: '#00ffff', stadium: 50000, country: 'ARG' },
      { id: 1904, name: 'CA Independiente', tier: 1, baseOvr: 73, color: '#ff0000', stadium: 48000, country: 'ARG' },
      { id: 1905, name: 'CA San Lorenzo', tier: 1, baseOvr: 72, color: '#0000ff', stadium: 45000, country: 'ARG' },
      { id: 1907, name: 'Estudiantes de La Plata', tier: 1, baseOvr: 71, color: '#ff0000', stadium: 35000, country: 'ARG' },
      { id: 1908, name: 'CA Rosario Central', tier: 1, baseOvr: 70, color: '#ffff00', stadium: 40000, country: 'ARG' },
      { id: 1917, name: 'Club Atlético Tucumán', tier: 1, baseOvr: 60, color: '#00aaff', stadium: 35000, country: 'ARG' },
      { id: 1918, name: 'CA Banfield', tier: 1, baseOvr: 59, color: '#008800', stadium: 34000, country: 'ARG' },
      // Argentina Tier 2 Clubs: CA Boca Juniors and CA Sarmiento high OVR to earn promotion
      { id: 1902, name: 'CA Boca Juniors', tier: 2, baseOvr: 80, color: '#003b8e', stadium: 54000, country: 'ARG' },
      { id: 1925, name: 'CA Sarmiento', tier: 2, baseOvr: 78, color: '#008000', stadium: 22000, country: 'ARG' },
      { id: 1926, name: 'CA Central Córdoba', tier: 2, baseOvr: 64, color: '#000000', stadium: 20000, country: 'ARG' },
      { id: 1927, name: 'Deportivo Riestra', tier: 2, baseOvr: 63, color: '#000000', stadium: 10000, country: 'ARG' },
    ];

    const userClubId = 1901; // User is River Plate
    const nextClubs = simulateAiLeagues(clubs, userClubId, 2026, []);

    // Verify standingsArchive was created for 2026
    const standingsArchive = (nextClubs as any).standingsArchive;
    expect(standingsArchive).toBeDefined();
    expect(standingsArchive[2]).toBeDefined();

    // In Tier 2 standings for 2026: Boca and Sarmiento finished 1st and 2nd
    const t2Table = standingsArchive[2];
    const bocaInT2 = t2Table.find((r: any) => r.id === 1902 || r.name === 'CA Boca Juniors');
    const sarmientoInT2 = t2Table.find((r: any) => r.id === 1925 || r.name === 'CA Sarmiento');
    expect(bocaInT2).toBeDefined();
    expect(sarmientoInT2).toBeDefined();
    expect(bocaInT2.pos).toBeLessThanOrEqual(2);
    expect(sarmientoInT2.pos).toBeLessThanOrEqual(2);

    // In 2027 (nextClubs): Boca and Sarmiento have been promoted to Tier 1!
    const bocaNext = nextClubs.find(c => c.id === 1902);
    const sarmientoNext = nextClubs.find(c => c.id === 1925);
    expect(bocaNext?.tier).toBe(1);
    expect(sarmientoNext?.tier).toBe(1);

    // And movements track their promotion
    const movements = (nextClubs as any).movements;
    expect(movements.some((m: any) => m.clubId === 1902 && m.type === 'promotion' && m.toTier === 1)).toBe(true);
    expect(movements.some((m: any) => m.clubId === 1925 && m.type === 'promotion' && m.toTier === 1)).toBe(true);
  });
});
