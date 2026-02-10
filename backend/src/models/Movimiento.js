const db = require('../config/db');

class Movimiento {
    static async create(data, connection = db) {
        const { producto_id, tipo, cantidad, motivo, usuario_id } = data;
        const [result] = await connection.query(
            `INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, motivo, usuario_id)
             VALUES (?, ?, ?, ?, ?)`,
            [producto_id, tipo, cantidad, motivo, usuario_id]
        );
        return result.insertId;
    }

    static async findAll() {
        const [rows] = await db.query(`
            SELECT m.*, p.nombre as producto_nombre, u.nombre as usuario_nombre
            FROM movimientos_inventario m
            JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY m.fecha DESC
        `);
        return rows;
    }
}

module.exports = Movimiento;
