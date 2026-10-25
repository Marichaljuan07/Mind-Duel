// MODO SOLO v3.13.80 — el Cerebro responde deduciendo, con matices, y da pistas que varían.
// Es ADITIVO: solo actúa cuando la lógica existente no sabe responder (devuelve null).
// Los datos de ÉPOCA e HIJOS de abajo son de conocimiento general y quedan "por revisar" por Juan.
(function(){
const ESTILOS={si:'SÍ.',no:'NO.',psi:'PROBABLEMENTE SÍ.',pno:'PROBABLEMENTE NO.'};

// Época de los personajes reales (la ficha no la trae). antiguedad | medieval | renacimiento | moderna | contemporanea
const EPOCAS={
 'Cleopatra':'antiguedad','Julio César':'antiguedad','Sócrates':'antiguedad','Aristóteles':'antiguedad','Alejandro Magno':'antiguedad','Confucio':'antiguedad',
 'Juana de Arco':'medieval',
 'Leonardo da Vinci':'renacimiento','William Shakespeare':'renacimiento','Maquiavelo':'renacimiento','Miguel de Cervantes':'renacimiento',
 'Napoleón Bonaparte':'moderna','George Washington':'moderna','Simón Bolívar':'moderna','Charles Darwin':'moderna','Ada Lovelace':'moderna',
 'Albert Einstein':'contemporanea','Marie Curie':'contemporanea','Nikola Tesla':'contemporanea','Frida Kahlo':'contemporanea','Gandhi':'contemporanea',
 'Pablo Picasso':'contemporanea','Martin Luther King Jr.':'contemporanea','Nelson Mandela':'contemporanea','Steve Jobs':'contemporanea',
 'Amelia Earhart':'contemporanea','Pelé':'contemporanea','Freddie Mercury':'contemporanea','Bob Marley':'contemporanea','Audrey Hepburn':'contemporanea'
};
// ¿Tiene hijos? si / no son hechos conocidos; psi / pno = "probablemente" (dato dudoso o no documentado).
const HIJOS={
 'Albert Einstein':'si','Marie Curie':'si','Leonardo da Vinci':'pno','Cleopatra':'si','Napoleón Bonaparte':'si','Nikola Tesla':'pno','Frida Kahlo':'no',
 'Ada Lovelace':'si','Gandhi':'si','Juana de Arco':'no','Pablo Picasso':'si','George Washington':'pno','Martin Luther King Jr.':'si','Simón Bolívar':'pno',
 'Confucio':'si','Aristóteles':'si','Julio César':'si','Sócrates':'si','Maquiavelo':'si','Miguel de Cervantes':'psi','Alejandro Magno':'si','Nelson Mandela':'si',
 'Steve Jobs':'si','Elon Musk':'si','Charles Darwin':'si','Amelia Earhart':'no','Pelé':'si','Cristiano Ronaldo':'si','Serena Williams':'si','Michael Jordan':'si',
 'Taylor Swift':'no','Freddie Mercury':'no','Bob Marley':'si','Shakira':'si','Beyoncé':'si','Keanu Reeves':'pno','Jackie Chan':'si','Audrey Hepburn':'si',
 'Harry Potter':'si','Darth Vader':'si','Leia Organa':'si','Aragorn':'si','Frodo Baggins':'pno','Gandalf':'pno'
};
// Universos ambientados en la época moderna o futura: descartan con cierta seguridad las épocas históricas.
const MODERNOS=['dc','marvel','star wars','pokemon','super mario','sonic the hedgehog','tomb raider','pac-man','toy story','transformers','wall-e','dragon ball','naruto','mi villano favorito','dora la exploradora','garfield','scooby-doo','mafalda','popeye','los juegos del hambre'];
const ETIQ_ARTE=['artista','pintor','musico','musica','cantante','actor','actriz','escultor','poeta','escritor','director'];
const ETIQ_NO_ARTE=['cientifico','politico','militar','deportista','deporte','inventor','filosofo','gobernante','guerrero','heroe','superheroe','villano','detective','conquistador'];
const ETIQ_LUCHA=['guerrero','militar','conquistador','usa_armas','usa_espada','arquero','superheroe','fuerza_sobrehumana','jedi'];

const tags=p=>Array.isArray(p?.etiquetas)?p.etiquetas:[];
const tieneAlguna=(p,lista)=>tags(p).some(t=>lista.includes(t));
function epocaDe(p){
  if(!p)return null;
  if(EPOCAS[p.nombre])return EPOCAS[p.nombre];
  const t=tags(p);
  for(const e of['antiguedad','medieval','renacimiento'])if(t.includes(e))return e;
  if(p.tipo==='real'&&p.vivo===true)return 'contemporanea';
  return null;
}
const CONT=[['europa',/\b(europa|europeo|europea)\b/],['america',/\b(america|americano|americana)\b/],['asia',/\b(asia|asiatico|asiatica)\b/],['africa',/\b(africa|africano|africana)\b/],['oceania',/\b(oceania)\b/]];
const ERA=[['antiguedad',/\b(antiguedad|antiguo|antigua)\b/],['medieval',/\b(edad media|medieval)\b/],['renacimiento',/\b(renacimiento|renacentista)\b/]];

// Devuelve {nivel:'si'|'no'|'psi'|'pno', razon} o null si no puede deducir con seguridad razonable.
function deducir(L,q,p){
  if(!p||!L||!L.normalizar)return null;
  const t=L.normalizar(q);

  // Animal: un humano no es un animal (en el sentido del juego).
  if(/\b(animal|mascota|bestia)\b/.test(t)){
    if(p.animal===true)return null; // la lógica existente ya sabe que lo es (la ficha de Garfield dice humano por error)
    if(p.humano===true)return{nivel:'no',razon:'humano'};
    return null;
  }
  // Épocas históricas.
  for(const[e,re]of ERA){
    if(!re.test(t))continue;
    const ep=epocaDe(p);
    if(ep)return{nivel:ep===e?'si':'no',razon:'epoca'};
    if(p.tipo==='ficticio'&&MODERNOS.includes(String(p.universo||'').toLowerCase()))return{nivel:'pno',razon:'universo moderno'};
    return null;
  }
  // Continentes (para ficticios el dato es menos firme: se responde con "probablemente").
  for(const[c,re]of CONT){
    if(!re.test(t))continue;
    const r=String(p.region||'').toLowerCase();
    if(!r)return null;
    if(r==='espacio')return{nivel:'no',razon:'region'};
    const continente=['europa','america','asia','africa','oceania'].includes(r);
    if(r==='tierra media')return{nivel:'pno',razon:'region'};
    if(!continente)return null;
    const coincide=(r===c);
    if(p.tipo==='real')return{nivel:coincide?'si':'no',razon:'region'};
    return{nivel:coincide?'psi':'pno',razon:'region'};
  }
  // Hijos.
  if(/\b(hijo|hijos|hija|hijas|descendencia)\b/.test(t)&&HIJOS[p.nombre])return{nivel:HIJOS[p.nombre],razon:'hijos'};
  // Artista.
  if(/\b(artista|arte)\b/.test(t)){
    if(tieneAlguna(p,ETIQ_ARTE))return{nivel:'si',razon:'artista'};
    if(tieneAlguna(p,ETIQ_NO_ARTE))return{nivel:'pno',razon:'artista'};
    return null;
  }
  // Combate.
  if(/\b(combate|combates|pelea|pelear|lucha|luchar)\b/.test(t)){
    if(tieneAlguna(p,ETIQ_LUCHA)||p.combate===true)return{nivel:'psi',razon:'combate'};
    if(p.humano===true&&tieneAlguna(p,['cientifico','filosofo','escritor','artista','musica','cantante','inventor','pacifista']))return{nivel:'pno',razon:'combate'};
    return null;
  }
  // Pacifista.
  if(/\bpacifista\b/.test(t)){
    if(tieneAlguna(p,['guerrero','militar','conquistador','villano']))return{nivel:'pno',razon:'pacifista'};
    return null;
  }
  return null;
}
function texto(nivel){return ESTILOS[nivel]||null}

// ---------------- Pistas variadas ----------------
const REGION_TXT={europa:'Sus pasos empezaron en el viejo continente.',america:'Su historia transcurre en el continente americano.',asia:'Su origen está en oriente.',africa:'Sus raíces están en África.',oceania:'Su origen queda en Oceanía, al otro lado del mundo.',espacio:'Su mundo queda más allá de la Tierra.','tierra media':'Su mundo no figura en ningún mapa terrestre.'};
const MEDIO_TXT={videojuego:'Su historia también se vive con un mando en la mano.',comic:'Sus aventuras se dibujaron en viñetas.',pelicula:'Seguro lo viste, o pudiste verlo, en una pantalla grande.',serie:'Hizo carrera en la televisión.',television:'Hizo carrera en la televisión.',libro:'Nació entre páginas.',literatura:'Nació entre páginas.',historia:'Su nombre está en los libros de historia.'};
const EPOCA_TXT={antiguedad:'Vivió hace más de mil quinientos años.',medieval:'Su época fue la de los castillos y las cruzadas.',renacimiento:'Su época fue la del resurgir de las artes y las ciencias en Europa.',moderna:'Su época es la de los imperios y las revoluciones.',contemporanea:'Pertenece al último siglo y medio.'};
const ROL_TXT=[
 [['cientifico'],'Su fama nace de descubrir cómo funciona el mundo.'],[['cantante','musica','musico'],'Lo que lo hizo famoso se escucha.'],
 [['deportista','deporte'],'Su fama se ganó compitiendo.'],[['politico','gobernante','lider'],'Su nombre se asocia al poder y a las decisiones de un pueblo.'],
 [['guerrero','militar','conquistador'],'Su camino quedó marcado por batallas.'],[['filosofo'],'Pasó a la historia por preguntar demasiado.'],
 [['escritor'],'Su arma es la palabra escrita.'],[['artista','pintor'],'Su obra se mira o se escucha; no se explica.'],
 [['inventor'],'Su fama viene de crear lo que antes no existía.'],[['heroe','superheroe'],'Su papel en su historia es el de proteger a otros.'],
 [['villano'],'Su papel en su historia es el de ser temido.'],[['detective'],'Su mente resuelve lo que otros no ven.']
];
const YA={region:/europa|america|asia|africa|oceania|espacio/,medio:/pelicula|serie|television|comic|videojuego|libro/,epoca:/antiguedad|edad media|renacimiento|siglo|epoca/,
 rol:/cientific|artista|escritor|politic|militar|deportista|music|filosof|inventor|heroe|villano|detective|cantante/,rasgo:/mascara|capa|gafas|bigote/};
function candidatas(p,facts,nivel,L){
  const f=(facts||[]).map(x=>L.normalizar(x.texto||'')).join(' | ');
  const saber=k=>YA[k].test(f);
  const c=[];
  const medios=Array.isArray(p.medios)?p.medios:[];
  if(nivel===1){
    if(!saber('region')&&REGION_TXT[String(p.region||'').toLowerCase()])c.push({id:'region',t:REGION_TXT[String(p.region).toLowerCase()]});
    if(!saber('medio'))for(const m of medios)if(MEDIO_TXT[m])c.push({id:'medio:'+m,t:MEDIO_TXT[m]});
    if(p.tipo==='real'&&p.vivo===false)c.push({id:'vivo',t:'Ya no está entre nosotros, pero su nombre sigue vivo.'});
    if(p.tipo==='real'&&p.vivo===true)c.push({id:'vivo',t:'Sigue entre nosotros, aunque no lo sepas.'});
  }else{
    const ep=epocaDe(p);
    if(!saber('epoca')&&ep&&EPOCA_TXT[ep]&&p.tipo==='real')c.push({id:'epoca',t:EPOCA_TXT[ep]});
    if(!saber('rol'))for(const[ts,txt]of ROL_TXT)if(tieneAlguna(p,ts)){c.push({id:'rol:'+ts[0],t:txt});break}
    if(!saber('rasgo')){
      if(p.mascara===true)c.push({id:'rasgo:mascara',t:'Algo de su rostro prefiere no mostrarse.'});
      if(p.capa===true)c.push({id:'rasgo:capa',t:'Su ropa tiene más tela de la necesaria, y a propósito.'});
      if(tieneAlguna(p,['gafas']))c.push({id:'rasgo:gafas',t:'Ve mejor con ayuda de dos cristales.'});
    }
  }
  return c;
}
function leerUsadas(){try{return JSON.parse(localStorage.getItem('md_pistas_usadas')||'[]')}catch(e){return[]}}
function guardarUsadas(a){try{localStorage.setItem('md_pistas_usadas',JSON.stringify(a.slice(-14)))}catch(e){}}
// Devuelve el texto de la pista o null (entonces el juego usa la pista de siempre).
function pista(p,facts,nivel,L,rnd,usadas){
  if(!p||!L)return null;
  const mem=usadas||leerUsadas();
  const c=candidatas(p,facts,nivel,L);
  if(!c.length)return null;
  const clave=x=>(p.nombre||'')+'|'+x.id;
  const nuevas=c.filter(x=>!mem.includes(clave(x)));
  const pool=nuevas.length?nuevas:c; // si ya se vieron todas, vuelve a empezar
  const e=pool[Math.floor((rnd||Math.random)()*pool.length)%pool.length];
  mem.push(clave(e));if(!usadas)guardarUsadas(mem);
  return 'Pista del Cerebro: '+e.t;
}
const S={deducir,texto,pista,epocaDe,candidatas,EPOCAS,HIJOS,ESTILOS};
if(typeof module!=='undefined'&&module.exports)module.exports=S;else window.Solo=S;
})();
