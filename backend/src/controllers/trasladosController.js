const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.create = catchAsync(async (req, res, next) => {
    const { bodega_origen_id, bodega_destino_id, observaciones, items, usuario_id } = req.body;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Insertar Traslado
        const [trasladoResult] = await connection.query(
            'INSERT INTO traslados (bodega_origen_id, bodega_destino_id, observaciones, usuario_id) VALUES (?, ?, ?, ?)',
            [bodega_origen_id, bodega_destino_id, observaciones, usuario_id]
        );
        const trasladoId = trasladoResult.insertId;

        for (const item of items) {
            const { producto_id, cantidad } = item;

            // 2. Insertar Detalle Traslado
            await connection.query(
                'INSERT INTO detalle_traslados (traslado_id, producto_id, cantidad) VALUES (?, ?, ?)',
                [trasladoId, producto_id, cantidad]
            );

            // 3. Obtener saldos anteriores
            const [rowsOrigen] = await connection.query(
                'SELECT stock FROM producto_bodega WHERE producto_id = ? AND bodega_id = ?',
                [producto_id, bodega_origen_id]
            );
            const saldoAnteriorOri = rowsOrigen.length > 0 ? rowsOrigen[0].stock : 0;

            if (saldoAnteriorOri < cantidad) {
                throw new AppError(`Stock insuficiente en bodega origen para el producto ID ${producto_id}`, 400);
            }

            const [rowsDestino] = await connection.query(
                'SELECT stock FROM producto_bodega WHERE producto_id = ? AND bodega_id = ?',
                [producto_id, bodega_destino_id]
            );
            const saldoAnteriorDest = rowsDestino.length > 0 ? rowsDestino[0].stock : 0;

            // 4. Actualizar Bodegas
            await connection.query(
                'UPDATE producto_bodega SET stock = stock - ? WHERE producto_id = ? AND bodega_id = ?',
                [cantidad, producto_id, bodega_origen_id]
            );

            if (rowsDestino.length > 0) {
                await connection.query(
                    'UPDATE producto_bodega SET stock = stock + ? WHERE producto_id = ? AND bodega_id = ?',
                    [cantidad, producto_id, bodega_destino_id]
                );
            } else {
                await connection.query(
                    'INSERT INTO producto_bodega (producto_id, bodega_id, stock) VALUES (?, ?, ?)',
                    [producto_id, bodega_destino_id, cantidad]
                );
            }

            // 5. Registrar Kardex (Salida de Origen)
            await connection.query(
                `INSERT INTO kardex (producto_id, bodega_id, tipo_movimiento, referencia_id, cantidad, saldo_anterior, saldo_nuevo, usuario_id) 
                 VALUES (?, ?, 'TRASLADO_OUT', ?, ?, ?, ?, ?)`,
                [producto_id, bodega_origen_id, trasladoId, -cantidad, saldoAnteriorOri, parseFloat(saldoAnteriorOri) - parseFloat(cantidad), usuario_id]
            );

            // 6. Registrar Kardex (Entrada a Destino)
            await connection.query(
                `INSERT INTO kardex (producto_id, bodega_id, tipo_movimiento, referencia_id, cantidad, saldo_anterior, saldo_nuevo, usuario_id) 
                 VALUES (?, ?, 'TRASLADO_IN', ?, ?, ?, ?, ?)`,
                [producto_id, bodega_destino_id, trasladoId, cantidad, saldoAnteriorDest, parseFloat(saldoAnteriorDest) + parseFloat(cantidad), usuario_id]
            );
        }

        await connection.commit();
        res.status(201).json({ id: trasladoId, message: 'Traslado completado con éxito' });
    } catch (error) {
        if (connection) await connection.rollback();
        // If it's already an operational error (insufficient stock), catchAsync handles it
        // If it's DB error, wrapper handles it.
        throw error;
    } finally {
        if (connection) connection.release();
    }
});

exports.getAll = catchAsync(async (req, res, next) => {
    const [rows] = await db.query(`
        SELECT t.*, b1.nombre as bodega_origen_nombre, b2.nombre as bodega_destino_nombre, u.nombre as usuario_nombre
        FROM traslados t
        JOIN bodegas b1 ON t.bodega_origen_id = b1.id
        JOIN bodegas b2 ON t.bodega_destino_id = b2.id
        JOIN usuarios u ON t.usuario_id = u.id
        ORDER BY t.fecha_traslado DESC
    `);
    res.json(rows);
});

