// SUGERIDOR - sugerencias coherentes con lo que el jugador YA descubrió.
// Solo usa las respuestas que el jugador vio: nunca filtra al personaje secreto.
(function(){
const SUG_CONCEPTO={'¿Es filósofo?':'filosofo','¿Es un rey?':'rey','¿Usa arco?':'tiene_arco','¿Es pacifista?':'pacifista','¿Es rico?':'rico','¿Es inmortal?':'inmortal','¿Puede volar?':'vuela','¿Usa espada?':'usa_espada','¿Es de la Antigüedad?':'antiguedad','¿Es de la Edad Media?':'medieval','¿Ganó un Nobel?':'premio_nobel','¿Es detective?':'detective','¿Es político?':'politico','¿Es militar?':'militar','¿Es un dios?':'dios','¿Es de Asia?':'region_asia','¿Ganó algún premio?':'premios'};
const POOL=['¿Es una persona real?','¿Es ficticio?','¿Es una mujer?','¿Es un hombre?','¿Sigue con vida?','¿Es humano?','¿Es de Europa?','¿Es de América?','¿Es científico?','¿Es artista?','¿Es escritor?','¿Es un superhéroe?','¿Tiene poderes?','¿Usa magia?','¿Aparece en películas?','¿Aparece en libros?','¿Aparece en cómics?','¿Es de Marvel?','¿Es de DC Comics?','¿Es de Harry Potter?','¿Es de Star Wars?'].concat(Object.keys(SUG_CONCEPTO));
const VAL_CACHE=new WeakMap();
const val=(L,q,p)=>{if(!p||typeof p!=='object'){const c=SUG_CONCEPTO[q];return c?L.resolverConcepto(c,p):L.evaluarPregunta(q,p)}let m=VAL_CACHE.get(p);if(!m){m=new Map();VAL_CACHE.set(p,m)}if(m.has(q))return m.get(q);const c=SUG_CONCEPTO[q],v=c?L.resolverConcepto(c,p):L.evaluarPregunta(q,p);m.set(q,v);return v};
function consistentes(L,ps,facts){return ps.filter(p=>facts.every(f=>{const v=f.concepto?L.resolverConcepto(f.concepto,p):L.evaluarPregunta(f.texto,p);return v===null||v===f.answer}))}
function sugerir(L,ps,facts,asked,n,turno){
  n=Math.max(1,Number(n)||5);
  turno=Math.max(0,Number(turno)||facts.length);
  const rest=consistentes(L,ps,facts),base=rest.length?rest:(facts.length?[]:ps),cand=[];
  // En la primera etapa disponible, mantener las preguntas amplias: no orientar
  // prematuramente hacia una categoría llamativa o una identidad probable.
  const amplias=new Set(['¿Es una persona real?','¿Es ficticio?','¿Es humano?','¿Es una mujer?','¿Es un hombre?','¿Sigue con vida?','¿Es de Europa?','¿Es de América?']);
  const preguntas=turno<8?POOL.filter(q=>amplias.has(q)):POOL;
  if(!base.length)return [];
  const yaPreguntadas=asked instanceof Set?asked:new Set(asked||[]);
  for(let indice=0;indice<preguntas.length;indice++){const q=preguntas[indice];if(yaPreguntadas.has(L.normalizar(q)))continue;let si=0,no=0,desconocidos=0;
    for(const p of base){const v=val(L,q,p);if(v===null){desconocidos++;continue}if(v)si++;else no++}
    const tot=si+no;
    // Una pregunta solo sirve si separa candidatos conocidos en ambos grupos.
    if(tot>=2&&si>0&&no>0){const proporcion=si/tot;const equilibrio=1-Math.abs(proporcion-.5)*2;const cobertura=tot/base.length;
      cand.push({q,score:equilibrio*.82+ cobertura*.18,indice})}
  }
  // Orden estable y reproducible: mejores divisiones y mayor cobertura primero.
  cand.sort((a,b)=>b.score-a.score||a.indice-b.indice);
  return cand.slice(0,n).map(x=>x.q)}
function resueltos(L,ps,facts){const rest=consistentes(L,ps,facts);if(!rest.length)return 0;
  return['tipo_real','genero_hombre','humano'].filter(c=>{const v=L.resolverConcepto(c,rest[0]);return rest.every(p=>L.resolverConcepto(c,p)===v)}).length}
// Se habilita al conocer lo básico (real/ficticio, género, humano) o, si no, tras 5 preguntas.
function desbloqueada(L,ps,facts){return Array.isArray(facts)&&facts.length>=5}
const S={sugerir,consistentes,POOL,resueltos,desbloqueada,val};
if(typeof module!=='undefined'&&module.exports)module.exports=S;else window.Sugeridor=S;
})();
