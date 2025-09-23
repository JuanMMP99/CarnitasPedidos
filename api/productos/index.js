const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + '?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM productos ORDER BY id');
      res.json({ message: "success", data: rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};