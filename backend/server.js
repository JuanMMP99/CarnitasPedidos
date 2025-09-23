const express = require('express');
const cors = require('cors');
const db = require('./database.js');

const app = express();

app.use(cors());
app.use(express.json());

const HTTP_PORT = 8000;

app.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`);
});

// --- API Endpoints ---

// GET: Obtener todos los productos
app.get("/api/productos", (req, res, next) => {
    const sql = "select * from productos";
    db.all(sql, [], (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        // Parsear 'tipos' de JSON string a array
        const productos = rows.map(p => ({
            ...p,
            tipos: p.tipos ? JSON.parse(p.tipos) : null
        }));
        res.json({
            "message":"success",
            "data": productos
        })
      });
});

// GET: Obtener todas las mesas
app.get("/api/mesas", (req, res, next) => {
    const sql = "select * from mesas";
    db.all(sql, [], (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data": rows
        })
      });
});

// GET: Obtener todos los pedidos
app.get("/api/pedidos", (req, res, next) => {
    const sql = "select * from pedidos";
    db.all(sql, [], (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        const pedidos = rows.map(p => ({
            ...p,
            cliente: p.cliente ? JSON.parse(p.cliente) : null,
            items: p.items ? JSON.parse(p.items) : []
        }));
        res.json({
            "message":"success",
            "data": pedidos
        })
      });
});

// POST: Crear un nuevo pedido
app.post("/api/pedidos", (req, res, next) => {
    const data = req.body;
    const sql = `INSERT INTO pedidos (tipo, cliente, items, total, costoEnvio, horaEntrega, metodoPago, pagoCon, cambio, observaciones, estado, fecha, mesaId) 
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const params = [
        data.tipo,
        JSON.stringify(data.cliente),
        JSON.stringify(data.items),
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
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": { ...data, id: this.lastID },
            "id" : this.lastID
        })
    });
});

// PUT: Actualizar estado de un pedido
app.put("/api/pedidos/:id", (req, res, next) => {
    const { estado } = req.body;
    const sql = `UPDATE pedidos set estado = ? WHERE id = ?`;
    db.run(sql, [estado, req.params.id], function (err, result) {
        if (err){
            res.status(400).json({"error": res.message})
            return;
        }
        res.json({
            message: "success",
            changes: this.changes
        })
    });
});

// PUT: Actualizar un producto (ej. disponibilidad)
app.put("/api/productos/:id", (req, res, next) => {
    const { nombre, precio, disponible } = req.body;
    const sql = `UPDATE productos set nombre = ?, precio = ?, disponible = ? WHERE id = ?`;
    db.run(sql, [nombre, precio, disponible, req.params.id], function (err, result) {
        if (err){
            res.status(400).json({"error": res.message})
            return;
        }
        res.json({ message: "success", data: req.body, changes: this.changes })
    });
});

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});