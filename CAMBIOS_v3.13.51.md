# Mind Duel Fusion v3.13.51 — sugerencias y razonamiento

Base de trabajo: `Mind_Duel_Fusion_v3_13_50.zip`. La versión estable 3.13.49 se conserva intacta.

## Cambios

1. **Sugerencias desbloqueadas después de cinco respuestas válidas.** Antes del desbloqueo, al intentar usar el botón, el Cerebro explica que hay que investigar por cuenta propia. Las preguntas que el motor no entiende no incrementan el contador de preguntas respondidas.
2. **Progresión de sugerencias.** En la primera etapa disponible se restringen a preguntas amplias (real/ficticio, humanidad, género, vida y regiones generales); preguntas más específicas solo entran más adelante.
3. **Sin preguntas de respaldo engañosas.** Si no hay preguntas útiles compatibles con los datos conocidos, la interfaz lo dice en lugar de ofrecer preguntas fijas que podrían ser repetidas o contradictorias.
4. **Pistas por progreso.** Se reemplazó la regla de cinco respuestas NO consecutivas por pistas en los hitos de 5, 10 y 15 respuestas válidas. La primera promueve combinar datos sin regalar una categoría; las posteriores son graduales. El progreso de pistas se guarda/restaura.
5. **Clásico conserva la incertidumbre.** Un hecho desconocido (`null`) ya no se convierte automáticamente en NO al actualizar los pesos. “No lo sé” no modifica el peso, y las respuestas probables se tratan como evidencia más débil.
6. **Preguntas repetidas normalizadas.** Clásico guarda las preguntas normalizadas y normaliza las preguntas de partidas restauradas; también se corrigió la comprobación del respaldo de preguntas.
7. **HUD de sugerencias.** Antes del turno cinco muestra cuántas preguntas faltan y un estilo visual de bloqueo; el acceso prematuro sigue siendo detectable para mostrar el mensaje del Cerebro.

## Pruebas realizadas

- `node --check` en los archivos JavaScript del juego.
- `tester_sugeridor.js`: pasó, incluidas pruebas nuevas de desbloqueo en cinco respuestas y de sugerencias generales en la primera etapa.
- `tester_regresion.js`: 8/8.
- `tester_datos.js`: 42 hechos correctos.
- `tester_cerebro.js`: pasó.
- `tester_clasico.js`: 92/100 en la simulación local (antes de este cambio se había registrado 93/100; no es una mejora de precisión y no debe interpretarse como prueba de rendimiento superior). Se mantiene la variabilidad de la simulación y hay personajes ambiguos en el banco.

## Límites conocidos

- No se realizó una prueba interactiva real en un navegador móvil; el congelamiento del reloj necesita diagnóstico en el dispositivo donde ocurre.
- No se incorporó todavía un sistema de sanciones por mensajes fuera de tema: requiere distinguir con cuidado entre una pregunta válida mal interpretada y un mensaje realmente ajeno al juego.
- La primera pista es deliberadamente general para no regalar la respuesta. La calidad de las pistas más específicas depende de la calidad de las etiquetas y datos de cada personaje.
