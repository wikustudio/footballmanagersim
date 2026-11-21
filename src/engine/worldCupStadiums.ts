import {
  HostNation,
  PitchDesignId,
  PreGameDirective,
  StadiumArchitectureStyle,
} from '../types';
import { MatchTimeOfDay } from './liveSimVisualEngine';

export type WorldCupVenueStage =
  | 'group_1'
  | 'group_2'
  | 'group_3'
  | 'quarter_final'
  | 'semi_final'
  | 'final';

export interface WorldCupVenue {
  name: string;
  city: string;
  capacity: number;
  stadiumStyle: StadiumArchitectureStyle;
  pitchDesignId: PitchDesignId;
  timeOfDay: MatchTimeOfDay;
  atmosphereTag: string;
  isFinalVenue?: boolean;
}

interface HostVenueSeed {
  name: string;
  city: string;
  capacity: number;
  stadiumStyle: StadiumArchitectureStyle;
  pitchDesignId: PitchDesignId;
  atmosphereTag: string;
}

/**
 * Curated original host-country World Cup stadiums for all 17 host nations (1950–2062+).
 * Index 0 is the flagship Grand Final venue by default unless an edition-specific override applies
 * (e.g., USA 1994 Rose Bowl vs 2026 MetLife, GER 1974 Munich vs 2006/2038 Berlin, ITA 1990 Rome vs 2050 Milan).
 */
