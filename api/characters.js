const PROJECT_URL=(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
const SERVICE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
function sameOrigin(req){const o=req.headers.origin,h=req.headers.host;if(!o||!h)return false;try{return new URL(o).host===h}catch{return false}}
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'')}
async function upstreamError(response){
  let body='';
  try{body=(await response.text()).slice(0,1200)}catch{}
  let code='';
  try{const parsed=JSON.parse(body);code=String(parsed.code||parsed.error||'').slice(0,80)}catch{}
  return {status:response.status,code,body};
}
module.exports=async function(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Método no permitido.'})}
  if(!sameOrigin(req))return res.status(403).json({error:'Origen no permitido.'});
  if(!PROJECT_URL||!SERVICE_KEY)return res.status(503).json({error:'El catálogo compartido no está configurado.',diagnostic:{stage:'configuration',code:'missing_env'}});
  let stage='validation';
  try{
    const b=req.body||{};
    const name=String(b.name||'').trim().replace(/\s+/g,' ');
    if(name.length<2||name.length>120)return res.status(400).json({error:'El nombre debe tener entre 2 y 120 caracteres.'});
    const headers={apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`,Accept:'application/json'};
    stage='catalog_read';
    const r=await fetch(`${PROJECT_URL}/rest/v1/characters?select=id,slug,name,aliases,description,attributes,status&status=neq.archived&limit=1000`,{headers});
    if(!r.ok){const upstream=await upstreamError(r);console.error('[MindDuel characters]',JSON.stringify({stage,status:upstream.status,code:upstream.code,body:upstream.body}));return res.status(502).json({error:'No se pudo consultar el catálogo compartido.',diagnostic:{stage,status:upstream.status,code:upstream.code||null}})}
    const rows=await r.json();
    if(!Array.isArray(rows))throw Object.assign(new Error('Respuesta inesperada al consultar catálogo'),{stage,code:'invalid_catalog_response'});
    const key=norm(name);
    const matches=rows.filter(x=>norm(x.name)===key||(Array.isArray(x.aliases)&&x.aliases.some(a=>norm(a)===key)));
    if(matches.length)return res.status(200).json({ok:true,duplicate:true,matches:matches.slice(0,5)});
    const slugBase=key.replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'personaje';
    const slug=slugBase+'-'+Math.random().toString(36).slice(2,7);
    const aliases=String(b.aliases||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,20);
    const description=String(b.description||'').trim().slice(0,1000);
    const source=String(b.source||'').trim().slice(0,500);
    const image=String(b.image||'').trim().slice(0,500);
    const payload={name,slug,aliases,description,attributes:{},status:'candidate'};
    stage='character_insert';
    const w=await fetch(`${PROJECT_URL}/rest/v1/characters`,{method:'POST',headers:{...headers,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(payload)});
    if(!w.ok){const upstream=await upstreamError(w);console.error('[MindDuel characters]',JSON.stringify({stage,status:upstream.status,code:upstream.code,body:upstream.body}));return res.status(502).json({error:'Supabase rechazó el guardado de la ficha.',diagnostic:{stage,status:upstream.status,code:upstream.code||null}})}
    const created=await w.json();
    if(!Array.isArray(created)||!created[0])throw Object.assign(new Error('Supabase no devolvió la ficha creada'),{stage,code:'empty_insert_response'});
    return res.status(201).json({ok:true,character:created[0],source,image,notice:'Ficha candidata guardada. La fuente y la imagen quedan como referencias; los atributos aún deben verificarse.'});
  }catch(e){
    const stageName=e.stage||stage;
    console.error('[MindDuel characters]',JSON.stringify({stage:stageName,code:e.code||'unexpected_error',message:String(e.message||e).slice(0,500)}));
    return res.status(502).json({error:stageName==='catalog_read'?'No se pudo consultar el catálogo compartido.':'No se pudo guardar el personaje en la base compartida.',diagnostic:{stage:stageName,code:e.code||'unexpected_error'}});
  }
};
