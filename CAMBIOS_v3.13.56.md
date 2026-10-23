# Mind Duel Fusion v3.13.56 PREVIA

Rama de trabajo basada en 3.13.55 PREVIA. No reemplaza ni modifica la versión estable 3.13.49.

## Cambios
- Se corrigieron universos claramente mal asignados en varias fichas de ficción (por ejemplo, Black Panther/Marvel, Naruto/Naruto, Pikachu/Pokémon, Mario/Super Mario, Lara Croft/Tomb Raider y otras franquicias).
- Se agregaron marcadores consistentes de universo para Marvel/DC y anime cuando la ficha ya contiene evidencia suficiente.
- Se mejoró la inferencia de anime, Marvel/DC y participación en combates a partir de etiquetas y universo explícito.
- Se conserva el estado desconocido cuando no hay evidencia: ausencia de etiqueta no se interpreta automáticamente como respuesta negativa.
- Se corrigió el espacio superior del encabezado de la interfaz online del Cerebro en pantallas pequeñas y se ocultan los estados de lectura vacíos para que no reserven la franja vacía entre controles y sugerencia.
- Se añadió AUDITORIA_FICHAS_3.13.56.md para revisar los 100 registros sin inventar valores faltantes.
- Se actualizó el test de arco de Einstein: como la ficha no contiene un dato fiable sobre ese atributo, el resultado correcto es desconocido, no NO.

## Pruebas locales ejecutadas
- `node --check personajes.js`: OK
- `node --check motor_logico.js`: OK
- `node tester_cerebro.js`: OK
- `node tester_sugeridor.js`: OK
- `node tester_datos.js`: OK (42 hechos)
- `node tester_regresion.js`: OK (8/8)
- `node tester_conocimiento.js`: OK
- `node tester_clasico.js`: 23/36 aciertos (64%) en partidas con verdad evaluable; 64 de 100 partidas no tenían suficiente verdad en las fichas para puntuarlas.

## Limitaciones conocidas
- Esta versión no debe declararse estable: Clásico aún necesita una revisión profunda y una proporción importante de las fichas sigue sin suficiente evidencia para puntuar la deducción.
- La auditoría identifica huecos, pero no afirma que las 100 fichas estén factual y exhaustivamente verificadas.
- No se hizo prueba interactiva en navegador ni en teléfono; el ajuste visual debe verificarse en el dispositivo.
- No se incorpora búsqueda por Internet en esta versión.
