import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserMenu = ({ userInfo, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Función para contar items del carrito
  const getCartItemCount = () => {
    const cart = JSON.parse(localStorage.getItem("vivasky_cart") || "[]");
    return cart.length;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (action) => {
    setIsOpen(false);

    // Acciones para cada item del menú
    const actions = {
      // Root
      "create-admin": () => navigate("/create-admin"),

      // Administrador y Usuario
      "edit-info": () => navigate("/edit-profile"),
      "change-password": () => navigate("/change-password"),

      // Administrador
      "manage-flights": () => navigate("/manage-flights"),
      "cancel-tickets": () => navigate("/cancel-tickets"),
      "manage-news": () => navigate("/manage-news"),
      "control-panel": () => navigate("/control-panel"),
      messaging: () => navigate("/messaging"),
      history: () => navigate("/history"),

      // Usuario
      "check-in": () => navigate("/check-in"),
      "balance-payments": () => navigate("/balance-payments"),

      // Carrito (nuevo)
      cart: () => navigate("/cart"),
    };

    if (actions[action]) {
      actions[action]();
    }
  };

  // Definir items del menú según el rol
  const getMenuItems = () => {
    const commonItems = [
      { id: "messaging", label: "Mensajería", icon: "💬" },
      { id: "history", label: "Historial", icon: "📊" },
    ];

    const roleSpecificItems = {
      root: [
        { id: "create-admin", label: "Crear Administrador", icon: "👨‍💼" },
        { id: "control-panel", label: "Panel de Control", icon: "⚙️" },
        { id: "manage-flights", label: "Gestionar Vuelos", icon: "✈️" },
      ],
      administrador: [
        { id: "edit-info", label: "Editar Perfil", icon: "✏️" },
        { id: "change-password", label: "Cambiar Contraseña", icon: "🔒" },
        { id: "control-panel", label: "Panel de Control", icon: "⚙️" },
        { id: "manage-flights", label: "Gestionar Vuelos", icon: "✈️" },
        { id: "cancel-tickets", label: "Cancelar Tiquetes", icon: "🎫" },
        { id: "manage-news", label: "Gestionar Noticias", icon: "📰" },
      ],
      cliente: [
        { id: "edit-info", label: "Editar Información", icon: "✏️" },
        { id: "change-password", label: "Cambiar Contraseña", icon: "🔒" },
        { id: "cancel-tickets", label: "Cancelar Tiquete", icon: "🎫" },
        { id: "check-in", label: "Check-in", icon: "✅" },
        { id: "balance-payments", label: "Saldo y Pagos", icon: "💰" },
      ],
    };

    const specificItems = roleSpecificItems[userInfo.role] || [];

    // Agregar opción de carrito SOLO para clientes
    if (userInfo.role === "cliente") {
      specificItems.push({
        id: "cart",
        label: "Carrito de Compras",
        icon: "🛒",
      });
    }

    // Solo agregar divider si hay items específicos Y comunes
    if (specificItems.length > 0 && commonItems.length > 0) {
      return [
        ...specificItems,
        { type: "divider" },
        ...commonItems,
        { type: "divider" },
      ];
    }

    // Si solo hay items específicos
    if (specificItems.length > 0) {
      return [...specificItems, { type: "divider" }];
    }

    // Si solo hay items comunes
    if (commonItems.length > 0) {
      return [...commonItems, { type: "divider" }];
    }

    return [];
  };

  const menuItems = getMenuItems();
  const cartItemCount = getCartItemCount();

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button className="user-menu-trigger" onClick={toggleMenu}>
        <span className="user-welcome">Hola, {userInfo.nombre}</span>
        <span className="user-role">({userInfo.role})</span>
        {/* Mostrar badge del carrito si es cliente y tiene items */}
        {userInfo.role === "cliente" && cartItemCount > 0 && (
          <span className="cart-badge-header">{cartItemCount}</span>
        )}
        <span style={{ fontSize: "12px" }}>▼</span>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <div style={{ fontWeight: "600" }}>{userInfo.nombre}</div>
            <div className="user-menu-email">{userInfo.correo}</div>
            <div
              style={{ fontSize: "12px", color: "#1a237e", marginTop: "5px" }}
            >
              Rol: {userInfo.role}
            </div>
          </div>

          <div className="user-menu-items">
            <div className="menu-section-title">MI CUENTA</div>

            {menuItems.map((item, index) => {
              if (item.type === "divider") {
                return (
                  <div key={`divider-${index}`} className="menu-divider" />
                );
              }

              return (
                <button
                  key={item.id}
                  className="menu-item"
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {/* Mostrar badge solo para el carrito y si hay items */}
                  {item.id === "cart" && cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </button>
              );
            })}

            <button className="menu-item logout" onClick={onLogout}>
              <span className="menu-icon">🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
