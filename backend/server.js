// server.js
const express = require("express");
const cors = require("cors");
const verifyToken = require("./middleware/authMiddleware");
const dotenv = require("dotenv");


dotenv.config();

const app = express();

// Configuración de CORS para múltiples orígenes
const allowedOrigins = [
  "http://localhost:5173",      // Desarrollo local
  "http://localhost:3000",      // Alternativo desarrollo
  process.env.FRONTEND_URL,     // URL del frontend en Render
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json()); // Para recibir JSON en requests
app.use(express.urlencoded({ extended: true })); // Para datos urlencoded

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

const cardRoutes = require("./routes/cardRoutes");
app.use("/api/cards", cardRoutes);  

const searchFlightsRoutes = require("./routes/searchFlightRoutes");
app.use("/api/search-flights", searchFlightsRoutes);

const tiqueteRoutes = require("./routes/tiqueteRoutes");
app.use("/api/tiquetes", tiqueteRoutes);

const carritoRoutes = require("./routes/carritoRoutes");
app.use("/api/carrito", carritoRoutes);

const compraRoutes = require("./routes/compraRoutes");
app.use("/api/compra", compraRoutes);

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
