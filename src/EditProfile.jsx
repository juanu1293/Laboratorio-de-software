import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const EditProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const userData =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setUserInfo(user);

      // Inicializar formData según el rol
      if (user.tipo_usuario === "Administrador") {
        setFormData({
          documento: user.cedula || "",
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          telefono: user.phone || "",
          email: user.correo || "",
        });
      } else {
        // Usuario - más campos
        setFormData({
          documento: user.cedula || "",
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          fecha_nacimiento: user.fecha_nacimiento || "",
          lugar_nacimiento: user.lugar_nacimiento || "",
          genero: user.genero || "",
          telefono: user.telefono || "",
          email: user.correo || "",
          direccion: user.direccion || "",
        });
      }

      // Cargar foto de perfil si existe
      if (user.foto) {
        setPhotoPreview(user.foto);
      }
    }
  }, []);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBackToHome = () => {
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Validar campos obligatorios y que no sean solo espacios
    if (
      !formData.documento ||
      !formData.nombre ||
      !formData.apellido ||
      !formData.telefono ||
      !formData.email ||
      !formData.direccion ||
      (typeof formData.documento === "string" && formData.documento.trim() === "") ||
      (typeof formData.nombre === "string" && formData.nombre.trim() === "") ||
      (typeof formData.apellido === "string" && formData.apellido.trim() === "") ||
      (typeof formData.telefono === "string" && formData.telefono.trim() === "") ||
      (typeof formData.email === "string" && formData.email.trim() === "") ||
      (typeof formData.direccion === "string" && formData.direccion.trim() === "")
    ) {
      setError("Por favor completa todos los campos obligatorios sin solo espacios");
      return false;
    }

    // Nombres y apellidos (solo letras, tildes y espacios)
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nameRegex.test(formData.nombre)) {
      setError("El nombre solo puede contener letras y espacios.");
      return false;
    }
    if (!nameRegex.test(formData.apellido)) {
      setError("El apellido solo puede contener letras y espacios.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Por favor ingresa un email válido");
      return false;
    }

    // Teléfono (solo números, entre 7 y 15 dígitos)
    if (!/^\d{7,15}$/.test(formData.telefono)) {
      setError("El teléfono debe tener entre 7 y 15 números.");
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
      const token =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      // Datos a enviar al backend
      const updatedData = {
        ...formData,
        lugar_nacimiento: userInfo.lugar_nacimiento || "",
        foto: photoPreview || null, // enviamos Base64 o null
      };

      console.log("👉 Datos enviados al backend:", updatedData);

      const response = await fetch("http://localhost:5000/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("👉 Error en la respuesta:", response.status, errorData);
        throw new Error(errorData.detalle || "Error en la petición");
      }

      const data = await response.json();
      console.log("👉 Respuesta del backend:", data);

      setSuccessMessage("Información actualizada exitosamente");

      // Actualizar datos en localStorage/sessionStorage
      const updatedUser = {
        ...userInfo,
        ...formData,
        lugar_nacimiento: userInfo.lugar_nacimiento || "",
        foto: photoPreview || userInfo.foto, // 👈 mantener consistencia
      };

      if (localStorage.getItem("userData")) {
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem("userData", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("❌ Error en handleSubmit:", err);
      setError("Error al actualizar la información. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };



  if (!userInfo) {
    return <div>Cargando...</div>;
  }

  const isAdmin = userInfo.tipo_usuario === "Administrador";

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
        <div className="edit-profile-container">
          <h2>Editar Información Personal</h2>
          <p className="login-subtitle">
            Actualiza tus datos de {isAdmin ? "administrador" : "usuario"}
          </p>

          {error && <div className="error-message">⚠️ {error}</div>}
          {successMessage && (
            <div className="success-message">✅ {successMessage}</div>
          )}

          <form className="edit-profile-form" onSubmit={handleSubmit}>
            <div className="form-columns-horizontal">
              {/* Columna izquierda - Foto y datos básicos */}
              <div className="form-column-left">
                <div className="photo-section">
                  <label className="photo-label">
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

                <div className="input-group">
                  <label htmlFor="documento">Documento de identidad *</label>
                  <input
                    id="documento"
                    name="documento"
                    type="text"
                    value={formData.documento || ""}
                    onChange={handleChange}
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
                      value={formData.nombre || ""}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="apellido">Apellidos *</label>
                    <input
                      id="apellido"
                      name="apellido"
                      type="text"
                      value={formData.apellido || ""}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Columna derecha - Información específica */}
              <div className="form-column-right">
                {!isAdmin && (
                  <>
                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="fecha_nacimiento">
                          Fecha de nacimiento
                        </label>
                        <input
                          id="fecha_nacimiento"
                          name="fecha_nacimiento"
                          type="date"
                          value={formData.fecha_nacimiento || ""}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="genero">Género</label>
                        <select
                          id="genero"
                          name="genero"
                          value={formData.genero || ""}
                          onChange={handleChange}
                          disabled={isLoading}
                        >
                          <option value="">Selecciona tu género</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="direccion">
                        Dirección de facturación
                      </label>
                      <input
                        id="direccion"
                        name="direccion"
                        type="text"
                        value={formData.direccion || ""}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}

                <div className="input-group">
                  <label htmlFor="telefono">Teléfono *</label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono || ""}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email">Correo electrónico *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleBackToHome}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`save-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
