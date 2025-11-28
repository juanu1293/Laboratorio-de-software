import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CancelFlights.css";

const CancelFlights = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados para los vuelos
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);

  // Estados para filtros
  const [filters, setFilters] = useState({
    origen: "",
    destino: "",
    estado: "",
    tipo_vuelo: "",
    fecha: "",
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [flightsPerPage] = useState(10);

  // Estados para modal de confirmación
  const [showModal, setShowModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Verificar autenticación y permisos
  useEffect(() => {
    checkAuthAndPermissions();
    loadFlights();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [filters, flights]);

  const checkAuthAndPermissions = () => {
    const authToken =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const userData =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");

    if (authToken && userData) {
      try {
        const user = JSON.parse(userData);
        const userRole = user.tipo_usuario || user.role || "Usuario";

        const allowedRoles = ["Administrador", "administrador", "admin"];

        if (!allowedRoles.includes(userRole)) {
          alert(
            `⛔ Acceso denegado. \n\nSolo los usuarios con rol "Administrador" pueden cancelar vuelos.\n\nTu rol actual: ${userRole}`
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
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  };

  // Cargar vuelos desde localStorage y API
  const loadFlights = async () => {
    try {
      setLoading(true);

      // 1. Cargar desde localStorage (vuelos gestionados)
      const managedFlights = JSON.parse(
        localStorage.getItem("vivaSky_managedFlights") || "[]"
      );

      // 2. Intentar cargar desde API
      let apiFlights = [];
      try {
        const authToken =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");
        const response = await fetch("http://localhost:5000/api/flights", {
          headers: {
            Authorization: "Bearer " + authToken,
          },
        });

        if (response.ok) {
          const data = await response.json();
          apiFlights = Array.isArray(data) ? data : data.vuelos || [];
        }
      } catch (error) {
        console.log(
          "No se pudieron cargar vuelos de la API, usando datos locales"
        );
      }

      // Combinar y procesar vuelos
      const allFlights = [
        ...managedFlights,
        ...apiFlights.map((flight) => ({
          id: flight.id_vuelo || flight.id,
          flightNumber:
            flight.numero_vuelo || `VS${flight.id_vuelo || flight.id}`,
          route: `${flight.origen} → ${flight.destino}`,
          schedule: `${flight.hora_salida || "08:00"} - ${
            flight.hora_llegada || "10:00"
          }`,
          price: flight.costo_economico || flight.precio || 0,
          status: flight.estado || "Activo",
          tipo_vuelo: flight.tipo_vuelo || "ida",
          fecha_salida: flight.fecha_salida,
          origen: flight.origen,
          destino: flight.destino,
          hora_salida: flight.hora_salida,
          hora_llegada: flight.hora_llegada,
        })),
      ];

      // Filtrar solo vuelos activos
      const activeFlights = allFlights.filter(
        (flight) => flight.status === "Activo" || flight.status === "active"
      );

      setFlights(activeFlights);
      setFilteredFlights(activeFlights);
    } catch (error) {
      console.error("Error cargando vuelos:", error);
      setFlights([]);
      setFilteredFlights([]);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = flights;

    if (filters.origen) {
      filtered = filtered.filter((flight) =>
        flight.origen?.toLowerCase().includes(filters.origen.toLowerCase())
      );
    }

    if (filters.destino) {
      filtered = filtered.filter((flight) =>
        flight.destino?.toLowerCase().includes(filters.destino.toLowerCase())
      );
    }

    if (filters.estado) {
      filtered = filtered.filter(
        (flight) =>
          flight.status?.toLowerCase() === filters.estado.toLowerCase()
      );
    }

    if (filters.tipo_vuelo) {
      filtered = filtered.filter(
        (flight) =>
          flight.tipo_vuelo?.toLowerCase() === filters.tipo_vuelo.toLowerCase()
      );
    }

    if (filters.fecha) {
      filtered = filtered.filter(
        (flight) => flight.fecha_salida === filters.fecha
      );
    }

    setFilteredFlights(filtered);
    setCurrentPage(1); // Resetear a primera página al aplicar filtros
  };

  // Manejar cambio de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      origen: "",
      destino: "",
      estado: "",
      tipo_vuelo: "",
      fecha: "",
    });
  };

  // Paginación
  const getPaginatedFlights = () => {
    const indexOfLastFlight = currentPage * flightsPerPage;
    const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
    return filteredFlights.slice(indexOfFirstFlight, indexOfLastFlight);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredFlights.length / flightsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  // Manejar cancelación de vuelo
  const handleCancelFlight = (flight) => {
    setSelectedFlight(flight);
    setShowModal(true);
  };

  // Confirmar cancelación
  const confirmCancel = async () => {
    if (!selectedFlight) return;

    try {
      const authToken =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      // 1. Actualizar en localStorage
      const managedFlights = JSON.parse(
        localStorage.getItem("vivaSky_managedFlights") || "[]"
      );
      const updatedManagedFlights = managedFlights.map((flight) =>
        flight.id === selectedFlight.id
          ? { ...flight, status: "Cancelado" }
          : flight
      );
      localStorage.setItem(
        "vivaSky_managedFlights",
        JSON.stringify(updatedManagedFlights)
      );

      // 2. Intentar actualizar en API
      try {
        const response = await fetch(
          `http://localhost:5000/api/flights/${selectedFlight.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + authToken,
            },
            body: JSON.stringify({
              estado: "cancelado",
            }),
          }
        );

        if (!response.ok) {
          console.log(
            "No se pudo actualizar en la API, pero se canceló localmente"
          );
        }
      } catch (apiError) {
        console.log("Error de conexión con API, cancelación solo local");
      }

      // 3. Actualizar estado local
      setFlights((prev) =>
        prev.map((flight) =>
          flight.id === selectedFlight.id
            ? { ...flight, status: "Cancelado" }
            : flight
        )
      );

      alert(`✅ Vuelo ${selectedFlight.flightNumber} cancelado exitosamente`);
    } catch (error) {
      console.error("Error cancelando vuelo:", error);
      alert("❌ Error al cancelar el vuelo");
    } finally {
      setShowModal(false);
      setSelectedFlight(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    navigate("/");
  };

  const handleLogoClick = () => navigate("/");

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Componente del menú de usuario
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
              <div className="menu-section-title">Administración</div>
              <button
                className="menu-item"
                onClick={() => navigate("/manage-flights")}
              >
                <span className="menu-icon">✈️</span> Gestionar Vuelos
              </button>

              <button
                className="menu-item active"
                onClick={() => navigate("/cancel-flights")}
              >
                <span className="menu-icon">❌</span> Cancelar Vuelos
              </button>

              <div className="menu-divider"></div>

              <button className="menu-item logout" onClick={onLogout}>
                <span className="menu-icon">🚪</span> Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    );
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
          <p>Cargando vuelos...</p>
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

        {userInfo && <UserMenu userInfo={userInfo} onLogout={handleLogout} />}

        <button className="back-btn" onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </header>

      <div className="cancel-flights-container">
        <div className="admin-header">
          <h1>❌ Cancelación de Vuelos</h1>
          <p>Gestiona y cancela vuelos activos del sistema VivaSky</p>
        </div>

        {/* Filtros de búsqueda */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="origen">Origen</label>
              <input
                type="text"
                id="origen"
                name="origen"
                value={filters.origen}
                onChange={handleFilterChange}
                placeholder="Ej: Bogotá"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="destino">Destino</label>
              <input
                type="text"
                id="destino"
                name="destino"
                value={filters.destino}
                onChange={handleFilterChange}
                placeholder="Ej: Medellín"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="tipo_vuelo">Tipo de Vuelo</label>
              <select
                id="tipo_vuelo"
                name="tipo_vuelo"
                value={filters.tipo_vuelo}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="ida">Ida</option>
                <option value="regreso">Regreso</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="fecha">Fecha de Salida</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={filters.fecha}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="search-actions">
            <button className="clear-btn" onClick={clearFilters}>
              🔄 Limpiar Filtros
            </button>
            <div className="pagination-info">
              {filteredFlights.length} vuelos encontrados
            </div>
          </div>
        </div>

        {/* Lista de vuelos */}
        <div className="flights-list-section">
          <div className="section-header">
            <h2>Vuelos Activos Disponibles</h2>
            <div className="flights-count">
              Total: {filteredFlights.length} vuelos | Mostrando:{" "}
              {getPaginatedFlights().length} | Página {currentPage} de{" "}
              {totalPages}
            </div>
          </div>

          <div className="flights-table-container">
            <table className="flights-table">
              <thead>
                <tr>
                  <th>Vuelo</th>
                  <th>Ruta</th>
                  <th>Horario</th>
                  <th>Fecha Salida</th>
                  <th>Precio</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedFlights().map((flight) => (
                  <tr key={flight.id}>
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
                        <div className="route-dates">
                          {formatDate(flight.fecha_salida)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="schedule-cell">{flight.schedule}</div>
                    </td>
                    <td>
                      <div className="schedule-cell">
                        {formatDate(flight.fecha_salida)}
                      </div>
                    </td>
                    <td>
                      <div className="price-cell">
                        {formatPrice(flight.price)}
                      </div>
                    </td>
                    <td>
                      <div
                        className={`type-cell ${
                          flight.tipo_vuelo === "regreso"
                            ? "return-flight"
                            : "outbound-flight"
                        }`}
                      >
                        {flight.tipo_vuelo === "regreso" ? "Vuelta" : "Ida"}
                      </div>
                    </td>
                    <td>
                      <div className="status-cell active">{flight.status}</div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancelFlight(flight)}
                          title="Cancelar este vuelo"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredFlights.length === 0 && (
              <div className="no-flights-message">
                <div className="no-flights-icon">✈️</div>
                <h3>No hay vuelos activos</h3>
                <p>
                  No se encontraron vuelos que coincidan con los filtros
                  aplicados.
                </p>
              </div>
            )}

            {filteredFlights.length > 0 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Mostrando {getPaginatedFlights().length} de{" "}
                  {filteredFlights.length} vuelos
                </div>

                <div className="pagination-controls">
                  <button
                    className={`pagination-btn ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Anterior
                  </button>

                  {getPageNumbers().map((number) => (
                    <button
                      key={number}
                      className={`pagination-btn ${
                        currentPage === number ? "active" : ""
                      }`}
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    className={`pagination-btn ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente →
                  </button>
                </div>

                {totalPages > 5 && (
                  <div className="page-jump">
                    <span>Ir a página: </span>
                    <select
                      value={currentPage}
                      onChange={(e) => paginate(Number(e.target.value))}
                      className="page-select"
                    >
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <option key={page} value={page}>
                            {page}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de cancelación */}
      {showModal && selectedFlight && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>❌ Confirmar Cancelación</h3>
            </div>
            <div className="modal-content">
              <div className="flight-details">
                <div className="flight-detail-item">
                  <span className="detail-label">Vuelo:</span>
                  <span className="detail-value">
                    {selectedFlight.flightNumber}
                  </span>
                </div>
                <div className="flight-detail-item">
                  <span className="detail-label">Ruta:</span>
                  <span className="detail-value">{selectedFlight.route}</span>
                </div>
                <div className="flight-detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">
                    {formatDate(selectedFlight.fecha_salida)}
                  </span>
                </div>
                <div className="flight-detail-item">
                  <span className="detail-label">Horario:</span>
                  <span className="detail-value">
                    {selectedFlight.schedule}
                  </span>
                </div>
                <div className="flight-detail-item">
                  <span className="detail-label">Precio:</span>
                  <span className="detail-value">
                    {formatPrice(selectedFlight.price)}
                  </span>
                </div>
              </div>

              <p
                style={{
                  marginBottom: "20px",
                  color: "#e53e3e",
                  fontWeight: "600",
                }}
              >
                ⚠️ Esta acción no se puede deshacer. ¿Estás seguro de que deseas
                cancelar este vuelo?
              </p>

              <div className="modal-actions">
                <button
                  className="cancel-modal-btn"
                  onClick={() => setShowModal(false)}
                >
                  ↩️ Mantener Vuelo
                </button>
                <button className="confirm-cancel-btn" onClick={confirmCancel}>
                  ❌ Confirmar Cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelFlights;
