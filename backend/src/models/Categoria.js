const db = require('../config/db');

class Categoria {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { nombre, descripcion, margen_utilidad } = data;
        const [result] = await db.query(
            'INSERT INTO categorias (nombre, descripcion, margen_utilidad) VALUES (?, ?, ?)',
            [nombre, descripcion, margen_utilidad || 20.00]
        );
        return { id: result.insertId, ...data };
    }

    static async update(id, data) {
        const { nombre, descripcion, margen_utilidad } = data;
        await db.query(
            'UPDATE categorias SET nombre = ?, descripcion = ?, margen_utilidad = ? WHERE id = ?',
            [nombre, descripcion, margen_utilidad, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM categorias WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getProductCount(id) {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM productos WHERE categoria_id = ?', [id]);
        return rows[0].count;
    }
}

module.exports = Categoria;
