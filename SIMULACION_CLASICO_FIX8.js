// Pruebas de regresión del motor Clásico FIX8. Ejecutar: node SIMULACION_CLASICO_FIX8.js
const fs=require('fs');
const vm=require('vm');
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
global.window={MindKnowledge:{conceptoDePregunta(q){const t=norm(q);if(/cientific|ciencia/.test(t))return 'cientifico';if(/persona real|\bes real\b/.test(t))return 'real';if(/ficticio|ficcion|imaginario/.test(t))return 'ficticio';if(/deportista|deporte/.test(t))return 'deportista';return null;}}};
global.Sugeridor={
  POOL:['¿Es una persona real?','¿Es ficticio?','¿Es científico?','¿Se dedica a la ciencia?','¿Es deportista?','¿Practica algún deporte?'],
  val:(L,q,p)=>{const t=norm(q);if(/persona real|\bes real\b/.test(t))return typeof p.real==='boolean'?p.real:null;if(/humano/.test(t))return typeof p.humano==='boolean'?p.humano:null;return null;},
  concepto(q){return window.MindKnowledge.conceptoDePregunta(q)},
  preguntasContextuales:()=>[]
};
const C=require('./clasico.js');
const L={normalizar:norm};
const checks=[];
function check(name,condition){checks.push({name,pass:!!condition});}

let s=C.nuevo([{nombre:'A'},{nombre:'B'}]);
C.responder(s,L,'¿Es una persona real?','no');
check('ficticio queda deducido después de responder que no es real',C.esRedundante(s,L,'¿Es ficticio?'));
check('paráfrasis de persona real queda detectada',C.esRedundante(s,L,'¿Es una persona de verdad?'));
check('humano y animal no se consideran excluyentes automáticamente',!C.esRedundante(s,L,'¿Es un animal?'));

s=C.nuevo([{nombre:'A'},{nombre:'B'}]);
C.responder(s,L,'¿Es científico?','si');
check('científico y dedicarse a la ciencia se reconocen como el mismo concepto',C.esRedundante(s,L,'¿Se dedica a la ciencia?'));

s=C.nuevo([
  {nombre:'Candidato incorrecto 1',real:false,humano:false},
  {nombre:'Candidato incorrecto 2',real:false,humano:false}
]);
C.responder(s,L,'¿Es una persona real?','si');
C.responder(s,L,'¿Es humano?','si');
const filtered=C.descartarContradichos(s,L,2);
check('descarta hipótesis con dos contradicciones firmes',filtered.descartados.length===2);
check('si todos los candidatos contradicen dos respuestas, no inventa un ganador',filtered.mejor===null);

s=C.nuevo([{nombre:'Candidato incorrecto',real:false,humano:false},{nombre:'Candidato sin datos',real:null,humano:null}]);
C.responder(s,L,'¿Es una persona real?','si');
C.responder(s,L,'¿Es humano?','si');
const preserved=C.descartarContradichos(s,L,2);
check('conserva candidato sin datos suficientes en lugar de eliminarlo',preserved.mejor?.p?.nombre==='Candidato sin datos');
check('el candidato conservado no contradice las respuestas',C.contradicciones(s,L,preserved.mejor.p)===0);


