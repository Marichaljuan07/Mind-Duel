MIND DUEL FUSION 3.13.5 — RECUPERACIÓN DE PARTIDA ONLINE

Objetivo de esta versión:
- Desde el historial, cargar el lado local de una partida online en curso aunque el rival no esté conectado.
- Restaurar el rol, el personaje secreto solo en el dispositivo Cerebro, contadores, pregunta/respuesta pendiente y transcripción local que estén guardados.
- Mostrar una barra de recuperación y permitir reabrir una sala con un nuevo código mdfr- para que el otro jugador se conecte.
- Al unirse con un código mdfr-, preservar e intentar restaurar la copia local del jugador que se une, en vez de borrarla como si fuera una partida nueva.
- Adjuntar el snapshot actualizado al registro de historial seleccionado.

Limitaciones:
- Cada dispositivo debe conservar su propia sesión local para recuperar su rol y progreso completo. Si no hay copia local, no se puede inventar el personaje secreto ni los mensajes que nunca se guardaron.
- El nuevo código abre una sala de recuperación; ambos jugadores deben conectarse de nuevo. No es un servidor persistente ni sincroniza automáticamente copias divergentes.
- La reconexión real entre dos dispositivos debe probarse en la red; la validación del paquete no sustituye esa prueba.
