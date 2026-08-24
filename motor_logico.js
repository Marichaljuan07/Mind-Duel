// MIND DUEL REMASTER - motor_logico.js
// Base determinista: derivada de la v0.2.2 que pasó Nivel 3.
// OperaAria nunca decide hechos: solo puede mapear lenguaje -> uno de estos conceptos.

function evaluarPregunta(pregunta, personaje) {
    const texto = normalizar(pregunta);

    // ==================================================
    // TIPO: REAL / FICTICIO
    // ==================================================

    if (contiene(texto, ["ficticio", "ficcion", "inventado", "imaginario"])) {
        return personaje.tipo === "ficticio";
    }

    if (contiene(texto, ["es real", "persona real", "existio de verdad", "existio realmente", "existio"])) {
        return personaje.tipo === "real";
    }

    // ==================================================
    // GÉNERO
    // Acepta frases como "¿tu personaje es una mujer?"
    // ==================================================

    if (contiene(texto, ["mujer", "femenin", "chica", "dama"])) {
        return personaje.genero === "mujer";
    }

    if (contiene(texto, ["hombre", "masculin", "varon", "chico"])) {
        return personaje.genero === "hombre";
    }

    // ==================================================
    // VIDA
    // ==================================================

    if (contiene(texto, [
        "esta viva", "esta vivo", "sigue viva", "sigue vivo",
        "vive actualmente", "aun vive", "todavia vive",
        "con vida", "sigue con vida"
    ])) {
        return personaje.vivo;
    }

    if (contiene(texto, ["esta muerta", "esta muerto", "murio", "fallecio", "fallecido", "fallecida"])) {
        return !personaje.vivo;
    }

    // ==================================================
    // HUMANO / PERSONA
    // ==================================================

    if (contiene(texto, [
        "es humano", "es humana", "es una persona", "es persona",
        "ser humano", "persona humana", "alguien humano", "alguien humana"
    ])) {
        return personaje.humano;
    }

    // ==================================================
    // IDIOMA
    // Se evalúa antes que nacionalidad para que
    // "¿habla inglés?" no se interprete como "¿es inglés?"
    // ==================================================

    const preguntaIdioma = contiene(texto, ["habla", "idioma", "lengua"]);

    if (preguntaIdioma) {
        const idiomas = [
            ["ingles", "ingles"],
            ["aleman", "aleman"],
            ["frances", "frances"],
            ["italian", "italiano"],
            ["espanol", "espanol"],
            ["castellano", "espanol"],
            ["polac", "polaco"],
            ["serbi", "serbio"]
        ];

        for (const [palabra, idioma] of idiomas) {
            if (contiene(texto, [palabra])) {
                if (!Array.isArray(personaje.idiomas) || personaje.idiomas.length === 0) return null;
                return personaje.idiomas.includes(idioma);
            }
        }
    }

    // ==================================================
    // REGIÓN
    // ==================================================

    const regiones = [
        ["europa", "europa"],
        ["europe", "europa"],
        ["africa", "africa"],
        ["african", "africa"],
        ["america", "america"],
        ["american", "america"],
        ["espacio", "espacio"],
        ["otro planeta", "espacio"],
        ["fuera de la tierra", "espacio"],
        ["tierra media", "tierra media"]
    ];

    for (const [palabra, region] of regiones) {
        if (
            contiene(texto, [palabra]) &&
            !contiene(texto, ["estadounid", "norteamerican"])
        ) {
            return personaje.region === region;
        }
    }

    // ==================================================
    // NACIONALIDAD
    // ==================================================

    const nacionalidades = [
        ["aleman", "aleman"],
        ["alemania", "aleman"],
        ["frances", "frances"],
        ["francia", "frances"],
        ["italian", "italiano"],
        ["italia", "italiano"],
        ["egipci", "egipcio"],
        ["egipto", "egipcio"],
        ["britanic", "britanico"],
        ["reino unido", "britanico"],
        ["ingles", "ingles"],
        ["inglaterra", "ingles"],
        ["polac", "polaco"],
        ["polonia", "polaco"],
        ["serbi", "serbio"],
        ["serbia", "serbio"],
        ["estadounid", "estadounidense"],
        ["estados unidos", "estadounidense"],
        ["norteamerican", "estadounidense"],
        ["mexican", "mexicano"],
        ["mexico", "mexicano"],
        ["argentin", "argentino"],
        ["argentina", "argentino"],
        ["amazon", "amazona"]
    ];

    for (const [palabra, nacionalidad] of nacionalidades) {
        if (contiene(texto, [palabra])) {
            return personaje.nacionalidades.includes(nacionalidad);
        }
    }

    // ==================================================
    // PROFESIÓN / ROL
    // Usamos raíces para aceptar masculino/femenino y
    // pequeñas variaciones: matemática/matemático, etc.
    // ==================================================

    // Si el usuario claramente intenta decir "superhéroe" dentro de una frase
    // de cómic pero escribe mal esa palabra, no dejamos que la raíz genérica
    // "héroe" convierta la consulta en otra cosa. Mejor NO LO SÉ.
    if (
        contiene(texto, ["heroe de comic tipo"]) &&
        !contiene(texto, ["superheroe", "superheroina"])
    ) {
        return null;
    }

    const etiquetas = [
        ["cientific", "cientifico"],
        ["dedico a la ciencia", "cientifico"],
        ["dedica a la ciencia", "cientifico"],
        ["profesion fue cientifica", "cientifico"],
        ["persona cientifica", "cientifico"],
        ["fisic", "fisico"],
        ["quimic", "quimico"],
        ["matematic", "matematico"],
        ["programador", "programador"],
        ["programadora", "programador"],
        ["programacion", "programador"],
        ["inventor", "inventor"],
        ["inventora", "inventor"],
        ["creaba inventos", "inventor"],
        ["crea inventos", "inventor"],
        ["ingenier", "ingeniero"],
        ["artist", "artista"],
        ["dedico al arte", "artista"],
        ["dedica al arte", "artista"],
        ["pintor", "pintor"],
        ["pintora", "pintor"],
        ["pintura", "pintor"],
        ["pintar", "pintor"],
        ["escritor", "escritor"],
        ["escritora", "escritor"],
        ["escritura", "escritor"],
        ["dedico a escribir", "escritor"],
        ["dedica a escribir", "escritor"],
        ["profesion era escribir", "escritor"],
        ["autor", "autor"],
        ["poeta", "poeta"],
        ["poesia", "poeta"],
        ["dramaturg", "dramaturgo"],
        ["reina", "reina"],
        ["princes", "princesa"],
        ["emperador", "emperador"],
        ["gobernante", "gobernante"],
        ["politic", "politico"],
        ["militar", "militar"],
        ["ejercito", "militar"],
        ["detective", "detective"],
        ["resolver crimen", "detective"],
        ["resolver crimenes", "detective"],
        ["resuelve crimen", "detective"],
        ["superheroe", "superheroe"],
        ["superheroina", "superheroe"],
        ["identidad de superheroe", "superheroe"],
        ["heroina", "heroina"],
        ["heroe", "heroe"],
        ["villano", "villano"],
        ["villana", "villano"],
        ["malo", "villano"],
        ["malvado", "villano"],
        ["malvada", "villano"],
        ["guerrer", "guerrero"],
        ["bruja", "bruja"],
        ["mago", "mago"],
        ["deportista", "deportista"],
        ["futbol", "futbolista"],
        ["estudiante", "estudiante"],
        ["estudiando", "estudiante"],
        ["personaje que estudia", "estudiante"],
        ["periodista", "periodista"],
        ["profesor", "profesor"],
        ["millonario", "millonario"],
        ["jedi", "jedi"]
    ];

    for (const [palabra, etiqueta] of etiquetas) {
        if (contiene(texto, [palabra])) {
            return personaje.etiquetas.includes(etiqueta);
        }
    }

    // ==================================================
    // PODERES / MAGIA / OBJETOS
    // ==================================================

    // Las reglas más específicas van primero para evitar colisiones.
    // Ej.: "poderes mágicos" pregunta por magia, no por poderes genéricos.

    // Si aparece "poder/poderes" junto a una palabra que claramente empieza
    // como "mag..." pero quedó mal escrita, no caemos en PODERES genéricos.
    // Es más seguro responder NO LO SÉ.
    {
        const tokensMagia = texto.split(/\s+/).filter(Boolean);
        const hayPoder = contiene(texto, ["poder", "poderes"]);
        const formasMagia = ["magia", "magico", "magica", "magicos", "magicas"];

        const distanciaEdicion = (a, b) => {
            const fila = Array.from({ length: b.length + 1 }, (_, i) => i);

            for (let i = 1; i <= a.length; i++) {
                let anterior = fila[0];
                fila[0] = i;

                for (let j = 1; j <= b.length; j++) {
                    const temporal = fila[j];
                    const costo = a[i - 1] === b[j - 1] ? 0 : 1;

                    fila[j] = Math.min(
                        fila[j] + 1,
                        fila[j - 1] + 1,
                        anterior + costo
                    );

                    anterior = temporal;
                }
            }

            return fila[b.length];
        };

        const hayMagiaDudosa = tokensMagia.some((token) => {
            if (formasMagia.includes(token)) return false;

            return formasMagia.some((forma) =>
                Math.abs(token.length - forma.length) <= 2 &&
                distanciaEdicion(token, forma) <= 2
            );
        });

        if (hayPoder && hayMagiaDudosa) {
            return null;
        }
    }
    if (contiene(texto, [
        "usa magia", "utiliza magia", "tiene magia", "puede hacer magia",
        "tipo de magia", "es magico", "es magica", "poderes magicos"
    ])) {
        return personaje.magia;
    }

    if (contiene(texto, [
        "tiene poderes", "posee poderes", "posee algun tipo de poder",
        "tipo de poder", "superpoder", "poderes especiales",
        "habilidades sobrenaturales"
    ])) {
        return personaje.poderes;
    }

    if (contiene(texto, [
        "usa mascara", "lleva mascara", "tiene mascara", "lleva una mascara",
        "suele llevar mascara", "mascara como parte de su aspecto",
        "mascara para ocultar su identidad"
    ])) {
        return personaje.mascara;
    }

    if (contiene(texto, [
        "usa capa", "lleva capa", "tiene capa", "lleva una capa",
        "vestir una capa", "capa como parte de su apariencia"
    ])) {
        return personaje.capa;
    }

    // "DC Comics" con un typo suave en Comics sigue siendo una consulta
    // de universo, no una consulta genérica sobre aparecer en cómics.
    {
        const tokensDC = texto.split(/\s+/).filter(Boolean);
        if (
            tokensDC.includes("dc") &&
            tokensDC.some((token) => token.startsWith("comic"))
        ) {
            return personaje.universo === "dc";
        }
    }

    // ==================================================
    // MEDIO DE ORIGEN / APARICIÓN
    // ==================================================

    const medios = [
        [["comic", "comics", "historieta"], "comic"],
        [["libro", "novela", "literatura", "literario"], "libro"],
        [["pelicula", "cine"], "pelicula"],
        [["serie", "television", "tv"], "serie"],
        [["animacion", "animado", "animada", "dibujos animados", "dibujito", "obra animada"], "animacion"]
    ];

    for (const [palabras, medio] of medios) {
        if (contiene(texto, palabras)) {
            if (medio === "comic" && contiene(texto, ["dc comics"])) {
                continue;
            }
            return Array.isArray(personaje.medios) && personaje.medios.includes(medio);
        }
    }

    // ==================================================
    // UNIVERSO / FRANQUICIA
    // ==================================================

    const universos = [
        [["marvel"], "marvel"],
        [["dc comics", "universo dc", "es de dc", "personaje de dc", "franquicia es dc"], "dc"],
        [["star wars"], "star wars"],
        [["harry potter", "hogwarts"], "harry potter"],
        [["tolkien", "senor de los anillos", "tierra media"], "tolkien"],
        [["disney", "frozen"], "disney"],
        [["sherlock holmes"], "sherlock holmes"]
    ];

    for (const [palabras, universo] of universos) {
        if (contiene(texto, palabras)) {
            return personaje.universo === universo;
        }
    }

    // ==================================================
    // FAMA / RECONOCIMIENTO
    // Regla general deliberadamente al final: expresiones
    // como "conocido como científico" deben resolverse antes
    // como profesión y no quedar atrapadas por "conocido".
    // ==================================================

    // Si aparece una construcción del tipo "conocido por X" o "conocido como X"
    // y X no fue reconocido por ninguna regla específica anterior, NO inferimos fama.
    // Preferimos NO LO SÉ antes que contestar algo falso por una palabra genérica.
    if (contiene(texto, [
        "conocido por", "conocida por", "conocido como", "conocida como",
        "se lo considera", "se la considera", "su profesion", "su actividad",
        "su trabajo", "se dedica", "se dedico"
    ])) {
        return null;
    }

    if (contiene(texto, [
        "famos", "conocid", "celebre", "popular", "reconocido publicamente",
        "todo el mundo lo conoce", "todo el mundo la conoce"
    ])) {
        return personaje.famoso === true;
    }

    // ==================================================
    // NO RECONOCIDA
    // ==================================================

    return null;
}

