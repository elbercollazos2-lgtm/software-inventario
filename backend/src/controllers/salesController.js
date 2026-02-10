const Venta = require('../models/Venta');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const salesController = {
    // POST /api/sales
    create: catchAsync(async (req, res, next) => {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new AppError('El carrito no puede estar vacío', 400));
        }

        const nuevaVenta = await Venta.create(req.body);
        res.status(201).json(nuevaVenta);
    }),

    // GET /api/sales
    getAll: catchAsync(async (req, res, next) => {
        const ventas = await Venta.findAll();
        res.json(ventas);
    }),

    // GET /api/sales/:id
    getById: catchAsync(async (req, res, next) => {
        const venta = await Venta.findById(req.params.id);
        if (!venta) {
            return next(new AppError('Venta no encontrada', 404));
        }
        res.json(venta);
    })
};

module.exports = salesController;

