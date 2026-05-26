import { ref } from 'vue';
import { getAuthHeaders } from '../config/api.js';

/**
 * Composable para realizar llamadas HTTP autenticadas
 * Incluye automáticamente headers de autenticación y Content-Type
 * 
 * @returns {Object} { call, loading, error }
 * 
 * Uso:
 *   const { call, loading, error } = useApiCall();
 *   const data = await call(url, { method: 'POST', body: { ... }, headers: { ... } });
 */
export function useApiCall() {
  const loading = ref(false);
  const error = ref(null);

  /**
   * Ejecuta una llamada HTTP
   * @param {string} url - URL del endpoint
   * @param {Object} options - Configuración del fetch
   * @param {string} options.method - Método HTTP (default: 'GET')
   * @param {Object} options.body - Body del request (se convertirá a JSON)
   * @param {Object} options.headers - Headers adicionales (se mezclan con los estándar)
   * @param {boolean} options.skipAuth - Si es true, no incluye headers de autenticación
   * @returns {Promise<any>} Datos parseados de la respuesta JSON
   */
  const call = async (url, options = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const method = options.method || 'GET';
      
      // Preparar headers
      let headers;
      if (options.skipAuth) {
        // Si se solicita sin auth, usar solo Content-Type y headers adicionales
        headers = {
          'Content-Type': 'application/json',
          ...options.headers
        };
      } else {
        // Por defecto, incluir autenticación
        headers = getAuthHeaders(options.headers);
      }

      console.log("Llamando a URL:", url);
      console.log("Método HTTP:", method);
      console.log("Cuerpo de la solicitud:", options.body);

      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : null
      });

      console.log("Respuesta HTTP:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      error.value = err.message;
      console.error("Error en llamada HTTP:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { call, loading, error };
}