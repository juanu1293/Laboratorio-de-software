const db = require("../db");

// ======================================================
//  🛒 Obtener carrito por usuario + unir ida/vuelta + limpiar vencidos
// ======================================================
exports.obtenerCarritoPorUsuario = async (req, res) => {
  try {
    const { idcliente } = req.params;

    if (!idcliente) {
      return res.status(400).json({
        mensaje: "El idcliente es obligatorio"
      });
    }

    // ======================================================
    //  1️⃣ Obtener tiquetes del carrito
    // ======================================================
    const queryCarrito = `
      SELECT 
        c.idtiquete,
        c.horacreacion,
        t.idasiento,
        t.tipo,
        t.conexion,
        t.clase,
        t.idvuelo
      FROM usuario.carrito c
      INNER JOIN usuario.tiquete t ON t.idtiquete = c.idtiquete
      WHERE c.idcliente = $1
      ORDER BY c.horacreacion ASC
    `;

    const resultCarrito = await db.query(queryCarrito, [idcliente]);

    // ======================================================
    //  2️⃣ AGRUPAR TIQUETES EN PAREJAS IDA Y VUELTA
    // ======================================================
    const parejas = [];
    const usados = new Set();

    for (let i = 0; i < resultCarrito.rows.length; i++) {
      if (usados.has(i)) continue;

      const t1 = resultCarrito.rows[i];
      const fecha1 = new Date(t1.horacreacion);

      if (t1.tipo !== "ida y vuelta") continue;

      for (let j = i + 1; j < resultCarrito.rows.length; j++) {
        if (usados.has(j)) continue;

        const t2 = resultCarrito.rows[j];
        const fecha2 = new Date(t2.horacreacion);

        if (t2.tipo !== "ida y vuelta") continue;

        const diffMin = Math.abs(fecha2 - fecha1) / (1000 * 60);

        if (
          diffMin <= 10 &&
          t1.conexion === t2.conexion
        ) {
          parejas.push([t1, t2]);
          usados.add(i);
          usados.add(j);
          break;
        }
      }
    }

    // ======================================================
    //  3️⃣ VALIDAR VENCIMIENTO POR PAREJA (24 HORAS)
    // ======================================================
    const ahora = new Date();

    for (const pareja of parejas) {
      let eliminarPareja = false;

      for (const item of pareja) {
        const horaCreacion = new Date(item.horacreacion);
        const diferenciaHoras =
          (ahora.getTime() - horaCreacion.getTime()) / (1000 * 60 * 60);

        if (diferenciaHoras > 24) {
          eliminarPareja = true;
          break;
        }
      }

      // ✅ SI UNO SE VENCE → SE ELIMINAN LOS DOS
      if (eliminarPareja) {
        for (const item of pareja) {
          console.log(`⏱️ Eliminando tiquete vencido: ${item.idtiquete}`);

          // Liberar asiento
          await db.query(
            `UPDATE usuario.asientos 
            SET estado = 'disponible'
            WHERE idasiento = $1`,
            [item.idasiento]
          );

          // Eliminar del carrito
          await db.query(
            `DELETE FROM usuario.carrito WHERE idtiquete = $1`,
            [item.idtiquete]
          );

          // Eliminar el tiquete
          await db.query(
            `DELETE FROM usuario.tiquete WHERE idtiquete = $1`,
            [item.idtiquete]
          );
        }
      }
    }

    // ======================================================
    //  4️⃣ CONSULTAR SOLO LOS TIQUETES VIGENTES CON PRECIO
    // ======================================================
    const queryFinal = `
      SELECT 
        t.idtiquete,
        t.tipo,
        t.conexion,
        t.clase,
        t.estado,
        v.origen,
        v.destino,
        v.fecha_salida,
        v.hora_salida,
        v.duracion,
        v.costo_economico,
        v.costo_vip,
        a.numeroasiento,
        c.horacreacion,
        CASE 
          WHEN t.clase = 'vip' THEN v.costo_vip
          WHEN t.clase = 'economica' THEN v.costo_economico
          ELSE 0
        END as precio
      FROM usuario.carrito c
      INNER JOIN usuario.tiquete t ON t.idtiquete = c.idtiquete
      INNER JOIN usuario.vuelo v ON v.id_vuelo = t.idvuelo
      INNER JOIN usuario.asiento a ON a.idasiento = t.idasiento
      WHERE c.idcliente = $1
      ORDER BY c.horacreacion ASC
    `;

    const carritoFinal = await db.query(queryFinal, [idcliente]);

    return res.status(200).json({
      carrito: carritoFinal.rows,
      grupos_conectados: parejas
    });

  } catch (error) {
    console.error("❌ Error al obtener carrito:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener carrito",
      error: error.message
    });
  }
};

