const db = require("../db");

// ======================================================
//  📌 Crear una reserva de vuelo + agregar al carrito
// ======================================================
exports.reservarVuelo = async (req, res) => {
  try {
    const { idvuelo, idcliente, clase } = req.body;

    if (!idvuelo || !idcliente || !clase) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios (idvuelo, idcliente, clase)"
      });
    }

    // 1️⃣ Buscar asientos disponibles de esa clase
    const queryAsientos = `
      SELECT idasiento 
      FROM usuario.asientos
      WHERE idvuelo = $1
        AND clase = $2
        AND estado = 'disponible'
    `;
    const resultAsientos = await db.query(queryAsientos, [idvuelo, clase]);

    if (resultAsientos.rows.length === 0) {
      return res.status(400).json({
        mensaje: `No hay asientos disponibles en ${clase} para este vuelo`
      });
    }

    // 2️⃣ Seleccionar asiento aleatorio
    const randomIndex = Math.floor(Math.random() * resultAsientos.rows.length);
    const asientoAsignado = resultAsientos.rows[randomIndex].idasiento;

    // 3️⃣ Marcar asiento como ocupado
    await db.query(
      `UPDATE usuario.asientos SET estado = 'ocupado' WHERE idasiento = $1`,
      [asientoAsignado]
    );

    // 4️⃣ Crear tiquete
    const insertTiquete = `
      INSERT INTO usuario.tiquete (idvuelo, idcliente, clase, estado, idasiento)
      VALUES ($1, $2, $3, 'reservado', $4)
      RETURNING idtiquete
    `;

    const resultTiquete = await db.query(insertTiquete, [
      idvuelo,
      idcliente,
      clase,
      asientoAsignado
    ]);

    const idtiquete = resultTiquete.rows[0].idtiquete;

    // ======================================================
    //  🛒 GUARDAR EN CARRITO (NUEVA PARTE)
    // ======================================================
    const insertCarrito = `
      INSERT INTO usuario.carrito (idcliente, idtiquete, horacreacion)
      VALUES ($1, $2, NOW())
      RETURNING idcarrito
    `;

    const resultCarrito = await db.query(insertCarrito, [
      idcliente,
      idtiquete
    ]);

    // ======================================================
    //  ✅ RESPUESTA FINAL
    // ======================================================
    return res.status(201).json({
      mensaje: "Tiquete reservado y agregado al carrito",
      idtiquete,
      idasiento: asientoAsignado,
      idcarrito: resultCarrito.rows[0].idcarrito
    });

  } catch (error) {
    console.error("❌ Error al reservar vuelo:", error.message);
    res.status(500).json({
      mensaje: "Error al reservar vuelo",
      error: error.message
    });
  }
};
