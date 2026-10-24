/* MIND DUEL FUSION — Inferencia y aprendizaje de personajes.
 * Los hechos derivados nunca sustituyen los datos explícitos. Las respuestas aportadas
 * por jugadores quedan tentativas hasta coincidir en al menos 3 dispositivos distintos.
 */
(function(){
'use strict';
const KEY='mind_knowledge_evidence_v1', DEVICE='mind_knowledge_device_v1', TEMPLATE='mind_character_profiles_v1';
const QUESTIONS=[
 {concepto:'real',pregunta:'¿Es una persona real?'},
 {concepto:'hombre',pregunta:'¿Es un hombre?'},
 {concepto:'mujer',pregunta:'¿Es una mujer?'},
 {concepto:'humano',pregunta:'¿Es humano?'},
 {concepto:'animal',pregunta:'¿Es un animal?'},
 {concepto:'vivo',pregunta:'¿Sigue con vida?'},
 {concepto:'region_europa',pregunta:'¿Es de Europa?'},
 {concepto:'region_america',pregunta:'¿Es de América?'},
 {concepto:'peliculas',pregunta:'¿Aparece en películas?'},
 {concepto:'libros',pregunta:'¿Aparece en libros?'},
 {concepto:'comics',pregunta:'¿Aparece en cómics?'},
 {concepto:'television',pregunta:'¿Aparece en televisión o series?'},
 {concepto:'anime',pregunta:'¿Pertenece a un anime o manga japonés?'},
 {concepto:'combate',pregunta:'¿Participa habitualmente en combates?'},
 {concepto:'poderoso',pregunta:'¿Tiene una fuerza o poder extraordinario?'},
 {concepto:'marvel',pregunta:'¿Pertenece al universo Marvel?'},
 {concepto:'dc',pregunta:'¿Pertenece al universo de DC Comics?'},
 {concepto:'star_wars',pregunta:'¿Pertenece a Star Wars?'},
 {concepto:'hijos',pregunta:'¿Tiene hijos en su historia o vida conocida?'},
 {concepto:'terrestre',pregunta:'¿Su origen es la Tierra?'},
 {concepto:'magia',pregunta:'¿Utiliza magia o hechicería?'},
 {concepto:'deportista',pregunta:'¿Su actividad principal es el deporte?'},
 {concepto:'futbolista',pregunta:'¿Es futbolista?'},
 {concepto:'cientifico',pregunta:'¿Es científico o se dedica a la ciencia?'},
 {concepto:'escritor',pregunta:'¿Es escritor o autora?'},
 {concepto:'musico',pregunta:'¿Es músico o cantante?'}
];
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const NACIONALIDADES_REALES=new Set(['aleman','argentina','argentino','belga','brasileno','britanica','britanico','canadiense','chino','colombiana','egipcio','espanol','estadounidense','frances','galo','griego','hongkones','indio','ingles','italiano','jamaicano','latinoamericana','macedonio','mexicano','polinesia','portugues','polaco','romano','rumano','ruso','serbio','sudafricano','suizo','venezolano']);
function read(key,def){try{return JSON.parse(localStorage.getItem(key)||'null')||def}catch{return def}}
function write(key,val){try{localStorage.setItem(key,JSON.stringify(val));return true}catch{return false}}
function deviceId(){let id='';try{id=localStorage.getItem(DEVICE)||'';if(!id){id='dev-'+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem(DEVICE,id)}}catch{}return id||'device-local';}
function hasTag(p,t){return Array.isArray(p?.etiquetas)&&p.etiquetas.some(x=>norm(x)===norm(t))}
function truth(p,field){return typeof p?.[field]==='boolean'?p[field]:null}
function explicit(p,c){
 const tags=Array.isArray(p?.etiquetas)?p.etiquetas:[]; const uni=norm(p?.universo); const tipo=norm(p?.tipo);
 switch(c){
  case 'real': if(typeof p?.real==='boolean')return p.real; return tipo==='real'?true:tipo==='ficticio'?false:null;
  case 'ficticio': if(typeof p?.ficticio==='boolean')return p.ficticio; return tipo==='ficticio'?true:tipo==='real'?false:null;
  case 'humano': if(typeof p?.humano==='boolean')return p.humano; return tipo==='real'?true:null;
  case 'animal': if(typeof p?.animal==='boolean')return p.animal; return hasTag(p,'animal')||hasTag(p,'perro')||hasTag(p,'gato')||hasTag(p,'canino')||hasTag(p,'felino')?true:null;
  case 'hombre': if(typeof p?.hombre==='boolean')return p.hombre; return p?.genero==='hombre'?true:(p?.genero==='mujer'?false:null);
  case 'mujer': if(typeof p?.mujer==='boolean')return p.mujer; return p?.genero==='mujer'?true:(p?.genero==='hombre'?false:null);
  case 'vivo': return truth(p,'vivo');
  case 'region_europa': return typeof p?.region==='string'&&p.region?norm(p.region)==='europa':null;
  case 'region_america': return typeof p?.region==='string'&&p.region?norm(p.region)==='america':null;
  case 'peliculas': return Array.isArray(p?.medios)&&p.medios.length?p.medios.some(m=>['pelicula','peliculas','cine'].includes(norm(m))):null;
  case 'libros': return Array.isArray(p?.medios)&&p.medios.length?p.medios.some(m=>['libro','libros','novela','literatura'].includes(norm(m))):null;
  case 'comics': return Array.isArray(p?.medios)&&p.medios.length?p.medios.some(m=>['comic','comics','historieta'].includes(norm(m))):null;
  case 'television': return Array.isArray(p?.medios)&&p.medios.length?p.medios.some(m=>['television','serie','tv'].includes(norm(m))):null;
  case 'poderoso': return truth(p,'poderoso');
  case 'combate': if(typeof p?.combate==='boolean')return p.combate; return hasTag(p,'combate')?true:null;
  case 'anime': if(typeof p?.anime==='boolean')return p.anime; return hasTag(p,'anime')?true:(uni==='dragon ball'||uni==='naruto'||uni==='one piece'?true:null);
  case 'marvel': if(typeof p?.marvel==='boolean')return p.marvel; return hasTag(p,'marvel')||uni==='marvel'?true:null;
  case 'dc': if(typeof p?.dc==='boolean')return p.dc; return hasTag(p,'dc')||hasTag(p,'dc_comics')||uni==='dc'?true:null;
  case 'star_wars': if(typeof p?.star_wars==='boolean')return p.star_wars; return uni==='star wars'||hasTag(p,'jedi')||hasTag(p,'sith')?true:null;
  case 'hijos': return truth(p,'hijos');
  case 'terrestre': return truth(p,'origen_terrestre');
  case 'magia': return truth(p,'magia');
  case 'deportista': return hasTag(p,'deportista')||hasTag(p,'deporte')?true:null;
  case 'futbolista': return hasTag(p,'futbolista')||hasTag(p,'futbol')?true:null;
  case 'cientifico': return hasTag(p,'cientifico')?true:null;
  case 'escritor': return hasTag(p,'escritor')?true:null;
  case 'musico': return hasTag(p,'musico')||hasTag(p,'cantante')?true:null;
  case 'artista': if(typeof p?.artista==='boolean')return p.artista; return hasTag(p,'artista')||hasTag(p,'pintor')||hasTag(p,'musico')||hasTag(p,'autor')||hasTag(p,'escritor')||hasTag(p,'dramaturgo')||hasTag(p,'poeta')||hasTag(p,'cantante')||hasTag(p,'compositor')||hasTag(p,'actor')||hasTag(p,'actriz')||hasTag(p,'director')||hasTag(p,'escultor')||hasTag(p,'fotografo')||hasTag(p,'bailarin')||hasTag(p,'bailarina')?true:null;
  case 'pacifista': if(typeof p?.pacifista==='boolean')return p.pacifista; return hasTag(p,'pacifista')?true:null;
  case 'antiguedad': if(typeof p?.antiguedad==='boolean')return p.antiguedad; return hasTag(p,'antiguedad')?true:null;
  case 'medieval': if(typeof p?.medieval==='boolean')return p.medieval; return hasTag(p,'medieval')?true:null;
  case 'renacimiento': if(typeof p?.renacimiento==='boolean')return p.renacimiento; return hasTag(p,'renacimiento')?true:null;
  case 'nac_ingles': {const ns=Array.isArray(p?.nacionalidades)?p.nacionalidades.map(norm):[];if(ns.includes('ingles'))return true;if(ns.includes('espanol'))return false;return ns.some(n=>NACIONALIDADES_REALES.has(n))?false:null;}
  case 'nac_espanol': {const ns=Array.isArray(p?.nacionalidades)?p.nacionalidades.map(norm):[];if(ns.includes('espanol'))return true;if(ns.includes('ingles')||ns.includes('britanico')||ns.includes('britanica'))return false;return ns.some(n=>NACIONALIDADES_REALES.has(n))?false:null;}
  case 'region_asia': return typeof p?.region==='string'&&p.region?norm(p.region)==='asia':null;
  default: return null;
 }
}
function votes(){return read(KEY,{version:1,profiles:{},votes:{}})}
function aggregate(name,concept){const db=votes(),k=norm(name)+'|'+concept,rows=Object.values(db.votes[k]||{});let yes=0,no=0;for(const r of rows){if(r.value===true)yes++;else if(r.value===false)no++}if(yes>=3&&yes>no)return {value:true,confidence:'confirmed',yes,no};if(no>=3&&no>yes)return {value:false,confidence:'confirmed',yes,no};if(yes||no)return {value:null,confidence:'tentative',yes,no};return {value:null,confidence:'unknown',yes:0,no:0}}
function inferir(p){
 const x={...p,etiquetas:Array.isArray(p?.etiquetas)?[...p.etiquetas]:[],medios:Array.isArray(p?.medios)?[...p.medios]:[]};
 // Derivaciones seguras: solo se agregan conclusiones que realmente se desprenden de la ficha.
 if(x.tipo==='real'&&typeof x.humano!=='boolean')x.humano=true;
 if(x.tipo==='real'&&typeof x.origen_terrestre!=='boolean')x.origen_terrestre=true;
 // Deriva atributos solo cuando existe una señal explícita en la ficha.
 if(typeof x.animal!=='boolean'&&(hasTag(x,'animal')||hasTag(x,'perro')||hasTag(x,'gato')||hasTag(x,'canino')||hasTag(x,'felino')))x.animal=true;
 if(typeof x.artista!=='boolean'&&(hasTag(x,'artista')||hasTag(x,'pintor')||hasTag(x,'musico')||hasTag(x,'autor')||hasTag(x,'escritor')||hasTag(x,'dramaturgo')||hasTag(x,'poeta')||hasTag(x,'cantante')||hasTag(x,'compositor')||hasTag(x,'actor')||hasTag(x,'actriz')||hasTag(x,'director')||hasTag(x,'escultor')||hasTag(x,'fotografo')||hasTag(x,'bailarin')||hasTag(x,'bailarina')))x.artista=true;
 if(typeof x.pacifista!=='boolean'&&hasTag(x,'pacifista'))x.pacifista=true;
 const epocas=[['antiguedad','antiguedad'],['medieval','medieval'],['renacimiento','renacimiento']];
 for(const [field,tag] of epocas)if(typeof x[field]!=='boolean'&&hasTag(x,tag))x[field]=true;
 const epocaConocida=epocas.find(([field])=>x[field]===true);
 if(epocaConocida){for(const [field] of epocas)if(field!==epocaConocida[0]&&typeof x[field]!=='boolean')x[field]=false;}
 else if(x.tipo==='real'&&x.vivo===true){for(const [field] of epocas)if(typeof x[field]!=='boolean')x[field]=false;}
 const ns=Array.isArray(x.nacionalidades)?x.nacionalidades.map(norm):[];
 if(ns.some(n=>NACIONALIDADES_REALES.has(n))){if(typeof x.nac_ingles!=='boolean')x.nac_ingles=ns.includes('ingles');if(typeof x.nac_espanol!=='boolean')x.nac_espanol=ns.includes('espanol');}
 // Un universo concreto permite inferir a qué universos NO pertenece; no afirma nada sobre crossovers.
 const universoConcreto=norm(x.universo);
 if(x.tipo==='real'){if(typeof x.anime!=='boolean')x.anime=false;if(typeof x.marvel!=='boolean')x.marvel=false;if(typeof x.dc!=='boolean')x.dc=false;if(typeof x.star_wars!=='boolean')x.star_wars=false;}
 if(universoConcreto&&!['real','ficcion','ficticio','fiction'].includes(universoConcreto)){
  if(typeof x.marvel!=='boolean'&&!universoConcreto.includes('marvel'))x.marvel=false;
  if(typeof x.dc!=='boolean'&&!universoConcreto.includes('dc'))x.dc=false;
  if(typeof x.star_wars!=='boolean'&&universoConcreto!=='star wars')x.star_wars=false;
  if(typeof x.anime!=='boolean'&&!['dragon ball','naruto','one piece','pokemon','yu-gi-oh','yu gi oh'].includes(universoConcreto)&&!hasTag(x,'anime'))x.anime=false;
 }
 const uni=norm(x.universo);
 if((hasTag(x,'marvel')||hasTag(x,'dc')||hasTag(x,'dc_comics')||hasTag(x,'jedi')||hasTag(x,'sith')||hasTag(x,'anime')||(['dragon ball','naruto','one piece'].includes(uni)))&&x.tipo!=='real')x.tipo=x.tipo||'ficticio';
 if((hasTag(x,'marvel')||hasTag(x,'dc')||hasTag(x,'dc_comics'))&&x.tipo!=='real'&&!x.universo)x.universo=hasTag(x,'marvel')?'marvel':'dc';
 if(['dragon ball','naruto','one piece'].includes(uni)&&!x.medios.includes('animacion'))x.medios.push('animacion');
 if(hasTag(x,'anime')&&!x.medios.includes('animacion'))x.medios.push('animacion');
 
 // Conocimiento local confirmado puede completar vacíos; jamás pisa un dato explícito.
 for(const q of QUESTIONS){const current=explicit(x,q.concepto);if(current!==null)continue;const a=aggregate(x.nombre,q.concepto);if(a.confidence==='confirmed'){
   if(q.concepto==='real'){x.real=a.value;x.tipo=a.value?'real':'ficticio';}
   else if(q.concepto==='hombre')x.hombre=a.value;
   else if(q.concepto==='mujer')x.mujer=a.value;
   else if(q.concepto==='humano')x.humano=a.value;
   else if(q.concepto==='animal')x.animal=a.value;
   else if(q.concepto==='vivo')x.vivo=a.value;
   else if(q.concepto==='region_europa'){x.region_europa=a.value;if(a.value)x.region='europa';}
   else if(q.concepto==='region_america'){x.region_america=a.value;if(a.value)x.region='america';}
   else if(q.concepto==='peliculas')x.peliculas=a.value;
   else if(q.concepto==='libros')x.libros=a.value;
   else if(q.concepto==='comics')x.comics=a.value;
   else if(q.concepto==='television')x.television=a.value;
   else if(q.concepto==='poderoso')x.poderoso=a.value;
   else if(q.concepto==='combate')x.combate=a.value;
   else if(q.concepto==='hijos')x.hijos=a.value;
   else if(q.concepto==='terrestre')x.origen_terrestre=a.value;
   else if(q.concepto==='magia')x.magia=a.value;
   else if(q.concepto==='artista')x.artista=a.value;
   else if(q.concepto==='pacifista')x.pacifista=a.value;
   else if(q.concepto==='anime')x.anime=a.value;
   else if(q.concepto==='marvel')x.marvel=a.value;
   else if(q.concepto==='dc')x.dc=a.value;
   else if(q.concepto==='star_wars')x.star_wars=a.value;
   else if(q.concepto==='deportista')x.deportista=a.value;
   else if(q.concepto==='futbolista')x.futbolista=a.value;
   else if(q.concepto==='cientifico')x.cientifico=a.value;
   else if(q.concepto==='escritor')x.escritor=a.value;
   else if(q.concepto==='musico')x.musico=a.value;
   else {x._mindKnowledge=x._mindKnowledge||{};x._mindKnowledge[q.concepto]=a.value;}
 }}
 return x;
}
function valor(p,c){const inf=inferir(p);const direct=explicit(inf,c);if(direct!==null)return direct;return inf._mindKnowledge&&typeof inf._mindKnowledge[c]==='boolean'?inf._mindKnowledge[c]:null}
function crearPlantilla(nombre){const db=read(TEMPLATE,{}),key=norm(nombre);if(db[key])return db[key];return {nombre:String(nombre||'').trim(),alias:[],descripcion:'',tipo:null,genero:null,vivo:null,humano:null,famoso:null,region:null,nacionalidades:[],idiomas:[],etiquetas:[],medios:[],universo:null,poderes:null,magia:null,combate:null,hijos:null,origen_terrestre:null,plantillaVersion:1,datosPendientes:true}}
function conceptoDePregunta(q){const t=norm(q);if(/animal|mascota|bestia|especie animal/.test(t))return 'animal';if(/persona real|\bes real\b|existio|de verdad/.test(t))return 'real';if(/antiguedad|antiguo|antigua|edad antigua/.test(t))return 'antiguedad';if(/edad media|medieval/.test(t))return 'medieval';if(/renacimiento/.test(t))return 'renacimiento';if(/pacifista|pacifismo/.test(t))return 'pacifista';if(/artista|arte|pintor|pintora/.test(t))return 'artista';if(/ingles|inglaterra/.test(t)&&!/habla|idioma|lengua/.test(t))return 'nac_ingles';if(/espanol|español|espana|españa/.test(t)&&!/habla|idioma|lengua/.test(t))return 'nac_espanol';if(/asia|asiatico|asiatica/.test(t))return 'region_asia';if(/hombre|masculin|varon/.test(t))return 'hombre';if(/mujer|femenin/.test(t))return 'mujer';if(/humano|ser humano/.test(t))return 'humano';if(/sigue con vida|esta vivo|esta viva|vive actualmente|con vida/.test(t))return 'vivo';if(/europa|europeo|europea/.test(t))return 'region_europa';if(/america|americano|americana/.test(t))return 'region_america';if(/pelicula|cine|film/.test(t))return 'peliculas';if(/libro|novela|literatura/.test(t))return 'libros';if(/comic|historieta/.test(t))return 'comics';if(/television|serie|tv/.test(t))return 'television';if(/ficticio|ficcion|imaginario/.test(t))return 'ficticio';if(/anime|manga japones|animacion japonesa/.test(t))return 'anime';if(/combate|pelea|lucha|batalla/.test(t))return 'combate';if(/poderos|fuerte|fuerza extraordinaria/.test(t))return 'poderoso';if(/marvel/.test(t))return 'marvel';if(/dc comics|universo dc/.test(t))return 'dc';if(/star wars|jedi|sith/.test(t))return 'star_wars';if(/hijos|hija|hijo|descendencia/.test(t))return 'hijos';if(/terrestre|de la tierra|origen.*tierra/.test(t))return 'terrestre';if(/magia|magico|hechicer/.test(t))return 'magia';if(/futbolista|futbol/.test(t))return 'futbolista';if(/deportista|deporte/.test(t))return 'deportista';if(/cientific|ciencia/.test(t))return 'cientifico';if(/escritor|autora|autor/.test(t))return 'escritor';if(/musico|cantante/.test(t))return 'musico';return null}
function preguntaSiguiente(p){const db=votes(),k=norm(p?.nombre||'');for(const q of QUESTIONS){if(valor(p,q.concepto)!==null)continue;const own=db.votes[k+'|'+q.concepto]||{};if(own[deviceId()])continue;return q}return null}
function registrarRespuestasPartida(nombre,log,personaje){if(!nombre||!Array.isArray(log))return 0;let n=0;for(const row of log){if(!row||!['si','no'].includes(row.a))continue;const c=conceptoDePregunta(row.q);if(!c)continue;registrarVoto(nombre,c,row.a==='si',personaje);n++}return n}
function registrarVoto(nombre,concepto,value,personaje){const db=votes(),key=norm(nombre)+'|'+concepto,id=deviceId();db.votes[key]=db.votes[key]||{};db.votes[key][id]={value:!!value,device:id,at:new Date().toISOString()};if(!db.profiles[norm(nombre)]&&(!personaje||personaje.plantillaVersion===1))db.profiles[norm(nombre)]=crearPlantilla(nombre);if(db.profiles[norm(nombre)]){db.profiles[norm(nombre)].nombre=String(nombre).trim();if(personaje&&personaje.plantillaVersion===1){db.profiles[norm(nombre)].alias=personaje.alias||[];db.profiles[norm(nombre)].tipo=personaje.tipo||db.profiles[norm(nombre)].tipo;db.profiles[norm(nombre)].universo=personaje.universo||db.profiles[norm(nombre)].universo;}}write(KEY,db);if(personaje&&personaje.plantillaVersion===1)plantilla(nombre,{...personaje,datosPendientes:true});const status=aggregate(nombre,concepto);return status}
function plantilla(nombre,extra={}){const db=read(TEMPLATE,{}),k=norm(nombre||extra.nombre||''),p={...(db[k]||crearPlantilla(nombre)),...extra,nombre:String(nombre||extra.nombre||'').trim()};db[k]=p;write(TEMPLATE,db);return p}
function listarPlantillas(){return Object.values(read(TEMPLATE,{}))}
function listarJugables(){return listarPlantillas().filter(p=>p&&p.nombre&&!p.datosPendientes&&['real','ficticio'].includes(p.tipo)&&p.genero&&p.humano!==null&&p.humano!==undefined)}
function exportar(){return JSON.stringify({format:'mind-character-knowledge-v1',evidence:votes(),templates:read(TEMPLATE,{})},null,2)}
function importar(raw){const data=typeof raw==='string'?JSON.parse(raw):raw;if(!data||data.format!=='mind-character-knowledge-v1'||!data.evidence)throw new Error('Paquete de conocimiento inválido');const local=votes();for(const [k,devices] of Object.entries(data.evidence.votes||{})){local.votes[k]=local.votes[k]||{};for(const [id,v] of Object.entries(devices||{}))if(!local.votes[k][id])local.votes[k][id]=v;}local.profiles={...local.profiles,...(data.evidence.profiles||{})};write(KEY,local);const t=read(TEMPLATE,{});for(const [k,v] of Object.entries(data.templates||{}))if(!t[k])t[k]=v;write(TEMPLATE,t);return Object.keys(data.evidence.votes||{}).length}
function estado(nombre,concepto){return aggregate(nombre,concepto)}
const api={QUESTIONS,valor,inferir,enriquecer:inferir,crearPlantilla,plantilla,listarPlantillas,listarJugables,preguntaSiguiente,registrarVoto,registrarRespuestasPartida,conceptoDePregunta,exportar,importar,estado};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.MindKnowledge=api;
})();
