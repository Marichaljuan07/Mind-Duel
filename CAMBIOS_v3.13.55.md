# Mind Duel Fusion v3.13.55 — PREVIA de conocimiento

## Estado
Esta versión es una rama de trabajo, no reemplaza la versión estable 3.13.49 ni debe considerarse una nueva estable. Se basa en el trabajo de la rama 3.13.54.

## Cambios implementados
- Nuevo `conocimiento.js`: capa de inferencia y aprendizaje separada del motor de preguntas.
- Datos ausentes quedan como desconocidos (`null`); no se convierten automáticamente en respuestas negativas.
- Inferencias explícitas para tipos reales/ficticios, humanidad de personas reales, anime, franquicias conocidas, medios y algunos atributos.
- Sugerencias contextuales: una vez que se sabe que el objetivo es ficticio, se filtran preguntas de geografía e historia del mundo real; si se sabe que es real, se filtran universos ficticios irrelevantes.
- Al terminar partidas Solo, Clásico y multijugador, el Cerebro puede hacer una pregunta de aprendizaje sobre un atributo todavía desconocido. “No lo sé” no guarda ningún dato.
- Las respuestas de Clásico se guardan como evidencia tentativa al final de la partida. Una aportación por dispositivo y atributo; se confirma con al menos tres dispositivos distintos coincidiendo. Las contradicciones no se promueven a verdad.
- En `curador.html` se pueden revisar las 100 fichas existentes, buscar por nombre, editar campos, crear fichas nuevas y ver los campos sin confirmar.
- Las fichas nuevas no entran a las partidas hasta tener tipo, género y humanidad definidos. Después de guardarlas en el Curador aparecen al recargar el juego.
- Se agregaron exportación e importación de la base de personajes y los votos. Sin backend no hay sincronización automática: el intercambio del archivo es manual.
- Se restauró exactamente la función original de burlas de la versión estable 3.13.49. La personalidad del Cerebro no se reemplaza por mensajes genéricos.
- Correcciones explícitas en Goku y Yoda; Black Panther se reconoce como Marvel por su etiqueta aunque el campo `universo` sea Wakanda.

## Pruebas ejecutadas
- Sintaxis JavaScript de los archivos revisada.
- `tester_v3_13_54.js`: OK.
- `tester_conocimiento.js`: OK (inferencia, datos desconocidos, ficha nueva y confirmación de tres dispositivos simulados).
- `tester_sugeridor.js`: OK.
- `tester_regresion.js`: 8/8.
- `tester_clasico.js` es ahora diagnóstico de cobertura, no una certificación de precisión. Las fichas existentes todavía carecen de suficientes datos explícitos: en la última ejecución, solo 25 partidas de 100 tenían respuestas completamente verificables y 15/25 fueron adivinadas. Esto confirma que falta completar y auditar la base de personajes antes de llamar estable a esta rama.
- No se realizó una prueba interactiva real en navegador ni en teléfono.

## Próximo paso obligatorio antes de declarar estable
Completar y revisar los datos de los 100 personajes, priorizando atributos que el motor y las sugerencias usan para distinguir candidatos. La herramienta de Curador permite hacerlo sin editar código, pero los campos desconocidos no se rellenan automáticamente con falsos negativos.
