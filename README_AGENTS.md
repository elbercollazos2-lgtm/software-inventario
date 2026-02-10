# Sistema Contable Supermercado - Manual de Operaciones para Agentes

> **IMPORTANTE**: Este workspace está dividido en 3 roles operativos. Antes de modificar código, identifica qué AGENTE (rol) estás ejecutando.

## 📁 Estructura del Workspace

| Directorio | Agente Responsable | Puerto | Descripción |
| :--- | :--- | :--- | :--- |
| `/backend` | **Agente 1 (Backend Core)** | `4000` | API REST, Modelos de BD, Autenticación. |
| `/pdf_processor` | **Agente 2 (Integraciones)** | `5000` | Servicio OCR, Procesamiento de Facturas. |
| `/frontend` | **Agente 3 (UI/UX)** | `3000` | Interfaz React, POS, Dashboards. |

## 🔗 Conexión y Variables de Entorno

Todos los agentes comparten la configuración base de la base de datos MariaDB.

### Configuración Compartida (.env)
```ini
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_NAME=supermercado_db

# Puertos de Servicios
PORT_BACKEND=4000
PORT_PDF_SERVICE=5000
PORT_FRONTEND=3000
```

## 🤝 Protocolo de Comunicación

1. **Frontend (Agente 3)**:
   - Consume `/api` del **Backend (Agente 1)** en `http://localhost:4000`.
   - Para carga de archivos, puede comunicar con **Backend** que delega a **PDF Processor**, o (según diseño) subir directo. *Por defecto: Todo pasa por Backend.*

2. **Backend (Agente 1)**:
   - Recibe peticiones del Frontend.
   - Envía PDFs recibidos al **PDF Processor (Agente 2)** vía HTTP POST `http://localhost:5000/process`.
   - Recibe JSON estructurado del PDF Processor y actualiza la BD.

3. **PDF Processor (Agente 2)**:
   - Servicio "Stateless" (sin estado).
   - Recibe PDF -> Devuelve JSON.

## 🚀 Cómo Iniciar (Sesión de Desarrollo)

Para trabajar simultáneamente, el usuario debe tener 3 terminales activas:

1. **Terminal Backend**: `cd backend && npm run dev`
2. **Terminal PDF**: `cd pdf_processor && python main.py` (o node)
3. **Terminal Frontend**: `cd frontend && npm run dev`
