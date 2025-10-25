// controllers/flightController.js
const Flight = require("../models/flightModel");
const { getDuration } = require("../utils/flightDurations");

const intlCities = ["Madrid", "Londres", "New york", "Buenos aires", "Miami"];
const intlGateways = ["Pereira", "Bogota", "Medellin", "Cali", "Cartagena"];

exports.createFlight = (req, res) => {
  try {
    const {
      origen,
      destino,
      fecha_salida,
      hora_salida,
      fecha_llegada,
      hora_llegada,
      costo_economico,
      costo_vip
    } = req.body;

    // Validación básica
    if (!origen || !destino || !fecha_salida || !hora_salida || !fecha_llegada || !hora_llegada) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    const duracion = getDuration(origen, destino);
    if (!duracion) return res.status(400).json({ mensaje: "Ruta no válida o no definida" });


    // Determinar tipo de vuelo
    const tipo_vuelo =
      intlCities.includes(origen) || intlCities.includes(destino)
        ? "internacional"
        : "nacional";

    // Validación de rutas internacionales
    if (tipo_vuelo === "internacional") {
      if (intlCities.includes(destino) && !intlGateways.includes(origen))
        return res.status(400).json({ mensaje: "Solo se puede salir al exterior desde ciudades principales" });

      if (intlCities.includes(origen) && !intlGateways.includes(destino))
        return res.status(400).json({ mensaje: "Los vuelos internacionales solo pueden llegar a ciudades colombianas principales" });
    }

    const data = {
      fecha_salida,
      hora_salida,
      fecha_llegada,
      hora_llegada,
      origen,
      destino,
      duracion,
      costo_vip,
      costo_economico,
      estado: "programado",
      tipo_vuelo,
    };

    Flight.create(data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ mensaje: "Error al crear vuelo" });
      }
      res.status(201).json({ mensaje: "Vuelo creado exitosamente", id: result.insertId });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
