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
        t.conexion
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
    //  4️⃣ CONSULTAR SOLO LOS TIQUETES VIGENTES
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
        v.fecha_llegada,
        v.hora_llegada,
        a.numeroasiento,
        c.horacreacion
      FROM usuario.carrito c
      INNER JOIN usuario.tiquete t ON t.idtiquete = c.idtiquete
      INNER JOIN usuario.vuelo v ON v.id_vuelo = t.idvuelo
      INNER JOIN usuario.asientos a ON a.idasiento = t.idasiento
      WHERE c.idcliente = $1
      ORDER BY c.horacreacion ASC
    `;

    const carritoFinal = await db.query(queryFinal, [idcliente]);

    return res.status(200).json({
      carrito: carritoFinal.rows,
      grupos_conectados: grupos
    });

  } catch (error) {
    console.error("❌ Error al obtener carrito:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener carrito",
      error: error.message
    });
  }
};
