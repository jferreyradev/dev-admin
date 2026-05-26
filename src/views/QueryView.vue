<script setup>
import { ref } from "vue";
import { useApiCall } from "../composables/useApiCall";
import { useEndpoints } from "../composables/useEndpoints";
import { useQueries } from "../composables/useQueries";

const query = ref("");
const results = ref([]); // Array de objetos, cada objeto es una fila
const columns = ref([]); // Array de strings, nombres de columnas
const showPredefinedQueries = ref(false);

const { call, loading: loadingCall } = useApiCall();
const endpoints = useEndpoints();
const { getAvailableQueries } = useQueries();

// Lista de consultas predefinidas
const availableQueries = getAvailableQueries();

function handleQuery() {
  console.log("Endpoint de consulta:", endpoints.value);
  console.log("Ejecutando consulta:", query.value);

  call(endpoints.value.query, {
    body: { query: query.value },
    method: "POST",
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

// Cargar consulta predefinida en el textarea
function loadPredefinedQuery(queryInfo) {
  // Mostrar la consulta como template (sin parámetros)
  // El usuario puede editar y agregar los valores necesarios
  const queryFn = queryInfo.fn;
  
  // Obtener el código fuente de la función para mostrar el patrón
  const fnString = queryFn.toString();
  
  // Intentar extraer el SQL del cuerpo de la función
  // Esto funciona para funciones simples que retornan un template literal
  const match = fnString.match(/`([^`]+)`/);
  
  if (match) {
    query.value = match[1];
  } else {
    // Si no podemos extraer el template, ejecutar la función con parámetros de ejemplo
    try {
      query.value = queryFn({});
    } catch (e) {
      query.value = `-- Consulta: ${queryInfo.key}\n-- Por favor ingresa los parámetros manualmente`;
    }
  }
  
  showPredefinedQueries.value = false;
}

// Toggle para mostrar/ocultar consultas predefinidas
function togglePredefinedQueries() {
  showPredefinedQueries.value = !showPredefinedQueries.value;
}
</script>

<template>
  
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Consulta personalizada</h2>
      <p class="mb-6 text-base-content/70">
        Ingresa tu consulta y visualiza los resultados en la tabla.
      </p>

      <!-- Botón para mostrar consultas predefinidas -->
      <div class="mb-4">
        <button 
          class="btn btn-sm btn-outline btn-secondary"
          @click="togglePredefinedQueries"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
            />
          </svg>
          {{ showPredefinedQueries ? 'Ocultar' : 'Ver' }} consultas predefinidas
        </button>
      </div>

      <!-- Panel de consultas predefinidas -->
      <div 
        v-if="showPredefinedQueries" 
        class="card bg-base-100 shadow-md mb-6"
      >
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">Consultas predefinidas</h3>
          <p class="text-sm text-base-content/70 mb-4">
            Haz clic en una consulta para cargarla en el editor. Podrás editarla antes de ejecutarla.
          </p>
          
          <div 
            v-for="category in [...new Set(availableQueries.map(q => q.category))]" 
            :key="category"
            class="mb-4"
          >
            <h4 class="font-semibold text-base mb-2 capitalize">
              {{ category }}
            </h4>
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="queryInfo in availableQueries.filter(q => q.category === category)"
                :key="queryInfo.key"
                class="btn btn-sm btn-ghost justify-start normal-case"
                @click="loadPredefinedQuery(queryInfo)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                {{ queryInfo.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

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
