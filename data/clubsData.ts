export interface Club {
  id: number;
  name: string;
  tier: number;
  baseOvr: number;
  color: string;
  stadium: number;
  logo?: string;
  fallbackLogo?: string;
  country?: string;
  rep?: number;
  fanBase?: number;
  currentBudget?: number;
  isReserve?: boolean;
}

export const GERMANY_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 1, name: "Bavaria München", tier: 1, baseOvr: 96, color: "dc052d", stadium: 75024, country: "GER", rep: 92, fanBase: 9731880, currentBudget: 87480000 },
  { id: 2, name: "SV Leverkusen 04", tier: 1, baseOvr: 83, color: "e32219", stadium: 30210, country: "GER", rep: 90, fanBase: 4306672, currentBudget: 81776640 },
  { id: 3, name: "Prussia Dortmund", tier: 1, baseOvr: 86, color: "fde100", stadium: 81365, country: "GER", rep: 88, fanBase: 10399856, currentBudget: 76326720 },
  { id: 4, name: "FC Rasen Leipzig", tier: 1, baseOvr: 85, color: "dd011d", stadium: 47069, country: "GER", rep: 87, fanBase: 6262405, currentBudget: 73695000 },
  { id: 5, name: "VfL Stuttgart", tier: 1, baseOvr: 84, color: "e32219", stadium: 60449, country: "GER", rep: 86, fanBase: 7846584, currentBudget: 71124480 },
  { id: 6, name: "Concordia Frankfurt", tier: 1, baseOvr: 82, color: "e1000f", stadium: 58000, country: "GER", rep: 84, fanBase: 7511368, currentBudget: 66164160 },
  { id: 7, name: "Breisgau Freiburg", tier: 1, baseOvr: 81, color: "d71920", stadium: 34700, country: "GER", rep: 83, fanBase: 4695441, currentBudget: 63772920 },
  { id: 8, name: "Kraichgau Hoffenheim", tier: 1, baseOvr: 80, color: "1c63b7", stadium: 30150, country: "GER", rep: 82, fanBase: 4130000, currentBudget: 61440000 },
  { id: 14, name: "Prussia Mönchengladbach", tier: 1, baseOvr: 79, color: "000000", stadium: 54057, country: "GER", rep: 80, fanBase: 6979879, currentBudget: 59164680 },
  { id: 10, name: "Weser Bremen", tier: 1, baseOvr: 79, color: "1b7c3d", stadium: 42100, country: "GER", rep: 80, fanBase: 5545039, currentBudget: 59164680 },
  { id: 13, name: "FSV Mainz 05", tier: 1, baseOvr: 79, color: "c8102e", stadium: 33305, country: "GER", rep: 80, fanBase: 4489639, currentBudget: 59164680 },
  { id: 11, name: "Schwaben Augsburg", tier: 1, baseOvr: 79, color: "ba121b", stadium: 30660, country: "GER", rep: 80, fanBase: 4172239, currentBudget: 59164680 },
  { id: 22, name: "Hanseat Hamburg", tier: 1, baseOvr: 78, color: "0053a0", stadium: 57000, country: "GER", rep: 79, fanBase: 7314552, currentBudget: 56943360 },
  { id: 19, name: "Domstadt Köln", tier: 1, baseOvr: 78, color: "e2001a", stadium: 50000, country: "GER", rep: 79, fanBase: 6474552, currentBudget: 56943360 },
  { id: 15, name: "Eisern Köpenick", tier: 1, baseOvr: 78, color: "d4001a", stadium: 22012, country: "GER", rep: 79, fanBase: 3115992, currentBudget: 56943360 },
  { id: 28, name: "Knappen Gelsenkirchen", tier: 1, baseOvr: 76, color: "004b93", stadium: 62271, country: "GER", rep: 77, fanBase: 7911496, currentBudget: 52677120 },
  { id: 25, name: "SC Paderborn 07", tier: 1, baseOvr: 76, color: "005ca9", stadium: 15000, country: "GER", rep: 77, fanBase: 2238976, currentBudget: 52677120 },
  { id: 12, name: "SV Wolfsburg", tier: 1, baseOvr: 75, color: "65b32e", stadium: 30000, country: "GER", rep: 76, fanBase: 4021875, currentBudget: 50625000 },

  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  { id: 16, name: "SC Bochum 1848", tier: 2, baseOvr: 75, color: "005ca9", stadium: 26000, country: "GER", rep: 74, fanBase: 2125125, currentBudget: 17718750 },
  { id: 9, name: "Ostalb Heidenheim", tier: 2, baseOvr: 75, color: "e2001a", stadium: 15000, country: "GER", rep: 74, fanBase: 1333125, currentBudget: 17718750 },
  { id: 29, name: "SV Spiesen-Elversberg", tier: 2, baseOvr: 75, color: "000000", stadium: 10000, country: "GER", rep: 74, fanBase: 973125, currentBudget: 17718750 },
  { id: 23, name: "Baden Karlsruhe", tier: 2, baseOvr: 74, color: "0053a0", stadium: 34302, country: "GER", rep: 73, fanBase: 2712864, currentBudget: 17020080 },
  { id: 17, name: "Kiez Hamburg St. Pauli", tier: 2, baseOvr: 74, color: "5f3319", stadium: 29546, country: "GER", rep: 73, fanBase: 2370352, currentBudget: 17020080 },
  { id: 20, name: "Lilien Darmstadt", tier: 2, baseOvr: 74, color: "004b9c", stadium: 17650, country: "GER", rep: 73, fanBase: 1513944, currentBudget: 17020080 },
  { id: 18, name: "Förde Kiel", tier: 2, baseOvr: 74, color: "0054a6", stadium: 15034, country: "GER", rep: 73, fanBase: 1325592, currentBudget: 17020080 },
  { id: 27, name: "Spree Berlin West", tier: 2, baseOvr: 73, color: "00529c", stadium: 74667, country: "GER", rep: 72, fanBase: 5609464, currentBudget: 16338576 },
  { id: 24, name: "SV Hannover 96", tier: 2, baseOvr: 73, color: "15803d", stadium: 49000, country: "GER", rep: 72, fanBase: 3761464, currentBudget: 16338576 },
  { id: 26, name: "Kleeblatt Fürth", tier: 2, baseOvr: 73, color: "009640", stadium: 16626, country: "GER", rep: 72, fanBase: 1430485, currentBudget: 16338576 },
  { id: 30, name: "Franken Nürnberg", tier: 2, baseOvr: 72, color: "a6192e", stadium: 50000, country: "GER", rep: 71, fanBase: 3823968, currentBudget: 15676416 },
  { id: 31, name: "Pfalz Kaiserslautern", tier: 2, baseOvr: 72, color: "e30613", stadium: 49780, country: "GER", rep: 71, fanBase: 3808128, currentBudget: 15676416 },
  { id: 32, name: "FC Elbe Magdeburg", tier: 2, baseOvr: 71, color: "0054a6", stadium: 30098, country: "GER", rep: 70, fanBase: 2381832, currentBudget: 15032544 },
  { id: 33, name: "Löwen Braunschweig", tier: 2, baseOvr: 71, color: "f2a900", stadium: 23325, country: "GER", rep: 70, fanBase: 1894176, currentBudget: 15032544 },
  { id: 40, name: "VfB Osnabrück", tier: 2, baseOvr: 70, color: "6b2d88", stadium: 16100, country: "GER", rep: 69, fanBase: 1365000, currentBudget: 14406000 },
  { id: 43, name: "Saxonia Dresden", tier: 2, baseOvr: 69, color: "f2a900", stadium: 32066, country: "GER", rep: 68, fanBase: 2505877, currentBudget: 13797681 },
  { id: 46, name: "Westphalia Bielefeld", tier: 2, baseOvr: 68, color: "0054a6", stadium: 26515, country: "GER", rep: 67, fanBase: 2097723, currentBudget: 13207392 },
  { id: 47, name: "Lausitz Cottbus", tier: 2, baseOvr: 68, color: "e30613", stadium: 22528, country: "GER", rep: 67, fanBase: 1810659, currentBudget: 13207392 },

  // ==========================================
  // TIER 3 (18 Clubs)
  // ==========================================
  { id: 21, name: "Rhine Düsseldorf 95", tier: 3, baseOvr: 67, color: "e30613", stadium: 54600, country: "GER", rep: 64, fanBase: 2466986, currentBudget: 4420360 },
  { id: 36, name: "Donau Regensburg", tier: 3, baseOvr: 67, color: "e30613", stadium: 15210, country: "GER", rep: 64, fanBase: 765275, currentBudget: 4420360 },
  { id: 35, name: "Prussia Münster 06", tier: 3, baseOvr: 67, color: "007a3d", stadium: 14300, country: "GER", rep: 64, fanBase: 725966, currentBudget: 4420360 },
  { id: 41, name: "Ostsee Rostock", tier: 3, baseOvr: 66, color: "0053a0", stadium: 29000, country: "GER", rep: 63, fanBase: 1356290, currentBudget: 4225381 },
  { id: 44, name: "R-W Essen Bergeborbeck", tier: 3, baseOvr: 66, color: "e30613", stadium: 20650, country: "GER", rep: 63, fanBase: 995490, currentBudget: 4225381 },
  { id: 42, name: "Taunus Wiesbaden", tier: 3, baseOvr: 66, color: "e30613", stadium: 15295, country: "GER", rep: 63, fanBase: 764090, currentBudget: 4225381 },
  { id: 48, name: "Kaiserstadt Aachen", tier: 3, baseOvr: 65, color: "f2a900", stadium: 32960, country: "GER", rep: 62, fanBase: 1522731, currentBudget: 4035903 },
  { id: 52, name: "Neckar Mannheim", tier: 3, baseOvr: 65, color: "0054a6", stadium: 24302, country: "GER", rep: 62, fanBase: 1148671, currentBudget: 4035903 },
  { id: 55, name: "Saarland Saarbrücken", tier: 3, baseOvr: 65, color: "0054a6", stadium: 16003, country: "GER", rep: 62, fanBase: 790203, currentBudget: 4035903 },
  { id: 51, name: "Schanzer Ingolstadt", tier: 3, baseOvr: 65, color: "e30613", stadium: 15200, country: "GER", rep: 62, fanBase: 755513, currentBudget: 4035903 },
  { id: 39, name: "VfL Stuttgart II", tier: 3, baseOvr: 64, color: "e32219", stadium: 10001, country: "GER", rep: 61, fanBase: 526415, currentBudget: 3852038 },
  { id: 54, name: "Rechtsrheinisch Köln", tier: 3, baseOvr: 64, color: "e30613", stadium: 10001, country: "GER", rep: 61, fanBase: 526415, currentBudget: 3852038 },
  { id: 37, name: "Prussia Dortmund II", tier: 3, baseOvr: 64, color: "fde100", stadium: 9999, country: "GER", rep: 61, fanBase: 526328, currentBudget: 3852038 },
  { id: 53, name: "Post Verl", tier: 3, baseOvr: 64, color: "000000", stadium: 5153, country: "GER", rep: 61, fanBase: 316982, currentBudget: 3852038 },
  { id: 61, name: "Kernberge Jena", tier: 3, baseOvr: 63, color: "2563eb", stadium: 12990, country: "GER", rep: 60, fanBase: 651213, currentBudget: 3673752 },
  { id: 74, name: "SC Frankfurt Bornheim", tier: 3, baseOvr: 63, color: "1d4ed8", stadium: 12542, country: "GER", rep: 60, fanBase: 631853, currentBudget: 3673752 },
  { id: 57, name: "Südstadt Köln", tier: 3, baseOvr: 63, color: "dc2626", stadium: 11748, country: "GER", rep: 60, fanBase: 597545, currentBudget: 3673752 },
  { id: 38, name: "SV Hannover 96 II", tier: 3, baseOvr: 63, color: "15803d", stadium: 5001, country: "GER", rep: 60, fanBase: 306076, currentBudget: 3673752 },

  // ==========================================
  // TIER 4 (18 Clubs)
  // ==========================================
  { id: 84, name: "Bodden Greifswald", tier: 4, baseOvr: 62, color: "dc2626", stadium: 4990, country: "GER", rep: 57, fanBase: 180816, currentBudget: 1225828 },
  { id: 90, name: "Chemie Halle", tier: 4, baseOvr: 61, color: "dc2626", stadium: 15057, country: "GER", rep: 56, fanBase: 439308, currentBudget: 1167733 },
  { id: 92, name: "Zebra Duisburg", tier: 4, baseOvr: 57, color: "2563eb", stadium: 31500, country: "GER", rep: 51, fanBase: 856481, currentBudget: 953801 },
  { id: 60, name: "Bergisch Wuppertal", tier: 4, baseOvr: 57, color: "dc2626", stadium: 23067, country: "GER", rep: 51, fanBase: 637255, currentBudget: 953801 },
  { id: 65, name: "Main Offenbach", tier: 4, baseOvr: 57, color: "dc2626", stadium: 20500, country: "GER", rep: 51, fanBase: 570535, currentBudget: 953801 },
  { id: 34, name: "Münsterstadt Ulm", tier: 4, baseOvr: 57, color: "000000", stadium: 17000, country: "GER", rep: 51, fanBase: 479535, currentBudget: 953801 },
  { id: 50, name: "Erzgebirge Aue", tier: 4, baseOvr: 57, color: "6b2d88", stadium: 16485, country: "GER", rep: 51, fanBase: 466145, currentBudget: 953801 },
  { id: 49, name: "Hardtwald Sandhausen", tier: 4, baseOvr: 57, color: "000000", stadium: 15414, country: "GER", rep: 51, fanBase: 438303, currentBudget: 953801 },
  { id: 56, name: "Vorstadt Unterhaching", tier: 4, baseOvr: 57, color: "e30613", stadium: 15053, country: "GER", rep: 51, fanBase: 428917, currentBudget: 953801 },
  { id: 45, name: "München Sechzig", tier: 4, baseOvr: 57, color: "0091d3", stadium: 15000, country: "GER", rep: 51, fanBase: 427535, currentBudget: 953801 },
  { id: 79, name: "Altstadt Bayreuth", tier: 4, baseOvr: 56, color: "eab308", stadium: 21500, country: "GER", rep: 50, fanBase: 595217, currentBudget: 904455 },
  { id: 85, name: "Teltow Altglienicke", tier: 4, baseOvr: 56, color: "1d4ed8", stadium: 19708, country: "GER", rep: 50, fanBase: 548625, currentBudget: 904455 },
  { id: 68, name: "Kanal Oberhausen", tier: 4, baseOvr: 56, color: "dc2626", stadium: 17165, country: "GER", rep: 50, fanBase: 482505, currentBudget: 904455 },
  { id: 75, name: "Saarpfalz Homburg", tier: 4, baseOvr: 56, color: "15803d", stadium: 16488, country: "GER", rep: 50, fanBase: 464903, currentBudget: 904455 },
  { id: 115, name: "Bavaria München II", tier: 4, baseOvr: 56, color: "dc2626", stadium: 15000, country: "GER", rep: 50, fanBase: 426217, currentBudget: 904455 },
  { id: 94, name: "Mainfranken Würzburg", tier: 4, baseOvr: 56, color: "dc2626", stadium: 13090, country: "GER", rep: 50, fanBase: 376557, currentBudget: 904455 },
  { id: 62, name: "Dampflok Leipzig", tier: 4, baseOvr: 56, color: "eab308", stadium: 12321, country: "GER", rep: 50, fanBase: 356563, currentBudget: 904455 },
  { id: 93, name: "Trave Lübeck", tier: 4, baseOvr: 56, color: "15803d", stadium: 10434, country: "GER", rep: 50, fanBase: 307481, currentBudget: 904455 },

  // ==========================================
  // TIER 5 (18 Clubs)
  // ==========================================
  { id: 70, name: "Weinrot Hohenschönhausen", tier: 5, baseOvr: 56, color: "b91c1c", stadium: 10000, country: "GER", rep: 48, fanBase: 178278, currentBudget: 316559 },
  { id: 58, name: "Münsterland Bocholt", tier: 5, baseOvr: 56, color: "000000", stadium: 3276, country: "GER", rep: 48, fanBase: 73789, currentBudget: 316559 },
  { id: 82, name: "Wiehengebirge Rödinghausen", tier: 5, baseOvr: 56, color: "15803d", stadium: 3140, country: "GER", rep: 48, fanBase: 71673, currentBudget: 316559 },
  { id: 64, name: "Himmelblau Chemnitz", tier: 5, baseOvr: 56, color: "38bdf8", stadium: 15000, country: "GER", rep: 48, fanBase: 256038, currentBudget: 316559 },
  { id: 76, name: "Nordhessen Kassel", tier: 5, baseOvr: 55, color: "dc2626", stadium: 18737, country: "GER", rep: 47, fanBase: 312891, currentBudget: 299834 },
  { id: 69, name: "Emsland Meppen", tier: 5, baseOvr: 55, color: "1d4ed8", stadium: 13696, country: "GER", rep: 47, fanBase: 234503, currentBudget: 299834 },
  { id: 66, name: "Filmstadt Babelsberg", tier: 5, baseOvr: 55, color: "1d4ed8", stadium: 10499, country: "GER", rep: 47, fanBase: 184786, currentBudget: 299834 },
  { id: 63, name: "Westsachsen Zwickau", tier: 5, baseOvr: 55, color: "dc2626", stadium: 10134, country: "GER", rep: 47, fanBase: 179110, currentBudget: 299834 },
  { id: 78, name: "Salzach Burghausen", tier: 5, baseOvr: 55, color: "000000", stadium: 10000, country: "GER", rep: 47, fanBase: 177026, currentBudget: 299834 },
  { id: 112, name: "FSV Mainz 05 II", tier: 5, baseOvr: 55, color: "dc2626", stadium: 7378, country: "GER", rep: 47, fanBase: 136253, currentBudget: 299834 },
  { id: 95, name: "SV Leutzsch-Leipzig", tier: 5, baseOvr: 55, color: "15803d", stadium: 4999, country: "GER", rep: 47, fanBase: 99260, currentBudget: 299834 },
  { id: 59, name: "Haiger Steinbach", tier: 5, baseOvr: 55, color: "dc2626", stadium: 4990, country: "GER", rep: 47, fanBase: 99120, currentBudget: 299834 },
  { id: 80, name: "Huthgarten Vilzing", tier: 5, baseOvr: 55, color: "eab308", stadium: 3480, country: "GER", rep: 47, fanBase: 75640, currentBudget: 299834 },
  { id: 113, name: "Concordia Frankfurt II", tier: 5, baseOvr: 55, color: "000000", stadium: 2030, country: "GER", rep: 47, fanBase: 53093, currentBudget: 299834 },
  { id: 100, name: "Trave Lübeck II", tier: 5, baseOvr: 55, color: "1d4ed8", stadium: 1500, country: "GER", rep: 47, fanBase: 44853, currentBudget: 299834 },
  { id: 114, name: "Unterfranken Schweinfurt", tier: 5, baseOvr: 54, color: "15803d", stadium: 15060, country: "GER", rep: 46, fanBase: 254625, currentBudget: 283707 },
  { id: 81, name: "München Sechzig II", tier: 5, baseOvr: 54, color: "dc2626", stadium: 15000, country: "GER", rep: 46, fanBase: 253692, currentBudget: 283707 },
  { id: 77, name: "Kocher-Jagst Aalen", tier: 5, baseOvr: 54, color: "000000", stadium: 14500, country: "GER", rep: 46, fanBase: 245917, currentBudget: 283707 },

  // ==========================================
  // TIER 6 (18 Clubs)
  // ==========================================
  { id: 67, name: "Heidewald Gütersloh", tier: 6, baseOvr: 54, color: "059669", stadium: 12500, country: "GER", rep: 44, fanBase: 128854, currentBudget: 99297 },
  { id: 106, name: "Prussia Mönchengladbach II", tier: 6, baseOvr: 54, color: "000000", stadium: 10000, country: "GER", rep: 44, fanBase: 105541, currentBudget: 99297 },
  { id: 117, name: "Franken Nürnberg II", tier: 6, baseOvr: 54, color: "b91c1c", stadium: 7000, country: "GER", rep: 44, fanBase: 77566, currentBudget: 99297 },
  { id: 83, name: "Rur Düren", tier: 6, baseOvr: 54, color: "1d4ed8", stadium: 6000, country: "GER", rep: 44, fanBase: 68241, currentBudget: 99297 },
  { id: 105, name: "Domstadt Köln II", tier: 6, baseOvr: 54, color: "dc2626", stadium: 5400, country: "GER", rep: 44, fanBase: 62646, currentBudget: 99297 },
  { id: 99, name: "Spree Berlin West II", tier: 6, baseOvr: 54, color: "1d4ed8", stadium: 5400, country: "GER", rep: 44, fanBase: 62646, currentBudget: 99297 },
  { id: 111, name: "Barockstadt Fulda", tier: 6, baseOvr: 54, color: "dc2626", stadium: 5000, country: "GER", rep: 44, fanBase: 58916, currentBudget: 99297 },
  { id: 102, name: "Teutonia Ottensen", tier: 6, baseOvr: 54, color: "000000", stadium: 5000, country: "GER", rep: 44, fanBase: 58916, currentBudget: 99297 },
  { id: 96, name: "Lichterfelde Berlin", tier: 6, baseOvr: 54, color: "38bdf8", stadium: 4300, country: "GER", rep: 44, fanBase: 52388, currentBudget: 99297 },
  { id: 73, name: "Wasen Freiberg", tier: 6, baseOvr: 54, color: "1d4ed8", stadium: 4000, country: "GER", rep: 44, fanBase: 49591, currentBudget: 99297 },
  { id: 101, name: "Kehdingen Drochtersen", tier: 6, baseOvr: 54, color: "dc2626", stadium: 3000, country: "GER", rep: 44, fanBase: 40266, currentBudget: 99297 },
  { id: 107, name: "Knappen Gelsenkirchen II", tier: 6, baseOvr: 54, color: "1d4ed8", stadium: 3000, country: "GER", rep: 44, fanBase: 40266, currentBudget: 99297 },
  { id: 88, name: "Weiche Flensburg", tier: 6, baseOvr: 54, color: "dc2626", stadium: 2500, country: "GER", rep: 44, fanBase: 35603, currentBudget: 99297 },
  { id: 91, name: "FC Elbe Magdeburg II", tier: 6, baseOvr: 54, color: "2563eb", stadium: 1500, country: "GER", rep: 44, fanBase: 26278, currentBudget: 99297 },
  { id: 109, name: "SC Paderborn 07 II", tier: 6, baseOvr: 53, color: "000000", stadium: 15000, country: "GER", rep: 43, fanBase: 151433, currentBudget: 93892 },
  { id: 71, name: "Iller Illertissen", tier: 6, baseOvr: 53, color: "2563eb", stadium: 10000, country: "GER", rep: 43, fanBase: 104808, currentBudget: 93892 },
  { id: 108, name: "Rhine Düsseldorf II", tier: 6, baseOvr: 53, color: "dc2626", stadium: 7200, country: "GER", rep: 43, fanBase: 78698, currentBudget: 93892 },
  { id: 87, name: "Oldenburger Lohne", tier: 6, baseOvr: 53, color: "2563eb", stadium: 6000, country: "GER", rep: 43, fanBase: 67508, currentBudget: 93892 },

  // ==========================================
  // TIER 7 (18 Clubs)
  // ==========================================
  { id: 103, name: "Moorbek Norderstedt", tier: 7, baseOvr: 53, color: "dc2626", stadium: 5068, country: "GER", rep: 41, fanBase: 35293, currentBudget: 32862 },
  { id: 110, name: "Kurpfalz Walldorf", tier: 7, baseOvr: 53, color: "1d4ed8", stadium: 5000, country: "GER", rep: 41, fanBase: 34913, currentBudget: 32862 },
  { id: 118, name: "Grabfeld Aubstadt", tier: 7, baseOvr: 53, color: "dc2626", stadium: 3000, country: "GER", rep: 41, fanBase: 23721, currentBudget: 32862 },
  { id: 104, name: "Ems Wiedenbrück", tier: 7, baseOvr: 53, color: "000000", stadium: 2550, country: "GER", rep: 41, fanBase: 21203, currentBudget: 32862 },
  { id: 97, name: "Kohlenrevier Meuselwitz", tier: 7, baseOvr: 52, color: "dc2626", stadium: 5260, country: "GER", rep: 40, fanBase: 36005, currentBudget: 31038 },
  { id: 121, name: "Rezat Ansbach", tier: 7, baseOvr: 52, color: "15803d", stadium: 5000, country: "GER", rep: 40, fanBase: 34550, currentBudget: 31038 },
  { id: 98, name: "Fläming Luckenwalde", tier: 7, baseOvr: 52, color: "eab308", stadium: 3000, country: "GER", rep: 40, fanBase: 23358, currentBudget: 31038 },
  { id: 116, name: "Schwaben Augsburg II", tier: 7, baseOvr: 52, color: "b91c1c", stadium: 2800, country: "GER", rep: 40, fanBase: 22238, currentBudget: 31038 },
  { id: 119, name: "Hügel Buchbach", tier: 7, baseOvr: 52, color: "dc2626", stadium: 2500, country: "GER", rep: 40, fanBase: 20559, currentBudget: 31038 },
  { id: 89, name: "Ammerland Jeddeloh", tier: 7, baseOvr: 52, color: "1d4ed8", stadium: 2000, country: "GER", rep: 40, fanBase: 17761, currentBudget: 31038 },
  { id: 120, name: "Domreiter Bamberg", tier: 7, baseOvr: 51, color: "1d4ed8", stadium: 5200, country: "GER", rep: 39, fanBase: 35081, currentBudget: 29280 },
  { id: 72, name: "Lesum Bremen Nord", tier: 7, baseOvr: 51, color: "2563eb", stadium: 8000, country: "GER", rep: 39, fanBase: 50749, currentBudget: 29280 },
  { id: 86, name: "Mulde Eilenburg", tier: 7, baseOvr: 51, color: "1d4ed8", stadium: 5600, country: "GER", rep: 39, fanBase: 37319, currentBudget: 29280 },
  { id: 180, name: "Fautenhau Großaspach", tier: 7, baseOvr: 45, color: "dc2626", stadium: 10001, country: "GER", rep: 33, fanBase: 60533, currentBudget: 20117 },
  { id: 151, name: "Atlas Delmenhorst", tier: 7, baseOvr: 45, color: "2563eb", stadium: 6000, country: "GER", rep: 33, fanBase: 36531, currentBudget: 20117 },
  { id: 124, name: "Blau Stuttgart Degerloch", tier: 7, baseOvr: 45, color: "1d4ed8", stadium: 11400, country: "GER", rep: 33, fanBase: 68919, currentBudget: 20117 },
  { id: 160, name: "SC Düsseldorf West", tier: 7, baseOvr: 45, color: "dc2626", stadium: 2000, country: "GER", rep: 33, fanBase: 12547, currentBudget: 20117 },
  { id: 152, name: "Domstadt Hildesheim", tier: 7, baseOvr: 44, color: "dc2626", stadium: 10000, country: "GER", rep: 32, fanBase: 60012, currentBudget: 18809 },

  // ==========================================
  // TIER 8 (18 Clubs)
  // ==========================================
  { id: 169, name: "Horeb Pirmasens", tier: 8, baseOvr: 44, color: "2563eb", stadium: 10000, country: "GER", rep: 30, fanBase: 35940, currentBudget: 6583 },
  { id: 125, name: "Elbvorort Altona", tier: 8, baseOvr: 44, color: "dc2626", stadium: 5000, country: "GER", rep: 30, fanBase: 19153, currentBudget: 6583 },
  { id: 181, name: "Hohenstaufen Göppingen", tier: 8, baseOvr: 44, color: "dc2626", stadium: 4500, country: "GER", rep: 30, fanBase: 17474, currentBudget: 6583 },
  { id: 174, name: "Kahltal Alzenau", tier: 8, baseOvr: 44, color: "2563eb", stadium: 3000, country: "GER", rep: 30, fanBase: 12438, currentBudget: 6583 },
  { id: 140, name: "Ost-Berlin Lichtenberg", tier: 8, baseOvr: 44, color: "dc2626", stadium: 2500, country: "GER", rep: 30, fanBase: 10760, currentBudget: 6583 },
  { id: 188, name: "Altmühl Eichstätt", tier: 8, baseOvr: 44, color: "15803d", stadium: 2000, country: "GER", rep: 30, fanBase: 9081, currentBudget: 6583 },
  { id: 168, name: "Prussia Münster II", tier: 8, baseOvr: 44, color: "15803d", stadium: 2000, country: "GER", rep: 30, fanBase: 9081, currentBudget: 6583 },
  { id: 137, name: "Mosel Trier", tier: 8, baseOvr: 43, color: "2563eb", stadium: 10256, country: "GER", rep: 29, fanBase: 36622, currentBudget: 6144 },
  { id: 128, name: "Schängel Koblenz", tier: 8, baseOvr: 43, color: "1d4ed8", stadium: 9500, country: "GER", rep: 29, fanBase: 34083, currentBudget: 6144 },
  { id: 159, name: "Hamburg Eimsbüttel TV", tier: 8, baseOvr: 43, color: "eab308", stadium: 8000, country: "GER", rep: 29, fanBase: 29047, currentBudget: 6144 },
  { id: 123, name: "Altmark Stendal", tier: 8, baseOvr: 43, color: "dc2626", stadium: 6000, country: "GER", rep: 29, fanBase: 22332, currentBudget: 6144 },
  { id: 185, name: "Augsburg Violett", tier: 8, baseOvr: 43, color: "9333ea", stadium: 5000, country: "GER", rep: 29, fanBase: 18974, currentBudget: 6144 },
  { id: 182, name: "Enz Pforzheim", tier: 8, baseOvr: 43, color: "2563eb", stadium: 4500, country: "GER", rep: 29, fanBase: 17295, currentBudget: 6144 },
  { id: 150, name: "Hase Bersenbrück", tier: 8, baseOvr: 43, color: "dc2626", stadium: 3000, country: "GER", rep: 29, fanBase: 12259, currentBudget: 6144 },
  { id: 172, name: "Mainz Gonsenheim SV", tier: 8, baseOvr: 43, color: "000000", stadium: 2000, country: "GER", rep: 29, fanBase: 8902, currentBudget: 6144 },
  { id: 139, name: "Vogtland Plauen", tier: 8, baseOvr: 43, color: "eab308", stadium: 10500, country: "GER", rep: 29, fanBase: 37441, currentBudget: 6144 },
  { id: 122, name: "Havel Brandenburg", tier: 8, baseOvr: 42, color: "1d4ed8", stadium: 15500, country: "GER", rep: 28, fanBase: 53139, currentBudget: 5725 },
  { id: 132, name: "Bundesstadt Bonn", tier: 8, baseOvr: 42, color: "0284c7", stadium: 10164, country: "GER", rep: 28, fanBase: 35227, currentBudget: 5725 },

  // ==========================================
  // TIER 9 (18 Clubs)
  // ==========================================
  { id: 145, name: "Oberlausitz Bischofswerda", tier: 9, baseOvr: 40, color: "2563eb", stadium: 10000, country: "GER", rep: 24, fanBase: 21191, currentBudget: 1735 },
  { id: 175, name: "Bauna Baunatal", tier: 9, baseOvr: 42, color: "dc2626", stadium: 8000, country: "GER", rep: 26, fanBase: 17409, currentBudget: 2003 },
  { id: 143, name: "Göltzschtal Auerbach", tier: 9, baseOvr: 42, color: "eab308", stadium: 3000, country: "GER", rep: 26, fanBase: 7331, currentBudget: 2003 },
  { id: 187, name: "Dachau Pipinsried", tier: 9, baseOvr: 42, color: "eab308", stadium: 2500, country: "GER", rep: 26, fanBase: 6323, currentBudget: 2003 },
  { id: 148, name: "Förde Mürwik", tier: 9, baseOvr: 42, color: "1d4ed8", stadium: 2000, country: "GER", rep: 26, fanBase: 5315, currentBudget: 2003 },
  { id: 153, name: "Kreuzheide Wolfsburg", tier: 9, baseOvr: 42, color: "1d4ed8", stadium: 2000, country: "GER", rep: 26, fanBase: 5315, currentBudget: 2003 },
  { id: 166, name: "Dortmund West 08", tier: 9, baseOvr: 42, color: "eab308", stadium: 2000, country: "GER", rep: 26, fanBase: 5315, currentBudget: 2003 },
  { id: 129, name: "VfR Mannheim Ost", tier: 9, baseOvr: 41, color: "000000", stadium: 12000, country: "GER", rep: 25, fanBase: 25336, currentBudget: 1864 },
  { id: 138, name: "Vorharz Halberstadt", tier: 9, baseOvr: 41, color: "dc2626", stadium: 5000, country: "GER", rep: 25, fanBase: 11227, currentBudget: 1864 },
  { id: 147, name: "Rot-Schwarz Hasseldieksdamm", tier: 9, baseOvr: 41, color: "dc2626", stadium: 3000, country: "GER", rep: 25, fanBase: 7196, currentBudget: 1864 },
  { id: 133, name: "Nibelungen Worms", tier: 9, baseOvr: 40, color: "dc2626", stadium: 5724, country: "GER", rep: 24, fanBase: 12569, currentBudget: 1735 },
  { id: 142, name: "Havelland Rathenow", tier: 9, baseOvr: 40, color: "dc2626", stadium: 5000, country: "GER", rep: 24, fanBase: 11109, currentBudget: 1735 },
  { id: 149, name: "Börde Heeslingen", tier: 9, baseOvr: 40, color: "000000", stadium: 4000, country: "GER", rep: 24, fanBase: 9093, currentBudget: 1735 },
  { id: 158, name: "Hamburg Niendorfer TSV", tier: 9, baseOvr: 40, color: "1d4ed8", stadium: 2000, country: "GER", rep: 24, fanBase: 5062, currentBudget: 1735 },
  { id: 136, name: "Ellerbach Neunkirchen", tier: 9, baseOvr: 39, color: "000000", stadium: 21600, country: "GER", rep: 22, fanBase: 44365, currentBudget: 1605 },
  { id: 154, name: "Bischofshol Hannover", tier: 9, baseOvr: 39, color: "15803d", stadium: 18000, country: "GER", rep: 22, fanBase: 37109, currentBudget: 1605 },
  { id: 144, name: "Spree Bautzen", tier: 9, baseOvr: 39, color: "000000", stadium: 5000, country: "GER", rep: 22, fanBase: 10906, currentBudget: 1605 },
  { id: 131, name: "Panoramastadt Nöttingen", tier: 9, baseOvr: 39, color: "9333ea", stadium: 3800, country: "GER", rep: 22, fanBase: 8487, currentBudget: 1605 },

  // ==========================================
  // TIER 10 (18 Clubs)
  // ==========================================
  { id: 141, name: "Zentrum Berlin Mitte", tier: 10, baseOvr: 39, color: "2563eb", stadium: 3000, country: "GER", rep: 20, fanBase: 4220, currentBudget: 561 },
  { id: 135, name: "Schwarz-Weiß Essen Uhlenkrug", tier: 10, baseOvr: 38, color: "000000", stadium: 9950, country: "GER", rep: 19, fanBase: 12563, currentBudget: 522 },
  { id: 146, name: "Giebichenstein Halle", tier: 10, baseOvr: 38, color: "dc2626", stadium: 3000, country: "GER", rep: 19, fanBase: 4175, currentBudget: 522 },
  { id: 130, name: "Grotenburg Krefeld", tier: 10, baseOvr: 23, color: "1d4ed8", stadium: 34500, country: "GER", rep: 10, fanBase: 41655, currentBudget: 115 },
  { id: 1087, name: "Leimbach Siegen", tier: 10, baseOvr: 21, color: "dc2626", stadium: 18500, country: "GER", rep: 10, fanBase: 22359, currentBudget: 87 },
  { id: 1093, name: "Südharz Nordhausen", tier: 10, baseOvr: 21, color: "2563eb", stadium: 8000, country: "GER", rep: 10, fanBase: 9686, currentBudget: 87 },
  { id: 162, name: "Schetters Busch Schonnebeck", tier: 10, baseOvr: 21, color: "15803d", stadium: 2000, country: "GER", rep: 10, fanBase: 2444, currentBudget: 87 },
  { id: 163, name: "Itter Hilden", tier: 10, baseOvr: 21, color: "000000", stadium: 2000, country: "GER", rep: 10, fanBase: 2444, currentBudget: 87 },
  { id: 164, name: "Rheinufer Baumberg", tier: 10, baseOvr: 21, color: "1d4ed8", stadium: 2000, country: "GER", rep: 10, fanBase: 2444, currentBudget: 87 },
  { id: 134, name: "Lohmühle Wattenscheid 09", tier: 10, baseOvr: 20, color: "000000", stadium: 16233, country: "GER", rep: 10, fanBase: 19614, currentBudget: 75 },
  { id: 1092, name: "Kinzig Offenburg", tier: 10, baseOvr: 20, color: "dc2626", stadium: 10000, country: "GER", rep: 10, fanBase: 12093, currentBudget: 75 },
  { id: 155, name: "Seestadt Bremerhaven", tier: 10, baseOvr: 20, color: "dc2626", stadium: 10000, country: "GER", rep: 10, fanBase: 12093, currentBudget: 75 },
  { id: 161, name: "Angerland Ratingen", tier: 10, baseOvr: 20, color: "2563eb", stadium: 3000, country: "GER", rep: 10, fanBase: 3644, currentBudget: 75 },
  { id: 165, name: "Lippeaue Schermbeck", tier: 10, baseOvr: 20, color: "dc2626", stadium: 3000, country: "GER", rep: 10, fanBase: 3644, currentBudget: 75 },
  { id: 157, name: "Nordheide Buchholz", tier: 10, baseOvr: 20, color: "000000", stadium: 2500, country: "GER", rep: 10, fanBase: 3040, currentBudget: 75 },
  { id: 156, name: "Vegesack Bremen", tier: 10, baseOvr: 20, color: "2563eb", stadium: 2000, country: "GER", rep: 10, fanBase: 2436, currentBudget: 75 },
  { id: 167, name: "Sauerland Finnentrop", tier: 10, baseOvr: 20, color: "15803d", stadium: 1500, country: "GER", rep: 10, fanBase: 1833, currentBudget: 75 },
  { id: 1089, name: "Poststadion Moabit", tier: 10, baseOvr: 19, color: "4b2e83", stadium: 11500, country: "GER", rep: 10, fanBase: 13869, currentBudget: 65 },

  // ==========================================
  // TIER 11 (18 Clubs)
  // ==========================================
  { id: 126, name: "Schloss Charlottenburg", tier: 11, baseOvr: 19, color: "9333ea", stadium: 10490, country: "GER", rep: 10, fanBase: 7642, currentBudget: 22 },
  { id: 127, name: "Achalm Reutlingen", tier: 11, baseOvr: 14, color: "dc2626", stadium: 11468, country: "GER", rep: 10, fanBase: 8312, currentBudget: 9 },
  { id: 186, name: "Allgäu Kottern", tier: 11, baseOvr: 13, color: "000000", stadium: 3000, country: "GER", rep: 10, fanBase: 2189, currentBudget: 7 },
  { id: 184, name: "Lech Landsberg", tier: 11, baseOvr: 13, color: "dc2626", stadium: 2000, country: "GER", rep: 10, fanBase: 1464, currentBudget: 7 },
  { id: 189, name: "Regnitz Erlangen", tier: 11, baseOvr: 13, color: "dc2626", stadium: 2000, country: "GER", rep: 10, fanBase: 1464, currentBudget: 7 },
  { id: 171, name: "Vorderpfalz Mechtersheim", tier: 11, baseOvr: 12, color: "1d4ed8", stadium: 2500, country: "GER", rep: 10, fanBase: 1823, currentBudget: 5 },
  { id: 170, name: "Rhein Engers Neuwied", tier: 11, baseOvr: 12, color: "dc2626", stadium: 2000, country: "GER", rep: 10, fanBase: 1460, currentBudget: 5 },
  { id: 177, name: "Lahn Waldgirmes", tier: 11, baseOvr: 12, color: "dc2626", stadium: 2000, country: "GER", rep: 10, fanBase: 1460, currentBudget: 5 },
  { id: 183, name: "Kraichgau Eppingen", tier: 11, baseOvr: 12, color: "dc2626", stadium: 2000, country: "GER", rep: 10, fanBase: 1460, currentBudget: 5 },
  { id: 173, name: "Alois-Omlor Jägersburg", tier: 11, baseOvr: 12, color: "9333ea", stadium: 1500, country: "GER", rep: 10, fanBase: 1098, currentBudget: 5 },
  { id: 178, name: "Main-Taunus Hattersheim", tier: 11, baseOvr: 12, color: "000000", stadium: 1500, country: "GER", rep: 10, fanBase: 1098, currentBudget: 5 },
  { id: 179, name: "Opieß Fernwald", tier: 11, baseOvr: 12, color: "2563eb", stadium: 1500, country: "GER", rep: 10, fanBase: 1098, currentBudget: 5 },
  { id: 1086, name: "SV Wernigerode", tier: 11, baseOvr: 11, color: "dc2626", stadium: 3000, country: "GER", rep: 10, fanBase: 2185, currentBudget: 4 },
  { id: 1090, name: "Kräuter Vestenbergsgreuth", tier: 11, baseOvr: 11, color: "15803d", stadium: 3000, country: "GER", rep: 10, fanBase: 2185, currentBudget: 4 },
  { id: 1085, name: "Anhalt Dessau", tier: 11, baseOvr: 10, color: "000000", stadium: 5000, country: "GER", rep: 10, fanBase: 3635, currentBudget: 3 },
  { id: 1091, name: "Thüringer Wald Suhl", tier: 11, baseOvr: 10, color: "dc2626", stadium: 5000, country: "GER", rep: 10, fanBase: 3635, currentBudget: 3 },
  { id: 1095, name: "Prussia Magdeburg", tier: 11, baseOvr: 10, color: "ff0000", stadium: 2000, country: "GER", rep: 10, fanBase: 1458, currentBudget: 3 },
  { id: 1096, name: "Illerstadion Memmingen", tier: 11, baseOvr: 9, color: "ff0000", stadium: 5000, country: "GER", rep: 10, fanBase: 3633, currentBudget: 2 }
];