// Verifica que el pool incorpore fichas compartidas sin confiar en atributos pendientes.
const scriptSource=fs.readFileSync(__dirname+'/script.js','utf8');
const poolStart=scriptSource.indexOf('function buildClassicCandidatePool(){');
const poolEnd=scriptSource.indexOf('\nfunction findKnownCharacter',poolStart);
const poolContext={
  PERSONAJES:[{nombre:'Personaje local',tipo:'real',humano:true}],
  MindLogic:{normalizar:norm},
  window:{MindKnowledge:{listarJugables:()=>[{nombre:'Perfil local nuevo',tipo:'real',genero:'mujer',humano:true,plantillaVersion:1,datosPendientes:false}]},MindCharacterCatalog:{list:()=>[
    {name:'Personaje local',status:'active',attributes:{tipo:'ficticio'}},
    {name:'Ficha pendiente incompleta',status:'needs_review',description:'Descripción pendiente',attributes:{}},
    {name:'Ficha pendiente completa',status:'needs_review',description:'Perfil estructurado',attributes:{tipo:'real',genero:'hombre',humano:true}},
    {name:'Ficha activa',status:'active',attributes:{tipo:'ficticio',humano:false}}
  ]}}
};
vm.runInNewContext(scriptSource.slice(poolStart,poolEnd)+'\nresult=buildClassicCandidatePool();',poolContext);
const pool=poolContext.result;
check('el catálogo compartido incorpora fichas pendientes con perfil estructurado',pool.some(p=>p.nombre==='Ficha pendiente completa'));
check('las fichas pendientes sin atributos también están disponibles como candidatos',pool.some(p=>p.nombre==='Ficha pendiente incompleta'));
check('el perfil pendiente completo conserva sus datos estructurados',pool.find(p=>p.nombre==='Ficha pendiente completa')?.tipo==='real' && pool.find(p=>p.nombre==='Ficha pendiente completa')?.humano===true);
check('las fichas activas conservan sus atributos',pool.find(p=>p.nombre==='Ficha activa')?.tipo==='ficticio' && pool.find(p=>p.nombre==='Ficha activa')?.humano===false);
check('las plantillas locales jugables se incorporan en cada partida',pool.some(p=>p.nombre==='Perfil local nuevo'));
check('no duplica personajes locales ya presentes',pool.filter(p=>norm(p.nombre)==='personaje local').length===1);
const nextStart=scriptSource.indexOf('async function nextClassic() {');
const nextEnd=scriptSource.indexOf('\nasync function classicGuess',nextStart);
const nextBody=scriptSource.slice(nextStart,nextEnd);
check('el selector de pregunta se ejecuta una sola vez por turno', (nextBody.match(/Clasico\.pregunta\(s, MindLogic\)/g)||[]).length===1);
check('al llegar a 20 preguntas fuerza un intento de adivinanza',/s\.n\s*>=\s*MAX_QUESTIONS/.test(nextBody)&&/await classicGuess\(true\)/.test(nextBody));


// Regresión del aprendizaje: una ficha ya verificada no debe volver a pendiente.
const localStore=new Map();
global.localStorage={getItem:k=>localStore.has(k)?localStore.get(k):null,setItem:(k,v)=>localStore.set(k,String(v))};
const Knowledge=require('./conocimiento.js');
const verifiedProfile=Knowledge.plantilla('Ficha verificada FIX8',{tipo:'real',genero:'hombre',humano:true,plantillaVersion:1,datosPendientes:false});
Knowledge.registrarVoto('Ficha verificada FIX8','real',true,verifiedProfile);
const verifiedAfter=Knowledge.listarPlantillas().find(p=>p.nombre==='Ficha verificada FIX8');
const pendingProfile=Knowledge.plantilla('Ficha pendiente FIX8',{tipo:null,genero:null,humano:null,plantillaVersion:1,datosPendientes:true});
Knowledge.registrarVoto('Ficha pendiente FIX8','real',true,pendingProfile);
const pendingAfter=Knowledge.listarPlantillas().find(p=>p.nombre==='Ficha pendiente FIX8');
check('el aprendizaje no degrada una ficha previamente verificada',verifiedAfter?.datosPendientes===false);
check('una ficha nueva sigue pendiente hasta completar su verificación',pendingAfter?.datosPendientes===true);
const catalogSource=fs.readFileSync(__dirname+'/catalogo_personajes.js','utf8');
check('el catálogo puede leer el array PERSONAJES aunque no sea window.PERSONAJES',/typeof PERSONAJES!=='undefined'&&Array\.isArray\(PERSONAJES\)/.test(catalogSource));
check('el catálogo expone acceso a sus fichas y espera su carga',/getCharacter\(name\)/.test(catalogSource)&&/async ready\(\)/.test(catalogSource));

for(const c of checks)console.log(`${c.pass?'PASS':'FAIL'} | ${c.name}`);
console.log(`Resultado: ${checks.every(c=>c.pass)?'PASS':'FAIL'} (${checks.filter(c=>!c.pass).length} fallos de ${checks.length} controles).`);
if(checks.some(c=>!c.pass))process.exit(1);
