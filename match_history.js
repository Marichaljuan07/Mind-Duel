(() => {
'use strict';
const KEY='mind_duel_match_history';
let current=null;
function read(){
  try {
    const value=JSON.parse(localStorage.getItem(KEY)||'[]');
    if(!Array.isArray(value)) return [];
    return value.filter(m=>m&&typeof m==='object'&&m.id&&m.startedAt&&Array.isArray(m.events));
  } catch { return []; }
}
function write(rows){try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-100)))}catch(e){console.warn('[MIND] No se pudo guardar el historial:',e)}}
function upsert(match){
  if(!match)return;
  const rows=read();
  const index=rows.findIndex(m=>m.id===match.id);
  if(index>=0)rows[index]=match;else rows.push(match);
  write(rows);
}
function begin(mode,meta={}){
  current={id:'match-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),mode,startedAt:new Date().toISOString(),endedAt:null,result:'En curso',status:'in_progress',meta,events:[]};
  record('Sistema','Partida iniciada');
  return current;
}
function record(speaker,text,kind='message'){
  if(!current)return;
  current.events.push({at:new Date().toISOString(),speaker:String(speaker||''),text:String(text||''),kind});
  if(current.events.length>1500)current.events.shift();
  // Persistir también las partidas en curso: si se abre Historial antes de terminar,
  // debe haber una opción seleccionable y los mensajes no se pierden al recargar.
  upsert(current);
}
function finish(result='Finalizada',meta={}){
  if(!current)return;
  current.endedAt=new Date().toISOString();current.result=result;current.status='finished';current.meta={...current.meta,...meta};
  upsert(current);
  const done=current;current=null;return done;
}
function getCurrent(){return current;}
function render(container,match){
  if(!container)return;
  container.textContent='';
  if(!match){container.textContent='Todavía no hay partidas guardadas. Terminá una partida y aparecerá acá.';return;}
  const head=document.createElement('div');head.className='history-summary';
  head.textContent=`${String(match.mode||'Partida').toUpperCase()} · ${match.result||'Finalizada'} · ${new Date(match.startedAt).toLocaleString()}${match.status==='in_progress'?' · EN CURSO':''}`;
  container.append(head);
  const events=Array.isArray(match.events)?match.events:[];
  if(!events.length){const empty=document.createElement('p');empty.textContent='La partida todavía no tiene intervenciones registradas.';container.append(empty);}
  events.forEach(ev=>{const row=document.createElement('div');row.className='history-event';const who=document.createElement('b');who.textContent=(ev.speaker||'Sistema')+': ';const msg=document.createElement('span');msg.textContent=String(ev.text||'');row.append(who,msg);container.append(row);});
}
function show(match){
  const modal=document.getElementById('matchHistoryModal'),body=document.getElementById('matchHistoryBody'),select=document.getElementById('historyMatchSelect');
  if(!modal||!body)return;
  const rows=read().slice().reverse();
  // Si hay una partida en curso que aún no quedó en storage por alguna restricción,
  // incluirla en la lista de esta apertura.
  if(current&&!rows.some(m=>m.id===current.id))rows.unshift(current);
  if(select){
    select.textContent='';
    if(rows.length){
      rows.forEach(m=>{const o=document.createElement('option');o.value=m.id;const date=new Date(m.startedAt).toLocaleString();o.textContent=`${date} · ${m.mode||'Partida'} · ${m.result||'Finalizada'}${m.status==='in_progress'?' (en curso)':''}`;select.append(o)});
    }else{const o=document.createElement('option');o.value='';o.textContent='Todavía no hay partidas guardadas';select.append(o);}
  }
  const selected=match||(current&&rows.find(m=>m.id===current.id))||rows[0]||null;
  render(body,selected);
  if(select&&selected)select.value=selected.id;
  modal.classList.remove('hidden');
}
function list(){return read();}
function clear(){current=null;try{localStorage.removeItem(KEY)}catch{}show();}
window.MatchHistory={begin,record,finish,getCurrent,show,list,clear};
document.addEventListener('click',e=>{
  if(e.target.closest('#viewMatchHistoryBtn')||e.target.closest('#viewClassicHistoryBtn')){e.preventDefault();show();}
  if(e.target.closest('#closeMatchHistoryBtn'))document.getElementById('matchHistoryModal')?.classList.add('hidden');
  if(e.target.closest('#clearMatchHistoryBtn')){if(window.confirm('¿Borrar todo el historial guardado? Esta acción no se puede deshacer.'))clear();}
});
document.addEventListener('change',e=>{
  if(e.target?.id==='historyMatchSelect'){
    const match=read().find(m=>m.id===e.target.value)||(current&&current.id===e.target.value?current:null);
    render(document.getElementById('matchHistoryBody'),match||null);
  }
});
})();
