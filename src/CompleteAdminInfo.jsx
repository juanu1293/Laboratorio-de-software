import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const CompleteAdminInfo = () => {
  const [formData, setFormData] = useState({
    documento: "",
    nombre: "",
    apellido: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();

  // Cargar información del usuario al iniciar
  // Cargar información del usuario desde el backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");

        if (!token) {
          throw new Error("No hay sesión activa");
        }

        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al cargar información");
        }

        setUserInfo(data);

        // Pre-cargar el correo
        if (data.correo) {
          setFormData((prev) => ({ ...prev, email: data.correo }));
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Validar información personal
    if (
      !formData.documento ||
      !formData.nombre ||
      !formData.apellido ||
      !formData.telefono
    ) {
      setError("Por favor completa toda tu información personal");
      return false;
    }

    // Validar que el documento solo contenga números
    if (!/^\d+$/.test(formData.documento)) {
      setError("El documento debe contener solo números");
      return false;
    }

    // Validar que el teléfono solo contenga números
    if (!/^\d+$/.test(formData.telefono)) {
      setError("El teléfono debe contener solo números");
      return false;
    }

    // Validar contraseñas (solo si se ingresaron)
    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Obtener el token de autenticación
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/complete-admin-info",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cedula: formData.documento,
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            contrasena: formData.password || null, // Solo enviar si se cambió
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al completar la información");
      }

      setSuccessMessage("Información completada exitosamente");

      // Actualizar datos locales del usuario
      if (userInfo) {
        const updatedUser = {
          ...userInfo,
          cedula: formData.documento,
          nombre: formData.nombre,
          apellido: formData.apellido,
          phone: formData.telefono,
          info_completada: true,
        };

        if (localStorage.getItem("userData")) {
          localStorage.setItem("userData", JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem("userData", JSON.stringify(updatedUser));
        }
      }

      // Redirigir al home después de 2 segundos
      setTimeout(() => {
        navigate("/", {
          state: {
            message: "Información completada exitosamente. ¡Bienvenido!",
            userName: formData.nombre,
            userRole: "administrador",
          },
        });
      }, 2000);
    } catch (err) {
      setError(err.message || "Error en el servidor. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userInfo) {
    return (
      <div className="app">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "18px",
          }}
        >
          Cargando...
        </div>
      </div>
    );
  }

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
        <div style={{ color: "#666", fontSize: "14px" }}>
          Completa tu información de administrador
        </div>
      </header>

      <section className="login-section">
        <div className="login-container" style={{ maxWidth: "600px" }}>
          <h2>Completar Información</h2>
          <p className="login-subtitle">
            Por favor completa tu información personal para continuar
          </p>

          {error && <div className="error-message">⚠️ {error}</div>}
          {successMessage && (
            <div className="success-message">✅ {successMessage}</div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Información Personal */}
            <div style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  color: "#023e8a",
                  marginBottom: "20px",
                  paddingBottom: "10px",
                  borderBottom: "2px solid #023e8a",
                }}
              >
                Información Personal
              </h3>

              <div className="input-group">
                <label htmlFor="documento">Documento de identidad *</label>
                <input
                  id="documento"
                  name="documento"
                  type="text"
                  value={formData.documento}
                  onChange={handleChange}
                  placeholder="Número de documento"
                  disabled={isLoading}
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="nombre">Nombres *</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tus nombres"
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="apellido">Apellidos *</label>
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Tus apellidos"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Número de teléfono"
                  disabled={isLoading}
                />
              </div>

              {userInfo.correo && (
                <div className="input-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    value={userInfo.correo}
                    disabled
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    El correo electrónico no se puede modificar
                  </small>
                </div>
              )}
            </div>

            {/* Cambiar Contraseña */}
            <div style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  color: "#023e8a",
                  marginBottom: "20px",
                  paddingBottom: "10px",
                  borderBottom: "2px solid #023e8a",
                }}
              >
                Cambiar Contraseña (Opcional)
              </h3>

              <div className="input-group">
                <label htmlFor="password">Nueva contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Deja en blanco para mantener la actual"
                  disabled={isLoading}
                />
                <small className="password-hint">Mínimo 6 caracteres</small>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma la nueva contraseña"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`login-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
              style={{ marginTop: "20px" }}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Guardando información...
                </>
              ) : (
                "Completar Información"
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CompleteAdminInfo;
