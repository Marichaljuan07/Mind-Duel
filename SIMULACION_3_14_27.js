'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm');
let pass=0,fail=0;function test(name,fn){try{fn();console.log('PASS | '+name);pass++;}catch(e){console.error('FAIL | '+name+' | '+e.message);fail++;}}
const Ontology=require('./ontologia.js');
const cases=[
 ['deidad', '¿Es una deidad?',{tipo:'ficticio',deidad:true},true],
 ['semidiós distinto de dios','¿Es un dios?',{tipo:'ficticio',semidios:true},false],
 ['semidiós reconocido','¿Es una semidiosa?',{tipo:'ficticio',semidios:true},true],
 ['mago y hechicera equivalentes','¿Es una maga?',{tipo:'ficticio',etiquetas:['hechicera']},true],
 ['héroe y superhéroe relacionados','¿Es un héroe?',{tipo:'ficticio',etiquetas:['superheroe']},true],
 ['profesión científica','¿Es científica?',{tipo:'real',profesion:'Física'},true],
 ['escritora y novelista relacionadas','¿Es escritora?',{tipo:'real',etiquetas:['novelista']},true],
 ['nacionalidad griega','¿Es griego?',{tipo:'real',nacionalidades:['griega']},true],
 ['nacionalidad francesa descarta italiana','¿Es italiano?',{tipo:'real',nacionalidades:['francesa']},false],
 ['lugar de nacimiento no inventa nacionalidad','¿Es alemán?',{tipo:'real',lugar_nacimiento:'Berlín'},null],
 ['rasgo loco explícito','¿Se lo considera loco?',{tipo:'ficticio',etiquetas:['considerado loco']},true],
 ['no diagnostica por ausencia','¿Es loco?',{tipo:'ficticio',descripcion:'Científico brillante y excéntrico'},null],
 ['científico loco como arquetipo','¿Es un científico loco?',{tipo:'ficticio',cientifico_loco:true},true],
 ['androide no humano','¿Es humano?',{tipo:'ficticio',especie:'androide'},false],
 ['atributo ausente permanece desconocido','¿Es humano?',{tipo:'ficticio'},null]
];
for(const [name,q,p,want] of cases)test(name,()=>assert.strictEqual(Ontology.resolver(q,p),want));
const oldWindow=global.window;global.window={MindOntology:Ontology};
const Solo=require('./solo.js');const L={normalizar:v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()};
test('Solo utiliza la ontología compartida',()=>assert.equal(Solo.deducir(L,'¿Es una maga?',{tipo:'ficticio',etiquetas:['hechicera']}).nivel,'si'));
test('Solo conserva desconocido cuando falta evidencia',()=>assert.strictEqual(Solo.deducir(L,'¿Es humano?',{tipo:'ficticio'}),null));
const K=require('./conocimiento.js');
test('el selector de conocimiento reconoce semidiós',()=>assert.equal(K.conceptoDePregunta('¿Es una semidiosa?'),'semidios'));
test('el selector de conocimiento reconoce nacionalidad griega',()=>assert.equal(K.conceptoDePregunta('¿Es griego?'),'nac_griego'));
test('el conocimiento comparte la resolución de nacionalidades',()=>assert.strictEqual(K.valor({tipo:'real',nacionalidades:['griego']},'nac_griego'),true));
const ctx={console,window:null};ctx.window=ctx;ctx.MindOntology=Ontology;vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/motor_logico.js','utf8'),ctx);
test('Clásico usa la misma ontología para deidades',()=>assert.strictEqual(ctx.MindLogic.evaluarPregunta('¿Es una deidad?',{tipo:'ficticio',deidad:true}),true));
test('Clásico no convierte una ficha incompleta en NO',()=>assert.strictEqual(ctx.MindLogic.evaluarPregunta('¿Es alemán?',{tipo:'real',lugar_nacimiento:'Berlín'}),null));
const index=fs.readFileSync('./index.html','utf8');
test('la ontología carga antes del motor lógico',()=>assert(index.indexOf('ontologia.js')<index.indexOf('motor_logico.js')));
console.log(`Resultado 3.14.27: ${pass} aprobadas, ${fail} fallidas.`);global.window=oldWindow;if(fail)process.exit(1);
