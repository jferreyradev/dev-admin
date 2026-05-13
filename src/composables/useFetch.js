import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url, options = {}) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    data.value = null
    error.value = null

    // Crear headers base
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    

    try {
      const response = await fetch(toValue(url), {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : null
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      data.value = await response.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  watchEffect(() => {
    fetchData()
  })

  return { data, error, loading }
}