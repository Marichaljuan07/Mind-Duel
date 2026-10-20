Mind Duel Fusion 3.13.10 — recuperación en pantalla y reloj pausado

Al recuperar una sesión guardada, el juego vuelve a la pantalla de duelo, conserva los indicadores disponibles y vuelve a dibujar la conversación/preguntas guardadas en el chat.

Sobre el chat aparece una franja compacta con “Reconectar” y “Copiar código”. Al reabrir una sala, la pantalla del juego permanece visible; el código nuevo queda indicado en la franja para compartirlo con el otro jugador.

El reloj guarda el tiempo transcurrido y se pausa cuando se cierra la conexión. La recuperación offline mantiene el reloj pausado hasta que se establece una conexión. El cambio de pestaña ya no recalcula el reloj usando la hora original de inicio.

Cada navegador sigue teniendo su propia copia local. Para recuperar los dos lados, cada jugador necesita haber guardado su propia sesión. Las partidas antiguas reconstruidas solo desde texto histórico pueden no tener el estado exacto del turno o datos suficientes para reconectar; no se inventan esos datos.

Validación realizada: sintaxis de JavaScript con node --check e integridad del archivo ZIP. No se realizó una prueba real con dos dispositivos conectados.
