MIND DUEL FUSION 3.13.1 — RECONEXIÓN ONLINE

Qué cambia:
- La sala anfitriona usa un ID persistente guardado localmente para poder intentar reabrir la misma sala después de recargar/cerrar el navegador.
- El jugador invitado conserva un identificador de conexión local para facilitar la reconexión sin que el anfitrión confunda la reconexión con una persona nueva.
- La partida guarda localmente roles, personaje secreto solo en el dispositivo del Cerebro, tiempo de inicio, contadores, intentos restantes, pregunta pendiente, estado de espera y transcripción.
- Al volver a abrir el juego, intenta recuperar la sala o conectarse al anfitrión guardado y reconstruir la pantalla de partida.
- Si la conexión cae sin cerrar la página, aparece una opción para volver a conectar.
- Las partidas terminadas no se restauran como si siguieran en curso; el historial queda separado.

IMPORTANTE: no hay servidor propio de persistencia compartida. Los datos se guardan en localStorage de cada dispositivo. Ambos jugadores deben volver desde el mismo navegador/dispositivo para restaurar su parte local. Si el anfitrión no vuelve a abrir la sala, si se borran los datos del navegador o si PeerJS no libera el ID inmediatamente, la recuperación puede fallar. En ese caso, esperar unos segundos y recargar.

Validación realizada: node --check sobre los archivos JavaScript y comprobación de integridad del ZIP. No se pudo hacer una prueba real de dos dispositivos/redes en esta sesión.
