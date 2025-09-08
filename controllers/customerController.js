const Customer = require('../models/Customer');

const customerController = {
  // Crear nuevo cliente
  async create(req, res) {
    try {
      const { nombre, email, telefono, codigo_pais } = req.body;

      // Verificar si ya existe un cliente con el mismo email o teléfono
      if (email) {
        const existingByEmail = await Customer.findByEmail(email);
        if (existingByEmail) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un cliente con este email'
          });
        }
      }

      if (telefono && codigo_pais) {
        const existingByPhone = await Customer.findByPhone(telefono, codigo_pais);
        if (existingByPhone) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un cliente con este teléfono'
          });
        }
      }

      const customerId = await Customer.create({
        nombre,
        email,
        telefono,
        codigo_pais
      });

      const newCustomer = await Customer.findById(customerId);

      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: newCustomer
      });

    } catch (error) {
      console.error('Error al crear cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener todos los clientes
  async getAll(req, res) {
    try {
      const customers = await Customer.findAll();
      
      res.json({
        success: true,
        data: customers,
        count: customers.length
      });

    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener cliente por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: customer
      });

    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar cliente
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, telefono, codigo_pais } = req.body;

      // Verificar si el cliente existe
      const existingCustomer = await Customer.findById(id);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      const affectedRows = await Customer.update(id, {
        nombre,
        email,
        telefono,
        codigo_pais
      });

      if (affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el cliente'
        });
      }

      const updatedCustomer = await Customer.findById(id);

      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: updatedCustomer
      });

    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar cliente
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el cliente existe
      const existingCustomer = await Customer.findById(id);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      const affectedRows = await Customer.delete(id);

      if (affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo eliminar el cliente'
        });
      }

      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = customerController;