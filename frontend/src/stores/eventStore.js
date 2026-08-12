import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  mapApiResponse
} from '../services/eventService'
import { MOCK_EVENTS } from '../assets/images/mockData.js'

/**
 * Store des événements (eventStore).
 *
 * Gère le catalogue d'événements : chargement de la liste, recherche
 * d'un événement par id, filtrage, et l'état standard
 * data / loading / error / success.
 *
 * Architecture : View → Component → Pinia Store → Service API → Axios
 *
 * Le store appelle désormais eventService.js (phase 5). Si l'API
 * backend est indisponible (réponse d'erreur réseau), il bascule
 * automatiquement sur les données mockées locales afin de préserver
 * la visualisation de l'interface — un commentaire dans chaque
 * fonction marque cet emplacement pour un branchement direct
 * à l'API sans fallback lorsque le backend est en ligne.
 */
export const useEventStore = defineStore('events', () => {
  // -------------------- État --------------------
  const events = ref([])        // Liste des événements (data)
  const currentEvent = ref(null) // Événement actuellement consulté
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  // -------------------- Getters --------------------
  const eventCount = computed(() => events.value.length)

  const categories = computed(() => [
    ...new Set(events.value.map((event) => event.category))
  ])

  const activeEvents = computed(() =>
    events.value.filter((event) => event.remainingSeats > 0)
  )

  // -------------------- Actions --------------------
  /**
   * Charge la liste des événements via GET /api/events.
   *
   * Appelle eventService.getEvents(). En cas d'erreur réseau
   * (backend non disponible), les données mockées locales sont
   * utilisées en repli — ce comportement peut être retiré une fois
   * le backend définitivement en ligne.
   */
  async function fetchEvents({ search = '', category = '', onlyFull = false } = {}) {
    resetStatus()
    loading.value = true

    try {
      let data = await loadEventsData()

      let filtered = [...data]

      if (search.trim()) {
        const query = search.toLowerCase()
        filtered = filtered.filter(
          (event) =>
            event.title.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query)
        )
      }

      if (category) {
        filtered = filtered.filter((event) => event.category === category)
      }

      if (onlyFull) {
        filtered = filtered.filter((event) => event.remainingSeats === 0)
      }

      events.value = filtered
      success.value = `${filtered.length} événement(s) chargé(s).`
    } catch (err) {
      error.value = err.message || 'Impossible de charger les événements.'
      events.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée un événement via POST /api/events.
   *
   * Le payload est converti au format exact du backend par
   * eventService (name, eventDate, venue, maxCapacity).
   */
  async function addEvent(payload) {
    resetStatus()
    loading.value = true

    try {
      const created = await createEvent(payload)
      events.value = [mapApiResponse(created), ...events.value]
      success.value = 'Événement créé avec succès.'
    } catch (err) {
      error.value = err.message || 'La création de l\'événement a échoué.'
    } finally {
      loading.value = false
    }
  }

  /**
   * Modifie un événement via PUT /api/events/:id.
   */
  async function editEvent(id, payload) {
    resetStatus()
    loading.value = true

    try {
      const updated = await updateEvent(id, payload)
      events.value = events.value.map((event) =>
        event.id === Number(id) ? mapApiResponse(updated) : event
      )
      if (currentEvent.value?.id === Number(id)) {
        currentEvent.value = mapApiResponse(updated)
      }
      success.value = 'Événement mis à jour avec succès.'
    } catch (err) {
      error.value = err.message || 'La modification de l\'événement a échoué.'
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime un événement via DELETE /api/events/:id.
   */
  async function removeEvent(id) {
    resetStatus()
    loading.value = true

    try {
      await deleteEvent(id)
      events.value = events.value.filter((event) => event.id !== Number(id))
      if (currentEvent.value?.id === Number(id)) {
        currentEvent.value = null
      }
      success.value = 'Événement supprimé avec succès.'
    } catch (err) {
      error.value = err.message || 'La suppression de l\'événement a échoué.'
    } finally {
      loading.value = false
    }
  }

  /**
   * Recherche un événement par son identifiant via
   * GET /api/events/:id.
   *
   * En cas d'erreur réseau, la recherche s'effectue sur le
   * catalogue local (repli de démonstration).
   */
  async function fetchEventById(id) {
    resetStatus()
    loading.value = true

    try {
      const data = await loadEventsData()
      const found = data.find((event) => event.id === Number(id))

      if (!found) {
        throw new Error(`Aucun événement ne correspond à l'identifiant ${id}.`)
      }

      currentEvent.value = found
      success.value = ''
    } catch (err) {
      error.value = err.message
      currentEvent.value = null
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
    currentEvent,
    loading,
    error,
    success,
    eventCount,
    categories,
    activeEvents,
    fetchEvents,
    fetchEventById,
    addEvent,
    editEvent,
    removeEvent,
    resetStatus
  }
})

/**
 * Charge les événements depuis l'API backend via eventService.
 *
 * Si l'appel échoue (backend non disponible), le catalogue
 * mocké local est utilisé en repli pour préserver la
 * démonstration de l'interface.
 */
async function loadEventsData() {
  try {
    const raw = await getEvents()
    const rawList = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.events)
        ? raw.events
        : Array.isArray(raw?.data)
          ? raw.data
          : []
    return rawList.map((event) => mapApiResponse(event))
  } catch (err) {
    // Repli de démonstration : backend indisponible.
    console.warn('API backend indisponible — utilisation des données locales.', err)
    return MOCK_EVENTS
  }
}
