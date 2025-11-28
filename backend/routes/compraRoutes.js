const express = require("express");
const router = express.Router();
const compraController = require("../controllers/compraController");

// ======================================================
//  📌 RESUMEN DE COMPRA (ANTES DE PAGAR)
// ======================================================
router.post("/resumen", compraController.resumenCompra);

// ======================================================
//  💳 PAGAR COMPRA (TRANSACCIÓN + PAREJA)
// ======================================================
router.post("/pagar", compraController.pagarCompra);

module.exports = router;
