/**
 * Sponsor Content Moderation Guard
 * Strict multi-layer auto-filter for:
 * - Weapons, Firearms, Ammunition, Explosives & Violence
 * - Politics, Elections, Politicians & Divisive Ideology
 * - Nudity, Pornography, Sex Work & Adult Entertainment
 * - Drugs, Narcotics & Controlled Substances
 * - Profanity, Hate Speech & Harassment
 */

// Categorized term definitions for precise auto-rejection messages
const WEAPONS_KEYWORDS: string[] = [
  'weapon', 'weapons', 'gun', 'guns', 'firearm', 'firearms', 'pistol', 'pistols',
  'rifle', 'rifles', 'shotgun', 'shotguns', 'ammo', 'ammunition', 'bullets',
  'ar-15', 'ar15', 'ak-47', 'ak47', 'glock', 'assault weapon', 'grenade', 'grenades',
  'bomb', 'bombs', 'explosive', 'explosives', 'warhead', 'landmine', 'sniper',
  'gun shop', 'arms dealer', 'silencer', 'knifefight', 'murder', 'assassinate',
  'massacre', 'shootout', 'militia'
];

const ADULT_NUDITY_KEYWORDS: string[] = [
  'porn', 'porno', 'pornography', 'xxx', 'sex', 'sexy', 'nude', 'nudity', 'naked',
  'topless', 'erotic', 'erotica', 'escort', 'escorts', 'camgirl', 'onlyfans', 'fansly',
  'stripclub', 'strip club', 'stripper', 'boobs', 'penis', 'vagina', 'hentai', 'milf',
  'fetish', 'hardcore', 'playboy', 'penthouse', 'hustler', 'xvideos', 'pornhub',
  'redtube', 'chaturbate', 'adult dating', 'blowjob', 'handjob', 'anal', 'dildo',
  'nsfw', 'brothel', 'prostitution', 'sex work', 'webcam sex', 'cybersex', 'sugar daddy',
  'cam site', 'masturbat'
];

const POLITICAL_KEYWORDS: string[] = [
  'vote for', 'vote', 'voting', 'ballot', 'democrat', 'democrats', 'democratic party',
  'republican', 'republicans', 'gop', 'trump', 'biden', 'kamala harris', 'putin',
  'zelensky', 'netanyahu', 'afd', 'cdu', 'spd', 'greens party', 'labour party', 'tory',
  'tories', 'conservative party', 'fascist', 'fascism', 'nazi', 'neo-nazi', 'antifa',
  'communist', 'communism', 'white power', 'supremacist', 'jihad', 'terrorist',
  'propaganda', 'election', 'elections', 'maga', 'zionist', 'zionism', 'antisemitic',
  'genocide', 'political party', 'campaign 2024', 'campaign 2026', 'parliament',
  'senate', 'congress', 'dictator', 'regime change', 'leftist', 'alt-right', 'politician',
  'presidential campaign', 'referendum'
];

const DRUGS_KEYWORDS: string[] = [
  'cocaine', 'heroin', 'meth', 'methamphetamine', 'fentanyl', 'ecstasy', 'mdma',
  'weed dispensary', 'cannabis dispensary', 'buy weed', 'magic mushrooms', 'lsd',
  'psychedelics', 'steroids shop', 'anabolic steroids', 'narcotics'
];

const PROFANITY_KEYWORDS: string[] = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy', 'cock', 'twat',
  'motherfucker', 'wanker', 'prick', 'bollocks', 'arsehole', 'fucker', 'fucking', 'bullshit',
  'scheisse', 'arschloch', 'hurensohn', 'wichser', 'fotze', 'schlampe', 'miststueck',
  'merde', 'puta', 'cabron', 'cojones', 'vaffanculo', 'chutiya'
];

// Combine all prohibited terms for fast matching
const ALL_PROHIBITED: Array<{ list: string[]; category: string }> = [
  { list: WEAPONS_KEYWORDS, category: 'weapons, firearms, or violence' },
  { list: ADULT_NUDITY_KEYWORDS, category: 'nudity, pornography, or adult material' },
  { list: POLITICAL_KEYWORDS, category: 'political statements, electioneering, or political campaigns' },
  { list: DRUGS_KEYWORDS, category: 'drugs, narcotics, or controlled substances' },
  { list: PROFANITY_KEYWORDS, category: 'profanity, offensive, or vulgar language' }
];

// Regex builder with word-boundary and character substitution awareness
function buildModerationPattern(keyword: string): RegExp {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|\\b|\\W)${escaped}(\\b|\\W|$)`, 'i');
}

/**
 * Normalizes text to prevent common leetspeak or character-replacement bypasses
 * Handles character substitutions (e.g. 0 -> o, @ -> a) and de-obfuscates
 * spaced/dotted single letters (e.g. "f.u.c.k", "p 0 r n", "g.u.n.s") while preserving normal words.
 */
function normalizeText(text: string): string {
  const substituted = text
    .toLowerCase()
    .replace(/[@]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$]/g, 's')
    .replace(/[*#]/g, '')
    .trim();

  // De-obfuscate spaced or dotted single characters: "f.u.c.k" or "g u n s" -> "fuck", "guns"
  const deobfuscated = substituted.replace(/(\b[a-z0-9])[\s._\-]+(?=[a-z0-9](\b|[\s._\-]))/gi, '$1');

  return `${substituted} ${deobfuscated}`;
}

export interface ModerationResult {
  isValid: boolean;
  reason?: string;
  matchedTerm?: string;
  category?: string;
}

/**
 * Validates brand name, tagline, and destination URL against strict brand safety rules.
 * Automatically and non-negotiably blocks:
 * 1. Weapons, firearms, explosives & violence
 * 2. Politics, elections, campaigns & politicians
 * 3. Nudity, pornography & adult entertainment
 * 4. Drugs, narcotics & illegal substances
 * 5. Profanity, vulgarity & hate speech
 */
export function validateSponsorContent(params: {
  brandName?: string;
  tagline?: string;
  linkUrl?: string;
}): ModerationResult {
  const combined = [
    params.brandName || '',
    params.tagline || '',
    params.linkUrl || ''
  ].join(' ');

  const normalized = normalizeText(combined);

  for (const group of ALL_PROHIBITED) {
    for (const term of group.list) {
      const pattern = buildModerationPattern(term);

      if (pattern.test(normalized)) {
        return {
          isValid: false,
          category: group.category,
          matchedTerm: term,
          reason: `Auto-Filter: Prohibited content detected (${group.category}). Commercial press wall sponsorships strictly forbid weapons, politics, nudity, and adult content.`
        };
      }
    }
  }

  // URL safety checks
  if (params.linkUrl) {
    const lowerUrl = params.linkUrl.toLowerCase();
    const suspiciousDomains = [
      '.xxx', '.porn', '.adult', 'pornhub', 'xvideos', 'onlyfans.com',
      'chaturbate', 'redtube', 'fetlife', 'guns.com', 'ammunitiondepot',
      'weapons'
    ];
    if (suspiciousDomains.some(d => lowerUrl.includes(d))) {
      return {
        isValid: false,
        category: 'prohibited domain',
        matchedTerm: 'prohibited domain',
        reason: 'Auto-Filter: Destination link leads to an adult, weapons, or prohibited domain.'
      };
    }
  }

  return { isValid: true };
}
