const assert=require('assert');
const fs=require('fs'),vm=require('vm');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('./personajes.js','utf8')+';globalThis.__P=PERSONAJES;',ctx);
const P=ctx.__P,L=require('./motor_logico.js'),K=require('./conocimiento.js'),S=require('./sugeridor.js');
global.window={MindKnowledge:K};
let pass=0;function ok(cond,msg){assert.ok(cond,msg);pass++;console.log('OK  '+msg)}
const get=n=>P.find(p=>p.nombre===n);
ok(P.length===98,'conserva las 98 fichas');
ok(S.val(L,'¿Tiene poderes?',get('Naruto Uzumaki'))===true,'Naruto tiene poderes: corrección confirmada');
ok(S.val(L,'¿Participa en combates?',get('Pikachu'))===true,'Pikachu participa en combates: corrección confirmada');
ok(S.val(L,'¿Es un animal?',{nombre:'Ficha desconocida',tipo:'ficticio',universo:'fantasia'})===null,'animal desconocido no se convierte en NO');
ok(S.val(L,'¿Es de la Edad Media?',{nombre:'Ficha sin época',tipo:'ficticio',etiquetas:[]})===null,'ficha ficticia sin época sigue desconocida');
ok(S.concepto('¿Tiene poderes?')==='poderes','sugerencias enrutan poderes al concepto correcto');
ok(S.concepto('¿Participa en combates?')==='combate','sugerencias enrutan combate al concepto correcto');
ok(S.val(L,'¿Es ficticio?',get('Batman'))===true,'pregunta ficticio conserva su polaridad correcta');
ok(S.val(L,'¿Es ficticio?',get('Albert Einstein'))===false,'persona real no queda marcada como ficticia');
const facts=[
 {texto:'¿Es una persona real?',answer:false}, {texto:'¿Es un hombre?',answer:true},
 {texto:'¿Es humano?',answer:true}, {texto:'¿Es de Europa?',answer:false},
 {texto:'¿Tiene poderes?',answer:false}
];
ok(S.desbloqueada(L,P,facts),'cinco respuestas distintas y reconocidas habilitan sugerencias');
ok(!S.desbloqueada(L,P,facts.slice(0,4)),'cuatro respuestas no habilitan sugerencias');
ok(!S.desbloqueada(L,P,[...facts.slice(0,4),{texto:'pregunta inventada',answer:false}]),'una pregunta no reconocida no desbloquea sugerencias');
const bank=JSON.parse(fs.readFileSync('./banco_validacion_3.13.77.json','utf8'));
ok(bank.characters.length===10&&bank.questions.length===15,'banco fijo de 150 casos preservado');
ok(bank.characters.every(c=>c.facts.every(f=>f.reviewStatus==='VALIDADO_AUTONOMAMENTE'||f.reviewStatus==='CONSULTA_JUAN')),'cada expectativa tiene estado de validación explícito');
console.log(`RESULTADO: ${pass}/14 pruebas correctas.`);
