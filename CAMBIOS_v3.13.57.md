# Mind Duel Fusion 3.13.57 — AUDITORÍA INICIAL

Rama derivada de 3.13.56 PREVIA. La versión 3.13.49 ESTABLE no se modifica.

## Cambios aplicados
- Unificados los duplicados exactos `Princesa Leia` → `Leia Organa` y `Frodo Bolsón` → `Frodo Baggins`, conservando nombres alternativos, etiquetas y medios útiles.
- Añadidos los alias `Anakin Skywalker` y `Anakin` a Darth Vader para reconocer la identidad compartida sin fusionar la ficha narrativa de Anakin como personaje independiente en el futuro.
- Corregidos valores de género claramente incorrectos en Goku, Naruto Uzumaki, Popeye, Garfield, Scooby-Doo, Pac-Man y WALL-E.
- Corregida la especie de Frodo: hobbit, no humano en la clasificación de la Tierra Media.
- Añadido `tester_auditoria_sistematica.js` con controles de duplicados, alias, campos básicos y coherencia estructural.

## Pruebas ejecutadas
- `node --check personajes.js`: OK.
- `node tester_auditoria_sistematica.js`: OK (98 fichas; 0 controles fallidos).
- `node tester_datos.js`: OK (42 hechos básicos).
- `node tester_sugeridor.js`: OK.
- `node tester_regresion.js`: OK (8/8 controles).
- `node tester_conocimiento.js`: OK.
- Sintaxis de todos los archivos JavaScript: OK.
- `node tester_clasico.js`: 27/36 aciertos en casos con verdad evaluable (75%); 62 partidas no puntuables por falta de verdad suficiente. La puntuación sigue siendo insuficiente y es una limitación conocida.
- `node tester_sugeridor.js`, `node tester_regresion.js`, `node tester_conocimiento.js`: pruebas locales de regresión.

## Alcance y limitaciones
Esta entrega es una primera pasada sistemática, no una certificación factual completa de cada atributo. Se revisó la estructura de las 100 fichas originales y se corrigieron errores claros/duplicados identificados; el catálogo queda en 98 candidatos canónicos. Muchos atributos específicos (fechas, nacionalidades, poderes, ocupaciones, relaciones) todavía requieren verificación fuente por fuente. No se inventan esos datos ni se convierten desconocidos en respuestas negativas.

El objetivo es mejorar la calidad de entrada para la inferencia. El motor sigue siendo un sistema de reglas y atributos, no una inteligencia general: la calidad de sus deducciones depende de datos correctos y reglas explícitas. No se modificaron los textos de personalidad del Cerebro ni se incorporó búsqueda por Internet.
