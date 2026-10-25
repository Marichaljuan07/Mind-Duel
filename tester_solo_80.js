// v3.13.80 — pruebas del modo Solo (deducciones, 5 niveles y pistas). Usa las 98 fichas reales.
// Se carga window.MindKnowledge como en el navegador. No certifica precisión: mide cobertura y coherencia.
const K = require('./conocimiento.js');
global.window = { MindKnowledge: K };
const L = require('./motor_logico.js'), S = require('./solo.js'), fs = require('fs'), vm = require('vm');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('./personajes.js', 'utf8') + ';globalThis.__P=PERSONAJES', ctx);
const P = ctx.__P;
let ok = 0, mal = 0;
const t = (nombre, cond) => { if (cond) ok++; else { mal++; console.log('FALLA:', nombre); } };
const por = n => P.find(p => p.nombre === n);

// Respuesta "de antes": lógica + concepto (igual que el juego sin deducción).
function antes(q, p) {
  const e = K.enriquecer(p); let v = L.evaluarPregunta(q, e);
  if (v == null) { const c = K.conceptoDePregunta && K.conceptoDePregunta(q); if (c) v = L.resolverConcepto(c, e); }
  return v;
}
// Respuesta "de ahora": además deduce.
function ahora(q, p) {
  const v = antes(q, p); if (v != null) return { nivel: v ? 'si' : 'no', fuente: 'logica' };
  const d = S.deducir(L, q, K.enriquecer(p)); return d ? { nivel: d.nivel, fuente: 'deduccion' } : null;
}

// 1) Cobertura en 10 personajes x 15 preguntas comunes.
const Q = ['¿Es real?', '¿Es hombre?', '¿Está vivo?', '¿Es humano?', '¿Es europeo?', '¿Es de la Edad Media?', '¿Es de la Antigüedad?', '¿Es de anime?', '¿Es de Marvel?', '¿Es un artista?', '¿Tiene hijos?', '¿Hace combate?', '¿Es un animal?', '¿Tiene poderes?', '¿Es pacifista?'];
const MUESTRA = ['Albert Einstein', 'Cleopatra', 'Batman', 'Naruto Uzumaki', 'Shrek', 'Frida Kahlo', 'Darth Vader', 'Cristiano Ronaldo', 'Pikachu', 'Julio César'];
let sinAntes = 0, sinAhora = 0, firmes = 0, probables = 0;
for (const n of MUESTRA) for (const q of Q) {
  const p = por(n); if (antes(q, p) == null) sinAntes++;
  const a = ahora(q, p); if (a == null) sinAhora++; else if (a.fuente === 'deduccion') { if (a.nivel === 'si' || a.nivel === 'no') firmes++; else probables++; }
}
console.log('Solo, 10 personajes x 15 preguntas: sin respuesta ANTES ' + sinAntes + '/150 (' + Math.round(sinAntes / 1.5) + '%) -> AHORA ' + sinAhora + '/150 (' + Math.round(sinAhora / 1.5) + '%). Deducidas: ' + firmes + ' firmes y ' + probables + ' "probablemente".');
t('mejora la cobertura', sinAhora < sinAntes);

// 2) Coherencia: la deducción nunca contradice a la lógica existente cuando esta sí sabe.
const VARIANTES = Q.concat(['¿Es de Europa?', '¿Es de América?', '¿Es de Asia?', '¿Es de África?', '¿Es de Oceanía?', '¿Es del Renacimiento?', '¿Tiene hijos?', '¿Participa en combates?', '¿Es de la Antigüedad?', '¿Es un animal?', '¿Es artista?']);
let comparados = 0, choques = 0, ejemplos = [];
for (const p of P) for (const q of VARIANTES) {
  const v = antes(q, p); if (v == null) continue;
  const d = S.deducir(L, q, K.enriquecer(p)); if (!d) continue;
  comparados++;
  const dv = (d.nivel === 'si' || d.nivel === 'psi');
  if (dv !== v) { choques++; if (ejemplos.length < 6) ejemplos.push(p.nombre + ' / ' + q + ' lógica=' + v + ' deduce=' + d.nivel); }
}
console.log('Coherencia: ' + comparados + ' casos donde lógica y deducción responden; contradicciones: ' + choques + (ejemplos.length ? ' -> ' + ejemplos.join(' ; ') : ''));
t('la deducción no contradice a la lógica existente', choques === 0);