export const ENGLAND_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  {id: 701, name: "Manchester Blue", tier: 1, baseOvr: 96, color: "6cabdd", stadium: 53400, country: "ENG", rep: 89, fanBase: 7066503, currentBudget: 79020360},
  {id: 703, name: "Liverpool Red", tier: 1, baseOvr: 95, color: "c8102e", stadium: 61276, country: "ENG", rep: 88, fanBase: 7989176, currentBudget: 76326720},
  {id: 702, name: "North London Red", tier: 1, baseOvr: 92, color: "ef0107", stadium: 60704, country: "ENG", rep: 88, fanBase: 7920536, currentBudget: 76326720},
  {id: 704, name: "West London Blue", tier: 1, baseOvr: 89, color: "034694", stadium: 40341, country: "ENG", rep: 85, fanBase: 5412707, currentBudget: 68614680},
  {id: 705, name: "Manchester Red", tier: 1, baseOvr: 82, color: "da020e", stadium: 74310, country: "ENG", rep: 84, fanBase: 9468568, currentBudget: 66164160},
  {id: 706, name: "North London White", tier: 1, baseOvr: 82, color: "132257", stadium: 62850, country: "ENG", rep: 84, fanBase: 8093368, currentBudget: 66164160},
  {id: 707, name: "Birmingham Claret", tier: 1, baseOvr: 82, color: "95bfe6", stadium: 42640, country: "ENG", rep: 84, fanBase: 5668168, currentBudget: 66164160},
  {id: 708, name: "Newcastle Black-White", tier: 1, baseOvr: 81, color: "241f20", stadium: 52305, country: "ENG", rep: 83, fanBase: 6808041, currentBudget: 63772920},
  {id: 709, name: "Brighton", tier: 1, baseOvr: 80, color: "0057b8", stadium: 31800, country: "ENG", rep: 82, fanBase: 4328000, currentBudget: 61440000},
  {id: 711, name: "South London Red-Blue", tier: 1, baseOvr: 79, color: "1b458f", stadium: 25486, country: "ENG", rep: 80, fanBase: 3551359, currentBudget: 59164680},
  {id: 714, name: "Liverpool Blue", tier: 1, baseOvr: 78, color: "00369c", stadium: 39572, country: "ENG", rep: 79, fanBase: 5223192, currentBudget: 56943360},
  {id: 712, name: "Fulham", tier: 1, baseOvr: 78, color: "ffffff", stadium: 25700, country: "ENG", rep: 79, fanBase: 3558552, currentBudget: 56943360},
  {id: 713, name: "Brentford", tier: 1, baseOvr: 78, color: "e30613", stadium: 17250, country: "ENG", rep: 79, fanBase: 2544552, currentBudget: 56943360},
  {id: 719, name: "Leicester", tier: 1, baseOvr: 77, color: "0053a0", stadium: 32261, country: "ENG", rep: 78, fanBase: 4327853, currentBudget: 54784080},
  {id: 715, name: "Nottingham", tier: 1, baseOvr: 77, color: "dd0000", stadium: 30445, country: "ENG", rep: 78, fanBase: 4109933, currentBudget: 54784080},
  {id: 716, name: "Bournemouth", tier: 1, baseOvr: 77, color: "da291c", stadium: 11307, country: "ENG", rep: 78, fanBase: 1813373, currentBudget: 54784080},
  {id: 721, name: "Leeds", tier: 1, baseOvr: 76, color: "ffffff", stadium: 37608, country: "ENG", rep: 77, fanBase: 4951936, currentBudget: 52677120},
  {id: 726, name: "Coventry", tier: 1, baseOvr: 75, color: "00a3e0", stadium: 32609, country: "ENG", rep: 76, fanBase: 4334955, currentBudget: 50625000},

  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  {id: 718, name: "Ipswich", tier: 2, baseOvr: 75, color: "0000ff", stadium: 29673, country: "ENG", rep: 74, fanBase: 2389581, currentBudget: 17718750},
  {id: 710, name: "East London Claret", tier: 2, baseOvr: 74, color: "7a263a", stadium: 62500, country: "ENG", rep: 73, fanBase: 4743144, currentBudget: 17020080},
  {id: 717, name: "Wolverhampton", tier: 2, baseOvr: 74, color: "fdb913", stadium: 32050, country: "ENG", rep: 73, fanBase: 2550744, currentBudget: 17020080},
  {id: 731, name: "Hull", tier: 2, baseOvr: 74, color: "f58220", stadium: 25586, country: "ENG", rep: 73, fanBase: 2085336, currentBudget: 17020080},
  {id: 720, name: "Southampton", tier: 2, baseOvr: 73, color: "d1242b", stadium: 32384, country: "ENG", rep: 72, fanBase: 2565064, currentBudget: 16338576},
  {id: 723, name: "Sheffield Red", tier: 2, baseOvr: 73, color: "ee2737", stadium: 32050, country: "ENG", rep: 72, fanBase: 2541016, currentBudget: 16338576},
  {id: 722, name: "Burnley", tier: 2, baseOvr: 73, color: "6c1d45", stadium: 21944, country: "ENG", rep: 72, fanBase: 1813396, currentBudget: 16338576},
  {id: 725, name: "Sunderland", tier: 2, baseOvr: 72, color: "eb172b", stadium: 49000, country: "ENG", rep: 71, fanBase: 3752008, currentBudget: 15676416},
  {id: 727, name: "Middlesbrough", tier: 2, baseOvr: 72, color: "e00000", stadium: 34742, country: "ENG", rep: 71, fanBase: 2725380, currentBudget: 15676416},
  {id: 728, name: "West Bromwich", tier: 2, baseOvr: 72, color: "122244", stadium: 26688, country: "ENG", rep: 71, fanBase: 2145484, currentBudget: 15676416},
  {id: 724, name: "Luton", tier: 2, baseOvr: 72, color: "f78f1e", stadium: 12000, country: "ENG", rep: 71, fanBase: 1087968, currentBudget: 15676416},
  {id: 732, name: "Blackburn", tier: 2, baseOvr: 71, color: "009ee0", stadium: 31367, country: "ENG", rep: 70, fanBase: 2473180, currentBudget: 15032544},
  {id: 737, name: "Birmingham Blue", tier: 2, baseOvr: 71, color: "0000ff", stadium: 29409, country: "ENG", rep: 70, fanBase: 2332204, currentBudget: 15032544},
  {id: 729, name: "Norwich", tier: 2, baseOvr: 71, color: "fff200", stadium: 27244, country: "ENG", rep: 70, fanBase: 2176324, currentBudget: 15032544},
  {id: 730, name: "Watford", tier: 2, baseOvr: 71, color: "fbee23", stadium: 22200, country: "ENG", rep: 70, fanBase: 1813156, currentBudget: 15032544},
  {id: 738, name: "Sheffield Blue", tier: 2, baseOvr: 70, color: "0000ff", stadium: 39732, country: "ENG", rep: 69, fanBase: 3066504, currentBudget: 14406000},
  {id: 741, name: "Derby", tier: 2, baseOvr: 70, color: "ffffff", stadium: 33597, country: "ENG", rep: 69, fanBase: 2624784, currentBudget: 14406000},
  {id: 768, name: "Cardiff", tier: 2, baseOvr: 70, color: "0000ff", stadium: 33280, country: "ENG", rep: 69, fanBase: 2601960, currentBudget: 14406000},

  // ==========================================
  // TIER 3 (18 Clubs)
  // ==========================================
  {id: 735, name: "Stoke", tier: 3, baseOvr: 70, color: "e03a3e", stadium: 30089, country: "ENG", rep: 67, fanBase: 1423324, currentBudget: 5042100},
  {id: 733, name: "Bristol Red", tier: 3, baseOvr: 70, color: "e30613", stadium: 27000, country: "ENG", rep: 67, fanBase: 1289880, currentBudget: 5042100},
  {id: 736, name: "Preston", tier: 3, baseOvr: 70, color: "ffffff", stadium: 23404, country: "ENG", rep: 67, fanBase: 1134532, currentBudget: 5042100},
  {id: 734, name: "Swansea", tier: 3, baseOvr: 70, color: "ffffff", stadium: 21088, country: "ENG", rep: 67, fanBase: 1034441, currentBudget: 5042100},
  {id: 743, name: "Portsmouth", tier: 3, baseOvr: 69, color: "0000ff", stadium: 20620, country: "ENG", rep: 66, fanBase: 1008885, currentBudget: 4829031},
  {id: 744, name: "South Bermondsey", tier: 3, baseOvr: 69, color: "0000ff", stadium: 20146, country: "ENG", rep: 66, fanBase: 988410, currentBudget: 4829031},
  {id: 740, name: "West London Hoops", tier: 3, baseOvr: 69, color: "0000ff", stadium: 18439, country: "ENG", rep: 66, fanBase: 914668, currentBudget: 4829031},
  {id: 739, name: "Plymouth", tier: 3, baseOvr: 69, color: "004d25", stadium: 17904, country: "ENG", rep: 66, fanBase: 891557, currentBudget: 4829031},
  {id: 742, name: "Oxford", tier: 3, baseOvr: 68, color: "f7ec13", stadium: 12500, country: "ENG", rep: 65, fanBase: 653198, currentBudget: 4621932},
  {id: 745, name: "Wrexham", tier: 3, baseOvr: 66, color: "e03a3e", stadium: 12600, country: "ENG", rep: 63, fanBase: 647890, currentBudget: 4225381},
  {id: 746, name: "Huddersfield", tier: 3, baseOvr: 66, color: "0000ff", stadium: 24121, country: "ENG", rep: 63, fanBase: 1145598, currentBudget: 4225381},
  {id: 747, name: "Bolton", tier: 3, baseOvr: 65, color: "ffffff", stadium: 28723, country: "ENG", rep: 62, fanBase: 1339691, currentBudget: 4035903},
  {id: 748, name: "Charlton", tier: 3, baseOvr: 65, color: "e03a3e", stadium: 27111, country: "ENG", rep: 62, fanBase: 1270053, currentBudget: 4035903},
  {id: 749, name: "Barnsley", tier: 3, baseOvr: 65, color: "e03a3e", stadium: 23287, country: "ENG", rep: 62, fanBase: 1104856, currentBudget: 4035903},
  {id: 750, name: "Blackpool", tier: 3, baseOvr: 65, color: "f58220", stadium: 17338, country: "ENG", rep: 62, fanBase: 847855, currentBudget: 4035903},
  {id: 752, name: "Wigan", tier: 3, baseOvr: 64, color: "0000ff", stadium: 25138, country: "ENG", rep: 61, fanBase: 1180332, currentBudget: 3852038},
  {id: 751, name: "Reading", tier: 3, baseOvr: 64, color: "0000ff", stadium: 24161, country: "ENG", rep: 61, fanBase: 1138111, currentBudget: 3852038},
  {id: 753, name: "Peterborough", tier: 3, baseOvr: 64, color: "0000ff", stadium: 15314, country: "ENG", rep: 61, fanBase: 755913, currentBudget: 3852038},

  // ==========================================
  // TIER 4 (18 Clubs)
  // ==========================================
  {id: 754, name: "Rotherham", tier: 4, baseOvr: 64, color: "e03a3e", stadium: 12021, country: "ENG", rep: 59, fanBase: 368205, currentBudget: 1348213},
  {id: 755, name: "Stockport", tier: 4, baseOvr: 64, color: "0000ff", stadium: 10852, country: "ENG", rep: 59, fanBase: 337920, currentBudget: 1348213},
  {id: 756, name: "Lincoln", tier: 4, baseOvr: 63, color: "e03a3e", stadium: 10669, country: "ENG", rep: 58, fanBase: 330541, currentBudget: 1285918},
  {id: 758, name: "Wycombe", tier: 4, baseOvr: 63, color: "0000ff", stadium: 10137, country: "ENG", rep: 58, fanBase: 316752, currentBudget: 1285918},
  {id: 757, name: "Stevenage", tier: 4, baseOvr: 63, color: "e03a3e", stadium: 7800, country: "ENG", rep: 58, fanBase: 256191, currentBudget: 1285918},
  {id: 763, name: "Bristol", tier: 4, baseOvr: 62, color: "0000ff", stadium: 12300, country: "ENG", rep: 57, fanBase: 369871, currentBudget: 1225828},
  {id: 760, name: "Leyton", tier: 4, baseOvr: 62, color: "e03a3e", stadium: 9271, country: "ENG", rep: 57, fanBase: 291357, currentBudget: 1225828},
  {id: 762, name: "Mansfield", tier: 4, baseOvr: 62, color: "f7ec13", stadium: 9186, country: "ENG", rep: 57, fanBase: 289154, currentBudget: 1225828},
  {id: 759, name: "Exeter", tier: 4, baseOvr: 62, color: "e03a3e", stadium: 8720, country: "ENG", rep: 57, fanBase: 277073, currentBudget: 1225828},
  {id: 761, name: "Northampton", tier: 4, baseOvr: 62, color: "6c1d45", stadium: 7798, country: "ENG", rep: 57, fanBase: 253177, currentBudget: 1225828},
  {id: 764, name: "Shrewsbury", tier: 4, baseOvr: 61, color: "0000ff", stadium: 9875, country: "ENG", rep: 56, fanBase: 304986, currentBudget: 1167733},
  {id: 766, name: "Cambridge", tier: 4, baseOvr: 61, color: "f58220", stadium: 8127, country: "ENG", rep: 56, fanBase: 259681, currentBudget: 1167733},
  {id: 765, name: "Burton", tier: 4, baseOvr: 61, color: "f7ec13", stadium: 6912, country: "ENG", rep: 56, fanBase: 228189, currentBudget: 1167733},
  {id: 767, name: "Crawley", tier: 4, baseOvr: 60, color: "e03a3e", stadium: 6134, country: "ENG", rep: 55, fanBase: 205649, currentBudget: 1111584},
  {id: 772, name: "Milton Keynes", tier: 4, baseOvr: 59, color: "ffffff", stadium: 30500, country: "ENG", rep: 53, fanBase: 834921, currentBudget: 1057313},
  {id: 769, name: "Nottingham Black-White", tier: 4, baseOvr: 59, color: "000000", stadium: 19841, country: "ENG", rep: 53, fanBase: 558564, currentBudget: 1057313},
  {id: 775, name: "Bradford", tier: 4, baseOvr: 58, color: "6c1d45", stadium: 25136, country: "ENG", rep: 52, fanBase: 693666, currentBudget: 1004856},
  {id: 774, name: "Doncaster", tier: 4, baseOvr: 58, color: "e03a3e", stadium: 15231, country: "ENG", rep: 52, fanBase: 436952, currentBudget: 1004856},

  // ==========================================
  // TIER 5 (18 Clubs)
  // ==========================================
  {id: 773, name: "Gillingham", tier: 5, baseOvr: 58, color: "0000ff", stadium: 11582, country: "ENG", rep: 50, fanBase: 205367, currentBudget: 351699},
  {id: 776, name: "Chesterfield", tier: 5, baseOvr: 58, color: "0000ff", stadium: 10600, country: "ENG", rep: 50, fanBase: 190085, currentBudget: 351699},
  {id: 771, name: "Wimbledon", tier: 5, baseOvr: 58, color: "0000ff", stadium: 9215, country: "ENG", rep: 50, fanBase: 168532, currentBudget: 351699},
  {id: 770, name: "Salford", tier: 5, baseOvr: 58, color: "e03a3e", stadium: 5108, country: "ENG", rep: 50, fanBase: 104620, currentBudget: 351699},
  {id: 777, name: "Carlisle", tier: 5, baseOvr: 57, color: "0000ff", stadium: 17949, country: "ENG", rep: 49, fanBase: 303153, currentBudget: 333830},
  {id: 779, name: "Birkenhead White", tier: 5, baseOvr: 57, color: "ffffff", stadium: 16789, country: "ENG", rep: 49, fanBase: 285108, currentBudget: 333830},
  {id: 780, name: "Swindon", tier: 5, baseOvr: 57, color: "e03a3e", stadium: 15728, country: "ENG", rep: 49, fanBase: 268603, currentBudget: 333830},
  {id: 778, name: "Burslem White", tier: 5, baseOvr: 57, color: "ffffff", stadium: 15695, country: "ENG", rep: 49, fanBase: 268090, currentBudget: 333830},
  {id: 781, name: "Walsall", tier: 5, baseOvr: 57, color: "e03a3e", stadium: 11300, country: "ENG", rep: 49, fanBase: 199723, currentBudget: 333830},
  {id: 782, name: "Crewe", tier: 5, baseOvr: 56, color: "e03a3e", stadium: 10153, country: "ENG", rep: 48, fanBase: 180665, currentBudget: 316538},
  {id: 783, name: "Cheltenham", tier: 5, baseOvr: 56, color: "e03a3e", stadium: 7066, country: "ENG", rep: 48, fanBase: 132646, currentBudget: 316538},
  {id: 786, name: "Grimsby", tier: 5, baseOvr: 55, color: "000000", stadium: 9052, country: "ENG", rep: 47, fanBase: 162386, currentBudget: 299834},
  {id: 787, name: "Newport", tier: 5, baseOvr: 55, color: "f7ec13", stadium: 7850, country: "ENG", rep: 47, fanBase: 143689, currentBudget: 299834},
  {id: 791, name: "Fleetwood", tier: 5, baseOvr: 55, color: "e03a3e", stadium: 5327, country: "ENG", rep: 47, fanBase: 104443, currentBudget: 299834},
  {id: 785, name: "Barrow", tier: 5, baseOvr: 55, color: "0000ff", stadium: 5045, country: "ENG", rep: 47, fanBase: 100056, currentBudget: 299834},
  {id: 784, name: "Harrogate", tier: 5, baseOvr: 55, color: "f7ec13", stadium: 5000, country: "ENG", rep: 47, fanBase: 99356, currentBudget: 299834},
  {id: 789, name: "Colchester", tier: 5, baseOvr: 54, color: "0000ff", stadium: 10105, country: "ENG", rep: 46, fanBase: 177579, currentBudget: 283707},
  {id: 790, name: "Morecambe", tier: 5, baseOvr: 54, color: "e03a3e", stadium: 6474, country: "ENG", rep: 46, fanBase: 121111, currentBudget: 283707},

  // ==========================================
  // TIER 6 (18 Clubs)
  // ==========================================
  {id: 788, name: "Accrington", tier: 6, baseOvr: 54, color: "e03a3e", stadium: 5450, country: "ENG", rep: 44, fanBase: 63080, currentBudget: 99297},
  {id: 792, name: "Bromley", tier: 6, baseOvr: 53, color: "ffffff", stadium: 5150, country: "ENG", rep: 43, fanBase: 59585, currentBudget: 93892},
  {id: 793, name: "Oldham", tier: 6, baseOvr: 52, color: "0000ff", stadium: 13559, country: "ENG", rep: 42, fanBase: 137351, currentBudget: 88686},
  {id: 816, name: "Richmond", tier: 6, baseOvr: 52, color: "0000ff", stadium: 12000, country: "ENG", rep: 42, fanBase: 122851, currentBudget: 88686},
  {id: 796, name: "Southend", tier: 6, baseOvr: 51, color: "0000ff", stadium: 12392, country: "ENG", rep: 41, fanBase: 125866, currentBudget: 83669},
  {id: 794, name: "Rochdale", tier: 6, baseOvr: 51, color: "0000ff", stadium: 10249, country: "ENG", rep: 41, fanBase: 105929, currentBudget: 83669},
  {id: 795, name: "York", tier: 6, baseOvr: 51, color: "e03a3e", stadium: 8500, country: "ENG", rep: 41, fanBase: 89656, currentBudget: 83669},
  {id: 798, name: "Barnet", tier: 6, baseOvr: 51, color: "f58220", stadium: 6500, country: "ENG", rep: 41, fanBase: 71048, currentBudget: 83669},
  {id: 800, name: "Gateshead", tier: 6, baseOvr: 50, color: "ffffff", stadium: 11800, country: "ENG", rep: 40, fanBase: 119746, currentBudget: 78839},
  {id: 801, name: "Altrincham", tier: 6, baseOvr: 50, color: "e03a3e", stadium: 7700, country: "ENG", rep: 40, fanBase: 81598, currentBudget: 78839},
  {id: 799, name: "Solihull", tier: 6, baseOvr: 50, color: "f7ec13", stadium: 5500, country: "ENG", rep: 40, fanBase: 61129, currentBudget: 78839},
  {id: 797, name: "Forest Green", tier: 6, baseOvr: 50, color: "00ff00", stadium: 5147, country: "ENG", rep: 40, fanBase: 57845, currentBudget: 78839},
  {id: 804, name: "Halifax", tier: 6, baseOvr: 49, color: "0000ff", stadium: 14061, country: "ENG", rep: 39, fanBase: 140237, currentBudget: 74201},
  {id: 806, name: "Hartlepool", tier: 6, baseOvr: 49, color: "0000ff", stadium: 7856, country: "ENG", rep: 39, fanBase: 82512, currentBudget: 74201},
  {id: 805, name: "Aldershot", tier: 6, baseOvr: 49, color: "e03a3e", stadium: 7100, country: "ENG", rep: 39, fanBase: 75479, currentBudget: 74201},
  {id: 802, name: "Dagenham", tier: 6, baseOvr: 49, color: "e03a3e", stadium: 6078, country: "ENG", rep: 39, fanBase: 65970, currentBudget: 74201},
  {id: 803, name: "Eastleigh", tier: 6, baseOvr: 49, color: "0000ff", stadium: 5192, country: "ENG", rep: 39, fanBase: 57726, currentBudget: 74201},
  {id: 808, name: "Yeovil", tier: 6, baseOvr: 48, color: "00a850", stadium: 9565, country: "ENG", rep: 38, fanBase: 97724, currentBudget: 69742},

  // ==========================================
  // TIER 7 (18 Clubs)
  // ==========================================
  {id: 807, name: "Woking", tier: 7, baseOvr: 48, color: "e03a3e", stadium: 6036, country: "ENG", rep: 36, fanBase: 38944, currentBudget: 24409},
  {id: 815, name: "Sutton", tier: 7, baseOvr: 48, color: "f7ec13", stadium: 5013, country: "ENG", rep: 36, fanBase: 33214, currentBudget: 24409},
  {id: 810, name: "Boston", tier: 7, baseOvr: 47, color: "f58220", stadium: 5061, country: "ENG", rep: 35, fanBase: 33092, currentBudget: 22915},
  {id: 809, name: "Tamworth", tier: 7, baseOvr: 47, color: "e03a3e", stadium: 4963, country: "ENG", rep: 35, fanBase: 32543, currentBudget: 22915},
  {id: 814, name: "Ebbsfleet", tier: 7, baseOvr: 46, color: "e03a3e", stadium: 5011, country: "ENG", rep: 34, fanBase: 32410, currentBudget: 21487},
  {id: 811, name: "Braintree", tier: 7, baseOvr: 46, color: "f58220", stadium: 4222, country: "ENG", rep: 34, fanBase: 27993, currentBudget: 21487},
  {id: 813, name: "Wealdstone", tier: 7, baseOvr: 46, color: "0000ff", stadium: 4085, country: "ENG", rep: 34, fanBase: 27226, currentBudget: 21487},
  {id: 812, name: "Maidenhead", tier: 7, baseOvr: 46, color: "000000", stadium: 4000, country: "ENG", rep: 34, fanBase: 26750, currentBudget: 21487},
  {id: 819, name: "King's Lynn", tier: 7, baseOvr: 45, color: "0000ff", stadium: 8200, country: "ENG", rep: 33, fanBase: 49014, currentBudget: 20117},
  {id: 818, name: "Kidderminster", tier: 7, baseOvr: 45, color: "ff0000", stadium: 6444, country: "ENG", rep: 33, fanBase: 39180, currentBudget: 20117},
  {id: 820, name: "Southport", tier: 7, baseOvr: 45, color: "ffd700", stadium: 6008, country: "ENG", rep: 33, fanBase: 36738, currentBudget: 20117},
  {id: 817, name: "Manchester United Red", tier: 7, baseOvr: 45, color: "ff0000", stadium: 4400, country: "ENG", rep: 33, fanBase: 42000, currentBudget: 20117},
  {id: 822, name: "Chester", tier: 7, baseOvr: 44, color: "0000ff", stadium: 5376, country: "ENG", rep: 32, fanBase: 32497, currentBudget: 18809},
  {id: 821, name: "Hereford", tier: 7, baseOvr: 44, color: "ffffff", stadium: 4913, country: "ENG", rep: 32, fanBase: 29904, currentBudget: 18809},
  {id: 823, name: "Spennymoor", tier: 7, baseOvr: 44, color: "000000", stadium: 4300, country: "ENG", rep: 32, fanBase: 26470, currentBudget: 18809},
  {id: 825, name: "Chorley", tier: 7, baseOvr: 43, color: "000000", stadium: 4300, country: "ENG", rep: 31, fanBase: 26071, currentBudget: 17554},
  {id: 824, name: "Farsley", tier: 7, baseOvr: 43, color: "000000", stadium: 3900, country: "ENG", rep: 31, fanBase: 23831, currentBudget: 17554},
  {id: 826, name: "Darlington", tier: 7, baseOvr: 43, color: "000000", stadium: 3281, country: "ENG", rep: 31, fanBase: 20365, currentBudget: 17554}
]; 

