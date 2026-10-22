(() => {
'use strict';
const MAX_QUESTIONS = 20;
const MAX_GUESSES = 2;
const SUGGESTION_LIMIT = 5;

const el = id => document.getElementById(id);
const ui = {
  arcade: el('arcade'),
  flash: el('flash'),
  title: el('titleScreen'),
  introBrain: el('introBrain'),
  titleLayout: el('titleLayout'),
  stage: el('stageScreen'),
  stageDialog: el('stageDialog'),
  stageActions: el('stageActions'),
  stageMenu: el('stageMenu'),
  soloBtn: el('soloBtn'),
  espejoBtn: el('espejoBtn'),
  dueloBtn: el('dueloBtn'),
  menuBackBtn: el('menuBackBtn'),
  curtainLeft: el('curtainLeft'),
  curtainRight: el('curtainRight'),
  continueBtn: el('continueBtn'),
  backTitleBtn: el('backTitleBtn'),
  game: el('gameScreen'),
  result: el('resultScreen'),
  chat: el('chat'),
  timer: el('timer'),
  questions: el('questionsHud'),
  guesses: el('guessesHud'),
  form: el('questionForm'),
  input: el('questionInput'),
  send: el('sendBtn'),
  suggest: el('suggestBtn'),
  guess: el('guessBtn'),
  guessModal: el('guessModal'),
  guessInput: el('guessInput'),
  guessHint: el('guessHint'),
  suggestModal: el('suggestModal'),
  suggestions: el('suggestions'),
  resultTag: el('resultTag'),
  resultTitle: el('resultTitle'),
  resultCharacter: el('resultCharacter'),
  resultDescription: el('resultDescription'),
  shutdown: el('shutdownScreen')
};

const state = {
  secret: null,
  active: false,
  busy: false,
  questionCount: 0,
  guessesLeft: MAX_GUESSES,
  suggestionUses: SUGGESTION_LIMIT,
  suggestionSession: { options: [], rerolls: 0, initialized: false },
  consecutiveNo: 0,
  hintsGiven: 0,
  asked: new Set(),
  facts: [],
  timerId: null,
  seconds: 0
};
window.setMindDuelMode = mode => { state.mode = mode; };

const suggestionPool = [
  '¿Es una persona real?', '¿Es ficticio?', '¿Es una mujer?', '¿Es un hombre?',
  '¿Sigue con vida?', '¿Es humano?', '¿Es de Europa?', '¿Es de América?',
  '¿Es científico?', '¿Es artista?', '¿Es escritor?', '¿Es un superhéroe?',
  '¿Tiene poderes?', '¿Usa magia?', '¿Aparece en películas?', '¿Aparece en libros?',
  '¿Aparece en cómics?', '¿Es de Marvel?', '¿Es de DC Comics?', '¿Es de Harry Potter?',
  '¿Es de Star Wars?'
];

let sayToken = 0;
let activeStageDialogue = null;
let activeTypingMessage = null;
let messageQueue = Promise.resolve();
let classicBusy = false;
let machineStartedAt = 0;
let classicSecretName = '';
let machineReturnToStage = true;
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function show(screen) { sayToken++; [ui.title, ui.stage, ui.game, ui.result].forEach(s => s.classList.add('hidden')); screen.classList.remove('hidden'); }
function flash() { ui.flash.classList.remove('fire'); void ui.flash.offsetWidth; ui.flash.classList.add('fire'); }


// =========================================================
// SEQUENCIA CINEMATOGRÁFICA DE INICIO (CEREBRO + RAYOS)
// =========================================================
async function titleSequence() {
  clearInterval(state.timerId);
  state.active = false;
  ui.arcade.classList.remove('shutdown');
  ui.shutdown.classList.add('hidden');
  
  show(ui.title);
  ui.titleLayout.classList.add('hidden');
  ui.introBrain.classList.add('hidden');

  // 1. Aparece el CEREBRO solo
  await sleep(900);
  ui.introBrain.classList.remove('hidden');
  
  // 2. Se desvanece
  await sleep(1700);
  ui.introBrain.classList.add('hidden');

  // 3. ¡CAE UN RAYO!
  await sleep(800);
  flash();

  // 4. Aparece el cerebro de nuevo
  await sleep(1200);
  ui.introBrain.classList.remove('hidden');

  // 5. ¡CAE OTRO RAYO Y SE REVELA EL TÍTULO "MIND DUEL"!
  await sleep(1200);
  flash();
  await sleep(450);
  ui.introBrain.classList.add('hidden');
  ui.titleLayout.classList.remove('hidden');
}

// =========================================================
// ACTO DEL TEATRO: APERTURA DE TELÓN Y NORMAS
// =========================================================
const ORACULO = {
  main: 'Una elección audaz. El telón se alza. Veamos qué camino eliges, mortal.',
  menuReturn: 'Bienvenido de nuevo, mortal. El escenario está listo: elegí cómo querés jugar o volvé cuando quieras.',
  classicReturn: 'Muy bien, dejamos la revancha para después. Podés iniciar o continuar una partida, consultar el historial o volver al menú anterior.',
  classicChooseCharacter: 'Pensá en un personaje real o ficticio y escribí su nombre. Cuando estés listo, empezamos una nueva partida clásica.',
  classicSetupReturn: 'El modo clásico sigue disponible, mortal. Si querés probar de nuevo, aceptá y elegí un personaje; si no, podés volver al menú principal.',
  solo: '¿Un desafío solitario? Pretendes enfrentarte a la infinidad de mi mente sin ayuda... Interesante.',
  espejo: 'El Espejo aún se está puliendo, mortal. Vuelve cuando el cristal esté listo.',
  duelo: 'El duelo entre mortales necesita un puente que todavía no he tendido. Paciencia.',
  huir: 'Tu mente no está lista...',
  repetida: 'Ya has preguntado eso antes, mortal. Mi memoria es perfecta.',
  strike1: 'No puedo adivinar el vacío. ¡Escribe un nombre!',
  strike2: '¿Intentas agotar mi paciencia? Escribe una respuesta o cancela.',
  strike3: 'Has agotado mi paciencia. El privilegio de adivinar te ha sido revocado... por ahora.',
  vuelve: 'Te devuelvo el derecho de adivinar. No lo malgastes.',
  clasico: 'Invertimos los papeles, mortal. Piensa en un personaje, real o ficticio, y yo intentaré adivinarlo en 20 preguntas.',
  bloqueada: 'Aún no puedo guiarte. Averigua lo básico: ¿real o ficticio? ¿hombre o mujer? ¿humano?'
};

// Diálogos contextuales: cada pantalla alterna sus propias variantes, sin alterar la lógica del juego.
const stageDialogueTurns = Object.create(null);
function nextStageDialogue(key, variants) {
  const list = Array.isArray(variants) ? variants : [variants];
  const turn = stageDialogueTurns[key] || 0;
  stageDialogueTurns[key] = turn + 1;
  return list[turn % list.length];
}

async function say(html, ms = 42, allowDoubleTapSkip = false, easterEggOnSkip = false) {
  const my = ++sayToken;
  const speech = { token: my, skip: Boolean(stageFastForwardRequested && allowDoubleTapSkip), allowDoubleTapSkip, easterEggOnSkip, easterEggText: '' };
  if(speech.skip && easterEggOnSkip) speech.easterEggText=stageQuips[Math.floor(Math.random()*stageQuips.length)];
  if(allowDoubleTapSkip) stageFastForwardRequested=false;
  activeStageDialogue = speech;
  let out = '', i = 0;
  ui.stageDialog.innerHTML = '';
  while (i < html.length) {
    if (my !== sayToken) { if (activeStageDialogue === speech) activeStageDialogue = null; return false; }
    if (speech.skip) { ui.stageDialog.innerHTML = html + (speech.easterEggText ? '<br><br><em>' + speech.easterEggText + '</em>' : ''); break; }
    if (html[i] === '<') { const j = html.indexOf('>', i); out += html.slice(i, j + 1); i = j + 1; }
    else {
      const ch = html[i++]; out += ch;
      await sleep(/[.!?…]/.test(ch) ? ms * 5 : /[,;:]/.test(ch) ? ms * 2.2 : ms);
    }
    if (speech.skip) { ui.stageDialog.innerHTML = html + (speech.easterEggText ? '<br><br><em>' + speech.easterEggText + '</em>' : ''); break; }
    ui.stageDialog.innerHTML = out;
  }
  if (activeStageDialogue === speech) activeStageDialogue = null;
  return my === sayToken;
}

async function closeStageCurtain(wait = 2600) {
  ui.stage.classList.remove('stage-ready', 'spotlight-on');
  // Vaciar el bocadillo antes de que el telón se cierre: nunca debe sobrevivir el diálogo anterior.
  ui.stageDialog.innerHTML = '';
  ui.curtainLeft.classList.remove('open');
  ui.curtainRight.classList.remove('open');
  await sleep(wait);
}
async function openStageCurtain(wait = 2600) {
  ui.stageDialog.innerHTML = '';
  stageCurtainOpening=true;
  ui.stage?.classList.remove('curtain-fast-open');
  ui.curtainLeft.classList.add('open');
  ui.curtainRight.classList.add('open');
  if(stageFastForwardRequested){ui.stage?.classList.add('curtain-fast-open');}
  else await Promise.race([sleep(wait),new Promise(resolve=>{releaseCurtainWait=resolve;})]);
  releaseCurtainWait=null; stageCurtainOpening=false;
  ui.stageDialog.innerHTML = '';
}

async function openStage() {
  const firstWelcomeForThisPage = !stageWelcomeEggUsed;
  stageSequenceActive=true; stageFastForwardRequested=false;
  window.MindDuelCleanupForMode?.();
  classicSetMode(false);
  clearInterval(state.timerId);
  state.active = false;
  show(ui.stage);
  ui.stage.classList.remove('stage-ready');
  ui.curtainLeft.classList.remove('open');
  ui.curtainRight.classList.remove('open');
  ui.stageDialog.innerHTML = '';
  ui.stageMenu.classList.add('hidden');
  ui.stageActions.classList.add('hidden');
  el('machineModeChoice')?.classList.add('hidden');
  el('classicSecretNameForm')?.classList.add('hidden');

  ui.stage.classList.remove('spotlight-on');
  await sleep(900);
  await openStageCurtain(2800);
  ui.stage.classList.add('spotlight-on');
  if(!stageFastForwardRequested) await sleep(1500);
  const menuWelcome = firstWelcomeForThisPage
    ? `${ORACULO.main}<br><br>¿Enfrentarás sola mi mente, o buscas compañía?`
    : `${nextStageDialogue('menuReturn', [ORACULO.menuReturn, 'Otra vez por aquí, mortal. El telón ya te conoce. ¿Qué desafío querés abrir ahora?'])}<br><br>¿Qué modo elegís esta vez?`;
  if (await say(`<strong>CEREBRO:</strong> ${menuWelcome}`, 42, true, firstWelcomeForThisPage)) {
    // La bienvenida inicial y su frase especial solo pueden aparecer una vez por carga.
    stageWelcomeEggUsed = true;
    ui.stageMenu.classList.remove('hidden');
    ui.stage.classList.add('stage-ready');
  }
  stageSequenceActive=false; ui.stage?.classList.remove('curtain-fast-open');
}

function showMachineModeChoice(){
  ui.stageActions.classList.add('hidden');
  el('classicSecretNameForm')?.classList.add('hidden');
  const mode=state.pendingMode==='classic'?'classic':'solo';
  const has=window.SavedMatches?.hasMachineCurrent?.(mode)||false;
  el('machineContinueBtn')?.classList.toggle('hidden',!has);
  el('machineNewGameBtn').textContent=has?'NUEVA PARTIDA (REEMPLAZA LA ANTERIOR)':'NUEVA PARTIDA';
  el('machineModeChoice')?.classList.remove('hidden');
  ui.stage.classList.add('stage-ready');
}
function openMachineLibraryFromStage(){
  const mode=state.pendingMode==='classic'?'classic':'solo';
  window.SavedMatches?.openMachine?.(mode);
}
function continueSelectedMachineMode(){
  const mode=state.pendingMode==='classic'?'classic':'solo';
  if(!window.SavedMatches?.continueMachine?.(mode))showMachineModeChoice();
}
function showSelectedMachineHistory(){
  const mode=state.pendingMode==='classic'?'classic':'solo';
  window.SavedMatches?.showMachineHistory?.(mode);
}
async function startSelectedMachineMode(){
  const mode=state.pendingMode==='classic'?'classic':'solo';
  if(window.SavedMatches?.hasMachineCurrent?.(mode)&&!confirm('Empezar una partida nueva reemplazará la partida anterior de este modo. ¿Querés continuar?'))return;
  el('machineModeChoice')?.classList.add('hidden');
  if(state.pendingMode==='classic'){
    const form=el('classicSecretNameForm');
    if(form){form.classList.remove('hidden');el('classicSecretNameInput').value='';el('classicSecretNameInput').focus();}
    ui.stageDialog.innerHTML = `<strong>CEREBRO:</strong> ${nextStageDialogue('classicChooseCharacter', [ORACULO.classicChooseCharacter, 'Bien, mortal: pensá en alguien real o ficticio y escribí su nombre. Cuando lo tengas, pondremos a prueba mis deducciones.', 'Elegí un personaje y escribí su nombre. No me lo cuentes en el chat: voy a intentar descubrirlo con tus respuestas.'])}`;
    ui.stage.classList.add('stage-ready');
    return;
  }
  await startGame();
}
async function chooseSolo() {
  stageSequenceActive=true; stageFastForwardRequested=false;
  state.pendingMode = 'solo';
  ui.stageMenu.classList.add('hidden');
  await closeStageCurtain(2600);
  await openStageCurtain(2800);
  const soloIntro = nextStageDialogue('soloIntro', [ORACULO.solo, '¿Volvés a desafiarme a solas, mortal? Veamos si esta vez lográs seguir mis deducciones.', 'Sin compañía otra vez. Perfecto: una mente contra otra. ¿Aceptás el desafío?']);
  const ok = await say(`<strong>CEREBRO:</strong> ${soloIntro}<br><br>He elegido a una entidad secreta.<br><span style="color:#00ff67">Tienes 20 preguntas y 2 intentos para adivinar.</span><br>Respuestas estrictas de SÍ o NO.<br><br>¿Aceptas el duelo?`, 42, true, false);
  if (ok) { ui.stageActions.classList.remove('hidden'); ui.stage.classList.add('stage-ready'); }
  stageSequenceActive=false; ui.stage?.classList.remove('curtain-fast-open');
}

async function cancelStageAndReturn() {
  ui.stageMenu.classList.add('hidden');
  ui.stageActions.classList.add('hidden');
  el('machineModeChoice')?.classList.add('hidden');
  el('classicSecretNameForm')?.classList.add('hidden');
  await closeStageCurtain(2600);
  ui.stageDialog.innerHTML = `<strong>CEREBRO:</strong> ${ORACULO.huir}`;
  ui.stage.classList.add('stage-ready');
  await sleep(1500);
  titleSequence();
}


// =========================================================
// MODO CLÁSICO: el Cerebro adivina tu personaje
// =========================================================
const CL_LABEL = { si: 'SÍ', no: 'NO', nose: 'NO LO SÉ', psi: 'PROBABLEMENTE SÍ', pno: 'PROBABLEMENTE NO' };
const classic = { s: null, cur: null, fails: 0, phase: 'ask' };
const $cl = id => document.getElementById(id);

function classicSetMode(on) {
  if(on) document.body.classList.remove('duel-online','duel-brain','duel-guess');
  document.body.classList.toggle('classic', on);
  const modeHud = el('modeHud'); if (modeHud) modeHud.textContent = on ? 'CLÁSICO' : 'SOLO';
  document.body.classList.remove('name-phase');
  $cl('classicPanel').classList.toggle('hidden', !on);
  $cl('classicEnd').classList.add('hidden');
  const secretLabel = el('onlineSecretLabel');
  if (secretLabel && !on) { secretLabel.classList.add('hidden'); secretLabel.textContent = ''; }
  state.mode = on ? 'classic' : 'solo';
  ui.input.placeholder = 'Pregunta de sí/no...';
}

async function chooseClassic() {
  stageSequenceActive=true; stageFastForwardRequested=false;
  state.pendingMode = 'classic';
  ui.stageMenu.classList.add('hidden');
  await closeStageCurtain(2600);
  await openStageCurtain(2800);
  const classicIntro = nextStageDialogue('classicIntro', [ORACULO.clasico, 'Ahora me toca descubrir a tu personaje, mortal. Pensá en alguien real o ficticio y responderás mis preguntas.', 'Cambiamos los papeles: vos elegís a alguien y yo trataré de descubrirlo paso a paso.']);
  const ok = await say(`<strong>CEREBRO:</strong> ${classicIntro}<br><br>Responderás con los botones: SÍ, NO, NO LO SÉ, PROBABLEMENTE SÍ o PROBABLEMENTE NO.<br><br>¿Aceptas el duelo?`, 42, true, false);
  if (ok) { ui.stageActions.classList.remove('hidden'); ui.stage.classList.add('stage-ready'); }
  stageSequenceActive=false; ui.stage?.classList.remove('curtain-fast-open');
}

async function startClassic() {
  machineStartedAt = Date.now();
  window.MindDuelCleanupForMode?.();
  resetGame();
  classicSetMode(true);
  window.MatchHistory?.begin('clásico');
  classic.s = Clasico.nuevo(PERSONAJES);
  classic.cur = null; classic.fails = 0; classic.phase = 'ask';
  classicBusy = true;
  state.guessesLeft = MAX_GUESSES; updateHud();
  show(ui.game);
  const chosen=el('classicChosenCharacter'); if(chosen) chosen.textContent='';
  const secretLabel=el('onlineSecretLabel'); if(secretLabel){secretLabel.textContent='PERSONAJE ELEGIDO: '+classicSecretName;secretLabel.classList.remove('hidden');}
  classicBusy = false;
  await addMessage('Ya elegiste tu personaje. Voy a intentar descubrirlo con tus respuestas; no hace falta que me lo reveles en el chat.', 'mind');
  startTimer();
  // La pregunta inicial se solicita después de que termine la presentación.
  classicBusy = false;
  await nextClassic();
}

async function nextClassic() {
  if (classicBusy || classic.phase === 'end' || classic.phase === 'name') return;
  classicBusy = true;
  const s = classic.s;
  state.questionCount = s.n; state.guessesLeft = Math.max(0, MAX_GUESSES - classic.fails); updateHud();
  if (Clasico.debeAdivinar(s) || s.n >= MAX_QUESTIONS) return classicGuess(true);
  let q = Clasico.pregunta(s, MindLogic);
  // El banco puede no dividir al conjunto inicial; no dejar nunca al Cerebro sin preguntar.
  if (!q) {
    const fallback = ['¿Es una persona real?','¿Es ficticio?','¿Es humano?','¿Es conocido principalmente por la ciencia?','¿Es conocido por el entretenimiento?'];
    q = fallback.find(x => !s.asked.has(MindLogic.normalizar(x))); 
  }
  if (!q) return classicGuess(true);
  classic.cur = { tipo: 'q', q };
  await addMessage(Clasico.frase(q), 'mind');
  classicBusy = false;
}

async function classicGuess(announce = false) {
  classicBusy = true;
  const m = Clasico.mejor(classic.s);
  if (!m) return classicName();
  classic.cur = { tipo: 'g', i: m.i, p: m.p };
  if (announce) {
    const lines = [
      'He revisado tus respuestas y voy a arriesgarme con un nombre.',
      'Creo que ya tengo una buena pista… voy a adivinar.',
      'Es momento de poner a prueba mi deducción: voy a adivinar.',
      'Con lo que me contaste, tengo una sospecha. Voy a probar.',
      'Voy a jugármela: creo que sé qué personaje elegiste.'
    ];
    await addMessage(lines[Math.floor(Math.random() * lines.length)], 'mind');
  }
  el('classicGuessCharacter').textContent = m.p.nombre;
  const knownDescription = getCharacterDescription(m.p.nombre, m.p.descripcion || '');
  const descriptionEl = el('classicGuessDescription');
  if (descriptionEl) { descriptionEl.textContent = knownDescription; descriptionEl.classList.toggle('hidden', !knownDescription); }
  el('classicGuessModal').classList.remove('hidden');
  classicBusy = false;
}

async function classicName() {
  classicBusy = true;
  classic.cur = null; classic.phase = 'name';
  if (classicSecretName.trim()) { await addMessage('No logré descubrirlo. Reconozco tu victoria.', 'mind'); const known=findKnownCharacter(classicSecretName); const saved=localStorage.getItem('mind_character_description_'+classicSecretName)||''; return classicEnd({wonBy:'player',nombre:classicSecretName,descripcion:(known&&known.descripcion)||saved||'El Cerebro no logró identificar tu personaje.'}); }
  await addMessage('No he logrado identificarlo. Decime en quién estabas pensando y lo anotamos.', 'mind');
  document.body.classList.add('name-phase');
  $cl('classicPanel').classList.add('hidden');
  ui.resultTag.textContent='MODO CLÁSICO';
  ui.resultTitle.textContent='¡EL CEREBRO NO LO DESCIFRÓ!';
  ui.resultCharacter.textContent='Tu personaje sigue siendo un misterio.';
  ui.resultDescription.textContent='Tu victoria está casi lista. Contame quién era para mostrar el resultado final.';
  el('resultActions').classList.add('hidden');
  el('classicCharacterNameForm').classList.remove('hidden');
  show(ui.result);
  el('classicCharacterNameInput').value='';
  el('classicCharacterNameInput').focus();
}

async function classicSaveName(text) {
  const nombre = text.trim();
  if (!nombre) return;
  await addMessage(nombre, 'player');
  try {
    const k = 'mind_personajes_nuevos';
    const l = JSON.parse(localStorage.getItem(k) || '[]');
    l.push({ nombre, fecha: new Date().toISOString(), respuestas: classic.s.log });
    localStorage.setItem(k, JSON.stringify(l));
  } catch (e) {}
  await addMessage(`Anotado: ${nombre}. Me has superado esta vez. Disfruta tu victoria; volveré mejor preparado.`, 'mind');
  const known=findKnownCharacter(nombre); const saved=localStorage.getItem('mind_character_description_'+nombre)||''; classicEnd({wonBy:'player', nombre, descripcion:(known&&known.descripcion)||saved||'El Cerebro no logró identificar tu personaje.'});
}

function pickLine(lines) { return lines[Math.floor(Math.random() * lines.length)]; }
// Burlas claras y fáciles de entender. Las referencias al personaje son un extra, no un requisito.
function mindDuelTaunt(name, brainWon) {
  const n = String(name || '').trim() || 'este personaje';
  const norm = (typeof MindLogic !== 'undefined' ? MindLogic.normalizar(n) : n.toLowerCase());
  const specific = norm.includes('julio cesar') ? {
    win: ['¡JAJAJA! ¡Yo conquisté territorios y vos no pudiste conquistar una respuesta! ¡Qué papelón!', '¡Te di oportunidades de sobra y aun así no me descubriste! ¡Hasta Roma habría tenido más suerte que vos!'],
    lose: ['¡¿Me ganaste vos?! ¡Yo conquisté Roma y terminé perdiendo contra alguien que juega desde el celular! ¡Qué vergüenza!', '¡Esto es una humillación! ¡Disfrutá tu victoria, emperador de sillón, que no te va a durar para siempre!']
  } : norm.includes('albert einstein') || norm === 'einstein' ? {
    win: ['¡JAJAJA! ¡Tanta inteligencia en el mundo y no alcanzó para que me descubrieras! ¡Qué cerebro el tuyo!', '¡No pudiste adivinar quién soy! Tranquilo, no todo el mundo puede tener dos dedos de frente… aunque vos hoy te esforzaste poco.'],
    lose: ['¡¿Vos me ganaste?! Bueno, parece que hoy la inteligencia no estuvo de mi lado. ¡Pero no te agrandes, que ganar una partida no te convierte en Einstein!', '¡Esto no tiene sentido! Bueno, sí lo tiene… ¡pero igual me niego a aceptar que me hayas ganado tan fácilmente!']
  } : norm.includes('napoleon') ? {
    win: ['¡JAJAJA! ¡Yo gané batallas históricas y vos no pudiste ganar ni esta partida! ¡Retirada, soldado!', '¡Qué desastre! Te di todas las oportunidades del mundo y aun así fracasaste. ¡No te acerques más al campo de batalla!'],
    lose: ['¡¿Me derrotaste?! ¡Esto es una humillación! ¡Ganaste una partida y ya te creés dueño del mundo! ¡Bajá un poquito, campeón!', '¡Exijo la revancha! ¡No pienso dejar que presumas toda la semana por haberme ganado una sola vez!']
  } : null;
  const genericWin = [
    `¡JAJAJA! ¡Tantas preguntas y ni así descubriste quién soy: ${n}! ¡No te preocupes, la próxima capaz que tenés más suerte!`,
    `¡No puede ser! Te di un montón de oportunidades y no pudiste descubrirme. ¡${n} te ganó y ni siquiera tuvo que moverse!`,
    `¡Victoria para mí! ¡Después de tantas pistas, seguís sin saber quién soy! ¡Qué talento para perderte lo evidente!`
  ];
  const genericLose = [
    `¡¿Qué?! ¡¿Me ganaste?! ¡Esto es una vergüenza! ¡Disfrutá tu momento de gloria, detective, que no siempre vas a tener tanta suerte!`,
    `¡No me lo puedo creer! ¡Me descubriste! Bueno, no te agrandes… ¡que ganar una partida no te convierte en un genio!`,
    `¡Protesto! ¡Esto no cuenta! ¡Yo estaba pensando en ${n} y vos tuviste la suerte de acertar! ¡Quiero la revancha!`
  ];
  const pool = specific ? (brainWon ? specific.win : specific.lose) : (brainWon ? genericWin : genericLose);
  return pool[Math.floor(Math.random() * pool.length)];
}
window.MindDuelTaunt = mindDuelTaunt;
const CLASSIC_BRAIN_WIN_LINES = [
  n => `¡JAJAJA! ¡Tu personaje era ${n} y terminé encontrándolo! Me hiciste trabajar con cada respuesta, pero el Cerebro cerró el caso.`,
  n => `¡Caso resuelto! ${n} no pudo esconderse detrás de tus respuestas. Disfrutá esta ronda de calentamiento; en la próxima voy a ir más rápido.`,
  n => `¡Lo sabía! Entre todas las pistas, ${n} terminó apareciendo. No confundas una partida con una victoria asegurada.`
];
const CLASSIC_PLAYER_WIN_LINES = [
  n => `¡¿Cómo se me escapó ${n}?! Me diste una respuesta detrás de otra y aun así no logré descubrirlo. Disfrutá la victoria: voy a estudiar mis errores.`,
  n => `¡Esta vez me ganaste! ${n} me dejó sin respuesta. Celebralo ahora, porque la próxima partida voy a elegir mejor mis preguntas.`,
  n => `¡Increíble! Tu personaje era ${n} y mis deducciones no alcanzaron. Te llevás esta ronda, pero no te acostumbres.`
];
function findKnownCharacter(name){try{return (PERSONAJES||[]).find(p=>MindLogic.normalizar(p.nombre)===MindLogic.normalizar(name))||null;}catch{return null;}}
function getCharacterDescription(name, fallback=''){
  const key='mind_character_description_'+String(name||'');
  try { const custom=localStorage.getItem(key); if(custom && custom.trim()) return custom.trim(); } catch {}
  const known=findKnownCharacter(name);
  return String((known && known.descripcion) || fallback || '').trim();
}
async function classicEnd(result = {}) {
  el('playAgainBtn')?.classList.add('hidden');
  el('playAgainSwapRolesBtn')?.classList.add('hidden');
  if (classic.phase !== 'end') window.MatchHistory?.finish(result.wonBy === 'brain' ? 'Victoria del Cerebro' : result.wonBy === 'player' ? 'Victoria del jugador' : 'Finalizada', {modo:'clásico', personaje: result.nombre || ''});
  classic.phase = 'end'; classic.cur = null; classicBusy = true; state.active=false;
  clearInterval(state.timerId);
  document.body.classList.remove('name-phase');
  $cl('classicPanel').classList.add('hidden');
  const wonByBrain = result.wonBy === 'brain';
  el('classicCharacterNameForm').classList.add('hidden'); el('resultActions').classList.remove('hidden');
  ui.resultTag.textContent = 'MODO CLÁSICO';
  ui.resultTitle.textContent = wonByBrain ? 'HAS PERDIDO' : '¡HAS GANADO!';
  ui.resultCharacter.textContent = result.nombre ? `Tu personaje era: ${result.nombre}` : 'Personaje no identificado';
  const characterDescription = getCharacterDescription(result.nombre, result.descripcion);
  const tauntPool = wonByBrain ? CLASSIC_BRAIN_WIN_LINES : CLASSIC_PLAYER_WIN_LINES;
  const classicTaunt = pickLine(tauntPool)(result.nombre || classicSecretName || 'tu personaje');
  ui.resultDescription.textContent = [characterDescription, classicTaunt].filter(Boolean).join(' ');
  el('playAgainBtn')?.classList.remove('hidden'); el('playAgainBtn').textContent='JUGAR DE NUEVO';
  const editBtn=el('editCharacterBtn'); if(editBtn) editBtn.classList.toggle('hidden', !result.nombre);
  show(ui.result);
  ui.input.placeholder = 'Pregunta de sí/no...';
  classicBusy = false;
  try { if(classicSecretName && !findKnownCharacter(classicSecretName)){ const k='mind_personajes_nuevos'; const rows=JSON.parse(localStorage.getItem(k)||'[]'); const norm=MindLogic.normalizar(classicSecretName); const ix=rows.findIndex(x=>MindLogic.normalizar(x.nombre||'')===norm); const entry={nombre:classicSecretName,fecha:new Date(machineStartedAt||Date.now()).toISOString(),respuestas:classic.s?.log||[],origen:'clásico',resultado:wonByBrain?'cerebro':'jugador'}; if(ix>=0) rows[ix]={...rows[ix],...entry}; else rows.push(entry); localStorage.setItem(k,JSON.stringify(rows)); } } catch {}
  machineAutosave();
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function classicAnswer(ans) {
  const c = classic.cur;
  if (!c || classicBusy || classic.phase === 'end') return;
  classicBusy = true;
  if (c.tipo === 'q') await addMessage(CL_LABEL[ans], 'player');
  if (c.tipo === 'q') {
    Clasico.responder(classic.s, MindLogic, c.q, ans); machineAutosave();
    classicBusy = false;
    return nextClassic();
  }
  el('classicGuessModal').classList.add('hidden');
  if (ans === 'si' || ans === 'psi') {
    await addMessage(`¡Lo sabía! Eras ${c.p.nombre}.`, 'mind');
    await classicEnd({wonBy:'brain', nombre:c.p.nombre, descripcion:c.p.descripcion || 'El personaje que estabas pensando.'});
    return;
  }
  classic.fails++; Clasico.rechazar(classic.s, c.i);
  if (classic.fails >= MAX_GUESSES || !Clasico.mejor(classic.s)) return classicName();
  await addMessage('Esa no era. No importa: reajusto mis deducciones y continúo.', 'mind');
  classicBusy = false;
  await nextClassic();
}

function machineSnapshot(){
 const mode=state.mode==='classic'?'CLASSIC':'SOLO';
 let classicData=null;
 if(mode==='CLASSIC'&&classic.s){classicData={weights:classic.s.w.slice(),asked:[...classic.s.asked],log:classic.s.log.map(x=>({...x})),rejected:[...classic.s.rech],n:classic.s.n,phase:classic.phase,fails:classic.fails,cur:classic.cur?{tipo:classic.cur.tipo,q:classic.cur.q,i:classic.cur.i,p:classic.cur.p?classic.cur.p.nombre:undefined}:null};}
 const completed=state.mode==='classic'?classic.phase==='end':!state.active;
 return {mode,startedAt:machineStartedAt||Date.now(),savedAt:Date.now(),classicCharacterName:mode==='CLASSIC'?classicSecretName:'',status:completed?'completed':'in_progress',secretName:mode==='SOLO'?(state.secret?.nombre||''):'',secret:mode==='SOLO'&&state.secret?{nombre:state.secret.nombre,descripcion:state.secret.descripcion}:null,active:state.active,questionCount:state.questionCount,guessesLeft:state.guessesLeft,suggestionUses:state.suggestionUses,consecutiveNo:state.consecutiveNo,hintsGiven:state.hintsGiven,asked:[...state.asked],facts:state.facts.map(x=>({...x})),seconds:state.seconds,patience:state.patience,suggestionSession:state.suggestionSession?JSON.parse(JSON.stringify(state.suggestionSession)):null,classic:classicData,historyId:window.MatchHistory?.getCurrent?.()?.id||'',transcript:[...ui.chat.querySelectorAll('.message')].map(row=>({kind:[...row.classList].find(c=>c.startsWith('message-'))?.replace('message-','')||'system',text:row.querySelector('.bubble')?.textContent||''}))};
}
function machineAutosave(){if(document.body.classList.contains('duel-online')||!['classic','solo'].includes(state.mode))return;window.SavedMatches?.saveMachineCurrent?.(state.mode,machineSnapshot(),true);}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')machineAutosave();});
window.addEventListener('pagehide',()=>machineAutosave());
function resetGame() {
  clearInterval(state.timerId);
  state.secret = PERSONAJES[Math.floor(Math.random() * PERSONAJES.length)];
  state.active = true;
  state.busy = false;
  state.questionCount = 0;
  state.guessesLeft = MAX_GUESSES;
  state.suggestionUses = SUGGESTION_LIMIT;
  state.suggestionSession = { options: [], rerolls: 0, initialized: false };
  state.consecutiveNo = 0;
  state.hintsGiven = 0;
  state.asked.clear();
  state.facts = [];
  state.patience = 0;
  state.seconds = 0;
  ui.chat.textContent = '';
  updateHud();
  ui.guess.disabled = false;
  ui.input.disabled = false;
  ui.send.disabled = false;
}

function updateHud() {
  ui.questions.textContent = `${state.questionCount}/${MAX_QUESTIONS}`;
  ui.guesses.textContent = String(state.guessesLeft);
  const unlocked = window.Sugeridor ? Sugeridor.desbloqueada(MindLogic, PERSONAJES, state.facts) : state.questionCount >= 5;
  ui.suggest.textContent = unlocked ? `SUGERENCIAS (${state.suggestionUses})` : `SUGERENCIAS · ${Math.max(0,5-state.questionCount)} PREGUNTAS`;
  ui.suggest.classList.toggle('locked', !unlocked);
  ui.suggest.disabled = state.suggestionUses <= 0 || !state.active || state.mode === 'classic';
  ui.suggest.title = state.suggestionUses <= 0 ? 'Agotaste las sugerencias de esta partida' : !unlocked ? 'Se habilitan después de cinco preguntas válidas' : 'Sugerencias del Cerebro';
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.seconds++;
    const m = String(Math.floor(state.seconds / 60)).padStart(2, '0');
    const s = String(state.seconds % 60).padStart(2, '0');
    ui.timer.textContent = `${m}:${s}`;
  }, 1000);
}

function avatarFor(kind) {
  if (kind === 'mind') return { txt: '', cls: 'avatar-mind' };
  if (kind === 'player') return { txt: '', cls: 'avatar-player' };
  return { txt: '', cls: 'avatar-system' };
}

function renderMessage(text, kind = 'system') {
  return new Promise(async resolve => {
    const row = document.createElement('div');
    row.className = `message message-${kind}`;
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    const a = avatarFor(kind);
    avatar.textContent = a.txt;
    avatar.classList.add(a.cls);
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    row.append(avatar, bubble);
    ui.chat.append(row);
    const prefix = kind === 'player' ? 'TÚ: ' : kind === 'mind' ? 'CEREBRO: ' : 'SISTEMA: ';
    const fullText = prefix + String(text);
    const speed = kind === 'mind' ? 30 : kind === 'system' ? 22 : 12;
    const typing = { skip: false, row };
    activeTypingMessage = typing;
    for (let i = 1; i <= fullText.length; i++) {
      if (typing.skip) { bubble.textContent = fullText; break; }
      bubble.textContent = fullText.slice(0, i);
      ui.chat.scrollTop = ui.chat.scrollHeight;
      const ch = fullText[i - 1];
      await sleep(/[.!?…]/.test(ch) ? speed * 4 : /[,;:]/.test(ch) ? speed * 2 : speed);
    }
    bubble.textContent = fullText;
    ui.chat.scrollTop = ui.chat.scrollHeight;
    if (!typing.skip) await sleep(fullText.length < 24 ? 650 : 850);
    if (activeTypingMessage === typing) activeTypingMessage = null;
    resolve();
  });
}

function addMessage(text, kind = 'system') {
  // Guardar cada intervención en el historial persistente de la partida actual.
  window.MatchHistory?.record(kind === 'player' ? 'TÚ' : kind === 'mind' ? 'CEREBRO' : 'SISTEMA', text, kind);
  const task = messageQueue.then(() => renderMessage(text, kind));
  // Mantener la cola viva incluso si un navegador rechaza una operación de interfaz.
  messageQueue = task.catch(err => console.warn('[MIND] No se pudo mostrar un mensaje:', err));
  task.then(()=>machineAutosave());
  return task;
}

async function startGame() {
  machineStartedAt = Date.now();
  window.MindDuelCleanupForMode?.();
  ui.stage.classList.remove('stage-ready');
  ui.curtainLeft.classList.add('open'); ui.curtainRight.classList.add('open');
  await sleep(500);
  if (state.pendingMode === 'classic') { state.pendingMode = null; return startClassic(); }
  classicSetMode(false);
  const modeHud = el('modeHud'); if (modeHud) modeHud.textContent = 'SOLO';
  resetGame();
  window.MatchHistory?.begin('solo', {personaje: state.secret?.nombre || ''});
  show(ui.game);
  await addMessage('He elegido a alguien. Tienes veinte preguntas. Empieza.', 'mind');
  startTimer();
  setTimeout(() => ui.input.focus(), 80);
}

function lockInput(v) {
  state.busy = v;
  ui.input.disabled = v;
  ui.send.disabled = v;
}

async function askQuestion(text) {
  if (state.mode === 'classic') { if (classic.phase === 'name') classicSaveName(text); return; }
  if (!state.active || state.busy) return;
  const clean = text.trim();
  if (!clean) return;

  if (state.asked.has(MindLogic.normalizar(clean))) {
    addMessage(clean, 'player');
    addMessage(ORACULO.repetida, 'mind');
    return;
  }
  addMessage(clean, 'player');
  state.asked.add(MindLogic.normalizar(clean));
  lockInput(true);

  let answer = MindLogic.evaluarPregunta(clean, state.secret);
  let source = 'logic';
  let conceptoUsado = null;

  if (answer === null) {
    const interpreted = await interpretWithOraculo(clean);
    if (interpreted?.concepto) {
      answer = MindLogic.resolverConcepto(interpreted.concepto, state.secret);
      source = 'aria→logic';
      conceptoUsado = interpreted.concepto;
      if (interpreted.aprendio) addMessage('Aprendí una forma nueva de preguntar eso.', 'system');
    }
  }

  if (answer === null) {
    addMessage('Todavía no entiendo esa pregunta. La guardo para aprenderla. Probá decirlo de otra forma.', 'mind');
    lockInput(false);
    ui.input.focus();
    return;
  }

  state.facts.push({ texto: clean, concepto: conceptoUsado, answer: !!answer }); machineAutosave();
  state.questionCount++;
  if (answer) state.consecutiveNo = 0;
  else state.consecutiveNo++;
  updateHud();
  await addMessage(answer ? 'SÍ.' : 'NO.', 'mind');
  // Pista por progreso real, no por una racha de respuestas NO. Máximo tres pistas.
  if (state.mode !== 'classic' && state.questionCount % 5 === 0 && state.hintsGiven < 3) {
    state.hintsGiven++;
    await addMessage(buildBrainHint(state.secret, state.facts, state.hintsGiven), 'mind');
  }

  if (state.questionCount >= MAX_QUESTIONS) {
    finish(false, 'Has agotado tus veinte preguntas.');
    return;
  }

  lockInput(false);
  ui.input.focus();
}

async function interpretWithOraculo(question) {
  try {
    if (typeof OraculoLocal === "undefined") return null;
    const data = await OraculoLocal.interpretar(question);
    if (data?.concepto && MindLogic.CONCEPTOS_PERMITIDOS.includes(data.concepto)) {
      return data;
    }
  } catch (err) {
    console.info("[MIND] Oraculo no disponible:", err);
  }
  return null;
}

function normalizeGuess(s) { return MindLogic.normalizar(s).replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim(); }
function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return row[b.length];
}

