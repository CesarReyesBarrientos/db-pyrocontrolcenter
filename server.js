require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importar rutas
const customerRoutes = require('../db-pyrocontrolcenter/routes/customers');
const orderRoutes = require('../db-pyrocontrolcenter/routes/orders');
const loteRoutes = require('../db-pyrocontrolcenter/routes/lotes');
const inventarioRoutes = require('../db-pyrocontrolcenter/routes/inventario');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/lotes', loteRoutes);
app.use('/api/inventario', inventarioRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Pirotécnicos funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      customers: '/api/customers',
      orders: '/api/orders',
      lotes: '/api/lotes',
      inventario: '/api/inventario'
    }
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});