const express = require('express');
const router = express.Router();
const loteController = require('../controllers/loteController');
const { validateLote, handleValidationErrors } = require('../middleware/validation');

// POST /api/lotes - Crear nuevo lote
router.post('/', validateLote, handleValidationErrors, loteController.create);

// GET /api/lotes - Obtener todos los lotes
router.get('/', loteController.getAll);

// GET /api/lotes/:id - Obtener lote por ID
router.get('/:id', loteController.getById);

// GET /api/lotes/order/:orderId - Obtener lotes por orden
router.get('/order/:orderId', loteController.getByOrderId);

module.exports = router;