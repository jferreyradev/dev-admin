<script setup>
import { ref, computed, watch } from "vue";
import { useQueries } from "../composables/useQueries.js";

// Estado del formulario
const selectedProcedure = ref("");
const procedureParams = ref({});
const isAsync = ref(false);

// Composable para ejecutar procedimientos
const {
  executeProcedure,
  results,
  columns,
  loading,
  error,
  getAvailableProcedures,
} = useQueries();

// Lista de procedimientos disponibles
const availableProcedures = getAvailableProcedures();

// Procedimiento seleccionado actualmente
const currentProcedure = computed(() => {
  return availableProcedures.find((p) => p.key === selectedProcedure.value);
});

// Cuando cambia el procedimiento seleccionado, reiniciar parámetros con defaults
watch(selectedProcedure, (newKey) => {
  if (!newKey) {
    procedureParams.value = {};
    return;
  }

  const proc = availableProcedures.find((p) => p.key === newKey);
  if (proc) {
    const defaults = {};
    proc.params.forEach((param) => {
      if (param.default !== undefined) {
        defaults[param.key] = param.default;
      }
    });
    procedureParams.value = defaults;
  }
});

// Ejecutar procedimiento
async function handleExecute() {
  if (!selectedProcedure.value) return;

  try {
    const result = await executeProcedure(
      selectedProcedure.value,
      procedureParams.value,
      isAsync.value
    );

    if (isAsync.value) {
      console.log("Procedimiento asíncrono iniciado:", result);
      alert(`Job iniciado con ID: ${result.job_id || "N/A"}`);
    } else {
      console.log("Procedimiento ejecutado con éxito:", result);
    }
  } catch (err) {
    console.error("Error al ejecutar procedimiento:", err);
  }
}

// Limpiar resultados
function clearResults() {
  results.value = [];
  columns.value = [];
}
</script>

<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Ejecutar procedimiento</h2>
      <p class="mb-6 text-base-content/70">
        Selecciona un procedimiento predefinido e ingresa los parámetros
        necesarios.
      </p>

      <!-- Selector de procedimiento -->
      <div class="card bg-base-100 shadow-md mb-6">
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">Seleccionar procedimiento</h3>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-semibold">Procedimiento</span>
            </label>
            <select
              v-model="selectedProcedure"
              class="select select-bordered w-full"
            >
              <option value="">-- Selecciona un procedimiento --</option>
              <optgroup
                v-for="category in [
                  ...new Set(availableProcedures.map((p) => p.category)),
                ]"
                :key="category"
                :label="category.charAt(0).toUpperCase() + category.slice(1)"
              >
                <option
                  v-for="proc in availableProcedures.filter(
                    (p) => p.category === category
                  )"
                  :key="proc.key"
                  :value="proc.key"
                >
                  {{ proc.name }} - {{ proc.description }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Descripción del procedimiento seleccionado -->
          <div
            v-if="currentProcedure"
            class="alert alert-info shadow-sm text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="stroke-current shrink-0 w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <strong>{{ currentProcedure.description }}</strong>
              <div class="text-xs mt-1">
                Nombre del procedimiento: {{ currentProcedure.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de parámetros -->
      <div v-if="currentProcedure" class="card bg-base-100 shadow-md mb-6">
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">Parámetros</h3>

          <div
            v-if="currentProcedure.params.length === 0"
            class="text-base-content/60 italic"
          >
            Este procedimiento no requiere parámetros.
          </div>

          <div
            v-for="param in currentProcedure.params"
            :key="param.key"
            class="form-control mb-3"
          >
            <label class="label">
              <span class="label-text font-semibold">
                {{ param.label }}
                <span v-if="param.required" class="text-error">*</span>
              </span>
              <span v-if="param.default !== undefined" class="label-text-alt">
                Default: {{ param.default }}
              </span>
            </label>

            <!-- Input según el tipo -->
            <input
              v-if="param.type === 'number'"
              v-model.number="procedureParams[param.key]"
              type="number"
              class="input input-bordered w-full"
              :placeholder="`Ingresa ${param.label.toLowerCase()}`"
              :required="param.required"
            />
            <input
              v-else
              v-model="procedureParams[param.key]"
              type="text"
              class="input input-bordered w-full"
              :placeholder="`Ingresa ${param.label.toLowerCase()}`"
              :required="param.required"
            />
          </div>

          <!-- Opción de ejecución asíncrona -->
          <div class="form-control mt-4">
            <label class="label cursor-pointer justify-start gap-4">
              <input
                v-model="isAsync"
                type="checkbox"
                class="checkbox checkbox-primary"
              />
              <span class="label-text">
                Ejecutar en modo asíncrono
                <span class="text-xs text-base-content/60 block"
                  >Para procedimientos de larga duración</span
                >
              </span>
            </label>
          </div>

          <!-- Botones de acción -->
          <div class="card-actions justify-end mt-6">
            <button class="btn btn-ghost" @click="clearResults">
              Limpiar resultados
            </button>
            <button
              class="btn btn-primary"
              @click="handleExecute"
              :disabled="loading || !selectedProcedure"
            >
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ loading ? "Ejecutando..." : "Ejecutar procedimiento" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Mostrar error si existe -->
      <div v-if="error" class="alert alert-error shadow-lg mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error: {{ error }}</span>
      </div>

      <!-- Spinner de carga -->
      <div v-if="loading" class="text-base-content/50 flex justify-center my-8">
        <span class="loading loading-spinner loading-xl"></span>
      </div>

      <!-- Tabla de resultados -->
      <div
        v-else-if="results.length && columns.length"
        class="card bg-base-100 shadow-md"
      >
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">Resultados</h3>
          <div
            class="overflow-x-auto rounded-box border border-base-content/5"
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
                  class="cursor-pointer hover:bg-base-200"
                  @click="console.log('Fila seleccionada:', row)"
                >
                  <td v-for="col in columns" :key="col">{{ row[col] }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="text-sm text-right text-base-content/70">
                  <td :colspan="columns.length">
                    {{ results.length }}
                    {{ results.length === 1 ? "resultado" : "resultados" }}
                    encontrados.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!currentProcedure" class="text-center text-base-content/50 mt-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-16 h-16 mx-auto mb-4 opacity-50"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p class="text-lg">Selecciona un procedimiento para comenzar</p>
      </div>
    </div>
  </div>
</template>
