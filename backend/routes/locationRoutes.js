const express = require("express");
const router = express.Router();
const pool = require("../db"); // 👈 usa tu conexión ya existente

// Endpoint: todos los países
router.get("/paises", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuario.pais ORDER BY nombre");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener países" });
  }
});

// Endpoint: departamentos por país
router.get("/departamentos/:idpais", async (req, res) => {
  const { idpais } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM usuario.departamento WHERE idpais = $1 ORDER BY nombre",
      [id_pais]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener departamentos" });
  }
});

// Endpoint: ciudades por departamento
router.get("/ciudades/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM usuario.ciudad WHERE id = $1 ORDER BY nombre",
      [id_departamento]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ciudades" });
  }
});

module.exports = router;

