MIND DUEL FUSION 3.12 — DUELO ONLINE INTEGRADO

CONTENIDO
- Juego original Mind Duel con estética synthwave conservada.
- Duelo online integrado en la pantalla original de juego.
- Crear sala y compartir código; el rival puede conectarse desde otra red.
- Roles: CEREBRO y DESCUBRIR. El cerebro elige un personaje del banco y responde mediante botones o texto libre; quien descubre utiliza el formulario y la ventana de adivinanza del juego original.
- Chat libre flotante 💬 durante la partida.
- Banco ampliado a 100 personajes.
- Registro local de las respuestas humanas para futuras mejoras del aprendizaje.

PARA PROBAR
1. Publicá los archivos en un hosting HTTPS (por ejemplo, Vercel).
2. Abrí el juego y entrá en DUELO ONLINE.
3. Un jugador crea la sala y comparte el código.
4. El otro jugador entra con ese código desde su dispositivo/red.
5. Elijan roles distintos. El cerebro selecciona el personaje en la pantalla del juego; el otro pregunta y usa ADIVINAR.

IMPORTANTE
- PeerJS necesita internet y un servicio de señalización disponible; algunas redes pueden bloquear conexiones P2P.
- El aprendizaje registrado es local y experimental: aún no modifica automáticamente el motor lógico ni se comparte entre usuarios.
- No se ha validado una partida real entre dos dispositivos en esta sesión. Antes de anunciarlo como beta pública, probá conexión, roles, preguntas, respuestas, reconexión y fin de partida.


FUSION 3.12.5 - MEJORAS DEL CEREBRO ONLINE
- Sugerencia de respuesta para el jugador Cerebro basada en los datos del personaje de la lista.
- Para personajes escritos manualmente, se recuperan respuestas anteriores guardadas en la memoria local.
- Los personajes personalizados y sus respuestas se guardan en el navegador del dispositivo; no se envían al rival.
- Se quitó el selector duplicado de personaje durante la partida y se añadió el emoji 🧠 en los elementos principales del rol.
- El jugador Descubridor mantiene la opción de intentar adivinar el personaje durante el duelo.

Actualización 3.12.6:
Se ajustó el flujo online para usar los controles originales de la consola, mostrar la secuencia y sugerencia del Cerebro como texto, bloquear los turnos mientras se espera respuesta y permitir adivinar desde el botón original. Ver VERSION_FUSION_3_12_6.txt.
