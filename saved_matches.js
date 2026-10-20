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
   const existing=rows.find(x=>x.id===id);
   const item={id,matchId:String(m.id),mode:'ONLINE',status:'in_progress',savedAt:Date.parse(m.startedAt)||Date.now(),startedAt:Date.parse(m.startedAt)||Date.now(),historyOnly:!snap,snapshot:snap||{historyId:m.id,startedAt:Date.parse(m.startedAt)||Date.now(),myRole:''}};
   const at=rows.findIndex(x=>x.id===id);if(at>=0)rows[at]=item;else rows.push(item);
  }
 }catch{}
 // Mezclar con lo guardado persistentemente; no escribir filas de historial incompletas como snapshots.
 const unique=new Map();for(const r of [...read(),...rows])unique.set(r.id,r);
 return [...unique.values()].sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0));
}
function label(item){const d=new Date(Number(item.startedAt)||Number(item.savedAt)||Date.now()).toLocaleString();const s=item.snapshot||{};const role=s.myRole==='brain'?'EL CEREBRO':s.myRole==='guess'?'DESCUBRIDOR':'ROL SIN DEFINIR';return `${d} · ${role}`}
function render(){const list=$('savedMatchesList');if(!list)return;list.textContent='';const rows=collect();if(!rows.length){const empty=document.createElement('div');empty.className='saved-library-empty';empty.textContent='No hay partidas online en curso en el historial ni sesiones guardadas en este dispositivo.';list.append(empty);return;}
 rows.forEach(item=>{const card=document.createElement('article');card.className='saved-match-card';const info=document.createElement('div');info.className='saved-match-info';const title=document.createElement('strong');title.textContent=item.mode+' · EN CURSO';const sub=document.createElement('span');sub.textContent=label(item);const details=document.createElement('small');details.textContent=item.historyOnly?'Figura en el historial, pero no tiene una copia completa para reconstruir tu lado en este dispositivo.':`${Number(item.snapshot.questionCount)||0} preguntas · ${Number(item.snapshot.answerCount)||0} respuestas · ${Array.isArray(item.snapshot.transcript)?item.snapshot.transcript.length:0} mensajes guardados`;info.append(title,sub,details);const actions=document.createElement('div');actions.className='saved-match-actions';const restore=document.createElement('button');restore.type='button';restore.className='btn btn-green';restore.textContent=item.historyOnly?'BUSCAR COPIA LOCAL':'RECUPERAR MI LADO';restore.addEventListener('click',()=>{ $('savedMatchesModal')?.classList.add('hidden');window.dispatchEvent(new CustomEvent('mind:restore-history-online',{detail:{snapshot:item.snapshot,matchId:item.matchId||item.id}}));});actions.append(restore);card.append(info,actions);list.append(card);});
}
function open(){render();$('savedMatchesModal')?.classList.remove('hidden')}
document.addEventListener('click',e=>{if(e.target.closest('#restoreSavedDuelBtn')||e.target.closest('#openSavedMatchesBtn')){e.preventDefault();e.stopPropagation();open()}if(e.target.closest('#closeSavedMatchesBtn'))$('savedMatchesModal')?.classList.add('hidden')});
window.SavedMatches={save,open,render,list:collect};
})();
