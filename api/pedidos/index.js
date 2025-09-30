const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // En el GET de pedidos, ajusta la hora_entrega
if (req.method === "GET") {
  const { rows } = await pool.query(`
    SELECT * FROM pedidos ORDER BY fecha DESC
  `);
  
  // Ajustar las horas para el frontend
  const pedidosAjustados = rows.map(pedido => {
    if (pedido.hora_entrega) {
      // Crear nueva fecha ajustada (+6 horas)
      const fechaAjustada = new Date(pedido.hora_entrega);
      fechaAjustada.setHours(fechaAjustada.getHours() + 6);
      return {
        ...pedido,
        hora_entrega: fechaAjustada.toISOString()
      };
    }
    return pedido;
  });
  
  console.log("📋 Pedidos obtenidos:", pedidosAjustados.length);
  res.json({ message: "success", data: pedidosAjustados });
}
    
    else if (req.method === "POST") {
      const data = req.body;
      console.log("📦 Datos recibidos en POST:", JSON.stringify(data, null, 2));

      // SOLUCIÓN: Usa esta consulta que incluye mesaid
      const sql = `INSERT INTO pedidos 
                   (tipo, cliente, items, total, estado, fecha, mesaid, hora_entrega, metodo_pago, pago_con, cambio, observaciones, costo_envio) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`;

      const result = await pool.query(sql, [
        data.tipo,
        data.cliente ? JSON.stringify(data.cliente) : null,
        JSON.stringify(data.items),
        data.total,
        data.estado || "pendiente",
        data.fecha ? new Date(data.fecha) : new Date(),
        data.mesaId || null,
        data.horaEntrega ? new Date(data.horaEntrega).toISOString() : null, // Guardar en formato ISO UTC
        data.metodoPago || null,
        data.pagoCon || null,
        data.cambio || null,
        data.observaciones || null,
        data.costoEnvio || null,
      ]);

      console.log("✅ Pedido guardado con ID:", result.rows[0].id);
      res.json({ message: "success", id: result.rows[0].id });
    } 
    
    else if (req.method === "PUT") {
      const { id } = req.query;
      const { estado } = req.body;

      console.log("Actualizando pedido:", id, "Nuevo estado:", estado);

      if (!id) {
        return res.status(400).json({ error: "ID del pedido es requerido" });
      }

      const sql = `UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *`;
      const result = await pool.query(sql, [estado, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      res.json({
        message: "Estado actualizado exitosamente",
        data: result.rows[0],
      });
    }
  } catch (err) {
    console.error("Error en API pedidos:", err);
    res.status(500).json({ error: err.message });
  }
};