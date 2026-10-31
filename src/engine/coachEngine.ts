import { Coach, CoachArchetype, CoachHiddenAttributes } from '../types';
import { COUNTRIES, getLeagueScaledVal } from '../data/gameConstants';

const ELITE_COACH_NAMES: Record<string, string[]> = {
  GER: ['Jurgen Flopp', 'Julian Bagelsmann', 'Hansi Klick', 'Ralf Rangnix', 'Thomas Tucholsky', 'Marco Dose', 'Christian Streichholz', 'Felix MachtDas', 'Jupp Heynckes'],
  ENG: ['Pep Guardiröla', 'Mikel Arteter', 'Eddie Who', 'Sean Dyche', 'Sam Allardicimo', 'Steven Gerrard', 'Frank Lampart', 'Gareth Southgate'],
  ESP: ['Diego Simeone', 'Carlo Ancelotti', 'Xavi Hernandez', 'Unai Emery', 'Luis Enrique', 'Rafa Benítez', 'Ernesto Valverde', 'Marcelino'],
  ITA: ['Massimiliano Allegri', 'Antonio Conte', 'Simone Inzaghi', 'Maurizio Sarri', 'José Mourinho', 'Claudio Ranieri', 'Gian Piero Gasperini', 'Stefano Pioli'],
  FRA: ['Didier Deschamps', 'Zinedine Zidane', 'Laurent Blanc', 'Christophe Galtier', 'Thierry Henry', 'Patrick Vieira'],
  USA: ['Gregg Berhalter', 'Jesse Marsch', 'Bob Bradley', 'Bruce Arena', 'Peter Vermes', 'Jim Curtin'],
  TUR: ['Fatih Terim', 'Şenol Güneş', 'Mustafa Denizli', 'Okan Buruk', 'Sergen Yalçın', 'İsmail Kartal', 'Aykut Kocaman'],
  ECU: ['Álex Aguinaga', 'Jorge Célico', 'Sixto Vizuete', 'Paúl Vélez', 'Edison Méndez', 'Edgardo Bauza', 'Gustavo Alfaro', 'Fabián Bustos', 'Guillermo Duró', 'César Farías', 'Juan Carlos León', 'Geovanny Cumbicus', 'Patricio Hurtado'],
  ARG: ['Marcelo Bielsa', 'Diego Simeone', 'Mauricio Pochettino', 'Lionel Scaloni', 'Marcelo Gallardo', 'Jorge Sampaoli', 'Hernán Crespo', 'Gerardo Martino', 'Eduardo Coudet', 'Gabriel Milito'],
  BRA: ['Tite', 'Dorival Júnior', 'Renato Gaúcho', 'Fernando Diniz', 'Vanderlei Luxemburgo', 'Luiz Felipe Scolari', 'Abel Braga', 'Rogério Ceni', 'Mano Menezes'],
  COL: ['Francisco Maturana', 'Reinaldo Rueda', 'Juan Carlos Osorio', 'Alberto Gamero', 'Hernán Darío Gómez', 'Leonel Álvarez', 'Luis Fernando Suárez'],
  URU: ['Óscar Tabárez', 'Diego Alonso', 'Marcelo Broli', 'Jorge Fossati', 'Guillermo Almada', 'Álvaro Gutiérrez', 'Mauricio Larriera'],
  MEX: ['Miguel Herrera', 'Javier Aguirre', 'Ignacio Ambriz', 'Víctor Manuel Vucetich', 'Hugo Sánchez', 'Jaime Lozano', 'Ricardo Ferretti'],
  POR: ['José Mourinho', 'Jorge Jesus', 'Rúben Amorim', 'Sérgio Conceição', 'Fernando Santos', 'Leonardo Jardim', 'Paulo Fonseca', 'Marco Silva'],
  POL: ['Adam Nawałka', 'Czesław Michniewicz', 'Michał Probierz', 'Maciej Skorża', 'Marek Papszun', 'Jan Urban'],
  AUT: ['Ralph Hasenhüttl', 'Oliver Glasner', 'Peter Stöger', 'Adi Hütter', 'Andreas Herzog'],
  SUI: ['Lucien Favre', 'Murat Yakin', 'Urs Fischer', 'Christian Gross', 'Vladimir Petković'],
  SCO: ['Sir Alex Ferguson', 'David Moyes', 'Steve Clarke', 'Gordon Strachan', 'Alex McLeish'],
  WAL: ['Chris Coleman', 'Mark Hughes', 'Craig Bellamy', 'John Toshack', 'Ryan Giggs'],
  JPN: ['Hajime Moriyasu', 'Takeshi Okada', 'Akira Nishino', 'Toru Oniki', 'Kenta Hasegawa'],
  AUS: ['Ange Postecoglou', 'Graham Arnold', 'Tony Popovic', 'Kevin Muscat', 'John Aloisi'],
  CAN: ['John Herdman', 'Mauro Biello', 'Bobby Smyrniotis', 'Tommy Wheeldon'],
  DEN: ['Kasper Hjulmand', 'Thomas Frank', 'Bo Svensson', 'Michael Laudrup', 'Jon Dahl Tomasson'],
  NOR: ['Ståle Solbakken', 'Kjetil Knutsen', 'Ole Gunnar Solskjær', 'Ronny Deila', 'Egil Olsen'],
  SWE: ['Sven-Göran Eriksson', 'Janne Andersson', 'Henrik Larsson', 'Olof Mellberg', 'Rikard Norling'],
  IDN: ['Indra Sjafri', 'Bima Sakti', 'Rahmad Darmawan', 'Aji Santoso', 'Widodo C. Putro'],
  IND: ['Khalid Jamil', 'Clifford Miranda', 'Derrick Pereira', 'Sanjoy Sen', 'Armando Colaco'],
  SVK: ['Vladimír Weiss', 'Ján Kozák', 'Pavel Hapal', 'František Straka', 'Adrián Guľa', 'Martin Ševela'],
  PER: ['Ricardo Gareca', 'Juan Reynoso', 'Jorge Fossati', 'Roberto Mosquera', 'Franco Navarro', 'José del Solar'],
  KOR: ['Hong Myung-bo', 'Shin Tae-yong', 'Hwang Sun-hong', 'Choi Kang-hee', 'Kim Do-hoon', 'Park Hang-seo'],
  BOL: ['Mauricio Soria', 'Julio César Baldivieso', 'Eduardo Villegas', 'Alberto Illanes', 'Erwin Sánchez'],
  PAR: ['Gustavo Alfaro', 'Francisco Arce', 'Daniel Garnero', 'Guillermo Barros Schelotto', 'Ever Hugo Almeida'],
  CHI: ['Manuel Pellegrini', 'Jorge Sampaoli', 'Claudio Borghi', 'Mario Salas', 'José Luis Sierra', 'Gustavo Quinteros'],
  CRO: ['Zlatko Dalić', 'Niko Kovač', 'Igor Tudor', 'Slaven Bilić', 'Zoran Mamić', 'Sergej Jakirović', 'Nenad Bjelica'],
  GRE: ['Otto Rehhagel', 'Fernando Santos', 'Angelos Anastasiadis', 'Georgios Donis', 'Traianos Dellas', 'Giannis Anastasiou']
};

