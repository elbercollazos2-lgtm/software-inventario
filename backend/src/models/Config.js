const db = require('../config/db');

class Config {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM configuracion');
        return rows.reduce((acc, row) => {
            acc[row.clave] = row.valor;
            return acc;
        }, {});
    }

    static async update(configs) {
        for (const [clave, valor] of Object.entries(configs)) {
            await db.query(
                'INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
                [clave, valor, valor]
            );
        }
        return this.getAll();
    }
}

module.exports = Config;
