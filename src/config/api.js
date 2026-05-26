import { useAppStore } from "../composables/useAppStore.js";

// URL por defecto (producción)
export const DEFAULT_BASE_URL = "https://deno-hono-proxy.jferreyradev.deno.net";

// URL local por defecto para pruebas
export const DEFAULT_LOCAL_URL = "http://localhost:3008";

export const PROXY_TOKEN = "9z4wMwmwnHZ6XLSYoE66A7y2RFlaCE9Vu6u32zXJ18";

export const LOCAL_TOKEN = "desarrollotoken";

/**
 * Obtiene el token de autenticación según el modo activo
 * @returns {string} Token correspondiente (LOCAL_TOKEN o PROXY_TOKEN)
 */
export function getAuthToken() {
  const { getGlobalStore } = useAppStore();
  const apiConfig = getGlobalStore("apiConfig");

  // Si está en modo local, usar LOCAL_TOKEN
  if (apiConfig?.useLocalUrl) {
    return LOCAL_TOKEN;
  }

  // Sino, usar PROXY_TOKEN (producción)
  return PROXY_TOKEN;
}

/**
 * Genera headers HTTP estándar con autenticación
 * Usa el token correcto según el modo (local o producción)
 * @param {Object} additionalHeaders - Headers adicionales a incluir
 * @returns {Object} Headers completos con Content-Type y Authorization
 */
export function getAuthHeaders(additionalHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
    ...additionalHeaders,
  };
}

/**
 * Configuración de fetch para llamadas autenticadas
 * @param {string} method - Método HTTP (GET, POST, etc.)
 * @param {Object} body - Body del request (se convertirá a JSON)
 * @param {Object} additionalHeaders - Headers adicionales
 * @returns {Object} Configuración lista para fetch()
 */
export function getAuthFetchConfig(method = 'GET', body = null, additionalHeaders = {}) {
  const config = {
    method,
    headers: getAuthHeaders(additionalHeaders),
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  return config;
}

/**
 * Obtiene la BASE_URL actual según la configuración del usuario
 * Si el usuario ha configurado una URL personalizada, usa esa
 * Si ha activado modo local, usa la URL local configurada
 * Sino, usa la URL por defecto (producción)
 */
export function getBaseUrl() {
  const { getGlobalStore } = useAppStore();
  const apiConfig = getGlobalStore("apiConfig");

  if (!apiConfig) {
    return DEFAULT_BASE_URL;
  }

  // Si está en modo local, usar la URL local
  if (apiConfig.useLocalUrl) {
    return apiConfig.localUrl || DEFAULT_LOCAL_URL;
  }

  // Sino, usar la URL de producción
  return apiConfig.productionUrl || DEFAULT_BASE_URL;
}

/**
 * Indica si la URL actual requiere prefijo de backend
 * Las URLs remotas (producción) usan prefijos como /desa, /prod
 * Las URLs locales normalmente se conectan directo sin prefijo
 * @returns {boolean} true si debe usar prefijo, false si no
 */
export function shouldUsePrefix() {
  const { getGlobalStore } = useAppStore();
  const apiConfig = getGlobalStore("apiConfig");

  // Si no hay configuración, usar prefijo (comportamiento por defecto para producción)
  if (!apiConfig) {
    return true;
  }

  // Si está en modo local, NO usar prefijo (el servidor local no lo necesita)
  if (apiConfig.useLocalUrl) {
    return false;
  }

  // Si está en modo producción, SÍ usar prefijo
  return true;
}

/**
 * Configuración inicial de la API (para retrocompatibilidad)
 * @deprecated Usar getBaseUrl() en su lugar
 */
export const BASE_URL = DEFAULT_BASE_URL;