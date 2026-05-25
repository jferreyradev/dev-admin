import { ref } from 'vue';

export function useApiCall() {
  const loading = ref(false);
  const error = ref(null);

  const call = async (url, options = {}) => {
    loading.value = true;
    error.value = null;

    try {

      console.log("Llamando a URL:", url);
      console.log("Opciones de llamada:", options);
      console.log("Método HTTP:", options.method || 'GET');
      console.log("Cuerpo de la solicitud:", options.body);

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : null
      });

      console.log("Respuesta HTTP:", response);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { call, loading, error };
}