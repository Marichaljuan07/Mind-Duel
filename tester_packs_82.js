// v3.13.82 — pruebas de los paquetes (Dragon Ball) en los DOS modos. Carga las capas como el navegador.
const K = require('./conocimiento.js');
global.window = { MindKnowledge: K };
const L = require('./motor_logico.js');
global.window.MindLogic = L;
const S = require('./sugeridor.js'); global.Sugeridor = S; global.window.Sugeridor = S;
const C = require('./clasico.js'), Packs = require('./packs.js'), fs = require('fs'), vm = require('vm');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('./personajes.js', 'utf8') + ';globalThis.__P=PERSONAJES', ctx);
const P = ctx.__P, BASE = P.length;
let ok = 0, mal = 0; const aviso = [];
const t = (nombre, cond) => { if (cond) ok++; else { mal++; console.log('FALLA:', nombre); } };
const n = s => L.normalizar(s);
const por = nom => P.find(p => n(p.nombre) === n(nom));

// 1) Instalación
const r = Packs.instalar({ L, K, S, personajes: P });
t('se instala', r.ok && Array.isArray(r.agregados));
t('se agregan 28 personajes de Dragon Ball', r.agregados.length === 28 && P.length === BASE + 28);
t('sin nombres repetidos', new Set(P.map(p => n(p.nombre))).size === P.length);
t('Goku (base) recibe los atributos del paquete', (por('Goku').pk || []).includes('saiyajin') && por('Goku').pack === 'dragonball');
t('segunda instalación no duplica', Packs.instalar({ L, K, S, personajes: P }).ya === true && P.length === BASE + 28);
t('la ficha enriquecida conserva los atributos del paquete', (K.enriquecer(por('Vegeta')).pk || []).includes('saiyajin'));
t('Garfield corregido (no es humano, sí animal)', por('Garfield').humano === false && por('Garfield').animal === true);

// 2) Franquicias cerradas: la membresía tiene que ser EXACTA
const set = c => P.filter(p => L.resolverConcepto(c, K.enriquecer(p)) === true).map(p => p.nombre).sort();
const igual = (a, b) => JSON.stringify(a) === JSON.stringify([...b].sort());
const packNombres = Packs.PACKS[0].personajes.map(p => p.nombre);
const animeEsp = ['Goku', 'Naruto Uzumaki', 'Pikachu', 'Totoro', ...packNombres];
const animeObt = set('anime');
if (!igual(animeObt, animeEsp)) aviso.push('anime difiere. Sobran: ' + animeObt.filter(x => !animeEsp.includes(x)).join(', ') + ' | Faltan: ' + animeEsp.filter(x => !animeObt.includes(x)).join(', '));
t('anime: membresía exacta', igual(animeObt, animeEsp));
const marvelEsp = ['Spider-Man', 'Iron Man', 'Captain America', 'Thor', 'Black Widow', 'Hulk', 'Hawkeye', 'Black Panther', 'Deadpool'];
if (!igual(set('universo_marvel'), marvelEsp)) aviso.push('marvel: ' + set('universo_marvel').join(', '));
t('Marvel: membresía exacta', igual(set('universo_marvel'), marvelEsp));
const dcEsp = ['Batman', 'Superman', 'Wonder Woman'];
if (!igual(set('universo_dc'), dcEsp)) aviso.push('dc: ' + set('universo_dc').join(', '));
t('DC: membresía exacta', igual(set('universo_dc'), dcEsp));
const swEsp = ['Darth Vader', 'Luke Skywalker', 'Leia Organa', 'Yoda'];
if (!igual(set('universo_star_wars'), swEsp)) aviso.push('star wars: ' + set('universo_star_wars').join(', '));
t('Star Wars: membresía exacta', igual(set('universo_star_wars'), swEsp));
const hpEsp = ['Harry Potter', 'Hermione Granger', 'Voldemort'];
if (!igual(set('universo_harry_potter'), hpEsp)) aviso.push('harry potter: ' + set('universo_harry_potter').join(', '));
t('Harry Potter: membresía exacta', igual(set('universo_harry_potter'), hpEsp));
t('Shrek no es de anime (antes "no sé")', L.resolverConcepto('anime', K.enriquecer(por('Shrek'))) === false);
t('Einstein no es de Marvel', L.resolverConcepto('universo_marvel', K.enriquecer(por('Albert Einstein'))) === false);