const GENERIC_FIRST: Record<string, string[]> = {
  GER: ['Klaus', 'Hans', 'Thomas', 'Michael', 'Andreas', 'Stefan', 'Uwe', 'Peter', 'Markus', 'Christian', 'Martin', 'Frank', 'Jens', 'Bernd', 'Thorsten', 'Jürgen', 'Matthias', 'Dirk', 'Carsten', 'Sven'],
  ENG: ['John', 'David', 'Paul', 'Chris', 'Mark', 'Richard', 'Steve', 'James', 'Simon', 'Gary', 'Kevin', 'Ian', 'Andy', 'Mike', 'Rob', 'Harry', 'George', 'Jack', 'Oliver', 'Edward'],
  ESP: ['Antonio', 'Jose', 'Manuel', 'Francisco', 'David', 'Juan', 'Javier', 'Daniel', 'Carlos', 'Jesus', 'Miguel', 'Alejandro', 'Pablo', 'Pedro', 'Raúl', 'Alfonso', 'Diego', 'Sergio', 'Vicente', 'Fernando'],
  ITA: ['Giuseppe', 'Giovanni', 'Antonio', 'Mario', 'Luigi', 'Francesco', 'Angelo', 'Vincenzo', 'Pietro', 'Salvatore', 'Carlo', 'Franco', 'Domenico', 'Massimo', 'Roberto', 'Stefano', 'Paolo', 'Gianluca', 'Fabio', 'Marco'],
  FRA: ['Jean', 'Michel', 'Pierre', 'Philippe', 'Alain', 'Jacques', 'Bernard', 'Marcel', 'Claude', 'Christian', 'Gérard', 'Luc', 'Marc', 'Julien', 'Benoît', 'Olivier', 'Hervé', 'Guillaume', 'Nicolas', 'Damien'],
  USA: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Charles', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Paul', 'Brian', 'Caleb', 'Bruce', 'Gregg', 'Jesse', 'Tab', 'Brad'],
  TUR: ['Mehmet', 'Mustafa', 'Ahmet', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'İsmail', 'Osman', 'Murat', 'Ömer', 'Ramazan', 'Halil', 'Süleyman', 'Fatih', 'Sergen', 'Okan', 'Volkan', 'Burak', 'Emre'],
  ECU: ['Edison', 'Álex', 'Sixto', 'Paúl', 'Jorge', 'Carlos', 'Christian', 'Luis', 'Iván', 'Walter', 'Marlon', 'Patricio', 'Segundo', 'Enner', 'Antonio', 'Hernán', 'Jaime', 'Franklin', 'Geovanny', 'Leonardo', 'Fabián', 'Guillermo', 'César', 'Pervis', 'Moisés', 'Gonzalo', 'Byron', 'Félix', 'Piero', 'Jhegson', 'Kaviedes', 'Ulises', 'Néicer', 'Hólger', 'Alfonso'],
  ARG: ['Marcelo', 'Diego', 'Mauricio', 'Lionel', 'Hernán', 'Jorge', 'Sebastián', 'Gabriel', 'Martín', 'Eduardo', 'Gustavo', 'Ramón', 'Carlos', 'Alejandro', 'Matías', 'Néstor', 'Lucas', 'Mariano', 'Facundo', 'Gonzalo', 'Nicolás', 'Federico', 'Agustín', 'Julián', 'Pablo', 'Ignacio'],
  BRA: ['Dorival', 'Renato', 'Fernando', 'Mano', 'Vanderlei', 'Abel', 'Rogério', 'Luiz Felipe', 'Muricy', 'Tiago', 'Odair', 'Roger', 'Cuca', 'Eduardo', 'Gilson', 'Cleber', 'Rodrigo', 'Marcos', 'Wagner', 'Leandro', 'Thiago', 'Guilherme', 'Vinicius'],
  COL: ['Francisco', 'Hernán Darío', 'Reinaldo', 'Juan Carlos', 'Alberto', 'Leonel', 'Luis Fernando', 'Alexis', 'Harold', 'Hubert', 'Wilmer', 'Lucas', 'Diego', 'Jairo', 'Faryd', 'Mario', 'Oscar', 'César', 'Orlando', 'David', 'Néstor', 'Radamel'],
  URU: ['Óscar', 'Diego', 'Marcelo', 'Jorge', 'Guillermo', 'Álvaro', 'Mauricio', 'Tabaré', 'Fabián', 'Gustavo', 'Eduardo', 'Martín', 'Juan Ramón', 'Rubén', 'Leonardo'],
  MEX: ['Miguel', 'Javier', 'Ignacio', 'Victor Manuel', 'Hugo', 'Jaime', 'Guillermo', 'Ricardo', 'Benjamín', 'Mario', 'José Manuel', 'Raúl', 'Alfonso', 'Efraín', 'Héctor', 'Rubén', 'Tomás', 'Enrique', 'Salvador', 'Joaquín'],
  POR: ['José', 'Jorge', 'Rúben', 'Sérgio', 'Fernando', 'Marco', 'Leonardo', 'Paulo', 'Carlos', 'Nuno', 'Vítor', 'Pedro', 'Abel', 'Bruno', 'Luís', 'Rui', 'Manuel', 'António', 'Gonçalo', 'Tiago'],
  POL: ['Adam', 'Czesław', 'Michał', 'Maciej', 'Jan', 'Marek', 'Waldemar', 'Jacek', 'Franciszek', 'Piotr', 'Mariusz', 'Dariusz', 'Marcin', 'Tomasz', 'Krzysztof', 'Grzegorz', 'Radosław', 'Bogdan', 'Andrzej', 'Stanisław'],
  AUT: ['Ralph', 'Oliver', 'Peter', 'Adi', 'Gernot', 'Dietmar', 'Markus', 'Andreas', 'Gerald', 'Christian', 'Ferdinand', 'Manfred', 'Robert', 'Kurt', 'Josef', 'Walter', 'Herbert', 'Ernst', 'Klaus', 'Stefan'],
  SUI: ['Murat', 'Lucien', 'Christian', 'Marcel', 'Urs', 'Vladimir', 'Pierluigi', 'Ciriaco', 'René', 'Alain', 'Patrick', 'Giorgio', 'Fabio', 'Ludovic', 'Alain', 'Stéphane', 'Bernard', 'Marc', 'Martin', 'Daniel'],
  SCO: ['Alex', 'David', 'Steve', 'Derek', 'Craig', 'Gordon', 'Neil', 'Malky', 'Paul', 'Barry', 'Callum', 'Robbie', 'Jim', 'Allan', 'Stuart', 'Kenny', 'Ally', 'Archie', 'Ian', 'Billy'],
  WAL: ['Chris', 'Mark', 'John', 'Rob', 'Craig', 'Ryan', 'Nathan', 'Osian', 'Carl', 'Tony', 'Steve', 'David', 'Gareth', 'Ian', 'Bryn', 'Ivor', 'Rhys', 'Trevor', 'Nigel', 'Geraint'],
  JPN: ['Hajime', 'Takeshi', 'Akira', 'Toru', 'Go', 'Daiki', 'Kenta', 'Shuhei', 'Tomohiro', 'Yoshiro', 'Masatada', 'Hiroshi', 'Makoto', 'Yasuto', 'Tsuneyasu', 'Kenji', 'Shinji', 'Tatsuma', 'Yuki', 'Kazuki'],
  AUS: ['Ange', 'Graham', 'Tony', 'Kevin', 'John', 'Ernie', 'Alen', 'Arthur', 'Mark', 'Scott', 'Aurelio', 'Ante', 'Steve', 'Carl', 'Damian', 'Warren', 'Frank', 'Ross', 'Michael', 'Luke'],
  CAN: ['John', 'Mauro', 'Marc', 'Tommy', 'Bobby', 'Jason', 'Paul', 'Martin', 'Nick', 'Stephen', 'Colin', 'Carl', 'Greg', 'Julian', 'Kevin', 'Patrice', 'Atiba', 'Dwayne', 'Samuel', 'Adrian'],
  DEN: ['Kasper', 'Thomas', 'Bo', 'Michael', 'Brian', 'Jon Dahl', 'Jess', 'Niels', 'Morten', 'Kenneth', 'Flemming', 'Glen', 'Kent', 'Christian', 'Troels', 'Carsten', 'Lars', 'Allan', 'Henrik', 'Jens'],
  NOR: ['Ståle', 'Kjetil', 'Ole Gunnar', 'Ronny', 'Egil', 'Lars', 'Eirik', 'Geir', 'Per-Mathias', 'Kåre', 'Henning', 'Dag-Eilev', 'Trond', 'Tom', 'Arild', 'Rune', 'Svein', 'Bjørn', 'Frode', 'Morten'],
  SWE: ['Sven-Göran', 'Janne', 'Henrik', 'Olof', 'Rikard', 'Kim', 'Mikael', 'Andreas', 'Roland', 'Håkan', 'Jörgen', 'Magnus', 'Peter', 'Fredrik', 'Glenn', 'Tommy', 'Stefan', 'Lars', 'Conny', 'Jonas'],
  IDN: ['Indra', 'Bima', 'Fakhri', 'Rahmad', 'Djadjang', 'Aji', 'Widodo', 'Nil', 'Seto', 'Bambang', 'Iwan', 'Benny', 'Kas', 'Yeyen', 'Eduard', 'Agus', 'Hadi', 'Syamsuddin', 'Danurwindo', 'Rudy'],
  IND: ['Khalid', 'Clifford', 'Derrick', 'Sanjoy', 'Syed', 'Subrata', 'Bimal', 'Armando', 'Pradyum', 'Mahesh', 'Savio', 'Bibiano', 'Thangboi', 'Santosh', 'Godfrey', 'Ranjan', 'Tarun', 'Shabbir', 'Sunil', 'Bhaichung'],
  SVK: ['Ján', 'Peter', 'Michal', 'Marek', 'Martin', 'Tomáš', 'Jozef', 'Pavol', 'Milan', 'Vladimír', 'Róbert', 'Stanislav', 'Dušan', 'Ladislav', 'Juraj'],
  PER: ['Carlos', 'Luis', 'Jorge', 'Juan', 'José', 'Víctor', 'César', 'Manuel', 'Pedro', 'Christian', 'Renato', 'Edison', 'Paolo', 'Yoshimar', 'Jefferson'],
  KOR: ['Min-jae', 'Heung-min', 'Kang-in', 'Sun-hong', 'Tae-yong', 'Myung-bo', 'Ji-sung', 'Ja-cheol', 'Chung-yong', 'Young-gwon', 'Dong-gook', 'Seung-woo'],
  BOL: ['Marcelo', 'Ramiro', 'Carlos', 'Erwin', 'Jaime', 'Alejandro', 'Diego', 'Leonel', 'Henry', 'Jhasmani', 'Juan Carlos', 'Gilbert'],
  PAR: ['Roque', 'Oscar', 'Angel', 'Gustavo', 'Miguel', 'Julio', 'Justo', 'Derlis', 'Richard', 'Lucas', 'Fabian', 'Antony'],
  CHI: ['Alexis', 'Arturo', 'Claudio', 'Gary', 'Eduardo', 'Charles', 'Mauricio', 'Jean', 'Jorge', 'Humberto', 'Matias', 'Esteban'],
  CRO: ['Luka', 'Ivan', 'Mateo', 'Mario', 'Domagoj', 'Andrej', 'Marcelo', 'Dejan', 'Ante', 'Josip', 'Borna', 'Lovro', 'Bojan', 'Stipe'],
  GRE: ['Konstantinos', 'Georgios', 'Dimitrios', 'Ioannis', 'Nikolaos', 'Panagiotis', 'Vasileios', 'Christos', 'Alexandros', 'Anastasios', 'Sokratis', 'Angelos']
};

