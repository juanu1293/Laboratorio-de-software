// src/apiService.js

const API_BASE_URL = "http://localhost:5000/api"; // Asegúrate que sea el puerto de tu backend

// Función para obtener el token (de localStorage o sessionStorage)
const getToken = () => {
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
};

/**
 * Realiza una solicitud fetch autenticada
 * @param {string} endpoint - El endpoint de la API (ej: "/cards")
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} [body] - El cuerpo de la solicitud para POST/PUT
 * @returns {Promise<object>} - La respuesta JSON del servidor
 */
const request = async (endpoint, method, body = null) => {
  const token = getToken();
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const config = {
    method: method,
    headers: headers,
  };

  if (body && (method === "POST" || method === "PUT")) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      // Si la respuesta no es OK, intenta leer el error
      const errorData = await response.json();
      throw new Error(errorData.error || "Error en la solicitud");
    }

    // Para peticiones que no devuelven contenido (ej: DELETE)
    if (response.status === 204) {
      return {};
    }

    return response.json();
  } catch (error) {
    console.error(`Error en la solicitud API (${method} ${endpoint}):`, error);
    throw error;
  }
};

// Exportamos métodos específicos para facilidad de uso
const apiService = {
  get: (endpoint) => request(endpoint, "GET"),
  post: (endpoint, body) => request(endpoint, "POST", body),
  put: (endpoint, body) => request(endpoint, "PUT", body),
  delete: (endpoint) => request(endpoint, "DELETE"),
};

export default apiService;