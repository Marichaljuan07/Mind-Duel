// Guarda aportes como propuestas. Nunca los convierte directamente en hechos verificados.
const crypto = require('crypto');
const PROJECT_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ALLOWED_ATTRIBUTES = new Set([
  'real','ficticio','hombre','mujer','humano','animal','vivo','region_europa','region_america',
  'peliculas','libros','comics','television','anime','combate','poderoso','marvel','dc','star_wars',
  'hijos','terrestre','magia','deportista','futbolista','cientifico','escritor','musico','artista',
  'pacifista','antiguedad','medieval','renacimiento','nac_ingles','nac_espanol','region_asia'
]);

function headers() {
  return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', Accept: 'application/json' };
}
async function supabase(table, query, options = {}) {
  const url = `${PROJECT_URL}/rest/v1/${table}${query ? `?${query}` : ''}`;
  return fetch(url, { method: options.method || 'GET', headers: { ...headers(), ...(options.headers || {}) }, body: options.body ? JSON.stringify(options.body) : undefined });
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Origen no permitido.' });
  if (!PROJECT_URL || !SERVICE_KEY) return res.status(503).json({ error: 'La conexión compartida todavía no está configurada.' });

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const character = String(body.character || '').trim().slice(0, 120);
    const attribute = String(body.attribute_key || '').trim();
    const value = body.value;
    const sourceNote = String(body.source_note || '').trim().slice(0, 500);
    if (!character || !ALLOWED_ATTRIBUTES.has(attribute) || typeof value !== 'boolean' || !sourceNote) {
      return res.status(400).json({ error: 'Aporte incompleto o inválido.' });
    }

    const characterQuery = new URLSearchParams({ select: 'id,name', name: `eq.${character}`, limit: '1' }).toString();
    const characterResponse = await supabase('characters', characterQuery);
    if (!characterResponse.ok) throw new Error(`Character lookup failed (${characterResponse.status})`);
    const matches = await characterResponse.json();
    if (!Array.isArray(matches) || !matches.length) {
      return res.status(422).json({ error: 'Ese personaje todavía no existe en la base compartida.' });
    }

    const forwarded = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const rateHash = crypto.createHash('sha256').update(forwarded).digest('hex').slice(0, 24);
    const rateMatchId = `rate:${rateHash}`;
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const rateQuery = new URLSearchParams({
      select: 'id', match_id: `eq.${rateMatchId}`, event_type: 'eq.knowledge_submission',
      created_at: `gte.${dayAgo}`, limit: '31'
    }).toString();
    const rateResponse = await supabase('match_events', rateQuery, { headers: { Prefer: 'count=exact' } });
    if (!rateResponse.ok) throw new Error(`Rate check failed (${rateResponse.status})`);
    const recentRows = await rateResponse.json();
    const contentRange = rateResponse.headers.get('content-range') || '';
    const counted = Number((contentRange.split('/')[1] || '').trim());
    if ((Number.isFinite(counted) && counted >= 30) || (Array.isArray(recentRows) && recentRows.length >= 30)) {
      return res.status(429).json({ error: 'Se alcanzó el límite temporal de aportes desde esta conexión.' });
    }

    const recentQuery = new URLSearchParams({
      select: 'id', match_id: `eq.${rateMatchId}`, event_type: 'eq.knowledge_submission',
      created_at: `gte.${new Date(Date.now() - 10 * 1000).toISOString()}`, limit: '1'
    }).toString();
    const recentResponse = await supabase('match_events', recentQuery);
    if (!recentResponse.ok) throw new Error(`Recent check failed (${recentResponse.status})`);
    if ((await recentResponse.json()).length) return res.status(429).json({ error: 'Esperá unos segundos antes de enviar otro aporte.' });

    const claimResponse = await supabase('knowledge_claims', '', {
      method: 'POST', headers: { Prefer: 'return=minimal' },
      body: { character_id: matches[0].id, attribute_key: attribute, value, status: 'proposed', source_type: 'player', source_note: sourceNote, independent_votes: 1 }
    });
    if (!claimResponse.ok) throw new Error(`Claim insert failed (${claimResponse.status})`);

    // Solo se guarda un hash de la IP para limitar abuso; no se almacena la IP original.
    const eventResponse = await supabase('match_events', '', {
      method: 'POST', headers: { Prefer: 'return=minimal' },
      body: { match_id: rateMatchId, event_type: 'knowledge_submission', payload: { character_id: matches[0].id, attribute_key: attribute } }
    });
    if (!eventResponse.ok) console.warn('[MindDuel] No se pudo guardar el registro de límite de aportes.');
    return res.status(201).json({ ok: true, status: 'proposed', message: 'Aporte guardado para revisión.' });
  } catch (error) {
    console.error('[MindDuel knowledge]', error.message);
    return res.status(502).json({ error: 'No se pudo guardar el aporte en la base compartida.' });
  }
};
