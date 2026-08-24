MIND DUEL — PLAYABLE CANDIDATE v0.2

OBJETIVO DE ESTA BUILD
Que una persona pueda abrir el juego y completar una partida de principio a fin.
No es la versión final: es la candidata que Juan va a probar y luego pasar a uno o dos amigos.

QUÉ INCLUYE
- Intro cinematográfica: relámpago / aparición de MIND / logo.
- Escenario con telón y estética neon cyber retro.
- Pantalla de reglas antes de comenzar.
- 20 personajes actuales.
- Motor lógico determinista v0.2.2 como autoridad sobre los hechos.
- OperaAria/g4f únicamente como intérprete auxiliar cuando el motor no entiende una frase.
- 20 preguntas válidas.
- 2 intentos de adivinanza.
- Sugerencias.
- Adivinanzas tolerantes a pequeños errores de escritura (ej. "Leonardo da Vinchi").
- Victoria / derrota / jugar de nuevo / menú / apagado CRT.

REGLA DE IA
OperaAria interpreta. MIND decide.
OperaAria recibe solamente la pregunta del jugador y devuelve un concepto conocido.
NO recibe el personaje secreto y NO decide SI/NO.
Si OperaAria falla o no está disponible, el juego sigue funcionando con el motor lógico.

ANDROID / TERMUX
Desde la carpeta donde está el ZIP:

  unzip -q mind_duel_playable_v02.zip -d mind_duel_playable_v02
  cd mind_duel_playable_v02/mind_duel_remaster_playable_v02
  bash run_termux.sh

Después abrí:
  http://127.0.0.1:5000

Si otra persona está conectada a la MISMA Wi-Fi, Termux también imprime una URL del tipo:
  http://192.168.x.x:5000
Esa persona puede abrirla mientras el servidor esté ejecutándose.

IMPORTANTE PARA COMPARTIR A DISTANCIA
127.0.0.1 solo funciona en tu propio teléfono. Para pasárselo a un amigo que está en otra casa hay que publicar esta misma build en un servidor. No hace falta cambiar el juego: solamente desplegarlo.

TEST RÁPIDO DEL MOTOR
  node tester_regresion.js
