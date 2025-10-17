import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";

const SearchFlights = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortOption, setSortOption] = useState("recommended");
  const [filterOption, setFilterOption] = useState("all");

  // Obtener parámetros de búsqueda si vienen del home
  const searchParams = location.state || {
    origin: "Bogotá",
    destination: "Medellín",
    departureDate: "Vie, 15 Nov",
    returnDate: "Vie, 22 Nov",
    tripType: "roundtrip",
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

  // Función para calcular precio basado en la ruta - MODIFICADA A COP
  const calculatePrice = (origin, destination) => {
    const price = calculatePriceNumber(origin, destination);
    return formatPriceCOP(price);
  };

  const calculatePriceNumber = (origin, destination) => {
    if (isInternationalFlight(origin, destination)) {
      // Precios internacionales en COP (aproximadamente 1 EUR = 4500 COP)
      const internationalPrices = {
        Madrid: 2925000, // ~2,925,000 COP
        Londres: 3240000, // ~3,240,000 COP
        "New York": 2610000, // ~2,610,000 COP
        "Buenos Aires": 2340000, // ~2,340,000 COP
        Miami: 2025000, // ~2,025,000 COP
      };

      // Encontrar la ciudad internacional (puede ser origen o destino)
      const destinationCity = internationalCities.includes(destination)
        ? destination
        : origin;
      return internationalPrices[destinationCity] || 2700000; // 2,700,000 COP por defecto
    } else {
      // Precios nacionales en COP (más económicos)
      const basePrice = 350000; // 350,000 COP base
      const randomVariation = Math.floor(Math.random() * 150000); // Variación hasta 150,000 COP
      return basePrice + randomVariation; // Entre 350,000 y 500,000 COP
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

  // Datos de ejemplo para vuelos - CON DURACIONES REALES Y ZONAS HORARIAS
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
          price: calculatePrice(searchParams.origin, searchParams.destination),
          priceNumber: calculatePriceNumber(
            searchParams.origin,
            searchParams.destination
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
          price: calculatePrice(searchParams.origin, searchParams.destination),
          priceNumber:
            calculatePriceNumber(
              searchParams.origin,
              searchParams.destination
            ) +
            (isInternationalFlight(
              searchParams.origin,
              searchParams.destination
            )
              ? 225000
              : 50000),
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
          price: calculatePrice(searchParams.origin, searchParams.destination),
          priceNumber:
            calculatePriceNumber(
              searchParams.origin,
              searchParams.destination
            ) +
            (isInternationalFlight(
              searchParams.origin,
              searchParams.destination
            )
              ? 135000
              : 30000),
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

  const flightResults = generateFlightResults();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleBookFlight = (flight) => {
    alert(
      `Funcionalidad de reserva próximamente disponible para el vuelo ${flight.flightNumber}`
    );
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

      {/* Controles de filtro y ordenamiento */}
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
            </select>
          </div>

          <div className="filter-group">
            <label>Filtrar por:</label>
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="control-select"
            >
              <option value="all">Todos los vuelos</option>
              <option value="morning">Salida matutina</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultados de vuelos */}
      <section className="flight-results">
        <div className="results-container">
          {flightResults.map((flight) => (
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
          ))}
        </div>
      </section>
    </div>
  );
};

export default SearchFlights;
