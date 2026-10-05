---
name: sdd-validator
description: Aplica Schema-Driven Development en Pet Manager. Úsala antes de crear o modificar endpoints, DTOs, controladores o servicios de Spring Boot, o llamadas HTTP y tipos en React, para que cumplan api-docs/openapi.yaml, y para validar el código frente al contrato.
---

Lee y aplica íntegramente las reglas de `.skills/sdd.validator/SKILL.md` (en la raíz del repositorio). Ese archivo es la única fuente de esta skill; no dupliques aquí su contenido.

Si se invoca sin una tarea concreta, haz una validación completa: compara `api-docs/openapi.yaml` con los controladores, los DTOs, `frontend/src/types/api-types.ts` y `frontend/src/api/api-client.ts`, ejecuta las validaciones listadas en la skill y entrega el informe en el formato que pide.
