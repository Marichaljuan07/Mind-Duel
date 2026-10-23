const L=require('./motor_logico.js'),S=require('./sugeridor.js'),fs=require('fs'),vm=require('vm');
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('./personajes.js','utf8')+';globalThis.__P=PERSONAJES;',c);const P=c.__P;
const contradictory=[{texto:'¿Es una persona real?',concepto:null,answer:true},{texto:'¿Es ficticio?',concepto:null,answer:true},{texto:'¿Es humano?',concepto:null,answer:false}];
const out=S.sugerir(L,P,contradictory,new Set(contradictory.map(f=>L.normalizar(f.texto))),5,8);
if(out.length!==5)throw new Error('Esperaba 5 preguntas de respaldo; obtuve '+out.length);
if(new Set(out.map(q=>L.normalizar(q))).size!==out.length)throw new Error('Hay preguntas repetidas');
console.log('OK: hechos contradictorios no bloquean las sugerencias:',out.join(' | '));
