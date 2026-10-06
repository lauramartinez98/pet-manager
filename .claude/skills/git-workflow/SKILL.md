---
name: git-workflow
description: Revisa la configuración de ignorados y los archivos preparados cuando la usuaria pide subir o publicar cambios en Git o GitHub.
---

# Publicar cambios en Git/GitHub

Antes de preparar una subida o publicación:

1. Revisa `.gitignore` de la raíz y los `.gitignore` de las carpetas afectadas.
2. Comprueba que secretos, archivos de entorno locales, dependencias y artefactos generados no vayan a publicarse por accidente.
3. Revisa el estado de Git y los archivos que se van a incluir; confirma que `.gitignore` no esté excluyendo por error cambios que sí deben subirse.
4. Si detectas una omisión clara, corrige las reglas de ignorado dentro del alcance solicitado y comunica qué cambiaste. No fuerces archivos ignorados sin explicar el motivo.