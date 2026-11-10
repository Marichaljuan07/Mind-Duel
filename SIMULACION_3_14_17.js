'use strict';
// Pruebas de la 3.14.17. A diferencia de la 3.14.16, el HTML de Kratos acá imita la página REAL de Wikipedia:
// la infobox NO trae armas ni universo; esos datos solo están en el texto del artículo.
// La IA se simula con un fetch falso: no se prueba contra Groq real desde este entorno.
const fs=require('fs'),assert=require('assert/strict');
const catalog=fs.readFileSync(__dirname+'/catalogo_personajes.js','utf8');
const handler=require('./api/character-extract');
let passed=0;const test=(n,f)=>{f();passed++;console.log('PASS',n)};

const kratosHtml=`<html><head><title>Kratos (personaje) - Wikipedia, la enciclopedia libre</title>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","name":"Kratos (personaje)"}</script></head>
<body><header><nav><ul><li>Portada</li><li>Cambios recientes</li></ul></nav></header>
<h1 id="firstHeading"><span>Kratos (personaje)</span></h1><div id="mw-content-text">
<table class="infobox"><tr><th colspan="2">Kratos</th></tr>
<tr><th>Alias</th><td>Fantasma de Esparta</td></tr><tr><th>Primera aparición</th><td>God of War</td></tr>
<tr><th>Creador</th><td>David Jaffe</td></tr><tr><th>Especie</th><td>Semidiós</td></tr><tr><th>Género</th><td>Masculino</td></tr></table>
<p>Kratos, conocido como el Fantasma de Esparta, es un personaje ficticio y protagonista de la serie de videojuegos God of War, desarrollada por Santa Monica Studio.</p>
<h2><span id="Poderes_y_habilidades">Poderes y habilidades</span></h2>
<ul><li>Fuerza sobrehumana</li><li>Regeneración acelerada</li></ul>
<p>Como semidiós, Kratos posee una fuerza sobrehumana y utiliza las Hojas del Caos y el Hacha Leviatán en combate contra Ares, Zeus y otros dioses.</p>
<h2>Aliados</h2><ul><li>Atreus</li><li>Mimir</li></ul>
<h2>Referencias</h2><ul><li>Texto de referencia que no debe llegar a la IA</li></ul></div></body></html>`;

const franciscoHtml=`<html><body><h1>Francisco (papa)</h1><div class="infobox vcard"><table><tr><th>Nacionalidad</th><td>Argentina</td></tr><tr><th>Sexo</th><td>Masculino</td></tr><tr><th>Ocupación</th><td>Papa</td></tr><tr><th>Fecha de nacimiento</th><td>17 de diciembre de 1936</td></tr></table></div><p>Francisco, de nombre secular Jorge Mario Bergoglio (Buenos Aires, 17 de diciembre de 1936), fue el 266.º papa de la Iglesia católica y fue un religioso argentino.</p></body></html>`;

let lastAiRequest=null,aiCalls=[];
function mockFetch(html,aiBehavior){
 global.fetch=async(url,opts)=>{
  if(String(url).includes('api.groq.com')){
   lastAiRequest={url:String(url),headers:opts.headers,body:JSON.parse(opts.body)};aiCalls.push(lastAiRequest);
   if(aiBehavior.reject400WithFormat&&lastAiRequest.body.response_format)return new Response('{"error":{"message":"Failed to validate JSON"}}',{status:400});
   if(aiBehavior.status&&aiBehavior.status!==200)return new Response('rate limit exceeded',{status:aiBehavior.status});
   return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(aiBehavior.data)}}]}),{status:200,headers:{'content-type':'application/json'}});
  }
  return new Response(html,{status:200,headers:{'content-type':'text/html'}});
 };
}
async function extract(html,type,ai){
 mockFetch(html,ai||{});lastAiRequest=null;aiCalls=[];
 const req={method:'POST',body:{url:'https://8.8.8.8/reference',type},headers:{}};
 const res={setHeader(){},status(n){this.statusCode=n;return this},json(v){this.payload=v;return this}};
 await handler(req,res);assert.equal(res.statusCode,200,JSON.stringify(res.payload));return res.payload;
}

