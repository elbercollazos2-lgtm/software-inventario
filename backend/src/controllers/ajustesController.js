const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.create = catchAsync(async (req, res, next) => {
    const { producto_id, bodega_id, cantidad, motivo, usuario_id } = req.body;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Registrar Ajuste
        await connection.query(
            'INSERT INTO ajustes_stock (producto_id, cantidad, motivo, usuario_id) VALUES (?, ?, ?, ?)',
            [producto_id, cantidad, motivo, usuario_id]
        );

        // 2. Obtener saldo anterior en bodega
        const [bodegaRows] = await connection.query(
            'SELECT stock FROM producto_bodega WHERE producto_id = ? AND bodega_id = ?',
            [producto_id, bodega_id]
        );
        const saldoAnteriorBodega = bodegaRows.length > 0 ? bodegaRows[0].stock : 0;

        // 3. Actualizar Stock Global
        await connection.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [cantidad, producto_id]);

        // 4. Actualizar Stock Bodega
        if (bodegaRows.length > 0) {
            await connection.query(
                'UPDATE producto_bodega SET stock = stock + ? WHERE producto_id = ? AND bodega_id = ?',
                [cantidad, producto_id, bodega_id]
            );
        } else {
            await connection.query(
                'INSERT INTO producto_bodega (producto_id, bodega_id, stock) VALUES (?, ?, ?)',
                [producto_id, bodega_id, cantidad]
            );
        }

        // 5. Registrar en Kardex
        await connection.query(
            `INSERT INTO kardex (producto_id, bodega_id, tipo_movimiento, referencia_id, cantidad, saldo_anterior, saldo_nuevo, usuario_id) 
             VALUES (?, ?, ?, (SELECT LAST_INSERT_ID()), ?, ?, ?, ?)`,
            [producto_id, bodega_id, cantidad > 0 ? 'AJUSTE_POS' : 'AJUSTE_NEG', cantidad, saldoAnteriorBodega, parseFloat(saldoAnteriorBodega) + parseFloat(cantidad), usuario_id]
        );

        await connection.commit();
        res.status(201).json({ message: 'Ajuste realizado con éxito' });
    } catch (error) {
        if (connection) await connection.rollback();
        throw new AppError(error.message, 500);
    } finally {
        if (connection) connection.release();
    }
});

exports.getAll = catchAsync(async (req, res, next) => {
    const [rows] = await db.query(`
        SELECT a.*, p.nombre as producto_nombre, u.nombre as usuario_nombre
        FROM ajustes_stock a
        JOIN productos p ON a.producto_id = p.id
        JOIN usuarios u ON a.usuario_id = u.id
        ORDER BY a.fecha_ajuste DESC
    `);
    res.json(rows);
});

