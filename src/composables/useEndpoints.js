import { computed } from "vue";
import { useAppStore } from "../composables/useAppStore.js";
import { getBaseUrl, shouldUsePrefix, PROXY_TOKEN } from "../config/api.js";

const { getGlobalStore } = useAppStore();
const selectedPrefix = computed(() => getGlobalStore("selectedBackend")?.prefix || "desa");

// Función generadora de endpoints
function normalizePrefix(prefix) {
  if (!prefix) return "";
  return prefix.replace(/^\/+|\/+$/g, ""); // Elimina / al inicio y al final
}

// Uso en makeEndpoints:
function makeEndpoints(prefix) {
  const baseUrl = getBaseUrl(); // Obtener la URL base configurada
  const usePrefix = shouldUsePrefix(); // Verificar si debe usar prefijo
  
  // Construir la URL base con o sin prefijo
  const cleanPrefix = normalizePrefix(prefix || "desa");
  const urlBase = usePrefix ? `${baseUrl}/${cleanPrefix}` : baseUrl;
  
  return {
    ping: `${urlBase}/ping`,
    query: `${urlBase}/query`,
    procedure: `${urlBase}/procedure`,
    procedureAsync: `${urlBase}/procedure/async`,
    jobStatus: (jobId) => `${urlBase}/jobs/${jobId}`,
    jobs: `${urlBase}/jobs`,
    deleteJob: (jobId) => `${urlBase}/jobs/${jobId}`,
    deleteCompletedJobs: `${urlBase}/jobs?status=completed`,
    deleteOldJobs: `${urlBase}/jobs?older_than=7`,
    logs: `${urlBase}/logs`,
    exec: `${urlBase}/exec`,
  };
}

// Composable que acepta un prefijo opcional
export function useEndpoints(prefix) {
  return computed(() => makeEndpoints(prefix || selectedPrefix.value));
}

// Exportar también las funciones de configuración para uso directo
export { getBaseUrl, shouldUsePrefix, PROXY_TOKEN };