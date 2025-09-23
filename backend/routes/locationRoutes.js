const express = require("express");
const router = express.Router();
const pool = require("../db"); // 👈 usa tu conexión ya existente

// Endpoint: todos los países
router.get("/paises", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pais ORDER BY nombre");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener países" });
  }
});

// Endpoint: departamentos por país
router.get("/departamentos/:id_pais", async (req, res) => {
  const { id_pais } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM departamento WHERE id_pais = $1 ORDER BY nombre",
      [id_pais]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener departamentos" });
  }
});

// Endpoint: ciudades por departamento
router.get("/ciudades/:id_departamento", async (req, res) => {
  const { id_departamento } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM ciudad WHERE id_departamento = $1 ORDER BY nombre",
      [id_departamento]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ciudades" });
  }
});

module.exports = router;
