import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getEvents,
  getEventById,
  getEventAvailability,
  createEvent
} from '../services/eventService'

/**
 * Store des evenements (eventStore).
 *
 * Gere le catalogue d'evenements : chargement pagine, consultation
 * d'un evenement et de sa disponibilite en temps reel, creation.
 * Aucune donnee de repli : une erreur du backend reste une erreur
 * visible (voir AGENTS.md, jamais de valeur optimiste).
 *
 * Architecture : View -> Component -> Pinia Store -> Service API -> Axios
 */
export const useEventStore = defineStore('events', () => {
  const events = ref([])
  const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const currentEvent = ref(null)
  const currentAvailability = ref(null)
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  const eventCount = computed(() => events.value.length)

  /**
   * Charge une page d'evenements via GET /api/events. Le filtrage
   * texte (titre/lieu) s'effectue localement sur la page chargee,
   * l'API ne propose pas de recherche plein texte.
   */
  async function fetchEvents({ page = 1, limit = 20, search = '' } = {}) {
    resetStatus()
    loading.value = true
    try {
      const response = await getEvents({ page, limit })
      let list = response.data || []
      if (search.trim()) {
        const query = search.trim().toLowerCase()
        list = list.filter(
          (event) =>
            event.title?.toLowerCase().includes(query) ||
            event.location?.toLowerCase().includes(query)
        )
      }
      events.value = list
      pagination.value = response.pagination || pagination.value
    } catch (err) {
      error.value = err.message || 'Impossible de charger les evenements.'
      events.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Recupere un evenement et sa disponibilite en temps reel.
   */
  async function fetchEventById(id) {
    resetStatus()
    loading.value = true
    try {
      const [event, availability] = await Promise.all([
        getEventById(id),
        getEventAvailability(id).catch(() => null)
      ])
      currentEvent.value = event
      currentAvailability.value = availability
    } catch (err) {
      error.value = err.message || `Aucun evenement ne correspond a l'identifiant ${id}.`
      currentEvent.value = null
      currentAvailability.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Rafraichit uniquement la disponibilite de l'evenement courant
   * (apres une inscription ou une annulation par exemple).
   */
  async function refreshAvailability(id) {
    try {
      currentAvailability.value = await getEventAvailability(id)
    } catch {
      // Non bloquant : la vue garde la derniere valeur connue.
    }
  }

  /**
   * Cree un evenement via POST /api/events (authentifie).
   */
  async function addEvent(payload) {
    resetStatus()
    loading.value = true
    try {
      const created = await createEvent(payload)
      events.value = [created, ...events.value]
      success.value = 'Evenement cree avec succes.'
      return created
    } catch (err) {
      error.value = err.message || 'La creation de l\'evenement a echoue.'
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
    events,
    pagination,
    currentEvent,
    currentAvailability,
    loading,
    error,
    success,
    eventCount,
    fetchEvents,
    fetchEventById,
    refreshAvailability,
    addEvent,
    resetStatus
  }
})
