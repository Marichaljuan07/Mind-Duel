/* MIND DUEL FUSION 3.14.27 — Ontología común del Cerebro.
 * Normaliza conceptos y sinónimos para Clásico y Solo. No inventa hechos:
 * ausencia de evidencia = desconocido (null), nunca NO.
 */
(function(){
'use strict';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[_-]+/g,' ').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
const list=v=>(Array.isArray(v)?v:(v==null||v===''?[]:[v])).map(norm).filter(Boolean);
const bool=(p,keys)=>{for(const k of keys)if(typeof p?.[k]==='boolean')return p[k];return null};
const tags=p=>list(p?.etiquetas).concat(list(p?.rasgos));
const has=(p,words)=>{const all=tags(p);return words.some(w=>all.includes(norm(w)))};
const textFields=p=>[...list(p?.profesion),...list(p?.ocupacion),...list(p?.ambito),...list(p?.especie),...list(p?.habilidades),...list(p?.poderes),...list(p?.rasgos),...list(p?.etiquetas)];
const COUNTRY={
 'grecia':['griego','griega','heleno','helena','grecia'], 'alemania':['aleman','alemana','germanico','germanica'],
 'francia':['frances','francesa'], 'italia':['italiano','italiana'], 'espana':['espanol','espanola','españa'],
 'reino unido':['britanico','britanica','ingles','inglesa','escoces','escocesa','gales','galesa'],
 'estados unidos':['estadounidense','americano','americana','norteamericano','norteamericana','usa','eeuu'],
 'egipto':['egipcio','egipcia'], 'polonia':['polaco','polaca'], 'serbia':['serbio','serbia'],
 'argentina':['argentino','argentina'], 'uruguay':['uruguayo','uruguaya'], 'brasil':['brasileno','brasilena'],
 'mexico':['mexicano','mexicana'], 'canada':['canadiense'], 'rusia':['ruso','rusa'], 'india':['indio','india'],
 'china':['chino','china'], 'japon':['japones','japonesa'], 'irlanda':['irlandes','irlandesa'],
 'portugal':['portugues','portuguesa'], 'suiza':['suizo','suiza'], 'belgica':['belga'], 'australia':['australiano','australiana']
};
const NAT_TO_COUNTRY={}; for(const [country,aliases] of Object.entries(COUNTRY)){NAT_TO_COUNTRY[norm(country)]=country;for(const a of aliases)NAT_TO_COUNTRY[norm(a)]=country;}
function countryOf(v){const n=norm(v);return NAT_TO_COUNTRY[n]||null;}
function knownRole(p,field,aliases){const direct=bool(p,[field]);if(direct!==null)return direct;const t=textFields(p);return aliases.some(a=>t.includes(norm(a)))?true:null;}
function resolve(question,p){
 if(!p||typeof p!=='object')return null;
 const q=norm(question), t=textFields(p), tg=tags(p);
 // Humanos: no confundir humanoide con humano ni asumir que todo personaje real es humano si la ficha contradice.
 if(/\b(humano|humana|ser humano|persona humana)\b/.test(q)){
  const v=bool(p,['humano']); if(v!==null)return v;
  if(norm(p.tipo)==='real')return true;
  if(['humano','humana','human'].includes(norm(p.especie)))return true;
  if(['androide','robot','alienigena','extraterrestre','demonio','dios','animal'].includes(norm(p.especie)))return false;
  return null;
 }
 // Deidad, dios y semidiós son conceptos relacionados, pero no equivalentes.
 if(/\b(semidios|semidiosa|semidivino|semidivina)\b/.test(q)){
  const v=bool(p,['semidios','semidiosa']); if(v!==null)return v;
  if(has(p,['semidios','semidiosa','semidivino','semidivina']))return true;
  return null;
 }
 if(/\b(dios|diosa|deidad|divinidad)\b/.test(q)){
  const v=bool(p,['deidad','dios']); if(v!==null)return v;
  if(has(p,['dios','diosa','deidad','divinidad']))return true;
  if(bool(p,['semidios','semidiosa'])===true||has(p,['semidios','semidiosa']))return false;
  return null;
 }
 // Científico loco es un arquetipo narrativo distinto de una condición o diagnóstico.
 if(/\b(cientifico loco|cientifica loca)\b/.test(q)){
  const v=bool(p,['cientifico_loco']); if(v!==null)return v;
  return has(p,['cientifico loco','cientifica loca'])?true:null;
 }
 // Magia y roles relacionados.
 if(/\b(mago|maga|hechicero|hechicera|brujo|bruja)\b/.test(q)){
  const v=bool(p,['es_mago','mago','magia']); if(v!==null)return v;
  if(has(p,['mago','maga','hechicero','hechicera','brujo','bruja','hechiceria','magia']))return true;
  return null;
 }
 if(/\b(heroe|heroina|superheroe|superheroina)\b/.test(q)){
  const v=bool(p,['heroe','heroina','superheroe','superheroina']); if(v!==null)return v;
  if(has(p,['heroe','heroina','superheroe','superheroina']))return true;
  return null;
 }
 if(/\b(cientifico|cientifica)\b/.test(q))return knownRole(p,'cientifico',['cientifico','cientifica','fisico','fisica','quimico','quimica','matematico','matematica','investigador','investigadora','astronomo','astronoma']);
 if(/\b(escritor|escritora|novelista|poeta|dramaturgo|dramaturga)\b/.test(q))return knownRole(p,'escritor',['escritor','escritora','novelista','poeta','dramaturgo','dramaturga','autor','autora']);
 // Nacionalidad no se deduce de continente, lugar de nacimiento ni idioma.
 if(/\b(griego|griega|grecia|aleman|alemana|alemania|frances|francesa|francia|italiano|italiana|italia|espanol|espanola|espana|britanico|britanica|ingles|inglesa|inglaterra|estadounidense|americano|americana|japones|japonesa|japon|egipcio|egipcia|egipto|polaco|polaca|polonia|argentino|argentina|uruguayo|uruguaya|brasileno|brasilena|mexicano|mexicana|portugues|portuguesa|portugal|ruso|rusa|rusia|chino|china|canadiense)\b/.test(q)){
  const target=Object.keys(COUNTRY).find(c=>new RegExp('\\b('+[c,...COUNTRY[c]].map(x=>norm(x).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b').test(q));
  if(!target)return null;
  const raw=[...list(p.nacionalidades),...list(p.nacionalidad)];
  if(!raw.length)return null;
  const countries=raw.map(countryOf).filter(Boolean);
  if(countries.includes(target))return true;
  return countries.length?false:null;
 }
 // Rasgo subjetivo: solo responder si está expresamente documentado en campos/etiquetas.
 if(/\b(loco|loca|lunatico|lunatica|trastornado|trastornada)\b/.test(q)){
  const v=bool(p,['considerado_loco','locura','loco']); if(v!==null)return v;
  if(has(p,['considerado loco','considerada loca','loco','loca']))return true;
  return null;
 }
 return null;
}
const api={normalizar:norm,resolver:resolve,normalizarPais:countryOf};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof window!=='undefined')window.MindOntology=api;
})();
