const assert=require('assert');
const mem=new Map();global.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
let K=require('./conocimiento.js');const L=require('./motor_logico.js'),S=require('./sugeridor.js'),fs=require('fs'),vm=require('vm');
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('./personajes.js','utf8')+';globalThis.__P=PERSONAJES;',c);const P=c.__P;
const bp=P.find(p=>p.nombre==='Black Panther'),g=P.find(p=>p.nombre==='Goku'),y=P.find(p=>p.nombre==='Yoda');
assert.strictEqual(L.evaluarPregunta('¿Es de Marvel?',K.enriquecer(bp)),true,'Black Panther se reconoce por etiqueta aunque universo diga Wakandiano');
assert.strictEqual(L.evaluarPregunta('¿Es de un anime?',K.enriquecer(g)),true,'Goku anime');
assert.strictEqual(L.evaluarPregunta('¿Es poderoso?',K.enriquecer(g)),true,'Goku poderoso independiente del campo poderes');
assert.strictEqual(L.evaluarPregunta('¿Tiene hijos?',K.enriquecer(y)),null,'dato no cargado queda desconocido');
const fiction=S.sugerir(L,P,[{texto:'¿Es ficticio?',answer:true}],new Set(),30,8);
assert(!fiction.some(q=>/de europa|de america|antiguedad|edad media|nobel/i.test(q)),'sugerencias de ficción no usan geografía/historia del mundo real');
let p=K.crearPlantilla('Personaje de prueba');assert.strictEqual(K.preguntaSiguiente(p).concepto,'real','la ficha nueva pregunta primero si es real');
// Tres dispositivos independientes; cada uno aporta el mismo hecho y el paquete viaja entre dispositivos.
function device(id){mem.clear();global.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};K=require('./conocimiento.js');global.localStorage.setItem('mind_knowledge_device_v1',id);}
device('dev-a');K.registrarVoto('Personaje de prueba','real',false,p);let pack=K.exportar();
device('dev-b');K.importar(pack);K.registrarVoto('Personaje de prueba','real',false,p);pack=K.exportar();
device('dev-c');K.importar(pack);K.registrarVoto('Personaje de prueba','real',false,p);
assert.strictEqual(K.estado('Personaje de prueba','real').confidence,'confirmed','tres dispositivos coincidentes confirman');
assert.strictEqual(K.enriquecer(K.crearPlantilla('Personaje de prueba')).tipo,'ficticio','la inferencia usa dato confirmado');
K.plantilla('Erling Haaland',{tipo:'real',genero:'hombre',humano:true,vivo:true,famoso:true,etiquetas:['deportista','futbolista'],universo:'real',datosPendientes:false});assert(K.listarJugables().some(x=>x.nombre==='Erling Haaland'),'una ficha completada queda disponible para partidas');
console.log('Conocimiento OK: inferencia, datos desconocidos, sugerencias contextuales, plantilla y confirmación entre 3 dispositivos.');
