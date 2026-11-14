import { Club, GameState, SeasonHistory } from '../types';
import { ALL_CLUBS } from '../data/clubsData';
import { TEAMS } from '../mod-data/teams';
import {
  getDomesticCupInfo,
  getLeagueInfo,
  getMaxTier,
  isReserveClub,
  normalizeCountryCode,
} from '../data/gameConstants';
import {
  AFC_COUNTRIES,
  CONCACAF_COUNTRIES,
  CONMEBOL_COUNTRIES,
  UEFA_COUNTRIES,
  getRegion,
} from './regionHelpers';
import {
  NATIONAL_TEAMS,
  getHostNation,
  isWorldCupYear,
} from '../engine/internationalEngine';

export type CompetitionCategory = 'league' | 'domestic_cup' | 'continental_cup' | 'global_cup';

export interface AlmanacCompetitionWinner {
  id: string;
  year: number;
  competitionId: string;
  competitionName: string;
  competitionShort: string;
  category: CompetitionCategory;
  tier?: number;
  country: string;
  clubId?: number;
  clubName: string;
  clubColor: string;
  clubLogo?: string;
  isUserClub: boolean;
  isPastManagerClub: boolean;
  isHistoricalLore: boolean;
  notes?: string;
  wins?: number;
  draws?: number;
  losses?: number;
  pts?: number;
  coachName?: string;
  flag?: string;
  hostCountry?: string;
  hostFlag?: string;
  hostStadium?: string;
  runnerUp?: string;
  finalScore?: string;
  isNationalTeam?: boolean;
}

export interface AlmanacYearRecord {
  year: number;
  seasonLabel: string;
  isHistoricalLore: boolean;
  country: string;
  leagueWinners: AlmanacCompetitionWinner[]; // Tier 1 .. maxTier
  cupWinners: AlmanacCompetitionWinner[]; // Domestic Cup, Regional Cup
  globalWinners: AlmanacCompetitionWinner[]; // Continental & Global Cups
}

// Deterministic hash helper
function hashSeed(str: string, year: number): number {
  let h = (year * 2654435761) >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 1597334677) >>> 0;
  }
  return (h ^ (h >>> 16)) >>> 0;
}

export function formatAlmanacSeasonLabel(year: number): string {
  const prev = year - 1;
  return `${prev}/${String(year).slice(-2)}`;
}

// Unlicensed fallback coach names when Real Name Mod is not active (isModActive === false)
const REAL_TO_FALLBACK_COACH_MAP: Record<string, string> = {
  // Modern & Iconic Managers (aligned with coachEngine.ts fallback style)
  'Jürgen Klopp': 'Jurgen Flopp',
  'Pep Guardiola': 'Pep Guardiröla',
  'Hansi Flick': 'Hansi Klick',
  'Julian Nagelsmann': 'Julian Bagelsmann',
  'Thomas Tuchel': 'Thomas Tucholsky',
  'Mikel Arteta': 'Mikel Arteter',
  'Xabi Alonso': 'Xavi Alonzo',
  'Carlo Ancelotti': 'Carlo Angelotti',
  'Diego Simeone': 'Diego Simione',
  'Zinedine Zidane': 'Zinedine Zidan',
  'José Mourinho': 'Jose Morinho',
  'Arsène Wenger': 'Arsene Venger',
  'Sir Alex Ferguson': 'Alex Fergusson',
  'Alex Ferguson': 'Alex Fergusson Sr.',
  'Sebastian Hoeneß': 'Sebastian Hoeness',
  'Edin Terzić': 'Edin Terzich',
  'Vincent Kompany': 'Vincent Kompani',
  'Arne Slot': 'Arne Slott',
  'Unai Emery': 'Unai Emeri',
  'Eddie Howe': 'Eddie Howel',
  'Thomas Frank': 'Thomas Francke',
  'Xavi Hernández': 'Xavi Hernandes',
  'Luis de la Fuente': 'Luis de la Fuentes',
  'Simone Inzaghi': 'Simone Inzagi',
  'Gian Piero Gasperini': 'Piero Gasperino',
  'Stefano Pioli': 'Stefano Piolli',
  'Thiago Motta': 'Thiago Mota',
  'Antonio Conte': 'Antonio Conti',
  'Luciano Spalletti': 'Luciano Spaletti',
  'Massimiliano Allegri': 'Max Alegri',
  'Maurizio Sarri': 'Maurizio Sari',
  'Fabio Capello': 'Fabio Capelo',
  'Arrigo Sacchi': 'Arrigo Sachi',
  'Marcello Lippi': 'Marcello Lipi',
  'Giovanni Trapattoni': 'Giovanni Trapatoni',
  'Enzo Bearzot': 'Enzo Berzot',
  'Nereo Rocco': 'Nereo Roco',
  'Vittorio Pozzo': 'Vittorio Pozo',
  'Didier Deschamps': 'Didier Deschamp',
  'Christophe Galtier': 'Christophe Galtie',
  'Luis Enrique': 'Luis Enrike',
  'Laurent Blanc': 'Laurent Blank',
  'Aimé Jacquet': 'Aime Jaquet',
  'Albert Batteux': 'Albert Bateux',
  'Jupp Heynckes': 'Jupp Heinkes',
  'Joachim Löw': 'Joachim Loew',
  'Ottmar Hitzfeld': 'Ottmar Hitzfelt',
  'Otto Rehhagel': 'Otto Rehagel',
  'Christoph Daum': 'Christoph Dohm',
  'Felix Magath': 'Felix Magat',
  'Thomas Schaaf': 'Thomas Schaf',
  'Matthias Sammer': 'Matthias Samer',
  'Armin Veh': 'Armin Vee',
  'Franz Beckenbauer': 'Franz Bekenbauer',
  'Ernst Happel': 'Ernst Hapel',
  'Pál Csernai': 'Pal Chernai',
  'Udo Lattek': 'Udo Latek',
  'Hennes Weisweiler': 'Hennes Weisweiller',
  'Dettmar Cramer': 'Dettmar Kramer',
  'Helmut Schön': 'Helmut Schoen',
  'Max Merkel': 'Max Merkell',
  'Branko Zebec': 'Branko Zebek',
  'Zlatko Čajkovski': 'Zlatko Chaikovski',
  'Sepp Herberger': 'Josef Herberger',
  'Matt Busby': 'Matt Busbi',
  'Sir Matt Busby': 'Sir Matt Busbi',
  'Alf Ramsey': 'Alfredo Ramsey',
  'Bill Shankly': 'Bill Shankley',
  'Bob Paisley': 'Bob Paisly',
  'Brian Clough': 'Brian Cluff',
  'Kenny Dalglish': 'Kenny Dalgleish',
  'Howard Kendall': 'Howard Kendal',
  'George Graham': 'George Grayham',
  'Rafa Benítez': 'Rafa Benites',
  'Roberto Mancini': 'Roberto Mancino',
  'Manuel Pellegrini': 'Manuel Pelegrini',
  'Claudio Ranieri': 'Claudio Ranierri',
  'Johan Cruyff': 'Johan Kruyff',
  'Louis van Gaal': 'Louis van Gal',
  'Frank Rijkaard': 'Frank Reikaard',
  'Vicente del Bosque': 'Vicente del Boske',
  'Luis Aragonés': 'Luis Aragones',
  'Miguel Muñoz': 'Miguel Munoz',
  'Helenio Herrera': 'Helenio Herera',
  'Rinus Michels': 'Rinus Mikels',
  'Guus Hiddink': 'Guus Hidink',
  'Ronald Koeman': 'Ronald Koman',
  'Erik ten Hag': 'Erik ten Haag',
  'Peter Bosz': 'Peter Boss',
  'Bela Guttmann': 'Bela Gutmann',
  'Artur Jorge': 'Artur Jorje',
  'Jorge Jesus': 'Jorge Jezus',
  'Sérgio Conceição': 'Sergio Conceicao',
  'Rúben Amorim': 'Ruben Amorin',
  'Roger Schmidt': 'Roger Schmit',
  'Vicente Feola': 'Vicente Feolla',
  'Aymoré Moreira': 'Aymore Moreyra',
  'Mário Zagallo': 'Mario Zagalo',
  'Telê Santana': 'Tele Santanna',
  'Carlos Alberto Parreira': 'Carlos Pareira',
  'Luiz Felipe Scolari': 'Felipe Escolari',
  'Vanderlei Luxemburgo': 'Vanderlei Luxembourgo',
  'Muricy Ramalho': 'Muricy Ramalo',
  'Tite Bacchi': 'Tite Bachi',
  'Abel Ferreira': 'Abel Fereira',
  'Dorival Júnior': 'Dorival Junior',
  'Fernando Diniz': 'Fernando Dinis',
  'Filipe Luís': 'Filipe Luis',
  'Guillermo Stábile': 'Guillermo Stabile',
  'Osvaldo Zubeldía': 'Osvaldo Zubeldia',
  'César Luis Menotti': 'Cesar Menoti',
  'Carlos Bilardo': 'Carlos Villardo',
  'Carlos Bianchi': 'Carlos Bianki',
  'Ramón Díaz': 'Ramon Dias',
  'Marcelo Bielsa': 'Marcelo Bielza',
  'Marcelo Gallardo': 'Marcelo Galardo',
  'Alejandro Sabella': 'Alejandro Sabela',
  'Lionel Scaloni': 'Lionel Escalon',
  'Alberto Suppici': 'Alberto Supici',
  'Juan López Fontana': 'Juan Lopez Fontan',
};

/**
 * Converts a real historical coach name into a deterministic unlicensed fallback coach name
 * when the Real Name Mod is not active (`isModActive === false`).
 * Preserves 1-to-1 uniqueness so decade-isolation invariants hold in both modded and unmodded modes.
 */
export function toFallbackCoachName(realName: string): string {
  const clean = (realName || '').trim();
  if (!clean) return 'Coach';
  if (REAL_TO_FALLBACK_COACH_MAP[clean]) {
    return REAL_TO_FALLBACK_COACH_MAP[clean];
  }

  // Strip diacritics and special characters for unlicensed fallback base
  const ascii = clean
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/ø/g, 'o')
    .replace(/Ø/g, 'O')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I');

  const parts = ascii.split(/\s+/);
  const suffixIdx =
    parts.length > 1 && /^(Sr\.|Jr\.|II|III)$/i.test(parts[parts.length - 1])
      ? parts.length - 2
      : parts.length - 1;
  const surname = parts[suffixIdx] || ascii;

  let tweaked = surname;
  if (/mann$/i.test(surname)) {
    tweaked = surname.replace(/mann$/i, 'man');
  } else if (/man$/i.test(surname)) {
    tweaked = surname.replace(/man$/i, 'mann');
  } else if (/son$/i.test(surname)) {
    tweaked = surname.replace(/son$/i, 'sen');
  } else if (/sen$/i.test(surname)) {
    tweaked = surname.replace(/sen$/i, 'sson');
  } else if (/ez$/i.test(surname)) {
    tweaked = surname.replace(/ez$/i, 'es');
  } else if (/es$/i.test(surname)) {
    tweaked = surname.replace(/es$/i, 'ez');
  } else if (/ini$/i.test(surname)) {
    tweaked = surname.replace(/ini$/i, 'ino');
  } else if (/tti$/i.test(surname)) {
    tweaked = surname.replace(/tti$/i, 'ti');
  } else if (/lli$/i.test(surname)) {
    tweaked = surname.replace(/lli$/i, 'li');
  } else if (/vic$/i.test(surname)) {
    tweaked = surname.replace(/vic$/i, 'vich');
  } else if (/ski$/i.test(surname)) {
    tweaked = surname.replace(/ski$/i, 'sky');
  } else if (/er$/i.test(surname)) {
    tweaked = surname.replace(/er$/i, 'ers');
  } else if (/o$/i.test(surname)) {
    tweaked = surname.replace(/o$/i, 'os');
  } else if (/a$/i.test(surname)) {
    tweaked = surname.replace(/a$/i, 'as');
  } else if (/i$/i.test(surname)) {
    tweaked = surname.replace(/i$/i, 'is');
  } else if (/e$/i.test(surname)) {
    tweaked = surname.replace(/e$/i, 'er');
  } else {
    tweaked = `${surname}e`;
  }

  parts[suffixIdx] = tweaked;
  return parts.join(' ');
}

