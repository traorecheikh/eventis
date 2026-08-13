import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

import './style.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(MotionPlugin)

/**
 * Restaure la session avant le montage : si un jeton JWT est present
 * dans localStorage, l'etat utilisateur (et le profil participant
 * lie, voir authStore.resolveParticipantProfile) est recharge avant
 * qu'aucune vue ne s'affiche. Sans cette attente, une navigation
 * directe (rechargement de page) vers une route authentifiee peut
 * monter avant la fin de l'hydratation et lire un participantId nul
 * a tort.
 */
const authStore = useAuthStore(pinia)
await authStore.hydrateFromToken()

router.isReady().then(() => app.mount('#app'))
