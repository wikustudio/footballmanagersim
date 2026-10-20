import { LeagueInfo, PhilosophyInfo, Club } from '../types';
import { formatMoneyWithCountry, getCountryCurrency, setGlobalCurrencyCountry, getGlobalCurrencyCountry, registerCustomModCurrencies } from '../utils/currencyHelpers';

export { getCountryCurrency, setGlobalCurrencyCountry, getGlobalCurrencyCountry, registerCustomModCurrencies };

export const MAX_SEASONS = 35;


export const COUNTRY_LEAGUES: Record<string, Record<number, LeagueInfo>> = {
  GER: {
    1: { name: "1. Bundesliga", tag: "GER 1", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 80, ticket: 48, tvPrize: 14000, wages: 32000, attBase: 38000, stadBase: 89000 },
    2: { name: "2. Bundesliga", tag: "GER 2", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 71, ticket: 28, tvPrize: 3500, wages: 6800, attBase: 20000, stadBase: 40000 },
    3: { name: "3. Liga", tag: "3. LIGA", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 64, ticket: 18, tvPrize: 800, wages: 3200, attBase: 8500, stadBase: 27000 },
    4: { name: "Regionalliga", tag: "REG", css: "bg-orange-500/20 text-orange-400 border border-orange-500/30", avgOvr: 57, ticket: 14, tvPrize: 120, wages: 820, attBase: 2200, stadBase: 13000 },
    5: { name: "Oberliga", tag: "OBER", css: "bg-purple-500/20 text-purple-400 border border-purple-500/30", avgOvr: 53, ticket: 10, tvPrize: 30, wages: 240, attBase: 800, stadBase: 3200 },
    6: { name: "Verbandsliga", tag: "VERB", css: "bg-pink-500/20 text-pink-400 border border-pink-500/30", avgOvr: 51, ticket: 8, tvPrize: 20, wages: 120, attBase: 500, stadBase: 1800 },
    7: { name: "Landesliga", tag: "LAND", css: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30", avgOvr: 49, ticket: 7, tvPrize: 15, wages: 70, attBase: 350, stadBase: 1200 },
    8: { name: "Landesklasse", tag: "L-KLA", css: "bg-yellow-600/20 text-yellow-500 border border-yellow-600/30", avgOvr: 43, ticket: 5, tvPrize: 10, wages: 40, attBase: 200, stadBase: 800 },
    9: { name: "Bezirksliga", tag: "BEZ", css: "bg-yellow-700/20 text-yellow-600 border border-yellow-700/30", avgOvr: 40, ticket: 4, tvPrize: 5, wages: 20, attBase: 120, stadBase: 500 },
    10: { name: "Kreisliga", tag: "KREIS", css: "bg-yellow-800/20 text-yellow-700 border border-yellow-800/30", avgOvr: 24, ticket: 3, tvPrize: 3, wages: 8, attBase: 70, stadBase: 250 },
    11: { name: "Kreisliga A", tag: "KREIS A", css: "bg-yellow-900/20 text-yellow-800 border border-yellow-900/30", avgOvr: 12, ticket: 2, tvPrize: 1, wages: 3, attBase: 30, stadBase: 100 }
  },
  POR: {
    1: { name: "Primeira Liga", tag: "LIGA PT", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 78, ticket: 35, tvPrize: 12000, wages: 24000, attBase: 11000, stadBase: 50000 },
    2: { name: "Liga Portugal 2", tag: "LIGA 2", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 68, ticket: 18, tvPrize: 2800, wages: 4800, attBase: 2800, stadBase: 12000 },
    3: { name: "Liga 3", tag: "LIGA 3", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 61, ticket: 12, tvPrize: 700, wages: 1150, attBase: 1500, stadBase: 6000 },
    4: { name: "Campeonato de Portugal", tag: "CdP", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 53, ticket: 10, tvPrize: 100, wages: 380, attBase: 900, stadBase: 4000 },
    5: { name: "Ligas Distritais (1)", tag: "DIST", css: "bg-purple-500/20 text-purple-400 border border-purple-500/30", avgOvr: 44, ticket: 7, tvPrize: 25, wages: 120, attBase: 500, stadBase: 2000 },
    6: { name: "Ligas Distritais (2)", tag: "INATEL", css: "bg-pink-500/20 text-pink-400 border border-pink-500/30", avgOvr: 38, ticket: 5, tvPrize: 10, wages: 80, attBase: 300, stadBase: 1500 }
  },
  ESP: {
    1: { name: "La Liga", tag: "LA LIGA", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 80, ticket: 45, tvPrize: 14000, wages: 30000, attBase: 28000, stadBase: 70000 },
    2: { name: "Segunda División", tag: "LIGA 2", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 69, ticket: 22, tvPrize: 3200, wages: 6000, attBase: 12000, stadBase: 25000 },
    3: { name: "Primera Federación", tag: "1. FED", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 62, ticket: 15, tvPrize: 750, wages: 2100, attBase: 4500, stadBase: 12000 },
    4: { name: "Segunda Federación", tag: "2. FED", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 54, ticket: 12, tvPrize: 110, wages: 780, attBase: 1800, stadBase: 6000 },
    5: { name: "Tercera Federación", tag: "3. FED", css: "bg-purple-500/20 text-purple-400 border border-purple-500/30", avgOvr: 45, ticket: 8, tvPrize: 28, wages: 230, attBase: 800, stadBase: 3000 },
    6: { name: "Divisiones Regionales", tag: "REG", css: "bg-pink-500/20 text-pink-400 border border-pink-500/30", avgOvr: 38, ticket: 5, tvPrize: 15, wages: 100, attBase: 400, stadBase: 1500 }
  },
  ENG: {
    1: { name: "English Premier Div", tag: "PL", css: "bg-purple-500/20 text-purple-400 border border-purple-500/30", avgOvr: 80, ticket: 78, tvPrize: 28600, wages: 72000, attBase: 38000, stadBase: 85000 },
    2: { name: "English Championship", tag: "CHAMP", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 72, ticket: 46, tvPrize: 7800, wages: 18500, attBase: 22000, stadBase: 42000 },
    3: { name: "English League One", tag: "L1", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 65, ticket: 29, tvPrize: 1950, wages: 6240, attBase: 9500, stadBase: 25000 },
    4: { name: "English League Two", tag: "L2", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 59, ticket: 21, tvPrize: 585, wages: 2080, attBase: 4200, stadBase: 12000 },
    5: { name: "National Premier", tag: "NAT L", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 51, ticket: 18, tvPrize: 195, wages: 910, attBase: 2200, stadBase: 8000 },
    6: { name: "National North/South", tag: "NAT N/S", css: "bg-pink-500/20 text-pink-400 border border-pink-500/30", avgOvr: 44, ticket: 12, tvPrize: 80, wages: 400, attBase: 1000, stadBase: 4000 },
    7: { name: "Regional Premier", tag: "REG PREM", css: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30", avgOvr: 38, ticket: 8, tvPrize: 30, wages: 200, attBase: 500, stadBase: 2000 }
  },
  ITA: {
    1: { name: "Serie A", tag: "SERIE A", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 80, ticket: 45, tvPrize: 14000, wages: 30000, attBase: 27000, stadBase: 65000 },
    2: { name: "Serie B", tag: "SERIE B", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 69, ticket: 22, tvPrize: 3200, wages: 6000, attBase: 11000, stadBase: 22000 },
    3: { name: "Serie C", tag: "SERIE C", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 62, ticket: 15, tvPrize: 750, wages: 2100, attBase: 4200, stadBase: 10000 },
    4: { name: "Serie D", tag: "SERIE D", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 54, ticket: 12, tvPrize: 110, wages: 780, attBase: 1800, stadBase: 5000 },
    5: { name: "Eccellenza", tag: "ECC", css: "bg-purple-500/20 text-purple-400 border border-purple-500/30", avgOvr: 45, ticket: 8, tvPrize: 28, wages: 230, attBase: 750, stadBase: 2500 },
    6: { name: "Promozione", tag: "PROM", css: "bg-pink-500/20 text-pink-400 border border-pink-500/30", avgOvr: 37, ticket: 5, tvPrize: 10, wages: 100, attBase: 350, stadBase: 1500 }
  },
  FRA: {
    1: { name: "Ligue 1", tag: "LIGUE 1", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 80, ticket: 42, tvPrize: 13000, wages: 28000, attBase: 26000, stadBase: 50000 },
    2: { name: "Ligue 2", tag: "LIGUE 2", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 68, ticket: 20, tvPrize: 3000, wages: 5500, attBase: 9500, stadBase: 18000 },
    3: { name: "National 1", tag: "NAT", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 61, ticket: 14, tvPrize: 700, wages: 1800, attBase: 3500, stadBase: 8000 },
    4: { name: "National 2", tag: "NAT 2", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 53, ticket: 10, tvPrize: 100, wages: 750, attBase: 1200, stadBase: 4000 },
    5: { name: "National 3", tag: "NAT 3", css: "bg-purple-500/20 text-purple-400 border border-purple-500/30", avgOvr: 44, ticket: 7, tvPrize: 25, wages: 220, attBase: 500, stadBase: 2000 }
  },
  ECU: {
    1: { name: "Liga Pro Serie A", tag: "ECU 1", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 74, ticket: 12, tvPrize: 2500, wages: 3800, attBase: 14000, stadBase: 35000 },
    2: { name: "Liga Pro Serie B", tag: "ECU 2", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 64, ticket: 6, tvPrize: 400, wages: 1200, attBase: 4500, stadBase: 12000 }
  },
  USA: {
    1: { name: "Major League Soccer", tag: "MLS", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 77, ticket: 45, tvPrize: 18000, wages: 28000, attBase: 22000, stadBase: 45000 },
    2: { name: "USL Championship", tag: "USLC", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 66, ticket: 22, tvPrize: 3000, wages: 5500, attBase: 8500, stadBase: 15000 },
    3: { name: "USL League One", tag: "USL1", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 58, ticket: 15, tvPrize: 700, wages: 2400, attBase: 4200, stadBase: 8000 },
    4: { name: "USL League Two", tag: "USL2", css: "bg-purple-500/20 text-purple-400 border border-purple-500/30", avgOvr: 48, ticket: 10, tvPrize: 0, wages: 120, attBase: 1200, stadBase: 5000 },
    5: { name: "NPSL", tag: "NPSL", css: "bg-pink-500/20 text-pink-400 border border-pink-500/30", avgOvr: 40, ticket: 5, tvPrize: 0, wages: 30, attBase: 500, stadBase: 2500 }
  },
  SCO: {
    1: { name: "Scottish Premiership", tag: "PREM", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 72, ticket: 25, tvPrize: 5000, wages: 12000, attBase: 15000, stadBase: 35000 },
    2: { name: "Scottish Championship", tag: "CHAMP", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 63, ticket: 12, tvPrize: 1000, wages: 1800, attBase: 4000, stadBase: 10000 }
  },
  WAL: {
    1: { name: "Cymru Premier", tag: "CYM", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 60, ticket: 10, tvPrize: 500, wages: 650, attBase: 2000, stadBase: 5000 }
  },
  BRA: {
    1: { name: "Brasileirão Série A", tag: "SERIE A", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 78, ticket: 15, tvPrize: 8000, wages: 18000, attBase: 30000, stadBase: 60000 },
    2: { name: "Brasileirão Série B", tag: "SERIE B", css: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30", avgOvr: 68, ticket: 8, tvPrize: 2000, wages: 5000, attBase: 12000, stadBase: 25000 }
  },
  POL: {
    1: { name: "Ekstraklasa", tag: "POL1", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 68, ticket: 15, tvPrize: 3000, wages: 5000, attBase: 10000, stadBase: 25000 },
    2: { name: "I Liga", tag: "POL2", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 62, ticket: 10, tvPrize: 800, wages: 1500, attBase: 4500, stadBase: 12000 },
    3: { name: "II Liga", tag: "POL3", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 56, ticket: 7, tvPrize: 250, wages: 600, attBase: 2000, stadBase: 6000 },
    4: { name: "III Liga", tag: "POL4", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 50, ticket: 5, tvPrize: 60, wages: 200, attBase: 900, stadBase: 3000 },
    5: { name: "IV Liga", tag: "POL5", css: "bg-purple-500/20 text-purple-400 border border-purple-500/30", avgOvr: 44, ticket: 4, tvPrize: 15, wages: 75, attBase: 400, stadBase: 1500 }
  },
  AUT: {
    1: { name: "Austrian Bundesliga", tag: "BUND", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 70, ticket: 20, tvPrize: 4000, wages: 8000, attBase: 12000, stadBase: 25000 }
  },
  SUI: {
    1: { name: "Swiss Super League", tag: "SUPER", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 70, ticket: 25, tvPrize: 5000, wages: 9000, attBase: 15000, stadBase: 30000 }
  },
  AUS: {
    1: { name: "A-League", tag: "A-L", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 68, ticket: 20, tvPrize: 3000, wages: 6000, attBase: 10000, stadBase: 25000 }
  },
  ARG: {
    1: { name: "Primera División", tag: "PRIM", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 77, ticket: 12, tvPrize: 6000, wages: 14000, attBase: 35000, stadBase: 65000 },
    2: { name: "Primera Nacional", tag: "PRIM N", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 67, ticket: 5, tvPrize: 1000, wages: 1900, attBase: 10000, stadBase: 20000 }
  },
  JPN: {
    1: { name: "J1 League", tag: "J1", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 72, ticket: 22, tvPrize: 6000, wages: 10000, attBase: 20000, stadBase: 40000 },
    2: { name: "J2 League", tag: "J2", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 64, ticket: 10, tvPrize: 1500, wages: 4000, attBase: 8000, stadBase: 20000 }
  },
  COL: {
    1: { name: "Categoría Primera A", tag: "LIGA", css: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30", avgOvr: 72, ticket: 10, tvPrize: 3000, wages: 6000, attBase: 20000, stadBase: 40000 }
  },
  MEX: {
    1: { name: "Liga MX", tag: "MEX1", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 75, ticket: 18, tvPrize: 7000, wages: 15000, attBase: 25000, stadBase: 50000 }
  },
  CAN: {
    1: { name: "Canadian Premier League", tag: "CPL", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 63, ticket: 12, tvPrize: 1000, wages: 1500, attBase: 5000, stadBase: 15000 }
  },
  TUR: {
    1: { name: "Süper Lig", tag: "SÜPER", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 76, ticket: 24, tvPrize: 4500, wages: 8500, attBase: 13000, stadBase: 35000 },
    2: { name: "1. Lig", tag: "1. LIG", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 66, ticket: 12, tvPrize: 600, wages: 1400, attBase: 3500, stadBase: 15000 },
    3: { name: "2. Lig", tag: "2. LIG", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 57, ticket: 6, tvPrize: 80, wages: 480, attBase: 1300, stadBase: 6000 }
  },
  IND: {
    1: { name: "Indian Super League", tag: "ISL", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 64, ticket: 10, tvPrize: 1200, wages: 2500, attBase: 12000, stadBase: 35000 },
    2: { name: "I-League", tag: "I-LIG", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 55, ticket: 5, tvPrize: 200, wages: 350, attBase: 3500, stadBase: 12000 }
  },
  SVK: {
    1: { name: "Niké Liga", tag: "SVK 1", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 68, ticket: 14, tvPrize: 2200, wages: 4200, attBase: 6500, stadBase: 18000 },
    2: { name: "2. Liga", tag: "SVK 2", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 58, ticket: 8, tvPrize: 400, wages: 650, attBase: 1800, stadBase: 6000 }
  },
  PER: {
    1: { name: "Liga 1 Perú", tag: "PER 1", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 71, ticket: 12, tvPrize: 2600, wages: 4500, attBase: 14000, stadBase: 35000 },
    2: { name: "Liga 2 Perú", tag: "PER 2", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 61, ticket: 6, tvPrize: 450, wages: 850, attBase: 4000, stadBase: 12000 }
  },
  DEN: {
    1: { name: "Superligaen", tag: "SUPER", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 73, ticket: 22, tvPrize: 4000, wages: 8500, attBase: 11000, stadBase: 26000 },
    2: { name: "1. Division", tag: "1. DIV", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 63, ticket: 12, tvPrize: 800, wages: 1500, attBase: 3500, stadBase: 10000 }
  },
  NOR: {
    1: { name: "Eliteserien", tag: "ELITE", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 71, ticket: 20, tvPrize: 3800, wages: 7500, attBase: 9500, stadBase: 22000 },
    2: { name: "1. Divisjon", tag: "1. DIV", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 62, ticket: 11, tvPrize: 700, wages: 1300, attBase: 2500, stadBase: 8000 }
  },
  SWE: {
    1: { name: "Allsvenskan", tag: "ALLSV", css: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30", avgOvr: 71, ticket: 20, tvPrize: 3800, wages: 7500, attBase: 12000, stadBase: 30000 },
    2: { name: "Superettan", tag: "SUPER", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 62, ticket: 11, tvPrize: 700, wages: 1300, attBase: 3000, stadBase: 9000 }
  },
  IDN: {
    1: { name: "Liga 1 Indonesia", tag: "LIGA 1", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 64, ticket: 8, tvPrize: 1000, wages: 2200, attBase: 15000, stadBase: 35000 }
  },
  KOR: {
    1: { name: "K League 1", tag: "K1", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 73, ticket: 18, tvPrize: 4500, wages: 9000, attBase: 14000, stadBase: 40000 },
    2: { name: "K League 2", tag: "K2", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 64, ticket: 10, tvPrize: 900, wages: 1600, attBase: 4500, stadBase: 18000 }
  },
  BOL: {
    1: { name: "División Profesional", tag: "BOL 1", css: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", avgOvr: 68, ticket: 8, tvPrize: 1500, wages: 2800, attBase: 10000, stadBase: 25000 }
  },
  PAR: {
    1: { name: "Primera División de Paraguay", tag: "PAR 1", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 72, ticket: 10, tvPrize: 2200, wages: 4000, attBase: 11000, stadBase: 30000 }
  },
  CHI: {
    1: { name: "Primera División de Chile", tag: "CHI 1", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 73, ticket: 14, tvPrize: 3200, wages: 6000, attBase: 13000, stadBase: 35000 },
    2: { name: "Primera B de Chile", tag: "CHI 2", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 63, ticket: 7, tvPrize: 500, wages: 950, attBase: 3500, stadBase: 12000 }
  },
  CRO: {
    1: { name: "SuperSport HNL", tag: "HNL", css: "bg-red-500/20 text-red-400 border border-red-500/30", avgOvr: 72, ticket: 16, tvPrize: 3000, wages: 6000, attBase: 8500, stadBase: 25000 },
    2: { name: "Prva NL", tag: "1. NL", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 61, ticket: 8, tvPrize: 450, wages: 800, attBase: 1800, stadBase: 8000 }
  },
  GRE: {
    1: { name: "Super League Greece", tag: "SLG", css: "bg-blue-500/20 text-blue-400 border border-blue-500/30", avgOvr: 74, ticket: 20, tvPrize: 4200, wages: 8500, attBase: 12000, stadBase: 32000 },
    2: { name: "Super League 2", tag: "SL2", css: "bg-amber-500/20 text-amber-400 border border-amber-500/30", avgOvr: 62, ticket: 9, tvPrize: 600, wages: 1100, attBase: 2500, stadBase: 10000 }
  }
};

export const LEAGUES: Record<number, LeagueInfo> = COUNTRY_LEAGUES.GER;

export const normalizeCountryCode = (country?: string): string => {
  if (!country) return 'GER';
  const c = country.trim().toUpperCase();
  const map: Record<string, string> = {
    'JAPAN': 'JPN',
    'GERMANY': 'GER',
    'DEUTSCHLAND': 'GER',
    'ENGLAND': 'ENG',
    'UNITED KINGDOM': 'ENG',
    'UK': 'ENG',
    'SPAIN': 'ESP',
    'ESPANA': 'ESP',
    'ESPAÑA': 'ESP',
    'ITALY': 'ITA',
    'ITALIA': 'ITA',
    'FRANCE': 'FRA',
    'PORTUGAL': 'POR',
    'SCOTLAND': 'SCO',
    'WALES': 'WAL',
    'BRAZIL': 'BRA',
    'BRASIL': 'BRA',
    'POLAND': 'POL',
    'POLSKA': 'POL',
    'AUSTRIA': 'AUT',
    'ÖSTERREICH': 'AUT',
    'OESTERREICH': 'AUT',
    'SWITZERLAND': 'SUI',
    'SCHWEIZ': 'SUI',
    'SUISSE': 'SUI',
    'SVIZZERA': 'SUI',
    'AUSTRALIA': 'AUS',
    'ARGENTINA': 'ARG',
    'COLOMBIA': 'COL',
    'MEXICO': 'MEX',
    'MÉXICO': 'MEX',
    'CANADA': 'CAN',
    'TURKEY': 'TUR',
    'TÜRKIYE': 'TUR',
    'TURKIYE': 'TUR',
    'ECUADOR': 'ECU',
    'UNITED STATES': 'USA',
    'UNITED STATES OF AMERICA': 'USA',
    'US': 'USA',
    'INDIA': 'IND',
    'BHARAT': 'IND',
    'SLOVAKIA': 'SVK',
    'SLOVAK REPUBLIC': 'SVK',
    'SLOVENSKO': 'SVK',
    'PERU': 'PER',
    'PERÚ': 'PER',
    'SOUTH KOREA': 'KOR',
    'KOREA': 'KOR',
    'KOREA REPUBLIC': 'KOR',
    'REPUBLIC OF KOREA': 'KOR',
    'KOREA, SOUTH': 'KOR',
    'SOUTH-KOREA': 'KOR',
    'BOLIVIA': 'BOL',
    'PARAGUAY': 'PAR',
    'CHILE': 'CHI',
    'CROATIA': 'CRO',
    'HRVATSKA': 'CRO',
    'GREECE': 'GRE',
    'HELLAS': 'GRE',
    'HELLENIC REPUBLIC': 'GRE',
    'DENMARK': 'DEN',
    'DANMARK': 'DEN',
    'NORWAY': 'NOR',
    'NORGE': 'NOR',
    'SWEDEN': 'SWE',
    'SVERIGE': 'SWE',
    'INDONESIA': 'IDN',
  };
  return map[c] || c;
};

const BASE_MAX_TIERS: Record<string, number> = {
  GER: 11,
  ENG: 7,
  ESP: 6,
  ITA: 6,
  FRA: 5,
  POR: 6,
  USA: 5,
  ECU: 2,
  SCO: 2,
  WAL: 1,
  BRA: 2,
  POL: 5,
  AUT: 1,
  SUI: 1,
  AUS: 1,
  ARG: 2,
  JPN: 2,
  COL: 1,
  MEX: 1,
  CAN: 1,
  TUR: 3,
  DEN: 2,
  NOR: 2,
  SWE: 2,
  IDN: 1,
  IND: 2,
  SVK: 2,
  PER: 2,
  KOR: 2,
  BOL: 1,
  PAR: 1,
  CHI: 2,
  CRO: 2,
  GRE: 2
};

export const getMaxTier = (country: string = 'GER', customOrClubs?: number | Club[] | { tier?: number; country?: string }[]): number => {
  const code = normalizeCountryCode(country);
  if (typeof customOrClubs === 'number') {
    return Math.max(1, customOrClubs);
  }
  if (Array.isArray(customOrClubs)) {
    let maxFound = 0;
    for (let i = 0; i < customOrClubs.length; i++) {
      const c = customOrClubs[i];
      if (normalizeCountryCode(c.country || 'GER') === code) {
        const t = Number(c.tier) || 1;
        if (t > maxFound) maxFound = t;
      }
    }
    if (maxFound > 0) return maxFound;
  }
  if (code === 'POL') {
    return (typeof window !== 'undefined' && localStorage.getItem('fms_real_mod_active') === 'true') ? 5 : 1;
  }
  return BASE_MAX_TIERS[code] || 1;
};

export const getLeagueInfo = (tier: number, country: string = 'GER', customName?: string): LeagueInfo => {
  const code = normalizeCountryCode(country);
  // Strictly prevent phantom tiers in countries with static pyramids (e.g. Japan only has Tier 1 and 2)
  if (code === 'JPN' && tier > 2) {
    return COUNTRY_LEAGUES.JPN[2];
  }
  const countryLeagues = COUNTRY_LEAGUES[code];
  
  // 1. If explicit league exists in static dictionary, return it
  if (countryLeagues && countryLeagues[tier]) {
    return {
      ...countryLeagues[tier],
      name: customName || countryLeagues[tier].name
    };
  }

  // 2. If country has static dictionary but tier is beyond defined tiers (e.g. community mod added Tier 5 or Tier 8)
  if (countryLeagues && countryLeagues[1]) {
    const topLeague = countryLeagues[1];
    const divisor = Math.max(1, Math.pow(1.5, tier - 1));
    const countryObj = COUNTRIES[code] || COUNTRIES[country];
    const countryName = countryObj?.name || code;
    return {
      ...topLeague,
      name: customName || `${countryName} Division ${tier}`,
      tag: `D${tier}`,
      avgOvr: Math.max(50, Math.floor(topLeague.avgOvr - (tier - 1) * 5)),
      ticket: Math.max(8, Math.floor(topLeague.ticket / divisor)),
      tvPrize: Math.max(10, Math.floor(topLeague.tvPrize / divisor)),
      wages: Math.max(50, Math.floor(topLeague.wages / divisor)),
      attBase: Math.max(200, Math.floor(topLeague.attBase / divisor)),
      stadBase: Math.max(1000, Math.floor(topLeague.stadBase / divisor))
    };
  }
  
  // 3. Dynamic fallback for countries without explicit league structures defined
  const countryNames: Record<string, string> = {
    SCO: 'Scottish', WAL: 'Welsh', BRA: 'Brazilian', POL: 'Polish',
    AUT: 'Austrian', SUI: 'Swiss', AUS: 'Australian', ARG: 'Argentine',
    JPN: 'Japanese', COL: 'Colombian', MEX: 'Mexican', CAN: 'Canadian',
    IND: 'Indian', SVK: 'Slovak', PER: 'Peruvian', KOR: 'Korean',
    BOL: 'Bolivian', PAR: 'Paraguayan', CHI: 'Chilean', CRO: 'Croatian', GRE: 'Greek',
    DEN: 'Danish', NOR: 'Norwegian', SWE: 'Swedish', IDN: 'Indonesian'
  };
  const adjective = countryNames[code] || COUNTRIES[code]?.name || code;
  const baseLeagueInfo = COUNTRY_LEAGUES['GER']?.[tier] || COUNTRY_LEAGUES['GER']?.[4] || COUNTRY_LEAGUES['GER'][1];
  const divisor = Math.max(1, Math.pow(1.5, tier - 1));
  
  return {
    ...baseLeagueInfo,
    name: customName || `${adjective} League ${tier}`,
    tag: `L${tier}`,
    avgOvr: Math.max(50, Math.floor(baseLeagueInfo.avgOvr - (tier - 1) * 5)),
    ticket: Math.max(8, Math.floor(baseLeagueInfo.ticket / divisor)),
    tvPrize: Math.max(10, Math.floor(baseLeagueInfo.tvPrize / divisor)),
    wages: Math.max(50, Math.floor(baseLeagueInfo.wages / divisor)),
    attBase: Math.max(200, Math.floor(baseLeagueInfo.attBase / divisor)),
    stadBase: Math.max(1000, Math.floor(baseLeagueInfo.stadBase / divisor))
  };
};

export const CANADIAN_MLS_CLUBS = [
  'Vancouver Whitecaps FC',
  'Vancouver Whitecaps',
  'Vancouver White',
  'Vancouver Blue',
  'Vancouver',
  'Toronto FC',
  'Toronto',
  'Toronto Red',
  'CF Montréal',
  'CF Montreal',
  'Montréal',
  'Montreal',
  'Montreal CF',
  'Montreal Blue',
  'Vancouver FC',
  'Pacific FC'
];

export const CANADIAN_MLS_CLUB_IDS = [1008, 1015, 1030];

export const isCanadianMLSClub = (name?: string, id?: number, country?: string): boolean => {
  if (country === 'CAN') return true;
  if (id && (CANADIAN_MLS_CLUB_IDS.includes(id) || CANADIAN_MLS_CLUB_IDS.includes(Number(id)))) return true;
  if (!name) return false;
  const trimmed = name.trim().toLowerCase();
  return (
    CANADIAN_MLS_CLUBS.some(c => c.toLowerCase() === trimmed) ||
    trimmed.includes('toronto fc') ||
    trimmed.includes('toronto red') ||
    trimmed.includes('cf montréal') ||
    trimmed.includes('cf montreal') ||
    trimmed.includes('montreal cf') ||
    trimmed.includes('montreal blue') ||
    trimmed.includes('vancouver whitecaps') ||
    trimmed.includes('vancouver white') ||
    trimmed.startsWith('toronto') ||
    trimmed.startsWith('montreal') ||
    trimmed.startsWith('montréal') ||
    trimmed.startsWith('vancouver') ||
    trimmed.includes('victoria highlanders') ||
    trimmed.includes('calgary foothills') ||
    trimmed.includes('simcoe county') ||
    trimmed.includes('vaughan azzurri')
  );
};

export const getClubFlag = (club?: { name?: string; id?: number; country?: string }): string => {
  if (!club) return '🏳️';
  if (isCanadianMLSClub(club.name, club.id, club.country)) return '🇨🇦';
  return COUNTRIES[club.country || 'GER']?.flag || '🏳️';
};

/**
 * Calculates the maximum allowed youth academy prospects that can be
 * promoted directly to the senior squad per season, scaled by facility level (Lv1-2: 1, Lv3-4: 2, Lv5: 3).
 */
export const getAcademyCallUpCap = (academyLevel: number = 1): number => {
  const safeLvl = Math.max(1, Math.min(5, Math.floor(academyLevel || 1)));
  return [0, 1, 1, 2, 2, 3][safeLvl] || 1;
};

/**
 * Calculates the maximum allowed youth scouting missions per season,
 * scaled by Youth Academy facility level (Lv1: 1, Lv2: 2, Lv3: 4, Lv4: 6, Lv5: 10).
 */
export const getAcademyScoutCap = (academyLevel: number = 1): number => {
  const safeLvl = Math.max(1, Math.min(5, Math.floor(academyLevel || 1)));
  return [0, 1, 2, 4, 6, 10][safeLvl] || 1;
};

export const getDomesticCupInfo = (country: string = 'GER', tier: number = 1, clubName?: string, clubId?: number) => {
  const isRegional = tier >= 4;
  let name = isRegional ? 'Regional Cup' : 'National Cup';
  let logo = '';
  
  const isCanadian = isCanadianMLSClub(clubName, clubId, country);
  const effectiveCountry = isCanadian ? 'CAN' : country;

  if (!isRegional) {
    if (effectiveCountry === 'ENG') { name = 'FA Cup'; logo = ''; }
    else if (effectiveCountry === 'ESP') { name = 'Copa del Rey'; logo = ''; }
    else if (effectiveCountry === 'ITA') { name = 'Coppa Italia'; logo = ''; }
    else if (effectiveCountry === 'FRA') { name = 'Coupe de France'; logo = ''; }
    else if (effectiveCountry === 'POR') { name = 'Taça de Portugal'; logo = ''; }
    else if (effectiveCountry === 'USA') { name = 'U.S. Open Cup'; logo = ''; }
    else if (effectiveCountry === 'CAN') { name = 'Voyageurs Cup'; logo = '🇨🇦'; }
    else if (effectiveCountry === 'ECU') { name = 'Copa Ecuador'; logo = ''; }
    else if (effectiveCountry === 'GER') { name = 'DFB-Pokal'; }
    else if (effectiveCountry === 'BRA') { name = 'Copa do Brasil'; logo = ''; }
    else if (country === 'ARG') { name = 'Copa Argentina'; logo = ''; }
    else if (country === 'MEX') { name = 'Copa MX'; logo = ''; }
    else if (country === 'COL') { name = 'Copa Colombia'; logo = ''; }
    else if (country === 'SCO') { name = 'Scottish Cup'; logo = ''; }
    else if (country === 'AUT') { name = 'Austrian Cup'; logo = ''; }
    else if (country === 'SUI') { name = 'Swiss Cup'; logo = ''; }
    else if (country === 'POL') { name = 'Polish Cup'; logo = ''; }
    else if (country === 'JPN') { name = "Emperor's Cup"; logo = ''; }
    else if (country === 'AUS') { name = 'Australia Cup'; logo = ''; }
    else if (country === 'WAL') { name = 'Welsh Cup'; logo = ''; }
    else if (effectiveCountry === 'TUR') { name = 'Türkiye Kupası'; logo = '🇹🇷'; }
    else if (effectiveCountry === 'DEN') { name = 'DBU Pokalen'; logo = '🇩🇰'; }
    else if (effectiveCountry === 'NOR') { name = 'NM Cupen'; logo = '🇳🇴'; }
    else if (effectiveCountry === 'SWE') { name = 'Svenska Cupen'; logo = '🇸🇪'; }
    else if (effectiveCountry === 'IDN') { name = 'Piala Indonesia'; logo = '🇮🇩'; }
    else if (effectiveCountry === 'IND') { name = 'Indian Super Cup'; logo = '🇮🇳'; }
    else if (effectiveCountry === 'SVK') { name = 'Slovnaft Cup'; logo = '🇸🇰'; }
    else if (effectiveCountry === 'PER') { name = 'Copa Bicentenario'; logo = '🇵🇪'; }
    else if (effectiveCountry === 'KOR') { name = 'Korea Cup'; logo = '🇰🇷'; }
    else if (effectiveCountry === 'BOL') { name = 'Copa Bolivia'; logo = '🇧🇴'; }
    else if (effectiveCountry === 'PAR') { name = 'Copa Paraguay'; logo = '🇵🇾'; }
    else if (effectiveCountry === 'CHI') { name = 'Copa Chile'; logo = '🇨🇱'; }
    else if (effectiveCountry === 'CRO') { name = 'Hrvatski kup'; logo = '🇭🇷'; }
    else if (effectiveCountry === 'GRE') { name = 'Kypello Elladas'; logo = '🇬🇷'; }
  }

  return {
    name,
    logo,
    tag: isRegional ? 'REGIONAL' : 'CUP',
  };
};
export const getFAInfo = (country: string = 'GER') => {
  const code = normalizeCountryCode(country);
  if (code === 'TUR') {
    return {
      name: 'TFF',
      full: 'Türkiye Futbol Federasyonu',
      cup: 'Türkiye Kupası',
      cupLogo: '🇹🇷',
      stadiumFinal: 'Atatürk Olympic Stadium, Istanbul',
    };
  }
  if (code === 'POR') {
    return {
      name: 'FPF',
      full: 'Federação Portuguesa de Futebol',
      cup: 'Taça de Portugal',
      cupLogo: '🇵🇹',
      stadiumFinal: 'Estádio Nacional, Jamor',
    };
  }
  if (code === 'ESP') {
    return {
      name: 'RFEF',
      full: 'Real Federación Española de Fútbol',
      cup: 'Copa del Rey',
      cupLogo: '🇪🇸',
      stadiumFinal: 'La Cartuja, Sevilla',
    };
  }
  if (code === 'ENG') {
    return {
      name: 'The FA',
      full: 'The Football Association',
      cup: 'FA Cup',
      cupLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      stadiumFinal: 'Wembley Stadium, London',
    };
  }
  if (code === 'ITA') {
    return {
      name: 'FIGC',
      full: 'Federazione Italiana Giuoco Calcio',
      cup: 'Coppa Italia',
      cupLogo: '🇮🇹',
      stadiumFinal: 'Stadio Olimpico, Rome',
    };
  }
  if (code === 'FRA') {
    return {
      name: 'FFF',
      full: 'Fédération Française de Football',
      cup: 'Coupe de France',
      cupLogo: '🇫🇷',
      stadiumFinal: 'Stade de France, Paris',
    };
  }
  if (code === 'ECU') {
    return {
      name: 'FEF',
      full: 'Federación Ecuatoriana de Fútbol',
      cup: 'Copa Ecuador',
      cupLogo: '🇪🇨',
      stadiumFinal: 'Estadio Rodrigo Paz Delgado, Quito',
    };
  }
  if (code === 'USA') {
    return {
      name: 'U.S. Soccer',
      full: 'United States Soccer Federation',
      cup: 'U.S. Open Cup',
      cupLogo: '🇺🇸',
      stadiumFinal: 'Subaru Park, Philadelphia',
    };
  }
  if (code === 'DEN') {
    return {
      name: 'DBU',
      full: 'Dansk Boldspil-Union',
      cup: 'DBU Pokalen',
      cupLogo: '🇩🇰',
      stadiumFinal: 'Parken Stadium, Copenhagen',
    };
  }
  if (code === 'NOR') {
    return {
      name: 'NFF',
      full: 'Norges Fotballforbund',
      cup: 'NM Cupen',
      cupLogo: '🇳🇴',
      stadiumFinal: 'Ullevaal Stadion, Oslo',
    };
  }
  if (code === 'SWE') {
    return {
      name: 'SvFF',
      full: 'Svenska Fotbollförbundet',
      cup: 'Svenska Cupen',
      cupLogo: '🇸🇪',
      stadiumFinal: 'Strawberry Arena, Stockholm',
    };
  }
  if (code === 'KOR') {
    return {
      name: 'KFA',
      full: 'Korea Football Association',
      cup: 'Korea Cup',
      cupLogo: '🇰🇷',
      stadiumFinal: 'Seoul World Cup Stadium, Seoul',
    };
  }
  if (code === 'BOL') {
    return {
      name: 'FBF',
      full: 'Federación Boliviana de Fútbol',
      cup: 'Copa Bolivia',
      cupLogo: '🇧🇴',
      stadiumFinal: 'Estadio Hernando Siles, La Paz',
    };
  }
  if (code === 'PER') {
    return {
      name: 'FPF',
      full: 'Federación Peruana de Fútbol',
      cup: 'Copa Bicentenario',
      cupLogo: '🇵🇪',
      stadiumFinal: 'Estadio Nacional, Lima',
    };
  }
  if (code === 'PAR') {
    return {
      name: 'APF',
      full: 'Asociación Paraguaya de Fútbol',
      cup: 'Copa Paraguay',
      cupLogo: '🇵🇾',
      stadiumFinal: 'Estadio Defensores del Chaco, Asunción',
    };
  }
  if (code === 'CHI') {
    return {
      name: 'FFCh',
      full: 'Federación de Fútbol de Chile',
      cup: 'Copa Chile',
      cupLogo: '🇨🇱',
      stadiumFinal: 'Estadio Nacional Julio Martínez Prádanos, Santiago',
    };
  }
  if (code === 'CRO') {
    return {
      name: 'HNS',
      full: 'Hrvatski nogometni savez',
      cup: 'Hrvatski kup',
      cupLogo: '🇭🇷',
      stadiumFinal: 'Stadion Maksimir, Zagreb',
    };
  }
  if (code === 'GRE') {
    return {
      name: 'EPO',
      full: 'Hellenic Football Federation',
      cup: 'Kypello Elladas',
      cupLogo: '🇬🇷',
      stadiumFinal: 'Olympic Stadium, Athens',
    };
  }
  if (code === 'IDN') {
    return {
      name: 'PSSI',
      full: 'Persatuan Sepakbola Seluruh Indonesia',
      cup: 'Piala Indonesia',
      cupLogo: '🇮🇩',
      stadiumFinal: 'Gelora Bung Karno Stadium, Jakarta',
    };
  }
  if (code === 'IND') {
    return {
      name: 'AIFF',
      full: 'All India Football Federation',
      cup: 'Indian Super Cup',
      cupLogo: '🇮🇳',
      stadiumFinal: 'Salt Lake Stadium, Kolkata',
    };
  }
  if (code === 'SVK') {
    return {
      name: 'SFZ',
      full: 'Slovenský futbalový zväz',
      cup: 'Slovnaft Cup',
      cupLogo: '🇸🇰',
      stadiumFinal: 'Tehelné pole, Bratislava',
    };
  }
  return {
    name: 'DFB',
    full: 'Deutscher Fußball-Bund',
    cup: 'DFB-Pokal',
    cupLogo: '🇩🇪',
    stadiumFinal: 'Olympiastadion, Berlin',
  };
};

export const TOURNAMENT_LOGOS: Record<string, string> = {
  dfbPokal: "",
  supercup: "",
  cl: "",
  el: "",
  ecl: "",
  dfbTeam: "",
  tacaDePortugal: "",
  copaDelRey: "",
  faCup: "",
  concacaf: "",
  copaLibertadores: "",
  copaSudamericana: "",
  leaguesCup: "",
  campeonesCup: "",
  recopaSudamericana: "",
  afcChampionsLeague: "",
  afcCup: "",
  afcChallengeLeague: "",
  coppaItalia: "",
  coupeDeFrance: "",
  copaEcuador: "",
  usOpenCup: "",
  cwc: "",
};

export const COUNTRIES: Record<string, { name: string; flag: string; active: boolean }> = {
  'GER': { name: 'Germany', flag: '🇩🇪', active: true },
  'ENG': { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', active: true },
  'ITA': { name: 'Italy', flag: '🇮🇹', active: true },
  'FRA': { name: 'France', flag: '🇫🇷', active: true },
  'POR': { name: 'Portugal', flag: '🇵🇹', active: true },
  'ESP': { name: 'Spain', flag: '🇪🇸', active: true },
  'ECU': { name: 'Ecuador', flag: '🇪🇨', active: true },
  'USA': { name: 'USA', flag: '🇺🇸', active: true },
  'SCO': { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', active: true },
  'WAL': { name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', active: true },
  'BRA': { name: 'Brazil', flag: '🇧🇷', active: true },
  'POL': { name: 'Poland', flag: '🇵🇱', active: true },
  'AUT': { name: 'Austria', flag: '🇦🇹', active: true },
  'SUI': { name: 'Switzerland', flag: '🇨🇭', active: true },
  'AUS': { name: 'Australia', flag: '🇦🇺', active: true },
  'ARG': { name: 'Argentina', flag: '🇦🇷', active: true },
  'JPN': { name: 'Japan', flag: '🇯🇵', active: true },
  'COL': { name: 'Colombia', flag: '🇨🇴', active: true },
  'MEX': { name: 'Mexico', flag: '🇲🇽', active: true },
  'CAN': { name: 'Canada', flag: '🇨🇦', active: true },
  'TUR': { name: 'Turkey', flag: '🇹🇷', active: true },
  'DEN': { name: 'Denmark', flag: '🇩🇰', active: true },
  'NOR': { name: 'Norway', flag: '🇳🇴', active: true },
  'SWE': { name: 'Sweden', flag: '🇸🇪', active: true },
  'IDN': { name: 'Indonesia', flag: '🇮🇩', active: true },
  'IND': { name: 'India', flag: '🇮🇳', active: true },
  'SVK': { name: 'Slovakia', flag: '🇸🇰', active: true },
  'PER': { name: 'Peru', flag: '🇵🇪', active: true },
  'KOR': { name: 'South Korea', flag: '🇰🇷', active: true },
  'BOL': { name: 'Bolivia', flag: '🇧🇴', active: true },
  'PAR': { name: 'Paraguay', flag: '🇵🇾', active: true },
  'CHI': { name: 'Chile', flag: '🇨🇱', active: true },
  'CRO': { name: 'Croatia', flag: '🇭🇷', active: true },
  'GRE': { name: 'Greece', flag: '🇬🇷', active: true },
};

export const BASE_GAME_COUNTRIES: string[] = [
  'GER', 'ENG', 'ITA', 'FRA', 'POR', 'ESP', 'ECU', 'USA', 'SCO', 'WAL', 'BRA',
  'POL', 'AUT', 'SUI', 'AUS', 'ARG', 'JPN', 'COL', 'MEX', 'CAN', 'TUR'
];

export const MOD_ONLY_COUNTRIES: string[] = [
  'DEN', 'NOR', 'SWE', 'IDN', 'IND', 'SVK', 'PER', 'KOR', 'BOL', 'PAR', 'CHI', 'CRO', 'GRE'
];

export interface SponsorBrand {
  name: string;
  fullName: string;
  tag: string;
  logo: string;
  countries?: string[];
}

export const SPONSOR_BRANDS: SponsorBrand[] = [
  // Global / Multinational (available everywhere)
  { name: 'Google', fullName: 'Google Cloud & AI Tech', tag: 'CLOUD & AI TECH', logo: '🌐' },
  { name: 'Spotify', fullName: 'Spotify Audio Streaming', tag: 'ENTERTAINMENT', logo: '🎧' },
  { name: 'Emirates', fullName: 'Fly Emirates', tag: 'AIRLINE', logo: '✈️' },
  { name: 'Red Bull', fullName: 'Red Bull Energy', tag: 'ENERGY DRINK', logo: '🐂' },
  { name: 'Puma', fullName: 'Puma Performance', tag: 'SPORTSWEAR', logo: '🐾' },
  { name: 'UNEQ', fullName: 'UNEQ Consulting', tag: 'MANAGEMENT CONSULTING', logo: '💼' },
  { name: 'HYROX', fullName: 'HYROX Fitness Racing', tag: 'GLOBAL FITNESS RACING', logo: '🏃' },

  // Germany (GER)
  { name: 'Telekom', fullName: 'Deutsche Telekom', tag: 'TELECOM GERMANY', logo: '📶', countries: ['GER'] },
  { name: 'Allianz', fullName: 'Allianz Insurance Group', tag: 'FINANCIAL SERVICES', logo: '🛡️', countries: ['GER'] },
  { name: 'SAP', fullName: 'SAP Enterprise Software', tag: 'TECH & ANALYTICS', logo: '💻', countries: ['GER'] },
  { name: 'ESN', fullName: 'ESN Sports Nutrition', tag: 'SPORTS NUTRITION', logo: '⚡', countries: ['GER'] },
  { name: 'Postbank', fullName: 'Postbank Deutschland', tag: 'BANKING GERMANY', logo: '🏦', countries: ['GER'] },

  // Ecuador (ECU)
  { name: 'Banco Pichincha', fullName: 'Banco Pichincha Ecuador', tag: 'BANKING ECUADOR', logo: '🏛️', countries: ['ECU'] },
  { name: 'Banco Guayaquil', fullName: 'Banco Guayaquil', tag: 'FINANCE ECUADOR', logo: '💳', countries: ['ECU'] },
  { name: 'CNT', fullName: 'Corporación Nacional de Telecomunicaciones', tag: 'TELECOM ECUADOR', logo: '📡', countries: ['ECU'] },
  { name: 'Pilsener', fullName: 'Cervecería Nacional Pilsener', tag: 'BEVERAGE ECUADOR', logo: '🍺', countries: ['ECU'] },
  { name: 'Marathon', fullName: 'Marathon Sports Ecuador', tag: 'SPORTSWEAR ECUADOR', logo: '👟', countries: ['ECU'] },

  // USA (USA)
  { name: 'AT&T', fullName: 'AT&T Communications', tag: 'TELECOM USA', logo: '🌐', countries: ['USA'] },
  { name: 'Verizon', fullName: 'Verizon Wireless USA', tag: 'TELECOM USA', logo: '📱', countries: ['USA'] },
  { name: 'Chase Bank', fullName: 'JPMorgan Chase USA', tag: 'BANKING USA', logo: '🏦', countries: ['USA'] },
  { name: 'Capital One', fullName: 'Capital One Financial', tag: 'FINANCE USA', logo: '💳', countries: ['USA'] },
  { name: 'Ford Motors', fullName: 'Ford Motor Company', tag: 'AUTOMOTIVE USA', logo: '🚘', countries: ['USA'] },

  // England (ENG)
  { name: 'O2', fullName: 'O2 Telefónica UK', tag: 'TELECOM UK', logo: '🔵', countries: ['ENG'] },
  { name: 'Barclays', fullName: 'Barclays Bank UK', tag: 'BANKING UK', logo: '🏦', countries: ['ENG'] },
  { name: 'Vodafone', fullName: 'Vodafone UK', tag: 'TELECOM UK', logo: '🔴', countries: ['ENG'] },
  { name: 'Standard Chartered', fullName: 'Standard Chartered UK', tag: 'BANKING UK', logo: '📈', countries: ['ENG'] },

  // Italy (ITA)
  { name: 'TIM', fullName: 'TIM Telecom Italia', tag: 'TELECOM ITALY', logo: '📞', countries: ['ITA'] },
  { name: 'Pirelli', fullName: 'Pirelli Tyres Italia', tag: 'AUTOMOTIVE ITALY', logo: '🛞', countries: ['ITA'] },
  { name: 'Jeep', fullName: 'Jeep Automotive Italia', tag: 'AUTOMOTIVE ITALY', logo: '🚙', countries: ['ITA'] },
  { name: 'Enel', fullName: 'Enel Energy Italia', tag: 'ENERGY ITALY', logo: '💡', countries: ['ITA'] },

  // France (FRA)
  { name: 'Orange', fullName: 'Orange Telecom France', tag: 'TELECOM FRANCE', logo: '🍊', countries: ['FRA'] },
  { name: 'Accor ALL', fullName: 'ALL Accor Hospitality', tag: 'HOTELS & TRAVEL', logo: '🏨', countries: ['FRA'] },
  { name: 'TotalEnergies', fullName: 'TotalEnergies France', tag: 'ENERGY FRANCE', logo: '⚡', countries: ['FRA'] },
  { name: 'Crédit Agricole', fullName: 'Crédit Agricole France', tag: 'BANKING FRANCE', logo: '🏦', countries: ['FRA'] },

    // Spain (ESP)
  { name: 'Santander', fullName: 'Banco Santander', tag: 'BANKING SPAIN', logo: '🏦', countries: ['ESP'] },
  { name: 'Movistar', fullName: 'Movistar Telecom', tag: 'TELECOM SPAIN', logo: '📱', countries: ['ESP'] },
  { name: 'CaixaBank', fullName: 'CaixaBank Spain', tag: 'BANKING SPAIN', logo: '💳', countries: ['ESP'] },
  { name: 'Repsol', fullName: 'Repsol Energy Spain', tag: 'ENERGY SPAIN', logo: '⛽', countries: ['ESP'] },
  // Portugal (POR)
  { name: 'MEO', fullName: 'MEO Telecom Portugal', tag: 'TELECOM PORTUGAL', logo: '📡', countries: ['POR'] },
  { name: 'Betano', fullName: 'Betano Sports Betting', tag: 'BETTING PORTUGAL', logo: '🎲', countries: ['POR'] },
  { name: 'NOS', fullName: 'NOS Telecom Portugal', tag: 'TELECOM PORTUGAL', logo: '📺', countries: ['POR'] },
  { name: 'Sagres', fullName: 'Sagres Brewery Portugal', tag: 'BEVERAGE PORTUGAL', logo: '🍺', countries: ['POR'] },
  // Scotland (SCO)
  { name: 'Tennent\'s', fullName: 'Tennent\'s Lager', tag: 'BEVERAGE SCOTLAND', logo: '🍺', countries: ['SCO'] },
  { name: 'Arnold Clark', fullName: 'Arnold Clark Automobiles', tag: 'AUTOMOTIVE SCOTLAND', logo: '🚗', countries: ['SCO'] },
  // Wales (WAL)
  { name: 'Cazoo', fullName: 'Cazoo UK', tag: 'AUTOMOTIVE WALES', logo: '🚘', countries: ['WAL'] },
  { name: 'GoCompare', fullName: 'GoCompare Financial', tag: 'FINANCE WALES', logo: '💷', countries: ['WAL'] },
  // Brazil (BRA)
  { name: 'Itaú', fullName: 'Itaú Unibanco', tag: 'BANKING BRAZIL', logo: '🏦', countries: ['BRA'] },
  { name: 'Petrobras', fullName: 'Petrobras Energy', tag: 'ENERGY BRAZIL', logo: '🛢️', countries: ['BRA'] },
  { name: 'Vivo', fullName: 'Vivo Telecom', tag: 'TELECOM BRAZIL', logo: '📱', countries: ['BRA'] },
  // Poland (POL)
  { name: 'Orlen', fullName: 'PKN Orlen', tag: 'ENERGY POLAND', logo: '⛽', countries: ['POL'] },
  { name: 'PKO Bank', fullName: 'PKO Bank Polski', tag: 'BANKING POLAND', logo: '🏦', countries: ['POL'] },
  // Austria (AUT)
  { name: 'Raiffeisen', fullName: 'Raiffeisen Bank', tag: 'BANKING AUSTRIA', logo: '🏦', countries: ['AUT'] },
  { name: 'OMV', fullName: 'OMV Energy', tag: 'ENERGY AUSTRIA', logo: '⛽', countries: ['AUT'] },
  // Switzerland (SUI)
  { name: 'Credit Suisse', fullName: 'Credit Suisse', tag: 'BANKING SWITZERLAND', logo: '🏦', countries: ['SUI'] },
  { name: 'Novartis', fullName: 'Novartis Pharma', tag: 'HEALTHCARE SWITZERLAND', logo: '💊', countries: ['SUI'] },
  // Australia (AUS)
  { name: 'Qantas', fullName: 'Qantas Airways', tag: 'AIRLINE AUSTRALIA', logo: '✈️', countries: ['AUS'] },
  { name: 'CommBank', fullName: 'Commonwealth Bank', tag: 'BANKING AUSTRALIA', logo: '🏦', countries: ['AUS'] },
  // Argentina (ARG)
  { name: 'YPF', fullName: 'YPF Energy', tag: 'ENERGY ARGENTINA', logo: '⛽', countries: ['ARG'] },
  { name: 'Quilmes', fullName: 'Cerveza Quilmes', tag: 'BEVERAGE ARGENTINA', logo: '🍺', countries: ['ARG'] },
  // Japan (JPN)
  { name: 'Toyota', fullName: 'Toyota Motor Corp', tag: 'AUTOMOTIVE JAPAN', logo: '🚗', countries: ['JPN'] },
  { name: 'Sony', fullName: 'Sony Corporation', tag: 'TECH JAPAN', logo: '📺', countries: ['JPN'] },
  { name: 'Nintendo', fullName: 'Nintendo Gaming', tag: 'GAMING JAPAN', logo: '🎮', countries: ['JPN'] },
  // Colombia (COL)
  { name: 'Bavaria', fullName: 'Cervecería Bavaria', tag: 'BEVERAGE COLOMBIA', logo: '🍺', countries: ['COL'] },
  { name: 'Bancolombia', fullName: 'Bancolombia', tag: 'BANKING COLOMBIA', logo: '🏦', countries: ['COL'] },
  // Mexico (MEX)
  { name: 'Tecate', fullName: 'Cerveza Tecate', tag: 'BEVERAGE MEXICO', logo: '🍺', countries: ['MEX'] },
  { name: 'Telcel', fullName: 'Telcel Telecom', tag: 'TELECOM MEXICO', logo: '📱', countries: ['MEX'] },
  // Canada (CAN)
  { name: 'RBC', fullName: 'Royal Bank of Canada', tag: 'BANKING CANADA', logo: '🏦', countries: ['CAN'] },
  { name: 'Air Canada', fullName: 'Air Canada', tag: 'AIRLINE CANADA', logo: '✈️', countries: ['CAN'] },
  // Turkey (TUR)
  { name: 'Turkish Airlines', fullName: 'Türk Hava Yolları', tag: 'AIRLINE TURKEY', logo: '✈️', countries: ['TUR'] },
  { name: 'Beko', fullName: 'Beko Global Electronics', tag: 'ELECTRONICS TURKEY', logo: '📺', countries: ['TUR'] },
  { name: 'İddaa', fullName: 'İddaa Spor Toto', tag: 'SPORTS BETTING', logo: '🎯', countries: ['TUR'] },
  { name: 'Garanti BBVA', fullName: 'Garanti BBVA Bankası', tag: 'BANKING TURKEY', logo: '🏦', countries: ['TUR'] }
];

export interface ManagerSkillInfo {
  id: string;
  nameEn: string;
  nameDe: string;
  icon: string;
  descEn: string;
  descDe: string;
  effectEn: string;
  effectDe: string;
  cost: number;
}

export const MANAGER_SKILLS: Record<string, ManagerSkillInfo> = {
  'mutual_consent': {
    id: 'mutual_consent',
    nameEn: "Mutual Consent",
    nameDe: "Beidseitiges Einvernehmen",
    icon: "fa-handshake",
    descEn: "Persuade the head coach to tear up their contract when fired, avoiding all legacy severance expenses.",
    descDe: "Überzeuge den Trainer bei Entlassung auf Abfindung zu verzichten.",
    effectEn: "Sacking a coach incurs 0 severance pay",
    effectDe: "Trainer-Entlassung kostet 0 Abfindung",
    cost: 8
  },
  'vorstandsliebling': {
    id: 'vorstandsliebling',
    nameEn: "Board Favorite",
    nameDe: "Vorstandsliebling",
    icon: "fa-user-tie",
    descEn: "Builds deep trust with directors, drastically reducing pressure and giving you a higher tolerance floor during crisis periods.",
    descDe: "Erwirbt tiefes Vertrauen der Klubfuehrung, verringert den Druck des Vorstands bei Durststrecken.",
    effectEn: "+15 Board Satisfaction Floor & delays warnings by 1 season",
    effectDe: "+15 Vorstands-Toleranz & verzoegert Abmahnungen um 1 Saison",
    cost: 15
  },
  'talentscout': {
    id: 'talentscout',
    nameEn: "Talent Scout",
    nameDe: "Talentscout",
    icon: "fa-binoculars",
    descEn: "Sharp eye for supreme prodigies — boosts youth graduate output and halves talent poaching rates.",
    descDe: "Schaerft den Blick fuer absolute Ausnahmetalente — erhoeht Erfolgschance in der Jugendakademie.",
    effectEn: "+25% youth grad chance, +1 OVR boost on youth events & -50% poaching",
    effectDe: "+25% Akademie-Erfolg, +1 GES bei Talent-Events & 50% weniger Abwerbung",
    cost: 15
  },
  'ultraliebling': {
    id: 'ultraliebling',
    nameEn: "Fan Icon",
    nameDe: "Ultraliebling",
    icon: "fa-bullhorn",
    descEn: "Inspirational relationship with supporters, driving electric stadium atmosphere and ticket revenue.",
    descDe: "Hautnahe Bindung zu den Fans, sorgt fuer kochende Stadien und hoehere Auslastung.",
    effectEn: "+15% stadium attendance & boosted fan loyalty income",
    effectDe: "+15% hoehere Zuschauerzahlen & gesteigerte Treue-Einnahmen",
    cost: 15
  },
  'salesmaster': {
    id: 'salesmaster',
    nameEn: "Commercial Negotiator",
    nameDe: "Chef-Unterhaendler",
    icon: "fa-briefcase",
    descEn: "Master commercial negotiator, attracting elite corporate sponsors and maximizing deal payouts.",
    descDe: "Verhandlungsgeschick auf Spitzenniveau, lockt internationale Grossponsoren an.",
    effectEn: "+20% base sponsor income, +10% pitch payouts & 55% Mega-Deal odds",
    effectDe: "+20% Basis-Sponsoreneinnahmen, +10% Pitch-Bonus & 55% Mega-Deal-Chance",
    cost: 15
  },
  'rosinenpicker': {
    id: 'rosinenpicker',
    nameEn: "Bargain Hunter",
    nameDe: "Rosinenpicker",
    icon: "fa-tags",
    descEn: "Unrivaled transfer market acumen — secures key player acquisitions at discount prices.",
    descDe: "Meisterhafte Transferverhandlungen — kauft Verstaerkungen zu Schnaeppchenpreisen.",
    effectEn: "-20% squad upgrade costs & +1 OVR bonus on key transfers",
    effectDe: "-20% Kader-Upgrade-Kosten & +1 GES-Bonus bei Key-Transfers",
    cost: 15
  },
  'untouchable': {
    id: 'untouchable',
    nameEn: "Board Darling",
    nameDe: "Unkuendbar",
    icon: "fa-shield-halved",
    descEn: "Board expectations are heavily relaxed. You won't be fired for missing targets, allowing you to survive relegation and rebuild.",
    descDe: "Board expectations are heavily relaxed. You won't be fired for missing targets, allowing you to survive relegation and rebuild.",
    effectEn: "Immune to Board sackings (WHYDFML protocol bypass).",
    effectDe: "Immun gegen Entlassungen durch den Vorstand (WHYDFML-Schutz).",
    cost: 8
  },
  'star_magnet': {
    id: 'star_magnet',
    nameEn: "Star Magnet",
    nameDe: "Star-Magnet",
    icon: "fa-star",
    descEn: "Your elite reputation attracts top talent. Increases the maximum number of Key Player signings per season from 2 to 3.",
    descDe: "Dein exzellenter Ruf lockt Top-Talente an. Erhoeht die maximale Anzahl an Schluesselspieler-Transfers pro Saison von 2 auf 3.",
    effectEn: "+1 Max Key Player Transfer per season (3 instead of 2)",
    effectDe: "+1 max. Schluesselspieler-Transfer pro Saison (3 statt 2)",
    cost: 15
  },
  'tactical_mastermind': {
    id: 'tactical_mastermind',
    nameEn: "Tactical Genius",
    nameDe: "Spielstil-Meister",
    icon: "fa-chess-knight",
    descEn: "Grants a tactical advantage in match simulations. Also reveals opponent tactics and scout reports during Cup matches.",
    descDe: "Perfektioniert die Taktik in der Simulation. Offenbart die gegnerische Taktik und Scout-Reports in Pokal- & Entscheidungsspielen.",
    effectEn: "+2 OVR tactical bonus & unlocks Fog of War",
    effectDe: "+2 GES taktischer Bonus & entschleiert Gegner-Taktik",
    cost: 15
  }
};

export const calculateInitialReputation = (baseOvr: number): number => {
  // Worst club by OVR (40) = 1, Best club by OVR (92+) = 100
  return Math.min(100, Math.max(1, Math.round(1 + ((baseOvr - 40) / 52) * 99)));
};

export const calculateClubReputation = (baseOvr: number, tier: number = 1): number => {
  // Worst club by OVR (35, League 5) = 1, Best club by OVR (92+, League 1) = 100
  const ovrFactor = Math.max(0, (baseOvr - 35) / 57) * 78;
  const tierBonus = (6 - Math.min(5, Math.max(1, tier))) * 4.4;
  return Math.min(100, Math.max(1, Math.round(ovrFactor + tierBonus)));
};

export const getMaxReputationForTier = (tier: number = 1): number => {
  if (tier <= 1) return 100;
  if (tier === 2) return 75;
  if (tier === 3) return 60;
  if (tier === 4) return 50;
  return 42; // Tier 5 and below: amateur/grassroots leagues
};

export interface ManagerStandingInfo {
  title: string;
  shortTitle: string;
  badge: string;
  color: string;
  icon: string;
  desc: string;
}

export const getManagerStandingTier = (
  score: number,
  tier: number = 1,
  isDe: boolean = false
): ManagerStandingInfo => {
  const normTier = Math.max(1, tier || 1);

  // TIER 1: The Only Tier Where Global Elite & Continental Status Can Exist
  if (normTier === 1) {
    if (score >= 85) {
      return {
        title: isDe ? 'Weltklasse-Direktor' : 'Global Elite Director',
        shortTitle: isDe ? 'Weltklasse' : 'Global Elite',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
        color: 'text-amber-400',
        icon: 'fa-crown',
        desc: isDe
          ? 'Weltweite Verehrung im Spitzenfußball. Die renommiertesten Weltvereine werben aktiv um Ihre Unterschrift.'
          : "Commands universal reverence in world football. The planet's most prestigious superclubs will actively court your signature."
      };
    }
    if (score >= 70) {
      return {
        title: isDe ? 'Kontinentales Schwergewicht' : 'Continental Heavyweight',
        shortTitle: isDe ? 'Kontinental' : 'Continental',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]',
        color: 'text-sky-400',
        icon: 'fa-globe',
        desc: isDe
          ? 'Nachgewiesene kontinentale Klasse. Geachtet von Spitzenklubs und Titelanwärtern der europäischen Top-Ligen.'
          : 'Proven European & continental pedigree. Respected by top-flight boards and ambitious title contenders across major leagues.'
      };
    }
    if (score >= 50) {
      return {
        title: isDe ? 'Etablierter Erstliga-Direktor' : 'Established Director',
        shortTitle: isDe ? 'Etabliert' : 'Established',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
        color: 'text-emerald-400',
        icon: 'fa-award',
        desc: isDe
          ? 'Solide Erstliga-Erfolgsbilanz. Das Vertrauen des Vorstands in Budgetdisziplin und sportliche Stabilität ist gesichert.'
          : 'Solid top-flight track record. Trusted to build sustainable squads, manage budgets cleanly, and compete in the first division.'
      };
    }
    if (score >= 35) {
      return {
        title: isDe ? 'Aufstrebender Erstliga-Direktor' : 'Developing Director',
        shortTitle: isDe ? 'Aufstrebend' : 'Developing',
        badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/40',
        color: 'text-zinc-300',
        icon: 'fa-arrow-trend-up',
        desc: isDe
          ? 'Baut taktische Autorität im Oberhaus auf. Eine starke Saison oder Pokallauf festigt den Status nachhaltig.'
          : 'Building tactical authority and market stature in the top flight. A breakout season or cup run will propel you into contention.'
      };
    }
    return {
      title: isDe ? 'Unter Druck' : 'Precarious Standing',
      shortTitle: isDe ? 'Unter Druck' : 'Under Pressure',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      color: 'text-rose-400',
      icon: 'fa-triangle-exclamation',
      desc: isDe
        ? 'Autorität angezählt. Unter scharfer Medienbeobachtung – braucht dringend Siege für den Klassenerhalt.'
        : 'Managerial authority is strained. Under media scrutiny—urgently needs positive results to restore industry respect.'
    };
  }

  // TIER 2: Second Division (Global Elite & Continental Impossible)
  if (normTier === 2) {
    if (score >= 65) {
      return {
        title: isDe ? 'Aufstiegs-Favorit' : 'National Contender',
        shortTitle: isDe ? 'Aufstiegs-Favorit' : 'National Contender',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]',
        color: 'text-sky-400',
        icon: 'fa-shield-halved',
        desc: isDe
          ? 'Herausragender Zweitliga-Stratege auf dem Sprung ins Oberhaus. (Erstliga-Zugehörigkeit erforderlich für Kontinental & Weltklasse).'
          : 'Top-tier second division pedigree poised for top-flight promotion. (Tier 1 is required for Continental & Global Elite standing).'
      };
    }
    if (score >= 48) {
      return {
        title: isDe ? 'Etablierter Zweitliga-Direktor' : 'Established D2 Director',
        shortTitle: isDe ? 'Etabliert Liga 2' : 'Established D2',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
        color: 'text-emerald-400',
        icon: 'fa-award',
        desc: isDe
          ? 'Erfahrener Zweitliga-Baumeister. Kompetent bei Kaderplanung und ausgeglichenen Finanzen.'
          : 'Reliable second division operator trusted to manage budgets and challenge for top-flight promotion.'
      };
    }
    if (score >= 32) {
      return {
        title: isDe ? 'Aufstrebend Liga 2' : 'Developing Director',
        shortTitle: isDe ? 'Aufstrebend' : 'Developing',
        badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/40',
        color: 'text-zinc-300',
        icon: 'fa-arrow-trend-up',
        desc: isDe
          ? 'Kämpft um Etablierung in der zweiten Liga. Ein starkes Jahr eröffnet neue Perspektiven.'
          : 'Establishing tactical authority in the second tier. Working towards top-flight promotion.'
      };
    }
    return {
      title: isDe ? 'Unter Druck' : 'Precarious Standing',
      shortTitle: isDe ? 'Unter Druck' : 'Under Pressure',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      color: 'text-rose-400',
      icon: 'fa-triangle-exclamation',
      desc: isDe
        ? 'Abstiegssorgen in Liga 2. Das Vertrauen der Vereinsführung wankt.'
        : 'Second division relegation peril. Board confidence is shaky.'
    };
  }

  // TIER 3: Professional Third Tier
  if (normTier === 3) {
    if (score >= 52) {
      return {
        title: isDe ? 'Drittliga-Größe' : 'Pro Division Standout',
        shortTitle: isDe ? 'Drittliga-Elite' : 'Pro Standout',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
        color: 'text-emerald-400',
        icon: 'fa-award',
        desc: isDe
          ? 'Respektierter Profi-Trainer der 3. Liga mit Aufstiegsambitionen. (Weltklasse ist nur in Liga 1 möglich).'
          : 'Proven 3rd division tactician with strong promotion credentials. (Global Elite is strictly exclusive to Tier 1).'
      };
    }
    if (score >= 38) {
      return {
        title: isDe ? 'Etablierter Drittliga-Direktor' : 'Established D3 Director',
        shortTitle: isDe ? 'Etabliert Liga 3' : 'Established D3',
        badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/40',
        color: 'text-zinc-300',
        icon: 'fa-circle-check',
        desc: isDe
          ? 'Verlässlicher Profi-Trainer für das operative Drittliga-Geschäft.'
          : 'Trusted operator in professional lower leagues under tight budgets.'
      };
    }
    if (score >= 25) {
      return {
        title: isDe ? 'Aufstrebend Liga 3' : 'Developing Director',
        shortTitle: isDe ? 'Aufstrebend' : 'Developing',
        badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/40',
        color: 'text-zinc-300',
        icon: 'fa-arrow-trend-up',
        desc: isDe ? 'Kämpft um Konstanz in der 3. Liga.' : 'Working to consolidate pro standing in the 3rd tier.'
      };
    }
    return {
      title: isDe ? 'Unter Druck' : 'Precarious Standing',
      shortTitle: isDe ? 'Unter Druck' : 'Under Pressure',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      color: 'text-rose-400',
      icon: 'fa-triangle-exclamation',
      desc: isDe ? 'Drohender Abstieg in den Amateurbereich.' : 'Facing drop to regional semi-pro divisions.'
    };
  }

  // TIER 4: Regional / Semi-Pro Tier
  if (normTier === 4) {
    if (score >= 42) {
      return {
        title: isDe ? 'Regionalliga-Größe' : 'Regional Standout',
        shortTitle: isDe ? 'Regional-Elite' : 'Regional Standout',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
        color: 'text-emerald-400',
        icon: 'fa-location-dot',
        desc: isDe
          ? 'Prägende Persönlichkeit der Regionalliga. (Erstliga-Aufstieg nötig für höhere nationale Weihen).'
          : 'Dominant figure in regional semi-pro football. (Must climb to higher tiers for national prestige).'
      };
    }
    if (score >= 28) {
      return {
        title: isDe ? 'Etablierter Regionalliga-Direktor' : 'Established Semi-Pro',
        shortTitle: isDe ? 'Etabliert Semi-Pro' : 'Established Semi-Pro',
        badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/40',
        color: 'text-zinc-300',
        icon: 'fa-circle-check',
        desc: isDe ? 'Solider Trainer für semi-professionellen Ligafußball.' : 'Solid manager for semi-pro competition.'
      };
    }
    if (score >= 18) {
      return {
        title: isDe ? 'Aufstrebend Semi-Pro' : 'Developing Director',
        shortTitle: isDe ? 'Aufstrebend' : 'Developing',
        badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/40',
        color: 'text-zinc-300',
        icon: 'fa-arrow-trend-up',
        desc: isDe ? 'Sammelt Erfahrung in der 4. Liga.' : 'Building foundation in the 4th tier.'
      };
    }
    return {
      title: isDe ? 'Unter Druck' : 'Precarious Standing',
      shortTitle: isDe ? 'Unter Druck' : 'Under Pressure',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      color: 'text-rose-400',
      icon: 'fa-triangle-exclamation',
      desc: isDe ? 'Gefahr des Abstiegs in die Oberliga.' : 'Risk of dropping to local amateur tiers.'
    };
  }

  // TIER 5+: Grassroots & Amateur Leagues (Oberliga, 5th Tier & below)
  // GLOBAL ELITE & CONTINENTAL ARE STRICTLY IMPOSSIBLE HERE
  if (score >= 32) {
    return {
      title: isDe ? 'Amateur-Größe' : 'Grassroots Stalwart',
      shortTitle: isDe ? 'Amateur-Größe' : 'Grassroots Stalwart',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      color: 'text-emerald-400',
      icon: 'fa-seedling',
      desc: isDe
        ? 'Geachtete Persönlichkeit im regionalen Amateurfußball. (Weltklasse-Status ist ausschließlich in Liga 1 erreichbar).'
        : 'Respected grassroots director commanding local authority in amateur football. (Global Elite is strictly exclusive to Tier 1).'
    };
  }
  if (score >= 22) {
    return {
      title: isDe ? 'Etablierter Amateur-Direktor' : 'Established Grassroots Director',
      shortTitle: isDe ? 'Etabliert Amateur' : 'Established Amateur',
      badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/40',
      color: 'text-zinc-300',
      icon: 'fa-circle-check',
      desc: isDe
        ? 'Solides Ansehen im lokalen Vereinsfußball. Verlässlicher Amateur-Übungsleiter.'
        : 'Solid local standing in grassroots football. Trusted by amateur boards.'
    };
  }
  if (score >= 14) {
    return {
      title: isDe ? 'Aufstrebend Amateur' : 'Developing Amateur Director',
      shortTitle: isDe ? 'Aufstrebend' : 'Developing',
      badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/40',
      color: 'text-zinc-400',
      icon: 'fa-arrow-trend-up',
      desc: isDe ? 'Erste Schritte auf der Trainerbank der 5. Liga.' : 'Starting out in the lower tiers of the football pyramid.'
    };
  }
  return {
    title: isDe ? 'Unter Druck' : 'Precarious Standing',
    shortTitle: isDe ? 'Unter Druck' : 'Under Pressure',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    color: 'text-rose-400',
    icon: 'fa-triangle-exclamation',
    desc: isDe ? 'Erfolglose Amateursaison. Der Vorstand berät über Konsequenzen.' : 'Struggling in amateur tier. Board considering replacement.'
  };
};

export const getManagerStandingShortTitle = (
  rep: number,
  tier: number = 1,
  isDe: boolean = false
): string => {
  return getManagerStandingTier(rep, tier, isDe).shortTitle;
};


export const STARTING_BUDGETS: Record<number, number> = { 1: 30000, 2: 8000, 3: 2500, 4: 800, 5: 250, 6: 120, 7: 60, 8: 40, 9: 30, 10: 20, 11: 10 };

export const getStartingBudget = (tier: number, country: string = 'GER'): number => {
  const base = STARTING_BUDGETS[tier] || 10;
  const cMult = getCountryMult(country);
  return Math.max(1, Math.round(base * cMult));
};

export const getCreditLimit = (tier: number, country: string = 'GER'): number => {
  const limits = [0, 500000, 150000, 50000, 20000, 7500, 3000, 1500, 800, 400, 200, 100];
  const baseLimit = limits[tier] || 100;
  const cMult = getCountryMult(country);
  return Math.round(baseLimit * cMult);
};

export const getClubMaxBankLoan = (
  clubOrTier: number | { tier: number; country?: string; stadium?: number; baseOvr?: number; fanBase?: number },
  countryOrBudget?: string | number,
  reputation: number = 50
): number => {
  const isObj = typeof clubOrTier === 'object' && clubOrTier !== null;
  const tier: number = isObj ? (clubOrTier.tier || 1) : (typeof clubOrTier === 'number' ? clubOrTier : 1);
  const country: string = isObj ? (clubOrTier.country || 'GER') : (typeof countryOrBudget === 'string' ? countryOrBudget : 'GER');
  const currentBudget: number = isObj && typeof countryOrBudget === 'number' ? countryOrBudget : 0;
  const cMult = getCountryMult(country);
  const league = getLeagueInfo(tier, country);

  // 1. Division Baseline Borrowing Capacity
  const baseBudgets: Record<number, number> = {
    1: 30000, // €30M base for mid-table Tier 1
    2: 9000,  // €9.0M base for Tier 2
    3: 3000,  // €3.0M base for Tier 3
    4: 1000,  // €1.0M base for Tier 4
    5: 350,   // €350K base for Tier 5
    6: 150,   // €150K base for Tier 6
    7: 80,    // €80K base for Tier 7
    8: 50,
    9: 30,
    10: 20,
    11: 10,
  };
  const divisionBase = (baseBudgets[tier] || 20) * cMult;

  // If passed only tier and country (e.g. legacy/simple callers), return division base
  if (!isObj) {
    return Math.max(10, Math.round(divisionBase));
  }

  // 2. Dynamic Club Stature Scaling (Grows dynamically as player expands stadium, signs stars, and builds reputation)
  const stadBase = league.attBase || 30000;
  const avgOvr = league.avgOvr || (tier === 1 ? 80 : 70);

  // Stadium Scale: Ratio of club's stadium capacity vs division benchmark (e.g. 85,000 / 35,000 = 2.43x)
  const userStadium = clubOrTier.stadium || stadBase;
  const stadiumRatio = Math.max(0.6, Math.min(3.0, userStadium / stadBase));

  // Squad Quality Scale: Ratio of squad OVR vs division benchmark
  const userOvr = clubOrTier.baseOvr || avgOvr;
  const ovrRatio = Math.max(0.7, Math.min(1.4, userOvr / avgOvr));

  // Reputation Factor: 0.8 at low rep, up to 1.5 at 100 reputation
  const repFactor = 0.8 + (Math.max(0, Math.min(100, reputation)) / 100) * 0.7;

  // Fanbase Scale: Ratio of club's fanbase vs division global fanbase benchmark (global commercial brand collateral)
  const fanBenchmark = tier === 1 ? 800000 : tier === 2 ? 200000 : tier === 3 ? 60000 : (league.attBase || 5000) * 2;
  const rawFanRatio = (clubOrTier.fanBase || fanBenchmark) / fanBenchmark;
  const fanMultiplier = Math.max(0.85, Math.min(1.65, Math.pow(Math.max(0.5, rawFanRatio), 0.25)));

  // Combined Dynamic Stature Multiplier (e.g. Real Madrid / Superclub scales to ~3.5x - 6.0x)
  const statureMultiplier = stadiumRatio * Math.pow(ovrRatio, 2.0) * repFactor * fanMultiplier;
  let maxFacility = Math.round(divisionBase * statureMultiplier);

  // 3. Dynamic Debt Coverage ("Once-in-a-Lifetime Debt Escape")
  // If the club is in severe debt, the bank structures the loan to clear the entire debt plus an operational working capital buffer!
  if (currentBudget < 0) {
    const debtAbs = Math.abs(currentBudget);
    // Buffer scaled to club size: larger clubs have higher payrolls, so they need a larger operational cushion
    const operatingBuffer = Math.round(Math.max(divisionBase * 0.25, debtAbs * 0.15));
    const debtRescueAmount = debtAbs + operatingBuffer;

    // Facility expands to cover the debt rescue amount
    maxFacility = Math.max(maxFacility, debtRescueAmount);
  }

  // Absolute division credit cap to protect realism
  const creditCap = getCreditLimit(tier, country);
  return Math.min(creditCap, Math.max(10, maxFacility));
};

export interface LoanTermOption {
  years: 10 | 15 | 25;
  annualRatePct: number;
  totalInterestPct: number;
  annualPayment: number;
  totalRepayment: number;
  taglineEn: string;
  taglineDe: string;
  descEn: string;
  descDe: string;
}

export const getLoanOptions = (principal: number): LoanTermOption[] => {
  return [
    {
      years: 10,
      annualRatePct: 12.5,
      totalInterestPct: 25,
      annualPayment: Math.max(1, Math.round((principal * 1.25) / 10)),
      totalRepayment: Math.round(principal * 1.25),
      taglineEn: 'Fast Amortization',
      taglineDe: 'Schnelle Tilgung',
      descEn: 'Heavier annual operating burden, but clears the debt liability in a decade.',
      descDe: 'Höhere jährliche Belastung, befreit den Verein aber nach 10 Jahren komplett von Schulden.',
    },
    {
      years: 15,
      annualRatePct: 9.5,
      totalInterestPct: 42.5,
      annualPayment: Math.max(1, Math.round((principal * 1.425) / 15)),
      totalRepayment: Math.round(principal * 1.425),
      taglineEn: 'Balanced Standard',
      taglineDe: 'Ausgewogener Standard',
      descEn: 'Industry standard commercial facility. Sustainable annual impact for established clubs.',
      descDe: 'Klassischer Standardkredit. Ausgewogene Jahresrate für gesunden Spielbetrieb.',
    },
    {
      years: 25,
      annualRatePct: 7.0,
      totalInterestPct: 75,
      annualPayment: Math.max(1, Math.round((principal * 1.75) / 25)),
      totalRepayment: Math.round(principal * 1.75),
      taglineEn: 'Long-Term Bond',
      taglineDe: 'Langläufer-Anleihe',
      descEn: 'Lowest annual cash flow drain, but commits the balance sheet to a quarter-century obligation.',
      descDe: 'Geringste jährliche Belastung, bindet die Bilanz jedoch über 25 Spielzeiten.',
    },
  ];
};
export const YOUTH_GRAD_ODDS: Record<number, number> = { 1: 0.40, 2: 0.60, 3: 0.75, 4: 0.88, 5: 0.95, 6: 0.98, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.0 };

export const PHILOSOPHIES: Record<string, PhilosophyInfo> = {
  'Total Football': {
    icon: 'fa-fire',
    color: 'text-orange-500',
    en: 'Fluid Attack & High Entertainment',
    de: 'Offensivspektakel & Ballzauber',
    gfMod: 1.18,
    gaMod: 1.10,
    perkEn: '+12% Fanbase Growth & +1 Home OVR Boost',
    perkDe: '+12% Fanwachstum & +1 Heim-GES-Bonus',
    effectDescEn: 'Thrills supporters and fills stadiums with high-scoring attacking play.',
    effectDescDe: 'Begeistert Fans und fuellt das Stadion durch torreiche Offensiv-Action.',
    ovrBonusType: 'home'
  },
  'Gegenpressing': {
    icon: 'fa-bolt',
    color: 'text-yellow-400',
    en: 'High-Intensity Chaos & Pressing',
    de: 'Gegenpressing & Chaos-Umschaltspiel',
    gfMod: 1.28,
    gaMod: 1.22,
    perkEn: '+3 OVR Giant-Killer Boost vs Stronger Teams & Cup Matches',
    perkDe: '+3 GES Underdog-Bonus gegen staerkere Klubs & im Pokal',
    effectDescEn: 'Overwhelms superior opponents in cup ties and derby clashes with frantic intensity.',
    effectDescDe: 'Ueberrumpelt staerkere Gegner im Pokal und in Derbys durch extremes Tempo.',
    ovrBonusType: 'underdog'
  },
  'Tiki-Taka': {
    icon: 'fa-diagram-project',
    color: 'text-blue-500',
    en: 'Positional Control & Possession',
    de: 'Dominanter Ballbesitz & Spielkontrolle',
    gfMod: 0.88,
    gaMod: 0.72,
    perkEn: '+15% Sponsor Income & +2 OVR vs Weaker Opponents (Req. 60+ OVR)',
    perkDe: '+15% Sponsoreneinnahmen & +2 GES gegen schwaechere Klubs (Ab GES 60)',
    effectDescEn: 'Dictates game rhythm to reliably beat weaker teams and attract prestige sponsors.',
    effectDescDe: 'Diktierte den Rhythmus, vermeidet Ausrutscher und lockt Edel-Sponsoren an.',
    ovrBonusType: 'dominance'
  },
  'Defensive': {
    icon: 'fa-shield-halved',
    color: 'text-emerald-400',
    en: 'Catenaccio & Relegation Fortress',
    de: 'Bollwerk & Ergebnis-Sicherung',
    gfMod: 0.62,
    gaMod: 0.52,
    perkEn: '-40% Goal Difference Damage & +1 Season Grace in Debt/Relegation',
    perkDe: '-40% Tordifferenz-Schaden & +1 Saison Schonfrist bei Abstiegssorgen',
    effectDescEn: 'Locks down matches to secure crucial 1-0 or 0-0 draws when fighting for survival.',
    effectDescDe: 'Vernagelt das Tor und erkaempft dreckige 1:0 Siege im Abstiegskampf.',
    ovrBonusType: 'catenaccio'
  },
  'Direct Counter': {
    icon: 'fa-gauge-high',
    color: 'text-cyan-400',
    en: 'Vertical Counter-Attack & Speed',
    de: 'Umschaltspiel & Vertikal-Konter',
    gfMod: 1.05,
    gaMod: 0.88,
    perkEn: '+2 OVR Away Match Master & -10% Squad Upgrade Costs in Lower Leagues',
    perkDe: '+2 GES Auswaerts-Bonus & -10% Upgrade-Kosten in tiefen Ligen',
    effectDescEn: 'Punishes high-line teams away from home and optimizes budget in lower leagues.',
    effectDescDe: 'Bestraft hoch stehende Gegner auswaerts und schont das Transferbudget.',
    ovrBonusType: 'away'
  },
  'Catenaccio': {
    icon: 'fa-shield-halved',
    color: 'text-emerald-400',
    en: 'Catenaccio & Relegation Fortress',
    de: 'Bollwerk & Ergebnis-Sicherung',
    gfMod: 0.62,
    gaMod: 0.52,
    perkEn: '-40% Goal Difference Damage & +1 Season Grace in Debt/Relegation',
    perkDe: '-40% Tordifferenz-Schaden & +1 Saison Schonfrist bei Abstiegssorgen',
    effectDescEn: 'Locks down matches to secure crucial 1-0 or 0-0 draws when fighting for survival.',
    effectDescDe: 'Vernagelt das Tor und erkaempft dreckige 1:0 Siege im Abstiegskampf.',
    ovrBonusType: 'catenaccio'
  },
  'Park the Bus': {
    icon: 'fa-shield-halved',
    color: 'text-emerald-400',
    en: 'Catenaccio & Relegation Fortress',
    de: 'Bollwerk & Ergebnis-Sicherung',
    gfMod: 0.62,
    gaMod: 0.52,
    perkEn: '-40% Goal Difference Damage & +1 Season Grace in Debt/Relegation',
    perkDe: '-40% Tordifferenz-Schaden & +1 Saison Schonfrist bei Abstiegssorgen',
    effectDescEn: 'Locks down matches to secure crucial 1-0 or 0-0 draws when fighting for survival.',
    effectDescDe: 'Vernagelt das Tor und erkaempft dreckige 1:0 Siege im Abstiegskampf.',
    ovrBonusType: 'catenaccio'
  }
};

export const normalizeTactic = (style?: string): string => {
  if (!style) return 'Total Football';
  const s = style.trim().toLowerCase();
  if (s === 'catenaccio' || s === 'park the bus' || s === 'defensive') return 'Defensive';
  if (s === 'tiki-taka' || s === 'possession') return 'Tiki-Taka';
  if (s === 'gegenpressing' || s === 'gegenpress' || s === 'pressing') return 'Gegenpressing';
  if (s === 'direct counter' || s === 'counter' || s === 'counter-attack' || s === 'wing play') return 'Direct Counter';
  if (s === 'total football' || s === 'attacking') return 'Total Football';
  return style;
};

export const isTacticalSynergy = (coachStyle?: string, clubTactic?: string): boolean => {
  if (!coachStyle || !clubTactic) return false;
  if (coachStyle.trim().toLowerCase() === clubTactic.trim().toLowerCase()) return true;
  return normalizeTactic(coachStyle) === normalizeTactic(clubTactic);
};

export const TACTICS = PHILOSOPHIES;

export const rand = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;




export const formatMoney = (val: number | string, country?: string): string => {
  return formatMoneyWithCountry(val, country);
};

export const getLeagueMaxAttendance = (tier: number, isReserve: boolean, country: string = 'GER', clubName: string = ''): number => {
  if (isReserve) return 900;
  const isBigThreePOR = country === 'POR' && ['SL Benfica', 'Benfica', 'FC Porto', 'Sporting CP'].some(n => clubName.includes(n));
  if (isBigThreePOR) return 100000;

  const isGiantsESP = country === 'ESP' && ['Madrid FC', 'Catalonia FC', 'Atlético M.'].some(n => clubName.includes(n));
  if (isGiantsESP) return 100000;

  const isGiantsENG = country === 'ENG' && ['Manchester Red', 'Manchester Blue', 'North London Red', 'Merseyside Red', 'London Blue', 'London White'].some(n => clubName.includes(n));
  if (isGiantsENG) return 100000;

  const isGiantsITA = country === 'ITA' && ['Milan Blue', 'Milan Red', 'Piemonte Calcio', 'Naples FC', 'Rome Yellow', 'Rome Blue'].some(n => clubName.includes(n));
  if (isGiantsITA) return 100000;

  const isBigThreeTUR = country === 'TUR' && ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'Galata', 'Kadıköy', 'Boğaziçi', 'Karadeniz Trabzon'].some(n => clubName.includes(n));
  if (isBigThreeTUR) return 100000;

  const isSleepingGiantTUR = country === 'TUR' && ['Bursaspor', 'Eskişehirspor', 'Kocaelispor', 'Amed SK', 'Samsunspor', 'Göztepe', 'Yeşil Bursa', 'Anadolu Eskişehir', 'Körfez Kocaeli', 'Diyar Amed', 'Samsun 19 Mayıs', 'İzmir Göztepe'].some(n => clubName.includes(n));
  if (isSleepingGiantTUR) return 45000;

  const league = getLeagueInfo(tier, country);
  const mult = tier === 5 ? 3.5 : tier === 4 ? 3.0 : tier === 3 ? 2.5 : 5.0;
  return Math.max(Math.floor(league.attBase * mult), Math.floor((league.stadBase || 15000) * 1.5));
};

export const calculateInitialFanBase = (stadium: number, tier: number, isReserve: boolean, country: string = 'GER', clubName: string = ''): number => {
  if (isReserve || isReserveClub(clubName)) return Math.min(900, Math.max(200, Math.floor(stadium * 0.15)));

  const rawName = (clubName || '').trim();
  const norm = rawName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Deterministic per-club blend (0..1) so repeated calls (e.g. in sanitizeGameState) stay stable
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = (hash * 31 + norm.charCodeAt(i)) >>> 0;
  }
  const detRatio = norm.length > 0 ? (hash % 1000) / 1000 : 0.5;
  const scaleBand = (min: number, max: number, minStad: number, maxStad: number) => {
    const stadRatio = Math.max(0, Math.min(1, (stadium - minStad) / Math.max(1, maxStad - minStad)));
    const blend = stadRatio * 0.65 + detRatio * 0.35;
    return Math.round((min + (max - min) * blend) / 1000) * 1000;
  };

  // 1. Global Mega-Giants (2.5M – 6.0M starting fans)
  const isMegaGiant =
    norm === 'paris' ||
    norm === 'psg' ||
    norm === 'inter' ||
    norm === 'barcelona' ||
    norm === 'real madrid' ||
    norm === 'liverpool' ||
    norm === 'arsenal' ||
    norm === 'chelsea' ||
    norm === 'juventus' ||
    norm === 'flamengo' ||
    norm === 'corinthians' ||
    norm === 'chivas' ||
    [
      'real madrid', 'madrid white', 'madrid fc',
      'fc barcelona', 'catalunya', 'catalonia fc',
      'liverpool fc', 'merseyside red',
      'manchester united', 'man utd', 'man red', 'manchester red',
      'manchester city', 'man city', 'man blue', 'manchester blue',
      'arsenal fc', 'north london red',
      'chelsea fc', 'west london', 'london blue',
      'bayern munich', 'bayern munchen', 'fc bayern', 'munich red', 'fc bavaria',
      'borussia dortmund', 'dortmund yellow', 'borussia west',
      'paris saint-germain', 'paris sg',
      'torino b-w', 'piemonte calcio',
      'ac milan', 'milano red', 'milan red',
      'inter milan', 'internazionale', 'milano blue', 'milan blue',
      'cr flamengo', 'sc corinthians',
      'boca juniors', 'river plate',
      'club america', 'cf america',
      'cd guadalajara',
      'al-hilal', 'al hilal',
      'al-nassr', 'al nassr',
    ].some((pattern) => norm.includes(pattern)) ||
    (norm === 'north london' && country === 'ENG');

  if (isMegaGiant) {
    return scaleBand(2500000, 6000000, 40000, 90000);
  }

  // 2. Continental & National Heavyweights (650k – 2.2M starting fans)
  const isContinentalHeavyweight =
    norm === 'roma' ||
    norm === 'lazio' ||
    norm === 'napoli' ||
    norm === 'marseille' ||
    norm === 'lyon' ||
    norm === 'monaco' ||
    norm === 'benfica' ||
    norm === 'porto' ||
    norm === 'sporting' ||
    norm === 'ajax' ||
    norm === 'psv' ||
    norm === 'feyenoord' ||
    norm === 'celtic' ||
    norm === 'rangers' ||
    norm === 'galatasaray' ||
    norm === 'fenerbahce' ||
    norm === 'besiktas' ||
    norm === 'palmeiras' ||
    norm === 'santos' ||
    norm === 'gremio' ||
    norm === 'nacional' ||
    norm === 'penarol' ||
    [
      'atletico madrid', 'atletico m.', 'madrid red',
      'tottenham', 'london white', 'north london white',
      'newcastle', 'aston villa',
      'bayer leverkusen', 'leverkusen red-black', 'bayer 04',
      'rb leipzig', 'leipzig rasen', 'rasenballsport leipzig',
      'schalke 04', 'fc schalke',
      'hamburger sv', 'eintracht frankfurt',
      '1. fc koln', '1. fc koeln', 'fc koln',
      'vfb stuttgart',
      'ssc napoli', 'naples fc',
      'as roma', 'rome yellow',
      'ss lazio', 'rome blue',
      'olympique marseille', 'olympique lyon', 'as monaco',
      'sl benfica', 'fc porto', 'sporting cp', 'sporting lisbon',
      'afc ajax', 'psv eindhoven',
      'galata', 'kadikoy', 'bogazici',
      'se palmeiras', 'sao paulo', 'santos fc', 'fbpa gremio',
      'club nacional', 'ca penarol', 'colo-colo', 'colo colo',
      'la galaxy', 'inter miami', 'seattle sounders', 'atlanta united',
      'urawa reds', 'urawa red diamonds',
      'kaizer chiefs', 'orlando pirates',
      'al ahly', 'al-ahly',
    ].some((pattern) => norm.includes(pattern));

  if (isContinentalHeavyweight) {
    return scaleBand(650000, 2200000, 25000, 75000);
  }

  // 3. Dynamic Stadium & Tier Fallback for all other clubs (including custom modded clubs)
  if (tier === 1) {
    if (stadium >= 50000) return scaleBand(1200000, 3000000, 50000, 85000);
    if (stadium >= 35000) return scaleBand(400000, 1100000, 35000, 50000);
    if (stadium >= 20000) return scaleBand(150000, 380000, 20000, 35000);
  } else if (tier === 2) {
    if (stadium >= 40000) return scaleBand(350000, 850000, 40000, 65000);
    if (stadium >= 25000) return scaleBand(120000, 300000, 25000, 40000);
  } else if (tier === 3) {
    if (stadium >= 25000) return scaleBand(100000, 250000, 25000, 50000);
  }

  // 4. Grassroots / Smaller Clubs Formula
  const league = getLeagueInfo(tier, country);
  const maxAtt = getLeagueMaxAttendance(tier, false, country, clubName);
  let proportion = tier === 1 ? 0.75 : tier === 2 ? 0.60 : tier === 3 ? 0.45 : tier === 4 ? 0.30 : 0.20;
  if (country === 'POR') {
    proportion = tier === 1 ? 0.45 : tier === 2 ? 0.22 : tier === 3 ? 0.18 : tier === 4 ? 0.14 : 0.10;
  } else if (country === 'ESP') {
    proportion = tier === 1 ? 0.65 : tier === 2 ? 0.38 : tier === 3 ? 0.22 : tier === 4 ? 0.16 : 0.12;
  } else if (country === 'ENG') {
    proportion = tier === 1 ? 0.92 : tier === 2 ? 0.72 : tier === 3 ? 0.50 : tier === 4 ? 0.38 : 0.28;
  } else if (country === 'ITA') {
    proportion = tier === 1 ? 0.72 : tier === 2 ? 0.48 : tier === 3 ? 0.32 : tier === 4 ? 0.20 : 0.12;
  } else if (country === 'TUR') {
    const isSleepingGiant = ['Bursaspor', 'Eskişehirspor', 'Kocaelispor', 'Amed SK', 'Samsunspor', 'Göztepe', 'Yeşil Bursa', 'Anadolu Eskişehir', 'Körfez Kocaeli', 'Diyar Amed', 'Samsun 19 Mayıs', 'İzmir Göztepe'].some(n => clubName.includes(n));
    proportion = isSleepingGiant ? 0.60 : (tier === 1 ? 0.50 : tier === 2 ? 0.28 : 0.18);
  }
  const baseFan = Math.floor(stadium * proportion);
  return Math.max(Math.floor(league.attBase * 0.7), Math.min(maxAtt, baseFan));
};

export const getLeagueStadiumRequirement = (tier: number, country: string = 'GER'): number => {
  if (country === 'GER') {
    if (tier === 1) return 25000;
    if (tier === 2) return 15000;
    if (tier === 3) return 10000;
    if (tier === 4) return 3000;
    return 1000;
  }
  if (country === 'ESP') {
    if (tier === 1) return 20000;
    if (tier === 2) return 12000;
    if (tier === 3) return 6000;
    if (tier === 4) return 2500;
    return 1000;
  }
  if (country === 'ITA') {
    if (tier === 1) return 20000;
    if (tier === 2) return 10000;
    if (tier === 3) return 5000;
    if (tier === 4) return 2000;
    return 1000;
  }
  if (country === 'FRA') {
    if (tier === 1) return 18000;
    if (tier === 2) return 10000;
    if (tier === 3) return 5000;
    if (tier === 4) return 2000;
    return 1000;
  }
  if (country === 'POR') {
    if (tier === 1) return 12000;
    if (tier === 2) return 6000;
    if (tier === 3) return 3000;
    if (tier === 4) return 1500;
    return 800;
  }
  if (country === 'ENG') {
    if (tier === 1) return 25000;
    if (tier === 2) return 15000;
    if (tier === 3) return 8000;
    if (tier === 4) return 4000;
    return 2000;
  }
  if (country === 'USA') {
    if (tier === 1) return 18000;
    if (tier === 2) return 8000;
    if (tier === 3) return 4000;
    if (tier === 4) return 2000;
    return 1000;
  }
  if (country === 'BRA') {
    if (tier === 1) return 20000;
    if (tier === 2) return 10000;
    return 2000;
  }
  if (country === 'ARG') {
    if (tier === 1) return 16000;
    if (tier === 2) return 8000;
    return 2000;
  }
  if (country === 'MEX') {
    if (tier === 1) return 20000;
    if (tier === 2) return 10000;
    return 2000;
  }
  if (country === 'COL' || country === 'ECU') {
    if (tier === 1) return 10000;
    if (tier === 2) return 4000;
    return 1000;
  }
  if (country === 'JPN') {
    if (tier === 1) return 15000;
    if (tier === 2) return 8000;
    return 2000;
  }
  if (country === 'SCO') {
    if (tier === 1) return 10000;
    if (tier === 2) return 4000;
    return 1000;
  }
  if (country === 'WAL') {
    if (tier === 1) return 3000;
    return 500;
  }
  if (country === 'AUT' || country === 'SUI') {
    if (tier === 1) return 8000;
    return 2000;
  }
  if (country === 'POL') {
    if (tier === 1) return 10000;
    if (tier === 2) return 3000;
    if (tier === 3) return 1200;
    if (tier === 4) return 500;
    return 200;
  }
  if (country === 'AUS') {
    if (tier === 1) return 10000;
    return 2000;
  }
  if (country === 'CAN') {
    if (tier === 1) return 5000;
    return 1000;
  }
  if (country === 'TUR') {
    if (tier === 1) return 15000;
    if (tier === 2) return 6000;
    return 2000;
  }
  // Default Association fallback
  if (tier === 1) return 15000;
  if (tier === 2) return 6000;
  if (tier === 3) return 3000;
  return 1000;
};

export const getLeagueScaledFans = (tier: number, baseLeague1Fans: number, country: string = 'GER', originalStartTier?: number): number => {
  // If the club started in tier 7 (like Dessau) and climbed up to tier 4, their fanbase doesn't magically become 10,000 instantly.
  // We heavily penalize tier 4 and tier 5 fan growth if they originated from the deep abyss (tier 6/7)
  const effectiveStartTier = originalStartTier ?? tier;
  let mult = tier === 1 ? 1.0 : tier === 2 ? 0.35 : tier === 3 ? 0.12 : tier === 4 ? 0.04 : tier === 5 ? 0.015 : tier === 6 ? 0.005 : 0.002;
  
  if (country === 'GER' && effectiveStartTier >= 6) {
    if (tier === 4) mult = 0.01; // Severely crippled tier 4 fanbase for amateur clubs climbing up
    if (tier === 5) mult = 0.005; // League 5 is barely better than League 6
  }
  const cMult = getCountryMult(country);
  const scaled = Math.round(baseLeague1Fans * mult * cMult);
  if (scaled >= 1000) return Math.round(scaled / 100) * 100;
  if (scaled >= 100) return Math.round(scaled / 50) * 50;
  return Math.max(10, Math.round(scaled / 10) * 10);
};


export const getCountryMult = (country: string): number => {
  const code = normalizeCountryCode(country);
  switch (code) {
    case 'ENG': return 1.60;
    case 'ESP': return 1.00;
    case 'GER': return 1.00;
    case 'ITA': return 0.85;
    case 'FRA': return 0.75;
    case 'USA': return 0.50; // MLS has good money but not Top 5 Europe
    case 'BRA': return 0.40;
    case 'MEX': return 0.30;
    case 'POR': return 0.25;
    case 'ARG': return 0.25;
    case 'TUR': return 0.15;
    case 'JPN': return 0.15;
    case 'DEN': return 0.13;
    case 'NOR': return 0.12;
    case 'SWE': return 0.12;
    case 'SCO': return 0.12;
    case 'AUT': return 0.12;
    case 'SUI': return 0.12;
    case 'GRE': return 0.12;
    case 'CRO': return 0.11;
    case 'KOR': return 0.11;
    case 'ECU': return 0.10;
    case 'CHI': return 0.10;
    case 'PER': return 0.09;
    case 'PAR': return 0.08;
    case 'COL': return 0.08;
    case 'POL': return 0.08;
    case 'BOL': return 0.06;
    case 'SVK': return 0.06;
    case 'AUS': return 0.06;
    case 'IDN': return 0.05;
    case 'IND': return 0.05;
    case 'CAN': return 0.03; // Canadian Premier League is a smaller market
    case 'WAL': return 0.015; // Cymru Premier is largely semi-pro
    default: return 0.50; // Global mid-market baseline fallback for custom/community mod countries with no explicit data
  }
};

let currentGlobalYear = 2024;
export const setGlobalYear = (y: number) => { currentGlobalYear = y; };

export const getLeagueScaledVal = (tier: number, baseLeague1K: number | number[], country: string = 'GER'): number => {
  const mults = [0, 1.0, 0.28, 0.08, 0.03, 0.015, 0.007, 0.0035, 0.0018, 0.0009, 0.0005, 0.0003];
  const mult = mults[tier] || 0.000025;
  let scaled: number;
  if (Array.isArray(baseLeague1K)) {
    const safeTier = Math.max(1, Math.floor(tier || 1));
    if (safeTier < baseLeague1K.length && typeof baseLeague1K[safeTier] === 'number') {
      scaled = baseLeague1K[safeTier];
    } else {
      const fallbackBase = baseLeague1K[1] ?? baseLeague1K[0] ?? 100;
      scaled = fallbackBase * mult;
    }
  } else {
    scaled = (Number(baseLeague1K) || 0) * mult;
  }
  
  const countryMult = getCountryMult(country);
  const yearsPassed = Math.max(0, currentGlobalYear - 2024);
  const inflation = 1.0; // Inflation disabled to prevent runaway economy scaling
  scaled *= (countryMult * inflation);

  let result = scaled;
  if (scaled >= 1000) result = Math.round(scaled / 250) * 250;
  else if (scaled >= 100) result = Math.round(scaled / 25) * 25;
  else if (scaled >= 10) result = Math.round(scaled / 5) * 5;
  
  return Math.max(1, Math.floor(result));
};

export const calculateClubFinancials = (state: {
  club: { name: string; tier: number; baseOvr: number; stadium: number; fanBase?: number; country?: string; squadSize?: number; academyLevel?: number; medicalLevel?: number; };
  budget: number;
  isManaged?: boolean;
  tactic?: string;
  euroStatus?: 'CL' | 'EL' | 'ECL' | null;
  sponsorIncome?: number;
  managerSkills?: string[];
  keyTransfersThisSeason?: number;
  galacticosThisSeason?: number;
  failedSponsorTargetNextSeason?: boolean;
  seasonCount?: number;
  startYear?: number;
  year?: number;
  severances?: { amount: number, yearsLeft: number }[];
  bankLoan?: { principal: number; annualPayment: number; totalYears: number; yearsLeft: number };
  archetype?: string;
  ownership?: string;
  stadiumPolicy?: string;
  youthPipeline?: any[];
  isPublic?: boolean;
  stockPrice?: number;
  ipoPrice?: number;
  clubIdentity?: string;
}) => {
  const tier = state.club.tier || 5;
  const country = state.club.country || 'GER';
  const cMult = getCountryMult(country);
  const league = getLeagueInfo(tier, country);
  const isReserve = isReserveClub(state.club.name);

// 1. OVR Wage Scaling anchored to league average OVR
  const leagueAvgOvr = league.avgOvr || (tier === 1 ? 80 : tier === 2 ? 69 : tier === 3 ? 62 : tier === 4 ? 54 : 45);
  const ovrRatio = state.club.baseOvr / leagueAvgOvr;
  
  // Base wage multiplier anchored around 1.0 at league average OVR
  let exponent = 2.2;
  if (tier >= 7) exponent = 1.0;
  else if (tier === 6) exponent = 1.3;
  else if (tier === 5) exponent = 1.6;
  
  // Adjust base wages if they are too punitive for tier 5/6, especially in Portugal
  let baseWageDiscount = 1.0;
  if (tier === 5 && country === 'POR') baseWageDiscount = 0.50; // Massively discount wages to balance tier 5 POR
  if (tier >= 6) baseWageDiscount = 0.40;
  
  let wageMultiplier = Math.pow(ovrRatio, exponent);

  // Lower-tier Star Player Wage Surcharge (Leagues 3, 4, 5):
  // When a team in lower tiers carries star player quality above division average, wages scale linearly and predictably
  if (tier >= 3 && state.club.baseOvr > leagueAvgOvr) {
    const starExtra = state.club.baseOvr - leagueAvgOvr;
    const tierFactor = tier === 3 ? 0.03 : tier === 4 ? 0.04 : 0.05;
    wageMultiplier += starExtra * tierFactor;
  }

  // Direct Star Player Signing Wage Demand Surcharge (for active key transfers)
  const keyTrans = state.keyTransfersThisSeason || 0;
  if (keyTrans > 0) {
    const keyTransferWageMultiplier = tier === 1 ? 0.06 : tier === 2 ? 0.08 : 0.10;
    wageMultiplier += keyTrans * keyTransferWageMultiplier;
  }

  // Veteran Ringer High-Risk Promotion Gamble (Tiers 3-11): Exorbitant 1-Season Wage Burden handled via veteranRingerWageK surcharge below

  // Top-flight Superstar Wage Scaling: OVR above 82 in League 1 triggers progressive wage increases
  if (tier === 1 && state.club.baseOvr > 82) {
    const starExtra = state.club.baseOvr - 82;
    wageMultiplier += Math.pow(starExtra, 1.25) * 0.015;
  }

  // Smaller Tier 1 League Superstar Wage Premium: Outstripping division standard triggers retention wage inflation
  if (tier === 1 && state.club.baseOvr > leagueAvgOvr + 5) {
    const leagueOutstrip = state.club.baseOvr - (leagueAvgOvr + 5);
    wageMultiplier += leagueOutstrip * 0.04;
  }

  // Stadium Operational & Facility Maintenance (scaled per seat and adjusted dynamically for local country economy)
  const countrySeatCostMult = Math.max(0.10, Math.min(1.5, cMult));
  const perSeatCost = (tier === 1 ? 20 : tier === 2 ? 12 : tier === 3 ? 6 : tier === 4 ? 3 : tier === 5 ? 1 : tier === 6 ? 0.5 : tier === 7 ? 0.2 : 0.1) * countrySeatCostMult;
  let stadiumMaintenance = isReserve ? 0 : Math.floor((state.club.stadium * perSeatCost) / 1000);
  if (state.club.stadium > 120000 && !isReserve) {
    // Mega Stadium operating surcharge (exponentially more expensive)
    stadiumMaintenance = Math.floor(stadiumMaintenance * 2.5);
  }

  // Venue Lease & Compliance Fee if Stadium is below League Standard (League 3+)
  const requiredCap = getLeagueStadiumRequirement(tier, country);
  const userCap = state.club.stadium || 2000;
  let venueRentFee = 0;
  if (!isReserve && tier <= 3 && userCap < requiredCap) {
    const deficitRatio = (requiredCap - userCap) / requiredCap;
    const baseRentCost = tier === 1 ? 3200 : tier === 2 ? 1200 : 450;
    const localRentMult = Math.max(0.08, Math.min(1.0, cMult));
    venueRentFee = Math.floor(baseRentCost * localRentMult * deficitRatio);
  }

  // Luxury / UEFA FFP Tax: 8% on funds exceeding €60M
  // Exempt clubs with an active billionaire / sovereign wealth / sugar daddy takeover windfall
  let luxuryTax = 0;
  const isTakeoverExempt = Boolean(
    (state as any).billionaireTakeoverYear ||
    state.ownership === 'billionaire' ||
    (state as any).sugarDaddyBoost
  );
  if (!isTakeoverExempt) {
    if (state.budget > 300000) {
      luxuryTax = Math.floor((state.budget - 300000) * 0.40) + Math.floor(150000 * 0.25) + Math.floor(90000 * 0.10);
    } else if (state.budget > 150000) {
      luxuryTax = Math.floor((state.budget - 150000) * 0.25) + Math.floor(90000 * 0.10);
    } else if (state.budget > 60000) {
      luxuryTax = Math.floor((state.budget - 60000) * 0.10);
    }
  }

  const pipeline = (state as any).youthPipeline || [];
  let baseYouthCoaching = tier === 1 ? 1200 : tier === 2 ? 500 : tier === 3 ? 200 : tier === 4 ? 80 : tier === 5 ? 30 : tier === 6 ? 10 : tier === 7 ? 5 : tier === 8 ? 2 : 1;
  let perProspectCost = tier === 1 ? 200 : tier === 2 ? 100 : tier === 3 ? 50 : tier === 4 ? 25 : tier === 5 ? 10 : tier === 6 ? 5 : tier === 7 ? 2 : 1;
  
  // Scale youth coaching costs proportionally to country economy
  const youthCostMult = Math.max(0.08, Math.min(1.5, cMult));
  baseYouthCoaching = Math.floor(baseYouthCoaching * youthCostMult);
  perProspectCost = Math.floor(perProspectCost * youthCostMult);

  const activeYouthCost = pipeline.reduce((sum: number, p: any) => {
    const typeMult = p.type === 'generational' ? 1.8 : p.type === 'top_prospect' ? 1.4 : 1.0;
    return sum + Math.floor(perProspectCost * typeMult);
  }, 0);

  let youthMaintenance = isReserve ? 0 : baseYouthCoaching + activeYouthCost;

  const squadSizeModifier = (state.club.squadSize || 24) / 24;
  let pureWages = Math.floor(league.wages * wageMultiplier * squadSizeModifier * (typeof baseWageDiscount !== 'undefined' ? baseWageDiscount : 1.0));
  pureWages = Math.floor(pureWages * (0.7 + 0.3 * Math.min(1.2, Math.max(0.75, (state.club.stadium || league.stadBase) / league.stadBase))));
  if (isReserve) {
    pureWages = Math.floor(pureWages * 0.50);
  }

  // Exponential Super-Team Wage Surcharge at 95+ OVR:
  // Fielding 11 global superstars commands exponential wage gravity to prevent effortless cash hoarding
  let superstarSurcharge = 0;
  if (state.club.baseOvr >= 95) {
    const eliteExtra = state.club.baseOvr - 94;
    const superstarWageMultiplier = Math.pow(1.25, eliteExtra);
    const unscaledPureWages = pureWages;
    pureWages = Math.floor(pureWages * superstarWageMultiplier);
    superstarSurcharge = pureWages - unscaledPureWages;
  }
  
  const academyLevel = state.club.academyLevel || 1;
  const medicalLevel = state.club.medicalLevel || 1;
  
  // Upkeep scales strongly by tier and country.
  const tierUpkeepMultiplier = tier === 1 ? 1.0 : tier === 2 ? 0.6 : tier === 3 ? 0.3 : tier === 4 ? 0.15 : tier === 5 ? 0.08 : tier === 6 ? 0.03 : tier === 7 ? 0.015 : tier === 8 ? 0.008 : tier === 9 ? 0.004 : 0.002;
  
  const baseFacilityCost = 300; // Base cost at tier 1 for Germany/Spain (values are in thousands, so 300 = €300K)
  let academyUpkeep = Math.floor((baseFacilityCost * tierUpkeepMultiplier * cMult) * Math.pow(1.5, academyLevel - 1));
  let medicalUpkeep = Math.floor((baseFacilityCost * tierUpkeepMultiplier * cMult) * Math.pow(1.5, medicalLevel - 1));

  let severanceTotal = 0;
  if (state.severances) {
    severanceTotal = state.severances.reduce((acc, curr) => acc + curr.amount, 0);
  }

  const veteranRingerWageSurcharge =
    (state as any).veteranRingerActive || (state as any).veteranRingerSignedThisSeason
      ? (state as any).veteranRingerWageK || Math.floor(league.wages * 0.25)
      : 0;

  let totalWages = pureWages + veteranRingerWageSurcharge + stadiumMaintenance + venueRentFee + luxuryTax + youthMaintenance + academyUpkeep + medicalUpkeep + severanceTotal;

  // 2. Revenue Calculations
  const maxAtt = getLeagueMaxAttendance(tier, isReserve, state.club.country || 'GER', state.club.name);
  
  let fanBaseTemp = state.club.fanBase ?? league.attBase;
  if (state.ownership === 'fan_trust') {
    fanBaseTemp = Math.floor(fanBaseTemp * 1.20);
  }
  
  const baseExpectedAtt = isReserve
    ? Math.min(700, maxAtt)
    : Math.min(
        fanBaseTemp,
        state.club.stadium,
        maxAtt
      );
      
  // Apply a seasonal variance (-10% to +10%) based on year so it's deterministic per season
  const sCount = state.year || 2024;
  const pseudoRandom = Math.abs(Math.sin(sCount * 12.9898 + state.club.baseOvr)) % 1;
  const seasonalVariance = 0.90 + (pseudoRandom * 0.20);
  const rawAttendance = Math.round(baseExpectedAtt * seasonalVariance);
  const nonRoundOffset = Math.round((pseudoRandom - 0.5) * Math.min(40, baseExpectedAtt * 0.1));
  let expectedAtt = Math.min(state.club.stadium, Math.max(10, rawAttendance + nonRoundOffset));
  if (expectedAtt === state.club.stadium && tier > 2) {
    const noShows = Math.floor(pseudoRandom * (state.club.stadium * 0.03)) + 3;
    expectedAtt = Math.max(10, expectedAtt - noShows);
  }

  const hasUltraliebling = (state.managerSkills || []).includes('ultraliebling');
  const hasSalesmaster = (state.managerSkills || []).includes('salesmaster');

  let matchdayMult = hasUltraliebling ? 1.15 : 1.0;
  if (state.stadiumPolicy === 'commercial') {
    matchdayMult *= 1.18; // VIP hospitality & corporate suites yield
  } else if (state.stadiumPolicy === 'ultras') {
    matchdayMult *= 0.95; // Capped affordable standing terrace ticket prices for active fans
  }
  const matchdayIncomeK = Math.floor(((expectedAtt * league.ticket * 17) / 1000) * matchdayMult);



  const basePosPrizeK =
    tier === 1 ? 5000
    : tier === 2 ? 1500
    : tier === 3 ? 250
    : tier === 4 ? 50
    : tier === 5 ? 15
    : tier === 6 ? 5
    : 2;
  const posPrizeK = Math.floor(basePosPrizeK * cMult);

  const euroRev = isReserve
    ? 0
    : state.euroStatus === 'CL'
    ? Math.floor(25000 * cMult)
    : state.euroStatus === 'EL'
    ? Math.floor(12000 * cMult)
    : state.euroStatus === 'ECL'
    ? Math.floor(6000 * cMult)
    : 0;

  // Guaranteed Baseline Primary Sponsor Income + Negotiated Secondary/Pitch Sponsor Income
  // Lower tiers (Leagues 3, 4, 5) get minimal auto sponsor revenue, requiring active management via sponsors & player sales
  const autoSponsorRate = tier === 1 ? 0.25 : tier === 2 ? 0.25 : tier === 3 ? 0.22 : tier === 4 ? 0.16 : tier === 5 ? 0.12 : 0.08;
  const baseAutoSponsor = isReserve
    ? 0
    : Math.floor(league.wages * autoSponsorRate * Math.pow(state.club.baseOvr / leagueAvgOvr, 1.1));

  const extraSponsorInc = state.sponsorIncome || 0;
  const sponsorPenaltyMult = state.failedSponsorTargetNextSeason ? 0.60 : 1.0;
  const tikiTakaSponsorMult = state.tactic === 'Tiki-Taka' ? 1.15 : 1.0;
  const financeGuruSponsorMult = state.archetype === 'finance' ? 1.20 : 1.0;
  const autoSponsorFinal = Math.floor(
    baseAutoSponsor *
      (hasSalesmaster ? 1.20 : 1.0) *
      tikiTakaSponsorMult *
      financeGuruSponsorMult *
      sponsorPenaltyMult
  );
  const sponsorInc = autoSponsorFinal; // FIX: Only report auto sponsor in operations projection

 // Regional Association & Operational Support Stipend
  const regionalGrant = isReserve
    ? tier === 3
      ? 600
      : tier === 4
      ? 300
      : 150
    : tier === 3
    ? 100
    : tier === 4
    ? 50
    : tier === 5
    ? (country === 'POR' ? 180 : 20)
    : tier === 6
    ? (country === 'POR' ? 100 : 0)
    : 0;

  // Level 5 Youth Academy Solidarity Dividend (+€1.5M / yr scaled to country economy)
  const academyDividend = !isReserve && (state.club.academyLevel || 1) >= 5 ? Math.max(150, Math.round(1500 * cMult)) : 0;

  // FIX: Do NOT include extraSponsorInc in estRevenue to prevent double-counting upfront cash
  let boardSubsidy = 0;
  let estRevenue = Math.floor(matchdayIncomeK + league.tvPrize + posPrizeK + euroRev + autoSponsorFinal + regionalGrant + academyDividend);
  
  // Ensure starting ops margin is net zero or slightly positive strictly at the inaugural season
  const startYr = state.startYear || 2026;
  const isFirstSeason = state.seasonCount !== undefined
    ? state.seasonCount <= 1
    : (state.year === startYr);
  if (isFirstSeason) {
    if (estRevenue < totalWages) {
      boardSubsidy = totalWages - estRevenue + Math.max(10, Math.floor(totalWages * 0.05));
      estRevenue += boardSubsidy;
    }
  }
  
  const academyLvl = state.club.academyLevel || 1;
  const medicalLvl = state.club.medicalLevel || 1;
  let totalExpenses = totalWages;

  // 1. Isolate Baseline vs. Player-Driven Expenses
  // Standard default squad is 24 players. Only roster sizes exceeding 24 represent active expansion.
  // Super-team surcharge at 95+ OVR for player-managed dynasties is player-driven and exempt from baseline solvency cushioning.
  const isManagedClub = Boolean(state.isManaged || (state.managerSkills && state.managerSkills.length > 0) || state.archetype);
  const baselineSquadModifier = Math.min(1.0, squadSizeModifier);
  const regularWages = isManagedClub ? Math.max(0, pureWages - superstarSurcharge) : pureWages;
  let baselinePureWages = Math.min(regularWages, Math.floor(regularWages * baselineSquadModifier));
  let extraPureWages = (isManagedClub
    ? (regularWages - baselinePureWages) + superstarSurcharge
    : (pureWages - baselinePureWages)) + veteranRingerWageSurcharge;

  let baselineExpenses = baselinePureWages + stadiumMaintenance + venueRentFee;

  // 2. Universal baseline solvency cap across ALL countries and ALL tiers:
  // Baseline unavoidable squad & stadium commitments must never exceed 85% of operating revenue.
  const baselineCap = Math.floor(estRevenue * 0.85);
  if (baselineExpenses > baselineCap && baselineExpenses > 0) {
    const ratio = baselineCap / baselineExpenses;
    baselinePureWages = Math.floor(baselinePureWages * ratio);
    stadiumMaintenance = Math.floor(stadiumMaintenance * ratio);
    venueRentFee = Math.floor(venueRentFee * ratio);
    baselineExpenses = baselinePureWages + stadiumMaintenance + venueRentFee;
  }

  // Baseline facility upkeep & youth coaching must not push a standard club into structural deficit
  const nonExtraExpenses = baselineExpenses + academyUpkeep + medicalUpkeep + youthMaintenance;
  const totalBaselineCap = Math.floor(estRevenue * 0.94);
  if (nonExtraExpenses > totalBaselineCap && nonExtraExpenses > 0) {
    const diff = nonExtraExpenses - totalBaselineCap;
    const totalFacilityUpkeep = Math.max(1, academyUpkeep + medicalUpkeep + youthMaintenance);
    const facilityRatio = Math.max(0.15, (totalFacilityUpkeep - diff) / totalFacilityUpkeep);
    academyUpkeep = Math.floor(academyUpkeep * facilityRatio);
    medicalUpkeep = Math.floor(medicalUpkeep * facilityRatio);
    youthMaintenance = Math.floor(youthMaintenance * facilityRatio);
  }

  let facilityExpenses = academyUpkeep + medicalUpkeep + extraPureWages + youthMaintenance + luxuryTax;

  // 3. Enforce Uncapped Consequences (Recombine)
  pureWages = baselinePureWages + extraPureWages;
  let debtInterest = 0;
  if (state.budget < 0) {
    // 10% interest on outstanding debt
    debtInterest = Math.floor(Math.abs(state.budget) * 0.10);
  }
  let bankLoanDebtService = 0;
  if (state.bankLoan && (state.bankLoan.yearsLeft === undefined || state.bankLoan.yearsLeft > 0)) {
    bankLoanDebtService = state.bankLoan.annualPayment;
  }
  // Public Shareholder Dividend (Step 5)
  // 15% of operating profit, scaled by stock performance ratio (stockPrice / ipoPrice)
  let shareholderDividend = 0;
  if (state.isPublic) {
    const operatingProfit = Math.max(0, estRevenue - (baselineExpenses + facilityExpenses + severanceTotal + debtInterest + bankLoanDebtService));
    const baseDividend = Math.max(0, operatingProfit * 0.15); // 15% of profits
    const stockPrice = typeof state.stockPrice === 'number' ? state.stockPrice : 10;
    const ipoPrice = typeof state.ipoPrice === 'number' && state.ipoPrice > 0 ? state.ipoPrice : stockPrice;
    const actualDividendPayout = Math.floor(baseDividend * (stockPrice / ipoPrice));
    shareholderDividend = Math.min(Math.floor(operatingProfit * 0.60), actualDividendPayout);
  }
  totalExpenses = baselineExpenses + facilityExpenses + severanceTotal + debtInterest + bankLoanDebtService + shareholderDividend;

  if (state.clubIdentity === 'heritage') {
    totalExpenses = Math.round(totalExpenses * 0.8);
    pureWages = Math.round(pureWages * 0.8);
  }

  const net = estRevenue - totalExpenses;

  return {
    wages: totalExpenses,
    pureWages,
    stadiumOp: stadiumMaintenance + venueRentFee,
    medicalOp: medicalUpkeep,
    academyOp: youthMaintenance + academyUpkeep,
    severanceOp: severanceTotal,
    luxuryTax,
    estRevenue,
    net,
    sponsorInc, extraSponsorInc,
    parentClubGrant: regionalGrant,
    matchdayIncomeK,
    expectedAtt,
    tvPrize: league.tvPrize,
    posPrizeK,
    euroRev,
    youthMaintenance,
    venueRentFee,
    requiredCap,
    debtInterest,
    bankLoanDebtService,
    shareholderDividend,
    boardSubsidy,
    academyDividend,
    veteranRingerWageSurcharge,
  };
};

export interface HistoricalManager {
  id: string;
  name: string;
  trophies: number;
  score: number;
}

export const HISTORICAL_DIRECTORS: HistoricalManager[] = [
  { id: 'nagelsmann', name: 'Julian Bagelsmann', trophies: 3, score: 35000 },
  { id: 'ranieri', name: 'Claudio Ravioli', trophies: 5, score: 50000 },
  { id: 'tuchel', name: 'Thomas Tacheles', trophies: 11, score: 95000 },
  { id: 'heynckes', name: 'Jupp Pancakes', trophies: 15, score: 140000 },
  { id: 'klopp', name: 'Juergen Flop', trophies: 17, score: 180000 },
  { id: 'wenger', name: 'Arsène Winger', trophies: 21, score: 230000 },
  { id: 'mourinho', name: 'José More-or-less', trophies: 26, score: 290000 },
  { id: 'ancelotti', name: 'Carlo Lancelotti', trophies: 30, score: 350000 },
  { id: 'guardiola', name: 'Pep Raviola', trophies: 39, score: 450000 },
  { id: 'ferguson', name: 'Sir Alan Forgeson', trophies: 49, score: 600000 },
];

export const formatNum = (num: number): string => num.toLocaleString();

export const getMinAllowedTierForReserve = (country?: string): number => {
  const code = normalizeCountryCode(country);
  return ['POR', 'ESP', 'ECU', 'USA'].includes(code) ? 2 : 3;
};

export const isReserveClub = (clubName: string): boolean => {
  if (!clubName) return false;
  const trimmed = clubName.trim();
  // EXCEPTION: SSV Jeddeloh II operates as an independent first team in this DB
  if (trimmed === 'SSV Jeddeloh II' || trimmed.toLowerCase() === 'ssv jeddeloh ii' || trimmed.toLowerCase().includes('jeddeloh ii')) {
    return false;
  }
  const lower = trimmed.toLowerCase();
  if (
    lower.endsWith(' ii') ||
    lower.includes(' ii ') ||
    lower.endsWith(' 2') ||
    lower.includes('reserve') ||
    lower.includes(' u21') ||
    lower.includes(' u23') ||
    lower.includes('castilla') ||
    lower.endsWith(' atlètic') ||
    lower.includes('barça atlètic') ||
    lower.includes('barcelona atlètic') ||
    lower.endsWith(' atletico b') ||
    lower.endsWith(' atlético b') ||
    lower.endsWith(' athletic b') ||
    lower.includes('filial') ||
    lower.startsWith('jong ') ||
    lower.includes(' jong ') ||
    lower === 'independiente juniors' ||
    lower === 'deportivo aragón' ||
    lower === 'deportivo aragon' ||
    lower === 'celta fortuna' ||
    lower === 'rc celta fortuna'
  ) {
    return true;
  }
  // ' b' suffix (e.g. 'Athletic Club B', 'Real Sociedad B', 'Borussia Dortmund B')
  // but avoid false positives on generic test or division titles like 'Tier 2 Club B'
  if (lower.endsWith(' b') && !lower.startsWith('tier ') && !lower.startsWith('league ') && !lower.startsWith('division ') && !lower.startsWith('group ')) {
    return true;
  }
  return false;
};

export const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getMonogramHex = (name: string): string => {
  const hash = Array.from(name).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
};

export const getOvrColor = (ovr: number): string => {
  if (ovr >= 90) return 'text-fuchsia-400';
  if (ovr >= 85) return 'text-amber-400';
  if (ovr >= 80) return 'text-emerald-400';
  if (ovr >= 75) return 'text-lime-400';
  if (ovr >= 70) return 'text-yellow-400';
  if (ovr >= 65) return 'text-orange-400';
  return 'text-red-400';
};

export const getClubHistoricContext = (clubName: string, tier: number, isDe: boolean, country: string) => {
  const historyDb: Record<string, { en: string, de: string }> = {
    // Germany
    "Bavaria München": {
      en: "The undisputed record champions of Germany, steeped in European glory and domestic dominance.",
      de: "Der unumstrittene deutsche Rekordmeister, geprägt von europäischen Triumphen und nationaler Dominanz."
    },
    "Dortmund": {
      en: "Famed for their passionate 'Yellow Wall' and thrilling, high-intensity football.",
      de: "Berühmt für die leidenschaftliche 'Gelbe Wand' und packenden, hochintensiven Fußball."
    },
    "Gelsenkirchen": {
      en: "A working-class giant from the Ruhr valley with a massive, fiercely loyal fanbase.",
      de: "Ein Traditionsverein aus dem Ruhrpott mit einer riesigen, treuen Fanbasis."
    },
    "Hamburg": {
      en: "A founding member of the Bundesliga with a rich history of 1980s European triumphs.",
      de: "Ein Bundesliga-Gründungsmitglied mit einer reichen Historie und europäischen Triumphen in den 80ern."
    },
    "Bremen": {
      en: "Known for their attacking flair, 'Weser-Stadion' miracles, and dramatic cup runs.",
      de: "Bekannt für Offensivspektakel, 'Weser-Stadion'-Wunder und dramatische Pokalläufe."
    },
    "Magdeburg": {
      en: "The only East German club to win a European trophy (1974 European Cup Winners' Cup).",
      de: "Der einzige DDR-Club, der je einen Europapokal gewann (Europapokal der Pokalsieger 1974)."
    },
    "Dresden": {
      en: "An East German powerhouse with one of the most vociferous and intimidating fanbases.",
      de: "Ein ostdeutsches Schwergewicht mit einer der lautstärksten und einschüchterndsten Fanszenen."
    },
    "Rostock": {
      en: "The last champions of East Germany, fighting to reclaim their spot on the big stage.",
      de: "Der letzte DDR-Meister, der unermüdlich um die Rückkehr auf die große Bühne kämpft."
    },
    "Kaiserslautern": {
      en: "The 'Red Devils' of the Betzenberg, famous for winning the title as a promoted team in 1998.",
      de: "Die 'Roten Teufel' vom Betzenberg, berühmt für die Sensations-Meisterschaft als Aufsteiger 1998."
    },
    "St. Pauli": {
      en: "A global cult club defined by its punk-rock ethos, pirate skull flag, and left-wing activism.",
      de: "Ein weltweiter Kult-Klub, geprägt von Punk-Rock-Ethos, Totenkopf-Flagge und linkem Aktivismus."
    },
    "Köpenick": {
      en: "The 'Eisern' cult club from the capital, where fans literally bled to save and build their stadium.",
      de: "Der 'Eiserne' Kult-Klub der Hauptstadt, dessen Fans buchstäblich für ihr Stadion bluteten."
    },
    "Stuttgart": {
      en: "The Swabian giants known for their fierce youth academy and multiple dramatic championship runs.",
      de: "Die schwäbischen Giganten, bekannt für ihre starke Jugendakademie und dramatische Meisterschaften."
    },
    "Frankfurt": {
      en: "The 'Eagles', renowned for their massive traveling support and magical European cup nights.",
      de: "Die 'Adler', berühmt für ihre gewaltigen Auswärtsfans und magischen Europapokal-Nächte."
    },
    "Nürnberg": {
      en: "Once the undisputed record champions of Germany, now fighting to restore their former glory.",
      de: "Einst der unumstrittene deutsche Rekordmeister, heute auf der Suche nach altem Glanz."
    },
    "München Sechzig": {
      en: "The 'Lions', a proud traditional club from Munich battling financial chaos to return to the top.",
      de: "Die 'Löwen', ein stolzer Münchner Traditionsverein im Kampf gegen das finanzielle Chaos."
    },
    "Mönchengladbach": {
      en: "The legendary 'Foals' of the 70s, playing dynamic, attacking football steeped in tradition.",
      de: "Die legendäre 'Fohlenelf' der 70er, die für dynamischen, offensiven Traditionsfußball steht."
    },
    "Münster": {
      en: "A founding member of the Bundesliga from Westphalia with a deeply passionate local following.",
      de: "Ein Bundesliga-Gründungsmitglied aus Westfalen mit einer tief verwurzelten lokalen Anhängerschaft."
    },
    "Aachen": {
      en: "Famed for their intense 'Tivoli' atmosphere and dramatic cup runs in the early 2000s.",
      de: "Berühmt für die hitzige 'Tivoli'-Atmosphäre und dramatische Pokalläufe in den frühen 2000ern."
    },
    "Essen": {
      en: "A sleeping giant from the Ruhr with a massive stadium and a fiercely loyal, working-class fanbase.",
      de: "Ein schlafender Riese aus dem Ruhrgebiet mit gewaltigem Stadion und treuer Arbeiterklasse-Fanbasis."
    },
    "Cottbus": {
      en: "A gritty East German club famous for surviving against all odds in the Bundesliga in the 2000s.",
      de: "Ein ostdeutscher Kultclub, der sich in den 2000ern allen Widerständen in der Bundesliga trotzte."
    },
    
    // England
    "Man United": {
      en: "A global behemoth with a legendary history of dramatic late goals and historic trebles.",
      de: "Ein globaler Gigant mit einer legendären Historie voller dramatischer später Tore."
    },
    "Liverpool": {
      en: "Six-time European champions, famous for the magical, roaring atmosphere of Anfield nights.",
      de: "Sechsmaliger Europapokalsieger, berühmt für die magische Atmosphäre der Anfield-Nächte."
    },
    "Arsenal": {
      en: "The 'Invincibles', renowned for playing beautiful, technically flawless passing football.",
      de: "Die 'Invincibles', bekannt für wunderschönen, technisch makellosen Passfußball."
    },
    "Wrexham": {
      en: "A historic Welsh club thrust into the global spotlight by Hollywood ownership and a fierce revival.",
      de: "Ein historischer walisischer Club, der durch Hollywood-Besitzer weltweit ins Rampenlicht rückte."
    },
    "Portsmouth": {
      en: "A proud south-coast club with a fiercely loyal fanbase, rebuilding from total financial collapse.",
      de: "Ein stolzer Südküsten-Club, der sich nach dem totalen finanziellen Kollaps neu aufbaut."
    },

    // Turkey
    "Galatasaray": {
      en: "The Lions of Istanbul, Turkey's most decorated European champions.",
      de: "Die Löwen aus Istanbul, der erfolgreichste Klub der Türkei auf europäischer Bühne."
    },
    "Galata SK": {
      en: "The Lions of Istanbul, Turkey's most decorated European champions.",
      de: "Die Löwen aus Istanbul, der erfolgreichste Klub der Türkei auf europäischer Bühne."
    },
    "Fenerbahçe": {
      en: "The Yellow Canaries of Kadıköy, backed by one of the fiercest fanbases in world football.",
      de: "Die Gelben Kanarienvögel aus Kadıköy, angetrieben von einer der heißesten Fanbasen weltweit."
    },
    "Kadıköy FK": {
      en: "The Yellow Canaries of Kadıköy, backed by one of the fiercest fanbases in world football.",
      de: "Die Gelben Kanarienvögel aus Kadıköy, angetrieben von einer der heißesten Fanbasen weltweit."
    },
    "Beşiktaş": {
      en: "The Black Eagles of the Bosphorus, famous for deafening stadium acoustics and passionate Ultras.",
      de: "Die Schwarzen Adler vom Bosporus, berühmt für die ohrenbetäubende Stadionatmosphäre."
    },
    "Boğaziçi Beşiktaş": {
      en: "The Black Eagles of the Bosphorus, famous for deafening stadium acoustics and passionate Ultras.",
      de: "Die Schwarzen Adler vom Bosporus, berühmt für die ohrenbetäubende Stadionatmosphäre."
    },
    "Trabzonspor": {
      en: "The Storm of the Black Sea, breaking the Istanbul monopoly with relentless grit.",
      de: "Der Sturm vom Schwarzen Meer, der das Monopol der Istanbuler Klubs brach."
    },
    "Karadeniz Trabzon": {
      en: "The Storm of the Black Sea, breaking the Istanbul monopoly with relentless grit.",
      de: "Der Sturm vom Schwarzen Meer, der das Monopol der Istanbuler Klubs brach."
    },
    "Bursaspor": {
      en: "The Green Crocodiles, historic former Süper Lig champions fighting to rise back through the divisions.",
      de: "Die Grünen Krokodile, ehemaliger Meister im heroischen Kampf um die Rückkehr in den Profifußball."
    },
    "Yeşil Bursa": {
      en: "The Green Crocodiles, historic former Süper Lig champions fighting to rise back through the divisions.",
      de: "Die Grünen Krokodile, ehemaliger Meister im heroischen Kampf um die Rückkehr in den Profifußball."
    },
    "Eskişehirspor": {
      en: "A legendary Anatolian giant with an iconic marching band and unconditional supporters.",
      de: "Ein legendärer anatolischer Riese mit treuen Fans und großer Tradition."
    },
    "Anadolu Eskişehir": {
      en: "A legendary Anatolian giant with an iconic marching band and unconditional supporters.",
      de: "Ein legendärer anatolischer Riese mit treuen Fans und großer Tradition."
    },
    "Kocaelispor": {
      en: "A traditional powerhouse from the Marmara region roaring with intense local pride.",
      de: "Ein traditionsreicher Großklub aus der Marmara-Region mit enormem Fan-Rückhalt."
    },
    "Körfez Kocaeli": {
      en: "A traditional powerhouse from the Marmara region roaring with intense local pride.",
      de: "Ein traditionsreicher Großklub aus der Marmara-Region mit enormem Fan-Rückhalt."
    },
    "Amed SK": {
      en: "A resilient club backed by passionate regional devotion and vibrant stadium crowds.",
      de: "Ein leidenschaftlicher Klub mit gewaltiger regionaler Identität."
    },
    "Diyar Amed": {
      en: "A resilient club backed by passionate regional devotion and vibrant stadium crowds.",
      de: "Ein leidenschaftlicher Klub mit gewaltiger regionaler Identität."
    },
    "Göztepe": {
      en: "The fiery jewel of İzmir, whose spectacular pyro displays and loyal fanbase are renowned across Europe.",
      de: "Das Herz von İzmir mit legendären Pyro-Shows und leidenschaftlicher Fankultur."
    },
    "İzmir Göztepe": {
      en: "The fiery jewel of İzmir, whose spectacular pyro displays and loyal fanbase are renowned across Europe.",
      de: "Das Herz von İzmir mit legendären Pyro-Shows und leidenschaftlicher Fankultur."
    },
    "Samsunspor": {
      en: "The Red Lightning from the north coast, playing in a fortress packed with passionate fans.",
      de: "Der Rote Blitz von der Schwarzmeerküste, getragen von enthusiastischen Fans."
    },
    "Samsun 19 Mayıs": {
      en: "The Red Lightning from the north coast, playing in a fortress packed with passionate fans.",
      de: "Der Rote Blitz von der Schwarzmeerküste, getragen von enthusiastischen Fans."
    }
  };

  for (const [key, val] of Object.entries(historyDb)) {
    if (clubName.includes(key) || key.includes(clubName)) {
      return val.en;
    }
  }

  // Fallbacks based on region/tier if no specific history exists
  if (country === 'GER') {
    if (tier === 1) return 'An established top-flight club competing on the biggest stage.';
    if (tier === 2) return 'An ambitious second division side dreaming of top-flight promotion.';
    if (tier === 3) return 'A hard-fought third-tier club with a strong local fanbase.';
    if (tier === 4) return 'A traditional regional club, deeply rooted in its local community.';
    return 'A regional club deeply embedded in the local football culture.';
  } else if (country === 'ENG') {
    if (tier === 1) return 'A Premier League club playing in the global spotlight.';
    if (tier === 2) return 'A gritty Championship club fighting for the richest prize in football.';
    if (tier === 3) return 'A proud League One club with deep roots in the local community.';
    if (tier === 4) return 'A League Two side living the dream of the English Football League.';
    return 'A traditional English non-league club.';
  } else if (country === 'TUR') {
    if (tier === 1) return 'A passionate Süper Lig club competing under immense fan pressure.';
    if (tier === 2) return 'A gritty 1. Lig club fighting for top-flight promotion.';
    return 'A proud TFF 2. Lig side deeply rooted in its local community.';
  }

  return 'A proud local club with ambitious goals.';
};

/**
 * Surgically corrects truncated and corrupted player names (e.g. "ngel Di Mara" -> "Angel Di Maria")
 * and standardizes international diacritics into clean Latin characters.
 */
export const sanitizePlayerName = (rawName?: string): string => {
  if (!rawName || typeof rawName !== 'string') return '';

  let name = rawName;

  const specificFixes: [RegExp, string][] = [
    [/\bÁngel\b/gu, 'Angel'],
    [/(?:^|(?<=\s))ngel\b/gu, 'Angel'],
    [/\bDi María\b/gu, 'Di Maria'],
    [/\bDi Mara\b/gu, 'Di Maria'],
    [/\bJulián\b/gu, 'Julian'],
    [/(?:^|(?<=\s))Julin\b/gu, 'Julian'],
    [/\bNicolás\b/gu, 'Nicolas'],
    [/(?:^|(?<=\s))Nicols\b/gu, 'Nicolas'],
    [/\bÁlvarez\b/gu, 'Alvarez'],
    [/(?:^|(?<=\s))lvarez\b/gu, 'Alvarez'],
    [/\bMartínez\b/gu, 'Martinez'],
    [/(?:^|(?<=\s))Martnez\b/gu, 'Martinez'],
    [/\bFernández\b/gu, 'Fernandez'],
    [/(?:^|(?<=\s))Fernndez\b/gu, 'Fernandez'],
    [/\bGarcía\b/gu, 'Garcia'],
    [/(?:^|(?<=\s))Garca\b/gu, 'Garcia'],
    [/\bRodríguez\b/gu, 'Rodriguez'],
    [/(?:^|(?<=\s))Rodrguez\b/gu, 'Rodriguez'],
    [/\bGonzález\b/gu, 'Gonzalez'],
    [/(?:^|(?<=\s))Gonzlez\b/gu, 'Gonzalez'],
    [/\bLópez\b/gu, 'Lopez'],
    [/(?:^|(?<=\s))Lpez\b/gu, 'Lopez'],
    [/\bSánchez\b/gu, 'Sanchez'],
    [/(?:^|(?<=\s))Snchez\b/gu, 'Sanchez'],
    [/\bPérez\b/gu, 'Perez'],
    [/(?:^|(?<=\s))Prez\b/gu, 'Perez'],
    [/\bGómez\b/gu, 'Gomez'],
    [/(?:^|(?<=\s))Gmez\b/gu, 'Gomez'],
    [/\bMartín\b/gu, 'Martin'],
    [/(?:^|(?<=\s))Martn\b/gu, 'Martin'],
    [/\bJiménez\b/gu, 'Jimenez'],
    [/(?:^|(?<=\s))Jimnez\b/gu, 'Jimenez'],
    [/\bHernández\b/gu, 'Hernandez'],
    [/(?:^|(?<=\s))Hernndez\b/gu, 'Hernandez'],
    [/\bDíaz\b/gu, 'Diaz'],
    [/(?:^|(?<=\s))Daz\b/gu, 'Diaz'],
    [/\bMoisés\b/gu, 'Moises'],
    [/(?:^|(?<=\s))Moiss\b/gu, 'Moises'],
    [/\bFélix\b/gu, 'Felix'],
    [/(?:^|(?<=\s))Flix\b/gu, 'Felix'],
    [/\bHincapié\b/gu, 'Hincapie'],
    [/(?:^|(?<=\s))Hincapi\b/gu, 'Hincapie'],
    [/\bEstupiñán\b/gu, 'Estupinan'],
    [/(?:^|(?<=\s))Estupin\b/gu, 'Estupinan'],
    [/\bPáez\b/gu, 'Paez'],
    [/(?:^|(?<=\s))Pez\b/gu, 'Paez'],
    [/\bMéndez\b/gu, 'Mendez'],
    [/(?:^|(?<=\s))Mndez\b/gu, 'Mendez'],
    [/\bAurélien\b/gu, 'Aurelien'],
    [/(?:^|(?<=\s))Aurlien\b/gu, 'Aurelien'],
    [/\bTchouaméni\b/gu, 'Tchouameni'],
    [/(?:^|(?<=\s))Tchouamni\b/gu, 'Tchouameni'],
    [/\bKonaté\b/gu, 'Konate'],
    [/(?:^|(?<=\s))Konat\b/gu, 'Konate'],
    [/\bKoundé\b/gu, 'Kounde'],
    [/(?:^|(?<=\s))Kound\b/gu, 'Kounde'],
    [/\bZaïre-Emery\b/gu, 'Zaire-Emery'],
    [/(?:^|(?<=\s))Zare-Emery\b/gu, 'Zaire-Emery'],
    [/\bVinícius\b/gu, 'Vinicius'],
    [/(?:^|(?<=\s))Vincius\b/gu, 'Vinicius'],
    [/\bJúnior\b/gu, 'Junior'],
    [/(?:^|(?<=\s))Jnior\b/gu, 'Junior'],
    [/\bMichał\b/gu, 'Michal'],
    [/(?:^|(?<=\s))Micha\b/gu, 'Michal'],
    [/\bZieliński\b/gu, 'Zielinski'],
    [/(?:^|(?<=\s))Zieliski\b/gu, 'Zielinski'],
    [/\bSzczęsny\b/gu, 'Szczesny'],
    [/(?:^|(?<=\s))Szczsny\b/gu, 'Szczesny'],
    [/\bWiśniewski\b/gu, 'Wisniewski'],
    [/(?:^|(?<=\s))Winiewski\b/gu, 'Wisniewski'],
    [/\bDąbrowski\b/gu, 'Dabrowski'],
    [/(?:^|(?<=\s))Dbrowski\b/gu, 'Dabrowski'],
    [/\bKamiński\b/gu, 'Kaminski'],
    [/(?:^|(?<=\s))Kamiski\b/gu, 'Kaminski'],
    [/\bSzymański\b/gu, 'Szymanski'],
    [/(?:^|(?<=\s))Szymaski\b/gu, 'Szymanski'],
    [/\bWójtowicz\b/gu, 'Wojtowicz'],
    [/(?:^|(?<=\s))Wjtowicz\b/gu, 'Wojtowicz'],
    [/\bKozłowski\b/gu, 'Kozlowski'],
    [/(?:^|(?<=\s))Kozowski\b/gu, 'Kozlowski'],
    [/\bWöber\b/gu, 'Woeber'],
    [/(?:^|(?<=\s))Wber\b/gu, 'Woeber'],
    [/\bSchär\b/gu, 'Schar'],
    [/(?:^|(?<=\s))Schr\b/gu, 'Schar'],
    [/\bSchäfer\b/gu, 'Schaefer'],
    [/(?:^|(?<=\s))Schfer\b/gu, 'Schaefer'],
    [/\bSchröder\b/gu, 'Schroeder'],
    [/(?:^|(?<=\s))Schrder\b/gu, 'Schroeder'],
    [/\bKrüger\b/gu, 'Krueger'],
    [/(?:^|(?<=\s))Krger\b/gu, 'Krueger'],
    [/\bKühne\b/gu, 'Kuehne'],
    [/(?:^|(?<=\s))Khne\b/gu, 'Kuehne'],
    [/\bRaúl\b/gu, 'Raul'],
    [/(?:^|(?<=\s))Ral\b/gu, 'Raul'],
    [/\bCésar\b/gu, 'Cesar'],
    [/(?:^|(?<=\s))Csar\b/gu, 'Cesar'],
    [/\bOrbelín\b/gu, 'Orbelin'],
    [/(?:^|(?<=\s))Orbeln\b/gu, 'Orbelin'],
    [/\bVásquez\b/gu, 'Vasquez'],
    [/(?:^|(?<=\s))Vsquez\b/gu, 'Vasquez'],
    [/\bQuiñones\b/gu, 'Quinones'],
    [/(?:^|(?<=\s))Quiones\b/gu, 'Quinones'],
    [/\bChávez\b/gu, 'Chavez'],
    [/(?:^|(?<=\s))Chvez\b/gu, 'Chavez'],
    [/\bIsmaël\b/gu, 'Ismael'],
    [/(?:^|(?<=\s))Ismal\b/gu, 'Ismael'],
    [/\bEustáquio\b/gu, 'Eustaquio'],
    [/(?:^|(?<=\s))Eustquio\b/gu, 'Eustaquio'],
    [/\bKoné\b/gu, 'Kone'],
    [/(?:^|(?<=\s))Kon\b/gu, 'Kone'],
    [/\bJoão\b/gu, 'Joao'],
    [/(?:^|(?<=\s))Joo\b/gu, 'Joao'],
    [/\bTomás\b/gu, 'Tomas'],
    [/(?:^|(?<=\s))Toms\b/gu, 'Tomas'],
    [/\bGonçalo\b/gu, 'Goncalo'],
    [/(?:^|(?<=\s))Gonalo\b/gu, 'Goncalo'],
    [/\bÁlvaro\b/gu, 'Alvaro'],
    [/(?:^|(?<=\s))lvaro\b/gu, 'Alvaro'],
    [/\bAdrián\b/gu, 'Adrian'],
    [/(?:^|(?<=\s))Adrin\b/gu, 'Adrian'],
    [/\bSantos Borré\b/gu, 'Santos Borre'],
    [/\bSantos Borr\b/gu, 'Santos Borre'],
    [/\bDurán\b/gu, 'Duran'],
    [/(?:^|(?<=\s))Durn\b/gu, 'Duran'],
    [/\bMüller\b/gu, 'Mueller'],
    [/(?:^|(?<=\s))Mller\b/gu, 'Mueller'],
    [/\bJörg\b/gu, 'Joerg'],
    [/(?:^|(?<=\s))Jrg\b/gu, 'Joerg'],
    [/\bJürgen\b/gu, 'Juergen'],
    [/(?:^|(?<=\s))Jrgen\b/gu, 'Juergen'],
    [/\bBäcker\b/gu, 'Baecker'],
    [/(?:^|(?<=\s))Bcker\b/gu, 'Baecker'],
    [/\bJäger\b/gu, 'Jaeger'],
    [/(?:^|(?<=\s))Jger\b/gu, 'Jaeger'],
  ];

  for (const [pattern, replacement] of specificFixes) {
    name = name.replace(pattern, replacement);
  }

  // Standard German umlaut transliteration into standard Latin (ae, oe, ue, ss)
  name = name
    .replace(/ä/g, 'ae')
    .replace(/Ä/g, 'Ae')
    .replace(/ö/g, 'oe')
    .replace(/Ö/g, 'Oe')
    .replace(/ü/g, 'ue')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss');

  // Normalize any remaining unicode diacritics and special characters into standard Latin
  name = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[øØ]/g, 'o')
    .replace(/[æÆ]/g, 'ae')
    .replace(/[œŒ]/g, 'oe')
    .replace(/[łŁ]/g, 'l');

  return name;
};

/**
 * Standardizes German umlauts and corrupted German strings across events and notifications
 * to standard ASCII transliterations (ae, oe, ue, ss).
 */
export const sanitizeGermanText = (rawText?: string): string => {
  if (!rawText || typeof rawText !== 'string') return '';
  let str = rawText;
  const germanFixes: [RegExp, string][] = [
    [/([a-zäöüß]*)Prfer\b/g, '$1Pruefer'],
    [/([a-zäöüß]*)prfer\b/g, '$1pruefer'],
    [/([a-zäöüß]*)Prf([a-zäöüß]*)\b/g, '$1Pruef$2'],
    [/([a-zäöüß]*)prf([a-zäöüß]*)\b/g, '$1pruef$2'],
    [/([a-zäöüß]*)Mngel([a-zäöüß]*)\b/g, '$1Maengel$2'],
    [/([a-zäöüß]*)mngel([a-zäöüß]*)\b/g, '$1maengel$2'],
    [/([a-zäöüß]*)Mngeln\b/g, '$1Maengeln'],
    [/([a-zäöüß]*)mngeln\b/g, '$1maengeln'],
    [/([a-zäöüß]*)Mngelt\b/g, '$1Maengelt'],
    [/([a-zäöüß]*)mngelt\b/g, '$1maengelt'],
    [/([a-zäöüß]*)Wrstchen\b/g, '$1Wuerstchen'],
    [/([a-zäöüß]*)wrstchen\b/g, '$1wuerstchen'],
    [/\bZhe\b/g, 'Zaehe'],
    [/\bzhe\b/g, 'zaehe'],
    [/\bMilliardr\b/gi, 'Milliardaer'],
    [/\berhltst\b/gi, 'erhaeltst'],
    [/\bhinterlsst\b/gi, 'hinterlaesst'],
    [/\bgelhmt\b/gi, 'gelaehmt'],
    [/\bNDERN\b/g, 'AENDERN'],
    [/\bberholt\b/gi, 'ueberholt'],
    [/\bgehrst\b/gi, 'gehoerst'],
    [/\bSchlieung\b/gi, 'Schliessung'],
    [/\bSchlieen\b/gi, 'Schliessen'],
    [/\bschlieen\b/gi, 'schliessen'],
    [/\bWeiterkmpfen\b/gi, 'Weiterkaempfen'],
    [/\bKapazitt\b/gi, 'Kapazitaet'],
    [/\baufrsten\b/gi, 'aufruesten'],
    [/\bErgnzungsspieler\b/gi, 'Ergaenzungsspieler'],
    [/\bHaupttribne\b/gi, 'Haupttribuene'],
    [/\bTribne\b/gi, 'Tribuene'],
    [/\bvorbergehend\b/gi, 'voruebergehend'],
    [/\bEiweishakes\b/gi, 'Eiweiss-Shakes'],
    [/\bEiwei\b/gi, 'Eiweiss'],
    [/\bzurckgestuft\b/gi, 'zurueckgestuft'],
    [/\bzurck\b/gi, 'zurueck'],
    [/\bVerhltnis\b/gi, 'Verhaeltnis'],
    [/\bbefrdert\b/gi, 'befoerdert'],
    [/\bnachgerckt\b/gi, 'nachgerueckt'],
    [/\bKhne\b/gi, 'Kuehne'],
    [/\bSchfer\b/gi, 'Schaefer'],
    [/\bSchrder\b/gi, 'Schroeder'],
    [/\bKrger\b/gi, 'Krueger'],
  ];
  for (const [pattern, replacement] of germanFixes) {
    str = str.replace(pattern, replacement);
  }
  str = str
    .replace(/ä/g, 'ae')
    .replace(/Ä/g, 'Ae')
    .replace(/ö/g, 'oe')
    .replace(/Ö/g, 'Oe')
    .replace(/ü/g, 'ue')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss');
  return str;
};

