#!/usr/bin/env node
// AUDITORIA del oráculo: pasa un banco de preguntas por el MISMO camino que el juego
// (motor -> oráculo -> Cerebro) contra todos los personajes y mide si responde lo que se preguntó.
// Uso: node auditoria.js [banco_preguntas.json]
const fs=require('fs'),vm=require('vm'),path=require('path');
const store={};global.window={};global.localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}};
global.fetch=async u=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(__dirname,u),'utf8'))});
const L=require('./motor_logico.js');window.Cerebro=require('./cerebro.js');
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'oraculo_local.js'),'utf8'));
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'personajes.js'),'utf8')+';globalThis.__P=PERSONAJES;',c);const P=c.__P;
const banco=JSON.parse(fs.readFileSync(path.join(__dirname,process.argv[2]||'banco_preguntas.json'),'utf8')),ok=new Set(L.CONCEPTOS_PERMITIDOS);
async function responder(q,p){let a=L.evaluarPregunta(q,p),via='motor';if(a===null){const r=await window.OraculoLocal.interpretar(q);if(r&&ok.has(r.concepto)){a=L.resolverConcepto(r.concepto,p);via='oraculo:'+r.concepto}}return{a,via}}
(async()=>{let bien=0,mal=0,sin=0,tot=0;const fallos=[];
 for(const[k,qs]of Object.entries(banco.preguntas)){const esp=k.trim();
  for(const q of qs){tot++;let bad=0,nul=0,via='';
   for(const p of P){const{a,via:v}=await responder(q,p);via=v;if(a===null)nul++;else if(a!==L.resolverConcepto(esp,p))bad++}
   if(nul===P.length){sin++;fallos.push('NO ENTIENDE  '+q+'  (esperaba '+esp+')')}else if(bad||nul){mal++;fallos.push('RESPONDE MAL '+q+'  (esperaba '+esp+', usó '+via+', '+bad+' personajes mal)')}else bien++}}
 let fp=0;const fpl=[];for(const q of banco.fuera){let n=0;for(const p of P){const{a}=await responder(q,p);if(a!==null)n++}if(n){fp++;fpl.push('RESPONDIÓ LO QUE NO SABE: '+q)}}
 console.log(`PREGUNTAS: ${tot}\n  bien: ${bien} (${Math.round(100*bien/tot)}%)\n  responde mal: ${mal}\n  no entiende: ${sin}\nFUERA DE TEMA respondidas por error: ${fp}/${banco.fuera.length}`);
 [...fallos,...fpl].slice(0,45).forEach(x=>console.log(' -',x));process.exitCode=(mal||fp)?1:0})();