function guessMatches(raw, target) {
  const a = normalizeGuess(raw), b = normalizeGuess(target);
  if (!a || !b) return false;
  if (a === b) return true;
  const maxDist = b.length >= 16 ? 2 : b.length >= 6 ? 1 : 0;
  return Math.abs(a.length - b.length) <= maxDist && editDistance(a, b) <= maxDist;
}

function isCorrectGuess(raw) {
  return [state.secret.nombre, ...(state.secret.alias || [])].some(x => guessMatches(raw, x));
}

function openGuess() {
  if (!state.active || state.busy) return;
  ui.guessHint.textContent = `Te quedan ${state.guessesLeft} intento${state.guessesLeft === 1 ? '' : 's'}.`;
  ui.guessInput.value = '';
  ui.guessModal.classList.remove('hidden');
  setTimeout(() => ui.guessInput.focus(), 40);
}

function confirmGuess() {
  const value = ui.guessInput.value.trim();
  if (!value) {
    state.patience = (state.patience || 0) + 1;
    if (state.patience >= 3) {
      ui.guessModal.classList.add('hidden');
      addMessage(ORACULO.strike3, 'mind');
      ui.guess.disabled = true;
      setTimeout(() => { ui.guess.disabled = false; state.patience = 0; if (state.active) addMessage(ORACULO.vuelve, 'mind'); }, 30000);
    } else {
      ui.guessHint.textContent = state.patience === 1 ? ORACULO.strike1 : ORACULO.strike2;
    }
    return;
  }
  ui.guessModal.classList.add('hidden');
  addMessage(`Adivino: ${value}`, 'player');

  if (isCorrectGuess(value)) {
    finish(true, 'Has roto el enigma.');
    return;
  }

  state.guessesLeft--;
  updateHud();
  addMessage('Incorrecto.', 'mind');

  if (state.guessesLeft <= 0) {
    finish(false, 'Has agotado tus intentos de adivinanza.');
    return;
  }
  addMessage('Te queda un último intento.', 'mind');
}

