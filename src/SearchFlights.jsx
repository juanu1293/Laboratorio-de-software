import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";

function SearchFlights() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state || {};

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userName, setUserName] = useState("Usuario");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = () => {
      const authToken =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const userData =
        localStorage.getItem("userData") || sessionStorage.getItem("userData");

      if (authToken && userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.nombre || "Usuario");
          setUserRole(user.tipo_usuario || user.role || "Usuario");
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };

    checkAuth();
  }, []);

  // 🔥 NUEVA FUNCIÓN: Verificar si es admin
  const isAdminUser = () => {
    const adminRoles = ["Administrador", "administrador", "admin", "root"];
    return adminRoles.includes(userRole);
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    navigate("/");
  };

  // Obtener vuelos desde el backend - CON DEBUG
  const fetchFlights = async () => {
    const departureDateSQL =
      searchParams.departureDateSQL ||
      (searchParams.departureDate
        ? new Date(searchParams.departureDate).toISOString().split("T")[0]
        : null);

    if (
      !searchParams.origin ||
      !searchParams.destination ||
      !departureDateSQL
    ) {
      setErrorMsg("Faltan parámetros de búsqueda.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const url = `http://localhost:5000/api/search-flights?origen=${encodeURIComponent(
        searchParams.origin
      )}&destino=${encodeURIComponent(
        searchParams.destination
      )}&fecha_salida=${encodeURIComponent(departureDateSQL)}`;

      console.log("🔄 Buscando vuelos en:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("📦 Respuesta completa del backend:", data);

      if (!response.ok) {
        const msg =
          response.status === 404
            ? "No se encontraron vuelos disponibles."
            : "Error al obtener los vuelos.";
        setErrorMsg(msg);
        setFlights([]);
        return;
      }

      if (!Array.isArray(data)) {
        setErrorMsg("Respuesta inesperada del servidor.");
        setFlights([]);
        return;
      }

      // DEBUG: Ver estructura de los vuelos
      if (data.length > 0) {
        console.log("✈️ Primer vuelo de ejemplo:", data[0]);
        console.log(
          "⏱️ Duración del primer vuelo:",
          data[0].duracion,
          "Tipo:",
          typeof data[0].duracion
        );
      }

      setFlights(data);
    } catch (error) {
      console.error("Error al buscar vuelos:", error);
      setErrorMsg("Error de conexión con el servidor.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Formatear precio en COP
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // ✅ Formatear hora (maneja ISO o texto plano)
  const formatTime = (timeString) => {
    if (!timeString) return "00:00";

    try {
      const date = new Date(timeString);
      if (!isNaN(date)) {
        return date.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
      if (typeof timeString === "string" && timeString.includes(" ")) {
        return timeString.split(" ")[1]?.substring(0, 5) || "00:00";
      }
      return timeString.substring(0, 5);
    } catch {
      return "00:00";
    }
  };

  // ✅ Formatear fecha (maneja ISO o texto plano)
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";

    try {
      const date = new Date(dateString);
      if (!isNaN(date)) {
        return date.toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      if (typeof dateString === "string") {
        return dateString.split(" ")[0];
      }
      return "Fecha no disponible";
    } catch {
      return "Fecha no disponible";
    }
  };

  // 🔥 FUNCIÓN MEJORADA Y ACORTADA: Parsear duración
  const parseDuration = (duration) => {
    // 1. Valor por defecto si no hay nada
    if (!duration) {
      console.log("❌ Duración vacía, usando 60min por defecto");
      return 60;
    }

    // 2. Si ya es un número (minutos)
    if (typeof duration === "number" && isFinite(duration)) {
      return Math.max(0, Math.round(duration));
    }

    // 3. Si es un string
    if (typeof duration === "string") {
      const str = duration.trim();

      // --- CASO 1: String de Fecha ISO (Lo más probable desde la BD) ---
      // Ej: "1970-01-01T00:46:00.000Z"
      if (str.includes('T') && (str.includes('Z') || str.includes('-'))) {
        try {
          const date = new Date(str);
          if (!isNaN(date)) {
            // Usamos UTC para evitar corrimientos por zona horaria
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const totalMinutes = (hours * 60) + minutes;
            
            if (totalMinutes > 0) {
              console.log("✅ Duración parseada desde ISO Date:", totalMinutes, "minutos");
              return totalMinutes;
            }
          }
        } catch (e) { /* Ignorar y probar el siguiente formato */ }
      }

      // --- CASO 2: Formato HH:MM:SS o HH:MM ---
      // Ej: "00:46:00" o "00:46"
      const colonMatch = str.match(/^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/);
      if (colonMatch) {
        const hours = parseInt(colonMatch[1], 10);
        const minutes = parseInt(colonMatch[2], 10);
        const totalMinutes = hours * 60 + minutes;
        console.log("✅ Duración parseada desde HH:MM(:SS):", totalMinutes, "minutos");
        return totalMinutes;
      }
    }

    // 4. Si nada funciona, usar el valor por defecto
    console.log(`⚠️ No se pudo parsear "${duration}", usando 60min por defecto`);
    return 60;
  };

  // 🔥 FUNCIÓN MEJORADA: Formatear duración para mostrar
  const formatDuration = (duration) => {
    const totalMinutes = parseDuration(duration);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  // 🔥 FUNCIÓN MEJORADA: Calcular hora de llegada
  const calculateArrivalTime = (departureTime, duration) => {
    if (!departureTime) return "00:00";

    try {
      // Parsear hora de salida
      const [hours, minutes] = departureTime.split(":").map(Number);
      let totalMinutes = hours * 60 + minutes;

      // Parsear duración
      const durationMinutes = parseDuration(duration);
      console.log("✈️ Tiempo de vuelo:", durationMinutes, "minutos");

      totalMinutes += durationMinutes;

      // Calcular hora de llegada
      const arrivalHours = Math.floor(totalMinutes / 60) % 24;
      const arrivalMinutes = totalMinutes % 60;

      const result = `${arrivalHours
        .toString()
        .padStart(2, "0")}:${arrivalMinutes.toString().padStart(2, "0")}`;
      console.log("🛬 Hora de llegada calculada:", result);

      return result;
    } catch (error) {
      console.error("Error calculando hora de llegada:", error);
      return "00:00";
    }
  };

  // 🔥 NUEVA FUNCIÓN: Calcular la fecha de retorno
  const calculateReturnDate = (departureDate, duration) => {
    if (!departureDate) return "";

    try {
      const date = new Date(departureDate);
      const durationMinutes = parseDuration(duration);

      // Agregar la duración del vuelo + 1 día para el retorno
      date.setDate(date.getDate() + 1);

      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error calculando fecha de retorno:", error);
      return "";
    }
  };

  // 🔥 NUEVA FUNCIÓN: Calcular hora de salida del vuelo de retorno
  const calculateReturnDepartureTime = (arrivalTime) => {
    if (!arrivalTime) return "10:00";

    try {
      const [hours, minutes] = arrivalTime.split(":").map(Number);
      let totalMinutes = hours * 60 + minutes + 120; // +2 horas

      const returnHours = Math.floor(totalMinutes / 60) % 24;
      const returnMinutes = totalMinutes % 60;

      return `${returnHours.toString().padStart(2, "0")}:${returnMinutes
        .toString()
        .padStart(2, "0")}`;
    } catch (error) {
      console.error("Error calculando hora de retorno:", error);
      return "10:00";
    }
  };

  // Manejar selección de vuelo
  const handleSelectFlight = (flight) => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para reservar un vuelo");
      navigate("/login", {
        state: {
          from: "/search-flights",
          searchParams: searchParams,
        },
      });
      return;
    }

    // Preparar datos del vuelo para ReserveFlight
    const flightData = {
      flightNumber: flight.id_vuelo,
      airline: "VivaSky Airlines",
      price: formatPrice(flight.costo_economico),
      priceNumber: Number(flight.costo_economico) || 0,
      costo_vip: flight.costo_vip || Math.round(flight.costo_economico * 1.5),
      duration: formatDuration(flight.duracion),
      stops: flight.tipo_vuelo === "directo" ? "Directo" : "Directo",
      departure: {
        city: flight.origen,
        airport: flight.origen,
        time: formatTime(flight.hora_salida),
        date: formatDate(flight.fecha_salida),
      },
      arrival: {
        city: flight.destino,
        airport: flight.destino,
        time: calculateArrivalTime(
          formatTime(flight.hora_salida),
          flight.duracion
        ),
        date: formatDate(flight.fecha_salida),
      },
    };

    console.log("🎫 Datos del vuelo para reserva:", flightData);

    // Navegar a ReserveFlight con los datos
    navigate("/reserve-flight", {
      state: {
        flight: flightData,
        searchParams: searchParams,
      },
    });
  };

  // 🔥 NUEVA FUNCIÓN: Manejar agregar al carrito
  const handleAddToCart = (flight) => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para agregar vuelos al carrito");
      navigate("/login", {
        state: {
          from: "/search-flights",
          searchParams: searchParams,
        },
      });
      return;
    }

    // 🔥 NUEVO: Verificar si es admin
    if (isAdminUser()) {
      alert("⛔ Los administradores no pueden agregar vuelos al carrito");
      return;
    }

    // Preparar datos del vuelo para el carrito
    const cartItem = {
      id: `flight_${flight.id_vuelo}_${Date.now()}`,
      flightNumber: `VS${flight.id_vuelo}`,
      airline: "VivaSky Airlines",
      price: formatPrice(flight.costo_economico),
      priceNumber: Number(flight.costo_economico) || 0,
      costo_vip: flight.costo_vip || Math.round(flight.costo_economico * 1.5),
      duration: formatDuration(flight.duracion),
      stops: flight.tipo_vuelo === "directo" ? "Directo" : "Directo",
      departure: {
        city: flight.origen,
        airport: flight.origen,
        time: formatTime(flight.hora_salida),
        date: formatDate(flight.fecha_salida),
      },
      arrival: {
        city: flight.destino,
        airport: flight.destino,
        time: calculateArrivalTime(
          formatTime(flight.hora_salida),
          flight.duracion
        ),
        date: formatDate(flight.fecha_salida),
      },
      searchParams: searchParams,
    };

    console.log("🛒 Item agregado al carrito:", cartItem);

    // Obtener carrito actual del localStorage
    const currentCart = JSON.parse(
      localStorage.getItem("vivasky_cart") || "[]"
    );

    // Verificar si el vuelo ya está en el carrito
    const isAlreadyInCart = currentCart.some(
      (item) =>
        item.flightNumber === cartItem.flightNumber &&
        item.departure.date === cartItem.departure.date
    );

    if (isAlreadyInCart) {
      alert("✈️ Este vuelo ya está en tu carrito");
      return;
    }

    // Agregar al carrito
    const updatedCart = [...currentCart, cartItem];
    localStorage.setItem("vivasky_cart", JSON.stringify(updatedCart));

    alert("✅ Vuelo agregado al carrito");
  };

  // 🔥 NUEVA FUNCIÓN: Obtener contador del carrito
  const getCartItemCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("vivasky_cart") || "[]");
      return cart.length;
    } catch {
      return 0;
    }
  };

  // ✅ Función para nueva búsqueda - redirige al home
  const handleNewSearch = () => {
    navigate("/");
  };

  // ✅ Función para volver al home
  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="app">
      {/* 🔹 HEADER */}
      <header className="header">
        <div
          className="logo-container"
          onClick={handleBackToHome}
          style={{ cursor: "pointer" }}
        >
          <img
            src="https://i.pinimg.com/736x/60/48/b4/6048b4ae7f74724389d345767e8061a0.jpg"
            alt="VivaSky Logo"
            className="logo-image"
          />
          <span className="logo-text">VivaSky</span>
        </div>

        <nav className="navigation">
          {isAuthenticated ? (
            <div className="user-welcome">
              <span>Hola, {userName}</span>

              {/* 🔥 MODIFICADO: Solo mostrar carrito si NO es admin */}
              {!isAdminUser() && (
                <button
                  className="nav-btn cart-btn"
                  onClick={() => navigate("/cart")}
                  style={{ position: "relative", marginRight: "10px" }}
                >
                  🛒 Carrito
                  {getCartItemCount() > 0 && (
                    <span className="cart-badge">{getCartItemCount()}</span>
                  )}
                </button>
              )}

              <button className="logout-btn" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <>
              <button className="nav-btn" onClick={() => navigate("/login")}>
                Iniciar Sesión
              </button>
              <button className="nav-btn" onClick={() => navigate("/register")}>
                Registrarse
              </button>
            </>
          )}
        </nav>

        {/* ✅ CORREGIDO: Botón Nueva Búsqueda */}
        <button className="back-btn" onClick={handleNewSearch}>
          Nueva Búsqueda
        </button>
      </header>

      {/* 🔹 CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <div className="search-header">
          <h2>✈️ Resultados de búsqueda</h2>
          <div className="search-summary">
            <div className="search-params">
              <span>
                <strong>Origen:</strong> {searchParams.origin || "—"}
              </span>
              <span>
                <strong>Destino:</strong> {searchParams.destination || "—"}
              </span>
              <span>
                <strong>Fecha salida:</strong>{" "}
                {formatDate(
                  searchParams.departureDateSQL || searchParams.departureDate
                ) || "—"}
              </span>
              {searchParams.tripType === "roundtrip" && (
                <span>
                  <strong>Fecha regreso:</strong>{" "}
                  {formatDate(searchParams.returnDate) || "—"}
                </span>
              )}
              <span>
                <strong>Tipo:</strong>{" "}
                {searchParams.tripType === "roundtrip"
                  ? "Ida y Vuelta"
                  : "Solo Ida"}
              </span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando vuelos disponibles...</p>
          </div>
        )}

        {errorMsg && (
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h3>No se encontraron vuelos</h3>
            <p>{errorMsg}</p>
            <button className="back-btn" onClick={handleNewSearch}>
              Intentar nueva búsqueda
            </button>
          </div>
        )}

        {!loading && !errorMsg && (
          <div className="flights-results-container">
            <div className="results-info">
              <h3>Vuelos disponibles ({flights.length})</h3>
              <p>
                Selecciona un vuelo para continuar con tu reserva o agrégalo al
                carrito
              </p>
            </div>

            <div className="flights-grid-enhanced">
              {flights.length > 0 ? (
                flights.map((flight) => {
                  // Solo mostrar vuelos activos
                  if (flight.estado !== "activo") return null;

                  const fechaSalida = formatDate(flight.fecha_salida);
                  const horaSalida = formatTime(flight.hora_salida);
                  const horaLlegada = calculateArrivalTime(
                    horaSalida,
                    flight.duracion
                  );
                  const duracion = formatDuration(flight.duracion);
                  const tipo = String(flight.tipo_vuelo || "Directo");

                  // 🔥 NUEVO: Calcular información del vuelo de retorno si es ida y vuelta
                  const isRoundTrip = searchParams.tripType === "roundtrip";
                  const fechaRetorno = isRoundTrip
                    ? calculateReturnDate(flight.fecha_salida, flight.duracion)
                    : "";
                  const horaSalidaRetorno = isRoundTrip
                    ? calculateReturnDepartureTime(horaLlegada)
                    : "";
                  const horaLlegadaRetorno = isRoundTrip
                    ? calculateArrivalTime(horaSalidaRetorno, flight.duracion)
                    : "";

                  console.log("🎯 Vuelo renderizado:", {
                    origen: flight.origen,
                    destino: flight.destino,
                    tipoViaje: searchParams.tripType,
                    esIdaVuelta: isRoundTrip,
                    fechaRetorno: fechaRetorno,
                  });

                  return (
                    <div
                      key={flight.id_vuelo}
                      className={`flight-card-enhanced ${
                        isRoundTrip ? "with-return" : ""
                      }`}
                    >
                      <div className="flight-card-header">
                        <div className="airline-info">
                          <span className="airline-logo">✈️</span>
                          <div>
                            <h4>VivaSky Airlines</h4>
                            <span className="flight-number">
                              VSK-{flight.id_vuelo}
                              {isRoundTrip && (
                                <span className="round-trip-badge">
                                  🔄 Ida y Vuelta
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flight-price">
                          {formatPrice(
                            isRoundTrip
                              ? flight.costo_economico * 2
                              : flight.costo_economico
                          )}
                          <span className="price-note">
                            {isRoundTrip
                              ? "económico (ida y vuelta)"
                              : "económico"}
                          </span>
                        </div>
                      </div>

                      {/* VUELO DE IDA */}
                      <div className="flight-route">
                        <div className="route-segment">
                          <div className="time">{horaSalida}</div>
                          <div className="place">
                            <div className="city">{flight.origen}</div>
                            <div className="airport">{flight.origen}</div>
                          </div>
                          <div className="date">{fechaSalida}</div>
                        </div>

                        <div className="route-middle">
                          <div className="duration">{duracion}</div>
                          <div className="route-line">
                            <div className="line"></div>
                            <div className="plane">✈️</div>
                          </div>
                          <div className="stops">
                            {tipo === "directo" ? "Directo" : "Directo"}
                          </div>
                        </div>

                        <div className="route-segment">
                          <div className="time">{horaLlegada}</div>
                          <div className="place">
                            <div className="city">{flight.destino}</div>
                            <div className="airport">{flight.destino}</div>
                          </div>
                          <div className="date">{fechaSalida}</div>
                        </div>
                      </div>

                      {/* 🔥 NUEVO: VUELO DE VUELTA - Solo mostrar si es ida y vuelta */}
                      {isRoundTrip && (
                        <div className="return-flight-section">
                          <div className="section-divider">
                            <span>🔄 Vuelo de Retorno</span>
                          </div>

                          <div className="flight-route return-route">
                            <div className="route-segment">
                              <div className="time">{horaSalidaRetorno}</div>
                              <div className="place">
                                <div className="city">{flight.destino}</div>
                                <div className="airport">{flight.destino}</div>
                              </div>
                              <div className="date">{fechaRetorno}</div>
                            </div>

                            <div className="route-middle">
                              <div className="duration">{duracion}</div>
                              <div className="route-line">
                                <div className="line"></div>
                                <div className="plane">↩️</div>
                              </div>
                              <div className="stops">
                                {tipo === "directo" ? "Directo" : "Directo"}
                              </div>
                            </div>

                            <div className="route-segment">
                              <div className="time">{horaLlegadaRetorno}</div>
                              <div className="place">
                                <div className="city">{flight.origen}</div>
                                <div className="airport">{flight.origen}</div>
                              </div>
                              <div className="date">{fechaRetorno}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flight-features">
                        <div className="feature">
                          <span>🎒</span>
                          <span>23kg equipaje</span>
                        </div>
                        <div className="feature">
                          <span>💺</span>
                          <span>Asiento estándar</span>
                        </div>
                        <div className="feature">
                          <span>🥤</span>
                          <span>Refresco incluido</span>
                        </div>
                        {isRoundTrip && (
                          <div className="feature">
                            <span>🔄</span>
                            <span>Incluye vuelo de retorno</span>
                          </div>
                        )}
                      </div>

                      <div className="flight-actions">
                        <button
                          className="select-flight-btn"
                          onClick={() => handleSelectFlight(flight)}
                        >
                          ✈️{" "}
                          {isRoundTrip
                            ? "Seleccionar Ida y Vuelta"
                            : "Seleccionar Vuelo"}
                        </button>

                        {!isAdminUser() && (
                          <button
                            className="add-to-cart-btn"
                            onClick={() => handleAddToCart(flight)}
                          >
                            🛒 Agregar al Carrito
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-flights-enhanced">
                  <div className="no-flights-icon">✈️</div>
                  <h3>No hay vuelos disponibles</h3>
                  <p>No encontramos vuelos que coincidan con tu búsqueda.</p>
                  <button className="back-btn" onClick={handleNewSearch}>
                    Intentar nueva búsqueda
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 🔹 FOOTER */}
      <footer className="footer">
        <p>© 2025 VivaSky Airlines - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default SearchFlights;