const GENERIC_LAST: Record<string, string[]> = {
  GER: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann'],
  ENG: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke'],
  ESP: ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez'],
  ITA: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti'],
  FRA: ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefevre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard'],
  USA: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'],
  TUR: ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek'],
  ECU: ['Aguinaga', 'Méndez', 'Célico', 'Vizuete', 'Vélez', 'Castillo', 'Ayoví', 'Tenorio', 'Noboa', 'Saritama', 'Hurtado', 'Guerrón', 'Valencia', 'Caicedo', 'Estupiñán', 'Preciado', 'Hincapié', 'Mina', 'Reasco', 'Espinoza', 'Cumbicus', 'Bustos', 'Duró', 'Farías', 'León', 'Campana', 'Plata', 'Gruezo', 'Arboleda', 'Domínguez', 'Ibarra', 'Chalá', 'Paredes', 'Quiñónez', 'Montaño'],
  ARG: ['Gallardo', 'Simeone', 'Pochettino', 'Scaloni', 'Crespo', 'Bielsa', 'Sampaoli', 'Demichelis', 'Beccacece', 'Heinze', 'Coudet', 'Martino', 'Schelotto', 'Milito', 'Russo', 'Gareca', 'Basile', 'Pizzi', 'Zubeldía', 'Domínguez', 'Costas', 'Insua', 'Almirón'],
  BRA: ['Júnior', 'Gaúcho', 'Diniz', 'Menezes', 'Luxemburgo', 'Braga', 'Ceni', 'Scolari', 'Ramalho', 'Nunes', 'Hellmann', 'Machado', 'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Barbosa', 'Carvalho'],
  COL: ['Maturana', 'Gómez', 'Rueda', 'Osorio', 'Gamero', 'Álvarez', 'Suárez', 'García', 'Rivera', 'Bodhert', 'Cabrera', 'Umaña', 'González', 'Restrepo', 'Arias', 'Corredor', 'Herrera', 'Bolillo', 'Flabio', 'Pérez', 'Lorenzo', 'Amaranto'],
  URU: ['Tabárez', 'Alonso', 'Broli', 'Fossati', 'Almada', 'Gutiérrez', 'Larriera', 'Coito', 'Carrasco', 'Aguirre', 'Lasarte', 'Méndez', 'Olivera'],
  MEX: ['Herrera', 'Aguirre', 'Ambriz', 'Vucetich', 'Sánchez', 'Lozano', 'Vázquez', 'Ferretti', 'Galindo', 'Carrillo', 'de la Torre', 'Arias', 'Meza', 'Lapuente', 'Tuca', 'Guzmán', 'Romano', 'Tena', 'Flores', 'Hernández'],
  POR: ['Mourinho', 'Jesus', 'Amorim', 'Conceição', 'Santos', 'Silva', 'Jardim', 'Fonseca', 'Carvalhal', 'Espírito Santo', 'Pereira', 'Martins', 'Ferreira', 'Lage', 'Castro', 'Peseiro', 'Bento', 'Coelho', 'Inácio', 'Machado'],
  POL: ['Nawałka', 'Michniewicz', 'Probierz', 'Skorża', 'Urban', 'Papszun', 'Fornalik', 'Magiera', 'Smuda', 'Stokowiec', 'Lewandowski', 'Kaczmarek', 'Zieliński', 'Brosz', 'Vuković', 'Brzęczek', 'Kowalczyk', 'Górski', 'Dudek', 'Wójcik'],
  AUT: ['Hasenhüttl', 'Glasner', 'Stöger', 'Hütter', 'Trauner', 'Kühbauer', 'Schopp', 'Herzog', 'Baumgartner', 'Ilzer', 'Feldhofer', 'Schmid', 'Ibertsberger', 'Pacult', 'Polster', 'Schöttel', 'Lindenberger', 'Kranjčar', 'Weber', 'Krankl'],
  SUI: ['Yakin', 'Favre', 'Gross', 'Koller', 'Fischer', 'Petković', 'Tami', 'Sforza', 'Weiler', 'Geiger', 'Rahmen', 'Contini', 'Celestini', 'Saibene', 'Schällibaum', 'Castella', 'Wicky', 'Bernegger', 'Lustrinelli', 'Forte'],
  SCO: ['Ferguson', 'Moyes', 'Clarke', 'McInnes', 'Levein', 'McLeish', 'Strachan', 'Lennon', 'Mackay', 'Lambert', 'Davidson', 'Neilson', 'Wright', 'Coyle', 'Goodwin', 'Ross', 'Dalglish', 'Smith', 'McLean', 'Souness'],
  WAL: ['Coleman', 'Hughes', 'Toshack', 'Page', 'Bellamy', 'Giggs', 'Jones', 'Roberts', 'Robinson', 'Pulis', 'Cooper', 'Edwards', 'Flynn', 'Bowen', 'Hartson', 'Speed', 'Gould', 'Rush', 'Saunders', 'Williams'],
  JPN: ['Moriyasu', 'Okada', 'Nishino', 'Oniki', 'Oiwa', 'Iwamasa', 'Hasegawa', 'Yomoda', 'Katanosaka', 'Moriyama', 'Ishii', 'Jofuku', 'Teguramori', 'Miyazawa', 'Miura', 'Matsuhashi', 'Kuroda', 'Soma', 'Nagai', 'Ogawa'],
  AUS: ['Postecoglou', 'Arnold', 'Popovic', 'Muscat', 'Aloisi', 'Merrick', 'Stajcic', 'Papas', 'Rudan', 'Miller', 'Vidmar', 'Milicic', 'Corica', 'Farina', 'Kosmina', 'Talay', 'Montgomery', 'Zadkovich', 'Veart', 'Cklamovski'],
  CAN: ['Herdman', 'Biello', 'Dos Santos', 'Wheeldon', 'Smyrniotis', 'deVos', 'Stalteri', 'Nash', 'Dasovic', 'Hart', 'Miller', 'Robinson', 'Yallop', 'Mitchell', 'Wilson', 'Gagan', 'Furlani', 'D\'Agostino', 'Paonessa', 'Vargas'],
  DEN: ['Hjulmand', 'Frank', 'Svensson', 'Laudrup', 'Tomasson', 'Thorup', 'Frederiksen', 'Wieghorst', 'Riddersholm', 'Povlsen', 'Nielsen', 'Kristiansen', 'Rasmussen', 'Møller', 'Hansen', 'Olsen', 'Pedersen', 'Andersen', 'Christensen', 'Larsen'],
  NOR: ['Solbakken', 'Knutsen', 'Solskjær', 'Deila', 'Olsen', 'Horneland', 'Bakke', 'Høgmo', 'Ingebrigtsen', 'Berg', 'Fagermo', 'Rekdal', 'Hareide', 'Johansen', 'Larsen', 'Hansen', 'Moen', 'Bohinen', 'Semb', 'Rösler'],
  SWE: ['Eriksson', 'Andersson', 'Larsson', 'Mellberg', 'Norling', 'Bergstrand', 'Stahre', 'Alm', 'Nilsson', 'Mild', 'Lennartsson', 'Pehrsson', 'Lagerbäck', 'Hamrén', 'Söderberg', 'Backe', 'Axén', 'Järdler', 'Hellberg', 'Brännström'],
  IDN: ['Sjafri', 'Sakti', 'Husaini', 'Darmawan', 'Nurdjaman', 'Santoso', 'Putro', 'Maizar', 'Nurdiantoro', 'Pamungkas', 'Setiawan', 'Dollo', 'Hartadi', 'Tumena', 'Tjong', 'Pahabol', 'Tuhuteru', 'Salampessy', 'Pattinama', 'Wanggai'],
  IND: ['Jamil', 'Miranda', 'Pereira', 'Sen', 'Rahim Nabi', 'Bhattacharya', 'Ghosh', 'Colaco', 'Reddy', 'Gawli', 'Medeira', 'Fernandes', 'Singhto', 'Kashyap', 'Chhetri', 'Bhutia', 'Dias', 'Lawrence', 'Pradhan', 'D\'Souza'],
  SVK: ['Novák', 'Horváth', 'Kováč', 'Varga', 'Tóth', 'Nagy', 'Baláž', 'Molnár', 'Szabó', 'Lukáč', 'Kozák', 'Weiss', 'Hamšík', 'Škriniar', 'Dubravka'],
  PER: ['Quispe', 'Flores', 'Rodríguez', 'Sánchez', 'García', 'Rojas', 'Díaz', 'Torres', 'López', 'Gonzales', 'Paredes', 'Farfán', 'Guerrero', 'Cueva', 'Gallese']
};

