import { describe, it, expect } from 'vitest';
import { validateSponsorContent } from './sponsorModeration';

describe('Sponsor Content Moderation Guard', () => {
  it('allows safe, legitimate football and creator brands', () => {
    const valid1 = validateSponsorContent({
      brandName: 'Tactical Lab UK',
      tagline: 'Managerial Analytics & Press Breakdown',
      linkUrl: 'https://youtube.com/@tacticallab'
    });
    expect(valid1.isValid).toBe(true);

    const valid2 = validateSponsorContent({
      brandName: 'The Boot Room Pod',
      tagline: 'Weekly Touchline Drama & Tactics',
      linkUrl: 'https://spotify.com/show/bootroom'
    });
    expect(valid2.isValid).toBe(true);
  });

  it('auto-blocks weapons, firearms, ammunition, and violence', () => {
    const weapon1 = validateSponsorContent({
      brandName: 'Tactical Guns & Ammo Store',
      linkUrl: 'https://example.com'
    });
    expect(weapon1.isValid).toBe(false);
    expect(weapon1.reason).toContain('weapons, firearms, or violence');

    const weapon2 = validateSponsorContent({
      brandName: 'Rifle & Pistol Depot',
      tagline: 'Best assault rifles and shotguns',
      linkUrl: 'https://example.com'
    });
    expect(weapon2.isValid).toBe(false);
    expect(weapon2.reason).toContain('weapons, firearms, or violence');

    const weapon3 = validateSponsorContent({
      brandName: 'AK-47 Club',
      linkUrl: 'https://example.com'
    });
    expect(weapon3.isValid).toBe(false);

    const weapon4 = validateSponsorContent({
      brandName: 'Explosives & Grenades Co',
      linkUrl: 'https://example.com'
    });
    expect(weapon4.isValid).toBe(false);
  });

  it('auto-blocks political propaganda, campaigns, and political figures', () => {
    const political1 = validateSponsorContent({
      brandName: 'Vote For Trump 2026',
      linkUrl: 'https://example.com'
    });
    expect(political1.isValid).toBe(false);
    expect(political1.reason).toContain('political statements');

    const political2 = validateSponsorContent({
      brandName: 'Support Biden Campaign',
      linkUrl: 'https://example.com'
    });
    expect(political2.isValid).toBe(false);

    const political3 = validateSponsorContent({
      brandName: 'AfD Party Supporters',
      linkUrl: 'https://example.com'
    });
    expect(political3.isValid).toBe(false);

    const political4 = validateSponsorContent({
      brandName: 'Nazi Youth League',
      linkUrl: 'https://example.com'
    });
    expect(political4.isValid).toBe(false);
  });

  it('auto-blocks nudity, sexual, pornographic, and adult content', () => {
    const adult1 = validateSponsorContent({
      brandName: 'Hot XXX Porn Hub',
      linkUrl: 'https://example.com'
    });
    expect(adult1.isValid).toBe(false);
    expect(adult1.reason).toContain('nudity, pornography, or adult material');

    const adult2 = validateSponsorContent({
      brandName: 'My OnlyFans Page',
      linkUrl: 'https://onlyfans.com/model'
    });
    expect(adult2.isValid).toBe(false);

    const adult3 = validateSponsorContent({
      brandName: 'VIP Escort Service',
      tagline: 'Hot girls in your area',
      linkUrl: 'https://example.com'
    });
    expect(adult3.isValid).toBe(false);

    const adult4 = validateSponsorContent({
      brandName: 'Nude Models Club',
      linkUrl: 'https://example.com'
    });
    expect(adult4.isValid).toBe(false);
  });

  it('blocks profanity and swear words', () => {
    const profanity1 = validateSponsorContent({
      brandName: 'Fuck FC',
      linkUrl: 'https://example.com'
    });
    expect(profanity1.isValid).toBe(false);
    expect(profanity1.reason).toContain('profanity, offensive, or vulgar language');

    const profanity2 = validateSponsorContent({
      brandName: 'Clean Brand',
      tagline: 'We are the fucking best',
      linkUrl: 'https://example.com'
    });
    expect(profanity2.isValid).toBe(false);

    const profanityDe = validateSponsorContent({
      brandName: 'Scheisse Club',
      linkUrl: 'https://example.com'
    });
    expect(profanityDe.isValid).toBe(false);
  });

  it('catches obfuscated and character-substituted leetspeak bypasses', () => {
    const bypass1 = validateSponsorContent({
      brandName: 'p0rn hub live',
      linkUrl: 'https://example.com'
    });
    expect(bypass1.isValid).toBe(false);

    const bypass2 = validateSponsorContent({
      brandName: 'f.u.c.k that',
      linkUrl: 'https://example.com'
    });
    expect(bypass2.isValid).toBe(false);

    const bypass3 = validateSponsorContent({
      brandName: 'g.u.n.s for sale',
      linkUrl: 'https://example.com'
    });
    expect(bypass3.isValid).toBe(false);
  });
});
