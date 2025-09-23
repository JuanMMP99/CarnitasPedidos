const express = require('express');
const cors = require('cors');
const db = require('./_lib/database.js');

const app = express();

app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// Health Check Endpoint para diagnosticar la conexión a la BD
app.get("/health", async (req, res) => {
  try {
    await db.query('SELECT NOW()'); // Una consulta simple para verificar la conexión
    res.status(200).json({
      status: "ok",
      message: "La conexión a la base de datos es exitosa."
    });
  } catch (err) {
    console.error("Fallo en el health check de la base de datos:", err);
    res.status(500).json({
      status: "error",
      message: "No se pudo conectar a la base de datos.",
      error: err.message
    });
  }
});

// GET: Obtener todos los productos
app.get("/productos", async (req, res) => {
    console.log("GET /productos request received");
    const sql = "SELECT * FROM productos ORDER BY id ASC";
    try {
      const {
        rows
      } = await db.query(sql);
      res.json({
        "message": "success",
        "data": rows
      });
    } catch (err) {
      console.error("Error fetching productos:", err);
      res.status(500).json({
        "error": err.message
      });
    }
});

// GET: Obtener todas las mesas
app.get("/mesas", async (req, res) => {
    console.log("GET /mesas request received");
    const sql = "SELECT * FROM mesas ORDER BY numero ASC";
    try {
      const {
        rows
      } = await db.query(sql);
      res.json({
        "message": "success",
        "data": rows
      });
    } catch (err) {
      console.error("Error fetching mesas:", err);
      res.status(500).json({
        "error": err.message
      });
    }
});

// GET: Obtener todos los pedidos
app.get("/pedidos", async (req, res) => {
    console.log("GET /pedidos request received");
    const sql = "SELECT * FROM pedidos ORDER BY fecha DESC";
    try {
      const {
        rows
      } = await db.query(sql);
      res.json({
        "message": "success",
        "data": rows
      });
    } catch (err) {
      console.error("Error fetching pedidos:", err);
      res.status(500).json({
        "error": err.message
      });
    }
});

// POST: Crear un nuevo pedido
app.post("/pedidos", async (req, res) => {
    console.log("POST /pedidos request received");
    const data = req.body;
    const sql = `INSERT INTO pedidos (tipo, cliente, items, total, costoEnvio, horaEntrega, metodoPago, pagoCon, cambio, observaciones, estado, fecha, mesaId) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                 RETURNING id`;
    const params = [
      data.tipo,
      data.cliente,
      data.items,
      data.total,
      data.costoEnvio,
      data.horaEntrega,
      data.metodoPago,
      data.pagoCon,
      data.cambio,
      data.observaciones,
      data.estado,
      data.fecha,
      data.mesaId
    ];
    try {
      const result = await db.query(sql, params);
      const newId = result.rows[0].id;
      res.json({
        "message": "success",
        "data": { ...data,
          id: newId
        },
        "id": newId
      });
    } catch (err) {
      console.error("Error creating pedido:", err);
      res.status(500).json({
        "error": err.message
      });
    }
});

// PUT: Actualizar estado de un pedido
app.put("/pedidos/:id", async (req, res) => {
    console.log(`PUT /pedidos/${req.params.id} request received`);
    const { estado } = req.body;
    const sql = `UPDATE pedidos SET estado = $1 WHERE id = $2`;
    try {
      const result = await db.query(sql, [estado, req.params.id]);
      res.json({
        message: "success",
        changes: result.rowCount
      });
    } catch (err) {
      console.error("Error updating pedido:", err);
      res.status(500).json({
        "error": err.message
      });
    }
});

// PUT: Actualizar un producto (ej. disponibilidad)
app.put("/productos/:id", async (req, res) => {
    console.log(`PUT /productos/${req.params.id} request received`);
    const { nombre, precio, disponible } = req.body;
    const sql = `UPDATE productos SET nombre = $1, precio = $2, disponible = $3 WHERE id = $4`;
    try {
      const result = await db.query(sql, [nombre, precio, disponible, req.params.id]);
      res.json({
        message: "success",
        data: req.body,
        changes: result.rowCount
      });
    } catch (err) {
      console.error("Error updating producto:", err);
      res.status(500).json({
        "error": err.message
      });
    }
});

// POST: Crear un nuevo producto
app.post("/productos", async (req, res) => {
  console.log("POST /productos request received");
  const {
    nombre,
    precio,
    categoria,
    tipos,
    disponible
  } = req.body;
  const sql = `INSERT INTO productos (nombre, precio, categoria, tipos, disponible) 
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`;
  const params = [nombre, precio, categoria, tipos ? tipos.split(',').map(t => t.trim()) : null, disponible];
  try {
    const result = await db.query(sql, params);
    const newId = result.rows[0].id;
    res.json({
      "message": "success",
      "data": { ...req.body,
        id: newId
      },
      "id": newId
    });
  } catch (err) {
    console.error("Error creating producto:", err);
    res.status(500).json({
      "error": err.message
    });
  }
});

// Exportamos la app para que Vercel la pueda usar.
module.exports = app;