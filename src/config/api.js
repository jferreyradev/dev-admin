export const BASE_URL = "https://deno-hono-proxy.jferreyradev.deno.net";
export const PROXY_TOKEN = "9z4wMwmwnHZ6XLSYoE66A7y2RFlaCE9Vu6u32zXJ18";

// Endpoints principales de la API go-ora-api
export const API_ENDPOINTS = {
  // Verificar conexión (ping)
  // Uso: GET /ping
  ping: `${BASE_URL}/ping`,

  // Consulta SQL (query)
  // Uso: POST /query  Body: { query: "SELECT ..." }
  query: `${BASE_URL}/query`,

  // Ejecutar procedimiento almacenado (síncrono)
  // Uso: POST /procedure  Body: { name: "...", params: [...] }
  procedure: `${BASE_URL}/procedure`,

  // Ejecutar procedimiento almacenado (asíncrono)
  // Uso: POST /procedure/async  Body: { name: "...", params: [...] }
  procedureAsync: `${BASE_URL}/procedure/async`,

  // Consultar estado de un job asíncrono
  // Uso: GET /jobs/{job_id}
  jobStatus: (jobId) => `${BASE_URL}/jobs/${jobId}`,

  // Listar todos los jobs
  // Uso: GET /jobs
  jobs: `${BASE_URL}/jobs`,

  // Eliminar un job específico
  // Uso: DELETE /jobs/{job_id}
  deleteJob: (jobId) => `${BASE_URL}/jobs/${jobId}`,

  // Eliminar jobs completados
  // Uso: DELETE /jobs?status=completed
  deleteCompletedJobs: `${BASE_URL}/jobs?status=completed`,

  // Eliminar jobs antiguos (más de 7 días)
  // Uso: DELETE /jobs?older_than=7
  deleteOldJobs: `${BASE_URL}/jobs?older_than=7`,

  // Ver logs de ejecución
  // Uso: GET /logs
  logs: `${BASE_URL}/logs`,

  // Ejecutar sentencias SQL de tipo INSERT/UPDATE/DELETE
  // Uso: POST /exec  Body: { query: "INSERT/UPDATE/DELETE ..." }
  exec: `${BASE_URL}/exec`,
};