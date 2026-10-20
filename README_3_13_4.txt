Mind Duel Fusion 3.13.4 — Recuperación desde Historial

Qué cambia:
- Las sesiones online en curso guardan una copia local de su estado en la ficha de historial correspondiente.
- Al seleccionar una partida ONLINE que sigue “En curso”, aparece “RECUPERAR ESTA PARTIDA ONLINE”.
- El botón carga la sesión guardada y vuelve a intentar recuperar la sala y el progreso.
- El historial continúa siendo independiente de la sesión; borrar el historial no borra automáticamente la sesión online.

Importante:
- Esta versión permite recuperar desde el historial las partidas que hayan guardado la instantánea con esta versión.
- Para una partida anterior, el botón solo podrá usar la sesión local existente si todavía está guardada.
- No existe persistencia de sala en servidor propio: si PeerJS ya no mantiene la sala/ID del anfitrión, puede fallar la reconexión aunque el estado local esté guardado.