function contiene(texto, opciones) {
    const tokens = texto.split(/\s+/).filter(Boolean);

    return opciones.some((opcion) => {
        const patron = normalizar(opcion);

        // Frases de varias palabras: exigimos la secuencia completa con límites
        // de palabra para evitar coincidencias accidentales.
        if (patron.includes(" ")) {
            return (` ${texto} `).includes(` ${patron} `);
        }

        // Palabras/raíces: solo coinciden al principio de un token.
        // Ejemplo: "cientific" reconoce "cientifico", pero "heroe"
        // ya no reconoce accidentalmente "supeheroe".
        return tokens.some((token) => {
            if (token === patron) return true;
            if (patron.length >= 5 && token.startsWith(patron)) return true;
            return false;
        });
    });
}

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[¿?¡!.,;:]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

const CONCEPTOS_PERMITIDOS = [
    "tipo_real",
    "tipo_ficticio",
    "genero_mujer",
    "genero_hombre",
    "vivo",
    "muerto",
    "humano",
    "famoso",
    "region_europa",
    "region_africa",
    "region_america",
    "region_espacio",
    "region_tierra_media",
    "nac_aleman",
    "nac_frances",
    "nac_italiano",
    "nac_egipcio",
    "nac_britanico",
    "nac_ingles",
    "nac_polaco",
    "nac_serbio",
    "nac_usa",
    "nac_mexico",
    "nac_argentina",
    "nac_amazona",
    "idioma_ingles",
    "idioma_aleman",
    "idioma_frances",
    "idioma_italiano",
    "idioma_espanol",
    "idioma_polaco",
    "idioma_serbio",
    "cientifico",
    "fisico",
    "quimico",
    "matematico",
    "programador",
    "inventor",
    "ingeniero",
    "artista",
    "pintor",
    "escritor",
    "autor",
    "poeta",
    "dramaturgo",
    "reina",
    "princesa",
    "emperador",
    "gobernante",
    "politico",
    "militar",
    "detective",
    "superheroe",
    "heroe",
    "heroina",
    "villano",
    "guerrero",
    "bruja",
    "mago",
    "deportista",
    "futbolista",
    "estudiante",
    "periodista",
    "profesor",
    "millonario",
    "jedi",
    "poderes",
    "magia",
    "mascara",
    "capa",
    "medio_comic",
    "medio_libro",
    "medio_pelicula",
    "medio_serie",
    "medio_animacion",
    "universo_marvel",
    "universo_dc",
    "universo_star_wars",
    "universo_harry_potter",
    "universo_tolkien",
    "universo_disney",
    "universo_sherlock_holmes"
];

