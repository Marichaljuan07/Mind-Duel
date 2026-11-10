// Extractor genérico de contenido público. No depende de Wikipedia ni de una API externa.
// Devuelve un borrador basado en el HTML recibido; nunca verifica ni inventa datos.
const dns = require('node:dns').promises;
const net = require('node:net');
const BLOCKED_HOST=/^(localhost|.*\.localhost|.*\.local)$/i;
const MAX_BYTES=3*1024*1024;
function privateIPv4(ip){const a=ip.split('.').map(Number);return a.length!==4||a.some(x=>!Number.isInteger(x)||x<0||x>255)||a[0]===0||a[0]===10||a[0]===127||a[0]>=224||(a[0]===169&&a[1]===254)||(a[0]===172&&a[1]>=16&&a[1]<=31)||(a[0]===192&&a[1]===168)||(a[0]===100&&a[1]>=64&&a[1]<=127);}
function privateIPv6(ip){const x=ip.toLowerCase().split('%')[0];return x==='::'||x==='::1'||x.startsWith('fc')||x.startsWith('fd')||/^fe[89ab]/.test(x)||x.startsWith('::ffff:')&&privateIPv4(x.slice(7));}
async function safeUrl(raw){let u;try{u=new URL(raw)}catch{return null}if(!['http:','https:'].includes(u.protocol)||u.username||u.password||BLOCKED_HOST.test(u.hostname))return null;const host=u.hostname.replace(/^\[|\]$/g,'');if(net.isIP(host)){if(net.isIPv4(host)?privateIPv4(host):privateIPv6(host))return null;return u;}try{const records=await dns.lookup(host,{all:true,verbatim:true});if(!records.length||records.some(r=>net.isIPv4(r.address)?privateIPv4(r.address):privateIPv6(r.address)))return null;}catch{return null}return u;}
function decode(s){return String(s||'').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#(\d+);/g,(_,n)=>{try{return String.fromCodePoint(Number(n))}catch{return ' '}}).replace(/&#x([\da-f]+);/gi,(_,n)=>{try{return String.fromCodePoint(parseInt(n,16))}catch{return ' '}});}
function clean(s){return decode(String(s||'').replace(/<!--[\s\S]*?-->/g,' ').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim();}
function attr(tag,name){const m=tag.match(new RegExp("\\b"+name+"\\s*=\\s*([\"\'])([\\s\\S]*?)\\1","i"));return m?decode(m[2]):'';}
function meta(html,key){for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){if((attr(tag,'property')||attr(tag,'name')).toLowerCase()===key.toLowerCase())return attr(tag,'content');}return '';}
function jsonLd(html){const out=[];const visit=v=>{if(Array.isArray(v)){v.forEach(visit);return}if(!v||typeof v!=='object')return;out.push(v);for(const [k,x] of Object.entries(v))if(x&&typeof x==='object'&&['@graph','mainEntity','mainEntityOfPage','about','author','creator','publisher','itemListElement'].includes(k))visit(x)};for(const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{visit(JSON.parse(m[1]))}catch{}}return out;}
function imageFrom(value,base){const raw=typeof value==='string'?value:(value&&typeof value==='object'?(value.url||value.contentUrl||''):'');if(!raw)return '';try{const u=new URL(raw,base);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
function rowsFrom(html){const rows=[];for(const m of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){const cells=[...m[1].matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)].map(x=>clean(x[1])).filter(Boolean);if(cells.length>=2){const label=cells[0].replace(/[:：]$/,'').trim(),value=cells.slice(1).join(' · ').trim();if(label&&value&&label.length<80&&value.length<300)rows.push(`${label}: ${value}`)}}
 const dl=html.match(/<(?:dl|div)\b[^>]*(?:class|id)=["'][^"']*(?:infobox|vcard|datos|ficha)[^"']*["'][^>]*>[\s\S]*?<\/(?:dl|div)>/gi)||[];for(const block of dl){for(const m of block.matchAll(/<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi)){const label=clean(m[1]),value=clean(m[2]);if(label&&value&&label.length<80&&value.length<300)rows.push(`${label}: ${value}`)}}return [...new Set(rows)].slice(0,80);}


function normLabel(s){return clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
function shortValue(s){return clean(s).replace(/\[[^\]]*\]/g,'').slice(0,360).trim();}
function normalizeDate(value){const v=String(value||'').trim();if(/^\d{4}-\d{2}-\d{2}$/.test(v))return v;const m=/^(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})$/i.exec(v);if(!m)return v;const months={enero:'01',febrero:'02',marzo:'03',abril:'04',mayo:'05',junio:'06',julio:'07',agosto:'08',septiembre:'09',setiembre:'09',octubre:'10',noviembre:'11',diciembre:'12'};const month=months[m[2].toLowerCase()];return month?`${m[3]}-${month}-${m[1].padStart(2,'0')}`:v;}
function mapFacts(rows,type){
 const a={};const put=(k,v)=>{v=shortValue(v);if(v&&!a[k])a[k]=v};const putList=(k,v)=>{const items=(Array.isArray(v)?v:String(v||'').split(/\s*[·;]\s*|\s*,\s*(?=[A-ZÁÉÍÓÚ])/)).map(shortValue).filter(Boolean);if(items.length){const merged=[...(a[k]||[]),...items],seen=new Set();a[k]=merged.filter(x=>{const key=normLabel(x.replace(/^(?:la|el|los|las)\s+/i,''));if(!key||seen.has(key))return false;seen.add(key);return true}).slice(0,20)}};
 for(const row of rows){const i=row.indexOf(':');if(i<1)continue;const label=normLabel(row.slice(0,i)),value=row.slice(i+1).trim();
  if(/^(fecha de )?nacimiento$|^nacio$/.test(label)){const m=value.match(/\b\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/i);put('fecha_nacimiento',normalizeDate(m?m[0]:value));}
  else if(/^(fecha de )?fallecimiento$|^muerte$|^fallecio$/.test(label)){const m=value.match(/\b\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/i);put('fecha_fallecimiento',normalizeDate(m?m[0]:value));}
  else if(/^(nacionalidad|nacionalidades)$/.test(label))put('nacionalidad',value);
  else if(/^(genero|sexo)$/.test(label)){const g=normLabel(value);if(/^(hombre|masculino|male)$/.test(g))a.genero='hombre';else if(/^(mujer|femenino|female)$/.test(g))a.genero='mujer';else if(/^(otro|no binario|non binary)$/.test(g))a.genero='otro';}
  else if(/^(humano|es humano)$/.test(label)){const v=normLabel(value);if(/^(si|yes|verdadero)$/.test(v))a.humano=true;else if(/^(no|false)$/.test(v))a.humano=false;}
  else if(/^(ambito|area|sector)$/.test(label))put('ambito',value);
  else if(/^(lugar de nacimiento|nacimiento lugar|nacio en)$/.test(label))put('lugar_nacimiento',value);
  else if(/^(ocupacion|ocupaciones|oficio|job title)$/.test(label))put('ocupacion',value);
  else if(/^(profesion|profesiones)$/.test(label))put('profesion',value.charAt(0).toLocaleUpperCase('es')+value.slice(1));
  else if(/^(cargo|cargos|cargo eclesiastico|titulo|titulos|titulo oficial)$/.test(label))putList('cargos',value.charAt(0).toLocaleUpperCase('es')+value.slice(1));
  else if(/^(numero de pontificado|numero de papa|numero en el cargo|numero de orden)$/.test(label)){const m=value.match(/\d+/);if(m)a.numero_en_cargo=Number(m[0]);}
  else if(/^(especie|raza)$/.test(label))put('especie',value);
  else if(/^(universo|franquicia|saga)$/.test(label))put(type==='ficticio'?'universo':'ambito',value);
  else if(/^(medio|medio de origen|primera aparicion)$/.test(label))put('medio_origen',value);
  else if(/^(habilidades|habilidad)$/.test(label)&&type==='ficticio')putList('habilidades',value);else if(/^(poderes|poder)$/.test(label)&&type==='ficticio')putList('poderes',value);
  else if(/^(armas|arma)$/.test(label)&&type==='ficticio')putList('armas',value);
  else if(/^(afiliaciones|afiliacion|organizacion|organizaciones|congregacion|partido|pertenece a)$/.test(label))putList(type==='ficticio'?'afiliaciones':'organizaciones',value);
  else if(/^(creador|creada por|creado por|autor|autora)$/.test(label))put('creador',value);
  else if(/^(obras notables|obras|publicaciones)$/.test(label))putList('obras',value);
  else if(/^(estudios|educacion|formacion|alma mater)$/.test(label))putList('formacion',value);
  else if(/^(nombre secular|nombre completo)$/.test(label))put('nombre_completo',value);
  else if(/^(alias|otros nombres|nombre real)$/.test(label))put('otros_nombres',value);
 }
 return a;
}
function leadFacts(html,type){
 const lead=[];const blocks=html.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi)||[];let text='';
 for(const block of blocks){const t=clean(block);if(t.length<35)continue;if(/^(contenido|ir a la navegacion|editar|coordenadas)/i.test(t))continue;text+=' '+t;if(text.length>1800)break;}
 text=text.slice(0,1800);const add=(k,v)=>{if(v&&!lead.some(x=>x.startsWith(k+':')))lead.push(k+': '+v)};
 const dateRe=/\b(\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+\d{4})\b/gi;const dates=[...text.matchAll(dateRe)].map(x=>x[1]);if(dates[0])add('Nacimiento',dates[0]);if(dates.length>1)add('Fallecimiento',dates[1]);
 const roleRe=/\b(?:fue|es|ha sido|se convirtió en)\s+(?:el|la|un|una)?\s*(?:(\d{1,3})\s*(?:\.º|º|°|o)?\s*)?(papa|presidente|presidenta|rey|reina|emperador|emperatriz|primer ministro|primera ministra|monarca|arzobispo|obispo|actor|actriz|cantante|escritor|escritora|director|directora|futbolista|deportista|cientifico|científica|político|política|militar|filósofo|filósofa)\s+(?:de|del)\s+([^.,;()]{2,100})/i.exec(text);
 if(roleRe){const role=roleRe[2],org=roleRe[3].split(/\s+(?:y|,)?\s+(?:fue|es|ha sido|también|además)\b/i)[0].trim().replace(/^(?:la|el|los|las)\s+/i,'');add('Cargo',role);add('Organización',org);if(roleRe[1])add('Número en el cargo',roleRe[1]);}
 const secular=/\b(?:de nombre secular|nombre secular|cuyo nombre real es)\s+([^,(.;]{3,100})/i.exec(text);if(secular)add('Nombre completo',secular[1].trim());
 const professionRe=/\b(religioso|religiosa|político|política|escritor|escritora|actor|actriz|médico|médica|abogado|abogada|militar|deportista|científico|científica|artista|cantante)(?:\s+[a-záéíóúñ]+){0,2}\s+(argentino|argentina|uruguayo|uruguaya|mexicano|mexicana|chileno|chilena|español|española|italiano|italiana|francés|francesa|brasileño|brasileña)\b/i.exec(text);
 if(professionRe){add('Profesión',professionRe[1]);const nationalities={argentino:'Argentina',argentina:'Argentina',uruguayo:'Uruguay',uruguaya:'Uruguay',mexicano:'México',mexicana:'México',chileno:'Chile',chilena:'Chile',español:'España',española:'España',italiano:'Italia',italiana:'Italia',francés:'Francia',francesa:'Francia',brasileño:'Brasil',brasileña:'Brasil'};add('Nacionalidad',nationalities[professionRe[2].toLowerCase()]);if(/^religios[oa]$/i.test(professionRe[1]))add('Ámbito','Religioso');}
 const placeDate=/\b([A-ZÁÉÍÓÚÑ][^,()]{2,60}),\s*\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+\d{4}/i.exec(text);if(placeDate)add('Lugar de nacimiento',placeDate[1].trim());
 return lead;
}

function schemaFor(type, mapped){
 const common={tipo:type||null,plantilla:type==='real'?'persona_real_v2':type==='ficticio'?'personaje_ficticio_v2':null,plantillaVersion:2,genero:null,humano:null,vivo:null,rasgos:[],otros_nombres:null};
 const fields=type==='real'?{nombre_completo:null,profesion:null,ocupacion:null,nacionalidad:null,nacionalidades:[],numero_en_cargo:null,lugar_nacimiento:null,fecha_nacimiento:null,fecha_fallecimiento:null,ambito:null,organizaciones:[],cargos:[],logros:[],obras:[],formacion:[]}:{universo:null,franquicia:null,medio_origen:null,especie:null,habilidades:[],poderes:[],armas:[],afiliaciones:[],aliados:[],enemigos:[],origen:null,creador:null};
 const allowed=new Set([...Object.keys(common),...Object.keys(fields)]);const safe={};for(const [k,v] of Object.entries(mapped||{}))if(allowed.has(k))safe[k]=v;return {...common,...fields,...safe};
}
function conciseDescription(attributes){
 const a=attributes||{};const cleanValue=v=>String(v&&typeof v==='object'?(v.nombre||v.name||''):v||'').trim().replace(/[.。]+$/,'');
 if(a.tipo==='real'){
  const role=cleanValue((a.cargos||[])[0]||a.ocupacion||a.profesion),org=cleanValue((a.organizaciones||[])[0]||a.ambito),nationality=cleanValue(a.nacionalidad);
  const number=a.numero_en_cargo!==null&&a.numero_en_cargo!==undefined&&Number.isFinite(Number(a.numero_en_cargo))?` número ${a.numero_en_cargo}`:'';
  if(role&&org){const article=/^iglesia cat[oó]lica$/i.test(org)?'la ':'';return `${role.charAt(0).toLocaleUpperCase('es')+role.slice(1)}${number} de ${article}${org}.`;}
  if(role&&nationality)return `${role.charAt(0).toLocaleUpperCase('es')+role.slice(1)}${number} de nacionalidad ${nationality.toLowerCase()}.`;
  if(role)return `${role.charAt(0).toLocaleUpperCase('es')+role.slice(1)}${number}.`;if(a.profesion&&nationality)return `${cleanValue(a.profesion)} ${nationality.toLowerCase()}.`;
 }
 if(a.tipo==='ficticio'){const species=cleanValue(a.especie),universe=cleanValue(a.universo||a.franquicia);if(species&&universe)return `${species} del universo ${universe}.`;if(universe)return `Personaje del universo ${universe}.`;if(species)return `Personaje de especie ${species}.`;}
 return '';
}
function jsonEntity(ld){
 const score=x=>{if(!x||typeof x!=='object')return -1;const t=Array.isArray(x['@type'])?x['@type']:[x['@type']||''];let n=0;if(t.some(v=>/(?:^|\/)(?:Person|FictionalCharacter|VideoGameCharacter)$/i.test(v)))n+=100;if(x.name)n+=10;if(x.birthDate||x.birthPlace||x.deathDate||x.gender||x.jobTitle)n+=20;if(x.mainEntityOfPage)n+=5;if(/WebSite|Organization|WebPage|BreadcrumbList/i.test(t.join(' ')))n-=50;return n};return [...ld].sort((a,b)=>score(b)-score(a))[0]||{};
}

module.exports=async function(req,res){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Método no permitido.'})}let timer;try{
 const raw=String(req.body?.url||'').trim();let current=await safeUrl(raw);if(!current)return res.status(400).json({error:'La URL no es válida o apunta a una dirección no pública.'});let response=null;
 for(let hop=0;hop<=4;hop++){const controller=new AbortController();timer=setTimeout(()=>controller.abort(),12000);try{response=await fetch(current.href,{headers:{'User-Agent':'Mozilla/5.0 (compatible; MindDuelReferenceReader/2.0)','Accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1','Accept-Language':'es,en;q=0.8'},redirect:'manual',signal:controller.signal});}finally{clearTimeout(timer);timer=null;}if([301,302,303,307,308].includes(response.status)){const loc=response.headers.get('location');if(!loc)return res.status(422).json({error:'La página intentó redirigir sin indicar destino.'});if(hop===4)return res.status(422).json({error:'La referencia contiene demasiadas redirecciones.'});current=await safeUrl(new URL(loc,current).href);if(!current)return res.status(403).json({error:'La referencia redirige a una dirección no pública. Se bloqueó por seguridad.'});continue;}break;}
 if(!response)return res.status(502).json({error:'No se obtuvo respuesta de la referencia.'});if(!response.ok)return res.status(422).json({error:`La página respondió con HTTP ${response.status}. Probá otra referencia del mismo personaje.`});const type=response.headers.get('content-type')||'';if(!/text\/html|application\/xhtml\+xml/i.test(type))return res.status(422).json({error:'La referencia no devolvió una página HTML. Para imágenes, pegá el enlace directo en el campo Imagen.'});
 const reader=response.body.getReader();let bytes=0,parts=[];while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>MAX_BYTES){await reader.cancel();return res.status(413).json({error:'La página supera el límite seguro de 3 MB. Probá una versión más liviana de esa misma referencia o usá otro sitio.'});}parts.push(value);}const html=Buffer.concat(parts).toString('utf8');
 const ld=jsonLd(html),entity=jsonEntity(ld),finalUrl=response.url||current.href;let title=clean(entity.name||html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||meta(html,'og:title')||meta(html,'twitter:title')||html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/\s*[|–—-]\s*(Wikipedia|Wikidata|Fandom).*$/i,'').trim();
 const tableFacts=rowsFrom(html),facts=[];
 if(entity.birthDate)facts.push(`Nacimiento: ${entity.birthDate}`);if(entity.deathDate)facts.push(`Fallecimiento: ${entity.deathDate}`);if(entity.nationality)facts.push(`Nacionalidad: ${typeof entity.nationality==='string'?entity.nationality:Array.isArray(entity.nationality)?entity.nationality.map(x=>x.name||x).join(', '):entity.nationality.name||''}`);if(entity.jobTitle)facts.push(`Ocupación: ${Array.isArray(entity.jobTitle)?entity.jobTitle.join(', '):entity.jobTitle}`);if(entity.creator?.name)facts.push(`Creado por: ${entity.creator.name}`);if(entity.birthPlace)facts.push(`Lugar de nacimiento: ${typeof entity.birthPlace==='string'?entity.birthPlace:entity.birthPlace.name||''}`);if(entity.memberOf)facts.push(`Organización: ${Array.isArray(entity.memberOf)?entity.memberOf.map(x=>x.name||x).join(', '):entity.memberOf.name||entity.memberOf}`);
 const lead=leadFacts(html,String(req.body?.type||''));const structured=[...new Set([...facts,...tableFacts,...lead])].slice(0,80),aliases=Array.isArray(entity.alternateName)?entity.alternateName:[entity.alternateName].filter(Boolean),attributes={};
 const gender=String(entity.gender||'').toLowerCase();if(['male','masculino','man'].includes(gender))attributes.genero='hombre';else if(['female','femenino','woman'].includes(gender))attributes.genero='mujer';else if(['non-binary','nonbinary','otro'].includes(gender))attributes.genero='otro';const types=Array.isArray(entity['@type'])?entity['@type']:[entity['@type']||''];
 const requestedType=String(req.body?.type||'').toLowerCase();const inferredType=types.some(t=>/(?:^|\/)(?:FictionalCharacter|VideoGameCharacter)$/i.test(t))?'ficticio':types.some(t=>/(?:^|\/)Person$/i.test(t))?'real':'';const fichaType=['real','ficticio'].includes(requestedType)?requestedType:inferredType;if(fichaType==='real')title=title.replace(/\s*\([^()]*\)\s*$/,'').trim();
 const mapped=mapFacts(structured,fichaType);if(entity.name&&!mapped.nombre_completo)mapped.nombre_completo=entity.name;if(entity.alternateName&&!mapped.otros_nombres)mapped.otros_nombres=Array.isArray(entity.alternateName)?entity.alternateName[0]:entity.alternateName;if(entity['@type']){const ts=Array.isArray(entity['@type'])?entity['@type']:[entity['@type']];if(ts.some(t=>/(?:^|\/)Person$/i.test(t)))mapped.humano=true;else if(ts.some(t=>/(?:^|\/)(?:FictionalCharacter|VideoGameCharacter)$/i.test(t)))mapped.humano=false;}if(!Object.hasOwn(mapped,'humano')&&(/schema\.org\/Person|itemtype=[\"']https?:\/\/schema\.org\/Person/i.test(html)||fichaType==='real'&&/class=[\"'][^\"']*\bvcard\b/i.test(html)))mapped.humano=true;if(mapped.nacionalidad&&!mapped.nacionalidades?.length)mapped.nacionalidades=[mapped.nacionalidad];if(mapped.nombre_completo&&title&&normLabel(mapped.nombre_completo)!==normLabel(title))mapped.otros_nombres=mapped.otros_nombres||mapped.nombre_completo;const typed=schemaFor(fichaType,mapped);Object.assign(attributes,typed);if(attributes.fecha_fallecimiento)attributes.vivo=false;if(gender==='male'||gender==='masculino')attributes.genero='hombre';if(gender==='female'||gender==='femenino')attributes.genero='mujer';
 attributes._source=finalUrl;
 const description=conciseDescription(attributes);const image=imageFrom(entity.image,finalUrl)||imageFrom(meta(html,'og:image'),finalUrl)||imageFrom(meta(html,'twitter:image'),finalUrl);
 if(!title&&!description&&!structured.length)return res.status(422).json({error:'La página no contiene datos estructurados aprovechables para una ficha. Probá otra referencia del mismo personaje.'});
 return res.status(200).json({ok:true,source:finalUrl,extracted:{name:title,description,aliases:aliases.filter(x=>typeof x==='string').slice(0,10),image,attributes},notice:`Se detectaron ${Object.entries(attributes).filter(([k,v])=>!['_source'].includes(k)&&v!==null&&v!==''&&!(Array.isArray(v)&&!v.length)).length} campo(s) con datos. No se generó una biografía. Los campos sin evidencia quedan vacíos; revisá antes de guardar.`});
 }catch(e){const aborted=e.name==='AbortError';return res.status(502).json({error:aborted?'La página tardó demasiado en responder. Probá otra referencia del mismo personaje.':'No se pudo leer la página de referencia. Probá otra fuente.',detail:aborted?'timeout':String(e.message||'').slice(0,120)})}finally{if(timer)clearTimeout(timer)}};