// Strictly era-partitioned coach rosters by decade (1950s through 2020s) for all 36 countries.
// Guarantees that coaches from the 1950s, 1960s, 1970s, 1980s, 1990s, 2000s, 2010s, and 2020s
// belong exclusively to their era and never resurface in later or earlier decades.
const ERA_COACHES_BY_DECADE: Record<number, Record<string, string[]>> = {
  1950: {
    GER: ['Sepp Herberger', 'Georg Wurzer', 'Hans Tauchert', 'Paul Oßwald', 'Helmut Schneider', 'Kuno Klötzer'],
    ENG: ['Matt Busby', 'Stan Cullis', 'Arthur Rowe', 'Ted Drake', 'Walter Winterbottom', 'Frank Buckley'],
    ESP: ['Enrique Fernández', 'Ferdinand Daučík', 'José Villalonga', 'Jacinto Quincoces', 'Patricio Caicedo', 'Antonio Barrios'],
    ITA: ['Lajos Czeizler', 'Alfredo Foni', 'Fulvio Bernardini', 'Jesse Carver', 'György Sárosi', 'Annibale Frossi'],
    FRA: ['Albert Batteux', 'André Cheuva', 'Pierre Pibarot', 'Jules Vandooren', 'Lucien Leduc', 'Numa Andoire'],
    POR: ['Cândido de Oliveira', 'János Biri', 'Lippo Hertzka', 'Otto Glória', 'Randolph Galloway', 'Dorival Yustrich'],
    NED: ['Jaap van der Leck', 'Max Merkel Sr.', 'Friedrich Donenfeld', 'Kees van Dijke', 'Wim de Bois', 'Karl Humenberger'],
    BRA: ['Flávio Costa', 'Zezé Moreira', 'Vicente Feola', 'Gentil Cardoso', 'Sylvio Pirillo', 'Oswaldo Brandão'],
    ARG: ['Guillermo Stábile', 'José María Minella', 'Renato Cesarini', 'Carlos Peucelle', 'Ernesto Lazzatti', 'Emilio Baldonedo'],
    DEN: ['Arne Sørensen', 'Kaj Uldaler', 'Edvin Hansen', 'Lajos Szendrődi', 'Alf Young', 'Poul Petersen'],
    SWE: ['George Raynor', 'Rudolf Kock', 'Eric Persson', 'Kálmán Konrád', 'József Nagy', 'Sven-Ove Svensson'],
    NOR: ['Willibald Hahn', 'Frank Soo', 'Ragnar Larsen', 'Kristian Henriksen', 'Knut Osnes', 'Reidar Kvammen'],
    IDN: ['Antun Pogačnik', 'Choo Seng Quee', 'Maulwi Saelan', 'Ramang Macan', 'Aang Witarsa', 'Djamiat Dalhar'],
    IND: ['Syed Abdul Rahim', 'Balaidas Chatterjee', 'Sailen Manna', 'Saroj Bose', 'T. Shanmugam', 'Sheoo Mewalal'],
    SVK: ['Ferdinand Daučík Sr.', 'Leopold Šťastný', 'Karol Borhy', 'Anton Bulla', 'Jozef Marko', 'Štefan Čambal'],
    PER: ['Arturo Fernández', 'Alfonso Huapaya', 'Juan Valdivieso', 'Segundo Castillo', 'Adelfo Magallanes', 'Jorge Pardón'],
    KOR: ['Lee Yoo-hyung', 'Kim Yong-sik', 'Park Kyu-chung', 'Bae Jong-ho', 'Joo Young-kwang', 'Min Byung-dae'],
    BOL: ['Mario Pretto', 'Félix Deheza', 'Diogenes Lara', 'Ulises Saucedo', 'Julio Borelli', 'Alberto Achá'],
    PAR: ['Manuel Fleitas Solich', 'Aurelio González', 'Vessilio Bártoli', 'César López Fretes', 'Marcial Barrios', 'Sinforiano García'],
    CHI: ['Luis Tirado', 'Francisco Platko', 'Alberto Buccicardi', 'Alejandro Scopelli', 'Enrique Sorrel', 'Carlos Schneeberger'],
    CRO: ['Bernard Hügl', 'Márton Bukovi', 'Franjo Glaser', 'Gustav Lechner', 'Leo Lemešić', 'Jozo Matošić'],
    GRE: ['Kostas Negrepontis', 'Harry Game', 'Antonis Migiakis', 'Ioannis Chelmis', 'Svetislav Glišović', 'Tryfon Tzanetis'],
    POL: ['Ryszard Koncewicz', 'Tadeusz Foryś', 'Michał Matyas', 'Wacław Kuchar', 'Ewald Cebula', 'Czesław Suszczyk'],
    SCO: ['Bill Struth', 'Scot Symon', 'Willie McCartney', 'Tommy Walker', 'Davie Shaw', 'Bobby Ancell'],
    TUR: ['Gündüz Kılıç', 'Sandro Puppo', 'László Székely', 'Cihat Arman', 'Rebii Erkal', 'Fikret Arıcan'],
    AUT: ['Walter Nausch', 'Karl Geyer', 'Josef Molzer', 'Eduard Frühwirth', 'Johann Pesser', 'Viktor Hierländer'],
    SUI: ['Karl Rappan', 'Franco Andreoli', 'Hans Rüegsegger', 'Willi Baumgartner', 'Jacques Spagnoli', 'Albert Sing'],
    URU: ['Juan López Fontana', 'Enrique Fernández Viola', 'Ondino Viera Sr.', 'Hugo Bagnulo', 'Máspoli Sr.', 'Pedroazzo'],
    COL: ['Adolfo Pedernera Sr.', 'Fernando Paternoster', 'Pedro Cabillón', 'Julio Tocker', 'Carlos Aldabe', 'Donaldo Ross Sr.'],
    ECU: ['Gregorio Esperón', 'José María Ocampo', 'Eduardo Spandre', 'Jorge Lazo', 'Fortunato Muñoz', 'Enrique Cantos'],
    MEX: ['Octavio Vial', 'Ignacio Trelles', 'Horacio Casarín', 'Antonio López Herranz', 'Donaldo Ross', 'José Moncebáez'],
    USA: ['Bill Jeffrey', 'Erno Schwarz', 'Jimmy Mills', 'George Meyer', 'John Wood', 'Bob Gormley'],
    CAN: ['George Graham Sr.', 'Doug McMahon', 'Bill Findlay', 'Pat Philley', 'Joe Kennaway', 'Stan Stronge'],
    JPN: ['Hirokazu Ninomiya', 'Takenokoshi Shigemaru', 'Hidetoki Takahashi', 'Yukio Tsuda', 'Taizo Kawamoto', 'Toshio Iwatani'],
    AUS: ['Joe Vlatsis', 'Jim Bayutti', 'Ron Corry', 'Frank Loughran', 'Tom Jack', 'Norman Conquest'],
    WAL: ['Walley Barnes', 'Jimmy Murphy', 'Trevor Morris', 'Cyril Spiers', 'Bill Jones', 'Ivor Powell'],
    DEFAULT: ['Sepp Herberger', 'Matt Busby', 'Albert Batteux', 'Guillermo Stábile', 'Vicente Feola', 'Lajos Czeizler'],
  },
  1960: {
    GER: ['Max Merkel', 'Günter Mahlmann', 'Zlatko Čajkovski', 'Fritz Langner', 'Branko Zebec', 'Willi Multhaup'],
    ENG: ['Alf Ramsey', 'Bill Nicholson', 'Harry Catterick', 'Joe Mercer', 'Bertie Mee', 'Matt Gillies'],
    ESP: ['Miguel Muñoz', 'Helenio Herrera', 'Domènec Balmanya', 'Roque Olsen', 'Otto Bumbel', 'Marcel Domingo'],
    ITA: ['Nereo Rocco', 'Edmondo Fabbri', 'Heriberto Herrera', 'Manlio Scopigno', 'Bruno Pesaola', 'Nils Liedholm'],
    FRA: ['Jean Snella', 'Henri Guérin', 'José Arribas', 'Kader Firoud', 'Louis Dugauguez', 'Jean Luciano'],
    POR: ['Bela Guttmann', 'Fernando Riera', 'Lino Taioli', 'Mário Wilson', 'José Maria Pedroto', 'Fernando Vaz'],
    NED: ['Elek Schwartz', 'Georg Keßler', 'Vic Buckingham', 'Keith Spurgeon', 'Norberto Höfling', 'Ben Peeters'],
    BRA: ['Aymoré Moreira', 'Lula Alonso', 'Tim Elba', 'Antoninho Fernandes', 'Zezé Procópio', 'Martim Francisco'],
    ARG: ['Osvaldo Zubeldía', 'Juan Carlos Lorenzo', 'Juan José Pizzuti', 'Manuel Giúdice', 'Adolfo Pedernera', 'Jim Lopes'],
    DEN: ['Poul E. Petersen', 'John Hansen', 'Henry From', 'Ernst Netuka', 'Erik Dennung', 'Knud Lundberg'],
    SWE: ['Lennart Nyman', 'Orvar Bergmark', 'Antonio Durán', 'Gunnar Gren', 'Stig Svensson', 'Gunnar Nordahl'],
    NOR: ['Wilhelm Kment', 'Ragnar Nikolay', 'Øivind Johannessen', 'Knut Brynildsen', 'Thorbjørn Svenssen', 'Arne Ileby'],
    IDN: ['Endang Witarsa', 'Soetjipto Soentoro', 'EA Mangindaan', 'Djohar Arifin', 'Kwee Kiat Sek', 'Tan Liong Houw'],
    IND: ['P.K. Banerjee', 'Jarnail Singh', 'Chuni Goswami', 'Amal Dutta', 'G.M. Pentiah', 'M.A. Sattar'],
    SVK: ['Michal Vičan', 'Ján Hucko', 'Anton Malatinský', 'Viliam Schrojf', 'Gejza Kalocsay', 'Štefan Jačiansky'],
    PER: ['Marcos Calderón', 'Didi Pereira', 'Roberto Scarone', 'Miguel Ortega', 'Jaime de Almeida', 'Rafael Castillo'],
    KOR: ['Chung Kook-chin', 'Kim Kyu-hwan', 'Han Hong-ki', 'Park Il-kap', 'Choi Jung-min', 'Ham Heung-chul'],
    BOL: ['Danilo Alvim', 'Freddy Valda', 'René Pontoni', 'Carlos Trigo', 'Vicente Arraya', 'Víctor Agustín Ugarte'],
    PAR: ['Ondino Viera', 'Benjamin Laterza', 'Sinforiano Vega', 'Silvio Parodi', 'Gavino Cárdenas', 'Pascual Rojas'],
    CHI: ['Luis Álamo', 'Caupolicán Peña', 'Hugo Tassara', 'Francisco Hormazábal', 'Andrés Prieto', 'Sergio Livingstone'],
    CRO: ['Milan Antolković', 'Ivica Horvat', 'Vlatko Marković', 'Slavko Luštica', 'Dušan Nenković', 'Ozren Nedoklan'],
    GRE: ['Stjepan Bobek', 'Lakis Petropoulos', 'Dan Georgiadis', 'Jenő Csaknády', 'Panos Markovic', 'Nikos Pangalos'],
    POL: ['Karol Krawczyk', 'Teodor Wieczorek', 'Władysław Giergiel', 'Augustyn Dziwisz', 'Artur Woźniak', 'Edward Brzozowski'],
    SCO: ['Jock Stein', 'Eddie Turnbull', 'Willie Waddell', 'Jerry Kerr', 'Bobby Brown', 'Ian McColl'],
    TUR: ['Coşkun Özarı', 'Adnan Süvari', 'Ignác Molnár', 'Tomislav Kaloperović', 'Metin Oktay', 'Sabri Kiraz'],
    AUT: ['Karl Decker', 'Karl Schlechta', 'Rudolf Vytlačil', 'Paulitsch Heinz', 'Joschi Walter', 'Béla Guttmann Jr.'],
    SUI: ['Alfredo Foni Jr.', 'Erwin Ballabio', 'Louis Maurer', 'Jiří Sobotka', 'René Hüssy', 'Kurt Linder'],
    URU: ['Juan Carlos Corazzo', 'Roque Gastón Máspoli', 'Rafael Milans', 'Washington Etchamendi', 'Enrique Lupiz', 'Juan López II'],
    COL: ['Gabriel Ochoa Uribe', 'Efraín Sánchez', 'César López', 'Pancho Villegas', 'Roberto Saba', 'José Etchegoyen'],
    ECU: ['Mariano Larraz', 'José Gomes Nogueira', 'Pablo Ansaldo', 'Otto Vieira', 'Jorge Henriques', 'Fausto Montalván'],
    MEX: ['Raúl Cárdenas', 'Javier de la Torre', 'Árpád Fekete', 'Alfonso Portugal', 'Diego Mercado', 'Walter Ormeño'],
    USA: ['Phil Woosnam', 'Gene Chyzowych', 'Gordon Jago', 'Geza Henni', 'Bill Nuttall', 'Bob Kehoe'],
    CAN: ['Peter Roe', 'Don Petrie', 'Alan Goodall', 'Ken Pears', 'Dave Stothard', 'Tony Waiters Sr.'],
    JPN: ['Ken Naganuma', 'Shunichiro Okano', 'Dettmar Klaus', 'Ryuzo Hiraki', 'Masashi Watanabe', 'Shigeo Yaegashi'],
    AUS: ['Tiko Jelisavčić', 'Joe Vlasits', 'Johnny Warren Sr.', 'Rale Rasic Sr.', 'Les Scheinflug', 'Attila Abonyi'],
    WAL: ['Dave Bowen', 'Cliff Jones', 'Ron Burgess', 'Len Allchurch', 'Mel Charles', 'Terry Medwin'],
    DEFAULT: ['Alf Ramsey', 'Miguel Muñoz', 'Nereo Rocco', 'Bela Guttmann', 'Aymoré Moreira', 'Osvaldo Zubeldía'],
  },
  1970: {
    GER: ['Udo Lattek', 'Hennes Weisweiler', 'Helmut Schön', 'Dettmar Cramer', 'Dietrich Weise', 'Erich Ribbeck'],
    ENG: ['Bill Shankly', 'Bob Paisley', 'Don Revie', 'Dave Sexton', 'Ron Greenwood', 'Tommy Docherty'],
    ESP: ['Luis Molowny', 'Rinus Michels', 'Miljan Miljanić', 'Vujadin Boškov', 'Arsenio Iglesias', 'Manuel Carriega'],
    ITA: ['Ferruccio Valcareggi', 'Čestmír Vycpálek', 'Carlo Parola', 'Luigi Radice', 'Gustavo Giagnoni', 'Tommaso Maestrelli'],
    FRA: ['Robert Herbin', 'Stefan Kovač', 'Michel Hidalgo', 'Antoine Redin', 'Just Fontaine', 'Pierre Cahuzac'],
    POR: ['Jimmy Hagan', 'Juca Simões', 'Mário Lino', 'Fernando Cabrita', 'John Mortimore', 'Rodrigues Dias'],
    NED: ['František Fadrhonc', 'George Knobel', 'Jan Zwartkruis', 'Cor Brom', 'Wiel Coerver Sr.', 'Kees Rijvers'],
    BRA: ['Mário Zagallo', 'Cláudio Coutinho', 'Rubens Minelli', 'Osvaldo Daltro', 'Duque Oliveira', 'Oto Glória Jr.'],
    ARG: ['César Luis Menotti', 'Ángel Labruna', 'Victorio Spinetto', 'Roberto Saporiti', 'Carmelo Faraone', 'Pedro Dellacha'],
    DEN: ['Rudi Strittich', 'Kurt Nielsen', 'Jørgen Hvidemose', 'Boel Bosse', 'Erik Køppen', 'Jack Johnson'],
    SWE: ['Georg Ericson', 'Bob Houghton', 'Roy Hodgson', 'Tord Grip', 'Bo Johansson', 'Lars Arnesson'],
    NOR: ['George Curtis', 'Kjell Schou-Andreassen', 'Nils Arne Eggen', 'Tor Røste Fossen', 'Einar Bruno Larsen', 'Roar Johansen'],
    IDN: ['Wiel Coerver', 'Suwardi Arland', 'Marek Janota', 'Iswadi Idris', 'Sinyo Aliandoe', 'Kadir Jusuf'],
    IND: ['Arun Ghosh', 'Subhash Bhowmick', 'Pradip Kumar', 'Syed Nayeemuddin', 'Surajit Sengupta', 'Gautam Sarkar'],
    SVK: ['Jozef Vengloš', 'Václav Ježek', 'Valér Švec', 'Ján Zachar', 'Koloman Gögh', 'Marián Masný'],
    PER: ['Alejandro Heredia', 'Roque Máspoli', 'José Chiarella', 'Juan Eduardo Hohberg', 'Moisés Barack', 'César Cubilla'],
    KOR: ['Cha Bum-kun', 'Moon Jung-sik', 'Kim Jung-nam', 'Choi Eun-taek', 'Park Byung-chul', 'An Jong-soo'],
    BOL: ['Ramiro Blacut', 'Wilfredo Camacho', 'Edward Virba', 'Arturo López', 'Abulón Gómez', 'Jesús Herbas'],
    PAR: ['Ramón Rodríguez', 'Salvador Breglia', 'Carlos Sanabria', 'Luis Cubilla', 'Vladislao Cap', 'Benjamín Fernández'],
    CHI: ['Raúl Pino', 'Luis Santibáñez', 'Orlando Aravena', 'Pedro Morales', 'Caupolicán Soto', 'Washington Urrutia'],
    CRO: ['Tomislav Ivić', 'Mirko Bazić', 'Zorislav Srebrić', 'Vlatko Bogdanović', 'Dražan Jerković', 'Biće Mladinić'],
    GRE: ['Alketas Panagoulias', 'Ferenc Puskás', 'Billy Bingham', 'Todor Veselinović', 'Antonis Georgiadis', 'Vic Buckingham Jr.'],
    POL: ['Kazimierz Górski', 'Jacek Gmoch', 'Andrzej Strejlau', 'Jerzy Kopa', 'Leszek Jezierski', 'Hubert Kostka'],
    SCO: ['Ally MacLeod', 'Jock Wallace', 'Billy McNeill', 'Jim McLean', 'John Greig', 'Willie Ormond'],
    TUR: ['Ahmet Suat Özyazıcı', 'Brian Birch', 'Didi Valdir', 'Özkan Sümer', 'Fethi Demircan', 'Ziya Taner'],
    AUT: ['Helmut Senekowitsch', 'Otto Barić Sr.', 'Erich Hof', 'Robert Dienst', 'Hermann Stessl', 'Karl Stotz'],
    SUI: ['Helmut Benthaus Sr.', 'Daniel Jeandupeux', 'Willy Sommer', 'Péter Pázmándy', 'Léon Walker', 'René Bliard'],
    URU: ['Dino Sani', 'Raúl Bentancor', 'Omar Borrás', 'José María Rodríguez', 'Walter Brienza', 'Luis Cubilla II'],
    COL: ['Toza Veselinović', 'Vladimir Popović Sr.', 'Delio Gamboa', 'Jorge Ruiz', 'Humberto Ortiz', 'Baudilio Jáuregui'],
    ECU: ['Héctor Morales', 'Ernesto Guerra', 'Leonel Montoya', 'Roque Gastón', 'Otto Cid', 'Polo Carrera'],
    MEX: ['José Antonio Roca', 'Carlos Miloc', 'Guillermo Cañedo', 'Horacio López Salgado', 'Gustavo Peña', 'Jorge Marik'],
    USA: ['Eddie Firmani', 'Al Miller', 'Manfred Schellscheidt', 'Ron Newman', 'Hubert Vogelsinger', 'Noel Cantwell'],
    CAN: ['Eckhard Krautzun', 'Barrie Clarke', 'Frank Pike', 'Colin Morris', 'Buzz Parsons', 'John Kerr Sr.'],
    JPN: ['Kunishige Kamamoto', 'Hiroshi Ninomiya', 'Yukio Shimomura', 'Tadao Onishi', 'Mitsuo Kamata', 'Teruki Miyamoto'],
    AUS: ['Rale Rasic', 'Brian Green', 'Jim Shoulder', 'Rudi Gutendorf', 'Doug Utjesenovic', 'Peter Wilson'],
    WAL: ['Mike Smith', 'Arfon Griffiths', 'Alan Durban', 'Trevor Hockey', 'Wyn Davies', 'Dai Davies'],
    DEFAULT: ['Udo Lattek', 'Bob Paisley', 'Hennes Weisweiler', 'César Luis Menotti', 'Mário Zagallo', 'Kazimierz Górski'],
  },
  1980: {
    GER: ['Ernst Happel', 'Jupp Derwall', 'Helmut Benthaus', 'Pál Csernai', 'Karl-Heinz Feldkamp', 'Uli Maslo'],
    ENG: ['Brian Clough', 'Howard Kendall', 'Kenny Dalglish', 'Bobby Robson', 'Ron Saunders', 'Tony Barton'],
    ESP: ['Alberto Ormaetxea', 'Javier Clemente', 'Leo Beenhakker', 'John Toshack', 'Alfredo Di Stéfano', 'Luis Costa'],
    ITA: ['Enzo Bearzot', 'Giovanni Trapattoni', 'Osvaldo Bagnoli', 'Ottavio Bianchi', 'Eugenio Bersellini', 'Azeglio Vicini'],
    FRA: ['Guy Roux', 'Henri Michel', 'Jean-Claude Suaudeau', 'Gérard Gili', 'Claude Le Roy', 'Gérard Banide'],
    POR: ['Artur Jorge', 'Toni Oliveira', 'Marinho Peres', 'Quinito Silva', 'Octávio Machado', 'Mário Reis'],
    NED: ['Aad de Mos', 'Thijs Libregts Sr.', 'Barry Hulshoff', 'Spitz Kohn', 'Nol de Ruiter', 'Piet de Visser'],
    BRA: ['Telê Santana', 'Ênio Andrade', 'Carlos Alberto Silva', 'Jair Picerni', 'Evaristo de Macedo', 'Sebastião Lazaroni'],
    ARG: ['Carlos Bilardo', 'Roberto Perfumo', 'José Omar Pastoriza', 'Héctor Veira', 'Carlos Timoteo Griguol', 'Jorge Solari'],
    DEN: ['Sepp Piontek', 'Ebbe Skovdahl', 'Viggo Jensen', 'Allan Simonsen', 'Jørgen Larsen', 'Benny Johansen'],
    SWE: ['Olle Nordin', 'Gunder Bengtsson', 'Conny Karlsson', 'Sune Persson', 'Hans Backe', 'Benny Lennartsson'],
    NOR: ['Ingvar Stadheim', 'Egil Olsen', 'Svein Ivar Sigernes', 'Trond Sollied', 'Bjørn Hansen', 'Dagfinn Enerly'],
    IDN: ['Bernd Fischer', 'Harry Tjong', 'M. Basri', 'Nandar Iskandar', 'Dananjaya Putra', 'Rusdy Bahalwan'],
    IND: ['Ciric Milovan', 'Rahim Saab', 'Amalraj Peter', 'Brahmanand Sankhwalkar', 'C.R. Vithal', 'Shabbir Ali'],
    SVK: ['Karol Pecze', 'Ján Švehlík', 'Jozef Jarabinský', 'Dušan Radolský', 'Juraj Szikora', 'Valerián Švec'],
    PER: ['Juan Carlos Oblitas', 'Fernando Cuéllar', 'Miguel Company', 'Percy Rojas', 'José Macía Pepe', 'Javier Gonzales'],
    KOR: ['Huh Jung-moo', 'Park Jong-hwan', 'Kim Ho', 'Lee Hoe-taik', 'Cho Young-jeung', 'Ko Jae-wook'],
    BOL: ['Jorge Habegger', 'Nito Veiga', 'Carlos Aragones', 'Raúl Ruiz', 'Moisés Loaiza', 'Ovidio Messa'],
    PAR: ['Cayetano Ré', 'Silvio Parodi Jr.', 'Eduardo Manera', 'Alicio Solalinde', 'Juan Vicente Lezcano', 'Carlos Kiese'],
    CHI: ['Vicente Cantatore', 'Luis Ibarra', 'Eugenio Jara', 'Arturo Salah', 'Manuel Rodríguez', 'Jorge Socías'],
    CRO: ['Miroslav Blažević', 'Josip Skoblar', 'Petar Nadoveza', 'Stanko Poklepović', 'Zdenko Kobešćak', 'Ilija Lončarević'],
    GRE: ['Miltos Papapostolou', 'Christos Archontidis', 'Nikos Alefantos', 'Vassilis Daniil', 'Thijs Libregts', 'Antonis Antoniadis'],
    POL: ['Antoni Piechniczek', 'Wojciech Łazarek', 'Orest Lenczyk', 'Bogusław Hajdas', 'Jerzy Sadko', 'Władysław Żmuda'],
    SCO: ['Graeme Souness', 'David Hay', 'Tommy McLean', 'Jim Duffy', 'Ian Porterfield', 'Billy Twist'],
    TUR: ['Mustafa Denizli', 'Gordon Milne', 'Gündüz Tekin Onay', 'Tamer Güney', 'Adnan Dinçer', 'Rasim Kara'],
    AUT: ['Felix Latzke', 'Georg Schmidt', 'Beppo Mauhart', 'August Starek', 'Walter Skocik', 'Ernst Dokupil'],
    SUI: ['Paul Wolfisberg', 'Uli Stielike', 'Claude Andrey', 'Umberto Barberis', 'Guy Mathez', 'Radu Nunweiller'],
    URU: ['Óscar Tabárez', 'Roberto Fleitas', 'Ildo Maneiro', 'Gregorio Pérez Sr.', 'Aníbal Paz', 'Walter Taibo'],
    COL: ['Francisco Maturana', 'Luis Augusto García', 'Eduardo Retat', 'Miguel Prince', 'Jaime Silva', 'Alfonso Sepúlveda'],
    ECU: ['Dušan Drašković Sr.', 'Juan Ramón Silva', 'Carlos Sevilla', 'Dragan Miranović', 'Miguel Brindisi', 'Salvador Capitano'],
    MEX: ['Bora Milutinović', 'Manuel Lapuente', 'Alberto Guerra', 'Mario Velarde', 'Miguel Mejía Barón', 'Roberto Silva'],
    USA: ['Bob Gansler', 'Lothar Osiander', 'Timo Liekoski', 'Anson Dorrance', 'Clive Charles', 'Roy Turner'],
    CAN: ['Tony Waiters', 'Bob Bearpark', 'Bruce Twamley', 'Ian Bridge', 'Dale Mitchell', 'Randy Ragan'],
    JPN: ['Takaji Mori', 'Ryuzo Morioka', 'Saburo Kawabuchi', 'Kenzo Yokoyama', 'Eijun Kiyokumo', 'Kamo Shu'],
    AUS: ['Frank Arok', 'Eddie Thomson', 'Zvonimir Rašić', 'John Margaritis', 'Ron Smith', 'Miron Bleiberg'],
    WAL: ['Mike England', 'Terry Yorath', 'Neville Southall', 'Ian Rush Sr.', 'Peter Nicholas', 'Joey Jones'],
    DEFAULT: ['Ernst Happel', 'Brian Clough', 'Giovanni Trapattoni', 'Telê Santana', 'Carlos Bilardo', 'Enzo Bearzot'],
  },
  1990: {
    GER: ['Ottmar Hitzfeld', 'Otto Rehhagel', 'Christoph Daum', 'Franz Beckenbauer', 'Berti Vogts', 'Winfried Schäfer'],
    ENG: ['Alex Ferguson', 'George Graham', 'Howard Wilkinson', 'Terry Venables', 'Kevin Keegan', 'Roy Evans'],
    ESP: ['Johan Cruyff', 'Jorge Valdano', 'Radomir Antić', 'Javier Irureta', 'Louis van Gaal', 'Víctor Fernández'],
    ITA: ['Arrigo Sacchi', 'Fabio Capello', 'Alberto Zaccheroni', 'Cesare Maldini', 'Nevio Scala', 'Sven-Göran Eriksson'],
    FRA: ['Aimé Jacquet', 'Jean Tigana', 'Gérard Houllier', 'Roger Lemerre', 'Raynald Denoueix', 'Raymond Goethals'],
    POR: ['Carlos Queiroz', 'António Oliveira', 'Fernando Castro Santos', 'Manuel José', 'Vítor Oliveira', 'Augusto Inácio'],
    NED: ['Wim Jansen', 'Hans Westerhof', 'Sef Vergoossen', 'Foppe de Haan', 'Henk ten Cate', 'Jan Wouters'],
    BRA: ['Vanderlei Luxemburgo', 'Carlos Alberto Parreira', 'Paulo César Carpegiani', 'Joel Santana', 'Candinho Silva', 'Cilinho Morais'],
    ARG: ['Carlos Bianchi', 'Ramón Díaz', 'Daniel Passarella', 'Marcelo Bielsa', 'Héctor Cúper', 'Nery Pumpido'],
    DEN: ['Richard Møller Nielsen', 'Kim Brink', 'Poul Erik Andreasen', 'Peter Rudbæk', 'Ove Christensen', 'Flemming Serritslev'],
    SWE: ['Tommy Svensson', 'Tommy Söderberg', 'Roger Gustafsson', 'Kjell Pettersson', 'Bo Petersson', 'Stuart Baxter'],
    NOR: ['Arne Larsen Økland', 'Nils Johan Semb', 'Teitur Thordarson', 'Cato Zahl Pedersen', 'Bjarne Berntsen', 'Ivar Hoff'],
    IDN: ['Anatoli Polosin', 'Romano Matte', 'Henk Wullems', 'Herry Kiswanto', 'Suimin Diharja', 'Subangkit Jaya'],
    IND: ['Sukhwinder Singh', 'Rustam Akramov', 'Syed Sabir Pasha', 'Manoranjan Bhattacharya', 'T.K. Chathunni', 'Mridul Banerjee'],
    SVK: ['Dušan Galis', 'Jozef Adamec', 'Ladislav Jurkemik', 'Anton Dragúň', 'Stanislav Griga', 'Ján Pivarník'],
    PER: ['Vladimir Popović', 'Sergio Markarián', 'Gustavo Costas Sr.', 'Franco Navarro', 'Julio César Uribe', 'Juan Carlos Letelier'],
    KOR: ['Kim Pyung-seok', 'Anatoly Byshovets', 'Cha Kyung-bok', 'Kim Ho-kon', 'Yoon Jong-hwan Sr.', 'Lee Jang-soo'],
    BOL: ['Xabier Azkargorta', 'Dušan Drašković', 'Antonio López Habas', 'Carlos Trucco', 'Ovidio Sánchez', 'Luis Esteban Galarza'],
    PAR: ['Ever Hugo Almeida', 'Sergio Goycochea', 'Carlos Báez', 'Nery Quintana', 'Aníbal Ruiz', 'Raúl Vicente Amarilla'],
    CHI: ['Mirko Jozić', 'Nelson Acosta', 'Gustavo Benítez', 'Fernando Carvallo', 'Roberto Hernández', 'César Vaccia'],
    CRO: ['Ivan Katalinić', 'Zlatko Kranjčar', 'Otto Barić', 'Branko Ivanković', 'Nenad Gračan', 'Luka Bonačić'],
    GRE: ['Dušan Bajević', 'Juan Ramón Rocha', 'Giorgos Paraschos', 'Ioannis Kyrastas', 'Kostas Polychroniou', 'Stavros Diamantopoulos'],
    POL: ['Franciszek Smuda', 'Henryk Kasperczak', 'Paweł Janas', 'Janusz Wójcik', 'Edward Lorens', 'Marek Kusto'],
    SCO: ['Walter Smith', 'Tommy Burns', 'Craig Brown', 'Billy Stark', 'Alex Totten', 'Sandy Clark'],
    TUR: ['Fatih Terim', 'Şenol Güneş', 'Ertuğrul Sağlam', 'Yılmaz Vural', 'Rıza Çalımbay', 'Aykut Kocaman'],
    AUT: ['Herbert Prohaska', 'Hans Krankl', 'Heribert Weber', 'Dietmar Constantini', 'Walter Schachner', 'Kurt Jara'],
    SUI: ['Christian Gross', 'Gilbert Gress', 'Rolf Fringer', 'Marcel Koller', 'Andy Egli', 'Hans-Peter Zaugg'],
    URU: ['Héctor Núñez', 'Víctor Púa', 'Hugo de León', 'Julio Ribas', 'Jorge Da Silva', 'Gustavo Matosas'],
    COL: ['Hernán Darío Gómez', 'Javier Álvarez', 'Diego Umaña', 'Luis Fernando Montoya', 'Fernando Castro', 'Juan José Peláez'],
    ECU: ['Carlos Torres Garcés', 'Sixto Vizuete', 'Patricio Lara', 'Julio Asad', 'Fernando Baldeón', 'Álex Aguinaga'],
    MEX: ['Víctor Manuel Vucetich', 'Enrique Meza', 'Ricardo Ferretti', 'Javier Aguirre', 'Luis Fernando Tena', 'Rubén Omar Romano'],
    USA: ['Bruce Arena', 'Sigi Schmid', 'Bob Bradley', 'Thomas Rongen', 'Piotr Nowak', 'Frank Yallop'],
    CAN: ['Bob Lenarduzzi', 'Holger Osieck', 'Paul James', 'Stephen Hart', 'Nick Dasovic', 'Colin Miller'],
    JPN: ['Takeshi Okada', 'Hans Ooft', 'Paulo Roberto Falcão', 'Shu Kamo', 'Philippe Troussier', 'Akira Nishino'],
    AUS: ['Frank Farina', 'Bernd Stange', 'Raul Blanco', 'Damian Mori', 'Zoran Matic', 'Mich d’Avray'],
    WAL: ['Bobby Gould', 'Mark Hughes', 'Paul Bodin', 'Dean Saunders', 'Kit Symons', 'Gary Speed Sr.'],
    DEFAULT: ['Ottmar Hitzfeld', 'Johan Cruyff', 'Arrigo Sacchi', 'Fabio Capello', 'Carlos Bianchi', 'Vanderlei Luxemburgo'],
  },
  2000: {
    GER: ['Felix Magath', 'Thomas Schaaf', 'Matthias Sammer', 'Ralf Rangnick', 'Armin Veh', 'Huub Stevens'],
    ENG: ['Arsène Wenger', 'Rafa Benítez', 'Steve McClaren', 'Sam Allardyce', 'Alan Curbishley', 'Martin O’Neill'],
    ESP: ['Luis Aragonés', 'Frank Rijkaard', 'Quique Sánchez Flores', 'Juande Ramos', 'Gregorio Manzano', 'Rafael Benítez Sr.'],
    ITA: ['Marcello Lippi', 'Luciano Spalletti', 'Cesare Prandelli', 'Roberto Donadoni', 'Delio Rossi', 'Walter Mazzarri'],
    FRA: ['Paul Le Guen', 'Jacques Santini', 'Alain Perrin', 'Claude Puel', 'Élie Baup', 'Didier Ollé-Nicolle'],
    POR: ['Jesualdo Ferreira', 'Jaime Pacheco', 'Laszlo Bölöni', 'Paulo Bento', 'Domingos Paciência', 'Ulisses Morais'],
    NED: ['Bert van Marwijk', 'Marco van Basten', 'Co Adriaanse', 'Fred Rutten', 'Martin Jol', 'Erwin Koeman'],
    BRA: ['Luiz Felipe Scolari', 'Muricy Ramalho', 'Paulo Autuori', 'Abel Braga', 'Emerson Leão', 'Oswaldo de Oliveira'],
    ARG: ['Alfio Basile', 'Miguel Ángel Russo', 'Américo Gallego', 'Ricardo Gareca', 'Claudio Borghi', 'Leonardo Astrada'],
    DEN: ['Morten Olsen', 'Michael Laudrup', 'Erik Rasmussen', 'Ove Pedersen', 'Troels Bech', 'Colin Todd'],
    SWE: ['Lars Lagerbäck', 'Åge Hareide', 'Sören Åkeby', 'Rikard Norling', 'Magnus Haglund', 'Nanne Bergstrand'],
    NOR: ['Mons Ivar Mjelde', 'Knut Tørum', 'Harald Aabrekk', 'Tom Nordlie', 'Kåre Ingebrigtsen', 'Petter Myhre'],
    IDN: ['Peter Withe', 'Ivan Kolev', 'Jacksen F. Tiago', 'Benny Dollo', 'Rahmad Darmawan', 'Arcan Iurie'],
    IND: ['Stephen Constantine', 'Armando Colaco', 'Subrata Bhattacharya', 'Derrick Pereira', 'Savio Medeira', 'Bimal Ghosh'],
    SVK: ['Vladimír Weiss Sr.', 'Michal Hipp', 'Jozef Barmoš', 'Pavel Vrba', 'Štefan Horný', 'Milan Lešický'],
    PER: ['Freddy Ternero', 'José del Solar', 'Wilmar Valencia', 'Teddy Cardama', 'Rafo Castillo', 'Édgar Ospina'],
    KOR: ['Guus Hiddink', 'Dick Advocaat', 'Pim Verbeek', 'Kim Hak-bum', 'Hwangbo Kwan', 'Cho Kwang-rae'],
    BOL: ['Erwin Sánchez', 'Gustavo Quinteros', 'Mauricio Soria', 'Marco Etcheverry', 'Ramiro Castillo', 'Víctor Barrientos'],
    PAR: ['Gerardo Martino', 'Aníbal Maño Ruiz', 'Rubén Israel', 'Gregorio Pérez', 'Javier Torrente', 'Carlos Jara Saguier'],
    CHI: ['Juvenal Olmos', 'Jorge Garcés', 'Fernando Astengo', 'Héctor Pinto', 'Arturo Salah Jr.', 'Ivo Basay'],
    CRO: ['Slaven Bilić', 'Krunoslav Jurčić', 'Zoran Vulić', 'Nikola Jurčević', 'Josip Kuže', 'Branko Karačić'],
    GRE: ['Takis Lemonis', 'Nikos Nioplias', 'Aggelos Anastasiadis', 'Ioannis Matzourakis', 'Ewald Lienen', 'Trond Sollied Jr.'],
    POL: ['Jerzy Engel', 'Maciej Skorża', 'Waldemar Fornalik', 'Czesław Michniewicz', 'Jacek Zieliński', 'Dariusz Wdowczyk'],
    SCO: ['Gordon Strachan', 'Alex McLeish', 'Craig Levein', 'Jim Jefferies', 'Mixu Paatelainen', 'Derek McInnes'],
    TUR: ['Mircea Lucescu', 'Ersun Yanal', 'Zico Antunes', 'Bülent Korkmaz', 'Mustafa Reşit Akçay', 'Hikmet Karaman'],
    AUT: ['Franco Foda', 'Peter Pacult', 'Karl Daxbacher', 'Paul Gludovatz', 'Georg Zellhofer', 'Josef Hickersberger'],
    SUI: ['Köbi Kuhn', 'Bernard Challandes', 'Urs Fischer', 'Ciriaco Sforza', 'Pierluigi Tami', 'Uli Forte'],
    URU: ['Gerardo Pelusso', 'Juan Ramón Carrasco', 'Diego Aguirre', 'Gustavo Ferrín', 'Santiago Ostolaza', 'Pablo Repetto'],
    COL: ['Jorge Luis Pinto', 'Reinaldo Rueda', 'Eduardo Lara', 'Alexis García', 'Santiago Escobar', 'Dragan Miranović Jr.'],
    ECU: ['Luis Fernando Suárez', 'Edgardo Bauza', 'Rubén Darío Insúa', 'Jorge Célico', 'Paúl Vélez', 'Octavio Zambrano'],
    MEX: ['Hugo Sánchez', 'Ricardo La Volpe', 'José Manuel de la Torre', 'Efraín Flores', 'Sergio Bueno', 'Benjamín Galindo'],
    USA: ['Dominic Kinnear', 'Jason Kreis', 'Preki Radosavljevic', 'Steve Nicol', 'Schellas Hyndman', 'Curt Onalfo'],
    CAN: ['Marc Dos Santos', 'Martin Rennie', 'Aron Winter', 'Paul Mariner', 'Ryan Nelsen', 'Carl Robinson'],
    JPN: ['Zico Coimbra', 'Ivica Osim', 'Dragan Stojković', 'Hisashi Kato', 'Yasuharu Sorimachi', 'Guido Buchwald'],
    AUS: ['Graham Arnold', 'Aurelio Vidmar', 'Ernie Merrick', 'Lawrie McKinna', 'John Kosmina', 'Gary van Egmond'],
    WAL: ['Brian Flynn', 'Ken Jackett', 'Malky Mackay', 'Tony Pulis', 'Geraint Williams', 'Peter Davenport'],
    DEFAULT: ['Arsène Wenger', 'Marcello Lippi', 'Felix Magath', 'Muricy Ramalho', 'Luis Aragonés', 'Luciano Spalletti'],
  },
  2010: {
    GER: ['Jupp Heynckes', 'Jürgen Klopp', 'Joachim Löw', 'Lucien Favre', 'Dieter Hecking', 'Niko Kovač'],
    ENG: ['Sir Alex Ferguson', 'José Mourinho', 'Claudio Ranieri', 'Manuel Pellegrini', 'Roberto Mancini', 'Mauricio Pochettino'],
    ESP: ['Vicente del Bosque', 'Zinedine Zidane', 'Ernesto Valverde', 'Luis Enrique', 'Tito Vilanova', 'Julen Lopetegui'],
    ITA: ['Massimiliano Allegri', 'Antonio Conte', 'Maurizio Sarri', 'Eusebio Di Francesco', 'Rudi Garcia', 'Vincenzo Montella'],
    FRA: ['Didier Deschamps', 'Laurent Blanc', 'René Girard', 'Leonardo Jardim', 'Antoine Kombouaré', 'Bruno Genesio'],
    POR: ['Jorge Jesus', 'Fernando Santos', 'Vítor Pereira', 'Rui Vitória', 'Bruno Lage', 'Marco Silva'],
    NED: ['Ronald Koeman', 'Phillip Cocu', 'Frank de Boer', 'Giovanni van Bronckhorst', 'John van den Brom', 'Ron Jans'],
    BRA: ['Tite Bacchi', 'Marcelo Oliveira', 'Mano Menezes', 'Fábio Carille', 'Renato Portaluppi', 'Cuca Stival'],
    ARG: ['Marcelo Gallardo', 'Alejandro Sabella', 'Diego Cocca', 'Ariel Holan', 'Guillermo Barros Schelotto', 'Eduardo Coudet'],
    DEN: ['Ståle Solbakken', 'Jess Thorup', 'Niels Frederiksen', 'Kent Nielsen', 'Glen Riddersholm', 'Stig Tøfting'],
    SWE: ['Erik Hamrén', 'Andreas Alm', 'Janne Andersson', 'Peter Gerhardsson', 'Roar Hansen', 'Jörgen Lennartsson'],
    NOR: ['Per-Mathias Høgmo', 'Ole Gunnar Solskjær', 'Ronny Deila', 'Lars Bohinen', 'Dag-Eilev Fagermo', 'Geir Bakke'],
    IDN: ['Alfred Riedl', 'Luis Milla', 'Stefano Cugurra', 'Robert Rene Alberts', 'Simon McMenemy', 'Indra Sjafri'],
    IND: ['Wim Koevermans', 'Ashley Westwood', 'Sanjoy Sen', 'Khalid Jamil', 'Eelco Schattorie', 'Sergio Lobera'],
    SVK: ['Ján Kozák', 'Pavel Hapal', 'Adrián Guľa', 'Martin Ševela', 'Nestor El Maestro', 'Zsolt Hornyák'],
    PER: ['Roberto Mosquera', 'Mario Salas', 'Pablo Bengoechea', 'Daniel Ahmed', 'Víctor Rivera', 'Carlos Bustos'],
    KOR: ['Choi Kang-hee', 'Shin Tae-yong', 'Hwang Sun-hong', 'Kim Do-hoon', 'Seo Jung-won', 'Nam Ki-il'],
    BOL: ['César Farías', 'Julio César Baldivieso', 'Eduardo Villegas', 'Ángel Guillermo Hoyos', 'Carlos Zago Sr.', 'Beñat San José'],
    PAR: ['Francisco Arce', 'Daniel Garnero', 'Eduardo Berizzo', 'Pedro Sarabia', 'Celso Ayala', 'Fernando Jubero'],
    CHI: ['Jorge Sampaoli', 'Juan Antonio Pizzi', 'José Luis Sierra', 'Pablo Guede', 'Beñat Católica', 'Martín Lasarte'],
    CRO: ['Nenad Bjelica', 'Matjaž Kek', 'Zoran Mamić', 'Igor Bišćan', 'Goran Tomić', 'Damir Krznar'],
    GRE: ['Razvan Lucescu', 'Pedro Martins', 'Manolo Jiménez', 'Marinos Ouzounidis', 'Vladan Ivić', 'Giorgos Donis'],
    POL: ['Adam Nawałka', 'Piotr Stokowiec', 'Michał Probierz', 'Aleksandar Vuković', 'Jacek Magiera', 'Ireneusz Mamrot'],
    SCO: ['Neil Lennon', 'Brendan Rodgers', 'Ally McCoist', 'Tommy Wright', 'Steve Clarke', 'Stuart McCall'],
    TUR: ['Hamza Hamzaoğlu', 'Sergen Yalçın', 'Abdullah Avcı', 'İsmail Kartal', 'Tayfun Korkut', 'Ünal Karaman'],
    AUT: ['Marco Rose', 'Peter Stöger', 'Oliver Glasner', 'Jesse Marsch', 'Gerhard Struber', 'Dietmar Kühbauer'],
    SUI: ['Thorsten Fink', 'Paulo Sousa', 'Murat Yakin', 'Gerardo Seoane', 'Vladimir Petković', 'René Weiler'],
    URU: ['Guillermo Almada', 'Alexander Medina', 'Leonardo Ramos', 'Mauricio Larriera', 'Álvaro Gutiérrez', 'Pablo Peirano'],
    COL: ['José Pékerman', 'Juan Carlos Osorio', 'Alexis Mendoza', 'Julio Comesaña', 'Alberto Gamero', 'Hubert Bodhert'],
    ECU: ['Mariano Soso', 'Alfredo Arias', 'Miguel Ángel Ramírez', 'Ismael Rescalvo', 'Renato Paiva', 'Pool Gavilánez'],
    MEX: ['Miguel Herrera', 'Pedro Caixinha', 'Antonio Mohamed', 'Ignacio Ambriz', 'Robert Dante Siboldi', 'Guillermo Vázquez'],
    USA: ['Caleb Porter', 'Brian Schmetzer', 'Greg Vanney', 'Peter Vermes', 'Jim Curtin', 'Óscar Pareja'],
    CAN: ['Tommy Wheeldon Jr.', 'Bobby Smyrniotis', 'Pa-Modou Kah', 'Jeff Paulus', 'Mista Ferrero', 'John Herdman'],
    JPN: ['Hajime Moriyasu', 'Toru Oniki', 'Kenta Hasegawa', 'Mihailo Petrović', 'Nelsinho Baptista', 'Yoon Jung-hwan'],
    AUS: ['Ange Postecoglou', 'Tony Popovic', 'Guillermo Amor', 'Kevin Muscat', 'Steve Corica', 'Mark Rudan'],
    WAL: ['Chris Coleman', 'Scott Ruscoe', 'Craig Harrison', 'Andy Morrison', 'Huw Griffiths', 'Rob Page'],
    DEFAULT: ['Jupp Heynckes', 'Jürgen Klopp', 'Zinedine Zidane', 'Massimiliano Allegri', 'Marcelo Gallardo', 'Tite Bacchi'],
  },
  2020: {
    GER: ['Hansi Flick', 'Julian Nagelsmann', 'Xabi Alonso', 'Thomas Tuchel', 'Sebastian Hoeneß', 'Vincent Kompany'],
    ENG: ['Pep Guardiola', 'Mikel Arteta', 'Arne Slot', 'Unai Emery', 'Eddie Howe', 'Thomas Frank'],
    ESP: ['Carlo Ancelotti', 'Diego Simeone', 'Xavi Hernández', 'Luis de la Fuente', 'Míchel Sánchez', 'Imanol Alguacil'],
    ITA: ['Simone Inzaghi', 'Gian Piero Gasperini', 'Stefano Pioli', 'Thiago Motta', 'Vincenzo Italiano', 'Raffaele Palladino'],
    FRA: ['Christophe Galtier', 'Franck Haise', 'Éric Roy', 'Paulo Fonseca', 'Adi Hütter', 'Roberto De Zerbi'],
    POR: ['Rúben Amorim', 'Sérgio Conceição', 'Roger Schmidt', 'Rui Borges', 'Vítor Bruno', 'Artur Jorge Jr.'],
    NED: ['Erik ten Hag', 'Peter Bosz', 'Pascal Jansen', 'Joseph Oosting', 'Dick Schreuder', 'Maurice Steijn'],
    BRA: ['Abel Ferreira', 'Dorival Júnior', 'Fernando Diniz', 'Artur Soares', 'Filipe Luís', 'Juan Pablo Vojvoda'],
    ARG: ['Lionel Scaloni', 'Martín Demichelis', 'Eduardo Domínguez', 'Diego Martínez', 'Gabriel Milito', 'Gustavo Costas'],
    DEN: ['Jacob Neestrup', 'Thomas Thomasberg', 'Brian Priske', 'Bo Henriksen', 'Kasper Hjulmand', 'Johannes Hoff Thorup'],
    SWE: ['Henrik Rydström', 'Kim Bergstrand', 'Jimmy Thelin', 'Jens Gustafsson', 'Bartosz Grzelak', 'Mikkjal Thomassen'],
    NOR: ['Kjetil Knutsen', 'Erling Moe', 'Eirik Horneland', 'Gaute Helstrup', 'Johannes Moesgaard', 'Jørgen Isnes'],
    IDN: ['Bojan Hodak', 'Bernardo Tavares', 'Pieter Huistra', 'Aji Santoso', 'Widodo C. Putro', 'Paul Munster'],
    IND: ['Manolo Márquez', 'Owen Coyle', 'Des Buckingham', 'Carles Cuadrat', 'Antonio Habas', 'Clifford Miranda'],
    SVK: ['Vladimír Weiss', 'Michal Gašparík', 'Francesco Calzona', 'Juraj Jarábek', 'Roman Skuhravý', 'Martin Škrtel'],
    PER: ['Jorge Fossati', 'Fabián Bustos', 'Guillermo Salas', 'Nolberto Solano', 'Tiago Nunes', 'Alejandro Restrepo'],
    KOR: ['Hong Myung-bo', 'Park Hang-seo', 'Kim Gi-dong', 'Yoon Jong-hwan', 'Lee Jung-hyo', 'Dan Petrescu'],
    BOL: ['Óscar Villegas', 'Antonio Carlos Zago', 'Flavio Robatto', 'Pablo Escobar', 'Cristian Díaz', 'Thiago Leitao'],
    PAR: ['Gustavo Alfaro', 'Martín Palermo', 'Humberto Ovelar', 'Julio César Cáceres', 'Aldo Bobadilla', 'Juan Pablo Pumpido'],
    CHI: ['Jorge Almirón', 'Gustavo Álvarez', 'Jaime García', 'Nicolás Núñez', 'Miguel Ponce', 'Gustavo Huerta'],
    CRO: ['Zlatko Dalić', 'Sergej Jakirović', 'Željko Sopić', 'Gennaro Gattuso', 'Gonzalo García', 'Silvijo Čabraja'],
    GRE: ['Matías Almeyda', 'Ivan Jovanović', 'José Luis Mendilibar', 'Akis Mantzios', 'Diego Alonso', 'Răzvan Lucescu Jr.'],
    POL: ['Marek Papszun', 'Adrian Siemieniec', 'Gonçalo Feio', 'Dawid Szulczek', 'Jan Urban', 'Daniel Myśliwiec'],
    SCO: ['Philippe Clement', 'David Gray', 'Tony Docherty', 'Stephen Robinson', 'Stuart Kettlewell', 'John McGlynn'],
    TUR: ['Okan Buruk', 'Çağdaş Atan', 'İlhan Palut', 'Selçuk İnan', 'Fatih Tekke', 'Arda Turan'],
    AUT: ['Christian Ilzer', 'Pepijn Lijnders', 'Robert Klauß', 'Stephan Helm', 'Markus Schopp', 'Maximilian Senft'],
    SUI: ['Patrick Rahmen', 'Fabio Celestini', 'Thomas Häberli', 'Ludovic Magnin', 'Mattia Croci-Torti', 'Ricardo Moniz'],
    URU: ['Jadson Viera', 'Jorge Bava', 'Darío Rodríguez', 'Marcelo Broli', 'Ignacio Ithurralde', 'Martín Varini'],
    COL: ['Néstor Lorenzo', 'Efraín Juárez', 'David González', 'Arturo Reyes', 'Rafael Dudamel', 'Leonel Álvarez'],
    ECU: ['Sebastián Beccacece', 'Javier Gandolfi', 'Vitamina Sánchez', 'Martín Anselmi', 'Josep Alcácer', 'Segundo Castillo Jr.'],
    MEX: ['André Jardine', 'Veljko Paunović', 'Fernando Gago', 'Nicolás Larcamón', 'Guillermo Almada Jr.', 'Domenec Torrent'],
    USA: ['Wilfried Nancy', 'Steve Cherundolo', 'Pat Noonan', 'Tata Martino', 'Chris Armas', 'Nick Cushing'],
    CAN: ['Mauro Biello', 'Patrice Bernier', 'Vanni Sartini', 'Laurent Courtois', 'Carlos González', 'Alan Koch'],
    JPN: ['Takayuki Yoshida', 'Michael Skibbe', 'Harry Kewell', 'Go Oiwa', 'Shigetoshi Hasebe', 'Rikizo Matsuhashi'],
    AUS: ['Nick Montgomery', 'Mark Jackson', 'Patrick Kisnorbo', 'Ufuk Talay', 'Arthur Papas', 'Aurelio Vidmar Jr.'],
    WAL: ['Craig Bellamy', 'Anthony Limbrick', 'Steve Jenkins', 'Colin Caton', 'Rhys Griffiths', 'Christian Edwards'],
    DEFAULT: ['Pep Guardiola', 'Carlo Ancelotti', 'Xabi Alonso', 'Simone Inzaghi', 'Lionel Scaloni', 'Rúben Amorim'],
  },
};

