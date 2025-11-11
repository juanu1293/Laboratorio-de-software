const db = require("../db");

exports.searchFlights = async (req, res) => {
  try {
    const { origen, destino, fecha_salida, fecha_regreso, hora_busqueda } = req.query;
    console.log("🛰️ Parámetros recibidos:", { origen, destino, fecha_salida, fecha_regreso, hora_busqueda });

    const ciudadesExternas = ["Madrid", "New York", "Miami", "Londres", "Buenos Aires"];

    // 🕐 Convierte "HH:MM" o "HH:MM:SS" → minutos totales
    const horaToMin = (hora) => {
      if (!hora) return 0;
      const [h, m] = hora.split(":").map(Number);
      return h * 60 + m;
    };

    // 🔄 Aplica el filtro de hora mínima (en memoria)
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

    // ==========================================
    // 🔷 CASO 1: fecha_salida + fecha_regreso
    // ==========================================
    if (fecha_salida && fecha_regreso) {
      console.log("🔹 Caso 1: búsqueda de ida y regreso detectada");

      // --- Buscar vuelos de ida ---
      let queryIda = `SELECT * FROM usuario.vuelo WHERE fecha_salida = $1`;
      const paramsIda = [fecha_salida];
      let i = 2;

      if (origen) {
        queryIda += ` AND origen = $${i++}`;
        paramsIda.push(origen);
      }
      if (destino) {
        queryIda += ` AND destino = $${i++}`;
        paramsIda.push(destino);
      }

      queryIda += ` ORDER BY hora_salida ASC`;
      const resultIda = await db.query(queryIda, paramsIda);
      const vuelosIda = filtrarPorHora(resultIda.rows);

      // --- Buscar vuelos de regreso ---
      let queryRegreso = `SELECT * FROM usuario.vuelo WHERE fecha_salida = $1`;
      const paramsRegreso = [fecha_regreso];
      let j = 2;

      if (destino) {
        queryRegreso += ` AND origen = $${j++}`;
        paramsRegreso.push(destino);
      }
      if (origen) {
        queryRegreso += ` AND destino = $${j++}`;
        paramsRegreso.push(origen);
      }

      queryRegreso += ` ORDER BY hora_salida ASC`;
      const resultRegreso = await db.query(queryRegreso, paramsRegreso);
      const vuelosRegreso = resultRegreso.rows;

      return res.status(200).json({ vuelosIda, vuelosRegreso });
    }

    // ==========================================
    // 🔶 CASO 2: solo fecha_regreso
    // ==========================================
    if (fecha_regreso && !fecha_salida) {
      console.log("🔹 Caso 2: solo fecha de regreso");
      let vuelosIda = [];
      let vuelosRegreso = [];

      // Buscar vuelos de regreso
      let queryRegreso = `SELECT * FROM usuario.vuelo WHERE fecha_salida = $1`;
      const params = [fecha_regreso];
      let k = 2;
      if (origen) {
        queryRegreso += ` AND origen = $${k++}`;
        params.push(origen);
      }
      if (destino) {
        queryRegreso += ` AND destino = $${k++}`;
        params.push(destino);
      }

      queryRegreso += ` ORDER BY hora_salida ASC`;
      const resultRegreso = await db.query(queryRegreso, params);
      vuelosRegreso = resultRegreso.rows;

      // Buscar vuelos de ida previos (destino = origen de regreso)
      if (vuelosRegreso.length > 0) {
        const posiblesDestinosIda = [...new Set(vuelosRegreso.map(v => v.origen))];
        const queryIda = `
          SELECT * FROM usuario.vuelo
          WHERE fecha_salida < $1
            AND destino = ANY($2)
          ORDER BY fecha_salida DESC, hora_salida ASC
        `;
        const resultIda = await db.query(queryIda, [fecha_regreso, posiblesDestinosIda]);
        vuelosIda = filtrarPorHora(resultIda.rows);
      }

      return res.status(200).json({ vuelosIda, vuelosRegreso });
    }

    // ==========================================
    // 🔸 CASO 3: solo fecha_salida
    // ==========================================
    if (fecha_salida && !fecha_regreso) {
      console.log("🔹 Caso 3: solo fecha de salida");

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

    // ==========================================
    // ⚪ CASO 4: búsqueda genérica (sin fechas)
    // ==========================================
    console.log("⚪ Caso 4: búsqueda genérica sin fechas");
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
