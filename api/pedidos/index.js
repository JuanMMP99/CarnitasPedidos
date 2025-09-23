const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + '?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY fecha DESC');
      res.json({ message: "success", data: rows });
    } else if (req.method === 'POST') {
      const data = req.body;
      const sql = `INSERT INTO pedidos (tipo, cliente, items, total, estado, fecha) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
      const result = await pool.query(sql, [
        data.tipo, data.cliente, JSON.stringify(data.items), data.total, 'pendiente', new Date()
      ]);
      res.json({ message: "success", id: result.rows[0].id });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};