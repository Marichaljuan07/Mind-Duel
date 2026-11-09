'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const catalog=fs.readFileSync(__dirname+'/catalogo_personajes.js','utf8');
const match=catalog.match(/function applyFichaTemplate\(attrs,type\)\{[\s\S]*?\n\}/);assert(match,'No se encontró applyFichaTemplate');
const apply=vm.runInNewContext('('+match[0].replace('function applyFichaTemplate(attrs,type)','function(attrs,type)')+')');
let passed=0;function test(name,fn){fn();passed++;console.log('PASS',name)}
test('la plantilla real solo conserva campos definidos y elimina biografía/texto bruto',()=>{const x=apply({tipo:'real',contenido_fuente:'biografía larga',datos_fuente:['filas sin clasificar'],profesion:'Papa',genero:'HOMBRE',nacionalidad:'Argentina',numero_en_cargo:266,extra:'no permitido'},'real');assert.equal(x.profesion,'Papa');assert.equal(x.genero,'hombre');assert.equal(x.numero_en_cargo,266);assert.equal(x.contenido_fuente,undefined);assert.equal(x.datos_fuente,undefined);assert.equal(x.extra,undefined);});
test('al cambiar a ficticio se eliminan los campos exclusivos de persona real',()=>{const x=apply({tipo:'real',profesion:'Papa',nacionalidad:'Argentina',humano:true},'ficticio');assert.equal(x.tipo,'ficticio');assert.equal(x.universo,null);assert.equal(x.profesion,undefined);assert.equal(x.nacionalidad,undefined);assert.equal(x.humano,true);});
test('los campos de listas mantienen tipo array',()=>{const x=apply({tipo:'ficticio',habilidades:'Vuelo',aliados:null},'ficticio');assert.deepEqual(Array.from(x.habilidades),['Vuelo']);assert.deepEqual(Array.from(x.aliados),[]);});
test('el guardado de ficha compartida conserva copia local si el servidor rechaza edición',()=>{assert(catalog.includes('Copia guardada en este dispositivo, pero NO en el catálogo compartido.'));assert(catalog.includes("localStorage.setItem(LOCAL_EDITS,JSON.stringify(edits))"));});
test('el editor no presenta una copia local como sincronizada',()=>{assert(catalog.includes('NO en el catálogo compartido'));assert(catalog.includes('Cambios guardados en el catálogo compartido.'));});
(async()=>{
 const handler=require('./api/character-extract');
 const html=`<html><head><script type="application/ld+json">{"@type":"Person","name":"Francisco","gender":"Male","jobTitle":"Papa","memberOf":{"name":"Iglesia católica"},"birthDate":"1936-12-17"}</script></head><body><h1>Francisco</h1><table><tr><th>Nacionalidad</th><td>Argentina</td></tr><tr><th>Fecha de fallecimiento</th><td>21 de abril de 2025</td></tr><tr><th>Número de pontificado</th><td>266</td></tr></table><article><p>Una biografía extensa que no debe incorporarse a la descripción ni al JSON de atributos.</p></article></body></html>`;
 global.fetch=async()=>new Response(html,{status:200,headers:{'content-type':'text/html'}});
 const req={method:'POST',body:{url:'https://8.8.8.8/francisco',type:'real'},headers:{}};const res={setHeader(){},status(n){this.statusCode=n;return this},json(v){this.payload=v;return this}};
 await handler(req,res);assert.equal(res.statusCode,200);const x=res.payload.extracted,a=x.attributes;
 test('el extractor completa campos y no devuelve biografía',()=>{assert.equal(a.tipo,'real');assert.equal(a.genero,'hombre');assert.equal(a.profesion,'Papa');assert.equal(a.nacionalidad,'Argentina');assert.equal(a.numero_en_cargo,266);assert.equal(a.contenido_fuente,undefined);assert.equal(a.datos_fuente,undefined);assert.equal(x.content_excerpt,undefined);});
 test('la descripción se genera como una frase breve y concreta',()=>assert.equal(x.description,'Papa número 266 de la Iglesia católica.'));
 console.log(`Resultado 3.14.15: ${passed} pruebas aprobadas.`);
})().catch(e=>{console.error(e);process.exitCode=1});
