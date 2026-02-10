const express = require('express');
const router = express.Router();
const controller = require('../controllers/bodegasController');
const { authorize } = require('../middleware/authMiddleware');

router.get('/', authorize([]), controller.getAll);
router.get('/:id', authorize([]), controller.getById);
router.post('/', authorize([]), controller.create);
router.put('/:id', authorize([]), controller.update);
router.delete('/:id', authorize([]), controller.delete);

module.exports = router;
