(() => {
'use strict';
const MAX_QUESTIONS = 20;
const MAX_GUESSES = 2;
const FALLBACK_TIMEOUT_MS = 9000;
const SUGGESTION_LIMIT = 5;
const MIND_API_URL = "https://mind-duel-jxu8.onrender.com";
  
const el = id => document.getElementById(id);
const ui = {
  arcade:el('arcade'),flash:el('flash'),title:el('titleScreen'),introBrain:el('introBrain'),titleLayout:el('titleLayout'),
  stage:el('stageScreen'),stageDialog:el('stageDialog'),stageActions:el('stageActions'),curtainLeft:el('curtainLeft'),curtainRight:el('curtainRight'),
  continueBtn:el('continueBtn'),game:el('gameScreen'),result:el('resultScreen'),chat:el('chat'),timer:el('timer'),questions:el('questionsHud'),guesses:el('guessesHud'),
  form:el('questionForm'),input:el('questionInput'),send:el('sendBtn'),suggest:el('suggestBtn'),guess:el('guessBtn'),
  guessModal:el('guessModal'),guessInput:el('guessInput'),guessHint:el('guessHint'),suggestModal:el('suggestModal'),suggestions:el('suggestions'),
  resultTag:el('resultTag'),resultTitle:el('resultTitle'),resultCharacter:el('resultCharacter'),resultDescription:el('resultDescription'),shutdown:el('shutdownScreen')
};

const state={secret:null,active:false,busy:false,questionCount:0,guessesLeft:MAX_GUESSES,suggestionUses:SUGGESTION_LIMIT,asked:new Set(),timerId:null,seconds:0,stageStep:'challenge'};
const suggestionPool=['¿Es una persona real?','¿Es ficticio?','¿Es una mujer?','¿Es un hombre?','¿Sigue con vida?','¿Es humano?','¿Es de Europa?','¿Es de América?','¿Es científico?','¿Es artista?','¿Es escritor?','¿Es un superhéroe?','¿Tiene poderes?','¿Usa magia?','¿Aparece en películas?','¿Aparece en libros?','¿Aparece en cómics?','¿Es de Marvel?','¿Es de DC Comics?','¿Es de Harry Potter?','¿Es de Star Wars?'];

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function show(screen){[ui.title,ui.stage,ui.game,ui.result].forEach(s=>s.classList.add('hidden'));screen.classList.remove('hidden');}
function flash(){ui.flash.classList.remove('fire');void ui.flash.offsetWidth;ui.flash.classList.add('fire');}

async function titleSequence(){
  clearInterval(state.timerId);state.active=false;ui.arcade.classList.remove('shutdown');ui.shutdown.classList.add('hidden');
  show(ui.title);ui.titleLayout.classList.add('hidden');ui.introBrain.classList.remove('hidden');
  flash();await sleep(520);flash();await sleep(670);ui.introBrain.classList.add('hidden');ui.titleLayout.classList.remove('hidden');
}

async function openStage(){
  clearInterval(state.timerId);state.active=false;show(ui.stage);state.stageStep='challenge';
  ui.curtainLeft.classList.remove('open');ui.curtainRight.classList.remove('open');
  ui.stageDialog.innerHTML='<strong>MIND:</strong> Has entrado a mi escenario.<br>Prepárate para el duelo.';
  ui.continueBtn.textContent='CONTINUAR';
  await sleep(320);ui.curtainLeft.classList.add('open');ui.curtainRight.classList.add('open');
}

function showRules(){
  state.stageStep='rules';
  ui.stageDialog.innerHTML=`<strong>MIND:</strong> He elegido a alguien.<br><br><span style="color:#00ff67">20 preguntas.</span><br><span style="color:#00ff67">2 intentos para adivinar.</span><br>Haz preguntas que puedan responderse con SÍ o NO.<br><br><span style="color:#f000ff">Cuando quieras arriesgar, pulsa ADIVINAR.</span>`;
  ui.continueBtn.textContent='COMENZAR';
}

function resetGame(){
  clearInterval(state.timerId);state.secret=PERSONAJES[Math.floor(Math.random()*PERSONAJES.length)];state.active=true;state.busy=false;state.questionCount=0;state.guessesLeft=MAX_GUESSES;state.suggestionUses=SUGGESTION_LIMIT;state.asked.clear();state.seconds=0;ui.chat.textContent='';updateHud();ui.suggest.disabled=false;ui.guess.disabled=false;ui.input.disabled=false;ui.send.disabled=false;
  console.info('[MIND] Nueva partida. Motor lógico activo.');
}
function updateHud(){ui.questions.textContent=`${state.questionCount}/${MAX_QUESTIONS}`;ui.guesses.textContent=String(state.guessesLeft);ui.suggest.textContent=`SUGERENCIA (${state.suggestionUses})`;}
function startTimer(){clearInterval(state.timerId);state.timerId=setInterval(()=>{state.seconds++;const m=String(Math.floor(state.seconds/60)).padStart(2,'0');const s=String(state.seconds%60).padStart(2,'0');ui.timer.textContent=`${m}:${s}`;},1000);}

function avatarFor(kind){if(kind==='mind')return {txt:'⌁',cls:'avatar-mind'};if(kind==='player')return {txt:'●',cls:'avatar-player'};return {txt:'·',cls:'avatar-system'};}
function addMessage(text,kind='system'){
  const row=document.createElement('div');row.className=`message message-${kind}`;const avatar=document.createElement('div');avatar.className='avatar';const a=avatarFor(kind);avatar.textContent=a.txt;avatar.classList.add(a.cls);const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=(kind==='player'?'TÚ: ':kind==='mind'?'MIND: ':'')+text;row.append(avatar,bubble);ui.chat.append(row);ui.chat.scrollTop=ui.chat.scrollHeight;
}

async function startGame(){resetGame();show(ui.game);addMessage('He elegido a alguien. Tienes veinte preguntas. Empieza.','mind');startTimer();setTimeout(()=>ui.input.focus(),80);}
function lockInput(v){state.busy=v;ui.input.disabled=v;ui.send.disabled=v;}

async function askQuestion(text){
  if(!state.active||state.busy)return;const clean=text.trim();if(!clean)return;
  addMessage(clean,'player');state.asked.add(MindLogic.normalizar(clean));lockInput(true);
  let answer=MindLogic.evaluarPregunta(clean,state.secret);let source='logic';
  if(answer===null){const interpreted=await interpretWithOraculo(clean);if(interpreted?.concepto){answer=MindLogic.resolverConcepto(interpreted.concepto,state.secret);source='aria→logic';}}
  if(answer===null){addMessage('NO LO SÉ. Reformula la pregunta.','mind'); console.info('[ORACULO FALLÓ]', clean);console.info('[MIND] UNKNOWN',clean);lockInput(false);ui.input.focus();return;}
  state.questionCount++;updateHud();addMessage(answer?'SÍ.':'NO.','mind');console.info(`[MIND] ${source}`,clean,'=>',answer);
  if(state.questionCount>=MAX_QUESTIONS){finish(false,'Has agotado tus veinte preguntas.');return;}
  lockInput(false);ui.input.focus();
}

async function interpretWithOraculo(question){
  try{
    if(typeof OraculoLocal === "undefined") return null;

    const data = await OraculoLocal.interpretar(question);

    if(
      data?.concepto &&
      MindLogic.CONCEPTOS_PERMITIDOS.includes(data.concepto)
    ){
      return data;
    }

  }catch(err){
    console.info("[MIND] Oraculo no disponible:", err);
  }

  return null;
}

function normalizeGuess(s){return MindLogic.normalizar(s).replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();}
function editDistance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const temp=row[j];const cost=a[i-1]===b[j-1]?0:1;row[j]=Math.min(row[j]+1,row[j-1]+1,prev+cost);prev=temp;}}return row[b.length];}
function guessMatches(raw,target){const a=normalizeGuess(raw),b=normalizeGuess(target);if(!a||!b)return false;if(a===b)return true;const maxDist=b.length>=16?2:b.length>=6?1:0;return Math.abs(a.length-b.length)<=maxDist&&editDistance(a,b)<=maxDist;}
function isCorrectGuess(raw){return [state.secret.nombre,...(state.secret.alias||[])].some(x=>guessMatches(raw,x));}
function openGuess(){if(!state.active||state.busy)return;ui.guessHint.textContent=`Te quedan ${state.guessesLeft} intento${state.guessesLeft===1?'':'s'}.`;ui.guessInput.value='';ui.guessModal.classList.remove('hidden');setTimeout(()=>ui.guessInput.focus(),40);}
function confirmGuess(){const value=ui.guessInput.value.trim();if(!value)return;ui.guessModal.classList.add('hidden');addMessage(`Adivino: ${value}`,'player');if(isCorrectGuess(value)){finish(true,'Has roto el enigma.');return;}state.guessesLeft--;updateHud();addMessage('Incorrecto.','mind');if(state.guessesLeft<=0){finish(false,'Has agotado tus intentos de adivinanza.');return;}addMessage('Te queda un último intento.','mind');}

