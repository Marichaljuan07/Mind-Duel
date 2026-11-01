#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm');
const MindLogic=require('./motor_logico.js');
global.MindLogic=MindLogic;global.Sugeridor=require('./sugeridor.js');global.Clasico=require('./clasico.js');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('personajes.js','utf8')+'\n;globalThis.P=PERSONAJES;',ctx);
const ps=ctx.P;
const failures=[];
function check(name,ok,detail=''){console.log(`${ok?'PASS':'FAIL'} | ${name}${detail?' | '+detail:''}`);if(!ok)failures.push(name)}
function aliasRedundancy(first,second,answer='no'){
 const s=Clasico.nuevo(ps);Clasico.responder(s,MindLogic,first,answer);return Clasico.esRedundante(s,MindLogic,second);
}
check('sin resumen visible',!fs.readFileSync('script.js','utf8').includes("addMessage('Hasta ahora:"));
check('serie de televisión y salir en series son el mismo concepto',aliasRedundancy('¿Tu personaje tiene una serie de televisión?','¿Tu personaje sale en series?'));
check('fallecido y falleció son el mismo concepto',aliasRedundancy('¿Tu personaje está fallecido?','¿Tu personaje falleció?'));
check('poderes sobrenaturales y poderez no duplican concepto',aliasRedundancy('¿Tu personaje tiene poderes sobrenaturales?','¿Tu personaje tiene poderez?'));
check('Hogwarts y Harry Potter son el mismo universo',aliasRedundancy('¿Tu personaje es de Harry Potter?','¿Tu personaje va a Hogwarts?'));
check('el pool local contiene pregunta sobre videojuegos',Sugeridor.POOL.some(q=>/videojuegos/i.test(q)));
check('Kratos no existe en el catálogo local (limitación conocida)',!ps.some(p=>/\bkratos\b/i.test(p.nombre||'')));
const s=Clasico.nuevo(ps);const asked=[];
function answer(q){const t=MindLogic.normalizar(q);if(/persona real/.test(t))return 'no';if(/ficticio/.test(t))return 'si';if(/videojuego/.test(t))return 'si';if(/humano/.test(t))return 'si';if(/animal/.test(t)||/mujer/.test(t))return 'no';if(/hombre/.test(t)||/poder/.test(t)||/magia/.test(t))return 'si';if(/vivo|fallecid|fallecio|con vida/.test(t))return 'si';if(/television|serie|pelicula|libro|comic/.test(t))return 'no';return 'no'}
for(let i=0;i<10;i++){const q=Clasico.pregunta(s,MindLogic);if(!q)break;asked.push(q);Clasico.responder(s,MindLogic,q,answer(q));}
const specific=/\b(reina|rey|hogwarts|harry potter|habla espanol|habla castellano|capa|marvel|dc comics|star wars|disney|pokemon|tolkien)\b/i;
check('no salta a una franquicia/atributo específico antes de 10 respuestas',asked.every((q,i)=>i>=10||!specific.test(MindLogic.normalizar(q))),asked.join(' → '));
const norm=asked.map(q=>MindLogic.normalizar(q));check('no repite la misma frase en la prueba',norm.length===new Set(norm).size);
console.log(`Resultado: ${failures.length?'FAIL':'PASS'} (${failures.length} fallos de ${7+2} controles).`);if(failures.length)process.exitCode=1;
