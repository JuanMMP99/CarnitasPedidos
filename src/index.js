const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
});

const handler = async (req, res) => {
    // Configurar CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case "GET":
                await handleGet(req, res);
                break;
            case "PUT":
                await handlePut(req, res);
                break;
            default:
                res.setHeader("Allow", ["GET", "PUT"]);
                res.status(405).json({ error: `Método ${req.method} no permitido` });
        }
    } catch (err) {
        console.error("Error en API de mesas:", err);
        res.status(500).json({ error: "Error interno del servidor", details: err.message });
    }
};

const handleGet = async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM mesas ORDER BY numero");
    res.status(200).json({ message: "success", data: rows });
};

const handlePut = async (req, res) => {
    const { id } = req.query;
    const { estado, pedidoActual } = req.body;

    if (!id) {
        return res.status(400).json({ error: "El ID de la mesa es requerido" });
    }

    if (typeof estado === 'undefined') {
        return res.status(400).json({ error: "El campo 'estado' es requerido" });
    }

    const query = `
        UPDATE mesas 
        SET estado = $1, "pedidoActual" = $2
        WHERE id = $3
        RETURNING *
    `;

    const { rows } = await pool.query(query, [estado, pedidoActual, id]);

    if (rows.length === 0) {
        return res.status(404).json({ error: "Mesa no encontrada" });
    }

    res.status(200).json({ message: "Mesa actualizada exitosamente", data: rows[0] });
};

module.exports = handler;