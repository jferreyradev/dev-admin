<script setup>
import { computed, onMounted } from "vue";
import { useAppStore } from "../composables/useAppStore.js";
import { DEFAULT_BASE_URL, DEFAULT_LOCAL_URL, getBaseUrl } from "../config/api.js";

const { getGlobalStore, setGlobalStore } = useAppStore();

// Estado actual: ¿está en modo local?
const isLocal = computed(() => {
  const config = getGlobalStore("apiConfig");
  return config?.useLocalUrl || false;
});

// URL actual calculada
const currentUrl = computed(() => getBaseUrl());

// Modo actual en texto
const currentMode = computed(() => isLocal.value ? 'Local' : 'Producción');

// Toggle entre local y producción
function toggleMode() {
  const currentConfig = getGlobalStore("apiConfig") || {};
  const newConfig = {
    useLocalUrl: !currentConfig.useLocalUrl,
    productionUrl: currentConfig.productionUrl || DEFAULT_BASE_URL,
    localUrl: currentConfig.localUrl || DEFAULT_LOCAL_URL,
  };

  setGlobalStore("apiConfig", newConfig);
  
  console.log(`Cambiando a modo: ${newConfig.useLocalUrl ? 'Local' : 'Producción'}`);
  console.log("Nueva URL activa:", newConfig.useLocalUrl ? newConfig.localUrl : newConfig.productionUrl);
}
</script>

<template>
  <div>
    <!-- Botón en la barra de navegación -->
    <div class="dropdown dropdown-end">
      <button tabindex="0" class="btn btn-ghost btn-sm gap-2">
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
        API
        <span class="badge badge-sm" :class="isLocal ? 'badge-warning' : 'badge-success'">
          {{ currentMode }}
        </span>
      </button>
      <div
        tabindex="0"
        class="dropdown-content z-50 card card-compact shadow-lg bg-base-100 rounded-box w-80 p-4"
      >
        <div class="space-y-4">
          <!-- Modo actual -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold">Modo</span>
            <div class="badge badge-lg" :class="isLocal ? 'badge-warning' : 'badge-success'">
              {{ currentMode }}
            </div>
          </div>

          <!-- URL actual -->
          <div>
            <div class="text-xs text-base-content/60 mb-1">URL Actual</div>
            <div class="text-xs font-mono bg-base-200 p-2 rounded break-all">
              {{ currentUrl }}
            </div>
          </div>

          <div class="divider my-2"></div>

          <!-- Toggle entre modos -->
          <button
            class="btn btn-primary btn-block btn-sm"
            @click="toggleMode"
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
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
            Cambiar a {{ isLocal ? 'Producción' : 'Local' }}
          </button>

          <!-- Info adicional -->
          <div class="text-xs text-base-content/50 text-center">
            {{ isLocal ? `Local: ${DEFAULT_LOCAL_URL}` : `Producción: ${DEFAULT_BASE_URL}` }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
