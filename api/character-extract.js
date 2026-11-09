// Extractor genérico de contenido público. No depende de Wikipedia ni de una API externa.
// Devuelve un borrador basado en el HTML recibido; nunca verifica ni inventa datos.
const dns = require('node:dns').promises;
const net = require('node:net');
const BLOCKED_HOST=/^(localhost|.*\.localhost|.*\.local)$/i;
const MAX_BYTES=3*1024*1024;
const MAX_TEXT=12000;
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

function normLabel(s){return clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
function shortValue(s){return clean(s).replace(/\[[^\]]*\]/g,'').slice(0,360).trim();}
function mapFacts(rows,type){
 const a={};const put=(k,v)=>{v=shortValue(v);if(v)a[k]=v};const putList=(k,v)=>{const items=String(v||'').split(/\s*[·;]\s*|\s*,\s*(?=[A-ZÁÉÍÓÚ])/).map(shortValue).filter(Boolean);if(items.length)a[k]=[...new Set(items)].slice(0,20)};
 for(const row of rows){const i=row.indexOf(':');if(i<1)continue;const label=normLabel(row.slice(0,i)),value=row.slice(i+1).trim();
  if(/^(fecha de )?nacimiento$|^nacio$/.test(label)){put('fecha_nacimiento',value);const m=value.match(/\b\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/i);if(m)put('fecha_nacimiento',m[0]);if(/\b(buenos aires|argentina|uruguay|mexico|madrid|roma|paris|londres)\b/i.test(value))put('lugar_nacimiento',value.replace(/\b\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+\d{4}\b/i,'').trim());}
  else if(/^(fecha de )?fallecimiento$|^muerte$|^fallecio$/.test(label))put('fecha_fallecimiento',value);
  else if(/^(nacionalidad|nacionalidades)$/.test(label))put('nacionalidad',value);
  else if(/^(lugar de nacimiento|nacimiento lugar)$/.test(label))put('lugar_nacimiento',value);
  else if(/^(ocupacion|ocupaciones|profesion|profesiones|cargo|cargos|oficio)$/.test(label))put(type==='ficticio'?'ocupacion':'profesion',value);
  else if(/^(especie|raza)$/.test(label))put('especie',value);
  else if(/^(universo|franquicia|saga)$/.test(label))put(type==='ficticio'?'universo':'ambito',value);
  else if(/^(medio|medio de origen|primera aparicion|primera aparicion)$/.test(label))put('medio_origen',value);
  else if(/^(habilidades|habilidad)$/.test(label))putList('habilidades',value);else if(/^(poderes|poder)$/.test(label))putList('poderes',value);
  else if(/^(armas|arma)$/.test(label))putList('armas',value);
  else if(/^(afiliaciones|afiliacion|organizacion|organizaciones|congregacion|partido)$/.test(label))putList(type==='ficticio'?'afiliaciones':'organizaciones',value);
  else if(/^(creador|creada por|creado por|autor|autora)$/.test(label))put('creador',value);
  else if(/^(predecesor|predecesora)$/.test(label))put('predecesor',value);
  else if(/^(sucesor|sucesora)$/.test(label))put('sucesor',value);
  else if(/^(obras notables|obras|publicaciones)$/.test(label))put('obras',value);
  else if(/^(estudios|educacion|formacion|alma mater)$/.test(label))put('formacion',value);
  else if(/^(alias|otros nombres|nombre secular|nombre real)$/.test(label))put('otros_nombres',value);
 }
 return a;
}
function schemaFor(type, mapped){
 const common={tipo:type||null,plantilla:type==='real'?'persona_real_v2':type==='ficticio'?'personaje_ficticio_v2':null,plantillaVersion:2,genero:null,humano:null,vivo:null,descripcion_generada:true};
 const fields=type==='real'?{profesion:null,ocupacion:null,nacionalidad:null,lugar_nacimiento:null,fecha_nacimiento:null,fecha_fallecimiento:null,ambito:null,organizaciones:null,logros:null,predecesor:null,sucesor:null,obras:null,formacion:null}:{universo:null,franquicia:null,medio_origen:null,especie:null,habilidades:null,poderes:null,armas:null,afiliaciones:null,aliados:null,enemigos:null,origen:null,creador:null,rasgos:null};
 return {...common,...fields,...mapped};
}
function conciseDescription(title,metaDesc,content,attributes){
 const candidates=[metaDesc,...String(content||'').split(/\n+/)].map(x=>clean(x)).filter(x=>x.length>=45);
 let text=candidates.find(x=>!/^contenido|^ir a la navegacion|^editar$/i.test(x))||'';
 if(text){text=text.split(/(?<=[.!?])\s+/).slice(0,2).join(' ');const n=String(title||'').replace(/\s*\([^)]*\)\s*$/,'').trim();if(n){const esc=n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');text=text.replace(new RegExp('^'+esc+'\\s*(?:\\([^)]*\\))?\\s*[,;:—-]?\\s*','i'),'');}text=text.replace(/^(?:fue|es|ha sido|era)\s+/i,'').replace(/^(?:el|la|un|una)\s+/i,'').trim();text=text.slice(0,420).replace(/\s+$/,'');if(text)text=text.charAt(0).toLocaleUpperCase('es')+text.slice(1);if(text&&!/[.!?]$/.test(text))text+='.';if(text.length>=20)return text;}
 const bits=[];for(const k of ['profesion','ocupacion','universo','especie','medio_origen','nacionalidad','ambito'])if(attributes[k])bits.push(String(attributes[k]));
 if(attributes.tipo==='real'&&(attributes.profesion||attributes.ocupacion))return 'Figura real que se desempeñó como '+String(attributes.profesion||attributes.ocupacion)+'.';
 if(attributes.tipo==='ficticio'&&attributes.universo)return 'Personaje ficticio del universo '+String(attributes.universo)+'.';
 if(bits.length)return (attributes.tipo==='ficticio'?'Personaje ficticio vinculado a ':'Figura real vinculada a ')+bits.slice(0,3).join(', ')+'.';
 return '';
}
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
 const gender=String(entity.gender||'').toLowerCase();if(['male','masculino','man'].includes(gender))attributes.genero='hombre';else if(['female','femenino','woman'].includes(gender))attributes.genero='mujer';else if(['non-binary','nonbinary','otro'].includes(gender))attributes.genero='otro';const types=Array.isArray(entity['@type'])?entity['@type']:[entity['@type']||''];
 const requestedType=String(req.body?.type||'').toLowerCase();const inferredType=types.some(t=>/FictionalCharacter|VideoGameCharacter/i.test(t))?'ficticio':types.some(t=>/^Person$/i.test(t))?'real':'';const fichaType=['real','ficticio'].includes(requestedType)?requestedType:inferredType;
 const mapped=mapFacts(structured,fichaType);const typed=schemaFor(fichaType,mapped);Object.assign(attributes,typed);if(attributes.fecha_fallecimiento)attributes.vivo=false;if(gender==='male'||gender==='masculino')attributes.genero='hombre';if(gender==='female'||gender==='femenino')attributes.genero='mujer';
 if(structured.length)attributes.datos_fuente=structured;if(content)attributes.contenido_fuente=content.slice(0,MAX_TEXT);
 const description=conciseDescription(title,metaDesc,content,attributes);const image=imageFrom(entity.image,finalUrl)||imageFrom(meta(html,'og:image'),finalUrl)||imageFrom(meta(html,'twitter:image'),finalUrl);
 if(!title&&!description&&!structured.length&&!content)return res.status(422).json({error:'La página no contiene texto aprovechable para una ficha. Probá otra referencia del mismo personaje.'});
 return res.status(200).json({ok:true,source:finalUrl,extracted:{name:title,description,aliases:aliases.filter(x=>typeof x==='string').slice(0,10),image,attributes,content_excerpt:content.slice(0,5000)},notice:`Borrador extraído del contenido disponible de la página (${content.length} caracteres de texto analizados). ${structured.length} dato(s) de tablas o datos estructurados detectados. No se verificó su exactitud: revisá y corregí todo antes de guardar.`});
 }catch(e){const aborted=e.name==='AbortError';return res.status(502).json({error:aborted?'La página tardó demasiado en responder. Probá otra referencia del mismo personaje.':'No se pudo leer la página de referencia. Probá otra fuente.',detail:aborted?'timeout':String(e.message||'').slice(0,120)})}finally{if(timer)clearTimeout(timer)}};
