<script setup>
import { ref } from "vue";
import { useApiCall } from "../composables/useApiCall";
import { useEndpoints } from "../composables/useEndpoints";
import { PROXY_TOKEN } from "../config/api.js";

const query = ref("");
const results = ref([]); // Array de objetos, cada objeto es una fila
const columns = ref([]); // Array de strings, nombres de columnas

const { call, loading: loadingCall } = useApiCall();
const endpoints = useEndpoints();

function handleQuery() {
  console.log("Endpoint de consulta:", endpoints.value);
  console.log("Ejecutando consulta:", query.value);

  call(endpoints.value.query, {
    body: { query: query.value },
    method: "POST",
    headers: { authorization: `Bearer ${PROXY_TOKEN}` },
  })
    .then((response) => {
      // Si la respuesta es un array de objetos tipo [{col1:..., col2:...}, ...]
      if (Array.isArray(response.results)) {
        results.value = response.results;
        columns.value =
          response.results.length > 0 ? Object.keys(response.results[0]) : [];
      }
      // Si la respuesta tiene una estructura tipo { columns: [...], rows: [...] }
      else if (response && response.columns && response.rows) {
        columns.value = response.columns;
        results.value = response.rows;
      }
      // Si la respuesta es un solo objeto
      else if (response && typeof response === "object") {
        results.value = [response];
        columns.value = Object.keys(response);
      } else {
        results.value = [];
        columns.value = [];
      }
      console.log("Consulta ejecutada con éxito:", response);
    })
    .catch((error) => {
      console.error("Error al ejecutar la consulta:", error);
      results.value = [];
      columns.value = [];
    });
}
</script>

<template>
  <ConnectionInfo
  :endpoint="endpoints.value"
/>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Consulta personalizada</h2>
      <p class="mb-6 text-base-content/70">
        Ingresa tu consulta y visualiza los resultados en la tabla.
      </p>

      <div class="mb-4">
        <textarea
          v-model="query"
          class="textarea textarea-bordered w-full min-h-[100px]"
          placeholder="Escribe tu consulta aquí..."
        ></textarea>
      </div>
      <div class="mb-8">
        <button class="btn btn-primary" @click="handleQuery">
          Ejecutar consulta
        </button>
      </div>

      <div v-if="loadingCall" class="text-base-content/50 flex justify-center">
        <span class="loading loading-spinner loading-xl"></span>
      </div>

      <div v-else-if="results.length"
        class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100"
      >
        <table class="table table-zebra">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in results"
              :key="idx"
              @click="console.log('Fila seleccionada:', row)"
              class="cursor-pointer"
            >
              <td v-for="col in columns" :key="col">{{ row[col] }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="text-sm text-right text-base-content/70">
              <td :colspan="columns.length">
                {{ results.length }}
                {{
                  results.length === 1 ? "resultado" : "resultados"
                }}
                encontrados.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div v-else class="text-base-content/50 mt-8">
        No hay resultados para mostrar.
      </div>
    </div>
  </div>
</template>
