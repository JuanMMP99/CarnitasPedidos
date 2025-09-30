const { Pool } = require('pg');

// La URL de Vercel ya incluye los parámetros SSL necesarios.
// El paquete 'pg' los interpreta automáticamente.
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false } // Esencial para conexiones a Vercel Postgres
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
    } 
    else if (req.method === 'POST') {
      const data = req.body;
      // Campos que vienen del frontend
      const {
        tipo,
        cliente,
        items,
        total,
        costoEnvio,
        horaEntrega,
        metodoPago,
        pagoCon,
        cambio,
        observaciones,
        estado,
        fecha, // Este es el que contiene la hora de entrega si se especificó
        mesaId
      } = data;

      const sql = `
        INSERT INTO pedidos (tipo, cliente, items, total, costo_envio, hora_entrega, metodo_pago, pago_con, cambio, observaciones, estado, fecha, mesa_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING id
      `;

      const result = await pool.query(sql, [
        tipo, cliente, JSON.stringify(items), total, costoEnvio, horaEntrega, metodoPago, pagoCon, cambio, observaciones, estado || 'pendiente', fecha, mesaId
      ]);

      res.json({ message: "success", id: result.rows[0].id });
    }
    else if (req.method === 'PUT') {
      // Obtener el ID del query parameter (/?id=5)
      const { id } = req.query;
      const { estado } = req.body;

      console.log('Actualizando pedido:', id, 'Nuevo estado:', estado);

      if (!id) {
        return res.status(400).json({ error: 'ID del pedido es requerido' });
      }

      // Actualizar solo el estado del pedido
      const sql = `UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *`;
      const result = await pool.query(sql, [estado, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      res.json({ message: "Estado actualizado exitosamente", data: result.rows[0] });
    }
  } catch (err) {
    console.error('Error en API pedidos:', err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};