(() => {
'use strict';
const $=id=>document.getElementById(id);
const on=(id,event,handler,options=false)=>{const el=$(id);if(el)el.addEventListener(event,handler,options);};
const setText=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
const setClass=(id,cls,add)=>{const el=$(id);if(el)el.classList[add?'add':'remove'](cls);};
const modal=$('duelModal'); let peer=null,conn=null,host=false,connected=false,myRole='',theirRole='',secret='',pendingQuestion='',waitingForAnswer=false,waitingForGuess=false,onlineStartedAt=0,onlineTimerId=null,onlineQuestionCount=0,onlineAnswerCount=0,onlineGuessesLeft=2,pendingOnlineGuess='',remotePeerId='',localPeerId='',remotePlayerPeerId='',reconnecting=false;
const ONLINE_SAVE_KEY='mindduel_online_progress_v1';
const ONLINE_SESSION_KEY='mindduel_online_session_v1';
let localTranscript=[],phoneTranscript=[],phoneUnreadCount=0,lastOnlineQuestion='',lastOnlineAnswer='',lastGuessResolution=null,restoreSnapshot=null,restoreMatchId='',offlineRecovery=false,clockElapsedBase=0,clockRunStartedAt=0,clockPaused=true;
function readSavedSession(){try{const x=JSON.parse(localStorage.getItem(ONLINE_SESSION_KEY)||'null');return x&&typeof x==='object'?x:null;}catch{return null;}}
function refreshRestoreButton(){const b=$('restoreSavedDuelBtn');if(!b)return;b.classList.toggle('hidden',!!connected);}
function updatePhoneUnreadBadge(){const badge=$('chatUnread');if(!badge)return;badge.textContent=phoneUnreadCount>99?'99+':String(phoneUnreadCount);badge.classList.toggle('hidden',phoneUnreadCount<=0);}
function recoverPhoneTranscript(saved){if(Array.isArray(saved?.phoneTranscript)&&saved.phoneTranscript.length)return saved.phoneTranscript.slice(-300);const id=String(saved?.matchId||restoreMatchId||'');const match=(window.MatchHistory?.list?.()||[]).find(m=>String(m.id)===id);return (match?.events||[]).filter(ev=>ev&&ev.kind==='chat').slice(-300).map(ev=>({name:String(ev.speaker||'RIVAL'),text:String(ev.text||''),kind:'remote',at:Date.parse(ev.at)||Date.now()}));}
function recoverGameTranscript(saved){if(Array.isArray(saved?.transcript)&&saved.transcript.length)return saved.transcript.slice(-500);const id=String(saved?.matchId||restoreMatchId||'');const match=(window.MatchHistory?.list?.()||[]).find(m=>String(m.id)===id);return (match?.events||[]).filter(ev=>ev&&ev.kind!=='chat').slice(-500).map(ev=>{const speaker=String(ev.speaker||'').toUpperCase();const kind=speaker.includes('CEREBRO')||speaker==='MIND'?'mind':(speaker.includes('JUGADOR')||speaker==='TÚ'||speaker==='TU'||speaker==='RIVAL')?'player':'system';return {text:String(ev.text||''),kind};});}
function retryRestoreSavedSession(){const saved=readSavedSession();if(!saved||!saved.roomId){status('No hay ninguna partida guardada para recuperar.');refreshRestoreButton();return;}try{if(conn)conn.close();}catch{}try{if(peer)peer.destroy();}catch{}conn=null;peer=null;connected=false;reconnecting=true;status('Intentando recuperar la partida guardada…');restoreSavedSession();refreshRestoreButton();}
window.addEventListener('mind:restore-saved-online',e=>{const chosen=e.detail?.snapshot;if(!chosen||!chosen.myRole){showModal();status('Esta partida no tiene un guardado automático suficiente en este dispositivo.');return;}restoreMatchId=String(e.detail?.matchId||'');try{localStorage.setItem(ONLINE_SESSION_KEY,JSON.stringify(chosen));}catch{}restoreSnapshotOffline(chosen);});
function restoreSnapshotOffline(saved){
 restoreSnapshot=saved;host=!!saved.host;connected=false;clockElapsedBase=getSavedElapsedSeconds(saved);clockRunStartedAt=0;clockPaused=true;myRole=String(saved.myRole||'');theirRole=String(saved.theirRole||'');secret=myRole==='brain'?String(saved.secret||''):'';onlineStartedAt=Number(saved.startedAt)||Date.now();onlineQuestionCount=Number(saved.questionCount)||0;onlineAnswerCount=Number(saved.answerCount)||0;onlineGuessesLeft=Math.max(0,Math.min(2,Number(saved.guessesLeft??2)));pendingQuestion=String(saved.pendingQuestion||'');waitingForAnswer=!!saved.waitingForAnswer;waitingForGuess=!!saved.waitingForGuess;pendingOnlineGuess=String(saved.pendingOnlineGuess||'');lastGuessResolution=saved.lastGuessResolution||null;lastOnlineQuestion=String(saved.lastQuestion||'');lastOnlineAnswer=String(saved.lastAnswer||'');localTranscript=recoverGameTranscript(saved);phoneTranscript=recoverPhoneTranscript(saved);phoneUnreadCount=Math.max(0,Number(saved.phoneUnreadCount)||(phoneTranscript.length?phoneTranscript.length:0));remotePeerId=host?'':String(saved.roomId||'');localPeerId=String(saved.localPeerId||'');remotePlayerPeerId=String(saved.remotePlayerPeerId||'');
 if($('roomCode'))$('roomCode').textContent=String(saved.roomId||'');offlineRecovery=true;showModal();enterGame(onlineStartedAt,true);showOfflineRecoveryBar();status('Partida recuperada en este dispositivo. Todavía no hay conexión con tu rival.');persistSession();
}
function showOfflineRecoveryBar(){
 let bar=$('offlineRecoveryBar');
 if(!bar){
  bar=document.createElement('section');bar.id='offlineRecoveryBar';bar.className='offline-recovery-strip';
  if(restoreSnapshot?.reconstructedFromHistory){bar.innerHTML='<span id="offlineRecoveryText">HISTORIAL RECUPERADO · RELOJ PAUSADO · No hay estado suficiente para reabrir esta sala.</span>';}
  else{bar.innerHTML='<span id="offlineRecoveryText">PARTIDA RECUPERADA · RELOJ PAUSADO</span><div class="offline-recovery-actions"><button id="reopenSavedRoomBtn" type="button">↻ Reconectar</button><button id="copySavedRoomCodeBtn" type="button">Copiar código</button></div>';}
  const chat=$('chat');if(chat)chat.insertAdjacentElement('beforebegin',bar);else{const target=document.querySelector('#gameScreen .mind-console');if(target)target.append(bar);else document.body.append(bar);}
  if($('reopenSavedRoomBtn'))$('reopenSavedRoomBtn').addEventListener('click',reopenSavedRoom);if($('copySavedRoomCodeBtn'))$('copySavedRoomCodeBtn').addEventListener('click',copyRecoveryCode);
 }
 bar.classList.remove('hidden');
}
async function copyRecoveryCode(){const code=String($('roomCode')?.textContent||readSavedSession()?.roomId||'').trim();if(!code){setText('offlineRecoveryText','Primero reabrí la sala para generar un código.');return;}try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(code);else throw new Error('clipboard unavailable');setText('offlineRecoveryText','Código copiado: '+code+' · compartilo con tu rival.');}catch{const ta=document.createElement('textarea');ta.value=code;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();let ok=false;try{ok=document.execCommand('copy');}catch{}ta.remove();setText('offlineRecoveryText',ok?'Código copiado: '+code+' · compartilo con tu rival.':'Código de sala: '+code+' · mantené presionado el código para copiarlo.');}}

function reopenSavedRoom(){
 const saved=readSavedSession()||restoreSnapshot;
 if(restoreSnapshot?.reconstructedFromHistory||saved?.reconstructedFromHistory){setText('offlineRecoveryText','Este registro solo conserva el historial; no tiene el estado necesario para reabrir la partida original.');return;}
 if(!saved||!saved.myRole||!saved.roomId){status('No hay una sesión completa para reabrir.');return;}
 if(!window.Peer){showModal();status('No se pudo cargar PeerJS. Revisá internet e intentá de nuevo.');return;}
 if(saved.host&&peer&&peer.open&&!peer.destroyed&&!peer.disconnected){host=true;connected=false;remotePeerId='';pauseOnlineClock();setText('offlineRecoveryText','La sala original sigue abierta · código: '+String(saved.roomId)+' · pasáselo al rival para que entre a esta misma partida.');status('La sala original sigue activa. No se creó una sala nueva.');copyRecoveryCode();return;}
 try{if(conn)conn.close();}catch{}try{if(peer)peer.destroy();}catch{}
 conn=null;peer=null;connected=false;offlineRecovery=true;pauseOnlineClock();
 const roomId=String(saved.roomId);host=true;remotePeerId='';remotePlayerPeerId='';
 localPeerId=roomId;
 if($('roomCode'))$('roomCode').textContent=roomId;
 $('createRoomBtn')?.classList.add('hidden');$('joinRoomBtn')?.classList.add('hidden');$('hostRoom')?.classList.toggle('hidden',!host);$('joinRoom')?.classList.toggle('hidden',host);$('newRoomCodeBtn')?.classList.add('hidden');$('shareRoomBtn')?.classList.toggle('hidden',!host);
 if(!host&&$('roomInput'))$('roomInput').value=roomId;
 setText('offlineRecoveryText',host?'Reabriendo la sala original…':'Reconectando con el código de la sala original…');
 try{localStorage.setItem(ONLINE_SESSION_KEY,JSON.stringify({...saved,host:true,roomId,localPeerId,remotePlayerPeerId:'',savedAt:Date.now()}));}catch{}
 try{
  peer=new Peer(localPeerId);
  peer.on('open',id=>{
   localPeerId=id;
   if(host){setText('offlineRecoveryText','Sala original abierta · código: '+roomId+' · pasáselo al rival.');status('Sala original recuperada. Esperando que tu rival se reconecte…');persistSession();copyRecoveryCode();}
   else{status('Buscando la sala original…');persistSession();ready(peer.connect(roomId,{reliable:true}));}
  });
  if(host)peer.on('connection',c=>{if(conn&&conn.open){c.close();return;}remotePlayerPeerId=c.peer;remotePeerId=c.peer;ready(c);});
  peer.on('error',e=>{
   if(e.type==='unavailable-id'&&host){
    try{peer?.destroy();}catch{}peer=null;host=false;remotePeerId=roomId;remotePlayerPeerId='';
    localPeerId='mdf-'+Array.from(crypto.getRandomValues(new Uint8Array(12))).map(x=>x.toString(16).padStart(2,'0')).join('');
    try{localStorage.setItem(ONLINE_SESSION_KEY,JSON.stringify({...saved,host:false,roomId,localPeerId,remotePlayerPeerId:'',savedAt:Date.now()}));}catch{}
    setText('offlineRecoveryText','La sala original ya está abierta. Entrando como jugador a esa misma sala…');
    try{peer=new Peer(localPeerId);peer.on('open',()=>{persistSession();ready(peer.connect(roomId,{reliable:true}));});peer.on('error',err=>{const msg='No se pudo conectar a la sala original ('+(err.type||'error')+'). No se creó otra partida; reintentá con el mismo código.';setText('offlineRecoveryText',msg);status(msg);});}catch(err){status('No se pudo conectar a la sala original. Reintentá con el mismo código.');}
    return;
   }
   const msg='No se pudo recuperar la sala original ('+(e.type||'error')+'). No se creó otra partida. Esperá unos segundos y reintentá con el mismo código.';setText('offlineRecoveryText',msg);status(msg);
  });
 }catch(e){status('No se pudo iniciar la reconexión a la sala original. No se creó una partida nueva.');}
}

function persistSession(){
 if(restoreSnapshot?.reconstructedFromHistory&&offlineRecovery)return;
 if(!host&&!remotePeerId&&!myRole&&!onlineStartedAt)return;
 const snapshot={version:5,elapsedSeconds:Math.floor(getOnlineElapsedSeconds()),clockPaused,playerName:localStorage.getItem('mindduel_player_name')||'Jugador',host,roomId:host?String($('roomCode')?.textContent||'').trim():remotePeerId,localPeerId,remotePlayerPeerId:host?remotePeerId:remotePlayerPeerId,myRole,theirRole,secret:myRole==='brain'?secret:'',startedAt:onlineStartedAt,questionCount:onlineQuestionCount,answerCount:onlineAnswerCount,guessesLeft:onlineGuessesLeft,pendingQuestion,waitingForAnswer,waitingForGuess,pendingOnlineGuess,lastQuestion:lastOnlineQuestion,lastAnswer:lastOnlineAnswer,transcript:localTranscript.slice(-500),phoneTranscript:phoneTranscript.slice(-300),phoneUnreadCount,lastGuessResolution,libraryId:restoreSnapshot?.libraryId||'',status:'in_progress',questionBox:$('onlineQuestionBox')?.textContent||'',readingStatus:$('onlineReadingStatus')?.textContent||'',savedAt:Date.now(),inGame:document.body.classList.contains('duel-online'),matchId:restoreMatchId||window.MatchHistory?.getCurrent?.()?.id||''};
 try{localStorage.setItem(ONLINE_SESSION_KEY,JSON.stringify(snapshot));}catch{}
 try{window.MatchHistory?.setOnlineSession(snapshot);if(restoreMatchId)window.MatchHistory?.attachSnapshot?.(restoreMatchId,snapshot);const savedItem=window.SavedMatches?.save(snapshot,restoreMatchId||window.MatchHistory?.getCurrent?.()?.id||'');if(savedItem&&savedItem.id!==snapshot.libraryId){snapshot.libraryId=savedItem.id;restoreSnapshot={...(restoreSnapshot||{}),libraryId:savedItem.id};try{localStorage.setItem(ONLINE_SESSION_KEY,JSON.stringify(snapshot));}catch{}}}catch{}
 refreshRestoreButton();
}
function getSavedElapsedSeconds(saved){if(Number.isFinite(Number(saved?.elapsedSeconds))&&Number(saved?.elapsedSeconds)>0)return Math.max(0,Number(saved.elapsedSeconds));if(!saved?.reconstructedFromHistory&&Number(saved?.savedAt)>0&&Number(saved?.startedAt)>0)return Math.max(0,(Number(saved.savedAt)-Number(saved.startedAt))/1000);return 0;}
function getOnlineElapsedSeconds(){return Math.max(0,clockElapsedBase+(clockPaused?0:(Date.now()-clockRunStartedAt)/1000));}
function pauseOnlineClock(){if(!clockPaused){clockElapsedBase=getOnlineElapsedSeconds();clockPaused=true;clockRunStartedAt=0;}if(onlineTimerId){clearInterval(onlineTimerId);onlineTimerId=null;}updateOnlineClockDisplay();}
function resumeOnlineClock(){if(clockPaused){clockPaused=false;clockRunStartedAt=Date.now();}if(!onlineTimerId)onlineTimerId=setInterval(()=>{updateOnlineClockDisplay();saveOnlineProgress();},1000);updateOnlineClockDisplay();}
function updateOnlineClockDisplay(){const el=$('timer');if(!el)return;const sec=Math.floor(getOnlineElapsedSeconds());el.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
function saveOnlineProgress(){if(!document.body.classList.contains('duel-online')&&!host&&!remotePeerId)return;try{localStorage.setItem(ONLINE_SAVE_KEY,JSON.stringify({startedAt:onlineStartedAt,role:myRole,questionCount:onlineQuestionCount,answerCount:onlineAnswerCount,guessesLeft:onlineGuessesLeft,secret:myRole==='brain'?secret:'',savedAt:Date.now(),events:window.MatchHistory?.getCurrent()?.events||[]}));}catch{}persistSession();}
function restoreTranscript(){if(!nativeChat)return;nativeChat.innerHTML='';for(const ev of localTranscript){const row=document.createElement('div');row.className='message message-'+(ev.kind==='player'?'player':ev.kind==='mind'?'mind':'system');const avatar=document.createElement('div');avatar.className='avatar '+(ev.kind==='mind'?'avatar-mind':ev.kind==='player'?'avatar-player':'avatar-system');const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=ev.text;row.append(avatar,bubble);nativeChat.append(row);}nativeChat.scrollTop=nativeChat.scrollHeight;}
function restorePhoneTranscript(){for(const id of ['duelMessages','floatingMessages']){const box=$(id);if(box)box.innerHTML='';}for(const ev of phoneTranscript)addMessage(ev.name,ev.text,ev.kind,true);updatePhoneUnreadBadge();}
function mergeRows(localRows,incomingRows,phone=false){const local=Array.isArray(localRows)?localRows.slice():[];const incoming=Array.isArray(incomingRows)?incomingRows:[];const key=x=>JSON.stringify(phone?[String(x?.name||''),String(x?.text||'')]:[String(x?.kind||''),String(x?.text||'')]);const counts=new Map();for(const x of local)counts.set(key(x),(counts.get(key(x))||0)+1);const seen=new Map();for(const x of incoming){const k=key(x),n=(seen.get(k)||0)+1;seen.set(k,n);if(n>(counts.get(k)||0))local.push(x);}if(phone)local.sort((a,b)=>(Number(a?.at)||0)-(Number(b?.at)||0));return local.slice(phone?-300:-500); }
function restoreSavedSession(){
 const saved=readSavedSession();if(!saved||!saved.roomId)return;restoreSnapshot=saved;
 host=!!saved.host;clockElapsedBase=getSavedElapsedSeconds(saved);clockRunStartedAt=0;clockPaused=true;remotePeerId=host?'':String(saved.roomId);localPeerId=String(saved.localPeerId|| (host?saved.roomId:''));remotePlayerPeerId=String(saved.remotePlayerPeerId||'');myRole=saved.myRole||'';theirRole=saved.theirRole||'';secret=myRole==='brain'?String(saved.secret||''):'';onlineStartedAt=Number(saved.startedAt)||0;onlineQuestionCount=Number(saved.questionCount)||0;onlineAnswerCount=Number(saved.answerCount)||0;onlineGuessesLeft=Math.max(0,Math.min(2,Number(saved.guessesLeft??2)));pendingQuestion=String(saved.pendingQuestion||'');waitingForAnswer=!!saved.waitingForAnswer;waitingForGuess=!!saved.waitingForGuess;pendingOnlineGuess=String(saved.pendingOnlineGuess||'');lastGuessResolution=saved.lastGuessResolution||null;lastOnlineQuestion=String(saved.lastQuestion||'');lastOnlineAnswer=String(saved.lastAnswer||'');localTranscript=recoverGameTranscript(saved);phoneTranscript=recoverPhoneTranscript(saved);phoneUnreadCount=Math.max(0,Number(saved.phoneUnreadCount)||(phoneTranscript.length?phoneTranscript.length:0));
 showModal();$('createRoomBtn').classList.add('hidden');$('joinRoomBtn').classList.add('hidden');$('hostRoom').classList.toggle('hidden',!host);$('joinRoom').classList.toggle('hidden',host);if(host){$('roomCode').textContent=String(saved.roomId||'');$('newRoomCodeBtn').classList.remove('hidden');$('shareRoomBtn').classList.remove('hidden');}else{$('roomInput').value=remotePeerId;}
 status('Encontré una partida guardada. Intentando recuperar la sala y el estado…');
 if(!window.Peer){status('No se pudo cargar PeerJS. Revisá internet y recargá para recuperar la partida.');return;}
 try{
  if(host){const stableRoomId=String(saved.roomId);localPeerId=stableRoomId;peer=new Peer(stableRoomId);peer.on('open',id=>{localPeerId=id;$('roomCode').textContent=id;status('Sala recuperada. Esperando que tu rival se reconecte…');persistSession();});peer.on('connection',c=>{if(conn&&conn.open){if(c.peer===remotePlayerPeerId){try{conn.close();}catch{}}else{c.close();return;}}remotePlayerPeerId=c.peer;remotePeerId=c.peer;ready(c);});peer.on('error',e=>{
   if(e.type==='unavailable-id'){
    try{peer?.destroy();}catch{}peer=null;host=false;remotePeerId=stableRoomId;remotePlayerPeerId='';localPeerId='mdf-'+Array.from(crypto.getRandomValues(new Uint8Array(12))).map(x=>x.toString(16).padStart(2,'0')).join('');
    try{localStorage.setItem(ONLINE_SESSION_KEY,JSON.stringify({...saved,host:false,roomId:stableRoomId,localPeerId,remotePlayerPeerId:'',savedAt:Date.now()}));}catch{}
    status('El código original ya está ocupado por la sala recuperada. Entrando a esa misma sala sin cambiar tu rol…');
    try{peer=new Peer(localPeerId);peer.on('open',()=>{persistSession();ready(peer.connect(stableRoomId,{reliable:true}));});peer.on('error',err=>status('No se pudo conectar a la sala original ('+(err.type||'error')+'). Reintentá con el mismo código.'));}catch(err){status('No se pudo conectar a la sala original. Reintentá con el mismo código.');}
    return;
   }
   status('No se pudo recuperar la sala todavía ('+(e.type||'error')+'). Esperá unos segundos y recargá para volver a intentar.');
  });}
  else{localPeerId=String(saved.localPeerId||('mdf-'+Array.from(crypto.getRandomValues(new Uint8Array(12))).map(x=>x.toString(16).padStart(2,'0')).join('')));peer=new Peer(localPeerId);peer.on('open',()=>{status('Reconectando con el anfitrión…');persistSession();ready(peer.connect(remotePeerId,{reliable:true}));});peer.on('error',e=>status('No se pudo reconectar ('+(e.type||'error')+'). Pedile al anfitrión que abra de nuevo su partida.'));}
 }catch(e){status('No se pudo iniciar la recuperación. Probá recargar en unos segundos.');}
}

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
function reset(){
 try{localStorage.removeItem(ONLINE_SESSION_KEY);localStorage.removeItem(ONLINE_SAVE_KEY);}catch{}
 clearInterval(onlineTimerId);onlineTimerId=null;
 try{conn&&conn.close()}catch{}try{peer&&peer.destroy()}catch{}
 conn=null;peer=null;connected=false;host=false;myRole='';theirRole='';secret='';pendingQuestion='';waitingForAnswer=false;waitingForGuess=false;
 onlineStartedAt=0;clockElapsedBase=0;clockRunStartedAt=0;clockPaused=true;onlineQuestionCount=0;onlineAnswerCount=0;onlineGuessesLeft=2;pendingOnlineGuess='';lastGuessResolution=null;remotePeerId='';localPeerId='';remotePlayerPeerId='';reconnecting=false;offlineRecovery=false;restoreSnapshot=null;restoreMatchId='';lastOnlineQuestion='';lastOnlineAnswer='';localTranscript=[];phoneTranscript=[];phoneUnreadCount=0;
 document.body.classList.remove('duel-online','duel-brain','duel-guess');
 ['hostRoom','joinRoom','duelConnected','brainRolePanel','guessRolePanel','offlineRecoveryBar','onlineGuessConfirmModal','guessModal'].forEach(id=>$(id)?.classList.add('hidden'));$('reconnectDuelBtn')?.remove();
 if($('newRoomCodeBtn'))$('newRoomCodeBtn').classList.remove('hidden');if($('shareRoomBtn'))$('shareRoomBtn').classList.remove('hidden');$('createRoomBtn')?.classList.remove('hidden');$('joinRoomBtn')?.classList.remove('hidden');
 if($('duelMessages'))$('duelMessages').innerHTML='';if($('floatingMessages'))$('floatingMessages').innerHTML='';$('roleChooser')?.classList.remove('hidden');$('chatBubbleBtn')?.classList.add('hidden');$('floatingChat')?.classList.add('hidden');updatePhoneUnreadBadge();
 $('brainInlinePanel')?.classList.add('hidden');$('classicPanel')?.classList.add('hidden');$('onlineSecretLabel')?.classList.add('hidden');$('questionForm')?.classList.remove('hidden');document.querySelectorAll('#classicPanel [data-ans]').forEach(b=>b.disabled=false);if($('questionInput'))$('questionInput').disabled=false;if($('sendBtn'))$('sendBtn').disabled=false;if($('guessBtn'))$('guessBtn').disabled=false;
 refreshRestoreButton();status('Elegí crear una sala o unirte a una.');
}
window.MindDuelCleanupForMode=function(){
 if(document.body.classList.contains('duel-online')||onlineStartedAt){try{persistSession()}catch{}reset();}
 else{document.body.classList.remove('duel-online','duel-brain','duel-guess');$('offlineRecoveryBar')?.classList.add('hidden');$('reconnectDuelBtn')?.remove();$('chatBubbleBtn')?.classList.add('hidden');$('floatingChat')?.classList.add('hidden');$('brainInlinePanel')?.classList.add('hidden');$('onlineSecretLabel')?.classList.add('hidden');}
 modal?.classList.add('hidden');
};
function addMessage(name,msg,kind='',replaying=false){for(const target of ['duelMessages','floatingMessages']){const box=$(target);if(!box)continue;const row=document.createElement('div');row.className='duel-message '+kind;const who=document.createElement('b');who.textContent=name+' · ';const body=document.createElement('span');body.textContent=msg;row.append(who,body);box.append(row);box.scrollTop=box.scrollHeight;}if(!replaying){phoneTranscript.push({name:String(name||''),text:String(msg||''),kind:String(kind||''),at:Date.now()});if(phoneTranscript.length>300)phoneTranscript.shift();persistSession();}}
function gameMessage(text,kind='system'){window.MatchHistory?.record(kind==='player'?'JUGADOR':kind==='mind'?'CEREBRO':'SISTEMA',text,kind);localTranscript.push({text:String(text||''),kind});if(localTranscript.length>500)localTranscript.shift();if(!nativeChat)return;const row=document.createElement('div');row.className='message message-'+(kind==='player'?'player':kind==='mind'?'mind':'system');const avatar=document.createElement('div');avatar.className='avatar '+(kind==='mind'?'avatar-mind':kind==='player'?'avatar-player':'avatar-system');const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=text;row.append(avatar,bubble);nativeChat.append(row);nativeChat.scrollTop=nativeChat.scrollHeight;persistSession();}
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
function enterGame(startAt,restoring=false){
 clearInterval(onlineTimerId);onlineStartedAt=Number(startAt)||Date.now();if(!restoring){onlineQuestionCount=0;onlineAnswerCount=0;onlineGuessesLeft=2;}
 window.MindDuelMode='multiplayer';window.setMindDuelMode&&window.setMindDuelMode('multiplayer');
 modal.classList.add('hidden');
 document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
 $('gameScreen').classList.remove('hidden');$('chatBubbleBtn').classList.remove('hidden');
 const secretLabel=$('onlineSecretLabel');if(secretLabel){const showSecret=myRole==='brain'&&!!String(secret||'').trim();secretLabel.textContent=showSecret?'PERSONAJE ELEGIDO: '+String(secret).trim():'';secretLabel.classList.toggle('hidden',!showSecret);}
 document.body.classList.add('duel-online');document.body.classList.toggle('duel-brain',myRole==='brain');document.body.classList.toggle('duel-guess',myRole==='guess');document.body.classList.remove('classic','name-phase');
 $('classicEnd').classList.add('hidden');$('brainInlinePanel').classList.remove('hidden');$('classicPanel').classList.toggle('hidden',myRole!=='brain');
 $('suggestBtn').classList.add('hidden');$('guessBtn').classList.toggle('hidden',myRole==='brain');
 $('questionForm').classList.remove('hidden');
 $('questionInput').disabled=myRole==='brain';$('sendBtn').disabled=myRole==='brain';
 if(!restoring){setAnswerButtonsDisabled(true);waitingForAnswer=false;waitingForGuess=false;pendingQuestion='';}else{setAnswerButtonsDisabled(!(myRole==='brain'&&pendingQuestion));setDiscovererControlsDisabled(waitingForAnswer||waitingForGuess);}
 if(!restoring){nativeChat.innerHTML='';localTranscript=[];window.MatchHistory?.begin('online', {rol:myRole});}else{restoreTranscript();restorePhoneTranscript();} $('questionsHud').textContent=String(myRole==='brain'?onlineAnswerCount:onlineQuestionCount)+'/20';$('guessesHud').textContent=String(onlineGuessesLeft);if($('modeHud'))$('modeHud').textContent='ONLINE';if($('questionCountLabel'))$('questionCountLabel').textContent=myRole==='brain'?'RESP.':'PREG.';updateOnlineHud();saveOnlineProgress();
 if(!restoring){clockElapsedBase=0;clockRunStartedAt=0;clockPaused=true;}else{clockElapsedBase=restoreSnapshot?getSavedElapsedSeconds(restoreSnapshot):clockElapsedBase;clockRunStartedAt=0;clockPaused=true;}updateOnlineClockDisplay();if(connected&&!offlineRecovery)resumeOnlineClock();else pauseOnlineClock();send({type:'progress',count:onlineQuestionCount,startedAt:onlineStartedAt});
 $('questionInput').placeholder=myRole==='brain'?'Escribí una respuesta…':'Escribí tu pregunta…';$('sendBtn').textContent=myRole==='brain'?'Responder':'Enviar';
 if($('brainSuggestionStatus')){ $('brainSuggestionStatus').textContent=''; $('brainSuggestionStatus').classList.add('hidden');}
 if($('onlineQuestionBox'))$('onlineQuestionBox').textContent=myRole==='brain'?'Esperando la pregunta del Descubridor…':'Esperando enviar tu primera pregunta…';
 if($('onlineReadingStatus'))$('onlineReadingStatus').textContent=myRole==='brain'?'Esperando la pregunta del Descubridor…':'Cuando envíes una pregunta, aquí verás el estado de la respuesta.';
 const seqTitle=document.querySelector('.sequence-heading');if(seqTitle)seqTitle.lastChild.textContent=myRole==='brain'?' SECUENCIA DEL CEREBRO':' SECUENCIA DEL DESCUBRIDOR';
 const title=document.querySelector('.console-title span:last-child');if(title)title.textContent=myRole==='brain'?'RESPONDE AL DESCUBRIDOR':'DESCUBRÍ EL PERSONAJE';
 if(!restoring){if(myRole==='brain')gameMessage('Personaje elegido. Esperá la pregunta del Descubridor.','system');else gameMessage('Tu amigo eligió un personaje. Hacé preguntas y usá ADIVINAR cuando creas saber quién es.','mind');}
 if(restoring){if($('onlineQuestionBox'))$('onlineQuestionBox').textContent=restoreSnapshot?.questionBox|| (myRole==='brain'?'Esperando la pregunta del Descubridor…':'Partida recuperada. Podés continuar.');if($('onlineReadingStatus'))$('onlineReadingStatus').textContent=restoreSnapshot?.readingStatus||'';if(myRole==='brain'&&pendingQuestion){setAnswerButtonsDisabled(false);if($('onlineQuestionBox'))$('onlineQuestionBox').textContent='Pregunta recibida: '+pendingQuestion;}if(myRole==='guess'&&waitingForAnswer)setDiscovererControlsDisabled(true);if(myRole==='guess'&&waitingForGuess)setDiscovererControlsDisabled(true);if(myRole==='brain'&&pendingOnlineGuess){$('onlineGuessConfirmCharacter').textContent=pendingOnlineGuess;$('onlineGuessConfirmModal')?.classList.remove('hidden');}}
 status(restoring?'Partida recuperada. Verificá el estado y seguí jugando.':'Duelo online iniciado.');persistSession();
}
function onData(d){if(!d||typeof d!=='object')return;
 if(d.type==='hello'){status((d.name||'Tu rival')+' se conectó.');persistSession();return;}
 if(d.type==='rematch_request'){prepareRematch(!!d.swap,true);return;}
 if(d.type==='progress'){if(Number(d.startedAt)>0)onlineStartedAt=Number(d.startedAt);if(Number.isFinite(Number(d.guessesLeft)))onlineGuessesLeft=Math.max(0,Math.min(2,Number(d.guessesLeft)));updateOnlineHud();persistSession();return;}
 if(d.type==='state_sync'){
  localTranscript=mergeRows(localTranscript,d.transcript,false);phoneTranscript=mergeRows(phoneTranscript,d.phoneTranscript,true);restoreTranscript();restorePhoneTranscript();
  if(d.role&&d.role!==myRole)theirRole=String(d.role);
  if(Number(d.startedAt)>0&&(!onlineStartedAt||Number(d.startedAt)===onlineStartedAt))onlineStartedAt=Number(d.startedAt);
  if(myRole==='brain'){
   if(Number.isFinite(Number(d.questionsSeen)))onlineQuestionCount=Math.max(onlineQuestionCount,Number(d.questionsSeen));
   if(d.waitingForAnswer&&d.lastQuestion){pendingQuestion=String(d.lastQuestion).slice(0,240);lastOnlineQuestion=pendingQuestion;setAnswerButtonsDisabled(false);if($('onlineQuestionBox'))$('onlineQuestionBox').textContent='Pregunta recuperada: '+pendingQuestion;}
   if(d.pendingOnlineGuess)pendingOnlineGuess=String(d.pendingOnlineGuess).slice(0,120);
  }else if(myRole==='guess'){
   if(Number.isFinite(Number(d.answersSeen)))onlineAnswerCount=Math.max(onlineAnswerCount,Number(d.answersSeen));
   if(d.pendingQuestion){waitingForAnswer=true;waitingForGuess=false;lastOnlineQuestion=String(d.pendingQuestion).slice(0,240);setDiscovererControlsDisabled(true);if($('onlineQuestionBox'))$('onlineQuestionBox').textContent='Esperando respuesta del Cerebro: '+lastOnlineQuestion;}
   else if(d.pendingOnlineGuess||d.waitingForGuess){pendingOnlineGuess=String(d.pendingOnlineGuess||pendingOnlineGuess||'');waitingForGuess=true;setDiscovererControlsDisabled(true);}
   else if(waitingForGuess&&pendingOnlineGuess&&d.lastGuessResolution&&String(d.lastGuessResolution.character||'')===pendingOnlineGuess){onData({type:'guess_result',...d.lastGuessResolution});}
   else if(waitingForGuess&&pendingOnlineGuess){setDiscovererControlsDisabled(true);}
   else if(d.lastAnswer){const changed=String(d.lastAnswer)!==lastOnlineAnswer;lastOnlineAnswer=String(d.lastAnswer);waitingForAnswer=false;waitingForGuess=false;setDiscovererControlsDisabled(false);if(changed&&$('onlineQuestionBox'))$('onlineQuestionBox').textContent='Respuesta recuperada: '+lastOnlineAnswer;}
  }
  if(Number.isFinite(Number(d.guessesLeft)))onlineGuessesLeft=Math.max(0,Math.min(2,Number(d.guessesLeft)));
  if(myRole==='brain'&&pendingOnlineGuess){$('onlineGuessConfirmCharacter').textContent=pendingOnlineGuess;$('onlineGuessConfirmModal')?.classList.remove('hidden');}
  updateOnlineHud();persistSession();if(myRole==='brain')send({type:'state_sync',version:2,startedAt:onlineStartedAt,role:myRole,questionsSeen:onlineQuestionCount,answersSeen:onlineAnswerCount,guessesLeft:onlineGuessesLeft,pendingQuestion,lastQuestion:lastOnlineQuestion,lastAnswer:lastOnlineAnswer,waitingForAnswer:!!pendingQuestion,waitingForGuess:false,pendingOnlineGuess,lastGuessResolution,transcript:localTranscript.slice(-500),phoneTranscript:phoneTranscript.slice(-300),questionBox:$('onlineQuestionBox')?.textContent||'',readingStatus:$('onlineReadingStatus')?.textContent||'',elapsedSeconds:Math.floor(getOnlineElapsedSeconds())});status('Reconectados a la misma partida. Se conservó tu rol y se recuperó el turno pendiente.');return;
 }
 if(d.type==='chat'){const text=String(d.text||'').slice(0,300);addMessage(d.name||'RIVAL',text,'remote');window.MatchHistory?.record(d.name||'RIVAL',text,'chat');if($('floatingChat')?.classList.contains('hidden')){phoneUnreadCount++;updatePhoneUnreadBadge();}persistSession();return;}
 if(d.type==='role'){theirRole=d.role;updateRoles();persistSession();return;}
 if(d.type==='secret_ready'){if(myRole==='guess'){if($('guessRoleStatus'))$('guessRoleStatus').textContent='Personaje elegido. Entrando a la partida…';enterGame(d.startedAt);}return;}
 if(d.type==='question'&&myRole==='brain'){
  onlineQuestionCount=Math.max(onlineQuestionCount,Number(d.count)||0);send({type:'progress',questionsSeen:onlineQuestionCount,answersSeen:onlineAnswerCount,startedAt:onlineStartedAt,guessesLeft:onlineGuessesLeft});
  pendingQuestion=String(d.text||'').slice(0,240);lastOnlineQuestion=pendingQuestion;if(!pendingQuestion)return;
  renderOnlineSequence(pendingQuestion);$('brainInlinePanel').classList.remove('hidden');setAnswerButtonsDisabled(false);
  gameMessage((d.name||'DESCUBRIDOR')+' pregunta: '+pendingQuestion,'player');$('questionInput').value='';$('questionInput').placeholder='Escribí una respuesta…';$('sendBtn').textContent='Responder';setDisabled($('questionInput'),false);setDisabled($('sendBtn'),false);status('Pregunta recibida. Elegí una respuesta o escribí tu respuesta abajo.');persistSession();return;
 }
 if(d.type==='answer'&&myRole==='guess'){
  waitingForAnswer=false;setDiscovererControlsDisabled(false);const answer=String(d.text||'');lastOnlineAnswer=answer;
  onlineAnswerCount=Math.max(onlineAnswerCount+1,Number(d.count)||0);updateOnlineHud();gameMessage('Respuesta del Cerebro: '+answer,'mind');
  if($('onlineQuestionBox'))$('onlineQuestionBox').textContent='Respuesta recibida: '+answer;
  if($('onlineReadingStatus')){$('onlineReadingStatus').classList.remove('hidden');$('onlineReadingStatus').textContent='Respuesta recibida. Podés hacer otra pregunta.';}
  if($('brainSuggestionStatus'))$('brainSuggestionStatus').classList.add('hidden');
  status('Respuesta recibida. Podés hacer otra pregunta o adivinar.');persistSession();return;
 }
 if(d.type==='guess_announce'&&myRole==='brain'){gameMessage((d.name||'El Descubridor')+' dice: '+String(d.text||'Voy a arriesgarme: creo que ya sé quién es.'),'player');persistSession();return;}
 if(d.type==='guess'&&myRole==='brain'){
  pendingOnlineGuess=String(d.character||'').trim();if(!pendingOnlineGuess)return;onlineGuessesLeft=Math.max(0,onlineGuessesLeft-1);$('guessesHud').textContent=String(onlineGuessesLeft);
  gameMessage((d.name||'El Descubridor')+' intenta adivinar: '+pendingOnlineGuess,'player');
  $('onlineGuessConfirmCharacter').textContent=pendingOnlineGuess;$('onlineGuessConfirmLead').textContent=(d.name||'Tu rival')+' dice que el personaje es…';$('onlineGuessConfirmModal').classList.remove('hidden');return;
 }
 if(d.type==='guess_result'&&myRole==='guess'){
  waitingForGuess=false;pendingOnlineGuess='';const correct=!!d.correct;gameMessage(correct?'El Cerebro confirmó que acertaste.':'El Cerebro confirmó que no era '+(d.character||'ese personaje')+'.','system');
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
function showResult(win,title,character){$('playAgainBtn')?.classList.remove('hidden');$('playAgainBtn').textContent='JUGAR OTRA VEZ';$('playAgainSwapRolesBtn')?.classList.remove('hidden');try{window.SavedMatches?.markCompleted?.({character:String(character||secret||'').trim(),result:win?'Victoria':'Derrota',title:String(title||'Partida finalizada')});}catch(e){console.warn('[MIND] No se pudo actualizar el estado final de la partida guardada:',e);}try{localStorage.removeItem(ONLINE_SESSION_KEY);localStorage.removeItem(ONLINE_SAVE_KEY);}catch{}clearInterval(onlineTimerId);onlineTimerId=null;$('onlineGuessConfirmModal')?.classList.add('hidden');const finalName=String(character||secret||'').trim();window.MindDuelResult={win,title,character:finalName,mode:'multiplayer'};window.MatchHistory?.record('SISTEMA',title||'Partida finalizada','result');window.MatchHistory?.finish(win?'Victoria':'Derrota',{personaje:finalName});$('resultTag').textContent='MODO ONLINE · '+(myRole==='guess'?'DESCUBRIDOR':'CEREBRO');$('resultTitle').textContent=win?'¡HAS GANADO!':'HAS PERDIDO';$('resultCharacter').textContent=finalName||'Personaje secreto';const known=findCharacter(finalName);let description='';try{description=(localStorage.getItem('mind_character_description_'+finalName)||'').trim()}catch{}if(!description&&known)description=String(known.descripcion||'').trim();const brainWon = myRole==='brain' ? win : !win;const taunt=window.MindDuelTaunt?window.MindDuelTaunt(finalName,brainWon):(brainWon?'¡JAJAJA! ¡No pudiste descubrirme!':'¡¿Me ganaste?! ¡No te agrandes, que fue una sola partida!');$('resultDescription').textContent=[description,taunt].filter(Boolean).join(' ');$('editCharacterBtn').classList.toggle('hidden',!finalName);document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));$('resultScreen').classList.remove('hidden');$('gameMenuModal').classList.add('hidden');}
let rematchLock=false;
function prepareRematch(swap,remote=false){
 if(rematchLock)return;rematchLock=true;setTimeout(()=>{rematchLock=false;},800);
 if(!connected||!conn||!conn.open){status('La revancha necesita que ambos jugadores sigan conectados.');return;}
 if(!remote)send({type:'rematch_request',swap:!!swap,at:Date.now()});
 if(swap){const old=myRole;myRole=theirRole;theirRole=old;}
 clearInterval(onlineTimerId);onlineTimerId=null;onlineStartedAt=0;onlineQuestionCount=0;onlineAnswerCount=0;onlineGuessesLeft=2;pendingOnlineGuess='';pendingQuestion='';waitingForAnswer=false;waitingForGuess=false;secret='';
 $('secretCharacter').value='';$('startDuelBtn').disabled=true;$('brainSetupStatus').textContent='Elegí un personaje nuevo para la revancha.';
 $('onlineGuessConfirmModal')?.classList.add('hidden');$('guessModal')?.classList.add('hidden');$('floatingChat').classList.add('hidden');$('chatUnread')?.classList.add('hidden');
 document.body.classList.remove('duel-online','duel-brain','duel-guess');document.querySelectorAll('.screen').forEach(sc=>sc.classList.add('hidden'));$('resultScreen').classList.add('hidden');
 modal.classList.remove('hidden');$('duelConnected').classList.remove('hidden');$('hostRoom').classList.toggle('hidden',!host);$('joinRoom').classList.add('hidden');$('createRoomBtn').classList.add('hidden');$('joinRoomBtn').classList.add('hidden');$('roleChooser').classList.add('hidden');
 $('brainRolePanel').classList.add('hidden');$('guessRolePanel').classList.add('hidden');$('roleStatus').textContent='';$('peerStatus').textContent='CONEXIÓN ESTABLECIDA';
 if(myRole==='brain'){$('brainRolePanel').classList.remove('hidden');$('brainSetupStatus').textContent='Elegí un personaje nuevo para la revancha.';populateCharacters();}
 else{$('guessRolePanel').classList.remove('hidden');$('guessRoleStatus').textContent='Esperando que el Cerebro elija el personaje…';}
 status(swap?'Roles intercambiados. Elegí el personaje para comenzar la revancha.':'Mismos roles. Elegí el personaje para comenzar la revancha.');
}
on('playAgainBtn','click',e=>{if(!window.MindDuelResult||window.MindDuelResult.mode!=='multiplayer')return;e.preventDefault();e.stopImmediatePropagation();prepareRematch(false);},true);
on('playAgainSwapRolesBtn','click',e=>{if(!window.MindDuelResult||window.MindDuelResult.mode!=='multiplayer')return;e.preventDefault();e.stopImmediatePropagation();prepareRematch(true);},true);

document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(onlineStartedAt){updateOnlineClockDisplay();saveOnlineProgress();if(conn&&conn.open)send({type:'progress',questionsSeen:onlineQuestionCount,answersSeen:onlineAnswerCount,startedAt:onlineStartedAt,guessesLeft:onlineGuessesLeft});}}else saveOnlineProgress();});
window.addEventListener('pagehide',saveOnlineProgress);window.addEventListener('freeze',saveOnlineProgress);
window.addEventListener('beforeunload',e=>{if(document.body.classList.contains('duel-online')&&onlineStartedAt&&!document.getElementById('resultScreen')?.classList.contains('hidden'))return; if(document.body.classList.contains('duel-online')&&onlineStartedAt){saveOnlineProgress();e.preventDefault();e.returnValue='La partida online está en curso. Si cerrás o recargás, la conexión con tu rival puede perderse.';return e.returnValue;}});
window.addEventListener('mindduel-surrender',()=>{send({type:'result',result:'surrender',role:myRole,name:saveName(),secret:secret});showResult(false,'Te rendiste antes de terminar la partida',secret);});window.addEventListener('mindduel-leave',()=>{try{persistSession()}catch{}try{conn&&conn.close();peer&&peer.destroy()}catch{};reset();modal?.classList.add('hidden');document.body.classList.remove('duel-online','duel-brain','duel-guess');document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));$('stageScreen').classList.remove('hidden');});
function showReconnectOption(){connected=false;refreshRestoreButton();if(host){$('newRoomCodeBtn')?.classList.remove('hidden');$('shareRoomBtn')?.classList.remove('hidden');}const st=$('duelStatus');if(!st)return;const code=String($('roomCode')?.textContent||readSavedSession()?.roomId||remotePeerId||'');st.textContent='⚠ TU RIVAL SE DESCONECTÓ. La partida queda guardada en este dispositivo. Código de la sala: '+(code||'no disponible')+'. Compartíselo para que vuelva a entrar sin cambiar de rol ni de turno.';let b=$('reconnectDuelBtn');if(!b){b=document.createElement('button');b.id='reconnectDuelBtn';b.className='btn';b.textContent=host?'MANTENER / RECUPERAR SALA':'RECONECTAR A LA MISMA SALA';b.style.margin='8px auto';st.insertAdjacentElement('afterend',b);b.addEventListener('click',()=>{if(host){status('La sala original sigue abierta. Pasale el mismo código al rival; no generes otro código.');return;}if(!peer||!remotePeerId){status('Recargá el juego: intentará recuperar la sala guardada.');return;}try{reconnecting=true;status('Intentando recuperar la partida…');ready(peer.connect(remotePeerId,{reliable:true}));}catch(e){status('No se pudo reconectar. Volvé a intentar en unos segundos.');}});}}
function ready(c){conn=c;conn.on('open',()=>{status('Conexión establecida. Sincronizando la partida guardada…');connected=true;reconnecting=false;if(document.body.classList.contains('duel-online')){offlineRecovery=false;resumeOnlineClock();const rbbar=$('offlineRecoveryBar');if(rbbar){setText('offlineRecoveryText','Rival conectado · reloj en marcha.');setTimeout(()=>rbbar?.classList.add('hidden'),2500);}}refreshRestoreButton();const rb=$('reconnectDuelBtn');if(rb)rb.remove();$('duelConnected').classList.remove('hidden');$('createRoomBtn').classList.add('hidden');$('joinRoomBtn').classList.add('hidden');$('hostRoom').classList.toggle('hidden',!host);$('joinRoom').classList.add('hidden');if($('newRoomCodeBtn'))$('newRoomCodeBtn').classList.add('hidden');if($('shareRoomBtn'))$('shareRoomBtn').classList.add('hidden');$('peerStatus').textContent='CONEXIÓN ESTABLECIDA';populateCharacters();
 const saved=readSavedSession();const restoring=!!(saved&&saved.startedAt&&saved.roomId&&saved.myRole);
 if(restoring){restoreSnapshot=saved;clockElapsedBase=getSavedElapsedSeconds(saved);clockRunStartedAt=0;clockPaused=true;myRole=saved.myRole;theirRole=saved.theirRole||'';secret=myRole==='brain'?String(saved.secret||''):'';onlineStartedAt=Number(saved.startedAt)||Date.now();onlineQuestionCount=Number(saved.questionCount)||0;onlineAnswerCount=Number(saved.answerCount)||0;onlineGuessesLeft=Math.max(0,Math.min(2,Number(saved.guessesLeft??2)));pendingQuestion=String(saved.pendingQuestion||'');waitingForAnswer=!!saved.waitingForAnswer;waitingForGuess=!!saved.waitingForGuess;pendingOnlineGuess=String(saved.pendingOnlineGuess||'');lastGuessResolution=saved.lastGuessResolution||null;lastOnlineQuestion=String(saved.lastQuestion||'');lastOnlineAnswer=String(saved.lastAnswer||'');localTranscript=recoverGameTranscript(saved);phoneTranscript=recoverPhoneTranscript(saved);phoneUnreadCount=Math.max(0,Number(saved.phoneUnreadCount)||(phoneTranscript.length?phoneTranscript.length:0));enterGame(onlineStartedAt,true);}
 else{status('Conexión establecida. Elegí tu papel.');addMessage('SISTEMA','Conexión establecida.','system');if(myRole&&theirRole)updateRoles();}
 send({type:'hello',name:saveName()});send({type:'state_sync',version:2,startedAt:onlineStartedAt,role:myRole,questionsSeen:onlineQuestionCount,answersSeen:onlineAnswerCount,guessesLeft:onlineGuessesLeft,pendingQuestion:myRole==='brain'?pendingQuestion:'',lastQuestion:lastOnlineQuestion,lastAnswer:lastOnlineAnswer,waitingForAnswer,waitingForGuess,pendingOnlineGuess,lastGuessResolution,transcript:localTranscript.slice(-500),phoneTranscript:phoneTranscript.slice(-300),questionBox:$('onlineQuestionBox')?.textContent||'',readingStatus:$('onlineReadingStatus')?.textContent||'',elapsedSeconds:Math.floor(getOnlineElapsedSeconds())});persistSession();status('Partida original conectada. Rol y turno conservados.');});conn.on('data',onData);conn.on('close',()=>{$('peerStatus').textContent='RIVAL DESCONECTADO';pauseOnlineClock();offlineRecovery=true;showOfflineRecoveryBar();showReconnectOption();persistSession();});conn.on('error',e=>{status('Falló la conexión ('+(e.type||'error')+'). Revisá internet y el código de sala; si persiste, que el anfitrión reabra la partida.');persistSession();});}
