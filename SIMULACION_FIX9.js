// Regresión FIX9: razonamiento semántico, perfiles y protección del catálogo.
const fs=require('fs');
const vm=require('vm');
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const store=new Map();
global.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))};
const Knowledge=require('./conocimiento.js');
const Clasico=require('./clasico.js');
const Logic=require('./motor_logico.js');
const L={normalizar:norm};
const checks=[];function check(name,ok){checks.push({name,pass:!!ok});}

const equivalent=[
 ['¿Tu personaje sigue con vida?','¿Tu personaje todavía vive?','vivo'],
 ['¿Tu personaje aparece en televisión o series?','¿Tu personaje sale en series?','television'],
 ['¿Tu personaje lo vimos en el cine?','¿Tu personaje aparece en películas?','peliculas'],
 ['¿Tu personaje hace deporte?','¿Es deportista?','deportista']
];
for(const [a,b,key] of equivalent){const x=Knowledge.conceptoDePregunta(a),y=Knowledge.conceptoDePregunta(b);check(`paráfrasis de ${key} comparte concepto`,x===key&&y===key);}
let s=Clasico.nuevo([{nombre:'Personaje de prueba',tipo:'real',genero:'hombre',humano:true,vivo:true}]);
s.log.push({q:'¿Tu personaje sigue con vida?',a:'si'});
check('el modo Clásico bloquea la repetición semántica de vida',Clasico.esRedundante(s,L,'¿Tu personaje todavía vive?'));
check('el modo Clásico bloquea la repetición semántica de cine',(()=>{s.log=[{q:'¿Lo vimos en el cine?',a:'no'}];return Clasico.esRedundante(s,L,'¿Aparece en películas?')})());
check('un nacimiento desconocido no se convierte en NO',Logic.resolverConcepto('nacio_usa',{tipo:'real'})===null);
check('el nacimiento en Estados Unidos se reconoce con un dato explícito',Logic.resolverConcepto('nacio_usa',{pais_nacimiento:'Estados Unidos'})===true);
check('una etiqueta de papa permite reconocer el atributo religioso',Logic.resolverConcepto('religioso',{etiquetas:['papa']})===true);

const source=fs.readFileSync(__dirname+'/script.js','utf8'),a=source.indexOf('function buildClassicCandidatePool(){'),b=source.indexOf('\nfunction findKnownCharacter',a);
const context={PERSONAJES:[{nombre:'Local',tipo:'real',genero:'hombre',humano:true},{nombre:'Shared incompleto',tipo:'real',_sharedCatalog:true}],MindLogic:{normalizar:norm},window:{MindKnowledge:{listarJugables:()=>[{nombre:'Plantilla local',tipo:'real',genero:'mujer',humano:true}]},MindCharacterCatalog:{list:()=>[
 {name:'Pendiente completo',status:'needs_review',attributes:{tipo:'real',genero:'hombre',humano:true}},
 {name:'Pendiente incompleto',status:'needs_review',attributes:{}},
 {name:'Activo incompleto',status:'active',attributes:{}},
 {name:'Activo completo',status:'active',attributes:{tipo:'ficticio',genero:'otro',humano:true}}
]}}};
vm.runInNewContext(source.slice(a,b)+'\nresult=buildClassicCandidatePool();',context);
const names=context.result.map(p=>p.nombre);
check('se incluyen fichas compartidas con perfil mínimo',names.includes('Pendiente completo')&&names.includes('Activo completo'));
check('las fichas compartidas incompletas también quedan disponibles como candidatos',names.includes('Pendiente incompleto')&&names.includes('Activo incompleto')&&names.includes('Shared incompleto'));
check('se conservan personajes y plantillas locales',names.includes('Local')&&names.includes('Plantilla local'));

check('el aviso técnico de ficha incompleta ya no aparece en el diálogo',!source.includes('Una observación: esa ficha figura en el catálogo'));
check('la ficha elegida incompleta se incorpora a la partida',/if\(!chosenInPool\)[\s\S]{0,650}classicPool\.push\(fallback\)/.test(source));
const catalog=fs.readFileSync(__dirname+'/catalogo_personajes.js','utf8'),html=fs.readFileSync(__dirname+'/index.html','utf8');
check('el catálogo abre perfiles al tocar una ficha',/makeItem\(c,\(\)=>openProfile\(c\)\)/.test(catalog));
check('el perfil permite descripción, fuente, imagen y atributos editables',html.includes('profileDescription')&&html.includes('profileSource')&&html.includes('profileImage')&&html.includes('profileAttributes'));
check('la verificación exige datos estructurados y referencia',/function canVerify\(data\)/.test(catalog)&&/substantive<4/.test(fs.readFileSync(__dirname+'/api/characters.js','utf8')));
check('la edición compartida requiere clave privada',fs.readFileSync(__dirname+'/api/characters.js','utf8').includes('CHARACTER_EDITOR_TOKEN')&&catalog.includes('x-character-editor-token'));
check('el archivo del multijugador no se referencia como destino de cambios',!source.includes('multijugador.js'));

for(const c of checks)console.log(`${c.pass?'PASS':'FAIL'} | ${c.name}`);
console.log(`Resultado FIX9: ${checks.every(c=>c.pass)?'PASS':'FAIL'} (${checks.filter(c=>!c.pass).length} fallos de ${checks.length} controles).`);
if(checks.some(c=>!c.pass))process.exit(1);