const HOST_STADIUM_ROSTERS: Record<string, HostVenueSeed[]> = {
  USA: [
    {
      name: 'MetLife Stadium',
      city: 'New York / New Jersey',
      capacity: 82500,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Grand Final Bowl',
    },
    {
      name: 'SoFi Stadium',
      city: 'Los Angeles',
      capacity: 70240,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'West Coast Dome',
    },
    {
      name: 'AT&T Stadium',
      city: 'Dallas',
      capacity: 80000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Texas Mega-Arena',
    },
    {
      name: 'Lumen Field',
      city: 'Seattle',
      capacity: 69000,
      stadiumStyle: 'english_box',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Pacific Sound Fortress',
    },
    {
      name: 'Mercedes-Benz Stadium',
      city: 'Atlanta',
      capacity: 71000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'club_heritage',
      atmosphereTag: 'Southern Cauldron',
    },
    {
      name: 'Hard Rock Stadium',
      city: 'Miami',
      capacity: 65326,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Tropical Showpiece',
    },
  ],
  USA_1994: [
    {
      name: 'Rose Bowl',
      city: 'Pasadena / Los Angeles',
      capacity: 94194,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Historic 1994 Final Bowl',
    },
    {
      name: 'Giants Stadium',
      city: 'East Rutherford',
      capacity: 76322,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'East Coast Classic',
    },
    {
      name: 'Soldier Field',
      city: 'Chicago',
      capacity: 63160,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Lakefront Arena',
    },
    {
      name: 'Cotton Bowl',
      city: 'Dallas',
      capacity: 64000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Texas Classic Bowl',
    },
    {
      name: 'Stanford Stadium',
      city: 'Palo Alto',
      capacity: 84147,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Bay Area Bowl',
    },
    {
      name: 'RFK Stadium',
      city: 'Washington, D.C.',
      capacity: 53121,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Capital Ground',
    },
  ],
  GER: [
    {
      name: 'Olympiastadion',
      city: 'Berlin',
      capacity: 74475,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Iconic Olympic Track Arena',
    },
    {
      name: 'Allianz Arena',
      city: 'Munich',
      capacity: 75024,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Bavarian Illuminati Bowl',
    },
    {
      name: 'Signal Iduna Park',
      city: 'Dortmund',
      capacity: 81365,
      stadiumStyle: 'english_box',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Yellow Wall Cauldron',
    },
    {
      name: 'Volksparkstadion',
      city: 'Hamburg',
      capacity: 57000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Northern Harbor Bowl',
    },
    {
      name: 'MHPArena',
      city: 'Stuttgart',
      capacity: 60058,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'club_heritage',
      atmosphereTag: 'Neckar Valley Arena',
    },
    {
      name: 'Deutsche Bank Park',
      city: 'Frankfurt',
      capacity: 58000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Waldstadion Fortress',
    },
  ],
  GER_1974: [
    {
      name: 'Olympiastadion',
      city: 'Munich',
      capacity: 77800,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: '1974 Final Olympic Bowl',
    },
    {
      name: 'Waldstadion',
      city: 'Frankfurt',
      capacity: 62000,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Rain-Soaked Classic',
    },
    {
      name: 'Westfalenstadion',
      city: 'Dortmund',
      capacity: 54000,
      stadiumStyle: 'english_box',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Ruhr Football Temple',
    },
    {
      name: 'Volksparkstadion',
      city: 'Hamburg',
      capacity: 61200,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Hanseatic Bowl',
    },
    {
      name: 'Neckarstadion',
      city: 'Stuttgart',
      capacity: 72200,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Swabian Track Bowl',
    },
    {
      name: 'Rheinstadion',
      city: 'Düsseldorf',
      capacity: 67000,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Rhine Bowl',
    },
  ],
  BRA: [
    {
      name: 'Maracanã',
      city: 'Rio de Janeiro',
      capacity: 78838,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Cathedral of World Football',
    },
    {
      name: 'Estádio Mineirão',
      city: 'Belo Horizonte',
      capacity: 61927,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Minas Gerais Amphitheater',
    },
    {
      name: 'Arena Corinthians',
      city: 'São Paulo',
      capacity: 63321,
      stadiumStyle: 'english_box',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Paulista Cauldron',
    },
    {
      name: 'Estádio Nacional Mané Garrincha',
      city: 'Brasília',
      capacity: 72788,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Capital Colosseum',
    },
    {
      name: 'Arena Fonte Nova',
      city: 'Salvador',
      capacity: 51900,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Bahian Carnival Bowl',
    },
    {
      name: 'Estádio Beira-Rio',
      city: 'Porto Alegre',
      capacity: 50842,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'club_heritage',
      atmosphereTag: 'Guaíba Lakefront Arena',
    },
  ],
  ESP: [
    {
      name: 'Santiago Bernabéu',
      city: 'Madrid',
      capacity: 85000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Royal Madrid Colosseum',
    },
    {
      name: 'Spotify Camp Nou',
      city: 'Barcelona',
      capacity: 99354,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Catalan Giant Bowl',
    },
    {
      name: 'Metropolitano',
      city: 'Madrid',
      capacity: 70460,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Modern Madrid Bowl',
    },
    {
      name: 'Estadio La Cartuja',
      city: 'Seville',
      capacity: 60000,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Andalusian Olympic Arena',
    },
    {
      name: 'San Mamés',
      city: 'Bilbao',
      capacity: 53289,
      stadiumStyle: 'english_box',
      pitchDesignId: 'club_heritage',
      atmosphereTag: 'Basque Cathedral',
    },
    {
      name: 'Mestalla',
      city: 'Valencia',
      capacity: 49430,
      stadiumStyle: 'english_box',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Steep Mediterranean Stand',
    },
  ],
  ENG: [
    {
      name: 'Wembley Stadium',
      city: 'London',
      capacity: 90000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Home of Football',
    },
    {
      name: 'Old Trafford',
      city: 'Manchester',
      capacity: 74310,
      stadiumStyle: 'english_box',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Theatre of Dreams',
    },
    {
      name: 'Anfield',
      city: 'Liverpool',
      capacity: 61276,
      stadiumStyle: 'english_box',
      pitchDesignId: 'club_heritage',
      atmosphereTag: 'Merseyside Fortress',
    },
    {
      name: 'Tottenham Hotspur Stadium',
      city: 'London',
      capacity: 62850,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'North London Bowl',
    },
    {
      name: "St James' Park",
      city: 'Newcastle',
      capacity: 52305,
      stadiumStyle: 'english_box',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Tyneside Cathedral',
    },
    {
      name: 'Villa Park',
      city: 'Birmingham',
      capacity: 42640,
      stadiumStyle: 'english_box',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Midlands Classic Ground',
    },
  ],
  ITA: [
    {
      name: 'San Siro',
      city: 'Milan',
      capacity: 75817,
      stadiumStyle: 'english_box',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'La Scala del Calcio',
    },
    {
      name: 'Stadio Olimpico',
      city: 'Rome',
      capacity: 72698,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Eternal City Olympic Bowl',
    },
    {
      name: 'Stadio Diego Armando Maradona',
      city: 'Naples',
      capacity: 54726,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Neapolitan Volcano',
    },
    {
      name: 'Allianz Stadium',
      city: 'Turin',
      capacity: 41507,
      stadiumStyle: 'english_box',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Piedmont Cauldron',
    },
    {
      name: 'Stadio San Nicola',
      city: 'Bari',
      capacity: 58270,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Adriatic Spaceship Bowl',
    },
    {
      name: 'Stadio Artemio Franchi',
      city: 'Florence',
      capacity: 43147,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Tuscan Heritage Ground',
    },
  ],
  FRA: [
    {
      name: 'Stade de France',
      city: 'Paris',
      capacity: 81338,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Saint-Denis National Bowl',
    },
    {
      name: 'Stade Vélodrome',
      city: 'Marseille',
      capacity: 67394,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Mediterranean Thunderdome',
    },
    {
      name: 'Parc des Princes',
      city: 'Paris',
      capacity: 47929,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Parisian Acoustic Bowl',
    },
    {
      name: 'Groupama Stadium',
      city: 'Lyon',
      capacity: 59186,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Rhône Showpiece',
    },
    {
      name: 'Stade Pierre-Mauroy',
      city: 'Lille',
      capacity: 50186,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'club_heritage',
      atmosphereTag: 'Northern Grand Arena',
    },
    {
      name: 'Stade de la Beaujoire',
      city: 'Nantes',
      capacity: 35322,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Loire Valley Stadium',
    },
  ],
  ARG: [
    {
      name: 'Estadio Monumental',
      city: 'Buenos Aires',
      capacity: 84567,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Núñez Giant Bowl',
    },
    {
      name: 'La Bombonera',
      city: 'Buenos Aires',
      capacity: 54000,
      stadiumStyle: 'english_box',
      pitchDesignId: 'club_heritage',
      atmosphereTag: 'Beating Heart of La Boca',
    },
    {
      name: 'Estadio Mario Alberto Kempes',
      city: 'Córdoba',
      capacity: 57000,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Chateau Carreras Bowl',
    },
    {
      name: 'Estadio Gigante de Arroyito',
      city: 'Rosario',
      capacity: 46955,
      stadiumStyle: 'english_box',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Paraná River Fortress',
    },
    {
      name: 'Estadio Malvinas Argentinas',
      city: 'Mendoza',
      capacity: 42000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Andes Foothill Arena',
    },
    {
      name: 'Estadio Único Diego Armando Maradona',
      city: 'La Plata',
      capacity: 53000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Twin-Arch Showpiece',
    },
  ],
  MEX: [
    {
      name: 'Estadio Azteca',
      city: 'Mexico City',
      capacity: 87523,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'High-Altitude Colosseum',
    },
    {
      name: 'Estadio BBVA',
      city: 'Monterrey',
      capacity: 53500,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Cerro de la Silla Giant',
    },
    {
      name: 'Estadio Akron',
      city: 'Guadalajara',
      capacity: 49850,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Volcano Crater Bowl',
    },
    {
      name: 'Estadio Olímpico Universitario',
      city: 'Mexico City',
      capacity: 72000,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: '1968 Olympic Landmark',
    },
    {
      name: 'Estadio Jalisco',
      city: 'Guadalajara',
      capacity: 55020,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Classic 1970/86 Temple',
    },
    {
      name: 'Estadio Cuauhtémoc',
      city: 'Puebla',
      capacity: 51726,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Highland Fortress',
    },
  ],
  KSA: [
    {
      name: 'King Fahd Stadium',
      city: 'Riyadh',
      capacity: 70200,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Desert Tent Landmark',
    },
    {
      name: 'King Salman International Stadium',
      city: 'Riyadh',
      capacity: 92000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Capital Mega-Bowl',
    },
    {
      name: 'King Abdullah Sports City',
      city: 'Jeddah',
      capacity: 62345,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'The Shining Jewel',
    },
    {
      name: 'Prince Mohammed bin Salman Stadium',
      city: 'Qiddiya',
      capacity: 46979,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Tuwaiq Cliff Arena',
    },
    {
      name: 'Aramco Stadium',
      city: 'Al Khobar',
      capacity: 46096,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Arabian Gulf Bowl',
    },
    {
      name: 'NEOM Stadium',
      city: 'NEOM',
      capacity: 46010,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Red Sea Sky Arena',
    },
  ],
  JPN: [
    {
      name: 'International Stadium',
      city: 'Yokohama',
      capacity: 72327,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: '2002 Final Grand Arena',
    },
    {
      name: 'Saitama Stadium 2002',
      city: 'Saitama',
      capacity: 63700,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Football-Only Fortress',
    },
    {
      name: 'Nagai Stadium',
      city: 'Osaka',
      capacity: 47816,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Kansai Track Bowl',
    },
    {
      name: 'Shizuoka Stadium ECOPA',
      city: 'Fukuroi',
      capacity: 50889,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Mount Fuji Foothill Arena',
    },
    {
      name: 'Sapporo Dome',
      city: 'Sapporo',
      capacity: 41484,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Hokkaido Retractable Pitch',
    },
    {
      name: 'Kashima Soccer Stadium',
      city: 'Ibaraki',
      capacity: 40728,
      stadiumStyle: 'english_box',
      pitchDesignId: 'club_heritage',
      atmosphereTag: 'Intimate Coastal Box',
    },
  ],
  RSA: [
    {
      name: 'Soccer City',
      city: 'Johannesburg',
      capacity: 94736,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'The Calabash Showpiece',
    },
    {
      name: 'Cape Town Stadium',
      city: 'Cape Town',
      capacity: 64100,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Table Mountain Bowl',
    },
    {
      name: 'Moses Mabhida Stadium',
      city: 'Durban',
      capacity: 62760,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Indian Ocean Arch Arena',
    },
    {
      name: 'Ellis Park Stadium',
      city: 'Johannesburg',
      capacity: 62567,
      stadiumStyle: 'english_box',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Highveld Cauldron',
    },
    {
      name: 'Loftus Versfeld Stadium',
      city: 'Pretoria',
      capacity: 51762,
      stadiumStyle: 'english_box',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Jacaranda City Ground',
    },
    {
      name: 'Nelson Mandela Bay Stadium',
      city: 'Port Elizabeth',
      capacity: 46000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Eastern Cape Bowl',
    },
  ],
  RUS: [
    {
      name: 'Luzhniki Stadium',
      city: 'Moscow',
      capacity: 81000,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Moscow Grand Colosseum',
    },
    {
      name: 'Krestovsky Stadium',
      city: 'Saint Petersburg',
      capacity: 68134,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Neva Island Arena',
    },
    {
      name: 'Fisht Olympic Stadium',
      city: 'Sochi',
      capacity: 47659,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Black Sea Coastal Bowl',
    },
    {
      name: 'Kazan Arena',
      city: 'Kazan',
      capacity: 45379,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Volga River Showpiece',
    },
    {
      name: 'Otkritie Arena',
      city: 'Moscow',
      capacity: 45360,
      stadiumStyle: 'english_box',
      pitchDesignId: 'club_heritage',
      atmosphereTag: 'Spartak Fortress',
    },
    {
      name: 'Volgograd Arena',
      city: 'Volgograd',
      capacity: 45568,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Mamayev Kurgan Bowl',
    },
  ],
  QAT: [
    {
      name: 'Lusail Stadium',
      city: 'Doha',
      capacity: 88966,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Golden Bowl Final Arena',
    },
    {
      name: 'Al Bayt Stadium',
      city: 'Al Khor',
      capacity: 68895,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Bayt Al Sha’ar Pavilion',
    },
    {
      name: 'Khalifa International Stadium',
      city: 'Al Rayyan',
      capacity: 45857,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Doha Heritage Bowl',
    },
    {
      name: 'Education City Stadium',
      city: 'Al Rayyan',
      capacity: 44667,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'continental_carpet',
      atmosphereTag: 'Diamond in the Desert',
    },
    {
      name: 'Al Janoub Stadium',
      city: 'Al Wakrah',
      capacity: 44325,
      stadiumStyle: 'continental_bowl',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Dhow Sail Arena',
    },
    {
      name: 'Stadium 974',
      city: 'Doha',
      capacity: 44089,
      stadiumStyle: 'english_box',
      pitchDesignId: 'club_heritage',
      atmosphereTag: 'Ras Abu Aboud Harbor Box',
    },
  ],
  SUI: [
    {
      name: 'Wankdorf Stadium',
      city: 'Bern',
      capacity: 64000,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Miracle of Bern Ground',
    },
    {
      name: 'St. Jakob Stadium',
      city: 'Basel',
      capacity: 51500,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Rhine Corner Classic',
    },
    {
      name: 'Stade Olympique de la Pontaise',
      city: 'Lausanne',
      capacity: 43000,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Lake Geneva Track Bowl',
    },
    {
      name: 'Hardturm Stadium',
      city: 'Zurich',
      capacity: 35000,
      stadiumStyle: 'english_box',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Limmat Valley Ground',
    },
    {
      name: 'Charmilles Stadium',
      city: 'Geneva',
      capacity: 35997,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Alpine Terrace Ground',
    },
    {
      name: 'Cornaredo Stadium',
      city: 'Lugano',
      capacity: 26000,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Ticino Southern Ground',
    },
  ],
  SWE: [
    {
      name: 'Råsunda Stadium',
      city: 'Solna / Stockholm',
      capacity: 52400,
      stadiumStyle: 'english_box',
      pitchDesignId: 'classic_cut',
      atmosphereTag: '1958 Final Heritage Ground',
    },
    {
      name: 'Ullevi',
      city: 'Gothenburg',
      capacity: 53500,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'West Coast Olympic Bowl',
    },
    {
      name: 'Malmö Stadion',
      city: 'Malmö',
      capacity: 30000,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Skåne Track Ground',
    },
    {
      name: 'Olympia',
      city: 'Helsingborg',
      capacity: 27000,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Øresund Terrace Ground',
    },
    {
      name: 'Idrottsparken',
      city: 'Norrköping',
      capacity: 20000,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Classic Nordic Ground',
    },
    {
      name: 'Eyravallen',
      city: 'Örebro',
      capacity: 13000,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Intimate Heritage Ground',
    },
  ],
  CHI: [
    {
      name: 'Estadio Nacional',
      city: 'Santiago',
      capacity: 68679,
      stadiumStyle: 'olympic_track',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Andean National Bowl',
    },
    {
      name: 'Estadio Sausalito',
      city: 'Viña del Mar',
      capacity: 22000,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'emerald_stripe',
      atmosphereTag: 'Pacific Coast Ground',
    },
    {
      name: 'Estadio El Teniente',
      city: 'Rancagua',
      capacity: 18000,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Copper Valley Ground',
    },
    {
      name: 'Estadio Carlos Dittborn',
      city: 'Arica',
      capacity: 17786,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Atacama Desert Ground',
    },
    {
      name: 'Estadio Santa Laura',
      city: 'Santiago',
      capacity: 25000,
      stadiumStyle: 'english_box',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Historic Capital Ground',
    },
    {
      name: 'Estadio Playa Ancha',
      city: 'Valparaíso',
      capacity: 20000,
      stadiumStyle: 'open_terrace',
      pitchDesignId: 'classic_cut',
      atmosphereTag: 'Harbor Hills Ground',
    },
  ],
};