export const SPAIN_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 501, name: "Madrid Blanco", tier: 1, baseOvr: 98, color: "ffffff", stadium: 81044, country: "ESP", rep: 94, fanBase: 10503968, currentBudget: 93442560 },
  { id: 502, name: "Barcelona", tier: 1, baseOvr: 96, color: "004d98", stadium: 99354, country: "ESP", rep: 93, fanBase: 12676051, currentBudget: 90428520 },
  { id: 503, name: "Madrid Rojo y Blanco", tier: 1, baseOvr: 87, color: "cb3524", stadium: 70460, country: "ESP", rep: 89, fanBase: 9113703, currentBudget: 79020360 },
  { id: 504, name: "Bilbao", tier: 1, baseOvr: 84, color: "ee2523", stadium: 53289, country: "ESP", rep: 86, fanBase: 6987384, currentBudget: 71124480 },
  { id: 505, name: "San Sebastian", tier: 1, baseOvr: 83, color: "00529f", stadium: 39500, country: "ESP", rep: 85, fanBase: 5311787, currentBudget: 68614440 },
  { id: 506, name: "Villarreal", tier: 1, baseOvr: 82, color: "ffe600", stadium: 23500, country: "ESP", rep: 84, fanBase: 3371368, currentBudget: 66164160 },
  { id: 507, name: "Sevilla Verde", tier: 1, baseOvr: 81, color: "00a550", stadium: 60721, country: "ESP", rep: 83, fanBase: 7817961, currentBudget: 63772920 },
  { id: 509, name: "Valencia", tier: 1, baseOvr: 80, color: "000000", stadium: 49430, country: "ESP", rep: 82, fanBase: 6443600, currentBudget: 61440000 },
  { id: 508, name: "Sevilla Rojo", tier: 1, baseOvr: 80, color: "f40000", stadium: 43883, country: "ESP", rep: 82, fanBase: 5777960, currentBudget: 61440000 },
  { id: 511, name: "Pamplona", tier: 1, baseOvr: 79, color: "c8102e", stadium: 23576, country: "ESP", rep: 80, fanBase: 3322159, currentBudget: 59164680 },
  { id: 512, name: "Vigo", tier: 1, baseOvr: 78, color: "8ec1e8", stadium: 29000, country: "ESP", rep: 79, fanBase: 3954552, currentBudget: 56946240 },
  { id: 513, name: "Vallecas", tier: 1, baseOvr: 78, color: "e20613", stadium: 14708, country: "ESP", rep: 79, fanBase: 2239512, currentBudget: 56946240 },
  { id: 514, name: "Barcelona Azul y Blanco", tier: 1, baseOvr: 77, color: "0054a6", stadium: 40000, country: "ESP", rep: 78, fanBase: 5256533, currentBudget: 54783960 },
  { id: 517, name: "Valladolid", tier: 1, baseOvr: 76, color: "5b2382", stadium: 27618, country: "ESP", rep: 77, fanBase: 3753136, currentBudget: 52677120 },
  { id: 516, name: "Vitoria", tier: 1, baseOvr: 76, color: "00529f", stadium: 19840, country: "ESP", rep: 77, fanBase: 2819776, currentBudget: 52677120 },
  { id: 515, name: "Getafe", tier: 1, baseOvr: 76, color: "00529f", stadium: 16500, country: "ESP", rep: 77, fanBase: 2418976, currentBudget: 52677120 },
  { id: 537, name: "La Coruña", tier: 1, baseOvr: 75, color: "00529f", stadium: 32490, country: "ESP", rep: 76, fanBase: 4320675, currentBudget: 50625000 },
  { id: 538, name: "Málaga", tier: 1, baseOvr: 75, color: "38bdf8", stadium: 30044, country: "ESP", rep: 76, fanBase: 4027155, currentBudget: 50625000 },

  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  { id: 529, name: "Santander", tier: 2, baseOvr: 75, color: "15803d", stadium: 22222, country: "ESP", rep: 74, fanBase: 1853109, currentBudget: 17718750 },
  { id: 518, name: "Leganés", tier: 2, baseOvr: 75, color: "00529f", stadium: 12454, country: "ESP", rep: 74, fanBase: 1149813, currentBudget: 17718750 },
  { id: 519, name: "Las Palmas", tier: 2, baseOvr: 74, color: "ffd700", stadium: 32400, country: "ESP", rep: 73, fanBase: 2575934, currentBudget: 17019408 },
  { id: 510, name: "Girona", tier: 2, baseOvr: 74, color: "d71920", stadium: 14624, country: "ESP", rep: 73, fanBase: 1296062, currentBudget: 17019408 },
  { id: 520, name: "Palma", tier: 2, baseOvr: 73, color: "e20613", stadium: 23142, country: "ESP", rep: 72, fanBase: 1899634, currentBudget: 16338714 },
  { id: 521, name: "Granada", tier: 2, baseOvr: 73, color: "ca121a", stadium: 19336, country: "ESP", rep: 72, fanBase: 1625602, currentBudget: 16338714 },
  { id: 524, name: "Elche", tier: 2, baseOvr: 72, color: "15803d", stadium: 33732, country: "ESP", rep: 71, fanBase: 2652652, currentBudget: 15676416 },
  { id: 523, name: "Cádiz", tier: 2, baseOvr: 72, color: "fef08a", stadium: 20724, country: "ESP", rep: 71, fanBase: 1716076, currentBudget: 15676416 },
  { id: 522, name: "Almería", tier: 2, baseOvr: 72, color: "e20613", stadium: 15274, country: "ESP", rep: 71, fanBase: 1323676, currentBudget: 15676416 },
  { id: 526, name: "Zaragoza", tier: 2, baseOvr: 71, color: "ffffff", stadium: 33608, country: "ESP", rep: 70, fanBase: 2634522, currentBudget: 15032262 },
  { id: 527, name: "Oviedo", tier: 2, baseOvr: 71, color: "00529f", stadium: 30500, country: "ESP", rep: 70, fanBase: 2410746, currentBudget: 15032262 },
  { id: 525, name: "Eibar", tier: 2, baseOvr: 71, color: "00529f", stadium: 8168, country: "ESP", rep: 70, fanBase: 802842, currentBudget: 15032262 },
  { id: 528, name: "Gijón", tier: 2, baseOvr: 70, color: "e20613", stadium: 30000, country: "ESP", rep: 69, fanBase: 2365800, currentBudget: 14406000 },
  { id: 530, name: "Levante", tier: 2, baseOvr: 70, color: "00529f", stadium: 26354, country: "ESP", rep: 69, fanBase: 2103288, currentBudget: 14406000 },
  { id: 531, name: "Albacete", tier: 2, baseOvr: 70, color: "ffffff", stadium: 17524, country: "ESP", rep: 69, fanBase: 1467528, currentBudget: 14406000 },
  { id: 533, name: "Tenerife", tier: 2, baseOvr: 69, color: "00529f", stadium: 22824, country: "ESP", rep: 68, fanBase: 1840433, currentBudget: 13797378 },
  { id: 532, name: "Burgos", tier: 2, baseOvr: 69, color: "000000", stadium: 12194, country: "ESP", rep: 68, fanBase: 1075073, currentBudget: 13797378 },
  { id: 534, name: "Huesca", tier: 2, baseOvr: 68, color: "00529f", stadium: 9100, country: "ESP", rep: 67, fanBase: 843859, currentBudget: 13206144 },

  // ==========================================
  // TIER 3 (18 Clubs)
  // ==========================================
  { id: 535, name: "Elda", tier: 3, baseOvr: 67, color: "00529f", stadium: 4011, country: "ESP", rep: 64, fanBase: 281549, currentBudget: 4421216 },
  { id: 536, name: "Miranda de Ebro", tier: 3, baseOvr: 66, color: "dc2626", stadium: 5759, country: "ESP", rep: 63, fanBase: 352287, currentBudget: 4226191 },
  { id: 539, name: "Córdoba", tier: 3, baseOvr: 65, color: "15803d", stadium: 20989, country: "ESP", rep: 62, fanBase: 1005589, currentBudget: 4036987 },
  { id: 540, name: "Castellón", tier: 3, baseOvr: 65, color: "000000", stadium: 15500, country: "ESP", rep: 62, fanBase: 768465, currentBudget: 4036987 },
  { id: 542, name: "Murcia", tier: 3, baseOvr: 64, color: "dc2626", stadium: 31179, country: "ESP", rep: 61, fanBase: 1441304, currentBudget: 3853516 },
  { id: 546, name: "Madrid Rojo y Blanco II", tier: 3, baseOvr: 64, color: "ffffff", stadium: 6000, country: "ESP", rep: 61, fanBase: 353571, currentBudget: 3853516 },
  { id: 547, name: "Barcelona II", tier: 3, baseOvr: 64, color: "004d98", stadium: 6000, country: "ESP", rep: 61, fanBase: 353571, currentBudget: 3853516 },
  { id: 541, name: "Ibiza", tier: 3, baseOvr: 64, color: "38bdf8", stadium: 6000, country: "ESP", rep: 61, fanBase: 353571, currentBudget: 3853516 },
  { id: 543, name: "Tarragona", tier: 3, baseOvr: 63, color: "dc2626", stadium: 14591, country: "ESP", rep: 60, fanBase: 720348, currentBudget: 3675690 },
  { id: 544, name: "León", tier: 3, baseOvr: 63, color: "ffffff", stadium: 13346, country: "ESP", rep: 60, fanBase: 666564, currentBudget: 3675690 },
  { id: 545, name: "Ponferrada", tier: 3, baseOvr: 63, color: "00529f", stadium: 8400, country: "ESP", rep: 60, fanBase: 452896, currentBudget: 3675690 },
  { id: 548, name: "Alcorcón", tier: 3, baseOvr: 62, color: "eab308", stadium: 5100, country: "ESP", rep: 59, fanBase: 306118, currentBudget: 3503421 },
  { id: 549, name: "Mérida", tier: 3, baseOvr: 61, color: "000000", stadium: 14600, country: "ESP", rep: 58, fanBase: 712433, currentBudget: 3336620 },
  { id: 551, name: "Ceuta", tier: 3, baseOvr: 61, color: "ffffff", stadium: 6500, country: "ESP", rep: 58, fanBase: 362513, currentBudget: 3336620 },
  { id: 550, name: "Salamanca", tier: 3, baseOvr: 61, color: "000000", stadium: 5000, country: "ESP", rep: 58, fanBase: 297713, currentBudget: 3336620 },
  { id: 552, name: "Lugo", tier: 3, baseOvr: 60, color: "dc2626", stadium: 7840, country: "ESP", rep: 57, fanBase: 416448, currentBudget: 3175200 },
  { id: 553, name: "Andorra la Vella", tier: 3, baseOvr: 60, color: "00529f", stadium: 3306, country: "ESP", rep: 57, fanBase: 220579, currentBudget: 3175200 },
  { id: 554, name: "Alicante Negro", tier: 3, baseOvr: 60, color: "000000", stadium: 2500, country: "ESP", rep: 57, fanBase: 185760, currentBudget: 3175200 },

  // ==========================================
  // TIER 4 (18 Clubs)
  // ==========================================
  { id: 556, name: "Alicante Azul y Blanco", tier: 4, baseOvr: 58, color: "00529f", stadium: 29500, country: "ESP", rep: 52, fanBase: 806784, currentBudget: 1003851 },
  { id: 555, name: "Huelva", tier: 4, baseOvr: 58, color: "00529f", stadium: 21670, country: "ESP", rep: 52, fanBase: 603830, currentBudget: 1003851 },
  { id: 557, name: "Soria", tier: 4, baseOvr: 57, color: "dc2626", stadium: 8727, country: "ESP", rep: 51, fanBase: 266205, currentBudget: 952817 },
  { id: 559, name: "Jaén", tier: 4, baseOvr: 56, color: "ffffff", stadium: 12569, country: "ESP", rep: 50, fanBase: 363721, currentBudget: 903548 },
  { id: 558, name: "Santiago de Compostela", tier: 4, baseOvr: 56, color: "38bdf8", stadium: 12000, country: "ESP", rep: 50, fanBase: 348973, currentBudget: 903548 },
  { id: 561, name: "Logroño", tier: 4, baseOvr: 55, color: "dc2626", stadium: 16000, country: "ESP", rep: 49, fanBase: 450657, currentBudget: 855990 },
  { id: 562, name: "Badajoz", tier: 4, baseOvr: 55, color: "000000", stadium: 15198, country: "ESP", rep: 49, fanBase: 429869, currentBudget: 855990 },
  { id: 560, name: "Pontevedra", tier: 4, baseOvr: 55, color: "991b1b", stadium: 12000, country: "ESP", rep: 49, fanBase: 346977, currentBudget: 855990 },
  { id: 563, name: "Barakaldo", tier: 4, baseOvr: 54, color: "eab308", stadium: 7960, country: "ESP", rep: 48, fanBase: 240335, currentBudget: 810152 },
  { id: 564, name: "Amorebieta", tier: 4, baseOvr: 54, color: "00529f", stadium: 3000, country: "ESP", rep: 48, fanBase: 111772, currentBudget: 810152 },
  { id: 567, name: "Sabadell", tier: 4, baseOvr: 53, color: "00529f", stadium: 11908, country: "ESP", rep: 47, fanBase: 340812, currentBudget: 765972 },
  { id: 566, name: "Algeciras", tier: 4, baseOvr: 53, color: "dc2626", stadium: 7200, country: "ESP", rep: 47, fanBase: 218781, currentBudget: 765972 },
  { id: 565, name: "Irún", tier: 4, baseOvr: 53, color: "ffffff", stadium: 5000, country: "ESP", rep: 47, fanBase: 161757, currentBudget: 765972 },
  { id: 570, name: "Ferrol", tier: 4, baseOvr: 52, color: "15803d", stadium: 12043, country: "ESP", rep: 46, fanBase: 342525, currentBudget: 723428 },
  { id: 568, name: "Zamora", tier: 4, baseOvr: 52, color: "dc2626", stadium: 7813, country: "ESP", rep: 46, fanBase: 232884, currentBudget: 723428 },
  { id: 569, name: "Cáceres", tier: 4, baseOvr: 52, color: "15803d", stadium: 7000, country: "ESP", rep: 46, fanBase: 211811, currentBudget: 723428 },
  { id: 571, name: "Majadahonda", tier: 4, baseOvr: 51, color: "00529f", stadium: 3800, country: "ESP", rep: 45, fanBase: 127148, currentBudget: 682489 },
  { id: 572, name: "Teruel", tier: 4, baseOvr: 51, color: "dc2626", stadium: 2500, country: "ESP", rep: 45, fanBase: 93452, currentBudget: 682489 },

  // ==========================================
  // TIER 5 (18 Clubs)
  // ==========================================
  { id: 573, name: "Gracia", tier: 5, baseOvr: 46, color: "00529f", stadium: 7000, country: "ESP", rep: 38, fanBase: 120930, currentBudget: 175276 },
  { id: 574, name: "Sant Andreu", tier: 5, baseOvr: 45, color: "eab308", stadium: 6563, country: "ESP", rep: 37, fanBase: 113877, currentBudget: 164093 },
  { id: 575, name: "Marbella", tier: 5, baseOvr: 45, color: "ffffff", stadium: 3000, country: "ESP", rep: 37, fanBase: 58465, currentBudget: 164093 },
  { id: 576, name: "Logroño II", tier: 5, baseOvr: 44, color: "dc2626", stadium: 16000, country: "ESP", rep: 36, fanBase: 259871, currentBudget: 153394 },
  { id: 577, name: "Avilés", tier: 5, baseOvr: 44, color: "00529f", stadium: 5400, country: "ESP", rep: 36, fanBase: 95012, currentBudget: 153394 },
  { id: 580, name: "Tudela", tier: 5, baseOvr: 43, color: "ffffff", stadium: 11000, country: "ESP", rep: 35, fanBase: 181376, currentBudget: 143172 },
  { id: 578, name: "Guadalajara", tier: 5, baseOvr: 43, color: "00529f", stadium: 5000, country: "ESP", rep: 35, fanBase: 88064, currentBudget: 143172 },
  { id: 579, name: "Yecla", tier: 5, baseOvr: 43, color: "00529f", stadium: 4000, country: "ESP", rep: 35, fanBase: 72512, currentBudget: 143172 },
  { id: 581, name: "Talavera", tier: 5, baseOvr: 42, color: "00529f", stadium: 5000, country: "ESP", rep: 34, fanBase: 87361, currentBudget: 133413 },
  { id: 582, name: "Badalona", tier: 5, baseOvr: 42, color: "00529f", stadium: 4170, country: "ESP", rep: 34, fanBase: 74453, currentBudget: 133413 },
  { id: 583, name: "Vigo II", tier: 5, baseOvr: 42, color: "15803d", stadium: 1500, country: "ESP", rep: 34, fanBase: 32929, currentBudget: 133413 },
  { id: 586, name: "Torrelavega", tier: 5, baseOvr: 41, color: "00529f", stadium: 6000, country: "ESP", rep: 33, fanBase: 102244, currentBudget: 124110 },
  { id: 584, name: "Orihuela", tier: 5, baseOvr: 41, color: "eab308", stadium: 5000, country: "ESP", rep: 33, fanBase: 86688, currentBudget: 124110 },
  { id: 585, name: "Torremolinos", tier: 5, baseOvr: 41, color: "15803d", stadium: 3000, country: "ESP", rep: 33, fanBase: 55584, currentBudget: 124110 },
  { id: 589, name: "Estepona", tier: 5, baseOvr: 40, color: "dc2626", stadium: 8000, country: "ESP", rep: 32, fanBase: 132710, currentBudget: 115248 },
  { id: 587, name: "Olot", tier: 5, baseOvr: 40, color: "dc2626", stadium: 3000, country: "ESP", rep: 32, fanBase: 54950, currentBudget: 115248 },
  { id: 590, name: "San Sebastián de los Reyes", tier: 5, baseOvr: 40, color: "ffffff", stadium: 3000, country: "ESP", rep: 32, fanBase: 54950, currentBudget: 115248 },
  { id: 588, name: "Ejea de los Caballeros", tier: 5, baseOvr: 40, color: "00529f", stadium: 2250, country: "ESP", rep: 32, fanBase: 43286, currentBudget: 115248 },

  // ==========================================
  // TIER 6 (18 Clubs)
  // ==========================================
  { id: 592, name: "Almendralejo", tier: 6, baseOvr: 39, color: "00529f", stadium: 11580, country: "ESP", rep: 28, fanBase: 112670, currentBudget: 37389 },
  { id: 603, name: "Toledo", tier: 6, baseOvr: 37, color: "008000", stadium: 5500, country: "ESP", rep: 26, fanBase: 55263, currentBudget: 31924 },
  { id: 598, name: "Sestao", tier: 6, baseOvr: 39, color: "000000", stadium: 4300, country: "ESP", rep: 28, fanBase: 44736, currentBudget: 37389 },
  { id: 604, name: "Lepe", tier: 6, baseOvr: 37, color: "ffd700", stadium: 3500, country: "ESP", rep: 26, fanBase: 36598, currentBudget: 31924 },
  { id: 591, name: "Coria", tier: 6, baseOvr: 39, color: "38bdf8", stadium: 3000, country: "ESP", rep: 28, fanBase: 32607, currentBudget: 37389 },
  { id: 593, name: "Águilas", tier: 6, baseOvr: 39, color: "00529f", stadium: 3000, country: "ESP", rep: 28, fanBase: 32607, currentBudget: 37389 },
  { id: 599, name: "Portugalete", tier: 6, baseOvr: 37, color: "eab308", stadium: 3000, country: "ESP", rep: 26, fanBase: 31932, currentBudget: 31924 },
  { id: 600, name: "Villagarcía", tier: 6, baseOvr: 37, color: "dc2626", stadium: 3000, country: "ESP", rep: 26, fanBase: 31932, currentBudget: 31924 },
  { id: 606, name: "Segovia", tier: 6, baseOvr: 36, color: "0000ff", stadium: 3000, country: "ESP", rep: 25, fanBase: 31623, currentBudget: 29406 },
  { id: 607, name: "San Javier", tier: 6, baseOvr: 36, color: "0000ff", stadium: 3000, country: "ESP", rep: 25, fanBase: 31623, currentBudget: 29406 },
  { id: 608, name: "Alzira", tier: 6, baseOvr: 35, color: "0000ff", stadium: 3000, country: "ESP", rep: 24, fanBase: 31329, currentBudget: 27022 },
  { id: 602, name: "Terrassa", tier: 6, baseOvr: 38, color: "dc2626", stadium: 11500, country: "ESP", rep: 27, fanBase: 111571, currentBudget: 34583 },
  { id: 594, name: "Utebo", tier: 6, baseOvr: 38, color: "00529f", stadium: 3000, country: "ESP", rep: 27, fanBase: 32262, currentBudget: 34583 },
  { id: 595, name: "Gernika", tier: 6, baseOvr: 38, color: "000000", stadium: 3000, country: "ESP", rep: 27, fanBase: 32262, currentBudget: 34583 },
  { id: 597, name: "Nájera", tier: 6, baseOvr: 38, color: "00529f", stadium: 1500, country: "ESP", rep: 27, fanBase: 18263, currentBudget: 34583 },
  { id: 605, name: "Guijuelo", tier: 6, baseOvr: 36, color: "008000", stadium: 1500, country: "ESP", rep: 25, fanBase: 17625, currentBudget: 29406 },
  { id: 596, name: "Zaragoza II", tier: 6, baseOvr: 38, color: "00529f", stadium: 1000, country: "ESP", rep: 27, fanBase: 13598, currentBudget: 34583 },
  { id: 601, name: "Llanera", tier: 6, baseOvr: 37, color: "dc2626", stadium: 1000, country: "ESP", rep: 26, fanBase: 13270, currentBudget: 31924 }
];

