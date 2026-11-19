import { Club, StadiumArchitectureStyle } from '../types';

/**
 * Authentic real-world stadium architecture registry for ALL 378 Tier 1 clubs
 * across all 21 national leagues, keyed by `${COUNTRY}:${CLUB_ID}` so it works
 * identically in both base mode and real-name mod mode without colliding with
 * synthetic test IDs.
 *
 * Architecture archetypes:
 * - 'continental_bowl': Modern continuous oval/curved football-specific arena
 * - 'english_box':      Steep 4-sided rectangular football-specific ground close to pitch
 * - 'olympic_track':    Authentic athletics/Olympic running-track or oval multi-purpose venue
 * - 'open_terrace':     Small semi-enclosed municipal/community ground (< 7,000 seats)
 */
export const TIER1_CLUB_STADIUM_STYLES: Record<string, StadiumArchitectureStyle> = {
  // === GER (Bundesliga — 18 clubs, zero running tracks in Tier 1!) ===
  'GER:1': 'continental_bowl',  // FC Bayern München — Allianz Arena
  'GER:2': 'continental_bowl',  // Bayer 04 Leverkusen — BayArena
  'GER:3': 'english_box',       // Borussia Dortmund — Signal Iduna Park (steep rectangular Yellow Wall)
  'GER:4': 'continental_bowl',  // RB Leipzig — Red Bull Arena
  'GER:5': 'continental_bowl',  // VfB Stuttgart — MHPArena (track removed 2011)
  'GER:6': 'continental_bowl',  // Eintracht Frankfurt — Deutsche Bank Park
  'GER:7': 'continental_bowl',  // SC Freiburg — Europa-Park Stadion
  'GER:8': 'continental_bowl',  // TSG 1899 Hoffenheim — PreZero Arena
  'GER:10': 'continental_bowl', // SV Werder Bremen — Weserstadion (track removed 2002)
  'GER:11': 'continental_bowl', // FC Augsburg — WWK Arena
  'GER:12': 'continental_bowl', // VfL Wolfsburg — Volkswagen Arena
  'GER:13': 'continental_bowl', // 1. FSV Mainz 05 — MEWA Arena
  'GER:14': 'english_box',      // Borussia Mönchengladbach — Borussia-Park (steep 4-sided box)
  'GER:15': 'english_box',      // 1. FC Union Berlin — Stadion An der Alten Försterei
  'GER:19': 'english_box',      // 1. FC Köln — RheinEnergieStadion (4-corner towers rectangular box)
  'GER:22': 'continental_bowl', // Hamburger SV — Volksparkstadion
  'GER:25': 'english_box',      // SC Paderborn 07 — Home Deluxe Arena (compact rectangular box)
  'GER:28': 'continental_bowl', // FC Schalke 04 — Veltins-Arena

  // === ENG (Premier League — 18 clubs) ===
  'ENG:701': 'continental_bowl', // Manchester City — Etihad Stadium (curved bowl)
  'ENG:702': 'continental_bowl', // Arsenal FC — Emirates Stadium (modern curved bowl)
  'ENG:703': 'english_box',      // Liverpool FC — Anfield
  'ENG:704': 'english_box',      // Chelsea FC — Stamford Bridge
  'ENG:705': 'english_box',      // Manchester United — Old Trafford (classic rectangular box)
  'ENG:706': 'continental_bowl', // Tottenham Hotspur — Tottenham Hotspur Stadium (modern bowl)
  'ENG:707': 'english_box',      // Aston Villa — Villa Park
  'ENG:708': 'english_box',      // Newcastle United — St James' Park
  'ENG:709': 'continental_bowl', // Brighton & Hove Albion — Amex Stadium (curved modern bowl)
  'ENG:711': 'english_box',      // Crystal Palace — Selhurst Park
  'ENG:712': 'english_box',      // Fulham FC — Craven Cottage
  'ENG:713': 'english_box',      // Brentford FC — Gtech Community Stadium
  'ENG:714': 'english_box',      // Everton FC — Goodison Park / Bramley-Moore Dock
  'ENG:715': 'english_box',      // Nottingham Forest — City Ground
  'ENG:716': 'english_box',      // AFC Bournemouth — Vitality Stadium
  'ENG:719': 'continental_bowl', // Leicester City — King Power Stadium (continuous curved bowl)
  'ENG:721': 'english_box',      // Leeds United — Elland Road
  'ENG:726': 'continental_bowl', // Coventry City — Coventry Building Society Arena

  // === ESP (La Liga — 18 clubs, zero running tracks in Tier 1!) ===
  'ESP:501': 'continental_bowl', // Real Madrid CF — Estadio Santiago Bernabéu
  'ESP:502': 'continental_bowl', // FC Barcelona — Spotify Camp Nou
  'ESP:503': 'continental_bowl', // Atlético de Madrid — Riyadh Air Metropolitano
  'ESP:504': 'continental_bowl', // Athletic Club — San Mamés
  'ESP:505': 'continental_bowl', // Real Sociedad — Reale Arena (Anoeta, track removed 2019!)
  'ESP:506': 'english_box',      // Villarreal CF — Estadio de la Cerámica
  'ESP:507': 'english_box',      // Real Betis — Estadio Benito Villamarín
  'ESP:508': 'continental_bowl', // Sevilla FC — Estadio Ramón Sánchez-Pizjuán
  'ESP:509': 'english_box',      // Valencia CF — Estadio de Mestalla (ultra-steep rectangular stands)
  'ESP:511': 'english_box',      // CA Osasuna — Estadio El Sadar
  'ESP:512': 'english_box',      // RC Celta de Vigo — Abanca Balaídos
  'ESP:513': 'english_box',      // Rayo Vallecano — Estadio de Vallecas
  'ESP:514': 'continental_bowl', // RCD Espanyol — RCDE Stadium
  'ESP:515': 'english_box',      // Getafe CF — Coliseum
  'ESP:516': 'english_box',      // Deportivo Alavés — Mendizorrotza
  'ESP:517': 'english_box',      // Real Valladolid CF — Estadio José Zorrilla
  'ESP:537': 'english_box',      // RC Deportivo de La Coruña — Abanca-Riazor
  'ESP:538': 'english_box',      // Málaga CF — Estadio La Rosaleda

  // === ITA (Serie A — 18 clubs, authentic mix of bowls, boxes & classic Italian athletics stadiums) ===
  'ITA:901': 'continental_bowl', // Juventus FC — Allianz Stadium (football-only bowl, no track!)
  'ITA:902': 'continental_bowl', // Inter Milan — San Siro / Giuseppe Meazza
  'ITA:903': 'continental_bowl', // AC Milan — San Siro / Giuseppe Meazza
  'ITA:904': 'olympic_track',    // SSC Napoli — Stadio Diego Armando Maradona (athletics track)
  'ITA:905': 'english_box',      // Atalanta BC — Gewiss Stadium (renovated steep football-only box)
  'ITA:906': 'olympic_track',    // AS Roma — Stadio Olimpico (iconic Olympic track)
  'ITA:907': 'olympic_track',    // SS Lazio — Stadio Olimpico (iconic Olympic track)
  'ITA:908': 'continental_bowl', // ACF Fiorentina — Stadio Artemio Franchi (curved D-shape, no track)
  'ITA:909': 'olympic_track',    // Bologna FC 1909 — Stadio Renato Dall'Ara (athletics track)
  'ITA:910': 'continental_bowl', // Torino FC — Stadio Olimpico Grande Torino (track removed 2006)
  'ITA:911': 'english_box',      // Genoa CFC — Stadio Luigi Ferraris / Marassi (classic English-style box!)
  'ITA:912': 'continental_bowl', // Udinese Calcio — Bluenergy Stadium (modern football-only arena)
  'ITA:913': 'english_box',      // AC Monza — U-Power Stadium (rectangular stands, no track)
  'ITA:914': 'english_box',      // Parma Calcio 1913 — Stadio Ennio Tardini (tight rectangular, no track)
  'ITA:915': 'english_box',      // Cagliari Calcio — Unipol Domus (compact tight football box)
  'ITA:916': 'olympic_track',    // Hellas Verona FC — Stadio Marcantonio Bentegodi (running track)
  'ITA:917': 'olympic_track',    // US Lecce — Stadio Via del Mare (running track)
  'ITA:919': 'english_box',      // Como 1907 — Stadio Giuseppe Sinigaglia (tight lakeside rectangular ground)

  // === FRA (Ligue 1 — 18 clubs) ===
  'FRA:401': 'continental_bowl', // Paris Saint-Germain — Parc des Princes (football-specific oval bowl)
  'FRA:402': 'continental_bowl', // Olympique Lyonnais — Groupama Stadium
  'FRA:403': 'continental_bowl', // Olympique de Marseille — Orange Vélodrome
  'FRA:404': 'olympic_track',    // AS Monaco FC — Stade Louis II (authentic athletics track!)
  'FRA:405': 'continental_bowl', // Lille OSC — Stade Pierre-Mauroy
  'FRA:406': 'continental_bowl', // OGC Nice — Allianz Riviera
  'FRA:407': 'english_box',      // RC Lens — Stade Bollaert-Delelis (famous English-style 4 stands!)
  'FRA:408': 'continental_bowl', // Stade Rennais FC — Roazhon Park
  'FRA:409': 'continental_bowl', // Toulouse FC — Stadium de Toulouse (no track)
  'FRA:410': 'english_box',      // RC Strasbourg Alsace — Stade de la Meinau
  'FRA:411': 'english_box',      // Stade Brestois 29 — Stade Francis-Le Blé
  'FRA:412': 'english_box',      // Montpellier HSC — Stade de la Mosson
  'FRA:413': 'continental_bowl', // FC Nantes — Stade de la Beaujoire
  'FRA:414': 'english_box',      // Stade de Reims — Stade Auguste-Delaune
  'FRA:416': 'english_box',      // Angers SCO — Stade Raymond Kopa
  'FRA:417': 'continental_bowl', // Le Havre AC — Stade Océane (modern football-only bowl)
  'FRA:418': 'olympic_track',    // Paris FC — Stade Sébastien Charléty (authentic athletics track!)
  'FRA:419': 'english_box',      // AS Saint-Étienne — Stade Geoffroy-Guichard (classic 4-stand cauldron)

  // === POR (Primeira Liga — 18 clubs) ===
  'POR:201': 'continental_bowl', // Sporting CP — Estádio José Alvalade
  'POR:202': 'continental_bowl', // S.L. Benfica — Estádio da Luz
  'POR:203': 'continental_bowl', // FC Porto — Estádio do Dragão
  'POR:204': 'english_box',      // S.C. Braga — Estádio Municipal de Braga (two steep cliffside stands, no track)
  'POR:205': 'english_box',      // Vitória S.C. — Estádio D. Afonso Henriques
  'POR:206': 'english_box',      // Moreirense F.C. — Parque Joaquim de Almeida Freitas
  'POR:207': 'open_terrace',     // F.C. Famalicão — Estádio Municipal 22 de Junho (5,300)
  'POR:208': 'olympic_track',    // C.D. Santa Clara — Estádio de São Miguel (Azores athletics track)
  'POR:209': 'open_terrace',     // Rio Ave F.C. — Estádio dos Arcos (5,300)
  'POR:210': 'open_terrace',     // F.C. Arouca — Estádio Municipal de Arouca (5,000)
  'POR:211': 'open_terrace',     // Casa Pia A.C. — Estádio Pina Manique (2,500)
  'POR:212': 'continental_bowl', // Gil Vicente F.C. — Estádio Cidade de Barcelos (modern football-only)
  'POR:213': 'english_box',      // G.D. Estoril Praia — Estádio António Coimbra da Mota
  'POR:214': 'english_box',      // Boavista F.C. — Estádio do Bessa (steep 4-sided English-style box!)
  'POR:215': 'english_box',      // C.F. Estrela da Amadora — Estádio José Gomes
  'POR:216': 'open_terrace',     // C.D. Nacional — Estádio da Madeira (5,200)
  'POR:217': 'english_box',      // AVS Futebol SAD — Estádio do CD Aves
  'POR:219': 'continental_bowl', // C.S. Marítimo — Estádio do Marítimo (renovated football-only bowl)

  // === SCO (Scottish Premiership — 18 clubs, classic tight Scottish/British football grounds) ===
  'SCO:1201': 'english_box', // Celtic FC — Celtic Park
  'SCO:1202': 'english_box', // Rangers FC — Ibrox Stadium
  'SCO:1203': 'english_box', // Heart of Midlothian FC — Tynecastle Park
  'SCO:1204': 'english_box', // Hibernian FC — Easter Road
  'SCO:1205': 'english_box', // Aberdeen FC — Pittodrie Stadium
  'SCO:1206': 'english_box', // Kilmarnock FC — Rugby Park
  'SCO:1207': 'english_box', // St Mirren FC — SMiSA Stadium
  'SCO:1208': 'english_box', // Motherwell FC — Fir Park
  'SCO:1209': 'english_box', // Dundee United FC — Tannadice Park
  'SCO:1210': 'english_box', // Dundee FC — Dens Park
  'SCO:1211': 'english_box', // St Johnstone FC — McDiarmid Park
  'SCO:1212': 'english_box', // Ross County FC — Global Energy Stadium
  'SCO:1213': 'english_box', // Livingston FC — Almondvale Stadium
  'SCO:1214': 'english_box', // Partick Thistle FC — Firhill Stadium
  'SCO:1215': 'english_box', // Dunfermline Athletic FC — East End Park
  'SCO:1216': 'english_box', // Raith Rovers FC — Stark's Park
  'SCO:1217': 'english_box', // Ayr United FC — Somerset Park
  'SCO:1218': 'english_box', // Falkirk FC — Falkirk Stadium

  // === SUI (Swiss Super League — 18 clubs) ===
  'SUI:1701': 'english_box',      // BSC Young Boys — Stadion Wankdorf (steep football-only, no track!)
  'SUI:1702': 'continental_bowl', // FC Basel — St. Jakob-Park (modern football-only, no track!)
  'SUI:1703': 'continental_bowl', // Servette FC — Stade de Genève
  'SUI:1704': 'olympic_track',    // FC Lugano — Stadio di Cornaredo (athletics track)
  'SUI:1705': 'olympic_track',    // FC Zürich — Stadion Letzigrund (famous Weltklasse athletics track!)
  'SUI:1706': 'continental_bowl', // FC St. Gallen — Kybunpark (football-only)
  'SUI:1707': 'continental_bowl', // FC Luzern — Swissporarena (football-only)
  'SUI:1708': 'english_box',      // FC Winterthur — Stadion Schützenwiese
  'SUI:1709': 'open_terrace',     // Yverdon-Sport FC — Stade Municipal (6,600)
  'SUI:1710': 'english_box',      // FC Lausanne-Sport — Stade de la Tuilière (brand new football-only!)
  'SUI:1711': 'olympic_track',    // Grasshopper Club Zürich — Stadion Letzigrund (shared athletics track!)
  'SUI:1712': 'english_box',      // FC Sion — Stade de Tourbillon
  'SUI:1713': 'english_box',      // FC Thun — Stockhorn Arena (compact football-only)
  'SUI:1714': 'english_box',      // FC Aarau — Stadion Brügglifeld
  'SUI:1715': 'english_box',      // FC Vaduz — Rheinpark Stadion
  'SUI:1716': 'english_box',      // FC Schaffhausen — FCS Arena
  'SUI:1717': 'olympic_track',    // AC Bellinzona — Stadio Comunale Bellinzona (track)
  'SUI:1718': 'english_box',      // Neuchâtel Xamax FCS — Stade de la Maladière (football-only box)

  // === AUT (Austrian Bundesliga — 18 clubs) ===
  'AUT:1601': 'continental_bowl', // FC Red Bull Salzburg — Red Bull Arena Wals-Siezenheim
  'AUT:1602': 'english_box',      // SK Sturm Graz — Merkur Arena (football-only)
  'AUT:1603': 'english_box',      // SK Rapid Wien — Allianz Stadion (modern steep football-only)
  'AUT:1604': 'english_box',      // FK Austria Wien — Generali Arena (modern football-only)
  'AUT:1605': 'continental_bowl', // LASK — Raiffeisen Arena (new 2023 football-only bowl!)
  'AUT:1606': 'olympic_track',    // Wolfsberger AC — Lavanttal-Arena (track)
  'AUT:1607': 'continental_bowl', // SK Austria Klagenfurt — 28 Black Arena (Euro 2008 football-only!)
  'AUT:1608': 'open_terrace',     // TSV Hartberg — Profertil Arena Hartberg (5,000)
  'AUT:1609': 'english_box',      // SC Rheindorf Altach — Cashpoint Arena
  'AUT:1610': 'english_box',      // SC Austria Lustenau — Reichshofstadion
  'AUT:1611': 'continental_bowl', // WSG Tirol — Tivoli Stadion Tirol (Euro 2008 football-only!)
  'AUT:1612': 'english_box',      // FC Blau-Weiß Linz — Hofmann Personal Stadion (new 2023 tight box!)
  'AUT:1613': 'english_box',      // SV Ried — Innviertel Arena (tight football-only)
  'AUT:1614': 'continental_bowl', // SKN St. Pölten — NV Arena (modern football-only)
  'AUT:1615': 'olympic_track',    // Schwarz-Weiß Bregenz — ImmoAgentur Stadion (running track)
  'AUT:1616': 'english_box',      // FC Admira Wacker Mödling — Datenpol Arena
  'AUT:1617': 'open_terrace',     // SV Horn — Sparkasse Horn Arena (3,500)
  'AUT:1618': 'open_terrace',     // DSV Leoben — Monte Schlacko Arena (6,000)

  // === TUR (Süper Lig — 18 clubs, modern Turkish UEFA-standard football bowls) ===
  'TUR:2401': 'continental_bowl', // Galatasaray SK — RAMS Park (modern steep bowl)
  'TUR:2402': 'english_box',      // Fenerbahçe SK — Ülker Stadyumu / Şükrü Saracoğlu (steep 4-sided cauldron)
  'TUR:2403': 'continental_bowl', // Beşiktaş JK — Tüpraş Stadyumu (modern Bosphorus bowl)
  'TUR:2404': 'continental_bowl', // Trabzonspor — Papara Park (modern football-only bowl)
  'TUR:2405': 'continental_bowl', // İstanbul Başakşehir FK — Başakşehir Fatih Terim Stadium (football-only!)
  'TUR:2406': 'continental_bowl', // Samsunspor — Samsun 19 Mayıs Stadium (modern football-only!)
  'TUR:2407': 'english_box',      // Göztepe SK — Gürsel Aksel Stadium (tight modern rectangular box)
  'TUR:2408': 'continental_bowl', // Konyaspor — Medaş Konya Büyükşehir Stadium (modern football-only!)
  'TUR:2409': 'english_box',      // Kasımpaşa SK — Recep Tayyip Erdoğan Stadium
  'TUR:2410': 'continental_bowl', // Adana Demirspor — New Adana Stadium (modern football-only!)
  'TUR:2411': 'continental_bowl', // Antalyaspor — Corendon Airlines Park (modern football-only!)
  'TUR:2412': 'continental_bowl', // Çaykur Rizespor — Çaykur Didi Stadium (football-only)
  'TUR:2413': 'english_box',      // Eyüpspor — Eyüp Stadium
  'TUR:2414': 'continental_bowl', // Alanyaspor — GAİN Park Stadium (football-only)
  'TUR:2415': 'english_box',      // Bodrum FK — Bodrum İlçe Stadium
  'TUR:2416': 'continental_bowl', // Kayserispor — RHG Enertürk Enerji Stadium (modern football-only!)
  'TUR:2417': 'continental_bowl', // Gaziantep FK — Gaziantep Stadium (modern football-only!)
  'TUR:2418': 'continental_bowl', // Sivasspor — BG Grup 4 Eylül Stadium (modern football-only!)

  // === POL (Ekstraklasa — 18 clubs, modern Euro 2012 / UEFA football stadiums) ===
  'POL:1501': 'english_box',      // Legia Warszawa — Stadion Wojska Polskiego (steep football-only box!)
  'POL:1502': 'continental_bowl', // Lech Poznań — Enea Stadion (Euro 2012 football-only!)
  'POL:1503': 'open_terrace',     // Raków Częstochowa — Miejski Stadion Piłkarski Raków (5,500)
  'POL:1504': 'english_box',      // Pogoń Szczecin — Stadion Floriana Krygiera (new football-only box)
  'POL:1505': 'continental_bowl', // Jagiellonia Białystok — Chorten Arena (modern football-only!)
  'POL:1506': 'continental_bowl', // Śląsk Wrocław — Tarczyński Arena (Euro 2012 bowl!)
  'POL:1507': 'english_box',      // Górnik Zabrze — Arena Zabrze (modern rectangular box)
  'POL:1508': 'english_box',      // Widzew Łódź — Stadion Widzewa (steep rectangular cauldron)
  'POL:1509': 'english_box',      // Wisła Kraków — Stadion im. Henryka Reymana (football-only, no track!)
  'POL:1510': 'english_box',      // Radomiak Radom — Stadion im. Braci Czachorów (new football-only!)
  'POL:1511': 'english_box',      // Zagłębie Lubin — KGHM Zagłębie Arena (football-only, no track!)
  'POL:1512': 'english_box',      // Piast Gliwice — Stadion Miejski w Gliwicach (football-only, no track!)
  'POL:1513': 'english_box',      // KS Cracovia — Stadion Cracovii
  'POL:1514': 'olympic_track',    // Stal Mielec — Stadion Miejski w Mielcu (running track)
  'POL:1515': 'english_box',      // Korona Kielce — Exbud Arena (football-only)
  'POL:1516': 'open_terrace',     // Warta Poznań — Stadion Dyskobolii (5,345)
  'POL:1517': 'english_box',      // Ruch Chorzów — Stadion Ruchu
  'POL:1518': 'english_box',      // ŁKS Łódź — Stadion Miejski im. Władysława Króla (football-only)

  // === USA (MLS — 18 clubs, modern soccer-specific stadiums & NFL domes, zero tracks!) ===
  'USA:1001': 'continental_bowl', // Atlanta United FC — Mercedes-Benz Stadium (colossal modern dome bowl)
  'USA:1002': 'continental_bowl', // Charlotte FC — Bank of America Stadium (curved bowl)
  'USA:1004': 'continental_bowl', // FC Cincinnati — TQL Stadium (modern soccer-specific bowl!)
  'USA:1005': 'english_box',      // Columbus Crew — Lower.com Field (steep soccer-specific box)
  'USA:1007': 'continental_bowl', // Inter Miami CF — Miami Freedom Park / Chase Stadium
  'USA:1009': 'continental_bowl', // Nashville SC — GEODIS Park (largest soccer-specific bowl in US)
  'USA:1011': 'continental_bowl', // New York City FC — Etihad Park / Yankee Stadium
  'USA:1012': 'continental_bowl', // New York Red Bulls — Sports Illustrated Stadium (Red Bull Arena)
  'USA:1013': 'english_box',      // Orlando City SC — Inter&Co Stadium (steep soccer-specific, The Wall!)
  'USA:1019': 'english_box',      // Houston Dynamo FC — Shell Energy Stadium (rectangular soccer-specific)
  'USA:1021': 'continental_bowl', // LA Galaxy — Dignity Health Sports Park (soccer-specific bowl)
  'USA:1022': 'english_box',      // Los Angeles FC — BMO Stadium (steep rectangular soccer-specific)
  'USA:1024': 'english_box',      // Portland Timbers — Providence Park (iconic steep rectangular box!)
  'USA:1025': 'english_box',      // Real Salt Lake — America First Field (soccer-specific)
  'USA:1026': 'continental_bowl', // San Diego FC — Snapdragon Stadium (modern bowl)
  'USA:1028': 'english_box',      // Austin FC — Q2 Stadium (steep soccer-specific)
  'USA:1029': 'english_box',      // St. Louis City SC — Energizer Park (steep soccer-specific)
  'USA:1030': 'continental_bowl', // Vancouver Whitecaps FC — BC Place (curved indoor bowl)

  // === BRA (Brasileirão Série A — 18 clubs) ===
  'BRA:1401': 'continental_bowl', // SE Palmeiras — Allianz Parque (modern football-only bowl!)
  'BRA:1402': 'continental_bowl', // CR Flamengo — Maracanã (iconic bowl, no running track)
  'BRA:1403': 'continental_bowl', // Clube Atlético Mineiro — Arena MRV (brand new 2023 football-only bowl!)
  'BRA:1404': 'continental_bowl', // Fluminense FC — Maracanã
  'BRA:1405': 'olympic_track',    // São Paulo FC — MorumBIS (famous athletics track around pitch!)
  'BRA:1406': 'continental_bowl', // Grêmio FBPA — Arena do Grêmio (modern football-only bowl)
  'BRA:1407': 'continental_bowl', // SC Internacional — Estádio Beira-Rio (2014 World Cup bowl, no track!)
  'BRA:1408': 'english_box',      // SC Corinthians Paulista — Neo Química Arena (steep rectangular stands)
  'BRA:1409': 'english_box',      // Club Athletico Paranaense — Ligga Arena (retractable-roof rectangular box)
  'BRA:1410': 'olympic_track',    // Botafogo FR — Estádio Nilton Santos / Engenhão (2016 Olympic track!)
  'BRA:1411': 'english_box',      // Santos FC — Vila Belmiro (tight historic football cauldron, no track!)
  'BRA:1412': 'continental_bowl', // Cruzeiro EC — Mineirão (World Cup bowl, no track)
  'BRA:1413': 'continental_bowl', // Fortaleza EC — Arena Castelão (World Cup bowl, no track)
  'BRA:1414': 'english_box',      // Red Bull Bragantino — Estádio Nabi Abi Chedid (football-only)
  'BRA:1415': 'continental_bowl', // EC Bahia — Arena Fonte Nova (World Cup bowl)
  'BRA:1416': 'english_box',      // CR Vasco da Gama — São Januário (historic tight cauldron)
  'BRA:1417': 'continental_bowl', // Cuiabá EC — Arena Pantanal (World Cup bowl, no track!)
  'BRA:1418': 'continental_bowl', // EC Vitória — Barradão (football-only)

  // === ARG (Liga Profesional — 18 clubs) ===
  'ARG:1901': 'continental_bowl', // CA River Plate — Estadio Mâs Monumental (track removed 2023! Giant bowl)
  'ARG:1902': 'english_box',      // CA Boca Juniors — La Bombonera (most iconic steep vertical box on Earth!)
  'ARG:1903': 'continental_bowl', // Racing Club — El Cilindro (famous circular bowl!)
  'ARG:1904': 'english_box',      // CA Independiente — Estadio Libertadores de América (steep 4-sided box!)
  'ARG:1905': 'english_box',      // CA San Lorenzo — Nuevo Gasómetro
  'ARG:1906': 'english_box',      // CA Vélez Sarsfield — Estadio José Amalfitani
  'ARG:1907': 'english_box',      // Estudiantes de La Plata — Estadio UNO (modern steep football-only!)
  'ARG:1908': 'english_box',      // CA Rosario Central — Gigante de Arroyito
  'ARG:1909': 'english_box',      // Newell's Old Boys — Estadio Marcelo Bielsa
  'ARG:1910': 'olympic_track',    // CA Talleres — Estadio Mario Alberto Kempes (Córdoba athletics track!)
  'ARG:1911': 'english_box',      // CA Belgrano — Gigante de Alberdi
  'ARG:1912': 'english_box',      // Club Atlético Lanús — La Fortaleza
  'ARG:1913': 'english_box',      // Argentinos Juniors — Estadio Diego Armando Maradona (tight box!)
  'ARG:1914': 'english_box',      // Defensa y Justicia — Estadio Norberto Tomaghello (tight football-only)
  'ARG:1915': 'continental_bowl', // CA Huracán — Estadio Tomás Adolfo Ducó (El Palacio oval bowl)
  'ARG:1916': 'english_box',      // Gimnasia y Esgrima La Plata — Estadio Juan Carmelo Zerillo (El Bosque)
  'ARG:1917': 'english_box',      // Club Atlético Tucumán — Estadio Monumental José Fierro
  'ARG:1918': 'english_box',      // CA Banfield — Estadio Florencio Sola

  // === MEX (Liga MX — 18 clubs) ===
  'MEX:2201': 'continental_bowl', // Club América — Estadio Azteca (iconic multi-tier colossus bowl!)
  'MEX:2202': 'continental_bowl', // Tigres UANL — Estadio Universitario (El Volcán oval bowl)
  'MEX:2203': 'continental_bowl', // CF Monterrey — Estadio BBVA (El Gigante de Acero modern bowl!)
  'MEX:2204': 'continental_bowl', // CD Guadalajara Chivas — Estadio Akron (volcano bowl!)
  'MEX:2205': 'continental_bowl', // Cruz Azul — Estadio Ciudad de los Deportes / Azteca
  'MEX:2206': 'english_box',      // Deportivo Toluca FC — Estadio Nemesio Díez (La Bombonera Mexicana!)
  'MEX:2207': 'continental_bowl', // CF Pachuca — Estadio Hidalgo (El Huracán, no track!)
  'MEX:2208': 'olympic_track',    // Pumas UNAM — Estadio Olímpico Universitario (1968 Olympic track!)
  'MEX:2209': 'continental_bowl', // Club León — Estadio León (Nou Camp)
  'MEX:2210': 'continental_bowl', // Santos Laguna — Estadio Corona (TSM modern football-only bowl)
  'MEX:2211': 'continental_bowl', // Atlas FC — Estadio Jalisco (classic curved bowl)
  'MEX:2212': 'english_box',      // Club Tijuana — Estadio Caliente
  'MEX:2213': 'continental_bowl', // Club Puebla — Estadio Cuauhtémoc (modernized bowl, no track!)
  'MEX:2214': 'continental_bowl', // Club Necaxa — Estadio Victoria
  'MEX:2215': 'continental_bowl', // Querétaro FC — Estadio Corregidora (1986 World Cup bowl)
  'MEX:2216': 'continental_bowl', // Atlético de San Luis — Estadio Alfonso Lastras (no track!)
  'MEX:2217': 'continental_bowl', // Mazatlán FC — Estadio El Encanto (brand new football-only!)
  'MEX:2218': 'olympic_track',    // FC Juárez — Estadio Olímpico Benito Juárez (running track!)

  // === JPN (J1 League — 18 clubs, authentic split of football-specific & athletics multi-use stadiums) ===
  'JPN:2001': 'english_box',      // Vissel Kobe — Noevir Stadium Kobe (tight retractable-roof football-only!)
  'JPN:2002': 'olympic_track',    // Yokohama F. Marinos — Nissan Stadium (72k iconic athletics track!)
  'JPN:2003': 'olympic_track',    // Kawasaki Frontale — Uvance Todoroki Stadium (athletics track!)
  'JPN:2004': 'continental_bowl', // Urawa Red Diamonds — Saitama Stadium 2002 (63k football-only bowl!)
  'JPN:2005': 'english_box',      // Kashima Antlers — Kashima Soccer Stadium (steep football-only box!)
  'JPN:2006': 'english_box',      // Sanfrecce Hiroshima — Edion Peace Wing Hiroshima (brand new 2024 box!)
  'JPN:2007': 'english_box',      // Gamba Osaka — Panasonic Stadium Suita (ultra-steep football-only!)
  'JPN:2008': 'english_box',      // Cerezo Osaka — Yodoko Sakura Stadium (football-only box!)
  'JPN:2009': 'olympic_track',    // FC Tokyo — Ajinomoto Stadium (athletics track!)
  'JPN:2010': 'english_box',      // Nagoya Grampus — Toyota Stadium (steep 4-sided football-only!)
  'JPN:2011': 'olympic_track',    // FC Machida Zelvia — Machida GION Stadium (athletics track!)
  'JPN:2012': 'english_box',      // Kyoto Sanga FC — Sanga Stadium by Kyocera (2020 steep football-only!)
  'JPN:2013': 'english_box',      // Kashiwa Reysol — Sankyo Frontier Kashiwa Stadium (ultra-tight box!)
  'JPN:2014': 'english_box',      // Avispa Fukuoka — Best Denki Stadium (football-only!)
  'JPN:2015': 'olympic_track',    // Shonan Bellmare — Lemon Gas Stadium Hiratsuka (athletics track!)
  'JPN:2016': 'continental_bowl', // Hokkaido Consadole Sapporo — Daiwa House Premist Dome (indoor bowl)
  'JPN:2017': 'english_box',      // Sagan Tosu — Ekimae Real Estate Stadium (steep football-only box!)
  'JPN:2018': 'olympic_track',    // Albirex Niigata — Denka Big Swan Stadium (athletics track!)

  // === AUS (A-League — 18 clubs) ===
  'AUS:1801': 'continental_bowl', // Sydney FC — Allianz Stadium (brand new 2022 rectangular/curved bowl)
  'AUS:1802': 'continental_bowl', // Melbourne City FC — AAMI Park (iconic geodesic dome football bowl)
  'AUS:1803': 'continental_bowl', // Melbourne Victory FC — AAMI Park (football-only, NO running track!)
  'AUS:1804': 'english_box',      // Adelaide United FC — Coopers Stadium / Hindmarsh (tight football box!)
  'AUS:1805': 'english_box',      // Western Sydney Wanderers FC — CommBank Stadium (ultra-steep 2019 box!)
  'AUS:1806': 'english_box',      // Central Coast Mariners FC — Industree Group Stadium
  'AUS:1807': 'olympic_track',    // Wellington Phoenix FC — Sky Stadium (large circular oval ground)
  'AUS:1808': 'english_box',      // Brisbane Roar FC — Suncorp Stadium (steep rectangular cauldron, no track!)
  'AUS:1809': 'english_box',      // Perth Glory FC — HBF Park (rectangular football ground)
  'AUS:1810': 'english_box',      // Newcastle Jets FC — McDonald Jones Stadium
  'AUS:1811': 'english_box',      // Macarthur FC — Campbelltown Sports Stadium
  'AUS:1812': 'open_terrace',     // Western United FC — Ironbark Fields (5,000)
  'AUS:1813': 'english_box',      // Auckland FC — Go Media Stadium Mount Smart (rectangular)
  'AUS:1814': 'olympic_track',    // South Melbourne FC — Lakeside Stadium (athletics track!)
  'AUS:1815': 'english_box',      // Sydney Olympic FC — Belmore Sports Ground (rectangular, no track!)
  'AUS:1816': 'open_terrace',     // APIA Leichhardt FC — Lambert Park (5,000)
  'AUS:1817': 'english_box',      // Marconi Stallions FC — Marconi Stadium
  'AUS:1818': 'open_terrace',     // Preston Lions FC — BT Connor Reserve (5,000)

  // === COL (Categoría Primera A — 18 clubs) ===
  'COL:2101': 'continental_bowl', // Millonarios FC — Estadio El Campín (no running track)
  'COL:2102': 'continental_bowl', // Independiente Santa Fe — Estadio El Campín
  'COL:2103': 'olympic_track',    // América de Cali — Estadio Pascual Guerrero (athletics track!)
  'COL:2104': 'olympic_track',    // Junior FC — Estadio Metropolitano Roberto Meléndez (athletics track!)
  'COL:2105': 'english_box',      // La Equidad — Estadio Metropolitano de Techo
  'COL:2106': 'continental_bowl', // Independiente Medellín — Estadio Atanasio Girardot (no track)
  'COL:2107': 'continental_bowl', // Deportivo Cali — Estadio Deportivo Cali (modern football-only bowl)
  'COL:2108': 'continental_bowl', // Deportes Tolima — Estadio Manuel Murillo Toro
  'COL:2109': 'continental_bowl', // Once Caldas — Estadio Palogrande (no track)
  'COL:2110': 'olympic_track',    // Atlético Bucaramanga — Estadio Américo Montanini (track)
  'COL:2111': 'continental_bowl', // Deportivo Pereira — Estadio Hernán Ramírez Villegas
  'COL:2112': 'continental_bowl', // Atlético Nacional — Estadio Atanasio Girardot
  'COL:2113': 'english_box',      // Águilas Doradas — Estadio Alberto Grisales
  'COL:2114': 'continental_bowl', // Deportivo Pasto — Estadio Departamental Libertad
  'COL:2115': 'english_box',      // Envigado FC — Estadio Polideportivo Sur
  'COL:2116': 'english_box',      // Alianza FC — Estadio Armando Maestre Pavajeau
  'COL:2117': 'olympic_track',    // Boyacá Chicó FC — Estadio La Independencia (track)
  'COL:2118': 'olympic_track',    // Patriotas Boyacá — Estadio La Independencia (track)

  // === ECU (LigaPro Serie A — 18 clubs) ===
  'ECU:850': 'english_box',       // Independiente del Valle — Estadio Banco Guayaquil (modern steep box!)
  'ECU:851': 'continental_bowl',  // LDU Quito — Estadio Rodrigo Paz Delgado (Casa Blanca bowl, no track)
  'ECU:852': 'continental_bowl',  // Barcelona SC — Estadio Monumental Banco Pichincha (59k colossus bowl)
  'ECU:853': 'english_box',       // CS Emelec — Estadio George Capwell (steep cauldron box!)
  'ECU:854': 'olympic_track',     // CD El Nacional — Estadio Olímpico Atahualpa (athletics track!)
  'ECU:855': 'olympic_track',     // CD Universidad Católica — Estadio Olímpico Atahualpa (track!)
  'ECU:856': 'olympic_track',     // Deportivo Cuenca — Estadio Alejandro Serrano Aguilar (track)
  'ECU:857': 'english_box',       // SD Aucas — Estadio Gonzalo Pozo Ripalda (football-only)
  'ECU:858': 'olympic_track',     // Orense SC — Estadio 9 de Mayo (track)
  'ECU:859': 'continental_bowl',  // CSD Macará — Estadio Bellavista
  'ECU:860': 'english_box',       // Delfín SC — Estadio Jocay
  'ECU:861': 'english_box',       // Manta FC — Estadio Jocay
  'ECU:862': 'continental_bowl',  // CD Técnico Universitario — Estadio Bellavista
  'ECU:863': 'olympic_track',     // SD Quito — Estadio Olímpico Atahualpa (track!)
  'ECU:864': 'olympic_track',     // Libertad FC — Estadio Reina del Cisne (track)
  'ECU:865': 'english_box',       // Mushuc Runa SC — Estadio COAC Mushuc Runa
  'ECU:866': 'english_box',       // Guayaquil City FC — Estadio Christian Benítez
  'ECU:867': 'open_terrace',      // Gualaceo SC — Estadio Gerardo León Pozo (2,791)

  // === CAN (Canadian Premier League — 18 clubs) ===
  'CAN:2301': 'english_box',      // Forge FC — Tim Hortons Field (rectangular)
  'CAN:2302': 'english_box',      // Atlético Ottawa — TD Place Stadium (rectangular)
  'CAN:2303': 'open_terrace',     // Cavalry FC — ATCO Field (6,000)
  'CAN:2304': 'open_terrace',     // HFX Wanderers FC — Wanderers Grounds (6,500)
  'CAN:2305': 'open_terrace',     // Pacific FC — Starlight Stadium (6,000)
  'CAN:2306': 'continental_bowl', // Valour FC — Princess Auto Stadium (33k modern bowl)
  'CAN:2307': 'open_terrace',     // Vancouver FC — Willoughby Community Park (6,560)
  'CAN:2308': 'olympic_track',    // York United FC — York Lions Stadium (athletics track)
  'CAN:2309': 'open_terrace',     // FC Edmonton — Clarke Stadium (5,100)
  'CAN:2310': 'open_terrace',     // Simcoe County Rovers FC (2,000)
  'CAN:2311': 'open_terrace',     // CS Saint-Laurent (1,500)
  'CAN:2312': 'open_terrace',     // Vaughan Azzurri (2,000)
  'CAN:2313': 'open_terrace',     // AS Laval (1,000)
  'CAN:2314': 'olympic_track',    // TSS Rovers FC — Swangard Stadium (athletics track)
  'CAN:2315': 'open_terrace',     // Victoria Highlanders FC (2,500)
  'CAN:2316': 'open_terrace',     // Guelph United FC (1,500)
  'CAN:2317': 'open_terrace',     // FC London (1,200)
  'CAN:2318': 'open_terrace',     // Rivers FC (1,000)

  // === WAL (Cymru Premier — 18 clubs, intimate Welsh community football grounds) ===
  'WAL:1301': 'english_box',  // The New Saints FC — Park Hall
  'WAL:1302': 'open_terrace', // Connah's Quay Nomads FC (1,500)
  'WAL:1303': 'open_terrace', // Bala Town FC — Maes Tegid (3,000)
  'WAL:1304': 'open_terrace', // Penybont FC — Bryntirion Park (3,000)
  'WAL:1305': 'english_box',  // Newtown AFC — Latham Park (5,000)
  'WAL:1306': 'open_terrace', // Caernarfon Town FC — The Oval (3,000)
  'WAL:1307': 'open_terrace', // Haverfordwest County AFC — Bridge Meadow (2,000)
  'WAL:1308': 'open_terrace', // Barry Town United FC — Jenner Park (3,000)
  'WAL:1309': 'open_terrace', // Cardiff Metropolitan University FC (1,500)
  'WAL:1310': 'english_box',  // Aberystwyth Town FC — Park Avenue (5,000)
  'WAL:1311': 'open_terrace', // Pontypridd United (1,000)
  'WAL:1312': 'open_terrace', // Colwyn Bay FC (2,500)
  'WAL:1313': 'open_terrace', // Briton Ferry Llansawel AFC (1,000)
  'WAL:1314': 'open_terrace', // Flint Town United FC (1,000)
  'WAL:1315': 'open_terrace', // Carmarthen Town AFC (3,000)
  'WAL:1316': 'open_terrace', // Afan Lido FC (4,200)
  'WAL:1317': 'open_terrace', // Airbus UK Broughton FC (1,600)
  'WAL:1318': 'open_terrace', // Merthyr Town FC — Penydarren Park (3,200)
};

/**
 * Resolves the curated real-world stadium style for any Tier 1 club (or a Tier 1 club
 * that was subsequently relegated/promoted during a career, since club ID + country stay constant).
 */
export const resolveCuratedTier1StadiumStyle = (
  club?: Partial<Club> | null
): StadiumArchitectureStyle | null => {
  if (!club || club.id == null) return null;
  const country = (club.country || 'GER').toUpperCase();
  const key = `${country}:${club.id}`;
  return TIER1_CLUB_STADIUM_STYLES[key] ?? null;
};
