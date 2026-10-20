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
let messageQueue = Promise.resolve();
let classicBusy = false;
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

async function say(html, ms = 42) {
  const my = ++sayToken;
  let out = '', i = 0;
  ui.stageDialog.innerHTML = '';
  while (i < html.length) {
    if (my !== sayToken) return false;
    if (html[i] === '<') { const j = html.indexOf('>', i); out += html.slice(i, j + 1); i = j + 1; }
    else {
      const ch = html[i++]; out += ch;
      await sleep(/[.!?…]/.test(ch) ? ms * 5 : /[,;:]/.test(ch) ? ms * 2.2 : ms);
    }
    ui.stageDialog.innerHTML = out;
  }
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
  ui.curtainLeft.classList.add('open');
  ui.curtainRight.classList.add('open');
  await sleep(wait);
  ui.stageDialog.innerHTML = '';
}

async function openStage() {
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

  ui.stage.classList.remove('spotlight-on');
  await sleep(900);
  await openStageCurtain(2800);
  ui.stage.classList.add('spotlight-on');
  await sleep(1500);
  if (await say(`<strong>CEREBRO:</strong> ${ORACULO.main}<br><br>¿Enfrentarás sola mi mente, o buscas compañía?`)) {
    ui.stageMenu.classList.remove('hidden');
    ui.stage.classList.add('stage-ready');
  }
}

async function chooseSolo() {
  state.pendingMode = 'solo';
  ui.stageMenu.classList.add('hidden');
  await closeStageCurtain(2600);
  await openStageCurtain(2800);
  const ok = await say(`<strong>CEREBRO:</strong> ${ORACULO.solo}<br><br>He elegido a una entidad secreta.<br><span style="color:#00ff67">Tienes 20 preguntas y 2 intentos para adivinar.</span><br>Respuestas estrictas de SÍ o NO.<br><br>¿Aceptas el duelo?`);
  if (ok) { ui.stageActions.classList.remove('hidden'); ui.stage.classList.add('stage-ready'); }
}

async function cancelStageAndReturn() {
  ui.stageMenu.classList.add('hidden');
  ui.stageActions.classList.add('hidden');
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
  document.body.classList.toggle('classic', on);
  const modeHud = el('modeHud'); if (modeHud) modeHud.textContent = on ? 'CLÁSICO' : 'SOLO';
  document.body.classList.remove('name-phase');
  $cl('classicPanel').classList.toggle('hidden', !on);
  $cl('classicEnd').classList.add('hidden');
  state.mode = on ? 'classic' : 'solo';
  ui.input.placeholder = 'Pregunta de sí/no...';
}

async function chooseClassic() {
  state.pendingMode = 'classic';
  ui.stageMenu.classList.add('hidden');
  await closeStageCurtain(2600);
  await openStageCurtain(2800);
  const ok = await say(`<strong>CEREBRO:</strong> ${ORACULO.clasico}<br><br>Responderás con los botones: SÍ, NO, NO LO SÉ, PROBABLEMENTE SÍ o PROBABLEMENTE NO.<br><br>¿Aceptas el duelo?`);
  if (ok) { ui.stageActions.classList.remove('hidden'); ui.stage.classList.add('stage-ready'); }
}

