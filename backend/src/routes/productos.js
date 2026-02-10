const express = require('express');
const router = express.Router();
const controller = require('../controllers/productosController');
const { authorize } = require('../middleware/authMiddleware');

// Rutas especiales (deben ir antes de las rutas con parámetros)
router.get('/low-stock', controller.getLowStock);
router.get('/favoritos', controller.getFavorites);
router.get('/barcode/:codigo', controller.getByBarcode);

// CRUD básico
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize(['admin', 'superuser']), controller.create);
router.put('/:id', authorize(['admin', 'superuser']), controller.update);
router.delete('/:id', authorize(['admin', 'superuser']), controller.delete);

// Actualización de stock
router.patch('/:id/stock', controller.updateStock);

module.exports = router;
