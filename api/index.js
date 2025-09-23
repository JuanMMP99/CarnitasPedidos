const express = require('express');
const cors = require('cors');
const db = require('./_lib/database.js'); // Ruta corregida

const app = express();

app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// GET: Obtener todos los productos
app.get("/api/productos", async (req, res) => {
    const sql = "SELECT * FROM productos ORDER BY id ASC";
    try {
        const { rows } = await db.query(sql);
        res.json({
            "message": "success",
            "data": rows
        });
    } catch (err) {
        console.error("Error fetching productos:", err);
        res.status(500).json({ "error": err.message });
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
        console.error("Error fetching mesas:", err);
        res.status(500).json({ "error": err.message });
    }
});

// GET: Obtener todos los pedidos
app.get("/api/pedidos", async (req, res) => {
    const sql = "SELECT * FROM pedidos ORDER BY fecha DESC";
    try {
        const { rows } = await db.query(sql);
        res.json({
            "message": "success",
            "data": rows
        });
    } catch (err) {
        console.error("Error fetching pedidos:", err);
        res.status(500).json({ "error": err.message });
    }
});

// POST: Crear un nuevo pedido
app.post("/api/pedidos", async (req, res) => {
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
            "data": { ...data, id: newId },
            "id": newId
        });
    } catch (err) {
        console.error("Error creating pedido:", err);
        res.status(500).json({ "error": err.message });
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
        console.error("Error updating pedido:", err);
        res.status(500).json({ "error": err.message });
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
        console.error("Error updating producto:", err);