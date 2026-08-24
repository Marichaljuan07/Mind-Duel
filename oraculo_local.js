// ORACULO LOCAL MVP V2 - navegador
// Interprete semantico local.
// No decide respuestas. Solo devuelve conceptos.

let ORACULO_BASE = null;

async function cargarOraculo() {
    if (ORACULO_BASE) return;

    const respuesta = await fetch("oraculo_base_v3_2.json");
    ORACULO_BASE = await respuesta.json();
}

const correcciones = {
    "brilante": "brillante",
    "intelijente": "inteligente",
    "creava": "creaba",
    "poderez": "poderes"
};

function normalizar(texto) {
    let t = texto.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[¿?¡!.,;:]/g, "")
        .trim();

    for (const error in correcciones) {
        t = t.replace(error, correcciones[error]);
    }

    return t;
}

function compararFlexible(texto, frase) {
    const f = normalizar(frase);

    if (texto.includes(f)) return true;

    const palabras = f.split(" ");
    let encontradas = 0;

    for (const palabra of palabras) {
        if (texto.includes(palabra)) encontradas++;
    }

    return palabras.length > 1 && encontradas === palabras.length;
}

async function interpretar(pregunta) {
    await cargarOraculo();

    const texto = normalizar(pregunta);
    let resultados = [];

    for (const concepto in ORACULO_BASE.conceptos) {
        const datos = ORACULO_BASE.conceptos[concepto];
        let puntos = 0;

        for (const frase of datos.frases) {
            if (compararFlexible(texto, frase)) {
                puntos += datos.peso;
            }
        }

        if (puntos > 0) {
            resultados.push({
                concepto,
                puntos: Math.min(puntos, datos.peso * 2)
            });
        }
    }

    if (!resultados.length) return null;

    resultados.sort((a,b)=>b.puntos-a.puntos);

    return {
        estado: "entendido",
        concepto: resultados[0].concepto,
        puntos: resultados[0].puntos
    };
}


function registrarFalloOraculo(pregunta){
    try{
        let fallos = JSON.parse(localStorage.getItem("mind_oraculo_fallos") || "[]");

        fallos.push({
            pregunta,
            fecha: new Date().toISOString()
        });

        // Mantener memoria limitada para no llenar el dispositivo
        if(fallos.length > 500){
            fallos = fallos.slice(-500);
        }

        localStorage.setItem(
            "mind_oraculo_fallos",
            JSON.stringify(fallos)
        );

    }catch(e){
        console.info("[ORACULO] No se pudo guardar fallo");
    }
}

const interpretarOriginal = interpretar;

async function interpretarConRegistro(pregunta){
    const resultado = await interpretarOriginal(pregunta);

    if(!resultado){
        registrarFalloOraculo(pregunta);
    }

    return resultado;
}

window.OraculoLocal = {
    interpretar: interpretarConRegistro,
    obtenerFallos: function(){
        return JSON.parse(localStorage.getItem("mind_oraculo_fallos") || "[]");
    }
};

