'use strict';
const assert=require('node:assert/strict');
const K=require('./conocimiento.js');
const S=require('./sugeridor.js');
global.window={MindKnowledge:K,Sugeridor:S};global.MindKnowledge=K;global.Sugeridor=S;
const L=require('./motor_logico.js');const C=require('./clasico.js');
const fichas=[
 {nombre:'Francisco',tipo:'real',profesion:'Papa',organizaciones:['Compañía de Jesús'] ,status:'needs_review'},
 {nombre:'Einstein',tipo:'real',profesion:'Físico',organizaciones:['Universidad de Princeton'],status:'verified'},
 {nombre:'Otro papa',tipo:'real',profesion:'Papa',organizaciones:['Iglesia católica'],status:'needs_review'}
];
const q=C.pregunta(C.nuevo(fichas),L);
assert.match(q,/profesi[oó]n es|organizaci[oó]n/);
const concept=K.conceptoDePregunta(q);
const results=fichas.map(p=>K.valor(p,concept));
assert(results.includes(true)&&results.includes(false));assert.equal(K.valor({nombre:'Ficha sin ese dato'},concept),null);
console.log('PASS | Clásico genera una pregunta a partir de atributos de fichas cargadas');
console.log('PASS | las fichas pendientes y verificadas participan en la misma deducción');
console.log('PASS | el Cerebro distingue valores y no convierte datos ausentes en NO');
console.log('Resultado: PASS (3 controles).');
