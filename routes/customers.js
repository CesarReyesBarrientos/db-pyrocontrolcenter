const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { validateCustomer, handleValidationErrors } = require('../middleware/validation');

// POST /api/customers - Crear nuevo cliente
router.post('/', validateCustomer, handleValidationErrors, customerController.create);

// GET /api/customers - Obtener todos los clientes
router.get('/', customerController.getAll);

// GET /api/customers/:id - Obtener cliente por ID
router.get('/:id', customerController.getById);

// PUT /api/customers/:id - Actualizar cliente
router.put('/:id', validateCustomer, handleValidationErrors, customerController.update);

// DELETE /api/customers/:id - Eliminar cliente
router.delete('/:id', customerController.delete);

module.exports = router;