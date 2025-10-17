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
    origin: "Frankfurt am Main",
    destination: "Bangkok",
    departureDate: "Vie, 15 Nov",
    returnDate: "Vie, 22 Nov",
    tripType: "roundtrip",
  };

  // Datos de ejemplo para vuelos - CON FECHAS EXACTAS DEL USUARIO
  const flightResults = [
    {
      id: 1,
      airline: "VivaSky Airlines",
      flightNumber: "VS202",
      departure: {
        city: searchParams.origin,
        time: "08:00",
        date: searchParams.departureDate, // FECHA EXACTA DEL USUARIO
        airport: "FRA",
      },
      arrival: {
        city: searchParams.destination,
        time: "22:30",
        date: searchParams.departureDate, // MISMA FECHA DE SALIDA
        airport: "BKK",
      },
      duration: "11h 30m",
      stops: "Directo",
      price: "$ ****",
      priceNumber: 650,
      airlineLogo: "✈️",
    },
    {
      id: 2,
      airline: "VivaSky Airlines",
      flightNumber: "SW455",
      departure: {
        city: searchParams.origin,
        time: "14:20",
        date: searchParams.departureDate, // FECHA EXACTA DEL USUARIO
        airport: "FRA",
      },
      arrival: {
        city: searchParams.destination,
        time: "06:10",
        date: searchParams.departureDate, // MISMA FECHA DE SALIDA
        airport: "BKK",
      },
      duration: "10h 50m",
      stops: "Directo",
      price: "$ ****",
      priceNumber: 720,
      airlineLogo: "✈️",
    },
    {
      id: 3,
      airline: "VivaSky Airlines",
      flightNumber: "GA789",
      departure: {
        city: searchParams.origin,
        time: "11:30",
        date: searchParams.departureDate, // FECHA EXACTA DEL USUARIO
        airport: "FRA",
      },
      arrival: {
        city: searchParams.destination,
        time: "09:45",
        date: searchParams.departureDate, // MISMA FECHA DE SALIDA
        airport: "BKK",
      },
      duration: "13h 15m",
      stops: "1 escala (Dubai)",
      price: "$ ******",
      priceNumber: 580,
      baggage: "25kg",
      airlineLogo: "✈️",
    },
  ];

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
              <option value="direct">Solo directos</option>
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
                        <div className="airport">BKK</div>
                        {/* FECHA EXACTA DE RETORNO DEL USUARIO */}
                        <div className="date">{searchParams.returnDate}</div>
                      </div>

                      <div className="journey-info">
                        <div className="duration">12h 45m</div>
                        <div className="journey-line">
                          <div className="line"></div>
                          <div className="plane-icon">✈️</div>
                        </div>
                        <div className="stops">Directo</div>
                      </div>

                      <div className="arrival-info">
                        <div className="time">23:00</div>
                        <div className="city">{searchParams.origin}</div>
                        <div className="airport">FRA</div>
                        {/* MISMA FECHA DE RETORNO DEL USUARIO */}
                        <div className="date">{searchParams.returnDate}</div>
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
