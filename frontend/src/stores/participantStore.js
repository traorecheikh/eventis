import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getParticipants as apiGetParticipants,
  getParticipantById as apiGetParticipantById
} from '../services/participantService.js'

/**
 * Store des participants (participantStore).
 *
 * Connecté au participants-service via participantService.js.
 * Si le backend n'est pas disponible, les données mockées
 * locales sont utilisées en repli (fallback).
 *
 * Architecture : View → Component → Pinia Store → Service API → Axios
 */
export const useParticipantStore = defineStore('participants', () => {
  // -------------------- État --------------------
  const participants = ref([])    // Liste des participants (data)
  const currentParticipant = ref(null) // Participant actuellement consulté
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  // -------------------- Getters --------------------
  const participantCount = computed(() => participants.value.length)

  // -------------------- Actions --------------------
  /**
   * Charge la liste des participants via l'API
   * (GET /api/participants), avec repli sur les données mockées.
   *
   * L'API ne propose pas de paramètre de recherche côté serveur :
   * le filtrage est effectué localement (option `search`).
   */
  async function fetchParticipants({ search = '' } = {}) {
    resetStatus()
    loading.value = true

    try {
      let data = await apiGetParticipants()
      if (search.trim()) {
        const query = search.toLowerCase()
        data = data.filter(
          (participant) =>
            `${participant.firstName} ${participant.lastName}`
              .toLowerCase()
              .includes(query) ||
            (participant.email || '')
              .toLowerCase()
              .includes(query) ||
            (participant.role || '')
              .toLowerCase()
              .includes(query)
        )
      }
      participants.value = data
      success.value = `${participants.value.length} participant(s) chargé(s).`
    } catch {
      // Backend indisponible : repli sur les données mockées.
      participants.value = await loadParticipantsMock()
      success.value = `${participants.value.length} participant(s) chargé(s) (données locales).`
    } finally {
      loading.value = false
    }
  }

  /**
   * Recherche un participant par son identifiant
   * (GET /api/participants/:id), avec repli sur les données mockées.
   */
  async function fetchParticipantById(id) {
    resetStatus()
    loading.value = true

    try {
      currentParticipant.value = await apiGetParticipantById(id)
    } catch {
      // Repli local.
      const data = await loadParticipantsMock()
      const found = data.find((participant) => participant.id === Number(id))

      if (!found) {
        error.value = `Aucun participant ne correspond à l'identifiant ${id}.`
        currentParticipant.value = null
        return
      }

      currentParticipant.value = found
    } finally {
      loading.value = false
    }
  }

  function resetStatus() {
    error.value = ''
    success.value = ''
  }

  return {
    participants,
    currentParticipant,
    loading,
    error,
    success,
    participantCount,
    fetchParticipants,
    fetchParticipantById,
    resetStatus
  }
})

/**
 * Note d'architecture (participants-service).
 *
 * L'API participants expose uniquement la consultation
 * (GET /api/participants, GET /api/participants/:id).
 * La création et la modification de participants ne sont PAS
 * disponibles côté backend : aucune fonctionnalité d'édition
 * ne doit être implémentée sans un endpoint confirmé par la
 * documentation Swagger/OpenAPI officielle.
 */

/**
 * Source de données temporaire (mock) utilisée en repli lorsque
 * le backend participants-service n'est pas disponible.
 */
async function loadParticipantsMock() {
  const { MOCK_PARTICIPANTS } = await import('../assets/images/mockData.js')
  return MOCK_PARTICIPANTS
}