function selectRosterKey(hostNation: HostNation, year?: number): string {
  const code = (hostNation.code || 'USA').toUpperCase();
  if (code === 'USA' && ((year !== undefined && year <= 1998) || hostNation.stadium.toLowerCase().includes('rose bowl'))) {
    return 'USA_1994';
  }
  if (code === 'GER' && ((year !== undefined && year <= 1978) || hostNation.city.toLowerCase().includes('munich'))) {
    return 'GER_1974';
  }
  return HOST_STADIUM_ROSTERS[code] ? code : 'USA';
}

function defaultTimeOfDayForStage(stage: WorldCupVenueStage): MatchTimeOfDay {
  // Sunlit World Cup afternoons for opening group games, transitioning to floodlit nights for deciders & knockouts
  if (stage === 'group_1' || stage === 'group_2') return 'day';
  return 'night';
}

/**
 * Returns the complete original stadium roster for the given World Cup host country & edition.
 * Index 0 is always guaranteed to match the edition's canonical Grand Final venue (`hostNation.stadium`).
 */
export function getHostCountryStadiumRoster(
  hostNation: HostNation,
  year?: number
): WorldCupVenue[] {
  const key = selectRosterKey(hostNation, year);
  const rawRoster = HOST_STADIUM_ROSTERS[key] || HOST_STADIUM_ROSTERS.USA;

  // Ensure the edition's exact Grand Final venue sits at index 0 (e.g., ITA 1990 Rome vs 2050 Milan)
  const targetFinalLower = (hostNation.stadium || '').trim().toLowerCase();
  const targetCityLower = (hostNation.city || '').trim().toLowerCase();
  const existingFinalIdx = rawRoster.findIndex(
    (s) =>
      s.name.toLowerCase() === targetFinalLower &&
      (!targetCityLower || s.city.toLowerCase().includes(targetCityLower.split('/')[0].trim()))
  );
  const fallbackNameIdx =
    existingFinalIdx >= 0
      ? existingFinalIdx
      : rawRoster.findIndex((s) => s.name.toLowerCase() === targetFinalLower);

  let ordered: HostVenueSeed[];
  if (fallbackNameIdx >= 0) {
    const matched = rawRoster[fallbackNameIdx];
    ordered = [matched, ...rawRoster.filter((_, i) => i !== fallbackNameIdx)];
  } else {
    // Unknown custom hostNation override: synthesize flagship entry while keeping authentic backup venues
    ordered = [
      {
        name: hostNation.stadium || rawRoster[0].name,
        city: hostNation.city || rawRoster[0].city,
        capacity: 78000,
        stadiumStyle: 'continental_bowl',
        pitchDesignId: 'continental_carpet',
        atmosphereTag: 'Grand Final Bowl',
      },
      ...rawRoster.slice(1),
    ];
  }

  return ordered.map((seed, idx) => ({
    ...seed,
    timeOfDay: idx === 0 ? 'night' : 'day',
    isFinalVenue: idx === 0,
  }));
}

