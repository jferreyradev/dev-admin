<script setup>
import { computed } from "vue";
import { useAppStore } from "../composables/useAppStore.js";

const { getGlobalStore } = useAppStore();

const selectedName = computed(() => getGlobalStore("selectedBackend")?.name)


</script>

<template>
  <div class="status status-info animate-bounce"></div> {{ selectedName }}
</template>
