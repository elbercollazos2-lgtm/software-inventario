const express = require('express');
const router = express.Router();
const controller = require('../controllers/kardexController');
const { authorize } = require('../middleware/authMiddleware');

router.get('/', authorize([]), controller.getAll);

module.exports = router;
