const express = require("express");
const router = express.Router();
const { reservarVuelo } = require("../controllers/tiqueteController");

router.post("/reservar", reservarVuelo);

module.exports = router;
