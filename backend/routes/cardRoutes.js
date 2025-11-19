const express = require("express");
const router = express.Router();
const {
  getCards,
  addCard,
  rechargeBalance,
} = require("../controllers/cardController");
const verifyToken = require("../middleware/authMiddleware");

// -----------------------------------------------------------------
// APLICAMOS EL MIDDLEWARE A TODAS LAS RUTAS DE TARJETAS
// Nadie puede acceder a estas rutas sin un token válido.
router.use(verifyToken);
// -----------------------------------------------------------------

/**
 * @route GET /api/cards/
 * @desc Obtener todas las tarjetas del usuario logueado
 * @access Private
 */
router.get("/", getCards);

/**
 * @route POST /api/cards/
 * @desc Agregar una nueva tarjeta (monedero) al usuario
 * @access Private
 */
router.post("/", addCard);

/**
 * @route PUT /api/cards/:idtarjeta/recharge
 * @desc Recargar el saldo de una tarjeta específica
 * @access Private
 */
router.put("/:idtarjeta/recharge", rechargeBalance);

module.exports = router;