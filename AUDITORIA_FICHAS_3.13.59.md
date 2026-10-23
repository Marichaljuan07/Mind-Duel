# Auditoría de fichas — Mind Duel Fusion 3.13.60 PREVIA

## Resultado estructural
- Fichas canónicas: 98
- Errores estructurales detectados: 0
- Advertencias detectadas por las reglas actuales: 0
- Cobertura de conceptos críticos probados: 9/9

**Interpretación:** cero errores estructurales no significa que todas las fichas estén completas o verificadas contra fuentes externas. El auditor detecta solo los problemas contemplados por sus reglas.

## Cobertura prioritaria

| Atributo | Confirmados | Inferibles | Pendientes/desconocidos |
|---|---:|---:|---:|
| Hijos | 3 | 0 | 95 |
| Animal | 5 | 2 | 91 |
| Origen terrestre | 5 | 38 | 55 |
| Artista | 4 | 13 | 81 |
| Pacifista | 0 | 14 | 84 |
| Combate | 5 | 14 | 79 |

La categoría `inferibles` indica que hay una señal explícita utilizable por reglas, por ejemplo una etiqueta de artista o que la ficha sea una persona real para inferir origen terrestre. No significa que se haya escrito ese valor como hecho confirmado en `personajes.js`.

## Criterio epistemológico
- Un valor explícito confirmado prevalece.
- Una inferencia válida se usa para responder y sugerir, sin borrar su procedencia.
- La ausencia de una etiqueta no demuestra NO.
- La consistencia interna no certifica la verdad externa de una ficha.
