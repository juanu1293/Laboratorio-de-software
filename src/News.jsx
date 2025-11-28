import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./News.css";

const News = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  const logoUrl =
    "https://i.pinimg.com/736x/60/48/b4/6048b4ae7f74724389d345767e8061a0.jpg";

  // 🔥 CONTENIDO BÁSICO - VISIBLE PARA TODOS
  const [basicNews] = useState([
    {
      id: 1,
      title: "VivaSky reconocida como mejor aerolínea 2024",
      content:
        "Gracias a nuestros pasajeros por este reconocimiento internacional. Seguiremos trabajando para ofrecer el mejor servicio.",
      image:
        "https://i.pinimg.com/1200x/60/48/b4/6048b4ae7f74724389d345767e8061a0.jpg",
      date: "2025-06-05",
      type: "news",
      category: "basic",
      fullDescription:
        "VivaSky ha sido galardonada con el premio a la Mejor Aerolínea 2024 en los International Airline Awards. Este reconocimiento se otorga basado en la satisfacción del cliente, puntualidad de vuelos, calidad de servicio a bordo y innovación en la experiencia de viaje. Agradecemos a todos nuestros pasajeros por su lealtad y confianza.",
    },
    {
      id: 2,
      title: "¡La ruta mas usada Bogota-Buenos Aires!",
      content:
        "Estamos contentos de ofrecer a nuestros clientes viajes comodso y seguros gracias por confiar en VivaSky.",
      image:
        "https://i.pinimg.com/1200x/54/10/f3/5410f352ff3215f1570861a4729efb71.jpg",
      date: "2025-09-10",
      type: "news",
      category: "basic",
      fullDescription:
        "La ruta Bogotá-Buenos Aires se ha consolidado como la más popular de nuestra red, con más de 50,000 pasajeros transportados en el último trimestre. Ofrecemos vuelos diarios con los mejores horarios y comodidades exclusivas para esta ruta.",
    },
  ]);

  // 🔥 CONTENIDO PREMIUM - SOLO PARA SUSCRIPTORES
  const [premiumNews] = useState([
    {
      id: 101,
      title: "🔥 PROMOCIÓN EXCLUSIVA: 50% de descuento en vuelos a Madrid",
      content:
        "Aprovecha nuestra promoción de temporada EXCLUSIVA para suscriptores. Válido hasta el 30 de diciembre 2025. Código: VIVASKY50",
      image:
        "https://i.pinimg.com/1200x/2c/b8/a9/2cb8a9190321ee91cdf63cca2d45668f.jpg",
      date: "2025-12-30",
      type: "promotion",
      category: "premium",
      discountCode: "VIVASKY50",
      fullDescription:
        "¡Oferta exclusiva para suscriptores Premium! Disfruta del 50% de descuento en todos nuestros vuelos a Madrid. Incluye: equipaje de mano, selección de asiento y servicio de comida a bordo. Válido para viajes hasta el 30 de diciembre 2025.",
      terms:
        "Aplican términos y condiciones. No acumulable con otras promociones.",
    },
    {
      id: 102,
      title: "💎 OFERTA RELÁMPAGO: Miami desde Medellín a $650,000 COP",
      content:
        "Solo este fin de semana, precios INCREÍBLES exclusivos para suscriptores. Incluye maleta documentada gratis.",
      image:
        "https://i.pinimg.com/736x/59/36/24/59362492e00b42138c6af00da2ac4b5a.jpg",
      date: "2025-11-28",
      type: "promotion",
      category: "premium",
      discountCode: "MIAMI650",
      fullDescription:
        "Oferta relámpago: Vuelos directos desde Medellín a Miami por solo $650,000 COP. Incluye maleta documentada de 23kg, equipaje de mano y todos los impuestos. Precio final, sin cargos ocultos.",
      terms: "Válido solo para reservas realizadas este fin de semana.",
    },
    {
      id: 103,
      title: "⚡ VUELOS FLASH: Descuentos de última hora",
      content:
        "Accede a nuestra sección de vuelos flash con descuentos hasta 70%. Solo visible para suscriptores.",
      image:
        "https://i.pinimg.com/1200x/78/9a/95/789a95b4c4c5d6e7f8g9h0i1j2k3l4m.jpg",
      date: "2025-01-20",
      type: "promotion",
      category: "premium",
      discountCode: "FLASH70",
      fullDescription:
        "Descuentos de última hora en vuelos nacionales e internacionales. Ahorra hasta 70% en rutas seleccionadas. Perfecto para viajeros espontáneos.",
      terms:
        "Sujeto a disponibilidad. Los precios pueden cambiar sin previo aviso.",
    },
  ]);

  // 🔥 BENEFICIOS DE SUSCRIPCIÓN
  const [subscriptionBenefits] = useState([
    {
      id: 1,
      icon: "🎫",
      title: "Ofertas Exclusivas",
      description: "Descuentos especiales solo para suscriptores",
    },
    {
      id: 2,
      icon: "⚡",
      title: "Acceso Prioritario",
      description: "Primeros en conocer nuevas rutas y promociones",
    },
    {
      id: 3,
      icon: "💰",
      title: "Códigos de Descuento",
      description: "Códigos exclusivos para aplicar en tus reservas",
    },
    {
      id: 4,
      icon: "📧",
      title: "Alertas Personalizadas",
      description: "Notificaciones de ofertas según tus preferencias",
    },
    {
      id: 5,
      icon: "🎁",
      title: "Regalos Sorpresa",
      description: "Beneficios adicionales en fechas especiales",
    },
    {
      id: 6,
      icon: "👑",
      title: "Trato Preferencial",
      description: "Atención especial en nuestro centro de mensajes",
    },
  ]);

  // Publicidad de VivaSky (visible para todos)
  const [ads] = useState([
    {
      id: 1,
      title: "Programa Viajero",
      content: "Unete a este eqipo y junto a VivSky descubre el mundo.",
      image:
        "https://i.pinimg.com/1200x/60/3f/2a/603f2a0fccf78f5e11972c48530e7dc4.jpg",
      fullDescription:
        "Únete a nuestro Programa Viajero VivaSky y descubre el mundo con beneficios exclusivos. Acumula millas, accede a salas VIP y disfruta de prioridad en embarque. Convierte cada viaje en una experiencia única.",
      type: "ad",
    },
    {
      id: 2,
      title: "VIVE LA NAVIDAD CON VIVASKY",
      content:
        "El amor y la felicidad se completan con unas buenas vacaciones, VivaSky esta aqui para ofrecerlas.",
      image:
        "https://i.pinimg.com/1200x/66/3e/9b/663e9bd165e3b47d7d711deb82d09b0e.jpg",
      fullDescription:
        "Esta Navidad, regala experiencias inolvidables con VivaSky. Ofertas especiales en todos nuestros destinos, decoración navideña a bordo y menús especiales. Haz que esta temporada sea mágica volando con nosotros.",
      type: "ad",
    },
  ]);

  // Función para volver al inicio
  const handleBackToHome = () => {
    navigate("/");
  };

  // Función para hacer click en el logo
  const handleLogoClick = () => {
    navigate("/");
  };

  // 🔥 NUEVA FUNCIÓN PARA ABRIR MODAL DE ITEM
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  // 🔥 NUEVA FUNCIÓN PARA CERRAR MODAL DE ITEM
  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
  };

  // 🔥 NUEVA FUNCIÓN PARA COPIAR CÓDIGO EN MODAL
  const copyDiscountCodeModal = (code) => {
    navigator.clipboard.writeText(code);
    alert(
      `¡Código ${code} copiado al portapapeles! Úsalo en tu siguiente reserva.`
    );
  };

  // Verificar autenticación y suscripción al cargar
  useEffect(() => {
    checkAuth();
    checkSubscription();
  }, []);

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
          role: user.tipo_usuario || user.role || "cliente",
        });
        setIsAuthenticated(true);

        // ✅ SOLO VERIFICAMOS SUSCRIPCIÓN, NO DAMOS ACCESO AUTOMÁTICO A ADMINS
        return true;
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    return false;
  };

  const checkSubscription = () => {
    const subscription = localStorage.getItem("newsSubscription");
    if (subscription === "true") {
      setIsSubscribed(true);
    }
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      setShowSubscriptionModal(true);
      return;
    }

    if (userInfo.role === "cliente") {
      localStorage.setItem("newsSubscription", "true");
      setIsSubscribed(true);
      alert(
        "🎉 ¡Felicidades! Te has suscrito exitosamente a VivaSky Premium.\n\nAhora tienes acceso a:\n• Ofertas exclusivas\n• Códigos de descuento\n• Alertas personalizadas\n• Contenido premium"
      );
    } else {
      alert(
        "❌ Solo los usuarios tipo 'cliente' pueden suscribirse al contenido premium."
      );
    }
  };

  const handleUnsubscribe = () => {
    localStorage.setItem("newsSubscription", "false");
    setIsSubscribed(false);
    alert(
      "Te has desuscrito de VivaSky Premium. Ya no tendrás acceso a contenido exclusivo."
    );
  };

  const handleGoToLogin = () => {
    setShowSubscriptionModal(false);
    navigate("/login");
  };

  const handleGoToRegister = () => {
    setShowSubscriptionModal(false);
    navigate("/register");
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message,
        timestamp: new Date().toLocaleTimeString(),
        user: userInfo?.nombre || "Usuario",
      };

      setMessages([...messages, newMessage]);
      setMessage("");

      // Simular respuesta automática
      setTimeout(() => {
        const autoReply = {
          id: Date.now() + 1,
          text: "Gracias por tu mensaje. Un agente de VivaSky te responderá pronto.",
          timestamp: new Date().toLocaleTimeString(),
          user: "Soporte VivaSky",
        };
        setMessages((prev) => [...prev, autoReply]);
      }, 2000);
    }
  };

  const canSubscribe = () => {
    return isAuthenticated && userInfo?.role === "cliente" && !isSubscribed;
  };

  const canSeePremiumContent = () => {
    return isAuthenticated && userInfo?.role === "cliente" && isSubscribed;
  };

  const copyDiscountCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(
      `¡Código ${code} copiado al portapapeles! Úsalo en tu siguiente reserva.`
    );
  };

  return (
    <div className="news-container">
      {/* 🔥 NUEVO HEADER CON LOGO Y BOTÓN VOLVER */}
      <header className="news-top-header">
        <div className="news-header-left">
          <div
            className="news-logo-container"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          >
            <img src={logoUrl} alt="VivaSky Logo" className="news-logo-image" />
            <span className="news-logo-text">VivaSky</span>
          </div>
        </div>

        <div className="news-header-right">
          <button className="back-home-btn" onClick={handleBackToHome}>
            ← Volver al Inicio
          </button>
        </div>
      </header>

      {/* Header principal de noticias */}
      <header className="news-header">
        <h1>Noticias y Promociones VivaSky</h1>
        <p>Mantente informado sobre nuestras mejores ofertas y novedades</p>

        {/* Estado de suscripción */}
        <div className="subscription-status">
          {isAuthenticated && userInfo?.role === "cliente" && (
            <>
              {isSubscribed ? (
                <div className="premium-badge">
                  👑 CLIENTE PREMIUM - Acceso a contenido exclusivo
                </div>
              ) : (
                <div className="basic-badge">
                  🔓 CLIENTE BÁSICO - Suscríbete para acceder a ofertas
                  exclusivas
                </div>
              )}
            </>
          )}

          {isAuthenticated &&
            (userInfo?.role === "administrador" ||
              userInfo?.role === "root") && (
              <div className="admin-badge">
                ⚙️ MODO ADMINISTRADOR - Acceso limitado al contenido básico
              </div>
            )}

          {!isAuthenticated && (
            <div className="guest-badge">
              👤 Usuario Invitado - Inicia sesión como cliente para suscribirte
            </div>
          )}
        </div>

        {/* Botón de suscripción */}
        {canSubscribe() && (
          <button className="subscribe-btn" onClick={handleSubscribe}>
            🎁 Suscribirse a VivaSky Premium
          </button>
        )}

        {isSubscribed && userInfo?.role === "cliente" && (
          <button className="unsubscribe-btn" onClick={handleUnsubscribe}>
            🚫 Desuscribirse
          </button>
        )}
      </header>

      {/* 🔥 SECCIÓN DE BENEFICIOS DE SUSCRIPCIÓN */}
      {!isSubscribed && userInfo?.role === "cliente" && (
        <section className="benefits-section">
          <h2>🎯 ¿Por qué suscribirte a VivaSky Premium?</h2>
          <div className="benefits-grid">
            {subscriptionBenefits.map((benefit) => (
              <div key={benefit.id} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
          <div className="benefits-cta">
            <button className="subscribe-large-btn" onClick={handleSubscribe}>
              🚀 Suscribirme Ahora - Es Gratis
            </button>
            <p className="benefits-note">
              Cancelas cuando quieras • Sin costos adicionales
            </p>
          </div>
        </section>
      )}

      {/* Contenido principal */}
      <div className="news-content">
        {/* 🔥 SECCIÓN BÁSICA - CON CLICK PARA MODAL */}
        <section className="news-section">
          <h2>📰 Noticias y Anuncios Generales</h2>
          <div className="news-grid">
            {basicNews.map((item) => (
              <div
                key={item.id}
                className={`news-card ${item.type}`}
                onClick={() => handleItemClick(item)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="news-image"
                  style={{ backgroundImage: `url(${item.image})` }}
                ></div>
                <div className="news-content">
                  <span className={`news-badge ${item.type}`}>
                    {item.type === "promotion" ? "🔥 Promoción" : "📰 Noticia"}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                  <span className="news-date">{item.date}</span>
                  <div className="click-hint">👉 Haz clic para ver más</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🔥 SECCIÓN PREMIUM - CON CLICK PARA MODAL */}
        <section className="news-section">
          <div className="premium-section-header">
            <h2>💎 Contenido Premium Exclusivo</h2>
            {!canSeePremiumContent() && (
              <div className="premium-lock">
                {!isAuthenticated
                  ? "🔒 Inicia sesión como cliente y suscríbete para desbloquear"
                  : userInfo?.role !== "cliente"
                  ? "🔒 Solo disponible para usuarios tipo 'cliente'"
                  : "🔒 Suscríbete para desbloquear contenido premium"}
              </div>
            )}
          </div>

          {canSeePremiumContent() ? (
            <div className="premium-news-grid">
              {premiumNews.map((item) => (
                <div
                  key={item.id}
                  className={`news-card premium ${item.type}`}
                  onClick={() => handleItemClick(item)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="news-image"
                    style={{ backgroundImage: `url(${item.image})` }}
                  ></div>
                  <div className="news-content">
                    <span className={`news-badge premium-badge`}>
                      👑 EXCLUSIVO
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                    {item.discountCode && (
                      <div className="discount-code">
                        <strong>Código: </strong>
                        <span
                          className="code-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyDiscountCode(item.discountCode);
                          }}
                        >
                          {item.discountCode}
                        </span>
                        <small>(Haz clic para copiar)</small>
                      </div>
                    )}
                    <span className="news-date premium-date">{item.date}</span>
                    <div className="click-hint">👉 Haz clic para ver más</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="premium-teaser">
              <div className="teaser-content">
                <h3>🚀 Desbloquea Ofertas Exclusivas</h3>
                <p>
                  {!isAuthenticated
                    ? "Inicia sesión como cliente y suscríbete para acceder a promociones especiales, códigos de descuento y contenido premium."
                    : userInfo?.role !== "cliente"
                    ? "El contenido premium está disponible exclusivamente para usuarios tipo 'cliente'."
                    : "Suscríbete gratis para acceder a promociones especiales, códigos de descuento y contenido premium."}
                </p>
                {isAuthenticated &&
                  userInfo?.role === "cliente" &&
                  !isSubscribed && (
                    <button
                      className="teaser-subscribe-btn"
                      onClick={handleSubscribe}
                    >
                      Desbloquear Contenido Premium
                    </button>
                  )}
                {!isAuthenticated && (
                  <button
                    className="teaser-subscribe-btn"
                    onClick={() => setShowSubscriptionModal(true)}
                  >
                    Iniciar Sesión
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Sección de Publicidad - TAMBIÉN CON MODAL */}
        <section className="ads-section">
          <h2>📢 Publicidad VivaSky</h2>
          <div className="ads-grid">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="ad-card"
                onClick={() => handleItemClick(ad)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="ad-image"
                  style={{ backgroundImage: `url(${ad.image})` }}
                ></div>
                <div className="ad-content">
                  <h3>{ad.title}</h3>
                  <p>{ad.content}</p>
                  <div className="click-hint">👉 Haz clic para ver más</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Botón de Mensajería */}
        <div className="messaging-section">
          <button
            className="messaging-btn"
            onClick={() => setShowMessageModal(true)}
          >
            💬 ¿Necesitas ayuda? Chatea con nosotros
          </button>
        </div>
      </div>

      {/* 🔥 🔥 🔥 NUEVO MODAL PARA VISUALIZAR ITEMS COMPLETOS */}
      {showItemModal && selectedItem && (
        <div className="modal-overlay" onClick={handleCloseItemModal}>
          <div className="item-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseItemModal}>
              ×
            </button>

            <div className="item-modal-content">
              <div
                className="item-modal-image"
                style={{ backgroundImage: `url(${selectedItem.image})` }}
              ></div>

              <div className="item-modal-details">
                <div className="item-modal-header">
                  <span
                    className={`item-modal-badge ${
                      selectedItem.category === "premium"
                        ? "premium-badge"
                        : selectedItem.type === "promotion"
                        ? "promotion-badge"
                        : selectedItem.type === "ad"
                        ? "ad-badge"
                        : "news-badge"
                    }`}
                  >
                    {selectedItem.category === "premium"
                      ? "👑 EXCLUSIVO"
                      : selectedItem.type === "promotion"
                      ? "🔥 Promoción"
                      : selectedItem.type === "ad"
                      ? "📢 Publicidad"
                      : "📰 Noticia"}
                  </span>
                  <h2>{selectedItem.title}</h2>
                  <span className="item-modal-date">{selectedItem.date}</span>
                </div>

                <div className="item-modal-body">
                  <p className="item-modal-description">
                    {selectedItem.fullDescription || selectedItem.content}
                  </p>

                  {selectedItem.discountCode && (
                    <div className="item-modal-discount">
                      <h3>🎁 Código de Descuento Exclusivo</h3>
                      <div className="discount-code-modal">
                        <span className="discount-code-text">
                          {selectedItem.discountCode}
                        </span>
                        <button
                          className="copy-code-btn-modal"
                          onClick={() =>
                            copyDiscountCodeModal(selectedItem.discountCode)
                          }
                        >
                          📋 Copiar
                        </button>
                      </div>
                      <p className="discount-instructions">
                        Usa este código al momento de hacer tu reserva en
                        nuestra página web
                      </p>
                    </div>
                  )}

                  {selectedItem.terms && (
                    <div className="item-modal-terms">
                      <h4>📋 Términos y Condiciones</h4>
                      <p>{selectedItem.terms}</p>
                    </div>
                  )}

                  {selectedItem.type === "ad" && (
                    <div className="item-modal-cta">
                      <button className="cta-button">🚀 Conocer Más</button>
                    </div>
                  )}
                </div>

                <div className="item-modal-footer">
                  <button
                    className="close-modal-btn"
                    onClick={handleCloseItemModal}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Suscripción */}
      {showSubscriptionModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSubscriptionModal(false)}
        >
          <div
            className="subscription-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowSubscriptionModal(false)}
            >
              ×
            </button>
            <div className="modal-content">
              <h2>🎁 Suscribirse a VivaSky Premium</h2>
              <p className="premium-features">
                Al suscribirte obtendrás acceso inmediato a:
              </p>
              <ul className="features-list">
                <li>✅ Ofertas exclusivas y descuentos especiales</li>
                <li>✅ Códigos de descuento para tus reservas</li>
                <li>✅ Alertas personalizadas de promociones</li>
                <li>✅ Acceso prioritario a nuevas rutas</li>
                <li>✅ Contenido premium y regalos sorpresa</li>
              </ul>

              <p className="subscription-note">
                <strong>¡Es completamente gratis!</strong> Puedes cancelar
                cuando quieras.
              </p>

              <div className="subscription-options">
                <button
                  className="subscription-option-btn primary"
                  onClick={handleGoToLogin}
                >
                  Iniciar Sesión y Suscribirme
                </button>

                <div className="subscription-divider">
                  <span>o</span>
                </div>

                <button
                  className="subscription-option-btn secondary"
                  onClick={handleGoToRegister}
                >
                  Crear Cuenta y Suscribirme
                </button>
              </div>

              <button
                className="subscription-cancel-btn"
                onClick={() => setShowSubscriptionModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mensajería */}
      {showMessageModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowMessageModal(false)}
        >
          <div className="message-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowMessageModal(false)}
            >
              ×
            </button>
            <div className="modal-content">
              <h2>Centro de Mensajes VivaSky</h2>

              <div className="messages-container">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${
                      msg.user === "Soporte VivaSky" ? "support" : "user"
                    }`}
                  >
                    <div className="message-header">
                      <strong>{msg.user}</strong>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                    <div className="message-text">{msg.text}</div>
                  </div>
                ))}
              </div>

              <div className="message-input-container">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="message-input"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  className="send-message-btn"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
