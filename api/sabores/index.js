const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + '?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET - Obtener sabores
    if (req.method === 'GET') {
      const { categoria } = req.query;
      let query = 'SELECT * FROM sabores';
      let params = [];
      
      if (categoria) {
        query += ' WHERE categoria = $1';
        params.push(categoria);
      }
      
      query += ' ORDER BY nombre';
      const { rows } = await pool.query(query, params);
      res.json({ message: "success", data: rows });
    }
    
    // PUT - Actualizar disponibilidad de sabor
    else if (req.method === 'PUT') {
      const { id } = req.query;
      const { disponible } = req.body;

      const { rows } = await pool.query(
        'UPDATE sabores SET disponible = $1 WHERE id = $2 RETURNING *',
        [disponible, id]
      );
      
      res.json({ message: "Sabor actualizado", data: rows[0] });
    }
    
    // POST - Crear nuevo sabor
    else if (req.method === 'POST') {
      const { nombre, categoria } = req.body;
      
      const { rows } = await pool.query(
        'INSERT INTO sabores (nombre, categoria) VALUES ($1, $2) RETURNING *',
        [nombre, categoria]
      );
      
      res.json({ message: "Sabor creado", data: rows[0] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};