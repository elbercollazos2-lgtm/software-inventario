const Producto = require('../models/Producto');
const pricingService = require('../services/pricingService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Helper para obtener el ID de usuario desde el request.
 */
const getUserId = (req) => {
    return req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : 1;
};

const productosController = {
    // GET /api/productos
    getAll: catchAsync(async (req, res, next) => {
        const { search } = req.query;
        const productos = await Producto.findAll(search);
        res.json(productos);
    }),

    // GET /api/productos/favoritos
    getFavorites: catchAsync(async (req, res, next) => {
        const productos = await Producto.findFavorites();
        res.json(productos);
    }),

    // GET /api/productos/:id
    getById: catchAsync(async (req, res, next) => {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return next(new AppError('Producto no encontrado', 404));
        }
        res.json(producto);
    }),

    // GET /api/productos/barcode/:codigo
    getByBarcode: catchAsync(async (req, res, next) => {
        const producto = await Producto.findByBarcode(req.params.codigo);
        if (!producto) {
            return next(new AppError('Producto no encontrado', 404));
        }
        res.json(producto);
    }),

    // POST /api/productos
    create: catchAsync(async (req, res, next) => {
        const { precio_compra, precio_venta } = req.body;
        const userId = getUserId(req);

        if (!pricingService.validateProfitability(precio_compra, precio_venta)) {
            return next(new AppError(`Violación de Rentabilidad: El precio de venta ($${precio_venta}) no puede ser menor al costo de compra ($${precio_compra}).`, 400));
        }

        const nuevoProducto = await Producto.create(req.body, userId);
        res.status(201).json(nuevoProducto);
    }),

    // PUT /api/productos/:id
    update: catchAsync(async (req, res, next) => {
        const { precio_compra, precio_venta } = req.body;
        const userId = getUserId(req);

        if (precio_compra !== undefined && precio_venta !== undefined) {
            if (!pricingService.validateProfitability(precio_compra, precio_venta)) {
                return next(new AppError(`Violación de Rentabilidad: El precio de venta ($${precio_venta}) no puede ser menor al costo de compra ($${precio_compra}).`, 400));
            }
        }

        const producto = await Producto.update(req.params.id, req.body, userId);
        if (!producto) {
            return next(new AppError('Producto no encontrado', 404));
        }
        res.json(producto);
    }),

    // DELETE /api/productos/:id
    delete: catchAsync(async (req, res, next) => {
        const userId = getUserId(req);
        const result = await Producto.delete(req.params.id, userId);
        if (!result) {
            return next(new AppError('Producto no encontrado', 404));
        }
        res.json({ message: 'Producto eliminado correctamente' });
    }),

    // PATCH /api/productos/:id/stock
    updateStock: catchAsync(async (req, res, next) => {
        const { cantidad, motivo } = req.body;
        const userId = getUserId(req);

        if (cantidad === undefined) {
            return next(new AppError('Se requiere la cantidad', 400));
        }

        if (motivo) {
            await Producto.adjustStock(req.params.id, cantidad, motivo, userId);
            const updatedProduct = await Producto.findById(req.params.id);
            return res.json(updatedProduct);
        }

        // Logic for simple stock update if no motivo (though adjustStock is preferred)
        // Check if logic matches original intent, assuming Producto.updateStock exists
        const producto = await Producto.updateStock(req.params.id, cantidad);
        res.json(producto);
    }),

    // GET /api/productos/low-stock
    getLowStock: catchAsync(async (req, res, next) => {
        const productos = await Producto.getLowStock();
        res.json(productos);
    })
};

module.exports = productosController;

