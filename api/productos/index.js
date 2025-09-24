const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + '?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Obtener todos los productos
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM productos ORDER BY id');
      res.json({ message: "success", data: rows });
    }
    
    // POST - Crear nuevo producto
    else if (req.method === 'POST') {
      const { nombre, precio, categoria, tipos, disponible = true } = req.body;
      
      // Validaciones básicas
      if (!nombre || !precio || !categoria) {
        return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
      }
      
      const tiposArray = tipos ? tipos.split(',').map(t => t.trim()).filter(t => t) : [];
      
      const query = `
        INSERT INTO productos (nombre, precio, categoria, tipos, disponible) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `;
      
      const values = [nombre, parseFloat(precio), categoria, tiposArray, disponible];
      const { rows } = await pool.query(query, values);
      
      res.status(201).json({ message: "Producto creado exitosamente", data: rows[0] });
    }
    
    // PUT - Actualizar producto existente
    else if (req.method === 'PUT') {
      const { id } = req.query;
      const { nombre, precio, disponible } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'ID del producto es requerido' });
      }
      
      // Verificar si el producto existe
      const productCheck = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
      if (productCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      const query = `
        UPDATE productos 
        SET nombre = $1, precio = $2, disponible = $3 
        WHERE id = $4 
        RETURNING *
      `;
      
      const values = [nombre, parseFloat(precio), disponible, id];
      const { rows } = await pool.query(query, values);
      
      res.json({ message: "Producto actualizado exitosamente", data: rows[0] });
    }
    
    // Método no soportado
    else {
      res.status(405).json({ error: 'Método no permitido' });
    }
    
  } catch (err) {
    console.error('Error en API de productos:', err);
    res.status(500).json({ error: err.message });
  }
};