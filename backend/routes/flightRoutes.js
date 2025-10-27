// routes/flightRoutes.js
const express = require("express");
const router = express.Router();
const { createFlight } = require("../controllers/flightController");
const verifyToken = require("../middleware/authMiddleware");

// Crear un vuelo (requiere autenticación)
router.post("/", verifyToken, createFlight);

module.exports = router;
