(() => {
'use strict';
const KEY='mind_duel_match_history';
let current=null;
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
function write(rows){try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-100)))}catch{}}
function begin(mode,meta={}){current={id:'match-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),mode,startedAt:new Date().toISOString(),endedAt:null,result:'En curso',meta,events:[]};record('Sistema','Partida iniciada');return current;}
function record(speaker,text,kind='message'){if(!current)return;current.events.push({at:new Date().toISOString(),speaker:String(speaker||''),text:String(text||''),kind});if(current.events.length>1500)current.events.shift();}
function finish(result='Finalizada',meta={}){if(!current)return;current.endedAt=new Date().toISOString();current.result=result;current.meta={...current.meta,...meta};const rows=read();rows.push(current);write(rows);const done=current;current=null;return done;}
function getCurrent(){return current;}
function render(container,match){container.textContent='';if(!match){container.textContent='No hay un registro de partida disponible.';return;}const head=document.createElement('div');head.className='history-summary';head.textContent=`${String(match.mode||'Partida').toUpperCase()} · ${match.result||'Finalizada'} · ${new Date(match.startedAt).toLocaleString()}`;container.append(head);(match.events||[]).forEach(ev=>{const row=document.createElement('div');row.className='history-event';const who=document.createElement('b');who.textContent=(ev.speaker||'Sistema')+': ';const msg=document.createElement('span');msg.textContent=ev.text;row.append(who,msg);container.append(row);});}
function show(match){const modal=document.getElementById('matchHistoryModal'),body=document.getElementById('matchHistoryBody'),select=document.getElementById('historyMatchSelect');if(!modal||!body)return;const rows=read().slice().reverse();if(select){select.textContent='';rows.forEach((m,i)=>{const o=document.createElement('option');o.value=m.id;o.textContent=`${new Date(m.startedAt).toLocaleString()} · ${m.mode} · ${m.result}`;select.append(o)});if(!rows.length){const o=document.createElement('option');o.value='';o.textContent='Todavía no hay partidas guardadas';select.append(o)}}const selected=match||rows[0]||current;render(body,selected);if(select&&selected)select.value=selected.id;modal.classList.remove('hidden');}
function list(){return read();}
window.MatchHistory={begin,record,finish,getCurrent,show,list};
document.addEventListener('click',e=>{if(e.target.closest('#viewMatchHistoryBtn')||e.target.closest('#viewClassicHistoryBtn')){e.preventDefault();show();}if(e.target.closest('#closeMatchHistoryBtn'))document.getElementById('matchHistoryModal')?.classList.add('hidden');});document.addEventListener('change',e=>{if(e.target?.id==='historyMatchSelect'){const match=read().find(m=>m.id===e.target.value);render(document.getElementById('matchHistoryBody'),match);}});
})();
