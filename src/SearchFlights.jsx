import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";

const SearchFlights = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortOption, setSortOption] = useState("recommended");
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filteredFlights, setFilteredFlights] = useState([]);

  // Obtener parámetros de búsqueda si vienen del home
  const searchParams = location.state || {
    origin: "Bogotá",
    destination: "Medellín",
    departureDate: "Vie, 15 Nov",
    returnDate: "Vie, 22 Nov",
    tripType: "roundtrip",
  };

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  // Aplicar ordenamientos cuando cambien las opciones
  useEffect(() => {
    applySorting();
  }, [sortOption, searchParams]);

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
          role: user.tipo_usuario || user.role || "Usuario",
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");

    setUserInfo(null);
    setIsAuthenticated(false);
    alert("Has cerrado sesión exitosamente");
    navigate("/");
  };

  // Función para mostrar el menú de usuario (similar al de HomePage)
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
            <span className="user-role">{userInfo.role}</span>
          </div>
          <span>▼</span>
        </button>

        {showMenu && (
          <div className="user-menu-dropdown">
            <div className="user-menu-header">
              <div className="user-welcome">{userInfo.nombre}</div>
              <div className="user-menu-email">{userInfo.correo}</div>
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
                  alert("Funcionalidad próximamente disponible");
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

  const handleComingSoon = () => {
    alert("Esta funcionalidad estará activa próximamente");
  };

  // Definir ciudades internacionales aquí también
  const internationalCities = [
    "Madrid",
    "Londres",
    "New York",
    "Buenos Aires",
    "Miami",
  ];
  const colombianCities = [
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
  ];

  // Zonas horarias (diferencia con respecto a Colombia - UTC-5)
  const timeZones = {
    // Colombia (UTC-5)
    Bogotá: 0,
    Medellín: 0,
    Cali: 0,
    Barranquilla: 0,
    Cartagena: 0,
    Cúcuta: 0,
    Bucaramanga: 0,
    Pereira: 0,
    "Santa Marta": 0,
    Ibagué: 0,
    Pasto: 0,
    Manizales: 0,
    Neiva: 0,
    Villavicencio: 0,
    Armenia: 0,
    Valledupar: 0,
    Montería: 0,
    Sincelejo: 0,
    Popayán: 0,
    Riohacha: 0,
    Tunja: 0,
    Florencia: 0,
    Quibdó: 0,
    Arauca: 0,
    Yopal: 0,
    Mocoa: 0,
    "San José del Guaviare": 0,
    Leticia: 0,
    Mitú: 0,
    "Puerto Carreño": 0,
    "San Andrés": 0,

    // Internacionales
    Madrid: 6, // España (UTC+1) -> +6 horas con Colombia
    Londres: 5, // Reino Unido (UTC+0) -> +5 horas con Colombia
    "New York": -1, // USA (UTC-4) -> -1 hora con Colombia
    "Buenos Aires": 2, // Argentina (UTC-3) -> +2 horas con Colombia
    Miami: -1, // USA (UTC-4) -> -1 hora con Colombia
  };

  // Duración de vuelos nacionales (entre ciudades colombianas)
  const nationalDurations = {
    // Desde Bogotá
    "Bogotá-Medellín": "45m",
    "Bogotá-Cali": "1h 15m",
    "Bogotá-Barranquilla": "1h 30m",
    "Bogotá-Cartagena": "1h 25m",
    "Bogotá-Cúcuta": "1h 10m",
    "Bogotá-Bucaramanga": "50m",
    "Bogotá-Pereira": "35m",
    "Bogotá-Santa Marta": "1h 35m",
    "Bogotá-Ibagué": "25m",
    "Bogotá-Pasto": "1h 45m",
    "Bogotá-Manizales": "40m",
    "Bogotá-Neiva": "45m",
    "Bogotá-Villavicencio": "30m",
    "Bogotá-Armenia": "35m",
    "Bogotá-Valledupar": "1h 20m",
    "Bogotá-Montería": "1h 15m",
    "Bogotá-Sincelejo": "1h 25m",
    "Bogotá-Popayán": "1h 30m",
    "Bogotá-Riohacha": "1h 40m",
    "Bogotá-Tunja": "20m",
    "Bogotá-Florencia": "1h",
    "Bogotá-Quibdó": "1h 15m",
    "Bogotá-Arauca": "1h 30m",
    "Bogotá-Yopal": "1h 10m",
    "Bogotá-Mocoa": "1h 35m",
    "Bogotá-San José del Guaviare": "1h 5m",
    "Bogotá-Leticia": "2h 15m",
    "Bogotá-Mitú": "2h",
    "Bogotá-Puerto Carreño": "1h 45m",
    "Bogotá-San Andrés": "2h 30m",

    // Desde Medellín
    "Medellín-Cali": "50m",
    "Medellín-Barranquilla": "1h 20m",
    "Medellín-Cartagena": "1h 15m",
    "Medellín-Pereira": "25m",
    "Medellín-Manizales": "30m",
    "Medellín-Armenia": "35m",

    // Desde Cali
    "Cali-Barranquilla": "1h 30m",
    "Cali-Cartagena": "1h 25m",
    "Cali-Pereira": "35m",
    "Cali-Popayán": "45m",
    "Cali-Pasto": "1h 15m",

    // Desde Cartagena
    "Cartagena-Barranquilla": "25m",
    "Cartagena-Santa Marta": "45m",
    "Cartagena-San Andrés": "1h 45m",

    // Otras rutas comunes
    "Pereira-Manizales": "20m",
    "Pereira-Armenia": "15m",
    "Santa Marta-Barranquilla": "35m",
    "Cúcuta-Bucaramanga": "40m",
  };

  // Duración de vuelos internacionales (desde ciudades gateway colombianas)
  const internationalDurations = {
    // Desde Bogotá
    "Bogotá-Madrid": "9h 30m",
    "Bogotá-Londres": "10h 45m",
    "Bogotá-New York": "5h 30m",
    "Bogotá-Buenos Aires": "6h 15m",
    "Bogotá-Miami": "3h 15m",

    // Desde Medellín
    "Medellín-Madrid": "9h 45m",
    "Medellín-Londres": "11h",
    "Medellín-New York": "5h 45m",
    "Medellín-Buenos Aires": "6h 30m",
    "Medellín-Miami": "3h 30m",

    // Desde Cali
    "Cali-Madrid": "10h 15m",
    "Cali-Londres": "11h 30m",
    "Cali-New York": "6h",
    "Cali-Buenos Aires": "6h 45m",
    "Cali-Miami": "3h 45m",

    // Desde Cartagena
    "Cartagena-Madrid": "8h 45m",
    "Cartagena-Londres": "10h",
    "Cartagena-New York": "4h 45m",
    "Cartagena-Buenos Aires": "7h",
    "Cartagena-Miami": "2h 30m",

    // Desde Pereira
    "Pereira-Madrid": "10h",
    "Pereira-Londres": "11h 15m",
    "Pereira-New York": "5h 50m",
    "Pereira-Buenos Aires": "6h 35m",
    "Pereira-Miami": "3h 40m",

    // Vuelos de retorno (desde internacionales hacia colombianas)
    "Madrid-Bogotá": "10h 15m",
    "Londres-Bogotá": "11h 30m",
    "New York-Bogotá": "5h 45m",
    "Buenos Aires-Bogotá": "6h 30m",
    "Miami-Bogotá": "3h 30m",
  };

  // Función para formatear precio en pesos colombianos
  const formatPriceCOP = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Función para calcular precio basado en la ruta - MODIFICADA CON VARIACIÓN
  const calculatePrice = (origin, destination, flightId) => {
    const price = calculatePriceNumber(origin, destination, flightId);
    return formatPriceCOP(price);
  };

  const calculatePriceNumber = (origin, destination, flightId) => {
    if (isInternationalFlight(origin, destination)) {
      // Precios base internacionales en COP con variación por vuelo
      const internationalBasePrices = {
        Madrid: 2925000, // ~2,925,000 COP base
        Londres: 3240000, // ~3,240,000 COP base
        "New York": 2610000, // ~2,610,000 COP base
        "Buenos Aires": 2340000, // ~2,340,000 COP base
        Miami: 2025000, // ~2,025,000 COP base
      };

      // Encontrar la ciudad internacional (puede ser origen o destino)
      const destinationCity = internationalCities.includes(destination)
        ? destination
        : origin;

      const basePrice = internationalBasePrices[destinationCity] || 2700000;

      // Variación basada en el ID del vuelo para que no sean todos iguales
      // Diferentes porcentajes de variación para hacerlos atractivos
      const variationFactors = {
        1: 0.95, // 5% más barato
        2: 1.05, // 5% más caro
        3: 1.0, // Precio base
        4: 0.9, // 10% más barato (mejor oferta)
        5: 1.08, // 8% más caro (horario premium)
      };

      const variation = variationFactors[flightId] || 1.0;
      return Math.round(basePrice * variation);
    } else {
      // Precios nacionales en COP (más económicos) con variación
      const basePrice = 350000; // 350,000 COP base
      const variationFactors = {
        1: 0, // Precio base
        2: 50000, // +50,000
        3: 30000, // +30,000
        4: -25000, // -25,000 (mejor oferta)
        5: 15000, // +15,000
      };

      const variation = variationFactors[flightId] || 0;
      return basePrice + variation; // Entre 325,000 y 400,000 COP
    }
  };

  // Función para obtener la duración del vuelo
  const getFlightDuration = (origin, destination) => {
    // Buscar en vuelos internacionales primero
    const internationalKey = `${origin}-${destination}`;
    if (internationalDurations[internationalKey]) {
      return internationalDurations[internationalKey];
    }

    // Buscar en vuelos nacionales
    const nationalKey = `${origin}-${destination}`;
    if (nationalDurations[nationalKey]) {
      return nationalDurations[nationalKey];
    }

    // Buscar en reversa (destino-origen) por si está definido al revés
    const reverseNationalKey = `${destination}-${origin}`;
    if (nationalDurations[reverseNationalKey]) {
      return nationalDurations[reverseNationalKey];
    }

    const reverseInternationalKey = `${destination}-${origin}`;
    if (internationalDurations[reverseInternationalKey]) {
      return internationalDurations[reverseInternationalKey];
    }

    // Duración por defecto para rutas no definidas
    return "1h 15m";
  };

  // Función para determinar si es vuelo internacional
  const isInternationalFlight = (origin, destination) => {
    return (
      internationalCities.includes(origin) ||
      internationalCities.includes(destination)
    );
  };

  // Función para calcular hora de llegada CON ZONA HORARIA
  const calculateArrivalTime = (
    departureTime,
    duration,
    origin,
    destination
  ) => {
    try {
      const [hours, minutes] = departureTime.split(":").map(Number);
      const durationMatch = duration.match(/(\d+)h\s*(\d+)m|(\d+)h|(\d+)m/);

      let totalMinutes = hours * 60 + minutes;

      if (durationMatch) {
        if (durationMatch[1] && durationMatch[2]) {
          // Formato "Xh Ym"
          totalMinutes +=
            parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2]);
        } else if (durationMatch[3]) {
          // Formato "Xh"
          totalMinutes += parseInt(durationMatch[3]) * 60;
        } else if (durationMatch[4]) {
          // Formato "Xm"
          totalMinutes += parseInt(durationMatch[4]);
        }
      }

      // Aplicar diferencia horaria si es vuelo internacional
      const timeDifference =
        (timeZones[destination] || 0) - (timeZones[origin] || 0);
      totalMinutes += timeDifference * 60;

      const arrivalHours = Math.floor(totalMinutes / 60) % 24;
      const arrivalMinutes = totalMinutes % 60;

      return `${arrivalHours.toString().padStart(2, "0")}:${arrivalMinutes
        .toString()
        .padStart(2, "0")}`;
    } catch (error) {
      console.error("Error calculating arrival time:", error);
      return "22:30"; // Hora por defecto en caso de error
    }
  };

  // Función para obtener código de aeropuerto
  const getAirportCode = (city) => {
    const airportCodes = {
      Bogotá: "BOG",
      Medellín: "MDE",
      Cali: "CLO",
      Barranquilla: "BAQ",
      Cartagena: "CTG",
      Cúcuta: "CUC",
      Bucaramanga: "BGA",
      Pereira: "PEI",
      "Santa Marta": "SMR",
      Ibagué: "IBE",
      Pasto: "PSO",
      Manizales: "MZL",
      Neiva: "NVA",
      Villavicencio: "VVC",
      Armenia: "AXM",
      Valledupar: "VUP",
      Montería: "MTR",
      Sincelejo: "SQZ",
      Popayán: "PPN",
      Riohacha: "RCH",
      Tunja: "TUN",
      Florencia: "FLA",
      Quibdó: "UIB",
      Arauca: "AUC",
      Yopal: "EYP",
      Mocoa: "MQZ",
      "San José del Guaviare": "SJE",
      Leticia: "LET",
      Mitú: "MVP",
      "Puerto Carreño": "PCR",
      "San Andrés": "ADZ",
      Madrid: "MAD",
      Londres: "LHR",
      "New York": "JFK",
      "Buenos Aires": "EZE",
      Miami: "MIA",
    };

    return airportCodes[city] || "---";
  };

  // Función para aplicar ordenamientos
  const applySorting = () => {
    let flights = generateFlightResults();

    // Aplicar ordenamientos
    switch (sortOption) {
      case "price-low":
        flights.sort((a, b) => a.priceNumber - b.priceNumber);
        break;
      case "price-high":
        flights.sort((a, b) => b.priceNumber - a.priceNumber);
        break;
      case "duration-short":
        flights.sort((a, b) => {
          const durationA = convertDurationToMinutes(a.duration);
          const durationB = convertDurationToMinutes(b.duration);
          return durationA - durationB;
        });
        break;
      case "duration-long":
        flights.sort((a, b) => {
          const durationA = convertDurationToMinutes(a.duration);
          const durationB = convertDurationToMinutes(b.duration);
          return durationB - durationA;
        });
        break;
      case "departure-early":
        flights.sort((a, b) => {
          const timeA = convertTimeToMinutes(a.departure.time);
          const timeB = convertTimeToMinutes(b.departure.time);
          return timeA - timeB;
        });
        break;
      case "departure-late":
        flights.sort((a, b) => {
          const timeA = convertTimeToMinutes(a.departure.time);
          const timeB = convertTimeToMinutes(b.departure.time);
          return timeB - timeA;
        });
        break;
      case "recommended":
      default:
        // Orden por defecto (recomendado) - mantiene el orden original
        break;
    }

    setFilteredFlights(flights);
  };

  // Función auxiliar para convertir duración a minutos
  const convertDurationToMinutes = (duration) => {
    const match = duration.match(/(\d+)h\s*(\d+)m|(\d+)h|(\d+)m/);
    if (match) {
      if (match[1] && match[2]) {
        return parseInt(match[1]) * 60 + parseInt(match[2]);
      } else if (match[3]) {
        return parseInt(match[3]) * 60;
      } else if (match[4]) {
        return parseInt(match[4]);
      }
    }
    return 0;
  };

  // Función auxiliar para convertir hora a minutos
  const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Datos de ejemplo para vuelos - CON PRECIOS VARIADOS
  const generateFlightResults = () => {
    try {
      const baseFlights = [
        {
          id: 1,
          airline: "VivaSky Airlines",
          flightNumber: "VS202",
          departure: {
            city: searchParams.origin,
            time: "08:00",
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.origin),
          },
          arrival: {
            city: searchParams.destination,
            time: calculateArrivalTime(
              "08:00",
              getFlightDuration(searchParams.origin, searchParams.destination),
              searchParams.origin,
              searchParams.destination
            ),
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.destination),
          },
          duration: getFlightDuration(
            searchParams.origin,
            searchParams.destination
          ),
          stops: "Directo",
          price: calculatePrice(
            searchParams.origin,
            searchParams.destination,
            1
          ),
          priceNumber: calculatePriceNumber(
            searchParams.origin,
            searchParams.destination,
            1
          ),
          baggage: isInternationalFlight(
            searchParams.origin,
            searchParams.destination
          )
            ? "23kg"
            : "15kg",
          airlineLogo: "✈️",
        },
        {
          id: 2,
          airline: "VivaSky Airlines",
          flightNumber: "VS455",
          departure: {
            city: searchParams.origin,
            time: "14:20",
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.origin),
          },
          arrival: {
            city: searchParams.destination,
            time: calculateArrivalTime(
              "14:20",
              getFlightDuration(searchParams.origin, searchParams.destination),
              searchParams.origin,
              searchParams.destination
            ),
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.destination),
          },
          duration: getFlightDuration(
            searchParams.origin,
            searchParams.destination
          ),
          stops: "Directo",
          price: calculatePrice(
            searchParams.origin,
            searchParams.destination,
            2
          ),
          priceNumber: calculatePriceNumber(
            searchParams.origin,
            searchParams.destination,
            2
          ),
          baggage: isInternationalFlight(
            searchParams.origin,
            searchParams.destination
          )
            ? "23kg"
            : "15kg",
          airlineLogo: "✈️",
        },
        {
          id: 3,
          airline: "VivaSky Airlines",
          flightNumber: "VS789",
          departure: {
            city: searchParams.origin,
            time: "11:30",
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.origin),
          },
          arrival: {
            city: searchParams.destination,
            time: calculateArrivalTime(
              "11:30",
              getFlightDuration(searchParams.origin, searchParams.destination),
              searchParams.origin,
              searchParams.destination
            ),
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.destination),
          },
          duration: getFlightDuration(
            searchParams.origin,
            searchParams.destination
          ),
          stops: "Directo",
          price: calculatePrice(
            searchParams.origin,
            searchParams.destination,
            3
          ),
          priceNumber: calculatePriceNumber(
            searchParams.origin,
            searchParams.destination,
            3
          ),
          baggage: isInternationalFlight(
            searchParams.origin,
            searchParams.destination
          )
            ? "23kg"
            : "15kg",
          airlineLogo: "✈️",
        },
        {
          id: 4,
          airline: "VivaSky Airlines",
          flightNumber: "VS321",
          departure: {
            city: searchParams.origin,
            time: "06:15",
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.origin),
          },
          arrival: {
            city: searchParams.destination,
            time: calculateArrivalTime(
              "06:15",
              getFlightDuration(searchParams.origin, searchParams.destination),
              searchParams.origin,
              searchParams.destination
            ),
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.destination),
          },
          duration: getFlightDuration(
            searchParams.origin,
            searchParams.destination
          ),
          stops: "Directo",
          price: calculatePrice(
            searchParams.origin,
            searchParams.destination,
            4
          ),
          priceNumber: calculatePriceNumber(
            searchParams.origin,
            searchParams.destination,
            4
          ),
          baggage: isInternationalFlight(
            searchParams.origin,
            searchParams.destination
          )
            ? "23kg"
            : "15kg",
          airlineLogo: "✈️",
        },
        {
          id: 5,
          airline: "VivaSky Airlines",
          flightNumber: "VS654",
          departure: {
            city: searchParams.origin,
            time: "19:45",
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.origin),
          },
          arrival: {
            city: searchParams.destination,
            time: calculateArrivalTime(
              "19:45",
              getFlightDuration(searchParams.origin, searchParams.destination),
              searchParams.origin,
              searchParams.destination
            ),
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.destination),
          },
          duration: getFlightDuration(
            searchParams.origin,
            searchParams.destination
          ),
          stops: "Directo",
          price: calculatePrice(
            searchParams.origin,
            searchParams.destination,
            5
          ),
          priceNumber: calculatePriceNumber(
            searchParams.origin,
            searchParams.destination,
            5
          ),
          baggage: isInternationalFlight(
            searchParams.origin,
            searchParams.destination
          )
            ? "23kg"
            : "15kg",
          airlineLogo: "✈️",
        },
      ];

      return baseFlights;
    } catch (error) {
      console.error("Error generating flight results:", error);
      // En caso de error, devolver vuelos por defecto
      return [
        {
          id: 1,
          airline: "VivaSky Airlines",
          flightNumber: "VS202",
          departure: {
            city: searchParams.origin,
            time: "08:00",
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.origin),
          },
          arrival: {
            city: searchParams.destination,
            time: "22:30",
            date: searchParams.departureDate,
            airport: getAirportCode(searchParams.destination),
          },
          duration: "9h 30m",
          stops: "Directo",
          price: formatPriceCOP(2925000),
          priceNumber: 2925000,
          baggage: "23kg",
          airlineLogo: "✈️",
        },
      ];
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleBookFlight = (flight) => {
    navigate("/reserve-flight", {
      state: {
        flight: flight,
        searchParams: searchParams,
      },
    });
  };

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

        {/* Mostrar información del usuario si está logeado - CON MENÚ DESPLEGABLE */}
        {isAuthenticated && userInfo ? (
          <UserMenu userInfo={userInfo} onLogout={handleLogout} />
        ) : (
          <nav className="navigation">
            <a href="#" onClick={handleComingSoon}>
              Noticias
            </a>
            <a href="#" onClick={handleComingSoon}>
              Destinos
            </a>
          </nav>
        )}

        <button className="back-btn" onClick={handleBackToHome}>
          Volver al inicio
        </button>
      </header>

      {/* Banner de búsqueda */}
      <div className="search-banner">
        <div className="search-info">
          <h2>Vuelos encontrados</h2>
          <div className="route-info">
            <span className="route-city">{searchParams.origin}</span>
            <span className="route-arrow">→</span>
            <span className="route-city">{searchParams.destination}</span>
          </div>
          <div className="date-info">
            {searchParams.tripType === "roundtrip"
              ? `${searchParams.departureDate} - ${searchParams.returnDate}`
              : searchParams.departureDate}{" "}
            •{" "}
            {searchParams.tripType === "roundtrip"
              ? "Ida y vuelta"
              : "Solo ida"}
          </div>
        </div>
      </div>

      {/* Controles de ordenamiento */}
      <div className="results-controls">
        <div className="controls-container">
          <div className="filter-group">
            <label>Ordenar por:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="control-select"
            >
              <option value="recommended">Recomendado</option>
              <option value="price-low">Precio (más bajo)</option>
              <option value="price-high">Precio (más alto)</option>
              <option value="departure-early">Salida (más temprano)</option>
              <option value="departure-late">Salida (más tarde)</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="results-count">
              {filteredFlights.length} vuelos encontrados
            </span>
          </div>
        </div>
      </div>

      {/* Resultados de vuelos */}
      <section className="flight-results">
        <div className="results-container">
          {filteredFlights.length > 0 ? (
            filteredFlights.map((flight) => (
              <div key={flight.id} className="flight-card">
                <div className="flight-header">
                  <div className="airline-info">
                    <span className="airline-logo">{flight.airlineLogo}</span>
                    <div>
                      <div className="airline-name">{flight.airline}</div>
                      <div className="flight-number">{flight.flightNumber}</div>
                    </div>
                  </div>
                  <div className="flight-price">
                    <div className="price-amount">{flight.price}</div>
                    <div className="price-description">por persona</div>
                  </div>
                </div>

                <div className="flight-details">
                  <div className="route-details">
                    <div className="departure-info">
                      <div className="time">{flight.departure.time}</div>
                      <div className="city">{flight.departure.city}</div>
                      <div className="airport">{flight.departure.airport}</div>
                      <div className="date">{flight.departure.date}</div>
                    </div>

                    <div className="journey-info">
                      <div className="duration">{flight.duration}</div>
                      <div className="journey-line">
                        <div className="line"></div>
                        <div className="plane-icon">✈️</div>
                      </div>
                      <div className="stops">{flight.stops}</div>
                    </div>

                    <div className="arrival-info">
                      <div className="time">{flight.arrival.time}</div>
                      <div className="city">{flight.arrival.city}</div>
                      <div className="airport">{flight.arrival.airport}</div>
                      <div className="date">{flight.arrival.date}</div>
                      {isInternationalFlight(
                        searchParams.origin,
                        searchParams.destination
                      ) && <div className="timezone-info">Hora local</div>}
                    </div>
                  </div>
                </div>

                {/* MOSTRAR VUELO DE RETORNO SOLO PARA IDA Y VUELTA */}
                {searchParams.tripType === "roundtrip" && (
                  <div className="return-flight-section">
                    <div className="section-divider">
                      <span>Vuelo de retorno</span>
                    </div>

                    <div className="flight-details">
                      <div className="route-details">
                        <div className="departure-info">
                          <div className="time">10:15</div>
                          <div className="city">{searchParams.destination}</div>
                          <div className="airport">
                            {getAirportCode(searchParams.destination)}
                          </div>
                          <div className="date">{searchParams.returnDate}</div>
                        </div>

                        <div className="journey-info">
                          <div className="duration">
                            {getFlightDuration(
                              searchParams.destination,
                              searchParams.origin
                            )}
                          </div>
                          <div className="journey-line">
                            <div className="line"></div>
                            <div className="plane-icon">✈️</div>
                          </div>
                          <div className="stops">Directo</div>
                        </div>

                        <div className="arrival-info">
                          <div className="time">
                            {calculateArrivalTime(
                              "10:15",
                              getFlightDuration(
                                searchParams.destination,
                                searchParams.origin
                              ),
                              searchParams.destination,
                              searchParams.origin
                            )}
                          </div>
                          <div className="city">{searchParams.origin}</div>
                          <div className="airport">
                            {getAirportCode(searchParams.origin)}
                          </div>
                          <div className="date">{searchParams.returnDate}</div>
                          {isInternationalFlight(
                            searchParams.destination,
                            searchParams.origin
                          ) && <div className="timezone-info">Hora local</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flight-actions">
                  <button
                    className="book-btn"
                    onClick={() => handleBookFlight(flight)}
                  >
                    {searchParams.tripType === "roundtrip"
                      ? "Seleccionar vuelo ida y vuelta"
                      : "Seleccionar vuelo"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No se encontraron vuelos</h3>
              <p>Intenta ajustar tus criterios de búsqueda</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchFlights;

