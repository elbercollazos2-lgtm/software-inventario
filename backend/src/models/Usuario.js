const db = require('../config/db');

class Usuario {
    static async findAll() {
        const [rows] = await db.query('SELECT id, nombre, username, rol, fecha_creacion FROM usuarios ORDER BY nombre');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT id, nombre, username, rol, fecha_creacion FROM usuarios WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        return rows[0];
    }

    static async create(data) {
        const { nombre, username, password_hash, rol } = data;
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, username, password_hash, rol) VALUES (?, ?, ?, ?)',
            [nombre, username, password_hash, rol || 'empleado']
        );
        return { id: result.insertId, nombre, username, rol: rol || 'empleado' };
    }

    static async update(id, data) {
        const { nombre, username, rol, password_hash } = data;
        if (password_hash) {
            await db.query(
                'UPDATE usuarios SET nombre = ?, username = ?, rol = ?, password_hash = ? WHERE id = ?',
                [nombre, username, rol, password_hash, id]
            );
        } else {
            await db.query(
                'UPDATE usuarios SET nombre = ?, username = ?, rol = ? WHERE id = ?',
                [nombre, username, rol, id]
            );
        }
        return this.findById(id);
    }

    static async updatePassword(id, password_hash) {
        await db.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [password_hash, id]);
        return true;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Usuario;
