<script setup>
const props = defineProps({
  prefix: { type: String, required: true }
})
</script>

<template>
  <div class="text-right bottom-4 right-4 bg-base-200 shadow px-4 py-2 rounded text-sm z-50">
    <span class="font-semibold">Ambiente: </span>
    <button class="btn btn-xs btn-info" @click="console.log('Backend seleccionado:', prefix)">
       {{ prefix }}
    </button>
     
  </div>
</template>
