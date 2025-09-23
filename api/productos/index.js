const db = require('../_lib/database.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await db.query('SELECT * FROM productos ORDER BY id');
      res.json({ message: "success", data: rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, precio, categoria, tipos, disponible } = req.body;
      const sql = `INSERT INTO productos (nombre, precio, categoria, tipos, disponible) 
                   VALUES ($1, $2, $3, $4, $5) RETURNING id`;
      const result = await db.query(sql, [
        nombre, precio, categoria, tipos, disponible
      ]);
      res.json({ message: "success", id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'PUT' && req.query.id) {
    try {
      const { nombre, precio, disponible } = req.body;
      const result = await db.query(
        'UPDATE productos SET nombre = $1, precio = $2, disponible = $3 WHERE id = $4',
        [nombre, precio, disponible, req.query.id]
      );
      res.json({ message: "success", changes: result.rowCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};