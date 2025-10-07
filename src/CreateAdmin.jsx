import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBackToHome = () => {
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
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      (typeof formData.email === "string" && formData.email.trim() === "") ||
      (typeof formData.password === "string" && formData.password.trim() === "") ||
      (typeof formData.confirmPassword === "string" && formData.confirmPassword.trim() === "")
    ) {
      setError("Por favor completa todos los campos sin solo espacios");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Por favor ingresa un email válido");
      return false;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
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
      // Obtener el token de autenticación del usuario root
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/create-admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            correo: formData.email,
            contrasena: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear administrador");
      }

      setSuccessMessage("Administrador creado exitosamente");

      // Limpiar formulario después de éxito
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Error en el servidor. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
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
        <button className="back-btn" onClick={handleBackToHome}>
          Volver al inicio
        </button>
      </header>

      <section className="login-section">
        <div className="login-container">
          <h2>Crear Administrador</h2>
          <p className="login-subtitle">
            Complete los datos para crear un nuevo administrador
          </p>

          {error && <div className="error-message">⚠️ {error}</div>}
          {successMessage && (
            <div className="success-message">✅ {successMessage}</div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Correo electrónico *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@vivasky.com"
                disabled={isLoading}
                className={error && !formData.email ? "input-error" : ""}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña para el administrador"
                disabled={isLoading}
                className={error && !formData.password ? "input-error" : ""}
              />
              <small className="password-hint">Mínimo 6 caracteres</small>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmar contraseña *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirma la contraseña"
                disabled={isLoading}
                className={
                  error && !formData.confirmPassword ? "input-error" : ""
                }
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
                  Creando administrador...
                </>
              ) : (
                "Crear Administrador"
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CreateAdmin;
