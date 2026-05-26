<script setup>
import { ref, computed } from "vue";
import { useApiCall } from "../composables/useApiCall.js";
import { getBaseUrl } from "../config/api.js";
import { useAppStore } from "../composables/useAppStore.js";

const props = defineProps({
  prefix: { type: String, required: false, default: 'desa' }
});

const { setGlobalStore, getGlobalStore } = useAppStore();

// Detectar modo local o remoto
const isLocal = computed(() => {
  const config = getGlobalStore("apiConfig");
  return config?.useLocalUrl || false;
});

const isRemote = computed(() => !isLocal.value);

// URL base reactiva
const baseUrl = computed(() => getBaseUrl());

// Usar useApiCall para control manual
const { call, loading, error } = useApiCall();
const backends = ref([]);
const hasAttemptedLoad = ref(false);

// Cargar backends manualmente
async function loadBackends() {
  console.log('loadBackends llamado, isLocal:', isLocal.value, 'baseUrl:', baseUrl.value);
  
  if (isLocal.value) {
    console.log('Modo local - no se cargan backends');
    return; // No cargar en modo local
  }
  
  // No recargar si ya se está cargando o ya se cargó
  if (loading.value || (hasAttemptedLoad.value && backends.value.length > 0)) {
    console.log('Ya cargando o ya cargado');
    return;
  }
  
  hasAttemptedLoad.value = true;
  
  try {
    console.log('Intentando cargar backends desde:', `${baseUrl.value}/api/backends`);
    const result = await call(`${baseUrl.value}/api/backends`, { method: 'GET' });
    console.log('Backends response:', result);
    
    if (result?.backends) {
      backends.value = result.backends.map((x) => ({
        id: x.key,
        name: x.data.name,
        url: x.data.url,
        prefix: x.data.prefix,
      }));
      console.log('Backends procesados:', backends.value);
    } else {
      console.log('No se encontraron backends en la respuesta');
    }
  } catch (err) {
    console.error('Error cargando backends:', err);
  }
}

// Backend seleccionado actualmente
const selectedBackend = computed(() => getGlobalStore('selectedBackend'));

// Texto a mostrar
const displayText = computed(() => {
  if (isLocal.value) {
    return 'Local';
  }
  return selectedBackend.value?.name || selectedBackend.value?.prefix || props.prefix || 'desa';
});

// Cambiar backend seleccionado
function selectBackend(backend) {
  setGlobalStore('selectedBackend', backend);
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50">
    <!-- Modo Local: Solo mostrar badge -->
    <div v-if="isLocal" class="bg-base-100 shadow-lg px-4 py-2 rounded-lg border border-base-300">
      <span class="text-sm font-semibold text-base-content/70">Ambiente: </span>
      <span class="badge badge-warning badge-lg">Local</span>
    </div>

    <!-- Modo Producción: Selector de backend -->
    <div v-else class="dropdown dropdown-top dropdown-end">
      <button 
        tabindex="0" 
        class="btn btn-sm gap-2 bg-base-100 shadow-lg border-base-300"
        @click="loadBackends"
        @focus="loadBackends"
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
            d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
          />
        </svg>
        <span class="text-xs">Ambiente:</span>
        <span class="badge badge-success badge-sm">{{ displayText }}</span>
      </button>

      <div
        tabindex="0"
        class="dropdown-content z-50 card card-compact shadow-xl bg-base-100 rounded-box w-80 p-4 mb-2"
      >
        <div class="space-y-3">
          <h3 class="font-bold text-sm">Seleccionar Backend</h3>

          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center py-4">
            <span class="loading loading-spinner loading-md"></span>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="alert alert-error alert-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xs">Error al cargar backends</span>
          </div>

          <!-- Lista de backends -->
          <ul v-else-if="backends.length > 0" class="menu menu-compact bg-base-200 rounded-box">
            <li 
              v-for="backend in backends" 
              :key="backend.id"
              :class="{ 'bordered': selectedBackend?.id === backend.id }"
            >
              <a 
                @click="selectBackend(backend)"
                class="text-xs"
                :class="{ 'active': selectedBackend?.id === backend.id }"
              >
                <div class="flex flex-col items-start">
                  <span class="font-semibold">{{ backend.name }}</span>
                  <span class="text-xs opacity-60">{{ backend.prefix }}</span>
                </div>
                <span v-if="selectedBackend?.id === backend.id" class="badge badge-success badge-xs">✓</span>
              </a>
            </li>
          </ul>

          <!-- Empty state -->
          <div v-else class="text-center py-4 text-sm text-base-content/60">
            {{ hasAttemptedLoad ? 'No hay backends disponibles' : 'Haz clic para cargar backends' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
