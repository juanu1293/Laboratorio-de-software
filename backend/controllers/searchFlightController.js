// controllers/flightController.js
const db = require("../db");

exports.searchFlights = async (req, res) => {
  try {
    const { origen, destino, fecha_salida } = req.query;
    console.log("🛰️ Parámetros recibidos:", { origen, destino, fecha_salida });


    // Verificar campos obligatorios
    if (!origen || !destino || !fecha_salida) {
      return res
        .status(400)
        .json({ mensaje: "Faltan parámetros de búsqueda" });
    }

    // Consulta a la tabla de vuelos (PostgreSQL + esquema usuario)
    const query = `
      SELECT 
        id_vuelo,
        origen,
        destino,
        fecha_salida,
        hora_salida,
        fecha_llegada,
        hora_llegada,
        TO_CHAR(duracion, 'HH24:MI:SS') AS duracion, -- <-- Esta línea cambió
        costo_vip,
        costo_economico,
        tipo_vuelo,
        estado
      FROM usuario.vuelo
      WHERE origen = $1 
        AND destino = $2 
        AND fecha_salida = $3
      ORDER BY hora_salida ASC
    `;

    const result = await db.query(query, [origen, destino, fecha_salida]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron vuelos" });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al buscar vuelos:", error.message);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};
