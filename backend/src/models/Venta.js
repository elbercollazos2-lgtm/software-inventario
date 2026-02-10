const db = require('../config/db');

class Venta {
    static async create(ventaData) {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const { items, metodo_pago, usuario_id, bodega_id = 1 } = ventaData;

            // 1. Calcular total
            const total = items.reduce((sum, item) => sum + (item.precio_venta * item.quantity), 0);

            // 2. Insertar en tabla ventas
            const [ventaResult] = await connection.query(
                'INSERT INTO ventas (total, metodo_pago, usuario_id) VALUES (?, ?, ?)',
                [total, metodo_pago || 'efectivo', usuario_id || null]
            );

            const ventaId = ventaResult.insertId;

            // 3. Insertar detalles y actualizar stock
            for (const item of items) {
                // VALIDACIÓN DE STOCK: Comprobar disponibilidad antes de procesar
                const [productStock] = await connection.query(
                    'SELECT stock, nombre FROM productos WHERE id = ?',
                    [item.id]
                );

                if (productStock[0].stock < item.quantity) {
                    throw new Error(`Stock insuficiente para "${productStock[0].nombre}". Disponible: ${productStock[0].stock}`);
                }

                const subtotal = item.precio_venta * item.quantity;
                const costo_unitario = item.precio_compra || 0;

                // Insertar detalle
                await connection.query(
                    'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, costo_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                    [ventaId, item.id, item.quantity, item.precio_venta, costo_unitario, subtotal]
                );

                // Obtener saldo anterior en bodega para Kardex
                const [bodegaRows] = await connection.query(
                    'SELECT stock FROM producto_bodega WHERE producto_id = ? AND bodega_id = ?',
                    [item.id, bodega_id]
                );
                const saldoAnteriorBodega = bodegaRows.length > 0 ? bodegaRows[0].stock : 0;

                // Actualizar stock global
                await connection.query(
                    'UPDATE productos SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.id]
                );

                // Actualizar stock en bodega
                if (bodegaRows.length > 0) {
                    await connection.query(
                        'UPDATE producto_bodega SET stock = stock - ? WHERE producto_id = ? AND bodega_id = ?',
                        [item.quantity, item.id, bodega_id]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO producto_bodega (producto_id, bodega_id, stock) VALUES (?, ?, ?)',
                        [item.id, bodega_id, -item.quantity]
                    );
                }

                // Registrar en Kardex
                await connection.query(
                    `INSERT INTO kardex (producto_id, bodega_id, tipo_movimiento, referencia_id, cantidad, saldo_anterior, saldo_nuevo, usuario_id) 
                     VALUES (?, ?, 'VENTA', ?, ?, ?, ?, ?)`,
                    [item.id, bodega_id, ventaId, -item.quantity, saldoAnteriorBodega, parseFloat(saldoAnteriorBodega) - parseFloat(item.quantity), usuario_id]
                );
            }

            await connection.commit();
            return { id: ventaId, total, items };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findAll() {
        const [rows] = await db.query(`
            SELECT v.*, u.nombre as cajero 
            FROM ventas v 
            LEFT JOIN usuarios u ON v.usuario_id = u.id
            ORDER BY v.fecha DESC
        `);
        return rows;
    }

    static async findById(id) {
        const [ventas] = await db.query('SELECT * FROM ventas WHERE id = ?', [id]);
        if (ventas.length === 0) return null;

        const [detalles] = await db.query(`
            SELECT dv.*, p.nombre as producto_nombre 
            FROM detalle_ventas dv
            JOIN productos p ON dv.producto_id = p.id
            WHERE dv.venta_id = ?
        `, [id]);

        return { ...ventas[0], detalles };
    }
}

module.exports = Venta;
