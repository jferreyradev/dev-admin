// ============================================
// CONSULTAS SQL PREDEFINIDAS CON PARÁMETROS
// ============================================

/**
 * Catálogo de consultas SQL reutilizables organizadas por categoría.
 * Cada consulta es una función que recibe parámetros y retorna el SQL generado.
 *
 * Uso:
 *   const sql = QUERIES.usuarios.getById({ id: 123 });
 *   executeQuery('usuarios.getById', { id: 123 });
 */
export const QUERIES = {
  // Categoría: Usuarios
  usuarios: {
    /**
     * Obtener usuario por ID
     * @param {number} id - ID del usuario
     */
    getById: ({ id }) => `SELECT * FROM usuarios WHERE id = ${id}`,

    /**
     * Listar usuarios activos
     * @param {number} limite - Cantidad máxima de registros (default: 100)
     */
    listarActivos: ({ limite = 100 } = {}) =>
      `SELECT * FROM usuarios WHERE activo = 1 FETCH FIRST ${limite} ROWS ONLY`,

    /**
     * Buscar usuarios por nombre
     * @param {string} nombre - Nombre o parte del nombre a buscar
     */
    buscarPorNombre: ({ nombre }) =>
      `SELECT id, nombre, email, fecha_registro FROM usuarios WHERE UPPER(nombre) LIKE UPPER('%${nombre}%')`,
  },

  // Categoría: Logs
  logs: {
    /**
     * Obtener logs recientes
     * @param {number} horas - Cantidad de horas hacia atrás (default: 24)
     * @param {number} limite - Cantidad máxima de registros (default: 100)
     */
    recientes: ({ horas = 24, limite = 100 } = {}) =>
      `SELECT * FROM logs WHERE fecha > SYSDATE - ${horas}/24 ORDER BY fecha DESC FETCH FIRST ${limite} ROWS ONLY`,

    /**
     * Buscar logs por nivel
     * @param {string} nivel - Nivel del log (INFO, WARNING, ERROR, etc.)
     * @param {number} dias - Cantidad de días hacia atrás (default: 7)
     */
    porNivel: ({ nivel, dias = 7 }) =>
      `SELECT * FROM logs WHERE nivel = '${nivel}' AND fecha > SYSDATE - ${dias} ORDER BY fecha DESC`,
  },

  // Categoría: Reportes
  reportes: {
    /**
     * Resumen de actividad por fecha
     * @param {string} fechaInicio - Fecha inicio (formato: YYYY-MM-DD)
     * @param {string} fechaFin - Fecha fin (formato: YYYY-MM-DD)
     */
    actividadPorFecha: ({ fechaInicio, fechaFin }) =>
      `SELECT TRUNC(fecha) as dia, COUNT(*) as cantidad 
       FROM actividades 
       WHERE fecha BETWEEN TO_DATE('${fechaInicio}', 'YYYY-MM-DD') AND TO_DATE('${fechaFin}', 'YYYY-MM-DD')
       GROUP BY TRUNC(fecha) 
       ORDER BY dia DESC`,
  },

  // Categoría: Sistema
  sistema: {
    /**
     * Información de tablas
     */
    paquetes: () =>
      `SELECT t.object_type as tipo, t.object_name as modulo, T.PROCEDURE_NAME, T.SUBPROGRAM_ID
FROM all_procedures t
WHERE owner = 'US_SUELDO'
AND procedure_name IS NOT NULL`,
    parametros: ({ packageName, procedureName }) =>
      `SELECT object_name AS procedimiento,
       argument_name AS parametro,
       data_type AS tipo_dato,
       in_out AS direccion,
       position AS posicion
FROM all_arguments
WHERE owner = 'US_SUELDO'
  AND package_name = '${packageName}'
  AND object_name = '${procedureName}'
ORDER BY object_name, position`,

    config_server: () =>
      `SELECT * FROM config_server`,
    /**
     * Tamaño de una tabla específica
     * @param {string} tabla - Nombre de la tabla
     */
    tamañoTabla: ({ tabla }) =>
      `SELECT segment_name, bytes/1024/1024 as mb FROM user_segments WHERE segment_name = UPPER('${tabla}')`,
  },
};

// ============================================
// PROCEDIMIENTOS ALMACENADOS PREDEFINIDOS
// ============================================

