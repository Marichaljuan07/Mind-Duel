# Mind Duel Fusion v3.13.50 — mejoras de razonamiento

Base: **Mind Duel Fusion v3.13.49 ESTABLE**. Esta entrega se construyó sobre una copia de la versión estable; el ZIP original no se modificó.

## Cambios incluidos

### 1. Director de partida del modo clásico
- Decide si seguir preguntando o intentar adivinar usando el peso relativo del mejor candidato, la distancia respecto del segundo y el número de preguntas ya realizadas.
- Exige más evidencia para adivinar pronto y permite asumir más riesgo cuando se acerca el límite de preguntas.
- Tras rechazar un candidato, normaliza los pesos restantes para que la comparación siga siendo relativa a las posibilidades activas.
- Prioriza preguntas que separan a los candidatos activos y tienen mayor cobertura de datos conocidos.

### 2. Sugerencias dinámicas
- Calcula sugerencias a partir de los personajes que siguen siendo compatibles con los hechos conocidos.
- Evita preguntas ya contestadas.
- Descarta preguntas que no dividen candidatos conocidos en respuestas sí/no.
- Prioriza preguntas con mejor equilibrio y cobertura de datos; el orden de las sugerencias es reproducible.
- Si los hechos contradicen todos los personajes conocidos, no finge que existe una lista coherente de sugerencias.
- Añade una caché de evaluación por personaje/pregunta para reducir trabajo repetido durante las simulaciones.

### 3. Seguridad del multijugador
- El mensaje de recuperación `resume_state` ya no incluye el personaje secreto.
- La sincronización de `lastGuessResolution` elimina el secreto durante una partida activa.
- `guess_result` solo incluye el secreto cuando el descubridor acierta o agota sus intentos. En un intento incorrecto con intentos restantes, no se transmite el secreto.

### 4. Compatibilidad del motor
- Autoriza el concepto `artista_pintor`, ya presente en el oráculo, y lo relaciona con la etiqueta `pintor` usada por los personajes.
- La resolución de conceptos rechaza entradas no autorizadas o un personaje inválido de forma segura.

### 5. Pruebas
- `tester_sugeridor.js`: se corrigió una aserción que antes no podía fallar y se agregaron comprobaciones de `artista_pintor` y coherencia con hechos conocidos.
- `tester_clasico.js`: ahora muestra el progreso de la simulación para que no parezca bloqueado.

## Verificaciones realizadas

- Sintaxis JavaScript: **19 archivos, sin errores**.
- Datos: **42 hechos, OK**.
- Regresión: **8/8 controles correctos**.
- Sugeridor y desbloqueo: **OK**.
- Cerebro: controles existentes **OK**.
- Simulación del modo clásico: **92/100 aciertos** en la ejecución registrada, promedio de 11,3 preguntas entre aciertos. Es una simulación local, no una garantía de resultado en todas las partidas.
- Revisión estática del flujo multijugador: **OK** para las rutas de recuperación/sincronización revisadas.

## Conservación y límites

- Se conservaron la interfaz, la biblioteca, el historial, los archivos de guardado y los demás módulos de la versión estable sin rediseñarlos.
- El modo espejo no se modificó; necesita una decisión de diseño aparte.
- La puntuación interna de los candidatos es una ponderación heurística, no una probabilidad estadística calibrada. El director usa también la ventaja sobre el segundo candidato para evitar depender solo de ese valor.
- Las verificaciones del multijugador fueron estáticas; todavía se recomienda una prueba real entre dos navegadores/dispositivos antes de desplegar.
