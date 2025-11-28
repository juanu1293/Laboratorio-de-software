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
  const [useSavedCard, setUseSavedCard] = useState(true); // true => usar tarjeta guardada
  const [selectedCard, setSelectedCard] = useState(null);

  // Form (tarjeta nueva o cvv para tarjeta guardada)
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Estados faltantes en tu versión original
  const [selectedClass, setSelectedClass] = useState("economica"); // se puede sobreescribir desde location.state
  const [paymentMethod, setPaymentMethod] = useState("credit"); // 'credit' o 'debit'

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

  // formateadores inputs tarjeta nueva
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

  // ---------- INIT: usuario, vuelo, y tarjetas ----------
  useEffect(() => {
    const initData = async () => {
      const authToken =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const userData =
        localStorage.getItem("userData") || sessionStorage.getItem("userData");

      if (!authToken || !userData) {
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(userData);
        setUserInfo(user);
      } catch (err) {
        console.error("Error parsing userData:", err);
        navigate("/login");
        return;
      }

      // Cargar tarjetas del backend
      try {
        const cards = await apiService.get("/cards");
        setSavedCards(cards || []);
        if ((cards || []).length === 0) {
          setUseSavedCard(false);
        } else {
          setUseSavedCard(true);
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
      }
    };

    // Cargar datos del vuelo desde navigation state
    if (location.state && location.state.flight) {
      const flight = location.state.flight;
      setFlightData(flight);

      // si ReserveFlight pasó selectedClass y ticketQuantity, respetarlos
      if (flight.selectedClass) setSelectedClass(flight.selectedClass);
      if (flight.ticketQuantity) setTicketQuantity(Number(flight.ticketQuantity));

      // calcular precio inicial según clase y cantidad
      const unitPrice =
        (flight.selectedClass === "vip"
          ? Number(flight.costo_vip) || Number(flight.priceNumber) || 0
          : Number(flight.priceNumber) || 0) || Number(flight.costo_economico) || 0;

      setTotalPrice(unitPrice * (flight.ticketQuantity || 1));
      setLoading(false);
    } else {
      setLoading(false);
    }

    initData();
  }, [location, navigate]);

  // recalcular total cuando cambian clase / cantidad / flightData
  useEffect(() => {
    if (!flightData) return;
    const unitPrice =
      selectedClass === "vip"
        ? Number(flightData.costo_vip) || Number(flightData.priceNumber) || 0
        : Number(flightData.priceNumber) || Number(flightData.costo_economico) || 0;
    setTotalPrice(unitPrice * ticketQuantity);
  }, [selectedClass, ticketQuantity, flightData]);

  // cambio de cantidad
  const handleQuantityChange = (newQty) => {
    const qty = Number(newQty);
    if (!qty || qty < 1) return;
    if (qty > 5) return; // según tu límite
    setTicketQuantity(qty);
  };

  // seleccionar tarjeta guardada
  const handleSelectCard = (card) => {
    setSelectedCard(card);
    setCvv("");
  };

  // refrescar lista de tarjetas
  const refreshCards = async () => {
    try {
      const cards = await apiService.get("/cards");
      setSavedCards(cards || []);
    } catch (err) {
      console.error("Error refreshing cards:", err);
    }
  };

  // ---------- PROCESAR PAGO ----------
  const handleProcessPurchase = async () => {
    setErrorMsg("");

    // Verificaciones básicas
    if (!flightData) {
      setErrorMsg("No hay información del vuelo.");
      return;
    }
    if (!userInfo) {
      setErrorMsg("Usuario no autenticado.");
      return;
    }

    // Si usa tarjeta guardada, validar selección y CVV
    if (useSavedCard) {
      if (!selectedCard) {
        setErrorMsg("Selecciona una tarjeta guardada.");
        return;
      }
      if (!cvv || cvv.length !== 3) {
        setErrorMsg("Ingresa un CVV válido (3 dígitos).");
        return;
      }
      // comparar como strings
      if (String(cvv) !== String(selectedCard.cvv)) {
        setErrorMsg("CVV incorrecto.");
        return;
      }
      // verificar saldo suficiente en la tarjeta
      const saldo = Number(selectedCard.saldo || 0);
      if (saldo < Number(totalPrice)) {
        setErrorMsg(
          `Saldo insuficiente en la tarjeta seleccionada. Saldo: ${formatPrice(
            saldo
          )}`
        );
        return;
      }
    } else {
      // tarjeta nueva: validar campos
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        setErrorMsg("Todos los campos de la tarjeta son obligatorios.");
        return;
      }
      if (cvv.length !== 3) {
        setErrorMsg("El CVV debe tener 3 dígitos.");
        return;
      }
      // no guardamos la tarjeta aquí (si deseas guardarla, hay que llamar a POST /cards)
    }

    setIsProcessing(true);
    try {
      // 1) Si se usa tarjeta guardada: descontar saldo usando endpoint similar al de Payments.jsx
      let usedCardId = null;
      if (useSavedCard) {
        usedCardId = selectedCard.idtarjeta;

        // Llamada al backend para actualizar saldo -> en Payments.js hacen PUT /cards/:id/recharge con { monto }
        // Para descontar, enviamos monto negativo.
        const body = { monto: -Math.round(Number(totalPrice)) }; // monto en número entero
        try {
          const resp = await apiService.put(`/cards/${selectedCard.idtarjeta}/recharge`, body);
          // si backend responde { tarjeta: updatedCard } (como en Payments.jsx), actualizar listado
          if (resp && resp.tarjeta) {
            // actualizar en UI
            await refreshCards();
          } else {
            // fallback: refresh
            await refreshCards();
          }
        } catch (err) {
          console.error("Error descontando saldo:", err);
          throw new Error("No se pudo procesar el pago con la tarjeta guardada.");
        }
      } else {
        // 2) Tarjeta nueva: normalmente aquí llamarías al procesador de pagos (no implementado).
        // Para simular, podríamos crear la reserva directamente sin tocar saldo.
        // Si quieres guardar la tarjeta nueva en el backend, podrías hacer:
        // await apiService.post('/cards', {...});
        usedCardId = null; // tarjeta nueva -> no hay id guardado
      }

      // 3) Crear la reserva en backend
      // Construimos payload lógico (ajusta los campos según tu API real)
      const userId =
        userInfo.id_usuario || userInfo.idcliente || userInfo.id || userInfo.userId;
      const reservationPayload = {
        flightNumber: flightData.flightNumber || flightData.id || flightData.codigo,
        userId,
        seats: ticketQuantity,
        total: Number(totalPrice),
        cardId: usedCardId,
        selectedClass,
        isRoundTrip: !!flightData.returnFlight,
        departure: flightData.departure,
        arrival: flightData.arrival,
        // agrega otros campos que tu API requiera (p.ej. precio unitario, impuestos)
      };

      try {
        await apiService.post("/reservations", reservationPayload);
      } catch (err) {
        console.error("Error creando reserva:", err);
        // Intentar revertir la deducción si tu backend no lo hace automáticamente sería ideal.
        throw new Error("No se pudo crear la reserva. Contacta soporte.");
      }

      // Éxito
      setIsProcessing(false);
      alert("¡Pago y reserva completados con éxito!");
      navigate("/"); // o navigate('/my-reservations') según flujo
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error procesando el pago.");
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
                    <span className="city-from">{flightData.departure?.city}</span>
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
                </div>
              </div>

              {/* Cantidad */}
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

                <div className="price-per-ticket">
                  <span>Precio por tiquete: </span>
                  <span className="ticket-price">
                    {formatPrice(
                      selectedClass === "vip"
                        ? Number(flightData.costo_vip) ||
                            Number(flightData.priceNumber) ||
                            0
                        : Number(flightData.priceNumber) ||
                            Number(flightData.costo_economico) ||
                            0
                    )}
                  </span>
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
                                <strong>{maskCardNumber(card.numtarjeta)}</strong>{" "}
                                <span className="card-owner">
                                  {card.nombrepersona}
                                </span>
                              </div>
                              <div className="card-meta">
                                <span>{card.tipo === "credito" ? "Crédito" : "Débito"}</span>
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
                          <label>Ingresa el CVV para confirmar</label>
                          <div className="cvv-input-wrapper">
                            <input
                              type="password"
                              placeholder="123"
                              maxLength="3"
                              value={cvv}
                              onChange={(e) =>
                                setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                              }
                              autoFocus
                            />
                            <span className="cvv-hint">3 dígitos al reverso</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>No tienes tarjetas guardadas. Usa "Usar Nueva Tarjeta" para pagar.</p>
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
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
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
                        type="text"
                        placeholder="123"
                        maxLength="3"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Resumen */}
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
                          : Number(flightData.priceNumber) ||
                              Number(flightData.costo_economico) ||
                              0
                      )}
                    </span>
                  </div>

                  {flightData.returnFlight && (
                    <div className="summary-item">
                      <span>Vuelo retorno ({selectedClass === "vip" ? "VIP" : "Económica"}):</span>
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
                    <span className="total-amount">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Botón */}
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
