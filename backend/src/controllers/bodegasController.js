const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAll = catchAsync(async (req, res, next) => {
    const [rows] = await db.query('SELECT * FROM bodegas WHERE activo = 1');
    res.json(rows);
});

exports.getById = catchAsync(async (req, res, next) => {
    const [rows] = await db.query('SELECT * FROM bodegas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return next(new AppError('Bodega no encontrada', 404));
    res.json(rows[0]);
});

exports.create = catchAsync(async (req, res, next) => {
    const { nombre, ubicacion, es_virtual } = req.body;
    const [result] = await db.query(
        'INSERT INTO bodegas (nombre, ubicacion, es_virtual) VALUES (?, ?, ?)',
        [nombre, ubicacion, es_virtual ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Bodega creada' });
});

exports.update = catchAsync(async (req, res, next) => {
    const { nombre, ubicacion, es_virtual, activo } = req.body;
    await db.query(
        'UPDATE bodegas SET nombre = ?, ubicacion = ?, es_virtual = ?, activo = ? WHERE id = ?',
        [nombre, ubicacion, es_virtual ? 1 : 0, activo ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Bodega actualizada' });
});

exports.delete = catchAsync(async (req, res, next) => {
    await db.query('UPDATE bodegas SET activo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Bodega desactivada' });
});

