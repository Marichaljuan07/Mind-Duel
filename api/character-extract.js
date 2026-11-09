// Extractor genérico de contenido público. No depende de Wikipedia ni de una API externa.
// Devuelve un borrador basado en el HTML recibido; nunca verifica ni inventa datos.
const dns = require('node:dns').promises;
const net = require('node:net');
const BLOCKED_HOST=/^(localhost|.*\.localhost|.*\.local)$/i;
const MAX_BYTES=3*1024*1024;
const MAX_TEXT=12000;
function conciseDescription(title,metaDesc,content){
 const candidates=[metaDesc,...String(content||'').split(/\n+/)].map(x=>clean(x)).filter(x=>x.length>=18);
 let text=candidates.find(x=>x.length<=360)||candidates[0]||'';
 if(!text)return '';
 const first=(text.match(/^.{1,420}?(?:[.!?](?=\s|$)|$)/)||[text])[0].trim();
 let out=first;
 const subject=String(title||'').trim().replace(/\s*\([^)]{1,100}\)\s*$/,'').trim();
 const outNorm=normText(out),subjectNorm=normText(subject);
 if(subjectNorm&&(outNorm===subjectNorm||outNorm.startsWith(subjectNorm+' ')))out=out.slice(subject.length).replace(/^\s*[:;,–—-]\s*/,'').trim();
 out=out.replace(/^(?:es|fue|era|son|fueron)\s+(?:(?:un|una|el|la|los|las)\s+)?/i,'').replace(/^\([^)]{1,100}\)\s*/,'').trim();
 if(out.length>260)out=out.slice(0,257).replace(/\s+\S*$/,'')+'…';
 return out;
}
function normText(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function privateIPv4(ip){const a=ip.split('.').map(Number);return a.length!==4||a.some(x=>!Number.isInteger(x)||x<0||x>255)||a[0]===0||a[0]===10||a[0]===127||a[0]>=224||(a[0]===169&&a[1]===254)||(a[0]===172&&a[1]>=16&&a[1]<=31)||(a[0]===192&&a[1]===168)||(a[0]===100&&a[1]>=64&&a[1]<=127);}
function privateIPv6(ip){const x=ip.toLowerCase().split('%')[0];return x==='::'||x==='::1'||x.startsWith('fc')||x.startsWith('fd')||/^fe[89ab]/.test(x)||x.startsWith('::ffff:')&&privateIPv4(x.slice(7));}
async function safeUrl(raw){let u;try{u=new URL(raw)}catch{return null}if(!['http:','https:'].includes(u.protocol)||u.username||u.password||BLOCKED_HOST.test(u.hostname))return null;const host=u.hostname.replace(/^\[|\]$/g,'');if(net.isIP(host)){if(net.isIPv4(host)?privateIPv4(host):privateIPv6(host))return null;return u;}try{const records=await dns.lookup(host,{all:true,verbatim:true});if(!records.length||records.some(r=>net.isIPv4(r.address)?privateIPv4(r.address):privateIPv6(r.address)))return null;}catch{return null}return u;}
function decode(s){return String(s||'').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#(\d+);/g,(_,n)=>{try{return String.fromCodePoint(Number(n))}catch{return ' '}}).replace(/&#x([\da-f]+);/gi,(_,n)=>{try{return String.fromCodePoint(parseInt(n,16))}catch{return ' '}});}
function clean(s){return decode(String(s||'').replace(/<!--[\s\S]*?-->/g,' ').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim();}
function attr(tag,name){const m=tag.match(new RegExp("\\b"+name+"\\s*=\\s*([\"\'])([\\s\\S]*?)\\1","i"));return m?decode(m[2]):'';}
function meta(html,key){for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){if((attr(tag,'property')||attr(tag,'name')).toLowerCase()===key.toLowerCase())return attr(tag,'content');}return '';}
function jsonLd(html){const out=[];for(const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{const x=JSON.parse(m[1]);const add=v=>{if(Array.isArray(v))v.forEach(add);else if(v&&typeof v==='object'){out.push(v);if(v['@graph'])add(v['@graph']);if(v.mainEntity)add(v.mainEntity);}};add(x);}catch{}}return out;}
function imageFrom(value,base){const raw=typeof value==='string'?value:(value&&typeof value==='object'?(value.url||value.contentUrl||''):'');if(!raw)return '';try{const u=new URL(raw,base);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
function articleHtml(html){
 const blocks=html.match(/<(?:article|main)\b[^>]*>[\s\S]*?<\/(?:article|main)>/gi)||[];
 const candidates=[...blocks];
 for(const re of [/<div\b[^>]*(?:id|class)=["'][^"']*(?:mw-parser-output|article-body|article-content|entry-content|post-content|content__article|story-body|wiki-content)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi])candidates.push(...(html.match(re)||[]));
 const stripNoise=s=>s.replace(/<(script|style|noscript|svg|nav|header|footer|aside|form|button|figure|picture|iframe|template)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<(?:div|section)\b[^>]*(?:class|id)=["'][^"']*(?:nav|menu|footer|header|sidebar|advert|cookie|social|share|related|comment|breadcrumb|infobox|metadata|mw-editsection)[^"']*["'][^>]*>[\s\S]*?<\/(?:div|section)>/gi,' ');
 const score=s=>(s.match(/<(?:p|h[1-6]|li)\b/gi)||[]).length*5+Math.min(s.length/1000,20);
 let selected=candidates.sort((a,b)=>score(b)-score(a))[0]||html;
 selected=stripNoise(selected);
 const parts=[];
 for(const m of selected.matchAll(/<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)){
  const t=clean(m[2]);if(t.length<35||/^(editar|referencias|enlaces externos|véase también|bibliografía|notas)$/i.test(t))continue;
  if(!parts.some(x=>x===t))parts.push(t);
  if(parts.join(' ').length>=MAX_TEXT)break;
 }
 if(parts.length)return parts.join('\n').slice(0,MAX_TEXT);
 return clean(selected).slice(0,MAX_TEXT);
}
function rowsFrom(html){const rows=[];for(const m of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){const cells=[...m[1].matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)].map(x=>clean(x[1])).filter(Boolean);if(cells.length>=2){const label=cells[0].replace(/[:：]$/,'').trim(),value=cells.slice(1).join(' · ').trim();if(label&&value&&label.length<80&&value.length<300)rows.push(`${label}: ${value}`)}}return [...new Set(rows)].slice(0,35);}
function jsonEntity(ld){return ld.find(x=>x&&typeof x==='object'&&(x.name||x.description||x.image||x.birthDate||x.jobTitle))||{};}
module.exports=async function(req,res){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Método no permitido.'})}let timer;try{
 const raw=String(req.body?.url||'').trim();let current=await safeUrl(raw);if(!current)return res.status(400).json({error:'La URL no es válida o apunta a una dirección no pública.'});let response=null;
 for(let hop=0;hop<=4;hop++){const controller=new AbortController();timer=setTimeout(()=>controller.abort(),12000);try{response=await fetch(current.href,{headers:{'User-Agent':'Mozilla/5.0 (compatible; MindDuelReferenceReader/2.0)','Accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1','Accept-Language':'es,en;q=0.8'},redirect:'manual',signal:controller.signal});}finally{clearTimeout(timer);timer=null;}if([301,302,303,307,308].includes(response.status)){const loc=response.headers.get('location');if(!loc)return res.status(422).json({error:'La página intentó redirigir sin indicar destino.'});if(hop===4)return res.status(422).json({error:'La referencia contiene demasiadas redirecciones.'});current=await safeUrl(new URL(loc,current).href);if(!current)return res.status(403).json({error:'La referencia redirige a una dirección no pública. Se bloqueó por seguridad.'});continue;}break;}
 if(!response)return res.status(502).json({error:'No se obtuvo respuesta de la referencia.'});if(!response.ok)return res.status(422).json({error:`La página respondió con HTTP ${response.status}. Probá otra referencia del mismo personaje.`});const type=response.headers.get('content-type')||'';if(!/text\/html|application\/xhtml\+xml/i.test(type))return res.status(422).json({error:'La referencia no devolvió una página HTML. Para imágenes, pegá el enlace directo en el campo Imagen.'});
 const reader=response.body.getReader();let bytes=0,parts=[];while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>MAX_BYTES){await reader.cancel();return res.status(413).json({error:'La página supera el límite seguro de 3 MB. Probá una versión más liviana de esa misma referencia o usá otro sitio.'});}parts.push(value);}const html=Buffer.concat(parts).toString('utf8');
 const ld=jsonLd(html),entity=jsonEntity(ld),finalUrl=response.url||current.href,title=clean(entity.name||meta(html,'og:title')||meta(html,'twitter:title')||html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),metaDesc=clean(entity.description||meta(html,'description')||meta(html,'og:description'));
 const content=articleHtml(html),tableFacts=rowsFrom(html),facts=[];
 if(entity.birthDate)facts.push(`Nacimiento: ${entity.birthDate}`);if(entity.deathDate)facts.push(`Fallecimiento: ${entity.deathDate}`);if(entity.nationality)facts.push(`Nacionalidad: ${typeof entity.nationality==='string'?entity.nationality:entity.nationality.name||''}`);if(entity.jobTitle)facts.push(`Ocupación: ${Array.isArray(entity.jobTitle)?entity.jobTitle.join(', '):entity.jobTitle}`);if(entity.creator?.name)facts.push(`Creado por: ${entity.creator.name}`);if(entity.birthPlace?.name)facts.push(`Lugar de nacimiento: ${entity.birthPlace.name}`);
 const structured=[...new Set([...facts,...tableFacts])].slice(0,35),aliases=Array.isArray(entity.alternateName)?entity.alternateName:[entity.alternateName].filter(Boolean),attributes={};
 const gender=String(entity.gender||'').toLowerCase();if(['male','masculino','man'].includes(gender))attributes.genero='hombre';else if(['female','femenino','woman'].includes(gender))attributes.genero='mujer';else if(['non-binary','nonbinary','otro'].includes(gender))attributes.genero='otro';const types=Array.isArray(entity['@type'])?entity['@type']:[entity['@type']||''];if(types.some(t=>/FictionalCharacter|VideoGameCharacter/i.test(t)))attributes.tipo='ficticio';
 if(structured.length)attributes.datos_fuente=structured;if(content)attributes.contenido_fuente=content.slice(0,MAX_TEXT);
 const description=conciseDescription(title,metaDesc,content);const image=imageFrom(entity.image,finalUrl)||imageFrom(meta(html,'og:image'),finalUrl)||imageFrom(meta(html,'twitter:image'),finalUrl);
 if(!title&&!description&&!structured.length)return res.status(422).json({error:'La página no contiene texto aprovechable para una ficha. Probá otra referencia del mismo personaje.'});
 return res.status(200).json({ok:true,source:finalUrl,extracted:{name:title,description,aliases:aliases.filter(x=>typeof x==='string').slice(0,10),image,attributes,content_excerpt:content.slice(0,MAX_TEXT)},notice:`Borrador extraído del contenido disponible de la página (${content.length} caracteres de texto analizados). ${structured.length} dato(s) de tablas o datos estructurados detectados. No se verificó su exactitud: revisá y corregí todo antes de guardar.`});
 }catch(e){const aborted=e.name==='AbortError';return res.status(502).json({error:aborted?'La página tardó demasiado en responder. Probá otra referencia del mismo personaje.':'No se pudo leer la página de referencia. Probá otra fuente.',detail:aborted?'timeout':String(e.message||'').slice(0,120)})}finally{if(timer)clearTimeout(timer)}};