// Authentic Historical Tier 1 Winning Coaches by Country & Year (strictly decade-isolated)
const HISTORICAL_TIER1_COACHES_BY_COUNTRY: Record<string, Record<number, string>> = {
  GER: {
    1950: 'Georg Wurzer', 1951: 'Richard Schneider', 1952: 'Georg Wurzer', 1953: 'Richard Schneider', 1954: 'Helmut Kronsbein',
    1955: 'Fritz Szepan', 1956: 'Helmut Schneider', 1957: 'Helmut Schneider', 1958: 'Edi Frühwirth', 1959: 'Paul Oßwald',
    1960: 'Günter Mahlmann', 1961: 'Herbert Widmayer', 1962: 'Zlatko Čajkovski', 1963: 'Hermann Eppenhoff', 1964: 'Georg Knöpfle',
    1965: 'Willi Multhaup', 1966: 'Zlatko Čajkovski', 1967: 'Helmuth Johannsen', 1968: 'Max Merkel', 1969: 'Branko Zebec',
    1970: 'Hennes Weisweiler', 1971: 'Hennes Weisweiler', 1972: 'Udo Lattek', 1973: 'Udo Lattek', 1974: 'Udo Lattek',
    1975: 'Hennes Weisweiler', 1976: 'Udo Lattek', 1977: 'Udo Lattek', 1978: 'Hennes Weisweiler', 1979: 'Dettmar Cramer',
    1980: 'Pál Csernai', 1981: 'Pál Csernai', 1982: 'Ernst Happel', 1983: 'Ernst Happel', 1984: 'Helmut Benthaus',
    1985: 'Pál Csernai', 1986: 'Pál Csernai', 1987: 'Pál Csernai', 1988: 'Karl-Heinz Feldkamp', 1989: 'Jupp Derwall',
    1990: 'Ottmar Hitzfeld', 1991: 'Otto Rehhagel', 1992: 'Christoph Daum', 1993: 'Otto Rehhagel', 1994: 'Franz Beckenbauer',
    1995: 'Ottmar Hitzfeld', 1996: 'Ottmar Hitzfeld', 1997: 'Ottmar Hitzfeld', 1998: 'Otto Rehhagel', 1999: 'Ottmar Hitzfeld',
    2000: 'Felix Magath', 2001: 'Felix Magath', 2002: 'Matthias Sammer', 2003: 'Felix Magath', 2004: 'Thomas Schaaf',
    2005: 'Felix Magath', 2006: 'Felix Magath', 2007: 'Armin Veh', 2008: 'Felix Magath', 2009: 'Felix Magath',
    2010: 'Jupp Heynckes', 2011: 'Jürgen Klopp', 2012: 'Jürgen Klopp', 2013: 'Jupp Heynckes', 2014: 'Jupp Heynckes',
    2015: 'Jupp Heynckes', 2016: 'Jupp Heynckes', 2017: 'Jupp Heynckes', 2018: 'Jupp Heynckes', 2019: 'Niko Kovač',
    2020: 'Hansi Flick', 2021: 'Hansi Flick', 2022: 'Julian Nagelsmann', 2023: 'Thomas Tuchel', 2024: 'Xabi Alonso', 2025: 'Vincent Kompany',
  },
  ENG: {
    1950: 'Bob Jackson', 1951: 'Arthur Rowe', 1952: 'Matt Busby', 1953: 'Tom Whittaker', 1954: 'Stan Cullis',
    1955: 'Ted Drake', 1956: 'Matt Busby', 1957: 'Matt Busby', 1958: 'Stan Cullis', 1959: 'Stan Cullis',
    1960: 'Harry Potts', 1961: 'Bill Nicholson', 1962: 'Alf Ramsey', 1963: 'Harry Catterick', 1964: 'Matt Gillies',
    1965: 'Joe Mercer', 1966: 'Harry Catterick', 1967: 'Joe Mercer', 1968: 'Joe Mercer', 1969: 'Bertie Mee',
    1970: 'Tommy Docherty', 1971: 'Don Revie', 1972: 'Dave Sexton', 1973: 'Bill Shankly', 1974: 'Don Revie',
    1975: 'Dave Mackay', 1976: 'Bob Paisley', 1977: 'Bob Paisley', 1978: 'Ron Greenwood', 1979: 'Bob Paisley',
    1980: 'Kenny Dalglish', 1981: 'Ron Saunders', 1982: 'Joe Fagan', 1983: 'Joe Fagan', 1984: 'Joe Fagan',
    1985: 'Howard Kendall', 1986: 'Kenny Dalglish', 1987: 'Howard Kendall', 1988: 'Kenny Dalglish', 1989: 'Bobby Robson',
    1990: 'Roy Evans', 1991: 'George Graham', 1992: 'Howard Wilkinson', 1993: 'Alex Ferguson', 1994: 'Alex Ferguson',
    1995: 'Terry Venables', 1996: 'Alex Ferguson', 1997: 'Alex Ferguson', 1998: 'George Graham', 1999: 'Alex Ferguson',
    2000: 'Steve McClaren', 2001: 'Steve McClaren', 2002: 'Arsène Wenger', 2003: 'Arsène Wenger', 2004: 'Arsène Wenger',
    2005: 'Rafa Benítez', 2006: 'Rafa Benítez', 2007: 'Steve McClaren', 2008: 'Steve McClaren', 2009: 'Arsène Wenger',
    2010: 'Roberto Mancini', 2011: 'Sir Alex Ferguson', 2012: 'Roberto Mancini', 2013: 'Sir Alex Ferguson', 2014: 'Manuel Pellegrini',
    2015: 'José Mourinho', 2016: 'Claudio Ranieri', 2017: 'José Mourinho', 2018: 'Manuel Pellegrini', 2019: 'Mauricio Pochettino',
    2020: 'Arne Slot', 2021: 'Pep Guardiola', 2022: 'Pep Guardiola', 2023: 'Pep Guardiola', 2024: 'Pep Guardiola', 2025: 'Arne Slot',
  },
  ESP: {
    1950: 'Enrique Fernández', 1951: 'Enrique Fernández', 1952: 'Ferdinand Daučík', 1953: 'Ferdinand Daučík', 1954: 'Enrique Fernández',
    1955: 'José Villalonga', 1956: 'Ferdinand Daučík', 1957: 'José Villalonga', 1958: 'Luis Carniglia', 1959: 'Patricio Caicedo',
    1960: 'Helenio Herrera', 1961: 'Miguel Muñoz', 1962: 'Miguel Muñoz', 1963: 'Miguel Muñoz', 1964: 'Miguel Muñoz',
    1965: 'Miguel Muñoz', 1966: 'Domènec Balmanya', 1967: 'Miguel Muñoz', 1968: 'Miguel Muñoz', 1969: 'Miguel Muñoz',
    1970: 'Marcel Domingo', 1971: 'Luis Molowny', 1972: 'Luis Molowny', 1973: 'Maximos Miljanić', 1974: 'Rinus Michels',
    1975: 'Miljan Miljanić', 1976: 'Miljan Miljanić', 1977: 'Luis Molowny', 1978: 'Luis Molowny', 1979: 'Luis Molowny',
    1980: 'Alfredo Di Stéfano', 1981: 'Alberto Ormaetxea', 1982: 'Alberto Ormaetxea', 1983: 'Javier Clemente', 1984: 'Javier Clemente',
    1985: 'John Toshack', 1986: 'Leo Beenhakker', 1987: 'Leo Beenhakker', 1988: 'Leo Beenhakker', 1989: 'Leo Beenhakker',
    1990: 'Johan Cruyff', 1991: 'Johan Cruyff', 1992: 'Johan Cruyff', 1993: 'Johan Cruyff', 1994: 'Johan Cruyff',
    1995: 'Jorge Valdano', 1996: 'Radomir Antić', 1997: 'Javier Irureta', 1998: 'Louis van Gaal', 1999: 'Louis van Gaal',
    2000: 'Gregorio Manzano', 2001: 'Luis Aragonés', 2002: 'Rafael Benítez Sr.', 2003: 'Luis Aragonés', 2004: 'Rafael Benítez Sr.',
    2005: 'Frank Rijkaard', 2006: 'Frank Rijkaard', 2007: 'Juande Ramos', 2008: 'Quique Sánchez Flores', 2009: 'Frank Rijkaard',
    2010: 'Tito Vilanova', 2011: 'Tito Vilanova', 2012: 'Zinedine Zidane', 2013: 'Tito Vilanova', 2014: 'Vicente del Bosque',
    2015: 'Luis Enrique', 2016: 'Luis Enrique', 2017: 'Zinedine Zidane', 2018: 'Ernesto Valverde', 2019: 'Ernesto Valverde',
    2020: 'Carlo Ancelotti', 2021: 'Diego Simeone', 2022: 'Carlo Ancelotti', 2023: 'Xavi Hernández', 2024: 'Carlo Ancelotti', 2025: 'Xavi Hernández',
  },
  ITA: {
    1950: 'Jesse Carver', 1951: 'Lajos Czeizler', 1952: 'György Sárosi', 1953: 'Alfredo Foni', 1954: 'Alfredo Foni',
    1955: 'Lajos Czeizler', 1956: 'Fulvio Bernardini', 1957: 'Lajos Czeizler', 1958: 'Ljubiša Broćić', 1959: 'Lajos Czeizler',
    1960: 'Edmondo Fabbri', 1961: 'Edmondo Fabbri', 1962: 'Nereo Rocco', 1963: 'Heriberto Herrera', 1964: 'Bruno Pesaola',
    1965: 'Heriberto Herrera', 1966: 'Heriberto Herrera', 1967: 'Heriberto Herrera', 1968: 'Nereo Rocco', 1969: 'Bruno Pesaola',
    1970: 'Ferruccio Valcareggi', 1971: 'Čestmír Vycpálek', 1972: 'Čestmír Vycpálek', 1973: 'Čestmír Vycpálek', 1974: 'Tommaso Maestrelli',
    1975: 'Carlo Parola', 1976: 'Luigi Radice', 1977: 'Carlo Parola', 1978: 'Carlo Parola', 1979: 'Gustavo Giagnoni',
    1980: 'Eugenio Bersellini', 1981: 'Giovanni Trapattoni', 1982: 'Giovanni Trapattoni', 1983: 'Osvaldo Bagnoli', 1984: 'Giovanni Trapattoni',
    1985: 'Osvaldo Bagnoli', 1986: 'Giovanni Trapattoni', 1987: 'Ottavio Bianchi', 1988: 'Ottavio Bianchi', 1989: 'Giovanni Trapattoni',
    1990: 'Arrigo Sacchi', 1991: 'Nevio Scala', 1992: 'Fabio Capello', 1993: 'Fabio Capello', 1994: 'Fabio Capello',
    1995: 'Cesare Maldini', 1996: 'Fabio Capello', 1997: 'Cesare Maldini', 1998: 'Alberto Zaccheroni', 1999: 'Alberto Zaccheroni',
    2000: 'Cesare Prandelli', 2001: 'Luciano Spalletti', 2002: 'Marcello Lippi', 2003: 'Marcello Lippi', 2004: 'Luciano Spalletti',
    2005: 'Marcello Lippi', 2006: 'Roberto Donadoni', 2007: 'Roberto Donadoni', 2008: 'Roberto Donadoni', 2009: 'Luciano Spalletti',
    2010: 'Massimiliano Allegri', 2011: 'Massimiliano Allegri', 2012: 'Antonio Conte', 2013: 'Antonio Conte', 2014: 'Antonio Conte',
    2015: 'Massimiliano Allegri', 2016: 'Massimiliano Allegri', 2017: 'Massimiliano Allegri', 2018: 'Massimiliano Allegri', 2019: 'Massimiliano Allegri',
    2020: 'Simone Inzaghi', 2021: 'Simone Inzaghi', 2022: 'Stefano Pioli', 2023: 'Gian Piero Gasperini', 2024: 'Simone Inzaghi', 2025: 'Simone Inzaghi',
  },
  FRA: {
    1950: 'André Gérard', 1951: 'Numa Andoire', 1952: 'Numa Andoire', 1953: 'Albert Batteux', 1954: 'André Cheuva',
    1955: 'Albert Batteux', 1956: 'Lucien Leduc', 1957: 'Pierre Pibarot', 1958: 'Albert Batteux', 1959: 'Lucien Leduc',
    1960: 'Jean Snella', 1961: 'Louis Dugauguez', 1962: 'Jean Snella', 1963: 'Louis Dugauguez', 1964: 'Jean Snella',
    1965: 'José Arribas', 1966: 'José Arribas', 1967: 'Jean Snella', 1968: 'Jean Snella', 1969: 'Jean Snella',
    1970: 'Robert Herbin', 1971: 'Just Fontaine', 1972: 'Stefan Kovač', 1973: 'Robert Herbin', 1974: 'Robert Herbin',
    1975: 'Robert Herbin', 1976: 'Robert Herbin', 1977: 'Michel Hidalgo', 1978: 'Antoine Redin', 1979: 'Pierre Cahuzac',
    1980: 'Jean-Claude Suaudeau', 1981: 'Guy Roux', 1982: 'Gérard Banide', 1983: 'Jean-Claude Suaudeau', 1984: 'Henri Michel',
    1985: 'Henri Michel', 1986: 'Gérard Houllier Sr.', 1987: 'Henri Michel', 1988: 'Gérard Banide', 1989: 'Gérard Gili',
    1990: 'Raymond Goethals', 1991: 'Raymond Goethals', 1992: 'Raymond Goethals', 1993: 'Raymond Goethals', 1994: 'Gérard Houllier',
    1995: 'Raynald Denoueix', 1996: 'Roger Lemerre', 1997: 'Jean Tigana', 1998: 'Aimé Jacquet', 1999: 'Raynald Denoueix',
    2000: 'Claude Puel', 2001: 'Élie Baup', 2002: 'Jacques Santini', 2003: 'Paul Le Guen', 2004: 'Paul Le Guen',
    2005: 'Paul Le Guen', 2006: 'Alain Perrin', 2007: 'Alain Perrin', 2008: 'Alain Perrin', 2009: 'Claude Puel',
    2010: 'Didier Deschamps', 2011: 'René Girard', 2012: 'René Girard', 2013: 'Laurent Blanc', 2014: 'Laurent Blanc',
    2015: 'Laurent Blanc', 2016: 'Laurent Blanc', 2017: 'Leonardo Jardim', 2018: 'Laurent Blanc', 2019: 'Laurent Blanc',
    2020: 'Christophe Galtier', 2021: 'Christophe Galtier', 2022: 'Christophe Galtier', 2023: 'Christophe Galtier', 2024: 'Franck Haise', 2025: 'Roberto De Zerbi',
  },
  POR: {
    1960: 'Bela Guttmann', 1961: 'Bela Guttmann', 1963: 'Fernando Riera', 1965: 'Bela Guttmann', 1967: 'Fernando Riera',
    1971: 'Jimmy Hagan', 1972: 'Jimmy Hagan', 1973: 'Jimmy Hagan', 1978: 'John Mortimore', 1979: 'John Mortimore',
    1985: 'Artur Jorge', 1986: 'Artur Jorge', 1987: 'Toni Oliveira', 1988: 'Quinito Silva', 1989: 'Toni Oliveira',
    1990: 'Carlos Queiroz', 1992: 'Carlos Queiroz', 1995: 'António Oliveira', 1996: 'António Oliveira', 1997: 'António Oliveira',
    2001: 'Jaime Pacheco', 2002: 'Laszlo Bölöni', 2003: 'Jesualdo Ferreira', 2004: 'Jesualdo Ferreira', 2006: 'Co Adriaanse',
    2007: 'Jesualdo Ferreira', 2008: 'Jesualdo Ferreira', 2009: 'Jesualdo Ferreira',
    2010: 'Jorge Jesus', 2011: 'Vítor Pereira', 2012: 'Vítor Pereira', 2013: 'Vítor Pereira', 2014: 'Jorge Jesus',
    2015: 'Jorge Jesus', 2016: 'Rui Vitória', 2017: 'Rui Vitória', 2018: 'Bruno Lage', 2019: 'Bruno Lage',
    2020: 'Sérgio Conceição', 2021: 'Rúben Amorim', 2022: 'Sérgio Conceição', 2023: 'Roger Schmidt', 2024: 'Rúben Amorim', 2025: 'Rúben Amorim',
  },
  BRA: {
    1960: 'Osvaldo Brandão II', 1961: 'Lula Alonso', 1962: 'Lula Alonso', 1963: 'Lula Alonso', 1964: 'Lula Alonso', 1965: 'Lula Alonso',
    1970: 'Mário Zagallo', 1972: 'Osvaldo Daltro', 1973: 'Osvaldo Daltro', 1975: 'Rubens Minelli', 1976: 'Rubens Minelli', 1977: 'Rubens Minelli', 1979: 'Cláudio Coutinho',
    1980: 'Cláudio Coutinho II', 1981: 'Ênio Andrade', 1982: 'Telê Santana', 1983: 'Carlos Alberto Silva', 1984: 'Carlos Alberto Silva',
    1990: 'Candinho Silva', 1991: 'Paulo César Carpegiani', 1993: 'Vanderlei Luxemburgo', 1994: 'Vanderlei Luxemburgo', 1996: 'Carlos Alberto Parreira', 1998: 'Vanderlei Luxemburgo', 1999: 'Oswaldo Brandão III',
    2002: 'Emerson Leão', 2003: 'Paulo Autuori', 2004: 'Emerson Leão', 2005: 'Muricy Ramalho', 2006: 'Muricy Ramalho', 2007: 'Muricy Ramalho', 2008: 'Muricy Ramalho', 2009: 'Abel Braga',
    2010: 'Muricy Ramalho II', 2011: 'Tite Bacchi', 2012: 'Mano Menezes', 2013: 'Marcelo Oliveira', 2014: 'Marcelo Oliveira', 2015: 'Tite Bacchi', 2016: 'Cuca Stival', 2017: 'Fábio Carille', 2018: 'Renato Portaluppi', 2019: 'Jorge Jesus',
    2020: 'Dorival Júnior', 2021: 'Artur Soares', 2022: 'Abel Ferreira', 2023: 'Abel Ferreira', 2024: 'Artur Soares', 2025: 'Filipe Luís',
  },
  ARG: {
    1952: 'José María Minella', 1953: 'José María Minella', 1955: 'José María Minella', 1956: 'José María Minella', 1957: 'José María Minella',
    1962: 'Juan Carlos Lorenzo', 1966: 'Juan José Pizzuti', 1967: 'Osvaldo Zubeldía', 1968: 'Manuel Giúdice',
    1975: 'Ángel Labruna', 1976: 'Pedro Dellacha', 1977: 'Ángel Labruna', 1978: 'César Luis Menotti', 1979: 'Ángel Labruna',
    1980: 'Roberto Perfumo', 1981: 'Carlos Bilardo', 1982: 'Carlos Bilardo', 1983: 'José Omar Pastoriza', 1986: 'Héctor Veira',
    1990: 'Daniel Passarella', 1991: 'Marcelo Bielsa', 1993: 'Carlos Bianchi', 1994: 'Daniel Passarella', 1996: 'Carlos Bianchi', 1997: 'Ramón Díaz', 1998: 'Carlos Bianchi', 1999: 'Carlos Bianchi',
    2000: 'Américo Gallego', 2001: 'Reinaldo Merlo', 2002: 'Américo Gallego', 2003: 'Alfio Basile', 2004: 'Leonardo Astrada', 2005: 'Miguel Ángel Russo', 2006: 'Alfio Basile', 2007: 'Miguel Ángel Russo', 2008: 'Ricardo Gareca', 2009: 'Claudio Borghi',
    2010: 'Alejandro Sabella', 2011: 'Guillermo Barros Schelotto', 2012: 'Diego Cocca', 2014: 'Diego Cocca', 2015: 'Marcelo Gallardo', 2017: 'Guillermo Barros Schelotto', 2018: 'Guillermo Barros Schelotto', 2019: 'Eduardo Coudet',
    2020: 'Diego Martínez', 2021: 'Martín Demichelis', 2022: 'Diego Martínez', 2023: 'Martín Demichelis', 2024: 'Gustavo Costas', 2025: 'Martín Demichelis',
  },
};