function resolverConcepto(concepto, personaje) {
    if (!CONCEPTOS_PERMITIDOS.includes(concepto)) return null;

    const directos = {
        tipo_real: () => personaje.tipo === 'real',
        tipo_ficticio: () => personaje.tipo === 'ficticio',
        genero_mujer: () => personaje.genero === 'mujer',
        genero_hombre: () => personaje.genero === 'hombre',
        vivo: () => personaje.vivo === true,
        muerto: () => personaje.vivo === false,
        humano: () => personaje.humano === true,
        famoso: () => personaje.famoso === true,
        poderes: () => personaje.poderes === true,
        magia: () => personaje.magia === true,
        mascara: () => personaje.mascara === true,
        capa: () => personaje.capa === true,
    };
    if (directos[concepto]) return directos[concepto]();

    if (concepto.startsWith('region_')) {
        const mapa = { region_europa:'europa', region_africa:'africa', region_america:'america', region_espacio:'espacio', region_tierra_media:'tierra media' };
        return personaje.region === mapa[concepto];
    }
    if (concepto.startsWith('nac_')) {
        const mapa = {
            nac_aleman:'aleman', nac_frances:'frances', nac_italiano:'italiano', nac_egipcio:'egipcio', nac_britanico:'britanico', nac_ingles:'ingles',
            nac_polaco:'polaco', nac_serbio:'serbio', nac_usa:'estadounidense', nac_mexico:'mexicano', nac_argentina:'argentino', nac_amazona:'amazona'
        };
        return Array.isArray(personaje.nacionalidades) && personaje.nacionalidades.includes(mapa[concepto]);
    }
    if (concepto.startsWith('idioma_')) {
        const idioma = concepto.replace('idioma_', '');
        return Array.isArray(personaje.idiomas) && personaje.idiomas.includes(idioma);
    }
    if (concepto.startsWith('medio_')) {
        const medio = concepto.replace('medio_', '');
        return Array.isArray(personaje.medios) && personaje.medios.includes(medio);
    }
    if (concepto.startsWith('universo_')) {
        const mapa = {
            universo_marvel:'marvel', universo_dc:'dc', universo_star_wars:'star wars', universo_harry_potter:'harry potter',
            universo_tolkien:'tolkien', universo_disney:'disney', universo_sherlock_holmes:'sherlock holmes'
        };
        return personaje.universo === mapa[concepto];
    }

    return Array.isArray(personaje.etiquetas) && personaje.etiquetas.includes(concepto);
}

const MindLogic = { evaluarPregunta, resolverConcepto, normalizar, contiene, CONCEPTOS_PERMITIDOS };
if (typeof window !== 'undefined') window.MindLogic = MindLogic;
if (typeof module !== 'undefined' && module.exports) module.exports = MindLogic;
