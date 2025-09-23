import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

// Datos de ejemplo para seleccionar
const countries = [
  "Colombia",
  "Perú",
  "México",
  "Argentina",
  "Chile",
  "España",
];
const departments = {
  Colombia: [
    "Bogotá D.C.",
    "Antioquia",
    "Valle del Cauca",
    "Cundinamarca",
    "Atlántico",
  ],
  Perú: ["Lima", "Arequipa", "Cuzco", "Piura", "La Libertad"],
  México: ["Ciudad de México", "Jalisco", "Nuevo León", "Puebla", "Veracruz"],
  Argentina: ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán"],
  Chile: ["Santiago", "Valparaíso", "Biobío", "La Araucanía", "Los Lagos"],
  España: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga"],
};
const cities = {
  "Bogotá D.C.": ["Bogotá"],
  Antioquia: ["Medellín", "Envigado", "Bello", "Itagüí"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá"],
  Cundinamarca: ["Soacha", "Facatativá", "Girardot", "Fusagasugá"],
  Atlántico: ["Barranquilla", "Soledad", "Malambo", "Sabanalarga"],
  Lima: ["Lima", "Callao", "Miraflores", "Barranco"],
  Arequipa: ["Arequipa", "Camaná", "Mollendo", "Chivay"],
  Cuzco: ["Cuzco", "Machu Picchu", "Ollantaytambo", "Urubamba"],
  Piura: ["Piura", "Sullana", "Paita", "Catacaos"],
  "La Libertad": ["Trujillo", "Chepén", "Pacasmayo", "Guadalupe"],
  "Ciudad de México": ["Ciudad de México", "Coyoacán", "Tlalpan", "Xochimilco"],
  Jalisco: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá"],
  "Nuevo León": ["Monterrey", "San Nicolás", "Guadalupe", "Apodaca"],
  Puebla: ["Puebla", "Tehuacán", "San Martín", "Cholula"],
  Veracruz: ["Veracruz", "Xalapa", "Coatzacoalcos", "Orizaba"],
  "Buenos Aires": ["Buenos Aires", "La Plata", "Mar del Plata", "Quilmes"],
  Córdoba: ["Córdoba", "Villa María", "Río Cuarto", "Alta Gracia"],
  "Santa Fe": ["Rosario", "Santa Fe", "Rafaela", "Venado Tuerto"],
  Mendoza: ["Mendoza", "San Rafael", "Godoy Cruz", "Guaymallén"],
  Tucumán: ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo", "Aguilares"],
  Santiago: ["Santiago", "Puente Alto", "Maipú", "La Florida"],
  Valparaíso: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana"],
  Biobío: ["Concepción", "Talcahuano", "Chillán", "Los Ángeles"],
  "La Araucanía": ["Temuco", "Padre Las Casas", "Villarrica", "Angol"],
  "Los Lagos": ["Puerto Montt", "Osorno", "Puerto Varas", "Ancud"],
  Madrid: ["Madrid", "Alcalá de Henares", "Getafe", "Leganés"],
  Barcelona: ["Barcelona", "Hospitalet", "Badalona", "Sabadell"],
  Valencia: ["Valencia", "Torrent", "Gandía", "Paterna"],
  Sevilla: ["Sevilla", "Dos Hermanas", "Alcalá de Guadaíra", "Utrera"],
  Málaga: ["Málaga", "Marbella", "Vélez-Málaga", "Estepona"],
};

const Register = () => {
  const [formData, setFormData] = useState({
    document: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    country: "",
    department: "",
    city: "",
    billingAddress: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }

      setProfilePhoto(file);
      setError("");

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "country") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        department: "",
        city: "",
      }));
      setAvailableDepartments(departments[value] || []);
      setAvailableCities([]);
    } else if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        city: "",
      }));
      setAvailableCities(cities[value] || []);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const validateForm = () => {
    if (
      !formData.document ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.birthDate ||
      !formData.gender ||
      !formData.country ||
      !formData.department ||
      !formData.city ||
      !formData.billingAddress ||
      !formData.phone ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Por favor completa todos los campos obligatorios");
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

    if (!/^\d+$/.test(formData.phone)) {
      setError("El teléfono debe contener solo números");
      return false;
    }

    if (!formData.acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return false;
    }

    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    if (birthDate >= today) {
      setError("La fecha de nacimiento debe ser una fecha pasada");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        cedula: formData.document,
        nombre: formData.firstName,
        apellido: formData.lastName,
        fecha_nacimiento: formData.birthDate,
        genero:
          formData.gender === "male"
            ? "M"
            : formData.gender === "female"
            ? "F"
            : formData.gender === "other"
            ? "M"
            : "M",
        direccion_facturacion: formData.billingAddress,
        lugar_nacimiento: formData.city,
        phone: formData.phone,
        correo: formData.email,
        contrasena: formData.password,
      };

      if (profilePhoto) {
        const formDataToSend = new FormData();
        formDataToSend.append("profilePhoto", profilePhoto);
        formDataToSend.append("userData", JSON.stringify(userData));

        const response = await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",
            body: formDataToSend,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error en el registro");
        }
      } else {
        const response = await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error en el registro");
        }
      }

      localStorage.setItem("userEmail", formData.email);

      navigate("/login", {
        state: { message: "Registro exitoso. Ahora puedes iniciar sesión." },
      });
    } catch (err) {
      setError(err.message || "Error en el servidor. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const today = new Date().toISOString().split("T")[0];

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
        <div className="login-container horizontal-form">
          <h2>Registrese en VivaSky</h2>
          <p className="login-subtitle">
            Descubra un mundo nuevo, conozca distintos lugares y viva la
            experiencia VivaSky
          </p>

          {error && <div className="error-message">⚠️ {error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-columns">
              {/* Columna izquierda */}
              <div className="form-column">
                {/* Documento */}
                <div className="input-group">
                  <label htmlFor="document">Documento de identidad *</label>
                  <input
                    id="document"
                    name="document"
                    type="text"
                    value={formData.document}
                    onChange={handleChange}
                    placeholder="Número de documento"
                    disabled={isLoading}
                    className={error && !formData.document ? "input-error" : ""}
                  />
                </div>

                {/* Nombres y Apellidos en la misma fila */}
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="firstName">Nombres *</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Tus nombres"
                      disabled={isLoading}
                      className={
                        error && !formData.firstName ? "input-error" : ""
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="lastName">Apellidos *</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Tus apellidos"
                      disabled={isLoading}
                      className={
                        error && !formData.lastName ? "input-error" : ""
                      }
                    />
                  </div>
                </div>

                {/* Fecha de nacimiento y Género en la misma fila */}
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="birthDate">Fecha de nacimiento *</label>
                    <input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      max={today}
                      disabled={isLoading}
                      className={
                        error && !formData.birthDate ? "input-error" : ""
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="gender">Género *</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={error && !formData.gender ? "input-error" : ""}
                    >
                      <option value="">Selecciona tu género</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                      <option value="prefer_not_to_say">
                        Prefiero no decir
                      </option>
                    </select>
                  </div>
                </div>

                {/* País, Departamento y Ciudad en la MISMA línea */}
                <div className="input-row three-columns">
                  <div className="input-group">
                    <label htmlFor="country">País de nacimiento *</label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={
                        error && !formData.country ? "input-error" : ""
                      }
                    >
                      <option value="">Selecciona un país</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="department">
                      Departamento de nacimiento *
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={isLoading || !formData.country}
                      className={
                        error && !formData.department ? "input-error" : ""
                      }
                    >
                      <option value="">Selecciona un departamento</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="city">Ciudad de nacimiento *</label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isLoading || !formData.department}
                      className={error && !formData.city ? "input-error" : ""}
                    >
                      <option value="">Selecciona una ciudad</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dirección de facturación */}
                <div className="input-group">
                  <label htmlFor="billingAddress">
                    Dirección de facturación *
                  </label>
                  <input
                    id="billingAddress"
                    name="billingAddress"
                    type="text"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    placeholder="Ingresa tu dirección completa para facturación"
                    disabled={isLoading}
                    className={
                      error && !formData.billingAddress ? "input-error" : ""
                    }
                  />
                </div>

                {/* Teléfono */}
                <div className="input-group">
                  <label htmlFor="phone">Teléfono *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Número de teléfono"
                    disabled={isLoading}
                    className={error && !formData.phone ? "input-error" : ""}
                  />
                </div>
              </div>

              {/* Columna derecha */}
              <div className="form-column">
                {/* Correo electrónico */}
                <div className="input-group">
                  <label htmlFor="email">Correo electrónico *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu.email@ejemplo.com"
                    disabled={isLoading}
                    className={error && !formData.email ? "input-error" : ""}
                  />
                </div>

                {/* Contraseña y Confirmar contraseña en la misma fila */}
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="password">Contraseña *</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Crea una contraseña"
                      disabled={isLoading}
                      className={
                        error && !formData.password ? "input-error" : ""
                      }
                    />
                    <small className="password-hint">Mínimo 6 caracteres</small>
                  </div>

                  <div className="input-group">
                    <label htmlFor="confirmPassword">
                      Confirmar contraseña *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repite tu contraseña"
                      disabled={isLoading}
                      className={
                        error && !formData.confirmPassword ? "input-error" : ""
                      }
                    />
                  </div>
                </div>

                {/* Foto de perfil (opcional) */}
                <div className="input-group">
                  <label htmlFor="profilePhoto" className="photo-label">
                    Foto de perfil (opcional)
                  </label>
                  <div className="photo-upload-container">
                    {photoPreview ? (
                      <div className="photo-preview">
                        <img
                          src={photoPreview}
                          alt="Vista previa"
                          className="preview-image"
                        />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={handleRemovePhoto}
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="photo-upload-area">
                        <label htmlFor="profilePhoto" className="upload-label">
                          <span className="upload-icon">📷</span>
                          <span className="upload-text">Seleccionar foto</span>
                          <input
                            id="profilePhoto"
                            name="profilePhoto"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            disabled={isLoading}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <small className="photo-hint">
                    Formatos: JPG, PNG, GIF • Máx. 5MB
                  </small>
                </div>
              </div>
            </div>

            {/* Términos y condiciones - MODIFICADO: sin enlaces, solo texto azul */}
            <div className="input-group checkbox-group">
              <label className="checkbox-container">
                <input
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Acepto los{" "}
                <span className="terms-text-blue">
                  términos y condiciones
                </span>{" "}
                y la{" "}
                <span className="terms-text-blue">política de privacidad</span>
              </label>
            </div>

            <button
              type="submit"
              className={`login-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creando cuenta...
                </>
              ) : (
                "Registrarse"
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Register;

