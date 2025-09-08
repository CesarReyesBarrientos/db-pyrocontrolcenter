const Inventario = require('../models/Inventario');

const inventarioController = {
  // Crear nuevo material en inventario
  async create(req, res) {
    try {
      const { 
        sku, nombre_material, categoria, stock_actual, stock_minimo,
        unidad_medida, precio_unitario, proveedor, ubicacion_almacen, notas 
      } = req.body;

      // Verificar si ya existe un material con el mismo SKU
      const existingSku = await Inventario.findBySku(sku);
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un material con este SKU'
        });
      }

      const materialId = await Inventario.create({
        sku, nombre_material, categoria, stock_actual, stock_minimo,
        unidad_medida, precio_unitario, proveedor, ubicacion_almacen, notas
      });

      const newMaterial = await Inventario.findById(materialId);

      res.status(201).json({
        success: true,
        message: 'Material agregado al inventario exitosamente',
        data: newMaterial
      });

    } catch (error) {
      console.error('Error al crear material:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener todos los materiales con filtros
  async getAll(req, res) {
    try {
      const filters = {
        categoria: req.query.categoria,
        nivel_stock: req.query.nivel_stock,
        search: req.query.search
      };

      const materiales = await Inventario.findAll(filters);
      
      res.json({
        success: true,
        data: materiales,
        count: materiales.length,
        filters_applied: Object.keys(filters).filter(key => filters[key])
      });

    } catch (error) {
      console.error('Error al obtener inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener material por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const material = await Inventario.findById(id);

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material no encontrado'
        });
      }

      res.json({
        success: true,
        data: material
      });

    } catch (error) {
      console.error('Error al obtener material:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener materiales por categoría
  async getByCategoria(req, res) {
    try {
      const { categoria } = req.params;
      const materiales = await Inventario.findByCategoria(categoria);

      res.json({
        success: true,
        data: materiales,
        count: materiales.length,
        categoria: categoria
      });

    } catch (error) {
      console.error('Error al obtener materiales por categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener alertas de stock bajo
  async getAlertas(req, res) {
    try {
      const alertas = await Inventario.getAlertasStock();
      
      res.json({
        success: true,
        data: alertas,
        count: alertas.length,
        alertas_criticas: alertas.filter(a => a.nivel_alerta === 'CRÍTICO').length,
        alertas_bajo_stock: alertas.filter(a => a.nivel_alerta === 'BAJO').length
      });

    } catch (error) {
      console.error('Error al obtener alertas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar stock (entrada, salida, ajuste)
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { tipo_movimiento, cantidad, motivo, usuario } = req.body;

      // Verificar si el material existe
      const material = await Inventario.findById(id);
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material no encontrado'
        });
      }

      const nuevoStock = await Inventario.updateStock(
        id, tipo_movimiento, cantidad, motivo, usuario
      );

      const materialActualizado = await Inventario.findById(id);

      res.json({
        success: true,
        message: `${tipo_movimiento === 'entrada' ? 'Entrada' : 
                  tipo_movimiento === 'salida' ? 'Salida' : 'Ajuste'} registrada exitosamente`,
        data: {
          material: materialActualizado,
          movimiento: {
            tipo: tipo_movimiento,
            cantidad: cantidad,
            stock_anterior: material.stock_actual,
            stock_nuevo: nuevoStock,
            motivo: motivo
          }
        }
      });

    } catch (error) {
      console.error('Error al actualizar stock:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // Obtener movimientos de un material
  async getMovimientos(req, res) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 50;

      // Verificar si el material existe
      const material = await Inventario.findById(id);
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material no encontrado'
        });
      }

      const movimientos = await Inventario.getMovimientos(id, limit);

      res.json({
        success: true,
        data: {
          material: {
            sku: material.sku,
            nombre: material.nombre_material,
            stock_actual: material.stock_actual
          },
          movimientos: movimientos
        },
        count: movimientos.length
      });

    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar información del material (no stock)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        nombre_material, categoria, stock_minimo,
        unidad_medida, precio_unitario, proveedor, ubicacion_almacen, notas 
      } = req.body;

      // Verificar si el material existe
      const existingMaterial = await Inventario.findById(id);
      if (!existingMaterial) {
        return res.status(404).json({
          success: false,
          message: 'Material no encontrado'
        });
      }

      const affectedRows = await Inventario.update(id, {
        nombre_material, categoria, stock_minimo,
        unidad_medida, precio_unitario, proveedor, ubicacion_almacen, notas
      });

      if (affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el material'
        });
      }

      const updatedMaterial = await Inventario.findById(id);

      res.json({
        success: true,
        message: 'Material actualizado exitosamente',
        data: updatedMaterial
      });

    } catch (error) {
      console.error('Error al actualizar material:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar material (desactivar)
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el material existe
      const existingMaterial = await Inventario.findById(id);
      if (!existingMaterial) {
        return res.status(404).json({
          success: false,
          message: 'Material no encontrado'
        });
      }

      const affectedRows = await Inventario.delete(id);

      if (affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo eliminar el material'
        });
      }

      res.json({
        success: true,
        message: 'Material eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar material:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener estadísticas del inventario
  async getEstadisticas(req, res) {
    try {
      const estadisticas = await Inventario.getEstadisticas();
      const resumen = await Inventario.getResumenGeneral();

      res.json({
        success: true,
        data: {
          resumen_general: resumen,
          estadisticas_por_categoria: estadisticas
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = inventarioController;