const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.create = catchAsync(async (req, res, next) => {
    const { numero_factura, proveedor_id, bodega_id, fecha_compra, total, items } = req.body;
    const usuario_id = req.body.usuario_id || req.user?.id || null;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Insertar la Compra con campos de pago
        const { monto_pagado = 0, estado_pago = 'PAGADO', fecha_vencimiento_pago = null } = req.body;

        const [compraResult] = await connection.query(
            'INSERT INTO compras (numero_factura, proveedor_id, bodega_id, fecha_compra, total, monto_pagado, estado_pago, fecha_vencimiento_pago, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [numero_factura, proveedor_id, bodega_id, fecha_compra, total, monto_pagado, estado_pago, fecha_vencimiento_pago, usuario_id]
        );
        const compraId = compraResult.insertId;

        // Si hay un abono inicial, registrarlo en la tabla de pagos
        if (parseFloat(monto_pagado) > 0) {
            await connection.query(
                'INSERT INTO pagos_compras (compra_id, monto, metodo_pago, nota, usuario_id) VALUES (?, ?, ?, ?, ?)',
                [compraId, monto_pagado, 'efectivo', 'Pago inicial al registrar compra', usuario_id]
            );
        }

        for (const item of items) {
            const { producto_id, cantidad, costo_unitario, subtotal } = item;
            const lote = item.lote || null;
            const fecha_vencimiento = item.fecha_vencimiento || null;

            // 2. Insertar Detalle de Compra
            await connection.query(
                'INSERT INTO detalle_compras (compra_id, producto_id, cantidad, costo_unitario, subtotal, lote, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [compraId, producto_id, cantidad, costo_unitario, subtotal, lote, fecha_vencimiento]
            );

            // 3. Obtener stock actual para el Kardex
            const [productRows] = await connection.query('SELECT stock FROM productos WHERE id = ?', [producto_id]);
            const saldoAnteriorGlobal = productRows[0].stock;

            const [bodegaRows] = await connection.query(
                'SELECT stock FROM producto_bodega WHERE producto_id = ? AND bodega_id = ?',
                [producto_id, bodega_id]
            );
            const saldoAnteriorBodega = bodegaRows.length > 0 ? bodegaRows[0].stock : 0;

            // 4. Actualizar Stock Global
            await connection.query(
                'UPDATE productos SET stock = stock + ?, precio_compra = ? WHERE id = ?',
                [cantidad, costo_unitario, producto_id]
            );

            // 5. Actualizar Stock en Bodega
            if (bodegaRows.length > 0) {
                await connection.query(
                    'UPDATE producto_bodega SET stock = stock + ?, costo_promedio = ? WHERE producto_id = ? AND bodega_id = ?',
                    [cantidad, costo_unitario, producto_id, bodega_id]
                );
            } else {
                await connection.query(
                    'INSERT INTO producto_bodega (producto_id, bodega_id, stock, costo_promedio) VALUES (?, ?, ?, ?)',
                    [producto_id, bodega_id, cantidad, costo_unitario]
                );
            }

            // 6. Registrar en Kardex
            await connection.query(
                `INSERT INTO kardex (producto_id, bodega_id, tipo_movimiento, referencia_id, cantidad, saldo_anterior, saldo_nuevo, costo_unitario, usuario_id) 
                 VALUES (?, ?, 'COMPRA', ?, ?, ?, ?, ?, ?)`,
                [producto_id, bodega_id, compraId, cantidad, saldoAnteriorBodega, parseFloat(saldoAnteriorBodega) + parseFloat(cantidad), costo_unitario, usuario_id]
            );

            // 7. Si trae fecha de vencimiento/lote, actualizar la ficha del producto (opcional, Fase 4)
            if (fecha_vencimiento) {
                await connection.query(
                    'UPDATE productos SET fecha_vencimiento = ?, perecedero = 1 WHERE id = ?',
                    [fecha_vencimiento, producto_id]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ id: compraId, message: 'Compra registrada y stock actualizado' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error in Purchase Transaction:', error);
        throw new AppError(error.message, 500);
    } finally {
        if (connection) connection.release();
    }
});

exports.getAll = catchAsync(async (req, res, next) => {
    const [rows] = await db.query(`
        SELECT c.*, p.nombre as proveedor_nombre, b.nombre as bodega_nombre, u.nombre as usuario_nombre
        FROM compras c
        LEFT JOIN proveedores p ON c.proveedor_id = p.id
        LEFT JOIN bodegas b ON c.bodega_id = b.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        ORDER BY c.fecha_registro DESC
    `);
    res.json(rows);
});

exports.getById = catchAsync(async (req, res, next) => {
    const [compra] = await db.query('SELECT * FROM compras WHERE id = ?', [req.params.id]);
    if (compra.length === 0) return next(new AppError('Compra no encontrada', 404));

    const [detalles] = await db.query(`
        SELECT dc.*, p.nombre as producto_nombre, p.sku
        FROM detalle_compras dc
        JOIN productos p ON dc.producto_id = p.id
        WHERE dc.compra_id = ?
    `, [req.params.id]);

    const [pagos] = await db.query(`
        SELECT pc.*, u.nombre as usuario_nombre
        FROM pagos_compras pc
        LEFT JOIN usuarios u ON pc.usuario_id = u.id
        WHERE pc.compra_id = ?
        ORDER BY pc.fecha_pago DESC
    `, [req.params.id]);

    res.json({ ...compra[0], items: detalles, pagos });
});

exports.addPayment = catchAsync(async (req, res, next) => {
    const { compra_id, monto, metodo_pago, nota } = req.body;
    const usuario_id = req.user?.id || null;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Registrar el pago
        await connection.query(
            'INSERT INTO pagos_compras (compra_id, monto, metodo_pago, nota, usuario_id) VALUES (?, ?, ?, ?, ?)',
            [compra_id, monto, metodo_pago, nota, usuario_id]
        );

        // 2. Actualizar el acumulado en la tabla compras
        await connection.query(
            'UPDATE compras SET monto_pagado = monto_pagado + ? WHERE id = ?',
            [monto, compra_id]
        );

        // 3. Verificar si se completó el pago para cambiar el estado
        const [compraRows] = await connection.query('SELECT total, monto_pagado FROM compras WHERE id = ?', [compra_id]);
        const { total, monto_pagado } = compraRows[0];

        let nuevoEstado = 'PARCIAL';
        if (parseFloat(monto_pagado) >= parseFloat(total)) {
            nuevoEstado = 'PAGADO';
        }

        await connection.query('UPDATE compras SET estado_pago = ? WHERE id = ?', [nuevoEstado, compra_id]);

        await connection.commit();
        res.json({ message: 'Abono registrado correctamente', nuevoEstado });
    } catch (error) {
        if (connection) await connection.rollback();
        throw new AppError(error.message, 500);
    } finally {
        if (connection) connection.release();
    }
});

exports.getAllPayments = catchAsync(async (req, res, next) => {
    const [rows] = await db.query(`
        SELECT 
            pc.*, 
            c.numero_factura, 
            p.nombre as proveedor_nombre,
            u.nombre as usuario_nombre
        FROM pagos_compras pc
        JOIN compras c ON pc.compra_id = c.id
        JOIN proveedores p ON c.proveedor_id = p.id
        LEFT JOIN usuarios u ON pc.usuario_id = u.id
        ORDER BY pc.fecha_pago DESC
    `);
    res.json(rows);
});

exports.getDebtsSummary = catchAsync(async (req, res, next) => {
    const [rows] = await db.query(`
        SELECT 
            p.nombre as proveedor_nombre,
            p.id as proveedor_id,
            COUNT(c.id) as facturas_pendientes,
            SUM(c.total) as total_compras,
            SUM(c.monto_pagado) as total_pagado,
            SUM(c.total - c.monto_pagado) as saldo_pendiente
        FROM compras c
        JOIN proveedores p ON c.proveedor_id = p.id
        WHERE c.estado_pago != 'PAGADO'
        GROUP BY p.id
        ORDER BY saldo_pendiente DESC
    `);

    const [totalDebt] = await db.query(`
        SELECT SUM(total - monto_pagado) as deuda_global 
        FROM compras 
        WHERE estado_pago != 'PAGADO'
    `);

    res.json({
        proveedores: rows,
        deuda_global: totalDebt[0].deuda_global || 0
    });
});

