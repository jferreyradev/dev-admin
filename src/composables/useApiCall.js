import { ref } from 'vue';

export function useApiCall() {
  const loading = ref(false);
  const error = ref(null);

  const call = async (url, options = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : null
      });

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