// MODO CLASICO: el Cerebro adivina el personaje que pensó el jugador (respuestas de 5 niveles).
(function(){
const PESO={si:[1,.03],no:[.03,1],psi:[1,.35],pno:[.35,1],nose:[1,1]}; // [personaje cumple, no cumple]
const val=(L,q,p)=>Sugeridor.val(L,q,p);
function nuevo(ps){return{ps,w:ps.map(()=>1),asked:new Set(),log:[],rech:new Set(),n:0}}
function pregunta(s,L){
  const totalPeso=s.w.reduce((a,b)=>a+b,0);if(!totalPeso)return null;
  const facts=s.log.filter(r=>r&&['si','no'].includes(r.a)).map(r=>({texto:r.q,answer:r.a==='si'}));
  const contextual=Sugeridor.preguntasContextuales?Sugeridor.preguntasContextuales(L,facts,s.n):[];
  const pool=[...new Set([...contextual,...Sugeridor.POOL])],c=[];
  const vistos=new Set();
  for(let orden=0;orden<pool.length;orden++){
    const q=pool[orden],key=L.normalizar(q);if(s.asked.has(key)||vistos.has(key))continue;vistos.add(key);
    let si=0,no=0,coberturaPeso=0;
    s.ps.forEach((p,i)=>{const w=s.w[i]||0;if(w<=0)return;const v=Sugeridor.val(L,q,p);if(v===null)return;coberturaPeso+=w;if(v)si+=w;else no+=w});
    const cobertura=coberturaPeso/totalPeso;
    // Una pregunta solo puede decidir el rumbo si hay evidencia suficiente
    // entre los candidatos que siguen vivos. Los desconocidos no cuentan como NO.
    if(cobertura<.58||si<=1e-9||no<=1e-9)continue;
    const equilibrio=1-Math.abs(si-no)/coberturaPeso;
    const contextualBonus=orden<contextual.length?.025:0;
    c.push({q,score:cobertura*(equilibrio*.86+.14)+contextualBonus,orden});
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
const C={nuevo,pregunta,responder,mejor,debeAdivinar,rechazar,frase};
if(typeof module!=='undefined'&&module.exports)module.exports=C;else window.Clasico=C;
})();
