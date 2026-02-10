const Categoria = require('../models/Categoria');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const categoriasController = {
    getAll: catchAsync(async (req, res, next) => {
        const categorias = await Categoria.findAll();
        res.json(categorias);
    }),

    getById: catchAsync(async (req, res, next) => {
        const categoria = await Categoria.findById(req.params.id);
        if (!categoria) {
            return next(new AppError('Categoría no encontrada', 404));
        }
        res.json(categoria);
    }),

    create: catchAsync(async (req, res, next) => {
        const nuevaCategoria = await Categoria.create(req.body);
        res.status(201).json(nuevaCategoria);
    }),

    update: catchAsync(async (req, res, next) => {
        const categoria = await Categoria.update(req.params.id, req.body);
        if (!categoria) {
            return next(new AppError('Categoría no encontrada', 404));
        }
        res.json(categoria);
    }),

    delete: catchAsync(async (req, res, next) => {
        const result = await Categoria.delete(req.params.id);
        if (!result) {
            return next(new AppError('Categoría no encontrada', 404));
        }
        res.json({ message: 'Categoría eliminada correctamente' });
    })
};

module.exports = categoriasController;

