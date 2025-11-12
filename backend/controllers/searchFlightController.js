const db = require("../db");

exports.searchFlights = async (req, res) => {
  try {
    const { origen, destino, fecha_salida, fecha_regreso, hora_busqueda, tipo_viaje } = req.query;
    console.log("🛰️ Parámetros recibidos:", { origen, destino, fecha_salida, fecha_regreso, hora_busqueda, tipo_viaje });

    const ciudadesExternas = ["Madrid", "New York", "Miami", "Londres", "Buenos Aires"];

    // 🕐 Convierte "HH:MM" o "HH:MM:SS" → minutos totales
    const horaToMin = (hora) => {
      if (!hora) return 0;
      const [h, m] = hora.split(":").map(Number);
      return h * 60 + m;
    };

    // 🔄 Aplica el filtro de hora mínima en memoria
    const filtrarPorHora = (vuelos) => {
      if (!hora_busqueda) return vuelos;
      const base = horaToMin(hora_busqueda);

      return vuelos.filter(v => {
        const esInternacional =
          ciudadesExternas.includes(v.origen) || ciudadesExternas.includes(v.destino);
        const margen = esInternacional ? 180 : 60; // 3h o 1h
        const salida = horaToMin(v.hora_salida);
        return salida >= base + margen;
      });
    };

    // 🔹 Función auxiliar para buscar vuelos (genérica)
    const buscarVuelos = async (fecha, filtroExtra = "") => {
      let query = `SELECT * FROM usuario.vuelo WHERE fecha_salida = $1 ${filtroExtra}`;
      const result = await db.query(query, [fecha]);
      return result.rows;
    };

    // ==========================================
    // 🔷 CASO: tipo_viaje = soloida
    // ==========================================
    if (tipo_viaje === "soloida") {
      console.log("✈️ Buscando solo vuelos de ida");

      let query = `SELECT * FROM usuario.vuelo WHERE 1=1`;
      const params = [];
      let i = 1;

      if (fecha_salida) {
        query += ` AND fecha_salida = $${i++}`;
        params.push(fecha_salida);
      }
      if (origen) {
        query += ` AND origen = $${i++}`;
        params.push(origen);
      }
      if (destino) {
        query += ` AND destino = $${i++}`;
        params.push(destino);
      }

      query += ` ORDER BY fecha_salida ASC, hora_salida ASC`;
      const result = await db.query(query, params);
      const vuelosFiltrados = filtrarPorHora(result.rows);

      return res.status(200).json({ vuelosIda: vuelosFiltrados, vuelosRegreso: [] });
    }

    // ==========================================
    // 🔶 CASO: tipo_viaje = idayvuelta
    // ==========================================
    if (tipo_viaje === "idayvuelta") {
      console.log("✈️ Buscando vuelos de ida y regreso");

      // Buscar vuelos de ida
      let queryIda = `SELECT * FROM usuario.vuelo WHERE 1=1`;
      const paramsIda = [];
      let j = 1;

      if (fecha_salida) {
        queryIda += ` AND fecha_salida = $${j++}`;
        paramsIda.push(fecha_salida);
      }
      if (origen) {
        queryIda += ` AND origen = $${j++}`;
        paramsIda.push(origen);
      }
      if (destino) {
        queryIda += ` AND destino = $${j++}`;
        paramsIda.push(destino);
      }

      queryIda += ` ORDER BY fecha_salida ASC, hora_salida ASC`;
      const resultIda = await db.query(queryIda, paramsIda);
      const vuelosIda = filtrarPorHora(resultIda.rows);

      // Buscar vuelos de regreso solo si hay información para hacerlo
      let vuelosRegreso = [];
      if (vuelosIda.length > 0 || fecha_regreso) {
        let queryRegreso = `SELECT * FROM usuario.vuelo WHERE 1=1`;
        const paramsRegreso = [];
        let k = 1;

        if (fecha_regreso) {
          queryRegreso += ` AND fecha_salida = $${k++}`;
          paramsRegreso.push(fecha_regreso);
        }
        if (destino) {
          queryRegreso += ` AND origen = $${k++}`;
          paramsRegreso.push(destino);
        }
        if (origen) {
          queryRegreso += ` AND destino = $${k++}`;
          paramsRegreso.push(origen);
        }

        queryRegreso += ` ORDER BY fecha_salida ASC, hora_salida ASC`;
        const resultRegreso = await db.query(queryRegreso, paramsRegreso);
        vuelosRegreso = resultRegreso.rows;
      }

      return res.status(200).json({ vuelosIda, vuelosRegreso });
    }

    // ==========================================
    // 🔸 CASO: sin tipo_viaje (buscar por fechas sueltas)
    // ==========================================
    console.log("⚪ Caso genérico sin tipo_viaje");

    if (fecha_salida && !fecha_regreso) {
      // Solo vuelos de salida
      let query = `SELECT * FROM usuario.vuelo WHERE fecha_salida = $1`;
      const params = [fecha_salida];
      let t = 2;

      if (origen) {
        query += ` AND origen = $${t++}`;
        params.push(origen);
      }
      if (destino) {
        query += ` AND destino = $${t++}`;
        params.push(destino);
      }

      query += ` ORDER BY hora_salida ASC`;
      const result = await db.query(query, params);
      const vuelosFiltrados = filtrarPorHora(result.rows);

      return res.status(200).json({ vuelosIda: vuelosFiltrados, vuelosRegreso: [] });
    }

    if (fecha_regreso && !fecha_salida) {
      // Solo vuelos de regreso
      let query = `SELECT * FROM usuario.vuelo WHERE fecha_salida = $1`;
      const params = [fecha_regreso];
      let u = 2;

      if (origen) {
        query += ` AND origen = $${u++}`;
        params.push(origen);
      }
      if (destino) {
        query += ` AND destino = $${u++}`;
        params.push(destino);
      }

      query += ` ORDER BY hora_salida ASC`;
      const result = await db.query(query, params);

      return res.status(200).json({ vuelosIda: [], vuelosRegreso: result.rows });
    }

    // ==========================================
    // 🟤 CASO: sin fechas, buscar genérico
    // ==========================================
    let query = `SELECT * FROM usuario.vuelo WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (origen) {
      query += ` AND origen = $${idx++}`;
      params.push(origen);
    }
    if (destino) {
      query += ` AND destino = $${idx++}`;
      params.push(destino);
    }

    query += ` ORDER BY fecha_salida ASC, hora_salida ASC`;
    const result = await db.query(query, params);
    const vuelosFiltrados = filtrarPorHora(result.rows);

    return res.status(200).json({ vuelosIda: vuelosFiltrados, vuelosRegreso: [] });

  } catch (error) {
    console.error("❌ Error al buscar vuelos:", error.message);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};
