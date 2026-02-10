const express = require('express');
const router = express.Router();
const controller = require('../controllers/ajustesController');
const { authorize } = require('../middleware/authMiddleware');

router.get('/', authorize(['admin', 'superuser']), controller.getAll);
router.post('/', authorize(['admin', 'superuser']), controller.create);

module.exports = router;