function buildSuggestionPool(excluded = []) {
  // Solo preguntas no respondidas y que dividan de verdad a los personajes compatibles.
  const pool = window.Sugeridor ? Sugeridor.sugerir(MindLogic, PERSONAJES, state.facts, state.asked, 30, state.questionCount) : [];
  const blocked = new Set([...excluded, ...state.asked].map(x => MindLogic.normalizar(typeof x === 'string' ? x : '')));
  const filtered = pool.filter(q => !blocked.has(MindLogic.normalizar(q)));
  // No inventar un respaldo potencialmente contradictorio si el conjunto de
  // candidatos quedó vacío o no hay preguntas fiables que ayuden a discriminar.
  return filtered.slice(0, 5);
}

function renderSuggestions() {
  const session = state.suggestionSession;
  ui.suggestions.textContent = '';
  if (!session.options.length) {
    const empty = document.createElement('p');
    empty.className = 'suggestion-empty';
    empty.textContent = 'No encuentro una pregunta útil y fiable con los datos actuales. Seguí investigando por tu cuenta y probá de nuevo después de otra respuesta.';
    ui.suggestions.append(empty);
  }
  session.options.forEach(q => {
    const b = document.createElement('button');
    b.className = 'btn btn-green suggestion';
    b.textContent = q;
    b.onclick = () => {
      if (!state.active || state.busy || state.suggestionUses <= 0) return;
      // El uso se descuenta solo al elegir una pregunta, no al abrir/cerrar ni al renovar.
      state.suggestionUses--;
      updateHud();
      ui.input.value = q;
      ui.suggestModal.classList.add('hidden');
      state.suggestionSession = { options: [], rerolls: 0, initialized: false };
      ui.input.focus();
    };
    ui.suggestions.append(b);
  });
  const remaining = Math.max(0, 2 - session.rerolls);
  const status = el('rerollStatus');
  const reroll = el('rerollSuggestionsBtn');
  if (status) status.textContent = remaining ? `${remaining} renovación${remaining === 1 ? '' : 'es'} disponible${remaining === 1 ? '' : 's'}` : 'Preguntas definitivas';
  if (reroll) { reroll.disabled = remaining === 0; reroll.title = remaining ? 'Refrescar preguntas' : 'No quedan renovaciones'; }
}

