exports.resumenCompra = async (req, res) => {
  try {
    const { idtiquete } = req.body;

    const query = `
      SELECT 
        t.idtiquete,
        t.idvuelo,
        t.clase,
        t.tipo,
        t.conexion,
        v.origen,
        v.destino,
        v.costo_economico,
        v.costo_vip
        CASE 
          WHEN t.clase = 'vip' THEN v.costo_vip
          WHEN t.clase = 'economica' THEN v.costo_economico
          ELSE 0
        END as precio
      FROM usuario.tiquete t
      INNER JOIN usuario.vuelo v ON v.id_vuelo = t.idvuelo
      WHERE t.idtiquete = $1
    `;

    const result = await db.query(query, [idtiquete]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Tiquete no encontrado" });
    }

    const tiquete = result.rows[0];

    // ✅ Buscar pareja
    let idTiquetePareja = null;
    let multiplicador = 1;

    if (tiquete.tipo === "ida y vuelta") {
      const queryPareja = `
        SELECT t2.idtiquete
        FROM usuario.tiquete t2
        INNER JOIN usuario.carrito c2 ON c2.idtiquete = t2.idtiquete
        WHERE t2.conexion = $1 
          AND t2.tipo = 'ida y vuelta'
          AND t2.idtiquete != $2
        ORDER BY c2.horacreacion ASC
        LIMIT 1
      `;

      const pareja = await db.query(queryPareja, [tiquete.conexion, idtiquete]);

      if (pareja.rows.length > 0) {
        idTiquetePareja = pareja.rows[0].idtiquete;
        multiplicador = 2;
      }
    }

    let precioBase =
      tiquete.clase === "economica"
        ? tiquete.costo_economico
        : tiquete.costo_vip;

    const precioFinal = precioBase * multiplicador;

    return res.json({
      idtiquete,
      idTiquetePareja,
      origen: tiquete.origen,
      destino: tiquete.destino,
      clase: tiquete.clase,
      tipo: tiquete.tipo,
      precio: precioFinal
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en resumen de compra" });
  }
};


exports.pagarCompra = async (req, res) => {
  const client = await db.connect();

  try {
    const { idcliente, idtiquete, numtarjeta } = req.body;

    if (!idcliente || !idtiquete || !numtarjeta) {
      return res.status(400).json({ mensaje: "Datos incompletos" });
    }

    // ======================================================
    //  1️⃣ OBTENER DATOS DEL TIQUETE PRINCIPAL
    // ======================================================
    const tiqueteResult = await client.query(
      `SELECT t.idtiquete, t.idvuelo, t.clase, t.tipo, t.conexion
       FROM usuario.tiquete t
       WHERE t.idtiquete = $1`,
      [idtiquete]
    );

    if (tiqueteResult.rows.length === 0) {
      return res.status(404).json({ mensaje: "Tiquete no encontrado" });
    }

    const tiquete = tiqueteResult.rows[0];

    // ======================================================
    //  2️⃣ BUSCAR TIQUETE PAREJA (SI APLICA)
    // ======================================================
    let idTiquetePareja = null;
    let multiplicador = 1;

    if (tiquete.tipo === "ida y vuelta") {
      const parejaResult = await client.query(
        `SELECT t2.idtiquete 
         FROM usuario.tiquete t2
         INNER JOIN usuario.carrito c2 ON c2.idtiquete = t2.idtiquete
         WHERE t2.conexion = $1
           AND t2.tipo = 'ida y vuelta'
           AND t2.idtiquete != $2
         ORDER BY c2.horacreacion ASC
         LIMIT 1`,
        [tiquete.conexion, idtiquete]
      );

      if (parejaResult.rows.length > 0) {
        idTiquetePareja = parejaResult.rows[0].idtiquete;
        multiplicador = 2;
      }
    }

    // ======================================================
    //  3️⃣ OBTENER PRECIO DEL VUELO SEGÚN CLASE
    // ======================================================
    const precioVuelo = await client.query(
      `SELECT costo_economico, costo_vip 
       FROM usuario.vuelo
       WHERE id_vuelo = $1`,
      [tiquete.idvuelo]
    );

    const precioBase =
      tiquete.clase === "economica"
        ? precioVuelo.rows[0].costo_economico
        : precioVuelo.rows[0].costo_vip;

    const precioFinal = precioBase * multiplicador;

    // ======================================================
    //  4️⃣ VALIDAR TARJETA (SALDO, NO MONTO)
    // ======================================================
    const tarjetaResult = await client.query(
      `SELECT saldo, tipo 
       FROM usuario.tarjeta 
       WHERE numtarjeta = $1`,
      [numtarjeta]
    );

    if (tarjetaResult.rows.length === 0) {
      return res.status(404).json({ mensaje: "Tarjeta no encontrada" });
    }

    const { saldo, tipo } = tarjetaResult.rows[0];

    if (saldo < precioFinal) {
      return res.status(400).json({ mensaje: "Fondos insuficientes" });
    }

    // ======================================================
    //  ✅ 5️⃣ INICIO DE TRANSACCIÓN
    // ======================================================
    await client.query("BEGIN");

    // ✅ Descontar saldo UNA SOLA VEZ
    await client.query(
      `UPDATE usuario.tarjeta 
       SET saldo = saldo - $1 
       WHERE numtarjeta = $2`,
      [precioFinal, numtarjeta]
    );

    // ======================================================
    //  ✅ REGISTRAR PAGO DEL PRIMER TIQUETE
    // ======================================================
    await client.query(
      `INSERT INTO usuario.pago 
       (idcliente, idtiquete, monto, fechapago, metodopago, estado)
       VALUES ($1, $2, $3, NOW(), $4, 'pagado')`,
      [idcliente, idtiquete, precioBase, tipo]
    );

    // ✅ Marcar TIQUETE como PAGADO
    await client.query(
      `UPDATE usuario.tiquete 
       SET estado = 'pagado' 
       WHERE idtiquete = $1`,
      [idtiquete]
    );

    // ✅ Quitar del carrito
    await client.query(
      `DELETE FROM usuario.carrito 
       WHERE idtiquete = $1`,
      [idtiquete]
    );

    // ======================================================
    //  ✅ SI EXISTE PAREJA, TAMBIÉN SE PROCESA
    // ======================================================
    if (idTiquetePareja) {
      await client.query(
        `INSERT INTO usuario.pago 
         (idcliente, idtiquete, monto, fechapago, metodopago, estado)
         VALUES ($1, $2, $3, NOW(), $4, 'pagado')`,
        [idcliente, idTiquetePareja, precioBase, tipo]
      );

      await client.query(
        `UPDATE usuario.tiquete 
         SET estado = 'pagado' 
         WHERE idtiquete = $1`,
        [idTiquetePareja]
      );

      await client.query(
        `DELETE FROM usuario.carrito 
         WHERE idtiquete = $1`,
        [idTiquetePareja]
      );
    }

    // ======================================================
    //  ✅ 6️⃣ CONFIRMAR TRANSACCIÓN
    // ======================================================
    await client.query("COMMIT");

    return res.json({
      mensaje: "✅ Pago realizado correctamente",
      total_pagado: precioFinal,
      tiquete_principal: idtiquete,
      tiquete_pareja: idTiquetePareja
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en pago:", error.message);
    res.status(500).json({ mensaje: "Error al procesar el pago" });
  } finally {
    client.release();
  }
};

