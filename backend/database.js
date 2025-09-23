const { Pool } = require('pg');

// La URL de conexión a la base de datos se obtiene de las variables de entorno de Vercel
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Necesario para las conexiones en Vercel
  },
});

module.exports = pool;