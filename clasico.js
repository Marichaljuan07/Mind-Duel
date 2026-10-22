// MODO CLASICO: el Cerebro adivina el personaje que pensó el jugador (respuestas de 5 niveles).
(function(){
const PESO={si:[1,.03],no:[.03,1],psi:[1,.35],pno:[.35,1],nose:[1,1]}; // [personaje cumple, no cumple]
const val=(L,q,p)=>Sugeridor.val(L,q,p);
function nuevo(ps){return{ps,w:ps.map(()=>1),asked:new Set(),log:[],rech:new Set(),n:0}}
function pregunta(s,L){const tot=s.w.reduce((a,b)=>a+b,0),c=[];if(!tot)return null;
  for(const q of Sugeridor.POOL){if(s.asked.has(L.normalizar(q)))continue;let si=0,no=0,conocidos=0;
    s.ps.forEach((p,i)=>{if(s.w[i]<=0)return;const v=Sugeridor.val(L,q,p);if(v===null)return;conocidos++;if(v)si+=s.w[i];else no+=s.w[i]});
    const conocidosPeso=si+no;if(si>1e-8&&no>1e-8){const equilibrio=1-Math.abs(si/conocidosPeso-.5)*2;const cobertura=conocidos/Math.max(1,s.ps.length);c.push({q,score:equilibrio*.85+cobertura*.15})}}
  c.sort((a,b)=>b.score-a.score);if(!c.length)return null;
  // Elige entre las mejores preguntas para evitar que cada partida siga idéntico orden.
  const top=c.slice(0,Math.min(3,c.length));return top[Math.floor(Math.random()*top.length)].q}
function responder(s,L,q,a){const nq=L.normalizar(q);s.asked.add(nq);s.n++;s.log.push({q,a});const[x,y]=PESO[a]||PESO.nose;s.ps.forEach((p,i)=>{const v=val(L,q,p);if(v===null){s.w[i]*=1;return}if(a==='nose'){s.w[i]*=1;return}if(a==='psi'){s.w[i]*=v?1:.35;return}if(a==='pno'){s.w[i]*=v?.35:1;return}s.w[i]*=v?x:y})}
function mejor(s){let bi=-1,bw=0,tot=0;s.w.forEach((w,i)=>{tot+=w;if(w>bw){bw=w;bi=i}});return bi<0?null:{i:bi,p:s.ps[bi],conf:bw/tot}}
function debeAdivinar(s){const m=mejor(s);if(!m)return false;const orden=s.w.map((w,i)=>({w,i})).filter(x=>x.w>0).sort((a,b)=>b.w-a.w);const total=orden.reduce((a,x)=>a+x.w,0);const confianza=total?m.conf:0;const segunda=total&&orden.length>1?orden[1].w/total:0;const ventaja=confianza-segunda;
  // El director exige evidencia fuerte al principio; con muchas preguntas puede arriesgar más.
  return confianza>=.90||(s.n>=4&&confianza>=.76&&ventaja>=.34)||(s.n>=12&&confianza>=.60&&ventaja>=.22)||s.n>=18}
function rechazar(s,i){s.rech.add(i);s.w[i]=0;const total=s.w.reduce((a,b)=>a+b,0);if(total>0)s.w=s.w.map(w=>w/total)}
const frase=q=>'¿Tu personaje '+q.charAt(1).toLowerCase()+q.slice(2);
const C={nuevo,pregunta,responder,mejor,debeAdivinar,rechazar,frase};
if(typeof module!=='undefined'&&module.exports)module.exports=C;else window.Clasico=C;
})();