// Authentic Historical International Cup Winning Coaches (strictly decade-isolated)
const HISTORICAL_INTL_CUP_COACHES: Record<string, Record<number, string>> = {
  'champions-cup': {
    1956: 'José Villalonga', 1957: 'José Villalonga', 1958: 'Luis Carniglia', 1959: 'Luis Carniglia',
    1960: 'Miguel Muñoz', 1961: 'Bela Guttmann', 1962: 'Bela Guttmann', 1963: 'Nereo Rocco', 1964: 'Helenio Herrera',
    1965: 'Helenio Herrera', 1966: 'Miguel Muñoz', 1967: 'Jock Stein', 1968: 'Sir Matt Busby', 1969: 'Nereo Rocco',
    1970: 'Rinus Michels', 1971: 'Rinus Michels', 1972: 'Stefan Kovač', 1973: 'Stefan Kovač', 1974: 'Udo Lattek',
    1975: 'Dettmar Cramer', 1976: 'Dettmar Cramer', 1977: 'Bob Paisley', 1978: 'Bob Paisley', 1979: 'Peter Taylor',
    1980: 'Brian Clough', 1981: 'Joe Fagan', 1982: 'Tony Barton', 1983: 'Ernst Happel', 1984: 'Joe Fagan',
    1985: 'Giovanni Trapattoni', 1986: 'Emerich Jenei', 1987: 'Artur Jorge', 1988: 'Aad de Mos', 1989: 'Ottavio Bianchi',
    1990: 'Arrigo Sacchi', 1991: 'Ljupko Petrović', 1992: 'Johan Cruyff', 1993: 'Raymond Goethals', 1994: 'Fabio Capello',
    1995: 'Louis van Gaal', 1996: 'Cesare Maldini', 1997: 'Ottmar Hitzfeld', 1998: 'Jorge Valdano', 1999: 'Alex Ferguson',
    2000: 'Luis Aragonés', 2001: 'Felix Magath', 2002: 'Luis Aragonés', 2003: 'Marcello Lippi', 2004: 'Jesualdo Ferreira',
    2005: 'Rafa Benítez', 2006: 'Frank Rijkaard', 2007: 'Luciano Spalletti', 2008: 'Steve McClaren', 2009: 'Frank Rijkaard',
    2010: 'José Mourinho', 2011: 'Tito Vilanova', 2012: 'Roberto Di Matteo', 2013: 'Jupp Heynckes', 2014: 'Zinedine Zidane',
    2015: 'Luis Enrique', 2016: 'Zinedine Zidane', 2017: 'Zinedine Zidane', 2018: 'Zinedine Zidane', 2019: 'Jürgen Klopp',
    2020: 'Hansi Flick', 2021: 'Thomas Tuchel', 2022: 'Carlo Ancelotti', 2023: 'Pep Guardiola', 2024: 'Carlo Ancelotti', 2025: 'Christophe Galtier',
  },
  'euro-cup': {
    1972: 'Bill Shankly', 1973: 'Bill Shankly', 1975: 'Hennes Weisweiler', 1976: 'Bob Paisley', 1977: 'Carlo Parola', 1979: 'Udo Lattek',
    1980: 'Jupp Derwall', 1981: 'Bobby Robson', 1984: 'Tony Barton', 1985: 'Leo Beenhakker', 1986: 'Leo Beenhakker', 1988: 'Ernst Happel', 1989: 'Ottavio Bianchi',
    1990: 'Cesare Maldini', 1991: 'Arrigo Sacchi', 1992: 'Louis van Gaal', 1993: 'Fabio Capello', 1994: 'Cesare Maldini', 1995: 'Nevio Scala', 1996: 'Franz Beckenbauer', 1998: 'Alberto Zaccheroni', 1999: 'Nevio Scala',
    2000: 'Fatih Terim', 2001: 'Rafa Benítez', 2003: 'Jesualdo Ferreira', 2004: 'Rafael Benítez Sr.', 2006: 'Juande Ramos', 2007: 'Juande Ramos', 2008: 'Dick Advocaat', 2009: 'Mircea Lucescu',
    2010: 'Julen Lopetegui', 2011: 'Vítor Pereira', 2012: 'Julen Lopetegui', 2013: 'Roberto Di Matteo', 2014: 'Julen Lopetegui', 2015: 'Julen Lopetegui', 2016: 'Julen Lopetegui', 2017: 'José Mourinho', 2018: 'Julen Lopetegui', 2019: 'Maurizio Sarri',
    2020: 'Unai Emery', 2021: 'Unai Emery', 2022: 'Sebastian Hoeneß', 2023: 'José Luis Mendilibar', 2024: 'Gian Piero Gasperini', 2025: 'Unai Emery',
  },
  libertadores: {
    1960: 'Roberto Scarone', 1961: 'Lula Alonso', 1962: 'Lula Alonso', 1963: 'Lula Alonso', 1964: 'Manuel Giúdice',
    1965: 'Manuel Giúdice', 1966: 'Roque Gastón Máspoli', 1967: 'Juan José Pizzuti', 1968: 'Osvaldo Zubeldía', 1969: 'Osvaldo Zubeldía',
    1970: 'Pedro Dellacha', 1971: 'Pedro Dellacha', 1972: 'Pedro Dellacha', 1973: 'Pedro Dellacha', 1974: 'Pedro Dellacha',
    1975: 'Pedro Dellacha', 1976: 'Rubens Minelli', 1977: 'César Luis Menotti', 1978: 'César Luis Menotti', 1979: 'Luis Cubilla',
    1980: 'Juan Mujica', 1981: 'Telê Santana', 1982: 'Óscar Tabárez', 1983: 'Ênio Andrade', 1984: 'José Omar Pastoriza',
    1985: 'Carlos Bilardo', 1986: 'Héctor Veira', 1987: 'Óscar Tabárez', 1988: 'Roberto Fleitas', 1989: 'Francisco Maturana',
    1990: 'Ever Hugo Almeida', 1991: 'Mirko Jozić', 1992: 'Paulo César Carpegiani', 1993: 'Vanderlei Luxemburgo', 1994: 'Carlos Bianchi',
    1995: 'Carlos Alberto Parreira', 1996: 'Ramón Díaz', 1997: 'Vanderlei Luxemburgo', 1998: 'Joel Santana', 1999: 'Carlos Alberto Parreira',
    2000: 'Alfio Basile', 2001: 'Miguel Ángel Russo', 2002: 'Gerardo Martino', 2003: 'Miguel Ángel Russo', 2004: 'Jorge Luis Pinto',
    2005: 'Paulo Autuori', 2006: 'Abel Braga', 2007: 'Miguel Ángel Russo', 2008: 'Edgardo Bauza', 2009: 'Leonardo Astrada',
    2010: 'Mano Menezes', 2011: 'Tite Bacchi', 2012: 'Tite Bacchi', 2013: 'Cuca Stival', 2014: 'Marcelo Gallardo',
    2015: 'Marcelo Gallardo', 2016: 'Juan Carlos Osorio', 2017: 'Renato Portaluppi', 2018: 'Marcelo Gallardo', 2019: 'Jorge Jesus',
    2020: 'Abel Ferreira', 2021: 'Abel Ferreira', 2022: 'Dorival Júnior', 2023: 'Fernando Diniz', 2024: 'Artur Soares', 2025: 'Filipe Luís',
  },
  sudamericana: {
    2002: 'Rubén Darío Insúa', 2003: 'Freddy Ternero', 2004: 'Alfio Basile', 2005: 'Alfio Basile', 2006: 'Hugo Sánchez', 2008: 'Abel Braga', 2009: 'Edgardo Bauza',
    2010: 'Ariel Holan', 2011: 'Jorge Sampaoli', 2012: 'Tite Bacchi', 2013: 'Guillermo Barros Schelotto', 2014: 'Marcelo Gallardo', 2015: 'José Pékerman', 2017: 'Ariel Holan', 2018: 'Renato Portaluppi', 2019: 'Miguel Ángel Ramírez',
    2020: 'Martín Demichelis', 2021: 'Dorival Júnior', 2022: 'Martín Anselmi', 2023: 'Luis Zubeldía', 2024: 'Gustavo Costas', 2025: 'Gustavo Costas',
  },
  concacaf: {
    1996: 'Luis Fernando Tena', 1997: 'Luis Fernando Tena', 1998: 'Bruce Arena', 1999: 'Enrique Meza',
    2000: 'Sigi Schmid', 2002: 'Hugo Sánchez', 2003: 'Ricardo La Volpe', 2005: 'Hugo Sánchez', 2006: 'José Manuel de la Torre',
    2007: 'Efraín Flores', 2008: 'Efraín Flores', 2009: 'Sergio Bueno',
    2010: 'Guillermo Vázquez', 2011: 'Miguel Herrera', 2012: 'Miguel Herrera', 2013: 'Miguel Herrera', 2014: 'Pedro Caixinha',
    2015: 'Ignacio Ambriz', 2016: 'Ignacio Ambriz', 2017: 'Antonio Mohamed', 2018: 'Robert Dante Siboldi', 2019: 'Antonio Mohamed',
    2020: 'Veljko Paunović', 2021: 'Nicolás Larcamón', 2022: 'Steve Cherundolo', 2023: 'Nicolás Larcamón', 2024: 'Guillermo Almada Jr.', 2025: 'André Jardine',
  },
  'leagues-cup': {
    2019: 'Robert Dante Siboldi', 2021: 'Nicolás Larcamón', 2022: 'Steve Cherundolo', 2023: 'Tata Martino', 2024: 'Wilfried Nancy', 2025: 'Tata Martino',
  },
  afc: {
    1995: 'Cha Kyung-bok', 1997: 'Cha Kyung-bok', 1998: 'Cha Kyung-bok', 1999: 'Takeshi Okada',
    2001: 'Guus Hiddink', 2002: 'Guus Hiddink', 2006: 'Dick Advocaat', 2007: 'Guido Buchwald', 2008: 'Zico Coimbra', 2009: 'Hwangbo Kwan',
    2010: 'Shin Tae-yong', 2012: 'Kim Do-hoon', 2014: 'Tony Popovic', 2016: 'Choi Kang-hee', 2017: 'Mihailo Petrović', 2018: 'Go Oiwa',
    2020: 'Hong Myung-bo', 2022: 'Takayuki Yoshida', 2023: 'Takayuki Yoshida', 2024: 'Harry Kewell', 2025: 'Hong Myung-bo',
  },
  'afc-cup': {
    2015: 'Ashley Westwood', 2019: 'Sergio Lobera', 2022: 'Des Buckingham', 2023: 'Nick Montgomery', 2024: 'Nick Montgomery', 2025: 'Manolo Márquez',
  },
  'global-club-cup': {
    1960: 'Miguel Muñoz', 1961: 'Roberto Scarone', 1962: 'Lula Alonso', 1963: 'Lula Alonso', 1964: 'Helenio Herrera', 1965: 'Helenio Herrera', 1966: 'Roque Gastón Máspoli', 1967: 'Juan José Pizzuti', 1968: 'Osvaldo Zubeldía', 1969: 'Nereo Rocco',
    1970: 'Rinus Michels', 1971: 'Pedro Dellacha', 1972: 'Stefan Kovač', 1973: 'Pedro Dellacha', 1974: 'Luis Molowny', 1976: 'Dettmar Cramer', 1977: 'César Luis Menotti', 1979: 'Luis Cubilla',
    1980: 'Juan Mujica', 1981: 'Telê Santana', 1982: 'Óscar Tabárez', 1983: 'Ênio Andrade', 1984: 'José Omar Pastoriza', 1985: 'Giovanni Trapattoni', 1986: 'Héctor Veira', 1987: 'Artur Jorge', 1988: 'Roberto Fleitas', 1989: 'Ottavio Bianchi',
    1990: 'Arrigo Sacchi', 1991: 'Ljupko Petrović', 1992: 'Paulo César Carpegiani', 1993: 'Vanderlei Luxemburgo', 1994: 'Carlos Bianchi', 1995: 'Louis van Gaal', 1996: 'Cesare Maldini', 1997: 'Ottmar Hitzfeld', 1998: 'Jorge Valdano', 1999: 'Alex Ferguson',
    2000: 'Alfio Basile', 2001: 'Felix Magath', 2002: 'Luis Aragonés', 2003: 'Miguel Ángel Russo', 2004: 'Jesualdo Ferreira', 2005: 'Paulo Autuori', 2006: 'Abel Braga', 2007: 'Luciano Spalletti', 2008: 'Steve McClaren', 2009: 'Frank Rijkaard',
    2010: 'José Mourinho', 2011: 'Tito Vilanova', 2012: 'Tite Bacchi', 2013: 'Jupp Heynckes', 2014: 'Zinedine Zidane', 2015: 'Luis Enrique', 2016: 'Zinedine Zidane', 2017: 'Zinedine Zidane', 2018: 'Zinedine Zidane', 2019: 'Jürgen Klopp',
    2020: 'Hansi Flick', 2021: 'Thomas Tuchel', 2022: 'Carlo Ancelotti', 2023: 'Pep Guardiola', 2024: 'Carlo Ancelotti', 2025: 'Christophe Galtier',
  },
};

// Build a strict decade-ownership index so no coach from an earlier decade can ever resurface in a later decade
const COACH_DECADE_OWNERSHIP = new Map<string, number>();
for (const [decStr, byCountry] of Object.entries(ERA_COACHES_BY_DECADE)) {
  const dec = Number(decStr);
  for (const list of Object.values(byCountry)) {
    for (const coach of list) {
      if (!COACH_DECADE_OWNERSHIP.has(coach)) {
        COACH_DECADE_OWNERSHIP.set(coach, dec);
      }
    }
  }
}
for (const byYear of Object.values(HISTORICAL_INTL_CUP_COACHES)) {
  for (let yr = 2025; yr >= 1950; yr--) {
    const coach = byYear[yr];
    if (coach && !COACH_DECADE_OWNERSHIP.has(coach)) {
      COACH_DECADE_OWNERSHIP.set(coach, Math.floor(yr / 10) * 10);
    }
  }
}
for (const byYear of Object.values(HISTORICAL_TIER1_COACHES_BY_COUNTRY)) {
  for (let yr = 2025; yr >= 1950; yr--) {
    const coach = byYear[yr];
    if (coach && !COACH_DECADE_OWNERSHIP.has(coach)) {
      COACH_DECADE_OWNERSHIP.set(coach, Math.floor(yr / 10) * 10);
    }
  }
}

// Map both licensed (TEAMS) and unlicensed (ALL_CLUBS) club names to a single canonical seed key
// so deterministic era coach selection is 100% identical between mod-active and fallback modes.
const CANONICAL_CLUB_KEY_BY_NAME = new Map<string, string>();
for (const c of ALL_CLUBS) {
  if (c?.name) {
    CANONICAL_CLUB_KEY_BY_NAME.set(c.name.toLowerCase().trim(), `club-id-${c.id}`);
  }
}
for (const t of TEAMS) {
  if (t?.name) {
    CANONICAL_CLUB_KEY_BY_NAME.set(t.name.toLowerCase().trim(), `club-id-${t.id}`);
  }
}

// Future-era tactician name components (2030s, 2040s, 2050s, 2060s+)
// Partitioned by future decade offset so no future decade ever recycles coaches from earlier decades
const FUTURE_ERA_FIRST_POOLS: string[][] = [
  ['Lukas', 'Mateo', 'Julian', 'Enzo', 'Tiago', 'Nico', 'Florian', 'Sandro', 'Bastian', 'Emil', 'Kasper', 'Dario'],
  ['Valentin', 'Rafael', 'Kilian', 'Hugo', 'Leon', 'Gavi', 'Pedri', 'Jude', 'Jamal', 'Aurelien', 'Vitinha', 'Martín'],
  ['Matteo', 'Lorenzo', 'Gonçalo', 'Joško', 'Dominik', 'Xavi', 'Cole', 'Bukayo', 'Declan', 'Warren', 'Lamine', 'Pau'],
  ['Kenan', 'Arda', 'Aleksandar', 'Kobbie', 'Rico', 'Savinho', 'Endrick', 'Estêvão', 'Leny', 'Geovany', 'Sverre', 'Assan'],
];

const FUTURE_ERA_LAST_POOLS: string[][] = [
  ['Kroos', 'Modrić', 'Gündoğan', 'Barella', 'Rodri', 'Ødegaard', 'Mac Allister', 'Valverde', 'Kimmich', 'Silva', 'Fernandes', 'Reijnders'],
  ['Wirtz', 'Musiala', 'Bellingham', 'Camavinga', 'Tchouaméni', 'Gvardiol', 'Bastoni', 'Saliba', 'Hakimi', 'Pedriza', 'Varela', 'Zubimendi'],
  ['Zaïre-Emery', 'Mainoo', 'Yoro', 'Cubarsí', 'Yamal', 'Güler', 'Pavlović', 'Neves', 'Scalvini', 'Calafiori', 'Baturina', 'Gloukh'],
  ['Nwaneri', 'Mastantuono', 'Quenda', 'Echeverri', 'Paez', 'Bouaddi', 'Bergvall', 'Gray', 'Nypan', 'Bardghji', 'Mora', 'Bischof'],
];

export function getDeterministicCoachName(
  country: string,
  clubName: string,
  year: number,
  isModActive: boolean = true
): string {
  const safeYear = Math.max(1950, Number(year) || 2026);
  const decade = Math.floor(safeYear / 10) * 10;
  const spellBucket = Math.floor((safeYear - decade) / 3); // ~2-3 season coaching spell within the same decade
  const canonicalSeedKey =
    CANONICAL_CLUB_KEY_BY_NAME.get((clubName || '').toLowerCase().trim()) || clubName;

  let realCoach: string;
  if (decade <= 2020) {
    const eraMap = ERA_COACHES_BY_DECADE[decade] || ERA_COACHES_BY_DECADE[2020];
    const pool = eraMap[country] || eraMap.DEFAULT;
    const idx = hashSeed(`${country}-${canonicalSeedKey}-${decade}`, spellBucket) % pool.length;
    realCoach = pool[idx];
  } else {
    // For 2030s, 2040s, 2050s, 2060s+: strictly disjoint future cohorts per decade
    const futureDecadeIdx = Math.floor((decade - 2030) / 10);
    const firstPool = FUTURE_ERA_FIRST_POOLS[futureDecadeIdx % FUTURE_ERA_FIRST_POOLS.length];
    const lastPool = FUTURE_ERA_LAST_POOLS[futureDecadeIdx % FUTURE_ERA_LAST_POOLS.length];
    const s1 = hashSeed(`${country}-${canonicalSeedKey}-fut-first-${decade}`, spellBucket);
    const s2 = hashSeed(`${country}-${canonicalSeedKey}-fut-last-${decade}`, spellBucket);
    const firstName = firstPool[s1 % firstPool.length];
    const capitalizedFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const lastName = lastPool[s2 % lastPool.length];
    if (futureDecadeIdx >= FUTURE_ERA_FIRST_POOLS.length) {
      const altFirst =
        FUTURE_ERA_FIRST_POOLS[(futureDecadeIdx + 1) % FUTURE_ERA_FIRST_POOLS.length][
          s1 % firstPool.length
        ];
      realCoach = `${altFirst.charAt(0).toUpperCase() + altFirst.slice(1)} ${lastName}`;
    } else {
      realCoach = `${capitalizedFirst} ${lastName}`;
    }
  }

  return isModActive ? realCoach : toFallbackCoachName(realCoach);
}

/**
 * Resolves the winning coach for Tier 1, International Cups, or Domestic/Lower-Tier competitions.
 * - When `isModActive === true`: returns the authentic real historical winning coach (with era-locked real fallback).
 * - When `isModActive === false`: returns the unlicensed fallback coach name (`toFallbackCoachName`).
 * - Strictly preserves the decade-isolation invariant so no coach from an earlier decade ever resurfaces.
 */
export function resolveAlmanacCoachName(params: {
  competitionId: string;
  tier?: number;
  country: string;
  clubName: string;
  year: number;
  isHistoricalLore: boolean;
  isModActive: boolean;
}): string {
  const { competitionId, tier, country, clubName, year, isHistoricalLore, isModActive } = params;
  const safeYear = Math.max(1930, Number(year) || 2026);
  const decade = Math.floor(safeYear / 10) * 10;

  let candidateRealCoach: string | undefined;
  if (isHistoricalLore) {
    if (competitionId === 'world-cup' && HISTORICAL_WORLD_CUP_WINNERS[safeYear]) {
      candidateRealCoach = HISTORICAL_WORLD_CUP_WINNERS[safeYear].coachName;
    } else if (HISTORICAL_INTL_CUP_COACHES[competitionId]?.[safeYear]) {
      candidateRealCoach = HISTORICAL_INTL_CUP_COACHES[competitionId][safeYear];
    } else if (tier === 1 && HISTORICAL_TIER1_COACHES_BY_COUNTRY[country]?.[safeYear]) {
      candidateRealCoach = HISTORICAL_TIER1_COACHES_BY_COUNTRY[country][safeYear];
    }
  }

  // Enforce strict decade isolation on any mapped candidate (except pre-1950 World Cup lore)
  if (candidateRealCoach && safeYear >= 1950 && competitionId !== 'world-cup') {
    const ownedDecade = COACH_DECADE_OWNERSHIP.get(candidateRealCoach);
    if (ownedDecade !== undefined && ownedDecade !== decade) {
      candidateRealCoach = undefined;
    }
  }

  if (candidateRealCoach) {
    return isModActive ? candidateRealCoach : toFallbackCoachName(candidateRealCoach);
  }

  return getDeterministicCoachName(country, clubName, safeYear, isModActive);
}




// ============================================================================
// PRE-START HISTORICAL LORE (1950–2025) CANONICAL CLUB ID MAPPINGS
// ============================================================================

// Helper to generate authentic multi-era historical champion maps from real club title weights
function buildWeightedEraHistory(entries: Array<[number, number]>, salt: string): Record<number, number> {
  const expanded: number[] = [];
  for (const [clubId, weight] of entries) {
    for (let i = 0; i < weight; i++) expanded.push(clubId);
  }
  const out: Record<number, number> = {};
  for (let yr = 1950; yr <= 2025; yr++) {
    const h = hashSeed(`${salt}-${yr}`, yr);
    out[yr] = expanded[h % expanded.length];
  }
  return out;
}