/**
 * Catálogo de procedimientos almacenados reutilizables.
 * Cada procedimiento define el nombre y metadata de sus parámetros.
 *
 * Uso:
 *   const proc = PROCEDURES.usuarios.crear;
 *   executeProcedure('usuarios.crear', { nombre: 'Juan', email: 'juan@example.com' });
 */
export const PROCEDURES = {
  // Categoría: Usuarios
  usuarios: {
    /**
     * Crear nuevo usuario
     */
    crear: {
      name: "crear_usuario",
      description: "Crea un nuevo usuario en el sistema",
      params: [
        { key: "nombre", label: "Nombre", type: "string", required: true },
        { key: "email", label: "Email", type: "string", required: true },
        { key: "activo", label: "Activo", type: "number", default: 1 },
      ],
    },

    /**
     * Actualizar usuario existente
     */
    actualizar: {
      name: "actualizar_usuario",
      description: "Actualiza los datos de un usuario",
      params: [
        { key: "id", label: "ID Usuario", type: "number", required: true },
        { key: "nombre", label: "Nombre", type: "string" },
        { key: "email", label: "Email", type: "string" },
        { key: "activo", label: "Activo", type: "number" },
      ],
    },

    /**
     * Eliminar usuario (soft delete)
     */
    eliminar: {
      name: "eliminar_usuario",
      description: "Marca un usuario como inactivo",
      params: [
        { key: "id", label: "ID Usuario", type: "number", required: true },
      ],
    },
  },

  // Categoría: Reportes
  reportes: {
    /**
     * Generar reporte de actividad
     */
    generarActividad: {
      name: "generar_reporte_actividad",
      description: "Genera un reporte completo de actividad",
      params: [
        {
          key: "fecha_inicio",
          label: "Fecha Inicio",
          type: "string",
          required: true,
        },
        {
          key: "fecha_fin",
          label: "Fecha Fin",
          type: "string",
          required: true,
        },
        {
          key: "tipo",
          label: "Tipo de Reporte",
          type: "string",
          default: "COMPLETO",
        },
      ],
    },
  },

  // Categoría: Mantenimiento
  mantenimiento: {
    /**
     * Limpiar logs antiguos
     */
    limpiarLogs: {
      name: "limpiar_logs_antiguos",
      description: "Elimina logs más antiguos que X días",
      params: [
        {
          key: "dias",
          label: "Días de antigüedad",
          type: "number",
          default: 30,
        },
      ],
    },

    /**
     * Recalcular estadísticas
     */
    recalcularStats: {
      name: "recalcular_estadisticas",
      description: "Recalcula las estadísticas de las tablas",
      params: [
        { key: "tabla", label: "Nombre de tabla (opcional)", type: "string" },
      ],
    },
  },
};

// ============================================
// UTILIDADES PARA ACCEDER A LAS DEFINICIONES
// ============================================

/**
 * Obtiene una consulta SQL por su key (ej: 'usuarios.getById')
 * @param {string} key - Key de la consulta en formato 'categoria.nombre'
 * @returns {Function|null} Función generadora de SQL o null si no existe
 */
export function getQuery(key) {
  const [category, name] = key.split(".");
  return QUERIES[category]?.[name] || null;
}

/**
 * Obtiene un procedimiento por su key (ej: 'usuarios.crear')
 * @param {string} key - Key del procedimiento en formato 'categoria.nombre'
 * @returns {Object|null} Definición del procedimiento o null si no existe
 */
export function getProcedure(key) {
  const [category, name] = key.split(".");
  return PROCEDURES[category]?.[name] || null;
}

/**
 * Lista todas las consultas disponibles
 * @returns {Array} Array de objetos {key, category, name, fn}
 */
export function listQueries() {
  const queries = [];
  for (const [category, items] of Object.entries(QUERIES)) {
    for (const [name, fn] of Object.entries(items)) {
      queries.push({ key: `${category}.${name}`, category, name, fn });
    }
  }
  return queries;
}

/**
 * Lista todos los procedimientos disponibles
 * @returns {Array} Array de objetos {key, category, name, ...definition}
 */
export function listProcedures() {
  const procedures = [];
  for (const [category, items] of Object.entries(PROCEDURES)) {
    for (const [name, definition] of Object.entries(items)) {
      procedures.push({
        key: `${category}.${name}`,
        category,
        name,
        ...definition,
      });
    }
  }
  return procedures;
}
