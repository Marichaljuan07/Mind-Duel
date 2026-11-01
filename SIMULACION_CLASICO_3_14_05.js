#!/usr/bin/env node
'use strict';
// Simulación reproducible de las reglas de seguridad de v3.14.05; no pretende
// sustituir una partida real del navegador ni medir la tasa de acierto del catálogo.
const PRESENTES = ['Batman','Harry Potter','Darth Vader','Elsa','Goku','Albert Einstein','Frodo Bolsón','Wonder Woman','Gandalf','Spider-Man'];
const AUSENTES = ['Kratos','Link','Mario','Pikachu','Sherlock'];
const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const CONCEPTS = [
 ['real',/persona real|es real|existio/],['vivo',/sigue con vida|esta vivo|esta viva|fallecido|fallecida|muerto|muerta/],
 ['television',/television o series|serie de television|aparece en television|aparece en series/],
 ['peliculas',/aparece en peliculas|pelicula|peliculas|cine/],['libros',/aparece en libros|libro|libros|escribia novelas|novelas/],
 ['comics',/aparece en comics|comic|comics|historietas/],['mujer',/es una mujer|es mujer/],['hombre',/es un hombre|es hombre/],
 ['videojuego',/videojuego|videojuegos/],['mitologia',/mitologia|mitologico|dios|diosa/],['combate',/combate|lucha|guerrero/],['armas',/armas|espada|hacha/]
];
function concept(q){const t=norm(q);for(const [k,re] of CONCEPTS)if(re.test(t))return k;return null}
function contradictionCount(facts,candidate){return facts.filter(f=>candidate[f.key]!==undefined&&candidate[f.key]!==f.value).length}
function canGuess(facts,candidate){return contradictionCount(facts,candidate)<2}
function dedupeQuestions(qs){const seen=new Set(),out=[];for(const q of qs){const c=concept(q);const k=c||norm(q);if(seen.has(k))continue;seen.add(k);out.push(q)}return out}
const candidates=[
 {name:'Batman',facts:{real:false,television:true,comics:true,videojuego:true}}, {name:'Harry Potter',facts:{real:false,libros:true,television:true,mitologia:false}},
 {name:'Darth Vader',facts:{real:false,television:true,comics:true,videojuego:true}}, {name:'Elsa',facts:{real:false,television:true,peliculas:true,libros:true}},
 {name:'Goku',facts:{real:false,television:true,comics:true,videojuego:true}}, {name:'Albert Einstein',facts:{real:true,libros:true,television:true}},
 {name:'Frodo Bolsón',facts:{real:false,libros:true,television:true,peliculas:true}}, {name:'Wonder Woman',facts:{real:false,comics:true,television:true}},
 {name:'Gandalf',facts:{real:false,libros:true,mitologia:true,television:true}}, {name:'Spider-Man',facts:{real:false,comics:true,television:true,peliculas:true}}
];
const tests=[...candidates.map(c=>({...c,absent:false})),...AUSENTES.map(name=>({name,absent:true,facts:{}}))];
console.log('SIMULACIÓN DETERMINISTA — reglas de contradicción y deduplicación (no es un benchmark de aciertos)');
console.log('Personaje | Tipo | Preguntas | Acierto permitido | Conceptos repetidos | Adivinanza contradictoria');
let failures=0;
for(const t of tests){
 const qs=dedupeQuestions(['¿Aparece en televisión o series?','¿Tiene serie de televisión?','¿Sigue con vida?','¿Está fallecido?','¿Aparece en libros?','¿Escribía novelas?','¿Aparece en cómics?','¿Es un videojuego?']);
 const repeated=qs.map(concept).filter(Boolean).length-new Set(qs.map(concept).filter(Boolean)).size;
 const facts=t.absent?[{key:'real',value:false},{key:'videojuego',value:true}]:Object.entries(t.facts).map(([key,value])=>({key,value}));
 const contradictory=t.absent?false:!canGuess(facts,t.facts);
 const allowed=!t.absent&&!contradictory;
 if(repeated!==0||contradictory)failures++;
 console.log(`${t.name} | ${t.absent?'ausente':'presente'} | ${qs.length} | ${t.absent?'admitir desconocimiento':allowed?'posible, sujeto a más evidencia':'bloqueado'} | ${repeated} | ${contradictory?'SÍ':'NO'}`);
}
console.log(`Resultado: ${failures===0?'PASS':'REVISAR'} (${failures} fallos de invariantes en esta simulación).`);
console.log('Nota: los personajes ausentes se tratan como desconocidos por diseño; su reconocimiento real depende del catálogo cargado en la aplicación.');
if(failures)process.exitCode=1;