export const ITALY_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 902, name: "Milano Nerazzurro", tier: 1, baseOvr: 87, color: "00529f", stadium: 75817, country: "ITA", rep: 89, fanBase: 9756543, currentBudget: 79020360 },
  { id: 901, name: "Torino Bianconero", tier: 1, baseOvr: 86, color: "000000", stadium: 41507, country: "ITA", rep: 88, fanBase: 5616896, currentBudget: 76326720 },
  { id: 903, name: "Milano Rossonero", tier: 1, baseOvr: 85, color: "fb090b", stadium: 75817, country: "ITA", rep: 87, fanBase: 9712165, currentBudget: 73695000 },
  { id: 904, name: "Napoli Azzurro", tier: 1, baseOvr: 84, color: "00843d", stadium: 54726, country: "ITA", rep: 86, fanBase: 7159824, currentBudget: 71124480 },
  { id: 905, name: "Bergamo Nerazzurro", tier: 1, baseOvr: 83, color: "1f53a3", stadium: 24950, country: "ITA", rep: 85, fanBase: 3565797, currentBudget: 68614440 },
  { id: 906, name: "Roma Giallorosso", tier: 1, baseOvr: 82, color: "8e1f2f", stadium: 70634, country: "ITA", rep: 84, fanBase: 9027448, currentBudget: 66164160 },
  { id: 907, name: "Roma Biancoceleste", tier: 1, baseOvr: 81, color: "87d8f7", stadium: 70634, country: "ITA", rep: 83, fanBase: 9007521, currentBudget: 63772920 },
  { id: 908, name: "Firenze Viola", tier: 1, baseOvr: 80, color: "4d217a", stadium: 43147, country: "ITA", rep: 82, fanBase: 5689640, currentBudget: 61440000 },
  { id: 909, name: "Bologna Rossoblu", tier: 1, baseOvr: 80, color: "1a2b4c", stadium: 38279, country: "ITA", rep: 82, fanBase: 5105480, currentBudget: 61440000 },
  { id: 910, name: "Torino Granata", tier: 1, baseOvr: 79, color: "8a1c22", stadium: 28177, country: "ITA", rep: 80, fanBase: 3874279, currentBudget: 59164680 },
  { id: 911, name: "Genova Rossoblu", tier: 1, baseOvr: 78, color: "002f6c", stadium: 36599, country: "ITA", rep: 79, fanBase: 4866432, currentBudget: 56946240 },
  { id: 912, name: "Udine Bianconero", tier: 1, baseOvr: 77, color: "000000", stadium: 25144, country: "ITA", rep: 78, fanBase: 3473813, currentBudget: 54783960 },
  { id: 913, name: "Monza Brianzolo", tier: 1, baseOvr: 77, color: "e20613", stadium: 17102, country: "ITA", rep: 78, fanBase: 2508773, currentBudget: 54783960 },
  { id: 916, name: "Verona Gialloblu", tier: 1, baseOvr: 76, color: "002d62", stadium: 31045, country: "ITA", rep: 77, fanBase: 4164376, currentBudget: 52677120 },
  { id: 914, name: "Parma Crociato", tier: 1, baseOvr: 76, color: "003366", stadium: 22352, country: "ITA", rep: 77, fanBase: 3121216, currentBudget: 52677120 },
  { id: 915, name: "Cagliari Rossoblu", tier: 1, baseOvr: 76, color: "a50021", stadium: 16416, country: "ITA", rep: 77, fanBase: 2408896, currentBudget: 52677120 },
  { id: 919, name: "Como Lariano", tier: 1, baseOvr: 76, color: "004085", stadium: 13602, country: "ITA", rep: 77, fanBase: 2071216, currentBudget: 52677120 },
  { id: 917, name: "Lecce Giallorosso", tier: 1, baseOvr: 75, color: "e30613", stadium: 31533, country: "ITA", rep: 76, fanBase: 4205835, currentBudget: 50625000 },

  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  { id: 921, name: "Sassuolo Neroverde", tier: 2, baseOvr: 75, color: "00843d", stadium: 21584, country: "ITA", rep: 74, fanBase: 1807170, currentBudget: 17718750 },
  { id: 918, name: "Empoli Azzurro", tier: 2, baseOvr: 75, color: "005ca9", stadium: 16284, country: "ITA", rep: 74, fanBase: 1425570, currentBudget: 17718750 },
  { id: 922, name: "Genova Blucerchiato", tier: 2, baseOvr: 74, color: "0033a0", stadium: 36599, country: "ITA", rep: 73, fanBase: 2878262, currentBudget: 17019408 },
  { id: 920, name: "Venezia Arancioneroverde", tier: 2, baseOvr: 74, color: "000000", stadium: 11150, country: "ITA", rep: 73, fanBase: 1046006, currentBudget: 17019408 },
  { id: 923, name: "Palermo Rosanero", tier: 2, baseOvr: 73, color: "f4a1c8", stadium: 36365, country: "ITA", rep: 72, fanBase: 2851682, currentBudget: 16338714 },
  { id: 924, name: "Cremona Grigiorosso", tier: 2, baseOvr: 73, color: "a2001d", stadium: 16068, country: "ITA", rep: 72, fanBase: 1389650, currentBudget: 16338714 },
  { id: 925, name: "Salerno Granata", tier: 2, baseOvr: 72, color: "700000", stadium: 37180, country: "ITA", rep: 71, fanBase: 2898520, currentBudget: 15676416 },
  { id: 927, name: "Pisa Nerazzurro", tier: 2, baseOvr: 71, color: "000000", stadium: 25000, country: "ITA", rep: 70, fanBase: 2014746, currentBudget: 15032262 },
  { id: 926, name: "Brescia Biancoazzurro", tier: 2, baseOvr: 71, color: "003b7a", stadium: 19550, country: "ITA", rep: 70, fanBase: 1622346, currentBudget: 15032262 },
  { id: 931, name: "Frosinone Gialloazzurro", tier: 2, baseOvr: 71, color: "fecb00", stadium: 16227, country: "ITA", rep: 70, fanBase: 1383090, currentBudget: 15032262 },
  { id: 928, name: "Catanzaro Giallorosso", tier: 2, baseOvr: 70, color: "e30613", stadium: 14650, country: "ITA", rep: 69, fanBase: 1260600, currentBudget: 14406000 },
  { id: 929, name: "La Spezia Bianco", tier: 2, baseOvr: 70, color: "ffffff", stadium: 11500, country: "ITA", rep: 69, fanBase: 1033800, currentBudget: 14406000 },
  { id: 939, name: "Bari Biancorosso", tier: 2, baseOvr: 69, color: "e30613", stadium: 58270, country: "ITA", rep: 68, fanBase: 4392557, currentBudget: 13797378 },
  { id: 930, name: "Modena Gialloblu", tier: 2, baseOvr: 69, color: "fde100", stadium: 21092, country: "ITA", rep: 68, fanBase: 1715753, currentBudget: 13797378 },
  { id: 933, name: "Reggio Emilia Granata", tier: 2, baseOvr: 68, color: "800020", stadium: 21584, country: "ITA", rep: 67, fanBase: 1742686, currentBudget: 13206144 },
  { id: 932, name: "Cesena Bianconero", tier: 2, baseOvr: 68, color: "000000", stadium: 20194, country: "ITA", rep: 67, fanBase: 1642606, currentBudget: 13206144 },
  { id: 935, name: "Mantova Biancorosso", tier: 2, baseOvr: 67, color: "e20613", stadium: 14884, country: "ITA", rep: 66, fanBase: 1252108, currentBudget: 12631524 },
  { id: 934, name: "Castellammare Gialloblu", tier: 2, baseOvr: 67, color: "0033a0", stadium: 12800, country: "ITA", rep: 66, fanBase: 1102060, currentBudget: 12631524 },

  // ==========================================
  // TIER 3 (18 Clubs)
  // ==========================================
  { id: 937, name: "Cosenza Rossoblu", tier: 3, baseOvr: 67, color: "002f6c", stadium: 24242, country: "ITA", rep: 64, fanBase: 1155502, currentBudget: 4421033 },
  { id: 940, name: "Cittadella Granata", tier: 3, baseOvr: 67, color: "800020", stadium: 7623, country: "ITA", rep: 64, fanBase: 437637, currentBudget: 4421033 },
  { id: 938, name: "Bolzano Biancorosso", tier: 3, baseOvr: 67, color: "e20613", stadium: 5539, country: "ITA", rep: 64, fanBase: 347596, currentBudget: 4421033 },
  { id: 936, name: "Carrara Azzurro", tier: 3, baseOvr: 66, color: "003b7a", stadium: 9500, country: "ITA", rep: 63, fanBase: 513886, currentBudget: 4226191 },
  { id: 941, name: "Benevento Giallorosso", tier: 3, baseOvr: 65, color: "fde100", stadium: 16867, country: "ITA", rep: 62, fanBase: 827521, currentBudget: 4036987 },
  { id: 942, name: "Ascoli Bianconero", tier: 3, baseOvr: 64, color: "000000", stadium: 12461, country: "ITA", rep: 61, fanBase: 632688, currentBudget: 3853516 },
  { id: 943, name: "Catania Rossoazzurro", tier: 3, baseOvr: 64, color: "a50021", stadium: 20204, country: "ITA", rep: 61, fanBase: 966099, currentBudget: 3853516 },
  { id: 944, name: "Padova Biancoscudato", tier: 3, baseOvr: 63, color: "e30613", stadium: 32560, country: "ITA", rep: 60, fanBase: 1496615, currentBudget: 3675690 },
  { id: 947, name: "Pescara Delfino", tier: 3, baseOvr: 63, color: "005ca9", stadium: 20515, country: "ITA", rep: 60, fanBase: 978701, currentBudget: 3675690 },
  { id: 949, name: "Terni Rossoverde", tier: 3, baseOvr: 63, color: "e30613", stadium: 17460, country: "ITA", rep: 60, fanBase: 847331, currentBudget: 3675690 },
  { id: 945, name: "Vicenza Biancorosso", tier: 3, baseOvr: 63, color: "e30613", stadium: 13173, country: "ITA", rep: 60, fanBase: 662990, currentBudget: 3675690 },
  { id: 946, name: "Avellino Biancoverde", tier: 3, baseOvr: 63, color: "00843d", stadium: 10215, country: "ITA", rep: 60, fanBase: 535805, currentBudget: 3675690 },
  { id: 950, name: "Perugia Biancorosso", tier: 3, baseOvr: 62, color: "e30613", stadium: 28000, country: "ITA", rep: 59, fanBase: 1295393, currentBudget: 3503421 },
  { id: 948, name: "Trieste Alabardato", tier: 3, baseOvr: 62, color: "e30613", stadium: 26500, country: "ITA", rep: 59, fanBase: 1230593, currentBudget: 3503421 },
  { id: 954, name: "Crotone Rossoblu", tier: 3, baseOvr: 62, color: "002f6c", stadium: 16640, country: "ITA", rep: 59, fanBase: 804646, currentBudget: 3503421 },
  { id: 952, name: "Ferrara Biancoazzurro", tier: 3, baseOvr: 62, color: "00529f", stadium: 16134, country: "ITA", rep: 59, fanBase: 782787, currentBudget: 3503421 },
  { id: 953, name: "Foggia Rossonero", tier: 3, baseOvr: 61, color: "000000", stadium: 25000, country: "ITA", rep: 58, fanBase: 1161643, currentBudget: 3336620 },
  { id: 951, name: "Arezzo Amaranto", tier: 3, baseOvr: 61, color: "800020", stadium: 13128, country: "ITA", rep: 58, fanBase: 649204, currentBudget: 3336620 },

  // ==========================================
  // TIER 4 (18 Clubs)
  // ==========================================
  { id: 955, name: "Sassari Rossoblu", tier: 4, baseOvr: 61, color: "0033a0", stadium: 10000, country: "ITA", rep: 56, fanBase: 308227, currentBudget: 1167817 },
  { id: 959, name: "Lecco Bluceleste", tier: 4, baseOvr: 61, color: "0033a0", stadium: 4997, country: "ITA", rep: 56, fanBase: 178550, currentBudget: 1167817 },
  { id: 957, name: "Novara Azzurro", tier: 4, baseOvr: 60, color: "005ca9", stadium: 17875, country: "ITA", rep: 55, fanBase: 509976, currentBudget: 1111320 },
  { id: 956, name: "Vercelli Bianco", tier: 4, baseOvr: 60, color: "ffffff", stadium: 5500, country: "ITA", rep: 55, fanBase: 189216, currentBudget: 1111320 },
  { id: 960, name: "Gubbio Rossoblu", tier: 4, baseOvr: 59, color: "0033a0", stadium: 4939, country: "ITA", rep: 54, fanBase: 172379, currentBudget: 1056976 },
  { id: 958, name: "Albino Celeste", tier: 4, baseOvr: 59, color: "005ca9", stadium: 3300, country: "ITA", rep: 54, fanBase: 129891, currentBudget: 1056976 },
  { id: 961, name: "Livorno Amaranto", tier: 4, baseOvr: 57, color: "a2001d", stadium: 19238, country: "ITA", rep: 52, fanBase: 538647, currentBudget: 952817 },
  { id: 962, name: "Piacenza Biancorosso", tier: 4, baseOvr: 56, color: "e20613", stadium: 21668, country: "ITA", rep: 51, fanBase: 599558, currentBudget: 903548 },
  { id: 963, name: "Siena Bianconero", tier: 4, baseOvr: 56, color: "000000", stadium: 15373, country: "ITA", rep: 51, fanBase: 436391, currentBudget: 903548 },
  { id: 964, name: "Verona Clivense", tier: 4, baseOvr: 56, color: "fde100", stadium: 31045, country: "ITA", rep: 51, fanBase: 842602, currentBudget: 903548 },
  { id: 965, name: "Chiavari Biancoceleste", tier: 4, baseOvr: 55, color: "87ceeb", stadium: 5535, country: "ITA", rep: 50, fanBase: 179397, currentBudget: 855990 },
  { id: 967, name: "Campobasso Rossoblu", tier: 4, baseOvr: 54, color: "0033a0", stadium: 25000, country: "ITA", rep: 49, fanBase: 681995, currentBudget: 810152 },
  { id: 966, name: "Ravenna Giallorosso", tier: 4, baseOvr: 54, color: "fde100", stadium: 12020, country: "ITA", rep: 49, fanBase: 345570, currentBudget: 810152 },
  { id: 973, name: "Carpi Biancorosso", tier: 4, baseOvr: 53, color: "ffffff", stadium: 5510, country: "ITA", rep: 48, fanBase: 174960, currentBudget: 765972 },
  { id: 968, name: "Alessandria Grigio", tier: 4, baseOvr: 57, color: "708090", stadium: 6000, country: "ITA", rep: 52, fanBase: 195000, currentBudget: 952817 },
  { id: 969, name: "Lucca Rossonero", tier: 4, baseOvr: 57, color: "dc2626", stadium: 7400, country: "ITA", rep: 52, fanBase: 220000, currentBudget: 952817 },
  { id: 970, name: "Taranto Rossoblu", tier: 4, baseOvr: 58, color: "1d4ed8", stadium: 12000, country: "ITA", rep: 53, fanBase: 350000, currentBudget: 1003851 },
  { id: 971, name: "Caserta Rossoblu", tier: 4, baseOvr: 58, color: "b91c1c", stadium: 12000, country: "ITA", rep: 53, fanBase: 340000, currentBudget: 1003851 },

  // ==========================================
  // TIER 5 (18 Clubs)
  // ==========================================
  { id: 976, name: "Latina Nerazzurro", tier: 5, baseOvr: 52, color: "002f6c", stadium: 9310, country: "ITA", rep: 45, fanBase: 162237, currentBudget: 153394 },
  { id: 977, name: "Monopoli Biancoverde", tier: 5, baseOvr: 52, color: "00843d", stadium: 6880, country: "ITA", rep: 45, fanBase: 122178, currentBudget: 153394 },
  { id: 974, name: "Busto Arsizio", tier: 5, baseOvr: 52, color: "005ca9", stadium: 4627, country: "ITA", rep: 45, fanBase: 85038, currentBudget: 153394 },
  { id: 972, name: "Gorgonzola Biancoazzurro", tier: 5, baseOvr: 52, color: "ffffff", stadium: 3766, country: "ITA", rep: 45, fanBase: 70845, currentBudget: 153394 },
  { id: 978, name: "Milano Arancione", tier: 5, baseOvr: 52, color: "ff6600", stadium: 2500, country: "ITA", rep: 45, fanBase: 49977, currentBudget: 153394 },
  { id: 975, name: "Arzignano Gialloceleste", tier: 5, baseOvr: 51, color: "fde100", stadium: 2000, country: "ITA", rep: 44, fanBase: 40537, currentBudget: 144703 },
  { id: 979, name: "Belluno Gialloblu", tier: 5, baseOvr: 51, color: "0033a0", stadium: 2000, country: "ITA", rep: 44, fanBase: 40537, currentBudget: 144703 },
  { id: 980, name: "Ospitaletto Arancio", tier: 5, baseOvr: 50, color: "ff6600", stadium: 2000, country: "ITA", rep: 43, fanBase: 38245, currentBudget: 136365 },
  { id: 981, name: "Reggio Calabria Amaranto", tier: 5, baseOvr: 48, color: "800020", stadium: 27543, country: "ITA", rep: 40, fanBase: 443422, currentBudget: 120619 },
  { id: 982, name: "Pistoia Arancione", tier: 5, baseOvr: 47, color: "ff6600", stadium: 13195, country: "ITA", rep: 39, fanBase: 219766, currentBudget: 113217 },
  { id: 983, name: "Nocera Molosso", tier: 5, baseOvr: 47, color: "e20613", stadium: 15000, country: "ITA", rep: 39, fanBase: 247858, currentBudget: 113217 },
  { id: 984, name: "Prato Biancazzurro", tier: 5, baseOvr: 46, color: "005ca9", stadium: 15000, country: "ITA", rep: 38, fanBase: 245353, currentBudget: 106138 },
  { id: 985, name: "Grosseto Biancorosso", tier: 5, baseOvr: 46, color: "000000", stadium: 10200, country: "ITA", rep: 38, fanBase: 170685, currentBudget: 106138 },
  { id: 986, name: "Varese Biancorosso", tier: 5, baseOvr: 45, color: "e20613", stadium: 9926, country: "ITA", rep: 37, fanBase: 165518, currentBudget: 99368 },
  { id: 993, name: "Trapani Granata", tier: 5, baseOvr: 45, color: "800020", stadium: 7750, country: "ITA", rep: 37, fanBase: 131649, currentBudget: 99368 },
  { id: 987, name: "Sanremo Biancazzurro", tier: 5, baseOvr: 45, color: "ffffff", stadium: 4000, country: "ITA", rep: 37, fanBase: 73295, currentBudget: 99368 },
  { id: 988, name: "Chieti Neroverde", tier: 5, baseOvr: 44, color: "00843d", stadium: 12750, country: "ITA", rep: 36, fanBase: 206259, currentBudget: 92900 },
  { id: 989, name: "Barletta Biancorosso", tier: 5, baseOvr: 44, color: "e20613", stadium: 8486, country: "ITA", rep: 36, fanBase: 139943, currentBudget: 92900 },

  // ==========================================
  // TIER 6 (18 Clubs)
  // ==========================================
  { id: 996, name: "Messina Giallorosso", tier: 6, baseOvr: 44, color: "fde100", stadium: 38722, country: "ITA", rep: 34, fanBase: 366224, currentBudget: 32515 },
  { id: 991, name: "Andria Azzurro", tier: 6, baseOvr: 44, color: "0033a0", stadium: 9140, country: "ITA", rep: 34, fanBase: 91617, currentBudget: 32515 },
  { id: 990, name: "L'Aquila Rossoblu", tier: 6, baseOvr: 44, color: "002f6c", stadium: 6763, country: "ITA", rep: 34, fanBase: 69562, currentBudget: 32515 },
  { id: 992, name: "Siracusa Azzurro", tier: 6, baseOvr: 43, color: "005ca9", stadium: 5946, country: "ITA", rep: 33, fanBase: 61404, currentBudget: 30349 },
  { id: 994, name: "Gela Biancazzurro", tier: 6, baseOvr: 43, color: "005ca9", stadium: 4200, country: "ITA", rep: 33, fanBase: 45199, currentBudget: 30349 },
  { id: 995, name: "Ischia Gialloblu", tier: 6, baseOvr: 43, color: "a2001d", stadium: 8000, country: "ITA", rep: 33, fanBase: 80464, currentBudget: 30349 },
  { id: 999, name: "Roma Trastevere", tier: 6, baseOvr: 43, color: "800020", stadium: 3100, country: "ITA", rep: 33, fanBase: 34991, currentBudget: 30349 },
  { id: 1101, name: "Seregno Azzurro", tier: 6, baseOvr: 42, color: "0000ff", stadium: 3500, country: "ITA", rep: 32, fanBase: 38294, currentBudget: 28286 },
  { id: 1000, name: "Lamezia Terme", tier: 6, baseOvr: 42, color: "005ca9", stadium: 6000, country: "ITA", rep: 32, fanBase: 61494, currentBudget: 28286 },
  { id: 997, name: "Foligno Biancoazzurro", tier: 6, baseOvr: 42, color: "002f6c", stadium: 5650, country: "ITA", rep: 32, fanBase: 58246, currentBudget: 28286 },
  { id: 1102, name: "Casale Nerostellato", tier: 6, baseOvr: 42, color: "000000", stadium: 4000, country: "ITA", rep: 32, fanBase: 42934, currentBudget: 28286 },
  { id: 998, name: "Ghivizzano", tier: 6, baseOvr: 42, color: "e20613", stadium: 1500, country: "ITA", rep: 32, fanBase: 19734, currentBudget: 28286 },
  { id: 1103, name: "Lodi Bianconero", tier: 6, baseOvr: 41, color: "000000", stadium: 2500, country: "ITA", rep: 31, fanBase: 28586, currentBudget: 26315 },
  { id: 1105, name: "Asti Galletto", tier: 6, baseOvr: 41, color: "ffffff", stadium: 2500, country: "ITA", rep: 31, fanBase: 28586, currentBudget: 26315 },
  { id: 1104, name: "Crema Nerobianco", tier: 6, baseOvr: 41, color: "000000", stadium: 3000, country: "ITA", rep: 31, fanBase: 33226, currentBudget: 26315 },
  { id: 1106, name: "Chieri Azzurro", tier: 6, baseOvr: 40, color: "00a3e0", stadium: 2000, country: "ITA", rep: 30, fanBase: 23625, currentBudget: 24430 },
  { id: 1107, name: "Gozzano Rossoblu", tier: 6, baseOvr: 40, color: "ff0000", stadium: 1500, country: "ITA", rep: 30, fanBase: 18985, currentBudget: 24430 },
  { id: 1108, name: "Bra Giallorosso", tier: 6, baseOvr: 40, color: "fde100", stadium: 1500, country: "ITA", rep: 30, fanBase: 18985, currentBudget: 24430 }
]; 

export const FRANCE_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 401, name: "Paris", tier: 1, baseOvr: 97, color: "001c58", stadium: 47929, country: "FRA", rep: 90, fanBase: 6432952, currentBudget: 81776640 },
  { id: 403, name: "Marseille", tier: 1, baseOvr: 84, color: "00a3e0", stadium: 67394, country: "FRA", rep: 86, fanBase: 8679984, currentBudget: 71124480 },
  { id: 404, name: "Monaco", tier: 1, baseOvr: 84, color: "e20613", stadium: 18523, country: "FRA", rep: 86, fanBase: 2815464, currentBudget: 71124480 },
  { id: 402, name: "Lyon", tier: 1, baseOvr: 83, color: "00205b", stadium: 59186, country: "FRA", rep: 85, fanBase: 7674107, currentBudget: 68614440 },
  { id: 405, name: "Lille", tier: 1, baseOvr: 83, color: "e20613", stadium: 50186, country: "FRA", rep: 85, fanBase: 6594107, currentBudget: 68614440 },
  { id: 407, name: "Lens", tier: 1, baseOvr: 82, color: "ffcc00", stadium: 38223, country: "FRA", rep: 84, fanBase: 5138128, currentBudget: 66164160 },
  { id: 406, name: "Nice", tier: 1, baseOvr: 82, color: "000000", stadium: 36178, country: "FRA", rep: 84, fanBase: 4892728, currentBudget: 66164160 },
  { id: 408, name: "Rennes", tier: 1, baseOvr: 81, color: "e20613", stadium: 29778, country: "FRA", rep: 83, fanBase: 4104801, currentBudget: 63772920 },
  { id: 411, name: "Brest", tier: 1, baseOvr: 81, color: "e20613", stadium: 15931, country: "FRA", rep: 83, fanBase: 2443161, currentBudget: 63772920 },
  { id: 409, name: "Toulouse", tier: 1, baseOvr: 79, color: "582c83", stadium: 33150, country: "FRA", rep: 80, fanBase: 4471039, currentBudget: 59164680 },
  { id: 410, name: "Strasbourg", tier: 1, baseOvr: 79, color: "005ca9", stadium: 26109, country: "FRA", rep: 80, fanBase: 3626119, currentBudget: 59164680 },
  { id: 414, name: "Reims", tier: 1, baseOvr: 79, color: "e20613", stadium: 21684, country: "FRA", rep: 80, fanBase: 3095119, currentBudget: 59164680 },
  { id: 413, name: "Nantes", tier: 1, baseOvr: 78, color: "fff200", stadium: 35322, country: "FRA", rep: 79, fanBase: 4713192, currentBudget: 56946240 },
  { id: 412, name: "Montpellier", tier: 1, baseOvr: 78, color: "f58220", stadium: 22000, country: "FRA", rep: 79, fanBase: 3114552, currentBudget: 56946240 },
  { id: 419, name: "Saint-Etienne", tier: 1, baseOvr: 76, color: "00843d", stadium: 41965, country: "FRA", rep: 77, fanBase: 5474776, currentBudget: 52677120 },
  { id: 417, name: "Le Havre", tier: 1, baseOvr: 76, color: "87ceeb", stadium: 25178, country: "FRA", rep: 77, fanBase: 3460336, currentBudget: 52677120 },
  { id: 418, name: "Paris Charléty", tier: 1, baseOvr: 76, color: "001c58", stadium: 20000, country: "FRA", rep: 77, fanBase: 2838976, currentBudget: 52677120 },
  { id: 416, name: "Angers", tier: 1, baseOvr: 76, color: "000000", stadium: 18752, country: "FRA", rep: 77, fanBase: 2689216, currentBudget: 52677120 },

  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  { id: 415, name: "Auxerre", tier: 2, baseOvr: 76, color: "ffffff", stadium: 18541, country: "FRA", rep: 75, fanBase: 1598337, currentBudget: 18436992 },
  { id: 420, name: "Metz", tier: 2, baseOvr: 75, color: "800020", stadium: 28786, country: "FRA", rep: 74, fanBase: 2325825, currentBudget: 17718750 },
  { id: 421, name: "Lorient", tier: 2, baseOvr: 75, color: "f58220", stadium: 18110, country: "FRA", rep: 74, fanBase: 1557975, currentBudget: 17718750 },
  { id: 422, name: "Clermont", tier: 2, baseOvr: 74, color: "800020", stadium: 13000, country: "FRA", rep: 73, fanBase: 1179144, currentBudget: 17019408 },
  { id: 425, name: "Bordeaux", tier: 2, baseOvr: 73, color: "001c58", stadium: 42115, country: "FRA", rep: 72, fanBase: 3266296, currentBudget: 16338714 },
  { id: 424, name: "Troyes", tier: 2, baseOvr: 73, color: "00529f", stadium: 20400, country: "FRA", rep: 72, fanBase: 1702516, currentBudget: 16338714 },
  { id: 423, name: "Guingamp", tier: 2, baseOvr: 73, color: "e20613", stadium: 19033, country: "FRA", rep: 72, fanBase: 1604092, currentBudget: 16338714 },
  { id: 427, name: "Caen", tier: 2, baseOvr: 72, color: "00205b", stadium: 20300, country: "FRA", rep: 71, fanBase: 1685568, currentBudget: 15676416 },
  { id: 426, name: "Bastia", tier: 2, baseOvr: 72, color: "00529f", stadium: 16000, country: "FRA", rep: 71, fanBase: 1375968, currentBudget: 15676416 },
  { id: 430, name: "Grenoble", tier: 2, baseOvr: 71, color: "00529f", stadium: 20068, country: "FRA", rep: 70, fanBase: 1659610, currentBudget: 15032262 },
  { id: 428, name: "Amiens", tier: 2, baseOvr: 71, color: "ffffff", stadium: 12097, country: "FRA", rep: 70, fanBase: 1085110, currentBudget: 15032262 },
  { id: 429, name: "Rodez", tier: 2, baseOvr: 71, color: "fde100", stadium: 3400, country: "FRA", rep: 70, fanBase: 458410, currentBudget: 15032262 },
  { id: 431, name: "Laval", tier: 2, baseOvr: 70, color: "f58220", stadium: 11107, country: "FRA", rep: 69, fanBase: 1005480, currentBudget: 14406000 },
  { id: 434, name: "Ajaccio", tier: 2, baseOvr: 70, color: "e20613", stadium: 10500, country: "FRA", rep: 69, fanBase: 961776, currentBudget: 14406000 },
  { id: 433, name: "Dunkerque", tier: 2, baseOvr: 70, color: "00529f", stadium: 5000, country: "FRA", rep: 69, fanBase: 565776, currentBudget: 14406000 },
  { id: 432, name: "Pau", tier: 2, baseOvr: 70, color: "fde100", stadium: 4031, country: "FRA", rep: 69, fanBase: 496008, currentBudget: 14406000 },
  { id: 435, name: "Annecy", tier: 2, baseOvr: 69, color: "e20613", stadium: 15600, country: "FRA", rep: 68, fanBase: 1319933, currentBudget: 13797378 },
  { id: 436, name: "Saint-Ouen", tier: 2, baseOvr: 69, color: "00843d", stadium: 10000, country: "FRA", rep: 68, fanBase: 916733, currentBudget: 13797378 },

  // ==========================================
  // TIER 3 (18 Clubs)
  // ==========================================
  { id: 437, name: "Sochaux", tier: 3, baseOvr: 67, color: "fde100", stadium: 20005, country: "FRA", rep: 64, fanBase: 972490, currentBudget: 4421216 },
  { id: 439, name: "Valenciennes", tier: 3, baseOvr: 66, color: "e20613", stadium: 25172, country: "FRA", rep: 63, fanBase: 1190937, currentBudget: 4226191 },
  { id: 438, name: "Dijon", tier: 3, baseOvr: 66, color: "e20613", stadium: 15995, country: "FRA", rep: 63, fanBase: 794913, currentBudget: 4226191 },
  { id: 442, name: "Nîmes", tier: 3, baseOvr: 64, color: "e20613", stadium: 15788, country: "FRA", rep: 61, fanBase: 777073, currentBudget: 3853516 },
  { id: 441, name: "Orléans", tier: 3, baseOvr: 64, color: "fde100", stadium: 7533, country: "FRA", rep: 61, fanBase: 420313, currentBudget: 3853516 },
  { id: 440, name: "Versailles", tier: 3, baseOvr: 64, color: "00205b", stadium: 6208, country: "FRA", rep: 61, fanBase: 363073, currentBudget: 3853516 },
  { id: 450, name: "Nancy", tier: 3, baseOvr: 63, color: "e20613", stadium: 20087, country: "FRA", rep: 60, fanBase: 957771, currentBudget: 3675690 },
  { id: 443, name: "Châteauroux", tier: 3, baseOvr: 63, color: "00529f", stadium: 17072, country: "FRA", rep: 60, fanBase: 827523, currentBudget: 3675690 },
  { id: 444, name: "Rouen", tier: 3, baseOvr: 63, color: "e20613", stadium: 12018, country: "FRA", rep: 60, fanBase: 609104, currentBudget: 3675690 },
  { id: 445, name: "Concarneau", tier: 3, baseOvr: 63, color: "00529f", stadium: 5800, country: "FRA", rep: 60, fanBase: 340453, currentBudget: 3675690 },
  { id: 449, name: "Le Mans", tier: 3, baseOvr: 62, color: "e20613", stadium: 25000, country: "FRA", rep: 59, fanBase: 1165804, currentBudget: 3503421 },
  { id: 446, name: "Boulogne", tier: 3, baseOvr: 62, color: "e20613", stadium: 15004, country: "FRA", rep: 59, fanBase: 733977, currentBudget: 3503421 },
  { id: 448, name: "Rouen Normandie", tier: 3, baseOvr: 62, color: "e20613", stadium: 8300, country: "FRA", rep: 59, fanBase: 443657, currentBudget: 3503421 },
  { id: 447, name: "Villefranche", tier: 3, baseOvr: 62, color: "00529f", stadium: 3200, country: "FRA", rep: 59, fanBase: 223377, currentBudget: 3503421 },
  { id: 454, name: "Martigues", tier: 3, baseOvr: 61, color: "e20613", stadium: 11500, country: "FRA", rep: 58, fanBase: 578491, currentBudget: 3336620 },
  { id: 451, name: "Bourg-en-Bresse", tier: 3, baseOvr: 61, color: "00529f", stadium: 4800, country: "FRA", rep: 58, fanBase: 289051, currentBudget: 3336620 },
  { id: 452, name: "Aubagne", tier: 3, baseOvr: 61, color: "f58220", stadium: 3000, country: "FRA", rep: 58, fanBase: 211291, currentBudget: 3336620 },
  { id: 453, name: "Marseille Nord", tier: 3, baseOvr: 60, color: "00205b", stadium: 1500, country: "FRA", rep: 57, fanBase: 142560, currentBudget: 3175200 },

  // ==========================================
  // TIER 4 (18 Clubs)
  // ==========================================
  { id: 455, name: "Cannes", tier: 4, baseOvr: 56, color: "e20613", stadium: 12000, country: "FRA", rep: 50, fanBase: 348973, currentBudget: 903548 },
  { id: 457, name: "Le Puy", tier: 4, baseOvr: 55, color: "00529f", stadium: 4000, country: "FRA", rep: 49, fanBase: 139618, currentBudget: 855990 },
  { id: 456, name: "Fleury", tier: 4, baseOvr: 55, color: "000000", stadium: 3500, country: "FRA", rep: 49, fanBase: 126658, currentBudget: 855990 },
  { id: 459, name: "Avranches", tier: 4, baseOvr: 55, color: "00529f", stadium: 2830, country: "FRA", rep: 49, fanBase: 109292, currentBudget: 855990 },
  { id: 460, name: "Créteil", tier: 4, baseOvr: 54, color: "00529f", stadium: 12150, country: "FRA", rep: 48, fanBase: 348937, currentBudget: 810152 },
  { id: 461, name: "Epinal", tier: 4, baseOvr: 54, color: "fde100", stadium: 7200, country: "FRA", rep: 48, fanBase: 220556, currentBudget: 810152 },
  { id: 463, name: "Paris Île-de-France", tier: 4, baseOvr: 54, color: "87ceeb", stadium: 5000, country: "FRA", rep: 48, fanBase: 163533, currentBudget: 810152 },
  { id: 462, name: "Chambly", tier: 4, baseOvr: 54, color: "000000", stadium: 4550, country: "FRA", rep: 48, fanBase: 151870, currentBudget: 810152 },
  { id: 458, name: "Saint-Malo", tier: 4, baseOvr: 54, color: "000000", stadium: 4500, country: "FRA", rep: 48, fanBase: 150574, currentBudget: 810152 },
  { id: 468, name: "Toulon", tier: 4, baseOvr: 53, color: "fde100", stadium: 15000, country: "FRA", rep: 47, fanBase: 420935, currentBudget: 765972 },
  { id: 467, name: "Bourges", tier: 4, baseOvr: 53, color: "00529f", stadium: 8000, country: "FRA", rep: 47, fanBase: 239495, currentBudget: 765972 },
  { id: 464, name: "Les Herbiers", tier: 4, baseOvr: 53, color: "e20613", stadium: 5000, country: "FRA", rep: 47, fanBase: 161735, currentBudget: 765972 },
  { id: 465, name: "Fréjus", tier: 4, baseOvr: 53, color: "00529f", stadium: 5000, country: "FRA", rep: 47, fanBase: 161735, currentBudget: 765972 },
  { id: 466, name: "Lyon Métropole", tier: 4, baseOvr: 53, color: "000000", stadium: 3200, country: "FRA", rep: 47, fanBase: 115079, currentBudget: 765972 },
  { id: 470, name: "Thionville", tier: 4, baseOvr: 53, color: "00843d", stadium: 3000, country: "FRA", rep: 47, fanBase: 109895, currentBudget: 765972 },
  { id: 471, name: "La Roche", tier: 4, baseOvr: 52, color: "00529f", stadium: 6700, country: "FRA", rep: 46, fanBase: 204035, currentBudget: 723428 },
  { id: 472, name: "Saint-Brieuc", tier: 4, baseOvr: 52, color: "fde100", stadium: 6000, country: "FRA", rep: 46, fanBase: 185891, currentBudget: 723428 },
  { id: 469, name: "Hyères", tier: 4, baseOvr: 52, color: "fde100", stadium: 3500, country: "FRA", rep: 46, fanBase: 121091, currentBudget: 723428 },

  // ==========================================
  // TIER 5 (18 Clubs)
  // ==========================================
  { id: 473, name: "Roubaix", tier: 5, baseOvr: 47, color: "00529f", stadium: 5000, country: "FRA", rep: 39, fanBase: 91215, currentBudget: 186959 },
  { id: 476, name: "Colmar", tier: 5, baseOvr: 46, color: "00529f", stadium: 7000, country: "FRA", rep: 38, fanBase: 121479, currentBudget: 175276 },
  { id: 474, name: "Dieppe", tier: 5, baseOvr: 46, color: "00529f", stadium: 5000, country: "FRA", rep: 38, fanBase: 90375, currentBudget: 175276 },
  { id: 475, name: "Haguenau", tier: 5, baseOvr: 46, color: "e20613", stadium: 3000, country: "FRA", rep: 38, fanBase: 59271, currentBudget: 175276 },
  { id: 480, name: "Saint-Pryvé", tier: 5, baseOvr: 45, color: "00529f", stadium: 3000, country: "FRA", rep: 37, fanBase: 58465, currentBudget: 164093 },
  { id: 478, name: "Chantilly", tier: 5, baseOvr: 45, color: "00529f", stadium: 2500, country: "FRA", rep: 37, fanBase: 50689, currentBudget: 164093 },
  { id: 479, name: "Borgo", tier: 5, baseOvr: 45, color: "e20613", stadium: 2000, country: "FRA", rep: 37, fanBase: 42913, currentBudget: 164093 },
  { id: 477, name: "Biesheim", tier: 5, baseOvr: 45, color: "00843d", stadium: 2000, country: "FRA", rep: 37, fanBase: 42913, currentBudget: 164093 },
  { id: 489, name: "Lyon Duchère", tier: 5, baseOvr: 44, color: "e20613", stadium: 5400, country: "FRA", rep: 36, fanBase: 95012, currentBudget: 153394 },
  { id: 483, name: "Saint-Maur", tier: 5, baseOvr: 44, color: "e20613", stadium: 2500, country: "FRA", rep: 36, fanBase: 49911, currentBudget: 153394 },
  { id: 482, name: "Furiani", tier: 5, baseOvr: 44, color: "00529f", stadium: 2000, country: "FRA", rep: 36, fanBase: 42135, currentBudget: 153394 },
  { id: 481, name: "Feignies", tier: 5, baseOvr: 44, color: "00529f", stadium: 1500, country: "FRA", rep: 36, fanBase: 34359, currentBudget: 153394 },
  { id: 488, name: "Bayonne", tier: 5, baseOvr: 43, color: "87ceeb", stadium: 3500, country: "FRA", rep: 35, fanBase: 64736, currentBudget: 143172 },
  { id: 486, name: "Le Poiré", tier: 5, baseOvr: 43, color: "00529f", stadium: 3000, country: "FRA", rep: 35, fanBase: 56960, currentBudget: 143172 },
  { id: 484, name: "Montlouis", tier: 5, baseOvr: 43, color: "00529f", stadium: 1500, country: "FRA", rep: 35, fanBase: 33632, currentBudget: 143172 },
  { id: 485, name: "Valois", tier: 5, baseOvr: 43, color: "00843d", stadium: 1500, country: "FRA", rep: 35, fanBase: 33632, currentBudget: 143172 },
  { id: 487, name: "Pontivy", tier: 5, baseOvr: 42, color: "ffffff", stadium: 2500, country: "FRA", rep: 34, fanBase: 48481, currentBudget: 133413 },
  { id: 490, name: "Rumilly", tier: 5, baseOvr: 42, color: "00529f", stadium: 2000, country: "FRA", rep: 34, fanBase: 40705, currentBudget: 133413 }
]; 

