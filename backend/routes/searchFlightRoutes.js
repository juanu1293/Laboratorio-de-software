const express = require("express");
const router = express.Router();
const { searchFlights } = require("../controllers/searchFlightController");

// Buscar vuelos (capacidad incluida)
router.get("/", searchFlights);

module.exports = router;
