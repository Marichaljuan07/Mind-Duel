(() => {
'use strict';
const KEY='mindduel_saved_matches_v1';
const SESSION='mindduel_online_session_v1';
const $=id=>document.getElementById(id);
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.filter(v=>v&&v.snapshot&&typeof v.snapshot==='object'):[]}catch{return[]}}
function write(rows){try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-100)))}catch(e){console.warn('[MIND] No se pudo guardar la biblioteca:',e)}}
function save(snapshot,matchId=''){
 if(!snapshot||!snapshot.roomId||!snapshot.myRole)return;
 const rows=read();const id=String(snapshot.libraryId||('online-'+String(snapshot.startedAt||snapshot.savedAt||Date.now())+'-'+String(snapshot.myRole)));
 const item={id,matchId:String(matchId||snapshot.matchId||''),mode:'ONLINE',status:'in_progress',savedAt:Number(snapshot.savedAt)||Date.now(),startedAt:Number(snapshot.startedAt)||Date.now(),snapshot:{...snapshot,libraryId:id,matchId:String(matchId||snapshot.matchId||'')}};
 const i=rows.findIndex(x=>x.id===id);if(i>=0)rows[i]=item;else rows.push(item);write(rows);
}
function collect(){
 const rows=read();
 let session=null;try{session=JSON.parse(localStorage.getItem(SESSION)||'null');if(!(session&&session.roomId&&session.myRole))session=null;}catch{}
 if(session)save(session,session.matchId||session.libraryId||'current-online-'+String(session.startedAt||'unknown'));
 // La biblioteca también muestra partidas ONLINE en curso que existen en el historial,
 // aunque el snapshot completo no haya quedado adjunto. No inventamos datos de recuperación.
 try{
  const history=window.MatchHistory?.list?.()||[];
  for(const m of history){
   const online=String(m.mode||'').toLowerCase()==='online';
   const inProgress=m.status==='in_progress'||String(m.result||'').toLowerCase()==='en curso';
   if(!online||!inProgress)continue;
   const snap=m.meta?.onlineSession||(session&&(!session.matchId||session.matchId===m.id)?session:null);
   const id='history-'+String(m.id);
   // Las versiones anteriores guardaban el registro de mensajes pero no el estado de sesión.
   // Reconstruimos una copia local utilizable como recuperación offline a partir de ese registro.
   let rebuilt=null;
   if(!snap && Array.isArray(m.events) && m.events.length){
    const brainEvents=m.events.some(ev=>/^(CEREBRO|Juan)$/i.test(String(ev.speaker||'')));
    const role=brainEvents?'brain':'guess';
    const transcript=m.events.map(ev=>({text:String(ev.text||''),kind:/^(CEREBRO)$/i.test(String(ev.speaker||''))?'mind':/^(JUGADOR|Juan|Milton)$/i.test(String(ev.speaker||''))?'player':'system'})).slice(-500);
    const questions=m.events.filter(ev=>/pregunta:/i.test(String(ev.text||''))).length;
    const answers=m.events.filter(ev=>/^(CEREBRO|Juan)$/i.test(String(ev.speaker||'')) && !/Partida iniciada|Personaje elegido/i.test(String(ev.text||''))).length;
    rebuilt={version:1,host:true,roomId:'history-recovery-'+String(m.id),localPeerId:'',remotePlayerPeerId:'',myRole:role,theirRole:role==='brain'?'guess':'brain',secret:'',startedAt:Date.parse(m.startedAt)||Date.now(),questionCount:questions,answerCount:answers,guessesLeft:2,pendingQuestion:'',waitingForAnswer:false,waitingForGuess:false,pendingOnlineGuess:'',lastQuestion:'',lastAnswer:'',transcript,savedAt:Date.now(),inGame:true,reconstructedFromHistory:true,historyId:m.id};
   }
   const effective=snap||rebuilt;
   const item={id,matchId:String(m.id),mode:'ONLINE',status:'in_progress',savedAt:Date.parse(m.startedAt)||Date.now(),startedAt:Date.parse(m.startedAt)||Date.now(),historyOnly:!effective,reconstructed:!snap&&!!rebuilt,snapshot:effective||{historyId:m.id,startedAt:Date.parse(m.startedAt)||Date.now(),myRole:''}};
   const at=rows.findIndex(x=>x.id===id);if(at>=0)rows[at]=item;else rows.push(item);
  }
 }catch{}
 // Mezclar con lo guardado persistentemente; no escribir filas de historial incompletas como snapshots.
 const unique=new Map();for(const r of [...read(),...rows])unique.set(r.id,r);
 return [...unique.values()].sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0));
}
function label(item){const d=new Date(Number(item.startedAt)||Number(item.savedAt)||Date.now()).toLocaleString();const s=item.snapshot||{};const role=s.myRole==='brain'?'EL CEREBRO':s.myRole==='guess'?'DESCUBRIDOR':'ROL SIN DEFINIR';return `${d} · ${role}`}
function notice(msg){const el=$('savedMatchesNotice');if(el)el.textContent=msg||''}
function downloadBackup(item){const payload={format:'mind-duel-fusion-save',version:1,exportedAt:new Date().toISOString(),match:{...item}};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=(String(item.name||'Mind_Duel_partida').replace(/[^a-z0-9_-]+/gi,'_'))+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Respaldo preparado. Compartilo con el otro jugador si querés importar su perspectiva.')}
function normalizeImported(data){let item=data?.match||data?.savedMatch||data?.item||data?.snapshot||data;if(item?.snapshot&&typeof item.snapshot==='object'){}else if(item&&item.roomId&&item.myRole)item={id:'import-'+Date.now(),mode:'ONLINE',status:'in_progress',startedAt:item.startedAt||Date.now(),savedAt:Date.now(),snapshot:item};else if(item&&item.session&&item.session.roomId)item={id:'import-'+Date.now(),mode:'ONLINE',status:'in_progress',startedAt:item.session.startedAt||Date.now(),savedAt:Date.now(),snapshot:item.session};else throw new Error('El archivo no contiene una partida o sesión reconocible.');const snap=item.snapshot;if(!snap||typeof snap!=='object'||!Array.isArray(snap.transcript)&&!snap.roomId&&!snap.historyId)throw new Error('El guardado no contiene conversación ni estado de partida reconocible.');const id='import-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);return {id,matchId:String(item.matchId||snap.matchId||''),name:String(item.name||snap.matchName||'Partida importada'),mode:String(item.mode||'ONLINE').toUpperCase(),status:item.status||'in_progress',savedAt:Date.now(),startedAt:Number(item.startedAt||snap.startedAt)||Date.now(),imported:true,snapshot:{...snap,libraryId:id,importedCopy:true,importedAt:Date.now()}}}
async function importFile(file){if(!file)return;try{const data=JSON.parse(await file.text());const item=normalizeImported(data);const rows=read();rows.push(item);write(rows);notice('Guardado importado. Se añadió como copia independiente con el rol y los datos que contiene el archivo.');render();}catch(e){notice('No se pudo importar: '+(e?.message||'archivo inválido'));}finally{const input=$('savedMatchImportFile');if(input)input.value='';}}
function render(){const list=$('savedMatchesList');if(!list)return;list.textContent='';const rows=collect();if(!rows.length){const empty=document.createElement('div');empty.className='saved-library-empty';empty.textContent='Todavía no hay partidas guardadas. Podés importar un respaldo JSON o jugar una partida nueva.';list.append(empty);return;}
 rows.forEach(item=>{const card=document.createElement('article');card.className='saved-match-card';const info=document.createElement('div');info.className='saved-match-info';const title=document.createElement('strong');title.textContent=(item.mode||'ONLINE')+' · '+(item.status==='completed'?'FINALIZADA':'EN CURSO');const sub=document.createElement('span');sub.textContent=(item.name?item.name+' · ':'')+label(item);const details=document.createElement('small');const s=item.snapshot||{};const role=s.myRole==='brain'?'Cerebro':s.myRole==='guess'?'Descubridor':'rol no identificado';const counts=`${Number(s.questionCount)||0} preguntas · ${Number(s.answerCount)||0} respuestas · ${Array.isArray(s.transcript)?s.transcript.length:0} mensajes`;details.textContent=item.historyOnly?'Solo existe un registro parcial del historial; no se puede reconstruir el estado online completo.':item.reconstructed?'Reconstruida desde el historial: permite revisar los mensajes guardados; la reconexión no está garantizada.':`${role} · ${counts}${item.imported?' · RESPALDO IMPORTADO':''}`;info.append(title,sub,details);const actions=document.createElement('div');actions.className='saved-match-actions saved-match-actions-multi';const restore=document.createElement('button');restore.type='button';restore.className='btn btn-green';restore.textContent=item.historyOnly?'VER HISTORIAL':item.reconstructed?'RECUPERAR DESDE HISTORIAL':'▶ CONTINUAR PARTIDA';restore.addEventListener('click',()=>{ $('savedMatchesModal')?.classList.add('hidden');window.dispatchEvent(new CustomEvent('mind:restore-history-online',{detail:{snapshot:item.snapshot,matchId:item.matchId||item.id}}));});const rename=document.createElement('button');rename.type='button';rename.className='btn btn-purple';rename.textContent='✏ RENOMBRAR';rename.addEventListener('click',()=>{const name=prompt('Nombre para esta partida:',item.name||'Partida online');if(name===null)return;const all=read();const ix=all.findIndex(x=>x.id===item.id);if(ix>=0){all[ix].name=name.trim()||'Partida sin nombre';write(all);notice('Nombre actualizado.');render();}else notice('Esta partida viene del historial y no admite renombrado desde aquí.');});const backup=document.createElement('button');backup.type='button';backup.className='btn btn-purple';backup.textContent='📤 RESPALDO';backup.addEventListener('click',()=>downloadBackup(item));const del=document.createElement('button');del.type='button';del.className='btn btn-red';del.textContent='🗑 ELIMINAR';del.addEventListener('click',()=>{if(!confirm('¿Eliminar esta copia de la biblioteca? No se borrará el historial general.'))return;const all=read().filter(x=>x.id!==item.id);write(all);notice('Copia eliminada de la biblioteca.');render();});actions.append(restore,rename,backup,del);card.append(info,actions);list.append(card);});}
function open(){notice('');render();$('savedMatchesModal')?.classList.remove('hidden')}
document.addEventListener('click',e=>{if(e.target.closest('#restoreSavedDuelBtn')||e.target.closest('#openSavedMatchesBtn')){e.preventDefault();e.stopPropagation();open()}if(e.target.closest('#closeSavedMatchesBtn'))$('savedMatchesModal')?.classList.add('hidden');if(e.target.closest('#importSavedMatchBtn'))$('savedMatchImportFile')?.click()});
$('savedMatchImportFile')?.addEventListener('change',e=>importFile(e.target.files?.[0]));
window.SavedMatches={save,open,render,list:collect,importFile};
})();
