const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }, // Necesario para conexiones en Vercel
});

const handler = async (req, res) => {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case "GET":
        await handleGet(req, res);
        break;
      case "POST":
        await handlePost(req, res);
        break;
      case "PUT":
        await handlePut(req, res);
        break;
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        res.status(405).json({ error: `Método ${req.method} no permitido` });
    }
  } catch (err) {
    console.error("Error en API de productos:", err);
    res.status(500).json({ error: "Error interno del servidor", details: err.message });
  }
};

const handleGet = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM productos ORDER BY id");
  res.status(200).json({ message: "success", data: rows });
};

const handlePost = async (req, res) => {
  const { nombre, precio, categoria, tipos, disponible = true } = req.body;

  if (!nombre || !precio || !categoria) {
    return res
      .status(400)
      .json({ error: "Nombre, precio y categoría son requeridos" });
  }
  if (isNaN(parseFloat(precio))) {
    return res.status(400).json({ error: "El precio debe ser un número válido" });
  }

  const tiposArray = tipos
    ? tipos
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean) // Filtra strings vacíos
    : [];

  const query = `
    INSERT INTO productos (nombre, precio, categoria, tipos, disponible) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *
  `;

  const values = [
    nombre,
    parseFloat(precio),
    categoria,
    tiposArray,
    disponible,
  ];
  
  try {
    const { rows } = await pool.query(query, values);
    res
      .status(201)
      .json({ message: "Producto creado exitosamente", data: rows[0] });
  } catch (error) {
    // Manejar error de unicidad en el nombre, si existe la restricción en la DB
    if (error.code === '23505') { // Código de error para violación de unicidad en PostgreSQL
      return res.status(409).json({ error: `El producto con nombre "${nombre}" ya existe.` });
    }
    throw error; // Re-lanzar otros errores para que el catch principal los maneje
  }
};

const handlePut = async (req, res) => {
  const { id } = req.query;
  const { nombre, precio, disponible } = req.body;

  if (!id) {
    return res.status(400).json({ error: "El ID del producto es requerido en la URL" });
  }

  // Construir la consulta dinámicamente para actualizar solo los campos provistos
  const fields = [];
  const values = [];
  let fieldIndex = 1;

  if (nombre !== undefined) {
    fields.push(`nombre = $${fieldIndex++}`);
    values.push(nombre);
  }
  if (precio !== undefined) {
    if (isNaN(parseFloat(precio))) {
      return res.status(400).json({ error: "El precio debe ser un número válido" });
    }
    fields.push(`precio = $${fieldIndex++}`);
    values.push(parseFloat(precio));
  }
  if (disponible !== undefined) {
    fields.push(`disponible = $${fieldIndex++}`);
    values.push(disponible);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
  }

  values.push(id); // Añadir el ID al final para la cláusula WHERE

  const query = `
    UPDATE productos 
    SET ${fields.join(", ")}
    WHERE id = $${fieldIndex}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);

  if (rows.length === 0) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.status(200).json({ message: "Producto actualizado exitosamente", data: rows[0] });
};

module.exports = handler;
