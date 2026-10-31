/* Sincronización de lectura: el backend de Vercel conserva la clave privada.
   Si la conexión falla, el juego continúa con sus datos locales originales. */
(function () {
  'use strict';
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const ATTRIBUTE_KEYS = new Set([
    'real','ficticio','hombre','mujer','humano','animal','vivo','region_europa','region_america',
    'peliculas','libros','comics','television','anime','combate','poderoso','marvel','dc','star_wars',
    'hijos','terrestre','magia','deportista','futbolista','cientifico','escritor','musico','artista',
    'pacifista','antiguedad','medieval','renacimiento','nac_ingles','nac_espanol','region_asia'
  ]);

  async function sync() {
    const response = await fetch('/api/shared-data', { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data || data.ok !== true || !Array.isArray(data.characters)) throw new Error('Respuesta de base compartida inválida');

    const people = (typeof PERSONAJES !== 'undefined' && Array.isArray(PERSONAJES)) ? PERSONAJES : window.PERSONAJES;
    if (Array.isArray(people)) {
      const byName = new Map(people.map(person => [normalize(person.nombre), person]));
      for (const row of data.characters) {
        if (!row || !row.name || row.status === 'archived') continue;
        const attributes = row.attributes && typeof row.attributes === 'object' && !Array.isArray(row.attributes) ? row.attributes : {};
        const merged = { ...attributes, nombre: row.name, alias: Array.isArray(row.aliases) ? row.aliases : (attributes.alias || []), descripcion: row.description || attributes.descripcion || '' };
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
    const prompts = [...new Set((Array.isArray(data.questions) ? data.questions : [])
      .map(row => String(row && row.prompt || '').trim())
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

  window.MindDuelSupabase = {
    status: () => window.MindDuelSupabaseStatus || { connected: false },
    submitClaim: async ({ character, attribute_key, value, source_note } = {}) => {
      if (typeof value !== 'boolean' || !ATTRIBUTE_KEYS.has(attribute_key)) return { ok: false, skipped: true };
      try {
        const response = await fetch('/api/knowledge', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ character, attribute_key, value, source_note })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) return { ok: false, status: response.status, message: result.error || 'Aporte no guardado.' };
        return result;
      } catch (error) {
        return { ok: false, message: 'Sin conexión con la base compartida.' };
      }
    }
  };

  // Se ejecuta en segundo plano; la versión local sigue funcionando si Supabase falla.
  window.MindDuelSupabaseReady = sync().catch(error => {
    window.MindDuelSupabaseStatus = { connected: false, error: error.message };
    console.warn('[Mind Duel] Se continúa con los datos locales; la base compartida no respondió.');
    return window.MindDuelSupabaseStatus;
  });
})();
