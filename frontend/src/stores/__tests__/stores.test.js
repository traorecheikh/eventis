import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEventStore } from '../eventStore'
import { useRegistrationStore } from '../registrationStore'
import { useAuthStore } from '../authStore'
import { useParticipantStore } from '../participantStore'

/**
 * Tests des stores Pinia.
 *
 * Les modules de service sont mockés directement (vi.mock sur chaque
 * service) afin que les stores appellent des fonctions simulées.
 * L'état loading / error / success et les mutations de liste sont
 * vérifiés. Les codes HTTP 400/401/403/404/409/422/500 sont simulés
 * via des erreurs Error munies de la propriété `status`.
 */

const mockEvent = {
  id: 1,
  name: 'Conférence IA',
  eventDate: '2026-09-15',
  venue: 'Dakar',
  maxCapacity: 100,
  currentParticipants: 20,
  category: 'Technologie'
}

const mockRegistration = {
  id: 101,
  eventId: 1,
  eventTitle: 'Conférence IA',
  eventDate: '2026-09-15',
  participant: { fullName: 'Awa Diop', email: 'awa@b.c' },
  status: 'confirmed',
  registeredAt: 'aujourd\'hui'
}

vi.mock('../../services/eventService', () => ({
  getEvents: vi.fn(),
  getEventById: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  mapApiResponse: (event) => ({
    id: event?.id,
    title: event?.name ?? '',
    date: event?.eventDate ?? '',
    location: event?.venue ?? '',
    category: event?.category ?? 'Général',
    maxParticipants: event?.maxCapacity ?? 0,
    currentParticipants: event?.currentParticipants ?? 0,
    remainingSeats: (event?.maxCapacity ?? 0) - (event?.currentParticipants ?? 0),
    organizer: event?.organizer ?? '',
    status: event?.status ?? 'published',
    time: event?.time ?? '',
    description: event?.description ?? ''
  })
}))

vi.mock('../../services/registrationService', () => ({
  getRegistrations: vi.fn(),
  createRegistration: vi.fn(),
  cancelRegistration: vi.fn()
}))

vi.mock('../../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  fetchCurrentUser: vi.fn(),
  getCurrentUser: vi.fn()
}))

vi.mock('../../services/participantService', () => ({
  getParticipants: vi.fn(),
  getParticipantById: vi.fn()
}))