export const REGIONAL_COACH_POOLS: Record<string, string[]> = {
  // South America: High domestic ratio + neighbouring South American tacticians
  ECU: ['ECU', 'ECU', 'ECU', 'ARG', 'COL', 'URU', 'BRA', 'ESP'],
  PER: ['PER', 'PER', 'PER', 'ARG', 'COL', 'URU', 'BRA', 'ESP'],
  ARG: ['ARG', 'ARG', 'ARG', 'BRA', 'URU', 'ESP', 'ITA', 'COL'],
  BRA: ['BRA', 'BRA', 'BRA', 'POR', 'ARG', 'URU', 'ESP'],
  COL: ['COL', 'COL', 'ARG', 'BRA', 'ECU', 'URU', 'ESP'],
  URU: ['URU', 'URU', 'ARG', 'BRA', 'ESP', 'COL'],
  // North America
  USA: ['USA', 'USA', 'ENG', 'GER', 'ESP', 'MEX', 'CAN'],
  CAN: ['CAN', 'CAN', 'USA', 'ENG', 'FRA', 'SCO'],
  MEX: ['MEX', 'MEX', 'ARG', 'BRA', 'ESP', 'COL'],
  // Northern Europe & Scandinavia
  DEN: ['DEN', 'DEN', 'NOR', 'SWE', 'GER', 'ENG'],
  NOR: ['NOR', 'NOR', 'DEN', 'SWE', 'ENG', 'GER'],
  SWE: ['SWE', 'SWE', 'NOR', 'DEN', 'ENG', 'GER'],
  // Central & Western Europe
  GER: ['GER', 'GER', 'AUT', 'SUI', 'ENG', 'FRA', 'ITA', 'ESP', 'DEN'],
  AUT: ['AUT', 'AUT', 'GER', 'SUI', 'ITA', 'CRO'],
  SUI: ['SUI', 'SUI', 'GER', 'FRA', 'ITA', 'AUT'],
  SVK: ['SVK', 'SVK', 'CZE', 'POL', 'AUT', 'GER'],
  ENG: ['ENG', 'ENG', 'SCO', 'WAL', 'ESP', 'POR', 'GER', 'ITA', 'FRA'],
  SCO: ['SCO', 'SCO', 'ENG', 'WAL', 'AUS', 'CAN'],
  WAL: ['WAL', 'WAL', 'ENG', 'SCO'],
  ESP: ['ESP', 'ESP', 'ARG', 'POR', 'ITA', 'FRA', 'BRA'],
  ITA: ['ITA', 'ITA', 'ESP', 'ARG', 'POR', 'FRA'],
  FRA: ['FRA', 'FRA', 'ESP', 'ITA', 'POR', 'ENG'],
  POR: ['POR', 'POR', 'BRA', 'ESP', 'ITA', 'FRA'],
  POL: ['POL', 'POL', 'GER', 'POR', 'ESP', 'ITA'],
  TUR: ['TUR', 'TUR', 'GER', 'POR', 'ITA', 'BRA', 'ENG'],
  // Asia & Oceania
  JPN: ['JPN', 'JPN', 'BRA', 'GER', 'ESP', 'AUS'],
  AUS: ['AUS', 'AUS', 'ENG', 'SCO', 'JPN', 'GER'],
  IDN: ['IDN', 'IDN', 'BRA', 'ESP', 'POR', 'NED', 'JPN'],
  IND: ['IND', 'IND', 'ENG', 'ESP', 'POR', 'AUS', 'SCO']
};

export const generateName = (country: string, isElite: boolean = false): string => {
  let c = GENERIC_FIRST[country] ? country : '';
  if (!c) {
    const reg = REGIONAL_COACH_POOLS[country];
    if (reg && reg.length > 0) {
      c = reg.find(k => GENERIC_FIRST[k]) || 'ENG';
    } else {
      const fallbackList = ['ESP', 'ENG', 'GER', 'FRA', 'BRA', 'POR'];
      c = fallbackList[Math.floor(Math.random() * fallbackList.length)];
    }
  }

  if (isElite && ELITE_COACH_NAMES[c] && Math.random() > 0.35) {
    const elite = ELITE_COACH_NAMES[c];
    return elite[Math.floor(Math.random() * elite.length)];
  }

  const fList = GENERIC_FIRST[c] || GENERIC_FIRST['ENG'];
  const lList = GENERIC_LAST[c] || GENERIC_LAST['ENG'];
  const f = fList[Math.floor(Math.random() * fList.length)];
  const l = lList[Math.floor(Math.random() * lList.length)];
  return `${f} ${l}`;
};

const STYLES = ['Total Football', 'Gegenpressing', 'Tiki-Taka', 'Defensive', 'Direct Counter'];

export const COACH_STRENGTHS = [
  'Talent Magnet',
  'Youth Whisperer',
  'Chaos Magnet',
  'Cursed',
  'Fortress Builder',
  'Master Negotiator',
  'Continental Legend',
  'Cup Specialist',
  'Relegation Specialist',
  'Youth Focus',
  'Top Facilities',
  'Star Power',
  'Sponsor Magnet',
  'Limited Tenure',
  'Tactical Chessboard Maestro',
  'Psychological Mastermind',
  'Award-Winning Pedigree',
  'Low-Tier Veteran'
];

export const COACH_WEAKNESSES = [
  'Morale Drain',
  'Boardroom Warfare',
  'Tactical Rigidity',
  'Financial Hazard',
  'Flight Risk',
  'Fan Alienation',
  'Late Match Heartbreak',
  'Dressing Room Leaks',
  'Youth Apathy'
];

export interface CoachTraitInfo {
  name: string;
  desc: string;
  icon: string;
  color: string;
}

export interface CoachWeaknessInfo {
  name: string;
  desc: string;
  icon: string;
  color: string;
}

export const getCoachTraitInfo = (trait?: string): CoachTraitInfo => {
  switch (trait) {
    case 'Talent Magnet':
      return {
        name: 'Talent Magnet',
        desc: 'Attracts elite players: -20% transfer fees & +1 extra squad OVR on signings.',
        icon: 'fa-magnet',
        color: 'text-amber-400 bg-amber-500/15 border-amber-500/30'
      };
    case 'Youth Whisperer':
      return {
        name: 'Youth Whisperer',
        desc: 'Unlocks academy potential: +40% chance of scouting Generational & Top Tier Wonderkids.',
        icon: 'fa-seedling',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
      };
    case 'Chaos Magnet':
      return {
        name: 'Chaos Magnet',
        desc: 'High variance matches: capable of stunning upsets against elite teams, but prone to wild thrillers.',
        icon: 'fa-bolt',
        color: 'text-fuchsia-400 bg-fuchsia-500/15 border-fuchsia-500/30'
      };
    case 'Cursed':
      return {
        name: 'Cursed (Bad Luck)',
        desc: 'Unlucky referee decisions and late dropped points, but accepts very cheap wages.',
        icon: 'fa-skull-crossbones',
        color: 'text-rose-400 bg-rose-500/15 border-rose-500/30'
      };
    case 'Fortress Builder':
      return {
        name: 'Fortress Builder',
        desc: 'Master of organization: concedes ~25% fewer goals and excels in tight 1-0 derby duels.',
        icon: 'fa-shield-halved',
        color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30'
      };
    case 'Master Negotiator':
      return {
        name: 'Master Negotiator',
        desc: 'Fends off aggressive transfer raids and lowers player wage friction.',
        icon: 'fa-handshake',
        color: 'text-blue-400 bg-blue-500/15 border-blue-500/30'
      };
    case 'Continental Legend':
      return {
        name: 'Continental Legend',
        desc: '+25% win rate in Champions Cup and continental knockout fixtures.',
        icon: 'fa-globe',
        color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30'
      };
    case 'Cup Specialist':
      return {
        name: 'Cup Specialist',
        desc: '+30% bonus in domestic cup ties and knockout rounds.',
        icon: 'fa-trophy',
        color: 'text-amber-300 bg-amber-500/15 border-amber-500/30'
      };
    case 'Relegation Specialist':
      return {
        name: 'Relegation Specialist',
        desc: 'Guarantees clutch performances in relegation Decider matches.',
        icon: 'fa-life-ring',
        color: 'text-orange-400 bg-orange-500/15 border-orange-500/30'
      };
    case 'Star Power':
      return {
        name: 'Star Power',
        desc: 'Global fame increases commercial revenue and fanbase expansion.',
        icon: 'fa-star',
        color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30'
      };
    case 'Sponsor Magnet':
      return {
        name: 'Sponsor Magnet',
        desc: 'Attracts high-paying commercial partners and premium sponsor deals.',
        icon: 'fa-sack-dollar',
        color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
      };
    case 'Youth Focus':
      return {
        name: 'Youth Focus',
        desc: 'Prioritizes young players, granting free Academy level upgrades.',
        icon: 'fa-graduation-cap',
        color: 'text-sky-400 bg-sky-500/15 border-sky-400/30'
      };
    case 'Tactical Chessboard Maestro':
      return {
        name: 'Chessboard Maestro',
        desc: 'Out-thinks opposing managers: +2 OVR bonus against higher-ranked teams & adapts mid-game.',
        icon: 'fa-chess',
        color: 'text-sky-400 bg-sky-500/15 border-sky-400/30'
      };
    case 'Psychological Mastermind':
      return {
        name: 'Psychological Mastermind',
        desc: 'Supreme locker room harmony: shields against morale crashes and accelerates slump recovery.',
        icon: 'fa-brain',
        color: 'text-purple-400 bg-purple-500/15 border-purple-400/30'
      };
    case 'Award-Winning Pedigree':
      return {
        name: 'Award-Winning Champion',
        desc: 'Proven winner: +25% win rate in Cup Finals, title deciders, and high-stakes derbies.',
        icon: 'fa-award',
        color: 'text-amber-400 bg-amber-500/15 border-amber-400/30'
      };
    case 'Low-Tier Veteran':
      return {
        name: 'Low-Tier Veteran',
        desc: 'Master of lower-league grit: accepts humble wages and brings unmatched resilience to relegation scraps.',
        icon: 'fa-shield-halved',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-400/30'
      };
    case 'Top Facilities':
      return {
        name: 'Top Facilities',
        desc: 'Demands top healthcare, granting free Medical Center upgrades.',
        icon: 'fa-hospital',
        color: 'text-purple-400 bg-purple-500/15 border-purple-500/30'
      };
    case 'Limited Tenure':
      return {
        name: 'Limited Tenure',
        desc: 'Elite tactical genius on a high salary who leaves after a short, high-impact stint.',
        icon: 'fa-hourglass-half',
        color: 'text-red-400 bg-red-500/15 border-red-500/30'
      };
    default:
      return {
        name: trait || 'Standard Coach',
        desc: 'Standard tactical manager.',
        icon: 'fa-user-tie',
        color: 'text-white/70 bg-white/10 border-white/20'
      };
  }
};

