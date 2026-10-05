# Skill: Schema-Driven Development (SDD)
name: sdd-validator
description: Valida que cualquier cambio en los controladores de Spring Boot o en los clientes de React cumpla estrictamente con el contrato definido en openapi.yaml.

## Instrucciones para el Agente:
1. Antes de crear o modificar endpoints en Spring Boot o llamadas fetch/axios en React, consulta siempre el archivo `api-docs/openapi.yaml`.
2. Asegúrate de que los nombres de los DTOs, campos, tipos de datos (UUID, enums como `PERRO`, `GATO`, `OTRO`) y códigos de estado HTTP coincidan exactamente con el contrato.