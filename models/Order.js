const db = require('../config/database');

class Order {
  static async create(orderData) {
    const { customer_id, invoice } = orderData;
    
    const query = `
      INSERT INTO orders (CustomerID, Invoice) 
      VALUES (?, ?)
    `;
    
    const [result] = await db.execute(query, [customer_id, invoice]);
    return result.insertId;
  }

  static async findById(id) {
    const query = `
      SELECT o.*, c.CustomerName, c.email, c.telefono, c.codigo_pais
      FROM orders o
      JOIN customers c ON o.CustomerID = c.CustomerID
      WHERE o.OrderID = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT o.*, c.CustomerName, c.email, c.telefono, c.codigo_pais
      FROM orders o
      JOIN customers c ON o.CustomerID = c.CustomerID
      ORDER BY o.OrderID DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findByCustomerId(customerId) {
    const query = `
      SELECT o.*, c.CustomerName, c.email, c.telefono, c.codigo_pais
      FROM orders o
      JOIN customers c ON o.CustomerID = c.CustomerID
      WHERE o.CustomerID = ?
      ORDER BY o.OrderID DESC
    `;
    const [rows] = await db.execute(query, [customerId]);
    return rows;
  }

  static async update(id, orderData) {
    const { customer_id, invoice } = orderData;
    
    const query = `
      UPDATE orders 
      SET CustomerID = ?, Invoice = ?
      WHERE OrderID = ?
    `;
    
    const [result] = await db.execute(query, [customer_id, invoice, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const query = 'DELETE FROM orders WHERE OrderID = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows;
  }
}

module.exports = Order;