// 3) Casos concretos esperables.
const d = (n, q) => { const r = S.deducir(L, q, K.enriquecer(por(n))); return r ? r.nivel : null; };
t('Einstein no es un animal', d('Albert Einstein', '¿Es un animal?') === 'no');
t('Einstein no es de la Edad Media', d('Albert Einstein', '¿Es de la Edad Media?') === 'no');
t('Einstein tiene hijos', d('Albert Einstein', '¿Tiene hijos?') === 'si');
t('Cleopatra es de la Antigüedad', d('Cleopatra', '¿Es de la Antigüedad?') === 'si' || antes('¿Es de la Antigüedad?', por('Cleopatra')) === true);
t('Messi (vivo) no es de la Edad Media', (d('Lionel Messi', '¿Es de la Edad Media?') === 'no') || antes('¿Es de la Edad Media?', por('Lionel Messi')) === false);
t('Darth Vader no es europeo (espacio)', d('Darth Vader', '¿Es europeo?') === 'no');
t('Batman: Europa "probablemente no"', d('Batman', '¿Es europeo?') === 'pno');
t('Batman: Edad Media "probablemente no"', d('Batman', '¿Es de la Edad Media?') === 'pno');
t('Frida no tiene hijos', d('Frida Kahlo', '¿Tiene hijos?') === 'no');
t('Leonardo: hijos "probablemente no" (no documentado)', d('Leonardo da Vinci', '¿Tiene hijos?') === 'pno');
t('una pregunta que no sabe deducir devuelve null', d('Pikachu', '¿Es un hombre?') === null);
t('los textos de nivel existen', S.texto('psi') === 'PROBABLEMENTE SÍ.' && S.texto('pno') === 'PROBABLEMENTE NO.' && S.texto('si') === 'SÍ.' && S.texto('no') === 'NO.');
t('todas las fichas de EPOCAS y HIJOS existen en el catálogo', Object.keys(S.EPOCAS).concat(Object.keys(S.HIJOS)).every(n => !!por(n)));

// 4) Pistas: existen, no filtran el nombre ni la franquicia, y varían sin repetirse.
const norm = s => L.normalizar(s);
let sinPista = 0, fugas = 0;
for (const p of P) for (const nivel of [1, 2]) {
  const h = S.pista(p, [], nivel, L, Math.random, []);
  if (!h) { sinPista++; continue; }
  const cuerpo = norm(h);
  const prohibidas = [p.nombre].concat(p.alias || [], [p.universo]).filter(x => x && String(x).length >= 4).map(norm);
  if (prohibidas.some(x => x !== 'real' && new RegExp('(^|[^a-z0-9])' + x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)').test(cuerpo))) fugas++;
}
console.log('Pistas: ' + (P.length * 2 - sinPista) + ' de ' + P.length * 2 + ' generadas (el resto usa la pista de siempre); fugas del nombre o universo: ' + fugas);
t('las pistas nuevas no filtran nombre ni universo', fugas === 0);
t('hay pista nueva para la mayoría de las fichas', sinPista <= P.length * 2 * 0.35);
// Variedad: Einstein nivel 2 repetido en 6 partidas seguidas con memoria => no repite hasta agotar.
const memoria = []; const einstein = por('Albert Einstein'); const vistas = [];
for (let i = 0; i < 4; i++) { const h = S.pista(einstein, [], 2, L, Math.random, memoria); if (h) vistas.push(h); }
const distintasEinstein = new Set(vistas).size;
t('pistas de nivel 2 de Einstein: no se repiten mientras haya otras (' + distintasEinstein + ' distintas de ' + vistas.length + ')', distintasEinstein === Math.min(vistas.length, S.candidatas(einstein, [], 2, L).length));
// Una pista no revela lo que el jugador ya sabe.
const conRegion = S.candidatas(por('Batman'), [{ texto: '¿Es de América?', answer: true }], 1, L);
t('no da pista de región si el jugador ya preguntó por continentes', !conRegion.some(c => c.id === 'region'));

console.log('Controles: ' + ok + ' correctos, ' + mal + ' fallidos');
process.exitCode = mal ? 1 : 0;
