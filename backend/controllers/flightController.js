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


