const db = require('../config/database');

class Lote {
  static async create(loteData) {
    const { 
      order_id, quantity, model, tek, shruds, 
      wrap, color, tail, lot_number, details 
    } = loteData;
    
    const query = `
      INSERT INTO lote (
        OrderID, Quantity, Model, TEK, Shruds, 
        Wrap, Color, Tail, LotNumber, Details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      order_id, quantity, model, tek, shruds,
      wrap, color, tail, lot_number, details
    ]);
    
    return result.insertId;
  }

  static async findById(id) {
    const query = `
      SELECT l.*, o.Invoice, c.CustomerName
      FROM lote l
      JOIN orders o ON l.OrderID = o.OrderID
      JOIN customers c ON o.CustomerID = c.CustomerID
      WHERE l.LotID = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT l.*, o.Invoice, c.CustomerName
      FROM lote l
      JOIN orders o ON l.OrderID = o.OrderID
      JOIN customers c ON o.CustomerID = c.CustomerID
      ORDER BY l.LotID DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findByOrderId(orderId) {
    const query = `
      SELECT l.*, o.Invoice, c.CustomerName
      FROM lote l
      JOIN orders o ON l.OrderID = o.OrderID
      JOIN customers c ON o.CustomerID = c.CustomerID
      WHERE l.OrderID = ?
      ORDER BY l.LotID DESC
    `;
    const [rows] = await db.execute(query, [orderId]);
    return rows;
  }

  static async update(id, loteData) {
    const { 
      order_id, quantity, model, tek, shruds, 
      wrap, color, tail, lot_number, details 
    } = loteData;
    
    const query = `
      UPDATE lote 
      SET OrderID = ?, Quantity = ?, Model = ?, TEK = ?, Shruds = ?, 
          Wrap = ?, Color = ?, Tail = ?, LotNumber = ?, Details = ?
      WHERE LotID = ?
    `;
    
    const [result] = await db.execute(query, [
      order_id, quantity, model, tek, shruds,
      wrap, color, tail, lot_number, details, id
    ]);
    
    return result.affectedRows;
  }

  static async delete(id) {
    const query = 'DELETE FROM lote WHERE LotID = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows;
  }
}

module.exports = Lote;