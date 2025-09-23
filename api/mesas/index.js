const db = require('../_lib/database.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'GET') {
    try {
      const { rows } = await db.query('SELECT * FROM mesas ORDER BY numero');
      res.json({ message: "success", data: rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};