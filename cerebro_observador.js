/* Mind Duel Fusion 3.13.86 — Observador local de partidas multijugador.
   Registra trazas para análisis posterior; no convierte respuestas humanas en hechos verificados. */
(() => {
'use strict';
const KEY='mind_duel_cerebro_observaciones_v1';
const MAX_MATCHES=100, MAX_EVENTS=500;
let active=null;
const safeRead=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.filter(v=>v&&v.id):[]}catch{return[]}};
const safeWrite=rows=>{try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-MAX_MATCHES)))}catch(e){console.warn('[Cerebro observador] No se pudo guardar el registro local.',e)}};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function persist(){if(!active)return;const rows=safeRead();const i=rows.findIndex(x=>x.id===active.id);if(i>=0)rows[i]=active;else rows.push(active);safeWrite(rows)}
function begin(mode,meta={}){if(String(mode||'').toLowerCase()!=='online')return;active={id:'obs-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),sourceMatchId:'',mode:'multijugador',startedAt:new Date().toISOString(),endedAt:null,status:'en_curso',result:'En curso',meta:{role:String(meta.rol||'').slice(0,20)},counts:{questions:0,answers:0,guesses:0,chatExcluded:0},events:[]};persist()}
function record(speaker,text,kind='message'){
 if(!active)return;
 const k=String(kind||'message'),who=String(speaker||'Sistema'),body=String(text||'').slice(0,500);
 if(k==='chat'){active.counts.chatExcluded++;return;}
 if(!body)return;
 let type='evento';const n=norm(who+' '+body);
 if(/adivinar|intenta adivinar|teoria|intento incorrecto|intentaste adivinar/.test(n)){type='intento';active.counts.guesses++;}
 else if(k==='mind'||/respuesta del cerebro|cerebro/.test(n)){type='respuesta';active.counts.answers++;}
 else if(k==='player'||/pregunta|pregunto|pregunta:/.test(n)){type='pregunta';active.counts.questions++;}
 else if(k==='result'||/victoria|derrota|finalizada|descubriste|agotaste/.test(n))type='resultado';
 active.events.push({at:new Date().toISOString(),type,speaker:who,text:body,kind:k});if(active.events.length>MAX_EVENTS)active.events.shift();persist();
}
function finish(result='Finalizada',meta={}){if(!active)return;active.endedAt=new Date().toISOString();active.status='terminada';active.result=String(result||'Finalizada');const character=String(meta.personaje||'').trim();if(character)active.meta.personaje_revelado_al_final=character;active.meta.nota='Observación local de una partida. Las respuestas de jugadores no son hechos verificados ni se incorporan automáticamente al conocimiento del Cerebro.';persist();active=null}
function list(){return safeRead().slice().reverse()}
function render(){
 let modal=document.getElementById('cerebroObserverModal');if(!modal){modal=document.createElement('div');modal.id='cerebroObserverModal';modal.className='modal hidden';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','cerebroObserverTitle');modal.innerHTML='<div class="modal-card history-card"><h2 id="cerebroObserverTitle">OBSERVADOR DEL CEREBRO</h2><p>El Cerebro registra localmente las partidas multijugador que ocurren en este navegador. No se envía información a un servidor compartido.</p><div id="cerebroObserverSummary" class="match-history-body"></div><div class="modal-actions"><button id="exportCerebroObservationsBtn" class="btn btn-green">EXPORTAR JSON</button><button id="closeCerebroObserverBtn" class="btn btn-purple">CERRAR</button></div></div>';document.body.append(modal);modal.querySelector('#closeCerebroObserverBtn').addEventListener('click',()=>modal.classList.add('hidden'));modal.querySelector('#exportCerebroObservationsBtn').addEventListener('click',exportJson)}
 const body=modal.querySelector('#cerebroObserverSummary');body.textContent='';const rows=list();
 if(!rows.length){const p=document.createElement('p');p.textContent='Todavía no hay partidas multijugador observadas. Cuando juegues una partida desde este navegador, se registrará automáticamente.';body.append(p)}
 rows.forEach(m=>{const section=document.createElement('section');section.className='history-event';const title=document.createElement('b');title.textContent=`${new Date(m.startedAt).toLocaleString()} · ${m.status==='en_curso'?'EN CURSO':m.result}`;section.append(title);const summary=document.createElement('p');summary.textContent=`Preguntas: ${m.counts.questions} · Respuestas: ${m.counts.answers} · Intentos: ${m.counts.guesses} · Eventos guardados: ${m.events.length}`;section.append(summary);if(m.meta?.personaje_revelado_al_final){const char=document.createElement('p');char.textContent='Personaje revelado al final: '+m.meta.personaje_revelado_al_final;section.append(char)}const note=document.createElement('p');note.textContent='Solo observación: las respuestas no se consideran conocimiento verificado.';section.append(note);const details=document.createElement('details');const sum=document.createElement('summary');sum.textContent='Ver eventos registrados';details.append(sum);m.events.forEach(ev=>{const line=document.createElement('div');line.className='history-event';const b=document.createElement('b');b.textContent=ev.type.toUpperCase()+' · '+ev.speaker+': ';const span=document.createElement('span');span.textContent=ev.text;line.append(b,span);details.append(line)});section.append(details);body.append(section)});
 modal.classList.remove('hidden')
}
function exportJson(){const blob=new Blob([JSON.stringify({schema:'mind-duel-observations-v1',exportedAt:new Date().toISOString(),note:'Observaciones locales; respuestas humanas no verificadas.',matches:list()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='mind-duel-observaciones-cerebro.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function install(){const api=window.MatchHistory;if(!api||api.__observerWrapped)return false;const oldBegin=api.begin,oldRecord=api.record,oldFinish=api.finish;api.begin=function(mode,meta){const result=oldBegin.apply(this,arguments);begin(mode,meta);if(active&&result)active.sourceMatchId=String(result.id||'');persist();return result};api.record=function(speaker,text,kind){const result=oldRecord.apply(this,arguments);record(speaker,text,kind);return result};api.finish=function(result,meta){const done=oldFinish.apply(this,arguments);finish(result,meta);return done};api.__observerWrapped=true;return true}
if(!install())document.addEventListener('DOMContentLoaded',install,{once:true});
document.addEventListener('click',e=>{if(e.target.closest('#openCerebroObserverBtn')){e.preventDefault();render()} });
window.CerebroObserver={list,show:render,exportJson};
})();
