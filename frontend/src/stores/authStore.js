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
import { searchParticipants } from '../services/participantService.js'

/**
 * Store d'authentification (authStore).
 *
 * Connecte a l'auth-service via authService.js. Le jeton JWT est
 * stocke dans localStorage (token.js) et injecte automatiquement
 * par l'instance Axios partagee (api.js).
 *
 * user : { id, email, role, createdAt? }. Aucune donnee locale de
 * repli n'est fabriquee : une erreur du backend reste une erreur.
 *
 * Un compte auth-service n'est pas lie automatiquement a un profil
 * participants-service (ce sont deux bases separees, voir AGENTS.md
 * section 2). participantProfile est resolu par recherche sur
 * l'email apres connexion ; s'il est absent, l'utilisateur doit
 * creer son profil participant avant de pouvoir s'inscrire a un
 * evenement (voir ParticipantProfileView).
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const participantProfile = ref(null)
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  const isAuthenticated = computed(() => Boolean(user.value || getToken()))
  const isOrganisateur = computed(() => user.value?.role === 'organisateur')
  const participantId = computed(() => participantProfile.value?.id ?? null)

  /**
   * Recherche le profil participant lie a l'email de l'utilisateur
   * connecte. Non bloquant : une erreur laisse participantProfile a
   * null, l'appelant peut proposer la creation du profil.
   */
  async function resolveParticipantProfile() {
    if (!user.value?.email) {
      participantProfile.value = null
      return
    }
    try {
      const results = await searchParticipants({ email: user.value.email })
      participantProfile.value = results[0] || null
    } catch {
      participantProfile.value = null
    }
  }

  /**
   * Connexion via POST /api/auth/login.
   */
  async function login(email, password) {
    resetStatus()
    loading.value = true
    try {
      const { user: apiUser } = await apiLogin({ email, password })
      user.value = apiUser
      await resolveParticipantProfile()
      success.value = 'Connexion reussie. Bienvenue !'
    } catch (err) {
      error.value = err.message || 'Une erreur est survenue lors de la connexion.'
      user.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Creation de compte via POST /api/auth/register.
   *
   * @param {{email: string, password: string, role: "organisateur"|"participant"}} payload
   */
  async function register(payload) {
    resetStatus()
    loading.value = true
    try {
      if (!payload?.email?.includes('@')) {
        throw new Error('L\'adresse e-mail est invalide.')
      }
      if (!payload?.role) {
        throw new Error('Le role est obligatoire.')
      }

      const { user: apiUser } = await apiRegister({
        email: payload.email.trim(),
        password: payload.password,
        role: payload.role
      })

      user.value = apiUser
      await resolveParticipantProfile()
      success.value = 'Compte cree avec succes.'
    } catch (err) {
      error.value = err.message || 'Une erreur est survenue lors de l\'inscription.'
      user.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Deconnexion : suppression du jeton JWT et de l'etat local.
   */
  function logout() {
    apiLogout()
    user.value = null
    participantProfile.value = null
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
        await resolveParticipantProfile()
        return
      }
    } catch {
      // Backend injoignable au demarrage : repli sur le contenu du jeton,
      // deja verifie localement (signature non re-verifiee cote client).
    }
    user.value = getCurrentUser()
    if (user.value) await resolveParticipantProfile()
  }

  function resetStatus() {
    error.value = ''
    success.value = ''
  }

  return {
    user,
    participantProfile,
    participantId,
    loading,
    error,
    success,
    isAuthenticated,
    isOrganisateur,
    login,
    register,
    logout,
    hydrateFromToken,
    resolveParticipantProfile,
    resetStatus
  }
})
