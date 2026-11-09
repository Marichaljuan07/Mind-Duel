// Pruebas aisladas del extractor 3.14.10. No realizan llamadas reales a Internet.
const dns=require('node:dns').promises;
const originalLookup=dns.lookup,originalFetch=global.fetch;
const handler=require('./api/character-extract');
let passed=0,failed=0;
function assert(name,condition){if(condition){passed++;console.log('PASS',name)}else{failed++;console.error('FAIL',name)}}
function response(){let statusCode=200,body;return{setHeader(){},status(n){statusCode=n;return this},json(v){body=v;return{statusCode,body}},get result(){return{statusCode,body}}}}
(async()=>{
 try{
  dns.lookup=async(host)=>host==='example.com'?[{address:'93.184.216.34',family:4}]:host==='public.example'?[{address:'93.184.216.35',family:4}]:[{address:'127.0.0.1',family:4}];
  global.fetch=async(url,opts)=>({status:200,ok:true,url:String(url),headers:{get:k=>k==='content-type'?'text/html; charset=utf-8':null},body:{getReader(){let done=false;return{async read(){if(done)return{done:true};done=true;return{done:false,value:Buffer.from('<html><head><title>Trunks</title><meta property="og:description" content="Personaje de Dragon Ball"><meta property="og:image" content="https://cdn.example/trunks.jpg"></head></html>')}}}}}});
  let res=response();await handler({method:'POST',body:{url:'https://example.com/wiki/Trunks'}},res);assert('Extrae título, descripción e imagen de metadatos',res.result.statusCode===200&&res.result.body.extracted.name==='Trunks'&&res.result.body.extracted.image==='https://cdn.example/trunks.jpg');
  res=response();await handler({method:'POST',body:{url:'http://127.0.0.1/admin'}},res);assert('Bloquea IP loopback',res.result.statusCode===400);
  global.fetch=async()=>({status:302,ok:false,headers:{get:()=> 'http://127.0.0.1/admin'}});
  res=response();await handler({method:'POST',body:{url:'https://example.com/start'}},res);assert('Bloquea redirección hacia localhost/IP privada',res.result.statusCode===403);
  global.fetch=async()=>({status:200,ok:true,url:'https://example.com/img.jpg',headers:{get:k=>k==='content-type'?'image/jpeg':null}});
  res=response();await handler({method:'POST',body:{url:'https://example.com/image.jpg'}},res);assert('Rechaza imagen como referencia HTML y orienta a usar el campo Imagen',res.result.statusCode===422&&/enlace directo/.test(res.result.body.error));
  global.fetch=originalFetch;dns.lookup=originalLookup;
  console.log(`RESULTADO: ${passed} aprobadas, ${failed} fallidas`);process.exitCode=failed?1:0;
 }catch(e){global.fetch=originalFetch;dns.lookup=originalLookup;console.error(e);process.exitCode=1;}
})();
