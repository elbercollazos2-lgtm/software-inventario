# 🏗️ Plan de Desarrollo por Fases - Sistema de Inventarios

---

## 📋 Resumen de Fases

| Fase | Nombre | Duración Estimada | Prioridad |
|------|--------|-------------------|-----------|
| 1 | Fundamentos y Arquitectura | 2-3 semanas | 🔴 Crítica |
| 2 | Catálogo y Maestros | 2-3 semanas | 🔴 Crítica |
| 3 | Operaciones Transaccionales | 3-4 semanas | 🔴 Crítica |
| 4 | Lógica de Negocio Avanzada | 3-4 semanas | 🟡 Alta |
| 5 | Reportes y KPIs | 2-3 semanas | 🟡 Alta |
| 6 | Funcionalidades Avanzadas | 3-4 semanas | 🟢 Media |
| 7 | Optimización e Infraestructura | 2 semanas | 🟢 Media |

---

## 🔴 FASE 1: Fundamentos y Arquitectura Técnica
**Objetivo:** Establecer la base técnica sólida del sistema.

### 1.1 Infraestructura Base
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 1.1.1 | Configurar arquitectura Cliente/Servidor | Backend Express + MariaDB funcionando |
| 1.1.2 | Diseñar esquema de base de datos normalizado | Diagrama ER aprobado, migraciones creadas |
| 1.1.3 | Implementar sistema de autenticación (JWT) | Login/Logout + Roles funcionando |
| 1.1.4 | Configurar CORS y seguridad básica | Helmet.js + validación de headers |
| 1.1.5 | Establecer estructura de proyecto frontend | Vite + React + TailwindCSS operativo |

### 1.2 Auditoría y Trazabilidad Base
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 1.2.1 | Crear tabla de log de transacciones | Registro automático de cada operación |
| 1.2.2 | Implementar campos de auditoría | `created_at`, `updated_at`, `user_id` en todas las tablas |
| 1.2.3 | Sistema de respaldo de datos | Script de backup automático configurado |

---

## 🔴 FASE 2: Estructura y Clasificación del Catálogo (Maestros)
**Objetivo:** Crear la base para organizar miles de referencias eficientemente.

### 2.1 Identificación de Productos (SKUs)
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 2.1.1 | CRUD completo de Productos | Crear, leer, actualizar, eliminar funcionando |
| 2.1.2 | Campo SKU único autogenerado o manual | Validación de duplicados implementada |
| 2.1.3 | Descripción detallada del producto | Campo texto largo con búsqueda full-text |
| 2.1.4 | Unidades de medida configurables | Tabla maestra: unidades, gramos, cajas, kg, litros |
| 2.1.5 | Soporte para códigos de barras | Campo EAN-13/UPC, escaneo desde POS |
| 2.1.6 | Estado del producto (activo/inactivo) | Filtro y toggle implementado |

### 2.2 Categorización Jerárquica
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 2.2.1 | CRUD de Grupos de Inventario | Materia prima, mercancía venta, maquinaria, etc. |
| 2.2.2 | CRUD de Departamentos/Líneas | Lácteos, ferretería, limpieza, etc. |
| 2.2.3 | Asignación jerárquica a productos | Producto → Línea → Grupo |
| 2.2.4 | Navegación por categorías en UI | Filtros y breadcrumbs funcionando |
| 2.2.5 | Margen de utilidad por categoría | Autocalculación de precios de venta |

### 2.3 Manejo de Bodegas/Ubicaciones
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 2.3.1 | CRUD de Bodegas | Bodega principal, sucursales, virtual |
| 2.3.2 | Stock independiente por bodega | Consulta de saldos por ubicación |
| 2.3.3 | Costo promedio por bodega | Cálculo separado por ubicación |
| 2.3.4 | Selector de bodega en operaciones | Dropdown en todas las transacciones |

---

## 🔴 FASE 3: Operaciones y Transacciones Core
**Objetivo:** Procesar movimientos que actualicen existencias en tiempo real.

### 3.1 Cargue Inicial de Inventario
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 3.1.1 | Pantalla de carga masiva inicial | Importación desde Excel/CSV |
| 3.1.2 | Captura de cantidad y costo unitario | Validación de datos numéricos |
| 3.1.3 | Asignación a bodega destino | Selección obligatoria de ubicación |
| 3.1.4 | Documento de apertura de inventario | Folio, fecha, responsable |

