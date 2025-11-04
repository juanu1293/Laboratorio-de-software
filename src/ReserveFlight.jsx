import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";

const ReserveFlight = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("flight");
  const [userRole, setUserRole] = useState("");
  const [selectedClass, setSelectedClass] = useState("economica"); // "economica" o "vip"
  const [totalPrice, setTotalPrice] = useState(0);

  // Función para formatear la duración de manera segura
  const formatDuration = (duration) => {
    if (!duration) return "2h 00m";

    // Si es un objeto, extraer los minutos
    if (typeof duration === "object" && duration.minutes !== undefined) {
      const totalMinutes = duration.minutes;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${minutes}m`;
      }
    }

    // Si es un string, devolverlo tal cual
    if (typeof duration === "string") {
      return duration;
    }

    // Si es un número, convertirlo
    if (typeof duration === "number") {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${minutes}m`;
      }
    }

    return "2h 00m";
  };

  // ✅ Nueva función para formatear hora correctamente
  const formatTime = (time) => {
    if (!time) return "00:00";

    try {
      // Si viene como objeto con campo date
      if (typeof time === "object" && time.date) {
        const date = new Date(time.date);
        return date.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }

      // Si viene como string ISO o con espacio
      if (typeof time === "string") {
        const date = new Date(time);
        if (!isNaN(date)) {
          return date.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        }
        // Si no es una fecha ISO, cortar parte de hora
        return time.includes("T")
          ? time.split("T")[1].substring(0, 5)
          : time.substring(0, 5);
      }

      return "00:00";
    } catch {
      return "00:00";
    }
  };

  // ✅ Nueva versión de formatDate: evita reconvertir fechas ya formateadas
  const formatDate = (date) => {
    if (!date) return "Fecha no disponible";

    try {
      // Si ya viene formateada como texto legible ("1 de noviembre de 2025")
      if (typeof date === "string" && isNaN(Date.parse(date))) {
        return date; // ya está lista, la devolvemos tal cual
      }

      // Si viene como objeto del backend
      if (typeof date === "object" && date.date) {
        const d = new Date(date.date);
        return d.toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      // Si viene como string ISO (ej: "2025-11-01T05:00:00.000Z")
      const d = new Date(date);
      if (!isNaN(d)) {
        return d.toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      return "Fecha no disponible";
    } catch {
      return "Fecha no disponible";
    }
  };

  // Verificar autenticación y obtener datos del vuelo
  useEffect(() => {
    const authCheck = checkAuth();

    if (!authCheck) {
      setLoading(false);
      return;
    }

    // Obtener datos del vuelo desde location.state y formatearlos
    if (location.state && location.state.flight) {
      const rawFlightData = location.state.flight;

      // Formatear los datos del vuelo para asegurar que sean strings
      const formattedFlightData = {
        ...rawFlightData,
        duration: formatDuration(rawFlightData.duration),
        departure: {
          ...rawFlightData.departure,
          time: formatTime(rawFlightData.departure?.time),
          date: formatDate(rawFlightData.departure?.date),
        },
        arrival: {
          ...rawFlightData.arrival,
          time: formatTime(rawFlightData.arrival?.time),
          date: formatDate(rawFlightData.arrival?.date),
        },
        // 🔄 Asegurar que costo_vip se pase correctamente
        costo_vip: rawFlightData.costo_vip || rawFlightData.priceNumber || 0,
        priceNumber: rawFlightData.priceNumber || 0,
      };

      setFlightData(formattedFlightData);

      // Calcular precio inicial con clase económica
      calculateTotalPrice(formattedFlightData, "economica");

      setLoading(false);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  // Calcular precio total basado en la clase seleccionada
  const calculateTotalPrice = (flight, classType) => {
    if (!flight) return;

    // Obtener el precio base según la clase seleccionada
    const basePrice =
      classType === "vip"
        ? flight.costo_vip || flight.priceNumber || 0
        : flight.priceNumber || 0;

    const tripMultiplier =
      location.state?.searchParams?.tripType === "roundtrip" ? 2 : 1;
    const total = basePrice * tripMultiplier;

    setTotalPrice(total);
  };

  // Manejar cambio de clase
  const handleClassChange = (classType) => {
    setSelectedClass(classType);
    calculateTotalPrice(flightData, classType);
  };

  const checkAuth = () => {
    const authToken =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const userData =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");

    if (authToken && userData) {
      try {
        const user = JSON.parse(userData);
        const userRole = user.tipo_usuario || user.role || "Usuario";

        setUserInfo({
          nombre: user.nombre,
          correo: user.correo,
          telefono: user.telefono || "No especificado",
          documento: user.documento || "No especificado",
          role: userRole,
        });
        setUserRole(userRole);
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleLogout();
        return false;
      }
    }
    return false;
  };

  // Verificar si el usuario puede reservar/comprar
  const canMakeReservations = () => {
    // Solo los usuarios que NO son administradores pueden reservar/comprar
    return !isAdminUser();
  };

  const isAdminUser = () => {
    // Solo estos roles específicos son considerados administradores
    const adminRoles = ["Administrador", "administrador", "admin", "root"];
    return adminRoles.includes(userRole);
  };

  const isClientUser = () => {
    // Usuarios que son clientes regulares
    const clientRoles = ["Usuario", "Cliente", "usuario", "cliente"];
    return clientRoles.includes(userRole) || !userRole;
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");

    setUserInfo(null);
    setIsAuthenticated(false);
    setUserRole("");
    alert("Has cerrado sesión exitosamente");
    navigate("/");
  };

  // Función para mostrar el menú de usuario
  const UserMenu = ({ userInfo, onLogout }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div className="user-menu-container">
        <button
          className="user-menu-trigger"
          onClick={() => setShowMenu(!showMenu)}
        >
          <div className="user-info">
            <span className="user-welcome">Hola, {userInfo.nombre}</span>
            <span
              className={`user-role ${
                isAdminUser() ? "admin-role" : "client-role"
              }`}
            >
              {userInfo.role}
            </span>
          </div>
          <span>▼</span>
        </button>

        {showMenu && (
          <div className="user-menu-dropdown">
            <div className="user-menu-header">
              <div className="user-welcome">{userInfo.nombre}</div>
              <div className="user-menu-email">{userInfo.correo}</div>
              <div
                className={`user-role-badge ${
                  isAdminUser() ? "admin-badge" : "client-badge"
                }`}
              >
                {userInfo.role}
              </div>
            </div>

            <div className="user-menu-items">
              <div className="menu-section-title">Mi Cuenta</div>
              <button
                className="menu-item"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/manage-flights");
                }}
              >
                <span className="menu-icon">✈️</span>
                Gestionar Vuelos
              </button>

              <button
                className="menu-item"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/change-password");
                }}
              >
                <span className="menu-icon">🔒</span>
                Cambiar Contraseña
              </button>

              {/* Solo mostrar opciones de administración para administradores */}
              {isAdminUser() && (
                <>
                  <div className="menu-divider"></div>
                  <div className="menu-section-title">Administración</div>
                  <button
                    className="menu-item"
                    onClick={() => {
                      setShowMenu(false);
                      navigate("/create-admin");
                    }}
                  >
                    <span className="menu-icon">👥</span>
                    Gestionar Usuarios
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => {
                      setShowMenu(false);
                      alert("Panel de administración próximamente disponible");
                    }}
                  >
                    <span className="menu-icon">📊</span>
                    Panel de Control
                  </button>
                </>
              )}

              <div className="menu-divider"></div>

              <button
                className="menu-item logout"
                onClick={() => {
                  setShowMenu(false);
                  onLogout();
                }}
              >
                <span className="menu-icon">🚪</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBackToSearch = () => {
    navigate("/search-flights", { state: location.state?.searchParams });
  };

  const handleReserveFlight = () => {
    if (!canMakeReservations()) {
      showAdminRestrictionMessage();
      return;
    }

    const classText = selectedClass === "vip" ? "VIP" : "Económica";
    const classPrice =
      selectedClass === "vip"
        ? flightData.costo_vip || flightData.priceNumber
        : flightData.priceNumber;

    const formattedTotal = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(totalPrice);

    alert(
      `¡Vuelo ${flightData.flightNumber} reservado exitosamente!\n\n` +
        `📧 Te hemos enviado un correo de confirmación a ${userInfo.correo}\n` +
        `🎫 Clase: ${classText}\n` +
        `💰 Total reservado: ${formattedTotal}\n` +
        `⏰ Tienes 24 horas para completar el pago`
    );
  };

  const handleBuyFlight = () => {
    if (!canMakeReservations()) {
      showAdminRestrictionMessage();
      return;
    }

    const classText = selectedClass === "vip" ? "VIP" : "Económica";
    const classPrice =
      selectedClass === "vip"
        ? flightData.costo_vip || flightData.priceNumber
        : flightData.priceNumber;

    const formattedTotal = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(totalPrice);

    alert(
      `¡Compra del vuelo ${flightData.flightNumber} realizada exitosamente!\n\n` +
        `🎫 Recibirás tu boleto electrónico en ${userInfo.correo}\n` +
        `✈️ Clase: ${classText}\n` +
        `💰 Total pagado: ${formattedTotal}\n` +
        `¡Buen viaje con VivaSky!`
    );
  };

  const showAdminRestrictionMessage = () => {
    alert(
      `⛔ Acción no permitida\n\nLos usuarios con rol de "${userRole}" no pueden realizar reservas ni compras de vuelos.\n\nEsta función está disponible únicamente para usuarios regulares (Cliente/Usuario).`
    );
  };

  // Componente para selección de clase
  const ClassSelector = () => {
    const economicPrice = flightData.priceNumber || 0;
    const vipPrice = flightData.costo_vip || flightData.priceNumber || 0;
    const priceDifference = vipPrice - economicPrice;

    return (
      <div className="class-selector-container">
        <h3>🎫 Selecciona tu clase</h3>
        <div className="class-options">
          <div
            className={`class-option ${
              selectedClass === "economica" ? "selected" : ""
            }`}
            onClick={() => handleClassChange("economica")}
          >
            <div className="class-header">
              <span className="class-icon">💺</span>
              <div className="class-info">
                <h4>Clase Económica</h4>
                <p>Viaja cómodo con lo esencial</p>
              </div>
            </div>
            <div className="class-features">
              <div className="feature">
                <span className="check">✓</span>
                <span>Asiento estándar</span>
              </div>
              <div className="feature">
                <span className="check">✓</span>
                <span>Equipaje de mano 8kg</span>
              </div>
              <div className="feature">
                <span className="check">✓</span>
                <span>Refresco y snack</span>
              </div>
            </div>
            <div className="class-price">
              <span className="price">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                }).format(economicPrice)}
              </span>
              {selectedClass === "economica" && (
                <span className="selected-badge">Seleccionada</span>
              )}
            </div>
          </div>

          <div
            className={`class-option vip ${
              selectedClass === "vip" ? "selected" : ""
            }`}
            onClick={() => handleClassChange("vip")}
          >
            <div className="class-header">
              <span className="class-icon">⭐</span>
              <div className="class-info">
                <h4>Clase VIP</h4>
                <p>Experiencia premium de viaje</p>
              </div>
            </div>
            <div className="class-features">
              <div className="feature">
                <span className="check">✓</span>
                <span>Asientos premium extra cómodos</span>
              </div>
              <div className="feature">
                <span className="check">✓</span>
                <span>Equipaje 23kg + equipaje de mano</span>
              </div>
              <div className="feature">
                <span className="check">✓</span>
                <span>Comida gourmet y barra libre</span>
              </div>
              <div className="feature">
                <span className="check">✓</span>
                <span>Acceso prioritario y sala VIP</span>
              </div>
              <div className="feature">
                <span className="check">✓</span>
                <span>Atención personalizada</span>
              </div>
            </div>
            <div className="class-price">
              <div className="price-comparison">
                <span className="price">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(vipPrice)}
                </span>
                {priceDifference > 0 && (
                  <span className="price-difference">
                    +
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(priceDifference)}
                  </span>
                )}
              </div>
              {selectedClass === "vip" && (
                <span className="selected-badge">Seleccionada</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Si está cargando
  if (loading) {
    return (
      <div className="app">
        <header className="header">
          <div
            className="logo-container"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          >
            <img
              src="https://i.pinimg.com/736x/60/48/b4/6048b4ae7f74724389d345767e8061a0.jpg"
              alt="VivaSky Logo"
              className="logo-image"
            />
            <span className="logo-text">VivaSky</span>
          </div>
          <button className="back-btn" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </header>
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Cargando información del vuelo...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar página de autenticación requerida
  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="header">
          <div
            className="logo-container"
            onClick={handleLogoClick}
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
            <a href="#" onClick={() => navigate("/")}>
              Inicio
            </a>
            <a
              href="#"
              onClick={() => alert("Funcionalidad próximamente disponible")}
            >
              Noticias
            </a>
          </nav>

          <button className="back-btn" onClick={handleBackToSearch}>
            Volver a búsqueda
          </button>
        </header>

        <div className="auth-required-container">
          <div className="auth-required-card">
            <div className="auth-required-icon">✈️</div>
            <h1>Viaja con Nosotros</h1>
            <p className="auth-required-subtitle">
              Para reservar este vuelo necesitas tener una cuenta en VivaSky
            </p>

            {/* Previsualización del vuelo seleccionado */}
            {location.state?.flight && (
              <div className="flight-preview">
                <div className="flight-preview-header">
                  <h3>Vuelo Seleccionado</h3>
                  <span className="flight-price-preview">
                    {location.state.flight.price}
                  </span>
                </div>
                <div className="flight-preview-route">
                  <div className="preview-departure">
                    <strong>{location.state.flight.departure.city}</strong>
                    <span>{location.state.flight.departure.airport}</span>
                  </div>
                  <div className="preview-arrow">→</div>
                  <div className="preview-arrival">
                    <strong>{location.state.flight.arrival.city}</strong>
                    <span>{location.state.flight.arrival.airport}</span>
                  </div>
                </div>
                <div className="flight-preview-date">
                  {location.state.flight.departure.date}
                  {location.state?.searchParams?.tripType === "roundtrip" &&
                    ` - ${location.state.searchParams.returnDate}`}
                </div>
                <div className="flight-preview-meta">
                  <span>{location.state.flight.airline}</span>
                  <span>•</span>
                  <span>{location.state.flight.duration}</span>
                  <span>•</span>
                  <span>{location.state.flight.stops}</span>
                </div>
              </div>
            )}

            <div className="auth-required-actions">
              <button
                className="auth-required-btn primary"
                onClick={() =>
                  navigate("/login", {
                    state: {
                      from: location.pathname,
                      flight: location.state?.flight,
                      searchParams: location.state?.searchParams,
                    },
                  })
                }
              >
                Iniciar Sesión
              </button>
              <button
                className="auth-required-btn secondary"
                onClick={() =>
                  navigate("/register", {
                    state: {
                      from: location.pathname,
                      flight: location.state?.flight,
                      searchParams: location.state?.searchParams,
                    },
                  })
                }
              >
                Crear Cuenta
              </button>
            </div>

            <div className="auth-required-benefits">
              <h4>Beneficios de tener una cuenta VivaSky:</h4>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <span className="benefit-icon">🎫</span>
                  <span>Gestiona tus reservas fácilmente</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💰</span>
                  <span>Acceso a ofertas exclusivas</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">⚡</span>
                  <span>Check-in rápido y sencillo</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📱</span>
                  <span>Acceso desde cualquier dispositivo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos del vuelo
  if (!flightData) {
    return (
      <div className="app">
        <header className="header">
          <div
            className="logo-container"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          >
            <img
              src="https://i.pinimg.com/736x/60/48/b4/6048b4ae7f74724389d345767e8061a0.jpg"
              alt="VivaSky Logo"
              className="logo-image"
            />
            <span className="logo-text">VivaSky</span>
          </div>
          <button className="back-btn" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </header>
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Error al cargar la información</h2>
          <p>No se pudo cargar la información del vuelo seleccionado.</p>
          <button className="back-btn" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Página principal de reserva (usuario autenticado con datos del vuelo)
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div
          className="logo-container"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        >
          <img
            src="https://i.pinimg.com/736x/60/48/b4/6048b4ae7f74724389d345767e8061a0.jpg"
            alt="VivaSky Logo"
            className="logo-image"
          />
          <span className="logo-text">VivaSky</span>
        </div>

        {/* Mostrar información del usuario si está logeado */}
        {isAuthenticated && userInfo ? (
          <UserMenu userInfo={userInfo} onLogout={handleLogout} />
        ) : (
          <nav className="navigation">
            <a href="#" onClick={() => navigate("/")}>
              Inicio
            </a>
            <a
              href="#"
              onClick={() => alert("Funcionalidad próximamente disponible")}
            >
              Noticias
            </a>
          </nav>
        )}

        <button className="back-btn" onClick={handleBackToSearch}>
          Volver a búsqueda
        </button>
      </header>

      {/* Contenido principal */}
      <div className="reservation-container-enhanced">
        {/* Admin Warning Banner - SOLO para administradores */}
        {isAdminUser() && (
          <div className="admin-warning-banner">
            <div className="warning-icon">⚙️</div>
            <div className="warning-content">
              <h3>Modo Administración</h3>
              <p>
                Estás viendo esta página en modo de administración. Los usuarios
                con rol de <strong>{String(userRole)}</strong> no pueden
                realizar reservas ni compras de vuelos.
              </p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="reservation-progress">
          <div className="progress-steps">
            <div
              className={`progress-step ${
                activeTab === "flight" ? "active" : "completed"
              }`}
            >
              <div className="step-number">1</div>
              <div className="step-label">Vuelo</div>
            </div>
            <div className="progress-line"></div>
            <div
              className={`progress-step ${
                activeTab === "user"
                  ? "active"
                  : activeTab === "payment"
                  ? "completed"
                  : ""
              }`}
            >
              <div className="step-number">2</div>
              <div className="step-label">Pasajero</div>
            </div>
            <div className="progress-line"></div>
            <div
              className={`progress-step ${
                activeTab === "payment" ? "active" : ""
              }`}
            >
              <div className="step-number">3</div>
              <div className="step-label">Pago</div>
            </div>
          </div>
        </div>

        <div className="reservation-header-enhanced">
          <h1>
            Confirma tu{" "}
            {location.state?.searchParams?.tripType === "roundtrip"
              ? "Vuelo Ida y Vuelta"
              : "Vuelo"}
          </h1>
          <p>Revisa todos los detalles antes de finalizar tu reserva</p>
        </div>

        <div className="reservation-layout">
          {/* Columna izquierda - Información principal */}
          <div className="reservation-main">
            {/* Navegación por pestañas */}
            <div className="reservation-tabs">
              <button
                className={`tab-button ${
                  activeTab === "flight" ? "active" : ""
                }`}
                onClick={() => setActiveTab("flight")}
              >
                ✈️ Información del Vuelo
              </button>
              <button
                className={`tab-button ${activeTab === "user" ? "active" : ""}`}
                onClick={() => setActiveTab("user")}
              >
                👤 Información del Pasajero
              </button>
              <button
                className={`tab-button ${
                  activeTab === "payment" ? "active" : ""
                }`}
                onClick={() => setActiveTab("payment")}
              >
                💳 Resumen de Pago
              </button>
            </div>

            {/* Contenido de las pestañas */}
            <div className="tab-content">
              {activeTab === "flight" && flightData && (
                <div className="flight-details-enhanced">
                  <div className="flight-card-enhanced">
                    <div className="flight-header-enhanced">
                      <div className="airline-info">
                        <span className="airline-logo">✈️</span>
                        <div>
                          <h3>
                            {String(flightData.airline || "VivaSky Airlines")}
                          </h3>
                          <p className="flight-number">
                            {String(flightData.flightNumber || "N/A")}
                          </p>
                        </div>
                      </div>
                      <div className="flight-price-tag">
                        {selectedClass === "vip"
                          ? new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            }).format(
                              flightData.costo_vip || // ← CORREGIDO
                                flightData.priceNumber ||
                                0
                            )
                          : String(flightData.price || "$0")}
                      </div>
                    </div>

                    <div className="flight-route-enhanced">
                      <div className="route-segment-enhanced">
                        <div className="time-large">
                          {String(flightData.departure?.time || "00:00")}
                        </div>
                        <div className="airport-info">
                          <div className="airport-code-large">
                            {String(flightData.departure?.airport || "N/A")}
                          </div>
                          <div className="city-name">
                            {String(flightData.departure?.city || "N/A")}
                          </div>
                        </div>
                        <div className="date-info">
                          {String(
                            flightData.departure?.date || "Fecha no disponible"
                          )}
                        </div>
                      </div>

                      <div className="route-middle-enhanced">
                        <div className="duration-badge">
                          {String(flightData.duration || "2h 00m")}
                        </div>
                        <div className="route-line">
                          <div className="line"></div>
                          <div className="plane-flying">✈️</div>
                        </div>
                        <div className="stops-info">
                          {String(flightData.stops || "Directo")}
                        </div>
                      </div>

                      <div className="route-segment-enhanced">
                        <div className="time-large">
                          {String(flightData.arrival?.time || "00:00")}
                        </div>
                        <div className="airport-info">
                          <div className="airport-code-large">
                            {String(flightData.arrival?.airport || "N/A")}
                          </div>
                          <div className="city-name">
                            {String(flightData.arrival?.city || "N/A")}
                          </div>
                        </div>
                        <div className="date-info">
                          {String(
                            flightData.arrival?.date || "Fecha no disponible"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flight-features">
                      <div className="feature-item">
                        <span className="feature-icon">🎒</span>
                        <span>Equipaje: 23 kg </span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">⏱️</span>
                        <span>
                          Duración: {String(flightData.duration || "2h 00m")}
                        </span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">🛬</span>
                        <span>
                          Vuelo: {String(flightData.stops || "Directo")}
                        </span>
                      </div>
                    </div>

                    {/* ✅ Selector de Clase */}
                    <ClassSelector />
                  </div>

                  {/* Vuelo de retorno */}
                  {location.state?.searchParams?.tripType === "roundtrip" && (
                    <div className="return-flight-enhanced">
                      <div className="section-title">
                        <span className="title-icon">🔄</span>
                        Vuelo de Retorno
                      </div>
                      <div className="flight-card-enhanced return">
                        <div className="flight-route-enhanced">
                          <div className="route-segment-enhanced">
                            <div className="time-large">10:15</div>
                            <div className="airport-info">
                              <div className="airport-code-large">
                                {String(flightData.arrival?.airport || "N/A")}
                              </div>
                              <div className="city-name">
                                {String(flightData.arrival?.city || "N/A")}
                              </div>
                            </div>
                            <div className="date-info">
                              {String(
                                location.state?.searchParams?.returnDate ||
                                  "Fecha no disponible"
                              )}
                            </div>
                          </div>

                          <div className="route-middle-enhanced">
                            <div className="duration-badge">
                              {String(flightData.duration || "2h 00m")}
                            </div>
                            <div className="route-line">
                              <div className="line"></div>
                              <div className="plane-flying">✈️</div>
                            </div>
                            <div className="stops-info">Directo</div>
                          </div>

                          <div className="route-segment-enhanced">
                            <div className="time-large">
                              {(() => {
                                const [hours, minutes] = "10:15"
                                  .split(":")
                                  .map(Number);
                                const durationMatch = String(
                                  flightData.duration || "2h 00m"
                                ).match(/(\d+)h\s*(\d+)m|(\d+)h|(\d+)m/);
                                let totalMinutes = hours * 60 + minutes;

                                if (durationMatch) {
                                  if (durationMatch[1] && durationMatch[2]) {
                                    totalMinutes +=
                                      parseInt(durationMatch[1]) * 60 +
                                      parseInt(durationMatch[2]);
                                  } else if (durationMatch[3]) {
                                    totalMinutes +=
                                      parseInt(durationMatch[3]) * 60;
                                  } else if (durationMatch[4]) {
                                    totalMinutes += parseInt(durationMatch[4]);
                                  }
                                }

                                const arrivalHours =
                                  Math.floor(totalMinutes / 60) % 24;
                                const arrivalMinutes = totalMinutes % 60;
                                return `${arrivalHours
                                  .toString()
                                  .padStart(2, "0")}:${arrivalMinutes
                                  .toString()
                                  .padStart(2, "0")}`;
                              })()}
                            </div>
                            <div className="airport-info">
                              <div className="airport-code-large">
                                {String(flightData.departure?.airport || "N/A")}
                              </div>
                              <div className="city-name">
                                {String(flightData.departure?.city || "N/A")}
                              </div>
                            </div>
                            <div className="date-info">
                              {String(
                                location.state?.searchParams?.returnDate ||
                                  "Fecha no disponible"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "user" && userInfo && (
                <div className="user-details-enhanced">
                  <div className="user-card">
                    <div className="user-header">
                      <h3>👤 Información del Pasajero</h3>
                      <button
                        className="edit-profile-btn"
                        onClick={() => navigate("/edit-profile")}
                      >
                        Editar Perfil
                      </button>
                    </div>

                    <div className="user-info-grid">
                      <div className="info-group">
                        <label>Nombre Completo</label>
                        <div className="info-value">
                          {String(userInfo.nombre)}
                        </div>
                      </div>
                      <div className="info-group">
                        <label>Correo Electrónico</label>
                        <div className="info-value">
                          {String(userInfo.correo)}
                        </div>
                      </div>
                      <div className="info-group">
                        <label>Teléfono</label>
                        <div className="info-value">
                          {String(userInfo.telefono)}
                        </div>
                      </div>
                      <div className="info-group">
                        <label>Documento de Identidad</label>
                        <div className="info-value">
                          {String(userInfo.documento)}
                        </div>
                      </div>
                      <div className="info-group">
                        <label>Tipo de Usuario</label>
                        <div
                          className={`info-value user-role-badge ${
                            isAdminUser() ? "admin-badge" : "client-badge"
                          }`}
                        >
                          {String(userInfo.role)}
                        </div>
                      </div>
                    </div>

                    {isAdminUser() && (
                      <div className="admin-info-message">
                        <div className="message-icon">ℹ️</div>
                        <div className="message-content">
                          <strong>Información importante:</strong>
                          <p>
                            Como usuario administrador, puedes visualizar la
                            información de los vuelos pero no realizar reservas
                            ni compras.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "payment" && flightData && (
                <div className="payment-details-enhanced">
                  <div className="payment-card">
                    <h3>💳 Resumen de Pago</h3>

                    <div className="price-breakdown">
                      <div className="price-row">
                        <span>
                          Tarifa base (
                          {selectedClass === "vip" ? "VIP" : "Económica"})
                        </span>
                        <span>
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(
                            selectedClass === "vip"
                              ? flightData.costo_vip || // ← CORREGIDO
                                  flightData.priceNumber ||
                                  0
                              : flightData.priceNumber || 0
                          )}
                        </span>
                      </div>
                      <div className="price-divider-enhanced"></div>

                      <div className="price-row total">
                        <span>Total a pagar</span>
                        <span className="total-price">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(totalPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="payment-features">
                      <div className="payment-feature">
                        <span className="feature-check">✓</span>
                        <span>Pago 100% seguro</span>
                      </div>
                      <div className="payment-feature">
                        <span className="feature-check">✓</span>
                        <span>Factura electrónica incluida</span>
                      </div>
                      <div className="payment-feature">
                        <span className="feature-check">✓</span>
                        <span>Soporte 24/7</span>
                      </div>
                    </div>

                    {isAdminUser() && (
                      <div className="admin-restriction-message">
                        <div className="restriction-icon">⛔</div>
                        <div className="restriction-content">
                          <h4>Función no disponible</h4>
                          <p>
                            Los usuarios administradores no pueden realizar
                            reservas ni compras de vuelos.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Resumen y acciones */}
          <div className="reservation-sidebar">
            <div className="sidebar-card">
              <h3>Resumen del Viaje</h3>

              <div className="route-summary">
                <div className="cities">
                  <span className="city-from">
                    {String(flightData?.departure?.city || "N/A")}
                  </span>
                  <span className="arrow">→</span>
                  <span className="city-to">
                    {String(flightData?.arrival?.city || "N/A")}
                  </span>
                </div>
                <div className="dates">
                  {String(flightData?.departure?.date || "Fecha no disponible")}
                  {location.state?.searchParams?.tripType === "roundtrip" &&
                    ` - ${String(
                      location.state.searchParams.returnDate ||
                        "Fecha no disponible"
                    )}`}
                </div>
                <div className="class-selected">
                  <strong>Clase:</strong>{" "}
                  {selectedClass === "vip" ? "VIP" : "Económica"}
                </div>
              </div>

              <div className="price-summary-sidebar">
                <div className="price-item-sidebar">
                  <span>
                    Subtotal ({selectedClass === "vip" ? "VIP" : "Económica"}):
                  </span>
                  <span>
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(
                      selectedClass === "vip"
                        ? (flightData.costo_vip || // ← CORREGIDO
                            flightData.priceNumber ||
                            0) *
                            (location.state?.searchParams?.tripType ===
                            "roundtrip"
                              ? 2
                              : 1)
                        : (flightData.priceNumber || 0) *
                            (location.state?.searchParams?.tripType ===
                            "roundtrip"
                              ? 2
                              : 1)
                    )}
                  </span>
                </div>
                <div className="price-total-sidebar">
                  <span>Total:</span>
                  <span className="total-amount">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="sidebar-actions">
                {canMakeReservations() ? (
                  <>
                    <button
                      className="action-btn reserve-btn-sidebar"
                      onClick={handleReserveFlight}
                    >
                      <span className="btn-icon">📅</span>
                      Reservar Vuelo
                      <span className="btn-subtitle">24 horas sin pago</span>
                    </button>

                    <button
                      className="action-btn buy-btn-sidebar"
                      onClick={handleBuyFlight}
                    >
                      <span className="btn-icon">🎫</span>
                      Comprar Ahora
                      <span className="btn-subtitle">
                        Confirmación inmediata
                      </span>
                    </button>
                  </>
                ) : (
                  <div className="admin-restriction-sidebar">
                    <div className="restriction-icon-sidebar">⚙️</div>
                    <div className="restriction-text">
                      <strong>Modo Administración</strong>
                      <p>
                        Las reservas y compras no están disponibles para
                        usuarios administradores.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReserveFlight;
