# Resultados de pruebas — v3.13.82 integrada

Se ejecutaron 14 archivos `tester_*.js` con Node.js. 14/14 finalizaron con código 0.

## Advertencias importantes
- `tester_clasico.js` terminó con código 0, pero su propio resultado fue bajo: 47/91 partidas evaluables (52%) y reporta muchos personajes confundidos. Esto NO debe presentarse como una prueba de precisión superada.
- `tester_clasico_78.js` reporta 72/98, promedio 12.4 preguntas y 0 redundantes, pero es un simulador específico; sus resultados no anulan el resultado del tester general.
- `tester_packs_82.js` reporta 29/29 para Dragon Ball y 73/98 para catálogo base con catálogo ampliado, bajo su propia simulación.
- Las pruebas de Node no verifican el renderizado del CSS, navegador real, móvil ni partidas reales entre dispositivos.
- No se modificó el código de `multijugador.js`, `style.css` ni `tema_synthwave.css`; se comprobó que coinciden byte por byte con el paquete Dragon Ball original.

## Resultados por tester

- **tester_auditoria_sistematica.js** — código 0: OK   alias como lista: Scooby-Doo; ; Total: 98 fichas; controles fallidos: 0.
- **tester_banco_etapa0.js** — código 0: Pikachu: correctas=8, incorrectas=0, sin respuesta=4, pendientes=3; Julio César: correctas=9, incorrectas=0, sin respuesta=6, pendientes=0; Informe escrito: resultado_validacion_3.13.77.json
- **tester_cerebro.js** — código 0: OK   frase "¿Es un dibujo animado?" => medio_animacion; ; Todo OK
- **tester_clasico.js** — código 0:  - Popeye (confundido con Drácula);  - Garfield (confundido con Drácula);  - Scooby-Doo (confundido con Sonic)
- **tester_clasico_78.js** — código 0: Clásico v3.13.78: adivinó 72/98, promedio 12.4 preguntas (partidas ganadas), redundantes 0, máx. notas por partida 3; Referencia v3.13.77: adivinó 72/98, promedio 16.0 preguntas; Controles: 453 correctos, 0 fallidos
- **tester_conocimiento.js** — código 0: Conocimiento OK: inferencia, datos desconocidos, sugerencias contextuales, plantilla y confirmación entre 3 dispositivos.
- **tester_datos.js** — código 0: Datos OK (42 hechos)
- **tester_etapa1_validacion.js** — código 0: OK  banco fijo de 150 casos preservado; OK  cada expectativa tiene estado de validación explícito; RESULTADO: 14/14 pruebas correctas.
- **tester_etapas_1_2.js** — código 0: OK  Clásico adapta la siguiente pregunta y evita repetir (aleatoriedad fijada en el test); ; RESULTADO: 13/13 pruebas correctas; auditoría: 0 errores estructurales y 0 advertencias.
- **tester_geografia_contextual.js** — código 0: OK  Sugerencias para personajes reales pueden preguntar geografía; OK  Ficción con geografía terrestre explícita puede preguntar geografía; Todo OK
- **tester_packs_82.js** — código 0: Goku (conocido): gano=true en 9 preguntas, verificaciones=¿Es el protagonista de su serie? | ¿Es un saiyajin?; Pregunta de aprendizaje para Goku: (ninguna); Controles: 38 correctos, 0 fallidos
- **tester_regresion.js** — código 0: OK   typo peligroso => null; ; 8/8 controles correctos.
- **tester_solo_80.js** — código 0: Coherencia: 416 casos donde lógica y deducción responden; contradicciones: 0; Pistas: 169 de 196 generadas (el resto usa la pista de siempre); fugas del nombre o universo: 0; Controles: 19 correctos, 0 fallidos
- **tester_sugeridor.js** — código 0: OK   tres datos básicos no adelantan el desbloqueo; Desbloqueo OK; OK   etapa inicial: evita categorías reveladoras