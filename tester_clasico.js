// Diagnóstico sintético del modo Clásico. Los hechos desconocidos se dejan como desconocidos; no es una certificación de precisión hasta completar las fichas.
global.Sugeridor=require('./sugeridor.js');const L=require('./motor_logico.js'),C=require('./clasico.js'),fs=require('fs'),vm=require('vm');const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('./personajes.js','utf8')+';globalThis.__P=PERSONAJES;',ctx);const P=ctx.__P;
let ok=0,tot=0,sum=0,unscored=0;const fallos=[];let procesados=0;
for(const p of P){const s=C.nuevo(P);let fails=0,res=null;
 let unknownTargetFact=false; for(let it=0;it<60&&res===null;it++){
  if(C.debeAdivinar(s)||s.n>=20){const m=C.mejor(s);if(!m){res=false;break}
   if(m.p===p)res=true;else{C.rechazar(s,m.i);fails++;if(fails>=3)res=false}}
  else{const q=C.pregunta(s,L);if(!q){const m=C.mejor(s);if(m&&m.p===p)res=true;else res=false;break}
   {const v=Sugeridor.val(L,q,p);if(v===null)unknownTargetFact=true;C.responder(s,L,q,v===null?'nose':v?'si':'no')}}}
 procesados++;if(unknownTargetFact){unscored++;}else{tot++;if(res){ok++;sum+=s.n}else fallos.push(p.nombre+' (confundido con '+(C.mejor(s)?C.mejor(s).p.nombre:'nadie')+')');}if(procesados%1===0||procesados===P.length)console.log(`Progreso: ${procesados}/${P.length} | aciertos ${ok}`)}
console.log(`Clásico (solo partidas con respuestas verificables): adivinó ${ok}/${tot} (${Math.round(100*ok/Math.max(1,tot))}%), promedio ${(sum/Math.max(1,ok)).toFixed(1)} preguntas; ${unscored} partidas sin verdad suficiente en la ficha (no puntuadas).`);
if(fallos.length)console.log('No adivinó:\n - '+fallos.join('\n - '));
// Diagnóstico de cobertura: los personajes con hechos no cargados no son puntuables.
process.exitCode=0;
