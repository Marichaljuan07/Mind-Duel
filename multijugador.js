(() => {
'use strict';
const $ = id => document.getElementById(id);
const panels = ['setup','lobby','play','result'];
const show = id => panels.forEach(x => $(x).classList.toggle('hidden', x !== id));
const status = (id, text) => $(id).textContent = text;
const s = { peer:null, conn:null, role:null, room:'', host:false, secret:'', questions:0, lastQuestion:'', finished:false, started:false };
const LIMIT = 20;
const names = typeof PERSONAJES !== 'undefined' && Array.isArray(PERSONAJES) ? PERSONAJES.map(p=>p.nombre) : [];
$('characterNames').innerHTML = names.map(n=>`<option value="${escapeHtml(n)}"></option>`).join('');
function escapeHtml(t){return String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function normalizeCode(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6)}
function displayName(role){return role==='brain'?'🧠 CEREBRO':'🔎 DETECTIVE'}
function addLine(container,text,kind='system',label=''){
  const n=document.createElement('div');n.className=`mp-entry ${kind}`;n.textContent=label?`${label}: ${text}`:text;$(container).append(n);$(container).scrollTop=$(container).scrollHeight;
}
function send(packet){if(!s.conn||!s.conn.open)return false;s.conn.send(packet);return true}
function setLocalRole(role){s.role=role;$('roleBadge').textContent=`TU ROL: ${displayName(role)}`;$('myRole').textContent=`TU ROL: ${displayName(role)}`;$('secretWrap').classList.toggle('hidden',role!=='brain');$('startRound').classList.toggle('hidden',role!=='brain');$('detectiveControls').classList.toggle('hidden',role!=='detective');$('brainControls').classList.toggle('hidden',role!=='brain')}
function goLive(){show('play');$('myRole').textContent=`TU ROL: ${displayName(s.role)}`;if(s.role==='detective')$('detectiveControls').classList.remove('hidden');else $('brainControls').classList.remove('hidden');addLine('gameLog',`Conexión establecida. ${displayName(s.role)} contra ${displayName(s.role==='brain'?'detective':'brain')}.`);if(s.role==='brain')$('brainPrompt').textContent='Esperando la primera pregunta del Detective…';}
function connectionReady(){status('lobbyStatus','¡Conectados! Preparando la partida…');$('startRound').disabled=false;if(!s.host)setTimeout(()=>{if(!s.started)status('lobbyStatus','Conectados. El Cerebro iniciará la partida en breve.')},350)}
function fail(text){status('setupStatus',text);$('createBtn').disabled=false;$('joinBtn').disabled=false}
function initPeer(id){if(!window.Peer){fail('No cargó el servicio de conexión. Revisá internet y recargá.');return null;}try{return new Peer(id||undefined)}catch(e){fail('No se pudo iniciar la conexión.');return null}}
function bindConnection(conn){s.conn=conn;conn.on('open',()=>{if(s.host){status('lobbyStatus','Jugador conectado. Asignando roles…');}else{status('lobbyStatus','Conectado. Esperando inicio…');conn.send({type:'hello'});}});conn.on('data',handle);conn.on('close',()=>{status('connectionStatus','DESCONECTADO');status('lobbyStatus','La conexión se cerró.');if(!$('play').classList.contains('hidden'))addLine('gameLog','El otro jugador se desconectó.');});conn.on('error',()=>{status('lobbyStatus','Se perdió la conexión con la sala.');});}
function handle(p){if(!p||typeof p!=='object')return;
 if(p.type==='hello'&&s.host){send({type:'welcome',hostRole:s.role,room:s.room});setTimeout(()=>{if(!s.started)connectionReady()},200);return;}
 if(p.type==='welcome'&&!s.host){s.room=p.room||s.room;setLocalRole(p.hostRole==='brain'?'detective':'brain');status('roomCode',s.room);connectionReady();return;}
 if(p.type==='start'){s.started=true;goLive();return;}
 if(p.type==='question'&&s.role==='brain'&&!s.finished){s.questions=Math.min(LIMIT,s.questions+1);$('questionCount').textContent=`PREGUNTAS: ${s.questions}/${LIMIT}`;s.lastQuestion=String(p.text||'').slice(0,220);addLine('gameLog',s.lastQuestion,'ask','Detective');$('brainPrompt').textContent=`Pregunta: “${s.lastQuestion}”`;document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=false);return;}
 if(p.type==='answer'&&s.role==='detective'&&!s.finished){addLine('gameLog',`${p.answer==='si'?'SÍ':p.answer==='no'?'NO':'NO LO SÉ'}.`,'reply','Cerebro');if(s.questions>=LIMIT){addLine('gameLog','Llegaste al límite de 20 preguntas. Probá una última adivinanza.');$('guessBtn').textContent='ADIVINAR (ÚLTIMA OPORTUNIDAD)';}return;}
 if(p.type==='guess'&&s.role==='brain'&&!s.finished){s.pendingGuess=String(p.name||'').slice(0,80);addLine('gameLog',`El Detective arriesga: ${s.pendingGuess}`,'ask','Adivinanza');$('brainPrompt').textContent=`¿Acertó con “${s.pendingGuess}”?`;document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);$('judgeRow').classList.remove('hidden');return;}
 if(p.type==='judge'&&s.role==='detective'){finishResult(!!p.correct,String(p.character||''));return;}
 if(p.type==='chat'){addLine('chatLog',String(p.text||'').slice(0,300),'chat-theirs','AMIGO');return;}
}
function generateRoomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=new Uint8Array(6);try{if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(bytes);else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256)}catch(_){for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256)}return Array.from(bytes,x=>chars[x%chars.length]).join('')}
function openHostPeer(role,retries=4){s.room=generateRoomCode();status('setupStatus',retries<4?'El código estaba ocupado; generando uno nuevo…':'Abriendo sala…');const peer=initPeer(`mindduel${s.room}`);if(!peer)return;s.peer=peer;peer.on('open',()=>{setLocalRole(role);$('roomCode').textContent=s.room;show('lobby');status('lobbyStatus','Sala lista. Compartí el código o el enlace con tu amigo.');});peer.on('connection',conn=>bindConnection(conn));peer.on('error',err=>{console.warn('[Mind Duel peer]',err);try{peer.destroy()}catch(_){}if(err.type==='unavailable-id'&&retries>0){setTimeout(()=>openHostPeer(role,retries-1),250);return}fail(err.type==='unavailable-id'?'No se pudo reservar un código libre. Probá otra vez.':'No se pudo abrir la sala. Revisá la conexión e intentá de nuevo.');});}
function createRoom(){let role=$('hostRole').value;if(role==='random')role=Math.random()<.5?'brain':'detective';s.host=true;$('createBtn').disabled=true;$('joinBtn').disabled=true;openHostPeer(role);}
function joinRoom(){const code=normalizeCode($('joinCode').value);if(code.length!==6){fail('El código debe tener 6 caracteres.');return;}s.host=false;s.room=code;$('createBtn').disabled=true;$('joinBtn').disabled=true;status('setupStatus','Buscando la sala…');const peer=initPeer();if(!peer)return;s.peer=peer;peer.on('open',()=>{show('lobby');$('roomCode').textContent=code;status('lobbyStatus','Conectando con el anfitrión…');const conn=peer.connect(`mindduel${code}`,{reliable:true});bindConnection(conn);setTimeout(()=>{if(!conn.open&&$('lobby').classList.contains('hidden')===false)status('lobbyStatus','Aún no conecta. Confirmá el código y que el anfitrión siga en la sala.')},10000);});peer.on('error',err=>{console.warn('[Mind Duel peer]',err);fail('No encontramos esa sala. Revisá el código y que el anfitrión esté conectado.');try{peer.destroy()}catch(_){}});}
function startRound(){if(s.role!=='brain')return;if(!s.conn||!s.conn.open){status('lobbyStatus','Esperá a que tu amigo se conecte antes de iniciar.');return;}const entry=names.find(n=>n.toLocaleLowerCase()=== $('secretName').value.trim().toLocaleLowerCase());if(!entry){status('lobbyStatus','Elegí un personaje de la lista de 100 para continuar.');return;}s.secret=entry;s.started=true;send({type:'start'});goLive();}
function askQuestion(text){const q=text.trim();if(!q||s.finished||s.questions>=LIMIT)return;if(!send({type:'question',text:q})){addLine('gameLog','No se pudo enviar: verificá que tu amigo siga conectado.');return;}s.questions++;$('questionCount').textContent=`PREGUNTAS: ${s.questions}/${LIMIT}`;addLine('gameLog',q,'ask','Vos');$('questionInput').value='';$('brainPrompt').textContent=`Esperando respuesta para: “${q}”`;}
function guess(){if(s.finished)return;$('guessInput').value='';$('guessModal').classList.remove('hidden');setTimeout(()=>$('guessInput').focus(),40)}
function submitGuess(e){e.preventDefault();if(s.finished)return;const name=$('guessInput').value.trim();if(!name)return;const guess=name.slice(0,80);if(!send({type:'guess',name:guess})){addLine('gameLog','No se pudo enviar la adivinanza: verificá la conexión.');return}addLine('gameLog',`Tu adivinanza: ${guess}`,'ask','Vos');$('guessModal').classList.add('hidden');$('guessBtn').disabled=true;}
function finishResult(correct,character){s.finished=true;$('guessModal').classList.add('hidden');const won=s.role==='detective'?correct:!correct;show('result');$('resultIcon').textContent=won?'🏆':'💀';$('resultTag').textContent=won?'ACCESO CONCEDIDO':'ACCESO DENEGADO';$('resultTitle').textContent=won?'¡VICTORIA!':'DERROTA';$('resultCharacter').textContent=character?`El personaje era: ${character}`:'';$('resultText').textContent=correct?'El Detective descubrió el personaje.':`El Detective no acertó. ¡Punto para el Cerebro!`}
function sendChat(text){const t=text.trim().slice(0,300);if(!t)return;if(!send({type:'chat',text:t})){status('connectionStatus','SIN CONEXIÓN');return}addLine('chatLog',t,'chat-mine','VOS');$('chatInput').value='';}
$('createBtn').onclick=createRoom;$('joinBtn').onclick=joinRoom;$('randomCharacter').onclick=()=>{if(!names.length)return;const selected=names[Math.floor(Math.random()*names.length)];$('secretName').value=selected;status('lobbyStatus','Personaje aleatorio elegido. Solo vos podés verlo.');};$('joinCode').addEventListener('input',e=>e.target.value=normalizeCode(e.target.value));$('startRound').onclick=startRound;$('startRound').disabled=true;
$('copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(s.room);$('copyCode').textContent='¡COPIADO!';setTimeout(()=>$('copyCode').textContent='COPIAR CÓDIGO',1600)}catch(_){status('lobbyStatus',`Copiá el código: ${s.room}`)}};
$('copyInvite').onclick=async()=>{const url=new URL(location.href);url.searchParams.set('room',s.room);try{await navigator.clipboard.writeText(url.href);$('copyInvite').textContent='¡ENLACE COPIADO!';setTimeout(()=>$('copyInvite').textContent='COPIAR INVITACIÓN',1800)}catch(_){status('lobbyStatus',`Copiá este enlace: ${url.href}`)}};
$('cancelRoom').onclick=()=>{try{s.peer?.destroy()}catch(_){}location.href='index.html'};
$('questionForm').onsubmit=e=>{e.preventDefault();askQuestion($('questionInput').value)};
$('guessBtn').onclick=guess;$('guessForm').onsubmit=submitGuess;$('cancelGuess').onclick=()=>$('guessModal').classList.add('hidden');$('guessModal').addEventListener('click',e=>{if(e.target.id==='guessModal')$('guessModal').classList.add('hidden')});
$('chatForm').onsubmit=e=>{e.preventDefault();sendChat($('chatInput').value)};
document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
 const answer=b.dataset.answer;
 if($('judgeRow')&&!$('judgeRow').classList.contains('hidden')){const correct=answer==='si';const character=s.secret;if(!send({type:'judge',correct,character})){addLine('gameLog','No se pudo enviar el veredicto: revisá la conexión.');return}finishResult(correct,character);return;}
 if(s.role!=='brain'||!s.lastQuestion||s.finished)return;
 const known=window.MindLogic&&s.secret?MindLogic.evaluarPregunta(s.lastQuestion,PERSONAJES.find(p=>p.nombre===s.secret)):null;
 if(answer!=='nose'&&known!==null&&known!==undefined&&((answer==='si')!==known)){ $('brainPrompt').textContent='La ficha del personaje indica lo contrario. Revisá tu respuesta antes de enviarla.'; return; }
 send({type:'answer',answer});addLine('gameLog',answer==='si'?'SÍ.':answer==='no'?'NO.':'NO LO SÉ.','reply','Vos');s.lastQuestion='';$('brainPrompt').textContent='Esperando la pregunta del Detective…';document.querySelectorAll('[data-answer]').forEach(x=>x.disabled=true);
});
$('newRoom').onclick=()=>location.reload();
const invited=normalizeCode(new URLSearchParams(location.search).get('room'));if(invited.length===6){$('joinCode').value=invited;status('setupStatus','Invitación recibida: revisá el código y tocá UNIRME.');}
// Add separate verdict controls so the Brain explicitly confirms the final guess.
const row=document.createElement('div');row.id='judgeRow';row.className='mp-answer-row hidden';row.innerHTML='<button data-judge="yes" class="btn btn-green">SÍ, ACERTÓ</button><button data-judge="no" class="btn btn-red">NO, FALLÓ</button>';$('brainControls').append(row);
row.querySelectorAll('[data-judge]').forEach(b=>b.onclick=()=>{const correct=b.dataset.judge==='yes';const character=s.secret;if(!send({type:'judge',correct,character})){status('connectionStatus','SIN CONEXIÓN');return}finishResult(correct,character);});
})();
