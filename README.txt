MIND DUEL · FUSION 4.1 — DUELO ONLINE + 100 PERSONAJES

JUGAR SOLO / MODO CLÁSICO
- Serví esta carpeta como sitio estático (no abras index.html como archivo local).
  Termux: python3 -m http.server 5000 -> http://127.0.0.1:5000
  Publicación: GitHub Pages, Netlify u otro hosting HTTPS.
- El emoji 🧠 queda activado por defecto. Para cambiar el diseño del cerebro:
  abrí index.html?cerebro=1, ?cerebro=2, ?cerebro=3, ?cerebro=4 o ?cerebro=5.
- La base contiene 100 personajes. El archivo personajes.js guarda sus datos y alias.

DUELO ONLINE (multijugador.html)
1. Un jugador abre DUELO ONLINE, crea sala y elige ser Cerebro, Detective o deja que el sistema asigne el rol al azar.
2. Comparte el código de 6 caracteres o copia la invitación con el enlace y el código ya cargado; el invitado recibe el rol opuesto. Si un código está ocupado, el sistema genera otro automáticamente.
3. El Cerebro elige un personaje de la lista de 100 o usa ELEGIR AL AZAR. Ese nombre no se envía al otro jugador durante la partida.
4. El Detective pregunta; el Cerebro responde manualmente SÍ / NO / NO LO SÉ. Para preguntas que el motor comprende, la ficha local del personaje comprueba la respuesta y avisa si contradice los datos. Las preguntas desconocidas no se pueden verificar automáticamente.
5. El chat libre funciona en paralelo. El Detective puede enviar una adivinanza; el Cerebro confirma si acertó y ambos ven el resultado de victoria o derrota.

RED Y PRIVACIDAD
- La conexión de juego y chat es P2P, con PeerJS y su servicio público de señalización (peerjs.com) para encontrar al otro navegador. Se necesita Internet y que ambos estén en la sala al mismo tiempo. La señalización es un servicio externo gratuito de terceros; su disponibilidad no está garantizada por este proyecto. El contenido de chat y partida se transmite entre los navegadores.
- El modo es una beta para probar con amigos: no tiene cuentas, servidores propios, reconexión persistente, moderación de chat ni un sistema de seguridad competitivo. El Cerebro confirma la adivinanza y las respuestas que no entiende el motor dependen de la honestidad del jugador. El nombre secreto se mantiene en el navegador del Cerebro hasta el veredicto.
- Para iniciar una sala online, publicá el contenido en un hosting HTTPS; el modo online no funciona abriendo el HTML directamente con file://.

APRENDIZAJE DEL ORÁCULO
- El Cerebro de lenguaje aprende frases localmente en cada dispositivo (cerebro.js); no se sincronizan automáticamente entre jugadores.
- En curador.html se pueden revisar preguntas no entendidas, enseñar conceptos y exportar/importar el JSON aprendido. Para distribuir una mejora a todos, actualizá aprendido_semilla.json con el contenido exportado.
- Las respuestas manuales del modo online no se incorporan automáticamente al modelo de aprendizaje.

PRUEBAS (Node.js)
  node tester_regresion.js
  node tester_cerebro.js
  node tester_sugeridor.js
  node tester_datos.js
  node tester_clasico.js
  node auditoria.js
