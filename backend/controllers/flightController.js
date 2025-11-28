const db = require("../db");
const { getDuration } = require("../utils/flightDurations");

exports.createFlight = async (req, res) => {
  const {
    origen,
    destino,
    fecha_salida,
    hora_salida,
    fecha_llegada,
    hora_llegada,
    costo_economico,
    costo_vip,
    tipo_vuelo,
  } = req.body;

  // Validación de campos obligatorios
  if (
    !origen ||
    !destino ||
    !fecha_salida ||
    !hora_salida ||
    !costo_economico ||
    !costo_vip ||
    !tipo_vuelo
  ) {
    return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
  }

  // ✅ Obtener duración según origen y destino
  const duracion = getDuration(origen, destino);

  if (!duracion) {
    return res.status(400).json({
      mensaje: `No se encontró duración para el vuelo ${origen} → ${destino}.`,
    });
  }

  // Si es solo ida, usar la misma fecha/hora como llegada
  const fechaLlegadaFinal =
    tipo_vuelo === "solo_ida" ? fecha_salida : fecha_llegada;
  const horaLlegadaFinal =
    tipo_vuelo === "solo_ida" ? hora_salida : hora_llegada;

  // Consulta SQL
  const query = `
    INSERT INTO usuario.vuelo (
      origen, destino, fecha_salida, hora_salida,
      fecha_llegada, hora_llegada,
      costo_economico, costo_vip, tipo_vuelo,
      estado, duracion
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'activo', $10)
    RETURNING id_vuelo
  `;

  try {
    const result = await db.query(query, [
      origen,
      destino,
      fecha_salida,
      hora_salida,
      fechaLlegadaFinal,
      horaLlegadaFinal,
      costo_economico,
      costo_vip,
      tipo_vuelo,
      duracion, // ✅ duración calculada
    ]);

    // ======================================================
    //  🔹 CREAR ASIENTOS AUTOMÁTICAMENTE CUANDO SE CREA EL VUELO
    // ======================================================
    const idVuelo = result.rows[0].id_vuelo;

    // Lista de ciudades internacionales
    const internacionales = ["madrid", "londres", "new york", "buenos aires", "miami"];

    // Detectar si el vuelo es internacional
    const esInternacional =
      internacionales.includes(origen.toLowerCase()) ||
      internacionales.includes(destino.toLowerCase());

    // Definir número de asientos
    const totalAsientos = esInternacional ? 250 : 150;
    const primeraClaseLimite = esInternacional ? 50 : 25;

    // Crear asientos con número tipo VARCHAR(5)
    for (let i = 1; i <= totalAsientos; i++) {
      const clase = i <= primeraClaseLimite ? "vip" : "economica";

      // Genera string de 5 caracteres: 1 → "00001"
      const numeroAsiento = String(i).padStart(5, "0");

      await db.query(
        `INSERT INTO usuario.asiento (idvuelo, numeroasiento, clase, estado)
        VALUES ($1, $2, $3, 'disponible')`,
        [idVuelo, numeroAsiento, clase]
      );
    }

    console.log(`🪑 ${totalAsientos} asientos creados para el vuelo ${idVuelo}`);
    // ======================================================
    //  📰 CREAR NOTICIA AUTOMÁTICAMENTE DEL NUEVO VUELO
    // ======================================================
    const titulo = `Nuevo vuelo desde ${destino} hasta ${origen}`;
    const descripcion = `Aprovecha para viajar desde ${destino} a ${origen} por solo ${costo_economico} o si quieres una experiencia mas agradable puedes viajar en nuestra primera clase por solo ${costo_vip} y disfruta con nosotros de este emocionante viaje`;

    await db.query(
      `INSERT INTO usuario.noticia 
        (idadmin, titulo, descripcion, fechapublicacion, tipo)
       VALUES (NULL, $1, $2, NOW(), 'vuelo')`,
      [titulo, descripcion]
    );

    res.status(201).json({
      mensaje: "✅ Vuelo creado correctamente",
      id_vuelo: result.rows[0].id_vuelo,
      duracion,
    });
  } catch (error) {
    console.error("❌ Error al insertar vuelo:", error.message);
    res.status(500).json({
      mensaje: "Error al crear vuelo",
      error: error.message,
    });
  }
};

// ==========================================
// 2. VERIFICAR ASIENTOS (Requerido por flightRoutes.js)
// ==========================================
exports.checkFlightSeats = async (req, res) => {
  const { id } = req.params;

  try {
    // Evitar error con IDs locales grandes
    if (Number(id) > 2147483647 || isNaN(id)) {
      return res.json({ occupiedSeats: 0, canEditSensitiveData: true });
    }

    const query = `
      SELECT COUNT(*) 
      FROM usuario.asiento 
      WHERE idvuelo = $1 AND estado != 'disponible'
    `;
    
    const result = await db.query(query, [id]);
    const occupiedSeats = parseInt(result.rows[0].count);

    res.json({
      occupiedSeats: occupiedSeats,
      canEditSensitiveData: occupiedSeats === 0 
    });

  } catch (error) {
    console.error("Error verificando asientos:", error);
    res.status(500).json({ mensaje: "Error al verificar asientos" });
  }
};

// ==========================================
// 3. ACTUALIZAR VUELO (Tabla SINGULAR: usuario.vuelo)
// ==========================================
exports.updateFlight = async (req, res) => {
  const { id } = req.params;
  const { costo_economico, costo_vip, fecha_salida, hora_salida, estado } = req.body;

  try {
    // Si es un vuelo local (ID gigante), devolvemos error 400 controlado
    if (Number(id) > 2147483647 || isNaN(id)) {
      return res.status(400).json({ 
        mensaje: "No se puede editar este vuelo porque es local. Recarga la página." 
      });
    }

    const query = `
      UPDATE usuario.vuelo 
      SET costo_economico = $1, 
          costo_vip = $2, 
          fecha_salida = $3, 
          hora_salida = $4, 
          estado = $5
      WHERE id_vuelo = $6
      RETURNING *
    `;

    const result = await db.query(query, [
      costo_economico, costo_vip, fecha_salida, hora_salida, estado, id 
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Vuelo no encontrado en la base de datos" });
    }

    res.json({ mensaje: "Vuelo actualizado correctamente", vuelo: result.rows[0] });

  } catch (error) {
    console.error("Error actualizando vuelo:", error);
    res.status(500).json({ mensaje: "Error interno: " + error.message });
  }
};

// OBTENER TODOS LOS VUELOS (Para llenar la tabla)
exports.getFlights = async (req, res) => {
  try {
    // Seleccionamos de la tabla singular 'usuario.vuelo'
    const result = await db.query("SELECT * FROM usuario.vuelo ORDER BY id_vuelo DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo vuelos:", error);
    res.status(500).json({ mensaje: "Error al obtener la lista de vuelos" });
  }

};
