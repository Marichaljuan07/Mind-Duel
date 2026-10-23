# Mind Duel Fusion 3.13.58 PREVIA — Etapas 1 y 2

Rama derivada de 3.13.57 PREVIA. La versión estable 3.13.49 permanece intacta.

## Etapa 1 — Auditor automático
- Nuevo `auditor_integrado.js`: audita al iniciar la página nombres, alias, estructura básica, contradicciones de tipo/género/región, compatibilidad entre campos de medios y catálogo, y cobertura de nueve conceptos críticos.
- El auditor es de diagnóstico: no reescribe silenciosamente fichas ni convierte falta de evidencia en un NO.
- El resumen del auditor aparece en el modal de Sugerencias del Cerebro.
- Nuevo `tester_etapas_1_2.js`, con resultados repetibles para los controles centrales.
- Se quitaron nacionalidades ficticias usadas como marcadores en Naruto Uzumaki, Totoro, Popeye y Garfield; el dato queda vacío/desconocido. También se retiraron región/nacionalidad ficticias no sustentadas de Scooby-Doo. Goku mantiene región y nacionalidad desconocidas en vez de atribuirle una geografía real.

## Etapa 2 — Motor adaptativo integrado
- El sugeridor reconoce y evalúa conceptos que antes quedaban fuera o no compartían el mapeo: artista, pacifismo, Antigüedad, Edad Media, Renacimiento, Asia e inglés/español.
- Se unifica el reconocimiento de variantes de preguntas sobre medios para reducir repeticiones semánticas.
- Se corrigió la lectura de televisión/series frente a las fichas que guardan `television`; también se normalizan singular/plural de películas, cómics y libros.
- La falta de nacionalidad ya no se interpreta como una respuesta negativa.
- Clásico prioriza preguntas compatibles con las respuestas ya dadas y sigue evitando preguntas repetidas; mantiene el estilo de selección variable durante partidas normales.
- La inferencia se consulta al evaluar preguntas y al puntuar sugerencias mediante `MindKnowledge`, sin sobreescribir hechos explícitos.

## Validación
- `tester_etapas_1_2.js`: 13/13 controles correctos.
- `tester_auditoria_sistematica.js`: 98 fichas; 0 controles fallidos.
- `tester_datos.js`: 42 hechos básicos correctos.
- `tester_sugeridor.js`: OK.
- `tester_regresion.js`: 8/8 controles correctos.
- `tester_conocimiento.js`: OK.
- `tester_clasico.js`: en esta ejecución dio 37/44 aciertos puntuables (84 %), 54 partidas sin verdad suficiente y 7 fallos entre los casos puntuables. El resultado es variable por la selección aleatoria; el tester actual no es una comparación determinista entre versiones.
- Auditor integrado: 98 fichas, 0 errores estructurales y 0 advertencias en las comprobaciones implementadas.
- Sintaxis JavaScript revisada en todos los `.js` del paquete.

## Límites
El auditor encuentra inconsistencias internas y lagunas estructurales; no certifica la verdad de cada dato con fuentes externas. Los cambios no incorporan búsqueda por Internet ni sincronización entre dispositivos. La personalidad original del Cerebro y la versión estable 3.13.49 se mantienen fuera de esta rama.
