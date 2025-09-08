const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder, handleValidationErrors } = require('../middleware/validation');

// POST /api/orders - Crear nueva orden
router.post('/', validateOrder, handleValidationErrors, orderController.create);

// GET /api/orders - Obtener todas las órdenes
router.get('/', orderController.getAll);

// GET /api/orders/:id - Obtener orden por ID
router.get('/:id', orderController.getById);

// GET /api/orders/customer/:customerId - Obtener órdenes por cliente
router.get('/customer/:customerId', orderController.getByCustomerId);

module.exports = router;