const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/', configController.getAll);
router.post('/', configController.update);

module.exports = router;