$('dueloBtn').textContent='DUELO ONLINE';on('dueloBtn','click',async()=>{if(typeof closeStageCurtain==='function'&&typeof openStageCurtain==='function'){document.getElementById('stageMenu')?.classList.add('hidden');await closeStageCurtain(900);await openStageCurtain(900);}reset();showModal();});
function createRoomCode(){
 if(!window.Peer){status('No se pudo cargar la conexión online. Revisá internet y recargá.');return;}
 try{if(conn){conn.close();conn=null;}if(peer){peer.destroy();peer=null;}}catch{}
 try{localStorage.removeItem(ONLINE_SESSION_KEY);localStorage.removeItem(ONLINE_SAVE_KEY);}catch{}
 host=true;connected=false;remotePeerId='';$('duelConnected').classList.add('hidden');$('joinRoom').classList.add('hidden');$('hostRoom').classList.remove('hidden');$('createRoomBtn').classList.add('hidden');$('joinRoomBtn').classList.add('hidden');$('newRoomCodeBtn').disabled=true;status('Generando un código nuevo…');
 const saved=readSavedSession();const roomId='mdf-'+Array.from(crypto.getRandomValues(new Uint8Array(12))).map(x=>x.toString(16).padStart(2,'0')).join('');localPeerId=roomId;remotePlayerPeerId='';remotePeerId='';peer=new Peer(roomId);
 peer.on('open',id=>{$('roomCode').textContent=id;localPeerId=id;$('newRoomCodeBtn').disabled=false;status('Sala lista. Compartí el código o la invitación. Si se corta la conexión, esta sala puede recuperarse desde este dispositivo.');persistSession();});
 peer.on('connection',c=>{if(conn&&conn.open){if(c.peer===remotePlayerPeerId){try{conn.close();}catch{}}else{c.close();return;}}remotePlayerPeerId=c.peer;remotePeerId=c.peer;ready(c);});
 peer.on('error',e=>{$('newRoomCodeBtn').disabled=false;status('No se pudo crear el código ('+(e.type||'error')+'). Podés generar otro sin volver a configurar la sala.');});
}
on('createRoomBtn','click',()=>{reset();saveName();createRoomCode();});
on('newRoomCodeBtn','click',()=>{if(connected){status('La sala ya tiene una partida conectada. Terminá o abandoná esa partida antes de generar otro código.');return;}createRoomCode();});
on('shareRoomBtn','click',async()=>{const code=$('roomCode').textContent.trim();if(!code){status('Primero generá un código de sala.');return;}const url=new URL(location.href);url.searchParams.set('room',code);const text=`Te invito a jugar Mind Duel Fusion. Abrí este enlace y conectate con el código ${code}: ${url.href}`;try{if(navigator.share){await navigator.share({title:'Mind Duel Fusion · Invitación',text,url:url.href});status('Invitación compartida.');}else if(navigator.clipboard){await navigator.clipboard.writeText(text);status('Invitación completa copiada. Pegala en WhatsApp.');}else{window.prompt('Copiá esta invitación y mandala por WhatsApp:',text);status('Invitación preparada para compartir.');}}catch(e){if(e&&e.name!=='AbortError')status('No se pudo abrir el menú para compartir. Podés copiar el código.');}});
on('joinRoomBtn','click',()=>{$('joinRoom').classList.remove('hidden');$('roomInput').focus();status('Ingresá el código que te compartió tu amigo.');});
on('connectRoomBtn','click',()=>{
 if(!window.Peer){status('No se pudo cargar la conexión online.');return;}
 const id=$('roomInput').value.trim();if(!id){status('Ingresá el código de sala.');return;}
 const priorSaved=readSavedSession();
 // Si el código coincide con la sala guardada de este jugador, esto es una reconexión,
 // no una partida nueva: conservar rol, personaje, contadores y conversaciones.
 const resumeExisting=!!(priorSaved&&priorSaved.myRole&&priorSaved.startedAt&&String(priorSaved.roomId||'')===id);
 const recoveryJoin=id.startsWith('mdfr-');
 reset();
 remotePeerId=id;remotePlayerPeerId='';host=false;
 localPeerId='mdf-'+Array.from(crypto.getRandomValues(new Uint8Array(12))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(resumeExisting){
  restoreSnapshot={...priorSaved,host:false,roomId:id,localPeerId,remotePlayerPeerId:'',savedAt:Date.now()};
  restoreMatchId=String(priorSaved.matchId||'');
  myRole=String(priorSaved.myRole||'');theirRole=String(priorSaved.theirRole||'');
  secret=myRole==='brain'?String(priorSaved.secret||''):'';
  onlineStartedAt=Number(priorSaved.startedAt)||Date.now();clockElapsedBase=getSavedElapsedSeconds(priorSaved);clockRunStartedAt=0;clockPaused=true;
  onlineQuestionCount=Number(priorSaved.questionCount)||0;onlineAnswerCount=Number(priorSaved.answerCount)||0;
  onlineGuessesLeft=Math.max(0,Math.min(2,Number(priorSaved.guessesLeft??2)));
  pendingQuestion=String(priorSaved.pendingQuestion||'');waitingForAnswer=!!priorSaved.waitingForAnswer;waitingForGuess=!!priorSaved.waitingForGuess;
  pendingOnlineGuess=String(priorSaved.pendingOnlineGuess||'');lastGuessResolution=priorSaved.lastGuessResolution||null;lastOnlineQuestion=String(priorSaved.lastQuestion||'');lastOnlineAnswer=String(priorSaved.lastAnswer||'');
  localTranscript=recoverGameTranscript(priorSaved);phoneTranscript=recoverPhoneTranscript(priorSaved);
  phoneUnreadCount=Math.max(0,Number(priorSaved.phoneUnreadCount)||0);
  try{localStorage.setItem(ONLINE_SESSION_KEY,JSON.stringify(restoreSnapshot));}catch{}
 }
 $('joinRoom').classList.remove('hidden');saveName();
 status(resumeExisting?'Reconectando a tu partida guardada y recuperando tu rol…':(recoveryJoin?'Conectando a una sala de recuperación…':'Conectando…'));
 peer=new Peer(localPeerId);
 peer.on('open',()=>{persistSession();ready(peer.connect(id,{reliable:true}));});
 peer.on('error',e=>status('No se pudo conectar ('+(e.type||'error')+'). Verificá el código.'));
});
on('copyRoomBtn','click',async()=>{try{await navigator.clipboard.writeText($('roomCode').textContent);status('Código copiado. Mandáselo a tu amigo.');}catch{status('Mantené presionado el código para copiarlo.');}});
on('roleBrainBtn','click',()=>{if(theirRole==='brain'){status('Tu amigo ya eligió ser el Cerebro.');return;}myRole='brain';send({type:'role',role:myRole});updateRoles();persistSession();});
on('roleGuessBtn','click',()=>{if(theirRole==='guess'){status('Tu amigo ya eligió descubrir.');return;}myRole='guess';send({type:'role',role:myRole});updateRoles();persistSession();});
function normalizeName(v){return String(v||'').trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function findCharacter(name){const people=(typeof PERSONAJES!=='undefined'?PERSONAJES:window.PERSONAJES)||[];return people.find(p=>normalizeName(p.nombre)===normalizeName(name)||((p.alias||[]).some(a=>normalizeName(a)===normalizeName(name))))||null;}
function setSecret(value){secret=String(value||'').trim();if(secret){const known=findCharacter(secret);$('brainSetupStatus').textContent=known?'Personaje de la lista seleccionado. Las sugerencias usarán sus datos.':'Personaje propio seleccionado. La memoria aprenderá de las respuestas que des.';$('startDuelBtn').disabled=false;}else{$('brainSetupStatus').textContent='Elegí un personaje o escribí uno propio.';$('startDuelBtn').disabled=true;}}
on('secretCharacter','change',()=>setSecret($('secretCharacter').value));on('secretCharacter','input',()=>setSecret($('secretCharacter').value));on('startDuelBtn','click',()=>{setSecret($('secretCharacter').value);if(!secret){$('brainSetupStatus').textContent='Elegí o escribí un personaje antes de entrar.';return;}rememberCustomCharacter(secret);const startedAt=Date.now();send({type:'secret_ready',ready:true,startedAt});enterGame(startedAt);persistSession();});
function readTraining(){try{return JSON.parse(localStorage.getItem('mind_duel_human_training')||'[]')}catch{return []}}
function rememberCustomCharacter(name){try{const key='mind_duel_custom_characters';const list=JSON.parse(localStorage.getItem(key)||'[]');if(!findCharacter(name)&&!list.some(x=>normalizeName(x.nombre)===normalizeName(name)))list.push({nombre:name,creado:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(list.slice(-500)));}catch{}}
// Intercepta el formulario NATIVO del juego: en modo cerebro envía respuestas; en modo descubridor envía preguntas.
on('questionForm','submit',e=>{if(!document.body.classList.contains('duel-online'))return;e.preventDefault();e.stopImmediatePropagation();const input=$('questionInput'),text=input.value.trim();if(!connected||!myRole){status('La partida online no está conectada correctamente.');return;}if(!text)return;if(myRole==='guess'){if(waitingForAnswer||waitingForGuess)return;lastOnlineQuestion=text;if(!send({type:'question',name:saveName(),text,count:incrementCount()})){status('No se pudo enviar la pregunta.');return;}input.value='';waitingForAnswer=true;setDiscovererControlsDisabled(true);gameMessage(text,'player');renderOnlineSequence(text);status('Pregunta enviada. Esperando respuesta del Cerebro…');return;}if(myRole==='brain'){if(!pendingQuestion){status('Esperá una pregunta del Descubridor.');return;}if($('sendBtn').disabled)return;lastOnlineAnswer=text;if(!send({type:'answer',text,count:++onlineAnswerCount})){status('No se pudo enviar la respuesta.');return;}gameMessage(text,'mind');storeLearning(pendingQuestion,text);updateOnlineHud();pendingQuestion='';input.value='';setAnswerButtonsDisabled(true);if($('onlineQuestionBox'))$('onlineQuestionBox').textContent='Respuesta enviada: '+text;if($('onlineReadingStatus'))$('onlineReadingStatus').textContent='Esperando la próxima pregunta del Descubridor…';if($('brainSuggestionStatus'))$('brainSuggestionStatus').classList.add('hidden');status('Respuesta enviada. Esperando la próxima pregunta…');}},true);
on('classicPanel','click',e=>{if(!document.body.classList.contains('duel-online'))return;if(!connected||myRole!=='brain')return;const b=e.target.closest('[data-ans]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(!pendingQuestion){status('Esperá una pregunta del Descubridor.');return;}if(b.disabled)return;const text=labels[b.dataset.ans];lastOnlineAnswer=text;if(!send({type:'answer',text,count:++onlineAnswerCount})){status('No se pudo enviar la respuesta.');return;}gameMessage(text,'mind');storeLearning(pendingQuestion,text);updateOnlineHud();pendingQuestion='';$('questionInput').value='';setAnswerButtonsDisabled(true);if($('onlineQuestionBox'))$('onlineQuestionBox').textContent='Respuesta enviada: '+text;if($('onlineReadingStatus'))$('onlineReadingStatus').textContent='Esperando la próxima pregunta del Descubridor…';if($('brainSuggestionStatus'))$('brainSuggestionStatus').classList.add('hidden');status('Respuesta enviada. Esperando la próxima pregunta…');},true);
function confirmOnlineGuess(correct){if(!pendingOnlineGuess)return;const guessed=pendingOnlineGuess;lastGuessResolution={character:guessed,correct:!!correct,secret:secret,guessesLeft:onlineGuessesLeft,name:saveName(),at:Date.now()};pendingOnlineGuess='';persistSession();$('onlineGuessConfirmModal').classList.add('hidden');const left=onlineGuessesLeft;$('guessesHud').textContent=String(left);send({type:'guess_result',correct,character:guessed,secret:secret,guessesLeft:left,name:saveName()});if(correct){gameMessage('Confirmaste que el Descubridor acertó.','system');showResult(false,'Tu amigo descubrió el personaje',secret);}else if(left<=0){gameMessage('El Descubridor agotó sus dos intentos.','system');showResult(true,'Tu amigo agotó sus dos intentos',secret);}else{gameMessage('Confirmaste que no era ese personaje. Queda(n) '+left+' intento(s).','system');status('Intento incorrecto confirmado.');}}
on('onlineGuessConfirmYes','click',()=>confirmOnlineGuess(true));on('onlineGuessConfirmNo','click',()=>confirmOnlineGuess(false));
on('guessBtn','click',e=>{if(!document.body.classList.contains('duel-online'))return;e.preventDefault();e.stopImmediatePropagation();if(myRole!=='guess'||waitingForAnswer||waitingForGuess||onlineGuessesLeft<=0)return;const announcement=randomDiscovererGuessLine();if(!send({type:'guess_announce',text:announcement,name:saveName()})){status('No se pudo anunciar el intento.');return;}gameMessage(announcement,'player');$('guessHint').textContent='Te quedan '+onlineGuessesLeft+' intentos. Escribí el nombre del personaje.';$('guessInput').value='';$('guessModal').classList.remove('hidden');$('guessInput').focus();},true);
on('confirmGuessBtn','click',e=>{if(!document.body.classList.contains('duel-online'))return;e.preventDefault();e.stopImmediatePropagation();if(!connected||myRole!=='guess'||waitingForAnswer||waitingForGuess)return;const character=$('guessInput').value.trim();if(!character)return;submitGuess(character);$('guessInput').value='';$('guessModal').classList.add('hidden');},true);
on('guessInput','keydown',e=>{if(!document.body.classList.contains('duel-online')||e.key!=='Enter')return;e.preventDefault();e.stopImmediatePropagation();if(!connected||myRole!=='guess'||waitingForAnswer||waitingForGuess)return;const character=$('guessInput').value.trim();if(!character)return;submitGuess(character);$('guessInput').value='';$('guessModal').classList.add('hidden');},true);
function submitGuess(character){if(!connected||myRole!=='guess'||waitingForGuess||onlineGuessesLeft<=0)return;pendingOnlineGuess=String(character||'').trim();if(!send({type:'guess',character:pendingOnlineGuess,name:saveName()})){pendingOnlineGuess='';status('No se pudo enviar el intento.');return;}onlineGuessesLeft--; $('guessesHud').textContent=String(onlineGuessesLeft);waitingForGuess=true;setDiscovererControlsDisabled(true);gameMessage('Intentaste adivinar: '+character,'player');persistSession();status('Intento enviado. Esperando la confirmación del Cerebro…');}
function incrementCount(){onlineQuestionCount++;updateOnlineHud();send({type:'progress',questionsSeen:onlineQuestionCount,answersSeen:onlineAnswerCount,startedAt:onlineStartedAt,guessesLeft:onlineGuessesLeft});return onlineQuestionCount;}
function storeLearning(question,answer){try{rememberCustomCharacter(secret);const key='mind_duel_human_training';const rows=readTraining();rows.push({character:secret,question,answer,at:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(rows.slice(-500)));}catch{}}
function sendChat(input){const text=input.value.trim();if(!text)return;if(!conn||!conn.open){status('Todavía no hay conexión.');return;}const n=saveName();addMessage(n,text,'local');window.MatchHistory?.record(n,text,'chat');persistSession();send({type:'chat',name:n,text});input.value='';phoneUnreadCount=0;updatePhoneUnreadBadge();}
on('floatingChatForm','submit',e=>{e.preventDefault();sendChat($('floatingChatInput'));});// El chat del duelo se abre desde la burbuja flotante; no existe un formulario de chat fijo en el HTML.
const chatButton=$('chatBubbleBtn');if(chatButton)chatButton.innerHTML='☎<span id="chatUnread" class="chat-unread hidden" aria-label="Mensajes sin leer">0</span>';
on('chatBubbleBtn','click',()=>{$('floatingChat').classList.toggle('hidden');if(!$('floatingChat').classList.contains('hidden')){phoneUnreadCount=0;updatePhoneUnreadBadge();$('floatingChatInput').focus();persistSession();}});on('floatingChatClose','click',()=>$('floatingChat').classList.add('hidden'));
// Botón flotante arrastrable: moverlo no abre/cierra el chat por accidente.
(function makeChatBubbleDraggable(){const b=$('chatBubbleBtn');if(!b)return;let sx=0,sy=0,ox=0,oy=0,moved=false,dragging=false;const down=e=>{if(e.button!==undefined&&e.button!==0)return;dragging=true;moved=false;const r=b.getBoundingClientRect();sx=e.clientX;sy=e.clientY;ox=r.left;oy=r.top;b.style.right='auto';b.style.bottom='auto';b.style.left=ox+'px';b.style.top=oy+'px';try{b.setPointerCapture(e.pointerId)}catch{};};const move=e=>{if(!dragging)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>6)moved=true;const x=Math.max(4,Math.min(window.innerWidth-b.offsetWidth-4,ox+dx));const y=Math.max(4,Math.min(window.innerHeight-b.offsetHeight-4,oy+dy));b.style.left=x+'px';b.style.top=y+'px';};const up=e=>{if(!dragging)return;dragging=false;if(moved){e.preventDefault();b.dataset.dragged='1';setTimeout(()=>delete b.dataset.dragged,250);}try{b.releasePointerCapture(e.pointerId)}catch{}};b.addEventListener('pointerdown',down);b.addEventListener('pointermove',move);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('click',e=>{if(b.dataset.dragged==='1'){e.preventDefault();e.stopImmediatePropagation();}},true);})();
on('duelWinBtn','click',()=>{send({type:'result',result:'win',name:saveName()});showResult(true,'Confirmaste la victoria',secret);});
on('duelLoseBtn','click',()=>{send({type:'result',result:'lose',name:saveName()});showResult(false,'Confirmaste la derrota',secret);});
on('closeDuelBtn','click',()=>{modal.classList.add('hidden');reset();});if(modal)modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.add('hidden');reset();}});
// El botón de recuperación abre la biblioteca; no intenta conectar por su cuenta.

const inviteCode=new URLSearchParams(location.search).get('room');
const priorSession=readSavedSession();
refreshRestoreButton();
// No reabrir una partida automáticamente: al entrar por el enlace se conserva la intro.
// La recuperación se inicia manualmente desde la biblioteca.
if(inviteCode){setTimeout(()=>{showModal();$('joinRoom').classList.remove('hidden');$('roomInput').value=inviteCode;status('Te invitaron a una sala. Revisá tu nombre y tocá CONECTAR.');},350);}
})();