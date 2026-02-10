const express = require('express');
const router = express.Router();
const controller = require('../controllers/proveedoresController');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/:id/productos', controller.getProducts);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