export const PORTUGAL_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  {id: 202, name: "Lisboa Vermelho", tier: 1, baseOvr: 87, color: "e1000f", stadium: 64642, country: "POR", rep: 89, fanBase: 8415543, currentBudget: 79020360},
  {id: 201, name: "Lisboa Verde", tier: 1, baseOvr: 87, color: "008057", stadium: 50095, country: "POR", rep: 89, fanBase: 6669903, currentBudget: 79020360},
  {id: 203, name: "Porto Azul", tier: 1, baseOvr: 86, color: "0054a6", stadium: 50033, country: "POR", rep: 88, fanBase: 6640016, currentBudget: 76326720},
  {id: 204, name: "Braga Vermelho", tier: 1, baseOvr: 82, color: "e32219", stadium: 30286, country: "POR", rep: 84, fanBase: 4185708, currentBudget: 66164160},
  {id: 205, name: "Guimarães Branco", tier: 1, baseOvr: 78, color: "000000", stadium: 30000, country: "POR", rep: 79, fanBase: 4074552, currentBudget: 56943360},
  {id: 206, name: "Moreira de Cónegos", tier: 1, baseOvr: 76, color: "15803d", stadium: 6150, country: "POR", rep: 77, fanBase: 1176976, currentBudget: 52677120},
  {id: 207, name: "Famalicão", tier: 1, baseOvr: 76, color: "0054a6", stadium: 5300, country: "POR", rep: 77, fanBase: 1074976, currentBudget: 52677120},
  {id: 208, name: "Ponta Delgada", tier: 1, baseOvr: 75, color: "e32219", stadium: 12500, country: "POR", rep: 76, fanBase: 1921875, currentBudget: 50625000},
  {id: 209, name: "Vila do Conde", tier: 1, baseOvr: 75, color: "15803d", stadium: 5300, country: "POR", rep: 76, fanBase: 1057875, currentBudget: 50625000},
  {id: 210, name: "Arouca", tier: 1, baseOvr: 75, color: "f2a900", stadium: 5000, country: "POR", rep: 76, fanBase: 1021875, currentBudget: 50625000},
  {id: 212, name: "Barcelos", tier: 1, baseOvr: 74, color: "dc2626", stadium: 12500, country: "POR", rep: 75, fanBase: 1905224, currentBudget: 48626880},
  {id: 213, name: "Estoril", tier: 1, baseOvr: 74, color: "eab308", stadium: 8000, country: "POR", rep: 75, fanBase: 1365224, currentBudget: 48626880},
  {id: 211, name: "Pina Manique", tier: 1, baseOvr: 74, color: "000000", stadium: 2500, country: "POR", rep: 75, fanBase: 705224, currentBudget: 48626880},
  {id: 214, name: "Porto Xadrez", tier: 1, baseOvr: 73, color: "000000", stadium: 28263, country: "POR", rep: 74, fanBase: 3780577, currentBudget: 46681680},
  {id: 219, name: "Funchal Verde", tier: 1, baseOvr: 73, color: "15803d", stadium: 10932, country: "POR", rep: 74, fanBase: 1700857, currentBudget: 46681680},
  {id: 215, name: "Amadora", tier: 1, baseOvr: 73, color: "dc2626", stadium: 9288, country: "POR", rep: 74, fanBase: 1503577, currentBudget: 46681680},
  {id: 216, name: "Funchal Preto", tier: 1, baseOvr: 73, color: "000000", stadium: 5200, country: "POR", rep: 74, fanBase: 1013017, currentBudget: 46681680},
  {id: 217, name: "Vila das Aves", tier: 1, baseOvr: 72, color: "dc2626", stadium: 8000, country: "POR", rep: 73, fanBase: 1333248, currentBudget: 44789760},

  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  {id: 221, name: "Chaves", tier: 2, baseOvr: 72, color: "dc2626", stadium: 8000, country: "POR", rep: 71, fanBase: 799948, currentBudget: 15676416},
  {id: 218, name: "Faro", tier: 2, baseOvr: 72, color: "000000", stadium: 7000, country: "POR", rep: 71, fanBase: 727948, currentBudget: 15676416},
  {id: 220, name: "Vizela", tier: 2, baseOvr: 72, color: "0284c7", stadium: 6000, country: "POR", rep: 71, fanBase: 655948, currentBudget: 15676416},
  {id: 223, name: "Paços de Ferreira", tier: 2, baseOvr: 71, color: "eab308", stadium: 9076, country: "POR", rep: 70, fanBase: 868218, currentBudget: 15032544},
  {id: 222, name: "Portimão", tier: 2, baseOvr: 71, color: "000000", stadium: 6000, country: "POR", rep: 70, fanBase: 646746, currentBudget: 15032544},
  {id: 224, name: "Viseu", tier: 2, baseOvr: 70, color: "000000", stadium: 7744, country: "POR", rep: 69, fanBase: 763368, currentBudget: 14406000},
  {id: 226, name: "Leiria", tier: 2, baseOvr: 69, color: "dc2626", stadium: 23888, country: "POR", rep: 68, fanBase: 1917036, currentBudget: 13797681},
  {id: 225, name: "Torres Vedras", tier: 2, baseOvr: 69, color: "15803d", stadium: 4500, country: "POR", rep: 68, fanBase: 519036, currentBudget: 13797681},
  {id: 228, name: "Santa Maria da Feira", tier: 2, baseOvr: 68, color: "0054a6", stadium: 5500, country: "POR", rep: 67, fanBase: 584659, currentBudget: 13207392},
  {id: 234, name: "Lisboa Vermelho B", tier: 2, baseOvr: 68, color: "e1000f", stadium: 3000, country: "POR", rep: 67, fanBase: 404659, currentBudget: 13207392},
  {id: 235, name: "Porto Azul B", tier: 2, baseOvr: 68, color: "0054a6", stadium: 3000, country: "POR", rep: 67, fanBase: 404659, currentBudget: 13207392},
  {id: 227, name: "Mafra", tier: 2, baseOvr: 68, color: "eab308", stadium: 1250, country: "POR", rep: 67, fanBase: 278659, currentBudget: 13207392},
  {id: 230, name: "Matosinhos", tier: 2, baseOvr: 67, color: "dc2626", stadium: 9730, country: "POR", rep: 66, fanBase: 881023, currentBudget: 12634992},
  {id: 231, name: "Alverca", tier: 2, baseOvr: 67, color: "2563eb", stadium: 7705, country: "POR", rep: 66, fanBase: 735223, currentBudget: 12634992},
  {id: 229, name: "Penafiel", tier: 2, baseOvr: 67, color: "dc2626", stadium: 5230, country: "POR", rep: 66, fanBase: 557023, currentBudget: 12634992},
  {id: 236, name: "Belém OS", tier: 2, baseOvr: 67, color: "008057", stadium: 3000, country: "POR", rep: 66, fanBase: 396463, currentBudget: 12634992},
  {id: 232, name: "Felgueiras", tier: 2, baseOvr: 66, color: "15803d", stadium: 7000, country: "POR", rep: 65, fanBase: 676483, currentBudget: 12079680},
  {id: 233, name: "Oliveira de Azeméis", tier: 2, baseOvr: 66, color: "dc2626", stadium: 4000, country: "POR", rep: 65, fanBase: 460483, currentBudget: 12079680},

  // ==========================================
  // TIER 3 (18 Clubs)
  // ==========================================
  {id: 238, name: "Coimbra", tier: 3, baseOvr: 65, color: "000000", stadium: 29622, country: "POR", rep: 62, fanBase: 1378531, currentBudget: 4035903},
  {id: 237, name: "Lisboa Verde B", tier: 3, baseOvr: 65, color: "0054a6", stadium: 19856, country: "POR", rep: 62, fanBase: 956631, currentBudget: 4035903},
  {id: 239, name: "Póvoa de Varzim", tier: 3, baseOvr: 64, color: "000000", stadium: 7280, country: "POR", rep: 61, fanBase: 408870, currentBudget: 3852038},
  {id: 241, name: "Lourosa", tier: 3, baseOvr: 63, color: "f2a900", stadium: 8000, country: "POR", rep: 60, fanBase: 435759, currentBudget: 3673752},
  {id: 240, name: "Covilhã", tier: 3, baseOvr: 63, color: "15803d", stadium: 3000, country: "POR", rep: 60, fanBase: 219759, currentBudget: 3673752},
  {id: 242, name: "Queluz", tier: 3, baseOvr: 62, color: "dc2626", stadium: 10000, country: "POR", rep: 59, fanBase: 517799, currentBudget: 3500913},
  {id: 244, name: "Trofa", tier: 3, baseOvr: 62, color: "dc2626", stadium: 5074, country: "POR", rep: 59, fanBase: 304996, currentBudget: 3500913},
  {id: 243, name: "Amarante", tier: 3, baseOvr: 62, color: "15803d", stadium: 5000, country: "POR", rep: 59, fanBase: 301799, currentBudget: 3500913},
  {id: 253, name: "Braga Vermelho B", tier: 3, baseOvr: 62, color: "e32219", stadium: 3000, country: "POR", rep: 59, fanBase: 215399, currentBudget: 3500913},
  {id: 246, name: "Caldas da Rainha", tier: 3, baseOvr: 61, color: "0054a6", stadium: 13000, country: "POR", rep: 58, fanBase: 643292, currentBudget: 3333333},
  {id: 245, name: "São João da Madeira", tier: 3, baseOvr: 61, color: "000000", stadium: 4000, country: "POR", rep: 58, fanBase: 254492, currentBudget: 3333333},
  {id: 254, name: "Guimarães Branco B", tier: 3, baseOvr: 61, color: "000000", stadium: 2500, country: "POR", rep: 58, fanBase: 189692, currentBudget: 3333333},
  {id: 247, name: "Santarém", tier: 3, baseOvr: 60, color: "dc2626", stadium: 4500, country: "POR", rep: 57, fanBase: 272160, currentBudget: 3171600},
  {id: 248, name: "Santa Maria", tier: 3, baseOvr: 60, color: "eab308", stadium: 2500, country: "POR", rep: 57, fanBase: 185760, currentBudget: 3171600},
  {id: 249, name: "Sintra", tier: 3, baseOvr: 60, color: "dc2626", stadium: 1500, country: "POR", rep: 57, fanBase: 142560, currentBudget: 3171600},
  {id: 250, name: "Viana do Castelo", tier: 3, baseOvr: 59, color: "0054a6", stadium: 3000, country: "POR", rep: 56, fanBase: 203533, currentBudget: 3015468},
  {id: 251, name: "Loulé", tier: 3, baseOvr: 59, color: "dc2626", stadium: 3000, country: "POR", rep: 56, fanBase: 203533, currentBudget: 3015468},
  {id: 252, name: "Mação", tier: 3, baseOvr: 59, color: "eab308", stadium: 3000, country: "POR", rep: 56, fanBase: 203533, currentBudget: 3015468},

  // ==========================================
  // TIER 4 (18 Clubs)
  // ==========================================
  {id: 255, name: "Setúbal", tier: 4, baseOvr: 57, color: "15803d", stadium: 15497, country: "POR", rep: 51, fanBase: 441029, currentBudget: 953801},
  {id: 256, name: "Barreiro", tier: 4, baseOvr: 56, color: "15803d", stadium: 8000, country: "POR", rep: 50, fanBase: 245385, currentBudget: 904455},
  {id: 1094, name: "Amora", tier: 4, baseOvr: 56, color: "2563eb", stadium: 5000, country: "POR", rep: 50, fanBase: 167625, currentBudget: 904455},
  {id: 257, name: "Sintra Coroa", tier: 4, baseOvr: 56, color: "0054a6", stadium: 2800, country: "POR", rep: 50, fanBase: 110601, currentBudget: 904455},
  {id: 258, name: "Barreiro Vermelho", tier: 4, baseOvr: 55, color: "dc2626", stadium: 3000, country: "POR", rep: 49, fanBase: 113702, currentBudget: 856983},
  {id: 259, name: "Gondomar", tier: 4, baseOvr: 55, color: "eab308", stadium: 3000, country: "POR", rep: 49, fanBase: 113702, currentBudget: 856983},
  {id: 260, name: "Espinho", tier: 4, baseOvr: 55, color: "000000", stadium: 3000, country: "POR", rep: 49, fanBase: 113702, currentBudget: 856983},
  {id: 261, name: "Olhão", tier: 4, baseOvr: 54, color: "dc2626", stadium: 5661, country: "POR", rep: 48, fanBase: 180749, currentBudget: 811342},
  {id: 262, name: "Almada", tier: 4, baseOvr: 54, color: "0054a6", stadium: 3500, country: "POR", rep: 48, fanBase: 124741, currentBudget: 811342},
  {id: 263, name: "Sertã", tier: 4, baseOvr: 54, color: "dc2626", stadium: 2500, country: "POR", rep: 48, fanBase: 98821, currentBudget: 811342},
  {id: 264, name: "Montijo", tier: 4, baseOvr: 53, color: "eab308", stadium: 3000, country: "POR", rep: 47, fanBase: 109916, currentBudget: 767475},
  {id: 265, name: "Montemor", tier: 4, baseOvr: 53, color: "15803d", stadium: 2500, country: "POR", rep: 47, fanBase: 96956, currentBudget: 767475},
  {id: 266, name: "Baixa da Banheira", tier: 4, baseOvr: 52, color: "dc2626", stadium: 2000, country: "POR", rep: 46, fanBase: 82206, currentBudget: 725350},
  {id: 267, name: "Esposende", tier: 4, baseOvr: 52, color: "dc2626", stadium: 2000, country: "POR", rep: 46, fanBase: 82206, currentBudget: 725350},
  {id: 268, name: "Estarreja", tier: 4, baseOvr: 52, color: "0054a6", stadium: 2000, country: "POR", rep: 46, fanBase: 82206, currentBudget: 725350},
  {id: 272, name: "Pevidém", tier: 4, baseOvr: 52, color: "15803d", stadium: 2000, country: "POR", rep: 46, fanBase: 82206, currentBudget: 725350},
  {id: 269, name: "Montalegre", tier: 4, baseOvr: 51, color: "15803d", stadium: 2000, country: "POR", rep: 45, fanBase: 80486, currentBudget: 684898},
  {id: 271, name: "Seixal", tier: 4, baseOvr: 51, color: "dc2626", stadium: 2000, country: "POR", rep: 45, fanBase: 80486, currentBudget: 684898},

  // ==========================================
  // TIER 5 (18 Clubs)
  // ==========================================
  {id: 270, name: "Gondomar B", tier: 5, baseOvr: 51, color: "eab308", stadium: 1500, country: "POR", rep: 43, fanBase: 40513, currentBudget: 239714},
  {id: 289, name: "Aveiro", tier: 5, baseOvr: 46, color: "eab308", stadium: 19000, country: "POR", rep: 38, fanBase: 308101, currentBudget: 175653},
  {id: 288, name: "Olivais", tier: 5, baseOvr: 45, color: "15803d", stadium: 3000, country: "POR", rep: 37, fanBase: 58465, currentBudget: 164407},
  {id: 293, name: "Évora", tier: 5, baseOvr: 45, color: "15803d", stadium: 10000, country: "POR", rep: 37, fanBase: 167329, currentBudget: 164407},
  {id: 290, name: "Porto Salgueiros", tier: 5, baseOvr: 45, color: "dc2626", stadium: 2000, country: "POR", rep: 37, fanBase: 42913, currentBudget: 164407},
  {id: 273, name: "Queluz Massamá", tier: 5, baseOvr: 45, color: "15803d", stadium: 1200, country: "POR", rep: 37, fanBase: 30471, currentBudget: 164407},
  {id: 291, name: "Figueira da Foz", tier: 5, baseOvr: 44, color: "15803d", stadium: 9300, country: "POR", rep: 36, fanBase: 155681, currentBudget: 153664},
  {id: 292, name: "Santo Tirso", tier: 5, baseOvr: 44, color: "000000", stadium: 6000, country: "POR", rep: 36, fanBase: 104358, currentBudget: 153664},
  {id: 295, name: "Funchal Amarelo", tier: 5, baseOvr: 44, color: "eab308", stadium: 5000, country: "POR", rep: 36, fanBase: 88806, currentBudget: 153664},
  {id: 275, name: "Loures", tier: 5, baseOvr: 44, color: "15803d", stadium: 1500, country: "POR", rep: 36, fanBase: 34372, currentBudget: 153664},
  {id: 274, name: "Corroios", tier: 5, baseOvr: 44, color: "2563eb", stadium: 1000, country: "POR", rep: 36, fanBase: 26596, currentBudget: 153664},
  {id: 296, name: "Elvas", tier: 5, baseOvr: 43, color: "15803d", stadium: 12000, country: "POR", rep: 35, fanBase: 196924, currentBudget: 143431},
  {id: 294, name: "Campo Maior", tier: 5, baseOvr: 43, color: "15803d", stadium: 5600, country: "POR", rep: 35, fanBase: 97389, currentBudget: 143431},
  {id: 276, name: "Maia", tier: 5, baseOvr: 43, color: "dc2626", stadium: 2000, country: "POR", rep: 35, fanBase: 41400, currentBudget: 143431},
  {id: 277, name: "Ermesinde", tier: 5, baseOvr: 43, color: "000000", stadium: 1500, country: "POR", rep: 35, fanBase: 33624, currentBudget: 143431},
  {id: 298, name: "Évora Verde", tier: 5, baseOvr: 42, color: "1d4ed8", stadium: 2000, country: "POR", rep: 34, fanBase: 40699, currentBudget: 133649},
  {id: 299, name: "Rebordosa", tier: 5, baseOvr: 42, color: "eab308", stadium: 1500, country: "POR", rep: 34, fanBase: 32923, currentBudget: 133649},
  {id: 286, name: "Lisboa Oriental", tier: 5, baseOvr: 42, color: "dc2626", stadium: 1500, country: "POR", rep: 34, fanBase: 32923, currentBudget: 133649},

  // ==========================================
  // TIER 6 (18 Clubs)
  // ==========================================
  {id: 278, name: "Arronches", tier: 6, baseOvr: 42, color: "dc2626", stadium: 1000, country: "POR", rep: 32, fanBase: 15093, currentBudget: 46777},
  {id: 279, name: "Abrantes", tier: 6, baseOvr: 42, color: "dc2626", stadium: 1000, country: "POR", rep: 32, fanBase: 15093, currentBudget: 46777},
  {id: 280, name: "Nisa", tier: 6, baseOvr: 41, color: "dc2626", stadium: 1000, country: "POR", rep: 31, fanBase: 14686, currentBudget: 43527},
  {id: 281, name: "Santa Marta", tier: 6, baseOvr: 41, color: "15803d", stadium: 1000, country: "POR", rep: 31, fanBase: 14686, currentBudget: 43527},
  {id: 297, name: "Caminha", tier: 6, baseOvr: 41, color: "1d4ed8", stadium: 1000, country: "POR", rep: 31, fanBase: 14686, currentBudget: 43527},
  {id: 300, name: "Bragança", tier: 6, baseOvr: 41, color: "dc2626", stadium: 1000, country: "POR", rep: 31, fanBase: 14686, currentBudget: 43527},
  {id: 301, name: "Mirandela", tier: 6, baseOvr: 40, color: "000000", stadium: 2000, country: "POR", rep: 30, fanBase: 23625, currentBudget: 40435},
  {id: 282, name: "São Teotónio", tier: 6, baseOvr: 40, color: "dc2626", stadium: 1000, country: "POR", rep: 30, fanBase: 14299, currentBudget: 40435},
  {id: 283, name: "Nogueira", tier: 6, baseOvr: 40, color: "eab308", stadium: 1000, country: "POR", rep: 30, fanBase: 14299, currentBudget: 40435},
  {id: 302, name: "Mortágua", tier: 6, baseOvr: 40, color: "dc2626", stadium: 1000, country: "POR", rep: 30, fanBase: 14299, currentBudget: 40435},
  {id: 284, name: "Carrazeda", tier: 6, baseOvr: 39, color: "15803d", stadium: 1000, country: "POR", rep: 28, fanBase: 13936, currentBudget: 37517},
  {id: 285, name: "Figueiró", tier: 6, baseOvr: 39, color: "000000", stadium: 1000, country: "POR", rep: 28, fanBase: 13936, currentBudget: 37517},
  {id: 303, name: "Ribeira Grande", tier: 6, baseOvr: 38, color: "008000", stadium: 2000, country: "POR", rep: 27, fanBase: 22915, currentBudget: 34706},
  {id: 304, name: "Praia da Vitória", tier: 6, baseOvr: 38, color: "ff0000", stadium: 1500, country: "POR", rep: 27, fanBase: 18252, currentBudget: 34706},
  {id: 287, name: "Fernão Ferro", tier: 6, baseOvr: 38, color: "0054a6", stadium: 1000, country: "POR", rep: 27, fanBase: 13589, currentBudget: 34706},
  {id: 305, name: "Rabo de Peixe", tier: 6, baseOvr: 37, color: "0000ff", stadium: 1500, country: "POR", rep: 26, fanBase: 17926, currentBudget: 32043},
  {id: 306, name: "Olhão B", tier: 6, baseOvr: 37, color: "dc2626", stadium: 1500, country: "POR", rep: 26, fanBase: 17926, currentBudget: 32043},
  {id: 307, name: "Évora B", tier: 6, baseOvr: 36, color: "008000", stadium: 2000, country: "POR", rep: 25, fanBase: 22278, currentBudget: 29516}
]; 

