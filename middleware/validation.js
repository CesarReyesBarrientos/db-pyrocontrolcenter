const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para clientes
const validateCustomer = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('El email debe tener un formato válido'),
  
  body('telefono')
    .optional()
    .isMobilePhone()
    .withMessage('El teléfono debe tener un formato válido'),
  
  body('codigo_pais')
    .optional()
    .isLength({ min: 1, max: 5 })
    .withMessage('El código de país debe tener entre 1 y 5 caracteres'),

  // Validación personalizada para asegurar que al menos email o teléfono estén presentes
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.telefono) {
      throw new Error('Debe proporcionar al menos un email o teléfono');
    }
    if (req.body.telefono && !req.body.codigo_pais) {
      throw new Error('Si proporciona teléfono, el código de país es obligatorio');
    }
    return true;
  })
];

// Validaciones para órdenes
const validateOrder = [
  body('customer_id')
    .isInt({ min: 1 })
    .withMessage('El ID del cliente debe ser un número entero positivo'),
  
  body('invoice')
    .optional()
    .isLength({ max: 5 })
    .withMessage('La factura debe tener máximo 5 caracteres')
];

// Validaciones para lotes
const validateLote = [
  body('order_id')
    .isInt({ min: 1 })
    .withMessage('El ID de la orden debe ser un número entero positivo'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo'),
  
  body('model')
    .notEmpty()
    .withMessage('El modelo es obligatorio')
    .isLength({ max: 255 })
    .withMessage('El modelo debe tener máximo 255 caracteres'),
  
  body('tek')
    .isInt({ min: 0 })
    .withMessage('TEK debe ser un número entero no negativo'),
  
  body('shruds')
    .notEmpty()
    .withMessage('Shruds es obligatorio')
    .isLength({ max: 255 })
    .withMessage('Shruds debe tener máximo 255 caracteres'),
  
  body('wrap')
    .notEmpty()
    .withMessage('Wrap es obligatorio')
    .isLength({ max: 255 })
    .withMessage('Wrap debe tener máximo 255 caracteres'),
  
  body('color')
    .notEmpty()
    .withMessage('Color es obligatorio')
    .isLength({ max: 255 })
    .withMessage('Color debe tener máximo 255 caracteres'),
  
  body('tail')
    .notEmpty()
    .withMessage('Tail es obligatorio')
    .isLength({ max: 255 })
    .withMessage('Tail debe tener máximo 255 caracteres'),
  
  body('lot_number')
    .isInt({ min: 1 })
    .withMessage('El número de lote debe ser un número entero positivo'),
  
  body('details')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Los detalles deben tener máximo 255 caracteres')
];

const validateInventario = [
  body('sku')
    .notEmpty()
    .withMessage('El SKU es obligatorio')
    .isLength({ min: 3, max: 50 })
    .withMessage('El SKU debe tener entre 3 y 50 caracteres')
    .matches(/^[A-Z0-9\-]+$/)
    .withMessage('El SKU solo puede contener letras mayúsculas, números y guiones'),
  
  body('nombre_material')
    .notEmpty()
    .withMessage('El nombre del material es obligatorio')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  
  body('categoria')
    .isIn(['Wire', 'Cable', 'Shruds', 'Head', 'Tail', 'Box', 'Polvora', 'Quimicos', 'Papel', 'Carton', 'Otros'])
    .withMessage('Categoría no válida'),
  
  body('stock_actual')
    .isFloat({ min: 0 })
    .withMessage('El stock actual debe ser un número no negativo'),
  
  body('stock_minimo')
    .isFloat({ min: 0 })
    .withMessage('El stock mínimo debe ser un número no negativo'),
  
  body('unidad_medida')
    .isIn(['PZ', 'FT', 'LB', 'KG', 'M', 'CM', 'ROLLO', 'CAJA', 'PAQUETE'])
    .withMessage('Unidad de medida no válida'),
  
  body('precio_unitario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio unitario debe ser un número no negativo'),
  
  body('proveedor')
    .optional()
    .isLength({ max: 255 })
    .withMessage('El proveedor debe tener máximo 255 caracteres'),
  
  body('ubicacion_almacen')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ubicación debe tener máximo 100 caracteres')
];

const validateMovimientoStock = [
  body('tipo_movimiento')
    .isIn(['entrada', 'salida', 'ajuste'])
    .withMessage('Tipo de movimiento no válido'),
  
  body('cantidad')
    .isFloat({ min: 0.001 })
    .withMessage('La cantidad debe ser un número positivo mayor a 0'),
  
  body('motivo')
    .notEmpty()
    .withMessage('El motivo es obligatorio')
    .isLength({ min: 3, max: 255 })
    .withMessage('El motivo debe tener entre 3 y 255 caracteres'),
  
  body('usuario')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El usuario debe tener máximo 100 caracteres')
];

// CORRECCIÓN: Agregar las validaciones faltantes al export
module.exports = {
  handleValidationErrors,
  validateCustomer,
  validateOrder,
  validateLote,
  validateInventario,        // ← Esta línea estaba faltando
  validateMovimientoStock    // ← Esta línea estaba faltando
};