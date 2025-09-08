const db = require('../config/database');

class Customer {
  static async create(customerData) {
    const { nombre, email, telefono, codigo_pais } = customerData;
    
    const query = `
      INSERT INTO customers (CustomerName, email, telefono, codigo_pais) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [nombre, email, telefono, codigo_pais]);
    return result.insertId;
  }

  static async findById(id) {
    const query = 'SELECT * FROM customers WHERE CustomerID = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM customers ORDER BY CustomerID DESC';
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM customers WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  static async findByPhone(telefono, codigo_pais) {
    const query = 'SELECT * FROM customers WHERE telefono = ? AND codigo_pais = ?';
    const [rows] = await db.execute(query, [telefono, codigo_pais]);
    return rows[0];
  }

  static async update(id, customerData) {
    const { nombre, email, telefono, codigo_pais } = customerData;
    
    const query = `
      UPDATE customers 
      SET CustomerName = ?, email = ?, telefono = ?, codigo_pais = ?
      WHERE CustomerID = ?
    `;
    
    const [result] = await db.execute(query, [nombre, email, telefono, codigo_pais, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const query = 'DELETE FROM customers WHERE CustomerID = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows;
  }
}

module.exports = Customer;