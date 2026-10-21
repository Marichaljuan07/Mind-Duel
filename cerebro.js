// CEREBRO - aprendizaje determinista: lenguaje -> concepto.
// No inventa hechos: los SI/NO salen siempre del motor y los datos del personaje.
(function(){
const KEY='mind_aprendido', FAIL='mind_oraculo_fallos', UMBRAL=0.8, mem={};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}}};
const STOP=new Set('es el la los las un una de del que tu su se a en y o lo al por con para le era fue esta ser'.split(' '));
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[¿?¡!.,;:]/g,'').replace(/\s+/g,' ').trim();
const toks=s=>norm(s).split(' ').filter(w=>w&&!STOP.has(w));
function lev(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1)}return d[m][n]}
const simPal=(a,b)=>1-lev(a,b)/Math.max(a.length,b.length);
function simFrase(x,y){const A=toks(x),B=toks(y);if(!A.length||!B.length)return 0;let hit=0;for(const t of A){let best=0;for(const u of B)best=Math.max(best,simPal(t,u));if(best>=0.8)hit+=best}return 2*hit/(A.length+B.length)}
let semilla={},cargada=false;
async function cargar(){if(cargada)return;cargada=true;try{const r=await fetch('aprendido_semilla.json');if(r.ok)semilla=await r.json()}catch(e){}}
const local=()=>{try{return JSON.parse(store.get(KEY)||'{}')}catch(e){return{}}};
const aprendido=()=>Object.assign({},semilla,local());
function fallos(){const m={};try{for(const f of JSON.parse(store.get(FAIL)||'[]')){const k=norm(f.pregunta);m[k]=m[k]||{pregunta:f.pregunta,veces:0};m[k].veces++}}catch(e){}return Object.values(m).sort((a,b)=>b.veces-a.veces)}
function quitarFallo(frase){try{const q=norm(frase);store.set(FAIL,JSON.stringify(JSON.parse(store.get(FAIL)||'[]').filter(x=>norm(x.pregunta)!==q)))}catch(e){}}
function ensenar(frase,concepto,auto){const l=local();l[norm(frase)]={c:concepto,auto:!!auto,t:Date.now()};store.set(KEY,JSON.stringify(l));if(!auto)quitarFallo(frase)}
function olvidar(frase){const l=local();delete l[norm(frase)];store.set(KEY,JSON.stringify(l))}
async function intentar(pregunta,base){
  await cargar();const q=norm(pregunta);if(!q)return null;const ap=aprendido();
  if(ap[q])return{estado:'aprendido',concepto:ap[q].c,puntos:9,aprendio:false};
  const cand=Object.keys(ap).map(f=>[f,ap[f].c]);
  if(base&&base.conceptos)for(const c in base.conceptos)for(const f of base.conceptos[c].frases)cand.push([f,c]);
  const mejor={};for(const[f,c]of cand){const s=simFrase(q,f);if(s>(mejor[c]||0))mejor[c]=s}
  const o=Object.entries(mejor).sort((a,b)=>b[1]-a[1]);
  if(!o.length||o[0][1]<UMBRAL)return null;
  if(o[1]&&o[1][1]>=UMBRAL&&o[1][1]>=o[0][1]-0.05)return null; // ambiguo: no adivina
  ensenar(q,o[0][0],true);
  return{estado:'aprendido',concepto:o[0][0],puntos:o[0][1]*3,aprendio:true};
}
const exportar=()=>JSON.stringify({version:1,aprendido:local(),fallos:fallos()},null,2);
function importar(t){const d=JSON.parse(t),n=d.aprendido||d,l=local();Object.assign(l,n);store.set(KEY,JSON.stringify(l));return Object.keys(n).length}
const Cerebro={intentar,ensenar,olvidar,fallos,quitarFallo,exportar,importar,aprendido,norm,simFrase,_mem:mem,_setSemilla(o){semilla=o;cargada=true}};
if(typeof module!=='undefined'&&module.exports)module.exports=Cerebro;else window.Cerebro=Cerebro;
})();
