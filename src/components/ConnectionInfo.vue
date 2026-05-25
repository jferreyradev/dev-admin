<script setup>
import { computed } from 'vue'
const props = defineProps({
  prefix: { type: String, required: true },
  endpoint: { type: String, required: true },
  baseUrl: { type: String, required: true }
})

const fullUrl = computed(() => `${props.baseUrl}/${props.prefix}/query`)
</script>

<template>
  <div class="card bg-base-200 shadow p-4 mb-4">
    <div class="font-bold text-lg mb-2">Conexión seleccionada</div>
    <div><span class="font-semibold">Prefijo:</span> {{ prefix }}</div>
    <div><span class="font-semibold">Base URL:</span> {{ baseUrl }}</div>
    <div><span class="font-semibold">Endpoint de consulta:</span> {{ fullUrl }}</div>
  </div>
</template>