'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const store=new Map();
global.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))};
global.window={};
const MindLogic=require('./motor_logico.js');global.MindLogic=MindLogic;window.MindLogic=MindLogic;
const Knowledge=require('./conocimiento.js');let enrichCalls=0;
const originalEnrich=Knowledge.enriquecer;
Knowledge.enriquecer=(p)=>{enrichCalls++;return originalEnrich(p)};
window.MindKnowledge=Knowledge;
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
const L=MindLogic;
const game=Clasico.nuevo(candidates);
const t0=Date.now();
const q1=Clasico.pregunta(game,L);const firstMs=Date.now()-t0;
assert.ok(q1,'el selector debe generar una pregunta inicial');
assert.ok(enrichCalls<=candidates.length+2,`la inferencia se debe reutilizar por candidato, llamadas: ${enrichCalls}`);
const firstCalls=enrichCalls;
Clasico.responder(game,L,q1,'si');
Sugeridor.invalidarCache();
const beforeSecond=enrichCalls;
const q2=Clasico.pregunta(game,L);const secondMs=Date.now()-t0-firstMs;
assert.ok(q2,'el selector debe continuar después de una respuesta');
assert.ok(enrichCalls>beforeSecond,'la caché debe renovarse después de una respuesta');
assert.notEqual(q2,q1,'no debe repetir inmediatamente la pregunta');
// La caché no debe degradar la lógica: tras invalidarla vuelve a calcular con evidencia actualizada.
Sugeridor.invalidarCache();
const q3=Clasico.pregunta(game,L);
assert.ok(q3,'el selector debe seguir funcionando tras renovar caché');
console.log(`PASS selector inicial: ${q1} (${firstMs} ms)`);
console.log(`PASS continuidad tras respuesta: ${q2} (${secondMs} ms)`);
console.log(`PASS caché: ${firstCalls} inferencias para ${candidates.length} candidatos en la primera selección.`);
console.log('PASS invalidación: la inferencia se recalcula después de responder.');
console.log('PASS no repetición inmediata y siguiente turno operativo.');
const app=fs.readFileSync(__dirname+'/script.js','utf8');
const nextBody=app.slice(app.indexOf('async function nextClassic() {'),app.indexOf('\nasync function classicGuess(',app.indexOf('async function nextClassic() {')));
const answerBody=app.slice(app.indexOf('async function classicAnswer(ans) {'),app.indexOf('\nfunction machineSnapshot()',app.indexOf('async function classicAnswer(ans) {')));
assert.match(nextBody,/finally\s*\{\s*classicBusy\s*=\s*false;/,'nextClassic debe liberar el bloqueo incluso ante errores');
assert.match(answerBody,/finally\s*\{\s*classicBusy\s*=\s*false;/,'classicAnswer debe liberar el bloqueo incluso ante errores');
assert.match(nextBody,/s\.n\s*>=\s*MAX_QUESTIONS/,'Clásico debe forzar la adivinanza al alcanzar 20 preguntas');
assert.match(app,/resetGame\(true\);\s*classicSetMode\(true\)/,'Clásico no debe construir el personaje secreto del modo Solo');
console.log('PASS recuperación: nextClassic y classicAnswer liberan classicBusy con finally.');
console.log('PASS límite: el modo Clásico conserva el intento obligatorio al llegar a 20 preguntas.');
console.log('PASS inicio: Clásico omite el armado del pool innecesario de Solo.');
