const express = require("express");
const router = express.Router();
const { obtenerCarritoPorUsuario } = require("../controllers/carritoController");

router.get("/:idcliente", obtenerCarritoPorUsuario);

module.exports = router;