function openSuggestions(){if(!state.active||state.busy||state.suggestionUses<=0)return;state.suggestionUses--;updateHud();if(state.suggestionUses<=0)ui.suggest.disabled=true;const pool=suggestionPool.filter(q=>!state.asked.has(MindLogic.normalizar(q))).sort(()=>Math.random()-.5).slice(0,5);ui.suggestions.textContent='';(pool.length?pool:suggestionPool.slice(0,5)).forEach(q=>{const b=document.createElement('button');b.className='btn btn-green suggestion';b.textContent=q;b.onclick=()=>{ui.input.value=q;ui.suggestModal.classList.add('hidden');ui.input.focus();};ui.suggestions.append(b);});ui.suggestModal.classList.remove('hidden');}

function finish(win,reason){state.active=false;lockInput(true);clearInterval(state.timerId);show(ui.result);ui.resultTag.textContent=win?'ACCESO CONCEDIDO':'ACCESO DENEGADO';ui.resultTitle.textContent=win?'VICTORIA':'DERROTA';ui.resultCharacter.textContent=state.secret.nombre;ui.resultDescription.textContent=`${reason} ${state.secret.descripcion}`;}
async function shutdown(){clearInterval(state.timerId);[ui.guessModal,ui.suggestModal].forEach(m=>m.classList.add('hidden'));ui.arcade.classList.add('shutdown');await sleep(700);ui.shutdown.classList.remove('hidden');}
function closeModalFromTarget(target){const id=target.dataset.close;if(id)el(id)?.classList.add('hidden');}

document.addEventListener('click',e=>closeModalFromTarget(e.target));
el('startBtn').onclick=openStage;el('exitBtn').onclick=shutdown;el('backTitleBtn').onclick=titleSequence;
ui.continueBtn.onclick=()=>{if(state.stageStep==='challenge')showRules();else startGame();};
el('menuBtn').onclick=openStage;ui.form.onsubmit=e=>{e.preventDefault();const q=ui.input.value;ui.input.value='';askQuestion(q);};
ui.guess.onclick=openGuess;el('confirmGuessBtn').onclick=confirmGuess;ui.guessInput.addEventListener('keydown',e=>{if(e.key==='Enter')confirmGuess();});ui.suggest.onclick=openSuggestions;
el('playAgainBtn').onclick=startGame;el('resultMenuBtn').onclick=openStage;el('resultExitBtn').onclick=shutdown;el('restartBtn').onclick=()=>location.reload();

titleSequence();
})();