export const USA_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 1007, name: "Miami Pink", tier: 1, baseOvr: 79, color: "f7b5cd", stadium: 26700, country: "USA", rep: 80, fanBase: 3697039, currentBudget: 59164680 },
  { id: 1028, name: "Austin Green", tier: 1, baseOvr: 78, color: "5d9732", stadium: 37722, country: "USA", rep: 79, fanBase: 5001192, currentBudget: 56946240 },
  { id: 1004, name: "Cincinnati Orange", tier: 1, baseOvr: 78, color: "f26522", stadium: 26000, country: "USA", rep: 79, fanBase: 3594552, currentBudget: 56946240 },
  { id: 1022, name: "Los Angeles Black", tier: 1, baseOvr: 78, color: "000000", stadium: 22000, country: "USA", rep: 79, fanBase: 3114552, currentBudget: 56946240 },
  { id: 1005, name: "Columbus Yellow", tier: 1, baseOvr: 78, color: "fef200", stadium: 20000, country: "USA", rep: 79, fanBase: 2874552, currentBudget: 56946240 },
  { id: 1001, name: "Atlanta Red", tier: 1, baseOvr: 77, color: "800000", stadium: 42500, country: "USA", rep: 78, fanBase: 5556533, currentBudget: 54783960 },
  { id: 1011, name: "New York Sky Blue", tier: 1, baseOvr: 77, color: "6cace4", stadium: 30321, country: "USA", rep: 78, fanBase: 4095053, currentBudget: 54783960 },
  { id: 1021, name: "Los Angeles Galaxy", tier: 1, baseOvr: 77, color: "00245d", stadium: 27000, country: "USA", rep: 78, fanBase: 3696533, currentBudget: 54783960 },
  { id: 1025, name: "Salt Lake Red", tier: 1, baseOvr: 77, color: "b30838", stadium: 20213, country: "USA", rep: 78, fanBase: 2882093, currentBudget: 54783960 },
  { id: 1002, name: "Charlotte Blue", tier: 1, baseOvr: 76, color: "1a85c8", stadium: 38000, country: "USA", rep: 77, fanBase: 4998976, currentBudget: 52677120 },
  { id: 1026, name: "San Diego Wave", tier: 1, baseOvr: 76, color: "182b49", stadium: 35000, country: "USA", rep: 77, fanBase: 4638976, currentBudget: 52677120 },
  { id: 1009, name: "Nashville Yellow", tier: 1, baseOvr: 76, color: "ece81a", stadium: 30000, country: "USA", rep: 77, fanBase: 4038976, currentBudget: 52677120 },
  { id: 1013, name: "Orlando Purple", tier: 1, baseOvr: 76, color: "630f81", stadium: 25500, country: "USA", rep: 77, fanBase: 3498976, currentBudget: 52677120 },
  { id: 1024, name: "Portland Green", tier: 1, baseOvr: 76, color: "00482b", stadium: 25218, country: "USA", rep: 77, fanBase: 3465136, currentBudget: 52677120 },
  { id: 1012, name: "New York Red", tier: 1, baseOvr: 76, color: "e31837", stadium: 25000, country: "USA", rep: 77, fanBase: 3438976, currentBudget: 52677120 },
  { id: 1029, name: "St. Louis Red", tier: 1, baseOvr: 76, color: "e31b23", stadium: 22423, country: "USA", rep: 77, fanBase: 3129736, currentBudget: 52677120 },
  { id: 1030, name: "Vancouver White", tier: 1, baseOvr: 76, color: "00205b", stadium: 22120, country: "USA", rep: 77, fanBase: 3093376, currentBudget: 52677120 },
  { id: 1019, name: "Houston Orange", tier: 1, baseOvr: 76, color: "ff6b00", stadium: 22039, country: "USA", rep: 77, fanBase: 3083656, currentBudget: 52677120 },

  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  { id: 1016, name: "Austin", tier: 2, baseOvr: 76, color: "00b140", stadium: 20500, country: "USA", rep: 75, fanBase: 1739385, currentBudget: 18436992 },
  { id: 1023, name: "Minnesota Blue", tier: 2, baseOvr: 76, color: "9bc2e6", stadium: 19400, country: "USA", rep: 75, fanBase: 1660185, currentBudget: 18436992 },
  { id: 1014, name: "Philadelphia Blue", tier: 2, baseOvr: 76, color: "002d55", stadium: 18500, country: "USA", rep: 75, fanBase: 1595385, currentBudget: 18436992 },
  { id: 1015, name: "Toronto Red", tier: 2, baseOvr: 75, color: "b81d24", stadium: 28351, country: "USA", rep: 74, fanBase: 2294397, currentBudget: 17718750 },
  { id: 1003, name: "Chicago Red", tier: 2, baseOvr: 75, color: "c8102e", stadium: 24995, country: "USA", rep: 74, fanBase: 2052765, currentBudget: 17718750 },
  { id: 1010, name: "New England Blue", tier: 2, baseOvr: 75, color: "0a2240", stadium: 20000, country: "USA", rep: 74, fanBase: 1693125, currentBudget: 17718750 },
  { id: 1006, name: "Washington Black", tier: 2, baseOvr: 75, color: "000000", stadium: 20000, country: "USA", rep: 74, fanBase: 1693125, currentBudget: 17718750 },
  { id: 1008, name: "Montreal Blue", tier: 2, baseOvr: 75, color: "00529b", stadium: 19619, country: "USA", rep: 74, fanBase: 1665693, currentBudget: 17718750 },
  { id: 1018, name: "Dallas Red", tier: 2, baseOvr: 75, color: "e31837", stadium: 19096, country: "USA", rep: 74, fanBase: 1628037, currentBudget: 17718750 },
  { id: 1020, name: "Kansas Blue", tier: 2, baseOvr: 75, color: "91b0d5", stadium: 18467, country: "USA", rep: 74, fanBase: 1582749, currentBudget: 17718750 },
  { id: 1017, name: "Colorado Burgundy", tier: 2, baseOvr: 75, color: "862633", stadium: 18061, country: "USA", rep: 74, fanBase: 1553517, currentBudget: 17718750 },
  { id: 1027, name: "San Jose Blue", tier: 2, baseOvr: 74, color: "0051ba", stadium: 18000, country: "USA", rep: 73, fanBase: 1539134, currentBudget: 17019408 },
  { id: 1038, name: "Louisville Purple", tier: 2, baseOvr: 68, color: "502d7f", stadium: 15304, country: "USA", rep: 67, fanBase: 1290547, currentBudget: 13206144 },
  { id: 1043, name: "Tampa Green", tier: 2, baseOvr: 67, color: "006837", stadium: 7227, country: "USA", rep: 66, fanBase: 700801, currentBudget: 12632046 },
  { id: 1033, name: "Charleston Yellow", tier: 2, baseOvr: 67, color: "fdb913", stadium: 3900, country: "USA", rep: 66, fanBase: 461257, currentBudget: 12632046 },
  { id: 1031, name: "Birmingham Black", tier: 2, baseOvr: 66, color: "000000", stadium: 47100, country: "USA", rep: 65, fanBase: 3563697, currentBudget: 12074832 },
  { id: 1066, name: "Sacramento Red", tier: 2, baseOvr: 66, color: "8b2332", stadium: 11569, country: "USA", rep: 65, fanBase: 1005465, currentBudget: 12074832 },
  { id: 1034, name: "Detroit Rouge", tier: 2, baseOvr: 66, color: "7a1f3d", stadium: 7933, country: "USA", rep: 65, fanBase: 743673, currentBudget: 12074832 },

  // ==========================================
  // TIER 3 (18 Clubs)
  // ==========================================
  { id: 1036, name: "Indianapolis Blue", tier: 3, baseOvr: 65, color: "002d62", stadium: 10524, country: "USA", rep: 62, fanBase: 553501, currentBudget: 4036987 },
  { id: 1040, name: "Pittsburgh Yellow", tier: 3, baseOvr: 65, color: "fdb913", stadium: 5000, country: "USA", rep: 62, fanBase: 314865, currentBudget: 4036987 },
  { id: 1041, name: "Pawtucket Blue", tier: 3, baseOvr: 64, color: "00205b", stadium: 10500, country: "USA", rep: 61, fanBase: 547971, currentBudget: 3853516 },
  { id: 1045, name: "El Paso Navy", tier: 3, baseOvr: 64, color: "152238", stadium: 9500, country: "USA", rep: 61, fanBase: 504771, currentBudget: 3853516 },
  { id: 1044, name: "Colorado Springs Blue", tier: 3, baseOvr: 64, color: "003366", stadium: 8000, country: "USA", rep: 61, fanBase: 439971, currentBudget: 3853516 },
  { id: 1032, name: "Brooklyn Black", tier: 3, baseOvr: 64, color: "000000", stadium: 7000, country: "USA", rep: 61, fanBase: 396771, currentBudget: 3853516 },
  { id: 1039, name: "Miami Blue", tier: 3, baseOvr: 63, color: "002d62", stadium: 20000, country: "USA", rep: 60, fanBase: 954016, currentBudget: 3675690 },
  { id: 1046, name: "Las Vegas Black", tier: 3, baseOvr: 63, color: "000000", stadium: 9334, country: "USA", rep: 60, fanBase: 493245, currentBudget: 3675690 },
  { id: 1048, name: "Monterey Blue", tier: 3, baseOvr: 63, color: "00a3e0", stadium: 6000, country: "USA", rep: 60, fanBase: 349216, currentBudget: 3675690 },
  { id: 1035, name: "Hartford Blue", tier: 3, baseOvr: 63, color: "0033a0", stadium: 5500, country: "USA", rep: 60, fanBase: 327616, currentBudget: 3675690 },
  { id: 1042, name: "Jacksonville Green", tier: 3, baseOvr: 62, color: "15803d", stadium: 12000, country: "USA", rep: 59, fanBase: 604198, currentBudget: 3503421 },
  { id: 1058, name: "New York Green", tier: 3, baseOvr: 62, color: "006837", stadium: 10000, country: "USA", rep: 59, fanBase: 517798, currentBudget: 3503421 },
  { id: 1047, name: "Lexington Blue", tier: 3, baseOvr: 62, color: "00205b", stadium: 7500, country: "USA", rep: 59, fanBase: 409798, currentBudget: 3503421 },
  { id: 1037, name: "Loudoun Red", tier: 3, baseOvr: 62, color: "c8102e", stadium: 5000, country: "USA", rep: 59, fanBase: 301798, currentBudget: 3503421 },
  { id: 1064, name: "Omaha Blue", tier: 3, baseOvr: 60, color: "0033a0", stadium: 9023, country: "USA", rep: 57, fanBase: 467553, currentBudget: 3175200 },
  { id: 1056, name: "Greenville Green", tier: 3, baseOvr: 59, color: "006837", stadium: 6300, country: "USA", rep: 55, fanBase: 346096, currentBudget: 3019071 },
  { id: 1061, name: "Richmond Red", tier: 3, baseOvr: 59, color: "e31b23", stadium: 6000, country: "USA", rep: 55, fanBase: 333136, currentBudget: 3019071 },
  { id: 1055, name: "Madison Pink", tier: 3, baseOvr: 59, color: "f472b6", stadium: 5000, country: "USA", rep: 55, fanBase: 289936, currentBudget: 3019071 },

  // ==========================================
  // TIER 4 (18 Clubs)
  // ==========================================
  { id: 1051, name: "Charlotte Independence", tier: 4, baseOvr: 58, color: "00205b", stadium: 10500, country: "USA", rep: 52, fanBase: 314304, currentBudget: 1003851 },
  { id: 1059, name: "Knoxville Orange", tier: 4, baseOvr: 58, color: "ff6600", stadium: 6355, country: "USA", rep: 52, fanBase: 206865, currentBudget: 1003851 },
  { id: 1052, name: "Chattanooga Red", tier: 4, baseOvr: 58, color: "c8102e", stadium: 6000, country: "USA", rep: 52, fanBase: 197664, currentBudget: 1003851 },
  { id: 1063, name: "Spokane Blue", tier: 4, baseOvr: 58, color: "0051ba", stadium: 5100, country: "USA", rep: 52, fanBase: 174336, currentBudget: 1003851 },
  { id: 1049, name: "Boise Red", tier: 4, baseOvr: 57, color: "dc2626", stadium: 7227, country: "USA", rep: 51, fanBase: 227325, currentBudget: 952817 },
  { id: 1060, name: "Portland Green B", tier: 4, baseOvr: 57, color: "00482b", stadium: 6000, country: "USA", rep: 51, fanBase: 195521, currentBudget: 952817 },
  { id: 1050, name: "Lancaster Blue", tier: 4, baseOvr: 57, color: "182b49", stadium: 5300, country: "USA", rep: 51, fanBase: 177377, currentBudget: 952817 },
  { id: 1057, name: "Naples Sky", tier: 4, baseOvr: 57, color: "00a3e0", stadium: 5000, country: "USA", rep: 51, fanBase: 169601, currentBudget: 952817 },
  { id: 1062, name: "Sarasota Yellow", tier: 4, baseOvr: 57, color: "facc15", stadium: 3000, country: "USA", rep: 51, fanBase: 117761, currentBudget: 952817 },
  { id: 1065, name: "Westchester Blue", tier: 4, baseOvr: 56, color: "002d62", stadium: 3900, country: "USA", rep: 50, fanBase: 139021, currentBudget: 903544 },
  { id: 1054, name: "Fort Wayne Navy", tier: 4, baseOvr: 55, color: "182b49", stadium: 9200, country: "USA", rep: 49, fanBase: 274401, currentBudget: 855994 },
  { id: 1053, name: "Corpus Christi Blue", tier: 4, baseOvr: 55, color: "0284c7", stadium: 5000, country: "USA", rep: 49, fanBase: 165537, currentBudget: 855994 },
  { id: 1072, name: "Annapolis Blue", tier: 4, baseOvr: 50, color: "0284c7", stadium: 10000, country: "USA", rep: 44, fanBase: 286200, currentBudget: 643125 },
  { id: 1069, name: "Des Moines Red", tier: 4, baseOvr: 49, color: "dc2626", stadium: 4000, country: "USA", rep: 43, fanBase: 129092, currentBudget: 605303 },
  { id: 1070, name: "Seattle Ballard", tier: 4, baseOvr: 48, color: "15803d", stadium: 3500, country: "USA", rep: 42, fanBase: 114607, currentBudget: 568996 },
  { id: 1076, name: "London Ontario", tier: 4, baseOvr: 48, color: "000000", stadium: 3000, country: "USA", rep: 42, fanBase: 101647, currentBudget: 568996 },
  { id: 1080, name: "Peoria Green", tier: 4, baseOvr: 48, color: "15803d", stadium: 3000, country: "USA", rep: 42, fanBase: 101647, currentBudget: 568996 },
  { id: 1082, name: "Tucson Red", tier: 4, baseOvr: 48, color: "b91c1c", stadium: 3000, country: "USA", rep: 42, fanBase: 101647, currentBudget: 568996 },

  // ==========================================
  // TIER 5 (18 Clubs)
  // ==========================================
  { id: 1074, name: "Newport News", tier: 5, baseOvr: 48, color: "00205b", stadium: 3000, country: "USA", rep: 40, fanBase: 60988, currentBudget: 199155 },
  { id: 1071, name: "Flint Blue", tier: 5, baseOvr: 48, color: "00205b", stadium: 3000, country: "USA", rep: 40, fanBase: 60988, currentBudget: 199155 },
  { id: 1067, name: "Burlington Green", tier: 5, baseOvr: 48, color: "16a34a", stadium: 2500, country: "USA", rep: 40, fanBase: 53212, currentBudget: 199155 },
  { id: 1077, name: "Long Island Red", tier: 5, baseOvr: 47, color: "b91c1c", stadium: 3000, country: "USA", rep: 39, fanBase: 60111, currentBudget: 186961 },
  { id: 1078, name: "Pennsylvania Blue", tier: 5, baseOvr: 47, color: "0284c7", stadium: 3000, country: "USA", rep: 39, fanBase: 60111, currentBudget: 186961 },
  { id: 1079, name: "Asheville Blue", tier: 5, baseOvr: 47, color: "00205b", stadium: 3000, country: "USA", rep: 39, fanBase: 60111, currentBudget: 186961 },
  { id: 1081, name: "Minneapolis Blue", tier: 5, baseOvr: 47, color: "0284c7", stadium: 3000, country: "USA", rep: 39, fanBase: 60111, currentBudget: 186961 },
  { id: 1083, name: "Little Rock Black", tier: 5, baseOvr: 47, color: "000000", stadium: 3000, country: "USA", rep: 39, fanBase: 60111, currentBudget: 186961 },
  { id: 1084, name: "Laredo Orange", tier: 5, baseOvr: 47, color: "ea580c", stadium: 3000, country: "USA", rep: 39, fanBase: 60111, currentBudget: 186961 },
  { id: 1075, name: "West Chester Navy", tier: 5, baseOvr: 47, color: "1e3a8a", stadium: 2500, country: "USA", rep: 39, fanBase: 52335, currentBudget: 186961 },
  { id: 1068, name: "Ocean City Blue", tier: 5, baseOvr: 47, color: "0284c7", stadium: 2000, country: "USA", rep: 39, fanBase: 44559, currentBudget: 186961 },
  { id: 1111, name: "Statesboro Navy", tier: 5, baseOvr: 46, color: "000080", stadium: 5000, country: "USA", rep: 38, fanBase: 90374, currentBudget: 175277 },
  { id: 1109, name: "Windsor Blue", tier: 5, baseOvr: 46, color: "0000ff", stadium: 3000, country: "USA", rep: 38, fanBase: 59270, currentBudget: 175277 },
  { id: 1110, name: "Fresno Red", tier: 5, baseOvr: 46, color: "ff0000", stadium: 3000, country: "USA", rep: 38, fanBase: 59270, currentBudget: 175277 },
  { id: 1073, name: "Baltimore Black", tier: 5, baseOvr: 46, color: "000000", stadium: 2000, country: "USA", rep: 38, fanBase: 43718, currentBudget: 175277 },
  { id: 1112, name: "Cary Green", tier: 5, baseOvr: 45, color: "008000", stadium: 3000, country: "USA", rep: 37, fanBase: 58465, currentBudget: 164093 },
  { id: 1113, name: "Detroit Stars", tier: 5, baseOvr: 45, color: "ff0000", stadium: 3000, country: "USA", rep: 37, fanBase: 58465, currentBudget: 164093 },
  { id: 1114, name: "Montgomery Black", tier: 5, baseOvr: 45, color: "000000", stadium: 3000, country: "USA", rep: 37, fanBase: 58465, currentBudget: 164093 }
]; 

export const ECUADOR_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 851, name: "Quito Blanca", tier: 1, baseOvr: 81, color: "ffffff", stadium: 41575, country: "ECU", rep: 83, fanBase: 5520441, currentBudget: 63772920 },
  { id: 850, name: "Valle Negra", tier: 1, baseOvr: 81, color: "000000", stadium: 12000, country: "ECU", rep: 83, fanBase: 1971441, currentBudget: 63772920 },
  { id: 852, name: "Guayaquil Amarilla", tier: 1, baseOvr: 80, color: "facc15", stadium: 59283, country: "ECU", rep: 82, fanBase: 7625960, currentBudget: 61440000 },
  { id: 853, name: "Guayaquil Azul", tier: 1, baseOvr: 78, color: "2563eb", stadium: 40020, country: "ECU", rep: 79, fanBase: 5276952, currentBudget: 56946240 },
  { id: 854, name: "Quito Roja", tier: 1, baseOvr: 77, color: "dc2626", stadium: 35258, country: "ECU", rep: 78, fanBase: 4687493, currentBudget: 54783960 },
  { id: 855, name: "Quito Celeste", tier: 1, baseOvr: 76, color: "0284c7", stadium: 35258, country: "ECU", rep: 77, fanBase: 4669936, currentBudget: 52677120 },
  { id: 857, name: "Quito Oro", tier: 1, baseOvr: 75, color: "eab308", stadium: 18799, country: "ECU", rep: 76, fanBase: 2677755, currentBudget: 50625000 },
  { id: 856, name: "Cuenca Roja", tier: 1, baseOvr: 75, color: "b91c1c", stadium: 16500, country: "ECU", rep: 76, fanBase: 2401875, currentBudget: 50625000 },
  { id: 858, name: "Machala Verde", tier: 1, baseOvr: 74, color: "16a34a", stadium: 16500, country: "ECU", rep: 75, fanBase: 2385224, currentBudget: 48626880 },
  { id: 859, name: "Ambato Celeste", tier: 1, baseOvr: 74, color: "0284c7", stadium: 16467, country: "ECU", rep: 75, fanBase: 2381264, currentBudget: 48626880 },
  { id: 862, name: "Ambato Roja", tier: 1, baseOvr: 73, color: "dc2626", stadium: 16467, country: "ECU", rep: 74, fanBase: 2365057, currentBudget: 46682040 },
  { id: 860, name: "Manta Amarilla", tier: 1, baseOvr: 73, color: "eab308", stadium: 14000, country: "ECU", rep: 74, fanBase: 2069017, currentBudget: 46682040 },
  { id: 861, name: "Manta Celeste", tier: 1, baseOvr: 73, color: "0284c7", stadium: 14000, country: "ECU", rep: 74, fanBase: 2069017, currentBudget: 46682040 },
  { id: 863, name: "Quito Chulla", tier: 1, baseOvr: 72, color: "881337", stadium: 35258, country: "ECU", rep: 73, fanBase: 4604208, currentBudget: 44789760 },
  { id: 864, name: "Loja Blanca", tier: 1, baseOvr: 72, color: "2563eb", stadium: 10000, country: "ECU", rep: 73, fanBase: 1573248, currentBudget: 44789760 },
  { id: 865, name: "Echaleche Verde", tier: 1, baseOvr: 72, color: "16a34a", stadium: 8200, country: "ECU", rep: 73, fanBase: 1357248, currentBudget: 44789760 },
  { id: 866, name: "Guayaquil Celeste", tier: 1, baseOvr: 68, color: "0284c7", stadium: 10152, country: "ECU", rep: 69, fanBase: 1532672, currentBudget: 37731840 },
  { id: 867, name: "Gualaceo Amarilla", tier: 1, baseOvr: 68, color: "eab308", stadium: 2791, country: "ECU", rep: 69, fanBase: 649352, currentBudget: 37731840 },

  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  { id: 868, name: "Guayaquil Patria", tier: 2, baseOvr: 67, color: "dc2626", stadium: 5000, country: "ECU", rep: 66, fanBase: 540457, currentBudget: 12632046 },
  { id: 869, name: "Cumbayá", tier: 2, baseOvr: 66, color: "2563eb", stadium: 35258, country: "ECU", rep: 65, fanBase: 2711073, currentBudget: 12074832 },
  { id: 870, name: "Ibarra", tier: 2, baseOvr: 66, color: "16a34a", stadium: 18600, country: "ECU", rep: 65, fanBase: 1511697, currentBudget: 12074832 },
  { id: 871, name: "Valle Negra B", tier: 2, baseOvr: 65, color: "000000", stadium: 12000, country: "ECU", rep: 64, fanBase: 1028775, currentBudget: 11534250 },
  { id: 872, name: "Guayaquil Everest", tier: 2, baseOvr: 64, color: "0284c7", stadium: 14000, country: "ECU", rep: 63, fanBase: 1165286, currentBudget: 11010048 },
  { id: 874, name: "Atuntaqui", tier: 2, baseOvr: 64, color: "eab308", stadium: 10000, country: "ECU", rep: 63, fanBase: 877286, currentBudget: 11010048 },
  { id: 873, name: "Pelileo", tier: 2, baseOvr: 64, color: "2563eb", stadium: 8000, country: "ECU", rep: 63, fanBase: 733286, currentBudget: 11010048 },
  { id: 877, name: "Quito Policial", tier: 2, baseOvr: 63, color: "881337", stadium: 35258, country: "ECU", rep: 62, fanBase: 2688604, currentBudget: 10501974 },
  { id: 875, name: "Ibarra Roja", tier: 2, baseOvr: 63, color: "dc2626", stadium: 18600, country: "ECU", rep: 62, fanBase: 1489228, currentBudget: 10501974 },
  { id: 876, name: "Esmeraldas", tier: 2, baseOvr: 63, color: "16a34a", stadium: 14000, country: "ECU", rep: 62, fanBase: 1158028, currentBudget: 10501974 },
  { id: 879, name: "Portoviejo", tier: 2, baseOvr: 62, color: "008000", stadium: 18000, country: "ECU", rep: 61, fanBase: 1438996, currentBudget: 10009776 },
  { id: 880, name: "Riobamba", tier: 2, baseOvr: 62, color: "0000ff", stadium: 18000, country: "ECU", rep: 61, fanBase: 1438996, currentBudget: 10009776 },
  { id: 878, name: "Guayaquil Búhos", tier: 2, baseOvr: 62, color: "008000", stadium: 5000, country: "ECU", rep: 61, fanBase: 502996, currentBudget: 10009776 },
  { id: 883, name: "Machala Amarilla", tier: 2, baseOvr: 61, color: "ffd700", stadium: 16000, country: "ECU", rep: 60, fanBase: 1288188, currentBudget: 9533202 },
  { id: 881, name: "Quito Verde", tier: 2, baseOvr: 61, color: "008000", stadium: 15000, country: "ECU", rep: 60, fanBase: 1216188, currentBudget: 9533202 },
  { id: 882, name: "Vinces", tier: 2, baseOvr: 61, color: "ff0000", stadium: 5000, country: "ECU", rep: 60, fanBase: 496188, currentBudget: 9533202 },
  { id: 885, name: "Quevedo", tier: 2, baseOvr: 60, color: "ff0000", stadium: 15000, country: "ECU", rep: 59, fanBase: 1209600, currentBudget: 9072000 },
  { id: 884, name: "Guayaquil Rocafuerte", tier: 2, baseOvr: 60, color: "000000", stadium: 10000, country: "ECU", rep: 59, fanBase: 849600, currentBudget: 9072000 }    
];

export const SCOTLAND_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 1201, name: "Glasgow Green", tier: 1, baseOvr: 76, color: "008000", stadium: 60411, country: "SCO", rep: 77, fanBase: 7688296, currentBudget: 52677120 },
  { id: 1202, name: "Glasgow Blue", tier: 1, baseOvr: 76, color: "0000ff", stadium: 50817, country: "SCO", rep: 77, fanBase: 6537016, currentBudget: 52677120 },
  { id: 1203, name: "Edinburgh Maroon", tier: 1, baseOvr: 71, color: "800000", stadium: 19852, country: "SCO", rep: 72, fanBase: 2740151, currentBudget: 42949320 },
  { id: 1204, name: "Edinburgh Green", tier: 1, baseOvr: 71, color: "008000", stadium: 20421, country: "SCO", rep: 72, fanBase: 2808431, currentBudget: 42949320 },
  { id: 1205, name: "Aberdeen Red", tier: 1, baseOvr: 70, color: "cc0000", stadium: 20866, country: "SCO", rep: 71, fanBase: 2846920, currentBudget: 41160000 },
  { id: 1206, name: "Kilmarnock Blue", tier: 1, baseOvr: 69, color: "0000ff", stadium: 17889, country: "SCO", rep: 70, fanBase: 2475189, currentBudget: 39421080 },
  { id: 1207, name: "Paisley Black", tier: 1, baseOvr: 68, color: "000000", stadium: 7937, country: "SCO", rep: 69, fanBase: 1266872, currentBudget: 37731840 },
  { id: 1208, name: "Motherwell Amber", tier: 1, baseOvr: 68, color: "ffc000", stadium: 13677, country: "SCO", rep: 69, fanBase: 1955672, currentBudget: 37731840 },
  { id: 1209, name: "Dundee Orange", tier: 1, baseOvr: 68, color: "f58220", stadium: 14223, country: "SCO", rep: 69, fanBase: 2021192, currentBudget: 37731840 },
  { id: 1210, name: "Dundee Blue", tier: 1, baseOvr: 67, color: "000080", stadium: 11506, country: "SCO", rep: 68, fanBase: 1681483, currentBudget: 36091560 },
  { id: 1211, name: "Perth Blue", tier: 1, baseOvr: 67, color: "0000ff", stadium: 10696, country: "SCO", rep: 68, fanBase: 1584283, currentBudget: 36091560 },
  { id: 1212, name: "Dingwall Blue", tier: 1, baseOvr: 66, color: "000080", stadium: 6541, country: "SCO", rep: 67, fanBase: 1072416, currentBudget: 34499520 },
  { id: 1213, name: "Livingston Amber", tier: 1, baseOvr: 66, color: "ffc000", stadium: 9512, country: "SCO", rep: 67, fanBase: 1428936, currentBudget: 34499520 },
  { id: 1214, name: "Glasgow Red-Yellow", tier: 1, baseOvr: 65, color: "ff0000", stadium: 10102, country: "SCO", rep: 66, fanBase: 1486865, currentBudget: 32955000 },
  { id: 1215, name: "Dunfermline Black", tier: 1, baseOvr: 65, color: "000000", stadium: 11494, country: "SCO", rep: 66, fanBase: 1653905, currentBudget: 32955000 },
  { id: 1216, name: "Kirkcaldy Blue", tier: 1, baseOvr: 64, color: "000080", stadium: 8867, country: "SCO", rep: 65, fanBase: 1326184, currentBudget: 31457280 },
  { id: 1217, name: "Ayr Black", tier: 1, baseOvr: 64, color: "000000", stadium: 10185, country: "SCO", rep: 65, fanBase: 1484344, currentBudget: 31457280 },
  { id: 1218, name: "Falkirk Blue", tier: 1, baseOvr: 64, color: "000080", stadium: 7937, country: "SCO", rep: 65, fanBase: 1214584, currentBudget: 31457280 },

  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  { id: 1219, name: "Inverness Blue", tier: 2, baseOvr: 63, color: "0000ff", stadium: 7512, country: "SCO", rep: 62, fanBase: 690892, currentBudget: 10501974 },
  { id: 1220, name: "Glasgow Spiders", tier: 2, baseOvr: 63, color: "000000", stadium: 5150, country: "SCO", rep: 62, fanBase: 520828, currentBudget: 10501974 },
  { id: 1221, name: "Arbroath Maroon", tier: 2, baseOvr: 62, color: "800000", stadium: 6600, country: "SCO", rep: 61, fanBase: 618196, currentBudget: 10009776 },
  { id: 1222, name: "Greenock Blue", tier: 2, baseOvr: 62, color: "0000ff", stadium: 11589, country: "SCO", rep: 61, fanBase: 977404, currentBudget: 10009776 },
  { id: 1223, name: "Airdrie Red", tier: 2, baseOvr: 61, color: "ff0000", stadium: 10101, country: "SCO", rep: 60, fanBase: 863460, currentBudget: 9533202 },
  { id: 1224, name: "Hamilton Red", tier: 2, baseOvr: 61, color: "ff0000", stadium: 6018, country: "SCO", rep: 60, fanBase: 569484, currentBudget: 9533202 },
  { id: 1225, name: "Aberdeen Cove", tier: 2, baseOvr: 60, color: "0000ff", stadium: 3000, country: "SCO", rep: 59, fanBase: 345600, currentBudget: 9072000 },
  { id: 1226, name: "Dumfries Blue", tier: 2, baseOvr: 60, color: "0000ff", stadium: 8690, country: "SCO", rep: 59, fanBase: 755280, currentBudget: 9072000 },
  { id: 1227, name: "Alloa Gold", tier: 2, baseOvr: 60, color: "ffd700", stadium: 3100, country: "SCO", rep: 59, fanBase: 352800, currentBudget: 9072000 },
  { id: 1228, name: "Montrose Blue", tier: 2, baseOvr: 59, color: "0000ff", stadium: 4936, country: "SCO", rep: 57, fanBase: 478619, currentBudget: 8625918 },
  { id: 1229, name: "Kelty Maroon", tier: 2, baseOvr: 59, color: "800000", stadium: 2181, country: "SCO", rep: 57, fanBase: 280259, currentBudget: 8625918 },
  { id: 1230, name: "Annan Gold", tier: 2, baseOvr: 58, color: "ffd700", stadium: 2504, country: "SCO", rep: 56, fanBase: 297355, currentBudget: 8194704 },
  { id: 1231, name: "Stirling Red", tier: 2, baseOvr: 58, color: "ff0000", stadium: 3808, country: "SCO", rep: 56, fanBase: 391243, currentBudget: 8194704 },
  { id: 1232, name: "Edinburgh White", tier: 2, baseOvr: 57, color: "ffffff", stadium: 5000, country: "SCO", rep: 55, fanBase: 471115, currentBudget: 7778106 },
  { id: 1233, name: "Peterhead Blue", tier: 2, baseOvr: 57, color: "0000ff", stadium: 4000, country: "SCO", rep: 55, fanBase: 399115, currentBudget: 7778106 },
  { id: 1234, name: "Forfar Blue", tier: 2, baseOvr: 56, color: "0000ff", stadium: 4602, country: "SCO", rep: 54, fanBase: 436713, currentBudget: 7375872 },
  { id: 1235, name: "Dumbarton Gold", tier: 2, baseOvr: 56, color: "ffd700", stadium: 2020, country: "SCO", rep: 54, fanBase: 250809, currentBudget: 7375872 },
  { id: 1236, name: "Cumbernauld White", tier: 2, baseOvr: 55, color: "ffffff", stadium: 8006, country: "SCO", rep: 53, fanBase: 676257, currentBudget: 6987750 }
];

export const WALES_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
{ id: 1301, name: "Croesoswallt Park", tier: 1, baseOvr: 62, color: "008000", stadium: 3000, country: "WAL", rep: 63, fanBase: 598328, currentBudget: 28599360 },
  { id: 1302, name: "Cei Connah", tier: 1, baseOvr: 60, color: "ff0000", stadium: 1500, country: "WAL", rep: 61, fanBase: 396000, currentBudget: 25920000 },
  { id: 1303, name: "Y Bala Maes Tegid", tier: 1, baseOvr: 58, color: "000000", stadium: 3000, country: "WAL", rep: 58, fanBase: 555112, currentBudget: 23413440 },
  { id: 1304, name: "Pen-y-bont Bryntirion", tier: 1, baseOvr: 57, color: "0000ff", stadium: 3000, country: "WAL", rep: 57, fanBase: 545193, currentBudget: 22223160 },
  { id: 1305, name: "Y Drenewydd Latham", tier: 1, baseOvr: 57, color: "ff0000", stadium: 5000, country: "WAL", rep: 57, fanBase: 785193, currentBudget: 22223160 },
  { id: 1306, name: "Caernarfon Cofis", tier: 1, baseOvr: 56, color: "ffff00", stadium: 3000, country: "WAL", rep: 56, fanBase: 535616, currentBudget: 21073920 },
  { id: 1307, name: "Hwlffordd Bridge", tier: 1, baseOvr: 56, color: "0000ff", stadium: 2000, country: "WAL", rep: 56, fanBase: 415616, currentBudget: 21073920 },
  { id: 1308, name: "Y Barri Linnets", tier: 1, baseOvr: 56, color: "ffff00", stadium: 3000, country: "WAL", rep: 56, fanBase: 535616, currentBudget: 21073920 },
  { id: 1309, name: "Cyncoed Archers", tier: 1, baseOvr: 55, color: "800000", stadium: 1500, country: "WAL", rep: 55, fanBase: 346375, currentBudget: 19965000 },
  { id: 1310, name: "Aberystwyth Ceredigion", tier: 1, baseOvr: 55, color: "008000", stadium: 5000, country: "WAL", rep: 55, fanBase: 766375, currentBudget: 19965000 },
  { id: 1311, name: "Pontypridd Trefforest", tier: 1, baseOvr: 54, color: "000000", stadium: 1000, country: "WAL", rep: 54, fanBase: 277464, currentBudget: 18895680 },
  { id: 1312, name: "Bae Colwyn Seagulls", tier: 1, baseOvr: 54, color: "800000", stadium: 2500, country: "WAL", rep: 54, fanBase: 457464, currentBudget: 18895680 },
  { id: 1313, name: "Llansawel Reds", tier: 1, baseOvr: 53, color: "ff0000", stadium: 1000, country: "WAL", rep: 53, fanBase: 268877, currentBudget: 17865240 },
  { id: 1314, name: "Y Fflint Silkmen", tier: 1, baseOvr: 53, color: "000000", stadium: 1000, country: "WAL", rep: 53, fanBase: 268877, currentBudget: 17865240 },
  { id: 1315, name: "Caerfyrddin Old Gold", tier: 1, baseOvr: 52, color: "ffd700", stadium: 3000, country: "WAL", rep: 52, fanBase: 500608, currentBudget: 16872960 },
  { id: 1316, name: "Aberafan Lido", tier: 1, baseOvr: 52, color: "ff0000", stadium: 4200, country: "WAL", rep: 52, fanBase: 644608, currentBudget: 16872960 },
  { id: 1317, name: "Brychdyn Wingmakers", tier: 1, baseOvr: 52, color: "0000ff", stadium: 1600, country: "WAL", rep: 52, fanBase: 332608, currentBudget: 16872960 },
  { id: 1318, name: "Merthyr Martyrs", tier: 1, baseOvr: 51, color: "ffd700", stadium: 3200, country: "WAL", rep: 51, fanBase: 516651, currentBudget: 15918120 }
];

