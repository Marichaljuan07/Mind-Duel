// Mind Duel Fusion: lectura compartida. La clave de servicio solo existe en Vercel.
const PROJECT_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function readTable(table, query) {
  const url = `${PROJECT_URL}/rest/v1/${table}?${query}`;
  const response = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Accept: 'application/json'
    }
  });
  if (!response.ok) throw new Error(`Supabase read failed: ${table} (${response.status})`);
  return response.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!PROJECT_URL || !SERVICE_KEY) {
    return res.status(503).json({ error: 'La conexión compartida todavía no está configurada en Vercel.' });
  }
  try {
    const [characters, questions, claims] = await Promise.all([
      readTable('characters', 'select=id,slug,name,aliases,description,attributes,status&status=neq.archived&order=name.asc&limit=1000'),
      readTable('question_bank', 'select=id,key,prompt,payload,status&order=key.asc&limit=1000'),
      readTable('knowledge_claims', 'select=character_id,attribute_key,value,status,independent_votes&status=eq.verified&limit=2000')
    ]);
    return res.status(200).json({
      ok: true,
      fetchedAt: new Date().toISOString(),
      characters: Array.isArray(characters) ? characters : [],
      questions: Array.isArray(questions) ? questions : [],
      verifiedClaims: Array.isArray(claims) ? claims : []
    });
  } catch (error) {
    console.error('[MindDuel shared-data]', error.message);
    return res.status(502).json({ error: 'No se pudo consultar la base compartida.' });
  }
};
