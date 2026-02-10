const db = require('../config/db');
const Movimiento = require('../models/Movimiento');
const Producto = require('../models/Producto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const inventarioController = {
    // POST /api/inventory/movement
    // Procesa un movimiento individual (entrada o salida)
    registerMovement: catchAsync(async (req, res, next) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { producto_id, tipo, cantidad, motivo, usuario_id } = req.body;

            // 1. Bloquear la fila del producto para actualización (Atómico)
            const [productos] = await connection.query(
                'SELECT id, stock FROM productos WHERE id = ? FOR UPDATE',
                [producto_id]
            );

            if (productos.length === 0) {
                throw new AppError('Producto no encontrado', 404);
            }

            const currentStock = productos[0].stock;
            const nuevoStock = tipo === 'ENTRADA' ? currentStock + cantidad : currentStock - cantidad;

            if (nuevoStock < 0) {
                throw new AppError('Stock insuficiente para esta operación', 400);
            }

            // 2. Actualizar Stock
            await connection.query(
                'UPDATE productos SET stock = ? WHERE id = ?',
                [nuevoStock, producto_id]
            );

            // 3. Registrar Movimiento
            await Movimiento.create({
                producto_id,
                tipo,
                cantidad,
                motivo,
                usuario_id
            }, connection);

            await connection.commit();
            res.json({ message: 'Movimiento registrado correctamente', nuevoStock });
        } catch (error) {
            await connection.rollback();
            // Re-throw standardized error or pass to next
            // If it's already an AppError, rethrowing allows catchAsync to catch it.
            // If it's a DB error, catchAsync will catch it too.
            throw error;
        } finally {
            connection.release();
        }
    }),

    // POST /api/inventory/batch-upload
    // Recibe JSON masivo del Agente 2 (PDF Processor)
    batchUpload: catchAsync(async (req, res, next) => {
        const productosProcesados = req.body; // Array de { codigo_barras, cantidad, nombre, precio_compra }
        const connection = await db.getConnection();
        const resultados = { exitosos: 0, errores: 0, detalles: [] };

        try {
            for (const item of productosProcesados) {
                try {
                    await connection.beginTransaction();

                    // Intentar buscar por código de barras
                    const [rows] = await connection.query(
                        'SELECT id, stock FROM productos WHERE codigo_barras = ? FOR UPDATE',
                        [item.codigo_barras]
                    );

                    if (rows.length > 0) {
                        // Actualizar producto existente (Entrada por compra)
                        const producto = rows[0];
                        const nuevoStock = producto.stock + (item.cantidad || 0);

                        await connection.query(
                            'UPDATE productos SET stock = ?, precio_compra = ?, iva = ?, proveedor_id = ? WHERE id = ?',
                            [nuevoStock, item.precio_compra || 0, item.iva || 0, req.body.proveedor_id || null, producto.id]
                        );

                        await Movimiento.create({
                            producto_id: producto.id,
                            tipo: 'ENTRADA',
                            cantidad: item.cantidad,
                            motivo: 'CARGA_MASIVA_PDF',
                            usuario_id: req.body.usuario_id || null
                        }, connection);

                        resultados.exitosos++;
                    } else {
                        // Crear producto nuevo
                        const [insertResult] = await connection.query(
                            `INSERT INTO productos (codigo_barras, nombre, precio_compra, precio_venta, stock, iva, proveedor_id, categoria_id)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                item.codigo_barras,
                                item.nombre || '(Sin nombre)',
                                item.precio_compra || 0,
                                (item.precio_compra || 0) * 1.3, // Margen sugerido 30%
                                item.cantidad || 0,
                                item.iva || 0,
                                req.body.proveedor_id || null,
                                1 // Categoría por defecto
                            ]
                        );

                        await Movimiento.create({
                            producto_id: insertResult.insertId,
                            tipo: 'ENTRADA',
                            cantidad: item.cantidad,
                            motivo: 'CREACION_INICIAL_PDF',
                            usuario_id: req.body.usuario_id || null
                        }, connection);

                        resultados.exitosos++;
                    }

                    await connection.commit();
                } catch (err) {
                    await connection.rollback();
                    resultados.errores++;
                    resultados.detalles.push(`Error en ${item.codigo_barras}: ${err.message}`);
                }
            }

            res.json({
                message: 'Proceso de carga masiva finalizado',
                stats: resultados
            });
        } catch (error) {
            throw new AppError('Error crítico en carga masiva: ' + error.message, 500);
        } finally {
            connection.release();
        }
    }),

    // POST /api/inventory/validate-batch
    // Valida productos antes de la carga masiva
    validateBatch: catchAsync(async (req, res, next) => {
        const productosExtraidos = req.body; // Array de { sku, description, qty, cost }
        const connection = await db.getConnection();

        try {
            const validados = [];

            for (const item of productosExtraidos) {
                const [rows] = await connection.query(
                    'SELECT id, nombre, stock, precio_compra FROM productos WHERE codigo_barras = ?',
                    [item.sku]
                );

                if (rows.length > 0) {
                    validados.push({
                        ...item,
                        exists: true,
                        db_product: rows[0],
                        status: 'existing'
                    });
                } else {
                    validados.push({
                        ...item,
                        exists: false,
                        status: 'new'
                    });
                }
            }

            res.json(validados);
        } catch (error) {
            throw new AppError('Error validando lote de productos: ' + error.message, 500);
        } finally {
            connection.release();
        }
    }),

    // GET /api/inventory/history
    getHistory: catchAsync(async (req, res, next) => {
        const historial = await Movimiento.findAll();
        res.json(historial);
    })
};

module.exports = inventarioController;