export const getCoachWeaknessInfo = (weakness?: string): CoachWeaknessInfo => {
  switch (weakness) {
    case 'Morale Drain':
      return {
        name: 'Morale Drain (Tyrant)',
        desc: 'Brutal regime: -15 squad morale each season & risk of key player mutiny (-1 OVR).',
        icon: 'fa-skull',
        color: 'text-rose-400 bg-rose-500/15 border-rose-500/30'
      };
    case 'Boardroom Warfare':
      return {
        name: 'Boardroom Warfare (Diva)',
        desc: 'High-maintenance: -16 Board Impact Score if transfer budget is not actively spent.',
        icon: 'fa-bomb',
        color: 'text-red-400 bg-red-500/15 border-red-500/30'
      };
    case 'Tactical Rigidity':
      return {
        name: 'Tactical Rigidity (Dogmatist)',
        desc: 'Refuses to adapt: -3 OVR penalty if you play any tactical style other than his.',
        icon: 'fa-lock',
        color: 'text-amber-400 bg-amber-500/15 border-amber-500/30'
      };
    case 'Financial Hazard':
      return {
        name: 'Financial Hazard (Spendthrift)',
        desc: 'Siphons club reserves: invoices lavish entourage bonus fees at season end.',
        icon: 'fa-money-bill-transfer',
        color: 'text-orange-400 bg-orange-500/15 border-orange-500/30'
      };
    case 'Flight Risk':
      return {
        name: 'Flight Risk (Mercenary)',
        desc: 'Unloyal: 30% chance per season to unilaterally walk out for a rival or bigger job.',
        icon: 'fa-person-walking-dashed-line-arrow-right',
        color: 'text-purple-400 bg-purple-500/15 border-purple-500/30'
      };
    case 'Fan Alienation':
      return {
        name: 'Fan Alienation (Dinosaur)',
        desc: 'Negative football: suppresses fanbase growth by -25% and stifles goal scoring.',
        icon: 'fa-eye-slash',
        color: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/30'
      };
    case 'Late Match Heartbreak':
      return {
        name: 'Late Match Heartbreak',
        desc: 'Drops points in 90+ min, increases transfer flop rate (+20%), and struggles in shootouts.',
        icon: 'fa-heart-crack',
        color: 'text-red-300 bg-red-500/15 border-red-500/30'
      };
    case 'Dressing Room Leaks':
      return {
        name: 'Dressing Room Leaks',
        desc: 'Toxic media leaks during slumps, damaging Director Reputation (-4) and Board Trust (-8).',
        icon: 'fa-newspaper',
        color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30'
      };
    case 'Youth Apathy':
      return {
        name: 'Youth Apathy',
        desc: 'Completely ignores youth: wonderkids stagnate and academy progression is severely slowed.',
        icon: 'fa-ban',
        color: 'text-pink-400 bg-pink-500/15 border-pink-500/30'
      };
    default:
      return {
        name: weakness || 'Minor Downside',
        desc: 'Minor tactical friction under adverse circumstances.',
        icon: 'fa-circle-exclamation',
        color: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/30'
      };
  }
};

export const pickWeaknessForCoach = (strength: string, ovrBoost: number): string => {
  // Elite coaches have high-profile steep downsides
  if (ovrBoost >= 3 || strength === 'Limited Tenure') {
    const eliteDownsides = ['Boardroom Warfare', 'Morale Drain', 'Flight Risk', 'Tactical Rigidity'];
    return eliteDownsides[Math.floor(Math.random() * eliteDownsides.length)];
  }
  if (strength === 'Tactical Chessboard Maestro') {
    return Math.random() < 0.6 ? 'Tactical Rigidity' : 'Boardroom Warfare';
  }
  if (strength === 'Psychological Mastermind') {
    return Math.random() < 0.5 ? 'Dressing Room Leaks' : 'Flight Risk';
  }
  if (strength === 'Award-Winning Pedigree') {
    return Math.random() < 0.5 ? 'Boardroom Warfare' : 'Financial Hazard';
  }
  if (strength === 'Low-Tier Veteran') {
    return Math.random() < 0.5 ? 'Tactical Rigidity' : 'Fan Alienation';
  }
  if (strength === 'Talent Magnet' || strength === 'Star Power') {
    return Math.random() < 0.5 ? 'Boardroom Warfare' : 'Financial Hazard';
  }
  if (strength === 'Fortress Builder') {
    return Math.random() < 0.5 ? 'Morale Drain' : 'Fan Alienation';
  }
  if (strength === 'Chaos Magnet') {
    return Math.random() < 0.5 ? 'Dressing Room Leaks' : 'Late Match Heartbreak';
  }
  if (strength === 'Cursed') {
    return 'Late Match Heartbreak';
  }
  if (strength === 'Relegation Specialist') {
    return Math.random() < 0.5 ? 'Fan Alienation' : 'Youth Apathy';
  }
  if (strength === 'Youth Whisperer' || strength === 'Youth Focus') {
    return Math.random() < 0.5 ? 'Tactical Rigidity' : 'Morale Drain';
  }
  if (strength === 'Master Negotiator' || strength === 'Sponsor Magnet') {
    return 'Financial Hazard';
  }
  // Default pick from pool
  return COACH_WEAKNESSES[Math.floor(Math.random() * COACH_WEAKNESSES.length)];
};

