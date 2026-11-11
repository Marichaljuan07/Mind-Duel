'use strict';
const fs=require('fs'),assert=require('assert');
let pass=0,fail=0;
function test(name,fn){try{fn();console.log('PASS | '+name);pass++;}catch(e){console.error('FAIL | '+name+' | '+e.message);fail++;}}
const script=fs.readFileSync(__dirname+'/script.js','utf8');
const catalog=fs.readFileSync(__dirname+'/catalogo_personajes.js','utf8');
const index=fs.readFileSync(__dirname+'/index.html','utf8');
const packs=fs.readFileSync(__dirname+'/packs.js','utf8');
const knowledge=fs.readFileSync(__dirname+'/conocimiento.js','utf8');
const soloStart=script.indexOf('async function startGame()');
const classicStart=script.indexOf('async function startClassic()');
test('Solo inicia el reloj al mostrar la interfaz, antes del diálogo',()=>{const b=script.slice(soloStart,script.indexOf('\nfunction lockInput',soloStart));assert(b.indexOf('show(ui.game)')<b.indexOf('startTimer(machineStartedAt)'));assert(b.indexOf('startTimer(machineStartedAt)')<b.indexOf('await addMessage('));});
test('Clásico inicia el reloj al mostrar la interfaz, antes de presentarse',()=>{const b=script.slice(classicStart,script.indexOf('\nasync function processClassicSparring',classicStart));assert(b.indexOf('show(ui.game)')<b.indexOf('startTimer(machineStartedAt)'));assert(b.indexOf('startTimer(machineStartedAt)')<b.indexOf('await addMessage('));});
test('el reloj usa una marca temporal absoluta y no reinicia por mensajes',()=>{assert(script.includes('function startTimer(originTimestamp)'));assert(script.includes('Date.now() - startedAt'));});
test('la pantalla final tiene una única zona para imagen y descripción',()=>{assert(index.includes('id="resultIdentity"'));const b=script.slice(script.indexOf('function mostrarPreguntaAprendizaje'),script.indexOf('window.MindDuelLearningPrompt'));assert(!b.includes('learning-character-image'));assert(!b.includes('learning-character-copy'));});
test('el aprendizaje usa una frase natural y no expone coincidencias entre dispositivos',()=>{const b=script.slice(script.indexOf('function mostrarPreguntaAprendizaje'),script.indexOf('window.MindDuelLearningPrompt'));assert(b.includes('Tu respuesta me ayudará a afinar mis próximas deducciones.'));assert(!b.includes('coincidencia de varias partidas/dispositivos'));});
test('el Cerebro ya no dice anotado ni queda registrado al revelar el nombre',()=>{const b=script.slice(script.indexOf('async function classicSaveName'),script.indexOf('function pickLine',script.indexOf('async function classicSaveName')));assert(!/Anotado:|Queda registrado:/.test(b));});
test('si el filtro deja cero candidatos, Clásico recupera hipótesis en lugar de pedir el nombre',()=>{assert(script.includes('Clasico.recuperarCandidatos?.(s,MindLogic,classic.rejectedGuesses||[])'));assert(script.includes('classic.rejectedGuesses.add(c.i)'));});
test('la deducción conserva los dos intentos antes de pedir revelar el nombre',()=>{const b=script.slice(script.indexOf('async function classicAnswer'),script.indexOf('async function shutdown',script.indexOf('async function classicAnswer')));assert(script.includes('if (classic.fails >= MAX_GUESSES) { await classicName(); return; }'));assert(b.includes('classic.rejectedGuesses.add(c.i)'));});
test('el catálogo no muestra etiquetas de verificación',()=>{assert(!catalog.includes("' · Verificada'"));assert(!catalog.includes("' · Pendiente de revisión'"));assert(!catalog.includes('Estado de ficha:'));assert(!catalog.includes('profileVerifyCharacter'));});
test('guardar con clave envía la ficha como verificada en una sola acción',()=>{assert(catalog.includes("body:JSON.stringify({...data,status:'verified'})"));assert(catalog.includes("method:'POST'"));assert(!index.includes('GUARDAR Y VERIFICAR'));});
test('guardar sin clave conserva copia local sin mostrar estado de verificación',()=>{assert(catalog.includes("_localOnly:true"));assert(catalog.includes("status.textContent=localOnly?'Cambios guardados en este dispositivo.'"));});
test('la plantilla conserva contenido y datos de la fuente',()=>{assert(catalog.includes("'contenido_fuente','datos_fuente','_contenidoFuente'"));});
test('MindPacks respeta la pregunta siguiente elegida por el sistema de conocimiento',()=>{assert(packs.includes('return K.preguntaSiguiente?.(p)||null;'));assert(!packs.slice(packs.indexOf('function preguntaAprendizaje'),packs.indexOf('// ---------------------------------------------------------------- INSTALACIÓN')).includes('for(const q of K.QUESTIONS)'));});
test('el selector de aprendizaje evita repetir las últimas preguntas por personaje',()=>{assert(knowledge.includes("read('mind_learning_questions_seen_v1',{})"));assert(knowledge.includes('seenDb[k]=[...(Array.isArray(seenDb[k])?seenDb[k]:[]),chosen.concepto].slice(-12)'));});

test('el bloqueo de sugerencias no repite avisos en el chat',()=>{const b=script.slice(script.indexOf('function openSuggestions'),script.indexOf('function pistaClave'));assert(!b.includes('addMessage('));});
const vm=require('vm');const peopleCtx={};vm.createContext(peopleCtx);vm.runInContext(fs.readFileSync(__dirname+'/personajes.js','utf8')+';this.people=PERSONAJES;',peopleCtx);const pacman=peopleCtx.people.find(p=>p.nombre==='Pac-Man');const Solo=require('./solo.js');const L={normalizar:v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()};
test('Solo responde preguntas básicas de Pac-Man con datos explícitos de su ficha',()=>{assert(pacman);for(const q of ['¿Es una deidad?','¿Es un dios?','¿Es un animal?','¿Es un alien?','¿Es un mago?'])assert.equal(Solo.deducir(L,q,pacman)?.nivel,'no',q);});
test('la pista de Pac-Man habla del origen de la franquicia y no de su lugar de nacimiento',()=>{const b=fs.readFileSync(__dirname+'/solo.js','utf8');assert(b.includes('La franquicia que lo vio nacer surgió en Oriente.'));});


const oldWindow=global.window,oldSugeridor=global.Sugeridor;
global.window={MindKnowledge:{conceptoDePregunta:()=>null}};
global.Sugeridor={POOL:[],val:(logic,q,p)=>{const t=L.normalizar(q);if(/persona real/.test(t))return p.real;if(/humano/.test(t))return p.humano;return null;},preguntasContextuales:()=>[]};
const Clasico=require('./clasico.js');
test('Clásico recupera candidatos cuando todas las fichas quedan contradichas',()=>{const st=Clasico.nuevo([{nombre:'A',real:false,humano:false},{nombre:'B',real:false,humano:false}]);Clasico.responder(st,L,'¿Es una persona real?','si');Clasico.responder(st,L,'¿Es humano?','si');assert.equal(Clasico.descartarContradichos(st,L,2).mejor,null);assert(Clasico.recuperarCandidatos(st,L,[]));});
global.window=oldWindow;global.Sugeridor=oldSugeridor;

console.log(`Resultado 3.14.26: ${pass} aprobadas, ${fail} fallidas.`);
if(fail)process.exit(1);