/**
 * Deterministically assigns an authentic original host-country stadium for every stage of the World Cup.
 * - Group Matchdays 1–3, Quarter-Final, and Semi-Final travel across distinct real host cities/grounds.
 * - Grand Final is ALWAYS staged in the host nation's flagship Final stadium under floodlights.
 */
export function getWorldCupMatchVenue(
  hostNation: HostNation,
  stage: WorldCupVenueStage,
  year?: number
): WorldCupVenue {
  const roster = getHostCountryStadiumRoster(hostNation, year);
  const stageIndexMap: Record<WorldCupVenueStage, number> = {
    final: 0,
    semi_final: 1,
    quarter_final: 2,
    group_1: 3,
    group_2: 4,
    group_3: 5,
  };
  const targetIdx = stageIndexMap[stage] ?? 0;
  const chosen = roster[targetIdx % roster.length] || roster[0];
  return {
    ...chosen,
    timeOfDay: defaultTimeOfDayForStage(stage),
    isFinalVenue: stage === 'final',
  };
}

/**
 * Infers the venue stage cleanly from the World Cup mode + stage label when explicit stage isn't supplied.
 */
export function inferWorldCupVenueStage(
  mode: 'group' | 'knockout' | 'final',
  stageLabel: string
): WorldCupVenueStage {
  const lower = (stageLabel || '').toLowerCase();
  if (mode === 'final' || lower.includes('grand final')) return 'final';
  if (lower.includes('semi-final') || lower.includes('semi final')) return 'semi_final';
  if (lower.includes('quarter-final') || lower.includes('quarter final')) return 'quarter_final';
  if (lower.includes('matchday 3') || lower.includes('md 3')) return 'group_3';
  if (lower.includes('matchday 2') || lower.includes('md 2')) return 'group_2';
  if (mode === 'group') return 'group_1';
  return 'quarter_final';
}