// ======================================================
//  🗑️ Eliminar reserva del carrito
// ======================================================
exports.eliminarReserva = async (req, res) => {
  try {
    const { idtiquete } = req.params;

    if (!idtiquete) {
      return res.status(400).json({
        mensaje: "El idtiquete es obligatorio"
      });
    }

    // ======================================================
    //  1️⃣ Obtener información del tiquete antes de eliminar
    // ======================================================
    const queryTiquete = `
      SELECT 
        t.idasiento,
        t.tipo,
        t.conexion
      FROM usuario.tiquete t
      WHERE t.idtiquete = $1
    `;

    const resultTiquete = await db.query(queryTiquete, [idtiquete]);

    if (resultTiquete.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Tiquete no encontrado"
      });
    }

    const tiquete = resultTiquete.rows[0];

    // ======================================================
    //  2️⃣ Si es tipo "ida y vuelta", buscar y eliminar el tiquete conectado
    // ======================================================
    let tiqueteConectado = null;

    if (tiquete.tipo === "ida y vuelta" && tiquete.conexion) {
      const queryConectado = `
        SELECT idtiquete, idasiento
        FROM usuario.tiquete 
        WHERE conexion = $1 AND idtiquete != $2 AND tipo = 'ida y vuelta'
      `;

      const resultConectado = await db.query(queryConectado, [tiquete.conexion, idtiquete]);
      
      if (resultConectado.rows.length > 0) {
        tiqueteConectado = resultConectado.rows[0];
      }
    }

    // ======================================================
    //  3️⃣ Liberar asientos y eliminar registros
    // ======================================================
    await db.query('BEGIN');

    try {
      // Liberar asiento del tiquete principal
      await db.query(
        `UPDATE usuario.asientos 
        SET estado = 'disponible'
        WHERE idasiento = $1`,
        [tiquete.idasiento]
      );

      // Liberar asiento del tiquete conectado si existe
      if (tiqueteConectado) {
        await db.query(
          `UPDATE usuario.asientos 
          SET estado = 'disponible'
          WHERE idasiento = $1`,
          [tiqueteConectado.idasiento]
        );

        // Eliminar tiquete conectado del carrito
        await db.query(
          `DELETE FROM usuario.carrito WHERE idtiquete = $1`,
          [tiqueteConectado.idtiquete]
        );

        // Eliminar tiquete conectado
        await db.query(
          `DELETE FROM usuario.tiquete WHERE idtiquete = $1`,
          [tiqueteConectado.idtiquete]
        );
      }

      // Eliminar tiquete principal del carrito
      await db.query(
        `DELETE FROM usuario.carrito WHERE idtiquete = $1`,
        [idtiquete]
      );

      // Eliminar tiquete principal
      await db.query(
        `DELETE FROM usuario.tiquete WHERE idtiquete = $1`,
        [idtiquete]
      );

      await db.query('COMMIT');

      console.log(`✅ Reserva eliminada exitosamente: ${idtiquete}`);
      if (tiqueteConectado) {
        console.log(`✅ Tiquete conectado eliminado: ${tiqueteConectado.idtiquete}`);
      }

      return res.status(200).json({
        mensaje: "Reserva eliminada exitosamente",
        tiquetesEliminados: tiqueteConectado ? [idtiquete, tiqueteConectado.idtiquete] : [idtiquete]
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error("❌ Error al eliminar reserva:", error.message);
    res.status(500).json({
      mensaje: "Error al eliminar reserva",
      error: error.message
    });
  }
};
