// Banco de validación determinista de 10 personajes x 15 preguntas.
// Compara el motor actual contra expectativas revisadas; los null no se puntúan.
const fs=require('fs'),vm=require('vm');
const L=require('./motor_logico.js'),S=require('./sugeridor.js');
const bank=JSON.parse(fs.readFileSync('./banco_validacion_3.13.77.json','utf8'));
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('./personajes.js','utf8')+';globalThis.__P=PERSONAJES;',ctx);
const P=ctx.__P;let scored=0,correct=0,wrong=0,unanswered=0,pending=0;const byCharacter=[];const details=[];
for(const c of bank.characters){
 const p=P.find(x=>x.nombre===c.name || (x.alias||[]).includes(c.name));
 let pc=0,pw=0,pu=0,pp=0,ps=0;
 for(const f of c.facts){
  const q=bank.questions.find(x=>x.id===f.questionId);let got=null;
  if(p)got=S.val(L,q.text,p);
  const expected=f.expected;
  let status;
  if(expected===null){status='PENDIENTE_JUAN';pending++;pp++;}
  else if(got===null||got===undefined){status='SIN_RESPUESTA';unanswered++;pu++;ps++;}
  else if(got===expected){status='CORRECTA';correct++;pc++;ps++;}
  else {status='INCORRECTA';wrong++;pw++;ps++;}
  if(expected!==null)scored++;
  details.push({personaje:c.name,pregunta:q.text,esperada:expected===null?'PENDIENTE_JUAN':expected?'Sí':'No',obtenida:got===null?'No sé':got?'Sí':'No',estado:status,revision:f.reviewStatus});
 }
 byCharacter.push({personaje:c.name,evaluables:ps,correctas:pc,incorrectas:pw,sinRespuesta:pu,pendientesJuan:pp});
}
const report={versionBase:bank.sourceVersion,semilla:bank.seed,personajes:bank.characters.length,preguntasFijas:bank.questions.length,casosTotales:bank.characters.length*bank.questions.length,evaluables:scored,correctas:correct,incorrectas:wrong,sinRespuesta:unanswered,pendientesJuan:pending,porPersonaje:byCharacter,detalle:details,nota:'Resultados de la lógica local (Sugeridor.val + motor_logico.js), no una prueba E2E de navegador. Las respuestas esperadas están pendientes de validación de Juan.'};
fs.writeFileSync('./resultado_validacion_3.13.77.json',JSON.stringify(report,null,2));
console.log(`BASE ${bank.sourceVersion} | semilla ${bank.seed}`);
console.log(`Casos ${report.casosTotales} | evaluables ${scored} | correctas ${correct} | incorrectas ${wrong} | sin respuesta ${unanswered} | pendientes Juan ${pending}`);
for(const x of byCharacter)console.log(`${x.personaje}: correctas=${x.correctas}, incorrectas=${x.incorrectas}, sin respuesta=${x.sinRespuesta}, pendientes=${x.pendientesJuan}`);
console.log('Informe escrito: resultado_validacion_3.13.77.json');
