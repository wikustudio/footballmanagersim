export const UEFA_COUNTRIES = ['GER', 'ENG', 'ESP', 'ITA', 'FRA', 'POR', 'NED', 'BEL', 'SCO', 'WAL', 'POL', 'AUT', 'SUI', 'TUR', 'DEN', 'NOR', 'SWE', 'SVK', 'CRO', 'GRE'];
export const CONMEBOL_COUNTRIES = ['BRA', 'ARG', 'COL', 'ECU', 'PER', 'BOL', 'PAR', 'CHI', 'URU', 'VEN'];
export const CONCACAF_COUNTRIES = ['USA', 'CAN', 'MEX', 'CRC', 'HON'];
export const AFC_COUNTRIES = ['JPN', 'KOR', 'AUS', 'KSA', 'IDN', 'IND', 'CHN', 'QAT', 'UAE'];

export const getRegion = (country: string) => {
  if (CONMEBOL_COUNTRIES.includes(country)) return 'CONMEBOL';
  if (CONCACAF_COUNTRIES.includes(country)) return 'CONCACAF';
  if (AFC_COUNTRIES.includes(country)) return 'AFC';
  return 'UEFA';
};

export const getContinentalCupNames = (country: string) => {
    const region = getRegion(country);
  switch (region) {
    case 'CONMEBOL':
      return {
        cl: 'Copa Libertadores',
        el: 'Copa Sudamericana',
        ecl: 'Recopa',
      };
    case 'CONCACAF':
      return {
        cl: 'North American Champions Cup',
        el: 'Leagues Challenge',
        ecl: 'North American Challenge Cup',
      };
    case 'AFC':
      return {
        cl: 'Asian Champions Cup',
        el: 'Asian Cup',
        ecl: 'Asian Challenge Cup',
      };
    case 'UEFA':
    default:
      return {
        cl: 'Euro Champions Cup',
        el: 'Euro Cup',
        ecl: 'Euro Challenge Cup',
      };
  }
};

export interface RegionalLegend {
  primary: string;
  primaryShort: string;
  secondary: string;
  secondaryShort: string;
  relegation: string;
  champTooltip: string;
  primaryTooltip: string;
  secondaryTooltip: string;
}

export const getRegionalQualificationLegend = (country: string): RegionalLegend => {
  const region = getRegion(country);
  switch (region) {
    case 'CONMEBOL':
      return {
        primary: 'Champions & Copa Libertadores (Gold)',
        primaryShort: 'Copa Libertadores',
        secondary: 'Copa Sudamericana Spots (Sky Blue)',
        secondaryShort: 'Copa Sudamericana',
        relegation: 'Relegation Zone (Rose Red)',
        champTooltip: 'Champions & Copa Libertadores Qualified',
        primaryTooltip: 'Copa Libertadores Qualification',
        secondaryTooltip: 'Copa Sudamericana Qualification',
      };
    case 'CONCACAF':
      return {
        primary: 'Champions & CONCACAF Champions Cup (Gold)',
        primaryShort: 'CONCACAF Champions Cup',
        secondary: 'Continental & Leagues Cup Spots (Sky Blue)',
        secondaryShort: 'Leagues Cup',
        relegation: 'Relegation Zone (Rose Red)',
        champTooltip: 'Champions & CONCACAF Champions Cup Qualified',
        primaryTooltip: 'CONCACAF Champions Cup Qualification',
        secondaryTooltip: 'Continental & Leagues Cup Qualification',
      };
    case 'AFC':
      return {
        primary: 'Champions & AFC Champions League (Gold)',
        primaryShort: 'AFC Champions League',
        secondary: 'AFC Cup Spots (Sky Blue)',
        secondaryShort: 'AFC Cup',
        relegation: 'Relegation Zone (Rose Red)',
        champTooltip: 'Champions & AFC Champions League Qualified',
        primaryTooltip: 'AFC Champions League Qualification',
        secondaryTooltip: 'AFC Cup Qualification',
      };
    case 'UEFA':
    default:
      return {
        primary: 'Champions & Champions League (Gold)',
        primaryShort: 'Champions League',
        secondary: 'European Cup Spots (Sky Blue)',
        secondaryShort: 'European Cup',
        relegation: 'Relegation Zone (Rose Red)',
        champTooltip: 'Champions & Champions League Qualified',
        primaryTooltip: 'Champions League Qualification',
        secondaryTooltip: 'European Cup Qualification',
      };
  }
};

