# Informe de validación — v3.13.77

## Objetivo
Evitar preguntas geográficas del mundo real sobre personajes ficticios cuando su universo no establece que la geografía terrestre sea aplicable.

## Reglas implementadas
- Personaje real: las preguntas sobre continentes y nacionalidades pueden evaluarse con los datos disponibles.
- Personaje ficticio: Europa, América y nacionalidades reales devuelven desconocido salvo que la ficha declare explícitamente `geografia_real: true`, `mundo_real: true`, `ambientacion_terrestre: true` o `geografia: "tierra_real"`.
- El sugeridor no ofrece preguntas geográficas a una ficción por defecto. Puede ofrecerlas si todos los candidatos restantes declaran explícitamente geografía terrestre.
- Una respuesta desconocida no se convierte en “No”.

## Pruebas
- Tester específico: 9/9 controles correctos.
- Los 10 testers anteriores terminaron con código de salida 0.
- `tester_etapas_1_2.js`: 13/13.
- `tester_etapa1_validacion.js`: 14/14.
- `index.html`, `style.css`, `tema_synthwave.css` y `multijugador.js` comparados con la estable v3.13.74: idénticos.

## Limitaciones
El tester de Clásico sigue enumerando personajes confundidos aunque termina con código 0; la precisión estratégica todavía necesita trabajo. No se realizó una prueba manual en teléfono, navegador real o dos dispositivos conectados por PeerJS.
