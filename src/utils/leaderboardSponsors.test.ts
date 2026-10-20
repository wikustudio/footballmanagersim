// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  SPONSOR_PACKAGES,
  DEFAULT_PRESS_SPONSORS,
  TOTAL_PRESS_SLOTS,
  HEADLINE_SLOTS_COUNT,
  GRID_SLOTS_COUNT,
  partitionPressSlots,
  getLocalSponsors,
  registerActiveSponsor,
  fetchPressSponsors,
  fetchTop50Highscores,
  PressSponsor
} from '../lib/supabaseClient';

describe('Sponsor Wall & Leaderboard Package Configuration', () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // safe fallback
    }
  });

  it('defines valid pricing, duration, and metadata for all 3 sponsorship tiers', () => {
    expect(SPONSOR_PACKAGES['30_days'].priceEur).toBe(0.99);
    expect(SPONSOR_PACKAGES['30_days'].durationDays).toBe(30);

    expect(SPONSOR_PACKAGES['90_days'].priceEur).toBe(2.49);
    expect(SPONSOR_PACKAGES['90_days'].durationDays).toBe(90);

    expect(SPONSOR_PACKAGES['1_year'].priceEur).toBe(4.99);
    expect(SPONSOR_PACKAGES['1_year'].durationDays).toBe(365);
  });

  it('enforces exact 18-slot media wall capacity (3 Headline + 15 Step-and-Repeat)', () => {
    expect(TOTAL_PRESS_SLOTS).toBe(18);
    expect(HEADLINE_SLOTS_COUNT).toBe(3);
    expect(GRID_SLOTS_COUNT).toBe(15);
    expect(HEADLINE_SLOTS_COUNT + GRID_SLOTS_COUNT).toBe(TOTAL_PRESS_SLOTS);
  });

  it('partitions sponsors accurately into headline and grid slots with correct availability counts', () => {
    const dummySponsors: PressSponsor[] = [
      {
        id: 'h1',
        brand_name: 'Headline 1',
        logo_url: '',
        link_url: 'https://h1.com',
        package_type: '1_month',
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        is_active: true,
        is_headline: true
      },
      {
        id: 'g1',
        brand_name: 'Grid 1',
        logo_url: '',
        link_url: 'https://g1.com',
        package_type: '1_day',
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        is_active: true
      }
    ];

    const partitioned = partitionPressSlots(dummySponsors);
    expect(partitioned.headlineSlots.length).toBe(HEADLINE_SLOTS_COUNT);
    expect(partitioned.gridSlots.length).toBe(GRID_SLOTS_COUNT);
    expect(partitioned.occupiedCount).toBe(2);
    expect(partitioned.availableCount).toBe(16);
    expect(partitioned.headlineSlots[0]?.brand_name).toBe('Headline 1');
    expect(partitioned.headlineSlots[1]).toBeNull();
    expect(partitioned.gridSlots[0]?.brand_name).toBe('Grid 1');
  });

  it('provides rich default press room sponsors for immediate immersion', () => {
    expect(DEFAULT_PRESS_SPONSORS.length).toBeGreaterThanOrEqual(4);
    const hasHeadline = DEFAULT_PRESS_SPONSORS.some(s => s.is_headline);
    expect(hasHeadline).toBe(true);
  });

  it('stores and retrieves purchased sponsor slots in local storage', async () => {
    const sponsor = await registerActiveSponsor({
      brand_name: 'Tactical Arena',
      logo_url: 'https://example.com/logo.png',
      link_url: 'https://example.com',
      package_type: '1_week',
      tagline: 'Football Intelligence'
    });

    expect(sponsor.brand_name).toBe('Tactical Arena');
    expect(sponsor.package_type).toBe('1_week');
    expect(sponsor.is_active).toBe(true);

    const saved = getLocalSponsors();
    expect(saved.some(s => s.brand_name === 'Tactical Arena')).toBe(true);
  });

  it('calculates accurate expiration dates based on duration tier', async () => {
    const thirtyDays = await registerActiveSponsor({
      brand_name: 'ThirtyDayPartner',
      logo_url: 'https://example.com/logo.png',
      link_url: 'https://example.com',
      package_type: '30_days'
    });

    const diffMs = new Date(thirtyDays.expires_at).getTime() - new Date(thirtyDays.starts_at).getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    expect(diffHours).toBe(30 * 24);
  });

  it('fetchPressSponsors returns merged sponsor pool without crashing', async () => {
    const sponsors = await fetchPressSponsors();
    expect(Array.isArray(sponsors)).toBe(true);
    expect(sponsors.length).toBeGreaterThanOrEqual(0);
  });

  it('fetchTop50Highscores returns array of entries bounded to at most 50', async () => {
    const top50 = await fetchTop50Highscores();
    expect(Array.isArray(top50)).toBe(true);
    expect(top50.length).toBeLessThanOrEqual(50);
  });
});
