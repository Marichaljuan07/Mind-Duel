// v3.13.78 — pruebas del Clásico: sin preguntas redundantes + razonamiento visible.
// Usa los datos reales de las fichas; los hechos desconocidos se responden "no sé". No certifica precisión.
global.Sugeridor = require('./sugeridor.js');
const L = require('./motor_logico.js'), C = require('./clasico.js'), fs = require('fs'), vm = require('vm');
let OLD = null; try { OLD = require('./clasico_v77_referencia.js'); } catch (e) {}
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('./personajes.js', 'utf8') + ';globalThis.__P=PERSONAJES', ctx);
const P = ctx.__P;
let ok = 0, mal = 0;
const t = (nombre, cond) => { if (cond) { ok++; } else { mal++; console.log('FALLA:', nombre); } };

// 1) Caso real: la partida contra Shrek del 24/10 (respuestas del jugador, en orden).
const partida = [
  ['¿Es una persona real?', 'no'], ['¿Tiene poderes?', 'no'], ['¿Es humano?', 'no'],
  ['¿Aparece en libros?', 'no'], ['¿Aparece en cómics?', 'no'], ['¿Es una mujer?', 'no'],
  ['¿Aparece en televisión o series?', 'si'], ['¿Es de DC Comics?', 'no'],
  ['¿Está vivo en su historia?', 'si'], ['¿Es de un anime?', 'no'], ['¿Es un hombre?', 'si']
];
const s = C.nuevo(P);
partida.forEach(([q, a]) => C.responder(s, L, q, a));
t('superpoderes ya está respondida por poderes', C.esRedundante(s, L, '¿Tiene superpoderes?'));
t('sigue con vida ya está respondida por vivo', C.esRedundante(s, L, '¿Sigue con vida?'));
t('usa magia se deduce de poderes=NO', C.esRedundante(s, L, '¿Usa magia?'));
t('es ficticio se deduce de real=NO', C.esRedundante(s, L, '¿Es ficticio?'));
t('hombre=SÍ vuelve redundante mujer', C.esRedundante(s, L, '¿Es una mujer?'));
t('una pregunta nueva NO es redundante (Star Wars)', !C.esRedundante(s, L, '¿Es de Star Wars?'));
const s2 = C.nuevo(P); C.responder(s2, L, '¿Es una persona real?', 'si');
t('persona real => franquicias redundantes', C.esRedundante(s2, L, '¿Es de Marvel?') && C.esRedundante(s2, L, '¿Es de Star Wars?'));
const s3 = C.nuevo(P); C.responder(s3, L, '¿Es una mujer?', 'no');
t('mujer=NO no implica hombre (puede no ser binario)', !C.esRedundante(s3, L, '¿Es un hombre?'));
const s4 = C.nuevo(P); C.responder(s4, L, '¿Tiene poderes?', 'nose');
t('misma pregunta con otra palabra ya preguntada (aunque sea no lo sé)', C.esRedundante(s4, L, '¿Tiene superpoderes?'));

// 2) 98 partidas simuladas: ninguna pregunta elegida es redundante; razonamiento y notas sanos.
const rnd = (() => { let x = 11; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; })();
const basura = /undefined|null|NaN/;
function jugar(Cm, target, medir) {
  const st = Cm.nuevo(P); let fails = 0, notas = 0, redund = 0, gano = false;
  for (let it = 0; it < 80; it++) {
    let q = null; const adiv = Cm.debeAdivinar(st) || st.n >= 20;
    if (!adiv) q = Cm.pregunta(st, L);
    if (adiv || !q) {
      const m = Cm.mejor(st); if (!m) break;
      if (medir) {
        const w = C.razonar(st, L, m, rnd);
        if (w) t('razonamiento nombra al candidato y no tiene basura', w.includes(m.p.nombre) && !basura.test(w));
      }
      if (m.p === target) { gano = true; break; }
      Cm.rechazar(st, m.i); fails++;
      if (medir) t('nota de fallo nombra al personaje', C.notaFallo(st, m.p.nombre).includes(m.p.nombre));
      if (fails >= 2) break;
      continue;
    }
    if (C.esRedundante(st, L, q)) redund++;
    if (medir) { const n = C.nota(st, L, q, rnd); if (n) { notas++; t('nota sin basura', !basura.test(n)); } }
    const v = Sugeridor.val(L, q, target);
    Cm.responder(st, L, q, v === null ? 'nose' : v ? 'si' : 'no');
  }
  return { gano, n: st.n, redund, notas };
}
let gan = 0, sumN = 0, red = 0, notasMax = 0;
for (const p of P) { const r = jugar(C, p, true); if (r.gano) { gan++; sumN += r.n; } red += r.redund; notasMax = Math.max(notasMax, r.notas); }
t('0 preguntas redundantes en las 98 partidas', red === 0);
t('máximo 3 notas de rumbo por partida', notasMax <= 3);
console.log('Clásico v3.13.78: adivinó ' + gan + '/' + P.length + ', promedio ' + (sumN / Math.max(1, gan)).toFixed(1) + ' preguntas (partidas ganadas), redundantes ' + red + ', máx. notas por partida ' + notasMax);
if (OLD) {
  let g2 = 0, s2n = 0;
  for (const p of P) { const r = jugar(OLD, p, false); if (r.gano) { g2++; s2n += r.n; } }
  console.log('Referencia v3.13.77: adivinó ' + g2 + '/' + P.length + ', promedio ' + (s2n / Math.max(1, g2)).toFixed(1) + ' preguntas');
  t('no adivina menos que la 77', gan >= g2);
  t('no necesita más preguntas que la 77', sumN / Math.max(1, gan) <= s2n / Math.max(1, g2) + 0.01);
}
console.log('Controles: ' + ok + ' correctos, ' + mal + ' fallidos');
process.exitCode = mal ? 1 : 0;
