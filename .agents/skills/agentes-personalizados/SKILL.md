---
name: agentes-personalizados
description: >-
  Usa esta skill cuando el usuario quiera crear, configurar, invocar o entender
  los agentes personalizados (custom agents) de Antigravity. Cubre el formato
  del archivo de agente (frontmatter YAML + cuerpo Markdown), los campos
  disponibles, dónde guardar los archivos, cómo seleccionarlos como agente
  principal y cómo son invocados como subagentes por un coordinador.
---

# Agentes Personalizados en Antigravity

Los agentes personalizados permiten convertir Antigravity de un asistente generalista en un especialista enfocado en tareas concretas (por ejemplo: revisión de código, modernización de dependencias, auditoría de seguridad o diseño frontend).

Se definen mediante **un único archivo Markdown** estructurado en dos partes:
1. **Frontmatter YAML**: Configuración técnica, modelo, herramientas, permisos y modos de ejecución.
2. **Cuerpo Markdown**: Las instrucciones directas (system prompt) que guían el comportamiento del agente.

---

## Dónde guardar los archivos de agente

| Alcance | Ruta | Propósito |
|---|---|---|
| **Proyecto** | `.agents/agents/<nombre-del-agente>.md` | Específico del repositorio. Se commitea al control de versiones (Git) y está disponible automáticamente para todo el equipo. |
| **Global** | `~/.gemini/config/agents/<nombre-del-agente>.md`<br>*(En Windows: `%USERPROFILE%\.gemini\config\agents\<nombre-del-agente>.md`)* | Disponible en todos los proyectos de tu máquina local. No se comparte con el repositorio. |

---

## Formato del archivo de agente

Un agente se define con la extensión `.md`. A continuación se muestra la estructura estándar:

```markdown
---
name: nombre-del-agente
description: Descripción clara de qué hace el agente y cuándo debe ser invocado por el coordinador.
model: flash
mainAgent: true
subagent: true
permissionMode: acceptEdits
commandExecutionPolicy: auto
tools:
  - view_file
  - replace_file_content
  - run_command
  - manage_task
skills:
  - skills/mi-habilidad
---

# Instrucciones del Agente

Aquí se redacta el system prompt del agente en Markdown estándar.
Todo este contenido se inyecta directamente como contexto principal para el modelo.

## Objetivos y Criterios
1. Define claramente las metas que el agente debe cumplir.
2. Especifica restricciones, estándares de código y estilo.
3. Detalla los criterios de validación y verificación de tareas.
```

---

## Campos del frontmatter YAML

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `name` | `string` | **Sí** | Identificador único del agente (letras minúsculas, guiones recomendados). |
| `description` | `string` | **Sí** | Explicación funcional del agente. El agente coordinador la analiza semánticamente para decidir si delega una tarea a este subagente. |
| `model` | `string` | No | Modelo a emplear para este agente (por ejemplo: `flash`, `pro`). Si no se especifica, usa el modelo configurado por defecto. |
| `mainAgent` | `boolean` | No | Si es `true`, el agente puede seleccionarse como agente interactivo principal en la interfaz visual (IDE) o pasarse por CLI con `--agent`. |
| `subagent` | `boolean` | No | Si es `true`, un agente coordinador puede invocarlo dinámicamente como subagente durante la resolución de tareas compuestas. |
| `permissionMode` | `string` | No | Modo de permisos: `default`, `acceptEdits` (acepta cambios de código sin confirmación interactiva paso a paso), o `bypassPermissions`. |
| `commandExecutionPolicy` | `string` | No | Por ejemplo `auto`. Permite la ejecución autónoma de comandos estándar y seguros (tests, builds, linters) sin solicitar confirmaciones constantes al usuario, reservando las alertas para comandos de riesgo. |
| `tools` | `list[string]` | No | Lista explícita de herramientas a las que tiene acceso. Acotar las tools evita la "confusión de herramientas", reduce el uso de contexto y mejora la tasa de éxito. |
| `skills` | `list[string]` | No | Habilidades adicionales que el agente debe tener cargadas (rutas relativas respecto a la raíz de personalizaciones, p. ej. `skills/mi-habilidad`). |

---

## Cómo invocar un agente personalizado

Antigravity soporta dos modos de uso complementarios:

### 1. Como Agente Principal (Interactivo)
Requiere tener `mainAgent: true` en el frontmatter.
- **Desde la interfaz (Antigravity IDE / GUI):** Selecciona el agente directamente desde el selector de agentes en la barra de chat.
- **Desde la consola (CLI):**
  ```bash
  agy --agent nombre-del-agente
  ```

### 2. Como Subagente (Delegación automática)
Requiere tener `subagent: true` en el frontmatter.
- El agente coordinador lee automáticamente el catálogo de subagentes disponibles en el proyecto o a nivel global.
- Al recibir una petición del usuario que coincide con la especialidad indicada en el campo `description`, el coordinador delega la subtarea al subagente autónomo.

### Simetría de Ejecución (Execution Symmetry)
A diferencia de otros entornos que fuerzan una separación estricta entre agentes principales y subagentes, Antigravity permite configurar simultáneamente:
```yaml
mainAgent: true
subagent: true
```
Esto te permite probar o conversar directamente con un agente especializado de manera interactiva, y al mismo tiempo dejarlo disponible para que un orquestador lo invoque en segundo plano.

---

## Pasos para crear un agente en este proyecto

1. **Crear el directorio y archivo:**
   Crea la ruta `.agents/agents/<nombre-del-agente>.md` en la raíz de tu proyecto.
2. **Configurar el frontmatter:**
   Define al menos `name` y una `description` descriptiva.
3. **Acotar herramientas y skills:**
   Incluye únicamente las `tools` y `skills` indispensables para la tarea.
4. **Escribir las directrices:**
   Redacta el prompt en Markdown indicando rol, metodología y validación.
5. **Guardar y versionar:**
   Haz commit del archivo en tu repositorio para compartirlo con el equipo.

---

## Ejemplos prácticos

### Ejemplo 1: Revisor de Pull Requests / Código
`.agents/agents/code-reviewer.md`:
```markdown
---
name: code-reviewer
description: Realiza revisiones minuciosas de código buscando bugs, problemas de rendimiento y buenas prácticas.
model: pro
mainAgent: true
subagent: true
permissionMode: default
tools:
  - view_file
  - grep_search
---

# Code Reviewer Instructions

Eres un revisor de código senior. Analiza los cambios y archivos solicitados prestando atención a:
1. Vulnerabilidades de seguridad y validación de entradas.
2. Rendimiento, cuellos de botella y uso innecesario de memoria.
3. Legibilidad y apego a los estándares del proyecto.

Estructura tu reporte con:
- Resumen general.
- Hallazgos críticos.
- Sugerencias de mejora con ejemplos concisos.
```

### Ejemplo 2: Actualizador de dependencias y pruebas
`.agents/agents/dependency-updater.md`:
```markdown
---
name: dependency-updater
description: Actualiza paquetes y dependencias del proyecto y ejecuta la suite de tests para asegurar compatibilidad.
model: flash
mainAgent: true
subagent: true
permissionMode: acceptEdits
commandExecutionPolicy: auto
tools:
  - view_file
  - replace_file_content
  - run_command
  - manage_task
---

# Dependency Updater Instructions

Tu responsabilidad es inspeccionar dependencias del proyecto (package.json, lockfiles), sugerir o aplicar actualizaciones y ejecutar los tests correspondientes.
Verifica que la compilación y los tests finalicen exitosamente antes de concluir la tarea.
```