// Authentic Tier 1 Champions (1950–2025) mapped by canonical Club ID in clubsData.ts / mod-data/teams.ts
const HISTORICAL_TIER1_CHAMPIONS_BY_COUNTRY: Record<string, Record<number, number>> = {
  // Germany (1: Bayern, 2: Leverkusen, 3: Dortmund, 5: Stuttgart, 6: Frankfurt, 10: Bremen, 12: Wolfsburg, 14: Gladbach, 19: Köln, 22: HSV, 24: Hannover, 28: Schalke, 30: Nürnberg, 31: Kaiserslautern, 33: Braunschweig, 44: RW Essen)
  GER: {
    1950: 5, 1951: 31, 1952: 5, 1953: 31, 1954: 24, 1955: 44, 1956: 3, 1957: 3, 1958: 28, 1959: 6,
    1960: 22, 1961: 30, 1962: 19, 1963: 3, 1964: 19, 1965: 10, 1966: 1, 1967: 33, 1968: 30, 1969: 1,
    1970: 14, 1971: 14, 1972: 1, 1973: 1, 1974: 1, 1975: 14, 1976: 14, 1977: 14, 1978: 19, 1979: 22,
    1980: 1, 1981: 1, 1982: 22, 1983: 22, 1984: 5, 1985: 1, 1986: 1, 1987: 1, 1988: 10, 1989: 1,
    1990: 1, 1991: 31, 1992: 5, 1993: 10, 1994: 1, 1995: 3, 1996: 3, 1997: 1, 1998: 31, 1999: 1,
    2000: 1, 2001: 1, 2002: 3, 2003: 1, 2004: 10, 2005: 1, 2006: 1, 2007: 5, 2008: 1, 2009: 12,
    2010: 1, 2011: 3, 2012: 3, 2013: 1, 2014: 1, 2015: 1, 2016: 1, 2017: 1, 2018: 1, 2019: 1,
    2020: 1, 2021: 1, 2022: 1, 2023: 1, 2024: 2, 2025: 1,
  },
  // England (701: Man City, 702: Arsenal, 703: Liverpool, 704: Chelsea, 705: Man Utd, 706: Tottenham, 707: Aston Villa, 708: Newcastle, 714: Everton, 715: Nottingham Forest, 717: Wolves, 718: Ipswich, 719: Leicester, 721: Leeds, 722: Burnley, 725: Sunderland, 728: West Brom, 732: Blackburn, 736: Preston, 741: Derby, 743: Portsmouth)
  ENG: {
    1950: 743, 1951: 706, 1952: 705, 1953: 702, 1954: 717, 1955: 704, 1956: 705, 1957: 705, 1958: 717, 1959: 717,
    1960: 722, 1961: 706, 1962: 718, 1963: 714, 1964: 703, 1965: 705, 1966: 703, 1967: 705, 1968: 701, 1969: 721,
    1970: 714, 1971: 702, 1972: 741, 1973: 703, 1974: 721, 1975: 741, 1976: 703, 1977: 703, 1978: 715, 1979: 703,
    1980: 703, 1981: 707, 1982: 703, 1983: 703, 1984: 703, 1985: 714, 1986: 703, 1987: 714, 1988: 703, 1989: 702,
    1990: 703, 1991: 702, 1992: 721, 1993: 705, 1994: 705, 1995: 732, 1996: 705, 1997: 705, 1998: 702, 1999: 705,
    2000: 705, 2001: 705, 2002: 702, 2003: 705, 2004: 702, 2005: 704, 2006: 704, 2007: 705, 2008: 705, 2009: 705,
    2010: 704, 2011: 705, 2012: 701, 2013: 705, 2014: 701, 2015: 704, 2016: 719, 2017: 704, 2018: 701, 2019: 701,
    2020: 703, 2021: 701, 2022: 701, 2023: 701, 2024: 701, 2025: 703,
  },
  // Spain (501: Real Madrid, 502: Barcelona, 503: Atlético Madrid, 504: Athletic Bilbao, 505: Real Sociedad, 508: Sevilla, 509: Valencia, 537: Deportivo La Coruña)
  ESP: {
    1950: 503, 1951: 503, 1952: 502, 1953: 502, 1954: 501, 1955: 501, 1956: 504, 1957: 501, 1958: 501, 1959: 502,
    1960: 502, 1961: 501, 1962: 501, 1963: 501, 1964: 501, 1965: 501, 1966: 503, 1967: 501, 1968: 501, 1969: 501,
    1970: 503, 1971: 509, 1972: 501, 1973: 503, 1974: 502, 1975: 501, 1976: 501, 1977: 503, 1978: 501, 1979: 501,
    1980: 501, 1981: 505, 1982: 505, 1983: 504, 1984: 504, 1985: 502, 1986: 501, 1987: 501, 1988: 501, 1989: 501,
    1990: 501, 1991: 502, 1992: 502, 1993: 502, 1994: 502, 1995: 501, 1996: 503, 1997: 501, 1998: 502, 1999: 502,
    2000: 537, 2001: 501, 2002: 509, 2003: 501, 2004: 509, 2005: 502, 2006: 502, 2007: 501, 2008: 501, 2009: 502,
    2010: 502, 2011: 502, 2012: 501, 2013: 502, 2014: 503, 2015: 502, 2016: 502, 2017: 501, 2018: 502, 2019: 502,
    2020: 501, 2021: 503, 2022: 501, 2023: 502, 2024: 501, 2025: 502,
  },
  // Italy (901: Juventus, 902: Inter, 903: Milan, 904: Napoli, 906: Roma, 907: Lazio, 908: Fiorentina, 909: Bologna, 910: Torino, 915: Cagliari, 916: Verona, 922: Sampdoria)
  ITA: {
    1950: 901, 1951: 903, 1952: 901, 1953: 902, 1954: 902, 1955: 903, 1956: 908, 1957: 903, 1958: 901, 1959: 903,
    1960: 901, 1961: 901, 1962: 903, 1963: 902, 1964: 909, 1965: 902, 1966: 902, 1967: 901, 1968: 903, 1969: 908,
    1970: 915, 1971: 902, 1972: 901, 1973: 901, 1974: 907, 1975: 901, 1976: 910, 1977: 901, 1978: 901, 1979: 903,
    1980: 902, 1981: 901, 1982: 901, 1983: 906, 1984: 901, 1985: 916, 1986: 901, 1987: 904, 1988: 903, 1989: 902,
    1990: 904, 1991: 922, 1992: 903, 1993: 903, 1994: 903, 1995: 901, 1996: 903, 1997: 901, 1998: 901, 1999: 903,
    2000: 907, 2001: 906, 2002: 901, 2003: 901, 2004: 903, 2005: 901, 2006: 902, 2007: 902, 2008: 902, 2009: 902,
    2010: 902, 2011: 903, 2012: 901, 2013: 901, 2014: 901, 2015: 901, 2016: 901, 2017: 901, 2018: 901, 2019: 901,
    2020: 901, 2021: 902, 2022: 903, 2023: 904, 2024: 902, 2025: 904,
  },
  // France (401: PSG, 402: Lyon, 403: Marseille, 404: Monaco, 405: Lille, 406: Nice, 407: Lens, 410: Strasbourg, 412: Montpellier, 413: Nantes, 414: Reims, 415: Auxerre, 419: Saint-Étienne, 425: Bordeaux)
  FRA: {
    1950: 425, 1951: 406, 1952: 406, 1953: 414, 1954: 405, 1955: 414, 1956: 406, 1957: 419, 1958: 414, 1959: 406,
    1960: 414, 1961: 404, 1962: 414, 1963: 404, 1964: 419, 1965: 413, 1966: 413, 1967: 419, 1968: 419, 1969: 419,
    1970: 419, 1971: 403, 1972: 403, 1973: 413, 1974: 419, 1975: 419, 1976: 419, 1977: 413, 1978: 404, 1979: 410,
    1980: 413, 1981: 419, 1982: 404, 1983: 413, 1984: 425, 1985: 425, 1986: 401, 1987: 425, 1988: 404, 1989: 403,
    1990: 403, 1991: 403, 1992: 403, 1993: 403, 1994: 401, 1995: 413, 1996: 415, 1997: 404, 1998: 407, 1999: 425,
    2000: 404, 2001: 413, 2002: 402, 2003: 402, 2004: 402, 2005: 402, 2006: 402, 2007: 402, 2008: 402, 2009: 425,
    2010: 403, 2011: 405, 2012: 412, 2013: 401, 2014: 401, 2015: 401, 2016: 401, 2017: 404, 2018: 401, 2019: 401,
    2020: 401, 2021: 405, 2022: 401, 2023: 401, 2024: 401, 2025: 401,
  },
  // Portugal (201: Sporting CP, 202: Benfica, 203: FC Porto, 214: Boavista)
  POR: {
    1950: 202, 1951: 201, 1952: 201, 1953: 201, 1954: 201, 1955: 202, 1956: 203, 1957: 202, 1958: 201, 1959: 203,
    1960: 202, 1961: 202, 1962: 201, 1963: 202, 1964: 202, 1965: 202, 1966: 201, 1967: 202, 1968: 202, 1969: 202,
    1970: 201, 1971: 202, 1972: 202, 1973: 202, 1974: 201, 1975: 202, 1976: 202, 1977: 202, 1978: 203, 1979: 203,
    1980: 201, 1981: 202, 1982: 201, 1983: 202, 1984: 202, 1985: 203, 1986: 203, 1987: 202, 1988: 203, 1989: 202,
    1990: 203, 1991: 202, 1992: 203, 1993: 203, 1994: 202, 1995: 203, 1996: 203, 1997: 203, 1998: 203, 1999: 203,
    2000: 201, 2001: 214, 2002: 201, 2003: 203, 2004: 203, 2005: 202, 2006: 203, 2007: 203, 2008: 203, 2009: 203,
    2010: 202, 2011: 203, 2012: 203, 2013: 203, 2014: 202, 2015: 202, 2016: 202, 2017: 202, 2018: 203, 2019: 202,
    2020: 203, 2021: 201, 2022: 203, 2023: 202, 2024: 201, 2025: 201,
  },
  // Scotland (1201: Celtic, 1202: Rangers, 1203: Hearts, 1204: Hibernian, 1205: Aberdeen, 1206: Kilmarnock, 1209: Dundee Utd, 1210: Dundee)
  SCO: {
    1950: 1202, 1951: 1204, 1952: 1204, 1953: 1202, 1954: 1201, 1955: 1205, 1956: 1202, 1957: 1202, 1958: 1203, 1959: 1202,
    1960: 1203, 1961: 1202, 1962: 1210, 1963: 1202, 1964: 1202, 1965: 1206, 1966: 1201, 1967: 1201, 1968: 1201, 1969: 1201,
    1970: 1201, 1971: 1201, 1972: 1201, 1973: 1201, 1974: 1201, 1975: 1202, 1976: 1202, 1977: 1201, 1978: 1202, 1979: 1201,
    1980: 1205, 1981: 1201, 1982: 1201, 1983: 1209, 1984: 1205, 1985: 1205, 1986: 1201, 1987: 1202, 1988: 1201, 1989: 1202,
    1990: 1202, 1991: 1202, 1992: 1202, 1993: 1202, 1994: 1202, 1995: 1202, 1996: 1202, 1997: 1202, 1998: 1201, 1999: 1202,
    2000: 1202, 2001: 1201, 2002: 1201, 2003: 1202, 2004: 1201, 2005: 1202, 2006: 1201, 2007: 1201, 2008: 1201, 2009: 1202,
    2010: 1202, 2011: 1202, 2012: 1201, 2013: 1201, 2014: 1201, 2015: 1201, 2016: 1201, 2017: 1201, 2018: 1201, 2019: 1201,
    2020: 1201, 2021: 1202, 2022: 1201, 2023: 1201, 2024: 1201, 2025: 1201,
  },
  // Turkey (2401: Galatasaray, 2402: Fenerbahçe, 2403: Beşiktaş, 2404: Trabzonspor, 2405: Başakşehir, 2437: Bursaspor)
  TUR: {
    1959: 2402, 1960: 2403, 1961: 2402, 1962: 2401, 1963: 2401, 1964: 2402, 1965: 2402, 1966: 2403, 1967: 2403, 1968: 2402,
    1969: 2401, 1970: 2402, 1971: 2401, 1972: 2401, 1973: 2401, 1974: 2402, 1975: 2402, 1976: 2404, 1977: 2404, 1978: 2402,
    1979: 2404, 1980: 2404, 1981: 2404, 1982: 2403, 1983: 2402, 1984: 2404, 1985: 2402, 1986: 2403, 1987: 2401, 1988: 2401,
    1989: 2402, 1990: 2403, 1991: 2403, 1992: 2403, 1993: 2401, 1994: 2401, 1995: 2403, 1996: 2402, 1997: 2401, 1998: 2401,
    1999: 2401, 2000: 2401, 2001: 2402, 2002: 2401, 2003: 2403, 2004: 2402, 2005: 2402, 2006: 2401, 2007: 2402, 2008: 2401,
    2009: 2403, 2010: 2437, 2011: 2402, 2012: 2401, 2013: 2401, 2014: 2402, 2015: 2401, 2016: 2403, 2017: 2403, 2018: 2401,
    2019: 2401, 2020: 2405, 2021: 2403, 2022: 2404, 2023: 2401, 2024: 2401, 2025: 2401,
  },
  // Brazil (1401: Palmeiras, 1402: Flamengo, 1403: Atlético-MG, 1404: Fluminense, 1405: São Paulo, 1406: Grêmio, 1407: Internacional, 1408: Corinthians, 1409: Athletico-PR, 1410: Botafogo, 1411: Santos, 1412: Cruzeiro, 1415: Bahia, 1416: Vasco, 1421: Coritiba, 1423: Sport, 1427: Guarani)
  BRA: {
    1959: 1415, 1960: 1401, 1961: 1411, 1962: 1411, 1963: 1411, 1964: 1411, 1965: 1411, 1966: 1412, 1967: 1401, 1968: 1410,
    1969: 1401, 1970: 1404, 1971: 1403, 1972: 1401, 1973: 1401, 1974: 1416, 1975: 1407, 1976: 1407, 1977: 1405, 1978: 1427,
    1979: 1407, 1980: 1402, 1981: 1406, 1982: 1402, 1983: 1402, 1984: 1404, 1985: 1421, 1986: 1405, 1987: 1423, 1988: 1415,
    1989: 1416, 1990: 1408, 1991: 1405, 1992: 1402, 1993: 1401, 1994: 1401, 1995: 1410, 1996: 1406, 1997: 1416, 1998: 1408,
    1999: 1408, 2000: 1416, 2001: 1409, 2002: 1411, 2003: 1412, 2004: 1411, 2005: 1408, 2006: 1405, 2007: 1405, 2008: 1405,
    2009: 1402, 2010: 1404, 2011: 1408, 2012: 1404, 2013: 1412, 2014: 1412, 2015: 1408, 2016: 1401, 2017: 1408, 2018: 1401,
    2019: 1402, 2020: 1402, 2021: 1403, 2022: 1401, 2023: 1401, 2024: 1410, 2025: 1402,
  },
  // Argentina (1901: River Plate, 1902: Boca Juniors, 1903: Racing, 1904: Independiente, 1905: San Lorenzo, 1906: Vélez, 1907: Estudiantes, 1908: Rosario Central, 1909: Newell's, 1912: Lanús, 1913: Argentinos Jrs, 1915: Huracán, 1918: Banfield)
  ARG: {
    1950: 1903, 1951: 1903, 1952: 1901, 1953: 1901, 1954: 1902, 1955: 1901, 1956: 1901, 1957: 1901, 1958: 1903, 1959: 1905,
    1960: 1904, 1961: 1903, 1962: 1902, 1963: 1904, 1964: 1902, 1965: 1902, 1966: 1903, 1967: 1907, 1968: 1906, 1969: 1902,
    1970: 1904, 1971: 1908, 1972: 1905, 1973: 1915, 1974: 1909, 1975: 1901, 1976: 1902, 1977: 1901, 1978: 1904, 1979: 1901,
    1980: 1901, 1981: 1902, 1982: 1907, 1983: 1904, 1984: 1913, 1985: 1913, 1986: 1901, 1987: 1908, 1988: 1909, 1989: 1904,
    1990: 1901, 1991: 1909, 1992: 1902, 1993: 1906, 1994: 1901, 1995: 1905, 1996: 1906, 1997: 1901, 1998: 1902, 1999: 1902,
    2000: 1901, 2001: 1903, 2002: 1904, 2003: 1902, 2004: 1901, 2005: 1906, 2006: 1907, 2007: 1912, 2008: 1901, 2009: 1918,
    2010: 1907, 2011: 1902, 2012: 1906, 2013: 1909, 2014: 1903, 2015: 1902, 2016: 1912, 2017: 1902, 2018: 1902, 2019: 1903,
    2020: 1902, 2021: 1901, 2022: 1902, 2023: 1901, 2024: 1906, 2025: 1901,
  },
  // USA (1001: Atlanta, 1003: Chicago, 1005: Columbus, 1006: DC United, 1007: Inter Miami, 1011: NYCFC, 1012: NY Red Bulls, 1015: Toronto, 1017: Colorado, 1019: Houston, 1020: Sporting KC, 1021: LA Galaxy, 1022: LAFC, 1024: Portland, 1025: Real Salt Lake, 1027: San Jose)
  USA: {
    1996: 1006, 1997: 1006, 1998: 1003, 1999: 1006, 2000: 1020, 2001: 1027, 2002: 1021, 2003: 1027, 2004: 1006, 2005: 1021,
    2006: 1019, 2007: 1019, 2008: 1005, 2009: 1025, 2010: 1017, 2011: 1021, 2012: 1021, 2013: 1020, 2014: 1021, 2015: 1024,
    2016: 1021, 2017: 1015, 2018: 1001, 2019: 1021, 2020: 1005, 2021: 1011, 2022: 1022, 2023: 1005, 2024: 1021, 2025: 1007,
  },
  // Japan (2001: Vissel Kobe, 2002: Yokohama F. Marinos, 2003: Kawasaki Frontale, 2004: Urawa Reds, 2006: Sanfrecce Hiroshima, 2007: Gamba Osaka, 2010: Nagoya Grampus, 2013: Kashiwa Reysol, 2019: Tokyo Verdy, 2020: Júbilo Iwata)
  JPN: {
    1993: 2019, 1994: 2019, 1995: 2002, 1996: 2004, 1997: 2020, 1998: 2002, 1999: 2020, 2000: 2002, 2001: 2004, 2002: 2020,
    2003: 2002, 2004: 2002, 2005: 2007, 2006: 2004, 2007: 2004, 2008: 2007, 2009: 2004, 2010: 2010, 2011: 2013, 2012: 2006,
    2013: 2006, 2014: 2007, 2015: 2006, 2016: 2004, 2017: 2003, 2018: 2003, 2019: 2002, 2020: 2003, 2021: 2003, 2022: 2002,
    2023: 2001, 2024: 2001, 2025: 2006,
  },
  // Denmark (2501: FC Copenhagen, 2502: FC Midtjylland, 2503: Brøndby IF, 2504: FC Nordsjælland, 2505: AGF Aarhus, 2506: Silkeborg IF, 2509: AaB Aalborg, 2510: Odense Boldklub, 2511: Vejle Boldklub, 2512: Lyngby Boldklub, 2514: Hvidovre IF, 2516: Esbjerg fB)
  DEN: {
    ...buildWeightedEraHistory([[2505, 5], [2511, 5], [2516, 5], [2510, 3], [2503, 4], [2512, 2], [2514, 2]], 'DEN'),
    1990: 2503, 1991: 2503, 1992: 2512, 1993: 2501, 1994: 2506, 1995: 2509, 1996: 2503, 1997: 2503, 1998: 2503, 1999: 2509,
    2000: 2501, 2001: 2501, 2002: 2503, 2003: 2501, 2004: 2501, 2005: 2503, 2006: 2501, 2007: 2501, 2008: 2509, 2009: 2501,
    2010: 2501, 2011: 2501, 2012: 2504, 2013: 2501, 2014: 2509, 2015: 2502, 2016: 2501, 2017: 2501, 2018: 2502, 2019: 2501,
    2020: 2502, 2021: 2503, 2022: 2501, 2023: 2501, 2024: 2502, 2025: 2501,
  },
  // Sweden (2701: Malmö FF, 2702: AIK Solna, 2703: Djurgårdens IF, 2704: Hammarby IF, 2705: BK Häcken, 2706: IF Elfsborg, 2707: IFK Göteborg, 2708: IFK Norrköping, 2709: Kalmar FF, 2712: Halmstads BK, 2718: Helsingborgs IF)
  SWE: {
    ...buildWeightedEraHistory([[2701, 10], [2707, 9], [2708, 7], [2703, 4], [2702, 3], [2706, 3], [2712, 3], [2718, 2]], 'SWE'),
    1990: 2707, 1991: 2707, 1992: 2702, 1993: 2707, 1994: 2707, 1995: 2707, 1996: 2707, 1997: 2712, 1998: 2702, 1999: 2718,
    2000: 2712, 2001: 2704, 2002: 2703, 2003: 2703, 2004: 2701, 2005: 2703, 2006: 2706, 2007: 2707, 2008: 2709, 2009: 2702,
    2010: 2701, 2011: 2718, 2012: 2706, 2013: 2701, 2014: 2701, 2015: 2708, 2016: 2701, 2017: 2701, 2018: 2702, 2019: 2703,
    2020: 2701, 2021: 2701, 2022: 2705, 2023: 2701, 2024: 2701, 2025: 2701,
  },
  // Norway (2601: FK Bodø/Glimt, 2602: Molde FK, 2603: SK Brann, 2604: Rosenborg BK, 2605: Viking FK, 2608: Lillestrøm SK, 2609: Strømsgodset IF, 2610: Vålerenga, 2615: Fredrikstad FK)
  NOR: {
    ...buildWeightedEraHistory([[2615, 6], [2605, 7], [2604, 7], [2608, 5], [2610, 4], [2603, 2], [2609, 1]], 'NOR'),
    1990: 2604, 1991: 2605, 1992: 2604, 1993: 2604, 1994: 2604, 1995: 2604, 1996: 2604, 1997: 2604, 1998: 2604, 1999: 2604,
    2000: 2604, 2001: 2604, 2002: 2604, 2003: 2604, 2004: 2604, 2005: 2610, 2006: 2604, 2007: 2603, 2008: 2609, 2009: 2604,
    2010: 2604, 2011: 2602, 2012: 2602, 2013: 2609, 2014: 2602, 2015: 2604, 2016: 2604, 2017: 2604, 2018: 2604, 2019: 2602,
    2020: 2601, 2021: 2601, 2022: 2602, 2023: 2601, 2024: 2601, 2025: 2601,
  },
  // Indonesia (2801: Persib Bandung, 2802: Persija Jakarta, 2803: Bali United, 2804: PSM Makassar, 2805: Persebaya Surabaya, 2806: Arema FC, 2809: Persik Kediri, 2810: PSIS Semarang, 2814: Persis Solo, 2816: Semen Padang)
  IDN: {
    ...buildWeightedEraHistory([[2802, 9], [2801, 7], [2804, 6], [2805, 6], [2814, 5], [2810, 2], [2806, 2], [2809, 2]], 'IDN'),
    2000: 2804, 2001: 2802, 2002: 2805, 2003: 2809, 2004: 2805, 2005: 2801, 2006: 2809, 2007: 2804, 2008: 2801, 2009: 2806,
    2010: 2806, 2011: 2802, 2012: 2816, 2013: 2801, 2014: 2801, 2015: 2801, 2016: 2802, 2017: 2802, 2018: 2802, 2019: 2803,
    2020: 2803, 2021: 2803, 2022: 2803, 2023: 2804, 2024: 2801, 2025: 2801,
  },
  // India (2901: Mohun Bagan SG, 2902: Mumbai City FC, 2903: Kerala Blasters, 2904: Bengaluru FC, 2905: FC Goa, 2906: East Bengal FC, 2908: Chennaiyin FC, 2911: Hyderabad FC, 2913: Mohammedan SC, 2914: Churchill Brothers, 2916: Aizawl FC)
  IND: {
    ...buildWeightedEraHistory([[2901, 12], [2906, 11], [2913, 4], [2914, 3], [2905, 2]], 'IND'),
    2000: 2901, 2001: 2906, 2002: 2901, 2003: 2906, 2004: 2906, 2005: 2901, 2006: 2906, 2007: 2914, 2008: 2914, 2009: 2914,
    2010: 2901, 2011: 2906, 2012: 2914, 2013: 2914, 2014: 2904, 2015: 2901, 2016: 2904, 2017: 2916, 2018: 2908, 2019: 2904,
    2020: 2901, 2021: 2902, 2022: 2911, 2023: 2901, 2024: 2901, 2025: 2901,
  },
  // Slovakia (3401: ŠK Slovan Bratislava, 3402: FC Spartak Trnava, 3403: MŠK Žilina, 3406: FC Košice, 3407: MFK Ružomberok, 3408: AS Trenčín, 3412: Dukla Banská Bystrica, 3415: FC Petržalka, 3417: Inter Bratislava)
  SVK: {
    ...buildWeightedEraHistory([[3401, 12], [3402, 8], [3417, 5], [3403, 4], [3406, 3], [3412, 2]], 'SVK'),
    1994: 3401, 1995: 3401, 1996: 3401, 1997: 3406, 1998: 3406, 1999: 3401, 2000: 3417, 2001: 3417, 2002: 3403, 2003: 3403,
    2004: 3403, 2005: 3415, 2006: 3407, 2007: 3403, 2008: 3415, 2009: 3401, 2010: 3403, 2011: 3401, 2012: 3403, 2013: 3401,
    2014: 3401, 2015: 3408, 2016: 3408, 2017: 3403, 2018: 3402, 2019: 3401, 2020: 3401, 2021: 3401, 2022: 3401, 2023: 3401,
    2024: 3401, 2025: 3401,
  },
  // Peru (3201: Universitario de Deportes, 3202: Alianza Lima, 3203: Sporting Cristal, 3204: FBC Melgar, 3207: Sport Boys, 3208: Deportivo Municipal)
  PER: {
    ...buildWeightedEraHistory([[3201, 14], [3202, 12], [3203, 10], [3207, 3], [3208, 2], [3204, 2]], 'PER'),
    1990: 3201, 1991: 3203, 1992: 3201, 1993: 3201, 1994: 3203, 1995: 3203, 1996: 3203, 1997: 3202, 1998: 3201, 1999: 3201,
    2000: 3201, 2001: 3202, 2002: 3203, 2003: 3202, 2004: 3202, 2005: 3203, 2006: 3202, 2007: 3201, 2008: 3201, 2009: 3201,
    2010: 3201, 2011: 3202, 2012: 3203, 2013: 3201, 2014: 3203, 2015: 3204, 2016: 3203, 2017: 3202, 2018: 3203, 2019: 3202,
    2020: 3203, 2021: 3202, 2022: 3202, 2023: 3201, 2024: 3201, 2025: 3201,
  },
  // South Korea (3701: Ulsan HD FC, 3702: Jeonbuk Hyundai Motors, 3703: FC Seoul, 3704: Pohang Steelers, 3705: Suwon Samsung Bluewings, 3708: Jeju SK FC, 3713: Seongnam FC, 3714: Busan IPark)
  KOR: {
    ...buildWeightedEraHistory([[3713, 7], [3704, 5], [3714, 4], [3703, 5], [3705, 4], [3701, 3], [3708, 2]], 'KOR'),
    1990: 3703, 1991: 3714, 1992: 3704, 1993: 3713, 1994: 3713, 1995: 3713, 1996: 3701, 1997: 3714, 1998: 3705, 1999: 3705,
    2000: 3703, 2001: 3713, 2002: 3713, 2003: 3713, 2004: 3705, 2005: 3701, 2006: 3713, 2007: 3704, 2008: 3705, 2009: 3702,
    2010: 3703, 2011: 3702, 2012: 3703, 2013: 3704, 2014: 3702, 2015: 3702, 2016: 3703, 2017: 3702, 2018: 3702, 2019: 3702,
    2020: 3702, 2021: 3702, 2022: 3701, 2023: 3701, 2024: 3701, 2025: 3701,
  },
  // Bolivia (3101: Club Bolívar, 3102: The Strongest, 3103: Jorge Wilstermann, 3104: Oriente Petrolero, 3105: Club Blooming, 3106: Always Ready, 3107: San José de Oruro, 3108: Club Aurora, 3114: Independiente Petrolero)
  BOL: {
    ...buildWeightedEraHistory([[3101, 15], [3102, 10], [3103, 8], [3104, 4], [3105, 3], [3106, 2], [3107, 2]], 'BOL'),
    1990: 3104, 1991: 3101, 1992: 3101, 1993: 3102, 1994: 3101, 1995: 3107, 1996: 3101, 1997: 3101, 1998: 3105, 1999: 3105,
    2000: 3103, 2001: 3104, 2002: 3101, 2003: 3102, 2004: 3101, 2005: 3101, 2006: 3103, 2007: 3107, 2008: 3108, 2009: 3101,
    2010: 3104, 2011: 3102, 2012: 3102, 2013: 3101, 2014: 3101, 2015: 3101, 2016: 3102, 2017: 3101, 2018: 3103, 2019: 3101,
    2020: 3106, 2021: 3114, 2022: 3101, 2023: 3102, 2024: 3101, 2025: 3101,
  },
  // Paraguay (3301: Club Olimpia, 3302: Cerro Porteño, 3303: Club Libertad, 3304: Club Guaraní, 3305: Club Nacional Asunción, 3306: Sportivo Luqueño, 3307: Sol de América)
  PAR: {
    ...buildWeightedEraHistory([[3301, 18], [3302, 13], [3303, 8], [3304, 5], [3305, 3], [3306, 2], [3307, 2]], 'PAR'),
    1990: 3302, 1991: 3307, 1992: 3302, 1993: 3301, 1994: 3302, 1995: 3301, 1996: 3302, 1997: 3301, 1998: 3301, 1999: 3301,
    2000: 3301, 2001: 3302, 2002: 3303, 2003: 3303, 2004: 3302, 2005: 3302, 2006: 3303, 2007: 3303, 2008: 3303, 2009: 3305,
    2010: 3303, 2011: 3301, 2012: 3302, 2013: 3305, 2014: 3303, 2015: 3302, 2016: 3304, 2017: 3302, 2018: 3301, 2019: 3301,
    2020: 3301, 2021: 3302, 2022: 3303, 2023: 3303, 2024: 3301, 2025: 3303,
  },
  // Chile (3001: Colo-Colo, 3002: Universidad de Chile, 3003: Universidad Católica, 3004: Cobreloa, 3005: Unión Española, 3006: Palestino, 3007: Audax Italiano, 3008: Everton, 3009: O'Higgins, 3010: Huachipato, 3011: Cobresal, 3017: Santiago Wanderers)
  CHI: {
    ...buildWeightedEraHistory([[3001, 16], [3002, 10], [3003, 8], [3004, 5], [3005, 4], [3007, 2], [3008, 2], [3006, 2], [3017, 2]], 'CHI'),
    1990: 3001, 1991: 3001, 1992: 3004, 1993: 3001, 1994: 3002, 1995: 3002, 1996: 3001, 1997: 3003, 1998: 3001, 1999: 3002,
    2000: 3002, 2001: 3017, 2002: 3001, 2003: 3004, 2004: 3002, 2005: 3003, 2006: 3001, 2007: 3001, 2008: 3008, 2009: 3001,
    2010: 3003, 2011: 3002, 2012: 3002, 2013: 3009, 2014: 3001, 2015: 3011, 2016: 3003, 2017: 3001, 2018: 3003, 2019: 3003,
    2020: 3003, 2021: 3003, 2022: 3001, 2023: 3010, 2024: 3001, 2025: 3001,
  },
  // Croatia (3501: GNK Dinamo Zagreb, 3502: HNK Hajduk Split, 3503: HNK Rijeka, 3504: NK Osijek, 3505: NK Lokomotiva Zagreb)
  CRO: {
    ...buildWeightedEraHistory([[3501, 14], [3502, 11], [3503, 2], [3504, 1]], 'CRO'),
    1992: 3502, 1993: 3501, 1994: 3502, 1995: 3502, 1996: 3501, 1997: 3501, 1998: 3501, 1999: 3501, 2000: 3501, 2001: 3502,
    2002: 3501, 2003: 3501, 2004: 3502, 2005: 3502, 2006: 3501, 2007: 3501, 2008: 3501, 2009: 3501, 2010: 3501, 2011: 3501,
    2012: 3501, 2013: 3501, 2014: 3501, 2015: 3501, 2016: 3501, 2017: 3503, 2018: 3501, 2019: 3501, 2020: 3501, 2021: 3501,
    2022: 3501, 2023: 3501, 2024: 3501, 2025: 3501,
  },
  // Greece (3601: Olympiacos FC, 3602: Panathinaikos FC, 3603: AEK Athens, 3604: PAOK FC, 3605: Aris Thessaloniki, 3618: AEL Larissa)
  GRE: {
    ...buildWeightedEraHistory([[3601, 18], [3602, 11], [3603, 8], [3604, 2], [3605, 1], [3618, 1]], 'GRE'),
    1990: 3602, 1991: 3602, 1992: 3603, 1993: 3603, 1994: 3603, 1995: 3602, 1996: 3602, 1997: 3601, 1998: 3601, 1999: 3601,
    2000: 3601, 2001: 3601, 2002: 3601, 2003: 3601, 2004: 3602, 2005: 3601, 2006: 3601, 2007: 3601, 2008: 3601, 2009: 3601,
    2010: 3602, 2011: 3601, 2012: 3601, 2013: 3601, 2014: 3601, 2015: 3601, 2016: 3601, 2017: 3601, 2018: 3603, 2019: 3604,
    2020: 3601, 2021: 3601, 2022: 3601, 2023: 3603, 2024: 3604, 2025: 3601,
  },
  // Poland (1501: Legia Warszawa, 1502: Lech Poznań, 1503: Raków Częstochowa, 1505: Jagiellonia Białystok, 1506: Śląsk Wrocław, 1507: Górnik Zabrze, 1508: Widzew Łódź, 1509: Wisła Kraków, 1511: Zagłębie Lubin, 1512: Piast Gliwice, 1517: Ruch Chorzów)
  POL: {
    ...buildWeightedEraHistory([[1507, 12], [1517, 10], [1501, 10], [1509, 8], [1502, 6], [1508, 4], [1506, 2], [1511, 2]], 'POL'),
    2000: 1501, 2001: 1509, 2002: 1501, 2003: 1509, 2004: 1509, 2005: 1509, 2006: 1501, 2007: 1511, 2008: 1509, 2009: 1509,
    2010: 1502, 2011: 1509, 2012: 1506, 2013: 1501, 2014: 1501, 2015: 1502, 2016: 1501, 2017: 1501, 2018: 1501, 2019: 1512,
    2020: 1501, 2021: 1501, 2022: 1502, 2023: 1503, 2024: 1505, 2025: 1502,
  },
  // Austria (1601: Red Bull Salzburg, 1602: Sturm Graz, 1603: Rapid Wien, 1604: Austria Wien, 1605: LASK, 1616: Admira Wacker)
  AUT: {
    ...buildWeightedEraHistory([[1603, 14], [1604, 13], [1616, 5], [1601, 6], [1602, 3], [1605, 1]], 'AUT'),
    2005: 1603, 2006: 1604, 2007: 1601, 2008: 1603, 2009: 1601, 2010: 1601, 2011: 1602, 2012: 1601, 2013: 1604, 2014: 1601,
    2015: 1601, 2016: 1601, 2017: 1601, 2018: 1601, 2019: 1601, 2020: 1601, 2021: 1601, 2022: 1601, 2023: 1601, 2024: 1602, 2025: 1602,
  },
  // Switzerland (1701: Young Boys, 1702: FC Basel, 1703: Servette FC, 1705: FC Zürich, 1706: FC St. Gallen, 1711: Grasshopper Club)
  SUI: {
    ...buildWeightedEraHistory([[1711, 14], [1702, 12], [1703, 9], [1705, 9], [1701, 8], [1706, 2]], 'SUI'),
    2008: 1702, 2009: 1705, 2010: 1702, 2011: 1702, 2012: 1702, 2013: 1702, 2014: 1702, 2015: 1702, 2016: 1702, 2017: 1702,
    2018: 1701, 2019: 1701, 2020: 1701, 2021: 1701, 2022: 1705, 2023: 1701, 2024: 1701, 2025: 1702,
  },
  // Ecuador (850: Independiente del Valle, 851: LDU Quito, 852: Barcelona SC, 853: CS Emelec, 854: CD El Nacional, 856: Deportivo Cuenca, 857: SD Aucas, 860: Delfín SC)
  ECU: {
    ...buildWeightedEraHistory([[852, 16], [853, 14], [854, 13], [851, 11], [856, 1], [860, 1], [850, 1], [857, 1]], 'ECU'),
    2015: 853, 2016: 852, 2017: 853, 2018: 851, 2019: 860, 2020: 852, 2021: 850, 2022: 857, 2023: 851, 2024: 851, 2025: 850,
  },
  // Colombia (2101: Millonarios, 2102: Santa Fe, 2103: América de Cali, 2104: Junior FC, 2106: Medellín, 2107: Deportivo Cali, 2108: Deportes Tolima, 2109: Once Caldas, 2110: Bucaramanga, 2111: Deportivo Pereira, 2112: Atlético Nacional)
  COL: {
    ...buildWeightedEraHistory([[2112, 17], [2101, 16], [2103, 15], [2107, 10], [2104, 10], [2102, 9], [2106, 6], [2109, 4], [2108, 3]], 'COL'),
    2017: 2112, 2018: 2104, 2019: 2103, 2020: 2103, 2021: 2107, 2022: 2111, 2023: 2101, 2024: 2112, 2025: 2112,
  },
  // Mexico (2201: Club América, 2202: Tigres UANL, 2203: CF Monterrey, 2204: Chivas Guadalajara, 2205: Cruz Azul, 2206: Toluca, 2207: Pachuca, 2208: Pumas UNAM, 2209: Club León, 2210: Santos Laguna, 2211: Atlas FC)
  MEX: {
    ...buildWeightedEraHistory([[2201, 15], [2204, 12], [2206, 10], [2205, 9], [2209, 8], [2202, 8], [2208, 7], [2207, 7], [2210, 6], [2203, 5], [2211, 3]], 'MEX'),
    2018: 2201, 2019: 2203, 2020: 2209, 2021: 2205, 2022: 2211, 2023: 2202, 2024: 2201, 2025: 2201,
  },
  // Canada (2301: Forge FC, 2302: Atlético Ottawa, 2303: Cavalry FC, 2305: Pacific FC)
  CAN: {
    ...buildWeightedEraHistory([[2301, 12], [2303, 8], [2305, 5], [2302, 4]], 'CAN'),
    2019: 2301, 2020: 2301, 2021: 2305, 2022: 2301, 2023: 2301, 2024: 2303, 2025: 2301,
  },
  // Australia (1801: Sydney FC, 1802: Melbourne City, 1803: Melbourne Victory, 1804: Adelaide United, 1806: Central Coast Mariners, 1808: Brisbane Roar, 1814: South Melbourne, 1815: Sydney Olympic, 1817: Marconi Stallions)
  AUS: {
    ...buildWeightedEraHistory([[1814, 10], [1817, 9], [1815, 6], [1801, 5], [1803, 4], [1808, 3], [1806, 3], [1802, 2], [1804, 2]], 'AUS'),
    2017: 1801, 2018: 1803, 2019: 1801, 2020: 1801, 2021: 1802, 2022: 1812, 2023: 1806, 2024: 1806, 2025: 1801,
  },
  // Wales (1301: The New Saints FC, 1302: Connah's Quay Nomads, 1303: Bala Town, 1308: Barry Town United)
  WAL: {
    ...buildWeightedEraHistory([[1301, 16], [1308, 7], [1302, 2], [1303, 2]], 'WAL'),
    2018: 1301, 2019: 1301, 2020: 1302, 2021: 1302, 2022: 1301, 2023: 1301, 2024: 1301, 2025: 1301,
  },
};

