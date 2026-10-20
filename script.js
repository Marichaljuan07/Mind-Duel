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
  asked: new Set(),
  facts: [],
  timerId: null,
  seconds: 0
};

const suggestionPool = [
  '¿Es una persona real?', '¿Es ficticio?', '¿Es una mujer?', '¿Es un hombre?',
  '¿Sigue con vida?', '¿Es humano?', '¿Es de Europa?', '¿Es de América?',
  '¿Es científico?', '¿Es artista?', '¿Es escritor?', '¿Es un superhéroe?',
  '¿Tiene poderes?', '¿Usa magia?', '¿Aparece en películas?', '¿Aparece en libros?',
  '¿Aparece en cómics?', '¿Es de Marvel?', '¿Es de DC Comics?', '¿Es de Harry Potter?',
  '¿Es de Star Wars?'
];

let sayToken = 0;
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

async function say(html, ms = 24) {
  const my = ++sayToken;
  let out = '', i = 0;
  ui.stageDialog.innerHTML = '';
  while (i < html.length) {
    if (my !== sayToken) return false;
    if (html[i] === '<') { const j = html.indexOf('>', i); out += html.slice(i, j + 1); i = j + 1; }
    else { out += html[i++]; await sleep(ms); }
    ui.stageDialog.innerHTML = out;
  }
  return my === sayToken;
}

async function openStage() {
  classicSetMode(false);
  clearInterval(state.timerId);
  state.active = false;
  show(ui.stage);
  ui.curtainLeft.classList.remove('open');
  ui.curtainRight.classList.remove('open');
  ui.stageDialog.innerHTML = '';
  ui.stageMenu.classList.add('hidden');
  ui.stageActions.classList.add('hidden');

  await sleep(900);
  ui.curtainLeft.classList.add('open');
  ui.curtainRight.classList.add('open');
  await sleep(2400);
  if (await say(`<strong>CEREBRO:</strong> ${ORACULO.main}<br><br>¿Enfrentarás sola mi mente, o buscas compañía?`)) {
    ui.stageMenu.classList.remove('hidden');
  }
}

async function chooseSolo() {
  state.pendingMode = 'solo';
  ui.stageMenu.classList.add('hidden');
  const ok = await say(`<strong>CEREBRO:</strong> ${ORACULO.solo}<br><br>He elegido a una entidad secreta.<br><span style="color:#00ff67">Tienes 20 preguntas y 2 intentos para adivinar.</span><br>Respuestas estrictas de SÍ o NO.<br><br>¿Aceptas el duelo?`);
  if (ok) ui.stageActions.classList.remove('hidden');
}

async function cancelStageAndReturn() {
  ui.stageMenu.classList.add('hidden');
  ui.stageActions.classList.add('hidden');
  ui.curtainLeft.classList.remove('open');
  ui.curtainRight.classList.remove('open');
  ui.stageDialog.innerHTML = `<strong>CEREBRO:</strong> ${ORACULO.huir}`;
  await sleep(2400);
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
  document.body.classList.remove('name-phase');
  $cl('classicPanel').classList.toggle('hidden', !on);
  $cl('classicEnd').classList.add('hidden');
  state.mode = on ? 'classic' : 'solo';
  ui.input.placeholder = 'Pregunta de sí/no...';
}

async function chooseClassic() {
  state.pendingMode = 'classic';
  ui.stageMenu.classList.add('hidden');
  const ok = await say(`<strong>CEREBRO:</strong> ${ORACULO.clasico}<br><br>Responderás con los botones: SÍ, NO, NO LO SÉ, PROBABLEMENTE SÍ o PROBABLEMENTE NO.<br><br>¿Aceptas el duelo?`);
  if (ok) ui.stageActions.classList.remove('hidden');
}

async function startClassic() {
  resetGame();
  classicSetMode(true);
  window.MatchHistory?.begin('clásico');
  classic.s = Clasico.nuevo(PERSONAJES);
  classic.cur = null; classic.fails = 0; classic.phase = 'ask';
  state.guessesLeft = 3; updateHud();
  show(ui.game);
  addMessage('Piensa en un personaje, real o ficticio. Responde con los botones y yo lo adivinaré.', 'mind');
  startTimer();
  await sleep(1400);
  nextClassic();
}

function nextClassic() {
  const s = classic.s;
  state.questionCount = s.n; state.guessesLeft = 3 - classic.fails; updateHud();
  if (Clasico.debeAdivinar(s) || s.n >= MAX_QUESTIONS) return classicGuess();
  const q = Clasico.pregunta(s, MindLogic);
  if (!q) return classicGuess();
  classic.cur = { tipo: 'q', q };
  addMessage(Clasico.frase(q), 'mind');
}

function classicGuess() {
  const m = Clasico.mejor(classic.s);
  if (!m) return classicName();
  classic.cur = { tipo: 'g', i: m.i, p: m.p };
  addMessage(`¿Tu personaje es ${m.p.nombre}?`, 'mind');
}

function classicName() {
  classic.cur = null; classic.phase = 'name';
  addMessage('Me rindo... ¿En quién pensabas? Escribe su nombre.', 'mind');
  document.body.classList.add('name-phase');
  $cl('classicPanel').classList.add('hidden');
  ui.input.placeholder = 'Nombre del personaje...';
  ui.input.disabled = false; ui.send.disabled = false; ui.input.focus();
}

function classicSaveName(text) {
  const nombre = text.trim();
  if (!nombre) return;
  addMessage(nombre, 'player');
  try {
    const k = 'mind_personajes_nuevos';
    const l = JSON.parse(localStorage.getItem(k) || '[]');
    l.push({ nombre, fecha: new Date().toISOString(), respuestas: classic.s.log });
    localStorage.setItem(k, JSON.stringify(l));
  } catch (e) {}
  addMessage(`Anotado: ${nombre}. La próxima vez estaré preparado.`, 'mind');
  classicEnd();
}

