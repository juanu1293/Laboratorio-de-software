import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => navigate("/");

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setError("");
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor ingresa un email válido");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });

      const data = await response.json();

      if (response.ok) {
        const storeData = () => {
          if (rememberMe) {
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("userData", JSON.stringify(data.usuario));
            localStorage.setItem("userEmail", data.usuario.correo);
          } else {
            sessionStorage.setItem("authToken", data.token);
            sessionStorage.setItem("userData", JSON.stringify(data.usuario));
          }
        };

        storeData();

        if (data.usuario.tipo_usuario === "administrador" && !data.usuario.info_completada) {
          navigate("/complete-admin-info", {
            state: {
              message: "Por favor completa tu información para continuar",
              userName: data.usuario.nombre,
              userRole: data.usuario.tipo_usuario,
            },
          });
        } else {
          navigate("/", {
            state: {
              message: `¡Bienvenido ${data.usuario.nombre}!`,
              userName: data.usuario.nombre,
              userRole: data.usuario.tipo_usuario,
            },
          });
        }
      } else {
        if (response.status === 401) {
          setError("Credenciales incorrectas. Verifica tu email y contraseña.");
        } else if (response.status === 403) {
          setError("Tu cuenta está desactivada. Contacta al soporte.");
        } else if (response.status === 404) {
          setError("No existe una cuenta con este email.");
        } else {
          setError(data.message || "Error al iniciar sesión. Intenta nuevamente.");
        }
      }
    } catch (err) {
      setError("Error de conexión con el servidor. Verifica tu conexión e intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => navigate("/");
  const handleCreateAccount = () => navigate("/register");
  const handleForgotPassword = () => navigate("/forgot-password");

  return (
    <div className="app">
      <header className="header">
        <div className="logo-container" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
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
          <h2>Iniciar sesión</h2>
          <p className="login-subtitle">Accede a tu cuenta para gestionar tus reservas</p>

          {error && <div className="error-message">⚠️ {error}</div>}
          {successMessage && <div className="success-message">✅ {successMessage}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.email@ejemplo.com"
                disabled={isLoading}
                className={error && !email ? "input-error" : ""}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                disabled={isLoading}
                className={error && !password ? "input-error" : ""}
              />
            </div>

            <div className="login-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Recordar mi cuenta
              </label>

              <a href="#forgot-password" onClick={handleForgotPassword} className="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className={`login-btn ${isLoading ? "loading" : ""}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>¿No tienes cuenta con VivaSky? ¡Regístrate ahora!</span>
          </div>

          <button className="create-account-btn" onClick={handleCreateAccount} disabled={isLoading}>
            Registrar usuario
          </button>
        </div>
      </section>
    </div>
  );
};

export default Login;
