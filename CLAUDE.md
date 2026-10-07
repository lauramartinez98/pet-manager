# Pet Manager

Monorepo: `backend/` (Spring Boot 4, Java 25), `frontend/` (React 19 + Vite + TypeScript + Tailwind v4) y `api-docs/openapi.yaml` (contrato de la API).

## Reglas del proyecto

### Documentación del código (obligatoria)
- **Toda función lleva delante un comentario breve que explica qué hace.** Esto incluye:
  - métodos de Java y constructores con lógica;
  - funciones y componentes de React;
  - hooks;
  - funciones flecha exportadas;
  - manejadores con nombre (`handleX`) dentro de los componentes.
- **Formato:** `/** ... */` (Javadoc o JSDoc) justo encima de la función y de sus anotaciones, para que el IDE lo muestre al pasar el ratón. Una línea basta; usa varias solo si hay algo no obvio que contar (un porqué, un efecto secundario, un código HTTP que se devuelve).
- **Contenido:** el comentario explica el *qué* y, si hace falta, el *porqué*; no repite el código línea a línea. Escríbelo en español, como el resto del proyecto.
- **Excepciones:** los tests, cuyo nombre ya describe el escenario, y las lambdas anónimas pasadas como argumento.
- **Al terminar:** antes de dar por cerrado un cambio, comprueba que ninguna función nueva o modificada se ha quedado sin su comentario.

### Tests: solo cuando se pidan
- **Al hacer una tarea no se ejecutan las suites de tests:** ni los de backend (`./mvnw test`), ni las pruebas E2E con navegador, ni las pruebas manuales contra el servidor arrancado. La usuaria las pide expresamente con el comando `/tests` (o diciéndolo).
- **Sí se hace una comprobación rápida de que el código compila,** solo de la parte tocada:
  - backend: `./mvnw -q compile`;
  - frontend: `npm run build` y `npm run lint`.
  Así no se entrega nada roto.
- **Escribir o ajustar tests sí forma parte de la tarea** cuando el cambio lo requiere (p. ej. un endpoint nuevo en `ApiContractTest`); lo que no se hace es ejecutarlos.

### Schema-Driven Development
Antes de tocar endpoints, DTOs, controladores, servicios o llamadas HTTP del frontend, aplica la skill `sdd-validator` (`.claude/skills/sdd-validator/SKILL.md`). `api-docs/openapi.yaml` es la fuente de verdad.

### Estilo visual
Para cualquier cambio de UI, aplica la skill `ui-design` (`.claude/skills/ui-design/SKILL.md`): paleta, tipografía, iconos lucide (sin emojis), logo y componentes compartidos.

### Publicaciones en Git/GitHub
Cuando la usuaria pida subir o publicar cambios en Git/GitHub, aplica la skill `git-workflow` (`.claude/skills/git-workflow/SKILL.md`) antes de preparar la publicación.

### Skills y agentes
- Skills en `.claude/skills/<nombre>/SKILL.md`: `sdd-validator`, `ui-design`, `git-workflow` y `tests` (esta solo a mano, con `/tests`).
- Subagentes en `.claude/agents/<nombre>.md`: `frontend-expert` (UI) y `sdd-fullstack-expert` (funcionalidades que cruzan back y front).

## Comandos
```bash
# VS Code: Run and Debug → "Pet Manager: back + front" (.vscode/launch.json) arranca los dos
cd backend && ./mvnw spring-boot:run                       # API en http://localhost:8080/api/v1
cd backend && ./mvnw test -Dtest='ApiContractTest,PetPhotoServiceTest'
cd frontend && npm run dev                                  # http://localhost:5173
cd frontend && npm run build && npm run lint
npx @redocly/cli lint api-docs/openapi.yaml
```

## Secretos
Viven solo en `backend/.env` (ignorado por git). Nunca se suben al repositorio ni se pegan en el chat.
