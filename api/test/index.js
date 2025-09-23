module.exports = async (req, res) => {
  res.json({ 
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString()
  });
};