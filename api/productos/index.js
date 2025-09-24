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
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Obtener todos los pedidos
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY fecha DESC');
      res.json({ message: "success", data: rows });
    }
    
    // POST - Crear nuevo pedido
    else if (req.method === 'POST') {
      const { tipo, cliente, items, total, mesaId, estado, horaEntrega, metodoPago, pagoCon, cambio, observaciones, costoEnvio } = req.body;
      
      const query = `
        INSERT INTO pedidos (tipo, cliente, items, total, "mesaId", estado, "horaEntrega", "metodoPago", "pagoCon", cambio, observaciones, "costoEnvio", fecha) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING *
      `;
      
      const values = [
        tipo, 
        cliente, 
        items, 
        total, 
        mesaId, 
        estado || 'pendiente', 
        horaEntrega, 
        metodoPago, 
        pagoCon, 
        cambio, 
        observaciones, 
        costoEnvio, 
        new Date()
      ];
      
      const { rows } = await pool.query(query, values);
      res.status(201).json({ message: "Pedido creado exitosamente", data: rows[0] });
    }
    
    // PUT - Actualizar estado del pedido
    else if (req.method === 'PUT') {
      const { id } = req.query;
      const { estado } = req.body;
      
      console.log('Actualizando pedido ID:', id, 'Nuevo estado:', estado);
      
      if (!id) {
        return res.status(400).json({ error: 'ID del pedido es requerido' });
      }
      
      // Verificar si el pedido existe
      const pedidoCheck = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
      if (pedidoCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
      
      const query = `
        UPDATE pedidos 
        SET estado = $1 
        WHERE id = $2 
        RETURNING *
      `;
      
      const values = [estado, id];
      const { rows } = await pool.query(query, values);
      
      res.json({ message: "Estado del pedido actualizado exitosamente", data: rows[0] });
    }
    
    else {
      res.status(405).json({ error: 'Método no permitido' });
    }
    
  } catch (err) {
    console.error('Error en API de pedidos:', err);
    res.status(500).json({ error: err.message });
  }
};