// Simula al jugador respondiendo con honestidad por CADA personaje y mide si el Cerebro lo adivina.
global.Sugeridor=require('./sugeridor.js');const L=require('./motor_logico.js'),C=require('./clasico.js'),P=require('./personajes.js');
let ok=0,tot=0,sum=0;const fallos=[];
for(const p of P){const s=C.nuevo(P);let fails=0,res=null;
 for(let it=0;it<60&&res===null;it++){
  if(C.debeAdivinar(s)||s.n>=20){const m=C.mejor(s);if(!m){res=false;break}
   if(m.p===p)res=true;else{C.rechazar(s,m.i);fails++;if(fails>=3)res=false}}
  else{const q=C.pregunta(s,L);if(!q){const m=C.mejor(s);if(m&&m.p===p)res=true;else res=false;break}
   C.responder(s,L,q,!!Sugeridor.val(L,q,p)?'si':'no')}}
 tot++;if(res){ok++;sum+=s.n}else fallos.push(p.nombre+' (confundido con '+(C.mejor(s)?C.mejor(s).p.nombre:'nadie')+')')}
console.log(`Clásico: adivinó ${ok}/${tot} (${Math.round(100*ok/tot)}%), promedio ${(sum/ok).toFixed(1)} preguntas`);
if(fallos.length)console.log('No adivinó:\n - '+fallos.join('\n - '));
process.exitCode=ok/tot>=.8?0:1;
