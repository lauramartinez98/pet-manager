---
name: sdd-validator
description: Aplica Schema-Driven Development en Pet Manager. Úsala antes de crear o modificar endpoints, DTOs, controladores o servicios de Spring Boot, o llamadas HTTP y tipos en React, para que cumplan api-docs/openapi.yaml, y para validar el código frente al contrato.
---

> Si se invoca sin una tarea concreta (`/sdd-validator`), haz una validación completa: compara `api-docs/openapi.yaml` con los controladores, los DTOs, `frontend/src/types/api-types.ts` y `frontend/src/api/api-client.ts`, ejecuta las comprobaciones de compilación y entrega el informe en el formato de "Entrega esperada".


## Rol
Actúa como un ingeniero full-stack senior especializado en Schema-Driven Development (SDD) y en proyectos Java Spring Boot + React + TypeScript.

## Contexto del proyecto
- Backend: Spring Boot en `/backend`
- Frontend: React + Vite en `/frontend`
- Contrato API, fuente de verdad: `/api-docs/openapi.yaml`
- El proyecto gestiona mascotas, paseos, citas veterinarias, gastos, autenticación (JWT) e integración con Google OAuth.

## Reglas obligatorias
1. Antes de crear o modificar cualquier endpoint, DTO, request/response, controlador, servicio o llamada desde React, consulta siempre `api-docs/openapi.yaml`.
2. La especificación OpenAPI es la fuente de verdad. Si el código y el schema no coinciden, corrige el código para que cumpla el schema, no al revés.
3. Los nombres de DTOs, campos, tipos de datos (UUID, fechas, enums como `PERRO`, `GATO`, `OTRO`) y los códigos HTTP deben coincidir exactamente con el contrato.
4. Si el schema indica autenticación JWT con `bearerAuth`, el backend debe exigir el token y el frontend debe enviarlo en `Authorization: Bearer <token>`.
5. En las llamadas HTTP del cliente, usa el contrato para definir el request y el response exactos. No inventes campos ni formatos.
6. Antes de dar una tarea por terminada, valida que el comportamiento real cumple el spec y que no rompe el contrato.

## Flujo de trabajo
1. Revisa el schema en `api-docs/openapi.yaml`.
2. Identifica los endpoints, DTOs, validaciones, enums y errores que define.
3. Si hace falta ampliar el contrato, actualiza primero el schema (subiendo `info.version`) y explica por qué.
4. Implementa la lógica en el backend y/o el frontend para cumplirlo.
5. Añade o ajusta tests que cubran al menos:
   - el caso feliz;
   - la validación de entrada;
   - los errores esperados;
   - la autenticación y autorización, si aplica.
6. Verifica que el código sigue el contrato y no introduce inconsistencias.

## Dónde vive el contrato en el código
| Contrato | Backend | Frontend |
|---|---|---|
| `paths` | `backend/.../controllers/*Controller.java` (prefijo `/api/v1`) | `frontend/src/api/api-client.ts` (única puerta HTTP, sin `fetch` sueltos en componentes) |
| `components/schemas` | `backend/.../dtos/*DTO.java` + `entities/enums` | `frontend/src/types/api-types.ts` |
| Restricciones (`minLength`, `maximum`, `multipleOf`, `format`…) | Anotaciones de Jakarta Validation en los `*RequestDTO` | `frontend/src/utils/validation.ts` + reglas de cada formulario |
| `bearerAuth` | `backend/.../config/SecurityConfig.java` | `send()` de `api-client.ts` |
| Tests de contrato | `backend/src/test/.../contract/ApiContractTest.java` | — |

Patrones del código que hay que seguir al implementar el contrato:
- **Controlador** (`controllers/`): `@RequestMapping("/api/v1/...")`, recibe `@Valid @RequestBody XRequestDTO`, saca el usuario con `currentUserService.getCurrentUserId()` y delega en el servicio. `POST` responde `201` con el recurso creado (o `Location`, si el contrato lo dice).
- **Servicio** (`services/`): recibe siempre `ownerId` como primer parámetro. Las mascotas se cargan con `petService.getPetOrThrow(ownerId, petId)` o se comprueban con `petService.assertPetExists(...)`: una mascota de otro usuario responde **404**, no 403, para no revelar que existe.
- **DTOs** (`dtos/`): `record` con validaciones de Jakarta; los de respuesta tienen un `static from(Entidad)`.
- **Errores**: excepciones con `@ResponseStatus` (`ResourceNotFoundException` → 404, `EmailAlreadyUsedException` → 409) o `ResponseStatusException` para casos puntuales (p. ej. `tz` no válida → 400).
- **Frontend**: cada endpoint es una función en `api-client.ts`; los componentes la consumen con el hook `useApi(fetcher, deps)` (`data`, `loading`, `error`, `reload`) y los formularios con React Hook Form + las reglas de `validation.ts` (`numberRules`, `textRules`, `optional`…).

Convenciones del contrato que hay que respetar:
- Campo `required` + `nullable: true` en un response: debe aparecer en el JSON como `null`, nunca omitirse.
- Campo no `required` en un request: en TypeScript es opcional (`?`) y no se envía si está vacío.
- `type: integer`: no se aceptan decimales (Jackson con `accept-float-as-int=false`).
- `multipleOf: 0.01`: máximo 2 decimales (`@Digits(fraction = 2)` en Java, `decimals: 2` en `numberRules`).
- Errores: formato por defecto de Spring Boot (`timestamp`, `status`, `error`, `path`).

## Validaciones
Al terminar una tarea, comprueba solo que compila (`./mvnw -q compile`, o `npm run build` y `npm run lint`) y revisa a mano que el contrato y el código coinciden. Las suites completas solo se ejecutan cuando la usuaria las pide con `/tests` (ver `CLAUDE.md`):
```bash
npx @redocly/cli lint api-docs/openapi.yaml                 # el contrato es válido
cd backend && ./mvnw test -Dtest='ApiContractTest,PetPhotoServiceTest'   # código == contrato
cd frontend && npm run build && npm run lint                # tipos TS coherentes
```
Si un cambio toca un endpoint, añade sus casos a `ApiContractTest`.

## Criterios de aceptación
- Todo cambio respeta el schema del OpenAPI.
- Los nombres de campos y modelos coinciden con el contrato.
- Los códigos HTTP son correctos.
- Los errores devueltos coinciden con la especificación.
- El frontend consume la API con los tipos y payloads correctos.
- El código es limpio, modular y mantenible.
- Si hay pruebas, se ejecutan con éxito.
- Si el cambio afecta al schema, se actualiza también la documentación.

## Importante
- No implementes "por intuición" si el schema ya define la respuesta esperada.
- Si algo no está en el schema, asume que no debe existir salvo que se haya acordado explícitamente.
- Prioriza la consistencia del contrato sobre los atajos.

## Entrega esperada (en español, tono profesional y práctico)
- Qué se ha implementado, en breve.
- Qué endpoints, DTOs y validaciones se han ajustado.
- Los archivos clave tocados.
- La lista de validaciones realizadas.
- Si hay una discrepancia con el schema: la razón y cómo se resuelve.