export const COACH_ARCHETYPE_CONFIG: Record<CoachArchetype, {
  labelEn: string;
  labelDe: string;
  icon: string;
  badgeClass: string;
  defaultFormations: string[];
  bioTemplatesEn: string[];
  bioTemplatesDe: string[];
}> = {
  chessboard_maestro: {
    labelEn: 'Tactical Chessboard Maestro',
    labelDe: 'Taktischer Schachbrett-Meister',
    icon: 'fa-chess',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    defaultFormations: ['3-4-2-1 Inverted', '4-3-3 Hybrid', '4-2-3-1 Overload'],
    bioTemplatesEn: [
      'Obsessive student of positional play. Spends sleepless nights diagramming pressing triggers and overload channels.',
      'Treats every pitch as a 64-square chessboard, dissecting opposing defensive block structures with ruthless geometry.'
    ],
    bioTemplatesDe: [
      'Akribischer Taktik-Fanatiker. Analysiert gegnerische Pressing-Muster bis ins Detail und zerlegt Abwehrblöcke mit geometrischer Präzision.',
      'Begreift das Spielfeld als Schachbrett. Perfektioniert Automatismen, Raumaufteilung und situative Überladungen.'
    ]
  },
  psychological_mastermind: {
    labelEn: 'Psychological Mastermind',
    labelDe: 'Tiefenpsychologischer Meister',
    icon: 'fa-brain',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
    defaultFormations: ['4-3-3 Free Role', '4-2-2-2 Box', '3-5-2 Expressive'],
    bioTemplatesEn: [
      'Believes football is won between the ears. Master of emotional resonance, ego de-escalation, and creating unbreakable dressing room trust.',
      'A holistic man-manager who turns troubled dressing rooms into cohesive wolfpacks through deep emotional psychology.'
    ],
    bioTemplatesDe: [
      'Überzeugt davon, dass Spiele im Kopf entschieden werden. Meister im Umgang mit großen Egos, Teambuilding und emotionaler Resilienz.',
      'Schweißt zerrüttete Kabinen zu einer verschworenen Einheit zusammen. Versteht die Seelen seiner Spieler wie kein Zweiter.'
    ]
  },
  award_winner: {
    labelEn: 'Award-Winning Champion',
    labelDe: 'Titeldekorierter Erfolgstrainer',
    icon: 'fa-award',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    defaultFormations: ['4-3-3 Championship', '4-2-3-1 Dominant', '3-4-3 Continental'],
    bioTemplatesEn: [
      'Serial winner adorned with domestic and continental silverware. Commands unshakeable authority and delivers in high-stakes deciders.',
      'A trophy-proven general whose pedigree alone strikes fear into opposition benches in tournament knockout stages.'
    ],
    bioTemplatesDe: [
      'Seriensieger mit reichlich Titelerfahrung. Strahlt absolute Siegermentalität aus und gewinnt die entscheidenden Endspiele.',
      'Erfahrener Champion, dessen Trophäenschrank für sich spricht. Seine Ruhe in Pokalfinals ist legendär.'
    ]
  },
  low_tier_veteran: {
    labelEn: 'Low-Tier Veteran',
    labelDe: 'Unterhaus-Routinier',
    icon: 'fa-shield-halved',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    defaultFormations: ['4-4-2 Trench', '5-3-2 Resilient', '4-1-4-1 Low Block'],
    bioTemplatesEn: [
      'Hardened in the cold rain of lower-division football. Uncompromising pragmatist who knows how to survive on a shoestring budget.',
      'A muddy-boots veteran of over 500 lower-league battles. Knows every tackle, trick, and scrap required to grind out vital points.'
    ],
    bioTemplatesDe: [
      'Gestählt im Schlamm der Unterhäuser. Schnörkelloser Pragmatiker, der aus minimalem Budget das absolute Maximum herausholt.',
      'Über 500 Spiele an der Seitenlinie im rauen Ligabetrieb. Kennt alle Kniffe im Abstiegskampf und scheut keinen Regenfight.'
    ]
  },
  youth_visionary: {
    labelEn: 'Youth Visionary',
    labelDe: 'Nachwuchs-Visionär',
    icon: 'fa-seedling',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    defaultFormations: ['4-3-3 Dynamic', '3-4-2-1 High Tempo', '4-2-3-1 Youth'],
    bioTemplatesEn: [
      'Pioneer of modern talent pathways. Fearlessly hands first-team debuts to teenagers and molds raw prospects into world-class stars.',
      'Dedicated mentor who sees what others miss in young footballers, building sustainable, high-energy footballing dynasties.'
    ],
    bioTemplatesDe: [
      'Wegbereiter für junge Talente. Gibt Teenagern ohne Zögern Startelf-Einsätze und formt Rohdiamanten zu Nationalspielern.',
      'Geduldiger Förderer mit Adlerauge für Entwicklungspotenziale. Erschafft blutjunge, temporeiche Mannschaften.'
    ]
  },
  iron_disciplinarian: {
    labelEn: 'Iron Disciplinarian',
    labelDe: 'Harter Schleifer',
    icon: 'fa-dumbbell',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    defaultFormations: ['4-4-2 Compact', '5-4-1 Wall', '4-3-2-1 Fortress'],
    bioTemplatesEn: [
      'Zero excuses, zero complacency. Strict fitness standards, iron-clad defensive assignments, and relentless 90-minute stamina.',
      'Demands militaristic discipline on and off the pitch. Concedes very few goals, but tolerates no shortcuts.'
    ],
    bioTemplatesDe: [
      'Null Toleranz für Schlendrian. Militärische Disziplin, kompromisslose Zweikampfführung und bedingungslose Fitness.',
      'Defensive Stabilität durch eiserne Prinzipien. Verzeiht keine Unkonzentriertheiten auf dem Rasen.'
    ]
  },
  pragmatic_grinder: {
    labelEn: 'Pragmatic Grinder',
    labelDe: 'Pragmatischer Arbeiter',
    icon: 'fa-gear',
    badgeClass: 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30',
    defaultFormations: ['4-2-3-1 Solid', '4-3-3 Balanced', '4-4-2 Flat'],
    bioTemplatesEn: [
      'No fuss, no ego, pure work. Adapts to squad limitations and reliably hits club targets season after season.',
      'Reliable club builder who maximizes squad chemistry and avoids unnecessary drama in the press or boardroom.'
    ],
    bioTemplatesDe: [
      'Bodenständiger Arbeiter ohne Star-Allüren. Holt kontinuierlich das Optimum aus den vorhandenen Spielern heraus.',
      'Zuverlässiger Club-Manager, der für Ruhe und berechenbare Punkteausbeuten sorgt.'
    ]
  }
};

export const generateCoachHiddenAttributes = (
  archetype: CoachArchetype,
  _coachQuality: number,
  _tier: number
): CoachHiddenAttributes => {
  const clamp = (val: number) => Math.max(1, Math.min(20, Math.round(val)));
  const randOffset = () => Math.floor(Math.random() * 5) - 2; // -2 to +2

  switch (archetype) {
    case 'chessboard_maestro':
      return {
        tacticalFlexibility: clamp(18 + randOffset()),
        manManagement: clamp(12 + randOffset()),
        motivationalDrive: clamp(14 + randOffset()),
        youthNurturing: clamp(13 + randOffset()),
        discipline: clamp(16 + randOffset()),
        boardAlignment: clamp(11 + randOffset()),
      };
    case 'psychological_mastermind':
      return {
        tacticalFlexibility: clamp(14 + randOffset()),
        manManagement: clamp(19 + randOffset()),
        motivationalDrive: clamp(18 + randOffset()),
        youthNurturing: clamp(16 + randOffset()),
        discipline: clamp(13 + randOffset()),
        boardAlignment: clamp(15 + randOffset()),
      };
    case 'award_winner':
      return {
        tacticalFlexibility: clamp(18 + randOffset()),
        manManagement: clamp(16 + randOffset()),
        motivationalDrive: clamp(19 + randOffset()),
        youthNurturing: clamp(12 + randOffset()),
        discipline: clamp(15 + randOffset()),
        boardAlignment: clamp(12 + randOffset()),
      };
    case 'low_tier_veteran':
      return {
        tacticalFlexibility: clamp(12 + randOffset()),
        manManagement: clamp(14 + randOffset()),
        motivationalDrive: clamp(17 + randOffset()),
        youthNurturing: clamp(13 + randOffset()),
        discipline: clamp(18 + randOffset()),
        boardAlignment: clamp(17 + randOffset()),
      };
    case 'youth_visionary':
      return {
        tacticalFlexibility: clamp(15 + randOffset()),
        manManagement: clamp(15 + randOffset()),
        motivationalDrive: clamp(14 + randOffset()),
        youthNurturing: clamp(20 + randOffset()),
        discipline: clamp(12 + randOffset()),
        boardAlignment: clamp(16 + randOffset()),
      };
    case 'iron_disciplinarian':
      return {
        tacticalFlexibility: clamp(11 + randOffset()),
        manManagement: clamp(10 + randOffset()),
        motivationalDrive: clamp(16 + randOffset()),
        youthNurturing: clamp(11 + randOffset()),
        discipline: clamp(20 + randOffset()),
        boardAlignment: clamp(13 + randOffset()),
      };
    default:
      return {
        tacticalFlexibility: clamp(13 + randOffset()),
        manManagement: clamp(13 + randOffset()),
        motivationalDrive: clamp(14 + randOffset()),
        youthNurturing: clamp(12 + randOffset()),
        discipline: clamp(15 + randOffset()),
        boardAlignment: clamp(15 + randOffset()),
      };
  }
};

