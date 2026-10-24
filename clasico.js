// MODO CLASICO: el Cerebro adivina el personaje que pensó el jugador (respuestas de 5 niveles).
(function(){
const PESO={si:[1,.03],no:[.03,1],psi:[1,.35],pno:[.35,1],nose:[1,1]}; // [personaje cumple, no cumple]
const val=(L,q,p)=>Sugeridor.val(L,q,p);
function nuevo(ps){return{ps,w:ps.map(()=>1),asked:new Set(),log:[],rech:new Set(),n:0}}
function pregunta(s,L){
  const totalPeso=s.w.reduce((a,b)=>a+b,0);if(!totalPeso)return null;
  const facts=s.log.filter(r=>r&&['si','no'].includes(r.a)).map(r=>({texto:r.q,answer:r.a==='si'}));
  const contextual=Sugeridor.preguntasContextuales?Sugeridor.preguntasContextuales(L,facts,s.n):[];
  const pool=[...new Set([...contextual,...Sugeridor.POOL])];
  let c=[];
  // v3.13.78: si ninguna pregunta cumple la cobertura habitual (.58), se relaja de a poco
  // antes de rendirse: preferible preguntar algo parcialmente informativo que adivinar a ciegas.
  for(const minCob of [.58,.3,.12]){
    c=[];const vistos=new Set();
    for(let orden=0;orden<pool.length;orden++){
      const q=pool[orden],key=L.normalizar(q);if(s.asked.has(key)||vistos.has(key))continue;vistos.add(key);
      if(esRedundante(s,L,q))continue; // v3.13.78: no repetir ni preguntar lo que ya se deduce
      let si=0,no=0,coberturaPeso=0;
      s.ps.forEach((p,i)=>{const w=s.w[i]||0;if(w<=0)return;const v=Sugeridor.val(L,q,p);if(v===null)return;coberturaPeso+=w;if(v)si+=w;else no+=w});
      const cobertura=coberturaPeso/totalPeso;
      // Una pregunta solo puede decidir el rumbo si hay evidencia suficiente
      // entre los candidatos que siguen vivos. Los desconocidos no cuentan como NO.
      if(cobertura<minCob||si<=1e-9||no<=1e-9)continue;
      const equilibrio=1-Math.abs(si-no)/coberturaPeso;
      const contextualBonus=orden<contextual.length?.025:0;
      c.push({q,score:cobertura*(equilibrio*.86+.14)+contextualBonus,orden});
    }
    if(c.length)break;
  }
  c.sort((a,b)=>b.score-a.score||a.orden-b.orden);

  // Elegir la mejor división real, no una de las tres primeras al azar.
  return c[0]?.q||null;
}
function responder(s,L,q,a){const nq=L.normalizar(q);s.asked.add(nq);s.n++;s.log.push({q,a});const[x,y]=PESO[a]||PESO.nose;s.ps.forEach((p,i)=>{const v=val(L,q,p);if(v===null||a==='nose'){s.w[i]*=1;return}if(a==='psi'){s.w[i]*=v?1:.35;return}if(a==='pno'){s.w[i]*=v?.35:1;return}s.w[i]*=v?x:y});const max=Math.max(0,...s.w);if(max>0&&Number.isFinite(max))s.w=s.w.map(w=>w/max)}
function mejor(s){let bi=-1,bw=0,tot=0;s.w.forEach((w,i)=>{tot+=w;if(w>bw){bw=w;bi=i}});return bi<0?null:{i:bi,p:s.ps[bi],conf:bw/tot}}
function debeAdivinar(s){
  const m=mejor(s);if(!m||s.n<12)return false;
  const orden=s.w.map((w,i)=>({w,i})).filter(x=>x.w>0).sort((a,b)=>b.w-a.w);
  const total=orden.reduce((a,x)=>a+x.w,0),confianza=total?m.conf:0;
  const segunda=total&&orden.length>1?orden[1].w/total:0,ventaja=confianza-segunda;
  // No adivinar por una coincidencia temprana: exigir margen y dar tiempo a
  // que otras preguntas confirmen la hipótesis. El límite absoluto sigue en 20.
  if(s.n>=16)return confianza>=.76&&ventaja>=.28;
  if(s.n>=13)return confianza>=.84&&ventaja>=.34;
  return confianza>=.91&&ventaja>=.42;
}
function rechazar(s,i){s.rech.add(i);s.w[i]=0;const total=s.w.reduce((a,b)=>a+b,0);if(total>0)s.w=s.w.map(w=>w/total)}
const frase=q=>'¿Tu personaje '+q.charAt(1).toLowerCase()+q.slice(2);

// ---------- v3.13.78: preguntas no redundantes y razonamiento visible ----------
// Todo lo siguiente es ADITIVO: no cambia pesos, respuestas ni la decisión de adivinar.
const CONC=[
 ['real',/\b(persona real|es real|existio|de verdad)\b/],
 ['ficticio',/\b(ficticio|ficcion|imaginario|inventado)\b/],
 ['humano',/\b(humano|ser humano)\b/],
 ['animal',/\b(animal|mascota|bestia)\b/],
 ['mujer',/\b(mujer|femenin[oa])\b/],
 ['hombre',/\b(hombre|varon|masculino)\b/],
 ['vivo',/\b(vivo|viva|con vida)\b/],
 ['magia',/\b(magia|magico|magica|mago|hechic\w+)\b/],
 ['poderes',/\b(super ?poderes|poderes|habilidades sobrenaturales)\b/],
 ['franq:marvel',/\bmarvel\b/],['franq:dc',/\bdc\b/],['franq:starwars',/star wars/],
 ['franq:hp',/harry potter/],['franq:anime',/\b(anime|manga)\b/],['franq:disney',/\bdisney\b/],
 ['franq:pokemon',/\bpokemon\b/],['franq:tolkien',/\b(tolkien|senor de los anillos)\b/],
 ['geo:europa',/\beuropa\b/],['geo:america',/\bamerica\b/],['geo:asia',/\b(asia|asiatic[oa])\b/],
 ['geo:africa',/\bafrica\b/],['geo:oceania',/\boceania\b/]
];
const GRUPO={real:'tipo',ficticio:'tipo',hombre:'genero',mujer:'genero'};
function conceptoDe(L,q){const t=L.normalizar(q);for(const[k,re]of CONC)if(re.test(t))return k;return null}
// Hechos firmes (SÍ/NO) ya establecidos por el jugador, por concepto.
function hechosFirmes(L,log){const f={};for(const r of log||[]){if(!r||(r.a!=='si'&&r.a!=='no'))continue;const c=conceptoDe(L,r.q);if(c)f[c]=(r.a==='si')}return f}
// Lo que ya se deduce de esos hechos, sin necesidad de preguntarlo.
function implicados(f){
  const imp={},set=(k,v)=>{if(!(k in f)&&!(k in imp))imp[k]=v};
  if('real' in f){set('ficticio',!f.real);if(f.real){set('poderes',false);set('magia',false);CONC.forEach(([k])=>{if(k.startsWith('franq:'))set(k,false)})}}
  if('ficticio' in f)set('real',!f.ficticio);
  if(f.poderes===false)set('magia',false);
  if(f.hombre===true)set('mujer',false);
  if(f.mujer===true)set('hombre',false);
  if(f.humano===true)set('animal',false);
  if(f.animal===true)set('humano',false);
  for(const pref of['franq:','geo:']){
    const si=Object.keys(f).filter(k=>k.startsWith(pref)&&f[k]===true);
    if(si.length)CONC.forEach(([k])=>{if(k.startsWith(pref)&&!si.includes(k))set(k,false)});
  }
  return imp;
}
// ¿Esta pregunta repite o ya está respondida por lo que el jugador contestó?
function esRedundante(s,L,q){
  const c=conceptoDe(L,q);if(!c)return false;
  for(const r of s.log||[]){if(r&&conceptoDe(L,r.q)===c)return true} // mismo concepto ya preguntado, con la respuesta que sea
  const imp=implicados(hechosFirmes(L,s.log));
  return c in imp;
}
const unir=a=>a.length<=1?(a[0]||''):a.slice(0,-1).join(', ')+' y '+a[a.length-1];
const clausula=q=>{const t=String(q).replace(/[¿?]/g,'').trim();return t.charAt(0).toLowerCase()+t.slice(1)};
const elegir=(arr,rnd)=>arr[Math.floor((rnd||Math.random)()*arr.length)%arr.length];
const activos=s=>s.w.filter(w=>w>.12).length;
// Frase corta sobre el rumbo del interrogatorio. Máx. 3 por partida; solo dice cosas ciertas del estado real.
function nota(s,L,q,rnd){
  s.notas=s.notas||{};
  const m=mejor(s);if(!m)return null;
  const hechos=Object.entries(hechosFirmes(L,s.log));
  if(!s.notas.e1&&s.n>=7&&hechos.length>=3){
    s.notas.e1=1;
    const claves=s.log.filter(r=>r&&(r.a==='si'||r.a==='no')).slice(0,3).map(r=>r.a==='si'?clausula(r.q):'no '+clausula(r.q));
    return elegir([
      `Voy armando el cuadro: ${unir(claves)}. Eso me deja unos ${activos(s)} sospechosos. Todavía tengo trabajo, pero avanzo.`,
      `Ya sé que ${unir(claves)}. Quedan unos ${activos(s)} sospechosos en mi lista. Mortal, empiezo a ver el patrón.`
    ],rnd);
  }
  if(!s.notas.h&&s.n>=8&&m.conf>=.3&&val(L,q,m.p)===true){
    s.notas.h=1;
    return elegir([
      'Empiezo a tener una corazonada. Esta pregunta sirve para ponerla a prueba.',
      'Hay una hipótesis tomando forma en mi cabeza. Veamos si esta pregunta la sostiene.'
    ],rnd);
  }
  if(!s.notas.e2&&s.n>=13&&activos(s)<=8){
    s.notas.e2=1;
    return elegir([
      `Mi lista se achicó: quedan ${activos(s)} candidatos plausibles. La siguiente respuesta pesa mucho.`,
      `Ya casi: ${activos(s)} candidatos siguen en pie. Cuidado con lo que contestás.`
    ],rnd);
  }
  return null;
}
// Explica el intento con las respuestas reales que más descartaron y que el candidato cumple.
function razonar(s,L,m,rnd){
  if(!m||!m.p)return null;
  const hs=[];
  (s.log||[]).forEach(r=>{
    if(!r||!['si','no','psi','pno'].includes(r.a))return;
    const v=val(L,r.q,m.p);if(v===null)return;
    const afirma=(r.a==='si'||r.a==='psi');if(v!==afirma)return; // si la ficha no coincide, no se usa como argumento
    let elim=0;s.ps.forEach(p=>{const x=val(L,r.q,p);if(x!==null&&x!==afirma)elim++});
    hs.push({q:r.q,a:r.a,elim,c:conceptoDe(L,r.q)});
  });
  hs.sort((a,b)=>b.elim-a.elim);
  const firmes=hs.filter(h=>h.a==='si'||h.a==='no');
  const base=firmes.length>=3?firmes:hs;
  const vistos=new Set(),el=[];
  for(const h of base){const g=GRUPO[h.c]||h.c||h.q;if(vistos.has(g))continue;vistos.add(g);el.push(h);if(el.length>=4)break}
  if(!el.length)return null;
  const partes=el.map(h=>{const c=clausula(h.q);return h.a==='si'?c:h.a==='no'?'no '+c:h.a==='psi'?'probablemente '+c:'probablemente no '+c});
  const n=activos(s);
  const cierre=n<=1
    ?`Solo ${m.p.nombre} encaja con todo eso.`
    :`Quedan ${n} posibles y ${m.p.nombre} es el que mejor encaja. Es una apuesta, pero no al azar.`;
  return `Así llegué hasta acá: sé que ${unir(partes)}. ${cierre}`;
}
function notaFallo(s,nombre){return `No era ${nombre}. Lo tacho de mi lista y rehago mis cuentas con todo lo que ya me dijiste.`}

const C={nuevo,pregunta,responder,mejor,debeAdivinar,rechazar,frase,esRedundante,nota,razonar,notaFallo};
if(typeof module!=='undefined'&&module.exports)module.exports=C;else window.Clasico=C;
})();
