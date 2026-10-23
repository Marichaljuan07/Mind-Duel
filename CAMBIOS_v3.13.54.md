MIND DUEL FUSION v3.13.54

Cambios de esta versión
- Pistas adaptativas de dos niveles: ya no se disparan en las preguntas 5, 10 y 15.
  La primera se habilita al acumular cinco negativas semánticamente distintas; la segunda,
  al llegar a ocho. Reformular una pregunta equivalente no aumenta el contador.
- Las pistas aprovechan las respuestas y los datos conocidos del personaje para orientar
  la investigación sin revelar directamente el nombre ni la franquicia.
- El Cerebro reconoce preguntas sobre anime, poder, combates y origen terrestre.
- «¿Tiene hijos?» solo recibe SÍ/NO si la ficha del personaje contiene un dato explícito.
  Si no hay información fiable, el motor no inventa una respuesta.
- Las sugerencias incluyen estos conceptos y mejoran la detección de preguntas equivalentes.
- El menú de partida incorpora acceso a «Conocimientos del Cerebro».
- El Curador permite exportar/importar un paquete de frases aprendidas para compartirlo.
- El mensaje de derrota es constructivo: ya no se burla del jugador por fallar.

Conocimiento compartido: limitación importante
El juego guarda lo aprendido en el navegador. Para compartirlo entre dispositivos en esta
versión hay que exportar el paquete desde Curador y que el otro jugador lo importe. La
sincronización automática de todos los jugadores requiere una base de datos/servicio común,
que no se puede conseguir únicamente con almacenamiento local de un HTML estático.

Pruebas ejecutadas
- node --check: script.js, motor_logico.js, sugeridor.js, personajes.js.
- tester_v3_13_54.js: OK.
- tester_sugeridor.js: OK.
- tester_datos.js: OK (42 hechos).
- tester_regresion.js: 8/8.
- tester_v3_13_51.js y tester_v3_13_52.js: OK.
- tester_v3_13_53.js: OK.
- tester_clasico.js completó 100 casos; informó 96/100 en la última ejecución (los cuatro restantes incluyen
  coincidencias nominales que merecen revisión independiente).

No se ha realizado una prueba real en navegador/celular ni una partida online entre dos
dispositivos. Esta versión está validada por código y pruebas automatizadas, no por un
playtest real.