const generateDynamicBio = (tier: number, archetype: string, strength: string, weakness: string, trophies: number, isReserve: boolean): string => {
    if (isReserve) {
        return `A loyal club servant who knows the grassroots setup inside and out. Renowned for their '${strength}' approach with the academy, though critics point to their '${weakness}' when tested under top-flight pressure.`;
    }

    let intro = '';
    if (trophies >= 10) {
        intro = `A decorated heavyweight with ${trophies} major honours to their name.`;
    } else if (trophies >= 3) {
        intro = `A proven winner with ${trophies} pieces of silverware in the cabinet.`;
    } else if (tier <= 2) {
        intro = `An ambitious tactician rapidly climbing the ranks of the elite circuit.`;
    } else if (tier >= 5) {
        intro = `A muddy-boots veteran forged in the cold rain of the lower-league trenches.`;
    } else {
        intro = `A seasoned professional operating in the highly competitive mid-tiers of football.`;
    }

    let mid = '';
    if (strength === 'Relegation Specialist') {
        mid = `Legendary for pulling off a miraculous Decision Day survival campaign years ago.`;
    } else if (strength === 'Youth Whisperer' || strength === 'Youth Focus') {
        mid = `Famous for building a golden generation entirely from local academy teenagers.`;
    } else if (strength === 'Continental Legend') {
        mid = `Feared across the continent for tactical masterclasses under the bright lights of midweek knockout ties.`;
    } else if (strength === 'Chaos Magnet') {
        mid = `Known for heavy-metal football that produces wild thrillers and impossible giant-killings.`;
    } else if (strength === 'Tactical Chessboard Maestro') {
        mid = `Treats the pitch like a 64-square chessboard, dissecting opposing defensive blocks with ruthless geometry.`;
    } else if (strength === 'Psychological Mastermind') {
        mid = `A holistic man-manager who turns troubled dressing rooms into cohesive wolfpacks.`;
    } else {
        mid = `Highly respected by peers for their signature '${strength}' approach to the game.`;
    }

    let end = '';
    if (weakness === 'Boardroom Warfare' || weakness === 'Flight Risk') {
        end = `However, their tenure is often overshadowed by intense boardroom friction and a mercenary reputation.`;
    } else if (weakness === 'Morale Drain' || weakness === 'Dressing Room Leaks') {
        end = `Despite their genius, past stints have ended in highly publicized, toxic dressing room mutinies.`;
    } else if (weakness === 'Tactical Rigidity') {
        end = `Critics, however, label them a stubborn dogmatist who flatly refuses to implement a 'Plan B'.`;
    } else if (weakness === 'Late Match Heartbreak') {
        end = `Yet, their legacy is haunted by a curse of conceding devastating late goals in crucial crunch matches.`;
    } else if (weakness === 'Financial Hazard') {
        end = `The biggest concern for any hiring board is their reputation for burning through transfer budgets and demanding lavish entourage fees.`;
    } else {
        end = `Their biggest hurdle remains overcoming a tendency for '${weakness}' when the stakes are highest.`;
    }

    return `${intro} ${mid} ${end}`;
};

