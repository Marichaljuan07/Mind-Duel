/* Sincronización de lectura: el backend de Vercel conserva la clave privada.
   Si la conexión falla, el juego continúa con sus datos locales originales. */
(function () {
  'use strict';
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const ATTRIBUTE_KEYS = new Set([
    'real','ficticio','hombre','mujer','humano','animal','vivo','region_europa','region_america',
    'peliculas','libros','comics','television','anime','combate','poderoso','marvel','dc','star_wars',
    'hijos','terrestre','magia','deportista','futbolista','cientifico','escritor','musico','artista',
    'pacifista','antiguedad','medieval','renacimiento','nac_ingles','nac_espanol','nacio_usa','religioso','cargo_publico','region_asia','filosofo','politico','militar','rico'
  ]);
  const QUEUE_KEY='mind_duel_knowledge_queue_v1', DEVICE_KEY='mind_duel_device_id_v1';
  function getDeviceId(){let id='';try{id=localStorage.getItem(DEVICE_KEY)||'';if(!/^(md-)?[a-f0-9-]{32,80}$/i.test(id)){id='md-'+Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem(DEVICE_KEY,id)}}catch{}return id||('md-'+Math.random().toString(36).slice(2)+Date.now().toString(36));}
  function getQueue(){try{const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');return Array.isArray(q)?q:[]}catch{return[]}}
  function saveQueue(q){try{localStorage.setItem(QUEUE_KEY,JSON.stringify(q.slice(-500)));return true}catch{return false}}
  let flushing=null;
  function enqueueClaim({character,attribute_key,value,source_note}={}){if(!character||!ATTRIBUTE_KEYS.has(attribute_key)||typeof value!=='boolean')return{ok:false,skipped:true};const q=getQueue(),key=normalize(character)+'|'+attribute_key,item={character:String(character).trim().slice(0,120),attribute_key,value,source_note:String(source_note||'').slice(0,500)};const i=q.findIndex(x=>normalize(x.character)+'|'+x.attribute_key===key);if(i>=0)q[i]=item;else q.push(item);return saveQueue(q)?{ok:true,queued:true,pending:q.length}:{ok:false,message:'No se pudo guardar temporalmente.'}}
  async function flushClaims(keepalive=false){if(flushing)return flushing;let q=getQueue();if(!q.length)return{ok:true,pending:0};flushing=(async()=>{while(q.length){const batch=q.slice(0,50);try{const r=await fetch('/api/knowledge',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({device_id:getDeviceId(),votes:batch}),keepalive:!!keepalive});const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok)break;q=q.slice(batch.length);saveQueue(q)}catch{break}}return{ok:q.length===0,pending:q.length}})().finally(()=>{flushing=null});return flushing}
  window.addEventListener('pagehide',()=>{flushClaims(true)});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushClaims(true)});window.addEventListener('online',()=>flushClaims(false));if(getQueue().length)flushClaims(false);

  async function sync() {
    const response = await fetch('/api/shared-data', { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data || data.ok !== true || !Array.isArray(data.characters)) throw new Error('Respuesta de base compartida inválida');

    const people = (typeof PERSONAJES !== 'undefined' && Array.isArray(PERSONAJES)) ? PERSONAJES : window.PERSONAJES;
    if (Array.isArray(people)) {
      const byName = new Map(people.map(person => [normalize(person.nombre), person]));
      for (const row of data.characters) {
        if (!row || !row.name || row.status === 'archived' || (row.status === 'candidate' || row.status === 'needs_review' || row.status === 'pending')) continue;
        const attributes = row.attributes && typeof row.attributes === 'object' && !Array.isArray(row.attributes) ? row.attributes : {};
        const merged = { ...attributes, nombre: row.name, alias: Array.isArray(row.aliases) ? row.aliases : (attributes.alias || []), descripcion: row.description || attributes.descripcion || '', _sharedCatalog: true, _catalogStatus: row.status || 'active', _catalogId: row.id || null };
        const existing = byName.get(normalize(row.name));
        if (existing) Object.assign(existing, merged);
        else { people.push(merged); byName.set(normalize(row.name), merged); }
      }

      // Solo las afirmaciones marcadas como verificadas pueden completar datos ausentes.
      const grouped = new Map();
      for (const claim of (Array.isArray(data.verifiedClaims) ? data.verifiedClaims : [])) {
        if (!claim || !ATTRIBUTE_KEYS.has(claim.attribute_key) || typeof claim.value !== 'boolean') continue;
        const key = `${claim.character_id}|${claim.attribute_key}`;
        if (!grouped.has(key)) grouped.set(key, { characterId: claim.character_id, attribute: claim.attribute_key, values: new Set() });
        grouped.get(key).values.add(claim.value);
      }
      const rowById = new Map(data.characters.map(row => [row.id, row]));
      for (const group of grouped.values()) {
        if (group.values.size !== 1) continue; // Conflictos: no inferir ni pisar datos.
        const row = rowById.get(group.characterId);
        const person = row && byName.get(normalize(row.name));
        if (!person) continue;
        const current = window.MindKnowledge && typeof window.MindKnowledge.valor === 'function'
          ? window.MindKnowledge.valor(person, group.attribute) : null;
        if (current !== null && current !== undefined) continue;
        person._mindKnowledge = person._mindKnowledge || {};
        person._mindKnowledge[group.attribute] = [...group.values][0];
      }
    }

    // El banco compartido amplía el conjunto de preguntas sugeribles sin reemplazar el motor local.
    const canonicalPrompt = value => String(value || '').trim()
      .replace(/poderez/ig, 'poderes')
      .replace(/¿?tu personaje es americano\?/ig, '¿Es de América?')
      .replace(/\s+/g, ' ');
    const prompts = [...new Set((Array.isArray(data.questions) ? data.questions : [])
      .map(row => canonicalPrompt(row && row.prompt))
      .filter(prompt => prompt.length >= 6 && prompt.length <= 140 && prompt.startsWith('¿')) )];
    window.MindDuelSharedQuestions = prompts;
    const pool = window.Sugeridor && window.Sugeridor.POOL;
    if (Array.isArray(pool)) {
      const known = new Set(pool.map(normalize));
      for (const prompt of prompts) {
        const key = normalize(prompt);
        if (!known.has(key)) { pool.push(prompt); known.add(key); }
      }
    }
    window.MindDuelSupabaseStatus = { connected: true, characters: data.characters.length, questions: prompts.length, verifiedClaims: (data.verifiedClaims || []).length, fetchedAt: data.fetchedAt || null };
    window.dispatchEvent(new CustomEvent('mindduel:supabase-ready', { detail: window.MindDuelSupabaseStatus }));
    return window.MindDuelSupabaseStatus;
  }

  window.MindDuelSupabase = { status: () => window.MindDuelSupabaseStatus || { connected: false }, submitClaim: enqueueClaim, queueClaim: enqueueClaim, flushClaims, pendingClaims: () => getQueue().length };

  // Se ejecuta en segundo plano; la versión local sigue funcionando si Supabase falla.
  window.MindDuelSupabaseReady = sync().catch(error => {
    window.MindDuelSupabaseStatus = { connected: false, error: error.message };
    console.warn('[Mind Duel] Se continúa con los datos locales; la base compartida no respondió.');
    return window.MindDuelSupabaseStatus;
  });
})();