export const BRAZIL_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 1401, name: "Verdão São Paulo", tier: 1, baseOvr: 80, color: "008000", stadium: 43713, country: "BRA", rep: 82, fanBase: 5757560, currentBudget: 61440000 },
  { id: 1402, name: "Rio Mengão", tier: 1, baseOvr: 80, color: "c8102e", stadium: 78838, country: "BRA", rep: 82, fanBase: 9972560, currentBudget: 61440000 },
  { id: 1403, name: "Belo Horizonte Galo", tier: 1, baseOvr: 79, color: "000000", stadium: 46000, country: "BRA", rep: 80, fanBase: 6013039, currentBudget: 59164680 },
  { id: 1404, name: "Rio Flu", tier: 1, baseOvr: 78, color: "800000", stadium: 78838, country: "BRA", rep: 79, fanBase: 9935112, currentBudget: 56946240 },
  { id: 1405, name: "São Paulo Soberano", tier: 1, baseOvr: 78, color: "ff0000", stadium: 72039, country: "BRA", rep: 79, fanBase: 9119232, currentBudget: 56946240 },
  { id: 1406, name: "Porto Alegre Imortal", tier: 1, baseOvr: 78, color: "0000ff", stadium: 55662, country: "BRA", rep: 79, fanBase: 7153992, currentBudget: 56946240 },
  { id: 1407, name: "Porto Alegre Colorado", tier: 1, baseOvr: 77, color: "ff0000", stadium: 50128, country: "BRA", rep: 78, fanBase: 6471893, currentBudget: 54783960 },
  { id: 1408, name: "São Paulo Timão", tier: 1, baseOvr: 77, color: "000000", stadium: 49282, country: "BRA", rep: 78, fanBase: 6370373, currentBudget: 54783960 },
  { id: 1409, name: "Curitiba Furacão", tier: 1, baseOvr: 76, color: "c8102e", stadium: 42372, country: "BRA", rep: 77, fanBase: 5523616, currentBudget: 52677120 },
  { id: 1410, name: "Rio Fogão", tier: 1, baseOvr: 76, color: "000000", stadium: 46831, country: "BRA", rep: 77, fanBase: 6058696, currentBudget: 52677120 },
  { id: 1411, name: "Santos Peixe", tier: 1, baseOvr: 75, color: "ffffff", stadium: 16068, country: "BRA", rep: 76, fanBase: 2350035, currentBudget: 50625000 },
  { id: 1412, name: "Belo Horizonte Raposa", tier: 1, baseOvr: 75, color: "0000ff", stadium: 61846, country: "BRA", rep: 76, fanBase: 7843395, currentBudget: 50625000 },
  { id: 1413, name: "Fortaleza Leão", tier: 1, baseOvr: 75, color: "0000ff", stadium: 63903, country: "BRA", rep: 76, fanBase: 8090235, currentBudget: 50625000 },
  { id: 1414, name: "Bragança Massa Bruta", tier: 1, baseOvr: 74, color: "ff0000", stadium: 17022, country: "BRA", rep: 75, fanBase: 2447864, currentBudget: 48626880 },
  { id: 1415, name: "Salvador Esquadrão", tier: 1, baseOvr: 74, color: "0000ff", stadium: 50025, country: "BRA", rep: 75, fanBase: 6408224, currentBudget: 48626880 },
  { id: 1416, name: "Rio Cruzmaltino", tier: 1, baseOvr: 74, color: "000000", stadium: 21880, country: "BRA", rep: 75, fanBase: 3030824, currentBudget: 48626880 },
  { id: 1417, name: "Cuiabá Dourado", tier: 1, baseOvr: 73, color: "008000", stadium: 42900, country: "BRA", rep: 74, fanBase: 5537017, currentBudget: 46682040 },
  { id: 1418, name: "Salvador Leão", tier: 1, baseOvr: 73, color: "c8102e", stadium: 35000, country: "BRA", rep: 74, fanBase: 4589017, currentBudget: 46682040 },

  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  { id: 1419, name: "Goiânia Esmeraldino", tier: 2, baseOvr: 72, color: "008000", stadium: 50049, country: "BRA", rep: 71, fanBase: 3827476, currentBudget: 15676416 },
  { id: 1420, name: "Caxias Papo", tier: 2, baseOvr: 72, color: "008000", stadium: 23726, country: "BRA", rep: 71, fanBase: 1932220, currentBudget: 15676416 },
  { id: 1421, name: "Curitiba Coxa", tier: 2, baseOvr: 72, color: "008000", stadium: 40502, country: "BRA", rep: 71, fanBase: 3140092, currentBudget: 15676416 },
  { id: 1422, name: "Fortaleza Vozão", tier: 2, baseOvr: 71, color: "000000", stadium: 63903, country: "BRA", rep: 70, fanBase: 4815762, currentBudget: 15032262 },
  { id: 1423, name: "Recife Leão", tier: 2, baseOvr: 71, color: "c8102e", stadium: 32983, country: "BRA", rep: 70, fanBase: 2589522, currentBudget: 15032262 },
  { id: 1424, name: "Goiânia Dragão", tier: 2, baseOvr: 71, color: "c8102e", stadium: 12500, country: "BRA", rep: 70, fanBase: 1114746, currentBudget: 15032262 },
  { id: 1425, name: "Goiânia Tigre", tier: 2, baseOvr: 70, color: "ff0000", stadium: 11788, country: "BRA", rep: 69, fanBase: 1055736, currentBudget: 14406000 },
  { id: 1426, name: "Criciúma Tigre", tier: 2, baseOvr: 70, color: "ffc000", stadium: 19225, country: "BRA", rep: 69, fanBase: 1590000, currentBudget: 14406000 },
  { id: 1427, name: "Campinas Bugre", tier: 2, baseOvr: 70, color: "008000", stadium: 29108, country: "BRA", rep: 69, fanBase: 2300016, currentBudget: 14406000 },
  { id: 1428, name: "Campinas Macaca", tier: 2, baseOvr: 69, color: "000000", stadium: 17728, country: "BRA", rep: 68, fanBase: 1473521, currentBudget: 13797378 },
  { id: 1429, name: "Maceió Galo", tier: 2, baseOvr: 69, color: "ff0000", stadium: 19105, country: "BRA", rep: 68, fanBase: 1572665, currentBudget: 13797378 },
  { id: 1430, name: "Florianópolis Leão", tier: 2, baseOvr: 69, color: "0000ff", stadium: 17800, country: "BRA", rep: 68, fanBase: 1478705, currentBudget: 13797378 },
  { id: 1431, name: "Chapecó Verdão", tier: 2, baseOvr: 68, color: "008000", stadium: 20069, country: "BRA", rep: 67, fanBase: 1633627, currentBudget: 13206144 },
  { id: 1432, name: "Itu Galo", tier: 2, baseOvr: 68, color: "c8102e", stadium: 18560, country: "BRA", rep: 67, fanBase: 1525039, currentBudget: 13206144 },
  { id: 1433, name: "Mirassol Leão", tier: 2, baseOvr: 68, color: "ffc000", stadium: 15000, country: "BRA", rep: 67, fanBase: 1268659, currentBudget: 13206144 },
  { id: 1434, name: "Novo Horizonte Tigre", tier: 2, baseOvr: 67, color: "ffc000", stadium: 12398, country: "BRA", rep: 66, fanBase: 1073113, currentBudget: 12632046 },
  { id: 1435, name: "São Luís Bolívia", tier: 2, baseOvr: 67, color: "ff0000", stadium: 40149, country: "BRA", rep: 66, fanBase: 3071185, currentBudget: 12632046 },
  { id: 1436, name: "Tombos Gavião", tier: 2, baseOvr: 67, color: "ff0000", stadium: 3050, country: "BRA", rep: 66, fanBase: 400057, currentBudget: 12632046 }
];

export const POLAND_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
 { id: 1501, name: "Warszawa Wojskowi", tier: 1, baseOvr: 73, color: "ffffff", stadium: 31800, country: "POL", rep: 74, fanBase: 4205017, currentBudget: 46682040 },
  { id: 1502, name: "Poznań Kolejorz", tier: 1, baseOvr: 72, color: "0000ff", stadium: 42837, country: "POL", rep: 73, fanBase: 5513688, currentBudget: 44789760 },
  { id: 1503, name: "Raków Częstochowa", tier: 1, baseOvr: 72, color: "ff0000", stadium: 5500, country: "POL", rep: 73, fanBase: 1033248, currentBudget: 44789760 },
  { id: 1504, name: "Szczecin Portowcy", tier: 1, baseOvr: 71, color: "0000ff", stadium: 21163, country: "POL", rep: 72, fanBase: 2897471, currentBudget: 42949320 },
  { id: 1505, name: "Białystok Podlasie", tier: 1, baseOvr: 70, color: "ffff00", stadium: 22432, country: "POL", rep: 71, fanBase: 3034840, currentBudget: 41160000 },
  { id: 1506, name: "Śląsk Wrocław", tier: 1, baseOvr: 70, color: "008000", stadium: 42771, country: "POL", rep: 71, fanBase: 5475520, currentBudget: 41160000 },
  { id: 1507, name: "Zabrze Górnicy", tier: 1, baseOvr: 69, color: "ffffff", stadium: 24563, country: "POL", rep: 70, fanBase: 3276069, currentBudget: 39421080 },
  { id: 1508, name: "Widzew Łódź", tier: 1, baseOvr: 68, color: "ff0000", stadium: 18018, country: "POL", rep: 69, fanBase: 2476592, currentBudget: 37731840 },
  { id: 1509, name: "Kraków Biała Gwiazda", tier: 1, baseOvr: 68, color: "ff0000", stadium: 33326, country: "POL", rep: 69, fanBase: 4313552, currentBudget: 37731840 },
  { id: 1510, name: "Radom Zieloni", tier: 1, baseOvr: 68, color: "008000", stadium: 8840, country: "POL", rep: 69, fanBase: 1375232, currentBudget: 37731840 },
  { id: 1511, name: "Lubin Miedziowi", tier: 1, baseOvr: 67, color: "b87333", stadium: 16068, country: "POL", rep: 68, fanBase: 2228923, currentBudget: 36091560 },
  { id: 1512, name: "Gliwice Okrzei", tier: 1, baseOvr: 67, color: "0000ff", stadium: 9913, country: "POL", rep: 68, fanBase: 1490323, currentBudget: 36091560 },
  { id: 1513, name: "Kraków Pasy", tier: 1, baseOvr: 67, color: "ffffff", stadium: 15016, country: "POL", rep: 68, fanBase: 2102683, currentBudget: 36091560 },
  { id: 1514, name: "Mielec Lotnicy", tier: 1, baseOvr: 66, color: "ffffff", stadium: 6864, country: "POL", rep: 67, fanBase: 1111176, currentBudget: 34499520 },
  { id: 1515, name: "Kielce Złocisto-Krwiści", tier: 1, baseOvr: 66, color: "ffff00", stadium: 15500, country: "POL", rep: 67, fanBase: 2147496, currentBudget: 34499520 },
  { id: 1516, name: "Poznań Wilda", tier: 1, baseOvr: 65, color: "008000", stadium: 5345, country: "POL", rep: 66, fanBase: 916025, currentBudget: 32955000 },
  { id: 1517, name: "Chorzów Batory", tier: 1, baseOvr: 65, color: "0000ff", stadium: 9300, country: "POL", rep: 66, fanBase: 1390625, currentBudget: 32955000 },
  { id: 1518, name: "Łódź Polesie", tier: 1, baseOvr: 65, color: "ffffff", stadium: 18029, country: "POL", rep: 66, fanBase: 2438105, currentBudget: 32955000 }
];

export const AUSTRIA_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 1601, name: "Wals-Siezenheim", tier: 1, baseOvr: 76, color: "ffffff", stadium: 30188, country: "AUT", rep: 77, fanBase: 4061536, currentBudget: 52677120 },
  { id: 1602, name: "Graz Liebenau", tier: 1, baseOvr: 74, color: "000000", stadium: 16364, country: "AUT", rep: 75, fanBase: 2368904, currentBudget: 48626880 },
  { id: 1603, name: "Wien Hütteldorf", tier: 1, baseOvr: 73, color: "008000", stadium: 28000, country: "AUT", rep: 74, fanBase: 3749017, currentBudget: 46682040 },
  { id: 1604, name: "Wien Favoriten", tier: 1, baseOvr: 72, color: "ee82ee", stadium: 17500, country: "AUT", rep: 73, fanBase: 2473248, currentBudget: 44789760 },
  { id: 1605, name: "Linz Froschberg", tier: 1, baseOvr: 72, color: "000000", stadium: 19080, country: "AUT", rep: 73, fanBase: 2662848, currentBudget: 44789760 },
  { id: 1606, name: "Lavanttal", tier: 1, baseOvr: 70, color: "000000", stadium: 7300, country: "AUT", rep: 71, fanBase: 1219000, currentBudget: 41160000 },
  { id: 1607, name: "Klagenfurt Waidmannsdorf", tier: 1, baseOvr: 69, color: "ee82ee", stadium: 30000, country: "AUT", rep: 70, fanBase: 3928509, currentBudget: 39421080 },
  { id: 1608, name: "Hartberg Oststeiermark", tier: 1, baseOvr: 68, color: "0000ff", stadium: 5000, country: "AUT", rep: 69, fanBase: 914432, currentBudget: 37731840 },
  { id: 1609, name: "Vorarlberg Rheindorf", tier: 1, baseOvr: 67, color: "000000", stadium: 8500, country: "AUT", rep: 68, fanBase: 1320763, currentBudget: 36091560 },
  { id: 1610, name: "Lustenau Reichshof", tier: 1, baseOvr: 67, color: "008000", stadium: 8800, country: "AUT", rep: 68, fanBase: 1356763, currentBudget: 36091560 },
  { id: 1611, name: "Wattens Kristall", tier: 1, baseOvr: 67, color: "008000", stadium: 16008, country: "AUT", rep: 68, fanBase: 2221723, currentBudget: 36091560 },
  { id: 1612, name: "Linz Donaupark", tier: 1, baseOvr: 66, color: "0000ff", stadium: 5595, country: "AUT", rep: 67, fanBase: 958896, currentBudget: 34499520 },
  { id: 1613, name: "Innviertel", tier: 1, baseOvr: 66, color: "008000", stadium: 7334, country: "AUT", rep: 67, fanBase: 1167576, currentBudget: 34499520 },
  { id: 1614, name: "St. Pölten Traisen", tier: 1, baseOvr: 65, color: "ffff00", stadium: 8000, country: "AUT", rep: 66, fanBase: 1234625, currentBudget: 32955000 },
  { id: 1615, name: "Bregenz Bodensee", tier: 1, baseOvr: 64, color: "000000", stadium: 4600, country: "AUT", rep: 65, fanBase: 814144, currentBudget: 31457280 },
  { id: 1616, name: "Maria Enzersdorf Südstadt", tier: 1, baseOvr: 64, color: "000000", stadium: 10600, country: "AUT", rep: 65, fanBase: 1534144, currentBudget: 31457280 },
  { id: 1617, name: "Waldviertel Horn", tier: 1, baseOvr: 63, color: "0000ff", stadium: 3500, country: "AUT", rep: 64, fanBase: 670047, currentBudget: 30005640 },
  { id: 1618, name: "Leoben Donawitz", tier: 1, baseOvr: 63, color: "008000", stadium: 6000, country: "AUT", rep: 64, fanBase: 970047, currentBudget: 30005640 }
];
export const SWITZERLAND_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 1701, name: "Bern Wankdorf", tier: 1, baseOvr: 75, color: "ffff00", stadium: 31120, country: "SUI", rep: 76, fanBase: 4156275, currentBudget: 50625000 },
  { id: 1702, name: "Basel St. Jakob", tier: 1, baseOvr: 74, color: "ff0000", stadium: 37994, country: "SUI", rep: 75, fanBase: 4964504, currentBudget: 48626880 },
  { id: 1703, name: "Genève Praille", tier: 1, baseOvr: 73, color: "800000", stadium: 30084, country: "SUI", rep: 74, fanBase: 3999097, currentBudget: 46682040 },
  { id: 1704, name: "Lugano Cornaredo", tier: 1, baseOvr: 72, color: "000000", stadium: 6330, country: "SUI", rep: 73, fanBase: 1132848, currentBudget: 44789760 },
  { id: 1705, name: "Zürich Letzigrund", tier: 1, baseOvr: 72, color: "0000ff", stadium: 26104, country: "SUI", rep: 73, fanBase: 3505728, currentBudget: 44789760 },
  { id: 1706, name: "St. Gallen Espen", tier: 1, baseOvr: 71, color: "008000", stadium: 19568, country: "SUI", rep: 72, fanBase: 2706071, currentBudget: 42949320 },
  { id: 1707, name: "Luzern Allmend", tier: 1, baseOvr: 70, color: "0000ff", stadium: 16490, country: "SUI", rep: 71, fanBase: 2321800, currentBudget: 41160000 },
  { id: 1708, name: "Winterthur Schützenwiese", tier: 1, baseOvr: 69, color: "ff0000", stadium: 9400, country: "SUI", rep: 70, fanBase: 1456509, currentBudget: 39421080 },
  { id: 1709, name: "Yverdon-les-Bains", tier: 1, baseOvr: 68, color: "008000", stadium: 6600, country: "SUI", rep: 69, fanBase: 1106432, currentBudget: 37731840 },
  { id: 1710, name: "Lausanne Vaudois", tier: 1, baseOvr: 68, color: "0000ff", stadium: 12544, country: "SUI", rep: 69, fanBase: 1819712, currentBudget: 37731840 },
  { id: 1711, name: "Zürich Hardturm", tier: 1, baseOvr: 68, color: "0000ff", stadium: 26104, country: "SUI", rep: 69, fanBase: 3446912, currentBudget: 37731840 },
  { id: 1712, name: "Sion Valais", tier: 1, baseOvr: 67, color: "ff0000", stadium: 14283, country: "SUI", rep: 68, fanBase: 2014723, currentBudget: 36091560 },
  { id: 1713, name: "Thun Oberland", tier: 1, baseOvr: 66, color: "ff0000", stadium: 10014, country: "SUI", rep: 67, fanBase: 1489176, currentBudget: 34499520 },
  { id: 1714, name: "Aarau Brügglifeld", tier: 1, baseOvr: 65, color: "000000", stadium: 8000, country: "SUI", rep: 66, fanBase: 1234625, currentBudget: 32955000 },
  { id: 1715, name: "Vaduz Residenz", tier: 1, baseOvr: 65, color: "ff0000", stadium: 7584, country: "SUI", rep: 66, fanBase: 1184705, currentBudget: 32955000 },
  { id: 1716, name: "Schaffhausen Munot", tier: 1, baseOvr: 64, color: "ffff00", stadium: 8200, country: "SUI", rep: 65, fanBase: 1246144, currentBudget: 31457280 },
  { id: 1717, name: "Bellinzona Ticino", tier: 1, baseOvr: 64, color: "800000", stadium: 5000, country: "SUI", rep: 65, fanBase: 862144, currentBudget: 31457280 },
  { id: 1718, name: "Neuchâtel Maladière", tier: 1, baseOvr: 64, color: "ff0000", stadium: 11997, country: "SUI", rep: 65, fanBase: 1701784, currentBudget: 31457280 }
];
export const AUSTRALIA_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
{ id: 1801, name: "Sydney Moore Park", tier: 1, baseOvr: 71, color: "87ceeb", stadium: 42500, country: "AUS", rep: 72, fanBase: 5457911, currentBudget: 42949320 },
  { id: 1802, name: "Melbourne Bundoora", tier: 1, baseOvr: 71, color: "add8e6", stadium: 30050, country: "AUS", rep: 72, fanBase: 3963911, currentBudget: 42949320 },
  { id: 1803, name: "Melbourne Olympic Park", tier: 1, baseOvr: 70, color: "000080", stadium: 30050, country: "AUS", rep: 71, fanBase: 3949000, currentBudget: 41160000 },
  { id: 1804, name: "Adelaide Hindmarsh", tier: 1, baseOvr: 70, color: "ff0000", stadium: 16500, country: "AUS", rep: 71, fanBase: 2323000, currentBudget: 41160000 },
  { id: 1805, name: "Western Sydney Parramatta", tier: 1, baseOvr: 69, color: "ff0000", stadium: 30000, country: "AUS", rep: 70, fanBase: 3928509, currentBudget: 39421080 },
  { id: 1806, name: "Gosford Coast", tier: 1, baseOvr: 69, color: "ffff00", stadium: 20059, country: "AUS", rep: 70, fanBase: 2735589, currentBudget: 39421080 },
  { id: 1807, name: "Wellington Nix", tier: 1, baseOvr: 68, color: "ffff00", stadium: 34500, country: "AUS", rep: 69, fanBase: 4454432, currentBudget: 37731840 },
  { id: 1808, name: "Brisbane Milton", tier: 1, baseOvr: 68, color: "ff8c00", stadium: 52500, country: "AUS", rep: 69, fanBase: 6614432, currentBudget: 37731840 },
  { id: 1809, name: "Perth Swan River", tier: 1, baseOvr: 67, color: "800080", stadium: 20500, country: "AUS", rep: 68, fanBase: 2760763, currentBudget: 36091560 },
  { id: 1810, name: "Newcastle Hunter", tier: 1, baseOvr: 67, color: "0000ff", stadium: 33000, country: "AUS", rep: 68, fanBase: 4260763, currentBudget: 36091560 },
  { id: 1811, name: "Campbelltown Bulls", tier: 1, baseOvr: 66, color: "ffffff", stadium: 20000, country: "AUS", rep: 67, fanBase: 2687496, currentBudget: 34499520 },
  { id: 1812, name: "Tarneit West", tier: 1, baseOvr: 66, color: "008000", stadium: 5000, country: "AUS", rep: 67, fanBase: 887496, currentBudget: 34499520 },
  { id: 1813, name: "Auckland Mount Smart", tier: 1, baseOvr: 65, color: "000000", stadium: 25000, country: "AUS", rep: 66, fanBase: 3274625, currentBudget: 32955000 },
  { id: 1814, name: "Albert Park Lakers", tier: 1, baseOvr: 62, color: "0000ff", stadium: 12000, country: "AUS", rep: 63, fanBase: 1678328, currentBudget: 28599360 },
  { id: 1815, name: "Belmore Olympic", tier: 1, baseOvr: 61, color: "0000ff", stadium: 18000, country: "AUS", rep: 62, fanBase: 2386981, currentBudget: 27237720 },
  { id: 1816, name: "Leichhardt Lambert", tier: 1, baseOvr: 60, color: "800000", stadium: 5000, country: "AUS", rep: 61, fanBase: 816000, currentBudget: 25920000 },
  { id: 1817, name: "Bossley Park Stallions", tier: 1, baseOvr: 60, color: "008000", stadium: 9000, country: "AUS", rep: 61, fanBase: 1296000, currentBudget: 25920000 },
  { id: 1818, name: "Preston BT Connor", tier: 1, baseOvr: 59, color: "ff0000", stadium: 5000, country: "AUS", rep: 59, fanBase: 805379, currentBudget: 24645480 }
];

export const ARGENTINA_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 1901, name: "Núñez", tier: 1, baseOvr: 81, color: "ffffff", stadium: 84567, country: "ARG", rep: 83, fanBase: 10679481, currentBudget: 63772920 },
  { id: 1902, name: "La Boca", tier: 1, baseOvr: 80, color: "0000ff", stadium: 54000, country: "ARG", rep: 82, fanBase: 6992000, currentBudget: 61440000 },
  { id: 1903, name: "Avellaneda Celeste", tier: 1, baseOvr: 78, color: "add8e6", stadium: 61000, country: "ARG", rep: 79, fanBase: 7794552, currentBudget: 56946240 },
  { id: 1904, name: "Avellaneda Rojo", tier: 1, baseOvr: 77, color: "ff0000", stadium: 48069, country: "ARG", rep: 78, fanBase: 6224813, currentBudget: 54783960 },
  { id: 1905, name: "Boedo", tier: 1, baseOvr: 76, color: "0000ff", stadium: 47964, country: "ARG", rep: 77, fanBase: 6194656, currentBudget: 52677120 },
  { id: 1906, name: "Liniers", tier: 1, baseOvr: 76, color: "ffffff", stadium: 49540, country: "ARG", rep: 77, fanBase: 6383776, currentBudget: 52677120 },
  { id: 1907, name: "La Plata Rojo", tier: 1, baseOvr: 75, color: "ff0000", stadium: 32530, country: "ARG", rep: 76, fanBase: 4325475, currentBudget: 50625000 },
  { id: 1908, name: "Arroyito", tier: 1, baseOvr: 75, color: "add8e6", stadium: 41654, country: "ARG", rep: 76, fanBase: 5420355, currentBudget: 50625000 },
  { id: 1909, name: "Parque Independencia", tier: 1, baseOvr: 74, color: "ff0000", stadium: 42000, country: "ARG", rep: 75, fanBase: 5445224, currentBudget: 48626880 },
  { id: 1910, name: "Barrio Jardín", tier: 1, baseOvr: 74, color: "000080", stadium: 57000, country: "ARG", rep: 75, fanBase: 7245224, currentBudget: 48626880 },
  { id: 1911, name: "Alberdi", tier: 1, baseOvr: 73, color: "add8e6", stadium: 34830, country: "ARG", rep: 74, fanBase: 4568617, currentBudget: 46682040 },
  { id: 1912, name: "Lanús", tier: 1, baseOvr: 73, color: "800000", stadium: 47027, country: "ARG", rep: 74, fanBase: 6032257, currentBudget: 46682040 },
  { id: 1913, name: "La Paternal", tier: 1, baseOvr: 73, color: "ff0000", stadium: 26000, country: "ARG", rep: 74, fanBase: 3509017, currentBudget: 46682040 },
  { id: 1914, name: "Florencio Varela", tier: 1, baseOvr: 72, color: "ffff00", stadium: 20000, country: "ARG", rep: 73, fanBase: 2773248, currentBudget: 44789760 },
  { id: 1915, name: "Parque Patricios", tier: 1, baseOvr: 72, color: "ffffff", stadium: 48314, country: "ARG", rep: 73, fanBase: 6170928, currentBudget: 44789760 },
  { id: 1916, name: "La Plata Blanco", tier: 1, baseOvr: 71, color: "ffffff", stadium: 24544, country: "ARG", rep: 72, fanBase: 3303191, currentBudget: 42949320 },
  { id: 1917, name: "Tucumán Celeste", tier: 1, baseOvr: 71, color: "add8e6", stadium: 35200, country: "ARG", rep: 72, fanBase: 4581911, currentBudget: 42949320 },
  { id: 1918, name: "Banfield", tier: 1, baseOvr: 71, color: "008000", stadium: 34901, country: "ARG", rep: 72, fanBase: 4546031, currentBudget: 42949320 },
  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  { id: 1919, name: "Godoy Cruz", tier: 2, baseOvr: 70, color: "0000ff", stadium: 42000, country: "ARG", rep: 69, fanBase: 3229800, currentBudget: 14406000 },
  { id: 1920, name: "Victoria", tier: 2, baseOvr: 70, color: "0000ff", stadium: 26282, country: "ARG", rep: 69, fanBase: 2099300, currentBudget: 14406000 },
  { id: 1921, name: "Florida", tier: 2, baseOvr: 70, color: "8b4513", stadium: 28530, country: "ARG", rep: 69, fanBase: 2260560, currentBudget: 14406000 },
  { id: 1922, name: "Barracas", tier: 2, baseOvr: 69, color: "008000", stadium: 4400, country: "ARG", rep: 68, fanBase: 513905, currentBudget: 13797378 },
  { id: 1923, name: "Santa Fe Rojo", tier: 2, baseOvr: 69, color: "ff0000", stadium: 27000, country: "ARG", rep: 68, fanBase: 2141105, currentBudget: 13797378 },
  { id: 1924, name: "Alta Córdoba", tier: 2, baseOvr: 69, color: "ff0000", stadium: 26535, country: "ARG", rep: 68, fanBase: 2107625, currentBudget: 13797378 },
  { id: 1925, name: "Junín", tier: 2, baseOvr: 68, color: "008000", stadium: 22000, country: "ARG", rep: 67, fanBase: 1772857, currentBudget: 13206144 },
  { id: 1926, name: "Santiago del Estero", tier: 2, baseOvr: 68, color: "add8e6", stadium: 30000, country: "ARG", rep: 67, fanBase: 2348857, currentBudget: 13206144 },
  { id: 1927, name: "Villa Soldati", tier: 2, baseOvr: 68, color: "000000", stadium: 3000, country: "ARG", rep: 67, fanBase: 404857, currentBudget: 13206144 },
  { id: 1928, name: "Mendoza Azul", tier: 2, baseOvr: 67, color: "0000ff", stadium: 24000, country: "ARG", rep: 66, fanBase: 1908457, currentBudget: 12631524 },
  { id: 1929, name: "Ciudadela", tier: 2, baseOvr: 67, color: "ff0000", stadium: 30250, country: "ARG", rep: 66, fanBase: 2362057, currentBudget: 12631524 },
  { id: 1930, name: "Quilmes", tier: 2, baseOvr: 67, color: "ffffff", stadium: 30200, country: "ARG", rep: 66, fanBase: 2358457, currentBudget: 12631524 },
  { id: 1931, name: "Caballito", tier: 2, baseOvr: 66, color: "008000", stadium: 24442, country: "ARG", rep: 65, fanBase: 1932357, currentBudget: 12074832 },
  { id: 1932, name: "San Juan", tier: 2, baseOvr: 66, color: "ff0000", stadium: 28000, country: "ARG", rep: 65, fanBase: 2188497, currentBudget: 12074832 },
  { id: 1933, name: "Jujuy", tier: 2, baseOvr: 65, color: "add8e6", stadium: 24000, country: "ARG", rep: 64, fanBase: 1892775, currentBudget: 11534250 },
  { id: 1934, name: "Villa Maipú", tier: 2, baseOvr: 65, color: "ff0000", stadium: 26530, country: "ARG", rep: 64, fanBase: 2074935, currentBudget: 11534250 },
  { id: 1935, name: "Mataderos", tier: 2, baseOvr: 65, color: "008000", stadium: 28500, country: "ARG", rep: 64, fanBase: 2216775, currentBudget: 11534250 },
  { id: 1936, name: "Paraná", tier: 2, baseOvr: 64, color: "000000", stadium: 22000, country: "ARG", rep: 63, fanBase: 1741286, currentBudget: 11010048 }
];

