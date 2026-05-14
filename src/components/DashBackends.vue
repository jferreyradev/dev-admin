<script setup>

import { ref, onMounted, computed } from "vue";
import { useFetch } from "../composables/useFetch.js";
import { BASE_URL, PROXY_TOKEN } from "../config/api.js";
import { useAppStore } from "../composables/useAppStore.js";

const { data, error, loading, fetchData } = useFetch(`${BASE_URL}/api/backends`, {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${PROXY_TOKEN}` },
  cacheMode: 'manual'
})

const { setGlobalStore, getGlobalStore } = useAppStore();

const selectedItem = ref(null);


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
        <h2 class="text-2xl font-bold mb-2">Panel de Administración</h2>
        <p class="text-md text-base-content/70">
          Gestiona y controla tus backends desde aquí
        </p>
      </div>

      <!-- Data Table -->

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

    <div>
      {{ selectedItem }}
    </div>

  </div>
</template>

<style scoped></style>