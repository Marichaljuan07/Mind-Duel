#!/usr/bin/env node
// ENTRENADOR del Cerebro (Termux / Node).  Uso:  node entrenador.js [entrenamiento.json]
// Formato: { "concepto": ["frase 1", "frase 2"], ... }
// Qué hace: enseña cada frase con su concepto, guarda todo en aprendido_semilla.json
// (que viaja con el juego) y prueba qué tan bien resiste errores de tipeo.
const fs=require('fs'),path=require('path'),Cerebro=require('./cerebro.js'),Logic=require('./motor_logico.js');
const rd=f=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8'));
const base=rd('oraculo_base_v3_2.json'),datos=rd(process.argv[2]||'entrenamiento.json');
let semilla={};try{semilla=rd('aprendido_semilla.json')}catch(e){}
const validos=new Set(Logic.CONCEPTOS_PERMITIDOS);
const tipeo=f=>{const w=Cerebro.norm(f).split(' ').sort((a,b)=>b.length-a.length)[0];if(w.length<5)return null;const i=Math.floor(w.length/2);return Cerebro.norm(f).replace(w,w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2))};
(async()=>{
 Cerebro._setSemilla(semilla);const r={ya:0,parecido:0,ensenadas:0,corregidas:0},malos=[];
 for(const[c,fs_]of Object.entries(datos)){if(!validos.has(c)){malos.push(c);continue}
  for(const f of fs_){const x=await Cerebro.intentar(f,base);
   if(x&&x.concepto===c)x.aprendio?r.parecido++:r.ya++;else{Cerebro.ensenar(f,c);x?r.corregidas++:r.ensenadas++}}}
 const nuevo=JSON.parse(Cerebro._mem.mind_aprendido||'{}'),todo=Object.assign({},semilla);
 for(const k in nuevo)todo[k]={c:nuevo[k].c,auto:!!nuevo[k].auto};
 fs.writeFileSync(path.join(__dirname,'aprendido_semilla.json'),JSON.stringify(todo,null,1));
 delete Cerebro._mem.mind_aprendido;Cerebro._setSemilla(todo);
 let ok=0,tot=0;const fallos=[];
 for(const[c,fs_]of Object.entries(datos)){if(!validos.has(c))continue;for(const f of fs_){const v=tipeo(f);if(!v)continue;tot++;const x=await Cerebro.intentar(v,base);x&&x.concepto===c?ok++:fallos.push(v+'  (esperaba '+c+')')}}
 console.log('ENTRENAMIENTO\n  ya las entendía:',r.ya,'\n  aprendidas por parecido:',r.parecido,'\n  enseñadas (no entendía):',r.ensenadas,'\n  corregidas (entendía otra cosa):',r.corregidas);
 if(malos.length)console.log('  conceptos inválidos (ignorados):',malos.join(', '));
 console.log('\nSEMILLA: '+Object.keys(todo).length+' frases guardadas en aprendido_semilla.json');
 console.log('\nPRUEBA DE TIPEOS: '+ok+'/'+tot+' entendidas'+(fallos.length?'\n  fallaron:\n   '+fallos.slice(0,10).join('\n   '):''));
})();
