import { computed } from "vue";
import { useAppStore } from "../composables/useAppStore.js";
export const BASE_URL = "https://deno-hono-proxy.jferreyradev.deno.net";
export const PROXY_TOKEN = "9z4wMwmwnHZ6XLSYoE66A7y2RFlaCE9Vu6u32zXJ18";

const { getGlobalStore } = useAppStore();
const selectedPrefix = computed(() => getGlobalStore("selectedBackend")?.prefix || "desa");

// Función generadora de endpoints
function normalizePrefix(prefix) {
  if (!prefix) return "";
  return prefix.replace(/^\/+|\/+$/g, ""); // Elimina / al inicio y al final
}

// Uso en makeEndpoints:
function makeEndpoints(prefix) {
  const cleanPrefix = normalizePrefix(prefix || "desa");
  return {
    ping: `${BASE_URL}/${cleanPrefix}/ping`,
    query: `${BASE_URL}/${cleanPrefix}/query`,
    procedure: `${BASE_URL}/${cleanPrefix}/procedure`,
    procedureAsync: `${BASE_URL}/${cleanPrefix}/procedure/async`,
    jobStatus: (jobId) => `${BASE_URL}/${cleanPrefix}/jobs/${jobId}`,
    jobs: `${BASE_URL}/${cleanPrefix}/jobs`,
    deleteJob: (jobId) => `${BASE_URL}/${cleanPrefix}/jobs/${jobId}`,
    deleteCompletedJobs: `${BASE_URL}/${cleanPrefix}/jobs?status=completed`,
    deleteOldJobs: `${BASE_URL}/${cleanPrefix}/jobs?older_than=7`,
    logs: `${BASE_URL}/${cleanPrefix}/logs`,
    exec: `${BASE_URL}/${cleanPrefix}/exec`,
  };
}

// Composable que acepta un prefijo opcional
export function useEndpoints(prefix) {
  return computed(() => makeEndpoints(prefix || selectedPrefix.value));
}