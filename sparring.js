/* Mind Duel Fusion — sparring estratégico oculto (v3.13.64). */
(function(){
'use strict';
const sessions=new Map();
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function start(mode){const key=String(mode||'solo').toLowerCase();const row={mode:key,startedAt:Date.now(),events:[],questions:new Map(),unknown:0,repeated:0,contradictions:0,lowInformation:0,highInformation:0,guesses:0,notes:[]};sessions.set(key,row);return row;}
function current(mode){const key=String(mode||'solo').toLowerCase();return sessions.get(key)||start(key);}
function question(mode,q,opts={}){
 const s=current(mode),k=norm(q);if(!k)return;
 const prior=s.questions.get(k)||0;s.questions.set(k,prior+1);if(prior){s.repeated++;s.notes.push({type:'repeated_question',text:String(q),turn:s.events.length+1});}
 let info=null;
 if(Array.isArray(opts.candidates)&&opts.candidates.length){let yes=0,no=0,unknown=0;for(const c of opts.candidates){if(!c)continue;const rawWeight=Number(c.weight);const weight=Number.isFinite(rawWeight)?Math.max(0,rawWeight):1;if(weight<=0)continue;if(c.value===null||typeof c.value==='undefined')unknown+=weight;else if(c.value)yes+=weight;else no+=weight;}const known=yes+no;info=known?1-Math.abs(yes-no)/known:0;if(known/(known+unknown||1)<.58)s.unknown++;if(info<.2)s.lowInformation++;else if(info>.65)s.highInformation++;}
 const event={type:'question',q:String(q),turn:s.events.length+1,coverage:info===null?null:Number(info.toFixed(3)),at:Date.now()};s.events.push(event);return event;
}
function answer(mode,q,a,opts={}){const s=current(mode);const value=(a===true||a==='si'||a==='sí')?'yes':(a===false||a==='no')?'no':'unknown';if(value==='unknown')s.unknown++;s.events.push({type:'answer',q:String(q||''),answer:value,source:opts.source||'player',at:Date.now()});}
function guess(mode,name,correct){const s=current(mode);s.guesses++;s.events.push({type:'guess',name:String(name||''),correct:typeof correct==='boolean'?correct:null,at:Date.now()});}
function finish(mode,result={}){const s=current(mode);const out={version:'3.13.64',mode:s.mode,durationMs:Date.now()-s.startedAt,questions:s.events.filter(e=>e.type==='question').length,answers:s.events.filter(e=>e.type==='answer').length,guesses:s.guesses,repeatedQuestions:s.repeated,unknownAnswers:s.unknown,lowInformationQuestions:s.lowInformation,highInformationQuestions:s.highInformation,notes:s.notes.slice(-100),events:s.events.slice(-500),result:String(result.result||'finished'),finishedAt:new Date().toISOString()};sessions.delete(s.mode);return out;}
function report(){return [...sessions.values()].map(s=>({mode:s.mode,questions:s.events.filter(e=>e.type==='question').length,repeatedQuestions:s.repeated,unknownAnswers:s.unknown,lowInformationQuestions:s.lowInformation,highInformationQuestions:s.highInformation,notes:s.notes.slice(-20)}));}
window.MindSparring={start,question,answer,guess,finish,report};
})();
