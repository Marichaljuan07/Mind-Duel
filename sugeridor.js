// SUGERIDOR - sugerencias coherentes con lo que el jugador YA descubrió.
// Solo usa las respuestas que el jugador vio: nunca filtra al personaje secreto.
(function(){
const SUG_CONCEPTO={'¿Es filósofo?':'filosofo','¿Es un rey?':'rey','¿Usa arco?':'tiene_arco','¿Es pacifista?':'pacifista','¿Es rico?':'rico','¿Es inmortal?':'inmortal','¿Puede volar?':'vuela','¿Usa espada?':'usa_espada','¿Es de la Antigüedad?':'antiguedad','¿Es de la Edad Media?':'medieval','¿Ganó un Nobel?':'premio_nobel','¿Es detective?':'detective','¿Es político?':'politico','¿Es militar?':'militar','¿Es un dios?':'dios','¿Es de Asia?':'region_asia','¿Ganó algún premio?':'premios'};
const POOL=['¿Es una persona real?','¿Es ficticio?','¿Es una mujer?','¿Es un hombre?','¿Sigue con vida?','¿Es humano?','¿Es de Europa?','¿Es de América?','¿Es científico?','¿Es artista?','¿Es escritor?','¿Es un superhéroe?','¿Tiene poderes?','¿Usa magia?','¿Aparece en películas?','¿Aparece en libros?','¿Aparece en cómics?','¿Es de Marvel?','¿Es de DC Comics?','¿Es de Harry Potter?','¿Es de Star Wars?'].concat(Object.keys(SUG_CONCEPTO));
const val=(L,q,p)=>{const c=SUG_CONCEPTO[q];return c?L.resolverConcepto(c,p):L.evaluarPregunta(q,p)};
function consistentes(L,ps,facts){return ps.filter(p=>facts.every(f=>{const v=f.concepto?L.resolverConcepto(f.concepto,p):L.evaluarPregunta(f.texto,p);return v===null||v===f.answer}))}
function sugerir(L,ps,facts,asked,n){
  n=n||5;const rest=consistentes(L,ps,facts),base=rest.length?rest:ps,cand=[];
  for(const q of POOL){if(asked.has(L.normalizar(q)))continue;let si=0,tot=0;
    for(const p of base){const v=val(L,q,p);if(v===null)continue;tot++;if(v)si++}
    if(tot&&si>0&&si<tot)cand.push({q,s:Math.abs(si/tot-.5)})}
  cand.sort((a,b)=>a.s-b.s);const top=cand.slice(0,n+3).sort(()=>Math.random()-.5);
  return top.slice(0,n).map(x=>x.q)}
function resueltos(L,ps,facts){const rest=consistentes(L,ps,facts);if(!rest.length)return 0;
  return['tipo_real','genero_hombre','humano'].filter(c=>{const v=L.resolverConcepto(c,rest[0]);return rest.every(p=>L.resolverConcepto(c,p)===v)}).length}
// Se habilita al conocer lo básico (real/ficticio, género, humano) o, si no, tras 5 preguntas.
function desbloqueada(L,ps,facts){return facts.length>=2&&(resueltos(L,ps,facts)>=3||facts.length>=5)}
const S={sugerir,consistentes,POOL,resueltos,desbloqueada,val};
if(typeof module!=='undefined'&&module.exports)module.exports=S;else window.Sugeridor=S;
})();
