MIND DUEL · FUSION v3.0
Base A (sin servidor) + 50+ personajes de C + tema visual inspirado en B + CEREBRO que aprende.

JUGAR (sin Flask): servir la carpeta como sitio estático.
  Termux:  python3 -m http.server 5000   ->  http://127.0.0.1:5000
  Online:  subir la carpeta a GitHub Pages / Netlify y pasar el link.

COMO APRENDE EL CEREBRO (cerebro.js)
- Los SI/NO los decide siempre el motor con los datos del personaje.
- El Cerebro aprende LENGUAJE: frases -> concepto. Si no entiende una pregunta, intenta
  reconocerla por parecido (typos, variantes) contra todo lo que ya sabe; si es segura, la
  aprende sola ("Aprendí una forma nueva de preguntar eso"). Si es ambigua, no adivina.
- Lo que no entiende queda guardado. Abrí curador.html: elegís el concepto y lo "enseñás".
- Exportar/Importar JSON en el curador. Para que venga de fábrica en todos los dispositivos,
  pegá el contenido exportado ("aprendido") en aprendido_semilla.json.
- El localStorage es por dispositivo: lo que aprenden tus amigos queda en SU teléfono hasta que
  te manden el JSON exportado desde el curador.

TESTS (en esta carpeta):  node tester_regresion.js  y  node tester_cerebro.js

ENTRENADOR (Termux / Node)   [pkg install nodejs]
  node entrenador.js                -> lee entrenamiento.json ({concepto:[frases]}), enseña todo al Cerebro,
                                       actualiza aprendido_semilla.json y prueba resistencia a errores de tipeo.
  Para entrenar más: agregá frases a entrenamiento.json y volvé a correrlo.
  El Cerebro entrenado viaja con el juego (aprendido_semilla.json): quien abra el link ya lo tiene.
SUGERENCIAS: salen de lo que el jugador ya descubrió (sugeridor.js); nunca ofrecen preguntas incoherentes.
  node tester_sugeridor.js

AUDITORIA DEL ORACULO
  node auditoria.js                          -> pasa banco_preguntas.json por el mismo camino que el juego
  node auditoria.js banco_preguntas_2.json      y mide si responde lo que se preguntó (bien / mal / no entiende).
  node tester_datos.js                        -> verifica hechos obvios de los personajes.
  Para mejorar: agregá preguntas a un banco nuevo SIN ajustar antes, corré la auditoría, y corregí lo que falle.

ESTETICA: tema_synthwave.css (iconos y cerebro dibujados por mascara CSS; no hay imagenes).

FLUJO (v3.6): intro lenta -> JUGAR -> telon que se abre -> el Oraculo habla (efecto maquina de escribir)
  y ofrece JUGAR SOLO (activo), MODO ESPEJO y DUELO ONLINE (proximamente) -> ACEPTO -> partida.
  Paciencia: 3 intentos de ADIVINAR vacio revocan ese boton 30 s. Pregunta repetida: el Oraculo te regana (no gasta pregunta).
  SUGERENCIA se habilita al conocer lo basico (real/ficticio, genero, humano) o tras 5 preguntas.

MODO CLASICO (v3.8): el Cerebro adivina tu personaje. Respondes con 5 botones (SI, NO, NO LO SE, PROB. SI, PROB. NO).
  Si no lo adivina te pide el nombre y lo guarda (curador.html -> "Personajes nuevos capturados", con tus respuestas).
  node tester_clasico.js  -> simula a un jugador honesto con cada personaje y mide cuantos adivina.
DISENO DEL CEREBRO: 4 opciones (curador.html o ?cerebro=1..4).


--- VERSION 3.10 · DUELO ONLINE Y BANCO AMPLIADO ---
- Banco de personajes ampliado a 100 o más entradas.
- Nuevo panel DUELO ONLINE con estética synthwave coherente con el juego.
- Crear sala y compartir código; el rival se conecta desde otra red.
- Chat libre en tiempo real y confirmación manual de victoria/derrota.
- Requiere internet y cargar PeerJS desde CDN. La conexión usa el servicio público de señalización de PeerJS; al ser un servicio externo gratuito, su disponibilidad puede variar.
- Esta primera versión sincroniza chat y resultados declarados por los jugadores; no sincroniza una partida completa del oráculo ni comparte aprendizaje entre dispositivos.
- Para abrir desde un archivo local, algunas funciones del navegador pueden estar limitadas; se recomienda publicar los archivos en HTTPS (por ejemplo GitHub Pages o Vercel).


MIND DUEL FUSION 3.11 - ROLES ONLINE
- Chat flotante mientras se mantiene visible el juego.
- Roles de cerebro/descubridor; el cerebro selecciona un personaje del banco y responde preguntas.
- El descubridor envía preguntas y propone una respuesta.
- Requiere conexión a internet y servicio PeerJS.
- La selección/respuestas humanas todavía no se integran como aprendizaje automático permanente del motor; las correcciones se usan en la partida.
