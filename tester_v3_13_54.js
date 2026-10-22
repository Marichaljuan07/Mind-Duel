const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const L = require('./motor_logico.js');
const S = require('./sugeridor.js');
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync('./personajes.js', 'utf8') + ';globalThis.__P=PERSONAJES;', c);
const P = c.__P;
const yoda = P.find(p => p.nombre === 'Yoda');
assert(yoda, 'Yoda debe existir en el banco');
assert.strictEqual(L.evaluarPregunta('¿Es de un anime?', yoda), false, 'Yoda no es de anime');
assert.strictEqual(L.evaluarPregunta('¿Es poderoso?', yoda), true, 'Yoda tiene poderes');
assert.strictEqual(L.evaluarPregunta('¿Es alguien terrestre?', yoda), false, 'Yoda no es de origen terrestre');
assert.strictEqual(L.evaluarPregunta('¿Participa en combates?', yoda), true, 'Yoda participa en combates');
assert.strictEqual(L.evaluarPregunta('¿Está vivo?', yoda), false, 'Yoda no está vivo');
assert.strictEqual(L.evaluarPregunta('¿Está muerto?', yoda), true, 'Yoda está muerto según la ficha del juego');
assert.strictEqual(L.evaluarPregunta('¿Tiene hijos?', yoda), null, 'No inventa un dato de hijos que no está confirmado');
assert.strictEqual(L.evaluarPregunta('¿Es escritor?', yoda), false, 'Yoda no figura como escritor');
const facts = [
 {texto:'¿Es una persona real?',concepto:null,answer:false},
 {texto:'¿Es humano?',concepto:null,answer:false},
 {texto:'¿Tiene poderes?',concepto:null,answer:true},
 {texto:'¿Es héroe?',concepto:null,answer:false},
 {texto:'¿Es villano?',concepto:null,answer:false}
];
const asked = new Set(facts.map(f => L.normalizar(f.texto)));
const qs = S.sugerir(L, P, facts, asked, 5, 5);
assert(qs.length >= 3, 'Debe ofrecer varias preguntas útiles');
assert(!qs.some(q => /persona real|humano|poderes|héroe|villano/i.test(q)), 'No debe repetir preguntas ya respondidas');
assert(S.POOL.some(q => /anime/i.test(q)), 'El banco de sugerencias debe incluir anime');
const seed = JSON.parse(fs.readFileSync('./aprendido_semilla.json','utf8'));
assert.strictEqual(seed['es de un anime'].c, 'anime', 'La semilla debe incluir el concepto compartible de anime');
console.log('v3.13.54: OK — preguntas nuevas, datos de Yoda, no inventa hijos, sugerencias y aprendizaje portable.');