// 3) Preguntas propias del paquete
const v = (c, nom) => Packs.valorPack(c, K.enriquecer(por(nom)));
t('Vegeta es saiyajin', v('pk_saiyajin', 'Vegeta') === true);
t('Piccolo no es saiyajin', v('pk_saiyajin', 'Piccolo') === false);
t('Piccolo es namekiano', v('pk_namekiano', 'Piccolo') === true);
t('Freezer es villano y Goku no', v('pk_villano', 'Freezer') === true && v('pk_villano', 'Goku') === false);
t('Vegeta villano es dudoso (no lo sé)', v('pk_villano', 'Vegeta') === null);
t('Batman: pregunta propia del paquete = no se aplica', v('pk_saiyajin', 'Batman') === null);
t('Batman no es de Dragon Ball; Vegeta sí', v('pk_dragonball', 'Batman') === false && v('pk_dragonball', 'Vegeta') === true);
t('Gohan es hijo de Goku, Trunks no', v('pk_hijo_goku', 'Gohan') === true && v('pk_hijo_goku', 'Trunks') === false);
t('Beerus es dios de la destrucción, Whis no', v('pk_destruccion', 'Beerus') === true && v('pk_destruccion', 'Whis') === false);

// 4) ¿Se pueden distinguir entre sí? (mismo vector de respuestas = confusión segura)
const miembros = P.filter(p => p.pack === 'dragonball');
const preguntasTodas = [...new Set([...S.POOL])];
const vector = p => preguntasTodas.map(q => { const x = S.val(L, q, p); return x === null ? 'n' : x ? '1' : '0'; }).join('');
const grupos = {}; miembros.forEach(p => { (grupos[vector(p)] = grupos[vector(p)] || []).push(p.nombre); });
const repetidos = Object.values(grupos).filter(g => g.length > 1);
console.log('Dragon Ball (' + miembros.length + ' personajes): grupos que NO se pueden distinguir entre sí: ' + (repetidos.length ? repetidos.map(g => g.join(' = ')).join(' ; ') : 'ninguno'));
t('todos los personajes del paquete se distinguen entre sí', repetidos.length === 0);

// 5) Modo Clásico: partidas honestas contra cada personaje (hechos desconocidos = "no lo sé")
function jugar(target) {
  const s = C.nuevo(P); let fails = 0, gano = false;
  for (let it = 0; it < 80; it++) {
    let q = null; const adiv = C.debeAdivinar(s) || s.n >= 20;
    if (!adiv) q = C.pregunta(s, L);
    if (adiv || !q) {
      const m = C.mejor(s); if (!m) break;
      if (m.p === target) { gano = true; break; }
      C.rechazar(s, m.i); fails++; if (fails >= 2) break; continue;
    }
    const x = S.val(L, q, target);
    C.responder(s, L, q, x === null ? 'nose' : x ? 'si' : 'no');
  }
  return { gano, n: s.n, fails };
}
let g = 0, sn = 0; const perdidos = [];
for (const p of miembros) { const rr = jugar(p); if (rr.gano) { g++; sn += rr.n; } else perdidos.push(p.nombre); }
console.log('Clásico, personajes de Dragon Ball (' + miembros.length + '): adivinó ' + g + '/' + miembros.length + ', promedio ' + (sn / Math.max(1, g)).toFixed(1) + ' preguntas' + (perdidos.length ? '. Falló con: ' + perdidos.join(', ') : ''));
t('el Clásico adivina al menos 85% del paquete', g / miembros.length >= 0.85);
let g2 = 0, sn2 = 0; const base98 = P.slice(0, BASE);
for (const p of base98) { const rr = jugar(p); if (rr.gano) { g2++; sn2 += rr.n; } }
console.log('Clásico, personajes del catálogo base (' + BASE + ') con el catálogo ampliado: adivinó ' + g2 + '/' + BASE + ', promedio ' + (sn2 / Math.max(1, g2)).toFixed(1) + ' preguntas');

