import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

import './assets/styles/main.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

app.mount('#app')

/**
 * Restaure la session au démarrage : si un jeton JWT est présent
 * dans localStorage, l'état utilisateur est rechargé (jeton décodé
 * puis backend si disponible). La garde de routes (router/index.js)
 * s'appuie sur ce jeton pour protéger les routes nécessitant une
 * authentification.
 */
router.isReady().then(() => {
  const authStore = useAuthStore(pinia)
  authStore.hydrateFromToken()
})
