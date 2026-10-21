(() => {
'use strict';
const KEY='mindduel_saved_matches_v1';
const SESSION='mindduel_online_session_v1';
const $=id=>document.getElementById(id);
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.filter(v=>v&&v.snapshot&&typeof v.snapshot==='object'):[]}catch{return[]}}
function write(rows){try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-100)))}catch(e){console.warn('[MIND] No se pudo guardar la biblioteca:',e)}}
function save(snapshot,matchId=''){
 if(!snapshot||!snapshot.startedAt||!snapshot.myRole)return;
 const id=String(snapshot.libraryId||('online-'+String(snapshot.startedAt)+'-'+String(snapshot.myRole)));
 const rows=read();const old=rows.find(x=>x.id===id);
 const matchStatus=(old?.status==='completed'||snapshot.status==='completed')?'completed':'in_progress';
 const item={...(old||{}),id,matchId:String(matchId||snapshot.matchId||old?.matchId||''),mode:'ONLINE',status:matchStatus,savedAt:Number(snapshot.savedAt)||Date.now(),startedAt:Number(snapshot.startedAt)||Date.now(),name:old?.name||snapshot.matchName||'',snapshot:{...(old?.snapshot||{}),...snapshot,libraryId:id,matchId:String(matchId||snapshot.matchId||old?.matchId||''),...(matchStatus==='completed'?{status:'completed',completedAt:old?.completedAt||snapshot.completedAt,finalResult:old?.snapshot?.finalResult||snapshot.finalResult||'',finalTitle:old?.snapshot?.finalTitle||snapshot.finalTitle||'',finalCharacter:old?.snapshot?.finalCharacter||snapshot.finalCharacter||''}: {})}};
 const i=rows.findIndex(x=>x.id===id);if(i>=0)rows[i]=item;else rows.push(item);write(rows);return item;
}
function collect(){
 const rows=read();let session=null;try{session=JSON.parse(localStorage.getItem(SESSION)||'null')}catch{}
 if(session&&session.startedAt&&session.myRole&&session.status!=='completed')save(session,session.matchId||'');
 return read().sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0));
}
function markCompleted(result={}){
 let snapshot=null;try{snapshot=JSON.parse(localStorage.getItem(SESSION)||'null')}catch{}
 if(!snapshot||!snapshot.startedAt||!snapshot.myRole)return false;
 const rows=read();
 const libraryId=String(snapshot.libraryId||'');
 const matchId=String(snapshot.matchId||'');
 let index=libraryId?rows.findIndex(x=>x.id===libraryId):-1;
 if(index<0&&matchId)index=rows.findIndex(x=>String(x.matchId||x.snapshot?.matchId||'')===matchId&&Number(x.startedAt)===Number(snapshot.startedAt)&&String(x.snapshot?.myRole||'')===String(snapshot.myRole));
 if(index<0){const fallback='online-'+String(snapshot.startedAt)+'-'+String(snapshot.myRole);index=rows.findIndex(x=>x.id===fallback);}
 const completedAt=Date.now();
 if(index<0){
  const id=libraryId||('online-'+String(snapshot.startedAt)+'-'+String(snapshot.myRole));
  rows.push({id,matchId,mode:'ONLINE',status:'completed',savedAt:completedAt,completedAt,startedAt:Number(snapshot.startedAt),name:snapshot.matchName||'',snapshot:{...snapshot,libraryId:id,matchId,status:'completed',completedAt,finalResult:String(result.result||''),finalTitle:String(result.title||''),finalCharacter:String(result.character||snapshot.secret||'')}});
 }else{
  const item=rows[index];item.status='completed';item.completedAt=completedAt;item.savedAt=completedAt;
  item.snapshot={...(item.snapshot||{}),...snapshot,libraryId:item.id,matchId:String(item.matchId||matchId),status:'completed',completedAt,finalResult:String(result.result||''),finalTitle:String(result.title||''),finalCharacter:String(result.character||snapshot.secret||'')};
 }
 write(rows);return true;
}
function label(item){const d=new Date(Number(item.startedAt)||Number(item.savedAt)||Date.now()).toLocaleString();const s=item.snapshot||{};const role=s.myRole==='brain'?'EL CEREBRO':s.myRole==='guess'?'DESCUBRIDOR':'ROL SIN DEFINIR';return `${d} · ${role}`}
function notice(msg){const el=$('savedMatchesNotice');if(el)el.textContent=msg||''}
function sPlayerName(snapshot){return String(snapshot?.playerName||'').trim()}
function render(){const list=$('savedMatchesList');if(!list)return;list.textContent='';const rows=collect();const heading=$('savedMatchesTitle');if(heading)heading.textContent='PARTIDAS GUARDADAS · '+rows.length;if(!rows.length){const empty=document.createElement('div');empty.className='saved-library-empty';empty.textContent='Todavía no hay partidas guardadas. Cuando crees o te unas a una partida online, se guardará automáticamente en este dispositivo.';list.append(empty);return;}
 rows.forEach(item=>{const card=document.createElement('article');card.className='saved-match-card';const info=document.createElement('div');info.className='saved-match-info';const title=document.createElement('strong');title.textContent=(item.name||((sPlayerName(item.snapshot)||'PARTIDA ONLINE')+' · PARTIDA'))+' · '+(item.status==='completed'?'COMPLETADA':'EN CURSO');const sub=document.createElement('span');sub.textContent=(item.name?item.name+' · ':'')+label(item);const details=document.createElement('small');const s=item.snapshot||{};const role=s.myRole==='brain'?'Cerebro':s.myRole==='guess'?'Descubridor':'rol no identificado';const visibleCharacter=(item.status==='completed'&&s.finalCharacter)?s.finalCharacter:(s.myRole==='brain'?s.secret:'');const character=visibleCharacter?' · Personaje: '+visibleCharacter:'';const finalResult=item.status==='completed'&&s.finalTitle?' · Resultado: '+s.finalTitle:'';const counts=`${Number(s.questionCount)||0} preguntas realizadas · ${Number(s.answerCount)||0} respuestas · ${Array.isArray(s.transcript)?s.transcript.length:0} mensajes de partida`;const phoneCount=Array.isArray(s.phoneTranscript)?s.phoneTranscript.length:0;const elapsed=Math.max(0,Number(s.elapsedSeconds)||0);const elapsedLabel=String(Math.floor(elapsed/60)).padStart(2,'0')+':'+String(Math.floor(elapsed%60)).padStart(2,'0');details.textContent=`Rol: ${role}${character} · ${counts} · Chat del teléfono: ${phoneCount} mensajes · Tiempo: ${elapsedLabel}${finalResult}${s.playerName?' · Jugador: '+s.playerName:''}`;info.append(title,sub,details);const actions=document.createElement('div');actions.className='saved-match-actions saved-match-actions-multi';const restore=document.createElement('button');restore.type='button';restore.className='btn btn-green';restore.textContent='↻ RESTAURAR PARTIDA';restore.addEventListener('click',()=>{$('savedMatchesModal')?.classList.add('hidden');window.dispatchEvent(new CustomEvent('mind:restore-saved-online',{detail:{snapshot:item.snapshot,matchId:item.matchId||item.id}}));});const rename=document.createElement('button');rename.type='button';rename.className='btn btn-purple';rename.textContent='✏ RENOMBRAR';rename.addEventListener('click',()=>{const name=prompt('Nombre para esta partida:',item.name||'Partida online');if(name===null)return;const all=read();const ix=all.findIndex(x=>x.id===item.id);if(ix>=0){all[ix].name=name.trim()||'Partida online';write(all);notice('Nombre actualizado.');render();}});const del=document.createElement('button');del.type='button';del.className='btn btn-red';del.textContent='🗑 ELIMINAR';del.addEventListener('click',()=>{if(!confirm('¿Eliminar esta partida de la biblioteca?'))return;write(read().filter(x=>x.id!==item.id));notice('Partida eliminada de la biblioteca.');render();});actions.append(restore,rename,del);card.append(info,actions);list.append(card);});}
function open(){notice('');render();$('savedMatchesModal')?.classList.remove('hidden')}
document.addEventListener('click',e=>{if(e.target.closest('#restoreSavedDuelBtn')||e.target.closest('#openSavedMatchesBtn')){e.preventDefault();e.stopPropagation();open()}if(e.target.closest('#closeSavedMatchesBtn'))$('savedMatchesModal')?.classList.add('hidden')});
window.SavedMatches={save,open,render,list:collect,markCompleted};
})();
