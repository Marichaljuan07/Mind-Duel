MIND DUEL FUSION v3.13.53 — SUGERENCIAS RESISTENTES A DATOS INCOMPLETOS

Cambios:
- El generador ya no devuelve una lista vacía solo porque las respuestas del jugador no coincidan con ningún registro del banco. Si hay contradicciones o datos incompletos, calcula opciones sobre el banco completo y usa preguntas generales como respaldo.
- Si faltan suficientes preguntas puntuables, completa la lista con preguntas aún no usadas, evitando duplicados semánticos.
- La renovación ahora siempre descuenta una renovación y vuelve a renderizar. Si el generador principal no encuentra opciones nuevas, se intenta un respaldo general; no queda el botón activo sin respuesta.

Pruebas ejecutadas:
- tester_sugeridor.js: OK
- tester_datos.js: OK (42 hechos)
- tester_regresion.js: 8/8 controles correctos
- Verificación adicional: con hechos contradictorios el generador sigue entregando preguntas.

Nota: esto corrige el bloqueo de sugerencias, pero no significa que el banco ya entienda todas las preguntas libres (por ejemplo, «¿es de un anime?» o «¿tiene hijos?»). Esas expresiones requieren una mejora aparte del motor de preguntas.
