/* MIND DUEL FUSION 3.13.87 — registro persistente y comprobable del aprendizaje local.
   Conserva resultados y lagunas; los hechos de jugadores siguen sujetos a validación por MindKnowledge. */
(() => {
'use strict';
const KEY='mind_duel_aprendizaje_persistente_v1', GAP_KEY='mind_duel_lagunas_aprendizaje_v1', MAP_KEY='mind_duel_preguntas_aprendidas_v1';
const MAX_GAMES=200, MAX_GAPS=500;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function read(key){try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function registrarPartida(data={}){
 const row={id:'learn-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),fecha:new Date().toISOString(),modo:String(data.modo||'desconocido'),resultado:String(data.resultado||'finalizada'),personaje:String(data.personaje||''),intentos:Number(data.intentos)||0,preguntasTotales:Number(data.preguntasTotales)||((Array.isArray(data.preguntas)?data.preguntas.length:0)),preguntas:Array.isArray(data.preguntas)?data.preguntas.slice(0,100).map(x=>({texto:String(x?.q??x?.texto??''),respuesta:String(x?.a??(typeof x?.answer==='boolean'?(x.answer?'si':'no'):'')).slice(0,20)})).filter(x=>x.texto):[]};
 const rows=read(KEY);rows.push(row);write(KEY,rows.slice(-MAX_GAMES));return row;
}
function registrarLaguna(pregunta,personaje=''){
 const q=String(pregunta||'').trim();if(!q)return;
 const rows=read(GAP_KEY),key=norm(q),existing=rows.find(x=>norm(x.pregunta)===key);
 if(existing){existing.veces=(Number(existing.veces)||1)+1;existing.ultimaVez=new Date().toISOString();if(personaje&&!existing.personajes.includes(personaje))existing.personajes.push(String(personaje).slice(0,100));}
 else rows.push({pregunta:q,veces:1,primeraVez:new Date().toISOString(),ultimaVez:new Date().toISOString(),personajes:personaje?[String(personaje).slice(0,100)]:[],estado:'pendiente'});
 write(GAP_KEY,rows.slice(-MAX_GAPS));
}
function readMaps(){try{const x=JSON.parse(localStorage.getItem(MAP_KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return{}}}
function guardarMapeo(pregunta,concepto){const q=String(pregunta||'').trim(),c=String(concepto||'').trim();if(!q||!c||!(window.MindKnowledge?.QUESTIONS||[]).some(x=>x.concepto===c))return false;const maps=readMaps();maps[norm(q)]={pregunta:q,concepto:c,aprendidoEn:new Date().toISOString()};if(!write(MAP_KEY,maps))return false;const gaps=read(GAP_KEY),g=gaps.find(x=>norm(x.pregunta)===norm(q));if(g){g.estado='mapeada';g.concepto=c;write(GAP_KEY,gaps)}return true}
function resolverPregunta(pregunta){const row=readMaps()[norm(pregunta)];return row?.concepto||null}
function estado(){
 const games=read(KEY),gaps=read(GAP_KEY);let tentative=0,confirmed=0;
 if(window.MindKnowledge){for(const game of games){for(const fact of game.preguntas||[]){const concept=window.MindKnowledge.conceptoDePregunta(fact.texto);if(!concept)continue;const st=window.MindKnowledge.estado(game.personaje,concept);if(st?.confidence==='confirmed')confirmed++;else if(st?.confidence==='tentative')tentative++;}}}
 return {games,gaps,stats:{partidas:games.length,lagunas:gaps.length,lagunasRepetidas:gaps.filter(x=>(x.veces||0)>1).length,evidenciasTentativas:tentative,evidenciasConfirmadas:confirmed}};
}
function exportar(){const payload={schema:'mind-duel-aprendizaje-persistente-v1',exportado:new Date().toISOString(),nota:'Registro local. Las lagunas son preguntas sin respuesta; las respuestas de jugadores no se consideran hechos confirmados hasta superar la validación de MindKnowledge.',...estado(),conocimiento:window.MindKnowledge?.exportar?.()||null};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='mind-duel-aprendizaje-persistente.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function render(){
 let modal=document.getElementById('cerebroLearningModal');
 if(!modal){modal=document.createElement('div');modal.id='cerebroLearningModal';modal.className='modal hidden';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','cerebroLearningTitle');modal.innerHTML='<div class="modal-card history-card"><h2 id="cerebroLearningTitle">APRENDIZAJE PERSISTENTE</h2><p>Registro local entre partidas. Las preguntas sin respuesta quedan como lagunas pendientes; las respuestas aportadas por jugadores no se convierten automáticamente en hechos. El conocimiento confirmado usa el sistema de evidencia de MindKnowledge.</p><div id="cerebroLearningSummary" class="match-history-body"></div><div class="modal-actions"><button id="exportCerebroLearningBtn" class="btn btn-green">EXPORTAR APRENDIZAJE</button><button id="closeCerebroLearningBtn" class="btn btn-purple">CERRAR</button></div></div>';document.body.append(modal);modal.querySelector('#closeCerebroLearningBtn').addEventListener('click',()=>modal.classList.add('hidden'));modal.querySelector('#exportCerebroLearningBtn').addEventListener('click',exportar)}
 const body=modal.querySelector('#cerebroLearningSummary');body.textContent='';const d=estado();
 const summary=document.createElement('p');summary.textContent=`Partidas registradas: ${d.stats.partidas} · Preguntas pendientes: ${d.stats.lagunas} · Preguntas repetidas: ${d.stats.lagunasRepetidas} · Evidencias tentativas: ${d.stats.evidenciasTentativas} · Evidencias confirmadas: ${d.stats.evidenciasConfirmadas}`;body.append(summary);
 const h=document.createElement('h3');h.textContent='PREGUNTAS QUE EL CEREBRO NO SUPO RESPONDER';body.append(h);
 if(!d.gaps.length){const p=document.createElement('p');p.textContent='Todavía no hay lagunas registradas. En modo Solo, cuando el Cerebro no pueda responder una pregunta, se guardará aquí para análisis posterior.';body.append(p)}
 d.gaps.slice().sort((a,b)=>(b.veces||0)-(a.veces||0)).slice(0,40).forEach((g,i)=>{const item=document.createElement('section');item.className='history-event';const title=document.createElement('b');title.textContent=`${g.pregunta} · ${g.veces||1} vez/veces`;const note=document.createElement('p');note.textContent=`Estado: ${g.estado||'pendiente'} · Personajes asociados: ${(g.personajes||[]).join(', ')||'sin registrar'}`;item.append(title,note);if((g.estado||'')!=='mapeada'&&window.MindKnowledge?.QUESTIONS?.length){const select=document.createElement('select');select.className='history-select';select.setAttribute('aria-label','Concepto que corresponde a esta pregunta');const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Elegí el concepto que significa esta pregunta';select.append(placeholder);window.MindKnowledge.QUESTIONS.forEach(q=>{const op=document.createElement('option');op.value=q.concepto;op.textContent=q.pregunta;select.append(op)});const btn=document.createElement('button');btn.type='button';btn.className='btn btn-green';btn.textContent='APRENDER ESTA PREGUNTA';btn.dataset.learnQuestion=g.pregunta;btn.addEventListener('click',()=>{if(guardarMapeo(g.pregunta,select.value))render()});item.append(select,btn)}else if(g.concepto){const learned=document.createElement('p');learned.textContent='Forma aprendida: '+(window.MindKnowledge?.QUESTIONS||[]).find(q=>q.concepto===g.concepto)?.pregunta;item.append(learned)}body.append(item)});
 const h2=document.createElement('h3');h2.textContent='PARTIDAS RECIENTES';body.append(h2);
 if(!d.games.length){const p=document.createElement('p');p.textContent='Todavía no hay partidas Solo o Clásico registradas en este ciclo.';body.append(p)}
 d.games.slice().reverse().slice(0,20).forEach(g=>{const item=document.createElement('section');item.className='history-event';const title=document.createElement('b');title.textContent=`${g.modo.toUpperCase()} · ${g.resultado.toUpperCase()} · ${g.personaje||'personaje sin identificar'}`;const note=document.createElement('p');note.textContent=`${new Date(g.fecha).toLocaleString()} · Preguntas guardadas: ${g.preguntasTotales} · Intentos fallidos: ${g.intentos}`;item.append(title,note);body.append(item)});
 modal.classList.remove('hidden');
}
document.addEventListener('click',e=>{if(e.target.closest('#openCerebroLearningBtn')){e.preventDefault();render()}});
window.CerebroAprendizaje={registrarPartida,registrarLaguna,guardarMapeo,resolverPregunta,estado,exportar,show:render};
})();
