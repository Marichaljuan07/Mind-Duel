// MODO CLASICO: el Cerebro adivina el personaje que pensó el jugador (respuestas de 5 niveles).
(function(){
const PESO={si:[1,.03],no:[.03,1],psi:[1,.35],pno:[.35,1],nose:[1,1]}; // [personaje cumple, no cumple]
const val=(L,q,p)=>!!Sugeridor.val(L,q,p);
function nuevo(ps){return{ps,w:ps.map(()=>1),asked:new Set(),log:[],rech:new Set(),n:0}}
function pregunta(s,L){const tot=s.w.reduce((a,b)=>a+b,0),c=[];
  for(const q of Sugeridor.POOL){if(s.asked.has(q))continue;let y=0;s.ps.forEach((p,i)=>{if(s.w[i]>0&&val(L,q,p))y+=s.w[i]});
    if(y>1e-6&&tot-y>1e-6)c.push({q,d:Math.abs(y/tot-.5)})}
  c.sort((a,b)=>a.d-b.d);if(!c.length)return null;const t=c.slice(0,2);return t[Math.floor(Math.random()*t.length)].q}
function responder(s,L,q,a){s.asked.add(q);s.n++;s.log.push({q,a});const[x,y]=PESO[a];s.ps.forEach((p,i)=>{s.w[i]*=val(L,q,p)?x:y})}
function mejor(s){let bi=-1,bw=0,tot=0;s.w.forEach((w,i)=>{tot+=w;if(w>bw){bw=w;bi=i}});return bi<0?null:{i:bi,p:s.ps[bi],conf:bw/tot}}
function debeAdivinar(s){const m=mejor(s);return !!m&&(m.conf>=.6||(s.n>=12&&m.conf>=.35)||s.n>=18)}
function rechazar(s,i){s.rech.add(i);s.w[i]=0}
const frase=q=>'¿Tu personaje '+q.charAt(1).toLowerCase()+q.slice(2);
const C={nuevo,pregunta,responder,mejor,debeAdivinar,rechazar,frase};
if(typeof module!=='undefined'&&module.exports)module.exports=C;else window.Clasico=C;
})();
