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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (action) => {
    setIsOpen(false);

    // Definir las acciones para cada item del menú
    const actions = {
      // Root
      "create-admin": () => alert("Funcionalidad: Crear Administrador"),
      "delete-admin": () => alert("Funcionalidad: Eliminar Administrador"),

      // Administrador y Usuario - REDIRIGE A PÁGINA DE EDICIÓN
      "edit-info": () => navigate("/edit-profile"),

      // Administrador
      "manage-flights": () => alert("Funcionalidad: Gestionar Vuelos"),
      "cancel-tickets": () => alert("Funcionalidad: Cancelar Tiquetes"),
      "manage-news": () => alert("Funcionalidad: Gestionar Noticias"),
      messaging: () => alert("Funcionalidad: Mensajería"),
      history: () => alert("Funcionalidad: Historial"),

      // Usuario
      "check-in": () => alert("Funcionalidad: Check-in"),
      "balance-payments": () => alert("Funcionalidad: Saldo y Pagos"),
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
      Root: [
        { id: "create-admin", label: "Crear Administrador", icon: "👨‍💼" },
        { id: "delete-admin", label: "Eliminar Administrador", icon: "❌" },
      ],
      Administrador: [
        { id: "edit-info", label: "Editar Información", icon: "✏️" },
        { id: "manage-flights", label: "Gestionar Vuelos", icon: "✈️" },
        { id: "cancel-tickets", label: "Cancelar Tiquetes", icon: "🎫" },
        { id: "manage-news", label: "Gestionar Noticias", icon: "📰" },
      ],
      Usuario: [
        { id: "edit-info", label: "Editar Información", icon: "✏️" },
        { id: "cancel-tickets", label: "Cancelar Tiquete", icon: "🎫" },
        { id: "check-in", label: "Check-in", icon: "✅" },
        { id: "balance-payments", label: "Saldo y Pagos", icon: "💰" },
      ],
    };

    return [
      ...(roleSpecificItems[userInfo.role] || []),
      { type: "divider" },
      ...commonItems,
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button className="user-menu-trigger" onClick={toggleMenu}>
        <span className="user-welcome">Bienvenido, {userInfo.nombre}</span>
        <span className="user-role">({userInfo.role})</span>
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
            <div className="menu-section-title">
              Funciones de {userInfo.role}
            </div>

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
                </button>
              );
            })}

            <div className="menu-divider" />
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
