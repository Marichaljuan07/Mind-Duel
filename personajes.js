const PERSONAJES = [
  {
    "nombre": "Albert Einstein",
    "alias": [
      "einstein"
    ],
    "descripcion": "Físico alemán conocido por la teoría de la relatividad y por transformar nuestra comprensión del espacio, el tiempo y la energía.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "aleman"
    ],
    "idiomas": [
      "aleman",
      "ingles"
    ],
    "etiquetas": [
      "bigote",
      "cientifico",
      "fisico",
      "gafas",
      "genio",
      "inventor",
      "pacifista",
      "premio_nobel",
      "premios",
      "profesor"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Marie Curie",
    "alias": [
      "curie"
    ],
    "descripcion": "Científica polaca-francesa pionera en el estudio de la radiactividad y ganadora de dos premios Nobel en disciplinas distintas.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "polaco",
      "frances"
    ],
    "idiomas": [
      "polaco",
      "frances"
    ],
    "etiquetas": [
      "cientifico",
      "fisico",
      "pacifista",
      "pobre",
      "premio_nobel",
      "premios",
      "profesor",
      "quimico",
      "tecnologia"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Leonardo da Vinci",
    "alias": [
      "leonardo",
      "da vinci"
    ],
    "descripcion": "Artista e inventor italiano del Renacimiento, autor de la Mona Lisa y de numerosos estudios científicos y mecánicos.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "italiano"
    ],
    "idiomas": [
      "italiano"
    ],
    "etiquetas": [
      "artista",
      "cientifico",
      "genio",
      "inventor",
      "pacifista",
      "pintor",
      "renacimiento"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Cleopatra",
    "alias": [
      "cleopatra vii"
    ],
    "descripcion": "Reina del antiguo Egipto y última gran gobernante de la dinastía ptolemaica, célebre por su habilidad política.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "africa",
    "nacionalidades": [
      "egipcio"
    ],
    "idiomas": [],
    "etiquetas": [
      "antiguedad",
      "gobernante",
      "politico",
      "reina",
      "rico"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Napoleón Bonaparte",
    "alias": [
      "napoleon",
      "bonaparte"
    ],
    "descripcion": "Militar y emperador francés que dominó gran parte de Europa a comienzos del siglo XIX.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "frances"
    ],
    "idiomas": [
      "frances"
    ],
    "etiquetas": [
      "bajo",
      "conquistador",
      "emperador",
      "gobernante",
      "militar",
      "politico",
      "rico",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "William Shakespeare",
    "hijos": true, "animal": false, "origen_terrestre": true, "artista": true, "combate": false,
    "alias": [
      "shakespeare"
    ],
    "descripcion": "Dramaturgo y poeta inglés, autor de obras como Hamlet, Macbeth y Romeo y Julieta.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "ingles",
      "britanico"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "autor",
      "dramaturgo",
      "escritor",
      "pobre",
      "poeta",
      "renacimiento"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Nikola Tesla",
    "alias": [
      "tesla"
    ],
    "descripcion": "Inventor e ingeniero conocido por sus aportes fundamentales a los sistemas de corriente alterna.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "serbio",
      "estadounidense"
    ],
    "idiomas": [
      "serbio",
      "ingles"
    ],
    "etiquetas": [
      "alto",
      "cientifico",
      "genio",
      "ingeniero",
      "inventor",
      "pacifista",
      "pobre",
      "tecnologia"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Frida Kahlo",
    "alias": [
      "frida",
      "kahlo"
    ],
    "descripcion": "Pintora mexicana reconocida por sus autorretratos y por una obra profundamente ligada a su identidad y experiencias personales.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "mexicano"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "artista",
      "pacifista",
      "pintor"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Lionel Messi",
    "hijos": true, "animal": false, "origen_terrestre": true, "artista": false, "escritor": false, "cientifico": false, "combate": false,
    "alias": [
      "messi",
      "leo messi"
    ],
    "descripcion": "Futbolista argentino considerado uno de los mejores jugadores de la historia del deporte.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "argentino"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "deportista",
      "futbolista"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Ada Lovelace",
    "alias": [
      "lovelace",
      "ada"
    ],
    "descripcion": "Matemática británica del siglo XIX, conocida por su trabajo sobre la máquina analítica de Charles Babbage y por ser una pionera de la programación.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "britanico",
      "ingles"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "cientifico",
      "inventor",
      "matematico",
      "pacifista",
      "programador",
      "tecnologia"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Batman",
    "alias": [
      "bruce wayne"
    ],
    "descripcion": "Héroe ficticio de DC Comics. Bruce Wayne combate el crimen con inteligencia, entrenamiento y tecnología, sin superpoderes.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "alto",
      "detective",
      "heroe",
      "millonario",
      "rico",
      "superheroe",
      "tecnologia"
    ],
    "medios": [
      "comic",
      "pelicula",
      "serie"
    ],
    "poderes": false,
    "magia": false,
    "universo": "dc",
    "mascara": true,
    "capa": true,
    "marvel": false,
    "dc": true
  },
  {
    "nombre": "Spider-Man",
    "alias": [
      "hombre arana",
      "peter parker",
      "spider man",
      "spider-man",
      "spiderman"
    ],
    "descripcion": "Superhéroe de Marvel. Peter Parker obtiene habilidades arácnidas y decide utilizarlas para proteger a los demás.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "estudiante",
      "fuerza_sobrehumana",
      "heroe",
      "pobre",
      "superheroe",
      "tecnologia"
    ],
    "medios": [
      "comic",
      "pelicula",
      "serie"
    ],
    "poderes": true,
    "magia": false,
    "universo": "marvel",
    "mascara": true,
    "capa": false,
    "marvel": true,
    "dc": false
  },
  {
    "nombre": "Wonder Woman",
    "alias": [
      "mujer maravilla",
      "diana prince"
    ],
    "descripcion": "Guerrera amazona y superheroína de DC Comics, conocida por su fuerza extraordinaria y su defensa de la humanidad.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "amazona"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "alto",
      "fuerza_sobrehumana",
      "guerrero",
      "heroe",
      "heroina",
      "inmortal",
      "lucho_libertad",
      "princesa",
      "superheroe",
      "usa_armas",
      "usa_espada",
      "vuela"
    ],
    "medios": [
      "comic",
      "pelicula",
      "serie"
    ],
    "poderes": true,
    "magia": false,
    "universo": "dc",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": true
  },
  {
    "nombre": "Harry Potter",
    "alias": [
      "harry"
    ],
    "descripcion": "Joven mago protagonista de la saga Harry Potter, estudiante de Hogwarts y enemigo de Lord Voldemort.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "britanico",
      "ingles"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "estudiante",
      "gafas",
      "heroe",
      "lucho_libertad",
      "mago",
      "rico",
      "vuela"
    ],
    "medios": [
      "libro",
      "pelicula"
    ],
    "poderes": true,
    "magia": true,
    "universo": "harry potter",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Darth Vader",
    "alias": [
      "vader",
      "anakin skywalker",
      "anakin"
    ],
    "descripcion": "Figura central de Star Wars, antiguo Jedi convertido en uno de los ejecutores más temidos del Imperio Galáctico.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "espacio",
    "nacionalidades": [],
    "idiomas": [],
    "etiquetas": [
      "alto",
      "conquistador",
      "fuerza_sobrehumana",
      "guerrero",
      "jedi",
      "tecnologia",
      "usa_armas",
      "usa_espada",
      "villano"
    ],
    "medios": [
      "pelicula",
      "serie"
    ],
    "poderes": true,
    "magia": false,
    "universo": "star wars",
    "mascara": true,
    "capa": true,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Gandalf",
    "alias": [
      "gandalf el gris",
      "gandalf el blanco"
    ],
    "descripcion": "Poderoso mago de la Tierra Media creado por J. R. R. Tolkien y pieza clave en la lucha contra Sauron.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "tierra media",
    "nacionalidades": [],
    "idiomas": [],
    "etiquetas": [
      "alto",
      "heroe",
      "inmortal",
      "lucho_libertad",
      "mago",
      "medieval",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "libro",
      "pelicula"
    ],
    "poderes": true,
    "magia": true,
    "universo": "tolkien",
    "mascara": false,
    "capa": true,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Sherlock Holmes",
    "alias": [
      "sherlock",
      "holmes"
    ],
    "descripcion": "Detective ficticio creado por Arthur Conan Doyle, célebre por su capacidad de observación, lógica y deducción.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "britanico",
      "ingles"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "alto",
      "detective",
      "heroe",
      "pacifista"
    ],
    "medios": [
      "libro",
      "pelicula",
      "serie"
    ],
    "poderes": false,
    "magia": false,
    "universo": "sherlock holmes",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Elsa",
    "alias": [
      "elsa de frozen"
    ],
    "descripcion": "Reina ficticia de Arendelle en Frozen, capaz de crear y controlar hielo y nieve.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [],
    "idiomas": [],
    "etiquetas": [
      "reina",
      "princesa"
    ],
    "medios": [
      "pelicula",
      "animacion"
    ],
    "poderes": true,
    "magia": true,
    "universo": "disney",
    "mascara": false,
    "capa": true,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Superman",
    "alias": [
      "clark kent",
      "kal el"
    ],
    "descripcion": "Superhéroe de DC Comics nacido en Krypton, conocido por su fuerza, vuelo, velocidad y visión de calor.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "superheroe",
      "heroe",
      "periodista"
    ],
    "medios": [
      "comic",
      "pelicula",
      "serie"
    ],
    "poderes": true,
    "magia": false,
    "universo": "dc",
    "mascara": false,
    "capa": true,
    "marvel": false,
    "dc": true
  },
  {
    "nombre": "Hermione Granger",
    "alias": [
      "hermione"
    ],
    "descripcion": "Bruja ficticia de la saga Harry Potter, destacada por su inteligencia, disciplina y dominio de la magia.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "britanico",
      "ingles"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "bruja",
      "estudiante",
      "heroe",
      "lucho_libertad",
      "mago"
    ],
    "medios": [
      "libro",
      "pelicula"
    ],
    "poderes": true,
    "magia": true,
    "universo": "harry potter",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Gandhi",
    "alias": [
      "gandhi"
    ],
    "descripcion": "Caminó al mar por un puñado de sal prohibida. Sin disparar un arma liberó a millones.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "asia",
    "nacionalidades": [
      "indio"
    ],
    "idiomas": [],
    "etiquetas": [
      "bajo",
      "gafas",
      "heroe",
      "lider",
      "lucho_libertad",
      "pacifista",
      "pobre",
      "politico"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Juana de Arco",
    "alias": [
      "arco",
      "juana",
      "juana de arco"
    ],
    "descripcion": "Voces celestiales la guiaron a vestir armadura. Las llamas la consumieron pero su fe quedó.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "frances"
    ],
    "idiomas": [
      "frances"
    ],
    "etiquetas": [
      "guerrero",
      "heroe",
      "lucho_libertad",
      "medieval",
      "pobre",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Pablo Picasso",
    "alias": [
      "pablo",
      "pablo picasso",
      "picasso"
    ],
    "descripcion": "Rompió la realidad en mil fragmentos geométricos. El horror de la guerra grita en su lienzo.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "espanol"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "artista",
      "bajo",
      "rico"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "George Washington",
    "alias": [
      "george",
      "george washington",
      "washington"
    ],
    "descripcion": "Primer presidente de una nación naciente. Cruzó el río congelado en Navidad para atacar.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "alto",
      "gobernante",
      "heroe",
      "lucho_libertad",
      "militar",
      "politico",
      "presidente",
      "rico",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Martin Luther King Jr.",
    "alias": [
      "jr.",
      "martin",
      "martin luther king",
      "martin luther king jr.",
      "mlk"
    ],
    "descripcion": "Tuvo un sueño de igualdad que cambió una nación. Su voz pacífica resonó más fuerte que la violencia.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "heroe",
      "lider",
      "lucho_libertad",
      "pacifista",
      "politico",
      "premio_nobel",
      "premios"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Simón Bolívar",
    "alias": [
      "bolivar",
      "simon",
      "simon bolivar"
    ],
    "descripcion": "Liberó cinco naciones del yugo colonial. El Libertador de América murió traicionado.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "venezolano"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "gobernante",
      "heroe",
      "lucho_libertad",
      "militar",
      "politico",
      "rico",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Confucio",
    "alias": [
      "confucio"
    ],
    "descripcion": "Sus enseñanzas moldearon China por milenios. El camino del medio guía a sus seguidores.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "asia",
    "nacionalidades": [
      "chino"
    ],
    "idiomas": [],
    "etiquetas": [
      "antiguedad",
      "filosofo",
      "pacifista"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Don Quijote",
    "alias": [
      "alonso quijano",
      "don quijote",
      "quijote"
    ],
    "descripcion": "Confundió molinos de viento con gigantes. Su locura era más noble que la cordura.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "espanol"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "alto",
      "guerrero",
      "heroe",
      "pobre",
      "renacimiento",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "libro"
    ],
    "poderes": false,
    "magia": false,
    "universo": "literatura",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Mulan",
    "alias": [
      "mulan"
    ],
    "descripcion": "Cortó su cabello y vistió armadura por su padre. Nadie supo que el soldado era una mujer.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "asia",
    "nacionalidades": [
      "chino"
    ],
    "idiomas": [],
    "etiquetas": [
      "antiguedad",
      "guerrero",
      "heroe",
      "lucho_libertad",
      "pobre",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "leyenda",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Legolas",
    "alias": [
      "legolas"
    ],
    "descripcion": "Sus flechas nunca fallan el objetivo. Un elfo inmortal de bosque profundo.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "tierra media",
    "nacionalidades": [
      "tierra media"
    ],
    "idiomas": [],
    "etiquetas": [
      "alto",
      "arquero",
      "elfo",
      "heroe",
      "inmortal",
      "lucho_libertad",
      "medieval",
      "tiene_arco",
      "usa_armas"
    ],
    "medios": [
      "libro",
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "tolkien",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Robin Hood",
    "alias": [
      "hood",
      "robin",
      "robin hood"
    ],
    "descripcion": "Robaba a los ricos para dar a los pobres. Su arco y flecha eran legendarios.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "ingles",
      "britanico"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "arquero",
      "heroe",
      "lucho_libertad",
      "medieval",
      "pobre",
      "tiene_arco",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "leyenda",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Katniss Everdeen",
    "alias": [
      "everdeen",
      "katniss",
      "katniss everdeen"
    ],
    "descripcion": "El sinsajo que encendió la revolución. Su arco era su única esperanza de supervivencia.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "arquero",
      "guerrero",
      "heroe",
      "lucho_libertad",
      "pobre",
      "tiene_arco",
      "usa_armas"
    ],
    "medios": [
      "libro",
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "los juegos del hambre",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Hawkeye",
    "alias": [
      "hawkeye"
    ],
    "descripcion": "Sus flechas siempre dan en el blanco. Un humano entre dioses con solo su arco.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "arquero",
      "heroe",
      "superheroe",
      "tecnologia",
      "tiene_arco",
      "usa_armas"
    ],
    "medios": [
      "comic",
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "marvel",
    "mascara": false,
    "capa": false,
    "marvel": true,
    "dc": false
  },
  {
    "nombre": "Luke Skywalker",
    "alias": [
      "luke",
      "luke skywalker",
      "skywalker"
    ],
    "descripcion": "Un granjero destinado a salvar la galaxia. La Fuerza es fuerte en su familia.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "espacio",
    "nacionalidades": [
      "espacial"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "heroe",
      "jedi",
      "lucho_libertad",
      "pobre",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "pelicula",
      "serie"
    ],
    "poderes": true,
    "magia": false,
    "universo": "star wars",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Leia Organa",
    "alias": [
      "leia",
      "leia organa",
      "organa",
      "princesa leia"
    ],
    "descripcion": "Una princesa que prefirió luchar por la libertad. Lideró la Rebelión contra el Imperio.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "espacio",
    "nacionalidades": [
      "espacial"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "gobernante",
      "heroe",
      "lucho_libertad",
      "politico",
      "princesa",
      "rico",
      "tecnologia",
      "usa_armas",
      "lider",
      "jedi"
    ],
    "medios": [
      "pelicula",
      "serie",
      "television",
      "videojuego"
    ],
    "poderes": true,
    "magia": false,
    "universo": "star wars",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Yoda",
    "animal": false,
    "alias": [
      "yoda"
    ],
    "descripcion": "900 años de sabiduría en un cuerpo diminuto. La Fuerza fluye a través de él.",
    "tipo": "ficticio",
    "anime": false,
    "escritor": false,
    "poderoso": true,
    "origen_terrestre": false,
    "combate": true,
    "genero": "hombre",
    "vivo": false,
    "humano": false,
    "famoso": true,
    "region": "espacio",
    "nacionalidades": [
      "espacial"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "bajo",
      "combate",
      "jedi",
      "pacifista",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "pelicula",
      "serie"
    ],
    "poderes": true,
    "magia": false,
    "universo": "star wars",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Aragorn",
    "alias": [
      "aragorn"
    ],
    "descripcion": "Un rey que prefería las sombras hasta que el deber llamó. El heredero de Isildur regresó.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "tierra media",
    "nacionalidades": [
      "tierra media"
    ],
    "idiomas": [],
    "etiquetas": [
      "alto",
      "gobernante",
      "heroe",
      "lucho_libertad",
      "medieval",
      "rey",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "libro",
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "tolkien",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Frodo Baggins",
    "alias": [
      "baggins",
      "frodo",
      "frodo baggins",
      "frodo bolsón",
      "frodo bolson"
    ],
    "descripcion": "Un pequeño hobbit con una carga terrible. El Único Anillo debía ser destruido.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "tierra media",
    "nacionalidades": [
      "tierra media"
    ],
    "idiomas": [],
    "etiquetas": [
      "bajo",
      "heroe",
      "hobbit",
      "lucho_libertad",
      "medieval",
      "anillo",
      "senor_de_los_anillos"
    ],
    "medios": [
      "libro",
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "tolkien",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Sauron",
    "alias": [
      "sauron"
    ],
    "descripcion": "Un ojo ardiente que todo lo ve. Forjó el Único Anillo para dominar a todos.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": false,
    "humano": false,
    "famoso": true,
    "region": "tierra media",
    "nacionalidades": [
      "tierra media"
    ],
    "idiomas": [],
    "etiquetas": [
      "alto",
      "conquistador",
      "fuerza_sobrehumana",
      "gobernante",
      "inmortal",
      "medieval",
      "usa_armas",
      "villano"
    ],
    "medios": [
      "libro",
      "pelicula"
    ],
    "poderes": true,
    "magia": true,
    "universo": "tolkien",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Aristóteles",
    "alias": [
      "aristoteles"
    ],
    "descripcion": "Maestro de Alejandro Magno. Fundó el Liceo y sistematizó el conocimiento.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "griego"
    ],
    "idiomas": [],
    "etiquetas": [
      "antiguedad",
      "filosofo",
      "pacifista"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Julio César",
    "alias": [
      "cesar",
      "julio",
      "julio cesar"
    ],
    "descripcion": "Veni, vidi, vici. Asesinado en los idus de marzo.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "romano"
    ],
    "idiomas": [],
    "etiquetas": [
      "antiguedad",
      "conquistador",
      "emperador",
      "gobernante",
      "militar",
      "politico",
      "rico",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Sócrates",
    "alias": [
      "socrates"
    ],
    "descripcion": "Solo sé que no sé nada. Condenado a beber cicuta por corromper a la juventud.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "griego"
    ],
    "idiomas": [],
    "etiquetas": [
      "antiguedad",
      "filosofo",
      "pacifista",
      "pobre"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Maquiavelo",
    "alias": [
      "maquiavelo"
    ],
    "descripcion": "El fin justifica los medios. Su obra maestra aconseja cómo mantener el poder.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "italiano"
    ],
    "idiomas": [
      "italiano"
    ],
    "etiquetas": [
      "filosofo",
      "politico",
      "renacimiento",
      "escritor"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Miguel de Cervantes",
    "alias": [
      "cervantes",
      "miguel",
      "miguel de cervantes"
    ],
    "descripcion": "Creó al caballero más famoso de la literatura. Perdió una mano en la batalla de Lepanto.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "espanol"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "autor",
      "escritor",
      "pobre",
      "renacimiento"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Alejandro Magno",
    "alias": [
      "alejandro",
      "alejandro magno",
      "magno"
    ],
    "descripcion": "Conquistó el mundo conocido antes de los 33. Nunca perdió una batalla.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "macedonio"
    ],
    "idiomas": [],
    "etiquetas": [
      "antiguedad",
      "conquistador",
      "gobernante",
      "militar",
      "politico",
      "rico",
      "usa_armas",
      "usa_espada"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Nelson Mandela",
    "alias": [
      "mandela",
      "nelson",
      "nelson mandela"
    ],
    "descripcion": "27 años en prisión no quebraron su espíritu. Primer presidente negro de Sudáfrica.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "africa",
    "nacionalidades": [
      "sudafricano"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "alto",
      "gobernante",
      "heroe",
      "lider",
      "lucho_libertad",
      "pacifista",
      "pobre",
      "politico",
      "premio_nobel",
      "premios",
      "presidente"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Steve Jobs",
    "alias": [
      "jobs",
      "steve",
      "steve jobs"
    ],
    "descripcion": "Cambió la forma en que interactuamos con la tecnología. Think different.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "empresario",
      "inventor",
      "rico",
      "tecnologia"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Elon Musk",
    "alias": [
      "elon",
      "elon musk",
      "musk"
    ],
    "descripcion": "Quiere colonizar Marte. El hombre más rico del mundo.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "africa",
    "nacionalidades": [
      "sudafricano"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "empresario",
      "inventor",
      "rico",
      "tecnologia"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Iron Man",
    "alias": [
      "iron",
      "iron man",
      "man",
      "tony stark"
    ],
    "descripcion": "Un genio, millonario, playboy, filántropo. Construyó su armadura en una cueva con chatarra.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "fuerza_sobrehumana",
      "genio",
      "heroe",
      "inventor",
      "millonario",
      "rico",
      "superheroe",
      "tecnologia",
      "usa_armas",
      "vuela"
    ],
    "medios": [
      "comic",
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "marvel",
    "mascara": false,
    "capa": false,
    "marvel": true,
    "dc": false
  },
  {
    "nombre": "Captain America",
    "alias": [
      "america",
      "capitan america",
      "captain",
      "captain america"
    ],
    "descripcion": "Un soldado congelado por décadas. El primer vengador.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "alto",
      "fuerza_sobrehumana",
      "heroe",
      "lucho_libertad",
      "pobre",
      "superheroe",
      "usa_armas"
    ],
    "medios": [
      "comic",
      "pelicula"
    ],
    "poderes": true,
    "magia": false,
    "universo": "marvel",
    "mascara": false,
    "capa": false,
    "marvel": true,
    "dc": false
  },
  {
    "nombre": "Thor",
    "alias": [
      "thor"
    ],
    "descripcion": "El dios del trueno empuña su martillo. De Asgard a la Tierra.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "espacio",
    "nacionalidades": [
      "asgardiano"
    ],
    "idiomas": [],
    "etiquetas": [
      "alto",
      "dios",
      "fuerza_sobrehumana",
      "gobernante",
      "heroe",
      "inmortal",
      "rico",
      "usa_armas",
      "vuela"
    ],
    "medios": [
      "comic",
      "pelicula"
    ],
    "poderes": true,
    "magia": false,
    "universo": "marvel",
    "mascara": false,
    "capa": true,
    "marvel": true,
    "dc": false
  },
  {
    "nombre": "Black Widow",
    "alias": [
      "black",
      "black widow",
      "viuda negra",
      "widow"
    ],
    "descripcion": "Una asesina entrenada desde niña. Su pasado rojo la persigue.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "ruso"
    ],
    "idiomas": [],
    "etiquetas": [
      "espia",
      "heroe",
      "pobre",
      "tecnologia",
      "usa_armas"
    ],
    "medios": [
      "comic",
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "marvel",
    "mascara": false,
    "capa": false,
    "marvel": true,
    "dc": false
  },
  {
    "nombre": "Hulk",
    "alias": [
      "bruce banner",
      "hulk"
    ],
    "descripcion": "No te enojaría si estuvieras con él. Mientras más enojado, más fuerte.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "ingles"
    ],
    "etiquetas": [
      "alto",
      "fuerza_sobrehumana",
      "heroe",
      "pobre",
      "superheroe"
    ],
    "medios": [
      "comic",
      "pelicula"
    ],
    "poderes": true,
    "magia": false,
    "universo": "marvel",
    "mascara": false,
    "capa": false,
    "marvel": true,
    "dc": false
  },
  {
    "nombre": "Charles Darwin",
    "alias": [
      "charles darwin"
    ],
    "descripcion": "Naturalista que formuló la teoría de la evolución por selección natural.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "britanico"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "biologo",
      "evolucion",
      "cientifico"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Amelia Earhart",
    "alias": [
      "amelia earhart"
    ],
    "descripcion": "Aviadora pionera que desapareció durante un vuelo.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "aviadora",
      "pionera",
      "historia"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Pelé",
    "alias": [
      "pelé"
    ],
    "descripcion": "Futbolista brasileño considerado uno de los mejores de la historia.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "brasileno"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "futbol",
      "deporte",
      "brasil"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Cristiano Ronaldo",
    "alias": [
      "cristiano ronaldo"
    ],
    "descripcion": "Futbolista portugués reconocido mundialmente.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "portugues"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "futbol",
      "deporte",
      "portugal"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Serena Williams",
    "alias": [
      "serena williams"
    ],
    "descripcion": "Tenista estadounidense con numerosos títulos de Grand Slam.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "tenis",
      "deporte",
      "campeona"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Michael Jordan",
    "alias": [
      "michael jordan"
    ],
    "descripcion": "Exjugador de baloncesto considerado una leyenda de la NBA.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "basquetbol",
      "deporte",
      "nba"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Taylor Swift",
    "alias": [
      "taylor swift"
    ],
    "descripcion": "Cantautora estadounidense de pop y country.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "musica",
      "cantante",
      "compositora"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Freddie Mercury",
    "alias": [
      "freddie mercury"
    ],
    "descripcion": "Cantante principal de la banda Queen.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "britanico"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "musica",
      "cantante",
      "queen"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Bob Marley",
    "alias": [
      "bob marley"
    ],
    "descripcion": "Músico jamaicano, símbolo mundial del reggae.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "jamaicano"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "musica",
      "reggae",
      "cantante"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Shakira",
    "alias": [
      "shakira"
    ],
    "descripcion": "Cantante colombiana conocida por su voz y baile.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "colombiana"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "musica",
      "cantante",
      "baile"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Beyoncé",
    "alias": [
      "beyoncé"
    ],
    "descripcion": "Cantante y artista estadounidense.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "musica",
      "cantante",
      "baile"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Keanu Reeves",
    "alias": [
      "keanu reeves"
    ],
    "descripcion": "Actor conocido por Matrix y John Wick.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "canadiense"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "actor",
      "cine",
      "accion"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Jackie Chan",
    "alias": [
      "jackie chan"
    ],
    "descripcion": "Actor y artista marcial famoso por sus acrobacias.",
    "tipo": "real",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "asia",
    "nacionalidades": [
      "hongkones"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "actor",
      "artes_marciales",
      "comedia"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Audrey Hepburn",
    "alias": [
      "audrey hepburn"
    ],
    "descripcion": "Actriz conocida por Desayuno en Tiffany’s.",
    "tipo": "real",
    "genero": "mujer",
    "vivo": false,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "britanica"
    ],
    "idiomas": [
      "espanol",
      "ingles"
    ],
    "etiquetas": [
      "actriz",
      "cine",
      "moda"
    ],
    "medios": [
      "historia"
    ],
    "poderes": false,
    "magia": false,
    "universo": "real",
    "mascara": false,
    "capa": false
  },
  {
    "nombre": "Voldemort",
    "alias": [
      "voldemort"
    ],
    "descripcion": "Principal antagonista de Harry Potter.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "britanico"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "villano",
      "magia",
      "harry_potter"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": true,
    "magia": true,
    "universo": "harry potter",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Wednesday Addams",
    "alias": [
      "wednesday addams"
    ],
    "descripcion": "Joven de humor oscuro de la familia Addams.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "estadounidense"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "oscura",
      "familia_addams",
      "misterio"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "familia addams",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Drácula",
    "alias": [
      "drácula"
    ],
    "descripcion": "Conde vampiro creado por Bram Stoker.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "rumano"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "vampiro",
      "terror",
      "colmillos"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "literatura de terror",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Frankenstein",
    "alias": [
      "frankenstein"
    ],
    "descripcion": "Nombre asociado popularmente a la criatura de la novela de Mary Shelley.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "suizo"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "monstruo",
      "terror",
      "literatura"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "literatura de terror",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Pikachu",
    "animal": true, "origen_terrestre": false, "artista": false, "combate": true,
    "alias": [
      "pikachu"
    ],
    "descripcion": "Pokémon amarillo que puede lanzar descargas eléctricas.",
    "tipo": "ficticio",
    "genero": "otro",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "asia",
    "nacionalidades": [
      "pokemon"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "pokemon",
      "electrico",
      "amarillo"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": true,
    "magia": false,
    "universo": "pokemon",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false,
    "anime": true
  },
  {
    "nombre": "Mario",
    "alias": [
      "mario"
    ],
    "descripcion": "Héroe de videojuegos de Nintendo que suele rescatar a Peach.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "italiano"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "videojuego",
      "nintendo",
      "fontanero"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "super mario",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Sonic",
    "alias": [
      "sonic"
    ],
    "descripcion": "Erizo azul de videojuegos famoso por su velocidad.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "mobius"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "videojuego",
      "erizo",
      "velocidad"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "sonic the hedgehog",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Lara Croft",
    "alias": [
      "lara croft"
    ],
    "descripcion": "Arqueóloga y protagonista de Tomb Raider.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "britanica"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "videojuego",
      "aventurera",
      "arqueologia"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "tomb raider",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Pac-Man",
    "alias": [
      "pac-man"
    ],
    "descripcion": "Personaje amarillo que come puntos y escapa de fantasmas.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "asia",
    "nacionalidades": [
      "videojuego"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "videojuego",
      "laberinto",
      "arcade"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "pac-man",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Shrek",
    "alias": [
      "shrek"
    ],
    "descripcion": "Ogro verde protagonista de una saga animada.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "pantano"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "ogro",
      "comedia",
      "pantano"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "shrek",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Moana",
    "alias": [
      "moana"
    ],
    "descripcion": "Joven navegante que emprende una misión por el océano.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "oceania",
    "nacionalidades": [
      "polinesia"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "disney",
      "navegacion",
      "aventura"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "disney",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Buzz Lightyear",
    "alias": [
      "buzz lightyear"
    ],
    "descripcion": "Juguete astronauta de Toy Story.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "espacio",
    "nacionalidades": [
      "espacio"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "juguete",
      "astronauta",
      "pixar"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "toy story",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Optimus Prime",
    "alias": [
      "optimus prime"
    ],
    "descripcion": "Líder de los Autobots en Transformers.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "espacio",
    "nacionalidades": [
      "cybertron"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "robot",
      "transformers",
      "lider"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "transformers",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Winnie the Pooh",
    "alias": [
      "winnie the pooh"
    ],
    "descripcion": "Oso de ficción al que le encanta la miel.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "bosque"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "oso",
      "miel",
      "disney"
    ],
    "medios": [
      "pelicula",
      "television",
      "videojuego"
    ],
    "poderes": false,
    "magia": false,
    "universo": "disney",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Black Panther",
    "alias": [
      "black panther"
    ],
    "descripcion": "Rey y protector de Wakanda.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "africa",
    "nacionalidades": [
      "wakandiano"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "superheroe",
      "marvel",
      "wakanda"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": true,
    "magia": false,
    "universo": "marvel",
    "mascara": false,
    "capa": false,
    "marvel": true,
    "dc": false
  },
  {
    "nombre": "Deadpool",
    "alias": [
      "deadpool"
    ],
    "descripcion": "Antihéroe de humor irreverente que suele romper la cuarta pared.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "canadiense"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "superheroe",
      "marvel",
      "humor"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": true,
    "magia": false,
    "universo": "marvel",
    "mascara": false,
    "capa": false,
    "marvel": true,
    "dc": false
  },
  {
    "nombre": "Ariel",
    "alias": [
      "ariel"
    ],
    "descripcion": "Sirena de Disney que sueña con vivir en tierra firme.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "oceania",
    "nacionalidades": [
      "atlantica"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "sirena",
      "disney",
      "mar"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": false,
    "magia": false,
    "universo": "disney",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Cenicienta",
    "alias": [
      "cenicienta"
    ],
    "descripcion": "Joven de cuento que asiste al baile con ayuda mágica.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "europea"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "disney",
      "princesa",
      "cuento"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": false,
    "magia": false,
    "universo": "disney",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Peter Pan",
    "alias": [
      "peter pan"
    ],
    "descripcion": "Niño que no quiere crecer y vive en Nunca Jamás.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "nuncajamas"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "vuelo",
      "aventura",
      "cuento"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": true,
    "magia": false,
    "universo": "peter pan",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Asterix",
    "alias": [
      "asterix"
    ],
    "descripcion": "Pequeño guerrero galo que obtiene fuerza de una poción.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "galo"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "comic",
      "galia",
      "pocion"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": true,
    "magia": false,
    "universo": "asterix",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Tintín",
    "alias": [
      "tintín"
    ],
    "descripcion": "Joven reportero protagonista de cómics de aventuras.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "belga"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "comic",
      "periodista",
      "aventura"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": false,
    "magia": false,
    "universo": "tintin",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Mafalda",
    "alias": [
      "mafalda"
    ],
    "descripcion": "Niña argentina de historietas conocida por sus reflexiones.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "argentina"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "comic",
      "argentina",
      "humor"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": false,
    "magia": false,
    "universo": "mafalda",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Dora la Exploradora",
    "alias": [
      "dora la exploradora"
    ],
    "descripcion": "Niña exploradora de una serie infantil interactiva.",
    "tipo": "ficticio",
    "genero": "mujer",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "latinoamericana"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "animacion",
      "aventura",
      "mapa"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": false,
    "magia": false,
    "universo": "dora la exploradora",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Gru",
    "alias": [
      "gru"
    ],
    "descripcion": "Exvillano protagonista de Mi villano favorito.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "europa",
    "nacionalidades": [
      "desconocido"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "villano",
      "minions",
      "animacion"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": false,
    "magia": false,
    "universo": "mi villano favorito",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Wall-E",
    "alias": [
      "wall-e"
    ],
    "descripcion": "Pequeño robot compactador de basura que explora el espacio.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "america",
    "nacionalidades": [
      "tierra"
    ],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "robot",
      "pixar",
      "espacio"
    ],
    "medios": [
      "comic",
      "pelicula",
      "television"
    ],
    "poderes": false,
    "magia": false,
    "universo": "wall-e",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Goku",
    "hijos": true, "animal": false, "artista": false,
    "alias": [
      "goku"
    ],
    "descripcion": "Guerrero de Dragon Ball que protege la Tierra.",
    "tipo": "ficticio",
    "universo": "dragon ball",
    "origen_terrestre": false,
    "combate": true,
    "poderoso": true,
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": null,
    "nacionalidades": [],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "anime",
      "artes_marciales",
      "energia"
    ],
    "medios": [
      "television",
      "pelicula"
    ],
    "poderes": true,
    "magia": false,
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false,
    "anime": true
  },
  {
    "nombre": "Naruto Uzumaki",
    "alias": [
      "naruto uzumaki"
    ],
    "descripcion": "Ninja que sueña con convertirse en Hokage.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "asia",
    "nacionalidades": [],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "anime",
      "ninja",
      "aldea"
    ],
    "medios": [
      "television",
      "pelicula"
    ],
    "poderes": true,
    "magia": false,
    "universo": "naruto",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false,
    "anime": true
  },
  {
    "nombre": "Totoro",
    "alias": [
      "totoro"
    ],
    "descripcion": "Criatura del bosque de Mi vecino Totoro.",
    "tipo": "ficticio",
    "genero": "otro",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": "asia",
    "nacionalidades": [],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "animacion",
      "espiritu",
      "ghibli"
    ],
    "medios": [
      "television",
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "studio ghibli",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Popeye",
    "alias": [
      "popeye"
    ],
    "descripcion": "Marinero de dibujos animados que obtiene fuerza con espinacas.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "asia",
    "nacionalidades": [],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "marinero",
      "espinaca",
      "comic"
    ],
    "medios": [
      "television",
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "popeye",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Garfield",
    "alias": [
      "garfield"
    ],
    "descripcion": "Gato naranja perezoso al que le encanta la lasaña.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": true,
    "famoso": true,
    "region": "asia",
    "nacionalidades": [],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "gato",
      "comic",
      "lasaña"
    ],
    "medios": [
      "television",
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "garfield",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  },
  {
    "nombre": "Scooby-Doo",
    "alias": [
      "scooby-doo"
    ],
    "descripcion": "Perro que resuelve misterios junto a sus amigos.",
    "tipo": "ficticio",
    "genero": "hombre",
    "vivo": true,
    "humano": false,
    "famoso": true,
    "region": null,
    "nacionalidades": [],
    "idiomas": [
      "espanol"
    ],
    "etiquetas": [
      "perro",
      "misterio",
      "animacion"
    ],
    "medios": [
      "television",
      "pelicula"
    ],
    "poderes": false,
    "magia": false,
    "universo": "scooby-doo",
    "mascara": false,
    "capa": false,
    "marvel": false,
    "dc": false
  }
];
