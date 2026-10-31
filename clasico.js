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
  // v3.13.82: con un único sospechoso no se hacen preguntas de relleno: se lo pone a prueba.
  if((s.verif||0)<2&&s.n>=4&&activos(s)<=1){
    const v=preguntaVerificacion(s,L,pool);
    if(v){s.verif=(s.verif||0)+1;(s.verifQs=s.verifQs||[]).push(v);return v}
  }
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
      if(minCob<.58){ // v3.13.78: en las pasadas relajadas, solo sirve si separa a los líderes
        let lSi=0,lNo=0;const mxL=maxPeso(s);s.ps.forEach((p,i)=>{if((s.w[i]||0)<.5*mxL)return;const v=Sugeridor.val(L,q,p);if(v===null)return;if(v)lSi++;else lNo++});
        if(!lSi||!lNo)continue;
      }
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
  if(c[0])return c[0].q;
  // v3.13.82: sin ninguna pregunta que separe, antes de arriesgarse se verifica la hipótesis (máx. 2).
  if((s.verif||0)<2&&activos(s)<=2){ // con varios empatados no se verifica a uno solo: eso sería adivinar por pregunta
    const v=preguntaVerificacion(s,L,pool);
    if(v){s.verif=(s.verif||0)+1;(s.verifQs=s.verifQs||[]).push(v);return v}
  }
  return null;
}
function responderBase(s,L,q,a){const nq=L.normalizar(q);s.asked.add(nq);s.n++;s.log.push({q,a});const[x,y]=PESO[a]||PESO.nose;s.ps.forEach((p,i)=>{const v=val(L,q,p);if(v===null||a==='nose'){s.w[i]*=1;return}if(a==='psi'){s.w[i]*=v?1:.35;return}if(a==='pno'){s.w[i]*=v?.35:1;return}s.w[i]*=v?x:y});const max=Math.max(0,...s.w);if(max>0&&Number.isFinite(max))s.w=s.w.map(w=>w/max)}
function mejor(s){let bi=-1,bw=0,tot=0;s.w.forEach((w,i)=>{tot+=w;if(w>bw){bw=w;bi=i}});return bi<0?null:{i:bi,p:s.ps[bi],conf:bw/tot}}
function debeAdivinarBase(s){
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
// Los pesos se normalizan distinto según el momento (por el máximo al responder, por la suma al rechazar),
// así que los umbrales son SIEMPRE relativos al peso máximo actual.
const maxPeso=s=>s.w.reduce((a,b)=>b>a?b:a,0);
const sospechosos=n=>n===1?'un solo sospechoso':'unos '+n+' sospechosos';
const candidatosTxt=n=>n===1?'un solo candidato':n+' candidatos';
const activos=s=>{const mx=maxPeso(s);return mx>0?s.w.filter(w=>w>=.12*mx).length:0};
// Frase corta sobre el rumbo del interrogatorio. Máx. 3 por partida; solo dice cosas ciertas del estado real.
function notaBase(s,L,q,rnd){
  s.notas=s.notas||{};
  const m=mejor(s);if(!m)return null;
  if(s.verifQs&&s.verifQs.includes(q)&&!s.notas.v){
    s.notas.v=1;
    return elegir([
      'Tengo un sospechoso. Esta pregunta es una prueba: si me equivoco, lo sabré enseguida.',
      'Voy a verificar mi sospecha con una pregunta que solo respondería así el personaje correcto.'
    ],rnd);
  }
  const hechos=Object.entries(hechosFirmes(L,s.log));
  if(!s.notas.e1&&s.n>=7&&hechos.length>=3){
    s.notas.e1=1;s.notas.act1=activos(s);
    const claves=s.log.filter(r=>r&&(r.a==='si'||r.a==='no')).slice(0,3).map(r=>r.a==='si'?clausula(r.q):'no '+clausula(r.q));
    return elegir([
      `Voy armando el cuadro: ${unir(claves)}. Eso me deja ${sospechosos(activos(s))}. Todavía tengo trabajo, pero avanzo.`,
      activos(s)===1?`Ya sé que ${unir(claves)}. Queda un solo sospechoso en mi lista. Mortal, empiezo a ver el patrón.`:`Ya sé que ${unir(claves)}. Quedan unos ${activos(s)} sospechosos en mi lista. Mortal, empiezo a ver el patrón.`
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
    s.notas.e2=1;const n=activos(s);
    if(n===1)return elegir([
      'Me queda un solo candidato en pie. Solo necesito confirmarlo.',
      'Un único candidato resiste en mi lista. Veremos si aguanta mis preguntas.'
    ],rnd);
    if(s.notas.act1&&n<s.notas.act1)return elegir([
      `Mi lista se achicó: de ${s.notas.act1} sospechosos pasé a ${n}. La siguiente respuesta pesa mucho.`,
      `Ya casi: bajé de ${s.notas.act1} a ${n} candidatos. Cuidado con lo que contestás.`
    ],rnd);
    return elegir([
      `Sigo con ${candidatosTxt(n)} en pie: tus últimas respuestas no desempataron nada. Necesito una pregunta que sí lo haga.`,
      `Mi lista no se movió: ${n} candidatos siguen empatados. A ver si la próxima pregunta los separa.`
    ],rnd);
  }
  return null;
}
// Máximo 3 comentarios de rumbo por partida (incluida la nota de verificación).
function nota(s,L,q,rnd){
  s.notas=s.notas||{};
  if((s.notas.n||0)>=3)return null;
  const r=notaBase(s,L,q,rnd);
  if(r)s.notas.n=(s.notas.n||0)+1;
  return r;
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
  s.notas=s.notas||{};
  const previo=s.notas.ultimo;s.notas.ultimo=m.p.nombre;
  if(previo&&previo!==m.p.nombre){
    if(n<=1)return `Sin ${previo} en la lista me queda un solo candidato, y es ${m.p.nombre}. Ya no es apuesta: es descarte.`;
    return elegir([
      `Sin ${previo} en la lista me quedan ${n} posibles, y ${m.p.nombre} sigue encajando con todo lo que dijiste. Admito que ya es más apuesta que deducción.`,
      `${previo} cayó, pero no mi orgullo: con ${n} posibles, ${m.p.nombre} es lo que mejor encaja. Esto se parece más a un golpe de intuición que a una deducción.`
    ],rnd);
  }
  const cierre=n<=1
    ?`Solo ${m.p.nombre} encaja con todo eso.`
    :`Quedan ${n} posibles y ${m.p.nombre} es el que mejor encaja. Es una apuesta, pero no al azar.`;
  return `Así llegué hasta acá: sé que ${unir(partes)}. ${cierre}`;
}
// ¿Esta pregunta separa a los candidatos líderes (los que siguen con peso alto)? Si no, no sirve para desempatar.
function separaLideres(s,L,q){
  let a=0,b=0;
  const mx=maxPeso(s);s.ps.forEach((p,i)=>{if((s.w[i]||0)<.5*mx)return;const v=val(L,q,p);if(v===null)return;if(v)a++;else b++});
  return a>0&&b>0;
}
function notaFallo(s,nombre){return 'Ese no era… sigo buscando.'}

// ---------- v3.13.82: verificar la hipótesis, admitir cuando nada encaja ----------
// Pregunta que el sospechoso principal cumpliría (un SÍ lo confirma) y que sea lo más específica posible.
function preguntaVerificacion(s,L,pool){
  const m=mejor(s);if(!m)return null;
  let mejorQ=null,mejorEsp=-1;
  for(const q of pool){
    const key=L.normalizar(q);if(s.asked.has(key)||esRedundante(s,L,q))continue;
    if(val(L,q,m.p)!==true)continue;
    let cumplen=0;for(const p of s.ps)if(val(L,q,p)===true)cumplen++;
    const esp=1/(1+cumplen);
    if(esp>mejorEsp){mejorEsp=esp;mejorQ=q}
  }
  return mejorQ;
}
// Registra si las preguntas de verificación confirmaron o contradijeron al sospechoso.
function responder(s,L,q,a){
  responderBase(s,L,q,a);
  if(s.verifQs&&s.verifQs.includes(q)){
    if(a==='si')s.verifOk=(s.verifOk||0)+1;else if(a==='no')s.verifFail=(s.verifFail||0)+1;
  }
}
// Con un único sospechoso confirmado por 2 verificaciones, no hace falta esperar a la pregunta 12.
function debeAdivinar(s){
  if(debeAdivinarBase(s))return true;
  return (s.verifOk||0)>=2&&!(s.verifFail)&&activos(s)<=1&&s.n>=8;
}
// Cuántas respuestas firmes (SÍ/NO) contradice un personaje.
function contradicciones(s,L,p){
  let n=0;
  for(const r of s.log||[]){if(!r||(r.a!=='si'&&r.a!=='no'))continue;const v=val(L,r.q,p);if(v===null)continue;if(v!==(r.a==='si'))n++}
  return n;
}
function encaje(s,L){const m=mejor(s);return m?{p:m.p,contra:contradicciones(s,L,m.p)}:null}

const C={nuevo,pregunta,responder,mejor,debeAdivinar,rechazar,frase,esRedundante,separaLideres,nota,razonar,notaFallo,encaje,contradicciones,preguntaVerificacion};
if(typeof module!=='undefined'&&module.exports)module.exports=C;else window.Clasico=C;
})();
