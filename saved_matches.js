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
 try{const session=JSON.parse(localStorage.getItem(SESSION)||'null');if(session&&session.roomId&&session.myRole)save(session,session.libraryId||'current-online-'+String(session.startedAt||'unknown'));}catch{}
 try{const history=window.MatchHistory?.list?.()||[];for(const m of history){if(String(m.mode||'').toLowerCase()==='online'&&(m.status==='in_progress'||String(m.result||'').toLowerCase()==='en curso')&&m.meta?.onlineSession)save(m.meta.onlineSession,m.id);}}catch{}
 return read().sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0));
}
function label(item){const d=new Date(Number(item.startedAt)||Number(item.savedAt)||Date.now()).toLocaleString();const s=item.snapshot||{};const role=s.myRole==='brain'?'EL CEREBRO':s.myRole==='guess'?'DESCUBRIDOR':'ROL SIN DEFINIR';return `${d} · ${role}`}
function render(){const list=$('savedMatchesList');if(!list)return;list.textContent='';const rows=collect();if(!rows.length){const empty=document.createElement('div');empty.className='saved-library-empty';empty.textContent='Todavía no hay partidas completas guardadas en este dispositivo. Las partidas online se agregan a esta biblioteca mientras se guardan sus avances.';list.append(empty);return;}
 rows.forEach(item=>{const card=document.createElement('article');card.className='saved-match-card';const info=document.createElement('div');info.className='saved-match-info';const title=document.createElement('strong');title.textContent=item.mode+' · EN CURSO';const sub=document.createElement('span');sub.textContent=label(item);const details=document.createElement('small');details.textContent=`${Number(item.snapshot.questionCount)||0} preguntas · ${Number(item.snapshot.answerCount)||0} respuestas · ${Array.isArray(item.snapshot.transcript)?item.snapshot.transcript.length:0} mensajes guardados`;info.append(title,sub,details);const actions=document.createElement('div');actions.className='saved-match-actions';const restore=document.createElement('button');restore.type='button';restore.className='btn btn-green';restore.textContent='RECUPERAR MI LADO';restore.addEventListener('click',()=>{ $('savedMatchesModal')?.classList.add('hidden');window.dispatchEvent(new CustomEvent('mind:restore-history-online',{detail:{snapshot:item.snapshot,matchId:item.matchId||item.id}}));});actions.append(restore);card.append(info,actions);list.append(card);});
}
function open(){render();$('savedMatchesModal')?.classList.remove('hidden')}
document.addEventListener('click',e=>{if(e.target.closest('#restoreSavedDuelBtn')||e.target.closest('#openSavedMatchesBtn')){e.preventDefault();e.stopPropagation();open()}if(e.target.closest('#closeSavedMatchesBtn'))$('savedMatchesModal')?.classList.add('hidden')});
window.SavedMatches={save,open,render,list:collect};
})();
