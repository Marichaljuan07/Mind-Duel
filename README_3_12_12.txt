Mind Duel Fusion 3.12.12

Abrí index.html con un servidor local o publicalo como el proyecto anterior. Se conserva el banco de 100 personajes.

Cambios de esta versión:
- En el modo clásico, la indicación inicial ahora la da el Cerebro; después formula directamente su primera pregunta. Se elimina la frase inicial atribuida al sistema en el chat.
- En el modo normal, cada cinco respuestas NO consecutivas el Cerebro ofrece una pista breve basada en atributos del personaje, sin revelar su nombre.
- El panel pasa a llamarse “Sugerencias del Cerebro” y usa el icono del Cerebro.
- Las sugerencias están disponibles desde el comienzo y se calculan usando las respuestas conocidas y las preguntas ya realizadas.
- Se pueden renovar las opciones hasta dos veces por ciclo. Cerrar y reabrir el panel conserva las preguntas y los cambios restantes.
- El contador de sugerencias solo disminuye cuando se elige una pregunta; abrir, cerrar o renovar no consume un uso.
- Se mantiene el diseño synthwave y el flujo de los demás modos.

Nota de prueba: se comprobaron la sintaxis JS y los tests de datos, regresión, sugeridor y motor de preguntas. El tester_clasico.js incluido en el ZIP anterior no puede ejecutarse tal cual en Node porque personajes.js no exporta PERSONAJES como módulo; es una limitación del tester existente, no una prueba de navegador. No se verificó una sesión visual completa en navegador ni multijugador entre dos dispositivos.