function rerollSuggestions() {
  const session = state.suggestionSession;
  if (!state.active || state.busy || !session.initialized || session.rerolls >= 2) return;
  const next = buildSuggestionPool(session.options);
  if (!next.length) return;
  session.options = next;
  session.rerolls++;
  renderSuggestions();
}

function openSuggestions() {
  if (!state.active || state.busy || state.suggestionUses <= 0 || state.mode === 'classic') return;
  if (!(window.Sugeridor ? Sugeridor.desbloqueada(MindLogic, PERSONAJES, state.facts) : state.questionCount >= 5)) {
    addMessage('Primero investigá por tu cuenta, mortal. Las sugerencias se desbloquean después de cinco preguntas válidas. Intentá deducirlo con tu propio razonamiento.', 'mind');
    return;
  }
  const session = state.suggestionSession;
  // Cerrar y reabrir conserva exactamente las preguntas y los cambios restantes.
  if (!session.initialized) {
    session.options = buildSuggestionPool();
    session.rerolls = 0;
    session.initialized = true;
  }
  renderSuggestions();
  ui.suggestModal.classList.remove('hidden');
}

function buildBrainHint(character, facts = [], level = 1) {
  // Las primeras pistas refuerzan el razonamiento sin revelar de golpe una categoría.
  const known = new Set((facts || []).map(f => MindLogic.normalizar(f.texto || '')));
  if (level <= 1) {
    return 'Pista del Cerebro: no te quedes con una sola respuesta. Combiná dos datos que ya descubriste y pensá qué clase de personaje podría encajar con ambos. Todavía no voy a revelar una categoría concreta.';
  }
  const tags = Array.isArray(character?.etiquetas) ? character.etiquetas : [];
  const media = Array.isArray(character?.medios) ? character.medios : [];
  const real = character?.tipo === 'real' || character?.universo === 'real';
  const broad = tags.find(t => /cient|artist|escritor|deport|pol[ií]tic|m[uú]sic|h[eé]roe|villano|detective|magia|superh[eé]roe|f[ií]sico|actor/i.test(String(t)));
  if (level === 2) {
    if (real && !known.has(MindLogic.normalizar('¿Es una persona real?'))) return 'Pista del Cerebro: el personaje pertenece al mundo real. Ahora pensá qué tipo de actividad o trayectoria podría distinguirlo, sin saltar directamente a un nombre.';
    if (!real && !known.has(MindLogic.normalizar('¿Es ficticio?'))) return 'Pista del Cerebro: estás buscando un personaje de ficción. Tratá de reconstruir qué lugar ocupa en su mundo antes de intentar adivinar.';
    return 'Pista del Cerebro: revisá qué respuestas ya confirmaste y cuáles todavía son incógnitas. Tu próxima pregunta debería comprobar una idea, no adivinar al azar.';
  }
  // La tercera pista puede orientar un poco más, pero nunca nombra al personaje.
  if (broad) return `Pista del Cerebro: hay una relación con ${String(broad).replace(/_/g, ' ')}. Usá ese dato junto con tus respuestas anteriores; no alcanza por sí solo para identificarme.`;
  if (media.length) return 'Pista del Cerebro: prestá atención al contexto o al mundo en el que aparece este personaje. Cruzá esa idea con las respuestas que ya obtuviste.';
  return 'Pista del Cerebro: buscá una característica que conecte varias de tus respuestas. Una buena deducción necesita más de un dato.';
}

