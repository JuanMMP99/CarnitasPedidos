const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      case 'PUT':
        await handlePut(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).json({ error: `Método ${req.method} no permitido` });
    }
  } catch (err) {
    console.error('Error en API de pedidos:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};

const handleGet = async (req, res) => {
  // La columna 'fecha' en la DB se llama 'fecha', no 'hora_entrega'
  const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY fecha DESC');
  res.status(200).json({ message: 'success', data: rows });
};

const handlePost = async (req, res) => {
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
    mesaId,
  } = req.body;

  if (!tipo || !items || !total) {
    return res.status(400).json({ error: 'Faltan campos requeridos para el pedido.' });
  }

  // Asumiendo que los nombres de columna en tu DB son snake_case
  const query = `
    INSERT INTO pedidos (tipo, cliente, items, total, costo_envio, hora_entrega, metodo_pago, pago_con, cambio, observaciones, estado, mesa_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

  const values = [
    tipo,
    cliente ? JSON.stringify(cliente) : null,
    JSON.stringify(items),
    total,
    costoEnvio,
    horaEntrega || null, // Guardar null si no hay hora de entrega
    metodoPago,
    pagoCon,
    cambio,
    observaciones,
    estado,
    mesaId,
  ];

  const { rows } = await pool.query(query, values);
  res.status(201).json({ message: 'Pedido creado exitosamente', data: rows[0] });
};

const handlePut = async (req, res) => {
  const { id } = req.query;
  const { estado } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'El ID del pedido es requerido.' });
  }
  if (!estado) {
    return res.status(400).json({ error: 'El nuevo estado es requerido.' });
  }

  const query = `
    UPDATE pedidos
    SET estado = $1
    WHERE id = $2
    RETURNING *
  `;
  const values = [estado, id];

  const { rows } = await pool.query(query, values);

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  res.status(200).json({ message: 'Estado del pedido actualizado', data: rows[0] });
};

module.exports = handler;