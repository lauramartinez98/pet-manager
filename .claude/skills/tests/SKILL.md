---
name: tests
description: Ejecuta toda la batería de pruebas de Pet Manager (contrato OpenAPI, tests del backend y build/lint del frontend) y resume los resultados. Úsala solo cuando la usuaria lo pida con /tests.
disable-model-invocation: true
---

Ejecuta, en este orden, y resume el resultado de cada paso en una tabla (✓ / ✗ con el motivo):

1. **Contrato:** `npx @redocly/cli lint api-docs/openapi.yaml`.
2. **Backend:** `cd backend && ./mvnw test -Dtest='ApiContractTest,PetPhotoServiceTest'`. Indica cuántos tests pasan de cuántos.
   - No ejecutes `BackendApplicationTests` salvo que se pida: se conecta a la base de datos y a Supabase reales.
3. **Frontend:** `cd frontend && npm run build && npm run lint`.
4. **Documentación:** comprueba que ninguna función de `backend/src/main` ni de `frontend/src` se ha quedado sin su comentario `/** */` (regla de `CLAUDE.md`).

Si se pasa el argumento `e2e`, además arranca backend y frontend, ejecuta las pruebas E2E que haya y al terminar para los servidores y borra los datos de prueba.

Si algo falla, explica la causa y propón el arreglo, pero no lo apliques sin confirmación.
