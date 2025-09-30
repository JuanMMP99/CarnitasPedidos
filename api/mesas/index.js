const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + '?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM mesas ORDER BY numero');
      res.json({ message: "success", data: rows });
    } 
    else if (req.method === 'PUT') {
      const { id } = req.query;
      const { estado, pedidoActual } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de mesa es requerido' });
      }

      const sql = `UPDATE mesas SET estado = $1, pedido_actual = $2 WHERE id = $3 RETURNING *`;
      const result = await pool.query(sql, [estado, pedidoActual, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Mesa no encontrada' });
      }

      res.json({ message: "Mesa actualizada exitosamente", data: result.rows[0] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};