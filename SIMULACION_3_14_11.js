'use strict';
const assert=require('node:assert/strict');
const dns=require('node:dns').promises;
const originalLookup=dns.lookup,originalFetch=global.fetch;
const endpoint=require('./api/character-extract');
function responseMock(html,status=200,headers={'content-type':'text/html; charset=utf-8'}){return new Response(html,{status,headers});}
async function invoke(url,html,status=200){dns.lookup=async()=>[{address:'93.184.216.34',family:4}];global.fetch=async()=>responseMock(html,status);const headers={};const res={statusCode:200,setHeader(k,v){headers[k]=v},status(n){this.statusCode=n;return this},json(v){this.payload=v;return this}};await endpoint({method:'POST',body:{url}},res);return res;}
(async()=>{let passed=0;const test=async(name,fn)=>{try{await fn();passed++;console.log('PASS',name)}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}};
const html=`<!doctype html><html><head><title>Personaje de prueba</title><meta property="og:description" content="Una descripción corta"><meta property="og:image" content="/foto.jpg"></head><body><nav>Menú y enlaces que no interesan</nav><article><h1>Personaje de prueba</h1><p>Esta es una biografía suficientemente extensa del personaje que permite comprobar que el extractor toma contenido real del artículo y no solamente los metadatos de la página.</p><p>Nació en una ciudad conocida y desarrolló una extensa trayectoria como dirigente y escritor.</p><table><tr><th>Nacimiento</th><td>14 de marzo de 1950</td></tr><tr><th>Ocupación</th><td>Escritor</td></tr></table></article><footer>Publicidad y pie de página</footer></body></html>`;
await test('extrae párrafos del contenido principal',async()=>{const r=await invoke('https://example.com/personaje',html);assert.equal(r.statusCode,200);assert.match(r.payload.extracted.description,/biografía suficientemente extensa/);assert.match(r.payload.extracted.description,/trayectoria como dirigente/)});
await test('extrae filas de tablas como datos de fuente',async()=>{const r=await invoke('https://example.com/personaje',html);assert.deepEqual(r.payload.extracted.attributes.datos_fuente,['Nacimiento: 14 de marzo de 1950','Ocupación: Escritor'])});
await test('conserva imagen relativa como URL absoluta',async()=>{const r=await invoke('https://example.com/personaje',html);assert.equal(r.payload.extracted.image,'https://example.com/foto.jpg')});
await test('no incorpora navegación ni pie de página',async()=>{const r=await invoke('https://example.com/personaje',html);assert.doesNotMatch(r.payload.extracted.description,/Menú y enlaces|Publicidad y pie/)});
await test('rechaza destinos locales',async()=>{dns.lookup=originalLookup;global.fetch=originalFetch;const headers={};const res={setHeader(){},status(n){this.statusCode=n;return this},json(v){this.payload=v;return this}};await endpoint({method:'POST',body:{url:'http://127.0.0.1/admin'}},res);assert.equal(res.statusCode,400)});
await test('rechaza método distinto de POST',async()=>{const res={setHeader(){},status(n){this.statusCode=n;return this},json(v){this.payload=v;return this}};await endpoint({method:'GET',body:{}},res);assert.equal(res.statusCode,405)});
dns.lookup=originalLookup;global.fetch=originalFetch;console.log(`${passed}/6 pruebas aprobadas`);if(passed!==6)process.exitCode=1;
})().catch(e=>{dns.lookup=originalLookup;global.fetch=originalFetch;console.error(e);process.exitCode=1});
