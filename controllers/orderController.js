const Order = require('../models/Order');
const Customer = require('../models/Customer');

const orderController = {
  // Crear nueva orden
  async create(req, res) {
    try {
      const { customer_id, invoice } = req.body;

      // Verificar si el cliente existe
      const customer = await Customer.findById(customer_id);
      if (!customer) {
        return res.status(400).json({
          success: false,
          message: 'El cliente especificado no existe'
        });
      }

      const orderId = await Order.create({
        customer_id,
        invoice
      });

      const newOrder = await Order.findById(orderId);

      res.status(201).json({
        success: true,
        message: 'Orden creada exitosamente',
        data: newOrder
      });

    } catch (error) {
      console.error('Error al crear orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener todas las órdenes
  async getAll(req, res) {
    try {
      const orders = await Order.findAll();
      
      res.json({
        success: true,
        data: orders,
        count: orders.length
      });

    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener orden por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      res.json({
        success: true,
        data: order
      });

    } catch (error) {
      console.error('Error al obtener orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener órdenes por cliente
  async getByCustomerId(req, res) {
    try {
      const { customerId } = req.params;
      const orders = await Order.findByCustomerId(customerId);

      res.json({
        success: true,
        data: orders,
        count: orders.length
      });

    } catch (error) {
      console.error('Error al obtener órdenes del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = orderController;