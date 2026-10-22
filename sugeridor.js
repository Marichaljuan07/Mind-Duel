// SUGERIDOR - sugerencias coherentes con lo que el jugador YA descubrió.
// Solo usa las respuestas que el jugador vio: nunca filtra al personaje secreto.
(function(){
const SUG_CONCEPTO={'¿Es filósofo?':'filosofo','¿Es un rey?':'rey','¿Usa arco?':'tiene_arco','¿Es pacifista?':'pacifista','¿Es rico?':'rico','¿Es inmortal?':'inmortal','¿Puede volar?':'vuela','¿Usa espada?':'usa_espada','¿Es de la Antigüedad?':'antiguedad','¿Es de la Edad Media?':'medieval','¿Ganó un Nobel?':'premio_nobel','¿Es detective?':'detective','¿Es político?':'politico','¿Es militar?':'militar','¿Es un dios?':'dios','¿Es de Asia?':'region_asia','¿Ganó algún premio?':'premios','¿Es de un anime?':'anime','¿Participa en combates?':'combate','¿Es poderoso?':'poderes','¿Tiene hijos?':'hijos','¿Es de la Tierra?':'terrestre'};
const POOL=['¿Es una persona real?','¿Es ficticio?','¿Es una mujer?','¿Es un hombre?','¿Sigue con vida?','¿Es humano?','¿Es de Europa?','¿Es de América?','¿Es científico?','¿Es artista?','¿Es escritor?','¿Es un superhéroe?','¿Tiene poderes?','¿Usa magia?','¿Aparece en películas?','¿Aparece en libros?','¿Aparece en cómics?','¿Es de Marvel?','¿Es de DC Comics?','¿Es de Harry Potter?','¿Es de Star Wars?','¿Es de un anime?','¿Participa en combates?','¿Es poderoso?','¿Tiene hijos?','¿Es de la Tierra?'].concat(Object.keys(SUG_CONCEPTO));
const VAL_CACHE=new WeakMap();
const PREGUNTA_CONCEPTO={
 '¿Es una persona real?':'real','¿Es ficticio?':'real','¿Es un hombre?':'hombre','¿Es una mujer?':'hombre','¿Sigue con vida?':'vivo','¿Es de Europa?':'region_europa','¿Es de América?':'region_america','¿Es humano?':'humano','¿Es artista?':'artista','¿Es escritor?':'escritor','¿Es científico?':'cientifico','¿Es filósofo?':'filosofo','¿Es político?':'politico','¿Es militar?':'militar'
};
function clavePregunta(L,q){const t=L.normalizar(q); if(/\b(real|existio|de verdad)\b/.test(t))return 'real'; if(/\bficticio|ficcion|imaginario\b/.test(t))return 'real'; if(/\bhumano|persona humana\b/.test(t))return 'humano'; if(/\bhombre|varon|masculino\b/.test(t))return 'hombre'; if(/\bmujer|femenin\b/.test(t))return 'hombre'; if(/\bvivo|con vida|muerto|murio|fallecio\b/.test(t))return 'vivo'; if(/\beuropa\b/.test(t))return 'region_europa'; if(/\bamerica\b/.test(t))return 'region_america'; if(/\bartista|arte\b/.test(t))return 'artista'; if(/\bescritor|escritora|escribir|autor\b/.test(t))return 'escritor'; if(/\bcientifico|cientifica\b/.test(t))return 'cientifico'; if(/\bfilosofo|filosofia\b/.test(t))return 'filosofo'; if(/\banime|manga japones|animacion japonesa\b/.test(t))return 'anime'; if(/\bcombate|combates|pelea|lucha\b/.test(t))return 'combate'; if(/\bhijos?|descendencia\b/.test(t))return 'hijos'; if(/\bterrestre|de la tierra\b/.test(t))return 'terrestre'; if(/\bpoder|fuerte\b/.test(t))return 'poderes'; if(/\bmagia|magico|magica\b/.test(t))return 'magia'; if(/\bpacifista\b/.test(t))return 'pacifista'; if(/\brico|millonario|dinero\b/.test(t))return 'rico'; if(/\bcomic|historieta\b/.test(t))return 'comic'; if(/\bpelicula|cine\b/.test(t))return 'pelicula'; if(/\bmarvel\b/.test(t))return 'marvel'; if(/\bstar wars\b/.test(t))return 'star wars'; if(/\bpolitico|politica\b/.test(t))return 'politico'; if(/\bmilitar|ejercito\b/.test(t))return 'militar'; return PREGUNTA_CONCEPTO[q]||t;}
const val=(L,q,p)=>{if(!p||typeof p!=='object'){const c=SUG_CONCEPTO[q];return c?L.resolverConcepto(c,p):L.evaluarPregunta(q,p)}let m=VAL_CACHE.get(p);if(!m){m=new Map();VAL_CACHE.set(p,m)}if(m.has(q))return m.get(q);const c=SUG_CONCEPTO[q],v=c?L.resolverConcepto(c,p):L.evaluarPregunta(q,p);m.set(q,v);return v};
function consistentes(L,ps,facts){return ps.filter(p=>facts.every(f=>{const v=f.concepto?L.resolverConcepto(f.concepto,p):L.evaluarPregunta(f.texto,p);return v===null||v===f.answer}))}
function sugerir(L,ps,facts,asked,n,turno){
  n=Math.max(1,Number(n)||5); turno=Math.max(0,Number(turno)||facts.length);
  const rest=consistentes(L,ps,facts),base=rest.length?rest:ps,cand=[];
  if(!base.length)return [];
  // Antes de 5 no se llama desde la interfaz. Una vez desbloqueadas, empezar
  // con atributos humanos amplios y después pasar a actividades/roles generales;
  // nunca orientar temprano a franquicias o universos muy específicos.
  const amplias=['¿Es una persona real?','¿Es ficticio?','¿Es humano?','¿Es una mujer?','¿Es un hombre?','¿Sigue con vida?','¿Es de Europa?','¿Es de América?'];
  const intermedias=['¿Es científico?','¿Es artista?','¿Es escritor?','¿Es filósofo?','¿Es político?','¿Es militar?','¿Es detective?','¿Es pacifista?','¿Es rico?','¿Es de la Antigüedad?','¿Es de la Edad Media?'];
  const preguntas=turno<5?amplias:(turno<8?[...amplias,...intermedias]:POOL);
  const yaPreguntadas=asked instanceof Set?asked:new Set(asked||[]);
  const clavesPreguntadas=new Set([...yaPreguntadas].map(q=>clavePregunta(L,q))); for(const f of facts){if(f&&f.texto)clavesPreguntadas.add(clavePregunta(L,f.texto));}
  for(let indice=0;indice<preguntas.length;indice++){
    const q=preguntas[indice],clave=clavePregunta(L,q);
    if(yaPreguntadas.has(L.normalizar(q))||clavesPreguntadas.has(clave))continue;
    let si=0,no=0,desconocidos=0;
    for(const p of base){const v=val(L,q,p);if(v===null){desconocidos++;continue}if(v)si++;else no++}
    const tot=si+no;if(tot<2)continue;
    const cobertura=tot/base.length, equilibrio=(si>0&&no>0)?1-Math.abs(si/tot-.5)*2:0;
    // Una pregunta puede seguir siendo útil aunque no divida perfectamente:
    // la cobertura de datos fiables importa, y los primeros turnos prefieren
    // preguntas generales antes que una división matemáticamente óptima.
    if(si>0&&no>0){cand.push({q,score:equilibrio*.72+cobertura*.28,indice})}
    else if(cobertura>=.55){cand.push({q,score:cobertura*.22,indice})}
  }
  cand.sort((a,b)=>b.score-a.score||a.indice-b.indice);
  const ranked=cand.slice(0,n).map(x=>x.q);
  // Si la base de datos no tiene suficientes hechos para puntuar preguntas,
  // no bloqueamos la ayuda: ofrecemos preguntas generales aún no usadas.
  if(ranked.length>=Math.min(3,n))return ranked;
  const fallback=[...ranked];
  for(const q of POOL){if(fallback.length>=n)break;const k=clavePregunta(L,q);if(clavesPreguntadas.has(k)||fallback.some(x=>clavePregunta(L,x)===k))continue;fallback.push(q);}
  return fallback.slice(0,n);
}
function resueltos(L,ps,facts){const rest=consistentes(L,ps,facts);if(!rest.length)return 0;
  return['tipo_real','genero_hombre','humano'].filter(c=>{const v=L.resolverConcepto(c,rest[0]);return rest.every(p=>L.resolverConcepto(c,p)===v)}).length}
// Se habilita al conocer lo básico (real/ficticio, género, humano) o, si no, tras 5 preguntas.
function desbloqueada(L,ps,facts){return Array.isArray(facts)&&facts.length>=5}
const S={sugerir,consistentes,POOL,resueltos,desbloqueada,val};
if(typeof module!=='undefined'&&module.exports)module.exports=S;else window.Sugeridor=S;
})();
