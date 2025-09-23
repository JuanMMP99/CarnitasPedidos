const express = require('express');
const cors = require('cors');
const db = require('../backend/database.js'); // Reutilizamos la conexión a la BD

const app = express();

app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// GET: Obtener todos los productos
app.get("/api/productos", async (req, res) => {
    const sql = "SELECT * FROM productos ORDER BY id ASC";
    try {
        const { rows } = await db.query(sql);
        // 'tipos' ya es un array de texto en PostgreSQL, no necesita JSON.parse
        res.json({
            "message": "success",
            "data": rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// GET: Obtener todas las mesas
app.get("/api/mesas", async (req, res) => {
    const sql = "SELECT * FROM mesas ORDER BY numero ASC";
    try {
        const { rows } = await db.query(sql);
        res.json({
            "message": "success",
            "data": rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// GET: Obtener todos los pedidos
app.get("/api/pedidos", async (req, res) => {
    const sql = "SELECT * FROM pedidos ORDER BY fecha DESC";
    try {
        const { rows } = await db.query(sql);
        // 'cliente' e 'items' ya son JSONB en PostgreSQL, no necesitan JSON.parse
        res.json({
            "message": "success",
            "data": rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// POST: Crear un nuevo pedido
app.post("/api/pedidos", async (req, res) => {
    const data = req.body;
    // Usamos $1, $2, etc. para los parámetros en PostgreSQL
    // La columna 'id' es autoincremental (SERIAL)
    const sql = `INSERT INTO pedidos (tipo, cliente, items, total, costoEnvio, horaEntrega, metodoPago, pagoCon, cambio, observaciones, estado, fecha, mesaId) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                 RETURNING id`; // RETURNING id nos devuelve el ID del nuevo pedido
    const params = [
        data.tipo,
        data.cliente, // Se guarda como JSONB directamente
        data.items,   // Se guarda como JSONB directamente
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
            "data": { ...data, id: newId },
            "id": newId
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// PUT: Actualizar estado de un pedido
app.put("/api/pedidos/:id", async (req, res) => {
    const { estado } = req.body;
    const sql = `UPDATE pedidos SET estado = $1 WHERE id = $2`;
    try {
        const result = await db.query(sql, [estado, req.params.id]);
        res.json({
            message: "success",
            changes: result.rowCount
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// PUT: Actualizar un producto (ej. disponibilidad)
app.put("/api/productos/:id", async (req, res) => {
    const { nombre, precio, disponible } = req.body;
    const sql = `UPDATE productos SET nombre = $1, precio = $2, disponible = $3 WHERE id = $4`;
    try {
        const result = await db.query(sql, [nombre, precio, disponible, req.params.id]);
        res.json({ message: "success", data: req.body, changes: result.rowCount });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Default response for any other request
app.use(function(req, res){
    res.status(404).json({ "error": "Not Found" });
});

// Exportamos la app para que Vercel la pueda usar
module.exports = app;