import { ref } from 'vue'

// Estado global
const notifications = ref([])
const globalStore = ref(new Map()) // Almacén global para compartir datos entre componentes

export function useAppStore() {

  // Notificaciones
  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    notifications.value.push({ id, message, type })
    
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }, 3000)
  }

  const setGlobalStore = (name, value) => {
    if (!name) return
    globalStore.value.set(name, value)

    console.log(`Global store updated: ${JSON.stringify(globalStore.value.get(name))}`)

  }

  const getGlobalStore = (name) => {
    if (!name) return
    return globalStore.value.get(name)
  }

  const clearGlobalStore = (name) => {
    if (!name) return
    globalStore.value.delete(name)
  }

  return {
    notifications,
    addNotification,
    setGlobalStore,
    getGlobalStore,
    clearGlobalStore
  }
}