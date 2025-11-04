// routes/auth.js
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { updateUserController } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const { forgotPassword, resetPassword } = require("../controllers/authController");
const { createAdminController } = require("../controllers/authController");
const { getCurrentUser } = require("../controllers/authController");

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

// Solo usuarios con rol root pueden crear administradores
router.post("/create-admin", verifyToken, createAdminController);

router.get("/me", verifyToken, getCurrentUser);

module.exports = router;
