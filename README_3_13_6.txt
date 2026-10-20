MIND DUEL FUSION 3.13.6 — BIBLIOTECA DE PARTIDAS

CAMBIOS
- Al abrir el enlace normal, el juego conserva la entrada habitual: intro, título y menú. Ya no intenta recuperar una sesión online automáticamente al cargar.
- La recuperación de partidas se separa del historial y tiene una pantalla propia: BIBLIOTECA DE PARTIDAS.
- Desde el botón de recuperación se muestra una lista de sesiones online guardadas en este dispositivo. Cada ficha indica fecha, rol y progreso, y permite recuperar el lado local.
- Las sesiones online se guardan/actualizan en la biblioteca local mientras se persiste su progreso. Las sesiones en curso del historial que ya tengan snapshot también se incorporan.
- El historial queda como registro para consultar partidas; ya no incluye el botón de recuperación.
- Después de recuperar una partida se puede reabrir una sala y compartir un código nuevo, manteniendo el flujo de recuperación anterior.

IMPORTANTE
La biblioteca usa almacenamiento local del navegador/dispositivo. No es una nube compartida: para que ambos jugadores recuperen sus roles y progreso, cada dispositivo debe conservar su propia copia. El código de recuperación vuelve a abrir una sala PeerJS; no se realizó una prueba real con dos dispositivos en esta entrega.
