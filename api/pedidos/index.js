const db = require('../_lib/database.js');

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query('SELECT * FROM pedidos ORDER BY fecha DESC');
      res.json({ message: "success", data: rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    try {
      const data = req.body;
      const sql = `INSERT INTO pedidos (tipo, cliente, items, total, estado, fecha) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
      const result = await db.query(sql, [
        data.tipo, data.cliente, data.items, data.total, 'pendiente', new Date()
      ]);
      res.json({ message: "success", id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'PUT' && req.query.id) {
    try {
      const { estado } = req.body;
      const result = await db.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, req.query.id]);
      res.json({ message: "success", changes: result.rowCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};