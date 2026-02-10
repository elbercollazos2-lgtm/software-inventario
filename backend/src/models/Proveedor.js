const db = require('../config/db');

class Proveedor {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM proveedores ORDER BY nombre');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM proveedores WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { nombre, nit, contacto, telefono, email, direccion, notas } = data;
        const [result] = await db.query(
            'INSERT INTO proveedores (nombre, nit, contacto, telefono, email, direccion, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, nit, contacto, telefono, email, direccion, notas || null]
        );
        return { id: result.insertId, ...data };
    }

    static async update(id, data) {
        const { nombre, nit, contacto, telefono, email, direccion, notas } = data;
        await db.query(
            'UPDATE proveedores SET nombre = ?, nit = ?, contacto = ?, telefono = ?, email = ?, direccion = ?, notas = ? WHERE id = ?',
            [nombre, nit, contacto, telefono, email, direccion, notas, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM proveedores WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getProducts(id) {
        const [rows] = await db.query('SELECT * FROM productos WHERE proveedor_id = ?', [id]);
        return rows;
    }
}

module.exports = Proveedor;
