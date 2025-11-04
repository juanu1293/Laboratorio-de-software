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
    tipo_vuelo: "solo_ida",
    origen: "",
    destino: "",
    fecha_salida: "",
    hora_salida: "",
    fecha_llegada: "",
    hora_llegada: "",
    costo_economico: "",
    costo_vip: "",
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
    "Tunja",
    "Florencia",
    "Quibdó",
    "Arauca",
    "Yopal",
    "Mocoa",
    "San José del Guaviare",
    "Leticia",
    "Mitú",
    "Puerto Carreño",
    "San Andrés",
    "Madrid",
    "Londres",
    "New York",
    "Buenos Aires",
    "Miami",
  ];

  // 🔄 NUEVO: Función para guardar vuelo en localStorage
  const saveFlightToLocalList = (flightData) => {
    try {
      // Obtener vuelos existentes
      const existingFlights = JSON.parse(
        localStorage.getItem("vivaSky_managedFlights") || "[]"
      );

      // Crear objeto simple para la lista
      const newFlightForList = {
        id: Date.now(),
        flightNumber: `VS${flightData.id_vuelo || "NEW"}`,
        route: `${flightData.origen} → ${flightData.destino}`,
        schedule: `${flightData.hora_salida.substring(
          0,
          5
        )} - ${calculateArrivalTime(flightData.hora_salida)}`,
        price: Number(flightData.costo_economico),
        status: "Activo",
      };

      // Agregar y guardar
      const updatedFlights = [...existingFlights, newFlightForList];
      localStorage.setItem(
        "vivaSky_managedFlights",
        JSON.stringify(updatedFlights)
      );
    } catch (error) {
      console.error("Error guardando en lista local:", error);
    }
  };

  // 🔄 NUEVO: Función auxiliar para calcular hora de llegada
  const calculateArrivalTime = (departureTime) => {
    if (!departureTime) return "10:00";
    try {
      const [hours, minutes] = departureTime.split(":").map(Number);
      let totalMinutes = hours * 60 + minutes + 120;
      const arrivalHours = Math.floor(totalMinutes / 60) % 24;
      const arrivalMinutes = totalMinutes % 60;
      return `${arrivalHours.toString().padStart(2, "0")}:${arrivalMinutes
        .toString()
        .padStart(2, "0")}`;
    } catch {
      return "10:00";
    }
  };

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

        // 🔒 SOLO Administrador puede acceder
        const allowedRoles = ["Administrador", "administrador"];

        if (!allowedRoles.includes(userRole)) {
          alert(
            `⛔ Acceso denegado. \n\nSolo los usuarios con rol "Administrador" pueden acceder a la gestión de vuelos.\n\nTu rol actual: ${userRole}`
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

  // 🔄 MODIFICADO: Cargar vuelos del localStorage o usar ejemplos
  const loadSampleFlights = () => {
    try {
      // Intentar cargar vuelos guardados
      const savedFlights = localStorage.getItem("vivaSky_managedFlights");
      if (savedFlights) {
        setFlights(JSON.parse(savedFlights));
      } else {
        // Si no hay guardados, usar los de ejemplo
        setFlights([
          {
            id: 1,
            flightNumber: "VS202",
            route: "Bogotá → Medellín",
            schedule: "08:00 - 08:45",
            price: 350000,
            status: "Activo",
          },
          {
            id: 2,
            flightNumber: "VS455",
            route: "Bogotá → Cartagena",
            schedule: "14:20 - 15:45",
            price: 420000,
            status: "Activo",
          },
        ]);
      }
    } catch (error) {
      console.error("Error cargando vuelos:", error);
      // En caso de error, cargar ejemplos
      setFlights([
        {
          id: 1,
          flightNumber: "VS202",
          route: "Bogotá → Medellín",
          schedule: "08:00 - 08:45",
          price: 350000,
          status: "Activo",
        },
        {
          id: 2,
          flightNumber: "VS455",
          route: "Bogotá → Cartagena",
          schedule: "14:20 - 15:45",
          price: 420000,
          status: "Activo",
        },
      ]);
    }
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
      !flightForm.origen ||
      !flightForm.destino ||
      !flightForm.fecha_salida ||
      !flightForm.hora_salida ||
      !flightForm.costo_economico ||
      !flightForm.costo_vip
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
        prev.map((flights) =>
          flights.id === editingFlight.id ? newFlight : flights
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

  const handleEditFlight = (flights) => {
    setEditingFlight(flights);
    setFlightForm({
      airline: flights.airline,
      flightNumber: flights.flightNumber,
      origin: flights.origin,
      destination: flights.destination,
      departureTime: flights.departureTime,
      arrivalTime: flights.arrivalTime,
      duration: flights.duration,
      price: flights.price.toString(),
      stops: flights.stops,
      baggage: flights.baggage,
      status: flights.status,
    });
    setActiveTab("create");
  };

  // 🔄 MODIFICADO: Eliminar vuelo también del localStorage
  const handleDeleteFlight = (flightId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este vuelo?")) {
      const updatedFlights = flights.filter((flight) => flight.id !== flightId);
      setFlights(updatedFlights);
      // Guardar en localStorage también
      localStorage.setItem(
        "vivaSky_managedFlights",
        JSON.stringify(updatedFlights)
      );
      alert("✅ Vuelo eliminado exitosamente");
    }
  };

  // 🔄 MODIFICADO: Cambiar estado también en localStorage
  const handleToggleStatus = (flightId) => {
    const updatedFlights = flights.map((flight) =>
      flight.id === flightId
        ? {
            ...flight,
            status: flight.status === "Activo" ? "Inactivo" : "Activo",
          }
        : flight
    );
    setFlights(updatedFlights);
    // Guardar en localStorage también
    localStorage.setItem(
      "vivaSky_managedFlights",
      JSON.stringify(updatedFlights)
    );
    // 🔥 GUARDAR ESTADO EN LOCALSTORAGE SEPARADO
    const flightStatusMap = JSON.parse(
      localStorage.getItem("vivaSky_flightStatus") || "{}"
    );
    flightStatusMap[flightId] = updatedFlights.find(
      (f) => f.id === flightId
    ).status;
    localStorage.setItem(
      "vivaSky_flightStatus",
      JSON.stringify(flightStatusMap)
    );

    alert(
      `✅ Vuelo ${
        updatedFlights.find((f) => f.id === flightId).status === "Activo"
          ? "activado"
          : "desactivado"
      } exitosamente`
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
                          </div>
                        </td>
                        <td>
                          <div className="route-info-cell">
                            <div className="route">{flight.route}</div>
                          </div>
                        </td>
                        <td>
                          <div className="schedule-cell">{flight.schedule}</div>
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

              <form
                className="flight-form"
                onSubmit={async (e) => {
                  e.preventDefault();

                  // Validación básica
                  if (
                    !flightForm.origen ||
                    !flightForm.destino ||
                    !flightForm.fecha_salida ||
                    !flightForm.hora_salida ||
                    !flightForm.costo_economico ||
                    !flightForm.costo_vip
                  ) {
                    alert(
                      "⚠️ Por favor completa todos los campos obligatorios."
                    );
                    return;
                  }

                  // Si el vuelo es ida y vuelta, validar también los campos de regreso
                  if (
                    flightForm.tipo_vuelo === "ida_y_vuelta" &&
                    (!flightForm.fecha_llegada || !flightForm.hora_llegada)
                  ) {
                    alert(
                      "⚠️ Debes ingresar la fecha y hora de regreso para un vuelo ida y vuelta."
                    );
                    return;
                  }

                  try {
                    const response = await fetch(
                      "http://localhost:5000/api/flights",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization:
                            "Bearer " +
                            (localStorage.getItem("authToken") ||
                              sessionStorage.getItem("authToken")),
                        },
                        body: JSON.stringify({
                          origen: flightForm.origen,
                          destino: flightForm.destino,
                          fecha_salida: flightForm.fecha_salida,
                          hora_salida: flightForm.hora_salida,
                          // Si es solo ida, enviamos las mismas fecha/hora de salida como placeholders
                          fecha_llegada:
                            flightForm.tipo_vuelo === "solo_ida"
                              ? flightForm.fecha_salida
                              : flightForm.fecha_llegada,
                          hora_llegada:
                            flightForm.tipo_vuelo === "solo_ida"
                              ? flightForm.hora_salida
                              : flightForm.hora_llegada,
                          costo_economico: Number(flightForm.costo_economico),
                          costo_vip: Number(flightForm.costo_vip),
                          tipo_vuelo: flightForm.tipo_vuelo,
                        }),
                      }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                      alert(
                        "❌ Error: " +
                          (data.mensaje || "No se pudo crear el vuelo")
                      );
                      return;
                    }

                    alert("✅ Vuelo creado exitosamente");

                    // 🔄 NUEVO: Guardar en la lista local también
                    saveFlightToLocalList({
                      id_vuelo: data.id_vuelo,
                      origen: flightForm.origen,
                      destino: flightForm.destino,
                      hora_salida: flightForm.hora_salida,
                      costo_economico: flightForm.costo_economico,
                    });

                    // Recargar la lista de vuelos
                    loadSampleFlights();

                    setFlightForm({
                      tipo_vuelo: "solo_ida",
                      origen: "",
                      destino: "",
                      fecha_salida: "",
                      hora_salida: "",
                      fecha_llegada: "",
                      hora_llegada: "",
                      costo_economico: "",
                      costo_vip: "",
                    });

                    // Cambiar a la pestaña de ver vuelos
                    setActiveTab("view");
                  } catch (error) {
                    console.error("Error al crear vuelo:", error);
                    alert("❌ Error al conectar con el servidor");
                  }
                }}
              >
                <div className="form-grid">
                  {/* Tipo de vuelo */}
                  <div className="form-group">
                    <label htmlFor="tipo_vuelo">Tipo de vuelo *</label>
                    <select
                      id="tipo_vuelo"
                      name="tipo_vuelo"
                      value={flightForm.tipo_vuelo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="solo_ida">Solo ida</option>
                      <option value="ida_y_vuelta">Ida y vuelta</option>
                    </select>
                  </div>

                  {/* Origen y destino */}
                  <div className="form-group">
                    <label htmlFor="origen">Origen *</label>
                    <select
                      id="origen"
                      name="origen"
                      value={flightForm.origen}
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
                    <label htmlFor="destino">Destino *</label>
                    <select
                      id="destino"
                      name="destino"
                      value={flightForm.destino}
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

                  {/* Fecha y hora de salida */}
                  <div className="form-group">
                    <label htmlFor="fecha_salida">Fecha de salida *</label>
                    <input
                      type="date"
                      id="fecha_salida"
                      name="fecha_salida"
                      value={flightForm.fecha_salida}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="hora_salida">Hora de salida *</label>
                    <input
                      type="time"
                      id="hora_salida"
                      name="hora_salida"
                      value={flightForm.hora_salida}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Solo mostrar si es ida y vuelta */}
                  {flightForm.tipo_vuelo === "ida_y_vuelta" && (
                    <>
                      <div className="form-group">
                        <label htmlFor="fecha_llegada">
                          Fecha de regreso *
                        </label>
                        <input
                          type="date"
                          id="fecha_llegada"
                          name="fecha_llegada"
                          value={flightForm.fecha_llegada}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="hora_llegada">Hora de regreso *</label>
                        <input
                          type="time"
                          id="hora_llegada"
                          name="hora_llegada"
                          value={flightForm.hora_llegada}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Costos */}
                  <div className="form-group">
                    <label htmlFor="costo_economico">
                      Costo Económico (COP) *
                    </label>
                    <input
                      type="number"
                      id="costo_economico"
                      name="costo_economico"
                      value={flightForm.costo_economico}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="costo_vip">Costo VIP (COP) *</label>
                    <input
                      type="number"
                      id="costo_vip"
                      name="costo_vip"
                      value={flightForm.costo_vip}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn primary">
                    ✈️ Crear Vuelo
                  </button>
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
                      {
                        new Set(flights.map((f) => f.route.split(" → ")[0]))
                          .size
                      }
                    </div>
                    <div className="stat-label">Ciudades de Origen</div>
                  </div>
                </div>
              </div>

              <div className="routes-stats">
                <h3>Rutas Más Populares</h3>
                <div className="routes-list">
                  {[...new Set(flights.map((f) => f.route))]
                    .slice(0, 5)
                    .map((route) => (
                      <div key={route} className="route-item">
                        <span className="route-name">{route}</span>
                        <span className="route-count">
                          {flights.filter((f) => f.route === route).length}{" "}
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
