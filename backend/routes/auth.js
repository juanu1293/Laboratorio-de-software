// routes/auth.js
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { updateUserController } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const { forgotPassword, resetPassword } = require("../controllers/authController");

const router = express.Router();

// Registro
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Actualizar
router.put("/update", verifyToken, updateUserController);

// Olvidé mi contraseña
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
