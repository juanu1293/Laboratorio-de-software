import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

// Importamos los componentes
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ChangePassword from "./ChangePassword";
import UserMenu from "./UserMenu";
import EditProfile from "./EditProfile";
import CreateAdmin from "./CreateAdmin";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/create-admin" element={<CreateAdmin />} />
      </Routes>
    </Router>
  );
};

// Componente de la página de inicio
const HomePage = () => {
  const [tripType, setTripType] = useState("roundtrip");
  const [origin, setOrigin] = useState("Frankfurt am Main");
  const [destination, setDestination] = useState("Bangkok");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // URL de ejemplo para el logo
  const logoUrl =
    "https://i.pinimg.com/736x/60/48/b4/6048b4ae7f74724389d345767e8061a0.jpg";

  // Función para mostrar el mensaje de "próximamente"
  const handleComingSoon = () => {
    alert("Esta funcionalidad estará activa próximamente");
  };

  // Función para redirigir al inicio al hacer clic en el logo
  const handleLogoClick = () => {
    navigate("/");
  };

  // Función para formatear fecha en formato YYYY-MM-DD (para inputs type="date")
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Función para formatear fecha en formato legible (vie, 19 sept)
  const formatDisplayDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const options = { weekday: "short", day: "numeric", month: "short" };
    return date.toLocaleDateString("es-ES", options);
  };

  // Función para obtener la fecha local
  const getLocalDate = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  };

  // Verificar autenticación
  const checkAuth = () => {
    const authToken =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const userData =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");

    if (authToken && userData) {
      try {
        const user = JSON.parse(userData);
        setUserInfo({
          nombre: user.nombre,
          correo: user.correo,
          role: user.tipo_usuario || user.role || "Usuario", // Asegurar que tenga un valor por defecto
        });
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleLogout();
      }
    }
    return false;
  };

  // Efecto para manejar la información del usuario al cargar
  useEffect(() => {
    checkAuth();

    // Verificar si hay mensaje de bienvenida después del login
    if (location.state?.message) {
      setWelcomeMessage(location.state.message);
      const timer = setTimeout(() => {
        setWelcomeMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Inicializar fechas al cargar el componente
  useEffect(() => {
    const today = getLocalDate(new Date());
    const nextWeek = getLocalDate(new Date());
    nextWeek.setDate(today.getDate() + 7);

    setDepartureDate(formatDateForInput(today));
    setReturnDate(formatDateForInput(nextWeek));
  }, []);

  const popularDestinations = [
    {
      name: "Madrid",
      image:
        "https://i.pinimg.com/736x/94/a1/7b/94a17b9195902697d977665eca20cc2f.jpg",
      description:
        "Madrid, la capital de España, es conocida por su rica herencia cultural, edificios históricos y vida nocturna vibrante.",
      price: "****",
      duration: "* horas",
      bestTime: "**/**",
    },
    {
      name: "Nueva York",
      image:
        "https://i.pinimg.com/1200x/ec/d1/c5/ecd1c529ffa462f1ae3df97fbfbb1ab4.jpg",
      description:
        "Nueva York, la ciudad que nunca duerme, ofrece experiencias únicas con sus rascacielos, Broadway y diversidad cultural.",
      price: "**",
      duration: "* horas",
      bestTime: "**/**",
    },
    {
      name: "Miami",
      image:
        "https://i.pinimg.com/736x/59/36/24/59362492e00b42138c6af00da2ac4b5a.jpg",
      description:
        "Miami es famosa por sus playas soleadas, vida nocturna emocionante y influencia latinoamericana.",
      price: "****",
      duration: "* horas",
      bestTime: "**/**",
    },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();

    // Validación de fechas solo para viajes redondos
    if (
      tripType === "roundtrip" &&
      new Date(returnDate) < new Date(departureDate)
    ) {
      alert("La fecha de retorno no puede ser anterior a la fecha de salida");
      return;
    }

    // Mostrar información del vuelo en un alert (simulación)
    const salidaFormateada = formatDisplayDate(departureDate);
    const retornoFormateado =
      tripType === "roundtrip" ? formatDisplayDate(returnDate) : null;

    let mensajeVuelo = `Buscando vuelos de ${origin} a ${destination}\n`;
    mensajeVuelo += `Salida: ${salidaFormateada}\n`;

    if (tripType === "roundtrip") {
      mensajeVuelo += `Retorno: ${retornoFormateado}`;
    } else {
      mensajeVuelo += "Tipo: Solo ida";
    }

    alert(mensajeVuelo);
  };

  const handleDepartureDateChange = (e) => {
    const newDepartureDate = e.target.value;
    setDepartureDate(newDepartureDate);

    if (
      tripType === "roundtrip" &&
      new Date(returnDate) < new Date(newDepartureDate)
    ) {
      setReturnDate(newDepartureDate);
    }
  };

  const handleReturnDateChange = (e) => {
    setReturnDate(e.target.value);
  };

  const handleDestinationClick = (dest) => {
    // Mostrar modal directamente sin requerir autenticación
    setSelectedDestination(dest);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDestination(null);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    // Limpiar información de autenticación
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userEmail");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");

    setUserInfo(null);
    setIsAuthenticated(false);
    setWelcomeMessage("");
    alert("Has cerrado sesión exitosamente");
  };

  // Obtener la fecha mínima para los inputs (hoy)
  const today = formatDateForInput(getLocalDate(new Date()));

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div
          className="logo-container"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        >
          <img src={logoUrl} alt="VivaSky Logo" className="logo-image" />
          <span className="logo-text">VivaSky</span>
        </div>

        {/* Mostrar información del usuario si está logeado - CON MENÚ DESPLEGABLE */}
        {isAuthenticated && userInfo ? (
          <UserMenu userInfo={userInfo} onLogout={handleLogout} />
        ) : (
          <nav className="navigation">
            <a href="#" onClick={handleComingSoon}>
              Reservar
            </a>
            <a href="#" onClick={handleComingSoon}>
              Noticias
            </a>
            <a href="#" onClick={handleComingSoon}>
              Destinos
            </a>
          </nav>
        )}

        {!isAuthenticated && (
          <button className="sign-up-btn" onClick={handleLoginClick}>
            Iniciar sesión
          </button>
        )}
      </header>

      {/* Mostrar mensaje de bienvenida temporal */}
      {welcomeMessage && (
        <div className="welcome-banner">
          <div className="success-message">✅ {welcomeMessage}</div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Descubre el mundo mientras viajas con nosotros</h1>

          <form className="flight-form" onSubmit={handleSearch}>
            <div className="trip-type">
              <label className={tripType === "roundtrip" ? "active" : ""}>
                <input
                  type="radio"
                  name="tripType"
                  value="roundtrip"
                  checked={tripType === "roundtrip"}
                  onChange={() => setTripType("roundtrip")}
                />
                Ida y vuelta
              </label>
              <label className={tripType === "oneway" ? "active" : ""}>
                <input
                  type="radio"
                  name="tripType"
                  value="oneway"
                  checked={tripType === "oneway"}
                  onChange={() => setTripType("oneway")}
                />
                Solo ida
              </label>
            </div>

            <div className="form-fields">
              <div className="input-group">
                <label>Salida</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Destino</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Fecha de salida</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={handleDepartureDateChange}
                  min={today}
                />
              </div>

              {tripType === "roundtrip" && (
                <div className="input-group">
                  <label>Fecha de retorno</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={handleReturnDateChange}
                    min={departureDate}
                  />
                </div>
              )}
            </div>

            <button type="submit" className="search-btn">
              Buscar vuelos
            </button>
          </form>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="popular-destinations">
        <h2>Promociones</h2>
        <div className="destinations-grid">
          {popularDestinations.map((dest, index) => (
            <div
              key={index}
              className="destination-card"
              onClick={() => handleDestinationClick(dest)}
            >
              <div
                className="destination-image"
                style={{ backgroundImage: `url(${dest.image})` }}
              ></div>
              <h3>{dest.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 VivaSky. Todos los derechos reservados.</p>
      </footer>

      {/* Modal para información del destino */}
      {showModal && selectedDestination && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="destination-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <div className="modal-header">
              <h2>{selectedDestination.name}</h2>
              <div
                className="destination-image-modal"
                style={{ backgroundImage: `url(${selectedDestination.image})` }}
              ></div>
            </div>
            <div className="modal-content">
              <p className="destination-description">
                {selectedDestination.description}
              </p>
              <div className="destination-details">
                <div className="detail-item">
                  <span className="detail-label">Precio:</span>
                  <span className="detail-value">
                    {selectedDestination.price}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duración del vuelo:</span>
                  <span className="detail-value">
                    {selectedDestination.duration}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha de promocion:</span>
                  <span className="detail-value">
                    {selectedDestination.bestTime}
                  </span>
                </div>
              </div>
              <button
                className="choose-destination-btn"
                onClick={handleComingSoon}
              >
                Elegir promoción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
