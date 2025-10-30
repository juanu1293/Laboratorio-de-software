const express = require("express"); 
const router = express.Router(); 
const pool = require("../db");

// Endpoint: todos los países 
router.get("/paises", async (req, res) => { 
  try { 
    // CAMBIO: Apunta a 'public.countries' y selecciona 'id' y 'name' 
    const result = await pool.query(
       "SELECT id, name FROM public.countries ORDER BY name" ); 
    res.json(result.rows); 
  } catch (err) {
     res.status(500).json({ error: "Error al obtener países" }); 
    } 
  });

// Endpoint: departamentos (estados) por país 
router.get("/departamentos/:idpais", async (req, res) => { 
  const { idpais } = req.params; 
  try {
     // CAMBIO: Apunta a 'public.states' y filtra por 'country_id' 
     const result = await pool.query( "SELECT id, name FROM public.states WHERE country_id = $1 ORDER BY name", [idpais] ); 
     res.json(result.rows); 
  } catch (err) {
    res.status(500).json({ error: "Error al obtener departamentos" }); 
  } 
});

// Endpoint: ciudades por departamento (estado) 
router.get("/ciudades/:id_departamento", async (req, res) => { 
  const { id_departamento } = req.params; 
  try { // CAMBIO: Apunta a 'public.cities' y filtra por 'state_id' 
    const result = await pool.query( "SELECT id, name FROM public.cities WHERE state_id = $1 ORDER BY name", [id_departamento] ); 
    res.json(result.rows); 
  } catch (err) { 
    res.status(500).json({ error: "Error al obtener ciudades" }); 
  } 
});

module.exports = router;