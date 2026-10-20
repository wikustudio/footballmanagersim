import { Club, GameState } from '../types';
import { REAL_CLUB_ALIASES } from './moddingEngine';

/**
 * Authentic Metropolitan & Urban Catchment Populations for football club regions.
 * Default metropolitan population is provided per major city / district.
 */
export const METRO_POPULATIONS: Record<string, { city: string; population: number; regionName: string }> = {
  // ==========================================
  // Germany (GER)
  // ==========================================
  'munich': { city: 'Munich', population: 2600000, regionName: 'Munich Metropolitan Region' },
  'münchen': { city: 'Munich', population: 2600000, regionName: 'Munich Metropolitan Region' },
  'berlin': { city: 'Berlin', population: 4500000, regionName: 'Berlin/Brandenburg' },
  'dortmund': { city: 'Dortmund', population: 5100000, regionName: 'Ruhr Metropolis' },
  'gelsenkirchen': { city: 'Gelsenkirchen', population: 5100000, regionName: 'Ruhr Metropolis' },
  'leipzig': { city: 'Leipzig', population: 1100000, regionName: 'Central German Metropolitan' },
  'stuttgart': { city: 'Stuttgart', population: 2800000, regionName: 'Stuttgart Region' },
  'frankfurt': { city: 'Frankfurt', population: 5800000, regionName: 'Frankfurt Rhein-Main' },
  'hamburg': { city: 'Hamburg', population: 3300000, regionName: 'Hamburg Metropolitan' },
  'cologne': { city: 'Cologne', population: 3500000, regionName: 'Cologne Bonn Region' },
  'köln': { city: 'Cologne', population: 3500000, regionName: 'Cologne Bonn Region' },
  'leverkusen': { city: 'Leverkusen', population: 3500000, regionName: 'Cologne Bonn Region' },
  'moenchengladbach': { city: 'Mönchengladbach', population: 1200000, regionName: 'Lower Rhine' },
  'mönchengladbach': { city: 'Mönchengladbach', population: 1200000, regionName: 'Lower Rhine' },
  'bremen': { city: 'Bremen', population: 1300000, regionName: 'Bremen/Oldenburg' },
  'hoffenheim': { city: 'Sinsheim / Hoffenheim', population: 36000, regionName: 'Kraichgau Rural District' },
  'sinsheim': { city: 'Sinsheim / Hoffenheim', population: 36000, regionName: 'Kraichgau Rural District' },
  'heidenheim': { city: 'Heidenheim', population: 50000, regionName: 'Ostalb District' },
  'kiel': { city: 'Kiel', population: 250000, regionName: 'Kieler Förde' },
  'freiburg': { city: 'Freiburg', population: 660000, regionName: 'Breisgau Region' },
  'augsburg': { city: 'Augsburg', population: 890000, regionName: 'Augsburg Region' },
  'mainz': { city: 'Mainz', population: 220000, regionName: 'Rhein-Main' },
  'wolfsburg': { city: 'Wolfsburg', population: 130000, regionName: 'Braunschweig-Wolfsburg' },
  'bochum': { city: 'Bochum', population: 5100000, regionName: 'Ruhr Metropolis' },
  'darmstadt': { city: 'Darmstadt', population: 160000, regionName: 'Frankfurt Rhein-Main' },
  'st. pauli': { city: 'Hamburg St. Pauli', population: 3300000, regionName: 'Hamburg Metropolitan' },
  'düsseldorf': { city: 'Düsseldorf', population: 1550000, regionName: 'Rhine-Ruhr Central' },
  'duesseldorf': { city: 'Düsseldorf', population: 1550000, regionName: 'Rhine-Ruhr Central' },
  'hannover': { city: 'Hanover', population: 1150000, regionName: 'Hanover Region' },
  'nürnberg': { city: 'Nuremberg', population: 1350000, regionName: 'Nuremberg Metropolitan' },
  'nuernberg': { city: 'Nuremberg', population: 1350000, regionName: 'Nuremberg Metropolitan' },
  'karlsruhe': { city: 'Karlsruhe', population: 310000, regionName: 'Karlsruhe Technology Region' },
  'kaiserslautern': { city: 'Kaiserslautern', population: 100000, regionName: 'Palatinate District' },
  'braunschweig': { city: 'Braunschweig', population: 250000, regionName: 'Braunschweig Region' },
  'magdeburg': { city: 'Magdeburg', population: 240000, regionName: 'Magdeburg Urban Region' },
  'rostock': { city: 'Rostock', population: 210000, regionName: 'Rostock Coastal Region' },
  'wiesbaden': { city: 'Wiesbaden', population: 280000, regionName: 'Rhein-Main West' },
  'bielefeld': { city: 'Bielefeld', population: 340000, regionName: 'Ostwestfalen-Lippe' },
  'osnabrück': { city: 'Osnabrück', population: 170000, regionName: 'Osnabrück Land' },
  'münster': { city: 'Münster', population: 320000, regionName: 'Münsterland' },
  'dresden': { city: 'Dresden', population: 560000, regionName: 'Dresden Elbe Valley' },
  'ulm': { city: 'Ulm', population: 130000, regionName: 'Danube-Iller' },
  'regensburg': { city: 'Regensburg', population: 155000, regionName: 'Upper Palatinate' },
  'elversberg': { city: 'Spiesen-Elversberg', population: 13000, regionName: 'Saarland District' },
  'paderborn': { city: 'Paderborn', population: 155000, regionName: 'Paderborn Land' },
  'fürth': { city: 'Fürth', population: 130000, regionName: 'Middle Franconia' },
  'fuerth': { city: 'Fürth', population: 130000, regionName: 'Middle Franconia' },
  'sandhausen': { city: 'Sandhausen', population: 15000, regionName: 'Rhein-Neckar District' },
  'ingolstadt': { city: 'Ingolstadt', population: 140000, regionName: 'Ingolstadt Region' },
  'saarbrücken': { city: 'Saarbrücken', population: 180000, regionName: 'Saarbrücken Urban' },
  'essen': { city: 'Essen', population: 580000, regionName: 'Ruhr Metropolis' },
  'duisburg': { city: 'Duisburg', population: 500000, regionName: 'Ruhr Metropolis' },
  'mannheim': { city: 'Mannheim', population: 315000, regionName: 'Rhine-Neckar' },
  'aachen': { city: 'Aachen', population: 250000, regionName: 'Aachen District' },
  'cottbus': { city: 'Cottbus', population: 100000, regionName: 'Lusatia Region' },

  // ==========================================
  // England (ENG)
  // ==========================================
  'london ontario': { city: 'London, Ontario', population: 540000, regionName: 'London Census Metropolitan Area' },
  'london': { city: 'London', population: 9800000, regionName: 'Greater London' },
  'manchester': { city: 'Manchester', population: 2800000, regionName: 'Greater Manchester' },
  'liverpool': { city: 'Liverpool', population: 1550000, regionName: 'Liverpool City Region' },
  'birmingham': { city: 'Birmingham', population: 3800000, regionName: 'West Midlands' },
  'newcastle jets': { city: 'Newcastle', population: 500000, regionName: 'Greater Newcastle NSW' },
  'newcastle hunter': { city: 'Newcastle', population: 500000, regionName: 'Greater Newcastle NSW' },
  'newcastle': { city: 'Newcastle', population: 1650000, regionName: 'Tyne and Wear' },
  'leeds': { city: 'Leeds', population: 1900000, regionName: 'West Yorkshire' },
  'sheffield': { city: 'Sheffield', population: 1400000, regionName: 'Sheffield City Region' },
  'nottingham': { city: 'Nottingham', population: 770000, regionName: 'Nottingham Urban Area' },
  'leicester': { city: 'Leicester', population: 560000, regionName: 'Leicester Urban Area' },
  'brighton': { city: 'Brighton', population: 480000, regionName: 'Brighton and Hove' },
  'southampton': { city: 'Southampton', population: 930000, regionName: 'South Hampshire' },
  'bournemouth': { city: 'Bournemouth', population: 500000, regionName: 'South East Dorset' },
  'wolverhampton': { city: 'Wolverhampton', population: 3800000, regionName: 'West Midlands' },
  'luton': { city: 'Luton', population: 230000, regionName: 'Bedfordshire' },
  'burnley': { city: 'Burnley', population: 95000, regionName: 'East Lancashire' },
  'wrexham': { city: 'Wrexham', population: 65000, regionName: 'Wrexham County Borough' },
  'ipswich': { city: 'Ipswich', population: 140000, regionName: 'Suffolk' },
  'norwich': { city: 'Norwich', population: 215000, regionName: 'Norfolk' },
  'sunderland': { city: 'Sunderland', population: 340000, regionName: 'Tyne and Wear South' },
  'middlesbrough': { city: 'Middlesbrough', population: 175000, regionName: 'Teesside' },
  'stoke': { city: 'Stoke-on-Trent', population: 380000, regionName: 'The Potteries' },
  'hull': { city: 'Kingston upon Hull', population: 320000, regionName: 'East Yorkshire' },
  'plymouth': { city: 'Plymouth', population: 265000, regionName: 'Devon South Coast' },
  'blackburn': { city: 'Blackburn', population: 150000, regionName: 'East Lancashire' },
  'preston': { city: 'Preston', population: 145000, regionName: 'Central Lancashire' },
  'bristol': { city: 'Bristol', population: 700000, regionName: 'Greater Bristol' },
  'derby': { city: 'Derby', population: 260000, regionName: 'Derbyshire' },
  'watford': { city: 'Watford', population: 130000, regionName: 'Hertfordshire' },
  'portsmouth': { city: 'Portsmouth', population: 860000, regionName: 'South Hampshire East' },
  'coventry': { city: 'Coventry', population: 350000, regionName: 'West Midlands East' },
  'reading': { city: 'Reading', population: 340000, regionName: 'Thames Valley' },
  'west bromwich': { city: 'West Bromwich', population: 380000, regionName: 'Black Country' },
  'west brom': { city: 'West Bromwich', population: 380000, regionName: 'Black Country' },
  'huddersfield': { city: 'Huddersfield', population: 165000, regionName: 'West Yorkshire South' },
  'bolton': { city: 'Bolton', population: 290000, regionName: 'Greater Manchester North' },
  'blackpool': { city: 'Blackpool', population: 140000, regionName: 'Fylde Coast' },
  'wigan': { city: 'Wigan', population: 330000, regionName: 'Greater Manchester West' },
  'rotherham': { city: 'Rotherham', population: 260000, regionName: 'South Yorkshire' },
  'peterborough': { city: 'Peterborough', population: 215000, regionName: 'Cambridgeshire' },
  'oxford': { city: 'Oxford', population: 160000, regionName: 'Oxfordshire' },
  'lincoln': { city: 'Lincoln', population: 130000, regionName: 'Lincolnshire' },
  'shrewsbury': { city: 'Shrewsbury', population: 75000, regionName: 'Shropshire' },
  'wycombe': { city: 'High Wycombe', population: 125000, regionName: 'Buckinghamshire' },
  'exeter': { city: 'Exeter', population: 135000, regionName: 'Devon' },
  'cheltenham': { city: 'Cheltenham', population: 120000, regionName: 'Gloucestershire' },
  'cambridge': { city: 'Cambridge', population: 150000, regionName: 'Cambridgeshire' },
  'carlisle': { city: 'Carlisle', population: 110000, regionName: 'Cumbria' },
  'northampton': { city: 'Northampton', population: 245000, regionName: 'Northamptonshire' },
  'mansfield': { city: 'Mansfield', population: 110000, regionName: 'Nottinghamshire North' },
  'stockport': { city: 'Stockport', population: 295000, regionName: 'Greater Manchester South' },
  'chesterfield': { city: 'Chesterfield', population: 105000, regionName: 'Derbyshire North' },
  'walsall': { city: 'Walsall', population: 285000, regionName: 'West Midlands North' },
  'doncaster': { city: 'Doncaster', population: 310000, regionName: 'South Yorkshire East' },
  'bradford': { city: 'Bradford', population: 545000, regionName: 'West Yorkshire' },
  'crewe': { city: 'Crewe', population: 75000, regionName: 'Cheshire East' },
  'harrogate': { city: 'Harrogate', population: 75000, regionName: 'North Yorkshire' },
  'salford': { city: 'Salford', population: 270000, regionName: 'Greater Manchester' },
  'colchester': { city: 'Colchester', population: 195000, regionName: 'Essex' },
  'gillingham': { city: 'Gillingham', population: 280000, regionName: 'Medway' },
  'grimsby': { city: 'Grimsby', population: 160000, regionName: 'North East Lincolnshire' },
  'swindon': { city: 'Swindon', population: 230000, regionName: 'Wiltshire' },
  'milton keynes': { city: 'Milton Keynes', population: 290000, regionName: 'Buckinghamshire' },
  'accrington': { city: 'Accrington', population: 35000, regionName: 'Hyndburn' },
  'morecambe': { city: 'Morecambe', population: 52000, regionName: 'Lancashire Coast' },
  'fleetwood': { city: 'Fleetwood', population: 26000, regionName: 'Wyre Coast' },
  'barrow': { city: 'Barrow-in-Furness', population: 67000, regionName: 'Cumbria Coast' },

  // ==========================================
  // Spain (ESP)
  // ==========================================
  'madrid': { city: 'Madrid', population: 6800000, regionName: 'Community of Madrid' },
  'barcelona sc': { city: 'Guayaquil', population: 3100000, regionName: 'Guayaquil Metropolitan' },
  'barcelona': { city: 'Barcelona', population: 5600000, regionName: 'Barcelona Metropolitan' },
  'valencia': { city: 'Valencia', population: 1800000, regionName: 'Valencia Metropolitan' },
  'seville': { city: 'Seville', population: 1540000, regionName: 'Seville Metropolitan' },
  'sevilla': { city: 'Seville', population: 1540000, regionName: 'Seville Metropolitan' },
  'bilbao': { city: 'Bilbao', population: 1040000, regionName: 'Greater Bilbao' },
  'san sebastian': { city: 'San Sebastián', population: 450000, regionName: 'Gipuzkoa' },
  'san sebastián': { city: 'San Sebastián', population: 450000, regionName: 'Gipuzkoa' },
  'villarreal': { city: 'Villarreal', population: 51000, regionName: 'Castellón' },
  'girona': { city: 'Girona', population: 103000, regionName: 'Girona Region' },
  'vigo': { city: 'Vigo', population: 300000, regionName: 'Pontevedra / Rías Baixas' },
  'celta': { city: 'Vigo', population: 300000, regionName: 'Pontevedra / Rías Baixas' },
  'coruña': { city: 'A Coruña', population: 400000, regionName: 'A Coruña Metropolitan' },
  'coruna': { city: 'A Coruña', population: 400000, regionName: 'A Coruña Metropolitan' },
  'pamplona': { city: 'Pamplona', population: 360000, regionName: 'Navarre Metropolitan' },
  'osasuna': { city: 'Pamplona', population: 360000, regionName: 'Navarre Metropolitan' },
  'mallorca': { city: 'Palma de Mallorca', population: 550000, regionName: 'Balearic Islands' },
  'palma': { city: 'Palma de Mallorca', population: 550000, regionName: 'Balearic Islands' },
  'las palmas': { city: 'Las Palmas de Gran Canaria', population: 380000, regionName: 'Gran Canaria' },
  'valladolid': { city: 'Valladolid', population: 415000, regionName: 'Castile and León' },
  'vitoria': { city: 'Vitoria-Gasteiz', population: 255000, regionName: 'Álava / Basque Country' },
  'alavés': { city: 'Vitoria-Gasteiz', population: 255000, regionName: 'Álava / Basque Country' },
  'alaves': { city: 'Vitoria-Gasteiz', population: 255000, regionName: 'Álava / Basque Country' },
  'leganés': { city: 'Leganés', population: 190000, regionName: 'South Madrid' },
  'leganes': { city: 'Leganés', population: 190000, regionName: 'South Madrid' },
  'getafe': { city: 'Getafe', population: 185000, regionName: 'South Madrid' },
  'vallecas': { city: 'Vallecas / Madrid', population: 6800000, regionName: 'Community of Madrid' },
  'zaragoza': { city: 'Zaragoza', population: 700000, regionName: 'Aragon Central' },
  'granada': { city: 'Granada', population: 470000, regionName: 'Granada Urban Area' },
  'málaga': { city: 'Málaga', population: 1000000, regionName: 'Costa del Sol' },
  'malaga': { city: 'Málaga', population: 1000000, regionName: 'Costa del Sol' },
  'santander': { city: 'Santander', population: 175000, regionName: 'Cantabria' },
  'gijón': { city: 'Gijón', population: 270000, regionName: 'Asturias Central' },
  'gijon': { city: 'Gijón', population: 270000, regionName: 'Asturias Central' },
  'oviedo': { city: 'Oviedo', population: 220000, regionName: 'Asturias Central' },
  'almería': { city: 'Almería', population: 200000, regionName: 'Almería Coastal' },
  'almeria': { city: 'Almería', population: 200000, regionName: 'Almería Coastal' },
  'cádiz': { city: 'Cádiz', population: 115000, regionName: 'Bay of Cádiz' },
  'cadiz': { city: 'Cádiz', population: 115000, regionName: 'Bay of Cádiz' },
  'córdoba': { city: 'Córdoba', population: 325000, regionName: 'Córdoba Province' },
  'cordoba': { city: 'Córdoba', population: 325000, regionName: 'Córdoba Province' },
  'elche': { city: 'Elche', population: 235000, regionName: 'Baix Vinalopó' },
  'castellón': { city: 'Castellón de la Plana', population: 175000, regionName: 'Plana Alta' },
  'castellon': { city: 'Castellón de la Plana', population: 175000, regionName: 'Plana Alta' },
  'huesca': { city: 'Huesca', population: 54000, regionName: 'Upper Aragon' },
  'tenerife': { city: 'Santa Cruz de Tenerife', population: 400000, regionName: 'Tenerife Metropolitan' },
  'cartagena': { city: 'Cartagena', population: 215000, regionName: 'Campo de Cartagena' },
  'burgos': { city: 'Burgos', population: 175000, regionName: 'Burgos District' },
  'albacete': { city: 'Albacete', population: 175000, regionName: 'La Mancha' },
  'miranda': { city: 'Miranda de Ebro', population: 35000, regionName: 'Ebro Valley' },
  'ferrol': { city: 'Ferrol', population: 65000, regionName: 'Ferrolterra' },
  'elda': { city: 'Elda', population: 52000, regionName: 'Medio Vinalopó' },
  'andorra': { city: 'Andorra la Vella', population: 78000, regionName: 'Principality of Andorra' },

  // ==========================================
  // Italy (ITA)
  // ==========================================
  'milan': { city: 'Milan', population: 4300000, regionName: 'Milan Metropolitan' },
  'milano': { city: 'Milan', population: 4300000, regionName: 'Milan Metropolitan' },
  'rome': { city: 'Rome', population: 4350000, regionName: 'Metropolitan City of Rome' },
  'roma': { city: 'Rome', population: 4350000, regionName: 'Metropolitan City of Rome' },
  'turin': { city: 'Turin', population: 2200000, regionName: 'Turin Metropolitan' },
  'torino': { city: 'Turin', population: 2200000, regionName: 'Turin Metropolitan' },
  'naples': { city: 'Naples', population: 3000000, regionName: 'Naples Metropolitan' },
  'napoli': { city: 'Naples', population: 3000000, regionName: 'Naples Metropolitan' },
  'bergamo': { city: 'Bergamo', population: 1100000, regionName: 'Lombardy Bergamo' },
  'florence': { city: 'Florence', population: 1010000, regionName: 'Florence Metropolitan' },
  'firenze': { city: 'Florence', population: 1010000, regionName: 'Florence Metropolitan' },
  'bologna': { city: 'Bologna', population: 1020000, regionName: 'Bologna Metropolitan' },
  'sassuolo': { city: 'Sassuolo', population: 41000, regionName: 'Modena Province' },
  'empoli': { city: 'Empoli', population: 49000, regionName: 'Tuscany West' },
  'monza': { city: 'Monza', population: 880000, regionName: 'Monza e Brianza' },
  'genoa': { city: 'Genoa', population: 840000, regionName: 'Genoa Metropolitan' },
  'genova': { city: 'Genoa', population: 840000, regionName: 'Genoa Metropolitan' },
  'verona': { city: 'Verona', population: 930000, regionName: 'Verona Metropolitan' },
  'udine': { city: 'Udine', population: 180000, regionName: 'Friuli Central' },
  'cagliari': { city: 'Cagliari', population: 430000, regionName: 'Cagliari Metropolitan' },
  'lecce': { city: 'Lecce', population: 100000, regionName: 'Salento' },
  'como': { city: 'Como', population: 90000, regionName: 'Lake Como Region' },
  'venezia': { city: 'Venice', population: 26000, regionName: 'Venice Metropolitan' },
  'venice': { city: 'Venice', population: 260000, regionName: 'Venice Metropolitan' },
  'parma': { city: 'Parma', population: 200000, regionName: 'Emilia-Romagna Parma' },
  'salerno': { city: 'Salerno', population: 130000, regionName: 'Salerno Coast' },
  'frosinone': { city: 'Frosinone', population: 45000, regionName: 'Ciociaria' },
  'palermo': { city: 'Palermo', population: 1000000, regionName: 'Palermo Metropolitan' },
  'bari': { city: 'Bari', population: 1250000, regionName: 'Bari Metropolitan' },
  'brescia': { city: 'Brescia', population: 200000, regionName: 'Brescia Plain' },
  'spezia': { city: 'La Spezia', population: 93000, regionName: 'Gulf of Poets' },
  'cremona': { city: 'Cremona', population: 72000, regionName: 'Po Valley' },
  'pisa': { city: 'Pisa', population: 90000, regionName: 'Pisa Urban Area' },
  'modena': { city: 'Modena', population: 185000, regionName: 'Modena District' },
  'reggio emilia': { city: 'Reggio Emilia', population: 170000, regionName: 'Reggio Emilia District' },
  'cosenza': { city: 'Cosenza', population: 65000, regionName: 'Crati Valley' },
  'catanzaro': { city: 'Catanzaro', population: 85000, regionName: 'Isthmus of Catanzaro' },
  'cesena': { city: 'Cesena', population: 97000, regionName: 'Romagna Central' },
  'carrara': { city: 'Carrara', population: 62000, regionName: 'Apuan Alps' },
  'mantova': { city: 'Mantua', population: 50000, regionName: 'Mantua District' },
  'cittadella': { city: 'Cittadella', population: 20000, regionName: 'Alta Padovana' },
  'bolzano': { city: 'Bolzano', population: 107000, regionName: 'South Tyrol' },
  'südtirol': { city: 'Bolzano', population: 107000, regionName: 'South Tyrol' },
  'sudtirol': { city: 'Bolzano', population: 107000, regionName: 'South Tyrol' },

  // ==========================================
  // France (FRA)
  // ==========================================
  'paris': { city: 'Paris', population: 12400000, regionName: 'Île-de-France' },
  'marseille': { city: 'Marseille', population: 1870000, regionName: 'Aix-Marseille-Provence' },
  'lyon': { city: 'Lyon', population: 2280000, regionName: 'Lyon Metropolis' },
  'lille': { city: 'Lille', population: 1510000, regionName: 'Lille European Metropolis' },
  'nice': { city: 'Nice', population: 1010000, regionName: 'Nice Côte d’Azur' },
  'monaco': { city: 'Monaco', population: 39000, regionName: 'Principality of Monaco' },
  'lens': { city: 'Lens', population: 370000, regionName: 'Lens-Liévin Urban Area' },
  'rennes': { city: 'Rennes', population: 750000, regionName: 'Rennes Métropole' },
  'toulouse': { city: 'Toulouse', population: 1050000, regionName: 'Toulouse Métropole' },
  'strasbourg': { city: 'Strasbourg', population: 515000, regionName: 'Eurométropole de Strasbourg' },
  'brest': { city: 'Brest', population: 320000, regionName: 'Brest Métropole' },
  'montpellier': { city: 'Montpellier', population: 500000, regionName: 'Montpellier Méditerranée' },
  'nantes': { city: 'Nantes', population: 670000, regionName: 'Nantes Métropole' },
  'reims': { city: 'Reims', population: 325000, regionName: 'Grand Reims' },
  'auxerre': { city: 'Auxerre', population: 35000, regionName: 'Yonne District' },
  'angers': { city: 'Angers', population: 300000, regionName: 'Angers Loire Métropole' },
  'le havre': { city: 'Le Havre', population: 235000, regionName: 'Le Havre Seine Métropole' },
  'saint-étienne': { city: 'Saint-Étienne', population: 405000, regionName: 'Saint-Étienne Métropole' },
  'saint-etienne': { city: 'Saint-Étienne', population: 405000, regionName: 'Saint-Étienne Métropole' },
  'metz': { city: 'Metz', population: 390000, regionName: 'Metz Eurométropole' },
  'lorient': { city: 'Lorient', population: 215000, regionName: 'Lorient Agglomération' },
  'clermont': { city: 'Clermont-Ferrand', population: 300000, regionName: 'Clermont Auvergne' },
  'bordeaux': { city: 'Bordeaux', population: 1000000, regionName: 'Bordeaux Métropole' },
  'ajaccio': { city: 'Ajaccio', population: 73000, regionName: 'Southern Corsica' },
  'bastia': { city: 'Bastia', population: 48000, regionName: 'Northern Corsica' },
  'amiens': { city: 'Amiens', population: 180000, regionName: 'Amiens Métropole' },
  'guingamp': { city: 'Guingamp', population: 8000, regionName: 'Armor Côtes-d’Armor' },
  'caen': { city: 'Caen', population: 270000, regionName: 'Caen la Mer' },
  'grenoble': { city: 'Grenoble', population: 450000, regionName: 'Grenoble-Alpes Métropole' },
  'pau': { city: 'Pau', population: 160000, regionName: 'Pau Béarn Pyrénées' },
  'rodez': { city: 'Rodez', population: 25000, regionName: 'Rodez Agglomération' },
  'dunkerque': { city: 'Dunkirk', population: 190000, regionName: 'Dunkerque Grand Littoral' },
  'laval': { city: 'Laval', population: 115000, regionName: 'Laval Agglomération' },
  'troyes': { city: 'Troyes', population: 170000, regionName: 'Troyes Champagne Métropole' },
  'valenciennes': { city: 'Valenciennes', population: 350000, regionName: 'Valenciennes Métropole' },
  'martigues': { city: 'Martigues', population: 48000, regionName: 'Pays de Martigues' },
  'sochaux': { city: 'Sochaux / Montbéliard', population: 140000, regionName: 'Pays de Montbéliard' },
  'red star': { city: 'Saint-Ouen / Paris', population: 12400000, regionName: 'Île-de-France' },

  // ==========================================
  // Portugal (POR)
  // ==========================================
  'lisbon': { city: 'Lisbon', population: 2900000, regionName: 'Lisbon Metropolitan' },
  'lisboa': { city: 'Lisbon', population: 2900000, regionName: 'Lisbon Metropolitan' },
  'porto': { city: 'Porto', population: 1750000, regionName: 'Porto Metropolitan' },
  'braga': { city: 'Braga', population: 850000, regionName: 'Minho Central' },
  'guimarães': { city: 'Guimarães', population: 160000, regionName: 'Ave Subregion' },
  'guimaraes': { city: 'Guimarães', population: 160000, regionName: 'Ave Subregion' },
  'famalicão': { city: 'Vila Nova de Famalicão', population: 135000, regionName: 'Ave Subregion' },
  'famalicao': { city: 'Vila Nova de Famalicão', population: 135000, regionName: 'Ave Subregion' },
  'moreira': { city: 'Moreira de Cónegos', population: 17000, regionName: 'Ave Subregion' },
  'santa clara': { city: 'Ponta Delgada', population: 68000, regionName: 'Azores Central' },
  'ponta delgada': { city: 'Ponta Delgada', population: 68000, regionName: 'Azores Central' },
  'vila do conde': { city: 'Vila do Conde', population: 80000, regionName: 'Greater Porto Coast' },
  'rio ave': { city: 'Vila do Conde', population: 80000, regionName: 'Greater Porto Coast' },
  'arouca': { city: 'Arouca', population: 21000, regionName: 'Área Metropolitana do Porto' },
  'casa pia': { city: 'Lisbon', population: 2900000, regionName: 'Lisbon Metropolitan' },
  'barcelos': { city: 'Barcelos', population: 117000, regionName: 'Cávado Subregion' },
  'estoril': { city: 'Cascais / Estoril', population: 214000, regionName: 'Lisbon Riviera' },
  'amadora': { city: 'Amadora', population: 175000, regionName: 'Greater Lisbon' },
  'funchal': { city: 'Funchal', population: 105000, regionName: 'Madeira Island' },
  'marítimo': { city: 'Funchal', population: 105000, regionName: 'Madeira Island' },
  'maritimo': { city: 'Funchal', population: 105000, regionName: 'Madeira Island' },
  'nacional': { city: 'Funchal', population: 105000, regionName: 'Madeira Island' },
  'aves': { city: 'Vila das Aves', population: 9000, regionName: 'Ave Subregion' },
  'faro': { city: 'Faro', population: 67000, regionName: 'Algarve Metropolitan' },
  'farense': { city: 'Faro', population: 67000, regionName: 'Algarve Metropolitan' },
  'vizela': { city: 'Vizela', population: 24000, regionName: 'Ave Subregion' },
  'chaves': { city: 'Chaves', population: 40000, regionName: 'Alto Tâmega' },
  'portimão': { city: 'Portimão', population: 60000, regionName: 'Algarve Barlavento' },
  'portimao': { city: 'Portimão', population: 60000, regionName: 'Algarve Barlavento' },
  'portimonense': { city: 'Portimão', population: 60000, regionName: 'Algarve Barlavento' },
  'coimbra': { city: 'Coimbra', population: 140000, regionName: 'Central Portugal' },
  'leiria': { city: 'Leiria', population: 130000, regionName: 'Oeste e Centro' },
  'setúbal': { city: 'Setúbal', population: 125000, regionName: 'Setúbal Peninsula' },
  'setubal': { city: 'Setúbal', population: 125000, regionName: 'Setúbal Peninsula' },
  'penafiel': { city: 'Penafiel', population: 72000, regionName: 'Tâmega e Sousa' },
  'tondela': { city: 'Tondela', population: 26000, regionName: 'Viseu Dão-Lafões' },
  'mafra': { city: 'Mafra', population: 86000, regionName: 'Greater Lisbon North' },
  'alverca': { city: 'Alverca do Ribatejo', population: 31000, regionName: 'Lisbon Metropolitan North' },
  'torres vedras': { city: 'Torres Vedras', population: 83000, regionName: 'Oeste Subregion' },
  'oliveira de azeméis': { city: 'Oliveira de Azeméis', population: 66000, regionName: 'Aveiro District' },
  'paços de ferreira': { city: 'Paços de Ferreira', population: 55000, regionName: 'Sousa Valley' },
  'pacos de ferreira': { city: 'Paços de Ferreira', population: 55000, regionName: 'Sousa Valley' },
  'matosinhos': { city: 'Matosinhos', population: 175000, regionName: 'Greater Porto Coast' },
  'covilhã': { city: 'Covilhã', population: 46000, regionName: 'Cova da Beira' },
  'covilha': { city: 'Covilhã', population: 46000, regionName: 'Cova da Beira' },
  'póvoa de varzim': { city: 'Póvoa de Varzim', population: 63000, regionName: 'Greater Porto North' },
  'povoa de varzim': { city: 'Póvoa de Varzim', population: 63000, regionName: 'Greater Porto North' },
  'belenenses': { city: 'Belém / Lisbon', population: 2900000, regionName: 'Lisbon Metropolitan' },
  'os belenenses': { city: 'Belém / Lisbon', population: 2900000, regionName: 'Lisbon Metropolitan' },

  // ==========================================
  // United States & MLS/USL (USA)
  // ==========================================
  'atlanta': { city: 'Atlanta', population: 6100000, regionName: 'Metro Atlanta' },
  'austin': { city: 'Austin', population: 2300000, regionName: 'Greater Austin' },
  'charlotte': { city: 'Charlotte', population: 2700000, regionName: 'Charlotte Metro' },
  'chicago': { city: 'Chicago', population: 9500000, regionName: 'Chicagoland' },
  'cincinnati': { city: 'Cincinnati', population: 2250000, regionName: 'Greater Cincinnati' },
  'columbus': { city: 'Columbus', population: 2150000, regionName: 'Columbus Metro' },
  'dallas': { city: 'Dallas-Fort Worth', population: 7900000, regionName: 'Dallas-Fort Worth Metroplex' },
  'denver': { city: 'Denver', population: 3000000, regionName: 'Denver Metro' },
  'colorado': { city: 'Denver / Colorado', population: 3000000, regionName: 'Denver Metro' },
  'houston': { city: 'Houston', population: 7300000, regionName: 'Greater Houston' },
  'kansas city': { city: 'Kansas City', population: 2200000, regionName: 'Kansas City Metro' },
  'kansas': { city: 'Kansas City', population: 2200000, regionName: 'Kansas City Metro' },
  'los angeles': { city: 'Los Angeles', population: 13200000, regionName: 'Greater Los Angeles' },
  'miami': { city: 'Miami', population: 6200000, regionName: 'South Florida Metro' },
  'minneapolis': { city: 'Minneapolis-Saint Paul', population: 3700000, regionName: 'Twin Cities' },
  'minnesota': { city: 'Minneapolis-Saint Paul', population: 3700000, regionName: 'Twin Cities' },
  'nashville': { city: 'Nashville', population: 2000000, regionName: 'Nashville Metro' },
  'new england': { city: 'Boston / New England', population: 4900000, regionName: 'Greater Boston' },
  'boston': { city: 'Boston', population: 4900000, regionName: 'Greater Boston' },
  'new york': { city: 'New York', population: 19700000, regionName: 'New York Metropolitan' },
  'orlando': { city: 'Orlando', population: 2700000, regionName: 'Greater Orlando' },
  'philadelphia': { city: 'Philadelphia', population: 6250000, regionName: 'Delaware Valley' },
  'portland': { city: 'Portland', population: 2500000, regionName: 'Portland Metro' },
  'salt lake': { city: 'Salt Lake City', population: 1250000, regionName: 'Wasatch Front' },
  'san diego': { city: 'San Diego', population: 3300000, regionName: 'San Diego County' },
  'san jose': { city: 'San Jose', population: 2000000, regionName: 'Silicon Valley' },
  'seattle': { city: 'Seattle', population: 4000000, regionName: 'Seattle Metro' },
  'st. louis': { city: 'St. Louis', population: 2800000, regionName: 'Greater St. Louis' },
  'saint louis': { city: 'St. Louis', population: 2800000, regionName: 'Greater St. Louis' },
  'washington': { city: 'Washington D.C.', population: 6400000, regionName: 'Washington Metro' },
  'louisville': { city: 'Louisville', population: 1300000, regionName: 'Greater Louisville' },
  'tampa': { city: 'Tampa Bay', population: 3200000, regionName: 'Tampa Bay Area' },
  'sacramento': { city: 'Sacramento', population: 2400000, regionName: 'Greater Sacramento' },
  'detroit': { city: 'Detroit', population: 4400000, regionName: 'Metro Detroit' },
  'indianapolis': { city: 'Indianapolis', population: 2100000, regionName: 'Indianapolis Metro' },
  'pittsburgh': { city: 'Pittsburgh', population: 2370000, regionName: 'Pittsburgh Metro' },
  'las vegas': { city: 'Las Vegas', population: 2300000, regionName: 'Las Vegas Valley' },
  'san antonio': { city: 'San Antonio', population: 2600000, regionName: 'Greater San Antonio' },
  'el paso': { city: 'El Paso', population: 870000, regionName: 'El Paso Metro' },
  'albuquerque': { city: 'Albuquerque', population: 920000, regionName: 'Albuquerque Metro' },
  'charleston': { city: 'Charleston', population: 820000, regionName: 'Charleston Metro' },
  'hartford': { city: 'Hartford', population: 1200000, regionName: 'Greater Hartford' },
  'colorado springs': { city: 'Colorado Springs', population: 760000, regionName: 'Pikes Peak' },
  'brooklyn': { city: 'Brooklyn / New York', population: 19700000, regionName: 'New York Metropolitan' },
  'pawtucket': { city: 'Providence / Rhode Island', population: 1670000, regionName: 'Greater Providence' },
  'rhode island': { city: 'Providence / Rhode Island', population: 1670000, regionName: 'Greater Providence' },
  'monterey': { city: 'Monterey', population: 435000, regionName: 'Monterey County' },
  'memphis': { city: 'Memphis', population: 1340000, regionName: 'Greater Memphis' },
  'tulsa': { city: 'Tulsa', population: 1020000, regionName: 'Tulsa Metro' },
  'phoenix': { city: 'Phoenix', population: 4950000, regionName: 'Valley of the Sun' },
  'loudoun': { city: 'Loudoun County', population: 6400000, regionName: 'Washington Metro' },
  'omaha': { city: 'Omaha', population: 970000, regionName: 'Omaha-Council Bluffs' },
  'greenville': { city: 'Greenville', population: 940000, regionName: 'Upstate South Carolina' },
  'richmond': { city: 'Richmond', population: 1310000, regionName: 'Greater Richmond' },
  'madison': { city: 'Madison', population: 680000, regionName: 'Madison Metro' },
  'chattanooga': { city: 'Chattanooga', population: 560000, regionName: 'Chattanooga Metro' },
  'spokane': { city: 'Spokane', population: 590000, regionName: 'Spokane Metro' },
  'boise': { city: 'Boise', population: 800000, regionName: 'Boise Metro' },
  'des moines': { city: 'Des Moines', population: 720000, regionName: 'Greater Des Moines' },
  'knoxville': { city: 'Knoxville', population: 890000, regionName: 'Knoxville Metro' },
  'lexington': { city: 'Lexington', population: 515000, regionName: 'Bluegrass Region' },

  // ==========================================
  // Ecuador (ECU)
  // ==========================================
  'quito': { city: 'Quito', population: 2800000, regionName: 'Metropolitan District of Quito' },
  'guayaquil': { city: 'Guayaquil', population: 3100000, regionName: 'Guayaquil Metropolitan' },
  'sangolquí': { city: 'Sangolquí / Valle de Los Chillos', population: 210000, regionName: 'Rumiñahui Canton' },
  'valle': { city: 'Sangolquí / Valle de Los Chillos', population: 210000, regionName: 'Rumiñahui Canton' },
  'cuenca': { city: 'Cuenca', population: 640000, regionName: 'Azuay Province' },
  'machala': { city: 'Machala', population: 300000, regionName: 'El Oro Province' },
  'ambato': { city: 'Ambato', population: 390000, regionName: 'Tungurahua Province' },
  'manta': { city: 'Manta', population: 270000, regionName: 'Manabí Coast' },
  'portoviejo': { city: 'Portoviejo', population: 320000, regionName: 'Manabí Central' },
  'loja': { city: 'Loja', population: 260000, regionName: 'Loja Province' },
  'echaleche': { city: 'Pilahuín / Echaleche', population: 15000, regionName: 'Ambato Rural Highlands' },
  'gualaceo': { city: 'Gualaceo', population: 43000, regionName: 'Azuay East' },
  'cumbayá': { city: 'Cumbayá', population: 40000, regionName: 'Quito East Valley' },
  'cumbaya': { city: 'Cumbayá', population: 40000, regionName: 'Quito East Valley' },
  'ibarra': { city: 'Ibarra', population: 220000, regionName: 'Imbabura Province' },
  'atuntaqui': { city: 'Atuntaqui', population: 45000, regionName: 'Antonio Ante Canton' },
  'pelileo': { city: 'Pelileo', population: 60000, regionName: 'Tungurahua Canton' },
  'esmeraldas': { city: 'Esmeraldas', population: 220000, regionName: 'Esmeraldas Province' },
  'riobamba': { city: 'Riobamba', population: 265000, regionName: 'Chimborazo Province' },
  'vinces': { city: 'Vinces', population: 75000, regionName: 'Los Ríos Canton' },
  'quevedo': { city: 'Quevedo', population: 215000, regionName: 'Los Ríos Province' },
  'emelec': { city: 'Guayaquil', population: 3100000, regionName: 'Guayaquil Metropolitan' },
  'aucas': { city: 'Quito', population: 2800000, regionName: 'Metropolitan District of Quito' },
  'el nacional': { city: 'Quito', population: 2800000, regionName: 'Metropolitan District of Quito' },
  'macará': { city: 'Ambato', population: 390000, regionName: 'Tungurahua Province' },
  'macara': { city: 'Ambato', population: 390000, regionName: 'Tungurahua Province' },
  'técnico universitario': { city: 'Ambato', population: 390000, regionName: 'Tungurahua Province' },
  'tecnico universitario': { city: 'Ambato', population: 390000, regionName: 'Tungurahua Province' },
  'delfín': { city: 'Manta', population: 270000, regionName: 'Manabí Coast' },
  'delfin': { city: 'Manta', population: 270000, regionName: 'Manabí Coast' },
  'orense': { city: 'Machala', population: 300000, regionName: 'El Oro Province' },
  'mushuc runa': { city: 'Echaleche / Ambato', population: 390000, regionName: 'Tungurahua Province' },

  // ==========================================
  // Scotland (SCO)
  // ==========================================
  'glasgow': { city: 'Glasgow', population: 1800000, regionName: 'Greater Glasgow' },
  'edinburgh': { city: 'Edinburgh', population: 550000, regionName: 'Lothian' },
  'aberdeen': { city: 'Aberdeen', population: 230000, regionName: 'North East Scotland' },
  'dundee': { city: 'Dundee', population: 150000, regionName: 'Dundee City Region' },
  'kilmarnock': { city: 'Kilmarnock', population: 47000, regionName: 'East Ayrshire' },
  'paisley': { city: 'Paisley', population: 77000, regionName: 'Renfrewshire' },
  'motherwell': { city: 'Motherwell', population: 33000, regionName: 'North Lanarkshire' },
  'perth blue': { city: 'Perth', population: 47000, regionName: 'Perth and Kinross' },
  'st johnstone': { city: 'Perth', population: 47000, regionName: 'Perth and Kinross' },
  'dingwall': { city: 'Dingwall', population: 6000, regionName: 'Ross and Cromarty' },
  'livingston': { city: 'Livingston', population: 57000, regionName: 'West Lothian' },
  'falkirk': { city: 'Falkirk', population: 36000, regionName: 'Forth Valley' },
  'dunfermline': { city: 'Dunfermline', population: 59000, regionName: 'West Fife' },
  'kirkcaldy': { city: 'Kirkcaldy', population: 50000, regionName: 'Central Fife' },
  'ayr': { city: 'Ayr', population: 47000, regionName: 'South Ayrshire' },
  'inverness': { city: 'Inverness', population: 65000, regionName: 'Scottish Highlands' },
  'greenock': { city: 'Greenock', population: 44000, regionName: 'Inverclyde' },
  'airdrie': { city: 'Airdrie', population: 37000, regionName: 'North Lanarkshire' },
  'hamilton academical': { city: 'Hamilton', population: 55000, regionName: 'South Lanarkshire' },
  'hamilton red': { city: 'Hamilton', population: 55000, regionName: 'South Lanarkshire' },
  'arbroath': { city: 'Arbroath', population: 24000, regionName: 'Angus Coast' },
  'dumfries': { city: 'Dumfries', population: 33000, regionName: 'Dumfries and Galloway' },
  'stirling': { city: 'Stirling', population: 38000, regionName: 'Central Scotland' },
  'celtic': { city: 'Glasgow', population: 1800000, regionName: 'Greater Glasgow' },
  'rangers': { city: 'Glasgow', population: 1800000, regionName: 'Greater Glasgow' },
  'partick': { city: 'Glasgow', population: 1800000, regionName: 'Greater Glasgow' },
  'queen\'s park': { city: 'Glasgow', population: 1800000, regionName: 'Greater Glasgow' },
  'hearts': { city: 'Edinburgh', population: 550000, regionName: 'Lothian' },
  'hibernian': { city: 'Edinburgh', population: 550000, regionName: 'Lothian' },
  'alloa': { city: 'Alloa', population: 21000, regionName: 'Clackmannanshire' },
  'montrose': { city: 'Montrose', population: 12000, regionName: 'Angus Coast' },
  'kelty': { city: 'Kelty', population: 7000, regionName: 'Fife Central' },
  'annan': { city: 'Annan', population: 9000, regionName: 'Annandale and Eskdale' },
  'peterhead': { city: 'Peterhead', population: 19000, regionName: 'Buchan Coast' },
  'forfar': { city: 'Forfar', population: 14000, regionName: 'Strathmore' },
  'dumbarton': { city: 'Dumbarton', population: 20000, regionName: 'West Dunbartonshire' },
  'cumbernauld': { city: 'Cumbernauld', population: 50000, regionName: 'North Lanarkshire' },

  // ==========================================
  // Wales (WAL)
  // ==========================================
  'croesoswallt': { city: 'Oswestry', population: 17500, regionName: 'Shropshire Borderlands' },
  'the new saints': { city: 'Oswestry', population: 17500, regionName: 'Shropshire Borderlands' },
  'oswestry': { city: 'Oswestry', population: 17500, regionName: 'Shropshire Borderlands' },
  'cei connah': { city: 'Connah\'s Quay', population: 17000, regionName: 'Deeside / Flintshire' },
  'connah': { city: 'Connah\'s Quay', population: 17000, regionName: 'Deeside / Flintshire' },
  'y bala': { city: 'Bala', population: 2000, regionName: 'Gwynedd Lake District' },
  'bala': { city: 'Bala', population: 2000, regionName: 'Gwynedd Lake District' },
  'pen-y-bont': { city: 'Bridgend', population: 145000, regionName: 'Bridgend County Borough' },
  'penybont': { city: 'Bridgend', population: 145000, regionName: 'Bridgend County Borough' },
  'bridgend': { city: 'Bridgend', population: 145000, regionName: 'Bridgend County Borough' },
  'y drenewydd': { city: 'Newtown', population: 11000, regionName: 'Powys Central' },
  'drenewydd': { city: 'Newtown', population: 11000, regionName: 'Powys Central' },
  'newtown': { city: 'Newtown', population: 11000, regionName: 'Powys Central' },
  'caernarfon': { city: 'Caernarfon', population: 10000, regionName: 'Gwynedd Coast' },
  'hwlffordd': { city: 'Haverfordwest', population: 15000, regionName: 'Pembrokeshire' },
  'haverfordwest': { city: 'Haverfordwest', population: 15000, regionName: 'Pembrokeshire' },
  'y barri': { city: 'Barry', population: 52000, regionName: 'Vale of Glamorgan' },
  'barry': { city: 'Barry', population: 52000, regionName: 'Vale of Glamorgan' },
  'cyncoed': { city: 'Cardiff', population: 480000, regionName: 'Cardiff Capital Region' },
  'cardiff': { city: 'Cardiff', population: 480000, regionName: 'Cardiff Capital Region' },
  'aberystwyth': { city: 'Aberystwyth', population: 18000, regionName: 'Ceredigion Coast' },
  'pontypridd': { city: 'Pontypridd', population: 33000, regionName: 'Rhondda Cynon Taf' },
  'bae colwyn': { city: 'Colwyn Bay', population: 34000, regionName: 'Conwy Bay' },
  'colwyn': { city: 'Colwyn Bay', population: 34000, regionName: 'Conwy Bay' },
  'llansawel': { city: 'Briton Ferry', population: 35000, regionName: 'Neath Port Talbot' },
  'briton ferry': { city: 'Briton Ferry', population: 35000, regionName: 'Neath Port Talbot' },
  'y fflint': { city: 'Flint', population: 13000, regionName: 'Flintshire Coast' },
  'fflint': { city: 'Flint', population: 13000, regionName: 'Flintshire Coast' },
  'flint': { city: 'Flint', population: 13000, regionName: 'Flintshire Coast' },
  'caerfyrddin': { city: 'Carmarthen', population: 16000, regionName: 'Carmarthenshire' },
  'carmarthen': { city: 'Carmarthen', population: 16000, regionName: 'Carmarthenshire' },
  'aberafan': { city: 'Port Talbot', population: 37000, regionName: 'Neath Port Talbot' },
  'afan lido': { city: 'Port Talbot', population: 37000, regionName: 'Neath Port Talbot' },
  'brychdyn': { city: 'Broughton', population: 6000, regionName: 'Flintshire Aerospace' },
  'airbus': { city: 'Broughton', population: 6000, regionName: 'Flintshire Aerospace' },
  'merthyr': { city: 'Merthyr Tydfil', population: 59000, regionName: 'Merthyr Tydfil County' },
  'swansea': { city: 'Swansea', population: 300000, regionName: 'Swansea Bay' },
  'newport': { city: 'Newport', population: 160000, regionName: 'Newport Urban Area' },

  // ==========================================
  // Brazil (BRA)
  // ==========================================
  'são paulo': { city: 'São Paulo', population: 22000000, regionName: 'Greater São Paulo' },
  'sao paulo': { city: 'São Paulo', population: 22000000, regionName: 'Greater São Paulo' },
  'palmeiras': { city: 'São Paulo', population: 22000000, regionName: 'Greater São Paulo' },
  'corinthians': { city: 'São Paulo', population: 22000000, regionName: 'Greater São Paulo' },
  'rio mengão': { city: 'Rio de Janeiro', population: 13000000, regionName: 'Rio de Janeiro Metropolitan' },
  'rio flu': { city: 'Rio de Janeiro', population: 13000000, regionName: 'Rio de Janeiro Metropolitan' },
  'rio fogão': { city: 'Rio de Janeiro', population: 13000000, regionName: 'Rio de Janeiro Metropolitan' },
  'rio cruzmaltino': { city: 'Rio de Janeiro', population: 13000000, regionName: 'Rio de Janeiro Metropolitan' },
  'rio de janeiro': { city: 'Rio de Janeiro', population: 13000000, regionName: 'Rio de Janeiro Metropolitan' },
  'flamengo': { city: 'Rio de Janeiro', population: 13000000, regionName: 'Rio de Janeiro Metropolitan' },
  'fluminense': { city: 'Rio de Janeiro', population: 13000000, regionName: 'Rio de Janeiro Metropolitan' },
  'botafogo': { city: 'Rio de Janeiro', population: 13000000, regionName: 'Rio de Janeiro Metropolitan' },
  'vasco': { city: 'Rio de Janeiro', population: 13000000, regionName: 'Rio de Janeiro Metropolitan' },
  'belo horizonte': { city: 'Belo Horizonte', population: 6000000, regionName: 'Belo Horizonte Metropolitan' },
  'cruzeiro': { city: 'Belo Horizonte', population: 6000000, regionName: 'Belo Horizonte Metropolitan' },
  'porto alegre': { city: 'Porto Alegre', population: 4400000, regionName: 'Porto Alegre Metropolitan' },
  'grêmio': { city: 'Porto Alegre', population: 4400000, regionName: 'Porto Alegre Metropolitan' },
  'gremio': { city: 'Porto Alegre', population: 4400000, regionName: 'Porto Alegre Metropolitan' },
  'internacional': { city: 'Porto Alegre', population: 4400000, regionName: 'Porto Alegre Metropolitan' },
  'curitiba': { city: 'Curitiba', population: 3700000, regionName: 'Curitiba Metropolitan' },
  'athletico paranaense': { city: 'Curitiba', population: 3700000, regionName: 'Curitiba Metropolitan' },
  'coritiba': { city: 'Curitiba', population: 3700000, regionName: 'Curitiba Metropolitan' },
  'salvador': { city: 'Salvador', population: 4000000, regionName: 'Salvador Metropolitan' },
  'bahia': { city: 'Salvador', population: 4000000, regionName: 'Salvador Metropolitan' },
  'fortaleza': { city: 'Fortaleza', population: 4150000, regionName: 'Fortaleza Metropolitan' },
  'ceará': { city: 'Fortaleza', population: 4150000, regionName: 'Fortaleza Metropolitan' },
  'ceara': { city: 'Fortaleza', population: 4150000, regionName: 'Fortaleza Metropolitan' },
  'recife': { city: 'Recife', population: 4050000, regionName: 'Recife Metropolitan' },
  'brasília': { city: 'Brasília', population: 4700000, regionName: 'Federal District' },
  'brasilia': { city: 'Brasília', population: 4700000, regionName: 'Federal District' },
  'goiânia': { city: 'Goiânia', population: 2650000, regionName: 'Goiânia Metropolitan' },
  'goiania': { city: 'Goiânia', population: 2650000, regionName: 'Goiânia Metropolitan' },
  'goiás': { city: 'Goiânia', population: 2650000, regionName: 'Goiânia Metropolitan' },
  'goias': { city: 'Goiânia', population: 2650000, regionName: 'Goiânia Metropolitan' },
  'belém': { city: 'Belém', population: 2500000, regionName: 'Belém Metropolitan' },
  'belem': { city: 'Belém', population: 2500000, regionName: 'Belém Metropolitan' },
  'manaus': { city: 'Manaus', population: 2300000, regionName: 'Manaus Metropolitan' },
  'campinas': { city: 'Campinas', population: 3350000, regionName: 'Campinas Metropolitan' },
  'santos': { city: 'Santos', population: 1850000, regionName: 'Baixada Santista' },
  'cuiabá': { city: 'Cuiabá', population: 1050000, regionName: 'Cuiabá Valley' },
  'cuiaba': { city: 'Cuiabá', population: 1050000, regionName: 'Cuiabá Valley' },
  'florianópolis': { city: 'Florianópolis', population: 1250000, regionName: 'Florianópolis Metropolitan' },
  'florianopolis': { city: 'Florianópolis', population: 1250000, regionName: 'Florianópolis Metropolitan' },
  'maceió': { city: 'Maceió', population: 1300000, regionName: 'Maceió Metropolitan' },
  'maceio': { city: 'Maceió', population: 1300000, regionName: 'Maceió Metropolitan' },
  'chapecó': { city: 'Chapecó', population: 255000, regionName: 'West Santa Catarina' },
  'chapeco': { city: 'Chapecó', population: 255000, regionName: 'West Santa Catarina' },
  'chapecoense': { city: 'Chapecó', population: 255000, regionName: 'West Santa Catarina' },
  'caxias': { city: 'Caxias do Sul', population: 520000, regionName: 'Serra Gaúcha' },
  'juventude': { city: 'Caxias do Sul', population: 520000, regionName: 'Serra Gaúcha' },
  'bragança paulista': { city: 'Bragança Paulista', population: 180000, regionName: 'Bragantina Region' },
  'braganca': { city: 'Bragança Paulista', population: 180000, regionName: 'Bragantina Region' },
  'bragança': { city: 'Bragança Paulista', population: 180000, regionName: 'Bragantina Region' },
  'criciúma': { city: 'Criciúma', population: 220000, regionName: 'Carbonífera Subregion' },
  'criciuma': { city: 'Criciúma', population: 220000, regionName: 'Carbonífera Subregion' },
  'itu': { city: 'Itu', population: 175000, regionName: 'Sorocaba Metro West' },
  'ituano': { city: 'Itu', population: 175000, regionName: 'Sorocaba Metro West' },
  'mirassol': { city: 'Mirassol', population: 64000, regionName: 'São José do Rio Preto Subregion' },
  'novo horizonte': { city: 'Novo Horizonte', population: 41000, regionName: 'São Paulo Northwest' },
  'novorizontino': { city: 'Novo Horizonte', population: 41000, regionName: 'São Paulo Northwest' },
  'são luís': { city: 'São Luís', population: 1600000, regionName: 'Greater São Luís' },
  'sao luis': { city: 'São Luís', population: 1600000, regionName: 'Greater São Luís' },
  'tombos': { city: 'Tombos', population: 10000, regionName: 'Zona da Mata Mineira' },
  'tombense': { city: 'Tombos', population: 10000, regionName: 'Zona da Mata Mineira' },

  // ==========================================
  // Poland (POL)
  // ==========================================
  'warszawa': { city: 'Warsaw', population: 3100000, regionName: 'Warsaw Metropolitan Area' },
  'warsaw': { city: 'Warsaw', population: 3100000, regionName: 'Warsaw Metropolitan Area' },
  'legia': { city: 'Warsaw', population: 3100000, regionName: 'Warsaw Metropolitan Area' },
  'kraków': { city: 'Kraków', population: 1400000, regionName: 'Kraków Metropolitan Area' },
  'krakow': { city: 'Kraków', population: 1400000, regionName: 'Kraków Metropolitan Area' },
  'łódź': { city: 'Łódź', population: 1000000, regionName: 'Łódź Metropolitan Area' },
  'lodz': { city: 'Łódź', population: 1000000, regionName: 'Łódź Metropolitan Area' },
  'wrocław': { city: 'Wrocław', population: 1100000, regionName: 'Wrocław Agglomeration' },
  'wroclaw': { city: 'Wrocław', population: 1100000, regionName: 'Wrocław Agglomeration' },
  'poznań': { city: 'Poznań', population: 1050000, regionName: 'Poznań Metropolitan Area' },
  'poznan': { city: 'Poznań', population: 1050000, regionName: 'Poznań Metropolitan Area' },
  'gdańsk': { city: 'Gdańsk / Tricity', population: 1300000, regionName: 'Tricity Agglomeration' },
  'gdansk': { city: 'Gdańsk / Tricity', population: 1300000, regionName: 'Tricity Agglomeration' },
  'gdynia': { city: 'Gdynia / Tricity', population: 1300000, regionName: 'Tricity Agglomeration' },
  'szczecin': { city: 'Szczecin', population: 780000, regionName: 'Szczecin Metropolitan Area' },
  'białystok': { city: 'Białystok', population: 300000, regionName: 'Białystok Agglomeration' },
  'bialystok': { city: 'Białystok', population: 300000, regionName: 'Białystok Agglomeration' },
  'katowice': { city: 'Katowice', population: 2700000, regionName: 'Upper Silesian Metropolis' },
  'zabrze': { city: 'Zabrze', population: 2700000, regionName: 'Upper Silesian Metropolis' },
  'gliwice': { city: 'Gliwice', population: 2700000, regionName: 'Upper Silesian Metropolis' },
  'chorzów': { city: 'Chorzów', population: 2700000, regionName: 'Upper Silesian Metropolis' },
  'chorzow': { city: 'Chorzów', population: 2700000, regionName: 'Upper Silesian Metropolis' },
  'częstochowa': { city: 'Częstochowa', population: 220000, regionName: 'Częstochowa Urban Area' },
  'czestochowa': { city: 'Częstochowa', population: 220000, regionName: 'Częstochowa Urban Area' },
  'raków': { city: 'Częstochowa', population: 220000, regionName: 'Częstochowa Urban Area' },
  'rakow': { city: 'Częstochowa', population: 220000, regionName: 'Częstochowa Urban Area' },
  'radom': { city: 'Radom', population: 210000, regionName: 'Radom Subregion' },
  'kielce': { city: 'Kielce', population: 195000, regionName: 'Kielce Metropolitan' },
  'lubin': { city: 'Lubin', population: 70000, regionName: 'Legnica-Głogów Copper Belt' },
  'mielec': { city: 'Mielec', population: 60000, regionName: 'Subcarpathian District' },
  'lublin': { city: 'Lublin', population: 340000, regionName: 'Lublin Metropolitan' },
  'rzeszów': { city: 'Rzeszów', population: 200000, regionName: 'Rzeszów Agglomeration' },
  'rzeszow': { city: 'Rzeszów', population: 200000, regionName: 'Rzeszów Agglomeration' },
  'opole': { city: 'Opole', population: 128000, regionName: 'Opole Silesia' },
  'płock': { city: 'Płock', population: 118000, regionName: 'Masovian Plain' },
  'plock': { city: 'Płock', population: 118000, regionName: 'Masovian Plain' },
  'nieciecza': { city: 'Nieciecza', population: 800, regionName: 'Tarnów County' },

  // ==========================================
  // Austria (AUT)
  // ==========================================
  'salzburg': { city: 'Salzburg', population: 360000, regionName: 'Salzburg Metropolitan' },
  'wals-siezenheim': { city: 'Salzburg', population: 360000, regionName: 'Salzburg Metropolitan' },
  'graz': { city: 'Graz', population: 440000, regionName: 'Graz Metropolitan' },
  'wien': { city: 'Vienna', population: 2900000, regionName: 'Vienna Metropolitan Area' },
  'vienna': { city: 'Vienna', population: 2900000, regionName: 'Vienna Metropolitan Area' },
  'linz': { city: 'Linz', population: 470000, regionName: 'Linz Central Region' },
  'wolfsberg': { city: 'Wolfsberg', population: 25000, regionName: 'Lavant Valley' },
  'lavanttal': { city: 'Wolfsberg', population: 25000, regionName: 'Lavant Valley' },
  'klagenfurt': { city: 'Klagenfurt', population: 105000, regionName: 'Carinthia Central' },
  'hartberg': { city: 'Hartberg', population: 7000, regionName: 'East Styria' },
  'altach': { city: 'Altach', population: 6500, regionName: 'Vorarlberg Rhine Valley' },
  'lustenau': { city: 'Lustenau', population: 24000, regionName: 'Vorarlberg Rhine Valley' },
  'wattens': { city: 'Wattens / Innsbruck', population: 310000, regionName: 'Innsbruck Metro' },
  'tirol': { city: 'Innsbruck / Tirol', population: 310000, regionName: 'Innsbruck Metro' },
  'innsbruck': { city: 'Innsbruck', population: 310000, regionName: 'Innsbruck Metro' },
  'ried': { city: 'Ried im Innkreis', population: 12500, regionName: 'Innviertel Region' },
  'innviertel': { city: 'Ried im Innkreis', population: 12500, regionName: 'Innviertel Region' },
  'st. pölten': { city: 'St. Pölten', population: 56000, regionName: 'Mostviertel Central' },
  'st. poelten': { city: 'St. Pölten', population: 56000, regionName: 'Mostviertel Central' },
  'bregenz': { city: 'Bregenz', population: 30000, regionName: 'Lake Constance Vorarlberg' },
  'mödling': { city: 'Mödling / Maria Enzersdorf', population: 21000, regionName: 'Vienna South Suburbs' },
  'moedling': { city: 'Mödling / Maria Enzersdorf', population: 21000, regionName: 'Vienna South Suburbs' },
  'maria enzersdorf': { city: 'Maria Enzersdorf', population: 21000, regionName: 'Vienna South Suburbs' },
  'horn': { city: 'Horn', population: 6500, regionName: 'Waldviertel Rural' },
  'waldviertel': { city: 'Horn', population: 6500, regionName: 'Waldviertel Rural' },
  'leoben': { city: 'Leoben', population: 25000, regionName: 'Upper Styria' },

  // ==========================================
  // Switzerland (SUI)
  // ==========================================
  'bern': { city: 'Bern', population: 420000, regionName: 'Bern Agglomeration' },
  'basel': { city: 'Basel', population: 830000, regionName: 'Basel Tri-National Eurodistrict' },
  'geneva': { city: 'Geneva', population: 600000, regionName: 'Grand Genève' },
  'genève': { city: 'Geneva', population: 600000, regionName: 'Grand Genève' },
  'lugano': { city: 'Lugano', population: 150000, regionName: 'Lugano Agglomeration' },
  'zürich': { city: 'Zürich', population: 1400000, regionName: 'Zürich Metropolitan' },
  'zurich': { city: 'Zürich', population: 1400000, regionName: 'Zürich Metropolitan' },
  'st. gallen': { city: 'St. Gallen', population: 170000, regionName: 'St. Gallen Agglomeration' },
  'luzern': { city: 'Lucerne', population: 220000, regionName: 'Lucerne Agglomeration' },
  'lucerne': { city: 'Lucerne', population: 220000, regionName: 'Lucerne Agglomeration' },
  'winterthur': { city: 'Winterthur', population: 120000, regionName: 'Winterthur Agglomeration' },
  'yverdon': { city: 'Yverdon-les-Bains', population: 30000, regionName: 'Nord Vaudois' },
  'lausanne': { city: 'Lausanne', population: 420000, regionName: 'Lausanne-Morges Agglomeration' },
  'sion': { city: 'Sion', population: 35000, regionName: 'Valais Central' },
  'thun': { city: 'Thun', population: 80000, regionName: 'Thun Agglomeration' },
  'aarau': { city: 'Aarau', population: 80000, regionName: 'Aarau Agglomeration' },
  'vaduz': { city: 'Vaduz', population: 5700, regionName: 'Principality of Liechtenstein' },
  'schaffhausen': { city: 'Schaffhausen', population: 38000, regionName: 'Schaffhausen Region' },
  'bellinzona': { city: 'Bellinzona', population: 44000, regionName: 'Sopraceneri' },
  'neuchâtel': { city: 'Neuchâtel', population: 45000, regionName: 'Littoral Neuchâtelois' },
  'neuchatel': { city: 'Neuchâtel', population: 45000, regionName: 'Littoral Neuchâtelois' },

  // ==========================================
  // Australia & New Zealand (AUS)
  // ==========================================
  'sydney': { city: 'Sydney', population: 5300000, regionName: 'Greater Sydney' },
  'melbourne': { city: 'Melbourne', population: 5100000, regionName: 'Greater Melbourne' },
  'adelaide': { city: 'Adelaide', population: 1400000, regionName: 'Greater Adelaide' },
  'gosford': { city: 'Central Coast / Gosford', population: 340000, regionName: 'Central Coast NSW' },
  'central coast': { city: 'Central Coast / Gosford', population: 340000, regionName: 'Central Coast NSW' },
  'wellington': { city: 'Wellington', population: 435000, regionName: 'Greater Wellington' },
  'brisbane': { city: 'Brisbane', population: 2600000, regionName: 'Greater Brisbane' },
  'perth': { city: 'Perth', population: 2200000, regionName: 'Greater Perth' },
  'campbelltown': { city: 'Campbelltown / Macarthur', population: 320000, regionName: 'South Western Sydney' },
  'macarthur': { city: 'Campbelltown / Macarthur', population: 320000, regionName: 'South Western Sydney' },
  'tarneit': { city: 'Tarneit / Wyndham', population: 300000, regionName: 'Melbourne West' },
  'western united': { city: 'Tarneit / Wyndham', population: 300000, regionName: 'Melbourne West' },
  'auckland': { city: 'Auckland', population: 1700000, regionName: 'Greater Auckland' },
  'leichhardt': { city: 'Leichhardt / Sydney', population: 5300000, regionName: 'Greater Sydney' },

  // ==========================================
  // Argentina (ARG)
  // ==========================================
  'buenos aires': { city: 'Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'núñez': { city: 'Núñez / Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'nunez': { city: 'Núñez / Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'river plate': { city: 'Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'la boca': { city: 'La Boca / Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'boca juniors': { city: 'Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'avellaneda': { city: 'Avellaneda', population: 350000, regionName: 'Greater Buenos Aires South' },
  'racing club': { city: 'Avellaneda', population: 350000, regionName: 'Greater Buenos Aires South' },
  'independiente': { city: 'Avellaneda', population: 350000, regionName: 'Greater Buenos Aires South' },
  'boedo': { city: 'Boedo / Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'san lorenzo': { city: 'Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'liniers': { city: 'Liniers / Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'vélez': { city: 'Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'velez': { city: 'Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'la plata': { city: 'La Plata', population: 900000, regionName: 'Greater La Plata' },
  'estudiantes': { city: 'La Plata', population: 900000, regionName: 'Greater La Plata' },
  'gimnasia': { city: 'La Plata', population: 900000, regionName: 'Greater La Plata' },
  'rosario': { city: 'Rosario', population: 1350000, regionName: 'Greater Rosario' },
  'arroyito': { city: 'Rosario', population: 1350000, regionName: 'Greater Rosario' },
  'newell': { city: 'Rosario', population: 1350000, regionName: 'Greater Rosario' },
  'talleres': { city: 'Córdoba', population: 1600000, regionName: 'Greater Córdoba' },
  'belgrano': { city: 'Córdoba', population: 1600000, regionName: 'Greater Córdoba' },
  'instituto': { city: 'Córdoba', population: 1600000, regionName: 'Greater Córdoba' },
  'lanús': { city: 'Lanús', population: 460000, regionName: 'Greater Buenos Aires South' },
  'lanus': { city: 'Lanús', population: 460000, regionName: 'Greater Buenos Aires South' },
  'florencio varela': { city: 'Florencio Varela', population: 500000, regionName: 'Greater Buenos Aires South' },
  'defensa y justicia': { city: 'Florencio Varela', population: 500000, regionName: 'Greater Buenos Aires South' },
  'tucumán': { city: 'San Miguel de Tucumán', population: 900000, regionName: 'Greater Tucumán' },
  'tucuman': { city: 'San Miguel de Tucumán', population: 900000, regionName: 'Greater Tucumán' },
  'banfield': { city: 'Banfield / Lomas de Zamora', population: 620000, regionName: 'Greater Buenos Aires South' },
  'mendoza': { city: 'Mendoza', population: 1100000, regionName: 'Greater Mendoza' },
  'godoy cruz': { city: 'Mendoza', population: 1100000, regionName: 'Greater Mendoza' },
  'tigre': { city: 'Tigre / Victoria', population: 400000, regionName: 'Greater Buenos Aires North' },
  'barracas': { city: 'Barracas / Buenos Aires', population: 15600000, regionName: 'Greater Buenos Aires' },
  'santa fe': { city: 'Santa Fe', population: 540000, regionName: 'Greater Santa Fe' },
  'junín': { city: 'Junín', population: 90000, regionName: 'Buenos Aires Northwest' },
  'junin': { city: 'Junín', population: 90000, regionName: 'Buenos Aires Northwest' },
  'santiago del estero': { city: 'Santiago del Estero', population: 430000, regionName: 'Greater Santiago del Estero' },
  'quilmes': { city: 'Quilmes', population: 640000, regionName: 'Greater Buenos Aires South' },
  'san juan': { city: 'San Juan', population: 510000, regionName: 'Greater San Juan' },
  'jujuy': { city: 'San Salvador de Jujuy', population: 340000, regionName: 'Jujuy Valley' },
  'paraná': { city: 'Paraná', population: 290000, regionName: 'Greater Paraná' },
  'parana': { city: 'Paraná', population: 290000, regionName: 'Greater Paraná' },

  // ==========================================
  // Japan (JPN)
  // ==========================================
  'tokyo': { city: 'Tokyo', population: 37400000, regionName: 'Greater Tokyo Area' },
  'yokohama': { city: 'Yokohama', population: 3770000, regionName: 'Greater Tokyo / Kanagawa' },
  'kawasaki': { city: 'Kawasaki', population: 1540000, regionName: 'Greater Tokyo / Kanagawa' },
  'urawa': { city: 'Saitama / Urawa', population: 1340000, regionName: 'Greater Tokyo / Saitama' },
  'saitama': { city: 'Saitama', population: 1340000, regionName: 'Greater Tokyo / Saitama' },
  'omiya': { city: 'Saitama / Omiya', population: 1340000, regionName: 'Greater Tokyo / Saitama' },
  'hiroshima': { city: 'Hiroshima', population: 1200000, regionName: 'Hiroshima Metropolitan Area' },
  'osaka': { city: 'Osaka', population: 19000000, regionName: 'Keihanshin Metropolitan Area' },
  'kobe': { city: 'Kobe', population: 1520000, regionName: 'Keihanshin / Hyogo' },
  'nagoya': { city: 'Nagoya', population: 9550000, regionName: 'Chūkyō Metropolitan Area' },
  'machida': { city: 'Machida', population: 430000, regionName: 'Greater Tokyo South' },
  'kyoto': { city: 'Kyoto', population: 1460000, regionName: 'Keihanshin / Kyoto' },
  'kashiwa': { city: 'Kashiwa', population: 430000, regionName: 'Greater Tokyo / Chiba' },
  'fukuoka': { city: 'Fukuoka', population: 1630000, regionName: 'Fukuoka-Kitakyushu Metro' },
  'hiratsuka': { city: 'Hiratsuka / Shonan', population: 260000, regionName: 'Shonan Coastal Region' },
  'shonan': { city: 'Hiratsuka / Shonan', population: 260000, regionName: 'Shonan Coastal Region' },
  'sapporo': { city: 'Sapporo', population: 1970000, regionName: 'Ishikari Subprefecture' },
  'tosu': { city: 'Tosu', population: 75000, regionName: 'Saga-Fukuoka Border' },
  'niigata': { city: 'Niigata', population: 800000, regionName: 'Niigata Metropolitan Area' },
  'iwata': { city: 'Iwata', population: 170000, regionName: 'West Shizuoka' },
  'shimizu': { city: 'Shimizu / Shizuoka', population: 700000, regionName: 'Shizuoka Urban Area' },
  'nagasaki': { city: 'Nagasaki', population: 400000, regionName: 'Nagasaki Metropolitan Area' },
  'okayama': { city: 'Okayama', population: 720000, regionName: 'Okayama Metropolitan Area' },
  'sendai': { city: 'Sendai', population: 1100000, regionName: 'Greater Sendai' },
  'chiba': { city: 'Chiba', population: 980000, regionName: 'Greater Tokyo / Chiba' },
  'yamagata': { city: 'Yamagata', population: 250000, regionName: 'Yamagata Basin' },
  'kofu': { city: 'Kofu', population: 190000, regionName: 'Kofu Basin' },
  'oita': { city: 'Oita', population: 480000, regionName: 'Oita Metropolitan Area' },
  'akita': { city: 'Akita', population: 300000, regionName: 'Akita Plain' },
  'yamaguchi': { city: 'Yamaguchi', population: 190000, regionName: 'Yamaguchi Central' },
  'tokushima': { city: 'Tokushima', population: 255000, regionName: 'Tokushima Plain' },
  'mito': { city: 'Mito', population: 270000, regionName: 'Ibaraki Central' },
  'tochigi': { city: 'Utsunomiya / Tochigi', population: 520000, regionName: 'Tochigi Central' },
  'kumamoto': { city: 'Kumamoto', population: 740000, regionName: 'Kumamoto Metropolitan Area' },
  'ehime': { city: 'Matsuyama / Ehime', population: 510000, regionName: 'Ehime Central' },

  // ==========================================
  // Colombia (COL)
  // ==========================================
  'bogotá': { city: 'Bogotá', population: 10700000, regionName: 'Bogotá Metropolitan Area' },
  'bogota': { city: 'Bogotá', population: 10700000, regionName: 'Bogotá Metropolitan Area' },
  'medellín': { city: 'Medellín', population: 4050000, regionName: 'Aburrá Valley Metropolitan' },
  'medellin': { city: 'Medellín', population: 4050000, regionName: 'Aburrá Valley Metropolitan' },
  'cali': { city: 'Cali', population: 3150000, regionName: 'Cali Metropolitan Area' },
  'barranquilla': { city: 'Barranquilla', population: 2200000, regionName: 'Barranquilla Metropolitan Area' },
  'bucaramanga': { city: 'Bucaramanga', population: 1150000, regionName: 'Bucaramanga Metropolitan Area' },
  'pereira': { city: 'Pereira', population: 710000, regionName: 'Central West Metropolitan Area' },
  'ibagué': { city: 'Ibagué', population: 540000, regionName: 'Tolima Department' },
  'ibague': { city: 'Ibagué', population: 540000, regionName: 'Tolima Department' },
  'manizales': { city: 'Manizales', population: 450000, regionName: 'Manizales Metropolitan Area' },
  'pasto': { city: 'Pasto', population: 400000, regionName: 'Nariño Highlands' },
  'valledupar': { city: 'Valledupar', population: 530000, regionName: 'Cesar Valley' },
  'tunja': { city: 'Tunja', population: 180000, regionName: 'Boyacá Central' },
  'boyacá': { city: 'Tunja / Boyacá', population: 180000, regionName: 'Boyacá Central' },
  'boyaca': { city: 'Tunja / Boyacá', population: 180000, regionName: 'Boyacá Central' },
  'rionegro': { city: 'Rionegro', population: 140000, regionName: 'Eastern Antioquia' },
  'envigado': { city: 'Envigado', population: 240000, regionName: 'Aburrá Valley South' },

  // ==========================================
  // Mexico (MEX)
  // ==========================================
  'ciudad de méxico': { city: 'Mexico City', population: 22000000, regionName: 'Greater Mexico City' },
  'ciudad de mexico': { city: 'Mexico City', population: 22000000, regionName: 'Greater Mexico City' },
  'mexico city': { city: 'Mexico City', population: 22000000, regionName: 'Greater Mexico City' },
  'guadalajara': { city: 'Guadalajara', population: 5300000, regionName: 'Guadalajara Metropolitan Area' },
  'monterrey': { city: 'Monterrey', population: 5350000, regionName: 'Monterrey Metropolitan Area' },
  'nuevo león': { city: 'Monterrey / Nuevo León', population: 5350000, regionName: 'Monterrey Metropolitan Area' },
  'nuevo leon': { city: 'Monterrey / Nuevo León', population: 5350000, regionName: 'Monterrey Metropolitan Area' },
  'puebla': { city: 'Puebla', population: 3200000, regionName: 'Puebla-Tlaxcala Metropolitan' },
  'toluca': { city: 'Toluca', population: 2350000, regionName: 'Greater Toluca' },
  'tijuana': { city: 'Tijuana', population: 2150000, regionName: 'Tijuana Metropolitan' },
  'león': { city: 'León', population: 2140000, regionName: 'León Metropolitan' },
  'leon': { city: 'León', population: 2140000, regionName: 'León Metropolitan' },
  'ciudad juárez': { city: 'Ciudad Juárez', population: 1520000, regionName: 'Juárez Border Region' },
  'ciudad juarez': { city: 'Ciudad Juárez', population: 1520000, regionName: 'Juárez Border Region' },
  'juárez': { city: 'Ciudad Juárez', population: 1520000, regionName: 'Juárez Border Region' },
  'juarez': { city: 'Ciudad Juárez', population: 1520000, regionName: 'Juárez Border Region' },
  'torreón': { city: 'Torreón', population: 1430000, regionName: 'Comarca Lagunera' },
  'torreon': { city: 'Torreón', population: 1430000, regionName: 'Comarca Lagunera' },
  'querétaro': { city: 'Querétaro', population: 1600000, regionName: 'Querétaro Metropolitan' },
  'queretaro': { city: 'Querétaro', population: 1600000, regionName: 'Querétaro Metropolitan' },
  'san luis potosí': { city: 'San Luis Potosí', population: 1240000, regionName: 'San Luis Potosí Metro' },
  'san luis': { city: 'San Luis Potosí', population: 1240000, regionName: 'San Luis Potosí Metro' },
  'aguascalientes': { city: 'Aguascalientes', population: 1140000, regionName: 'Aguascalientes Metro' },
  'pachuca': { city: 'Pachuca', population: 670000, regionName: 'Pachuca Metropolitan' },
  'mazatlán': { city: 'Mazatlán', population: 500000, regionName: 'Mazatlán Coastal' },
  'mazatlan': { city: 'Mazatlán', population: 500000, regionName: 'Mazatlán Coastal' },

  // ==========================================
  // Canada (CAN)
  // ==========================================
  'toronto': { city: 'Toronto', population: 6300000, regionName: 'Greater Toronto Area' },
  'montreal': { city: 'Montreal', population: 4300000, regionName: 'Greater Montreal' },
  'montréal': { city: 'Montreal', population: 4300000, regionName: 'Greater Montreal' },
  'as laval': { city: 'Laval / Montreal', population: 4300000, regionName: 'Greater Montreal' },
  'saint-laurent': { city: 'Saint-Laurent / Montreal', population: 4300000, regionName: 'Greater Montreal' },
  'vancouver': { city: 'Vancouver', population: 2650000, regionName: 'Metro Vancouver' },
  'burnaby': { city: 'Burnaby / Vancouver', population: 2650000, regionName: 'Metro Vancouver' },
  'langley': { city: 'Langley / Vancouver', population: 2650000, regionName: 'Metro Vancouver' },
  'calgary': { city: 'Calgary', population: 1600000, regionName: 'Calgary Metropolitan Region' },
  'edmonton': { city: 'Edmonton', population: 1500000, regionName: 'Edmonton Metropolitan Region' },
  'ottawa': { city: 'Ottawa', population: 1500000, regionName: 'National Capital Region' },
  'winnipeg': { city: 'Winnipeg', population: 840000, regionName: 'Winnipeg Metropolitan Region' },
  'hamilton': { city: 'Hamilton', population: 785000, regionName: 'Hamilton Census Metropolitan Area' },
  'halifax': { city: 'Halifax', population: 465000, regionName: 'Halifax Regional Municipality' },
  'victoria': { city: 'Victoria / Langford', population: 400000, regionName: 'Greater Victoria' },
  'langford': { city: 'Victoria / Langford', population: 400000, regionName: 'Greater Victoria' },
  'barrie': { city: 'Barrie', population: 215000, regionName: 'Simcoe County' },
  'vaughan': { city: 'Vaughan', population: 340000, regionName: 'York Region / GTA' },
  'guelph': { city: 'Guelph', population: 165000, regionName: 'Wellington County' },
  'kamloops': { city: 'Kamloops', population: 100000, regionName: 'Thompson-Nicola' },

  // ==========================================
  // Turkey (TUR)
  // ==========================================
  'istanbul': { city: 'Istanbul', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'galata': { city: 'Istanbul (Galata)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'kadıköy': { city: 'Istanbul (Kadıköy)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'kadikoy': { city: 'Istanbul (Kadıköy)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'beşiktaş': { city: 'Istanbul (Beşiktaş)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'besiktas': { city: 'Istanbul (Beşiktaş)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'başakşehir': { city: 'Istanbul (Başakşehir)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'basaksehir': { city: 'Istanbul (Başakşehir)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'kasımpaşa': { city: 'Istanbul (Kasımpaşa)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'kasimpasa': { city: 'Istanbul (Kasımpaşa)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'eyüp': { city: 'Istanbul (Eyüpsultan)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'eyup': { city: 'Istanbul (Eyüpsultan)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'karagümrük': { city: 'Istanbul (Karagümrük)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'karagumruk': { city: 'Istanbul (Karagümrük)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'ümraniye': { city: 'Istanbul (Ümraniye)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'umraniye': { city: 'Istanbul (Ümraniye)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'pendik': { city: 'Istanbul (Pendik)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'esenler': { city: 'Istanbul (Esenler)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'sarıyer': { city: 'Istanbul (Sarıyer)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'sariyer': { city: 'Istanbul (Sarıyer)', population: 15900000, regionName: 'Istanbul Metropolitan Area' },
  'ankara': { city: 'Ankara', population: 5800000, regionName: 'Ankara Metropolitan Area' },
  'başkent': { city: 'Ankara', population: 5800000, regionName: 'Ankara Metropolitan Area' },
  'baskent': { city: 'Ankara', population: 5800000, regionName: 'Ankara Metropolitan Area' },
  'keçiören': { city: 'Ankara (Keçiören)', population: 5800000, regionName: 'Ankara Metropolitan Area' },
  'kecioren': { city: 'Ankara (Keçiören)', population: 5800000, regionName: 'Ankara Metropolitan Area' },
  'izmir': { city: 'Izmir', population: 4450000, regionName: 'Izmir Metropolitan Area' },
  'göztepe': { city: 'Izmir (Göztepe)', population: 4450000, regionName: 'Izmir Metropolitan Area' },
  'goztepe': { city: 'Izmir (Göztepe)', population: 4450000, regionName: 'Izmir Metropolitan Area' },
  'karşıyaka': { city: 'Izmir (Karşıyaka)', population: 4450000, regionName: 'Izmir Metropolitan Area' },
  'karsiyaka': { city: 'Izmir (Karşıyaka)', population: 4450000, regionName: 'Izmir Metropolitan Area' },
  'buca': { city: 'Izmir (Buca)', population: 4450000, regionName: 'Izmir Metropolitan Area' },
  'altay': { city: 'Izmir', population: 4450000, regionName: 'Izmir Metropolitan Area' },
  'bursa': { city: 'Bursa', population: 3200000, regionName: 'Bursa Metropolitan Area' },
  'antalya': { city: 'Antalya', population: 2700000, regionName: 'Antalya Metropolitan Area' },
  'adana': { city: 'Adana', population: 2250000, regionName: 'Adana Metropolitan Area' },
  'konya': { city: 'Konya', population: 2300000, regionName: 'Konya Metropolitan Area' },
  'gaziantep': { city: 'Gaziantep', population: 2150000, regionName: 'Gaziantep Metropolitan Area' },
  'antep': { city: 'Gaziantep', population: 2150000, regionName: 'Gaziantep Metropolitan Area' },
  'şanlıurfa': { city: 'Şanlıurfa', population: 2200000, regionName: 'Şanlıurfa Metropolitan Area' },
  'sanliurfa': { city: 'Şanlıurfa', population: 2200000, regionName: 'Şanlıurfa Metropolitan Area' },
  'urfa': { city: 'Şanlıurfa', population: 2200000, regionName: 'Şanlıurfa Metropolitan Area' },
  'kocaeli': { city: 'Kocaeli / İzmit', population: 2100000, regionName: 'Kocaeli Metropolitan Area' },
  'mersin': { city: 'Mersin', population: 1900000, regionName: 'Mersin Metropolitan Area' },
  'diyarbakır': { city: 'Diyarbakır', population: 1800000, regionName: 'Diyarbakır Metropolitan Area' },
  'diyarbakir': { city: 'Diyarbakır', population: 1800000, regionName: 'Diyarbakır Metropolitan Area' },
  'amed': { city: 'Diyarbakır', population: 1800000, regionName: 'Diyarbakır Metropolitan Area' },
  'manisa': { city: 'Manisa', population: 1470000, regionName: 'Manisa Metropolitan Area' },
  'kayseri': { city: 'Kayseri', population: 1440000, regionName: 'Kayseri Metropolitan Area' },
  'samsun': { city: 'Samsun', population: 1370000, regionName: 'Samsun Metropolitan Area' },
  'balıkesir': { city: 'Balıkesir', population: 1260000, regionName: 'Balıkesir Metropolitan Area' },
  'balikesir': { city: 'Balıkesir', population: 1260000, regionName: 'Balıkesir Metropolitan Area' },
  'bandırma': { city: 'Bandırma / Balıkesir', population: 1260000, regionName: 'Balıkesir Metropolitan Area' },
  'bandirma': { city: 'Bandırma / Balıkesir', population: 1260000, regionName: 'Balıkesir Metropolitan Area' },
  'denizli': { city: 'Denizli', population: 1050000, regionName: 'Denizli Metropolitan Area' },
  'sakarya': { city: 'Sakarya', population: 1080000, regionName: 'Sakarya Metropolitan Area' },
  'bodrum': { city: 'Bodrum / Muğla', population: 1050000, regionName: 'Muğla Metropolitan Area' },
  'eskişehir': { city: 'Eskişehir', population: 900000, regionName: 'Eskişehir Metropolitan Area' },
  'eskisehir': { city: 'Eskişehir', population: 900000, regionName: 'Eskişehir Metropolitan Area' },
  'trabzon': { city: 'Trabzon', population: 820000, regionName: 'Trabzon Metropolitan Area' },
  'erzurum': { city: 'Erzurum', population: 750000, regionName: 'Erzurum Metropolitan Area' },
  'sivas': { city: 'Sivas', population: 650000, regionName: 'Sivas Central' },
  'elazığ': { city: 'Elazığ', population: 600000, regionName: 'Upper Euphrates' },
  'elazig': { city: 'Elazığ', population: 600000, regionName: 'Upper Euphrates' },
  'çorum': { city: 'Çorum', population: 530000, regionName: 'Central Black Sea' },
  'corum': { city: 'Çorum', population: 530000, regionName: 'Central Black Sea' },
  'ordu': { city: 'Ordu', population: 770000, regionName: 'East Black Sea Ordu' },
  'giresun': { city: 'Giresun', population: 450000, regionName: 'East Black Sea Giresun' },
  'rize': { city: 'Rize', population: 350000, regionName: 'East Black Sea Rize' },
  'bolu': { city: 'Bolu', population: 320000, regionName: 'Western Black Sea' },
  'karabük': { city: 'Karabük', population: 250000, regionName: 'Western Black Sea' },
  'karabuk': { city: 'Karabük', population: 250000, regionName: 'Western Black Sea' },
  'zonguldak': { city: 'Zonguldak', population: 590000, regionName: 'Coal Basin' },
  'kastamonu': { city: 'Kastamonu', population: 380000, regionName: 'Western Black Sea' },
  'iğdır': { city: 'Iğdır', population: 210000, regionName: 'Eastern Anatolia' },
  'igdir': { city: 'Iğdır', population: 210000, regionName: 'Eastern Anatolia' },
  'alanya': { city: 'Alanya', population: 360000, regionName: 'Antalya Eastern Riviera' },
  'afyon': { city: 'Afyonkarahisar', population: 750000, regionName: 'Aegean Inland' },
  'van': { city: 'Van', population: 1130000, regionName: 'Van Metropolitan Area' },

  // ==========================================
  // Denmark (DEN - Mod Database)
  // ==========================================
  'copenhagen': { city: 'Copenhagen', population: 2100000, regionName: 'Greater Copenhagen' },
  'aarhus': { city: 'Aarhus', population: 360000, regionName: 'East Jutland' },
  'odense': { city: 'Odense', population: 210000, regionName: 'Funen Region' },
  'herning': { city: 'Herning / Midtjylland', population: 90000, regionName: 'Central Jutland' },
  'aalborg': { city: 'Aalborg', population: 220000, regionName: 'North Jutland' },
  'silkeborg': { city: 'Silkeborg', population: 50000, regionName: 'Central Denmark' },
  'haderslev': { city: 'Haderslev / Sønderjyske', population: 56000, regionName: 'South Jutland' }
};

export interface CatchmentAnalysis {
  metroCity: string;
  regionName: string;
  population: number;
  softCapacityCeiling: number; // Maximum natural local capacity before soft-ceiling drag
  isExceedingCatchment: boolean;
  excessSeats: number;
  penetrationPct: number; // Stadium capacity as % of soft ceiling
  utilizationRiskLevel: 'optimal' | 'moderate' | 'high_drag';
  adviceEn: string;
  adviceDe: string;
}

/**
 * Resolves metropolitan catchment population for any club across both Mod and Original databases.
 */
export function getClubCatchment(club: Partial<Club>): { city: string; population: number; regionName: string } {
  const name = (club.name || '').toLowerCase().trim();
  const country = club.country || 'GER';

  // Direct match in table
  for (const [key, data] of Object.entries(METRO_POPULATIONS)) {
    if (name.includes(key)) {
      return data;
    }
  }

  // Known village / small-market clubs by aliases across mod and unmodded
  if (
    name.includes('hoffenheim') || 
    name.includes('kraichgau') || 
    name.includes('sinsheim') || 
    club.id === 18 || 
    club.id === 1018
  ) {
    return METRO_POPULATIONS['hoffenheim'];
  }
  if (name.includes('heidenheim') || name.includes('ostalb') || club.id === 16) {
    return METRO_POPULATIONS['heidenheim'];
  }
  if (name.includes('villarreal') || name.includes('groguet') || club.id === 207) {
    return METRO_POPULATIONS['villarreal'];
  }
  if (name.includes('sassuolo') || name.includes('neroverdi') || club.id === 312) {
    return METRO_POPULATIONS['sassuolo'];
  }
  if (name.includes('monaco') || club.id === 404) {
    return METRO_POPULATIONS['monaco'];
  }
  if (name.includes('midtjylland') || name.includes('herning') || club.id === 2502) {
    return METRO_POPULATIONS['herning'];
  }
  if (name.includes('silkeborg') || club.id === 2506) {
    return METRO_POPULATIONS['silkeborg'];
  }

  // Country defaults scaled by tier (Deterministic per club so UI & financials never jitter across renders)
  const tier = club.tier || 1;
  const defaultCity = country === 'GER' ? 'Regional District' : country === 'ENG' ? 'County Metro' : 'Municipal District';
  const seedStr = `${club.id ?? ''}_${name}_${country}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) | 0;
  }
  const unitRoll = (Math.abs(hash) % 1000) / 1000;

  let defaultPop = 50000;
  if (tier === 1) defaultPop = 400000 + Math.floor(unitRoll * 200000); // 400k - 600k
  else if (tier === 2) defaultPop = 150000 + Math.floor(unitRoll * 100000); // 150k - 250k
  else if (tier === 3) defaultPop = 80000 + Math.floor(unitRoll * 40000); // 80k - 120k
  else defaultPop = 25000 + Math.floor(unitRoll * 25000); // 25k - 50k

  return {
    city: club.name || defaultCity,
    population: defaultPop,
    regionName: `${country} Urban Catchment`
  };
}

/**
 * Calculates the Hoffenheim Soft-Ceiling capacity and expansion risk.
 * A club in a small town (e.g. 35,000 population) has a natural ceiling of ~30,000 - 45,000 seats.
 * Expanding beyond this ceiling without elite continental reputation causes empty seats & financial drag.
 */
export function analyzeCatchment(
  club: Club,
  proposedSeats?: number
): CatchmentAnalysis {
  const currentSeats = proposedSeats ?? club.stadium;
  const catchment = getClubCatchment(club);
  const rep = club.rep || 50;
  const tier = club.tier || 1;

  // Base soft ceiling: ~20% of local population plus baseline tier allowance
  // Small towns get a minimum viability floor so a 35k town can support a 30k ground in Tier 1.
  const baseLocalAllowance = Math.round(catchment.population * 0.22);
  const tierAllowance = tier === 1 ? 28000 : tier === 2 ? 15000 : 8000;
  const repAllowance = Math.round((rep / 100) * 18000);
  const globalBrandAllowance = Math.round((club.fanBase || 0) * 0.006);

  const softCapacityCeiling = Math.max(22000, baseLocalAllowance + tierAllowance + repAllowance + globalBrandAllowance);
  const isExceeding = currentSeats > softCapacityCeiling;
  const excessSeats = Math.max(0, currentSeats - softCapacityCeiling);
  const penetrationPct = Math.round((currentSeats / softCapacityCeiling) * 100);

  let utilizationRiskLevel: 'optimal' | 'moderate' | 'high_drag' = 'optimal';
  if (penetrationPct > 150) {
    utilizationRiskLevel = 'high_drag';
  } else if (penetrationPct > 115) {
    utilizationRiskLevel = 'moderate';
  }

  let adviceEn = 'Stadium capacity aligns comfortably with metropolitan demographic reach.';
  let adviceDe = 'Stadionkapazität passt optimal zum regionalen Fanpotenzial.';

  if (globalBrandAllowance > baseLocalAllowance) {
    adviceEn = "Local demographics are limited, but your massive global brand fills the stadium with traveling supporters.";
    adviceDe = "Regionales Potenzial ist begrenzt, aber deine massive globale Marke füllt das Stadion mit internationalen Fans.";
  } else if (utilizationRiskLevel === 'high_drag') {
    adviceEn = `Warning: Capacity significantly exceeds local municipal catchment (${catchment.city}, pop. ${catchment.population.toLocaleString()}). Requires sustained continental trophies to avoid heavy seat vacancies.`;
    adviceDe = `Achtung: Kapazität übersteigt das regionale Einzugsgebiet (${catchment.city}, ${catchment.population.toLocaleString()} Einw.) drastisch. Nur mit dauerhaften Titeln voll auslastbar.`;
  } else if (utilizationRiskLevel === 'moderate') {
    adviceEn = `Moderate demographic stretch for ${catchment.city}. Turnstiles will rely on visiting supporters and regional fan caravans.`;
    adviceDe = `Leichte demografische Überdehnung für ${catchment.city}. Auslastung ist stark von Auswärtsfans und Umland-Zulauf abhängig.`;
  }

  return {
    metroCity: catchment.city,
    regionName: catchment.regionName,
    population: catchment.population,
    softCapacityCeiling,
    isExceedingCatchment: isExceeding,
    excessSeats,
    penetrationPct,
    utilizationRiskLevel,
    adviceEn,
    adviceDe
  };
}

/**
 * Calculates demographic attendance modifier under the Hoffenheim soft ceiling.
 * If stadium exceeds catchment ceiling and club is not an elite giant, dampens matchday fill rate.
 */
export function getCatchmentAttendanceModifier(club: Club): number {
  const analysis = analyzeCatchment(club);
  if (!analysis.isExceedingCatchment) return 1.0;

  const excessRatio = analysis.excessSeats / analysis.softCapacityCeiling;
  const repFactor = (club.rep || 50) / 100;

  // Elite clubs (e.g. rep >= 85) pull national & global crowds, overcoming demographic ceilings
  if (repFactor >= 0.85) {
    return Math.max(0.92, 1.0 - excessRatio * 0.05);
  }

  // Modest clubs in small villages suffer realistic 8-22% attendance friction on excess capacity
  const penalty = Math.min(0.25, excessRatio * 0.20 * (1.1 - repFactor));
  return Math.max(0.75, 1.0 - penalty);
}
