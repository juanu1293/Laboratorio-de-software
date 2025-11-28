import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import "./PurchaseFlight.css";

const PurchaseFlight = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("economica");
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = () => {
      const authToken =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const userData =
        localStorage.getItem("userData") || sessionStorage.getItem("userData");

      if (authToken && userData) {
        try {
          const user = JSON.parse(userData);
          setUserInfo(user);
        } catch (error) {
          console.error("Error parsing user data:", error);
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  // 🔥 CORREGIDO: Cargar datos del vuelo con mejor manejo de fechas
  useEffect(() => {
    if (location.state && location.state.flight) {
      const flight = location.state.flight;

      // 🔥 MEJORADO: Asegurar que todas las propiedades existan
      const enhancedFlight = {
        ...flight,
        selectedClass: flight.selectedClass || "economica",
        ticketQuantity: flight.ticketQuantity || 1,
        // Asegurar que los precios sean números
        priceNumber: Number(flight.priceNumber) || 0,
        costo_vip: Number(flight.costo_vip) || Number(flight.priceNumber) || 0,
        // Asegurar que las fechas estén bien formateadas
        departure: {
          city: flight.departure?.city || "Ciudad no disponible",
          airport: flight.departure?.airport || "Aeropuerto no disponible",
          time: flight.departure?.time || "00:00",
          date:
            formatDateForDisplay(flight.departure?.date) ||
            "Fecha no disponible",
        },
        arrival: {
          city: flight.arrival?.city || "Ciudad no disponible",
          airport: flight.arrival?.airport || "Aeropuerto no disponible",
          time: flight.arrival?.time || "00:00",
          date:
            formatDateForDisplay(flight.arrival?.date) || "Fecha no disponible",
        },
        // 🔥 CORREGIDO: Manejar mejor el vuelo de retorno
        returnFlight: flight.returnFlight
          ? {
              ...flight.returnFlight,
              departure: {
                city:
                  flight.returnFlight.departure?.city || "Ciudad no disponible",
                airport:
                  flight.returnFlight.departure?.airport ||
                  "Aeropuerto no disponible",
                time: flight.returnFlight.departure?.time || "00:00",
                date:
                  formatDateForDisplay(flight.returnFlight.departure?.date) ||
                  "Fecha no disponible",
              },
              arrival: {
                city:
                  flight.returnFlight.arrival?.city || "Ciudad no disponible",
                airport:
                  flight.returnFlight.arrival?.airport ||
                  "Aeropuerto no disponible",
                time: flight.returnFlight.arrival?.time || "00:00",
                date:
                  formatDateForDisplay(flight.returnFlight.arrival?.date) ||
                  "Fecha no disponible",
              },
              priceNumber: Number(flight.returnFlight.priceNumber) || 0,
              costo_vip:
                Number(flight.returnFlight.costo_vip) ||
                Number(flight.returnFlight.priceNumber) ||
                0,
            }
          : null,
      };

      setFlightData(enhancedFlight);
      setSelectedClass(enhancedFlight.selectedClass);
      setTicketQuantity(enhancedFlight.ticketQuantity);

      // Calcular precio total con los datos mejorados
      calculateTotalPrice(
        enhancedFlight,
        enhancedFlight.selectedClass,
        enhancedFlight.ticketQuantity
      );
      setLoading(false);

      console.log("✈️ Datos del vuelo cargados:", enhancedFlight);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  // 🔥 NUEVA FUNCIÓN: Formatear fecha para display
  const formatDateForDisplay = (date) => {
    if (!date) return "Fecha no disponible";

    try {
      // Si ya es una string formateada, devolverla tal cual
      if (typeof date === "string" && date.includes(", ")) {
        return date;
      }

      // Si es una fecha ISO o similar, formatearla
      const d = new Date(date);
      if (!isNaN(d)) {
        return d.toLocaleDateString("es-CO", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      // Si es otro formato, intentar parsearlo
      return String(date);
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return String(date || "Fecha no disponible");
    }
  };

  // 🔥 CORREGIDO: Calcular precio total
  const calculateTotalPrice = (
    flight,
    classType = selectedClass,
    quantity = ticketQuantity
  ) => {
    if (!flight) return;

    console.log("🔄 Calculando precio total:", { classType, quantity });

    // Precio INDIVIDUAL del vuelo de ida
    const outboundPrice =
      classType === "vip"
        ? Number(flight.costo_vip) || Number(flight.priceNumber) || 0
        : Number(flight.priceNumber) || 0;

    // Precio INDIVIDUAL del vuelo de retorno (si existe)
    const returnPrice = flight.returnFlight
      ? classType === "vip"
        ? Number(flight.returnFlight.costo_vip) ||
          Number(flight.returnFlight.priceNumber) ||
          0
        : Number(flight.returnFlight.priceNumber) || 0
      : 0;

    // SUMA CORRECTA multiplicada por cantidad
    const total = (outboundPrice + returnPrice) * quantity;

    console.log("💰 Precios calculados:", {
      outboundPrice,
      returnPrice,
      quantity,
      total,
    });

    setTotalPrice(total);
  };

  // 🔥 MODIFICADO: Manejar cambio de cantidad (eliminado cambio de clase)
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 5) {
      setTicketQuantity(newQuantity);
      calculateTotalPrice(flightData, selectedClass, newQuantity);
    }
  };

  // Validar formulario de pago
  const validatePaymentForm = () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert("Por favor completa todos los campos de pago");
      return false;
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      alert("El número de tarjeta debe tener 16 dígitos");
      return false;
    }

    if (cvv.length !== 3) {
      alert("El CVV debe tener 3 dígitos");
      return false;
    }

    return true;
  };

  // 🔥 CORREGIDO: Procesar compra con eliminación del carrito
  const handleProcessPurchase = async () => {
    if (!validatePaymentForm()) return;

    setIsProcessing(true);

    try {
      // Simular procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Crear registro de compra
      const purchaseRecord = {
        id: `purchase_${Date.now()}`,
        flightData: flightData,
        userInfo: userInfo,
        purchaseDetails: {
          selectedClass,
          ticketQuantity,
          totalPrice,
          paymentMethod,
          purchaseDate: new Date().toISOString(),
        },
        status: "confirmed",
      };

      // Guardar en historial de compras
      const purchaseHistory = JSON.parse(
        localStorage.getItem("vivasky_purchases") || "[]"
      );
      purchaseHistory.push(purchaseRecord);
      localStorage.setItem(
        "vivasky_purchases",
        JSON.stringify(purchaseHistory)
      );

      // 🔥 NUEVO: Si viene del carrito, eliminar el item
      if (location.state?.fromCart && location.state?.cartItemId) {
        const currentCart = JSON.parse(
          localStorage.getItem("vivasky_cart") || "[]"
        );
        const updatedCart = currentCart.filter(
          (item) => item.id !== location.state.cartItemId
        );
        localStorage.setItem("vivasky_cart", JSON.stringify(updatedCart));
        console.log("🛒 Item eliminado del carrito después de compra");
      }

      // Mostrar confirmación
      alert(
        `✅ Compra realizada exitosamente!\n\n🎫 ${ticketQuantity} tiquete(s) comprado(s)\n💰 Total: ${formatPrice(
          totalPrice
        )}\n📧 Recibirás el confirmación en ${userInfo.correo}`
      );

      // Redirigir a página de confirmación
      navigate("/purchase-confirmation", {
        state: {
          purchase: purchaseRecord,
          flight: flightData,
        },
      });
    } catch (error) {
      console.error("Error procesando compra:", error);
      alert("❌ Error al procesar la compra. Inténtalo de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // 🔥 MEJORADO: Formatear fecha de manera más robusta
  const formatDate = (date) => {
    if (!date) return "Fecha no disponible";
    try {
      // Si ya está formateada, devolverla tal cual
      if (typeof date === "string" && date.includes(", ")) {
        return date;
      }

      const d = new Date(date);
      if (!isNaN(d)) {
        return d.toLocaleDateString("es-CO", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return String(date);
    } catch {
      return String(date || "Fecha no disponible");
    }
  };

  if (loading) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo-container" onClick={() => navigate("/")}>
            <img
              src="https://i.pinimg.com/736x/60/48/b4/6048b4ae7f74724389d345767e8061a0.jpg"
              alt="VivaSky Logo"
              className="logo-image"
            />
            <span className="logo-text">VivaSky</span>
          </div>
        </header>
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Cargando información de compra...</p>
        </div>
      </div>
    );
  }

  if (!flightData) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo-container" onClick={() => navigate("/")}>
            <img
              src="https://i.pinimg.com/736x/60/48/b4/6048b4ae7f74724389d345767e8061a0.jpg"
              alt="VivaSky Logo"
              className="logo-image"
            />
            <span className="logo-text">VivaSky</span>
          </div>
        </header>
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Error al cargar la información</h2>
          <p>No se pudo cargar la información del vuelo.</p>
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
        <div className="logo-container" onClick={() => navigate("/")}>
          <img
            src="https://i.pinimg.com/736x/60/48/b4/6048b4ae7f74724389d345767e8061a0.jpg"
            alt="VivaSky Logo"
            className="logo-image"
          />
          <span className="logo-text">VivaSky</span>
        </div>
        <button className="back-btn" onClick={() => navigate(-1)}>
          Volver
        </button>
      </header>

      <div className="purchase-container">
        <div className="purchase-header">
          <h1>🎫 Finalizar Compra</h1>
          <p>Completa tu información de pago para confirmar la compra</p>
        </div>

        <div className="purchase-layout">
          {/* Columna izquierda - Información del vuelo */}
          <div className="purchase-flight-info">
            <div className="info-card">
              <h3>✈️ Información del Vuelo</h3>

              <div className="flight-summary">
                <div className="route-summary">
                  <div className="cities">
                    <span className="city-from">
                      {flightData.departure?.city}
                    </span>
                    <span className="arrow">→</span>
                    <span className="city-to">{flightData.arrival?.city}</span>
                  </div>
                  <div className="dates">
                    {/* 🔥 CORREGIDO: Mostrar fechas correctamente */}
                    <div className="date-section">
                      <strong>Salida:</strong> {flightData.departure?.date}
                    </div>
                    {flightData.returnFlight && (
                      <div className="date-section">
                        <strong>Retorno:</strong>{" "}
                        {flightData.returnFlight.departure?.date}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flight-details">
                  <div className="detail-item">
                    <span>Aerolínea:</span>
                    <span>{flightData.airline}</span>
                  </div>
                  <div className="detail-item">
                    <span>Número de vuelo:</span>
                    <span>{flightData.flightNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span>Tipo de viaje:</span>
                    <span>
                      {flightData.returnFlight ? "Ida y Vuelta" : "Solo Ida"}
                    </span>
                  </div>
                  {/* 🔥 NUEVO: Mostrar clase seleccionada */}
                  <div className="detail-item">
                    <span>Clase:</span>
                    <span className="class-badge">
                      {selectedClass === "vip" ? "⭐ VIP" : "💺 Económica"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 🔥 ELIMINADO: Selector de Clase (ya no se necesita) */}

              {/* Selector de Cantidad */}
              <div className="quantity-selection">
                <h4>🎟️ Cantidad de Tiquetes</h4>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(ticketQuantity - 1)}
                    disabled={ticketQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-display">{ticketQuantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(ticketQuantity + 1)}
                    disabled={ticketQuantity >= 5}
                  >
                    +
                  </button>
                </div>
                <p className="quantity-note">Máximo 5 tiquetes por compra</p>

                {/* 🔥 NUEVO: Mostrar información de precio por tiquete */}
                <div className="price-per-ticket">
                  <span>Precio por tiquete: </span>
                  <span className="ticket-price">
                    {formatPrice(
                      selectedClass === "vip"
                        ? Number(flightData.costo_vip) ||
                            Number(flightData.priceNumber) ||
                            0
                        : Number(flightData.priceNumber) || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Información de Pago */}
          <div className="purchase-payment-info">
            <div className="payment-card">
              <h3>💳 Información de Pago</h3>

              {/* Método de Pago */}
              <div className="payment-method">
                <h4>Método de Pago</h4>
                <div className="method-options">
                  <label
                    className={`method-option ${
                      paymentMethod === "credit" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit"
                      checked={paymentMethod === "credit"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-icon">💳</span>
                    <span>Tarjeta de Crédito</span>
                  </label>
                  <label
                    className={`method-option ${
                      paymentMethod === "debit" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="debit"
                      checked={paymentMethod === "debit"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-icon">🏦</span>
                    <span>Tarjeta de Débito</span>
                  </label>
                </div>
              </div>

              {/* Formulario de Tarjeta */}
              <div className="card-form">
                <div className="form-group">
                  <label>Número de Tarjeta</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 16)
                      )
                    }
                    maxLength={16}
                  />
                </div>

                <div className="form-group">
                  <label>Nombre en la Tarjeta</label>
                  <input
                    type="text"
                    placeholder="JUAN PEREZ"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Expiración</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={expiryDate}
                      onChange={(e) =>
                        setExpiryDate(
                          e.target.value.replace(/\D/g, "").slice(0, 4)
                        )
                      }
                      maxLength={4}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                      }
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>

              {/* Resumen de Pago */}
              <div className="payment-summary">
                <h4>Resumen de Pago</h4>
                <div className="summary-items">
                  <div className="summary-item">
                    <span>
                      Vuelo ({selectedClass === "vip" ? "VIP" : "Económica"}):
                    </span>
                    <span>
                      {formatPrice(
                        selectedClass === "vip"
                          ? Number(flightData.costo_vip) ||
                              Number(flightData.priceNumber) ||
                              0
                          : Number(flightData.priceNumber) || 0
                      )}
                    </span>
                  </div>
                  {flightData.returnFlight && (
                    <div className="summary-item">
                      <span>
                        Vuelo retorno (
                        {selectedClass === "vip" ? "VIP" : "Económica"}):
                      </span>
                      <span>
                        {formatPrice(
                          selectedClass === "vip"
                            ? Number(flightData.returnFlight.costo_vip) ||
                                Number(flightData.returnFlight.priceNumber) ||
                                0
                            : Number(flightData.returnFlight.priceNumber) || 0
                        )}
                      </span>
                    </div>
                  )}
                  <div className="summary-item">
                    <span>Cantidad:</span>
                    <span>{ticketQuantity} tiquete(s)</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-total">
                    <span>Total a Pagar:</span>
                    <span className="total-amount">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón de Compra */}
              <button
                className={`purchase-btn ${isProcessing ? "processing" : ""}`}
                onClick={handleProcessPurchase}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner-small"></div>
                    Procesando Pago...
                  </>
                ) : (
                  `Pagar ${formatPrice(totalPrice)}`
                )}
              </button>

              <div className="security-notice">
                <span className="lock-icon">🔒</span>
                <span>Tu pago está protegido con encriptación SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFlight;