(async()=>{
 // ---- A) sin clave de IA: solo reglas ----
 delete process.env.AI_API_KEY;delete process.env.GROQ_API_KEY;
 const a=await extract(kratosHtml,'ficticio');
 test('sin IA: el nombre pierde el sufijo (personaje) y no se llama a la IA',()=>{assert.equal(a.extracted.name,'Kratos');assert.equal(a.ai.status,'sin_clave');assert.equal(lastAiRequest,null);assert(a.notice.includes('AI_API_KEY'))});
 test('sin IA: reglas derivan humano, franquicia y medios',()=>{const x=a.extracted.attributes;assert.equal(x.humano,false);assert.equal(x.franquicia,'God of War');assert.deepEqual(x.medios,['videojuego']);assert.equal(x.medio_origen,'videojuego');assert.equal(x.especie,'Semidiós');assert.equal(x.creador,'David Jaffe');assert.equal(x.genero,'hombre')});
 test('sin IA: descripción de respaldo ahora incluye la franquicia',()=>{assert.equal(a.extracted.description,'Semidiós del universo God of War.')});

 // ---- B) con IA simulada ----
 process.env.AI_API_KEY='clave-de-prueba';
 const aiOk={data:{humano:false,genero:'hombre',especie:'Semidiós',franquicia:'God of War',creador:'David Jaffe',medios:['videojuego','cocina'],
  habilidades:['Fuerza sobrehumana','Regeneración acelerada','Vuelo supersónico'],poderes:[],armas:['Hojas del Caos','Hacha Leviatán','Martillo de Thor'],afiliaciones:[],
  aliados:['Atreus','Mimir'],enemigos:['Ares','Zeus','Thanos'],origen:'Guerrero espartano convertido en semidiós.',etiquetas:['guerrero','combate','cocinero','usa_armas'],
  nombre_completo:'No debe aparecer',contenido_fuente:'No debe aparecer',descripcion:'Guerrero espartano y semidiós que protagoniza la saga God of War.'}};
 const b=await extract(kratosHtml,'ficticio',aiOk);const bx=b.extracted.attributes;
 test('con IA: la petición lleva clave, JSON estricto y el texto relevante sin navegación ni referencias',()=>{
  assert.equal(lastAiRequest.headers.Authorization,'Bearer clave-de-prueba');assert.equal(lastAiRequest.body.response_format.type,'json_object');assert.equal(lastAiRequest.body.temperature,0);
  const prompt=lastAiRequest.body.messages[1].content;assert(prompt.includes('Poderes y habilidades'));assert(prompt.includes('Hojas del Caos'));assert(!prompt.includes('Cambios recientes'));assert(!prompt.includes('no debe llegar a la IA'))});
 test('con IA: completa armas, aliados, enemigos y habilidades que la infobox no traía',()=>{assert.deepEqual(bx.armas,['Hojas del Caos','Hacha Leviatán']);assert.deepEqual(bx.aliados,['Atreus','Mimir']);assert.deepEqual(bx.enemigos,['Ares','Zeus']);assert.deepEqual(bx.habilidades,['Fuerza sobrehumana','Regeneración acelerada'])});
 test('con IA: descarta lo inventado (no figura en el texto) y lo fuera de las listas cerradas',()=>{assert(!bx.armas.includes('Martillo de Thor'));assert(!bx.enemigos.includes('Thanos'));assert(!bx.habilidades.includes('Vuelo supersónico'));assert.deepEqual(bx.etiquetas,['guerrero','combate','usa_armas']);assert.deepEqual(bx.medios,['videojuego'])});
 test('con IA: ignora campos que no pertenecen a la plantilla y no pisa datos de la infobox',()=>{assert.equal(bx.nombre_completo,undefined);assert.equal(bx.contenido_fuente,undefined);assert.equal(bx.creador,'David Jaffe');assert.equal(bx.humano,false);assert.equal(bx.origen,'Guerrero espartano convertido en semidiós')});
 test('con IA: la descripción generada reemplaza a la de respaldo',()=>{assert.equal(b.extracted.description,'Guerrero espartano y semidiós que protagoniza la saga God of War.');assert.equal(b.ai.status,'ok');assert(b.notice.startsWith('IA:'))});

 // ---- C) descripción copiada de la página: se descarta ----
 const copied=JSON.parse(JSON.stringify(aiOk));copied.data.descripcion='Kratos, conocido como el Fantasma de Esparta, es un personaje ficticio y protagonista de la serie de videojuegos God of War.';
 const c=await extract(kratosHtml,'ficticio',copied);
 test('una descripción que copia 8 palabras seguidas de la página se reemplaza por la de respaldo',()=>{assert.equal(c.extracted.description,'Semidiós del universo God of War.')});

 // ---- D) la IA falla: se sigue con reglas y se avisa ----
 const d=await extract(kratosHtml,'ficticio',{status:500});
 test('si la IA falla, la extracción sigue con reglas y el aviso explica el motivo',()=>{assert.equal(d.ai.status,'error');assert(d.ai.detail.includes('HTTP 500'));assert(d.notice.includes('falló'));assert.equal(d.extracted.attributes.humano,false);assert.equal(d.extracted.description,'Semidiós del universo God of War.')});

 // ---- E) persona real: la IA no puede colar campos de ficticios ni cambiar humano ----
 const e=await extract(franciscoHtml,'real',{data:{humano:false,habilidades:['volar'],etiquetas:['religioso','papa'],descripcion:'Líder de la Iglesia católica durante más de una década.'}});
 test('persona real: sin campos de ficticios, humano sigue true y las etiquetas válidas se incorporan',()=>{const x=e.extracted.attributes;assert.equal(x.humano,true);assert.equal(x.habilidades,undefined);assert.deepEqual(x.etiquetas,['religioso','papa']);assert.equal(x.numero_en_cargo,266)});


 // ---- F) gpt-oss en Groq: 400 "Failed to validate JSON" ----
 process.env.AI_MODEL='openai/gpt-oss-20b';
 const f=await extract(kratosHtml,'ficticio',{data:aiOk.data,reject400WithFormat:true});
 test('gpt-oss: razonamiento bajo, margen amplio y reintento sin response_format tras un 400',()=>{
  assert.equal(aiCalls.length,2);assert(aiCalls[0].body.response_format);assert.equal(aiCalls[1].body.response_format,undefined);
  assert.equal(aiCalls[0].body.reasoning_effort,'low');assert(aiCalls[0].body.max_tokens>=4000);
  assert.equal(f.ai.status,'ok');assert.deepEqual(f.extracted.attributes.armas,['Hojas del Caos','Hacha Leviatán'])});
 process.env.AI_MODEL='llama-3.3-70b-versatile';
 await extract(kratosHtml,'ficticio',aiOk);
 test('otros modelos: sin reasoning_effort y una sola llamada si no hay error',()=>{assert.equal(aiCalls.length,1);assert.equal(aiCalls[0].body.reasoning_effort,undefined)});
 delete process.env.AI_MODEL;


 // ---- G) casos reales vistos en producción: León XIV ----
 delete process.env.AI_API_KEY;
 const leonHtml=`<html><body><h1>León XIV</h1><table class="infobox"><tr><th>Formación</th><td>Doctor en Derecho canónico<br>Licenciado en Sagrada Teología<br/>Licenciado en Matemáticas</td></tr>
 <tr><th>Obras</th><td><ul><li>Dilexi te</li><li>Magnifica humanitas</li></ul></td></tr></table>
 <p>León XIV (Chicago, 14 de septiembre de 1955), de nombre secular Robert Francis Prevost, es el 267.º papa de la Iglesia católica. Fue elegido en el cónclave el 8 de mayo de 2025.</p></body></html>`;
 const g=await extract(leonHtml,'real');const gx=g.extracted.attributes;
 test('persona viva: una segunda fecha en la portada (elección) NO es fallecimiento',()=>{assert.equal(gx.fecha_nacimiento,'1955-09-14');assert.equal(gx.fecha_fallecimiento,null);assert.notEqual(gx.vivo,false)});
 test('persona real: humano queda true sin necesitar la IA',()=>{assert.equal(gx.humano,true)});
 test('celdas con <br> o <li> se separan en ítems, no se pegan',()=>{assert.deepEqual(gx.formacion,['Doctor en Derecho canónico','Licenciado en Sagrada Teología','Licenciado en Matemáticas']);assert.deepEqual(gx.obras,['Dilexi te','Magnifica humanitas'])});
 const finadoHtml=franciscoHtml.replace('(Buenos Aires, 17 de diciembre de 1936)','(Buenos Aires, 17 de diciembre de 1936 – Ciudad del Vaticano, 21 de abril de 2025)');
 const h=await extract(finadoHtml,'real');
 test('fallecimiento real: el paréntesis con dos fechas sí marca muerte y vivo=false',()=>{assert.equal(h.extracted.attributes.fecha_fallecimiento,'2025-04-21');assert.equal(h.extracted.attributes.vivo,false)});

 // ---- Front: plantilla y reemplazo de descripciones automáticas ----
 const vm=require('vm');
 const fnSrc=catalog.slice(catalog.indexOf('function canReplaceDescription('),catalog.indexOf('\nfunction mergeExtractedAttributes('));
 const canReplace=vm.runInNewContext('('+fnSrc.trim()+')');
 test('descripciones: se reemplazan las vacías y las automáticas, nunca las escritas a mano',()=>{
  assert.equal(canReplace({value:'',dataset:{}}),true);
  assert.equal(canReplace({value:'Personaje de especie Semidiós.',dataset:{}}),true);
  assert.equal(canReplace({value:'Semidiós del universo God of War.',dataset:{}}),true);
  assert.equal(canReplace({value:'Texto previo de la IA.',dataset:{auto:'Texto previo de la IA.'}}),true);
  assert.equal(canReplace({value:'El espartano que desafió al Olimpo.',dataset:{}}),false)});
 const tStart=catalog.indexOf('function applyFichaTemplate(');const tEnd=catalog.indexOf('\n}\n',tStart)+3;
 const applyFichaTemplate=vm.runInNewContext('('+catalog.slice(tStart,tEnd).trim().replace('function applyFichaTemplate','function')+')');
 test('plantilla: etiquetas y medios se conservan en ficticios y reales',()=>{const f=applyFichaTemplate({etiquetas:['guerrero'],medios:['videojuego']},'ficticio');assert.deepEqual(Array.from(f.etiquetas),['guerrero']);assert.deepEqual(Array.from(f.medios),['videojuego']);const r=applyFichaTemplate({etiquetas:['papa']},'real');assert.deepEqual(Array.from(r.etiquetas),['papa'])});
 console.log(`Resultado 3.14.17: ${passed} pruebas aprobadas.`);
})().catch(err=>{console.error(err);process.exitCode=1});
