import { getRegion } from './regionHelpers';
import { normalizeCountryCode } from '../data/gameConstants';

export interface BroadcastNetwork {
  id: string;
  name: string;
  shortName: string;
  tagline?: string;
  accentColor: string;
  textColor: string;
  badgeBg: string;
  borderColor: string;
  renderType:
    | 'sky'
    | 'sky_plus'
    | 'bbc'
    | 'itv'
    | 'rtl'
    | 'espn'
    | 'tsn'
    | 'onesoccer'
    | 'goal'
    | 'dazn'
    | 'tnt'
    | 'canal'
    | 'sporttv'
    | 'movistar'
    | 'rtve'
    | 'mediaset'
    | 'francetv'
    | 's4c'
    | 'orf'
    | 'bluesport'
    | 'srfsport'
    | 'tvp'
    | 'bein'
    | 'aspor'
    | 'viaplay'
    | 'tv2'
    | 'tv4'
    | 'svt'
    | 'appletv'
    | 'cbs'
    | 'tudn'
    | 'premiere'
    | 'sportv'
    | 'tyc'
    | 'winsports'
    | 'ecdf'
    | 'paramount'
    | 'indosiar'
    | 'jio'
    | 'sony'
    | 'coupang'
    | 'tigo'
    | 'l1max'
    | 'voyo'
    | 'maxsport'
    | 'cosmote'
    | 'ard'
    | 'zdf'
    | 'magenta'
    | 'mdr'
    | 'wdr'
    | 'br'
    | 'swr'
    | 'sport1'
    | 'sporttotal'
    | 'nationalleaguetv'
    | 'feftv'
    | 'ffftv'
    | 'now'
    | 'raisport'
    | 'telefe'
    | 'globo'
    | 'azteca'
    | 'custom_mod'
    | 'generic';
}

