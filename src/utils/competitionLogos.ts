import { getRegion } from './regionHelpers';

const svgToDataUri = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;

const makeEmblem = (
  bgTop: string,
  bgBottom: string,
  ringColor: string,
  accent: string,
  motif: 'trophy' | 'starball' | 'globe' | 'crown' | 'shield' | 'lion' | 'kick' | 'stripes' | 'cockade' | 'hex' | 'ribbon',
  monogram: string
): string => {
  let centerArt = '';
  if (motif === 'starball') {
    centerArt = `
      <circle cx="32" cy="29" r="14" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.92"/>
      <polygon points="32,17 35,24 42,24 36.5,28.5 38.5,35.5 32,31.5 25.5,35.5 27.5,28.5 22,24 29,24" fill="${accent}"/>
      <circle cx="22" cy="21" r="2" fill="#FFFFFF"/><circle cx="42" cy="21" r="2" fill="#FFFFFF"/>
      <circle cx="21" cy="34" r="2" fill="#FFFFFF"/><circle cx="43" cy="34" r="2" fill="#FFFFFF"/>
    `;
  } else if (motif === 'trophy' || motif === 'ribbon') {
    centerArt = `
      <path d="M22 18h20v8c0 6-4.5 11-10 11s-10-5-10-11v-8z" fill="${accent}" stroke="#FFFFFF" stroke-width="1.5"/>
      <path d="M22 20h-4c0 5 2 8 4 8M42 20h4c0 5-2 8-4 8" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
      <rect x="29" y="37" width="6" height="6" fill="#FFFFFF"/>
      <rect x="24" y="43" width="16" height="3.5" rx="1.5" fill="${accent}"/>
    `;
  } else if (motif === 'globe') {
    centerArt = `
      <circle cx="32" cy="29" r="13.5" fill="none" stroke="${accent}" stroke-width="2.2"/>
      <ellipse cx="32" cy="29" rx="6.5" ry="13.5" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity="0.85"/>
      <line x1="18.5" y1="29" x2="45.5" y2="29" stroke="#FFFFFF" stroke-width="1.4" opacity="0.85"/>
      <line x1="21" y1="22.5" x2="43" y2="22.5" stroke="#FFFFFF" stroke-width="1.1" opacity="0.65"/>
      <line x1="21" y1="35.5" x2="43" y2="35.5" stroke="#FFFFFF" stroke-width="1.1" opacity="0.65"/>
    `;
  } else if (motif === 'crown') {
    centerArt = `
      <path d="M18 36L21 21l7 6 4-9 4 9 7-6 3 15H18z" fill="${accent}" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="19" y="38" width="26" height="4" rx="1.5" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="32" cy="16" r="2.2" fill="#FFFFFF"/>
    `;
  } else if (motif === 'lion') {
    centerArt = `
      <path d="M22 24l3-6 7 3 7-3 3 6-2 4h-16z" fill="${accent}" stroke="#FFFFFF" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="32" cy="34" r="8.5" fill="none" stroke="#FFFFFF" stroke-width="2"/>
      <text x="32" y="37.5" text-anchor="middle" fill="#FFFFFF" font-family="system-ui,sans-serif" font-size="9.5" font-weight="900">${monogram}</text>
    `;
  } else if (motif === 'kick') {
    centerArt = `
      <circle cx="38" cy="21" r="3.4" fill="#FFFFFF"/>
      <path d="M23 36l8-9 6 2 5-6M31 27l4 10-7 6M28 24l-6 4" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="43" cy="40" r="3.2" fill="${accent}" stroke="#FFFFFF" stroke-width="1"/>
    `;
  } else if (motif === 'cockade') {
    centerArt = `
      <circle cx="32" cy="30" r="13" fill="#16A34A" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="32" cy="30" r="8.5" fill="#FFFFFF"/>
      <circle cx="32" cy="30" r="4.5" fill="#DC2626"/>
    `;
  } else if (motif === 'stripes') {
    centerArt = `
      <rect x="20" y="18" width="6" height="24" rx="2" fill="#FFFFFF" opacity="0.92"/>
      <rect x="29" y="18" width="6" height="24" rx="2" fill="${accent}"/>
      <rect x="38" y="18" width="6" height="24" rx="2" fill="#FFFFFF" opacity="0.92"/>
    `;
  } else if (motif === 'hex') {
    centerArt = `
      <polygon points="32,16 44,23 44,37 32,44 20,37 20,23" fill="none" stroke="${accent}" stroke-width="2.4"/>
      <text x="32" y="34.5" text-anchor="middle" fill="#FFFFFF" font-family="system-ui,sans-serif" font-size="13" font-weight="900" letter-spacing="-0.5">${monogram}</text>
    `;
  } else {
    centerArt = `
      <path d="M21 18h22v12c0 8-11 13-11 13s-11-5-11-13V18z" fill="none" stroke="${accent}" stroke-width="2.2"/>
      <text x="32" y="34" text-anchor="middle" fill="#FFFFFF" font-family="system-ui,sans-serif" font-size="11.5" font-weight="900">${monogram}</text>
    `;
  }

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bgTop}"/>
          <stop offset="100%" stop-color="${bgBottom}"/>
        </linearGradient>
      </defs>
      <path d="M10 10C10 7.5 12 6 14.5 6h35C52 6 54 7.5 54 10v23c0 13.5-10 21-22 25-12-4-22-11.5-22-25V10z" fill="url(#g)" stroke="${ringColor}" stroke-width="2.5"/>
      ${centerArt}
      <rect x="17" y="47" width="30" height="8" rx="4" fill="rgba(15,23,42,0.55)" stroke="rgba(255,255,255,0.28)" stroke-width="0.8"/>
      <text x="32" y="53.2" text-anchor="middle" fill="#FFFFFF" font-family="system-ui,sans-serif" font-size="6.4" font-weight="900" letter-spacing="0.7">${monogram.slice(0, 5)}</text>
    </svg>
  `);
};

/**
 * Verified official competition emblem URLs (loaded when Community Mod is ON).
 * Covers all 34 countries (21 base-game + 13 mod-only), all Domestic Cups, Supercups,
 * and International / Continental Cups.
 */
export const REAL_TIER1_LEAGUE_URLS: Record<string, string> = {
  GER: 'https://thumb.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/250px-Bundesliga_logo_%282017%29.svg.png',
  ENG: 'https://thumb.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/250px-Premier_League_Logo.svg.png',
  ESP: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/LaLiga_EA_Sports_2023_Vertical_Logo.svg/250px-LaLiga_EA_Sports_2023_Vertical_Logo.svg.png',
  ITA: 'https://thumb.wikimedia.org/wikipedia/en/thumb/a/ab/Serie_A_ENILIVE_logo.svg/250px-Serie_A_ENILIVE_logo.svg.png',
  FRA: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Logo_Ligue_1_McDonald%27s_2024.svg/250px-Logo_Ligue_1_McDonald%27s_2024.svg.png',
  POR: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Liga_Portugal_Betclic_logo.svg/250px-Liga_Portugal_Betclic_logo.svg.png',
  ECU: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Football_of_Ecuador_-_Liga_Pro_logo_%28normal%29.svg/250px-Football_of_Ecuador_-_Liga_Pro_logo_%28normal%29.svg.png',
  USA: 'https://thumb.wikimedia.org/wikipedia/en/thumb/c/c7/Major_League_Soccer_logo.svg/250px-Major_League_Soccer_logo.svg.png',
  SCO: 'https://thumb.wikimedia.org/wikipedia/en/thumb/e/ea/Scottish_Premiership_logo.svg/250px-Scottish_Premiership_logo.svg.png',
  WAL: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Cymru-Premier-2026-Logo.svg/250px-Cymru-Premier-2026-Logo.svg.png',
  BRA: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Campeonato_Brasileiro_S%C3%A9rie_A_logo_%282026%29.svg/250px-Campeonato_Brasileiro_S%C3%A9rie_A_logo_%282026%29.svg.png',
  POL: 'https://thumb.wikimedia.org/wikipedia/en/thumb/5/51/PKO_ESA_t%C4%85o_tonalne_rgb.svg/250px-PKO_ESA_t%C4%85o_tonalne_rgb.svg.png',
  AUT: 'https://thumb.wikimedia.org/wikipedia/en/thumb/2/29/Admiral_Bundesliga.svg/250px-Admiral_Bundesliga.svg.png',
  SUI: 'https://thumb.wikimedia.org/wikipedia/en/thumb/a/ae/Swiss_Super_League_logo_%282025%29.svg/250px-Swiss_Super_League_logo_%282025%29.svg.png',
  AUS: 'https://commons.wikimedia.org/wiki/Special:FilePath/A-League_Trophy.svg?width=240',
  ARG: 'https://thumb.wikimedia.org/wikipedia/en/thumb/6/64/Liga_Profesional_de_F%C3%BAtbol_%28Argentina%29_logo.svg/250px-Liga_Profesional_de_F%C3%BAtbol_%28Argentina%29_logo.svg.png',
  JPN: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/J1_league_logo_2026.svg/250px-J1_league_logo_2026.svg.png',
  COL: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/BetPlay-Dimayor_logo.svg/250px-BetPlay-Dimayor_logo.svg.png',
  MEX: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Liga_MX_logo.svg/250px-Liga_MX_logo.svg.png',
  CAN: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Canadian_Premier_League_badge_2026.svg/250px-Canadian_Premier_League_badge_2026.svg.png',
  TUR: 'https://thumb.wikimedia.org/wikipedia/en/thumb/0/0f/Turkish_S%C3%BCper_Lig_logo_%282024%29.svg/250px-Turkish_S%C3%BCper_Lig_logo_%282024%29.svg.png',
  // Mod-only countries
  DEN: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/3F_Superliga_Logo_2024.png/250px-3F_Superliga_Logo_2024.png',
  NOR: 'https://thumb.wikimedia.org/wikipedia/en/thumb/5/50/Eliteserien_logo.svg/250px-Eliteserien_logo.svg.png',
  SWE: 'https://thumb.wikimedia.org/wikipedia/en/thumb/4/4a/Allsvenskan_logo.svg/250px-Allsvenskan_logo.svg.png',
  IDN: 'https://thumb.wikimedia.org/wikipedia/en/thumb/1/13/BRI_Super_League_2026.svg/250px-BRI_Super_League_2026.svg.png',
  IND: 'https://thumb.wikimedia.org/wikipedia/en/thumb/c/c7/MG_Indian_Super_League_official.svg/250px-MG_Indian_Super_League_official.svg.png',
  SVK: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Nik%C3%A9_Liga_logo.jpg/250px-Nik%C3%A9_Liga_logo.jpg',
  PER: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Liga_1_%28Peru%29_logo.svg/250px-Liga_1_%28Peru%29_logo.svg.png',
  KOR: 'https://thumb.wikimedia.org/wikipedia/en/thumb/2/2d/K_League_1.svg/250px-K_League_1.svg.png',
  BOL: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ligabolivia.png?width=240',
  PAR: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Logo-division-de-honor.png/250px-Logo-division-de-honor.png',
  CHI: 'https://thumb.wikimedia.org/wikipedia/en/thumb/c/ce/LigaPrimeraChile.png/250px-LigaPrimeraChile.png',
  CRO: 'https://thumb.wikimedia.org/wikipedia/en/thumb/4/4d/SuperSport_HNL.png/250px-SuperSport_HNL.png',
  GRE: 'https://thumb.wikimedia.org/wikipedia/en/thumb/5/54/Super_League_Greece_logo.svg/250px-Super_League_Greece_logo.svg.png',
};

export const REAL_DOMESTIC_CUP_URLS: Record<string, string> = {
  GER: 'https://thumb.wikimedia.org/wikipedia/en/thumb/7/76/DFB-Pokal_Logo_2026.svg/250px-DFB-Pokal_Logo_2026.svg.png',
  ENG: 'https://thumb.wikimedia.org/wikipedia/en/thumb/d/d5/FA_Cup_logo_%282020%29.svg/250px-FA_Cup_logo_%282020%29.svg.png',
  ESP: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Copa_del_Rey_logo_%282021%29.svg/250px-Copa_del_Rey_logo_%282021%29.svg.png',
  ITA: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Logo_of_Coppa_Italia_Frecciarossa_%282024-2025%29.svg/250px-Logo_of_Coppa_Italia_Frecciarossa_%282024-2025%29.svg.png',
  FRA: 'https://thumb.wikimedia.org/wikipedia/en/thumb/7/70/Coupe_de_France_logo_%282022%29.svg/250px-Coupe_de_France_logo_%282022%29.svg.png',
  POR: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Ta%C3%A7a_de_Portugal_Trophy.svg/250px-Ta%C3%A7a_de_Portugal_Trophy.svg.png',
  ECU: 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Copa_Ecuador_2022.jpg?width=240',
  USA: 'https://thumb.wikimedia.org/wikipedia/en/thumb/b/b5/U.S._Open_Cup_logo.svg/250px-U.S._Open_Cup_logo.svg.png',
  SCO: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Scottish_cup.jpg/250px-Scottish_cup.jpg',
  WAL: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/JD_FAW_Welsh_Cup_-_Horizontal.png/250px-JD_FAW_Welsh_Cup_-_Horizontal.png',
  BRA: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Copa_do_Brasil_logo_%282018%29.svg/250px-Copa_do_Brasil_logo_%282018%29.svg.png',
  POL: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Polish_Cup_logo.png',
  AUT: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Austrian_Football_Association_Logo.svg/250px-Austrian_Football_Association_Logo.svg.png',
  SUI: 'https://thumb.wikimedia.org/wikipedia/en/thumb/1/19/SchweizerCup.jpg/250px-SchweizerCup.jpg',
  AUS: 'https://thumb.wikimedia.org/wikipedia/en/thumb/f/f1/AUS_Cup_Logo.png/250px-AUS_Cup_Logo.png',
  ARG: 'https://thumb.wikimedia.org/wikipedia/en/thumb/a/aa/Copa_argentina_logo22.png/250px-Copa_argentina_logo22.png',
  JPN: 'https://thumb.wikimedia.org/wikipedia/en/thumb/5/59/Emperor%27s_Cup_logo_since_2018.svg/250px-Emperor%27s_Cup_logo_since_2018.svg.png',
  COL: 'https://thumb.wikimedia.org/wikipedia/en/thumb/a/a3/CopaColombia1.png/250px-CopaColombia1.png',
  MEX: 'https://thumb.wikimedia.org/wikipedia/en/thumb/b/b0/Copa_MX.svg/250px-Copa_MX.svg.png',
  CAN: 'https://thumb.wikimedia.org/wikipedia/en/thumb/3/3a/Canadian_Championship_2021_logo.png/250px-Canadian_Championship_2021_logo.png',
  TUR: 'https://thumb.wikimedia.org/wikipedia/en/thumb/d/df/Ziraat_Turkish_Cup_Vertical_Logo.png/250px-Ziraat_Turkish_Cup_Vertical_Logo.png',
  // Mod-only countries
  DEN: 'https://thumb.wikimedia.org/wikipedia/en/thumb/f/f4/DBU_Pokalen_logo.svg/250px-DBU_Pokalen_logo.svg.png',
  NOR: 'https://en.wikipedia.org/wiki/Special:FilePath/Norwegian_Football_Federation_logo.svg?width=240',
  SWE: 'https://thumb.wikimedia.org/wikipedia/en/thumb/0/04/Svenska_Cupen_logo.png/250px-Svenska_Cupen_logo.png',
  IDN: 'https://commons.wikimedia.org/wiki/Special:FilePath/NationalTeamFootballofIndonesia_Badge.svg?width=240',
  IND: 'https://thumb.wikimedia.org/wikipedia/en/thumb/6/6c/Federation_Cup_%28India%29.svg/250px-Federation_Cup_%28India%29.svg.png',
  SVK: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Slovensky_pohar_trophy.jpg',
  PER: 'https://upload.wikimedia.org/wikipedia/en/1/12/CopaBilogo.png',
  KOR: 'https://thumb.wikimedia.org/wikipedia/en/thumb/f/f7/Korea_Cup_%28domestic%29.svg/250px-Korea_Cup_%28domestic%29.svg.png',
  BOL: 'https://en.wikipedia.org/wiki/Special:FilePath/Bolivian_Football_Federation_logo.svg?width=240',
  PAR: 'https://commons.wikimedia.org/wiki/Special:FilePath/Asociaci%C3%B3n_Paraguaya_de_F%C3%BAtbol_logo.svg?width=240',
  CHI: 'https://commons.wikimedia.org/wiki/Special:FilePath/Copachilemtslogo.png?width=240',
  CRO: 'https://de.wikipedia.org/wiki/Special:FilePath/Hrvatski_Nogometni_Savez.svg?width=240',
  GRE: 'https://thumb.wikimedia.org/wikipedia/en/thumb/d/d2/Betsson_Greek_Cup_Official_Logo.png/250px-Betsson_Greek_Cup_Official_Logo.png',
};

export const REAL_SUPERCUP_URLS: Record<string, string> = {
  GER: 'https://thumb.wikimedia.org/wikipedia/en/thumb/1/15/Franz_Beckenbauer_Supercup_logo.svg/250px-Franz_Beckenbauer_Supercup_logo.svg.png',
  ENG: 'https://thumb.wikimedia.org/wikipedia/en/thumb/d/d6/FA_Community_Shield_logo.svg/250px-FA_Community_Shield_logo.svg.png',
  ESP: 'https://thumb.wikimedia.org/wikipedia/en/thumb/f/fa/Supercopa-de-Espa%C3%B1a-RFEF.svg/250px-Supercopa-de-Espa%C3%B1a-RFEF.svg.png',
  ITA: 'https://thumb.wikimedia.org/wikipedia/en/thumb/8/87/Supercoppa_Italiana_logo.svg/250px-Supercoppa_Italiana_logo.svg.png',
  FRA: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Troph%C3%A9e_des_Champions_logo_%282024%29.svg/250px-Troph%C3%A9e_des_Champions_logo_%282024%29.svg.png',
  POR: 'https://commons.wikimedia.org/wiki/Special:FilePath/Superta%C3%A7a_C%C3%A2ndido_de_Oliveira.svg?width=240',
  TUR: 'https://thumb.wikimedia.org/wikipedia/en/thumb/1/1a/Turkishsupercup.jpg/250px-Turkishsupercup.jpg',
  ARG: 'https://thumb.wikimedia.org/wikipedia/en/thumb/2/2d/Supercup_of_Argentina_logo.svg/250px-Supercup_of_Argentina_logo.svg.png',
  BRA: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Supercopa_Rei_logo_%282023%29.svg/250px-Supercopa_Rei_logo_%282023%29.svg.png',
  UEFA: 'https://thumb.wikimedia.org/wikipedia/en/thumb/0/0b/UEFA_Super_Cup_logo.svg/250px-UEFA_Super_Cup_logo.svg.png',
};

export const REAL_INTL_CUP_URLS = {
  cl: 'https://thumb.wikimedia.org/wikipedia/en/thumb/f/f5/UEFA_Champions_League.svg/250px-UEFA_Champions_League.svg.png',
  el: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/UEFA_Europa_League_logo_%282024_version%29.svg/250px-UEFA_Europa_League_logo_%282024_version%29.svg.png',
  ecl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/UEFA_Conference_League_full_logo_%282024_version%29.svg/250px-UEFA_Conference_League_full_logo_%282024_version%29.svg.png',
  cwc: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/FIFA_Club_World_Cup_logo.svg/250px-FIFA_Club_World_Cup_logo.svg.png',
  wc: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/FIFA_World_Cup_wordmark_%282023%29.svg/250px-FIFA_World_Cup_wordmark_%282023%29.svg.png',
  copaLibertadores: 'https://thumb.wikimedia.org/wikipedia/en/thumb/a/a1/Copa_Libertadores_logo.svg/250px-Copa_Libertadores_logo.svg.png',
  copaSudamericana: 'https://thumb.wikimedia.org/wikipedia/en/thumb/c/c2/CONMEBOL_Sudamericana_logo_%282017%29.svg/250px-CONMEBOL_Sudamericana_logo_%282017%29.svg.png',
  recopaSudamericana: 'https://thumb.wikimedia.org/wikipedia/en/thumb/4/48/Recopa_sudamericana_logo.png/250px-Recopa_sudamericana_logo.png',
  concacaf: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/CONCACAF_Champions_Cup_logo.svg/250px-CONCACAF_Champions_Cup_logo.svg.png',
  leaguesCup: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Leagues_Cup_logo_white-on-black.svg/250px-Leagues_Cup_logo_white-on-black.svg.png',
  campeonesCup: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Campeones_Cup_logo.svg/250px-Campeones_Cup_logo.svg.png',
  afcChampionsLeague: 'https://thumb.wikimedia.org/wikipedia/en/thumb/d/d7/AFC_Champions_League_Elite_logo.svg/250px-AFC_Champions_League_Elite_logo.svg.png',
  afcCup: 'https://thumb.wikimedia.org/wikipedia/en/thumb/8/81/AFC_Champions_League_Two.svg/250px-AFC_Champions_League_Two.svg.png',
  afcChallengeLeague: 'https://thumb.wikimedia.org/wikipedia/en/thumb/1/1e/AFC_Challenge_League_logo.svg/250px-AFC_Challenge_League_logo.svg.png',
  supercup: REAL_SUPERCUP_URLS.UEFA,
};

/**
 * Bespoke offline / high-contrast SVG competition emblems (used as error-fallback when Mod is ON).
 */
export const OFFICIAL_COMPETITION_SVG_LOGOS = {
  // Continental & Global Cups
  cl: makeEmblem('#0F172A', '#1E3A8A', '#93C5FD', '#FBBF24', 'starball', 'UCL'),
  el: makeEmblem('#1C1917', '#EA580C', '#FDBA74', '#FFFFFF', 'trophy', 'UEL'),
  ecl: makeEmblem('#064E3B', '#10B981', '#A7F3D0', '#FFFFFF', 'shield', 'UECL'),
  cwc: makeEmblem('#18181B', '#92400E', '#FDE68A', '#FBBF24', 'globe', 'CWC'),
  wc: makeEmblem('#1E293B', '#B45309', '#FDE68A', '#FACC15', 'globe', 'WC'),
  copaLibertadores: makeEmblem('#111827', '#78350F', '#FDE68A', '#FBBF24', 'trophy', 'LIB'),
  copaSudamericana: makeEmblem('#0C4A6E', '#1D4ED8', '#BAE6FD', '#FBBF24', 'trophy', 'SUD'),
  recopaSudamericana: makeEmblem('#1E1B4B', '#6D28D9', '#DDD6FE', '#FBBF24', 'crown', 'REC'),
  concacaf: makeEmblem('#0F172A', '#B91C1C', '#FCA5A5', '#FBBF24', 'starball', 'CCC'),
  leaguesCup: makeEmblem('#0B132B', '#0284C7', '#BAE6FD', '#F97316', 'trophy', 'LGS'),
  campeonesCup: makeEmblem('#18191F', '#047857', '#A7F3D0', '#FBBF24', 'crown', 'CAMP'),
  afcChampionsLeague: makeEmblem('#1E1B4B', '#0F766E', '#99F6E4', '#FBBF24', 'starball', 'ACLE'),
  afcCup: makeEmblem('#1E293B', '#0369A1', '#BAE6FD', '#FBBF24', 'trophy', 'ACL2'),
  afcChallengeLeague: makeEmblem('#1F2937', '#4D7C0F', '#D9F99D', '#FFFFFF', 'shield', 'ACGL'),

  // Major National Cups & Supercups
  dfbPokal: makeEmblem('#064E3B', '#047857', '#FDE68A', '#FBBF24', 'trophy', 'POKAL'),
  faCup: makeEmblem('#7F1D1D', '#DC2626', '#E5E7EB', '#F8FAFC', 'trophy', 'FACUP'),
  copaDelRey: makeEmblem('#7C2D12', '#B91C1C', '#FDE68A', '#FBBF24', 'crown', 'CDR'),
  coppaItalia: makeEmblem('#1E3A8A', '#0F172A', '#CBD5E1', '#FFFFFF', 'cockade', 'COPPA'),
  coupeDeFrance: makeEmblem('#1E3A8A', '#1D4ED8', '#FDE68A', '#FBBF24', 'trophy', 'CDF'),
  tacaDePortugal: makeEmblem('#14532D', '#B91C1C', '#FDE68A', '#FBBF24', 'trophy', 'TACA'),
  usOpenCup: makeEmblem('#1E3A8A', '#B91C1C', '#FFFFFF', '#FBBF24', 'shield', 'USOC'),
  voyageursCup: makeEmblem('#991B1B', '#DC2626', '#FFFFFF', '#FFFFFF', 'shield', 'CAN'),
  copaDoBrasil: makeEmblem('#065F46', '#047857', '#FDE047', '#FACC15', 'trophy', 'CDB'),
  copaArgentina: makeEmblem('#0284C7', '#0369A1', '#E0F2FE', '#FBBF24', 'trophy', 'ARG'),
  copaEcuador: makeEmblem('#0F172A', '#CA8A04', '#93C5FD', '#EF4444', 'trophy', 'ECU'),
  supercup: makeEmblem('#18191F', '#6D28D9', '#FDE68A', '#FBBF24', 'crown', 'SUPER'),
};

/**
 * Clean non-copyrighted fictional/generic fallback competition shields (used when Mod is OFF).
 * Strictly zero trademarked URLs or real competition names.
 */
export const FALLBACK_COMPETITION_SVG_LOGOS = {
  league1: makeEmblem('#334155', '#1E293B', '#CBD5E1', '#FBBF24', 'shield', 'DIV 1'),
  nationalCup: makeEmblem('#1E293B', '#0F766E', '#CBD5E1', '#FDE047', 'trophy', 'CUP'),
  supercup: makeEmblem('#312E81', '#1E1B4B', '#DDD6FE', '#FBBF24', 'crown', 'SUPER'),
  continental1: makeEmblem('#0F172A', '#1D4ED8', '#93C5FD', '#FBBF24', 'starball', 'CONT1'),
  continental2: makeEmblem('#1C1917', '#C2410C', '#FED7AA', '#FDE68A', 'trophy', 'CONT2'),
  continental3: makeEmblem('#064E3B', '#047857', '#A7F3D0', '#FFFFFF', 'shield', 'CHALL'),
  globalClub: makeEmblem('#27272A', '#78350F', '#FDE68A', '#FBBF24', 'globe', 'CLUB'),
  worldCup: makeEmblem('#1E293B', '#92400E', '#FDE68A', '#FACC15', 'globe', 'WORLD'),
};

const TIER1_LEAGUE_SVG_LOGOS: Record<string, string> = {
  ENG: makeEmblem('#3B0764', '#6D28D9', '#F472B6', '#FDE047', 'lion', 'PL'),
  GER: makeEmblem('#B91C1C', '#DC2626', '#FFFFFF', '#FFFFFF', 'kick', 'BL'),
  ESP: makeEmblem('#DC2626', '#EA580C', '#FFFFFF', '#FFFFFF', 'stripes', 'LIGA'),
  ITA: makeEmblem('#0C4A6E', '#1D4ED8', '#60A5FA', '#FBBF24', 'hex', 'SA'),
  FRA: makeEmblem('#0F172A', '#1E3A8A', '#FBBF24', '#FBBF24', 'hex', 'L1'),
  POR: makeEmblem('#18191F', '#EA580C', '#FDBA74', '#FFFFFF', 'shield', 'LP'),
  USA: makeEmblem('#0F172A', '#B91C1C', '#FFFFFF', '#60A5FA', 'shield', 'MLS'),
  CAN: makeEmblem('#991B1B', '#1E3A8A', '#FFFFFF', '#FBBF24', 'shield', 'CPL'),
  BRA: makeEmblem('#064E3B', '#15803D', '#FACC15', '#FDE047', 'trophy', 'BRA'),
  ARG: makeEmblem('#0369A1', '#0284C7', '#FFFFFF', '#FBBF24', 'crown', 'LPF'),
  NED: makeEmblem('#1E3A8A', '#EA580C', '#FFFFFF', '#F97316', 'shield', 'ERE'),
  SCO: makeEmblem('#0F172A', '#1D4ED8', '#FBBF24', '#FACC15', 'lion', 'SPFL'),
  TUR: makeEmblem('#7F1D1D', '#DC2626', '#FDE68A', '#FFFFFF', 'crown', 'SL'),
  ECU: makeEmblem('#1E3A8A', '#B91C1C', '#FDE047', '#FACC15', 'shield', 'LPRO'),
  MEX: makeEmblem('#064E3B', '#B91C1C', '#FFFFFF', '#FBBF24', 'shield', 'LMX'),
  JPN: makeEmblem('#0F172A', '#B91C1C', '#FFFFFF', '#FACC15', 'shield', 'J1'),
  KOR: makeEmblem('#0F172A', '#1D4ED8', '#FFFFFF', '#EF4444', 'shield', 'K1'),
  POL: makeEmblem('#7F1D1D', '#B91C1C', '#FFFFFF', '#FBBF24', 'crown', 'EKS'),
  AUT: makeEmblem('#991B1B', '#DC2626', '#FFFFFF', '#FFFFFF', 'shield', 'OBL'),
  SUI: makeEmblem('#991B1B', '#DC2626', '#FFFFFF', '#FFFFFF', 'shield', 'SSL'),
  DEN: makeEmblem('#7F1D1D', '#B91C1C', '#FFFFFF', '#FBBF24', 'shield', 'DSL'),
  NOR: makeEmblem('#1E3A8A', '#B91C1C', '#FFFFFF', '#FFFFFF', 'shield', 'ELIT'),
  SWE: makeEmblem('#1E3A8A', '#0284C7', '#FACC15', '#FDE047', 'crown', 'ALLS'),
  CRO: makeEmblem('#1E3A8A', '#B91C1C', '#FFFFFF', '#FFFFFF', 'shield', 'HNL'),
  GRE: makeEmblem('#0C4A6E', '#0284C7', '#FFFFFF', '#FBBF24', 'shield', 'SLG'),
  AUS: makeEmblem('#0F172A', '#CA8A04', '#FDE047', '#FFFFFF', 'shield', 'ALM'),
  COL: makeEmblem('#1E3A8A', '#CA8A04', '#FDE047', '#EF4444', 'shield', 'COL'),
  CHI: makeEmblem('#1E3A8A', '#B91C1C', '#FFFFFF', '#FFFFFF', 'shield', 'CHI'),
  PER: makeEmblem('#7F1D1D', '#B91C1C', '#FFFFFF', '#FBBF24', 'shield', 'PER'),
  PAR: makeEmblem('#1E3A8A', '#B91C1C', '#FFFFFF', '#FFFFFF', 'shield', 'PAR'),
  BOL: makeEmblem('#064E3B', '#CA8A04', '#EF4444', '#FACC15', 'shield', 'BOL'),
  SVK: makeEmblem('#1E3A8A', '#B91C1C', '#FFFFFF', '#FFFFFF', 'shield', 'SVK'),
  IND: makeEmblem('#1E3A8A', '#EA580C', '#FFFFFF', '#16A34A', 'shield', 'ISL'),
  IDN: makeEmblem('#7F1D1D', '#B91C1C', '#FFFFFF', '#FBBF24', 'shield', 'L1I'),
  WAL: makeEmblem('#7F1D1D', '#15803D', '#FFFFFF', '#FBBF24', 'shield', 'CYM'),
};

export type CompetitionKind = 'league' | 'cup' | 'supercup' | 'continental' | 'world_cup';

export interface CompetitionLogoQuery {
  kind: CompetitionKind;
  competitionId?: string;
  country?: string;
  tier?: number;
  isModActive?: boolean;
}

export interface CompetitionLogoSourcePair {
  primary: string;
  fallback: string;
  isReal: boolean;
}

const COUNTRY_FALLBACK_COLORS: Record<string, [string, string, string]> = {
  GER: ['#1F2937', '#B91C1C', '#FBBF24'],
  ENG: ['#1E293B', '#991B1B', '#F8FAFC'],
  ESP: ['#7C2D12', '#B91C1C', '#FACC15'],
  ITA: ['#0F172A', '#1D4ED8', '#22C55E'],
  FRA: ['#0F172A', '#1E40AF', '#EF4444'],
  POR: ['#14532D', '#991B1B', '#FACC15'],
  ECU: ['#1E3A8A', '#B45309', '#EF4444'],
  USA: ['#1E293B', '#1D4ED8', '#EF4444'],
  CAN: ['#7F1D1D', '#B91C1C', '#FFFFFF'],
  BRA: ['#064E3B', '#15803D', '#FACC15'],
  ARG: ['#0369A1', '#0284C7', '#FDE68A'],
  SCO: ['#0F172A', '#1D4ED8', '#FFFFFF'],
  WAL: ['#14532D', '#B91C1C', '#FFFFFF'],
  TUR: ['#7F1D1D', '#B91C1C', '#FFFFFF'],
  DEN: ['#7F1D1D', '#991B1B', '#FFFFFF'],
  NOR: ['#1E3A8A', '#991B1B', '#FFFFFF'],
  SWE: ['#1E3A8A', '#0284C7', '#FACC15'],
  GRE: ['#0C4A6E', '#0369A1', '#FFFFFF'],
  CRO: ['#1E3A8A', '#B91C1C', '#FFFFFF'],
};

/**
 * Generates clean non-copyrighted fallback competition emblems when Community Mod is OFF.
 * Works uniformly for all 34 countries (both base-game and mod-only).
 */
export const getFallbackCompetitionLogo = ({
  kind,
  competitionId = '',
  country = 'GER',
  tier = 1,
}: Omit<CompetitionLogoQuery, 'isModActive'>): string => {
  const c = (country || 'GER').toUpperCase().trim();
  const id = (competitionId || '').toLowerCase().trim();
  const region = getRegion(c);
  const [cTop, cBot, cAcc] = COUNTRY_FALLBACK_COLORS[c] || ['#334155', '#1E293B', '#FBBF24'];

  if (kind === 'league') {
    if (tier !== 1) return '';
    return makeEmblem(cTop, cBot, '#E2E8F0', cAcc, 'shield', `${c} 1`);
  }

  if (kind === 'supercup') {
    return makeEmblem('#312E81', '#1E1B4B', '#DDD6FE', '#FBBF24', 'crown', 'SUPER');
  }

  if (kind === 'world_cup' || id === 'wc' || id === 'world-cup') {
    return FALLBACK_COMPETITION_SVG_LOGOS.worldCup;
  }

  if (kind === 'cup' || id === 'dfb' || id === 'domestic-cup') {
    if (tier >= 4) return '';
    return makeEmblem(cBot, '#0F172A', '#E2E8F0', '#FDE047', 'trophy', `${c} CUP`);
  }

  if (
    kind === 'continental' ||
    id === 'cl' ||
    id === 'el' ||
    id === 'ecl' ||
    id === 'cwc' ||
    id === 'continental-1' ||
    id === 'continental-2' ||
    id === 'global-club-cup'
  ) {
    if (id === 'cwc' || id === 'global-club-cup') {
      return FALLBACK_COMPETITION_SVG_LOGOS.globalClub;
    }
    const prefix =
      region === 'CONMEBOL'
        ? 'SA'
        : region === 'CONCACAF'
        ? 'NA'
        : region === 'AFC'
        ? 'AS'
        : 'EU';
    if (id === 'cl' || id === 'continental-1') {
      return makeEmblem('#0F172A', '#1D4ED8', '#93C5FD', '#FBBF24', 'starball', `${prefix} 1`);
    }
    if (id === 'el' || id === 'continental-2') {
      return makeEmblem('#1C1917', '#C2410C', '#FED7AA', '#FDE68A', 'trophy', `${prefix} 2`);
    }
    if (id === 'ecl') {
      return makeEmblem('#064E3B', '#047857', '#A7F3D0', '#FFFFFF', 'shield', `${prefix} 3`);
    }
  }

  return '';
};

/**
 * Resolves the SVG backup emblem for a real competition (used as onError fallback if remote URL fails).
 */
export const getOfficialSvgFallback = ({
  kind,
  competitionId = '',
  country = 'GER',
  tier = 1,
}: Omit<CompetitionLogoQuery, 'isModActive'>): string => {
  const c = (country || 'GER').toUpperCase().trim();
  const id = (competitionId || '').toLowerCase().trim();
  const region = getRegion(c);

  if (kind === 'league') {
    if (tier !== 1) return '';
    return TIER1_LEAGUE_SVG_LOGOS[c] || makeEmblem('#18191F', '#334155', '#CBD5E1', '#FBBF24', 'shield', `${c}1`);
  }

  if (kind === 'supercup') {
    return OFFICIAL_COMPETITION_SVG_LOGOS.supercup;
  }

  if (kind === 'world_cup' || id === 'wc' || id === 'world-cup') {
    return OFFICIAL_COMPETITION_SVG_LOGOS.wc;
  }

  if (kind === 'cup' || id === 'dfb' || id === 'domestic-cup') {
    if (tier >= 4) return '';
    const map: Record<string, string> = {
      GER: OFFICIAL_COMPETITION_SVG_LOGOS.dfbPokal,
      ENG: OFFICIAL_COMPETITION_SVG_LOGOS.faCup,
      ESP: OFFICIAL_COMPETITION_SVG_LOGOS.copaDelRey,
      ITA: OFFICIAL_COMPETITION_SVG_LOGOS.coppaItalia,
      FRA: OFFICIAL_COMPETITION_SVG_LOGOS.coupeDeFrance,
      POR: OFFICIAL_COMPETITION_SVG_LOGOS.tacaDePortugal,
      USA: OFFICIAL_COMPETITION_SVG_LOGOS.usOpenCup,
      CAN: OFFICIAL_COMPETITION_SVG_LOGOS.voyageursCup,
      BRA: OFFICIAL_COMPETITION_SVG_LOGOS.copaDoBrasil,
      ARG: OFFICIAL_COMPETITION_SVG_LOGOS.copaArgentina,
      ECU: OFFICIAL_COMPETITION_SVG_LOGOS.copaEcuador,
    };
    return map[c] || makeEmblem('#1E293B', '#0F766E', '#FDE68A', '#FBBF24', 'trophy', `${c}CUP`);
  }

  if (
    kind === 'continental' ||
    id === 'cl' ||
    id === 'el' ||
    id === 'ecl' ||
    id === 'cwc' ||
    id === 'continental-1' ||
    id === 'continental-2' ||
    id === 'global-club-cup'
  ) {
    if (id === 'cwc' || id === 'global-club-cup') return OFFICIAL_COMPETITION_SVG_LOGOS.cwc;
    if (id === 'cl' || id === 'continental-1') {
      if (region === 'CONMEBOL') return OFFICIAL_COMPETITION_SVG_LOGOS.copaLibertadores;
      if (region === 'CONCACAF') return OFFICIAL_COMPETITION_SVG_LOGOS.concacaf;
      if (region === 'AFC') return OFFICIAL_COMPETITION_SVG_LOGOS.afcChampionsLeague;
      return OFFICIAL_COMPETITION_SVG_LOGOS.cl;
    }
    if (id === 'el' || id === 'continental-2') {
      if (region === 'CONMEBOL') return OFFICIAL_COMPETITION_SVG_LOGOS.copaSudamericana;
      if (region === 'CONCACAF') return OFFICIAL_COMPETITION_SVG_LOGOS.leaguesCup;
      if (region === 'AFC') return OFFICIAL_COMPETITION_SVG_LOGOS.afcCup;
      return OFFICIAL_COMPETITION_SVG_LOGOS.el;
    }
    if (id === 'ecl') {
      if (region === 'CONMEBOL') return OFFICIAL_COMPETITION_SVG_LOGOS.recopaSudamericana;
      if (region === 'CONCACAF') return OFFICIAL_COMPETITION_SVG_LOGOS.campeonesCup;
      if (region === 'AFC') return OFFICIAL_COMPETITION_SVG_LOGOS.afcChallengeLeague;
      return OFFICIAL_COMPETITION_SVG_LOGOS.ecl;
    }
  }

  return '';
};

/**
 * Returns both primary and offline fallback URLs for a competition.
 * - When `isModActive === true`: `primary` is the real official Wikimedia emblem URL,
 *   and `fallback` is a bespoke vector emblem.
 * - When `isModActive === false`: `primary` is a non-copyrighted fallback competition emblem SVG.
 */
export const getCompetitionLogoSourcePair = (query: CompetitionLogoQuery): CompetitionLogoSourcePair => {
  const {
    kind,
    competitionId = '',
    country = 'GER',
    tier = 1,
    isModActive = false,
  } = query;

  if (!isModActive) {
    const fb = getFallbackCompetitionLogo({ kind, competitionId, country, tier });
    return { primary: fb, fallback: fb, isReal: false };
  }

  const c = (country || 'GER').toUpperCase().trim();
  const id = (competitionId || '').toLowerCase().trim();
  const region = getRegion(c);
  const svgFallback = getOfficialSvgFallback({ kind, competitionId, country, tier });

  if (kind === 'league') {
    if (tier !== 1) return { primary: '', fallback: '', isReal: false };
    const real = REAL_TIER1_LEAGUE_URLS[c] || svgFallback;
    return { primary: real, fallback: svgFallback, isReal: Boolean(REAL_TIER1_LEAGUE_URLS[c]) };
  }

  if (kind === 'supercup') {
    const real = REAL_SUPERCUP_URLS[c] || REAL_SUPERCUP_URLS.UEFA;
    return { primary: real, fallback: svgFallback, isReal: true };
  }

  if (kind === 'world_cup' || id === 'wc' || id === 'world-cup') {
    return { primary: REAL_INTL_CUP_URLS.wc, fallback: svgFallback, isReal: true };
  }

  if (kind === 'cup' || id === 'dfb' || id === 'domestic-cup') {
    if (tier >= 4) return { primary: '', fallback: '', isReal: false };
    const real = REAL_DOMESTIC_CUP_URLS[c] || svgFallback;
    return { primary: real, fallback: svgFallback, isReal: Boolean(REAL_DOMESTIC_CUP_URLS[c]) };
  }

  if (
    kind === 'continental' ||
    id === 'cl' ||
    id === 'el' ||
    id === 'ecl' ||
    id === 'cwc' ||
    id === 'continental-1' ||
    id === 'continental-2' ||
    id === 'global-club-cup'
  ) {
    if (id === 'cwc' || id === 'global-club-cup') {
      return { primary: REAL_INTL_CUP_URLS.cwc, fallback: svgFallback, isReal: true };
    }
    if (id === 'cl' || id === 'continental-1') {
      const real =
        region === 'CONMEBOL'
          ? REAL_INTL_CUP_URLS.copaLibertadores
          : region === 'CONCACAF'
          ? REAL_INTL_CUP_URLS.concacaf
          : region === 'AFC'
          ? REAL_INTL_CUP_URLS.afcChampionsLeague
          : REAL_INTL_CUP_URLS.cl;
      return { primary: real, fallback: svgFallback, isReal: true };
    }
    if (id === 'el' || id === 'continental-2') {
      const real =
        region === 'CONMEBOL'
          ? REAL_INTL_CUP_URLS.copaSudamericana
          : region === 'CONCACAF'
          ? REAL_INTL_CUP_URLS.leaguesCup
          : region === 'AFC'
          ? REAL_INTL_CUP_URLS.afcCup
          : REAL_INTL_CUP_URLS.el;
      return { primary: real, fallback: svgFallback, isReal: true };
    }
    if (id === 'ecl') {
      const real =
        region === 'CONMEBOL'
          ? REAL_INTL_CUP_URLS.recopaSudamericana
          : region === 'CONCACAF'
          ? REAL_INTL_CUP_URLS.campeonesCup
          : region === 'AFC'
          ? REAL_INTL_CUP_URLS.afcChallengeLeague
          : REAL_INTL_CUP_URLS.ecl;
      return { primary: real, fallback: svgFallback, isReal: true };
    }
  }

  return { primary: '', fallback: '', isReal: false };
};

/**
 * Resolves official competition emblems for Tier 1 Leagues, National Cups, Supercups,
 * and International / Continental Cups when `isModActive === true`, and crisp non-trademarked
 * fallback competition emblems when `isModActive === false`.
 */
export const getCompetitionLogo = (query: CompetitionLogoQuery): string => {
  return getCompetitionLogoSourcePair(query).primary;
};
