import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  fetchCurrentUser,
  getCurrentUser
} from '../services/authService.js'
import { getToken } from '../services/token.js'

/**
 * Store d'authentification (authStore).
 *
 * Connecté à l'auth-service via authService.js. Le jeton JWT
 * est stocké dans localStorage (token.js) et injecté
 * automatiquement par l'instance Axios partagée (api.js).
 *
 * Architecture : View → Component → Pinia Store → Service API → Axios
 */
export const useAuthStore = defineStore('auth', () => {
  // -------------------- État --------------------
  const user = ref(null)      // { id, firstName, lastName, email, role }
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  const isAuthenticated = computed(() => Boolean(user.value || getToken()))

  // -------------------- Actions --------------------
  /**
   * Connexion via l'API (POST /api/auth/login).
   *
   * Les endpoints exacts seront ajustés lorsque la documentation
   * Swagger/OpenAPI officielle sera fournie.
   */
  async function login(email, password) {
    resetStatus()
    loading.value = true

    try {
      const { user: apiUser } = await apiLogin({ email, password })

      user.value = apiUser || {
        id: 1,
        firstName: email.split('@')[0],
        lastName: '',
        email,
        role: 'Participant'
      }
      success.value = 'Connexion réussie. Bienvenue !'
    } catch (err) {
      error.value = err.message || 'Une erreur est survenue lors de la connexion.'
      user.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Création de compte via l'API (POST /api/auth/register).
   */
  async function register(payload) {
    resetStatus()
    loading.value = true

    try {
      if (!payload?.firstName?.trim() || !payload?.lastName?.trim()) {
        throw new Error('Le nom et le prénom sont obligatoires.')
      }
      if (!payload?.email?.includes('@')) {
        throw new Error('L\'adresse e-mail est invalide.')
      }

      const { user: apiUser } = await apiRegister({
        name: `${payload.firstName.trim()} ${payload.lastName.trim()}`,
        email: payload.email.trim(),
        password: payload.password
      })

      user.value = apiUser || {
        id: Date.now(),
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim(),
        role: 'Participant'
      }
      success.value = 'Compte créé avec succès.'
    } catch (err) {
      error.value = err.message || 'Une erreur est survenue lors de l\'inscription.'
      user.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Déconnexion : suppression du jeton JWT et de l'état local.
   */
  async function logout() {
    await apiLogout()
    user.value = null
    resetStatus()
  }

  /**
   * Restaure l'utilisateur courant depuis le jeton JWT au
   * chargement de l'application.
   */
  async function hydrateFromToken() {
    if (!getToken()) return
    try {
      const remoteUser = await fetchCurrentUser()
      if (remoteUser) {
        user.value = remoteUser
        return
      }
    } catch {
      // Le backend n'est pas encore disponible.
    }
    const localUser = getCurrentUser()
    if (localUser) user.value = localUser
  }

  function resetStatus() {
    error.value = ''
    success.value = ''
  }

  return {
    user,
    loading,
    error,
    success,
    isAuthenticated,
    login,
    register,
    logout,
    hydrateFromToken,
    resetStatus
  }
})
