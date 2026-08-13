import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createParticipant as apiCreateParticipant,
  getParticipants as apiGetParticipants,
  searchParticipants as apiSearchParticipants,
  getParticipantById as apiGetParticipantById,
  updateParticipant as apiUpdateParticipant,
  deleteParticipant as apiDeleteParticipant
} from '../services/participantService.js'

/**
 * Store des participants (participantStore).
 *
 * Connecte au participants-service via participantService.js.
 * Aucune donnee de repli : une erreur du backend reste une erreur.
 *
 * Architecture : View -> Component -> Pinia Store -> Service API -> Axios
 */
export const useParticipantStore = defineStore('participants', () => {
  const participants = ref([])
  const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const currentParticipant = ref(null)
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  const participantCount = computed(() => participants.value.length)

  /**
   * Charge une page de participants (authentifie), filtre optionnel
   * par type.
   */
  async function fetchParticipants({ page = 1, limit = 20, type = '' } = {}) {
    resetStatus()
    loading.value = true
    try {
      const response = await apiGetParticipants({ page, limit, type: type || undefined })
      participants.value = response.data || []
      pagination.value = response.pagination || pagination.value
    } catch (err) {
      error.value = err.message || 'Impossible de charger les participants.'
      participants.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Recherche un participant par email ou par nom.
   */
  async function searchParticipants({ email = '', name = '' } = {}) {
    resetStatus()
    loading.value = true
    try {
      participants.value = await apiSearchParticipants({
        email: email || undefined,
        name: name || undefined
      })
    } catch (err) {
      error.value = err.message || 'La recherche a echoue.'
      participants.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Recupere un participant par son identifiant.
   */
  async function fetchParticipantById(id) {
    resetStatus()
    loading.value = true
    try {
      currentParticipant.value = await apiGetParticipantById(id)
    } catch (err) {
      error.value = err.message || `Aucun participant ne correspond a l'identifiant ${id}.`
      currentParticipant.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Cree un profil participant (POST /api/participants, public).
   */
  async function createParticipant(payload) {
    resetStatus()
    loading.value = true
    try {
      const created = await apiCreateParticipant(payload)
      success.value = 'Profil participant cree avec succes.'
      return created
    } catch (err) {
      error.value = err.message || 'La creation du profil a echoue.'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Met a jour le profil participant courant.
   */
  async function updateParticipant(id, payload) {
    resetStatus()
    loading.value = true
    try {
      const updated = await apiUpdateParticipant(id, payload)
      if (currentParticipant.value?.id === Number(id)) {
        currentParticipant.value = updated
      }
      success.value = 'Profil mis a jour avec succes.'
      return updated
    } catch (err) {
      error.value = err.message || 'La mise a jour du profil a echoue.'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime un profil participant.
   */
  async function removeParticipant(id) {
    resetStatus()
    loading.value = true
    try {
      await apiDeleteParticipant(id)
      participants.value = participants.value.filter((p) => p.id !== Number(id))
      success.value = 'Participant supprime avec succes.'
    } catch (err) {
      error.value = err.message || 'La suppression a echoue.'
      throw err
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
    pagination,
    currentParticipant,
    loading,
    error,
    success,
    participantCount,
    fetchParticipants,
    searchParticipants,
    fetchParticipantById,
    createParticipant,
    updateParticipant,
    removeParticipant,
    resetStatus
  }
})
