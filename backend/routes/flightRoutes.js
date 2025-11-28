// routes/flightRoutes.js
const express = require("express");
const router = express.Router();
const { createFlight, checkFlightSeats, updateFlight, getFlights } = require("../controllers/flightController"); // Asegúrate de importar las nuevas funciones
const verifyToken = require("../middleware/authMiddleware");

// Rutas existentes
router.get("/", getFlights); // <--- ESTA ES LA NUEVA (Obtener lista real)
router.post("/", verifyToken, createFlight);

// NUEVAS RUTAS
router.get("/:id/check-seats", verifyToken, checkFlightSeats); // Verificar asientos
router.put("/:id", verifyToken, updateFlight); // Actualizar vuelo

module.exports = router;
