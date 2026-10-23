MIND DUEL FUSION — v3.13.62 PREVIA

Base: v3.13.60 PREVIA RITMO CLÁSICO. La versión estable 3.13.49 no fue modificada.

CAMBIO PRINCIPAL — AVISO PERSISTENTE DE DESCONEXIÓN
- El cierre inesperado de la conexión deja la partida pausada y guardada, y muestra un único aviso persistente en la barra de recuperación existente.
- El aviso explica que se perdió la conexión, recuerda que se conserva la partida y muestra el código de sala cuando está disponible.
- La acción de reconexión se integra en la misma barra para evitar el botón separado y el aviso temporal duplicado.
- Los errores de conexión también dejan un aviso persistente en esa barra.
- Al abrirse una conexión de nuevo, la barra no se oculta inmediatamente: se conserva durante la verificación/sincronización; el flujo existente muestra el estado sincronizado cuando recibe el estado de la otra parte.
- Se conserva el flujo de roles, turnos y recuperación ya existente; no se afirma que la sincronización esté confirmada solo porque el socket abrió.

PRUEBAS EJECUTADAS
- `node --check` sobre multijugador.js: correcto.
- Se comprueba estructura del ZIP y presencia de los archivos del juego.
- No se ejecutó una prueba real con dos dispositivos/redes ni una prueba visual dentro de navegador móvil; esos casos quedan pendientes.

Esta es una versión PREVIA, no estable.
