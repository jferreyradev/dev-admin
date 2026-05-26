import { ref, onMounted, watch, toValue } from 'vue'
import { getAuthHeaders } from '../config/api.js'

// Cache global compartido entre todas las instancias del composable
const cacheStore = new Map()

// Composable para realizar requests HTTP con soporte para AbortController y cache
// Parámetros:
//   - url: URL del endpoint (puede ser reactiva)
//   - options.method: Método HTTP (GET, POST, PUT, DELETE, etc.) - default: 'GET'
//   - options.headers: Headers personalizados (se mezclan con los headers estándar de autenticación)
//   - options.body: Body del request (se convertirá a JSON automáticamente)
//   - options.skipAuth: Si es true, no incluye headers de autenticación (default: false)
//   - options.cacheMode: 'auto' | 'manual' | 'off' - default: 'auto'
//   - options.cacheTime: Tiempo en ms para expiración (solo en modo 'auto') - default: 5 minutos
// Retorna: { data, error, loading, fetchData, clearCache, refetch }

export function useFetch(url, options = {}) {
  // ============================================
  // REFS - Estado reactivo
  // ============================================
  const data = ref(null)           // Datos del response
  const error = ref(null)          // Mensaje de error
  const loading = ref(false)       // Estado de carga
  let abortController = null       // Controlador para cancelar requests

  // ============================================
  // CONFIGURACIÓN CACHE
  // ============================================
  // cacheMode: 'auto' = cache con TTL | 'manual' = cache permanente | 'off' = sin cache
  const cacheMode = options.cacheMode || 'auto'
  // Tiempo en milisegundos para expiración automática (solo aplica en modo 'auto')
  const cacheTime = options.cacheTime ?? 5 * 60 * 1000

  // ============================================
  // FUNCIONES DE CACHE
  // ============================================

  // Genera una clave única para el cache basada en método HTTP y URL
  const getCacheKey = () => {
    const baseUrl = toValue(url)
    const method = options.method || 'GET'
    return `${method}:${baseUrl}`
  }

  // Obtiene datos del cache si existen y no han expirado
  // Modo 'auto': verifica TTL y elimina si expiró
  // Modo 'manual': cache nunca expira
  // Modo 'off': siempre retorna null
  
  const getCachedData = () => {
    if (cacheMode === 'off') return null

    const key = getCacheKey()
    const cached = cacheStore.get(key)

    if (!cached) return null

    // En modo manual, el cache nunca expira
    if (cacheMode === 'manual') {
      return cached.data
    }

    // En modo auto, verificar si aún está dentro del TTL
    if (cacheMode === 'auto' && Date.now() - cached.timestamp < cacheTime) {
      return cached.data
    }

    // Cache expirado en modo auto: eliminar
    cacheStore.delete(key)
    return null
  }

  // Guarda datos en el cache con timestamp
  // No hace nada si el modo es 'off'
  const setCachedData = (value) => {
    if (cacheMode === 'off') return

    const key = getCacheKey()
    cacheStore.set(key, {
      data: value,
      timestamp: Date.now()
    })
  }

  // ============================================
  // FUNCIÓN PRINCIPAL
  // ============================================

  // Ejecuta el fetch HTTP con soporte para cache
  // skipCache: si es true, ignora el cache y fuerza un fetch nuevo
  // - Verifica cache antes de hacer el request
  // - Cancela requests previos
  // - Maneja errores y AbortError
  // - Actualiza el estado reactivo
  const fetchData = async (skipCache = false) => {
    // Verificar cache primero (si no forzamos skip)
    if (!skipCache) {
      const cachedData = getCachedData()
      if (cachedData) {
        data.value = cachedData
        loading.value = false
        return
      }
    }

    // Iniciar loading y limpiar datos previos
    loading.value = true
    data.value = null
    error.value = null

    // Cancelar request anterior si existe
    abortController?.abort()
    abortController = new AbortController()

    // Preparar headers: usar headers de autenticación centralizados
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

    try {
      // Construir opciones del fetch
      const fetchOptions = {
        method: options.method || 'GET',
        headers,
        signal: abortController.signal // Para poder cancelar el request
      }

      // Agregar body solo si existe
      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body)
      }

      // Ejecutar el fetch
      const response = await fetch(toValue(url), fetchOptions)
      
      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Parsear datos y guardar en cache
      const result = await response.json()
      data.value = result
      setCachedData(result)
    } catch (err) {
      // Ignorar errores de AbortError (requests cancelados)
      if (err.name !== 'AbortError') {
        error.value = err.message
      }
    } finally {
      // Finalizar loading en cualquier caso
      loading.value = false
    }
  }

  // ============================================
  // CICLO DE VIDA
  // ============================================

  // Ejecutar fetch cuando el componente se monta
  onMounted(() => {
    fetchData()
  })

  // Re-ejecutar fetch si la URL cambia
  // Útil cuando la URL es reactiva (computed, ref, etc.)
  watch(() => toValue(url), () => {
    fetchData()
  })

  // ============================================
  // FUNCIONES ADICIONALES
  // ============================================

  // Elimina los datos del cache
  // Útil después de operaciones de mutación (POST, PUT, DELETE)
  const clearCache = () => {
    cacheStore.delete(getCacheKey())
  }

  // Limpia el cache y fuerza un fetch nuevo
  // Retorna la promesa del fetch para esperar completación
  const refetch = () => {
    clearCache()
    return fetchData(true)
  }

  // ============================================
  // API PÚBLICA
  // ============================================
  return {
    data,        // Datos del response
    error,       // Mensaje de error
    loading,     // Estado de carga
    fetchData,   // Función para ejecutar fetch manualmente
    clearCache,  // Elimina datos del cache
    refetch      // Limpia cache y fuerza fetch nuevo
  }
}
// ============================================
// EJEMPLOS DE USO
// ============================================

// Cache automático (expira en 5 minutos) - DEFAULT
/*
import { useFetch } from '@/composables/useFetch';
import { getBaseUrl } from '@/config/api';

const baseUrl = getBaseUrl();

// Autenticación incluida automáticamente
const { data, loading, refetch } = useFetch(`${baseUrl}/api/backends`, {
  cacheMode: 'auto',
  cacheTime: 5 * 60 * 1000
})

// Cache manual (nunca expira, solo cuando llames refetch)
const { data, loading, refetch } = useFetch(`${baseUrl}/api/backends`, {
  cacheMode: 'manual'
})

// Sin cache
const { data, loading, refetch } = useFetch(`${baseUrl}/api/backends`, {
  cacheMode: 'off'
})

// Sin autenticación (endpoints públicos)
const { data } = useFetch(`${baseUrl}/public/info`, {
  skipAuth: true
})

// En un componente, recargar datos cuando necesites:
const handleDelete = async (item) => {
  await call(`${baseUrl}/api/backends/${item.id}`, { method: 'DELETE' })
  refetch() // Recarga los datos sin cache
}

*/