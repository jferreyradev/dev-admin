<script setup>

import { ref, onMounted, computed } from "vue";
import { useFetch } from "../composables/useFetch.js";
import { getBaseUrl, shouldUsePrefix } from "../config/api.js";
import { useAppStore } from "../composables/useAppStore.js";

const { setGlobalStore, getGlobalStore } = useAppStore();

const selectedItem = ref(null);

// Detectar modo local o remoto
const isLocal = computed(() => {
  const config = getGlobalStore("apiConfig");
  return config?.useLocalUrl || false;
});

const isRemote = computed(() => !isLocal.value);

// URL base reactiva que cambia según el modo
const baseUrl = computed(() => getBaseUrl());

// URL completa reactiva para el endpoint de backends
const backendsUrl = computed(() => `${baseUrl.value}/api/backends`);

const { data, error, loading, fetchData } = useFetch(backendsUrl, {
  method: 'GET',
  cacheMode: 'manual'
});


// Transformar datos con computed
const items = computed(() => {
  if (!data.value?.backends) return [];
  
  return data.value.backends.map((x) => ({
    id: x.key,
    name: x.data.name,
    url: x.data.url,
    prefix: x.data.prefix,
  }));
});

const metadata = [
  { label: 'Key', field: 'id' },
  { label: 'Nombre', field: 'name' },
  { label: 'URL', field: 'url' },
  { label: 'Prefijo', field: 'prefix' },  
];

function handleClick(item) {
  selectedItem.value = item;
  setGlobalStore('selectedBackend', item);
}

</script>

<template>
  <div class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header Hero -->
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-2">
          <h2 class="text-2xl font-bold">Panel de Administración</h2>
          <span class="badge badge-lg" :class="isLocal ? 'badge-warning' : 'badge-success'">
            {{ isLocal ? 'Local' : 'Producción' }}
          </span>
        </div>
        <p class="text-md text-base-content/70">
          Gestiona y controla tus backends desde aquí
        </p>
      </div>

      <!-- Mensaje para modo local -->
      <div v-if="isLocal" class="alert alert-warning shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 class="font-bold">Modo Local Activo</h3>
          <div class="text-sm">En modo local no es necesario seleccionar un backend. La conexión es directa al servidor local.</div>
        </div>
      </div>

      <!-- Data Table (solo en modo remoto) -->
      <div v-if="isRemote">
        <div v-if="items && items.length > 0"
          class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100"
        >
          <table  class="table table-zebra">
            <thead>
              <tr class="align-middle">
                <th v-for="value in metadata" :key="value.field">{{ value.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" @click="handleClick(item)" class="cursor-pointer hover:bg-base-200">
                <td v-for="value in item" :key="value.id">{{value}}</td> 
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Refresh Button -->
        <div class="mt-6 flex justify-center">
          <button class="btn btn-outline" :disabled="loading" @click="fetchData">
            <span
              v-if="loading"
              class="loading loading-spinner loading-sm mr-2"
            ></span>
            {{ loading ? "Actualizando..." : "Actualizar Datos" }}
          </button>
        </div>
      </div>

    </div>

    <div>
      {{ selectedItem }}
    </div>

  </div>
</template>

<style scoped></style>