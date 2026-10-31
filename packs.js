// PAQUETES DE PERSONAJES v3.13.82 — personajes nuevos + sus propias preguntas, para los DOS modos.
// ADITIVO: no modifica personajes.js ni motor_logico.js; se engancha al cargar el juego.
// Los datos de los paquetes son conocimiento general y quedan "por revisar" por Juan.
(function(){
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

// ---------------------------------------------------------------- PAQUETE: DRAGON BALL
// pk = atributos propios que SÍ cumple; dud = atributos dudosos (se responden como "no lo sé");
// cualquier otro atributo del paquete se considera que NO lo cumple.
const DB={
 id:'dragonball',nombre:'Dragon Ball',universo:'dragon ball',
 franquicia:{concepto:'pk_dragonball',pregunta:'¿Es de Dragon Ball?',patron:/dragon ?ball|\bdbz\b|dragonball/},
 preguntas:[
  {concepto:'pk_saiyajin',pregunta:'¿Es un saiyajin?',patron:/saiyaj|saiyan|sayaj|sayayin/},
  {concepto:'pk_namekiano',pregunta:'¿Es un namekiano?',patron:/namek/},
  {concepto:'pk_villano',pregunta:'¿Es un villano?',patron:/villano|malvado/},
  {concepto:'pk_protagonista',pregunta:'¿Es el protagonista de su serie?',patron:/protagonista/},
  {concepto:'pk_androide',pregunta:'¿Es un androide?',patron:/androide|ciborg|cyborg/},
  {concepto:'pk_calvo',pregunta:'¿Es calvo?',patron:/\bcalvo\b|sin pelo/},
  {concepto:'pk_verde',pregunta:'¿Es de color verde?',patron:/\bverde\b/},
  {concepto:'pk_rosa',pregunta:'¿Es de color rosa?',patron:/\brosa\b|rosado/},
  {concepto:'pk_exenemigo',pregunta:'¿Empezó como enemigo y luego fue aliado?',patron:/empezo.*enemigo|fue aliado|exenemigo|ex enemigo/},
  {concepto:'pk_hijo_goku',pregunta:'¿Es hijo de Goku?',patron:/hijo de goku/},
  {concepto:'pk_hijo_vegeta',pregunta:'¿Es hijo de Vegeta?',patron:/hijo de vegeta/},
  {concepto:'pk_torneo',pregunta:'¿Participó en el Torneo del Poder?',patron:/torneo del poder/},
  {concepto:'pk_destruccion',pregunta:'¿Es un dios de la destrucción?',patron:/dios de la destruccion/}
 ],
 // Goku ya existe en el catálogo base: solo se le suman los atributos del paquete.
 parches:{'Goku':{pack:'dragonball',pk:['saiyajin','protagonista','torneo'],pkDudoso:[]}}
};
const F=(nombre,o)=>{
  const r={nombre,alias:[norm(nombre)].concat(o.alias||[]),descripcion:o.d,tipo:'ficticio',universo:'dragon ball',
    genero:o.g||'hombre',famoso:true,region:null,nacionalidades:[],idiomas:['espanol'],etiquetas:['anime'].concat(o.t||[]),
    medios:['television','pelicula'],poderes:o.poderes===undefined?true:o.poderes,magia:false,mascara:false,capa:!!o.capa,
    marvel:false,dc:false,anime:true,animal:false,artista:false,pack:'dragonball',pk:o.pk||[],pkDudoso:o.dud||[]};
  for(const k of['humano','vivo','hijos','origen_terrestre','combate','poderoso'])if(o[k]!==undefined)r[k]=o[k];
  return r;
};
DB.personajes=[
 F('Vegeta',{alias:['principe vegeta'],d:'Príncipe de los saiyajin, orgulloso rival de Goku.',pk:['saiyajin','exenemigo','torneo'],dud:['villano'],humano:false,vivo:true,hijos:true,origen_terrestre:false,combate:true,poderoso:true}),
 F('Gohan',{alias:['son gohan'],d:'Hijo mayor de Goku, mitad saiyajin y gran guerrero.',pk:['saiyajin','hijo_goku','torneo'],dud:['protagonista'],vivo:true,hijos:true,origen_terrestre:true,combate:true,poderoso:true}),
 F('Piccolo',{alias:['piccolo daimaku','piccoro'],d:'Guerrero namekiano verde, antiguo enemigo y maestro de Gohan.',pk:['namekiano','calvo','verde','exenemigo','torneo'],dud:['villano'],capa:true,humano:false,vivo:true,hijos:false,origen_terrestre:false,combate:true,poderoso:true}),
 F('Freezer',{alias:['frieza','freeza'],d:'Emperador del universo y gran enemigo de Goku.',pk:['villano','calvo','torneo'],dud:['exenemigo'],humano:false,hijos:false,origen_terrestre:false,combate:true,poderoso:true}),
 F('Krillin',{alias:['krilin','kuririn'],d:'Calvo y leal mejor amigo de Goku, guerrero humano.',pk:['calvo','torneo'],humano:true,vivo:true,hijos:true,origen_terrestre:true,combate:true}),
 F('Bulma',{g:'mujer',d:'Genio científica que inventó el radar de las esferas.',poderes:false,humano:true,vivo:true,hijos:true,origen_terrestre:true,combate:false,poderoso:false}),
 F('Trunks',{alias:['trunks del futuro'],d:'Hijo de Vegeta y Bulma, viajero del tiempo con espada.',pk:['saiyajin','hijo_vegeta'],vivo:true,hijos:false,origen_terrestre:true,combate:true,poderoso:true}),
 F('Goten',{alias:['son goten'],d:'Hijo menor de Goku, mitad saiyajin.',pk:['saiyajin','hijo_goku'],vivo:true,hijos:false,origen_terrestre:true,combate:true}),
 F('Cell',{alias:['cell perfecto'],d:'Bioandroide verde creado para absorber a los androides.',pk:['villano','androide','calvo','verde'],humano:false,hijos:false,combate:true,poderoso:true}),
 F('Majin Buu',{alias:['buu','mr buu','boo'],d:'Criatura rosa y mágica, ora malvada, ora amiga.',pk:['calvo','rosa','exenemigo','torneo'],dud:['villano'],humano:false,hijos:false,combate:true,poderoso:true}),
 F('Nappa',{d:'Saiyajin calvo y corpulento que llegó a la Tierra con Raditz.',pk:['saiyajin','villano','calvo'],humano:false,vivo:false,hijos:false,origen_terrestre:false,combate:true}),
 F('Raditz',{d:'Hermano mayor de Goku y primer saiyajin en llegar a la Tierra.',pk:['saiyajin','villano'],humano:false,vivo:false,hijos:false,origen_terrestre:false,combate:true}),
 F('Dodoria',{d:'Esbirro rosado y espinoso de Freezer.',pk:['villano','calvo','rosa'],humano:false,vivo:false,hijos:false,origen_terrestre:false,combate:true}),
 F('Zarbon',{d:'Elegante lugarteniente de Freezer que se transforma en monstruo.',pk:['villano'],dud:['verde'],humano:false,vivo:false,hijos:false,origen_terrestre:false,combate:true}),
 F('Capitán Ginyu',{alias:['ginyu','capitan ginyu'],d:'Líder de las Fuerzas Especiales Ginyu, experto en cambiar de cuerpo.',pk:['villano','calvo'],humano:false,hijos:false,origen_terrestre:false,combate:true}),
 F('Maestro Roshi',{alias:['roshi','tortuga duende','kame sennin'],d:'Anciano maestro de artes marciales de la Isla Kame.',pk:['calvo','torneo'],humano:true,vivo:true,hijos:false,origen_terrestre:true,combate:true}),
 F('Yamcha',{d:'Antiguo bandido del desierto convertido en guerrero Z.',pk:['exenemigo'],humano:true,vivo:true,hijos:false,origen_terrestre:true,combate:true}),
 F('Tenshinhan',{alias:['ten shin han','tien','tien shinhan'],d:'Guerrero humano de tres ojos, antiguo rival de Goku.',pk:['calvo','exenemigo','torneo'],humano:true,vivo:true,hijos:false,origen_terrestre:true,combate:true}),
 F('Mr. Satán',{alias:['mr satan','hercule','satan'],d:'Campeón mundial de artes marciales que se atribuye el triunfo sobre Cell.',poderes:false,humano:true,vivo:true,hijos:true,origen_terrestre:true,combate:true,poderoso:false}),
 F('Videl',{g:'mujer',d:'Hija de Mr. Satán, luchadora y esposa de Gohan.',humano:true,vivo:true,hijos:true,origen_terrestre:true,combate:true}),
 F('Chi-Chi',{alias:['chichi','milk'],g:'mujer',d:'Esposa de Goku y madre de Gohan y Goten.',poderes:false,humano:true,vivo:true,hijos:true,origen_terrestre:true,combate:true}),
 F('Androide 18',{alias:['c18','androide c18','lazuli'],g:'mujer',d:'Androide rubia de gran fuerza, esposa de Krillin.',pk:['androide','exenemigo','torneo'],dud:['villano'],vivo:true,hijos:true,origen_terrestre:true,combate:true,poderoso:true}),
 F('Androide 17',{alias:['c17','androide c17','lapis'],d:'Androide de cabello oscuro, hermano de la Androide 18.',pk:['androide','exenemigo','torneo'],dud:['villano'],vivo:true,hijos:true,origen_terrestre:true,combate:true,poderoso:true}),
 F('Beerus',{alias:['bills','lord beerus'],d:'Dios de la destrucción del Universo 7 con aspecto de gato.',pk:['destruccion'],dud:['villano','calvo','exenemigo'],humano:false,vivo:true,hijos:false,origen_terrestre:false,combate:true,poderoso:true}),
 F('Whis',{d:'Ángel y maestro de Beerus, el más poderoso del Universo 7.',pk:['calvo'],humano:false,vivo:true,hijos:false,origen_terrestre:false,combate:true,poderoso:true}),
 F('Jiren',{d:'Calvo guerrero del Universo 11, el rival más duro del Torneo del Poder.',pk:['calvo','torneo'],dud:['villano','exenemigo'],humano:false,vivo:true,hijos:false,origen_terrestre:false,combate:true,poderoso:true}),
 F('Broly',{d:'Saiyajin de fuerza descomunal y pasado trágico.',pk:['saiyajin'],dud:['villano','calvo'],humano:false,vivo:true,hijos:false,origen_terrestre:false,combate:true,poderoso:true}),
 F('Shenlong',{alias:['shenron','shen long','dragon sagrado'],d:'Dragón sagrado que concede deseos al reunir las siete esferas.',pk:['verde'],dud:['calvo'],humano:false,hijos:false,combate:false,poderes:true,poderoso:true})
];

const PACKS=[DB];
// Franquicias del catálogo base donde "no pertenece" es un NO claro (si la ficha tiene universo definido).
const CERRADAS=['anime','universo_marvel','universo_dc','universo_star_wars','universo_harry_potter'];
const FRANQ_PATRONES=[['anime',/\banime\b|\bmanga\b/],['universo_marvel',/\bmarvel\b/],['universo_dc',/\bdc\b|dc comics/],['universo_star_wars',/star wars/],['universo_harry_potter',/harry potter/]];
// Datos del catálogo base que se corrigen (solo con hechos claros).
const PARCHES_BASE={'Garfield':{humano:false,animal:true},'Totoro':{anime:true}};

let INDICE=null;
function indice(){
  if(INDICE)return INDICE;
  INDICE={porConcepto:{},porTexto:{},franq:{}};
  for(const pk of PACKS){
    const todas=[Object.assign({franquicia:true},pk.franquicia)].concat(pk.preguntas);
    for(const q of todas){
      const def={concepto:q.concepto,pregunta:q.pregunta,patron:q.patron,pack:pk,franquicia:!!q.franquicia,attr:q.concepto.replace(/^pk_/,'')};
      INDICE.porConcepto[q.concepto]=def;INDICE.porTexto[norm(q.pregunta)]=def;
    }
  }
  return INDICE;
}
const esMiembro=(pk,p)=>!!p&&(p.pack===pk.id||norm(p.universo)===norm(pk.universo));
// true / false / null, o undefined si el concepto no es de ningún paquete.
function valorPack(concepto,p){
  const def=indice().porConcepto[concepto];if(!def)return undefined;
  if(!p||typeof p!=='object')return null;
  const m=esMiembro(def.pack,p);
  if(def.franquicia){
    if(m)return true;
    return(p.tipo==='real'||(typeof p.universo==='string'&&p.universo))?false:null;
  }
  if(!m)return null; // las preguntas propias solo separan dentro de su paquete
  if((p.pkDudoso||[]).includes(def.attr))return null;
  return(p.pk||[]).includes(def.attr);
}
// Para texto libre en el modo Solo: si la pregunta es de un paquete o de una franquicia cerrada, responde ya.
function responder(L,q,p){
  const t=norm(q);
  for(const def of Object.values(indice().porConcepto)){
    if(def.patron.test(t)){const v=valorPack(def.concepto,p);if(v!==null&&v!==undefined)return v}
  }
  for(const[c,re]of FRANQ_PATRONES){
    if(re.test(t)&&!/dragon ?ball/.test(t)){const v=L.resolverConcepto(c,p);if(v!==null&&v!==undefined)return v}
  }
  return null;
}
const esPregunta=q=>!!indice().porTexto[norm(q)];
function preguntas(){return Object.values(indice().porConcepto).map(d=>d.pregunta)}

// Pregunta de aprendizaje con sentido (no "¿Es futbolista?" para Goku).
const SOLO_FICCION_NO=new Set(['deportista','futbolista','cientifico','escritor','musico','region_europa','region_america']);
const SOLO_REAL_NO=new Set(['marvel','dc','star_wars','anime','magia']);
function preguntaAprendizaje(p){
  const K=(typeof window!=='undefined'&&window.MindKnowledge)||null;if(!K||!p||!Array.isArray(K.QUESTIONS))return null;
  let own={},dev='';
  try{own=(JSON.parse(localStorage.getItem('mind_knowledge_evidence_v1')||'null')||{}).votes||{};dev=localStorage.getItem('mind_knowledge_device_v1')||''}catch(e){}
  const evitar=p.tipo==='ficticio'?SOLO_FICCION_NO:p.tipo==='real'?SOLO_REAL_NO:new Set();
  for(const q of K.QUESTIONS){
    if(evitar.has(q.concepto))continue;
    if(K.valor(p,q.concepto)!==null)continue;
    const mine=own[norm(p.nombre)+'|'+q.concepto]||{};
    if(dev&&mine[dev])continue;
    return q;
  }
  return null;
}

// ---------------------------------------------------------------- INSTALACIÓN
function instalar(o){
  const L=o.L,K=o.K,S=o.S,P=o.personajes;if(!L)return{ok:false};
  if(L.__packsInstalados)return{ok:true,ya:true};
  L.__packsInstalados=true;
  // 1) resolución de conceptos: paquetes + franquicias cerradas
  const origRC=L.resolverConcepto;
  L.resolverConcepto=function(concepto,p){
    const pv=valorPack(concepto,p);if(pv!==undefined)return pv;
    const v=origRC.call(L,concepto,p);
    if(v===null&&CERRADAS.includes(concepto)&&p&&typeof p==='object'&&(p.tipo==='real'||(typeof p.universo==='string'&&p.universo)))return false;
    return v;
  };
  // 2) las preguntas de los paquetes y de las franquicias se reconocen por su concepto
  if(K&&typeof K.conceptoDePregunta==='function'){
    const origCQ=K.conceptoDePregunta;
    K.conceptoDePregunta=function(q){
      const d=indice().porTexto[norm(q)];if(d)return d.concepto;
      const t=norm(q);for(const[c,re]of FRANQ_PATRONES)if(re.test(t))return c;
      return origCQ(q);
    };
  }
  // 3) catálogo: datos corregidos + personajes de los paquetes
  const agregados=[];
  if(Array.isArray(P)){
    const por=n=>P.find(x=>norm(x.nombre)===norm(n));
    for(const[n,fix]of Object.entries(PARCHES_BASE)){const e=por(n);if(e)Object.assign(e,fix)}
    for(const pk of PACKS){
      for(const[n,fix]of Object.entries(pk.parches||{})){const e=por(n);if(e)Object.assign(e,fix)}
      for(const f of pk.personajes){if(!por(f.nombre)){const c=JSON.parse(JSON.stringify(f));P.push(c);agregados.push(c.nombre)}}
    }
  }
  // 4) sugeridor: preguntas nuevas en el banco y sin pistas de ficción cuando el personaje es real
  if(S){
    for(const q of preguntas())if(Array.isArray(S.POOL)&&!S.POOL.includes(q))S.POOL.push(q);
    const origSug=S.sugerir;
    if(typeof origSug==='function')S.sugerir=function(){const r=origSug.apply(this,arguments);return Array.isArray(r)?r.filter(x=>!esPregunta(x)):r};
    const origCtx=S.preguntasContextuales;
    if(typeof origCtx==='function')S.preguntasContextuales=function(L2,facts,turno,cands){
      const r=origCtx.apply(this,arguments);
      return S.contextoFiccion&&S.contextoFiccion(L2,facts)==='real'&&Array.isArray(r)?r.filter(x=>!esPregunta(x)):r;
    };
  }
  return{ok:true,agregados};
}
const MindPacks={PACKS,instalar,valorPack,responder,esPregunta,preguntas,preguntaAprendizaje,esMiembro,PARCHES_BASE,CERRADAS};
if(typeof module!=='undefined'&&module.exports)module.exports=MindPacks;
else{
  window.MindPacks=MindPacks;
  try{instalar({L:window.MindLogic,K:window.MindKnowledge,S:window.Sugeridor,personajes:(typeof PERSONAJES!=='undefined'?PERSONAJES:null)})}catch(e){}
}
})();
