# Mind Duel Fusion 3.13.59 PREVIA — Razonamiento y Clásico

Rama derivada de `3.13.58 PREVIA`. La versión estable `3.13.49` no se modificó.

## Cambios implementados

### Inferencia y conocimiento
- Si una ficha identifica explícitamente una época histórica, el motor infiere NO para las otras dos épocas entre Antigüedad, Edad Media y Renacimiento.
- Para personas reales que siguen vivas, las tres épocas históricas se descartan como NO.
- Una nacionalidad conocida permite responder negativamente por otras nacionalidades incompatibles; una nacionalidad ausente o una etiqueta de origen ficticio no se trata como nacionalidad real.
- Si la ficha confirma que una persona es real, se puede inferir que su origen es terrestre y que no pertenece como personaje a universos ficticios como Marvel, DC o Star Wars. Para personajes ficticios, un universo concreto permite descartar pertenencia a otros universos, no descartar apariciones/crossovers.
- Se ampliaron las inferencias de artista a etiquetas explícitas de escritor, poeta, dramaturgo, músico, cantante, compositor, actor, director, escultor, fotógrafo y bailarín.
- Se agregó el concepto de animal al motor, conocimiento y sugeridor. Ser ficticio o no humano no basta por sí solo para concluir que es un animal.
- Se añadieron datos de alta confianza a las fichas de Shakespeare, Lionel Messi, Goku, Pikachu y Yoda (por ejemplo, hijos, animal, origen terrestre, artista y combate cuando corresponde).
- La inferencia sigue sin sobrescribir hechos explícitos y no transforma automáticamente los datos ausentes en negativos.

### Modo Clásico y personalidad
- Se reemplazó la presentación técnica de Clásico por un diálogo de desafío más propio del Cerebro.
- Cuando el Cerebro agota sus intentos, pide el nombre del personaje **en el chat de la partida**. No declara la victoria antes de que el jugador lo escriba.
- El nombre escrito se compara con el elegido al iniciar; se aceptan alias de fichas conocidas. Un nombre distinto no se registra como si fuera el personaje original.
- El Cerebro deja el comentario de derrota en el chat y luego muestra el resultado. El caso nuevo se guarda para aprendizaje pendiente, sin inventar atributos.
- Se añadieron observaciones ocasionales basadas en las respuestas reales de la partida, como descartar Europa y después preguntar por épocas históricas.
- Se sustituyó el mensaje largo y repetitivo de desconocimiento por varias frases breves que conservan el carácter del Cerebro sin fingir conocimiento.
- La búsqueda interna de personajes ahora reconoce alias exactos además del nombre canónico.

### Auditoría visible
- El auditor informa cobertura de seis atributos prioritarios: hijos, animal, origen terrestre, artista, pacifista y combate.
- Se distingue entre datos confirmados, inferencias posibles y datos pendientes. El resumen no presenta las lagunas como si fueran datos completados.

## Validación reproducible
- Sintaxis JavaScript: revisada en todos los archivos `.js` del paquete.
- `tester_etapas_1_2.js`: 13/13 controles correctos.
- `tester_v3_13_59.js`: 15/15 controles correctos.
- Casos de aceptación deterministas:
  - William Shakespeare: 0 respuestas desconocidas, descubierto en 9 preguntas.
  - Goku: 0 desconocidas, descubierto en 7.
  - Lionel Messi: 0 desconocidas, descubierto en 15.
  - Pikachu: 0 desconocidas, descubierto en 7.
  - Yoda: 0 desconocidas, descubierto en 7.
- `tester_datos.js`: 42 hechos comprobados.
- `tester_sugeridor.js`: controles de sugerencias y desbloqueo correctos.
- `tester_conocimiento.js`: correcto.
- `tester_regresion.js`: 8/8 controles correctos.
- `tester_auditoria_sistematica.js`: 98 fichas, 0 controles estructurales fallidos.
- `tester_clasico.js` es aleatorio y no ofrece una comparación estable: en una ejecución puntuó solo 9 partidas (9/9) y dejó 89 sin puntuar por datos insuficientes. No se toma como certificación de precisión.
- La prueba visual automatizada con Chromium no pudo completarse en este entorno; no se afirma que se haya verificado una partida real en navegador o móvil.

## Pendientes conocidos
La cobertura de atributos de las 98 fichas **todavía no está completa**. La auditoría actual registra:

| Atributo | Confirmados en ficha | Inferibles desde etiquetas/reglas | Desconocidos pendientes |
|---|---:|---:|---:|
| Hijos | 3 | 0 | 95 |
| Animal | 5 | 2 | 91 |
| Origen terrestre | 5 | 38 | 55 |
| Artista | 4 | 13 | 81 |
| Pacifista | 0 | 14 | 84 |
| Combate | 5 | 14 | 79 |

Estos conteos reflejan el catálogo y las reglas implementadas, no la totalidad de hechos que el Cerebro puede inferir en tiempo de ejecución. No se rellenaron los vacíos restantes con suposiciones: requieren curación factual y/o reglas más específicas. Internet y aprendizaje compartido entre dispositivos siguen fuera de alcance.