### 3.2 Entradas de Inventario
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 3.2.1 | Registro de compras a proveedores | Detalle de factura, ítems, costos |
| 3.2.2 | Actualización automática de stock | +cantidad al confirmar compra |
| 3.2.3 | Devoluciones de clientes | +stock, documento de devolución |
| 3.2.4 | Producción interna (transformación) | Conversión materia prima → producto |

### 3.3 Salidas de Inventario
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 3.3.1 | Ventas/Facturación (POS) | -stock al confirmar venta |
| 3.3.2 | Consumos internos | Uso para operaciones internas |
| 3.3.3 | Devoluciones a proveedores | -stock, documento de devolución |
| 3.3.4 | Muestras/Promociones | Salida sin venta |

### 3.4 Traslados entre Bodegas
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 3.4.1 | Documento de traslado | Origen, destino, ítems, cantidades |
| 3.4.2 | Salida automática de origen | -stock en bodega origen |
| 3.4.3 | Entrada automática en destino | +stock en bodega destino |
| 3.4.4 | Estados del traslado | Pendiente → En tránsito → Recibido |

### 3.5 Ajustes de Inventario
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 3.5.1 | Documento de ajuste formal | Folio, fecha, hora, responsable |
| 3.5.2 | Motivo detallado obligatorio | Merma, robo, daño, error de registro |
| 3.5.3 | Ajuste positivo (+) o negativo (-) | Corrección de diferencias |
| 3.5.4 | Autorización según rol | Solo supervisores/admin |
| 3.5.5 | Histórico de ajustes auditable | Drill-down disponible |

---

## 🟡 FASE 4: Lógica de Negocio y Reglas Avanzadas
**Objetivo:** Garantizar integridad financiera y operativa.

### 4.1 Método de Valoración: Costo Promedio Ponderado (PMP)
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 4.1.1 | Fórmula de cálculo PMP | `(Stock*CostoActual + Compra*CostoCompra) / (Stock+Compra)` |
| 4.1.2 | Recálculo automático en cada entrada | Trigger en operaciones de compra |
| 4.1.3 | Histórico de costos por producto | Tabla de log de cambios de costo |
| 4.1.4 | Costo promedio por bodega | Cálculo independiente si aplica |

### 4.2 Control de Stock Proactivo
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 4.2.1 | Configuración de stock mínimo/máximo | Campos en ficha de producto |
| 4.2.2 | Alertas visuales en dashboard | Productos en umbral crítico |
| 4.2.3 | Notificaciones push/email | Alerta cuando stock < mínimo |
| 4.2.4 | Sugerencia de reabastecimiento | Cantidad sugerida = stock máximo - actual |
| 4.2.5 | Reporte de productos críticos | Lista ordenada por urgencia |

### 4.3 Conversión de Unidades
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 4.3.1 | Tabla de factores de conversión | Unidad base → unidades derivadas |
| 4.3.2 | Compra en unidad mayor (bulto) | 1 bulto = 50 kg → registra 50,000 gr |
| 4.3.3 | Venta en unidad menor (gramos) | Venta 250gr → -0.25 kg de stock |
| 4.3.4 | Precio por unidad derivada | Cálculo automático: precio/gramo |

### 4.4 Trazabilidad Sanitaria (Lotes y Vencimientos)
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 4.4.1 | Configuración de producto perecedero | Flag en ficha de producto |
| 4.4.2 | Número de lote en cada entrada | Campo obligatorio en compras |
| 4.4.3 | Fecha de fabricación y vencimiento | Campos de fecha obligatorios |
| 4.4.4 | Alertas de productos próximos a vencer | Dashboard + notificaciones |
| 4.4.5 | Rotación FIFO/PEPS automática | Salida prioriza lotes más antiguos |
| 4.4.6 | Reporte de lotes por vencer | Filtro por rango de fechas |

### 4.5 Integración Contable (NIIF)
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 4.5.1 | Catálogo de cuentas contables | Plan contable configurable |
| 4.5.2 | Asiento automático en compras | Débito: Inventario, Crédito: Proveedor |
| 4.5.3 | Asiento automático en ventas | Débito: Costo Venta, Crédito: Inventario |
| 4.5.4 | Asiento automático en ajustes | Débito/Crédito según tipo de ajuste |
| 4.5.5 | Libro mayor de movimientos | Consulta de asientos generados |

---

