import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";

function SearchFlights() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state || {};

  // Debug de searchParams
  console.log("🔍 SEARCH PARAMS RECIBIDOS:", searchParams);
  console.log("📍 Origen:", searchParams.origin);
  console.log("🎯 Destino:", searchParams.destination);
  console.log("📅 Fecha salida:", searchParams.departureDate);
  console.log("📅 Fecha salida SQL:", searchParams.departureDateSQL);
  console.log("📅 Fecha retorno:", searchParams.returnDate);
  console.log("🔄 Tipo viaje:", searchParams.tripType);

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

  // 🔥 MODIFICADA: Obtener vuelos - USANDO DATOS DEL MISMO VUELO PARA IDA Y VUELTA
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
      // SOLO buscar vuelo de IDA
      const url = `http://localhost:5000/api/search-flights?origen=${encodeURIComponent(
        searchParams.origin
      )}&destino=${encodeURIComponent(
        searchParams.destination
      )}&fecha_salida=${encodeURIComponent(departureDateSQL)}`;

      console.log("🔄 Buscando vuelos:", url);

      const response = await fetch(url);
      const flightsData = await response.json();

      console.log("📦 Vuelos encontrados:", flightsData);

      // 🔥 DEBUG: Ver estructura completa del primer vuelo
      if (flightsData.length > 0) {
        console.log("🔍 ESTRUCTURA COMPLETA del primer vuelo:", flightsData[0]);
        console.log("📋 CAMPOS DISPONIBLES:", Object.keys(flightsData[0]));
      }

      // Validar respuesta
      if (!Array.isArray(flightsData)) {
        setErrorMsg("Respuesta inesperada del servidor.");
        setFlights([]);
        return;
      }

      // 🔥 NUEVO: Procesar los vuelos según el tipo de viaje
      const processedFlights = flightsData.map((flight) => {
        const isRoundTrip = searchParams.tripType === "roundtrip";

        // Si es búsqueda de ida y vuelta Y el vuelo tiene datos de retorno
        // Buscamos diferentes nombres de campos que podrían contener la fecha de retorno
        const hasReturnData =
          flight.fecha_retorno || flight.fecha_vuelta || flight.return_date;

        if (isRoundTrip && hasReturnData) {
          console.log("✅ Vuelo ida y vuelta detectado:", flight);

          // Determinar los nombres de campos para el retorno
          const fechaRetorno =
            flight.fecha_retorno || flight.fecha_vuelta || flight.return_date;
          const horaRetorno =
            flight.hora_retorno ||
            flight.hora_vuelta ||
            flight.return_time ||
            flight.hora_salida;
          const costoRetorno =
            flight.costo_retorno ||
            flight.precio_vuelta ||
            flight.return_price ||
            flight.costo_economico;
          const duracionRetorno =
            flight.duracion_retorno ||
            flight.duracion_vuelta ||
            flight.return_duration ||
            flight.duracion;

          return {
            ...flight,
            tripType: "roundtrip",
            isRoundTrip: true,
            hasReturnFlight: true,
            // 🔥 Los datos del vuelo de retorno se derivan del mismo vuelo
            returnFlight: {
              id_vuelo: flight.id_vuelo_retorno || flight.id_vuelo, // Mismo ID o ID diferente
              origen: flight.destino, // El destino de ida es el origen de vuelta
              destino: flight.origen, // El origen de ida es el destino de vuelta
              fecha_salida: fechaRetorno,
              hora_salida: horaRetorno,
              duracion: duracionRetorno,
              costo_economico: costoRetorno,
              costo_vip: flight.costo_vip_retorno || flight.costo_vip,
              tipo_vuelo: flight.tipo_vuelo_retorno || flight.tipo_vuelo,
              estado: flight.estado_retorno || flight.estado,
            },
            // Precio total (ida + vuelta)
            precio_total: flight.costo_economico + costoRetorno,
            precio_total_vip:
              flight.costo_vip + (flight.costo_vip_retorno || flight.costo_vip),
          };
        } else {
          // Vuelo solo de ida
          console.log("ℹ️ Vuelo solo ida detectado:", flight);
          return {
            ...flight,
            tripType: "oneway",
            isRoundTrip: false,
            hasReturnFlight: false,
            precio_total: flight.costo_economico,
            precio_total_vip: flight.costo_vip,
          };
        }
      });

      console.log("✈️ Vuelos procesados:", processedFlights);
      setFlights(processedFlights);
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
      if (str.includes("T") && (str.includes("Z") || str.includes("-"))) {
        try {
          const date = new Date(str);
          if (!isNaN(date)) {
            // Usamos UTC para evitar corrimientos por zona horaria
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const totalMinutes = hours * 60 + minutes;

            if (totalMinutes > 0) {
              console.log(
                "✅ Duración parseada desde ISO Date:",
                totalMinutes,
                "minutos"
              );
              return totalMinutes;
            }
          }
        } catch (e) {
          /* Ignorar y probar el siguiente formato */
        }
      }

      // --- CASO 2: Formato HH:MM:SS o HH:MM ---
      // Ej: "00:46:00" o "00:46"
      const colonMatch = str.match(/^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/);
      if (colonMatch) {
        const hours = parseInt(colonMatch[1], 10);
        const minutes = parseInt(colonMatch[2], 10);
        const totalMinutes = hours * 60 + minutes;
        console.log(
          "✅ Duración parseada desde HH:MM(:SS):",
          totalMinutes,
          "minutos"
        );
        return totalMinutes;
      }
    }

    // 4. Si nada funciona, usar el valor por defecto
    console.log(
      `⚠️ No se pudo parsear "${duration}", usando 60min por defecto`
    );
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

  // 🔥 MODIFICADA: Manejar selección de vuelo - CON SOPORTE PARA IDA Y VUELTA REAL
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
      // Datos del vuelo de ida
      flightNumber: flight.id_vuelo,
      airline: "VivaSky Airlines",
      price: formatPrice(
        flight.isRoundTrip ? flight.precio_total : flight.costo_economico
      ),
      priceNumber: flight.isRoundTrip
        ? flight.precio_total
        : Number(flight.costo_economico) || 0,
      costo_vip: flight.isRoundTrip
        ? flight.precio_total_vip
        : flight.costo_vip || Math.round(flight.costo_economico * 1.5),
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

      // 🔥 NUEVO: Datos del vuelo de retorno si existe
      returnFlight: flight.returnFlight
        ? {
            flightNumber: flight.returnFlight.id_vuelo,
            departure: {
              city: flight.returnFlight.origen,
              airport: flight.returnFlight.origen,
              time: formatTime(flight.returnFlight.hora_salida),
              date: formatDate(flight.returnFlight.fecha_salida),
            },
            arrival: {
              city: flight.returnFlight.destino,
              airport: flight.returnFlight.destino,
              time: calculateArrivalTime(
                formatTime(flight.returnFlight.hora_salida),
                flight.returnFlight.duracion
              ),
              date: formatDate(flight.returnFlight.fecha_salida),
            },
            duration: formatDuration(flight.returnFlight.duracion),
          }
        : null,

      isRoundTrip: flight.isRoundTrip,
      searchParams: searchParams,
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

  // 🔥 NUEVA FUNCIÓN: Manejar agregar al carrito - CON SOPORTE PARA IDA Y VUELTA
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
      id: flight.combinationId || `flight_${flight.id_vuelo}_${Date.now()}`,
      flightNumber: `VS${flight.id_vuelo}`,
      airline: "VivaSky Airlines",
      price: formatPrice(
        flight.isRoundTrip ? flight.precio_total : flight.costo_economico
      ),
      priceNumber: flight.isRoundTrip
        ? flight.precio_total
        : Number(flight.costo_economico) || 0,
      costo_vip: flight.isRoundTrip
        ? flight.precio_total_vip
        : flight.costo_vip || Math.round(flight.costo_economico * 1.5),
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
      // 🔥 NUEVO: Incluir información del vuelo de retorno si existe
      returnFlight: flight.returnFlight
        ? {
            flightNumber: `VS${flight.returnFlight.id_vuelo}`,
            departure: {
              city: flight.returnFlight.origen,
              airport: flight.returnFlight.origen,
              time: formatTime(flight.returnFlight.hora_salida),
              date: formatDate(flight.returnFlight.fecha_salida),
            },
            arrival: {
              city: flight.returnFlight.destino,
              airport: flight.returnFlight.destino,
              time: calculateArrivalTime(
                formatTime(flight.returnFlight.hora_salida),
                flight.returnFlight.duracion
              ),
              date: formatDate(flight.returnFlight.fecha_salida),
            },
            duration: formatDuration(flight.returnFlight.duracion),
          }
        : null,
      isRoundTrip: flight.isRoundTrip,
      searchParams: searchParams,
    };

    console.log("🛒 Item agregado al carrito:", cartItem);

    // Obtener carrito actual del localStorage
    const currentCart = JSON.parse(
      localStorage.getItem("vivasky_cart") || "[]"
    );

    // Verificar si el vuelo ya está en el carrito
    const isAlreadyInCart = currentCart.some((item) => item.id === cartItem.id);

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

                  const isRoundTrip = flight.isRoundTrip;
                  const hasReturnFlight =
                    flight.hasReturnFlight && flight.returnFlight;
                  const fechaSalida = formatDate(flight.fecha_salida);
                  const horaSalida = formatTime(flight.hora_salida);
                  const horaLlegada = calculateArrivalTime(
                    horaSalida,
                    flight.duracion
                  );
                  const duracion = formatDuration(flight.duracion);

                  // 🔥 NUEVO: Datos del vuelo de retorno REAL
                  const fechaRetorno = hasReturnFlight
                    ? formatDate(flight.returnFlight.fecha_salida)
                    : "";
                  const horaSalidaRetorno = hasReturnFlight
                    ? formatTime(flight.returnFlight.hora_salida)
                    : "";
                  const horaLlegadaRetorno = hasReturnFlight
                    ? calculateArrivalTime(
                        horaSalidaRetorno,
                        flight.returnFlight.duracion
                      )
                    : "";
                  const duracionRetorno = hasReturnFlight
                    ? formatDuration(flight.returnFlight.duracion)
                    : "";

                  console.log("🎯 Vuelo renderizado:", {
                    id: flight.id_vuelo,
                    tipoViaje: flight.tripType,
                    esIdaVuelta: isRoundTrip,
                    tieneVuelta: hasReturnFlight,
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
                              {isRoundTrip ? "🔄 Combo " : "VSK-"}
                              {flight.id_vuelo}
                              {hasReturnFlight &&
                                ` + VSK-${flight.returnFlight.id_vuelo}`}
                              {isRoundTrip && (
                                <span className="round-trip-badge">
                                  {hasReturnFlight
                                    ? "Ida y Vuelta"
                                    : "Ida y Vuelta*"}
                                </span>
                              )}
                            </span>
                            {isRoundTrip && !hasReturnFlight && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#e67e22",
                                  marginTop: "5px",
                                  fontStyle: "italic",
                                }}
                              >
                                * Vuelo de retorno no disponible para esta fecha
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flight-price">
                          {formatPrice(
                            isRoundTrip
                              ? flight.precio_total
                              : flight.costo_economico
                          )}
                          <span className="price-note">
                            {isRoundTrip
                              ? hasReturnFlight
                                ? "económico (ida y vuelta)"
                                : "económico (solo ida)"
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
                            {flight.tipo_vuelo === "directo"
                              ? "Directo"
                              : "Directo"}
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

                      {/* VUELO DE VUELTA - SOLO SI HAY VUELO REAL DE RETORNO */}
                      {isRoundTrip && hasReturnFlight && (
                        <div className="return-flight-section">
                          <div className="section-divider">
                            <span>🔄 Vuelo de Retorno</span>
                          </div>

                          <div className="flight-route return-route">
                            <div className="route-segment">
                              <div className="time">{horaSalidaRetorno}</div>
                              <div className="place">
                                <div className="city">
                                  {flight.returnFlight.origen}
                                </div>
                                <div className="airport">
                                  {flight.returnFlight.origen}
                                </div>
                              </div>
                              <div className="date">{fechaRetorno}</div>
                            </div>

                            <div className="route-middle">
                              <div className="duration">{duracionRetorno}</div>
                              <div className="route-line">
                                <div className="line"></div>
                                <div className="plane">↩️</div>
                              </div>
                              <div className="stops">
                                {flight.returnFlight.tipo_vuelo === "directo"
                                  ? "Directo"
                                  : "Directo"}
                              </div>
                            </div>

                            <div className="route-segment">
                              <div className="time">{horaLlegadaRetorno}</div>
                              <div className="place">
                                <div className="city">
                                  {flight.returnFlight.destino}
                                </div>
                                <div className="airport">
                                  {flight.returnFlight.destino}
                                </div>
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
                        {isRoundTrip && hasReturnFlight && (
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
                            ? hasReturnFlight
                              ? "Seleccionar Ida y Vuelta"
                              : "Seleccionar Solo Ida"
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

