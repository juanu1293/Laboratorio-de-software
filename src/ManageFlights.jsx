import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const ManageFlights = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("view");
  const [flights, setFlights] = useState([]);
  const [editingFlight, setEditingFlight] = useState(null);

  // Estados para el formulario de crear/editar vuelo
  const [flightForm, setFlightForm] = useState({
    airline: "VivaSky Airlines",
    flightNumber: "",
    origin: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    price: "",
    stops: "Directo",
    baggage: "15kg",
    status: "Activo",
  });

  // Lista de ciudades disponibles
  const cities = [
    "Bogotá",
    "Medellín",
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Cúcuta",
    "Bucaramanga",
    "Pereira",
    "Santa Marta",
    "Ibagué",
    "Pasto",
    "Manizales",
    "Neiva",
    "Villavicencio",
    "Armenia",
    "Valledupar",
    "Montería",
    "Sincelejo",
    "Popayán",
    "Riohacha",
    "Madrid",
    "Londres",
    "New York",
    "Buenos Aires",
    "Miami",
  ];

  // Verificar autenticación y permisos
  useEffect(() => {
    checkAuthAndPermissions();
    // Cargar vuelos de ejemplo
    loadSampleFlights();
  }, []);

  const checkAuthAndPermissions = () => {
    const authToken =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const userData =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");

    if (authToken && userData) {
      try {
        const user = JSON.parse(userData);
        const userRole = user.tipo_usuario || user.role || "Usuario";

        // Verificar si es administrador
        const adminRoles = ["Administrador", "administrador", "admin", "root"];
        if (!adminRoles.includes(userRole)) {
          alert(
            "⛔ Acceso denegado. Solo los administradores pueden acceder a esta página."
          );
          navigate("/");
          return;
        }

        setUserInfo({
          nombre: user.nombre,
          correo: user.correo,
          role: userRole,
        });
        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  };

  const loadSampleFlights = () => {
    // Datos de ejemplo para vuelos
    const sampleFlights = [
      {
        id: 1,
        airline: "VivaSky Airlines",
        flightNumber: "VS202",
        origin: "Bogotá",
        destination: "Medellín",
        departureTime: "08:00",
        arrivalTime: "08:45",
        duration: "45m",
        price: 350000,
        stops: "Directo",
        baggage: "15kg",
        status: "Activo",
      },
      {
        id: 2,
        airline: "VivaSky Airlines",
        flightNumber: "VS455",
        origin: "Bogotá",
        destination: "Cartagena",
        departureTime: "14:20",
        arrivalTime: "15:45",
        duration: "1h 25m",
        price: 420000,
        stops: "Directo",
        baggage: "15kg",
        status: "Activo",
      },
      {
        id: 3,
        airline: "VivaSky Airlines",
        flightNumber: "VS789",
        origin: "Medellín",
        destination: "Cali",
        departureTime: "11:30",
        arrivalTime: "12:20",
        duration: "50m",
        price: 380000,
        stops: "Directo",
        baggage: "15kg",
        status: "Inactivo",
      },
    ];
    setFlights(sampleFlights);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");

    setUserInfo(null);
    setIsAdmin(false);
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
            <span className="user-role admin-role">{userInfo.role}</span>
          </div>
          <span>▼</span>
        </button>

        {showMenu && (
          <div className="user-menu-dropdown">
            <div className="user-menu-header">
              <div className="user-welcome">{userInfo.nombre}</div>
              <div className="user-menu-email">{userInfo.correo}</div>
              <div className="user-role-badge admin-badge">{userInfo.role}</div>
            </div>

            <div className="user-menu-items">
              <div className="menu-section-title">Mi Cuenta</div>
              <button
                className="menu-item"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/edit-profile");
                }}
              >
                <span className="menu-icon">👤</span>
                Editar Perfil
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

              <div className="menu-divider"></div>

              <div className="menu-section-title">Administración</div>
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
                  alert("Panel de control próximamente disponible");
                }}
              >
                <span className="menu-icon">📊</span>
                Panel de Control
              </button>

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFlightForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateFlight = (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (
      !flightForm.flightNumber ||
      !flightForm.origin ||
      !flightForm.destination
    ) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    const newFlight = {
      id: editingFlight ? editingFlight.id : Date.now(),
      ...flightForm,
      price: parseInt(flightForm.price),
    };

    if (editingFlight) {
      // Editar vuelo existente
      setFlights((prev) =>
        prev.map((flight) =>
          flight.id === editingFlight.id ? newFlight : flight
        )
      );
      alert("✅ Vuelo actualizado exitosamente");
    } else {
      // Crear nuevo vuelo
      setFlights((prev) => [...prev, newFlight]);
      alert("✅ Vuelo creado exitosamente");
    }

    // Limpiar formulario
    setFlightForm({
      airline: "VivaSky Airlines",
      flightNumber: "",
      origin: "",
      destination: "",
      departureTime: "",
      arrivalTime: "",
      duration: "",
      price: "",
      stops: "Directo",
      baggage: "15kg",
      status: "Activo",
    });
    setEditingFlight(null);
  };

  const handleEditFlight = (flight) => {
    setEditingFlight(flight);
    setFlightForm({
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      price: flight.price.toString(),
      stops: flight.stops,
      baggage: flight.baggage,
      status: flight.status,
    });
    setActiveTab("create");
  };

  const handleDeleteFlight = (flightId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este vuelo?")) {
      setFlights((prev) => prev.filter((flight) => flight.id !== flightId));
      alert("✅ Vuelo eliminado exitosamente");
    }
  };

  const handleToggleStatus = (flightId) => {
    setFlights((prev) =>
      prev.map((flight) =>
        flight.id === flightId
          ? {
              ...flight,
              status: flight.status === "Activo" ? "Inactivo" : "Activo",
            }
          : flight
      )
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

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
          <p>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
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
          <div className="error-icon">⛔</div>
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta página.</p>
          <button className="back-btn" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

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

        {/* Mostrar información del usuario administrador */}
        {userInfo && <UserMenu userInfo={userInfo} onLogout={handleLogout} />}

        <button className="back-btn" onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </header>

      {/* Contenido principal */}
      <div className="manage-flights-container">
        <div className="admin-header">
          <h1>🛠️ Gestión de Vuelos</h1>
          <p>Administra y gestiona todos los vuelos de VivaSky Airlines</p>
        </div>

        {/* Pestañas de navegación */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-button ${
              activeTab === "view" ? "active" : ""
            }`}
            onClick={() => setActiveTab("view")}
          >
            👁️ Ver Vuelos
          </button>
          <button
            className={`admin-tab-button ${
              activeTab === "create" ? "active" : ""
            }`}
            onClick={() => setActiveTab("create")}
          >
            {editingFlight ? "✏️ Editar Vuelo" : "➕ Crear Vuelo"}
          </button>
          <button
            className={`admin-tab-button ${
              activeTab === "stats" ? "active" : ""
            }`}
            onClick={() => setActiveTab("stats")}
          >
            📊 Estadísticas
          </button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="admin-tab-content">
          {/* Pestaña: Ver Vuelos */}
          {activeTab === "view" && (
            <div className="flights-list-section">
              <div className="section-header">
                <h2>Lista de Vuelos</h2>
                <div className="flights-count">
                  Total: {flights.length} vuelos
                </div>
              </div>

              <div className="flights-table-container">
                <table className="flights-table">
                  <thead>
                    <tr>
                      <th>Vuelo</th>
                      <th>Ruta</th>
                      <th>Horario</th>
                      <th>Duración</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map((flight) => (
                      <tr
                        key={flight.id}
                        className={
                          flight.status === "Inactivo" ? "inactive-flight" : ""
                        }
                      >
                        <td>
                          <div className="flight-info-cell">
                            <div className="flight-number">
                              {flight.flightNumber}
                            </div>
                            <div className="airline-name">{flight.airline}</div>
                          </div>
                        </td>
                        <td>
                          <div className="route-info-cell">
                            <div className="route">
                              <span className="city">{flight.origin}</span>
                              <span className="arrow">→</span>
                              <span className="city">{flight.destination}</span>
                            </div>
                            <div className="flight-details">
                              {flight.stops} • {flight.baggage}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="time-info-cell">
                            <div className="time">{flight.departureTime}</div>
                            <div className="time-separator">-</div>
                            <div className="time">{flight.arrivalTime}</div>
                          </div>
                        </td>
                        <td>
                          <div className="duration-cell">{flight.duration}</div>
                        </td>
                        <td>
                          <div className="price-cell">
                            {formatPrice(flight.price)}
                          </div>
                        </td>
                        <td>
                          <div
                            className={`status-cell ${
                              flight.status === "Activo" ? "active" : "inactive"
                            }`}
                          >
                            {flight.status}
                          </div>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEditFlight(flight)}
                              title="Editar vuelo"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-btn toggle-btn"
                              onClick={() => handleToggleStatus(flight.id)}
                              title={
                                flight.status === "Activo"
                                  ? "Desactivar vuelo"
                                  : "Activar vuelo"
                              }
                            >
                              {flight.status === "Activo" ? "⏸️" : "▶️"}
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteFlight(flight.id)}
                              title="Eliminar vuelo"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {flights.length === 0 && (
                  <div className="no-flights-message">
                    <div className="no-flights-icon">✈️</div>
                    <h3>No hay vuelos registrados</h3>
                    <p>
                      Comienza creando tu primer vuelo en la pestaña "Crear
                      Vuelo"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pestaña: Crear/Editar Vuelo */}
          {activeTab === "create" && (
            <div className="create-flight-section">
              <div className="section-header">
                <h2>{editingFlight ? "Editar Vuelo" : "Crear Nuevo Vuelo"}</h2>
                <p>
                  {editingFlight
                    ? "Modifica la información del vuelo seleccionado"
                    : "Completa el formulario para agregar un nuevo vuelo"}
                </p>
              </div>

              <form className="flight-form" onSubmit={handleCreateFlight}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="flightNumber">Número de Vuelo *</label>
                    <input
                      type="text"
                      id="flightNumber"
                      name="flightNumber"
                      value={flightForm.flightNumber}
                      onChange={handleInputChange}
                      placeholder="Ej: VS202"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="airline">Aerolínea</label>
                    <input
                      type="text"
                      id="airline"
                      name="airline"
                      value={flightForm.airline}
                      onChange={handleInputChange}
                      placeholder="Nombre de la aerolínea"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="origin">Origen *</label>
                    <select
                      id="origin"
                      name="origin"
                      value={flightForm.origin}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona una ciudad</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="destination">Destino *</label>
                    <select
                      id="destination"
                      name="destination"
                      value={flightForm.destination}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona una ciudad</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="departureTime">Hora de Salida *</label>
                    <input
                      type="time"
                      id="departureTime"
                      name="departureTime"
                      value={flightForm.departureTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="arrivalTime">Hora de Llegada *</label>
                    <input
                      type="time"
                      id="arrivalTime"
                      name="arrivalTime"
                      value={flightForm.arrivalTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="duration">Duración *</label>
                    <input
                      type="text"
                      id="duration"
                      name="duration"
                      value={flightForm.duration}
                      onChange={handleInputChange}
                      placeholder="Ej: 1h 30m"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Precio (COP) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={flightForm.price}
                      onChange={handleInputChange}
                      placeholder="Ej: 350000"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stops">Escalas</label>
                    <select
                      id="stops"
                      name="stops"
                      value={flightForm.stops}
                      onChange={handleInputChange}
                    >
                      <option value="Directo">Directo</option>
                      <option value="1 escala">1 escala</option>
                      <option value="2 escalas">2 escalas</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="baggage">Equipaje</label>
                    <select
                      id="baggage"
                      name="baggage"
                      value={flightForm.baggage}
                      onChange={handleInputChange}
                    >
                      <option value="15kg">15kg</option>
                      <option value="23kg">23kg</option>
                      <option value="30kg">30kg</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Estado</label>
                    <select
                      id="status"
                      name="status"
                      value={flightForm.status}
                      onChange={handleInputChange}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn primary">
                    {editingFlight ? "💾 Actualizar Vuelo" : "✈️ Crear Vuelo"}
                  </button>

                  {editingFlight && (
                    <button
                      type="button"
                      className="submit-btn secondary"
                      onClick={() => {
                        setEditingFlight(null);
                        setFlightForm({
                          airline: "VivaSky Airlines",
                          flightNumber: "",
                          origin: "",
                          destination: "",
                          departureTime: "",
                          arrivalTime: "",
                          duration: "",
                          price: "",
                          stops: "Directo",
                          baggage: "15kg",
                          status: "Activo",
                        });
                      }}
                    >
                      ❌ Cancelar Edición
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Pestaña: Estadísticas */}
          {activeTab === "stats" && (
            <div className="stats-section">
              <div className="section-header">
                <h2>Estadísticas de Vuelos</h2>
                <p>Resumen general de la operación de vuelos</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">✈️</div>
                  <div className="stat-content">
                    <div className="stat-number">{flights.length}</div>
                    <div className="stat-label">Total de Vuelos</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {flights.filter((f) => f.status === "Activo").length}
                    </div>
                    <div className="stat-label">Vuelos Activos</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⏸️</div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {flights.filter((f) => f.status === "Inactivo").length}
                    </div>
                    <div className="stat-label">Vuelos Inactivos</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🌎</div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {new Set(flights.map((f) => f.origin)).size}
                    </div>
                    <div className="stat-label">Ciudades de Origen</div>
                  </div>
                </div>
              </div>

              <div className="routes-stats">
                <h3>Rutas Más Populares</h3>
                <div className="routes-list">
                  {[
                    ...new Set(
                      flights.map((f) => `${f.origin} - ${f.destination}`)
                    ),
                  ]
                    .slice(0, 5)
                    .map((route) => (
                      <div key={route} className="route-item">
                        <span className="route-name">{route}</span>
                        <span className="route-count">
                          {
                            flights.filter(
                              (f) => `${f.origin} - ${f.destination}` === route
                            ).length
                          }{" "}
                          vuelos
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageFlights;