export const JAPAN_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 2001, name: "Kobe", tier: 1, baseOvr: 76, color: "dc143c", stadium: 30132, country: "JPN", rep: 77, fanBase: 4054816, currentBudget: 52677120 },
  { id: 2002, name: "Yokohama Blue", tier: 1, baseOvr: 75, color: "0000ff", stadium: 72327, country: "JPN", rep: 76, fanBase: 9101115, currentBudget: 50625000 },
  { id: 2003, name: "Kawasaki", tier: 1, baseOvr: 75, color: "00bfff", stadium: 27495, country: "JPN", rep: 76, fanBase: 3721275, currentBudget: 50625000 },
  { id: 2004, name: "Urawa", tier: 1, baseOvr: 74, color: "ff0000", stadium: 63700, country: "JPN", rep: 75, fanBase: 8049224, currentBudget: 48626880 },
  { id: 2005, name: "Omiya", tier: 1, baseOvr: 74, color: "800000", stadium: 40728, country: "JPN", rep: 75, fanBase: 5292584, currentBudget: 48626880 },
  { id: 2006, name: "Hiroshima", tier: 1, baseOvr: 74, color: "8a2be2", stadium: 28580, country: "JPN", rep: 75, fanBase: 3834824, currentBudget: 48626880 },
  { id: 2007, name: "Osaka Black", tier: 1, baseOvr: 73, color: "000000", stadium: 39694, country: "JPN", rep: 74, fanBase: 5152297, currentBudget: 46682040 },
  { id: 2008, name: "Osaka Pink", tier: 1, baseOvr: 73, color: "ffc0cb", stadium: 24481, country: "JPN", rep: 74, fanBase: 3326737, currentBudget: 46682040 },
  { id: 2009, name: "Tokyo Blue", tier: 1, baseOvr: 72, color: "0000ff", stadium: 49970, country: "JPN", rep: 73, fanBase: 6369648, currentBudget: 44789760 },
  { id: 2010, name: "Nagoya", tier: 1, baseOvr: 72, color: "ff0000", stadium: 45000, country: "JPN", rep: 73, fanBase: 5773248, currentBudget: 44789760 },
  { id: 2011, name: "Machida", tier: 1, baseOvr: 71, color: "0000ff", stadium: 15489, country: "JPN", rep: 72, fanBase: 2216591, currentBudget: 42949320 },
  { id: 2012, name: "Kyoto", tier: 1, baseOvr: 71, color: "800080", stadium: 21600, country: "JPN", rep: 72, fanBase: 2949911, currentBudget: 42949320 },
  { id: 2013, name: "Kashiwa", tier: 1, baseOvr: 71, color: "ffff00", stadium: 15109, country: "JPN", rep: 72, fanBase: 2170991, currentBudget: 42949320 },
  { id: 2014, name: "Fukuoka", tier: 1, baseOvr: 70, color: "008000", stadium: 22563, country: "JPN", rep: 71, fanBase: 3050560, currentBudget: 41160000 },
  { id: 2015, name: "Hiratsuka", tier: 1, baseOvr: 70, color: "90ee90", stadium: 15380, country: "JPN", rep: 71, fanBase: 2188600, currentBudget: 41160000 },
  { id: 2016, name: "Sapporo", tier: 1, baseOvr: 69, color: "ff0000", stadium: 38794, country: "JPN", rep: 70, fanBase: 4983789, currentBudget: 39421080 },
  { id: 2017, name: "Tosu", tier: 1, baseOvr: 69, color: "add8e6", stadium: 24130, country: "JPN", rep: 70, fanBase: 3224109, currentBudget: 39421080 },
  { id: 2018, name: "Niigata", tier: 1, baseOvr: 69, color: "ff8c00", stadium: 42300, country: "JPN", rep: 70, fanBase: 5404509, currentBudget: 39421080 },
  // ==========================================
  // TIER 2 (18 Clubs)
  // ==========================================
  { id: 2019, name: "Tokyo Green", tier: 2, baseOvr: 68, color: "008000", stadium: 49970, country: "JPN", rep: 67, fanBase: 3786499, currentBudget: 13206144 },
  { id: 2020, name: "Iwata", tier: 2, baseOvr: 68, color: "87ceeb", stadium: 15165, country: "JPN", rep: 67, fanBase: 1280539, currentBudget: 13206144 },
  { id: 2021, name: "Shimizu", tier: 2, baseOvr: 67, color: "ffa500", stadium: 20281, country: "JPN", rep: 66, fanBase: 1640689, currentBudget: 12631524 },
  { id: 2022, name: "Yokohama Light Blue", tier: 2, baseOvr: 67, color: "add8e6", stadium: 15454, country: "JPN", rep: 66, fanBase: 1293145, currentBudget: 12631524 },
  { id: 2023, name: "Nagasaki", tier: 2, baseOvr: 67, color: "0000ff", stadium: 20246, country: "JPN", rep: 66, fanBase: 1638169, currentBudget: 12631524 },
  { id: 2024, name: "Okayama", tier: 2, baseOvr: 66, color: "800080", stadium: 16480, country: "JPN", rep: 65, fanBase: 1359057, currentBudget: 12074832 },
  { id: 2025, name: "Sendai", tier: 2, baseOvr: 66, color: "ffd700", stadium: 20248, country: "JPN", rep: 65, fanBase: 1630353, currentBudget: 12074832 },
  { id: 2026, name: "Chiba", tier: 2, baseOvr: 66, color: "ffff00", stadium: 19781, country: "JPN", rep: 65, fanBase: 1596853, currentBudget: 12074832 },
  { id: 2027, name: "Yamagata", tier: 2, baseOvr: 65, color: "0000ff", stadium: 21262, country: "JPN", rep: 64, fanBase: 1695639, currentBudget: 11534250 },
  { id: 2028, name: "Kofu", tier: 2, baseOvr: 65, color: "0000ff", stadium: 15859, country: "JPN", rep: 64, fanBase: 1306623, currentBudget: 11534250 },
  { id: 2029, name: "Oita", tier: 2, baseOvr: 65, color: "0000ff", stadium: 42300, country: "JPN", rep: 64, fanBase: 3210375, currentBudget: 11534250 },
  { id: 2030, name: "Akita", tier: 2, baseOvr: 64, color: "0000ff", stadium: 20102, country: "JPN", rep: 63, fanBase: 1599861, currentBudget: 11010048 },
  { id: 2031, name: "Yamaguchi", tier: 2, baseOvr: 64, color: "ff8c00", stadium: 15115, country: "JPN", rep: 63, fanBase: 1240801, currentBudget: 11010048 },
  { id: 2032, name: "Tokushima", tier: 2, baseOvr: 64, color: "0000ff", stadium: 20441, country: "JPN", rep: 63, fanBase: 1624269, currentBudget: 11010048 },
  { id: 2033, name: "Mito", tier: 2, baseOvr: 63, color: "0000ff", stadium: 12000, country: "JPN", rep: 62, fanBase: 1014028, currentBudget: 10501974 },
  { id: 2034, name: "Tochigi", tier: 2, baseOvr: 63, color: "ffff00", stadium: 15325, country: "JPN", rep: 62, fanBase: 1253428, currentBudget: 10501974 },
  { id: 2035, name: "Kumamoto", tier: 2, baseOvr: 63, color: "ff0000", stadium: 32000, country: "JPN", rep: 62, fanBase: 2454028, currentBudget: 10501974 },
  { id: 2036, name: "Ehime", tier: 2, baseOvr: 62, color: "ffa500", stadium: 20919, country: "JPN", rep: 61, fanBase: 1649206, currentBudget: 10009776 }
];

export const COLOMBIA_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 2101, name: "Bogotá Azul", tier: 1, baseOvr: 75, color: "0000ff", stadium: 36000, country: "COL", rep: 76, fanBase: 4741875, currentBudget: 50625000 },
  { id: 2102, name: "Bogotá Rojo", tier: 1, baseOvr: 75, color: "008000", stadium: 40943, country: "COL", rep: 76, fanBase: 5335035, currentBudget: 50625000 },
  { id: 2103, name: "Cali Rojo", tier: 1, baseOvr: 74, color: "ff0000", stadium: 38000, country: "COL", rep: 75, fanBase: 4965224, currentBudget: 48626880 },
  { id: 2104, name: "Barranquilla Rojo", tier: 1, baseOvr: 74, color: "ff0000", stadium: 46692, country: "COL", rep: 75, fanBase: 6008264, currentBudget: 48626880 },
  { id: 2105, name: "Bogotá Verde", tier: 1, baseOvr: 73, color: "ff0000", stadium: 36000, country: "COL", rep: 74, fanBase: 4709017, currentBudget: 46682040 },
  { id: 2106, name: "Medellín Rojo", tier: 1, baseOvr: 73, color: "ff0000", stadium: 40943, country: "COL", rep: 74, fanBase: 5302177, currentBudget: 46682040 },
  { id: 2107, name: "Cali Verde", tier: 1, baseOvr: 72, color: "008000", stadium: 42000, country: "COL", rep: 73, fanBase: 5413248, currentBudget: 44789760 },
  { id: 2108, name: "Ibagué", tier: 1, baseOvr: 72, color: "800000", stadium: 28100, country: "COL", rep: 73, fanBase: 3745248, currentBudget: 44789760 },
  { id: 2109, name: "Manizales", tier: 1, baseOvr: 71, color: "ffffff", stadium: 31248, country: "COL", rep: 72, fanBase: 4107671, currentBudget: 42949320 },
  { id: 2110, name: "Bucaramanga", tier: 1, baseOvr: 71, color: "ffff00", stadium: 28000, country: "COL", rep: 72, fanBase: 3717911, currentBudget: 42949320 },
  { id: 2111, name: "Pereira", tier: 1, baseOvr: 70, color: "ffff00", stadium: 30297, country: "COL", rep: 71, fanBase: 3978640, currentBudget: 41160000 },
  { id: 2112, name: "Medellín Verde", tier: 1, baseOvr: 70, color: "008000", stadium: 8000, country: "COL", rep: 71, fanBase: 1303000, currentBudget: 41160000 },
  { id: 2113, name: "Rionegro", tier: 1, baseOvr: 69, color: "ffd700", stadium: 14000, country: "COL", rep: 70, fanBase: 2008509, currentBudget: 39421080 },
  { id: 2114, name: "Pasto", tier: 1, baseOvr: 69, color: "ff0000", stadium: 35000, country: "COL", rep: 70, fanBase: 4528509, currentBudget: 39421080 },
  { id: 2115, name: "Envigado", tier: 1, baseOvr: 68, color: "ff8c00", stadium: 11000, country: "COL", rep: 69, fanBase: 1634432, currentBudget: 37731840 },
  { id: 2116, name: "Valledupar", tier: 1, baseOvr: 68, color: "ffff00", stadium: 11000, country: "COL", rep: 69, fanBase: 1634432, currentBudget: 37731840 },
  { id: 2117, name: "Tunja Negro", tier: 1, baseOvr: 67, color: "000000", stadium: 20630, country: "COL", rep: 68, fanBase: 2776363, currentBudget: 36091560 },
  { id: 2118, name: "Tunja Rojo", tier: 1, baseOvr: 67, color: "ff0000", stadium: 20630, country: "COL", rep: 68, fanBase: 2776363, currentBudget: 36091560 }
];

export const MEXICO_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 2201, name: "Ciudad de México Amarillo", tier: 1, baseOvr: 78, color: "ffff00", stadium: 87000, country: "MEX", rep: 79, fanBase: 10914552, currentBudget: 56946240 },
  { id: 2202, name: "Nuevo León Amarillo", tier: 1, baseOvr: 77, color: "ffff00", stadium: 41615, country: "MEX", rep: 78, fanBase: 5450333, currentBudget: 54783960 },
  { id: 2203, name: "Monterrey", tier: 1, baseOvr: 77, color: "000080", stadium: 53500, country: "MEX", rep: 78, fanBase: 6876533, currentBudget: 54783960 },
  { id: 2204, name: "Guadalajara Rojo", tier: 1, baseOvr: 76, color: "ff0000", stadium: 49850, country: "MEX", rep: 77, fanBase: 6420976, currentBudget: 52677120 },
  { id: 2205, name: "Ciudad de México Azul", tier: 1, baseOvr: 76, color: "0000ff", stadium: 36681, country: "MEX", rep: 77, fanBase: 4840696, currentBudget: 52677120 },
  { id: 2206, name: "Toluca", tier: 1, baseOvr: 75, color: "ff0000", stadium: 30000, country: "MEX", rep: 76, fanBase: 4021875, currentBudget: 50625000 },
  { id: 2207, name: "Pachuca", tier: 1, baseOvr: 75, color: "0000ff", stadium: 30000, country: "MEX", rep: 76, fanBase: 4021875, currentBudget: 50625000 },
  { id: 2208, name: "Pedregal", tier: 1, baseOvr: 74, color: "ffd700", stadium: 72000, country: "MEX", rep: 75, fanBase: 9045224, currentBudget: 48626880 },
  { id: 2209, name: "León Esmeralda", tier: 1, baseOvr: 74, color: "008000", stadium: 31297, country: "MEX", rep: 75, fanBase: 4160864, currentBudget: 48626880 },
  { id: 2210, name: "Torreón", tier: 1, baseOvr: 73, color: "008000", stadium: 30000, country: "MEX", rep: 74, fanBase: 3989017, currentBudget: 46682040 },
  { id: 2211, name: "Guadalajara Negro", tier: 1, baseOvr: 73, color: "ff0000", stadium: 55020, country: "MEX", rep: 74, fanBase: 6991417, currentBudget: 46682040 },
  { id: 2212, name: "Tijuana", tier: 1, baseOvr: 72, color: "ff0000", stadium: 27333, country: "MEX", rep: 73, fanBase: 3653208, currentBudget: 44789760 },
  { id: 2213, name: "Puebla", tier: 1, baseOvr: 71, color: "ffffff", stadium: 51900, country: "MEX", rep: 72, fanBase: 6585911, currentBudget: 42949320 },
  { id: 2214, name: "Aguascalientes", tier: 1, baseOvr: 71, color: "ff0000", stadium: 23851, country: "MEX", rep: 72, fanBase: 3220031, currentBudget: 42949320 },
  { id: 2215, name: "Querétaro", tier: 1, baseOvr: 70, color: "0000ff", stadium: 34107, country: "MEX", rep: 71, fanBase: 4435840, currentBudget: 41160000 },
  { id: 2216, name: "San Luis", tier: 1, baseOvr: 70, color: "ff0000", stadium: 25111, country: "MEX", rep: 71, fanBase: 3356320, currentBudget: 41160000 },
  { id: 2217, name: "Mazatlán", tier: 1, baseOvr: 69, color: "800080", stadium: 25000, country: "MEX", rep: 70, fanBase: 3328509, currentBudget: 39421080 },
  { id: 2218, name: "Juárez", tier: 1, baseOvr: 69, color: "008000", stadium: 19703, country: "MEX", rep: 70, fanBase: 2692869, currentBudget: 39421080 }
];

export const CANADA_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 (18 Clubs)
  // ==========================================
  { id: 2301, name: "Hamilton", tier: 1, baseOvr: 65, color: "ff4500", stadium: 10016, country: "CAN", rep: 66, fanBase: 1476545, currentBudget: 6591000 },
  { id: 2302, name: "Ottawa", tier: 1, baseOvr: 64, color: "ff0000", stadium: 24000, country: "CAN", rep: 65, fanBase: 3142144, currentBudget: 6291456 },
  { id: 2303, name: "Calgary", tier: 1, baseOvr: 64, color: "008000", stadium: 6000, country: "CAN", rep: 65, fanBase: 982144, currentBudget: 6291456 },
  { id: 2304, name: "Halifax", tier: 1, baseOvr: 63, color: "0000ff", stadium: 6500, country: "CAN", rep: 64, fanBase: 1030047, currentBudget: 6001128 },
  { id: 2305, name: "Langford", tier: 1, baseOvr: 63, color: "800080", stadium: 6000, country: "CAN", rep: 64, fanBase: 970047, currentBudget: 6001128 },
  { id: 2306, name: "Winnipeg", tier: 1, baseOvr: 62, color: "800000", stadium: 33000, country: "CAN", rep: 63, fanBase: 4198328, currentBudget: 5719872 },
  { id: 2307, name: "Langley", tier: 1, baseOvr: 62, color: "000000", stadium: 6560, country: "CAN", rep: 63, fanBase: 1025528, currentBudget: 5719872 },
  { id: 2308, name: "York Ontario", tier: 1, baseOvr: 62, color: "008000", stadium: 4000, country: "CAN", rep: 63, fanBase: 718328, currentBudget: 5719872 },
  { id: 2309, name: "Edmonton", tier: 1, baseOvr: 61, color: "008000", stadium: 5100, country: "CAN", rep: 62, fanBase: 838981, currentBudget: 5447544 },
  { id: 2310, name: "Barrie", tier: 1, baseOvr: 59, color: "0000ff", stadium: 2000, country: "CAN", rep: 59, fanBase: 445379, currentBudget: 4929096 },
  { id: 2311, name: "Saint-Laurent", tier: 1, baseOvr: 59, color: "ffa500", stadium: 1500, country: "CAN", rep: 59, fanBase: 385379, currentBudget: 4929096 },
  { id: 2312, name: "Vaughan", tier: 1, baseOvr: 58, color: "000080", stadium: 2000, country: "CAN", rep: 58, fanBase: 435112, currentBudget: 4682688 },
  { id: 2313, name: "Laval Québec", tier: 1, baseOvr: 58, color: "0000ff", stadium: 1000, country: "CAN", rep: 58, fanBase: 315112, currentBudget: 4682688 },
  { id: 2314, name: "Burnaby", tier: 1, baseOvr: 57, color: "ff0000", stadium: 3500, country: "CAN", rep: 57, fanBase: 605193, currentBudget: 4444632 },
  { id: 2315, name: "Victoria Island", tier: 1, baseOvr: 57, color: "ffffff", stadium: 2500, country: "CAN", rep: 57, fanBase: 485193, currentBudget: 4444632 },
  { id: 2316, name: "Guelph", tier: 1, baseOvr: 56, color: "0000ff", stadium: 1500, country: "CAN", rep: 56, fanBase: 355616, currentBudget: 4214784 },
  { id: 2317, name: "London", tier: 1, baseOvr: 55, color: "ff0000", stadium: 1200, country: "CAN", rep: 55, fanBase: 310375, currentBudget: 3993000 },
  { id: 2318, name: "Kamloops", tier: 1, baseOvr: 55, color: "0000ff", stadium: 1000, country: "CAN", rep: 55, fanBase: 286375, currentBudget: 3993000 }
];

export const TURKEY_CLUBS: Club[] = [
  // ==========================================
  // TIER 1 - Trendyol Süper Lig (18 Clubs)
  // ==========================================
  { id: 2401, name: "Galata SK", tier: 1, baseOvr: 84, color: "fdb912", stadium: 52280, country: "TUR", rep: 84, fanBase: 6500000, currentBudget: 75000000 },
  { id: 2402, name: "Kadıköy FK", tier: 1, baseOvr: 84, color: "002d72", stadium: 47834, country: "TUR", rep: 84, fanBase: 6200000, currentBudget: 75000000 },
  { id: 2403, name: "Boğaziçi Beşiktaş", tier: 1, baseOvr: 81, color: "000000", stadium: 42590, country: "TUR", rep: 81, fanBase: 4800000, currentBudget: 55000000 },
  { id: 2404, name: "Karadeniz Trabzon", tier: 1, baseOvr: 78, color: "800020", stadium: 40782, country: "TUR", rep: 77, fanBase: 3200000, currentBudget: 35000000 },
  { id: 2405, name: "Başakşehir Gençlik", tier: 1, baseOvr: 76, color: "ea580c", stadium: 17319, country: "TUR", rep: 73, fanBase: 250000, currentBudget: 22000000 },
  { id: 2406, name: "Samsun 19 Mayıs", tier: 1, baseOvr: 75, color: "dc2626", stadium: 33919, country: "TUR", rep: 72, fanBase: 1200000, currentBudget: 18000000 },
  { id: 2407, name: "İzmir Göztepe", tier: 1, baseOvr: 74, color: "f59e0b", stadium: 20035, country: "TUR", rep: 71, fanBase: 1100000, currentBudget: 16000000 },
  { id: 2408, name: "Anadolu Konya", tier: 1, baseOvr: 73, color: "16a34a", stadium: 42000, country: "TUR", rep: 70, fanBase: 1000000, currentBudget: 15000000 },
  { id: 2409, name: "Haliç Kasımpaşa", tier: 1, baseOvr: 73, color: "2563eb", stadium: 14234, country: "TUR", rep: 69, fanBase: 200000, currentBudget: 14000000 },
  { id: 2410, name: "Adana Güney SK", tier: 1, baseOvr: 72, color: "3b82f6", stadium: 25000, country: "TUR", rep: 69, fanBase: 850000, currentBudget: 14000000 },
  { id: 2411, name: "Akdeniz Antalya", tier: 1, baseOvr: 72, color: "ef4444", stadium: 22000, country: "TUR", rep: 69, fanBase: 800000, currentBudget: 13500000 },
  { id: 2412, name: "Rize Çay SK", tier: 1, baseOvr: 71, color: "10b981", stadium: 20000, country: "TUR", rep: 68, fanBase: 750000, currentBudget: 13000000 },
  { id: 2413, name: "Eyüp Merkez FK", tier: 1, baseOvr: 71, color: "8b5cf6", stadium: 18000, country: "TUR", rep: 68, fanBase: 700000, currentBudget: 13000000 },
  { id: 2414, name: "Alanya Ege SK", tier: 1, baseOvr: 70, color: "f97316", stadium: 16000, country: "TUR", rep: 67, fanBase: 650000, currentBudget: 12500000 },
  { id: 2415, name: "Bodrum Ege FK", tier: 1, baseOvr: 70, color: "06b6d4", stadium: 15000, country: "TUR", rep: 67, fanBase: 600000, currentBudget: 12500000 },
  { id: 2416, name: "Erciyes Kayseri", tier: 1, baseOvr: 69, color: "ec4899", stadium: 14000, country: "TUR", rep: 66, fanBase: 550000, currentBudget: 12000000 },
  { id: 2417, name: "Antep Şehir SK", tier: 1, baseOvr: 69, color: "6366f1", stadium: 13000, country: "TUR", rep: 66, fanBase: 500000, currentBudget: 12000000 },
  { id: 2418, name: "Sivas Yiğidolar", tier: 1, baseOvr: 68, color: "14b8a6", stadium: 12000, country: "TUR", rep: 65, fanBase: 450000, currentBudget: 12000000 },

  // ==========================================
  // TIER 2 - TFF 1. Lig (18 Clubs)
  // ==========================================
  { id: 2419, name: "Körfez Kocaeli", tier: 2, baseOvr: 68, color: "15803d", stadium: 34712, country: "TUR", rep: 67, fanBase: 1500000, currentBudget: 6500000 },
  { id: 2420, name: "Diyar Amed", tier: 2, baseOvr: 67, color: "16a34a", stadium: 33000, country: "TUR", rep: 66, fanBase: 1200000, currentBudget: 5500000 },
  { id: 2421, name: "Başkent Gençlik", tier: 2, baseOvr: 66, color: "dc2626", stadium: 16000, country: "TUR", rep: 65, fanBase: 500000, currentBudget: 5000000 },
  { id: 2422, name: "Karagümrük Semt", tier: 2, baseOvr: 66, color: "2563eb", stadium: 15000, country: "TUR", rep: 65, fanBase: 480000, currentBudget: 4800000 },
  { id: 2423, name: "Sarı Boğaziçi SK", tier: 2, baseOvr: 65, color: "f59e0b", stadium: 14000, country: "TUR", rep: 64, fanBase: 450000, currentBudget: 4500000 },
  { id: 2424, name: "Marmara Bandırma", tier: 2, baseOvr: 65, color: "8b5cf6", stadium: 13000, country: "TUR", rep: 64, fanBase: 420000, currentBudget: 4200000 },
  { id: 2425, name: "Dadaş Erzurum", tier: 2, baseOvr: 64, color: "06b6d4", stadium: 12000, country: "TUR", rep: 63, fanBase: 400000, currentBudget: 4000000 },
  { id: 2426, name: "Köroğlu Bolu", tier: 2, baseOvr: 64, color: "10b981", stadium: 11000, country: "TUR", rep: 63, fanBase: 380000, currentBudget: 3800000 },
  { id: 2427, name: "Doğu Iğdır SK", tier: 2, baseOvr: 64, color: "ef4444", stadium: 10000, country: "TUR", rep: 63, fanBase: 360000, currentBudget: 3600000 },
  { id: 2428, name: "Hitit Çorum", tier: 2, baseOvr: 63, color: "3b82f6", stadium: 9500, country: "TUR", rep: 62, fanBase: 340000, currentBudget: 3500000 },
  { id: 2429, name: "Ümraniye Anadolu", tier: 2, baseOvr: 63, color: "f97316", stadium: 9000, country: "TUR", rep: 62, fanBase: 320000, currentBudget: 3400000 },
  { id: 2430, name: "Esenler Semt SK", tier: 2, baseOvr: 63, color: "6366f1", stadium: 8500, country: "TUR", rep: 62, fanBase: 300000, currentBudget: 3300000 },
  { id: 2431, name: "Marmara Sakarya", tier: 2, baseOvr: 62, color: "14b8a6", stadium: 8000, country: "TUR", rep: 61, fanBase: 280000, currentBudget: 3200000 },
  { id: 2432, name: "Ankara Keçiören", tier: 2, baseOvr: 62, color: "ec4899", stadium: 7500, country: "TUR", rep: 61, fanBase: 260000, currentBudget: 3100000 },
  { id: 2433, name: "Spil Manisa", tier: 2, baseOvr: 62, color: "84cc16", stadium: 7000, country: "TUR", rep: 61, fanBase: 250000, currentBudget: 3000000 },
  { id: 2434, name: "Pendik Sahil", tier: 2, baseOvr: 61, color: "a855f7", stadium: 6500, country: "TUR", rep: 60, fanBase: 240000, currentBudget: 3000000 },
  { id: 2435, name: "Ankara Başkent SK", tier: 2, baseOvr: 61, color: "eab308", stadium: 6000, country: "TUR", rep: 60, fanBase: 230000, currentBudget: 3000000 },
  { id: 2436, name: "Urfa Gücü", tier: 2, baseOvr: 60, color: "64748b", stadium: 5500, country: "TUR", rep: 59, fanBase: 220000, currentBudget: 3000000 },

  // ==========================================
  // TIER 3 - TFF 2. Lig (18 Clubs)
  // ==========================================
  { id: 2437, name: "Yeşil Bursa SK", tier: 3, baseOvr: 60, color: "16a34a", stadium: 43361, country: "TUR", rep: 62, fanBase: 2200000, currentBudget: 2200000 },
  { id: 2438, name: "Anadolu Eskişehir", tier: 3, baseOvr: 59, color: "dc2626", stadium: 34930, country: "TUR", rep: 61, fanBase: 1800000, currentBudget: 2000000 },
  { id: 2439, name: "Büyük İzmir SK", tier: 3, baseOvr: 57, color: "2563eb", stadium: 8000, country: "TUR", rep: 56, fanBase: 120000, currentBudget: 1500000 },
  { id: 2440, name: "Ege İzmir FK", tier: 3, baseOvr: 57, color: "f59e0b", stadium: 7500, country: "TUR", rep: 56, fanBase: 110000, currentBudget: 1400000 },
  { id: 2441, name: "İzmir Buca SK", tier: 3, baseOvr: 56, color: "8b5cf6", stadium: 7000, country: "TUR", rep: 55, fanBase: 100000, currentBudget: 1300000 },
  { id: 2442, name: "Körfez Karşıyaka", tier: 3, baseOvr: 56, color: "06b6d4", stadium: 6500, country: "TUR", rep: 55, fanBase: 95000, currentBudget: 1250000 },
  { id: 2443, name: "Balıkesir İY", tier: 3, baseOvr: 55, color: "10b981", stadium: 6000, country: "TUR", rep: 54, fanBase: 90000, currentBudget: 1200000 },
  { id: 2444, name: "Denizli Horoz SK", tier: 3, baseOvr: 55, color: "ef4444", stadium: 5500, country: "TUR", rep: 54, fanBase: 85000, currentBudget: 1150000 },
  { id: 2445, name: "Akdeniz Mersin", tier: 3, baseOvr: 55, color: "3b82f6", stadium: 5000, country: "TUR", rep: 54, fanBase: 80000, currentBudget: 1100000 },
  { id: 2446, name: "Manisa Akhisar FK", tier: 3, baseOvr: 54, color: "f97316", stadium: 4800, country: "TUR", rep: 53, fanBase: 75000, currentBudget: 1050000 },
  { id: 2447, name: "Karabük Çelik", tier: 3, baseOvr: 54, color: "6366f1", stadium: 4500, country: "TUR", rep: 53, fanBase: 70000, currentBudget: 1000000 },
  { id: 2448, name: "Karadeniz Ordu", tier: 3, baseOvr: 53, color: "14b8a6", stadium: 4200, country: "TUR", rep: 52, fanBase: 65000, currentBudget: 950000 },
  { id: 2449, name: "Çotanak Giresun", tier: 3, baseOvr: 53, color: "ec4899", stadium: 4000, country: "TUR", rep: 52, fanBase: 60000, currentBudget: 900000 },
  { id: 2450, name: "Gakkoş Elazığ", tier: 3, baseOvr: 53, color: "84cc16", stadium: 3800, country: "TUR", rep: 52, fanBase: 55000, currentBudget: 900000 },
  { id: 2451, name: "Doğu Van FK", tier: 3, baseOvr: 52, color: "a855f7", stadium: 3500, country: "TUR", rep: 51, fanBase: 50000, currentBudget: 850000 },
  { id: 2452, name: "Kuzey Kastamonu", tier: 3, baseOvr: 52, color: "eab308", stadium: 3200, country: "TUR", rep: 51, fanBase: 45000, currentBudget: 850000 },
  { id: 2453, name: "Maden Zonguldak", tier: 3, baseOvr: 51, color: "64748b", stadium: 3000, country: "TUR", rep: 50, fanBase: 40000, currentBudget: 800000 },
  { id: 2454, name: "Ege Afyon SK", tier: 3, baseOvr: 50, color: "78716c", stadium: 2500, country: "TUR", rep: 49, fanBase: 35000, currentBudget: 800000 },
];

export const ALL_CLUBS: Club[] = [
  ...GERMANY_CLUBS,
  ...ENGLAND_CLUBS,
  ...SPAIN_CLUBS,
  ...ITALY_CLUBS,
  ...FRANCE_CLUBS,
  ...PORTUGAL_CLUBS,
  ...USA_CLUBS,
  ...ECUADOR_CLUBS,
  ...SCOTLAND_CLUBS,
  ...WALES_CLUBS,
  ...BRAZIL_CLUBS,
  ...POLAND_CLUBS,
  ...AUSTRIA_CLUBS,
  ...SWITZERLAND_CLUBS,
  ...AUSTRALIA_CLUBS,
  ...ARGENTINA_CLUBS,
  ...JAPAN_CLUBS,
  ...COLOMBIA_CLUBS,
  ...MEXICO_CLUBS,
  ...CANADA_CLUBS,
  ...TURKEY_CLUBS,
];