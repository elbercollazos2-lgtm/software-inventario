const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAll = catchAsync(async (req, res, next) => {
    // console.log('GET /api/grupos was hit'); // Cleaned up
    const [rows] = await db.query('SELECT * FROM grupos_inventario');
    res.json(rows);
});

exports.create = catchAsync(async (req, res, next) => {
    const { nombre, codigo_contable, descripcion } = req.body;
    const [result] = await db.query(
        'INSERT INTO grupos_inventario (nombre, codigo_contable, descripcion) VALUES (?, ?, ?)',
        [nombre, codigo_contable, descripcion]
    );
    res.status(201).json({ id: result.insertId, message: 'Grupo creado' });
});

