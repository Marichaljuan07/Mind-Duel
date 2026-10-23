// Controles estructurales y hechos básicos del catálogo. No sustituye la verificación de fuentes externas.
const fs=require('fs'),vm=require('vm'),L=require('./motor_logico.js');
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('./personajes.js','utf8')+';globalThis.P=PERSONAJES',c);const P=c.P;let fail=0;
function check(ok,msg){console.log((ok?'OK   ':'FALLA ')+msg);if(!ok)fail++}
check(P.length===98,'98 personajes tras unificar duplicados exactos');
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function find(n){const k=norm(n);return P.find(p=>norm(p.nombre)===k||(p.alias||[]).some(a=>norm(a)===k))}
check(find('Princesa Leia')?.nombre==='Leia Organa','Princesa Leia resuelve a Leia Organa');
check(find('Leia Organa')===find('princesa leia'),'Leia no aparece como dos candidatos');
check(find('Frodo Bolsón')?.nombre==='Frodo Baggins','Frodo Bolsón resuelve a Frodo Baggins');
check(find('Frodo Baggins')===find('frodo bolson'),'Frodo no aparece como dos candidatos');
check(find('Anakin Skywalker')?.nombre==='Darth Vader','Anakin se reconoce como alias de Darth Vader');
for(const n of ['Goku','Naruto Uzumaki','Popeye','Garfield','Scooby-Doo','Pac-Man','Wall-E'])check(find(n)?.genero==='hombre',n+' tiene género básico corregido');
for(const p of P){check(typeof p.nombre==='string'&&p.nombre.trim().length>0,'nombre presente: '+(p.nombre||'(vacío)'));check(['real','ficticio'].includes(p.tipo),'tipo válido: '+p.nombre);check(['hombre','mujer','otro'].includes(p.genero),'género con valor permitido: '+p.nombre);check(Array.isArray(p.alias),'alias como lista: '+p.nombre);}
console.log(`\nTotal: ${P.length} fichas; controles fallidos: ${fail}.`);process.exitCode=fail?1:0;
