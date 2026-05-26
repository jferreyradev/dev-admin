import { ref } from "vue";
import { useApiCall } from "./useApiCall.js";
import { useEndpoints } from "./useEndpoints.js";
import { getQuery, getProcedure, listQueries, listProcedures } from "../config/queries.js";

/**
 * Composable para ejecutar consultas y procedimientos predefinidos
 * 
 * Uso:
 *   const { executeQuery, executeProcedure, results, loading, error } = useQueries();
 *   await executeQuery('usuarios.getById', { id: 123 });
 */
export function useQueries() {
  const { call, loading, error } = useApiCall();
  const endpoints = useEndpoints();

  // Estado de resultados
  const results = ref([]);
  const columns = ref([]);

  /**
   * Ejecuta una consulta SQL predefinida
   * @param {string} queryKey - Key de la consulta (ej: 'usuarios.getById')
   * @param {Object} params - Parámetros para la consulta
   * @returns {Promise<Object>} Resultado con {results, columns}
   */
  async function executeQuery(queryKey, params = {}) {
    const queryFn = getQuery(queryKey);
    
    if (!queryFn) {
      throw new Error(`Consulta no encontrada: ${queryKey}`);
    }

    // Generar el SQL con los parámetros
    const sql = queryFn(params);
    
    console.log(`Ejecutando consulta: ${queryKey}`);
    console.log(`SQL generado:`, sql);
    console.log(`Parámetros:`, params);

    try {
      const response = await call(endpoints.value.query, {
        body: { query: sql },
        method: "POST",
      });

      // Normalizar respuesta a formato {results: [...], columns: [...]}
      const normalized = normalizeResponse(response);
      results.value = normalized.results;
      columns.value = normalized.columns;

      return normalized;
    } catch (err) {
      console.error(`Error ejecutando consulta ${queryKey}:`, err);
      results.value = [];
      columns.value = [];
      throw err;
    }
  }

  /**
   * Ejecuta un procedimiento almacenado predefinido
   * @param {string} procedureKey - Key del procedimiento (ej: 'usuarios.crear')
   * @param {Object} params - Parámetros para el procedimiento
   * @param {boolean} async - Si es true, usa el endpoint asíncrono
   * @returns {Promise<Object>} Resultado del procedimiento
   */
  async function executeProcedure(procedureKey, params = {}, async = false) {
    const procedureDef = getProcedure(procedureKey);
    
    if (!procedureDef) {
      throw new Error(`Procedimiento no encontrado: ${procedureKey}`);
    }

    // Construir array de parámetros en el orden definido
    const procedureParams = buildProcedureParams(procedureDef, params);
    
    console.log(`Ejecutando procedimiento: ${procedureKey}`);
    console.log(`Nombre:`, procedureDef.name);
    console.log(`Parámetros:`, procedureParams);

    const endpoint = async ? endpoints.value.procedureAsync : endpoints.value.procedure;

    try {
      const response = await call(endpoint, {
        body: { 
          name: procedureDef.name, 
          params: procedureParams 
        },
        method: "POST",
      });

      // Si es asíncrono, retorna info del job
      if (async) {
        return response;
      }

      // Si es síncrono, normalizar respuesta
      const normalized = normalizeResponse(response);
      results.value = normalized.results;
      columns.value = normalized.columns;

      return normalized;
    } catch (err) {
      console.error(`Error ejecutando procedimiento ${procedureKey}:`, err);
      results.value = [];
      columns.value = [];
      throw err;
    }
  }

  /**
   * Normaliza diferentes formatos de respuesta a {results, columns}
   */
  function normalizeResponse(response) {
    // Si la respuesta ya tiene el formato correcto
    if (response && response.columns && response.rows) {
      return {
        results: response.rows,
        columns: response.columns,
      };
    }

    // Si la respuesta tiene results como array de objetos
    if (Array.isArray(response.results)) {
      return {
        results: response.results,
        columns: response.results.length > 0 ? Object.keys(response.results[0]) : [],
      };
    }

    // Si la respuesta es directamente un array
    if (Array.isArray(response)) {
      return {
        results: response,
        columns: response.length > 0 ? Object.keys(response[0]) : [],
      };
    }

    // Si la respuesta es un solo objeto
    if (response && typeof response === "object") {
      return {
        results: [response],
        columns: Object.keys(response),
      };
    }

    // Fallback
    return {
      results: [],
      columns: [],
    };
  }

  /**
   * Construye el array de parámetros según la definición del procedimiento
   */
  function buildProcedureParams(procedureDef, params) {
    return procedureDef.params.map((paramDef) => {
      const value = params[paramDef.key];
      
      // Si el parámetro tiene un valor, usarlo
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
      
      // Si tiene default, usarlo
      if (paramDef.default !== undefined) {
        return paramDef.default;
      }
      
      // Si es requerido y no hay valor, advertir
      if (paramDef.required) {
        console.warn(`Parámetro requerido faltante: ${paramDef.key}`);
      }
      
      // Retornar null para parámetros opcionales sin valor
      return null;
    });
  }

  /**
   * Lista todas las consultas disponibles
   */
  function getAvailableQueries() {
    return listQueries();
  }

  /**
   * Lista todos los procedimientos disponibles
   */
  function getAvailableProcedures() {
    return listProcedures();
  }

  return {
    // Funciones de ejecución
    executeQuery,
    executeProcedure,
    
    // Estado
    results,
    columns,
    loading,
    error,
    
    // Utilidades
    getAvailableQueries,
    getAvailableProcedures,
  };
}
