
<script setup>
import Navigation from "./components/Navigation.vue";
import { computed } from 'vue'
import SelectedBackend from './components/SelectedBackend.vue'
import { useAppStore } from './composables/useAppStore'

const { getGlobalStore } = useAppStore()
const selectedPrefix = computed(() => getGlobalStore('selectedBackend')?.prefix || 'desa')

</script>


<template>
  <header>

   <Navigation />
   <SelectedBackend :prefix="selectedPrefix" />
    
  </header>
  <main>
    
     <RouterView />
  </main>
  <footer class="fixed bottom-0 w-full p-4 text-center text-sm text-base-content/70">
    
    &copy; 2024 Dev Admin. All rights reserved.
  </footer> 
</template>