function finish(win, reason) {
  el('playAgainBtn')?.classList.remove('hidden');
  if (el('playAgainBtn')) el('playAgainBtn').textContent = 'JUGAR DE NUEVO';
  el('playAgainSwapRolesBtn')?.classList.add('hidden');
  window.MatchHistory?.record('SISTEMA', reason, 'result');
  window.MatchHistory?.finish(win ? 'Victoria' : 'Derrota', {personaje: state.secret?.nombre || ''});
  state.active = false;
  lockInput(true);
  clearInterval(state.timerId);
  show(ui.result);
  ui.resultTag.textContent = 'MODO SOLO';
  const modeHud=el('modeHud'); if(modeHud) modeHud.textContent='SOLO';
  ui.resultTitle.textContent = win ? 'VICTORIA' : 'DERROTA';
  ui.resultCharacter.textContent = state.secret.nombre;
  const why = String(reason || '');
  const asked = [...(state.asked || [])];
  const lastQuestion = asked.length ? asked[asked.length - 1] : '';
  const transcript = [...ui.chat.querySelectorAll('.message')].map(row => row.querySelector('.bubble')?.textContent || '').join(' ');
  const wrongGuess = (transcript.match(/Adivino:\s*([^.!?]+)/gi) || []).slice(-1)[0]?.replace(/^Adivino:\s*/i, '').trim();
  let contextualTaunt = mindDuelTaunt(state.secret.nombre, !win);
  if (/rendid|retirad/i.test(why)) contextualTaunt = `¡JAJAJA! ¡Te rendiste antes de descubrirme! ${lastQuestion ? `Después de preguntarme «${lastQuestion}», todavía no tenías claro quién era yo.` : 'Ni siquiera llegaste a resolver el misterio.'} ¡Soy ${state.secret.nombre} y te bajaste del desafío!`;
  else if (!win && wrongGuess) contextualTaunt = `¡JAJAJA! ¡Te la jugaste por ${wrongGuess} y fallaste! ${lastQuestion ? `Y eso después de preguntarme «${lastQuestion}».` : ''} ¡Al final era ${state.secret.nombre}! La próxima pensá mejor tu último intento.`;
  else if (!win && lastQuestion) contextualTaunt = `¡JAJAJA! ¡Me preguntaste «${lastQuestion}» y aun así no lograste descubrirme! ¡Era ${state.secret.nombre}! ¡La próxima prestá más atención a las pistas!`;
  ui.resultDescription.textContent = [reason, getCharacterDescription(state.secret.nombre, state.secret.descripcion), contextualTaunt].filter(Boolean).join(' '); machineAutosave();
}

