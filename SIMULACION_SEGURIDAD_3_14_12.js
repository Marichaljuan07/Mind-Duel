'use strict';
const assert=require('node:assert/strict');
process.env.SUPABASE_URL='https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY='test-service-key';
process.env.CHARACTER_EDITOR_TOKEN='admin-test-token';
const endpoint=require('./api/characters');
const originalFetch=global.fetch;
function response(status,body){return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}})}
async function invoke(method,{body={},token='',query={}}={}){
 const calls=[];global.fetch=async(url,options={})=>{calls.push({url:String(url),options});if(options.method==='PATCH')return response(200,[{id:'character-1',...JSON.parse(options.body)}]);if(options.method==='POST')return response(201,[{id:'new-character',...JSON.parse(options.body)}]);return response(200,[])};
 const headers={origin:'https://mind-duel.example',host:'mind-duel.example','x-forwarded-for':'192.0.2.10'};if(token)headers['x-character-editor-token']=token;
 const res={headersOut:{},setHeader(k,v){this.headersOut[k]=v},status(n){this.statusCode=n;return this},json(v){this.payload=v;return this}};
 await endpoint({method,body,headers,query,socket:{remoteAddress:'192.0.2.10'}},res);return{res,calls};
}
(async()=>{let passed=0;const test=async(name,fn)=>{try{await fn();passed++;console.log('PASS',name)}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}};
 await test('rechaza modificaciones sin clave de administrador',async()=>{const {res,calls}=await invoke('PATCH',{body:{name:'Batman'},query:{id:'character-1'}});assert.equal(res.statusCode,403);assert.equal(calls.length,0)});
 await test('rechaza una clave de administrador incorrecta',async()=>{const {res,calls}=await invoke('PATCH',{body:{name:'Batman'},token:'incorrecta',query:{id:'character-1'}});assert.equal(res.statusCode,403);assert.equal(calls.length,0)});
 await test('permite al administrador editar una ficha compartida',async()=>{const {res,calls}=await invoke('PATCH',{body:{name:'Batman',description:'Héroe de Gotham',aliases:[],attributes:{tipo:'ficticio'},status:'needs_review'},token:'admin-test-token',query:{id:'character-1'}});assert.equal(res.statusCode,200);assert.equal(calls.length,1);assert.equal(calls[0].options.method,'PATCH')});
 await test('rechaza estados administrativos arbitrarios',async()=>{const {res,calls}=await invoke('PATCH',{body:{name:'Batman',status:'archived'},token:'admin-test-token',query:{id:'character-1'}});assert.equal(res.statusCode,400);assert.equal(calls.length,0)});
 await test('permite crear fichas públicas en estado pendiente',async()=>{const {res,calls}=await invoke('POST',{body:{name:'Personaje comunitario',description:'Descripción breve',source:'https://example.org/personaje',image:'https://example.org/image.jpg',attributes:{contenido_fuente:'Texto de referencia',datos_fuente:['Ocupación: Escritor']}}});assert.equal(res.statusCode,201);assert.equal(res.payload.character.status,'needs_review');assert.equal(calls.length,2);const inserted=JSON.parse(calls[1].options.body);assert.equal(inserted.status,'needs_review');assert.equal(inserted.attributes.contenido_fuente,'Texto de referencia')});
 await test('rechaza referencias que no sean URL http o https',async()=>{const {res,calls}=await invoke('POST',{body:{name:'Personaje inválido',source:'javascript:alert(1)'}});assert.equal(res.statusCode,400);assert.equal(calls.length,1)});
 global.fetch=originalFetch;console.log(`${passed}/6 pruebas aprobadas`);if(passed!==6)process.exitCode=1;
})().catch(e=>{global.fetch=originalFetch;console.error(e);process.exitCode=1});
