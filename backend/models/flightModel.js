// models/flightModel.js
const db = require("../db");

const Flight = {
  create: (data, callback) => {
    const query = `
      INSERT INTO vuelos 
      (fecha_salida, hora_salida, fecha_llegada, hora_llegada, origen, destino, duracion, costo_vip, costo_economico, estado, tipo_vuelo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [
      data.fecha_salida,
      data.hora_salida,
      data.fecha_llegada,
      data.hora_llegada,
      data.origen,
      data.destino,
      data.duracion,
      data.costo_vip,
      data.costo_economico,
      data.estado,
      data.tipo_vuelo
    ], callback);
  },
};

module.exports = Flight;