function classicEnd() {
  if (classic.phase !== 'end') window.MatchHistory?.finish('Finalizada', {modo:'clásico'});
  classic.phase = 'end'; classic.cur = null;
  clearInterval(state.timerId);
  document.body.classList.remove('name-phase');
  $cl('classicPanel').classList.add('hidden');
  $cl('classicEnd').classList.remove('hidden');
  ui.input.placeholder = 'Pregunta de sí/no...';
}

function classicAnswer(ans) {
  const c = classic.cur;
  if (!c) return;
  addMessage(CL_LABEL[ans], 'player');
  if (c.tipo === 'q') { Clasico.responder(classic.s, MindLogic, c.q, ans); return nextClassic(); }
  if (ans === 'si' || ans === 'psi') { addMessage(`¡Lo sabía! Eras ${c.p.nombre}.`, 'mind'); return classicEnd(); }
  classic.fails++; Clasico.rechazar(classic.s, c.i);
  if (classic.fails >= 3 || !Clasico.mejor(classic.s)) return classicName();
  addMessage('Entonces sigo preguntando...', 'mind');
  nextClassic();
}

function resetGame() {
  clearInterval(state.timerId);
  state.secret = PERSONAJES[Math.floor(Math.random() * PERSONAJES.length)];
  state.active = true;
  state.busy = false;
  state.questionCount = 0;
  state.guessesLeft = MAX_GUESSES;
  state.suggestionUses = SUGGESTION_LIMIT;
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
  const bloqueada = !!window.Sugeridor && !Sugeridor.desbloqueada(MindLogic, PERSONAJES, state.facts);
  ui.suggest.textContent = bloqueada ? 'SUGERENCIA · BLOQUEADA' : `SUGERENCIA (${state.suggestionUses})`;
  ui.suggest.classList.toggle('locked', bloqueada);
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

function addMessage(text, kind = 'system') {
  window.MatchHistory?.record(kind === 'player' ? 'TÚ' : kind === 'mind' ? 'CEREBRO' : 'SISTEMA', text, kind);
  const row = document.createElement('div');
  row.className = `message message-${kind}`;
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  const a = avatarFor(kind);
  avatar.textContent = a.txt;
  avatar.classList.add(a.cls);
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = (kind === 'player' ? 'TÚ: ' : kind === 'mind' ? 'CEREBRO: ' : '') + text;
  row.append(avatar, bubble);
  ui.chat.append(row);
  ui.chat.scrollTop = ui.chat.scrollHeight;
}

async function startGame() {
  if (state.pendingMode === 'classic') { state.pendingMode = null; return startClassic(); }
  classicSetMode(false);
  resetGame();
  window.MatchHistory?.begin('solo', {personaje: state.secret?.nombre || ''});
  show(ui.game);
  addMessage('He elegido a alguien. Tienes veinte preguntas. Empieza.', 'mind');
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
  updateHud();
  addMessage(answer ? 'SÍ.' : 'NO.', 'mind');

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

function openSuggestions() {
  if (!state.active || state.busy || state.suggestionUses <= 0) return;
  if (window.Sugeridor && !Sugeridor.desbloqueada(MindLogic, PERSONAJES, state.facts)) { addMessage(ORACULO.bloqueada, 'mind'); return; }
  state.suggestionUses--;
  updateHud();
  if (state.suggestionUses <= 0) ui.suggest.disabled = true;

  let pool = window.Sugeridor ? Sugeridor.sugerir(MindLogic, PERSONAJES, state.facts, state.asked, 5) : [];
  if (!pool.length) pool = suggestionPool.filter(q => !state.asked.has(MindLogic.normalizar(q))).sort(() => Math.random() - .5).slice(0, 5);

  ui.suggestions.textContent = '';
  (pool.length ? pool : suggestionPool.slice(0, 5)).forEach(q => {
    const b = document.createElement('button');
    b.className = 'btn btn-green suggestion';
    b.textContent = q;
    b.onclick = () => {
      ui.input.value = q;
      ui.suggestModal.classList.add('hidden');
      ui.input.focus();
    };
    ui.suggestions.append(b);
  });
  ui.suggestModal.classList.remove('hidden');
}

function finish(win, reason) {
  window.MatchHistory?.record('SISTEMA', reason, 'result');
  window.MatchHistory?.finish(win ? 'Victoria' : 'Derrota', {personaje: state.secret?.nombre || ''});
  state.active = false;
  lockInput(true);
  clearInterval(state.timerId);
  show(ui.result);
  ui.resultTag.textContent = win ? 'ACCESO CONCEDIDO' : 'ACCESO DENEGADO';
  ui.resultTitle.textContent = win ? 'VICTORIA' : 'DERROTA';
  ui.resultCharacter.textContent = state.secret.nombre;
  ui.resultDescription.textContent = `${reason} ${state.secret.descripcion}`;
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

document.addEventListener('click', e => closeModalFromTarget(e.target));
el('startBtn').onclick = openStage;
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
ui.espejoBtn.onclick = () => say(`<strong>CEREBRO:</strong> ${ORACULO.espejo}`);
ui.dueloBtn.onclick = () => {};

el('menuBtn').onclick = openStage;
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
el('playAgainBtn').onclick = startGame;
el('resultMenuBtn').onclick = openStage;
el('resultExitBtn').onclick = shutdown;
el('restartBtn').onclick = () => location.reload();

titleSequence();
})();
