const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventarioController');

router.post('/movement', controller.registerMovement);
router.post('/batch-upload', controller.batchUpload);
router.post('/validate-batch', controller.validateBatch);
router.get('/history', controller.getHistory);

module.exports = router;
