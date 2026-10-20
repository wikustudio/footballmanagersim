import { Language } from '../types';

export function t(
  lang: Language,
  en: string,
  de?: string,
  _ignoredEs?: string
): string {
  if (lang === 'de' && de) return de;
  return en;
}

export const tr = t;

export function getLoc(
  lang: Language,
  obj?: { en?: string; de?: string; _ignoredEs?: string } | string
): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (lang === 'de') return obj.de || obj.en || '';
  return obj.en || '';
}

export const LANGUAGE_LABELS: Record<Language, { label: string; flag: string }> = {
  en: { label: 'EN', flag: '🇬🇧' },
  de: { label: 'DE', flag: '🇩🇪' },
};

export const DICT = {
  transferRiskWarning: {
    en: "Chemistry Warning: Transfer flop risk increased by {risk}% due to recent signings.",
    de: "Teamchemie-Warnung: Transfer-Flop-Risiko um {risk}% erhoeht wegen kuerzlicher Verpflichtungen."
  },
  promotionAdjustment: {
    en: "Higher League Adjustment (-1 OVR)",
    de: "Liga-Anpassung (-1 GES)"
  }
};
