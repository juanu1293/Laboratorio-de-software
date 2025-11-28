import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [tripType, setTripType] = useState("roundtrip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const navigate = useNavigate();

  // 🔥 NUEVA FUNCIÓN: Procesar compra directa
  const proceedToPurchase = (flight) => {
    // Preparar los datos del vuelo para la compra directa
    const purchaseFlight = {
      ...flight,
      selectedClass: flight.selectedClass || "economica",
      ticketQuantity: flight.ticketQuantity || 1,
      priceNumber: Number(flight.priceNumber) || 0,
      costo_vip: Number(flight.costo_vip) || 0,
    };

    console.log("🛒 Redirigiendo a compra directa:", purchaseFlight);

    // Navegar directamente a la página de compra
    navigate("/purchase-flight", {
      state: {
        flight: purchaseFlight,
        fromCart: true,
        cartItemId: flight.id, // Para poder eliminar del carrito después de comprar
      },
    });
  };

  // 🔥 NUEVA FUNCIÓN: Verificar y limpiar reservas expiradas
  const checkAndCleanExpiredReservations = () => {
    try {
      const currentCart = JSON.parse(
        localStorage.getItem("vivasky_cart") || "[]"
      );
      const now = new Date();

      const validReservations = currentCart.filter((item) => {
        if (item.reservationType === "temporal" && item.expiresAt) {
          const expirationDate = new Date(item.expiresAt);
          return expirationDate > now; // Mantener solo las que no han expirado
        }
        return true; // Mantener todos los items que no son reservas temporales
      });

      if (validReservations.length !== currentCart.length) {
        localStorage.setItem("vivasky_cart", JSON.stringify(validReservations));
        console.log("🔄 Reservas expiradas eliminadas del carrito");
      }

      return validReservations;
    } catch (error) {
      console.error("❌ Error limpiando reservas expiradas:", error);
      return [];
    }
  };

  // 🔥 NUEVA FUNCIÓN: Actualizar tiempo restante de las reservas
  const updateReservationTimers = () => {
    try {
      const currentCart = JSON.parse(
        localStorage.getItem("vivasky_cart") || "[]"
      );
      const now = new Date();
      let needsUpdate = false;

      const updatedCart = currentCart
        .map((item) => {
          if (item.reservationType === "temporal" && item.expiresAt) {
            const expirationDate = new Date(item.expiresAt);
            const timeDiff = expirationDate - now;

            if (timeDiff <= 0) {
              return null; // Eliminar reserva expirada
            }

            // Calcular tiempo restante en formato HH:MM:SS
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor(
              (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            const newTimeLeft = `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

            if (item.timeLeft !== newTimeLeft) {
              needsUpdate = true;
              return {
                ...item,
                timeLeft: newTimeLeft,
              };
            }
          }
          return item;
        })
        .filter((item) => item !== null); // Filtrar nulls (reservas expiradas)

      if (needsUpdate) {
        localStorage.setItem("vivasky_cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart); // 🔥 Actualizar estado
      }

      return updatedCart;
    } catch (error) {
      console.error("❌ Error actualizando timers:", error);
      return [];
    }
  };

  // Lista de ciudades (la misma que en App.jsx)
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

  const internationalCities = [
    "Madrid",
    "Londres",
    "New York",
    "Buenos Aires",
    "Miami",
  ];

  const internationalGateways = [
    "Pereira",
    "Bogotá",
    "Medellín",
    "Cali",
    "Cartagena",
  ];

  const allOrigins = [...colombianCities, ...internationalCities];

  useEffect(() => {
    // 🔥 MODIFICADO: Verificar reservas expiradas antes de cargar
    const validCart = checkAndCleanExpiredReservations();
    setCartItems(validCart);

    // Cargar información del usuario
    const userData =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }

    // Inicializar fechas
    const today = getLocalDate(new Date());
    const nextWeek = getLocalDate(new Date());
    nextWeek.setDate(today.getDate() + 7);

    setDepartureDate(formatDateForInput(today));
    setReturnDate(formatDateForInput(nextWeek));

    // 🔥 NUEVO: Actualizar timers cada segundo
    const timerInterval = setInterval(() => {
      updateReservationTimers();
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Funciones auxiliares para fechas
  const getLocalDate = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const options = { weekday: "short", day: "numeric", month: "short" };
    return date.toLocaleDateString("es-ES", options);
  };

  // Función para obtener destinos disponibles
  const getAvailableDestinations = (selectedOrigin) => {
    if (!selectedOrigin) return [...colombianCities, ...internationalCities];

    if (internationalCities.includes(selectedOrigin)) {
      return internationalGateways;
    }

    if (internationalGateways.includes(selectedOrigin)) {
      return [
        ...colombianCities.filter((city) => city !== selectedOrigin),
        ...internationalCities,
      ];
    }

    return colombianCities.filter((city) => city !== selectedOrigin);
  };

  // Función para manejar la búsqueda desde el modal
  const handleSearchFromModal = (e) => {
    e.preventDefault();

    if (!origin || !destination) {
      alert("Por favor selecciona una ciudad de origen y destino");
      return;
    }

    // Cerrar modal y navegar a search-flights con los parámetros
    setShowSearchModal(false);

    navigate("/search-flights", {
      state: {
        origin,
        destination,
        departureDate: formatDisplayDate(departureDate),
        returnDate:
          tripType === "roundtrip" ? formatDisplayDate(returnDate) : null,
        tripType,
      },
    });
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBackToSearch = () => {
    navigate("/reserve-flight");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const removeFromCart = (flightId) => {
    const updatedCart = cartItems.filter((item) => item.id !== flightId);
    setCartItems(updatedCart);
    localStorage.setItem("vivasky_cart", JSON.stringify(updatedCart));
  };

  const proceedToCheckout = (flight) => {
    const checkoutFlight = {
      ...flight,
      priceNumber: Number(flight.priceNumber) || 0,
      costo_vip: Number(flight.costo_vip) || 0,
    };
    navigate("/reserve-flight", {
      state: {
        flight: flight,
        searchParams: flight.searchParams,
        fromCart: true,
      },
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.priceNumber) || 0;
      return total + price;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.length;
  };

  // 🔥 FUNCIÓN CORREGIDA: Formatear duración de manera segura
  const formatDuration = (duration) => {
    if (!duration) return "2h 00m";

    // Si es un objeto, convertirlo a string
    if (typeof duration === "object") {
      const hours = duration.hours || 0;
      const minutes = duration.minutes || 0;
      return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
    }

    // Si ya es string, devolverlo tal cual
    if (typeof duration === "string") {
      return duration;
    }

    // Si es número, convertirlo
    if (typeof duration === "number") {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
    }

    return "2h 00m";
  };

  // 🔥 NUEVA FUNCIÓN: Obtener tipo de item (reserva temporal o compra)
  const getItemType = (item) => {
    if (item.reservationType === "temporal") {
      return "reserva";
    } else if (item.purchaseType === "immediate") {
      return "compra";
    }
    return "item";
  };

  // 🔥 NUEVA FUNCIÓN: Obtener texto de expiración
  const getExpirationText = (item) => {
    if (item.reservationType === "temporal" && item.timeLeft) {
      return `Expira en: ${item.timeLeft}`;
    }
    return null;
  };

  // 🔥 NUEVA FUNCIÓN: Obtener badge de estado
  const getStatusBadge = (item) => {
    if (item.reservationType === "temporal") {
      return <span className="status-badge reserved">⏰ Reservado</span>;
    } else if (item.purchaseType === "immediate") {
      return <span className="status-badge purchased">✅ Comprado</span>;
    }
    return null;
  };

  const today = formatDateForInput(getLocalDate(new Date()));

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

        <div className="cart-header-info">
          <span className="cart-welcome">
            {userInfo ? `Hola, ${userInfo.nombre}` : "Mi Carrito"}
          </span>
        </div>
      </header>

      <div className="cart-container">
        <div className="cart-header">
          <h1>🛒 Mi Carrito de Viajes</h1>
          <p>Revisa y gestiona tus vuelos reservados o comprados aquí</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>No tienes vuelos guardados en tu carrito</p>
            <button
              className="continue-shopping-btn"
              onClick={handleContinueShopping}
            >
              Explorar Vuelos
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-summary">
              <div className="cart-stats">
                <span className="cart-count">
                  {getTotalItems()} {getTotalItems() === 1 ? "vuelo" : "vuelos"}{" "}
                  guardado(s)
                </span>
                <span className="cart-total">
                  Total:{" "}
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(calculateTotal())}
                </span>
              </div>
              <button
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
              >
                Seguir Buscando
              </button>
            </div>

            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="cart-item"
                  data-reserved={item.reservationType === "temporal"}
                >
                  <div className="cart-item-header">
                    <div className="flight-airline">
                      <span className="airline-logo">✈️</span>
                      <div>
                        <h3>{item.airline || "VivaSky Airlines"}</h3>
                        <span className="flight-number">
                          {item.flightNumber || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(Number(item.priceNumber) || 0)}
                    </div>
                  </div>

                  {/* 🔥 NUEVO: Información de cantidad y estado */}
                  <div className="cart-item-meta">
                    <div className="item-type-badge">
                      {getStatusBadge(item)}
                      {/* 🔥 MOSTRAR CANTIDAD DE TIQUETES */}
                      {item.ticketQuantity && (
                        <span className="ticket-quantity-badge">
                          🎟️ {item.ticketQuantity} tiquete(s)
                        </span>
                      )}
                    </div>
                    {/* 🔥 MOSTRAR TIEMPO DE EXPIRACIÓN */}
                    {item.reservationType === "temporal" && item.timeLeft && (
                      <div className="expiration-time">
                        <span className="expiration-icon">⏰</span>
                        <span className="expiration-text">
                          {getExpirationText(item)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="cart-item-route">
                    <div className="route-segment">
                      <div className="route-time">
                        {item.departure?.time || "00:00"}
                      </div>
                      <div className="route-city">
                        {item.departure?.city || "N/A"}
                      </div>
                      <div className="route-airport">
                        {item.departure?.airport || "N/A"}
                      </div>
                      <div className="route-date">
                        {item.departure?.date || "Fecha no disponible"}
                      </div>
                    </div>

                    <div className="route-middle">
                      <div className="route-duration">
                        {formatDuration(item.duration)}
                      </div>
                      <div className="route-line">
                        <div className="line"></div>
                        <div className="plane-icon">✈️</div>
                      </div>
                      <div className="route-stops">
                        {item.stops || "Directo"}
                      </div>
                    </div>

                    <div className="route-segment">
                      <div className="route-time">
                        {item.arrival?.time || "00:00"}
                      </div>
                      <div className="route-city">
                        {item.arrival?.city || "N/A"}
                      </div>
                      <div className="route-airport">
                        {item.arrival?.airport || "N/A"}
                      </div>
                      <div className="route-date">
                        {item.arrival?.date || "Fecha no disponible"}
                      </div>
                    </div>
                  </div>

                  {/* 🔥 NUEVO: Mostrar precio unitario si hay múltiples tiquetes */}
                  {item.ticketQuantity && item.ticketQuantity > 1 && (
                    <div className="unit-price-info">
                      <span className="unit-price">
                        Precio unitario:{" "}
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(
                          Number(item.priceNumber) / Number(item.ticketQuantity)
                        )}
                      </span>
                    </div>
                  )}

                  {item.searchParams?.tripType === "roundtrip" && (
                    <div className="return-flight-info">
                      <div className="return-badge">🔄 Ida y Vuelta</div>
                      <div className="return-date">
                        Retorno: {item.searchParams.returnDate}
                      </div>
                    </div>
                  )}

                  {/* 🔥 MODIFICADO: Botones de acción mejorados */}
                  <div className="cart-item-actions">
                    {/* Si es una reserva temporal, mostrar ambos botones */}
                    {item.reservationType === "temporal" ? (
                      <>
                        <button
                          className="btn-primary"
                          onClick={() => proceedToPurchase(item)}
                        >
                          Comprar Ahora
                        </button>
                      </>
                    ) : (
                      // Si no es reserva temporal, solo mostrar ver detalles
                      <button></button>
                    )}
                    <button
                      className="btn-remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total-section">
                <div className="total-line">
                  <span>
                    Subtotal ({getTotalItems()}{" "}
                    {getTotalItems() === 1 ? "vuelo" : "vuelos"}):
                  </span>
                  <span>
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(calculateTotal())}
                  </span>
                </div>

                {/* 🔥 NUEVO: Mostrar resumen de tipos de items */}
                <div className="cart-summary-details">
                  {cartItems.some(
                    (item) => item.reservationType === "temporal"
                  ) && (
                    <div className="summary-note">
                      <span className="note-icon">⏰</span>
                      <span>
                        Los vuelos marcados como "Reservado" expiran en 24 horas
                      </span>
                    </div>
                  )}
                </div>

                <div className="total-line final">
                  <span>Total estimado:</span>
                  <span className="final-total">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(calculateTotal())}
                  </span>
                </div>
              </div>
              <div className="cart-notes">
                <p>
                  💡 <strong>Nota:</strong> Los precios pueden variar al
                  proceder con la compra debido a impuestos y tasas.
                </p>
                {/* 🔥 NUEVO: Nota sobre expiración */}
                {cartItems.some(
                  (item) => item.reservationType === "temporal"
                ) && (
                  <p className="expiration-note">
                    ⚠️ <strong>Atención:</strong> Las reservas temporales se
                    eliminarán automáticamente después de 24 horas.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Búsqueda de Vuelos */}
      {showSearchModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="destination-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}
          >
            <button
              className="modal-close"
              onClick={() => setShowSearchModal(false)}
            >
              ×
            </button>

            <div className="modal-header">
              <h2>Buscar Nuevos Vuelos</h2>
            </div>

            <div className="modal-content">
              <form className="flight-form" onSubmit={handleSearchFromModal}>
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
                    <select
                      value={origin}
                      onChange={(e) => {
                        setOrigin(e.target.value);
                        setDestination("");
                      }}
                      required
                      className={!origin ? "required-empty" : ""}
                    >
                      <option value="">Selecciona una ciudad de origen</option>
                      <optgroup label="🌍 Ciudades Internacionales">
                        {internationalCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🇨🇴 Ciudades Colombianas">
                        {colombianCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                            {internationalGateways.includes(city) && ""}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Destino</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                      className={!destination ? "required-empty" : ""}
                      disabled={!origin}
                    >
                      <option value="">
                        {origin
                          ? `Selecciona un destino desde ${origin}`
                          : "Primero selecciona un origen"}
                      </option>
                      {origin && (
                        <>
                          {getAvailableDestinations(origin).some((city) =>
                            internationalCities.includes(city)
                          ) && (
                            <optgroup label="🌍 Destinos Internacionales">
                              {getAvailableDestinations(origin)
                                .filter((city) =>
                                  internationalCities.includes(city)
                                )
                                .map((city) => (
                                  <option key={city} value={city}>
                                    {city}
                                  </option>
                                ))}
                            </optgroup>
                          )}
                          <optgroup label="🇨🇴 Destinos Colombianos">
                            {getAvailableDestinations(origin)
                              .filter((city) => colombianCities.includes(city))
                              .map((city) => (
                                <option key={city} value={city}>
                                  {city}
                                  {internationalGateways.includes(city) && " "}
                                </option>
                              ))}
                          </optgroup>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Fecha de salida</label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      min={today}
                    />
                  </div>

                  {tripType === "roundtrip" && (
                    <div className="input-group">
                      <label>Fecha de retorno</label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