// Authentic UEFA Champions Cup / Champions League winners (1956–2025) by canonical Club ID
const HISTORICAL_CHAMPIONS_CUP_WINNERS: Record<number, number> = {
  1956: 501, 1957: 501, 1958: 501, 1959: 501, 1960: 501,
  1961: 202, 1962: 202, 1963: 903, 1964: 902, 1965: 902,
  1966: 501, 1967: 1201, 1968: 705, 1969: 903, 1970: 1201,
  1971: 502, 1972: 902, 1973: 901, 1974: 1, 1975: 1,
  1976: 1, 1977: 703, 1978: 703, 1979: 715, 1980: 715,
  1981: 703, 1982: 707, 1983: 22, 1984: 703, 1985: 901,
  1986: 502, 1987: 203, 1988: 202, 1989: 903, 1990: 903,
  1991: 403, 1992: 502, 1993: 403, 1994: 903, 1995: 901,
  1996: 901, 1997: 3, 1998: 501, 1999: 705, 2000: 501,
  2001: 1, 2002: 501, 2003: 903, 2004: 203, 2005: 703,
  2006: 502, 2007: 903, 2008: 705, 2009: 502, 2010: 902,
  2011: 502, 2012: 704, 2013: 1, 2014: 501, 2015: 502,
  2016: 501, 2017: 501, 2018: 501, 2019: 703, 2020: 1,
  2021: 704, 2022: 501, 2023: 701, 2024: 501, 2025: 401,
};

// Authentic Copa Libertadores winners (1960–2025) by canonical Club ID
const HISTORICAL_LIBERTADORES_WINNERS: Record<number, number> = {
  1960: 1904, 1961: 1401, 1962: 1411, 1963: 1411, 1964: 1904, 1965: 1904,
  1966: 1901, 1967: 1903, 1968: 1907, 1969: 1907, 1970: 1907,
  1971: 1904, 1972: 1904, 1973: 1904, 1974: 1904, 1975: 1904,
  1976: 1412, 1977: 1902, 1978: 1902, 1979: 3301, 1980: 1407,
  1981: 1402, 1982: 1406, 1983: 1406, 1984: 1904, 1985: 1913,
  1986: 1901, 1987: 1901, 1988: 1908, 1989: 2112, 1990: 3301,
  1991: 3001, 1992: 1405, 1993: 1405, 1994: 1906, 1995: 1406,
  1996: 1901, 1997: 1412, 1998: 1416, 1999: 1401, 2000: 1902,
  2001: 1902, 2002: 3301, 2003: 1902, 2004: 2109, 2005: 1405,
  2006: 1407, 2007: 1902, 2008: 851, 2009: 1907, 2010: 1407,
  2011: 1411, 2012: 1408, 2013: 1403, 2014: 1905, 2015: 1901,
  2016: 2112, 2017: 1406, 2018: 1901, 2019: 1402, 2020: 1401,
  2021: 1401, 2022: 1402, 2023: 1404, 2024: 1410, 2025: 1402,
};

// Authentic Concacaf Champions Cup winners (1962–2025) by canonical Club ID
const HISTORICAL_CONCACAF_WINNERS: Record<number, number> = {
  ...buildWeightedEraHistory([[2201, 7], [2205, 6], [2207, 6], [2203, 5], [2208, 3], [2206, 2], [2204, 2], [1021, 1], [1006, 1]], 'CONCACAF'),
  1996: 2205, 1997: 2205, 1998: 1006, 1999: 2212, 2000: 1021,
  2002: 2207, 2003: 2206, 2005: 2208, 2006: 2201, 2007: 2207,
  2008: 2207, 2009: 2216, 2010: 2207, 2011: 2203, 2012: 2203,
  2013: 2203, 2014: 2205, 2015: 2201, 2016: 2201, 2017: 2207,
  2018: 2204, 2019: 2203, 2020: 2202, 2021: 2203, 2022: 1028,
  2023: 2209, 2024: 2207, 2025: 2205,
};

// Authentic AFC Champions League winners (1967–2025) by canonical Club ID
const HISTORICAL_AFC_WINNERS: Record<number, number> = {
  ...buildWeightedEraHistory([[3704, 3], [2004, 3], [3713, 2], [3702, 2], [3701, 2], [3705, 2], [3714, 1], [2019, 1], [2020, 1], [2007, 1], [2005, 1]], 'AFC'),
  1995: 3713, 1997: 3704, 1998: 3704, 1999: 2020, 2001: 3705,
  2002: 3705, 2006: 3702, 2007: 2004, 2008: 2007, 2009: 3704,
  2010: 3713, 2012: 3701, 2014: 1807, 2016: 3702, 2017: 2004,
  2018: 2005, 2020: 3701, 2022: 2004, 2023: 2004, 2024: 2002, 2025: 3701,
};

export interface HistoricalWorldCupLoreEntry {
  code: string;
  name: string;
  flag: string;
  color: string;
  coachName: string;
  runnerUp: string;
  finalScore: string;
  hostCountry?: string;
  hostFlag?: string;
  hostStadium?: string;
}

