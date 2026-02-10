const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const kardexController = {
    getAll: catchAsync(async (req, res, next) => {
        const [rows] = await db.query(`
            SELECT k.*, p.nombre as producto_nombre, p.sku, b.nombre as bodega_nombre, u.nombre as usuario_nombre
            FROM kardex k
            JOIN productos p ON k.producto_id = p.id
            JOIN bodegas b ON k.bodega_id = b.id
            LEFT JOIN usuarios u ON k.usuario_id = u.id
            ORDER BY k.fecha DESC
        `);
        res.json(rows);
    })
};

module.exports = kardexController;