export const BROADCAST_NETWORKS: Record<string, BroadcastNetwork> = {
  // --- United Kingdom ---
  sky_sports: {
    id: 'sky_sports',
    name: 'Sky Sports',
    shortName: 'sky sports',
    tagline: 'PREMIER LEAGUE',
    accentColor: '#0072c6',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-900/80 via-sky-950/80 to-blue-900/80',
    borderColor: 'border-sky-500/40',
    renderType: 'sky',
  },
  sky_football: {
    id: 'sky_football',
    name: 'Sky Sports Football',
    shortName: 'sky sports',
    tagline: 'FOOTBALL',
    accentColor: '#0072c6',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-900/80 via-sky-950/80 to-blue-900/80',
    borderColor: 'border-sky-500/40',
    renderType: 'sky',
  },
  bbc_sport: {
    id: 'bbc_sport',
    name: 'BBC Sport',
    shortName: 'BBC SPORT',
    tagline: 'FA CUP',
    accentColor: '#ffd230',
    textColor: '#ffffff',
    badgeBg: 'bg-black/80',
    borderColor: 'border-yellow-400/40',
    renderType: 'bbc',
  },
  bbc_world: {
    id: 'bbc_world',
    name: 'BBC Sport',
    shortName: 'BBC SPORT',
    tagline: 'WORLD CUP',
    accentColor: '#ffd230',
    textColor: '#ffffff',
    badgeBg: 'bg-black/90',
    borderColor: 'border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]',
    renderType: 'bbc',
  },
  itv_sport: {
    id: 'itv_sport',
    name: 'ITV Sport',
    shortName: 'itv SPORT',
    tagline: 'LIVE',
    accentColor: '#00a3e0',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-teal-950/80 via-cyan-950/80 to-blue-950/80',
    borderColor: 'border-cyan-400/40',
    renderType: 'itv',
  },
  tnt_sports: {
    id: 'tnt_sports',
    name: 'TNT Sports',
    shortName: 'TNT SPORTS',
    tagline: 'CHAMPIONS LEAGUE',
    accentColor: '#e00067',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-purple-950/80 via-pink-950/80 to-purple-950/80',
    borderColor: 'border-pink-500/40',
    renderType: 'tnt',
  },
  sky_sports_plus: {
    id: 'sky_sports_plus',
    name: 'Sky Sports+',
    shortName: 'sky sports+',
    tagline: 'EFL LIVE',
    accentColor: '#0072c6',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-sky-950/90 to-blue-950/90',
    borderColor: 'border-sky-400/50',
    renderType: 'sky_plus',
  },
  national_league_tv: {
    id: 'national_league_tv',
    name: 'National League TV',
    shortName: 'NLTV',
    tagline: 'NATIONAL LEAGUE',
    accentColor: '#f59e0b',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-amber-950/90 via-zinc-900/90 to-amber-950/90',
    borderColor: 'border-amber-400/40',
    renderType: 'nationalleaguetv',
  },

  // --- Germany / Austria / Switzerland ---
  ard_sportschau: {
    id: 'ard_sportschau',
    name: 'ARD Das Erste',
    shortName: 'ARD Sportschau',
    tagline: 'DFB-POKAL LIVE',
    accentColor: '#001a4b',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-[#001a4b] via-[#00266e] to-[#001a4b]',
    borderColor: 'border-cyan-400/40',
    renderType: 'ard',
  },
  zdf_sportstudio: {
    id: 'zdf_sportstudio',
    name: 'ZDF sportstudio',
    shortName: 'ZDF sportstudio',
    tagline: 'DFB-POKAL LIVE',
    accentColor: '#fa7d00',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-zinc-950 via-[#262626] to-zinc-950',
    borderColor: 'border-orange-500/40',
    renderType: 'zdf',
  },
  magenta_sport: {
    id: 'magenta_sport',
    name: 'MagentaSport',
    shortName: 'MAGENTA SPORT',
    tagline: '3. LIGA LIVE',
    accentColor: '#e20074',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-[#e20074]/90 via-[#99004f]/90 to-[#e20074]/90',
    borderColor: 'border-pink-400/50',
    renderType: 'magenta',
  },
  mdr_sport: {
    id: 'mdr_sport',
    name: 'MDR Sport im Osten',
    shortName: 'MDR Sport',
    tagline: 'REGIONALLIGA',
    accentColor: '#004b87',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'mdr',
  },
  wdr_sport: {
    id: 'wdr_sport',
    name: 'WDR Sport im Westen',
    shortName: 'WDR Sport',
    tagline: 'REGIONALLIGA',
    accentColor: '#003366',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-slate-950/90 via-blue-950/80 to-slate-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'wdr',
  },
  sport1: {
    id: 'sport1',
    name: 'Sport1',
    shortName: 'SPORT1',
    tagline: 'REGIONALLIGA LIVE',
    accentColor: '#f59e0b',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-zinc-950/90 via-zinc-900/90 to-zinc-950/90',
    borderColor: 'border-amber-400/40',
    renderType: 'sport1',
  },
  sporttotal: {
    id: 'sporttotal',
    name: 'Sporttotal.tv',
    shortName: 'sporttotal.tv',
    tagline: 'AMATEURFUSSBALL',
    accentColor: '#10b981',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-zinc-900/90 to-emerald-950/90',
    borderColor: 'border-emerald-400/40',
    renderType: 'sporttotal',
  },
  mdr_landespokal: {
    id: 'mdr_landespokal',
    name: 'MDR Sport im Osten',
    shortName: 'MDR Sport',
    tagline: 'LANDESPOKAL',
    accentColor: '#004b87',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'mdr',
  },
  wdr_landespokal: {
    id: 'wdr_landespokal',
    name: 'WDR Sport im Westen',
    shortName: 'WDR Sport',
    tagline: 'LANDESPOKAL',
    accentColor: '#003366',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-slate-950/90 via-blue-950/80 to-slate-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'wdr',
  },
  br_landespokal: {
    id: 'br_landespokal',
    name: 'BR Sport',
    shortName: 'BR Sport',
    tagline: 'LANDESPOKAL',
    accentColor: '#0066b3',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-cyan-950/80 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'br',
  },
  swr_landespokal: {
    id: 'swr_landespokal',
    name: 'SWR Sport',
    shortName: 'SWR Sport',
    tagline: 'LANDESPOKAL',
    accentColor: '#003b6f',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-slate-950/90 via-blue-950/80 to-slate-950/90',
    borderColor: 'border-blue-400/40',
    renderType: 'swr',
  },
  sport1_landespokal: {
    id: 'sport1_landespokal',
    name: 'Sport1',
    shortName: 'SPORT1',
    tagline: 'POKAL LIVE',
    accentColor: '#f59e0b',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-zinc-950/90 via-zinc-900/90 to-zinc-950/90',
    borderColor: 'border-amber-400/40',
    renderType: 'sport1',
  },
  sporttotal_landespokal: {
    id: 'sporttotal_landespokal',
    name: 'Sporttotal.tv',
    shortName: 'sporttotal.tv',
    tagline: 'LANDESPOKAL',
    accentColor: '#10b981',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-zinc-900/90 to-emerald-950/90',
    borderColor: 'border-emerald-400/40',
    renderType: 'sporttotal',
  },
  sky_sport: {
    id: 'sky_sport',
    name: 'Sky Sport',
    shortName: 'sky sport',
    tagline: 'TOP EVENT',
    accentColor: '#e50000',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/80 via-zinc-900/80 to-red-950/80',
    borderColor: 'border-red-500/40',
    renderType: 'sky',
  },
  sky_bundesliga: {
    id: 'sky_sport',
    name: 'Sky Sport',
    shortName: 'sky sport',
    tagline: 'TOP EVENT',
    accentColor: '#e50000',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/80 via-zinc-900/80 to-red-950/80',
    borderColor: 'border-red-500/40',
    renderType: 'sky',
  },
  rtl: {
    id: 'rtl',
    name: 'RTL',
    shortName: 'RTL',
    tagline: 'EUROPAPOKAL',
    accentColor: '#e30613',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-zinc-950/90 via-zinc-900/90 to-zinc-950/90',
    borderColor: 'border-amber-500/40',
    renderType: 'rtl',
  },
  dazn: {
    id: 'dazn',
    name: 'DAZN',
    shortName: 'DAZN',
    tagline: 'LIVE',
    accentColor: '#f7ff14',
    textColor: '#000000',
    badgeBg: 'bg-zinc-950/90',
    borderColor: 'border-yellow-400/30',
    renderType: 'dazn',
  },
  sky_austria: {
    id: 'sky_austria',
    name: 'Sky Sport Austria',
    shortName: 'sky sport',
    tagline: 'TOP EVENT',
    accentColor: '#e50000',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/80 via-zinc-900/80 to-red-950/80',
    borderColor: 'border-red-500/40',
    renderType: 'sky',
  },
  orf_sport: {
    id: 'orf_sport',
    name: 'ORF Sport+',
    shortName: 'ORF SPORT+',
    tagline: 'ÖFB-CUP',
    accentColor: '#e2001a',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-zinc-950/90 via-red-950/70 to-zinc-950/90',
    borderColor: 'border-red-600/40',
    renderType: 'orf',
  },
  blue_sport: {
    id: 'blue_sport',
    name: 'blue Sport',
    shortName: 'blue SPORT',
    tagline: 'SUPER LEAGUE',
    accentColor: '#00d2ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-cyan-950/80',
    borderColor: 'border-cyan-400/40',
    renderType: 'bluesport',
  },
  srf_sport: {
    id: 'srf_sport',
    name: 'SRF Sport',
    shortName: 'SRF SPORT',
    tagline: 'SCHWEIZER CUP',
    accentColor: '#da291c',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-zinc-950/90 via-red-950/70 to-zinc-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'srfsport',
  },

  // --- Spain ---
  movistar: {
    id: 'movistar',
    name: 'Movistar+ LaLiga',
    shortName: 'M+ LALIGA',
    tagline: 'LALIGA',
    accentColor: '#00a9e0',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-sky-950/90 via-blue-950/90 to-sky-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'movistar',
  },
  movistar_copa: {
    id: 'movistar_copa',
    name: 'Movistar+ Copa del Rey',
    shortName: 'M+ COPA DEL REY',
    tagline: 'COPA DEL REY',
    accentColor: '#00a9e0',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-sky-950/90 via-blue-950/90 to-amber-950/60',
    borderColor: 'border-amber-400/40',
    renderType: 'movistar',
  },
  fef_tv: {
    id: 'fef_tv',
    name: 'FEF TV',
    shortName: 'FEF TV',
    tagline: 'PRIMERA FEDERACIÓN',
    accentColor: '#dc2626',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-amber-950/80',
    borderColor: 'border-amber-400/40',
    renderType: 'feftv',
  },
  rtve: {
    id: 'rtve',
    name: 'RTVE Play',
    shortName: 'rtve',
    tagline: 'COPA DEL REY',
    accentColor: '#ff6600',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-orange-950/80 via-amber-950/70 to-zinc-950/80',
    borderColor: 'border-orange-500/40',
    renderType: 'rtve',
  },

  // --- Italy ---
  mediaset: {
    id: 'mediaset',
    name: 'Mediaset',
    shortName: 'MEDIASET',
    tagline: 'COPPA ITALIA',
    accentColor: '#0083ca',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-sky-950/80 to-blue-950/90',
    borderColor: 'border-blue-400/40',
    renderType: 'mediaset',
  },
  rai_sport: {
    id: 'rai_sport',
    name: 'Rai Sport',
    shortName: 'Rai Sport',
    tagline: 'COPPA ITALIA',
    accentColor: '#0284c7',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-sky-950/80 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'raisport',
  },
  now_serie_c: {
    id: 'now_serie_c',
    name: 'NOW / Sky Sport Serie C',
    shortName: 'NOW',
    tagline: 'SERIE C NOW',
    accentColor: '#00d287',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-emerald-950/90',
    borderColor: 'border-emerald-400/40',
    renderType: 'now',
  },

  // --- France ---
  canal_plus: {
    id: 'canal_plus',
    name: 'CANAL+ Foot',
    shortName: 'CANAL+',
    tagline: 'LIGUE 1',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    badgeBg: 'bg-zinc-950/90',
    borderColor: 'border-white/20',
    renderType: 'canal',
  },
  france_tv: {
    id: 'france_tv',
    name: 'France TV Sport',
    shortName: 'france.tv',
    tagline: 'COUPE DE FRANCE',
    accentColor: '#0055a5',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/80 to-red-950/90',
    borderColor: 'border-blue-400/40',
    renderType: 'francetv',
  },
  bein_france: {
    id: 'bein_france',
    name: 'beIN SPORTS France',
    shortName: 'beIN SPORTS',
    tagline: 'COUPE DE FRANCE',
    accentColor: '#8b5cf6',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-purple-950/90 via-zinc-900/90 to-purple-950/90',
    borderColor: 'border-purple-400/40',
    renderType: 'bein',
  },
  ffftv: {
    id: 'ffftv',
    name: 'FFFtv',
    shortName: 'FFFtv',
    tagline: 'CHAMPIONNAT NATIONAL',
    accentColor: '#2563eb',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-blue-400/40',
    renderType: 'ffftv',
  },

  // --- Portugal ---
  sport_tv: {
    id: 'sport_tv',
    name: 'Sport TV',
    shortName: 'SPORT TV',
    tagline: 'LIGA PORTUGAL',
    accentColor: '#009944',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-zinc-900/90 to-emerald-950/90',
    borderColor: 'border-emerald-400/40',
    renderType: 'sporttv',
  },

  // --- Wales ---
  s4c: {
    id: 's4c',
    name: 'S4C Sgorio',
    shortName: 'S4C SGORIO',
    tagline: 'CYMRU PREMIER',
    accentColor: '#e30613',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-red-950/90',
    borderColor: 'border-red-500/40',
    renderType: 's4c',
  },

  // --- Poland ---
  tvp_sport: {
    id: 'tvp_sport',
    name: 'TVP Sport',
    shortName: 'TVP SPORT',
    tagline: 'EKSTRAKLASA',
    accentColor: '#0055ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-red-950/90',
    borderColor: 'border-blue-500/40',
    renderType: 'tvp',
  },

  // --- Turkey ---
  bein_turkey: {
    id: 'bein_turkey',
    name: 'beIN Sports',
    shortName: 'beIN SPORTS',
    tagline: 'SÜPER LIG',
    accentColor: '#6c2d82',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-purple-950/90 via-zinc-900/90 to-purple-950/90',
    borderColor: 'border-purple-400/40',
    renderType: 'bein',
  },
  aspor: {
    id: 'aspor',
    name: 'A Spor',
    shortName: 'A SPOR',
    tagline: 'TÜRKİYE KUPASI',
    accentColor: '#e30613',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-red-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'aspor',
  },

  // --- Denmark ---
  viaplay: {
    id: 'viaplay',
    name: 'Viaplay Sport',
    shortName: 'viaplay',
    tagline: '3F SUPERLIGA',
    accentColor: '#d6006e',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-pink-950/90 via-zinc-900/90 to-pink-950/90',
    borderColor: 'border-pink-500/40',
    renderType: 'viaplay',
  },
  viaplay_den_t1: {
    id: 'viaplay_den_t1',
    name: 'Viaplay Sport',
    shortName: 'viaplay',
    tagline: '3F SUPERLIGA',
    accentColor: '#d6006e',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-pink-950/90 via-zinc-900/90 to-pink-950/90',
    borderColor: 'border-pink-500/40',
    renderType: 'viaplay',
  },
  viaplay_den_t2: {
    id: 'viaplay_den_t2',
    name: 'Viaplay Sport',
    shortName: 'viaplay',
    tagline: 'NORDICBET LIGA',
    accentColor: '#d6006e',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-pink-950/90 via-blue-950/80 to-pink-950/90',
    borderColor: 'border-pink-500/40',
    renderType: 'viaplay',
  },
  viaplay_den_cup: {
    id: 'viaplay_den_cup',
    name: 'Viaplay Sport',
    shortName: 'viaplay',
    tagline: 'ODDSET POKALEN',
    accentColor: '#d6006e',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-red-950/90',
    borderColor: 'border-red-400/40',
    renderType: 'viaplay',
  },

  // --- Norway ---
  tv2_norway: {
    id: 'tv2_norway',
    name: 'TV 2 Sport',
    shortName: 'TV 2 SPORT',
    tagline: 'ELITESERIEN',
    accentColor: '#0072c6',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'tv2',
  },
  tv2_nor_t1: {
    id: 'tv2_nor_t1',
    name: 'TV 2 Sport',
    shortName: 'TV 2 SPORT',
    tagline: 'ELITESERIEN',
    accentColor: '#0072c6',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'tv2',
  },
  tv2_nor_t2: {
    id: 'tv2_nor_t2',
    name: 'TV 2 Sport',
    shortName: 'TV 2 SPORT',
    tagline: 'OBOS-LIGAEN',
    accentColor: '#0072c6',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-emerald-950/70 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'tv2',
  },
  tv2_nor_cup: {
    id: 'tv2_nor_cup',
    name: 'TV 2 Sport',
    shortName: 'TV 2 SPORT',
    tagline: 'NM CUPEN',
    accentColor: '#0072c6',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-red-950/70 to-blue-950/90',
    borderColor: 'border-red-400/40',
    renderType: 'tv2',
  },

  // --- Sweden ---
  tv4_sweden: {
    id: 'tv4_sweden',
    name: 'TV4 Play',
    shortName: 'TV4 SPORT',
    tagline: 'ALLSVENSKAN',
    accentColor: '#e30613',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-red-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'tv4',
  },
  tv4_swe_t1: {
    id: 'tv4_swe_t1',
    name: 'TV4 Play',
    shortName: 'TV4 SPORT',
    tagline: 'ALLSVENSKAN',
    accentColor: '#e30613',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-red-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'tv4',
  },
  tv4_swe_t2: {
    id: 'tv4_swe_t2',
    name: 'TV4 Play',
    shortName: 'TV4 SPORT',
    tagline: 'SUPERETTAN',
    accentColor: '#e30613',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-zinc-950/90 via-red-950/80 to-zinc-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'tv4',
  },
  svt_sport: {
    id: 'svt_sport',
    name: 'SVT Sport',
    shortName: 'SVT SPORT',
    tagline: 'SVENSKA CUPEN',
    accentColor: '#0084ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-yellow-950/60 to-blue-950/90',
    borderColor: 'border-blue-400/40',
    renderType: 'svt',
  },

  // --- United States ---
  apple_tv: {
    id: 'apple_tv',
    name: 'Apple TV',
    shortName: ' tv MLS',
    tagline: 'SEASON PASS',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    badgeBg: 'bg-zinc-950/95',
    borderColor: 'border-white/20',
    renderType: 'appletv',
  },
  apple_tv_leagues_cup: {
    id: 'apple_tv_leagues_cup',
    name: 'Apple TV',
    shortName: ' tv',
    tagline: 'LEAGUES CUP',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    badgeBg: 'bg-zinc-950/95',
    borderColor: 'border-white/20',
    renderType: 'appletv',
  },
  cbs_usl: {
    id: 'cbs_usl',
    name: 'CBS Sports',
    shortName: 'CBS GOLAZO',
    tagline: 'ALL OF USL',
    accentColor: '#0033a0',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-blue-500/40',
    renderType: 'cbs',
  },
  cbs_golazo: {
    id: 'cbs_golazo',
    name: 'CBS Sports Golazo',
    shortName: 'CBS GOLAZO',
    tagline: 'U.S. OPEN CUP',
    accentColor: '#0033a0',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-blue-500/40',
    renderType: 'cbs',
  },
  cbs_continental: {
    id: 'cbs_continental',
    name: 'CBS Sports Golazo',
    shortName: 'CBS GOLAZO',
    tagline: 'CHAMPIONS CUP',
    accentColor: '#0033a0',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-blue-500/40',
    renderType: 'cbs',
  },

  // --- Canada ---
  onesoccer: {
    id: 'onesoccer',
    name: 'OneSoccer',
    shortName: 'OneSoccer',
    tagline: 'VOYAGEURS CUP',
    accentColor: '#00b4d8',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-sky-950/90 via-zinc-900/90 to-sky-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'onesoccer',
  },
  tsn: {
    id: 'tsn',
    name: 'TSN',
    shortName: 'TSN',
    tagline: 'MATCHDAY',
    accentColor: '#e31b23',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-zinc-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'tsn',
  },
  tsn_can_cup: {
    id: 'tsn_can_cup',
    name: 'TSN',
    shortName: 'TSN',
    tagline: 'VOYAGEURS CUP',
    accentColor: '#e31b23',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-zinc-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'tsn',
  },

  // --- Mexico ---
  tudn: {
    id: 'tudn',
    name: 'TUDN',
    shortName: 'TUDN',
    tagline: 'LIGA MX',
    accentColor: '#00a859',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-zinc-900/90 to-emerald-950/90',
    borderColor: 'border-emerald-400/40',
    renderType: 'tudn',
  },
  azteca_deportes: {
    id: 'azteca_deportes',
    name: 'Azteca Deportes',
    shortName: 'AZTECA 7',
    tagline: 'COPA MX',
    accentColor: '#22c55e',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-zinc-900/90 to-red-950/70',
    borderColor: 'border-emerald-400/40',
    renderType: 'azteca',
  },

  // --- Brazil ---
  premiere: {
    id: 'premiere',
    name: 'Premiere',
    shortName: 'PREMIERE',
    tagline: 'BRASILEIRÃO',
    accentColor: '#009944',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-zinc-900/90 to-emerald-950/90',
    borderColor: 'border-emerald-500/40',
    renderType: 'premiere',
  },
  sportv: {
    id: 'sportv',
    name: 'SporTV',
    shortName: 'SporTV',
    tagline: 'COPA DO BRASIL',
    accentColor: '#0072c6',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-blue-500/40',
    renderType: 'sportv',
  },
  globo: {
    id: 'globo',
    name: 'TV Globo',
    shortName: 'TV GLOBO',
    tagline: 'COPA DO BRASIL',
    accentColor: '#f97316',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-orange-950/90 via-zinc-900/90 to-orange-950/90',
    borderColor: 'border-orange-400/40',
    renderType: 'globo',
  },

  // --- Argentina ---
  espn_premium: {
    id: 'espn_premium',
    name: 'ESPN Premium',
    shortName: 'ESPN PREMIUM',
    tagline: 'LIGA ARGENTINA',
    accentColor: '#cc0000',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-red-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'espn',
  },
  tyc_sports: {
    id: 'tyc_sports',
    name: 'TyC Sports',
    shortName: 'TyC SPORTS',
    tagline: 'COPA ARGENTINA',
    accentColor: '#0055ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'tyc',
  },
  telefe: {
    id: 'telefe',
    name: 'Telefe',
    shortName: 'telefe',
    tagline: 'COPA ARGENTINA',
    accentColor: '#0ea5e9',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-sky-950/90 via-blue-950/90 to-zinc-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'telefe',
  },

  // --- Colombia ---
  win_sports: {
    id: 'win_sports',
    name: 'Win Sports+',
    shortName: 'Win SPORTS+',
    tagline: 'LIGA BETPLAY',
    accentColor: '#ff6600',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-orange-950/90 via-zinc-900/90 to-orange-950/90',
    borderColor: 'border-orange-500/40',
    renderType: 'winsports',
  },

  // --- Ecuador ---
  ecdf: {
    id: 'ecdf',
    name: 'El Canal del Fútbol',
    shortName: 'ECDF',
    tagline: 'COPA ECUADOR',
    accentColor: '#0055ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-yellow-950/70 to-red-950/80',
    borderColor: 'border-yellow-400/40',
    renderType: 'ecdf',
  },

  // --- South America Continental ---
  espn_libertadores: {
    id: 'espn_libertadores',
    name: 'ESPN',
    shortName: 'ESPN',
    tagline: 'LIBERTADORES',
    accentColor: '#cc0000',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-black/80 to-amber-950/90',
    borderColor: 'border-amber-500/40',
    renderType: 'espn',
  },
  espn_world: {
    id: 'espn_world',
    name: 'ESPN',
    shortName: 'ESPN',
    tagline: 'WORLD CUP',
    accentColor: '#cc0000',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/95 via-black/90 to-red-950/95',
    borderColor: 'border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
    renderType: 'espn',
  },

  // --- Australia ---
  paramount_au: {
    id: 'paramount_au',
    name: 'Paramount+',
    shortName: 'Paramount+',
    tagline: 'A-LEAGUE',
    accentColor: '#0064ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-blue-400/40',
    renderType: 'paramount',
  },

  // --- Indonesia ---
  indosiar: {
    id: 'indosiar',
    name: 'Indosiar',
    shortName: 'INDOSIAR',
    tagline: 'BRI LIGA 1',
    accentColor: '#0099ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-emerald-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'indosiar',
  },
  indosiar_liga1: {
    id: 'indosiar_liga1',
    name: 'Indosiar',
    shortName: 'INDOSIAR',
    tagline: 'BRI LIGA 1',
    accentColor: '#0099ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-emerald-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'indosiar',
  },
  indosiar_cup: {
    id: 'indosiar_cup',
    name: 'Indosiar',
    shortName: 'INDOSIAR',
    tagline: 'PIALA INDONESIA',
    accentColor: '#ef4444',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-blue-950/80 to-red-950/90',
    borderColor: 'border-red-400/40',
    renderType: 'indosiar',
  },

  // --- India ---
  jio_cinema: {
    id: 'jio_cinema',
    name: 'JioCinema',
    shortName: 'JioCinema',
    tagline: 'INDIAN SUPER LEAGUE',
    accentColor: '#e11d48',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-pink-950/90 via-purple-950/90 to-zinc-950/90',
    borderColor: 'border-pink-500/40',
    renderType: 'jio',
  },
  jio_cinema_isl: {
    id: 'jio_cinema_isl',
    name: 'JioCinema',
    shortName: 'JioCinema',
    tagline: 'INDIAN SUPER LEAGUE',
    accentColor: '#e11d48',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-pink-950/90 via-purple-950/90 to-zinc-950/90',
    borderColor: 'border-pink-500/40',
    renderType: 'jio',
  },
  sony_sports: {
    id: 'sony_sports',
    name: 'Sony Sports Network',
    shortName: 'SONY SPORTS',
    tagline: 'I-LEAGUE',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-zinc-950/95 via-stone-900/90 to-zinc-950/95',
    borderColor: 'border-white/20',
    renderType: 'sony',
  },
  sony_super_cup: {
    id: 'sony_super_cup',
    name: 'Sony Sports Network',
    shortName: 'SONY SPORTS',
    tagline: 'AIFF SUPER CUP',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/95 via-stone-900/90 to-blue-950/95',
    borderColor: 'border-sky-400/40',
    renderType: 'sony',
  },

  // --- South Korea ---
  coupang_play_k1: {
    id: 'coupang_play_k1',
    name: 'Coupang Play',
    shortName: 'Coupang Play',
    tagline: 'K LEAGUE 1',
    accentColor: '#00a4e4',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-sky-950/80 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'coupang',
  },
  coupang_play_k2: {
    id: 'coupang_play_k2',
    name: 'Coupang Play',
    shortName: 'Coupang Play',
    tagline: 'K LEAGUE 2',
    accentColor: '#00a4e4',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-sky-950/80 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'coupang',
  },
  coupang_play_cup: {
    id: 'coupang_play_cup',
    name: 'Coupang Play',
    shortName: 'Coupang Play',
    tagline: 'KOREA CUP',
    accentColor: '#dc2626',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-red-950/90',
    borderColor: 'border-red-400/40',
    renderType: 'coupang',
  },

  // --- Bolivia ---
  tigo_sports_bol: {
    id: 'tigo_sports_bol',
    name: 'Tigo Sports Bolivia',
    shortName: 'Tigo Sports',
    tagline: 'DIVISIÓN PROFESIONAL',
    accentColor: '#0084ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-yellow-950/60 to-blue-950/90',
    borderColor: 'border-blue-400/40',
    renderType: 'tigo',
  },
  tigo_sports_bol_cup: {
    id: 'tigo_sports_bol_cup',
    name: 'Tigo Sports Bolivia',
    shortName: 'Tigo Sports',
    tagline: 'COPA BOLIVIA',
    accentColor: '#0084ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-blue-950/80 to-emerald-950/90',
    borderColor: 'border-emerald-400/40',
    renderType: 'tigo',
  },

  // --- Peru ---
  l1_max_per: {
    id: 'l1_max_per',
    name: 'L1 MAX',
    shortName: 'L1 MAX',
    tagline: 'LIGA 1 TE APUESTO',
    accentColor: '#c1272d',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-amber-950/60 to-red-950/90',
    borderColor: 'border-amber-400/40',
    renderType: 'l1max',
  },
  l1_max_per_t2: {
    id: 'l1_max_per_t2',
    name: 'L1 MAX',
    shortName: 'L1 MAX',
    tagline: 'LIGA 2 PERÚ',
    accentColor: '#c1272d',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-red-950/90',
    borderColor: 'border-red-400/40',
    renderType: 'l1max',
  },
  l1_max_cup: {
    id: 'l1_max_cup',
    name: 'L1 MAX',
    shortName: 'L1 MAX',
    tagline: 'COPA BICENTENARIO',
    accentColor: '#c1272d',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-amber-950/80',
    borderColor: 'border-amber-400/40',
    renderType: 'l1max',
  },

  // --- Paraguay ---
  tigo_sports_par: {
    id: 'tigo_sports_par',
    name: 'Tigo Sports Paraguay',
    shortName: 'Tigo Sports',
    tagline: 'COPA DE PRIMERA',
    accentColor: '#0084ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'tigo',
  },
  tigo_sports_par_cup: {
    id: 'tigo_sports_par_cup',
    name: 'Tigo Sports Paraguay',
    shortName: 'Tigo Sports',
    tagline: 'COPA PARAGUAY',
    accentColor: '#0084ff',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-red-950/60 to-blue-950/90',
    borderColor: 'border-red-400/40',
    renderType: 'tigo',
  },

  // --- Chile ---
  tnt_sports_chi: {
    id: 'tnt_sports_chi',
    name: 'TNT Sports Chile',
    shortName: 'TNT SPORTS',
    tagline: 'CAMPEONATO PRIMERA',
    accentColor: '#ef4444',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-red-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'tnt',
  },
  tnt_sports_chi_t2: {
    id: 'tnt_sports_chi_t2',
    name: 'TNT Sports Chile',
    shortName: 'TNT SPORTS',
    tagline: 'PRIMERA B CHILE',
    accentColor: '#ef4444',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-zinc-950/90 via-zinc-900/90 to-zinc-950/90',
    borderColor: 'border-red-500/40',
    renderType: 'tnt',
  },
  tnt_sports_chi_cup: {
    id: 'tnt_sports_chi_cup',
    name: 'TNT Sports Chile',
    shortName: 'TNT SPORTS',
    tagline: 'COPA CHILE',
    accentColor: '#ef4444',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-red-950/90 via-blue-950/60 to-red-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'tnt',
  },

  // --- Slovakia ---
  voyo_svk: {
    id: 'voyo_svk',
    name: 'Voyo Sport',
    shortName: 'VOYO',
    tagline: 'NIKÉ LIGA',
    accentColor: '#0284c7',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-sky-950/80 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'voyo',
  },
  voyo_svk_t2: {
    id: 'voyo_svk_t2',
    name: 'Voyo Sport',
    shortName: 'VOYO',
    tagline: '2. LIGA SLOVENSKO',
    accentColor: '#0284c7',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-zinc-900/90 to-blue-950/90',
    borderColor: 'border-blue-400/40',
    renderType: 'voyo',
  },
  rtvs_sport_svk: {
    id: 'rtvs_sport_svk',
    name: 'RTVS Šport',
    shortName: 'RTVS ŠPORT',
    tagline: 'SLOVNAFT CUP',
    accentColor: '#2563eb',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-red-950/60 to-blue-950/90',
    borderColor: 'border-blue-500/40',
    renderType: 'voyo',
  },

  // --- Croatia ---
  maxsport_cro: {
    id: 'maxsport_cro',
    name: 'MAXSport',
    shortName: 'MAXSport',
    tagline: 'SUPERSPORT HNL',
    accentColor: '#e11d48',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-rose-950/90 via-slate-900/90 to-rose-950/90',
    borderColor: 'border-rose-500/40',
    renderType: 'maxsport',
  },
  maxsport_cro_t2: {
    id: 'maxsport_cro_t2',
    name: 'MAXSport',
    shortName: 'MAXSport',
    tagline: 'PRVA NL',
    accentColor: '#e11d48',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-slate-950/90 via-zinc-900/90 to-slate-950/90',
    borderColor: 'border-slate-500/40',
    renderType: 'maxsport',
  },
  maxsport_cro_cup: {
    id: 'maxsport_cro_cup',
    name: 'MAXSport',
    shortName: 'MAXSport',
    tagline: 'HRVATSKI KUP',
    accentColor: '#e11d48',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-rose-950/90 via-blue-950/60 to-rose-950/90',
    borderColor: 'border-blue-400/40',
    renderType: 'maxsport',
  },

  // --- Greece ---
  cosmote_sport_gre: {
    id: 'cosmote_sport_gre',
    name: 'Cosmote Sport',
    shortName: 'COSMOTE SPORT',
    tagline: 'SUPER LEAGUE 1',
    accentColor: '#10b981',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-sky-950/70 to-emerald-950/90',
    borderColor: 'border-emerald-400/40',
    renderType: 'cosmote',
  },
  cosmote_sport_gre_t2: {
    id: 'cosmote_sport_gre_t2',
    name: 'Cosmote Sport',
    shortName: 'COSMOTE SPORT',
    tagline: 'SUPER LEAGUE 2',
    accentColor: '#10b981',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-zinc-900/90 to-emerald-950/90',
    borderColor: 'border-emerald-500/40',
    renderType: 'cosmote',
  },
  cosmote_sport_cup: {
    id: 'cosmote_sport_cup',
    name: 'Cosmote Sport',
    shortName: 'COSMOTE SPORT',
    tagline: 'KYPELLO ELLADAS',
    accentColor: '#10b981',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-blue-950/90 via-emerald-950/80 to-blue-950/90',
    borderColor: 'border-sky-400/40',
    renderType: 'cosmote',
  },

  // --- Generic / Grassroots ---
  goal_tv: {
    id: 'goal_tv',
    name: 'GOAL.tv',
    shortName: 'GOAL.tv',
    tagline: 'GRASSROOTS',
    accentColor: '#10b981',
    textColor: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-emerald-950/80 via-zinc-900/80 to-emerald-950/80',
    borderColor: 'border-emerald-400/40',
    renderType: 'goal',
  },
};

export const KNOWN_BASE_COUNTRIES = [
  'GER', 'ENG', 'SCO', 'WAL', 'ESP', 'ITA', 'FRA', 'POR', 'AUT', 'SUI',
  'POL', 'TUR', 'DEN', 'NOR', 'SWE', 'CRO', 'GRE', 'SVK',
  'USA', 'CAN', 'MEX', 'BRA', 'ARG', 'COL', 'ECU', 'PER', 'BOL', 'PAR', 'CHI',
  'JPN', 'KOR', 'AUS', 'IND', 'IDN'
];

export const getDeterministicHash = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

export const generateProceduralModNetwork = (
  countryCode: string,
  tier: number = 1,
  isCup: boolean = false
): BroadcastNetwork => {
  const norm = (countryCode || 'MOD').toUpperCase().trim();
  const hash = getDeterministicHash(norm);

  const palettes = [
    {
      accent: '#38bdf8',
      badgeBg: 'bg-gradient-to-r from-sky-950/90 via-slate-900/90 to-sky-950/90',
      borderColor: 'border-sky-500/40',
      textColor: '#ffffff',
    },
    {
      accent: '#22c55e',
      badgeBg: 'bg-gradient-to-r from-emerald-950/90 via-zinc-900/90 to-emerald-950/90',
      borderColor: 'border-emerald-500/40',
      textColor: '#ffffff',
    },
    {
      accent: '#f97316',
      badgeBg: 'bg-gradient-to-r from-orange-950/90 via-zinc-900/90 to-orange-950/90',
      borderColor: 'border-orange-500/40',
      textColor: '#ffffff',
    },
    {
      accent: '#a855f7',
      badgeBg: 'bg-gradient-to-r from-purple-950/90 via-slate-900/90 to-purple-950/90',
      borderColor: 'border-purple-500/40',
      textColor: '#ffffff',
    },
    {
      accent: '#ef4444',
      badgeBg: 'bg-gradient-to-r from-red-950/90 via-zinc-900/90 to-red-950/90',
      borderColor: 'border-red-500/40',
      textColor: '#ffffff',
    },
  ];

  const palette = palettes[hash % palettes.length];

  let channelName = `${norm} Sport`;
  let tagline = isCup ? 'NATIONAL CUP' : tier > 1 ? `TIER ${tier} LIVE` : 'LIVE BROADCAST';

  if (tier >= 4) {
    channelName = `${norm} Grassroots Live`;
    tagline = 'REGIONAL LIVE';
  } else if (tier === 3) {
    channelName = `${norm} League 3 TV`;
    tagline = 'DIVISION 3';
  } else if (tier === 2) {
    channelName = `${norm} Sport 2`;
    tagline = 'DIVISION 2';
  }

  return {
    id: `mod_${norm.toLowerCase()}_${isCup ? 'cup' : `t${tier}`}`,
    name: `${channelName} (${norm})`,
    shortName: norm.length <= 4 ? `${norm} SPORT` : `${norm.slice(0, 4)} SPORT`,
    tagline,
    accentColor: palette.accent,
    textColor: palette.textColor,
    badgeBg: palette.badgeBg,
    borderColor: palette.borderColor,
    renderType: 'custom_mod',
  };
};

/**
 * Resolves regional broadcast network branding based on country and competition.
 * STRICTLY active only when isModActive is true (CR27_Footy Real Name Pack).
 * Supports all 26+ countries authentically, plus procedural generation for new mod nations.
 */
export const getBroadcastNetwork = (
  country: string = 'GER',
  competitionId?: string,
  isModActive: boolean = false,
  tier: number = 1
): BroadcastNetwork | null => {
  if (!isModActive) {
    return null;
  }

  const code = normalizeCountryCode(country);
  const normComp = (competitionId || '').toLowerCase().trim();
  const region = getRegion(code);

  // Inferred tier from competition string or explicit parameter
  const effectiveTier =
    normComp.includes('tier 3') ||
    normComp.includes('t3') ||
    normComp.includes('league one') ||
    normComp.includes('usl1') ||
    normComp.includes('3. liga')
      ? 3
      : normComp.includes('tier 2') ||
        normComp.includes('t2') ||
        normComp.includes('league 2') ||
        normComp.includes('division 2') ||
        normComp.includes('second') ||
        normComp.includes('2. liga') ||
        normComp.includes('nordicbet') ||
        normComp.includes('obos') ||
        normComp.includes('superettan') ||
        normComp.includes('i-league') ||
        normComp.includes('prva') ||
        normComp.includes('super league 2') ||
        normComp.includes('usl championship') ||
        (normComp.includes('championship') && !normComp.includes('canadian'))
        ? 2
        : (tier || 1);

  // 0. Canadian Championship & Voyageurs Cup (prioritized so 'championship' is never confused with UEFA CL)
  const isVoyageursCup =
    normComp.includes('canadian championship') ||
    normComp.includes('voyageurs') ||
    normComp.includes('canada cup') ||
    (code === 'CAN' && (normComp === 'dfb' || (normComp.includes('cup') && !normComp.includes('leagues') && !normComp.includes('world') && !normComp.includes('cl') && !normComp.includes('cwc'))));

  if (isVoyageursCup) {
    const cupHash = getDeterministicHash(`${code}_CUP_${normComp}_${tier}`);
    const canCup = [BROADCAST_NETWORKS.onesoccer, BROADCAST_NETWORKS.tsn_can_cup];
    return canCup[cupHash % canCup.length];
  }

  // 1. FIFA World Cup / FIFA Club World Cup / Global Club Cup
  const isWorldCup =
    normComp === 'cwc' ||
    normComp === 'wc' ||
    normComp === 'world cup' ||
    normComp.includes('world cup') ||
    normComp.includes('world') ||
    normComp.includes('cwc') ||
    normComp.includes('fifa') ||
    normComp.includes('global club cup') ||
    normComp.includes('club world') ||
    normComp.includes('intercontinental');

  if (isWorldCup) {
    if (region === 'UEFA') {
      return BROADCAST_NETWORKS.bbc_world;
    }
    return BROADCAST_NETWORKS.espn_world;
  }

  // 2. Continental Top Tier (CL / Copa Libertadores / Concacaf Champions Cup / AFC Champions League)
  const isCl =
    (normComp === 'cl' ||
      normComp === 'c1' ||
      normComp.startsWith('cl ') ||
      normComp.endsWith(' cl') ||
      normComp.includes('euro champions') ||
      (normComp.includes('champions') && !normComp.includes('championship')) ||
      normComp.includes('libertadores') ||
      normComp.includes('elite cup'));

  if (isCl) {
    if (region === 'CONMEBOL') return BROADCAST_NETWORKS.espn_libertadores;
    if (code === 'CAN') return BROADCAST_NETWORKS.tsn;
    if (code === 'USA') return BROADCAST_NETWORKS.cbs_continental;
    if (code === 'MEX') return BROADCAST_NETWORKS.tudn;
    if (code === 'JPN') return BROADCAST_NETWORKS.dazn;
    if (code === 'AUS') return BROADCAST_NETWORKS.paramount_au;
    if (code === 'KOR') return BROADCAST_NETWORKS.coupang_play_k1;
    if (code === 'IND') return BROADCAST_NETWORKS.sony_sports;
    if (code === 'IDN') return BROADCAST_NETWORKS.indosiar_liga1;
    if (code === 'ENG' || code === 'SCO' || code === 'WAL') return BROADCAST_NETWORKS.tnt_sports;
    if (code === 'FRA') return BROADCAST_NETWORKS.canal_plus;
    if (code === 'ESP') return BROADCAST_NETWORKS.movistar;
    if (code === 'ITA') return BROADCAST_NETWORKS.mediaset;
    if (code === 'POR') return BROADCAST_NETWORKS.sport_tv;
    if (code === 'TUR') return BROADCAST_NETWORKS.bein_turkey;
    if (code === 'POL') return BROADCAST_NETWORKS.tvp_sport;
    if (code === 'DEN') return BROADCAST_NETWORKS.viaplay_den_t1;
    if (code === 'NOR') return BROADCAST_NETWORKS.tv2_nor_t1;
    if (code === 'SWE') return BROADCAST_NETWORKS.tv4_swe_t1;
    if (code === 'CRO') return BROADCAST_NETWORKS.maxsport_cro;
    if (code === 'GRE') return BROADCAST_NETWORKS.cosmote_sport_gre;
    if (code === 'SVK') return BROADCAST_NETWORKS.voyo_svk;
    if (code === 'SUI') return BROADCAST_NETWORKS.blue_sport;
    if (code === 'AUT') return BROADCAST_NETWORKS.sky_austria;
    return BROADCAST_NETWORKS.dazn;
  }

  // 3. North American Leagues Cup (USA & CAN clubs, exclusive Apple TV global broadcast)
  const isLeaguesCup =
    normComp.includes('leagues cup') ||
    normComp.includes('leagues challenge') ||
    (normComp.includes('leagues') && !normComp.includes('regional')) ||
    ((code === 'USA' || code === 'CAN') && (normComp === 'el' || normComp.startsWith('el leagues')));

  if (isLeaguesCup) {
    return BROADCAST_NETWORKS.apple_tv_leagues_cup;
  }

  // 4. Continental Secondary & Tertiary Tier (Europa League / Euro Cup / Conference League / Euro Challenge Cup / Copa Sudamericana / Recopa)
  const isEl =
    !isLeaguesCup &&
    (normComp === 'el' ||
      normComp.startsWith('el ') ||
      normComp.endsWith(' el') ||
      normComp.includes('euro cup') ||
      normComp.includes('europa') ||
      normComp.includes('sudamericana') ||
      normComp.includes('asian cup') ||
      normComp.includes('americas cup'));

  const isEcl =
    normComp === 'ecl' ||
    normComp.startsWith('ecl ') ||
    normComp.endsWith(' ecl') ||
    normComp.includes('euro challenge') ||
    normComp.includes('conference') ||
    normComp.includes('recopa') ||
    normComp.includes('challenge cup') ||
    normComp.includes('asian challenge');

  if (isEl || isEcl) {
    if (code === 'GER' || code === 'AUT') return BROADCAST_NETWORKS.rtl;
    if (region === 'CONMEBOL') return BROADCAST_NETWORKS.espn_libertadores;
    if (code === 'CAN') return BROADCAST_NETWORKS.tsn;
    if (code === 'ENG' || code === 'SCO' || code === 'WAL') return BROADCAST_NETWORKS.tnt_sports;
    if (code === 'ESP') return BROADCAST_NETWORKS.movistar;
    if (code === 'FRA') return BROADCAST_NETWORKS.canal_plus;
    if (code === 'POR') return BROADCAST_NETWORKS.sport_tv;
    if (code === 'SUI') return BROADCAST_NETWORKS.blue_sport;
    if (code === 'POL') return BROADCAST_NETWORKS.tvp_sport;
    if (code === 'TUR') return BROADCAST_NETWORKS.bein_turkey;
    if (code === 'DEN') return BROADCAST_NETWORKS.viaplay_den_t1;
    if (code === 'NOR') return BROADCAST_NETWORKS.tv2_nor_t1;
    if (code === 'SWE') return BROADCAST_NETWORKS.tv4_swe_t1;
    if (code === 'CRO') return BROADCAST_NETWORKS.maxsport_cro;
    if (code === 'GRE') return BROADCAST_NETWORKS.cosmote_sport_gre;
    if (code === 'SVK') return BROADCAST_NETWORKS.voyo_svk;
    if (code === 'USA') return BROADCAST_NETWORKS.cbs_continental;
    if (code === 'MEX') return BROADCAST_NETWORKS.tudn;
    if (code === 'JPN') return BROADCAST_NETWORKS.dazn;
    if (code === 'AUS') return BROADCAST_NETWORKS.paramount_au;
    if (code === 'KOR') return BROADCAST_NETWORKS.coupang_play_k1;
    if (code === 'IND') return BROADCAST_NETWORKS.sony_sports;
    if (code === 'IDN') return BROADCAST_NETWORKS.indosiar_liga1;
    return BROADCAST_NETWORKS.dazn;
  }

  // 5. National Domestic Cups, Grassroots & Regional Cups
  const isDomesticCup =
    !isCl &&
    !isEl &&
    !isEcl &&
    !isLeaguesCup &&
    (normComp === 'dfb' ||
      normComp === 'efl' ||
      normComp === 'reg' ||
      normComp.startsWith('reg ') ||
      normComp.includes('landespokal') ||
      normComp.includes('verbandspokal') ||
      normComp.includes('lower') ||
      normComp.includes('pokal') ||
      normComp.includes('taca') ||
      normComp.includes('taça') ||
      normComp.includes('fa cup') ||
      normComp.includes('copa del rey') ||
      normComp.includes('coupe de france') ||
      normComp.includes('coppa italia') ||
      normComp.includes('copa') ||
      (normComp.includes('regional') && !normComp.includes('regionalliga')) ||
      normComp.includes('trophy') ||
      normComp.includes('grassroots') ||
      normComp.includes('korea cup') ||
      normComp.includes('bicentenario') ||
      normComp.includes('slovnaft') ||
      normComp.includes('hrvatski') ||
      normComp.includes('kypello') ||
      normComp.includes('piala') ||
      normComp.includes('super cup') ||
      normComp.includes('cup'));

  if (isDomesticCup) {
    const cupHash = getDeterministicHash(`${code}_CUP_${normComp}_${tier}`);

    if (code === 'ENG') {
      if (normComp === 'efl' || normComp.includes('carabao') || normComp.includes('league cup')) {
        return BROADCAST_NETWORKS.sky_football;
      }
      const ukCup = [BROADCAST_NETWORKS.bbc_sport, BROADCAST_NETWORKS.itv_sport];
      return ukCup[cupHash % ukCup.length];
    }
    if (code === 'GER') {
      const isGermanRegionalCup =
        normComp === 'reg' ||
        normComp.startsWith('reg ') ||
        normComp.includes('reg ') ||
        normComp.endsWith(' reg') ||
        normComp.includes('regional') ||
        normComp.includes('landespokal') ||
        normComp.includes('verbandspokal') ||
        normComp.includes('amateur') ||
        (tier >= 4 && !normComp.includes('dfb'));

      if (isGermanRegionalCup) {
        if (normComp.includes('nordost') || normComp.includes('ost')) {
          return BROADCAST_NETWORKS.mdr_landespokal;
        }
        if (normComp.includes('suedwest') || normComp.includes('südwest') || normComp.includes('swr')) {
          return BROADCAST_NETWORKS.swr_landespokal;
        }
        if (normComp.includes('west')) {
          return BROADCAST_NETWORKS.wdr_landespokal;
        }
        if (normComp.includes('bayern') || normComp.includes('sued') || normComp.includes('süd')) {
          return BROADCAST_NETWORKS.br_landespokal;
        }
        const gerRegCupList = [
          BROADCAST_NETWORKS.mdr_landespokal,
          BROADCAST_NETWORKS.wdr_landespokal,
          BROADCAST_NETWORKS.br_landespokal,
          BROADCAST_NETWORKS.swr_landespokal,
          BROADCAST_NETWORKS.sport1_landespokal,
          BROADCAST_NETWORKS.sporttotal_landespokal,
        ];
        return gerRegCupList[cupHash % gerRegCupList.length];
      }

      const gerCup = [
        BROADCAST_NETWORKS.ard_sportschau,
        BROADCAST_NETWORKS.zdf_sportstudio,
        BROADCAST_NETWORKS.sky_sport,
      ];
      return gerCup[cupHash % gerCup.length];
    }
    if (code === 'ESP') {
      const espCup = [BROADCAST_NETWORKS.rtve, BROADCAST_NETWORKS.movistar_copa];
      return espCup[cupHash % espCup.length];
    }
    if (code === 'ITA') {
      const itaCup = [BROADCAST_NETWORKS.mediaset, BROADCAST_NETWORKS.rai_sport];
      return itaCup[cupHash % itaCup.length];
    }
    if (code === 'FRA') {
      const fraCup = [BROADCAST_NETWORKS.france_tv, BROADCAST_NETWORKS.bein_france];
      return fraCup[cupHash % fraCup.length];
    }
    if (code === 'POR') return BROADCAST_NETWORKS.sport_tv;
    if (code === 'SCO') return BROADCAST_NETWORKS.bbc_sport;
    if (code === 'WAL') return BROADCAST_NETWORKS.s4c;
    if (code === 'AUT') return BROADCAST_NETWORKS.orf_sport;
    if (code === 'SUI') return BROADCAST_NETWORKS.srf_sport;
    if (code === 'POL') return BROADCAST_NETWORKS.tvp_sport;
    if (code === 'TUR') return BROADCAST_NETWORKS.aspor;
    if (code === 'DEN') return BROADCAST_NETWORKS.viaplay_den_cup;
    if (code === 'NOR') return BROADCAST_NETWORKS.tv2_nor_cup;
    if (code === 'SWE') return BROADCAST_NETWORKS.svt_sport;
    if (code === 'CAN' || normComp.includes('canadian') || normComp.includes('voyageurs')) {
      const canCup = [BROADCAST_NETWORKS.onesoccer, BROADCAST_NETWORKS.tsn_can_cup];
      return canCup[cupHash % canCup.length];
    }
    if (code === 'USA') return BROADCAST_NETWORKS.cbs_golazo;
    if (code === 'MEX') {
      const mexCup = [BROADCAST_NETWORKS.tudn, BROADCAST_NETWORKS.azteca_deportes];
      return mexCup[cupHash % mexCup.length];
    }
    if (code === 'BRA') {
      const braCup = [BROADCAST_NETWORKS.sportv, BROADCAST_NETWORKS.globo];
      return braCup[cupHash % braCup.length];
    }
    if (code === 'ARG') {
      const argCup = [BROADCAST_NETWORKS.tyc_sports, BROADCAST_NETWORKS.telefe];
      return argCup[cupHash % argCup.length];
    }
    if (code === 'COL') return BROADCAST_NETWORKS.win_sports;
    if (code === 'ECU') return BROADCAST_NETWORKS.ecdf;
    if (code === 'AUS') return BROADCAST_NETWORKS.paramount_au;
    if (code === 'JPN') return BROADCAST_NETWORKS.dazn;
    if (code === 'KOR') return BROADCAST_NETWORKS.coupang_play_cup;
    if (code === 'BOL') return BROADCAST_NETWORKS.tigo_sports_bol_cup;
    if (code === 'PER') return BROADCAST_NETWORKS.l1_max_cup;
    if (code === 'PAR') return BROADCAST_NETWORKS.tigo_sports_par_cup;
    if (code === 'CHI') return BROADCAST_NETWORKS.tnt_sports_chi_cup;
    if (code === 'SVK') return BROADCAST_NETWORKS.rtvs_sport_svk;
    if (code === 'CRO') return BROADCAST_NETWORKS.maxsport_cro_cup;
    if (code === 'GRE') return BROADCAST_NETWORKS.cosmote_sport_cup;
    if (code === 'IDN') return BROADCAST_NETWORKS.indosiar_cup;
    if (code === 'IND') return BROADCAST_NETWORKS.sony_super_cup;

    if (!KNOWN_BASE_COUNTRIES.includes(code)) {
      return generateProceduralModNetwork(code, tier, true);
    }

    return BROADCAST_NETWORKS.sky_sports;
  }

  // 5. Decision Day / League Matches - Dedicated per country and tier
  switch (code) {
    case 'ENG':
      if (effectiveTier >= 6) return BROADCAST_NETWORKS.goal_tv;
      if (effectiveTier === 5) return BROADCAST_NETWORKS.national_league_tv;
      if (effectiveTier >= 2 && effectiveTier <= 4) return BROADCAST_NETWORKS.sky_sports_plus;
      return BROADCAST_NETWORKS.sky_sports;

    case 'GER':
      if (effectiveTier >= 5) return BROADCAST_NETWORKS.sporttotal;
      if (effectiveTier === 4) {
        if (normComp.includes('nordost') || normComp.includes('ost')) return BROADCAST_NETWORKS.mdr_sport;
        if (normComp.includes('west')) return BROADCAST_NETWORKS.wdr_sport;
        const regList = [
          BROADCAST_NETWORKS.mdr_sport,
          BROADCAST_NETWORKS.wdr_sport,
          BROADCAST_NETWORKS.sport1,
        ];
        const hash = getDeterministicHash(`GER_T4_${normComp}`);
        return regList[hash % regList.length];
      }
      if (effectiveTier === 3) return BROADCAST_NETWORKS.magenta_sport;
      return BROADCAST_NETWORKS.sky_sport;

    case 'ESP':
      if (effectiveTier >= 4) return BROADCAST_NETWORKS.goal_tv;
      if (effectiveTier === 3) return BROADCAST_NETWORKS.fef_tv;
      return BROADCAST_NETWORKS.movistar;

    case 'FRA':
      if (effectiveTier >= 4) return BROADCAST_NETWORKS.goal_tv;
      if (effectiveTier === 3) return BROADCAST_NETWORKS.ffftv;
      if (effectiveTier === 2) return BROADCAST_NETWORKS.bein_france;
      return BROADCAST_NETWORKS.canal_plus;

    case 'ITA':
      if (effectiveTier >= 4) return BROADCAST_NETWORKS.goal_tv;
      if (effectiveTier === 3) return BROADCAST_NETWORKS.now_serie_c;
      return BROADCAST_NETWORKS.dazn;

    case 'POR':
      if (effectiveTier >= 3) return BROADCAST_NETWORKS.goal_tv;
      return BROADCAST_NETWORKS.sport_tv;

    case 'SCO':
      return BROADCAST_NETWORKS.sky_football;

    case 'WAL':
      return BROADCAST_NETWORKS.s4c;

    case 'AUT':
      return BROADCAST_NETWORKS.sky_austria;

    case 'SUI':
      return BROADCAST_NETWORKS.blue_sport;

    case 'POL':
      return BROADCAST_NETWORKS.tvp_sport;

    case 'TUR':
      return BROADCAST_NETWORKS.bein_turkey;

    case 'DEN':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.viaplay_den_t2 : BROADCAST_NETWORKS.viaplay_den_t1;

    case 'NOR':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.tv2_nor_t2 : BROADCAST_NETWORKS.tv2_nor_t1;

    case 'SWE':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.tv4_swe_t2 : BROADCAST_NETWORKS.tv4_swe_t1;

    case 'USA':
      return (effectiveTier >= 2 || normComp.includes('usl') || normComp.includes('championship') || normComp.includes('league one'))
        ? BROADCAST_NETWORKS.cbs_usl
        : BROADCAST_NETWORKS.apple_tv;

    case 'CAN':
      return BROADCAST_NETWORKS.tsn;

    case 'MEX':
      return BROADCAST_NETWORKS.tudn;

    case 'BRA':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.sportv : BROADCAST_NETWORKS.premiere;

    case 'ARG':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.tyc_sports : BROADCAST_NETWORKS.espn_premium;

    case 'COL':
      return BROADCAST_NETWORKS.win_sports;

    case 'ECU':
      return BROADCAST_NETWORKS.ecdf;

    case 'AUS':
      return BROADCAST_NETWORKS.paramount_au;

    case 'JPN':
      return BROADCAST_NETWORKS.dazn;

    case 'KOR':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.coupang_play_k2 : BROADCAST_NETWORKS.coupang_play_k1;

    case 'BOL':
      return BROADCAST_NETWORKS.tigo_sports_bol;

    case 'PER':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.l1_max_per_t2 : BROADCAST_NETWORKS.l1_max_per;

    case 'PAR':
      return BROADCAST_NETWORKS.tigo_sports_par;

    case 'CHI':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.tnt_sports_chi_t2 : BROADCAST_NETWORKS.tnt_sports_chi;

    case 'SVK':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.voyo_svk_t2 : BROADCAST_NETWORKS.voyo_svk;

    case 'CRO':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.maxsport_cro_t2 : BROADCAST_NETWORKS.maxsport_cro;

    case 'GRE':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.cosmote_sport_gre_t2 : BROADCAST_NETWORKS.cosmote_sport_gre;

    case 'IDN':
      return BROADCAST_NETWORKS.indosiar_liga1;

    case 'IND':
      return effectiveTier === 2 ? BROADCAST_NETWORKS.sony_sports : BROADCAST_NETWORKS.jio_cinema_isl;

    default:
      if (!KNOWN_BASE_COUNTRIES.includes(code)) {
        return generateProceduralModNetwork(code, effectiveTier, false);
      }
      return BROADCAST_NETWORKS.sky_sports;
  }
};

