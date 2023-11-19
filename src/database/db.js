// db.js
const { Pool } = require('pg');

// Crear una nueva instancia de Pool con la configuración de conexión
const pool = new Pool({
  user: process.env.DB_USER || process.env.DB_USER,
  host: process.env.DB_HOST || process.env.DB_HOST,
  database: process.env.DB_NAME || process.env.DB_NAME,
  password: process.env.DB_PASSWORD || process.env.DB_PASSWORD,
  port: process.env.DB_PORT || process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Para entornos de desarrollo. En producción, querrás configurar certificados.
  }
});

module.exports = pool;
