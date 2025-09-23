const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + '?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;