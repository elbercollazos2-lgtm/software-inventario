const express = require('express');
const router = express.Router();
const controller = require('../controllers/comprasController');
const { authorize } = require('../middleware/authMiddleware');

router.get('/', authorize([]), controller.getAll);
router.get('/pagos', authorize([]), controller.getAllPayments);
router.get('/deudas', authorize([]), controller.getDebtsSummary);
router.get('/:id', authorize([]), controller.getById);
router.post('/', authorize([]), controller.create);
router.post('/pagos', authorize([]), controller.addPayment);

module.exports = router;
