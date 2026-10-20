/**
 * Universal Currency Formatting & Country Financial Profiles
 * Provides authentic currency presentation across all nations and community mod databases.
 */

// Global active country context for transparent fallback in formatMoney
let globalCurrencyCountry = 'GER';
let globalCustomCurrencies: Record<string, string> = {};

export const setGlobalCurrencyCountry = (country: string = 'GER'): void => {
  globalCurrencyCountry = (country || 'GER').toUpperCase().trim();
};

export const getGlobalCurrencyCountry = (): string => {
  return globalCurrencyCountry;
};

export const registerCustomModCurrencies = (currencyMap: Record<string, string>): void => {
  globalCustomCurrencies = { ...globalCustomCurrencies, ...currencyMap };
};

export interface CurrencyConfig {
  symbol: string;
  code: string;
  isSuffix?: boolean;
}

export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyConfig> = {
  // Americas - Pesos / Dollars
  ARG: { symbol: '$', code: 'ARS' },
  USA: { symbol: '$', code: 'USD' },
  CAN: { symbol: '$', code: 'CAD' },
  MEX: { symbol: '$', code: 'MXN' },
  BRA: { symbol: 'R$', code: 'BRL' },
  COL: { symbol: '$', code: 'COP' },
  CHI: { symbol: '$', code: 'CLP' },
  ECU: { symbol: '$', code: 'USD' },
  BOL: { symbol: '$', code: 'BOB' },
  PER: { symbol: 'S/', code: 'PEN' },
  URU: { symbol: '$', code: 'UYU' },
  PAR: { symbol: '₲', code: 'PYG' },

  // United Kingdom
  ENG: { symbol: '£', code: 'GBP' },
  SCO: { symbol: '£', code: 'GBP' },
  WAL: { symbol: '£', code: 'GBP' },

  // Europe - Eurozone
  GER: { symbol: '€', code: 'EUR' },
  ESP: { symbol: '€', code: 'EUR' },
  FRA: { symbol: '€', code: 'EUR' },
  ITA: { symbol: '€', code: 'EUR' },
  POR: { symbol: '€', code: 'EUR' },
  AUT: { symbol: '€', code: 'EUR' },
  GRE: { symbol: '€', code: 'EUR' },
  SVK: { symbol: '€', code: 'EUR' },
  CRO: { symbol: '€', code: 'EUR' },

  // Europe - Non-Euro
  SUI: { symbol: 'CHF ', code: 'CHF' },
  POL: { symbol: 'zł ', code: 'PLN' },
  TUR: { symbol: '₺', code: 'TRY' },
  DEN: { symbol: 'kr ', code: 'DKK' },
  NOR: { symbol: 'kr ', code: 'NOK' },
  SWE: { symbol: 'kr ', code: 'SEK' },

  // Asia & Oceania
  JPN: { symbol: '¥', code: 'JPY' },
  KOR: { symbol: '₩', code: 'KRW' },
  AUS: { symbol: 'A$', code: 'AUD' },
  IND: { symbol: '₹', code: 'INR' },
  IDN: { symbol: 'Rp ', code: 'IDR' },
};

/**
 * Resolves the appropriate currency symbol for a country or custom mod code.
 */
export const getCountryCurrency = (country?: string, customSymbol?: string): string => {
  if (customSymbol && typeof customSymbol === 'string' && customSymbol.trim().length > 0) {
    return customSymbol.trim();
  }

  const raw = country || globalCurrencyCountry || 'GER';
  const c = raw.toUpperCase().trim();

  // 1. Check custom mod registered currencies
  if (globalCustomCurrencies[c]) {
    return globalCustomCurrencies[c];
  }

  // 2. Check standard country map
  if (COUNTRY_CURRENCY_MAP[c]) {
    return COUNTRY_CURRENCY_MAP[c].symbol;
  }

  // 3. Fallbacks based on region conventions
  const latinAmerica = ['ARG', 'BRA', 'COL', 'CHI', 'ECU', 'BOL', 'PER', 'URU', 'PAR', 'VEN', 'MEX'];
  if (latinAmerica.includes(c)) return '$';

  return '€';
};

/**
 * Formats a monetary value (stored in thousands in-engine) into an authentic formatted string.
 * Example: 3800 in ARG -> "$3.8M", 500 in ENG -> "£500K", 19 in GER -> "€19K"
 */
export const formatMoneyWithCountry = (
  val: number | string,
  countryOrCurrency?: string
): string => {
  let num = typeof val === 'number' ? val : parseFloat(val);
  const symbol = countryOrCurrency && (countryOrCurrency.length <= 4 && !/^[A-Z]{3}$/.test(countryOrCurrency))
    ? countryOrCurrency
    : getCountryCurrency(countryOrCurrency);

  if (isNaN(num)) return `${symbol}0`;
  const isNeg = num < 0;
  num = Math.abs(num) * 1000; // Game engine stores all values in thousands (K)

  let str = '';
  if (num >= 1000000) {
    str = symbol + (num / 1000000).toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1') + 'M';
  } else if (num >= 1000) {
    str = symbol + (num / 1000).toFixed(0) + 'K';
  } else {
    str = symbol + num.toString();
  }
  return (isNeg ? '-' : '') + str;
};
