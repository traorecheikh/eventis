import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getRegistrations as apiGetRegistrations,
  createRegistration as apiCreateRegistration,
  cancelRegistration as apiCancelRegistration
} from '../services/registrationService.js'

/**
 * Store des inscriptions (registrationStore).
 *
 * Connecté au registrations-service via registrationService.js.
 * Si le backend n'est pas disponible (token absent, service
 * indisponible), les données mockées locales servent de repli.
 *
 * Architecture : View → Component → Pinia Store → Service API → Axios
 */
export const useRegistrationStore = defineStore('registrations', () => {
  // -------------------- État --------------------
  const registrations = ref([]) // Liste des inscriptions (data)
  const localRegistrations = ref([]) // Inscriptions créées en local (avant API)
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  // -------------------- Getters --------------------
  const registrationCount = computed(() => registrations.value.length)

  const confirmedRegistrations = computed(() =>
    registrations.value.filter((registration) => registration.status === 'Confirmée')
  )

  // -------------------- Actions --------------------
  /**
   * Charge la liste des inscriptions de l'utilisateur connecté
   * (GET /api/registrations, Bearer JWT). Si le backend n'est pas
   * disponible, les données mockées servent de repli.
   */
  async function fetchRegistrations() {
    resetStatus()
    loading.value = true

    try {
      const fromApi = await apiGetRegistrations()
      registrations.value = normalizeRegistrations(fromApi)
      success.value = `${registrations.value.length} inscription(s) chargée(s).`
    } catch {
      // Backend indisponible ou non authentifié : repli local.
      const mocked = await loadRegistrationsMock()
      registrations.value = mergeRegistrations(mocked)
      success.value = `${registrations.value.length} inscription(s) chargée(s) (données locales).`
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée une inscription à un événement (POST /api/registrations).
   * Si l'appel API échoue (non authentifié, backend indisponible),
   * l'inscription est conservée en local et sera reprise au prochain
   * chargement.
   */
  async function createRegistration(payload) {
    resetStatus()
    loading.value = true

    try {
      if (!payload?.eventId) {
        throw new Error('L\'identifiant de l\'événement est requis.')
      }
      if (!(payload?.fullName || '').trim()) {
        throw new Error('Le nom et le prénom sont obligatoires.')
      }
      if (!payload?.email?.includes('@')) {
        throw new Error('L\'adresse e-mail est invalide.')
      }

      const created = await apiCreateRegistration({
        // Format exact attendu par le registrations-service
        // (POST /api/registrations) : eventId + participant imbriqué.
        eventId: Number(payload.eventId),
        participant: {
          fullName: (payload.fullName || '').trim(),
          email: (payload.email || '').trim(),
          phone: (payload.phone || '').trim(),
          dietaryRequirements: (payload.dietary || '').trim()
        }
      })

      const newRegistration = {
        id: created?.id ?? Date.now(),
        eventId: Number(payload.eventId),
        eventTitle: payload.eventTitle || created?.eventTitle || 'Événement',
        eventDate: payload.eventDate || created?.eventDate || '',
        firstName: payload.fullName
          ? payload.fullName.split(' ')[0]
          : '',
        lastName: payload.fullName
          ? payload.fullName.split(' ').slice(1).join(' ')
          : '',
        email: (payload.email || '').trim(),
        dietaryRequirements: (payload.dietary || '').trim(),
        comments: payload.comments?.trim() || '',
        status: 'Confirmée',
        registeredAt: 'aujourd\'hui'
      }

      // L'inscription est confirmée côté serveur : elle sera rechargée
      // par le prochain fetch API. Le registre local n'est utilisé que
      // en mode dégradé (backend indisponible).
      registrations.value = [newRegistration, ...registrations.value]
      success.value = 'Inscription enregistrée avec succès.'
    } catch (err) {
      error.value = err.message || 'L\'inscription a échoué.'
      // Mode dégradé : conserver l'inscription en local afin qu'elle
      // réapparaisse au prochain chargement.
      localRegistrations.value = [
        {
          id: Date.now(),
          eventId: Number(payload.eventId),
          eventTitle: payload.eventTitle || 'Événement',
          eventDate: payload.eventDate || '',
          firstName: payload.fullName ? payload.fullName.split(' ')[0] : '',
          lastName: payload.fullName
            ? payload.fullName.split(' ').slice(1).join(' ')
            : '',
          email: (payload.email || '').trim(),
          dietaryRequirements: (payload.dietary || '').trim(),
          comments: payload.comments?.trim() || '',
          status: 'Confirmée',
          registeredAt: 'aujourd\'hui'
        },
        ...localRegistrations.value
      ]
    } finally {
      loading.value = false
    }
  }

  /**
   * Annule une inscription existante (DELETE /api/registrations/:id).
   * Si l'appel API échoue, l'inscription est simplement marquée
   * « Annulée » localement.
   */
  async function cancelRegistration(id) {
    resetStatus()
    loading.value = true

    try {
      const index = registrations.value.findIndex(
        (registration) => registration.id === id
      )

      if (index === -1) {
        throw new Error('Inscription introuvable.')
      }

      // Suppression côté backend ; si elle échoue (non authentifié,
      // service indisponible), la suite se déroule en local.
      try {
        await apiCancelRegistration(id)
      } catch {
        // Continuer en mode local.
      }

      registrations.value = registrations.value.map((registration, i) =>
        i === index ? { ...registration, status: 'Annulée' } : registration
      )
      success.value = 'Inscription annulée.'
    } catch (err) {
      error.value = err.message || 'L\'annulation a échoué.'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fusionne le catalogue mocké avec les inscriptions créées
   * localement (sans doublons sur eventId).
   */
  function mergeRegistrations(mocked) {
    const localIds = new Set(
      localRegistrations.value.map((registration) => registration.eventId)
    )
    const fromMock = mocked.filter(
      (registration) => !localIds.has(registration.eventId)
    )
    return [...localRegistrations.value, ...fromMock]
  }

  /**
   * Normalise les inscriptions retournées par l'API vers le format
   * interne (libellés de statut français, champs attendus par les
   * composants). Les noms exacts seront ajustés avec la documentation
   * Swagger/OpenAPI du registrations-service.
   */
  function normalizeRegistrations(list) {
    const statusMap = {
      confirmed: 'Confirmée',
      pending: 'En attente',
      cancelled: 'Annulée',
      Confirmed: 'Confirmée',
      'En attente': 'En attente',
      Cancelled: 'Annulée'
    }
    return (list || []).map((registration) => ({
      id: registration.id,
      eventId: registration.eventId ?? registration.event_id,
      eventTitle: registration.eventTitle ?? registration.event_title ?? registration.eventName ?? 'Événement',
      eventDate: registration.eventDate ?? registration.event_date ?? '',
      firstName: registration.participant?.fullName ?? registration.fullName ?? registration.firstName ?? '',
      lastName: registration.participant?.lastName ?? registration.lastName ?? '',
      email: registration.participant?.email ?? registration.email ?? '',
      dietary: registration.participant?.dietaryRequirements ?? registration.dietaryRequirements ?? '',
      comments: registration.comments ?? '',
      status: statusMap[registration.status] ?? registration.status ?? 'En attente',
      registeredAt: registration.registeredAt ?? 'aujourd\'hui',
      // Mois de l'événement (ISO) : utilisé pour le graphique
      // « Inscriptions par mois » du tableau de bord. La date
      // d'inscription de l'API est un libellé localisé
      // (« 1er août 2026 »), inexploitable par le graphique.
      monthLabel: monthLabelFromIso(registration.eventDate)
    }))
  }

  /**
   * Convertit une date ISO (AAAA-MM-JJ) en libellé de mois
   * localisé en français (ex. « septembre 2026 »).
   */
  function monthLabelFromIso(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return ''
    const date = new Date(`${iso}T00:00:00Z`)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    })
  }

  function resetStatus() {
    error.value = ''
    success.value = ''
  }

  return {
    registrations,
    localRegistrations,
    loading,
    error,
    success,
    registrationCount,
    confirmedRegistrations,
    fetchRegistrations,
    createRegistration,
    cancelRegistration,
    resetStatus
  }
})

/**
 * Source de données temporaire (mock).
 *
 * À la phase 5, cette fonction sera remplacée par un appel au
 * service API (getMyRegistrations) basé sur Axios.
 */
async function loadRegistrationsMock() {
  const { MOCK_REGISTRATIONS } = await import('../assets/images/mockData.js')
  // Normalisation des statuts du catalogue mocké vers les libellés
  // français utilisés par le reste de l'application.
  const statusMap = {
    confirmed: 'Confirmée',
    pending: 'En attente',
    cancelled: 'Annulée'
  }
  return MOCK_REGISTRATIONS.map((registration) => ({
    ...registration,
    status: statusMap[registration.status] ?? registration.status
  }))
}
