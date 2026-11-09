'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const K=require('./conocimiento.js');
let passed=0;
function test(name,fn){try{fn();passed++;console.log('PASS',name)}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}}
test('genera preguntas dinámicas desde atributos reales de las fichas',()=>{
 const ps=[{nombre:'Francisco',tipo:'real',profesion:'Papa'},{nombre:'Einstein',tipo:'real',profesion:'Físico'},{nombre:'Otro papa',tipo:'real',profesion:'Papa'}];
 const q=K.preguntasDesdeFichas(ps);assert(q.includes('¿Su profesión es Papa?'));assert(q.includes('¿Su profesión es Físico?'));
});
test('el Cerebro puede evaluar respuestas positivas y negativas con esos atributos',()=>{
 const a={profesion:'Papa'},b={profesion:'Físico'},c={};const concept=K.conceptoDePregunta('¿Su profesión es Papa?');assert.equal(K.valor(a,concept),true);assert.equal(K.valor(b,concept),false);assert.equal(K.valor(c,concept),null);
});
test('la plantilla separa personas reales y personajes ficticios',()=>{
 const ui=fs.readFileSync('catalogo_personajes.js','utf8');assert.match(ui,/persona_real_v2/);assert.match(ui,/personaje_ficticio_v2/);assert.match(fs.readFileSync('index.html','utf8'),/newCharacterType/);
});
test('las fichas pendientes compartidas no se excluyen del conjunto clásico',()=>{
 const s=fs.readFileSync('script.js','utf8');assert.match(s,/\['archived','rejected','retired'\]\.includes\(row\.status\)/);assert.doesNotMatch(s,/if\(!coreReady\)continue/);assert.doesNotMatch(s,/const coreReady=/);
});
test('la extracción conserva el texto de fuente en contenido_fuente y genera descripción corta',()=>{
 const api=fs.readFileSync('api/character-extract.js','utf8');assert.match(api,/attributes\.contenido_fuente=content\.slice\(0,MAX_TEXT\)/);assert.match(api,/conciseDescription\(/);assert.match(api,/mapFacts\(/);
});
test('las fichas nuevas requieren indicar real o ficticio',()=>{
 const api=fs.readFileSync('api/characters.js','utf8');assert.match(api,/Indicá si el personaje es real o ficticio/);
});
console.log(`${passed}/6 pruebas aprobadas`);
