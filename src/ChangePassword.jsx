import React, { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "./App.css";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Obtener email desde state o token desde query params
  const email = location.state?.email || "";
  const token = searchParams.get("token") || "";

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    // Validaciones
    if (!password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      // Llamada real al backend para cambiar contraseña
      const resetData = { password };

      // Si tenemos token, lo usamos (flujo estándar)
      if (token) {
        resetData.token = token;
      }
      // Si no hay token pero sí email, usamos email (flujo alternativo)
      else if (email) {
        resetData.email = email;
      }
      // Si no hay ninguno, error
      else {
        throw new Error("Datos de restablecimiento inválidos");
      }

      const response = await fetch("http://tu-backend.com/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resetData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al cambiar la contraseña");
      }

      // Éxito
      setMessage("Contraseña cambiada exitosamente. Redirigiendo al login...");

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión.",
          },
        });
      }, 2000);
    } catch (err) {
      setError(err.message || "Error en el servidor. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  const handleBackToForgotPassword = () => {
    navigate("/forgot-password");
  };

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
        <button className="back-btn" onClick={handleBackToForgotPassword}>
          Volver atrás
        </button>
      </header>

      <section className="login-section">
        <div className="login-container">
          <h2>Cambiar contraseña</h2>
          <p className="login-subtitle">
            {email ? `Para: ${email}` : "Ingresa tu nueva contraseña"}
          </p>

          {error && <div className="error-message">⚠️ {error}</div>}
          {message && <div className="success-message">✅ {message}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="password">Nueva contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
                disabled={isLoading}
                className={error && !password ? "input-error" : ""}
              />
              <small className="password-hint">Mínimo 6 caracteres</small>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu nueva contraseña"
                disabled={isLoading}
                className={error && !confirmPassword ? "input-error" : ""}
              />
            </div>

            <button
              type="submit"
              className={`login-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Cambiando contraseña...
                </>
              ) : (
                "Cambiar contraseña"
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ChangePassword;
