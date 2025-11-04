// server.js
const express = require("express");
const cors = require("cors");
const verifyToken = require("./middleware/authMiddleware");
const dotenv = require("dotenv");


dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: "http://localhost:5173", // puerto de tu frontend
  credentials: true
}));
app.use(express.json()); // Para recibir JSON en requests

// Rutas
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);


app.get("/api/perfil", verifyToken, (req, res) => {
  res.json({
    mensaje: "Accediste a un endpoint protegido",
    usuario: req.user,
  });
});

const locationRoutes = require("./routes/locationRoutes");
app.use("/api/location", locationRoutes);

const flightRoutes = require("./routes/flightRoutes");
app.use("/api/flights", flightRoutes);

const searchFlightsRoutes = require("./routes/searchFlightRoutes");
app.use("/api/search-flights", searchFlightsRoutes);


// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