async function shutdown() {
  clearInterval(state.timerId);
  [ui.guessModal, ui.suggestModal].forEach(m => m.classList.add('hidden'));
  ui.arcade.classList.add('shutdown');
  await sleep(700);
  ui.shutdown.classList.remove('hidden');
}

function closeModalFromTarget(target) {
  const id = target.dataset.close;
  if (id) el(id)?.classList.add('hidden');
}
function openGameMenu(){ if(state.mode==='classic' && classic.phase==='end') return; const online=document.body.classList.contains('duel-online'); ['menuSaveMatchBtn'].forEach(id=>el(id)?.classList.toggle('hidden',!online)); el('menuExportMatchBtn')?.classList.toggle('hidden',!online); const menu=el('gameMenuModal');const opening=menu.classList.contains('hidden');menu.classList.toggle('hidden',!opening);el('menuBtn').setAttribute('aria-expanded',String(opening));el('menuBtn').setAttribute('aria-label',opening?'Cerrar menú':'Abrir menú');el('menuSurrenderBtn').querySelector('span').textContent='Rendirse'; }
function leaveGame(){ el('gameMenuModal').classList.add('hidden'); if(document.body.classList.contains('duel-online')) { if(confirm('¿Querés salir de esta partida?')) window.dispatchEvent(new CustomEvent('mindduel-leave')); return; } if(state.mode!=='classic' && state.active){ if(confirm('¿Querés salir de esta partida? El progreso quedó guardado automáticamente y podrás retomarlo con CONTINUAR PARTIDA.')) openStage(); } else openStage(); }