// 5b) Personaje que el Cerebro NO conoce: se saca a Freezer del catálogo y se juega pensando en él.
function jugarDesconocido(target, catalogo) {
  const s = C.nuevo(catalogo); let fails = 0, gano = false, contra = null; const verifs = [];
  for (let it = 0; it < 80; it++) {
    let q = null; const adiv = C.debeAdivinar(s) || s.n >= 20;
    if (!adiv) q = C.pregunta(s, L);
    if (adiv || !q) {
      const m = C.mejor(s); if (!m) break;
      const e = C.encaje(s, L); contra = e ? e.contra : null;
      if (m.p === target) { gano = true; break; }
      C.rechazar(s, m.i); fails++; if (fails >= 2) break; continue;
    }
    if (s.verifQs && s.verifQs.includes(q)) verifs.push(q);
    const x = S.val(L, q, target);
    C.responder(s, L, q, x === null ? 'nose' : x ? 'si' : 'no');
  }
  return { gano, fails, contra, verifs, n: s.n };
}
const freezer = por('Freezer');
const sinFreezer = P.filter(p => p !== freezer);
const dFr = jugarDesconocido(freezer, sinFreezer);
console.log('Freezer fuera del catálogo: gano=' + dFr.gano + ', intentos fallidos=' + dFr.fails + ', contradicciones del último intento=' + dFr.contra + ', preguntas de verificación=' + dFr.verifs.join(' | '));
t('con un personaje que no conoce, no lo acierta por casualidad', dFr.gano === false);
t('antes de rendirse verificó su sospecha', dFr.verifs.length >= 1);
t('al final admite que nada encajaba del todo (contradicciones >= 1)', dFr.contra !== null && dFr.contra >= 1);
// Con un personaje que sí conoce, la verificación confirma y adivina antes de la pregunta 12.
const dGo = jugarDesconocido(por('Goku'), P);
console.log('Goku (conocido): gano=' + dGo.gano + ' en ' + dGo.n + ' preguntas, verificaciones=' + dGo.verifs.join(' | '));
t('Goku se adivina verificando y sin esperar a la pregunta 12', dGo.gano && dGo.n <= 12);

// 6) Modo Solo: texto libre
const r1 = (q, nom) => Packs.responder(L, q, K.enriquecer(por(nom)));
t('Solo: "¿Es un saiyajin?" a Vegeta = sí', r1('¿Es un saiyajin?', 'Vegeta') === true);
t('Solo: "¿Es un saiyajin?" a Piccolo = no', r1('¿Es un saiyajin?', 'Piccolo') === false);
t('Solo: "¿es de dragon ball?" a Naruto = no', r1('¿es de dragon ball?', 'Naruto Uzumaki') === false);
t('Solo: "¿Es de anime?" a Shrek = no (antes se resistía)', r1('¿Es de anime?', 'Shrek') === false);
t('Solo: "¿Es de anime?" a Vegeta = sí', r1('¿Es de anime?', 'Vegeta') === true);
t('Solo: "¿Es un saiyajin?" a Batman no se inventa (null)', r1('¿Es un saiyajin?', 'Batman') === null);
t('Solo: "¿Es un villano?" a Vegeta (dudoso) no se inventa', r1('¿Es un villano?', 'Vegeta') === null);
t('Solo: una pregunta que no es de paquete devuelve null', r1('¿Tiene hijos?', 'Vegeta') === null);

// 7) Pregunta de aprendizaje con sentido
const pa = Packs.preguntaAprendizaje(por('Goku'));
t('aprendizaje: a Goku no le pregunta "¿Es futbolista?"', !pa || pa.concepto !== 'futbolista');
console.log('Pregunta de aprendizaje para Goku:', pa ? pa.pregunta : '(ninguna)');

if (aviso.length) { console.log('AVISOS DE DATOS (revisar):'); aviso.forEach(a => console.log('  - ' + a)); }
console.log('Controles: ' + ok + ' correctos, ' + mal + ' fallidos');
process.exitCode = mal ? 1 : 0;
