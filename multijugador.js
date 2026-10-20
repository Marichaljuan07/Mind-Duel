(() => {
'use strict';
const $=id=>document.getElementById(id);
const on=(id,event,handler,options=false)=>{const el=$(id);if(el)el.addEventListener(event,handler,options);};
const setText=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
const setClass=(id,cls,add)=>{const el=$(id);if(el)el.classList[add?'add':'remove'](cls);};
const modal=$('duelModal'); let peer=null,conn=null,host=false,connected=false,myRole='',theirRole='',secret='',pendingQuestion='',waitingForAnswer=false,waitingForGuess=false,onlineStartedAt=0,onlineTimerId=null,onlineQuestionCount=0,onlineAnswerCount=0,onlineGuessesLeft=2,pendingOnlineGuess='',remotePeerId='',reconnecting=false;
const ONLINE_SAVE_KEY='mindduel_online_progress_v1';
function saveOnlineProgress(){if(!document.body.classList.contains('duel-online')||!onlineStartedAt)return;try{localStorage.setItem(ONLINE_SAVE_KEY,JSON.stringify({startedAt:onlineStartedAt,role:myRole,questionCount:onlineQuestionCount,guessesLeft:onlineGuessesLeft,secret:myRole==='brain'?secret:'',savedAt:Date.now(),events:window.MatchHistory?.getCurrent()?.events||[]}));}catch{}}
function updateOnlineHud(){const q=$('questionsHud');if(q)q.textContent=(myRole==='brain'?onlineAnswerCount:onlineQuestionCount)+'/20';const label=$('questionCountLabel');if(label)label.textContent=myRole==='brain'?'RESP.':'PREG.';const g=$('guessesHud');if(g)g.textContent=String(onlineGuessesLeft);saveOnlineProgress();}
const labels={si:'Sí',no:'No',nose:'No lo sé',psi:'Probablemente sí',pno:'Probablemente no'};
const discovererGuessLines=[
 'Voy a arriesgarme: creo que ya sé quién es.',
 'Tengo una sospecha… voy a intentar adivinar.',
 'Es hora de probar mi teoría: voy a adivinar.',
 'Creo que ya lo tengo. Voy a decir un nombre.',
 'Me la juego con esta: voy a adivinar el personaje.'
];
function randomDiscovererGuessLine(){return discovererGuessLines[Math.floor(Math.random()*discovererGuessLines.length)];}
const nativeChat=$('chat');
function status(t){setText('duelStatus',t);}
function showModal(){if(!modal)return;modal.classList.remove('hidden');const name=$('duelName');if(name)name.value=localStorage.getItem('mindduel_player_name')||'';}
function reset(){clearInterval(onlineTimerId);onlineTimerId=null;onlineStartedAt=0;onlineQuestionCount=0;onlineAnswerCount=0;onlineGuessesLeft=2;pendingOnlineGuess='';try{conn&&conn.close();peer&&peer.destroy()}catch{} conn=null;peer=null;connected=false;host=false;myRole='';theirRole='';secret='';pendingQuestion='';waitingForAnswer=false;waitingForGuess=false;$('hostRoom').classList.add('hidden');$('joinRoom').classList.add('hidden');$('duelConnected').classList.add('hidden');$('createRoomBtn').classList.remove('hidden');$('joinRoomBtn').classList.remove('hidden');if($('duelMessages'))$('duelMessages').innerHTML='';$('floatingMessages').innerHTML='';$('roleChooser').classList.remove('hidden');$('chatBubbleBtn').classList.add('hidden');$('floatingChat').classList.add('hidden');status('Elegí crear una sala o unirte a una.');}
function addMessage(name,msg,kind=''){for(const target of ['duelMessages','floatingMessages']){const box=$(target);if(!box)continue;const row=document.createElement('div');row.className='duel-message '+kind;const who=document.createElement('b');who.textContent=name+' · ';const body=document.createElement('span');body.textContent=msg;row.append(who,body);box.append(row);box.scrollTop=box.scrollHeight;}}
function gameMessage(text,kind='system'){window.MatchHistory?.record(kind==='player'?'JUGADOR':kind==='mind'?'CEREBRO':'SISTEMA',text,kind);if(!nativeChat)return;const row=document.createElement('div');row.className='message message-'+(kind==='player'?'player':kind==='mind'?'mind':'system');const avatar=document.createElement('div');avatar.className='avatar '+(kind==='mind'?'avatar-mind':kind==='player'?'avatar-player':'avatar-system');const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=text;row.append(avatar,bubble);nativeChat.append(row);nativeChat.scrollTop=nativeChat.scrollHeight;}
function send(obj){if(!conn||!conn.open)return false;try{conn.send(obj);return true;}catch(e){status('No se pudo enviar el mensaje. Revisá la conexión.');return false;}}
function saveName(){const field=$('duelName');const n=((field&&field.value||'').trim()||'Jugador');if(field)field.value=n;localStorage.setItem('mindduel_player_name',n);return n;}
function populateCharacters(){const list=$('characterOptions');const people=(typeof PERSONAJES!=='undefined'?PERSONAJES:window.PERSONAJES);if(!list||!Array.isArray(people))return;list.innerHTML='';people.forEach(p=>{const o=document.createElement('option');o.value=p.nombre;list.append(o);});}
function updateRoles(){
 if(!connected)return;
 if(!myRole||!theirRole){$('roleStatus').textContent='Elegí tu papel. Tu amigo debe elegir el otro.';return;}
 if(myRole===theirRole){$('roleStatus').textContent='Los dos eligieron el mismo papel. Uno debe cambiar.';return;}
 $('roleChooser').classList.add('hidden');
 if(myRole==='brain'){
   $('brainRolePanel').classList.remove('hidden');$('guessRolePanel').classList.add('hidden');
   $('roleStatus').textContent='Elegiste ser el Cerebro. Elegí el personaje antes de entrar.';
   $('brainSetupStatus').textContent='Elegí un personaje para continuar.';
   modal.classList.remove('hidden');
 } else {
   $('brainRolePanel').classList.add('hidden');$('guessRolePanel').classList.remove('hidden');
   $('guessRoleStatus').textContent='Esperando a que el Cerebro elija su personaje…';
   modal.classList.remove('hidden');
 }
}
function setDisabled(el,disabled){if(el)el.disabled=!!disabled;}
function setAnswerButtonsDisabled(disabled){document.querySelectorAll('#classicPanel [data-ans]').forEach(b=>{b.disabled=!!disabled;});if(document.body.classList.contains('duel-online')&&myRole==='brain'){setDisabled($('questionInput'),disabled);setDisabled($('sendBtn'),disabled);}}
function setDiscovererControlsDisabled(disabled){setDisabled($('questionInput'),disabled);setDisabled($('sendBtn'),disabled);setDisabled($('guessBtn'),disabled);}
function clearTurnState(){waitingForAnswer=false;waitingForGuess=false;setDiscovererControlsDisabled(false);setAnswerButtonsDisabled(true);}
function suggestedAnswer(question){
 const person=findCharacter(secret);let suggestion=null,source='';
 if(person&&window.MindLogic){try{const result=MindLogic.evaluarPregunta(question,person);if(result===true){suggestion='Sí';source='datos del personaje';}else if(result===false){suggestion='No';source='datos del personaje';}}catch{}}
 if(!suggestion){const rows=readTraining().filter(r=>normalizeName(r.character)===normalizeName(secret)&&normalizeName(r.question)===normalizeName(question));if(rows.length){suggestion=rows[rows.length-1].answer;source='memoria aprendida';}}
 return {suggestion:suggestion||'No lo sé',source:source||'sin datos suficientes'};
}
function renderOnlineSequence(question){
 const box=$('onlineQuestionBox'),hint=$('brainSuggestionStatus'),reading=$('onlineReadingStatus');
 if(hint)hint.classList.add('hidden');
 if(myRole==='brain'){
  if(box)box.textContent='Pregunta recibida: '+question;
  // La pregunta ya aparece arriba: no repetirla en el estado inferior.
  if(reading){reading.classList.add('hidden');reading.textContent='';}
  if(hint){const result=suggestedAnswer(question);hint.textContent='Sugerencia del Cerebro: '+result.suggestion+' · '+result.source;hint.classList.remove('hidden');}
 }else{
  if(box)box.textContent='Pregunta enviada: '+question;
  if(reading){reading.classList.remove('hidden');reading.textContent='Esperando la respuesta del Cerebro…';}
  // El Descubridor no recibe sugerencias: solo ve su pregunta y el estado.
  if(hint)hint.classList.add('hidden');
 }
}
function enterGame(startAt){
 clearInterval(onlineTimerId);onlineStartedAt=Number(startAt)||Date.now();onlineQuestionCount=0;onlineAnswerCount=0;onlineGuessesLeft=2;
 window.MindDuelMode='multiplayer';window.setMindDuelMode&&window.setMindDuelMode('multiplayer');
 modal.classList.add('hidden');
 document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
 $('gameScreen').classList.remove('hidden');$('chatBubbleBtn').classList.remove('hidden');
 document.body.classList.add('duel-online');document.body.classList.toggle('duel-brain',myRole==='brain');document.body.classList.toggle('duel-guess',myRole==='guess');document.body.classList.remove('classic','name-phase');
 $('classicEnd').classList.add('hidden');$('brainInlinePanel').classList.remove('hidden');$('classicPanel').classList.toggle('hidden',myRole!=='brain');
 $('suggestBtn').classList.add('hidden');$('guessBtn').classList.toggle('hidden',myRole==='brain');
 $('questionForm').classList.remove('hidden');
 $('questionInput').disabled=myRole==='brain';$('sendBtn').disabled=myRole==='brain';
 setAnswerButtonsDisabled(true);waitingForAnswer=false;waitingForGuess=false;pendingQuestion='';
 nativeChat.innerHTML='';window.MatchHistory?.begin('online', {rol:myRole});$('questionsHud').textContent='0/20';$('guessesHud').textContent='2';if($('modeHud'))$('modeHud').textContent='ONLINE';if($('questionCountLabel'))$('questionCountLabel').textContent=myRole==='brain'?'RESP.':'PREG.';updateOnlineHud();saveOnlineProgress();
 const updateOnlineClock=()=>{const sec=Math.max(0,Math.floor((Date.now()-onlineStartedAt)/1000));$('timer').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');};updateOnlineClock();onlineTimerId=setInterval(()=>{updateOnlineClock();saveOnlineProgress();},1000);send({type:'progress',count:onlineQuestionCount,startedAt:onlineStartedAt});
 $('questionInput').placeholder=myRole==='brain'?'Escribí una respuesta…':'Escribí tu pregunta…';$('sendBtn').textContent=myRole==='brain'?'Responder':'Enviar';
 if($('brainSuggestionStatus')){ $('brainSuggestionStatus').textContent=''; $('brainSuggestionStatus').classList.add('hidden');}
 if($('onlineQuestionBox'))$('onlineQuestionBox').textContent=myRole==='brain'?'Esperando la pregunta del Descubridor…':'Esperando enviar tu primera pregunta…';
 if($('onlineReadingStatus'))$('onlineReadingStatus').textContent=myRole==='brain'?'Esperando la pregunta del Descubridor…':'Cuando envíes una pregunta, aquí verás el estado de la respuesta.';
 const seqTitle=document.querySelector('.sequence-heading');if(seqTitle)seqTitle.lastChild.textContent=myRole==='brain'?' SECUENCIA DEL CEREBRO':' SECUENCIA DEL DESCUBRIDOR';
 const title=document.querySelector('.console-title span:last-child');if(title)title.textContent=myRole==='brain'?'RESPONDE AL DESCUBRIDOR':'DESCUBRÍ EL PERSONAJE';
 if(myRole==='brain')gameMessage('Personaje elegido. Esperá la pregunta del Descubridor.','system');
 else gameMessage('Tu amigo eligió un personaje. Hacé preguntas y usá ADIVINAR cuando creas saber quién es.','mind');
 status('Duelo online iniciado.');
}
function onData(d){if(!d||typeof d!=='object')return;
 if(d.type==='hello'){status((d.name||'Tu rival')+' se conectó.');return;}
 if(d.type==='progress'){if(Number(d.startedAt)>0)onlineStartedAt=Number(d.startedAt);if(Number.isFinite(Number(d.guessesLeft)))onlineGuessesLeft=Math.max(0,Math.min(2,Number(d.guessesLeft)));updateOnlineHud();return;}
 if(d.type==='state_sync'){if(Number(d.startedAt)>0)onlineStartedAt=Number(d.startedAt);if(myRole==='brain'&&Number.isFinite(Number(d.questionsSeen)))onlineQuestionCount=Math.max(onlineQuestionCount,Number(d.questionsSeen));if(myRole==='guess'&&Number.isFinite(Number(d.answersSeen)))onlineAnswerCount=Math.max(onlineAnswerCount,Number(d.answersSeen));if(Number.isFinite(Number(d.guessesLeft)))onlineGuessesLeft=Math.max(0,Math.min(2,Number(d.guessesLeft)));updateOnlineHud();status('Conexión recuperada. Estado de la partida sincronizado.');return;}
 if(d.type==='chat'){const text=String(d.text||'').slice(0,300);addMessage(d.name||'RIVAL',text,'remote');window.MatchHistory?.record(d.name||'RIVAL',text,'chat');if($('floatingChat').classList.contains('hidden'))$('chatUnread').classList.remove('hidden');return;}
 if(d.type==='role'){theirRole=d.role;updateRoles();return;}
 if(d.type==='secret_ready'){if(myRole==='guess'){if($('guessRoleStatus'))$('guessRoleStatus').textContent='Personaje elegido. Entrando a la partida…';enterGame(d.startedAt);}return;}
 if(d.type==='question'&&myRole==='brain'){
  onlineQuestionCount=Math.max(onlineQuestionCount,Number(d.count)||0);send({type:'progress',questionsSeen:onlineQuestionCount,answersSeen:onlineAnswerCount,startedAt:onlineStartedAt,guessesLeft:onlineGuessesLeft});
  pendingQuestion=String(d.text||'').slice(0,240);if(!pendingQuestion)return;
  renderOnlineSequence(pendingQuestion);$('brainInlinePanel').classList.remove('hidden');setAnswerButtonsDisabled(false);
  gameMessage((d.name||'DESCUBRIDOR')+' pregunta: '+pendingQuestion,'player');$('questionInput').value='';$('questionInput').placeholder='Escribí una respuesta…';$('sendBtn').textContent='Responder';setDisabled($('questionInput'),false);setDisabled($('sendBtn'),false);status('Pregunta recibida. Elegí una respuesta o escribí tu respuesta abajo.');return;
 }
 if(d.type==='answer'&&myRole==='guess'){
  waitingForAnswer=false;setDiscovererControlsDisabled(false);const answer=String(d.text||'');
  onlineAnswerCount=Math.max(onlineAnswerCount+1,Number(d.count)||0);updateOnlineHud();gameMessage('Respuesta del Cerebro: '+answer,'mind');
  if($('onlineQuestionBox'))$('onlineQuestionBox').textContent='Respuesta recibida: '+answer;
  if($('onlineReadingStatus')){$('onlineReadingStatus').classList.remove('hidden');$('onlineReadingStatus').textContent='Respuesta recibida. Podés hacer otra pregunta.';}
  if($('brainSuggestionStatus'))$('brainSuggestionStatus').classList.add('hidden');
  status('Respuesta recibida. Podés hacer otra pregunta o adivinar.');return;
 }
 if(d.type==='guess_announce'&&myRole==='brain'){gameMessage((d.name||'El Descubridor')+' dice: '+String(d.text||'Voy a arriesgarme: creo que ya sé quién es.'),'player');return;}
 if(d.type==='guess'&&myRole==='brain'){
  pendingOnlineGuess=String(d.character||'').trim();if(!pendingOnlineGuess)return;onlineGuessesLeft=Math.max(0,onlineGuessesLeft-1);$('guessesHud').textContent=String(onlineGuessesLeft);
  gameMessage((d.name||'El Descubridor')+' intenta adivinar: '+pendingOnlineGuess,'player');
  $('onlineGuessConfirmCharacter').textContent=pendingOnlineGuess;$('onlineGuessConfirmLead').textContent=(d.name||'Tu rival')+' dice que el personaje es…';$('onlineGuessConfirmModal').classList.remove('hidden');return;
 }
 if(d.type==='guess_result'&&myRole==='guess'){
  waitingForGuess=false;const correct=!!d.correct;gameMessage(correct?'El Cerebro confirmó que acertaste.':'El Cerebro confirmó que no era '+(d.character||'ese personaje')+'.','system');
  onlineGuessesLeft=Math.max(0,Number(d.guessesLeft));$('guessesHud').textContent=String(onlineGuessesLeft);
  if(correct){setDiscovererControlsDisabled(true);showResult(true,'Descubriste el personaje',d.secret||d.character);return;}
  if(onlineGuessesLeft<=0){setDiscovererControlsDisabled(true);showResult(false,'Agotaste tus dos intentos de adivinanza',d.secret||'Personaje secreto');return;}
  setDiscovererControlsDisabled(false);$('guessHint').textContent='Te quedan '+onlineGuessesLeft+' intentos.';status('No era ese personaje. Te quedan '+onlineGuessesLeft+' intentos.');return;
 }
 if(d.type==='result'){
  if(d.result==='surrender') {gameMessage((d.name||'Tu rival')+' se rindió.','system');showResult(true,d.role==='guess'?'El Descubridor se rindió':'El Cerebro se rindió',d.secret||secret);return;}
  if(d.result==='win'||d.result==='lose'){gameMessage((d.name||'Tu rival')+(d.result==='win'?' confirmó la victoria.':' confirmó la derrota.'),'system');showResult(d.result==='lose',d.result==='win'?'Tu rival confirmó la victoria':'Tu rival confirmó la derrota',d.secret||secret);}
 }
}
function showResult(win,title,character){clearInterval(onlineTimerId);onlineTimerId=null;$('onlineGuessConfirmModal')?.classList.add('hidden');const finalName=String(character||secret||'').trim();window.MindDuelResult={win,title,character:finalName,mode:'multiplayer'};window.MatchHistory?.record('SISTEMA',title||'Partida finalizada','result');window.MatchHistory?.finish(win?'Victoria':'Derrota',{personaje:finalName});$('resultTag').textContent='MODO ONLINE · '+(myRole==='guess'?'DESCUBRIDOR':'CEREBRO');$('resultTitle').textContent=win?'¡HAS GANADO!':'HAS PERDIDO';$('resultCharacter').textContent=finalName||'Personaje secreto';const known=findCharacter(finalName);let description='';try{description=(localStorage.getItem('mind_character_description_'+finalName)||'').trim()}catch{}if(!description&&known)description=String(known.descripcion||'').trim();$('resultDescription').textContent=description;$('editCharacterBtn').classList.toggle('hidden',!finalName);document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));$('resultScreen').classList.remove('hidden');$('gameMenuModal').classList.add('hidden');}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(onlineStartedAt){const sec=Math.max(0,Math.floor((Date.now()-onlineStartedAt)/1000));const timer=$('timer');if(timer)timer.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');saveOnlineProgress();if(conn&&conn.open)send({type:'progress',questionsSeen:onlineQuestionCount,answersSeen:onlineAnswerCount,startedAt:onlineStartedAt,guessesLeft:onlineGuessesLeft});}}else saveOnlineProgress();});
window.addEventListener('pagehide',saveOnlineProgress);
window.addEventListener('beforeunload',e=>{if(document.body.classList.contains('duel-online')&&onlineStartedAt&&!document.getElementById('resultScreen')?.classList.contains('hidden'))return; if(document.body.classList.contains('duel-online')&&onlineStartedAt){saveOnlineProgress();e.preventDefault();e.returnValue='La partida online está en curso. Si cerrás o recargás, la conexión con tu rival puede perderse.';return e.returnValue;}});
window.addEventListener('mindduel-surrender',()=>{send({type:'result',result:'surrender',role:myRole,name:saveName(),secret:secret});showResult(false,'Te rendiste antes de terminar la partida',secret);});window.addEventListener('mindduel-leave',()=>{try{conn&&conn.close();peer&&peer.destroy()}catch{};reset();document.body.classList.remove('duel-online','duel-brain','duel-guess');document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));$('stageScreen').classList.remove('hidden');});
function showReconnectOption(){connected=false;const st=$('duelStatus');if(!st)return;st.textContent='Se perdió la conexión de la partida. No cierres esta pantalla: podés intentar reconectar.';let b=$('reconnectDuelBtn');if(!b){b=document.createElement('button');b.id='reconnectDuelBtn';b.className='btn';b.textContent='REINTENTAR CONEXIÓN';b.style.margin='8px auto';st.insertAdjacentElement('afterend',b);b.addEventListener('click',()=>{if(!peer||!remotePeerId){status('No se puede reconectar automáticamente. Necesitás volver a usar el código de sala.');return;}try{reconnecting=true;status('Intentando recuperar la partida…');ready(peer.connect(remotePeerId,{reliable:true}));}catch(e){status('No se pudo reconectar. Compartí un nuevo código de sala.');}});}}
function ready(c){conn=c;conn.on('open',()=>{connected=true;reconnecting=false;const rb=$('reconnectDuelBtn');if(rb)rb.remove();$('duelConnected').classList.remove('hidden');$('createRoomBtn').classList.add('hidden');$('joinRoomBtn').classList.add('hidden');$('hostRoom').classList.toggle('hidden',!host);$('joinRoom').classList.add('hidden');$('peerStatus').textContent='CONEXIÓN ESTABLECIDA';status('Conectados desde redes distintas. Elegí tu papel.');send({type:'hello',name:saveName()});send({type:'state_sync',startedAt:onlineStartedAt,questionsSeen:onlineQuestionCount,answersSeen:onlineAnswerCount,guessesLeft:onlineGuessesLeft});addMessage('SISTEMA','Conexión establecida.','system');populateCharacters();});conn.on('data',onData);conn.on('close',()=>{$('peerStatus').textContent='RIVAL DESCONECTADO';showReconnectOption();});conn.on('error',e=>status('Problema de conexión: '+(e.type||'revisá el código.')));}
$('dueloBtn').textContent='DUELO ONLINE';on('dueloBtn','click',async()=>{if(typeof closeStageCurtain==='function'&&typeof openStageCurtain==='function'){document.getElementById('stageMenu')?.classList.add('hidden');await closeStageCurtain(900);await openStageCurtain(900);}reset();showModal();});
on('createRoomBtn','click',()=>{if(!window.Peer){status('No se pudo cargar la conexión online. Revisá internet y recargá.');return;}reset();host=true;saveName();status('Creando sala online…');peer=new Peer();peer.on('open',id=>{$('hostRoom').classList.remove('hidden');$('roomCode').textContent=id;$('createRoomBtn').classList.add('hidden');$('joinRoomBtn').classList.add('hidden');status('Sala creada. Compartí el código con tu amigo.');});peer.on('connection',c=>{remotePeerId=c.peer;if(conn&&conn.open){c.close();return;}ready(c);});peer.on('error',e=>status('No se pudo crear la sala ('+(e.type||'error')+').'));});
on('joinRoomBtn','click',()=>{$('joinRoom').classList.remove('hidden');$('roomInput').focus();status('Ingresá el código que te compartió tu amigo.');});
on('connectRoomBtn','click',()=>{if(!window.Peer){status('No se pudo cargar la conexión online.');return;}const id=$('roomInput').value.trim();remotePeerId=id;if(!id){status('Ingresá el código de sala.');return;}reset();$('joinRoom').classList.remove('hidden');saveName();status('Conectando…');peer=new Peer();peer.on('open',()=>ready(peer.connect(id,{reliable:true})));peer.on('error',e=>status('No se pudo conectar ('+(e.type||'error')+'). Verificá el código.'));});
on('copyRoomBtn','click',async()=>{try{await navigator.clipboard.writeText($('roomCode').textContent);status('Código copiado. Mandáselo a tu amigo.');}catch{status('Mantené presionado el código para copiarlo.');}});
on('roleBrainBtn','click',()=>{if(theirRole==='brain'){status('Tu amigo ya eligió ser el Cerebro.');return;}myRole='brain';send({type:'role',role:myRole});updateRoles();});
on('roleGuessBtn','click',()=>{if(theirRole==='guess'){status('Tu amigo ya eligió descubrir.');return;}myRole='guess';send({type:'role',role:myRole});updateRoles();});
function normalizeName(v){return String(v||'').trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function findCharacter(name){const people=(typeof PERSONAJES!=='undefined'?PERSONAJES:window.PERSONAJES)||[];return people.find(p=>normalizeName(p.nombre)===normalizeName(name)||((p.alias||[]).some(a=>normalizeName(a)===normalizeName(name))))||null;}
function setSecret(value){secret=String(value||'').trim();if(secret){const known=findCharacter(secret);$('brainSetupStatus').textContent=known?'Personaje de la lista seleccionado. Las sugerencias usarán sus datos.':'Personaje propio seleccionado. La memoria aprenderá de las respuestas que des.';$('startDuelBtn').disabled=false;}else{$('brainSetupStatus').textContent='Elegí un personaje o escribí uno propio.';$('startDuelBtn').disabled=true;}}
on('secretCharacter','change',()=>setSecret($('secretCharacter').value));on('secretCharacter','input',()=>setSecret($('secretCharacter').value));on('startDuelBtn','click',()=>{setSecret($('secretCharacter').value);if(!secret){$('brainSetupStatus').textContent='Elegí o escribí un personaje antes de entrar.';return;}rememberCustomCharacter(secret);const startedAt=Date.now();send({type:'secret_ready',ready:true,startedAt});enterGame(startedAt);});
function readTraining(){try{return JSON.parse(localStorage.getItem('mind_duel_human_training')||'[]')}catch{return []}}
function rememberCustomCharacter(name){try{const key='mind_duel_custom_characters';const list=JSON.parse(localStorage.getItem(key)||'[]');if(!findCharacter(name)&&!list.some(x=>normalizeName(x.nombre)===normalizeName(name)))list.push({nombre:name,creado:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(list.slice(-500)));}catch{}}
// Intercepta el formulario NATIVO del juego: en modo cerebro envía respuestas; en modo descubridor envía preguntas.
on('questionForm','submit',e=>{if(!document.body.classList.contains('duel-online'))return;e.preventDefault();e.stopImmediatePropagation();const input=$('questionInput'),text=input.value.trim();if(!connected||!myRole){status('La partida online no está conectada correctamente.');return;}if(!text)return;if(myRole==='guess'){if(waitingForAnswer||waitingForGuess)return;if(!send({type:'question',name:saveName(),text,count:incrementCount()})){status('No se pudo enviar la pregunta.');return;}input.value='';waitingForAnswer=true;setDiscovererControlsDisabled(true);gameMessage(text,'player');renderOnlineSequence(text);status('Pregunta enviada. Esperando respuesta del Cerebro…');return;}if(myRole==='brain'){if(!pendingQuestion){status('Esperá una pregunta del Descubridor.');return;}if($('sendBtn').disabled)return;if(!send({type:'answer',text,count:++onlineAnswerCount})){status('No se pudo enviar la respuesta.');return;}gameMessage(text,'mind');storeLearning(pendingQuestion,text);updateOnlineHud();pendingQuestion='';input.value='';setAnswerButtonsDisabled(true);if($('onlineQuestionBox'))$('onlineQuestionBox').textContent='Respuesta enviada: '+text;if($('onlineReadingStatus'))$('onlineReadingStatus').textContent='Esperando la próxima pregunta del Descubridor…';if($('brainSuggestionStatus'))$('brainSuggestionStatus').classList.add('hidden');status('Respuesta enviada. Esperando la próxima pregunta…');}},true);
on('classicPanel','click',e=>{if(!document.body.classList.contains('duel-online'))return;if(!connected||myRole!=='brain')return;const b=e.target.closest('[data-ans]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(!pendingQuestion){status('Esperá una pregunta del Descubridor.');return;}if(b.disabled)return;const text=labels[b.dataset.ans];if(!send({type:'answer',text,count:++onlineAnswerCount})){status('No se pudo enviar la respuesta.');return;}gameMessage(text,'mind');storeLearning(pendingQuestion,text);updateOnlineHud();pendingQuestion='';$('questionInput').value='';setAnswerButtonsDisabled(true);if($('onlineQuestionBox'))$('onlineQuestionBox').textContent='Respuesta enviada: '+text;if($('onlineReadingStatus'))$('onlineReadingStatus').textContent='Esperando la próxima pregunta del Descubridor…';if($('brainSuggestionStatus'))$('brainSuggestionStatus').classList.add('hidden');status('Respuesta enviada. Esperando la próxima pregunta…');},true);
function confirmOnlineGuess(correct){if(!pendingOnlineGuess)return;const guessed=pendingOnlineGuess;pendingOnlineGuess='';$('onlineGuessConfirmModal').classList.add('hidden');const left=onlineGuessesLeft;$('guessesHud').textContent=String(left);send({type:'guess_result',correct,character:guessed,secret:secret,guessesLeft:left,name:saveName()});if(correct){gameMessage('Confirmaste que el Descubridor acertó.','system');showResult(false,'Tu amigo descubrió el personaje',secret);}else if(left<=0){gameMessage('El Descubridor agotó sus dos intentos.','system');showResult(true,'Tu amigo agotó sus dos intentos',secret);}else{gameMessage('Confirmaste que no era ese personaje. Queda(n) '+left+' intento(s).','system');status('Intento incorrecto confirmado.');}}
on('onlineGuessConfirmYes','click',()=>confirmOnlineGuess(true));on('onlineGuessConfirmNo','click',()=>confirmOnlineGuess(false));
on('guessBtn','click',e=>{if(!document.body.classList.contains('duel-online'))return;e.preventDefault();e.stopImmediatePropagation();if(myRole!=='guess'||waitingForAnswer||waitingForGuess||onlineGuessesLeft<=0)return;const announcement=randomDiscovererGuessLine();if(!send({type:'guess_announce',text:announcement,name:saveName()})){status('No se pudo anunciar el intento.');return;}gameMessage(announcement,'player');$('guessHint').textContent='Te quedan '+onlineGuessesLeft+' intentos. Escribí el nombre del personaje.';$('guessInput').value='';$('guessModal').classList.remove('hidden');$('guessInput').focus();},true);
on('confirmGuessBtn','click',e=>{if(!document.body.classList.contains('duel-online'))return;e.preventDefault();e.stopImmediatePropagation();if(!connected||myRole!=='guess'||waitingForAnswer||waitingForGuess)return;const character=$('guessInput').value.trim();if(!character)return;submitGuess(character);$('guessInput').value='';$('guessModal').classList.add('hidden');},true);
on('guessInput','keydown',e=>{if(!document.body.classList.contains('duel-online')||e.key!=='Enter')return;e.preventDefault();e.stopImmediatePropagation();if(!connected||myRole!=='guess'||waitingForAnswer||waitingForGuess)return;const character=$('guessInput').value.trim();if(!character)return;submitGuess(character);$('guessInput').value='';$('guessModal').classList.add('hidden');},true);
function submitGuess(character){if(!connected||myRole!=='guess'||waitingForGuess||onlineGuessesLeft<=0)return;if(!send({type:'guess',character,name:saveName()})){status('No se pudo enviar el intento.');return;}onlineGuessesLeft--; $('guessesHud').textContent=String(onlineGuessesLeft);waitingForGuess=true;setDiscovererControlsDisabled(true);gameMessage('Intentaste adivinar: '+character,'player');status('Intento enviado. Esperando la confirmación del Cerebro…');}
function incrementCount(){onlineQuestionCount++;updateOnlineHud();send({type:'progress',questionsSeen:onlineQuestionCount,answersSeen:onlineAnswerCount,startedAt:onlineStartedAt,guessesLeft:onlineGuessesLeft});return onlineQuestionCount;}
function storeLearning(question,answer){try{rememberCustomCharacter(secret);const key='mind_duel_human_training';const rows=readTraining();rows.push({character:secret,question,answer,at:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(rows.slice(-500)));}catch{}}
function sendChat(input){const text=input.value.trim();if(!text)return;if(!conn||!conn.open){status('Todavía no hay conexión.');return;}const n=saveName();addMessage(n,text,'local');window.MatchHistory?.record(n,text,'chat');send({type:'chat',name:n,text});input.value='';$('chatUnread').classList.add('hidden');}
on('floatingChatForm','submit',e=>{e.preventDefault();sendChat($('floatingChatInput'));});// El chat del duelo se abre desde la burbuja flotante; no existe un formulario de chat fijo en el HTML.
const chatButton=$('chatBubbleBtn');if(chatButton)chatButton.innerHTML='☎<span id="chatUnread" class="chat-unread hidden">•</span>';
on('chatBubbleBtn','click',()=>{$('floatingChat').classList.toggle('hidden');$('chatUnread').classList.add('hidden');if(!$('floatingChat').classList.contains('hidden'))$('floatingChatInput').focus();});on('floatingChatClose','click',()=>$('floatingChat').classList.add('hidden'));
// Botón flotante arrastrable: moverlo no abre/cierra el chat por accidente.
(function makeChatBubbleDraggable(){const b=$('chatBubbleBtn');if(!b)return;let sx=0,sy=0,ox=0,oy=0,moved=false,dragging=false;const down=e=>{if(e.button!==undefined&&e.button!==0)return;dragging=true;moved=false;const r=b.getBoundingClientRect();sx=e.clientX;sy=e.clientY;ox=r.left;oy=r.top;b.style.right='auto';b.style.bottom='auto';b.style.left=ox+'px';b.style.top=oy+'px';try{b.setPointerCapture(e.pointerId)}catch{};};const move=e=>{if(!dragging)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>6)moved=true;const x=Math.max(4,Math.min(window.innerWidth-b.offsetWidth-4,ox+dx));const y=Math.max(4,Math.min(window.innerHeight-b.offsetHeight-4,oy+dy));b.style.left=x+'px';b.style.top=y+'px';};const up=e=>{if(!dragging)return;dragging=false;if(moved){e.preventDefault();b.dataset.dragged='1';setTimeout(()=>delete b.dataset.dragged,250);}try{b.releasePointerCapture(e.pointerId)}catch{}};b.addEventListener('pointerdown',down);b.addEventListener('pointermove',move);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('click',e=>{if(b.dataset.dragged==='1'){e.preventDefault();e.stopImmediatePropagation();}},true);})();
on('duelWinBtn','click',()=>{send({type:'result',result:'win',name:saveName()});showResult(true,'Confirmaste la victoria',secret);});
on('duelLoseBtn','click',()=>{send({type:'result',result:'lose',name:saveName()});showResult(false,'Confirmaste la derrota',secret);});
on('closeDuelBtn','click',()=>{modal.classList.add('hidden');reset();document.body.classList.remove('duel-online','duel-brain','duel-guess');});if(modal)modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.add('hidden');reset();}});
})();
