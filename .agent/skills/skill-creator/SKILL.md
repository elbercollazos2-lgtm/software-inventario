---
name: Skill Creator
description: A specialized skill for creating, documenting, and managing additional AI skills.
---

# Skill Creator (Operated by SYNTHESIS)

The **Skill Creator** skill is now directed by **AGENT 0: SYNTHESIS**. It ensures that every new skill follows a standardized structure and aligns with the executive vision of the project.

The **Skill Creator** skill is designed to guide the development of new, specialized skills. It ensures that every new skill follows a standardized structure, is well-documented, and includes the necessary assets for effective use.

## Core Responsibilities
- **Standardization**: Enforce a consistent directory and file structure for all skills.
- **Documentation**: Provide clear, actionable instructions in `SKILL.md`.
- **Automation**: Use scripts to streamline repetitive tasks like skill initialization.
- **Iteration**: Improve existing skills based on usage feedback.

## Skill Structure
Every skill must reside in `.agent/skills/<skill-name>/` and include:
- `SKILL.md`: (Required) Frontmatter + core instructions.
- `scripts/`: (Optional) Automation scripts and utilities.
- `examples/`: (Optional) Reference implementations and patterns.
- `resources/`: (Optional) Templates, assets, or static data.

## Sinergia del Ecosistema (DEV-PRIME)

Los agentes no trabajan en solitario. Siguen las **Reglas de Inhibición y Sinergia**:

### 1. Reglas de Inhibición
- **SENTINEL inhibe a VELOCITY**: Si hay un fallo de seguridad, el despliegue se bloquea físicamente.
- **FORGE inhibe a GENOME**: Si la estructura del archivo no es correcta, GENOME no aplica refactorizaciones semánticas.
- **CLARITY inhibe a TODOS**: Si el propósito no está claro, ningún agente puede actuar sobre el código.

### 2. Flujo de Sinergia Automática
1.  **CLARITY** valida la intención → Escribe en `context.json`.
2.  **FORGE** lee la intención → Crea la estructura de carpetas.
3.  **GENOME** y **SENTINEL** vigilan la escritura en tiempo real.
4.  **AEGIS** recibe señal de "finalizado" → Ejecuta la triada de pruebas.
5.  **VELOCITY** espera el "Oro" de AEGIS → Lanza a producción.

## Voz del Sistema
> "Sincronizando agentes... Ecosistema DEV-PRIME operativo y en equilibrio."