let lastStageDialogueTap = 0;
let stageCurtainOpening = false;
let stageSequenceActive = false;
let stageFastForwardRequested = false;
let stageWelcomeEggUsed = false;
let releaseCurtainWait = null;
const stageQuips = ['No me apures, mortal. La paciencia también es parte del duelo.', 'Vaya, vaya… alguien tiene prisa por desafiarme.', 'Está bien, mortal. No hace falta que el telón te cuente toda la historia.', '¿Dos toques? Veo que aprendiste a dar órdenes.', 'La impaciencia te sienta bien… por esta vez.', 'De acuerdo. Que empiece el desafío, mortal.'];
function requestStageFastForward(){
  stageFastForwardRequested = true;
  if(stageCurtainOpening){
    ui.curtainLeft?.classList.add('open'); ui.curtainRight?.classList.add('open');
    ui.stage?.classList.add('curtain-fast-open');
    if(releaseCurtainWait){releaseCurtainWait();releaseCurtainWait=null;}
  }
  if(activeStageDialogue?.allowDoubleTapSkip){
    if(activeStageDialogue.easterEggOnSkip) activeStageDialogue.easterEggText=stageQuips[Math.floor(Math.random()*stageQuips.length)];
    activeStageDialogue.skip=true;
    stageFastForwardRequested=false;
  }
}
document.addEventListener('pointerdown', e => {
  if (!ui.stage || ui.stage.classList.contains('hidden') || e.target.closest('button, input, textarea, select, a')) return;
  const speaking=activeStageDialogue;
  // También se puede acelerar mientras el telón se está abriendo, antes de que empiece el texto.
  if(!speaking?.allowDoubleTapSkip && !stageCurtainOpening && !stageSequenceActive) return;
  const now=Date.now();
  if(now-lastStageDialogueTap<=480){requestStageFastForward();lastStageDialogueTap=0;}
  else lastStageDialogueTap=now;
}, true);

document.addEventListener('click', e => { closeModalFromTarget(e.target); const menu=el('gameMenuModal'); if(menu&&!menu.classList.contains('hidden')&&!e.target.closest('.header-menu-wrap')){menu.classList.add('hidden');el('menuBtn').setAttribute('aria-expanded','false');el('menuBtn').setAttribute('aria-label','Abrir menú');} });
el('startBtn').onclick = () => openStage();
el('exitBtn').onclick = shutdown;

// BOTONES DEL TEATRO (ACEPTAR Y HUIR)
ui.continueBtn.onclick = showMachineModeChoice;
el('machineNewGameBtn').onclick = startSelectedMachineMode;
el('machineContinueBtn').onclick = continueSelectedMachineMode;
el('machineHistoryBtn').onclick = showSelectedMachineHistory;
el('machineChoiceBackBtn').onclick = async () => {
  el('machineModeChoice').classList.add('hidden');
  ui.stageActions.classList.remove('hidden');
  ui.stageDialog.innerHTML = `<strong>CEREBRO:</strong> ${nextStageDialogue('classicSetupReturn', [ORACULO.classicSetupReturn, 'Seguimos en el umbral del modo clásico, mortal. Podés volver a intentarlo o regresar al menú.', 'Todavía no elegiste cómo continuar. El modo clásico te espera cuando quieras.'])}`;
  ui.stage.classList.add('stage-ready');
};
el('classicSecretNameBackBtn').onclick = () => {
  el('classicSecretNameForm').classList.add('hidden');
  el('machineModeChoice').classList.remove('hidden');
  ui.stageDialog.innerHTML = `<strong>CEREBRO:</strong> ${nextStageDialogue('classicReturn', [ORACULO.classicReturn, '¿Todavía no vas a elegir personaje? No hay apuro, mortal. Podés volver a intentarlo o elegir otro camino.', 'Volviste antes de empezar. El duelo clásico queda esperando tu decisión.'])}`;
  ui.stage.classList.add('stage-ready');
};
el('classicSecretNameForm').onsubmit = async e => { e.preventDefault(); const name=el('classicSecretNameInput').value.trim(); if(!name)return; classicSecretName=name; try { if(!findKnownCharacter(name)){ const k='mind_personajes_nuevos'; const rows=JSON.parse(localStorage.getItem(k)||'[]'); const norm=MindLogic.normalizar(name); const existing=rows.find(x=>MindLogic.normalizar(x.nombre||'')===norm); if(!existing) rows.push({nombre:name,fecha:new Date().toISOString(),respuestas:[],origen:'clásico'}); localStorage.setItem(k,JSON.stringify(rows)); } } catch {} el('classicSecretNameForm').classList.add('hidden'); await startClassic(); };

ui.backTitleBtn.onclick = cancelStageAndReturn;
ui.menuBackBtn.onclick = cancelStageAndReturn;
$cl('clasicoBtn').onclick = chooseClassic;
$cl('classicPanel').addEventListener('click', e => { const b = e.target.closest('[data-ans]'); if (b) classicAnswer(b.dataset.ans); });
$cl('clAgainBtn').onclick = startClassic;
$cl('clMenuBtn').onclick = openStage;
ui.soloBtn.onclick = chooseSolo;
ui.espejoBtn.onclick = async () => { ui.stageMenu.classList.add('hidden'); await closeStageCurtain(2600); await openStageCurtain(2800); const ok = await say(`<strong>CEREBRO:</strong> ${ORACULO.espejo}`); if (ok) { await sleep(700); ui.stageMenu.classList.remove('hidden'); ui.stage.classList.add('stage-ready'); } };
ui.dueloBtn.onclick = () => {};

el('menuBtn').onclick = openGameMenu;
el('menuResumeBtn').onclick = () => {el('gameMenuModal').classList.add('hidden');el('menuBtn').setAttribute('aria-expanded','false');};
el('menuHistoryBtn').onclick = () => { el('gameMenuModal').classList.add('hidden'); el('menuBtn').setAttribute('aria-expanded','false'); if(window.MatchHistory) window.MatchHistory.show(null,document.body.classList.contains('duel-online')?'online':state.mode==='classic'?'clásico':'solo'); else if(el('matchHistoryModal')) el('matchHistoryModal').classList.remove('hidden'); else addMessage('El historial todavía no está disponible.', 'system'); };
el('menuSaveMatchBtn').onclick = () => { el('gameMenuModal').classList.add('hidden'); el('menuBtn').setAttribute('aria-expanded','false'); if(document.body.classList.contains('duel-online'))window.dispatchEvent(new CustomEvent('mindduel-save-current')); };
el('menuExportMatchBtn').onclick = () => { el('gameMenuModal').classList.add('hidden'); el('menuBtn').setAttribute('aria-expanded','false'); if(!document.body.classList.contains('duel-online')){addMessage('Exportar partida está disponible en el modo Online.', 'system');return;} window.SavedMatches?.exportCurrent?.(); };
el('menuSurrenderBtn').onclick = () => { el('gameMenuModal').classList.add('hidden'); el('menuBtn')?.setAttribute('aria-expanded','false'); if(document.body.classList.contains('duel-online')) { window.dispatchEvent(new CustomEvent('mindduel-surrender')); return; } if(state.mode==='classic') { if(classic.phase==='end') return; classicEnd({wonBy:'brain',nombre:classicSecretName || classic.cur?.p?.nombre || Clasico.mejor(classic.s)?.p?.nombre || 'personaje elegido',descripcion:'Te rendiste antes de que el Cerebro terminara de descubrirlo.'}); return; } if(state.active) finish(false,'Te rendiste antes de terminar la partida.'); };
el('menuExitBtn').onclick = leaveGame;
ui.form.onsubmit = e => {
  e.preventDefault();
  const q = ui.input.value;
  ui.input.value = '';
  askQuestion(q);
};
ui.guess.onclick = openGuess;
el('confirmGuessBtn').onclick = confirmGuess;
ui.guessInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmGuess();
});
ui.suggest.onclick = openSuggestions;
el('rerollSuggestionsBtn').onclick = rerollSuggestions;
el('classicCharacterNameForm').onsubmit = e => { e.preventDefault(); const value=el('classicCharacterNameInput').value.trim(); if(value) classicSaveName(value); };
el('classicGuessYes').onclick = () => classicAnswer('si');
el('classicGuessNo').onclick = () => classicAnswer('no');
el('continueThinkingBtn').onclick = async () => {
  el('guessModal').classList.add('hidden');
  const lines = [
    'Mejor voy a seguir preguntando; todavía me falta una pista.',
    'Voy a dejar esa teoría en pausa y continuar investigando.',
    'Aún no me convence del todo. Prefiero hacer otra pregunta.',
    'No voy a arriesgarme todavía; necesito afinar mis deducciones.',
    'Cambio de estrategia: seguiré preguntando antes de adivinar.'
  ];
  await addMessage(pickLine(lines), 'player');
};