async function startClassic() {
  resetGame();
  classicSetMode(true);
  window.MatchHistory?.begin('clásico');
  classic.s = Clasico.nuevo(PERSONAJES);
  classic.cur = null; classic.fails = 0; classic.phase = 'ask';
  classicBusy = true;
  state.guessesLeft = MAX_GUESSES; updateHud();
  show(ui.game);
  await addMessage('Piensa en un personaje, real o ficticio. Yo intentaré descubrirlo. Respondé cada pregunta con los botones.', 'mind');
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
    q = fallback.find(x => !s.asked.has(x));
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
const CLASSIC_WIN_LINES = ['¡Bien, bien! No te emociones, que fue una sola partida.','¡Disfrutá la victoria mientras puedas!','¡Tuviste suerte! Sí, sí, SUERTE.'];
const CLASSIC_LOSE_LINES = ['¡JAJAJA! ¡Ni con todas esas pistas pudiste descubrirme!','¡Qué desastre! ¡Era más fácil que adivinar qué hay para cenar!','¡Perdiste y encima me hiciste trabajar contestando preguntas!'];
function findKnownCharacter(name){try{return (PERSONAJES||[]).find(p=>MindLogic.normalizar(p.nombre)===MindLogic.normalizar(name))||null;}catch{return null;}}
function getCharacterDescription(name, fallback=''){
  const key='mind_character_description_'+String(name||'');
  try { const custom=localStorage.getItem(key); if(custom && custom.trim()) return custom.trim(); } catch {}
  const known=findKnownCharacter(name);
  return String((known && known.descripcion) || fallback || '').trim();
}
async function classicEnd(result = {}) {
  if (classic.phase !== 'end') window.MatchHistory?.finish(result.wonBy === 'brain' ? 'Victoria del Cerebro' : result.wonBy === 'player' ? 'Victoria del jugador' : 'Finalizada', {modo:'clásico', personaje: result.nombre || ''});
  classic.phase = 'end'; classic.cur = null; classicBusy = true;
  clearInterval(state.timerId);
  document.body.classList.remove('name-phase');
  $cl('classicPanel').classList.add('hidden');
  const wonByBrain = result.wonBy === 'brain';
  el('classicCharacterNameForm').classList.add('hidden'); el('resultActions').classList.remove('hidden');
  ui.resultTag.textContent = 'MODO CLÁSICO';
  ui.resultTitle.textContent = wonByBrain ? 'HAS PERDIDO' : '¡HAS GANADO!';
  ui.resultCharacter.textContent = result.nombre ? `Tu personaje era: ${result.nombre}` : 'Personaje no identificado';
  const characterDescription = getCharacterDescription(result.nombre, result.descripcion);
  ui.resultDescription.textContent = [characterDescription, mindDuelTaunt(result.nombre, wonByBrain)].filter(Boolean).join(' ');
  const editBtn=el('editCharacterBtn'); if(editBtn) editBtn.classList.toggle('hidden', !result.nombre);
  show(ui.result);
  ui.input.placeholder = 'Pregunta de sí/no...';
  classicBusy = false;
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function classicAnswer(ans) {
  const c = classic.cur;
  if (!c || classicBusy || classic.phase === 'end') return;
  classicBusy = true;
  if (c.tipo === 'q') await addMessage(CL_LABEL[ans], 'player');
  if (c.tipo === 'q') {
    Clasico.responder(classic.s, MindLogic, c.q, ans);
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
  state.asked.clear();
  state.facts = [];
  state.patience = 0;
  state.seconds = 0;
  ui.chat.textContent = '';
  updateHud();
  ui.suggest.disabled = false;
  ui.guess.disabled = false;
  ui.input.disabled = false;
  ui.send.disabled = false;
}

function updateHud() {
  ui.questions.textContent = `${state.questionCount}/${MAX_QUESTIONS}`;
  ui.guesses.textContent = String(state.guessesLeft);
  ui.suggest.textContent = `SUGERENCIAS (${state.suggestionUses})`;
  ui.suggest.classList.remove('locked');
  ui.suggest.disabled = state.suggestionUses <= 0 || state.questionCount < 3;
  ui.suggest.title = state.questionCount < 3 ? 'Disponible después de 3 preguntas' : 'Sugerencias del Cerebro';
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
    // addMessage registra la intervención una sola vez antes de encolarla.
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
    // Todos los mensajes tienen su turno: ninguno aparece completo encima de otro.
    const speed = kind === 'mind' ? 30 : kind === 'system' ? 22 : 12;
    for (let i = 1; i <= fullText.length; i++) {
      bubble.textContent = fullText.slice(0, i);
      ui.chat.scrollTop = ui.chat.scrollHeight;
      const ch = fullText[i - 1];
      await sleep(/[.!?…]/.test(ch) ? speed * 4 : /[,;:]/.test(ch) ? speed * 2 : speed);
    }
    ui.chat.scrollTop = ui.chat.scrollHeight;
    // Pausa final: permite leer incluso una frase corta antes de que hable el siguiente.
    await sleep(fullText.length < 24 ? 650 : 850);
    resolve();
  });
}

function addMessage(text, kind = 'system') {
  // Guardar cada intervención en el historial persistente de la partida actual.
  window.MatchHistory?.record(kind === 'player' ? 'TÚ' : kind === 'mind' ? 'CEREBRO' : 'SISTEMA', text, kind);
  const task = messageQueue.then(() => renderMessage(text, kind));
  // Mantener la cola viva incluso si un navegador rechaza una operación de interfaz.
  messageQueue = task.catch(err => console.warn('[MIND] No se pudo mostrar un mensaje:', err));
  return task;
}

async function startGame() {
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

  state.facts.push({ texto: clean, concepto: conceptoUsado, answer: !!answer });
  state.questionCount++;
  if (answer) state.consecutiveNo = 0;
  else state.consecutiveNo++;
  updateHud();
  await addMessage(answer ? 'SÍ.' : 'NO.', 'mind');
  // En el modo normal, cinco respuestas negativas seguidas activan una pista sin revelar el personaje.
  if (state.mode !== 'classic' && state.consecutiveNo >= 5) {
    state.consecutiveNo = 0;
    await addMessage(buildBrainHint(state.secret), 'mind');
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
  const pool = window.Sugeridor ? Sugeridor.sugerir(MindLogic, PERSONAJES, state.facts, state.asked, 30) : [];
  const blocked = new Set([...excluded, ...state.asked].map(x => MindLogic.normalizar(typeof x === 'string' ? x : '')));
  const filtered = pool.filter(q => !blocked.has(MindLogic.normalizar(q)));
  if (filtered.length) return filtered.slice(0, 5);
  // Respaldo: nunca mostrar una caja vacía. Evita preguntas ya respondidas y prioriza las generales restantes.
  const safe = ['¿Es una persona real?','¿Es ficticio?','¿Es humano?','¿Es conocido principalmente por la ciencia?','¿Es conocido por el entretenimiento?','¿Es de Europa?','¿Es de América?','¿Es conocido por aparecer en películas?'];
  return safe.filter(q => !blocked.has(MindLogic.normalizar(q))).slice(0, 5);
}

function renderSuggestions() {
  const session = state.suggestionSession;
  ui.suggestions.textContent = '';
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
  if (!state.active || state.busy || state.suggestionUses <= 0 || state.questionCount < 3) return;
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

function buildBrainHint(character) {
  const real = character?.tipo === 'real' || character?.universo === 'real';
  const tags = Array.isArray(character?.etiquetas) ? character.etiquetas : [];
  const media = Array.isArray(character?.medios) ? character.medios : [];
  const useful = tags.find(t => /cient|artist|escritor|deport|pol[ií]tic|m[uú]sic|h[eé]roe|villano|detective|magia|superh[eé]roe|f[ií]sico|actor/i.test(t));
  if (real) {
    if (useful) return `🧠 Cerebro: Vas bien. Mi personaje está relacionado con ${useful.replace(/_/g, ' ')}. Pensá qué tipo de figura podría ser…`;
    if (character?.region) return `🧠 Cerebro: Te doy una pista más: mi personaje tiene una conexión con ${String(character.region).replace(/_/g, ' ')}. Usá esa información para afinar tus preguntas.`;
    return '🧠 Cerebro: Te puedo confirmar algo: estoy pensando en alguien que existió en el mundo real. Afiná tus preguntas.';
  }
  if (useful) return `🧠 Cerebro: Una pista para vos: mi personaje ficticio está relacionado con ${useful.replace(/_/g, ' ')}. Todavía no voy a revelar más.`;
  if (media.length) return `🧠 Cerebro: Prestá atención a esto: mi personaje aparece en un universo de ${String(media[0]).replace(/_/g, ' ')}. Seguimos.`;
  return '🧠 Cerebro: Te doy una pequeña ayuda: mi personaje pertenece a la ficción. Pensá en sus habilidades y en el mundo del que viene.';
}

function finish(win, reason) {
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
  ui.resultDescription.textContent = [reason, getCharacterDescription(state.secret.nombre, state.secret.descripcion), mindDuelTaunt(state.secret.nombre, !win)].filter(Boolean).join(' ');
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
function openGameMenu(){ if(state.mode==='classic' && classic.phase==='end') return; const menu=el('gameMenuModal');const opening=menu.classList.contains('hidden');menu.classList.toggle('hidden',!opening);el('menuBtn').setAttribute('aria-expanded',String(opening));el('menuBtn').setAttribute('aria-label',opening?'Cerrar menú':'Abrir menú');el('menuSurrenderBtn').querySelector('span').textContent=document.body.classList.contains('duel-online')?'Rendirse':state.mode==='classic'?'Retirarse':'Rendirse'; }
function leaveGame(){ el('gameMenuModal').classList.add('hidden'); if(document.body.classList.contains('duel-online')) { if(confirm('¿Querés salir de esta partida?')) window.dispatchEvent(new CustomEvent('mindduel-leave')); return; } if(state.mode!=='classic' && state.active){ if(confirm('¿Querés salir de esta partida? El progreso actual se perderá.')) openStage(); } else openStage(); }


document.addEventListener('click', e => { closeModalFromTarget(e.target); const menu=el('gameMenuModal'); if(menu&&!menu.classList.contains('hidden')&&!e.target.closest('.header-menu-wrap')){menu.classList.add('hidden');el('menuBtn').setAttribute('aria-expanded','false');el('menuBtn').setAttribute('aria-label','Abrir menú');} });
el('startBtn').onclick = () => openStage();
el('exitBtn').onclick = shutdown;

// BOTONES DEL TEATRO (ACEPTAR Y HUIR)
ui.continueBtn.onclick = startGame;
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
el('menuHistoryBtn').onclick = () => { el('gameMenuModal').classList.add('hidden'); el('menuBtn').setAttribute('aria-expanded','false'); if(window.MatchHistory) window.MatchHistory.show(); else if(el('matchHistoryModal')) el('matchHistoryModal').classList.remove('hidden'); else addMessage('El historial todavía no está disponible.', 'system'); };
el('menuSurrenderBtn').onclick = () => { el('gameMenuModal').classList.add('hidden'); if(document.body.classList.contains('duel-online')) { window.dispatchEvent(new CustomEvent('mindduel-surrender')); return; } if(state.mode==='classic') classicEnd({wonBy:'brain',nombre:classic.cur?.p?.nombre || Clasico.mejor(classic.s)?.p?.nombre || 'personaje secreto',descripcion:'Te rendiste antes de descubrirlo.',frase:pickLine(CLASSIC_LOSE_LINES)}); else if(state.active) finish(false,'Te has rendido.'); };
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
el('playAgainBtn').onclick = () => { if(state.mode==='classic') startClassic(); else if(document.body.classList.contains('duel-online')) { document.body.classList.remove('duel-online'); openStage(); } else startGame(); };
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
