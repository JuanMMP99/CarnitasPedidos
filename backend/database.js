const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "db.sqlite";

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message);
      throw err;
    } else {
        console.log('Connected to the SQLite database.');
        // Crear tablas si no existen
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT,
                precio REAL,
                categoria TEXT,
                disponible BOOLEAN,
                tipos TEXT
            )`, (err) => {
                if (err) {
                    // Table already created
                } else {
                    // Table just created, creating some rows
                    const productos = [
                        { id: 1, nombre: 'Taco', precio: 15, categoria: 'taco', disponible: true, tipos: ['Cuerito', 'Maciza', 'Surtida', 'Buche', 'Nana', 'Chamorro', 'Oreja'] },
                        { id: 2, nombre: 'Carnitas 1/4', precio: 80, categoria: 'carnitas', disponible: true, tipos: null },
                        { id: 3, nombre: 'Carnitas 1/2', precio: 150, categoria: 'carnitas', disponible: true, tipos: null },
                        { id: 4, nombre: 'Carnitas 1kg', precio: 300, categoria: 'carnitas', disponible: true, tipos: null },
                        { id: 5, nombre: 'Torta', precio: 50, categoria: 'torta', disponible: true, tipos: ['Cuerito', 'Maciza', 'Surtida'] },
                        { id: 6, nombre: 'Refresco', precio: 25, categoria: 'bebida', disponible: true, tipos: null },
                        { id: 7, nombre: 'Jugo Natural', precio: 30, categoria: 'bebida', disponible: true, tipos: null },
                        { id: 8, nombre: 'Agua Fresca', precio: 20, categoria: 'bebida', disponible: true, tipos: null },
                    ];
                    const insert = 'INSERT INTO productos (nombre, precio, categoria, disponible, tipos) VALUES (?,?,?,?,?)';
                    productos.forEach(p => {
                        db.run(insert, [p.nombre, p.precio, p.categoria, p.disponible, p.tipos ? JSON.stringify(p.tipos) : null]);
                    });
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS mesas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                numero INTEGER,
                estado TEXT,
                pedidoActual INTEGER
            )`, (err) => {
                if (err) {
                    // Table already created
                } else {
                    const mesas = [
                        { id: 1, numero: 1, estado: 'disponible', pedidoActual: null },
                        { id: 2, numero: 2, estado: 'disponible', pedidoActual: null },
                        { id: 3, numero: 3, estado: 'disponible', pedidoActual: null },
                        { id: 4, numero: 4, estado: 'disponible', pedidoActual: null },
                    ];
                    const insert = 'INSERT INTO mesas (numero, estado, pedidoActual) VALUES (?,?,?)';
                    mesas.forEach(m => db.run(insert, [m.numero, m.estado, m.pedidoActual]));
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo TEXT,
                cliente TEXT,
                items TEXT,
                total REAL,
                costoEnvio REAL,
                horaEntrega TEXT,
                metodoPago TEXT,
                pagoCon REAL,
                cambio REAL,
                observaciones TEXT,
                estado TEXT,
                fecha TEXT,
                mesaId INTEGER
            )`);
        });
    }
});

module.exports = db;