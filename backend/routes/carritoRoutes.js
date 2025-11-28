const express = require("express");
const router = express.Router();
const { 
  obtenerCarritoPorUsuario, 
  eliminarReserva 
} = require("../controllers/carritoController");

router.get("/:idcliente", obtenerCarritoPorUsuario);
router.delete("/reserva/:idtiquete", eliminarReserva);

module.exports = router;

