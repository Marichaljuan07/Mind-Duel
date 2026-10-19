(() => {
'use strict';
const $=id=>document.getElementById(id);
const on=(id,event,handler)=>{const el=$(id);if(el)el.addEventListener(event,handler);};
const setText=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
const setClass=(id,cls,add)=>{const el=$(id);if(el)el.classList[add?'add':'remove'](cls);};
const modal=$('duelModal'); let peer=null,conn=null,host=false,connected=false,myRole='',theirRole='',secret='',pendingQuestion='';
const labels={si:'Sí',no:'No',nose:'No lo sé',psi:'Probablemente sí',pno:'Probablemente no'};
const nativeChat=$('chat');
function status(t){setText('duelStatus',t);}
function showModal(){if(!modal)return;modal.classList.remove('hidden');const name=$('duelName');if(name)name.value=localStorage.getItem('mindduel_player_name')||'';}
function reset(){try{conn&&conn.close();peer&&peer.destroy()}catch{} conn=null;peer=null;connected=false;host=false;myRole='';theirRole='';secret='';pendingQuestion='';$('hostRoom').classList.add('hidden');$('joinRoom').classList.add('hidden');$('duelConnected').classList.add('hidden');$('createRoomBtn').classList.remove('hidden');$('joinRoomBtn').classList.remove('hidden');if($('duelMessages'))$('duelMessages').innerHTML='';$('floatingMessages').innerHTML='';$('roleChooser').classList.remove('hidden');$('chatBubbleBtn').classList.add('hidden');$('floatingChat').classList.add('hidden');status('Elegí crear una sala o unirte a una.');}
function addMessage(name,msg,kind=''){for(const target of ['duelMessages','floatingMessages']){const box=$(target);if(!box)continue;const row=document.createElement('div');row.className='duel-message '+kind;const who=document.createElement('b');who.textContent=name+' · ';const body=document.createElement('span');body.textContent=msg;row.append(who,body);box.append(row);box.scrollTop=box.scrollHeight;}}
function gameMessage(text,kind='system'){if(!nativeChat)return;const row=document.createElement('div');row.className='message message-'+(kind==='player'?'player':kind==='mind'?'mind':'system');const avatar=document.createElement('div');avatar.className='avatar';avatar.textContent=kind==='player'?'YOU':kind==='mind'?'MD':'!';const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=text;row.append(avatar,bubble);nativeChat.append(row);nativeChat.scrollTop=nativeChat.scrollHeight;}
function send(obj){if(conn&&conn.open)conn.send(obj);}
function saveName(){const field=$('duelName');const n=((field&&field.value||'').trim()||'Jugador');if(field)field.value=n;localStorage.setItem('mindduel_player_name',n);return n;}
function populateCharacters(){const list=$('characterOptions');const people=(typeof PERSONAJES!=='undefined'?PERSONAJES:window.PERSONAJES);if(!list||!Array.isArray(people))return;list.innerHTML='';people.forEach(p=>{const o=document.createElement('option');o.value=p.nombre;list.append(o);});}
function updateRoles(){
 if(!connected)return;
 if(!myRole||!theirRole){$('roleStatus').textContent='Elegí tu papel. Tu amigo debe elegir el otro.';return;}
 if(myRole===theirRole){$('roleStatus').textContent='Los dos eligieron el mismo papel. Uno debe cambiar.';return;}
 $('roleChooser').classList.add('hidden');
 if(myRole==='brain'){
   $('brainRolePanel').classList.remove('hidden');$('guessRolePanel').classList.add('hidden');
   $('roleStatus').textContent='Elegiste ser el cerebro. Elegí el personaje secreto antes de entrar.';
   $('brainSetupStatus').textContent='Elegí un personaje para continuar.';
   modal.classList.remove('hidden');
 } else {
   $('brainRolePanel').classList.add('hidden');$('guessRolePanel').classList.remove('hidden');
   $('guessRoleStatus').textContent='Esperando a que el cerebro elija su personaje…';
   modal.classList.remove('hidden');
 }
}
function enterGame(){
 modal.classList.add('hidden');
 document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
 $('gameScreen').classList.remove('hidden');$('chatBubbleBtn').classList.remove('hidden');
 document.body.classList.add('duel-online');document.body.classList.remove('classic','name-phase');
 $('classicEnd').classList.add('hidden');$('brainInlinePanel').classList.add('hidden');$('classicPanel').classList.toggle('hidden',myRole!=='brain');
 $('suggestBtn').classList.add('hidden');$('guessBtn').classList.toggle('hidden',myRole==='brain');
 $('questionForm').classList.remove('hidden');$('questionInput').disabled=false;$('sendBtn').disabled=false;
 nativeChat.innerHTML='';$('questionsHud').textContent='0/20';$('guessesHud').textContent='2';$('timer').textContent='ONLINE';
 $('questionInput').placeholder=myRole==='brain'?'Escribí una respuesta libre…':'Escribí tu pregunta…';
 document.querySelector('.console-title span:last-child').textContent=myRole==='brain'?'RESPONDE AL DESCUBRIDOR':'DESCUBRE EL PERSONAJE';
 if(myRole==='brain')gameMessage('Personaje secreto elegido. Esperá las preguntas de tu rival y respondé con los botones o escribiendo.','system');
 else gameMessage('Tu amigo ya eligió su personaje. Hacé preguntas como en el juego original e intentá descubrirlo.','mind');
 status('Duelo online iniciado.');
}
function onData(d){if(!d||typeof d!=='object')return;
 if(d.type==='hello'){addMessage('SISTEMA',(d.name||'Tu rival')+' se conectó.','system');return;}
 if(d.type==='chat'){addMessage(d.name||'RIVAL',String(d.text||'').slice(0,300),'remote');if($('floatingChat').classList.contains('hidden'))$('chatUnread').classList.remove('hidden');return;}
 if(d.type==='role'){theirRole=d.role;updateRoles();return;}
 if(d.type==='secret_ready'){if(myRole==='guess'){if($('guessRoleStatus'))$('guessRoleStatus').textContent='Personaje elegido. Entrando a la partida…';enterGame();}return;}
 if(d.type==='question'){pendingQuestion=String(d.text||'').slice(0,240);$('brainQuestion').dataset.question=pendingQuestion;$('brainQuestion').textContent=(d.name||'Tu rival')+' pregunta: '+pendingQuestion;$('onlineQuestionBox').textContent=(d.name||'Tu rival')+' pregunta: '+pendingQuestion;gameMessage((d.name||'DESCUBRIDOR')+' pregunta: '+pendingQuestion,'player');addMessage(d.name||'DESCUBRIDOR','Pregunta: '+pendingQuestion,'remote');return;}
 if(d.type==='answer'){gameMessage('CEREBRO: '+String(d.text||''),'mind');$('questionsHud').textContent=d.count||$('questionsHud').textContent;return;}
 if(d.type==='guess'){const ok=String(d.character||'').trim().toLocaleLowerCase()===secret.trim().toLocaleLowerCase();send({type:'guess_result',correct:ok,character:d.character,name:saveName()});gameMessage('El rival intenta adivinar: '+d.character,'player');if(ok){gameMessage('¡El rival acertó!','system');showResult(false,'Tu amigo descubrió el personaje',secret);}else gameMessage('No era ese personaje. El rival puede seguir intentando.','system');return;}
 if(d.type==='guess_result'){const msg=d.correct?'¡Adivinaste! VICTORIA':'No era '+(d.character||'ese personaje')+'. Seguí intentando.';gameMessage(msg,'system');addMessage('SISTEMA',msg,'system');if(d.correct)showResult(true,'Descubriste el personaje',d.character);return;}
 if(d.type==='result'){addMessage('SISTEMA',`${d.name||'Tu rival'} confirmó ${d.result==='win'?'VICTORIA':'DERROTA'}`,'system');}
}
function showResult(win,title,character){$('resultTag').textContent='DUELO ONLINE';$('resultTitle').textContent=win?'VICTORIA':'DERROTA';$('resultCharacter').textContent=character||'';$('resultDescription').textContent=title||'';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));$('resultScreen').classList.remove('hidden');}
function ready(c){conn=c;conn.on('open',()=>{connected=true;$('duelConnected').classList.remove('hidden');$('createRoomBtn').classList.add('hidden');$('joinRoomBtn').classList.add('hidden');$('hostRoom').classList.toggle('hidden',!host);$('joinRoom').classList.add('hidden');$('peerStatus').textContent='CONEXIÓN ESTABLECIDA';status('Conectados desde redes distintas. Elegí tu papel.');send({type:'hello',name:saveName()});addMessage('SISTEMA','Conexión establecida.','system');populateCharacters();});conn.on('data',onData);conn.on('close',()=>{connected=false;$('peerStatus').textContent='RIVAL DESCONECTADO';status('La conexión se cerró.');});conn.on('error',e=>status('Problema de conexión: '+(e.type||'revisá el código.')));}
$('dueloBtn').textContent='DUELO ONLINE';on('dueloBtn','click',()=>{reset();showModal();});
on('createRoomBtn','click',()=>{if(!window.Peer){status('No se pudo cargar la conexión online. Revisá internet y recargá.');return;}reset();host=true;saveName();status('Creando sala online…');peer=new Peer();peer.on('open',id=>{$('hostRoom').classList.remove('hidden');$('roomCode').textContent=id;$('createRoomBtn').classList.add('hidden');$('joinRoomBtn').classList.add('hidden');status('Sala creada. Compartí el código con tu amigo.');});peer.on('connection',c=>{if(conn){c.close();return;}ready(c);});peer.on('error',e=>status('No se pudo crear la sala ('+(e.type||'error')+').'));});
on('joinRoomBtn','click',()=>{$('joinRoom').classList.remove('hidden');$('roomInput').focus();status('Ingresá el código que te compartió tu amigo.');});
on('connectRoomBtn','click',()=>{if(!window.Peer){status('No se pudo cargar la conexión online.');return;}const id=$('roomInput').value.trim();if(!id){status('Ingresá el código de sala.');return;}reset();$('joinRoom').classList.remove('hidden');saveName();status('Conectando…');peer=new Peer();peer.on('open',()=>ready(peer.connect(id,{reliable:true})));peer.on('error',e=>status('No se pudo conectar ('+(e.type||'error')+'). Verificá el código.'));});
on('copyRoomBtn','click',async()=>{try{await navigator.clipboard.writeText($('roomCode').textContent);status('Código copiado. Mandáselo a tu amigo.');}catch{status('Mantené presionado el código para copiarlo.');}});
on('roleBrainBtn','click',()=>{if(theirRole==='brain'){status('Tu amigo ya eligió ser el cerebro.');return;}myRole='brain';send({type:'role',role:myRole});updateRoles();});
on('roleGuessBtn','click',()=>{if(theirRole==='guess'){status('Tu amigo ya eligió descubrir.');return;}myRole='guess';send({type:'role',role:myRole});updateRoles();});
function setSecret(value){secret=String(value||'').trim();if(secret){$('brainSetupStatus').textContent='Personaje seleccionado. Solo vos podés verlo.';$('startDuelBtn').disabled=false;}else{$('brainSetupStatus').textContent='Elegí un personaje para continuar.';$('startDuelBtn').disabled=true;}}
on('secretCharacter','change',()=>setSecret($('secretCharacter').value));on('secretCharacter','input',()=>setSecret($('secretCharacter').value));on('startDuelBtn','click',()=>{setSecret($('secretCharacter').value);if(!secret){$('brainSetupStatus').textContent='Elegí un personaje válido antes de entrar.';return;}send({type:'secret_ready',ready:true});enterGame();});
// Intercepta el formulario NATIVO del juego: en modo cerebro envía respuestas; en modo descubridor envía preguntas.
on('questionForm','submit',e=>{if(!connected||!myRole)return;e.preventDefault();e.stopImmediatePropagation();const input=$('questionInput'),text=input.value.trim();if(!text)return;input.value='';if(myRole==='guess'){send({type:'question',name:saveName(),text,count:incrementCount()});gameMessage(text,'player');addMessage(saveName(),'Pregunta: '+text,'local');}else{if(!pendingQuestion){gameMessage('Esperá una pregunta de tu rival antes de responder.','system');return;}send({type:'answer',text});gameMessage('CEREBRO: '+text,'mind');addMessage('CEREBRO',text,'local');storeLearning(pendingQuestion,text);pendingQuestion='';$('brainQuestion').textContent='Respuesta enviada.';$('onlineQuestionBox').textContent='Respuesta enviada.';}},true);
on('classicPanel','click',e=>{if(!connected||myRole!=='brain')return;const b=e.target.closest('[data-ans]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(!pendingQuestion){gameMessage('Esperá una pregunta de tu rival.','system');return;}const text=labels[b.dataset.ans];send({type:'answer',text});gameMessage('CEREBRO: '+text,'mind');addMessage('CEREBRO',text,'local');storeLearning(pendingQuestion,text);pendingQuestion='';$('brainQuestion').textContent='Respuesta enviada: '+text;$('onlineQuestionBox').textContent='Respuesta enviada: '+text;},true);
on('confirmGuessBtn','click',e=>{if(!connected||myRole!=='guess')return;e.preventDefault();e.stopImmediatePropagation();const character=$('guessInput').value.trim();if(!character)return;send({type:'guess',character});gameMessage('Intentaste adivinar: '+character,'player');$('guessModal').classList.add('hidden');},true);
function incrementCount(){const el=$('questionsHud');const n=(parseInt(el.textContent,10)||0)+1;el.textContent=n+'/20';return n;}
function storeLearning(question,answer){try{const key='mind_duel_human_training';const rows=JSON.parse(localStorage.getItem(key)||'[]');rows.push({character:secret,question,answer,at:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(rows.slice(-500)));}catch{}}
function sendChat(input){const text=input.value.trim();if(!text)return;if(!conn||!conn.open){status('Todavía no hay conexión.');return;}const n=saveName();addMessage(n,text,'local');send({type:'chat',name:n,text});input.value='';$('chatUnread').classList.add('hidden');}
on('floatingChatForm','submit',e=>{e.preventDefault();sendChat($('floatingChatInput'));});// El chat del duelo se abre desde la burbuja flotante; no existe un formulario de chat fijo en el HTML.
on('chatBubbleBtn','click',()=>{$('floatingChat').classList.toggle('hidden');$('chatUnread').classList.add('hidden');if(!$('floatingChat').classList.contains('hidden'))$('floatingChatInput').focus();});on('floatingChatClose','click',()=>$('floatingChat').classList.add('hidden'));
// Botón flotante arrastrable: moverlo no abre/cierra el chat por accidente.
(function makeChatBubbleDraggable(){const b=$('chatBubbleBtn');if(!b)return;let sx=0,sy=0,ox=0,oy=0,moved=false,dragging=false;const down=e=>{if(e.button!==undefined&&e.button!==0)return;dragging=true;moved=false;const r=b.getBoundingClientRect();sx=e.clientX;sy=e.clientY;ox=r.left;oy=r.top;b.style.right='auto';b.style.bottom='auto';b.style.left=ox+'px';b.style.top=oy+'px';try{b.setPointerCapture(e.pointerId)}catch{};};const move=e=>{if(!dragging)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>6)moved=true;const x=Math.max(4,Math.min(window.innerWidth-b.offsetWidth-4,ox+dx));const y=Math.max(4,Math.min(window.innerHeight-b.offsetHeight-4,oy+dy));b.style.left=x+'px';b.style.top=y+'px';};const up=e=>{if(!dragging)return;dragging=false;if(moved){e.preventDefault();b.dataset.dragged='1';setTimeout(()=>delete b.dataset.dragged,250);}try{b.releasePointerCapture(e.pointerId)}catch{}};b.addEventListener('pointerdown',down);b.addEventListener('pointermove',move);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('click',e=>{if(b.dataset.dragged==='1'){e.preventDefault();e.stopImmediatePropagation();}},true);})();
on('duelWinBtn','click',()=>{send({type:'result',result:'win',name:saveName()});showResult(true,'Confirmaste la victoria',secret);});
on('duelLoseBtn','click',()=>{send({type:'result',result:'lose',name:saveName()});showResult(false,'Confirmaste la derrota',secret);});
on('closeDuelBtn','click',()=>{modal.classList.add('hidden');reset();document.body.classList.remove('duel-online');});if(modal)modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.add('hidden');reset();}});
})();