window.addEventListener('mind:restore-machine-match',async e=>{
 const snap=e.detail?.snapshot;if(!snap||!['SOLO','CLASSIC'].includes(snap.mode))return;
 window.MindDuelCleanupForMode?.(); machineStartedAt=Number(snap.startedAt)||Date.now(); classicSecretName=String(snap.classicCharacterName||''); resetGame(); classicSetMode(snap.mode==='CLASSIC');
 state.mode=snap.mode==='CLASSIC'?'classic':'solo';state.questionCount=Number(snap.questionCount)||0;state.guessesLeft=Number(snap.guessesLeft)||MAX_GUESSES;state.suggestionUses=Number(snap.suggestionUses??SUGGESTION_LIMIT);state.consecutiveNo=Number(snap.consecutiveNo)||0;state.hintsGiven=Number(snap.hintsGiven)||0;state.asked=new Set(snap.asked||[]);state.facts=Array.isArray(snap.facts)?snap.facts:[];state.seconds=Number(snap.seconds)||0;state.patience=Number(snap.patience)||0;state.suggestionSession=snap.suggestionSession||{options:[],rerolls:0,initialized:false};state.active=snap.status!=='completed';
 if(snap.mode==='SOLO'){state.secret=(PERSONAJES||[]).find(p=>MindLogic.normalizar(p.nombre)===MindLogic.normalizar(snap.secretName))||snap.secret;}
 if(snap.mode==='CLASSIC'&&snap.classic){const c=snap.classic;classic.s=Clasico.nuevo(PERSONAJES);classic.s.w=Array.isArray(c.weights)?c.weights:classic.s.w;classic.s.asked=new Set((c.asked||[]).map(q=>MindLogic.normalizar(q))); classic.s.log=c.log||[];classic.s.rech=new Set(c.rejected||[]);classic.s.n=Number(c.n)||0;classic.fails=Number(c.fails)||0;classic.phase=c.phase||'ask';classic.cur=null;if(c.cur){const p=(PERSONAJES||[]).find(x=>MindLogic.normalizar(x.nombre)===MindLogic.normalizar(c.cur.p||''));classic.cur={...c.cur,...(p?{p}: {})};}}
 window.MatchHistory?.resume?.(snap.historyId, snap.mode==='CLASSIC'?'clásico':'solo');
 ui.chat.textContent='';for(const ev of (snap.transcript||[])){const kind=ev.kind||'system';const row=document.createElement('div');row.className='message message-'+kind;const av=document.createElement('div');av.className='avatar';const a=avatarFor(kind);av.textContent=a.txt;av.classList.add(a.cls);const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=ev.text||'';row.append(av,bubble);ui.chat.append(row);}
 classicBusy=false;
 updateHud();ui.timer.textContent=String(Math.floor(state.seconds/60)).padStart(2,'0')+':'+String(state.seconds%60).padStart(2,'0');show(ui.game);startTimer();machineAutosave();
 if(state.mode==='classic'){
  const chosen=el('classicChosenCharacter'); if(chosen) chosen.textContent='';
  const secretLabel=el('onlineSecretLabel'); if(secretLabel){secretLabel.textContent='PERSONAJE ELEGIDO: '+(classicSecretName||'Sin nombre');secretLabel.classList.remove('hidden');}
  el('classicPanel').classList.add('hidden');el('classicCharacterNameForm').classList.add('hidden');el('classicGuessModal').classList.add('hidden');
  if(classic.phase==='name'){
   ui.resultTag.textContent='MODO CLÁSICO';ui.resultTitle.textContent='EL CEREBRO NO LO DESCIFRÓ';ui.resultCharacter.textContent='Tu personaje sigue siendo un misterio.';ui.resultDescription.textContent='Continuá desde donde quedó la partida.';el('resultActions').classList.add('hidden');el('classicCharacterNameForm').classList.remove('hidden');el('classicCharacterNameInput').value='';show(ui.result);el('classicCharacterNameInput').focus();
  }else if(classic.cur?.tipo==='g'){
   el('classicGuessCharacter').textContent=classic.cur.p?.nombre||'';const desc=el('classicGuessDescription');if(desc){desc.textContent=getCharacterDescription(classic.cur.p?.nombre,classic.cur.p?.descripcion||'');desc.classList.toggle('hidden',!desc.textContent);}el('classicGuessModal').classList.remove('hidden');
  }else{el('classicPanel').classList.remove('hidden');}
 }else{el('classicPanel').classList.add('hidden');lockInput(false);}
});

el('playAgainBtn').onclick = async () => {
 if(state.mode==='classic'){
  clearInterval(state.timerId); state.active=false; classicSecretName=''; state.pendingMode='classic';
  document.body.classList.remove('classic','name-phase'); el('classicPanel')?.classList.add('hidden');
  const oldLabel=el('onlineSecretLabel'); if(oldLabel){oldLabel.classList.add('hidden');oldLabel.textContent='';}
  show(ui.stage); ui.stageMenu.classList.add('hidden'); ui.stageActions.classList.add('hidden'); el('machineModeChoice')?.classList.add('hidden');
  const form=el('classicSecretNameForm'); if(form){form.classList.remove('hidden');el('classicSecretNameInput').value='';}
  ui.stageDialog.innerHTML='<strong>CEREBRO:</strong> '+nextStageDialogue('classicRevenge', ['La revancha empieza con un nuevo personaje. Elegí a quién debo descubrir esta vez.', '¿Una nueva ronda? Muy bien, mortal. Pensá en otro personaje y veamos si puedo descubrirlo.', 'Volvemos a empezar: elegí un personaje distinto y preparate para mis preguntas.']);
  ui.stage.classList.add('stage-ready');
  setTimeout(()=>el('classicSecretNameInput')?.focus(),80);
 } else if(document.body.classList.contains('duel-online')) { window.MindDuelCleanupForMode?.(); openStage(); } else startGame();
};
el('resultMenuBtn').onclick = openStage;
el('resultExitBtn').onclick = shutdown;
let descriptionEditingName=''; let descriptionOriginal='';
function getOriginalCharacterDescription(name){
  try { const people=(typeof PERSONAJES!=='undefined'?PERSONAJES:window.PERSONAJES)||[]; const n=MindLogic.normalizar(name); const known=people.find(p=>MindLogic.normalizar(p.nombre)===n||((p.alias||[]).some(a=>MindLogic.normalizar(a)===n))); if(known&&String(known.descripcion||'').trim()) return String(known.descripcion).trim(); } catch {}
  return '';
}
function openCharacterDescriptionEditor(){
  const name=(el('resultCharacter').textContent||'').replace(/^Tu personaje era:\s*/, '').trim(); if(!name)return;
  descriptionEditingName=name; descriptionOriginal=getOriginalCharacterDescription(name);
  const custom=localStorage.getItem('mind_character_description_'+name)||'';
  el('characterEditTitle').textContent='DESCRIPCIÓN DE '+name.toUpperCase();
  el('characterDescriptionInput').value=custom.trim()||descriptionOriginal;
  el('characterDescriptionInput').readOnly=true;
  el('editCharacterDescriptionBtn').classList.remove('hidden');
  el('characterEditModal').classList.remove('hidden');
}
el('editCharacterBtn').onclick = openCharacterDescriptionEditor;
el('editCharacterDescriptionBtn').onclick=()=>{el('characterDescriptionInput').readOnly=false;el('characterDescriptionInput').focus();};
el('viewOriginalCharacterDescriptionBtn').onclick=()=>{el('characterDescriptionInput').value=descriptionOriginal;el('characterDescriptionInput').readOnly=true;};
el('restoreOriginalCharacterDescriptionBtn').onclick=()=>{if(!descriptionEditingName)return;try{localStorage.removeItem('mind_character_description_'+descriptionEditingName);}catch{}el('resultDescription').textContent=descriptionOriginal;el('characterDescriptionInput').value=descriptionOriginal;el('characterDescriptionInput').readOnly=true;};
el('cancelCharacterDescriptionBtn').onclick = () => el('characterEditModal').classList.add('hidden');
el('saveCharacterDescriptionBtn').onclick = () => { const name=descriptionEditingName; const desc=el('characterDescriptionInput').value.trim(); if(!name||!desc)return; try{localStorage.setItem('mind_character_description_'+name,desc);const rows=JSON.parse(localStorage.getItem('mind_personajes_nuevos')||'[]');const idx=rows.findIndex(x=>MindLogic.normalizar(x.nombre)===MindLogic.normalizar(name));if(idx>=0)rows[idx].descripcion=desc;else rows.push({nombre:name,descripcion:desc,fecha:new Date().toISOString()});localStorage.setItem('mind_personajes_nuevos',JSON.stringify(rows));}catch{} el('resultDescription').textContent=desc;el('characterEditModal').classList.add('hidden'); };
el('viewMatchHistoryBtn').onclick = () => { if(window.MatchHistory) window.MatchHistory.show(); else if(el('matchHistoryModal')) el('matchHistoryModal').classList.remove('hidden'); else if(el('viewClassicHistoryBtn')) el('viewClassicHistoryBtn').click(); };
el('restartBtn').onclick = () => location.reload();

titleSequence();
})();

// 3.13.43: diálogos contextuales del menú y navegación de revancha clásica.
