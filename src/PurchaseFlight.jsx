// PurchaseFlight.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "./apiService";
import "./App.css";
import "./PurchaseFlight.css";

const PurchaseFlight = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Usuario y vuelo
  const [userInfo, setUserInfo] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Compra
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tarjetas
  const [savedCards, setSavedCards] = useState([]);
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);

  // Form (tarjeta nueva o cvv para tarjeta guardada)
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Estados
  const [selectedClass, setSelectedClass] = useState("economica");
  const [paymentMethod, setPaymentMethod] = useState("credit");

  // ---------- UTILIDADES ----------
  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price || 0);

  const maskCardNumber = (num) => {
    if (!num) return "";
    const s = String(num);
    return `**** **** **** ${s.slice(-4)}`;
  };

  const handleCardNumChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 16) return;
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleDateChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 4) return;
    setExpiryDate(raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw);
  };

  // ---------- DEBUG FUNCTIONS ----------
  const debugFlightData = () => {
    console.log("=== DEBUG FLIGHT DATA ===");
    console.log("flightData:", flightData);
    if (flightData) {
      console.log(
        "costo_economico:",
        flightData.costo_economico,
        "Type:",
        typeof flightData.costo_economico
      );
      console.log(
        "costo_vip:",
        flightData.costo_vip,
        "Type:",
        typeof flightData.costo_vip
      );
      console.log(
        "priceNumber:",
        flightData.priceNumber,
        "Type:",
        typeof flightData.priceNumber
      );
      console.log("selectedClass:", selectedClass);
      console.log("returnFlight:", flightData.returnFlight);
      console.log("ticketQuantity:", ticketQuantity);

      // Calcular precios manualmente para debug
      const unitPrice = Number(flightData.priceNumber) || 0;
      const calculatedTotal = unitPrice * ticketQuantity;

      console.log("unitPrice:", unitPrice);
      console.log("calculatedTotal:", calculatedTotal);
      console.log("current totalPrice state:", totalPrice);
    }
    console.log("========================");
  };

  // ---------- INIT: usuario, vuelo, y tarjetas ----------
  useEffect(() => {
    const initData = async () => {
      console.log("🔄 INIT: Starting data initialization");

      const authToken =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const userData =
        localStorage.getItem("userData") || sessionStorage.getItem("userData");

      if (!authToken || !userData) {
        console.log(
          "❌ INIT: No auth token or user data, redirecting to login"
        );
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(userData);
        setUserInfo(user);
        console.log("✅ INIT: User info set:", user);
      } catch (err) {
        console.error("❌ INIT: Error parsing userData:", err);
        navigate("/login");
        return;
      }

      // Cargar tarjetas del backend
      try {
        console.log("🔄 INIT: Fetching cards from backend");
        const cards = await apiService.get("/cards");
        setSavedCards(cards || []);
        console.log("✅ INIT: Cards loaded:", cards?.length || 0);

        if ((cards || []).length === 0) {
          setUseSavedCard(false);
          console.log("ℹ️ INIT: No saved cards, switching to new card mode");
        } else {
          setUseSavedCard(true);
          console.log("ℹ️ INIT: Saved cards available, using saved card mode");
        }
      } catch (err) {
        console.error("❌ INIT: Error fetching cards:", err);
      }
    };

    // Cargar datos del vuelo desde navigation state
    console.log("🔄 INIT: Checking location state for flight data");
    if (location.state && location.state.flight) {
      const flight = location.state.flight;
      console.log("✅ INIT: Flight data from location:", flight);
      setFlightData(flight);

      // si ReserveFlight pasó selectedClass y ticketQuantity, respetarlos
      if (flight.selectedClass) {
        setSelectedClass(flight.selectedClass);
        console.log(
          "ℹ️ INIT: Selected class from flight:",
          flight.selectedClass
        );
      }

      // FORZAR cantidad a 1 aunque venga con 2
      const forcedQuantity = 1; // Cambiar esto a 1 para forzar 1 tiquete
      setTicketQuantity(forcedQuantity);
      console.log(
        "🔄 INIT: Forcing ticket quantity to:",
        forcedQuantity,
        "(original was:",
        flight.ticketQuantity,
        ")"
      );

      // calcular precio inicial - SOLO USAR priceNumber
      const unitPrice = Number(flight.priceNumber) || 0;
      const initialTotal = unitPrice * forcedQuantity;

      console.log("💰 INIT: Price calculation:", {
        unitPrice,
        initialTotal,
        quantity: forcedQuantity,
      });

      setTotalPrice(initialTotal);
      setLoading(false);
      console.log("✅ INIT: Flight data loaded successfully");
    } else {
      console.log("❌ INIT: No flight data in location state");
      setLoading(false);
    }

    initData();
  }, [location, navigate]);

  // recalcular total cuando cambian clase / cantidad / flightData
  useEffect(() => {
    console.log("🔄 PRICE CALC: Recalculating total price");
    console.log("PRICE CALC - flightData:", flightData ? "exists" : "null");
    console.log("PRICE CALC - selectedClass:", selectedClass);
    console.log("PRICE CALC - ticketQuantity:", ticketQuantity);

    if (!flightData) {
      console.log("❌ PRICE CALC: No flight data, skipping calculation");
      return;
    }

    // Calcular precio unitario - SOLO USAR priceNumber
    const unitPrice = Number(flightData.priceNumber) || 0;
    const newTotal = unitPrice * ticketQuantity;

    console.log("💰 PRICE CALC: New calculation:", {
      unitPrice,
      ticketQuantity,
      newTotal,
    });

    setTotalPrice(newTotal);
    console.log("✅ PRICE CALC: Total price updated to:", newTotal);

    // Debug después del cálculo
    setTimeout(debugFlightData, 100);
  }, [selectedClass, ticketQuantity, flightData]);

  // cambio de cantidad
  const handleQuantityChange = (newQty) => {
    const qty = Number(newQty);
    console.log("🔄 QUANTITY CHANGE: New quantity:", qty);

    if (!qty || qty < 1) {
      console.log("❌ QUANTITY CHANGE: Invalid quantity");
      return;
    }
    if (qty > 5) {
      console.log("❌ QUANTITY CHANGE: Quantity exceeds limit (5)");
      return;
    }
    setTicketQuantity(qty);
    console.log("✅ QUANTITY CHANGE: Quantity updated to:", qty);
  };

  // seleccionar tarjeta guardada
  const handleSelectCard = (card) => {
    console.log("💳 CARD SELECT: Selected card:", card);
    setSelectedCard(card);
    setCvv("");
  };

  // refrescar lista de tarjetas
  const refreshCards = async () => {
    try {
      console.log("🔄 REFRESH CARDS: Refreshing card list");
      const cards = await apiService.get("/cards");
      setSavedCards(cards || []);
      console.log("✅ REFRESH CARDS: Cards refreshed:", cards?.length || 0);
    } catch (err) {
      console.error("❌ REFRESH CARDS: Error refreshing cards:", err);
    }
  };

  // ---------- VALIDACIONES DE PAGO ----------
  const validatePayment = () => {
    console.log("🔄 VALIDATION: Starting payment validation");

    // Verificaciones básicas
    if (!flightData) {
      setErrorMsg("No hay información del vuelo.");
      return false;
    }
    if (!userInfo) {
      setErrorMsg("Usuario no autenticado.");
      return false;
    }

    // Validaciones según el tipo de tarjeta
    if (useSavedCard) {
      console.log("💳 VALIDATION: Validating saved card");

      if (!selectedCard) {
        setErrorMsg("Selecciona una tarjeta guardada.");
        return false;
      }

      if (!cvv || cvv.length !== 3) {
        setErrorMsg("Ingresa un CVV válido (3 dígitos).");
        return false;
      }

      // Validar que el CVV coincida
      if (String(cvv) !== String(selectedCard.cvv)) {
        setErrorMsg("CVV incorrecto.");
        return false;
      }

      // Validar saldo suficiente
      const saldo = Number(selectedCard.saldo || 0);
      if (saldo < Number(totalPrice)) {
        setErrorMsg(
          `Saldo insuficiente en la tarjeta seleccionada. Saldo: ${formatPrice(
            saldo
          )}`
        );
        return false;
      }

      console.log("✅ VALIDATION: Saved card validation passed");
    } else {
      console.log("💳 VALIDATION: Validating new card");

      // Validar campos de tarjeta nueva
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        setErrorMsg("Todos los campos de la tarjeta son obligatorios.");
        return false;
      }

      if (cardNumber.replace(/\s/g, "").length !== 16) {
        setErrorMsg("El número de tarjeta debe tener 16 dígitos.");
        return false;
      }

      if (cvv.length !== 3) {
        setErrorMsg("El CVV debe tener 3 dígitos.");
        return false;
      }

      // Validar fecha de expiración (formato MM/AA)
      const [month, year] = expiryDate.split("/");
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        setErrorMsg("La fecha de expiración debe tener el formato MM/AA.");
        return false;
      }

      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      const expMonth = parseInt(month);
      const expYear = parseInt(year);

      if (expMonth < 1 || expMonth > 12) {
        setErrorMsg("El mes de expiración debe estar entre 01 y 12.");
        return false;
      }

      if (
        expYear < currentYear ||
        (expYear === currentYear && expMonth < currentMonth)
      ) {
        setErrorMsg("La tarjeta está expirada.");
        return false;
      }

      console.log("✅ VALIDATION: New card validation passed");
    }

    return true;
  };

  // ---------- PROCESAR PAGO ----------
  const handleProcessPurchase = async () => {
    console.log("🔄 PURCHASE: Starting purchase process");
    setErrorMsg("");
    setIsProcessing(true);

    try {
      // Validar pago antes de procesar
      if (!validatePayment()) {
        setIsProcessing(false);
        return;
      }

      console.log("✅ PURCHASE: Payment validation passed");

      let paymentResult = null;
      let usedCardId = null;

      // Procesar pago según el tipo de tarjeta
      if (useSavedCard) {
        console.log("💳 PURCHASE: Processing payment with saved card");

        usedCardId = selectedCard.idtarjeta;

        // Descontar saldo de la tarjeta guardada
        const deductionBody = {
          monto: -Math.round(Number(totalPrice)),
        };

        console.log("💰 PURCHASE: Deducting from card:", {
          cardId: usedCardId,
          amount: deductionBody.monto,
          currentBalance: selectedCard.saldo,
        });

        try {
          const deductionResponse = await apiService.put(
            `/cards/${selectedCard.idtarjeta}/recharge`,
            deductionBody
          );

          console.log(
            "✅ PURCHASE: Card deduction successful:",
            deductionResponse
          );

          // Actualizar lista de tarjetas
          await refreshCards();
        } catch (err) {
          console.error("❌ PURCHASE: Error deducting from card:", err);
          throw new Error(
            "No se pudo procesar el pago con la tarjeta guardada."
          );
        }
      } else {
        console.log("💳 PURCHASE: Processing payment with new card");

        // Para tarjeta nueva, primero guardarla (si no existe)
        const newCardPayload = {
          numtarjeta: cardNumber.replace(/\s/g, ""),
          nombrepersona: cardName,
          fecha_expiracion: expiryDate,
          cvv: cvv,
          tipo: paymentMethod,
          saldo: 1000000, // Asignar un saldo inicial para demo
        };

        try {
          console.log("💳 PURCHASE: Saving new card:", newCardPayload);
          const cardResponse = await apiService.post("/cards", newCardPayload);
          usedCardId = cardResponse.idtarjeta;
          console.log("✅ PURCHASE: New card saved:", cardResponse);

          // Actualizar lista de tarjetas
          await refreshCards();
        } catch (err) {
          console.error("❌ PURCHASE: Error saving new card:", err);
          // Continuar sin guardar la tarjeta si hay error
          console.log("ℹ️ PURCHASE: Continuing without saving new card");
        }
      }

      // Crear la reserva en el backend
      const userId =
        userInfo.id_usuario ||
        userInfo.idcliente ||
        userInfo.id ||
        userInfo.userId;

      const reservationPayload = {
        flightNumber:
          flightData.flightNumber || flightData.id || flightData.codigo,
        userId: userId,
        seats: ticketQuantity,
        total: Number(totalPrice),
        cardId: usedCardId,
        selectedClass: selectedClass,
        isRoundTrip: !!flightData.returnFlight,
        departure: flightData.departure,
        arrival: flightData.arrival,
        airline: flightData.airline,
        flightData: flightData, // Enviar datos completos del vuelo por si acaso
      };

      console.log("📦 PURCHASE: Creating reservation:", reservationPayload);

      try {
        // Intentar primero con el endpoint de reservas
        let reservationResponse;
        try {
          reservationResponse = await apiService.post(
            "/reservations",
            reservationPayload
          );
          console.log(
            "✅ PURCHASE: Reservation created successfully:",
            reservationResponse
          );
        } catch (reservationErr) {
          console.log(
            "ℹ️ PURCHASE: Reservation endpoint failed, trying purchase endpoint:",
            reservationErr
          );

          // Si falla, intentar con el endpoint de compra
          const purchasePayload = {
            idcliente: userId,
            idtiquete: flightData.id || `ticket_${Date.now()}`,
            numtarjeta: useSavedCard
              ? selectedCard.numtarjeta
              : cardNumber.replace(/\s/g, ""),
            monto: Number(totalPrice),
          };

          reservationResponse = await apiService.post(
            "/compras/pagar",
            purchasePayload
          );
          console.log(
            "✅ PURCHASE: Purchase processed successfully:",
            reservationResponse
          );
        }

        paymentResult = reservationResponse;
      } catch (err) {
        console.error("❌ PURCHASE: Error creating reservation/purchase:", err);

        // Si hay error en la reserva, revertir la deducción de saldo
        if (useSavedCard && selectedCard) {
          console.log(
            "🔄 PURCHASE: Reverting card deduction due to reservation error"
          );
          try {
            const revertBody = { monto: Math.round(Number(totalPrice)) };
            await apiService.put(
              `/cards/${selectedCard.idtarjeta}/recharge`,
              revertBody
            );
            await refreshCards();
            console.log("✅ PURCHASE: Card deduction reverted");
          } catch (revertErr) {
            console.error(
              "❌ PURCHASE: Error reverting card deduction:",
              revertErr
            );
          }
        }

        throw new Error("No se pudo crear la reserva. Contacta soporte.");
      }

      // Éxito - Mostrar confirmación y redirigir
      setIsProcessing(false);
      console.log(
        "🎉 PURCHASE: Purchase completed successfully!",
        paymentResult
      );

      // Mostrar alerta de éxito
      alert(
        `¡Pago y reserva completados con éxito!\n\nResumen:\n- Vuelo: ${
          flightData.flightNumber
        }\n- Aerolínea: ${flightData.airline}\n- Clase: ${
          selectedClass === "vip" ? "VIP" : "Económica"
        }\n- Cantidad: ${ticketQuantity} tiquete(s)\n- Total: ${formatPrice(
          totalPrice
        )}\n\n¡Gracias por tu compra!`
      );

      // Redirigir a la página principal o a mis reservas
      navigate("/my-reservations", {
        state: {
          purchaseSuccess: true,
          reservation: paymentResult,
          flight: flightData,
        },
      });
    } catch (err) {
      console.error("❌ PURCHASE: Purchase failed:", err);
      setErrorMsg(
        err.message ||
          "Ocurrió un error procesando el pago. Por favor intenta nuevamente."
      );
      setIsProcessing(false);
    }
  };

  // ---------- RENDER ----------
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
          <h2>Error al cargar la información del vuelo.</h2>
          <button className="back-btn" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  console.log("🎨 RENDER: Rendering component with current state");
  debugFlightData();

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
          {/* IZQUIERDA - Info vuelo */}
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
                    <span>Clase:</span>
                    <span className="class-badge">
                      {selectedClass === "vip" ? "⭐ VIP" : "💺 Económica"}
                    </span>
                  </div>

                  {/* Debug info en UI */}
                  <div className="detail-item debug-info">
                    <span>Precio Base:</span>
                    <span>
                      {formatPrice(Number(flightData.priceNumber) || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DERECHA - Pago */}
          <div className="purchase-payment-info">
            <div className="payment-card">
              <h3>💳 Información de Pago</h3>

              {/* Toggle Mis Tarjetas / Nueva */}
              <div className="payment-method-toggle">
                <button
                  className={`toggle-btn ${useSavedCard ? "active" : ""}`}
                  onClick={() => {
                    setUseSavedCard(true);
                    setSelectedCard(null);
                    setCvv("");
                  }}
                  disabled={savedCards.length === 0}
                >
                  Mis Tarjetas Guardadas
                </button>
                <button
                  className={`toggle-btn ${!useSavedCard ? "active" : ""}`}
                  onClick={() => {
                    setUseSavedCard(false);
                    setSelectedCard(null);
                    setCvv("");
                  }}
                >
                  Usar Nueva Tarjeta
                </button>
              </div>

              {errorMsg && <div className="error-alert">{errorMsg}</div>}

              {/* OPCIÓN A: tarjetas guardadas */}
              {useSavedCard ? (
                <div className="saved-cards-container">
                  {savedCards.length > 0 ? (
                    <>
                      <p className="section-instruction">
                        Selecciona la tarjeta que deseas usar:
                      </p>
                      <div className="saved-cards-list">
                        {savedCards.map((card) => (
                          <div
                            key={card.idtarjeta}
                            className={`saved-card-item ${
                              selectedCard?.idtarjeta === card.idtarjeta
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => handleSelectCard(card)}
                          >
                            <div className="card-info-display">
                              <div>
                                <strong>
                                  {maskCardNumber(card.numtarjeta)}
                                </strong>{" "}
                                <span className="card-owner">
                                  {card.nombrepersona}
                                </span>
                              </div>
                              <div className="card-meta">
                                <span>
                                  {card.tipo === "credito"
                                    ? "Crédito"
                                    : "Débito"}
                                </span>
                                <span> • Exp: {card.fecha_expiracion}</span>
                              </div>
                            </div>
                            <div className="card-balance">
                              Saldo: {formatPrice(Number(card.saldo || 0))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedCard && (
                        <div className="cvv-verification-box">
                          <label>Ingresa el CVV para confirmar el pago</label>
                          <div className="cvv-input-wrapper">
                            <input
                              type="password"
                              placeholder="123"
                              maxLength="3"
                              value={cvv}
                              onChange={(e) =>
                                setCvv(
                                  e.target.value.replace(/\D/g, "").slice(0, 3)
                                )
                              }
                              autoFocus
                            />
                            <span className="cvv-hint">
                              3 dígitos al reverso de la tarjeta
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>
                      No tienes tarjetas guardadas. Usa "Usar Nueva Tarjeta"
                      para pagar.
                    </p>
                  )}
                </div>
              ) : (
                // OPCIÓN B: tarjeta nueva
                <div className="new-card-form">
                  <div className="input-group">
                    <label>Número de Tarjeta</label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumChange}
                      maxLength={19}
                    />
                  </div>
                  <div className="input-group">
                    <label>Nombre del Titular</label>
                    <input
                      type="text"
                      placeholder="COMO APARECE EN LA TARJETA"
                      value={cardName}
                      onChange={(e) =>
                        setCardName(e.target.value.toUpperCase())
                      }
                    />
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Expiración (MM/AA)</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={expiryDate}
                        onChange={handleDateChange}
                        maxLength={5}
                      />
                    </div>
                    <div className="input-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength="3"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                        }
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Tipo de Tarjeta</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="credit">Crédito</option>
                      <option value="debit">Débito</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Resumen */}
              <div className="payment-summary">
                <h4>Resumen de Pago</h4>
                <div className="summary-items">
                  <div className="summary-item">
                    <span>
                      Vuelo{" "}
                      {flightData.returnFlight
                        ? "(Ida y Vuelta)"
                        : "(Solo Ida)"}
                      :
                    </span>
                    <span>
                      {selectedClass === "vip" ? "⭐ VIP" : "💺 Económica"}
                    </span>
                  </div>

                  <div className="summary-item">
                    <span>Cantidad:</span>
                    <span>{ticketQuantity} tiquete(s)</span>
                  </div>

                  <div className="summary-item">
                    <span>Precio unitario:</span>
                    <span>
                      {formatPrice(Number(flightData.priceNumber) || 0)}
                    </span>
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

              {/* Botón de pago */}
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
