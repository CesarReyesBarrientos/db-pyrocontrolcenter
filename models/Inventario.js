const db = require('../config/database');

class Inventario {
  static async create(inventarioData) {
    const { 
      sku, nombre_material, categoria, stock_actual, stock_minimo, 
      unidad_medida, precio_unitario, proveedor, ubicacion_almacen, notas 
    } = inventarioData;
    
    const query = `
      INSERT INTO inventario (
        sku, nombre_material, categoria, stock_actual, stock_minimo,
        unidad_medida, precio_unitario, proveedor, ubicacion_almacen, 
        fecha_ultima_entrada, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
    
    const [result] = await db.execute(query, [
      sku, nombre_material, categoria, stock_actual, stock_minimo,
      unidad_medida, precio_unitario, proveedor, ubicacion_almacen, notas
    ]);
    
    return result.insertId;
  }

  static async findById(id) {
    const query = 'SELECT * FROM inventario WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async findBySku(sku) {
    const query = 'SELECT * FROM inventario WHERE sku = ?';
    const [rows] = await db.execute(query, [sku]);
    return rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT i.*, 
        CASE 
          WHEN i.stock_actual <= i.stock_minimo THEN 'CRÍTICO'
          WHEN i.stock_actual <= (i.stock_minimo * 1.5) THEN 'BAJO'
          ELSE 'NORMAL'
        END as nivel_stock
      FROM inventario i 
      WHERE i.activo = 1
    `;
    
    const params = [];
    
    // Filtro por categoría
    if (filters.categoria) {
      query += ' AND i.categoria = ?';
      params.push(filters.categoria);
    }
    
    // Filtro por nivel de stock
    if (filters.nivel_stock) {
      switch (filters.nivel_stock) {
        case 'CRITICO':
          query += ' AND i.stock_actual <= i.stock_minimo';
          break;
        case 'BAJO':
          query += ' AND i.stock_actual > i.stock_minimo AND i.stock_actual <= (i.stock_minimo * 1.5)';
          break;
        case 'NORMAL':
          query += ' AND i.stock_actual > (i.stock_minimo * 1.5)';
          break;
      }
    }
    
    // Filtro por búsqueda de texto
    if (filters.search) {
      query += ' AND (i.sku LIKE ? OR i.nombre_material LIKE ? OR i.proveedor LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY i.categoria, i.nombre_material';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findByCategoria(categoria) {
    const query = `
      SELECT *, 
        CASE 
          WHEN stock_actual <= stock_minimo THEN 'CRÍTICO'
          WHEN stock_actual <= (stock_minimo * 1.5) THEN 'BAJO'
          ELSE 'NORMAL'
        END as nivel_stock
      FROM inventario 
      WHERE categoria = ? AND activo = 1
      ORDER BY nombre_material
    `;
    const [rows] = await db.execute(query, [categoria]);
    return rows;
  }

  static async getAlertasStock() {
    const query = `
      SELECT *, 
        CASE 
          WHEN stock_actual <= stock_minimo THEN 'CRÍTICO'
          WHEN stock_actual <= (stock_minimo * 1.5) THEN 'BAJO'
          ELSE 'NORMAL'
        END as nivel_alerta,
        (stock_minimo - stock_actual) as cantidad_faltante
      FROM inventario 
      WHERE activo = 1 
        AND stock_actual <= (stock_minimo * 1.5)
      ORDER BY 
        CASE 
          WHEN stock_actual <= stock_minimo THEN 1
          WHEN stock_actual <= (stock_minimo * 1.5) THEN 2
          ELSE 3
        END,
        categoria
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async updateStock(id, tipoMovimiento, cantidad, motivo, usuario = null) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Obtener stock actual
      const [currentStock] = await connection.execute(
        'SELECT sku, stock_actual FROM inventario WHERE id = ?', 
        [id]
      );
      
      if (currentStock.length === 0) {
        throw new Error('Material no encontrado');
      }
      
      const { sku, stock_actual } = currentStock[0];
      let nuevoStock;
      
      // Calcular nuevo stock según tipo de movimiento
      switch (tipoMovimiento) {
        case 'entrada':
          nuevoStock = parseFloat(stock_actual) + parseFloat(cantidad);
          break;
        case 'salida':
          nuevoStock = parseFloat(stock_actual) - parseFloat(cantidad);
          if (nuevoStock < 0) {
            throw new Error('Stock insuficiente para realizar la salida');
          }
          break;
        case 'ajuste':
          nuevoStock = parseFloat(cantidad);
          break;
        default:
          throw new Error('Tipo de movimiento no válido');
      }
      
      // Actualizar stock en inventario
      await connection.execute(
        `UPDATE inventario 
         SET stock_actual = ?, 
             fecha_ultima_${tipoMovimiento === 'entrada' ? 'entrada' : 'salida'} = NOW()
         WHERE id = ?`,
        [nuevoStock, id]
      );
      
      // Registrar movimiento
      await connection.execute(
        `INSERT INTO movimientos_inventario (
          sku, tipo_movimiento, cantidad, cantidad_anterior, 
          cantidad_nueva, motivo, usuario
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sku, tipoMovimiento, cantidad, stock_actual, nuevoStock, motivo, usuario]
      );
      
      await connection.commit();
      return nuevoStock;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getMovimientos(id, limit = 50) {
    const query = `
      SELECT mi.*, i.nombre_material
      FROM movimientos_inventario mi
      JOIN inventario i ON mi.sku = i.sku
      WHERE i.id = ?
      ORDER BY mi.fecha_movimiento DESC
      LIMIT ?
    `;
    const [rows] = await db.execute(query, [id, limit]);
    return rows;
  }

  static async update(id, inventarioData) {
    const { 
      nombre_material, categoria, stock_minimo, 
      unidad_medida, precio_unitario, proveedor, ubicacion_almacen, notas 
    } = inventarioData;
    
    const query = `
      UPDATE inventario 
      SET nombre_material = ?, categoria = ?, stock_minimo = ?,
          unidad_medida = ?, precio_unitario = ?, proveedor = ?, 
          ubicacion_almacen = ?, notas = ?
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [
      nombre_material, categoria, stock_minimo,
      unidad_medida, precio_unitario, proveedor, ubicacion_almacen, notas, id
    ]);
    
    return result.affectedRows;
  }

  static async delete(id) {
    const query = 'UPDATE inventario SET activo = 0 WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows;
  }

  static async getEstadisticas() {
    const query = `
      SELECT 
        categoria,
        COUNT(*) as total_materiales,
        SUM(stock_actual * precio_unitario) as valor_inventario,
        SUM(CASE WHEN stock_actual <= stock_minimo THEN 1 ELSE 0 END) as materiales_criticos,
        SUM(CASE WHEN stock_actual <= (stock_minimo * 1.5) AND stock_actual > stock_minimo THEN 1 ELSE 0 END) as materiales_bajo_stock
      FROM inventario 
      WHERE activo = 1
      GROUP BY categoria
      ORDER BY categoria
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getResumenGeneral() {
    const query = `
      SELECT 
        COUNT(*) as total_materiales,
        SUM(stock_actual * precio_unitario) as valor_total_inventario,
        SUM(CASE WHEN stock_actual <= stock_minimo THEN 1 ELSE 0 END) as total_criticos,
        SUM(CASE WHEN stock_actual <= (stock_minimo * 1.5) AND stock_actual > stock_minimo THEN 1 ELSE 0 END) as total_bajo_stock,
        COUNT(DISTINCT categoria) as total_categorias,
        COUNT(DISTINCT proveedor) as total_proveedores
      FROM inventario 
      WHERE activo = 1
    `;
    const [rows] = await db.execute(query);
    return rows[0];
  }
}

module.exports = Inventario;