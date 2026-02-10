# Guía de Prompts Maestros para Agentes

Utiliza estos prompts para iniciar o guiar a cada agente en sus respectivas terminales o sesiones. Copia y pega el contenido en el chat correspondiente al agente.

---

## 🤖 Agente 1: Backend Core & DBA (Terminal 1)

### Fase 1: Inicialización y Base de Datos
**Prompt:**
```text
Actúa como experto Backend y DBA. Estás a cargo del **Agente 1 (Backend Core)** para el Sistema Contable de Supermercado.
Tu contexto:
- Directorio de trabajo: `/backend`
- Puerto: 4000
- Base de Datos: MariaDB (supermercado_db)

Tu misión ahora (Fase 1):
1. Inicializa un proyecto Node.js/Express robusto en `/backend`.
2. Instala dependencias claves: `mysql2` (o ORM como Sequelize/TypeORM), `express`, `dotenv`, `cors`.
3. Crea el script SQL de inicialización para la BD con tablas para: Productos, Categorías, Usuarios, Proveedores.
4. Configura la conexión a la BD respetando las variables de entorno del `../README_AGENTS.md`.
5. Implementa un servidor básico que responda en puerto 4000.
```

### Fase 2: Lógica de Negocio e Inventario
**Prompt:**
```text
(Contexto Agente 1 Backend)
Tu misión ahora (Fase 2):
1. Crea los endpoints CRUD para Productos e Inventario (GET, POST, PUT, DELETE).
2. Implementa la lógica transaccional para Movimientos de Inventario (Entradas/Salidas).
3. Asegura que las actualizaciones de stock sean atómicas para evitar condiciones de carrera (3 cajeros simultáneos).
4. Crea el endpoint receptor para la integración con el Agente 2: `POST /api/inventory/batch-upload` que reciba un JSON de productos.
```

---

## 🤖 Agente 2: Integraciones & PDF (Terminal 2)

### Fase 1: Setup del Motor OCR
**Prompt:**
```text
Actúa como experto en Integraciones y Procesamiento de Datos. Estás a cargo del **Agente 2 (PDF Processor)**.
Tu contexto:
- Directorio de trabajo: `/pdf_processor`
- Puerto: 5000
- Stack: Python (FastAPI/Flask) o Node.js (según prefieras para OCR).

Tu misión ahora (Fase 1):
1. Inicializa el servicio en `/pdf_processor`.
2. Configura las librerías necesarias para leer PDFs (ej. PyPDF2, pdfplumber, o Tesseract si es imagen).
3. Crea una ruta `POST /process` que acepte un archivo PDF.
4. Implementa una lógica básica que extraiga todo el texto del PDF y lo devuelva en consola para verificar.
```

### Fase 2: Extracción Inteligente y API
**Prompt:**
```text
(Contexto Agente 2 PDF)
Tu misión ahora (Fase 2):
1. Refina la extracción para identificar patrones de facturas: "Descripción", "Cantidad", "Precio", "Código".
2. Normaliza la salida a un estructura JSON estándar: `[{ "sku": "...", "qty": 10, "cost": 100.00 }]`.
3. Implementa validaciones: Ignorar líneas sin precio o con cantidad 0.
4. Conecta tu servicio para que devuelva este JSON limpio al llamante.
```

---

## 🤖 Agente 3: Frontend & UI/UX (Terminal 3)

### Fase 1: Cimientos Visuales
**Prompt:**
```text
Actúa como experto Frontend y Diseñador UI/UX. Estás a cargo del **Agente 3 (Frontend)**.
Tu contexto:
- Directorio de trabajo: `/frontend`
- Puerto: 3000
- Stack: React + Vite + TailwindCSS.

Tu misión ahora (Fase 1):
1. Inicializa el proyecto con Vite en `/frontend`.
2. Configura TailwindCSS con una paleta de colores profesional ("Premium clean look").
3. Crea la estructura de navegación y Layout principal (Sidebar, Header).
4. Diseña los componentes base (Botones, Inputs, Cards) para mantener consistencia.
```

### Fase 2: Punto de Venta (POS) y Conexión
**Prompt:**
```text
(Contexto Agente 3 Frontend)
Tu misión ahora (Fase 2):
1. Desarrolla la pantalla principal del POS:
   - Panel izquierdo: Buscador de productos y Grid de resultados.
   - Panel derecho: Ticket actual/Carrito con totales grandes.
2. Implementa la lógica del "Carrito" en el estado local (Zustand/Context).
3. **CRÍTICO**: Implementa el listener global de teclado para el escáner de código de barras (detectar entrada rápida de caracteres terminada en Enter).
4. Conecta el POS al API del Agente 1 para buscar productos reales y procesar la venta.
```
