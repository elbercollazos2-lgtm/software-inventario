const Proveedor = require('../models/Proveedor');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const proveedoresController = {
    getAll: catchAsync(async (req, res, next) => {
        const proveedores = await Proveedor.findAll();
        res.json(proveedores);
    }),

    getById: catchAsync(async (req, res, next) => {
        const proveedor = await Proveedor.findById(req.params.id);
        if (!proveedor) {
            return next(new AppError('Proveedor no encontrado', 404));
        }
        res.json(proveedor);
    }),

    create: catchAsync(async (req, res, next) => {
        const nuevoProveedor = await Proveedor.create(req.body);
        res.status(201).json(nuevoProveedor);
    }),

    update: catchAsync(async (req, res, next) => {
        const proveedor = await Proveedor.update(req.params.id, req.body);
        if (!proveedor) {
            return next(new AppError('Proveedor no encontrado', 404));
        }
        res.json(proveedor);
    }),

    delete: catchAsync(async (req, res, next) => {
        const result = await Proveedor.delete(req.params.id);
        if (!result) {
            return next(new AppError('Proveedor no encontrado', 404));
        }
        res.json({ message: 'Proveedor eliminado correctamente' });
    }),

    getProducts: catchAsync(async (req, res, next) => {
        const productos = await Proveedor.getProducts(req.params.id);
        res.json(productos);
    })
};

module.exports = proveedoresController;