export const generateCoachMarket = (tier: number, country: string, directorRep: number, firedCount: number, seasonPhase?: string, clubIdentity?: string): Coach[] => {
  const market: Coach[] = [];
    
  // Available coaches based on tier and reputation penalty
  const effectiveRep = Math.max(1, directorRep);
  
  // Generate more coaches for a richer market (6-8 coaches)
  const numCoaches = Math.max(4, 8 - Math.floor(firedCount / 2));
  const allCountries = Object.keys(ELITE_COACH_NAMES);
  const regionalPool = (country && REGIONAL_COACH_POOLS[country]) || ['ESP', 'ENG', 'GER', 'FRA', 'BRA', 'ARG'];
  const usedNames = new Set<string>();
  
  for (let i = 0; i < numCoaches; i++) {
    const isMidSeason = seasonPhase === 'mid';
    let promise: 'title' | 'survival' | 'cups' | undefined = undefined;
    let isDeceiving = false;
    
    if (isMidSeason) {
       const promises: ('title' | 'survival' | 'cups')[] = ['title', 'survival', 'cups'];
       promise = promises[Math.floor(Math.random() * promises.length)];
       isDeceiving = Math.random() > 0.6; // 40% chance to be deceiving
    }
    
    // Determine quality of coach (0 to 100)
    let coachQuality = Math.random() * 100;
    
    // Penalize quality if we fired too many coaches
    if (firedCount > 2) {
      coachQuality *= 0.7; // Harder to get good coaches
    }
    
    // Scale OVR boost (Tier 1 can get up to +4, Tier 5 gets +1)
    let maxBoost = 4;
    if (tier > 2) maxBoost = 3;
    if (tier > 4) maxBoost = 2;
    
    let ovrBoost = 1;
    if (coachQuality > 90 && effectiveRep > 80) ovrBoost = maxBoost;
    else if (coachQuality > 70 && effectiveRep > 60) ovrBoost = Math.max(1, maxBoost - 1);
    else if (coachQuality < 20) ovrBoost = -1; // Toxic/Bad coach!
    
    // Prioritize domestic coaches with healthy regional diversity
    let randomNat = (country && Math.random() < 0.65) 
      ? country 
      : regionalPool[Math.floor(Math.random() * regionalPool.length)];
    let randomName = generateName(randomNat, tier <= 3 && coachQuality > 75);
    let attempts = 0;
    while (usedNames.has(randomName) && attempts < 10) {
      randomNat = regionalPool[Math.floor(Math.random() * regionalPool.length)];
      randomName = generateName(randomNat, tier <= 3 && coachQuality > 75);
      attempts++;
    }
    usedNames.add(randomName);
    
    const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];

    let availableArchetypes: CoachArchetype[] = [];
    if (clubIdentity === 'galactico') {
      availableArchetypes = ['award_winner', 'psychological_mastermind', 'award_winner', 'psychological_mastermind', 'chessboard_maestro'];
    } else if (clubIdentity === 'moneyball') {
      availableArchetypes = ['pragmatic_grinder', 'chessboard_maestro', 'pragmatic_grinder', 'chessboard_maestro', 'iron_disciplinarian'];
    } else if (clubIdentity === 'wonderkid') {
      availableArchetypes = ['youth_visionary', 'youth_visionary', 'youth_visionary', tier <= 2 ? 'chessboard_maestro' : 'low_tier_veteran', 'pragmatic_grinder'];
    } else if (clubIdentity === 'heritage') {
      availableArchetypes = ['iron_disciplinarian', 'low_tier_veteran', 'iron_disciplinarian', 'low_tier_veteran', 'pragmatic_grinder'];
    } else {
      if (tier <= 2) {
        availableArchetypes = ['chessboard_maestro', 'psychological_mastermind', 'award_winner', 'iron_disciplinarian'];
      } else if (tier <= 4) {
        availableArchetypes = ['pragmatic_grinder', 'iron_disciplinarian', 'youth_visionary', 'chessboard_maestro'];
      } else {
        availableArchetypes = ['low_tier_veteran', 'youth_visionary', 'pragmatic_grinder', 'iron_disciplinarian'];
      }
    }
    const coachArchetype: CoachArchetype = availableArchetypes[i % availableArchetypes.length];

    // Realistic contract durations based on European professional football standards:
    // Elite / Prestige / Top-Tier: 3-4 years (stability and long-term project)
    // Low-Tier / Veteran / Firefighter: 1-2 years (shorter horizon, survival mandate)
    // Standard professional managers: 2-3 years (standard multi-year deal)
    let contractLength = 2;
    if (tier <= 2 || coachQuality >= 78 || coachArchetype === 'award_winner' || coachArchetype === 'chessboard_maestro') {
      contractLength = Math.random() < 0.4 ? 4 : 3;
    } else if (tier >= 5 || coachArchetype === 'low_tier_veteran' || coachQuality < 58) {
      contractLength = Math.random() < 0.35 ? 1 : 2;
    } else {
      contractLength = Math.random() < 0.45 ? 3 : 2;
    }

    // Align signature strength with archetype (with a 20% chance for specialized flavour traits like Cup Specialist, Chaos Magnet, Limited Tenure, etc.)
    let randomStrength = COACH_STRENGTHS[Math.floor(Math.random() * COACH_STRENGTHS.length)];
    const keepSpecialTrait = Math.random() < 0.20;
    if (!keepSpecialTrait) {
      if (coachArchetype === 'chessboard_maestro') {
        randomStrength = coachQuality >= 78 ? 'Tactical Chessboard Maestro' : (Math.random() < 0.5 ? 'Fortress Builder' : 'Master Negotiator');
      } else if (coachArchetype === 'psychological_mastermind') {
        randomStrength = 'Psychological Mastermind';
      } else if (coachArchetype === 'award_winner') {
        randomStrength = Math.random() < 0.7 ? 'Award-Winning Pedigree' : 'Continental Legend';
      } else if (coachArchetype === 'low_tier_veteran') {
        randomStrength = Math.random() < 0.7 ? 'Low-Tier Veteran' : 'Relegation Specialist';
      } else if (coachArchetype === 'youth_visionary') {
        randomStrength = Math.random() < 0.5 ? 'Youth Whisperer' : 'Youth Focus';
      } else if (coachArchetype === 'iron_disciplinarian') {
        randomStrength = 'Fortress Builder';
      } else if (coachArchetype === 'pragmatic_grinder') {
        randomStrength = Math.random() < 0.5 ? 'Master Negotiator' : 'Sponsor Magnet';
      }
    }

    // Legendary Short-Term Coach Logic
    if (randomStrength === 'Limited Tenure') {
      if (tier <= 2) {
        ovrBoost = maxBoost + (Math.random() > 0.5 ? 1 : 2);
        contractLength = 1; // Short-term high-impact stint
      } else {
        ovrBoost = maxBoost + 1;
        contractLength = Math.random() < 0.6 ? 1 : 2;
      }
    }

    // Cost scaling
    let baseCost = getLeagueScaledVal(tier, 6500, country);
    baseCost = baseCost * (0.8 + Math.random() * 0.4);

    // Deceiving coaches demand wages matching their "perceived" quality before flipping to negative
    const perceivedBoost = Math.max(1, Math.abs(ovrBoost));
    if (perceivedBoost > 1) baseCost *= (1 + (perceivedBoost - 1) * 0.6);
    else if (ovrBoost === 0) baseCost *= 0.5;
    else if (ovrBoost < 0 && !isDeceiving) baseCost *= 0.3; // Very cheap if openly bad

    if (randomStrength === 'Limited Tenure') {
      baseCost *= tier <= 2 ? 1.8 : 1.5;
    }

    // Required Reputation based on perceived boost before deceiving flip
    let repReq = 10;
    if (perceivedBoost === 2) repReq = 40;
    if (perceivedBoost === 3) repReq = 70;
    if (perceivedBoost >= 4) repReq = 90;

    // Specific Archetype modifiers
    if (coachArchetype === 'low_tier_veteran' || randomStrength === 'Low-Tier Veteran') {
      baseCost = Math.max(2, Math.round(baseCost * 0.55)); // Affordable for grassroots clubs
      repReq = Math.min(repReq, 15); // Accessible to lower league clubs
    } else if (coachArchetype === 'award_winner') {
      baseCost = Math.round(baseCost * 1.35); // Commands champion wages
      repReq = Math.max(repReq, 45); // Demands minimum club prestige
    } else if (coachArchetype === 'chessboard_maestro') {
      repReq = Math.max(repReq, 30);
    }
    baseCost = Math.max(2, Math.round(baseCost));
    
    // Generate a realistic win rate based on coach quality
    const baseWinRate = 35;
    const addedWinRate = (coachQuality / 100) * 35; // up to +35%
    const winRate = Math.floor(baseWinRate + addedWinRate + (Math.random() * 10 - 5)); // 30% to 80% range
    
    if (isMidSeason && isDeceiving) {
      if (ovrBoost > 0) ovrBoost = -Math.abs(ovrBoost); // flip to negative!
      else if (ovrBoost === 0) ovrBoost = -1;
    }

    const randomWeakness = pickWeaknessForCoach(randomStrength, ovrBoost);
    const archConfig = COACH_ARCHETYPE_CONFIG[coachArchetype];
    const hiddenAttributes = generateCoachHiddenAttributes(coachArchetype, coachQuality, tier);
    const preferredFormation = archConfig.defaultFormations[Math.floor(Math.random() * archConfig.defaultFormations.length)];
    let trophyPedigree = 0;
    if (tier <= 2 || coachArchetype === 'award_winner') {
      trophyPedigree = Math.floor(Math.random() * 8) + (coachArchetype === 'award_winner' ? 4 : 0);
    } else if (tier <= 4) {
      trophyPedigree = Math.floor(Math.random() * 3);
    } else {
      trophyPedigree = 0;
    }
    const bio = generateDynamicBio(tier, coachArchetype, randomStrength, randomWeakness, trophyPedigree, false);

    market.push({
      id: 'coach_' + Date.now() + '_' + i,
      name: randomName,
      ovrBoost,
      cost: Math.floor(baseCost),
      repReq,
      style: randomStyle,
      country,
      strength: randomStrength,
      weakness: randomWeakness,
      archetype: coachArchetype,
      coachArchetype,
      coachArchetypeLabel: archConfig.labelEn,
      hiddenAttributes,
      preferredFormation,
      trophyPedigree,
      bio,
      contractLength,
      contractYearsLeft: contractLength,
      nationality: randomNat,
      winRate,
      promise,
      isDeceiving,
      isScouted: false
    });
  }
  
  // Provide the Reserve Team Coach (High variance gamble)
  const reserveBoost = Math.min(tier > 4 ? 2 : tier > 2 ? 3 : 4, Math.floor(Math.random() * 6) - 2);
  const reserveQuality = Math.random() * 100;
  const reserveNat = (country && Math.random() < 0.85) ? country : regionalPool[Math.floor(Math.random() * regionalPool.length)];
  const reserveName = generateName(reserveNat, tier <= 3 && reserveQuality > 75);
  
  const reserveContract = Math.random() < 0.25 ? 2 : 1;
  
  if (seasonPhase !== 'mid') {
    const reserveArch: CoachArchetype = 'youth_visionary';
    const reserveArchConfig = COACH_ARCHETYPE_CONFIG[reserveArch];
    market.push({
        id: 'coach_reserve_' + Date.now(),
        name: reserveName,
        ovrBoost: reserveBoost,
        cost: Math.floor(getLeagueScaledVal(tier, 2500, country)), // Extremely cheap wage
        repReq: 0,
        style: STYLES[Math.floor(Math.random() * STYLES.length)],
        country,
        strength: 'Youth Focus',
        weakness: 'Tactical Rigidity',
        archetype: reserveArch,
        coachArchetype: reserveArch,
        coachArchetypeLabel: reserveArchConfig.labelEn,
        hiddenAttributes: generateCoachHiddenAttributes(reserveArch, reserveQuality, tier),
        preferredFormation: reserveArchConfig.defaultFormations[0],
        trophyPedigree: 0,
        contractLength: reserveContract,
        contractYearsLeft: reserveContract,
        nationality: reserveNat,
        winRate: Math.floor(Math.random() * 20) + 15, // 15-35%
        bio: generateDynamicBio(tier, 'youth_visionary', 'Youth Focus', 'Tactical Rigidity', 0, true),
        isReserveCoach: true,
        isScouted: true
    });
  }

  // Always provide a desperate generic coach fallback
  if (seasonPhase !== 'mid') {
    const fallbackArch: CoachArchetype = 'low_tier_veteran';
    const fallbackArchConfig = COACH_ARCHETYPE_CONFIG[fallbackArch];
    market.push({
        id: 'coach_fallback',
        name: 'Desperate Interim',
        ovrBoost: 0,
        cost: Math.floor(getLeagueScaledVal(tier, 5000, country)),
        repReq: 0,
        style: 'Defensive',
        country,
        strength: 'Fortress Builder',
        weakness: 'Fan Alienation',
        archetype: fallbackArch,
        coachArchetype: fallbackArch,
        coachArchetypeLabel: fallbackArchConfig.labelEn,
        hiddenAttributes: generateCoachHiddenAttributes(fallbackArch, 45, tier),
        preferredFormation: fallbackArchConfig.defaultFormations[0],
        trophyPedigree: 0,
        contractLength: 1,
        contractYearsLeft: 1,
        nationality: country,
        winRate: 25,
        bio: generateDynamicBio(tier, 'low_tier_veteran', 'Fortress Builder', 'Fan Alienation', 0, false),
        isScouted: true
    });
  }
  
  return market;
};

export const generateExistingCoachForClub = (tier: number, country: string): Coach => {
  const coaches = generateCoachMarket(tier, country, 50, 0);
  const eligible = coaches.filter(c => !c.isReserveCoach && c.id !== 'coach_fallback' && c.ovrBoost >= 0);
  const chosen = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : coaches[0];
  if (chosen.ovrBoost < 0) {
    chosen.ovrBoost = 0;
  }
  // Realistic existing coach contract status: 1 yr (35% expiring), 2 yrs (50% stable), 3 yrs (15% long-term)
  const randVal = Math.random();
  const contractLength = randVal < 0.35 ? 1 : randVal < 0.85 ? 2 : 3;
  return {
    ...chosen,
    id: 'coach_incumbent_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    contractLength,
    contractYearsLeft: contractLength,
    isDeceiving: false,
    isScouted: true,
    weakness: chosen.weakness || pickWeaknessForCoach(chosen.strength || 'Fortress Builder', chosen.ovrBoost)
  };
};

export const ensureCoachHiddenAttributes = (coach?: Partial<Coach> | null): CoachHiddenAttributes => {
  if (coach?.hiddenAttributes && typeof coach.hiddenAttributes.tacticalFlexibility === 'number') {
    return coach.hiddenAttributes;
  }
  const arch: CoachArchetype = (coach?.coachArchetype as CoachArchetype) || (coach?.archetype as CoachArchetype) || 'pragmatic_grinder';
  return generateCoachHiddenAttributes(arch, 60, 2);
};

export const getCoachArchetypeConfig = (archetype?: string) => {
  if (archetype && COACH_ARCHETYPE_CONFIG[archetype as CoachArchetype]) {
    return COACH_ARCHETYPE_CONFIG[archetype as CoachArchetype];
  }
  return COACH_ARCHETYPE_CONFIG['pragmatic_grinder'];
};

