import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createRegistration as apiCreateRegistration,
  cancelRegistration as apiCancelRegistration,
  getEventRegistrations,
  getParticipantRegistrations,
  getGlobalStats
} from '../services/registrationService.js'

/**
 * Store des inscriptions (registrationStore).
 *
 * Connecte au registrations-service via registrationService.js.
 * Aucune donnee de repli, aucune inscription optimiste : un echec
 * du backend reste un echec visible (EVENT_FULL, ALREADY_REGISTERED,
 * SERVICE_UNAVAILABLE, ...), jamais une inscription fantome cote
 * client. Voir AGENTS.md : refuser plutot que risquer le surbooking.
 *
 * Architecture : View -> Component -> Pinia Store -> Service API -> Axios
 */
export const useRegistrationStore = defineStore('registrations', () => {
  const registrations = ref([])
  const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const globalStats = ref(null)
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  const registrationCount = computed(() => registrations.value.length)
  const confirmedRegistrations = computed(() =>
    registrations.value.filter((registration) => registration.status === 'confirmee')
  )

  /**
   * Charge les inscriptions d'un participant (« mes inscriptions »),
   * enrichies avec les informations de l'evenement.
   */
  async function fetchMyRegistrations(participantId, { status, page = 1, limit = 20 } = {}) {
    resetStatus()
    loading.value = true
    try {
      const response = await getParticipantRegistrations(participantId, { status, page, limit, enrich: true })
      registrations.value = response.data || []
      pagination.value = response.pagination || pagination.value
    } catch (err) {
      error.value = err.message || 'Impossible de charger vos inscriptions.'
      registrations.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge la liste des inscrits a un evenement (cote organisateur).
   */
  async function fetchEventRegistrations(eventId, { status, page = 1, limit = 20 } = {}) {
    resetStatus()
    loading.value = true
    try {
      const response = await getEventRegistrations(eventId, { status, page, limit, enrich: true })
      registrations.value = response.data || []
      pagination.value = response.pagination || pagination.value
    } catch (err) {
      error.value = err.message || 'Impossible de charger les inscrits.'
      registrations.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Inscrit un participant a un evenement (POST /api/registrations).
   * L'erreur backend (EVENT_FULL, ALREADY_REGISTERED, ...) est
   * propagee telle quelle, jamais masquee par un succes local.
   */
  async function register(eventId, participantId) {
    resetStatus()
    loading.value = true
    try {
      const created = await apiCreateRegistration({ eventId, participantId })
      registrations.value = [created, ...registrations.value]
      success.value = 'Inscription enregistree avec succes.'
      return created
    } catch (err) {
      error.value = mapRegistrationError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Annule une inscription (DELETE /api/registrations/:id).
   */
  async function cancelRegistration(id) {
    resetStatus()
    loading.value = true
    try {
      const cancelled = await apiCancelRegistration(id)
      registrations.value = registrations.value.map((registration) =>
        registration.id === id ? cancelled : registration
      )
      success.value = 'Inscription annulee.'
      return cancelled
    } catch (err) {
      error.value = mapRegistrationError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge les statistiques globales pour le tableau de bord.
   */
  async function fetchGlobalStats() {
    resetStatus()
    loading.value = true
    try {
      globalStats.value = await getGlobalStats()
    } catch (err) {
      error.value = err.message || 'Impossible de charger les statistiques.'
      globalStats.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Traduit les codes d'erreur du backend en messages lisibles.
   */
  function mapRegistrationError(err) {
    const code = err?.cause?.response?.data?.error
    const messages = {
      EVENT_FULL: 'Cet evenement est complet.',
      ALREADY_REGISTERED: 'Vous etes deja inscrit a cet evenement.',
      ALREADY_CANCELLED: 'Cette inscription est deja annulee.',
      PARTICIPANT_NOT_FOUND: 'Profil participant introuvable.',
      EVENT_NOT_FOUND: 'Evenement introuvable.',
      SERVICE_UNAVAILABLE: 'Service momentanement indisponible, reessayez.'
    }
    return messages[code] || err.message || 'Une erreur est survenue.'
  }

  function resetStatus() {
    error.value = ''
    success.value = ''
  }

  return {
    registrations,
    pagination,
    globalStats,
    loading,
    error,
    success,
    registrationCount,
    confirmedRegistrations,
    fetchMyRegistrations,
    fetchEventRegistrations,
    register,
    cancelRegistration,
    fetchGlobalStats,
    resetStatus
  }
})