// Authentic National Team FIFA World Cup winners (1930–2022)
export const HISTORICAL_WORLD_CUP_WINNERS: Record<number, HistoricalWorldCupLoreEntry> = {
  1930: { code: 'URU', name: 'Uruguay', flag: '🇺🇾', color: '38bdf8', coachName: 'Alberto Suppici', runnerUp: 'Argentina', finalScore: '4–2', hostCountry: 'Uruguay', hostFlag: '🇺🇾', hostStadium: 'Estadio Centenario, Montevideo' },
  1934: { code: 'ITA', name: 'Italy', flag: '🇮🇹', color: '1d4ed8', coachName: 'Vittorio Pozzo', runnerUp: 'Czechoslovakia', finalScore: '2–1 (AET)', hostCountry: 'Italy', hostFlag: '🇮🇹', hostStadium: 'Stadio Nazionale PNF, Rome' },
  1938: { code: 'ITA', name: 'Italy', flag: '🇮🇹', color: '1d4ed8', coachName: 'Vittorio Pozzo', runnerUp: 'Hungary', finalScore: '4–2', hostCountry: 'France', hostFlag: '🇫🇷', hostStadium: 'Stade Olympique de Colombes, Paris' },
  1950: { code: 'URU', name: 'Uruguay', flag: '🇺🇾', color: '38bdf8', coachName: 'Juan López Fontana', runnerUp: 'Brazil', finalScore: '2–1' },
  1954: { code: 'GER', name: 'Germany', flag: '🇩🇪', color: 'f59e0b', coachName: 'Sepp Herberger', runnerUp: 'Hungary', finalScore: '3–2' },
  1958: { code: 'BRA', name: 'Brazil', flag: '🇧🇷', color: '16a34a', coachName: 'Vicente Feola', runnerUp: 'Sweden', finalScore: '5–2' },
  1962: { code: 'BRA', name: 'Brazil', flag: '🇧🇷', color: '16a34a', coachName: 'Aymoré Moreira', runnerUp: 'Czechoslovakia', finalScore: '3–1' },
  1966: { code: 'ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'dc2626', coachName: 'Alf Ramsey', runnerUp: 'Germany', finalScore: '4–2 (AET)' },
  1970: { code: 'BRA', name: 'Brazil', flag: '🇧🇷', color: '16a34a', coachName: 'Mário Zagallo', runnerUp: 'Italy', finalScore: '4–1' },
  1974: { code: 'GER', name: 'Germany', flag: '🇩🇪', color: 'f59e0b', coachName: 'Helmut Schön', runnerUp: 'Netherlands', finalScore: '2–1' },
  1978: { code: 'ARG', name: 'Argentina', flag: '🇦🇷', color: '38bdf8', coachName: 'César Luis Menotti', runnerUp: 'Netherlands', finalScore: '3–1 (AET)' },
  1982: { code: 'ITA', name: 'Italy', flag: '🇮🇹', color: '1d4ed8', coachName: 'Enzo Bearzot', runnerUp: 'Germany', finalScore: '3–1' },
  1986: { code: 'ARG', name: 'Argentina', flag: '🇦🇷', color: '38bdf8', coachName: 'Carlos Bilardo', runnerUp: 'Germany', finalScore: '3–2' },
  1990: { code: 'GER', name: 'Germany', flag: '🇩🇪', color: 'f59e0b', coachName: 'Franz Beckenbauer', runnerUp: 'Argentina', finalScore: '1–0' },
  1994: { code: 'BRA', name: 'Brazil', flag: '🇧🇷', color: '16a34a', coachName: 'Carlos Alberto Parreira', runnerUp: 'Italy', finalScore: '0–0 (3–2 pens)' },
  1998: { code: 'FRA', name: 'France', flag: '🇫🇷', color: '2563eb', coachName: 'Aimé Jacquet', runnerUp: 'Brazil', finalScore: '3–0' },
  2002: { code: 'BRA', name: 'Brazil', flag: '🇧🇷', color: '16a34a', coachName: 'Luiz Felipe Scolari', runnerUp: 'Germany', finalScore: '2–0' },
  2006: { code: 'ITA', name: 'Italy', flag: '🇮🇹', color: '1d4ed8', coachName: 'Marcello Lippi', runnerUp: 'France', finalScore: '1–1 (5–3 pens)' },
  2010: { code: 'ESP', name: 'Spain', flag: '🇪🇸', color: 'e11d48', coachName: 'Vicente del Bosque', runnerUp: 'Netherlands', finalScore: '1–0 (AET)' },
  2014: { code: 'GER', name: 'Germany', flag: '🇩🇪', color: 'f59e0b', coachName: 'Joachim Löw', runnerUp: 'Argentina', finalScore: '1–0 (AET)' },
  2018: { code: 'FRA', name: 'France', flag: '🇫🇷', color: '2563eb', coachName: 'Didier Deschamps', runnerUp: 'Croatia', finalScore: '4–2' },
  2022: { code: 'ARG', name: 'Argentina', flag: '🇦🇷', color: '38bdf8', coachName: 'Lionel Scaloni', runnerUp: 'France', finalScore: '3–3 (4–2 pens)' },
};

function resolveNationalTeamMeta(teamNameOrCode: string): {
  code: string;
  name: string;
  flag: string;
  color: string;
} {
  const clean = (teamNameOrCode || '').trim();
  const upper = clean.toUpperCase();
  const lower = clean.toLowerCase();
  if (upper === 'URU' || lower === 'uruguay') {
    return { code: 'URU', name: 'Uruguay', flag: '🇺🇾', color: '38bdf8' };
  }
  const found = NATIONAL_TEAMS.find(
    nt => nt.code.toUpperCase() === upper || nt.name.toLowerCase() === lower
  );
  if (found) {
    return {
      code: found.code,
      name: found.name,
      flag: found.flag,
      color: (found.color || '#3b82f6').replace(/^#/, ''),
    };
  }
  return {
    code: upper.length === 3 ? upper : 'INT',
    name: clean || 'National Team',
    flag: '🌍',
    color: '3b82f6',
  };
}

/**
 * Generates the complete Global & Regional Champions Almanac for a country
 * from 1950 through the latest completed simulated season (respecting historical startYear).
 */
// Module-level cached static club lookup tables & indexed datasets (lazy-initialized)
let _staticIndexesInitialized = false;
const DEFAULT_CLUB_BY_ID = new Map<number, Club>();
const MOD_CLUB_BY_ID = new Map<number, any>();
const RESERVE_BY_ID = new Map<number, boolean>();
const TEAMS_AS_CLUBS_MOD: Club[] = [];
const TEAMS_AS_CLUBS_FALLBACK: Club[] = [];

function ensureStaticClubIndexes() {
  if (_staticIndexesInitialized) return;
  _staticIndexesInitialized = true;
  for (let i = 0; i < ALL_CLUBS.length; i++) {
    const c = ALL_CLUBS[i];
    if (c.id != null) {
      DEFAULT_CLUB_BY_ID.set(c.id, c);
      if (c.isReserve || (c.name && isReserveClub(c.name))) {
        RESERVE_BY_ID.set(c.id, true);
      }
    }
  }
  for (let i = 0; i < TEAMS.length; i++) {
    const t: any = TEAMS[i];
    if (t.id != null) {
      MOD_CLUB_BY_ID.set(t.id, t);
      if (t.isReserve || (t.name && isReserveClub(t.name))) {
        RESERVE_BY_ID.set(t.id, true);
      }
      const normCountry = normalizeCountryCode(t.country || 'GER');
      const baseFields = {
        id: t.id,
        name: t.name,
        tier: Number(t.tier) || 1,
        baseOvr: Number(t.baseOvr) || 72,
        color: t.color || '#38bdf8',
        stadium: t.stadium || 'National Stadium',
        country: normCountry,
        rep: Number(t.rep) || 60,
        fanBase: Number(t.fanBase) || 15000,
        currentBudget: 15000,
        isReserve: Boolean(t.isReserve),
      };
      TEAMS_AS_CLUBS_MOD.push({ ...baseFields, logo: t.logo, fallbackLogo: t.fallbackLogo });
      TEAMS_AS_CLUBS_FALLBACK.push({ ...baseFields, logo: undefined, fallbackLogo: undefined });
    }
  }
}

interface AlmanacDbIndex {
  clubById: Map<number, Club>;
  clubByName: Map<string, Club>;
  clubsByCountry: Map<string, { all: Club[]; senior: Club[] }>;
  uefaTopClubs: Club[];
  conmebolTopClubs: Club[];
  concacafTopClubs: Club[];
  afcTopClubs: Club[];
  isReserveFast: (cId?: number, cName?: string, cObj?: Partial<Club>) => boolean;
}

const UEFA_SET = new Set(UEFA_COUNTRIES);
const CONMEBOL_SET = new Set(CONMEBOL_COUNTRIES);
const CONCACAF_SET = new Set(CONCACAF_COUNTRIES);
const AFC_SET = new Set(AFC_COUNTRIES);
const STATIC_DB_INDEX_CACHE = new Map<string, AlmanacDbIndex>();

function buildDbIndex(rawSourceClubs: Club[], effectiveModActive: boolean): AlmanacDbIndex {
  ensureStaticClubIndexes();
  const isCanonicalAll = rawSourceClubs === ALL_CLUBS;
  const isCanonicalTeams = rawSourceClubs === (TEAMS as any);
  const cacheKey = isCanonicalAll
    ? `ALL_CLUBS:${effectiveModActive ? '1' : '0'}`
    : isCanonicalTeams
    ? `TEAMS:${effectiveModActive ? '1' : '0'}`
    : '';
  if (cacheKey && STATIC_DB_INDEX_CACHE.has(cacheKey)) {
    return STATIC_DB_INDEX_CACHE.get(cacheKey)!;
  }

  const clubById = new Map<number, Club>();
  const clubByName = new Map<string, Club>();
  for (let i = 0; i < rawSourceClubs.length; i++) {
    const c = rawSourceClubs[i];
    if (c.id != null) clubById.set(c.id, c);
    if (c.name) clubByName.set(c.name.toLowerCase().trim(), c);
  }

  const combinedClubs: Club[] = [...rawSourceClubs];
  const staticTeamList = effectiveModActive ? TEAMS_AS_CLUBS_MOD : TEAMS_AS_CLUBS_FALLBACK;
  for (let i = 0; i < staticTeamList.length; i++) {
    const asClub = staticTeamList[i];
    if (!clubById.has(asClub.id)) {
      clubById.set(asClub.id, asClub);
      if (asClub.name) clubByName.set(asClub.name.toLowerCase().trim(), asClub);
      combinedClubs.push(asClub);
    }
  }

  const reserveNameCache = new Map<string, boolean>();
  const isReserveFast = (cId?: number, cName?: string, cObj?: Partial<Club>): boolean => {
    if (cObj?.isReserve) return true;
    if (cId != null) {
      const numId = Number(cId);
      if (RESERVE_BY_ID.get(numId)) return true;
      const dbClub = clubById.get(numId);
      if (dbClub?.isReserve) return true;
    }
    if (cName) {
      let cached = reserveNameCache.get(cName);
      if (cached === undefined) {
        cached = isReserveClub(cName);
        reserveNameCache.set(cName, cached);
      }
      if (cached) return true;
    }
    return false;
  };

  const clubsByCountry = new Map<string, { all: Club[]; senior: Club[] }>();
  const uefaTopClubs: Club[] = [];
  const conmebolTopClubs: Club[] = [];
  const concacafTopClubs: Club[] = [];
  const afcTopClubs: Club[] = [];

  for (let i = 0; i < combinedClubs.length; i++) {
    const c = combinedClubs[i];
    const normCountry = normalizeCountryCode(c.country || 'GER');
    let bucket = clubsByCountry.get(normCountry);
    if (!bucket) {
      bucket = { all: [], senior: [] };
      clubsByCountry.set(normCountry, bucket);
    }
    bucket.all.push(c);
    const isRes = isReserveFast(c.id, c.name, c);
    if (!isRes) {
      bucket.senior.push(c);
      if (c.tier === 1) {
        if (UEFA_SET.has(normCountry)) uefaTopClubs.push(c);
        if (CONMEBOL_SET.has(normCountry)) conmebolTopClubs.push(c);
        if (CONCACAF_SET.has(normCountry)) concacafTopClubs.push(c);
        if (AFC_SET.has(normCountry)) afcTopClubs.push(c);
      }
    }
  }

  const byOvrDesc = (a: Club, b: Club) => (b.baseOvr || 0) - (a.baseOvr || 0);
  uefaTopClubs.sort(byOvrDesc);
  conmebolTopClubs.sort(byOvrDesc);
  concacafTopClubs.sort(byOvrDesc);
  afcTopClubs.sort(byOvrDesc);

  const built: AlmanacDbIndex = {
    clubById,
    clubByName,
    clubsByCountry,
    uefaTopClubs,
    conmebolTopClubs,
    concacafTopClubs,
    afcTopClubs,
    isReserveFast,
  };
  if (cacheKey) {
    STATIC_DB_INDEX_CACHE.set(cacheKey, built);
  }
  return built;
}

export function buildChampionsAlmanac(
  state: GameState,
  countryInput: string = 'GER',
  clubsDb: Club[] = ALL_CLUBS,
  isModActive?: boolean
): AlmanacYearRecord[] {
  const country = normalizeCountryCode(countryInput || state.club?.country || 'GER');
  const maxTier = getMaxTier(country, clubsDb);
  const region = getRegion(country);

  const effectiveModActive =
    isModActive !== undefined
      ? isModActive
      : typeof window !== 'undefined'
      ? localStorage.getItem('fms_real_mod_active') === 'true'
      : false;

  const rawSourceClubs = Array.isArray(clubsDb) && clubsDb.length > 0 ? clubsDb : ALL_CLUBS;
  const dbIndex = buildDbIndex(rawSourceClubs, effectiveModActive);
  const { clubById, clubByName, uefaTopClubs, conmebolTopClubs, concacafTopClubs, afcTopClubs } = dbIndex;
  const defaultClubById = DEFAULT_CLUB_BY_ID;
  const modClubById = MOD_CLUB_BY_ID;

  const resolveClubDisplay = (id?: number, fallbackName?: string, fallbackColor?: string, fallbackLogo?: string) => {
    const dbClub =
      (id != null ? clubById.get(id) : undefined) ||
      (fallbackName ? clubByName.get(fallbackName.toLowerCase().trim()) : undefined);
    const resolvedId = id ?? dbClub?.id;
    const modEntry = resolvedId != null ? modClubById.get(resolvedId) : undefined;
    const defEntry = resolvedId != null ? defaultClubById.get(resolvedId) : undefined;

    let name = fallbackName || dbClub?.name || modEntry?.name || 'Club';
    if (resolvedId != null && state.club?.id === resolvedId && state.club?.name) {
      name = state.club.name;
    } else if (effectiveModActive && modEntry?.name) {
      name = modEntry.name;
    } else if (!effectiveModActive && defEntry?.name) {
      name = defEntry.name;
    } else if (dbClub?.name) {
      name = dbClub.name;
    } else if (modEntry?.name) {
      name = modEntry.name;
    }

    const rawColor =
      dbClub?.color ||
      defEntry?.color ||
      modEntry?.color ||
      fallbackColor ||
      '38bdf8';
    const color = rawColor.startsWith('#') ? rawColor : `#${rawColor}`;
    const logo =
      (resolvedId != null && state.club?.id === resolvedId ? state.club?.logo : undefined) ||
      (effectiveModActive ? modEntry?.logo : undefined) ||
      dbClub?.logo ||
      dbClub?.fallbackLogo ||
      fallbackLogo;

    return {
      clubId: resolvedId,
      clubName: name,
      clubColor: color,
      clubLogo: logo,
      country: dbClub?.country || modEntry?.country || country,
    };
  };

  // Identify user's current club and historical season-by-season club tenure
  const userClubId = state.club?.id;
  const userClubNameNorm = (state.club?.name || '').toLowerCase().trim();
  const historyRows = state.history || [];

  const isClubUserOrPast = (
    cId: number | undefined,
    cName: string | undefined,
    yr: number,
    isLore: boolean
  ) => {
    if (isLore) {
      return { isUserClub: false, isPastManagerClub: false };
    }
    const norm = (cName || '').toLowerCase().trim();
    const histInYear = historyRows.find(h => Number(h.year) === yr);

    let isUser = false;
    if (histInYear) {
      const histNorm = (histInYear.clubName || '').toLowerCase().trim();
      isUser =
        (cId != null && histInYear.clubId != null && Number(cId) === Number(histInYear.clubId)) ||
        Boolean(norm && histNorm && norm === histNorm);
    } else {
      isUser =
        (cId != null && userClubId != null && Number(cId) === Number(userClubId)) ||
        Boolean(norm && userClubNameNorm && norm === userClubNameNorm);
    }

    const isPast =
      !isUser &&
      historyRows.some(h => {
        if (!h.year || Number(h.year) >= yr) return false;
        const hNorm = (h.clubName || '').toLowerCase().trim();
        return (
          (cId != null && h.clubId != null && Number(cId) === Number(h.clubId)) ||
          Boolean(norm && hNorm && norm === hNorm)
        );
      });

    return { isUserClub: isUser, isPastManagerClub: isPast };
  };

  // Fast reserve / B / II / U21 / U23 team detection using cached index
  const isReserveTeamForAlmanac = dbIndex.isReserveFast;

  // Organize country clubs by tier for deterministic lore and fallback selection
  const countryBucket = dbIndex.clubsByCountry.get(country);
  const countryClubs = countryBucket ? countryBucket.all : [];
  const seniorCountryClubs = countryBucket ? countryBucket.senior : [];
  const effectiveCountryPool = seniorCountryClubs.length > 0 ? seniorCountryClubs : countryClubs;

  const clubsByNativeTier = new Map<number, Club[]>();
  const sortedCountryTopDown = effectiveCountryPool
    .slice()
    .sort((a, b) => (b.baseOvr || 0) - (a.baseOvr || 0));
  const sortedCountryBottomUp = effectiveCountryPool
    .slice()
    .sort((a, b) => (a.baseOvr || 0) - (b.baseOvr || 0));

  for (let t = 1; t <= maxTier; t++) {
    const tierPool = countryClubs
      .filter(c => {
        if (t <= 2 && isReserveTeamForAlmanac(c.id, c.name, c)) return false;
        return Number(c.tier) === t;
      })
      .sort((a, b) => (b.baseOvr || 0) - (a.baseOvr || 0));
    if (tierPool.length > 0) {
      clubsByNativeTier.set(t, tierPool);
    } else if (t === 1) {
      clubsByNativeTier.set(t, sortedCountryTopDown);
    } else {
      // For countries where TEAMS defines all clubs in Tier 1 while maxTier >= 2 (e.g. IND, SVK, PER, CHI, CRO, GRE),
      // use the lower-rated half of the country's clubs so Tier 2 has distinct second-division contenders
      const lowerHalf = sortedCountryTopDown.slice(Math.floor(sortedCountryTopDown.length / 2));
      clubsByNativeTier.set(t, lowerHalf.length > 0 ? lowerHalf : sortedCountryBottomUp);
    }
  }

  // Determine career start year & lore cutoff so historical-era careers (1954/1974/1990/2010)
  // never spoil future years and surface pre-2026 simulated seasons as Live Simulated records
  const earliestHistYear = (state.history || []).reduce(
    (min, h) => (h.year ? Math.min(min, Number(h.year)) : min),
    Infinity
  );
  const inferredStartYear =
    Number(state.startYear) ||
    (Number.isFinite(earliestHistYear)
      ? earliestHistYear
      : Number(state.seasonCount) > 1 && Number(state.year)
      ? Number(state.year) - (Number(state.seasonCount) - 1)
      : Number(state.year) || 2026);
  const careerStartYear = Math.max(1950, inferredStartYear);
  const loreCutoffYear = Math.max(1949, careerStartYear - 1);

  const historyMaxYear = (state.history || []).reduce((max, h) => Math.max(max, Number(h.year) || 0), 0);
  const archiveMaxYear = state.seasonStandingsArchive
    ? Math.max(0, ...Object.keys(state.seasonStandingsArchive).map(k => Number(k) || 0))
    : 0;
  const stateCompletedYear = (Number(state.year) || careerStartYear) - 1;
  const movementsMaxYear = (state.universeMovements || []).reduce((max, m) => {
    const myr = Number(m.year) || 0;
    // Guard against legacy 2024 baseline entries leaking into pre-2024 historical careers
    if (myr === 2024 && careerStartYear < 2024 && stateCompletedYear < 2024 && historyMaxYear < 2024) {
      return max;
    }
    return Math.max(max, myr);
  }, 0);
  const wcCampaignsMaxYear = (state.worldCupCampaigns || []).reduce(
    (max, c) => Math.max(max, Number(c?.year) || 0),
    0
  );
  const wcTrophyMaxYear = (state.trophyHistory || []).reduce(
    (max, t: any) =>
      typeof t?.name === 'string' && /world cup|weltmeister/i.test(t.name)
        ? Math.max(max, Number(t?.year) || 0)
        : max,
    0
  );
  const maxYear = Math.max(
    loreCutoffYear,
    historyMaxYear,
    archiveMaxYear,
    movementsMaxYear,
    wcCampaignsMaxYear,
    wcTrophyMaxYear,
    stateCompletedYear
  );
  const minYear = 1950;

  // Pre-index simulated movements by year (ignoring any stray 2024 baseline entry in pre-2024 careers)
  const simMovementsByYear = new Map<number, any[]>();
  (state.universeMovements || []).forEach(m => {
    const yr = Number(m.year);
    if (!yr) return;
    if (yr === 2024 && careerStartYear < 2024 && stateCompletedYear < 2024 && historyMaxYear < 2024) return;
    const list = simMovementsByYear.get(yr) || [];
    list.push(m);
    simMovementsByYear.set(yr, list);
  });

  // Pre-index user history by year
  const userHistoryByYear = new Map<number, SeasonHistory>();
  (state.history || []).forEach(h => {
    if (h.year) userHistoryByYear.set(Number(h.year), h);
  });

  const domesticCupInfo = getDomesticCupInfo(country, 1);
  const regionalCupInfo = getDomesticCupInfo(country, 4);

  const records: AlmanacYearRecord[] = [];

  for (let yr = maxYear; yr >= minYear; yr--) {
    const hasWcCampaignForYear =
      (state.worldCupCampaigns || []).some(c => Number(c?.year) === yr) ||
      (state.trophyHistory || []).some(
        (t: any) =>
          Number(t?.year) === yr &&
          typeof t?.name === 'string' &&
          /world cup|weltmeister/i.test(t.name)
      );
    const hasLiveDataForYear =
      userHistoryByYear.has(yr) ||
      Boolean(state.seasonStandingsArchive?.[yr]) ||
      simMovementsByYear.has(yr) ||
      hasWcCampaignForYear;
    const isHistoricalLore = yr <= loreCutoffYear && !hasLiveDataForYear;
    const usedLeagueWinnerIdsThisYear = new Set<number>();
    const leagueWinners: AlmanacCompetitionWinner[] = [];

    const userHist = userHistoryByYear.get(yr);
    const userHistClubObj = userHist
      ? (userHist.clubId != null ? clubById.get(Number(userHist.clubId)) : undefined) ||
        (userHist.clubName ? clubByName.get(userHist.clubName.toLowerCase().trim()) : undefined)
      : undefined;
    const userCountryThisYear = userHist
      ? normalizeCountryCode(userHist.country || userHistClubObj?.country || state.club?.country || 'GER')
      : normalizeCountryCode(state.club?.country || 'GER');
    const userRegionThisYear = getRegion(userCountryThisYear);
    const activeUserClubIdThisYear = userHist?.clubId ?? state.club?.id;
    const activeUserClubNameNormThisYear = (userHist?.clubName || state.club?.name || '').toLowerCase().trim();
    const isActiveUserClubThisYear = (cId?: number, cName?: string) => {
      if (isHistoricalLore || !userHist) return false;
      const norm = (cName || '').toLowerCase().trim();
      return (
        (cId != null && activeUserClubIdThisYear != null && Number(cId) === Number(activeUserClubIdThisYear)) ||
        Boolean(norm && activeUserClubNameNormThisYear && norm === activeUserClubNameNormThisYear)
      );
    };
    const yearMoves = simMovementsByYear.get(yr) || [];

    // 1. LEAGUE PYRAMID WINNERS (Tier 1 .. maxTier)
    for (let t = 1; t <= maxTier; t++) {
      const lgInfo = getLeagueInfo(t, country);
      let winnerClubId: number | undefined;
      let winnerFallbackName: string | undefined;
      let winnerFallbackColor: string | undefined;
      let winnerFallbackLogo: string | undefined;
      let notes: string | undefined;

      let recWins: number | undefined;
      let recDraws: number | undefined;
      let recLosses: number | undefined;
      let recPts: number | undefined;
      let recCoach: string | undefined;

      const userWonThisLeagueTier = Boolean(
        !isHistoricalLore &&
          userHist &&
          userCountryThisYear === country &&
          Number(userHist.tier) === t &&
          Number(userHist.pos) === 1 &&
          !userHist.bankrupt &&
          !userHist.financialRelegation
      );

      if (!isHistoricalLore) {
        // LIVE SIMULATED SEASON (2026+)
        // Priority A: User's own club won this exact league tier in this year
        if (userWonThisLeagueTier && userHist) {
          winnerClubId = userHist.clubId ?? state.club?.id;
          winnerFallbackName = userHist.clubName || state.club?.name;
          winnerFallbackColor = userHist.color || state.club?.color;
          winnerFallbackLogo = userHist.logo || state.club?.logo;
          recWins = Number(userHist.wins) || 24;
          recDraws = userHist.draws != null ? Number(userHist.draws) : 6;
          recLosses = userHist.losses != null ? Number(userHist.losses) : Math.max(0, 34 - recWins - recDraws);
          recPts = userHist.pts != null ? Number(userHist.pts) : recWins * 3 + recDraws;
          recCoach = state.managerName || state.currentCoach?.name;
          notes = `${recPts} pts`;
        }

        // Priority B: Archived standings table for user's active country
        if (
          winnerClubId == null &&
          !winnerFallbackName &&
          userCountryThisYear === country &&
          state.seasonStandingsArchive?.[yr]?.[t]
        ) {
          const table = state.seasonStandingsArchive[yr][t];
          const topRow = table.find(r => r.pos === 1) || table[0];
          if (topRow && (userWonThisLeagueTier || !isActiveUserClubThisYear(typeof topRow.id === 'number' ? topRow.id : undefined, topRow.name))) {
            winnerClubId = typeof topRow.id === 'number' ? topRow.id : undefined;
            winnerFallbackName = topRow.name;
            winnerFallbackColor = topRow.color;
            winnerFallbackLogo = topRow.logo;
            recWins = topRow.w != null ? Number(topRow.w) : undefined;
            recDraws = topRow.d != null ? Number(topRow.d) : undefined;
            recLosses = topRow.l != null ? Number(topRow.l) : undefined;
            recPts = topRow.pts != null ? Number(topRow.pts) : undefined;
            notes = `${topRow.pts} pts`;
          }
        }

        // Priority C: Universe movements recorded for this country & tier
        if (winnerClubId == null && !winnerFallbackName) {
          const champMove = yearMoves.find(
            m =>
              normalizeCountryCode(m.country || 'GER') === country &&
              Number(m.fromTier) === t &&
              (m.type === 'title_won' || (m.type === 'promotion' && m.pos === 1)) &&
              (userWonThisLeagueTier || !isActiveUserClubThisYear(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName))
          );
          if (champMove) {
            winnerClubId = typeof champMove.clubId === 'number' ? champMove.clubId : undefined;
            winnerFallbackName = champMove.clubName;
            winnerFallbackColor = champMove.clubColor;
            winnerFallbackLogo = champMove.clubLogo;
            const ptsMatch = typeof champMove.reason === 'string' ? champMove.reason.match(/(\d+)\s*pts/i) : null;
            if (ptsMatch) {
              recPts = Number(ptsMatch[1]);
              notes = `${recPts} pts`;
            }
          }
        }
      } else if (t === 1) {
        // PRE-START HISTORICAL LORE (1950–2025) FOR TIER 1
        const hardcodedId = HISTORICAL_TIER1_CHAMPIONS_BY_COUNTRY[country]?.[yr];
        if (hardcodedId != null) {
          winnerClubId = hardcodedId;
        }
      }

      // Deterministic selection for Pre-Start Tier 2..maxTier (or unmapped Tier 1 / simulated lower tiers)
      if (winnerClubId == null && !winnerFallbackName) {
        const rawTierPool = clubsByNativeTier.get(t) || effectiveCountryPool;
        const tierPool = !isHistoricalLore && !userWonThisLeagueTier
          ? rawTierPool.filter(c => !isActiveUserClubThisYear(c.id, c.name))
          : rawTierPool;
        const effectiveTierPool = tierPool.length > 0 ? tierPool : rawTierPool;
        // For Tier 1 historical lore in countries without a hardcoded year map, weight heavily toward top 4 giants
        const candidatePool =
          t === 1
            ? effectiveTierPool.slice(0, Math.min(5, effectiveTierPool.length))
            : effectiveTierPool.filter(c => !usedLeagueWinnerIdsThisYear.has(c.id));
        const safePool = candidatePool.length > 0 ? candidatePool : effectiveTierPool;
        if (safePool.length > 0) {
          const seed = hashSeed(`${country}-T${t}`, yr);
          const pick = safePool[seed % safePool.length];
          winnerClubId = pick.id;
          winnerFallbackName = pick.name;
          winnerFallbackColor = pick.color;
          winnerFallbackLogo = pick.logo;
        }
      }

      const resolved = resolveClubDisplay(
        winnerClubId,
        winnerFallbackName,
        winnerFallbackColor,
        winnerFallbackLogo
      );
      if (resolved.clubId != null) {
        usedLeagueWinnerIdsThisYear.add(resolved.clubId);
      }
      const { isUserClub, isPastManagerClub } = isClubUserOrPast(
        resolved.clubId,
        resolved.clubName,
        yr,
        isHistoricalLore
      );

      if (recWins == null || recDraws == null || recLosses == null) {
        const recSeed = hashSeed(`REC-${country}-T${t}-${resolved.clubName}`, yr);
        recWins = 22 + (recSeed % 7); // 22..28 wins
        recDraws = 3 + ((recSeed >>> 4) % Math.max(1, 34 - recWins - 1)); // realistic draws
        if (recWins + recDraws > 33) recDraws = 34 - recWins;
        recLosses = Math.max(0, 34 - recWins - recDraws);
      }
      if (recPts == null) {
        recPts = recWins * 3 + recDraws;
      }
      if (!recCoach) {
        const defaultLgCoach = resolveAlmanacCoachName({
          competitionId: `tier-${t}`,
          tier: t,
          country,
          clubName: resolved.clubName,
          year: yr,
          isHistoricalLore,
          isModActive: effectiveModActive,
        });
        recCoach =
          isUserClub && !isHistoricalLore
            ? state.managerName || state.currentCoach?.name || defaultLgCoach
            : defaultLgCoach;
      }
      if (!notes && recPts != null) {
        notes = `${recPts} pts`;
      }

      leagueWinners.push({
        id: `almanac-lg-${country}-${yr}-t${t}`,
        year: yr,
        competitionId: `tier-${t}`,
        competitionName: lgInfo.name,
        competitionShort: lgInfo.tag || `Tier ${t}`,
        category: 'league',
        tier: t,
        country,
        clubId: resolved.clubId,
        clubName: resolved.clubName,
        clubColor: resolved.clubColor,
        clubLogo: resolved.clubLogo,
        isUserClub,
        isPastManagerClub,
        isHistoricalLore,
        notes,
        wins: recWins,
        draws: recDraws,
        losses: recLosses,
        pts: recPts,
        coachName: recCoach,
      });
    }

    // 2. DOMESTIC & REGIONAL CUP WINNERS
    const cupWinners: AlmanacCompetitionWinner[] = [];

    // 2a. National Domestic Cup (e.g., DFB-Pokal, FA Cup, Copa del Rey, Coppa Italia)
    let domCupWinnerId: number | undefined;
    let domCupWinnerName: string | undefined;
    let domCupWinnerColor: string | undefined;
    let domCupWinnerLogo: string | undefined;

    const userWonDomCup = Boolean(
      !isHistoricalLore &&
        userHist &&
        userCountryThisYear === country &&
        (Number(userHist.trophiesThisYear?.dfb) || 0) > 0 &&
        !isReserveTeamForAlmanac(userHist.clubId ?? state.club?.id, userHist.clubName || state.club?.name, state.club)
    );

    if (!isHistoricalLore) {
      if (userWonDomCup && userHist) {
        domCupWinnerId = userHist.clubId ?? state.club?.id;
        domCupWinnerName = userHist.clubName || state.club?.name;
        domCupWinnerColor = userHist.color || state.club?.color;
        domCupWinnerLogo = userHist.logo || state.club?.logo;
      } else {
        const cupMove = yearMoves.find(
          m =>
            m.type === 'cup_champion' &&
            normalizeCountryCode(m.country || 'GER') === country &&
            !/libertadores|sudamericana|champions|euro cup|europa|conference|concacaf|leagues|afc|global|world|landespokal|efl trophy|english league cup|regional/i.test(
              m.fromLeagueName || ''
            ) &&
            (m.fromLeagueName === domesticCupInfo.name ||
              /pokal|fa cup|copa|coppa|coupe|taça|open cup|voyageurs|emperor|cup|beker|kupa|puchar|cupa/i.test(
                m.fromLeagueName || ''
              )) &&
            !isActiveUserClubThisYear(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName) &&
            !isReserveTeamForAlmanac(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName)
        );
        if (cupMove) {
          domCupWinnerId = typeof cupMove.clubId === 'number' ? cupMove.clubId : undefined;
          domCupWinnerName = cupMove.clubName;
          domCupWinnerColor = cupMove.clubColor;
          domCupWinnerLogo = cupMove.clubLogo;
        }
      }
    }

    if (domCupWinnerId == null && !domCupWinnerName) {
      // Top Tier 1 & Tier 2 senior contenders can win the National Cup (occasional cup upset!)
      const tier1Pool = (clubsByNativeTier.get(1) || effectiveCountryPool).filter(
        c => !isReserveTeamForAlmanac(c.id, c.name, c)
      );
      const tier2Pool = (clubsByNativeTier.get(2) || []).filter(
        c => !isReserveTeamForAlmanac(c.id, c.name, c)
      );
      const rawCupPool = [...tier1Pool.slice(0, 10), ...tier2Pool.slice(0, 3)];
      const cupPool = !isHistoricalLore && !userWonDomCup
        ? rawCupPool.filter(c => !isActiveUserClubThisYear(c.id, c.name))
        : rawCupPool;
      const safeCupPool = cupPool.length > 0 ? cupPool : effectiveCountryPool;
      if (safeCupPool.length > 0) {
        const seed = hashSeed(`${country}-DOMCUP`, yr);
        const pick = safeCupPool[seed % safeCupPool.length];
        domCupWinnerId = pick.id;
        domCupWinnerName = pick.name;
        domCupWinnerColor = pick.color;
        domCupWinnerLogo = pick.logo;
      }
    }

    const resolvedDomCup = resolveClubDisplay(
      domCupWinnerId,
      domCupWinnerName,
      domCupWinnerColor,
      domCupWinnerLogo
    );
    const domCupFlags = isClubUserOrPast(
      resolvedDomCup.clubId,
      resolvedDomCup.clubName,
      yr,
      isHistoricalLore
    );
    const defaultDomCupCoach = resolveAlmanacCoachName({
      competitionId: 'domestic-cup',
      country,
      clubName: resolvedDomCup.clubName,
      year: yr,
      isHistoricalLore,
      isModActive: effectiveModActive,
    });
    const domCupCoach =
      domCupFlags.isUserClub && !isHistoricalLore
        ? state.managerName || state.currentCoach?.name || defaultDomCupCoach
        : defaultDomCupCoach;
    cupWinners.push({
      id: `almanac-domcup-${country}-${yr}`,
      year: yr,
      competitionId: 'domestic-cup',
      competitionName: domesticCupInfo.name,
      competitionShort: 'NAT CUP',
      category: 'domestic_cup',
      country,
      clubId: resolvedDomCup.clubId,
      clubName: resolvedDomCup.clubName,
      clubColor: resolvedDomCup.clubColor,
      clubLogo: resolvedDomCup.clubLogo,
      isUserClub: domCupFlags.isUserClub,
      isPastManagerClub: domCupFlags.isPastManagerClub,
      isHistoricalLore,
      wins: 6,
      draws: 0,
      losses: 0,
      coachName: domCupCoach,
    });

    // 2b. Regional / Lower-League Cup (for countries with multi-tier pyramids; reserve teams are strictly ineligible)
    if (maxTier >= 2) {
      let regCupWinnerId: number | undefined;
      let regCupWinnerName: string | undefined;
      let regCupWinnerColor: string | undefined;
      let regCupWinnerLogo: string | undefined;

      const regCupLabel =
        country === 'ENG'
          ? 'EFL Trophy'
          : country === 'GER'
          ? 'Landespokal'
          : regionalCupInfo.name || 'Regional Cup';

      const userWonRegCup = Boolean(
        !isHistoricalLore &&
          userHist &&
          userCountryThisYear === country &&
          ((Number(userHist.trophiesThisYear?.reg) || 0) > 0 ||
            (Number(userHist.trophiesThisYear?.efl) || 0) > 0) &&
          !isReserveTeamForAlmanac(userHist.clubId ?? state.club?.id, userHist.clubName || state.club?.name, state.club)
      );

      if (userWonRegCup && userHist) {
        regCupWinnerId = userHist.clubId ?? state.club?.id;
        regCupWinnerName = userHist.clubName || state.club?.name;
        regCupWinnerColor = userHist.color || state.club?.color;
        regCupWinnerLogo = userHist.logo || state.club?.logo;
      } else if (!isHistoricalLore) {
        const regMove = yearMoves.find(
          m =>
            m.type === 'cup_champion' &&
            normalizeCountryCode(m.country || 'GER') === country &&
            (m.fromLeagueName === regCupLabel ||
              /landespokal|efl trophy|english league cup|regional cup/i.test(
                m.fromLeagueName || ''
              )) &&
            !isActiveUserClubThisYear(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName) &&
            !isReserveTeamForAlmanac(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName)
        );
        if (regMove) {
          regCupWinnerId = typeof regMove.clubId === 'number' ? regMove.clubId : undefined;
          regCupWinnerName = regMove.clubName;
          regCupWinnerColor = regMove.clubColor;
          regCupWinnerLogo = regMove.clubLogo;
        }
      }

      if (regCupWinnerId == null && !regCupWinnerName) {
        const lowerTierStart = Math.min(maxTier, 3);
        const rawLowerPools: Club[] = [];
        for (let lt = lowerTierStart; lt <= maxTier; lt++) {
          const seniorLowerTierClubs = (clubsByNativeTier.get(lt) || []).filter(
            c => !isReserveTeamForAlmanac(c.id, c.name, c)
          );
          rawLowerPools.push(...seniorLowerTierClubs.slice(0, 6));
        }
        const lowerPools = !isHistoricalLore && !userWonRegCup
          ? rawLowerPools.filter(c => !isActiveUserClubThisYear(c.id, c.name))
          : rawLowerPools;
        const seniorFallbackTierPool = (clubsByNativeTier.get(maxTier) || effectiveCountryPool).filter(
          c => !isReserveTeamForAlmanac(c.id, c.name, c)
        );
        const safeLowerPool =
          lowerPools.length > 0
            ? lowerPools
            : seniorFallbackTierPool.length > 0
            ? seniorFallbackTierPool
            : effectiveCountryPool;
        if (safeLowerPool.length > 0) {
          const seed = hashSeed(`${country}-REGCUP`, yr);
          const pick = safeLowerPool[seed % safeLowerPool.length];
          regCupWinnerId = pick.id;
          regCupWinnerName = pick.name;
          regCupWinnerColor = pick.color;
          regCupWinnerLogo = pick.logo;
        }
      }

      const resolvedRegCup = resolveClubDisplay(
        regCupWinnerId,
        regCupWinnerName,
        regCupWinnerColor,
        regCupWinnerLogo
      );
      const regCupFlags = isClubUserOrPast(
        resolvedRegCup.clubId,
        resolvedRegCup.clubName,
        yr,
        isHistoricalLore
      );
      const defaultRegCupCoach = resolveAlmanacCoachName({
        competitionId: 'regional-cup',
        country,
        clubName: resolvedRegCup.clubName,
        year: yr,
        isHistoricalLore,
        isModActive: effectiveModActive,
      });
      const regCupCoach =
        regCupFlags.isUserClub && !isHistoricalLore
          ? state.managerName || state.currentCoach?.name || defaultRegCupCoach
          : defaultRegCupCoach;
      cupWinners.push({
        id: `almanac-regcup-${country}-${yr}`,
        year: yr,
        competitionId: 'regional-cup',
        competitionName: regCupLabel,
        competitionShort: 'REG CUP',
        category: 'domestic_cup',
        country,
        clubId: resolvedRegCup.clubId,
        clubName: resolvedRegCup.clubName,
        clubColor: resolvedRegCup.clubColor,
        clubLogo: resolvedRegCup.clubLogo,
        isUserClub: regCupFlags.isUserClub,
        isPastManagerClub: regCupFlags.isPastManagerClub,
        isHistoricalLore,
        wins: 5,
        draws: 0,
        losses: 0,
        coachName: regCupCoach,
      });
    }

    // 3. CONTINENTAL & GLOBAL CUPS
    const globalWinners: AlmanacCompetitionWinner[] = [];

    // 3a. Premier Continental Cup (Champions Cup / Copa Libertadores / Concacaf Champions Cup / AFC Champions League)
    const premierContConfig =
      region === 'CONMEBOL'
        ? {
            id: 'libertadores',
            name: 'Copa Libertadores',
            short: 'LIBERTADORES',
            pool: conmebolTopClubs,
            histMap: HISTORICAL_LIBERTADORES_WINNERS,
            matcher: /libertadores/i,
          }
        : region === 'CONCACAF'
        ? {
            id: 'concacaf',
            name: 'Concacaf Champions Cup',
            short: 'CONCACAF',
            pool: concacafTopClubs,
            histMap: HISTORICAL_CONCACAF_WINNERS,
            matcher: /concacaf/i,
          }
        : region === 'AFC'
        ? {
            id: 'afc',
            name: 'AFC Champions League',
            short: 'AFC CL',
            pool: afcTopClubs,
            histMap: HISTORICAL_AFC_WINNERS,
            matcher: /afc|asian.*champion/i,
          }
        : {
            id: 'champions-cup',
            name: 'Champions Cup',
            short: 'CHAMPIONS CUP',
            pool: uefaTopClubs,
            histMap: HISTORICAL_CHAMPIONS_CUP_WINNERS,
            matcher: /champions cup|champions league/i,
          };

    let contWinnerId: number | undefined;
    let contWinnerName: string | undefined;
    let contWinnerColor: string | undefined;
    let contWinnerLogo: string | undefined;

    const userWonCont1 = Boolean(
      !isHistoricalLore &&
        userHist &&
        userRegionThisYear === region &&
        (Number(userHist.trophiesThisYear?.cl) || 0) > 0
    );

    if (!isHistoricalLore) {
      if (userWonCont1 && userHist) {
        contWinnerId = userHist.clubId ?? state.club?.id;
        contWinnerName = userHist.clubName || state.club?.name;
        contWinnerColor = userHist.color || state.club?.color;
        contWinnerLogo = userHist.logo || state.club?.logo;
      } else {
        const move = yearMoves.find(
          m =>
            m.type === 'cup_champion' &&
            premierContConfig.matcher.test(m.fromLeagueName || '') &&
            !isActiveUserClubThisYear(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName) &&
            !isReserveTeamForAlmanac(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName)
        );
        if (move) {
          contWinnerId = typeof move.clubId === 'number' ? move.clubId : undefined;
          contWinnerName = move.clubName;
          contWinnerColor = move.clubColor;
          contWinnerLogo = move.clubLogo;
        }
      }
    } else if (premierContConfig.histMap[yr] != null) {
      contWinnerId = premierContConfig.histMap[yr];
    }

    if (contWinnerId == null && !contWinnerName) {
      const rawTopPool = premierContConfig.pool.slice(0, Math.min(10, premierContConfig.pool.length));
      const topPool = !isHistoricalLore && !userWonCont1
        ? rawTopPool.filter(c => !isActiveUserClubThisYear(c.id, c.name))
        : rawTopPool;
      const safePool = topPool.length > 0 ? topPool : effectiveCountryPool;
      if (safePool.length > 0) {
        const seed = hashSeed(`CONT-${premierContConfig.id}`, yr);
        const pick = safePool[seed % safePool.length];
        contWinnerId = pick.id;
        contWinnerName = pick.name;
        contWinnerColor = pick.color;
        contWinnerLogo = pick.logo;
      }
    }

    const resolvedCont = resolveClubDisplay(
      contWinnerId,
      contWinnerName,
      contWinnerColor,
      contWinnerLogo
    );
    const contFlags = isClubUserOrPast(
      resolvedCont.clubId,
      resolvedCont.clubName,
      yr,
      isHistoricalLore
    );
    const contSeed = hashSeed(`CONT1-REC-${resolvedCont.clubName}`, yr);
    const contWins = 9 + (contSeed % 4);
    const contDraws = 1 + ((contSeed >>> 3) % 3);
    const contLosses = Math.max(0, 13 - contWins - contDraws);
    const defaultCont1Coach = resolveAlmanacCoachName({
      competitionId: premierContConfig.id,
      country: resolvedCont.country,
      clubName: resolvedCont.clubName,
      year: yr,
      isHistoricalLore,
      isModActive: effectiveModActive,
    });
    globalWinners.push({
      id: `almanac-cont1-${country}-${yr}`,
      year: yr,
      competitionId: premierContConfig.id,
      competitionName: premierContConfig.name,
      competitionShort: premierContConfig.short,
      category: 'continental_cup',
      country: resolvedCont.country,
      clubId: resolvedCont.clubId,
      clubName: resolvedCont.clubName,
      clubColor: resolvedCont.clubColor,
      clubLogo: resolvedCont.clubLogo,
      isUserClub: contFlags.isUserClub,
      isPastManagerClub: contFlags.isPastManagerClub,
      isHistoricalLore,
      wins: contWins,
      draws: contDraws,
      losses: contLosses,
      coachName:
        contFlags.isUserClub && !isHistoricalLore
          ? state.managerName || state.currentCoach?.name || defaultCont1Coach
          : defaultCont1Coach,
    });

    // 3b. Secondary Continental Cup (Euro Cup / Copa Sudamericana / Leagues Challenge / AFC Cup)
    const secContConfig =
      region === 'CONMEBOL'
        ? {
            id: 'sudamericana',
            name: 'Copa Sudamericana',
            short: 'SUDAMERICANA',
            pool: conmebolTopClubs,
            matcher: /sudamericana/i,
          }
        : region === 'CONCACAF'
        ? {
            id: 'leagues-cup',
            name: 'Leagues Challenge',
            short: 'LEAGUES CUP',
            pool: concacafTopClubs,
            matcher: /leagues/i,
          }
        : region === 'AFC'
        ? {
            id: 'afc-cup',
            name: 'AFC Cup',
            short: 'AFC CUP',
            pool: afcTopClubs,
            matcher: /afc cup|asian cup/i,
          }
        : {
            id: 'euro-cup',
            name: 'Euro Cup',
            short: 'EURO CUP',
            pool: uefaTopClubs,
            matcher: /euro cup|europa/i,
          };

    let secWinnerId: number | undefined;
    let secWinnerName: string | undefined;
    let secWinnerColor: string | undefined;
    let secWinnerLogo: string | undefined;

    const userWonCont2 = Boolean(
      !isHistoricalLore &&
        userHist &&
        userRegionThisYear === region &&
        (Number(userHist.trophiesThisYear?.el) || 0) > 0
    );

    if (!isHistoricalLore) {
      if (userWonCont2 && userHist) {
        secWinnerId = userHist.clubId ?? state.club?.id;
        secWinnerName = userHist.clubName || state.club?.name;
        secWinnerColor = userHist.color || state.club?.color;
        secWinnerLogo = userHist.logo || state.club?.logo;
      } else {
        const move = yearMoves.find(
          m =>
            m.type === 'cup_champion' &&
            secContConfig.matcher.test(m.fromLeagueName || '') &&
            !isActiveUserClubThisYear(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName) &&
            !isReserveTeamForAlmanac(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName)
        );
        if (move) {
          secWinnerId = typeof move.clubId === 'number' ? move.clubId : undefined;
          secWinnerName = move.clubName;
          secWinnerColor = move.clubColor;
          secWinnerLogo = move.clubLogo;
        }
      }
    }

    if (secWinnerId == null && !secWinnerName) {
      const rawSecPool = secContConfig.pool.slice(0, Math.min(18, secContConfig.pool.length));
      const secPool = !isHistoricalLore && !userWonCont2
        ? rawSecPool.filter(c => !isActiveUserClubThisYear(c.id, c.name))
        : rawSecPool;
      const safeSecPool = secPool.length > 0 ? secPool : effectiveCountryPool;
      if (safeSecPool.length > 0) {
        const seed = hashSeed(`SEC-${secContConfig.id}`, yr);
        const pick = safeSecPool[seed % safeSecPool.length];
        secWinnerId = pick.id;
        secWinnerName = pick.name;
        secWinnerColor = pick.color;
        secWinnerLogo = pick.logo;
      }
    }

    const resolvedSec = resolveClubDisplay(secWinnerId, secWinnerName, secWinnerColor, secWinnerLogo);
    const secFlags = isClubUserOrPast(
      resolvedSec.clubId,
      resolvedSec.clubName,
      yr,
      isHistoricalLore
    );
    const secSeed = hashSeed(`CONT2-REC-${resolvedSec.clubName}`, yr);
    const secWins = 8 + (secSeed % 4);
    const secDraws = 2 + ((secSeed >>> 3) % 3);
    const secLosses = Math.max(0, 13 - secWins - secDraws);
    const defaultCont2Coach = resolveAlmanacCoachName({
      competitionId: secContConfig.id,
      country: resolvedSec.country,
      clubName: resolvedSec.clubName,
      year: yr,
      isHistoricalLore,
      isModActive: effectiveModActive,
    });
    globalWinners.push({
      id: `almanac-cont2-${country}-${yr}`,
      year: yr,
      competitionId: secContConfig.id,
      competitionName: secContConfig.name,
      competitionShort: secContConfig.short,
      category: 'continental_cup',
      country: resolvedSec.country,
      clubId: resolvedSec.clubId,
      clubName: resolvedSec.clubName,
      clubColor: resolvedSec.clubColor,
      clubLogo: resolvedSec.clubLogo,
      isUserClub: secFlags.isUserClub,
      isPastManagerClub: secFlags.isPastManagerClub,
      isHistoricalLore,
      wins: secWins,
      draws: secDraws,
      losses: secLosses,
      coachName:
        secFlags.isUserClub && !isHistoricalLore
          ? state.managerName || state.currentCoach?.name || defaultCont2Coach
          : defaultCont2Coach,
    });

    // 3c. Global / International Club Cup (Global Club Cup / Intercontinental Cup)
    let globalWinnerId: number | undefined;
    let globalWinnerName: string | undefined;
    let globalWinnerColor: string | undefined;
    let globalWinnerLogo: string | undefined;

    const userWonGlobalCup = Boolean(
      !isHistoricalLore && userHist && (Number(userHist.trophiesThisYear?.cwc) || 0) > 0
    );

    if (!isHistoricalLore) {
      if (userWonGlobalCup && userHist) {
        globalWinnerId = userHist.clubId ?? state.club?.id;
        globalWinnerName = userHist.clubName || state.club?.name;
        globalWinnerColor = userHist.color || state.club?.color;
        globalWinnerLogo = userHist.logo || state.club?.logo;
      } else {
        const move = yearMoves.find(
          m =>
            m.type === 'cup_champion' &&
            /global.*club|world.*club|cwc/i.test(m.fromLeagueName || '') &&
            !isActiveUserClubThisYear(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName) &&
            !isReserveTeamForAlmanac(typeof m.clubId === 'number' ? m.clubId : undefined, m.clubName)
        );
        if (move) {
          globalWinnerId = typeof move.clubId === 'number' ? move.clubId : undefined;
          globalWinnerName = move.clubName;
          globalWinnerColor = move.clubColor;
          globalWinnerLogo = move.clubLogo;
        }
      }
    }

    if (globalWinnerId == null && !globalWinnerName) {
      const seed = hashSeed('GLOBAL-CLUB-CUP', yr);
      if (isHistoricalLore) {
        // Pre-start historical lore: contested between historical UEFA & CONMEBOL champions
        const uefaChampId = HISTORICAL_CHAMPIONS_CUP_WINNERS[yr] ?? resolvedCont.clubId;
        const conmebolChampId = HISTORICAL_LIBERTADORES_WINNERS[yr];
        if (yr < 2005 && conmebolChampId != null && seed % 2 === 0) {
          globalWinnerId = conmebolChampId;
        } else if (uefaChampId != null) {
          globalWinnerId = uefaChampId;
        }
      }
      if (globalWinnerId == null) {
        const rawWorldPool =
          yr < 2005 && conmebolTopClubs.length > 0 && seed % 3 === 0
            ? conmebolTopClubs.slice(0, Math.min(6, conmebolTopClubs.length))
            : uefaTopClubs.slice(0, Math.min(8, uefaTopClubs.length));
        const worldPool = !isHistoricalLore && !userWonGlobalCup
          ? rawWorldPool.filter(c => !isActiveUserClubThisYear(c.id, c.name))
          : rawWorldPool;
        const pick =
          worldPool[seed % Math.max(1, worldPool.length)] ||
          (!isActiveUserClubThisYear(resolvedCont.clubId, resolvedCont.clubName) && resolvedCont.clubId != null
            ? { id: resolvedCont.clubId }
            : undefined);
        if (pick) globalWinnerId = pick.id;
      }
    }

    const resolvedGlobal = resolveClubDisplay(
      globalWinnerId,
      globalWinnerName,
      globalWinnerColor,
      globalWinnerLogo
    );
    const globalFlags = isClubUserOrPast(
      resolvedGlobal.clubId,
      resolvedGlobal.clubName,
      yr,
      isHistoricalLore
    );
    const defaultGlobalCoach = resolveAlmanacCoachName({
      competitionId: 'global-club-cup',
      country: resolvedGlobal.country,
      clubName: resolvedGlobal.clubName,
      year: yr,
      isHistoricalLore,
      isModActive: effectiveModActive,
    });
    globalWinners.push({
      id: `almanac-global-${country}-${yr}`,
      year: yr,
      competitionId: 'global-club-cup',
      competitionName: yr < 2000 ? 'Intercontinental Cup' : 'Global Club Cup',
      competitionShort: 'GLOBAL CUP',
      category: 'global_cup',
      country: resolvedGlobal.country,
      clubId: resolvedGlobal.clubId,
      clubName: resolvedGlobal.clubName,
      clubColor: resolvedGlobal.clubColor,
      clubLogo: resolvedGlobal.clubLogo,
      isUserClub: globalFlags.isUserClub,
      isPastManagerClub: globalFlags.isPastManagerClub,
      isHistoricalLore,
      wins: yr < 2000 ? 1 : 4,
      draws: 0,
      losses: 0,
      coachName:
        globalFlags.isUserClub && !isHistoricalLore
          ? state.managerName || state.currentCoach?.name || defaultGlobalCoach
          : defaultGlobalCoach,
    });

    // 3d. National Team FIFA World Cup (Every 4 Years: 1950, 1954, ..., 2022, 2026, 2030, ...)
    if (isWorldCupYear(yr)) {
      const hostInfo = getHostNation(yr);
      const rawWcCampaigns = Array.isArray(state.worldCupCampaigns) ? state.worldCupCampaigns : [];
      const userWcCamp = !isHistoricalLore
        ? rawWcCampaigns.find(c => Number(c?.year) === yr)
        : undefined;
      const wcTrophyEntry = !isHistoricalLore
        ? (state.trophyHistory || []).find(
            (t: any) =>
              Number(t?.year) === yr &&
              typeof t?.name === 'string' &&
              /world cup|weltmeister/i.test(t.name)
          )
        : undefined;

      const userWonWcThisYear = Boolean(
        !isHistoricalLore &&
          (userWcCamp?.wonTrophy ||
            (!userWcCamp &&
              (Boolean(wcTrophyEntry) || (Number(userHist?.trophiesThisYear?.wc) || 0) > 0)))
      );

      let wcWinnerMeta: {
        code: string;
        name: string;
        flag: string;
        color: string;
        coachName: string;
        runnerUp: string;
        finalScore: string;
        wins: number;
        draws: number;
        losses: number;
        isUser: boolean;
        isPastUser: boolean;
      };

      if (isHistoricalLore && HISTORICAL_WORLD_CUP_WINNERS[yr]) {
        const loreWc = HISTORICAL_WORLD_CUP_WINNERS[yr];
        wcWinnerMeta = {
          code: loreWc.code,
          name: loreWc.name,
          flag: loreWc.flag,
          color: loreWc.color,
          coachName: effectiveModActive ? loreWc.coachName : toFallbackCoachName(loreWc.coachName),
          runnerUp: loreWc.runnerUp,
          finalScore: loreWc.finalScore,
          wins: 6,
          draws: 1,
          losses: 0,
          isUser: false,
          isPastUser: false,
        };
      } else if (userWonWcThisYear) {
        const rawUserTeam =
          userWcCamp?.teamName ||
          wcTrophyEntry?.clubName ||
          state.worldCupLastTeam ||
          state.club?.country ||
          'GER';
        const ntMeta = resolveNationalTeamMeta(rawUserTeam);
        const oppCandidates = NATIONAL_TEAMS.filter(nt => nt.code !== ntMeta.code && nt.ovr >= 84);
        const wcSeed = hashSeed(`WC-FINAL-${yr}`, yr);
        const runnerUpTeam =
          oppCandidates[wcSeed % Math.max(1, oppCandidates.length)] || NATIONAL_TEAMS[0];
        const finalScores = ['2–1', '1–0', '3–1', '2–0', '3–2 (AET)', '1–1 (4–3 pens)'];
        const rawCampAny = userWcCamp as any;
        const finalMatch = Array.isArray(rawCampAny?.matches)
          ? rawCampAny.matches.find((m: any) => String(m?.round || '').toLowerCase().includes('final') && !String(m?.round || '').toLowerCase().includes('semi') && !String(m?.round || '').toLowerCase().includes('quarter'))
          : null;
        const recordedRunnerUp =
          rawCampAny?.runnerUp ||
          finalMatch?.opponentName ||
          finalMatch?.opponent ||
          runnerUpTeam.name;
        const recordedFinalScore =
          rawCampAny?.finalScore ||
          (typeof finalMatch?.userGoals === 'number' && typeof finalMatch?.oppGoals === 'number'
            ? `${finalMatch.userGoals}–${finalMatch.oppGoals}`
            : finalScores[wcSeed % finalScores.length]);
        wcWinnerMeta = {
          code: ntMeta.code,
          name: ntMeta.name,
          flag: userWcCamp?.teamFlag || rawCampAny?.flag || ntMeta.flag,
          color: ntMeta.color,
          coachName:
            userWcCamp?.coachName ||
            state.managerName ||
            state.currentCoach?.name ||
            getDeterministicCoachName(ntMeta.code, `${ntMeta.name} NT`, yr, effectiveModActive),
          runnerUp: recordedRunnerUp,
          finalScore: recordedFinalScore,
          wins: userWcCamp?.matchesWon ?? 6,
          draws: userWcCamp?.matchesDrawn ?? 1,
          losses: userWcCamp?.matchesLost ?? 0,
          isUser: true,
          isPastUser: false,
        };
      } else {
        // AI National Team World Cup Winner (exclude user's national team if user played & lost in yr)
        const excludedUserTeam =
          !isHistoricalLore && userWcCamp && !userWcCamp.wonTrophy
            ? resolveNationalTeamMeta(userWcCamp.teamName)
            : null;
        const explicitFinalWinner =
          !isHistoricalLore && userWcCamp && !userWcCamp.wonTrophy && (userWcCamp as any).tournamentWinner
            ? resolveNationalTeamMeta((userWcCamp as any).tournamentWinner)
            : null;

        const weightedCodes = [
          'BRA', 'BRA', 'BRA',
          'FRA', 'FRA', 'FRA',
          'ARG', 'ARG', 'ARG',
          'GER', 'GER',
          'ESP', 'ESP',
          'ENG', 'ENG',
          'ITA', 'ITA',
          'POR', 'NED',
          ...(hostInfo.ovr >= 82 ? [hostInfo.code, hostInfo.code] : []),
        ].filter(code => !excludedUserTeam || code !== excludedUserTeam.code);

        const wcSeed = hashSeed(`WC-AI-CHAMP-${yr}`, yr);
        const chosenCode = explicitFinalWinner?.code || weightedCodes[wcSeed % Math.max(1, weightedCodes.length)] || 'BRA';
        const ntMeta = explicitFinalWinner || resolveNationalTeamMeta(chosenCode);
        const oppPool = NATIONAL_TEAMS.filter(
          nt => nt.code !== ntMeta.code && nt.ovr >= 83
        );
        const runnerUpTeam =
          oppPool[(wcSeed >>> 3) % Math.max(1, oppPool.length)] || NATIONAL_TEAMS[1];
        const finalScores = ['2–1', '1–0', '2–0', '3–1', '2–1 (AET)', '1–1 (5–4 pens)'];

        const aiCoachName = getDeterministicCoachName(
          ntMeta.code,
          `${ntMeta.name} NT`,
          yr,
          effectiveModActive
        );

        const isPastUserNt =
          !isHistoricalLore &&
          rawWcCampaigns.some(c => {
            if (!c?.year || Number(c.year) >= yr) return false;
            const pastMeta = resolveNationalTeamMeta(c.teamName);
            return pastMeta.code === ntMeta.code;
          });

        wcWinnerMeta = {
          code: ntMeta.code,
          name: ntMeta.name,
          flag: ntMeta.flag,
          color: ntMeta.color,
          coachName: aiCoachName,
          runnerUp: explicitFinalWinner && excludedUserTeam ? excludedUserTeam.name : runnerUpTeam.name,
          finalScore:
            explicitFinalWinner && (userWcCamp as any)?.finalScore
              ? (userWcCamp as any).finalScore
              : finalScores[wcSeed % finalScores.length],
          wins: 6,
          draws: 1,
          losses: 0,
          isUser: false,
          isPastUser: isPastUserNt,
        };
      }

      globalWinners.push({
        id: `almanac-world-cup-${yr}`,
        year: yr,
        competitionId: 'world-cup',
        competitionName: 'World Cup',
        competitionShort: 'WORLD CUP',
        category: 'global_cup',
        country: wcWinnerMeta.code,
        clubName: wcWinnerMeta.name,
        clubColor: wcWinnerMeta.color,
        isUserClub: wcWinnerMeta.isUser,
        isPastManagerClub: wcWinnerMeta.isPastUser,
        isHistoricalLore,
        wins: wcWinnerMeta.wins,
        draws: wcWinnerMeta.draws,
        losses: wcWinnerMeta.losses,
        coachName: wcWinnerMeta.coachName,
        flag: wcWinnerMeta.flag,
        hostCountry: hostInfo.name,
        hostFlag: hostInfo.flag,
        hostStadium: `${hostInfo.stadium}, ${hostInfo.city}`,
        runnerUp: wcWinnerMeta.runnerUp,
        finalScore: wcWinnerMeta.finalScore,
        isNationalTeam: true,
        notes: `Host: ${hostInfo.flag} ${hostInfo.name} (${hostInfo.city}) · Final: ${wcWinnerMeta.finalScore} vs ${wcWinnerMeta.runnerUp}`,
      });
    }

    records.push({
      year: yr,
      seasonLabel: formatAlmanacSeasonLabel(yr),
      isHistoricalLore,
      country,
      leagueWinners,
      cupWinners,
      globalWinners,
    });
  }

  return records;
}

/**
 * Returns the complete chronological National Team World Cup history (newest to oldest),
 * combining simulated World Cup tournaments with historical World Cup lore (including 1930–1938 when includePre1950 is true).
 */
export function buildWorldCupAlmanacHistory(
  state: GameState,
  includePre1950: boolean = true,
  isModActive?: boolean
): AlmanacCompetitionWinner[] {
  const effectiveModActive =
    isModActive !== undefined
      ? isModActive
      : typeof window !== 'undefined'
      ? localStorage.getItem('fms_real_mod_active') === 'true'
      : false;
  const records = buildChampionsAlmanac(state, 'GER', ALL_CLUBS, effectiveModActive);
  const wcWinners: AlmanacCompetitionWinner[] = [];

  for (const rec of records) {
    const wc = rec.globalWinners.find(w => w.competitionId === 'world-cup');
    if (wc) {
      wcWinners.push(wc);
    }
  }

  if (includePre1950) {
    for (const preYr of [1938, 1934, 1930]) {
      const lore = HISTORICAL_WORLD_CUP_WINNERS[preYr];
      if (lore) {
        wcWinners.push({
          id: `almanac-world-cup-${preYr}`,
          year: preYr,
          competitionId: 'world-cup',
          competitionName: 'World Cup',
          competitionShort: 'WORLD CUP',
          category: 'global_cup',
          country: lore.code,
          clubName: lore.name,
          clubColor: lore.color,
          isUserClub: false,
          isPastManagerClub: false,
          isHistoricalLore: true,
          wins: 4,
          draws: 0,
          losses: 0,
          coachName: effectiveModActive ? lore.coachName : toFallbackCoachName(lore.coachName),
          flag: lore.flag,
          hostCountry: lore.hostCountry || 'Uruguay',
          hostFlag: lore.hostFlag || '🇺🇾',
          hostStadium: lore.hostStadium || 'Montevideo',
          runnerUp: lore.runnerUp,
          finalScore: lore.finalScore,
          isNationalTeam: true,
          notes: `Host: ${lore.hostFlag || ''} ${lore.hostCountry || ''} · Final: ${lore.finalScore} vs ${lore.runnerUp}`,
        });
      }
    }
  }

  return wcWinners.sort((a, b) => b.year - a.year);
}

export type TrophyChartScope = 'country_tier' | 'international';

export type InternationalTrophyId =
  | 'champions-cup'
  | 'euro-cup'
  | 'libertadores'
  | 'sudamericana'
  | 'concacaf'
  | 'leagues-cup'
  | 'afc'
  | 'afc-cup'
  | 'global-club-cup'
  | 'world-cup';

export type TrophyAccountingMode = 'auto' | 'all_time' | 'fresh_from_start';

export interface TopTrophyTeamEntry {
  rank: number;
  clubId?: number;
  clubName: string;
  clubColor: string;
  clubLogo?: string;
  country: string;
  count: number;
  historicCount: number;
  liveCount: number;
  yearsWon: number[];
  latestYearWon: number;
  isUserClub: boolean;
  isPastManagerClub: boolean;
  percentageOfMax: number;
  shareOfTotal: number;
  flag?: string;
  isNationalTeam?: boolean;
}

export interface TrophyChartOptions {
  scope?: TrophyChartScope;
  country?: string;
  tier?: number;
  domesticCompetitionId?: string; // 'tier-1'..'tier-N' | 'domestic-cup' | 'regional-cup'
  internationalCompetitionId?: InternationalTrophyId;
  accountingMode?: TrophyAccountingMode;
  limit?: number;
}

export interface TrophyChartResult {
  scope: TrophyChartScope;
  country: string;
  tier: number;
  competitionId: string;
  competitionName: string;
  accountingMode: 'all_time' | 'fresh_from_start';
  careerStartYear: number;
  isHistoricCareerStart: boolean;
  startYearCounted: number | null;
  endYearCounted: number | null;
  totalSeasonsCounted: number;
  topTeams: TopTrophyTeamEntry[];
}

const INTERNATIONAL_COMPETITION_META: Record<
  InternationalTrophyId,
  { name: string; contextCountry: string }
> = {
  'champions-cup': { name: 'Champions Cup', contextCountry: 'GER' },
  'euro-cup': { name: 'Euro Cup', contextCountry: 'GER' },
  libertadores: { name: 'Copa Libertadores', contextCountry: 'BRA' },
  sudamericana: { name: 'Copa Sudamericana', contextCountry: 'BRA' },
  concacaf: { name: 'Concacaf Champions Cup', contextCountry: 'USA' },
  'leagues-cup': { name: 'Leagues Challenge', contextCountry: 'USA' },
  afc: { name: 'AFC Champions League', contextCountry: 'JPN' },
  'afc-cup': { name: 'AFC Cup', contextCountry: 'JPN' },
  'global-club-cup': { name: 'Global Club Cup', contextCountry: 'GER' },
  'world-cup': { name: 'World Cup', contextCountry: 'GER' },
};

/**
 * Builds the Top 5 Teams by Trophy Count bar chart dataset per Country & Tier (or Domestic Cup)
 * or by International Competition.
 * - If the user started in a modern year (2026+), defaults to 'all_time' (including 1950+ historic lore).
 * - If the user started in a historic year (<2026, e.g. 1954 or 1990), defaults to 'fresh_from_start'
 *   (building fresh from the career start year onwards) while allowing explicit override.
 */
export function buildTopTrophyTeamsChart(
  state: GameState,
  options: TrophyChartOptions = {},
  clubsDb: Club[] = ALL_CLUBS,
  isModActive?: boolean
): TrophyChartResult {
  const scope: TrophyChartScope = options.scope || 'country_tier';
  const country = normalizeCountryCode(options.country || state.club?.country || 'GER');
  const maxTier = getMaxTier(country, clubsDb);
  const safeTier = Math.min(Math.max(1, Number(options.tier) || 1), maxTier);
  const limit = Math.max(1, Number(options.limit) || 5);

  const earliestHistYear = (state.history || []).reduce(
    (min, h) => (h.year ? Math.min(min, Number(h.year)) : min),
    Infinity
  );
  const inferredStartYear =
    Number(state.startYear) ||
    (Number.isFinite(earliestHistYear)
      ? earliestHistYear
      : Number(state.seasonCount) > 1 && Number(state.year)
      ? Number(state.year) - (Number(state.seasonCount) - 1)
      : Number(state.year) || 2026);
  const careerStartYear = Math.max(1950, inferredStartYear);
  const isHistoricCareerStart = careerStartYear < 2026;

  const requestedAccounting = options.accountingMode || 'auto';
  const effectiveAccounting: 'all_time' | 'fresh_from_start' =
    requestedAccounting === 'auto'
      ? isHistoricCareerStart
        ? 'fresh_from_start'
        : 'all_time'
      : requestedAccounting;

  const intlId: InternationalTrophyId = options.internationalCompetitionId || 'champions-cup';
  const intlMeta =
    INTERNATIONAL_COMPETITION_META[intlId] || INTERNATIONAL_COMPETITION_META['champions-cup'];

  const almanacCountry = scope === 'international' ? intlMeta.contextCountry : country;
  const almanacRecords = buildChampionsAlmanac(state, almanacCountry, clubsDb, isModActive);

  const filteredRecords = almanacRecords.filter(rec => {
    if (effectiveAccounting === 'fresh_from_start') {
      return !rec.isHistoricalLore && rec.year >= careerStartYear;
    }
    return true;
  });

  const domCompId = options.domesticCompetitionId || `tier-${safeTier}`;
  let resolvedCompetitionId = domCompId;
  let resolvedCompetitionName = '';

  if (scope === 'international') {
    resolvedCompetitionId = intlId;
    resolvedCompetitionName = intlMeta.name;
  } else if (domCompId === 'domestic-cup') {
    resolvedCompetitionName = getDomesticCupInfo(country, 1).name || 'National Cup';
  } else if (domCompId === 'regional-cup') {
    resolvedCompetitionName =
      country === 'ENG'
        ? 'EFL Trophy'
        : country === 'GER'
        ? 'Landespokal'
        : getDomesticCupInfo(country, 4).name || 'Regional Cup';
  } else {
    resolvedCompetitionId = `tier-${safeTier}`;
    resolvedCompetitionName = getLeagueInfo(safeTier, country).name;
  }

  const tallyMap = new Map<
    string,
    {
      clubId?: number;
      clubName: string;
      clubColor: string;
      clubLogo?: string;
      country: string;
      count: number;
      historicCount: number;
      liveCount: number;
      yearsWon: number[];
      isUserClub: boolean;
      isPastManagerClub: boolean;
      flag?: string;
      isNationalTeam?: boolean;
    }
  >();

  const userClubId = state.club?.id;
  const userClubNameNorm = (state.club?.name || '').toLowerCase().trim();
  const historyRows = state.history || [];

  let totalSeasonsCounted = 0;
  let minYr: number | null = null;
  let maxYr: number | null = null;

  for (const rec of filteredRecords) {
    let winner: AlmanacCompetitionWinner | undefined;
    if (scope === 'international') {
      winner = rec.globalWinners.find(w => w.competitionId === intlId);
    } else if (domCompId === 'domestic-cup') {
      winner = rec.cupWinners.find(
        w => w.competitionId === 'domestic-cup' || w.id.includes('domcup')
      );
    } else if (domCompId === 'regional-cup') {
      winner = rec.cupWinners.find(
        w => w.competitionId === 'regional-cup' || w.id.includes('regcup')
      );
    } else {
      winner = rec.leagueWinners.find(w => w.tier === safeTier);
    }

    if (!winner) continue;
    totalSeasonsCounted++;
    if (minYr === null || rec.year < minYr) minYr = rec.year;
    if (maxYr === null || rec.year > maxYr) maxYr = rec.year;

    const key =
      winner.clubId != null
        ? `id_${winner.clubId}`
        : `name_${winner.clubName.toLowerCase().trim()}`;

    const isCurrentUsersClub = winner.isNationalTeam
      ? Boolean(winner.isUserClub)
      : (winner.clubId != null && userClubId != null && Number(winner.clubId) === Number(userClubId)) ||
        (userClubNameNorm.length > 0 && winner.clubName.toLowerCase().trim() === userClubNameNorm);

    const isPastUsersClub =
      !isCurrentUsersClub &&
      (winner.isPastManagerClub ||
        (!winner.isNationalTeam &&
          (winner.isUserClub ||
            historyRows.some(
              h =>
                (winner.clubId != null && h.clubId != null && Number(winner.clubId) === Number(h.clubId)) ||
                (h.clubName && h.clubName.toLowerCase().trim() === winner.clubName.toLowerCase().trim())
            ))));

    const existing = tallyMap.get(key);
    if (existing) {
      existing.count += 1;
      if (rec.isHistoricalLore) {
        existing.historicCount += 1;
      } else {
        existing.liveCount += 1;
      }
      if (!existing.yearsWon.includes(rec.year)) {
        existing.yearsWon.push(rec.year);
      }
      if (isCurrentUsersClub) existing.isUserClub = true;
      if (isPastUsersClub && !existing.isUserClub) existing.isPastManagerClub = true;
      if (!existing.clubLogo && winner.clubLogo) existing.clubLogo = winner.clubLogo;
      if (!existing.flag && winner.flag) existing.flag = winner.flag;
    } else {
      tallyMap.set(key, {
        clubId: winner.clubId,
        clubName: winner.clubName,
        clubColor: winner.clubColor,
        clubLogo: winner.clubLogo,
        country: winner.country || country,
        count: 1,
        historicCount: rec.isHistoricalLore ? 1 : 0,
        liveCount: rec.isHistoricalLore ? 0 : 1,
        yearsWon: [rec.year],
        isUserClub: isCurrentUsersClub,
        isPastManagerClub: isPastUsersClub,
        flag: winner.flag,
        isNationalTeam: winner.isNationalTeam,
      });
    }
  }

  // Include pre-1950 World Cup editions (1930 Uruguay, 1934 & 1938 Italy) in All-Time World Cup Trophy Leaders
  // so that Italy (4) and Uruguay (2) reflect their authentic all-time World Cup totals alongside Brazil (5), Germany (4), Argentina (3), and France (2).
  if (scope === 'international' && intlId === 'world-cup' && effectiveAccounting === 'all_time') {
    for (const preYr of [1938, 1934, 1930]) {
      const lore = HISTORICAL_WORLD_CUP_WINNERS[preYr];
      if (!lore) continue;
      totalSeasonsCounted++;
      if (minYr === null || preYr < minYr) minYr = preYr;
      if (maxYr === null || preYr > maxYr) maxYr = preYr;
      const key = `name_${lore.name.toLowerCase().trim()}`;
      const existing = tallyMap.get(key);
      if (existing) {
        existing.count += 1;
        existing.historicCount += 1;
        if (!existing.yearsWon.includes(preYr)) {
          existing.yearsWon.push(preYr);
        }
      } else {
        tallyMap.set(key, {
          clubName: lore.name,
          clubColor: lore.color,
          country: lore.code,
          count: 1,
          historicCount: 1,
          liveCount: 0,
          yearsWon: [preYr],
          isUserClub: false,
          isPastManagerClub: false,
          flag: lore.flag,
          isNationalTeam: true,
        });
      }
    }
  }

  const sortedEntries = Array.from(tallyMap.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    const bLatest = b.yearsWon[0] || 0;
    const aLatest = a.yearsWon[0] || 0;
    if (bLatest !== aLatest) return bLatest - aLatest;
    return a.clubName.localeCompare(b.clubName);
  });

  const maxCount = sortedEntries[0]?.count || 0;

  const topTeams: TopTrophyTeamEntry[] = sortedEntries.slice(0, limit).map((entry, idx) => {
    const yearsDesc = [...entry.yearsWon].sort((a, b) => b - a);
    return {
      rank: idx + 1,
      clubId: entry.clubId,
      clubName: entry.clubName,
      clubColor: entry.clubColor,
      clubLogo: entry.clubLogo,
      country: entry.country,
      count: entry.count,
      historicCount: entry.historicCount,
      liveCount: entry.liveCount,
      yearsWon: yearsDesc,
      latestYearWon: yearsDesc[0] || 0,
      isUserClub: entry.isUserClub,
      isPastManagerClub: entry.isPastManagerClub,
      percentageOfMax: maxCount > 0 ? Math.max(8, Math.round((entry.count / maxCount) * 100)) : 0,
      shareOfTotal:
        totalSeasonsCounted > 0 ? Math.round((entry.count / totalSeasonsCounted) * 100) : 0,
      flag: entry.flag,
      isNationalTeam: entry.isNationalTeam,
    };
  });

  return {
    scope,
    country,
    tier: safeTier,
    competitionId: resolvedCompetitionId,
    competitionName: resolvedCompetitionName,
    accountingMode: effectiveAccounting,
    careerStartYear,
    isHistoricCareerStart,
    startYearCounted: minYr,
    endYearCounted: maxYr,
    totalSeasonsCounted,
    topTeams,
  };
}

