'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const store=new Map();
global.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))};
global.window={};
const Logic=require('./motor_logico.js');global.MindLogic=Logic;window.MindLogic=Logic;
const Knowledge=require('./conocimiento.js');window.MindKnowledge=Knowledge;
const Sugeridor=require('./sugeridor.js');global.Sugeridor=window.Sugeridor=Sugeridor;
const Clasico=require('./clasico.js');global.Clasico=window.Clasico=Clasico;
const candidates=Array.from({length:900},(_,i)=>({
 nombre:`Candidato ${i}`,tipo:i%3===0?'real':'ficticio',real:i%3===0,ficticio:i%3!==0,
 humano:i%3===0,genero:i%2?'hombre':'mujer',vivo:i%4===0,
 universo:['historia','fantasia','ciencia','anime'][i%4],
 medios:[['libro'],['videojuego'],['pelicula'],['television']][i%4],
 etiquetas:[['cientifico'],['guerrero'],['artista'],['deportista']][i%4],
 poderes:i%5===0,combate:i%3===1
}));
const t0=Date.now();
let firstQuestions=[];
for(let i=0;i<20;i++){
 Sugeridor.invalidarCache();
 const game=Clasico.nuevo(candidates);
 firstQuestions.push(Clasico.pregunta(game,Logic));
}
const variationMs=Date.now()-t0;
assert.ok(new Set(firstQuestions).size>=2,'el inicio debe variar entre partidas equivalentes');
console.log(`PASS variación entre partidas: ${new Set(firstQuestions).size} primeras preguntas distintas en 20 partidas (${variationMs} ms).`);

Sugeridor.invalidarCache();
const game=Clasico.nuevo(candidates);
const asked=[];
for(let turn=0;turn<12;turn++){
 const q=Clasico.pregunta(game,Logic);
 if(!q)break;
 assert.equal(Clasico.esRedundante(game,Logic,q),false,`la pregunta ${q} repite un concepto ya preguntado`);
 asked.push(q);
 Clasico.responder(game,Logic,q,turn%2===0?'si':'no');
 Sugeridor.invalidarCache();
}
assert.ok(asked.length>=5,'el selector debe poder sostener varias preguntas');
console.log(`PASS no repetición semántica: ${asked.length} preguntas sin repetir conceptos.`);
const equivalence=Clasico.nuevo(candidates);
Clasico.responder(equivalence,Logic,'¿Es una persona real?','nose');
assert.equal(Clasico.esRedundante(equivalence,Logic,'¿Es ficticio?'),true,'real/ficticio no deben preguntarse como si fueran conceptos distintos tras un NO LO SÉ');
console.log('PASS equivalencia lógica: no vuelve a preguntar real/ficticio aunque la respuesta anterior haya sido NO LO SÉ.');

const vm=require('node:vm');
const catalogContext={};
vm.runInNewContext(fs.readFileSync(__dirname+'/personajes.js','utf8')+';globalThis.catalog=PERSONAJES;',catalogContext);
const realCatalog=catalogContext.catalog;
const actualStarts=[];
for(let i=0;i<20;i++){Sugeridor.invalidarCache();actualStarts.push(Clasico.pregunta(Clasico.nuevo(realCatalog),Logic));}
assert.ok(new Set(actualStarts).size>=3,'el catálogo incluido debe producir variedad inicial entre partidas');
console.log(`PASS catálogo incluido (${realCatalog.length} fichas): ${new Set(actualStarts).size} primeras preguntas distintas en 20 partidas.`);

const start=Date.now();
Sugeridor.invalidarCache();
const perfGame=Clasico.nuevo(candidates);
const first=Clasico.pregunta(perfGame,Logic);
assert.ok(first);
const firstMs=Date.now()-start;
Clasico.responder(perfGame,Logic,first,'si');
Sugeridor.invalidarCache();
const secondStart=Date.now();
const second=Clasico.pregunta(perfGame,Logic);
const secondMs=Date.now()-secondStart;
assert.ok(second);
assert.notEqual(Logic.normalizar(first),Logic.normalizar(second));
assert.ok(firstMs<1500,`primera selección demasiado lenta: ${firstMs} ms`);
assert.ok(secondMs<1500,`selección tras responder demasiado lenta: ${secondMs} ms`);
console.log(`PASS rendimiento sintético (900 candidatos): inicio ${firstMs} ms; siguiente pregunta ${secondMs} ms.`);

const app=fs.readFileSync(__dirname+'/script.js','utf8');
assert.ok(app.includes("La última vez me ganaste. Esta vez voy a prestar más atención."));
assert.ok(!app.includes('La última vez me ganaste con ${last.nombre}'));
assert.match(app,/const sparringLimit=120/);
assert.match(app,/Clasico\.esRedundante\(s,MindLogic,x\)/);
const knowledge=fs.readFileSync(__dirname+'/conocimiento.js','utf8');
assert.match(knowledge,/let INFER_CACHE=new WeakMap\(\)/);
assert.match(knowledge,/function invalidarCache\(\)/);
console.log('PASS memoria sin revelar el personaje anterior.');
console.log('PASS sparring limitado a una muestra de 120 candidatos.');
const dynamic=Knowledge.preguntasDesdeFichas([{nombre:'A',poderes:true,habilidades:['vuelo']},{nombre:'B',poderes:false,habilidades:['invisibilidad']}]);
assert.ok(dynamic.every(q=>! /\b(true|false)\?$/i.test(q)),'no deben generarse preguntas con valores booleanos literales');
assert.ok(!Knowledge.preguntasDesdeFichas([{nombre:'A',universo:'real'},{nombre:'B',universo:'ficticio'}]).some(q=>/universo real|universo ficticio/i.test(q)),'no deben aparecer universos genéricos derivados de tipo real/ficticio');
console.log('PASS preguntas dinámicas: no convierten booleanos ni tipos genéricos en preguntas absurdas.');
console.log('PASS caché de inferencias con invalidación y fallback semántico protegido.');
