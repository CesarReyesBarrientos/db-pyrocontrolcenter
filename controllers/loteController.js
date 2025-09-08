const Lote = require('../models/Lote');
const Order = require('../models/Order');

const loteController = {
  // Crear nuevo lote
  async create(req, res) {
    try {
      const { 
        order_id, quantity, model, tek, shruds, 
        wrap, color, tail, lot_number, details 
      } = req.body;

      // Verificar si la orden existe
      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(400).json({
          success: false,
          message: 'La orden especificada no existe'
        });
      }

      const loteId = await Lote.create({
        order_id,
        quantity,
        model,
        tek,
        shruds,
        wrap,
        color,
        tail,
        lot_number,
        details
      });

      const newLote = await Lote.findById(loteId);

      res.status(201).json({
        success: true,
        message: 'Lote creado exitosamente',
        data: newLote
      });

    } catch (error) {
      console.error('Error al crear lote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener todos los lotes
  async getAll(req, res) {
    try {
      const lotes = await Lote.findAll();
      
      res.json({
        success: true,
        data: lotes,
        count: lotes.length
      });

    } catch (error) {
      console.error('Error al obtener lotes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener lote por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const lote = await Lote.findById(id);

      if (!lote) {
        return res.status(404).json({
          success: false,
          message: 'Lote no encontrado'
        });
      }

      res.json({
        success: true,
        data: lote
      });

    } catch (error) {
      console.error('Error al obtener lote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener lotes por orden
  async getByOrderId(req, res) {
    try {
      const { orderId } = req.params;
      const lotes = await Lote.findByOrderId(orderId);

      res.json({
        success: true,
        data: lotes,
        count: lotes.length
      });

    } catch (error) {
      console.error('Error al obtener lotes de la orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = loteController;