vi.mock('../../assets/images/mockData.js', () => ({
  MOCK_EVENTS: [
    {
      id: 99,
      title: 'Événement local',
      date: '1er janvier 2027',
      location: 'Thiès',
      category: 'Atelier',
      maxParticipants: 50,
      currentParticipants: 10,
      remainingSeats: 40,
      status: 'published'
    }
  ],
  MOCK_REGISTRATIONS: [
    {
      id: 901,
      eventId: 99,
      eventTitle: 'Événement local',
      eventDate: '2027-01-01',
      fullName: 'Moussa Ba',
      email: 'moussa@b.c',
      status: 'confirmed'
    }
  ],
  MOCK_PARTICIPANTS: [
    { id: 10, firstName: 'Fatou', lastName: 'Ndiaye', email: 'fatou@b.c', role: 'Participant' }
  ]
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  window.localStorage.clear()
})

/** Crée un JWT valide (exp dans le futur) pour les tests d'hydratation. */
function makeValidJwt(payload) {
  const b64 = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ ...payload, exp: Math.floor(Date.now() / 1000) + 3600 })}.${b64('s')}`
}

import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from '../../services/eventService'
import {
  getRegistrations,
  createRegistration,
  cancelRegistration
} from '../../services/registrationService'
import { login, register, fetchCurrentUser } from '../../services/authService'
import { getParticipants, getParticipantById } from '../../services/participantService'

describe('eventStore', () => {
  it('fetchEvents charge la liste, active loading puis success', async () => {
    getEvents.mockResolvedValueOnce([mockEvent])
    const store = useEventStore()
    const promise = store.fetchEvents()
    expect(store.loading).toBe(true)
    await promise
    expect(store.loading).toBe(false)
    expect(store.events).toHaveLength(1)
    expect(store.events[0].title).toBe('Conférence IA')
    expect(store.success).toContain('chargé(s)')
  })

  it('fetchEvents bascule en repli local si l\'API échoue (réseau)', async () => {
    getEvents.mockRejectedValueOnce(new Error('Network Error'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const store = useEventStore()
    await store.fetchEvents()
    expect(store.events.length).toBeGreaterThan(0)
    expect(store.events[0].title).toBe('Événement local')
    // Le store charge le catalogue mocké en repli sans bloquer l'interface.
    expect(store.success).toContain('chargé(s)')
    expect(warnSpy).toHaveBeenCalledOnce()
    warnSpy.mockRestore()
  })

  it('fetchEvents applique la recherche textuelle (titre ou lieu)', async () => {
    getEvents.mockResolvedValueOnce([
      mockEvent,
      { ...mockEvent, id: 2, name: 'Atelier UX', venue: 'Paris', currentParticipants: 0 }
    ])
    const store = useEventStore()
    await store.fetchEvents({ search: 'Paris' })
    expect(store.events).toHaveLength(1)
    expect(store.events[0].title).toBe('Atelier UX')
  })

  it('fetchEvents filtre par catégorie et événements complets', async () => {
    getEvents.mockResolvedValueOnce([mockEvent])
    const store = useEventStore()
    await store.fetchEvents({ category: 'Technologie' })
    expect(store.events).toHaveLength(1)
    await store.fetchEvents({ category: 'Design' })
    expect(store.events).toHaveLength(0)
    await store.fetchEvents({ onlyFull: true })
    expect(store.events).toHaveLength(0) // remainingSeats = 80
  })

  it('addEvent ajoute l\'événement à la liste (payload déjà au format backend)', async () => {
    createEvent.mockResolvedValueOnce({
      id: 10,
      name: 'Nouveau',
      eventDate: '2026-12-01',
      venue: 'Ziguinchor',
      maxCapacity: 30,
      currentParticipants: 0
    })
    const store = useEventStore()
    await store.addEvent({
      name: 'Nouveau',
      eventDate: '2026-12-01',
      venue: 'Ziguinchor',
      maxCapacity: 30
    })
    expect(store.events[0].title).toBe('Nouveau')
    expect(store.events[0].remainingSeats).toBe(30)
    expect(store.success).toBe('Événement créé avec succès.')
    expect(createEvent).toHaveBeenCalledWith({
      name: 'Nouveau',
      eventDate: '2026-12-01',
      venue: 'Ziguinchor',
      maxCapacity: 30
    })
  })

  it('addEvent capture l\'erreur de l\'API (ex. 422, 409, 500)', async () => {
    const err = Object.assign(new Error('Nom déjà utilisé (409)'), { status: 409 })
    createEvent.mockRejectedValueOnce(err)
    const store = useEventStore()
    await store.addEvent({ name: 'Doublon' })
    expect(store.error).toContain('409')
    expect(store.loading).toBe(false)
    expect(store.events).toHaveLength(0)
  })

  it('editEvent met à jour l\'élément de la liste et currentEvent', async () => {
    updateEvent.mockResolvedValueOnce({
      ...mockEvent,
      name: 'Conférence IA — édition',
      maxCapacity: 150
    })
    const store = useEventStore()
    store.events = [{ ...mockEvent, id: 1, title: 'Conférence IA' }]
    store.currentEvent = { ...mockEvent, id: 1, title: 'Conférence IA' }
    await store.editEvent(1, { name: 'Conférence IA — édition', maxCapacity: 150 })
    expect(store.events[0].title).toBe('Conférence IA — édition')
    expect(store.events[0].maxParticipants).toBe(150)
    expect(store.currentEvent.title).toBe('Conférence IA — édition')
    expect(store.success).toBe('Événement mis à jour avec succès.')
  })

  it('removeEvent retire l\'événement de la liste et vide currentEvent', async () => {
    deleteEvent.mockResolvedValueOnce({})
    const store = useEventStore()
    store.events = [{ ...mockEvent, id: 4, title: 'À supprimer' }]
    store.currentEvent = { id: 4 }
    await store.removeEvent(4)
    expect(store.events).toHaveLength(0)
    expect(store.currentEvent).toBeNull()
    expect(store.success).toBe('Événement supprimé avec succès.')
  })

  it('removeEvent capture l\'erreur (403, 404)', async () => {
    deleteEvent.mockRejectedValueOnce(
      Object.assign(new Error('Accès refusé (403)'), { status: 403 })
    )
    const store = useEventStore()
    store.events = [{ ...mockEvent, id: 4 }]
    await store.removeEvent(4)
    expect(store.events).toHaveLength(1) // la liste n'est pas modifiée
    expect(store.error).toContain('403')
  })

  it('fetchEventById charge l\'événement courant ou signale l\'absence', async () => {
    getEvents.mockResolvedValueOnce([mockEvent])
    const store = useEventStore()
    await store.fetchEventById(1)
    expect(store.currentEvent).not.toBeNull()
    expect(store.currentEvent.id).toBe(1)
    await store.fetchEventById(999)
    expect(store.currentEvent).toBeNull()
    expect(store.error).toContain('999')
  })

  it('les getters reflètent l\'état de la liste', async () => {
    getEvents.mockResolvedValueOnce([
      mockEvent,
      { ...mockEvent, id: 2, currentParticipants: 100 },
      { ...mockEvent, id: 3, category: 'Design' }
    ])
    const store = useEventStore()
    await store.fetchEvents()
    expect(store.eventCount).toBe(3)
    expect(store.categories).toEqual(expect.arrayContaining(['Technologie', 'Design']))
    expect(store.activeEvents.length).toBe(2) // un événement est plein
  })
})

describe('registrationStore', () => {
  it('fetchRegistrations charge depuis l\'API avec statuts normalisés', async () => {
    getRegistrations.mockResolvedValueOnce([mockRegistration])
    const store = useRegistrationStore()
    await store.fetchRegistrations()
    expect(store.registrations).toHaveLength(1)
    expect(store.registrations[0].status).toBe('Confirmée')
    expect(store.registrations[0].firstName).toBe('Awa Diop')
    expect(store.registrations[0].monthLabel).toBe('septembre 2026')
    expect(store.confirmedRegistrations).toHaveLength(1)
  })

  it('fetchRegistrations bascule en repli local (mock + local)', async () => {
    getRegistrations.mockRejectedValueOnce(new Error('Network'))
    const store = useRegistrationStore()
    await store.fetchRegistrations()
    expect(store.registrations.length).toBeGreaterThan(0)
    expect(store.success).toContain('données locales')
  })

  it('createRegistration valide eventId, nom et e-mail avant envoi', async () => {
    const store = useRegistrationStore()
    await store.createRegistration({ eventId: null, fullName: 'Awa', email: 'a@b.c' })
    expect(store.error).toContain('événement est requis')

    await store.createRegistration({ eventId: 1, fullName: '', email: 'a@b.c' })
    expect(store.error).toContain('nom et le prénom')

    await store.createRegistration({ eventId: 1, fullName: 'Awa Diop', email: 'invalide' })
    expect(store.error).toContain('e-mail est invalide')

    expect(createRegistration).not.toHaveBeenCalled()
  })

  it('createRegistration envoie le payload exact eventId + participant', async () => {
    createRegistration.mockResolvedValueOnce({
      id: 200,
      eventTitle: 'Conférence IA'
    })
    const store = useRegistrationStore()
    await store.createRegistration({
      eventId: 3,
      fullName: 'Awa Diop',
      email: 'awa@b.c',
      phone: '+221770000000',
      dietary: 'Végétarien',
      comments: 'Test',
      eventTitle: 'Conférence IA',
      eventDate: '2026-09-15'
    })
    expect(createRegistration).toHaveBeenCalledWith({
      eventId: 3,
      participant: {
        fullName: 'Awa Diop',
        email: 'awa@b.c',
        phone: '+221770000000',
        dietaryRequirements: 'Végétarien'
      }
    })
    expect(store.registrations[0].status).toBe('Confirmée')
    expect(store.success).toBe('Inscription enregistrée avec succès.')
  })

  it('createRegistration conserve l\'inscription en local en mode dégradé (erreur 500)', async () => {
    createRegistration.mockRejectedValueOnce(new Error('500'))
    const store = useRegistrationStore()
    await store.createRegistration({
      eventId: 3,
      fullName: 'Awa Diop',
      email: 'awa@b.c',
      eventTitle: 'Conférence IA'
    })
    // Comportement observable : l'erreur 500 est capturée, le loading
    // retombe et la liste reste intacte (aucun effet de bord). Le
    // registre local interne (non exposé par le setup store Pinia)
    // conserve l'inscription pour le prochain chargement.
    expect(store.error).toBe('500')
    expect(store.loading).toBe(false)
    expect(store.registrations).toHaveLength(0)
    const localState = store.$state.localRegistrations || []
    expect(localState.length).toBeGreaterThan(0)
    expect(localState[0].eventId).toBe(3)
    expect(localState[0].firstName).toBe('Awa')
    expect(localState[0].lastName).toBe('Diop')
  })

  it('cancelRegistration annule et marque le statut « Annulée »', async () => {
    getRegistrations.mockResolvedValueOnce([mockRegistration])
    cancelRegistration.mockResolvedValueOnce()
    const store = useRegistrationStore()
    await store.fetchRegistrations()
    await store.cancelRegistration(101)
    expect(store.registrations[0].status).toBe('Annulée')
    expect(store.success).toBe('Inscription annulée.')
  })

  it('cancelRegistration échoue si l\'inscription est introuvable', async () => {
    cancelRegistration.mockResolvedValueOnce()
    const store = useRegistrationStore()
    await store.cancelRegistration(999)
    expect(store.error).toBe('Inscription introuvable.')
    expect(cancelRegistration).not.toHaveBeenCalled()
  })

  it('cancelRegistration fonctionne en local même si l\'API échoue (401/500)', async () => {
    getRegistrations.mockResolvedValueOnce([mockRegistration])
    cancelRegistration.mockRejectedValueOnce(
      Object.assign(new Error('401'), { status: 401 })
    )
    const store = useRegistrationStore()
    await store.fetchRegistrations()
    await store.cancelRegistration(101)
    // L'annulation se poursuit en local.
    expect(store.registrations[0].status).toBe('Annulée')
    expect(store.success).toBe('Inscription annulée.')
  })

  it('mergeRegistrations fusionne sans doublons sur eventId', async () => {
    getRegistrations.mockRejectedValueOnce(new Error('Network'))
    const store = useRegistrationStore()
    store.$state.localRegistrations = [
      { id: 500, eventId: 99, eventTitle: 'Local', firstName: 'A', lastName: 'B', email: 'a@b.c', status: 'Confirmée', registeredAt: 'aujourd\'hui' }
    ]
    await store.fetchRegistrations()
    // L'événement 99 ne doit apparaître qu'une seule fois (version locale).
    expect(store.registrations.filter((r) => r.eventId === 99)).toHaveLength(1)
  })
})

describe('authStore', () => {
  it('login réussit et définit l\'utilisateur', async () => {
    login.mockResolvedValueOnce({
      token: 'jwt',
      user: { id: 1, email: 'a@b.c', role: 'Participant' }
    })
    const store = useAuthStore()
    await store.login('a@b.c', 'secret')
    expect(store.user.email).toBe('a@b.c')
    expect(store.success).toBe('Connexion réussie. Bienvenue !')
    expect(store.loading).toBe(false)
  })

  it('login capture l\'erreur et vide l\'utilisateur', async () => {
    login.mockRejectedValueOnce(
      Object.assign(new Error('Identifiants incorrects (400)'), { status: 400 })
    )
    const store = useAuthStore()
    store.user = { id: 1 }
    await store.login('a@b.c', 'wrong')
    expect(store.user).toBeNull()
    expect(store.error).toContain('400')
  })

  it('register valide firstName, lastName et e-mail', async () => {
    const store = useAuthStore()
    await store.register({ firstName: '', lastName: 'Diop', email: 'a@b.c', password: 'secret' })
    expect(store.error).toContain('nom et le prénom')
    await store.register({ firstName: 'Awa', lastName: 'Diop', email: 'sans-arobase', password: 'secret' })
    expect(store.error).toContain('e-mail est invalide')
    expect(register).not.toHaveBeenCalled()
  })

  it('register réussit et définit l\'utilisateur', async () => {
    register.mockResolvedValueOnce({ token: 'jwt' })
    const store = useAuthStore()
    await store.register({ firstName: 'Awa', lastName: 'Diop', email: 'awa@b.c', password: 'secret' })
    expect(store.user.firstName).toBe('Awa')
    expect(store.success).toBe('Compte créé avec succès.')
  })

  it('logout vide l\'utilisateur et le statut', async () => {
    const store = useAuthStore()
    store.user = { id: 1 }
    store.success = 'ok'
    await store.logout()
    expect(store.user).toBeNull()
    expect(store.success).toBe('')
  })

  it('hydrateFromToken restaure l\'utilisateur depuis l\'API', async () => {
    fetchCurrentUser.mockResolvedValueOnce({ id: 1, role: 'Admin' })
    // Un jeton valide (exp dans le futur) pour que getToken() ne le rejette
    // pas : la garde de store.hydrateFromToken exige un jeton présent.
    const { saveToken } = await import('../../services/token')
    const token = makeValidJwt({ id: 1 })
    saveToken(token)
    const store = useAuthStore()
    await store.hydrateFromToken()
    expect(store.user.role).toBe('Admin')
    expect(fetchCurrentUser).toHaveBeenCalled()
  })

  it('isAuthenticated dépend de user ou du jeton', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    store.user = { id: 1 }
    expect(store.isAuthenticated).toBe(true)
    store.user = null
    expect(store.isAuthenticated).toBe(false)
  })
})

describe('participantStore', () => {
  it('fetchParticipants charge la liste avec recherche locale', async () => {
    getParticipants.mockResolvedValueOnce([
      { id: 1, firstName: 'Awa', lastName: 'Diop', email: 'awa@b.c' },
      { id: 2, firstName: 'Moussa', lastName: 'Ba', email: 'moussa@b.c' }
    ])
    const store = useParticipantStore()
    await store.fetchParticipants({ search: 'Moussa' })
    expect(store.participants).toHaveLength(1)
    expect(store.participants[0].lastName).toBe('Ba')
  })

  it('fetchParticipantById charge un participant via l\'API', async () => {
    getParticipantById.mockResolvedValueOnce({
      id: 1,
      firstName: 'Awa',
      lastName: 'Diop'
    })
    const store = useParticipantStore()
    await store.fetchParticipantById(1)
    expect(store.currentParticipant.lastName).toBe('Diop')
  })

  it('fetchParticipantById bascule en repli local si l\'API échoue', async () => {
    getParticipantById.mockRejectedValueOnce(new Error('Network'))
    const store = useParticipantStore()
    await store.fetchParticipants()
    const first = store.participants[0]
    await store.fetchParticipantById(first.id)
    expect(store.currentParticipant).not.toBeNull()
  })
})
