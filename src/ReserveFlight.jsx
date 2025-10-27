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

  // Verificar autenticación y obtener datos del vuelo
  useEffect(() => {
    const authCheck = checkAuth();

    if (!authCheck) {
      setLoading(false);
      return;
    }

    // Obtener datos del vuelo desde location.state
    if (location.state && location.state.flight) {
      setFlightData(location.state.flight);
      setLoading(false);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

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
                  navigate("/manage-flights"); // Cambiar esta línea
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

    const totalPrice =
      location.state?.searchParams?.tripType === "roundtrip"
        ? flightData.priceNumber * 2 * 1.15
        : flightData.priceNumber * 1.15;

    const formattedTotal = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(totalPrice);

    alert(
      `¡Vuelo ${flightData.flightNumber} reservado exitosamente!\n\n📧 Te hemos enviado un correo de confirmación a ${userInfo.correo}\n💰 Total reservado: ${formattedTotal}\n⏰ Tienes 24 horas para completar el pago`
    );
  };

  const handleBuyFlight = () => {
    if (!canMakeReservations()) {
      showAdminRestrictionMessage();
      return;
    }

    const totalPrice =
      location.state?.searchParams?.tripType === "roundtrip"
        ? flightData.priceNumber * 2 * 1.15
        : flightData.priceNumber * 1.15;

    const formattedTotal = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(totalPrice);

    alert(
      `¡Compra del vuelo ${flightData.flightNumber} realizada exitosamente!\n\n🎫 Recibirás tu boleto electrónico en ${userInfo.correo}\n💰 Total pagado: ${formattedTotal}\n✈️ ¡Buen viaje con VivaSky!`
    );
  };

  const showAdminRestrictionMessage = () => {
    alert(
      `⛔ Acción no permitida\n\nLos usuarios con rol de "${userRole}" no pueden realizar reservas ni compras de vuelos.\n\nEsta función está disponible únicamente para usuarios regulares (Cliente/Usuario).`
    );
  };

  // Calcular precio total
  const calculateTotalPrice = () => {
    const basePrice =
      location.state?.searchParams?.tripType === "roundtrip"
        ? flightData.priceNumber * 2
        : flightData.priceNumber;

    const taxes = basePrice * 0.15;
    return {
      base: basePrice,
      taxes: taxes,
      total: basePrice + taxes,
    };
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

  const priceSummary = calculateTotalPrice();

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
                con rol de <strong>{userRole}</strong> no pueden realizar
                reservas ni compras de vuelos.
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
              {activeTab === "flight" && (
                <div className="flight-details-enhanced">
                  <div className="flight-card-enhanced">
                    <div className="flight-header-enhanced">
                      <div className="airline-info">
                        <span className="airline-logo">✈️</span>
                        <div>
                          <h3>{flightData.airline}</h3>
                          <p className="flight-number">
                            {flightData.flightNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flight-price-tag">{flightData.price}</div>
                    </div>

                    <div className="flight-route-enhanced">
                      <div className="route-segment-enhanced">
                        <div className="time-large">
                          {flightData.departure.time}
                        </div>
                        <div className="airport-info">
                          <div className="airport-code-large">
                            {flightData.departure.airport}
                          </div>
                          <div className="city-name">
                            {flightData.departure.city}
                          </div>
                        </div>
                        <div className="date-info">
                          {flightData.departure.date}
                        </div>
                      </div>

                      <div className="route-middle-enhanced">
                        <div className="duration-badge">
                          {flightData.duration}
                        </div>
                        <div className="route-line">
                          <div className="line"></div>
                          <div className="plane-flying">✈️</div>
                        </div>
                        <div className="stops-info">{flightData.stops}</div>
                      </div>

                      <div className="route-segment-enhanced">
                        <div className="time-large">
                          {flightData.arrival.time}
                        </div>
                        <div className="airport-info">
                          <div className="airport-code-large">
                            {flightData.arrival.airport}
                          </div>
                          <div className="city-name">
                            {flightData.arrival.city}
                          </div>
                        </div>
                        <div className="date-info">
                          {flightData.arrival.date}
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
                        <span>Duración: {flightData.duration}</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">🛬</span>
                        <span>Vuelo: {flightData.stops}</span>
                      </div>
                    </div>
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
                                {flightData.arrival.airport}
                              </div>
                              <div className="city-name">
                                {flightData.arrival.city}
                              </div>
                            </div>
                            <div className="date-info">
                              {location.state?.searchParams?.returnDate}
                            </div>
                          </div>

                          <div className="route-middle-enhanced">
                            <div className="duration-badge">
                              {flightData.duration}
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
                                const durationMatch = flightData.duration.match(
                                  /(\d+)h\s*(\d+)m|(\d+)h|(\d+)m/
                                );
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
                                {flightData.departure.airport}
                              </div>
                              <div className="city-name">
                                {flightData.departure.city}
                              </div>
                            </div>
                            <div className="date-info">
                              {location.state?.searchParams?.returnDate}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "user" && (
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
                        <div className="info-value">{userInfo.nombre}</div>
                      </div>
                      <div className="info-group">
                        <label>Correo Electrónico</label>
                        <div className="info-value">{userInfo.correo}</div>
                      </div>
                      <div className="info-group">
                        <label>Teléfono</label>
                        <div className="info-value">{userInfo.telefono}</div>
                      </div>
                      <div className="info-group">
                        <label>Documento de Identidad</label>
                        <div className="info-value">{userInfo.documento}</div>
                      </div>
                      <div className="info-group">
                        <label>Tipo de Usuario</label>
                        <div
                          className={`info-value user-role-badge ${
                            isAdminUser() ? "admin-badge" : "client-badge"
                          }`}
                        >
                          {userInfo.role}
                        </div>
                      </div>
                    </div>

                    {/* Mensaje para administradores - SOLO para administradores */}
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

              {activeTab === "payment" && (
                <div className="payment-details-enhanced">
                  <div className="payment-card">
                    <h3>💳 Resumen de Pago</h3>

                    <div className="price-breakdown">
                      <div className="price-row">
                        <span>Tarifa base</span>
                        <span>
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(priceSummary.base)}
                        </span>
                      </div>

                      <div className="price-row">
                        <span>Impuestos y tasas (15%)</span>
                        <span>
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(priceSummary.taxes)}
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
                          }).format(priceSummary.total)}
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

                    {/* Mensaje de restricción para administradores - SOLO para administradores */}
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
                  <span className="city-from">{flightData.departure.city}</span>
                  <span className="arrow">→</span>
                  <span className="city-to">{flightData.arrival.city}</span>
                </div>
                <div className="dates">
                  {flightData.departure.date}
                  {location.state?.searchParams?.tripType === "roundtrip" &&
                    ` - ${location.state.searchParams.returnDate}`}
                </div>
              </div>

              <div className="price-summary-sidebar">
                <div className="price-item-sidebar">
                  <span>Subtotal:</span>
                  <span>
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(priceSummary.base)}
                  </span>
                </div>
                <div className="price-item-sidebar">
                  <span>Impuestos:</span>
                  <span>
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(priceSummary.taxes)}
                  </span>
                </div>
                <div className="price-total-sidebar">
                  <span>Total:</span>
                  <span className="total-amount">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(priceSummary.total)}
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