## 🟡 FASE 5: Reportes e Indicadores (KPIs)
**Objetivo:** Generar información para toma de decisiones.

### 5.1 Reportes Operativos
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 5.1.1 | Saldos de inventario | Cantidad y costo por producto/bodega |
| 5.1.2 | Kardex de producto | Historial de movimientos por ítem |
| 5.1.3 | Movimientos por período | Entradas/salidas en rango de fechas |
| 5.1.4 | Productos sin movimiento | Identificar inventario estancado |

### 5.2 Reportes de Análisis
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 5.2.1 | Rotación de inventario | `Costo Ventas / Inventario Promedio` |
| 5.2.2 | Días de inventario | `365 / Rotación` |
| 5.2.3 | Clasificación ABC | 80/15/5% del valor de inventario |
| 5.2.4 | Productos estrella vs lento movimiento | Top 10 / Bottom 10 |

### 5.3 Reportes Financieros
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 5.3.1 | Margen de rentabilidad por producto | `(Precio - Costo) / Precio × 100` |
| 5.3.2 | Valor total del inventario | Suma de (stock × costo promedio) |
| 5.3.3 | Costo de ventas por período | Total costo de mercancía vendida |
| 5.3.4 | Comparativo de márgenes | Por categoría, línea, departamento |

### 5.4 Auditoría Drill-Down
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 5.4.1 | Navegación desde saldo a documentos | Click en saldo → ver movimientos |
| 5.4.2 | Ver documento original | Factura, ajuste, traslado |
| 5.4.3 | Exportación a Excel/PDF | Todos los reportes exportables |

---

## 🟢 FASE 6: Funcionalidades Avanzadas
**Objetivo:** Capacidades adicionales para operación robusta.

### 6.1 Modo Offline (POS Desconectado)
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 6.1.1 | Service Worker para cache | Aplicación funciona sin internet |
| 6.1.2 | Base de datos local (IndexedDB) | Almacenamiento temporal de ventas |
| 6.1.3 | Cola de sincronización | Transacciones pendientes en queue |
| 6.1.4 | Sincronización automática | Envío al servidor cuando hay conexión |
| 6.1.5 | Resolución de conflictos | Estrategia para duplicados |

### 6.2 Integración con Lectores
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 6.2.1 | Escaneo de códigos de barras | Soporte para lectores USB/Bluetooth |
| 6.2.2 | Búsqueda rápida por código | Autocompletado en POS |
| 6.2.3 | Impresión de etiquetas | Generación de códigos QR/barras |

### 6.3 Multi-sucursal
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 6.3.1 | Gestión de múltiples tiendas | CRUD de sucursales |
| 6.3.2 | Inventario consolidado | Vista global de todas las bodegas |
| 6.3.3 | Traslados inter-sucursales | Flujo de aprobación |

---

## 🟢 FASE 7: Optimización e Infraestructura
**Objetivo:** Garantizar rendimiento óptimo para altos volúmenes.

### 7.1 Optimización de Base de Datos
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 7.1.1 | Índices en columnas críticas | SKU, código_barras, fecha |
| 7.1.2 | Particionamiento de tablas grandes | Movimientos por año/mes |
| 7.1.3 | Queries optimizados | Tiempo de respuesta < 200ms |

### 7.2 Hardware Recomendado
| Componente | Especificación Mínima |
|------------|----------------------|
| Procesador | 4 GHz, 4 núcleos |
| RAM | 4 GB + 1.5 GB por usuario |
| Almacenamiento | SSD NVMe (exclusivo para BD) |
| Red local | 1 Gigabit |

### 7.3 Pruebas y Calidad
| # | Tarea | Criterio de Completitud |
|---|-------|------------------------|
| 7.3.1 | Tests unitarios (backend) | Cobertura > 80% |
| 7.3.2 | Tests E2E (Playwright) | Flujos críticos cubiertos |
| 7.3.3 | Pruebas de carga | 100 usuarios concurrentes |
| 7.3.4 | Documentación técnica | API docs + manual de usuario |

---

## 📊 Cronograma Visual

```
FASE 1 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (Sem 1-3)
FASE 2 ░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░ (Sem 4-6)
FASE 3 ░░░░░░░░░░░░░░░░████████████░░░░░░░░░░ (Sem 7-10)
FASE 4 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████░░ (Sem 11-14)
FASE 5 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████ (Sem 15-17)
FASE 6 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (Sem 18-21)
FASE 7 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (Sem 22-24)
```
