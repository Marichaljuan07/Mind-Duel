Mind Duel Fusion 3.13.8

- La biblioteca convierte partidas ONLINE antiguas que solo tienen historial en una reconstrucción local basada en sus eventos.
- La reconstrucción permite revisar el diálogo sin conexión. No recupera un ID de sala antiguo ni garantiza reconexión; para eso el otro jugador debe conservar su sesión.
- Las partidas nuevas siguen guardando snapshots automáticamente durante el juego y al ocultar/cerrar la página.
- El almacenamiento se mantiene en localStorage y ocupa poco espacio; no se guarda en un servidor.

Importante: las reconstrucciones a partir del historial pueden inferir el rol y no garantizan que cada dato del estado original esté disponible. Revisar la partida reconstruida antes de intentar continuar.
