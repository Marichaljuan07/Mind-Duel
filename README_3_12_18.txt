MIND DUEL FUSION 3.12.18

Esta versión corrige el icono duplicado del menú y el historial vacío.

Pruebas realizadas:
- node --check para script.js, match_history.js y multijugador.js.
- Prueba funcional automatizada del gestor de historial: partida en curso seleccionable, mensajes visibles, modal abierto, partidas terminadas listadas y última partida mostrada.
- Verificación de integridad del ZIP.

El historial usa el almacenamiento local del navegador (localStorage) en el que se juega. No puede recuperar partidas que nunca se guardaron en ese navegador/origen ni datos que hayan sido borrados.
