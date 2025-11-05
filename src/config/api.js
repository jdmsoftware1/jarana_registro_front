/**
 * Configuración centralizada de la API
 * Usa la variable VITE_API_URL del archivo .env
 */

/**
 * Obtiene la URL base de la API desde las variables de entorno
 * @returns {string} URL base (ej: http://localhost:3000)
 */
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

/**
 * Obtiene la URL completa de la API con /api
 * @returns {string} URL completa (ej: http://localhost:3000/api)
 */
export const getApiUrl = () => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api`;
};

/**
 * Construye una URL completa para un endpoint específico
 * @param {string} endpoint - Endpoint sin /api (ej: '/employees', '/auth/login')
 * @returns {string} URL completa
 */
export const buildApiUrl = (endpoint) => {
  const apiUrl = getApiUrl();
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${apiUrl}${cleanEndpoint}`;
};

// Exportar por defecto
export default {
  getApiBaseUrl,
  getApiUrl,
  buildApiUrl
};
