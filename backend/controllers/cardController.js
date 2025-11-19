const cardModel = require("../models/cardModel");

exports.getCards = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario; 
    const cards = await cardModel.findCardsByUserId(id_usuario);
    res.status(200).json(cards);
  } catch (error) {
    console.error("Error en getCards:", error);
    res.status(500).json({ error: "Error en el servidor al obtener tarjetas" });
  }
};

exports.addCard = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const {
      numtarjeta,
      tipo,
      fecha_expiracion, // Nuevo nombre
      cvv,
      nombrepersona,
      // 'banco' ha sido eliminado
    } = req.body;

    // 1. Validar campos obligatorios (Sin banco)
    if (
      !numtarjeta || !tipo || !fecha_expiracion || !cvv || !nombrepersona ||
      numtarjeta.trim() === "" || tipo.trim() === "" ||
      fecha_expiracion.trim() === "" || cvv.trim() === "" || nombrepersona.trim() === ""
    ) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }

    // 2. Validar CVV (AHORA SOLO 3 DÍGITOS)
    if (!/^\d{3}$/.test(cvv)) {
        return res.status(400).json({ 
          error: "El CVV debe tener exactamente 3 dígitos numéricos" 
        });
    }
    
    // 3. Validar Fecha Expiración (MM/AA)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fecha_expiracion)) {
        return res.status(400).json({ 
          error: "La fecha de expiración debe estar en formato MM/AA (ej: 12/28)" 
        });
    }

    const newCard = await cardModel.createCard({
      idcliente: id_usuario,
      numtarjeta,
      tipo,
      fecha_expiracion, // Enviamos el nuevo nombre
      cvv,
      nombrepersona,
    });

    res.status(201).json(newCard);

  } catch (error) {
    console.error("Error en addCard:", error);
    res.status(500).json({ error: "Error en el servidor al agregar tarjeta" });
  }
};

// ... (rechargeBalance sigue igual) ...
exports.rechargeBalance = async (req, res) => {
  // ... Copia el código de rechargeBalance que ya tenías, no cambia nada ...
  try {
    const id_usuario = req.user.id_usuario;
    const { idtarjeta } = req.params;
    const { monto } = req.body; 

    if (!monto || typeof monto !== 'number' || monto <= 0) {
      return res.status(400).json({ 
        error: "Debe proporcionar un 'monto' numérico positivo para recargar" 
      });
    }

    const card = await cardModel.findCardById(idtarjeta);
    if (!card) {
      return res.status(404).json({ error: "Tarjeta no encontrada" });
    }

    if (card.idcliente !== id_usuario) {
      return res.status(403).json({ 
        error: "No tiene permisos para modificar esta tarjeta" 
      });
    }

    const saldoActual = parseFloat(card.saldo);
    const montoRecarga = parseFloat(monto);
    const nuevoSaldo = saldoActual + montoRecarga;

    const updatedCard = await cardModel.updateBalance(idtarjeta, nuevoSaldo);

    res.status(200).json({
      mensaje: "Saldo actualizado exitosamente",
      tarjeta: updatedCard,
    });

  } catch (error) {
    console.error("Error en rechargeBalance:", error);
    res.status(500).json({ error: "Error en el servidor al recargar saldo" });
  }
};