/**
 * Computes realistic World Cup attendance (93%–100% sellout; 100% for Grand Final & Host Nation matches).
 */
export function computeWorldCupAttendance(
  venue: WorldCupVenue,
  stage: WorldCupVenueStage,
  isHostPlaying: boolean = false
): number {
  const cap = Math.max(10000, venue.capacity);
  if (stage === 'final' || isHostPlaying) return cap;
  const fillRateByStage: Record<WorldCupVenueStage, number> = {
    final: 1.0,
    semi_final: 0.992,
    quarter_final: 0.978,
    group_3: 0.968,
    group_2: 0.955,
    group_1: 0.962,
  };
  return Math.min(cap, Math.round(cap * (fillRateByStage[stage] ?? 0.96)));
}

/**
 * Maps World Cup pre-game directives & halftime director interventions to StadiumBowl3D tactic labels.
 */
export function mapWorldCupDirectiveToTactic(
  directive?: PreGameDirective,
  halftimeIntervention?: 'steady' | 'all_out_attack' | 'park_the_bus' | null
): string {
  if (halftimeIntervention === 'all_out_attack') return 'Gegenpress';
  if (halftimeIntervention === 'park_the_bus') return 'Park the Bus';
  switch (directive) {
    case 'high_press':
      return 'Gegenpress';
    case 'controlled_possession':
      return 'Tiki-Taka';
    case 'low_block_counter':
      return 'Counter-Attack';
    case 'direct_wing_play':
      return 'Wing Play';
    default:
      return 'Balanced';
  }
}

export function formatStadiumStyleLabel(style: StadiumArchitectureStyle): string {
  switch (style) {
    case 'olympic_track':
      return 'Olympic Track Bowl';
    case 'english_box':
      return 'Classic Steep-Tier Box';
    case 'open_terrace':
      return 'Heritage Terrace';
    case 'continental_bowl':
    default:
      return 'Continental Bowl';
  }
}
