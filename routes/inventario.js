const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { validateInventario, validateMovimientoStock, handleValidationErrors } = require('../middleware/validation');

// POST /api/inventario - Crear nuevo material
router.post('/', validateInventario, handleValidationErrors, inventarioController.create);

// GET /api/inventario - Obtener todos los materiales (con filtros)
// Query params: categoria, nivel_stock, search
router.get('/', inventarioController.getAll);

// GET /api/inventario/alertas - Obtener materiales con stock bajo
router.get('/alertas', inventarioController.getAlertas);

// GET /api/inventario/estadisticas - Obtener estadísticas del inventario
router.get('/estadisticas', inventarioController.getEstadisticas);

// GET /api/inventario/categoria/:categoria - Obtener materiales por categoría
router.get('/categoria/:categoria', inventarioController.getByCategoria);

// GET /api/inventario/:id - Obtener material por ID
router.get('/:id', inventarioController.getById);

// PUT /api/inventario/:id - Actualizar información del material
router.put('/:id', validateInventario, handleValidationErrors, inventarioController.update);

// POST /api/inventario/:id/movimiento - Actualizar stock (entrada/salida/ajuste)
router.post('/:id/movimiento', validateMovimientoStock, handleValidationErrors, inventarioController.updateStock);

// GET /api/inventario/:id/movimientos - Obtener historial de movimientos
router.get('/:id/movimientos', inventarioController.getMovimientos);

// DELETE /api/inventario/:id - Eliminar (desactivar) material
router.delete('/:id', inventarioController.delete);

module.exports = router;