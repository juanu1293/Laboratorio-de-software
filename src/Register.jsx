import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

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
  const [countries, setCountries] = useState([]); // 👈 ahora dinámico
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

      setError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);   // 👈 ahora se guarda en base64
        setPhotoPreview(reader.result);   // 👈 también la previsualización
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview("");
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/location/paises");
        const data = await res.json();
        setCountries(data); // [{id:1, nombre:"Colombia"}, ...]
      } catch (err) {
        console.error("Error al cargar países:", err);
      }
    };
    fetchCountries();
  }, []);

  const handleCountryChange = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      country: value,
      department: "",
      city: "",
    }));

    if (value) {
      try {
        const res = await fetch(
          `http://localhost:5000/api/location/departamentos/${value}`
        );
        const data = await res.json();
        setAvailableDepartments(data); // [{id:10, nombre:"Antioquia"}, ...]
        setAvailableCities([]);
      } catch (err) {
        console.error("Error al cargar departamentos:", err);
      }
    }
  };

  // 🔹 Cuando cambie el departamento, cargar ciudades
  const handleDepartmentChange = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      department: value,
      city: "",
    }));

    if (value) {
      try {
        const res = await fetch(
          `http://localhost:5000/api/location/ciudades/${value}`
        );
        const data = await res.json();
        setAvailableCities(data); // [{id:100, nombre:"Medellín"}, ...]
      } catch (err) {
        console.error("Error al cargar ciudades:", err);
      }
    }
  };

  // 🔹 Actualizar handleChange normal
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    // Lista de campos obligatorios de texto
    const requiredFields = [
      "document",
      "firstName",
      "lastName",
      "birthDate",
      "gender",
      "country",
      "department",
      "city",
      "billingAddress",
      "phone",
      "email",
      "password",
      "confirmPassword",
    ];

      f// Validar campos vacíos o solo espacios
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        setError("Por favor completa todos los campos obligatorios.");
        return false;
      }
    }

     // Validar nombres y apellidos (solo letras, tildes y espacios)
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
      setError("Los nombres y apellidos solo pueden contener letras y espacios.");
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

    // Validar teléfono (solo números, mínimo 7 dígitos)
    if (!/^\d{7,15}$/.test(formData.phone)) {
      setError("El teléfono debe tener entre 7 y 15 números.");
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
        telefono: formData.phone,
        correo: formData.email,
        contrasena: formData.password,
        foto: profilePhoto || null, // 👈 foto en base64 (igual que EditProfile)
      };

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el registro");
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
                      onChange={handleCountryChange}
                      disabled={isLoading}
                      className={
                        error && !formData.country ? "input-error" : ""
                      }
                    >
                      <option value="">Selecciona un país</option>
                      {countries.map((pais) => (
                        <option key={pais.idpais} value={pais.idpais}>
                          {pais.nombre}
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
                      onChange={handleDepartmentChange}
                      disabled={isLoading || !formData.country}
                      className={
                        error && !formData.department ? "input-error" : ""
                      }
                    >
                      <option value="">Selecciona un departamento</option>
                      {availableDepartments.map((dept) => (
                        <option
                          key={dept.iddepartamento}
                          value={dept.iddepartamento}
                        >
                          {dept.nombre}
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
                        <option key={city.idciudad} value={city.idciudad}>
                          {city.nombre}
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
              <label
                className="checkbox-container"
                style={{ whiteSpace: "nowrap" }}
              >
                <input
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                <span style={{ marginLeft: "8px" }}>
                  Acepto los{" "}
                  <span style={{ color: "#023e8a", fontWeight: "500" }}>
                    términos y condiciones
                  </span>{" "}
                  y la{" "}
                  <span style={{ color: "#023e8a", fontWeight: "500" }}>
                    política de privacidad
                  </span>
                </span>
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
